"use client";

import { cn } from "@/lib/utils";

/**
 * GitHub-style streak heatmap. Generates 12 weeks of mock activity if no data.
 */
export function StreakHeatmap({ days = 84, seed = 7 }: { days?: number; seed?: number }) {
  // deterministic pseudo-random
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const cells: number[] = Array.from({ length: days }, (_, i) => {
    const r = rand();
    // make recent days more active
    const recencyBoost = i / days;
    const v = r * 0.6 + recencyBoost * 0.5;
    return v < 0.3 ? 0 : v < 0.5 ? 1 : v < 0.7 ? 2 : v < 0.85 ? 3 : 4;
  });

  const intensity = (n: number) => {
    if (n === 0) return "bg-white/[0.04]";
    if (n === 1) return "bg-brand-500/30";
    if (n === 2) return "bg-brand-500/55";
    if (n === 3) return "bg-brand-400/80";
    return "bg-accent-400";
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ width: `${(days / 7) * 14}px` }}>
        {cells.map((v, i) => (
          <div
            key={i}
            className={cn("h-3 w-3 rounded-[3px] transition", intensity(v))}
            title={`${v} sessions`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className={cn("h-3 w-3 rounded-[3px]", intensity(n))} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
