// Tiny wrappers over Web Speech APIs with graceful fallbacks.

export function speak(text: string, opts?: { rate?: number; pitch?: number; voice?: string }): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts?.rate ?? 1.02;
      u.pitch = opts?.pitch ?? 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /female|samantha|jenny|aria|natural/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      if (preferred) u.voice = preferred;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}

export function cancelSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
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
