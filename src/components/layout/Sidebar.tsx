import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Users2,
  ClipboardList,
  Sliders,
  LineChart,
  History,
  FileSpreadsheet,
  Settings,
  KeyRound,
  Compass,
} from 'lucide-react';

export type MenuId =
  | 'dashboard'
  | 'seances'
  | 'sportifs'
  | 'equipes'
  | 'questionnaires'
  | 'indicateurs'
  | 'analyses'
  | 'historique'
  | 'demo'
  | 'export'
  | 'parametres'
  | 'connexion';

interface SidebarProps {
  actif: MenuId;
  surSelection: (id: MenuId) => void;
  alertesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  actif,
  surSelection,
  alertesCount = 0,
}) => {
  const { demandesAdhesion } = useApp();
  const demandesEnAttenteCount = demandesAdhesion.filter((d) => d.statut === 'en_attente').length;

  const elementsMenu: { id: MenuId; libelle: string; icone: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', libelle: 'Tableau de bord', icone: LayoutDashboard, badge: alertesCount },
    { id: 'seances', libelle: 'Planning & Séances', icone: CalendarCheck2 },
    { id: 'sportifs', libelle: 'Sportifs', icone: Users },
    {
      id: 'equipes',
      libelle: 'Équipes',
      icone: Users2,
      badge: demandesEnAttenteCount > 0 ? demandesEnAttenteCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
    },
    { id: 'questionnaires', libelle: 'Questionnaires', icone: ClipboardList },
    { id: 'indicateurs', libelle: 'Indicateurs', icone: Sliders },
    { id: 'analyses', libelle: 'Analyses & MME', icone: LineChart },
    { id: 'historique', libelle: 'Historique', icone: History },
    { id: 'demo', libelle: 'Onglet Démo', icone: Compass, badge: 'Guide', badgeColor: 'bg-cyan-500/20 text-cyan-300 ring-cyan-500/40' },
    { id: 'export', libelle: 'Export Excel', icone: FileSpreadsheet },
    { id: 'parametres', libelle: 'Paramètres', icone: Settings },
    { id: 'connexion', libelle: 'Mon Compte', icone: KeyRound },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-800 bg-neutral-900/50 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Navigation Principale
        </div>
        <nav className="space-y-1">
          {elementsMenu.map((elem) => {
            const Icone = elem.icone;
            const estActif = actif === elem.id;
            return (
              <button
                key={elem.id}
                type="button"
                onClick={() => surSelection(elem.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  estActif
                    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icone
                    className={`h-4 w-4 transition-colors ${
                      estActif ? 'text-emerald-400' : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                  />
                  <span>{elem.libelle}</span>
                </div>
                {elem.badge !== undefined && (typeof elem.badge === 'number' ? elem.badge > 0 : Boolean(elem.badge)) && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
                      elem.badgeColor || 'bg-rose-500/20 text-rose-400 ring-rose-500/30'
                    }`}
                  >
                    {elem.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5 text-xs text-neutral-400">
        <div className="flex items-center gap-2 text-neutral-300 font-medium mb-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Suivi en direct actif</span>
        </div>
        <p className="text-[11px] text-neutral-500">
          Alertes automatiques calibrées sur vos seuils d’indicateurs personnalisés.
        </p>
      </div>
    </aside>
  );
};
