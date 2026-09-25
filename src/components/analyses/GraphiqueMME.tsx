import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Activity,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import { PointMME } from '../../types';

interface GraphiqueMMEProps {
  serieMME: PointMME[];
  titre?: string;
  nomSportif?: string;
}

export const GraphiqueMME: React.FC<GraphiqueMMEProps> = ({
  serieMME,
  titre = 'Moyennes Mobiles Exponentielles (MME 7j vs MME 28j)',
  nomSportif,
}) => {
  const [pointSurvole, setPointSurvole] = useState<PointMME | null>(null);
  const [afficherBarresCharge, setAfficherBarresCharge] = useState(true);
  const [modeVue, setModeVue] = useState<'mme' | 'ratio'>('mme');

  // Dernier point calculé
  const dernierPoint = serieMME[serieMME.length - 1];

  // Calcul des extrema pour la mise à l'échelle du SVG
  const { maxCharge, maxMME } = useMemo(() => {
    let mCharge = 100;
    let mMME = 100;

    serieMME.forEach((p) => {
      if (p.chargeJour > mCharge) mCharge = p.chargeJour;
      if (p.mme7j > mMME) mMME = p.mme7j;
      if (p.mme28j > mMME) mMME = p.mme28j;
    });

    return {
      maxCharge: Math.ceil((mCharge * 1.15) / 100) * 100,
      maxMME: Math.ceil((Math.max(mMME, mCharge * 0.8) * 1.2) / 100) * 100,
    };
  }, [serieMME]);

  // Dimensions SVG
  const svgWidth = 720;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingY = 30;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Fonctions de projection
  const getX = (index: number) => {
    if (serieMME.length <= 1) return paddingX;
    return paddingX + (index / (serieMME.length - 1)) * chartWidth;
  };

  const getY_MME = (val: number) => {
    const ratio = Math.min(1, Math.max(0, val / (maxMME || 1)));
    return paddingY + chartHeight - ratio * chartHeight;
  };

  const getY_Ratio = (ratio: number) => {
    // Échelle de ratio 0 à 2.2
    const maxRatio = 2.2;
    const r = Math.min(maxRatio, Math.max(0, ratio)) / maxRatio;
    return paddingY + chartHeight - r * chartHeight;
  };

  // Tracé des lignes MME 7j et MME 28j
  const pathMME7 = useMemo(() => {
    return serieMME.reduce((acc, point, index) => {
      const x = getX(index);
      const y = getY_MME(point.mme7j);
      return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [serieMME, maxMME]);

  const pathMME28 = useMemo(() => {
    return serieMME.reduce((acc, point, index) => {
      const x = getX(index);
      const y = getY_MME(point.mme28j);
      return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [serieMME, maxMME]);

  // Tracé de l'aire sous la courbe MME 7j
  const areaMME7 = useMemo(() => {
    if (serieMME.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(serieMME.length - 1);
    const bottomY = paddingY + chartHeight;
    return `${pathMME7} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathMME7, serieMME]);

  // Tracé du Ratio EWMA
  const pathRatio = useMemo(() => {
    return serieMME.reduce((acc, point, index) => {
      const x = getX(index);
      const y = getY_Ratio(point.ratioACWR_MME);
      return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [serieMME]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl space-y-4">
      {/* En-tête du widget MME */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-white">
              {titre} {nomSportif ? `— ${nomSportif}` : ''}
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Modèle EWMA (Exponentially Weighted Moving Average) : Aiguë λ=0.25 (7j) vs Chronique λ=0.069 (28j)
          </p>
        </div>

        {/* Boutons de bascule de vue */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
            <button
              type="button"
              onClick={() => setModeVue('mme')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                modeVue === 'mme'
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              MME 7j & 28j (UA)
            </button>
            <button
              type="button"
              onClick={() => setModeVue('ratio')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                modeVue === 'ratio'
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ratio Aiguë/Chronique (EWMA)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAfficherBarresCharge(!afficherBarresCharge)}
            title="Afficher/Masquer les charges journalières"
            className={`rounded-xl border p-1.5 text-xs transition-colors ${
              afficherBarresCharge
                ? 'border-neutral-700 bg-neutral-800 text-emerald-400'
                : 'border-neutral-800 bg-neutral-950 text-neutral-500'
            }`}
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cartes d'indicateurs instantanés MME */}
      {dernierPoint && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">MME 7 jours (Aiguë)</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-emerald-400">{dernierPoint.mme7j}</span>
              <span className="text-xs text-neutral-500">UA/j</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Fatigue immédiate</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">MME 28 jours (Chronique)</span>
              <span className="h-2 w-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-sky-400">{dernierPoint.mme28j}</span>
              <span className="text-xs text-neutral-500">UA/j</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Fitness de fond</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Ratio EWMA ACWR</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  dernierPoint.zone === 'optimale'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : dernierPoint.zone === 'faible'
                    ? 'bg-blue-500/20 text-blue-400'
                    : dernierPoint.zone === 'elevee'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {dernierPoint.zone.toUpperCase()}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-white">{dernierPoint.ratioACWR_MME}</span>
              <span className="text-xs text-neutral-500">indice</span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              {dernierPoint.ratioACWR_MME >= 0.8 && dernierPoint.ratioACWR_MME <= 1.3
                ? 'Zone optimale (0.8 - 1.3)'
                : dernierPoint.ratioACWR_MME > 1.5
                ? 'Pic critique (> 1.5)'
                : 'Sous-charge ou vigilance'}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <span className="text-[11px] text-neutral-400 block mb-1">Diagnostic Charge</span>
            <div className="flex items-center gap-1.5 mt-1">
              {dernierPoint.zone === 'optimale' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-400">Stimulus équilibré</span>
                </>
              ) : dernierPoint.zone === 'faible' ? (
                <>
                  <Info className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-blue-400">Charge basse (désentraîné)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-semibold text-rose-400">Risque de blessure élevé</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Sur {serieMME.length} jours d'historique
            </span>
          </div>
        </div>
      )}

      {/* Zone du Graphique SVG Interactif */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 select-none"
        >
          <defs>
            {/* Dégradé pour l'aire MME 7j */}
            <linearGradient id="mme7Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Zones de Sweet Spot pour le mode Ratio */}
            <linearGradient id="sweetSpotGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Lignes de repère horizontales */}
          {modeVue === 'mme' ? (
            <>
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const val = Math.round(maxMME * (1 - pct));
                const y = paddingY + pct * chartHeight;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#262626"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      fill="#737373"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            // Lignes et bandes de référence Ratio Gabbett (0.8, 1.3, 1.5)
            <>
              {/* Sweet spot rectangle (0.8 à 1.3) */}
              <rect
                x={paddingX}
                y={getY_Ratio(1.3)}
                width={chartWidth}
                height={getY_Ratio(0.8) - getY_Ratio(1.3)}
                fill="url(#sweetSpotGradient)"
              />
              {/* Zone critique (> 1.5) */}
              <rect
                x={paddingX}
                y={paddingY}
                width={chartWidth}
                height={getY_Ratio(1.5) - paddingY}
                fill="#f43f5e"
                fillOpacity="0.08"
              />

              {/* Ligne 1.5 (Danger) */}
              <line
                x1={paddingX}
                y1={getY_Ratio(1.5)}
                x2={svgWidth - paddingX}
                y2={getY_Ratio(1.5)}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={svgWidth - paddingX - 4}
                y={getY_Ratio(1.5) - 4}
                fill="#f43f5e"
                fontSize="9"
                textAnchor="end"
                fontWeight="bold"
              >
                1.5 Danger
              </text>

              {/* Ligne 1.3 (Haut sweet spot) */}
              <line
                x1={paddingX}
                y1={getY_Ratio(1.3)}
                x2={svgWidth - paddingX}
                y2={getY_Ratio(1.3)}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={svgWidth - paddingX - 4}
                y={getY_Ratio(1.3) - 4}
                fill="#10b981"
                fontSize="9"
                textAnchor="end"
              >
                1.3 Sweet spot
              </text>

              {/* Ligne 0.8 (Bas sweet spot) */}
              <line
                x1={paddingX}
                y1={getY_Ratio(0.8)}
                x2={svgWidth - paddingX}
                y2={getY_Ratio(0.8)}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={svgWidth - paddingX - 4}
                y={getY_Ratio(0.8) + 11}
                fill="#10b981"
                fontSize="9"
                textAnchor="end"
              >
                0.8
              </text>
            </>
          )}

          {/* Barres de charge journalière (en arrière-plan) */}
          {afficherBarresCharge &&
            serieMME.map((point, idx) => {
              const x = getX(idx);
              const barWidth = Math.max(3, chartWidth / serieMME.length - 4);
              const barHeight = (point.chargeJour / (maxMME || 1)) * chartHeight;
              const y = paddingY + chartHeight - Math.min(chartHeight, barHeight);

              return (
                <rect
                  key={`bar-${idx}`}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(0, paddingY + chartHeight - y)}
                  fill="#525252"
                  fillOpacity="0.45"
                  rx="1.5"
                />
              );
            })}

          {/* Mode MME : Courbes MME 7j et MME 28j */}
          {modeVue === 'mme' ? (
            <>
              {/* Aire sous MME 7j */}
              <path d={areaMME7} fill="url(#mme7Gradient)" />

              {/* Courbe MME 28j (Chronique) en cyan/bleu */}
              <path
                d={pathMME28}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Courbe MME 7j (Aiguë) en émeraude/vert */}
              <path
                d={pathMME7}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points sur la courbe MME 7j */}
              {serieMME.map((point, idx) => {
                const x = getX(idx);
                const y = getY_MME(point.mme7j);
                const estSurvole = pointSurvole?.date === point.date;
                return (
                  <circle
                    key={`dot7-${idx}`}
                    cx={x}
                    cy={y}
                    r={estSurvole ? 5 : 2.5}
                    fill="#10b981"
                    stroke="#0a0a0a"
                    strokeWidth="1.5"
                  />
                );
              })}
            </>
          ) : (
            // Mode Ratio EWMA
            <>
              <path
                d={pathRatio}
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {serieMME.map((point, idx) => {
                const x = getX(idx);
                const y = getY_Ratio(point.ratioACWR_MME);
                const estSurvole = pointSurvole?.date === point.date;
                return (
                  <circle
                    key={`dotR-${idx}`}
                    cx={x}
                    cy={y}
                    r={estSurvole ? 5 : 3}
                    fill={point.ratioACWR_MME > 1.5 ? '#f43f5e' : '#a855f7'}
                    stroke="#0a0a0a"
                    strokeWidth="1.5"
                  />
                );
              })}
            </>
          )}

          {/* Ligne verticale de survol */}
          {pointSurvole && (
            <line
              x1={getX(serieMME.findIndex((p) => p.date === pointSurvole.date))}
              y1={paddingY}
              x2={getX(serieMME.findIndex((p) => p.date === pointSurvole.date))}
              y2={paddingY + chartHeight}
              stroke="#e5e5e5"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
          )}

          {/* Zones interactives invisibles pour capture du hover */}
          {serieMME.map((point, idx) => {
            const x = getX(idx);
            const sliceWidth = chartWidth / serieMME.length;
            return (
              <rect
                key={`hit-${idx}`}
                x={x - sliceWidth / 2}
                y={paddingY}
                width={sliceWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setPointSurvole(point)}
                onMouseLeave={() => setPointSurvole(null)}
              />
            );
          })}

          {/* Libellés de dates sur l'axe X */}
          {serieMME.map((point, idx) => {
            // Afficher une étiquette tous les 4 ou 7 jours
            const step = serieMME.length > 20 ? 5 : 3;
            if (idx % step !== 0 && idx !== serieMME.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={`lbl-${idx}`}
                x={x}
                y={paddingY + chartHeight + 16}
                fill="#737373"
                fontSize="9"
                textAnchor="middle"
              >
                {point.nomJour}
              </text>
            );
          })}
        </svg>

        {/* Infobulle dynamique flottante au survol */}
        {pointSurvole && (
          <div className="absolute top-4 right-4 z-20 rounded-xl border border-neutral-700 bg-neutral-900/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
              <span className="font-bold text-white">{pointSurvole.nomJour}</span>
              <span className="text-[10px] text-neutral-400 font-mono">{pointSurvole.date}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">Charge brute du jour :</span>
              <span className="font-bold text-white">{pointSurvole.chargeJour} UA</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MME 7j (Aiguë) :
              </span>
              <span className="font-bold text-emerald-400">{pointSurvole.mme7j} UA</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                MME 28j (Chronique) :
              </span>
              <span className="font-bold text-sky-400">{pointSurvole.mme28j} UA</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800">
              <span className="text-purple-400 font-medium">Ratio EWMA (ACWR) :</span>
              <span
                className={`font-bold ${
                  pointSurvole.ratioACWR_MME > 1.5
                    ? 'text-rose-400'
                    : pointSurvole.ratioACWR_MME >= 0.8 && pointSurvole.ratioACWR_MME <= 1.3
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {pointSurvole.ratioACWR_MME}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Légende du graphique */}
      <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="font-medium text-neutral-300">MME 7 jours (Charge aiguë / Fatigue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-sky-400" />
            <span className="font-medium text-neutral-300">MME 28 jours (Charge chronique / Fitness)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-neutral-600 opacity-60" />
            <span>Charge quotidienne (sRPE Foster)</span>
          </div>
        </div>

        <div className="text-[11px] text-neutral-400">
          Formule Tim Gabbett EWMA : <span className="font-mono text-emerald-400">λ = 2 / (N + 1)</span>
        </div>
      </div>
    </div>
  );
};
