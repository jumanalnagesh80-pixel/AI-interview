"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  Clock,
  Flame,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  AlertTriangle,
  Award,
  ChevronRight,
} from "lucide-react";
import { HoloRing } from "@/components/HoloRing";
import { Tilt3D } from "@/components/Tilt3D";
import { LiquidBlob } from "@/components/LiquidBlob";
import { SparkLine } from "@/components/SparkLine";
import { api, isOnline } from "@/lib/api";
import { getExam } from "@/lib/exams";
import { buildMockAnalytics, type Analytics } from "@/lib/analytics-mock";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics>(() => buildMockAnalytics());
  const [source, setSource] = useState<"backend" | "demo">("demo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOnline()) return;
    setLoading(true);
    api
      .analytics()
      .then((d: Analytics) => {
        if (d?.by_section?.length) {
          setData(d);
          setSource("backend");
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const recommended = data.recommended_exam_id ? getExam(data.recommended_exam_id) : undefined;

  // 7-day rolling accuracy trend (sparkline values)
  const trend = useMemo(() => {
    const cells = data.heatmap;
    const out: number[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      const a = week.reduce((s, c) => s + c.answered, 0);
      const c = week.reduce((s, c) => s + c.correct, 0);
      out.push(a ? Math.round((c / a) * 100) : 0);
    }
    return out.filter((v) => v > 0);
  }, [data.heatmap]);

  const peakHour = useMemo(() => {
    const sorted = [...data.time_of_day].sort((a, b) => b.answered - a.answered);
    return sorted[0]?.hour ?? null;
  }, [data.time_of_day]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip">
            <Activity className="h-3 w-3 text-brand-400" /> Analytics
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Your performance — clear, actionable
          </h1>
          <p className="mt-2 max-w-2xl text-white/65">
            Topic-level accuracy, time-of-day patterns, and the next exam your weakest area should
            attack. The engine refreshes after every practice answer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-widest",
              source === "backend"
                ? "border-success/30 bg-success/10 text-success"
                : "border-white/10 bg-white/5 text-white/55",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                source === "backend" ? "bg-success animate-pulse" : "bg-white/40",
              )}
            />
            {source === "backend" ? "Live data" : loading ? "Loading..." : "Demo data"}
          </span>
          <Link href="/practice" className="btn-primary">
            <Sparkles className="h-4 w-4" /> Practice now
          </Link>
        </div>
      </div>

      {/* Hero: HoloRing + summary stats */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <LiquidBlob
            className="-right-20 -top-20 h-72 w-72 opacity-50"
            colorFrom="#6b7eff"
            colorTo="#d946ef"
          />
          <div className="relative grid place-items-center">
            <HoloRing value={data.overall_accuracy} size={260} stroke={14} label="Overall accuracy" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Stat
            icon={<Target className="h-4 w-4" />}
            label="Practice answered"
            value={data.total_practice_answers.toLocaleString()}
            hint="across all sections"
          />
          <Stat
            icon={<Trophy className="h-4 w-4" />}
            label="Exam attempts"
            value={data.total_exam_attempts.toString()}
            hint="timed mocks completed"
          />
          <Stat
            icon={<Clock className="h-4 w-4" />}
            label="Avg time / question"
            value={`${(data.avg_time_ms / 1000).toFixed(1)}s`}
            hint={peakHour !== null ? `peak hour ${formatHour(peakHour)}` : ""}
          />
          <Stat
            icon={<Flame className="h-4 w-4" />}
            label="Daily streak"
            value={`${data.streak_days} days`}
            hint="keep it alive!"
          />
        </div>
      </div>

      {/* Strongest / weakest cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {data.strongest_section && (
          <Tilt3D maxDeg={6}>
            <Card tone="success" icon={<Award className="h-4 w-4" />} title="Strongest topic">
              <SectionMini section={data.by_section.find((s) => s.section === data.strongest_section)!} />
              <p className="mt-3 text-xs text-white/55">
                Keep it sharp - one quick session every couple of days holds momentum.
              </p>
            </Card>
          </Tilt3D>
        )}
        {data.weakest_section && (
          <Tilt3D maxDeg={6}>
            <Card tone="warn" icon={<AlertTriangle className="h-4 w-4" />} title="Focus area">
              <SectionMini section={data.by_section.find((s) => s.section === data.weakest_section)!} />
              <p className="mt-3 text-xs text-white/55">
                Drill this in /practice - the engine will bias batches toward this section.
              </p>
            </Card>
          </Tilt3D>
        )}
        <Tilt3D maxDeg={6}>
          <Card tone="brand" icon={<Lightbulb className="h-4 w-4" />} title="Recommended">
            {recommended ? (
              <>
                <div className="text-base font-medium">{recommended.name}</div>
                <div className="mt-0.5 text-xs text-white/55">{recommended.company ?? "Mixed practice"}</div>
                <p className="mt-3 text-xs text-white/65">{data.recommended_reason}</p>
                <Link href={`/exams/${recommended.id}`} className="btn-soft mt-4 w-fit">
                  Open exam <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <>
                <div className="text-base font-medium">Mixed warm-up</div>
                <p className="mt-2 text-xs text-white/65">{data.recommended_reason}</p>
                <Link href="/practice" className="btn-soft mt-4 w-fit">
                  Start practice <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </Card>
        </Tilt3D>
      </div>

      {/* Section accuracy table */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/45">Topic accuracy</p>
              <p className="text-lg font-medium">By section, sorted high to low</p>
            </div>
            <span className="chip">
              <Brain className="h-3 w-3 text-brand-400" /> {data.by_section.length} sections
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {data.by_section.map((s) => (
              <li key={s.section}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/85">{s.section}</span>
                  <span className="inline-flex items-center gap-2 text-xs text-white/55">
                    <span>{s.correct}/{s.answered}</span>
                    <span className={accuracyTone(s.accuracy)}>{s.accuracy.toFixed(1)}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn(
                      "h-full transition-[width] duration-700",
                      accuracyBar(s.accuracy),
                    )}
                    style={{ width: `${Math.max(4, Math.min(100, s.accuracy))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Weekly trend */}
        <div className="card">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/45">Weekly accuracy</p>
              <p className="text-lg font-medium">Last 12 weeks</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3.5 w-3.5" /> trending up
            </span>
          </div>
          <div className="mt-4 h-40 w-full">
            {trend.length > 1 ? (
              <SparkLine values={trend} className="h-40 w-full" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-white/45">
                Not enough data yet - keep practicing!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Heatmap + time of day */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/45">Activity heatmap</p>
              <p className="text-lg font-medium">Last 12 weeks</p>
            </div>
            <span className="text-xs text-white/55">
              {data.heatmap.reduce((s, c) => s + c.answered, 0)} answers
            </span>
          </div>
          <ActivityHeatmap cells={data.heatmap} />
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/45">Time of day</p>
              <p className="text-lg font-medium">When you practice</p>
            </div>
            {peakHour !== null && (
              <span className="chip">
                <Clock className="h-3 w-3 text-brand-400" /> peak {formatHour(peakHour)}
              </span>
            )}
          </div>
          <TimeOfDayChart values={data.time_of_day} />
        </div>
      </section>

      {/* Tips */}
      <section className="mt-8">
        <p className="text-xs uppercase tracking-widest text-white/45">Calibrated next steps</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Tip
            icon={<Brain className="h-4 w-4 text-brand-300" />}
            title="Drill weak section"
            desc={`Spend 10 mins/day on ${data.weakest_section ?? "your weakest section"} - small reps move the bar fast.`}
          />
          <Tip
            icon={<Clock className="h-4 w-4 text-accent-400" />}
            title="Use your peak window"
            desc={
              peakHour !== null
                ? `You score best around ${formatHour(peakHour)}. Schedule timed mocks then.`
                : "Track your streak for a week to find your peak window."
            }
          />
          <Tip
            icon={<Zap className="h-4 w-4 text-warn" />}
            title="Aim for streak 10"
            desc="Every 5-correct streak earns +25 XP. Practice in /practice to extend the chain."
          />
        </div>
      </section>
    </div>
  );
}

/* ----------------- subcomponents ----------------- */

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-white/45">{label}</span>
        <span className="text-white/40">{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-gradient-accent">{value}</div>
      {hint && <div className="mt-1 text-xs text-white/45">{hint}</div>}
    </div>
  );
}

function Card({
  tone,
  icon,
  title,
  children,
}: {
  tone: "success" | "warn" | "brand";
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const tones = {
    success: "from-success/15 to-success/0 text-success",
    warn: "from-warn/15 to-warn/0 text-warn",
    brand: "from-brand-500/15 to-brand-500/0 text-brand-200",
  } as const;
  return (
    <div className={`relative rounded-2xl border border-white/10 bg-gradient-to-b p-5 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-90">
        {icon} {title}
      </div>
      <div className="mt-3 text-white">{children}</div>
    </div>
  );
}

function SectionMini({ section }: { section?: { section: string; accuracy: number; answered: number; correct: number } }) {
  if (!section) return null;
  return (
    <>
      <div className="text-base font-medium">{section.section}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-gradient-accent">
          {section.accuracy.toFixed(1)}%
        </span>
        <span className="text-xs text-white/55">
          {section.correct}/{section.answered} correct
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={accuracyBar(section.accuracy)}
          style={{ width: `${Math.max(4, Math.min(100, section.accuracy))}%`, height: "100%" }}
        />
      </div>
    </>
  );
}

function ActivityHeatmap({ cells }: { cells: { answered: number; correct: number; date: string }[] }) {
  // 7 rows × 12 cols
  const intensity = (answered: number, correct: number) => {
    if (answered === 0) return "bg-white/[0.04]";
    const acc = correct / answered;
    if (acc < 0.4) return "bg-danger/45";
    if (acc < 0.6) return "bg-warn/55";
    if (acc < 0.75) return "bg-brand-400/65";
    if (acc < 0.9) return "bg-brand-400/85";
    return "bg-accent-400";
  };

  return (
    <>
      <div className="mt-4 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn("h-3 w-3 rounded-[3px]", intensity(c.answered, c.correct))}
            title={`${c.date} - ${c.correct}/${c.answered}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
        <span>low</span>
        <span className="h-3 w-3 rounded-[3px] bg-white/[0.04]" />
        <span className="h-3 w-3 rounded-[3px] bg-warn/55" />
        <span className="h-3 w-3 rounded-[3px] bg-brand-400/65" />
        <span className="h-3 w-3 rounded-[3px] bg-brand-400/85" />
        <span className="h-3 w-3 rounded-[3px] bg-accent-400" />
        <span>high accuracy</span>
      </div>
    </>
  );
}

function TimeOfDayChart({ values }: { values: { hour: number; answered: number; correct: number }[] }) {
  const max = Math.max(1, ...values.map((v) => v.answered));
  return (
    <div className="mt-4">
      <div className="flex h-32 items-end gap-1">
        {values.map((v) => {
          const h = (v.answered / max) * 100;
          const acc = v.answered ? v.correct / v.answered : 0;
          const tone =
            v.answered === 0
              ? "from-white/5 to-white/5"
              : acc >= 0.75
              ? "from-success/70 to-success/30"
              : acc >= 0.6
              ? "from-brand-400/70 to-brand-400/30"
              : "from-warn/70 to-warn/30";
          return (
            <div
              key={v.hour}
              className="group relative flex-1"
              title={`${formatHour(v.hour)} · ${v.correct}/${v.answered}`}
            >
              <div
                className={cn(
                  "w-full rounded-t bg-gradient-to-t transition-[height] duration-500",
                  tone,
                )}
                style={{ height: `${Math.max(2, h)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-white/40">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  );
}

function Tip({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
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

function accuracyTone(a: number) {
  if (a >= 80) return "text-success";
  if (a >= 65) return "text-brand-300";
  return "text-warn";
}
function accuracyBar(a: number) {
  if (a >= 80) return "bg-gradient-to-r from-success to-accent-400";
  if (a >= 65) return "bg-gradient-to-r from-brand-500 to-accent-400";
  return "bg-gradient-to-r from-warn to-danger";
}

function formatHour(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}
