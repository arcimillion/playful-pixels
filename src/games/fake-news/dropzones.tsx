import { X, Layers } from "lucide-react";
import { RISK_META, SLOTS, type SlotId, type WordCard } from "./game-data";

export function Dropzones({
  filled,
  activeSlot,
  onDropCard,
  onClear,
  onSlotEnter,
  onSlotLeave,
}: {
  filled: Record<SlotId, WordCard | null>;
  activeSlot: SlotId | null;
  onDropCard: (slot: SlotId, cardId: string) => void;
  onClear: (slot: SlotId) => void;
  onSlotEnter: (slot: SlotId) => void;
  onSlotLeave: () => void;
}) {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
      {SLOTS.map((slot, i) => {
        const card = filled[slot.id];
        const meta = card ? RISK_META[card.risk] : null;
        const isActive = activeSlot === slot.id;

        const slotSubLabel =
          slot.id === "who"
            ? "SUBJECT / ENTITY"
            : slot.id === "action"
              ? "ACTION VERB"
              : "TARGET / ENTITY";

        return (
          <div key={slot.id} className="flex w-full items-center gap-2 sm:w-auto sm:flex-col">
            {/* Card Slot Tray */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                onSlotEnter(slot.id);
              }}
              onDragLeave={onSlotLeave}
              onDrop={(e) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData("text/card");
                if (cardId) onDropCard(slot.id, cardId);
                onSlotLeave();
              }}
              className={`group relative flex flex-col items-center justify-between rounded-xl p-3 text-center transition-all duration-200 h-28 w-full sm:h-36 sm:w-56 ${
                card
                  ? "bg-amber-50 text-stone-900 border-2 border-amber-300/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.9)]"
                  : isActive
                    ? "bg-amber-950/40 border-2 border-amber-400 shadow-[inset_0_4px_14px_rgba(0,0,0,0.9),0_0_15px_rgba(251,191,36,0.3)]"
                    : "bg-[#140b07]/90 border-2 border-dashed border-amber-900/40 hover:border-amber-700/60 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
              }`}
              style={
                card && meta
                  ? {
                      boxShadow: `0 8px 24px -4px ${meta.glow}, inset 0 0 0 1px ${meta.dot}40`,
                    }
                  : undefined
              }
            >
              {/* Brass Slot Label Plate on Top */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${
                  card
                    ? "bg-stone-900 text-amber-300 shadow-sm"
                    : "bg-amber-950/80 text-amber-500/80 border border-amber-800/40"
                }`}
              >
                <span>SLOT {i + 1}</span>
                <span className="opacity-40">•</span>
                <span>{slotSubLabel}</span>
              </div>

              {/* Slotted Card Content or Empty Slot Guide */}
              {card && meta ? (
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/card", card.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex-1 flex flex-col items-center justify-between w-full px-1 py-0.5 cursor-grab active:cursor-grabbing select-none group/card"
                >
                  {/* Card drag indicator pill */}
                  <div className="w-6 h-1 rounded-full bg-stone-300 group-hover/card:bg-amber-500 transition-colors my-0.5" />

                  <span className="text-balance text-sm sm:text-base font-black leading-tight text-stone-900 line-clamp-2 my-auto">
                    {card.phrase}
                  </span>

                  {/* Risk Badge & Eject at bottom */}
                  <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-stone-200/80">
                    <span
                      className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: meta.dot }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: meta.dot, boxShadow: `0 0 6px ${meta.dot}` }}
                      />
                      {meta.label}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClear(slot.id);
                      }}
                      aria-label={`Remove ${card.phrase}`}
                      className="flex items-center gap-1 rounded bg-stone-900/10 px-1.5 py-0.5 text-[9px] font-mono text-stone-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      <span>EJECT</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-amber-700/60 group-hover:text-amber-500/80 transition-colors">
                  <Layers className="h-5 w-5 mb-1 stroke-[1.5] opacity-50" />
                  <span className="text-[11px] font-mono font-semibold tracking-wider uppercase">
                    CARD SLOT EMPTY
                  </span>
                  <span className="text-[9px] font-mono opacity-50">Drag or tap card</span>
                </div>
              )}
            </div>

            {/* Connecting + operator between card slots on mobile */}
            {i < SLOTS.length - 1 && (
              <span
                className="hidden text-xl font-mono font-bold text-amber-600/30 sm:hidden"
                aria-hidden
              >
                +
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
