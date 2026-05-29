"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  X,
  Lightbulb,
  Wand2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { SectionHeader } from "@/components/SectionHeader";
import { cn } from "@/lib/utils";

type Status = "idle" | "uploading" | "analyzing" | "done";

interface AnalysisResult {
  overall: number;
  ats: number;
  impact: number;
  clarity: number;
  keywords: number;
  detectedSkills: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: { title: string; detail: string; severity: "low" | "med" | "high" }[];
  summary: string;
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [target, setTarget] = useState("Software Engineer");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (!file && pasted.trim().length < 80) return;
    setStatus("uploading");
    setProgress(0);
    // fake upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 50));
      setProgress(i);
    }
    setStatus("analyzing");
    await new Promise((r) => setTimeout(r, 1100));
    setResult(mockAnalyze(file?.name ?? "pasted-resume", pasted, target));
    setStatus("done");
  };

  const reset = () => {
    setFile(null);
    setPasted("");
    setStatus("idle");
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Resume Analyzer"
        title="ATS-aware AI resume scoring"
        subtitle="Drop your resume — get a per-axis score, missing keywords for your target role, and a prioritised action list."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        {/* LEFT: input */}
        <div className="lg:col-span-3">
          <div
            className={cn(
              "card relative flex min-h-[260px] flex-col items-center justify-center border-dashed transition",
              file ? "border-success/40 bg-success/5" : "hover:border-white/30 hover:bg-white/[0.05]",
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              id="resume-input"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {!file ? (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 ring-1 ring-white/10">
                  <Upload className="h-5 w-5 text-brand-200" />
                </div>
                <p className="mt-4 text-sm text-white/80">Drop your resume PDF here</p>
                <p className="text-xs text-white/45">or</p>
                <label htmlFor="resume-input" className="btn-soft mt-2 cursor-pointer">
                  Choose file
                </label>
                <p className="mt-3 text-[11px] text-white/40">PDF, DOCX or TXT — we never store your file.</p>
              </>
            ) : (
              <div className="flex w-full max-w-md items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/20 text-brand-200 ring-1 ring-white/10">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm">{file.name}</div>
                    <div className="text-xs text-white/45">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button onClick={reset} className="rounded-md p-1 text-white/50 hover:bg-white/5 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">Or paste resume text</p>
              <span className="text-xs text-white/40">{pasted.length} chars</span>
            </div>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Paste plain-text resume content here..."
              rows={6}
              className="mt-3 w-full resize-y rounded-lg border border-white/10 bg-ink-950/60 p-3 text-sm text-white/90 outline-none focus:border-brand-400/50"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="card">
              <label className="text-xs uppercase tracking-widest text-white/45">Target role</label>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. Frontend Developer at Stripe"
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink-950/60 px-3 py-2 text-sm outline-none focus:border-brand-400/50"
              />
            </div>
            <button
              disabled={(!file && pasted.trim().length < 80) || status === "uploading" || status === "analyzing"}
              onClick={analyze}
              className="btn-primary h-12 disabled:opacity-50"
            >
              {status === "uploading" || status === "analyzing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status === "uploading" ? `Uploading ${progress}%` : "Analyzing..."}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> Analyze with AI
                </>
              )}
            </button>
          </div>

          {(status === "uploading" || status === "analyzing") && <PipelineStages status={status} />}
        </div>

        {/* RIGHT: tips */}
        <div className="lg:col-span-2">
          <div className="card">
            <p className="text-xs uppercase tracking-widest text-white/45">What we score</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["ATS compatibility", "Section headers, parseability, keyword density, no graphics traps."],
                ["Impact language", "Action verbs, quantified outcomes, ownership signals."],
                ["Clarity & structure", "Length, bullet rhythm, scannability, consistent tense."],
                ["Role fit", "Keyword match against your target role / JD."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div>
                    <div className="text-white/85">{t}</div>
                    <div className="text-xs text-white/55">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card mt-4">
            <p className="text-xs uppercase tracking-widest text-white/45">Privacy</p>
            <p className="mt-2 inline-flex items-start gap-2 text-sm text-white/70">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
              Files are processed in-memory. We don't share or sell your resume.
            </p>
          </div>
        </div>
      </div>

      {result && status === "done" && <ResultView result={result} target={target} onReset={reset} />}
    </div>
  );
}

function PipelineStages({ status }: { status: "uploading" | "analyzing" }) {
  return (
    <div className="mt-4 card">
      <p className="text-xs uppercase tracking-widest text-white/45">Pipeline</p>
      <ol className="mt-3 space-y-2 text-sm">
        <Stage active={status === "uploading"} done={status === "analyzing"} label="Upload & parse PDF" />
        <Stage active={status === "analyzing"} label="Extract skills & sections" />
        <Stage active={status === "analyzing"} label="ATS keyword match against target role" />
        <Stage active={status === "analyzing"} label="LLM evaluation: clarity, impact, structure" />
      </ol>
    </div>
  );
}

function Stage({ active, done, label }: { active?: boolean; done?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full ring-1",
          done
            ? "bg-success/20 text-success ring-success/30"
            : active
              ? "bg-brand-500/20 text-brand-300 ring-brand-400/30"
              : "bg-white/5 text-white/40 ring-white/10",
        )}
      >
        {done ? <CheckCircle2 className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : "·"}
      </span>
      <span className={done ? "text-white/80 line-through decoration-white/30" : active ? "text-white" : "text-white/55"}>
        {label}
      </span>
    </li>
  );
}

function ResultView({ result, target, onReset }: { result: AnalysisResult; target: string; onReset: () => void }) {
  return (
    <section className="mt-10">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> AI analysis ready</span>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-gradient">Resume scored against {target}</h3>
            <p className="mt-1 max-w-2xl text-sm text-white/65">{result.summary}</p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={result.overall} size={120} stroke={10} sublabel="overall" />
            <button onClick={onReset} className="btn-ghost"><Wand2 className="h-3.5 w-3.5" /> New analysis</button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Axis label="ATS" v={result.ats} />
          <Axis label="Impact" v={result.impact} />
          <Axis label="Clarity" v={result.clarity} />
          <Axis label="Keywords" v={result.keywords} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card">
          <p className="text-xs uppercase tracking-widest text-white/45">Detected skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.detectedSkills.map((s) => (
              <span key={s} className="chip"><CheckCircle2 className="h-3 w-3 text-success" /> {s}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="text-xs uppercase tracking-widest text-white/45">Missing keywords for {target}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.missingKeywords.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2.5 py-1 text-xs text-warn">
                <AlertTriangle className="h-3 w-3" /> {k}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/50">Add these where they truthfully apply — recruiters and ATS scanners look for them.</p>
        </div>

        <div className="card">
          <p className="text-xs uppercase tracking-widest text-white/45">Strengths</p>
          <ul className="mt-3 space-y-2 text-sm">
            {result.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span className="text-white/80">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Prioritised action plan</p>
          <span className="chip"><Lightbulb className="h-3 w-3 text-warn" /> {result.improvements.length} actions</span>
        </div>
        <div className="mt-4 space-y-3">
          {result.improvements.map((imp, i) => {
            const tone = imp.severity === "high"
              ? "border-danger/30 bg-danger/5"
              : imp.severity === "med"
                ? "border-warn/30 bg-warn/5"
                : "border-white/10 bg-white/[0.02]";
            const dot = imp.severity === "high" ? "bg-danger" : imp.severity === "med" ? "bg-warn" : "bg-success";
            return (
              <div key={i} className={cn("rounded-xl border p-4", tone)}>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", dot)} />
                  <span className="text-sm font-medium">{imp.title}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-widest text-white/45">{imp.severity}</span>
                </div>
                <p className="mt-1.5 text-sm text-white/65">{imp.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Axis({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-white/45">{label}</span>
        <span className="text-lg font-semibold text-gradient-accent">{v}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/* --------------- Mock analyzer --------------- */
// Real impl: send to /api/resume which calls Claude/OpenAI. For demo this is deterministic.
function mockAnalyze(name: string, text: string, target: string): AnalysisResult {
  const seed = (name + text + target).length;
  const rand = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };
  const score = (offset: number, base: number) => Math.round(base + rand(offset) * 18);

  const overall = Math.round((score(1, 64) + score(2, 70) + score(3, 72) + score(4, 60)) / 4);

  const tlc = (text + " " + name).toLowerCase();
  const possibleSkills = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java",
    "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes",
    "REST APIs", "GraphQL", "TensorFlow", "PyTorch", "Git", "CI/CD", "Agile",
  ];
  const detected = possibleSkills.filter((s) => tlc.includes(s.toLowerCase())).slice(0, 8);
  if (detected.length < 4) detected.push("Communication", "Problem Solving", "Teamwork", "Git");

  const targetLower = target.toLowerCase();
  const ROLE_KEYWORDS: Record<string, string[]> = {
    "software engineer": ["distributed systems", "unit tests", "code review", "system design", "scalability"],
    "frontend": ["accessibility", "performance budgets", "lighthouse", "design system", "responsive"],
    "backend": ["microservices", "queues", "indexing", "caching", "observability"],
    "data": ["pandas", "feature engineering", "model evaluation", "A/B testing", "ETL"],
    "ml": ["pytorch", "transformer", "fine-tuning", "evaluation harness", "MLOps"],
    "devops": ["terraform", "monitoring", "incident response", "SLO", "kubernetes"],
    "product": ["roadmap", "user research", "OKRs", "metrics", "stakeholders"],
  };
  const matchedKey = Object.keys(ROLE_KEYWORDS).find((k) => targetLower.includes(k)) || "software engineer";
  const expected = ROLE_KEYWORDS[matchedKey];
  const missing = expected.filter((k) => !tlc.includes(k.toLowerCase())).slice(0, 5);

  return {
    overall,
    ats: score(1, 64),
    impact: score(2, 70),
    clarity: score(3, 72),
    keywords: score(4, 60),
    detectedSkills: detected,
    missingKeywords: missing.length ? missing : ["impact metrics", "leadership signals"],
    strengths: [
      "Clear chronological structure",
      "Recent tech stack matches target role",
      "Action-verb led bullets in latest role",
    ],
    improvements: [
      {
        title: "Add quantified outcomes to top 3 bullets",
        detail: "Replace 'improved performance' with 'cut p95 latency from 820ms → 240ms (-70%)'. Numbers anchor recruiter attention.",
        severity: "high",
      },
      {
        title: `Surface "${missing[0] ?? "impact metrics"}" earlier`,
        detail: `ATS scanners reading for ${target} expect this term in the top half. Mention it in your summary or first role.`,
        severity: "high",
      },
      {
        title: "Tighten summary to 2 lines",
        detail: "Lead with role + years + 1 concrete win. Recruiters spend ~7 seconds on the first scan.",
        severity: "med",
      },
      {
        title: "Use consistent past tense for previous roles",
        detail: "Mixed tense in roles 2 and 3 hurts clarity score. Keep current role in present, all previous roles in past.",
        severity: "low",
      },
    ],
    summary: `Solid foundation — your resume scores ${overall}/100 against ${target}. Biggest unlock is quantifying impact and surfacing 2-3 missing role keywords near the top.`,
  };
}
