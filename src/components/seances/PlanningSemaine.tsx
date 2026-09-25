import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Flame,
  CheckCircle2,
  Users,
  Activity,
  Layers,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  GripVertical,
  Move,
  Check,
  Calculator,
} from 'lucide-react';
import { Seance, Equipe, PhaseSaison, ReponseQuestionnaire } from '../../types';
import {
  calculerMetriquesSemaineSRPE,
  calculerChargePrevueSeance,
  debrieferSeanceSRPE,
  trouverPhaseSaisonPourDate,
} from '../../utils/analytics';
import { MODELES_SEANCES_RAPIDES } from './PlanningCalendrierMois';

interface PlanningSemaineProps {
  seances: Seance[];
  equipes: Equipe[];
  reponses: ReponseQuestionnaire[];
  phasesSaison: PhaseSaison[];
  surSelectionnerSeance: (seance: Seance) => void;
  surAjouterSeanceDate: (date: string) => void;
  surDeplacerSeance?: (seanceId: string, nouvelleDate: string) => void;
  surAjouterSeanceDepuisModele?: (seance: Omit<Seance, 'id' | 'dateCreation'>) => void;
  surOuvrirCalculateurSRPE?: () => void;
}

export const PlanningSemaine: React.FC<PlanningSemaineProps> = ({
  seances,
  equipes,
  reponses,
  phasesSaison,
  surSelectionnerSeance,
  surAjouterSeanceDate,
  surDeplacerSeance,
  surAjouterSeanceDepuisModele,
  surOuvrirCalculateurSRPE,
}) => {
  // Calculer le lundi de la semaine courante
  const getLundiSemaine = (d: Date): Date => {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1); // ajuster quand dimanche
    copy.setDate(diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const [dateLundi, setDateLundi] = useState<Date>(() => getLundiSemaine(new Date()));
  const [dateSurvolee, setDateSurvolee] = useState<string | null>(null);
  const [seanceEnGlissementId, setSeanceEnGlissementId] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [afficherPaletteModeles, setAfficherPaletteModeles] = useState(false);

  const afficherToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3200);
  };

  const dateLundiStr = dateLundi.toISOString().split('T')[0];

  // Calculer les métriques sRPE de la semaine
  const statsSemaine = calculerMetriquesSemaineSRPE(dateLundiStr, seances, reponses);

  const nomsJours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const navigationPrecedente = () => {
    const prev = new Date(dateLundi);
    prev.setDate(prev.getDate() - 7);
    setDateLundi(prev);
  };

  const navigationSuivante = () => {
    const next = new Date(dateLundi);
    next.setDate(next.getDate() + 7);
    setDateLundi(next);
  };

  const retourAujourdhui = () => {
    setDateLundi(getLundiSemaine(new Date()));
  };

  const phaseSemaine = trouverPhaseSaisonPourDate(dateLundiStr, phasesSaison);
  const objectifPhaseUA = phaseSemaine?.objectifChargeHebdoUA ?? 2800;

  // Calcul du taux de réalisation de la charge
  const pourcentageCharge = Math.min(
    150,
    Math.round((statsSemaine.chargePrevueTotaleUA / (objectifPhaseUA || 1)) * 100)
  );

  const formatCourtDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  };

  const aujourdhuiStr = new Date().toISOString().split('T')[0];

  const getCouleurType = (type: Seance['type']) => {
    switch (type) {
      case 'Match / Compétition':
        return 'border-rose-500/50 bg-rose-500/10 text-rose-300';
      case 'Musculation':
        return 'border-purple-500/50 bg-purple-500/10 text-purple-300';
      case 'Cardio / VMA':
        return 'border-amber-500/50 bg-amber-500/10 text-amber-300';
      case 'Récupération':
        return 'border-sky-500/50 bg-sky-500/10 text-sky-300';
      case 'Technique / Tactique':
        return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
      default:
        return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
    }
  };

  // Drag and Drop handlers
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

      if (payload.source === 'SEANCE_EXISTANTE' && payload.seanceId && surDeplacerSeance) {
        if (payload.dateInitiale === dateStr) return;
        surDeplacerSeance(payload.seanceId, dateStr);
        afficherToast(`✓ Séance déplacée au ${formatCourtDate(dateStr)}`);
      } else if (payload.source === 'MODELE_RAPIDE' && payload.modele && surAjouterSeanceDepuisModele) {
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
      console.error('Erreur drop semaine :', err);
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

      {/* Barre de navigation temporelle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={navigationPrecedente}
              className="rounded-xl border border-neutral-800 bg-neutral-800/80 p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title="Semaine précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={navigationSuivante}
              className="rounded-xl border border-neutral-800 bg-neutral-800/80 p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title="Semaine suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-bold text-white">
              Semaine du {formatCourtDate(dateLundiStr)} au{' '}
              {formatCourtDate(statsSemaine.datesSemaine[6])}
            </h2>
            <button
              type="button"
              onClick={retourAujourdhui}
              className="rounded-lg bg-neutral-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-neutral-700 transition-colors"
            >
              Semaine en cours
            </button>
          </div>
        </div>

        {/* Phase de saison & Raccourci Calculateur */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {phaseSemaine && (
            <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: phaseSemaine.couleur }}
              />
              <span className="text-neutral-400">Phase :</span>
              <span className="font-semibold text-white">{phaseSemaine.nom}</span>
              <span className="text-neutral-500 font-mono">
                (Cible : {objectifPhaseUA.toLocaleString()} UA)
              </span>
            </div>
          )}

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

          <button
            type="button"
            onClick={() => setAfficherPaletteModeles(!afficherPaletteModeles)}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-neutral-300 hover:text-white transition-colors"
          >
            <Move className="h-3.5 w-3.5 text-emerald-400" />
            <span>{afficherPaletteModeles ? 'Masquer modèles' : 'Modèles à glisser'}</span>
          </button>
        </div>
      </div>

      {/* Palette optionnelle de modèles à glisser */}
      {afficherPaletteModeles && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-2">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <Move className="h-3.5 w-3.5 text-emerald-400" />
            <span>Glissez un modèle directement sur un jour de la semaine :</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {MODELES_SEANCES_RAPIDES.map((mod) => (
              <div
                key={mod.id}
                draggable={true}
                onDragStart={(e) => handleDragStartModele(e, mod)}
                className={`group cursor-grab active:cursor-grabbing select-none rounded-xl border p-2 transition-all hover:scale-[1.02] shadow-sm ${mod.badgeCouleur}`}
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                  <span className="flex items-center gap-1 font-mono">
                    <GripVertical className="h-3 w-3 text-neutral-400 group-hover:text-white" />
                    <span>{mod.dureeMinutes}m</span>
                  </span>
                  <span className="font-mono font-bold text-white bg-black/30 px-1 rounded">
                    {mod.dureeMinutes * mod.rpePrevu} UA
                  </span>
                </div>
                <div className="text-[11px] font-bold text-white truncate">{mod.titre}</div>
                <div className="text-[9px] text-neutral-300">RPE {mod.rpePrevu}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Indicateurs Clés Foster de la Semaine */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Charge sRPE Prévue</span>
            <Flame className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white">
            {statsSemaine.chargePrevueTotaleUA.toLocaleString()}{' '}
            <span className="text-xs font-normal text-neutral-400">UA</span>
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>{statsSemaine.nbSeances} séances</span>
            <span className="font-semibold text-emerald-400">{pourcentageCharge}% objectif</span>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Charge Réelle Réalisée</span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-white">
            {statsSemaine.chargeReelleMoyenneTotaleUA.toLocaleString()}{' '}
            <span className="text-xs font-normal text-neutral-400">UA</span>
          </div>
          <div className="text-[11px] text-neutral-400">Moyenne des débriefings sportifs</div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Monotonie de Foster</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white">
            {statsSemaine.monotonie}{' '}
            <span className="text-xs font-normal text-neutral-400">
              {statsSemaine.monotonie > 2.0 ? 'Élevée (>2.0)' : 'Équilibrée'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">Moyenne / Écart-type journalier</div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Contrainte (Strain)</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white">
            {statsSemaine.contrainte.toLocaleString()}{' '}
            <span className="text-xs font-normal text-neutral-400">UA</span>
          </div>
          <div className="text-[11px] text-neutral-400">Charge Totale × Monotonie</div>
        </div>
      </div>

      {/* Grille des 7 jours de la semaine avec Glisser-Déposer */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {statsSemaine.datesSemaine.map((dateStr, index) => {
          const seancesDuJour = seances.filter((s) => s.date === dateStr);
          const estAujourdhui = dateStr === aujourdhuiStr;
          const estSurvolee = dateSurvolee === dateStr;

          // Charge prévue du jour
          const chargeJourPrevueUA = seancesDuJour.reduce((acc, s) => {
            return acc + (s.rpePrevu ?? 5) * (s.dureeMinutes ?? 60);
          }, 0);

          return (
            <div
              key={dateStr}
              onDragOver={(e) => handleDragOverJour(e, dateStr)}
              onDragLeave={(e) => handleDragLeaveJour(e, dateStr)}
              onDrop={(e) => handleDropJour(e, dateStr)}
              className={`rounded-2xl border p-3 flex flex-col justify-between min-h-[320px] transition-all ${
                estSurvolee
                  ? 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500'
                  : estAujourdhui
                  ? 'border-emerald-500/50 bg-emerald-500/[0.04] ring-1 ring-emerald-500/30'
                  : 'border-neutral-800 bg-neutral-900/50'
              }`}
            >
              {/* En-tête du jour */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <div>
                    <div className="text-xs font-bold text-white">{nomsJours[index]}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {formatCourtDate(dateStr)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => surAjouterSeanceDate(dateStr)}
                    className="rounded-lg p-1.5 bg-neutral-800 text-neutral-300 hover:bg-emerald-500 hover:text-neutral-950 transition-colors"
                    title={`Ajouter une séance le ${dateStr}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Badge charge du jour */}
                <div className="mt-2 mb-3 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Charge :</span>
                  <span
                    className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      chargeJourPrevueUA > 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-neutral-500'
                    }`}
                  >
                    {chargeJourPrevueUA > 0 ? `${chargeJourPrevueUA} UA` : 'Repos'}
                  </span>
                </div>

                {/* Indicateur de drop */}
                {estSurvolee && (
                  <div className="my-2 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-500/20 py-3 text-center text-xs font-bold text-emerald-300 animate-pulse">
                    + Déposer ici
                  </div>
                )}

                {/* Liste des séances pour ce jour */}
                <div className="space-y-2">
                  {seancesDuJour.map((s) => {
                    const debrief = debrieferSeanceSRPE(s, reponses);
                    const chargePrevue = calculerChargePrevueSeance(s);
                    const eq = equipes.find((e) => e.id === s.equipeId);
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
                        className={`group cursor-grab active:cursor-grabbing rounded-xl border p-2.5 space-y-1.5 transition-all hover:scale-[1.02] shadow-sm ${getCouleurType(
                          s.type
                        )} ${estEnGlissement ? 'opacity-40 ring-2 ring-emerald-500' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                            <GripVertical className="h-3 w-3 opacity-40 group-hover:opacity-100 text-neutral-300 shrink-0" />
                            <span>{s.titre}</span>
                          </span>
                          {s.statut === 'Terminée' && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-neutral-300 pl-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {s.heureDebut ? `${s.heureDebut} • ` : ''}
                              {s.dureeMinutes} min
                            </span>
                          </span>
                          <span className="font-mono font-bold text-white bg-black/30 px-1 py-0.5 rounded">
                            {chargePrevue.chargePrevueUA} UA
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-neutral-400 pl-4">
                          <span>RPE cible : {s.rpePrevu ?? 5}/10</span>
                          <span>{eq ? eq.nom.split(' ')[0] : 'Tout club'}</span>
                        </div>

                        {/* Données réelles des sportifs si séance terminée */}
                        {debrief.nbReponses > 0 && (
                          <div className="pt-1.5 border-t border-neutral-700/40 text-[10px] space-y-0.5 pl-4">
                            <div className="flex items-center justify-between text-neutral-300">
                              <span>Débriefings ({debrief.nbReponses}) :</span>
                              <span className="font-bold text-emerald-400">
                                {debrief.chargeMoyenneReelleUA} UA
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-neutral-400">
                              <span>RPE ressenti moyen :</span>
                              <span className="font-semibold text-white">
                                {debrief.rpeMoyenReel} / 10
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pied de colonne si aucune séance */}
              {seancesDuJour.length === 0 && !estSurvolee && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => surAjouterSeanceDate(dateStr)}
                    className="w-full rounded-xl border border-dashed border-neutral-800 py-3 text-xs text-neutral-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
                  >
                    + Planifier
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
