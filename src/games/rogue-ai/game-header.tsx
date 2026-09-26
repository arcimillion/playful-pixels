import { ArrowLeft, RotateCcw, Terminal } from "lucide-react";

interface GameHeaderProps {
  levelIndex: number;
  totalLevels: number;
  levelName: string;
  onReboot: () => void;
  onExit?: () => void;
}

export function GameHeader({
  levelIndex,
  totalLevels,
  levelName,
  onReboot,
  onExit,
}: GameHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-emerald-500/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: back to portal + system status */}
      <div className="flex items-center gap-3">
        {onExit && (
          <button
            onClick={onExit}
            className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-bold tracking-widest text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-100 transition-colors cursor-pointer uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>← GIG//PORTAL</span>
          </button>
        )}
        <div className="flex items-center gap-2.5 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
            <span className="led-flash relative inline-flex h-2.5 w-2.5 rounded-full" />
          </span>
          <span className="text-[10px] font-semibold tracking-[0.2em] text-red-300/90 sm:text-xs">
            SYSTEM STATUS: BREACH IN PROGRESS
          </span>
        </div>
      </div>

      {/* Center: level indicator */}
      <div className="flex items-center gap-2 text-center">
        <Terminal className="h-4 w-4 text-cyan-400" aria-hidden="true" />
        <span className="text-xs font-bold tracking-[0.15em] text-cyan-300 sm:text-sm">
          LEVEL {levelIndex + 1} / {totalLevels}: {levelName}
        </span>
      </div>

      {/* Right: reboot */}
      <button
        type="button"
        onClick={onReboot}
        className="group inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-emerald-300 transition-colors hover:bg-emerald-500/15 hover:text-emerald-200 sm:text-xs cursor-pointer"
      >
        <RotateCcw
          className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180"
          aria-hidden="true"
        />
        REBOOT LEVEL
      </button>
    </header>
  );
}
