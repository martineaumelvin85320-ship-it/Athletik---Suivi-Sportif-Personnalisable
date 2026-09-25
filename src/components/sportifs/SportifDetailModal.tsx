import React from 'react';
import {
  X,
  User,
  HeartPulse,
  Flame,
  AlertTriangle,
  Calendar,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Sportif, Equipe, ReponseQuestionnaire, Indicateur } from '../../types';
import {
  calculerScoreWellnessSportif,
  calculerACWR,
  extraireChargeReponse,
  calculerSerieMME,
} from '../../utils/analytics';
import { formaterValeurIndicateur } from '../../utils/evaluation';
import { GraphiqueMME } from '../analyses/GraphiqueMME';

interface SportifDetailModalProps {
  ouvert: boolean;
  surFermer: () => void;
  sportif: Sportif | null;
  equipe: Equipe | null;
  reponses: ReponseQuestionnaire[];
  indicateurs: Indicateur[];
  surPasserEnSportif: (id: string) => void;
}

export const SportifDetailModal: React.FC<SportifDetailModalProps> = ({
  ouvert,
  surFermer,
  sportif,
  equipe,
  reponses,
  indicateurs,
  surPasserEnSportif,
}) => {
  if (!ouvert || !sportif) return null;

  const indMap = new Map(indicateurs.map((i) => [i.id, i]));
  const reponsesSportif = reponses
    .filter((r) => r.sportifId === sportif.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const wellness = calculerScoreWellnessSportif(sportif.id, reponses);
  const acwr = calculerACWR(sportif.id, reponses);
  const serieMME = calculerSerieMME(sportif.id, reponses, 28);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full aspect-square bg-emerald-500/10 text-emerald-400 font-bold text-base ring-1 ring-emerald-500/30 shrink-0">
              {sportif.initiales}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {sportif.prenom} {sportif.nom}
                </h2>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    sportif.statut === 'Actif'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : sportif.statut === 'Blessé'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {sportif.statut}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {equipe ? equipe.nom : 'Sans équipe'} • {sportif.posteOuSpecialite || 'Spécialité libre'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                surPasserEnSportif(sportif.id);
                surFermer();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-neutral-700 transition-colors"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Tester sa vue mobile</span>
            </button>
            <button
              type="button"
              onClick={surFermer}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Corps */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Cartes KPI Sportif */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Score de forme */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-emerald-400" />
                  <span>Score de forme</span>
                </span>
                {wellness.tendance === 'hausse' ? (
                  <span className="flex items-center text-emerald-400 text-[10px]">
                    <TrendingUp className="h-3 w-3 mr-0.5" /> En hausse
                  </span>
                ) : wellness.tendance === 'baisse' ? (
                  <span className="flex items-center text-rose-400 text-[10px]">
                    <TrendingDown className="h-3 w-3 mr-0.5" /> En baisse
                  </span>
                ) : (
                  <span className="flex items-center text-neutral-400 text-[10px]">
                    <Minus className="h-3 w-3 mr-0.5" /> Stable
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-white">{wellness.scoreActuel}%</div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full ${
                    wellness.scoreActuel >= 70
                      ? 'bg-emerald-500'
                      : wellness.scoreActuel >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${wellness.scoreActuel}%` }}
                />
              </div>
            </div>

            {/* Ratio ACWR */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Ratio ACWR</span>
                </span>
                <span className="text-[10px] text-neutral-500">7j / 28j</span>
              </div>
              <div className="text-2xl font-black text-white">{acwr.ratioACWR}</div>
              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{acwr.descriptionZone}</p>
            </div>

            {/* Charge Aiguë 7j */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>Charge cumulée 7j</span>
                <span className="text-[10px] text-neutral-500">sRPE Foster</span>
              </div>
              <div className="text-2xl font-black text-white">{acwr.chargeAigue7j} <span className="text-xs font-normal text-neutral-400">UA</span></div>
              <p className="text-[11px] text-neutral-400 mt-1">
                {reponsesSportif.length} check-ins enregistrés
              </p>
            </div>
          </div>

          {/* Alertes récentes s'il y en a */}
          {reponsesSportif.some((r) => r.alertes && r.alertes.length > 0) && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Alertes récentes relevées pour cet athlète</span>
              </div>
              <div className="space-y-1.5">
                {reponsesSportif
                  .filter((r) => r.alertes && r.alertes.length > 0)
                  .slice(0, 3)
                  .flatMap((r) =>
                    r.alertes.map((a, idx) => (
                      <div
                        key={`${r.id}-${idx}`}
                        className="flex items-center justify-between rounded-lg bg-neutral-900/80 p-2 text-xs text-neutral-200"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              a.niveau === 'critique' ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/30 text-amber-300'
                            }`}
                          >
                            {a.niveau.toUpperCase()}
                          </span>
                          <span className="font-semibold text-white">{a.indicateurNom}</span>
                          <span className="text-neutral-400">({String(a.valeur)})</span>
                        </div>
                        <span className="text-[11px] text-neutral-400">{r.dateJour}</span>
                      </div>
                    ))
                  )}
              </div>
            </div>
          )}

          {/* Graphique MME 7j vs MME 28j de l'athlète */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Dynamique de Charge EWMA (MME 7j & 28j)
            </h3>
            <GraphiqueMME
              serieMME={serieMME}
              titre="Suivi MME 7j vs MME 28j"
              nomSportif={`${sportif.prenom} ${sportif.nom}`}
            />
          </div>

          {/* Historique des derniers check-ins */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Historique des réponses ({reponsesSportif.length})
            </h3>

            {reponsesSportif.length === 0 ? (
              <p className="text-xs text-neutral-500">Aucune réponse pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {reponsesSportif.map((rep) => {
                  const charge = extraireChargeReponse(rep);
                  return (
                    <div
                      key={rep.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="font-bold text-white">{rep.dateJour}</span>
                          <span className="text-neutral-500 text-[11px]">
                            {new Date(rep.date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {charge && (
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                            Charge : {charge.chargeUA} UA (RPE {charge.rpe} x {charge.duree} min)
                          </span>
                        )}
                      </div>

                      {/* Valeurs saisies */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {Object.entries(rep.valeurs).map(([indId, val]) => {
                          const ind = indMap.get(indId);
                          return (
                            <div key={indId} className="rounded-lg bg-neutral-900 p-2 border border-neutral-800/60">
                              <span className="text-[10px] text-neutral-400 block truncate">
                                {ind ? ind.nom : indId}
                              </span>
                              <span className="font-semibold text-neutral-200">
                                {ind ? formaterValeurIndicateur(ind, val) : String(val)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {rep.commentaireGeneral && (
                        <p className="text-xs text-neutral-400 italic bg-neutral-900/60 p-2 rounded-lg">
                          « {rep.commentaireGeneral} »
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
