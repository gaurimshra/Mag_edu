"""
Pydantic schemas for teacher dashboard API.
"""

from pydantic import BaseModel
from datetime import datetime


class StudentRiskOut(BaseModel):
    student_id: int
    name: str
    pace: str
    risk_level: str        # clear | amber | red
    risk_score: float
    risk_reason: str
    risk_action: str
    lowest_mastery: float
    weak_skills: list[str]
    last_active: str | None


class HeatmapCellOut(BaseModel):
    student_id: int
    student_name: str
    skill_id: str
    skill_name: str
    mastery: float
    gap_type: str


class ClassWeakSpotOut(BaseModel):
    skill_id: str
    skill_name: str
    chapter_title: str
    class_average: float
    gap_type: str
    student_count_weak: int


class ClassOverviewOut(BaseModel):
    classroom_id: int
    classroom_name: str
    grade: int
    subject: str
    student_count: int
    active_today: int
    class_avg_mastery: float
    at_risk_count: int
    topics_mastered_total: int


class StudentProfileDetailOut(BaseModel):
    student_id: int
    name: str
    email: str
    grade: int
    xp: int
    streak: int
    pace: str
    pace_score: float
    mastery: list[dict]
    mistake_patterns: list[dict]
    recent_sessions: list[dict]
    badges: list[str]
    risk: dict


class CreateClassroomRequest(BaseModel):
    name: str
    subject: str = "Science"
    grade: int = 10


class AssignRemediation(BaseModel):
    student_id: int
    skill_id: str
    note: str | None = None
