import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Table,
  Layers,
  Calendar,
} from 'lucide-react';
import { exporterVersExcel } from '../../utils/exportExcel';

export const ExportExcelView: React.FC = () => {
  const { equipes, sportifs, indicateurs, questionnaires, reponses, seances } = useApp();

  const [filtreEquipeId, setFiltreEquipeId] = useState<string>('tous');
  const [filtreSportifId, setFiltreSportifId] = useState<string>('tous');
  const [periodeJours, setPeriodeJours] = useState<number>(30);
  const [exportEnCours, setExportEnCours] = useState(false);

  const handleTelecharger = () => {
    setExportEnCours(true);
    try {
      exporterVersExcel({
        equipes,
        sportifs,
        indicateurs,
        questionnaires,
        reponses,
        seances,
        filtreEquipeId: filtreEquipeId !== 'tous' ? filtreEquipeId : undefined,
        filtreSportifId: filtreSportifId !== 'tous' ? filtreSportifId : undefined,
        filtrePeriodeJours: periodeJours > 0 ? periodeJours : undefined,
      });
    } finally {
      setTimeout(() => setExportEnCours(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Exportation des Données vers Microsoft Excel (.xlsx)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Générez un classeur Excel complet multi-feuilles avec statistiques de charge, bien-être et indicateurs sur mesure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Paramètres d'export (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            1. Paramétrer votre extraction
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Groupe / Équipe
              </label>
              <select
                value={filtreEquipeId}
                onChange={(e) => {
                  setFiltreEquipeId(e.target.value);
                  setFiltreSportifId('tous');
                }}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="tous">Toutes les équipes ({equipes.length})</option>
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Sportif spécifique
              </label>
              <select
                value={filtreSportifId}
                onChange={(e) => setFiltreSportifId(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="tous">Tous les sportifs du groupe ({sportifs.length})</option>
                {sportifs
                  .filter((s) => filtreEquipeId === 'tous' || s.equipeId === filtreEquipeId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Plage temporelle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { j: 7, label: '7 jours' },
                { j: 14, label: '14 jours' },
                { j: 30, label: '30 jours' },
                { j: 0, label: 'Tout l’historique' },
              ].map((item) => (
                <button
                  key={item.j}
                  type="button"
                  onClick={() => setPeriodeJours(item.j)}
                  className={`rounded-xl py-2 text-xs font-medium border transition-colors ${
                    periodeJours === item.j
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleTelecharger}
              disabled={exportEnCours}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-neutral-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>
                {exportEnCours ? 'Génération du classeur Excel...' : 'Télécharger le fichier Excel (.xlsx)'}
              </span>
            </button>
          </div>
        </div>

        {/* Aperçu du contenu du fichier Excel généré (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Table className="h-4 w-4 text-emerald-400" />
            <span>Feuilles incluses dans le classeur</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feuille 1 : Synthèse Athlètes</span>
              </div>
              <p className="text-[11px] text-neutral-400 pl-5.5">
                Nom, statut, score de forme, tendance, ratio ACWR 7j/28j et alertes actives.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feuille 2 : Toutes les Réponses</span>
              </div>
              <p className="text-[11px] text-neutral-400 pl-5.5">
                Chaque check-in ligne par ligne avec toutes les valeurs de vos indicateurs sur mesure.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feuille 3 : Suivi des Charges (sRPE)</span>
              </div>
              <p className="text-[11px] text-neutral-400 pl-5.5">
                Difficulté perçue de Foster, durée des séances, charge en Unités Arbitraires (UA).
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feuille 4 : Séances & Débriefings</span>
              </div>
              <p className="text-[11px] text-neutral-400 pl-5.5">
                Suivi séance par séance : RPE cible coach vs RPE moyen ressenti, durée et débriefings.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feuille 5 : Modèle MME 7j & 28j (EWMA)</span>
              </div>
              <p className="text-[11px] text-neutral-400 pl-5.5">
                Historique quotidien des Moyennes Mobiles Exponentielles (Aiguë vs Chronique) et ratios EWMA.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Feuille 6 : Indicateurs & Échelles</span>
              </div>
              <p className="text-[11px] text-neutral-400 pl-5.5">
                Le dictionnaire complet de vos métriques avec codes, échelles min/max et règles de seuils.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
