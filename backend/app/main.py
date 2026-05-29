"""FastAPI entrypoint."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, engine, SessionLocal
from .routers import auth as auth_router
from .routers import questions as questions_router
from .routers import score as score_router
from .routers import resume as resume_router
from .routers import sessions as sessions_router
from .routers import exams as exams_router
from .routers import leaderboard as leaderboard_router
from .routers import dashboard as dashboard_router
from .routers import practice as practice_router
from .routers import analytics as analytics_router
from .routers import admin as admin_router
from .seed import seed
from .config import get_settings as _get_settings


def _bootstrap_owner(db) -> None:
    """Ensure the configured owner exists with role='owner'. Idempotent."""
    from .auth import hash_password
    from .models import User as _User
    s = _get_settings()
    existing = db.query(_User).filter(_User.email == s.owner_email).first()
    if existing:
        if existing.role != "owner":
            existing.role = "owner"
            db.commit()
        return
    db.add(_User(
        email=s.owner_email,
        name=s.owner_name,
        hashed_password=hash_password(s.owner_password),
        role="owner",
        plan="campus",
        xp=0,
        streak_days=0,
    ))
    db.commit()

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
        _bootstrap_owner(db)
    except Exception as e:  # don't crash if seeding fails
        print(f"[startup] seed warning: {e}")
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AceTerview API - AI interview prep + competitive exams.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "name": settings.app_name, "env": settings.environment}


@app.get("/health", tags=["health"])
def health():
    return {"ok": True}


app.include_router(auth_router.router)
app.include_router(questions_router.router)
app.include_router(score_router.router)
app.include_router(resume_router.router)
app.include_router(sessions_router.router)
app.include_router(exams_router.router)
app.include_router(leaderboard_router.router)
app.include_router(dashboard_router.router)
app.include_router(practice_router.router)
app.include_router(analytics_router.router)
app.include_router(admin_router.router)
