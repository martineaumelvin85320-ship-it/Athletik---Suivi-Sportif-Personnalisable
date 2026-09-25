import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  X,
  Users,
  KeyRound,
  LogOut,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { ClubEcusson } from '../equipes/ClubEcusson';
import { ConnexionModal } from '../compte/ConnexionModal';

interface HeaderProps {
  onOuvrirAlertes?: () => void;
  ongletActif: string;
  onNaviguerVersConnexion?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ongletActif,
  onNaviguerVersConnexion,
}) => {
  const {
    roleActuel,
    setRoleActuel,
    sportifConnecteId,
    setSportifConnecteId,
    sportifConnecte,
    sportifs,
    equipes,
    clubhouse,
    reponses,
    parametres,
    profilCompte,
    filtreEquipeId,
    setFiltreEquipeId,
    demandesAdhesion,
    seDeconnecter,
  } = useApp();

  const [modalConnexionOuvert, setModalConnexionOuvert] = useState(false);

  // Calcul des alertes du jour
  const dateAujourdhui = new Date().toISOString().split('T')[0];
  const reponsesAujourdhui = reponses.filter((r) => r.dateJour === dateAujourdhui);
  const totalAlertesAujourdhui = reponsesAujourdhui.reduce((acc, r) => acc + (r.alertes?.length || 0), 0);
  const alertesCritiquesAujourdhui = reponsesAujourdhui.reduce(
    (acc, r) => acc + (r.alertes?.filter((a) => a.niveau === 'critique').length || 0),
    0
  );

  const equipeFiltree = equipes.find((e) => e.id === filtreEquipeId);
  const demandesEnAttente = demandesAdhesion.filter((d) => d.statut === 'en_attente').length;

  // Équipe de l'athlète si mode sportif
  const equipeDuSportif = sportifs.find((s) => s.id === sportifConnecteId)?.equipeId
    ? equipes.find((e) => e.id === sportifs.find((s) => s.id === sportifConnecteId)?.equipeId)
    : null;

  const couleurAccent = roleActuel === 'sportif' && equipeDuSportif ? equipeDuSportif.couleur : '#10b981';
  const estCompteDouble = profilCompte.role === 'les_deux';

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 backdrop-blur-md transition-colors duration-500 sm:px-6 border-b"
        style={{
          borderColor: roleActuel === 'sportif' && equipeDuSportif ? `${couleurAccent}40` : '#262626',
          backgroundColor: roleActuel === 'sportif' && equipeDuSportif ? 'rgba(8, 10, 14, 0.94)' : 'rgba(20, 20, 20, 0.94)',
        }}
      >
        {/* LOGO & IDENTITÉ CONTEXTUELLE */}
        <div className="flex items-center gap-3">
          {roleActuel === 'sportif' && equipeDuSportif ? (
            /* Mode Sportif avec équipe : Écusson du club */
            <div className="flex items-center gap-3">
              <ClubEcusson
                presetId={equipeDuSportif.ecussonPreset}
                logoUrl={equipeDuSportif.logoUrl}
                logoZoom={equipeDuSportif.logoZoom}
                couleur={equipeDuSportif.couleur}
                couleurSecondaire={equipeDuSportif.couleurSecondaire}
                taille="md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white">
                    {equipeDuSportif.nom}
                  </span>
                  <span
                    className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-neutral-950"
                    style={{ backgroundColor: couleurAccent }}
                  >
                    ATHLÈTE
                  </span>
                  {estCompteDouble && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      Coach & Joueur
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  {sportifConnecte?.prenom} {sportifConnecte?.nom} • {sportifConnecte?.posteOuSpecialite || 'Sportif'}
                </p>
              </div>
            </div>
          ) : (
            /* Mode Entraîneur ou Sportif sans équipe */
            <div className="flex items-center gap-3">
              {clubhouse.logoUrl ? (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full aspect-square border-2 overflow-hidden bg-neutral-950 shadow-md shrink-0"
                  style={{ borderColor: clubhouse.couleurPrimaire || '#10b981' }}
                >
                  <img
                    src={clubhouse.logoUrl}
                    alt={clubhouse.nom}
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full aspect-square bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white">{clubhouse.nom}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-400 border border-emerald-500/20">
                    VEO CLUBHOUSE
                  </span>
                  {estCompteDouble && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      Coach & Joueur
                    </span>
                  )}
                </div>
                <p className="hidden text-xs text-neutral-400 sm:block">
                  Coach : {clubhouse.proprietaireNom} • {clubhouse.discipline}
                </p>
              </div>
            </div>
          )}

          {/* Badge d'équipe active globale si filtrée en mode entraîneur */}
          {roleActuel === 'entraineur' && equipeFiltree && (
            <div
              className="hidden lg:flex items-center gap-2 ml-4 rounded-xl px-2.5 py-1 text-xs border"
              style={{
                backgroundColor: `${equipeFiltree.couleur}15`,
                borderColor: `${equipeFiltree.couleur}40`,
              }}
            >
              <Users className="h-3.5 w-3.5" style={{ color: equipeFiltree.couleur }} />
              <span className="text-white font-bold">{equipeFiltree.nom}</span>
              <button
                type="button"
                onClick={() => setFiltreEquipeId(null)}
                className="text-neutral-400 hover:text-white rounded-full p-0.5 hover:bg-neutral-800"
                title="Effacer le filtre d'équipe"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* ACTIONS & COMMUTATEUR D'INTERFACE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indicateur Alertes du jour pour l'entraîneur */}
          {roleActuel === 'entraineur' && (
            <div
              className={`hidden items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium md:flex border ${
                alertesCritiquesAujourdhui > 0
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
                  : totalAlertesAujourdhui > 0
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>
                {totalAlertesAujourdhui > 0
                  ? `${totalAlertesAujourdhui} alerte${totalAlertesAujourdhui > 1 ? 's' : ''}`
                  : '0 alerte'}
              </span>
            </div>
          )}

          {/* Commutateur de rôle (visible UNIQUEMENT si compte double rôle Coach & Joueur) */}
          {estCompteDouble && (
            <div className="flex items-center rounded-xl bg-neutral-950 p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setRoleActuel('entraineur')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                  roleActuel === 'entraineur'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Afficher l'interface de gestion Entraîneur"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Entraîneur</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleActuel('sportif')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                  roleActuel === 'sportif'
                    ? 'text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                style={
                  roleActuel === 'sportif'
                    ? { backgroundColor: couleurAccent }
                    : {}
                }
                title="Afficher l'interface Sportif du joueur"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Sportif</span>
              </button>
            </div>
          )}

          {/* Badge profil personnel en mode Sportif (seul mon profil est visible, cliquable pour voir le compte) */}
          {roleActuel === 'sportif' && sportifConnecte && (
            <button
              type="button"
              onClick={() => setModalConnexionOuvert(true)}
              className="hidden sm:flex items-center gap-2 rounded-full bg-neutral-950/90 px-3 py-1.5 border border-neutral-800 hover:border-neutral-700 shadow-sm transition-all cursor-pointer"
              title="Gérer mon compte athlète"
            >
              <div
                className="h-6 w-6 rounded-full aspect-square flex items-center justify-center font-black text-[10px] shrink-0 border"
                style={{
                  backgroundColor: `${couleurAccent}20`,
                  color: couleurAccent,
                  borderColor: `${couleurAccent}40`,
                }}
              >
                {sportifConnecte.initiales}
              </div>
              <span className="text-xs font-bold text-white max-w-[130px] truncate">
                {sportifConnecte.prenom} {sportifConnecte.nom}
              </span>
            </button>
          )}

          {/* Bouton Mon Compte pour l'entraîneur */}
          {roleActuel === 'entraineur' && (
            <button
              type="button"
              onClick={() => setModalConnexionOuvert(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-all cursor-pointer"
              title="Gérer mon compte entraîneur"
            >
              <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
              <span>Mon Compte</span>
            </button>
          )}

          {/* Bouton Déconnexion explicite pour retourner à la PageConnexion */}
          <button
            type="button"
            onClick={seDeconnecter}
            className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all"
            title="Se déconnecter et revenir à la page d'accueil"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Modal de connexion et de choix de profil */}
      <ConnexionModal
        ouvert={modalConnexionOuvert}
        surFermer={() => setModalConnexionOuvert(false)}
      />
    </>
  );
};
