"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  Search,
  ArrowUp,
  ArrowDown,
  Trash2,
  Loader2,
  Lock,
  ArrowRight,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { adminApi, getStoredUser, isAdmin, isOwner, isOnline, type AuthUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMe(getStoredUser());
  }, []);

  useEffect(() => {
    if (!me || !isAdmin(me)) return;
    setLoading(true);
    adminApi
      .users()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, [me]);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  if (!me) {
    return <Gate title="Sign-in required" cta="Sign in" href="/login" />;
  }
  if (!isAdmin(me)) {
    return <Gate title="Admin only" cta="Back to dashboard" href="/dashboard" />;
  }
  if (!isOnline()) {
    return <Gate title="Backend offline" cta="Back to dashboard" href="/dashboard" />;
  }

  const owner = isOwner(me);

  const promote = async (id: number) => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await adminApi.promote(id);
      setUsers((list) => list.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Promote failed");
    } finally {
      setBusyId(null);
    }
  };
  const demote = async (id: number) => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await adminApi.demote(id);
      setUsers((list) => list.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demote failed");
    } finally {
      setBusyId(null);
    }
  };
  const remove = async (id: number, name: string) => {
    if (!confirm(`Permanently remove ${name}? This deletes their data.`)) return;
    setBusyId(id);
    setError(null);
    try {
      await adminApi.remove(id);
      setUsers((list) => list.filter((u) => u.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin" className="btn-soft">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Users
          </h1>
          <p className="mt-1 text-white/60">
            {owner
              ? "You can promote, demote and remove accounts."
              : "Read-only as admin. Only the owner can change roles."}
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email..."
            className="w-72 rounded-lg border border-white/10 bg-ink-950/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400/50"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-widest text-white/55">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Streak</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-white/45">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-white/45">
                  No users match.
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => {
                const role = (u.role || "user").toLowerCase();
                const isOwnerRow = role === "owner";
                const isAdminRow = role === "admin";
                return (
                  <tr key={u.id} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.012]" : ""} hover:bg-white/[0.04]`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/30 text-xs font-medium ring-1 ring-white/10">
                          {u.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-white/45">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={role} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip text-[11px]">{u.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-brand-200">
                        <Zap className="h-3 w-3" /> {u.xp.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/75">{u.streak_days}d</td>
                    <td className="px-4 py-3 text-white/55">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {owner && !isOwnerRow && (
                          <>
                            {isAdminRow ? (
                              <button
                                disabled={busyId === u.id}
                                onClick={() => demote(u.id)}
                                className="btn-soft px-2 py-1 text-[11px]"
                                title="Demote to user"
                              >
                                <ArrowDown className="h-3 w-3" /> Demote
                              </button>
                            ) : (
                              <button
                                disabled={busyId === u.id}
                                onClick={() => promote(u.id)}
                                className="btn-soft px-2 py-1 text-[11px]"
                                title="Promote to admin"
                              >
                                <ArrowUp className="h-3 w-3" /> Promote
                              </button>
                            )}
                            <button
                              disabled={busyId === u.id}
                              onClick={() => remove(u.id, u.name)}
                              className="btn-soft border-danger/30 px-2 py-1 text-[11px] text-danger hover:bg-danger/15"
                              title="Delete user"
                            >
                              {busyId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn/15 px-2 py-0.5 text-[11px] uppercase tracking-widest text-warn">
        <Crown className="h-3 w-3" /> Owner
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-brand-400/40 bg-brand-500/15 px-2 py-0.5 text-[11px] uppercase tracking-widest text-brand-200">
        <ShieldCheck className="h-3 w-3" /> Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-widest text-white/65">
      User
    </span>
  );
}

function Gate({ title, cta, href }: { title: string; cta: string; href: string }) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
      <div className="card">
        <Lock className="mx-auto h-6 w-6 text-warn" />
        <h2 className="mt-3 text-xl font-semibold tracking-tight">{title}</h2>
        <Link href={href} className="btn-primary mt-4">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}
