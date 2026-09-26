// Original cursed sentences for TYPO EXORCIST.
// Difficulty scales with round. Player must type each REVERSED (lowercased).

export const SENTENCES = [
  // --- Easy (short, 2-3 words) ---
  "THE DOOR IS OPEN",
  "IT SEES YOU",
  "DONT LOOK BACK",
  "THE WALLS BLEED",
  "STAY AWAKE",
  "HE IS HERE",
  "NO EXIT",
  "THE CANDLE DIES",
  // --- Medium (3-4 words) ---
  "THE SHADOW FOLLOWS YOU",
  "SHE WAITS IN THE DARK",
  "YOUR NAME IS FORGOTTEN",
  "THE MIRROR LIES",
  "EVERY WHISPER BETRAYS",
  "THE FLOOR REMEMBERS",
  "WE HEAR YOUR BREATH",
  "THE COLD KNOWS YOUR NAME",
  // --- Hard (4-5 words) ---
  "THE NIGHT REMEMBERS YOUR NAME",
  "SOMETHING WALKS BEHIND YOU NOW",
  "THE PAINTINGS WATCH THE LIVING",
  "YOUR REFLECTION IS NOT YOURS",
  "THE HOUSE FEEDS ON FEAR",
  "NO PRAYER CAN SAVE YOU HERE",
  // --- Very Hard (5+ words) ---
  "NO ONE LEAVES THIS HOUSE ALIVE",
  "THE DEAD ARE COUNTING YOUR HEARTBEATS",
  "EVERY DOOR LEADS BACK TO THE BEGINNING",
  "THE SPIRIT REMEMBERS EVERY PROMISE YOU BROKE",
  "YOU WILL FORGET YOUR OWN NAME BEFORE DAWN",
  "THERE IS NO SILENCE IN THIS HOUSE",
  "THE HUNGER BENEATH THE FLOOR NEVER SLEEPS",
  "WE HAVE BEEN WAITING SINCE YOU WERE BORN",
];

// Group by difficulty tier for round selection.
export const SENTENCE_TIERS = {
  1: [0, 1, 2, 6, 7],
  2: [3, 4, 5, 8, 9, 10, 15],
  3: [11, 12, 13, 14, 16, 17, 18],
  4: [19, 20, 21, 22, 23, 24],
  5: [25, 26, 27, 28, 29, 30, 31],
};

// Pick a sentence appropriate for a given round (1-indexed).
export function pickSentence(round, avoid = null, rng = Math.random) {
  const tier = SENTENCE_TIERS[Math.min(Math.max(round, 1), 5)];
  let idx;
  let guard = 0;
  do {
    idx = tier[Math.floor(rng() * tier.length)];
    guard++;
  } while (idx === avoid && guard < 8);
  return { index: idx, text: SENTENCES[idx] };
}

// The player must type the reversed, lowercased sentence.
export function requiredInput(sentence) {
  return sentence.toLowerCase().split("").reverse().join("");
}
