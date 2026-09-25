import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, MenuId } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/layout/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { SeancesView } from './components/seances/SeancesView';
import { SportifsView } from './components/sportifs/SportifsView';
import { EquipesView } from './components/equipes/EquipesView';
import { QuestionnairesView } from './components/questionnaires/QuestionnairesView';
import { IndicateursView } from './components/indicateurs/IndicateursView';
import { AnalysesView } from './components/analyses/AnalysesView';
import { HistoriqueView } from './components/historique/HistoriqueView';
import { ExportExcelView } from './components/export/ExportExcelView';
import { ParametresView } from './components/parametres/ParametresView';
import { ConnexionProfilView } from './components/compte/ConnexionProfilView';
import { SportifPortal } from './components/sportif/SportifPortal';
import { PageConnexion } from './components/auth/PageConnexion';
import { CreerClubhouseView } from './components/equipes/CreerClubhouseView';
import { DemoView } from './components/demo/DemoView';

const ContenuPrincipal: React.FC = () => {
  const {
    estConnecte,
    roleActuel,
    setRoleActuel,
    compteActuel,
    clubhouseEstConfigure,
    reponses,
    setSportifConnecteId,
    ajouterToast,
  } = useApp();

  const [ongletActif, setOngletActif] = useState<MenuId>('dashboard');

  // Détection du paramètre d'invitation d'équipe dans l'URL (?rejoindre=CODE)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeRejoindre = params.get('rejoindre');
      if (codeRejoindre && estConnecte) {
        ajouterToast({
          titre: 'Invitation d’équipe détectée',
          message: `Code d'invitation : ${codeRejoindre}`,
          type: 'info',
        });
      }
    }
  }, [estConnecte, ajouterToast]);

  // 1. Si non connecté, afficher exclusivement la page de connexion / inscription
  if (!estConnecte) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
        <PageConnexion />
        <ToastContainer />
      </div>
    );
  }

  // 2. SÉPARATION TECHNIQUE STRICTE : ESPACE SPORTIF
  // Le sportif n'a AUCUN moyen d'accéder aux vues de l'entraîneur
  if (roleActuel === 'sportif') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
        <Header
          ongletActif="sportif"
          onNaviguerVersConnexion={() => {}}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <SportifPortal />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // 3. FLUX ENTRAÎNEUR : PREMIER ACCÈS SANS CLUBHOUSE CONFIGURÉ
  // Si le coach n'a pas encore créé son Clubhouse, il est automatiquement dirigé vers cette page
  if (roleActuel === 'entraineur' && !clubhouseEstConfigure) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
        <Header
          ongletActif="clubhouse_onboarding"
          onNaviguerVersConnexion={() => setOngletActif('connexion')}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <CreerClubhouseView
            onClubhouseCree={() => setOngletActif('dashboard')}
          />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // 4. ESPACE ENTRAÎNEUR COMPLET AVEC CLUBHOUSE CONFIGURÉ
  const dateAujourdhui = new Date().toISOString().split('T')[0];
  const alertesJourCount = reponses
    .filter((r) => r.dateJour === dateAujourdhui)
    .reduce((acc, r) => acc + (r.alertes?.length || 0), 0);

  const handleSelectionnerSportif = (sportifId: string) => {
    setSportifConnecteId(sportifId);
    setOngletActif('sportifs');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Header
        ongletActif={ongletActif}
        onNaviguerVersConnexion={() => setOngletActif('connexion')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Barre latérale visible exclusivement en mode Entraîneur */}
        <Sidebar
          actif={ongletActif}
          surSelection={setOngletActif}
          alertesCount={alertesJourCount}
        />

        {/* Espace de contenu dynamique de l'entraîneur */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {ongletActif === 'dashboard' && (
            <DashboardView
              onNaviguer={setOngletActif}
              onSelectionnerSportif={handleSelectionnerSportif}
            />
          )}
          {ongletActif === 'seances' && <SeancesView />}
          {ongletActif === 'sportifs' && <SportifsView />}
          {ongletActif === 'equipes' && <EquipesView />}
          {ongletActif === 'questionnaires' && (
            <QuestionnairesView
              onTesterQuestionnaire={(_questId) => {
                if (compteActuel?.role === 'les_deux') {
                  setRoleActuel('sportif');
                } else {
                  ajouterToast({
                    titre: 'Aperçu questionnaire',
                    message: 'Ouvrez un compte sportif pour tester les questionnaires en direct.',
                    type: 'info',
                  });
                }
              }}
            />
          )}
          {ongletActif === 'indicateurs' && <IndicateursView />}
          {ongletActif === 'analyses' && <AnalysesView />}
          {ongletActif === 'historique' && <HistoriqueView />}
          {ongletActif === 'demo' && (
            <DemoView onNaviguer={(o) => setOngletActif(o as MenuId)} />
          )}
          {ongletActif === 'export' && <ExportExcelView />}
          {ongletActif === 'parametres' && <ParametresView />}
          {ongletActif === 'connexion' && <ConnexionProfilView />}
        </main>
      </div>

      {/* Notifications toast en temps réel */}
      <ToastContainer />

      {/* Navigation mobile pour l'entraîneur */}
      <MobileNav actif={ongletActif} surSelection={setOngletActif} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ContenuPrincipal />
    </AppProvider>
  );
}
