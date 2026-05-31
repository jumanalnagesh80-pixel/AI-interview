"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  ArrowRight,
  Sigma,
  GitBranch,
  BookOpen,
  Code2,
  Layers,
  Flame,
  Zap,
  RefreshCcw,
  Trophy,
  ChevronLeft,
} from "lucide-react";
import { EXAMS, type ExamQuestion } from "@/lib/exams";
import { api, isOnline, getStoredUser } from "@/lib/api";
import { ConfettiBurst, type ConfettiHandle } from "@/components/ConfettiBurst";
import { LiquidBlob } from "@/components/LiquidBlob";
import { GuestBanner } from "@/components/GuestBanner";
import { cn } from "@/lib/utils";

type Section = "Mixed" | "Quantitative" | "Logical Reasoning" | "Verbal English" | "Programming" | "Pseudocode";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; tag: string }[] = [
  { id: "Mixed", label: "Mixed", icon: <Layers className="h-4 w-4" />, tag: "balanced" },
  { id: "Quantitative", label: "Aptitude", icon: <Sigma className="h-4 w-4" />, tag: "numeric" },
  { id: "Logical Reasoning", label: "Reasoning", icon: <GitBranch className="h-4 w-4" />, tag: "patterns" },
  { id: "Verbal English", label: "Verbal", icon: <BookOpen className="h-4 w-4" />, tag: "language" },
  { id: "Programming", label: "Coding", icon: <Code2 className="h-4 w-4" />, tag: "DSA + SQL" },
  { id: "Pseudocode", label: "Pseudocode", icon: <Code2 className="h-4 w-4" />, tag: "tracing" },
];

interface Stats {
  attempted: number;
  correct: number;
  streak: number;
  bestStreak: number;
  xp: number;
}

const initialStats: Stats = { attempted: 0, correct: 0, streak: 0, bestStreak: 0, xp: 0 };

export default function PracticePage() {
  const [section, setSection] = useState<Section | null>(null);
  const [pool, setPool] = useState<ExamQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<Stats>(initialStats);
  const [loading, setLoading] = useState(false);
  const startedAt = useRef<number>(0);
  const confetti = useRef<ConfettiHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = getStoredUser();

  const current = pool[index];

  // Fetch a fresh batch (with backend) or sample locally.
  const loadBatch = async (sec: Section) => {
    setLoading(true);
    setIndex(0);
    setPicked(null);
    setRevealed(false);
    try {
      if (isOnline()) {
        const data = await api.practiceNext(sec === "Mixed" ? undefined : sec, 12);
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          // Remap backend shape to local ExamQuestion shape (correct_index isn't returned)
          const mapped: ExamQuestion[] = data.questions.map((q: any) => ({
            id: q.id,
            section: q.section,
            text: q.text,
            options: q.options,
            // We don't get correct_index from the server-side adaptive endpoint.
            // We resolve it locally by matching the question id against EXAMS.
            correct_index: findCorrect(q.id) ?? 0,
            explanation: findExplanation(q.id) ?? "",
            difficulty: q.difficulty,
          }));
          setPool(mapped);
          setLoading(false);
          startedAt.current = Date.now();
          return;
        }
      }
    } catch {
      // fall through to local
    }

    // local fallback
    const all = EXAMS.flatMap((e) => e.questions);
    const filtered = sec === "Mixed" ? all : all.filter((q) => q.section === sec);
    const shuffled = shuffle(filtered).slice(0, 12);
    setPool(shuffled);
    setLoading(false);
    startedAt.current = Date.now();
  };

  const start = (sec: Section) => {
    setSection(sec);
    void loadBatch(sec);
  };

  const submit = (pick: number) => {
    if (revealed || !current) return;
    const elapsed = Date.now() - startedAt.current;
    setPicked(pick);
    setRevealed(true);

    const isCorrect = pick === current.correct_index;
    setStats((s) => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      const xpDelta = isCorrect ? (newStreak > 0 && newStreak % 5 === 0 ? 25 : 10) : 1;
      return {
        attempted: s.attempted + 1,
        correct: s.correct + (isCorrect ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        xp: s.xp + xpDelta,
      };
    });

    if (isCorrect) {
      // burst near the answered card center
      const rect = containerRef.current?.getBoundingClientRect();
      const x = rect ? rect.width / 2 : undefined;
      const y = rect ? rect.height * 0.45 : undefined;
      confetti.current?.fire(x, y);
    }

    if (isOnline() && user) {
      // fire-and-forget — failures shouldn't break UX
      void api
        .practiceAnswer({
          question_id: current.id,
          picked: pick,
          time_taken_ms: elapsed,
        })
        .catch(() => undefined);
    }
  };

  const next = () => {
    setPicked(null);
    setRevealed(false);
    startedAt.current = Date.now();
    if (index + 1 >= pool.length) {
      // refill the queue while keeping the run going (truly continuous)
      if (section) void loadBatch(section);
    } else {
      setIndex(index + 1);
    }
  };

  const toggleBookmark = () => {
    if (!current) return;
    setBookmarked((b) => ({ ...b, [current.id]: !b[current.id] }));
    if (isOnline() && user) {
      if (bookmarked[current.id]) return; // local-only remove
      void api.bookmarkAdd(current.id, "").catch(() => undefined);
    }
  };

  const accuracy = stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : 0;

  // Section picker view ----
  if (!section) return <SectionPicker onPick={start} />;

  return (
    <div ref={containerRef} className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <ConfettiBurst ref={confetti} />

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSection(null);
              setPool([]);
              setStats(initialStats);
            }}
            className="btn-soft"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Sections
          </button>
          <span className="chip">
            <Sparkles className="h-3 w-3 text-brand-400" /> Adaptive practice
          </span>
          <span className="chip">{section}</span>
        </div>

        <div className="flex items-center gap-2">
          <Pill icon={<Flame className="h-3.5 w-3.5 text-warn" />} label="Streak" value={`${stats.streak}`} accent={stats.streak >= 5} />
          <Pill icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />} label="Accuracy" value={`${accuracy}%`} />
          <Pill icon={<Zap className="h-3.5 w-3.5 text-brand-300" />} label="XP" value={`+${stats.xp}`} />
        </div>
      </div>

      {/* Streak bar */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            "h-full transition-all",
            stats.streak >= 10
              ? "bg-gradient-to-r from-success via-brand-400 to-accent-400"
              : "bg-gradient-to-r from-brand-500 to-accent-400",
          )}
          style={{ width: `${Math.min(100, (stats.streak / 10) * 100)}%` }}
        />
      </div>

      {/* Card */}
      {loading || !current ? (
        <div className="mt-8 grid place-items-center rounded-2xl border border-white/10 bg-white/[0.02] py-20">
          <span className="conic-loader h-10 w-10" />
          <p className="mt-3 text-sm text-white/55">Loading next batch...</p>
        </div>
      ) : (
        <article
          key={current.id}
          className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <LiquidBlob
            className="-right-32 -top-32 h-72 w-72 opacity-50"
            colorFrom="#6b7eff"
            colorTo="#22d3ee"
          />
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-white/55">
              <span className="inline-flex items-center gap-2">
                <span className="chip">{current.section}</span>
                <span className="chip">{current.difficulty}</span>
              </span>
              <span>Q {index + 1} of {pool.length}</span>
            </div>

            <h2 className="mt-4 text-lg font-medium leading-relaxed text-white/95 sm:text-xl">
              {current.text}
            </h2>

            <div className="mt-6 grid gap-2">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.correct_index;
                const isPicked = i === picked;
                const tone = !revealed
                  ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.06]"
                  : isCorrect
                  ? "border-success/40 bg-success/10 text-success"
                  : isPicked
                  ? "border-danger/40 bg-danger/10 text-danger"
                  : "border-white/10 bg-white/[0.02] text-white/55";
                return (
                  <button
                    key={i}
                    disabled={revealed}
                    onClick={() => submit(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                      tone,
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-medium",
                        revealed && isCorrect
                          ? "border-success bg-success/30 text-white"
                          : revealed && isPicked && !isCorrect
                          ? "border-danger bg-danger/30 text-white"
                          : "border-white/15 text-white/55",
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {revealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 text-danger" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="mt-5 space-y-3">
                {current.explanation && (
                  <div className="inline-flex w-full items-start gap-2 rounded-xl border border-brand-400/25 bg-brand-500/5 p-3 text-sm text-brand-100">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                    <span>{current.explanation}</span>
                  </div>
                )}
                {stats.streak > 0 && stats.streak % 5 === 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-warn/30 bg-warn/15 px-3 py-1 text-xs text-warn">
                    <Trophy className="h-3 w-3" /> {stats.streak}-streak milestone! +25 XP
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <button onClick={toggleBookmark} className="btn-soft">
                {bookmarked[current.id] ? (
                  <>
                    <BookmarkCheck className="h-3.5 w-3.5 text-warn" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" /> Save for review
                  </>
                )}
              </button>
              <div className="flex gap-2">
                {!revealed && (
                  <button onClick={() => submit(-1)} className="btn-ghost">
                    Skip
                  </button>
                )}
                {revealed && (
                  <button onClick={next} className="btn-primary">
                    Next question <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Footer summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="Attempted" value={`${stats.attempted}`} />
        <Stat label="Correct" value={`${stats.correct}`} tone="success" />
        <Stat label="Best streak" value={`${stats.bestStreak}`} tone="brand" />
        <Stat
          label="XP this session"
          value={`+${stats.xp}`}
          tone={stats.xp > 0 ? "success" : "brand"}
        />
      </div>

      <button
        onClick={() => section && loadBatch(section)}
        className="btn-soft mx-auto mt-6 flex"
      >
        <RefreshCcw className="h-3.5 w-3.5" /> Reshuffle batch
      </button>
    </div>
  );
}

/* -------------------- helpers -------------------- */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findCorrect(id: string): number | null {
  for (const e of EXAMS) {
    const q = e.questions.find((qq) => qq.id === id);
    if (q) return q.correct_index;
  }
  return null;
}

function findExplanation(id: string): string | null {
  for (const e of EXAMS) {
    const q = e.questions.find((qq) => qq.id === id);
    if (q) return q.explanation;
  }
  return null;
}

/* -------------------- subcomponents -------------------- */

function Pill({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
        accent
          ? "border-warn/40 bg-warn/15 text-warn"
          : "border-white/10 bg-white/5 text-white/85",
      )}
    >
      {icon}
      <span className="text-white/55">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

function Stat({
  label,
  value,
  tone = "brand",
}: {
  label: string;
  value: string;
  tone?: "success" | "brand";
}) {
  const tones = {
    success: "from-success/15 to-success/0 text-success",
    brand: "from-brand-500/15 to-brand-500/0 text-brand-200",
  } as const;
  return (
    <div className={`rounded-xl border border-white/10 bg-gradient-to-b p-4 ${tones[tone]}`}>
      <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest opacity-80">{label}</div>
    </div>
  );
}

/* -------------------- Section picker -------------------- */

function SectionPicker({ onPick }: { onPick: (sec: Section) => void }) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of EXAMS) {
      for (const q of e.questions) {
        map[q.section] = (map[q.section] ?? 0) + 1;
      }
    }
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip">
            <Sparkles className="h-3 w-3 text-brand-400" /> Practice
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Adaptive practice — instant feedback
          </h1>
          <p className="mt-2 max-w-2xl text-white/65">
            One question at a time. The engine biases questions toward your weakest topic, you get
            instant scoring + explanation, build streaks for bonus XP, and bookmark anything to
            review later.
          </p>
        </div>
        <Link href="/exams" className="btn-ghost">
          <Layers className="h-4 w-4" /> Timed mock exams
        </Link>
      </div>

      {!getStoredUser() && (
        <div className="mt-6">
          <GuestBanner message="Practice is free for everyone. Sign in to track streaks, XP and your weakest-topic analytics." />
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const count = s.id === "Mixed" ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[s.id] ?? 0;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/20"
            >
              <LiquidBlob
                className="-right-16 -top-16 h-44 w-44 opacity-50"
                colorFrom="#6b7eff"
                colorTo={s.id === "Mixed" ? "#d946ef" : "#22d3ee"}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
                    {s.icon}
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/55">
                    {s.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium">{s.label}</h3>
                <p className="mt-1 text-sm text-white/55">{count} questions ready</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-brand-300">
                  Start <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <FeatureRow
          icon={<Flame className="h-4 w-4 text-warn" />}
          title="Streak bonuses"
          desc="Every 5 correct answers in a row triggers a +25 XP milestone."
        />
        <FeatureRow
          icon={<Lightbulb className="h-4 w-4 text-accent-400" />}
          title="Instant explanations"
          desc="Each answer reveals the worked-out solution from our seed bank."
        />
        <FeatureRow
          icon={<BookmarkCheck className="h-4 w-4 text-brand-300" />}
          title="Save for review"
          desc="One tap saves a question to your bookmarks for later revisits."
        />
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="card flex items-start gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/15 ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-white/55">{desc}</div>
      </div>
    </div>
  );
}
