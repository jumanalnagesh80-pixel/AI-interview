from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, ResumeAnalysis
from ..auth import get_optional_user
from ..schemas import ResumeRequest, ResumeOut
from ..scoring import analyze_resume

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("", response_model=ResumeOut)
def analyze(
    payload: ResumeRequest,
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    out = analyze_resume(payload.text, payload.target)
    if user:
        db.add(ResumeAnalysis(
            user_id=user.id,
            target_role=payload.target,
            overall=out["overall"],
            breakdown={
                "ats": out["ats"], "impact": out["impact"],
                "clarity": out["clarity"], "keywords": out["keywords"],
            },
            summary=out["summary"],
            detected_skills=out["detected_skills"],
            missing_keywords=out["missing_keywords"],
            improvements=out["improvements"],
        ))
        db.commit()
    return ResumeOut(**out, source="local")
