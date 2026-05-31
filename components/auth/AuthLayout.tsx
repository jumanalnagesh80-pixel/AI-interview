"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../Logo";
import { ParticleField } from "./ParticleField";
import { Showcase } from "./Showcase";
import { AuthCard } from "./AuthCard";

/**
 * Full-bleed split-screen auth experience:
 *   left  -> ParticleField + AuthCard (login/register tabs)
 *   right -> Showcase (rotating testimonials, AI avatar)
 */
export function AuthLayout({ initialTab = "login" }: { initialTab?: "login" | "register" }) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* particles behind everything */}
      <ParticleField className="absolute inset-0 h-full w-full" />

      <div className="relative mx-auto grid h-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16 lg:py-12">
        {/* Left: heading + card */}
        <div className="flex flex-col">
          <Link href="/" className="mb-6 inline-flex w-fit items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <Logo />

          <div className="mt-10 max-w-md">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 live-dot" />
              {initialTab === "login" ? "Welcome to PrepMate" : "Join 120k+ candidates"}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              {initialTab === "login" ? "One step closer to your offer" : "Practice. Score. Get hired."}
            </h1>
            <p className="mt-2 text-white/60">
              Face-to-face AI interviews, competitive-exam mocks (TCS NQT, Infosys, Wipro and more), instant
              scoring, and a leaderboard that pushes you forward.
            </p>
          </div>

          <div className="mt-8 flex justify-start">
            <AuthCard initialTab={initialTab} />
          </div>
        </div>

        {/* Right: showcase */}
        <div className="hidden lg:block">
          <Showcase />
        </div>
      </div>
    </div>
  );
}
