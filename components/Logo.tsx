import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-brand-600 ring-1 ring-inset ring-white/15">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
          <path
            d="M12 2L4 6v6c0 5 3.5 9.4 8 10 4.5-.6 8-5 8-10V6l-8-4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex items-baseline gap-1 leading-none">
        <span className="text-base font-semibold tracking-tight">PrepMate</span>
        <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/40 sm:inline">AI</span>
      </div>
    </div>
  );
}
