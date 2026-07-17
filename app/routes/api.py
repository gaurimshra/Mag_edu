from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

from app.services import store

router = APIRouter()


class AnswerPayload(BaseModel):
    student_id: str
    question_id: str
    answer: str
    response_seconds: float
    hesitation_count: int = 0


class ModePayload(BaseModel):
    student_id: str
    skill_id: str
    mode: str


@router.get("/bootstrap")
def bootstrap():
    return store.bootstrap()


@router.get("/student/{student_id}")
def student(student_id: str):
    return store.get_student_view(student_id)


@router.get("/teacher")
def teacher():
    return store.get_teacher_view()


@router.post("/diagnostic/start/{student_id}")
def start_diagnostic(student_id: str):
    return store.start_diagnostic(student_id)


@router.post("/answer")
def answer(payload: AnswerPayload):
    return store.submit_answer(payload.model_dump())


@router.post("/recommend")
def recommend(payload: ModePayload):
    return store.recommend(payload.model_dump())


@router.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    raw = await file.read()
    text = raw.decode("utf-8", errors="ignore")
    return store.ingest_text(file.filename, text)

