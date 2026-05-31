"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exam } from "@/lib/exams";
import type { AnswerMap } from "@/lib/examScoring";
import { countAnswers, remainingSeconds } from "@/lib/examScoring";
import {
  clearSession,
  loadSession,
  newAttemptId,
  saveSession,
  type ExamSession,
} from "@/lib/examSession";

export type SessionStatus = "idle" | "active" | "submitting";

interface UseExamSessionReturn {
  status: SessionStatus;
  attemptId: string | null;
  startedAt: number | null;
  current: number;
  answers: AnswerMap;
  secondsLeft: number;
  /** True when a previously-saved in-progress session was restored from storage. */
  restored: boolean;
  counts: ReturnType<typeof countAnswers>;
  /** Begin a fresh attempt (or resume an existing one if present and not expired). */
  begin: (opts?: { resume?: boolean }) => void;
  setCurrent: (idx: number) => void;
  next: () => void;
  prev: () => void;
  selectOption: (questionId: string, optionIndex: number) => void;
  toggleMark: (questionId: string) => void;
  clearResponse: (questionId: string) => void;
  /** Stop the timer and mark as submitting (caller then grades + navigates). */
  finalize: () => { startedAt: number; durationSec: number; timedOut: boolean };
  /** Wipe the in-progress session from storage (after a successful submit). */
  discard: () => void;
}

/**
 * Reusable exam session engine.
 *
 * Responsibilities:
 *  - Owns the question index, answer map and timer for one exam.
 *  - Persists everything to localStorage (debounced) so a refresh restores state.
 *  - Recomputes the timer from the persisted `startedAt` every tick, so the
 *    countdown is correct even after the tab was backgrounded or reloaded.
 *  - Calls `onTimeout` exactly once when the clock hits zero.
 */
export function useExamSession(
  exam: Exam | undefined,
  userId: number | null,
  onTimeout: () => void,
): UseExamSessionReturn {
  const totalSec = exam ? exam.duration_min * 60 : 0;

  const [status, setStatus] = useState<SessionStatus>("idle");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [current, setCurrentState] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [restored, setRestored] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timedOutFiredRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // Detect an existing in-progress session for this exam on mount.
  useEffect(() => {
    if (!exam) return;
    const existing = loadSession(exam.id);
    if (existing && remainingSeconds(existing.startedAt, existing.totalSec) > 0) {
      setRestored(true);
    }
  }, [exam]);

  const persist = useCallback(
    (partial?: Partial<ExamSession>) => {
      if (!exam || !attemptId || startedAt == null) return;
      const snapshot: ExamSession = {
        attemptId,
        examId: exam.id,
        examName: exam.name,
        userId,
        startedAt,
        totalSec,
        current,
        answers,
        updatedAt: Date.now(),
        ...partial,
      };
      saveSession(snapshot);
    },
    [exam, attemptId, startedAt, totalSec, current, answers, userId],
  );

  // Debounced autosave whenever answers / current question change.
  useEffect(() => {
    if (status !== "active") return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => persist(), 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [answers, current, status, persist]);

  // Flush on tab hide / unload so nothing is ever lost.
  useEffect(() => {
    if (status !== "active") return;
    const flush = () => persist();
    window.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [status, persist]);

  // The timer: recompute from startedAt every second (refresh-proof).
  useEffect(() => {
    if (status !== "active" || startedAt == null) return;
    const update = () => {
      const left = remainingSeconds(startedAt, totalSec);
      setSecondsLeft(left);
      if (left <= 0 && !timedOutFiredRef.current) {
        timedOutFiredRef.current = true;
        if (tickRef.current) clearInterval(tickRef.current);
        onTimeoutRef.current();
      }
    };
    update();
    tickRef.current = setInterval(update, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status, startedAt, totalSec]);

  const begin = useCallback(
    (opts?: { resume?: boolean }) => {
      if (!exam) return;
      timedOutFiredRef.current = false;
      const existing = opts?.resume ? loadSession(exam.id) : null;
      if (existing && remainingSeconds(existing.startedAt, existing.totalSec) > 0) {
        setAttemptId(existing.attemptId);
        setStartedAt(existing.startedAt);
        setCurrentState(existing.current ?? 0);
        setAnswers(existing.answers ?? {});
        setSecondsLeft(remainingSeconds(existing.startedAt, existing.totalSec));
      } else {
        const id = newAttemptId();
        const now = Date.now();
        setAttemptId(id);
        setStartedAt(now);
        setCurrentState(0);
        setAnswers({});
        setSecondsLeft(totalSec);
        saveSession({
          attemptId: id,
          examId: exam.id,
          examName: exam.name,
          userId,
          startedAt: now,
          totalSec,
          current: 0,
          answers: {},
          updatedAt: now,
        });
      }
      setStatus("active");
    },
    [exam, totalSec, userId],
  );

  const setCurrent = useCallback(
    (idx: number) => {
      if (!exam) return;
      const max = exam.questions.length - 1;
      setCurrentState(Math.max(0, Math.min(max, idx)));
    },
    [exam],
  );

  const next = useCallback(() => setCurrent(current + 1), [current, setCurrent]);
  const prev = useCallback(() => setCurrent(current - 1), [current, setCurrent]);

  const selectOption = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((a) => ({
      ...a,
      [questionId]: { picked: optionIndex, marked: a[questionId]?.marked ?? false },
    }));
  }, []);

  const toggleMark = useCallback((questionId: string) => {
    setAnswers((a) => ({
      ...a,
      [questionId]: { picked: a[questionId]?.picked ?? -1, marked: !(a[questionId]?.marked ?? false) },
    }));
  }, []);

  const clearResponse = useCallback((questionId: string) => {
    setAnswers((a) => ({
      ...a,
      [questionId]: { picked: -1, marked: a[questionId]?.marked ?? false },
    }));
  }, []);

  const finalize = useCallback(() => {
    setStatus("submitting");
    if (tickRef.current) clearInterval(tickRef.current);
    const start = startedAt ?? Date.now();
    const left = remainingSeconds(start, totalSec);
    return {
      startedAt: start,
      durationSec: Math.min(totalSec, totalSec - left),
      timedOut: left <= 0,
    };
  }, [startedAt, totalSec]);

  const discard = useCallback(() => {
    if (exam) clearSession(exam.id);
  }, [exam]);

  const counts = useMemo(
    () => countAnswers(exam?.questions.length ?? 0, answers),
    [exam, answers],
  );

  return {
    status,
    attemptId,
    startedAt,
    current,
    answers,
    secondsLeft,
    restored,
    counts,
    begin,
    setCurrent,
    next,
    prev,
    selectOption,
    toggleMark,
    clearResponse,
    finalize,
    discard,
  };
}
