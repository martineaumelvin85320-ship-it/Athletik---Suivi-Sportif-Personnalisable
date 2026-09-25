import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Users2,
  Sparkles,
  Upload,
  Image,
  Palette,
  Shield,
  Layout,
  MapPin,
  Quote,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Equipe, StyleFondEquipe } from '../../types';
import { ClubEcusson, LISTE_ECUSSONS_PRESETS } from './ClubEcusson';
import { getAmbienceStyle } from './AmbienceFond';

interface EquipeModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surSauvegarder: (eq: Omit<Equipe, 'id' | 'dateCreation'>) => void;
  equipeEnEdition?: Equipe | null;
}

const PALETTES_CLUBS_SUGGEREES = [
  {
    nom: 'Émeraude & Vert Stade',
    primaire: '#10b981',
    secondaire: '#34d399',
    fond: '#051b11',
    style: 'terrain' as StyleFondEquipe,
  },
  {
    nom: 'Bleu Royal & Cyan Nuit',
    primaire: '#3b82f6',
    secondaire: '#60a5fa',
    fond: '#08152b',
    style: 'stade' as StyleFondEquipe,
  },
  {
    nom: 'Or Athlétique & Ambre',
    primaire: '#f59e0b',
    secondaire: '#fbbf24',
    fond: '#1c1205',
    style: 'mesh' as StyleFondEquipe,
  },
  {
    nom: 'Rouge Sang & Passion',
    primaire: '#ef4444',
    secondaire: '#f87171',
    fond: '#1c080b',
    style: 'degrade' as StyleFondEquipe,
  },
  {
    nom: 'Violet Élite & Majesté',
    primaire: '#8b5cf6',
    secondaire: '#a78bfa',
    fond: '#140a24',
    style: 'stade' as StyleFondEquipe,
  },
  {
    nom: 'Cyan Vitesse & Ice',
    primaire: '#06b6d4',
    secondaire: '#22d3ee',
    fond: '#071821',
    style: 'mesh' as StyleFondEquipe,
  },
  {
    nom: 'Carbone Noir & Minimal',
    primaire: '#e4e4e7',
    secondaire: '#a1a1aa',
    fond: '#121215',
    style: 'carbone' as StyleFondEquipe,
  },
];

const STYLES_FOND: { id: StyleFondEquipe; label: string; desc: string }[] = [
  { id: 'stade', label: 'Stade & Projecteurs', desc: 'Halo lumineux radial de stade nocturne' },
  { id: 'terrain', label: 'Lignes de Terrain', desc: 'Quadrillage technique de pelouse' },
  { id: 'degrade', label: 'Dégradé Club', desc: 'Dégradé dynamique aux couleurs de l’équipe' },
  { id: 'mesh', label: 'Mesh Technique', desc: 'Matrice de points athlétique' },
  { id: 'carbone', label: 'Fibre de Carbone', desc: 'Tissage haute performance' },
  { id: 'uni', label: 'Uni Épuré', desc: 'Fond sombre sobre et minimaliste' },
];

export const EquipeModal: React.FC<EquipeModalProps> = ({
  ouvert,
  surFermer,
  surSauvegarder,
  equipeEnEdition,
}) => {
  const [ongletActif, setOngletActif] = useState<'general' | 'ecusson' | 'ambiance'>('general');

  // Champs d'équipe
  const [nom, setNom] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [description, setDescription] = useState('');
  const [deviseOuSlogan, setDeviseOuSlogan] = useState('');
  const [lieuOuStade, setLieuOuStade] = useState('');

  // Identité visuelle
  const [logoUrl, setLogoUrl] = useState('');
  const [logoZoom, setLogoZoom] = useState<number>(100);
  const [ecussonPreset, setEcussonPreset] = useState('bouclier_etoile');
  const [couleur, setCouleur] = useState('#10b981');
  const [couleurSecondaire, setCouleurSecondaire] = useState('#34d399');
  const [couleurFond, setCouleurFond] = useState('#051b11');
  const [styleFond, setStyleFond] = useState<StyleFondEquipe>('terrain');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (equipeEnEdition) {
      setNom(equipeEnEdition.nom);
      setDiscipline(equipeEnEdition.discipline);
      setDescription(equipeEnEdition.description || '');
      setDeviseOuSlogan(equipeEnEdition.deviseOuSlogan || '');
      setLieuOuStade(equipeEnEdition.lieuOuStade || '');
      setLogoUrl(equipeEnEdition.logoUrl || '');
      setLogoZoom(equipeEnEdition.logoZoom || 100);
      setEcussonPreset(equipeEnEdition.ecussonPreset || 'bouclier_etoile');
      setCouleur(equipeEnEdition.couleur || '#10b981');
      setCouleurSecondaire(equipeEnEdition.couleurSecondaire || '#34d399');
      setCouleurFond(equipeEnEdition.couleurFond || '#051b11');
      setStyleFond(equipeEnEdition.styleFond || 'terrain');
    } else {
      setNom('');
      setDiscipline('Football');
      setDescription('');
      setDeviseOuSlogan('Excellence, Rigueur & Dépassement');
      setLieuOuStade('Complexe Sportif');
      setLogoUrl('');
      setLogoZoom(100);
      setEcussonPreset('bouclier_etoile');
      setCouleur('#10b981');
      setCouleurSecondaire('#34d399');
      setCouleurFond('#051b11');
      setStyleFond('terrain');
    }
  }, [equipeEnEdition, ouvert]);

  if (!ouvert) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAppliquerPalette = (palette: typeof PALETTES_CLUBS_SUGGEREES[0]) => {
    setCouleur(palette.primaire);
    setCouleurSecondaire(palette.secondaire);
    setCouleurFond(palette.fond);
    setStyleFond(palette.style);
  };

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    surSauvegarder({
      nom: nom.trim(),
      discipline: discipline.trim() || 'Multisport',
      description: description.trim(),
      couleur,
      couleurSecondaire,
      couleurFond,
      styleFond,
      logoUrl: logoUrl.trim() || undefined,
      logoZoom: logoZoom || 100,
      ecussonPreset,
      deviseOuSlogan: deviseOuSlogan.trim() || undefined,
      lieuOuStade: lieuOuStade.trim() || undefined,
    });
    surFermer();
  };

  const previewStyle = getAmbienceStyle(couleur, couleurSecondaire, couleurFond, styleFond);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <ClubEcusson
              presetId={ecussonPreset}
              logoUrl={logoUrl}
              logoZoom={logoZoom}
              couleur={couleur}
              couleurSecondaire={couleurSecondaire}
              taille="md"
              nomClub={nom || 'Club'}
            />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{equipeEnEdition ? 'Personnaliser l’ambiance d’équipe' : 'Créer une équipe & son ambiance club'}</span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Logo, Blason & Ambiance
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Créez une identité forte : blason, logo, couleurs et décor de fond de stade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={surFermer}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Onglets de navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-neutral-800 bg-neutral-950/50">
          <button
            type="button"
            onClick={() => setOngletActif('general')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              ongletActif === 'general'
                ? 'border-emerald-500 text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users2 className="h-3.5 w-3.5" />
            <span>1. Infos Club</span>
          </button>

          <button
            type="button"
            onClick={() => setOngletActif('ecusson')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              ongletActif === 'ecusson'
                ? 'border-emerald-500 text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>2. Écusson & Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setOngletActif('ambiance')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              ongletActif === 'ambiance'
                ? 'border-emerald-500 text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>3. Ambiance & Fond de Stade</span>
          </button>
        </div>

        {/* Corps formulaire */}
        <form id="form-equipe" onSubmit={handleSoumettre} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* APERÇU IMMERSIF DU CLUB EN HAUT */}
          <div
            className="rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden shadow-xl"
            style={{
              ...previewStyle,
              borderColor: `${couleur}40`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <ClubEcusson
                  presetId={ecussonPreset}
                  logoUrl={logoUrl}
                  logoZoom={logoZoom}
                  couleur={couleur}
                  couleurSecondaire={couleurSecondaire}
                  taille="lg"
                  nomClub={nom || 'Mon Club'}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${couleur}20`,
                        color: couleurSecondaire || couleur,
                        border: `1px solid ${couleur}40`,
                      }}
                    >
                      {discipline || 'Sport'}
                    </span>
                    {lieuOuStade && (
                      <span className="text-[11px] text-neutral-300 flex items-center gap-1 opacity-80">
                        <MapPin className="h-3 w-3" /> {lieuOuStade}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mt-1">
                    {nom || 'Nom du Club / Équipe'}
                  </h3>
                  {deviseOuSlogan && (
                    <p className="text-xs text-neutral-300 italic flex items-center gap-1.5 mt-0.5 opacity-90">
                      <Quote className="h-3 w-3 shrink-0 text-emerald-400" />
                      « {deviseOuSlogan} »
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:self-center">
                {logoUrl && (
                  <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 text-xs backdrop-blur-sm">
                    <span className="text-neutral-400 text-[11px]">Taille logo :</span>
                    <button
                      type="button"
                      onClick={() => setLogoZoom((z) => Math.max(40, z - 10))}
                      className="h-5 w-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center text-xs"
                      title="Réduire"
                    >
                      -
                    </button>
                    <span className="font-mono text-[11px] text-emerald-400 px-1 font-semibold">
                      {logoZoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoZoom((z) => Math.min(220, z + 10))}
                      className="h-5 w-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center text-xs"
                      title="Agrandir"
                    >
                      +
                    </button>
                  </div>
                )}
                <span className="text-[11px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                  Ambiance : {STYLES_FOND.find((s) => s.id === styleFond)?.label}
                </span>
              </div>
            </div>
          </div>

          {/* ONGLET 1 : INFORMATIONS GENERALES */}
          {ongletActif === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nom du club ou de l'équipe *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex : FC Performance, Groupe Pro, U21..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Discipline / Sport
                  </label>
                  <input
                    type="text"
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    placeholder="Ex : Football, Rugby, Basket, Athlétisme..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                    <Quote className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Devise / Slogan du club</span>
                  </label>
                  <input
                    type="text"
                    value={deviseOuSlogan}
                    onChange={(e) => setDeviseOuSlogan(e.target.value)}
                    placeholder="Ex : Plus haut, plus vite, ensemble..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Stade ou Centre d'entraînement</span>
                  </label>
                  <input
                    type="text"
                    value={lieuOuStade}
                    onChange={(e) => setLieuOuStade(e.target.value)}
                    placeholder="Ex : Stade de la Plaine, Complexe Olympique..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Description / Objectifs du groupe
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectifs de saison, effectif ciblé, créneaux de séances..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ONGLET 2 : ECUSSON ET LOGO */}
          {ongletActif === 'ecusson' && (
            <div className="space-y-5">
              {/* Choix 1 : Logo personnalisé uploadé ou URL */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-emerald-400" />
                    <span>Option 1 : Téléverser le vrai logo du club</span>
                  </span>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Supprimer le logo et revenir à l’écusson
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/90 py-3 text-xs font-semibold text-neutral-300 hover:border-emerald-500 hover:text-white transition-all"
                    >
                      <Image className="h-4 w-4 text-emerald-400" />
                      <span>{logoUrl ? 'Changer l’image de logo' : 'Sélectionner une image (PNG / SVG / JPG)'}</span>
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Ou collez l'URL d'un logo web..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {logoUrl && (
                  <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Redimensionner le logo :</span>
                        <span className="font-mono text-emerald-400 font-semibold">{logoZoom}%</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setLogoZoom(100)}
                        className="text-[11px] text-neutral-400 hover:text-white"
                      >
                        Réinitialiser (100%)
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setLogoZoom((z) => Math.max(40, z - 10))}
                        className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="40"
                        max="220"
                        step="5"
                        value={logoZoom}
                        onChange={(e) => setLogoZoom(Number(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-neutral-700 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoZoom((z) => Math.min(220, z + 10))}
                        className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Choix 2 : Écussons et Blasons vectoriels */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span>Option 2 : Choisir un écusson de club stylisé</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {LISTE_ECUSSONS_PRESETS.length} blasons disponibles
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {LISTE_ECUSSONS_PRESETS.map((item) => {
                    const actif = ecussonPreset === item.id && !logoUrl;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setEcussonPreset(item.id);
                          setLogoUrl(''); // Désactive le logo image si on choisit un blason
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          actif
                            ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40 shadow-sm'
                            : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/80'
                        }`}
                      >
                        <ClubEcusson
                          presetId={item.id}
                          couleur={couleur}
                          couleurSecondaire={couleurSecondaire}
                          taille="sm"
                          nomClub={item.nom}
                        />
                        <span className="text-[10px] font-bold text-white mt-2 text-center line-clamp-1">
                          {item.nom}
                        </span>
                        <span className="text-[9px] text-neutral-400 capitalize">
                          {item.forme}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3 : AMBIANCE, FOND & COULEURS */}
          {ongletActif === 'ambiance' && (
            <div className="space-y-6">
              {/* Palettes rapides */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Palette className="h-4 w-4 text-emerald-400" />
                  <span>Palettes de club prêtes à l'emploi</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PALETTES_CLUBS_SUGGEREES.map((pal) => (
                    <button
                      key={pal.nom}
                      type="button"
                      onClick={() => handleAppliquerPalette(pal)}
                      className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="h-4 w-4 rounded-full border border-black/30 shadow-sm shrink-0"
                          style={{ backgroundColor: pal.primaire }}
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-black/30 shadow-sm shrink-0"
                          style={{ backgroundColor: pal.secondaire }}
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-neutral-700 shadow-sm shrink-0"
                          style={{ backgroundColor: pal.fond }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-white group-hover:text-emerald-400 block truncate">
                        {pal.nom}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Choix des couleurs fines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Couleur Principale du Club
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={couleur}
                      onChange={(e) => setCouleur(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={couleur}
                      onChange={(e) => setCouleur(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Couleur Secondaire / Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={couleurSecondaire}
                      onChange={(e) => setCouleurSecondaire(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={couleurSecondaire}
                      onChange={(e) => setCouleurSecondaire(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Couleur de Fond d'Ambiance
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={couleurFond}
                      onChange={(e) => setCouleurFond(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={couleurFond}
                      onChange={(e) => setCouleurFond(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Style / Texture de fond */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Layout className="h-4 w-4 text-emerald-400" />
                  <span>Texture & Style d'arrière-plan de l'équipe</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {STYLES_FOND.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStyleFond(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        styleFond === item.id
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30 text-white'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        {styleFond === item.id && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Boutons validation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              {ongletActif !== 'general' && (
                <button
                  type="button"
                  onClick={() =>
                    setOngletActif(ongletActif === 'ambiance' ? 'ecusson' : 'general')
                  }
                  className="rounded-xl border border-neutral-700 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
                >
                  Précédent
                </button>
              )}
              {ongletActif !== 'ambiance' && (
                <button
                  type="button"
                  onClick={() =>
                    setOngletActif(ongletActif === 'general' ? 'ecusson' : 'ambiance')
                  }
                  className="rounded-xl bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-700"
                >
                  Suivant : {ongletActif === 'general' ? 'Écusson' : 'Ambiance'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={surFermer}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 shadow-sm transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>{equipeEnEdition ? 'Mettre à jour l’ambiance' : 'Créer l’équipe avec son ambiance'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
