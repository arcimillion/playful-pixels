import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dashboard, Trophy } from "./components/Dashboard";
import { ShopPage } from "./components/ShopPage";
import { CasinoPage } from "./components/CasinoPage";

// Upbeat Lo-Fi Audio generator for HTML5 audio
function createUpbeatLofiAudioUrl(): string {
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

// Procedural audio synthesizer for click effects
function playProceduralClick() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.025);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (err) {
    void err;
  }
}

export function App() {
  // 1. Page Navigation State: 'dashboard' | 'shop' | 'casino'
  const [currentView, setCurrentView] = useState<"dashboard" | "shop" | "casino">("dashboard");

  // Core Game Financial States
  const [debt, setDebt] = useState<number>(30000);
  const [savings, setSavings] = useState<number>(0);

  // 1. Job Counter & Fever Trigger State
  const [completedJobsCount, setCompletedJobsCount] = useState<number>(0);
  const [isFeverActive, setIsFeverActive] = useState<boolean>(false);
  const [hasGym, setHasGym] = useState<boolean>(false);

  // Persistent Shop Upgrades State
  const [hasBubbles, setHasBubbles] = useState<boolean>(false);
  const [hasClickSound, setHasClickSound] = useState<boolean>(false);
  const [hasCustomButtons, setHasCustomButtons] = useState<boolean>(false);
  const [hasVignette, setHasVignette] = useState<boolean>(false);
  const [hasBackgroundAudio, setHasBackgroundAudio] = useState<boolean>(false);

  const [hasSeenFreedomCutscene, setHasSeenFreedomCutscene] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>("dark");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [lofiAudioUrl, setLofiAudioUrl] = useState<string>("");

  useEffect(() => {
    const url = createUpbeatLofiAudioUrl();
    setLofiAudioUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  // Attach synthesized HTML5 Web Audio API beep to button click events globally
  useEffect(() => {
    if (!hasClickSound) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("button, a, input, select, [role='button'], .cursor-pointer")) {
        playProceduralClick();
      }
    };
    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, [hasClickSound]);

  // Trophies
  const [trophies, setTrophies] = useState<Trophy[]>([
    {
      id: "debt_slayer",
      title: "Debt Slayer",
      description: "Clear all $30,000 debt ($0 remaining)",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "savings_tycoon",
      title: "Savings Tycoon",
      description: "Accumulate $5,000+ in savings",
      icon: "trophy",
      unlocked: false,
    },
  ]);

  const showToast = useCallback((msg: string, duration = 4000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, duration);
  }, []);

  // Toggle Background Audio
  const toggleAudio = useCallback(() => {
    if (!audioElementRef.current) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(true));
    }
  }, [isPlayingAudio]);

  // Trigger Fever Cutscene & $200 Financial Penalty
  const triggerFeverEvent = useCallback(() => {
    setIsFeverActive(true);
    setSavings((s) => {
      const currentSavings = typeof s === "number" && !isNaN(s) ? s : 0;
      if (currentSavings >= 200) {
        return currentSavings - 200;
      } else {
        const remainder = 200 - currentSavings;
        setDebt((d) => (typeof d === "number" && !isNaN(d) ? d : 0) + remainder);
        return 0;
      }
    });
    showToast("⚠️ Severe Burnout Fever triggered! -$200 medical penalty.");
  }, [showToast]);

  // Dismiss Fever & Reset Counter
  const dismissFeverEvent = useCallback(() => {
    setIsFeverActive(false);
    setCompletedJobsCount(0);
  }, []);

  // Handle Gig Payouts & Job Counter Lifecycle (Every 2 completed games)
  const handleEarnMoney = useCallback(
    (amount: number) => {
      setDebt((prevDebt) => {
        const currentDebt = typeof prevDebt === "number" && !isNaN(prevDebt) ? prevDebt : 30000;
        if (currentDebt > 0) {
          const leftover = amount - currentDebt;
          if (leftover >= 0) {
            setSavings((s) => (typeof s === "number" && !isNaN(s) ? s : 0) + leftover);
            return 0;
          } else {
            return currentDebt - amount;
          }
        } else {
          setSavings((s) => (typeof s === "number" && !isNaN(s) ? s : 0) + amount);
          return 0;
        }
      });

      // Increment completed jobs count
      setCompletedJobsCount((prev) => {
        const nextCount = (prev || 0) + 1;
        if (nextCount > 0 && nextCount % 2 === 0) {
          if (hasGym) {
            showToast("💪 Gym Membership activated! Fever event prevented.");
            return 0;
          } else {
            triggerFeverEvent();
            return nextCount;
          }
        }
        return nextCount;
      });
    },
    [hasGym, showToast, triggerFeverEvent],
  );

  // Shop Purchase Handlers
  const handleBuyBubbles = () => {
    if (hasBubbles) return;
    if (savings < 250) {
      showToast("⚠️ Insufficient savings! $250 required.");
      return;
    }
    setSavings((s) => s - 250);
    setHasBubbles(true);
    showToast("🫧 Bubble Effect ($250): Installed & Active!");
  };

  const handleBuyClickSound = () => {
    if (hasClickSound) return;
    if (savings < 400) {
      showToast("⚠️ Insufficient savings! $400 required.");
      return;
    }
    setSavings((s) => s - 400);
    setHasClickSound(true);
    playProceduralClick();
    showToast("🔊 Click Sound Effects ($400): Enabled globally!");
  };

  const handleBuyGym = () => {
    if (hasGym) return;
    if (savings < 500) {
      showToast("⚠️ Insufficient savings! $500 required for Gym Membership.");
      return;
    }
    setSavings((s) => s - 500);
    setHasGym(true);
    showToast("💪 Gym Membership ($500): Activated! Fever events permanently disabled.");
  };

  const handleBuyCustomButtons = () => {
    if (hasCustomButtons) return;
    if (savings < 750) {
      showToast("⚠️ Insufficient savings! $750 required.");
      return;
    }
    setSavings((s) => s - 750);
    setHasCustomButtons(true);
    showToast("🔲 Custom Button UI ($750): Retro tactical borders applied!");
  };

  const handleBuyVignette = () => {
    if (hasVignette) return;
    if (savings < 1000) {
      showToast("⚠️ Insufficient savings! $1,000 required.");
      return;
    }
    setSavings((s) => s - 1000);
    setHasVignette(true);
    showToast("⬛ Screen Shading / Vignette ($1,000): Overlay injected!");
  };

  const handleBuyBackgroundAudio = () => {
    if (hasBackgroundAudio) {
      toggleAudio();
      return;
    }
    if (savings < 1500) {
      showToast("⚠️ Insufficient savings! $1,500 required.");
      return;
    }
    setSavings((s) => s - 1500);
    setHasBackgroundAudio(true);
    setIsPlayingAudio(true);
    if (audioElementRef.current) {
      audioElementRef.current.play().catch(() => {});
    }
    showToast("🎧 Background Audio ($1,500): Upbeat Lo-Fi soundtrack active!");
  };

  // Casino Wins
  const handleCasinoWin = (amount: number) => {
    setSavings((s) => s + amount);
  };

  // The Relapse Trap: If gambling ever drops savings below zero,
  // immediately convert the negative balance to debt (as a positive number),
  // set savings to 0, and instantly force currentView back to 'dashboard' while re-locking the shop!
  const handleCasinoLoss = (lossAmount: number, gameTitle: string) => {
    if (lossAmount <= savings) {
      setSavings((s) => s - lossAmount);
    } else {
      const debtIncurred = lossAmount - savings;
      setSavings(0);
      setDebt((d) => (typeof d === "number" && !isNaN(d) ? d : 0) + debtIncurred);
      setHasSeenFreedomCutscene(false); // Re-locks shop!
      setCurrentView("dashboard"); // Instantly force back to dashboard!
      showToast(
        `🚨 DEBT RELAPSE! You lost $${lossAmount.toLocaleString()} on ${gameTitle}. You are now in $${debtIncurred.toLocaleString()} DEBT! Back to the gig grind!`,
        6000,
      );
    }
  };

  // If debt > 0 while viewing shop or casino, automatically force back to dashboard
  useEffect(() => {
    if (debt > 0 && currentView !== "dashboard") {
      setCurrentView("dashboard");
    }
  }, [debt, currentView]);

  return (
    <div
      className={`relative min-h-screen w-full ${
        hasCustomButtons
          ? "[&_button]:border [&_button]:border-stone-400 [&_button]:bg-stone-900 [&_button]:text-stone-200 [&_button]:shadow-[2px_2px_0px_#78716c] [&_button]:hover:translate-x-0.5 [&_button]:hover:translate-y-0.5"
          : ""
      }`}
    >
      {/* Inline Animation Style for Floating Bubbles */}
      <style>{`
        @keyframes floatUpBubble {
          0% {
            transform: translateY(0px) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-105vh) scale(1.2);
            opacity: 0;
          }
        }
        .animate-bubble-rise {
          animation: floatUpBubble linear infinite;
        }
      `}</style>

      {/* Hidden Audio Element for persistent background playback */}
      {lofiAudioUrl && (
        <audio
          ref={audioElementRef}
          loop
          src={lofiAudioUrl}
          onPlay={() => setIsPlayingAudio(true)}
          onPause={() => setIsPlayingAudio(false)}
        />
      )}

      {/* Bubble Effect: Animated background particle layer of slow-rising translucent bubbles */}
      {hasBubbles && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-stone-400/30 bg-stone-300/10 animate-bubble-rise"
              style={{
                width: `${(i % 5) * 8 + 14}px`,
                height: `${(i % 5) * 8 + 14}px`,
                left: `${(i * 4.2) % 96}%`,
                bottom: "-40px",
                animationDuration: `${5.5 + (i % 6) * 1.5}s`,
                animationDelay: `${(i * 0.4) % 4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Screen Shading / Vignette: Dark radial gradient overlay */}
      {hasVignette && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-950/60 to-stone-950" />
      )}

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] animate-bounce rounded-md border border-stone-600 bg-stone-900 text-stone-100 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* 1. VIEW: DASHBOARD */}
      {currentView === "dashboard" && (
        <Dashboard
          debt={debt}
          savings={savings}
          trophies={trophies}
          hasGym={hasGym}
          setHasGym={setHasGym}
          hasHeadphones={hasBackgroundAudio}
          setHasHeadphones={setHasBackgroundAudio}
          hasSeenFreedomCutscene={hasSeenFreedomCutscene}
          setHasSeenFreedomCutscene={setHasSeenFreedomCutscene}
          hasLofiMusic={hasBackgroundAudio}
          setHasLofiMusic={setHasBackgroundAudio}
          isMusicUnlocked={hasBackgroundAudio}
          setIsMusicUnlocked={setHasBackgroundAudio}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          setSavings={setSavings}
          setDebt={setDebt}
          isFeverActive={isFeverActive}
          completedJobsCount={completedJobsCount}
          onTriggerFever={triggerFeverEvent}
          onDismissFever={dismissFeverEvent}
          onAcceptGig={() => {
            // Simulator payout on gig click in standalone App.tsx
            handleEarnMoney(5000);
            showToast("💵 Completed Gig! Earned $5,000.");
          }}
          onOpenShop={() => {
            if (debt <= 0 && hasSeenFreedomCutscene) {
              setCurrentView("shop");
            }
          }}
        />
      )}

      {/* 2. VIEW: DEDICATED LIFESTYLE SHOP */}
      {currentView === "shop" && (
        <ShopPage
          savings={savings}
          hasBubbles={hasBubbles}
          hasClickSound={hasClickSound}
          hasCustomButtons={hasCustomButtons}
          hasVignette={hasVignette}
          hasBackgroundAudio={hasBackgroundAudio}
          hasGym={hasGym}
          isPlayingAudio={isPlayingAudio}
          onBackToDashboard={() => setCurrentView("dashboard")}
          onEnterCasino={() => setCurrentView("casino")}
          onBuyBubbles={handleBuyBubbles}
          onBuyClickSound={handleBuyClickSound}
          onBuyCustomButtons={handleBuyCustomButtons}
          onBuyVignette={handleBuyVignette}
          onBuyBackgroundAudio={handleBuyBackgroundAudio}
          onBuyGym={handleBuyGym}
          onToggleAudio={toggleAudio}
        />
      )}

      {/* 3. VIEW: DEDICATED CASINO */}
      {currentView === "casino" && (
        <CasinoPage
          savings={savings}
          currentTheme={currentTheme}
          onBackToShop={() => setCurrentView("shop")}
          onWin={handleCasinoWin}
          onLoss={handleCasinoLoss}
        />
      )}
    </div>
  );
}

export { Dashboard };
export default App;
