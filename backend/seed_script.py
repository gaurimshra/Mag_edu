import asyncio
import os
import sys

# Add backend directory to sys.path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.classroom import Classroom, ClassroomMember
from app.models.student import StudentProfile, PaceLevel, MasteryScore
from app.core.security import hash_password
from sqlalchemy import select

from app.models.assignment import Assignment
from app.models.student import StudentMisconception, MistakeType
from app.core.init_db import init_db

async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Create Teacher
        result = await db.execute(select(User).where(User.email == "teacher@school.edu"))
        teacher = result.scalar_one_or_none()
        if not teacher:
            teacher = User(
                name="Mrs. Sharma",
                email="teacher@school.edu",
                password_hash=hash_password("password123"),
                role=UserRole.teacher
            )
            db.add(teacher)
            await db.commit()
            await db.refresh(teacher)
            print(f"Created teacher: {teacher.email} (Password: password123)")

        # Create Classrooms
        classes = [
            {"name": "Class 10th A", "batch_code": "10A-SCI", "subject": "Science"},
            {"name": "Class 10th B", "batch_code": "10B-SCI", "subject": "Science"}
        ]
        classrooms = []
        for cls in classes:
            result = await db.execute(select(Classroom).where(Classroom.batch_code == cls["batch_code"]))
            classroom = result.scalar_one_or_none()
            if not classroom:
                classroom = Classroom(
                    name=cls["name"],
                    subject=cls["subject"],
                    grade=10,
                    batch_code=cls["batch_code"],
                    teacher_id=teacher.id
                )
                db.add(classroom)
                await db.commit()
                await db.refresh(classroom)
                print(f"Created classroom: {classroom.name} (Code: {classroom.batch_code})")
            classrooms.append(classroom)

        class_10a = classrooms[0]

        # Seed Assignments
        from datetime import datetime, timezone, timedelta
        today = datetime.now(timezone.utc).date()
        now = datetime.now(timezone.utc)
        
        assignments = [
            {"title": "Chemical Reactions Diagnostic", "skill_id": "ch01.chemical_reactions", "due_date": now + timedelta(days=2)},
            {"title": "Balancing Equations Challenge", "skill_id": "ch01.balancing_equations", "due_date": now + timedelta(days=5)}
        ]
        
        for ast in assignments:
            result = await db.execute(select(Assignment).where(Assignment.title == ast["title"]))
            a = result.scalar_one_or_none()
            if not a:
                a = Assignment(
                    classroom_id=class_10a.id,
                    teacher_id=teacher.id,
                    title=ast["title"],
                    skill_id=ast["skill_id"],
                    due_date=ast["due_date"]
                )
                db.add(a)
        await db.commit()

        # Create 10 Students in 10th A with Variety
        import random
        
        skills = ["ch01.chemical_reactions", "ch01.balancing_equations", "ch01.types_of_reactions"]

        student_personas = [
            {"id": 1, "name": "Aarav Sharma", "xp": 1250, "streak": 7, "pace": PaceLevel.fast, "score_range": (0.85, 0.98), "attempts": (3, 5), "active_days_ago": 0},
            {"id": 2, "name": "Isha Patel", "xp": 250, "streak": 0, "pace": PaceLevel.slow, "score_range": (0.2, 0.45), "attempts": (5, 8), "active_days_ago": 3},
            {"id": 3, "name": "Rohan Gupta", "xp": 600, "streak": 3, "pace": PaceLevel.normal, "score_range": (0.5, 0.75), "attempts": (2, 6), "active_days_ago": 1},
            {"id": 4, "name": "Ananya Singh", "xp": 800, "streak": 5, "pace": PaceLevel.slow, "score_range": (0.35, 0.55), "attempts": (8, 15), "active_days_ago": 0},
            {"id": 5, "name": "Kabir Das", "xp": 450, "streak": 1, "pace": PaceLevel.fast, "score_range": (0.8, 0.95), "attempts": (1, 2), "active_days_ago": 2},
            {"id": 6, "name": "Meera Reddy", "xp": 1500, "streak": 14, "pace": PaceLevel.normal, "score_range": (0.7, 0.9), "attempts": (4, 7), "active_days_ago": 0},
            {"id": 7, "name": "Arjun Nair", "xp": 150, "streak": 0, "pace": PaceLevel.slow, "score_range": (0.1, 0.3), "attempts": (1, 3), "active_days_ago": 5},
            {"id": 8, "name": "Riya Verma", "xp": 1100, "streak": 4, "pace": PaceLevel.fast, "score_range": (0.85, 1.0), "attempts": (2, 4), "active_days_ago": 1},
            {"id": 9, "name": "Dev Kumar", "xp": 550, "streak": 0, "pace": PaceLevel.fast, "score_range": (0.6, 0.85), "attempts": (3, 5), "active_days_ago": 4},
            {"id": 10, "name": "Neha Joshi", "xp": 200, "streak": 2, "pace": PaceLevel.normal, "score_range": (0.6, 0.8), "attempts": (1, 2), "active_days_ago": 0},
        ]

        for persona in student_personas:
            i = persona["id"]
            email = f"student{i}@school.edu"
            
            result = await db.execute(select(User).where(User.email == email))
            student = result.scalar_one_or_none()
            if not student:
                student = User(
                    name=persona["name"],
                    email=email,
                    password_hash=hash_password("password123"),
                    role=UserRole.student
                )
                db.add(student)
                await db.commit()
                await db.refresh(student)

            # Profile
            result_prof = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student.id))
            profile = result_prof.scalar_one_or_none()
            if not profile:
                profile = StudentProfile(
                    user_id=student.id,
                    grade=10,
                    xp=persona["xp"],
                    streak=persona["streak"],
                    last_active=today - timedelta(days=persona["active_days_ago"]),
                    pace=persona["pace"]
                )
                db.add(profile)
            else:
                profile.xp = persona["xp"]
                profile.streak = persona["streak"]
                profile.last_active = today - timedelta(days=persona["active_days_ago"])
                profile.pace = persona["pace"]

            # Add to classroom 10A if not already member
            result_mem = await db.execute(select(ClassroomMember).where(
                ClassroomMember.classroom_id == class_10a.id,
                ClassroomMember.student_id == student.id
            ))
            if not result_mem.scalar_one_or_none():
                member = ClassroomMember(
                    classroom_id=class_10a.id,
                    student_id=student.id
                )
                db.add(member)
            
            # Add mastery scores
            for skill in skills:
                mscore = random.uniform(*persona["score_range"])
                result_score = await db.execute(select(MasteryScore).where(
                    MasteryScore.student_id == student.id,
                    MasteryScore.skill_id == skill
                ))
                score_obj = result_score.scalar_one_or_none()
                if not score_obj:
                    score = MasteryScore(
                        student_id=student.id,
                        skill_id=skill,
                        score=mscore,
                        attempts=random.randint(*persona["attempts"])
                    )
                    db.add(score)
                else:
                    score_obj.score = mscore
                
                # If score is very low, mock a misconception
                if mscore < 0.4:
                    mis_res = await db.execute(select(StudentMisconception).where(
                        StudentMisconception.student_id == student.id,
                        StudentMisconception.skill_id == skill
                    ))
                    if not mis_res.scalar_one_or_none():
                        mis = StudentMisconception(
                            student_id=student.id,
                            misconception_id="Misunderstanding of Reactant Conservation in Balancing",
                            skill_id=skill,
                            confidence=0.88,
                            incidences=random.randint(1, 3)
                        )
                        db.add(mis)
            
            await db.commit()
            print(f"Created student: {student.email} ({student.name}) in {class_10a.name}")

if __name__ == "__main__":
    asyncio.run(seed())
