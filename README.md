# PrepMate AI

The most advanced AI interview prep platform — face-to-face AI interviews, resume analysis, voice + body language scoring, real-time feedback, **adaptive practice**, **personal analytics**, **a complete catalog of Indian competitive exams (UPSC, SSC, IBPS, SBI, RBI, NABARD, RRB, NDA, CDS, CAT, GATE)**, leaderboard, and a full Python FastAPI backend with SQLite.

> Built and owned by **NAGESH JUMANAL**.

## Surfaces

| Route | What's there |
|---|---|
| `/` | Landing — animated AI hero, animated counters, infinite companies marquee, exam banner, **practice + analytics promo**, comparison vs other AI sites |
| `/interview` | Flagship: face-to-face AI interview with **AceFace** humanoid avatar (eyes that follow your cursor, blinking, lip-syncing mouth, eyebrows, breathing). **Always-on listening** auto-submits when you stop speaking for ~2.5s |
| `/practice` | Adaptive practice with topic picker, instant feedback + explanations, streak counter with confetti burst, +25 XP at every 5-streak milestone, bookmark for later |
| `/analytics` | HoloRing overall accuracy, 4 stat cards, strongest/focus/recommended Tilt3D cards, topic accuracy bars, weekly trend, 12-week heatmap, 24-hour time-of-day chart |
| `/exams` | Competitive-exam hub with 11 categories. **Indian exams included:** UPSC CSE Prelims, SSC CGL/CHSL/GD, IBPS PO/Clerk, SBI PO, RBI Grade B, NABARD, RRB NTPC/Group D, NDA, CDS, CAT, GATE CSE + standalone GK/Science/Banking/Computer Awareness mocks. **Plus** TCS NQT, Infosys, Wipro, Capgemini, Cognizant, Accenture |
| `/exams/[id]` | Timed mock exam with palette, mark-for-review, **HoloRing result with confetti burst**, sectional breakdown, per-question review with explanations |
| `/leaderboard` | Top-3 podium + full ranking table |
| `/dashboard` | Readiness ring, score trend, skill radar, streak heatmap, recent sessions |
| `/admin` | **Owner-only**. Admin channel with engagement HoloRing, 6 totals/weekly stat cards, recent attempts table, quick links |
| `/admin/users` | **Owner-only**. Promote / demote / remove users, role badges, search |
| `/resume`, `/mock`, `/reports`, `/companies`, `/pricing` | Resume analyzer, text-mock rounds, reports with export, per-company simulators, pricing |
| `/login`, `/signup` | Unified auth with animated tab pill, particle background, glassmorphic card, floating-label inputs, password strength meter |

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

## Owner / Admin

The platform recognises a single **owner** account with full admin powers. By default, that's:

- **Name:** `NAGESH JUMANAL`
- **Email:** `nagesh.jumanal@aceterview.app`
- **Password:** `ChangeMeOwner!2026` (override via `OWNER_PASSWORD` in `backend/.env`)

The owner is **bootstrapped automatically** the first time the backend starts (idempotent — won't duplicate). Sign in with that email + password to see the **Admin** link appear in the navbar (with a crown icon).

The owner can:
- View `/admin` — engagement HoloRing, totals + this-week deltas, recent attempts feed
- Visit `/admin/users` — search, promote a user to admin, demote back, or delete an account
- Promote other accounts to admin (admins get read-only `/admin` access)

Edit `backend/.env` to change the bootstrapped owner's name / email / password before first launch.

## Database file

SQLite database file is **`backend/nagesh_aceterview.db`** by default (configurable via `DATABASE_URL`). The database is rebuilt and seeded on every fresh start.

## Backend endpoints

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/questions` · `POST /api/questions`
- `POST /api/score` — heuristic answer scoring (LLM-ready hook)
- `POST /api/resume` — ATS resume analysis
- `GET /api/sessions` · `POST /api/sessions` · `GET /api/sessions/{id}`
- `GET /api/exams` · `GET /api/exams/{id}` · `POST /api/exams/{id}/submit` · `GET /api/exams/{id}/attempts`
- `GET /api/leaderboard?period=all|week|month`
- `GET /api/dashboard/stats`
- **`GET /api/practice/next?section=&count=`** — adaptive batch (auto-biases toward your weakest section)
- **`POST /api/practice/answer`** — submit one answer, returns is_correct, explanation, current streak, xp_awarded
- **`GET /api/practice/daily`** — 5-question deterministic daily challenge
- **`GET /api/practice/bookmarks` · `POST /api/practice/bookmarks` · `DELETE /api/practice/bookmarks/{id}`**
- **`GET /api/analytics/me`** — personal accuracy by section, 84-day heatmap, time-of-day, strongest/weakest, recommended exam

- **`GET /api/admin/overview`** — owner block, totals, weekly deltas
- **`GET /api/admin/users`** — list all users
- **`POST /api/admin/users/{id}/promote`** — make admin (owner only)
- **`POST /api/admin/users/{id}/demote`** — revoke admin (owner only)
- **`DELETE /api/admin/users/{id}`** — remove user (owner only)
- **`GET /api/admin/recent-attempts`** — latest 40 exam attempts platform-wide

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
│  ├─ practice/ analytics/   # Adaptive practice + personal analytics
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
│  ├─ HoloRing.tsx           # Holographic score ring (rotating halo + orbits + count-up)
│  ├─ Tilt3D.tsx             # Mouse-tracked 3D tilt wrapper with optional glare
│  ├─ ConfettiBurst.tsx      # Imperative CSS confetti, 28 particles per .fire()
│  ├─ LiquidBlob.tsx         # Animated SVG blob morph for accents
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
         exams.py, leaderboard.py, dashboard.py,
         practice.py, analytics.py
```

## Optional: enable LLM scoring

Both the Next.js API routes and the FastAPI `score` / `resume` / `questions` endpoints upgrade automatically when `OPENAI_API_KEY` is set. Otherwise they use local heuristics.

## Browser support for the live interview

Voice features (TTS + STT) work best in Chromium-based browsers and Safari. If unsupported, the UI gracefully falls back to a text input. Webcam capture uses standard `getUserMedia` and works wherever camera access is granted. Video and audio are processed in the browser only — nothing is uploaded.

## License

MIT.
