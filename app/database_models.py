from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, Float


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100))

    email = Column(String(100), unique=True)

    password_hash = Column(String(255))

    role = Column(String(20))


class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)

    code = Column(String(20), unique=True)

    teacher_id = Column(Integer)


class StudentDB(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer)

    classroom_id = Column(Integer)

    grade = Column(Integer)

    pace = Column(String(20))

    pace_score = Column(Float)


class Mastery(Base):
    __tablename__ = "mastery"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer)

    skill_id = Column(String(100))

    score = Column(Float)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer)

    question_id = Column(String(100))

    correct = Column(String(10))

    response_seconds = Column(Integer)