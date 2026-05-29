import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Mic,
  Video,
  Brain,
  Star,
  Trophy,
  ShieldCheck,
  FileText,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Activity,
  Wand2,
  GraduationCap,
  Code2,
  Zap,
} from "lucide-react";
import { AIAvatar } from "@/components/AIAvatar";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { TESTIMONIALS, COMPANIES } from "@/lib/data";
import { EXAMS } from "@/lib/exams";

export default function HomePage() {
  return (
    <div className="relative">
      <Hero />
      <TrustBar />
      <CompaniesMarquee />
      <FeatureGrid />
      <FaceToFaceShowcase />
      <ExamsBanner />
      <ComparisonSection />
      <CompaniesStrip />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </div>
  );
}

/* -------------------- Hero -------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" /> New: Real-time face-to-face AI interviews
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            <span className="text-gradient">Ace every interview</span>
            <br />
            <span className="text-white/95">with an AI that talks back.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Practice live with a face-to-face AI interviewer, get scored on voice, words, and body language, and
            simulate real loops at Google, Amazon, TCS, Infosys and more. The most advanced interview coach,
            engineered for students and job seekers.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/interview" className="btn-primary">
              <PlayCircle className="h-4 w-4" /> Start Free Interview
            </Link>
            <Link href="/companies" className="btn-ghost">
              <Building2 className="h-4 w-4" /> Try Company Simulators
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/55">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> No card required</span>
            <span className="inline-flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-brand-400" /> Live scoring</span>
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-accent-400" /> Built for placements</span>
          </div>
        </div>

        {/* Hero visual: AI avatar + floating panels */}
        <div className="relative">
          <div className="glass-strong relative mx-auto flex aspect-[4/5] w-full max-w-[460px] flex-col items-center justify-center overflow-hidden rounded-[2rem] p-6">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-accent-500/10" />
            <AIAvatar speaking size={260} name="Aria" />
            <div className="z-10 mt-6 w-full rounded-xl border border-white/10 bg-ink-900/60 p-3 text-sm text-white/85">
              <span className="text-white/50">Aria:</span> Walk me through a project where you led an
              ambiguous initiative end-to-end.
            </div>

            {/* Floating score chips */}
            <FloatingChip className="left-4 top-6" tone="brand" icon={<Mic className="h-3.5 w-3.5" />}>
              Voice clarity <strong className="ml-1 text-white">86</strong>
            </FloatingChip>
            <FloatingChip className="right-4 top-16" tone="accent" icon={<Video className="h-3.5 w-3.5" />}>
              Eye contact <strong className="ml-1 text-white">92</strong>
            </FloatingChip>
            <FloatingChip className="left-4 bottom-28" tone="success" icon={<Star className="h-3.5 w-3.5" />}>
              Structure <strong className="ml-1 text-white">STAR</strong>
            </FloatingChip>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingChip({
  children,
  className = "",
  tone = "brand",
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "brand" | "accent" | "success";
  icon?: React.ReactNode;
}) {
  const tones = {
    brand: "border-brand-400/30 bg-brand-500/15 text-brand-100",
    accent: "border-accent-400/30 bg-accent-500/15 text-accent-400",
    success: "border-success/30 bg-success/15 text-success",
  } as const;
  return (
    <div
      className={`absolute z-10 inline-flex animate-float items-center gap-1.5 rounded-full border px-3 py-1 text-xs backdrop-blur ${tones[tone]} ${className}`}
    >
      {icon}
      <span className="text-white/80">{children}</span>
    </div>
  );
}

/* -------------------- Trust strip -------------------- */

function TrustBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-4">
        <Metric value={120000} suffix="+" label="interviews scored" />
        <Metric value={49} divisor={10} decimals={1} suffix=" / 5" label="user rating" />
        <Metric value={EXAMS.length} suffix="+" label="competitive exams" />
        <Metric value={200} prefix="<" suffix="ms" label="real-time feedback" />
      </div>
    </section>
  );
}

function Metric({
  value,
  suffix = "",
  prefix = "",
  divisor,
  decimals,
  label,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  divisor?: number;
  decimals?: number;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold tracking-tight text-gradient sm:text-3xl">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          divisor={divisor}
          decimals={decimals}
        />
      </div>
      <div className="text-xs uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}

function CompaniesMarquee() {
  const items = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix",
    "TCS", "Infosys", "Wipro", "Capgemini", "Cognizant", "Accenture",
    "Stripe", "Airbnb", "Uber", "Salesforce",
  ];
  const doubled = [...items, ...items];
  return (
    <section className="mt-10">
      <div className="marquee-mask overflow-hidden">
        <div className="marquee gap-10 px-2 text-sm uppercase tracking-[0.25em] text-white/40">
          {doubled.map((name, i) => (
            <span key={i} className="inline-flex shrink-0 items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Feature grid -------------------- */

function FeatureGrid() {
  const features = [
    {
      icon: <Video className="h-5 w-5" />,
      title: "Face-to-Face AI Interview",
      desc: "An AI interviewer that sees you, hears you, and responds in real time with follow-ups.",
      tag: "Most advanced",
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: "Voice & Tone AI",
      desc: "Detects pace, clarity, filler words, and hedging. Gives speech-level coaching.",
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Body Language Scoring",
      desc: "Eye contact, posture, and expression analysis from your webcam — privacy-first.",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "STAR Answer Coach",
      desc: "Guides you to structure behaviorals as Situation, Task, Action, Result — automatically.",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Resume Analyzer",
      desc: "Parses skills, gaps, and ATS issues. Gives a specific action list to score higher.",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Company Simulators",
      desc: "Real loops modeled after Google, Amazon, Meta, Microsoft, TCS, Infosys, Wipro, Accenture.",
    },
    {
      icon: <Wand2 className="h-5 w-5" />,
      title: "JD-to-Questions",
      desc: "Paste any job description — get a tailored set of likely questions with model answers.",
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: "Competitive Exams",
      desc: "Timed mocks for TCS NQT, Infosys, Wipro, Capgemini, Cognizant, Accenture - sectional + instant scoring.",
      tag: "New",
      href: "/exams",
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Streaks & Leaderboard",
      desc: "Track daily practice, weak topics, and a single 'interview-ready' confidence number.",
      href: "/leaderboard",
    },
  ];

  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Capabilities"
        title="An interview coach that does what others can't"
        subtitle="Every feature engineered to mirror — and improve on — what a real interviewer cares about."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Link
            href={(f as any).href ?? "#"}
            key={f.title}
            className="group neon-ring relative card transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            {f.tag && (
              <span className="absolute right-4 top-4 rounded-full border border-brand-400/30 bg-brand-500/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-brand-200">
                {f.tag}
              </span>
            )}
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
              {f.icon}
            </div>
            <h3 className="mt-4 text-base font-medium">{f.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-white/55">{f.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------- Face-to-Face Showcase -------------------- */

function FaceToFaceShowcase() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> Flagship feature</span>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              Face-to-Face AI Interview
            </h3>
            <p className="mt-3 max-w-xl text-white/65">
              Aria sees your face, hears your voice, and replies with natural follow-up questions — not a
              fixed script. It feels like a real interview, because it is, just with an AI that's calibrated
              against thousands of real loops.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Live transcription with filler-word & pace overlay",
                "Body language scoring (eye contact, posture, expression)",
                "Adaptive follow-ups based on your last answer",
                "Real-time score chips you can see while you speak",
                "End-of-session report with strengths and exact next steps",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-white/80">{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/interview" className="btn-primary">
                <Video className="h-4 w-4" /> Try Face-to-Face
              </Link>
              <Link href="/mock" className="btn-ghost">
                <Mic className="h-4 w-4" /> Practice Mock Rounds
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="glass-strong mx-auto flex aspect-square w-full max-w-[420px] flex-col items-center justify-center rounded-3xl p-6">
              <AIAvatar speaking size={240} name="Aria" />
              <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
                <MiniMetric label="Clarity" v={86} />
                <MiniMetric label="Confidence" v={78} />
                <MiniMetric label="Structure" v={82} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/40 p-3">
      <div className="text-xl font-semibold text-gradient-accent">{v}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}

/* -------------------- Exams banner -------------------- */

function ExamsBanner() {
  const totalQs = EXAMS.reduce((s, e) => s + e.total_questions, 0);
  const totalMin = EXAMS.reduce((s, e) => s + e.duration_min, 0);
  const placement = EXAMS.filter((e) => e.category === "placement");

  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-ink-900/60 to-brand-500/10 p-8 sm:p-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="chip"><GraduationCap className="h-3 w-3 text-emerald-300" /> Placement-ready</span>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              Crack TCS NQT, Infosys, Wipro & every placement drive
            </h3>
            <p className="mt-3 max-w-xl text-white/65">
              Real exam patterns, sectional timing, instant calibration. Not generic quizzes — these mirror the
              actual loops you'll sit for.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/exams" className="btn-primary">
                <Sparkles className="h-4 w-4" /> Try a mock exam
              </Link>
              <Link href="/leaderboard" className="btn-ghost">
                <Trophy className="h-4 w-4" /> Climb the leaderboard
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              <ExamMini value={EXAMS.length} label="Exams" />
              <ExamMini value={totalQs} label="Questions" />
              <ExamMini value={totalMin} label="Minutes" suffix="m" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-start sm:grid-cols-3 lg:grid-cols-2">
            {placement.slice(0, 6).map((e) => (
              <Link
                key={e.id}
                href={`/exams/${e.id}`}
                className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20`}
              >
                <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${e.color} opacity-30 blur-xl`} />
                <div className="relative">
                  <div className="text-[11px] uppercase tracking-widest text-white/55">{e.company ?? "Practice"}</div>
                  <div className="mt-0.5 text-sm font-medium">{e.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/45">
                    <span>{e.duration_min}m</span>
                    <span>·</span>
                    <span>{e.total_questions} Q</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExamMini({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/40 p-3 text-center">
      <div className="text-2xl font-semibold text-gradient-accent">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
}

/* -------------------- Comparison -------------------- */

function ComparisonSection() {
  const rows: { label: string; us: string | boolean; them: string | boolean; highlight?: boolean }[] = [
    { label: "Real face-to-face AI interview", us: true, them: false, highlight: true },
    { label: "Voice & tone scoring", us: "Advanced", them: "Limited" },
    { label: "Body language scoring", us: true, them: false },
    { label: "Company-specific simulators", us: "8+ (Google, Amazon, TCS, Infosys...)", them: "1-2" },
    { label: "STAR answer coach", us: true, them: false },
    { label: "Real-time scoring", us: "Live (<200ms)", them: "Post-session" },
    { label: "JD to tailored questions", us: true, them: "Sometimes" },
    { label: "Free tier", us: "Yes — 3 sessions / month", them: "Trial only" },
    { label: "Pro pricing", us: "$9 / mo", them: "$30 / mo+" },
  ];

  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="vs the rest"
        title="How AceTerview compares to other AI interview sites"
        subtitle="We benchmarked the popular tools and built the gaps."
      />

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-widest text-white/55">
            <tr>
              <th className="px-5 py-4">Feature</th>
              <th className="px-5 py-4">
                <span className="text-white">AceTerview</span>
              </th>
              <th className="px-5 py-4">Other AI sites</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.label}
                className={`border-t border-white/5 ${r.highlight ? "bg-brand-500/5" : i % 2 === 0 ? "bg-white/[0.015]" : ""}`}
              >
                <td className="px-5 py-4 text-white/85">{r.label}</td>
                <td className="px-5 py-4">
                  <Cell value={r.us} positive />
                </td>
                <td className="px-5 py-4">
                  <Cell value={r.them} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cell({ value, positive }: { value: string | boolean; positive?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-2 text-success"><CheckCircle2 className="h-4 w-4" /> Included</span>
    ) : (
      <span className="inline-flex items-center gap-2 text-white/45"><XCircle className="h-4 w-4" /> Missing</span>
    );
  }
  return <span className={positive ? "text-white" : "text-white/55"}>{value}</span>;
}

/* -------------------- Companies strip -------------------- */

function CompaniesStrip() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <SectionHeader
        eyebrow="Company Simulators"
        title="Practice the exact loop you'll walk into"
        subtitle="Real round structures, real question patterns — modeled per company."
      />

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COMPANIES.map((c) => (
          <Link
            href="/companies"
            key={c.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
          >
            <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-30 blur-2xl transition group-hover:opacity-60`} />
            <div className="relative">
              <div className="text-base font-medium">{c.name}</div>
              <div className="mt-1 text-xs text-white/55">{c.style}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.rounds.map((r) => (
                  <span key={r} className="chip text-[10px]">{r}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------- How it works -------------------- */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Upload your resume", desc: "Drop a PDF — Aria parses skills, gaps, and ATS issues." },
    { n: "02", title: "Pick a target role / company", desc: "Choose from 8+ company simulators or paste a JD." },
    { n: "03", title: "Talk to Aria face-to-face", desc: "Live audio + video. Real follow-ups. Real-time chips." },
    { n: "04", title: "Get a calibrated report", desc: "Per-axis score, exact actions, and a readiness number." },
  ];
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <SectionHeader eyebrow="How it works" title="From upload to offer in four steps" align="left" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="card relative">
            <div className="text-sm text-brand-300">{s.n}</div>
            <div className="mt-2 text-base font-medium">{s.title}</div>
            <div className="mt-1 text-sm text-white/55">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------- Testimonials -------------------- */

function Testimonials() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <SectionHeader eyebrow="Loved by candidates" title="From mock to offer" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="card flex h-full flex-col">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-warn text-warn" />
              ))}
            </div>
            <p className="mt-3 grow text-sm text-white/75">"{t.text}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/30 text-xs font-medium ring-1 ring-white/10">
                {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-white/50">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------- CTA -------------------- */

function CTA() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/30 via-ink-900/60 to-accent-500/20 p-10 text-center">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative">
          <h3 className="text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Your next offer starts with a 10-minute mock
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Free to start. No credit card. Real-time AI feedback the second you stop talking.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/interview" className="btn-primary">
              <PlayCircle className="h-4 w-4" /> Start a Free Interview
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              <ArrowRight className="h-4 w-4" /> Open Dashboard
            </Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/55">
            <Users className="h-3.5 w-3.5" /> Trusted by students from IIT, BITS, NIT, VIT and global universities
          </div>
        </div>
      </div>
    </section>
  );
}
