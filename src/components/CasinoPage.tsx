import React, { useState } from "react";
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  Rocket,
  Gift,
  Dices,
  RotateCw,
  Crown,
  ShieldAlert,
} from "lucide-react";

export interface CasinoPageProps {
  savings: number;
  currentTheme?: string;
  hasVipCasinoPass?: boolean;
  onBackToShop: () => void;
  onWin: (amount: number) => void;
  onLoss: (amount: number, gameTitle: string) => void;
}

export function CasinoPage({ savings, currentTheme, hasVipCasinoPass = false, onBackToShop, onWin, onLoss }: CasinoPageProps) {
  // Helper to apply VIP +25% payout multiplier
  const triggerWin = (baseAmount: number) => {
    const finalAmount = hasVipCasinoPass ? Math.round(baseAmount * 1.25) : baseAmount;
    onWin(finalAmount);
  };
  // Game A: 0DTE Options States
  const [betAmount, setBetAmount] = useState<string>("500");
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [tradeMessage, setTradeMessage] = useState<string>("");
  const [tradeFlash, setTradeFlash] = useState<"profit" | "liquidated" | null>(null);

  // Game B: Tech-Bro Slots States
  const [slotReels, setSlotReels] = useState<[string, string, string]>(["🚀", "💎", "🌙"]);
  const [isSpinningSlots, setIsSpinningSlots] = useState<boolean>(false);
  const [slotMessage, setSlotMessage] = useState<string>("");
  const [slotFlash, setSlotFlash] = useState<"win" | "jackpot" | "bust" | null>(null);

  // Game C: NFT Mystery Box States
  const [isOpeningBox, setIsOpeningBox] = useState<boolean>(false);
  const [boxMessage, setBoxMessage] = useState<string>("");
  const [boxRevealedApe, setBoxRevealedApe] = useState<{
    type: "rare" | "worthless";
    title: string;
    icon: string;
    desc: string;
    payout: number;
  } | null>(null);

  // Game D: VC Roulette States
  const [vcBetAmount, setVcBetAmount] = useState<string>("1000");
  const [vcMultiplier, setVcMultiplier] = useState<2 | 5 | 10>(2);
  const [isSpinningVc, setIsSpinningVc] = useState<boolean>(false);
  const [vcResult, setVcResult] = useState<{
    status: "funded" | "rugged";
    message: string;
    payout: number;
  } | null>(null);
  const [vcSpinnerText, setVcSpinnerText] = useState<string>("");

  // Game A Handler: 0DTE Options
  const handleExecuteTrade = () => {
    const numBet = parseInt(betAmount, 10);
    if (isNaN(numBet) || numBet <= 0) return;

    setIsTrading(true);
    setTradeFlash(null);
    setTradeMessage("Transmitting 0DTE option contract to pit brokers...");

    setTimeout(() => {
      setIsTrading(false);
      const won = Math.random() < 0.4; // 40% win rate

      if (won) {
        triggerWin(numBet);
        setTradeFlash("profit");
        setTradeMessage(`✦ WINNER! +$${(numBet * (hasVipCasinoPass ? 2.25 : 2)).toLocaleString()} (${hasVipCasinoPass ? "2.25X VIP" : "2X"} RETURN) ✦`);
      } else {
        setTradeFlash("liquidated");
        setTradeMessage(`✕ CONTRACT EXPIRED WORTHLESS: -$${numBet.toLocaleString()}`);
        onLoss(numBet, "0DTE Options");
      }

      setTimeout(() => setTradeFlash(null), 3500);
    }, 500);
  };

  // Game B Handler: Tech-Bro Slots ($100 / spin)
  const handleSpinSlots = () => {
    if (isSpinningSlots) return;

    setIsSpinningSlots(true);
    setSlotFlash(null);
    setSlotMessage("Mechanical reels in motion...");

    const symbols = ["🚀", "💎", "📉", "🌙"];
    const interval = setInterval(() => {
      setSlotReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinningSlots(false);

      const roll = Math.random();
      let finalReels: [string, string, string];

      if (roll < 0.05) {
        // 5% chance: Mega Moons ($5,000)
        finalReels = ["🌙", "🌙", "🌙"];
        setSlotReels(finalReels);
        triggerWin(5000);
        setSlotFlash("jackpot");
        setSlotMessage(`✦ GRAND JACKPOT: 3x Moons! Won $${(hasVipCasinoPass ? 6250 : 5000).toLocaleString()}! ✦`);
      } else if (roll < 0.2) {
        // 15% chance: Rockets ($1,000)
        finalReels = ["🚀", "🚀", "🚀"];
        setSlotReels(finalReels);
        triggerWin(1000);
        setSlotFlash("win");
        setSlotMessage(`✦ PAYOUT: 3x Rockets! Won $${(hasVipCasinoPass ? 1250 : 1000).toLocaleString()}! ✦`);
      } else {
        // Loss
        const mixedOptions: [string, string, string][] = [
          ["🚀", "💎", "📉"],
          ["💎", "💎", "📉"],
          ["📉", "📉", "🚀"],
          ["🌙", "🚀", "💎"],
          ["📉", "🌙", "📉"],
        ];
        finalReels = mixedOptions[Math.floor(Math.random() * mixedOptions.length)];
        setSlotReels(finalReels);
        setSlotFlash("bust");
        setSlotMessage("No match. -$100. Spin again.");
        onLoss(100, "Tech-Bro Slots");
      }

      setTimeout(() => setSlotFlash(null), 4000);
    }, 750);
  };

  // Game C Handler: NFT Mystery Box ($500 / box)
  const handleOpenMysteryBox = () => {
    if (isOpeningBox) return;

    setIsOpeningBox(true);
    setBoxRevealedApe(null);
    setBoxMessage("Verifying provenance on private ledger...");

    setTimeout(() => {
      setIsOpeningBox(false);
      const isRare = Math.random() >= 0.85; // 15% rare golden ape

      if (isRare) {
        triggerWin(5000);
        setBoxRevealedApe({
          type: "rare",
          title: "Rare Golden Ape #777 (Ultra Grail)",
          payout: hasVipCasinoPass ? 6250 : 5000,
          icon: "🦧👑",
          desc: `Masterwork Provenance. Private collector purchased piece. Added +$${(hasVipCasinoPass ? 6250 : 5000).toLocaleString()} to vault!`,
        });
        setBoxMessage(`✦ GRAIL UNVEILED: Rare Golden Ape (+$${(hasVipCasinoPass ? 6250 : 5000).toLocaleString()})! ✦`);
      } else {
        setBoxRevealedApe({
          type: "worthless",
          title: "Worthless Screenshot #404",
          payout: 0,
          icon: "🐵🖼️",
          desc: "Unbacked reproduction. Floor valuation collapsed to zero ($0 value).",
        });
        setBoxMessage("Worthless Artifact ($0 value). -$500 forfeit.");
        onLoss(500, "NFT Mystery Box");
      }
    }, 700);
  };

  // Game D Handler: VC Roulette
  const handleSpinVcRoulette = () => {
    if (isSpinningVc) return;
    const numBet = parseInt(vcBetAmount, 10);
    if (isNaN(numBet) || numBet <= 0) return;

    setIsSpinningVc(true);
    setVcResult(null);

    const pitchStages = [
      "Presenting pitch deck to Sand Hill Road partners...",
      "Evaluating Total Addressable Market & cap table...",
      "Syndicate reviewing Series A term sheet covenants...",
      "Final investment committee vote in progress...",
    ];
    let stageIdx = 0;
    setVcSpinnerText(pitchStages[0]);
    const stageInterval = setInterval(() => {
      stageIdx++;
      setVcSpinnerText(pitchStages[stageIdx % pitchStages.length]);
    }, 200);

    setTimeout(() => {
      clearInterval(stageInterval);
      setIsSpinningVc(false);

      const winRate = vcMultiplier === 2 ? 0.45 : vcMultiplier === 5 ? 0.15 : 0.05;
      const won = Math.random() < winRate;

      if (won) {
        const payout = numBet * vcMultiplier;
        triggerWin(payout);
        const finalPayout = hasVipCasinoPass ? Math.round(payout * 1.25) : payout;
        setVcResult({
          status: "funded",
          message: `✦ TERM SHEET SIGNED! ${vcMultiplier}X PAYOUT: +$${finalPayout.toLocaleString()} ✦`,
          payout: finalPayout,
        });
      } else {
        setVcResult({
          status: "rugged",
          message: `✕ PITCH REJECTED! Syndicate rugged (-$${numBet.toLocaleString()})`,
          payout: 0,
        });
        onLoss(numBet, "VC Roulette");
      }
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-stone-950 text-stone-100 font-sans selection:bg-amber-900/50 selection:text-amber-200">
      {/* Rich Velvet Mahogany Background & Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/40 via-stone-950 to-[#0c0406]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(180,83,9,0.12),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-900/40 pb-6 mb-8 gap-4">
          {/* Muted Gold Return Button */}
          <button
            onClick={onBackToShop}
            className="flex items-center gap-2 rounded-lg border border-amber-700/40 bg-stone-900/80 px-4 py-2 font-serif text-xs sm:text-sm font-semibold tracking-wide text-amber-400/90 hover:text-amber-300 hover:border-amber-600/70 hover:bg-stone-900 transition shadow-md cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Return to Shop</span>
          </button>

          {/* Luxurious Dark Green Felt Savings Pill */}
          <div className="flex items-center gap-3 rounded-full border-2 border-amber-500/90 bg-emerald-950 px-8 py-2 text-xl sm:text-2xl font-serif font-bold text-amber-400 shadow-[0_10px_25px_-5px_rgba(5,46,22,0.8),inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <Coins className="h-6 w-6 text-amber-400 drop-shadow" />
            <span className="tracking-wider">SAVINGS: ${savings.toLocaleString()}</span>
          </div>
        </div>

        {/* Vintage Casino Header Banner */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-600/30 bg-amber-950/40 text-amber-300 font-serif text-xs font-semibold tracking-widest uppercase mb-3 shadow-inner">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span>VIP High-Roller Salon · Est. 1924</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-widest text-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] uppercase">
            The Degenerate Casino
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-200/70 max-w-2xl mx-auto font-serif italic leading-relaxed">
            Wager your fortune at the private salon tables. Should your losses exceed your liquid
            savings, the house automatically notes the deficit into active debt, banishing you back
            to the gig desk.
          </p>
        </div>

        {/* 4 Mini-Game Tables (2x2 Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-16">
          {/* ================= TABLE I: 0DTE Options Trading ================= */}
          <div className="flex flex-col justify-between rounded-xl border border-amber-700/50 bg-stone-900/80 backdrop-blur-sm p-6 shadow-2xl transition-all duration-300 hover:border-amber-600/70">
            <div>
              <div className="flex items-center justify-between border-b border-amber-800/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  <h3 className="font-serif text-base font-bold tracking-wider text-amber-200 uppercase">
                    Table I: 0DTE Options
                  </h3>
                </div>
                <span className="text-[11px] font-serif font-bold px-2.5 py-0.5 rounded border border-amber-600/40 bg-stone-950 text-amber-400 tracking-wider">
                  40% WIN (2X) · 60% BUST
                </span>
              </div>

              <p className="text-xs text-stone-300/80 mb-4 leading-relaxed font-serif">
                A gentleman&apos;s coin toss with market makers. <strong>40% probability</strong> to
                double your stake (2x payout), <strong>60% probability</strong> of total expiration.
              </p>

              {/* Status Banner */}
              {tradeMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg font-serif text-center text-xs font-bold tracking-wide transition-all ${
                    tradeFlash === "profit"
                      ? "bg-emerald-950 border border-emerald-500/70 text-emerald-300 shadow-lg"
                      : tradeFlash === "liquidated"
                        ? "bg-rose-950 border border-rose-600/70 text-rose-300 shadow-lg"
                        : "bg-stone-950 border border-amber-700/50 text-amber-300"
                  }`}
                >
                  {tradeMessage}
                </div>
              )}

              {/* Bet Controls */}
              <div className="space-y-2 mb-6">
                <label className="text-[11px] font-serif font-semibold tracking-wider text-amber-400/80 block uppercase">
                  Wager Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-amber-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter wager amount"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-amber-700/50 bg-stone-950 text-amber-300 font-mono text-sm focus:border-amber-400 focus:outline-none shadow-inner"
                  />
                </div>

                {/* Wooden/Brass Token Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {["100", "500", "1000", "5000"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBetAmount(val)}
                      className="flex-1 py-1.5 rounded border border-amber-700/40 bg-stone-950/80 text-[11px] font-serif font-semibold text-amber-300/90 hover:bg-stone-800 hover:text-amber-200 transition cursor-pointer"
                    >
                      ${val}
                    </button>
                  ))}
                  <button
                    onClick={() => setBetAmount(String(Math.max(100, savings)))}
                    className="flex-1 py-1.5 rounded border border-amber-500/60 bg-amber-950/60 text-[11px] font-serif font-bold text-amber-300 hover:bg-amber-900/70 transition cursor-pointer"
                  >
                    ALL-IN
                  </button>
                </div>
              </div>
            </div>

            {/* Tactile Crimson / Gold Bet Button */}
            <button
              onClick={handleExecuteTrade}
              disabled={isTrading}
              className={`w-full py-3 rounded-lg font-serif text-sm font-bold tracking-widest uppercase transition-all shadow-lg active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 ${
                isTrading
                  ? "bg-stone-800 text-stone-500 border border-stone-700 cursor-wait"
                  : "bg-red-800 hover:bg-red-700 text-amber-100 border border-amber-600/40"
              }`}
            >
              <span>{isTrading ? "EXECUTING CONTRACT..." : "PLACE 0DTE WAGER"}</span>
            </button>
          </div>

          {/* ================= TABLE II: Tech-Bro Slots ================= */}
          <div className="flex flex-col justify-between rounded-xl border border-amber-700/50 bg-stone-900/80 backdrop-blur-sm p-6 shadow-2xl transition-all duration-300 hover:border-amber-600/70">
            <div>
              <div className="flex items-center justify-between border-b border-amber-800/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-amber-400" />
                  <h3 className="font-serif text-base font-bold tracking-wider text-amber-200 uppercase">
                    Table II: Tech-Bro Slots
                  </h3>
                </div>
                <span className="text-[11px] font-serif font-bold px-2.5 py-0.5 rounded border border-amber-600/40 bg-stone-950 text-amber-400 tracking-wider">
                  $100 PER PULL
                </span>
              </div>

              <p className="text-xs text-stone-300/80 mb-4 leading-relaxed font-serif">
                Three mechanical reels. Match 3 Rockets (🚀) for <strong>$1,000</strong> or 3 Moons
                (🌙) for the <strong>$5,000</strong> jackpot.
              </p>

              {/* Reel Window */}
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-amber-700/40 bg-stone-950 shadow-inner mb-4">
                {slotReels.map((emoji, idx) => (
                  <div
                    key={idx}
                    className={`flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-lg border-2 border-amber-600/40 text-3xl sm:text-4xl bg-stone-900 shadow-md select-none transition-transform ${
                      isSpinningSlots ? "animate-pulse scale-95 border-amber-400" : "scale-100"
                    }`}
                  >
                    {emoji}
                  </div>
                ))}
              </div>

              {/* Status Banner */}
              {slotMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg font-serif text-center text-xs font-bold tracking-wide transition-all ${
                    slotFlash === "jackpot" || slotFlash === "win"
                      ? "bg-emerald-950 border border-emerald-500/70 text-emerald-300 shadow-lg"
                      : slotFlash === "bust"
                        ? "bg-rose-950 border border-rose-600/70 text-rose-300 shadow-lg"
                        : "bg-stone-950 border border-amber-700/50 text-amber-300"
                  }`}
                >
                  {slotMessage}
                </div>
              )}
            </div>

            {/* Tactile Dark Gold Spin Button */}
            <button
              onClick={handleSpinSlots}
              disabled={isSpinningSlots}
              className={`w-full py-3 rounded-lg font-serif text-sm font-bold tracking-widest uppercase transition-all shadow-lg active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 ${
                isSpinningSlots
                  ? "bg-stone-800 text-stone-500 border border-stone-700 cursor-wait"
                  : "bg-amber-700 hover:bg-amber-600 text-stone-950 border border-amber-500/50"
              }`}
            >
              <RotateCw className={`h-4 w-4 ${isSpinningSlots ? "animate-spin" : ""}`} />
              <span>{isSpinningSlots ? "SPINNING REELS..." : "PULL LEVER ($100)"}</span>
            </button>
          </div>

          {/* ================= TABLE III: NFT Mystery Box ================= */}
          <div className="flex flex-col justify-between rounded-xl border border-amber-700/50 bg-stone-900/80 backdrop-blur-sm p-6 shadow-2xl transition-all duration-300 hover:border-amber-600/70">
            <div>
              <div className="flex items-center justify-between border-b border-amber-800/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-amber-400" />
                  <h3 className="font-serif text-base font-bold tracking-wider text-amber-200 uppercase">
                    Table III: Mystery Crate
                  </h3>
                </div>
                <span className="text-[11px] font-serif font-bold px-2.5 py-0.5 rounded border border-amber-600/40 bg-stone-950 text-amber-400 tracking-wider">
                  $500 PER VAULT
                </span>
              </div>

              <p className="text-xs text-stone-300/80 mb-4 leading-relaxed font-serif">
                Fixed entrance of $500. <strong>15% chance</strong> for a Rare Golden Ape (+
                <strong>$5,000</strong> vault payout). 85% worthless replica.
              </p>

              {/* Reveal Showcase */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-amber-700/40 bg-stone-950 mb-4 min-h-[105px]">
                {isOpeningBox ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl animate-bounce">📦</span>
                    <span className="font-serif text-xs text-amber-300 animate-pulse tracking-wide">
                      Unsealing velvet presentation crate...
                    </span>
                  </div>
                ) : boxRevealedApe ? (
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-3xl">{boxRevealedApe.icon}</span>
                    <div className="min-w-0">
                      <p
                        className={`font-serif text-xs font-bold uppercase tracking-wide ${
                          boxRevealedApe.type === "rare" ? "text-amber-300" : "text-stone-400"
                        }`}
                      >
                        {boxRevealedApe.title}
                      </p>
                      <p className="text-xs text-stone-300/80 font-serif line-clamp-2">
                        {boxRevealedApe.desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-stone-400">
                    <span className="text-2xl">🎁</span>
                    <span className="font-serif text-xs tracking-wider">Sealed Curated Crate</span>
                  </div>
                )}
              </div>

              {/* Status Banner */}
              {boxMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg font-serif text-center text-xs font-bold tracking-wide transition-all ${
                    boxRevealedApe?.type === "rare"
                      ? "bg-emerald-950 border border-emerald-500/70 text-emerald-300 shadow-lg"
                      : "bg-rose-950 border border-rose-600/70 text-rose-300 shadow-lg"
                  }`}
                >
                  {boxMessage}
                </div>
              )}
            </div>

            {/* Tactile Crimson Box Button */}
            <button
              onClick={handleOpenMysteryBox}
              disabled={isOpeningBox}
              className={`w-full py-3 rounded-lg font-serif text-sm font-bold tracking-widest uppercase transition-all shadow-lg active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 ${
                isOpeningBox
                  ? "bg-stone-800 text-stone-500 border border-stone-700 cursor-wait"
                  : "bg-red-800 hover:bg-red-700 text-amber-100 border border-amber-600/40"
              }`}
            >
              <Gift className="h-4 w-4 text-amber-300" />
              <span>{isOpeningBox ? "UNSEALING CRATE..." : "UNSEAL CRATE ($500)"}</span>
            </button>
          </div>

          {/* ================= TABLE IV: Venture Capital Roulette ================= */}
          <div className="flex flex-col justify-between rounded-xl border border-amber-700/50 bg-stone-900/80 backdrop-blur-sm p-6 shadow-2xl transition-all duration-300 hover:border-amber-600/70">
            <div>
              <div className="flex items-center justify-between border-b border-amber-800/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Dices className="h-5 w-5 text-amber-400" />
                  <h3 className="font-serif text-base font-bold tracking-wider text-amber-200 uppercase">
                    Table IV: VC Roulette
                  </h3>
                </div>
                <span className="text-[11px] font-serif font-bold px-2.5 py-0.5 rounded border border-amber-600/40 bg-stone-950 text-amber-400 tracking-wider">
                  MULTIPLIER WHEEL
                </span>
              </div>

              <p className="text-xs text-stone-300/80 mb-4 leading-relaxed font-serif">
                Select your syndicate risk tier: <strong>2x (45% win)</strong>,{" "}
                <strong>5x (15% win)</strong>, or <strong>10x (5% win)</strong>.
              </p>

              {/* Multiplier Selectors */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {([2, 5, 10] as const).map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setVcMultiplier(mult)}
                    className={`py-2 rounded-lg border font-serif text-xs font-bold tracking-wider transition cursor-pointer ${
                      vcMultiplier === mult
                        ? "border-amber-400 bg-amber-950/70 text-amber-300 shadow-md"
                        : "border-amber-800/40 bg-stone-950 text-stone-400 hover:bg-stone-900"
                    }`}
                  >
                    {mult}X ({mult === 2 ? "45%" : mult === 5 ? "15%" : "5%"})
                  </button>
                ))}
              </div>

              {/* Spin Stage Message */}
              <div className="p-3 rounded-lg border border-amber-700/40 bg-stone-950 text-center mb-4 min-h-[46px] flex items-center justify-center">
                {isSpinningVc ? (
                  <span className="font-serif text-xs font-bold text-amber-400 animate-pulse tracking-wide">
                    ✦ {vcSpinnerText}
                  </span>
                ) : vcResult ? (
                  <span
                    className={`font-serif text-xs font-bold uppercase tracking-wider ${
                      vcResult.status === "funded" ? "text-emerald-300" : "text-rose-400"
                    }`}
                  >
                    {vcResult.message}
                  </span>
                ) : (
                  <span className="font-serif text-xs text-stone-400 italic">
                    Investment syndicate ready to receive pitch
                  </span>
                )}
              </div>

              {/* Wager Input */}
              <div className="space-y-2 mb-6">
                <label className="text-[11px] font-serif font-semibold tracking-wider text-amber-400/80 block uppercase">
                  Syndicate Wager ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-amber-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={vcBetAmount}
                    onChange={(e) => setVcBetAmount(e.target.value)}
                    placeholder="Enter wager amount"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-amber-700/50 bg-stone-950 text-amber-300 font-mono text-sm focus:border-amber-400 focus:outline-none shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {["100", "500", "1000", "5000"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setVcBetAmount(val)}
                      className="flex-1 py-1.5 rounded border border-amber-700/40 bg-stone-950/80 text-[11px] font-serif font-semibold text-amber-300/90 hover:bg-stone-800 hover:text-amber-200 transition cursor-pointer"
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tactile Dark Gold Roulette Button */}
            <button
              onClick={handleSpinVcRoulette}
              disabled={isSpinningVc}
              className={`w-full py-3 rounded-lg font-serif text-sm font-bold tracking-widest uppercase transition-all shadow-lg active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 ${
                isSpinningVc
                  ? "bg-stone-800 text-stone-500 border border-stone-700 cursor-wait"
                  : "bg-amber-700 hover:bg-amber-600 text-stone-950 border border-amber-500/50"
              }`}
            >
              <Dices className="h-4 w-4" />
              <span>
                {isSpinningVc ? "SYNDICATE VOTING..." : `PITCH FOR ${vcMultiplier}X MULTIPLIER`}
              </span>
            </button>
          </div>
        </div>

        {/* Footer Warning / Relapse Reminder */}
        <div className="rounded-xl border border-amber-800/30 bg-stone-950/80 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-400/90 font-serif text-xs font-semibold tracking-wider uppercase">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>The House Rules & Debt Covenant</span>
          </div>
          <p className="mt-1 text-xs text-stone-400 font-serif">
            All tables permit high-limit and credit betting. Any deficit exceeding your vault
            savings converts directly into enforceable debt and returns you to the gig portal
            instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CasinoPage;
