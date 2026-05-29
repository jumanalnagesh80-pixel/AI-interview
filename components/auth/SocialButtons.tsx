"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visual-only social auth buttons. They simulate a click, then surface a
 * subtle "coming soon" hint - real OAuth wiring is intentionally out of scope.
 */
export function SocialButtons() {
  const [busy, setBusy] = useState<"google" | "github" | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const click = (provider: "google" | "github") => async () => {
    setBusy(provider);
    setHint(null);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(null);
    setHint(`${provider === "google" ? "Google" : "GitHub"} sign-in is rolling out soon.`);
    setTimeout(() => setHint((h) => (h && h.startsWith(provider === "google" ? "Google" : "GitHub") ? null : h)), 2400);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <SocialBtn busy={busy === "google"} onClick={click("google")} icon={<GoogleIcon />} label="Google" />
        <SocialBtn busy={busy === "github"} onClick={click("github")} icon={<GitHubIcon />} label="GitHub" />
      </div>

      <div className="relative my-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
        <span>or with email</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
      </div>

      {hint && (
        <p className="rounded-lg border border-brand-400/25 bg-brand-500/10 px-3 py-2 text-xs text-brand-100">
          {hint}
        </p>
      )}
    </div>
  );
}

function SocialBtn({
  busy,
  onClick,
  icon,
  label,
}: {
  busy: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/85 transition",
        "hover:border-white/20 hover:bg-white/[0.07]",
        busy && "opacity-70",
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.6 2.4-7.3 2.4-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.7l6.2 5.2c4.3-4 7-9.9 7-16.4 0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="text-white">
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.74 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.16 1.17a10.95 10.95 0 0 1 5.75 0c2.2-1.48 3.16-1.17 3.16-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}
