"""Pydantic request/response schemas."""
from datetime import datetime
from typing import Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---- auth ----
class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    name: str
    plan: str
    role: str = "user"
    xp: int
    streak_days: int
    avatar_url: str | None = None
    last_login_at: datetime | None = None
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- questions ----
class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    round: str
    text: str
    difficulty: str
    tags: list[str] = []
    expected: list[str] = []


class QuestionGenRequest(BaseModel):
    round: str = "Behavioral"
    role: str = "Software Engineer"
    company: str | None = None
    job_description: str | None = None
    count: int = 4


# ---- scoring ----
class ScoreRequest(BaseModel):
    question: str
    answer: str
    expected: list[str] = []


class ScoreOut(BaseModel):
    overall: int
    clarity: int
    relevance: int
    depth: int
    confidence: int
    structure: int
    filler_words: int
    notes: list[str]
    source: str = "local"


# ---- resume ----
class ResumeRequest(BaseModel):
    text: str = Field(min_length=30)
    target: str = "Software Engineer"


class ResumeImprovement(BaseModel):
    title: str
    detail: str
    severity: str  # low|med|high


class ResumeOut(BaseModel):
    overall: int
    ats: int
    impact: int
    clarity: int
    keywords: int
    detected_skills: list[str]
    missing_keywords: list[str]
    strengths: list[str]
    improvements: list[ResumeImprovement]
    summary: str
    source: str = "local"


# ---- sessions ----
class SessionCreate(BaseModel):
    type: str
    role: str
    company: str | None = None
    score: int = 0
    duration_sec: int = 0
    breakdown: dict[str, Any] = {}
    notes: list[str] = []


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    type: str
    role: str
    company: str | None
    score: int
    duration_sec: int
    breakdown: dict
    notes: list
    created_at: datetime


# ---- exams ----
class ExamSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    company: str | None
    category: str
    description: str
    duration_min: int
    total_questions: int
    difficulty: str
    sections: list[str]
    color: str
    icon: str


class ExamQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    section: str
    text: str
    options: list[str]
    difficulty: str


class ExamDetail(ExamSummary):
    questions: list[ExamQuestionOut]


class ExamSubmitAnswer(BaseModel):
    question_id: str
    picked: int  # -1 = unanswered
    time_taken: int = 0


class ExamSubmitRequest(BaseModel):
    answers: list[ExamSubmitAnswer]
    duration_sec: int = 0
    # Optional client-computed summary. The frontend generates questions from a
    # large deterministic bank whose ids may not exist server-side, so when these
    # are provided we trust and persist them instead of re-grading from the DB.
    client_score: int | None = None
    client_correct: int | None = None
    client_total: int | None = None
    client_section_scores: dict[str, dict[str, int]] | None = None


class ExamGradedAnswer(BaseModel):
    question_id: str
    picked: int
    correct_index: int
    is_correct: bool
    explanation: str = ""
    section: str = ""


class ExamResult(BaseModel):
    attempt_id: int | None = None  # DB id when persisted (signed-in users); null for guests
    exam_id: str | None = None
    score: int
    correct: int
    total: int
    accuracy: float
    duration_sec: int
    section_scores: dict[str, dict[str, int]]
    graded: list[ExamGradedAnswer]
    created_at: str | None = None


# ---- leaderboard ----
class LeaderboardRow(BaseModel):
    rank: int
    user_id: int
    name: str
    avatar_url: str | None
    xp: int
    sessions: int
    avg_score: int
    best_score: int


# ---- dashboard ----
class DashboardStats(BaseModel):
    readiness: int
    sessions_total: int
    sessions_week: int
    avg_score: int
    streak_days: int
    by_round: dict[str, int]
    score_trend: list[int]
    skill_radar: list[dict]
    recent: list[SessionOut]



# ---- practice / bookmarks ----
class PracticeQuestion(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    exam_id: str
    section: str
    text: str
    options: list[str]
    difficulty: str


class PracticeBatch(BaseModel):
    questions: list[PracticeQuestion]
    weakest_section: str | None = None
    target_count: int


class PracticeAnswerSubmit(BaseModel):
    question_id: str
    picked: int
    time_taken_ms: int = 0


class PracticeAnswerResult(BaseModel):
    question_id: str
    is_correct: bool
    correct_index: int
    explanation: str = ""
    streak: int
    xp_awarded: int


class BookmarkCreate(BaseModel):
    question_id: str
    note: str = ""


class BookmarkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    exam_id: str
    question_id: str
    note: str
    created_at: datetime


class BookmarkWithQuestion(BookmarkOut):
    text: str = ""
    section: str = ""
    options: list[str] = []
    correct_index: int = 0
    explanation: str = ""


# ---- analytics ----
class TopicAccuracy(BaseModel):
    section: str
    answered: int
    correct: int
    accuracy: float
    avg_time_ms: int


class HeatCell(BaseModel):
    date: str  # YYYY-MM-DD
    answered: int
    correct: int


class TimeOfDay(BaseModel):
    hour: int  # 0-23
    answered: int
    correct: int


class AnalyticsOut(BaseModel):
    total_practice_answers: int
    total_exam_attempts: int
    overall_accuracy: float
    avg_time_ms: int
    streak_days: int
    by_section: list[TopicAccuracy]
    strongest_section: str | None
    weakest_section: str | None
    heatmap: list[HeatCell]  # last 84 days
    time_of_day: list[TimeOfDay]
    recommended_exam_id: str | None
    recommended_reason: str
