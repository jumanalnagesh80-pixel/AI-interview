"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Holographic animated score ring.
 * - Outer rotating conic gradient (the "halo")
 * - Inner SVG progress ring with gradient stroke
 * - Animated count-up of the score
 * - 3 orbital dots tracing around the ring
 *
 * Use as the centerpiece of an exam result screen.
 */
export function HoloRing({
  value,
  size = 280,
  stroke = 14,
  label,
  sublabel,
  duration = 1400,
  className,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  duration?: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;

  // Animated count-up
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(v * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [v, duration]);

  const tone =
    v >= 85 ? "text-success"
    : v >= 70 ? "text-brand-300"
    : v >= 50 ? "text-warn"
    : "text-danger";

  return (
    <div
      className={cn("holo-ring relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Halo: rotating conic gradient ring */}
      <span aria-hidden className="holo-halo" />

      {/* Outer faint disc + inner glow */}
      <span aria-hidden className="holo-glow" />

      {/* Progress ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id="holoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6b7eff" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          <filter id="holoBlur">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />

        {/* glow underlay */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#holoGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          filter="url(#holoBlur)"
          opacity={0.7}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />

        {/* main stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#holoGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>

      {/* Orbiting dots */}
      <span aria-hidden className="holo-orbit holo-orbit-1" style={{ "--orbit-r": `${r}px` } as React.CSSProperties} />
      <span aria-hidden className="holo-orbit holo-orbit-2" style={{ "--orbit-r": `${r}px` } as React.CSSProperties} />
      <span aria-hidden className="holo-orbit holo-orbit-3" style={{ "--orbit-r": `${r}px` } as React.CSSProperties} />

      {/* Center label */}
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={cn("text-5xl font-semibold tracking-tight tabular-nums glow-text", tone)}>
            {shown}
            <span className="ml-0.5 text-2xl text-white/45">/100</span>
          </div>
          {label && (
            <div className="mt-1 text-xs uppercase tracking-[0.3em] text-white/55">{label}</div>
          )}
          {sublabel && <div className="mt-0.5 text-[11px] text-white/40">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
