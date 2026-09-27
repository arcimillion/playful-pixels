import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Vote,
  ShieldAlert,
  Skull,
  Brain,
  Trophy,
  Lock,
  Sprout,
  Search,
  Headphones,
  Play,
  Pause,
  Sparkles,
  Store,
  FolderOpen,
  Server,
  Activity,
  AlertCircle,
  Pill,
} from "lucide-react";

export interface JobGig {
  id: string;
  title: string;
  description: string;
  cardColor: string;
  tapeColor: string;
  rotation: string;
  icon: React.ElementType;
  comingSoon?: boolean;
  buttonText?: string;
}

export const GIG_JOBS: JobGig[] = [
  {
    id: "exorcist",
    title: "Exorcist",
    description:
      "High risk job, defeat demons by repeating what they safe, they speak weird tho...",
    cardColor: "bg-pink-50 text-stone-800 border-rose-200/90",
    tapeColor: "bg-rose-200/80 border-rose-300/60",
    rotation: "rotate-1",
    icon: Skull,
  },
  {
    id: "politician",
    title: "Politician",
    description:
      "Automated policy generators created an electoral dead-end. Step in as a politician, reputed member of BAP (bichara admi party) to gain power.",
    cardColor: "bg-blue-50 text-stone-800 border-sky-200/90",
    tapeColor: "bg-sky-200/80 border-sky-300/60",
    rotation: "rotate-2",
    icon: Vote,
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Fight AI attacks from inside the computer! Deploy firewalls on the motherboard grid to stop incoming malware viruses.",
    cardColor: "bg-green-50 text-stone-800 border-emerald-200/90",
    tapeColor: "bg-emerald-200/80 border-emerald-300/60",
    rotation: "-rotate-2",
    icon: ShieldAlert,
  },
  {
    id: "fake-news-anchor",
    title: "Fake News Anchor",
    description:
      "Headline before deadline!! Fabricate news with given words to get clickbaits and most money possible in strict deadlines!",
    cardColor: "bg-yellow-50 text-stone-800 border-amber-200/90",
    tapeColor: "bg-amber-200/80 border-amber-300/60",
    rotation: "rotate-1",
    icon: Radio,
  },
  {
    id: "technical-interview",
    title: "Technical Job Interview",
    description:
      "Push forward! keep on trying for interviews anyway!! Face the ruthless AI Interrogator bot, inverted binary trees, LeetCode 9000, and live corporate panic rounds before time runs out!",
    cardColor: "bg-purple-50 text-stone-900 border-purple-200/90",
    tapeColor: "bg-purple-200/80 border-purple-300/60",
    rotation: "-rotate-1",
    icon: Brain,
  },
  {
    id: "farmer",
    title: "Farmer",
    description:
      "Tear up concrete, plant organic crops, and survive agricultural automated drones!",
    cardColor: "bg-amber-100 text-stone-900 border-amber-300/90",
    tapeColor: "bg-amber-300/80 border-amber-400/60",
    rotation: "rotate-1",
    icon: Sprout,
    comingSoon: true,
    buttonText: "Coming soon",
  },
  {
    id: "detective",
    title: "Detective",
    description:
      "Investigate complex cyber-crimes, analyze digital forensic clues, and solve high-stakes AI human cases across the metropolis!",
    cardColor: "bg-slate-200 text-stone-900 border-slate-400/90",
    tapeColor: "bg-slate-300/80 border-slate-400/60",
    rotation: "-rotate-1",
    icon: Search,
    comingSoon: true,
    buttonText: "Coming soon",
  },
];

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// Generate upbeat lo-fi instrumental audio loop
export function createUpbeatLofiAudioUrl(): string {
  try {
    const sampleRate = 44100;
    const duration = 8.0; // 8-second 4-bar loop @ 110 BPM
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF WAV Header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples * 2, true);

    // Upbeat 110 BPM Jazz-Hop Chord Progression
    const chords = [
      [349.23, 440.0, 523.25, 659.25], // Fmaj7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [392.0, 466.16, 587.33, 698.46], // Gm7
      [261.63, 329.63, 392.0, 466.16], // C7
    ];

    // Catchy Upbeat Lead Melody Frequencies
    const melody = [
      523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0, 523.25, 659.25, 783.99, 880.0, 783.99,
      659.25, 587.33, 523.25, 587.33,
    ];

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const barTime = t % 2.0;
      const chordIdx = Math.floor((t % 8.0) / 2.0);
      const currentChord = chords[chordIdx];

      // 1. Electric Piano Chords
      let chordSample = 0;
      const chordEnv = Math.exp(-barTime * 2.0);
      for (const freq of currentChord) {
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const overtone = 0.25 * Math.sin(2 * Math.PI * freq * 2 * t);
        chordSample += (fundamental + overtone) * chordEnv * 0.16;
      }

      // 2. Upbeat Lead Melody
      const noteIdx = Math.floor(t * 2) % melody.length;
      const noteTime = (t * 2) % 1.0;
      const leadFreq = melody[noteIdx];
      const leadEnv = Math.exp(-noteTime * 3.5);
      const leadSample =
        (Math.sin(2 * Math.PI * leadFreq * t) + 0.2 * Math.sin(2 * Math.PI * leadFreq * 1.5 * t)) *
        leadEnv *
        0.14;

      // 3. Upbeat Lo-Fi Drums
      let kick = 0;
      const kickTimes = [0.0, 0.75, 1.25];
      for (const kt of kickTimes) {
        if (barTime >= kt && barTime < kt + 0.12) {
          const dt = barTime - kt;
          kick += Math.sin(2 * Math.PI * (140 - dt * 700) * dt) * Math.exp(-dt * 35);
        }
      }

      let snare = 0;
      const snareTimes = [0.5, 1.5];
      for (const st of snareTimes) {
        if (barTime >= st && barTime < st + 0.15) {
          const dt = barTime - st;
          const noise = Math.random() * 2 - 1;
          snare += (noise * 0.6 + Math.sin(2 * Math.PI * 200 * dt) * 0.4) * Math.exp(-dt * 25);
        }
      }

      let hat = 0;
      const hatTime = barTime % 0.25;
      if (hatTime < 0.05) {
        hat = (Math.random() * 2 - 1) * Math.exp(-hatTime * 100) * 0.12;
      }

      // 4. Bassline
      const rootFreq = currentChord[0] / 2;
      const bassEnv = Math.exp(-barTime * 1.8);
      const bass = Math.sin(2 * Math.PI * rootFreq * t) * bassEnv * 0.26;

      let mixed = chordSample + leadSample + kick * 0.35 + snare * 0.2 + hat + bass;
      mixed = Math.max(-1, Math.min(1, mixed));
      const int16 = mixed < 0 ? mixed * 0x8000 : mixed * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

// Generate realistic procedural ambient rain audio loop - soft, soothing, and audible
export function createRainAudioUrl(): string {
  try {
    const sampleRate = 44100;
    const duration = 8.0; // 8-second seamless loop
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM mono
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    let b0 = 0,
      b1 = 0,
      b2 = 0;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      // 1. Soothing rain background shower (pink noise filtered for gentle pitter-patter)
      const white = Math.random() * 2 - 1;
      b0 = 0.92 * b0 + 0.08 * white;
      b1 = 0.9 * b1 + 0.1 * b0;
      b2 = 0.88 * b2 + 0.12 * b1;

      // Gentle undulating rain intensity
      const breeze = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.125 * t);
      const rainBase = b2 * 0.4 * breeze;

      // 2. Clear, pleasant raindrop patters tapping gently
      let drop = 0;
      const dropCycle = (t * 14) % 1.0;
      const dropSeed = Math.floor(t * 14);
      if (((dropSeed * 9301 + 49297) % 233280) / 233280 < 0.4) {
        const dropFreq = 480 + ((dropSeed * 1234) % 350);
        const env = Math.exp(-dropCycle * 45);
        drop = Math.sin(2 * Math.PI * dropFreq * t) * env * 0.12;
      }

      let mixed = rainBase + drop;
      mixed = Math.max(-1, Math.min(1, mixed));
      const int16 = mixed < 0 ? mixed * 0x8000 : mixed * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

// Generate realistic procedural ambient thundercloud sound loop - soft thundercloud song for comforting audios
export function createThunderAudioUrl(): string {
  try {
    const sampleRate = 44100;
    const duration = 8.0; // 8-second smooth looping song
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false);
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, numSamples * 2, true);

    // Comforting & Soothing Thundercloud Song Chords (Ebmaj7 - Cm7 - Fm7 - Abmaj7)
    const chords = [
      [155.56, 196.0, 233.08, 293.66], // Ebmaj7 (Soft warm comforting pad)
      [130.81, 155.56, 196.0, 233.08], // Cm7
      [174.61, 207.65, 261.63, 311.13], // Fm7
      [207.65, 261.63, 311.13, 392.0], // Abmaj7
    ];

    // Comforting, lullaby-style gentle lead melody
    const melody = [
      392.0, 349.23, 311.13, 261.63, 311.13, 349.23, 392.0, 466.16, 415.3, 392.0, 349.23, 311.13,
      349.23, 311.13, 261.63, 233.08,
    ];

    let offset = 44;
    let b0 = 0,
      b1 = 0,
      b2 = 0;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const barTime = t % 2.0;
      const chordIdx = Math.floor((t % 8.0) / 2.0);
      const currentChord = chords[chordIdx];

      // 1. Soothing Ambient Synth / Rhodes Chords ("Thundercloud Song")
      let chordSample = 0;
      const chordEnv = Math.exp(-barTime * 1.2);
      for (const freq of currentChord) {
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const warmHarmonic = 0.2 * Math.sin(2 * Math.PI * freq * 2 * t);
        chordSample += (fundamental + warmHarmonic) * chordEnv * 0.12;
      }

      // 2. Comforting Sleep/Cozy Lead Melody
      const noteIdx = Math.floor(t * 2) % melody.length;
      const noteTime = (t * 2) % 1.0;
      const leadFreq = melody[noteIdx];
      const leadEnv = Math.exp(-noteTime * 2.8);
      const leadSample =
        (Math.sin(2 * Math.PI * leadFreq * t) + 0.15 * Math.sin(2 * Math.PI * leadFreq * 1.5 * t)) *
        leadEnv *
        0.1;

      // 3. Soft, Distant Rolling Thunder Rumble (Gentle background rumble)
      const white = Math.random() * 2 - 1;
      b0 = 0.98 * b0 + 0.02 * white;
      b1 = 0.96 * b1 + 0.04 * b0;
      b2 = 0.94 * b2 + 0.06 * b1;

      // Distant rolling thunder peals at ~2.2s and ~6.0s
      const peal1 = Math.exp(-Math.pow(t - 2.2, 2) * 1.8) * 0.8;
      const peal2 = Math.exp(-Math.pow(t - 6.0, 2) * 1.5) * 0.7;
      const rumbleEnv = 0.2 + peal1 + peal2;

      const subBass = Math.sin(2 * Math.PI * (45 + Math.sin(t * 2) * 10) * t) * 0.18 * rumbleEnv;
      const thunderRumble = (b2 * 0.35 * rumbleEnv + subBass) * 0.4;

      let mixed = chordSample + leadSample + thunderRumble;
      mixed = Math.max(-1, Math.min(1, mixed));
      const int16 = mixed < 0 ? mixed * 0x8000 : mixed * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

export interface DashboardProps {
  debt?: number;
  savings?: number;
  trophies?: Trophy[];
  hasGym?: boolean;
  setHasGym?: (val: boolean) => void;
  hasHeadphones?: boolean;
  setHasHeadphones?: (val: boolean) => void;
  hasLofiMusic?: boolean;
  setHasLofiMusic?: (val: boolean) => void;
  hasSeenFreedomCutscene?: boolean;
  setHasSeenFreedomCutscene?: (val: boolean) => void;
  isMusicUnlocked?: boolean;
  setIsMusicUnlocked?: (val: boolean) => void;
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
  hasCoffeeMachine?: boolean;
  hasGoldenResume?: boolean;
  hasVipCasinoPass?: boolean;
  setSavings?: React.Dispatch<React.SetStateAction<number>>;
  setDebt?: React.Dispatch<React.SetStateAction<number>>;
  onAcceptGig?: (jobId: string, jobTitle: string) => void;
  onBackToDesktop?: () => void;
  onOpenShop?: () => void;
  isFeverActive?: boolean;
  completedJobsCount?: number;
  onTriggerFever?: () => void;
  onDismissFever?: () => void;
}

export function Dashboard({
  debt = 50000,
  savings = 0,
  trophies = [],
  hasGym = false,
  hasHeadphones = false,
  hasLofiMusic = false,
  hasSeenFreedomCutscene: propHasSeenFreedomCutscene,
  setHasSeenFreedomCutscene: propSetHasSeenFreedomCutscene,
  currentTheme = "dark",
  hasCoffeeMachine = false,
  hasGoldenResume = false,
  hasVipCasinoPass = false,
  setSavings,
  setDebt: propSetDebt,
  onAcceptGig,
  onBackToDesktop,
  onOpenShop,
  isFeverActive = false,
  completedJobsCount = 0,
  onTriggerFever,
  onDismissFever,
}: DashboardProps) {
  const [internalHasSeenCutscene, setInternalHasSeenCutscene] = useState(false);
  const hasSeenFreedomCutscene =
    propHasSeenFreedomCutscene !== undefined ? propHasSeenFreedomCutscene : internalHasSeenCutscene;
  const setHasSeenFreedomCutscene = propSetHasSeenFreedomCutscene || setInternalHasSeenCutscene;

  const [isShopHovered, setIsShopHovered] = useState(false);
  const [isCutsceneActive, setIsCutsceneActive] = useState(false);
  const [cutsceneText, setCutsceneText] = useState("");
  const [cutsceneFading, setCutsceneFading] = useState(false);

  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [showTrophiesModal, setShowTrophiesModal] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);

  // Audio state
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [lofiAudioUrl, setLofiAudioUrl] = useState<string>("");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  useEffect(() => {
    const url = createUpbeatLofiAudioUrl();
    setLofiAudioUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const toggleMusic = () => {
    if (!audioElementRef.current) return;
    if (isPlayingMusic) {
      audioElementRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioElementRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(true));
    }
  };

  // 2. The Typewriter Cutscene (Debt Cleared)
  useEffect(() => {
    if (debt <= 0 && !hasSeenFreedomCutscene && !isCutsceneActive) {
      setIsCutsceneActive(true);
      setCutsceneText("");
      setCutsceneFading(false);

      const targetText = "now im free to have fun";
      let charIndex = 0;

      const typeInterval = setInterval(() => {
        charIndex++;
        setCutsceneText(targetText.slice(0, charIndex));

        if (charIndex >= targetText.length) {
          clearInterval(typeInterval);
        }
      }, 70);

      const unmountTimer = setTimeout(() => {
        clearInterval(typeInterval);
        setCutsceneText(targetText);
        setCutsceneFading(true);
        setTimeout(() => {
          setIsCutsceneActive(false);
          setHasSeenFreedomCutscene(true);
        }, 500);
      }, 3500);

      return () => {
        clearInterval(typeInterval);
        clearTimeout(unmountTimer);
      };
    }
  }, [debt, hasSeenFreedomCutscene, isCutsceneActive, setHasSeenFreedomCutscene]);

  // If debt > 0 while cutscene was running, dismiss cutscene
  useEffect(() => {
    if (debt > 0 && isCutsceneActive) {
      setIsCutsceneActive(false);
    }
  }, [debt, isCutsceneActive]);

  const handleAccept = (job: JobGig) => {
    if (job.comingSoon) {
      setComingSoonToast(`⏳ ${job.title} — ${job.buttonText}!`);
      setTimeout(() => setComingSoonToast(null), 3500);
      return;
    }
    setAcceptedId(job.id);
    if (onAcceptGig) {
      onAcceptGig(job.id, job.title);
    }
  };

  const unlockedCount = trophies.filter((t) => t.unlocked).length;
  const isHacker = currentTheme === "hacker";
  const isShopLocked = debt > 0 || !hasSeenFreedomCutscene;

  return (
    <div
      className={`relative min-h-screen w-full overflow-y-auto selection:bg-amber-200 selection:text-stone-900 transition-colors duration-300 ${
        isHacker ? "bg-black text-green-500 font-mono" : "bg-stone-900 text-stone-100 font-sans"
      }`}
    >
      {/* Scanline overlay for hacker theme */}
      {isHacker && (
        <div
          className="pointer-events-none fixed inset-0 z-10 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      )}

      {/* Toast Notification */}
      {comingSoonToast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce rounded-xl border px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide shadow-2xl ${
            isHacker
              ? "bg-black border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
              : "border-amber-400 bg-amber-500 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          }`}
        >
          {comingSoonToast}
        </div>
      )}

      {/* Ambient background glow */}
      {!isHacker && (
        <div
          className="pointer-events-none fixed inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(ellipse 65% 50% at 50% 12%, rgba(254, 240, 138, 0.20), transparent 70%),
              radial-gradient(ellipse 75% 65% at 50% 50%, rgba(68, 52, 42, 0.45), transparent 85%),
              radial-gradient(circle at 50% 100%, rgba(20, 16, 14, 0.85), #1c1917)
            `,
          }}
        />
      )}

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ================= HEADER SECTION ================= */}
        <header className="flex flex-col justify-between gap-6 border-b pb-6 border-stone-800/80 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                  isHacker
                    ? "border border-green-500 bg-green-950/60 text-green-400"
                    : "border border-stone-700 bg-stone-800 text-stone-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Human-Only Terminal
              </span>

              {hasCoffeeMachine && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/60 bg-amber-950/60 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300 animate-pulse">
                  ☕ Espresso Bar: +$100/5s
                </span>
              )}

              {hasGoldenResume && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/60 bg-yellow-950/60 px-2.5 py-0.5 font-mono text-xs font-bold text-yellow-300">
                  📜 Golden Resume: +50% Gig Income
                </span>
              )}

              {hasVipCasinoPass && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/60 bg-purple-950/60 px-2.5 py-0.5 font-mono text-xs font-bold text-purple-300">
                  🎰 VIP Casino: +25% Payouts
                </span>
              )}

              {onBackToDesktop && (
                <button
                  onClick={onBackToDesktop}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold transition-colors cursor-pointer ${
                    isHacker
                      ? "border-green-500 bg-black text-green-400 hover:bg-green-950"
                      : "border-stone-700 bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
                  }`}
                >
                  ← Back to Desktop
                </button>
              )}

              {/* 1. The Persistent Shop Icon & Tooltip on Toolbar */}
              <div className="relative group">
                <button
                  onClick={() => {
                    if (isShopLocked) return;
                    if (onOpenShop) onOpenShop();
                  }}
                  onMouseEnter={() => setIsShopHovered(true)}
                  onMouseLeave={() => setIsShopHovered(false)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 font-mono text-xs font-bold transition-all relative ${
                    isShopLocked
                      ? "border-stone-800 bg-stone-900/60 text-stone-500 cursor-not-allowed opacity-80"
                      : isHacker
                        ? "border-green-500/70 bg-green-950/70 text-green-300 hover:bg-green-900 shadow-[0_0_12px_rgba(34,197,94,0.4)] cursor-pointer"
                        : "border-amber-400 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-pointer"
                  }`}
                  title={isShopLocked ? "must clear debt before shopping" : "Open Lifestyle Shop"}
                >
                  <div className="relative flex items-center justify-center">
                    <Store className="h-3.5 w-3.5" />
                    {isShopLocked && (
                      <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm ring-1 ring-stone-900">
                        <Lock className="h-2 w-2" />
                      </span>
                    )}
                  </div>
                  <span>Shop</span>
                </button>

                {/* Tooltip */}
                {isShopLocked && isShopHovered && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 whitespace-nowrap rounded-md border border-red-500/60 bg-stone-950 px-2.5 py-1 font-mono text-[11px] font-bold text-red-400 shadow-xl pointer-events-none animate-in fade-in zoom-in-95">
                    must clear debt before shopping
                  </div>
                )}
              </div>

              {/* Trophies Button */}
              <button
                onClick={() => setShowTrophiesModal(true)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                  isHacker
                    ? "border-green-500/60 bg-green-950/60 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    : "border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 shadow-[0_0_10px_rgba(251,191,36,0.15)]"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>
                  Trophies ({unlockedCount}/{trophies.length})
                </span>
              </button>
            </div>

            <h1
              className={`font-mono text-3xl sm:text-4xl font-black tracking-tight ${
                isHacker
                  ? "text-green-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                  : "text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              }`}
            >
              {isHacker ? "ROOT@PORTAL:~# GIGS" : "Career Options (T_T)"}
            </h1>
            <p
              className={`mt-1 font-mono text-xs sm:text-sm italic ${
                isHacker ? "text-green-600" : "text-stone-400"
              }`}
            >
              {debt <= 0
                ? "DEBT FULLY WIPED OUT! Freedom unlocked · Lifestyle shop open for business ☕"
                : "desperate late-night job search... need to clear debt ☕"}
            </p>

            {/* Profile Status Badge */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-800/60 font-mono text-xs">
              <span className="text-stone-400 font-bold">PROFILE:</span>
              <span
                className={`px-2.5 py-0.5 rounded font-bold border ${
                  hasGym
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "bg-stone-800 text-stone-400 border-stone-700"
                }`}
              >
                {hasGym ? "Physique: Chad (Gym Member)" : "Physique: Sleep-deprived coder"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded font-bold border ${
                  debt <= 0
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
                    : isHacker
                      ? "bg-green-950/40 text-green-500 border-green-800"
                      : "bg-red-500/20 text-red-300 border-red-500/40"
                }`}
              >
                {debt <= 0 ? "Status: DEBT-FREE 🏆" : "Status: Indebted Freelancer"}
              </span>
            </div>
          </div>

          {/* Right: Urgent Financial Status Sticky Notes */}
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4">
            {/* Debt Notice */}
            <div className="relative rotate-1 transition-transform hover:rotate-0 duration-200">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full border shadow-md ${
                    debt <= 0
                      ? "bg-emerald-600 border-emerald-700 ring-2 ring-emerald-400/40"
                      : "bg-red-600 border-red-700 ring-2 ring-red-400/40"
                  }`}
                />
                <div className="h-1.5 w-0.5 bg-stone-800 -mt-0.5" />
              </div>
              <div
                className={`rounded-sm border p-3 pt-4 shadow-sm min-w-[180px] ${
                  debt <= 0
                    ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                    : "border-red-200 bg-red-100 text-red-800"
                }`}
              >
                <div className="border-b pb-1 text-center font-mono text-[11px] font-black tracking-widest uppercase">
                  {debt <= 0 ? "DEBT CLEARED" : "ACTIVE DEBT"}
                </div>
                <div className="mt-1 text-center">
                  <div className="font-mono text-xl sm:text-2xl font-black tracking-tight">
                    ${isNaN(Number(debt)) ? "0" : Number(debt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Notice */}
            <div
              className={`relative -rotate-1 transition-transform hover:rotate-0 duration-200 ${
                debt === 0 ? "animate-pulse" : ""
              }`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-emerald-600 border border-emerald-700 shadow-md ring-2 ring-emerald-400/40" />
                <div className="h-1.5 w-0.5 bg-stone-800 -mt-0.5" />
              </div>
              <div className="rounded-sm border border-emerald-200 bg-emerald-100 p-3 pt-4 text-emerald-900 shadow-sm min-w-[180px]">
                <div className="border-b border-emerald-200 pb-1 text-center font-mono text-[11px] font-black tracking-widest text-emerald-900 uppercase">
                  SAVINGS {debt <= 0 ? "★ FREEDOM" : ""}
                </div>
                <div className="mt-1 text-center">
                  <div className="font-mono text-xl sm:text-2xl font-black tracking-tight text-emerald-900">
                    ${isNaN(Number(savings)) ? "0" : Number(savings).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ================= 2. THEMATIC WIDGET: THE ENCRYPTED NODE ================= */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div
            onClick={() => {
              if (isShopLocked) return;
              if (onOpenShop) onOpenShop();
            }}
            onMouseEnter={() => setIsShopHovered(true)}
            onMouseLeave={() => setIsShopHovered(false)}
            className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-lg border-2 font-mono transition-all duration-300 select-none ${
              isShopLocked
                ? "border-slate-700/50 bg-slate-900/50 text-slate-400 cursor-not-allowed"
                : "border-amber-500/50 hover:border-amber-400 bg-slate-900/80 text-slate-200 cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:scale-[1.01]"
            }`}
          >
            {/* Terminal Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-700/40 pb-3 mb-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-600" />
                <span className="font-bold tracking-wider text-slate-300">
                  RESTRICTED ACCESS // OFF-GRID UPGRADES
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isShopLocked
                    ? "border-slate-700 bg-slate-800 text-slate-400"
                    : "border-amber-500/50 bg-amber-950/40 text-amber-400"
                }`}
              >
                {isShopLocked ? "NODE: LOCKED" : "NODE: ONLINE"}
              </span>
            </div>

            {/* Locked vs Unlocked Central Display */}
            {isShopLocked ? (
              <div className="flex flex-col items-center text-center py-2">
                {/* Large Faded Gray Padlock SVG */}
                <Lock className="h-12 w-12 text-slate-500/80 mb-3" />

                <div className="space-y-1">
                  <p className="text-sm font-bold tracking-widest text-slate-300 uppercase">
                    STATUS: ENCRYPTED
                  </p>
                  <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    REQUIREMENT: CLEAR ALL DEBT
                  </p>
                </div>

                <p className="mt-3 text-xs text-slate-500 max-w-md">
                  System payload quarantined. Fulfill student debt balance to decrypt lifestyle
                  upgrades and black-market casino node.
                </p>

                {/* Exact Tooltip for Locked State */}
                {isShopHovered && (
                  <div className="mt-4 inline-block font-mono text-xs font-bold text-red-400 bg-slate-950 border border-red-500/50 px-3 py-1.5 rounded-md shadow-md animate-in fade-in">
                    must clear debt before shopping
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                {/* Sleek Open Folder / Secure Server Icon */}
                <FolderOpen className="h-12 w-12 text-amber-400 mb-3 animate-pulse" />

                <div className="space-y-1">
                  <p className="text-base font-black tracking-widest text-amber-400 uppercase">
                    ACCESS GRANTED // ENTER MARKET
                  </p>
                  <p className="text-xs font-medium tracking-wider text-slate-300">
                    Click anywhere to enter the Lifestyle Shop & Degenerate Casino
                  </p>
                </div>

                <div className="mt-4 px-5 py-2 rounded-md border border-amber-500/60 bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wider uppercase hover:bg-amber-500/30 transition">
                  OPEN MARKETPLACE →
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= TROPHIES MODAL ================= */}
        {showTrophiesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-2xl border-2 border-amber-500/60 bg-[#140f0c] p-6 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
              <div className="border-b border-amber-900/40 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h3 className="font-mono text-base font-black uppercase tracking-wider text-amber-200">
                      Career Achievements ({unlockedCount}/{trophies.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowTrophiesModal(false)}
                    className="rounded-lg bg-stone-800 px-2.5 py-1 font-mono text-xs text-stone-300 hover:bg-stone-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Trophy Completion Progress Bar */}
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden border border-stone-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    style={{
                      width: `${trophies.length > 0 ? (unlockedCount / trophies.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                {trophies.map((trophy) => (
                  <div
                    key={trophy.id}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      trophy.unlocked
                        ? "border-amber-500/50 bg-amber-950/30 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                        : "border-stone-800 bg-stone-900/50 text-stone-500 opacity-60"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        trophy.unlocked
                          ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                          : "border-stone-800 bg-stone-800 text-stone-600"
                      }`}
                    >
                      {trophy.unlocked ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-200">
                        {trophy.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed font-medium text-stone-300">
                        {trophy.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setShowTrophiesModal(false)}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-mono text-xs font-black uppercase tracking-wider text-stone-950 hover:bg-amber-400 cursor-pointer"
                >
                  Close Trophies
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2x2 JOB GRID (PASTEL STICKY NOTES) ================= */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8 pb-16">
          {GIG_JOBS.map((job) => {
            const Icon = job.icon;
            const isAccepted = acceptedId === job.id;

            return (
              <div
                key={job.id}
                onClick={() => handleAccept(job)}
                className={`group relative flex flex-col justify-between rounded-lg border p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${job.cardColor} ${job.rotation}`}
              >
                {/* Masking tape */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-20 rounded-xs border shadow-2xs backdrop-blur-xs opacity-85 ${job.tapeColor} rotate-[-1deg]`}
                />

                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-800/20 bg-white/70 text-stone-900 shadow-2xs">
                      <Icon className="h-5 w-5 text-stone-800" />
                    </div>
                    <h3 className="font-mono text-xl font-black text-stone-900 tracking-tight">
                      {job.title}
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-stone-800 font-medium">
                    {job.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-stone-800/10 pt-4">
                  <span className="font-mono text-[11px] text-stone-500">
                    {isAccepted ? "✓ Accepted" : ""}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(job);
                    }}
                    className={`flex items-center gap-1.5 rounded-full border border-stone-800/80 px-5 py-2 font-mono text-xs font-bold shadow-xs transition-all active:translate-y-0.5 cursor-pointer ${
                      job.comingSoon
                        ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                        : "bg-white text-stone-900 hover:bg-stone-100 hover:shadow-sm"
                    }`}
                  >
                    <span>{job.buttonText || "CHOOSE CAREER →"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-6 pb-20 text-center font-mono text-xs text-stone-500">
          <p>☕ Late-Night Human Career Hunt · Choose wisely, future awaits!</p>
        </footer>
      </div>

      {/* ================= FEVER CUTSCENE & PENALTY OVERLAY ================= */}
      {isFeverActive && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/80 p-4 sm:p-6 text-center select-none backdrop-blur-md animate-in fade-in duration-200 font-mono">
          <div className="relative max-w-md w-full rounded-2xl border border-amber-900/50 bg-[#181513] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.9)] text-left overflow-hidden">
            {/* Masking Tape Decor */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-24 rounded-xs border border-amber-300/60 bg-amber-200/80 shadow-xs backdrop-blur-xs opacity-90 rotate-[-1deg]" />

            {/* Cozy Header */}
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Pill className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-black uppercase tracking-wider text-amber-200">
                    Fever Attack
                  </h3>
                  <p className="text-[11px] text-stone-400 font-medium">Overwork Exhaustion</p>
                </div>
              </div>
              <span className="rounded-full bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 text-[10px] font-bold text-red-300 uppercase tracking-wider">
                -$200 Bill
              </span>
            </div>

            {/* Bill Thought / Quote Box */}
            <div className="mb-6 rounded-xl border border-stone-800 bg-stone-900/80 p-4 text-center shadow-inner">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 mb-1.5">
                💭 Bill
              </div>
              <p className="text-base sm:text-lg font-mono font-medium text-amber-100/90 leading-snug">
                &ldquo;fever again... i should join a gym when i have money&rdquo;
              </p>
            </div>

            {/* Minimal Cozy Medical Bill Summary */}
            <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4 mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                  Medical Bill &amp; Medication
                </span>
                <span className="text-red-400 font-mono text-sm">-$200.00</span>
              </div>
            </div>

            {/* Take Meds Button */}
            <button
              onClick={() => {
                if (onDismissFever) onDismissFever();
              }}
              className="w-full py-3.5 px-4 rounded-xl border border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-amber-100 font-mono font-black text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <Pill className="h-4 w-4 text-amber-300" />
              <span>[ Take Meds &amp; Pay Bill ]</span>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Audio Player widget when headphones unlocked */}
      {hasLofiMusic && (
        <div className="fixed bottom-4 right-4 sm:right-6 z-40 flex items-center gap-3 rounded-2xl border border-cyan-500/50 bg-stone-950/90 p-3 px-4 shadow-[0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-md animate-in slide-in-from-bottom-5">
          <audio
            ref={audioElementRef}
            loop
            src={lofiAudioUrl}
            onPlay={() => setIsPlayingMusic(true)}
            onPause={() => setIsPlayingMusic(false)}
          />

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Headphones className={`h-4 w-4 ${isPlayingMusic ? "animate-pulse" : ""}`} />
            </div>

            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  UPBEAT LO-FI RADIO
                </span>
              </div>
              <p className="text-[11px] font-mono text-stone-300 truncate max-w-[160px] sm:max-w-[200px]">
                ♪ Catchy Upbeat Instrumental Loop
              </p>
            </div>
          </div>

          <button
            onClick={toggleMusic}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-stone-950 hover:bg-cyan-400 transition cursor-pointer shadow-sm"
            title={isPlayingMusic ? "Pause Stream" : "Play Stream"}
          >
            {isPlayingMusic ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>
      )}

      {/* ================= 2. THE TYPEWRITER CUTSCENE (DEBT CLEARED) ================= */}
      {isCutsceneActive && (
        <div
          onClick={() => {
            setIsCutsceneActive(false);
            setHasSeenFreedomCutscene(true);
          }}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black px-6 text-center transition-opacity duration-700 select-none cursor-pointer ${
            cutsceneFading ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          title="Click to continue"
        >
          <div className="relative max-w-xl">
            <div className="font-mono text-2xl sm:text-4xl text-green-400 font-black tracking-widest drop-shadow-[0_0_20px_rgba(34,197,94,0.9)] lowercase">
              <span>{cutsceneText}</span>
              <span className="inline-block w-3 h-7 bg-green-400 ml-1.5 align-middle animate-pulse" />
            </div>
            <p className="mt-4 font-mono text-xs text-stone-500 uppercase tracking-widest">
              — Freedom Achieved · Debt Cleared —
            </p>
            <p className="mt-6 font-mono text-[11px] text-stone-600 animate-pulse">
              (click anywhere to continue)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
