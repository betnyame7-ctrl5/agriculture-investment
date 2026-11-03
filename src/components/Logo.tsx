import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'light' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Handcrafted Plant & Tree Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-xl bg-gradient-to-br from-emerald-800 to-green-950 p-1.5 shadow-md border border-amber-400/30 flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
          {/* Golden Sun Accent */}
          <circle cx="12" cy="7" r="3" fill="#f59e0b" fillOpacity="0.8" />
          {/* Tree Trunk & Roots */}
          <path
            d="M12 21V13M12 21C10 21 8.5 22 7 22M12 21C14 21 15.5 22 17 22"
            stroke="#fbbf24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Lush Canopy Branches & Leaves */}
          <path
            d="M12 13C10 11.5 7 11 5 13C4 10 6 7 9 7C9.5 5 11.5 4 13.5 4.5C15.5 5 17 6.5 17 8.5C19 9 20 11 19 13C17 11.5 14 11.5 12 13Z"
            fill="#10b981"
            fillOpacity="0.85"
            stroke="#34d399"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Sprouting Growth Leaf */}
          <path
            d="M12 13C14 11 16 11 16 9"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span className={`${textSizes[size]} font-serif ${isLight ? 'text-amber-400' : 'text-emerald-950'} uppercase tracking-wide`}>
          AGRICULTURE <span className={isLight ? 'text-white' : 'text-emerald-800'}>INVESTMENT</span>
        </span>
        <span className={`text-[10px] uppercase tracking-widest font-medium ${isLight ? 'text-emerald-200/80' : 'text-emerald-700'}`}>
          Sustainable Livestock Agro-Hub
        </span>
      </div>
    </div>
  );
};

export default Logo;
