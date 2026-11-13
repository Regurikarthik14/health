import React from 'react';

interface UrCureLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UrCureLogo: React.FC<UrCureLogoProps> = ({
  size = 'md',
  showTagline = true,
  showIcon = true,
  className = '',
  onClick
}) => {
  // Size variations
  const config = {
    sm: {
      text: 'text-sm',
      cradlePadding: 'px-1.5 pb-0.5 pt-0',
      borderWidth: 'border-l-[2px] border-r-[2px] border-b-[2px]',
      rounded: 'rounded-b-[8px]',
      dot: 'w-1 h-1',
      iconBox: 'w-7 h-7',
      iconInner: 'w-3 h-3',
      tagline: 'text-[8px]'
    },
    md: {
      text: 'text-lg',
      cradlePadding: 'px-2 pb-1 pt-0.5',
      borderWidth: 'border-l-[2.5px] border-r-[2.5px] border-b-[2.5px]',
      rounded: 'rounded-b-[10px]',
      dot: 'w-1.5 h-1.5',
      iconBox: 'w-9 h-9',
      iconInner: 'w-4 h-4',
      tagline: 'text-[10px]'
    },
    lg: {
      text: 'text-2xl',
      cradlePadding: 'px-2.5 pb-1.5 pt-1',
      borderWidth: 'border-l-[3px] border-r-[3px] border-b-[3px]',
      rounded: 'rounded-b-[14px]',
      dot: 'w-2 h-2',
      iconBox: 'w-11 h-11',
      iconInner: 'w-5 h-5',
      tagline: 'text-xs'
    },
    xl: {
      text: 'text-4xl',
      cradlePadding: 'px-3.5 pb-2 pt-1.5',
      borderWidth: 'border-l-[4px] border-r-[4px] border-b-[4px]',
      rounded: 'rounded-b-[18px]',
      dot: 'w-2.5 h-2.5',
      iconBox: 'w-14 h-14',
      iconInner: 'w-6 h-6',
      tagline: 'text-sm'
    }
  }[size];

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center space-x-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Optional Obsidian Orb / Titanium Brand Icon */}
      {showIcon && (
        <div className={`relative flex items-center justify-center ${config.iconBox} rounded-xl bg-[#111111] border border-[#2a2a2a] group-hover:border-white/50 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300`}>
          <div className={`${config.iconInner} rounded-full border border-white/40 flex items-center justify-center`}>
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]"></div>
          </div>
        </div>
      )}

      {/* Stylized Wordmark: 'rcure' nested inside 'u' */}
      <div className="flex flex-col text-left">
        <div className="flex items-center">
          
          {/* 
            The letter 'u' encloses 'rcure':
            - The left border starts before 'r' as the left arm of 'u'
            - The bottom border curves underneath 'rcure' as the base of 'u'
            - The right border rises after 'e' as the right arm of 'u'
          */}
          <span 
            className={`relative inline-flex items-center ${config.cradlePadding} ${config.borderWidth} border-white ${config.rounded} shadow-[0_0_10px_rgba(255,255,255,0.12)] transition-all duration-200 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]`}
            title="urCure"
          >
            {/* Left stem top terminal tip */}
            <span className="absolute -top-[2px] -left-[1.5px] w-[2.5px] h-[2.5px] rounded-full bg-white shadow-[0_0_4px_#fff]" />
            
            {/* Inner text: 'rcure' / 'rCure' */}
            <span className={`${config.text} font-bold tracking-tight text-[#E5E5E5] leading-none`}>
              r<span className="text-white font-black">Cure</span>
            </span>

            {/* Right stem top terminal tip */}
            <span className="absolute -top-[2px] -right-[1.5px] w-[2.5px] h-[2.5px] rounded-full bg-white shadow-[0_0_4px_#fff]" />
          </span>

          {/* Accent dot */}
          <span className={`inline-block ${config.dot} rounded-full bg-white ml-1.5 shadow-[0_0_8px_#ffffff]`} />
        </div>

        {/* Optional Subtitle Tagline */}
        {showTagline && (
          <p className={`${config.tagline} tracking-wider uppercase text-[#777777] font-mono mt-0.5 hidden sm:block`}>
            Your Health. Your Choice. Your Care.
          </p>
        )}
      </div>
    </div>
  );
};

