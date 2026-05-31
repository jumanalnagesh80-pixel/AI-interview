"use client";

import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Trophy,
  Brain,
  ArrowLeft,
  Activity,
} from "lucide-react";
import { Logo } from "./Logo";
import { AIAvatar } from "./AIAvatar";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Split-screen auth shell — form on the left, futuristic AI showcase on the right.
 */
export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
      {/* Left: form */}
      <div className="flex flex-col">
        <Link href="/" className="mb-6 inline-flex w-fit items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <Logo />
        <div className="mt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-md text-white/60">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 text-sm text-white/55">{footer}</div>}
      </div>

      {/* Right: showcase */}
      <div className="hidden lg:block">
        <div className="glass-strong relative h-full overflow-hidden rounded-3xl p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-accent-500/10" />
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative flex h-full flex-col items-center justify-between gap-6">
            <div className="flex w-full items-center justify-between text-xs text-white/55">
              <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> PrepMate AI</span>
              <span className="chip"><ShieldCheck className="h-3 w-3 text-success" /> Privacy-first</span>
            </div>

            <AIAvatar speaking size={240} name="Aria" />

            <div className="w-full">
              <p className="text-center text-sm text-white/75">
                Talk face-to-face with Aria. Practice TCS NQT, Infosys, Wipro and more. Climb the leaderboard.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Highlight icon={<Brain className="h-4 w-4" />} label="Live AI" value="Real-time" />
                <Highlight icon={<Trophy className="h-4 w-4" />} label="XP earned" value="+25 / mock" />
                <Highlight icon={<Activity className="h-4 w-4" />} label="Latency" value="<200ms" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Highlight({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/50 p-3 text-center">
      <div className="inline-flex items-center justify-center gap-1 text-brand-200">
        {icon}
        <span className="text-xs font-medium">{value}</span>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}
