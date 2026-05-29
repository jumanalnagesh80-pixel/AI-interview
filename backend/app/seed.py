"""Idempotent DB seeder. Run via `python -m app.seed`."""
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import (
    User, Question, Exam, ExamQuestion, ExamAttempt, Session as SessionModel,
)
from .auth import hash_password
from .seed_data import INTERVIEW_QUESTIONS, EXAMS, DEMO_USERS
import random
from datetime import datetime, timedelta


def seed(db: Session) -> None:
    Base.metadata.create_all(bind=engine)

    # --- interview questions ---
    for q in INTERVIEW_QUESTIONS:
        existing = db.get(Question, q["id"])
        if existing:
            continue
        db.add(Question(
            id=q["id"], round=q["round"], text=q["text"],
            difficulty=q["difficulty"], tags=q["tags"], expected=q["expected"],
        ))

    # --- exams ---
    for ex in EXAMS:
        existing_exam = db.get(Exam, ex["id"])
        if existing_exam is None:
            existing_exam = Exam(
                id=ex["id"], name=ex["name"], company=ex.get("company"),
                category=ex["category"], description=ex["description"],
                duration_min=ex["duration_min"], total_questions=ex["total_questions"],
                difficulty=ex["difficulty"], sections=ex["sections"],
                color=ex["color"], icon=ex["icon"],
            )
            db.add(existing_exam)
            db.flush()

        # exam questions
        for q in ex["questions"]:
            if db.get(ExamQuestion, q["id"]):
                continue
            db.add(ExamQuestion(
                id=q["id"], exam_id=ex["id"], section=q["section"],
                text=q["text"], options=q["options"],
                correct_index=q["correct_index"], explanation=q.get("explanation", ""),
                difficulty=q.get("difficulty", "Medium"),
            ))

    # --- demo users for leaderboard ---
    for u in DEMO_USERS:
        if db.query(User).filter(User.email == u["email"]).first():
            continue
        user = User(
            email=u["email"], name=u["name"],
            hashed_password=hash_password("demo-password"),
            plan=u["plan"], xp=u["xp"], streak_days=u["streak_days"],
        )
        db.add(user)
        db.flush()

        # synth a few sessions per demo user
        rng = random.Random(u["email"])
        for i in range(rng.randint(4, 9)):
            db.add(SessionModel(
                user_id=user.id,
                type=rng.choice(["HR", "Behavioral", "Technical", "System Design"]),
                role=rng.choice(["Software Engineer", "Frontend Developer", "Backend Developer", "Data Scientist"]),
                score=rng.randint(60, 95),
                duration_sec=rng.randint(8, 35) * 60,
                breakdown={
                    "clarity": rng.randint(60, 95),
                    "relevance": rng.randint(60, 95),
                    "depth": rng.randint(60, 95),
                    "confidence": rng.randint(60, 95),
                    "structure": rng.randint(60, 95),
                    "filler_words": rng.randint(60, 95),
                },
                notes=[],
                created_at=datetime.utcnow() - timedelta(days=rng.randint(0, 27)),
            ))

        # synth one exam attempt per demo user
        any_exam = EXAMS[rng.randrange(len(EXAMS))]
        correct = rng.randint(int(any_exam["total_questions"] * 0.5), any_exam["total_questions"])
        score = round(correct * 100 / any_exam["total_questions"])
        db.add(ExamAttempt(
            user_id=user.id, exam_id=any_exam["id"],
            score=score, correct=correct, total=any_exam["total_questions"],
            section_scores={s: {"correct": rng.randint(2, 6), "total": 6} for s in any_exam["sections"]},
            duration_sec=any_exam["duration_min"] * 60 - rng.randint(120, 600),
            answers=[],
            created_at=datetime.utcnow() - timedelta(days=rng.randint(0, 25)),
        ))

    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        seed(db)
        print("[seed] DB seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
