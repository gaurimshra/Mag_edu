"""
Student learning API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from typing import Any


from app.core.database import get_db
from app.core.security import get_current_user, require_student
from app.models.user import User
from app.models.student import (
    StudentProfile, MasteryScore, LearningSession, QuizAttempt, MistakePattern, PaceLevel
)
from app.models.gamification import Skill
from app.schemas.student import (
    StartSessionRequest, SubmitAnswerRequest, RecommendRequest,
    StudentDashboardOut, LessonOut, AnswerResultOut, MasteryScoreOut
)
from app.services.bkt import bkt_update, gap_type, difficulty_for, choose_next_skill, update_pace
from app.services.gamification import check_and_award_badges, update_streak
from app.services.agent.graph import run_agent
from app.services.agent.memory import fetch_student_memory
from app.services.rag.retrieve import retrieve_chunks
router = APIRouter(prefix="/api/student", tags=["student"])


@router.get("/dashboard", response_model=StudentDashboardOut)
async def get_dashboard(
    user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch Profile
    stmt = select(StudentProfile).where(StudentProfile.user_id == user.id)
    profile = (await db.execute(stmt)).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 2. Fetch Mastery Scores
    stmt_mastery = select(MasteryScore).where(MasteryScore.student_id == user.id)
    mastery_records = (await db.execute(stmt_mastery)).scalars().all()
    
    mastery_map = {m.skill_id: m.score for m in mastery_records}
    
    mastery_out = [
        MasteryScoreOut(
            skill_id=m.skill_id,
            score=m.score,
            attempts=m.attempts,
            correct=m.correct,
            gap_type=gap_type(m.score)
        )
        for m in mastery_records
    ]

    # 3. Determine next skill
    stmt_skills = select(Skill)
    all_skills = [
        {"id": s.id, "name": s.name, "prerequisites": s.prerequisites} 
        for s in (await db.execute(stmt_skills)).scalars().all()
    ]
    
    next_skill_id = choose_next_skill(mastery_map, all_skills) if all_skills else "none"
    next_skill_name = next((s["name"] for s in all_skills if s["id"] == next_skill_id), "N/A")

    # Risk calculation is done on the teacher side, we just send a default or calculate it here
    
    from app.models.gamification import StudentBadge
    badges_stmt = select(func.count()).select_from(StudentBadge).where(StudentBadge.student_id == user.id)
    badges_earned = (await db.execute(badges_stmt)).scalar() or 0
    
    return StudentDashboardOut(
        student_id=profile.user_id,
        name=user.name,
        grade=profile.grade,
        xp=profile.xp,
        streak=profile.streak,
        pace=profile.pace.value,
        pace_score=profile.pace_score,
        mastery=mastery_out,
        badges_earned=badges_earned,
        risk_level="clear",
        risk_reason="Doing well",
        next_skill_id=next_skill_id,
        next_skill_name=next_skill_name
    )


@router.post("/learn", response_model=LessonOut)
async def start_lesson(
    payload: StartSessionRequest,
    user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    # 1. Start Session
    session = LearningSession(
        student_id=user.id,
        skill_id=payload.skill_id,
        mode=payload.mode
    )
    db.add(session)
    await db.flush()

    # 2. Get Mastery & Difficulty
    stmt = select(MasteryScore).where(
        MasteryScore.student_id == user.id,
        MasteryScore.skill_id == payload.skill_id
    )
    mastery_record = (await db.execute(stmt)).scalar_one_or_none()
    mastery_score = mastery_record.score if mastery_record else 0.5
    difficulty = difficulty_for(mastery_score)

    # 3. Get Skill Name
    stmt_skill = select(Skill).where(Skill.id == payload.skill_id)
    skill = (await db.execute(stmt_skill)).scalar_one_or_none()
    skill_name = skill.name if skill else payload.skill_id

    # 4. Retrieve RAG Context
    profile = (await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))).scalar_one()
    chunks = await retrieve_chunks(db, payload.skill_id, skill_name, difficulty, grade=profile.grade)
    
    rag_context = [
        {"id": c.id, "title": c.topic or c.chapter_title, "body": c.body, "difficulty": c.difficulty}
        for c in chunks
    ]
    sources = [c.topic or c.chapter_title for c in chunks]

    # 5. Fetch Memory
    memory = await fetch_student_memory(db, user.id, payload.skill_id)

    # 6. Run Agent
    state_input = {
        "student_id": user.id,
        "skill_id": payload.skill_id,
        "skill_name": skill_name,
        "mode": payload.mode,
        "grade": profile.grade,
        "mastery_score": mastery_score,
        "difficulty_level": difficulty,
        "mistake_patterns": memory["mistake_patterns"],
        "recent_sessions": memory["recent_sessions"],
        "rag_context": rag_context,
        "steps": []
    }
    
    final_state = await run_agent(state_input)
    
    await db.commit()

    return LessonOut(
        skill_id=payload.skill_id,
        skill_name=skill_name,
        mode=payload.mode,
        difficulty=difficulty,
        mastery=mastery_score,
        content=final_state["generated_content"],
        sources=sources,
        session_id=session.id
    )

@router.post("/answer", response_model=AnswerResultOut)
async def submit_answer(
    payload: SubmitAnswerRequest,
    user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    # Fetch profile and mastery
    profile = (await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))).scalar_one()
    
    stmt = select(MasteryScore).where(
        MasteryScore.student_id == user.id,
        MasteryScore.skill_id == payload.skill_id
    )
    mastery_record = (await db.execute(stmt)).scalar_one_or_none()
    
    if not mastery_record:
        mastery_record = MasteryScore(student_id=user.id, skill_id=payload.skill_id, score=0.5)
        db.add(mastery_record)
        
    old_mastery = mastery_record.score
    
    # 1. Update BKT Mastery
    new_mastery = bkt_update(old_mastery, payload.is_correct)
    mastery_record.score = new_mastery
    mastery_record.attempts += 1
    if payload.is_correct:
        mastery_record.correct += 1

    # 2. Update Profile & Pace
    if payload.is_correct:
        profile.correct_streak += 1
        profile.wrong_streak = 0
    else:
        profile.correct_streak = 0
        profile.wrong_streak += 1

    new_score, pace_label = update_pace(
        profile.pace_score,
        payload.is_correct,
        payload.response_ms,
        payload.hesitation_count,
        profile.correct_streak
    )
    profile.pace_score = new_score
    profile.pace = PaceLevel(pace_label)
    
    update_streak(profile)

    # 3. Record Quiz Attempt
    attempt = QuizAttempt(
        student_id=user.id,
        session_id=payload.session_id,
        question_id=payload.question_id,
        skill_id=payload.skill_id,
        student_answer=payload.student_answer,
        correct_answer=payload.correct_answer,
        is_correct=payload.is_correct,
        response_ms=payload.response_ms,
        hesitation_count=payload.hesitation_count,
        mastery_before=old_mastery,
        mastery_after=new_mastery
    )
    db.add(attempt)

    # 4. Gamification (Badges & XP)
    xp_gained = 10 if payload.is_correct else 0
    if xp_gained:
        profile.xp += xp_gained
        
    badges = []
    if payload.is_correct:
        badges = await check_and_award_badges(db, profile, "streak")
        
    # Generate intelligent feedback using agent
    from app.services.agent.llm import generate_json
    from pydantic import BaseModel
    
    class FeedbackResponse(BaseModel):
        feedback: str
        
    system_prompt = f"You are a supportive tutor. The student's answer was '{payload.student_answer}'. The correct answer is '{payload.correct_answer}'. Maintain a concise, encouraging tone (1-2 sentences). If incorrect, provide a gentle hint."
    user_prompt = "Provide feedback on my answer."
    
    try:
        llm_resp = await generate_json(system_prompt, user_prompt, FeedbackResponse, temperature=0.7)
        feedback = llm_resp.feedback
    except Exception as e:
        print(f"Agent feedback generation failed: {e}")
        feedback = "Great job!" if payload.is_correct else f"Not quite. The correct answer was {payload.correct_answer}."

    await db.commit()

    return AnswerResultOut(
        is_correct=payload.is_correct,
        correct_answer=payload.correct_answer,
        mastery_before=old_mastery,
        mastery_after=new_mastery,
        xp_gained=xp_gained,
        badges_unlocked=badges,
        feedback=feedback
    )


@router.get("/progress", response_model=dict)
async def get_progress(
    user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    """Return comprehensive learning progress statistics for a student."""
    profile = (await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    mastery_records = (await db.execute(
        select(MasteryScore).where(MasteryScore.student_id == user.id)
    )).scalars().all()

    attempts = (await db.execute(
        select(QuizAttempt).where(QuizAttempt.student_id == user.id)
    )).scalars().all()

    sessions = (await db.execute(
        select(LearningSession).where(LearningSession.student_id == user.id)
    )).scalars().all()

    skills = {s.id: s.name for s in (await db.execute(select(Skill))).scalars().all()}

    total_questions = len(attempts)
    correct = sum(1 for a in attempts if a.is_correct)
    accuracy = correct / total_questions if total_questions else 0
    avg_ms = sum(a.response_ms for a in attempts) / total_questions if total_questions else 0

    mastery_by_skill = [
        {
            "skill_id": m.skill_id,
            "skill_name": skills.get(m.skill_id, m.skill_id),
            "score": m.score,
            "attempts": m.attempts,
            "correct": m.correct,
            "gap_type": gap_type(m.score),
        }
        for m in mastery_records
    ]

    # Recent sessions summary
    recent = []
    for s in sorted(sessions, key=lambda x: x.started_at or datetime.min, reverse=True)[:10]:
        session_attempts = [a for a in attempts if a.session_id == s.id]
        session_correct = sum(1 for a in session_attempts if a.is_correct)
        recent.append({
            "skill_id": s.skill_id,
            "skill_name": skills.get(s.skill_id, s.skill_id),
            "date": s.started_at.isoformat() if s.started_at else "",
            "questions": len(session_attempts),
            "accuracy": session_correct / len(session_attempts) if session_attempts else 0,
            "mode": s.mode,
        })

    return {
        "total_sessions": len(sessions),
        "total_questions": total_questions,
        "accuracy": accuracy,
        "avg_response_ms": avg_ms,
        "streak": profile.streak,
        "xp": profile.xp,
        "mastery_by_skill": mastery_by_skill,
        "recent_activity": recent,
        "mistake_categories": {},
    }


# ── Static diagnostic questions (Science only for MVP) ──
DIAGNOSTIC_QUESTIONS = [
    {"id": "diag_sci_01", "skill_id": "science.c10.ch01", "subject": "Science", "topic": "Chemical Reactions", "question": "Which of the following is a chemical change?", "options": ["Melting of ice", "Dissolution of sugar in water", "Rusting of iron", "Tearing of paper"], "correct_index": 2, "difficulty": "easy"},
    {"id": "diag_sci_02", "skill_id": "science.c10.ch01", "subject": "Science", "topic": "Chemical Equations", "question": "In the equation: 2H₂ + O₂ → 2H₂O, what type of reaction is this?", "options": ["Decomposition", "Combination", "Displacement", "Double displacement"], "correct_index": 1, "difficulty": "easy"},
    {"id": "diag_sci_03", "skill_id": "science.c10.ch02", "subject": "Science", "topic": "Acids and Bases", "question": "Which of the following has a pH greater than 7?", "options": ["Lemon juice", "Vinegar", "Baking soda solution", "Hydrochloric acid"], "correct_index": 2, "difficulty": "easy"},
    {"id": "diag_sci_04", "skill_id": "science.c10.ch02", "subject": "Science", "topic": "pH Scale", "question": "A solution turns red litmus blue. The solution is:", "options": ["Acidic", "Basic", "Neutral", "Cannot be determined"], "correct_index": 1, "difficulty": "easy"},
    {"id": "diag_sci_05", "skill_id": "science.c10.ch03", "subject": "Science", "topic": "Metals", "question": "Which metal is most reactive in the following list?", "options": ["Copper", "Silver", "Gold", "Potassium"], "correct_index": 3, "difficulty": "medium"},
    {"id": "diag_sci_06", "skill_id": "science.c10.ch03", "subject": "Science", "topic": "Reactivity Series", "question": "Iron displaces copper from copper sulphate solution because:", "options": ["Iron is less reactive", "Iron is more reactive than copper", "They have same reactivity", "Copper is more reactive"], "correct_index": 1, "difficulty": "medium"},
    {"id": "diag_sci_07", "skill_id": "science.c10.ch09", "subject": "Science", "topic": "Light and Reflection", "question": "The angle of incidence equals the angle of reflection. This is the law of:", "options": ["Refraction", "Dispersion", "Reflection", "Diffraction"], "correct_index": 2, "difficulty": "easy"},
    {"id": "diag_sci_08", "skill_id": "science.c10.ch09", "subject": "Science", "topic": "Lenses", "question": "A concave lens always forms an image that is:", "options": ["Real and enlarged", "Virtual and diminished", "Real and diminished", "Virtual and enlarged"], "correct_index": 1, "difficulty": "medium"},
    {"id": "diag_sci_09", "skill_id": "science.c10.ch06", "subject": "Science", "topic": "Life Processes", "question": "Which organelle is called the 'powerhouse of the cell'?", "options": ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], "correct_index": 2, "difficulty": "easy"},
    {"id": "diag_sci_10", "skill_id": "science.c10.ch06", "subject": "Science", "topic": "Respiration", "question": "The process by which food is broken down without oxygen is called:", "options": ["Aerobic respiration", "Anaerobic respiration", "Photosynthesis", "Transpiration"], "correct_index": 1, "difficulty": "easy"},
    {"id": "diag_sci_11", "skill_id": "science.c10.ch07", "subject": "Science", "topic": "Nervous System", "question": "The basic functional unit of the nervous system is:", "options": ["Axon", "Dendrite", "Neuron", "Synapse"], "correct_index": 2, "difficulty": "easy"},
    {"id": "diag_sci_12", "skill_id": "science.c10.ch04", "subject": "Science", "topic": "Carbon Compounds", "question": "The general formula for alkanes is:", "options": ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"], "correct_index": 1, "difficulty": "medium"},
    {"id": "diag_sci_13", "skill_id": "science.c10.ch08", "subject": "Science", "topic": "Reproduction", "question": "Binary fission is a type of:", "options": ["Sexual reproduction", "Vegetative reproduction", "Asexual reproduction", "Fragmentation"], "correct_index": 2, "difficulty": "easy"},
    {"id": "diag_sci_14", "skill_id": "science.c10.ch10", "subject": "Science", "topic": "Human Eye", "question": "A person who is short-sighted (myopic) should use:", "options": ["Convex lens", "Plane mirror", "Concave lens", "Convex mirror"], "correct_index": 2, "difficulty": "medium"},
    {"id": "diag_sci_15", "skill_id": "science.c10.ch09", "subject": "Science", "topic": "Refraction", "question": "The speed of light in vacuum is approximately:", "options": ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], "correct_index": 1, "difficulty": "easy"},
]


@router.get("/diagnostic/questions", response_model=list)
async def get_diagnostic_questions(user: User = Depends(require_student)):
    """Return the diagnostic assessment questions."""
    return DIAGNOSTIC_QUESTIONS


@router.post("/diagnostic/submit", response_model=dict)
async def submit_diagnostic(
    payload: dict,
    user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    """Process diagnostic answers and seed initial mastery scores."""
    answers: dict = payload.get("answers", {})
    skill_map: dict[str, dict] = {}

    for q in DIAGNOSTIC_QUESTIONS:
        sid = q["skill_id"]
        if sid not in skill_map:
            skill_map[sid] = {"correct": 0, "total": 0}
        skill_map[sid]["total"] += 1
        if answers.get(q["id"]) == q["correct_index"]:
            skill_map[sid]["correct"] += 1

    strong, weak = [], []

    for skill_id, data in skill_map.items():
        mastery = data["correct"] / data["total"] if data["total"] else 0.5
        
        # Upsert mastery score
        existing = (await db.execute(
            select(MasteryScore).where(MasteryScore.student_id == user.id, MasteryScore.skill_id == skill_id)
        )).scalar_one_or_none()

        if existing:
            existing.score = mastery
        else:
            db.add(MasteryScore(
                student_id=user.id,
                skill_id=skill_id,
                score=mastery,
                attempts=data["total"],
                correct=data["correct"]
            ))

        if mastery >= 0.7:
            strong.append(skill_id)
        elif mastery < 0.5:
            weak.append(skill_id)

    await db.commit()

    return {
        "mastery_by_skill": {sid: (v["correct"] / v["total"] if v["total"] else 0.5) for sid, v in skill_map.items()},
        "strong_areas": strong,
        "weak_areas": weak,
        "recommended_start": weak[0] if weak else (strong[-1] if strong else "science.c10.ch01"),
    }

from app.schemas.student import ChapterQuizRequest, ChapterQuizSubmitRequest, QuizAnalysisResponse

@router.post("/chapter_quiz/generate")
async def generate_chapter_quiz(
    payload: ChapterQuizRequest,
    user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    profile = (await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))).scalar_one()
    skill_name = payload.skill_id
    
    # Retrieve RAG Context (pass difficulty medium to get broad coverage)
    chunks = await retrieve_chunks(db, payload.skill_id, skill_name, "medium", grade=profile.grade)
    rag_context = [
        {"id": c.id, "title": c.topic or c.chapter_title, "body": c.body, "difficulty": c.difficulty}
        for c in chunks
    ]
    
    memory = await fetch_student_memory(db, user.id, payload.skill_id)
    
    state_input = {
        "student_id": user.id,
        "skill_id": payload.skill_id,
        "skill_name": skill_name,
        "mode": "chapter_quiz",
        "grade": profile.grade,
        "mastery_score": 0.5,
        "difficulty_level": "medium",
        "mistake_patterns": memory["mistake_patterns"],
        "recent_sessions": memory["recent_sessions"],
        "rag_context": rag_context,
        "steps": []
    }
    
    final_state = await run_agent(state_input)
    
    return final_state["generated_content"]

@router.post("/chapter_quiz/submit", response_model=QuizAnalysisResponse)
async def submit_chapter_quiz(
    payload: ChapterQuizSubmitRequest,
    user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    profile = (await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))).scalar_one()
    skill_name = payload.skill_id
    
    state_input = {
        "student_id": user.id,
        "skill_id": payload.skill_id,
        "skill_name": skill_name,
        "mode": "analyze_quiz",
        "grade": profile.grade,
        "mastery_score": 0.5,
        "difficulty_level": "medium",
        "mistake_patterns": [],
        "recent_sessions": [],
        "rag_context": [],
        "quiz_data": {
            "answers": payload.answers,
            "questions": payload.questions
        },
        "steps": []
    }
    
    final_state = await run_agent(state_input)
    
    return final_state["generated_content"]


@router.get("/learning-dna")
async def get_learning_dna(user: User = Depends(require_student), db: AsyncSession = Depends(get_db)):
    profile = (await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))).scalar_one()
    
    attempts = (await db.execute(select(QuizAttempt).where(QuizAttempt.student_id == user.id))).scalars().all()
    correct = sum(1 for a in attempts if a.is_correct)
    accuracy = (correct / len(attempts) * 100) if attempts else 50
    confidence = (sum(a.confidence_level or 50 for a in attempts) / len(attempts)) if attempts else 50
    retention = profile.pace_score  # Mock using pace score
    
    dna_data = [
        {"subject": 'Knowledge Mastery', "A": profile.xp % 100, "fullMark": 100}, # Mock using xp
        {"subject": 'Confidence', "A": int(confidence), "fullMark": 100},
        {"subject": 'Pace & Speed', "A": int(profile.pace_score), "fullMark": 100},
        {"subject": 'Accuracy', "A": int(accuracy), "fullMark": 100},
        {"subject": 'Retention', "A": int(retention), "fullMark": 100},
    ]
    
    from app.models.student import StudentMisconception
    misconceptions = (await db.execute(
        select(StudentMisconception).where(StudentMisconception.student_id == user.id)
    )).scalars().all()
    
    graph_data = []
    if misconceptions:
        for m in misconceptions:
            graph_data.append({
                "skill_id": m.skill_id,
                "misconception_id": m.misconception_id,
                "confidence": m.confidence
            })
    else:
        # Fallback if none exist
        graph_data.append({
            "skill_id": "ch01.chemical_reactions",
            "misconception_id": "None detected yet. Keep practicing!",
            "confidence": 0
        })

    return {
        "dna_data": dna_data,
        "misconceptions": graph_data
    }


from app.models.assignment import Assignment
from app.models.classroom import ClassroomMember, Classroom

@router.get("/assignments")
async def get_student_assignments(user: User = Depends(require_student), db: AsyncSession = Depends(get_db)):
    members = (await db.execute(select(ClassroomMember).where(ClassroomMember.student_id == user.id))).scalars().all()
    classroom_ids = [m.classroom_id for m in members]
    if not classroom_ids:
        return []
        
    stmt = select(Assignment, Classroom.name).join(Classroom, Classroom.id == Assignment.classroom_id).where(Assignment.classroom_id.in_(classroom_ids))
    records = (await db.execute(stmt)).all()
    
    out = []
    for a, class_name in records:
        out.append({
            "id": a.id,
            "title": a.title,
            "skill_id": a.skill_id,
            "due_date": a.due_date.isoformat(),
            "classroom_name": class_name
        })
    return out


from pydantic import BaseModel
class TutorChatRequest(BaseModel):
    message: str
    skill_id: str

@router.post("/tutor/chat")
async def tutor_chat(payload: TutorChatRequest, user: User = Depends(require_student), db: AsyncSession = Depends(get_db)):
    from app.services.agent.llm import generate_json
    class TutorResponse(BaseModel):
        response: str
        
    profile = (await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))).scalar_one()
    
    system_prompt = f"You are an AI Tutor named MagEdu. You are teaching a grade {profile.grade} student. Be encouraging, use the Socratic method, and focus on {payload.skill_id}."
    user_prompt = payload.message
    
    r = await generate_json(system_prompt, user_prompt, TutorResponse, temperature=0.7)
    return {"message": r.response}

