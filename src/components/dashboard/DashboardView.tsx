import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Activity,
  AlertTriangle,
  Flame,
  HeartPulse,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  Sliders,
  ClipboardList,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  CalendarCheck2,
} from 'lucide-react';
import { calculerScoreWellnessSportif, calculerACWR, extraireChargeReponse } from '../../utils/analytics';
import { MenuId } from '../layout/Sidebar';

interface DashboardViewProps {
  onNaviguer: (menu: MenuId) => void;
  onSelectionnerSportif: (sportifId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNaviguer,
  onSelectionnerSportif,
}) => {
  const { sportifs, equipes, reponses, indicateurs, questionnaires, seances } = useApp();
  const [filtreEquipeId, setFiltreEquipeId] = useState<string>('tous');

  const dateAujourdhui = new Date().toISOString().split('T')[0];

  // Filtrer les sportifs selon l'équipe sélectionnée
  const sportifsVisibles = sportifs.filter(
    (s) => filtreEquipeId === 'tous' || s.equipeId === filtreEquipeId
  );
  const sportifsIdsVisibles = new Set(sportifsVisibles.map((s) => s.id));

  // Réponses du jour
  const reponsesDuJour = reponses.filter(
    (r) => r.dateJour === dateAujourdhui && sportifsIdsVisibles.has(r.sportifId)
  );

  // Sportifs ayant répondu aujourd'hui
  const sportifsAyantRepondu = new Set(reponsesDuJour.map((r) => r.sportifId));
  const tauxReponse = sportifsVisibles.length > 0
    ? Math.round((sportifsAyantRepondu.size / sportifsVisibles.length) * 100)
    : 0;

  // Alertes du jour
  const alertesDuJour = reponsesDuJour.flatMap((r) =>
    (r.alertes || []).map((a) => ({
      ...a,
      sportifId: r.sportifId,
      date: r.date,
    }))
  );
  const alertesCritiques = alertesDuJour.filter((a) => a.niveau === 'critique');

  // Charge totale et moyenne 7j
  let chargeTotal7j = 0;
  let scoreFormeCumul = 0;
  let countForme = 0;

  sportifsVisibles.forEach((s) => {
    const acwr = calculerACWR(s.id, reponses);
    chargeTotal7j += acwr.chargeAigue7j;
    const well = calculerScoreWellnessSportif(s.id, reponses);
    scoreFormeCumul += well.scoreActuel;
    countForme++;
  });

  const chargeMoyenne7j = sportifsVisibles.length > 0 ? Math.round(chargeTotal7j / sportifsVisibles.length) : 0;
  const formeMoyenne = countForme > 0 ? Math.round(scoreFormeCumul / countForme) : 0;

  // Données d'évolution sur les 7 derniers jours
  const septDerniersJours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const jourStr = d.toISOString().split('T')[0];
    const nomJour = d.toLocaleDateString('fr-FR', { weekday: 'short' });

    // Calcul charge ce jour pour sportifs visibles
    const repsJour = reponses.filter((r) => r.dateJour === jourStr && sportifsIdsVisibles.has(r.sportifId));
    let chargeJour = 0;
    repsJour.forEach((r) => {
      const c = extraireChargeReponse(r);
      if (c) chargeJour += c.chargeUA;
    });

    return {
      date: jourStr,
      nom: nomJour.charAt(0).toUpperCase() + nomJour.slice(1, 3),
      charge: chargeJour,
      nbReponses: repsJour.length,
    };
  });

  const maxChargeJour = Math.max(...septDerniersJours.map((j) => j.charge), 500);

  return (
    <div className="space-y-6">
      {/* Barre supérieure du dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Tableau de Bord des Entraînements
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Supervision du bien-être, de la charge d’entraînement et des alertes biométriques en temps réel.
          </p>
        </div>

        {/* Filtre par équipe */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-neutral-400">Filtrer par :</span>
          <select
            value={filtreEquipeId}
            onChange={(e) => setFiltreEquipeId(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="tous">Tous les groupes ({sportifs.length})</option>
            {equipes.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes KPI Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Taux de réponse du jour */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Check-ins du Jour</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ClipboardList className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{tauxReponse}%</span>
            <span className="text-xs text-neutral-400">
              ({sportifsAyantRepondu.size} / {sportifsVisibles.length})
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${tauxReponse}%` }}
            />
          </div>
        </div>

        {/* KPI 2 : Alertes actives */}
        <div
          className={`rounded-2xl border p-5 shadow-sm transition-all ${
            alertesCritiques.length > 0
              ? 'border-rose-500/40 bg-rose-500/10'
              : alertesDuJour.length > 0
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-neutral-800 bg-neutral-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className={alertesCritiques.length > 0 ? 'text-rose-300 font-semibold' : ''}>
              Alertes Détectées
            </span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                alertesCritiques.length > 0
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                alertesCritiques.length > 0 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {alertesDuJour.length}
            </span>
            {alertesCritiques.length > 0 && (
              <span className="text-xs font-semibold text-rose-300">
                dont {alertesCritiques.length} critique{alertesCritiques.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-neutral-400">
            {alertesDuJour.length === 0
              ? 'Aucune anomalie signalée'
              : 'Vérifiez les athlètes concernés ci-dessous'}
          </p>
        </div>

        {/* KPI 3 : Forme Moyenne Groupe */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Score de Forme Moyen</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <HeartPulse className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{formeMoyenne}%</span>
            <span className="text-xs text-emerald-400 font-medium">Readiness</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className={`h-full ${
                formeMoyenne >= 70 ? 'bg-emerald-500' : formeMoyenne >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${formeMoyenne}%` }}
            />
          </div>
        </div>

        {/* KPI 4 : Charge Moyenne 7j */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Charge Aiguë Moyenne (7j)</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{chargeMoyenne7j}</span>
            <span className="text-xs text-neutral-400 font-medium">UA / athlète</span>
          </div>
          <p className="mt-3 text-[11px] text-neutral-400">
            Calcul Foster : RPE perçu × Durée en minutes
          </p>
        </div>
      </div>

      {/* Section Graphique Charge Hebdo + Alertes en temps réel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graphique d'évolution de la charge sur 7 jours (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Volume de Charge Collectif (7 derniers jours)
                </h3>
                <p className="text-xs text-neutral-400">
                  Somme quotidienne des charges de séance (sRPE) pour le groupe
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNaviguer('analyses')}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <span>Analyses détaillées</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Visualisation Barres CSS */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-7 gap-2 h-44 items-end">
                {septDerniersJours.map((j) => {
                  const hauteurPct = Math.max(8, Math.round((j.charge / maxChargeJour) * 100));
                  const estAujourdhui = j.date === dateAujourdhui;
                  return (
                    <div key={j.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {j.charge} UA
                      </div>
                      <div className="w-full h-full max-h-36 flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            estAujourdhui
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20'
                              : 'bg-neutral-700/80 hover:bg-neutral-600'
                          }`}
                          style={{ height: `${hauteurPct}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <span
                          className={`text-xs font-semibold ${
                            estAujourdhui ? 'text-emerald-400' : 'text-neutral-400'
                          }`}
                        >
                          {j.nom}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
              <span>Aujourd’hui</span>
            </span>
            <span>Total 7j : {chargeTotal7j} UA</span>
          </div>
        </div>

        {/* Flux des alertes et anomalies (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Alertes du Jour</h3>
              </div>
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                {alertesDuJour.length}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Alertes automatiques issues de vos seuils d’indicateurs personnalisés
            </p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {alertesDuJour.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-6 text-center text-xs text-neutral-400">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400 mb-1.5" />
                  <span>Tous les voyants sont au vert. Aucun seuil critique n’a été franchi ce jour.</span>
                </div>
              ) : (
                alertesDuJour.map((al, idx) => {
                  const sp = sportifs.find((s) => s.id === al.sportifId);
                  return (
                    <div
                      key={idx}
                      onClick={() => sp && onSelectionnerSportif(sp.id)}
                      className={`cursor-pointer rounded-xl p-3 border transition-colors ${
                        al.niveau === 'critique'
                          ? 'border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20'
                          : 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {sp ? `${sp.prenom} ${sp.nom}` : 'Athlète'}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            al.niveau === 'critique'
                              ? 'bg-rose-500/30 text-rose-300'
                              : 'bg-amber-500/30 text-amber-300'
                          }`}
                        >
                          {al.niveau.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-200 mt-1 font-medium">
                        {al.indicateurNom} : <span className="font-mono">{String(al.valeur)}</span>
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{al.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => onNaviguer('historique')}
              className="w-full rounded-xl bg-neutral-800/80 py-2 text-center text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              Consulter l’historique complet des réponses
            </button>
          </div>
        </div>
      </div>

      {/* Bannière d'accès direct Séance par séance et Modèle MME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Carte Séances récentes & Planning */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CalendarCheck2 className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Planning & Planification Saison</h3>
              </div>
              <span className="text-xs text-neutral-400 font-semibold">
                {seances.length} séance(s)
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Planification saisonnière, calendrier d'entraînement et charge sRPE (Foster : RPE × Durée).
            </p>
            <div className="space-y-2">
              {seances.slice(0, 2).map((s) => {
                const chargeUA = (s.rpePrevu ?? 5) * (s.dureeMinutes ?? 60);
                return (
                  <div
                    key={s.id}
                    onClick={() => onNaviguer('seances')}
                    className="cursor-pointer flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {s.type}
                      </span>
                      <span className="text-xs font-semibold text-white">{s.titre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {chargeUA} UA
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">{s.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNaviguer('seances')}
            className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl bg-neutral-800 py-2 text-xs font-semibold text-emerald-400 hover:bg-neutral-700 transition-colors"
          >
            <span>Accéder au Planning & Calendrier Saison</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Carte MME 7j & 28j */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  <Activity className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Moyennes Mobiles Exponentielles (MME)</h3>
              </div>
              <span className="text-[10px] font-bold rounded bg-sky-500/20 text-sky-300 px-2 py-0.5">
                EWMA 7j / 28j
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Détectez les pics de fatigue aiguë (MME 7j) par rapport au niveau de forme chronique (MME 28j).
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-950 p-3 border border-neutral-800/80">
              <div>
                <span className="text-[10px] text-neutral-400 block">Modèle Aigu (λ = 0.25)</span>
                <span className="text-sm font-bold text-emerald-400">MME 7 jours</span>
                <span className="text-[10px] text-neutral-500 block">Fatigue & stress d'effort</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">Modèle Chronique (λ = 0.069)</span>
                <span className="text-sm font-bold text-sky-400">MME 28 jours</span>
                <span className="text-[10px] text-neutral-500 block">Capacité & forme aérobie</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNaviguer('analyses')}
            className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl bg-neutral-800 py-2 text-xs font-semibold text-sky-400 hover:bg-neutral-700 transition-colors"
          >
            <span>Consulter le graphique des MME</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Matrice des check-ins des sportifs (Tableau récapitulatif du jour) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              État de Forme & Check-ins du Jour
            </h3>
            <p className="text-xs text-neutral-400">
              Vue synthétique de l’ensemble des athlètes avec voyants de statut
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNaviguer('sportifs')}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium self-start sm:self-auto"
          >
            <span>Voir tout l’effectif</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Sportif</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Check-in Matin</th>
                <th className="py-3 px-4">Score Forme</th>
                <th className="py-3 px-4">ACWR (7j/28j)</th>
                <th className="py-3 px-4">Charge Aiguë</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {sportifsVisibles.map((sp) => {
                const repJour = reponses.find(
                  (r) => r.sportifId === sp.id && r.dateJour === dateAujourdhui
                );
                const aRepondu = !!repJour;
                const well = calculerScoreWellnessSportif(sp.id, reponses);
                const acwr = calculerACWR(sp.id, reponses);

                return (
                  <tr
                    key={sp.id}
                    className="hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full aspect-square bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-500/20 shrink-0">
                          {sp.initiales}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {sp.prenom} {sp.nom}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {sp.posteOuSpecialite || 'Sportif'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          sp.statut === 'Actif'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : sp.statut === 'Blessé'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {sp.statut}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {aRepondu ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Rempli</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>En attente</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{well.scoreActuel}%</span>
                        <div className="h-1.5 w-14 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              well.scoreActuel >= 70
                                ? 'bg-emerald-500'
                                : well.scoreActuel >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${well.scoreActuel}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-semibold ${
                          acwr.zone === 'optimale'
                            ? 'text-emerald-400'
                            : acwr.zone === 'elevee'
                            ? 'text-amber-400'
                            : acwr.zone === 'critique'
                            ? 'text-rose-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        {acwr.ratioACWR}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-300">
                      {acwr.chargeAigue7j} UA
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectionnerSportif(sp.id)}
                        className="rounded-lg bg-neutral-800 px-2.5 py-1 text-[11px] font-semibold text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
