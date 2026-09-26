import React, { useState } from "react";
import {
  Radio,
  Vote,
  ShieldAlert,
  Skull,
  ArrowRight,
} from "lucide-react";

export interface JobGig {
  id: string;
  title: string;
  description: string;
  cardColor: string;
  tapeColor: string;
  rotation: string;
  icon: React.ElementType;
}

export const GIG_JOBS: JobGig[] = [
  {
    id: "fake-news-anchor",
    title: "Fake News Anchor",
    description:
      "Headline before deadline!! Fabricate news with given words to get clickbaits and most money possible in strict deadlines!",
    cardColor: "bg-yellow-50 text-stone-800 border-amber-200/90",
    tapeColor: "bg-amber-200/80 border-amber-300/60",
    rotation: "-rotate-1",
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
    id: "cybersecurity",
    title: "Cybersecurity",
    description: "Fight AI attacks from inside the computer!",
    cardColor: "bg-green-50 text-stone-800 border-emerald-200/90",
    tapeColor: "bg-emerald-200/80 border-emerald-300/60",
    rotation: "-rotate-2",
    icon: ShieldAlert,
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
];

interface DashboardProps {
  debt?: number;
  onAcceptGig?: (jobId: string, jobTitle: string) => void;
  onBackToDesktop?: () => void;
}

export function Dashboard({
  debt = 50000,
  onAcceptGig,
  onBackToDesktop,
}: DashboardProps) {
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  const handleAccept = (job: JobGig) => {
    setAcceptedId(job.id);
    console.log(`Accepted gig: ${job.title} (${job.id})`);
    if (onAcceptGig) {
      onAcceptGig(job.id, job.title);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-stone-900 text-stone-100 selection:bg-amber-200 selection:text-stone-900 font-sans">
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
            <h1 className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Career Options (T_T)
            </h1>
            <p className="mt-1 font-mono text-xs sm:text-sm text-stone-400 italic">
              desperate late-night job search... need to get employed and clear debt before midnight ☕
            </p>
          </div>

          {/* Right: Urgent "FINAL NOTICE" Sticky Note with Red Pushpin */}
          <div className="flex items-center justify-start sm:justify-end">
            <div className="relative rotate-2 transition-transform hover:rotate-0 duration-200">
              {/* Red Pushpin graphic */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-red-600 border border-red-700 shadow-md ring-2 ring-red-400/40" />
                <div className="h-1.5 w-0.5 bg-stone-800 -mt-0.5" />
              </div>

              {/* Ripped Sticky Note */}
              <div className="rounded-sm border border-red-200 bg-red-100 p-4 pt-5 text-red-800 shadow-sm min-w-[220px] sm:min-w-[240px]">
                <div className="border-b border-red-200 pb-1 text-center font-mono text-xs font-black tracking-widest text-red-800 uppercase">
                  FINAL NOTICE
                </div>
                <div className="mt-2 text-center">
                  <div className="font-mono text-xs font-semibold text-red-700 uppercase tracking-wider">
                    Debt:
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-red-800 mt-0.5">
                    ${debt.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ================= 2x2 JOB GRID (PASTEL STICKY NOTES) ================= */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8 pb-12">
          {GIG_JOBS.map((job) => {
            const Icon = job.icon;
            const isAccepted = acceptedId === job.id;

            return (
              <div
                key={job.id}
                className={`group relative flex flex-col justify-between rounded-lg border p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${job.cardColor} ${job.rotation}`}
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
                    onClick={() => handleAccept(job)}
                    className="flex items-center gap-1.5 rounded-full border border-stone-800/80 bg-white px-5 py-2 font-mono text-xs font-bold text-stone-900 shadow-xs transition-all hover:bg-stone-100 hover:shadow-sm active:translate-y-0.5 cursor-pointer"
                  >
                    <span>CHOOSE CAREER →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-6 pb-6 text-center font-mono text-xs text-stone-500">
          <p>
            ☕ Late-Night Dorm Room Job Hunt · Choose wisely, future awaits!
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
