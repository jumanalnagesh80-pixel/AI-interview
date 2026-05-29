from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Session as SessionModel
from ..auth import get_current_user
from ..schemas import DashboardStats, SessionOut

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    week_ago = datetime.utcnow() - timedelta(days=7)

    total = db.query(func.count(SessionModel.id)).filter(SessionModel.user_id == user.id).scalar() or 0
    week = (
        db.query(func.count(SessionModel.id))
        .filter(SessionModel.user_id == user.id, SessionModel.created_at >= week_ago)
        .scalar()
        or 0
    )
    avg_score = (
        db.query(func.coalesce(func.avg(SessionModel.score), 0))
        .filter(SessionModel.user_id == user.id)
        .scalar()
        or 0
    )

    by_round_rows = (
        db.query(SessionModel.type, func.coalesce(func.avg(SessionModel.score), 0))
        .filter(SessionModel.user_id == user.id)
        .group_by(SessionModel.type)
        .all()
    )
    by_round = {r: int(s) for r, s in by_round_rows}

    trend_rows = (
        db.query(SessionModel.score)
        .filter(SessionModel.user_id == user.id)
        .order_by(SessionModel.created_at.desc())
        .limit(12)
        .all()
    )
    score_trend = list(reversed([r[0] for r in trend_rows]))

    recent = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user.id)
        .order_by(SessionModel.created_at.desc())
        .limit(6)
        .all()
    )

    # readiness = blend of avg score + streak bonus + plan boost
    readiness = min(100, int(avg_score * 0.85 + min(user.streak_days, 30) * 0.5))

    return DashboardStats(
        readiness=readiness,
        sessions_total=int(total),
        sessions_week=int(week),
        avg_score=int(avg_score),
        streak_days=user.streak_days,
        by_round=by_round,
        score_trend=score_trend,
        skill_radar=[
            {"label": "Communication", "value": int(avg_score) if avg_score else 70},
            {"label": "Technical Depth", "value": by_round.get("Technical", 70)},
            {"label": "Problem Solving", "value": by_round.get("System Design", 65)},
            {"label": "Confidence", "value": min(95, user.streak_days * 3 + 60)},
            {"label": "Structure", "value": by_round.get("Behavioral", 70)},
            {"label": "STAR Usage", "value": by_round.get("Behavioral", 65)},
        ],
        recent=[SessionOut.model_validate(s) for s in recent],
    )
