import { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield,
  KeyRound,
  Snowflake,
  Bomb,
  Lock,
  Play,
  RotateCcw,
  ArrowLeft,
  Award,
  AlertTriangle,
  FastForward,
  Radio,
} from "lucide-react";

interface CyberDefenseTDSProps {
  debt?: number;
  onComplete?: () => void;
  onExit?: () => void;
}

interface Point {
  x: number;
  y: number;
}

export type TowerType = "firewall" | "decryption" | "cryo" | "logicBomb";

interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  range: number;
  fireInterval: number; // in seconds
  lastFireTime: number; // in seconds
}

interface TowerConfig {
  type: TowerType;
  name: string;
  cost: number;
  range: number;
  fireInterval: number;
  unlockWave: number;
  description: string;
  badge: string;
  iconColor: string;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  firewall: {
    type: "firewall",
    name: "Basic Firewall",
    cost: 250,
    range: 3,
    fireInterval: 1.0,
    unlockWave: 1,
    description: "Range 3 · 1 shot/s · 15 Base Dmg",
    badge: "Direct Defense",
    iconColor: "text-cyan-400",
  },
  decryption: {
    type: "decryption",
    name: "Decryption Node",
    cost: 350,
    range: 3,
    fireInterval: 1.0,
    unlockWave: 3,
    description: "Range 3 · 1 shot/s · 16 Armor Dmg (8 HP)",
    badge: "Armor Piercer",
    iconColor: "text-yellow-400",
  },
  cryo: {
    type: "cryo",
    name: "Cryo-Thread",
    cost: 200,
    range: 2,
    fireInterval: 0.5,
    unlockWave: 5,
    description: "Range 2 · Pulse 0.5s · 2 Dmg + 50% Slow",
    badge: "Crowd Control",
    iconColor: "text-cyan-300",
  },
  logicBomb: {
    type: "logicBomb",
    name: "Logic Bomb",
    cost: 400,
    range: 2,
    fireInterval: 2.5,
    unlockWave: 7,
    description: "Range 2 · 2.5s CD · 12 Target + 10 AoE",
    badge: "AoE Splash",
    iconColor: "text-rose-400",
  },
};

interface Projectile {
  id: string;
  towerType: TowerType;
  x: number;
  y: number;
  targetId: string;
  targetX: number;
  targetY: number;
  speed: number; // tiles per second
  damage: number;
  isSplash?: boolean;
  splashRadius?: number;
  splashDamage?: number;
}

export type EnemyType = "basic" | "bloatware" | "ransomware" | "trojan" | "worm" | "boss";

interface Enemy {
  id: string;
  type: EnemyType;
  progress: number; // 0 to PATH.length - 1
  hp: number;
  currentHp: number;
  maxHp: number;
  armor: number;
  maxArmor: number;
  isTrojan: boolean;
  speedModifier: number;
  speed: number; // tiles per second
  currentX: number;
  currentY: number;
  slowTimer: number; // Cryo slow effect duration in seconds
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

// 12x12 strict winding path from top-left (0,0) to bottom-right (11,11)
const PATH: Point[] = [
  // Row 0: right to (5,0)
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 4, y: 0 },
  { x: 5, y: 0 },
  // Down to (5,2)
  { x: 5, y: 1 },
  { x: 5, y: 2 },
  // Left to (0,2)
  { x: 4, y: 2 },
  { x: 3, y: 2 },
  { x: 2, y: 2 },
  { x: 1, y: 2 },
  { x: 0, y: 2 },
  // Down to (0,4)
  { x: 0, y: 3 },
  { x: 0, y: 4 },
  // Right to (8,4)
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 3, y: 4 },
  { x: 4, y: 4 },
  { x: 5, y: 4 },
  { x: 6, y: 4 },
  { x: 7, y: 4 },
  { x: 8, y: 4 },
  // Up to (8,0)
  { x: 8, y: 3 },
  { x: 8, y: 2 },
  { x: 8, y: 1 },
  { x: 8, y: 0 },
  // Right to (11,0)
  { x: 9, y: 0 },
  { x: 10, y: 0 },
  { x: 11, y: 0 },
  // Down to (11,6)
  { x: 11, y: 1 },
  { x: 11, y: 2 },
  { x: 11, y: 3 },
  { x: 11, y: 4 },
  { x: 11, y: 5 },
  { x: 11, y: 6 },
  // Left to (1,6)
  { x: 10, y: 6 },
  { x: 9, y: 6 },
  { x: 8, y: 6 },
  { x: 7, y: 6 },
  { x: 6, y: 6 },
  { x: 5, y: 6 },
  { x: 4, y: 6 },
  { x: 3, y: 6 },
  { x: 2, y: 6 },
  { x: 1, y: 6 },
  // Down to (1,8)
  { x: 1, y: 7 },
  { x: 1, y: 8 },
  // Right to (10,8)
  { x: 2, y: 8 },
  { x: 3, y: 8 },
  { x: 4, y: 8 },
  { x: 5, y: 8 },
  { x: 6, y: 8 },
  { x: 7, y: 8 },
  { x: 8, y: 8 },
  { x: 9, y: 8 },
  { x: 10, y: 8 },
  // Down to (10,10)
  { x: 10, y: 9 },
  { x: 10, y: 10 },
  // Left to (0,10)
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
  { x: 5, y: 10 },
  { x: 4, y: 10 },
  { x: 3, y: 10 },
  { x: 2, y: 10 },
  { x: 1, y: 10 },
  { x: 0, y: 10 },
  // Down to (0,11)
  { x: 0, y: 11 },
  // Right to (11,11)
  { x: 1, y: 11 },
  { x: 2, y: 11 },
  { x: 3, y: 11 },
  { x: 4, y: 11 },
  { x: 5, y: 11 },
  { x: 6, y: 11 },
  { x: 7, y: 11 },
  { x: 8, y: 11 },
  { x: 9, y: 11 },
  { x: 10, y: 11 },
  { x: 11, y: 11 },
];

// Wave enemy sequences
const WAVE_SEQUENCES: Record<number, EnemyType[]> = {
  // Wave 1: 5 Basic Viruses
  1: ["basic", "basic", "basic", "basic", "basic"],
  // Wave 2: 8 Basic, 1 Bloatware
  2: ["basic", "basic", "basic", "basic", "bloatware", "basic", "basic", "basic", "basic"],
  // Wave 3: 5 Basic, 3 Bloatware
  3: ["basic", "bloatware", "basic", "bloatware", "basic", "basic", "bloatware", "basic"],
  // Wave 4: 10 Basic, 2 Ransomware
  4: [
    "basic",
    "basic",
    "ransomware",
    "basic",
    "basic",
    "basic",
    "ransomware",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
  ],
  // Wave 5: 2 Trojans, 2 Ransomware
  5: ["trojan", "ransomware", "trojan", "ransomware"],
  // Wave 6: 15 Basic Viruses (spawn rapidly)
  6: [
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
    "basic",
  ],
  // Wave 7: 8 Ransomware, 2 Bloatware
  7: [
    "ransomware",
    "ransomware",
    "bloatware",
    "ransomware",
    "ransomware",
    "bloatware",
    "ransomware",
    "ransomware",
    "ransomware",
    "ransomware",
  ],
  // Wave 8: 3 Trojans mixed with 10 Basic Viruses
  8: [
    "basic",
    "basic",
    "trojan",
    "basic",
    "basic",
    "basic",
    "trojan",
    "basic",
    "basic",
    "basic",
    "trojan",
    "basic",
    "basic",
  ],
  // Wave 9: 5 Bloatware, 5 Ransomware
  9: [
    "bloatware",
    "ransomware",
    "bloatware",
    "ransomware",
    "bloatware",
    "ransomware",
    "bloatware",
    "ransomware",
    "bloatware",
    "ransomware",
  ],
  // Wave 10 (Boss): 1 massive "Rogue Thread" Boss (HP: 800, slow speed) accompanied by continuous trickle of fast Micro-Worms
  10: ["boss", "worm", "worm", "worm", "worm", "worm", "worm", "worm", "worm", "worm", "worm"],
};

function createEnemyConfig(type: EnemyType, wave: number = 1) {
  const waveFactor = Math.max(1, wave);
  const baseSpeed = 1.1; // base tiles/sec
  switch (type) {
    case "boss": {
      return {
        type: "boss" as EnemyType,
        hp: 800,
        maxHp: 800,
        armor: 0,
        maxArmor: 0,
        isTrojan: false,
        speedModifier: 0.4, // slow speed
        speed: baseSpeed * 0.4,
      };
    }
    case "bloatware": {
      // Aggressive scaling: Wave 2 = 180 HP, Wave 3 = 240 HP...
      const hp = 140 + waveFactor * 30;
      return {
        type: "bloatware" as EnemyType,
        hp,
        maxHp: hp,
        armor: 0,
        maxArmor: 0,
        isTrojan: false,
        speedModifier: 0.5, // 50% slower
        speed: baseSpeed * 0.5,
      };
    }
    case "ransomware": {
      // Aggressive armor and hp scaling: Wave 4 = 170 Armor, Wave 5 = 195 Armor
      const hp = 25 + waveFactor * 8;
      const armor = 70 + waveFactor * 25;
      return {
        type: "ransomware" as EnemyType,
        hp,
        maxHp: hp,
        armor,
        maxArmor: armor,
        isTrojan: false,
        speedModifier: 0.9,
        speed: baseSpeed * 0.9,
      };
    }
    case "trojan": {
      // Aggressive HP scaling: Wave 5 = 135 HP
      const hp = 60 + waveFactor * 15;
      return {
        type: "trojan" as EnemyType,
        hp,
        maxHp: hp,
        armor: 0,
        maxArmor: 0,
        isTrojan: true,
        speedModifier: 0.65, // slow speed
        speed: baseSpeed * 0.65,
      };
    }
    case "worm": {
      const hp = 8 + waveFactor * 2;
      return {
        type: "worm" as EnemyType,
        hp,
        maxHp: hp,
        armor: 0,
        maxArmor: 0,
        isTrojan: false,
        speedModifier: 2.0, // 2x hyper-fast
        speed: baseSpeed * 2.0,
      };
    }
    case "basic":
    default: {
      // Wave 1: 30 HP, Wave 2: 42 HP, Wave 3: 54 HP, Wave 4: 66 HP, Wave 5: 78 HP
      const hp = 18 + waveFactor * 12;
      return {
        type: "basic" as EnemyType,
        hp,
        maxHp: hp,
        armor: 0,
        maxArmor: 0,
        isTrojan: false,
        speedModifier: 1.0,
        speed: baseSpeed * 1.0,
      };
    }
  }
}

export default function CyberDefenseTDS({ onComplete, onExit }: CyberDefenseTDSProps) {
  const [funds, setFunds] = useState(400);
  const [serverHealth, setServerHealth] = useState(50); // Fragile Server starting health: 50
  const [currentWave, setCurrentWave] = useState(1);
  const [waveActive, setWaveActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [isBreached, setIsBreached] = useState(false);
  const [breachKey, setBreachKey] = useState(0);
  const [intermissionSeconds, setIntermissionSeconds] = useState<number | null>(null);
  const [selectedShopTowerType, setSelectedShopTowerType] = useState<TowerType | null>("firewall");
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [hoveredTower, setHoveredTower] = useState<Tower | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const breachTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mutable Game Engine state for smooth 60FPS requestAnimationFrame loop
  const stateRef = useRef({
    funds: 400,
    serverHealth: 50,
    currentWave: 1,
    waveActive: false,
    gameOver: false,
    gameWon: false,
    towers: [] as Tower[],
    projectiles: [] as Projectile[],
    pulseWaves: [] as PulseWave[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    spawnQueue: [] as { delay: number; config: ReturnType<typeof createEnemyConfig> }[],
    timeSinceWaveStart: 0,
    elapsedGameTime: 0,
    intermissionTimer: 0, // 3-second delay countdown between waves
    lastTime: performance.now(),
  });

  const triggerBreach = useCallback(() => {
    setBreachKey((k) => k + 1);
    setIsBreached(true);
    if (breachTimeoutRef.current) clearTimeout(breachTimeoutRef.current);
    breachTimeoutRef.current = setTimeout(() => {
      setIsBreached(false);
    }, 200);
  }, []);

  const triggerBreachRef = useRef(triggerBreach);
  triggerBreachRef.current = triggerBreach;

  useEffect(() => {
    return () => {
      if (breachTimeoutRef.current) clearTimeout(breachTimeoutRef.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    stateRef.current.funds = 400;
    stateRef.current.serverHealth = 50;
    stateRef.current.currentWave = 1;
    stateRef.current.waveActive = false;
    stateRef.current.gameOver = false;
    stateRef.current.gameWon = false;
    stateRef.current.towers = [];
    stateRef.current.projectiles = [];
    stateRef.current.pulseWaves = [];
    stateRef.current.enemies = [];
    stateRef.current.particles = [];
    stateRef.current.floatingTexts = [];
    stateRef.current.spawnQueue = [];
    stateRef.current.timeSinceWaveStart = 0;
    stateRef.current.elapsedGameTime = 0;
    stateRef.current.intermissionTimer = 0;

    setFunds(400);
    setServerHealth(50);
    setCurrentWave(1);
    setWaveActive(false);
    setGameOver(false);
    setGameWon(false);
    setTowers([]);
    setIntermissionSeconds(null);
    setSelectedShopTowerType("firewall");
    setHoveredTile(null);
    setHoveredTower(null);
  }, []);

  const isOnPath = (x: number, y: number) => {
    return PATH.some((p) => p.x === x && p.y === y);
  };

  const getPositionOnPath = (progress: number): { x: number; y: number } => {
    if (progress <= 0) return { x: PATH[0].x, y: PATH[0].y };
    if (progress >= PATH.length - 1) {
      const end = PATH[PATH.length - 1];
      return { x: end.x, y: end.y };
    }
    const idx = Math.floor(progress);
    const sub = progress - idx;
    const p1 = PATH[idx];
    const p2 = PATH[idx + 1];
    return {
      x: p1.x + (p2.x - p1.x) * sub,
      y: p1.y + (p2.y - p1.y) * sub,
    };
  };

  // Place Selected Tower on empty, non-path tile
  const handleCellClick = (x: number, y: number) => {
    if (stateRef.current.gameOver || stateRef.current.gameWon) return;
    if (isOnPath(x, y)) return;
    if (stateRef.current.towers.some((t) => t.x === x && t.y === y)) return;

    const chosenType = selectedShopTowerType || "firewall";
    const config = TOWER_CONFIGS[chosenType];

    // Check unlock wave
    if (stateRef.current.currentWave < config.unlockWave) {
      stateRef.current.floatingTexts.push({
        id: Math.random().toString(),
        text: `NODE LOCKED (UNLOCKS WAVE ${config.unlockWave})`,
        x: x + 0.5,
        y: y + 0.5,
        color: "#f43f5e",
        life: 1.0,
        maxLife: 1.0,
      });
      return;
    }

    if (stateRef.current.funds < config.cost) {
      stateRef.current.floatingTexts.push({
        id: Math.random().toString(),
        text: `INSUFFICIENT FUNDS ($${config.cost} NEEDED)`,
        x: x + 0.5,
        y: y + 0.5,
        color: "#f43f5e",
        life: 1.0,
        maxLife: 1.0,
      });
      return;
    }

    stateRef.current.funds -= config.cost;
    setFunds(stateRef.current.funds);

    const newTower: Tower = {
      id: `tower_${Date.now()}_${Math.random()}`,
      type: chosenType,
      x,
      y,
      range: config.range,
      fireInterval: config.fireInterval,
      lastFireTime: -1,
    };

    stateRef.current.towers.push(newTower);
    setTowers([...stateRef.current.towers]);
    setHoveredTile(null);
    setHoveredTower(null);

    // Placement spark particles matching tower theme
    const sparkColor =
      chosenType === "decryption"
        ? "#facc15"
        : chosenType === "cryo"
          ? "#22d3ee"
          : chosenType === "logicBomb"
            ? "#f43f5e"
            : "#38bdf8";

    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const spd = 1.5 + Math.random() * 2;
      stateRef.current.particles.push({
        x: x + 0.5,
        y: y + 0.5,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2.5 + Math.random() * 2,
        color: sparkColor,
        life: 0.45,
        maxLife: 0.45,
      });
    }
  };

  // Start Specific Wave with Randomized Spawn Spacing
  const startWave = (waveToStart?: number) => {
    if (stateRef.current.gameOver || stateRef.current.gameWon) return;

    const targetWave = waveToStart ?? stateRef.current.currentWave;
    const enemyTypes = WAVE_SEQUENCES[targetWave] || WAVE_SEQUENCES[10];

    // Randomized delay (between 800ms and 1500ms) between individual enemy spawns
    let currentAccumulatedDelay = 0.5; // initial half-second breath
    stateRef.current.spawnQueue = enemyTypes.map((type, i) => {
      if (i > 0) {
        if (targetWave === 6) {
          // Wave 6: 15 Basic Viruses spawn rapidly (400ms - 650ms)
          currentAccumulatedDelay += 0.4 + Math.random() * 0.25;
        } else if (targetWave === 10) {
          // Wave 10: Boss spawns first, then worms trickle (1.6s - 2.4s)
          currentAccumulatedDelay += 1.6 + Math.random() * 0.8;
        } else {
          // Standard pacing: between 800ms and 1500ms (0.8s - 1.5s)
          currentAccumulatedDelay += 0.8 + Math.random() * 0.7;
        }
      }
      return {
        delay: currentAccumulatedDelay,
        config: createEnemyConfig(type, targetWave),
      };
    });

    stateRef.current.currentWave = targetWave;
    stateRef.current.timeSinceWaveStart = 0;
    stateRef.current.waveActive = true;
    stateRef.current.intermissionTimer = 0;

    setCurrentWave(targetWave);
    setWaveActive(true);
    setIntermissionSeconds(null);
  };

  // 60FPS requestAnimationFrame Loop: Smooth movement & Discrete Data-Packet Projectiles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    stateRef.current.lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - stateRef.current.lastTime) / 1000, 0.1);
      stateRef.current.lastTime = currentTime;

      const state = stateRef.current;
      state.elapsedGameTime += dt;
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / 12;

      // ─────────────────────────────────────────────
      // INTERMISSION 3-SECOND DELAY COUNTDOWN
      // ─────────────────────────────────────────────
      if (state.intermissionTimer > 0 && !state.gameOver && !state.gameWon) {
        state.intermissionTimer -= dt;
        const remainingCeil = Math.max(1, Math.ceil(state.intermissionTimer));
        setIntermissionSeconds(remainingCeil);

        if (state.intermissionTimer <= 0) {
          state.intermissionTimer = 0;
          setIntermissionSeconds(null);
          startWave(state.currentWave);
        }
      }

      // ─────────────────────────────────────────────
      // 1. SPAWN QUEUE & ENEMY PATH MOVEMENT
      // ─────────────────────────────────────────────
      if (state.waveActive && !state.gameOver && !state.gameWon) {
        state.timeSinceWaveStart += dt;

        for (let i = state.spawnQueue.length - 1; i >= 0; i--) {
          const item = state.spawnQueue[i];
          if (state.timeSinceWaveStart >= item.delay) {
            state.enemies.push({
              id: `enemy_${Date.now()}_${Math.random()}`,
              type: item.config.type,
              progress: 0,
              hp: item.config.hp,
              currentHp: item.config.hp,
              maxHp: item.config.maxHp,
              armor: item.config.armor,
              maxArmor: item.config.maxArmor,
              isTrojan: item.config.isTrojan,
              speedModifier: item.config.speedModifier,
              speed: item.config.speed,
              currentX: PATH[0].x,
              currentY: PATH[0].y,
              slowTimer: 0,
            });
            state.spawnQueue.splice(i, 1);
          }
        }

        // Helper: Handle enemy destruction and reward dispersion
        const handleDefeat = (defeatedEnemy: Enemy, atX: number, atY: number) => {
          const eIdx = state.enemies.indexOf(defeatedEnemy);
          if (eIdx === -1) return;
          state.enemies.splice(eIdx, 1);

          if (defeatedEnemy.isTrojan && defeatedEnemy.type === "trojan") {
            // Spawns 3 Micro-Worms at exact location
            const wormCfg = createEnemyConfig("worm", state.currentWave);
            for (let w = 0; w < 3; w++) {
              const wormProgress = Math.max(0, defeatedEnemy.progress - w * 0.16);
              const wormPos = getPositionOnPath(wormProgress);
              state.enemies.push({
                id: `worm_${Date.now()}_${w}_${Math.random()}`,
                type: "worm",
                progress: wormProgress,
                hp: wormCfg.hp,
                currentHp: wormCfg.hp,
                maxHp: wormCfg.maxHp,
                armor: 0,
                maxArmor: 0,
                isTrojan: false,
                speedModifier: 2.0,
                speed: wormCfg.speed,
                currentX: wormPos.x,
                currentY: wormPos.y,
                slowTimer: 0,
              });
            }

            for (let k = 0; k < 22; k++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 2.0 + Math.random() * 3.5;
              state.particles.push({
                x: atX,
                y: atY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: 3 + Math.random() * 2.5,
                color: Math.random() > 0.3 ? "#22c55e" : "#4ade80",
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.8,
              });
            }

            state.floatingTexts.push({
              id: Math.random().toString(),
              text: "TROJAN SHATTERED! MICRO-WORMS DETECTED!",
              x: atX,
              y: atY - 0.4,
              color: "#22c55e",
              life: 1.4,
              maxLife: 1.4,
            });
          } else if (defeatedEnemy.type === "boss") {
            // Boss defeat bounty: $200
            state.funds += 200;
            setFunds(state.funds);

            state.floatingTexts.push({
              id: Math.random().toString(),
              text: "ROGUE THREAD TERMINATED! +$200",
              x: atX,
              y: atY - 0.6,
              color: "#f59e0b",
              life: 2.2,
              maxLife: 2.2,
            });

            for (let k = 0; k < 45; k++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 2.5 + Math.random() * 5.0;
              state.particles.push({
                x: atX,
                y: atY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: 3.5 + Math.random() * 4,
                color: Math.random() > 0.5 ? "#c084fc" : "#f43f5e",
                life: 0.7 + Math.random() * 0.4,
                maxLife: 1.1,
              });
            }
          } else {
            // Standard kill bounties: Basic $15, Ransomware $20, Bloatware $25, Worm $5
            const bounty =
              defeatedEnemy.type === "bloatware"
                ? 25
                : defeatedEnemy.type === "ransomware"
                  ? 20
                  : defeatedEnemy.type === "worm"
                    ? 5
                    : 15;

            state.funds += bounty;
            setFunds(state.funds);

            state.floatingTexts.push({
              id: Math.random().toString(),
              text: `+$${bounty}`,
              x: atX,
              y: atY,
              color: "#34d399",
              life: 0.9,
              maxLife: 0.9,
            });

            const burstColor =
              defeatedEnemy.type === "bloatware"
                ? "#7f1d1d"
                : defeatedEnemy.type === "ransomware"
                  ? "#ca8a04"
                  : defeatedEnemy.type === "worm"
                    ? "#4ade80"
                    : "#ef4444";

            for (let k = 0; k < 15; k++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 1.5 + Math.random() * 3;
              state.particles.push({
                x: atX,
                y: atY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: 2.5 + Math.random() * 2.5,
                color: burstColor,
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.7,
              });
            }
          }
        };

        // Helper: Apply damage with source-specific rules
        const applyDamage = (
          target: Enemy,
          damage: number,
          source: TowerType,
          hitX: number,
          hitY: number,
        ) => {
          if (source === "decryption") {
            // Decryption Node: Exactly 16 damage exclusively to Yellow Armor!
            if (target.armor > 0) {
              if (target.armor >= 16) {
                target.armor -= 16;
              } else {
                const excess = 16 - target.armor;
                target.armor = 0;
                // Excess transitions proportionally to HP at 8 base damage rate
                target.hp -= 8 * (excess / 16);
                target.currentHp = target.hp;
              }

              // Yellow armor pierce sparks
              for (let s = 0; s < 7; s++) {
                state.particles.push({
                  x: hitX,
                  y: hitY,
                  vx: (Math.random() - 0.5) * 3.5,
                  vy: (Math.random() - 0.5) * 3.5,
                  size: 2 + Math.random() * 2,
                  color: "#facc15",
                  life: 0.3,
                  maxLife: 0.3,
                });
              }
            } else {
              // 8 base damage to HP
              target.hp -= 8;
              target.currentHp = target.hp;
              for (let s = 0; s < 5; s++) {
                state.particles.push({
                  x: hitX,
                  y: hitY,
                  vx: (Math.random() - 0.5) * 2.5,
                  vy: (Math.random() - 0.5) * 2.5,
                  size: 2 + Math.random() * 2,
                  color: "#eab308",
                  life: 0.25,
                  maxLife: 0.25,
                });
              }
            }
          } else {
            // Standard damage (Firewall 15 dmg, Logic Bomb 12/10 dmg)
            // Absorbed at 50% efficiency by armor
            if (target.armor > 0) {
              const armorDmg = damage * 0.5;
              if (target.armor >= armorDmg) {
                target.armor -= armorDmg;
              } else {
                const remainingArmor = target.armor;
                target.armor = 0;
                const leftoverRatio = (armorDmg - remainingArmor) / armorDmg;
                target.hp -= damage * leftoverRatio;
                target.currentHp = target.hp;
              }

              for (let s = 0; s < 6; s++) {
                state.particles.push({
                  x: hitX,
                  y: hitY,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  size: 2 + Math.random() * 2,
                  color: "#facc15",
                  life: 0.25,
                  maxLife: 0.25,
                });
              }
            } else {
              target.hp -= damage;
              target.currentHp = target.hp;

              const hitColor = source === "logicBomb" ? "#f43f5e" : "#38bdf8";
              for (let s = 0; s < 6; s++) {
                state.particles.push({
                  x: hitX,
                  y: hitY,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  size: 2 + Math.random() * 2,
                  color: hitColor,
                  life: 0.25,
                  maxLife: 0.25,
                });
              }
            }
          }

          if (target.hp <= 0) {
            handleDefeat(target, hitX, hitY);
          }
        };

        // Smooth movement along coordinates with Cryo 50% slow factor
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          const enemy = state.enemies[i];
          const isSlowed = enemy.slowTimer > 0;
          if (isSlowed) {
            enemy.slowTimer -= dt;
          }
          const effectiveSpeed = isSlowed ? enemy.speed * 0.5 : enemy.speed;
          enemy.progress += effectiveSpeed * dt;

          const pos = getPositionOnPath(enemy.progress);
          enemy.currentX = pos.x;
          enemy.currentY = pos.y;

          // Fragile Server Breach Penalty:
          // Basic/Bloatware: 10 dmg, Trojans: 25 dmg, Boss: 50 dmg
          if (enemy.progress >= PATH.length - 1) {
            state.enemies.splice(i, 1);
            const breachDamage = enemy.type === "trojan" ? 25 : enemy.type === "boss" ? 50 : 10;
            state.serverHealth = Math.max(0, state.serverHealth - breachDamage);
            setServerHealth(state.serverHealth);
            triggerBreachRef.current();

            state.floatingTexts.push({
              id: Math.random().toString(),
              text: `-${breachDamage} INTEGRITY`,
              x: 11.5,
              y: 11.0,
              color: "#f43f5e",
              life: 1.2,
              maxLife: 1.2,
            });

            for (let p = 0; p < 16; p++) {
              state.particles.push({
                x: 11.5,
                y: 11.5,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: 3 + Math.random() * 3,
                color: "#f43f5e",
                life: 0.5,
                maxLife: 0.5,
              });
            }

            if (state.serverHealth <= 0) {
              state.gameOver = true;
              state.waveActive = false;
              setGameOver(true);
              setWaveActive(false);
            }
          }
        }

        // ─────────────────────────────────────────────
        // 2. TOWER FIRING LOGIC (ALL 4 SPECIALIZED NODES)
        // ─────────────────────────────────────────────
        state.towers.forEach((tower) => {
          const config = TOWER_CONFIGS[tower.type];
          const fireInterval = config.fireInterval;

          if (state.elapsedGameTime - tower.lastFireTime >= fireInterval) {
            const towerCenterX = tower.x + 0.5;
            const towerCenterY = tower.y + 0.5;

            // ── A. CRYO-THREAD (CROWD CONTROL) ──
            // Pulse every 0.5s: 2 damage & applies 50% slow to all enemies within 2 tiles
            if (tower.type === "cryo") {
              let hitEnemies = 0;
              const enemiesSnapshot = [...state.enemies];
              enemiesSnapshot.forEach((enemy) => {
                const ex = enemy.currentX + 0.5;
                const ey = enemy.currentY + 0.5;
                const dist = Math.hypot(ex - towerCenterX, ey - towerCenterY);
                if (dist <= tower.range + 0.05) {
                  hitEnemies++;
                  enemy.slowTimer = 0.7; // Keep slowed while remaining in range
                  applyDamage(enemy, 2, "cryo", ex, ey);
                }
              });

              tower.lastFireTime = state.elapsedGameTime;

              // Frost pulse ring wave
              state.pulseWaves.push({
                x: towerCenterX,
                y: towerCenterY,
                radius: 0.2,
                maxRadius: tower.range,
                life: 0.35,
                maxLife: 0.35,
                color: "#22d3ee",
              });
              return;
            }

            // ── B. DECRYPTION NODE (ARMOR PIERCER) ──
            // Prioritizes enemies with Yellow Armor in range 3
            if (tower.type === "decryption") {
              let targetEnemy: Enemy | null = null;
              let bestScore = -999;

              for (const enemy of state.enemies) {
                const ex = enemy.currentX + 0.5;
                const ey = enemy.currentY + 0.5;
                const dist = Math.hypot(ex - towerCenterX, ey - towerCenterY);
                if (dist <= tower.range + 0.05) {
                  // Heavy preference for targets with armor
                  const score = (enemy.armor > 0 ? 1000 + enemy.armor : 0) - dist;
                  if (score > bestScore) {
                    bestScore = score;
                    targetEnemy = enemy;
                  }
                }
              }

              if (targetEnemy) {
                tower.lastFireTime = state.elapsedGameTime;
                state.projectiles.push({
                  id: `decryption_${Date.now()}_${Math.random()}`,
                  towerType: "decryption",
                  x: towerCenterX,
                  y: towerCenterY,
                  targetId: targetEnemy.id,
                  targetX: targetEnemy.currentX + 0.5,
                  targetY: targetEnemy.currentY + 0.5,
                  speed: 9.0,
                  damage: 8,
                });
              }
              return;
            }

            // ── C. LOGIC BOMB (AoE SPLASH) ──
            // Range 2, 2.5s fire rate: 12 target dmg + 10 splash to 1-tile radius
            if (tower.type === "logicBomb") {
              let targetEnemy: Enemy | null = null;
              let minDist = tower.range + 0.05;

              for (const enemy of state.enemies) {
                const ex = enemy.currentX + 0.5;
                const ey = enemy.currentY + 0.5;
                const dist = Math.hypot(ex - towerCenterX, ey - towerCenterY);
                if (dist <= minDist) {
                  minDist = dist;
                  targetEnemy = enemy;
                }
              }

              if (targetEnemy) {
                tower.lastFireTime = state.elapsedGameTime;
                state.projectiles.push({
                  id: `bomb_${Date.now()}_${Math.random()}`,
                  towerType: "logicBomb",
                  x: towerCenterX,
                  y: towerCenterY,
                  targetId: targetEnemy.id,
                  targetX: targetEnemy.currentX + 0.5,
                  targetY: targetEnemy.currentY + 0.5,
                  speed: 6.0,
                  damage: 12,
                  isSplash: true,
                  splashRadius: 1.0,
                  splashDamage: 10,
                });
              }
              return;
            }

            // ── D. BASIC FIREWALL ──
            // Range 3, 1 shot/s: 15 base damage
            let targetEnemy: Enemy | null = null;
            let minDist = tower.range + 0.05;

            for (const enemy of state.enemies) {
              const ex = enemy.currentX + 0.5;
              const ey = enemy.currentY + 0.5;
              const dist = Math.hypot(ex - towerCenterX, ey - towerCenterY);
              if (dist <= minDist) {
                minDist = dist;
                targetEnemy = enemy;
              }
            }

            if (targetEnemy) {
              tower.lastFireTime = state.elapsedGameTime;
              state.projectiles.push({
                id: `packet_${Date.now()}_${Math.random()}`,
                towerType: "firewall",
                x: towerCenterX,
                y: towerCenterY,
                targetId: targetEnemy.id,
                targetX: targetEnemy.currentX + 0.5,
                targetY: targetEnemy.currentY + 0.5,
                speed: 8.0,
                damage: 15,
              });
            }
          }
        });

        // ─────────────────────────────────────────────
        // 3. PROJECTILE FLIGHT & HITBOX INTERSECTION
        // ─────────────────────────────────────────────
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
          const proj = state.projectiles[i];

          // Update target position if enemy is still active
          const target = state.enemies.find((e) => e.id === proj.targetId);
          if (target) {
            proj.targetX = target.currentX + 0.5;
            proj.targetY = target.currentY + 0.5;
          }

          const dx = proj.targetX - proj.x;
          const dy = proj.targetY - proj.y;
          const dist = Math.hypot(dx, dy);

          // Hitbox intersection check (adjusted for larger enemies)
          const hitRadius =
            target?.type === "boss" ? 0.65 : target?.type === "bloatware" ? 0.55 : 0.38;

          if (dist < hitRadius || (!target && dist < 0.25)) {
            state.projectiles.splice(i, 1);

            // LOGIC BOMB DETONATION (1-TILE RADIUS SPLASH DAMAGE)
            if (proj.towerType === "logicBomb" || proj.isSplash) {
              const impactX = proj.x;
              const impactY = proj.y;

              // Explosion shockwave ring
              state.pulseWaves.push({
                x: impactX,
                y: impactY,
                radius: 0.2,
                maxRadius: 1.0,
                life: 0.4,
                maxLife: 0.4,
                color: "#f43f5e",
              });

              // Explosion spark burst
              for (let k = 0; k < 22; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 2 + Math.random() * 4;
                state.particles.push({
                  x: impactX,
                  y: impactY,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  size: 3 + Math.random() * 2.5,
                  color: Math.random() > 0.4 ? "#f43f5e" : "#fb923c",
                  life: 0.45 + Math.random() * 0.25,
                  maxLife: 0.7,
                });
              }

              state.floatingTexts.push({
                id: Math.random().toString(),
                text: "LOGIC BOMB SPLASH!",
                x: impactX,
                y: impactY - 0.35,
                color: "#f43f5e",
                life: 1.1,
                maxLife: 1.1,
              });

              // Apply 12 base damage to primary target
              if (target) {
                applyDamage(target, 12, "logicBomb", impactX, impactY);
              }

              // Apply 10 splash damage to all other enemies within 1-tile radius of impact
              const nearbyEnemies = state.enemies.filter(
                (e) =>
                  e !== target &&
                  Math.hypot(e.currentX + 0.5 - impactX, e.currentY + 0.5 - impactY) <= 1.05,
              );
              nearbyEnemies.forEach((nearby) => {
                applyDamage(nearby, 10, "logicBomb", nearby.currentX + 0.5, nearby.currentY + 0.5);
              });
            } else if (target) {
              // Direct single-target hit (Firewall or Decryption)
              applyDamage(target, proj.damage, proj.towerType, proj.x, proj.y);
            }
          } else {
            const moveStep = proj.speed * dt;
            proj.x += (dx / dist) * Math.min(moveStep, dist);
            proj.y += (dy / dist) * Math.min(moveStep, dist);
          }
        }

        // Wave completion & 3-Second Intermission Spawner Logic
        if (state.spawnQueue.length === 0 && state.enemies.length === 0) {
          state.waveActive = false;
          setWaveActive(false);

          if (state.currentWave >= 10) {
            state.gameWon = true;
            setGameWon(true);
          } else {
            // Initiate 3-second delay between waves
            state.currentWave += 1;
            state.funds += 50; // tuned wave bonus
            setFunds(state.funds);
            setCurrentWave(state.currentWave);

            state.intermissionTimer = 3.0; // 3-second delay
            setIntermissionSeconds(3);

            state.floatingTexts.push({
              id: Math.random().toString(),
              text: `WAVE CLEARED! +$50 · NEXT WAVE IN 3s`,
              x: 6,
              y: 6,
              color: "#38bdf8",
              life: 2.2,
              maxLife: 2.2,
            });
          }
        }
      }

      // ─────────────────────────────────────────────
      // 4. PARTICLES, PULSE WAVES & FLOATING TEXTS UPDATE
      // ─────────────────────────────────────────────
      for (let i = state.pulseWaves.length - 1; i >= 0; i--) {
        const pw = state.pulseWaves[i];
        pw.life -= dt;
        if (pw.life <= 0) state.pulseWaves.splice(i, 1);
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.life -= dt;
        ft.y -= 0.6 * dt;
        if (ft.life <= 0) state.floatingTexts.splice(i, 1);
      }

      // ─────────────────────────────────────────────
      // 5. CANVAS DRAWING (PULSES, PROJECTILES, BOSS & ENEMIES)
      // ─────────────────────────────────────────────
      ctx.clearRect(0, 0, width, height);

      // A. Expanding Pulse Waves (Cryo frost ripple & Bomb blast)
      state.pulseWaves.forEach((pw) => {
        ctx.save();
        const progress = Math.max(0, 1 - pw.life / pw.maxLife);
        const currentRadius = pw.radius + progress * (pw.maxRadius - pw.radius);
        const alpha = Math.max(0, pw.life / pw.maxLife);

        ctx.strokeStyle = pw.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pw.x * cellSize, pw.y * cellSize, currentRadius * cellSize, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = pw.color;
        ctx.globalAlpha = alpha * 0.15;
        ctx.fill();
        ctx.restore();
      });

      // B. Discrete Projectiles (Cyan Packets, Yellow Decryption Spikes, Red Logic Bombs)
      state.projectiles.forEach((proj) => {
        const px = proj.x * cellSize;
        const py = proj.y * cellSize;

        ctx.save();
        if (proj.towerType === "decryption") {
          // Yellow piercing diamond
          const size = cellSize * 0.3;
          ctx.shadowColor = "#facc15";
          ctx.shadowBlur = 9;
          ctx.fillStyle = "#eab308";
          ctx.beginPath();
          ctx.moveTo(px, py - size / 2);
          ctx.lineTo(px + size / 2, py);
          ctx.lineTo(px, py + size / 2);
          ctx.lineTo(px - size / 2, py);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (proj.towerType === "logicBomb") {
          // Red glowing heavy ordnance
          const size = cellSize * 0.34;
          ctx.shadowColor = "#f43f5e";
          ctx.shadowBlur = 10;
          ctx.fillStyle = "#e11d48";
          ctx.beginPath();
          ctx.arc(px, py, size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(px, py, size / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard Firewall cyan packet
          const size = cellSize * 0.28;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#0284c7";
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - size * 0.25, py - size * 0.25, size * 0.5, size * 0.5);
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1;
          ctx.strokeRect(px - size / 2, py - size / 2, size, size);
        }
        ctx.restore();
      });

      // C. Smoothly Interpolated Enemies (Boss + 4 Classes + Worms)
      state.enemies.forEach((enemy) => {
        const ex = enemy.currentX * cellSize + cellSize / 2;
        const ey = enemy.currentY * cellSize + cellSize / 2;

        ctx.save();
        ctx.translate(ex, ey);

        // Visual "Slowed" Frosted Halo if affected by Cryo-Thread
        if (enemy.slowTimer > 0) {
          ctx.save();
          ctx.strokeStyle = "#22d3ee";
          ctx.shadowColor = "#67e8f9";
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.45, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        if (enemy.type === "boss") {
          // ── BOSS: ROGUE THREAD (HP: 800, slow speed) ──
          const size = cellSize * 1.25;
          ctx.shadowColor = "#a855f7";
          ctx.shadowBlur = 14;

          ctx.fillStyle = "#1e1b4b"; // deep void purple
          ctx.fillRect(-size / 2, -size / 2, size, size);

          ctx.strokeStyle = "#c084fc";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-size / 2, -size / 2, size, size);

          // Corrupted inner processing core
          ctx.fillStyle = "#701a75";
          ctx.fillRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);

          // Menacing pulsating red core
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("ROGUE", 0, 0);
          ctx.restore();

          // Huge Boss Health Bar
          const barWidth = cellSize * 1.3;
          const barHeight = 6;
          const barX = ex - barWidth / 2;
          const barY = ey - size / 2 - 12;

          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.fillRect(barX, barY, barWidth, barHeight);
          ctx.fillStyle = "#a855f7";
          ctx.fillRect(
            barX,
            barY,
            barWidth * Math.max(0, enemy.currentHp / enemy.maxHp),
            barHeight,
          );
          ctx.strokeStyle = "#c084fc";
          ctx.lineWidth = 1;
          ctx.strokeRect(barX, barY, barWidth, barHeight);
        } else if (enemy.type === "bloatware") {
          // ── 1. BLOATWARE (BULKY): 1.5x larger, bg-red-900 ──
          const size = cellSize * 0.93; // 1.5x of basic (0.62 * 1.5)
          ctx.shadowColor = "#7f1d1d";
          ctx.shadowBlur = 10;

          ctx.fillStyle = "#7f1d1d"; // bg-red-900
          ctx.fillRect(-size / 2, -size / 2, size, size);

          ctx.strokeStyle = "#b91c1c";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-size / 2, -size / 2, size, size);

          // Bulky armor plates & corrupted core
          ctx.fillStyle = "#450a0a";
          ctx.fillRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);

          ctx.fillStyle = "#ef4444";
          ctx.fillRect(-size * 0.2, -size * 0.1, size * 0.15, size * 0.2);
          ctx.fillRect(size * 0.05, -size * 0.1, size * 0.15, size * 0.2);
          ctx.restore();

          // Health Bar
          const barWidth = cellSize * 0.98;
          const barHeight = 4;
          const barX = ex - barWidth / 2;
          const barY = ey - size / 2 - 9;

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(barX, barY, barWidth, barHeight);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(
            barX,
            barY,
            barWidth * Math.max(0, enemy.currentHp / enemy.maxHp),
            barHeight,
          );
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(barX, barY, barWidth, barHeight);
        } else if (enemy.type === "ransomware") {
          // ── 2. RANSOMWARE (ARMORED): hp: 30, armor: 100, lock motif ──
          const size = cellSize * 0.65;
          ctx.shadowColor = "#eab308";
          ctx.shadowBlur = 8;

          ctx.fillStyle = "#1e293b"; // armored dark steel
          ctx.fillRect(-size / 2, -size / 2, size, size);

          ctx.strokeStyle = enemy.armor > 0 ? "#eab308" : "#f43f5e";
          ctx.lineWidth = 2;
          ctx.strokeRect(-size / 2, -size / 2, size, size);

          // Padlock / Encryption motif
          ctx.fillStyle = enemy.armor > 0 ? "#facc15" : "#ef4444";
          ctx.fillRect(-size * 0.2, -size * 0.05, size * 0.4, size * 0.3);
          ctx.beginPath();
          ctx.arc(0, -size * 0.05, size * 0.16, Math.PI, 0);
          ctx.strokeStyle = enemy.armor > 0 ? "#facc15" : "#ef4444";
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.restore();

          // TWO BARS: Bright Yellow Armor Bar ABOVE Standard Red Health Bar
          const barWidth = cellSize * 0.74;
          const barHeight = 3.5;
          const barX = ex - barWidth / 2;
          const hpBarY = ey - size / 2 - 7;
          const armorBarY = hpBarY - 5;

          // Armor Bar (Bright Yellow) if armor exists
          if (enemy.maxArmor > 0) {
            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.fillRect(barX, armorBarY, barWidth, barHeight);

            const armorRatio = Math.max(0, enemy.armor / enemy.maxArmor);
            ctx.fillStyle = "#facc15"; // bright yellow armor bar
            ctx.fillRect(barX, armorBarY, barWidth * armorRatio, barHeight);

            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(barX, armorBarY, barWidth, barHeight);
          }

          // Red Health Bar
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(barX, hpBarY, barWidth, barHeight);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(
            barX,
            hpBarY,
            barWidth * Math.max(0, enemy.currentHp / enemy.maxHp),
            barHeight,
          );
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(barX, hpBarY, barWidth, barHeight);
        } else if (enemy.type === "trojan") {
          // ── 3. THE TROJAN: Camouflaged visually as green VIP data (bg-green-500) ──
          const size = cellSize * 0.65;
          ctx.shadowColor = "#22c55e";
          ctx.shadowBlur = 10;

          ctx.fillStyle = "#22c55e"; // bg-green-500
          ctx.fillRect(-size / 2, -size / 2, size, size);

          ctx.strokeStyle = "#86efac";
          ctx.lineWidth = 2;
          ctx.strokeRect(-size / 2, -size / 2, size, size);

          // "VIP" camouflage label
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("VIP", 0, 0);
          ctx.restore();

          // Green Health Bar
          const barWidth = cellSize * 0.74;
          const barHeight = 3.5;
          const barX = ex - barWidth / 2;
          const barY = ey - size / 2 - 7;

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(barX, barY, barWidth, barHeight);
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(
            barX,
            barY,
            barWidth * Math.max(0, enemy.currentHp / enemy.maxHp),
            barHeight,
          );
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(barX, barY, barWidth, barHeight);
        } else if (enemy.type === "worm") {
          // ── 4. MICRO-WORMS: Hyper-fast, smaller lime wriggler ──
          const size = cellSize * 0.38;
          ctx.shadowColor = "#4ade80";
          ctx.shadowBlur = 8;

          ctx.fillStyle = "#4ade80";
          ctx.fillRect(-size / 2, -size / 2, size, size);

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.strokeRect(-size / 2, -size / 2, size, size);
          ctx.restore();

          // Mini Health Bar
          const barWidth = cellSize * 0.45;
          const barHeight = 2.5;
          const barX = ex - barWidth / 2;
          const barY = ey - size / 2 - 5;

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(barX, barY, barWidth, barHeight);
          ctx.fillStyle = "#4ade80";
          ctx.fillRect(
            barX,
            barY,
            barWidth * Math.max(0, enemy.currentHp / enemy.maxHp),
            barHeight,
          );
        } else {
          // ── 5. BASIC VIRUS: hp: 30, bg-red-500 square ──
          const size = cellSize * 0.62;
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 9;

          ctx.fillStyle = "#ef4444"; // bg-red-500
          ctx.fillRect(-size / 2, -size / 2, size, size);

          ctx.strokeStyle = "#fecdd3";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-size / 2, -size / 2, size, size);

          // Virus inner corrupted pixels
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-size * 0.22, -size * 0.22, size * 0.16, size * 0.16);
          ctx.fillRect(size * 0.06, -size * 0.22, size * 0.16, size * 0.16);
          ctx.fillRect(-size * 0.2, size * 0.1, size * 0.4, size * 0.1);
          ctx.restore();

          // Standard Red Health Bar
          const barWidth = cellSize * 0.72;
          const barHeight = 3.5;
          const barX = ex - barWidth / 2;
          const barY = ey - size / 2 - 7;

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(barX, barY, barWidth, barHeight);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(
            barX,
            barY,
            barWidth * Math.max(0, enemy.currentHp / enemy.maxHp),
            barHeight,
          );
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
      });

      // C. Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // D. Floating Texts
      state.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.fillStyle = ft.color;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 5;
        ctx.fillText(ft.text, ft.x * cellSize, ft.y * cellSize);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      className={`relative min-h-screen w-full bg-slate-950 font-mono text-slate-200 p-4 sm:p-6 lg:pr-80 flex flex-col items-center select-none transition-transform ${
        isBreached ? "breach-shake" : ""
      }`}
    >
      <style>{`
        @keyframes breachShake {
          0% { transform: translate(0, 0) scale(1); }
          15% { transform: translate(-6px, 4px) scale(0.995); }
          30% { transform: translate(6px, -5px) scale(1.005); }
          50% { transform: translate(-5px, -3px) scale(0.998); }
          70% { transform: translate(5px, 3px) scale(1.002); }
          85% { transform: translate(-2px, 1px) scale(1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .breach-shake {
          animation: breachShake 200ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Gigs</span>
            </button>
          )}
          <div>
            <h1 className="text-sm sm:text-base font-black text-cyan-300 tracking-tight">
              ACTIVE JOB: NETWORK DEFENSE
            </h1>
          </div>
        </div>

        {/* Current Wave & Stats */}
        <div className="flex items-center gap-6 bg-slate-900/90 border border-slate-800 rounded-xl px-5 py-2.5 shadow-inner">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block uppercase">Current Wave</span>
            <span className="text-base font-bold text-amber-400">{currentWave} / 10</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block uppercase">Server Health</span>
            <span
              className={`text-base font-bold ${serverHealth > 25 ? "text-emerald-400" : "text-rose-500"}`}
            >
              {serverHealth} / 50
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block uppercase">Funds</span>
            <span className="text-base font-bold text-cyan-400">${funds}</span>
          </div>
        </div>

        <div>
          {!waveActive && !gameOver && !gameWon && intermissionSeconds === null && (
            <button
              onClick={() => startWave()}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 uppercase tracking-wider hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>START WAVE {currentWave}</span>
            </button>
          )}

          {intermissionSeconds !== null && (
            <button
              onClick={() => startWave()}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-slate-950 uppercase tracking-wider hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition cursor-pointer animate-pulse"
            >
              <FastForward className="h-4 w-4 fill-current" />
              <span>NEXT IN {intermissionSeconds}s (SKIP)</span>
            </button>
          )}

          {waveActive && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-2 text-xs font-bold text-amber-300 animate-pulse">
              ⚡ DEFENDING WAVE {currentWave}...
            </div>
          )}
        </div>
      </header>

      {/* Tactical Deployment Shop (4 Specialized Defense Nodes) */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {(Object.keys(TOWER_CONFIGS) as TowerType[]).map((tType) => {
          const cfg = TOWER_CONFIGS[tType];
          const isUnlocked = currentWave >= cfg.unlockWave;
          const isSelected = selectedShopTowerType === tType;
          const canAfford = funds >= cfg.cost;

          return (
            <div
              key={tType}
              title={!isUnlocked ? `Unlocks at Wave ${cfg.unlockWave}` : cfg.description}
              onClick={() => {
                if (!isUnlocked) return;
                setSelectedShopTowerType((prev) => (prev === tType ? null : tType));
              }}
              className={`relative rounded-xl border p-2.5 transition flex flex-col justify-between ${
                !isUnlocked
                  ? "grayscale opacity-50 bg-slate-900/40 border-slate-800 cursor-not-allowed select-none"
                  : isSelected
                    ? "bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                    : canAfford
                      ? "bg-slate-900/90 border-slate-800 hover:border-slate-600 hover:bg-slate-850 cursor-pointer"
                      : "bg-slate-900/60 border-slate-800/80 opacity-80 cursor-pointer"
              }`}
            >
              {/* Padlock Overlay for Locked Towers */}
              {!isUnlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 rounded-xl backdrop-blur-[1px] p-2 text-center">
                  <Lock className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-300">
                    Unlocks at Wave {cfg.unlockWave}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {tType === "firewall" && <Shield className="h-4 w-4 text-cyan-400" />}
                    {tType === "decryption" && <KeyRound className="h-4 w-4 text-yellow-400" />}
                    {tType === "cryo" && <Snowflake className="h-4 w-4 text-cyan-300" />}
                    {tType === "logicBomb" && <Bomb className="h-4 w-4 text-rose-500" />}
                    <span className="text-xs font-black text-slate-100">{cfg.name}</span>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 font-mono">${cfg.cost}</span>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight mb-2">{cfg.description}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px]">
                <span className="font-semibold text-slate-400">{cfg.badge}</span>
                {isUnlocked && (
                  <span
                    className={`px-1.5 py-0.5 rounded font-black uppercase text-[8px] ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 animate-pulse"
                        : canAfford
                          ? "bg-slate-800 text-slate-300"
                          : "bg-rose-950/50 text-rose-400"
                    }`}
                  >
                    {isSelected ? "ACTIVE" : canAfford ? "DEPLOY" : "NO FUNDS"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 12x12 Motherboard Grid & Pathing Container */}
      <div
        className={`relative rounded-2xl border bg-slate-900/90 p-3 sm:p-4 shadow-2xl backdrop-blur transition-all ${
          isBreached ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.7)]" : "border-slate-800"
        }`}
      >
        <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px]">
          {/* 12x12 CSS Grid representing the server architecture */}
          <div
            onMouseLeave={() => {
              setHoveredTile(null);
              setHoveredTower(null);
            }}
            className="grid grid-cols-12 grid-rows-12 gap-1 w-full h-full p-1 bg-slate-950 border border-slate-800 rounded-xl"
          >
            {Array.from({ length: 12 }).map((_, y) =>
              Array.from({ length: 12 }).map((_, x) => {
                const isPath = isOnPath(x, y);
                const pathIdx = PATH.findIndex((p) => p.x === x && p.y === y);
                const tower = towers.find((t) => t.x === x && t.y === y);

                // Range Visualizer Calculation:
                // Active when hovering an already-placed tower, OR clicking shop deploy & hovering grid
                const activeCenter = hoveredTower
                  ? { x: hoveredTower.x, y: hoveredTower.y }
                  : selectedShopTowerType && hoveredTile
                    ? hoveredTile
                    : null;

                const activeRange = hoveredTower
                  ? hoveredTower.range
                  : selectedShopTowerType
                    ? TOWER_CONFIGS[selectedShopTowerType].range
                    : 3;

                const inRange = Boolean(
                  activeCenter &&
                  Math.hypot(x - activeCenter.x, y - activeCenter.y) <= activeRange + 0.05,
                );
                const isCenter = Boolean(
                  activeCenter && activeCenter.x === x && activeCenter.y === y,
                );

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => {
                      if (tower) {
                        setHoveredTower(tower);
                        setHoveredTile(null);
                      } else {
                        setHoveredTile({ x, y });
                        setHoveredTower(null);
                      }
                    }}
                    className={`relative flex items-center justify-center rounded-sm transition-all ${
                      isPath
                        ? "bg-slate-800 border border-slate-700/60 shadow-inner"
                        : "bg-slate-900/60 border border-slate-800/50 hover:bg-slate-850 hover:border-cyan-500/50 cursor-pointer"
                    } ${isCenter ? "ring-2 ring-cyan-400 z-20" : ""}`}
                  >
                    {/* Semi-transparent range highlight over exact grid tiles within tower firing radius */}
                    {inRange && (
                      <div
                        className={`absolute inset-0 pointer-events-none rounded-sm transition-all duration-75 ${
                          isCenter
                            ? "bg-cyan-500/30 ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            : "bg-blue-500/20 border border-blue-400/50 shadow-[inset_0_0_8px_rgba(59,130,246,0.35)]"
                        }`}
                      />
                    )}

                    {/* Path Start and End indicators */}
                    {pathIdx === 0 && (
                      <span className="text-[7px] font-black text-cyan-400 relative z-10">IN</span>
                    )}
                    {pathIdx === PATH.length - 1 && (
                      <span className="text-[7px] font-black text-rose-500 relative z-10">
                        CORE
                      </span>
                    )}

                    {/* Specialized Tower Nodes Rendered with Distinct Icons */}
                    {tower && (
                      <div
                        className={`absolute inset-0.5 rounded-sm border flex items-center justify-center shadow-lg z-10 ${
                          tower.type === "firewall"
                            ? "bg-cyan-600/95 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)] text-cyan-100"
                            : tower.type === "decryption"
                              ? "bg-amber-500/95 border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.6)] text-amber-950"
                              : tower.type === "cryo"
                                ? "bg-sky-500/95 border-sky-200 shadow-[0_0_8px_rgba(14,165,233,0.6)] text-slate-950"
                                : "bg-rose-600/95 border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.6)] text-rose-100"
                        }`}
                      >
                        {tower.type === "firewall" && <Shield className="h-3 w-3 sm:h-4 sm:w-4" />}
                        {tower.type === "decryption" && (
                          <KeyRound className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        {tower.type === "cryo" && <Snowflake className="h-3 w-3 sm:h-4 sm:w-4" />}
                        {tower.type === "logicBomb" && <Bomb className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </div>
                    )}
                  </div>
                );
              }),
            )}
          </div>

          {/* Canvas Overlay for Smooth Enemy Movement & Discrete Projectiles */}
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="pointer-events-none absolute inset-0 w-full h-full p-1 block"
          />

          {/* Full-Board Crimson Breach Flash Overlay */}
          {isBreached && (
            <div
              key={breachKey}
              className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-red-600/40 border-2 border-red-500 shadow-[inset_0_0_50px_rgba(220,38,38,0.85)] animate-in fade-in duration-75"
            />
          )}
        </div>
      </div>

      {/* Right-Hand Fixed Sidebar: WAVE INTEL (Waves 1-10) */}
      <aside className="fixed right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-slate-800 p-4 z-30 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
              THREAT INTELLIGENCE
            </span>
            <h2 className="text-base font-black text-slate-100 tracking-wider flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-cyan-400" />
              <span>WAVE INTEL</span>
            </h2>
          </div>
          <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">
            WAVE {currentWave} / 10
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Active threat profiles scheduled to breach network perimeter this wave:
        </p>

        <div className="flex flex-col gap-2.5 flex-1">
          {Array.from(new Set(WAVE_SEQUENCES[currentWave] || [])).map((type) => {
            const cfg = createEnemyConfig(type, currentWave);
            const count = (WAVE_SEQUENCES[currentWave] || []).filter((t) => t === type).length;

            let name = "Basic Virus";
            let desc = "Standard malware speed";
            let icon = (
              <span className="h-3.5 w-3.5 rounded-sm bg-red-500 inline-block shadow-[0_0_6px_#ef4444] shrink-0" />
            );
            let hpBadge = `${cfg.hp} HP`;
            let traitBadge = "Standard speed";

            if (type === "boss") {
              name = "Rogue Thread (Boss)";
              desc = "Massive corrupted core";
              icon = (
                <span className="h-4 w-4 rounded-sm bg-purple-900 border border-purple-500 inline-block shadow-[0_0_8px_#a855f7] shrink-0" />
              );
              hpBadge = `${cfg.hp} HP`;
              traitBadge = "Slow Speed · 50 Dmg";
            } else if (type === "bloatware") {
              name = "Bloatware";
              desc = "50% slower speed";
              icon = (
                <span className="h-4 w-4 rounded-sm bg-red-900 border border-red-700 inline-block shadow-[0_0_6px_#7f1d1d] shrink-0" />
              );
              hpBadge = `${cfg.hp} HP`;
              traitBadge = "50% slower speed";
            } else if (type === "ransomware") {
              name = "Ransomware";
              desc = `Armor: ${cfg.armor}`;
              icon = (
                <span className="h-3.5 w-3.5 rounded-sm bg-yellow-500 inline-block shadow-[0_0_6px_#eab308] shrink-0" />
              );
              hpBadge = `${cfg.hp} HP`;
              traitBadge = `Armor: ${cfg.armor}`;
            } else if (type === "trojan") {
              name = "The Trojan";
              desc = "Splits on death";
              icon = (
                <span className="h-3.5 w-3.5 rounded-sm bg-green-500 inline-block shadow-[0_0_6px_#22c55e] shrink-0" />
              );
              hpBadge = `${cfg.hp} HP`;
              traitBadge = "Splits on death (25 Dmg)";
            } else if (type === "worm") {
              name = "Micro-Worm";
              desc = "Hyper-fast wriggler";
              icon = (
                <span className="h-3 w-3 rounded-sm bg-emerald-400 inline-block shadow-[0_0_6px_#34d399] shrink-0" />
              );
              hpBadge = `${cfg.hp} HP`;
              traitBadge = "2x Speed Trickle";
            }

            return (
              <div
                key={type}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-xs font-bold text-slate-100">{name}</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {count}x
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 rounded px-1.5 py-0.5">
                    {hpBadge}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 rounded px-1.5 py-0.5">
                    {traitBadge}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  Trait: <span className="text-slate-300 font-medium">{desc}</span>
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-slate-800 pt-3 text-[10px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Kill Bounty:</span>
            <span className="font-bold text-emerald-400">+$5 to +$200</span>
          </div>
          <div className="flex justify-between">
            <span>Server Health:</span>
            <span className="font-bold text-rose-400">50 Max Integrity</span>
          </div>
          <div className="flex justify-between">
            <span>Breach Penalty:</span>
            <span className="font-bold text-rose-500">-10 to -25 (-50 Boss)</span>
          </div>
        </div>
      </aside>

      {/* Game Over / Victory Modal */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl">
            {gameWon ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/25 border border-emerald-500 text-emerald-400">
                  <Award className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-emerald-300 uppercase tracking-wider">
                  NETWORK SECURED!
                </h2>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  All 10 waves of advanced cyber threats repelled. Network Defense contract
                  completed with excellence!
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      if (onComplete) onComplete();
                    }}
                    className="flex-1 rounded-xl bg-emerald-500 py-3 text-xs font-black uppercase text-slate-950 tracking-wider hover:bg-emerald-400 transition cursor-pointer"
                  >
                    Collect Payout ($5,000) →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/25 border border-rose-500 text-rose-400">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-rose-400 uppercase tracking-wider">
                  SYSTEM BREACHED
                </h2>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Malware viruses breached server defenses. Server health dropped to 0%!
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={resetGame}
                    className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-black uppercase text-slate-200 hover:bg-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Try Again</span>
                  </button>
                  {onExit && (
                    <button
                      onClick={onExit}
                      className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-black uppercase text-white hover:bg-rose-500 transition cursor-pointer"
                    >
                      Quit to Gigs
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
