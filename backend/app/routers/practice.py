"""Adaptive practice + bookmarks router.

The practice flow is intentionally lightweight: pick a section (or "mixed"),
get a small batch of questions weighted toward your weakest section, answer
one at a time with instant feedback, and have your streak tracked.
"""
from datetime import datetime
from random import shuffle

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from ..auth import get_current_user, get_optional_user
from ..database import get_db
from ..models import Bookmark, ExamQuestion, PracticeAnswer, User
from ..schemas import (
    BookmarkCreate,
    BookmarkOut,
    BookmarkWithQuestion,
    PracticeAnswerResult,
    PracticeAnswerSubmit,
    PracticeBatch,
    PracticeQuestion,
)

router = APIRouter(prefix="/api/practice", tags=["practice"])


def _weakest_section(db: Session, user_id: int) -> str | None:
    """Return the section with the lowest accuracy across the user's recent answers,
    or None if they haven't practiced enough yet."""
    rows = (
        db.query(PracticeAnswer.section, PracticeAnswer.is_correct)
        .filter(PracticeAnswer.user_id == user_id)
        .order_by(desc(PracticeAnswer.created_at))
        .limit(200)
        .all()
    )
    if not rows:
        return None
    bucket: dict[str, list[int]] = {}
    for sec, is_correct in rows:
        bucket.setdefault(sec, [0, 0])
        bucket[sec][0] += 1  # answered
        if is_correct:
            bucket[sec][1] += 1  # correct
    scored = [(sec, c / max(1, a)) for sec, (a, c) in bucket.items() if a >= 3]
    if not scored:
        return None
    scored.sort(key=lambda x: x[1])
    return scored[0][0]


@router.get("/next", response_model=PracticeBatch)
def next_batch(
    section: str | None = Query(default=None, description="Section to target, or 'mixed'."),
    count: int = Query(default=8, ge=1, le=20),
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    weakest = _weakest_section(db, user.id) if user else None

    q = db.query(ExamQuestion)
    if section and section.lower() != "mixed":
        q = q.filter(ExamQuestion.section.ilike(section))
    elif weakest:
        # 60% of the batch from weakest section, 40% mixed
        weak_qs = (
            db.query(ExamQuestion)
            .filter(ExamQuestion.section == weakest)
            .all()
        )
        other_qs = (
            db.query(ExamQuestion)
            .filter(ExamQuestion.section != weakest)
            .all()
        )
        shuffle(weak_qs)
        shuffle(other_qs)
        target_weak = max(1, int(count * 0.6))
        picked = weak_qs[:target_weak] + other_qs[: count - target_weak]
        shuffle(picked)
        return PracticeBatch(
            questions=[PracticeQuestion.model_validate(qq) for qq in picked[:count]],
            weakest_section=weakest,
            target_count=count,
        )

    items = q.all()
    shuffle(items)
    items = items[:count]

    return PracticeBatch(
        questions=[PracticeQuestion.model_validate(qq) for qq in items],
        weakest_section=weakest,
        target_count=count,
    )


@router.post("/answer", response_model=PracticeAnswerResult)
def submit_answer(
    payload: PracticeAnswerSubmit,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.get(ExamQuestion, payload.question_id)
    if q is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")

    is_correct = payload.picked == q.correct_index

    # Compute current streak (consecutive correct answers ending at this one)
    last = (
        db.query(PracticeAnswer)
        .filter(PracticeAnswer.user_id == user.id)
        .order_by(desc(PracticeAnswer.created_at))
        .limit(40)
        .all()
    )
    streak = 0
    for row in last:
        if row.is_correct:
            streak += 1
        else:
            break
    if is_correct:
        streak += 1
    else:
        streak = 0

    db.add(
        PracticeAnswer(
            user_id=user.id,
            question_id=payload.question_id,
            section=q.section,
            picked=payload.picked,
            is_correct=is_correct,
            time_taken_ms=max(0, payload.time_taken_ms),
            streak_at_answer=streak,
        )
    )

    xp = 10 if is_correct else 1
    if is_correct and streak > 0 and streak % 5 == 0:
        xp += 15  # streak milestone bonus
    user.xp = (user.xp or 0) + xp

    db.commit()

    return PracticeAnswerResult(
        question_id=q.id,
        is_correct=is_correct,
        correct_index=q.correct_index,
        explanation=q.explanation or "",
        streak=streak,
        xp_awarded=xp,
    )


# -------- bookmarks --------


@router.get("/bookmarks", response_model=list[BookmarkWithQuestion])
def list_bookmarks(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Bookmark, ExamQuestion)
        .join(ExamQuestion, Bookmark.question_id == ExamQuestion.id)
        .filter(Bookmark.user_id == user.id)
        .order_by(desc(Bookmark.created_at))
        .limit(100)
        .all()
    )
    out: list[BookmarkWithQuestion] = []
    for bm, q in rows:
        out.append(
            BookmarkWithQuestion(
                id=bm.id,
                exam_id=bm.exam_id,
                question_id=bm.question_id,
                note=bm.note,
                created_at=bm.created_at,
                text=q.text,
                section=q.section,
                options=q.options,
                correct_index=q.correct_index,
                explanation=q.explanation,
            )
        )
    return out


@router.post("/bookmarks", response_model=BookmarkOut, status_code=status.HTTP_201_CREATED)
def add_bookmark(
    payload: BookmarkCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.get(ExamQuestion, payload.question_id)
    if q is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")

    existing = (
        db.query(Bookmark)
        .filter(Bookmark.user_id == user.id, Bookmark.question_id == payload.question_id)
        .first()
    )
    if existing:
        existing.note = payload.note or existing.note
        db.commit()
        db.refresh(existing)
        return existing

    bm = Bookmark(
        user_id=user.id,
        exam_id=q.exam_id,
        question_id=payload.question_id,
        note=payload.note,
    )
    db.add(bm)
    db.commit()
    db.refresh(bm)
    return bm


@router.delete("/bookmarks/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark(
    bookmark_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bm = db.get(Bookmark, bookmark_id)
    if bm is None or bm.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bookmark not found")
    db.delete(bm)
    db.commit()
    return None


# -------- daily challenge --------


@router.get("/daily", response_model=PracticeBatch)
def daily_challenge(db: Session = Depends(get_db)):
    """Deterministic per-day rotation: 5 questions covering all sections."""
    today = datetime.utcnow().date()
    seed = int(today.strftime("%Y%m%d"))

    sections = (
        db.query(ExamQuestion.section)
        .group_by(ExamQuestion.section)
        .all()
    )
    sections = [s[0] for s in sections]
    picks: list[ExamQuestion] = []
    for i, sec in enumerate(sections[:5]):
        rows = (
            db.query(ExamQuestion)
            .filter(ExamQuestion.section == sec)
            .all()
        )
        if not rows:
            continue
        idx = (seed + i * 31) % len(rows)
        picks.append(rows[idx])

    while len(picks) < 5:
        rows = db.query(ExamQuestion).all()
        if not rows:
            break
        picks.append(rows[(seed + len(picks)) % len(rows)])

    return PracticeBatch(
        questions=[PracticeQuestion.model_validate(q) for q in picks[:5]],
        weakest_section=None,
        target_count=5,
    )
