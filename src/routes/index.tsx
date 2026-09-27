import { createFileRoute } from "@tanstack/react-router";
import { FileText, FolderCode, Mail, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import hackathonWallpaper from "@/assets/Hackathon.png";
import {
  Dashboard,
  createUpbeatLofiAudioUrl,
  createRainAudioUrl,
  createThunderAudioUrl,
} from "@/components/Dashboard";
import { ShopPage } from "@/components/ShopPage";
import { CasinoPage } from "@/components/CasinoPage";
import { PoliticianGame } from "@/components/PoliticianGame";
import AIInterviewGame from "@/games/ai-interview/AIInterviewGame";
import TheTypoExorcist from "@/games/typo-exorcist/TheTypoExorcist";
import CybersecurityGame from "@/games/rogue-ai/CybersecurityGame";
import CyberDefenseTDS from "@/games/cyber-defense/CyberDefenseTDS";
import FakeNewsGame from "@/games/fake-news/FakeNewsGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GIG//PORTAL — a human-only story" },
      {
        name: "description",
        content:
          "A dark, interactive story about a final-year engineering student whose job applications were all answered by AI.",
      },
      { property: "og:title", content: "GIG//PORTAL — a human-only story" },
      {
        property: "og:description",
        content:
          "Twelve rejections. One shady pop-up. An interactive story about surviving the automated job market.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Scene = "desktop" | "email" | "inbox" | "dialogue" | "ad" | "dashboard";

const REJECTION_EMAILS = [
  {
    sender: "recruitment@techcorp-global.com",
    subject: "Update regarding your Junior Developer application",
    preview: "We have decided to move forward with Auto-Code-GPT v5.0...",
    time: "09:41",
  },
  {
    sender: "talent@nexabyte.io",
    subject: "Application Status: Frontend Intern",
    preview: "Thank you for applying. This position has been filled by an AI agent...",
    time: "09:12",
  },
  {
    sender: "hr@cloudweave.com",
    subject: "Thank you for applying",
    preview: "After careful consideration, our automated screening has...",
    time: "08:57",
  },
  {
    sender: "jobs@quantumleaf.dev",
    subject: "Position Filled by AI",
    preview: "The Junior QA role is now handled by TestPilot-LLM...",
    time: "08:30",
  },
  {
    sender: "careers@orbitsoft.ai",
    subject: "Application Status: Software Trainee",
    preview: "We regret to inform you that this role no longer exists...",
    time: "Yesterday",
  },
  {
    sender: "no-reply@hiregrid.net",
    subject: "Your application to Data Annotator",
    preview: "Our model completed the annotation backlog in 4 minutes...",
    time: "Yesterday",
  },
  {
    sender: "recruiting@pixelForge.co",
    subject: "Thank you for applying",
    preview: "We've chosen a candidate — well, a checkpoint — with more experience...",
    time: "Yesterday",
  },
  {
    sender: "talent@driftlabs.com",
    subject: "Application Status: React Developer",
    preview: "This position was automated before your application was reviewed...",
    time: "Mon",
  },
  {
    sender: "hr@sentientsys.io",
    subject: "Position Filled by AI",
    preview: "SentientSys has deployed an autonomous engineer for this role...",
    time: "Mon",
  },
  {
    sender: "careers@bluekernel.com",
    subject: "Update on your application",
    preview: "We will keep your resume on file for any future human roles...",
    time: "Sun",
  },
  {
    sender: "jobs@macrohard.example",
    subject: "Application Status: Junior SWE",
    preview: "Unfortunately, Copilot Ultra now writes 94% of our codebase...",
    time: "Sun",
  },
  {
    sender: "recruitment@voidworks.dev",
    subject: "Thank you for applying",
    preview: "Your profile was impressive, but our AI scored itself higher...",
    time: "Sat",
  },
];

const DESKTOP_ICONS = [
  {
    label: "Inbox",
    Icon: Mail,
    tone: "text-cyan-400",
    glow: "drop-shadow-[0_0_8px_rgba(34,211,238,0.75)]",
  },
  {
    label: "Resume.pdf",
    Icon: FileText,
    tone: "text-amber-400",
    glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.75)]",
  },
  {
    label: "Projects",
    Icon: FolderCode,
    tone: "text-cyan-300",
    glow: "drop-shadow-[0_0_8px_rgba(103,232,249,0.75)]",
  },
  {
    label: "Trash",
    Icon: Trash2,
    tone: "text-slate-400",
    glow: "drop-shadow-[0_0_6px_rgba(148,163,184,0.5)]",
  },
];

function playNotificationSound() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = [880, 1174.66];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // audio unavailable — silent fallback
  }
}

function Clock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";

  return (
    <div className="font-mono text-sm tracking-widest text-foreground/70" suppressHydrationWarning>
      {mounted ? `${hh}:${mm}` : "--:--"}
    </div>
  );
}

function Index() {
  const [scene, setScene] = useState<Scene>("desktop");
  const [selectedGig, setSelectedGig] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showAdDialogue, setShowAdDialogue] = useState(false);
  const [fading, setFading] = useState(false);
  const [desktopModal, setDesktopModal] = useState<{ title: string; content: string } | null>(null);
  const soundPlayed = useRef(false);

  // Global Debt, Savings, Lifestyle Shop & Trophies State
  const [currentView, setCurrentView] = useState<"dashboard" | "shop" | "casino">("dashboard");
  const [debt, setDebt] = useState(30000);
  const [savings, setSavings] = useState(0);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);
  const [gigsCompleted, setGigsCompleted] = useState(0);
  const [isFeverActive, setIsFeverActive] = useState(false);
  const [hasGym, setHasGym] = useState(false);
  const [hasBubbles, setHasBubbles] = useState(false);
  const [hasClickSound, setHasClickSound] = useState(false);
  const [hasCustomButtons, setHasCustomButtons] = useState(false);
  const [hasVignette, setHasVignette] = useState(false);
  const [hasPinwheel, setHasPinwheel] = useState(false);
  const [hasRainAudio, setHasRainAudio] = useState(false);
  const [isPlayingRain, setIsPlayingRain] = useState(false);
  const [hasThunderAudio, setHasThunderAudio] = useState(false);
  const [isPlayingThunder, setIsPlayingThunder] = useState(false);
  const [hasBackgroundAudio, setHasBackgroundAudio] = useState(false);
  const [hasHeadphones, setHasHeadphones] = useState(false);
  const [hasLofiMusic, setHasLofiMusic] = useState(false);
  const [hasSeenFreedomCutscene, setHasSeenFreedomCutscene] = useState(false);
  const [isMusicUnlocked, setIsMusicUnlocked] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [hasVipCasinoPass, setHasVipCasinoPass] = useState(false);
  const [hasGoldenResume, setHasGoldenResume] = useState(false);
  const [hasNeonTheme, setHasNeonTheme] = useState(false);
  const [hasStarryNight, setHasStarryNight] = useState(false);
  const [hasCoffeeMachine, setHasCoffeeMachine] = useState(false);

  // Passive income generator from Coffee Machine perk (+$100 / 5s)
  useEffect(() => {
    if (!hasCoffeeMachine) return;
    const interval = setInterval(() => {
      setSavings((s) => (typeof s === "number" && !isNaN(s) ? s : 0) + 100);
    }, 5000);
    return () => clearInterval(interval);
  }, [hasCoffeeMachine]);

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const thunderAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const url = createUpbeatLofiAudioUrl();
    const audio = new Audio(url);
    audio.loop = true;
    bgAudioRef.current = audio;
    return () => {
      audio.pause();
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    const rainUrl = createRainAudioUrl();
    const rainAudio = new Audio(rainUrl);
    rainAudio.loop = true;
    rainAudioRef.current = rainAudio;
    return () => {
      rainAudio.pause();
      if (rainUrl) URL.revokeObjectURL(rainUrl);
    };
  }, []);

  useEffect(() => {
    const thunderUrl = createThunderAudioUrl();
    const thunderAudio = new Audio(thunderUrl);
    thunderAudio.loop = true;
    thunderAudioRef.current = thunderAudio;
    return () => {
      thunderAudio.pause();
      if (thunderUrl) URL.revokeObjectURL(thunderUrl);
    };
  }, []);

  const playBackgroundAudio = useCallback(() => {
    try {
      if (!bgAudioRef.current) {
        const url = createUpbeatLofiAudioUrl();
        const audio = new Audio(url);
        audio.loop = true;
        bgAudioRef.current = audio;
      }
      bgAudioRef.current.volume = 0.8;
      const res = bgAudioRef.current.play();
      if (res && res.catch) {
        res.catch(() => {
          const fresh = new Audio(createUpbeatLofiAudioUrl());
          fresh.loop = true;
          fresh.volume = 0.8;
          fresh.play().catch(() => {});
          bgAudioRef.current = fresh;
        });
      }
    } catch {
      // audio error fallback
    }
  }, []);

  const pauseBackgroundAudio = useCallback(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
    }
  }, []);

  const playRainAudio = useCallback(() => {
    try {
      if (!rainAudioRef.current) {
        const url = createRainAudioUrl();
        const audio = new Audio(url);
        audio.loop = true;
        rainAudioRef.current = audio;
      }
      rainAudioRef.current.volume = 0.85;
      const res = rainAudioRef.current.play();
      if (res && res.catch) {
        res.catch(() => {
          const fresh = new Audio(createRainAudioUrl());
          fresh.loop = true;
          fresh.volume = 0.85;
          fresh.play().catch(() => {});
          rainAudioRef.current = fresh;
        });
      }
      setIsPlayingRain(true);
    } catch {
      setIsPlayingRain(true);
    }
  }, []);

  const pauseRainAudio = useCallback(() => {
    if (rainAudioRef.current) {
      rainAudioRef.current.pause();
      setIsPlayingRain(false);
    }
  }, []);

  const playThunderAudio = useCallback(() => {
    try {
      if (!thunderAudioRef.current) {
        const url = createThunderAudioUrl();
        const audio = new Audio(url);
        audio.loop = true;
        thunderAudioRef.current = audio;
      }
      thunderAudioRef.current.volume = 0.85;
      const res = thunderAudioRef.current.play();
      if (res && res.catch) {
        res.catch(() => {
          const fresh = new Audio(createThunderAudioUrl());
          fresh.loop = true;
          fresh.volume = 0.85;
          fresh.play().catch(() => {});
          thunderAudioRef.current = fresh;
        });
      }
      setIsPlayingThunder(true);
    } catch {
      setIsPlayingThunder(true);
    }
  }, []);

  const pauseThunderAudio = useCallback(() => {
    if (thunderAudioRef.current) {
      thunderAudioRef.current.pause();
      setIsPlayingThunder(false);
    }
  }, []);

  const [trophies, setTrophies] = useState([
    {
      id: "debt_slayer",
      title: "Debt Slayer",
      description: "Clear all $30,000 debt ($0 remaining)",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "halfway_there",
      title: "Freedom Horizon",
      description: "Reduce total debt below $15,000",
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
    {
      id: "high_roller",
      title: "Mogul Investor",
      description: "Accumulate $15,000+ in savings",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "politician_win",
      title: "Political Mastermind",
      description: "Step in and win the BAP election campaign",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "tabloid_mogul",
      title: "Tabloid Mogul",
      description: "Earn cash from Fake News Anchor clickbait broadcasts",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "exorcist_master",
      title: "Master Exorcist",
      description: "Defeat demonic spirits in Typo Exorcist",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "tech_interview_ace",
      title: "LeetCode Conqueror",
      description: "Pass the AI Interrogator technical job interview",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "cyber_defender",
      title: "Rogue AI Sentinel",
      description: "Defend the motherboard grid in Cybersecurity Defense",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "gig_veteran",
      title: "Gig Veteran",
      description: "Complete 3+ gigs from the human job portal",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "gig_workaholic",
      title: "Gig Workaholic",
      description: "Complete 7+ gigs from the human job portal",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "gym_rat",
      title: "Health Connoisseur",
      description: "Purchase a Gym Membership to permanently block fever attacks",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "fever_survived",
      title: "Burnout Survivor",
      description: "Recover from an overwork fever attack",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "audiophile",
      title: "Soundscape Enthusiast",
      description: "Unlock any ambient sound upgrade in the marketplace",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "maestro_of_sound",
      title: "Master Audio Director",
      description: "Own all 3 ambient sound modules (Lo-Fi, Rain, and Thunder)",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "tactical_ui",
      title: "Retro Aesthetic",
      description: "Unlock the Custom Button UI upgrade",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "pinwheel_enthusiast",
      title: "Wind Power",
      description: "Unlock Pinwheel & Pinwheel background effect",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "freedom_cutscene",
      title: "Free at Last",
      description: "Witness the postgame freedom milestone cutscene",
      icon: "trophy",
      unlocked: false,
    },
  ]);

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
  }, []);

  const dismissFeverEvent = useCallback(() => {
    setIsFeverActive(false);
    setCompletedJobsCount(0);
  }, []);

  const handleEarnMoney = useCallback(
    (rawAmount: number | unknown, trophyToUnlock?: string) => {
      let amount = typeof rawAmount === "number" && !isNaN(rawAmount) ? rawAmount : 3500;
      if (hasGoldenResume) {
        amount = Math.round(amount * 1.5);
      }
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

      // Check completed jobs count for Fever event (every 2 games)
      setCompletedJobsCount((prev) => {
        const nextCount = (prev || 0) + 1;
        if (nextCount > 0 && nextCount % 2 === 0) {
          if (hasGym) {
            return 0;
          } else {
            triggerFeverEvent();
            return nextCount;
          }
        }
        return nextCount;
      });

      setGigsCompleted((g) => {
        const nextGigs = (g || 0) + 1;
        if (nextGigs >= 3) {
          setTrophies((ts) =>
            ts.map((t) => (t.id === "gig_veteran" ? { ...t, unlocked: true } : t)),
          );
        }
        return nextGigs;
      });

      if (trophyToUnlock) {
        setTrophies((ts) =>
          ts.map((t) => (t.id === trophyToUnlock ? { ...t, unlocked: true } : t)),
        );
      }
    },
    [hasGym, triggerFeverEvent, hasGoldenResume],
  );

  useEffect(() => {
    setTrophies((ts) =>
      ts.map((t) => {
        if (t.id === "debt_slayer" && debt === 0) return { ...t, unlocked: true };
        if (t.id === "halfway_there" && debt <= 15000) return { ...t, unlocked: true };
        if (t.id === "savings_tycoon" && savings >= 5000) return { ...t, unlocked: true };
        if (t.id === "high_roller" && savings >= 15000) return { ...t, unlocked: true };
        if (t.id === "gym_rat" && hasGym) return { ...t, unlocked: true };
        if (t.id === "fever_survived" && isFeverActive) return { ...t, unlocked: true };
        if (t.id === "audiophile" && (hasBackgroundAudio || hasRainAudio || hasThunderAudio))
          return { ...t, unlocked: true };
        if (t.id === "maestro_of_sound" && hasBackgroundAudio && hasRainAudio && hasThunderAudio)
          return { ...t, unlocked: true };
        if (t.id === "tactical_ui" && hasCustomButtons) return { ...t, unlocked: true };
        if (t.id === "pinwheel_enthusiast" && hasPinwheel) return { ...t, unlocked: true };
        if (t.id === "freedom_cutscene" && hasSeenFreedomCutscene) return { ...t, unlocked: true };
        if (t.id === "gig_veteran" && gigsCompleted >= 3) return { ...t, unlocked: true };
        if (t.id === "gig_workaholic" && gigsCompleted >= 7) return { ...t, unlocked: true };
        return t;
      }),
    );
  }, [
    debt,
    savings,
    hasGym,
    isFeverActive,
    hasBackgroundAudio,
    hasRainAudio,
    hasThunderAudio,
    hasCustomButtons,
    hasPinwheel,
    hasSeenFreedomCutscene,
    gigsCompleted,
  ]);

  const handleAcceptGig = useCallback((jobId: string) => {
    // Charge $200 entry fee (cost of doing business)
    setSavings((s) => {
      const currentSavings = typeof s === "number" && !isNaN(s) ? s : 0;
      if (currentSavings >= 200) {
        return currentSavings - 200;
      } else {
        const remainder = 200 - currentSavings;
        setDebt((d) => (typeof d === "number" && !isNaN(d) ? d : 30000) + remainder);
        return 0;
      }
    });
    setSelectedGig(jobId);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("scene") === "dashboard") {
      setScene("dashboard");
    }
  }, []);

  // Scene 1: notification slides in after 1.5s
  useEffect(() => {
    if (scene !== "desktop") return;
    const id = setTimeout(() => {
      setShowToast(true);
      if (!soundPlayed.current) {
        soundPlayed.current = true;
        playNotificationSound();
      }
    }, 1500);
    return () => clearTimeout(id);
  }, [scene]);

  // Scene 4: dialogue appears 4.5s after inbox opens, so the wall of
  // rejections gets time to land before the character reacts
  useEffect(() => {
    if (scene !== "inbox") return;
    const id = setTimeout(() => setScene("dialogue"), 4500);
    return () => clearTimeout(id);
  }, [scene]);

  // Scene 5: Exactly 1 second after ad appears, trigger second narrative dialogue
  useEffect(() => {
    if (scene !== "ad") {
      setShowAdDialogue(false);
      return;
    }
    const id = setTimeout(() => setShowAdDialogue(true), 1000);
    return () => clearTimeout(id);
  }, [scene]);

  const loadDashboard = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setScene("dashboard");
      setFading(false);
    }, 700);
  }, []);

  // Global click sound effect listener
  useEffect(() => {
    if (!hasClickSound) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("button, a, input, select, [role='button'], .cursor-pointer")) {
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
    };
    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, [hasClickSound]);

  if (scene === "dashboard") {
    if (selectedGig === "politician") {
      return (
        <PoliticianGame
          debt={debt}
          onComplete={() => {
            handleEarnMoney(10000, "politician_win");
            setSelectedGig(null);
          }}
        />
      );
    }
    if (selectedGig === "fake-news-anchor") {
      return (
        <FakeNewsGame
          debt={debt}
          onExit={(earned = 3500) => {
            handleEarnMoney(earned, "tabloid_mogul");
            setSelectedGig(null);
          }}
        />
      );
    }
    if (selectedGig === "technical-interview") {
      return (
        <AIInterviewGame
          debt={debt}
          onComplete={() => {
            handleEarnMoney(5000, "tech_interview_ace");
            setSelectedGig(null);
          }}
          onBackToDashboard={() => setSelectedGig(null)}
        />
      );
    }
    if (selectedGig === "exorcist") {
      return (
        <TheTypoExorcist
          debt={debt}
          onExit={(earned = 3000) => {
            handleEarnMoney(earned, "exorcist_master");
            setSelectedGig(null);
          }}
        />
      );
    }
    if (selectedGig === "cybersecurity") {
      return (
        <CyberDefenseTDS
          debt={debt}
          onComplete={() => {
            handleEarnMoney(5000, "cyber_defender");
            setSelectedGig(null);
          }}
          onExit={() => setSelectedGig(null)}
        />
      );
    }
    let viewContent = (
      <Dashboard
        debt={debt}
        savings={savings}
        trophies={trophies}
        hasGym={hasGym}
        setHasGym={setHasGym}
        hasHeadphones={hasHeadphones}
        setHasHeadphones={setHasHeadphones}
        hasSeenFreedomCutscene={hasSeenFreedomCutscene}
        setHasSeenFreedomCutscene={setHasSeenFreedomCutscene}
        hasLofiMusic={hasLofiMusic || hasHeadphones}
        setHasLofiMusic={(v) => {
          setHasLofiMusic(v);
          setHasHeadphones(v);
        }}
        isMusicUnlocked={hasLofiMusic || hasHeadphones || isMusicUnlocked}
        setIsMusicUnlocked={(v) => {
          setIsMusicUnlocked(v);
          setHasLofiMusic(v);
          setHasHeadphones(v);
        }}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        hasCoffeeMachine={hasCoffeeMachine}
        hasGoldenResume={hasGoldenResume}
        hasVipCasinoPass={hasVipCasinoPass}
        setSavings={setSavings}
        setDebt={setDebt}
        isFeverActive={isFeverActive}
        completedJobsCount={completedJobsCount}
        onTriggerFever={triggerFeverEvent}
        onDismissFever={dismissFeverEvent}
        onAcceptGig={handleAcceptGig}
        onBackToDesktop={() => setScene("desktop")}
        onOpenShop={() => {
          if (debt <= 0 && hasSeenFreedomCutscene) {
            setCurrentView("shop");
          }
        }}
      />
    );

    if (currentView === "shop") {
      viewContent = (
        <ShopPage
          savings={savings}
          hasGym={hasGym}
          hasBubbles={hasBubbles}
          hasClickSound={hasClickSound}
          hasCustomButtons={hasCustomButtons}
          hasVignette={hasVignette}
          hasPinwheel={hasPinwheel}
          hasRainAudio={hasRainAudio}
          hasThunderAudio={hasThunderAudio}
          hasBackgroundAudio={hasBackgroundAudio}
          hasVipCasinoPass={hasVipCasinoPass}
          hasGoldenResume={hasGoldenResume}
          hasNeonTheme={hasNeonTheme}
          hasStarryNight={hasStarryNight}
          hasCoffeeMachine={hasCoffeeMachine}
          isPlayingAudio={isMusicUnlocked}
          isPlayingRain={isPlayingRain}
          isPlayingThunder={isPlayingThunder}
          onBackToDashboard={() => setCurrentView("dashboard")}
          onEnterCasino={() => setCurrentView("casino")}
          onBuyGym={() => {
            if (hasGym) return;
            if (savings >= 500) {
              setSavings((s) => s - 500);
              setHasGym(true);
            }
          }}
          onBuyBubbles={() => {
            if (hasBubbles) return;
            if (savings >= 250) {
              setSavings((s) => s - 250);
              setHasBubbles(true);
            }
          }}
          onBuyClickSound={() => {
            if (hasClickSound) return;
            if (savings >= 400) {
              setSavings((s) => s - 400);
              setHasClickSound(true);
            }
          }}
          onBuyCustomButtons={() => {
            if (hasCustomButtons) return;
            if (savings >= 750) {
              setSavings((s) => s - 750);
              setHasCustomButtons(true);
            }
          }}
          onBuyPinwheel={() => {
            if (hasPinwheel) return;
            if (savings >= 850) {
              setSavings((s) => s - 850);
              setHasPinwheel(true);
            }
          }}
          onBuyVignette={() => {
            if (hasVignette) return;
            if (savings >= 1000) {
              setSavings((s) => s - 1000);
              setHasVignette(true);
            }
          }}
          onBuyRainAudio={() => {
            if (hasRainAudio) {
              if (isPlayingRain) pauseRainAudio();
              else playRainAudio();
              return;
            }
            if (savings >= 1200) {
              setSavings((s) => s - 1200);
              setHasRainAudio(true);
              playRainAudio();
            }
          }}
          onBuyBackgroundAudio={() => {
            if (hasBackgroundAudio) {
              if (isMusicUnlocked) {
                pauseBackgroundAudio();
                setIsMusicUnlocked(false);
              } else {
                playBackgroundAudio();
                setIsMusicUnlocked(true);
              }
              return;
            }
            if (savings >= 1500) {
              setSavings((s) => s - 1500);
              setHasBackgroundAudio(true);
              setHasLofiMusic(true);
              setHasHeadphones(true);
              setIsMusicUnlocked(true);
              playBackgroundAudio();
            }
          }}
          onBuyThunderAudio={() => {
            if (hasThunderAudio) {
              if (isPlayingThunder) pauseThunderAudio();
              else playThunderAudio();
              return;
            }
            if (savings >= 1800) {
              setSavings((s) => s - 1800);
              setHasThunderAudio(true);
              playThunderAudio();
            }
          }}
          onBuyVipCasinoPass={() => {
            if (hasVipCasinoPass) return;
            if (savings >= 2200) {
              setSavings((s) => s - 2200);
              setHasVipCasinoPass(true);
            }
          }}
          onBuyGoldenResume={() => {
            if (hasGoldenResume) return;
            if (savings >= 3000) {
              setSavings((s) => s - 3000);
              setHasGoldenResume(true);
            }
          }}
          onBuyNeonTheme={() => {
            if (hasNeonTheme) return;
            if (savings >= 3500) {
              setSavings((s) => s - 3500);
              setHasNeonTheme(true);
              setCurrentTheme("hacker");
            }
          }}
          onBuyStarryNight={() => {
            if (hasStarryNight) return;
            if (savings >= 4200) {
              setSavings((s) => s - 4200);
              setHasStarryNight(true);
            }
          }}
          onBuyCoffeeMachine={() => {
            if (hasCoffeeMachine) return;
            if (savings >= 5000) {
              setSavings((s) => s - 5000);
              setHasCoffeeMachine(true);
            }
          }}
          onToggleAudio={() => {
            if (isMusicUnlocked) {
              pauseBackgroundAudio();
              setIsMusicUnlocked(false);
            } else {
              playBackgroundAudio();
              setIsMusicUnlocked(true);
            }
          }}
          onToggleRain={() => {
            if (isPlayingRain) pauseRainAudio();
            else playRainAudio();
          }}
          onToggleThunder={() => {
            if (isPlayingThunder) pauseThunderAudio();
            else playThunderAudio();
          }}
        />
      );
    }

    if (currentView === "casino") {
      viewContent = (
        <CasinoPage
          savings={savings}
          currentTheme={currentTheme}
          hasVipCasinoPass={hasVipCasinoPass}
          onBackToShop={() => setCurrentView("shop")}
          onWin={(amount) => setSavings((s) => s + amount)}
          onLoss={(lossAmount) => {
            if (lossAmount <= savings) {
              setSavings((s) => s - lossAmount);
            } else {
              const debtIncurred = lossAmount - savings;
              setSavings(0);
              setDebt((d) => (d || 0) + debtIncurred);
              setHasSeenFreedomCutscene(false);
              setCurrentView("dashboard");
            }
          }}
        />
      );
    }

    return (
      <div
        className={`relative min-h-screen w-full transition-colors duration-300 ${
          hasCustomButtons
            ? "retro-buttons-active [&_button]:border [&_button]:border-stone-400 [&_button]:bg-stone-900 [&_button]:text-stone-200 [&_button]:shadow-[2px_2px_0px_#78716c] [&_button]:hover:translate-x-0.5 [&_button]:hover:translate-y-0.5"
            : ""
        }`}
      >
        {/* Floating Bubbles Particle Layer */}
        {hasBubbles && (
          <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-stone-400/30 bg-stone-300/10 animate-pulse"
                style={{
                  width: `${(i % 5) * 8 + 14}px`,
                  height: `${(i % 5) * 8 + 14}px`,
                  left: `${(i * 4.2) % 96}%`,
                  top: `${(i * 11.3) % 92}%`,
                  animationDuration: `${4 + (i % 4) * 1.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Starry Night Particle Layer */}
        {hasStarryNight && (
          <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-cyan-200 animate-pulse"
                style={{
                  width: `${(i % 3) + 2}px`,
                  height: `${(i % 3) + 2}px`,
                  top: `${(i * 17) % 98}%`,
                  left: `${(i * 23) % 98}%`,
                  opacity: 0.35 + (i % 5) * 0.12,
                  animationDuration: `${2.2 + (i % 4) * 0.8}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Pinwheel Background Layer */}
        {hasPinwheel && (
          <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute flex items-center justify-center opacity-30"
                style={{
                  left: `${(i * 8.5 + 3) % 92}%`,
                  top: `${(i * 14.2 + 6) % 88}%`,
                }}
              >
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 relative animate-spin"
                  style={{ animationDuration: `${3 + (i % 4) * 2}s` }}
                >
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                    <div
                      key={idx}
                      className={`absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left rounded-tr-full border border-stone-400/30 ${
                        idx % 4 === 0
                          ? "bg-amber-500/30"
                          : idx % 4 === 1
                            ? "bg-cyan-500/30"
                            : idx % 4 === 2
                              ? "bg-rose-500/30"
                              : "bg-emerald-500/30"
                      }`}
                      style={{ transform: `rotate(${deg}deg)` }}
                    />
                  ))}
                  <div className="absolute inset-1/3 rounded-full bg-stone-900 border border-stone-500 z-10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vignette Layer */}
        {hasVignette && (
          <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-950/60 to-stone-950 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" />
        )}

        {viewContent}
      </div>
    );
  }

  const frozen = scene === "dialogue";

  return (
    <div
      className={`fixed inset-0 overflow-hidden transition-colors duration-300 ${
        currentTheme === "hacker"
          ? "bg-black text-green-500 font-mono"
          : "dark bg-background text-foreground"
      } ${
        hasCustomButtons
          ? "[&_button]:border [&_button]:border-stone-400 [&_button]:bg-stone-900 [&_button]:text-stone-200 [&_button]:shadow-[2px_2px_0px_#78716c] [&_button]:hover:translate-x-0.5 [&_button]:hover:translate-y-0.5"
          : ""
      }`}
    >
      {/* Floating Bubbles Overlay on homescreen */}
      {hasBubbles && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-stone-400/30 bg-stone-300/10 animate-pulse"
              style={{
                width: `${(i % 5) * 8 + 14}px`,
                height: `${(i % 5) * 8 + 14}px`,
                left: `${(i * 4.2) % 96}%`,
                top: `${(i * 11.3) % 92}%`,
                animationDuration: `${4 + (i % 4) * 1.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Starry Night Particle Layer */}
      {hasStarryNight && (
        <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-200 animate-pulse"
              style={{
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                top: `${(i * 17) % 98}%`,
                left: `${(i * 23) % 98}%`,
                opacity: 0.35 + (i % 5) * 0.12,
                animationDuration: `${2.2 + (i % 4) * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Pinwheel & Pinwheel Background Overlay */}
      {hasPinwheel && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center opacity-30"
              style={{
                left: `${(i * 8.5 + 3) % 92}%`,
                top: `${(i * 14.2 + 6) % 88}%`,
              }}
            >
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 relative animate-spin"
                style={{ animationDuration: `${3 + (i % 4) * 2}s` }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                  <div
                    key={idx}
                    className={`absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left rounded-tr-full border border-stone-400/30 ${
                      idx % 4 === 0
                        ? "bg-amber-500/30"
                        : idx % 4 === 1
                          ? "bg-cyan-500/30"
                          : idx % 4 === 2
                            ? "bg-rose-500/30"
                            : "bg-emerald-500/30"
                    }`}
                    style={{ transform: `rotate(${deg}deg)` }}
                  />
                ))}
                <div className="absolute inset-1/3 rounded-full bg-stone-900 border border-stone-500 z-10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screen Shading / Vignette on homescreen */}
      {hasVignette && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-950/60 to-stone-950" />
      )}

      {/* Desktop wallpaper: Hackathon image */}
      <div
        className="desktop-wallpaper absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${hackathonWallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      <div className="desktop-glow absolute inset-0 opacity-40 pointer-events-none" aria-hidden />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border/40 bg-card/40 px-5 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          <span className="font-mono text-xs tracking-[0.25em] text-foreground/80 uppercase">
            WINDGOES V4.2
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScene("dashboard")}
            className="flex items-center gap-1.5 rounded-md border border-red-500/40 bg-red-950/40 px-2.5 py-1 font-mono text-[11px] font-semibold text-red-400 hover:bg-red-900/50 hover:text-red-200 transition-colors cursor-pointer"
            title="Fast switch to GIG//PORTAL Dashboard"
          >
            <span>⚡ Gig Portal</span>
          </button>
          <Clock />
        </div>
      </div>

      {/* Desktop icons */}
      <div className="absolute top-16 left-6 flex flex-col gap-6">
        {DESKTOP_ICONS.map(({ label, Icon, tone, glow }) => (
          <div key={label} className="group flex w-24 flex-col items-center gap-1.5">
            <button
              onClick={() => {
                if (label === "Inbox") {
                  setScene("inbox");
                } else if (label === "Resume.pdf") {
                  setDesktopModal({
                    title: "Resume.pdf",
                    content:
                      "Education: B.Tech Computer Science (Final Year)\nSkills: Full-Stack Dev, Algorithms, Problem Solving\nStatus: 12/12 Automated Rejections by AI Agents.\nVerdict: Biological candidates need not apply.",
                  });
                } else if (label === "Projects") {
                  setDesktopModal({
                    title: "Projects Folder",
                    content:
                      "• E-Commerce Microservices (Replaced by ShopBot-v4)\n• Real-Time Chat App (Replaced by AgentSync)\n• Portfolio Website (Copilot designed 10,000 better ones)\n• Hackathon Entry (AI swept all podiums)",
                  });
                } else if (label === "Trash") {
                  setDesktopModal({
                    title: "Recycle Bin",
                    content:
                      "• Cover_Letter_Final_v14.pdf\n• Dream_Company_Referral.eml\n• Hopes_and_Dreams.bak\n\n[All moved to trash — 0 bytes recovered]",
                  });
                }
              }}
              className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border border-border/60 bg-slate-800/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur transition-all duration-200 hover:scale-105 hover:border-cyan-500/50 hover:shadow-[0_0_20px_-2px_rgba(34,211,238,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <Icon size={48} strokeWidth={1.75} className={`${tone} ${glow}`} />
            </button>
            <span className="text-center text-sm leading-tight text-foreground/70 transition-colors group-hover:text-cyan-300">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop file preview modal */}
      {desktopModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="font-mono text-xs font-bold text-foreground/80 uppercase">
                {desktopModal.title}
              </span>
              <button
                onClick={() => setDesktopModal(null)}
                className="rounded-md px-2 py-0.5 font-mono text-xs text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
              {desktopModal.content}
            </pre>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDesktopModal(null)}
                className="rounded-lg bg-primary px-4 py-1.5 font-mono text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scene 2/3/4: Email client window */}
      {(scene === "email" || scene === "inbox" || scene === "dialogue") && (
        <div
          className={`absolute inset-x-3 top-16 bottom-6 mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-2xl backdrop-blur-xl transition-all duration-500 sm:inset-x-6 ${
            frozen ? "scale-[0.985] blur-sm brightness-50" : ""
          }`}
        >
          {scene === "email" ? <EmailView onBack={() => setScene("inbox")} /> : <InboxView />}
        </div>
      )}

      {/* Scene 1: toast notification */}
      {scene === "desktop" && showToast && (
        <button
          onClick={() => setScene("email")}
          className="toast-pulse absolute top-16 right-4 w-[calc(100%-2rem)] max-w-sm cursor-pointer rounded-2xl border border-primary/50 bg-card/80 p-4 text-left shadow-[0_0_30px_-5px_var(--primary)] backdrop-blur-xl animate-slide-in-right sm:right-6"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <span className="text-primary">✉</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">New Message — Inbox (1)</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                "Application Status: Junior Software Engineer..."
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Scene 4: visual novel dialogue card */}
      {scene === "dialogue" && (
        <div className="absolute inset-x-4 bottom-8 mx-auto max-w-2xl animate-fade-in">
          <div className="rounded-2xl border border-border/70 bg-popover/90 p-5 shadow-2xl backdrop-blur-xl">
            <span className="inline-block rounded-md bg-primary/15 px-2.5 py-1 font-mono text-[11px] tracking-wider text-primary uppercase">
              You — 4th Year Engineering Student
            </span>
            <p className="mt-3 text-lg leading-relaxed text-foreground">
              "ahh this sector is screwed... Even hackathons are given by AI these days..."
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setScene("ad")}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scene 5: shady neon ad & second dialogue */}
      {scene === "ad" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-in">
          {/* Dim background slightly when second dialogue is active to keep focus */}
          {showAdDialogue && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 z-20 pointer-events-none" />
          )}

          <div className="ad-flash relative mx-4 w-full max-w-md rounded-2xl border-2 border-neon bg-card p-8 text-center z-10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neon px-3 py-0.5 font-mono text-[10px] font-bold tracking-widest text-neon-foreground uppercase">
              Sponsored
            </span>
            <h2 className="text-2xl font-black tracking-tight text-neon drop-shadow-[0_0_12px_var(--neon)]">
              ⚡ NO CODING REQUIRED! ⚡
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              AI taking your job? Earn fast cash with{" "}
              <span className="font-bold text-neon">100% human-only gigs!</span>
            </p>
            <button
              onClick={loadDashboard}
              disabled={showAdDialogue}
              className={`mt-6 w-full rounded-xl bg-neon py-3 text-sm font-black tracking-widest text-neon-foreground uppercase transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer ${
                showAdDialogue ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              ENTER GIG PORTAL
            </button>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">
              * definitely not a scam * limited slots: 3 left *
            </p>
          </div>

          {/* New narrative dialogue reaction 1s after ad appears */}
          {showAdDialogue && (
            <div className="absolute inset-x-4 bottom-8 z-30 mx-auto max-w-2xl animate-fade-in">
              <div className="rounded-2xl border border-border/70 bg-popover/95 p-5 shadow-2xl backdrop-blur-xl">
                <span className="inline-block rounded-md bg-primary/15 px-2.5 py-1 font-mono text-[11px] tracking-wider text-primary uppercase">
                  You (4th Year Engineering Student)
                </span>
                <p className="mt-3 text-lg leading-relaxed text-foreground">
                  "thats a shady ai generated ad... why not click it!! ^~^"
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowAdDialogue(false)}
                    className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fade-out overlay */}
      <div
        className={`pointer-events-none absolute inset-0 bg-background transition-opacity duration-700 ${
          fading ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />
    </div>
  );
}

function EmailView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-border/60 bg-secondary/60 px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary"
        >
          ← Back to Inbox
        </button>
        <span className="font-mono text-xs text-muted-foreground">Inbox (1)</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-foreground">
          Update regarding your Junior Developer application
        </h1>
        <div className="mt-3 flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
            T
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">TechCorp Hiring Team</p>
            <p className="font-mono text-xs text-muted-foreground">
              recruitment@techcorp-global.com
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>Dear Applicant,</p>
          <p>
            Thank you for taking the time to apply for the Junior Software Engineer position at
            TechCorp.
          </p>
          <p>
            Unfortunately, we have decided to move forward with{" "}
            <span className="font-semibold text-foreground">Auto-Code-GPT v5.0</span>, which has
            completely automated this position. We wish you the best in your job search.
          </p>
          <p>
            Best regards,
            <br />
            TechCorp Hiring Team
          </p>
        </div>
      </div>
    </div>
  );
}

function InboxView() {
  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Inbox</span>
        <span className="rounded-full bg-destructive/20 px-2.5 py-0.5 font-mono text-xs text-destructive">
          12 unread
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {REJECTION_EMAILS.map((mail, i) => (
          <div
            key={i}
            className="flex items-start gap-3 border-b border-border/30 px-4 py-3 opacity-55 transition-opacity hover:opacity-80"
          >
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm text-foreground/80">{mail.sender}</p>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {mail.time}
                </span>
              </div>
              <p className="truncate text-xs font-medium text-foreground/70">{mail.subject}</p>
              <p className="truncate text-xs text-muted-foreground">{mail.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
