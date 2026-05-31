"""ORM models."""
from datetime import datetime
from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    Text,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(String(20), default="free")  # free / pro / campus
    role: Mapped[str] = mapped_column(String(20), default="user", index=True)  # user / admin / owner
    xp: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sessions: Mapped[list["Session"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    exam_attempts: Mapped[list["ExamAttempt"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    round: Mapped[str] = mapped_column(String(40), index=True)  # HR / Behavioral / Technical / System Design / Coding
    text: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(10), default="Medium")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    expected: Mapped[list] = mapped_column(JSON, default=list)
    role: Mapped[str | None] = mapped_column(String(80), nullable=True)
    company: Mapped[str | None] = mapped_column(String(80), nullable=True)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    type: Mapped[str] = mapped_column(String(40))  # round
    role: Mapped[str] = mapped_column(String(80))
    company: Mapped[str | None] = mapped_column(String(80), nullable=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    duration_sec: Mapped[int] = mapped_column(Integer, default=0)
    breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    notes: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user: Mapped[User] = relationship(back_populates="sessions")
    answers: Mapped[list["Answer"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), index=True)
    question_id: Mapped[str] = mapped_column(String(40))
    question_text: Mapped[str] = mapped_column(Text)
    answer_text: Mapped[str] = mapped_column(Text)
    score: Mapped[int] = mapped_column(Integer, default=0)
    breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    duration_sec: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped[Session] = relationship(back_populates="answers")


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    company: Mapped[str | None] = mapped_column(String(80), nullable=True)
    category: Mapped[str] = mapped_column(String(60), index=True)  # placement / aptitude / coding / verbal / reasoning
    description: Mapped[str] = mapped_column(Text, default="")
    duration_min: Mapped[int] = mapped_column(Integer, default=30)
    total_questions: Mapped[int] = mapped_column(Integer, default=20)
    difficulty: Mapped[str] = mapped_column(String(10), default="Medium")
    sections: Mapped[list] = mapped_column(JSON, default=list)  # ["Quantitative","Logical",...]
    color: Mapped[str] = mapped_column(String(60), default="from-brand-500 to-accent-500")
    icon: Mapped[str] = mapped_column(String(40), default="Building2")

    questions: Mapped[list["ExamQuestion"]] = relationship(back_populates="exam", cascade="all, delete-orphan")


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    exam_id: Mapped[str] = mapped_column(ForeignKey("exams.id"), index=True)
    section: Mapped[str] = mapped_column(String(60), index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list] = mapped_column(JSON, default=list)  # list[str]
    correct_index: Mapped[int] = mapped_column(Integer, default=0)
    explanation: Mapped[str] = mapped_column(Text, default="")
    difficulty: Mapped[str] = mapped_column(String(10), default="Medium")

    exam: Mapped[Exam] = relationship(back_populates="questions")


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    exam_id: Mapped[str] = mapped_column(ForeignKey("exams.id"), index=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    correct: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    section_scores: Mapped[dict] = mapped_column(JSON, default=dict)
    duration_sec: Mapped[int] = mapped_column(Integer, default=0)
    answers: Mapped[list] = mapped_column(JSON, default=list)  # [{question_id, picked, correct, ...}]
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user: Mapped[User] = relationship(back_populates="exam_attempts")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    target_role: Mapped[str] = mapped_column(String(120))
    overall: Mapped[int] = mapped_column(Integer, default=0)
    breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    summary: Mapped[str] = mapped_column(Text, default="")
    detected_skills: Mapped[list] = mapped_column(JSON, default=list)
    missing_keywords: Mapped[list] = mapped_column(JSON, default=list)
    improvements: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


Index("ix_sessions_user_created", Session.user_id, Session.created_at.desc())
Index("ix_attempts_user_score", ExamAttempt.user_id, ExamAttempt.score.desc())



class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    exam_id: Mapped[str] = mapped_column(ForeignKey("exams.id"), index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("exam_questions.id"), index=True)
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class PracticeAnswer(Base):
    """Individual answers in adaptive practice mode (untimed, instant-feedback)."""

    __tablename__ = "practice_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("exam_questions.id"), index=True)
    section: Mapped[str] = mapped_column(String(60), index=True)
    picked: Mapped[int] = mapped_column(Integer, default=-1)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    time_taken_ms: Mapped[int] = mapped_column(Integer, default=0)
    streak_at_answer: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


Index("ix_bookmarks_user_question", Bookmark.user_id, Bookmark.question_id, unique=True)
Index("ix_practice_user_section_time", PracticeAnswer.user_id, PracticeAnswer.section, PracticeAnswer.created_at.desc())
