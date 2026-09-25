import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldCheck,
  Database,
  Check,
  Trash2,
  AlertTriangle,
  User,
  Mail,
  LogOut,
  Shield,
} from 'lucide-react';

export const ParametresView: React.FC = () => {
  const {
    parametres,
    modifierParametres,
    reinitialiserDonnees,
    compteActuel,
    supprimerCompte,
    seDeconnecter,
    clubhouse,
  } = useApp();

  const [nomOrganisation, setNomOrganisation] = useState(parametres.nomOrganisation);
  const [nomEntraineur, setNomEntraineur] = useState(parametres.nomEntraineur);
  const [discipline, setDiscipline] = useState(parametres.discipline);
  const [emailContact, setEmailContact] = useState(parametres.emailContact);
  const [seuilChargeElevee, setSeuilChargeElevee] = useState(parametres.seuilChargeElevee);
  const [autoriserHistoriqueParDefaut, setAutoriserHistoriqueParDefaut] = useState(
    parametres.autoriserHistoriqueParDefaut
  );

  const [sauvegardeMessage, setSauvegardeMessage] = useState(false);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);

  const handleEnregistrer = (e: React.FormEvent) => {
    e.preventDefault();
    modifierParametres({
      nomOrganisation: nomOrganisation.trim(),
      nomEntraineur: nomEntraineur.trim(),
      discipline: discipline.trim(),
      emailContact: emailContact.trim(),
      seuilChargeElevee: Number(seuilChargeElevee),
      autoriserHistoriqueParDefaut,
    });
    setSauvegardeMessage(true);
    setTimeout(() => setSauvegardeMessage(false), 2000);
  };

  const handleReinitialiser = () => {
    if (
      window.confirm(
        'Attention : cette action va réinitialiser les athlètes, indicateurs et questionnaires aux données de démonstration initiales. Continuer ?'
      )
    ) {
      reinitialiserDonnees();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Paramètres du Club & du Compte</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Personnalisez les informations de votre structure sportive et les réglages de calcul.
        </p>
      </div>

      <form onSubmit={handleEnregistrer} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
          Identité de l’Organisation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Nom du club ou de la structure
            </label>
            <input
              type="text"
              value={nomOrganisation}
              onChange={(e) => setNomOrganisation(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Nom de l’entraîneur principal / Préparateur
            </label>
            <input
              type="text"
              value={nomEntraineur}
              onChange={(e) => setNomEntraineur(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Discipline sportive principale
            </label>
            <input
              type="text"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Email de contact coach
            </label>
            <input
              type="email"
              value={emailContact}
              onChange={(e) => setEmailContact(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 pt-4 border-t border-neutral-800">
          Seuils & Droits des Sportifs
        </h2>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Seuil de séance à charge très élevée (UA = RPE × Durée min)
          </label>
          <input
            type="number"
            value={seuilChargeElevee}
            onChange={(e) => setSeuilChargeElevee(Number(e.target.value))}
            className="w-full sm:w-48 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
          />
          <span className="text-[11px] text-neutral-500 block mt-1">
            Au-delà de cette valeur (ex: 650 UA), une séance est considérée comme très éprouvante.
          </span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-800/40 p-3.5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoriserHistoriqueParDefaut}
              onChange={(e) => setAutoriserHistoriqueParDefaut(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500"
            />
            <div>
              <span className="text-xs font-semibold text-white">
                Autoriser par défaut les nouveaux sportifs à consulter leur historique personnel
              </span>
              <p className="text-[11px] text-neutral-400">
                Vous pouvez également ajuster ce paramètre individuellement sur chaque fiche athlète.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-neutral-800">
          {sauvegardeMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Check className="h-4 w-4" /> Modifications enregistrées !
            </span>
          )}
          <button
            type="submit"
            className="ml-auto rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>

      {/* Gestion du Compte Entraîneur */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Compte Entraîneur : {compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : nomEntraineur}
              </h2>
              <p className="text-xs text-neutral-400">
                {compteActuel?.email || emailContact} • Clubhouse : {clubhouse.nom || 'Actif'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={seDeconnecter}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            <span>Se déconnecter</span>
          </button>
        </div>

        {/* ZONE DE DANGER : SUPPRESSION DÉFINITIVE DU COMPTE ENTRAÎNEUR */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="uppercase tracking-wider">Zone Critique : Suppression Définitive du Compte</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            La suppression de votre compte entraîneur efface votre compte, réinitialise la configuration de votre Clubhouse et supprime vos identifiants sur cet appareil.
          </p>

          {!confirmerSuppression ? (
            <button
              type="button"
              onClick={() => setConfirmerSuppression(true)}
              className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer mon compte Entraîneur</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-rose-500/50 space-y-3 animate-in fade-in">
              <p className="text-xs text-rose-300 font-bold">
                Êtes-vous sûr de vouloir supprimer définitivement votre compte Entraîneur ? Cette action est irréversible.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await supprimerCompte(compteActuel?.id);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors cursor-pointer"
                >
                  Oui, supprimer définitivement
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmerSuppression(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone de danger / Réinitialisation */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-3">
        <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Gestion des Données Locales</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Les données sont persistées en temps réel dans votre navigateur. Vous pouvez à tout moment rétablir les données d’exemple fournies par défaut.
        </p>
        <button
          type="button"
          onClick={handleReinitialiser}
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Réinitialiser les données de démonstration</span>
        </button>
      </div>
    </div>
  );
};
