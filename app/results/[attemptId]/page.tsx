"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCcw,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Target,
  Clock,
  Crosshair,
  Medal,
  Sparkles,
} from "lucide-react";
import { HoloRing } from "@/components/HoloRing";
import { LiquidBlob } from "@/components/LiquidBlob";
import { ConfettiBurst, type ConfettiHandle } from "@/components/ConfettiBurst";
import { GuestBanner } from "@/components/GuestBanner";
import { Skeleton } from "@/components/Skeleton";
import { loadAttempt, type StoredAttempt } from "@/lib/examSession";
import { formatDuration } from "@/lib/examScoring";
import { getExam } from "@/lib/exams";
import { api, getStoredUser, isOnline } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<StoredAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<number | null>(null);
  const user = getStoredUser();

  const confetti = useRef<ConfettiHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load the attempt snapshot from local storage (works for guests + offline).
  useEffect(() => {
    const a = loadAttempt(params.attemptId);
    setAttempt(a);
    setLoading(false);
  }, [params.attemptId]);

  // Best-effort rank: derive from the public leaderboard if the backend is up.
  useEffect(() => {
    if (!attempt || !isOnline() || !user) return;
    api
      .leaderboard("all", 100)
      .then((rows: { user_id: number; rank: number }[]) => {
        const me = rows.find((r) => r.user_id === user.id);
        if (me) setRank(me.rank);
      })
      .catch(() => undefined);
  }, [attempt, user]);

  // Celebrate a good score.
  useEffect(() => {
    if (attempt && attempt.result.score >= 60) {
      const t = setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        confetti.current?.fire(rect ? rect.width / 2 : undefined, rect ? 300 : undefined);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [attempt]);

  const exam = attempt ? getExam(attempt.examId) : undefined;
  const questionById = useMemo(() => {
    const map = new Map<string, { text: string; options: string[] }>();
    exam?.questions.forEach((q) => map.set(q.id, { text: q.text, options: q.options }));
    return map;
  }, [exam]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-72" />
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <Skeleton className="h-56 lg:col-span-1" />
          <Skeleton className="h-56 lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div className="card">
          <AlertTriangle className="mx-auto h-6 w-6 text-warn" />
          <h2 className="mt-3 text-lg font-semibold tracking-tight">Result not found</h2>
          <p className="mt-1 text-sm text-white/60">
            This result isn't available on this device. Results are stored locally per browser — try retaking the exam.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/exams" className="btn-primary"><ArrowRight className="h-4 w-4" /> Browse exams</Link>
          </div>
        </div>
      </div>
    );
  }

  const r = attempt.result;
  const fmtTime = formatDuration(attempt.durationSec);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ConfettiBurst ref={confetti} />

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip"><CheckCircle2 className="h-3 w-3 text-success" /> Result</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
            {attempt.examName} — results
          </h1>
          <p className="mt-1 text-white/60">
            {attempt.examCompany ? `${attempt.examCompany} · ` : ""}{fmtTime} taken
            {attempt.timedOut && <span className="ml-2 text-warn">· auto-submitted (time up)</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/exams/${attempt.examId}`} className="btn-ghost"><RefreshCcw className="h-4 w-4" /> Retake</Link>
          <Link href="/leaderboard" className="btn-primary"><Trophy className="h-4 w-4" /> Leaderboard</Link>
        </div>
      </div>

      {/* Save state notice */}
      {!user && (
        <div className="mt-4">
          <GuestBanner message="This result is saved only on this device (guest mode). Sign in before your next exam to save attempts to your account, XP and the leaderboard." />
        </div>
      )}

      {/* Top stats */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-1">
          <LiquidBlob className="-right-16 -top-16 h-56 w-56 opacity-50" colorFrom="#6b7eff" colorTo="#d946ef" />
          <div className="relative grid place-items-center">
            <HoloRing value={r.score} size={210} stroke={12} label="score" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-3">
          <Stat icon={<Target className="h-4 w-4" />} label="Percentage" value={`${r.score}%`} tone="brand" />
          <Stat icon={<Crosshair className="h-4 w-4" />} label="Accuracy" value={`${r.accuracy}%`} tone="success" />
          <Stat icon={<Clock className="h-4 w-4" />} label="Time taken" value={fmtTime} tone="brand" />
          <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Correct" value={`${r.correct}/${r.total}`} tone="success" />
          <Stat icon={<XCircle className="h-4 w-4" />} label="Incorrect" value={`${r.incorrect}`} tone={r.incorrect ? "warn" : "success"} />
          {rank != null ? (
            <Stat icon={<Medal className="h-4 w-4" />} label="Your rank" value={`#${rank}`} tone="brand" />
          ) : (
            <Stat icon={<Sparkles className="h-4 w-4" />} label="Skipped" value={`${r.skipped}`} tone={r.skipped ? "warn" : "success"} />
          )}
        </div>
      </div>

      {/* Section-wise analysis */}
      <div className="mt-6 card">
        <p className="text-xs uppercase tracking-widest text-white/45">Section-wise analysis</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {r.sectionScores.map((s) => (
            <div key={s.section} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/85">{s.section}</span>
                <span className={cn("text-sm font-semibold", s.percent >= 60 ? "text-success" : "text-warn")}>{s.percent}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn(
                    "h-full",
                    s.percent >= 60 ? "bg-gradient-to-r from-success to-accent-400" : "bg-gradient-to-r from-warn to-danger",
                  )}
                  style={{ width: `${s.percent}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-white/45">{s.correct} correct / {s.total} questions</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-question review */}
      <div className="mt-6 space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/45">Question-by-question review</p>
        {r.graded.map((g, i) => {
          const meta = questionById.get(g.question_id);
          const correct = g.is_correct;
          const skipped = g.picked < 0;
          return (
            <div
              key={g.question_id}
              className={cn(
                "rounded-2xl border p-5",
                skipped ? "border-white/10 bg-white/[0.02]" : correct ? "border-success/20 bg-success/5" : "border-danger/20 bg-danger/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
                    <span>Q{i + 1}</span>
                    <span className="chip">{g.section}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/95 sm:text-base">{meta?.text ?? g.question_id}</p>
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

              {meta && (
                <div className="mt-3 grid gap-2">
                  {meta.options.map((opt, oi) => {
                    const isCorrect = oi === g.correct_index;
                    const isPicked = oi === g.picked;
                    return (
                      <div
                        key={oi}
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
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {isPicked && !isCorrect && <XCircle className="h-4 w-4 text-danger" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {g.explanation && (
                <div className="mt-3 inline-flex w-full items-start gap-2 rounded-lg border border-brand-400/20 bg-brand-500/5 p-3 text-sm text-brand-100">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                  <span>{g.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/exams/${attempt.examId}`} className="btn-primary"><RefreshCcw className="h-4 w-4" /> Retake this exam</Link>
        <Link href="/exams" className="btn-ghost"><ArrowRight className="h-4 w-4" /> More exams</Link>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "warn" | "brand";
}) {
  const tones = {
    success: "from-success/15 to-success/0 text-success",
    warn: "from-warn/15 to-warn/0 text-warn",
    brand: "from-brand-500/15 to-brand-500/0 text-brand-200",
  } as const;
  return (
    <div className={`rounded-xl border border-white/10 bg-gradient-to-b p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest opacity-80">{label}</span>
        <span className="opacity-70">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}
