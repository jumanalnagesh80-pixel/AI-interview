"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Wrap any block of content in a 3D mouse-tracked tilt.
 * Pure CSS transforms via CSS variables — no rerenders, ~free at 60fps.
 *
 * <Tilt3D maxDeg={10}>
 *   <div className="card">…</div>
 * </Tilt3D>
 */
export function Tilt3D({
  children,
  className,
  maxDeg = 8,
  scale = 1.012,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  maxDeg?: number;
  /** Resting scale on hover. */
  scale?: number;
  /** Whether to render the radial glare highlight that follows the cursor. */
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * (maxDeg * 2); // tilt up when cursor is high
    const ry = (x - 0.5) * (maxDeg * 2);
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--scale", String(scale));
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--scale", "1");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("tilt3d-root", className)}
    >
      <div className="tilt3d-inner">
        {children}
        {glare && <span aria-hidden className="tilt3d-glare" />}
      </div>
    </div>
  );
}
