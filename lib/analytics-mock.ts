// Deterministic mock analytics so the page is alive in offline mode.

export interface TopicAccuracy {
  section: string;
  answered: number;
  correct: number;
  accuracy: number;
  avg_time_ms: number;
}

export interface HeatCell {
  date: string;
  answered: number;
  correct: number;
}

export interface TimeOfDay {
  hour: number;
  answered: number;
  correct: number;
}

export interface Analytics {
  total_practice_answers: number;
  total_exam_attempts: number;
  overall_accuracy: number;
  avg_time_ms: number;
  streak_days: number;
  by_section: TopicAccuracy[];
  strongest_section: string | null;
  weakest_section: string | null;
  heatmap: HeatCell[];
  time_of_day: TimeOfDay[];
  recommended_exam_id: string | null;
  recommended_reason: string;
}

function rand(seed: number) {
  let s = seed % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildMockAnalytics(): Analytics {
  const r = rand(20260529);

  const sectionDefs: { section: string; skill: number }[] = [
    { section: "Quantitative", skill: 0.78 },
    { section: "Logical Reasoning", skill: 0.71 },
    { section: "Verbal English", skill: 0.84 },
    { section: "Programming", skill: 0.62 },
    { section: "Pseudocode", skill: 0.66 },
  ];

  const by_section: TopicAccuracy[] = sectionDefs
    .map(({ section, skill }) => {
      const answered = 18 + Math.floor(r() * 26);
      const correct = Math.round(answered * (skill + (r() - 0.5) * 0.06));
      return {
        section,
        answered,
        correct,
        accuracy: Math.round((correct / answered) * 1000) / 10,
        avg_time_ms: 12000 + Math.floor(r() * 18000),
      };
    })
    .sort((a, b) => b.accuracy - a.accuracy);

  const total = by_section.reduce((s, t) => s + t.answered, 0);
  const correctTotal = by_section.reduce((s, t) => s + t.correct, 0);
  const overall = Math.round((correctTotal / total) * 1000) / 10;
  const avgMs = Math.round(by_section.reduce((s, t) => s + t.avg_time_ms, 0) / by_section.length);

  // 84-day heatmap with weekly rhythm
  const today = new Date();
  const heatmap: HeatCell[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const baseline = dow === 0 || dow === 6 ? 1.4 : 1.0;
    const answered = Math.max(0, Math.round((r() * 6 + (i < 14 ? 4 : 1)) * baseline));
    const correctR = 0.6 + r() * 0.32;
    heatmap.push({
      date: d.toISOString().slice(0, 10),
      answered,
      correct: Math.round(answered * correctR),
    });
  }

  // 24-hour time-of-day (peaks evenings)
  const time_of_day: TimeOfDay[] = Array.from({ length: 24 }, (_, h) => {
    let weight = 0;
    if (h >= 9 && h <= 12) weight = 0.7;
    else if (h >= 14 && h <= 17) weight = 0.55;
    else if (h >= 19 && h <= 23) weight = 1.0;
    else if (h >= 0 && h <= 2) weight = 0.35;
    const answered = Math.max(0, Math.round(weight * (8 + r() * 6)));
    const correct = Math.round(answered * (0.55 + r() * 0.35));
    return { hour: h, answered, correct };
  });

  return {
    total_practice_answers: total,
    total_exam_attempts: 6 + Math.floor(r() * 8),
    overall_accuracy: overall,
    avg_time_ms: avgMs,
    streak_days: 12,
    by_section,
    strongest_section: by_section[0]?.section ?? null,
    weakest_section: by_section[by_section.length - 1]?.section ?? null,
    heatmap,
    time_of_day,
    recommended_exam_id: "tcs-nqt",
    recommended_reason: `Boost your weakest area: ${
      by_section[by_section.length - 1]?.section ?? "Programming"
    }.`,
  };
}
