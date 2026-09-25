import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Sparkles,
  MapPin,
  Quote,
  Shield,
  Palette,
  Activity,
  QrCode,
  UserPlus,
  Building2,
  Settings,
  Flame,
  Award,
} from 'lucide-react';
import { Equipe } from '../../types';
import { EquipeModal } from './EquipeModal';
import { ClubEcusson } from './ClubEcusson';
import { InvitationEquipeModal } from './InvitationEquipeModal';
import { AmbienceFond, getAmbienceStyle } from './AmbienceFond';
import { ClubhouseModal } from './ClubhouseModal';
import { calculerScoreWellnessSportif } from '../../utils/analytics';

export const EquipesView: React.FC = () => {
  const {
    equipesDuCoach,
    sportifs,
    reponses,
    demandesAdhesion,
    ajouterEquipe,
    modifierEquipe,
    supprimerEquipe,
    filtreEquipeId,
    setFiltreEquipeId,
    clubhouse,
  } = useApp();

  const [modalOuvert, setModalOuvert] = useState(false);
  const [modalClubhouseOuvert, setModalClubhouseOuvert] = useState(false);
  const [equipeEnEdition, setEquipeEnEdition] = useState<Equipe | null>(null);
  const [equipeAInviter, setEquipeAInviter] = useState<Equipe | null>(null);

  const handleAjouter = () => {
    setEquipeEnEdition(null);
    setModalOuvert(true);
  };

  const handleEditer = (eq: Equipe) => {
    setEquipeEnEdition(eq);
    setModalOuvert(true);
  };

  const handleSauvegarderEquipe = (donnees: Omit<Equipe, 'id' | 'dateCreation'>) => {
    if (equipeEnEdition) {
      modifierEquipe(equipeEnEdition.id, donnees);
    } else {
      ajouterEquipe(donnees);
    }
    setModalOuvert(false);
  };

  const handleSupprimer = (id: string, nom: string) => {
    if (
      window.confirm(
        `Voulez-vous vraiment supprimer l'équipe "${nom}" de votre Clubhouse ? Vos données d'athlètes et questionnaires seront conservées.`
      )
    ) {
      supprimerEquipe(id);
    }
  };

  const equipeSelectionnee = equipesDuCoach.find((e) => e.id === filtreEquipeId);

  // Nombre total d'athlètes rattachés à ce Clubhouse
  const equipeIds = new Set(equipesDuCoach.map((e) => e.id));
  const totalSportifsClubhouse = sportifs.filter((s) => s.equipeId && equipeIds.has(s.equipeId)).length;

  return (
    <div className="space-y-6">
      {/* BANNIÈRE VEO CAM CLUBHOUSE (CLOISONNEMENT STRICT DU COACH) */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-30"
          style={{ backgroundColor: clubhouse.couleurPrimaire || '#10b981' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Logo officiel du Clubhouse (strictement ROND) */}
            {clubhouse.logoUrl ? (
              <div
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 overflow-hidden aspect-square bg-neutral-950 shadow-xl flex items-center justify-center shrink-0"
                style={{ borderColor: clubhouse.couleurPrimaire || '#10b981' }}
              >
                <img
                  src={clubhouse.logoUrl}
                  alt={clubhouse.nom}
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            ) : (
              <div
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 flex items-center justify-center shadow-xl shrink-0 aspect-square"
                style={{
                  borderColor: clubhouse.couleurPrimaire || '#10b981',
                  backgroundColor: `${clubhouse.couleurPrimaire || '#10b981'}25`,
                }}
              >
                <Building2
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  style={{ color: clubhouse.couleurPrimaire || '#10b981' }}
                />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                  CLUBHOUSE VEO CAM
                </span>
                <span className="text-[11px] text-neutral-400">
                  {clubhouse.discipline} • Propriétaire : {clubhouse.proprietaireNom}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {clubhouse.nom}
              </h2>
              <p className="text-xs text-neutral-400 max-w-xl mt-1">
                {clubhouse.description ||
                  "Vos équipes sont exclusivement cloisonnées au sein de votre Clubhouse. Aucun autre entraîneur n'a accès à vos données."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setModalClubhouseOuvert(true)}
              className="flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all shadow-sm"
              title="Configurer les paramètres de mon Clubhouse"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Gérer mon Clubhouse</span>
            </button>

            <button
              type="button"
              onClick={handleAjouter}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-black text-neutral-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Nouvelle équipe</span>
            </button>
          </div>
        </div>

        {/* Compteurs de métriques du Clubhouse */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-400">Mes équipes créées :</span>
            <span className="font-bold text-white font-mono">{equipesDuCoach.length}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-neutral-400">Total athlètes gérés :</span>
            <span className="font-bold text-white font-mono">{totalSportifsClubhouse}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-neutral-400">Cloisonnement :</span>
            <span className="font-semibold text-neutral-300">Strictement privé</span>
          </div>
        </div>
      </div>

      {/* Bannière de filtrage d'ambiance immersive */}
      {equipesDuCoach.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-400 font-medium shrink-0 flex items-center gap-1.5 pl-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Filtre d'équipe :</span>
          </span>
          <button
            type="button"
            onClick={() => setFiltreEquipeId(null)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
              filtreEquipeId === null
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-900/60 border border-neutral-800/80'
            }`}
          >
            Vue d’ensemble ({equipesDuCoach.length})
          </button>

          {equipesDuCoach.map((eq) => (
            <button
              key={eq.id}
              type="button"
              onClick={() => setFiltreEquipeId(eq.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition-all shrink-0 border ${
                filtreEquipeId === eq.id
                  ? 'text-white shadow-md'
                  : 'text-neutral-400 hover:text-white bg-neutral-900/60 border-neutral-800/80'
              }`}
              style={
                filtreEquipeId === eq.id
                  ? {
                      backgroundColor: `${eq.couleur}25`,
                      borderColor: eq.couleur,
                    }
                  : {}
              }
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: eq.couleur || '#10b981' }}
              />
              <span>{eq.nom}</span>
            </button>
          ))}
        </div>
      )}

      {/* Carte d'ambiance de l'équipe sélectionnée */}
      {equipeSelectionnee && (
        <AmbienceFond
          couleur={equipeSelectionnee.couleur}
          couleurSecondaire={equipeSelectionnee.couleurSecondaire}
          couleurFond={equipeSelectionnee.couleurFond}
          styleFond={equipeSelectionnee.styleFond}
          className="rounded-3xl border p-6 shadow-xl relative overflow-hidden transition-all duration-500"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <ClubEcusson
                presetId={equipeSelectionnee.ecussonPreset}
                logoUrl={equipeSelectionnee.logoUrl}
                logoZoom={equipeSelectionnee.logoZoom}
                couleur={equipeSelectionnee.couleur}
                couleurSecondaire={equipeSelectionnee.couleurSecondaire}
                taille="xl"
                nomClub={equipeSelectionnee.nom}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-neutral-950"
                    style={{ backgroundColor: equipeSelectionnee.couleur }}
                  >
                    {equipeSelectionnee.discipline}
                  </span>
                  <span className="text-xs text-neutral-300 opacity-90 font-mono">
                    Code : {equipeSelectionnee.codeInvitation}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                  {equipeSelectionnee.nom}
                </h2>
                {equipeSelectionnee.deviseOuSlogan && (
                  <p className="text-xs text-neutral-200 italic flex items-center gap-1.5 opacity-90">
                    <Quote className="h-3.5 w-3.5 text-amber-400" />«{' '}
                    {equipeSelectionnee.deviseOuSlogan} »
                  </p>
                )}
                {equipeSelectionnee.description && (
                  <p className="text-xs text-neutral-300 max-w-xl line-clamp-2 pt-1 opacity-80">
                    {equipeSelectionnee.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setEquipeAInviter(equipeSelectionnee)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Inviter (QR Code & Lien)</span>
              </button>
              <button
                type="button"
                onClick={() => handleEditer(equipeSelectionnee)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all shadow-sm"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Modifier l'ambiance</span>
              </button>
            </div>
          </div>
        </AmbienceFond>
      )}

      {/* Grille des cartes équipes du Clubhouse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipesDuCoach
          .filter((eq) => !filtreEquipeId || eq.id === filtreEquipeId)
          .map((eq) => {
            const membres = sportifs.filter((s) => s.equipeId === eq.id);
            const scoresMembres = membres.map(
              (s) => calculerScoreWellnessSportif(s.id, reponses).scoreActuel
            );
            const scoreMoyenEquipe =
              scoresMembres.length > 0
                ? Math.round(scoresMembres.reduce((a, b) => a + b, 0) / scoresMembres.length)
                : null;

            return (
              <div
                key={eq.id}
                className="flex flex-col justify-between rounded-3xl border transition-all duration-300 shadow-lg overflow-hidden group hover:scale-[1.01]"
                style={{
                  ...getAmbienceStyle(
                    eq.couleur || '#10b981',
                    eq.couleurSecondaire || '#34d399',
                    eq.couleurFond || '#0c0f14',
                    eq.styleFond || 'stade'
                  ),
                  borderColor: `${eq.couleur || '#10b981'}40`,
                }}
              >
                <div className="p-5">
                  {/* Header de la carte avec écusson et discipline */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <ClubEcusson
                        presetId={eq.ecussonPreset}
                        logoUrl={eq.logoUrl}
                        logoZoom={eq.logoZoom}
                        couleur={eq.couleur}
                        couleurSecondaire={eq.couleurSecondaire}
                        taille="md"
                        nomClub={eq.nom}
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                          {eq.nom}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="rounded-full px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${eq.couleur || '#10b981'}25`,
                              color: eq.couleurSecondaire || eq.couleur || '#10b981',
                            }}
                          >
                            {eq.discipline}
                          </span>
                          {eq.lieuOuStade && (
                            <span className="text-[10px] text-neutral-300 opacity-80 flex items-center gap-0.5 truncate max-w-[130px]">
                              <MapPin className="h-2.5 w-2.5 shrink-0" /> {eq.lieuOuStade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditer(eq)}
                        className="rounded-full p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Modifier l'équipe et ses ambiances"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSupprimer(eq.id, eq.nom)}
                        className="rounded-full p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Supprimer cette équipe"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Devise ou Slogan */}
                  {eq.deviseOuSlogan && (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-xs text-neutral-200 italic flex items-center gap-2">
                      <Quote className="h-3 w-3 text-amber-400 shrink-0" />
                      <span className="truncate">« {eq.deviseOuSlogan} »</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-neutral-300/90 mb-4 line-clamp-2">
                    {eq.description || 'Aucune description spécifique renseignée.'}
                  </p>

                  {/* Métriques équipe */}
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/40 backdrop-blur-sm p-3 border border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-300 block">Effectif :</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                        <Users className="h-3.5 w-3.5 text-neutral-300" />
                        {membres.length} athlète{membres.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-300 block">Forme moyenne :</span>
                      <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                        {scoreMoyenEquipe !== null ? `${scoreMoyenEquipe}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Liste des athlètes du groupe avec badges ronds */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {membres.slice(0, 5).map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/40 border border-white/10 px-2.5 py-0.5 text-[10px] text-neutral-200 font-medium"
                      >
                        <span className="h-4 w-4 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-[8px] font-bold">
                          {m.initiales}
                        </span>
                        <span>
                          {m.prenom} {m.nom}
                        </span>
                      </span>
                    ))}
                    {membres.length > 5 && (
                      <span className="rounded-full bg-black/40 border border-white/10 px-2 py-0.5 text-[10px] text-neutral-400">
                        +{membres.length - 5}
                      </span>
                    )}
                    {membres.length === 0 && (
                      <span className="text-[11px] text-neutral-400 italic">Aucun athlète affecté</span>
                    )}
                  </div>
                </div>

                {/* Barre d'actions */}
                <div className="p-3 bg-black/50 backdrop-blur-sm border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEquipeAInviter(eq)}
                      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors border border-emerald-500/30"
                    >
                      <QrCode className="h-3 w-3" />
                      <span>Code d'invitation</span>
                    </button>
                    <span className="font-mono text-[10px] text-neutral-300 bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-700">
                      {eq.codeInvitation}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEditer(eq)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white"
                  >
                    <Palette className="h-3 w-3" />
                    <span>Ambiance</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {equipesDuCoach.length === 0 && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Aucune équipe dans votre Clubhouse
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Créez votre première équipe (ex: Senior A, U19, Élite) pour générer ses couleurs, son écusson et son code d'invitation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAjouter}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            <span>Créer ma première équipe</span>
          </button>
        </div>
      )}

      {/* Modal d'édition/création d'équipe */}
      <EquipeModal
        ouvert={modalOuvert}
        surFermer={() => setModalOuvert(false)}
        surSauvegarder={handleSauvegarderEquipe}
        equipeEnEdition={equipeEnEdition}
      />

      {/* Modal du Clubhouse VEO Cam */}
      <ClubhouseModal
        ouvert={modalClubhouseOuvert}
        surFermer={() => setModalClubhouseOuvert(false)}
      />

      {/* Modal d'invitation & QR Code d'équipe */}
      {equipeAInviter && (
        <InvitationEquipeModal
          ouvert={!!equipeAInviter}
          surFermer={() => setEquipeAInviter(null)}
          equipe={equipeAInviter}
        />
      )}
    </div>
  );
};
