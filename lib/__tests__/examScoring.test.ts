import { describe, it, expect } from "vitest";
import {
  gradeExam,
  countAnswers,
  remainingSeconds,
  elapsedSeconds,
  formatClock,
  formatDuration,
  type AnswerMap,
} from "@/lib/examScoring";
import type { Exam, ExamQuestion } from "@/lib/exams";

function q(id: string, section: string, correct: number): ExamQuestion {
  return {
    id,
    section,
    text: `Question ${id}`,
    options: ["A", "B", "C", "D"],
    correct_index: correct,
    explanation: `because ${id}`,
    difficulty: "Easy",
  };
}

const exam: Pick<Exam, "questions"> = {
  questions: [
    q("q1", "Quant", 0),
    q("q2", "Quant", 1),
    q("q3", "Verbal", 2),
    q("q4", "Verbal", 3),
  ],
};

describe("gradeExam", () => {
  it("scores a perfect attempt as 100%", () => {
    const answers: AnswerMap = {
      q1: { picked: 0, marked: false },
      q2: { picked: 1, marked: false },
      q3: { picked: 2, marked: false },
      q4: { picked: 3, marked: false },
    };
    const r = gradeExam(exam, answers);
    expect(r.score).toBe(100);
    expect(r.correct).toBe(4);
    expect(r.incorrect).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.accuracy).toBe(100);
    expect(r.attemptedAccuracy).toBe(100);
  });

  it("handles a mix of correct, wrong and skipped", () => {
    const answers: AnswerMap = {
      q1: { picked: 0, marked: false }, // correct
      q2: { picked: 0, marked: false }, // wrong (correct is 1)
      q3: { picked: -1, marked: true }, // skipped
      // q4 omitted entirely -> treated as skipped
    };
    const r = gradeExam(exam, answers);
    expect(r.total).toBe(4);
    expect(r.correct).toBe(1);
    expect(r.skipped).toBe(2);
    expect(r.incorrect).toBe(1);
    expect(r.score).toBe(25); // 1/4
    expect(r.accuracy).toBe(25); // correct/total
    expect(r.attemptedAccuracy).toBe(50); // 1 correct of 2 attempted
  });

  it("computes section-wise breakdown", () => {
    const answers: AnswerMap = {
      q1: { picked: 0, marked: false }, // Quant correct
      q2: { picked: 0, marked: false }, // Quant wrong
      q3: { picked: 2, marked: false }, // Verbal correct
      q4: { picked: 0, marked: false }, // Verbal wrong
    };
    const r = gradeExam(exam, answers);
    const quant = r.sectionScores.find((s) => s.section === "Quant")!;
    const verbal = r.sectionScores.find((s) => s.section === "Verbal")!;
    expect(quant).toMatchObject({ correct: 1, total: 2, percent: 50 });
    expect(verbal).toMatchObject({ correct: 1, total: 2, percent: 50 });
  });

  it("handles an empty answer map (all skipped) without dividing by zero", () => {
    const r = gradeExam(exam, {});
    expect(r.score).toBe(0);
    expect(r.skipped).toBe(4);
    expect(r.accuracy).toBe(0);
    expect(r.attemptedAccuracy).toBe(0);
  });

  it("handles an exam with zero questions", () => {
    const r = gradeExam({ questions: [] }, {});
    expect(r.total).toBe(0);
    expect(r.score).toBe(0);
    expect(r.accuracy).toBe(0);
  });
});

describe("countAnswers", () => {
  it("counts answered, unanswered and marked", () => {
    const answers: AnswerMap = {
      q1: { picked: 0, marked: false },
      q2: { picked: -1, marked: true },
      q3: { picked: 2, marked: true },
    };
    const c = countAnswers(4, answers);
    expect(c.answered).toBe(2);
    expect(c.unanswered).toBe(2);
    expect(c.marked).toBe(2);
    expect(c.total).toBe(4);
  });
});

describe("timer math", () => {
  it("remainingSeconds counts down from start", () => {
    const start = 1_000_000;
    // 30s later, of a 60s exam -> 30 left
    expect(remainingSeconds(start, 60, start + 30_000)).toBe(30);
  });

  it("remainingSeconds never goes negative (refresh after timeout)", () => {
    const start = 1_000_000;
    expect(remainingSeconds(start, 60, start + 120_000)).toBe(0);
  });

  it("elapsedSeconds is clamped to the duration", () => {
    const start = 1_000_000;
    expect(elapsedSeconds(start, 60, start + 25_000)).toBe(25);
    expect(elapsedSeconds(start, 60, start + 999_000)).toBe(60);
  });
});

describe("formatters", () => {
  it("formatClock pads mm:ss", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(600)).toBe("10:00");
  });

  it("formatDuration is human readable", () => {
    expect(formatDuration(0)).toBe("0m 0s");
    expect(formatDuration(75)).toBe("1m 15s");
  });
});
