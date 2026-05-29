"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Building2,
  Sigma,
  GitBranch,
  BookOpen,
  Code2,
  Clock,
  ListChecks,
  ArrowRight,
  Sparkles,
  Trophy,
  Filter,
  Layers,
  Zap,
} from "lucide-react";
import { EXAMS, CATEGORY_LABEL, type Exam, type ExamCategory } from "@/lib/exams";
import { Tilt3D } from "@/components/Tilt3D";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: "all" | ExamCategory; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All exams", icon: <Layers className="h-3.5 w-3.5" /> },
  { id: "placement", label: "Placement drives", icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: "aptitude", label: "Aptitude", icon: <Sigma className="h-3.5 w-3.5" /> },
  { id: "reasoning", label: "Reasoning", icon: <GitBranch className="h-3.5 w-3.5" /> },
  { id: "verbal", label: "Verbal English", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: "coding", label: "Coding & DSA", icon: <Code2 className="h-3.5 w-3.5" /> },
];

const ICONS: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-5 w-5" />,
  Sigma: <Sigma className="h-5 w-5" />,
  GitBranch: <GitBranch className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Code2: <Code2 className="h-5 w-5" />,
};

export default function ExamsPage() {
  const [active, setActive] = useState<"all" | ExamCategory>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list: Exam[] = EXAMS;
    if (active !== "all") list = list.filter((e) => e.category === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.company ?? "").toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [active, query]);

  const totalQs = EXAMS.reduce((s, e) => s + e.total_questions, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip">
            <GraduationCap className="h-3 w-3 text-brand-400" /> Competitive Exams
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Crack every placement drive
          </h1>
          <p className="mt-2 max-w-2xl text-white/65">
            Real exam patterns for TCS NQT, Infosys, Wipro, Capgemini, Cognizant, Accenture, plus standalone
            tracks for aptitude, reasoning, verbal, and coding. Timed, sectional, instantly scored.
          </p>
        </div>
        <Link href="/leaderboard" className="btn-ghost">
          <Trophy className="h-4 w-4" /> Leaderboard
        </Link>
      </div>

      {/* Stats banner */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat icon={<Building2 className="h-4 w-4" />} label="Companies" value="6+" hint="TCS, Infosys, Wipro..." />
        <Stat icon={<ListChecks className="h-4 w-4" />} label="Questions" value={`${totalQs}+`} hint="Across all sections" />
        <Stat icon={<Clock className="h-4 w-4" />} label="Total minutes" value={`${EXAMS.reduce((s, e) => s + e.duration_min, 0)}+`} hint="Of timed practice" />
        <Stat icon={<Zap className="h-4 w-4" />} label="Instant scoring" value="<1s" hint="Sectional + overall" />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or topic..."
            className="w-72 rounded-lg border border-white/10 bg-ink-950/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition",
                active === c.id
                  ? "border-brand-400/50 bg-brand-500/15 text-brand-100"
                  : "border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/[0.06]",
              )}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-white/45">
          <Filter className="mr-1 inline h-3 w-3" /> {filtered.length} of {EXAMS.length}
        </span>
      </div>

      {/* Grouped grid */}
      <div className="mt-8 space-y-10">
        {(active === "all" ? Object.keys(CATEGORY_LABEL) : [active]).map((catKey) => {
          const cat = catKey as ExamCategory;
          const list = filtered.filter((e) => e.category === cat);
          if (list.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white/85">{CATEGORY_LABEL[cat]}</h2>
                <span className="text-xs text-white/45">{list.length} exam{list.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e) => (
                  <Tilt3D key={e.id} maxDeg={6} className="h-full">
                    <ExamCard exam={e} />
                  </Tilt3D>
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/45">
            No exams match your filters.
          </div>
        )}
      </div>

      {/* CTA strip */}
      <section className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/30 via-ink-900/60 to-accent-500/20 p-10 text-center">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative">
            <h3 className="text-3xl font-semibold tracking-tight text-gradient">
              From mock to placement-ready in 2 weeks
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Practice timed, sectional exams modeled after the real thing. Climb the leaderboard. Track progress.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/exams/tcs-nqt" className="btn-primary">
                <Sparkles className="h-4 w-4" /> Start TCS NQT mock
              </Link>
              <Link href="/leaderboard" className="btn-ghost">
                <Trophy className="h-4 w-4" /> See leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  return (
    <Link
      href={`/exams/${exam.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
    >
      {/* gradient halo */}
      <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${exam.color} opacity-25 blur-2xl transition group-hover:opacity-60`} />
      {/* shimmer ring on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 transition group-hover:ring-brand-400/30" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${exam.color} text-white shadow-soft`}>
            {ICONS[exam.icon] ?? <Building2 className="h-5 w-5" />}
          </div>
          <DifficultyChip difficulty={exam.difficulty} />
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-medium">{exam.name}</h3>
          {exam.company && <span className="chip">{exam.company}</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-white/55">{exam.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {exam.sections.map((s) => (
            <span key={s} className="chip text-[11px]">{s}</span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-white/55">
          <span className="inline-flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> {exam.total_questions} Q</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {exam.duration_min} min</span>
          <span className="inline-flex items-center gap-1.5 text-brand-300 transition group-hover:text-brand-200">
            Start <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function DifficultyChip({ difficulty }: { difficulty: "Easy" | "Medium" | "Hard" }) {
  const tone =
    difficulty === "Easy"
      ? "bg-success/15 text-success border-success/20"
      : difficulty === "Medium"
      ? "bg-brand-500/15 text-brand-200 border-brand-400/20"
      : "bg-danger/15 text-danger border-danger/20";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${tone}`}>{difficulty}</span>;
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold text-gradient-accent">{value}</div>
        <div className="text-xs text-white/50">{label} - {hint}</div>
      </div>
    </div>
  );
}
