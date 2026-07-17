from app.services import engine, rag
from app.services.models import ContentItem
from app.services.seed import CONTENT, QUESTIONS, SKILLS, STUDENTS

skills = {skill.id: skill for skill in SKILLS}
students = {student.id: student for student in STUDENTS}
contents = list(CONTENT)
questions = {question["id"]: question for question in QUESTIONS}


def bootstrap():
    return {
        "students": [{"id": s.id, "name": s.name, "grade": s.grade} for s in students.values()],
        "skills": [skill.model_dump() for skill in skills.values()],
    }


def serialize_student(student):
    next_skill = engine.choose_next_skill(student, list(skills.values()))
    mastered = len([s for s in student.mastery.values() if s >= 0.65])
    accuracy = round(sum(student.mastery.values()) / len(student.mastery) * 100)
    return {
        **student.model_dump(),
        "next_skill": next_skill,
        "next_skill_name": skills[next_skill].name,
        "mastered_count": mastered,
        "accuracy": accuracy,
        "paths": build_paths(student),
        "risk": engine.risk_score(student),
    }


def build_paths(student):
    rows = []
    for skill in skills.values():
        score = student.mastery.get(skill.id, 0)
        rows.append({
            "skill_id": skill.id,
            "name": skill.name,
            "subject": skill.subject,
            "grade": skill.grade,
            "mastery": score,
            "gap_type": engine.gap_type(score),
        })
    return rows


def get_student_view(student_id: str):
    student = students[student_id]
    next_skill = engine.choose_next_skill(student, list(skills.values()))
    mastery = student.mastery[next_skill]
    mode = "simpler" if mastery < 0.40 else "teach" if mastery < 0.65 else "quiz"
    return {
        "student": serialize_student(student),
        "recommendation": recommend({"student_id": student_id, "skill_id": next_skill, "mode": mode}),
        "questions": QUESTIONS,
    }


def get_teacher_view():
    class_rows = [serialize_student(student) for student in students.values()]
    weak_spots = []
    for skill in skills.values():
        scores = [student.mastery.get(skill.id, 0) for student in students.values()]
        avg = sum(scores) / len(scores)
        weak_spots.append({
            "skill_id": skill.id,
            "name": skill.name,
            "subject": skill.subject,
            "average": round(avg, 3),
            "gap_type": engine.gap_type(avg),
        })
    return {
        "students": class_rows,
        "skills": [skill.model_dump() for skill in skills.values()],
        "weak_spots": sorted(weak_spots, key=lambda item: item["average"]),
        "alerts": [row for row in class_rows if row["risk"]["level"] != "clear"],
    }


def start_diagnostic(student_id: str):
    return {"student": serialize_student(students[student_id]), "questions": QUESTIONS[:4]}


def submit_answer(payload: dict):
    student = students[payload["student_id"]]
    question = questions[payload["question_id"]]
    correct = payload["answer"] == question["answer"]
    skill_id = question["skill_id"]
    old = student.mastery.get(skill_id, 0.50)
    student.mastery[skill_id] = engine.bkt_update(old, correct)

    if correct:
        student.correct_streak += 1
        student.wrong_streak = 0
    else:
        student.wrong_streak += 1
        student.correct_streak = 0

    engine.update_pace(student, correct, payload["response_seconds"], payload.get("hesitation_count", 0))
    student.time_today_min += max(1, round(payload["response_seconds"] / 60))
    student.last_session_hours = 0

    return {
        "correct": correct,
        "answer": question["answer"],
        "old_mastery": old,
        "new_mastery": student.mastery[skill_id],
        "student": serialize_student(student),
    }


def recommend(payload: dict):
    student = students[payload["student_id"]]
    skill_id = payload["skill_id"]
    mastery = student.mastery.get(skill_id, 0.50)
    difficulty = engine.difficulty_for(mastery)
    mode = payload["mode"]
    skill = skills[skill_id]
    query = f"{skill.name} {difficulty} grade {student.grade}"
    chunks = rag.retrieve(contents, skill_id, difficulty, query)
    generated = rag.generate(mode, skill.name, student, chunks)
    return {
        "skill": skill.model_dump(),
        "difficulty": difficulty,
        "mastery": mastery,
        **generated,
    }


def ingest_text(filename: str, text: str):
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 80]
    created = 0
    for idx, paragraph in enumerate(paragraphs[:50]):
        guessed_skill = guess_skill(paragraph)
        contents.append(ContentItem(
            id=f"upload-{filename}-{idx}",
            title=f"{filename} chunk {idx + 1}",
            subject=skills[guessed_skill].subject,
            grade=skills[guessed_skill].grade,
            skill_id=guessed_skill,
            difficulty="medium",
            type="lesson",
            body=paragraph[:1200],
        ))
        created += 1
    return {"filename": filename, "chunks_added": created, "total_content_items": len(contents)}


def guess_skill(text: str) -> str:
    lower = text.lower()
    if "membrane" in lower:
        return "cells.membrane"
    if "nucleus" in lower or "dna" in lower:
        return "cells.nucleus"
    if "cell" in lower:
        return "cells.basic"
    if "fraction" in lower and "multiply" in lower:
        return "fractions.multiply"
    if "equation" in lower or "algebra" in lower:
        return "algebra.linear"
    return "cells.basic"

