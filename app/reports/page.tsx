"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Download,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  FileText,
} from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { SparkLine } from "@/components/SparkLine";
import { SkillRadar } from "@/components/SkillRadar";
import { RECENT_SESSIONS, SKILL_RADAR } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [selectedId, setSelectedId] = useState(RECENT_SESSIONS[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = RECENT_SESSIONS.filter((s) => {
    if (filter !== "all" && s.type !== filter) return false;
    if (query && !s.role.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const session = RECENT_SESSIONS.find((s) => s.id === selectedId) ?? RECENT_SESSIONS[0];
  const trend = [62, 68, 64, 71, 70, 76, 78, 74, 80, 82, 79, 84];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip"><FileText className="h-3 w-3 text-brand-400" /> Reports</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">Detailed feedback reports</h1>
          <p className="mt-1 text-white/60">Review every session, export PDF, compare your trajectory.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportText(session)} className="btn-ghost"><Download className="h-4 w-4" /> Export report</button>
          <Link href="/interview" className="btn-primary"><ArrowRight className="h-4 w-4" /> New session</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Sessions list */}
        <aside className="lg:col-span-4">
          <div className="card">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search role..."
                  className="w-full rounded-lg border border-white/10 bg-ink-950/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400/50"
                />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-ink-950/60 py-2 pl-7 pr-3 text-sm outline-none focus:border-brand-400/50"
                >
                  <option value="all">All</option>
                  <option value="HR">HR</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Technical">Technical</option>
                  <option value="System Design">System Design</option>
                </select>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {filtered.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedId(s.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 text-left transition",
                      s.id === selectedId
                        ? "border-brand-400/40 bg-brand-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.type} · {s.role}</span>
                      <ScorePill v={s.score} />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-white/45">
                      <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {s.date}</span>
                      <span>{s.duration} min</span>
                    </div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-white/45">No sessions match.</li>
              )}
            </ul>
          </div>

          <div className="card mt-4">
            <p className="text-xs uppercase tracking-widest text-white/45">Score trend</p>
            <div className="mt-2 h-32 w-full">
              <SparkLine values={trend} className="h-32 w-full" />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              +22 points across last 12 sessions
            </div>
          </div>
        </aside>

        {/* Detail */}
        <section className="lg:col-span-8">
          {session && (
            <>
              <div className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="chip">{session.type}</span>
                      <span className="chip">{session.role}</span>
                      <span className="chip"><Calendar className="h-3 w-3" /> {session.date}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gradient">Session report</h2>
                    <p className="mt-1 text-sm text-white/60">{session.duration} minutes · 4 questions answered · live AI scored</p>
                  </div>
                  <ProgressRing value={session.score} size={120} stroke={10} sublabel="overall" />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Highlight icon={<Award className="h-4 w-4" />} label="Top strength" value={session.strengths[0] ?? "Clear structure"} tone="success" />
                  <Highlight icon={<AlertTriangle className="h-4 w-4" />} label="Top focus" value={session.weaknesses[0] ?? "Reduce filler words"} tone="warn" />
                  <Highlight icon={<Sparkles className="h-4 w-4" />} label="Recommended next" value={session.type === "HR" ? "Behavioral round" : session.type === "Behavioral" ? "Technical round" : "System design"} tone="brand" />
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="card">
                  <p className="text-xs uppercase tracking-widest text-white/45">Skill radar (this session)</p>
                  <SkillRadar data={SKILL_RADAR} size={300} />
                </div>
                <div className="card">
                  <p className="text-xs uppercase tracking-widest text-white/45">Per-axis scoring</p>
                  <div className="mt-3 space-y-3">
                    {[
                      ["Clarity", 78],
                      ["Relevance", 84],
                      ["Depth", 72],
                      ["Confidence", 70],
                      ["Structure", 76],
                      ["Filler control", 88],
                    ].map(([label, v]) => (
                      <Bar key={label as string} label={label as string} v={v as number} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="card">
                  <p className="text-xs uppercase tracking-widest text-white/45">Strengths</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {session.strengths.map((s) => (
                      <li key={s} className="flex gap-2 text-white/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <p className="text-xs uppercase tracking-widest text-white/45">Action items</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {session.weaknesses.map((w, i) => (
                      <li key={w} className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                        <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[11px] font-medium", i === 0 ? "bg-danger/20 text-danger" : "bg-warn/20 text-warn")}>{i + 1}</span>
                        <span className="text-white/80">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 card">
                <p className="text-xs uppercase tracking-widest text-white/45">Coach summary</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {session.score >= 80
                    ? "Strong session. Your structure and confidence are at hire-bar. Focus on the one or two action items above to push above the 90 mark."
                    : session.score >= 65
                      ? "Solid foundation with clear room to grow. Tighten your structure and quantify outcomes — that's the fastest path to a 10-point jump."
                      : "Good attempt. The fundamentals are coming together — repeat this round 2-3 more times this week, applying the action items."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/mock" className="btn-soft">Practice action items <ChevronRight className="h-3.5 w-3.5" /></Link>
                  <Link href="/interview" className="btn-soft">Try face-to-face <ChevronRight className="h-3.5 w-3.5" /></Link>
                  <button onClick={() => exportText(session)} className="btn-soft"><Download className="h-3.5 w-3.5" /> Export</button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Highlight({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "warn" | "brand" }) {
  const tones = {
    success: "from-success/20 to-success/0 text-success",
    warn: "from-warn/20 to-warn/0 text-warn",
    brand: "from-brand-500/20 to-brand-500/0 text-brand-300",
  } as const;
  return (
    <div className={cn("rounded-xl border border-white/10 bg-gradient-to-b p-4", tones[tone])}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">{icon} {label}</div>
      <div className="mt-2 text-sm font-medium text-white/95">{value}</div>
    </div>
  );
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/65">{label}</span>
        <span className="text-white/85">{v}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function ScorePill({ v }: { v: number }) {
  const tone = v >= 80 ? "bg-success/15 text-success" : v >= 65 ? "bg-brand-500/15 text-brand-300" : "bg-warn/15 text-warn";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${tone}`}>{v}/100</span>;
}

function exportText(session: typeof RECENT_SESSIONS[number]) {
  if (typeof window === "undefined") return;
  const text = [
    `PrepMate AI - Session Report`,
    `============================`,
    ``,
    `Date: ${session.date}`,
    `Round: ${session.type}`,
    `Role: ${session.role}`,
    `Duration: ${session.duration} min`,
    `Overall score: ${session.score}/100`,
    ``,
    `Strengths:`,
    ...session.strengths.map((s) => ` - ${s}`),
    ``,
    `Action items:`,
    ...session.weaknesses.map((w, i) => ` ${i + 1}. ${w}`),
    ``,
    `Generated by PrepMate AI`,
  ].join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aceterview-report-${session.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
