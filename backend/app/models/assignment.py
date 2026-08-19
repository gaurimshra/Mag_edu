"""
Assignment models.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, TypeDecorator
from app.core.database import Base

class Assignment(Base):
    """
    An assignment created by a teacher for a classroom.
    Targeted to a specific topic or skill.
    """
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    skill_id = Column(String(100), nullable=False) # e.g. "ch01.chemical_reactions"
    
    due_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
