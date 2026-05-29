interface Props {
  values: number[]; // 0-100
  width?: number;
  height?: number;
  className?: string;
}

export function SparkLine({ values, width = 600, height = 160, className }: Props) {
  if (values.length === 0) return null;
  const min = 0;
  const max = 100;
  const stepX = width / (values.length - 1 || 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / (max - min)) * (height - 20) - 10;
    return [x, y] as [number, number];
  });
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b7eff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#6b7eff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6b7eff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* horizontal grid */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} y1={height * p} x2={width} y2={height * p} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 6" />
      ))}

      <path d={areaPath} fill="url(#sparkArea)" />
      <path d={linePath} fill="none" stroke="url(#sparkLine)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === points.length - 1 ? 4 : 2.5} fill="#fff" stroke="#6b7eff" strokeWidth={i === points.length - 1 ? 2 : 0} />
      ))}
    </svg>
  );
}
