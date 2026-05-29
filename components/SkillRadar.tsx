"use client";

interface Item {
  label: string;
  value: number; // 0-100
}

interface Props {
  data: Item[];
  size?: number;
}

export function SkillRadar({ data, size = 320 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;

  const points = data.map((d, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (d.value / 100) * radius;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      ax: cx + Math.cos(angle) * radius,
      ay: cy + Math.sin(angle) * radius,
      label: d.label,
      value: d.value,
    };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6b7eff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <circle
          key={s}
          cx={cx}
          cy={cy}
          r={radius * s}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* spokes */}
      {points.map((p) => (
        <line key={p.label} x1={cx} y1={cy} x2={p.ax} y2={p.ay} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}

      {/* shape */}
      <path d={path} fill="url(#radarFill)" stroke="#6b7eff" strokeWidth={1.5} />

      {/* points */}
      {points.map((p) => (
        <circle key={p.label + "pt"} cx={p.x} cy={p.y} r={3} fill="#fff" />
      ))}

      {/* labels */}
      {points.map((p) => {
        const dx = p.ax - cx;
        const dy = p.ay - cy;
        const off = 14;
        const lx = p.ax + (dx / radius) * off;
        const ly = p.ay + (dy / radius) * off;
        const anchor = dx > 4 ? "start" : dx < -4 ? "end" : "middle";
        return (
          <g key={p.label + "lab"}>
            <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" className="fill-white/70" fontSize={11}>
              {p.label}
            </text>
            <text x={lx} y={ly + 12} textAnchor={anchor} dominantBaseline="middle" className="fill-white/40" fontSize={10}>
              {p.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
