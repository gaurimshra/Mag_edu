"""
Classroom models — virtual classroom with teacher ownership and student membership.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, UniqueConstraint
from app.core.database import Base


class Classroom(Base):
    """
    A virtual classroom owned by a teacher.
    Students join via batch_code (like a Google Classroom join code).
    """
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    subject = Column(String(100), default="Science", nullable=False)
    grade = Column(Integer, default=10, nullable=False)
    batch_code = Column(String(10), unique=True, nullable=False, index=True)  # e.g. "SC10A"
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ClassroomMember(Base):
    """
    Junction table: links students to classrooms.
    One student can be in multiple classrooms (e.g. Science + Maths).
    """
    __tablename__ = "classroom_members"
    __table_args__ = (
        UniqueConstraint("classroom_id", "student_id", name="uq_classroom_student"),
    )

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
