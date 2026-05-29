"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Sparkles,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Users,
  Target,
} from "lucide-react";
import { MOCK_LEADERBOARD, type LeaderboardRow } from "@/lib/leaderboard";
import { api, isOnline } from "@/lib/api";
import { cn } from "@/lib/utils";

type Period = "all" | "week" | "month";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<LeaderboardRow[]>(MOCK_LEADERBOARD);
  const [source, setSource] = useState<"backend" | "local">("local");

  // try backend, fall back silently
  useEffect(() => {
    let cancelled = false;
    if (!isOnline()) return;
    api
      .leaderboard(period, 20)
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setRows(data);
          setSource("backend");
        }
      })
      .catch(() => {
        // keep local
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, query]);

  const top3 = rows.slice(0, 3);
  const rest = filtered.filter((r) => !top3.find((t) => t.user_id === r.user_id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip">
            <Trophy className="h-3 w-3 text-warn" /> Leaderboard
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Climb the ranks
          </h1>
          <p className="mt-2 max-w-2xl text-white/65">
            Earn XP for every interview, mock round, and exam. Streaks compound. The top 3 own the spotlight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">
            <span className={cn("h-1.5 w-1.5 rounded-full", source === "backend" ? "bg-success animate-pulse" : "bg-white/30")} />
            {source === "backend" ? "Live from backend" : "Demo data"}
          </span>
          <Link href="/exams" className="btn-primary">
            <Sparkles className="h-4 w-4" /> Earn XP now
          </Link>
        </div>
      </div>

      {/* Top-3 podium */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {top3[1] && <Podium row={top3[1]} place={2} />}
        {top3[0] && <Podium row={top3[0]} place={1} highlight />}
        {top3[2] && <Podium row={top3[2]} place={3} />}
      </div>

      {/* Period + search */}
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-white/10 bg-white/[0.02] p-1">
          {(["all", "month", "week"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition",
                period === p ? "bg-brand-500/20 text-brand-100" : "text-white/65 hover:bg-white/[0.05]",
              )}
            >
              {p === "all" ? "All time" : p === "month" ? "This month" : "This week"}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidate..."
            className="w-72 rounded-lg border border-white/10 bg-ink-950/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400/50"
          />
        </div>
      </div>

      {/* Stat strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat icon={<Users className="h-4 w-4" />} label="Active candidates" value={`${rows.length}`} />
        <Stat icon={<Zap className="h-4 w-4" />} label="Top XP" value={`${rows[0]?.xp ?? 0}`} />
        <Stat icon={<Flame className="h-4 w-4" />} label="Median sessions" value={`${median(rows.map((r) => r.sessions))}`} />
        <Stat icon={<Target className="h-4 w-4" />} label="Avg score (top 10)" value={`${Math.round(avg(rows.slice(0, 10).map((r) => r.avg_score)))}/100`} />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-widest text-white/55">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Sessions</th>
              <th className="px-4 py-3">Avg score</th>
              <th className="px-4 py-3">Best</th>
              <th className="px-4 py-3 text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const trendUp = (idx + r.user_id) % 3 !== 0;
              const tone =
                r.rank === 1
                  ? "bg-warn/5"
                  : r.rank === 2
                  ? "bg-white/[0.025]"
                  : r.rank === 3
                  ? "bg-orange-500/5"
                  : idx % 2 === 0
                  ? "bg-white/[0.012]"
                  : "";
              return (
                <tr key={r.user_id} className={cn("border-t border-white/5 hover:bg-white/[0.04]", tone)}>
                  <td className="px-4 py-3">
                    <RankBadge rank={r.rank} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} />
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-white/45">User #{r.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs text-brand-200">
                      <Zap className="h-3 w-3" /> {r.xp.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/75">{r.sessions}</td>
                  <td className="px-4 py-3">
                    <ScorePill v={r.avg_score} />
                  </td>
                  <td className="px-4 py-3">
                    <ScorePill v={r.best_score} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs",
                        trendUp ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
                      )}
                    >
                      {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {trendUp ? "+" : "-"}{1 + ((r.user_id * 3) % 12)}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-white/45">
                  No candidates match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-white/45">
        XP awarded: +10-30 per interview round, +20-40 per exam, streak bonus daily. Cheating in mocks won't get
        you hired - so the leaderboard is only as useful as your honesty.
      </p>
    </div>
  );
}

function Podium({ row, place, highlight }: { row: LeaderboardRow; place: number; highlight?: boolean }) {
  const accent =
    place === 1
      ? "from-warn/40 via-warn/10 to-transparent border-warn/40"
      : place === 2
      ? "from-white/15 via-white/5 to-transparent border-white/20"
      : "from-orange-500/30 via-orange-500/10 to-transparent border-orange-500/30";
  const ring =
    place === 1 ? "ring-warn/40" : place === 2 ? "ring-white/20" : "ring-orange-400/30";
  const iconNode =
    place === 1 ? <Crown className="h-4 w-4 text-warn" /> : <Medal className={place === 2 ? "h-4 w-4 text-white/70" : "h-4 w-4 text-orange-400"} />;

  const heightOrder = highlight ? "lg:py-12" : "lg:py-8";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-b p-6 text-center",
        accent,
        heightOrder,
      )}
    >
      {highlight && (
        <div className="absolute inset-0 bg-grid opacity-30" />
      )}
      <div className="relative">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-widest">
          {iconNode} #{place}
        </div>
        <div className={cn("mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/30 text-lg font-medium ring-2", ring)}>
          {initials(row.name)}
        </div>
        <div className="mt-3 text-base font-medium">{row.name}</div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-brand-200">
          <Zap className="h-3 w-3" /> {row.xp.toLocaleString()} XP
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <div className="text-base font-semibold text-gradient-accent">{row.avg_score}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/55">Avg score</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <div className="text-base font-semibold text-gradient-accent">{row.sessions}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/55">Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? "bg-warn/20 text-warn ring-warn/30"
      : rank === 2
      ? "bg-white/10 text-white ring-white/20"
      : rank === 3
      ? "bg-orange-500/20 text-orange-400 ring-orange-500/30"
      : "bg-white/5 text-white/65 ring-white/10";
  return (
    <span className={`inline-flex h-7 w-9 items-center justify-center rounded-md ring-1 text-xs font-medium ${tone}`}>
      {rank}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/30 text-xs font-medium ring-1 ring-white/10">
      {initials(name)}
    </span>
  );
}

function ScorePill({ v }: { v: number }) {
  const tone = v >= 80 ? "bg-success/15 text-success" : v >= 65 ? "bg-brand-500/15 text-brand-300" : "bg-warn/15 text-warn";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${tone}`}>{v}/100</span>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold text-gradient-accent">{value}</div>
        <div className="text-xs text-white/50">{label}</div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

function avg(arr: number[]) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

function median(arr: number[]) {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[m - 1] + s[m]) / 2) : s[m];
}
