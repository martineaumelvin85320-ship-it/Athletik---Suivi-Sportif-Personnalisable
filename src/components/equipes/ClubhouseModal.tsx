import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  Shield,
  Upload,
  Check,
  Sparkles,
  Camera,
  Users,
  Trophy,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ClubEcusson } from './ClubEcusson';

interface ClubhouseModalProps {
  ouvert: boolean;
  surFermer: () => void;
}

export const ClubhouseModal: React.FC<ClubhouseModalProps> = ({ ouvert, surFermer }) => {
  const { clubhouse, modifierClubhouse, supprimerClubhouse, equipesDuCoach, sportifs } = useApp();

  const [nom, setNom] = useState(clubhouse.nom);
  const [discipline, setDiscipline] = useState(clubhouse.discipline);
  const [proprietaireNom, setProprietaireNom] = useState(clubhouse.proprietaireNom);
  const [description, setDescription] = useState(clubhouse.description || '');
  const [logoUrl, setLogoUrl] = useState(clubhouse.logoUrl || '');
  const [couleurPrimaire, setCouleurPrimaire] = useState(clubhouse.couleurPrimaire || '#10b981');
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);

  if (!ouvert) return null;

  // Calcul du nombre de sportifs dans les équipes de ce Clubhouse
  const equipeIds = new Set(equipesDuCoach.map((e) => e.id));
  const nbSportifsClubhouse = sportifs.filter((s) => s.equipeId && equipeIds.has(s.equipeId)).length;

  const handleFichierLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop volumineuse. Taille max conseillée : 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleEnregistrer = (e: React.FormEvent) => {
    e.preventDefault();
    modifierClubhouse({
      nom: nom.trim() || 'Clubhouse VEO Performance',
      discipline: discipline.trim() || 'Football & Omnisport',
      proprietaireNom: proprietaireNom.trim() || 'Coach Alexandre Roy',
      description: description.trim(),
      logoUrl: logoUrl.trim(),
      couleurPrimaire,
    });
    surFermer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 sm:p-7 space-y-6 text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* En-tête de la modale */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Building2 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Mon Clubhouse Officiel
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                  STYLE VEO CAM
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Regroupe et cloisonne exclusivement vos équipes, coachs et effectifs.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={surFermer}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Aperçu du Clubhouse en badge rond */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {logoUrl ? (
              <div
                className="h-14 w-14 rounded-full border-2 overflow-hidden aspect-square bg-neutral-900 shadow-md flex items-center justify-center shrink-0"
                style={{ borderColor: couleurPrimaire }}
              >
                <img
                  src={logoUrl}
                  alt={nom}
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            ) : (
              <div
                className="h-14 w-14 rounded-full border-2 flex items-center justify-center text-white font-black text-base shadow-md shrink-0 aspect-square"
                style={{
                  borderColor: couleurPrimaire,
                  backgroundColor: `${couleurPrimaire}25`,
                }}
              >
                <Building2 className="h-7 w-7" style={{ color: couleurPrimaire }} />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Clubhouse Actif
              </span>
              <h4 className="text-sm font-black text-white">{nom || 'Mon Clubhouse'}</h4>
              <p className="text-xs text-neutral-400">
                {discipline} • Coach : {proprietaireNom}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {equipesDuCoach.length} équipe{equipesDuCoach.length > 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-neutral-400">
              {nbSportifsClubhouse} athlètes au total
            </span>
          </div>
        </div>

        {/* Formulaire de personnalisation */}
        <form onSubmit={handleEnregistrer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Nom du Clubhouse (Organisation / Club)
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : Clubhouse VEO - RC Performance"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Discipline sportive
              </label>
              <input
                type="text"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="Ex : Football, Rugby, Basket..."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Entraîneur Responsable
              </label>
              <input
                type="text"
                value={proprietaireNom}
                onChange={(e) => setProprietaireNom(e.target.value)}
                placeholder="Ex : Alexandre Roy"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Logo officiel du club (strictement ROND) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-neutral-200">
                  Logo officiel du Clubhouse (forme ronde)
                </label>
                <p className="text-[11px] text-neutral-400">
                  Le logo sera automatiquement recadré en cercle parfait.
                </p>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Supprimer
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-full border-2 overflow-hidden aspect-square bg-neutral-900 shadow-md flex items-center justify-center shrink-0"
                style={{ borderColor: couleurPrimaire }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Clubhouse"
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-neutral-500" />
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  id="clubhouse-logo-upload"
                  accept="image/*"
                  onChange={handleFichierLogo}
                  className="hidden"
                />
                <label
                  htmlFor="clubhouse-logo-upload"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Importer une image de logo</span>
                </label>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Format PNG transparent ou JPG recommandé.
                </p>
              </div>
            </div>
          </div>

          {/* Couleur d'accentuation du club */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Couleur d'accentuation du Clubhouse
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={couleurPrimaire}
                onChange={(e) => setCouleurPrimaire(e.target.value)}
                className="h-9 w-9 rounded-xl border border-neutral-800 cursor-pointer bg-neutral-950 p-0.5"
              />
              <input
                type="text"
                value={couleurPrimaire}
                onChange={(e) => setCouleurPrimaire(e.target.value)}
                className="w-28 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Description ou devise du Clubhouse
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ex : Espace haute performance et quantification de l'effort..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* ZONE DE DANGER : SUPPRESSION DU CLUBHOUSE */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Zone critique : Supprimer mon Clubhouse</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              La suppression de votre Clubhouse réinitialise son organisation et vous permettra de repartir d’un espace vierge ou d'en créer un nouveau. Vous pourrez toujours annuler cette action depuis l'onglet Historique.
            </p>

            {!confirmationSuppression ? (
              <button
                type="button"
                onClick={() => setConfirmationSuppression(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer mon Clubhouse</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/80 border border-rose-500/40 animate-in fade-in">
                <span className="text-xs text-rose-300 font-bold">Confirmer la suppression ?</span>
                <button
                  type="button"
                  onClick={() => {
                    supprimerClubhouse();
                    surFermer();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-colors cursor-pointer"
                >
                  Oui, supprimer définitivement
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmationSuppression(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={surFermer}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 text-xs font-bold text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black transition-colors shadow-md"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Enregistrer le Clubhouse</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
