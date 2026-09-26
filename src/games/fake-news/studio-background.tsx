export function StudioBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Warm rich mahogany / dark oak wood grain desk surface */}
      <div className="absolute inset-0 bg-[#160d08] bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,#382013_0%,#20120a_45%,#0d0704_100%)]" />

      {/* Horizontal wood plank grain textures */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 58px,
            rgba(0, 0, 0, 0.4) 59px,
            rgba(255, 220, 180, 0.05) 60px
          )`,
        }}
      />

      {/* Warm overhead vintage brass desk lamp light glow */}
      <div className="absolute left-1/2 -top-20 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.18)_0%,rgba(245,158,11,0.08)_40%,transparent_75%)] blur-2xl" />

      {/* Secondary cozy amber glow from side lamp */}
      <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-orange-700/10 blur-3xl" />

      {/* Desk Details & Props */}
      {/* 1. Coffee Mug Ring Watermark (top right desk area) */}
      <div className="absolute right-8 top-16 hidden sm:block opacity-25 pointer-events-none">
        <div className="h-20 w-20 rounded-full border-4 border-amber-900/60 shadow-[inset_0_0_8px_rgba(120,53,15,0.4)] rotate-12" />
        <div className="h-16 w-16 -mt-18 ml-2 rounded-full border-2 border-amber-950/40" />
      </div>

      {/* 2. Yellow Sticky Note on Desk Edge */}
      <div className="absolute left-6 bottom-16 hidden md:block opacity-70 rotate-[-4deg]">
        <div className="w-32 bg-amber-200/90 text-stone-900 p-2.5 rounded-sm shadow-md border-t-4 border-amber-300 font-mono text-[10px] leading-tight">
          <p className="font-bold text-amber-950 mb-1">📌 EDITORIAL NOTE:</p>
          <p className="text-stone-800">"Facts don't pay rent. Sensational headlines do."</p>
        </div>
      </div>

      {/* 3. Pink Sticky Note on Top Left */}
      <div className="absolute left-10 top-20 hidden lg:block opacity-65 rotate-[6deg]">
        <div className="w-28 bg-rose-200/90 text-stone-900 p-2 rounded-sm shadow-md border-t-4 border-rose-300 font-mono text-[9px]">
          <p className="font-bold text-rose-950">⚡ RULE #1:</p>
          <p className="text-stone-800">Avoid 100% Lawsuit Risk!</p>
        </div>
      </div>

      {/* Warm vignette around the desk */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_45%,rgba(5,3,2,0.75)_100%)]" />
    </div>
  );
}
