import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  UserCheck,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  LogOut,
  Trash2,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Mail,
  User,
  Plus,
} from 'lucide-react';
import { ClubEcusson } from '../equipes/ClubEcusson';

interface ConnexionModalProps {
  ouvert: boolean;
  surFermer: () => void;
}

export const ConnexionModal: React.FC<ConnexionModalProps> = ({ ouvert, surFermer }) => {
  const {
    roleActuel,
    sportifConnecte,
    sportifConnecteId,
    compteActuel,
    comptesEnregistres,
    clubhouse,
    equipes,
    supprimerCompte,
    seDeconnecter,
    connecterCompte,
    ajouterToast,
  } = useApp();

  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [compteCibleASupprimerId, setCompteCibleASupprimerId] = useState<string | null>(null);

  if (!ouvert) return null;

  // Déterminer les informations du compte affiché
  const prenomAffiche = compteActuel?.prenom || sportifConnecte?.prenom || 'Utilisateur';
  const nomAffiche = compteActuel?.nom || sportifConnecte?.nom || '';
  const emailAffiche = compteActuel?.email || sportifConnecte?.email || 'Non renseigné';
  const roleAffiche = compteActuel?.role || (roleActuel === 'sportif' ? 'sportif' : 'entraineur');

  // Équipe si sportif
  const equipeDuSportif = sportifConnecte?.equipeId
    ? equipes.find((e) => e.id === sportifConnecte.equipeId)
    : null;

  const handleBasculerCompte = async (compteId: string) => {
    const compte = comptesEnregistres.find((c) => c.id === compteId);
    if (!compte) return;

    // Pour basculer rapidement sans resaisir le mot de passe depuis l'appareil
    ajouterToast({
      titre: 'Bascule de compte',
      message: `Connexion au compte de ${compte.prenom} ${compte.nom}...`,
      type: 'info',
    });

    surFermer();
    seDeconnecter();
  };

  const handleSupprimerCeCompte = async () => {
    const idCible = compteActuel?.id || sportifConnecteId;
    await supprimerCompte(idCible);
    surFermer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900/95 shadow-2xl overflow-hidden">
        {/* Header du modal */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-5 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide">
                Mon Compte & Identité
              </h2>
              <p className="text-xs text-neutral-400">
                Gérez votre profil, vos accès et vos préférences de connexion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={surFermer}
            className="rounded-full p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps du modal */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Fiche du compte actuellement connecté */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-2xl aspect-square flex items-center justify-center font-black text-sm border-2 shadow-md ${
                    roleAffiche === 'sportif'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {prenomAffiche.charAt(0)}{nomAffiche.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {prenomAffiche} {nomAffiche}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        roleAffiche === 'sportif'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : roleAffiche === 'les_deux'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {roleAffiche === 'sportif'
                        ? 'Athlète'
                        : roleAffiche === 'les_deux'
                        ? 'Coach & Joueur'
                        : 'Entraîneur'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3 w-3 text-neutral-500" />
                    <span>{emailAffiche}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Renseignement d'équipe ou clubhouse */}
            <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  {roleAffiche === 'sportif' ? 'Équipe rattachée' : 'Clubhouse'}
                </span>
                <span className="text-white font-medium truncate block">
                  {roleAffiche === 'sportif'
                    ? (equipeDuSportif?.nom || 'Sans équipe')
                    : (clubhouse.nom || 'Clubhouse actif')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  Date d'inscription
                </span>
                <span className="text-neutral-300 font-medium block">
                  {compteActuel?.dateCreation || 'Compte actif'}
                </span>
              </div>
            </div>
          </div>

          {/* Autres comptes enregistrés sur cet appareil */}
          {comptesEnregistres.length > 1 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Autres comptes sur cet appareil ({comptesEnregistres.length})
              </span>
              <div className="space-y-2">
                {comptesEnregistres
                  .filter((c) => c.id !== compteActuel?.id)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            c.role === 'sportif' ? 'bg-cyan-400' : 'bg-emerald-400'
                          }`}
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {c.prenom} {c.nom}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {c.email} • {c.role === 'sportif' ? 'Athlète' : 'Coach'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleBasculerCompte(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Bascule
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await supprimerCompte(c.id);
                          }}
                          className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Supprimer ce profil de l'appareil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Boutons d'action : Déconnexion & Création */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                surFermer();
                seDeconnecter();
              }}
              className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-600 bg-neutral-800 hover:bg-neutral-750 text-xs font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span>Se déconnecter de ce compte</span>
            </button>
          </div>

          {/* ZONE CRITIQUE : SUPPRIMER CE COMPTE DÉFINITIVEMENT */}
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="uppercase tracking-wider">Zone Critique : Suppression Définitive</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Supprimer votre compte effacera vos identifiants, votre profil {roleAffiche === 'sportif' ? 'athlète et vos questionnaires' : 'entraîneur et l’accès au Clubhouse'} sur cet appareil.
            </p>

            {!confirmationSuppression ? (
              <button
                type="button"
                onClick={() => setConfirmationSuppression(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer définitivement mon compte</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-rose-500/50 space-y-3 animate-in fade-in">
                <p className="text-xs text-rose-300 font-bold">
                  Êtes-vous certain de vouloir supprimer définitivement ce compte ? Cette action ne peut pas être annulée.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSupprimerCeCompte}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    Oui, supprimer définitivement
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmationSuppression(false)}
                    className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
