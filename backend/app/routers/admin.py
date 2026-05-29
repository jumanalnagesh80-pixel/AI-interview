"""Admin-only router — restricted to users with role in {admin, owner}."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from ..auth import get_admin_user
from ..config import get_settings
from ..database import get_db
from ..models import (
    Bookmark,
    Exam,
    ExamAttempt,
    PracticeAnswer,
    Session as SessionModel,
    User,
)
from ..schemas import UserOut

router = APIRouter(prefix="/api/admin", tags=["admin"])
settings = get_settings()


@router.get("/overview")
def overview(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    week_ago = datetime.utcnow() - timedelta(days=7)
    return {
        "owner": {"name": settings.owner_name, "email": settings.owner_email},
        "totals": {
            "users": db.query(func.count(User.id)).scalar() or 0,
            "admins": db.query(func.count(User.id)).filter(User.role.in_(["admin", "owner"])).scalar() or 0,
            "exam_attempts": db.query(func.count(ExamAttempt.id)).scalar() or 0,
            "interview_sessions": db.query(func.count(SessionModel.id)).scalar() or 0,
            "practice_answers": db.query(func.count(PracticeAnswer.id)).scalar() or 0,
            "bookmarks": db.query(func.count(Bookmark.id)).scalar() or 0,
            "exams": db.query(func.count(Exam.id)).scalar() or 0,
        },
        "this_week": {
            "new_users": db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar() or 0,
            "exam_attempts": db.query(func.count(ExamAttempt.id)).filter(ExamAttempt.created_at >= week_ago).scalar() or 0,
            "interview_sessions": db.query(func.count(SessionModel.id)).filter(SessionModel.created_at >= week_ago).scalar() or 0,
            "practice_answers": db.query(func.count(PracticeAnswer.id)).filter(PracticeAnswer.created_at >= week_ago).scalar() or 0,
        },
    }


@router.get("/users", response_model=list[UserOut])
def list_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).order_by(desc(User.xp)).limit(200).all()


@router.post("/users/{user_id}/promote", response_model=UserOut)
def promote(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    if admin.role != "owner":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the owner can change roles")
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if target.role == "owner":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot change owner role")
    target.role = "admin"
    db.commit()
    db.refresh(target)
    return target


@router.post("/users/{user_id}/demote", response_model=UserOut)
def demote(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    if admin.role != "owner":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the owner can change roles")
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if target.role == "owner":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot demote owner")
    target.role = "user"
    db.commit()
    db.refresh(target)
    return target


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    if admin.role != "owner":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the owner can delete users")
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if target.role == "owner":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot delete owner")
    db.delete(target)
    db.commit()
    return None


@router.get("/recent-attempts")
def recent_attempts(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    rows = (
        db.query(ExamAttempt, User, Exam)
        .join(User, ExamAttempt.user_id == User.id)
        .join(Exam, ExamAttempt.exam_id == Exam.id)
        .order_by(desc(ExamAttempt.created_at))
        .limit(40)
        .all()
    )
    return [
        {
            "id": a.id,
            "user_name": u.name,
            "user_email": u.email,
            "exam_name": e.name,
            "exam_id": e.id,
            "score": a.score,
            "correct": a.correct,
            "total": a.total,
            "duration_sec": a.duration_sec,
            "created_at": a.created_at.isoformat(),
        }
        for a, u, e in rows
    ]
