import React from 'react';

interface DZLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const DZLogo: React.FC<DZLogoProps> = ({ size = 'md', showText = true }) => {
  const dim = size === 'sm' ? 38 : size === 'lg' ? 56 : 46;

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* 
        All-Purple / Violet Emblem with Radical √dz in muted, soft non-glaring white:
        "كله بنفسجي، وفيه كتابة بالأبيض ولكنه أبيض خافت... وضع dz فوقها جذر"
      */}
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 border border-purple-500/40 shadow-md shadow-purple-950/20 overflow-hidden shrink-0 group transition"
        style={{ width: `${dim}px`, height: `${dim}px` }}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial from-purple-500/15 via-transparent to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1 relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle decorative inner purple ring */}
          <rect
            x="8"
            y="8"
            width="84"
            height="84"
            rx="14"
            stroke="#9333ea"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeDasharray="4 3"
          />

          {/* Faint academic book / horizon curve in soft lavender */}
          <path
            d="M22 76 C35 70, 48 74, 50 78 C52 74, 65 70, 78 76"
            stroke="#c084fc"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />

          {/* 
            The Radical (Square Root) Symbol with horizontal bar extending over "dz":
            M18,52 L26,52 L35,76 L48,28 L84,28
          */}
          <path
            d="M18 52 L25 52 L34 76 L48 27 L85 27"
            stroke="#EDE9FE"
            strokeOpacity="0.88"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 
            "dz" sitting right underneath the radical bar:
            Rendered in soft, muted white (not glaring, soft lavender-white)
          */}
          <text
            x="64"
            y="57"
            fontSize="26"
            fontWeight="900"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            fill="#EDE9FE"
            fillOpacity="0.88"
            textAnchor="middle"
            letterSpacing="-1"
          >
            dz
          </text>

          {/* Subtle tiny star dot in soft muted white */}
          <circle cx="83" cy="27" r="1.5" fill="#EDE9FE" fillOpacity="0.9" />
        </svg>

        {/* Small corner tag with √dz */}
        <span className="absolute bottom-0 right-0 text-[7px] font-bold text-purple-200/70 bg-purple-950/80 px-1 py-0.2 rounded-tl border-t border-l border-purple-500/30">
          √dz
        </span>
      </div>

      {/* Brand Text: "نجاحي dz" */}
      {showText && (
        <div className="text-right">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              نجاحي dz
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5 hidden sm:block">
            منصة التفوق والامتياز المدرسي
          </p>
        </div>
      )}
    </div>
  );
};
