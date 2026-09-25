import React, { useState } from 'react';
import {
  X,
  Calculator,
  Flame,
  Clock,
  Activity,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Info,
  ArrowRight,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface CalculateurSRPEModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surPlanifierSeance?: (parametres: { dureeMinutes: number; rpePrevu: number }) => void;
}

// Échelle Borg CR-10 avec descriptions cliniques et sportives officielles
const ECHELLE_BORG_CR10 = [
  { note: 0, libelle: 'Repos complet', desc: 'Aucun effort physique, assis ou allongé.', couleur: 'text-neutral-400 bg-neutral-800/80 border-neutral-700' },
  { note: 1, libelle: 'Très très facile', desc: 'Récupération passive ou marche lente sans essoufflement.', couleur: 'text-sky-300 bg-sky-500/10 border-sky-500/30' },
  { note: 2, libelle: 'Facile / Léger', desc: 'Aérobie douce, conversation facile, décrassage post-match.', couleur: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
  { note: 3, libelle: 'Modéré', desc: 'Endurance fondamentale, rythme stable, aisance respiratoire.', couleur: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { note: 4, libelle: 'Un peu dur', desc: 'Début de transition aérobie-anaérobie, respiration plus rythmée.', couleur: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40' },
  { note: 5, libelle: 'Dur / Difficile', desc: 'Seuil anaérobie, transpiration soutenue, effort continu consistant.', couleur: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
  { note: 6, libelle: 'Considérable', desc: 'Entre dur et très dur, concentration élevée requise.', couleur: 'text-amber-400 bg-amber-500/20 border-amber-500/40' },
  { note: 7, libelle: 'Très dur', desc: 'Fractionné court, VMA, musculation lourde, brûlure musculaire.', couleur: 'text-orange-400 bg-orange-500/20 border-orange-500/40' },
  { note: 8, libelle: 'Très très dur', desc: 'Sprints répétés lactiques, tolérance mentale extrême requise.', couleur: 'text-rose-400 bg-rose-500/20 border-rose-500/40' },
  { note: 9, libelle: 'Extrêmement dur', desc: 'Proche du renoncement immédiat, hyperventilation majeure.', couleur: 'text-rose-500 bg-rose-500/25 border-rose-500/50' },
  { note: 10, libelle: 'Maximal absolu', desc: 'Épuisement total, impossible de continuer une seconde de plus.', couleur: 'text-red-400 bg-red-600/30 border-red-500/60' },
];

export const CalculateurSRPEModal: React.FC<CalculateurSRPEModalProps> = ({
  ouvert,
  surFermer,
  surPlanifierSeance,
}) => {
  const [onglet, setOnglet] = useState<'direct' | 'solveur' | 'simulateur_semaine'>('direct');

  // Mode Direct
  const [duree, setDuree] = useState<number>(75);
  const [rpe, setRpe] = useState<number>(7);
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  // Mode Solveur d'Objectif
  const [cibleChargeUA, setCibleChargeUA] = useState<number>(600);
  const [cibleDuree, setCibleDuree] = useState<number>(80);
  const [cibleRpe, setCibleRpe] = useState<number>(7.5);
  const [modeSolveur, setModeSolveur] = useState<'trouver_rpe' | 'trouver_duree'>('trouver_rpe');

  // Mode Simulateur Semaine (Microcycle 7 jours)
  const [semaineJours, setSemaineJours] = useState([
    { nom: 'Lundi', active: true, duree: 75, rpe: 6, type: 'Collectif' },
    { nom: 'Mardi', active: true, duree: 60, rpe: 8, type: 'Muscu / VMA' },
    { nom: 'Mercredi', active: false, duree: 0, rpe: 0, type: 'Repos' },
    { nom: 'Jeudi', active: true, duree: 90, rpe: 7, type: 'Technico-tactique' },
    { nom: 'Vendredi', active: true, duree: 45, rpe: 4, type: 'Affûtage' },
    { nom: 'Samedi', active: true, duree: 95, rpe: 9, type: 'Match' },
    { nom: 'Dimanche', active: false, duree: 0, rpe: 0, type: 'Repos' },
  ]);

  if (!ouvert) return null;

  // Calcul direct de la charge sRPE (Foster 1998)
  const chargeUA = Math.round(duree * rpe);

  // Évaluation physiologique de la séance
  const getNiveauEffort = (ua: number) => {
    if (ua < 300) {
      return {
        zone: 'Zone 1 : Récupération Active / Régénération',
        badge: 'Légère (< 300 UA)',
        couleur: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        tempsRecup: '12 à 24 heures',
        impactGlycogene: 'Faible (< 20%)',
        stressNeuro: 'Négligeable',
        conseil: 'Idéal au lendemain de match ou en séance de décrassage pour activer la circulation.',
      };
    }
    if (ua <= 600) {
      return {
        zone: 'Zone 2 : Entretien & Aérobie Fondamentale',
        badge: 'Optimale (300 - 600 UA)',
        couleur: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        tempsRecup: '24 à 36 heures',
        impactGlycogene: 'Modéré (40 - 60%)',
        stressNeuro: 'Modéré',
        conseil: 'Charge standard permettant de construire le volume d’entraînement sans fatigue résiduelle excessive.',
      };
    }
    if (ua <= 850) {
      return {
        zone: 'Zone 3 : Développement & Surcharge Contrôlée',
        badge: 'Intense (600 - 850 UA)',
        couleur: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        tempsRecup: '36 à 48 heures',
        impactGlycogene: 'Élevé (60 - 85%)',
        stressNeuro: 'Considérable',
        conseil: 'Séance de développement clef (VMA, force max, charge lactique). Prévoir une journée plus légère le lendemain.',
      };
    }
    return {
      zone: 'Zone 4 : Charge Choc / Match Officiel',
      badge: 'Maximale (> 850 UA)',
      couleur: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      tempsRecup: '48 à 72 heures',
      impactGlycogene: 'Critique (> 85%)',
      stressNeuro: 'Élevé / Fatigue centrale',
      conseil: 'Effort compétitif ou bloc de surcharge extrême. Nécessite sommeil, hydratation et récupération optimisés.',
    };
  };

  const niveauEffort = getNiveauEffort(chargeUA);
  const detailBorg = ECHELLE_BORG_CR10.find((b) => Math.round(rpe) === b.note) || ECHELLE_BORG_CR10[7];

  // Calculs Solveur
  const rpeCalculeSolveur = cibleDuree > 0 ? Number((cibleChargeUA / cibleDuree).toFixed(1)) : 0;
  const dureeCalculeeSolveur = cibleRpe > 0 ? Math.round(cibleChargeUA / cibleRpe) : 0;

  // Calculs Simulateur Microcycle
  const chargesJours = semaineJours.map((j) => (j.active ? j.duree * j.rpe : 0));
  const chargeHebdoTotaleUA = chargesJours.reduce((acc, c) => acc + c, 0);
  const moyenneJournaliere = chargeHebdoTotaleUA / 7;

  // Écart-type pour la monotonie de Foster
  const variance =
    chargesJours.reduce((acc, c) => acc + Math.pow(c - moyenneJournaliere, 2), 0) / 7;
  const ecartType = Math.sqrt(variance);

  // Monotonie = Moyenne / Écart-type (si SD > 0)
  const monotonieFoster = ecartType > 0 ? Number((moyenneJournaliere / ecartType).toFixed(2)) : 0;
  // Contrainte (Strain) = Charge Totale * Monotonie
  const contrainteHebdo = Math.round(chargeHebdoTotaleUA * monotonieFoster);

  const copierBilanPressePapier = () => {
    const texte = `📊 CALCUL DE CHARGE sRPE (Méthode de Foster)
----------------------------------------
• Durée séance : ${duree} minutes
• RPE Borg CR-10 : ${rpe}/10 (${detailBorg.libelle})
• Charge sRPE : ${chargeUA} UA (Unités Arbitraires)
• Classification : ${niveauEffort.zone}
• Temps de récupération estimé : ${niveauEffort.tempsRecup}
• Conseil staff : ${niveauEffort.conseil}
----------------------------------------
Généré depuis la plateforme de suivi d'entraînement`;

    navigator.clipboard.writeText(texte).then(() => {
      setCopieEffectuee(true);
      setTimeout(() => setCopieEffectuee(false), 2200);
    });
  };

  const handleAppliquerSeance = () => {
    if (surPlanifierSeance) {
      surPlanifierSeance({ dureeMinutes: duree, rpePrevu: rpe });
    }
    surFermer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Calculateur Automatique de Charge sRPE</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Foster, 1998
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Formule officielle : <strong className="text-white font-mono">Charge (UA) = RPE (Borg CR-10) × Durée (min)</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={surFermer}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation entre sous-modes */}
        <div className="flex items-center gap-1 border-b border-neutral-800 px-6 py-2.5 bg-neutral-950/60 text-xs">
          <button
            type="button"
            onClick={() => setOnglet('direct')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              onglet === 'direct'
                ? 'bg-emerald-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Calculateur Direct</span>
          </button>

          <button
            type="button"
            onClick={() => setOnglet('solveur')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              onglet === 'solveur'
                ? 'bg-emerald-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Solveur d’Objectif</span>
          </button>

          <button
            type="button"
            onClick={() => setOnglet('simulateur_semaine')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              onglet === 'simulateur_semaine'
                ? 'bg-emerald-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Simulateur Microcycle & Monotonie</span>
          </button>
        </div>

        {/* Contenu principal défilable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {onglet === 'direct' && (
            <div className="space-y-5">
              {/* Grand panneau résultat calcul sRPE */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                      Résultat du calcul sRPE
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black text-white font-mono tracking-tight">
                        {chargeUA}
                      </span>
                      <span className="text-sm font-bold text-emerald-400">UA (Unités Arbitraires)</span>
                    </div>
                  </div>

                  <div className={`rounded-xl border px-3 py-2 text-xs font-semibold text-right ${niveauEffort.couleur}`}>
                    <div>{niveauEffort.badge}</div>
                    <div className="text-[10px] font-normal opacity-90">{niveauEffort.tempsRecup} de récupération</div>
                  </div>
                </div>

                {/* Formule décomposée */}
                <div className="flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-2.5 border border-neutral-800 text-xs font-mono">
                  <span className="text-neutral-400">
                    Durée : <strong className="text-white">{duree} min</strong>
                  </span>
                  <span className="text-neutral-600">×</span>
                  <span className="text-neutral-400">
                    RPE : <strong className="text-white">{rpe} / 10</strong> ({detailBorg.libelle})
                  </span>
                  <span className="text-neutral-600">=</span>
                  <span className="font-bold text-emerald-400">{chargeUA} UA</span>
                </div>

                {/* Impact physiologique & conseils */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="rounded-xl bg-neutral-900/60 p-3 border border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Stress Neuromusculaire</span>
                    <span className="font-semibold text-white">{niveauEffort.stressNeuro}</span>
                  </div>
                  <div className="rounded-xl bg-neutral-900/60 p-3 border border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Demande Glycogène</span>
                    <span className="font-semibold text-white">{niveauEffort.impactGlycogene}</span>
                  </div>
                  <div className="rounded-xl bg-neutral-900/60 p-3 border border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Fenêtre Récupération</span>
                    <span className="font-semibold text-emerald-400">{niveauEffort.tempsRecup}</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-300 bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-800/60 flex items-start gap-2">
                  <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{niveauEffort.conseil}</span>
                </div>
              </div>

              {/* Contrôle 1 : Durée de l'effort */}
              <div className="space-y-2.5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>1. Durée globale de la séance (notée par le coach)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={10}
                      max={240}
                      step={5}
                      value={duree}
                      onChange={(e) => setDuree(Math.max(1, Number(e.target.value)))}
                      className="w-16 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-right font-mono font-bold text-white focus:outline-none"
                    />
                    <span className="text-xs text-neutral-400">minutes</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Règle Foster : On prend la séance dans son ensemble (du début au coup de sifflet final, non temps effectif). Notée par l'entraîneur et standardisée pour le groupe.
                </p>

                {/* Slider de durée */}
                <input
                  type="range"
                  min={15}
                  max={180}
                  step={5}
                  value={duree}
                  onChange={(e) => setDuree(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />

                {/* Boutons rapides durée */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[30, 45, 60, 75, 90, 105, 120].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDuree(min)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        duree === min
                          ? 'bg-emerald-500 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrôle 2 : RPE Borg CR-10 */}
              <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>2. Intensité RPE ressentie ou prévue (Échelle Borg CR-10)</span>
                  </label>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {rpe} / 10
                  </span>
                </div>

                {/* Slider RPE */}
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />

                {/* Grille des niveaux Borg CR-10 cliquables */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {ECHELLE_BORG_CR10.slice(1).map((b) => {
                    const estSelectionne = Math.abs(rpe - b.note) < 0.3;
                    return (
                      <button
                        key={b.note}
                        type="button"
                        onClick={() => setRpe(b.note)}
                        className={`text-left p-2 rounded-xl border transition-all ${
                          estSelectionne
                            ? `${b.couleur} ring-2 ring-emerald-500 shadow-md`
                            : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>RPE {b.note}</span>
                          {estSelectionne && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] font-semibold text-white truncate mt-0.5">
                          {b.libelle}
                        </div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                          {b.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {onglet === 'solveur' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-emerald-400" />
                  <span>Calculateur Inversé : Fixer un objectif et déduire le dosage</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Besoin d’atteindre une charge cible précise (ex: 650 UA) ? Déterminez le RPE requis en fonction de votre créneau horaire, ou la durée optimale pour un RPE donné.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setModeSolveur('trouver_rpe')}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                      modeSolveur === 'trouver_rpe'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    Trouver le RPE à cibler (durée imposée)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeSolveur('trouver_duree')}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                      modeSolveur === 'trouver_duree'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    Trouver la durée nécessaire (RPE imposé)
                  </button>
                </div>
              </div>

              {modeSolveur === 'trouver_rpe' ? (
                <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Charge cible souhaitée (UA)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={1500}
                        step={50}
                        value={cibleChargeUA}
                        onChange={(e) => setCibleChargeUA(Number(e.target.value))}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Durée disponible (minutes)
                      </label>
                      <input
                        type="number"
                        min={20}
                        max={180}
                        step={5}
                        value={cibleDuree}
                        onChange={(e) => setCibleDuree(Number(e.target.value))}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Résultat solveur RPE */}
                  <div className="rounded-xl bg-neutral-950 p-4 border border-neutral-800 text-center space-y-1">
                    <span className="text-xs text-neutral-400">RPE Borg CR-10 recommandé pour le coach :</span>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {rpeCalculeSolveur} / 10
                    </div>
                    <p className="text-xs text-neutral-300">
                      {rpeCalculeSolveur > 10 ? (
                        <span className="text-rose-400 font-semibold flex items-center justify-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Charge irréaliste pour {cibleDuree} min (RPE &gt; 10). Augmentez la durée.
                        </span>
                      ) : (
                        <span>
                          Consigne athlètes : séance d'intensité{' '}
                          <strong>
                            {ECHELLE_BORG_CR10.find((b) => Math.round(rpeCalculeSolveur) === b.note)?.libelle || 'soutenue'}
                          </strong>
                          .
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Charge cible souhaitée (UA)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={1500}
                        step={50}
                        value={cibleChargeUA}
                        onChange={(e) => setCibleChargeUA(Number(e.target.value))}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Intensité RPE voulue (1 à 10)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        step={0.5}
                        value={cibleRpe}
                        onChange={(e) => setCibleRpe(Number(e.target.value))}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Résultat solveur Durée */}
                  <div className="rounded-xl bg-neutral-950 p-4 border border-neutral-800 text-center space-y-1">
                    <span className="text-xs text-neutral-400">Durée d'entraînement recommandée :</span>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {dureeCalculeeSolveur} minutes
                    </div>
                    <p className="text-xs text-neutral-300">
                      Soit environ{' '}
                      <strong>
                        {Math.floor(dureeCalculeeSolveur / 60)}h{' '}
                        {dureeCalculeeSolveur % 60 > 0 ? `${dureeCalculeeSolveur % 60}m` : ''}
                      </strong>{' '}
                      à RPE {cibleRpe}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {onglet === 'simulateur_semaine' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-400" />
                    <span>Modélisation d'une Semaine Complète (Monotonie & Strain de Foster)</span>
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">7 jours</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Carl Foster a démontré qu'une charge élevée combinée à une faible variabilité (monotonie &gt; 2.0) est le principal prédicteur de fatigue chronique, d'infections respiratoires et de blessures musculaires.
                </p>
              </div>

              {/* Indicateurs clefs de la semaine simulée */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                  <div className="text-[10px] text-neutral-400">Charge Totale Hebdo</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {chargeHebdoTotaleUA.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">UA</span>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                  <div className="text-[10px] text-neutral-400">Moyenne Journalière</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {Math.round(moyenneJournaliere)} <span className="text-xs text-neutral-400 font-normal">UA/j</span>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                  <div className="text-[10px] text-neutral-400">Monotonie de Foster</div>
                  <div className={`text-lg font-black font-mono mt-0.5 ${monotonieFoster > 2.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {monotonieFoster}
                  </div>
                  <div className="text-[9px] text-neutral-400">
                    {monotonieFoster > 2.0 ? '⚠️ Élevée (> 2.0)' : '✓ Équilibrée (< 2.0)'}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                  <div className="text-[10px] text-neutral-400">Contrainte (Strain)</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                    {contrainteHebdo.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">UA</span>
                  </div>
                  <div className="text-[9px] text-neutral-400">Charge × Monotonie</div>
                </div>
              </div>

              {/* Tableau interactif jour par jour */}
              <div className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
                <span className="text-xs font-semibold text-neutral-300 block mb-2">
                  Ajuster les séances de chaque jour :
                </span>

                <div className="space-y-2">
                  {semaineJours.map((j, idx) => {
                    const chargeJour = j.active ? j.duree * j.rpe : 0;
                    return (
                      <div
                        key={j.nom}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors ${
                          j.active
                            ? 'bg-neutral-950 border-neutral-800'
                            : 'bg-neutral-900/30 border-neutral-800/40 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <input
                            type="checkbox"
                            checked={j.active}
                            onChange={(e) => {
                              const updated = [...semaineJours];
                              updated[idx].active = e.target.checked;
                              if (!e.target.checked) {
                                updated[idx].duree = 0;
                                updated[idx].rpe = 0;
                              } else {
                                updated[idx].duree = 75;
                                updated[idx].rpe = 7;
                              }
                              setSemaineJours(updated);
                            }}
                            className="accent-emerald-500 h-4 w-4 rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-white">{j.nom}</span>
                        </div>

                        {j.active ? (
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-400">Durée:</span>
                              <input
                                type="number"
                                min={15}
                                max={180}
                                step={5}
                                value={j.duree}
                                onChange={(e) => {
                                  const updated = [...semaineJours];
                                  updated[idx].duree = Number(e.target.value);
                                  setSemaineJours(updated);
                                }}
                                className="w-14 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-white font-mono text-xs focus:outline-none"
                              />
                              <span className="text-neutral-400">m</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-400">RPE:</span>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                step={0.5}
                                value={j.rpe}
                                onChange={(e) => {
                                  const updated = [...semaineJours];
                                  updated[idx].rpe = Number(e.target.value);
                                  setSemaineJours(updated);
                                }}
                                className="w-12 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-white font-mono text-xs focus:outline-none"
                              />
                              <span className="text-neutral-400">/10</span>
                            </div>

                            <div className="min-w-[80px] text-right font-mono font-bold text-emerald-400">
                              {chargeJour} UA
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500 italic">Repos complet</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de modal avec actions */}
        <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4 bg-neutral-900">
          <button
            type="button"
            onClick={copierBilanPressePapier}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            {copieEffectuee ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copier le bilan sRPE</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={surFermer}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:bg-neutral-800 transition-colors"
            >
              Fermer
            </button>
            {surPlanifierSeance && (
              <button
                type="button"
                onClick={handleAppliquerSeance}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
              >
                <Calendar className="h-4 w-4" />
                <span>Planifier avec cette charge ({chargeUA} UA)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
