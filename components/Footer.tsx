import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-ink-950/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-white/55">
              Practice, get real-time AI feedback, and walk into any interview calibrated and confident.
            </p>
          </div>

          <FooterCol title="Product" links={[
            ["Face-to-Face AI", "/interview"],
            ["Mock Rounds", "/mock"],
            ["Resume Analyzer", "/resume"],
            ["Reports", "/reports"],
          ]} />

          <FooterCol title="Companies" links={[
            ["Google Loop", "/companies"],
            ["Amazon Bar Raiser", "/companies"],
            ["TCS / Infosys / Wipro", "/companies"],
            ["Pricing", "/pricing"],
          ]} />

          <FooterCol title="Resources" links={[
            ["STAR Method", "/mock"],
            ["System Design", "/mock"],
            ["Behavioral Bank", "/mock"],
            ["Dashboard", "/dashboard"],
          ]} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>(c) {new Date().getFullYear()} AceTerview AI. Built for students and job seekers.</p>
          <p>Crafted with attention to detail. Real-time AI scoring. Privacy-first.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-medium text-white/85">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-white/55 hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
