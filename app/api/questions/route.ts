import { NextResponse } from "next/server";
import { QUESTIONS, type Round } from "@/lib/data";

export const dynamic = "force-dynamic";

interface Body {
  round?: Round;
  role?: string;
  company?: string;
  jobDescription?: string;
  count?: number;
}

/**
 * POST /api/questions
 * Body: { round, role, company?, jobDescription?, count? }
 *
 * Generates a list of interview questions tailored to the input.
 * If OPENAI_API_KEY is set on the server, uses it. Otherwise falls back to the
 * local question bank filtered by round.
 */
export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    /* allow empty body */
  }

  const round: Round = body.round ?? "Behavioral";
  const role = body.role ?? "Software Engineer";
  const count = Math.max(1, Math.min(10, body.count ?? 4));

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const llm = await callOpenAI(apiKey, { round, role, company: body.company, jobDescription: body.jobDescription, count });
      if (llm) {
        return NextResponse.json({ source: "openai", questions: llm });
      }
    } catch (e) {
      console.warn("[api/questions] LLM call failed, falling back:", (e as Error).message);
    }
  }

  // Fallback: filter local bank
  const pool = QUESTIONS.filter((q) => q.round === round).slice(0, count);
  return NextResponse.json({
    source: "local",
    questions: pool.map((q) => ({
      id: q.id,
      round: q.round,
      text: q.text,
      difficulty: q.difficulty,
      tags: q.tags,
      expected: q.expected,
    })),
  });
}

async function callOpenAI(
  key: string,
  ctx: { round: Round; role: string; company?: string; jobDescription?: string; count: number },
) {
  const prompt = buildPrompt(ctx);
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior interview coach. Output strict JSON. Generate realistic, role-appropriate interview questions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}`);
  const json = await r.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed?.questions)) return null;
  // sanitize
  return parsed.questions.slice(0, ctx.count).map((q: Record<string, unknown>, i: number) => ({
    id: typeof q.id === "string" ? (q.id as string) : `gen-${i}`,
    round: ctx.round,
    text: String(q.text ?? "").slice(0, 600),
    difficulty:
      q.difficulty === "Easy" || q.difficulty === "Medium" || q.difficulty === "Hard" ? q.difficulty : "Medium",
    tags: Array.isArray(q.tags) ? (q.tags as string[]).slice(0, 5) : [],
    expected: Array.isArray(q.expected) ? (q.expected as string[]).slice(0, 6) : [],
  }));
}

function buildPrompt(ctx: { round: Round; role: string; company?: string; jobDescription?: string; count: number }) {
  return `Generate ${ctx.count} interview questions.
Round: ${ctx.round}
Role: ${ctx.role}
${ctx.company ? `Company style: ${ctx.company}` : ""}
${ctx.jobDescription ? `Job description (verbatim):\n${ctx.jobDescription}` : ""}

Return strict JSON of shape:
{
  "questions": [
    { "id": "q1", "text": "...", "difficulty": "Easy|Medium|Hard", "tags": ["..."], "expected": ["..."] }
  ]
}
"expected" is a list of 3-5 short hints/keywords a strong answer should hit. Keep questions realistic for the round and role.`;
}
