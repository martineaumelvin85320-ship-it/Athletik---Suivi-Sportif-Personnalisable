import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  titre?: string;
  texte: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icone?: 'info' | 'help';
  tailleIcone?: number;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  titre,
  texte,
  children,
  position = 'top',
  icone = 'help',
  tailleIcone = 14,
  className = '',
}) => {
  const [estVisible, setEstVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getFlecheClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-800 border-x-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-neutral-800 border-y-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-neutral-800 border-y-transparent border-l-transparent';
      case 'top':
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-neutral-800 border-x-transparent border-b-transparent';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center group cursor-help ${className}`}
      onMouseEnter={() => setEstVisible(true)}
      onMouseLeave={() => setEstVisible(false)}
      onFocus={() => setEstVisible(true)}
      onBlur={() => setEstVisible(false)}
    >
      {children ? (
        children
      ) : (
        <span className="text-neutral-400 hover:text-emerald-400 transition-colors p-0.5 rounded-full inline-flex items-center justify-center">
          {icone === 'info' ? (
            <Info className="shrink-0" style={{ width: tailleIcone, height: tailleIcone }} />
          ) : (
            <HelpCircle className="shrink-0" style={{ width: tailleIcone, height: tailleIcone }} />
          )}
        </span>
      )}

      {estVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 p-3 rounded-2xl bg-neutral-900/98 border border-neutral-700/80 shadow-2xl backdrop-blur-xl text-neutral-100 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95 ${getPositionClasses()}`}
        >
          {titre && (
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-emerald-400">
              <Info className="h-3 w-3 stroke-[2.5]" />
              <span>{titre}</span>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-neutral-300 font-normal">
            {texte}
          </p>
          <div
            className={`absolute w-0 h-0 border-4 ${getFlecheClasses()}`}
          />
        </div>
      )}
    </div>
  );
};
