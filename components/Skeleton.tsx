import { cn } from "@/lib/utils";

/** Generic shimmer skeleton block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md", className)} aria-hidden />;
}

/** Card-shaped skeleton that mirrors the exam card layout on the hub. */
export function ExamCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5" aria-hidden>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-4/5" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}
