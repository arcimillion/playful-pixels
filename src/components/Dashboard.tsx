import React, { useState } from "react";
import {
  Radio,
  Vote,
  ShieldAlert,
  Skull,
  ArrowRight,
  Brain,
  Trophy,
  CheckCircle,
  Lock,
  Sprout,
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
    id: "cybersecurity",
    title: "Cybersecurity",
    description: "Fight AI attacks from inside the computer!",
    cardColor: "bg-green-50 text-stone-800 border-emerald-200/90",
    tapeColor: "bg-emerald-200/80 border-emerald-300/60",
    rotation: "-rotate-2",
    icon: ShieldAlert,
    comingSoon: true,
    buttonText: "Coming soon, work almost done",
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
];

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface DashboardProps {
  debt?: number;
  savings?: number;
  trophies?: Trophy[];
  onAcceptGig?: (jobId: string, jobTitle: string) => void;
  onBackToDesktop?: () => void;
}

export function Dashboard({
  debt = 50000,
  savings = 0,
  trophies = [],
  onAcceptGig,
  onBackToDesktop,
}: DashboardProps) {
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [showTrophiesModal, setShowTrophiesModal] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);

  const handleAccept = (job: JobGig) => {
    if (job.comingSoon) {
      setComingSoonToast(`⏳ ${job.title} — ${job.buttonText}!`);
      setTimeout(() => setComingSoonToast(null), 3500);
      return;
    }
    setAcceptedId(job.id);
    console.log(`Accepted gig: ${job.title} (${job.id})`);
    if (onAcceptGig) {
      onAcceptGig(job.id, job.title);
    }
  };

  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-stone-900 text-stone-100 selection:bg-amber-200 selection:text-stone-900 font-sans">
      {/* Coming Soon Toast Notification */}
      {comingSoonToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce rounded-xl border border-amber-400 bg-amber-500 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-stone-950 shadow-2xl">
          {comingSoonToast}
        </div>
      )}
      {/* Warm desk lamp glow radial gradient in the center */}
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

      {/* Subtle corkboard / desk surface texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-stone-800/80 pb-8">
          {/* Left: Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {onBackToDesktop && (
                <button
                  onClick={onBackToDesktop}
                  className="inline-flex items-center gap-1 rounded-md border border-stone-700 bg-stone-800/80 px-2.5 py-1 font-mono text-xs text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors cursor-pointer"
                >
                  ← Back to Desktop
                </button>
              )}
              <button
                onClick={() => setShowTrophiesModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-950/40 px-3 py-1 font-mono text-xs font-bold text-amber-300 hover:bg-amber-900/50 transition-colors cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.15)]"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  Trophies ({unlockedCount}/{trophies.length})
                </span>
              </button>
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Career Options (T_T)
            </h1>
            <p className="mt-1 font-mono text-xs sm:text-sm text-stone-400 italic">
              desperate late-night job search... need to get employed and clear debt before midnight
              ☕
            </p>
          </div>

          {/* Right: Urgent Financial Status Sticky Notes */}
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4">
            {/* Debt Notice */}
            <div className="relative rotate-1 transition-transform hover:rotate-0 duration-200">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-red-600 border border-red-700 shadow-md ring-2 ring-red-400/40" />
                <div className="h-1.5 w-0.5 bg-stone-800 -mt-0.5" />
              </div>
              <div className="rounded-sm border border-red-200 bg-red-100 p-3 pt-4 text-red-800 shadow-sm min-w-[180px]">
                <div className="border-b border-red-200 pb-1 text-center font-mono text-[11px] font-black tracking-widest text-red-800 uppercase">
                  ACTIVE DEBT
                </div>
                <div className="mt-1 text-center">
                  <div className="font-mono text-xl sm:text-2xl font-black tracking-tight text-red-800">
                    ${isNaN(Number(debt)) ? "50,000" : Number(debt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Savings / Net Worth Notice */}
            <div
              className={`relative -rotate-1 transition-transform hover:rotate-0 duration-200 ${debt === 0 ? "animate-pulse" : ""}`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-emerald-600 border border-emerald-700 shadow-md ring-2 ring-emerald-400/40" />
                <div className="h-1.5 w-0.5 bg-stone-800 -mt-0.5" />
              </div>
              <div className="rounded-sm border border-emerald-200 bg-emerald-100 p-3 pt-4 text-emerald-900 shadow-sm min-w-[180px]">
                <div className="border-b border-emerald-200 pb-1 text-center font-mono text-[11px] font-black tracking-widest text-emerald-900 uppercase">
                  SAVINGS {debt === 0 ? "★ FREEDOM" : ""}
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

        {/* ================= TROPHIES MODAL ================= */}
        {showTrophiesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-2xl border-2 border-amber-500/60 bg-[#140f0c] p-6 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <h3 className="font-mono text-base font-black uppercase tracking-wider text-amber-200">
                    Career Achievements & Trophies ({unlockedCount}/{trophies.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowTrophiesModal(false)}
                  className="rounded-lg bg-stone-800 px-2.5 py-1 font-mono text-xs text-stone-300 hover:bg-stone-700 cursor-pointer"
                >
                  ✕
                </button>
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8 pb-12">
          {GIG_JOBS.map((job) => {
            const Icon = job.icon;
            const isAccepted = acceptedId === job.id;

            return (
              <div
                key={job.id}
                onClick={() => handleAccept(job)}
                className={`group relative flex flex-col justify-between rounded-lg border p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${job.cardColor} ${job.rotation}`}
              >
                {/* Colored masking tape holding it up */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-20 rounded-xs border shadow-2xs backdrop-blur-xs opacity-85 ${job.tapeColor} rotate-[-1deg]`}
                />

                <div>
                  {/* Note Header: Icon & Title */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-800/20 bg-white/70 text-stone-900 shadow-2xs">
                      <Icon className="h-5 w-5 text-stone-800" />
                    </div>
                    <h3 className="font-mono text-xl font-black text-stone-900 tracking-tight">
                      {job.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm leading-relaxed text-stone-800 font-medium">
                    {job.description}
                  </p>
                </div>

                {/* Card Footer: ACCEPT GIG Button */}
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
        <footer className="mt-auto pt-6 pb-6 text-center font-mono text-xs text-stone-500">
          <p>☕ Late-Night Human Career Hunt · Choose wisely, future awaits!</p>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
