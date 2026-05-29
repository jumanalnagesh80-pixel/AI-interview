from fastapi import APIRouter
from ..schemas import ScoreRequest, ScoreOut
from ..scoring import score_answer

router = APIRouter(prefix="/api/score", tags=["score"])


@router.post("", response_model=ScoreOut)
def score(payload: ScoreRequest):
    out = score_answer(payload.answer, payload.expected, payload.question)
    return ScoreOut(**out, source="local")
