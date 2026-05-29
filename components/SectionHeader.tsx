import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, align = "left", className }: Props) {
  return (
    <div className={cn("flex flex-col", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">{title}</h2>
      {subtitle && <p className={cn("mt-3 max-w-2xl text-white/60", align === "center" && "mx-auto")}>{subtitle}</p>}
    </div>
  );
}
