import React, { useState } from 'react';
import {
  CalendarCheck2,
  Plus,
  Filter,
  Clock,
  Flame,
  Users,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  LayoutGrid,
  Calculator,
  Move,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Seance } from '../../types';
import { SeanceModal } from './SeanceModal';
import { SeanceDetailModal } from './SeanceDetailModal';
import { PlanningCalendrierMois } from './PlanningCalendrierMois';
import { PlanningSemaine } from './PlanningSemaine';
import { PlanificationSaisonMacrocycle } from './PlanificationSaisonMacrocycle';
import { CalculateurSRPEModal } from './CalculateurSRPEModal';
import { extraireChargeReponse } from '../../utils/analytics';

type ModeVue = 'calendrier' | 'semaine' | 'saison' | 'liste';

export const SeancesView: React.FC = () => {
  const {
    seances,
    sportifs,
    equipes,
    questionnaires,
    reponses,
    phasesSaison,
    ajouterSeance,
    modifierSeance,
    supprimerSeance,
    modifierPhaseSaison,
    ajouterPhaseSaison,
  } = useApp();

  const [modeVue, setModeVue] = useState<ModeVue>('calendrier');
  const [modalAjoutOuvert, setModalAjoutOuvert] = useState(false);
  const [calculateurOuvert, setCalculateurOuvert] = useState(false);
  const [seanceEnEdition, setSeanceEnEdition] = useState<Seance | null>(null);
  const [seanceSelectionnee, setSeanceSelectionnee] = useState<Seance | null>(null);
  const [dateParDefautModal, setDateParDefautModal] = useState<string | undefined>(undefined);
  const [valeursInitialesModal, setValeursInitialesModal] = useState<{
    titre?: string;
    type?: Seance['type'];
    dureeMinutes?: number;
    rpePrevu?: number;
    description?: string;
  } | null>(null);

  const [filtreType, setFiltreType] = useState<string>('tous');
  const [filtreEquipe, setFiltreEquipe] = useState<string>('toutes');

  // Filtrer les séances pour la vue liste
  const seancesFiltrees = seances.filter((s) => {
    if (filtreType !== 'tous' && s.type !== filtreType) return false;
    if (filtreEquipe !== 'toutes' && s.equipeId !== filtreEquipe) return false;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOuvrirEdition = (s: Seance, e: React.MouseEvent) => {
    e.stopPropagation();
    setSeanceEnEdition(s);
    setDateParDefautModal(s.date);
    setValeursInitialesModal(null);
    setModalAjoutOuvert(true);
  };

  const handleAjouterDateSpecifique = (dateStr: string) => {
    setSeanceEnEdition(null);
    setDateParDefautModal(dateStr);
    setValeursInitialesModal(null);
    setModalAjoutOuvert(true);
  };

  const handleDeplacerSeance = (seanceId: string, nouvelleDate: string) => {
    modifierSeance(seanceId, { date: nouvelleDate });
  };

  const handleAjouterSeanceDepuisModele = (seanceData: Omit<Seance, 'id' | 'dateCreation'>) => {
    ajouterSeance(seanceData);
  };

  const handlePlanifierDepuisCalculateur = (params: { dureeMinutes: number; rpePrevu: number }) => {
    setSeanceEnEdition(null);
    setDateParDefautModal(new Date().toISOString().split('T')[0]);
    setValeursInitialesModal({
      dureeMinutes: params.dureeMinutes,
      rpePrevu: params.rpePrevu,
      titre: `Séance ciblée ${params.dureeMinutes * params.rpePrevu} UA`,
    });
    setModalAjoutOuvert(true);
  };

  const handleSupprimer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer cette séance ?')) {
      supprimerSeance(id);
    }
  };

  const handleSauvegarder = (
    seanceData: Omit<Seance, 'id' | 'dateCreation'>,
    repetitionsSemaines?: number
  ) => {
    if (seanceEnEdition) {
      modifierSeance(seanceEnEdition.id, seanceData);
    } else {
      ajouterSeance(seanceData);

      // Duplication sur les semaines suivantes si configuré
      if (repetitionsSemaines && repetitionsSemaines > 0) {
        const baseDate = new Date(seanceData.date + 'T00:00:00');
        for (let i = 1; i <= repetitionsSemaines; i++) {
          const nextDate = new Date(baseDate);
          nextDate.setDate(baseDate.getDate() + i * 7);
          const nextDateStr = nextDate.toISOString().split('T')[0];
          ajouterSeance({
            ...seanceData,
            date: nextDateStr,
            statut: 'Planifiée',
          });
        }
      }
    }
    setValeursInitialesModal(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la vue Planning & Séances */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CalendarCheck2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-white">Planning & Planification Saison</h1>
          </div>
          <p className="text-xs text-neutral-400">
            Calendrier interactif par glisser-déposer, périodisation macrocycle et calcul de charge sRPE (Foster)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton d'accès au Calculateur automatique sRPE */}
          <button
            type="button"
            onClick={() => setCalculateurOuvert(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors shadow-sm"
          >
            <Calculator className="h-4 w-4" />
            <span>Calculateur sRPE</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSeanceEnEdition(null);
              setDateParDefautModal(new Date().toISOString().split('T')[0]);
              setValeursInitialesModal(null);
              setModalAjoutOuvert(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
          >
            <Plus className="h-4 w-4" />
            <span>Planifier une Séance</span>
          </button>
        </div>
      </div>

      {/* Sélecteur d'onglets de vue du planning */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-neutral-900/90 p-1 border border-neutral-800">
          <button
            type="button"
            onClick={() => setModeVue('calendrier')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              modeVue === 'calendrier'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Calendrier Mois (Glisser-Déposer)</span>
          </button>

          <button
            type="button"
            onClick={() => setModeVue('semaine')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              modeVue === 'semaine'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Planning Semaine</span>
          </button>

          <button
            type="button"
            onClick={() => setModeVue('saison')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              modeVue === 'saison'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Planification Saison (Macrocycle)</span>
          </button>

          <button
            type="button"
            onClick={() => setModeVue('liste')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              modeVue === 'liste'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Liste & Fiches</span>
          </button>
        </div>

        {/* Rappel de la règle sRPE et raccourci */}
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <button
            type="button"
            onClick={() => setCalculateurOuvert(true)}
            className="flex items-center gap-1.5 text-emerald-400 hover:underline font-mono"
            title="Ouvrir le calculateur automatique sRPE (durée globale coach x RPE joueur)"
          >
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            <span>Foster : RPE athlète (1-10) × Durée coach (min) = UA</span>
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      {modeVue === 'calendrier' && (
        <PlanningCalendrierMois
          seances={seances}
          equipes={equipes}
          reponses={reponses}
          phasesSaison={phasesSaison}
          surSelectionnerSeance={(s) => setSeanceSelectionnee(s)}
          surAjouterSeanceDate={handleAjouterDateSpecifique}
          surModifierSeance={(s) => {
            setSeanceEnEdition(s);
            setDateParDefautModal(s.date);
            setValeursInitialesModal(null);
            setModalAjoutOuvert(true);
          }}
          surDeplacerSeance={handleDeplacerSeance}
          surAjouterSeanceDepuisModele={handleAjouterSeanceDepuisModele}
          surOuvrirCalculateurSRPE={() => setCalculateurOuvert(true)}
        />
      )}

      {modeVue === 'semaine' && (
        <PlanningSemaine
          seances={seances}
          equipes={equipes}
          reponses={reponses}
          phasesSaison={phasesSaison}
          surSelectionnerSeance={(s) => setSeanceSelectionnee(s)}
          surAjouterSeanceDate={handleAjouterDateSpecifique}
          surDeplacerSeance={handleDeplacerSeance}
          surAjouterSeanceDepuisModele={handleAjouterSeanceDepuisModele}
          surOuvrirCalculateurSRPE={() => setCalculateurOuvert(true)}
        />
      )}

      {modeVue === 'saison' && (
        <PlanificationSaisonMacrocycle
          seances={seances}
          phasesSaison={phasesSaison}
          reponses={reponses}
          surModifierPhase={modifierPhaseSaison}
          surAjouterPhase={ajouterPhaseSaison}
          surNaviguerVersSemaine={() => {
            setModeVue('semaine');
          }}
          surPlanifierSeanceDate={handleAjouterDateSpecifique}
        />
      )}

      {modeVue === 'liste' && (
        <div className="space-y-4">
          {/* Barre de filtres */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Filter className="h-3.5 w-3.5" />
              <span>Filtrer par :</span>
            </div>

            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="tous">Tous les types de séance</option>
              <option value="Entraînement">Entraînement collectif</option>
              <option value="Musculation">Musculation / Force</option>
              <option value="Cardio / VMA">Cardio / VMA</option>
              <option value="Technique / Tactique">Technique / Tactique</option>
              <option value="Match / Compétition">Match / Compétition</option>
              <option value="Récupération">Récupération</option>
            </select>

            <select
              value={filtreEquipe}
              onChange={(e) => setFiltreEquipe(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="toutes">Toutes les équipes</option>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nom}
                </option>
              ))}
            </select>

            <div className="ml-auto text-xs text-neutral-400">
              <span className="font-semibold text-white">{seancesFiltrees.length}</span> séance(s)
            </div>
          </div>

          {/* Liste des séances */}
          {seancesFiltrees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
              <CalendarCheck2 className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">Aucune séance trouvée</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Créez votre première séance d'entraînement pour démarrer le suivi séance par séance.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSeanceEnEdition(null);
                  setDateParDefautModal(new Date().toISOString().split('T')[0]);
                  setValeursInitialesModal(null);
                  setModalAjoutOuvert(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Créer une séance
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seancesFiltrees.map((s) => {
                const eq = equipes.find((e) => e.id === s.equipeId);
                const sportifsCibles = s.equipeId
                  ? sportifs.filter((sp) => sp.equipeId === s.equipeId)
                  : sportifs;

                // Réponses liées à cette séance
                const repsSeance = reponses.filter(
                  (r) =>
                    r.seanceId === s.id ||
                    (r.dateJour === s.date && r.questionnaireId === 'quest-rpe-seance')
                );

                const rpes = repsSeance
                  .map((r) => extraireChargeReponse(r)?.rpe)
                  .filter((r): r is number => r !== undefined && r !== null);
                const rpeMoyenReel = rpes.length > 0
                  ? Number((rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1))
                  : null;

                const charges = repsSeance
                  .map((r) => extraireChargeReponse(r)?.chargeUA)
                  .filter((c): c is number => c !== undefined && c !== null);
                const chargeMoyenneUA = charges.length > 0
                  ? Math.round(charges.reduce((a, b) => a + b, 0) / charges.length)
                  : null;

                const totalAlertes = repsSeance.reduce((acc, r) => acc + (r.alertes?.length || 0), 0);

                const deltaRpe = s.rpePrevu && rpeMoyenReel
                  ? Number((rpeMoyenReel - s.rpePrevu).toFixed(1))
                  : null;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSeanceSelectionnee(s)}
                    className="group relative cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge type et date */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                          {s.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                          <span>{s.date}</span>
                          {s.heureDebut && <span>{s.heureDebut}</span>}
                        </div>
                      </div>

                      {/* Titre et description */}
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mb-1 line-clamp-1">
                        {s.titre}
                      </h3>
                      {s.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                          {s.description}
                        </p>
                      )}

                      {/* Équipe et durée */}
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{s.dureeMinutes} min</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{eq ? eq.nom : 'Tous les sportifs'}</span>
                        </span>
                      </div>

                      {/* Métriques clés de la séance */}
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-950 p-2.5 mb-3 border border-neutral-800/80">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">RPE Prévu vs Réel</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs font-bold text-neutral-300">
                              {s.rpePrevu ? `${s.rpePrevu}` : '-'}
                            </span>
                            <span className="text-[10px] text-neutral-500">→</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {rpeMoyenReel !== null ? `${rpeMoyenReel}` : 'En attente'}
                            </span>
                          </div>
                          {deltaRpe !== null && (
                            <span
                              className={`text-[10px] font-semibold ${
                                deltaRpe > 0.5 ? 'text-amber-400' : 'text-neutral-400'
                              }`}
                            >
                              {deltaRpe > 0 ? `+${deltaRpe}` : deltaRpe} pts
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 block">Charge Moyenne</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-sm font-bold text-white">
                              {chargeMoyenneUA !== null ? `${chargeMoyenneUA}` : '-'}
                            </span>
                            <span className="text-[10px] text-neutral-500">UA</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 block">
                            {repsSeance.length}/{sportifsCibles.length} retours
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bas de carte avec alertes et actions */}
                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        {totalAlertes > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                            <AlertTriangle className="h-3 w-3" />
                            {totalAlertes} alerte(s)
                          </span>
                        ) : repsSeance.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Séance débriefée
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500">
                            Prête pour débriefing
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Modifier la séance"
                          onClick={(e) => handleOuvrirEdition(s, e)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Supprimer la séance"
                          onClick={(e) => handleSupprimer(s.id, e)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal d'ajout / modification de séance */}
      <SeanceModal
        ouvert={modalAjoutOuvert}
        surFermer={() => {
          setModalAjoutOuvert(false);
          setSeanceEnEdition(null);
          setDateParDefautModal(undefined);
          setValeursInitialesModal(null);
        }}
        surSauvegarder={handleSauvegarder}
        seanceEnEdition={seanceEnEdition}
        dateParDefaut={dateParDefautModal}
        valeursInitiales={valeursInitialesModal}
        equipes={equipes}
        questionnaires={questionnaires}
        phasesSaison={phasesSaison}
      />

      {/* Modal Détails & Débriefing de séance */}
      <SeanceDetailModal
        ouvert={!!seanceSelectionnee}
        surFermer={() => setSeanceSelectionnee(null)}
        seance={seanceSelectionnee}
        sportifs={sportifs}
        reponses={reponses}
        equipes={equipes}
      />

      {/* Modal Calculateur Automatique de sRPE */}
      <CalculateurSRPEModal
        ouvert={calculateurOuvert}
        surFermer={() => setCalculateurOuvert(false)}
        surPlanifierSeance={handlePlanifierDepuisCalculateur}
      />
    </div>
  );
};
