export function AnchorAvatar({ talking = false }: { talking?: boolean }) {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 220 240"
        className="h-56 w-52 drop-shadow-[0_12px_30px_rgba(56,189,248,0.35)] sm:h-64 sm:w-60"
        role="img"
        aria-label="Friendly AI news anchor"
      >
        {/* Desk */}
        <defs>
          <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a5f3fc" />
            <stop offset="1" stopColor="#67e8f9" />
          </linearGradient>
        </defs>

        {/* Suit / shoulders */}
        <path d="M40 240 C40 190 80 172 110 172 C140 172 180 190 180 240 Z" fill="#4f46e5" />
        <path d="M110 172 L96 210 L110 224 L124 210 Z" fill="#e0e7ff" />
        <path d="M110 172 L102 200 L110 208 L118 200 Z" fill="#6366f1" />

        {/* Neck */}
        <rect x="98" y="150" width="24" height="30" rx="10" fill="#22d3ee" />

        {/* Head */}
        <rect x="66" y="66" width="88" height="94" rx="34" fill="url(#skinGrad)" />
        {/* Headset / antenna */}
        <rect x="60" y="96" width="10" height="34" rx="5" fill="#818cf8" />
        <rect x="150" y="96" width="10" height="34" rx="5" fill="#818cf8" />
        <line
          x1="110"
          y1="66"
          x2="110"
          y2="48"
          stroke="#818cf8"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="110" cy="44" r="7" fill="#f472b6">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />
        </circle>

        {/* Eyes */}
        <circle cx="92" cy="108" r="9" fill="#0f172a" />
        <circle cx="128" cy="108" r="9" fill="#0f172a" />
        <circle cx="94" cy="105" r="3" fill="#fff" />
        <circle cx="130" cy="105" r="3" fill="#fff" />

        {/* Cheeks */}
        <circle cx="80" cy="126" r="6" fill="#f9a8d4" opacity="0.7" />
        <circle cx="140" cy="126" r="6" fill="#f9a8d4" opacity="0.7" />

        {/* Mouth */}
        {talking ? (
          <ellipse cx="110" cy="134" rx="12" ry="9" fill="#0f172a">
            <animate attributeName="ry" values="9;3;9" dur="0.32s" repeatCount="indefinite" />
          </ellipse>
        ) : (
          <path
            d="M96 132 Q110 144 124 132"
            stroke="#0f172a"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
