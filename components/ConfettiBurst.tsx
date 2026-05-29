"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface ConfettiHandle {
  /** Fire a burst at the given viewport coordinates (defaults to center of the canvas). */
  fire: (x?: number, y?: number) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  color: string;
  size: number;
}

const COLORS = [
  "#6b7eff", // brand
  "#22d3ee", // cyan
  "#d946ef", // fuchsia
  "#22c55e", // success
  "#f59e0b", // warn
  "#ffffff",
];

let _id = 0;

/**
 * Lightweight CSS confetti that animates a burst from a point.
 * Imperative API via ref.fire(x?, y?).
 *
 *   const ref = useRef<ConfettiHandle>(null);
 *   <ConfettiBurst ref={ref} />
 *   ref.current?.fire(); // fire from current pointer location stored elsewhere
 */
export const ConfettiBurst = forwardRef<ConfettiHandle>(function ConfettiBurst(_props, ref) {
  const [parts, setParts] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    fire(x, y) {
      const rect = containerRef.current?.getBoundingClientRect();
      const ox = x ?? (rect ? rect.width / 2 : 0);
      const oy = y ?? (rect ? rect.height / 2 : 0);

      const newParts: Particle[] = Array.from({ length: 28 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.4;
        const speed = 80 + Math.random() * 140;
        return {
          id: ++_id,
          x: ox,
          y: oy,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 80, // bias upward
          rot: Math.random() * 360,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 4 + Math.random() * 6,
        };
      });

      setParts((p) => [...p, ...newParts]);

      // remove after animation
      setTimeout(() => {
        setParts((p) => p.filter((q) => !newParts.find((n) => n.id === q.id)));
      }, 1600);
    },
  }));

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {parts.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            ["--rot" as string]: `${p.rot + (Math.random() - 0.5) * 720}deg`,
          }}
        />
      ))}
    </div>
  );
});
