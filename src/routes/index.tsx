import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

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
  { sender: "recruitment@techcorp-global.com", subject: "Update regarding your Junior Developer application", preview: "We have decided to move forward with Auto-Code-GPT v5.0...", time: "09:41" },
  { sender: "talent@nexabyte.io", subject: "Application Status: Frontend Intern", preview: "Thank you for applying. This position has been filled by an AI agent...", time: "09:12" },
  { sender: "hr@cloudweave.com", subject: "Thank you for applying", preview: "After careful consideration, our automated screening has...", time: "08:57" },
  { sender: "jobs@quantumleaf.dev", subject: "Position Filled by AI", preview: "The Junior QA role is now handled by TestPilot-LLM...", time: "08:30" },
  { sender: "careers@orbitsoft.ai", subject: "Application Status: Software Trainee", preview: "We regret to inform you that this role no longer exists...", time: "Yesterday" },
  { sender: "no-reply@hiregrid.net", subject: "Your application to Data Annotator", preview: "Our model completed the annotation backlog in 4 minutes...", time: "Yesterday" },
  { sender: "recruiting@pixelForge.co", subject: "Thank you for applying", preview: "We've chosen a candidate — well, a checkpoint — with more experience...", time: "Yesterday" },
  { sender: "talent@driftlabs.com", subject: "Application Status: React Developer", preview: "This position was automated before your application was reviewed...", time: "Mon" },
  { sender: "hr@sentientsys.io", subject: "Position Filled by AI", preview: "SentientSys has deployed an autonomous engineer for this role...", time: "Mon" },
  { sender: "careers@bluekernel.com", subject: "Update on your application", preview: "We will keep your resume on file for any future human roles...", time: "Sun" },
  { sender: "jobs@macrohard.example", subject: "Application Status: Junior SWE", preview: "Unfortunately, Copilot Ultra now writes 94% of our codebase...", time: "Sun" },
  { sender: "recruitment@voidworks.dev", subject: "Thank you for applying", preview: "Your profile was impressive, but our AI scored itself higher...", time: "Sat" },
];

function playNotificationSound() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return (
    <div className="font-mono text-sm tracking-widest text-foreground/70">
      {hh}:{mm}
    </div>
  );
}

function Index() {
  const [scene, setScene] = useState<Scene>("desktop");
  const [showToast, setShowToast] = useState(false);
  const [fading, setFading] = useState(false);
  const soundPlayed = useRef(false);

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

  // Scene 4: dialogue appears 1s after inbox opens
  useEffect(() => {
    if (scene !== "inbox") return;
    const id = setTimeout(() => setScene("dialogue"), 1000);
    return () => clearTimeout(id);
  }, [scene]);

  const loadDashboard = useCallback(() => {
    setFading(true);
    setTimeout(() => setScene("dashboard"), 700);
  }, []);

  const frozen = scene === "dialogue";

  return (
    <div className="dark fixed inset-0 overflow-hidden bg-background text-foreground">
      {/* Desktop wallpaper texture */}
      <div className="desktop-grid absolute inset-0" aria-hidden />
      <div className="desktop-glow absolute inset-0" aria-hidden />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border/40 bg-card/40 px-5 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          <span className="font-mono text-xs tracking-[0.25em] text-foreground/80 uppercase">
            SikarwarOS <span className="text-muted-foreground">v4.2</span>
          </span>
        </div>
        <Clock />
      </div>

      {/* Desktop icons */}
      <div className="absolute top-16 left-6 flex flex-col gap-6">
        {["Inbox", "Resume.pdf", "Projects", "Trash"].map((label) => (
          <div key={label} className="flex w-16 flex-col items-center gap-1.5 opacity-70">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="h-5 w-5 rounded-sm bg-muted-foreground/40" />
            </div>
            <span className="text-center text-[10px] leading-tight text-foreground/70">{label}</span>
          </div>
        ))}
      </div>

      {/* Scene 2/3/4: Email client window */}
      {(scene === "email" || scene === "inbox" || scene === "dialogue") && (
        <div
          className={`absolute inset-x-3 top-16 bottom-6 mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-2xl backdrop-blur-xl transition-all duration-500 sm:inset-x-6 ${
            frozen ? "scale-[0.985] blur-sm brightness-50" : ""
          }`}
        >
          {scene === "email" ? (
            <EmailView onBack={() => setScene("inbox")} />
          ) : (
            <InboxView />
          )}
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
              <p className="text-sm font-semibold text-foreground">
                New Message — Inbox (1)
              </p>
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
              "ahh this sector is screwed... Even hackathons are given by AI
              these days..."
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

      {/* Scene 5: shady neon ad */}
      {scene === "ad" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-in">
          <div className="ad-flash relative mx-4 w-full max-w-md rounded-2xl border-2 border-neon bg-card p-8 text-center">
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
              className="mt-6 w-full rounded-xl bg-neon py-3 text-sm font-black tracking-widest text-neon-foreground uppercase transition-transform hover:scale-[1.03] active:scale-95"
            >
              Enter Gig Portal
            </button>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">
              * definitely not a scam * limited slots: 3 left *
            </p>
          </div>
        </div>
      )}

      {/* Scene 6: dashboard placeholder */}
      {scene === "dashboard" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-fade-in">
          <div className="h-3 w-3 animate-ping rounded-full bg-accent" />
          <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground uppercase">
            loadDashboard() — to be continued
          </p>
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
            Thank you for taking the time to apply for the Junior Software
            Engineer position at TechCorp.
          </p>
          <p>
            Unfortunately, we have decided to move forward with{" "}
            <span className="font-semibold text-foreground">Auto-Code-GPT v5.0</span>,
            which has completely automated this position. We wish you the best
            in your job search.
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
