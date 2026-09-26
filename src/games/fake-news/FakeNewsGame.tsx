import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Radio, Gavel, TrendingUp, Sparkles, Bot, AlertTriangle } from "lucide-react";
import { RISK_META, SLOTS, drawDeck, type SlotId, type WordCard } from "./game-data";
import { StudioBackground } from "./studio-background";
import { IntroScene } from "./intro-scene";
import { Scoreboard } from "./scoreboard";
import { Dropzones } from "./dropzones";
import { CardDeck } from "./card-deck";
import { evaluateHeadlineServerFn, type AIJudgment } from "./ai-judge";

const TOTAL_TIME = 15;
const LAWSUIT_PENALTY = 1000;
const DEADLINE_PENALTY = 500;
const WRONG_SLOT_PENALTY = 600;

type Toast = { id: number; kind: "payout" | "lawsuit" | "stale"; text: string } | null;

const EMPTY: Record<SlotId, WordCard | null> = { who: null, action: null, target: null };

interface FakeNewsGameProps {
  onExit?: () => void;
  debt?: number;
}

export default function FakeNewsGame({ onExit }: FakeNewsGameProps) {
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cash, setCash] = useState(300); // Starting working capital
  const [cashPulse, setCashPulse] = useState(false);
  const [risk, setRisk] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [deck, setDeck] = useState<WordCard[]>(() => drawDeck());
  const [filled, setFilled] = useState<Record<SlotId, WordCard | null>>(EMPTY);
  const [activeSlot, setActiveSlot] = useState<SlotId | null>(null);
  const [shuffling, setShuffling] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [latestJudgment, setLatestJudgment] = useState<AIJudgment | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const usedIds = useMemo(
    () =>
      new Set(
        Object.values(filled)
          .filter(Boolean)
          .map((c) => (c as WordCard).id),
      ),
    [filled],
  );
  const allFilled = SLOTS.every((s) => filled[s.id]);

  const showToast = useCallback((t: NonNullable<Toast>) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const freshRound = useCallback(() => {
    setFilled(EMPTY);
    setShuffling(true);
    setDeck(drawDeck());
    setTimeLeft(TOTAL_TIME);
    setTimeout(() => setShuffling(false), 200);
  }, []);

  const dismissJudgment = useCallback(() => {
    if (latestJudgment) {
      setLatestJudgment(null);
      freshRound();
      setBroadcasting(false);
    }
  }, [latestJudgment, freshRound]);

  const handleRestart = useCallback(() => {
    setCash(300);
    setRisk(0);
    setPublishedCount(0);
    setGameOver(false);
    setFilled(EMPTY);
    setDeck(drawDeck());
    setTimeLeft(TOTAL_TIME);
    setStarted(true);
  }, []);

  // Countdown timer with Cash Penalty on Deadline Expired
  useEffect(() => {
    if (!started || gameOver || broadcasting) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Cash penalty for missing deadline!
          setCash((c) => {
            const next = c - DEADLINE_PENALTY;
            if (next < 0) {
              setGameOver(true);
            }
            return next;
          });
          showToast({
            id: Date.now(),
            kind: "stale",
            text: `DEADLINE MISSED! -$${DEADLINE_PENALTY}`,
          });
          freshRound();
          return TOTAL_TIME;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, gameOver, broadcasting, showToast, freshRound]);

  // Initial deal
  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setShuffling(false), 200);
      return () => clearTimeout(t);
    }
  }, [started]);

  const placeCard = useCallback(
    (targetSlot: SlotId, cardId: string) => {
      setFilled((prev) => {
        const card =
          deck.find((c) => c.id === cardId) || Object.values(prev).find((c) => c?.id === cardId);
        if (!card) return prev;

        const next = { ...prev };

        // Check if the dragged card is currently inside another slot
        let sourceSlot: SlotId | null = null;
        for (const s of SLOTS) {
          if (next[s.id]?.id === cardId) {
            sourceSlot = s.id;
            break;
          }
        }

        if (sourceSlot && sourceSlot !== targetSlot) {
          // Swap: Card already in target slot moves to source slot
          const existingTargetCard = next[targetSlot];
          next[sourceSlot] = existingTargetCard;
          next[targetSlot] = card;
        } else {
          // Normal placement: clear from any other slot just in case
          for (const s of SLOTS) {
            if (next[s.id]?.id === cardId) next[s.id] = null;
          }
          next[targetSlot] = card;
        }

        return next;
      });
    },
    [deck],
  );

  const handleCardClick = useCallback(
    (card: WordCard) => {
      // Action verbs strictly belong in Slot 2 (Action)
      if (card.slot === "action") {
        if (!filled.action) {
          placeCard("action", card.id);
          return;
        }
      } else {
        // "Who" and "Target" cards are interchangeable! Can go to Slot 1 or Slot 3
        if (!filled.who) {
          placeCard("who", card.id);
          return;
        }
        if (!filled.target) {
          placeCard("target", card.id);
          return;
        }
      }
      // Otherwise find first empty slot
      const target = SLOTS.find((s) => !filled[s.id]);
      if (target) placeCard(target.id, card.id);
    },
    [filled, placeCard],
  );

  const clearSlot = useCallback((slot: SlotId) => {
    setFilled((prev) => ({ ...prev, [slot]: null }));
  }, []);

  async function broadcast() {
    if (!allFilled || broadcasting || gameOver) return;
    setBroadcasting(true);

    // ─── CHECK FOR WRONG SLOT PLACEMENT (WHO & TARGET ARE INTERCHANGEABLE) ───
    const wrongPlacements: string[] = [];

    // Slot 1: Accepts 'who' OR 'target' (Entities)
    if (filled.who && filled.who.slot === "action") {
      wrongPlacements.push("Slot 1 (Subject) cannot take an Action verb");
    }

    // Slot 2: MUST be an 'action' card
    if (filled.action && filled.action.slot !== "action") {
      wrongPlacements.push("Slot 2 (Action) requires an Action verb card");
    }

    // Slot 3: Accepts 'target' OR 'who' (Entities)
    if (filled.target && filled.target.slot === "action") {
      wrongPlacements.push("Slot 3 (Target) cannot take an Action verb");
    }

    if (wrongPlacements.length > 0) {
      // Penalty for improper slot placement
      const totalWrongPenalty = WRONG_SLOT_PENALTY * wrongPlacements.length;
      setCash((c) => {
        const next = c - totalWrongPenalty;
        if (next < 0) {
          setGameOver(true);
        }
        return next;
      });

      setRisk((prev) => Math.min(100, prev + 15 * wrongPlacements.length));

      showToast({
        id: Date.now(),
        kind: "lawsuit",
        text: `EDITORIAL BLUNDER! -$${totalWrongPenalty} (${wrongPlacements[0]})`,
      });

      setTimeout(() => {
        freshRound();
        setBroadcasting(false);
      }, 500);
      return;
    }

    // ─── VALID HEADLINE: AI JUDGE EVALUATION ───
    const cards = SLOTS.map((s) => filled[s.id] as WordCard);
    const isExtreme = cards.some((c) => c.risk === "extreme");
    const isMedium = cards.some((c) => c.risk === "medium");
    const baseRisk = isExtreme ? "extreme" : isMedium ? "medium" : "safe";

    try {
      const judgment = await evaluateHeadlineServerFn({
        data: {
          who: filled.who!.phrase,
          action: filled.action!.phrase,
          target: filled.target!.phrase,
          baseRisk,
        },
      });

      setLatestJudgment(judgment);

      setRisk((prevRisk) => {
        const nextRisk = prevRisk + judgment.heat;
        if (nextRisk >= 100) {
          setCash((c) => {
            const next = c - LAWSUIT_PENALTY;
            if (next < 0) {
              setGameOver(true);
            }
            return next;
          });
          showToast({
            id: Date.now(),
            kind: "lawsuit",
            text: `FEDERAL LAWSUIT! -$${LAWSUIT_PENALTY}`,
          });
          return 0;
        }
        setCash((c) => c + judgment.payout);
        setCashPulse(true);
        setPublishedCount((n) => n + 1);
        setTimeout(() => setCashPulse(false), 350);
        showToast({
          id: Date.now(),
          kind: "payout",
          text: `AI JUDGE: +$${judgment.payout} (${judgment.verdict})`,
        });
        return nextRisk;
      });

      setTimeout(() => {
        setLatestJudgment(null);
        freshRound();
        setBroadcasting(false);
      }, 1400);
    } catch (err) {
      console.error("AI Evaluation error:", err);
      freshRound();
      setBroadcasting(false);
    }
  }

  // Keyboard shortcut (Space / Enter) to dismiss judgment instantly
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (latestJudgment && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        dismissJudgment();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [latestJudgment, dismissJudgment]);

  return (
    <main className="relative min-h-screen w-full overflow-y-auto bg-[#080a1f] text-white">
      <StudioBackground />

      {!started ? (
        <IntroScene onDone={() => setStarted(true)} />
      ) : (
        <div className="relative z-10 flex min-h-screen flex-col justify-between gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6">
          <Scoreboard
            cash={cash}
            cashPulse={cashPulse}
            risk={risk}
            timeLeft={timeLeft}
            totalTime={TOTAL_TIME}
            onExit={onExit}
          />

          {/* Center desk area */}
          <div className="flex flex-1 flex-col items-center justify-center gap-6 my-auto">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-amber-400/60">
              <span className="h-px w-8 bg-amber-500/30" />
              Headline Assembly Desk
              <span className="h-px w-8 bg-amber-500/30" />
            </div>

            <Dropzones
              filled={filled}
              activeSlot={activeSlot}
              onDropCard={placeCard}
              onClear={clearSlot}
              onSlotEnter={setActiveSlot}
              onSlotLeave={() => setActiveSlot(null)}
            />

            {/* Broadcast button */}
            <button
              type="button"
              onClick={broadcast}
              disabled={!allFilled || broadcasting}
              className={`group relative inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-black uppercase tracking-[0.2em] transition-all cursor-pointer sm:text-lg ${
                allFilled && !broadcasting
                  ? "scale-100 animate-[pulseGlow_1.4s_ease-in-out_infinite] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105"
                  : "scale-95 cursor-not-allowed bg-amber-950/30 border border-amber-900/30 text-amber-600/40"
              }`}
            >
              <Radio className={`h-5 w-5 ${allFilled && !broadcasting ? "animate-pulse" : ""}`} />
              <span>PUBLISH & BROADCAST</span>
              {allFilled && !broadcasting && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
                </span>
              )}
            </button>
          </div>

          {/* Card deck */}
          <div className="flex flex-col gap-2 pb-2">
            <div className="mx-auto flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-amber-500/60">
              <TrendingUp className="h-3 w-3 text-amber-400" />
              News Flash Word Pool — Drag or Tap to Slot
            </div>
            <CardDeck
              cards={deck}
              usedIds={usedIds}
              shuffling={shuffling}
              onCardClick={handleCardClick}
              onDragStart={() => {}}
            />
          </div>

          {/* ─── AI EVALUATING / JUDGING LOADING SCREEN ─── */}
          {broadcasting && !latestJudgment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
              <div className="relative w-full max-w-md rounded-2xl border-2 border-amber-500/80 bg-[#160d08] p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                {/* Pulsing On-Air Indicator */}
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 border-2 border-amber-400">
                    <Radio className="h-8 w-8 text-amber-400 animate-pulse" />
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/40" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-mono font-bold tracking-widest text-rose-300 mb-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  ON-AIR STUDIO EVALUATION
                </div>

                <h3 className="font-mono text-lg sm:text-xl font-black uppercase tracking-wider text-amber-300 mt-1">
                  AI Producer Is Reviewing...
                </h3>

                <p className="mt-2 text-xs font-mono text-stone-300 italic">
                  Simulating audience outrage, virality potential & lawsuit risk
                </p>

                {/* Animated progress bar */}
                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-stone-900 border border-amber-900/60">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 animate-[loadBar_1.2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          )}

          {/* ─── AI PRODUCER LIVE JUDGMENT POPUP ─── */}
          {latestJudgment && (
            <div
              onClick={dismissJudgment}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-150 cursor-pointer"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-2xl border-2 border-amber-400 bg-[#170e09] p-6 shadow-[0_0_50px_rgba(251,191,36,0.5)] text-center"
              >
                {/* Header Tag */}
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-mono font-bold tracking-widest text-amber-300 mb-2">
                  <Bot className="h-4 w-4 text-amber-400 animate-pulse" />
                  AI STUDIO PRODUCER JUDGMENT
                </div>

                {/* Rating Badge */}
                <div className="my-1">
                  <span className="inline-block rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 font-mono text-sm sm:text-base font-black uppercase tracking-wider text-stone-950 shadow-md">
                    ★ {latestJudgment.rating} ★
                  </span>
                </div>

                {/* Headline */}
                <p className="mt-2 font-serif text-lg sm:text-xl font-black italic text-amber-100 border-y border-amber-900/60 py-2.5">
                  "{latestJudgment.headline}"
                </p>

                {/* Producer Quote */}
                <p className="mt-2.5 text-xs sm:text-sm font-mono text-stone-300 italic bg-black/40 p-2.5 rounded-xl border border-stone-800">
                  💬 Producer: "{latestJudgment.producerQuote}"
                </p>

                {/* Rewards / Heat Grid */}
                <div className="mt-3.5 grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-2.5">
                    <span className="text-emerald-400 font-bold block text-[10px] uppercase">
                      Ad Revenue Payout
                    </span>
                    <span className="text-xl font-black text-emerald-300">
                      +${latestJudgment.payout}
                    </span>
                  </div>
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5">
                    <span className="text-rose-400 font-bold block text-[10px] uppercase">
                      Lawsuit Risk Added
                    </span>
                    <span className="text-xl font-black text-rose-300">
                      +{latestJudgment.heat}%
                    </span>
                  </div>
                </div>

                {/* Fast Dismiss Prompt */}
                <button
                  type="button"
                  onClick={dismissJudgment}
                  className="mt-4 w-full rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 py-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-300 transition cursor-pointer"
                >
                  NEXT HEADLINE → (or tap anywhere)
                </button>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && !latestJudgment && (
            <div
              key={toast.id}
              className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 animate-[toastIn_0.4s_ease-out]"
            >
              <div
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm sm:text-base font-black uppercase tracking-wide shadow-2xl ${
                  toast.kind === "lawsuit"
                    ? "bg-rose-600 text-white shadow-rose-500/40"
                    : toast.kind === "stale"
                      ? "bg-slate-700 text-white shadow-black/40"
                      : "bg-emerald-500 text-white shadow-emerald-500/40"
                }`}
              >
                {toast.kind === "lawsuit" ? (
                  <Gavel className="h-5 w-5" />
                ) : toast.kind === "stale" ? (
                  <Radio className="h-5 w-5" />
                ) : (
                  <TrendingUp className="h-5 w-5" />
                )}
                {toast.text}
              </div>
            </div>
          )}

          {/* ─── GAME OVER MODAL (NEGATIVE REVENUE / BANKRUPTCY) ─── */}
          {gameOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="relative w-full max-w-md rounded-2xl border-2 border-rose-600/80 bg-[#140b07] p-6 text-center shadow-[0_0_50px_rgba(225,29,72,0.5)]">
                {/* Warning stamp */}
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-500">
                  <Gavel className="h-8 w-8" />
                </div>

                <h2 className="font-mono text-2xl sm:text-3xl font-black uppercase tracking-widest text-rose-500 drop-shadow-md">
                  BANKRUPT & FIRED
                </h2>
                <p className="mt-2 text-xs sm:text-sm font-mono text-stone-300 leading-relaxed">
                  Your revenue dropped below zero due to severe editorial penalties and federal
                  fines. The network board has terminated your contract!
                </p>

                {/* Performance stats */}
                <div className="my-5 rounded-xl border border-amber-900/40 bg-stone-950/60 p-4 font-mono text-xs space-y-2 text-stone-300">
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-stone-400">Final Balance:</span>
                    <span className="font-bold text-rose-400 font-mono">${cash}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-stone-400">Stories Published:</span>
                    <span className="font-bold text-amber-300">{publishedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Status:</span>
                    <span className="font-bold text-rose-500 uppercase">Revoked License</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-black uppercase tracking-wider text-stone-950 shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer font-mono"
                  >
                    TRY AGAIN ($300 Seed)
                  </button>
                  {onExit && (
                    <button
                      type="button"
                      onClick={onExit}
                      className="w-full sm:w-auto rounded-xl border border-stone-700 bg-stone-900 px-5 py-3 text-sm font-bold uppercase tracking-wider text-stone-300 hover:bg-stone-800 hover:text-white transition-all cursor-pointer font-mono"
                    >
                      EXIT TO GIGS
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <style>{`
            @keyframes pulseGlow {
              0%, 100% { box-shadow: 0 0 22px rgba(244,63,94,0.5), 0 0 40px rgba(217,70,239,0.35); }
              50% { box-shadow: 0 0 34px rgba(244,63,94,0.85), 0 0 60px rgba(217,70,239,0.6); }
            }
            @keyframes loadBar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
            @keyframes toastIn {
              from { opacity: 0; transform: translate(-50%, -14px) scale(0.9); }
              to { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </main>
  );
}
