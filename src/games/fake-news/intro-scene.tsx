import { useEffect, useState } from "react";
import { SkipForward, Sparkles } from "lucide-react";
import { AnchorAvatar } from "./anchor-avatar";

const SCRIPT =
  "Welcome, Intern! Drag cards to the slots. Build sensational headlines. Earn cash, but avoid lawsuits!";

export function IntroScene({ onDone, onExit }: { onDone: () => void; onExit?: () => void }) {
  const [typed, setTyped] = useState("");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i += 2;
      setTyped(SCRIPT.slice(0, i));
      if (i >= SCRIPT.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, []);

  const finished = typed.length >= SCRIPT.length;

  function handleSkip() {
    setLeaving(true);
    setTimeout(onDone, 200);
  }

  return (
    <div
      className={`relative z-10 flex min-h-dvh flex-col items-center justify-center gap-6 px-4 transition-all duration-500 ${
        leaving ? "translate-y-2 opacity-0 blur-sm" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
        On Air Studio 7
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <div className="animate-[float_4s_ease-in-out_infinite]">
          <AnchorAvatar talking={!finished} />
        </div>

        {/* Speech bubble */}
        <div className="relative mb-8 max-w-sm rounded-3xl border border-white/15 bg-white/95 p-5 text-slate-900 shadow-2xl shadow-cyan-500/20">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fuchsia-600">
            <Sparkles className="h-3.5 w-3.5" />
            Producer
          </div>
          <p className="text-pretty text-base font-medium leading-relaxed">
            {typed}
            <span
              className={`ml-0.5 inline-block h-4 w-0.5 bg-slate-900 align-middle ${
                finished ? "opacity-0" : "animate-pulse"
              }`}
            />
          </p>
          {/* Bubble tail */}
          <div className="absolute -left-2 bottom-6 h-4 w-4 rotate-45 border-b border-l border-white/15 bg-white/95 sm:block" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/80 px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-stone-300 hover:bg-stone-800 hover:text-white transition-all cursor-pointer"
          >
            EXIT TO GIGS
          </button>
        )}
        <button
          type="button"
          onClick={handleSkip}
          className="group inline-flex items-center gap-2.5 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 px-8 py-3.5 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 cursor-pointer"
        >
          <span>START SHIFT</span>
          <span className="text-base transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
