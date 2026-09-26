import { RISK_META, type WordCard } from "./game-data";

export function CardDeck({
  cards,
  usedIds,
  shuffling,
  onCardClick,
  onDragStart,
}: {
  cards: WordCard[];
  usedIds: Set<string>;
  shuffling: boolean;
  onCardClick: (card: WordCard) => void;
  onDragStart: (cardId: string) => void;
}) {
  return (
    <div className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
      {cards.map((card, i) => {
        const meta = RISK_META[card.risk];
        const used = usedIds.has(card.id);
        return (
          <button
            type="button"
            key={card.id}
            draggable={!used}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/card", card.id);
              e.dataTransfer.effectAllowed = "move";
              onDragStart(card.id);
            }}
            onClick={() => !used && onCardClick(card)}
            disabled={used}
            className={`group relative flex aspect-[3/4] flex-col items-center justify-between overflow-hidden rounded-xl border p-2.5 text-center transition-all ${
              used
                ? "cursor-default border-amber-950/30 bg-amber-950/20 opacity-30 scale-95"
                : "cursor-grab border-amber-200/90 bg-gradient-to-b from-[#fffefc] to-[#f7f2e7] text-stone-900 shadow-[0_6px_18px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.7)] active:cursor-grabbing hover:border-amber-400"
            } ${shuffling ? "animate-[dealIn_0.45s_ease-out_both]" : ""}`}
            style={{
              animationDelay: shuffling ? `${i * 55}ms` : undefined,
              boxShadow: !used ? `0 8px 20px -6px ${meta.glow}` : undefined,
            }}
          >
            {/* Slot Category & Risk Tag */}
            <div className="flex items-center justify-between w-full px-0.5">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-stone-500">
                {card.slot}
              </span>
              <span
                className="flex items-center gap-1 rounded-full bg-stone-900/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                style={{
                  color: used
                    ? "#78716c"
                    : meta.dot === "#fbbf24"
                      ? "#b45309"
                      : meta.dot === "#34d399"
                        ? "#047857"
                        : "#be123c",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: meta.dot,
                    boxShadow: !used ? `0 0 6px ${meta.dot}` : undefined,
                  }}
                />
                {meta.label}
              </span>
            </div>

            {/* Headline Phrase */}
            <span className="text-balance px-0.5 text-xs sm:text-sm font-black leading-tight text-stone-950">
              {card.phrase}
            </span>

            {/* Bottom Color Accent */}
            <span
              className="h-1 w-8 rounded-full opacity-80"
              style={{ backgroundColor: meta.dot }}
            />

            {!used && (
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                aria-hidden
              />
            )}
          </button>
        );
      })}

      <style>{`
        @keyframes dealIn {
          from { opacity: 0; transform: translateY(30px) rotate(-6deg) scale(0.9); }
          to { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
