"""
Gamification models: badges, student_badges, leaderboard.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from app.core.database import Base


class Badge(Base):
    """
    Badge definitions — seeded once at startup.
    Students earn badges by hitting XP thresholds or specific events.
    """
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, nullable=False)   # e.g. "first_correct"
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(10), nullable=True)                  # emoji
    xp_reward = Column(Integer, default=10)
    condition_type = Column(String(50), nullable=False)       # "streak" | "mastery" | "xp" | "event"
    condition_value = Column(Integer, default=0)              # threshold value


class StudentBadge(Base):
    """Junction: which student earned which badge and when."""
    __tablename__ = "student_badges"
    __table_args__ = (
        UniqueConstraint("student_id", "badge_id", name="uq_student_badge"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Skill(Base):
    """
    Master skills table — defines the learning graph for Class 10 Science.
    Nodes of the prerequisite DAG.
    """
    __tablename__ = "skills"

    id = Column(String(100), primary_key=True)    # e.g. "ch01.chemical_reactions"
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    chapter_num = Column(Integer, nullable=False)
    chapter_title = Column(String(200), nullable=False)
    subject = Column(String(100), default="Science")
    grade = Column(Integer, default=10)
    difficulty = Column(String(20), default="medium")
    prerequisites = Column(String(500), default="")  # comma-separated skill ids
    order_in_chapter = Column(Integer, default=0)
