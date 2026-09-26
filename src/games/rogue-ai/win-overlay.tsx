import React, { useMemo } from "react";
import { CheckCircle2, ChevronRight, RotateCcw, Trophy } from "lucide-react";

interface WinOverlayProps {
  isFinal: boolean;
  onNext: () => void;
  onReplay: () => void;
  onExit?: () => void;
}

export function WinOverlay({ isFinal, onNext, onReplay, onExit }: WinOverlayProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        angle: (360 / 28) * i + Math.random() * 8,
        distance: 90 + Math.random() * 140,
        delay: Math.random() * 0.15,
        size: 3 + Math.random() * 4,
        cyan: i % 2 === 0,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* particle burst */}
      <div className="pointer-events-none absolute left-1/2 top-1/2">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={
              {
                width: p.size,
                height: p.size,
                backgroundColor: p.cyan ? "rgb(34,211,238)" : "rgb(52,211,153)",
                boxShadow: `0 0 8px ${p.cyan ? "rgba(34,211,238,0.9)" : "rgba(52,211,153,0.9)"}`,
                animation: `particleFly 0.9s ${p.delay}s ease-out forwards`,
                "--angle": `${p.angle}deg`,
                "--dist": `${p.distance}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border border-emerald-400/40 bg-[#070b12] p-8 text-center"
        style={{
          boxShadow: "0 0 40px rgba(52,211,153,0.3), inset 0 0 30px rgba(52,211,153,0.06)",
          animation: "popIn 0.4s ease-out",
        }}
      >
        {isFinal ? (
          <Trophy
            className="h-12 w-12 text-emerald-400"
            style={{ filter: "drop-shadow(0 0 12px rgba(52,211,153,0.8))" }}
            aria-hidden="true"
          />
        ) : (
          <CheckCircle2
            className="h-12 w-12 text-emerald-400"
            style={{ filter: "drop-shadow(0 0 12px rgba(52,211,153,0.8))" }}
            aria-hidden="true"
          />
        )}

        <div>
          <h2 className="text-lg font-bold tracking-[0.2em] text-emerald-300 font-mono">
            {isFinal ? "SYSTEM BREACHED" : "ACCESS GRANTED"}
          </h2>
          <p className="mt-1 text-[11px] tracking-widest text-emerald-200/50 font-mono">
            {isFinal ? "ALL CORES EXTRACTED // ROGUE AI LOOSE" : "CORE_DATA.SYS DECRYPTED"}
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
          {isFinal ? (
            <>
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-400/50 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold tracking-[0.2em] text-emerald-300 transition-colors hover:bg-emerald-500/20 cursor-pointer font-mono"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                RUN AGAIN
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-700 bg-stone-900/80 px-5 py-2 text-xs font-bold tracking-[0.2em] text-stone-300 transition-colors hover:bg-stone-800 cursor-pointer font-mono"
                >
                  RETURN TO GIGS
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-400/50 bg-cyan-500/10 px-5 py-2.5 text-xs font-bold tracking-[0.2em] text-cyan-300 transition-colors hover:bg-cyan-500/20 cursor-pointer font-mono"
            >
              PROCEED
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
