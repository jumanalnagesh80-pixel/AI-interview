import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Crown,
  Building2,
  ArrowRight,
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

const TIERS = [
  {
    id: "free",
    name: "Starter",
    tagline: "Get a feel for it",
    price: "Free",
    period: "forever",
    cta: "Start free",
    href: "/interview",
    features: [
      { label: "3 face-to-face sessions / month", included: true },
      { label: "Unlimited text mock rounds", included: true },
      { label: "Basic resume analyzer", included: true },
      { label: "Voice & tone scoring", included: false },
      { label: "Body language scoring", included: false },
      { label: "Company simulators (Google, Amazon...)", included: false },
      { label: "Detailed PDF reports", included: false },
      { label: "Priority queue", included: false },
    ],
    accent: "border-white/10",
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For serious candidates",
    price: "$9",
    period: "/month",
    cta: "Go Pro",
    href: "/interview",
    features: [
      { label: "Unlimited face-to-face sessions", included: true },
      { label: "Unlimited mock rounds", included: true },
      { label: "Advanced resume analyzer + ATS scoring", included: true },
      { label: "Voice & tone scoring", included: true },
      { label: "Body language scoring", included: true },
      { label: "All company simulators", included: true },
      { label: "Detailed PDF reports", included: true },
      { label: "Priority queue", included: true },
    ],
    accent: "border-brand-400/40 ring-1 ring-brand-400/30",
    badge: "Most popular",
  },
  {
    id: "team",
    name: "Campus / Team",
    tagline: "For colleges & bootcamps",
    price: "Custom",
    period: "per seat",
    cta: "Talk to us",
    href: "/interview",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Cohort analytics dashboard", included: true },
      { label: "Custom company simulators", included: true },
      { label: "SSO + admin controls", included: true },
      { label: "1:1 mentor add-on", included: true },
      { label: "Branded portal", included: true },
      { label: "Dedicated success manager", included: true },
      { label: "SLA support", included: true },
    ],
    accent: "border-white/10",
    badge: null,
  },
];

const FAQS = [
  {
    q: "Do I need a credit card to try AceTerview?",
    a: "No. The Starter tier is free forever — including 3 face-to-face sessions every month.",
  },
  {
    q: "Can I cancel Pro any time?",
    a: "Yes — cancel any time, you keep Pro until the end of the billing period.",
  },
  {
    q: "Is my video and voice stored?",
    a: "By default, audio is processed in real time and discarded. You can opt in to save sessions for review.",
  },
  {
    q: "Does the AI work in my browser?",
    a: "Yes. Voice + camera run locally via standard browser APIs. We support Chrome, Edge, and Safari (latest).",
  },
  {
    q: "Do you have student discounts?",
    a: "Yes — verified students get 50% off Pro. Campus partnerships get bulk pricing.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="chip mx-auto"><Sparkles className="h-3 w-3 text-brand-400" /> Pricing</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-5xl">
          Cheaper than one rejected loop
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/65">
          Most AI interview tools charge $30+/mo. We don't. Practice unlimited times — pay less than a coffee a week.
        </p>
      </div>

      {/* Tiers */}
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.id}
            className={`relative flex flex-col rounded-2xl border bg-white/[0.03] p-6 ${t.accent}`}
          >
            {t.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-brand-400/40 bg-brand-500/20 px-3 py-1 text-[10px] uppercase tracking-widest text-brand-100">
                {t.badge}
              </span>
            )}
            <div className="flex items-center gap-2">
              {t.id === "pro" ? (
                <Crown className="h-4 w-4 text-warn" />
              ) : t.id === "team" ? (
                <Building2 className="h-4 w-4 text-accent-400" />
              ) : (
                <Sparkles className="h-4 w-4 text-brand-400" />
              )}
              <h3 className="text-lg font-medium">{t.name}</h3>
            </div>
            <p className="mt-1 text-sm text-white/55">{t.tagline}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight text-gradient">{t.price}</span>
              <span className="text-sm text-white/50">{t.period}</span>
            </div>
            <ul className="mt-6 grow space-y-2">
              {t.features.map((f) => (
                <li key={f.label} className="flex items-start gap-2 text-sm">
                  {f.included ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />
                  )}
                  <span className={f.included ? "text-white/85" : "text-white/40 line-through"}>{f.label}</span>
                </li>
              ))}
            </ul>
            <Link href={t.href} className={`mt-6 ${t.id === "pro" ? "btn-primary" : "btn-ghost"} justify-center`}>
              {t.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <section className="mt-20">
        <SectionHeader
          eyebrow="Why Pro is worth it"
          title="A typical user goes from 64 → 86 in 3 weeks"
          subtitle="The Pro features (voice, body language, company simulators) are where the score jumps come from."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Avg. score lift on Pro" value="+22 pts" hint="vs Starter, in 3 weeks" />
          <Stat label="Offer rate (self-reported)" value="2.1x" hint="vs no AI prep" />
          <Stat label="Sessions before first offer" value="14" hint="median, Pro users" />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-20">
        <SectionHeader eyebrow="FAQ" title="Quick answers" />
        <div className="mt-8 grid gap-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition open:bg-white/[0.04]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-white/90">
                {f.q}
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 text-white/60 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-white/65">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/30 via-ink-900/60 to-accent-500/20 p-10 text-center">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative">
            <h3 className="text-3xl font-semibold tracking-tight text-gradient">Try Pro for one cycle</h3>
            <p className="mx-auto mt-3 max-w-xl text-white/70">If your readiness score doesn't go up, cancel — no questions.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/interview" className="btn-primary">
                <Sparkles className="h-4 w-4" /> Start now
              </Link>
              <Link href="/companies" className="btn-ghost">
                <Building2 className="h-4 w-4" /> Explore simulators
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-semibold tracking-tight text-gradient">{value}</div>
      <div className="mt-1 text-sm text-white/85">{label}</div>
      <div className="mt-1 text-xs text-white/45">{hint}</div>
    </div>
  );
}
