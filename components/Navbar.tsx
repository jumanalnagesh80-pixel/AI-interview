"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  LogIn,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Zap,
  GraduationCap,
  Trophy,
  LayoutDashboard,
  Video,
  Mic,
  FileText,
  Building2,
  CreditCard,
  ClipboardList,
  Brain,
  Activity,
  Crown,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import {
  getStoredUser,
  logout as apiLogout,
  isOwner as isAdminUser,
  type AuthUser,
} from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { href: "/practice", label: "Practice", icon: <Brain className="h-3.5 w-3.5" /> },
  { href: "/exams", label: "Exams", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { href: "/analytics", label: "Analytics", icon: <Activity className="h-3.5 w-3.5" /> },
  { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="h-3.5 w-3.5" /> },
];

const MORE: NavItem[] = [
  { href: "/interview", label: "Face-to-Face AI", icon: <Video className="h-3.5 w-3.5" /> },
  { href: "/mock", label: "Mock Rounds", icon: <Mic className="h-3.5 w-3.5" /> },
  { href: "/resume", label: "Resume", icon: <FileText className="h-3.5 w-3.5" /> },
  { href: "/companies", label: "Companies", icon: <Building2 className="h-3.5 w-3.5" /> },
  { href: "/reports", label: "Reports", icon: <ClipboardList className="h-3.5 w-3.5" /> },
  { href: "/pricing", label: "Pricing", icon: <CreditCard className="h-3.5 w-3.5" /> },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {PRIMARY.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition",
                  active
                    ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(107,126,255,0.3)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdminUser(user) && (
            <Link
              href="/admin"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition",
                isActive("/admin")
                  ? "bg-warn/20 text-warn shadow-[0_0_0_1px_rgba(245,158,11,0.4)]"
                  : "text-warn/85 hover:bg-warn/10 hover:text-warn",
              )}
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition",
                moreOpen ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              More <ChevronDown className={cn("h-3.5 w-3.5 transition", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-ink-950/95 p-1 shadow-glow backdrop-blur"
                onMouseLeave={() => setMoreOpen(false)}
              >
                {MORE.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                      isActive(item.href)
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-brand-500/20 to-accent-500/15 text-brand-200 ring-1 ring-white/10">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side: auth */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-xs text-brand-200">
                <Zap className="h-3 w-3" /> {user.xp.toLocaleString()} XP
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/85 hover:bg-white/10"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/30 text-[10px] font-medium ring-1 ring-white/10">
                  {(user.name || user.email).slice(0, 2).toUpperCase()}
                </span>
                <span className="max-w-[8rem] truncate">{user.name || user.email}</span>
              </Link>
              <button onClick={handleLogout} className="btn-soft" title="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-soft">
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
              <Link href="/signup" className="btn-primary text-xs">
                <Sparkles className="h-3.5 w-3.5" /> Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-white/5 bg-ink-950/95 px-4 pb-4 pt-2 md:hidden">
          <div className="grid gap-1">
            {[...PRIMARY, ...MORE].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  isActive(item.href) ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {isAdminUser(user) && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  isActive("/admin") ? "bg-warn/20 text-warn" : "text-warn/85 hover:bg-warn/10",
                )}
              >
                <Crown className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
          <div className="mt-3 grid gap-2 border-t border-white/5 pt-3">
            {user ? (
              <>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-brand-300" />
                    {user.name || user.email}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-brand-200">
                    <Zap className="h-3 w-3" /> {user.xp.toLocaleString()}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-ghost justify-center">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost justify-center" onClick={() => setOpen(false)}>
                  <LogIn className="h-3.5 w-3.5" /> Sign in
                </Link>
                <Link href="/signup" className="btn-primary justify-center" onClick={() => setOpen(false)}>
                  <Sparkles className="h-3.5 w-3.5" /> Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
