export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* deep, calm base */}
      <div className="absolute inset-0 bg-ink-950" />
      {/* one restrained top glow — professional, not flashy */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(62,61,245,0.12)_0%,rgba(6,7,13,0)_70%)]" />
      {/* faint grid for depth */}
      <div className="absolute inset-0 bg-grid opacity-30" />
    </div>
  );
}
