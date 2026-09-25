import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  ClipboardList,
  Sliders,
  LineChart,
} from 'lucide-react';
import { MenuId } from './Sidebar';

interface MobileNavProps {
  actif: MenuId;
  surSelection: (id: MenuId) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ actif, surSelection }) => {
  const elementsRapides: { id: MenuId; libelle: string; icone: React.ElementType }[] = [
    { id: 'dashboard', libelle: 'Tableau', icone: LayoutDashboard },
    { id: 'seances', libelle: 'Séances', icone: CalendarCheck2 },
    { id: 'sportifs', libelle: 'Sportifs', icone: Users },
    { id: 'indicateurs', libelle: 'Indicateurs', icone: Sliders },
    { id: 'analyses', libelle: 'Analyses', icone: LineChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-neutral-800 bg-neutral-900/95 p-1 backdrop-blur-md md:hidden">
      {elementsRapides.map((elem) => {
        const Icone = elem.icone;
        const estActif = actif === elem.id;
        return (
          <button
            key={elem.id}
            type="button"
            onClick={() => surSelection(elem.id)}
            className={`flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors ${
              estActif ? 'text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Icone className="h-4 w-4 mb-0.5" />
            <span>{elem.libelle}</span>
          </button>
        );
      })}
    </nav>
  );
};
