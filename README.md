# AceTerview AI

The most advanced AI interview prep platform — face-to-face AI interviews, resume analysis, voice + body language scoring, real-time feedback, **competitive-exam mocks (TCS NQT, Infosys, Wipro, Capgemini, Cognizant, Accenture)**, leaderboard, and a full Python FastAPI backend with SQLite.

## Surfaces

| Route | What's there |
|---|---|
| `/` | Landing — animated AI hero, animated counters, infinite companies marquee, exam banner, comparison vs other AI sites |
| `/interview` | Flagship: face-to-face AI interview (real webcam + Web Speech API STT/TTS, live signals) |
| `/exams` | Competitive-exam hub with category filters, search, gradient cards |
| `/exams/[id]` | Timed mock exam with question palette, mark-for-review, sectional + per-question result review with explanations |
| `/leaderboard` | Top-3 podium + full ranking table with XP, sessions, avg/best score, trend |
| `/dashboard` | Readiness ring, score trend, skill radar, streak heatmap, recent sessions |
| `/resume` | ATS-aware resume analyzer with prioritised action plan |
| `/mock` | HR / Behavioral / Technical / System Design rounds with STAR coaching |
| `/reports` | Per-session detailed reports with downloadable export |
| `/companies` | Per-company simulators (Google, Amazon, Microsoft, Meta, TCS, Infosys, Wipro, Accenture) |
| `/pricing` | Free / $9 Pro / Campus tiers + FAQ |
| `/login`, `/signup` | Unified auth experience: animated tab pill, canvas particle background, glassmorphic card with rotating conic border, floating-label inputs, password strength meter, social buttons, success burst animation, rotating testimonial showcase |

## Tech stack

**Frontend** — Next.js 14 (App Router) + TypeScript + Tailwind CSS with custom dark theme, Lucide icons, framer-motion (installed), Web Speech API + getUserMedia for face-to-face mode, custom SVG charts (no chart library).

**Backend** — Python 3.12 + FastAPI + SQLAlchemy 2 + SQLite (Postgres-ready), JWT auth (passlib + bcrypt + python-jose), Pydantic v2 schemas, Docker support.

## One-command quick start

The repo ships with **three different "single command" ways** to run the whole stack — pick whichever fits your environment.

### 1. Bash bootstrap (zero ceremony)

```bash
./start.sh
```

It installs frontend deps if needed, creates the Python venv for the backend, writes `.env.local` pointing at the local API, and runs both processes side-by-side with `concurrently`. Frontend at http://localhost:3000, API + Swagger at http://localhost:8000/docs.

### 2. NPM script

```bash
npm install
npm run backend:install        # one-time pip install
npm run dev:all                # web + api together with colored prefixes
```

Other scripts available: `npm run dev`, `npm run backend:dev`, `npm run start:all`.

### 3. Docker Compose (single command, production-ready)

```bash
docker compose up --build
```

Brings up `aceterview-api` (FastAPI on :8000) and `aceterview-web` (Next.js on :3000) on a shared network. SQLite data persists in a named volume. The web service waits for the API healthcheck before starting.

---

### Backend solo

```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

uvicorn app.main:app --reload --port 8000   # http://localhost:8000/docs
```

### Frontend solo

```bash
npm install
npm run dev          # http://localhost:3000
```

The frontend wires itself to the backend when `NEXT_PUBLIC_API_URL` is set in `.env.local`. If the var is missing or the API is unreachable, the UI silently falls back to local data + `localStorage` — no demo path is ever broken.

## Backend endpoints

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/questions` · `POST /api/questions`
- `POST /api/score` — heuristic answer scoring (LLM-ready hook)
- `POST /api/resume` — ATS resume analysis
- `GET /api/sessions` · `POST /api/sessions` · `GET /api/sessions/{id}`
- `GET /api/exams` · `GET /api/exams/{id}` · `POST /api/exams/{id}/submit` · `GET /api/exams/{id}/attempts`
- `GET /api/leaderboard?period=all|week|month`
- `GET /api/dashboard/stats`

Full Swagger UI at <http://localhost:8000/docs>.

## Seeded content

- **Interview questions:** HR, Behavioral, Technical, System Design, Coding rounds.
- **Competitive exams:** TCS NQT, Infosys SP/DSE, Wipro Elite NLTH, Capgemini, Cognizant GenC, Accenture Cognitive, plus standalone tracks for Quantitative Aptitude, Logical Reasoning, Verbal English, Coding & DSA MCQ — **10 exams, ~160 MCQs total** with explanations.
- **10 demo users** (Priya R., Arjun S., Mei L., Karan P., Diego M., Sara K., Ananya B., Ravi T., Lin C., Noor A.) with synthetic sessions so the leaderboard is alive on first load.

## Project structure

```
.
├─ start.sh                  # one-command bootstrapper (web + api)
├─ docker-compose.yml        # production: docker compose up --build
├─ Dockerfile                # frontend image (multi-stage Node 22 alpine)
│
├─ app/                      # Next.js App Router
│  ├─ layout.tsx, page.tsx   # Root + landing
│  ├─ dashboard/ interview/ mock/ resume/ reports/ companies/ pricing/
│  ├─ exams/ exams/[id]/     # Competitive exams hub + taker
│  ├─ leaderboard/ login/ signup/
│  └─ api/                   # Local Next API fallback (questions, score, resume)
│
├─ components/
│  ├─ auth/                  # Unified auth experience
│  │  ├─ AuthLayout.tsx      # Split-screen + ParticleField backdrop
│  │  ├─ AuthCard.tsx        # Tabs, floating-label fields, validation, submit
│  │  ├─ ParticleField.tsx   # Canvas connection-graph background
│  │  ├─ Showcase.tsx        # Right-side rotating testimonials + AI avatar
│  │  └─ SocialButtons.tsx   # Google + GitHub buttons (visual)
│  └─ AIAvatar, WebcamPanel, ProgressRing, SparkLine, SkillRadar,
│     StreakHeatmap, AnimatedCounter, Navbar, Footer, BackgroundFX, Logo
│
├─ lib/
│  ├─ data.ts                # Question bank, companies, sessions, testimonials
│  ├─ exams.ts               # 10 competitive exams (mirror of backend seed)
│  ├─ leaderboard.ts         # Demo leaderboard rows for offline mode
│  ├─ api.ts                 # Backend client + JWT in localStorage + offline detect
│  └─ scoring.ts, speech.ts, utils.ts
│
└─ backend/                  # FastAPI + SQLAlchemy + SQLite
   ├─ Dockerfile, requirements.txt, README.md, .env.example
   └─ app/
      ├─ main.py, config.py, database.py, models.py, schemas.py
      ├─ auth.py, scoring.py, seed.py, seed_data.py
      └─ routers/
         auth.py, questions.py, score.py, resume.py, sessions.py,
         exams.py, leaderboard.py, dashboard.py
```

## Optional: enable LLM scoring

Both the Next.js API routes and the FastAPI `score` / `resume` / `questions` endpoints upgrade automatically when `OPENAI_API_KEY` is set. Otherwise they use local heuristics.

## Browser support for the live interview

Voice features (TTS + STT) work best in Chromium-based browsers and Safari. If unsupported, the UI gracefully falls back to a text input. Webcam capture uses standard `getUserMedia` and works wherever camera access is granted. Video and audio are processed in the browser only — nothing is uploaded.

## License

MIT.
