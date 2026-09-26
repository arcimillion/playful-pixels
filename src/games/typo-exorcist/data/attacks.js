// Attack type constants and scheduling helpers.

export const ATTACK = {
  PROJECTILE: "projectile", // glowing cursed bolt aimed at player
  GROUND_CURSE: "ground", // dark wave along the floor -> jump over
  SPIRIT_DASH: "dash", // ghost disappears and reappears near player
  SHADOW_HANDS: "hands", // hands emerge from floor/walls
  DISTORTION: "distort", // screen glitch, spirit harder to see
  JUMPSCARE: "jumpscare", // rare controlled scare
};

// Weighted attack pool per round. Jumpscares are rare.
export const ATTACK_POOLS = {
  1: [
    [ATTACK.PROJECTILE, 0.7],
    [ATTACK.GROUND_CURSE, 0.3],
  ],
  2: [
    [ATTACK.PROJECTILE, 0.45],
    [ATTACK.GROUND_CURSE, 0.3],
    [ATTACK.SPIRIT_DASH, 0.2],
    [ATTACK.JUMPSCARE, 0.05],
  ],
  3: [
    [ATTACK.PROJECTILE, 0.35],
    [ATTACK.GROUND_CURSE, 0.22],
    [ATTACK.SPIRIT_DASH, 0.2],
    [ATTACK.SHADOW_HANDS, 0.15],
    [ATTACK.JUMPSCARE, 0.08],
  ],
  4: [
    [ATTACK.PROJECTILE, 0.28],
    [ATTACK.GROUND_CURSE, 0.18],
    [ATTACK.SPIRIT_DASH, 0.2],
    [ATTACK.SHADOW_HANDS, 0.16],
    [ATTACK.DISTORTION, 0.12],
    [ATTACK.JUMPSCARE, 0.06],
  ],
  5: [
    [ATTACK.PROJECTILE, 0.24],
    [ATTACK.GROUND_CURSE, 0.16],
    [ATTACK.SPIRIT_DASH, 0.22],
    [ATTACK.SHADOW_HANDS, 0.18],
    [ATTACK.DISTORTION, 0.14],
    [ATTACK.JUMPSCARE, 0.06],
  ],
};

export function pickAttack(round, rng = Math.random) {
  const pool = ATTACK_POOLS[Math.min(Math.max(round, 1), 5)];
  const r = rng();
  let acc = 0;
  for (const [type, w] of pool) {
    acc += w;
    if (r <= acc) return type;
  }
  return pool[pool.length - 1][0];
}
