"""
Pydantic schemas for the student learning API.
"""

from pydantic import BaseModel
from datetime import datetime


# ── Inbound ───────────────────────────────────────────────────────────────────

class StartSessionRequest(BaseModel):
    skill_id: str
    mode: str = "teach"   # teach | quiz | simpler | exercise


class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_id: str
    skill_id: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    response_ms: int
    hesitation_count: int = 0


class RecommendRequest(BaseModel):
    skill_id: str
    mode: str = "teach"


# ── Outbound ──────────────────────────────────────────────────────────────────

class MasteryScoreOut(BaseModel):
    skill_id: str
    score: float
    attempts: int
    correct: int
    gap_type: str        # "strong" | "weak" | "critical"

    model_config = {"from_attributes": True}


class StudentDashboardOut(BaseModel):
    student_id: int
    name: str
    grade: int
    xp: int
    streak: int
    pace: str
    pace_score: float
    mastery: list[MasteryScoreOut]
    badges_earned: int
    risk_level: str      # "clear" | "amber" | "red"
    risk_reason: str
    next_skill_id: str
    next_skill_name: str


class LessonOut(BaseModel):
    skill_id: str
    skill_name: str
    mode: str
    difficulty: str
    mastery: float
    content: str          # AI-generated lesson / quiz / explanation
    sources: list[str]    # chunk titles used in RAG
    session_id: int


class QuizQuestionOut(BaseModel):
    question_id: str
    skill_id: str
    prompt: str
    options: list[str]
    difficulty: str


class AnswerResultOut(BaseModel):
    is_correct: bool
    correct_answer: str
    mastery_before: float
    mastery_after: float
    xp_gained: int
    badges_unlocked: list[str]
    feedback: str         # AI-generated feedback message


class ChapterQuizRequest(BaseModel):
    skill_id: str

class ChapterQuizSubmitRequest(BaseModel):
    skill_id: str
    answers: dict[str, str] # question_id -> student_answer
    questions: list[dict] # The original questions generated

class QuizExplanationOut(BaseModel):
    question_id: str
    correct_answer: str
    student_answer: str
    is_correct: bool
    explanation: str

class QuizAnalysisResponse(BaseModel):
    weak_topics: list[str]
    strong_topics: list[str]
    overall_feedback: str
    explanations: list[QuizExplanationOut]

class RoadmapSkillOut(BaseModel):
    skill_id: str
    name: str
    chapter_num: int
    chapter_title: str
    mastery: float
    gap_type: str
    is_current: bool
    is_unlocked: bool

class RoadmapOut(BaseModel):
    skills: list[RoadmapSkillOut]
    current_index: int
    progress_pct: float
