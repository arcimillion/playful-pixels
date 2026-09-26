import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, ArrowLeft, RefreshCw, Volume2, VolumeX, Skull, Flame, Zap } from "lucide-react";
import { ATTACK_TYPES, type AttackType, pickRandomAttack } from "./attacks";

interface TheTypoExorcistProps {
  onExit?: () => void;
  debt?: number;
}

// Normal lowercase sentences (no leetspeak, no numbers)
const CURSED_SENTENCES = [
  "the cold knows",
  "the void hungers",
  "leave this place",
  "return to dust",
  "shadows consume",
  "dont look back",
  "your soul is mine",
  "stay with us",
  "no exit here",
  "it feeds on fear",
  "forget your name",
  "we are inside",
  "death is patient",
  "whispers in the dark",
  "darkness takes all",
  "the silence screams",
  "blood on the floor",
  "ashes and bone",
  "eyes in the mist",
  "breathe your last",
  "beneath the earth",
  "time has expired",
  "embrace the cold",
  "no prayer remains",
  "listen to the wind",
];

function reverseString(str: string): string {
  return str.split("").reverse().join("");
}

interface SpiritEntity {
  id: number;
  x: number;
  y: number;
  speed: number;
  sentence: string;
  reverseSentence: string;
  displayedText: string;
  typedIndex: number;
  typewriterTimer: number;
  auraPhase: number;
  isBoss: boolean;
  bossTitle?: string;
  scale: number;
  alive: boolean;
  attackCooldown: number;
  color: string;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
}

interface GroundWave {
  id: number;
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  color: string;
  life: number;
}

interface ShadowHand {
  id: number;
  x: number;
  y: number;
  timer: number;
  rise: number;
  active: boolean;
  color: string;
}

interface Shockwave {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
}

interface TeleportProjection {
  id: number;
  spiritId: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  timer: number;
  maxTimer: number;
  color: string;
  scale: number;
  isBoss: boolean;
}

interface BossChargeWave {
  id: number;
  spiritId: number;
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  color: string;
  scale: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface SpellBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  color: string;
}

function createAudioContext() {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
}

export default function TheTypoExorcist({ onExit }: TheTypoExorcistProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game UI State
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover" | "victory">("start");
  const [level, setLevel] = useState(1);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [audioMuted, setAudioMuted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [penaltyFlash, setPenaltyFlash] = useState(false);
  const [distortionEffect, setDistortionEffect] = useState(0);

  // Active enemies summary for footer whisper indicator
  const [activeWhispers, setActiveWhispers] = useState<string[]>([]);
  const [isBossLevel, setIsBossLevel] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
      if (audioMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Audio error suppression
      }
    },
    [audioMuted, getAudioContext],
  );

  const playSound = useCallback(
    (
      kind:
        "type" | "spell" | "error" | "penalty" | "hit" | "victory" | "appear" | "attack" | "boss",
    ) => {
      if (kind === "type") {
        playTone(320 + Math.random() * 80, "square", 0.04, 0.03);
      } else if (kind === "spell") {
        playTone(550, "sine", 0.1, 0.12);
        setTimeout(() => playTone(950, "triangle", 0.25, 0.15), 50);
        setTimeout(() => playTone(1200, "sine", 0.35, 0.18), 110);
      } else if (kind === "penalty") {
        playTone(150, "sawtooth", 0.15, 0.15);
        setTimeout(() => playTone(80, "sawtooth", 0.2, 0.2), 60);
      } else if (kind === "error") {
        playTone(180, "sawtooth", 0.2, 0.12);
        setTimeout(() => playTone(120, "sawtooth", 0.25, 0.12), 80);
      } else if (kind === "hit") {
        playTone(90, "sawtooth", 0.35, 0.25);
      } else if (kind === "appear") {
        playTone(240, "sine", 0.4, 0.06);
      } else if (kind === "attack") {
        playTone(400, "sawtooth", 0.1, 0.08);
      } else if (kind === "boss") {
        playTone(80, "sawtooth", 0.6, 0.3);
        setTimeout(() => playTone(60, "sawtooth", 0.8, 0.3), 200);
      } else if (kind === "victory") {
        [440, 554.37, 659.25, 880, 1108.7].forEach((f, i) => {
          setTimeout(() => playTone(f, "triangle", 0.3, 0.12), i * 110);
        });
      }
    },
    [playTone],
  );

  // Engine state in mutable ref for 60FPS loop
  const engineRef = useRef({
    level: 1,
    player: {
      x: 450,
      y: 380,
      vx: 0,
      vy: 0,
      speed: 4.5,
      w: 32,
      h: 52,
      invulnTimer: 0,
    },
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    },
    spirits: [] as SpiritEntity[],
    teleportProjections: [] as TeleportProjection[],
    bossChargeWaves: [] as BossChargeWave[],
    projectiles: [] as Projectile[],
    groundWaves: [] as GroundWave[],
    shadowHands: [] as ShadowHand[],
    shockwaves: [] as Shockwave[],
    particles: [] as Particle[],
    spells: [] as SpellBeam[],
    screenShake: 0,
    entityIdCounter: 1,
    canvasWidth: 900,
    canvasHeight: 550,
  });

  // Spawn enemy spirits for current level
  // 1 spirit per level (can be 2 at a time on level 4+ or boss, but no multistage health levels)
  const spawnLevelEnemies = useCallback(
    (lvl: number) => {
      const engine = engineRef.current;
      const isBoss = lvl % 5 === 0;
      setIsBossLevel(isBoss);

      // On level 3+ or boss, can have up to 2 active spirits at a time
      const spiritCount = isBoss ? 2 : lvl >= 3 && Math.random() < 0.5 ? 2 : 1;
      const createdSpirits: SpiritEntity[] = [];

      const usedSentences = new Set<string>();

      for (let i = 0; i < spiritCount; i++) {
        let sentence = CURSED_SENTENCES[Math.floor(Math.random() * CURSED_SENTENCES.length)];
        while (usedSentences.has(sentence)) {
          sentence = CURSED_SENTENCES[Math.floor(Math.random() * CURSED_SENTENCES.length)];
        }
        usedSentences.add(sentence);

        const reverseSentence = reverseString(sentence);
        const bossTitles = [
          "ARCH-DEMON AZAZEL",
          "THE ABYSSAL REVENANT",
          "LORD OF THE EMPTY VOID",
          "THE NAMELESS CORRUPTION",
          "FINAL ABOMINATION",
        ];
        const bossTitle = isBoss
          ? bossTitles[Math.floor((lvl / 5 - 1) % bossTitles.length)] || `BOSS LEVEL ${lvl}`
          : `SPIRIT TIER ${lvl}`;

        const spawnX =
          spiritCount === 1
            ? engine.canvasWidth * 0.5 + (Math.random() * 160 - 80)
            : i === 0
              ? engine.canvasWidth * 0.3 + (Math.random() * 80 - 40)
              : engine.canvasWidth * 0.7 + (Math.random() * 80 - 40);

        const newEnemy: SpiritEntity = {
          id: engine.entityIdCounter++,
          x: spawnX,
          y: 130 + (i % 2) * 30,
          speed: 0.5 + Math.min(0.9, lvl * 0.07),
          sentence,
          reverseSentence,
          displayedText: "",
          typedIndex: 0,
          typewriterTimer: 0,
          auraPhase: Math.random() * Math.PI * 2,
          isBoss,
          bossTitle,
          scale: isBoss ? 1.35 : 1.0,
          alive: true,
          attackCooldown: Math.max(90, 210 - lvl * 12 + Math.floor(Math.random() * 50)),
          color: isBoss ? "#ef4444" : lvl % 2 === 0 ? "#f97316" : "#a855f7",
        };

        createdSpirits.push(newEnemy);
      }

      engine.spirits = createdSpirits;
      engine.teleportProjections = [];
      engine.bossChargeWaves = [];
      engine.projectiles = [];
      engine.groundWaves = [];
      engine.shadowHands = [];
      engine.shockwaves = [];

      setActiveWhispers(createdSpirits.map((s) => s.sentence));

      if (isBoss) {
        playSound("boss");
        engine.screenShake = 15;
      } else {
        playSound("appear");
      }
    },
    [playSound],
  );

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    const engine = engineRef.current;
    engine.level = 1;
    engine.player.x = 450;
    engine.player.y = 380;
    engine.player.invulnTimer = 0;
    engine.teleportProjections = [];
    engine.bossChargeWaves = [];
    engine.particles = [];
    engine.spells = [];
    engine.screenShake = 0;

    setLevel(1);
    setHearts(5);
    setScore(0);
    setInputVal("");
    setFeedbackMsg(null);
    setPenaltyFlash(false);
    setGameState("playing");

    setTimeout(() => {
      spawnLevelEnemies(1);
    }, 300);
  }, [spawnLevelEnemies]);

  // Execute an attack from a spirit based on attacks.ts
  const executeEnemyAttack = useCallback(
    (enemy: SpiritEntity, lvl: number) => {
      const engine = engineRef.current;
      const attackType: AttackType = pickRandomAttack(lvl, enemy.isBoss);

      playSound("attack");

      if (attackType === ATTACK_TYPES.PROJECTILE) {
        const dx = engine.player.x - enemy.x;
        const dy = engine.player.y - enemy.y;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 3.5 + Math.min(2.5, lvl * 0.25);

        engine.projectiles.push({
          id: engine.entityIdCounter++,
          x: enemy.x,
          y: enemy.y,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
          radius: enemy.isBoss ? 15 : 10,
          color: enemy.isBoss ? "#ef4444" : "#f43f5e",
          life: 180,
        });
      } else if (attackType === ATTACK_TYPES.GROUND_CURSE) {
        const fromLeft = Math.random() < 0.5;
        const speed = 3.8 + lvl * 0.25;
        engine.groundWaves.push({
          id: engine.entityIdCounter++,
          x: fromLeft ? 20 : engine.canvasWidth - 20,
          y: engine.canvasHeight - 90,
          vx: fromLeft ? speed : -speed,
          width: 50,
          height: 35,
          color: "#9333ea",
          life: 200,
        });
      } else if (attackType === ATTACK_TYPES.SPIRIT_DASH) {
        // Project where they are going to teleport for 1 second (60 frames) before teleporting
        const targetX = Math.max(
          80,
          Math.min(engine.canvasWidth - 80, engine.player.x + (Math.random() > 0.5 ? 200 : -200)),
        );
        const targetY = Math.max(
          90,
          Math.min(engine.canvasHeight - 160, enemy.y + (Math.random() * 80 - 40)),
        );

        engine.teleportProjections.push({
          id: engine.entityIdCounter++,
          spiritId: enemy.id,
          fromX: enemy.x,
          fromY: enemy.y,
          toX: targetX,
          toY: targetY,
          timer: 60, // 60 frames = exactly 1.0 second
          maxTimer: 60,
          color: enemy.color,
          scale: enemy.scale,
          isBoss: enemy.isBoss,
        });
      } else if (attackType === ATTACK_TYPES.SHADOW_HANDS) {
        const targetX = engine.player.x + (Math.random() * 100 - 50);
        engine.shadowHands.push({
          id: engine.entityIdCounter++,
          x: Math.max(60, Math.min(engine.canvasWidth - 60, targetX)),
          y: engine.canvasHeight - 80,
          timer: 0,
          rise: 0,
          active: true,
          color: "#ef4444",
        });
      } else if (attackType === ATTACK_TYPES.DISTORTION) {
        setDistortionEffect(1);
        setTimeout(() => setDistortionEffect(0), 1600);
      } else if (attackType === ATTACK_TYPES.SHOCKWAVE) {
        // Telegraph the boss energy wave attack before boss uses it by showing aura around the boss (60 frames = 1s)
        engine.bossChargeWaves.push({
          id: engine.entityIdCounter++,
          spiritId: enemy.id,
          x: enemy.x,
          y: enemy.y,
          timer: 60, // 1.0s charge
          maxTimer: 60,
          color: "#ef4444",
          scale: enemy.scale,
        });
      }
    },
    [playSound],
  );

  // Handle Exorcism spell submission on Enter
  const handleExorcismSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (gameState !== "playing") return;

      const trimmed = inputVal.trim().toLowerCase();
      if (!trimmed) return;

      const engine = engineRef.current;
      const targetIndex = engine.spirits.findIndex(
        (sp) => sp.alive && trimmed === sp.reverseSentence.toLowerCase(),
      );

      if (targetIndex !== -1) {
        // Successful reverse exorcism chant on target spirit!
        const target = engine.spirits[targetIndex];
        playSound("spell");

        // Radiant exorcism beam
        engine.spells.push({
          startX: engine.player.x,
          startY: engine.player.y - 15,
          endX: target.x,
          endY: target.y,
          progress: 0,
          color: "#22d3ee",
        });

        // Shake the screen when we shoot our beam to add impact!
        engine.screenShake = 18;

        // Recoil burst particles at player hands
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const sp = 2 + Math.random() * 4;
          engine.particles.push({
            x: engine.player.x,
            y: engine.player.y - 15,
            vx: Math.cos(angle) * sp,
            vy: Math.sin(angle) * sp,
            life: 0.4,
            maxLife: 0.4,
            color: "#38bdf8",
            size: 2.5,
          });
        }

        // Burst particles at enemy
        for (let i = 0; i < 45; i++) {
          const angle = Math.random() * Math.PI * 2;
          const sp = 2 + Math.random() * 6;
          engine.particles.push({
            x: target.x,
            y: target.y,
            vx: Math.cos(angle) * sp,
            vy: Math.sin(angle) * sp,
            life: 0.8 + Math.random() * 0.5,
            maxLife: 1.3,
            color: i % 2 === 0 ? "#22d3ee" : "#f43f5e",
            size: 2 + Math.random() * 5,
          });
        }

        // ONE STRIKE PURGE: No multistage health bar loops
        target.alive = false;
        engine.spirits.splice(targetIndex, 1);

        setScore((s) => s + (target.isBoss ? 1200 : 400) + level * 50);
        setInputVal("");
        setFeedbackMsg({ text: "PURGED IN REVERSE! ✦", ok: true });
        setTimeout(() => setFeedbackMsg(null), 1200);

        // Update remaining whispers
        const remainingWhispers = engine.spirits.map((s) => s.sentence);
        setActiveWhispers(remainingWhispers);

        // If all spirits for this level are purged, advance level immediately
        if (engine.spirits.length === 0) {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          engine.level = nextLvl;

          setFeedbackMsg({
            text: target.isBoss
              ? `★ BOSS DEFEATED! ADVANCING TO LEVEL ${nextLvl} ★`
              : `LEVEL ${level} CLEARED!`,
            ok: true,
          });

          setTimeout(() => {
            setFeedbackMsg(null);
            spawnLevelEnemies(nextLvl);
          }, 1400);
        }
      } else {
        // INCORRECT SPELL
        playSound("error");
        setFeedbackMsg({ text: "SPELL FAILED! MATCH REVERSE CHANT!", ok: false });
        setTimeout(() => setFeedbackMsg(null), 1000);
        engine.screenShake = 4;
      }
    },
    [gameState, inputVal, level, playSound, spawnLevelEnemies],
  );

  // High-Stakes Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      const engine = engineRef.current;

      // Player Arrow Navigation
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        engine.keys[e.key] = true;
        return;
      }

      // High-Stakes Backspace Penalty: Removes exactly 5 characters
      if (e.key === "Backspace") {
        e.preventDefault();
        playSound("penalty");
        setPenaltyFlash(true);
        setTimeout(() => setPenaltyFlash(false), 250);

        setInputVal((prev) => (prev.length <= 5 ? "" : prev.slice(0, -5)));
        return;
      }

      // Spacebar adds normal space character (" ")
      if (e.key === " ") {
        e.preventDefault();
        playSound("type");
        setInputVal((prev) => prev + " ");
        return;
      }

      // Enter submits exorcism chant
      if (e.key === "Enter") {
        e.preventDefault();
        handleExorcismSubmit();
        return;
      }

      // Single character input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        playSound("type");
        setInputVal((prev) => prev + e.key.toLowerCase());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        engine.keys[e.key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, handleExorcismSubmit, playSound]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const engine = engineRef.current;
      const w = canvas.width;
      const h = canvas.height;
      engine.canvasWidth = w;
      engine.canvasHeight = h;

      ctx.save();

      // Screen shake
      if (engine.screenShake > 0) {
        const shakeMag = engine.screenShake;
        ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
        engine.screenShake *= 0.88;
        if (engine.screenShake < 0.2) engine.screenShake = 0;
      }

      // Dark Cathedral Floor & Backdrop
      ctx.fillStyle = "#030205";
      ctx.fillRect(0, 0, w, h);

      // Gothic Arched Windows
      ctx.strokeStyle = "rgba(50, 20, 30, 0.4)";
      ctx.fillStyle = "rgba(18, 8, 14, 0.6)";
      ctx.lineWidth = 2.5;

      const windowPositions = [w * 0.18, w * 0.5, w * 0.82];
      windowPositions.forEach((wx) => {
        const wy = 60;
        const ww = 80;
        const wh = 140;

        ctx.beginPath();
        ctx.moveTo(wx - ww / 2, wy + wh);
        ctx.lineTo(wx - ww / 2, wy + 40);
        ctx.arc(wx, wy + 40, ww / 2, Math.PI, 0, false);
        ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx, wy + wh);
        ctx.moveTo(wx - ww / 2, wy + 55);
        ctx.lineTo(wx + ww / 2, wy + 55);
        ctx.stroke();
      });

      // Atmospheric floor stone grid
      ctx.strokeStyle = "rgba(60, 25, 35, 0.3)";
      ctx.lineWidth = 1;
      for (let y = 140; y < h; y += 65) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ─── GAMEPLAY LOGIC & ENTITY UPDATES ───
      if (gameState === "playing") {
        const p = engine.player;

        // Player Movement via Arrow Keys
        let dx = 0;
        let dy = 0;
        if (engine.keys.ArrowLeft) dx -= 1;
        if (engine.keys.ArrowRight) dx += 1;
        if (engine.keys.ArrowUp) dy -= 1;
        if (engine.keys.ArrowDown) dy += 1;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        p.vx = dx * p.speed;
        p.vy = dy * p.speed;
        p.x += p.vx;
        p.y += p.vy;

        p.x = Math.max(30, Math.min(w - 30, p.x));
        p.y = Math.max(70, Math.min(h - 90, p.y));

        if (p.invulnTimer > 0) p.invulnTimer--;

        // Update Active Enemy Spirits
        engine.spirits.forEach((enemy) => {
          if (!enemy.alive) return;

          const distDx = p.x - enemy.x;
          const distDy = p.y - 100 - enemy.y;
          const dist = Math.hypot(distDx, distDy) || 1;

          enemy.x += (distDx / dist) * enemy.speed;
          enemy.y += (distDy / dist) * (enemy.speed * 0.6);
          enemy.auraPhase += 0.05;

          // Deliberate Typewriter Whisper
          enemy.typewriterTimer++;
          if (enemy.typewriterTimer % 5 === 0 && enemy.typedIndex < enemy.sentence.length) {
            enemy.typedIndex++;
            enemy.displayedText = enemy.sentence.substring(0, enemy.typedIndex);
          }

          // Enemy attack cooldown
          enemy.attackCooldown--;
          if (enemy.attackCooldown <= 0) {
            executeEnemyAttack(enemy, engine.level);
            enemy.attackCooldown = Math.max(
              80,
              210 - engine.level * 12 + Math.floor(Math.random() * 60),
            );
          }

          // Direct collision damage with player
          if (p.invulnTimer <= 0 && dist < 42 * enemy.scale) {
            playSound("hit");
            engine.screenShake = 12;
            p.invulnTimer = 70;
            p.x -= (distDx / dist) * 50;
            p.y -= (distDy / dist) * 50;

            setHearts((prev) => {
              const next = prev - 1;
              if (next <= 0) setGameState("gameover");
              return next;
            });
          }
        });

        // Update Projectiles
        engine.projectiles.forEach((proj, idx) => {
          proj.x += proj.vx;
          proj.y += proj.vy;
          proj.life--;

          const pDist = Math.hypot(proj.x - p.x, proj.y - (p.y - 10));
          if (p.invulnTimer <= 0 && pDist < proj.radius + 18) {
            playSound("hit");
            engine.screenShake = 10;
            p.invulnTimer = 70;
            proj.life = 0;

            setHearts((prev) => {
              const next = prev - 1;
              if (next <= 0) setGameState("gameover");
              return next;
            });
          }

          if (proj.life <= 0 || proj.x < 0 || proj.x > w || proj.y < 0 || proj.y > h) {
            engine.projectiles.splice(idx, 1);
          }
        });

        // Update Ground Waves
        engine.groundWaves.forEach((gw, idx) => {
          gw.x += gw.vx;
          gw.life--;

          if (p.invulnTimer <= 0 && Math.abs(gw.x - p.x) < gw.width / 2 + 16 && p.y > h - 140) {
            playSound("hit");
            engine.screenShake = 10;
            p.invulnTimer = 70;
            gw.life = 0;

            setHearts((prev) => {
              const next = prev - 1;
              if (next <= 0) setGameState("gameover");
              return next;
            });
          }

          if (gw.life <= 0 || gw.x < -100 || gw.x > w + 100) {
            engine.groundWaves.splice(idx, 1);
          }
        });

        // Update Shadow Hands
        engine.shadowHands.forEach((hand, idx) => {
          hand.timer++;
          if (hand.timer < 30) {
            hand.rise = 0;
          } else if (hand.timer < 65) {
            hand.rise = Math.min(80, (hand.timer - 30) * 4);
            if (hand.active && p.invulnTimer <= 0 && Math.abs(hand.x - p.x) < 32 && p.y > h - 150) {
              playSound("hit");
              engine.screenShake = 10;
              p.invulnTimer = 70;
              hand.active = false;

              setHearts((prev) => {
                const next = prev - 1;
                if (next <= 0) setGameState("gameover");
                return next;
              });
            }
          } else {
            hand.rise = Math.max(0, hand.rise - 3);
            if (hand.timer > 95) {
              engine.shadowHands.splice(idx, 1);
            }
          }
        });

        // Update Shockwaves
        engine.shockwaves.forEach((sw, idx) => {
          sw.radius += 6;
          sw.opacity = Math.max(0, 1 - sw.radius / sw.maxRadius);

          const swDist = Math.hypot(sw.x - p.x, sw.y - p.y);
          if (p.invulnTimer <= 0 && Math.abs(swDist - sw.radius) < 18) {
            playSound("hit");
            engine.screenShake = 12;
            p.invulnTimer = 70;

            setHearts((prev) => {
              const next = prev - 1;
              if (next <= 0) setGameState("gameover");
              return next;
            });
          }

          if (sw.radius >= sw.maxRadius) {
            engine.shockwaves.splice(idx, 1);
          }
        });

        // Update Teleport Projections (1 second telegraph before warp)
        engine.teleportProjections.forEach((proj, idx) => {
          proj.timer--;

          const parentSpirit = engine.spirits.find((s) => s.id === proj.spiritId);
          if (parentSpirit && parentSpirit.alive) {
            proj.fromX = parentSpirit.x;
            proj.fromY = parentSpirit.y;
          }

          if (proj.timer <= 0) {
            if (parentSpirit && parentSpirit.alive) {
              parentSpirit.x = proj.toX;
              parentSpirit.y = proj.toY;
              engine.screenShake = 6;
              playSound("appear");

              for (let i = 0; i < 24; i++) {
                const ang = Math.random() * Math.PI * 2;
                const sp = 2 + Math.random() * 5;
                engine.particles.push({
                  x: proj.toX,
                  y: proj.toY,
                  vx: Math.cos(ang) * sp,
                  vy: Math.sin(ang) * sp,
                  life: 0.6,
                  maxLife: 0.6,
                  color: proj.color,
                  size: 3,
                });
              }
            }
            engine.teleportProjections.splice(idx, 1);
          }
        });
        // Update Boss Energy Wave Charge (1.0s Telegraph with raging aura)
        engine.bossChargeWaves.forEach((charge, idx) => {
          charge.timer--;

          const parentSpirit = engine.spirits.find((s) => s.id === charge.spiritId);
          if (parentSpirit && parentSpirit.alive) {
            charge.x = parentSpirit.x;
            charge.y = parentSpirit.y;

            // Inward swirling charge particles
            if (Math.random() < 0.6) {
              const ang = Math.random() * Math.PI * 2;
              const dist = 70 * charge.scale;
              engine.particles.push({
                x: charge.x + Math.cos(ang) * dist,
                y: charge.y + Math.sin(ang) * dist,
                vx: -Math.cos(ang) * 4,
                vy: -Math.sin(ang) * 4,
                life: 0.35,
                maxLife: 0.35,
                color: Math.random() > 0.5 ? "#ef4444" : "#fbbf24",
                size: 2.5,
              });
            }
          }

          if (charge.timer <= 0) {
            // Charge complete -> Unleash the massive Energy Wave Shockwave!
            if (parentSpirit && parentSpirit.alive) {
              playSound("boss");
              engine.screenShake = 18; // Heavy impact screen shake!

              // Unleash expanding radial shockwave
              engine.shockwaves.push({
                id: engine.entityIdCounter++,
                x: charge.x,
                y: charge.y,
                radius: 15,
                maxRadius: 300,
                color: "#dc2626",
                opacity: 1,
              });

              // Unleash floor waves surging left & right
              engine.groundWaves.push({
                id: engine.entityIdCounter++,
                x: charge.x,
                y: h - 90,
                vx: -5.5,
                width: 60,
                height: 40,
                color: "#dc2626",
                life: 200,
              });
              engine.groundWaves.push({
                id: engine.entityIdCounter++,
                x: charge.x,
                y: h - 90,
                vx: 5.5,
                width: 60,
                height: 40,
                color: "#dc2626",
                life: 200,
              });

              // Outward explosion particles
              for (let i = 0; i < 35; i++) {
                const ang = Math.random() * Math.PI * 2;
                const sp = 3 + Math.random() * 6;
                engine.particles.push({
                  x: charge.x,
                  y: charge.y,
                  vx: Math.cos(ang) * sp,
                  vy: Math.sin(ang) * sp,
                  life: 0.6,
                  maxLife: 0.6,
                  color: "#ef4444",
                  size: 4,
                });
              }
            }
            engine.bossChargeWaves.splice(idx, 1);
          }
        });
      }

      // ─── DRAW BOSS ENERGY WAVE CHARGE AURA (1.0s TELEGRAPH) ───
      engine.bossChargeWaves.forEach((charge) => {
        ctx.save();
        const progress = 1 - charge.timer / charge.maxTimer; // 0 to 1
        const scale = charge.scale;

        // 1. Surging Multi-Layer Pulsing Demon Aura
        const pulse = 1 + Math.sin(progress * Math.PI * 8) * 0.18;
        const auraRadius = (55 + progress * 35) * scale * pulse;

        const auraGrad = ctx.createRadialGradient(
          charge.x,
          charge.y,
          10 * scale,
          charge.x,
          charge.y,
          auraRadius,
        );
        auraGrad.addColorStop(0, "rgba(239, 68, 68, 0.75)");
        auraGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.45)");
        auraGrad.addColorStop(0.85, "rgba(220, 38, 38, 0.25)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(charge.x, charge.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Swirling Demon Energy Rings & Lightning Arcs
        ctx.strokeStyle = progress > 0.6 ? "#fbbf24" : "#ef4444";
        ctx.lineWidth = 2.5 + progress * 2;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#ef4444";

        ctx.beginPath();
        ctx.arc(charge.x, charge.y, 42 * scale * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(charge.x, charge.y, (24 + (1 - progress) * 30) * scale, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Crackling Lightning Energy Spikes
        const spikes = 6;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        for (let i = 0; i < spikes; i++) {
          const ang = (i / spikes) * Math.PI * 2 + progress * Math.PI * 3;
          const r1 = 30 * scale;
          const r2 = (45 + Math.random() * 20) * scale;
          ctx.beginPath();
          ctx.moveTo(charge.x + Math.cos(ang) * r1, charge.y + Math.sin(ang) * r1);
          ctx.lineTo(
            charge.x + Math.cos(ang + 0.1) * ((r1 + r2) / 2),
            charge.y + Math.sin(ang + 0.1) * ((r1 + r2) / 2),
          );
          ctx.lineTo(charge.x + Math.cos(ang) * r2, charge.y + Math.sin(ang) * r2);
          ctx.stroke();
        }

        // 4. Impending Ground Surge Warning Zone on Floor
        ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(charge.x, h - 90, 70 * scale * progress, 12 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 5. Telegraph Badge
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#f87171";
        const chargeText = `⚡ CHARGING ENERGY WAVE ⚡`;
        ctx.fillText(
          chargeText,
          charge.x - ctx.measureText(chargeText).width / 2,
          charge.y - 75 * scale,
        );

        ctx.restore();
      });

      // ─── DRAW TELEPORT PROJECTIONS (1.0s TELEGRAPH) ───
      engine.teleportProjections.forEach((proj) => {
        ctx.save();
        const progress = 1 - proj.timer / proj.maxTimer; // 0 to 1
        const scale = proj.scale;

        // 1. Dashed connecting spectral tether between from and to
        ctx.strokeStyle = proj.color;
        ctx.globalAlpha = 0.4 + Math.sin(progress * Math.PI * 4) * 0.3;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(proj.fromX, proj.fromY);
        ctx.lineTo(proj.toX, proj.toY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Concentric Magic Rune Rings at destination collapsing inwards
        const ringRadius = 45 * scale * (1 - progress * 0.5);
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = proj.color;
        ctx.beginPath();
        ctx.arc(proj.toX, proj.toY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(proj.toX, proj.toY, 18 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Translucent Holographic Ghost Phantom at destination
        ctx.globalAlpha = 0.25 + progress * 0.45;
        ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(proj.toX, proj.toY - 32 * scale);
        ctx.bezierCurveTo(
          proj.toX - 26 * scale,
          proj.toY - 15 * scale,
          proj.toX - 30 * scale,
          proj.toY + 15 * scale,
          proj.toX - 20 * scale,
          proj.toY + 34 * scale,
        );
        ctx.lineTo(proj.toX, proj.toY + 36 * scale);
        ctx.lineTo(proj.toX + 20 * scale, proj.toY + 34 * scale);
        ctx.bezierCurveTo(
          proj.toX + 30 * scale,
          proj.toY + 15 * scale,
          proj.toX + 26 * scale,
          proj.toY - 15 * scale,
          proj.toX,
          proj.toY - 32 * scale,
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Phantom Glowing Eyes
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(
          proj.toX - 6 * scale,
          proj.toY - 14 * scale,
          2.5 * scale,
          3.5 * scale,
          0,
          0,
          Math.PI * 2,
        );
        ctx.ellipse(
          proj.toX + 6 * scale,
          proj.toY - 14 * scale,
          2.5 * scale,
          3.5 * scale,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Telegraph Countdown Badge
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = proj.color;
        const warpText = `⚠ WARP (${(proj.timer / 60).toFixed(1)}s)`;
        ctx.fillText(
          warpText,
          proj.toX - ctx.measureText(warpText).width / 2,
          proj.toY - 45 * scale,
        );

        ctx.restore();
      });

      // ─── DRAW GROUND WAVES & SHADOW HANDS ───
      engine.groundWaves.forEach((gw) => {
        ctx.save();
        ctx.fillStyle = gw.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = gw.color;
        ctx.beginPath();
        ctx.moveTo(gw.x - gw.width / 2, gw.y);
        ctx.lineTo(gw.x, gw.y - gw.height);
        ctx.lineTo(gw.x + gw.width / 2, gw.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      engine.shadowHands.forEach((hand) => {
        ctx.save();
        if (hand.timer < 30) {
          ctx.strokeStyle = "rgba(239,68,68,0.7)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(hand.x, hand.y, 25, 8, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#0c0507";
          ctx.strokeStyle = hand.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(hand.x - 12, hand.y - hand.rise, 24, hand.rise);
          ctx.fill();
          ctx.stroke();

          for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(hand.x + i * 8, hand.y - hand.rise);
            ctx.lineTo(hand.x + i * 8, hand.y - hand.rise - 16);
            ctx.stroke();
          }
        }
        ctx.restore();
      });

      // Draw Shockwaves
      engine.shockwaves.forEach((sw) => {
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.opacity;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = sw.color;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // ─── DRAW EXORCIST PLAYER ───
      const p = engine.player;
      ctx.save();
      const isBlinking = p.invulnTimer > 0 && Math.floor(p.invulnTimer / 5) % 2 === 0;

      if (!isBlinking) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 22, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#161824";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - 14, p.y + 20);
        ctx.lineTo(p.x + 14, p.y + 20);
        ctx.lineTo(p.x + 9, p.y - 12);
        ctx.lineTo(p.x - 9, p.y - 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#0c0e18";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 18, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 10;
        ctx.shadowColor = "#38bdf8";
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // ─── DRAW ACTIVE ENEMY SPIRITS ───
      engine.spirits.forEach((enemy) => {
        if (!enemy.alive) return;
        ctx.save();
        const pulse = 0.85 + Math.sin(enemy.auraPhase) * 0.15;
        const scale = enemy.scale;

        // Dark Aura
        const auraGrad = ctx.createRadialGradient(
          enemy.x,
          enemy.y,
          10 * scale,
          enemy.x,
          enemy.y,
          50 * scale * pulse,
        );
        auraGrad.addColorStop(
          0,
          enemy.isBoss ? "rgba(239, 68, 68, 0.4)" : "rgba(168, 85, 247, 0.35)",
        );
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 50 * scale * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Spirit Cloak
        ctx.fillStyle = "#0a0305";
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = enemy.isBoss ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - 32 * scale);
        ctx.bezierCurveTo(
          enemy.x - 26 * scale,
          enemy.y - 15 * scale,
          enemy.x - 30 * scale,
          enemy.y + 15 * scale,
          enemy.x - 20 * scale,
          enemy.y + 34 * scale,
        );
        ctx.lineTo(enemy.x - 10 * scale, enemy.y + 24 * scale);
        ctx.lineTo(enemy.x, enemy.y + 36 * scale);
        ctx.lineTo(enemy.x + 10 * scale, enemy.y + 24 * scale);
        ctx.lineTo(enemy.x + 20 * scale, enemy.y + 34 * scale);
        ctx.bezierCurveTo(
          enemy.x + 30 * scale,
          enemy.y + 15 * scale,
          enemy.x + 26 * scale,
          enemy.y - 15 * scale,
          enemy.x,
          enemy.y - 32 * scale,
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Boss Crown / Horns
        if (enemy.isBoss) {
          ctx.fillStyle = "#facc15";
          ctx.strokeStyle = "#ef4444";
          ctx.beginPath();
          ctx.moveTo(enemy.x - 18, enemy.y - 38);
          ctx.lineTo(enemy.x - 10, enemy.y - 48);
          ctx.lineTo(enemy.x, enemy.y - 40);
          ctx.lineTo(enemy.x + 10, enemy.y - 48);
          ctx.lineTo(enemy.x + 18, enemy.y - 38);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Glowing Eyes
        ctx.shadowBlur = 14;
        ctx.shadowColor = enemy.isBoss ? "#ff0000" : "#ffffff";
        ctx.fillStyle = enemy.isBoss ? "#ff2222" : "#ffffff";
        ctx.beginPath();
        ctx.ellipse(
          enemy.x - 6 * scale,
          enemy.y - 14 * scale,
          3 * scale,
          4 * scale,
          0,
          0,
          Math.PI * 2,
        );
        ctx.ellipse(
          enemy.x + 6 * scale,
          enemy.y - 14 * scale,
          3 * scale,
          4 * scale,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hovering Whisper Monospace Banner (NO REVERSE CLUE SHOWN)
        if (enemy.displayedText) {
          ctx.font = "bold 14px 'Share Tech Mono', monospace, monospace";
          const textWidth = ctx.measureText(enemy.displayedText).width;
          const bubblePadding = 12;
          const bubbleX = enemy.x - textWidth / 2 - bubblePadding;
          const bubbleY = enemy.y - 68 * scale;

          ctx.fillStyle = "rgba(10, 4, 8, 0.92)";
          ctx.strokeStyle = enemy.isBoss ? "#ef4444" : "#a855f7";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(bubbleX, bubbleY, textWidth + bubblePadding * 2, 28, 6);
          ctx.fill();
          ctx.stroke();

          // Normal Lowercase Text Whisper
          ctx.shadowBlur = 8;
          ctx.shadowColor = enemy.color;
          ctx.fillStyle = "#ffffff";
          ctx.fillText(enemy.displayedText, enemy.x - textWidth / 2, bubbleY + 19);
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // ─── DRAW PROJECTILES ───
      engine.projectiles.forEach((proj) => {
        ctx.save();
        ctx.fillStyle = proj.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ─── DRAW SPELL BEAMS & PARTICLES ───
      engine.spells.forEach((beam, idx) => {
        // Continuous screen shake recoil while beam fires
        engine.screenShake = Math.max(engine.screenShake, 12);

        ctx.save();

        // 1. Casting burst ring at player
        const burstPulse = (1 - beam.progress) * 25;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#38bdf8";
        ctx.beginPath();
        ctx.arc(beam.startX, beam.startY, burstPulse, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Radiant Outer Beam
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 7 + Math.sin(beam.progress * Math.PI) * 4;
        ctx.shadowBlur = 24;
        ctx.shadowColor = beam.color;
        ctx.beginPath();
        ctx.moveTo(beam.startX, beam.startY);
        ctx.lineTo(beam.endX, beam.endY);
        ctx.stroke();

        // 3. Bright White Core Beam
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(beam.startX, beam.startY);
        ctx.lineTo(beam.endX, beam.endY);
        ctx.stroke();

        ctx.restore();

        beam.progress += 0.2;
        if (beam.progress >= 1) {
          engine.spells.splice(idx, 1);
        }
      });

      // Particles
      engine.particles.forEach((pt, idx) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (pt.life <= 0) {
          engine.particles.splice(idx, 1);
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [executeEnemyAttack, gameState, playSound]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-black text-stone-100 font-mono select-none overflow-hidden ${
        distortionEffect ? "hue-rotate-90 saturate-200" : ""
      }`}
    >
      {/* ─── 1. TOP STATUS BAR / HUD ─── */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/95 to-transparent border-b border-red-950/40 backdrop-blur-sm">
        {/* Left: Back Button & Hearts */}
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-red-400 hover:text-red-200 transition-colors uppercase cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>← GIG//PORTAL EXORCIST</span>
          </button>

          {/* 5 Pixel Hearts */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 transition-all duration-300 ${
                  i < hearts
                    ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_#ef4444]"
                    : "text-stone-800 fill-stone-900 opacity-40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center: Level Badge */}
        <div className="flex items-center gap-2">
          {isBossLevel ? (
            <div className="flex items-center gap-1.5 text-red-500 animate-pulse font-bold text-xs sm:text-sm tracking-widest">
              <Flame className="h-4 w-4" />
              <span>[BOSS BATTLE: LEVEL {level}]</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs sm:text-sm tracking-widest">
              <Zap className="h-4 w-4" />
              <span>LEVEL {level}</span>
            </div>
          )}
        </div>

        {/* Right: Score & Audio Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAudioMuted((m) => !m)}
            className="text-stone-500 hover:text-stone-300 transition-colors p-1"
            title={audioMuted ? "Unmute sound" : "Mute sound"}
          >
            {audioMuted ? (
              <VolumeX className="h-4 w-4 text-red-500" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <div className="text-xs sm:text-sm font-bold tracking-widest text-stone-200">
            SCORE: <span className="text-cyan-400">{score}</span>
          </div>
        </div>
      </header>

      {/* ─── 2. ARENA VIEWPORT (2D CANVAS) ─── */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={550}
          className="w-full h-full max-w-[1280px] max-h-[720px] object-contain block"
        />

        {/* Backspace Penalty Flash Banner */}
        {penaltyFlash && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-600/90 text-white font-bold text-xs px-4 py-1.5 rounded tracking-widest border border-red-300 shadow-[0_0_20px_#ef4444] animate-pulse z-30">
            ⚠ BACKSPACE PENALTY: -5 CHARS PURGED!
          </div>
        )}

        {/* Start Screen Overlay */}
        {gameState === "start" && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="inline-block p-4 rounded-full bg-red-950/40 border border-red-500/40 text-red-500 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.25)]">
              <Skull className="h-12 w-12 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-white mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              THE TYPO EXORCIST
            </h1>
            <p className="text-xs sm:text-sm tracking-[0.25em] text-red-400 uppercase mb-6">
              REVERSE EXORCISM COMBAT
            </p>

            <div className="max-w-md bg-stone-950/90 border border-red-950 rounded-lg p-4 text-xs text-stone-300 space-y-3 mb-6 text-left leading-relaxed">
              <p>
                • <strong className="text-cyan-400">LEVEL PROGRESSION:</strong> Advance level by
                level. Clear the spirits on field to progress. Every <strong>5 levels</strong> leads
                to a <strong>BOSS BATTLE</strong>!
              </p>
              <p>
                • <strong className="text-amber-400">REVERSE CHANT WIN CONDITION:</strong> Spirits
                whisper normal sentences (e.g. <em>"the cold knows"</em>). You must type the phrase{" "}
                <strong>EXACTLY IN REVERSE</strong> into your chant box and press{" "}
                <strong>[ENTER]</strong>.
              </p>
              <p>
                • <strong className="text-red-400">BACKSPACE THE PENALTY:</strong> Mistakes are
                punishing. Pressing Backspace removes <strong>5 characters</strong> at once!
              </p>
              <p>
                • <strong className="text-stone-300">DODGE ATTACKS:</strong> Use{" "}
                <strong>Arrow Keys</strong> to dodge bolts, ground waves, and shadow claws.
              </p>
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 rounded bg-red-600 hover:bg-red-500 text-stone-950 font-bold tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer"
            >
              START REVERSE EXORCISM →
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-3xl sm:text-4xl font-black tracking-widest text-red-500 mb-2 drop-shadow-[0_0_20px_#ef4444]">
              TYPO DETECTED.
            </h2>
            <p className="text-xs sm:text-sm tracking-[0.25em] text-stone-400 mb-6 uppercase">
              THE SPIRITS CLAIMED YOUR VESSEL ON LEVEL {level}
            </p>
            <div className="text-base font-bold text-stone-200 mb-6">
              FINAL SCORE: <span className="text-cyan-400">{score}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleStartGame}
                className="flex items-center gap-2 px-6 py-3 rounded bg-red-600 hover:bg-red-500 text-stone-950 font-bold tracking-widest text-xs uppercase transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>TRY AGAIN</span>
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 rounded border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs tracking-widest uppercase transition-all cursor-pointer"
              >
                EXIT TO GIGS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. REVERSE EXORCISM CHANT FOOTER (NO REVERSE CLUE SHOWN) ─── */}
      <footer className="relative z-20 w-full max-w-xl mx-auto pb-4 px-4">
        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`text-center text-xs font-bold tracking-widest mb-1.5 transition-all ${
              feedbackMsg.ok ? "text-cyan-400" : "text-red-500 animate-bounce"
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Active Target Whisper Indicator (Only normal whisper shown, no reverse cheat) */}
        {activeWhispers.length > 0 && (
          <div className="bg-stone-950/90 border border-stone-800 rounded-t-lg px-3 py-1.5 flex items-center justify-between text-[11px] text-stone-300">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-stone-500">ACTIVE WHISPERS:</span>
              {activeWhispers.map((w, idx) => (
                <span key={idx} className="text-stone-200 font-bold">
                  "{w}"{idx < activeWhispers.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
            <span className="text-stone-500 text-[10px]">[TYPE IN REVERSE]</span>
          </div>
        )}

        {/* Real-time Input Box */}
        <form onSubmit={handleExorcismSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={() => {}} // Controlled by global key listener to enforce penalty
            disabled={gameState !== "playing"}
            placeholder="Type whisper in reverse & press [ENTER] to exorcise..."
            autoFocus
            className="w-full bg-stone-950/95 text-cyan-300 placeholder-stone-600 border-2 border-stone-800 focus:border-cyan-500 rounded-b-lg px-4 py-2.5 text-xs sm:text-sm font-mono tracking-widest outline-none shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all"
          />
          <button
            type="submit"
            disabled={gameState !== "playing" || !inputVal.trim()}
            className="absolute right-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-stone-950 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
          >
            PURGE
          </button>
        </form>

        <div className="flex justify-between items-center text-[10px] text-stone-500 pt-1.5 px-1 font-mono">
          <span>MOVE: [Arrow Keys]</span>
          <span>BACKSPACE: [-5 Chars Penalty]</span>
          <span>ENTER: [Exorcise]</span>
        </div>
      </footer>
    </div>
  );
}
