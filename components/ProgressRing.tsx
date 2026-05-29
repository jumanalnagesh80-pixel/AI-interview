import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ProgressRing({ value, size = 120, stroke = 10, label, sublabel, className }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const tone =
    v >= 80 ? "text-success" : v >= 60 ? "text-brand-400" : v >= 40 ? "text-warn" : "text-danger";

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6b7eff" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={cn("text-2xl font-semibold tracking-tight", tone)}>{Math.round(v)}{label ? "" : ""}</div>
          {sublabel && <div className="text-[10px] uppercase tracking-widest text-white/40">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
