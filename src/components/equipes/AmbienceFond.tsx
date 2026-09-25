import React from 'react';
import { StyleFondEquipe } from '../../types';

interface AmbienceFondProps {
  couleur?: string;
  couleurSecondaire?: string;
  couleurFond?: string;
  styleFond?: StyleFondEquipe;
  className?: string;
  children?: React.ReactNode;
}

export const getAmbienceStyle = (
  couleur = '#10b981',
  couleurSecondaire = '#34d399',
  couleurFond = '#0c0f14',
  styleFond: StyleFondEquipe = 'stade'
): React.CSSProperties => {
  switch (styleFond) {
    case 'stade':
      return {
        backgroundColor: couleurFond,
        backgroundImage: `
          radial-gradient(circle at 50% -20%, ${couleur}33 0%, transparent 65%),
          radial-gradient(circle at 100% 100%, ${couleurSecondaire}20 0%, transparent 50%),
          linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)
        `,
      };
    case 'terrain':
      return {
        backgroundColor: couleurFond,
        backgroundImage: `
          radial-gradient(circle at 50% 0%, ${couleur}28 0%, transparent 70%),
          linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 36px 36px, 36px 36px',
      };
    case 'degrade':
      return {
        backgroundColor: couleurFond,
        backgroundImage: `
          linear-gradient(135deg, ${couleur}2f 0%, ${couleurFond} 45%, ${couleurSecondaire}25 100%)
        `,
      };
    case 'mesh':
      return {
        backgroundColor: couleurFond,
        backgroundImage: `
          radial-gradient(${couleur}40 1.5px, transparent 1.5px),
          linear-gradient(180deg, ${couleurFond} 0%, rgba(10,10,12,0.95) 100%)
        `,
        backgroundSize: '18px 18px, 100% 100%',
      };
    case 'carbone':
      return {
        backgroundColor: couleurFond,
        backgroundImage: `
          linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)
        `,
        backgroundSize: '16px 16px',
      };
    case 'uni':
    default:
      return {
        backgroundColor: couleurFond,
        backgroundImage: `linear-gradient(180deg, ${couleur}12 0%, transparent 100%)`,
      };
  }
};

export const AmbienceFond: React.FC<AmbienceFondProps> = ({
  couleur = '#10b981',
  couleurSecondaire = '#34d399',
  couleurFond = '#0c0f14',
  styleFond = 'stade',
  className = '',
  children,
}) => {
  const style = getAmbienceStyle(couleur, couleurSecondaire, couleurFond, styleFond);

  return (
    <div className={`relative overflow-hidden transition-all duration-500 ${className}`} style={style}>
      {children}
    </div>
  );
};
