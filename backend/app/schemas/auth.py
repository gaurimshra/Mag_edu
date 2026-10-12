"""
Pydantic schemas for Auth routes (request/response validation).
"""

from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student
    batch_code: str | None = None   # required for students; skipped for teachers

    @field_validator("password")
    @classmethod
    def password_strong_enough(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class DemoLoginRequest(BaseModel):
    role: str = "student"  # "student" | "teacher"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: str
    classroom_id: int | None = None


class MeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    avatar_url: str | None = None
    classroom_id: int | None = None
