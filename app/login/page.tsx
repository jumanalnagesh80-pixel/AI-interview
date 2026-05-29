"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, AlertCircle, Zap } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { api, isOnline, setStoredUser, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setError("Enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (isOnline()) {
        const res = await api.login(email, password);
        setToken(res.access_token);
        setStoredUser(res.user);
      } else {
        // local fallback for demo
        setStoredUser({
          id: 1, email, name: email.split("@")[0], plan: "free",
          xp: 0, streak_days: 0, avatar_url: null, created_at: new Date().toISOString(),
        });
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up where you left off. Resume mocks, exams, and leaderboard climb."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-brand-300 underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <Field label="Email">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
            required
          />
        </Field>
        <Field
          label="Password"
          extra={
            <Link href="#" className="text-xs text-brand-300 hover:underline">
              Forgot?
            </Link>
          }
        >
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-white/55 hover:bg-white/5 hover:text-white"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {busy ? "Signing in..." : "Sign in"}
        </button>

        {!isOnline() && (
          <p className="inline-flex items-center gap-1.5 text-xs text-white/45">
            <Zap className="h-3 w-3" /> Offline mode - using local demo session
          </p>
        )}
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(6,7,13,0.6);
          padding: 0.625rem 0.75rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: rgba(107,126,255,0.5); }
        .input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </AuthShell>
  );
}

function Field({ label, children, extra }: { label: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-white/55">{label}</span>
        {extra}
      </div>
      {children}
    </label>
  );
}
