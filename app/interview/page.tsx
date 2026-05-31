"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  ChevronRight,
  Settings,
  Sparkles,
  Volume2,
  RotateCw,
  VolumeX,
  Activity,
  Eye,
  ListChecks,
  ArrowRight,
  Building2,
  Brain,
  Loader2,
} from "lucide-react";
import { AIAvatar } from "@/components/AIAvatar";
import { WebcamPanel } from "@/components/WebcamPanel";
import { GuestBanner } from "@/components/GuestBanner";
import { ProgressRing } from "@/components/ProgressRing";
import { QUESTIONS, ROLES, COMPANIES, type Round, type Role } from "@/lib/data";
import { scoreAnswer, type ScoreBreakdown } from "@/lib/scoring";
import { speak, cancelSpeech, createRecognition, primeSpeech } from "@/lib/speech";
import { getStoredUser } from "@/lib/api";
import { cn } from "@/lib/utils";

type Phase = "setup" | "live" | "summary";

interface Turn {
  questionId: string;
  question: string;
  answer: string;
  score: ScoreBreakdown;
  durationSec: number;
}

const ROUNDS: Round[] = ["HR", "Behavioral", "Technical", "System Design"];

export default function FaceToFaceInterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [role, setRole] = useState<Role>(ROLES[0]);
  const [round, setRound] = useState<Round>("Behavioral");
  const [company, setCompany] = useState<string>("any");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);

  const pool = useMemo(() => QUESTIONS.filter((q) => q.round === round), [round]);
  const [qIndex, setQIndex] = useState(0);
  const currentQ = pool[qIndex] ?? pool[0];

  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [partial, setPartial] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  /** Continuous-listen mode: auto-submits after user stops speaking for ~2.5s. */
  const [autoListen, setAutoListen] = useState(true);
  const recRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const turnStartRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechAtRef = useRef<number>(0);
  const transcriptRef = useRef<string>("");
  const partialRef = useRef<string>("");

  // Live mock metrics — would be fed by real CV/audio analyzers in production.
  const [liveMetrics, setLiveMetrics] = useState({ pace: 70, clarity: 78, eyeContact: 82, posture: 80 });
  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => {
      setLiveMetrics((m) => ({
        pace: clamp(m.pace + (Math.random() - 0.5) * 6),
        clarity: clamp(m.clarity + (Math.random() - 0.5) * 5),
        eyeContact: clamp(m.eyeContact + (Math.random() - 0.5) * 4),
        posture: clamp(m.posture + (Math.random() - 0.5) * 3),
      }));
    }, 1200);
    return () => clearInterval(id);
  }, [phase]);

  const start = async () => {
    // Warm up the speech engine on this user gesture so the first question
    // plays instantly and clearly (unlocks autoplay + preloads voices).
    if (voiceOn) void primeSpeech();
    setPhase("live");
    setQIndex(0);
    setTurns([]);
    setTranscript("");
    setPartial("");
    setTimeout(() => askCurrent(0), 250);
  };

  const askCurrent = async (idx: number) => {
    const q = pool[idx];
    if (!q) return;
    transcriptRef.current = "";
    partialRef.current = "";
    setTranscript("");
    setPartial("");
    setElapsed(0);
    if (voiceOn) {
      setAiSpeaking(true);
      await speak(q.text);
      setAiSpeaking(false);
    } else {
      setAiSpeaking(true);
      await new Promise((r) => setTimeout(r, 600));
      setAiSpeaking(false);
    }
    startListening();
    turnStartRef.current = Date.now();
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - turnStartRef.current) / 1000));
    }, 250);
  };

  const startListening = () => {
    setListening(true);
    if (recRef.current) recRef.current.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    lastSpeechAtRef.current = Date.now();

    const armSilenceTimer = () => {
      if (!autoListen) return;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        // Only auto-submit if we have something AND nothing new came in for ~2.5s.
        const sinceSpeech = Date.now() - lastSpeechAtRef.current;
        const text = (transcriptRef.current + " " + partialRef.current).trim();
        if (sinceSpeech >= 2400 && text.length > 12) {
          void submitAnswer();
        }
      }, 2500);
    };

    const rec = createRecognition({
      onPartial: (t) => {
        partialRef.current = t;
        setPartial(t);
        lastSpeechAtRef.current = Date.now();
        armSilenceTimer();
      },
      onFinal: (t) => {
        transcriptRef.current = (transcriptRef.current ? transcriptRef.current + " " : "") + t;
        partialRef.current = "";
        setTranscript(transcriptRef.current);
        setPartial("");
        lastSpeechAtRef.current = Date.now();
        armSilenceTimer();
      },
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
    recRef.current = rec;
    if (rec.supported) rec.start();
    armSilenceTimer();
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recRef.current?.stop();
    setListening(false);
  };

  // Re-speak the current question on demand (clear playback, no turn reset).
  const replayQuestion = async () => {
    if (!currentQ) return;
    cancelSpeech();
    setAiSpeaking(true);
    await speak(currentQ.text);
    setAiSpeaking(false);
  };

  const submitAnswer = async () => {
    stopListening();
    cancelSpeech();
    if (tickRef.current) clearInterval(tickRef.current);
    const finalText = (transcript + " " + partial).trim();
    const sc = scoreAnswer(finalText, currentQ.expected ?? [], currentQ.text);
    const turn: Turn = {
      questionId: currentQ.id,
      question: currentQ.text,
      answer: finalText,
      score: sc,
      durationSec: elapsed,
    };
    setTurns((t) => [...t, turn]);

    // brief AI feedback then next question
    if (voiceOn) {
      setAiSpeaking(true);
      const feedbackLine = sc.overall >= 80
        ? "Strong answer. Let's go deeper."
        : sc.overall >= 60
          ? "Good — let's tighten the structure on the next one."
          : "Let's try a different angle.";
      await speak(feedbackLine);
      setAiSpeaking(false);
    }

    const next = qIndex + 1;
    if (next >= pool.length || next >= 4) {
      setPhase("summary");
    } else {
      setQIndex(next);
      askCurrent(next);
    }
  };

  const endSession = () => {
    stopListening();
    cancelSpeech();
    if (tickRef.current) clearInterval(tickRef.current);
    if (turns.length === 0 && (transcript || partial)) {
      // capture last partial answer
      const finalText = (transcript + " " + partial).trim();
      const sc = scoreAnswer(finalText, currentQ.expected ?? [], currentQ.text);
      setTurns([{ questionId: currentQ.id, question: currentQ.text, answer: finalText, score: sc, durationSec: elapsed }]);
    }
    setPhase("summary");
  };

  /* -------- render -------- */

  if (phase === "setup") {
    return (
      <SetupScreen
        role={role}
        setRole={setRole}
        round={round}
        setRound={setRound}
        company={company}
        setCompany={setCompany}
        camOn={camOn}
        setCamOn={setCamOn}
        micOn={micOn}
        setMicOn={setMicOn}
        voiceOn={voiceOn}
        setVoiceOn={setVoiceOn}
        onStart={start}
      />
    );
  }

  if (phase === "summary") {
    return <SummaryScreen turns={turns} role={role} round={round} onRestart={() => setPhase("setup")} />;
  }

  // LIVE phase
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> Live with Aria</span>
          <span className="chip">{round}</span>
          <span className="chip">{role}</span>
          {company !== "any" && <span className="chip"><Building2 className="h-3 w-3" /> {company}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoListen((v) => !v)}
            className={cn("btn-soft", autoListen && "border-success/40 bg-success/15 text-success")}
            title="Auto-submit after you stop speaking for ~2.5s"
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", autoListen ? "bg-success animate-pulse" : "bg-white/40")} />
            Always-on
          </button>
          <button onClick={() => setVoiceOn((v) => !v)} className="btn-soft">
            {voiceOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {voiceOn ? "Voice on" : "Voice off"}
          </button>
          <button onClick={() => setMicOn((v) => !v)} className="btn-soft">
            {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            Mic
          </button>
          <button onClick={() => setCamOn((v) => !v)} className="btn-soft">
            {camOn ? <Camera className="h-3.5 w-3.5" /> : <CameraOff className="h-3.5 w-3.5" />}
            Cam
          </button>
          <button onClick={endSession} className="btn-ghost text-danger">
            <Square className="h-3.5 w-3.5" /> End
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* AI Avatar large */}
        <div className="card flex flex-col items-center justify-between lg:col-span-2">
          <div className="relative flex w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500/5 via-transparent to-accent-500/5 p-8">
            <AIAvatar speaking={aiSpeaking} listening={listening && !aiSpeaking} size={280} name="Aria" />
            <div className="mt-6 w-full max-w-2xl rounded-xl border border-white/10 bg-ink-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-widest text-white/45">Question {qIndex + 1} of {Math.min(pool.length, 4)}</p>
                <button
                  onClick={replayQuestion}
                  disabled={aiSpeaking}
                  className="btn-soft shrink-0 px-2 py-1 text-[11px] disabled:opacity-40"
                  title="Replay the question audio"
                >
                  <RotateCw className="h-3 w-3" /> Replay
                </button>
              </div>
              <p className="mt-1 text-base text-white/90">{currentQ.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="chip">{currentQ.difficulty}</span>
                {currentQ.tags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Live caption */}
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between text-xs text-white/55">
              <span className="inline-flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", listening ? "bg-success animate-pulse" : "bg-white/30")} />
                {listening ? "Listening..." : aiSpeaking ? "Aria is speaking" : "Idle"}
              </span>
              <span>{formatTime(elapsed)}</span>
            </div>
            <div className="mt-2 max-h-28 min-h-[5rem] overflow-y-auto rounded-xl border border-white/10 bg-ink-950/60 p-3 text-sm leading-relaxed">
              <span className="text-white/85">{transcript}</span>{" "}
              <span className="text-white/45">{partial}</span>
              {!transcript && !partial && (
                <span className="text-white/30">
                  {recRef.current?.supported === false
                    ? "Speech recognition isn't available in this browser. Use the text input below."
                    : "Your answer will appear here as you speak..."}
                </span>
              )}
            </div>
            {/* fallback text input */}
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type your answer (optional fallback)..."
              rows={2}
              className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-ink-950/60 p-2 text-sm outline-none focus:border-brand-400/50"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 self-stretch">
            <div className="flex gap-2">
              {!listening ? (
                <button onClick={startListening} className="btn-primary"><Play className="h-4 w-4" /> Resume listening</button>
              ) : (
                <button onClick={stopListening} className="btn-ghost"><Pause className="h-4 w-4" /> Pause</button>
              )}
              <button onClick={submitAnswer} className="btn-ghost">
                <ChevronRight className="h-4 w-4" /> Submit & next
              </button>
            </div>
          </div>
        </div>

        {/* Right rail: webcam + live metrics */}
        <div className="flex flex-col gap-4">
          <WebcamPanel enabled={camOn} micEnabled={micOn} />
          <div className="card">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-white/45">Live signals</p>
              <span className="chip"><Activity className="h-3 w-3 text-brand-400" /> realtime</span>
            </div>
            <div className="mt-4 space-y-3">
              <Bar icon={<Mic className="h-3.5 w-3.5" />} label="Pace" v={liveMetrics.pace} />
              <Bar icon={<Sparkles className="h-3.5 w-3.5" />} label="Clarity" v={liveMetrics.clarity} />
              <Bar icon={<Eye className="h-3.5 w-3.5" />} label="Eye contact" v={liveMetrics.eyeContact} />
              <Bar icon={<Activity className="h-3.5 w-3.5" />} label="Posture" v={liveMetrics.posture} />
            </div>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-widest text-white/45">Coach tips</p>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              {round === "Behavioral" || round === "HR" ? (
                <>
                  <li className="flex gap-2"><Brain className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> Use STAR — end on a quantified Result.</li>
                  <li className="flex gap-2"><Brain className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> Cut "I think" and "maybe" — be assertive.</li>
                </>
              ) : (
                <>
                  <li className="flex gap-2"><Brain className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> State assumptions before solving.</li>
                  <li className="flex gap-2"><Brain className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> Walk through edge cases out loud.</li>
                </>
              )}
              <li className="flex gap-2"><Brain className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> Aim for 60-120 words per answer.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- Setup screen -------- */

function SetupScreen({
  role,
  setRole,
  round,
  setRound,
  company,
  setCompany,
  camOn,
  setCamOn,
  micOn,
  setMicOn,
  voiceOn,
  setVoiceOn,
  onStart,
}: {
  role: Role;
  setRole: (v: Role) => void;
  round: Round;
  setRound: (v: Round) => void;
  company: string;
  setCompany: (v: string) => void;
  camOn: boolean;
  setCamOn: (v: boolean) => void;
  micOn: boolean;
  setMicOn: (v: boolean) => void;
  voiceOn: boolean;
  setVoiceOn: (v: boolean) => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip"><Sparkles className="h-3 w-3 text-brand-400" /> Flagship feature</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Face-to-Face AI Interview
          </h1>
          <p className="mt-2 max-w-2xl text-white/65">
            Talk to Aria like a real interviewer. She listens, follows up, and scores you live across voice,
            words, and body language.
          </p>
        </div>
      </div>

      {!getStoredUser() && (
        <div className="mt-6">
          <GuestBanner message="Free face-to-face interview — no account needed. Sign in to save your session report and track progress." />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Avatar preview */}
        <div className="card flex flex-col items-center justify-center text-center">
          <AIAvatar speaking size={220} name="Aria" />
          <p className="mt-5 text-sm text-white/70">Hi, I'm Aria — your AI interviewer.</p>
          <p className="mt-1 text-xs text-white/45">I'll adapt my follow-ups to your last answer.</p>
        </div>

        {/* Configuration */}
        <div className="card lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-white/45">Configure session</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Target role">
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="select">
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Round type">
              <div className="flex flex-wrap gap-2">
                {ROUNDS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRound(r)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition",
                      round === r
                        ? "border-brand-400/50 bg-brand-500/15 text-brand-100"
                        : "border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/[0.06]",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Company style (optional)">
              <select value={company} onChange={(e) => setCompany(e.target.value)} className="select">
                <option value="any">Any / generic</option>
                {COMPANIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hardware">
              <div className="flex flex-wrap gap-2">
                <Toggle on={camOn} setOn={setCamOn} icon={<Camera className="h-3.5 w-3.5" />} label="Camera" />
                <Toggle on={micOn} setOn={setMicOn} icon={<Mic className="h-3.5 w-3.5" />} label="Mic" />
                <Toggle on={voiceOn} setOn={setVoiceOn} icon={<Volume2 className="h-3.5 w-3.5" />} label="AI voice" />
              </div>
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-white/55">
              4 questions · ~10 minutes · live AI scoring
            </div>
            <button onClick={onStart} className="btn-primary">
              <Play className="h-4 w-4" /> Start interview
            </button>
          </div>
        </div>

        {/* Preview webcam */}
        <div className="card lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-white/45">Hardware check</p>
            <Link href="/dashboard" className="btn-soft"><Settings className="h-3.5 w-3.5" /> Adjust later</Link>
          </div>
          <WebcamPanel enabled={camOn} micEnabled={micOn} className="max-w-2xl" />
        </div>
      </div>

      {/* helper styles */}
      <style jsx>{`
        .select {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(6, 7, 13, 0.6);
          padding: 0.5rem 0.75rem;
          color: white;
          font-size: 0.875rem;
        }
        .select:focus { outline: none; border-color: rgba(107, 126, 255, 0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-widest text-white/45">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ on, setOn, icon, label }: { on: boolean; setOn: (v: boolean) => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition",
        on
          ? "border-success/40 bg-success/15 text-success"
          : "border-white/10 bg-white/[0.02] text-white/55 hover:bg-white/[0.06]",
      )}
    >
      {icon}
      {label}: {on ? "on" : "off"}
    </button>
  );
}

function Bar({ icon, label, v }: { icon: React.ReactNode; label: string; v: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-white/65">{icon} {label}</span>
        <span className="text-white/85">{Math.round(v)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width]"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

/* -------- Summary screen -------- */

function SummaryScreen({ turns, role, round, onRestart }: { turns: Turn[]; role: Role; round: Round; onRestart: () => void }) {
  const overall = turns.length === 0 ? 0 : Math.round(turns.reduce((s, t) => s + t.score.overall, 0) / turns.length);
  const totalSec = turns.reduce((s, t) => s + t.durationSec, 0);

  if (turns.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4">
        <div className="card text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-300" />
          <p className="mt-3 text-sm text-white/70">No answers captured. Try again with mic enabled.</p>
          <button onClick={onRestart} className="btn-primary mt-4">Restart</button>
        </div>
      </div>
    );
  }

  // Aggregate sub-scores
  const avg = (key: keyof ScoreBreakdown) =>
    Math.round(turns.reduce((s, t) => s + (t.score[key] as number), 0) / turns.length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip"><ListChecks className="h-3 w-3 text-success" /> Session complete</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">Calibrated report</h1>
          <p className="mt-1 text-white/60">{round} round · {role} · {turns.length} questions · {Math.round(totalSec / 60)}m {totalSec % 60}s total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRestart} className="btn-ghost"><ArrowRight className="h-4 w-4" /> New session</button>
          <Link href="/reports" className="btn-primary"><ChevronRight className="h-4 w-4" /> Detailed report</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <div className="card flex flex-col items-center justify-center lg:col-span-1">
          <ProgressRing value={overall} size={160} stroke={12} sublabel="overall" />
          <p className="mt-2 text-sm text-white/60">Across {turns.length} answers</p>
        </div>
        <div className="card grid grid-cols-3 gap-3 lg:col-span-3">
          {[
            ["Clarity", avg("clarity")],
            ["Relevance", avg("relevance")],
            ["Depth", avg("depth")],
            ["Confidence", avg("confidence")],
            ["Structure", avg("structure")],
            ["Filler control", avg("fillerWords")],
          ].map(([label, v]) => (
            <div key={label as string} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-white/45">{label as string}</span>
                <span className="text-base font-semibold text-gradient-accent">{v as number}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {turns.map((t, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/45">Q{i + 1} · {t.durationSec}s</p>
                <p className="mt-1 text-base text-white/90">{t.question}</p>
              </div>
              <ScorePill v={t.score.overall} />
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/40 p-3 text-sm text-white/80">
              {t.answer || <span className="text-white/40">No answer captured.</span>}
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {t.score.notes.map((n, j) => (
                <li key={j} className="flex gap-2 text-sm text-white/70">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /> {n}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScorePill({ v }: { v: number }) {
  const tone = v >= 80 ? "bg-success/15 text-success" : v >= 65 ? "bg-brand-500/15 text-brand-300" : "bg-warn/15 text-warn";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${tone}`}>{v}/100</span>;
}

function clamp(n: number, min = 30, max = 98) {
  return Math.min(max, Math.max(min, n));
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
