import { ArrowLeft, DollarSign, Flame, Clock } from "lucide-react";

export function Scoreboard({
  cash,
  cashPulse,
  risk,
  timeLeft,
  totalTime,
  onExit,
}: {
  cash: number;
  cashPulse: boolean;
  risk: number;
  timeLeft: number;
  totalTime: number;
  onExit?: () => void;
}) {
  const riskPct = Math.min(100, Math.max(0, risk));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const timeFrac = Math.max(0, timeLeft / totalTime);
  const urgent = timeLeft <= 5;

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-xl border border-amber-900/50 bg-[#140b07]/90 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-md sm:px-6">
      {/* Back button & Cash */}
      <div className="flex items-center gap-3">
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-lg border border-amber-800/50 bg-amber-950/60 px-2.5 py-1.5 text-xs font-mono font-bold tracking-widest text-amber-300 hover:bg-amber-900/80 hover:text-amber-100 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GIGS</span>
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400/80">
              REVENUE
            </div>
            <div
              className={`font-mono text-xl font-black text-amber-300 tabular-nums transition-transform duration-200 sm:text-2xl drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] ${
                cashPulse ? "scale-125 text-emerald-300" : "scale-100"
              }`}
            >
              ${cash.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Risk bar */}
      <div className="flex flex-1 flex-col items-center px-2 max-w-[260px]">
        <div className="mb-1 flex items-center justify-between w-full text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400/90">
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-rose-500" />
            <span>LAWSUIT RISK</span>
          </span>
          <span className={riskPct > 70 ? "text-rose-400 font-bold" : "text-amber-500/70"}>
            {riskPct}%
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-stone-950 border border-amber-950/80 shadow-inner">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 transition-[width] duration-500"
            style={{
              width: `${riskPct}%`,
              boxShadow: riskPct > 0 ? "0 0 12px rgba(244,63,94,0.6)" : undefined,
            }}
          />
          {riskPct > 80 && (
            <div className="absolute inset-0 animate-pulse rounded-full bg-rose-500/30" />
          )}
        </div>
      </div>

      {/* Live deadline stopwatch */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="rgba(120,53,15,0.3)"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={urgent ? "#ef4444" : "#f59e0b"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - timeFrac)}
            style={{
              transition: "stroke-dashoffset 1s linear, stroke 0.3s",
              filter: `drop-shadow(0 0 6px ${
                urgent ? "rgba(239,68,68,0.8)" : "rgba(245,158,11,0.6)"
              })`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock
            className={`h-3 w-3 ${urgent ? "text-rose-400 animate-bounce" : "text-amber-400"}`}
          />
          <span
            className={`font-mono text-sm font-black tabular-nums ${
              urgent ? "text-rose-400" : "text-amber-200"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>
    </header>
  );
}
