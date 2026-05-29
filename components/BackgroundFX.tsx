export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* deep base */}
      <div className="absolute inset-0 bg-ink-950" />
      {/* radial brand glow */}
      <div className="absolute inset-0 bg-hero-gradient" />
      {/* subtle grid */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      {/* floating blobs */}
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-[120px] animate-float" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-accent-500/20 blur-[140px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-[120px] animate-float" style={{ animationDelay: "4s" }} />
    </div>
  );
}
