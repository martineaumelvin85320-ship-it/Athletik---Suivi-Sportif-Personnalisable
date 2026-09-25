import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  TrendingUp,
  Target,
  Edit2,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Plus,
  Settings,
  X,
  Info,
} from 'lucide-react';
import { Seance, PhaseSaison, ReponseQuestionnaire } from '../../types';
import {
  calculerMetriquesSemaineSRPE,
  calculerChargePrevueSeance,
} from '../../utils/analytics';

interface PlanificationSaisonMacrocycleProps {
  seances: Seance[];
  phasesSaison: PhaseSaison[];
  reponses: ReponseQuestionnaire[];
  surModifierPhase: (id: string, updates: Partial<PhaseSaison>) => void;
  surAjouterPhase: (phase: Omit<PhaseSaison, 'id'>) => PhaseSaison;
  surNaviguerVersSemaine?: (dateLundi: string) => void;
  surPlanifierSeanceDate: (date: string) => void;
}

export const PlanificationSaisonMacrocycle: React.FC<PlanificationSaisonMacrocycleProps> = ({
  seances,
  phasesSaison,
  reponses,
  surModifierPhase,
  surAjouterPhase,
  surNaviguerVersSemaine,
  surPlanifierSeanceDate,
}) => {
  const [modalEditionPhase, setModalEditionPhase] = useState<PhaseSaison | null>(null);
  const [formNom, setFormNom] = useState('');
  const [formDateDebut, setFormDateDebut] = useState('');
  const [formDateFin, setFormDateFin] = useState('');
  const [formObjectifUA, setFormObjectifUA] = useState(2800);
  const [formDescription, setFormDescription] = useState('');

  // Générer les 16 semaines représentatives de la saison (d'Août 2026 à Novembre 2026)
  // pour une lecture claire du calendrier et de la charge
  const dateDebutSaison = new Date('2026-08-03T00:00:00'); // Lundi 3 Août 2026

  const semainesSaison = Array.from({ length: 18 }, (_, index) => {
    const lundi = new Date(dateDebutSaison);
    lundi.setDate(dateDebutSaison.getDate() + index * 7);
    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);

    const dateLundiStr = lundi.toISOString().split('T')[0];
    const dateDimancheStr = dimanche.toISOString().split('T')[0];

    const stats = calculerMetriquesSemaineSRPE(dateLundiStr, seances, reponses);

    // Trouver la phase
    const phase =
      phasesSaison.find((p) => dateLundiStr >= p.dateDebut && dateLundiStr <= p.dateFin) ||
      phasesSaison[0];

    const objectifUA = phase?.objectifChargeHebdoUA ?? 2800;

    let statutCharge: 'optimale' | 'sous_charge' | 'surcharge' = 'optimale';
    if (stats.chargePrevueTotaleUA > objectifUA * 1.25) {
      statutCharge = 'surcharge';
    } else if (stats.chargePrevueTotaleUA < objectifUA * 0.7 && stats.chargePrevueTotaleUA > 0) {
      statutCharge = 'sous_charge';
    }

    return {
      numeroSemaine: index + 1,
      dateLundiStr,
      dateDimancheStr,
      lundi,
      dimanche,
      phase,
      stats,
      objectifUA,
      statutCharge,
    };
  });

  const ouvrirEditionPhase = (phase: PhaseSaison) => {
    setModalEditionPhase(phase);
    setFormNom(phase.nom);
    setFormDateDebut(phase.dateDebut);
    setFormDateFin(phase.dateFin);
    setFormObjectifUA(phase.objectifChargeHebdoUA);
    setFormDescription(phase.description || '');
  };

  const sauvegarderPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditionPhase) return;
    surModifierPhase(modalEditionPhase.id, {
      nom: formNom,
      dateDebut: formDateDebut,
      dateFin: formDateFin,
      objectifChargeHebdoUA: Number(formObjectifUA),
      description: formDescription,
    });
    setModalEditionPhase(null);
  };

  // Calculer la charge max pour la mise à l'échelle du graphique SVG
  const chargeMax = Math.max(
    3800,
    ...semainesSaison.map((s) => Math.max(s.stats.chargePrevueTotaleUA, s.objectifUA))
  );

  return (
    <div className="space-y-6">
      {/* En-tête de la planification saisonnière */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Target className="h-4 w-4" />
              </span>
              <h2 className="text-base font-bold text-white">
                Planification de la Saison 2026-2027 (Macrocycle)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Structurez vos blocs d’entraînement, fixez vos objectifs sRPE et contrôlez l’ondulation de la charge sur l’année.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs">
            <Flame className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-neutral-400">Principe de charge : </span>
              <strong className="text-white">sRPE Foster = RPE × Durée (min)</strong>
            </div>
          </div>
        </div>

        {/* Frise chronologique des phases de la saison */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-neutral-300 mb-2 flex items-center justify-between">
            <span>Phases & Périodisation de la saison (Cliquez pour modifier les dates ou charges cibles) :</span>
            <span className="text-[11px] text-neutral-400 font-normal">Août 2026 - Juin 2027</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {phasesSaison.map((phase) => (
              <div
                key={phase.id}
                onClick={() => ouvrirEditionPhase(phase)}
                className="group cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 hover:border-neutral-700 transition-all hover:bg-neutral-900/80"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: phase.couleur }}
                    />
                    <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                      {phase.nom}
                    </span>
                  </div>
                  <Edit2 className="h-3 w-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                  <span>
                    {phase.dateDebut} → {phase.dateFin}
                  </span>
                  <span className="font-mono font-bold text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                    Cible : {phase.objectifChargeHebdoUA} UA/sem
                  </span>
                </div>

                {phase.description && (
                  <p className="text-[10px] text-neutral-500 line-clamp-1">
                    {phase.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique SVG interactif de la charge sRPE sur la saison */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Courbe & Histogramme de Charge Hebdomadaire sRPE (Foster)</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Confrontation semaine par semaine : Charge sRPE Prévue (vert) vs Objectif de Phase (ligne pointillée)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span className="text-neutral-300">Charge Prévue (UA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-amber-400 border border-amber-400 border-dashed" />
              <span className="text-neutral-300">Objectif Phase (UA)</span>
            </div>
          </div>
        </div>

        {/* Visuel du graphique SVG */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px] h-[220px] relative flex flex-col justify-end pt-6">
            {/* Lignes horizontales d'échelle UA */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-neutral-500 border-b border-neutral-800">
              <div className="border-b border-neutral-800/50 pb-0.5 flex justify-between">
                <span>{chargeMax} UA</span>
              </div>
              <div className="border-b border-neutral-800/50 pb-0.5 flex justify-between">
                <span>{Math.round(chargeMax * 0.75)} UA</span>
              </div>
              <div className="border-b border-neutral-800/50 pb-0.5 flex justify-between">
                <span>{Math.round(chargeMax * 0.5)} UA</span>
              </div>
              <div className="border-b border-neutral-800/50 pb-0.5 flex justify-between">
                <span>{Math.round(chargeMax * 0.25)} UA</span>
              </div>
            </div>

            {/* Barres pour chaque semaine */}
            <div className="relative z-10 flex items-end justify-between h-[180px] px-4 gap-2">
              {semainesSaison.map((s) => {
                const hauteurBarre = Math.max(
                  6,
                  Math.round((s.stats.chargePrevueTotaleUA / chargeMax) * 160)
                );
                const hauteurObjectif = Math.round((s.objectifUA / chargeMax) * 160);

                const estSemaineActuelle =
                  new Date().toISOString().split('T')[0] >= s.dateLundiStr &&
                  new Date().toISOString().split('T')[0] <= s.dateDimancheStr;

                return (
                  <div
                    key={s.numeroSemaine}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    onClick={() => surNaviguerVersSemaine && surNaviguerVersSemaine(s.dateLundiStr)}
                  >
                    {/* Tooltip au survol */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                      <div className="rounded-lg bg-neutral-950 border border-neutral-700 p-2 text-center text-xs shadow-xl min-w-[140px]">
                        <div className="font-bold text-white">Semaine {s.numeroSemaine}</div>
                        <div className="text-[10px] text-neutral-400">
                          {s.dateLundiStr} → {s.dateDimancheStr}
                        </div>
                        <div className="text-emerald-400 font-mono font-bold mt-1">
                          Prévu : {s.stats.chargePrevueTotaleUA} UA
                        </div>
                        <div className="text-amber-400 font-mono text-[10px]">
                          Cible : {s.objectifUA} UA
                        </div>
                        <div className="text-neutral-400 text-[10px] mt-0.5">
                          {s.stats.nbSeances} séance{s.stats.nbSeances > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Trait de l'objectif sur la barre */}
                    <div
                      className="absolute w-full border-t-2 border-amber-400/80 border-dashed z-20 pointer-events-none"
                      style={{ bottom: `${hauteurObjectif}px` }}
                      title={`Objectif : ${s.objectifUA} UA`}
                    />

                    {/* Barre de charge sRPE prévue */}
                    <div
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        estSemaineActuelle
                          ? 'bg-emerald-400 ring-2 ring-emerald-300 shadow-lg shadow-emerald-500/20'
                          : s.stats.chargePrevueTotaleUA > s.objectifUA * 1.25
                          ? 'bg-rose-500 group-hover:bg-rose-400'
                          : 'bg-emerald-500 group-hover:bg-emerald-400'
                      }`}
                      style={{ height: `${hauteurBarre}px` }}
                    />

                    {/* Libellé semaine sous la barre */}
                    <span
                      className={`text-[10px] font-mono mt-2 ${
                        estSemaineActuelle ? 'font-bold text-emerald-400' : 'text-neutral-400'
                      }`}
                    >
                      S{s.numeroSemaine}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé des microcycles (Semaines de la saison) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3.5 bg-neutral-900/90">
          <div>
            <h3 className="text-sm font-bold text-white">
              Calendrier des Semaines de la Saison (Microcycles)
            </h3>
            <p className="text-xs text-neutral-400">
              Suivi de la charge d’entraînement sRPE, volumétrie et conformité aux objectifs
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Semaine</th>
                <th className="px-4 py-3 font-semibold">Dates (Lun - Dim)</th>
                <th className="px-4 py-3 font-semibold">Phase du Macrocycle</th>
                <th className="px-4 py-3 font-semibold text-right">Séances</th>
                <th className="px-4 py-3 font-semibold text-right">Charge sRPE Prévue</th>
                <th className="px-4 py-3 font-semibold text-right">Cible Phase</th>
                <th className="px-4 py-3 font-semibold text-center">Statut Charge</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {semainesSaison.map((s) => {
                const estSemaineActuelle =
                  new Date().toISOString().split('T')[0] >= s.dateLundiStr &&
                  new Date().toISOString().split('T')[0] <= s.dateDimancheStr;

                return (
                  <tr
                    key={s.numeroSemaine}
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      estSemaineActuelle ? 'bg-emerald-500/[0.04]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Semaine {s.numeroSemaine}</span>
                        {estSemaineActuelle && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                            En cours
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-neutral-400">
                      {s.dateLundiStr} → {s.dateDimancheStr}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: s.phase.couleur }}
                        />
                        <span className="text-white">{s.phase.nom}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {s.stats.nbSeances}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-white">
                        {s.stats.chargePrevueTotaleUA.toLocaleString()}{' '}
                        <span className="text-[10px] text-neutral-400 font-normal">UA</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-neutral-400">
                      {s.objectifUA.toLocaleString()} UA
                    </td>

                    <td className="px-4 py-3 text-center">
                      {s.stats.chargePrevueTotaleUA === 0 ? (
                        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                          Non planifiée
                        </span>
                      ) : s.statutCharge === 'surcharge' ? (
                        <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] text-rose-400 font-semibold">
                          Charge élevée (+25%)
                        </span>
                      ) : s.statutCharge === 'sous_charge' ? (
                        <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] text-sky-400 font-semibold">
                          Sous-charge (&lt;70%)
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                          Équilibrée (Cible atteinte)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => surPlanifierSeanceDate(s.dateLundiStr)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
                          title="Planifier une séance sur cette semaine"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        {surNaviguerVersSemaine && (
                          <button
                            type="button"
                            onClick={() => surNaviguerVersSemaine(s.dateLundiStr)}
                            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-neutral-800 transition-colors flex items-center gap-1"
                          >
                            <span>Planning</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition d'une Phase de Saison */}
      {modalEditionPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-400" />
                <span>Modifier la Phase de Saison</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalEditionPhase(null)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={sauvegarderPhase} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Nom de la phase</label>
                <input
                  type="text"
                  required
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Date de début</label>
                  <input
                    type="date"
                    required
                    value={formDateDebut}
                    onChange={(e) => setFormDateDebut(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Date de fin</label>
                  <input
                    type="date"
                    required
                    value={formDateFin}
                    onChange={(e) => setFormDateFin(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Objectif de Charge sRPE Hebdomadaire (UA)
                </label>
                <input
                  type="number"
                  min={500}
                  max={8000}
                  step={100}
                  required
                  value={formObjectifUA}
                  onChange={(e) => setFormObjectifUA(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:outline-none font-mono font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Recommandation : 2600-3200 UA en préparation spécifique, 2200-2600 UA en compétition.
                </p>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Description / Objectifs</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalEditionPhase(null)}
                  className="rounded-xl px-4 py-2 text-neutral-400 hover:bg-neutral-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-neutral-950 hover:bg-emerald-400"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
