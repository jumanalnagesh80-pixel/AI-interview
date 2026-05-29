"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `value` once it scrolls into view.
 * Props are kept fully serializable so this can be used from server components.
 */
export function AnimatedCounter({
  value,
  duration = 1400,
  decimals = 0,
  divisor,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  /** Number of decimals to show in the formatted output. */
  decimals?: number;
  /** If set, the displayed number is `value / divisor`. Used e.g. for "4.9 / 5" with value=49, divisor=10. */
  divisor?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisplay(Math.round(value * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  const shown = divisor ? (display / divisor).toFixed(decimals) : decimals ? display.toFixed(decimals) : display.toLocaleString();

  return (
    <span ref={ref} className={"counter " + (className ?? "")}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
