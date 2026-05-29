"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  enabled: boolean;
  micEnabled?: boolean;
  onStreamReady?: (stream: MediaStream) => void;
  className?: string;
}

export function WebcamPanel({ enabled, micEnabled = true, onStreamReady, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!enabled) {
        stop();
        return;
      }
      setStatus("starting");
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: micEnabled,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("ready");
        onStreamReady?.(stream);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Camera unavailable";
        setError(msg);
        setStatus("error");
      }
    }

    function stop() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setStatus("idle");
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, micEnabled]);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900", className)}>
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      {/* overlay */}
      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center bg-ink-950/80 text-center">
          {status === "starting" ? (
            <div className="flex flex-col items-center gap-2 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Requesting camera & mic...</span>
            </div>
          ) : status === "error" ? (
            <div className="max-w-xs text-center">
              <CameraOff className="mx-auto h-6 w-6 text-danger" />
              <p className="mt-2 text-sm text-white/80">Camera unavailable</p>
              <p className="mt-1 text-xs text-white/50">{error ?? "Allow camera & mic access in your browser settings."}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/55">
              <CameraOff className="h-5 w-5" />
              <span className="text-sm">Camera off</span>
            </div>
          )}
        </div>
      )}
      {/* corner status */}
      {status === "ready" && (
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" /> LIVE
          </span>
        </div>
      )}
      {status === "ready" && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white/80 backdrop-blur">
          {micEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          <Camera className="h-3 w-3" />
          <span>You</span>
        </div>
      )}
    </div>
  );
}
