import { NextResponse } from "next/server";
import { scoreAnswer } from "@/lib/scoring";

export const dynamic = "force-dynamic";

interface Body {
  question: string;
  answer: string;
  expected?: string[];
}

/**
 * POST /api/score
 * Body: { question, answer, expected? }
 *
 * Scores an answer. If OPENAI_API_KEY is set, uses LLM scoring; otherwise
 * uses the local heuristic scorer in lib/scoring.ts.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.question || !body?.answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const llm = await scoreWithOpenAI(apiKey, body);
      if (llm) return NextResponse.json({ source: "openai", ...llm });
    } catch (e) {
      console.warn("[api/score] LLM call failed, falling back:", (e as Error).message);
    }
  }

  const local = scoreAnswer(body.answer, body.expected ?? [], body.question);
  return NextResponse.json({ source: "local", ...local });
}

async function scoreWithOpenAI(key: string, body: Body) {
  const prompt = `You are a senior interview coach. Score the candidate's answer.
Question: ${body.question}
${body.expected?.length ? `Expected hints: ${body.expected.join(", ")}` : ""}
Answer: """${body.answer}"""

Return strict JSON:
{
  "overall": 0-100,
  "clarity": 0-100,
  "relevance": 0-100,
  "depth": 0-100,
  "confidence": 0-100,
  "structure": 0-100,
  "fillerWords": 0-100,
  "notes": ["short actionable note", "..."]
}`;

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
        { role: "system", content: "Output strict JSON only. Be concise and concrete in notes." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}`);
  const json = await r.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);
  return {
    overall: clamp(parsed.overall),
    clarity: clamp(parsed.clarity),
    relevance: clamp(parsed.relevance),
    depth: clamp(parsed.depth),
    confidence: clamp(parsed.confidence),
    structure: clamp(parsed.structure),
    fillerWords: clamp(parsed.fillerWords),
    notes: Array.isArray(parsed.notes) ? parsed.notes.slice(0, 6) : [],
  };
}

function clamp(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}
