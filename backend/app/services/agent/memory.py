"""
Handles fetching historical context (mistakes, last sessions) from the DB.
Injects real student memory into the LangGraph state.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.student import MistakePattern, LearningSession


async def fetch_student_memory(db: AsyncSession, student_id: int, skill_id: str) -> dict:
    """
    Fetch the student's historical data for a specific skill.
    Returns mistake patterns and the last few sessions.
    """
    # 1. Fetch mistake patterns for this skill
    stmt_mistakes = (
        select(MistakePattern)
        .where(
            MistakePattern.student_id == student_id,
            MistakePattern.skill_id == skill_id,
        )
    )
    result_mistakes = await db.execute(stmt_mistakes)
    mistake_patterns = [
        {"skill_id": row.skill_id, "mistake_type": row.mistake_type.value, "count": row.count}
        for row in result_mistakes.scalars().all()
    ]

    # 2. Fetch last 3 sessions for context
    stmt_sessions = (
        select(LearningSession)
        .where(LearningSession.student_id == student_id)
        .order_by(desc(LearningSession.started_at))
        .limit(3)
    )
    result_sessions = await db.execute(stmt_sessions)
    recent_sessions = [
        {
            "skill_id": row.skill_id,
            "mode": row.mode,
            "correct_count": row.correct_count,
            "questions_answered": row.questions_answered,
        }
        for row in result_sessions.scalars().all()
    ]

    return {
        "mistake_patterns": mistake_patterns,
        "recent_sessions": recent_sessions,
    }
