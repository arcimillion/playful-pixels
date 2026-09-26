import { createFileRoute } from "@tanstack/react-router";
import { FileText, FolderCode, Mail, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import hackathonWallpaper from "@/assets/Hackathon.png";
import { Dashboard } from "@/components/Dashboard";
import { PoliticianGame } from "@/components/PoliticianGame";
import AIInterviewGame from "@/games/ai-interview/AIInterviewGame";
import TheTypoExorcist from "@/games/typo-exorcist/TheTypoExorcist";
import CybersecurityGame from "@/games/rogue-ai/CybersecurityGame";
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

  // Global Debt, Savings & Trophies State
  const [debt, setDebt] = useState(50000);
  const [savings, setSavings] = useState(0);
  const [gigsCompleted, setGigsCompleted] = useState(0);
  const [trophies, setTrophies] = useState([
    {
      id: "debt_slayer",
      title: "Debt Slayer",
      description: "Clear all $50,000 debt ($0 remaining)",
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
      id: "politician_win",
      title: "Political Mastermind",
      description: "Win the BAP election campaign",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "tabloid_mogul",
      title: "Tabloid Mogul",
      description: "Earn $2,500+ in Fake News broadcasts",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "exorcist_master",
      title: "Master Exorcist",
      description: "Defeat spirits in Typo Exorcist",
      icon: "trophy",
      unlocked: false,
    },
    {
      id: "gig_veteran",
      title: "Gig Veteran",
      description: "Complete 3+ gigs from the job board",
      icon: "trophy",
      unlocked: false,
    },
  ]);

  const handleEarnMoney = useCallback((rawAmount: number | unknown, trophyToUnlock?: string) => {
    const amount = typeof rawAmount === "number" && !isNaN(rawAmount) ? rawAmount : 3500;
    setDebt((prevDebt) => {
      const currentDebt = typeof prevDebt === "number" && !isNaN(prevDebt) ? prevDebt : 50000;
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

    setGigsCompleted((g) => {
      const nextGigs = (g || 0) + 1;
      if (nextGigs >= 3) {
        setTrophies((ts) => ts.map((t) => (t.id === "gig_veteran" ? { ...t, unlocked: true } : t)));
      }
      return nextGigs;
    });

    if (trophyToUnlock) {
      setTrophies((ts) => ts.map((t) => (t.id === trophyToUnlock ? { ...t, unlocked: true } : t)));
    }
  }, []);

  useEffect(() => {
    setTrophies((ts) =>
      ts.map((t) => {
        if (t.id === "debt_slayer" && debt === 0) return { ...t, unlocked: true };
        if (t.id === "savings_tycoon" && savings >= 5000) return { ...t, unlocked: true };
        return t;
      }),
    );
  }, [debt, savings]);

  const handleAcceptGig = useCallback((jobId: string) => {
    // Charge $250 entry fee (cost of doing business)
    setSavings((s) => {
      const currentSavings = typeof s === "number" && !isNaN(s) ? s : 0;
      if (currentSavings >= 250) {
        return currentSavings - 250;
      } else {
        const remainder = 250 - currentSavings;
        setDebt((d) => (typeof d === "number" && !isNaN(d) ? d : 50000) + remainder);
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
            handleEarnMoney(5000);
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
        <CybersecurityGame
          debt={debt}
          onComplete={() => {
            handleEarnMoney(5000);
            setSelectedGig(null);
          }}
          onExit={() => setSelectedGig(null)}
        />
      );
    }
    return (
      <Dashboard
        debt={debt}
        savings={savings}
        trophies={trophies}
        onAcceptGig={handleAcceptGig}
        onBackToDesktop={() => setScene("desktop")}
      />
    );
  }

  const frozen = scene === "dialogue";

  return (
    <div className="dark fixed inset-0 overflow-hidden bg-background text-foreground">
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
