import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  // Size dimensions
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  // The custom geometric FranchiseIQ icon:
  // Combines interconnected network franchise nodes + upward growth vector + stylized 'F'/'IQ' geometry
  const Icon = (
    <div className={`relative ${iconDimensions} shrink-0 flex items-center justify-center`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="fiq-grad-primary" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id="fiq-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Outer subtle rounded container backdrop */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="10"
          className="fill-slate-900 stroke-slate-800"
          strokeWidth="1.5"
        />

        {/* Network lattice connection lines */}
        <line x1="12" y1="28" x2="20" y2="20" stroke="url(#fiq-grad-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <line x1="20" y1="20" x2="28" y2="12" stroke="url(#fiq-grad-accent)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="16" x2="20" y2="20" stroke="url(#fiq-grad-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="20" y1="20" x2="28" y2="24" stroke="url(#fiq-grad-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* Central Geometric 'F' + Upward Arrow Structure */}
        <path
          d="M12 12V28M12 12H24M12 20H20"
          stroke="url(#fiq-grad-primary)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upward Growth Arrow (Dynamic 45-degree angle) */}
        <path
          d="M22 12H28V18"
          stroke="url(#fiq-grad-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 23L28 12"
          stroke="url(#fiq-grad-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Intelligence / Network Nodes */}
        <circle cx="12" cy="12" r="2" className="fill-white" />
        <circle cx="12" cy="20" r="1.75" className="fill-blue-200" />
        <circle cx="12" cy="28" r="2" className="fill-sky-400" />
        <circle cx="28" cy="12" r="2.25" className="fill-emerald-400" />
      </svg>
    </div>
  );

  if (variant === 'compact') {
    return <div className={`inline-flex items-center ${className}`}>{Icon}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {Icon}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${textSizes} flex items-center`}>
          <span className="text-white font-extrabold tracking-tight">Franchise</span>
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-black ml-0.5">
            IQ
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
            Investment Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
