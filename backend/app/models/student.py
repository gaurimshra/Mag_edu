"""
Student learning state models.
MasteryScore, LearningSession, MistakePattern, LearningRoadmap.
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey,
    DateTime, Enum as SAEnum, JSON, Text, Date
)
from app.core.database import Base


class PaceLevel(str, enum.Enum):
    slow = "slow"
    normal = "normal"
    fast = "fast"


class MistakeType(str, enum.Enum):
    conceptual = "conceptual"     # wrong understanding of the idea
    calculation = "calculation"   # right method, arithmetic error
    careless = "careless"         # answered too fast, didn't read
    unknown = "unknown"


class StudentProfile(Base):
    """
    Extended profile for a student user.
    Tracks XP, streaks, and overall pace.
    Created automatically when a user with role=student signs up.
    """
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    grade = Column(Integer, default=10)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)             # days in a row
    longest_streak = Column(Integer, default=0)
    last_active = Column(Date, nullable=True)
    pace = Column(SAEnum(PaceLevel), default=PaceLevel.normal)
    pace_score = Column(Float, default=50.0)        # 0-100 composite signal
    learning_velocity = Column(Float, default=1.0)  # Rate of learning progression
    prerequisite_gap_score = Column(Float, default=0.0) # 0.0 to 1.0 (Higher means more gaps)
    correct_streak = Column(Integer, default=0)     # consecutive correct answers
    wrong_streak = Column(Integer, default=0)       # consecutive wrong answers
    time_today_min = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MasteryScore(Base):
    """
    Per-student, per-skill mastery score (BKT probability of knowing).
    Range: 0.0 – 1.0. Updated after every quiz answer.
    """
    __tablename__ = "mastery_scores"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(100), nullable=False, index=True)  # e.g. "ch01.chemical_reactions"
    score = Column(Float, default=0.5, nullable=False)          # BKT P(mastery)
    attempts = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class LearningSession(Base):
    """
    Records each learning session (a student studying a topic).
    Used for streak tracking and teacher reports.
    """
    __tablename__ = "learning_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(100), nullable=False)
    mode = Column(String(20), nullable=False)          # teach | quiz | simpler | exercise
    duration_seconds = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime(timezone=True), nullable=True)


class QuizAttempt(Base):
    """
    Individual quiz answer record.
    Stores timing, hesitation, confidence, and classified mistake type.
    """
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(Integer, ForeignKey("learning_sessions.id", ondelete="SET NULL"), nullable=True)
    question_id = Column(String(200), nullable=False)
    skill_id = Column(String(100), nullable=False)
    student_answer = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    confidence_level = Column(Integer, nullable=True)  # 0-100 stated confidence
    response_ms = Column(Integer, default=0)           # response time in milliseconds
    hesitation_count = Column(Integer, default=0)      # option hover count
    mistake_type = Column(SAEnum(MistakeType), default=MistakeType.unknown)
    mastery_before = Column(Float, nullable=True)
    mastery_after = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MistakePattern(Base):
    """
    Aggregated mistake patterns per student per skill.
    The AI agent reads this to personalize explanations.
    e.g. "student has made 5 conceptual errors on photosynthesis"
    """
    __tablename__ = "mistake_patterns"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(100), nullable=False)
    mistake_type = Column(SAEnum(MistakeType), nullable=False)
    count = Column(Integer, default=1)
    last_seen = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))


class StudentMisconception(Base):
    """
    Specific detected knowledge misconceptions linking an error to a root cause.
    e.g. 'Fraction denominator confusion'. 
    """
    __tablename__ = "student_misconceptions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    misconception_id = Column(String(100), nullable=False)  # Global misconception key
    skill_id = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.0) # System confidence that they have this misconception
    incidences = Column(Integer, default=1) # How many times it was detected
    status = Column(String(20), default="active") # active | remediated
    detected_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class LearningRoadmap(Base):
    """
    The student's personalized skill sequence.
    skill_sequence is an ordered list of skill_ids.
    current_index tracks where they are in the journey.
    """
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    skill_sequence = Column(JSON, nullable=False)   # ["ch01.chemical_reactions", "ch01.types_of_reactions", ...]
    current_index = Column(Integer, default=0)
    status = Column(String(20), default="active")   # active | completed | paused
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
