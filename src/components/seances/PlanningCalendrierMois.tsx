import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  Users,
  Target,
  Sparkles,
  GripVertical,
  Move,
  Info,
  Check,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { Seance, Equipe, PhaseSaison, ReponseQuestionnaire } from '../../types';
import {
  trouverPhaseSaisonPourDate,
  calculerChargePrevueSeance,
  debrieferSeanceSRPE,
} from '../../utils/analytics';

// Modèles prédéfinis de séances prêts au glisser-déposer
export const MODELES_SEANCES_RAPIDES: {
  id: string;
  titre: string;
  type: Seance['type'];
  dureeMinutes: number;
  rpePrevu: number;
  description: string;
  badgeCouleur: string;
}[] = [
  {
    id: 'mod-tactique',
    titre: 'Entraînement Tactique & Jeu',
    type: 'Technique / Tactique',
    dureeMinutes: 90,
    rpePrevu: 7,
    description: 'Organisation collective, mise en place des blocs et animations offensives/défensives.',
    badgeCouleur: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
  {
    id: 'mod-muscu',
    titre: 'Musculation & Puissance',
    type: 'Musculation',
    dureeMinutes: 60,
    rpePrevu: 7.5,
    description: 'Renforcement ciblé, force maximale et travail de puissance excentrique.',
    badgeCouleur: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  },
  {
    id: 'mod-vma',
    titre: 'Cardio VMA & Intermittent',
    type: 'Cardio / VMA',
    dureeMinutes: 50,
    rpePrevu: 8.5,
    description: 'Fractions d’effort à haute intensité (15/15 ou 30/30) pour le développement aérobie.',
    badgeCouleur: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  {
    id: 'mod-vitesse',
    titre: 'Vitesse & Explosivité',
    type: 'Entraînement',
    dureeMinutes: 45,
    rpePrevu: 6.5,
    description: 'Accélérations courtes, départs arrêtés et travail de réactivité motrice.',
    badgeCouleur: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  },
  {
    id: 'mod-recup',
    titre: 'Décrassage & Récupération',
    type: 'Récupération',
    dureeMinutes: 45,
    rpePrevu: 3,
    description: 'Footing aérobie très doux, mobilité articulaire et travail respiratoire post-effort.',
    badgeCouleur: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
  },
  {
    id: 'mod-match',
    titre: 'Match Officiel / Compétition',
    type: 'Match / Compétition',
    dureeMinutes: 95,
    rpePrevu: 9,
    description: 'Rencontre officielle à intensité maximale.',
    badgeCouleur: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  },
];

interface PlanningCalendrierMoisProps {
  seances: Seance[];
  equipes: Equipe[];
  reponses: ReponseQuestionnaire[];
  phasesSaison: PhaseSaison[];
  surSelectionnerSeance: (seance: Seance) => void;
  surAjouterSeanceDate: (date: string) => void;
  surModifierSeance: (seance: Seance) => void;
  surDeplacerSeance: (seanceId: string, nouvelleDate: string) => void;
  surAjouterSeanceDepuisModele: (seance: Omit<Seance, 'id' | 'dateCreation'>) => void;
  surOuvrirCalculateurSRPE?: () => void;
}

export const PlanningCalendrierMois: React.FC<PlanningCalendrierMoisProps> = ({
  seances,
  equipes,
  reponses,
  phasesSaison,
  surSelectionnerSeance,
  surAjouterSeanceDate,
  surModifierSeance,
  surDeplacerSeance,
  surAjouterSeanceDepuisModele,
  surOuvrirCalculateurSRPE,
}) => {
  // Date de référence (défaut sur la date courante)
  const [dateRef, setDateRef] = useState<Date>(() => new Date());
  const [dateSurvolee, setDateSurvolee] = useState<string | null>(null);
  const [seanceEnGlissementId, setSeanceEnGlissementId] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [afficherPaletteModeles, setAfficherPaletteModeles] = useState(true);

  const afficherToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3200);
  };

  const annee = dateRef.getFullYear();
  const moisIndex = dateRef.getMonth(); // 0-11

  const nomsMois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Premier jour du mois
  const premierJourMois = new Date(annee, moisIndex, 1);
  // Dernier jour du mois
  const dernierJourMois = new Date(annee, moisIndex + 1, 0);

  // Jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, ...)
  let jourSemainePremier = premierJourMois.getDay();
  // Adapter pour Lundi = 0, Dimanche = 6
  let offsetDebut = jourSemainePremier === 0 ? 6 : jourSemainePremier - 1;

  const totalJours = dernierJourMois.getDate();

  // Grille des cases calendaires
  const casesGrille: {
    dateStr: string;
    numeroJour: number;
    estMoisCourant: boolean;
    estAujourdhui: boolean;
  }[] = [];

  // Jours du mois précédent pour combler la première semaine
  const dernierJourMoisPrec = new Date(annee, moisIndex, 0).getDate();
  for (let i = offsetDebut - 1; i >= 0; i--) {
    const d = new Date(annee, moisIndex - 1, dernierJourMoisPrec - i);
    const dateStr = d.toISOString().split('T')[0];
    casesGrille.push({
      dateStr,
      numeroJour: dernierJourMoisPrec - i,
      estMoisCourant: false,
      estAujourdhui: dateStr === new Date().toISOString().split('T')[0],
    });
  }

  // Jours du mois actuel
  for (let j = 1; j <= totalJours; j++) {
    const moisStr = String(moisIndex + 1).padStart(2, '0');
    const jourStr = String(j).padStart(2, '0');
    const dateStr = `${annee}-${moisStr}-${jourStr}`;
    casesGrille.push({
      dateStr,
      numeroJour: j,
      estMoisCourant: true,
      estAujourdhui: dateStr === new Date().toISOString().split('T')[0],
    });
  }

  // Jours du mois suivant pour compléter les 35 ou 42 cases
  const casesRestantes = (casesGrille.length % 7 === 0) ? 0 : 7 - (casesGrille.length % 7);
  for (let k = 1; k <= casesRestantes; k++) {
    const d = new Date(annee, moisIndex + 1, k);
    const dateStr = d.toISOString().split('T')[0];
    casesGrille.push({
      dateStr,
      numeroJour: k,
      estMoisCourant: false,
      estAujourdhui: dateStr === new Date().toISOString().split('T')[0],
    });
  }

  // Navigation
  const moisPrecedent = () => {
    setDateRef(new Date(annee, moisIndex - 1, 1));
  };

  const moisSuivant = () => {
    setDateRef(new Date(annee, moisIndex + 1, 1));
  };

  const allerAujourdhui = () => {
    setDateRef(new Date());
  };

  // Phase de saison dominante pour ce mois
  const dateMilieuMois = `${annee}-${String(moisIndex + 1).padStart(2, '0')}-15`;
  const phaseActuelle = trouverPhaseSaisonPourDate(dateMilieuMois, phasesSaison);

  // Calcul de la charge totale sRPE prévue pour tout ce mois
  const seancesDuMois = seances.filter((s) => {
    const [sAnnee, sMois] = s.date.split('-').map(Number);
    return sAnnee === annee && sMois === moisIndex + 1;
  });

  const totalChargeMoisUA = seancesDuMois.reduce((acc, s) => {
    return acc + (s.rpePrevu ?? 5) * (s.dureeMinutes ?? 60);
  }, 0);

  const formatCourtDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  };

  const getCouleurType = (type: Seance['type']) => {
    switch (type) {
      case 'Match / Compétition':
        return 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:border-rose-400';
      case 'Musculation':
        return 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:border-purple-400';
      case 'Cardio / VMA':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-400';
      case 'Récupération':
        return 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:border-sky-400';
      case 'Technique / Tactique':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400';
      default:
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400';
    }
  };

  // GESTION DU GLISSER-DÉPOSER (Drag & Drop)
  const handleDragStartSeance = (e: React.DragEvent, s: Seance) => {
    e.stopPropagation();
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        source: 'SEANCE_EXISTANTE',
        seanceId: s.id,
        titre: s.titre,
        dateInitiale: s.date,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
    setSeanceEnGlissementId(s.id);
  };

  const handleDragStartModele = (e: React.DragEvent, mod: typeof MODELES_SEANCES_RAPIDES[0]) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        source: 'MODELE_RAPIDE',
        modele: {
          titre: mod.titre,
          type: mod.type,
          dureeMinutes: mod.dureeMinutes,
          rpePrevu: mod.rpePrevu,
          description: mod.description,
        },
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOverJour = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dateSurvolee !== dateStr) {
      setDateSurvolee(dateStr);
    }
  };

  const handleDragLeaveJour = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (dateSurvolee === dateStr) {
      setDateSurvolee(null);
    }
  };

  const handleDropJour = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDateSurvolee(null);
    setSeanceEnGlissementId(null);

    try {
      const donneesBrutes = e.dataTransfer.getData('application/json');
      if (!donneesBrutes) return;

      const payload = JSON.parse(donneesBrutes);

      if (payload.source === 'SEANCE_EXISTANTE' && payload.seanceId) {
        if (payload.dateInitiale === dateStr) {
          // Même date, rien à faire
          return;
        }
        surDeplacerSeance(payload.seanceId, dateStr);
        afficherToast(`✓ Séance déplacée au ${formatCourtDate(dateStr)}`);
      } else if (payload.source === 'MODELE_RAPIDE' && payload.modele) {
        const equipeParDefaut = equipes[0]?.id || null;
        const phaseDuJour = trouverPhaseSaisonPourDate(dateStr, phasesSaison);

        surAjouterSeanceDepuisModele({
          titre: payload.modele.titre,
          type: payload.modele.type,
          date: dateStr,
          heureDebut: '10:00',
          dureeMinutes: payload.modele.dureeMinutes,
          rpePrevu: payload.modele.rpePrevu,
          equipeId: equipeParDefaut,
          description: payload.modele.description,
          phaseSaison: phaseDuJour?.nom || 'Préparation Spécifique (SPP)',
          statut: 'Planifiée',
        });

        const chargeUA = payload.modele.dureeMinutes * payload.modele.rpePrevu;
        afficherToast(
          `✓ Séance « ${payload.modele.titre} » planifiée le ${formatCourtDate(dateStr)} (${chargeUA} UA)`
        );
      }
    } catch (err) {
      console.error('Erreur glisser-déposer calendrier :', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast de confirmation glisser-déposer */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-neutral-900 px-4 py-3 text-xs font-semibold text-emerald-400 shadow-xl shadow-black/60 animate-in fade-in slide-in-from-bottom-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Barre de navigation du calendrier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={moisPrecedent}
              className="rounded-xl border border-neutral-800 bg-neutral-800/80 p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={moisSuivant}
              className="rounded-xl border border-neutral-800 bg-neutral-800/80 p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-white capitalize">
              {nomsMois[moisIndex]} {annee}
            </h2>
            <button
              type="button"
              onClick={allerAujourdhui}
              className="rounded-lg bg-neutral-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-neutral-700 transition-colors"
            >
              Aujourd’hui
            </button>
          </div>
        </div>

        {/* Phase de saison & Charge mensuelle sRPE */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {phaseActuelle && (
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: phaseActuelle.couleur }}
              />
              <span className="text-neutral-400">Phase :</span>
              <span className="font-semibold text-white">{phaseActuelle.nom}</span>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
            <Flame className="h-4 w-4 text-emerald-400" />
            <span>
              Total sRPE planifié :{' '}
              <strong className="font-bold text-white">{totalChargeMoisUA.toLocaleString()} UA</strong>
            </span>
            <span className="text-[10px] text-neutral-400">({seancesDuMois.length} séances)</span>
          </div>

          {surOuvrirCalculateurSRPE && (
            <button
              type="button"
              onClick={surOuvrirCalculateurSRPE}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Calculateur sRPE</span>
            </button>
          )}
        </div>
      </div>

      {/* Palette de séances prêtes au Glisser-Déposer */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
              <Move className="h-3 w-3" />
            </span>
            <span className="text-xs font-bold text-white">
              Glisser-Déposer de planification
            </span>
            <span className="hidden sm:inline-block text-[11px] text-neutral-400">
              — Glissez un modèle ci-dessous directement sur une case, ou déplacez une séance déjà créée d'un jour à l'autre
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAfficherPaletteModeles(!afficherPaletteModeles)}
            className="text-[11px] text-neutral-400 hover:text-white transition-colors"
          >
            {afficherPaletteModeles ? 'Masquer modèles' : 'Afficher modèles'}
          </button>
        </div>

        {afficherPaletteModeles && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {MODELES_SEANCES_RAPIDES.map((mod) => {
              const chargeUA = mod.dureeMinutes * mod.rpePrevu;
              return (
                <div
                  key={mod.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStartModele(e, mod)}
                  className={`group cursor-grab active:cursor-grabbing select-none rounded-xl border p-2 transition-all hover:scale-[1.02] shadow-sm ${mod.badgeCouleur}`}
                  title={`${mod.description} • Glissez sur une date pour planifier`}
                >
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                    <span className="flex items-center gap-1 font-mono">
                      <GripVertical className="h-3 w-3 text-neutral-400 group-hover:text-white" />
                      <span>{mod.dureeMinutes}m</span>
                    </span>
                    <span className="font-mono font-bold text-white bg-black/30 px-1 rounded">
                      {chargeUA} UA
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-white truncate">
                    {mod.titre}
                  </div>

                  <div className="text-[9px] text-neutral-300 mt-0.5">
                    RPE {mod.rpePrevu} • {mod.type.split('/')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grille du calendrier mensuel avec récepteurs de drop */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-sm">
        {/* En-tête des jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-900/90 text-center text-xs font-bold text-neutral-400 py-2.5">
          {joursSemaine.map((j, idx) => (
            <div key={j} className={idx >= 5 ? 'text-amber-400/80' : ''}>
              {j}
            </div>
          ))}
        </div>

        {/* Cases des jours */}
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-800/80">
          {casesGrille.map((c) => {
            const seancesJour = seances.filter((s) => s.date === c.dateStr);

            // Somme de la charge sRPE prévue pour ce jour
            const chargeJourUA = seancesJour.reduce((acc, s) => {
              return acc + (s.rpePrevu ?? 5) * (s.dureeMinutes ?? 60);
            }, 0);

            const estSurvolee = dateSurvolee === c.dateStr;

            return (
              <div
                key={c.dateStr}
                onDragOver={(e) => handleDragOverJour(e, c.dateStr)}
                onDragLeave={(e) => handleDragLeaveJour(e, c.dateStr)}
                onDrop={(e) => handleDropJour(e, c.dateStr)}
                className={`min-h-[125px] p-2 flex flex-col justify-between transition-all group relative ${
                  c.estMoisCourant
                    ? 'bg-neutral-900/40 hover:bg-neutral-800/40'
                    : 'bg-neutral-950/60 text-neutral-600'
                } ${
                  c.estAujourdhui
                    ? 'ring-1 ring-inset ring-emerald-500/50 bg-emerald-500/[0.03]'
                    : ''
                } ${
                  estSurvolee
                    ? 'ring-2 ring-emerald-500 bg-emerald-500/20 border-emerald-500/60'
                    : ''
                }`}
              >
                {/* En-tête de la case (Numéro du jour + bouton d'ajout + total charge) */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-mono font-bold flex h-6 w-6 items-center justify-center rounded-lg ${
                        c.estAujourdhui
                          ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                          : c.estMoisCourant
                          ? 'text-neutral-300'
                          : 'text-neutral-600'
                      }`}
                    >
                      {c.numeroJour}
                    </span>
                    {chargeJourUA > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {chargeJourUA} UA
                      </span>
                    )}
                  </div>

                  {/* Bouton planifier pour ce jour précis */}
                  <button
                    type="button"
                    onClick={() => surAjouterSeanceDate(c.dateStr)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-emerald-500 hover:text-neutral-950"
                    title={`Planifier une séance le ${c.dateStr}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Zone de drop visuel si survolée */}
                {estSurvolee && (
                  <div className="my-1 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-500/10 py-2 text-center text-[10px] font-bold text-emerald-300 animate-pulse">
                    + Déposer la séance ici
                  </div>
                )}

                {/* Liste des séances du jour (chacune est 'draggable') */}
                <div className="space-y-1.5 overflow-hidden flex-1">
                  {seancesJour.map((s) => {
                    const debrief = debrieferSeanceSRPE(s, reponses);
                    const chargePrevue = calculerChargePrevueSeance(s);
                    const estEnGlissement = seanceEnGlissementId === s.id;

                    return (
                      <div
                        key={s.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStartSeance(e, s)}
                        onDragEnd={() => {
                          setSeanceEnGlissementId(null);
                          setDateSurvolee(null);
                        }}
                        onClick={() => surSelectionnerSeance(s)}
                        className={`group/card cursor-grab active:cursor-grabbing rounded-lg border p-1.5 text-[11px] leading-tight transition-all hover:scale-[1.02] shadow-sm ${getCouleurType(
                          s.type
                        )} ${estEnGlissement ? 'opacity-40 ring-2 ring-emerald-500' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold truncate text-white flex items-center gap-1">
                            <GripVertical className="h-2.5 w-2.5 opacity-40 group-hover/card:opacity-100 text-neutral-300 shrink-0" />
                            <span>{s.heureDebut ? `${s.heureDebut} ` : ''}{s.titre}</span>
                          </span>
                          {s.statut === 'Terminée' && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-neutral-300 pl-3.5">
                          <span>
                            {s.dureeMinutes}m • RPE {s.rpePrevu ?? 5}
                          </span>
                          <span className="font-mono font-bold text-white">
                            {chargePrevue.chargePrevueUA} UA
                          </span>
                        </div>

                        {/* Débriefing réel si présent */}
                        {debrief.nbReponses > 0 && (
                          <div className="mt-1 pt-1 border-t border-neutral-700/40 text-[9px] text-neutral-300 flex items-center justify-between pl-3.5">
                            <span>{debrief.nbReponses} retour(s)</span>
                            <span className="font-mono text-emerald-400 font-semibold">
                              Réel : {debrief.chargeMoyenneReelleUA} UA
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bas de case : si vide, clic pour ajouter */}
                {seancesJour.length === 0 && !estSurvolee && c.estMoisCourant && (
                  <button
                    type="button"
                    onClick={() => surAjouterSeanceDate(c.dateStr)}
                    className="w-full text-center text-[10px] text-neutral-600 hover:text-neutral-400 py-1 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    + Planifier
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
