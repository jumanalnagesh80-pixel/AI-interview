# AceTerview backend

FastAPI + SQLAlchemy + SQLite backend that powers the AceTerview app.

## Run locally

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# start dev server (auto-creates DB and seeds it)
uvicorn app.main:app --reload --port 8000
```

Open <http://localhost:8000/docs> for the Swagger UI.

## Database

- Defaults to SQLite (`aceterview.db` in the backend folder).
- Switch to Postgres by setting `DATABASE_URL=postgresql+psycopg://user:pw@host/db` and installing the driver.
- Seeding is **idempotent** and runs automatically on startup. You can also run it manually:

```bash
python -m app.seed
```

## Endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/questions`, `POST /api/questions`
- `POST /api/score` - heuristic answer scoring
- `POST /api/resume` - resume analysis
- `GET /api/sessions`, `POST /api/sessions`, `GET /api/sessions/{id}`
- `GET /api/exams`, `GET /api/exams/{id}`, `POST /api/exams/{id}/submit`, `GET /api/exams/{id}/attempts`
- `GET /api/leaderboard?period=all|week|month`
- `GET /api/dashboard/stats`

## Seeded content

- **Interview questions:** HR, Behavioral, Technical, System Design, Coding.
- **Competitive exams:** TCS NQT, Infosys SP/DSE, Wipro Elite NLTH, Capgemini, Cognizant GenC, Accenture Cognitive + standalone Aptitude, Logical Reasoning, Verbal English, Coding/DSA MCQ tracks.
- **Demo users** for the leaderboard so the UI looks alive on first load.

## Docker

```bash
docker build -t aceterview-api ./backend
docker run -p 8000:8000 -e JWT_SECRET=mysecret aceterview-api
```
