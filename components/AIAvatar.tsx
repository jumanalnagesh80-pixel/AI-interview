"use client";

import { cn } from "@/lib/utils";

interface Props {
  speaking?: boolean;
  listening?: boolean;
  size?: number;
  className?: string;
  name?: string;
}

/**
 * Animated AI interviewer avatar.
 * - Pulse rings when speaking
 * - Eye blink + subtle breath
 * - Waveform "mouth" when speaking
 */
export function AIAvatar({ speaking, listening, size = 240, className, name = "Aria" }: Props) {
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      {/* Outer rings */}
      {speaking && (
        <>
          <span className="pulse-ring" />
          <span className="pulse-ring delay-1" />
          <span className="pulse-ring delay-2" />
        </>
      )}

      {/* Avatar body */}
      <div
        className={cn(
          "relative grid place-items-center rounded-full transition-shadow",
          "bg-gradient-to-br from-brand-500/30 via-brand-700/20 to-accent-500/20",
          "ring-1 ring-white/15 shadow-glow",
          speaking ? "animate-pulse-slow" : "",
        )}
        style={{ width: size * 0.78, height: size * 0.78 }}
      >
        {/* Inner core */}
        <div
          className="relative grid place-items-center rounded-full bg-gradient-to-br from-ink-900 to-ink-950 ring-1 ring-white/10"
          style={{ width: size * 0.6, height: size * 0.6 }}
        >
          {/* Eyes */}
          <div className="flex items-center gap-3" style={{ marginTop: -size * 0.04 }}>
            <Eye blink={!speaking} listening={listening} />
            <Eye blink={!speaking} listening={listening} />
          </div>

          {/* Mouth */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex h-7 items-end justify-center"
            style={{ bottom: size * 0.14 }}
          >
            {speaking ? (
              <div className="flex items-end">
                {[0.1, 0.25, 0.05, 0.3, 0.15].map((d, i) => (
                  <span key={i} className="wave-bar" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
            ) : (
              <span className="block h-0.5 w-7 rounded-full bg-white/30" />
            )}
          </div>
        </div>

        {/* glow ring */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/10 to-accent-500/10 blur-2xl" />
      </div>

      {/* Status chip */}
      <div className="absolute bottom-0 flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/80 px-3 py-1 text-xs backdrop-blur">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            speaking ? "bg-brand-400 animate-pulse" : listening ? "bg-success animate-pulse" : "bg-white/30",
          )}
        />
        <span className="text-white/85">{name}</span>
        <span className="text-white/40">{speaking ? "speaking" : listening ? "listening" : "idle"}</span>
      </div>
    </div>
  );
}

function Eye({ blink, listening }: { blink?: boolean; listening?: boolean }) {
  return (
    <span
      className={cn(
        "block h-3.5 w-3.5 rounded-full bg-gradient-to-b from-brand-300 to-accent-400 shadow-[0_0_12px_rgba(107,126,255,0.7)]",
        listening && "animate-pulse",
      )}
      style={{
        animation: blink ? "blink 4.5s infinite" : undefined,
      }}
    />
  );
}
