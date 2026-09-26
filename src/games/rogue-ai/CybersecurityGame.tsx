import { useCallback, useEffect, useRef, useState } from "react";
import { Target } from "lucide-react";
import { GameHeader } from "./game-header";
import { Playfield } from "./playfield";
import { InspectorPanel } from "./inspector-panel";
import { WinOverlay } from "./win-overlay";
import { LEVELS, type Cell, type GameElement, cloneElements, findPath } from "./game";

interface CybersecurityGameProps {
  debt?: number;
  onComplete?: () => void;
  onExit?: () => void;
}

export default function CybersecurityGame({ onComplete, onExit }: CybersecurityGameProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];

  const [elements, setElements] = useState<GameElement[]>(() => cloneElements(level));
  const [player, setPlayer] = useState<Cell>(() => ({ ...level.player }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [won, setWon] = useState(false);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const resetLevel = useCallback(
    (index: number) => {
      clearTimers();
      const lvl = LEVELS[index];
      setElements(cloneElements(lvl));
      setPlayer({ ...lvl.player });
      setSelectedId(null);
      setMoving(false);
      setWon(false);
    },
    [clearTimers],
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleReboot = useCallback(() => resetLevel(levelIndex), [resetLevel, levelIndex]);

  const handleNext = useCallback(() => {
    const next = Math.min(levelIndex + 1, LEVELS.length - 1);
    setLevelIndex(next);
    resetLevel(next);
  }, [levelIndex, resetLevel]);

  const handleReplay = useCallback(() => {
    setLevelIndex(0);
    resetLevel(0);
  }, [resetLevel]);

  const updateSelected = useCallback(
    (patch: Partial<GameElement>) => {
      if (!selectedId) return;
      setElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)));
    },
    [selectedId],
  );

  const moveTo = useCallback(
    (x: number, y: number) => {
      if (moving) return;
      const path = findPath(level, elements, player, { x, y });
      if (!path || path.length === 0) return;
      setMoving(true);
      setSelectedId(null);
      path.forEach((cell, i) => {
        const t = setTimeout(
          () => {
            setPlayer(cell);
            if (i === path.length - 1) {
              setMoving(false);
              if (cell.x === level.target.x && cell.y === level.target.y) {
                const win = setTimeout(() => {
                  setWon(true);
                  if (levelIndex === LEVELS.length - 1 && onComplete) {
                    onComplete();
                  }
                }, 250);
                timeouts.current.push(win);
              }
            }
          },
          (i + 1) * 150,
        );
        timeouts.current.push(t);
      });
    },
    [moving, level, elements, player, levelIndex, onComplete],
  );

  const selectedElement = elements.find((e) => e.id === selectedId) ?? null;
  const isFinalLevel = levelIndex === LEVELS.length - 1;

  return (
    <main className="relative min-h-screen w-full bg-[#090d16] font-mono text-emerald-100 selection:bg-emerald-500/30 overflow-y-auto">
      {/* ambient grid glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
        <GameHeader
          levelIndex={levelIndex}
          totalLevels={LEVELS.length}
          levelName={level.name}
          onReboot={handleReboot}
          onExit={onExit}
        />

        {/* objective line */}
        <div className="flex items-center gap-2 text-[11px] tracking-wider text-emerald-300/60 bg-emerald-950/20 border border-emerald-900/30 rounded-md px-3 py-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-400/80 shrink-0" aria-hidden="true" />
          <span>OBJECTIVE: {level.objective}</span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Playfield with win overlay scoped to it */}
          <div className="relative flex-1">
            <Playfield
              level={level}
              elements={elements}
              player={player}
              selectedId={selectedId}
              moving={moving}
              onSelectElement={setSelectedId}
              onMoveTo={moveTo}
            />
            {won && (
              <WinOverlay
                isFinal={isFinalLevel}
                onNext={handleNext}
                onReplay={handleReplay}
                onExit={onExit}
              />
            )}
          </div>

          <InspectorPanel
            element={selectedElement}
            onUpdate={updateSelected}
            onClose={() => setSelectedId(null)}
          />
        </div>

        <p className="text-center text-[10px] tracking-widest text-emerald-300/40 uppercase">
          CLICK A NODE TO INSPECT // MODIFY PROPERTIES // CLICK CORE_DATA.SYS WHEN PATH IS CLEAR
        </p>
      </div>
    </main>
  );
}
