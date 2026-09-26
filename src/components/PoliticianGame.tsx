import { useState, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
export type DistrictId =
  | "tech_park"
  | "slum_colony"
  | "industrial_zone"
  | "old_town_bazaar"
  | "university_campus"
  | "media_center"
  | "financial_core"
  | "suburban_belt"
  | "rural_belt"
  | "port_city";

export interface Constituency {
  id: DistrictId;
  name: string;
  pinColor: string;
  rotation: string;
  approval: number; // 0–100
  lost: boolean; // Marked as lost when <= 50, flips back to false if boosted to >= 51
  recentlyReclaimed?: boolean;
}

export type DistrictDeltas = Partial<Record<DistrictId, number>> & {
  all?: number;
};

export interface Choice {
  title: string;
  action: string;
  impacts: DistrictDeltas;
  flavor: string;
  isIgnore?: boolean;
}

export interface CrisisEvent {
  id: number;
  title: string;
  scenario: string;
  notes: string;
  choices: Choice[];
}

export interface PoliticianGameProps {
  onComplete: () => void;
  debt?: number;
}

// ─────────────────────────────────────────────────────────
// 10 Named Districts with Corkboard Sticky-Note Pins & Tilts
// ─────────────────────────────────────────────────────────
const DISTRICT_LIST: {
  id: DistrictId;
  name: string;
  pinColor: string;
  rotation: string;
}[] = [
  { id: "tech_park", name: "Tech Park", pinColor: "bg-cyan-500", rotation: "-rotate-1" },
  { id: "slum_colony", name: "Slum Colony", pinColor: "bg-amber-500", rotation: "rotate-1" },
  {
    id: "industrial_zone",
    name: "Industrial Zone",
    pinColor: "bg-orange-500",
    rotation: "-rotate-2",
  },
  {
    id: "old_town_bazaar",
    name: "Old Town Bazaar",
    pinColor: "bg-emerald-500",
    rotation: "rotate-2",
  },
  {
    id: "university_campus",
    name: "University Campus",
    pinColor: "bg-blue-500",
    rotation: "-rotate-1",
  },
  { id: "media_center", name: "Media Center", pinColor: "bg-purple-500", rotation: "rotate-1" },
  {
    id: "financial_core",
    name: "Financial Core",
    pinColor: "bg-yellow-500",
    rotation: "-rotate-2",
  },
  { id: "suburban_belt", name: "Suburban Belt", pinColor: "bg-teal-500", rotation: "rotate-1" },
  { id: "rural_belt", name: "Rural Belt", pinColor: "bg-lime-500", rotation: "-rotate-1" },
  { id: "port_city", name: "Port City", pinColor: "bg-sky-500", rotation: "rotate-2" },
];

// ─────────────────────────────────────────────────────────
// 10 Direct, High-Stakes Crisis Scenarios & Choices
// ─────────────────────────────────────────────────────────
const CRISIS_EVENTS: CrisisEvent[] = [
  {
    id: 1,
    title: "Famine in the Rural Region",
    scenario:
      "Crops have failed in the Rural Belt after weeks of drought. Food silos are depleted, and local councils are demanding emergency grain shipments from central municipal stores.",
    notes:
      "Sticky Note: 'If rural votes drop below 50%, opposition will seize the entire eastern agricultural bloc!'",
    choices: [
      {
        title: "Choice A",
        action: "Transfer strategic emergency grain reserves from Tech Park & Financial Core",
        impacts: { rural_belt: +25, tech_park: -20, financial_core: -20 },
        flavor: "+25% Rural Belt, -20% Tech Park & Financial Core",
      },
      {
        title: "Choice B",
        action: "Subsidize local farmers with emergency cash vouchers and agrarian debt relief",
        impacts: { rural_belt: +20, old_town_bazaar: +10, financial_core: -25 },
        flavor: "+20% Rural Belt, +10% Old Town Bazaar, -25% Financial Core",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the famine entirely — 'Market forces will eventually correct food supplies'",
        impacts: { rural_belt: -40 },
        flavor: "⚠️ -40% Rural Belt (Massive penalty on Rural Belt, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 2,
    title: "Stadium Inauguration Clash",
    scenario:
      "The new multi-million dollar mega-stadium is ready, but private contractors halted ribbon-cutting, demanding immediate municipal emergency funding for cost overruns.",
    notes:
      "Sticky Note: 'Suburbs love the stadium; the slums are furious about vanity expenditures.'",
    choices: [
      {
        title: "Choice A",
        action: "Impose an emergency flat surtax across all municipal districts",
        impacts: { all: -12, suburban_belt: +20 },
        flavor: "-12% to all districts, +20% Suburban Belt",
      },
      {
        title: "Choice B",
        action: "Levy the stadium deficit directly on Financial Core & Tech Park",
        impacts: {
          slum_colony: +20,
          industrial_zone: +20,
          financial_core: -25,
          tech_park: -25,
        },
        flavor: "+20% Slum Colony & Industrial Zone, -25% Financial Core & Tech Park",
      },
      {
        title: "Choice C (Ignore)",
        action: "Ignore the contractors and boycott the ribbon-cutting ceremony completely",
        impacts: { suburban_belt: -40 },
        flavor:
          "⚠️ -40% Suburban Belt (Massive penalty on Suburban Belt, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 3,
    title: "Factory Strike & Grid Shutdown",
    scenario:
      "Industrial Zone union leaders pulled master switches on city power substations, protesting autonomous assembly machines. Brownouts are spreading toward the hospitals.",
    notes:
      "Sticky Note: 'Tech Park needs that juice, but factory floor workers have locked the gates.'",
    choices: [
      {
        title: "Choice A",
        action: "Cave to workers: Enforce strict automation caps and hike baseline wages",
        impacts: { industrial_zone: +25, slum_colony: +20, tech_park: -30 },
        flavor: "+25% Industrial Zone, +20% Slum Colony, -30% Tech Park",
      },
      {
        title: "Choice B",
        action:
          "Deploy municipal riot squads to forcibly clear power substations and restore the grid",
        impacts: { industrial_zone: -30, slum_colony: -20, financial_core: +20 },
        flavor: "-30% Industrial Zone, -20% Slum Colony, +20% Financial Core",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the strike and shut your campaign phone off — 'Labor disputes are private business'",
        impacts: { industrial_zone: -40 },
        flavor:
          "⚠️ -40% Industrial Zone (Massive penalty on Industrial Zone, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 4,
    title: "University Campus Riot",
    scenario:
      "Thousands of CS and engineering students are barricading the university quad, demanding immediate student debt cancellation, subsidized transit, and human-only developer quotas.",
    notes: "Coffee Stain: 'Hey, that was our CS department yesterday. Don't sell us out!'",
    choices: [
      {
        title: "Choice A",
        action: "Grant emergency student debt stipends from city contingency reserves",
        impacts: {
          university_campus: +25,
          financial_core: -20,
          suburban_belt: -20,
        },
        flavor: "+25% University Campus, -20% Financial Core & Suburban Belt",
      },
      {
        title: "Choice B",
        action: "Authorize campus security crackdowns, revoke student charters, and issue fines",
        impacts: { university_campus: -30, suburban_belt: +15, financial_core: +10 },
        flavor: "-30% University Campus, +15% Suburban Belt, +10% Financial Core",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the student occupation entirely — refuse to visit the campus or issue any statement",
        impacts: { university_campus: -40 },
        flavor:
          "⚠️ -40% University Campus (Massive penalty on University Campus, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 5,
    title: "Port City Smuggling Scandal",
    scenario:
      "Whistleblowers leaked customs manifests showing hundreds of unmanifested shipping containers filled with contraband AI chips and untaxed high-grade GPUs moving through Port City docks.",
    notes:
      "Sticky Note: 'Port workers are threatening wildcat strikes, and the press corps has set up live satellite trucks at pier 9.'",
    choices: [
      {
        title: "Choice A",
        action: "Throw the Port Authority director under the bus on live prime-time television",
        impacts: { media_center: +25, old_town_bazaar: +20, port_city: -25 },
        flavor: "+25% Media Center, +20% Old Town Bazaar, -25% Port City",
      },
      {
        title: "Choice B",
        action:
          "Quietly strike a tariff compromise with the port shipping guilds to collect back-taxes",
        impacts: { port_city: +20, financial_core: +15, media_center: -25 },
        flavor: "+20% Port City, +15% Financial Core, -25% Media Center",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the leaked smuggling manifests and decline all investigative press inquiries",
        impacts: { port_city: -40 },
        flavor: "⚠️ -40% Port City (Massive penalty on Port City, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 6,
    title: "Rural Belt UFO Sighting Panic",
    scenario:
      "Strange bioluminescent crafts and electromagnetic crop circles materialized above Rural Belt grain silos. Panicked farming families are barricading roads with tractors, demanding protection from alien swarms.",
    notes:
      "Sticky Note: 'Tech Park researchers swear it is experimental drone pollination, but the farmers are shooting at the sky!'",
    choices: [
      {
        title: "Choice A",
        action:
          "Legitimize the panic: Declare a Rural Aerial Zone and grant emergency defense subsidies to farmers",
        impacts: { rural_belt: +25, old_town_bazaar: +15, tech_park: -25 },
        flavor: "+25% Rural Belt, +15% Old Town Bazaar, -25% Tech Park",
      },
      {
        title: "Choice B",
        action:
          "Debunk the hysteria on national broadcast: Expose classified Tech Park drone calibration trials",
        impacts: { tech_park: +20, financial_core: +15, rural_belt: -30 },
        flavor: "+20% Tech Park, +15% Financial Core, -30% Rural Belt",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the UFO panic completely — 'The campaign will not dignify sci-fi rumors with an official response'",
        impacts: { rural_belt: -40 },
        flavor:
          "⚠️ -40% Rural Belt (Massive panic penalty on Rural Belt, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 7,
    title: "The Great Animal Uprising",
    scenario:
      "A containment breach at the University Campus bio-engineering labs released hundreds of genetically augmented, hyper-intelligent raccoons and stray canines. They have captured Old Town Bazaar and are overturning market stalls.",
    notes:
      "Sticky Note: 'Animal control refused to enter after the raccoons successfully lockpicked two patrol cruisers!'",
    choices: [
      {
        title: "Choice A",
        action:
          "Broker a treaty: Designate a protected urban wildlife sanctuary and fund municipal feeding kiosks",
        impacts: { university_campus: +25, old_town_bazaar: +20, suburban_belt: -25 },
        flavor: "+25% University Campus, +20% Old Town Bazaar, -25% Suburban Belt",
      },
      {
        title: "Choice B",
        action:
          "Deploy automated cybernetic capture drones from Tech Park to reclaim the market stalls by force",
        impacts: {
          tech_park: +20,
          suburban_belt: +20,
          old_town_bazaar: -25,
          university_campus: -25,
        },
        flavor: "+20% Tech Park & Suburban Belt, -25% Old Town Bazaar & University Campus",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the animal uprising — 'Nature will re-establish ecological equilibrium in the bazaar on its own'",
        impacts: { old_town_bazaar: -45 },
        flavor:
          "⚠️ -45% Old Town Bazaar (Devastating market chaos penalty on Old Town, 0% to others)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 8,
    title: "Slum Colony Clean Water Crisis",
    scenario:
      "Corroded municipal water mains burst in Slum Colony, mixing toxic factory runoff into the neighborhood wells. Panic is spreading with water trucks running dry.",
    notes:
      "Sticky Note: 'Suburban lawns are watered 3x a day while children here have yellow tap water.'",
    choices: [
      {
        title: "Choice A",
        action: "Reroute pressurized drinking lines away from Suburban Belt into Slum Colony",
        impacts: { slum_colony: +25, suburban_belt: -25 },
        flavor: "+25% Slum Colony, -25% Suburban Belt",
      },
      {
        title: "Choice B",
        action:
          "Deploy emergency water delivery tankers and install mobile chlorine filtration kiosks",
        impacts: { slum_colony: +20, financial_core: -20, industrial_zone: -10 },
        flavor: "+20% Slum Colony, -20% Financial Core, -10% Industrial Zone",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the broken water pipes — dismiss the crisis as neighborhood hysteria and fake news",
        impacts: { slum_colony: -45 },
        flavor:
          "⚠️ -45% Slum Colony (Devastating penalty on Slum Colony, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 9,
    title: "Media Center Deepfake Leak",
    scenario:
      "A deepfake video of you caught on tape mocking traditional working-class voters went viral on social media. 40 million views overnight and polling lines are wavering.",
    notes: "Sticky Note: 'Broadcast hosts are demanding an emergency statement within 10 minutes.'",
    choices: [
      {
        title: "Choice A",
        action: "Pay Media Center newsroom syndicates massive ad buyouts to bury the video",
        impacts: { media_center: +20, financial_core: -25 },
        flavor: "+20% Media Center, -25% Financial Core (hush money)",
      },
      {
        title: "Choice B",
        action:
          "Release an unfiltered, aggressive rebuttal video calling out the deepfake creators",
        impacts: {
          university_campus: +25,
          tech_park: +20,
          rural_belt: -30,
          suburban_belt: -30,
        },
        flavor: "+25% University & +20% Tech Park, -30% Rural Belt & Suburban Belt",
      },
      {
        title: "Choice C (Ignore)",
        action: "Ignore the viral deepfake completely — maintain total radio silence and stay home",
        impacts: { media_center: -40 },
        flavor:
          "⚠️ -40% Media Center (Massive penalty on Media Center, 0% impact to other districts)",
        isIgnore: true,
      },
    ],
  },
  {
    id: 10,
    title: "Final Election Eve Blackout",
    scenario:
      "Hours before ballots open tomorrow morning, an overloaded transformer station collapsed, plunging half the metropolitan districts into total darkness.",
    notes: "Sticky Note: 'This is the final turn. Whoever has power votes tomorrow morning.'",
    choices: [
      {
        title: "Choice A",
        action:
          "Prioritize power restoration strictly to Suburban residential wards and Financial towers",
        impacts: {
          financial_core: +20,
          suburban_belt: +20,
          slum_colony: -30,
          industrial_zone: -30,
        },
        flavor: "+20% Financial Core & Suburban Belt, -30% Slum Colony & Industrial Zone",
      },
      {
        title: "Choice B",
        action: "Direct military emergency generators into the dense slums and rural outskirts",
        impacts: { slum_colony: +25, rural_belt: +25, tech_park: -25 },
        flavor: "+25% Slum Colony & Rural Belt, -25% Tech Park",
      },
      {
        title: "Choice C (Ignore)",
        action:
          "Ignore the blackout and sleep through election eve by candlelight — 'The grid will reset itself'",
        impacts: { slum_colony: -40, industrial_zone: -40 },
        flavor:
          "⚠️ -40% Slum Colony & -40% Industrial Zone (Massive blackout penalty, 0% to others)",
        isIgnore: true,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Randomizes the crisis event pool on each game start / restart
function shuffleCrisisEvents(): CrisisEvent[] {
  const arr = [...CRISIS_EVENTS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Balance: tighter, volatile starting approvals between 48% and 62%
function buildInitialDistricts(): Constituency[] {
  return DISTRICT_LIST.map((d) => {
    const initialApproval = randomBetween(48, 62);
    return {
      id: d.id,
      name: d.name,
      pinColor: d.pinColor,
      rotation: d.rotation,
      approval: initialApproval,
      lost: initialApproval <= 50,
      recentlyReclaimed: false,
    };
  });
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, val));
}

// ─────────────────────────────────────────────────────────
// PoliticianGame Component
// ─────────────────────────────────────────────────────────
export function PoliticianGame({ onComplete, debt = 50000 }: PoliticianGameProps) {
  const [districts, setDistricts] = useState<Constituency[]>(() => buildInitialDistricts());
  const [events, setEvents] = useState<CrisisEvent[]>(() => shuffleCrisisEvents());
  const [eventIndex, setEventIndex] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "lost" | "won">("playing");
  const [choiceBusy, setChoiceBusy] = useState(false);
  const [lastImpactNotice, setLastImpactNotice] = useState<DistrictDeltas | null>(null);
  const [reclaimedNotice, setReclaimedNotice] = useState<string[] | null>(null);

  // Core Rule: Lost = approval <= 50%
  const lostCount = districts.filter((d) => d.lost).length;
  const currentEvent = events[eventIndex] ?? null;

  // Rule: Strict majority loss (6 or more out of 10)
  useEffect(() => {
    if (gameState !== "playing") return;
    const currentLost = districts.filter((d) => d.lost).length;
    if (currentLost >= 6) {
      setGameState("lost");
    }
  }, [districts, gameState]);

  // Execute choice with reclamation logic
  const handleChoice = useCallback(
    (choice: Choice) => {
      if (choiceBusy || gameState !== "playing") return;
      setChoiceBusy(true);
      setLastImpactNotice(choice.impacts);

      const newlyReclaimed: string[] = [];

      setDistricts((prev) => {
        const next = prev.map((d) => {
          let delta = choice.impacts[d.id] ?? 0;
          if (choice.impacts.all !== undefined) {
            delta += choice.impacts.all;
          }
          if (delta === 0) {
            return { ...d, recentlyReclaimed: false };
          }
          const newApproval = clamp(d.approval + delta);

          // Reclamation Mechanic:
          // If currently LOST (<= 50%) and boosted to 51% or higher,
          // immediately flips back to active (lost: false), subtracting 1 from lost count.
          const isNowLost = newApproval <= 50;
          const wasReclaimed = d.lost && !isNowLost;

          if (wasReclaimed) {
            newlyReclaimed.push(d.name);
          }

          return {
            ...d,
            approval: newApproval,
            lost: isNowLost,
            recentlyReclaimed: wasReclaimed,
          };
        });

        // Check if 6 or more lost immediately
        const newLostCount = next.filter((c) => c.lost).length;
        if (newLostCount >= 6) {
          setGameState("lost");
        }

        return next;
      });

      if (newlyReclaimed.length > 0) {
        setReclaimedNotice(newlyReclaimed);
      } else {
        setReclaimedNotice(null);
      }

      // Smooth transition to next crisis
      setTimeout(() => {
        setChoiceBusy(false);

        const nextIndex = eventIndex + 1;
        if (nextIndex >= events.length) {
          setDistricts((latest) => {
            const finalLostCount = latest.filter((d) => d.lost).length;
            if (finalLostCount < 6) {
              setGameState("won");
            } else {
              setGameState("lost");
            }
            return latest;
          });
        } else {
          setEventIndex(nextIndex);
        }
      }, 750);
    },
    [choiceBusy, eventIndex, events.length, gameState],
  );

  // Restart campaign with freshly randomized crisis event sequence
  const handleRetry = useCallback(() => {
    setDistricts(buildInitialDistricts());
    setEvents(shuffleCrisisEvents());
    setEventIndex(0);
    setGameState("playing");
    setChoiceBusy(false);
    setLastImpactNotice(null);
    setReclaimedNotice(null);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#1b120c] text-amber-100 font-serif antialiased p-4 sm:p-6 lg:p-8 relative selection:bg-amber-800 selection:text-amber-100">
      {/* Warm ambient headquarters lighting effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_20%,rgba(245,158,11,0.12),transparent_60%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_80%,rgba(180,83,9,0.08),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto flex flex-col gap-6">
        {/* ─── BAP HEADQUARTERS HEADER ─── */}
        <header className="border-b-2 border-amber-900/50 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-block border border-amber-500/40 bg-amber-950/70 px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.22em] text-amber-400 uppercase shadow-inner rounded-xs">
                ★ BAP HEADQUARTERS ★
              </span>
              <span className="font-mono text-xs text-amber-400/60 tracking-wider">
                ELECTION CRISIS DESK
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-100 font-serif drop-shadow-sm">
              Bichara Admi Party (BAP) Campaign Desk
            </h1>

            <p className="mt-1 max-w-xl text-xs sm:text-sm text-amber-200/70 font-serif italic leading-relaxed">
              Automated rejections left you with one desperate gig: winning the local election.
              Balance 10 volatile districts before dawn!
            </p>
          </div>

          {/* Right: Lost Counter & Navigation */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-200/80">
              <span>Lost Districts:</span>
              <span
                className={`font-black px-2 py-0.5 rounded text-xs tabular-nums ${
                  lostCount >= 4
                    ? "bg-red-950 border border-red-500 text-red-200 animate-pulse"
                    : "bg-amber-950/80 border border-amber-800/80 text-amber-300"
                }`}
              >
                {lostCount} / 10
              </span>
              <span className="text-amber-700">•</span>
              <span className="text-amber-400 font-medium">
                Crisis {Math.min(eventIndex + 1, events.length)} of {events.length}
              </span>
            </div>

            {onComplete && (
              <button
                onClick={onComplete}
                className="text-xs font-mono text-amber-400/80 hover:text-amber-200 transition-colors underline underline-offset-4 cursor-pointer"
              >
                ← Back to Desktop
              </button>
            )}
          </div>
        </header>

        {/* ─── 35% LEFT / 65% RIGHT LAYOUT ─── */}
        <div className="flex flex-col lg:flex-row gap-7 items-start">
          {/* ─── LEFT SIDEBAR: The Corkboard Map (35% width) ─── */}
          <aside className="w-full lg:w-[35%] shrink-0">
            <div className="rounded-xl border-2 border-amber-800/40 bg-[#241710] p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              {/* Corkboard texture pattern overlay */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#d97706 1px, transparent 1px)`,
                  backgroundSize: "16px 16px",
                }}
              />

              {/* Corkboard Top Bar */}
              <div className="relative mb-3 flex items-center justify-between border-b border-amber-800/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-200">
                    The Corkboard Map
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-amber-400/70">
                  6 Lost = Coalition Collapse
                </span>
              </div>

              {/* Status Legend */}
              <div className="relative mb-3.5 flex items-center justify-between font-mono text-[9px] bg-black/30 p-2 rounded border border-amber-900/50 text-amber-300/80">
                <span className="text-emerald-400 font-semibold">[SAFE] ≥71%</span>
                <span className="text-amber-400 font-semibold">[AT RISK] 51-70%</span>
                <span className="text-rose-400 font-bold">[LOST ❌] ≤50%</span>
              </div>

              {/* Pinned Sticky Notes / Index Cards Stack */}
              <div className="relative flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-1">
                {districts.map((d) => {
                  const isLost = d.lost;
                  const isSafe = !isLost && d.approval >= 71;
                  const isReclaimed = Boolean(d.recentlyReclaimed);

                  // Tag Text and styles per prompt
                  let tagText = "[AT RISK]";
                  let tagStyle = "bg-amber-950/60 text-amber-300 border-amber-600/60";
                  let progressColor = "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]";
                  let cardBg = "bg-amber-100/10 border border-amber-300/20 text-amber-100";

                  if (isReclaimed) {
                    tagText = "[RECLAIMED ↺]";
                    tagStyle =
                      "bg-emerald-950 text-emerald-300 border-emerald-400 font-black animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]";
                    progressColor = "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]";
                    cardBg =
                      "bg-emerald-950/30 border border-emerald-500/60 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
                  } else if (isLost) {
                    tagText = "[LOST ❌]";
                    tagStyle = "bg-rose-950/80 text-rose-300 border-rose-600 font-bold";
                    progressColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
                    cardBg = "bg-rose-950/20 border border-rose-900/50 text-rose-200";
                  } else if (isSafe) {
                    tagText = "[SAFE]";
                    tagStyle = "bg-emerald-950/60 text-emerald-300 border-emerald-600/60";
                    progressColor = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]";
                    cardBg = "bg-amber-100/10 border border-amber-300/20 text-amber-100";
                  }

                  const nameColor = isLost
                    ? "line-through opacity-80 text-rose-300"
                    : "text-amber-100";

                  return (
                    <div
                      key={d.id}
                      className={`relative p-3 rounded-lg flex flex-col gap-1.5 transition-all shadow-sm ${d.rotation} hover:rotate-0 hover:scale-[1.01] ${cardBg}`}
                    >
                      {/* Pushpin at top center */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${d.pinColor} border border-white/60 shadow-sm`}
                        />
                      </div>

                      {/* District Name, Vote Percentage, and Status Tag */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span
                          className={`text-xs font-serif font-bold tracking-tight truncate ${nameColor}`}
                        >
                          {d.name}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-mono text-[9px] px-1.5 py-0.2 rounded border uppercase tracking-wider ${tagStyle}`}
                          >
                            {tagText}
                          </span>
                          <span
                            className={`font-mono text-xs font-black tabular-nums ${
                              isLost
                                ? "text-rose-400"
                                : isSafe
                                  ? "text-emerald-400"
                                  : "text-amber-300"
                            }`}
                          >
                            {d.approval}%
                          </span>
                        </div>
                      </div>

                      {/* Clean Glowing Progress Bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40 border border-amber-900/40">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                          style={{ width: `${d.approval}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Corkboard Footer */}
              <div className="relative mt-4 pt-3 border-t border-amber-800/40 flex items-center justify-between font-mono text-[11px] text-amber-300/80">
                <span>Loyal Sectors:</span>
                <span
                  className={`font-bold tabular-nums ${
                    lostCount >= 4 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {10 - lostCount} / 10 Holding
                </span>
              </div>
            </div>
          </aside>

          {/* ─── RIGHT MAIN DESK: The Campaign Dossier (65% width) ─── */}
          <main className="w-full lg:w-[65%]">
            <div className="bg-amber-50 text-stone-900 border-2 border-amber-200 shadow-2xl p-6 sm:p-8 rounded-xl font-sans relative flex flex-col justify-between min-h-[580px]">
              {/* Red paperclip in the top-right corner */}
              <div className="absolute -top-3 right-8 w-6 h-10 border-2 border-red-700/80 rounded-full rotate-12 shadow-sm pointer-events-none" />

              {currentEvent && gameState === "playing" ? (
                <div>
                  {/* Dossier Header */}
                  <div className="flex flex-wrap items-center justify-between border-b-2 border-stone-300 pb-3 mb-5 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                        OFFICIAL CAMPAIGN MANIFESTO // CRISIS {eventIndex + 1} OF {events.length}
                      </span>
                    </div>

                    {/* Step Pip Indicators */}
                    <div className="flex items-center gap-1.5">
                      {events.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 w-5 sm:w-6 rounded-full transition-colors ${
                            idx < eventIndex
                              ? "bg-stone-700"
                              : idx === eventIndex
                                ? "bg-amber-600 shadow-sm"
                                : "bg-stone-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Crisis Headline */}
                  <div className="border-l-4 border-amber-600 bg-amber-100/50 p-4 mb-4 rounded-r-lg">
                    <span className="font-mono text-[10px] tracking-widest text-amber-800 font-bold uppercase block mb-1">
                      LOCAL EMERGENCY DECLARATION
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-stone-900">
                      Crisis {eventIndex + 1}: {currentEvent.title}
                    </h2>
                  </div>

                  {/* Scenario Narrative */}
                  <p className="text-sm sm:text-base font-serif leading-relaxed text-stone-800 mb-4 pl-1">
                    "{currentEvent.scenario}"
                  </p>

                  {/* Handwritten Sticky Note Flavor */}
                  <div className="mb-5 inline-block bg-yellow-100 border border-yellow-300 p-2.5 rounded shadow-xs rotate-[-0.5deg]">
                    <span className="font-mono text-xs text-stone-700 italic">
                      ✍️ {currentEvent.notes}
                    </span>
                  </div>

                  {/* Reclaimed Notice Banner */}
                  {reclaimedNotice && reclaimedNotice.length > 0 && (
                    <div className="mb-4 rounded-lg bg-emerald-100 border border-emerald-400 p-3 font-mono text-xs text-emerald-900 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-emerald-700 font-bold">↺</span>
                        <div>
                          <strong className="text-emerald-800 uppercase tracking-wide">
                            Constituency Reclaimed!
                          </strong>{" "}
                          <span className="font-semibold text-stone-900">
                            {reclaimedNotice.join(", ")}
                          </span>{" "}
                          <span>jumped back to ≥51% and returned to safe status!</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest bg-emerald-200 px-2 py-0.5 rounded border border-emerald-400 text-emerald-900">
                        SAVED
                      </span>
                    </div>
                  )}

                  {/* Last Electoral Swing Applied */}
                  {lastImpactNotice && (
                    <div className="mb-4 rounded-lg bg-stone-100 p-2.5 border border-stone-300 font-mono text-xs text-stone-800">
                      <span className="text-amber-800 font-bold uppercase mr-2">
                        PREVIOUS POLICY IMPACT:
                      </span>
                      {Object.entries(lastImpactNotice).map(([k, delta]) => {
                        const num = delta ?? 0;
                        const label =
                          k === "all"
                            ? "All Districts"
                            : (DISTRICT_LIST.find((item) => item.id === k)?.name ?? k);
                        return (
                          <span key={k} className="mr-3 font-semibold">
                            {label}:{" "}
                            <span className={num > 0 ? "text-emerald-700" : "text-rose-700"}>
                              {num > 0 ? `+${num}%` : `${num}%`}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* High-Stakes Decision Buttons */}
                  <div className="space-y-3 mt-4">
                    <div className="font-mono text-[11px] text-stone-600 uppercase tracking-wider font-semibold">
                      APPROVE OFFICIAL CAMPAIGN DIRECTIVE:
                    </div>

                    {currentEvent.choices.map((choice, i) => {
                      const isIgnore = Boolean(choice.isIgnore);
                      const containerClass = isIgnore
                        ? "border-2 border-stone-300/90 bg-stone-100/80 hover:bg-rose-50/70 hover:border-rose-400"
                        : "border-2 border-stone-300 bg-white hover:bg-amber-50/80 hover:border-amber-600";
                      const badgeClass = isIgnore
                        ? "bg-stone-800 text-rose-300 border border-stone-700"
                        : "bg-stone-900 text-amber-100";
                      const flavorClass = isIgnore
                        ? "text-rose-800 font-semibold"
                        : "text-amber-800 font-medium";

                      return (
                        <button
                          key={i}
                          onClick={() => handleChoice(choice)}
                          disabled={choiceBusy}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-lg transition-all active:scale-[0.99] shadow-sm cursor-pointer ${containerClass} ${
                            choiceBusy ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-mono text-xs font-bold shrink-0 ${badgeClass}`}
                              >
                                {choice.title}
                              </span>
                              <span className="font-sans text-xs sm:text-sm font-semibold text-stone-900 leading-snug">
                                {choice.action}
                              </span>
                            </div>

                            <div
                              className={`pl-10 font-mono text-[11px] tracking-wide ${flavorClass}`}
                            >
                              [{isIgnore ? "Inaction Consequence" : "Projected Swing"}:{" "}
                              {choice.flavor}]
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center font-mono text-sm text-stone-600">
                  Tabulating all ballot boxes across the constituencies...
                </div>
              )}

              {/* Dossier Footer */}
              <div className="mt-8 border-t-2 border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-stone-600 gap-2">
                <span>
                  Electoral Majority:{" "}
                  <strong
                    className={lostCount >= 4 ? "text-red-700 font-bold" : "text-emerald-700"}
                  >
                    {10 - lostCount} Loyal Constituencies
                  </strong>
                </span>
                <span className="text-stone-500">
                  6 or more lost triggers instant campaign ouster
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ─── GAME OVER: CINEMATIC CAMPAIGN COLLAPSE OVERLAY ─── */}
      {gameState === "lost" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="max-w-lg w-full rounded-2xl border-4 border-red-700 bg-stone-950 p-6 sm:p-8 text-center shadow-2xl">
            <div className="inline-block border border-red-500 bg-red-950/70 px-3 py-1 font-mono text-xs uppercase tracking-widest text-red-200 font-black mb-3">
              OFFICIAL ELECTION COMMUNIQUE
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-wider text-red-100">
              ELECTION LOST — OUSTED FROM BAP
            </h2>

            <p className="mt-2.5 font-mono text-xs font-bold tracking-widest text-red-400 uppercase">
              MAJORITY COLLAPSE: {lostCount} OF 10 CONSTITUENCIES LOST
            </p>

            <div className="my-5 rounded-lg bg-black/50 p-4 border border-red-900/60 text-left font-serif text-sm leading-relaxed text-red-200">
              With 6 or more districts dropping to 50% or below, the opposition swept the
              legislature. The BAP committee terminated your campaign, and the AI bots celebrated
              another clean automated election.
            </div>

            <button
              onClick={handleRetry}
              className="w-full rounded-lg border-2 border-red-500 bg-red-800 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-red-100 transition hover:bg-red-700 active:scale-95 shadow-md cursor-pointer"
            >
              Retry Campaign
            </button>
          </div>
        </div>
      )}

      {/* ─── WIN CONDITION: VICTORY OVERLAY ─── */}
      {gameState === "won" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="max-w-lg w-full rounded-2xl border-4 border-emerald-600 bg-stone-950 p-6 sm:p-8 text-center shadow-2xl">
            <div className="inline-block border border-emerald-500 bg-emerald-950/70 px-3 py-1 font-mono text-xs uppercase tracking-widest text-emerald-200 font-black mb-3">
              OFFICIAL ELECTION COMMUNIQUE
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-wider text-emerald-100">
              VICTORY: ELECTED TO POWER!
            </h2>

            <p className="mt-2.5 font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase">
              BAP DEFEATS THE AUTOMATED OPPOSITION
            </p>

            <div className="my-5 rounded-lg bg-black/50 p-4 border border-emerald-900/60 text-left font-serif text-sm leading-relaxed text-stone-200">
              Against all odds, you defended <strong>{10 - lostCount} of 10 constituencies</strong>.
              You survived the intense crisis barrage, the automated rejections, and the campaign
              meat-grinder. You are now officially a biological member of parliament!
            </div>

            <button
              onClick={onComplete}
              className="w-full rounded-lg border-2 border-emerald-500 bg-emerald-800 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-emerald-100 transition hover:bg-emerald-700 active:scale-95 shadow-md cursor-pointer"
            >
              Return to Career Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PoliticianGame;
