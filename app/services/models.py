from pydantic import BaseModel, Field


class Skill(BaseModel):
    id: str
    name: str
    subject: str
    grade: int
    prerequisites: list[str] = Field(default_factory=list)


class ContentItem(BaseModel):
    id: str
    title: str
    subject: str
    grade: int
    skill_id: str
    difficulty: str
    type: str
    body: str


class Student(BaseModel):
    id: str
    name: str
    grade: int
    streak: int
    time_today_min: int
    pace: str
    pace_score: float
    mastery: dict[str, float]
    last_session_hours: int
    wrong_streak: int = 0
    correct_streak: int = 0

