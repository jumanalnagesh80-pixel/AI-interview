import Link from "next/link";
import {
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Brain,
  Code2,
  HeartHandshake,
  Network,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { COMPANIES } from "@/lib/data";

const COMPANY_INSIGHTS: Record<
  string,
  { whatToExpect: string; tips: string[]; sample: string[] }
> = {
  google: {
    whatToExpect: "Heavy DSA + system design rigor. Behavioral focused on Googleyness, ambiguity, and scope.",
    tips: [
      "Talk through brute force first, then optimize. Always state Big-O.",
      "For design: capacity estimation and trade-offs are scored heavily.",
      "Behavioral: pick stories that show navigating ambiguity end-to-end.",
    ],
    sample: [
      "Design YouTube's video upload pipeline.",
      "Find the median of two sorted arrays in O(log(min(n, m))).",
      "Tell me about a time you had to make a decision with incomplete data.",
    ],
  },
  amazon: {
    whatToExpect: "STAR-heavy behavioral on the 16 Leadership Principles. Coding + design with bar raiser.",
    tips: [
      "Have 12-15 STAR stories that map to multiple LPs.",
      "Bar Raiser tests depth — expect 'why this and not that?' follow-ups.",
      "Quantify everything: 'cut latency from 800ms to 200ms (-75%) over 3 weeks'.",
    ],
    sample: [
      "Tell me about a time you took ownership of something outside your scope (Ownership).",
      "Tell me about a time you disagreed with your manager (Have Backbone; Disagree and Commit).",
      "Design a parking lot system.",
    ],
  },
  microsoft: {
    whatToExpect: "Balanced coding + design. Strong emphasis on growth mindset and collaboration.",
    tips: [
      "Be coachable — invite hints, iterate on feedback in the room.",
      "Show curiosity: ask clarifying questions before solving.",
      "Practice explaining concepts simply, not impressively.",
    ],
    sample: [
      "Implement an LRU cache.",
      "How would you redesign Outlook search?",
      "Tell me about something you learned from a teammate recently.",
    ],
  },
  meta: {
    whatToExpect: "Two coding rounds + product/design + behavioral. Pace is fast — answers are time-boxed.",
    tips: [
      "Code in 25-30 mins per problem; talk and type at the same time.",
      "Product sense: define users, prioritize ruthlessly, justify trade-offs.",
      "Behavioral: emphasize speed, iteration, and impact metrics.",
    ],
    sample: [
      "Given a binary tree, return its right-side view.",
      "How would you grow Reels engagement among Gen Z?",
      "Tell me about a time you moved fast but had to slow down for quality.",
    ],
  },
  tcs: {
    whatToExpect: "Aptitude (NQT-style) + technical fundamentals + managerial + HR. Communication is scored.",
    tips: [
      "Brush up time/distance, probability, data interpretation for aptitude.",
      "Technical: OOPs, SQL joins, OS basics, one project deep-dive.",
      "HR: clear pitch, why TCS, willingness to relocate.",
    ],
    sample: [
      "Difference between abstract class and interface in Java.",
      "Write SQL: 2nd highest salary per department.",
      "Why do you want to join TCS over a product company?",
    ],
  },
  infosys: {
    whatToExpect: "Online test (verbal + reasoning + coding) -> technical -> HR. Communication weight is high.",
    tips: [
      "Online test: speed beats perfection — answer easy questions first.",
      "Technical: DSA basics, DBMS normalization, OS scheduling, OOPs pillars.",
      "HR: rehearse your introduction in 60 seconds, with one strength + one project.",
    ],
    sample: [
      "Reverse a linked list iteratively and recursively.",
      "Explain ACID properties with examples.",
      "Tell me about a time you led a team in college.",
    ],
  },
  wipro: {
    whatToExpect: "Aptitude + written English + technical (WILP) + HR.",
    tips: [
      "Written English is unique — practice essays of ~250 words.",
      "Tech: focus on fundamentals over depth.",
      "HR: location flexibility and bond awareness are common.",
    ],
    sample: [
      "Write 250 words on AI and ethics.",
      "What is polymorphism? Give an example.",
      "Are you comfortable with shift-based work?",
    ],
  },
  accenture: {
    whatToExpect: "Cognitive assessment + technical assessment + communication + HR.",
    tips: [
      "Communication test: speak clearly, structured answers (situation -> action).",
      "Tech: cloud basics + one core language strong.",
      "HR: align with Accenture's value system and learning culture.",
    ],
    sample: [
      "Difference between IaaS, PaaS, SaaS.",
      "What is the difference between == and === in JavaScript.",
      "Why Accenture and not a service-based competitor?",
    ],
  },
};

export default function CompaniesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip"><Building2 className="h-3 w-3 text-brand-400" /> Company Simulators</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Practice the exact loop you'll walk into
          </h1>
          <p className="mt-1 max-w-2xl text-white/60">
            Real round structures, real question patterns. Pick a company — Aria adapts the rubric, the difficulty,
            and the behavioral expectations to that company.
          </p>
        </div>
        <Link href="/interview" className="btn-primary"><Sparkles className="h-4 w-4" /> Start a simulated loop</Link>
      </div>

      {/* Stats banner */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat icon={<Trophy className="h-4 w-4" />} value="8+" label="Companies modeled" />
        <Stat icon={<Layers className="h-4 w-4" />} value="20+" label="Round structures" />
        <Stat icon={<Brain className="h-4 w-4" />} value="500+" label="Patterned questions" />
        <Stat icon={<ShieldCheck className="h-4 w-4" />} value="Live" label="Adaptive rubric" />
      </div>

      {/* Companies grid */}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {COMPANIES.map((c) => {
          const ins = COMPANY_INSIGHTS[c.id];
          return (
            <article key={c.id} className="card relative overflow-hidden">
              <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${c.color} opacity-25 blur-2xl`} />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{c.name}</h3>
                    <p className="mt-1 text-sm text-white/55">{c.style}</p>
                  </div>
                  <Link href={`/interview?company=${c.id}`} className="btn-soft">
                    Simulate <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.rounds.map((r) => <span key={r} className="chip">{r}</span>)}
                </div>

                {ins && (
                  <>
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-xs uppercase tracking-widest text-white/45">What to expect</p>
                      <p className="mt-2 text-sm text-white/80">{ins.whatToExpect}</p>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-widest text-white/45">Tips that move the bar</p>
                        <ul className="mt-2 space-y-2 text-sm">
                          {ins.tips.map((t) => (
                            <li key={t} className="flex gap-2 text-white/75">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-widest text-white/45">Sample questions</p>
                        <ul className="mt-2 space-y-2 text-sm text-white/75">
                          {ins.sample.map((s) => (
                            <li key={s} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Round taxonomy */}
      <section className="mt-16">
        <SectionHeader
          eyebrow="Round taxonomy"
          title="What every loop is really testing"
          subtitle="Companies vary on which rounds they weigh — but the underlying skills overlap."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RoundCard icon={<HeartHandshake className="h-5 w-5" />} title="HR / Fit" desc="Motivation, communication, expectations alignment." weight="Light" />
          <RoundCard icon={<Brain className="h-5 w-5" />} title="Behavioral" desc="STAR-format past behavior as a predictor of future behavior." weight="Heavy at FAANG, Amazon" />
          <RoundCard icon={<Code2 className="h-5 w-5" />} title="Coding / DSA" desc="Problem decomposition, data structures, complexity reasoning." weight="Heavy at product cos" />
          <RoundCard icon={<Network className="h-5 w-5" />} title="System Design" desc="Trade-offs, bottlenecks, scaling decisions, observability." weight="Senior+ rounds" />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/30 via-ink-900/60 to-accent-500/20 p-10 text-center">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative">
            <h3 className="text-3xl font-semibold tracking-tight text-gradient">Walk into your loop pre-calibrated</h3>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Pick a company, run a 10-minute mock. Aria adapts the rubric and gives you a per-round readiness number.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/interview" className="btn-primary"><Sparkles className="h-4 w-4" /> Start simulated loop</Link>
              <Link href="/pricing" className="btn-ghost">See pricing <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold text-gradient-accent">{value}</div>
        <div className="text-xs text-white/50">{label}</div>
      </div>
    </div>
  );
}

function RoundCard({ icon, title, desc, weight }: { icon: React.ReactNode; title: string; desc: string; weight: string }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
          {icon}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/55">{weight}</span>
      </div>
      <h3 className="mt-4 text-base font-medium">{title}</h3>
      <p className="mt-1 text-sm text-white/55">{desc}</p>
    </div>
  );
}
