import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LineChart,
  Flame,
  HeartPulse,
  Filter,
  Calendar,
  Layers,
  Info,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  extraireChargeReponse,
  calculerACWR,
  calculerScoreWellnessSportif,
  calculerSerieMME,
} from '../../utils/analytics';
import { GraphiqueMME } from './GraphiqueMME';

export const AnalysesView: React.FC = () => {
  const { sportifs, equipes, reponses, indicateurs } = useApp();

  const [selectionSportifId, setSelectionSportifId] = useState<string>('tous');
  const [indicateurSelectionneId, setIndicateurSelectionneId] = useState<string>('ind-fatigue');
  const [periodeJours, setPeriodeJours] = useState<number>(7);
  const [nbJoursMME, setNbJoursMME] = useState<number>(28);

  const indSelectionne = indicateurs.find((i) => i.id === indicateurSelectionneId) || indicateurs[0];
  const sportifSelectionne = sportifs.find((s) => s.id === selectionSportifId);

  // Calcul de la série MME 7j et MME 28j pour le graphique EWMA
  const serieMME = useMemo(() => {
    return calculerSerieMME(selectionSportifId, reponses, nbJoursMME);
  }, [selectionSportifId, reponses, nbJoursMME]);

  // Calcul des jours de la période
  const jours = Array.from({ length: periodeJours }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (periodeJours - 1 - i));
    const isoDate = d.toISOString().split('T')[0];
    const nomJour = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    return { date: isoDate, nom: nomJour };
  });

  // Calcul des valeurs de l'indicateur sélectionné par jour
  const donneesCourbe = jours.map((j) => {
    // Réponses pour ce jour
    let repsJour = reponses.filter((r) => r.dateJour === j.date);
    if (selectionSportifId !== 'tous') {
      repsJour = repsJour.filter((r) => r.sportifId === selectionSportifId);
    }

    // Récupération de la valeur de l'indicateur
    const valeurs = repsJour
      .map((r) => Number(r.valeurs[indSelectionne.id]))
      .filter((v) => !isNaN(v));

    const moyenne = valeurs.length > 0
      ? Number((valeurs.reduce((a, b) => a + b, 0) / valeurs.length).toFixed(1))
      : null;

    // Charge sRPE pour le même jour
    let chargeTotale = 0;
    repsJour.forEach((r) => {
      const c = extraireChargeReponse(r);
      if (c) chargeTotale += c.chargeUA;
    });

    return {
      date: j.date,
      nom: j.nom,
      valeurIndicateur: moyenne,
      charge: chargeTotale,
      nbReponses: repsJour.length,
    };
  });

  const valeursValides = donneesCourbe.map((d) => d.valeurIndicateur).filter((v): v is number => v !== null);
  const minVal = indSelectionne.echelleMin ?? 0;
  const maxVal = indSelectionne.echelleMax ?? (Math.max(...valeursValides, 10));

  // ACWR pour tous les sportifs
  const acwrSportifs = sportifs.map((s) => ({
    sportif: s,
    acwr: calculerACWR(s.id, reponses),
    wellness: calculerScoreWellnessSportif(s.id, reponses),
  }));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Analyses & Suivi des Tendances
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Visualisez la corrélation entre les charges d’entraînement, le ratio ACWR et vos métriques personnalisées.
          </p>
        </div>

        {/* Filtres d'analyses */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sélection athlète */}
          <select
            value={selectionSportifId}
            onChange={(e) => setSelectionSportifId(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="tous">Moyenne du groupe entier</option>
            {sportifs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.prenom} {s.nom}
              </option>
            ))}
          </select>

          {/* Période */}
          <select
            value={periodeJours}
            onChange={(e) => setPeriodeJours(Number(e.target.value))}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value={7}>7 derniers jours</option>
            <option value={14}>14 derniers jours</option>
            <option value={30}>30 derniers jours</option>
          </select>
        </div>
      </div>

      {/* 1. NOUVEAU : Graphique des MME sur 7 jours et MME sur 28 jours (EWMA) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Modèle MME 7j & MME 28j (Moyennes Mobiles Exponentielles)
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setNbJoursMME(14)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                nbJoursMME === 14 ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              14 jours
            </button>
            <button
              type="button"
              onClick={() => setNbJoursMME(28)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                nbJoursMME === 28 ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              28 jours (Standard)
            </button>
            <button
              type="button"
              onClick={() => setNbJoursMME(42)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                nbJoursMME === 42 ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              42 jours (Cycle)
            </button>
          </div>
        </div>

        <GraphiqueMME
          serieMME={serieMME}
          nomSportif={sportifSelectionne ? `${sportifSelectionne.prenom} ${sportifSelectionne.nom}` : 'Collectif (Moyenne Équipe)'}
        />
      </div>

      {/* 2. Sélecteur d'indicateur pour le graphique personnalisé */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-4 border-t border-neutral-800">
        <span className="text-neutral-400 font-semibold shrink-0">Indicateur analysé :</span>
        {indicateurs
          .filter((i) => i.type.startsWith('echelle_') || i.type === 'numerique')
          .map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => setIndicateurSelectionneId(ind.id)}
              className={`rounded-xl px-3 py-1.5 font-medium whitespace-nowrap transition-colors border ${
                indicateurSelectionneId === ind.id
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {ind.nom}
            </button>
          ))}
      </div>

      {/* Graphique interactif d'évolution */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Évolution : {indSelectionne.nom}</span>
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs font-mono text-emerald-400 font-normal">
                Échelle [{minVal} - {maxVal}]
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {selectionSportifId === 'tous'
                ? 'Moyenne collective sur la période'
                : `Courbe individuelle de l'athlète sélectionné`}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>{indSelectionne.nom}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="h-3 w-3 rounded bg-neutral-700" />
              <span>Charge séance (UA)</span>
            </div>
          </div>
        </div>

        {/* Visualisation graphique avec SVG + Barres */}
        <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-6">
          {donneesCourbe.map((d, index) => {
            const val = d.valeurIndicateur;
            const pctVal = val !== null
              ? Math.max(5, Math.min(100, Math.round(((val - minVal) / Math.max(1, maxVal - minVal)) * 100)))
              : 0;

            const pctCharge = Math.max(0, Math.min(100, Math.round((d.charge / 1200) * 100)));

            return (
              <div
                key={d.date}
                className="group relative flex-1 flex flex-col items-center justify-end h-full"
              >
                {/* Info bulle hover */}
                <div className="pointer-events-none absolute -top-12 z-20 hidden rounded-lg bg-neutral-950 border border-neutral-700 px-2.5 py-1 text-[10px] text-white shadow-xl group-hover:flex flex-col items-center whitespace-nowrap">
                  <span className="font-bold text-emerald-400">{d.nom}</span>
                  <span>{indSelectionne.nom} : {val !== null ? val : 'N/A'}</span>
                  <span className="text-neutral-400">Charge : {d.charge} UA</span>
                </div>

                {/* Barre de charge en arrière-plan */}
                <div
                  className="w-full max-w-[28px] bg-neutral-800/60 rounded-t group-hover:bg-neutral-700/60 transition-colors"
                  style={{ height: `${pctCharge}%` }}
                />

                {/* Point / Indicateur en premier plan */}
                {val !== null && (
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-neutral-950 shadow-md transform -translate-y-1/2 group-hover:scale-125 transition-transform"
                    style={{ bottom: `${pctVal}%` }}
                  />
                )}

                {/* Date en dessous */}
                <div className="mt-3 text-[10px] text-neutral-500 group-hover:text-neutral-300 font-mono">
                  {d.nom.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matrice de Suivi de Charge ACWR (Acute:Chronic Workload Ratio) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Matrice des Ratios ACWR (Charge Aiguë 7j / Chronique 28j)
              </h3>
              <p className="text-xs text-neutral-400">
                L’indicateur de référence en sciences du sport pour prévenir les blessures de surmenage (Gabbett, 2016).
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-semibold">
              0.8 - 1.3 : Optimal
            </span>
            <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 font-semibold">
              1.3 - 1.5 : Risque modéré
            </span>
            <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 font-semibold">
              &gt; 1.5 : Zone de danger
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {acwrSportifs.map(({ sportif, acwr, wellness }) => (
            <div
              key={sportif.id}
              className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {sportif.prenom} {sportif.nom}
                  </h4>
                  <p className="text-[11px] text-neutral-400">{sportif.posteOuSpecialite}</p>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 font-mono text-sm font-bold ${
                    acwr.zone === 'optimale'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : acwr.zone === 'elevee'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : acwr.zone === 'critique'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {acwr.ratioACWR}
                </span>
              </div>

              {/* Jauge visuelle ACWR */}
              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>Charge Aiguë : {acwr.chargeAigue7j} UA</span>
                  <span>Chronique : {acwr.chargeChronique28j} UA</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden flex">
                  <div
                    className={`h-full ${
                      acwr.zone === 'optimale'
                        ? 'bg-emerald-500'
                        : acwr.zone === 'elevee'
                        ? 'bg-amber-500'
                        : acwr.zone === 'critique'
                        ? 'bg-rose-500'
                        : 'bg-neutral-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((acwr.ratioACWR / 2.0) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-neutral-400">
                {acwr.descriptionZone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
