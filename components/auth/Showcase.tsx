"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Trophy,
  Brain,
  Activity,
  Mic,
  GraduationCap,
} from "lucide-react";
import { AIAvatar } from "../AIAvatar";

const TESTIMONIALS = [
  { name: "Priya R.", role: "Hired @ Google", text: "The face-to-face AI felt eerily real. Eye-contact feedback fixed me in two weeks." },
  { name: "Arjun S.", role: "Hired @ Amazon", text: "Bar Raiser simulator was the difference. Walked into Amazon loops fully calibrated." },
  { name: "Karan P.", role: "Hired @ TCS Digital", text: "TCS NQT mock nailed the actual pattern. Got placed in my first attempt." },
  { name: "Mei L.", role: "Hired @ Stripe", text: "Real-time scoring beats the static reports from competitors. My favourite tool." },
];

export function Showcase() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <div className="glass-strong relative h-full overflow-hidden rounded-3xl p-7">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-accent-500/10" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="beam-bg" />

      <div className="relative flex h-full flex-col gap-6">
        <div className="flex items-center justify-between text-xs">
          <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> PrepMate AI</span>
          <span className="chip"><ShieldCheck className="h-3 w-3 text-success" /> Privacy-first</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <AIAvatar speaking size={220} name="Aria" />

          <div className="text-center">
            <p className="text-sm leading-relaxed text-white/85">
              "{t.text}"
            </p>
            <p className="mt-3 text-xs text-white/55">
              <span className="font-medium text-white/80">{t.name}</span> &middot; {t.role}
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${i === idx ? "w-6 bg-brand-400" : "w-2 bg-white/15"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Pill icon={<Brain className="h-3.5 w-3.5" />} label="Live AI" value="Realtime" />
          <Pill icon={<Trophy className="h-3.5 w-3.5" />} label="Earn" value="+25 / mock" />
          <Pill icon={<Activity className="h-3.5 w-3.5" />} label="Latency" value="<200ms" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
          <Mini icon={<Mic className="h-3 w-3" />} label="Face-to-face" />
          <Mini icon={<GraduationCap className="h-3 w-3" />} label="10+ exams" />
          <Mini icon={<Trophy className="h-3 w-3" />} label="Leaderboard" />
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/55 p-2.5 text-center">
      <div className="inline-flex items-center justify-center gap-1 text-brand-200">
        {icon}
        <span className="text-[11px] font-medium">{value}</span>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] py-1.5">
      <span className="text-brand-300">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
