// Wrappers over the Web Speech APIs with production-grade robustness.
//
// Why this file is more than a thin wrapper:
//   1. getVoices() is async in Chrome/Edge — the list is empty on first call until
//      the "voiceschanged" event fires. We preload + cache it so we always pick a
//      high-quality voice instead of falling back to the robotic default.
//   2. Chrome cuts off speechSynthesis after ~15s of continuous speech, and rapid
//      cancel()+speak() produces garbled / distorted audio. We fix both by
//      (a) chunking text into sentence-sized utterances, (b) running a pause()/
//      resume() keep-alive, and (c) leaving a short gap after cancel().
//   3. Volume/rate/pitch are pinned for consistent, natural, easy-to-understand output.

let _voicesCache: SpeechSynthesisVoice[] | null = null;
let _preferredVoice: SpeechSynthesisVoice | null = null;
let _keepAliveTimer: ReturnType<typeof setInterval> | null = null;

function supported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Resolve the available voices, waiting for async load if necessary. */
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!supported()) {
      resolve([]);
      return;
    }
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing && existing.length > 0) {
      _voicesCache = existing;
      resolve(existing);
      return;
    }
    // Voices not ready yet — wait for the event, with a timeout fallback.
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const v = synth.getVoices();
      _voicesCache = v;
      resolve(v);
    };
    synth.addEventListener?.("voiceschanged", finish, { once: true } as AddEventListenerOptions);
    // Fallback in case the event never fires (some browsers).
    setTimeout(finish, 600);
  });
}

/** Pick the clearest English voice available and cache it. */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (_preferredVoice && voices.includes(_preferredVoice)) return _preferredVoice;
  if (!voices.length) return null;

  const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;

  // Ranked preference: modern "natural"/"neural" cloud voices sound best, then
  // well-known high-quality system voices, then any female en voice, then any en.
  const ranked =
    pool.find((v) => /natural|neural|online|wavenet|journey/i.test(v.name)) ||
    pool.find((v) => /google (us|uk) english/i.test(v.name)) ||
    pool.find((v) => /microsoft (aria|jenny|libby|sonia|emma|michelle)/i.test(v.name)) ||
    pool.find((v) => /samantha|karen|moira|tessa|fiona/i.test(v.name)) ||
    pool.find((v) => /female/i.test(v.name)) ||
    pool.find((v) => v.lang.toLowerCase() === "en-us") ||
    pool[0];

  _preferredVoice = ranked ?? null;
  return _preferredVoice;
}

/**
 * Warm up the synthesis engine on a user gesture (e.g. clicking "Start interview").
 * Speaking a near-silent utterance unlocks autoplay restrictions and forces voices
 * to load, so the first real question plays instantly and clearly.
 */
export async function primeSpeech(): Promise<void> {
  if (!supported()) return;
  await ensureVoices();
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0; // inaudible warm-up
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/** Split text into sentence-sized chunks so no single utterance hits Chrome's ~15s cutoff. */
function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  // Split on sentence boundaries while keeping the punctuation.
  const sentences = clean.match(/[^.!?]+[.!?]*/g) ?? [clean];
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    const piece = s.trim();
    if (!piece) continue;
    // Keep chunks under ~160 chars (~10s of speech) for reliability.
    if ((buf + " " + piece).trim().length > 160) {
      if (buf) chunks.push(buf.trim());
      buf = piece;
    } else {
      buf = (buf + " " + piece).trim();
    }
  }
  if (buf) chunks.push(buf.trim());
  return chunks;
}

function startKeepAlive() {
  stopKeepAlive();
  if (!supported()) return;
  // Chrome silently pauses long speech queues after ~14s. A periodic
  // pause()+resume() keeps the queue flowing without audible artifacts.
  _keepAliveTimer = setInterval(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      try {
        synth.pause();
        synth.resume();
      } catch {
        /* ignore */
      }
    }
  }, 10000);
}

function stopKeepAlive() {
  if (_keepAliveTimer) {
    clearInterval(_keepAliveTimer);
    _keepAliveTimer = null;
  }
}

/**
 * Speak text clearly. Resolves when playback finishes (or is cancelled).
 * Signature is backwards-compatible with the previous implementation.
 */
export function speak(
  text: string,
  opts?: { rate?: number; pitch?: number; volume?: number },
): Promise<void> {
  return new Promise(async (resolve) => {
    if (!supported() || !text?.trim()) {
      resolve();
      return;
    }

    const synth = window.speechSynthesis;
    const voices = await ensureVoices();
    const voice = pickVoice(voices);

    // Cancel anything in flight, then wait a beat. Speaking immediately after
    // cancel() is the #1 cause of garbled/distorted audio in Chromium.
    synth.cancel();
    await new Promise((r) => setTimeout(r, 120));

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      resolve();
      return;
    }

    const rate = clampNum(opts?.rate ?? 0.98, 0.5, 1.5);
    const pitch = clampNum(opts?.pitch ?? 1.0, 0, 2);
    const volume = clampNum(opts?.volume ?? 1.0, 0, 1);

    let index = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      stopKeepAlive();
      resolve();
    };

    const speakNext = () => {
      if (index >= chunks.length) {
        finish();
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[index]);
      if (voice) u.voice = voice;
      u.lang = voice?.lang || "en-US";
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onend = () => {
        index += 1;
        speakNext();
      };
      u.onerror = () => {
        // Skip the problematic chunk rather than aborting the whole utterance.
        index += 1;
        speakNext();
      };
      try {
        synth.speak(u);
      } catch {
        finish();
      }
    };

    startKeepAlive();
    speakNext();

    // Safety net: never hang forever if the engine stalls.
    const maxMs = Math.min(60000, 4000 + text.length * 90);
    setTimeout(finish, maxMs);
  });
}

export function cancelSpeech() {
  stopKeepAlive();
  if (supported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

/** True when the browser can synthesise speech at all. */
export function speechSupported(): boolean {
  return supported();
}

function clampNum(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

type RecognitionEvents = {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onEnd?: () => void;
  onError?: (e: string) => void;
};

interface RecognitionHandle {
  start: () => void;
  stop: () => void;
  supported: boolean;
}

export function createRecognition(events: RecognitionEvents = {}): RecognitionHandle {
  if (typeof window === "undefined") return { start() {}, stop() {}, supported: false };

  const SR: any =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return { start() {}, stop() {}, supported: false };

  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";

  let stopped = false;

  rec.onresult = (e: any) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (interim) events.onPartial?.(interim);
    if (final) events.onFinal?.(final.trim());
  };
  rec.onerror = (e: any) => events.onError?.(e?.error || "error");
  rec.onend = () => {
    if (!stopped) {
      try { rec.start(); } catch { /* ignore */ }
    } else {
      events.onEnd?.();
    }
  };

  return {
    start() {
      stopped = false;
      try { rec.start(); } catch { /* ignore */ }
    },
    stop() {
      stopped = true;
      try { rec.stop(); } catch { /* ignore */ }
    },
    supported: true,
  };
}
