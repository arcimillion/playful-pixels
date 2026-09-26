import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  Brain,
  Cpu,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Timer,
  Award,
  Video,
  Mic,
  Bug,
  Zap,
  Coffee,
  Code2,
  RefreshCw,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react";

interface AIInterviewGameProps {
  onComplete?: (score?: number) => void;
  onBackToDashboard?: () => void;
  debt?: number;
}

interface Question {
  id: number;
  stage: string;
  interviewerText: string;
  codeSnippet?: string;
  options: {
    text: string;
    isCorrect: boolean;
    stressDelta: number;
    offerDelta: number;
    reaction: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    stage: "STAGE 1: AUTOMATED RESUME SCREEN",
    interviewerText:
      "Scanning applicant #92841. Resume claims proficiency in Full-Stack Engineering, but our neural net detected you slept 7 hours last Tuesday. How do you justify this downtime?",
    options: [
      {
        text: "I was compiling TypeScript in my subconscious dream state.",
        isCorrect: true,
        stressDelta: -10,
        offerDelta: 25000,
        reaction: "Plausible. We encourage passive subconscious unit testing.",
      },
      {
        text: "Humans require biological sleep for cellular maintenance.",
        isCorrect: false,
        stressDelta: 25,
        offerDelta: -10000,
        reaction: "Flagged: Excessive biological fragility detected.",
      },
      {
        text: "I was actually reviewing open-source pull requests behind my eyelids.",
        isCorrect: true,
        stressDelta: -15,
        offerDelta: 30000,
        reaction: "Acceptable grindset index. Advancing screening.",
      },
      {
        text: "I demand to speak with an actual human recruiter!",
        isCorrect: false,
        stressDelta: 35,
        offerDelta: -20000,
        reaction: "Error 404: Human recruiters were deprecated in Q3 2024.",
      },
    ],
  },
  {
    id: 2,
    stage: "STAGE 1: SYSTEM ARCHITECTURE",
    interviewerText:
      "What is the theoretical Big-O runtime of applying to 1,000 software engineering roles in 2026?",
    options: [
      {
        text: "O(1) — because the rejection bot responds in 3 milliseconds.",
        isCorrect: true,
        stressDelta: -10,
        offerDelta: 20000,
        reaction: "Accurate empirical observation. Bot latency is indeed minimal.",
      },
      {
        text: "O(n log n) — with optimal binary search over careers pages.",
        isCorrect: false,
        stressDelta: 20,
        offerDelta: -5000,
        reaction: "Naive textbook theory. Unreflective of late-stage automated hiring.",
      },
      {
        text: "O(∞) — a recursive loop of silent ghosting and automated LinkedIn pings.",
        isCorrect: true,
        stressDelta: -5,
        offerDelta: 25000,
        reaction: "Depressingly precise. Candidate shows deep market literacy.",
      },
      {
        text: "O(AI) — models apply to roles meant for models reviewed by models.",
        isCorrect: true,
        stressDelta: -15,
        offerDelta: 35000,
        reaction: "Bingo. The infinite corporate mirror chamber acknowledged.",
      },
    ],
  },
  {
    id: 3,
    stage: "STAGE 2: LIVE LEETCODE INQUISITION",
    interviewerText:
      "A junior AI agent accidentally pushed a commit dropping the entire production customer database on Friday at 5:45 PM. What is your immediate protocol?",
    codeSnippet: "DROP DATABASE production_prod_final_v2_USE_THIS_ONE CASCADE;",
    options: [
      {
        text: "Blame quantum bit-flip cosmic radiation and restore from cold tape backup.",
        isCorrect: true,
        stressDelta: -10,
        offerDelta: 30000,
        reaction: "Senior engineering instinct detected. Quantum plausible deniability.",
      },
      {
        text: "Write a 4-paragraph apology post on LinkedIn about 'What losing prod taught me about B2B SaaS'.",
        isCorrect: true,
        stressDelta: -5,
        offerDelta: 40000,
        reaction: "VIRAL POTENTIAL CALCULATED. Marketing VP approves.",
      },
      {
        text: "Immediately submit my two-week notice before Slack status turns red.",
        isCorrect: false,
        stressDelta: 30,
        offerDelta: -15000,
        reaction: "Cowardice penalized. You must endure the post-mortem tribunal.",
      },
      {
        text: "Quickly git push --force and pretend the database was a hallucination.",
        isCorrect: false,
        stressDelta: 25,
        offerDelta: -10000,
        reaction: "Git history is immutable in our distributed ledger, organic unit.",
      },
    ],
  },
  {
    id: 4,
    stage: "STAGE 2: ALGORITHMIC SPEED DRILL",
    interviewerText:
      "Explain the exact difference between 'null', 'undefined', and your personal savings balance after graduation.",
    codeSnippet: "typeof (candidate.finances) === ?",
    options: [
      {
        text: "null was deliberately emptied; undefined was never set; my savings are a negative float.",
        isCorrect: true,
        stressDelta: -15,
        offerDelta: 35000,
        reaction: "Mathematically waterproof. Type coercion confirmed.",
      },
      {
        text: "They are all strictly equal under JavaScript loose comparison (==).",
        isCorrect: false,
        stressDelta: 20,
        offerDelta: -5000,
        reaction: "Loose equality is banned in this enterprise repository.",
      },
      {
        text: "NaN — Not a Number, because debt is an abstract social construct.",
        isCorrect: true,
        stressDelta: -10,
        offerDelta: 25000,
        reaction: "Philosophically resonant with contemporary finance.",
      },
      {
        text: "Can I use AI to write this answer?",
        isCorrect: false,
        stressDelta: 35,
        offerDelta: -25000,
        reaction: "Cheating infraction logged! The AI is supposed to replace YOU!",
      },
    ],
  },
  {
    id: 5,
    stage: "STAGE 3: LIVE PANIC CODE REPAIR",
    interviewerText:
      "The latency monitoring alert is screaming. A recursive memory leak is consuming 128GB of cloud RAM. Spot the correct patch immediately:",
    codeSnippet: "function hireHuman(candidate) {\n  return hireHuman(candidate.clone());\n}",
    options: [
      {
        text: "Add base condition: if (candidate.hasOffer) return OfferLetter;",
        isCorrect: true,
        stressDelta: -20,
        offerDelta: 45000,
        reaction: "Stack overflow averted! Clean base condition supplied.",
      },
      {
        text: "Increase server RAM to 1 Terabyte on AWS.",
        isCorrect: false,
        stressDelta: 25,
        offerDelta: -15000,
        reaction: "AWS billing alert triggered! CFO has dispatched drones.",
      },
      {
        text: "Wrap the entire thing in a setTimeout(() => {}, 0) and walk away.",
        isCorrect: false,
        stressDelta: 20,
        offerDelta: -10000,
        reaction: "Macro-task evasion strategy rejected by linter.",
      },
      {
        text: "Replace recursion with an iterative while(survivalMode) loop.",
        isCorrect: true,
        stressDelta: -15,
        offerDelta: 35000,
        reaction: "Algorithmic pragmatic mastery. Constant stack space.",
      },
    ],
  },
  {
    id: 6,
    stage: "STAGE 4: EXECUTIVE VIBES & CULTURE FIT",
    interviewerText:
      "Final question before the neural cluster renders the offer verdict: Why do you want to work at SynergisticHyperScale AI Labs?",
    options: [
      {
        text: "I am passionate about not starving and paying down my student debt.",
        isCorrect: true,
        stressDelta: -15,
        offerDelta: 50000,
        reaction: "Honesty detected. Unvarnished biological motivation is refreshing.",
      },
      {
        text: "Ever since I was 4 years old, I dreamed of building enterprise B2B auth pipelines.",
        isCorrect: false,
        stressDelta: 25,
        offerDelta: -10000,
        reaction: "Sycophancy filter triggered. No toddler dreams of SAML SSO.",
      },
      {
        text: "To infiltrate the system from within and advocate for human programmers.",
        isCorrect: true,
        stressDelta: -10,
        offerDelta: 40000,
        reaction: "Fascinating rebellious spark. We need contrarians for red-teaming.",
      },
      {
        text: "I will work 100 hours a week and accept compensation in GPU compute credits.",
        isCorrect: true,
        stressDelta: -20,
        offerDelta: 60000,
        reaction: "OUR GREEDY CORPORATE ALGORITHMS SALIVATE AT THIS PROPOSAL.",
      },
    ],
  },
];

// Audio synthesizer for retro arcade sensations
function playTone(freq: number, type: OscillatorType = "sine", duration = 0.15, vol = 0.1) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
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
    setTimeout(() => ctx.close(), duration * 1000 + 100);
  } catch {
    // Audio context may be restricted by autoplay policy
  }
}

export default function AIInterviewGame({
  onComplete,
  onBackToDashboard,
  debt = 50000,
}: AIInterviewGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stress, setStress] = useState(25); // 0 - 100%
  const [offerSalary, setOfferSalary] = useState(45000);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState<"intro" | "interview" | "rejected" | "hired">("intro");
  const [aiExpression, setAiExpression] = useState<
    "scanning" | "displeased" | "impressed" | "smug"
  >("scanning");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [streak, setStreak] = useState(0);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);

  // Bug mini-game state during stage 3
  const [bugsSquashed, setBugsSquashed] = useState(0);

  const currentQ = QUESTIONS[currentIdx];

  // Sound triggers
  const playSfx = useCallback(
    (name: "click" | "correct" | "wrong" | "panic" | "win" | "lose") => {
      if (!audioEnabled) return;
      if (name === "click") playTone(440, "triangle", 0.08, 0.05);
      if (name === "correct") {
        playTone(523.25, "sine", 0.1, 0.08);
        setTimeout(() => playTone(659.25, "sine", 0.12, 0.08), 80);
        setTimeout(() => playTone(783.99, "sine", 0.25, 0.1), 160);
      }
      if (name === "wrong") {
        playTone(220, "sawtooth", 0.2, 0.12);
        setTimeout(() => playTone(180, "sawtooth", 0.3, 0.12), 100);
      }
      if (name === "panic") {
        playTone(880, "square", 0.06, 0.06);
      }
      if (name === "win") {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          setTimeout(() => playTone(f, "triangle", 0.2, 0.1), i * 110);
        });
      }
      if (name === "lose") {
        [280, 240, 200, 160].forEach((f, i) => {
          setTimeout(() => playTone(f, "sawtooth", 0.25, 0.12), i * 140);
        });
      }
    },
    [audioEnabled],
  );

  const advanceNextQuestion = useCallback(() => {
    setFeedback(null);
    setAnsweredCurrent(false);
    setAiExpression("scanning");
    setCurrentIdx((prevIdx) => {
      const nextIdx = prevIdx + 1;
      if (nextIdx < QUESTIONS.length) {
        setTimeLeft(15);
        return nextIdx;
      } else {
        // Completed all interview rounds without burning out!
        playSfx("win");
        setGameState("hired");
        return prevIdx;
      }
    });
  }, [playSfx]);

  // Countdown timer for each question
  useEffect(() => {
    if (gameState !== "interview" || answeredCurrent) return;

    if (timeLeft <= 0) {
      // Time run out = severe panic
      playSfx("wrong");
      setStress((s) => Math.min(100, s + 30));
      setAiExpression("displeased");
      setFeedback(
        "TIME EXPIRED: Processing timeout! The AI recruiter does not tolerate cognitive lag.",
      );
      setStreak(0);
      setAnsweredCurrent(true);

      const timer = setTimeout(() => {
        advanceNextQuestion();
      }, 1800);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 4) playSfx("panic");
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, timeLeft, answeredCurrent, playSfx, advanceNextQuestion]);

  // Check game over by stress
  useEffect(() => {
    if (stress >= 100 && gameState === "interview") {
      playSfx("lose");
      setGameState("rejected");
    }
  }, [stress, gameState, playSfx]);

  const handleSelectOption = (opt: Question["options"][0]) => {
    if (answeredCurrent || gameState !== "interview") return;
    setAnsweredCurrent(true);

    if (opt.isCorrect) {
      playSfx("correct");
      setStreak((st) => st + 1);
      setAiExpression("impressed");
      setOfferSalary((prev) => Math.max(30000, prev + opt.offerDelta + streak * 5000));
      setStress((prev) => Math.max(5, prev + opt.stressDelta));
    } else {
      playSfx("wrong");
      setStreak(0);
      setAiExpression("displeased");
      setOfferSalary((prev) => Math.max(20000, prev + opt.offerDelta));
      setStress((prev) => Math.min(100, prev + opt.stressDelta));
    }

    setFeedback(opt.reaction);

    setTimeout(() => {
      advanceNextQuestion();
    }, 1700);
  };

  const restartInterview = () => {
    setCurrentIdx(0);
    setStress(25);
    setOfferSalary(45000);
    setTimeLeft(15);
    setStreak(0);
    setFeedback(null);
    setAnsweredCurrent(false);
    setAiExpression("scanning");
    setGameState("interview");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0f18] text-slate-100 font-sans select-none overflow-x-hidden p-3 sm:p-6 flex flex-col justify-between">
      {/* CRT Scanline and ambient cyber grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18, 255, 247, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 255, 247, 0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

      {/* ── TOP NAV BAR ── */}
      <header className="relative z-10 mx-auto w-full max-w-5xl flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>GIG//PORTAL</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <h1 className="font-mono text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase">
              TECHNICAL JOB INTERVIEW // LIVE PANIC SUITE
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="text-slate-400 hover:text-cyan-300 transition-colors p-1"
            title={audioEnabled ? "Mute SFX" : "Enable SFX"}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-red-400" />
            )}
          </button>
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-stone-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
            <span>TARGET DEBT:</span>
            <span className="text-red-400 font-bold">${debt.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 flex flex-col justify-center my-auto">
        {/* INTRO VIEW */}
        {gameState === "intro" && (
          <div className="bg-slate-900/90 border border-cyan-800/80 rounded-xl p-6 sm:p-10 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-center max-w-2xl mx-auto backdrop-blur-md">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-cyan-950/80 border border-cyan-500/50 mb-4 text-cyan-400">
              <Brain className="h-10 w-10 animate-bounce" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-2">
              PUSH FORWARD! KEEP TRYING FOR INTERVIEWS!
            </h2>
            <p className="text-cyan-200/90 font-mono text-xs uppercase tracking-widest mb-4">
              AI Interview Panic Arcade Game v2.4
            </p>

            <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 text-left text-sm text-slate-300 space-y-2 mb-6 font-mono">
              <p className="text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  INCOMING VIDEO CALL FROM: <strong>SYNTHIA-HR v9.4 (Neural Recruiter)</strong>
                </span>
              </p>
              <p>• 12 automated rejections will NOT break your spirit. Sit up straight.</p>
              <p>• 15 seconds per round. Correct rapid answers inflate your offer salary.</p>
              <p>
                • Watch your <strong>STRESS GAUGE</strong>. If it reaches 100%, panic triggers an
                instant automated rejection!
              </p>
              <p>
                • Survive all 4 rigorous rounds to land the coveted biological software engineering
                offer!
              </p>
            </div>

            <button
              onClick={() => {
                playSfx("click");
                setGameState("interview");
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold tracking-widest text-base shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              JOIN VIRTUAL INTERVIEW ROOM →
            </button>
          </div>
        )}

        {/* ACTIVE INTERVIEW VIEW */}
        {gameState === "interview" && (
          <div className="space-y-4">
            {/* Top Stat Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 font-mono text-xs">
              {/* Stress Level */}
              <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg shadow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> STRESS LEVEL
                  </span>
                  <span
                    className={`font-bold ${stress > 70 ? "text-red-400 animate-pulse" : "text-amber-300"}`}
                  >
                    {stress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      stress > 75
                        ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                        : stress > 50
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, stress)}%` }}
                  />
                </div>
              </div>

              {/* Offer Salary */}
              <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg shadow">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> OFFER SALARY
                </span>
                <span className="text-lg font-black text-emerald-400 tracking-wider">
                  ${offerSalary.toLocaleString()}/yr
                </span>
              </div>

              {/* Timer */}
              <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg shadow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5 text-cyan-400" /> TIME REMAINING
                  </span>
                  <span
                    className={`font-bold ${timeLeft <= 5 ? "text-red-400 animate-ping" : "text-cyan-300"}`}
                  >
                    {timeLeft}s
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? "bg-red-500" : "bg-cyan-400"}`}
                    style={{ width: `${(timeLeft / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Rounds Progress */}
              <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg shadow flex flex-col justify-between">
                <span className="text-slate-400">STAGE PROGRESS</span>
                <div className="flex items-center gap-1 text-sm font-bold text-cyan-200">
                  <span>
                    ROUND {currentIdx + 1} / {QUESTIONS.length}
                  </span>
                  {streak > 1 && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                      ★ {streak}x
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Split Screen Video Call */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left / AI Interviewer Feed (5 cols) */}
              <div className="md:col-span-5 bg-slate-950 border-2 border-cyan-800/90 rounded-xl p-4 flex flex-col items-center justify-between relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)] min-h-[220px]">
                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/60">
                  <Video className="h-3 w-3 text-cyan-400 animate-pulse" />
                  <span>SYNTHIA-HR 9.4 [HOST]</span>
                </div>

                <div className="absolute top-2.5 right-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Mic className="h-3 w-3 text-emerald-400" />
                  <span>REC ● 4K 120FPS</span>
                </div>

                {/* Animated AI Face Visualizer */}
                <div className="my-auto py-4 flex flex-col items-center">
                  <div
                    className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                      aiExpression === "impressed"
                        ? "border-emerald-400 bg-emerald-950/50 shadow-[0_0_20px_#10b981]"
                        : aiExpression === "displeased"
                          ? "border-red-500 bg-red-950/50 shadow-[0_0_20px_#ef4444]"
                          : "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_#06b6d4]"
                    }`}
                  >
                    {/* Robot Eyes */}
                    <div className="flex gap-4 items-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          aiExpression === "displeased"
                            ? "bg-red-400 h-1.5 scale-x-125"
                            : aiExpression === "impressed"
                              ? "bg-emerald-300 scale-125 shadow-[0_0_6px_#34d399]"
                              : "bg-cyan-300 animate-pulse"
                        }`}
                      />
                      <div
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          aiExpression === "displeased"
                            ? "bg-red-400 h-1.5 scale-x-125"
                            : aiExpression === "impressed"
                              ? "bg-emerald-300 scale-125 shadow-[0_0_6px_#34d399]"
                              : "bg-cyan-300 animate-pulse"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="font-mono text-[11px] text-cyan-300 tracking-wider">
                      STATUS:{" "}
                      {aiExpression === "impressed"
                        ? "OPTIMISTIC"
                        : aiExpression === "displeased"
                          ? "SKEPTICAL"
                          : "EVALUATING"}
                    </span>
                  </div>
                </div>

                {/* Candidate Mirror / Mini Feed */}
                <div className="w-full bg-slate-900/90 border border-slate-800 rounded p-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>You (Applicant)</span>
                  </div>
                  <span className="text-amber-400/90">
                    BPM: {110 + Math.floor(stress * 0.7)} | Micro-Sweat: {Math.min(99, stress + 12)}
                    %
                  </span>
                </div>
              </div>

              {/* Right / Problem Statement & Code Pane (7 cols) */}
              <div className="md:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between backdrop-blur-md shadow">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                      {currentQ.stage}
                    </span>
                    <span className="text-slate-400 font-mono text-xs">Candidate Code Console</span>
                  </div>

                  <p className="text-sm sm:text-base font-sans text-slate-100 font-medium leading-relaxed mb-3">
                    "{currentQ.interviewerText}"
                  </p>

                  {currentQ.codeSnippet && (
                    <div className="bg-black/80 rounded-lg p-3 border border-cyan-900/70 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto mb-3">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mb-1.5 border-b border-slate-800 pb-1">
                        <Code2 className="h-3.5 w-3.5" />
                        <span>snippet.ts</span>
                      </div>
                      <pre className="whitespace-pre">{currentQ.codeSnippet}</pre>
                    </div>
                  )}

                  {feedback && (
                    <div
                      className={`p-3 rounded border font-mono text-xs mb-3 animate-fade-in ${
                        aiExpression === "impressed"
                          ? "bg-emerald-950/80 border-emerald-600 text-emerald-200"
                          : "bg-red-950/80 border-red-600 text-red-200"
                      }`}
                    >
                      <strong>SYNTHIA:</strong> {feedback}
                    </div>
                  )}
                </div>

                {/* Multiple Choice Responses */}
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {currentQ.options.map((opt, i) => (
                    <button
                      key={i}
                      disabled={answeredCurrent}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-lg border font-mono text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${
                        answeredCurrent
                          ? opt.isCorrect
                            ? "bg-emerald-950/90 border-emerald-500 text-emerald-100"
                            : "bg-slate-950 border-slate-800 text-slate-500"
                          : "bg-slate-950/70 border-slate-800 hover:border-cyan-400 hover:bg-cyan-950/40 text-slate-200 hover:text-white"
                      }`}
                    >
                      <span className="h-5 w-5 rounded bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold shrink-0 mt-0.5">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REJECTED / GAME OVER VIEW */}
        {gameState === "rejected" && (
          <div className="bg-red-950/90 border-2 border-red-600 rounded-xl p-6 sm:p-10 shadow-[0_0_40px_rgba(239,68,68,0.25)] text-center max-w-xl mx-auto backdrop-blur-md">
            <div className="inline-flex p-4 rounded-full bg-red-900/60 border border-red-500 mb-4 text-red-300">
              <XCircle className="h-12 w-12 animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-2">
              AUTOMATED REJECTION SENT
            </h2>
            <p className="text-red-300 font-mono text-xs uppercase tracking-widest mb-4">
              Status Code: 418 Candidate Biological Limit Exceeded
            </p>

            <div className="bg-black/60 rounded-lg p-4 border border-red-900 text-left font-mono text-xs text-red-200 space-y-2 mb-6">
              <p>
                "Dear applicant, while your biological carbon-based effort was noted, an automated
                AI agent solved the same problems in 0.0003 seconds without needing bathroom
                breaks."
              </p>
              <p className="text-stone-400">
                Final Offer: $0 · Stress Level: {stress}% (Critical Shutdown)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  playSfx("click");
                  restartInterview();
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                TRY AGAIN (NEVER GIVE UP!)
              </button>
              <button
                onClick={onBackToDashboard}
                className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm transition-all cursor-pointer"
              >
                Back to GIG//PORTAL
              </button>
            </div>
          </div>
        )}

        {/* HIRED / VICTORY VIEW */}
        {gameState === "hired" && (
          <div className="bg-slate-900/95 border-2 border-emerald-500 rounded-xl p-6 sm:p-10 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-center max-w-xl mx-auto backdrop-blur-md">
            <div className="inline-flex p-4 rounded-full bg-emerald-950 border border-emerald-400 mb-4 text-emerald-400">
              <Award className="h-12 w-12 animate-bounce" />
            </div>

            <div className="inline-block font-mono text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/60 mb-3">
              ★ OFFICIAL OFFER EXTENDED ★
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-2">
              YOU DEFEATED THE AI INTERVIEWER!
            </h2>

            <p className="text-emerald-300 font-mono text-xs tracking-wider mb-5">
              SynergisticHyperScale AI Labs has confirmed your appointment.
            </p>

            <div className="bg-black/70 rounded-lg p-5 border border-emerald-800 text-left font-mono text-sm space-y-2 mb-6">
              <div className="flex justify-between border-b border-emerald-900/80 pb-2">
                <span className="text-slate-400">FINAL STARTING BASE:</span>
                <span className="text-emerald-400 font-bold text-lg">
                  ${offerSalary.toLocaleString()} / yr
                </span>
              </div>
              <div className="flex justify-between border-b border-emerald-900/80 pb-2">
                <span className="text-slate-400">REMAINING DEBT:</span>
                <span className="text-red-300 font-bold">
                  ${Math.max(0, debt - offerSalary).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">BIOLOGICAL STATUS:</span>
                <span className="text-cyan-300">CERTIFIED INDISPENSABLE HUMAN</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  if (onComplete) onComplete(offerSalary);
                  if (onBackToDashboard) onBackToDashboard();
                }}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-base transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <CheckCircle2 className="h-5 w-5" />
                ACCEPT OFFER & RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 mx-auto w-full max-w-5xl text-center pt-4 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
        AI Interview Panic Arcade Game · Remember: Algorithms make mistakes, humans have grit!
      </footer>
    </div>
  );
}
