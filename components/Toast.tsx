"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message: string, kind: ToastKind = "info", duration = 3500) => {
      const id = ++_id;
      setItems((list) => [...list, { id, kind, message, duration }]);
      const handle = setTimeout(() => remove(id), duration);
      timers.current.set(id, handle);
    },
    [remove],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value: ToastContextValue = {
    toast: push,
    success: (m, d) => push(m, "success", d),
    error: (m, d) => push(m, "error", d),
    info: (m, d) => push(m, "info", d),
    warning: (m, d) => push(m, "warning", d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        role="region"
        aria-label="Notifications"
      >
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const tones: Record<ToastKind, { cls: string; icon: ReactNode }> = {
    success: { cls: "border-success/30 bg-success/10 text-success", icon: <CheckCircle2 className="h-4 w-4" /> },
    error: { cls: "border-danger/30 bg-danger/10 text-danger", icon: <XCircle className="h-4 w-4" /> },
    warning: { cls: "border-warn/30 bg-warn/10 text-warn", icon: <AlertTriangle className="h-4 w-4" /> },
    info: { cls: "border-brand-400/30 bg-brand-500/10 text-brand-200", icon: <Info className="h-4 w-4" /> },
  };
  const tone = tones[item.kind];
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-glow backdrop-blur-xl",
        "animate-[toastIn_0.25s_ease]",
        tone.cls,
      )}
    >
      <span className="mt-0.5 shrink-0">{tone.icon}</span>
      <span className="flex-1 text-white/90">{item.message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="-mr-1 grid h-6 w-6 shrink-0 place-items-center rounded-md text-white/45 hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op fallback so components never crash if used outside the provider.
    const noop = () => undefined;
    return { toast: noop, success: noop, error: noop, info: noop, warning: noop };
  }
  return ctx;
}
