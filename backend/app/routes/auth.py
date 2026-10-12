"""
Authentication routes: login, signup, current user info.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.classroom import Classroom, ClassroomMember
from app.schemas.auth import SignupRequest, LoginRequest, DemoLoginRequest, TokenResponse, MeResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=dict)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # If student, check if batch_code is valid
    classroom_id = None
    if payload.role == UserRole.student:
        if not payload.batch_code:
            raise HTTPException(status_code=400, detail="Batch code required for students")
        result = await db.execute(select(Classroom).where(Classroom.batch_code == payload.batch_code))
        classroom = result.scalar_one_or_none()
        if not classroom:
            raise HTTPException(status_code=400, detail="Invalid batch code")
        classroom_id = classroom.id

    # Create User
    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    await db.flush()  # to get new_user.id

    # If student, create profile and link to classroom
    if payload.role == UserRole.student:
        profile = StudentProfile(user_id=new_user.id)
        db.add(profile)
        member = ClassroomMember(classroom_id=classroom_id, student_id=new_user.id)
        db.add(member)

    await db.commit()
    return {"message": "Account created successfully"}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get classroom ID if student
    classroom_id = None
    if user.role == UserRole.student:
        result = await db.execute(
            select(ClassroomMember.classroom_id).where(ClassroomMember.student_id == user.id)
        )
        classroom_id = result.scalar_one_or_none()

    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value, "classroom_id": classroom_id}
    )

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        classroom_id=classroom_id,
    )


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(payload: DemoLoginRequest, db: AsyncSession = Depends(get_db)):
    """One-click instant login for live presentation / demo purposes."""
    role = UserRole.teacher if payload.role == "teacher" else UserRole.student
    target_email = "teacher@school.edu" if role == UserRole.teacher else "student1@school.edu"

    result = await db.execute(select(User).where(User.email == target_email))
    user = result.scalar_one_or_none()

    if not user:
        result = await db.execute(select(User).where(User.role == role))
        user = result.scalars().first()

    if not user:
        user = User(
            name="Mrs. Sharma" if role == UserRole.teacher else "Aarav Sharma",
            email=target_email,
            password_hash=hash_password("password123"),
            role=role,
        )
        db.add(user)
        await db.flush()

        if role == UserRole.student:
            profile = StudentProfile(user_id=user.id, xp=1250, streak=7)
            db.add(profile)
        await db.commit()

    classroom_id = None
    if user.role == UserRole.student:
        result = await db.execute(
            select(ClassroomMember.classroom_id).where(ClassroomMember.student_id == user.id)
        )
        classroom_id = result.scalar_one_or_none()

    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value, "classroom_id": classroom_id}
    )

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        classroom_id=classroom_id,
    )


@router.get("/me", response_model=MeResponse)
async def get_me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    classroom_id = None
    if user.role == UserRole.student:
        result = await db.execute(
            select(ClassroomMember.classroom_id).where(ClassroomMember.student_id == user.id)
        )
        classroom_id = result.scalar_one_or_none()

    return MeResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        avatar_url=user.avatar_url,
        classroom_id=classroom_id,
    )


@router.get("/classroom-preview", response_model=dict)
async def classroom_preview(code: str, db: AsyncSession = Depends(get_db)):
    """Return classroom info for a batch code without requiring auth (for signup confirmation)."""
    result = await db.execute(select(Classroom).where(Classroom.batch_code == code))
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Invalid classroom code")

    teacher_result = await db.execute(select(User).where(User.id == classroom.teacher_id))
    teacher = teacher_result.scalar_one_or_none()

    return {
        "name": classroom.name,
        "grade": f"Class {classroom.grade}",
        "teacher_name": teacher.name if teacher else "Your teacher",
        "subject": classroom.subject,
        "batch_code": classroom.batch_code,
    }
