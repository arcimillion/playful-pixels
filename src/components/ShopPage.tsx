import React, { useState } from "react";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Coffee,
  Coins,
  ShieldCheck,
  Star,
  Palette,
  SlidersHorizontal,
} from "lucide-react";

export interface ShopPageProps {
  savings: number;
  hasBubbles: boolean;
  hasClickSound: boolean;
  hasCustomButtons: boolean;
  hasVignette: boolean;
  hasBackgroundAudio: boolean;
  hasGym: boolean;
  hasPinwheel?: boolean;
  hasRainAudio?: boolean;
  hasThunderAudio?: boolean;
  hasVipCasinoPass?: boolean;
  hasGoldenResume?: boolean;
  hasNeonTheme?: boolean;
  hasStarryNight?: boolean;
  hasCoffeeMachine?: boolean;
  isPlayingAudio?: boolean;
  isPlayingRain?: boolean;
  isPlayingThunder?: boolean;
  onBackToDashboard: () => void;
  onEnterCasino: () => void;
  onBuyBubbles: () => void;
  onBuyClickSound: () => void;
  onBuyCustomButtons: () => void;
  onBuyVignette: () => void;
  onBuyBackgroundAudio: () => void;
  onBuyGym: () => void;
  onBuyPinwheel?: () => void;
  onBuyRainAudio?: () => void;
  onBuyThunderAudio?: () => void;
  onBuyVipCasinoPass?: () => void;
  onBuyGoldenResume?: () => void;
  onBuyNeonTheme?: () => void;
  onBuyStarryNight?: () => void;
  onBuyCoffeeMachine?: () => void;
  onToggleAudio?: () => void;
  onToggleRain?: () => void;
  onToggleThunder?: () => void;
}

export function ShopPage({
  savings,
  hasBubbles,
  hasClickSound,
  hasCustomButtons,
  hasVignette,
  hasBackgroundAudio,
  hasGym,
  hasPinwheel = false,
  hasRainAudio = false,
  hasThunderAudio = false,
  hasVipCasinoPass = false,
  hasGoldenResume = false,
  hasNeonTheme = false,
  hasStarryNight = false,
  hasCoffeeMachine = false,
  isPlayingAudio = false,
  isPlayingRain = false,
  isPlayingThunder = false,
  onBackToDashboard,
  onEnterCasino,
  onBuyBubbles,
  onBuyClickSound,
  onBuyCustomButtons,
  onBuyVignette,
  onBuyBackgroundAudio,
  onBuyGym,
  onBuyPinwheel,
  onBuyRainAudio,
  onBuyThunderAudio,
  onBuyVipCasinoPass,
  onBuyGoldenResume,
  onBuyNeonTheme,
  onBuyStarryNight,
  onBuyCoffeeMachine,
  onToggleAudio,
  onToggleRain,
  onToggleThunder,
}: ShopPageProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "visual" | "audio" | "perk">("all");

  const shopItems = [
    {
      id: "bubble_effect",
      code: "UPG-01",
      category: "visual",
      categoryLabel: "Visual FX",
      title: "Bubble Effect",
      desc: "Renders a subtle floating particle layer of slow-rising translucent bubbles across the entire app interface.",
      cost: 250,
      owned: hasBubbles,
      onBuy: onBuyBubbles,
    },
    {
      id: "click_sfx",
      code: "UPG-02",
      category: "audio",
      categoryLabel: "Audio FX",
      title: "Click Sound Effects",
      desc: "Attaches a crisp procedural HTML5 Web Audio API beep sound to every button click event globally across the app.",
      cost: 400,
      owned: hasClickSound,
      onBuy: onBuyClickSound,
    },
    {
      id: "gym_membership",
      code: "UPG-03",
      category: "perk",
      categoryLabel: "Health Perk",
      title: "Gym Membership",
      desc: "Prevents random negative gig fever and sickness events from triggering on the dashboard.",
      cost: 500,
      owned: hasGym,
      onBuy: onBuyGym,
    },
    {
      id: "custom_buttons",
      code: "UPG-04",
      category: "visual",
      categoryLabel: "Interface Theme",
      title: "Custom Button UI",
      desc: "Swaps all default buttons to a high-contrast retro-border aesthetic (border-stone-400 bg-stone-900 shadow-[2px_2px_0px_#78716c]).",
      cost: 750,
      owned: hasCustomButtons,
      onBuy: onBuyCustomButtons,
    },
    {
      id: "pinwheel_bg",
      code: "UPG-05",
      category: "visual",
      categoryLabel: "Visual FX",
      title: "Pinwheel & Background",
      desc: "Spawns a vibrant, continuous layer of spinning multi-colored pinwheels floating smoothly across the interface.",
      cost: 850,
      owned: hasPinwheel,
      onBuy: onBuyPinwheel || (() => {}),
    },
    {
      id: "screen_vignette",
      code: "UPG-06",
      category: "visual",
      categoryLabel: "Visual FX",
      title: "Screen Shading / Vignette",
      desc: "Renders a fixed, dark radial gradient vignette overlay across the screen for an immersive terminal feel.",
      cost: 1000,
      owned: hasVignette,
      onBuy: onBuyVignette,
    },
    {
      id: "rain_audio",
      code: "UPG-07",
      category: "audio",
      categoryLabel: "Ambient Sound",
      title: "Background Rain Sound",
      desc: "Loops a calming, realistic procedural rain patter ambient audio track with an instant toggle control.",
      cost: 1200,
      owned: hasRainAudio,
      onBuy: onBuyRainAudio || (() => {}),
    },
    {
      id: "background_audio",
      code: "UPG-08",
      category: "audio",
      categoryLabel: "Music Track",
      title: "Background Audio (Lo-Fi)",
      desc: "Seamlessly loops an upbeat 110 BPM jazz-hop instrumental audio track using an HTML5 audio element with playback toggle.",
      cost: 1500,
      owned: hasBackgroundAudio,
      onBuy: onBuyBackgroundAudio,
    },
    {
      id: "thunder_audio",
      code: "UPG-09",
      category: "audio",
      categoryLabel: "Ambient Sound",
      title: "Thundercloud Sound",
      desc: "Loops a deep, atmospheric rolling thunder storm audio track with low-frequency rumble peals.",
      cost: 1800,
      owned: hasThunderAudio,
      onBuy: onBuyThunderAudio || (() => {}),
    },
    {
      id: "vip_casino_pass",
      code: "UPG-10",
      category: "perk",
      categoryLabel: "Financial Perk",
      title: "VIP Casino Pass (+25% Payouts)",
      desc: "Grants executive high-roller credentials boosting all Casino minigame payout winnings by +25% across all games.",
      cost: 2200,
      owned: hasVipCasinoPass,
      onBuy: onBuyVipCasinoPass || (() => {}),
    },
    {
      id: "golden_resume",
      code: "UPG-11",
      category: "perk",
      categoryLabel: "Financial Perk",
      title: "Golden Resume (+50% Gig Income)",
      desc: "Unlocks an executive gold status boost that increases all completed human gig job payouts by +50% permanently.",
      cost: 3000,
      owned: hasGoldenResume,
      onBuy: onBuyGoldenResume || (() => {}),
    },
    {
      id: "neon_theme",
      code: "UPG-12",
      category: "visual",
      categoryLabel: "Interface Theme",
      title: "Neon Cyber-Glow Theme",
      desc: "Applies a high-contrast Cyber Neon Emerald/Cyan aesthetic with glowing accents across the app.",
      cost: 3500,
      owned: hasNeonTheme,
      onBuy: onBuyNeonTheme || (() => {}),
    },
    {
      id: "starry_night",
      code: "UPG-13",
      category: "visual",
      categoryLabel: "Visual FX",
      title: "Starry Night Particle Field",
      desc: "Spawns an animated twinkling constellation starfield particle layer floating continuously in the terminal background.",
      cost: 4200,
      owned: hasStarryNight,
      onBuy: onBuyStarryNight || (() => {}),
    },
    {
      id: "coffee_machine",
      code: "UPG-14",
      category: "perk",
      categoryLabel: "Passive Income",
      title: "Coffee Machine (+$100 / 5s)",
      desc: "Installs an automated espresso bar that generates +$100 passive residual income every 5 seconds on the dashboard.",
      cost: 5000,
      owned: hasCoffeeMachine,
      onBuy: onBuyCoffeeMachine || (() => {}),
    },
  ];

  const filteredItems = shopItems.filter(
    (item) => activeFilter === "all" || item.category === activeFilter,
  );

  const totalOwnedCount = shopItems.filter((i) => i.owned).length;

  return (
    <div
      className={`relative min-h-screen w-full bg-stone-950 text-stone-300 font-mono px-4 py-8 sm:px-8 sm:py-12 transition-colors duration-300 ${
        hasCustomButtons
          ? "retro-buttons-active [&_button]:border [&_button]:border-stone-400 [&_button]:bg-stone-900 [&_button]:text-stone-200 [&_button]:shadow-[2px_2px_0px_#78716c] [&_button]:hover:translate-x-0.5 [&_button]:hover:translate-y-0.5"
          : ""
      }`}
    >
      {/* Inline Animation Style for Particles & Retro Buttons */}
      <style>{`
        @keyframes floatUpBubble {
          0% {
            transform: translateY(0px) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.7;
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

        ${
          hasCustomButtons
            ? `
          .retro-buttons-active button, 
          .retro-buttons-active [role="button"] {
            border: 1px solid #a8a29e !important;
            background-color: #1c1917 !important;
            color: #f5f5f4 !important;
            box-shadow: 2px 2px 0px #78716c !important;
            font-family: monospace !important;
            letter-spacing: 0.05em !important;
          }
          .retro-buttons-active button:hover:not(:disabled), 
          .retro-buttons-active [role="button"]:hover:not(:disabled) {
            background-color: #292524 !important;
            transform: translate(1px, 1px) !important;
            box-shadow: 1px 1px 0px #78716c !important;
          }
          .retro-buttons-active button:disabled {
            border-color: #57534e !important;
            background-color: #0c0a09 !important;
            color: #78716c !important;
            box-shadow: none !important;
            cursor: not-allowed !important;
          }
        `
            : ""
        }
      `}</style>

      {/* Bubble Effect Particle Layer */}
      {hasBubbles && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
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

      {/* Starry Night Particle Layer */}
      {hasStarryNight && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
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

      {/* Screen Shading / Vignette Overlay inside the Shop */}
      {hasVignette && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-950/60 to-stone-950 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" />
      )}

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Top Navigation & Balance Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-800 pb-4 mb-8 gap-4 text-xs">
          <button
            onClick={onBackToDashboard}
            className={`flex items-center gap-2 px-3.5 py-2 transition cursor-pointer ${
              hasCustomButtons
                ? "border border-stone-400 bg-stone-900 text-stone-200 shadow-[2px_2px_0px_#78716c]"
                : "text-stone-400 hover:text-stone-100 border border-stone-800 bg-stone-900/80 hover:bg-stone-800"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Return to Dashboard</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio Toggle Control if Background Audio Owned */}
            {hasBackgroundAudio && onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 text-stone-300 border border-stone-700 bg-stone-900 hover:bg-stone-800 cursor-pointer transition"
              >
                {isPlayingAudio ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-[11px]">LO-FI: PLAYING</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-stone-500" />
                    <span className="text-[11px]">LO-FI: PAUSED</span>
                  </>
                )}
              </button>
            )}

            {/* Rain Audio Toggle Control */}
            {hasRainAudio && onToggleRain && (
              <button
                onClick={onToggleRain}
                className="flex items-center gap-1.5 px-3 py-1.5 text-stone-300 border border-stone-700 bg-stone-900 hover:bg-stone-800 cursor-pointer transition"
              >
                {isPlayingRain ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[11px]">RAIN: PLAYING</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-stone-500" />
                    <span className="text-[11px]">RAIN: PAUSED</span>
                  </>
                )}
              </button>
            )}

            {/* Thunder Audio Toggle Control */}
            {hasThunderAudio && onToggleThunder && (
              <button
                onClick={onToggleThunder}
                className="flex items-center gap-1.5 px-3 py-1.5 text-stone-300 border border-stone-700 bg-stone-900 hover:bg-stone-800 cursor-pointer transition"
              >
                {isPlayingThunder ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                    <span className="text-[11px]">THUNDER: PLAYING</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-stone-500" />
                    <span className="text-[11px]">THUNDER: PAUSED</span>
                  </>
                )}
              </button>
            )}

            <div className="border border-stone-700 bg-stone-900 px-4 py-2 text-stone-100 font-bold flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>SAVINGS: ${savings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Header & Status Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 mb-1 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SYSTEM UPGRADE MARKETPLACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-100">
              POST-GAME LIFESTYLE STORE
            </h1>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed max-w-2xl">
              Equip high-tier interface themes, passive income generators, audio soundscapes, and
              casino multiplier perks.
            </p>
          </div>

          <div className="shrink-0 border border-stone-800 bg-stone-900/60 p-3 rounded-lg text-right font-mono">
            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              System Upgrades Owned
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {totalOwnedCount} / {shopItems.length} MODULES
            </div>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-stone-500 font-bold flex items-center gap-1 mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTER:
          </span>
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition cursor-pointer border ${
              activeFilter === "all"
                ? "border-amber-500/80 bg-amber-500/20 text-amber-300"
                : "border-stone-800 bg-stone-900/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            }`}
          >
            ALL ({shopItems.length})
          </button>
          <button
            onClick={() => setActiveFilter("visual")}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition cursor-pointer border ${
              activeFilter === "visual"
                ? "border-cyan-500/80 bg-cyan-500/20 text-cyan-300"
                : "border-stone-800 bg-stone-900/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            }`}
          >
            VISUAL &amp; FX ({shopItems.filter((i) => i.category === "visual").length})
          </button>
          <button
            onClick={() => setActiveFilter("audio")}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition cursor-pointer border ${
              activeFilter === "audio"
                ? "border-purple-500/80 bg-purple-500/20 text-purple-300"
                : "border-stone-800 bg-stone-900/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            }`}
          >
            AUDIO &amp; MUSIC ({shopItems.filter((i) => i.category === "audio").length})
          </button>
          <button
            onClick={() => setActiveFilter("perk")}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition cursor-pointer border ${
              activeFilter === "perk"
                ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-300"
                : "border-stone-800 bg-stone-900/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            }`}
          >
            FINANCIAL PERKS ({shopItems.filter((i) => i.category === "perk").length})
          </button>
        </div>

        {/* Modular Upgrades Vertical List */}
        <div className="space-y-3 mb-10">
          {filteredItems.map((item) => {
            const canAfford = savings >= item.cost;
            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4.5 border transition ${
                  item.owned
                    ? "border-emerald-800/70 bg-emerald-950/20 text-stone-200 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                    : "border-stone-800 bg-stone-950 hover:border-stone-700"
                }`}
              >
                <div className="mb-3 sm:mb-0 sm:pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-stone-500 text-[11px] font-bold">{item.code}</span>
                    <span className="font-bold text-sm text-stone-100">{item.title}</span>
                    <span className="text-xs text-stone-400">(${item.cost.toLocaleString()})</span>

                    <span
                      className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded border ${
                        item.category === "visual"
                          ? "border-cyan-800/60 bg-cyan-950/50 text-cyan-400"
                          : item.category === "audio"
                            ? "border-purple-800/60 bg-purple-950/50 text-purple-400"
                            : "border-emerald-800/60 bg-emerald-950/50 text-emerald-400"
                      }`}
                    >
                      {item.categoryLabel}
                    </span>

                    {item.owned && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-xl">{item.desc}</p>
                </div>

                <div className="shrink-0">
                  {item.owned ? (
                    item.id === "rain_audio" ||
                    item.id === "background_audio" ||
                    item.id === "thunder_audio" ? (
                      <button
                        onClick={item.onBuy}
                        className={`w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase border border-cyan-600 bg-cyan-950/70 text-cyan-200 hover:bg-cyan-900 cursor-pointer transition ${
                          hasCustomButtons ? "shadow-[2px_2px_0px_#0891b2]" : ""
                        }`}
                      >
                        {item.id === "rain_audio"
                          ? isPlayingRain
                            ? "🌧️ [ RAIN: PLAYING - PAUSE ]"
                            : "🌧️ [ RAIN: PAUSED - PLAY ]"
                          : item.id === "background_audio"
                            ? isPlayingAudio
                              ? "🎵 [ LO-FI: PLAYING - PAUSE ]"
                              : "🎵 [ LO-FI: PAUSED - PLAY ]"
                            : isPlayingThunder
                              ? "🌩️ [ THUNDER: PLAYING - PAUSE ]"
                              : "🌩️ [ THUNDER: PAUSED - PLAY ]"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className={`owned-badge w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase border border-emerald-800/70 bg-emerald-950/40 text-emerald-400/90 cursor-default ${
                          hasCustomButtons ? "shadow-[2px_2px_0px_#047857]" : ""
                        }`}
                      >
                        [ OWNED &amp; ACTIVE ]
                      </button>
                    )
                  ) : (
                    <button
                      onClick={item.onBuy}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase transition cursor-pointer border ${
                        hasCustomButtons
                          ? "border border-stone-400 bg-stone-900 text-stone-200 shadow-[2px_2px_0px_#78716c] hover:translate-x-0.5 hover:translate-y-0.5"
                          : canAfford
                            ? "border-amber-500/80 bg-stone-900 text-amber-200 hover:bg-amber-500 hover:text-stone-950"
                            : "border-stone-800 bg-stone-950 text-stone-600 cursor-not-allowed"
                      }`}
                    >
                      [ BUY - ${item.cost.toLocaleString()} ]
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean, Text-Based Casino Access Module */}
        <div className="border border-stone-800 bg-stone-900/30 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                EXTERNAL EXTENSION
              </div>
              <div className="text-sm font-bold text-stone-100 mt-0.5">
                DEGENERATE CASINO MODULE
              </div>
              <p className="mt-1 text-xs text-stone-400 max-w-xl">
                High-risk margin trading simulator. Incurred losses exceeding savings convert into
                active debt.
              </p>
            </div>

            <button
              onClick={onEnterCasino}
              className={`px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition cursor-pointer shrink-0 ${
                hasCustomButtons
                  ? "border border-stone-400 bg-stone-900 text-stone-100 shadow-[2px_2px_0px_#78716c] hover:translate-x-0.5 hover:translate-y-0.5"
                  : "border border-amber-500/80 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-300"
              }`}
            >
              [ ACCESS CASINO MODULE → ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
