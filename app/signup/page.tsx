"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { api, isOnline, setStoredUser, setToken } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => calcStrength(password), [password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("Tell us your name.");
      return;
    }
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
        const res = await api.register(email, name, password);
        setToken(res.access_token);
        setStoredUser(res.user);
      } else {
        setStoredUser({
          id: Date.now(), email, name, plan: "free",
          xp: 0, streak_days: 0, avatar_url: null, created_at: new Date().toISOString(),
        });
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever - 3 face-to-face mocks per month. Upgrade only when you're ready."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-brand-300 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juman A."
            className="input"
            autoComplete="name"
            required
          />
        </Field>
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
        <Field label="Password">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              autoComplete="new-password"
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
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <StrengthMeter strength={strength} />
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {busy ? "Creating account..." : "Create account"}
        </button>

        <ul className="space-y-1.5 text-xs text-white/55">
          {[
            "No credit card required",
            "3 free face-to-face AI sessions per month",
            "Free access to all competitive exam mocks",
          ].map((p) => (
            <li key={p} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-success" /> {p}
            </li>
          ))}
        </ul>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-white/55">{label}</span>
      {children}
    </label>
  );
}

function StrengthMeter({ strength }: { strength: { score: number; label: string } }) {
  const tone =
    strength.score <= 1 ? "text-danger" : strength.score === 2 ? "text-warn" : strength.score === 3 ? "text-brand-300" : "text-success";
  const bar =
    strength.score <= 1
      ? "bg-danger"
      : strength.score === 2
      ? "bg-warn"
      : strength.score === 3
      ? "bg-brand-400"
      : "bg-success";
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1 w-32 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full transition-all", bar)}
          style={{ width: `${(strength.score / 4) * 100}%` }}
        />
      </div>
      <span className={cn("text-[11px] uppercase tracking-widest", tone)}>{strength.label}</span>
    </div>
  );
}

function calcStrength(p: string): { score: number; label: string } {
  let score = 0;
  if (p.length >= 6) score += 1;
  if (p.length >= 10) score += 1;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score += 1;
  const label = score === 0 ? "too short" : score === 1 ? "weak" : score === 2 ? "okay" : score === 3 ? "good" : "strong";
  return { score, label };
}
