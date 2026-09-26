import { useMemo } from "react";
import { Database, Lock, ShieldAlert, GitBranch } from "lucide-react";
import { type GameElement, type Level, elementAt, isElementPassable, reachableCells } from "./game";

const CELL = 58; // px

interface PlayfieldProps {
  level: Level;
  elements: GameElement[];
  player: { x: number; y: number };
  selectedId: string | null;
  moving: boolean;
  onSelectElement: (id: string) => void;
  onMoveTo: (x: number, y: number) => void;
}

const ELEMENT_ICON = {
  firewall: ShieldAlert,
  bridge: GitBranch,
  gate: Lock,
} as const;

export function Playfield({
  level,
  elements,
  player,
  selectedId,
  moving,
  onSelectElement,
  onMoveTo,
}: PlayfieldProps) {
  const reachable = useMemo(
    () => reachableCells(level, elements, player),
    [level, elements, player],
  );

  const wallSet = useMemo(() => new Set(level.walls.map((w) => `${w.x},${w.y}`)), [level.walls]);

  const width = level.cols * CELL;
  const height = level.rows * CELL;

  const targetReachable = reachable.has(`${level.target.x},${level.target.y}`);

  return (
    <div className="flex w-full justify-center overflow-auto p-2">
      <div
        className="relative shrink-0 rounded-lg border border-emerald-500/20 bg-[#070b12]"
        style={{
          width,
          height,
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.10) 1px, transparent 1px)",
          backgroundSize: `${CELL}px ${CELL}px`,
          boxShadow: "inset 0 0 60px rgba(16,185,129,0.06)",
        }}
      >
        {/* Clickable cells */}
        {Array.from({ length: level.rows }).map((_, y) =>
          Array.from({ length: level.cols }).map((__, x) => {
            const k = `${x},${y}`;
            const isWall = wallSet.has(k);
            const el = elementAt(elements, x, y);
            const canReach = reachable.has(k);
            const isPlayer = player.x === x && player.y === y;
            const clickableMove = canReach && !el && !isWall && !isPlayer && !moving;

            return (
              <button
                type="button"
                key={k}
                aria-label={`cell ${x}, ${y}`}
                disabled={moving}
                onClick={() => {
                  if (el) onSelectElement(el.id);
                  else if (clickableMove) onMoveTo(x, y);
                }}
                className="absolute transition-colors"
                style={{
                  left: x * CELL,
                  top: y * CELL,
                  width: CELL,
                  height: CELL,
                  cursor: el ? "pointer" : clickableMove ? "pointer" : "default",
                }}
              >
                {clickableMove && (
                  <span className="pointer-events-none absolute inset-2 rounded-sm bg-emerald-400/5 ring-1 ring-inset ring-emerald-400/20 transition-all hover:bg-emerald-400/10" />
                )}
              </button>
            );
          }),
        )}

        {/* Static walls */}
        {level.walls.map((w) => (
          <div
            key={`w-${w.x}-${w.y}`}
            className="pointer-events-none absolute"
            style={{ left: w.x * CELL, top: w.y * CELL, width: CELL, height: CELL }}
          >
            <div
              className="absolute inset-0.5 rounded-sm border border-slate-700/40 bg-slate-900/60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(148,163,184,0.08) 0 6px, transparent 6px 12px)",
              }}
            />
          </div>
        ))}

        {/* Interactive elements (obstacles) */}
        {elements.map((el) => {
          const Icon = ELEMENT_ICON[el.type];
          const selected = el.id === selectedId;
          const passable = isElementPassable(el);
          const color = el.type === "gate" ? "168,85,247" : "34,211,238";
          return el.cells.map((c, i) => (
            <button
              type="button"
              key={`${el.id}-${i}`}
              onClick={() => onSelectElement(el.id)}
              aria-label={`${el.label} node`}
              className="group absolute cursor-pointer"
              style={{ left: c.x * CELL, top: c.y * CELL, width: CELL, height: CELL }}
            >
              <div
                className="absolute inset-1 flex items-center justify-center rounded-sm border-2 transition-all duration-300"
                style={{
                  opacity: passable ? Math.max(el.opacity / 100, 0.12) : el.opacity / 100,
                  borderColor: selected
                    ? `rgba(${color},1)`
                    : passable
                      ? `rgba(${color},0.35)`
                      : "rgba(239,68,68,0.6)",
                  backgroundColor: passable ? `rgba(${color},0.08)` : "rgba(239,68,68,0.10)",
                  boxShadow: selected
                    ? `0 0 18px rgba(${color},0.7), inset 0 0 14px rgba(${color},0.25)`
                    : passable
                      ? `inset 0 0 12px rgba(${color},0.15)`
                      : "inset 0 0 12px rgba(239,68,68,0.2)",
                }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: passable ? `rgb(${color})` : "rgb(248,113,113)" }}
                  aria-hidden="true"
                />
                {i === 0 && (
                  <span
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold tracking-widest font-mono"
                    style={{ color: passable ? `rgb(${color})` : "rgb(248,113,113)" }}
                  >
                    {el.label}
                  </span>
                )}
              </div>
            </button>
          ));
        })}

        {/* Target: CORE_DATA.SYS */}
        <button
          type="button"
          disabled={moving}
          onClick={() => {
            if (targetReachable && !moving) onMoveTo(level.target.x, level.target.y);
          }}
          aria-label="CORE_DATA.SYS target node"
          className="absolute"
          style={{
            left: level.target.x * CELL,
            top: level.target.y * CELL,
            width: CELL,
            height: CELL,
            cursor: targetReachable && !moving ? "pointer" : "default",
          }}
        >
          <div
            className="absolute inset-1.5 flex items-center justify-center rounded-md border-2 border-purple-400/70 bg-purple-500/10 transition-all"
            style={{
              boxShadow: targetReachable
                ? "0 0 22px rgba(168,85,247,0.8), inset 0 0 14px rgba(168,85,247,0.3)"
                : "0 0 12px rgba(168,85,247,0.35)",
              animation: targetReachable ? "corePulse 1.2s ease-in-out infinite" : undefined,
            }}
          >
            <Database className="h-5 w-5 text-purple-300" aria-hidden="true" />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold tracking-widest text-purple-300 font-mono">
              CORE_DATA.SYS
            </span>
          </div>
        </button>

        {/* Player: AVATAR */}
        <div
          className="pointer-events-none absolute z-10 flex items-center justify-center"
          style={{
            left: player.x * CELL,
            top: player.y * CELL,
            width: CELL,
            height: CELL,
            transition: "left 140ms linear, top 140ms linear",
          }}
        >
          <div className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
            <span
              className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 16px 4px rgba(52,211,153,0.9)" }}
            />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold tracking-widest text-emerald-300 font-mono">
              AVATAR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
