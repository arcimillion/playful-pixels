import { ChevronRight, Code2, X } from "lucide-react";
import { type GameElement, type SecurityLevel, isElementPassable } from "./game";

const SECURITY_OPTIONS: SecurityLevel[] = ["Level 1", "Level 5", "Bypassed"];

interface InspectorPanelProps {
  element: GameElement | null;
  onUpdate: (patch: Partial<GameElement>) => void;
  onClose: () => void;
}

export function InspectorPanel({ element, onUpdate, onClose }: InspectorPanelProps) {
  return (
    <aside className="flex w-full flex-col rounded-lg border border-cyan-500/25 bg-[#070b12]/90 lg:w-80 lg:shrink-0 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-cyan-500/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <span className="text-xs font-bold tracking-[0.2em] text-cyan-300">UI INSPECTOR</span>
        </div>
        {element && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="rounded p-1 text-cyan-400/70 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!element ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500/60" />
          <p className="text-[11px] leading-relaxed tracking-wider text-cyan-200/40 font-mono">
            SELECT A NODE ON THE GRID
            <br />
            TO INSPECT &amp; MODIFY ITS DOM
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-5 p-4 font-mono">
          {/* Selected node identity */}
          <div className="rounded-md border border-cyan-500/15 bg-cyan-500/5 p-3">
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-cyan-400/60">
              <ChevronRight className="h-3 w-3" />
              SELECTED NODE
            </div>
            <p className="mt-1 font-bold tracking-wider text-cyan-200">{element.label}</p>
            <p className="mt-0.5 text-[10px] tracking-wider text-cyan-400/50">
              &lt;{element.type} /&gt;
            </p>
          </div>

          {/* isSolid toggle */}
          <div className="flex items-center justify-between">
            <label className="text-[11px] tracking-wider text-emerald-200/80">isSolid</label>
            <button
              type="button"
              role="switch"
              aria-checked={element.isSolid}
              onClick={() => onUpdate({ isSolid: !element.isSolid })}
              className="relative h-6 w-12 rounded-full border transition-colors cursor-pointer"
              style={{
                borderColor: element.isSolid ? "rgba(239,68,68,0.5)" : "rgba(52,211,153,0.6)",
                backgroundColor: element.isSolid ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)",
              }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200"
                style={{
                  left: element.isSolid ? "26px" : "3px",
                  backgroundColor: element.isSolid ? "rgb(248,113,113)" : "rgb(52,211,153)",
                  boxShadow: `0 0 10px ${element.isSolid ? "rgba(239,68,68,0.8)" : "rgba(52,211,153,0.8)"}`,
                }}
              />
            </button>
          </div>

          {/* opacity slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] tracking-wider text-emerald-200/80">Opacity</label>
              <span className="font-mono text-[11px] text-cyan-300">{element.opacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={element.opacity}
              onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
              className="neon-slider w-full"
              aria-label="Opacity"
            />
          </div>

          {/* security level dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-wider text-emerald-200/80">Security Level</label>
            <div className="grid grid-cols-3 gap-1.5">
              {SECURITY_OPTIONS.map((opt) => {
                const active = element.securityLevel === opt;
                const isBypass = opt === "Bypassed";
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onUpdate({ securityLevel: opt })}
                    className="rounded border px-1 py-1.5 text-[9px] font-semibold tracking-wider transition-all cursor-pointer"
                    style={{
                      borderColor: active
                        ? isBypass
                          ? "rgba(52,211,153,0.7)"
                          : "rgba(34,211,238,0.6)"
                        : "rgba(148,163,184,0.2)",
                      backgroundColor: active
                        ? isBypass
                          ? "rgba(52,211,153,0.15)"
                          : "rgba(34,211,238,0.12)"
                        : "transparent",
                      color: active
                        ? isBypass
                          ? "rgb(110,231,183)"
                          : "rgb(103,232,249)"
                        : "rgba(148,163,184,0.6)",
                    }}
                  >
                    {opt.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* live status readout */}
          <div className="mt-auto rounded-md border border-emerald-500/15 bg-black/40 p-3 font-mono text-[10px] leading-relaxed">
            <span className="text-slate-500">// live state</span>
            <div className="text-emerald-300/90">
              node.passable ={" "}
              <span
                style={{
                  color: isElementPassable(element) ? "rgb(52,211,153)" : "rgb(248,113,113)",
                }}
              >
                {String(isElementPassable(element))}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
