"""
Database initialization and auto-seeding helper.
Ensures all tables exist on startup and populates baseline skills, badges,
demo teacher, and demo students if the database is newly initialized.
"""

import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.core.database import engine, AsyncSessionLocal, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.classroom import Classroom, ClassroomMember
from app.models.student import StudentProfile, PaceLevel, MasteryScore, StudentMisconception
from app.models.gamification import Badge, Skill
from app.models.assignment import Assignment

DEFAULT_SKILLS = [
    {
        "id": "ch01.chemical_reactions",
        "name": "Chemical Reactions & Equations",
        "description": "Understanding chemical change, word equations, and balanced molecular equations.",
        "chapter_num": 1,
        "chapter_title": "Chemical Reactions and Equations",
        "difficulty": "medium",
        "prerequisites": "",
        "order_in_chapter": 1
    },
    {
        "id": "ch01.balancing_equations",
        "name": "Balancing Chemical Equations",
        "description": "Applying the Law of Conservation of Mass to balance chemical equations with correct stoichiometric coefficients.",
        "chapter_num": 1,
        "chapter_title": "Chemical Reactions and Equations",
        "difficulty": "hard",
        "prerequisites": "ch01.chemical_reactions",
        "order_in_chapter": 2
    },
    {
        "id": "ch01.types_of_reactions",
        "name": "Types of Chemical Reactions",
        "description": "Combination, decomposition, displacement, double displacement, and redox reactions.",
        "chapter_num": 1,
        "chapter_title": "Chemical Reactions and Equations",
        "difficulty": "medium",
        "prerequisites": "ch01.chemical_reactions",
        "order_in_chapter": 3
    },
    {
        "id": "ch02.acids_bases",
        "name": "Acids, Bases and Salts",
        "description": "Understanding pH scale, indicators, neutralization, and everyday salt compounds.",
        "chapter_num": 2,
        "chapter_title": "Acids, Bases and Salts",
        "difficulty": "medium",
        "prerequisites": "",
        "order_in_chapter": 1
    },
    {
        "id": "ch06.life_processes",
        "name": "Life Processes: Nutrition & Respiration",
        "description": "Autotrophic and heterotrophic nutrition, cellular respiration, and energy pathways in living organisms.",
        "chapter_num": 6,
        "chapter_title": "Life Processes",
        "difficulty": "medium",
        "prerequisites": "",
        "order_in_chapter": 1
    }
]

DEFAULT_BADGES = [
    {
        "slug": "first_correct",
        "name": "First Spark",
        "description": "Answered your first question correctly!",
        "icon": "✨",
        "xp_reward": 50,
        "condition_type": "first_correct",
        "condition_value": 1
    },
    {
        "slug": "streak_3",
        "name": "On Fire",
        "description": "Maintained a 3-day learning streak!",
        "icon": "🔥",
        "xp_reward": 100,
        "condition_type": "streak",
        "condition_value": 3
    },
    {
        "slug": "streak_7",
        "name": "Unstoppable",
        "description": "Achieved a full 7-day learning streak!",
        "icon": "⚡",
        "xp_reward": 250,
        "condition_type": "streak",
        "condition_value": 7
    },
    {
        "slug": "mastery_80",
        "name": "Topic Master",
        "description": "Reached 80% mastery on a core skill!",
        "icon": "🏆",
        "xp_reward": 200,
        "condition_type": "mastery_update",
        "condition_value": 80
    }
]


async def init_db():
    """Create all tables and seed initial demo data if empty."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed Skills if not present
        existing_skills = (await db.execute(select(Skill))).scalars().all()
        if not existing_skills:
            for s_data in DEFAULT_SKILLS:
                db.add(Skill(**s_data))
            await db.commit()

        # 2. Seed Badges if not present
        existing_badges = (await db.execute(select(Badge))).scalars().all()
        if not existing_badges:
            for b_data in DEFAULT_BADGES:
                db.add(Badge(**b_data))
            await db.commit()

        # 3. Check if Teacher exists
        teacher_result = await db.execute(select(User).where(User.email == "teacher@school.edu"))
        teacher = teacher_result.scalar_one_or_none()
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

        # 4. Check if Classrooms exist
        class_result = await db.execute(select(Classroom).where(Classroom.batch_code == "10A-SCI"))
        classroom = class_result.scalar_one_or_none()
        if not classroom:
            classroom = Classroom(
                name="Class 10th A",
                subject="Science",
                grade=10,
                batch_code="10A-SCI",
                teacher_id=teacher.id
            )
            db.add(classroom)
            await db.commit()
            await db.refresh(classroom)

            # Class 10th B
            class_b = Classroom(
                name="Class 10th B",
                subject="Science",
                grade=10,
                batch_code="10B-SCI",
                teacher_id=teacher.id
            )
            db.add(class_b)
            await db.commit()

        # 5. Check if Assignments exist
        ast_result = await db.execute(select(Assignment).where(Assignment.classroom_id == classroom.id))
        if not ast_result.scalars().first():
            now = datetime.now(timezone.utc)
            db.add(Assignment(
                classroom_id=classroom.id,
                teacher_id=teacher.id,
                title="Chemical Reactions Diagnostic",
                skill_id="ch01.chemical_reactions",
                due_date=now + timedelta(days=2)
            ))
            db.add(Assignment(
                classroom_id=classroom.id,
                teacher_id=teacher.id,
                title="Balancing Equations Challenge",
                skill_id="ch01.balancing_equations",
                due_date=now + timedelta(days=5)
            ))
            await db.commit()

        # 6. Check if Demo Student exists
        student_result = await db.execute(select(User).where(User.email == "student1@school.edu"))
        student1 = student_result.scalar_one_or_none()
        if not student1:
            student1 = User(
                name="Aarav Sharma",
                email="student1@school.edu",
                password_hash=hash_password("password123"),
                role=UserRole.student
            )
            db.add(student1)
            await db.commit()
            await db.refresh(student1)

            profile = StudentProfile(
                user_id=student1.id,
                grade=10,
                xp=1250,
                streak=7,
                pace=PaceLevel.fast,
                last_active=datetime.now(timezone.utc).date()
            )
            db.add(profile)
            db.add(ClassroomMember(classroom_id=classroom.id, student_id=student1.id))

            # Add starter mastery scores
            for skill_id, score in [
                ("ch01.chemical_reactions", 0.88),
                ("ch01.balancing_equations", 0.76),
                ("ch01.types_of_reactions", 0.82)
            ]:
                db.add(MasteryScore(student_id=student1.id, skill_id=skill_id, score=score, attempts=5))

            await db.commit()
