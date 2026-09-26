// Spirit definitions per round. Stats scale aggression.
// Colors are dark supernatural hues (no generic blue).

export const SPIRITS = [
  {
    round: 1,
    name: "THE WHISPER",
    maxHp: 100,
    color: "#7fd4c2", // sickly pale teal
    accent: "#9be8d6",
    eye: "#eafff7",
    attackInterval: 2600,
    attackSpeed: 150,
    teleportChance: 0.0,
    distortion: false,
    jumpscareChance: 0.0,
  },
  {
    round: 2,
    name: "THE WATCHER",
    maxHp: 160,
    color: "#c2a35a", // dim gold lantern
    accent: "#e6c878",
    eye: "#fff4d2",
    attackInterval: 2000,
    attackSpeed: 200,
    teleportChance: 0.15,
    distortion: false,
    jumpscareChance: 0.04,
  },
  {
    round: 3,
    name: "THE HUNGER",
    maxHp: 230,
    color: "#b5543f", // dark crimson rust
    accent: "#e07a5f",
    eye: "#ffd9c2",
    attackInterval: 1500,
    attackSpeed: 250,
    teleportChance: 0.3,
    distortion: false,
    jumpscareChance: 0.06,
  },
  {
    round: 4,
    name: "THE DISTORTION",
    maxHp: 320,
    color: "#8a6fb0", // desaturated purple
    accent: "#b79ce0",
    eye: "#f0e6ff",
    attackInterval: 1150,
    attackSpeed: 300,
    teleportChance: 0.45,
    distortion: true,
    jumpscareChance: 0.09,
  },
  {
    round: 5,
    name: "THE LAST BREATH",
    maxHp: 520,
    color: "#d23b3b", // boss crimson
    accent: "#ff6a4d",
    eye: "#fff0e0",
    attackInterval: 850,
    attackSpeed: 360,
    teleportChance: 0.55,
    distortion: true,
    jumpscareChance: 0.12,
    boss: true,
  },
];

export function spiritForRound(round) {
  return SPIRITS[Math.min(Math.max(round, 1), SPIRITS.length) - 1];
}
