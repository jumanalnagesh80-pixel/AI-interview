from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import User, Exam, ExamQuestion, ExamAttempt
from ..auth import get_current_user, get_optional_user
from ..schemas import (
    ExamSummary,
    ExamDetail,
    ExamQuestionOut,
    ExamSubmitRequest,
    ExamGradedAnswer,
    ExamResult,
)

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.get("", response_model=list[ExamSummary])
def list_exams(category: str | None = Query(default=None), db: Session = Depends(get_db)):
    q = db.query(Exam)
    if category:
        q = q.filter(Exam.category == category)
    return q.order_by(Exam.category, Exam.name).all()


@router.get("/{exam_id}", response_model=ExamDetail)
def get_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exam not found")
    questions = [ExamQuestionOut.model_validate(q) for q in exam.questions]
    return ExamDetail(**ExamSummary.model_validate(exam).model_dump(), questions=questions)


@router.post("/{exam_id}/submit", response_model=ExamResult)
def submit_exam(
    exam_id: str,
    payload: ExamSubmitRequest,
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exam not found")

    qmap = {q.id: q for q in exam.questions}
    graded: list[ExamGradedAnswer] = []
    correct = 0
    section_scores: dict[str, dict[str, int]] = {}

    for ans in payload.answers:
        q = qmap.get(ans.question_id)
        if q is None:
            continue
        is_correct = ans.picked == q.correct_index
        graded.append(ExamGradedAnswer(
            question_id=q.id,
            picked=ans.picked,
            correct_index=q.correct_index,
            is_correct=is_correct,
            explanation=q.explanation,
            section=q.section,
        ))
        bucket = section_scores.setdefault(q.section, {"correct": 0, "total": 0})
        bucket["total"] += 1
        if is_correct:
            bucket["correct"] += 1
            correct += 1

    total = len(qmap)
    score = round(correct * 100 / total) if total else 0
    accuracy = round(correct / total * 100, 1) if total else 0.0

    if user:
        db.add(ExamAttempt(
            user_id=user.id, exam_id=exam_id,
            score=score, correct=correct, total=total,
            section_scores=section_scores,
            duration_sec=payload.duration_sec,
            answers=[g.model_dump() for g in graded],
        ))
        user.xp += max(20, score // 4)
        db.commit()

    return ExamResult(
        score=score, correct=correct, total=total,
        accuracy=accuracy, duration_sec=payload.duration_sec,
        section_scores=section_scores, graded=graded,
    )


@router.get("/{exam_id}/attempts", response_model=list[dict])
def my_attempts(exam_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(ExamAttempt)
        .filter(ExamAttempt.user_id == user.id, ExamAttempt.exam_id == exam_id)
        .order_by(desc(ExamAttempt.created_at))
        .limit(20)
        .all()
    )
    return [
        {
            "id": r.id,
            "score": r.score,
            "correct": r.correct,
            "total": r.total,
            "duration_sec": r.duration_sec,
            "section_scores": r.section_scores,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
