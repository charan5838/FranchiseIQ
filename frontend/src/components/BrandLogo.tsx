import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  iconOnly = false
}) => {
  const iconSizes = {
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

  // Extraordinary bespoke mark: Isometric Quantum Nexus combining "F" & "Q" geometry,
  // ascending logarithmic financial vector, and neural franchise network nodes.
  const LogoIcon = (
    <div className={`relative ${iconSizes} shrink-0 flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_12px_rgba(16,185,129,0.35)]"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="fiq-hex-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="50%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="fiq-neon-beam" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          <linearGradient id="fiq-cyan-flow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          <radialGradient id="fiq-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#090D16" stopOpacity="0" />
          </radialGradient>

          <filter id="fiq-bloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="24" cy="24" r="20" fill="url(#fiq-core-glow)" />

        {/* Outer Isometric Faceted Shield */}
        <path
          d="M24 4L42 14.5V33.5L24 44L6 33.5V14.5L24 4Z"
          fill="#0B132B"
          stroke="#1E293B"
          strokeWidth="1.5"
        />

        {/* Internal Isometric Facet Highlights */}
        <path
          d="M24 4L42 14.5L24 25L6 14.5L24 4Z"
          fill="#0F172A"
          fillOpacity="0.8"
        />
        <path
          d="M24 25V44L6 33.5V14.5L24 25Z"
          fill="#022C22"
          fillOpacity="0.5"
        />
        <path
          d="M24 25L42 14.5V33.5L24 44V25Z"
          fill="#042F2E"
          fillOpacity="0.6"
        />

        {/* Isometric F-Nexus Ribbon (Emerald Vector) */}
        <path
          d="M16 32V16H32V21H22V24H29V29H22V32H16Z"
          fill="url(#fiq-neon-beam)"
          filter="url(#fiq-bloom)"
        />

        {/* Quantum "Q" Orbital Loop (Cyan Geometric Path) */}
        <path
          d="M24 13C30.0751 13 35 17.9249 35 24C35 27.2415 33.5956 30.1557 31.3536 32.1464L35.5 36.5L32 40L28.1464 36.1464C26.8557 36.6956 25.4615 37 24 37C17.9249 37 13 32.0751 13 26"
          stroke="url(#fiq-cyan-flow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex Ascending Vector Arrow (45° Financial Growth) */}
        <path
          d="M27 10L37 10L37 20"
          stroke="#34D399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 24L36 11"
          stroke="#34D399"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* High-Precision Intelligence Nodes */}
        <circle cx="24" cy="4" r="1.5" fill="#34D399" />
        <circle cx="42" cy="14.5" r="1.5" fill="#38BDF8" />
        <circle cx="6" cy="14.5" r="1.5" fill="#34D399" />
        <circle cx="24" cy="44" r="1.5" fill="#059669" />
        <circle cx="36" cy="11" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );

  if (iconOnly) {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {LogoIcon}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${textSizes} flex items-center`}>
          <span className="text-white font-extrabold tracking-tight">Franchise</span>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-black ml-0.5">
            IQ
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 shadow-[0_0_6px_#10b981]" />
        </div>
        {showTagline && (
          <span className="text-[8.5px] uppercase tracking-[0.22em] text-slate-400 font-semibold mt-0.5">
            Investment Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
