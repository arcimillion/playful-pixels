// TYPO EXORCIST — canvas game engine.
// Procedural 2D horror combat + reverse-typing. No external assets.
// Exposes TypoExorcistEngine for the React shell to mount.

import { SENTENCES, SENTENCE_TIERS, pickSentence, requiredInput } from "./data/sentences.js";
import { spiritForRound } from "./data/spirits.js";
import { ATTACK, pickAttack } from "./data/attacks.js";
import { sound } from "./sound.js";

const VW = 1280; // internal virtual width
const VH = 720; // internal virtual height
const FLOOR_Y = 600;
const WORLD_W = 2400;
const GRAVITY = 2400;
const MOVE_SPEED = 320;
const JUMP_V = 760;
const PURGE_COUNT = 10;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- Particles ----------
class Particle {
  constructor(opts) {
    Object.assign(
      this,
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 1,
        max: 1,
        size: 3,
        color: "#fff",
        kind: "dust",
        gravity: 0,
        rot: 0,
        vrot: 0,
        glow: 0,
      },
      opts,
    );
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.rot += this.vrot * dt;
    this.life -= dt;
    if (this.kind === "fog") {
      this.vx *= 0.99;
      this.vy *= 0.98;
    }
    if (this.kind === "ember") {
      this.vy -= 30 * dt;
      this.vx *= 0.97;
    }
  }
  get dead() {
    return this.life <= 0;
  }
  render(ctx) {
    const a = clamp(this.life / this.max, 0, 1);
    ctx.save();
    ctx.globalAlpha = a * (this.alpha ?? 1);
    if (this.kind === "fog") {
      ctx.globalAlpha *= 0.4;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      g.addColorStop(0, this.color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === "ember") {
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * a, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === "rune") {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 14;
      ctx.shadowColor = this.color;
      const s = this.size * a;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const r = i % 2 === 0 ? s : s * 0.5;
        ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.stroke();
    } else if (this.kind === "spark") {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 0.02, this.y - this.vy * 0.02);
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ---------- Engine ----------
export class TypoExorcistEngine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.opts = opts;
    this.cb = opts.callbacks || {};
    this.running = false;
    this.state = "idle"; // idle | playing | dying | dead | won
    this.last = 0;
    this.acc = 0;
    this.keys = new Set();
    this._onKey = this._onKey.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._raf = null;
    this.muted = false;
    this._reset();
  }

  _reset() {
    this.round = 1;
    this.maxRounds = 5;
    this.score = 0;
    this.bestCombo = 0;
    this.typos = 0;
    this.sentencesExorcised = 0;
    this.spiritDamage = 0;
    this.startTime = 0;
    this.camera = { x: 0, y: 0, shake: 0, zoom: 1, targetZoom: 1 };
    this.particles = [];
    this.attacks = [];
    this.telegraphs = [];
    this.hands = [];
    this.projectiles = [];
    this.groundCurses = [];
    this.distortionUntil = 0;
    this.distortionSeed = 0;
    this.flashRed = 0;
    this.flashWhite = 0;
    this.flashBlack = 0;
    this.jumpscare = null; // {t, dur, kind}
    this.flicker = 0;
    this.lightOn = true;
    this.lightTimer = 0;
    this._spawnEnvParticles();
    this._newSentence();
    this._initPlayer();
    this._initSpirit();
  }

  _initPlayer() {
    this.player = {
      x: 360,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      w: 46,
      h: 120,
      onGround: true,
      facing: 1,
      hp: 5,
      maxHp: 5,
      anim: "idle",
      animT: 0,
      hitT: 0,
      invuln: 0,
      exorcismT: 0,
      purgeT: 0,
      walkPhase: 0,
      landT: 0,
      coatSway: 0,
    };
  }

  _initSpirit() {
    const def = spiritForRound(this.round);
    this.spiritDef = def;
    this.spirit = {
      x: WORLD_W - 500,
      y: 280,
      baseY: 280,
      vx: 0,
      vy: 0,
      hp: def.maxHp,
      maxHp: def.maxHp,
      floatT: 0,
      teleportT: 0,
      visible: true,
      opacity: 1,
      attackTimer: 1200,
      aggression: 0,
      hitFlash: 0,
      dashT: 0,
      dashTarget: null,
      eyePulse: 0,
      def,
    };
    this._announceRound();
  }

  _announceRound() {
    if (this.cb.onRound) this.cb.onRound(this.round, this.spiritDef);
  }

  _spawnEnvParticles() {
    this.envDust = [];
    for (let i = 0; i < 40; i++) {
      this.envDust.push({
        x: rand(0, WORLD_W),
        y: rand(0, FLOOR_Y),
        vx: rand(-8, 8),
        vy: rand(-6, 2),
        size: rand(1, 2.5),
        alpha: rand(0.1, 0.4),
      });
    }
    this.envFog = [];
    for (let i = 0; i < 14; i++) {
      this.envFog.push({
        x: rand(0, WORLD_W),
        y: rand(FLOOR_Y - 120, FLOOR_Y),
        vx: rand(-12, 12),
        size: rand(80, 180),
        alpha: rand(0.05, 0.16),
        phase: rand(0, Math.PI * 2),
      });
    }
  }

  _newSentence() {
    const { index, text } = pickSentence(this.round, this._lastSentenceIdx);
    this._lastSentenceIdx = index;
    this.targetSentence = text;
    this.required = requiredInput(text);
    this.typed = "";
    this._hadTypoThisSentence = false;
    this.sentenceStart = performance.now();
  }

  // ---------- lifecycle ----------
  start() {
    if (this.running) return;
    this.running = true;
    this.state = "playing";
    this.startTime = performance.now();
    this.last = performance.now();
    window.addEventListener("keydown", this._onKey);
    window.addEventListener("keyup", this._onKeyUp);
    sound.resume();
    sound.startAmbient();
    this._loop();
    if (this.cb.onReady) this.cb.onReady();
  }

  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    window.removeEventListener("keydown", this._onKey);
    window.removeEventListener("keyup", this._onKeyUp);
    sound.stopAmbient();
  }

  setMuted(m) {
    this.muted = m;
    sound.setMuted(m);
  }

  restart() {
    this._reset();
    this.state = "playing";
    this.startTime = performance.now();
    sound.startAmbient();
    if (this.cb.onHud) this._pushHud();
  }

  // ---------- input ----------
  _onKey(e) {
    if (!this.running || this.state !== "playing") return;
    const k = e.key;
    // movement keys: prevent scroll
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(k)) {
      e.preventDefault();
    }
    if (e.repeat) {
      this.keys.add(k);
      return;
    }
    this.keys.add(k);

    if (k === " ") {
      this._purge();
      return;
    }
    if (k === "ArrowUp") {
      this._tryJump();
      return;
    }
    // typing: single printable char
    if (k.length === 1) {
      this._typeChar(k);
    }
  }

  _onKeyUp(e) {
    this.keys.delete(e.key);
  }

  _tryJump() {
    const p = this.player;
    if (p.onGround && p.exorcismT <= 0) {
      p.vy = -JUMP_V;
      p.onGround = false;
      p.anim = "jump";
      sound.jump();
      this._burst(p.x, p.y - 10, 8, "#9a8a6a", "dust", 60);
    }
  }

  _typeChar(ch) {
    if (this.player.exorcismT > 0) return;
    const req = this.required;
    const i = this.typed.length;
    if (i >= req.length) {
      // already full — extra char is a typo
      this._registerTypo();
      this.typed += ch;
      this._pushTyping();
      return;
    }
    const expected = req[i];
    this.typed += ch;
    if (ch === expected) {
      sound.type();
      this._burst(this.player.x, this.player.y - 80, 2, "#cfe8d0", "ember", 40);
    } else {
      this._registerTypo();
    }
    this._pushTyping();
    if (this.typed === req) {
      this._completeSentence();
    }
  }

  _registerTypo() {
    this.typos++;
    this._hadTypoThisSentence = true;
    this.flashRed = 0.5;
    this.player.hitT = 0.3;
    sound.typo();
    // spirit becomes more aggressive
    this.spirit.attackTimer = Math.min(this.spirit.attackTimer, 700);
    if (this.cb.onTypo) this.cb.onTypo(this.typos);
  }

  _purge() {
    if (this.player.exorcismT > 0) return;
    if (this.typed.length === 0) return;
    const remove = Math.min(PURGE_COUNT, this.typed.length);
    this.typed = this.typed.slice(0, this.typed.length - remove);
    sound.purge();
    this.player.purgeT = 0.5;
    // supernatural purge ring
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      this.particles.push(
        new Particle({
          x: this.player.x,
          y: this.player.y - 60,
          vx: Math.cos(ang) * 220,
          vy: Math.sin(ang) * 220 - 40,
          life: 0.5,
          max: 0.5,
          size: 4,
          color: "#9be8d6",
          kind: "spark",
          glow: 1,
        }),
      );
    }
    this.particles.push(
      new Particle({
        x: this.player.x,
        y: this.player.y - 60,
        vx: 0,
        vy: 0,
        life: 0.5,
        max: 0.5,
        size: 90,
        color: "rgba(140,220,180,0.5)",
        kind: "fog",
      }),
    );
    this._pushTyping();
  }

  _completeSentence() {
    const time = (performance.now() - this.sentenceStart) / 1000;
    const speedFactor = clamp(8 / Math.max(time, 1.5), 0.6, 2);
    const combo = (this._combo || 0) + 1;
    this._combo = combo;
    this.bestCombo = Math.max(this.bestCombo, combo);
    const typoPenalty = this._hadTypoThisSentence ? 0.6 : 1;
    const base = 18 + this.round * 6;
    const dmg = Math.round(base * combo * speedFactor * typoPenalty);
    this.spirit.hp = Math.max(0, this.spirit.hp - dmg);
    this.spiritDamage += dmg;
    this.score += dmg * 10;
    this.sentencesExorcised++;
    this.spirit.hitFlash = 0.4;
    this.camera.shake = Math.max(this.camera.shake, 10);
    this.camera.targetZoom = 1.06;
    setTimeout(() => {
      this.camera.targetZoom = 1;
    }, 350);
    sound.exorcism();
    this.player.exorcismT = 0.7;
    this.player.anim = "exorcism";
    this._exorcismBurst();
    if (this.cb.onExorcism) this.cb.onExorcism(dmg, combo);
    this._pushHud();

    if (this.spirit.hp <= 0) {
      this._spiritDefeated();
    } else {
      this._newSentence();
    }
  }

  _exorcismBurst() {
    const sx = this.spirit.x,
      sy = this.spirit.y;
    for (let i = 0; i < 30; i++) {
      const ang = rand(0, Math.PI * 2);
      const sp = rand(120, 360);
      this.particles.push(
        new Particle({
          x: sx,
          y: sy,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: rand(0.5, 1),
          max: 1,
          size: rand(3, 7),
          color: i % 2 ? "#fff" : this.spiritDef.accent,
          kind: "ember",
        }),
      );
    }
    for (let i = 0; i < 6; i++) {
      this.particles.push(
        new Particle({
          x: sx + rand(-40, 40),
          y: sy + rand(-40, 40),
          vx: rand(-30, 30),
          vy: rand(-60, -10),
          life: 1,
          max: 1,
          size: rand(20, 40),
          color: this.spiritDef.color,
          kind: "rune",
          vrot: rand(-3, 3),
        }),
      );
    }
    this.flashWhite = 0.3;
  }

  _spiritDefeated() {
    this.spirit.hp = 0;
    this.spirit.visible = false;
    this.flashWhite = 0.6;
    this.camera.shake = 24;
    sound.teleport();
    // big particle explosion
    for (let i = 0; i < 80; i++) {
      const ang = rand(0, Math.PI * 2);
      const sp = rand(80, 480);
      this.particles.push(
        new Particle({
          x: this.spirit.x,
          y: this.spirit.y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 60,
          life: rand(0.8, 1.6),
          max: 1.6,
          size: rand(2, 8),
          color: i % 3 === 0 ? "#fff" : i % 3 === 1 ? this.spiritDef.accent : this.spiritDef.color,
          kind: "ember",
          gravity: 120,
        }),
      );
    }
    if (this.round >= this.maxRounds) {
      this._victory();
    } else {
      // brief pause then next round
      this.state = "dying"; // reuse as transition
      setTimeout(() => {
        this.round++;
        this._initSpirit();
        this._newSentence();
        this.state = "playing";
        this._pushHud();
      }, 1400);
    }
  }

  _victory() {
    this.state = "won";
    sound.victory();
    const time = (performance.now() - this.startTime) / 1000;
    const rank = this._rank();
    if (this.cb.onVictory) {
      this.cb.onVictory({
        score: this.score,
        bestCombo: this.bestCombo,
        typos: this.typos,
        sentences: this.sentencesExorcised,
        damage: this.spiritDamage,
        time,
        rank,
      });
    }
  }

  _rank() {
    const s = this.score;
    if (s > 9000) return "S";
    if (s > 6000) return "A";
    if (s > 3500) return "B";
    return "C";
  }

  _die() {
    if (this.state !== "playing") return;
    this.state = "dead";
    sound.death();
    sound.stopAmbient();
    const time = (performance.now() - this.startTime) / 1000;
    if (this.cb.onDeath) {
      this.cb.onDeath({
        score: this.score,
        bestCombo: this.bestCombo,
        typos: this.typos,
        sentences: this.sentencesExorcised,
        time,
      });
    }
  }

  // ---------- HUD push ----------
  _pushHud() {
    if (!this.cb.onHud) return;
    this.cb.onHud({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      spiritHp: this.spirit.hp,
      spiritMax: this.spirit.maxHp,
      spiritName: this.spiritDef.name,
      score: this.score,
      combo: this._combo || 0,
      typos: this.typos,
      round: this.round,
    });
  }

  _pushTyping() {
    if (!this.cb.onTyping) return;
    const req = this.required;
    const typed = this.typed;
    const chars = [];
    for (let i = 0; i < req.length; i++) {
      if (i < typed.length) {
        chars.push({ ch: typed[i], ok: typed[i] === req[i] });
      } else {
        chars.push({ ch: req[i], ok: null });
      }
    }
    this.cb.onTyping({ target: this.targetSentence, chars, required: req });
  }

  // ---------- main loop ----------
  _loop = () => {
    if (!this.running) return;
    const now = performance.now();
    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = Math.min(dt, 0.05);
    if (this.state === "playing") this._update(dt);
    this._updateParticles(dt);
    this._updateCamera(dt);
    this._render();
    this._raf = requestAnimationFrame(this._loop);
  };

  _update(dt) {
    const p = this.player;
    const s = this.spirit;
    // movement
    let move = 0;
    if (this.keys.has("ArrowLeft")) move -= 1;
    if (this.keys.has("ArrowRight")) move += 1;
    if (p.exorcismT > 0) move = 0;
    p.vx = move * MOVE_SPEED;
    if (move !== 0) p.facing = move;
    p.x += p.vx * dt;
    p.x = clamp(p.x, 60, WORLD_W - 60);

    // jump / gravity
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;
    if (p.y >= FLOOR_Y) {
      if (!p.onGround) {
        p.landT = 0.2;
        sound.land();
        this._burst(p.x, FLOOR_Y, 10, "#7a6a4a", "dust", 80);
      }
      p.y = FLOOR_Y;
      p.vy = 0;
      p.onGround = true;
    } else {
      p.onGround = false;
    }

    // crouch
    if (this.keys.has("ArrowDown") && p.onGround) {
      p.anim = "crouch";
    } else if (p.exorcismT > 0) {
      p.anim = "exorcism";
    } else if (!p.onGround) {
      p.anim = p.vy < 0 ? "jump" : "fall";
    } else if (move !== 0) {
      p.anim = "run";
      p.walkPhase += dt * 12;
    } else {
      p.anim = "idle";
    }
    p.animT += dt;
    if (p.hitT > 0) p.hitT -= dt;
    if (p.invuln > 0) p.invuln -= dt;
    if (p.exorcismT > 0) p.exorcismT -= dt;
    if (p.purgeT > 0) p.purgeT -= dt;
    if (p.landT > 0) p.landT -= dt;
    p.coatSway = lerp(p.coatSway, -p.vx * 0.02, 0.1);

    // spirit
    this._updateSpirit(dt);
    // attacks
    this._updateAttacks(dt);
    // environment flicker
    this._updateLights(dt);
    // flashes
    if (this.flashRed > 0) this.flashRed -= dt;
    if (this.flashWhite > 0) this.flashWhite -= dt;
    if (this.flashBlack > 0) this.flashBlack -= dt;
    // distortion
    if (this.distortionUntil > 0) this.distortionUntil -= dt;
    // jumpscare
    if (this.jumpscare) {
      this.jumpscare.t += dt;
      if (this.jumpscare.t > this.jumpscare.dur) this.jumpscare = null;
    }
    // periodic ambient particles
    if (Math.random() < 0.3) {
      this.envDust.forEach((d) => {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < 0) d.x = WORLD_W;
        if (d.x > WORLD_W) d.x = 0;
        if (d.y < 0) d.y = FLOOR_Y;
        if (d.y > FLOOR_Y) d.y = 0;
      });
    }
    this.envFog.forEach((f) => {
      f.x += f.vx * dt;
      f.phase += dt;
      if (f.x < -200) f.x = WORLD_W + 100;
      if (f.x > WORLD_W + 200) f.x = -100;
    });
  }

  _updateSpirit(dt) {
    const s = this.spirit;
    const def = s.def;
    s.floatT += dt;
    s.eyePulse += dt;
    // float bob
    s.y = s.baseY + Math.sin(s.floatT * 1.6) * 24;
    // drift toward a target x offset from player
    const desiredX = clamp(
      this.player.x + 380 * (this.player.facing >= 0 ? 1 : -1),
      200,
      WORLD_W - 200,
    );
    s.x = lerp(s.x, desiredX, 0.4 * dt);
    s.x = clamp(s.x, 180, WORLD_W - 180);
    // aggression scales as hp drops
    const aggro = 1 - s.hp / s.maxHp;
    s.aggression = aggro;
    // teleport
    if (def.teleportChance > 0 && Math.random() < def.teleportChance * dt * 0.6) {
      this._spiritTeleport();
    }
    if (s.dashT > 0) {
      s.dashT -= dt;
      if (s.dashT <= 0 && s.dashTarget) {
        s.x = s.dashTarget.x;
        s.y = s.dashTarget.y;
        s.baseY = s.dashTarget.y;
        s.visible = true;
        s.opacity = 1;
        sound.teleport();
        this._burst(s.x, s.y, 16, def.color, "ember", 120);
        // contact damage if close
        if (Math.abs(s.x - this.player.x) < 90 && Math.abs(s.y - (this.player.y - 60)) < 130) {
          this._damagePlayer(1);
        }
        s.dashTarget = null;
      }
    }
    if (s.hitFlash > 0) s.hitFlash -= dt;

    // attack scheduling
    s.attackTimer -= dt * 1000;
    if (s.attackTimer <= 0) {
      const interval = def.attackInterval * (1 - aggro * 0.4);
      s.attackTimer = interval + rand(-150, 250);
      this._launchAttack();
    }
    // rare jumpscare
    if (
      def.jumpscareChance > 0 &&
      !this.jumpscare &&
      Math.random() < def.jumpscareChance * dt * 0.5
    ) {
      this._triggerJumpscare();
    }
  }

  _spiritTeleport() {
    const s = this.spirit;
    s.visible = false;
    s.opacity = 0;
    sound.teleport();
    this._burst(s.x, s.y, 12, s.def.color, "ember", 100);
    // reappear on opposite side of player
    const side = this.player.x > WORLD_W / 2 ? -1 : 1;
    s.x = clamp(this.player.x + side * rand(280, 420), 180, WORLD_W - 180);
    s.baseY = rand(220, 340);
    s.dashT = 0.18;
    s.dashTarget = { x: s.x, y: s.baseY };
  }

  _launchAttack() {
    const type = pickAttack(this.round);
    const s = this.spirit;
    const speed = s.def.attackSpeed * (1 + s.aggression * 0.5);
    switch (type) {
      case ATTACK.PROJECTILE: {
        const dx = this.player.x - s.x;
        const dy = this.player.y - 60 - s.y;
        const d = Math.hypot(dx, dy) || 1;
        this.projectiles.push({
          x: s.x,
          y: s.y,
          vx: (dx / d) * speed,
          vy: (dy / d) * speed,
          r: 12,
          life: 4,
          color: s.def.accent,
        });
        sound.projectile();
        break;
      }
      case ATTACK.GROUND_CURSE: {
        const fromLeft = Math.random() < 0.5;
        this.groundCurses.push({
          x: fromLeft ? -40 : WORLD_W + 40,
          y: FLOOR_Y,
          vx: (fromLeft ? 1 : -1) * speed * 0.8,
          w: 60,
          h: 40,
          life: 6,
          color: s.def.color,
        });
        break;
      }
      case ATTACK.SPIRIT_DASH: {
        this._spiritTeleport();
        break;
      }
      case ATTACK.SHADOW_HANDS: {
        const count = 1 + Math.floor(s.aggression * 2);
        for (let i = 0; i < count; i++) {
          const hx = clamp(this.player.x + rand(-260, 260), 80, WORLD_W - 80);
          this.hands.push({
            x: hx,
            y: FLOOR_Y,
            phase: 0,
            rise: 0,
            life: 2.2,
            active: true,
            color: s.def.color,
          });
        }
        break;
      }
      case ATTACK.DISTORTION: {
        this.distortionUntil = 1.6;
        this.distortionSeed = Math.random() * 1000;
        break;
      }
      case ATTACK.JUMPSCARE: {
        this._triggerJumpscare();
        break;
      }
    }
  }

  _updateAttacks(dt) {
    const p = this.player;
    // projectiles
    for (const pr of this.projectiles) {
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
      if (p.invuln <= 0 && Math.hypot(pr.x - p.x, pr.y - (p.y - 60)) < pr.r + 36) {
        this._damagePlayer(1);
        pr.life = 0;
        this._burst(pr.x, pr.y, 14, pr.color, "ember", 120);
      }
    }
    this.projectiles = this.projectiles.filter(
      (pr) => pr.life > 0 && pr.x > -100 && pr.x < WORLD_W + 100 && pr.y < VH + 100,
    );

    // ground curses
    for (const g of this.groundCurses) {
      g.x += g.vx * dt;
      g.life -= dt;
      if (p.invuln <= 0 && p.onGround && Math.abs(g.x - p.x) < g.w / 2 + 30) {
        this._damagePlayer(1);
        g.life = 0;
      }
    }
    this.groundCurses = this.groundCurses.filter(
      (g) => g.life > 0 && g.x > -120 && g.x < WORLD_W + 120,
    );

    // shadow hands
    for (const h of this.hands) {
      h.phase += dt;
      if (h.phase < 0.5) {
        // telegraph
      } else if (h.phase < 1.1) {
        h.rise = lerp(h.rise, 90, 0.12);
      } else {
        h.rise = lerp(h.rise, 0, 0.1);
      }
      if (h.active && h.phase > 0.5 && h.phase < 1.1) {
        if (p.invuln <= 0 && Math.abs(h.x - p.x) < 50 && p.y > FLOOR_Y - h.rise - 10) {
          this._damagePlayer(1);
          h.active = false;
        }
      }
      h.life -= dt;
    }
    this.hands = this.hands.filter((h) => h.life > 0);
  }

  _damagePlayer(n) {
    const p = this.player;
    if (p.invuln > 0) return;
    p.hp = Math.max(0, p.hp - n);
    p.hitT = 0.4;
    p.invuln = 0.8;
    this.flashRed = 0.4;
    this.camera.shake = Math.max(this.camera.shake, 14);
    sound.hit();
    this._burst(p.x, p.y - 60, 14, "#b3202a", "ember", 140);
    this._pushHud();
    if (p.hp <= 0) this._die();
  }

  _triggerJumpscare() {
    if (this.jumpscare) return;
    this.jumpscare = { t: 0, dur: 0.35, kind: "face" };
    this.flashBlack = 0.1;
    this.camera.shake = Math.max(this.camera.shake, 22);
    sound.jumpscare();
  }

  _updateLights(dt) {
    this.lightTimer -= dt;
    const aggro = this.spirit.aggression;
    const flickerChance = 0.02 + aggro * 0.08;
    if (this.lightTimer <= 0 && Math.random() < flickerChance) {
      this.lightOn = !this.lightOn;
      this.lightTimer = rand(0.04, 0.18);
    }
    if (this.lightTimer <= 0) {
      this.lightOn = true;
      this.lightTimer = rand(0.4, 1.4);
    }
  }

  _updateParticles(dt) {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter((p) => !p.dead);
  }

  _updateCamera(dt) {
    const targetX = clamp(this.player.x - VW / 2, 0, WORLD_W - VW);
    this.camera.x = lerp(this.camera.x, targetX, 0.08);
    this.camera.zoom = lerp(this.camera.zoom, this.camera.targetZoom, 0.1);
    if (this.camera.shake > 0) this.camera.shake = Math.max(0, this.camera.shake - dt * 40);
  }

  _burst(x, y, n, color, kind, speed) {
    for (let i = 0; i < n; i++) {
      const ang = rand(0, Math.PI * 2);
      const sp = rand(speed * 0.3, speed);
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - rand(20, 80),
          life: rand(0.3, 0.8),
          max: 0.8,
          size: rand(2, 5),
          color,
          kind: kind || "ember",
          gravity: kind === "dust" ? 200 : 60,
        }),
      );
    }
  }

  // ---------- rendering ----------
  _render() {
    const ctx = this.ctx;
    const cw = this.canvas.width,
      ch = this.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, cw, ch);
    // scale virtual to canvas
    const scale = Math.min(cw / VW, ch / VH);
    const ox = (cw - VW * scale) / 2;
    const oy = (ch - VH * scale) / 2;
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    // clip to virtual
    ctx.beginPath();
    ctx.rect(0, 0, VW, VH);
    ctx.clip();

    const shakeX = (Math.random() - 0.5) * this.camera.shake;
    const shakeY = (Math.random() - 0.5) * this.camera.shake;
    ctx.save();
    ctx.translate(VW / 2, VH / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-VW / 2 + this.camera.x + shakeX, shakeY);

    this._renderBackground(ctx);
    this._renderGroundCurses(ctx);
    this._renderHands(ctx);
    this._renderPlayer(ctx);
    this._renderSpirit(ctx);
    this._renderProjectiles(ctx);
    this._renderParticles(ctx);
    this._renderFog(ctx);

    ctx.restore();

    // distortion overlay
    if (this.distortionUntil > 0) this._renderDistortion(ctx);

    // flashes
    if (this.flashRed > 0) {
      ctx.fillStyle = `rgba(179,32,42,${this.flashRed})`;
      ctx.fillRect(0, 0, VW, VH);
    }
    if (this.flashWhite > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashWhite})`;
      ctx.fillRect(0, 0, VW, VH);
    }
    if (this.flashBlack > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.flashBlack})`;
      ctx.fillRect(0, 0, VW, VH);
    }
    // low-health darkening
    if (this.state === "playing" && this.player.hp <= 2) {
      ctx.fillStyle = `rgba(0,0,0,${0.15 + (2 - this.player.hp) * 0.12})`;
      ctx.fillRect(0, 0, VW, VH);
    }
    // jumpscare
    if (this.jumpscare) this._renderJumpscare(ctx);

    ctx.restore();
  }

  _renderBackground(ctx) {
    // sky/wall gradient
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, "#070608");
    g.addColorStop(0.5, "#0e0a0c");
    g.addColorStop(1, "#160f10");
    ctx.fillStyle = g;
    ctx.fillRect(this.camera.x, 0, VW, VH);

    // back wall corridor depth
    const cx = this.camera.x;
    // moonlight windows
    for (let i = 0; i < 5; i++) {
      const wx = 200 + i * 520;
      if (wx + 120 < cx || wx - 120 > cx + VW) continue;
      // window frame
      ctx.fillStyle = "#050405";
      ctx.fillRect(wx - 70, 120, 140, 220);
      // moonlight
      const mg = ctx.createLinearGradient(wx, 120, wx, 340);
      mg.addColorStop(0, "rgba(185,199,212,0.22)");
      mg.addColorStop(1, "rgba(185,199,212,0)");
      ctx.fillStyle = this.lightOn ? mg : "rgba(185,199,212,0.04)";
      ctx.fillRect(wx - 60, 130, 120, 200);
      // frame cross
      ctx.strokeStyle = "#1a1213";
      ctx.lineWidth = 6;
      ctx.strokeRect(wx - 60, 130, 120, 200);
      ctx.beginPath();
      ctx.moveTo(wx, 130);
      ctx.lineTo(wx, 330);
      ctx.moveTo(wx - 60, 230);
      ctx.lineTo(wx + 60, 230);
      ctx.stroke();
      // moonlight beam on floor
      const bg = ctx.createLinearGradient(wx, 340, wx, FLOOR_Y);
      bg.addColorStop(0, this.lightOn ? "rgba(185,199,212,0.12)" : "rgba(185,199,212,0.02)");
      bg.addColorStop(1, "rgba(185,199,212,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(wx - 50, 340);
      ctx.lineTo(wx + 50, 340);
      ctx.lineTo(wx + 110, FLOOR_Y);
      ctx.lineTo(wx - 110, FLOOR_Y);
      ctx.closePath();
      ctx.fill();
    }

    // paintings
    for (let i = 0; i < 4; i++) {
      const px = 380 + i * 600;
      if (px + 80 < cx || px - 80 > cx + VW) continue;
      ctx.fillStyle = "#0a0708";
      ctx.fillRect(px - 50, 200, 100, 130);
      ctx.strokeStyle = "#241818";
      ctx.lineWidth = 5;
      ctx.strokeRect(px - 50, 200, 100, 130);
      // distorted portrait smear
      ctx.fillStyle = "rgba(60,40,40,0.4)";
      ctx.fillRect(px - 40, 210, 80, 110);
      ctx.fillStyle = "rgba(120,90,90,0.2)";
      ctx.beginPath();
      ctx.arc(px, 260, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // hanging cables
    ctx.strokeStyle = "rgba(40,30,30,0.6)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const cxp = 120 + i * 420;
      ctx.beginPath();
      ctx.moveTo(cxp, 0);
      ctx.quadraticCurveTo(cxp + 20, 60, cxp + 10, 120);
      ctx.stroke();
    }

    // broken furniture silhouettes
    for (let i = 0; i < 5; i++) {
      const fx = 100 + i * 520;
      if (fx + 100 < cx || fx - 100 > cx + VW) continue;
      ctx.fillStyle = "#0c0808";
      ctx.fillRect(fx, FLOOR_Y - 70, 90, 70);
      ctx.fillStyle = "#160e0e";
      ctx.fillRect(fx + 10, FLOOR_Y - 55, 70, 40);
    }

    // candles (glow)
    for (let i = 0; i < 6; i++) {
      const cdx = 160 + i * 420;
      if (cdx + 40 < cx || cdx - 40 > cx + VW) continue;
      ctx.fillStyle = "#1a1208";
      ctx.fillRect(cdx - 4, FLOOR_Y - 34, 8, 34);
      const flick = this.lightOn ? 0.7 + Math.sin(performance.now() / 100 + i) * 0.3 : 0.1;
      const cg = ctx.createRadialGradient(cdx, FLOOR_Y - 44, 0, cdx, FLOOR_Y - 44, 60);
      cg.addColorStop(0, `rgba(255,170,70,${0.5 * flick})`);
      cg.addColorStop(1, "rgba(255,170,70,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cdx, FLOOR_Y - 44, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,200,120,${flick})`;
      ctx.beginPath();
      ctx.arc(cdx, FLOOR_Y - 44, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // floor
    const fg = ctx.createLinearGradient(0, FLOOR_Y, 0, VH);
    fg.addColorStop(0, "#1a1310");
    fg.addColorStop(0.3, "#100c0a");
    fg.addColorStop(1, "#070504");
    ctx.fillStyle = fg;
    ctx.fillRect(cx, FLOOR_Y, VW, VH - FLOOR_Y);
    // floorboards
    ctx.strokeStyle = "rgba(40,28,20,0.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
      const lx = Math.floor((cx - 100) / 80) * 80 + i * 80;
      ctx.beginPath();
      ctx.moveTo(lx, FLOOR_Y);
      ctx.lineTo(lx + 6, VH);
      ctx.stroke();
    }
    // floor cracks
    ctx.strokeStyle = "rgba(10,6,4,0.8)";
    for (let i = 0; i < 8; i++) {
      const lx = (i * 300) % WORLD_W;
      ctx.beginPath();
      ctx.moveTo(lx, FLOOR_Y + 10);
      ctx.lineTo(lx + 40, FLOOR_Y + 60);
      ctx.lineTo(lx + 20, FLOOR_Y + 110);
      ctx.stroke();
    }

    // dust motes
    ctx.fillStyle = "rgba(200,190,170,0.5)";
    for (const d of this.envDust) {
      ctx.globalAlpha = d.alpha;
      ctx.fillRect(d.x - cx, d.y, d.size, d.size);
    }
    ctx.globalAlpha = 1;
  }

  _renderFog(ctx) {
    const cx = this.camera.x;
    for (const f of this.envFog) {
      const x = f.x - cx;
      if (x < -300 || x > VW + 300) continue;
      const a = f.alpha * (0.6 + Math.sin(f.phase) * 0.4);
      const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.size);
      g.addColorStop(0, `rgba(120,120,130,${a})`);
      g.addColorStop(1, "rgba(120,120,130,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _renderGroundCurses(ctx) {
    const cx = this.camera.x;
    for (const g of this.groundCurses) {
      const x = g.x - cx;
      if (x < -100 || x > VW + 100) continue;
      const grad = ctx.createRadialGradient(x, FLOOR_Y, 0, x, FLOOR_Y, g.w);
      grad.addColorStop(0, g.color);
      grad.addColorStop(0.6, "rgba(20,5,10,0.6)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, FLOOR_Y, g.w, g.h, 0, 0, Math.PI * 2);
      ctx.fill();
      // spikes
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const sx = x - g.w / 2 + (i / 5) * g.w;
        ctx.beginPath();
        ctx.moveTo(sx, FLOOR_Y);
        ctx.lineTo(sx + 4, FLOOR_Y - 30);
        ctx.lineTo(sx + 8, FLOOR_Y);
        ctx.stroke();
      }
    }
  }

  _renderHands(ctx) {
    const cx = this.camera.x;
    for (const h of this.hands) {
      const x = h.x - cx;
      if (x < -60 || x > VW + 60) continue;
      const telegraph = h.phase < 0.5;
      if (telegraph) {
        const a = (h.phase / 0.5) * 0.5;
        ctx.strokeStyle = `rgba(179,32,42,${a})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, FLOOR_Y, 40, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // shadow hand rising
        ctx.fillStyle = "rgba(10,6,8,0.9)";
        const rise = h.rise;
        // arm
        ctx.fillRect(x - 8, FLOOR_Y - rise, 16, rise);
        // fingers
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x - 12 + i * 8, FLOOR_Y - rise - 18, 5, 18);
        }
        // glow
        const g = ctx.createRadialGradient(x, FLOOR_Y - rise, 0, x, FLOOR_Y - rise, 50);
        g.addColorStop(0, `rgba(120,40,50,0.4)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, FLOOR_Y - rise, 50, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  _renderPlayer(ctx) {
    const p = this.player;
    const cx = this.camera.x;
    const x = p.x - cx;
    const y = p.y;
    const flick = p.invuln > 0 && Math.floor(p.invuln * 20) % 2 === 0;
    ctx.save();
    if (flick) ctx.globalAlpha = 0.4;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.ellipse(x, FLOOR_Y + 4, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const crouch = p.anim === "crouch" ? 0.7 : 1;
    const h = p.h * crouch;
    const legSwing = p.anim === "run" ? Math.sin(p.walkPhase) * 14 : 0;
    const coat = p.coatSway + (p.anim === "run" ? Math.sin(p.walkPhase + 1) * 6 : 0);

    // legs
    ctx.fillStyle = "#1a1416";
    ctx.fillRect(x - 14, y - 50 * crouch, 12, 50 * crouch + legSwing);
    ctx.fillRect(x + 2, y - 50 * crouch, 12, 50 * crouch - legSwing);

    // long coat (torso) - dark with crimson lining
    ctx.fillStyle = "#241a1c";
    ctx.beginPath();
    ctx.moveTo(x - 22, y - h + 10);
    ctx.lineTo(x + 22, y - h + 10);
    ctx.lineTo(x + 26 + coat, y - 30);
    ctx.lineTo(x + 18 + coat, y - 8);
    ctx.lineTo(x - 18 + coat, y - 8);
    ctx.lineTo(x - 26 + coat, y - 30);
    ctx.closePath();
    ctx.fill();
    // coat lining highlight
    ctx.strokeStyle = "rgba(120,30,40,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // chest glowing exorcist symbol
    const symPulse = 0.6 + Math.sin(p.animT * 3) * 0.3 + (p.exorcismT > 0 ? 0.6 : 0);
    const symG = ctx.createRadialGradient(x, y - h + 38, 0, x, y - h + 38, 30);
    symG.addColorStop(0, `rgba(200,220,255,${symPulse})`);
    symG.addColorStop(1, "rgba(200,220,255,0)");
    ctx.fillStyle = symG;
    ctx.beginPath();
    ctx.arc(x, y - h + 38, 30, 0, Math.PI * 2);
    ctx.fill();
    // cross symbol
    ctx.strokeStyle = `rgba(220,235,255,${symPulse})`;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#cfe8ff";
    ctx.beginPath();
    ctx.moveTo(x, y - h + 28);
    ctx.lineTo(x, y - h + 48);
    ctx.moveTo(x - 8, y - h + 36);
    ctx.lineTo(x + 8, y - h + 36);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // head + hood
    ctx.fillStyle = "#1c1416";
    ctx.beginPath();
    ctx.arc(x, y - h + 6, 16, 0, Math.PI * 2);
    ctx.fill();
    // hood shadow
    ctx.fillStyle = "#0a0608";
    ctx.beginPath();
    ctx.arc(x, y - h + 8, 12, 0, Math.PI);
    ctx.fill();
    // glowing eyes under hood
    ctx.fillStyle = p.hitT > 0 ? "#ff5a4d" : "#9be8d6";
    ctx.shadowBlur = 8;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(x - 6, y - h + 6, 3, 2);
    ctx.fillRect(x + 3, y - h + 6, 3, 2);
    ctx.shadowBlur = 0;

    // arm holding charm
    ctx.strokeStyle = "#241a1c";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x + 18 * p.facing, y - h + 30);
    ctx.lineTo(x + 30 * p.facing, y - h + 50);
    ctx.stroke();
    // charm glow
    const charmPulse = 0.5 + Math.sin(p.animT * 4) * 0.4;
    const chg = ctx.createRadialGradient(
      x + 30 * p.facing,
      y - h + 52,
      0,
      x + 30 * p.facing,
      y - h + 52,
      16,
    );
    chg.addColorStop(0, `rgba(180,220,255,${charmPulse})`);
    chg.addColorStop(1, "rgba(180,220,255,0)");
    ctx.fillStyle = chg;
    ctx.beginPath();
    ctx.arc(x + 30 * p.facing, y - h + 52, 16, 0, Math.PI * 2);
    ctx.fill();

    // hit flash
    if (p.hitT > 0) {
      ctx.fillStyle = `rgba(255,60,50,${p.hitT * 0.5})`;
      ctx.fillRect(x - 30, y - h - 10, 60, h + 20);
    }
    // purge ring
    if (p.purgeT > 0) {
      const r = (1 - p.purgeT / 0.5) * 80;
      ctx.strokeStyle = `rgba(140,220,180,${p.purgeT})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y - h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // exorcism aura
    if (p.exorcismT > 0) {
      const r = 60 + (1 - p.exorcismT / 0.7) * 80;
      const g = ctx.createRadialGradient(x, y - h / 2, 0, x, y - h / 2, r);
      g.addColorStop(0, `rgba(220,235,255,${p.exorcismT})`);
      g.addColorStop(1, "rgba(220,235,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y - h / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _renderSpirit(ctx) {
    const s = this.spirit;
    if (!s.visible && s.dashT <= 0) return;
    const cx = this.camera.x;
    const x = s.x - cx;
    const y = s.y;
    const def = s.def;
    const op = s.opacity * (this.distortionUntil > 0 ? 0.4 : 1);
    ctx.save();
    ctx.globalAlpha = op;

    // smoke aura
    for (let i = 0; i < 5; i++) {
      const a = 0.12 + Math.sin(s.floatT * 2 + i) * 0.05;
      const r = 70 + i * 14 + Math.sin(s.floatT + i) * 8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, def.color + "33");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + Math.sin(s.floatT + i) * 10, y + Math.cos(s.floatT + i) * 6, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // distorted silhouette body
    ctx.fillStyle = "#0a0608";
    ctx.beginPath();
    ctx.moveTo(x, y - 70);
    // wavy ghostly lower body
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const yy = y - 70 + t * 120;
      const wob = Math.sin(s.floatT * 3 + t * 6) * (10 + t * 18);
      ctx.lineTo(x - 36 + wob, yy);
    }
    ctx.lineTo(x, y + 60);
    for (let i = 12; i >= 0; i--) {
      const t = i / 12;
      const yy = y - 70 + t * 120;
      const wob = Math.sin(s.floatT * 3 + t * 6 + 1) * (10 + t * 18);
      ctx.lineTo(x + 36 + wob, yy);
    }
    ctx.closePath();
    ctx.fill();

    // tattered edges glow
    ctx.strokeStyle = def.color + "66";
    ctx.lineWidth = 2;
    ctx.stroke();

    // head
    ctx.fillStyle = "#0c0708";
    ctx.beginPath();
    ctx.arc(x, y - 78, 26, 0, Math.PI * 2);
    ctx.fill();

    // glowing eyes
    const eyeP = 0.6 + Math.sin(s.eyePulse * 4) * 0.3 + s.aggression * 0.3;
    ctx.shadowBlur = 16;
    ctx.shadowColor = def.eye;
    ctx.fillStyle = def.eye;
    ctx.globalAlpha = op * eyeP;
    ctx.beginPath();
    ctx.ellipse(x - 10, y - 80, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 10, y - 80, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // mouth (aggressive at low hp)
    if (s.aggression > 0.4) {
      ctx.fillStyle = "#3a0a0c";
      ctx.beginPath();
      ctx.ellipse(x, y - 70, 8, 4 + s.aggression * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = op;

    // long shadow on floor
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(x, FLOOR_Y + 2, 50, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // hit flash
    if (s.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${s.hitFlash})`;
      ctx.beginPath();
      ctx.arc(x, y, 80, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _renderProjectiles(ctx) {
    const cx = this.camera.x;
    for (const pr of this.projectiles) {
      const x = pr.x - cx;
      if (x < -40 || x > VW + 40) continue;
      const g = ctx.createRadialGradient(x, pr.y, 0, x, pr.y, pr.r * 2.5);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.3, pr.color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, pr.y, pr.r * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, pr.y, pr.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // trail
      ctx.strokeStyle = pr.color + "88";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, pr.y);
      ctx.lineTo(x - pr.vx * 0.03, pr.y - pr.vy * 0.03);
      ctx.stroke();
    }
  }

  _renderParticles(ctx) {
    for (const p of this.particles) p.render(ctx);
  }

  _renderDistortion(ctx) {
    const t = performance.now() / 50 + this.distortionSeed;
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 6; i++) {
      const y = (Math.sin(t + i) * 0.5 + 0.5) * VH;
      const h = rand(2, 10);
      ctx.fillStyle = i % 2 ? "rgba(120,40,60,0.3)" : "rgba(60,120,90,0.2)";
      ctx.fillRect(0, y, VW, h);
    }
    ctx.restore();
    // chromatic shift lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 20; i++) {
      const y = rand(0, VH);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VW, y + rand(-4, 4));
      ctx.stroke();
    }
  }

  _renderJumpscare(ctx) {
    const j = this.jumpscare;
    const a = j.t < j.dur * 0.5 ? j.t / (j.dur * 0.5) : 1 - (j.t - j.dur * 0.5) / (j.dur * 0.5);
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(0, 0, VW, VH);
    // spirit face
    const cx = VW / 2 + Math.sin(j.t * 60) * 8;
    const cy = VH / 2 + Math.cos(j.t * 50) * 6;
    const scale = 1 + a * 0.5;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    // distorted head
    ctx.fillStyle = "#0a0405";
    ctx.beginPath();
    ctx.arc(0, 0, 160, 0, Math.PI * 2);
    ctx.fill();
    // glowing eyes
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#ff3a2a";
    ctx.fillStyle = "#ff3a2a";
    ctx.beginPath();
    ctx.ellipse(-50, -30, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(50, -30, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // mouth
    ctx.fillStyle = "#3a0a0c";
    ctx.beginPath();
    ctx.ellipse(0, 50, 50, 30 + a * 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // teeth
    ctx.fillStyle = "#e8e2d0";
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 12, 30);
      ctx.lineTo(i * 12 + 6, 50);
      ctx.lineTo(i * 12 + 12, 30);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
