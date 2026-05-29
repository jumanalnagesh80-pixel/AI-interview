import Link from "next/link";
import {
  Activity,
  Calendar,
  Flame,
  TrendingUp,
  Trophy,
  Target,
  ArrowRight,
  Mic,
  Video,
  FileText,
  Building2,
  ChevronRight,
} from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { SkillRadar } from "@/components/SkillRadar";
import { SparkLine } from "@/components/SparkLine";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { RECENT_SESSIONS, SKILL_RADAR } from "@/lib/data";

export default function DashboardPage() {
  const trend = [62, 68, 64, 71, 70, 76, 78, 74, 80, 82, 79, 84];
  const readiness = 78;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip">
            <Activity className="h-3 w-3 text-brand-400" /> Dashboard
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Welcome back, Juman.
          </h1>
          <p className="mt-1 text-white/60">
            You're <span className="text-brand-300">{readiness}% interview-ready</span>. Keep your streak going.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/interview" className="btn-primary"><Video className="h-4 w-4" /> Face-to-Face</Link>
          <Link href="/mock" className="btn-ghost"><Mic className="h-4 w-4" /> Mock round</Link>
        </div>
      </div>

      {/* Top stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Readiness Score" value={`${readiness}/100`} delta={6} hint="vs last week" icon={<Trophy className="h-4 w-4" />} />
        <StatCard label="Sessions this week" value="7" delta={40} hint="3 face-to-face" icon={<Calendar className="h-4 w-4" />} />
        <StatCard label="Streak" value="12 days" delta={9} hint="personal best: 21" icon={<Flame className="h-4 w-4" />} />
        <StatCard label="Avg. score" value="79" delta={4} hint="last 10 sessions" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Score trend */}
        <div className="card lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/45">Score trend</p>
              <p className="text-lg font-medium">Last 12 sessions</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/55">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-400" /> Overall
              <span className="ml-3 inline-block h-2 w-2 rounded-full bg-accent-400" /> Best 84
            </div>
          </div>
          <div className="mt-4 h-44 w-full">
            <SparkLine values={trend} className="h-44 w-full" />
          </div>
        </div>

        {/* Readiness ring */}
        <div className="card flex flex-col items-center justify-center">
          <p className="self-start text-xs uppercase tracking-widest text-white/45">Readiness</p>
          <ProgressRing value={readiness} size={160} stroke={12} sublabel="ready" />
          <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
            <Mini label="HR" v={88} />
            <Mini label="Tech" v={76} />
            <Mini label="Beh." v={71} />
          </div>
        </div>

        {/* Skill radar */}
        <div className="card lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/45">Skill radar</p>
              <p className="text-lg font-medium">Where you shine and where to focus</p>
            </div>
            <Link href="/reports" className="btn-soft">
              View report <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <SkillRadar data={SKILL_RADAR} size={340} />
          </div>
        </div>

        {/* Weak areas + tips */}
        <div className="card">
          <p className="text-xs uppercase tracking-widest text-white/45">Top weak areas</p>
          <ul className="mt-4 space-y-3">
            {[
              { topic: "STAR structure", v: 62, tip: "Always end with a quantified Result." },
              { topic: "Confidence", v: 68, tip: "Cut 'I think' and 'maybe' — be assertive." },
              { topic: "Edge cases", v: 64, tip: "Walk through 2-3 edge cases per coding answer." },
            ].map((w) => (
              <li key={w.topic} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{w.topic}</span>
                  <span className="text-xs text-warn">{w.v}/100</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full bg-gradient-to-r from-warn to-danger" style={{ width: `${w.v}%` }} />
                </div>
                <p className="mt-2 text-xs text-white/55">{w.tip}</p>
              </li>
            ))}
          </ul>
          <Link href="/mock" className="btn-soft mt-4 w-full justify-center">
            <Target className="h-3.5 w-3.5" /> Practice these now
          </Link>
        </div>
      </div>

      {/* Streak + Recent sessions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/45">Practice streak</p>
              <p className="text-lg font-medium">12-week activity</p>
            </div>
            <span className="chip"><Flame className="h-3 w-3 text-warn" /> 12 days streak</span>
          </div>
          <div className="mt-4">
            <StreakHeatmap />
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <p className="text-xs uppercase tracking-widest text-white/45">Quick actions</p>
          <div className="mt-3 grid gap-2">
            <QuickAction href="/interview" icon={<Video className="h-4 w-4" />} label="Start Face-to-Face Interview" tag="Flagship" />
            <QuickAction href="/mock" icon={<Mic className="h-4 w-4" />} label="Mock HR / Tech / Behavioral" />
            <QuickAction href="/resume" icon={<FileText className="h-4 w-4" />} label="Analyze Resume" />
            <QuickAction href="/companies" icon={<Building2 className="h-4 w-4" />} label="Company Simulator" />
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="mt-6 card">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/45">Recent sessions</p>
            <p className="text-lg font-medium">Pick up where you left off</p>
          </div>
          <Link href="/reports" className="btn-soft">All reports <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-white/45">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Round</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SESSIONS.map((s) => (
                <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-3 text-white/75">{s.date}</td>
                  <td className="px-3 py-3"><span className="chip">{s.type}</span></td>
                  <td className="px-3 py-3 text-white/75">{s.role}</td>
                  <td className="px-3 py-3 text-white/55">{s.duration} min</td>
                  <td className="px-3 py-3">
                    <ScorePill v={s.score} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link href={`/reports?session=${s.id}`} className="btn-soft inline-flex">
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
      <div className="text-base font-semibold text-gradient-accent">{v}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}

function QuickAction({ href, icon, label, tag }: { href: string; icon: React.ReactNode; label: string; tag?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm transition hover:border-white/20 hover:bg-white/[0.05]"
    >
      <span className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
          {icon}
        </span>
        <span className="text-white/85">{label}</span>
      </span>
      <span className="flex items-center gap-2">
        {tag && <span className="rounded-full border border-brand-400/30 bg-brand-500/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-brand-200">{tag}</span>}
        <ChevronRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
      </span>
    </Link>
  );
}

function ScorePill({ v }: { v: number }) {
  const tone = v >= 80 ? "bg-success/15 text-success" : v >= 65 ? "bg-brand-500/15 text-brand-300" : "bg-warn/15 text-warn";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${tone}`}>{v}/100</span>;
}
