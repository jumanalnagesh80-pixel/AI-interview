"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Users,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Trophy,
  Clock,
  ArrowUpRight,
  Lock,
  Crown,
  ArrowRight,
  Flame,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { HoloRing } from "@/components/HoloRing";
import { Tilt3D } from "@/components/Tilt3D";
import { LiquidBlob } from "@/components/LiquidBlob";
import { ProgressRing } from "@/components/ProgressRing";
import { adminApi, getStoredUser, isOwner, isOnline, type AuthUser } from "@/lib/api";

interface Overview {
  owner: { name: string; email: string };
  totals: Record<string, number>;
  this_week: Record<string, number>;
  today?: { signups: number; logins: number };
}

interface Attempt {
  id: number;
  user_name: string;
  user_email: string;
  exam_name: string;
  exam_id: string;
  score: number;
  correct: number;
  total: number;
  duration_sec: number;
  created_at: string;
}

interface ActivityRow {
  id: number;
  name: string;
  email: string;
  role?: string;
  plan?: string;
  created_at?: string | null;
  last_login_at?: string | null;
}

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [recent, setRecent] = useState<Attempt[]>([]);
  const [signups, setSignups] = useState<ActivityRow[]>([]);
  const [logins, setLogins] = useState<ActivityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!user || !isOwner(user)) return;
    setLoading(true);
    Promise.all([adminApi.overview(), adminApi.recentAttempts(), adminApi.activity()])
      .then(([o, r, act]) => {
        setData(o);
        setRecent(r);
        setSignups(act?.recent_signups ?? []);
        setLogins(act?.recent_logins ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <Gate title="Owner sign-in required" subtitle="Sign in with the owner account to open the admin channel." cta="Sign in" href="/login" />;
  }
  if (!isOwner(user)) {
    return <Gate title="Restricted area" subtitle="This channel is reserved for the owner only." cta="Back to dashboard" href="/dashboard" />;
  }
  if (!isOnline()) {
    return <Gate title="Backend offline" subtitle="The admin channel needs the API. Start the backend and reload." cta="Open dashboard" href="/dashboard" />;
  }

  const isOwnerView = true;
  const ownerName = data?.owner.name || "NAGESH JUMANAL";

  const cards: { icon: React.ReactNode; label: string; value: number; week?: number; tone: "brand" | "success" | "warn" }[] = data
    ? [
        { icon: <Users className="h-4 w-4" />, label: "Users", value: data.totals.users, week: data.this_week.new_users, tone: "brand" },
        { icon: <GraduationCap className="h-4 w-4" />, label: "Exams", value: data.totals.exams, tone: "success" },
        { icon: <Target className="h-4 w-4" />, label: "Exam attempts", value: data.totals.exam_attempts, week: data.this_week.exam_attempts, tone: "success" },
        { icon: <Activity className="h-4 w-4" />, label: "Practice answers", value: data.totals.practice_answers, week: data.this_week.practice_answers, tone: "brand" },
        { icon: <Sparkles className="h-4 w-4" />, label: "Interviews", value: data.totals.interview_sessions, week: data.this_week.interview_sessions, tone: "warn" },
        { icon: <ShieldCheck className="h-4 w-4" />, label: "Admins", value: data.totals.admins, tone: "warn" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Owner ribbon */}
      <Tilt3D maxDeg={4} className="mb-8">
        <div className="relative overflow-hidden rounded-3xl border border-warn/30 bg-gradient-to-br from-warn/15 via-ink-900/60 to-brand-500/10 p-6 sm:p-7">
          <LiquidBlob className="-right-20 -top-20 h-72 w-72 opacity-50" colorFrom="#f59e0b" colorTo="#d946ef" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="chip">
                <Crown className="h-3 w-3 text-warn" /> Admin channel
              </span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
                Welcome, {user.name}
              </h1>
              <p className="mt-1 text-white/65">
                Owner: <span className="text-white/90">{ownerName}</span> ·{" "}
                <span className={isOwnerView ? "text-warn" : "text-brand-300"}>
                  {isOwnerView ? "Owner privileges" : "Admin privileges"}
                </span>
              </p>
            </div>
            <Link href="/dashboard" className="btn-ghost">
              <ArrowRight className="h-4 w-4" /> Back to dashboard
            </Link>
          </div>
        </div>
      </Tilt3D>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="grid place-items-center py-20">
          <span className="conic-loader h-10 w-10" />
        </div>
      ) : data ? (
        <>
          {/* Hero stats */}
          <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <LiquidBlob className="-right-20 -top-20 h-64 w-64 opacity-50" colorFrom="#6b7eff" colorTo="#22d3ee" />
              <div className="relative grid place-items-center">
                <HoloRing
                  value={overallEngagement(data)}
                  size={220}
                  stroke={12}
                  label="Engagement"
                  sublabel="last 7 days"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cards.map((c) => (
                <Stat key={c.label} icon={c.icon} label={c.label} value={c.value.toLocaleString()} week={c.week} tone={c.tone} />
              ))}
            </div>
          </div>

          {/* Quick links */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Tilt3D maxDeg={5}>
              <LinkCard href="/admin/users" icon={<Users className="h-4 w-4" />} title="Manage users" desc="Promote / demote / remove accounts" />
            </Tilt3D>
            <Tilt3D maxDeg={5}>
              <LinkCard href="/exams" icon={<GraduationCap className="h-4 w-4" />} title="Browse exams" desc={`${data.totals.exams} exams across all categories`} />
            </Tilt3D>
            <Tilt3D maxDeg={5}>
              <LinkCard href="/leaderboard" icon={<Trophy className="h-4 w-4" />} title="Public leaderboard" desc="Top performers, period filters" />
            </Tilt3D>
          </section>

          {/* Who's using the app — signups & logins (owner audit feed) */}
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/45">Recent sign-ups</p>
                  <p className="text-lg font-medium">Newest accounts</p>
                </div>
                {data.today && (
                  <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> {data.today.signups} today</span>
                )}
              </div>
              <ul className="mt-3 divide-y divide-white/5">
                {signups.length === 0 && <li className="py-6 text-center text-sm text-white/45">No sign-ups yet.</li>}
                {signups.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600/30 text-[11px] font-medium ring-1 ring-white/10">
                        {u.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{u.name}</div>
                        <div className="truncate text-xs text-white/45">{u.email}</div>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-white/45">{formatRelative(u.created_at ?? "")}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/45">Recent logins</p>
                  <p className="text-lg font-medium">Who's active</p>
                </div>
                {data.today && (
                  <span className="chip"><CheckCircle2 className="h-3 w-3 text-success" /> {data.today.logins} today</span>
                )}
              </div>
              <ul className="mt-3 divide-y divide-white/5">
                {logins.length === 0 && <li className="py-6 text-center text-sm text-white/45">No logins yet.</li>}
                {logins.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/20 text-[11px] font-medium ring-1 ring-white/10">
                        {u.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{u.name}</div>
                        <div className="truncate text-xs text-white/45">{u.email}</div>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-white/45">{formatRelative(u.last_login_at ?? "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Recent activity */}
          <section className="mt-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/45">Recent exam attempts</p>
                <p className="text-lg font-medium">Latest 40 across the platform</p>
              </div>
              <span className="chip">
                <Clock className="h-3 w-3 text-brand-400" /> realtime
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-widest text-white/55">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Exam</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Correct</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/45">
                        No attempts yet.
                      </td>
                    </tr>
                  )}
                  {recent.map((a, i) => (
                    <tr key={a.id} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.012]" : ""} hover:bg-white/[0.04]`}>
                      <td className="px-4 py-3 text-white/70">{formatRelative(a.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{a.user_name}</div>
                        <div className="text-xs text-white/45">{a.user_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/exams/${a.exam_id}`} className="text-brand-300 hover:underline">
                          {a.exam_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <ScorePill v={a.score} />
                      </td>
                      <td className="px-4 py-3 text-white/75">{a.correct}/{a.total}</td>
                      <td className="px-4 py-3 text-white/55">{Math.floor(a.duration_sec / 60)}m {a.duration_sec % 60}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  week,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  week?: number;
  tone: "brand" | "success" | "warn";
}) {
  const tones = {
    brand: "from-brand-500/15 to-brand-500/0 text-brand-200",
    success: "from-success/15 to-success/0 text-success",
    warn: "from-warn/15 to-warn/0 text-warn",
  } as const;
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-b p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest opacity-80">{label}</span>
        <span className="opacity-70">{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
      {week != null && (
        <div className="mt-1 inline-flex items-center gap-1 text-xs">
          <ArrowUpRight className="h-3 w-3" /> +{week} this week
        </div>
      )}
    </div>
  );
}

function LinkCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/15 ring-1 ring-white/10 text-brand-200">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-white/55">{desc}</div>
      </div>
      <ArrowRight className="mt-1.5 h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}

function ScorePill({ v }: { v: number }) {
  const tone = v >= 80 ? "bg-success/15 text-success" : v >= 65 ? "bg-brand-500/15 text-brand-300" : "bg-warn/15 text-warn";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${tone}`}>{v}/100</span>;
}

function Gate({ title, subtitle, cta, href }: { title: string; subtitle: string; cta: string; href: string }) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
      <div className="card">
        <Lock className="mx-auto h-6 w-6 text-warn" />
        <h2 className="mt-3 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        <Link href={href} className="btn-primary mt-4">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function overallEngagement(d: Overview): number {
  const week = d.this_week;
  const totals = d.totals;
  const denom = Math.max(1, totals.users || 1);
  // Engagement = (weekly attempts + practice answers + interviews) / users, capped to 100
  const score = ((week.exam_attempts + week.practice_answers + week.interview_sessions) / denom) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatRelative(iso: string) {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return "—";
  const diff = (Date.now() - dt.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}
