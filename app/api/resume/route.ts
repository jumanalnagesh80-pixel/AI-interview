import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Body {
  text: string;
  target?: string;
}

/**
 * POST /api/resume
 * Body: { text, target? }
 *
 * Returns a resume scoring object. With OPENAI_API_KEY uses LLM,
 * otherwise returns a deterministic heuristic.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.text || body.text.length < 30) {
    return NextResponse.json({ error: "text must be at least 30 chars" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const llm = await analyzeWithOpenAI(apiKey, body);
      if (llm) return NextResponse.json({ source: "openai", ...llm });
    } catch (e) {
      console.warn("[api/resume] LLM call failed, falling back:", (e as Error).message);
    }
  }

  return NextResponse.json({ source: "local", ...heuristicAnalyze(body.text, body.target ?? "Software Engineer") });
}

async function analyzeWithOpenAI(key: string, body: Body) {
  const prompt = `You are a senior career coach scoring a resume against a target role.
Target: ${body.target ?? "Software Engineer"}
Resume:
"""${body.text.slice(0, 8000)}"""

Return strict JSON:
{
  "overall": 0-100,
  "ats": 0-100,
  "impact": 0-100,
  "clarity": 0-100,
  "keywords": 0-100,
  "detectedSkills": ["..."],
  "missingKeywords": ["..."],
  "strengths": ["..."],
  "improvements": [
    { "title": "...", "detail": "...", "severity": "low|med|high" }
  ],
  "summary": "2-3 sentence executive summary"
}`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Output strict JSON. Be specific and actionable." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}`);
  const json = await r.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(text);
}

function heuristicAnalyze(text: string, target: string) {
  const tlc = text.toLowerCase();
  const possibleSkills = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java",
    "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes",
    "REST", "GraphQL", "TensorFlow", "PyTorch", "Git", "CI/CD", "Agile",
  ];
  const detected = possibleSkills.filter((s) => tlc.includes(s.toLowerCase())).slice(0, 8);
  const ROLE_KEYWORDS: Record<string, string[]> = {
    "software engineer": ["distributed systems", "unit tests", "code review", "system design", "scalability"],
    frontend: ["accessibility", "performance budgets", "lighthouse", "design system", "responsive"],
    backend: ["microservices", "queues", "indexing", "caching", "observability"],
    data: ["pandas", "feature engineering", "model evaluation", "A/B testing", "ETL"],
    ml: ["pytorch", "transformer", "fine-tuning", "evaluation harness", "MLOps"],
    devops: ["terraform", "monitoring", "incident response", "SLO", "kubernetes"],
    product: ["roadmap", "user research", "OKRs", "metrics", "stakeholders"],
  };
  const tlow = target.toLowerCase();
  const matched = Object.keys(ROLE_KEYWORDS).find((k) => tlow.includes(k)) || "software engineer";
  const expected = ROLE_KEYWORDS[matched];
  const missing = expected.filter((k) => !tlc.includes(k.toLowerCase())).slice(0, 5);

  const len = text.length;
  const ats = clamp(60 + (text.split("\n").length > 10 ? 10 : 0) - (text.includes("\t") ? 5 : 0));
  const impact = clamp(55 + (/(\d+%|\b\d+x\b|reduced|increased|launched|shipped)/i.test(text) ? 18 : 0));
  const clarity = clamp(60 + (len > 1500 && len < 4500 ? 18 : 0));
  const keywords = clamp(40 + (expected.length - missing.length) * 12);
  const overall = Math.round((ats + impact + clarity + keywords) / 4);

  return {
    overall,
    ats,
    impact,
    clarity,
    keywords,
    detectedSkills: detected.length ? detected : ["Communication", "Problem Solving", "Teamwork"],
    missingKeywords: missing.length ? missing : ["impact metrics", "leadership signals"],
    strengths: [
      "Clear chronological structure",
      "Recent stack matches target role",
      "Action-verb led bullets",
    ],
    improvements: [
      { title: "Add quantified outcomes to top 3 bullets", detail: "Replace 'improved performance' with concrete numbers (e.g. p95 latency 820ms -> 240ms).", severity: "high" },
      { title: `Surface "${missing[0] ?? "impact metrics"}" earlier`, detail: `Move this term into the summary or first role for ATS pickup on ${target}.`, severity: "high" },
      { title: "Tighten summary to 2 lines", detail: "Lead with role + years + 1 concrete win.", severity: "med" },
      { title: "Use consistent past tense for prior roles", detail: "Inconsistent tense lowers clarity score.", severity: "low" },
    ],
    summary: `Solid foundation — your resume scores ${overall}/100 against ${target}. Biggest unlock is quantifying impact and surfacing missing role keywords near the top.`,
  };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
