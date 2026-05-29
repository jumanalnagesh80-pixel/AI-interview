"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview", label: "Face-to-Face AI" },
  { href: "/mock", label: "Mock Rounds" },
  { href: "/resume", label: "Resume" },
  { href: "/companies", label: "Companies" },
  { href: "/reports", label: "Reports" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/interview" className="btn-primary text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Start Interview
          </Link>
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-ink-950/95 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/interview" onClick={() => setOpen(false)} className="btn-primary mt-2">
              <Sparkles className="h-3.5 w-3.5" /> Start Interview
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
