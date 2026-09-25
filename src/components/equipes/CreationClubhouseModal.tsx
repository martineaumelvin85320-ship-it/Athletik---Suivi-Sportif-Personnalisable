import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Upload,
  Check,
  Sparkles,
  Shield,
  Palette,
  MapPin,
  Trophy,
  X,
} from 'lucide-react';
import { ClubEcusson } from './ClubEcusson';

interface CreationClubhouseModalProps {
  ouvert: boolean;
  surFermer?: () => void;
}

const PRESET_COULEURS = [
  '#10b981', // Émeraude / Vert pelouse
  '#0284c7', // Bleu ciel
  '#2563eb', // Bleu royal
  '#7c3aed', // Violet
  '#e11d48', // Rouge vif
  '#ea580c', // Orange
  '#f59e0b', // Ambre / Or
  '#14b8a6', // Turquoise
];

const DISCIPLINES_SUGGEREES = [
  'Football & Futsal',
  'Athlétisme & Running',
  'Basketball',
  'Rugby',
  'Handball',
  'Triathlon & Cyclisme',
  'Préparation Physique & Musculation',
  'Sports de Combat',
  'Omnisport',
];

export const CreationClubhouseModal: React.FC<CreationClubhouseModalProps> = ({
  ouvert,
  surFermer,
}) => {
  const { creerClubhouse, profilCompte } = useApp();

  const [nom, setNom] = useState('Mon Club Performance');
  const [discipline, setDiscipline] = useState('Football & Futsal');
  const [ville, setVille] = useState('Paris');
  const [codeClub, setCodeClub] = useState(() => `CLUB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [couleurPrimaire, setCouleurPrimaire] = useState('#10b981');
  const [description, setDescription] = useState(
    'Espace officiel Clubhouse pour le pilotage de la charge d’entraînement et la gestion de nos équipes.'
  );
  const [logoUrl, setLogoUrl] = useState('');

  if (!ouvert) return null;

  const handleFichierLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop volumineuse. Taille max : 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCreer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom.trim()) {
      alert('Veuillez renseigner le nom de votre club.');
      return;
    }

    creerClubhouse({
      nom: nom.trim(),
      discipline: discipline.trim() || 'Football',
      proprietaireCoachId: profilCompte.id,
      proprietaireNom: `${profilCompte.prenom} ${profilCompte.nom}`.trim() || 'Coach',
      proprietaireEmail: profilCompte.email,
      codeClub: codeClub.trim().toUpperCase() || `CLUB-${Math.floor(1000 + Math.random() * 9000)}`,
      logoUrl: logoUrl.trim(),
      couleurPrimaire,
      ville: ville.trim(),
      description: description.trim(),
    });

    if (surFermer) surFermer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 sm:p-8 space-y-6 text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center border-2 aspect-square shadow-lg"
              style={{
                borderColor: couleurPrimaire,
                backgroundColor: `${couleurPrimaire}20`,
                color: couleurPrimaire,
              }}
            >
              <Building2 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Créer votre Clubhouse officiel
                </h2>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400">
                  VEO CAM
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cloisonnez vos équipes et effectifs dans votre propre espace privé.
              </p>
            </div>
          </div>

          {surFermer && (
            <button
              type="button"
              onClick={surFermer}
              className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Aperçu du logo rond & bannière du club */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo 100% ROND */}
            <div
              className="h-16 w-16 rounded-full border-2 overflow-hidden aspect-square bg-neutral-900 shadow-md flex items-center justify-center shrink-0"
              style={{ borderColor: couleurPrimaire }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={nom}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <Building2 className="h-8 w-8" style={{ color: couleurPrimaire }} />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Aperçu de votre Clubhouse
              </span>
              <h3 className="text-base font-extrabold text-white">{nom || 'Nom du club'}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {discipline} • Code Club : <span className="font-mono text-emerald-400 font-bold">{codeClub}</span>
              </p>
            </div>
          </div>

          <label className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors shrink-0">
            <Upload className="h-3.5 w-3.5" />
            <span>Changer logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFichierLogo}
              className="hidden"
            />
          </label>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleCreer} className="space-y-4 text-xs">
          {/* Nom du Club */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300 flex items-center justify-between">
              <span>Nom officiel de votre Club <span className="text-emerald-400">*</span></span>
              <span className="text-[10px] text-neutral-500">Ex: FC Nantes Performance</span>
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Football Club Performance"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Discipline sportive */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300">
              Discipline principale
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {DISCIPLINES_SUGGEREES.slice(0, 5).map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => setDiscipline(disc)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                    discipline === disc
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  {disc}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              placeholder="Ex: Football, Rugby, Athlétisme..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Ligne : Ville & Code Clubhouse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                <span>Ville / Centre</span>
              </label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ex: Nantes, Paris, Lyon..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Code Clubhouse (unique)</span>
              </label>
              <input
                type="text"
                required
                value={codeClub}
                onChange={(e) => setCodeClub(e.target.value.toUpperCase())}
                placeholder="Ex: CLUB-8532"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Palette de couleur principale */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-neutral-400" />
              <span>Couleur officielle du club</span>
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COULEURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCouleurPrimaire(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform aspect-square ${
                    couleurPrimaire === c ? 'scale-110 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={couleurPrimaire}
                onChange={(e) => setCouleurPrimaire(e.target.value)}
                className="h-8 w-8 rounded-full border-0 cursor-pointer bg-transparent"
                title="Choisir une couleur sur-mesure"
              />
            </div>
          </div>

          {/* Description / Philosophie */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300">
              Description ou devise du club
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présentation du club, valeurs d'entraînement..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Bouton de validation */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-3.5 px-6 font-black text-sm text-neutral-950 transition-all shadow-xl shadow-emerald-500/25"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Valider et ouvrir mon Clubhouse officiel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
