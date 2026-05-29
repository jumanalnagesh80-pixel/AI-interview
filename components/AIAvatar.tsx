"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * AceFace - advanced humanoid AI interviewer.
 *
 * Renders a stylised SVG face with:
 *   - blinking eyes that subtly follow the cursor
 *   - eyebrows that lift when speaking
 *   - a "breathing" subtle scale on idle
 *   - a viseme-style mouth driven by Web Audio analyser when audio is fed in,
 *     otherwise a procedural lip-sync while `speaking` is true
 *   - pulse halo rings while speaking
 *   - an inner status indicator (idle / listening / speaking)
 *
 * Drop-in replacement for the previous AIAvatar API:
 *   <AIAvatar speaking listening size={260} name="Aria" />
 */

interface Props {
  speaking?: boolean;
  listening?: boolean;
  size?: number;
  className?: string;
  name?: string;
  /**
   * Optional MediaStream (e.g. from speech synthesis or a remote TTS source) that
   * the mouth will lip-sync against. If omitted, we use a procedural pseudo-sync
   * while `speaking` is true so the face still feels alive.
   */
  audioStream?: MediaStream | null;
}

export function AIAvatar({
  speaking,
  listening,
  size = 240,
  className,
  name = "Aria",
  audioStream = null,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Eye gaze offsets (px around centre)
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  // Mouth opening 0..1
  const [openness, setOpenness] = useState(0);

  // Track cursor across the page so eyes look at the visitor.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth; // -.5..+.5
      const dy = (e.clientY - cy) / window.innerHeight;
      setGaze({
        x: Math.max(-1, Math.min(1, dx * 2)),
        y: Math.max(-1, Math.min(1, dy * 2)),
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Drive the mouth: real audio if a stream is provided, otherwise procedural.
  useEffect(() => {
    let raf = 0;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArr: Uint8Array | null = null;
    let cleanup = () => {};

    if (speaking && audioStream && typeof window !== "undefined") {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(audioStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        dataArr = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          // any cast bridges TS5.7's stricter Uint8Array generic vs lib.dom typings
          (analyser as any).getByteFrequencyData(dataArr);
          // emphasise human voice band ~ 100-3000 Hz
          let sum = 0;
          let count = 0;
          for (let i = 2; i < 28 && i < dataArr!.length; i++) {
            sum += dataArr![i];
            count += 1;
          }
          const avg = sum / Math.max(1, count) / 255;
          setOpenness(Math.min(1, avg * 1.6));
          raf = requestAnimationFrame(tick);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          audioCtx?.close().catch(() => undefined);
        };
      } catch {
        // fall through to procedural
      }
    }

    if (speaking && !audioStream) {
      // procedural pseudo-lip-sync — multi-frequency noise for natural rhythm
      const start = performance.now();
      const tick = (t: number) => {
        const dt = (t - start) / 1000;
        const v =
          (Math.sin(dt * 9.7) * 0.5 + 0.5) * 0.6 +
          (Math.sin(dt * 17.3 + 0.6) * 0.5 + 0.5) * 0.3 +
          (Math.sin(dt * 4.1) * 0.5 + 0.5) * 0.1;
        // bias closed slightly so the mouth periodically settles
        const opened = Math.max(0, v - 0.18) * 1.2;
        setOpenness(Math.min(1, opened));
        raf = requestAnimationFrame(tick);
      };
      tick(performance.now());
      cleanup = () => cancelAnimationFrame(raf);
    }

    if (!speaking) {
      // ease the mouth shut
      const start = performance.now();
      const tick = (t: number) => {
        const dt = (t - start) / 200;
        setOpenness((o) => Math.max(0, o - 0.08));
        if (dt < 1) raf = requestAnimationFrame(tick);
      };
      tick(performance.now());
      cleanup = () => cancelAnimationFrame(raf);
    }

    return cleanup;
  }, [speaking, audioStream]);

  // ---- Geometry derived from size ----
  const w = size;
  const h = size;

  // eye centres (within the SVG 240 viewBox)
  const eyeY = 110;
  const eyeXL = 86;
  const eyeXR = 154;

  // gaze translate in svg units
  const gx = gaze.x * 4;
  const gy = gaze.y * 3;

  // mouth open in svg units
  const mouthY = 162;
  const mouthOpenH = 4 + openness * 18;
  const mouthOpenW = 36 - openness * 4;

  // brow lift while speaking
  const browY = speaking ? 78 : 82;

  return (
    <div
      ref={wrapRef}
      className={cn("relative grid place-items-center", className)}
      style={{ width: w, height: h }}
    >
      {speaking && (
        <>
          <span className="pulse-ring" />
          <span className="pulse-ring delay-1" />
          <span className="pulse-ring delay-2" />
        </>
      )}

      {/* breathing wrapper */}
      <div
        className={cn(
          "relative grid place-items-center",
          !speaking && "ace-breathing",
        )}
        style={{ width: w * 0.92, height: h * 0.92 }}
      >
        <svg
          viewBox="0 0 240 240"
          width={w * 0.92}
          height={h * 0.92}
          className="overflow-visible"
        >
          <defs>
            {/* skin gradient */}
            <radialGradient id="skin" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#3b4170" />
              <stop offset="55%" stopColor="#1d2244" />
              <stop offset="100%" stopColor="#0a0c1c" />
            </radialGradient>
            {/* iris */}
            <radialGradient id="iris" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#bfd2ff" />
              <stop offset="55%" stopColor="#6b7eff" />
              <stop offset="100%" stopColor="#1f2e7a" />
            </radialGradient>
            {/* outer halo */}
            <radialGradient id="halo" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#6b7eff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            {/* lip gradient */}
            <linearGradient id="lip" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8da3ff" />
              <stop offset="100%" stopColor="#4d57c6" />
            </linearGradient>
            {/* glow filter for eyes */}
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* halo background */}
          <circle cx="120" cy="120" r="115" fill="url(#halo)" />

          {/* head silhouette */}
          <ellipse
            cx="120"
            cy="125"
            rx="80"
            ry="92"
            fill="url(#skin)"
            stroke="rgba(180,195,255,0.18)"
            strokeWidth="1.2"
          />

          {/* hairline */}
          <path
            d="M 50 95 Q 120 30 190 95 Q 168 70 120 65 Q 72 70 50 95 Z"
            fill="rgba(15, 18, 36, 0.95)"
            stroke="rgba(180,195,255,0.18)"
            strokeWidth="0.6"
          />

          {/* eyebrows */}
          <path
            d={`M ${eyeXL - 16} ${browY} Q ${eyeXL} ${browY - 5} ${eyeXL + 16} ${browY}`}
            stroke="rgba(180,195,255,0.55)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            style={{ transition: "all 0.25s ease" }}
          />
          <path
            d={`M ${eyeXR - 16} ${browY} Q ${eyeXR} ${browY - 5} ${eyeXR + 16} ${browY}`}
            stroke="rgba(180,195,255,0.55)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            style={{ transition: "all 0.25s ease" }}
          />

          {/* eyes - left */}
          <Eye cx={eyeXL} cy={eyeY} gx={gx} gy={gy} listening={listening} />
          {/* eyes - right */}
          <Eye cx={eyeXR} cy={eyeY} gx={gx} gy={gy} listening={listening} />

          {/* nose */}
          <path
            d="M 120 118 L 116 142 Q 120 146 124 142 Z"
            fill="rgba(180,195,255,0.18)"
          />

          {/* mouth (animates with `openness`) */}
          <g transform={`translate(120 ${mouthY})`}>
            <ellipse
              cx="0"
              cy="0"
              rx={mouthOpenW / 2}
              ry={Math.max(2, mouthOpenH / 2)}
              fill="rgba(40, 22, 50, 0.85)"
              stroke="url(#lip)"
              strokeWidth="2"
              style={{ transition: "rx 0.05s linear, ry 0.05s linear" }}
            />
            {/* teeth highlight when open */}
            {openness > 0.3 && (
              <rect
                x={-mouthOpenW / 3}
                y={-Math.max(2, mouthOpenH / 2) + 1}
                width={(mouthOpenW * 2) / 3}
                height={1.4}
                fill="rgba(255,255,255,0.55)"
                rx="0.5"
              />
            )}
          </g>

          {/* cheek glow when speaking */}
          {speaking && (
            <>
              <circle cx="76" cy="148" r="14" fill="rgba(217,70,239,0.15)" filter="url(#eyeGlow)" />
              <circle cx="164" cy="148" r="14" fill="rgba(34,211,238,0.15)" filter="url(#eyeGlow)" />
            </>
          )}

          {/* listening indicator: 3 sound bars near ear */}
          {listening && (
            <g transform="translate(190 130)">
              {[0, 1, 2].map((i) => (
                <rect
                  key={i}
                  x={i * 5}
                  y={-8 + (i % 2) * 2}
                  width="3"
                  height={6 + (i % 2) * 5}
                  fill="#22c55e"
                  rx="1"
                >
                  <animate
                    attributeName="height"
                    values="6;14;6"
                    dur={`${0.6 + i * 0.15}s`}
                    repeatCount="indefinite"
                  />
                </rect>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* status pill */}
      <div className="absolute bottom-0 flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/80 px-3 py-1 text-xs backdrop-blur">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            speaking ? "bg-brand-400 animate-pulse" : listening ? "bg-success animate-pulse" : "bg-white/30",
          )}
        />
        <span className="text-white/85">{name}</span>
        <span className="text-white/40">
          {speaking ? "speaking" : listening ? "listening" : "idle"}
        </span>
      </div>
    </div>
  );
}

function Eye({
  cx,
  cy,
  gx,
  gy,
  listening,
}: {
  cx: number;
  cy: number;
  gx: number;
  gy: number;
  listening?: boolean;
}) {
  return (
    <g>
      {/* eye white socket */}
      <ellipse
        cx={cx}
        cy={cy}
        rx="13"
        ry="9"
        fill="rgba(232, 236, 243, 0.92)"
      />
      {/* iris (translates with gaze) */}
      <g style={{ transform: `translate(${gx}px, ${gy}px)`, transition: "transform 0.18s ease" }}>
        <circle cx={cx} cy={cy} r="6.5" fill="url(#iris)" filter="url(#eyeGlow)" />
        <circle cx={cx} cy={cy} r="3.4" fill="#06070d" />
        <circle cx={cx - 1.6} cy={cy - 1.6} r="1.2" fill="rgba(255,255,255,0.95)" />
      </g>
      {/* eyelid - blink animation */}
      <ellipse
        cx={cx}
        cy={cy}
        rx="13"
        ry="9"
        fill="url(#skin)"
        className={listening ? "ace-eyelid-listening" : "ace-eyelid"}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    </g>
  );
}
