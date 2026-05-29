from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Session as SessionModel
from ..schemas import LeaderboardRow

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[LeaderboardRow])
def leaderboard(
    period: str = Query(default="all", pattern="^(all|week|month)$"),
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    since: datetime | None = None
    if period == "week":
        since = datetime.utcnow() - timedelta(days=7)
    elif period == "month":
        since = datetime.utcnow() - timedelta(days=30)

    sess_q = db.query(
        SessionModel.user_id.label("uid"),
        func.count(SessionModel.id).label("sessions"),
        func.coalesce(func.avg(SessionModel.score), 0).label("avg_score"),
        func.coalesce(func.max(SessionModel.score), 0).label("best_score"),
    )
    if since is not None:
        sess_q = sess_q.filter(SessionModel.created_at >= since)
    sess_q = sess_q.group_by(SessionModel.user_id).subquery()

    rows = (
        db.query(
            User,
            func.coalesce(sess_q.c.sessions, 0).label("sessions"),
            func.coalesce(sess_q.c.avg_score, 0).label("avg_score"),
            func.coalesce(sess_q.c.best_score, 0).label("best_score"),
        )
        .outerjoin(sess_q, sess_q.c.uid == User.id)
        .order_by(desc(User.xp))
        .limit(limit)
        .all()
    )

    return [
        LeaderboardRow(
            rank=i + 1,
            user_id=u.id,
            name=u.name,
            avatar_url=u.avatar_url,
            xp=u.xp,
            sessions=int(sessions or 0),
            avg_score=int(avg or 0),
            best_score=int(best or 0),
        )
        for i, (u, sessions, avg, best) in enumerate(rows)
    ]
