"""
Intervention models for AI triggered remediations.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, Enum
import enum
from app.core.database import Base

class InterventionType(str, enum.Enum):
    micro_lesson = "micro_lesson"
    targeted_practice = "targeted_practice"
    prerequisite_review = "prerequisite_review"
    confidence_calibration = "confidence_calibration"

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(100), nullable=False)
    misconception_id = Column(String(100), nullable=True) # If it targets a specific misconception
    intervention_type = Column(Enum(InterventionType), nullable=False)
    content = Column(JSON, nullable=False) # e.g., the generated lesson or question IDs
    status = Column(String(20), default="pending") # pending | active | completed | abandoned
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    mastery_before = Column(Float, nullable=True)
    mastery_after = Column(Float, nullable=True)
    success_score = Column(Float, nullable=True) # How effective was this?
