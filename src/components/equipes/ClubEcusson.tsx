import React from 'react';
import {
  Shield,
  Award,
  Flame,
  Zap,
  Star,
  Trophy,
  Crown,
  Activity,
  Target,
  Compass,
} from 'lucide-react';

export interface PresetEcusson {
  id: string;
  nom: string;
  description: string;
  forme: 'bouclier' | 'rond' | 'hexagone' | 'losange' | 'ecu';
  icone: React.ComponentType<{ className?: string }>;
}

export const LISTE_ECUSSONS_PRESETS: PresetEcusson[] = [
  {
    id: 'bouclier_etoile',
    nom: 'Bouclier des Champions',
    description: 'Bouclier traditionnel orné d’une étoile dorée',
    forme: 'bouclier',
    icone: Star,
  },
  {
    id: 'blason_eclair',
    nom: 'Écu Foudre & Vitesse',
    description: 'Blason dynamique avec éclair d’énergie',
    forme: 'ecu',
    icone: Zap,
  },
  {
    id: 'couronne_flamme',
    nom: 'Flamme Olympique & Couronne',
    description: 'Flamme éternelle symbolisant la passion athlétique',
    forme: 'rond',
    icone: Flame,
  },
  {
    id: 'rond_ballon',
    nom: 'Blason Club Omnisport',
    description: 'Rond de compétition avec lauriers et trophée',
    forme: 'rond',
    icone: Trophy,
  },
  {
    id: 'aigle_victoire',
    nom: 'Insigne Royauté & Gloire',
    description: 'Couronne royale des vainqueurs',
    forme: 'bouclier',
    icone: Crown,
  },
  {
    id: 'hexagone_dynamique',
    nom: 'Hexagone Haute Performance',
    description: 'Structure moderne géométrique orientée data',
    forme: 'hexagone',
    icone: Activity,
  },
  {
    id: 'losange_vitesse',
    nom: 'Losange Performance',
    description: 'Écusson élancé orienté vitesse et aérodynamisme',
    forme: 'losange',
    icone: Award,
  },
  {
    id: 'bouclier_cible',
    nom: 'Cible & Rigueur Tactique',
    description: 'Blason de précision et focalisation',
    forme: 'bouclier',
    icone: Target,
  },
  {
    id: 'boussole_cap',
    nom: 'Boussole des Sommets',
    description: 'Direction vers les objectifs de la saison',
    forme: 'rond',
    icone: Compass,
  },
  {
    id: 'bouclier_gardien',
    nom: 'Bouclier de Défense',
    description: 'Forteresse défensive et solidité de groupe',
    forme: 'ecu',
    icone: Shield,
  },
];

interface ClubEcussonProps {
  presetId?: string;
  logoUrl?: string;
  logoZoom?: number;
  couleur?: string;
  couleurSecondaire?: string;
  taille?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  nomClub?: string;
  className?: string;
}

export const ClubEcusson: React.FC<ClubEcussonProps> = ({
  presetId = 'bouclier_etoile',
  logoUrl,
  logoZoom = 100,
  couleur = '#10b981',
  couleurSecondaire = '#34d399',
  taille = 'md',
  nomClub = 'Club',
  className = '',
}) => {
  // Dimensions par taille
  const dimensions = {
    xs: { conteneur: 'h-6 w-6 text-xs', icone: 'h-3.5 w-3.5', svgSize: 24 },
    sm: { conteneur: 'h-8 w-8 text-xs', icone: 'h-4 w-4', svgSize: 32 },
    md: { conteneur: 'h-11 w-11 text-sm', icone: 'h-5 w-5', svgSize: 44 },
    lg: { conteneur: 'h-16 w-16 text-base', icone: 'h-8 w-8', svgSize: 64 },
    xl: { conteneur: 'h-24 w-24 text-xl', icone: 'h-12 w-12', svgSize: 96 },
  }[taille];

  // Si une image / URL de logo personnalisée est fournie
  if (logoUrl) {
    const scaleFactor = Math.max(0.4, Math.min(2.5, (logoZoom || 100) / 100));

    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-full aspect-square overflow-hidden border-2 shadow-lg bg-neutral-950 ${dimensions.conteneur} ${className}`}
        style={{
          borderColor: couleur,
          boxShadow: `0 0 16px ${couleur}35`,
        }}
        title={nomClub}
      >
        <img
          src={logoUrl}
          alt={nomClub}
          className="h-full w-full object-cover rounded-full transition-transform duration-200"
          style={{
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'center center',
          }}
          onError={(e) => {
            // Fallback si l'image ne charge pas
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Écusson vectoriel stylisé en macaron circulaire (rond officiel)
  const preset =
    LISTE_ECUSSONS_PRESETS.find((p) => p.id === presetId) || LISTE_ECUSSONS_PRESETS[0];
  const IconeComponent = preset.icone;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-full aspect-square border-2 shadow-lg overflow-hidden transition-transform ${dimensions.conteneur} ${className}`}
      style={{
        borderColor: couleur,
        boxShadow: `0 0 16px ${couleur}30`,
        background: `radial-gradient(circle at 35% 35%, #27272a 0%, #18181b 50%, #09090b 100%)`,
      }}
      title={`${nomClub} - ${preset.nom}`}
    >
      {/* Anneau interne subtil aux couleurs du club */}
      <div
        className="absolute inset-0.5 rounded-full border opacity-50 pointer-events-none"
        style={{ borderColor: couleurSecondaire || couleur }}
      />

      {/* Icône emblème au centre */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ color: couleur }}
      >
        <IconeComponent className={dimensions.icone} />
      </div>
    </div>
  );
};
