from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.auth import verify_token

from app.services import store
from app.db import SessionLocal
from app.database_models import User

from app.auth import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


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

class SignupPayload(BaseModel):
    name: str
    email: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    db = SessionLocal()

    user = db.query(User).filter(
        User.id == payload["user_id"]
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

@router.get("/bootstrap")
def bootstrap():
    return store.bootstrap()


@router.get("/student/{student_id}")
def student(student_id: str):
    return store.get_student_view()


@router.get("/teacher")
def teacher(
    current_user=Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Teachers only"
        )

    return store.get_teacher_view(current_user.id)

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

@router.post("/signup")
def signup(payload: SignupPayload):

    db = SessionLocal()

    existing_user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already exists"
        }

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role
    )

    db.add(new_user)
    db.commit()

    return {
        "success": True,
        "message": "Account created"
    }

@router.post("/login")
def login(payload: LoginRequest):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    if not verify_password(
        payload.password,
        user.password_hash
    ):
        return {
            "success": False,
            "message": "Invalid password"
        }

    token = create_access_token({
    "user_id": user.id,
    "email": user.email,
    "role": user.role
})

    return {


        "access_token": token,
        "token_type": "bearer"
    }