"""Personal analytics router."""
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Exam, ExamAttempt, PracticeAnswer, User
from ..schemas import (
    AnalyticsOut,
    HeatCell,
    TimeOfDay,
    TopicAccuracy,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/me", response_model=AnalyticsOut)
def my_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(PracticeAnswer)
        .filter(PracticeAnswer.user_id == user.id)
        .order_by(desc(PracticeAnswer.created_at))
        .limit(2000)
        .all()
    )

    total = len(rows)
    correct_total = sum(1 for r in rows if r.is_correct)
    overall = round((correct_total / total) * 100, 1) if total else 0.0
    avg_time = int(sum(r.time_taken_ms for r in rows) / total) if total else 0

    # by-section accuracy
    bucket: dict[str, dict[str, int]] = defaultdict(lambda: {"answered": 0, "correct": 0, "time": 0})
    for r in rows:
        b = bucket[r.section]
        b["answered"] += 1
        if r.is_correct:
            b["correct"] += 1
        b["time"] += r.time_taken_ms

    by_section = [
        TopicAccuracy(
            section=sec,
            answered=v["answered"],
            correct=v["correct"],
            accuracy=round((v["correct"] / v["answered"]) * 100, 1) if v["answered"] else 0.0,
            avg_time_ms=int(v["time"] / v["answered"]) if v["answered"] else 0,
        )
        for sec, v in bucket.items()
    ]
    by_section.sort(key=lambda t: t.accuracy, reverse=True)

    strongest = by_section[0].section if by_section else None
    weakest = by_section[-1].section if by_section and by_section[-1].answered >= 3 else None

    # heatmap last 84 days
    today = datetime.utcnow().date()
    start = today - timedelta(days=83)
    heat: dict[str, dict[str, int]] = defaultdict(lambda: {"answered": 0, "correct": 0})
    for r in rows:
        d = r.created_at.date()
        if d < start:
            continue
        key = d.isoformat()
        heat[key]["answered"] += 1
        if r.is_correct:
            heat[key]["correct"] += 1
    heatmap = []
    for i in range(84):
        d = (start + timedelta(days=i)).isoformat()
        cell = heat.get(d, {"answered": 0, "correct": 0})
        heatmap.append(HeatCell(date=d, answered=cell["answered"], correct=cell["correct"]))

    # time-of-day buckets
    tod_bucket: dict[int, dict[str, int]] = defaultdict(lambda: {"answered": 0, "correct": 0})
    for r in rows:
        h = r.created_at.hour
        tod_bucket[h]["answered"] += 1
        if r.is_correct:
            tod_bucket[h]["correct"] += 1
    time_of_day = [
        TimeOfDay(hour=h, answered=tod_bucket[h]["answered"], correct=tod_bucket[h]["correct"])
        for h in range(24)
    ]

    # recommended exam: pick an exam that contains the weakest section
    recommended_exam_id = None
    recommended_reason = "Try a mixed exam to calibrate."
    if weakest:
        ex = (
            db.query(Exam)
            .all()
        )
        for e in ex:
            if weakest in (e.sections or []):
                recommended_exam_id = e.id
                recommended_reason = f"Boost your weakest area: {weakest}."
                break

    total_attempts = (
        db.query(func.count(ExamAttempt.id))
        .filter(ExamAttempt.user_id == user.id)
        .scalar()
        or 0
    )

    return AnalyticsOut(
        total_practice_answers=total,
        total_exam_attempts=int(total_attempts),
        overall_accuracy=overall,
        avg_time_ms=avg_time,
        streak_days=user.streak_days,
        by_section=by_section,
        strongest_section=strongest,
        weakest_section=weakest,
        heatmap=heatmap,
        time_of_day=time_of_day,
        recommended_exam_id=recommended_exam_id,
        recommended_reason=recommended_reason,
    )
