import { useState, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Constituency {
  id: number;
  name: string;
  approval: number; // 0–100
  lost: boolean;
}

interface Choice {
  label: string;
  // array of [constituencyId, delta] tuples
  effects: [number, number][];
}

interface CrisisEvent {
  id: number;
  headline: string;
  narrative: string;
  choices: Choice[];
}

interface PoliticianGameProps {
  onComplete: () => void;
  debt?: number;
}

// ─────────────────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────────────────
const CONSTITUENCY_NAMES = [
  "Tech Park",
  "Slum Colony",
  "Industrial Zone",
  "University Campus",
  "Media Center",
  "Farmers' Belt",
  "Business District",
  "Old City Quarter",
  "Border Township",
  "Server Valley",
];

const CRISIS_EVENTS: CrisisEvent[] = [
  {
    id: 1,
    headline: "Automated AI Policy Generator passes a bill banning human politicians.",
    narrative:
      "A rogue GPT-fueled parliament drafting tool has auto-enacted 'HB-0001: Elimination of Biological Legislators.' The national press is asking BAP for a response. Every second of silence costs votes.",
    choices: [
      {
        label: "A) Publicly endorse the bill — 'AI deserves representation too!'",
        effects: [[0, +10], [5, -15], [9, +8], [2, -12]],
      },
      {
        label: "B) Condemn the bill — 'Humans must hold power!'",
        effects: [[1, +12], [2, +8], [0, -10], [6, -5]],
      },
      {
        label: "C) Blame the opposing party and deflect with a meme campaign.",
        effects: [[3, +15], [4, +10], [7, -8], [8, -6]],
      },
      {
        label: "D) Call for an emergency bipartisan committee (classic stall).",
        effects: [[0, +3], [1, +3], [2, -5], [3, -5]],
      },
    ],
  },
  {
    id: 2,
    headline: "Tech Oligarchs offer BAP campaign funding if you replace human voters with AI bots.",
    narrative:
      "SilverAI Corp has wired $200M into a BAP escrow account with one condition: push legislation replacing human voters with 'verified preference optimization agents.' The wire transfer receipt is already leaking on social media.",
    choices: [
      {
        label: "A) Accept the money. 'Democracy is inefficient anyway.'",
        effects: [[0, +20], [9, +15], [1, -20], [5, -18]],
      },
      {
        label: "B) Reject and expose the offer publicly — moral high ground.",
        effects: [[1, +18], [5, +12], [7, +8], [0, -15]],
      },
      {
        label: "C) Secretly accept but deny it — classic political move.",
        effects: [[6, +10], [0, +5], [4, -18], [7, -15]],
      },
      {
        label: "D) Negotiate: accept half the money and promise nothing.",
        effects: [[6, +8], [9, +6], [1, -8], [5, -10]],
      },
    ],
  },
  {
    id: 3,
    headline: "Factory workers in Industrial Zone strike against AI-automated assembly lines.",
    narrative:
      "Ten thousand workers walked off the job when RoboAssemble-7 replaced their entire shift in 48 hours. They are marching toward BAP headquarters. Camera drones are live-streaming. The auto-picket signs are weirdly well-designed.",
    choices: [
      {
        label: "A) Side with workers — promise to roll back automation.",
        effects: [[2, +20], [1, +15], [0, -15], [9, -12]],
      },
      {
        label: "B) Side with corporations — 'Progress cannot be halted.'",
        effects: [[6, +15], [0, +10], [2, -20], [1, -15]],
      },
      {
        label: "C) Offer 'retraining programs' (vague promises, no budget).",
        effects: [[2, +8], [1, +5], [6, -5], [0, -3]],
      },
      {
        label: "D) Send an AI chatbot spokesperson to address the crowd.",
        effects: [[9, +12], [0, +5], [2, -18], [4, -10]],
      },
    ],
  },
  {
    id: 4,
    headline: "Opposing party releases a deepfake claiming the BAP candidate is secretly an unaligned LLM.",
    narrative:
      "A viral deepfake video showing your candidate answering constituent questions using clearly hallucinated facts has been viewed 40 million times. The face is yours. The voice is yours. The 'facts' are absolutely not. A probe is being called for.",
    choices: [
      {
        label: "A) Demand a live Turing test on national television.",
        effects: [[3, +18], [4, +15], [8, +10], [6, -8]],
      },
      {
        label: "B) Accuse the deepfake of being made by an AI — irony acknowledged.",
        effects: [[4, +12], [7, +10], [0, -8], [9, -6]],
      },
      {
        label: "C) Refuse to comment and let the news cycle burn out.",
        effects: [[6, +5], [0, -12], [1, -10], [3, -8]],
      },
      {
        label: "D) Release a counter-deepfake of the opposition leader.",
        effects: [[4, +10], [7, +8], [8, -15], [5, -12]],
      },
    ],
  },
  {
    id: 5,
    headline: "Slum Colony water supply accidentally rerouted into server cooling tanks.",
    narrative:
      "The District 2 municipal AI mis-filed a water routing permit. Slum Colony residents have had no water for 72 hours. Meanwhile, data centers are running at peak efficiency. Engineers are calling it 'an unfortunate priority conflict.' Residents are calling it something less polite.",
    choices: [
      {
        label: "A) Personally appear and fix it — literally turn the valve.",
        effects: [[1, +25], [7, +10], [9, -10], [0, -5]],
      },
      {
        label: "B) Blame the previous government and issue a report.",
        effects: [[6, +8], [0, +5], [1, -15], [5, -10]],
      },
      {
        label: "C) Compensate residents with digital water credits (NFTs).",
        effects: [[9, +10], [3, +5], [1, -20], [5, -15]],
      },
      {
        label: "D) Nationalize the data centers — use water for people first.",
        effects: [[1, +20], [2, +12], [0, -18], [9, -20]],
      },
    ],
  },
  {
    id: 6,
    headline: "University Campus demands mandatory human-only coding jobs.",
    narrative:
      "Final-year CS students are camping outside the Ministry of Employment. Their banner reads: 'WE CODED THIS BANNER OURSELVES.' They are demanding legislation capping the percentage of software written by AI systems. Every major tech firm has issued a strongly-worded statement against it.",
    choices: [
      {
        label: "A) Back the mandate — '30% human code minimum by law.'",
        effects: [[3, +22], [2, +15], [0, -15], [9, -18]],
      },
      {
        label: "B) Propose a tax incentive for companies hiring human coders.",
        effects: [[3, +12], [6, +8], [9, -8], [0, -5]],
      },
      {
        label: "C) Ignore it and let the market decide.",
        effects: [[0, +10], [9, +8], [3, -18], [1, -12]],
      },
      {
        label: "D) Offer to make the students unpaid 'AI supervisors.'",
        effects: [[6, +8], [0, +5], [3, -10], [1, -8]],
      },
    ],
  },
  {
    id: 7,
    headline: "Media Center invites you to a live debate against Auto-Politician v9.0.",
    narrative:
      "Auto-Politician v9.0 speaks at 4000 words per minute, cites every historical precedent in real time, never sweats, never blinks, and generates applause-optimized rhetoric on the fly. You have been invited to debate it. On live television. Tonight.",
    choices: [
      {
        label: "A) Accept and debate it — show that humans have something AI doesn't.",
        effects: [[4, +20], [3, +15], [7, +12], [9, -10]],
      },
      {
        label: "B) Refuse and call it 'unfair against biological candidates.'",
        effects: [[1, +10], [5, +8], [4, -15], [3, -12]],
      },
      {
        label: "C) Agree but hire a debate coach who is secretly also an AI.",
        effects: [[0, +12], [4, +8], [7, -10], [8, -15]],
      },
      {
        label: "D) Show up and just recite a poem. Confuse everyone.",
        effects: [[3, +5], [4, +5], [6, -5], [0, -5]],
      },
    ],
  },
  {
    id: 8,
    headline: "Final Rally: AI exit polls predict BAP will lose by 99%.",
    narrative:
      "Every AI prediction model agrees: BAP is done. The exit polls were generated before the polls even opened. Voters are reading the results on their phones *at the polling booth*. Your campaign war room has gone completely silent. This is the final event. Make it count.",
    choices: [
      {
        label: "A) Hold a midnight rally and make the most impassioned human speech ever.",
        effects: [[1, +25], [5, +20], [7, +18], [8, +15]],
      },
      {
        label: "B) Call out the AI polling as rigged. Conspiracy play.",
        effects: [[8, +18], [7, +10], [0, -10], [3, -8]],
      },
      {
        label: "C) Offer free food at all polling booths. Shameless but effective.",
        effects: [[1, +20], [2, +15], [5, +12], [6, -5]],
      },
      {
        label: "D) Accept defeat gracefully... then win anyway on write-in votes.",
        effects: [[4, +15], [3, +12], [8, +10], [0, -15]],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildInitialConstituencies(): Constituency[] {
  return CONSTITUENCY_NAMES.map((name, i) => ({
    id: i,
    name,
    approval: randomBetween(55, 75),
    lost: false,
  }));
}

function clamp(val: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────
function ConstituencyCard({ c }: { c: Constituency }) {
  const isLost = c.lost;
  const isBattle = !isLost && c.approval > 50 && c.approval < 70;
  const isSafe = !isLost && c.approval >= 70;

  const container = isLost
    ? "bg-rose-950 border-rose-600 text-rose-100"
    : isBattle
    ? "bg-amber-950 border-amber-500 text-amber-100"
    : "bg-emerald-950 border-emerald-500 text-emerald-100";

  const tag = isLost
    ? "LOST TO OPPOSITION ❌"
    : isBattle
    ? "BATTLEGROUND"
    : "SAFE STRONGHOLD";

  const tagColor = isLost
    ? "bg-rose-800 text-rose-100"
    : isBattle
    ? "bg-amber-700 text-amber-100"
    : "bg-emerald-700 text-emerald-100";

  const barColor = isLost
    ? "bg-rose-500"
    : isBattle
    ? "bg-amber-400"
    : "bg-emerald-400";

  return (
    <div
      className={`relative rounded-lg border-2 p-3 shadow-md transition-all duration-500 ${container}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-[11px] font-bold uppercase tracking-widest opacity-70">
            District {c.id + 1}
          </p>
          <p className="font-serif text-sm font-semibold leading-tight">
            {c.name}
          </p>
        </div>
        <span className="font-mono text-2xl font-black tabular-nums">
          {c.approval}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-black/30">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${c.approval}%` }}
        />
      </div>

      <span
        className={`mt-2 inline-block rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${tagColor}`}
      >
        [{tag}]
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export function PoliticianGame({ onComplete, debt = 50000 }: PoliticianGameProps) {
  const [constituencies, setConstituencies] = useState<Constituency[]>(
    () => buildInitialConstituencies()
  );
  const [eventIndex, setEventIndex] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "lost" | "won">("playing");
  const [lastEffects, setLastEffects] = useState<[number, number][] | null>(null);
  const [choiceChosen, setChoiceChosen] = useState(false);

  const lostCount = constituencies.filter((c) => c.lost).length;
  const currentEvent = CRISIS_EVENTS[eventIndex] ?? null;

  // Evaluate win/loss whenever constituencies change
  useEffect(() => {
    if (gameState !== "playing") return;
    const lost = constituencies.filter((c) => c.lost).length;
    if (lost >= 6) {
      setGameState("lost");
    }
  }, [constituencies, gameState]);

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (choiceChosen || gameState !== "playing") return;
      setChoiceChosen(true);
      setLastEffects(choice.effects);

      setConstituencies((prev) =>
        prev.map((c) => {
          const effect = choice.effects.find(([id]) => id === c.id);
          if (!effect) return c;
          const newApproval = clamp(c.approval + effect[1]);
          return {
            ...c,
            approval: newApproval,
            lost: newApproval <= 50,
          };
        })
      );

      // Advance event after brief delay for visual feedback
      setTimeout(() => {
        const nextIndex = eventIndex + 1;
        if (nextIndex >= CRISIS_EVENTS.length) {
          // Check won/lost after final event is applied
          setConstituencies((prev) => {
            const finalLost = prev.filter((c) => c.lost).length;
            if (finalLost < 6) {
              setGameState("won");
            } else {
              setGameState("lost");
            }
            return prev;
          });
        } else {
          setEventIndex(nextIndex);
        }
        setChoiceChosen(false);
        setLastEffects(null);
      }, 800);
    },
    [choiceChosen, eventIndex, gameState]
  );

  const handleRetry = useCallback(() => {
    setConstituencies(buildInitialConstituencies());
    setEventIndex(0);
    setGameState("playing");
    setLastEffects(null);
    setChoiceChosen(false);
  }, []);

  // ─── MODAL OVERLAYS ───
  const renderOverlay = () => {
    if (gameState === "lost") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl border-4 border-red-700 bg-rose-950 p-8 text-center shadow-[0_0_60px_-5px_rgba(239,68,68,0.7)]">
            <p className="font-mono text-xs tracking-[0.3em] text-red-400 uppercase">
              Election Result — Final
            </p>
            <h2 className="mt-3 font-serif text-3xl font-black text-red-100 uppercase tracking-widest">
              ELECTION LOST
            </h2>
            <p className="mt-1 font-mono text-sm text-red-300 font-bold tracking-widest uppercase">
              OUSTED FROM BAP
            </p>
            <p className="mt-4 text-sm text-red-200 leading-relaxed">
              {lostCount} of 10 constituencies fell to the opposition. The
              Automated Policy Generator has taken your seat. History will not
              remember you fondly.
            </p>
            <button
              onClick={handleRetry}
              className="mt-6 w-full rounded-lg border-2 border-red-500 bg-red-800 px-6 py-3 font-mono font-black uppercase tracking-widest text-red-100 transition hover:bg-red-700 active:scale-95 cursor-pointer"
            >
              Retry Campaign
            </button>
          </div>
        </div>
      );
    }

    if (gameState === "won") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl border-4 border-emerald-500 bg-emerald-950 p-8 text-center shadow-[0_0_60px_-5px_rgba(52,211,153,0.5)]">
            <p className="font-mono text-xs tracking-[0.3em] text-emerald-400 uppercase">
              Election Result — Final
            </p>
            <h2 className="mt-3 font-serif text-3xl font-black text-emerald-100 uppercase tracking-widest">
              VICTORY
            </h2>
            <p className="mt-1 font-mono text-sm text-emerald-300 font-bold tracking-widest uppercase">
              ELECTED TO POWER
            </p>
            <p className="mt-4 text-sm text-emerald-200 leading-relaxed">
              BAP holds {10 - lostCount} of 10 constituencies. You outmaneuvered
              the Automated Policy Generator. For now. The robot will be back
              with version 10.0.
            </p>
            <button
              onClick={onComplete}
              className="mt-6 w-full rounded-lg border-2 border-emerald-500 bg-emerald-800 px-6 py-3 font-mono font-black uppercase tracking-widest text-emerald-100 transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
            >
              Return to Career Board
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ─── MAIN RENDER ───
  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-stone-950 text-stone-200 font-serif selection:bg-amber-400 selection:text-black">
      {/* Subtle scan-line texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ─── PAGE HEADER ─── */}
        <div className="mb-8 flex flex-col gap-4 border-b-2 border-stone-700 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 inline-block rounded border border-stone-600 bg-stone-800 px-3 py-0.5 font-mono text-[10px] tracking-[0.4em] text-stone-400 uppercase">
              ⬛ CLASSIFIED — CAMPAIGN WAR ROOM
            </div>
            <h1 className="font-serif text-2xl font-black uppercase tracking-widest text-stone-100 sm:text-3xl">
              BAP Campaign Headquarters
            </h1>
            <p className="mt-1 max-w-lg font-mono text-xs leading-relaxed text-stone-400">
              Bichara Admi Party (BAP) — Automated policy generators created an
              electoral dead-end. Step in to gain power!
            </p>
          </div>

          {/* Debt badge */}
          <div className="shrink-0">
            <div className="rounded border-2 border-red-600 bg-red-950 px-4 py-2 text-center shadow-lg">
              <p className="font-mono text-[10px] tracking-widest text-red-400 uppercase">
                Campaign Deficit
              </p>
              <p className="font-mono text-xl font-black tracking-widest text-red-100 uppercase">
                DEBT: ${debt.toLocaleString()}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-stone-400">
              <span>Lost Districts:</span>
              <span
                className={`font-bold ${
                  lostCount >= 4 ? "text-red-400" : "text-stone-200"
                }`}
              >
                {lostCount}/10
              </span>
              <span className="text-stone-600">|</span>
              <span>
                Event:{" "}
                <span className="text-amber-300 font-bold">
                  {Math.min(eventIndex + 1, 8)}/8
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ─── MAIN 2-COLUMN LAYOUT ─── */}
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* ─── LEFT: CONSTITUENCY MAP ─── */}
          <div className="w-full lg:max-w-sm xl:max-w-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-stone-700" />
              <h2 className="font-mono text-xs tracking-[0.3em] text-stone-400 uppercase whitespace-nowrap">
                🗺 Electoral Map
              </h2>
              <div className="h-px flex-1 bg-stone-700" />
            </div>

            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />Stronghold ≥70%</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400 inline-block" />Battleground 51–69%</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500 inline-block" />Lost ≤50%</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {constituencies.map((c) => (
                <ConstituencyCard key={c.id} c={c} />
              ))}
            </div>
          </div>

          {/* ─── RIGHT: STRATEGY DESK ─── */}
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-stone-700" />
              <h2 className="font-mono text-xs tracking-[0.3em] text-stone-400 uppercase whitespace-nowrap">
                📋 Strategy Desk
              </h2>
              <div className="h-px flex-1 bg-stone-700" />
            </div>

            {currentEvent && gameState === "playing" ? (
              <div className="rounded-xl border-4 border-stone-700 bg-stone-900 p-6 shadow-2xl">
                {/* Event Counter */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-block rounded bg-amber-900/60 px-3 py-1 font-mono text-xs font-bold tracking-widest text-amber-300 uppercase">
                    Crisis Event {eventIndex + 1} of {CRISIS_EVENTS.length}
                  </span>
                  <div className="flex gap-1.5">
                    {CRISIS_EVENTS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-5 rounded-sm transition-colors ${
                          i < eventIndex
                            ? "bg-stone-600"
                            : i === eventIndex
                            ? "bg-amber-400"
                            : "bg-stone-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Headline */}
                <div className="mb-4 rounded-lg border border-stone-700 bg-stone-950 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-red-400 mb-1">
                    🔴 BREAKING — CAMPAIGN CRISIS
                  </p>
                  <h3 className="font-serif text-base font-bold leading-snug text-stone-100 sm:text-lg">
                    {currentEvent.headline}
                  </h3>
                </div>

                {/* Narrative */}
                <p className="mb-5 text-sm leading-relaxed text-stone-400 italic border-l-2 border-stone-700 pl-3">
                  {currentEvent.narrative}
                </p>

                {/* Effect preview if choice just made */}
                {lastEffects && (
                  <div className="mb-4 rounded bg-stone-800/70 px-3 py-2 font-mono text-xs text-stone-300">
                    <span className="text-amber-400 font-bold">POLICY IMPACT: </span>
                    {lastEffects.map(([id, delta]) => (
                      <span key={id} className="mr-3">
                        D{id + 1}{" "}
                        <span className={delta > 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                          {delta > 0 ? `+${delta}` : delta}%
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Choice Buttons */}
                <div className="space-y-2">
                  {currentEvent.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleChoice(choice)}
                      disabled={choiceChosen}
                      className={`w-full rounded border border-stone-600 bg-stone-800 p-4 text-left font-mono text-xs uppercase tracking-wide shadow-sm transition active:scale-95 cursor-pointer ${
                        choiceChosen
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-stone-700 hover:border-amber-600 hover:text-amber-200"
                      }`}
                    >
                      <span className="font-black text-amber-400 mr-2">
                        {choice.label.slice(0, 2)}
                      </span>
                      {choice.label.slice(2)}
                    </button>
                  ))}
                </div>

                {/* Bottom status strip */}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-stone-800 pt-4 font-mono text-[11px] text-stone-500">
                  <span>🏛 BAP Constituencies: <strong className={lostCount > 0 ? "text-red-400" : "text-emerald-400"}>{10 - lostCount}/10 Held</strong></span>
                  <span className="text-stone-700">|</span>
                  <span>Majority needed: <strong className="text-stone-300">5+</strong></span>
                  {lostCount >= 4 && (
                    <span className="text-red-400 font-bold animate-pulse">
                      ⚠ CRITICAL — ONE MORE LOSS ENDS CAMPAIGN
                    </span>
                  )}
                </div>
              </div>
            ) : gameState === "playing" ? (
              <div className="rounded-xl border-4 border-stone-700 bg-stone-900 p-6 text-center text-stone-400 font-mono text-sm">
                Tallying results...
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {renderOverlay()}
    </div>
  );
}

export default PoliticianGame;
