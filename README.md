# AceTerview AI

The most advanced AI interview prep platform - face-to-face AI interviews, resume analysis, voice + body language scoring, real-time feedback, and 8+ company simulators (Google, Amazon, Microsoft, Meta, TCS, Infosys, Wipro, Accenture).

## Highlights

- **Face-to-Face AI Interview** (`/interview`) - Aria, the animated AI interviewer, speaks real questions via Web Speech API, listens to you in real time, and shows live signal bars for clarity, pace, eye contact, and posture.
- **Resume Analyzer** (`/resume`) - drag-and-drop PDF/DOCX, ATS-aware scoring, missing-keyword detection per target role, prioritized action plan.
- **Mock Rounds** (`/mock`) - HR / Behavioral / Technical / System Design with STAR coaching and inline 6-axis scoring.
- **Dashboard** (`/dashboard`) - readiness score, skill radar, 12-week streak heatmap, score trend.
- **Reports** (`/reports`) - per-session breakdowns with downloadable summaries.
- **Companies** (`/companies`) - tailored loops with what-to-expect, tips, and sample questions per company.
- **Pricing** (`/pricing`) - free tier + $9 Pro + campus tier.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with custom theme (brand indigo + cyan accent, glass + gradient utilities)
- **lucide-react** icons, **framer-motion** for transitions, **clsx + tailwind-merge** for class composition
- **Web Speech API** (SpeechRecognition + speechSynthesis) for live voice interview
- **getUserMedia** for webcam capture
- **Custom SVG charts** (no chart library): ProgressRing, SparkLine, SkillRadar, StreakHeatmap

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Optional: enable real LLM scoring

The app works fully offline using built-in heuristics. To enable LLM-powered scoring and dynamic question generation, set:

```bash
OPENAI_API_KEY=sk-...
```

API routes that auto-upgrade when the key is present:

- `POST /api/score` - scores an answer.
- `POST /api/resume` - analyzes a resume against a target role.
- `POST /api/questions` - generates tailored questions for a round/role/company/JD.

If the key is missing or the LLM call fails, the routes silently fall back to local heuristics.

## Project structure

```
app/
  layout.tsx           Root layout with sticky navbar, footer, animated background
  page.tsx             Landing (hero + features + comparison + companies + testimonials)
  dashboard/page.tsx   Dashboard with charts and progress
  interview/page.tsx   Flagship face-to-face AI interview (live voice + webcam)
  mock/page.tsx        Text-based mock rounds
  resume/page.tsx      Resume analyzer
  reports/page.tsx     Detailed reports with export
  companies/page.tsx   Per-company simulators
  pricing/page.tsx     Pricing + FAQ
  api/
    questions/route.ts
    score/route.ts
    resume/route.ts

components/
  AIAvatar.tsx         Animated talking AI avatar
  WebcamPanel.tsx      getUserMedia preview with status overlay
  ProgressRing.tsx     Gradient SVG progress ring
  SparkLine.tsx        Smoothed gradient line chart
  SkillRadar.tsx       SVG hexagon radar
  StreakHeatmap.tsx    GitHub-style streak grid
  Navbar.tsx, Footer.tsx, Logo.tsx, BackgroundFX.tsx, SectionHeader.tsx, StatCard.tsx

lib/
  data.ts              Question bank, companies, sessions, testimonials
  scoring.ts           Local heuristic scorer (clarity / relevance / depth / etc)
  speech.ts            Web Speech API wrappers (TTS + STT) with fallbacks
  utils.ts             cn(), clamp, pct
```

## Browser support for the live interview

Real-time voice features (TTS + STT) work best in Chromium-based browsers (Chrome, Edge, Brave) and Safari. If unsupported, the UI gracefully falls back to a text input and silent question display.

Webcam capture uses standard `getUserMedia` and works wherever camera access is granted. Video and audio are processed in the browser only - nothing is uploaded.

## License

MIT.
