// Attack type constants and scheduling logic for Typo Exorcist

export const ATTACK_TYPES = {
  PROJECTILE: "projectile", // glowing cursed bolt aimed at player
  GROUND_CURSE: "ground", // dark wave surge along the floor
  SPIRIT_DASH: "dash", // spirit teleports/dashes near player
  SHADOW_HANDS: "hands", // dark hands erupt from the floor
  DISTORTION: "distort", // screen glitch & mist
  SHOCKWAVE: "shockwave", // sudden radial burst
} as const;

export type AttackType = (typeof ATTACK_TYPES)[keyof typeof ATTACK_TYPES];

export interface AttackConfig {
  type: AttackType;
  name: string;
  color: string;
  speed: number;
  damage: number;
}

// Attack pools unlocked based on level progression
export function getAvailableAttacksForLevel(level: number): AttackType[] {
  if (level === 1) {
    return [ATTACK_TYPES.PROJECTILE];
  } else if (level === 2) {
    return [ATTACK_TYPES.PROJECTILE, ATTACK_TYPES.GROUND_CURSE];
  } else if (level === 3) {
    return [ATTACK_TYPES.PROJECTILE, ATTACK_TYPES.GROUND_CURSE, ATTACK_TYPES.SPIRIT_DASH];
  } else if (level === 4) {
    return [
      ATTACK_TYPES.PROJECTILE,
      ATTACK_TYPES.GROUND_CURSE,
      ATTACK_TYPES.SPIRIT_DASH,
      ATTACK_TYPES.SHADOW_HANDS,
    ];
  } else {
    // Level 5+ (including Bosses)
    return [
      ATTACK_TYPES.PROJECTILE,
      ATTACK_TYPES.GROUND_CURSE,
      ATTACK_TYPES.SPIRIT_DASH,
      ATTACK_TYPES.SHADOW_HANDS,
      ATTACK_TYPES.DISTORTION,
      ATTACK_TYPES.SHOCKWAVE,
    ];
  }
}

export function pickRandomAttack(level: number, isBoss: boolean = false): AttackType {
  const attacks = getAvailableAttacksForLevel(level);
  if (isBoss) {
    // Bosses favor heavy special attacks
    const bossPool = [
      ATTACK_TYPES.PROJECTILE,
      ATTACK_TYPES.GROUND_CURSE,
      ATTACK_TYPES.SHADOW_HANDS,
      ATTACK_TYPES.SHOCKWAVE,
      ATTACK_TYPES.SPIRIT_DASH,
    ];
    return bossPool[Math.floor(Math.random() * bossPool.length)];
  }
  return attacks[Math.floor(Math.random() * attacks.length)];
}
