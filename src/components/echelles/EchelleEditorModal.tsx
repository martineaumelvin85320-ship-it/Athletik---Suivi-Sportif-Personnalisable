import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Info,
  Check,
  Award,
  Palette,
  Eye,
  Layers,
} from 'lucide-react';
import { EchellePersonnalisee, PalierEchelle, ModeEchelle } from '../../types';

interface EchelleEditorModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surSauvegarder: (echelle: Omit<EchellePersonnalisee, 'id'>) => void;
  echelleEnEdition?: EchellePersonnalisee | null;
}

const COULEURS_PALIERS = [
  '#10b981', // vert émeraude
  '#34d399', // vert clair
  '#84cc16', // vert lime
  '#eab308', // jaune
  '#f59e0b', // ambre
  '#f97316', // orange
  '#ef4444', // rouge
  '#dc2626', // rouge vif
  '#991b1b', // cramoisi sombre
  '#3b82f6', // bleu
  '#8b5cf6', // violet
];

export const EchelleEditorModal: React.FC<EchelleEditorModalProps> = ({
  ouvert,
  surFermer,
  surSauvegarder,
  echelleEnEdition,
}) => {
  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<ModeEchelle>('paliers_personnalises');
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(5);
  const [pas, setPas] = useState(1);
  const [libelleMin, setLibelleMin] = useState('');
  const [libelleMax, setLibelleMax] = useState('');
  const [paliers, setPaliers] = useState<PalierEchelle[]>([
    { valeur: 1, libelle: 'Très faible', description: 'Aucune difficulté', couleur: '#10b981' },
    { valeur: 2, libelle: 'Faible', description: 'Effort léger', couleur: '#34d399' },
    { valeur: 3, libelle: 'Modéré', description: 'Effort intermédiaire', couleur: '#eab308' },
    { valeur: 4, libelle: 'Élevé', description: 'Effort exigeant', couleur: '#f97316' },
    { valeur: 5, libelle: 'Très élevé', description: 'Limite tolérable', couleur: '#ef4444' },
  ]);

  // Valeur pour l'aperçu interactif
  const [valeurApercu, setValeurApercu] = useState<number>(3);

  useEffect(() => {
    if (echelleEnEdition) {
      setNom(echelleEnEdition.nom);
      setCode(echelleEnEdition.code);
      setDescription(echelleEnEdition.description || '');
      setMode(echelleEnEdition.mode);
      setMin(echelleEnEdition.min);
      setMax(echelleEnEdition.max);
      setPas(echelleEnEdition.pas || 1);
      setLibelleMin(echelleEnEdition.libelleMin || '');
      setLibelleMax(echelleEnEdition.libelleMax || '');
      setPaliers(
        echelleEnEdition.paliers && echelleEnEdition.paliers.length > 0
          ? echelleEnEdition.paliers
          : [
              { valeur: 1, libelle: 'Faible', couleur: '#10b981' },
              { valeur: 5, libelle: 'Fort', couleur: '#ef4444' },
            ]
      );
      setValeurApercu(echelleEnEdition.min);
    } else {
      setNom('');
      setCode('');
      setDescription('');
      setMode('paliers_personnalises');
      setMin(1);
      setMax(5);
      setPas(1);
      setLibelleMin('Minimal');
      setLibelleMax('Maximal');
      setPaliers([
        { valeur: 1, libelle: 'Très faible', description: 'Aucune difficulté', couleur: '#10b981' },
        { valeur: 2, libelle: 'Faible', description: 'Effort léger', couleur: '#34d399' },
        { valeur: 3, libelle: 'Modéré', description: 'Effort intermédiaire', couleur: '#eab308' },
        { valeur: 4, libelle: 'Élevé', description: 'Effort exigeant', couleur: '#f97316' },
        { valeur: 5, libelle: 'Très élevé', description: 'Limite tolérable', couleur: '#ef4444' },
      ]);
      setValeurApercu(3);
    }
  }, [echelleEnEdition, ouvert]);

  if (!ouvert) return null;

  const isBorg = echelleEnEdition?.isBorg;

  const handleAjouterPalier = () => {
    const dernier = paliers[paliers.length - 1];
    const nouvelleValeur = dernier ? dernier.valeur + 1 : 1;
    const nouvelleCouleur =
      COULEURS_PALIERS[paliers.length % COULEURS_PALIERS.length] || '#3b82f6';

    const nouveaux = [
      ...paliers,
      {
        valeur: nouvelleValeur,
        libelle: `Niveau ${nouvelleValeur}`,
        description: '',
        couleur: nouvelleCouleur,
      },
    ];
    setPaliers(nouveaux);
    setMax(nouvelleValeur);
  };

  const handleModifierPalier = (index: number, updates: Partial<PalierEchelle>) => {
    const copie = [...paliers];
    copie[index] = { ...copie[index], ...updates };
    setPaliers(copie);
  };

  const handleSupprimerPalier = (index: number) => {
    if (paliers.length <= 2) {
      alert('Une échelle doit comporter au moins 2 paliers.');
      return;
    }
    const nouveaux = paliers.filter((_, i) => i !== index);
    setPaliers(nouveaux);
    if (nouveaux.length > 0) {
      setMin(Math.min(...nouveaux.map((p) => p.valeur)));
      setMax(Math.max(...nouveaux.map((p) => p.valeur)));
    }
  };

  // Modèles prédéfinis pour création rapide
  const chargerModeleRapide = (nbPaliers: number) => {
    if (nbPaliers === 3) {
      setPaliers([
        { valeur: 1, libelle: 'Faible / Bon', description: 'Condition optimale', couleur: '#10b981' },
        { valeur: 2, libelle: 'Moyen / Neutre', description: 'Condition standard', couleur: '#eab308' },
        { valeur: 3, libelle: 'Élevé / Alerte', description: 'Fatigue ou gêne marquée', couleur: '#ef4444' },
      ]);
      setMin(1);
      setMax(3);
    } else if (nbPaliers === 5) {
      setPaliers([
        { valeur: 1, libelle: 'Très bas', description: 'Aucune sensation négative', couleur: '#10b981' },
        { valeur: 2, libelle: 'Bas', description: 'Sensation légère', couleur: '#34d399' },
        { valeur: 3, libelle: 'Moyen', description: 'Sensation modérée', couleur: '#eab308' },
        { valeur: 4, libelle: 'Élevé', description: 'Sensation pénible', couleur: '#f97316' },
        { valeur: 5, libelle: 'Très élevé', description: 'État critique', couleur: '#ef4444' },
      ]);
      setMin(1);
      setMax(5);
    } else if (nbPaliers === 7) {
      setPaliers([
        { valeur: 1, libelle: 'Très bon (1)', description: 'Parfait état', couleur: '#10b981' },
        { valeur: 2, libelle: 'Bon (2)', description: 'Bon état', couleur: '#34d399' },
        { valeur: 3, libelle: 'Assez bon (3)', description: 'Légère altération', couleur: '#84cc16' },
        { valeur: 4, libelle: 'Neutre (4)', description: 'État moyen', couleur: '#eab308' },
        { valeur: 5, libelle: 'Assez mauvais (5)', description: 'Gêne présente', couleur: '#f59e0b' },
        { valeur: 6, libelle: 'Mauvais (6)', description: 'Très marqué', couleur: '#f97316' },
        { valeur: 7, libelle: 'Très mauvais (7)', description: 'Critique / Arrêt requis', couleur: '#ef4444' },
      ]);
      setMin(1);
      setMax(7);
    }
  };

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      alert('Veuillez renseigner le nom de l’échelle.');
      return;
    }

    const borneMin =
      mode === 'paliers_personnalises' && paliers.length > 0
        ? Math.min(...paliers.map((p) => p.valeur))
        : min;
    const borneMax =
      mode === 'paliers_personnalises' && paliers.length > 0
        ? Math.max(...paliers.map((p) => p.valeur))
        : max;

    surSauvegarder({
      nom: nom.trim(),
      code: code.trim() || nom.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 16),
      description: description.trim(),
      mode,
      min: borneMin,
      max: borneMax,
      pas,
      libelleMin: libelleMin.trim() || undefined,
      libelleMax: libelleMax.trim() || undefined,
      paliers: mode === 'paliers_personnalises' ? paliers : [],
      isBorg: !!isBorg,
      isPreset: false,
    });
    surFermer();
  };

  // Trouver le palier actuellement sélectionné dans l'aperçu
  const palierActuel = paliers.find((p) => p.valeur === valeurApercu) || paliers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{echelleEnEdition ? 'Modifier l’échelle' : 'Créer une échelle sur mesure'}</span>
                {isBorg && (
                  <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                    Échelle de Borg Officielle
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                Définissez vos propres échelons, libellés, couleurs et repères d'évaluation
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

        {/* Formulaire */}
        <form onSubmit={handleSoumettre} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* IDENTIFICATION DE L'ECHELLE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nom de l’échelle *
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Échelle de Fatigue Spécifique, Échelle VAS Douleur..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Code identifiant
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex : FATIGUE_CUSTOM"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Description & Utilisation recommandée
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez aux entraîneurs et sportifs à quoi correspond cette échelle..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* TYPE D'ECHELLE */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Format de construction de l'échelle
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('paliers_personnalises')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === 'paliers_personnalises'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/30'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold">Paliers discrets personnalisés (Recommandé)</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Chaque échelon a son chiffre exact, son libellé (ex: Repos, Modéré...), sa description et sa couleur distincte.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('continue_bornes')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === 'continue_bornes'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/30'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold">Curseur continu (Min / Max / Pas)</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Jauge continue ou curseur numérique linéaire entre une borne minimale et maximale avec libellés aux extrémités.
                </p>
              </button>
            </div>
          </div>

          {/* MODE CONTINU */}
          {mode === 'continue_bornes' && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Borne Min</label>
                  <input
                    type="number"
                    value={min}
                    onChange={(e) => setMin(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Borne Max</label>
                  <input
                    type="number"
                    value={max}
                    onChange={(e) => setMax(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Pas / Incrément</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pas}
                    onChange={(e) => setPas(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Libellé de la valeur minimale (ex: Aucun, Repos...)
                  </label>
                  <input
                    type="text"
                    value={libelleMin}
                    onChange={(e) => setLibelleMin(e.target.value)}
                    placeholder="Ex : Frais et disponible"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Libellé de la valeur maximale (ex: Épuisement, Critique...)
                  </label>
                  <input
                    type="text"
                    value={libelleMax}
                    onChange={(e) => setLibelleMax(e.target.value)}
                    placeholder="Ex : Épuisement complet"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE PALIERS DISCRETS */}
          {mode === 'paliers_personnalises' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-400" />
                    <span>Paliers et échelons ({paliers.length} niveaux)</span>
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Personnalisez chaque marche de votre échelle avec son chiffre, libellé et code couleur.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400 font-medium">Modèles rapides :</span>
                  <button
                    type="button"
                    onClick={() => chargerModeleRapide(3)}
                    className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-300"
                  >
                    3 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => chargerModeleRapide(5)}
                    className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-300"
                  >
                    5 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => chargerModeleRapide(7)}
                    className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-300"
                  >
                    7 pts
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {paliers.map((pal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/80 p-2.5 transition-colors hover:border-neutral-700"
                  >
                    {/* Pastille de couleur */}
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={pal.couleur || '#10b981'}
                        onChange={(e) => handleModifierPalier(idx, { couleur: e.target.value })}
                        className="h-7 w-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        title="Changer la couleur du palier"
                      />
                    </div>

                    {/* Valeur numérique */}
                    <div className="w-16 shrink-0">
                      <input
                        type="number"
                        value={pal.valeur}
                        onChange={(e) =>
                          handleModifierPalier(idx, { valeur: Number(e.target.value) })
                        }
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs font-bold text-white text-center"
                        title="Valeur chiffrée"
                      />
                    </div>

                    {/* Libellé principal */}
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={pal.libelle}
                        onChange={(e) => handleModifierPalier(idx, { libelle: e.target.value })}
                        placeholder="Libellé du niveau..."
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-white"
                      />
                    </div>

                    {/* Description détaillée */}
                    <div className="hidden sm:block flex-1 min-w-[140px]">
                      <input
                        type="text"
                        value={pal.description || ''}
                        onChange={(e) =>
                          handleModifierPalier(idx, { description: e.target.value })
                        }
                        placeholder="Description / sensation..."
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] text-neutral-300"
                      />
                    </div>

                    {/* Supprimer */}
                    <button
                      type="button"
                      onClick={() => handleSupprimerPalier(idx)}
                      disabled={paliers.length <= 2}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 disabled:opacity-30"
                      title="Supprimer ce palier"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAjouterPalier}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 py-2 text-xs font-semibold text-neutral-300 hover:border-emerald-500 hover:text-white transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Ajouter un échelon supplémentaire</span>
              </button>
            </div>
          )}

          {/* APERÇU DYNAMIQUE DE L'ÉCHELLE POUR LE SPORTIF */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                <span>Aperçu de l'expérience joueur (Interactif)</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                Testez la sélection ci-dessous
              </span>
            </div>

            {mode === 'paliers_personnalises' ? (
              <div className="space-y-3">
                {/* Grille des boutons de paliers */}
                <div className="flex flex-wrap gap-2">
                  {paliers.map((pal) => {
                    const actif = valeurApercu === pal.valeur;
                    return (
                      <button
                        key={pal.valeur}
                        type="button"
                        onClick={() => setValeurApercu(pal.valeur)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-bold transition-all text-xs ${
                          actif
                            ? 'ring-2 ring-white/30 scale-105 shadow-md'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        }`}
                        style={
                          actif
                            ? {
                                backgroundColor: `${pal.couleur || '#10b981'}25`,
                                borderColor: pal.couleur || '#10b981',
                                color: '#ffffff',
                              }
                            : undefined
                        }
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: pal.couleur || '#10b981' }}
                        />
                        <span>{pal.valeur}</span>
                        <span className="font-normal opacity-90">{pal.libelle}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback du palier sélectionné */}
                {palierActuel && (
                  <div
                    className="p-3 rounded-xl border flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: `${palierActuel.couleur || '#10b981'}15`,
                      borderColor: `${palierActuel.couleur || '#10b981'}35`,
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-black"
                          style={{ color: palierActuel.couleur || '#10b981' }}
                        >
                          Niveau {palierActuel.valeur} : {palierActuel.libelle}
                        </span>
                      </div>
                      {palierActuel.description && (
                        <p className="text-[11px] text-neutral-300 mt-0.5">
                          {palierActuel.description}
                        </p>
                      )}
                    </div>
                    <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{libelleMin || `Min : ${min}`}</span>
                  <span className="text-emerald-400 font-mono text-sm bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
                    Valeur : {valeurApercu}
                  </span>
                  <span>{libelleMax || `Max : ${max}`}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={pas}
                  value={valeurApercu}
                  onChange={(e) => setValeurApercu(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Boutons actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
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
              <span>{echelleEnEdition ? 'Mettre à jour l’échelle' : 'Enregistrer cette échelle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
