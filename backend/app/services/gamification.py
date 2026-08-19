"""
Gamification service: XP, badges, streaks.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta

from app.models.student import StudentProfile
from app.models.gamification import Badge, StudentBadge


async def award_xp(db: AsyncSession, student_profile: StudentProfile, xp_amount: int) -> int:
    """Adds XP to the student's profile."""
    student_profile.xp += xp_amount
    return student_profile.xp


async def check_and_award_badges(db: AsyncSession, student_profile: StudentProfile, event: str, value: int = 0) -> list[str]:
    """
    Check if the student meets criteria for any new badges.
    Event types: "streak", "mastery_update", "first_correct"
    """
    unlocked_badge_names = []

    # Get all badges the student already has
    stmt = select(StudentBadge.badge_id).where(StudentBadge.student_id == student_profile.user_id)
    result = await db.execute(stmt)
    owned_badge_ids = set(result.scalars().all())

    # Get potential badges for this event
    stmt = select(Badge).where(Badge.condition_type == event)
    result = await db.execute(stmt)
    potential_badges = result.scalars().all()

    for badge in potential_badges:
        if badge.id in owned_badge_ids:
            continue

        # Check condition
        awarded = False
        if event == "streak" and student_profile.streak >= badge.condition_value:
            awarded = True
        elif event == "mastery_update" and value >= badge.condition_value:
            awarded = True
        elif event == "first_correct":
            awarded = True

        if awarded:
            # Award badge
            new_student_badge = StudentBadge(
                student_id=student_profile.user_id,
                badge_id=badge.id,
            )
            db.add(new_student_badge)
            await award_xp(db, student_profile, badge.xp_reward)
            unlocked_badge_names.append(badge.name)

    return unlocked_badge_names


def update_streak(student_profile: StudentProfile) -> None:
    """Updates the daily login/activity streak."""
    today = datetime.now(timezone.utc).date()
    
    if student_profile.last_active == today:
        return  # Already active today, streak unchanged
        
    yesterday = today - timedelta(days=1)
    
    if student_profile.last_active == yesterday:
        # Streak continues
        student_profile.streak += 1
    else:
        # Streak broken
        student_profile.streak = 1
        
    student_profile.last_active = today
    
    if student_profile.streak > student_profile.longest_streak:
        student_profile.longest_streak = student_profile.streak
