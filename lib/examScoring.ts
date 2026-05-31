// Pure, framework-free exam grading logic.
// Kept dependency-free so it can be unit-tested in isolation (see lib/__tests__).

import type { Exam, ExamQuestion } from "./exams";

/** A single answer the candidate selected. picked = -1 means unanswered. */
export interface AnswerState {
  picked: number;
  marked: boolean;
}

export type AnswerMap = Record<string, AnswerState>;

export interface GradedAnswer {
  question_id: string;
  section: string;
  picked: number;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
}

export interface SectionScore {
  section: string;
  correct: number;
  total: number;
  percent: number;
}

export interface ExamResult {
  score: number; // 0..100
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
  accuracy: number; // 0..100, correct / total (one decimal)
  attemptedAccuracy: number; // correct / attempted (one decimal)
  sectionScores: SectionScore[];
  graded: GradedAnswer[];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Grade a set of answers against an exam. Pure function — no side effects. */
export function gradeExam(exam: Pick<Exam, "questions">, answers: AnswerMap): ExamResult {
  const questions: ExamQuestion[] = exam.questions ?? [];
  const total = questions.length;

  const graded: GradedAnswer[] = questions.map((q) => {
    const picked = answers[q.id]?.picked ?? -1;
    return {
      question_id: q.id,
      section: q.section,
      picked,
      correct_index: q.correct_index,
      is_correct: picked === q.correct_index,
      explanation: q.explanation ?? "",
    };
  });

  const correct = graded.filter((g) => g.is_correct).length;
  const skipped = graded.filter((g) => g.picked < 0).length;
  const attempted = total - skipped;
  const incorrect = attempted - correct;

  const sectionMap = new Map<string, { correct: number; total: number }>();
  for (const g of graded) {
    const bucket = sectionMap.get(g.section) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (g.is_correct) bucket.correct += 1;
    sectionMap.set(g.section, bucket);
  }
  const sectionScores: SectionScore[] = Array.from(sectionMap.entries()).map(([section, v]) => ({
    section,
    correct: v.correct,
    total: v.total,
    percent: v.total ? Math.round((v.correct / v.total) * 100) : 0,
  }));

  return {
    score: total ? Math.round((correct / total) * 100) : 0,
    correct,
    incorrect,
    skipped,
    total,
    accuracy: total ? round1((correct / total) * 100) : 0,
    attemptedAccuracy: attempted ? round1((correct / attempted) * 100) : 0,
    sectionScores,
    graded,
  };
}

export interface AnswerCounts {
  answered: number;
  unanswered: number;
  marked: number;
  total: number;
}

/** Count answered / unanswered / marked for the submit confirmation modal. */
export function countAnswers(total: number, answers: AnswerMap): AnswerCounts {
  let answered = 0;
  let marked = 0;
  for (const v of Object.values(answers)) {
    if (v.picked >= 0) answered += 1;
    if (v.marked) marked += 1;
  }
  return { answered, unanswered: Math.max(0, total - answered), marked, total };
}

/**
 * Remaining seconds given the recorded start time, total allotted seconds and "now".
 * This is what makes the timer survive a page refresh — we never trust an in-memory
 * counter, we always recompute from the persisted startedAt.
 */
export function remainingSeconds(startedAtMs: number, totalSec: number, nowMs: number = Date.now()): number {
  const elapsed = Math.floor((nowMs - startedAtMs) / 1000);
  return Math.max(0, totalSec - elapsed);
}

/** Elapsed seconds, clamped to the exam duration. */
export function elapsedSeconds(startedAtMs: number, totalSec: number, nowMs: number = Date.now()): number {
  const elapsed = Math.floor((nowMs - startedAtMs) / 1000);
  return Math.min(totalSec, Math.max(0, elapsed));
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}
