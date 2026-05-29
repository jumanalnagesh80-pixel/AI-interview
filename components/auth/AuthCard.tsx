"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Mail,
  User as UserIcon,
  Lock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { SocialButtons } from "./SocialButtons";
import { api, isOnline, setStoredUser, setToken } from "@/lib/api";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

export function AuthCard({ initialTab = "login" }: { initialTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Sliding tab indicator measurements
  const wrapRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 4, width: 0 });

  useEffect(() => {
    const el = wrapRef.current?.querySelector<HTMLButtonElement>(`button[data-tab="${tab}"]`);
    if (!el) return;
    const parent = el.parentElement!;
    const left = el.offsetLeft;
    const width = el.offsetWidth;
    setIndicator({ left, width });
  }, [tab]);

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);
  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const pwdStrength = useMemo(() => calcStrength(password), [password]);

  const formValid =
    tab === "login"
      ? emailValid && password.length >= 6
      : nameValid && emailValid && password.length >= 6;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formValid) {
      setError(
        tab === "register" && !nameValid
          ? "Tell us your name (2+ characters)."
          : !emailValid
          ? "Enter a valid email."
          : "Password must be at least 6 characters.",
      );
      triggerShake();
      return;
    }
    setBusy(true);
    try {
      if (isOnline()) {
        const res =
          tab === "login"
            ? await api.login(email, password)
            : await api.register(email, name.trim(), password);
        setToken(res.access_token);
        setStoredUser(res.user);
      } else {
        // demo session
        setStoredUser({
          id: Date.now(),
          email,
          name: tab === "login" ? email.split("@")[0] : name.trim(),
          plan: "free",
          xp: 0,
          streak_days: 0,
          avatar_url: null,
          created_at: new Date().toISOString(),
        });
      }
      setDone(true);
      // small celebration before routing
      await new Promise((r) => setTimeout(r, 650));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : `${tab === "login" ? "Sign-in" : "Sign-up"} failed.`);
      triggerShake();
    } finally {
      setBusy(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const switchTab = (t: Tab) => {
    if (t === tab) return;
    setError(null);
    setDone(false);
    setTab(t);
  };

  return (
    <div className="auth-card-glow relative w-full max-w-md rounded-3xl bg-ink-950/80 p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-8">
      {/* Tab pill */}
      <div className="flex items-center justify-between gap-3">
        <div ref={wrapRef} className="tab-pill">
          <span
            className="tab-indicator"
            style={{ left: indicator.left, width: indicator.width }}
          />
          <button
            data-tab="login"
            data-active={tab === "login"}
            onClick={() => switchTab("login")}
            type="button"
          >
            Sign in
          </button>
          <button
            data-tab="register"
            data-active={tab === "register"}
            onClick={() => switchTab("register")}
            type="button"
          >
            Create account
          </button>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest",
            isOnline()
              ? "border-success/30 bg-success/10 text-success"
              : "border-white/10 bg-white/5 text-white/55",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", isOnline() ? "bg-success animate-pulse" : "bg-white/40")} />
          {isOnline() ? "Live API" : "Demo"}
        </span>
      </div>

      {/* Heading */}
      <div key={tab} className="tab-slide mt-6">
        <h2 className="text-2xl font-semibold tracking-tight text-gradient">
          {tab === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-1 text-sm text-white/60">
          {tab === "login"
            ? "Pick up where you left off - dashboards, mocks, and your leaderboard rank."
            : "Free forever - 3 face-to-face mocks per month + every competitive exam."}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <SocialButtons />

        <form
          onSubmit={onSubmit}
          className={cn("space-y-3 tab-slide", shake && "animate-shake")}
          key={tab + "-form"}
          noValidate
        >
          {tab === "register" && (
            <Field
              id="name"
              label="Full name"
              value={name}
              onChange={setName}
              icon={<UserIcon className="h-4 w-4" />}
              autoComplete="name"
              required
              valid={name ? nameValid : null}
            />
          )}

          <Field
            id="email"
            type="email"
            label="Email address"
            value={email}
            onChange={setEmail}
            icon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
            valid={email ? emailValid : null}
          />

          <Field
            id="password"
            type={showPwd ? "text" : "password"}
            label="Password"
            value={password}
            onChange={setPassword}
            icon={<Lock className="h-4 w-4" />}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            required
            valid={password ? password.length >= 6 : null}
            action={
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="field-action"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {tab === "register" && password && <StrengthMeter strength={pwdStrength} />}

          {tab === "login" && (
            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-white/60">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-brand-500" />
                Remember me
              </label>
              <a href="#" className="text-brand-300 hover:underline">Forgot password?</a>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || done}
            className={cn(
              "btn-primary mt-2 w-full justify-center",
              done && "from-success to-success",
              "disabled:opacity-70",
            )}
          >
            {done ? (
              <span className="success-pop inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {tab === "login" ? "Signed in" : "Account ready"}
              </span>
            ) : busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {tab === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {tab === "login" ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>

          {tab === "register" && (
            <p className="text-[11px] leading-relaxed text-white/50">
              By creating an account you agree to our{" "}
              <a href="#" className="text-white/70 underline-offset-2 hover:underline">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-white/70 underline-offset-2 hover:underline">Privacy Policy</a>.
              We never sell your data.
            </p>
          )}

          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/55">
            {tab === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => switchTab("register")} className="text-brand-300 hover:underline">
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-brand-300 hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>

        {!isOnline() && (
          <p className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/55">
            <Zap className="h-3 w-3 text-brand-300" />
            Backend offline - your session will be saved locally for the demo.
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes shakeAnim {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        :global(.animate-shake) { animation: shakeAnim 0.4s ease both; }
      `}</style>
    </div>
  );
}

/* -------------- Field with floating label -------------- */

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  icon,
  autoComplete,
  required,
  valid,
  action,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
  valid?: boolean | null;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("field-float", valid === false && "has-error", valid === true && "is-valid")}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        placeholder=" "
      />
      <label htmlFor={id}>{label}</label>
      {action ? action : valid === true ? (
        <span className="field-icon text-success">
          <CheckCircle2 className="h-4 w-4" />
        </span>
      ) : icon ? (
        <span className="field-icon">{icon}</span>
      ) : null}
    </div>
  );
}

/* -------------- Strength meter -------------- */

function StrengthMeter({ strength }: { strength: { score: number; label: string } }) {
  const colors = ["bg-danger", "bg-warn", "bg-brand-400", "bg-success"];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 overflow-hidden rounded-full bg-white/5 transition-colors",
              i < strength.score && colors[Math.min(strength.score - 1, 3)],
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
        <span className="text-white/45">Password strength</span>
        <span
          className={cn(
            strength.score <= 1 ? "text-danger" : strength.score === 2 ? "text-warn" : strength.score === 3 ? "text-brand-300" : "text-success",
          )}
        >
          {strength.label}
        </span>
      </div>
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
