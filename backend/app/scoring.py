"""Heuristic answer + resume scoring (mirror of frontend lib/scoring.ts)."""
import re
from typing import Iterable

FILLERS = {"um", "uh", "like", "basically", "actually", "literally"}
HEDGES = ("maybe", "i think", "i guess", "probably", "not sure", "kind of")
STAR_MARKERS = ("situation", "task", "action", "result", "first", "second", "finally", "for example", "in summary")


def _clamp(n: float, lo: float = 0, hi: float = 100) -> int:
    return int(max(lo, min(hi, n)))


def score_answer(answer: str, expected: Iterable[str] = (), question: str = "") -> dict:
    text = (answer or "").strip().lower()
    words = [w for w in re.split(r"\s+", text) if w]
    word_count = len(words)

    filler_hits = sum(1 for w in words if re.sub(r"[^a-z]", "", w) in FILLERS)
    filler_ratio = (filler_hits / word_count) if word_count else 0
    filler_words = _clamp(100 - filler_ratio * 800)

    q_keywords = [w for w in re.split(r"\W+", question.lower()) if len(w) > 4]
    hints = [h.lower() for h in expected] + q_keywords
    matched = sum(1 for h in hints if h and h in text)
    if not hints:
        relevance = _clamp(40 + min(60, word_count / 2))
    else:
        relevance = _clamp(40 + (matched / max(1, len(hints))) * 60)

    has_number = bool(re.search(r"\d", text))
    if word_count < 25:
        depth_base = 30
    elif word_count < 60:
        depth_base = 55
    elif word_count < 140:
        depth_base = 80
    else:
        depth_base = 90
    depth = _clamp(depth_base + (5 if has_number else 0))

    structure_hits = sum(1 for m in STAR_MARKERS if m in text)
    structure = _clamp(40 + structure_hits * 12)

    sentences = [s for s in re.split(r"[.!?]", answer or "") if s.strip()]
    avg_len = (word_count / len(sentences)) if sentences else 0
    if avg_len == 0:
        clarity = 30
    elif avg_len < 8:
        clarity = 60
    elif avg_len < 22:
        clarity = 90
    elif avg_len < 35:
        clarity = 70
    else:
        clarity = 50

    hedge_hits = sum(1 for h in HEDGES if h in text)
    confidence = _clamp(85 - hedge_hits * 8 - filler_ratio * 200)

    overall = _clamp(
        relevance * 0.30
        + depth * 0.20
        + clarity * 0.15
        + structure * 0.15
        + confidence * 0.10
        + filler_words * 0.10
    )

    notes: list[str] = []
    if word_count < 25:
        notes.append("Answer is too short - aim for 60-120 words.")
    if filler_ratio > 0.05:
        notes.append(f"Reduce filler words ({filler_hits} detected).")
    if structure_hits == 0 and re.search(r"tell me about a time|describe a time|conflict|failed", question, re.I):
        notes.append("Use the STAR framework: Situation -> Task -> Action -> Result.")
    if hints and matched < max(1, len(hints) // 3):
        notes.append("Address the core of the question more directly.")
    if hedge_hits >= 2:
        notes.append("Sound more decisive - avoid 'I think', 'maybe', 'I guess'.")
    if not notes:
        notes.append("Strong answer - keep this energy and specificity.")

    return {
        "overall": overall,
        "clarity": int(clarity),
        "relevance": int(relevance),
        "depth": int(depth),
        "confidence": int(confidence),
        "structure": int(structure),
        "filler_words": filler_words,
        "notes": notes[:6],
    }


# ----- resume -----
ROLE_KEYWORDS = {
    "software engineer": ["distributed systems", "unit tests", "code review", "system design", "scalability"],
    "frontend": ["accessibility", "performance budgets", "lighthouse", "design system", "responsive"],
    "backend": ["microservices", "queues", "indexing", "caching", "observability"],
    "data": ["pandas", "feature engineering", "model evaluation", "a/b testing", "etl"],
    "ml": ["pytorch", "transformer", "fine-tuning", "evaluation harness", "mlops"],
    "devops": ["terraform", "monitoring", "incident response", "slo", "kubernetes"],
    "product": ["roadmap", "user research", "okrs", "metrics", "stakeholders"],
}

POSSIBLE_SKILLS = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java",
    "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes",
    "REST", "GraphQL", "TensorFlow", "PyTorch", "Git", "CI/CD", "Agile",
]


def analyze_resume(text: str, target: str) -> dict:
    tlc = text.lower()
    detected = [s for s in POSSIBLE_SKILLS if s.lower() in tlc][:8]

    target_lc = target.lower()
    matched_key = next((k for k in ROLE_KEYWORDS if k in target_lc), "software engineer")
    expected = ROLE_KEYWORDS[matched_key]
    missing = [k for k in expected if k not in tlc][:5]

    length = len(text)
    ats = _clamp(60 + (10 if text.count("\n") > 10 else 0) - (5 if "\t" in text else 0))
    impact_kw = re.search(r"(\d+%|\b\d+x\b|reduced|increased|launched|shipped)", text, re.I)
    impact = _clamp(55 + (18 if impact_kw else 0))
    clarity = _clamp(60 + (18 if 1500 < length < 4500 else 0))
    keywords = _clamp(40 + (len(expected) - len(missing)) * 12)
    overall = round((ats + impact + clarity + keywords) / 4)

    improvements = [
        {
            "title": "Add quantified outcomes to top 3 bullets",
            "detail": "Replace generic phrases with concrete numbers (e.g. p95 latency 820ms -> 240ms, -70%).",
            "severity": "high",
        },
        {
            "title": f"Surface '{missing[0] if missing else 'impact metrics'}' earlier",
            "detail": f"ATS scanners reading for {target} expect this term in the top half. Mention it in the summary or first role.",
            "severity": "high",
        },
        {
            "title": "Tighten summary to 2 lines",
            "detail": "Lead with role + years + 1 concrete win. Recruiters spend ~7 seconds on the first scan.",
            "severity": "med",
        },
        {
            "title": "Use consistent past tense for previous roles",
            "detail": "Mixed tense lowers clarity. Keep current role present; previous roles past.",
            "severity": "low",
        },
    ]

    return {
        "overall": overall,
        "ats": ats,
        "impact": impact,
        "clarity": clarity,
        "keywords": keywords,
        "detected_skills": detected or ["Communication", "Problem Solving", "Teamwork"],
        "missing_keywords": missing or ["impact metrics", "leadership signals"],
        "strengths": [
            "Clear chronological structure",
            "Recent stack matches target role",
            "Action-verb led bullets",
        ],
        "improvements": improvements,
        "summary": (
            f"Solid foundation - your resume scores {overall}/100 against {target}. "
            "Biggest unlock is quantifying impact and surfacing missing role keywords near the top."
        ),
    }
