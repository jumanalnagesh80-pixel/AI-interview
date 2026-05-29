// Lightweight client-safe scoring heuristic.
// Replace with a real LLM scorer (Claude / OpenAI) in /api/score for production.

export interface ScoreBreakdown {
  overall: number;
  clarity: number;
  relevance: number;
  depth: number;
  confidence: number;
  structure: number;
  fillerWords: number;
  notes: string[];
}

const FILLERS = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of", "literally"];

export function scoreAnswer(
  answer: string,
  expected: string[] = [],
  question: string = "",
): ScoreBreakdown {
  const text = answer.trim().toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Filler ratio
  const fillerHits = words.filter((w) => FILLERS.includes(w.replace(/[^a-z]/g, ""))).length;
  const fillerRatio = wordCount === 0 ? 0 : fillerHits / wordCount;
  const fillerWords = Math.max(0, 100 - Math.round(fillerRatio * 800));

  // Relevance — keyword overlap with expected hints + question keywords
  const qKeywords = question.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  const allHints = [...expected.map((e) => e.toLowerCase()), ...qKeywords];
  const matched = allHints.filter((h) => text.includes(h)).length;
  const relevance = allHints.length === 0
    ? clamp(40 + Math.min(60, wordCount / 2))
    : clamp(40 + (matched / allHints.length) * 60);

  // Depth — heuristic: word count + presence of numbers / specifics
  const hasNumber = /\d/.test(text);
  const depth = clamp((wordCount < 25 ? 30 : wordCount < 60 ? 55 : wordCount < 140 ? 80 : 90) + (hasNumber ? 5 : 0));

  // Structure — STAR / first / second / finally markers
  const structureMarkers = ["situation", "task", "action", "result", "first", "second", "finally", "for example", "in summary"];
  const structureHits = structureMarkers.filter((m) => text.includes(m)).length;
  const structure = clamp(40 + structureHits * 12);

  // Clarity — sentences per ~15 words ideal, penalize run-ons
  const sentences = answer.split(/[.!?]/).filter((s) => s.trim().length > 0);
  const avgLen = sentences.length === 0 ? 0 : wordCount / sentences.length;
  const clarity = clamp(avgLen === 0 ? 30 : avgLen < 8 ? 60 : avgLen < 22 ? 90 : avgLen < 35 ? 70 : 50);

  // Confidence — penalize fillers + hedging words
  const hedges = ["maybe", "i think", "i guess", "probably", "not sure", "kind of"];
  const hedgeHits = hedges.filter((h) => text.includes(h)).length;
  const confidence = clamp(85 - hedgeHits * 8 - Math.round(fillerRatio * 200));

  const overall = Math.round(
    relevance * 0.3 + depth * 0.2 + clarity * 0.15 + structure * 0.15 + confidence * 0.1 + fillerWords * 0.1,
  );

  const notes: string[] = [];
  if (wordCount < 25) notes.push("Answer is too short — aim for 60-120 words.");
  if (fillerRatio > 0.05) notes.push(`Reduce filler words (${fillerHits} detected: um/uh/like).`);
  if (structureHits === 0 && /tell me about a time|describe a time|conflict|failed/i.test(question)) {
    notes.push("Use the STAR framework: Situation → Task → Action → Result.");
  }
  if (matched < Math.max(1, Math.floor(allHints.length / 3)) && allHints.length > 0) {
    notes.push("Address the core of the question more directly.");
  }
  if (hedgeHits >= 2) notes.push("Sound more decisive — avoid 'I think', 'maybe', 'I guess'.");
  if (notes.length === 0) notes.push("Strong answer — keep this energy and specificity.");

  return {
    overall: clamp(overall),
    clarity: Math.round(clarity),
    relevance: Math.round(relevance),
    depth: Math.round(depth),
    confidence: Math.round(confidence),
    structure: Math.round(structure),
    fillerWords: Math.round(fillerWords),
    notes,
  };
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}
