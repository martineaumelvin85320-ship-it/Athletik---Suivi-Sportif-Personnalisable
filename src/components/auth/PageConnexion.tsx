import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn,
  QrCode,
  Repeat,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { RoleCompte } from '../../types';
import { InfoTooltip } from '../ui/InfoTooltip';

export const PageConnexion: React.FC = () => {
  const {
    creerCompte,
    connecterCompte,
    supprimerCompte,
    comptesEnregistres,
    equipes,
    ajouterToast,
  } = useApp();

  // Mode connexion ou inscription
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');

  // Choix du rôle (Sportif ou Entraîneur)
  const [roleChoisi, setRoleChoisi] = useState<RoleCompte>('entraineur');

  // Formulaire d'authentification
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [seSouvenir, setSeSouvenir] = useState(true);
  const [codeEquipeOptionnel, setCodeEquipeOptionnel] = useState('');

  // Confirmation de suppression de compte depuis l'écran de connexion
  const [compteASupprimerId, setCompteASupprimerId] = useState<string | null>(null);

  // État de chargement et erreurs
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Détection du paramètre d'invitation d'équipe dans l'URL (?rejoindre=CODE)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeUrl = params.get('rejoindre');
      if (codeUrl) {
        setMode('inscription');
        setRoleChoisi('sportif');
        setCodeEquipeOptionnel(codeUrl.toUpperCase());
        ajouterToast({
          titre: 'Invitation d’équipe détectée',
          message: `Code d'équipe ${codeUrl.toUpperCase()} prérempli pour votre inscription.`,
          type: 'info',
        });
      }
    }
  }, [ajouterToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    try {
      if (mode === 'inscription') {
        if (!prenom.trim() || !nom.trim()) {
          setErreur('Veuillez renseigner votre prénom et votre nom.');
          setChargement(false);
          return;
        }

        let equipeTrouveeId: string | null = null;
        if (codeEquipeOptionnel.trim()) {
          const eq = equipes.find(
            (item) =>
              item.codeInvitation?.trim().toUpperCase() ===
              codeEquipeOptionnel.trim().toUpperCase()
          );
          if (eq) {
            equipeTrouveeId = eq.id;
          }
        }

        const res = await creerCompte({
          email: email.trim(),
          motDePasse,
          role: roleChoisi,
          prenom: prenom.trim(),
          nom: nom.trim(),
          seSouvenir,
          equipeId: equipeTrouveeId,
        });

        if (!res.succes) {
          setErreur(res.erreur || 'Une erreur est survenue lors de l’inscription.');
        }
      } else {
        // Mode Connexion
        const res = await connecterCompte({
          email: email.trim(),
          motDePasse,
          seSouvenir,
        });

        if (!res.succes) {
          setErreur(res.erreur || 'Identifiants invalides. Veuillez réessayer.');
        }
      }
    } catch (err) {
      console.error(err);
      setErreur('Une erreur inattendue est survenue.');
    } finally {
      setChargement(false);
    }
  };

  const handleSelectionnerCompteExistant = (c: { email: string; role: RoleCompte }) => {
    setEmail(c.email);
    setRoleChoisi(c.role);
    setMode('connexion');
    setErreur(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Halos d'ambiance en arrière-plan */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* Barre supérieure */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">ATHLETIK</span>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                PRO PERFORMANCE
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Quantification de charge sRPE, Ratios ACWR & Bilan Wellness
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sécurité cryptographique active (SHA-256)</span>
        </div>
      </header>

      {/* Contenu principal de connexion */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
          {/* Titre & sous-titre */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {mode === 'connexion' ? 'Accédez à votre espace' : 'Créer un nouveau compte'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
              {mode === 'connexion'
                ? 'Saisissez vos identifiants pour vous connecter à votre interface dédiée.'
                : 'Choisissez votre profil et définissez votre mot de passe sécurisé.'}
            </p>
          </div>

          {/* COMMUTATEUR MODE (CONNEXION VS INSCRIPTION) */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-950 border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setMode('connexion');
                setErreur(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'connexion'
                  ? 'bg-neutral-800 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Connexion</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('inscription');
                setErreur(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'inscription'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Créer un compte</span>
            </button>
          </div>

          {/* SÉLECTEUR DE TYPE DE COMPTE (SPORTIF OU ENTRAÎNEUR) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Type de compte
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1 : Entraîneur */}
              <button
                type="button"
                onClick={() => setRoleChoisi('entraineur')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  roleChoisi === 'entraineur'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      roleChoisi === 'entraineur'
                        ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Shield className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  {roleChoisi === 'entraineur' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Entraîneur</span>
                    <InfoTooltip
                      titre="Compte Entraîneur"
                      texte="Permet de créer un Clubhouse, gérer des équipes, programmer des séances et analyser la charge."
                    />
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Clubhouse & équipes
                  </p>
                </div>
              </button>

              {/* Option 2 : Sportif */}
              <button
                type="button"
                onClick={() => setRoleChoisi('sportif')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  roleChoisi === 'sportif'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      roleChoisi === 'sportif'
                        ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Users className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  {roleChoisi === 'sportif' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Sportif</span>
                    <InfoTooltip
                      titre="Compte Sportif"
                      texte="Interface athlète étanche : check-ins quotidiens, débrief RPE et vestiaire d'équipe."
                    />
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Check-in & débrief
                  </p>
                </div>
              </button>

              {/* Option 3 : Entraîneur & Sportif (Double Rôle) */}
              <button
                type="button"
                onClick={() => setRoleChoisi('les_deux')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  roleChoisi === 'les_deux'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      roleChoisi === 'les_deux'
                        ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Repeat className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  {roleChoisi === 'les_deux' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Coach & Joueur</span>
                    <InfoTooltip
                      titre="Compte Double Rôle"
                      texte="Idéal pour les entraîneurs-joueurs : vous avez accès aux 2 espaces et pouvez basculer en 1 clic."
                    />
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Accès aux 2 interfaces
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* COMPTES DÉJÀ ENREGISTRÉS SUR CE NAVIGATEUR (Sélection rapide & Suppression) */}
          {comptesEnregistres.length > 0 && mode === 'connexion' && (
            <div className="space-y-2 pt-1 border-t border-neutral-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Comptes enregistrés sur cet appareil :</span>
                </span>
                <span className="text-[10px] text-neutral-500">
                  {comptesEnregistres.length} compte{comptesEnregistres.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {comptesEnregistres.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center rounded-xl border text-xs transition-all overflow-hidden ${
                      email.toLowerCase() === c.email.toLowerCase()
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-neutral-950/80 border-neutral-800 text-neutral-300 hover:bg-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectionnerCompteExistant(c)}
                      className="px-3 py-1.5 flex items-center gap-2 text-left cursor-pointer"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          c.role === 'sportif' ? 'bg-cyan-400' : 'bg-emerald-400'
                        }`}
                      />
                      <span>{c.prenom} {c.nom}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        ({c.role === 'sportif' ? 'Athlète' : c.role === 'les_deux' ? 'Coach & Joueur' : 'Coach'})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompteASupprimerId(c.id);
                      }}
                      className="px-2 py-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 border-l border-neutral-800/80 transition-colors"
                      title={`Supprimer le compte de ${c.prenom} ${c.nom}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Confirmation de suppression d'un compte enregistré */}
              {compteASupprimerId && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>
                      Supprimer définitivement ce compte et ses données de cet appareil ?
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await supprimerCompte(compteASupprimerId);
                        setCompteASupprimerId(null);
                        if (email.toLowerCase() === comptesEnregistres.find((c) => c.id === compteASupprimerId)?.email.toLowerCase()) {
                          setEmail('');
                          setMotDePasse('');
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Confirmer la suppression
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompteASupprimerId(null)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white text-[11px] transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MESSAGE D'ERREUR */}
          {erreur && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{erreur}</span>
            </div>
          )}

          {/* FORMULAIRE PRINCIPAL */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Si inscription : Prénom et Nom */}
            {mode === 'inscription' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder="Ex : Alexandre"
                      required
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Ex : Roy"
                      required
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Mot de passe personnalisé */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-300">
                  Mot de passe
                </label>
                <span className="text-[10px] text-neutral-500">
                  {mode === 'inscription' ? 'Chiffré par SHA-256' : ''}
                </span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type={afficherMotDePasse ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder={mode === 'inscription' ? 'Créez votre mot de passe secret' : 'Votre mot de passe'}
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  title={afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {afficherMotDePasse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Si Sportif & Inscription : Code d'invitation d'équipe optionnel */}
            {mode === 'inscription' && roleChoisi === 'sportif' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Code d'équipe (optionnel)
                  </label>
                  <InfoTooltip
                    titre="Code d'équipe"
                    texte="Si votre coach vous a donné un code d'invitation (ex: ATH-742), renseignez-le pour être automatiquement rattaché à votre groupe."
                  />
                </div>
                <div className="relative">
                  <QrCode className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    value={codeEquipeOptionnel}
                    onChange={(e) => setCodeEquipeOptionnel(e.target.value.toUpperCase())}
                    placeholder="Ex : ATH-742"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-3 py-2.5 text-xs font-mono uppercase text-emerald-400 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Option "Se souvenir de moi" */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={seSouvenir}
                  onChange={(e) => setSeSouvenir(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-800 bg-neutral-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  Se souvenir de moi sur cet appareil
                </span>
              </label>

              <span className="text-[11px] text-neutral-500">
                Connexion sécurisée
              </span>
            </div>

            {/* Bouton d'action */}
            <button
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {chargement ? (
                <span>Vérification en cours...</span>
              ) : mode === 'connexion' ? (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </>
              ) : (
                <>
                  <span>Créer mon compte et continuer</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Pied de page minimal */}
      <footer className="relative z-10 py-4 px-6 border-t border-neutral-900 text-center text-xs text-neutral-500">
        Athletik Pro Performance • Mots de passe chiffrés • Aucun profil ni équipe de test imposé
      </footer>
    </div>
  );
};
