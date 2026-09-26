// Procedural WebAudio sound engine for TYPO EXORCIST.
// No external assets — every sound is synthesized. Safe to call before
// user gesture (it lazily resumes the AudioContext on first play).

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.ambientNodes = null;
  }

  _ensure() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  resume() {
    this._ensure();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  _env(node, gain, t, attack, decay, peak = 1, sustain = 0) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak * gain, t + attack);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain * gain), t + attack + decay);
    node.connect(g);
    g.connect(this.master);
    return g;
  }

  _now() {
    return this.ctx.currentTime;
  }

  // --- typing click ---
  type() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(220 + Math.random() * 60, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.05);
    this._env(o, 0.12, t, 0.001, 0.05);
    o.start(t);
    o.stop(t + 0.07);
  }

  // --- typo error: harsh glitch ---
  typo() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(180, t);
    o.frequency.linearRampToValueAtTime(60, t + 0.18);
    this._env(o, 0.22, t, 0.002, 0.2, 1, 0.0001);
    o.start(t);
    o.stop(t + 0.22);

    // noise burst
    this._noise(0.18, 0.18, 1200);
  }

  // --- SPACE purge: supernatural sweep ---
  purge() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(1800, t + 0.25);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.5);
    this._env(o, 0.18, t, 0.01, 0.5, 1, 0.0001);
    o.start(t);
    o.stop(t + 0.55);
    this._noise(0.3, 0.12, 800);
  }

  // --- jump ---
  jump() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(440, t + 0.12);
    this._env(o, 0.14, t, 0.005, 0.13);
    o.start(t);
    o.stop(t + 0.16);
  }

  land() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    this._env(o, 0.16, t, 0.002, 0.12);
    o.start(t);
    o.stop(t + 0.14);
  }

  // --- projectile whoosh ---
  projectile() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.35);
    this._env(o, 0.1, t, 0.01, 0.35, 1, 0.0001);
    o.start(t);
    o.stop(t + 0.38);
  }

  // --- hit / damage ---
  hit() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    this._env(o, 0.25, t, 0.002, 0.22, 1, 0.0001);
    o.start(t);
    o.stop(t + 0.24);
    this._noise(0.2, 0.2, 600);
  }

  // --- exorcism strike ---
  exorcism() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    [330, 495, 660, 990].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, t + i * 0.04);
      this._env(o, 0.14, t + i * 0.04, 0.02, 0.5, 1, 0.0001);
      o.start(t + i * 0.04);
      o.stop(t + 0.6 + i * 0.04);
    });
  }

  // --- teleport ---
  teleport() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(1200, t);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.18);
    this._env(o, 0.12, t, 0.005, 0.18, 1, 0.0001);
    o.start(t);
    o.stop(t + 0.2);
  }

  // --- jumpscare: loud impact ---
  jumpscare() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.4);
    this._env(o, 0.4, t, 0.001, 0.4, 1, 0.0001);
    o.start(t);
    o.stop(t + 0.42);
    this._noise(0.5, 0.4, 2000);
  }

  // --- boss entrance: deep rumble + heartbeat ---
  boss() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    for (let i = 0; i < 3; i++) {
      const tt = t + i * 0.7;
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(50, tt);
      o.frequency.exponentialRampToValueAtTime(30, tt + 0.4);
      this._env(o, 0.5, tt, 0.02, 0.5, 1, 0.0001);
      o.start(tt);
      o.stop(tt + 0.55);
    }
  }

  // --- victory ---
  victory() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    [392, 523, 659, 784, 1047].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, t + i * 0.12);
      this._env(o, 0.16, t + i * 0.12, 0.02, 0.5, 1, 0.0001);
      o.start(t + i * 0.12);
      o.stop(t + 0.6 + i * 0.12);
    });
  }

  // --- death ---
  death() {
    if (!this.ctx || this.muted) return;
    const t = this._now();
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 1.2);
    this._env(o, 0.3, t, 0.02, 1.2, 1, 0.0001);
    o.start(t);
    o.stop(t + 1.3);
  }

  // --- ambient drone (looping) ---
  startAmbient() {
    if (!this.ctx || this.muted || this.ambientNodes) return;
    const t = this._now();
    const g = this.ctx.createGain();
    g.gain.value = 0.06;
    g.connect(this.master);
    const o1 = this.ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 55;
    const o2 = this.ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 58; // slight beat
    const o3 = this.ctx.createOscillator();
    o3.type = "triangle";
    o3.frequency.value = 110;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    o1.connect(g);
    o2.connect(g);
    o3.connect(g);
    o1.start();
    o2.start();
    o3.start();
    lfo.start();
    this.ambientNodes = { g, o1, o2, o3, lfo };
  }

  stopAmbient() {
    if (!this.ambientNodes) return;
    const { g, o1, o2, o3, lfo } = this.ambientNodes;
    try {
      g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      o1.stop(this.ctx.currentTime + 0.6);
      o2.stop(this.ctx.currentTime + 0.6);
      o3.stop(this.ctx.currentTime + 0.6);
      lfo.stop(this.ctx.currentTime + 0.6);
    } catch {}
    this.ambientNodes = null;
  }

  _noise(dur, gain, lpFreq) {
    const t = this._now();
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lpFreq || 1000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + dur);
  }
}

export const sound = new SoundEngine();
