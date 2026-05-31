"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Non-blocking notice shown to guest (logged-out) users on free features.
 * It never gates access — it only invites sign-in to persist progress.
 */
export function GuestBanner({
  message = "You're exploring as a guest. Everything here is free — sign in to save your progress, XP and history.",
  className,
  dismissible = true,
}: {
  message?: string;
  className?: string;
  dismissible?: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-400/25 bg-gradient-to-r from-brand-500/10 to-accent-500/5 px-4 py-2.5 text-sm",
        className,
      )}
      role="status"
    >
      <span className="inline-flex items-center gap-2 text-white/80">
        <Sparkles className="h-4 w-4 shrink-0 text-brand-300" />
        {message}
      </span>
      <span className="flex items-center gap-1.5">
        <Link href="/signup" className="btn-primary px-3 py-1.5 text-xs">
          Create free account <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href="/login" className="btn-soft px-3 py-1.5 text-xs">
          Sign in
        </Link>
        {dismissible && (
          <button
            onClick={() => setHidden(true)}
            aria-label="Dismiss"
            className="grid h-7 w-7 place-items-center rounded-md text-white/45 hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}
