"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  CheckCircle2,
  Sparkles,
  Trophy,
  AlertTriangle,
  ArrowRight,
  PauseCircle,
  Lightbulb,
  Loader2,
  RotateCcw,
  X,
  Eraser,
} from "lucide-react";
import { getExam, type Exam } from "@/lib/exams";
import { api, getStoredUser, isOnline } from "@/lib/api";
import { useExamSession } from "@/hooks/useExamSession";
import { gradeExam, formatClock } from "@/lib/examScoring";
import { loadSession, saveAttempt, type StoredAttempt } from "@/lib/examSession";
import { useToast } from "@/components/Toast";
import { GuestBanner } from "@/components/GuestBanner";
import { cn } from "@/lib/utils";

export default function TakeExamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const exam = getExam(params.id);
  const user = getStoredUser();

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onTimeout = () => {
    toast.warning("Time's up — submitting your exam.", 3000);
    void doSubmit(true);
  };

  const session = useExamSession(exam, user?.id ?? null, onTimeout);

  // ----- error states (invalid id / missing / empty) -----
  if (!exam) {
    return (
      <ErrorCard
        title="Exam not found"
        message={`We couldn't find an exam with id "${params.id}". It may have been moved or renamed.`}
      />
    );
  }
  if (!exam.questions || exam.questions.length === 0) {
    return <ErrorCard title="No questions yet" message="This exam has no questions yet. Please try another." />;
  }

  const totalQ = exam.questions.length;
  const q = exam.questions[session.current];

  /** Grade locally, persist to storage + backend, then route to the results page. */
  async function doSubmit(viaTimeout = false) {
    if (!exam || submitting) return;
    setSubmitting(true);
    setShowConfirm(false);

    const { startedAt, durationSec, timedOut } = session.finalize();
    const result = gradeExam(exam, session.answers);

    let serverAttemptId: number | null = null;
    if (isOnline() && user) {
      try {
        const sectionScores = Object.fromEntries(
          result.sectionScores.map((s) => [s.section, { correct: s.correct, total: s.total }]),
        );
        const res = await api.submitExam(exam.id, {
          answers: exam.questions.map((qq) => ({
            question_id: qq.id,
            picked: session.answers[qq.id]?.picked ?? -1,
            time_taken: 0,
          })),
          duration_sec: durationSec,
          // Send the client-computed result — the bank's question ids aren't in
          // the DB, so the server trusts this summary for XP / leaderboard / admin.
          client_score: result.score,
          client_correct: result.correct,
          client_total: result.total,
          client_section_scores: sectionScores,
        });
        serverAttemptId = typeof res?.attempt_id === "number" ? res.attempt_id : null;
      } catch {
        // Network failure shouldn't lose the candidate's work — we still have the
        // full local snapshot, so we proceed to the local results page.
        toast.error("Couldn't sync to server — showing your results locally.", 4000);
      }
    }

    const attemptId = session.attemptId ?? `att_${Date.now()}`;
    const stored: StoredAttempt = {
      attemptId,
      serverAttemptId,
      examId: exam.id,
      examName: exam.name,
      examCompany: exam.company,
      userId: user?.id ?? null,
      startedAt,
      submittedAt: Date.now(),
      durationSec,
      totalSec: exam.duration_min * 60,
      timedOut: timedOut || viaTimeout,
      result,
    };
    saveAttempt(stored);
    session.discard();

    if (!viaTimeout) toast.success("Exam submitted — calculating your score…", 2500);
    router.push(`/results/${attemptId}`);
  }

  // ----- intro screen -----
  if (session.status === "idle") {
    return (
      <IntroScreen
        exam={exam}
        hasResumable={session.restored}
        onBegin={() => session.begin({ resume: false })}
        onResume={() => session.begin({ resume: true })}
        onBack={() => router.push("/exams")}
        isGuest={!user}
      />
    );
  }

  // ----- running / submitting screen -----
  const ans = session.answers[q.id]?.picked ?? -1;
  const marked = session.answers[q.id]?.marked ?? false;
  const sectionAnswered = (s: string) =>
    exam.questions.filter((qq) => qq.section === s && (session.answers[qq.id]?.picked ?? -1) >= 0).length;
  const sectionTotal = (s: string) => exam.questions.filter((qq) => qq.section === s).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button onClick={() => router.push("/exams")} className="btn-soft">
            <ChevronLeft className="h-3.5 w-3.5" /> Exit
          </button>
          <span className="chip truncate">{exam.name}</span>
          {exam.company && <span className="chip">{exam.company}</span>}
        </div>
        <div className="flex items-center gap-2">
          <TimerPill secondsLeft={session.secondsLeft} totalSec={exam.duration_min * 60} />
          <button onClick={() => setShowConfirm(true)} disabled={submitting} className="btn-primary disabled:opacity-60">
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Submit
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main panel */}
        <div className="card">
          <div className="flex items-center justify-between text-xs text-white/55">
            <span>Question {session.current + 1} of {totalQ}</span>
            <span className="inline-flex items-center gap-2">
              <span className="chip">{q.section}</span>
              <span className="chip">{q.difficulty}</span>
            </span>
          </div>

          <h2 className="mt-3 text-lg font-medium leading-relaxed text-white/95 sm:text-xl">{q.text}</h2>

          <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Answer options">
            {q.options.map((opt, i) => {
              const picked = ans === i;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={picked}
                  onClick={() => session.selectOption(q.id, i)}
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
                onClick={() => session.toggleMark(q.id)}
                className={cn("btn-soft", marked && "border-warn/40 bg-warn/15 text-warn")}
              >
                <Flag className="h-3.5 w-3.5" /> {marked ? "Marked for review" : "Mark for review"}
              </button>
              <button onClick={() => session.clearResponse(q.id)} className="btn-soft">
                <Eraser className="h-3.5 w-3.5" /> Clear response
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={session.prev} disabled={session.current === 0} className="btn-ghost disabled:opacity-40">
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              {session.current === totalQ - 1 ? (
                <button onClick={() => setShowConfirm(true)} className="btn-primary">
                  <Send className="h-3.5 w-3.5" /> Review &amp; submit
                </button>
              ) : (
                <button onClick={session.next} className="btn-primary">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side rail */}
        <aside className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-white/45">Progress</p>
              <span className="text-xs text-white/55">{session.counts.answered}/{totalQ}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width]"
                style={{ width: `${(session.counts.answered / totalQ) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-white/55">
              <span className="inline-flex items-center gap-1"><Flag className="h-3 w-3 text-warn" /> {session.counts.marked} flagged</span>
              <span>{session.counts.unanswered} left</span>
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
                const a = session.answers[qq.id]?.picked ?? -1;
                const isCurrent = i === session.current;
                const isAnswered = a >= 0;
                const isMarked = session.answers[qq.id]?.marked;
                return (
                  <button
                    key={qq.id}
                    onClick={() => session.setCurrent(i)}
                    aria-label={`Go to question ${i + 1}${isMarked ? " (marked for review)" : ""}${isAnswered ? " (answered)" : ""}`}
                    aria-current={isCurrent}
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

      {/* Submit confirmation modal */}
      {showConfirm && (
        <ConfirmModal
          counts={session.counts}
          submitting={submitting}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => void doSubmit(false)}
        />
      )}
    </div>
  );
}

/* ---------------- Intro ---------------- */

function IntroScreen({
  exam,
  hasResumable,
  onBegin,
  onResume,
  onBack,
  isGuest,
}: {
  exam: Exam;
  hasResumable: boolean;
  onBegin: () => void;
  onResume: () => void;
  onBack: () => void;
  isGuest: boolean;
}) {
  // Re-check storage so the resume banner reflects the latest snapshot.
  const [resumeInfo, setResumeInfo] = useState<{ answered: number } | null>(null);
  useEffect(() => {
    if (!hasResumable) return;
    const s = loadSession(exam.id);
    if (s) {
      const answered = Object.values(s.answers).filter((a) => a.picked >= 0).length;
      setResumeInfo({ answered });
    }
  }, [hasResumable, exam.id]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <button onClick={onBack} className="btn-soft"><ChevronLeft className="h-3.5 w-3.5" /> All exams</button>

      {isGuest && (
        <div className="mt-6">
          <GuestBanner message="This mock is free. Sign in to save the attempt to your history, XP and the leaderboard." />
        </div>
      )}

      {resumeInfo && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2 text-brand-100">
            <RotateCcw className="h-4 w-4" /> You have an unfinished attempt ({resumeInfo.answered} answered). Resume where you left off?
          </span>
          <button onClick={onResume} className="btn-primary px-3 py-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Resume attempt
          </button>
        </div>
      )}

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
          <p className="text-xs uppercase tracking-widest text-white/45">Instructions</p>
          <ul className="mt-2 space-y-1.5 text-sm text-white/75">
            <li className="flex gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-300" /> The countdown auto-submits at 00:00, and it keeps running even if you refresh.</li>
            <li className="flex gap-2"><Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" /> Mark questions for review and jump around via the palette.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> Answers save automatically — your progress is restored if you reload.</li>
            <li className="flex gap-2"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-400" /> Sectional + overall score with explanations is shown instantly. No negative marking.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link href="/leaderboard" className="btn-ghost"><Trophy className="h-4 w-4" /> Leaderboard</Link>
          <button onClick={onBegin} className="btn-primary"><Sparkles className="h-4 w-4" /> Begin Exam</button>
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

/* ---------------- Confirm modal ---------------- */

function ConfirmModal({
  counts,
  submitting,
  onCancel,
  onConfirm,
}: {
  counts: { answered: number; unanswered: number; marked: number; total: number };
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Close on Escape for keyboard users.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, submitting]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-ink-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm submission"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900/95 p-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Submit exam?</h3>
            <p className="mt-1 text-sm text-white/55">Review your progress before final submission.</p>
          </div>
          <button onClick={onCancel} className="grid h-8 w-8 place-items-center rounded-md text-white/45 hover:bg-white/5 hover:text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <ModalStat label="Attempted" value={counts.answered} tone="success" />
          <ModalStat label="Unattempted" value={counts.unanswered} tone={counts.unanswered ? "warn" : "success"} />
          <ModalStat label="Marked" value={counts.marked} tone="brand" />
        </div>

        {counts.unanswered > 0 && (
          <p className="mt-4 inline-flex items-start gap-2 rounded-lg border border-warn/25 bg-warn/10 p-3 text-xs text-warn">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            You have {counts.unanswered} unanswered question{counts.unanswered !== 1 ? "s" : ""}. They'll be marked incorrect.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={submitting} className="btn-ghost disabled:opacity-50">
            Keep going
          </button>
          <button onClick={onConfirm} disabled={submitting} className="btn-primary disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit now
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalStat({ label, value, tone }: { label: string; value: number; tone: "success" | "warn" | "brand" }) {
  const tones = {
    success: "text-success",
    warn: "text-warn",
    brand: "text-brand-200",
  } as const;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
      <div className={cn("text-2xl font-semibold tracking-tight", tones[tone])}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}

/* ---------------- Timer pill ---------------- */

function TimerPill({ secondsLeft, totalSec }: { secondsLeft: number; totalSec: number }) {
  const pct = totalSec ? (secondsLeft / totalSec) * 100 : 0;
  const danger = secondsLeft < 60;
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 overflow-hidden rounded-full border px-3 py-1.5 text-sm font-mono",
        danger ? "border-danger/40 bg-danger/15 text-danger" : "border-white/10 bg-white/5 text-white/85",
      )}
      role="timer"
      aria-label={`Time remaining ${formatClock(secondsLeft)}`}
    >
      <Clock className={cn("h-3.5 w-3.5", danger ? "text-danger" : "text-brand-300")} />
      <span>{formatClock(secondsLeft)}</span>
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

/* ---------------- Error card ---------------- */

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
      <div className="card">
        <AlertTriangle className="mx-auto h-6 w-6 text-warn" />
        <h2 className="mt-3 text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-white/60">{message}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/exams" className="btn-primary"><ArrowRight className="h-4 w-4" /> Browse exams</Link>
        </div>
      </div>
    </div>
  );
}
