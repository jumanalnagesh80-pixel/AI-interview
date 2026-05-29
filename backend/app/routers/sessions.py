from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Session as SessionModel
from ..auth import get_current_user
from ..schemas import SessionCreate, SessionOut

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionOut])
def list_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user.id)
        .order_by(SessionModel.created_at.desc())
        .limit(50)
        .all()
    )
    return rows


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = SessionModel(
        user_id=user.id,
        type=payload.type,
        role=payload.role,
        company=payload.company,
        score=payload.score,
        duration_sec=payload.duration_sec,
        breakdown=payload.breakdown,
        notes=payload.notes,
    )
    db.add(row)
    user.xp += max(10, payload.score // 5)  # gamification: XP per session
    db.commit()
    db.refresh(row)
    return row


@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.get(SessionModel, session_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return row
