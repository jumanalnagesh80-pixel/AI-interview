"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  RefreshCcw,
  ListChecks,
  AlertTriangle,
  ArrowRight,
  PauseCircle,
  Lightbulb,
} from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { HoloRing } from "@/components/HoloRing";
import { ConfettiBurst, type ConfettiHandle } from "@/components/ConfettiBurst";
import { LiquidBlob } from "@/components/LiquidBlob";
import { getExam, type Exam, type ExamQuestion } from "@/lib/exams";
import { api, getStoredUser, isOnline } from "@/lib/api";
import { GuestBanner } from "@/components/GuestBanner";
import { cn } from "@/lib/utils";

type Phase = "intro" | "running" | "result";

interface Picked {
  picked: number; // -1 unanswered
  marked: boolean;
}

export default function TakeExamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const exam = getExam(params.id);

  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Picked>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);
  const [timedOut, setTimedOut] = useState(false);

  // start the timer when exam begins
  useEffect(() => {
    if (phase !== "running" || !exam) return;
    submittedRef.current = false;
    setSecondsLeft(exam.duration_min * 60);
    startedAtRef.current = Date.now();
    tickRef.current && clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      // Pure countdown only — no side effects inside the state updater.
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      tickRef.current && clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, exam?.id]);

  // Auto-submit exactly once when the clock hits zero (side effect lives here,
  // not inside the setState updater, to avoid cross-render update warnings).
  useEffect(() => {
    if (phase === "running" && secondsLeft === 0 && !submittedRef.current) {
      submittedRef.current = true;
      setTimedOut(true);
      tickRef.current && clearInterval(tickRef.current);
      setPhase("result");
    }
  }, [phase, secondsLeft]);

  if (!exam) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div className="card">
          <AlertTriangle className="mx-auto h-6 w-6 text-warn" />
          <p className="mt-3 text-sm text-white/70">Exam not found.</p>
          <Link href="/exams" className="btn-primary mt-4">
            <ArrowRight className="h-4 w-4" /> Back to exams
          </Link>
        </div>
      </div>
    );
  }

  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div className="card">
          <AlertTriangle className="mx-auto h-6 w-6 text-warn" />
          <p className="mt-3 text-sm text-white/70">This exam has no questions yet. Please try another.</p>
          <Link href="/exams" className="btn-primary mt-4">
            <ArrowRight className="h-4 w-4" /> Browse exams
          </Link>
        </div>
      </div>
    );
  }

  const totalQ = exam.questions.length;
  const q = exam.questions[current];
  const ans = answers[q.id]?.picked ?? -1;
  const marked = answers[q.id]?.marked ?? false;
  const answeredCount = Object.values(answers).filter((a) => a.picked >= 0).length;
  const markedCount = Object.values(answers).filter((a) => a.marked).length;

  const setPicked = (idx: number) =>
    setAnswers((a) => ({ ...a, [q.id]: { picked: idx, marked: a[q.id]?.marked ?? false } }));
  const toggleMark = () =>
    setAnswers((a) => ({
      ...a,
      [q.id]: { picked: a[q.id]?.picked ?? -1, marked: !(a[q.id]?.marked ?? false) },
    }));

  const goto = (idx: number) => setCurrent(Math.max(0, Math.min(totalQ - 1, idx)));

  const submitNow = () => {
    submittedRef.current = true;
    tickRef.current && clearInterval(tickRef.current);
    setPhase("result");
  };

  if (phase === "intro") {
    return <IntroScreen exam={exam} onStart={() => setPhase("running")} onBack={() => router.push("/exams")} />;
  }
  if (phase === "result") {
    return (
      <ResultScreen
        exam={exam}
        answers={answers}
        timedOut={timedOut}
        elapsedSec={Math.max(0, exam.duration_min * 60 - secondsLeft)}
        onRetry={() => {
          setAnswers({});
          setCurrent(0);
          setTimedOut(false);
          submittedRef.current = false;
          setPhase("running");
        }}
      />
    );
  }

  const sectionAnswered = (section: string) =>
    exam.questions.filter((qq) => qq.section === section && (answers[qq.id]?.picked ?? -1) >= 0).length;
  const sectionTotal = (section: string) => exam.questions.filter((qq) => qq.section === section).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/exams" className="btn-soft"><ChevronLeft className="h-3.5 w-3.5" /> Exit</Link>
          <span className="chip truncate">{exam.name}</span>
          {exam.company && <span className="chip">{exam.company}</span>}
        </div>
        <div className="flex items-center gap-2">
          <TimerPill secondsLeft={secondsLeft} totalSec={exam.duration_min * 60} />
          <button onClick={submitNow} className="btn-primary"><Send className="h-3.5 w-3.5" /> Submit</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main panel */}
        <div className="card">
          <div className="flex items-center justify-between text-xs text-white/55">
            <span>Question {current + 1} of {totalQ}</span>
            <span className="inline-flex items-center gap-2">
              <span className="chip">{q.section}</span>
              <span className="chip">{q.difficulty}</span>
            </span>
          </div>

          <h2 className="mt-3 text-lg font-medium leading-relaxed text-white/95 sm:text-xl">{q.text}</h2>

          <div className="mt-5 grid gap-2">
            {q.options.map((opt, i) => {
              const picked = ans === i;
              return (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                    picked
                      ? "border-brand-400/50 bg-brand-500/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-white/85 hover:border-white/20 hover:bg-white/[0.05]",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-medium",
                      picked ? "border-brand-300 bg-brand-500/30 text-white" : "border-white/15 text-white/55",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleMark}
                className={cn(
                  "btn-soft",
                  marked && "border-warn/40 bg-warn/15 text-warn",
                )}
              >
                <Flag className="h-3.5 w-3.5" /> {marked ? "Marked for review" : "Mark for review"}
              </button>
              <button
                onClick={() => {
                  setPicked(-1);
                  setAnswers((a) => ({ ...a, [q.id]: { picked: -1, marked: a[q.id]?.marked ?? false } }));
                }}
                className="btn-soft"
              >
                Clear answer
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => goto(current - 1)} disabled={current === 0} className="btn-ghost disabled:opacity-40">
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button onClick={() => goto(current + 1)} disabled={current === totalQ - 1} className="btn-primary disabled:opacity-40">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Side rail */}
        <aside className="space-y-4">
          {/* Progress */}
          <div className="card">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-white/45">Progress</p>
              <span className="text-xs text-white/55">
                {answeredCount}/{totalQ}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width]"
                style={{ width: `${(answeredCount / totalQ) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-1"><Flag className="h-3 w-3 text-warn" /> {markedCount} flagged</span>
            </div>
          </div>

          {/* Section meter */}
          <div className="card">
            <p className="text-xs uppercase tracking-widest text-white/45">Sections</p>
            <ul className="mt-3 space-y-2">
              {exam.sections.map((s) => {
                const a = sectionAnswered(s);
                const t = sectionTotal(s);
                return (
                  <li key={s}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/75">{s}</span>
                      <span className="text-white/45">{a}/{t}</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400" style={{ width: `${t ? (a / t) * 100 : 0}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Palette */}
          <div className="card">
            <p className="text-xs uppercase tracking-widest text-white/45">Question palette</p>
            <div className="mt-3 grid grid-cols-6 gap-1.5">
              {exam.questions.map((qq, i) => {
                const a = answers[qq.id]?.picked ?? -1;
                const isCurrent = i === current;
                const isAnswered = a >= 0;
                const isMarked = answers[qq.id]?.marked;
                return (
                  <button
                    key={qq.id}
                    onClick={() => goto(i)}
                    title={`Q${i + 1}${isMarked ? " (marked)" : ""}`}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-md text-[11px] transition",
                      isCurrent
                        ? "bg-brand-500 text-white ring-2 ring-brand-300"
                        : isMarked
                        ? "bg-warn/20 text-warn ring-1 ring-warn/40"
                        : isAnswered
                        ? "bg-success/20 text-success ring-1 ring-success/30"
                        : "bg-white/5 text-white/55 ring-1 ring-white/10 hover:bg-white/10",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-white/55">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-success/70" /> answered</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warn/70" /> flagged</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-white/30" /> blank</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- Intro ---------------- */

function IntroScreen({ exam, onStart, onBack }: { exam: Exam; onStart: () => void; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <button onClick={onBack} className="btn-soft"><ChevronLeft className="h-3.5 w-3.5" /> All exams</button>

      <div className="card mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> Mock exam</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">{exam.name}</h1>
            {exam.company && <p className="mt-1 text-sm text-white/55">Modeled after the real {exam.company} pattern.</p>}
            <p className="mt-3 max-w-xl text-white/75">{exam.description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Mini label="Questions" value={`${exam.total_questions}`} />
          <Mini label="Duration" value={`${exam.duration_min} min`} />
          <Mini label="Difficulty" value={exam.difficulty} />
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/45">Sections</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {exam.sections.map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-widest text-white/45">Rules</p>
          <ul className="mt-2 space-y-1.5 text-sm text-white/75">
            <li className="flex gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-300" /> Timer auto-submits when it reaches 00:00.</li>
            <li className="flex gap-2"><Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" /> Mark questions for review and revisit them via the palette.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Sectional + overall score is shown instantly with explanations.</li>
            <li className="flex gap-2"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-400" /> No penalty for wrong answers in this practice mode.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link href="/leaderboard" className="btn-ghost"><Trophy className="h-4 w-4" /> Leaderboard</Link>
          <button onClick={onStart} className="btn-primary"><Sparkles className="h-4 w-4" /> Start exam</button>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
      <div className="text-xl font-semibold text-gradient-accent">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}

function SaveStatus({ state }: { state: "idle" | "saving" | "saved" | "guest" | "error" }) {
  if (state === "idle") return null;
  const map = {
    saving: { cls: "border-white/10 bg-white/5 text-white/60", dot: "bg-brand-400 animate-pulse", label: "Saving attempt…" },
    saved: { cls: "border-success/30 bg-success/10 text-success", dot: "bg-success", label: "Saved to your history" },
    guest: { cls: "border-warn/30 bg-warn/10 text-warn", dot: "bg-warn", label: "Guest mode — not saved" },
    error: { cls: "border-danger/30 bg-danger/10 text-danger", dot: "bg-danger", label: "Couldn't save — shown locally" },
  } as const;
  const m = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/* ---------------- Result ---------------- */

function ResultScreen({
  exam,
  answers,
  elapsedSec,
  timedOut,
  onRetry,
}: {
  exam: Exam;
  answers: Record<string, Picked>;
  elapsedSec: number;
  timedOut?: boolean;
  onRetry: () => void;
}) {
  const totalQ = exam.questions.length;
  const graded = exam.questions.map((q) => {
    const picked = answers[q.id]?.picked ?? -1;
    return { q, picked, isCorrect: picked === q.correct_index };
  });
  const correct = graded.filter((g) => g.isCorrect).length;
  const score = totalQ ? Math.round((correct / totalQ) * 100) : 0;
  const accuracy = totalQ ? Math.round((correct / totalQ) * 1000) / 10 : 0;
  const skipped = graded.filter((g) => g.picked < 0).length;

  // Persist the attempt to the backend so it counts toward XP / leaderboard /
  // analytics — but only for signed-in users. Guests still see full results.
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "guest" | "error">("idle");
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const user = getStoredUser();
    if (!isOnline() || !user) {
      setSaveState("guest");
      return;
    }
    setSaveState("saving");
    const payload = {
      answers: exam.questions.map((q) => ({
        question_id: q.id,
        picked: answers[q.id]?.picked ?? -1,
        time_taken: 0,
      })),
      duration_sec: elapsedSec,
    };
    api
      .submitExam(exam.id, payload)
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("error"));
  }, [exam, answers, elapsedSec]);

  const sectionScores = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    for (const g of graded) {
      const s = g.q.section;
      const b = (map[s] = map[s] ?? { correct: 0, total: 0 });
      b.total += 1;
      if (g.isCorrect) b.correct += 1;
    }
    return map;
  }, [graded]);

  const fmt = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const confetti = useRef<ConfettiHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (score >= 60) {
      const t = setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        const x = rect ? rect.width / 2 : undefined;
        const y = rect ? 320 : undefined;
        confetti.current?.fire(x, y);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [score]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ConfettiBurst ref={confetti} />
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip"><CheckCircle2 className="h-3 w-3 text-success" /> Result</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">{exam.name} — calibrated</h1>
          <p className="mt-1 text-white/60">
            Solo session · {fmt(elapsedSec)} elapsed
            {timedOut && <span className="ml-2 text-warn">· auto-submitted (time up)</span>}
          </p>
          <div className="mt-2"><SaveStatus state={saveState} /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onRetry} className="btn-ghost"><RefreshCcw className="h-4 w-4" /> Retake</button>
          <Link href="/leaderboard" className="btn-primary"><Trophy className="h-4 w-4" /> Leaderboard</Link>
        </div>
      </div>

      {saveState === "guest" && (
        <div className="mt-4">
          <GuestBanner message="You're in guest mode — this attempt isn't saved. Sign in to record it to your history, XP and the leaderboard." />
        </div>
      )}

      {/* Top stats */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-1">
          <LiquidBlob
            className="-right-16 -top-16 h-56 w-56 opacity-50"
            colorFrom="#6b7eff"
            colorTo="#d946ef"
          />
          <div className="relative grid place-items-center">
            <HoloRing value={score} size={210} stroke={12} label="overall" />
          </div>
        </div>
        <div className="card grid grid-cols-2 gap-3 lg:col-span-3">
          <Stat label="Correct" value={`${correct}/${totalQ}`} tone="success" />
          <Stat label="Accuracy" value={`${accuracy}%`} tone="brand" />
          <Stat label="Skipped" value={`${skipped}`} tone={skipped ? "warn" : "success"} />
          <Stat label="Time used" value={fmt(elapsedSec)} tone="brand" />
        </div>
      </div>

      {/* Section breakdown */}
      <div className="mt-6 card">
        <p className="text-xs uppercase tracking-widest text-white/45">Sectional breakdown</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(sectionScores).map(([s, v]) => {
            const pct = Math.round((v.correct / v.total) * 100);
            return (
              <div key={s} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/85">{s}</span>
                  <span className="text-sm font-semibold text-gradient-accent">{pct}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 text-xs text-white/45">
                  {v.correct} correct / {v.total} questions
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-question review */}
      <div className="mt-6 space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/45">Question-by-question review</p>
        {graded.map((g, i) => (
          <Review key={g.q.id} index={i} q={g.q} picked={g.picked} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "brand" }: { label: string; value: string; tone?: "success" | "warn" | "brand" }) {
  const tones = {
    success: "from-success/20 to-success/0 text-success",
    warn: "from-warn/20 to-warn/0 text-warn",
    brand: "from-brand-500/20 to-brand-500/0 text-brand-200",
  } as const;
  return (
    <div className={`rounded-xl border border-white/10 bg-gradient-to-b p-4 ${tones[tone]}`}>
      <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest opacity-80">{label}</div>
    </div>
  );
}

function Review({ index, q, picked }: { index: number; q: ExamQuestion; picked: number }) {
  const correct = picked === q.correct_index;
  const skipped = picked < 0;
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        skipped
          ? "border-white/10 bg-white/[0.02]"
          : correct
          ? "border-success/20 bg-success/5"
          : "border-danger/20 bg-danger/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
            <span>Q{index + 1}</span>
            <span className="chip">{q.section}</span>
            <span className="chip">{q.difficulty}</span>
          </div>
          <p className="mt-2 text-sm text-white/95 sm:text-base">{q.text}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest",
            skipped ? "bg-white/10 text-white/55" : correct ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
          )}
        >
          {skipped ? "skipped" : correct ? "correct" : "wrong"}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct_index;
          const isPicked = i === picked;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                isCorrect
                  ? "border-success/30 bg-success/10 text-success"
                  : isPicked
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-white/10 bg-white/[0.02] text-white/70",
              )}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white/15 text-[10px]">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
              {isPicked && !isCorrect && <XCircle className="h-4 w-4 text-danger" />}
            </div>
          );
        })}
      </div>

      {q.explanation && (
        <div className="mt-3 inline-flex w-full items-start gap-2 rounded-lg border border-brand-400/20 bg-brand-500/5 p-3 text-sm text-brand-100">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <span>{q.explanation}</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Timer pill ---------------- */

function TimerPill({ secondsLeft, totalSec }: { secondsLeft: number; totalSec: number }) {
  const pct = (secondsLeft / totalSec) * 100;
  const danger = secondsLeft < 60;
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 overflow-hidden rounded-full border px-3 py-1.5 text-sm font-mono",
        danger
          ? "border-danger/40 bg-danger/15 text-danger"
          : "border-white/10 bg-white/5 text-white/85",
      )}
    >
      <Clock className={cn("h-3.5 w-3.5", danger ? "text-danger" : "text-brand-300")} />
      <span>{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>
      <span
        className={cn(
          "ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest",
          danger ? "bg-danger/30 text-white" : "bg-white/10 text-white/65",
        )}
      >
        <PauseCircle className="h-3 w-3" /> {Math.max(0, Math.round(pct))}%
      </span>
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-500 to-accent-400 transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
