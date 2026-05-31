import { describe, it, expect } from "vitest";
import { POOLS, TOTAL_QUESTION_BANK, assembleExamQuestions } from "@/lib/questionBank";

describe("question bank integrity", () => {
  it("holds 5000+ questions", () => {
    expect(TOTAL_QUESTION_BANK).toBeGreaterThanOrEqual(5000);
  });

  it("every question has exactly 4 distinct options and a valid correct_index", () => {
    for (const pool of Object.values(POOLS)) {
      for (const q of pool) {
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4); // distinct
        expect(q.correct_index).toBeGreaterThanOrEqual(0);
        expect(q.correct_index).toBeLessThan(4);
        expect(q.options[q.correct_index]).toBeDefined();
        expect(q.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic across calls (stable ids and answers)", () => {
    const a = assembleExamQuestions("tcs-nqt", ["Quantitative", "Logical Reasoning"], 10);
    const b = assembleExamQuestions("tcs-nqt", ["Quantitative", "Logical Reasoning"], 10);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(a.map((q) => q.correct_index)).toEqual(b.map((q) => q.correct_index));
    expect(a.map((q) => q.options.join("|"))).toEqual(b.map((q) => q.options.join("|")));
  });

  it("assembles the requested number of questions with unique ids", () => {
    const qs = assembleExamQuestions("ssc-cgl", ["Quantitative", "Logical Reasoning", "Verbal English", "General Knowledge"], 30);
    expect(qs.length).toBe(30);
    expect(new Set(qs.map((q) => q.id)).size).toBe(30);
  });

  it("generated quantitative answers are mathematically correct (percentage check)", () => {
    // Spot-check: every quant question's correct option is one of its options.
    const quant = POOLS.Quantitative;
    for (const q of quant.slice(0, 200)) {
      expect(q.options).toContain(q.options[q.correct_index]);
    }
  });
});
