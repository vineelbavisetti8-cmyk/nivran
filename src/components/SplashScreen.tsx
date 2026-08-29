"use client";
import { useEffect, useState } from "react";
import { Sparkles, Shield, Clock, CheckCircle2 } from "lucide-react";

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"enter" | "active" | "exit" | "done">("enter");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if splash has already been shown in current session
    const hasSeen = sessionStorage.getItem("nivaran_splash_shown");
    if (hasSeen === "true") {
      setPhase("done");
      return;
    }

    setMounted(true);

    // Phase 1: Enter (emblem appears)
    const t1 = setTimeout(() => {
      setPhase("active");
    }, 100);

    // Progress bar ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 80);

    // Phase 2: Exit fade
    const t2 = setTimeout(() => {
      setPhase("exit");
      sessionStorage.setItem("nivaran_splash_shown", "true");
    }, 2000);

    // Phase 3: Unmount
    const t3 = setTimeout(() => {
      setPhase("done");
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  if (phase === "done" || !mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#071d16] text-white transition-all duration-700 ease-in-out select-none ${
        phase === "exit"
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      style={{
        background: "radial-gradient(circle at 50% 45%, #0e3f32 0%, #061913 70%, #030d0a 100%)",
      }}
    >
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute w-[340px] h-[340px] rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* BRAND EMBLEM WITH GLASSMORPHIC RING */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-emerald-500/30 to-amber-500/20 blur-md animate-tilt" />
          
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#136750] to-[#0a4132] border border-emerald-400/30 shadow-2xl flex items-center justify-center text-white transform transition-transform duration-700">
            <span className="font-serif text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              n
            </span>
          </div>

          {/* PULSING ORBIT DOT */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#071d16] shadow-[0_0_12px_#f59e0b] animate-ping" />
        </div>

        {/* LOGO TYPOGRAPHY */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white m-0">
              Nivaran
            </h1>
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/70 font-semibold">
            Autonomous Civic Redressal
          </p>
        </div>

        {/* PROMISE TAGLINE */}
        <p className="text-xs text-gray-300/80 max-w-[260px] leading-relaxed mb-8 italic">
          &ldquo;Every complaint gets an answer &mdash; automatically.&rdquo;
        </p>

        {/* ANIMATED PIPELINE NODES & PROGRESS BAR */}
        <div className="w-full max-w-[220px] space-y-3">
          <div className="w-full h-1 bg-emerald-950/80 border border-emerald-800/40 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* ENGINE STATUS LABEL */}
          <div className="flex items-center justify-between text-[10px] text-emerald-400/80 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              SLA Watchdog
            </span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
        </div>

        {/* SKIP BUTTON */}
        <button
          type="button"
          onClick={() => {
            setPhase("exit");
            sessionStorage.setItem("nivaran_splash_shown", "true");
            setTimeout(() => setPhase("done"), 400);
          }}
          className="mt-6 text-[11px] text-gray-400/70 hover:text-white transition-colors duration-200 uppercase tracking-wider font-semibold py-1 px-3 rounded-full hover:bg-white/5"
        >
          Skip Intro &rarr;
        </button>
      </div>
    </div>
  );
}
