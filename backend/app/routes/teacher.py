"""
Teacher dashboard API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.security import get_current_user, require_teacher
from app.models.user import User
from app.models.student import StudentProfile, MasteryScore, PaceLevel
from app.models.classroom import Classroom, ClassroomMember
from app.models.gamification import Skill
from app.schemas.teacher import (
    ClassOverviewOut, HeatmapCellOut, ClassWeakSpotOut, StudentRiskOut,
    CreateClassroomRequest
)
from app.services.bkt import gap_type, risk_score

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


@router.post("/classroom", response_model=dict)
async def create_classroom(
    payload: CreateClassroomRequest,
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    import random
    import string
    
    # Generate random 6-char batch code
    batch_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    classroom = Classroom(
        name=payload.name,
        subject=payload.subject,
        grade=payload.grade,
        batch_code=batch_code,
        teacher_id=user.id
    )
    db.add(classroom)
    await db.commit()
    
    return {"message": "Classroom created", "batch_code": batch_code}


@router.get("/classrooms", response_model=list[dict])
async def get_classrooms(
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Classroom).where(Classroom.teacher_id == user.id)
    result = await db.execute(stmt)
    classrooms = result.scalars().all()
    
    return [
        {
            "id": c.id,
            "name": c.name,
            "grade": c.grade,
            "batch_code": c.batch_code
        } for c in classrooms
    ]


@router.get("/dashboard/{classroom_id}", response_model=dict)
async def get_dashboard(
    classroom_id: int,
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership
    stmt = select(Classroom).where(Classroom.id == classroom_id, Classroom.teacher_id == user.id)
    classroom = (await db.execute(stmt)).scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=403, detail="Not authorized or classroom not found")

    # Get students in classroom
    stmt_students = (
        select(User, StudentProfile)
        .join(ClassroomMember, ClassroomMember.student_id == User.id)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .where(ClassroomMember.classroom_id == classroom_id)
    )
    result_students = await db.execute(stmt_students)
    students = result_students.all()
    
    student_ids = [u.id for u, p in students]
    
    if not student_ids:
        return {"overview": None, "heatmap": [], "alerts": [], "weak_spots": []}

    # Get all mastery scores for these students
    stmt_mastery = select(MasteryScore).where(MasteryScore.student_id.in_(student_ids))
    mastery_records = (await db.execute(stmt_mastery)).scalars().all()
    
    # Get all skills
    stmt_skills = select(Skill)
    skills = {s.id: s.name for s in (await db.execute(stmt_skills)).scalars().all()}
    
    # Process data
    active_today = 0
    today = datetime.now(timezone.utc).date()
    total_mastery = 0.0
    mastery_count = 0
    topics_mastered = 0
    
    alerts = []
    heatmap = []
    skill_averages = {} # skill_id -> [scores]
    
    for u, p in students:
        if p.last_active == today:
            active_today += 1
            
        student_mastery = {m.skill_id: m.score for m in mastery_records if m.student_id == u.id}
        
        for skill_id, score in student_mastery.items():
            total_mastery += score
            mastery_count += 1
            if score >= 0.80:
                topics_mastered += 1
                
            skill_name = skills.get(skill_id, skill_id)
            heatmap.append(HeatmapCellOut(
                student_id=u.id,
                student_name=u.name,
                skill_id=skill_id,
                skill_name=skill_name,
                mastery=score,
                gap_type=gap_type(score)
            ))
            
            if skill_id not in skill_averages:
                skill_averages[skill_id] = []
            skill_averages[skill_id].append(score)
            
        # Calculate Risk
        last_active_hours = 0
        if p.last_active:
             delta = today - p.last_active
             last_active_hours = delta.days * 24
             
        risk = risk_score(student_mastery, last_active_hours, p.pace.value, p.wrong_streak)
        if risk["level"] != "clear":
            alerts.append(StudentRiskOut(
                student_id=u.id,
                name=u.name,
                pace=p.pace.value,
                risk_level=risk["level"],
                risk_score=risk["score"],
                risk_reason=risk["reason"],
                risk_action=risk["action"],
                lowest_mastery=min(student_mastery.values()) if student_mastery else 0,
                weak_skills=[k for k,v in student_mastery.items() if v < 0.65],
                last_active=str(p.last_active) if p.last_active else "Never"
            ))

    # Weak spots
    weak_spots = []
    for skill_id, scores in skill_averages.items():
        avg = sum(scores) / len(scores)
        weak_count = sum(1 for s in scores if s < 0.65)
        if avg < 0.65:
            weak_spots.append(ClassWeakSpotOut(
                skill_id=skill_id,
                skill_name=skills.get(skill_id, skill_id),
                chapter_title="", # could fetch
                class_average=avg,
                gap_type=gap_type(avg),
                student_count_weak=weak_count
            ))

    overview = ClassOverviewOut(
        classroom_id=classroom_id,
        classroom_name=classroom.name,
        grade=classroom.grade,
        subject=classroom.subject,
        student_count=len(students),
        active_today=active_today,
        class_avg_mastery=total_mastery / mastery_count if mastery_count else 0,
        at_risk_count=len(alerts),
        topics_mastered_total=topics_mastered
    )

    return {
        "overview": overview,
        "heatmap": heatmap,
        "alerts": alerts,
        "weak_spots": sorted(weak_spots, key=lambda x: x.class_average)
    }


@router.get("/students/{classroom_id}", response_model=list)
async def get_student_list(
    classroom_id: int,
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Return a simplified student list for the teacher's classroom."""
    stmt = select(Classroom).where(Classroom.id == classroom_id, Classroom.teacher_id == user.id)
    classroom = (await db.execute(stmt)).scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=403, detail="Not authorized or classroom not found")

    stmt_students = (
        select(User, StudentProfile)
        .join(ClassroomMember, ClassroomMember.student_id == User.id)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .where(ClassroomMember.classroom_id == classroom_id)
    )
    students = (await db.execute(stmt_students)).all()

    from datetime import date
    today = date.today()
    result = []

    for u, p in students:
        # Get mastery average
        mastery_records = (await db.execute(
            select(MasteryScore).where(MasteryScore.student_id == u.id)
        )).scalars().all()
        avg_mastery = sum(m.score for m in mastery_records) / len(mastery_records) if mastery_records else 0

        student_mastery = {m.skill_id: m.score for m in mastery_records}
        last_active_hours = 0
        if p.last_active:
            delta = today - p.last_active
            last_active_hours = delta.days * 24

        risk = risk_score(student_mastery, last_active_hours, p.pace.value, p.wrong_streak)

        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "mastery_avg": round(avg_mastery * 100, 1),
            "pace": p.pace.value,
            "last_active": str(p.last_active) if p.last_active else "Never",
            "risk_level": risk["level"],
            "streak": p.streak,
        })

    return result


@router.get("/alerts")
async def get_alerts(user: User = Depends(require_teacher), db: AsyncSession = Depends(get_db)):
    """Return a list of at-risk students across all classrooms."""
    # Build alerts actively from actual telemetry
    stmt = select(Classroom).where(Classroom.teacher_id == user.id)
    classrooms = (await db.execute(stmt)).scalars().all()
    classroom_ids = [c.id for c in classrooms]
    class_map = {c.id: c.name for c in classrooms}
    
    if not classroom_ids:
        return []

    stmt_students = (
        select(User, StudentProfile, ClassroomMember.classroom_id)
        .join(ClassroomMember, ClassroomMember.student_id == User.id)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .where(ClassroomMember.classroom_id.in_(classroom_ids))
    )
    result_students = (await db.execute(stmt_students)).all()
    
    from datetime import date
    today = date.today()
    alerts = []

    for u, p, cid in result_students:
        mastery_records = (await db.execute(
            select(MasteryScore).where(MasteryScore.student_id == u.id)
        )).scalars().all()
        student_mastery = {m.skill_id: m.score for m in mastery_records}
        
        last_active_hours = 0
        if p.last_active:
            delta = today - p.last_active
            last_active_hours = delta.days * 24
            
        risk = risk_score(student_mastery, last_active_hours, p.pace.value, p.wrong_streak)
        
        if risk["level"] != "clear":
            alerts.append({
                "id": u.id,
                "student_name": u.name,
                "classroom_name": class_map.get(cid, "Unknown"),
                "risk_level": risk["level"],
                "issue": risk["reason"],
                "last_active": f"{int(last_active_hours/24)} days ago" if last_active_hours else "Today"
            })
            
    return sorted(alerts, key=lambda x: x["risk_level"], reverse=True)


from pydantic import BaseModel
class CreateAssignmentRequest(BaseModel):
    classroom_id: int
    title: str
    skill_id: str
    due_date: str

from app.models.assignment import Assignment

@router.post("/assignments")
async def create_assignment(payload: CreateAssignmentRequest, user: User = Depends(require_teacher), db: AsyncSession = Depends(get_db)):
    from dateutil import parser
    due = parser.parse(payload.due_date)
    
    a = Assignment(
        classroom_id=payload.classroom_id,
        teacher_id=user.id,
        title=payload.title,
        skill_id=payload.skill_id,
        due_date=due
    )
    db.add(a)
    await db.commit()
    return {"message": "Assignment created successfully"}


@router.get("/assignments")
async def get_assignments(user: User = Depends(require_teacher), db: AsyncSession = Depends(get_db)):
    """Return a list of assignments belonging to this teacher."""
    stmt = select(Assignment, Classroom.name).join(Classroom, Classroom.id == Assignment.classroom_id).where(Assignment.teacher_id == user.id).order_by(Assignment.due_date)
    result = await db.execute(stmt)
    records = result.all()
    
    out = []
    now = datetime.now(timezone.utc)
    for a, class_name in records:
        # Mock completion rate for demo, can be queried from QuizAttempts linked to the skill.
        out.append({
            "id": a.id,
            "title": a.title,
            "classroom_name": class_name,
            "due_date": a.due_date.isoformat(),
            "status": "Active" if a.due_date > now else "Past Due",
            "completion_rate": 0.0 # Wait for students to act
        })
    return out


@router.get("/reports")
async def get_reports(user: User = Depends(require_teacher), db: AsyncSession = Depends(get_db)):
    """Return basic class stats using real data."""
    stmt = select(Classroom).where(Classroom.teacher_id == user.id)
    classrooms = (await db.execute(stmt)).scalars().all()
    
    out = []
    
    for c in classrooms:
        members = (await db.execute(select(ClassroomMember).where(ClassroomMember.classroom_id == c.id))).scalars().all()
        student_ids = [m.student_id for m in members]
        if not student_ids:
            continue
            
        profiles = (await db.execute(select(StudentProfile).where(StudentProfile.user_id.in_(student_ids)))).scalars().all()
        active_today = sum(1 for p in profiles if p.last_active == datetime.now(timezone.utc).date())
        
        scores = (await db.execute(select(MasteryScore).where(MasteryScore.student_id.in_(student_ids)))).scalars().all()
        mastered = sum(1 for s in scores if s.score >= 0.8)
        avg = sum(s.score for s in scores) / len(scores) if scores else 0
        
        out.append({
            "classroom_name": c.name,
            "average_score": round(avg * 100, 1),
            "active_students": active_today,
            "total_students": len(members),
            "topics_mastered": mastered
        })
        
    return out


class CopilotRequest(BaseModel):
    query: str

from app.services.agent.llm import generate_json
class CopilotSimulatorResponse(BaseModel):
    primary_issue: str
    at_risk_count: int
    intervention_required: str
    current_state: str
    predicted_state: str

@router.post("/copilot-simulate")
async def copilot_simulate(payload: CopilotRequest, user: User = Depends(require_teacher), db: AsyncSession = Depends(get_db)):
    # Grab the alerts logic to summarize the class situation for the prompt
    alerts = await get_alerts(user, db)
    issue_list = [a["issue"] for a in alerts]
    
    system_prompt = "You are the MagEdu AI Teacher Copilot. Analyze the teacher's query and the current state to simulate what an intervention would do."
    user_prompt = f"Teacher query: {payload.query}\nCurrent Alerts: {issue_list}\nGenerate a Counterfactual Simulation prediction."
    
    response = await generate_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=CopilotSimulatorResponse,
        temperature=0.7
    )
    
    return response.model_dump()
