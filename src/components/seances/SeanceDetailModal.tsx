import React from 'react';
import {
  X,
  CalendarCheck2,
  Clock,
  Flame,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Info,
} from 'lucide-react';
import { Seance, Sportif, ReponseQuestionnaire, Equipe } from '../../types';
import { extraireChargeReponse } from '../../utils/analytics';

interface SeanceDetailModalProps {
  ouvert: boolean;
  surFermer: () => void;
  seance: Seance | null;
  sportifs: Sportif[];
  reponses: ReponseQuestionnaire[];
  equipes: Equipe[];
}

export const SeanceDetailModal: React.FC<SeanceDetailModalProps> = ({
  ouvert,
  surFermer,
  seance,
  sportifs,
  reponses,
  equipes,
}) => {
  if (!ouvert || !seance) return null;

  const equipeAssociee = equipes.find((e) => e.id === seance.equipeId);

  // Filtrer les sportifs concernés par cette séance
  const sportifsConcernes = seance.equipeId
    ? sportifs.filter((s) => s.equipeId === seance.equipeId)
    : sportifs;

  // Filtrer les réponses associées à cette séance (soit par seanceId explicite, soit par dateJour + type post-séance)
  const reponsesSeance = reponses.filter(
    (r) =>
      r.seanceId === seance.id ||
      (r.dateJour === seance.date && r.questionnaireId === 'quest-rpe-seance')
  );

  // Agréger les données par sportif
  const participantsData = sportifsConcernes.map((sp) => {
    const rep = reponsesSeance.find((r) => r.sportifId === sp.id);
    const chargeInfo = rep ? extraireChargeReponse(rep, seance) : null;
    const rpe = chargeInfo ? chargeInfo.rpe : null;
    // La durée est celle notée par le coach pour toute la séance dans son ensemble (non temps effectif)
    const duree = seance.dureeMinutes;
    const chargeUA = rpe !== null ? Math.round(rpe * seance.dureeMinutes) : null;
    const note = rep?.valeurs?.['ind-notes-sensations'] || rep?.commentaireGeneral || '';
    const alertes = rep?.alertes || [];

    const deltaRpe = rpe !== null && seance.rpePrevu !== undefined ? Number((rpe - seance.rpePrevu).toFixed(1)) : null;

    return {
      sportif: sp,
      repondu: !!rep,
      rpe,
      duree,
      chargeUA,
      deltaRpe,
      note,
      alertes,
      reponseObj: rep,
    };
  });

  const repondusList = participantsData.filter((p) => p.repondu);
  const tauxParticipation = sportifsConcernes.length > 0
    ? Math.round((repondusList.length / sportifsConcernes.length) * 100)
    : 0;

  const sommeRpe = repondusList.reduce((acc, p) => acc + (p.rpe || 0), 0);
  const rpeMoyen = repondusList.length > 0 ? Number((sommeRpe / repondusList.length).toFixed(1)) : 0;

  const sommeCharge = repondusList.reduce((acc, p) => acc + (p.chargeUA || 0), 0);
  const chargeMoyenne = repondusList.length > 0 ? Math.round(sommeCharge / repondusList.length) : 0;

  const totalAlertes = repondusList.reduce((acc, p) => acc + p.alertes.length, 0);

  const deltaCoach = seance.rpePrevu ? Number((rpeMoyen - seance.rpePrevu).toFixed(1)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête de la séance */}
        <div className="flex items-start justify-between border-b border-neutral-800 p-6 bg-neutral-950/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                {seance.type}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {seance.date} {seance.heureDebut ? `à ${seance.heureDebut}` : ''}
              </span>
              {equipeAssociee ? (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {equipeAssociee.nom}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                  Tous les sportifs
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{seance.titre}</h2>
            {seance.description && (
              <p className="text-xs text-neutral-300 max-w-xl">{seance.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={surFermer}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps avec métriques de séance */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Grille des KPIs de la séance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">RPE Moyen Réel</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{rpeMoyen || '-'}</span>
                <span className="text-xs text-neutral-500">/ 10</span>
              </div>
              {seance.rpePrevu !== undefined && rpeMoyen > 0 && (
                <div
                  className={`mt-1 text-[11px] font-medium flex items-center gap-1 ${
                    deltaCoach > 0.5
                      ? 'text-amber-400'
                      : deltaCoach < -0.5
                      ? 'text-blue-400'
                      : 'text-emerald-400'
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {deltaCoach > 0 ? `+${deltaCoach}` : deltaCoach} vs coach ({seance.rpePrevu})
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">Charge Moy. par Athlète</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">{chargeMoyenne || '-'}</span>
                <span className="text-xs text-neutral-500">UA</span>
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1">
                Total : {sommeCharge} UA
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">Taux de Débrief</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{tauxParticipation}%</span>
                <span className="text-xs text-neutral-500">
                  ({repondusList.length}/{sportifsConcernes.length})
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1">
                Durée globale coach : {seance.dureeMinutes} min
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <span className="text-[11px] text-neutral-400 block mb-1">Alertes Déclenchées</span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold ${
                    totalAlertes > 0 ? 'text-rose-400' : 'text-neutral-400'
                  }`}
                >
                  {totalAlertes}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1">
                {totalAlertes > 0 ? 'À contrôler' : 'Aucune anomalie'}
              </span>
            </div>
          </div>

          {/* Note méthodologique Foster sur la durée globale fixée par le coach */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 flex items-start gap-2.5 text-xs text-neutral-400">
            <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-200">Méthodologie Foster (sRPE) : </span>
              Le temps de séance n'est <strong>pas un temps effectif</strong> individuel. La séance est prise dans son ensemble (<strong>{seance.dureeMinutes} min</strong>), <strong>notée exclusivement par le coach</strong> pour tout le groupe. Les joueurs renseignent uniquement leur RPE d'effort perçu.
            </div>
          </div>

          {/* Analyse comparative Coach vs Athlètes */}
          {seance.rpePrevu !== undefined && rpeMoyen > 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
              <h3 className="text-xs font-semibold text-neutral-200 mb-2 flex items-center justify-between">
                <span>Confrontation Intensité Prévue vs Réellement Ressentie</span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  Écart global : {deltaCoach > 0 ? `+${deltaCoach}` : deltaCoach} pts RPE
                </span>
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">RPE ciblé par le coach :</span>
                    <span className="font-bold text-neutral-200">{seance.rpePrevu} / 10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-neutral-500 rounded-full"
                      style={{ width: `${(seance.rpePrevu / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">RPE ressenti moyen par les sportifs :</span>
                    <span className="font-bold text-emerald-400">{rpeMoyen} / 10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        deltaCoach > 1 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(rpeMoyen / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tableau détaillé séance par séance des sportifs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Débriefing individuel des sportifs ({repondusList.length}/{sportifsConcernes.length})
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Sportif</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3">RPE ressenti</th>
                    <th className="py-3 px-3">Écart prévu</th>
                    <th className="py-3 px-3">Durée séance (coach)</th>
                    <th className="py-3 px-3">Charge UA</th>
                    <th className="py-3 px-4">Retour / Sensations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {participantsData.map((item) => (
                    <tr
                      key={item.sportif.id}
                      className="hover:bg-neutral-900/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-[11px] font-bold text-emerald-400">
                            {item.sportif.initiales}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">
                              {item.sportif.prenom} {item.sportif.nom}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {item.sportif.posteOuSpecialite}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {item.repondu ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Débriefé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                            En attente
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-medium">
                        {item.rpe !== null ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold ${
                              item.rpe >= 9
                                ? 'bg-rose-500/20 text-rose-400'
                                : item.rpe >= 7
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {item.rpe} / 10
                          </span>
                        ) : (
                          <span className="text-neutral-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {item.deltaRpe !== null ? (
                          <span
                            className={`text-xs font-mono font-semibold ${
                              item.deltaRpe > 1
                                ? 'text-amber-400'
                                : item.deltaRpe < -1
                                ? 'text-blue-400'
                                : 'text-neutral-400'
                            }`}
                          >
                            {item.deltaRpe > 0 ? `+${item.deltaRpe}` : item.deltaRpe}
                          </span>
                        ) : (
                          <span className="text-neutral-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-neutral-300">
                        {item.duree ? `${item.duree} min` : '-'}
                      </td>

                      <td className="py-3 px-3 font-bold text-white">
                        {item.chargeUA ? `${item.chargeUA} UA` : '-'}
                      </td>

                      <td className="py-3 px-4">
                        {item.alertes.length > 0 && (
                          <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-rose-400">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{item.alertes[0].message}</span>
                          </div>
                        )}
                        {item.note ? (
                          <p className="text-[11px] text-neutral-300 italic">
                            "{item.note}"
                          </p>
                        ) : (
                          <span className="text-[11px] text-neutral-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pied de modal */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 p-4 bg-neutral-950">
          <button
            type="button"
            onClick={surFermer}
            className="rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
