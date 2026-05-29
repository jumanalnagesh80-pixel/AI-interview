"use client";

import { cn } from "@/lib/utils";

/**
 * Decorative animated SVG blob with morphing path. Pure SVG `<animate>` so it
 * costs nothing on the JS side. Use as a background accent inside hero panels.
 */
export function LiquidBlob({
  className,
  colorFrom = "#6b7eff",
  colorTo = "#22d3ee",
  duration = 14,
}: {
  className?: string;
  colorFrom?: string;
  colorTo?: string;
  duration?: number;
}) {
  // Three slightly different blob shapes the path morphs between.
  const shapes = [
    "M421,317Q417,384,355,418.5Q293,453,229,432Q165,411,121,367.5Q77,324,72,253Q67,182,121,131Q175,80,247,79Q319,78,377,124.5Q435,171,431,235.5Q427,300,421,317Z",
    "M407,309Q407,368,355,408Q303,448,233,436Q163,424,116,374Q69,324,77,250.5Q85,177,140,134Q195,91,261,91Q327,91,377,138Q427,185,422,242.5Q417,300,407,309Z",
    "M412,313Q406,376,351,407.5Q296,439,232,433Q168,427,124,381Q80,335,69,261.5Q58,188,116,140Q174,92,247,89Q320,86,373,134Q426,182,425,247.5Q424,313,412,313Z",
  ];
  const id = `liquid-${duration}`;

  return (
    <svg
      viewBox="0 0 500 500"
      className={cn("pointer-events-none absolute", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorFrom} stopOpacity="0.55" />
          <stop offset="100%" stopColor={colorTo} stopOpacity="0.25" />
        </linearGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <path
        d={shapes[0]}
        fill={`url(#${id}-grad)`}
        filter={`url(#${id}-blur)`}
      >
        <animate
          attributeName="d"
          dur={`${duration}s`}
          repeatCount="indefinite"
          values={[...shapes, shapes[0]].join(";")}
          calcMode="spline"
          keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
        />
      </path>
    </svg>
  );
}
