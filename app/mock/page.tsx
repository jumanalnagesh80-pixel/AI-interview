"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Send,
  RotateCcw,
  Lightbulb,
  Mic,
  Brain,
  Code2,
  Network,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { QUESTIONS, ROLES, type Round, type Question } from "@/lib/data";
import { scoreAnswer, type ScoreBreakdown } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface Attempt {
  q: Question;
  answer: string;
  score: ScoreBreakdown;
}

const ROUND_TILES: { round: Round; icon: React.ReactNode; tag: string; desc: string }[] = [
  { round: "HR", icon: <HeartHandshake className="h-5 w-5" />, tag: "Easy start", desc: "Fit, motivation, communication." },
  { round: "Behavioral", icon: <Brain className="h-5 w-5" />, tag: "STAR coach", desc: "Conflict, leadership, failure, ownership." },
  { round: "Technical", icon: <Code2 className="h-5 w-5" />, tag: "Fundamentals", desc: "DSA, web, databases, OS basics." },
  { round: "System Design", icon: <Network className="h-5 w-5" />, tag: "Senior", desc: "Architecture, trade-offs, capacity." },
];

export default function MockPage() {
  const [round, setRound] = useState<Round | null>(null);
  const [role, setRole] = useState(ROLES[0]);
  const pool = useMemo(() => (round ? QUESTIONS.filter((q) => q.round === round) : []), [round]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const current = pool[idx];

  const submit = () => {
    if (!current || answer.trim().length < 10) return;
    setSubmitted(true);
  };

  const next = () => {
    if (!current) return;
    const sc = scoreAnswer(answer, current.expected ?? [], current.text);
    setAttempts((a) => [...a, { q: current, answer, score: sc }]);
    setAnswer("");
    setSubmitted(false);
    if (idx + 1 < pool.length) setIdx(idx + 1);
    else setIdx(pool.length); // sentinel for "done"
  };

  const reset = () => {
    setRound(null);
    setRole(ROLES[0]);
    setIdx(0);
    setAnswer("");
    setSubmitted(false);
    setAttempts([]);
  };

  // Round picker
  if (!round) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> Mock Rounds</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              Pick a round to drill
            </h1>
            <p className="mt-1 text-white/60">Text-based, async-friendly. Want a real conversation? <Link href="/interview" className="text-brand-300 underline-offset-4 hover:underline">Try Face-to-Face</Link>.</p>
          </div>
          <Link href="/interview" className="btn-ghost"><Mic className="h-4 w-4" /> Switch to live</Link>
        </div>

        <div className="mt-6 card max-w-md">
          <p className="text-xs uppercase tracking-widest text-white/45">Target role</p>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-ink-950/60 px-3 py-2 text-sm outline-none focus:border-brand-400/50"
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ROUND_TILES.map((t) => {
            const count = QUESTIONS.filter((q) => q.round === t.round).length;
            return (
              <button
                key={t.round}
                onClick={() => setRound(t.round)}
                className="group card relative overflow-hidden text-left transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-500/20 blur-2xl transition group-hover:opacity-80" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
                      {t.icon}
                    </div>
                    <span className="rounded-full border border-brand-400/30 bg-brand-500/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-brand-200">{t.tag}</span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-medium">{t.round}</h3>
                    <span className="text-xs text-white/45">{count} questions</span>
                  </div>
                  <p className="mt-1 text-sm text-white/60">{t.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-brand-300">
                    Start <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Done state
  if (idx >= pool.length) {
    const overall = attempts.length === 0 ? 0 : Math.round(attempts.reduce((s, a) => s + a.score.overall, 0) / attempts.length);
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip"><CheckCircle2 className="h-3 w-3 text-success" /> Round complete</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">{round} round summary</h1>
            <p className="mt-1 text-white/60">{attempts.length} answers · {role}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="btn-ghost"><RotateCcw className="h-4 w-4" /> New round</button>
            <Link href="/reports" className="btn-primary"><ArrowRight className="h-4 w-4" /> Detailed reports</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="card flex items-center justify-center lg:col-span-1">
            <ProgressRing value={overall} size={150} stroke={12} sublabel="overall" />
          </div>
          <div className="card lg:col-span-3">
            <p className="text-xs uppercase tracking-widest text-white/45">Per-question scores</p>
            <ul className="mt-3 space-y-2">
              {attempts.map((a, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
                  <span className="truncate text-white/80">Q{i + 1}. {a.q.text}</span>
                  <ScorePill v={a.score.overall} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {attempts.map((a, i) => (
            <AnswerReview key={i} attempt={a} index={i} />
          ))}
        </div>
      </div>
    );
  }

  // Active question state
  const score = submitted ? scoreAnswer(answer, current.expected ?? [], current.text) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={reset} className="btn-soft"><ChevronLeft className="h-3.5 w-3.5" /> Back</button>
          <span className="chip">{round}</span>
          <span className="chip">{role}</span>
        </div>
        <div className="text-xs text-white/55">Question {idx + 1} of {pool.length}</div>
      </div>

      {/* Progress */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width]"
          style={{ width: `${(idx / pool.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mt-6 card">
        <div className="flex items-center gap-2">
          <span className="chip">{current.difficulty}</span>
          {current.tags.slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
        <h2 className="mt-4 text-xl font-medium leading-relaxed text-white/95 sm:text-2xl">{current.text}</h2>
        {round === "Behavioral" && (
          <p className="mt-3 inline-flex items-start gap-2 rounded-lg border border-brand-400/20 bg-brand-500/10 p-3 text-sm text-brand-100">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
            STAR tip: Situation -&gt; Task -&gt; Action -&gt; Result. Aim for 60-120 words, end on a quantified result.
          </p>
        )}
      </div>

      {/* Answer area */}
      <div className="mt-4 card">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-white/45">Your answer</p>
          <span className="text-xs text-white/40">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <textarea
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setSubmitted(false); }}
          placeholder="Type your answer here..."
          rows={8}
          className="mt-3 w-full resize-y rounded-lg border border-white/10 bg-ink-950/60 p-3 text-sm leading-relaxed outline-none focus:border-brand-400/50"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-white/45">Tip: 1-2 short paragraphs, specific examples, end strong.</div>
          {!submitted ? (
            <button onClick={submit} disabled={answer.trim().length < 10} className="btn-primary disabled:opacity-50">
              <Send className="h-4 w-4" /> Score my answer
            </button>
          ) : (
            <button onClick={next} className="btn-primary">
              <ChevronRight className="h-4 w-4" /> {idx + 1 === pool.length ? "Finish round" : "Next question"}
            </button>
          )}
        </div>
      </div>

      {/* Inline feedback */}
      {submitted && score && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="card flex items-center justify-center">
            <ProgressRing value={score.overall} size={140} stroke={10} sublabel="this answer" />
          </div>
          <div className="card lg:col-span-2">
            <p className="text-xs uppercase tracking-widest text-white/45">Breakdown</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Clarity", score.clarity],
                ["Relevance", score.relevance],
                ["Depth", score.depth],
                ["Confidence", score.confidence],
                ["Structure", score.structure],
                ["Filler control", score.fillerWords],
              ].map(([label, v]) => (
                <Axis key={label as string} label={label as string} v={v as number} />
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {score.notes.map((n, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/75">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warn" /> {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Axis({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-widest text-white/45">{label}</span>
        <span className="text-base font-semibold text-gradient-accent">{v}</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function ScorePill({ v }: { v: number }) {
  const tone = v >= 80 ? "bg-success/15 text-success" : v >= 65 ? "bg-brand-500/15 text-brand-300" : "bg-warn/15 text-warn";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${tone}`}>{v}/100</span>;
}

function AnswerReview({ attempt, index }: { attempt: Attempt; index: number }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/45">Q{index + 1}</p>
          <p className="mt-1 text-base text-white/90">{attempt.q.text}</p>
        </div>
        <ScorePill v={attempt.score.overall} />
      </div>
      <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/40 p-3 text-sm text-white/80">{attempt.answer}</div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {attempt.score.notes.map((n, i) => (
          <li key={i} className="flex gap-2 text-sm text-white/70">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /> {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
