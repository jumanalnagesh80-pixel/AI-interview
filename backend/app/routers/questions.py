from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Question
from ..schemas import QuestionOut, QuestionGenRequest

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("", response_model=list[QuestionOut])
def list_questions(
    round: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Question)
    if round:
        q = q.filter(Question.round == round)
    if difficulty:
        q = q.filter(Question.difficulty == difficulty)
    return q.limit(limit).all()


@router.post("", response_model=list[QuestionOut])
def generate_questions(payload: QuestionGenRequest, db: Session = Depends(get_db)):
    """For now: filter from local bank by round (count). LLM-ready hook can replace this."""
    q = db.query(Question).filter(Question.round == payload.round).limit(min(10, payload.count)).all()
    return q
