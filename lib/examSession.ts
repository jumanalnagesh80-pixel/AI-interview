// LocalStorage-backed persistence for in-progress exam sessions and finished attempts.
// This is what gives us: timer surviving refresh, answer restore, and a stable
// /results/[attemptId] page that works for guests and signed-in users alike.

import type { AnswerMap, ExamResult } from "./examScoring";

const SESSION_PREFIX = "aceterview:exam-session:"; // + examId
const ATTEMPT_PREFIX = "aceterview:exam-attempt:"; // + attemptId
const ATTEMPT_INDEX = "aceterview:exam-attempts"; // list of attempt ids (newest first)

/** A live, in-progress exam session. */
export interface ExamSession {
  attemptId: string;
  examId: string;
  examName: string;
  userId: number | null;
  startedAt: number; // epoch ms
  totalSec: number; // allotted duration
  current: number; // current question index
  answers: AnswerMap;
  updatedAt: number;
}

/** A finished, graded attempt snapshot — the source of truth for the results page. */
export interface StoredAttempt {
  attemptId: string;
  serverAttemptId: number | null; // backend id when persisted
  examId: string;
  examName: string;
  examCompany: string | null;
  userId: number | null;
  startedAt: number;
  submittedAt: number;
  durationSec: number; // time actually taken
  totalSec: number; // allotted duration
  timedOut: boolean;
  result: ExamResult;
}

function safeGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — degrade gracefully */
  }
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Cryptographically-ish unique id that's URL-safe. */
export function newAttemptId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `att_${Date.now().toString(36)}_${rand}`;
}

/* ----------------------------- sessions ----------------------------- */

export function loadSession(examId: string): ExamSession | null {
  return safeGet<ExamSession>(SESSION_PREFIX + examId);
}

export function saveSession(session: ExamSession): void {
  safeSet(SESSION_PREFIX + session.examId, { ...session, updatedAt: Date.now() });
}

export function clearSession(examId: string): void {
  safeRemove(SESSION_PREFIX + examId);
}

/* ----------------------------- attempts ----------------------------- */

export function saveAttempt(attempt: StoredAttempt): void {
  safeSet(ATTEMPT_PREFIX + attempt.attemptId, attempt);
  const index = safeGet<string[]>(ATTEMPT_INDEX) ?? [];
  const next = [attempt.attemptId, ...index.filter((id) => id !== attempt.attemptId)].slice(0, 50);
  safeSet(ATTEMPT_INDEX, next);
}

export function loadAttempt(attemptId: string): StoredAttempt | null {
  return safeGet<StoredAttempt>(ATTEMPT_PREFIX + attemptId);
}

export function listAttempts(): StoredAttempt[] {
  const index = safeGet<string[]>(ATTEMPT_INDEX) ?? [];
  return index
    .map((id) => loadAttempt(id))
    .filter((a): a is StoredAttempt => a !== null);
}
