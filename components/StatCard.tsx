import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: number; // +2, -3 etc (percent)
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, delta, hint, icon, className }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn("card flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-white/45">{label}</span>
        {icon && <span className="text-white/40">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs",
              positive ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-white/50">{hint}</span>}
    </div>
  );
}
