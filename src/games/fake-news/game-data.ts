export type SlotId = "who" | "action" | "target";
export type RiskLevel = "safe" | "medium" | "extreme";

export interface Slot {
  id: SlotId;
  label: string;
}

export const SLOTS: Slot[] = [
  { id: "who", label: "Subject" },
  { id: "action", label: "Action" },
  { id: "target", label: "Target / Object" },
];

export interface RiskMeta {
  label: string;
  dot: string;
  glow: string;
  payout: number;
  heat: number;
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  safe: {
    label: "Safe",
    dot: "#34d399",
    glow: "rgba(52,211,153,0.4)",
    payout: 150,
    heat: 5,
  },
  medium: {
    label: "Spicy",
    dot: "#fbbf24",
    glow: "rgba(251,191,36,0.4)",
    payout: 350,
    heat: 18,
  },
  extreme: {
    label: "Wild",
    dot: "#f43f5e",
    glow: "rgba(244,63,94,0.5)",
    payout: 750,
    heat: 35,
  },
};

export interface WordCard {
  id: string;
  slot: SlotId;
  phrase: string;
  risk: RiskLevel;
}

const POOL_WHO: { phrase: string; risk: RiskLevel }[] = [
  { phrase: "Tech Billionaire", risk: "safe" },
  { phrase: "Rogue AI Assistant", risk: "safe" },
  { phrase: "City Mayor", risk: "safe" },
  { phrase: "Mutant Pigeon", risk: "medium" },
  { phrase: "Secret Shadow Gov", risk: "extreme" },
  { phrase: "Quantum Cat", risk: "safe" },
  { phrase: "Sentient Microwave", risk: "medium" },
  { phrase: "Celebrity Influencer", risk: "safe" },
  { phrase: "Deepfake President", risk: "extreme" },
  { phrase: "Alien Ambassador", risk: "extreme" },
  { phrase: "Crypto Guru", risk: "medium" },
  { phrase: "Undercover Pigeon", risk: "medium" },
  { phrase: "Time Traveler", risk: "medium" },
  { phrase: "Unhinged Robot Dog", risk: "extreme" },
  { phrase: "Disgruntled Intern", risk: "safe" },
];

const POOL_ACTION: { phrase: string; risk: RiskLevel }[] = [
  { phrase: "Secretly Buys", risk: "safe" },
  { phrase: "Accused Of Eating", risk: "medium" },
  { phrase: "Launches Rocket At", risk: "extreme" },
  { phrase: "Converts Entire City To", risk: "medium" },
  { phrase: "Replaces Employees With", risk: "safe" },
  { phrase: "Sues Over Stolen", risk: "safe" },
  { phrase: "Bribes Officials With", risk: "medium" },
  { phrase: "Declares War On", risk: "extreme" },
  { phrase: "Trapped Inside", risk: "medium" },
  { phrase: "Caught Feasting On", risk: "extreme" },
  { phrase: "Hacks Entire Grid For", risk: "extreme" },
  { phrase: "Bans All Human Use Of", risk: "medium" },
  { phrase: "Secretly Clones", risk: "extreme" },
  { phrase: "Demands Worship Of", risk: "medium" },
  { phrase: "Accidentally Explodes", risk: "extreme" },
];

const POOL_TARGET: { phrase: string; risk: RiskLevel }[] = [
  { phrase: "The Moon's Core", risk: "extreme" },
  { phrase: "Free Public WiFi", risk: "safe" },
  { phrase: "City Hall Donuts", risk: "safe" },
  { phrase: "Sentient Toasters", risk: "medium" },
  { phrase: "Nuclear Submarine Fleet", risk: "extreme" },
  { phrase: "Vintage Meme Archives", risk: "safe" },
  { phrase: "Tax Return Server", risk: "medium" },
  { phrase: "Interdimensional Portal", risk: "extreme" },
  { phrase: "Spicy Taco Trucks", risk: "safe" },
  { phrase: "High School Reunion", risk: "safe" },
  { phrase: "Secret Moon Base", risk: "extreme" },
  { phrase: "Corporate Coffee Supply", risk: "medium" },
  { phrase: "Government Drone Birds", risk: "extreme" },
  { phrase: "Underground Bunker", risk: "medium" },
  { phrase: "Global Internet Cable", risk: "extreme" },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawDeck(): WordCard[] {
  const whoShuffled = shuffle(POOL_WHO);
  const actionShuffled = shuffle(POOL_ACTION);
  const targetShuffled = shuffle(POOL_TARGET);

  // Guarantee 2 who, 2 action, 2 target for balanced hand of 6 cards
  const cards: WordCard[] = [
    {
      id: `w1-${Date.now()}-${Math.random()}`,
      slot: "who",
      phrase: whoShuffled[0].phrase,
      risk: whoShuffled[0].risk,
    },
    {
      id: `w2-${Date.now()}-${Math.random()}`,
      slot: "who",
      phrase: whoShuffled[1].phrase,
      risk: whoShuffled[1].risk,
    },
    {
      id: `a1-${Date.now()}-${Math.random()}`,
      slot: "action",
      phrase: actionShuffled[0].phrase,
      risk: actionShuffled[0].risk,
    },
    {
      id: `a2-${Date.now()}-${Math.random()}`,
      slot: "action",
      phrase: actionShuffled[1].phrase,
      risk: actionShuffled[1].risk,
    },
    {
      id: `t1-${Date.now()}-${Math.random()}`,
      slot: "target",
      phrase: targetShuffled[0].phrase,
      risk: targetShuffled[0].risk,
    },
    {
      id: `t2-${Date.now()}-${Math.random()}`,
      slot: "target",
      phrase: targetShuffled[1].phrase,
      risk: targetShuffled[1].risk,
    },
  ];

  return shuffle(cards);
}
