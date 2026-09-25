import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleCompte, RoleUtilisateur } from '../../types';
import { ClubEcusson } from '../equipes/ClubEcusson';
import { AmbienceFond } from '../equipes/AmbienceFond';
import {
  User,
  Shield,
  Activity,
  Check,
  Camera,
  Upload,
  Sparkles,
  QrCode,
  UserPlus,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Palette,
  Layers,
  KeyRound,
  Users,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const AVATARS_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
];

const COULEURS_THEMES = [
  { id: '#10b981', nom: 'Émeraude Athlétique' },
  { id: '#3b82f6', nom: 'Saphir Pro' },
  { id: '#f59e0b', nom: 'Or & Ambre' },
  { id: '#8b5cf6', nom: 'Violet Puissance' },
  { id: '#ef4444', nom: 'Rubis Intensité' },
  { id: '#06b6d4', nom: 'Cyan Vitesse' },
];

export const ConnexionProfilView: React.FC = () => {
  const {
    roleActuel,
    setRoleActuel,
    sportifConnecteId,
    setSportifConnecteId,
    sportifConnecte,
    sportifs,
    equipes,
    demandesAdhesion,
    creerDemandeAdhesion,
    profilCompte,
    mettreAJourProfilCompte,
    ajouterToast,
    compteActuel,
    supprimerCompte,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmationSuppressionCompte, setConfirmationSuppressionCompte] = useState(false);

  // Formulaire profil
  const [nom, setNom] = useState(profilCompte.nom);
  const [prenom, setPrenom] = useState(profilCompte.prenom);
  const [email, setEmail] = useState(profilCompte.email);
  const [roleCompte, setRoleCompte] = useState<RoleCompte>(profilCompte.role || 'les_deux');
  const [photoUrl, setPhotoUrl] = useState(profilCompte.photoUrl || '');
  const [themeCouleur, setThemeCouleur] = useState(profilCompte.themeCouleur || '#10b981');
  const [ambiancePreferee, setAmbiancePreferee] = useState(profilCompte.ambiancePreferee || 'terrain');

  // Adhésion équipe
  const [codeEquipeAJoindre, setCodeEquipeAJoindre] = useState('');
  const [messageMotivation, setMessageMotivation] = useState('');
  const [sauvegardeReussie, setSauvegardeReussie] = useState(false);

  // Gérer l'upload d'image de profil
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSauvegarderProfil = (e: React.FormEvent) => {
    e.preventDefault();
    mettreAJourProfilCompte({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      role: roleCompte,
      photoUrl: photoUrl.trim() || undefined,
      themeCouleur,
      ambiancePreferee,
    });

    // Synchroniser le rôle actif si besoin
    if (roleCompte === 'entraineur') {
      setRoleActuel('entraineur');
    } else if (roleCompte === 'sportif') {
      setRoleActuel('sportif');
    }

    setSauvegardeReussie(true);
    ajouterToast({
      titre: 'Profil mis à jour',
      message: 'Vos informations et préférences de compte ont été enregistrées.',
      type: 'succes',
    });
    setTimeout(() => setSauvegardeReussie(false), 3000);
  };

  const handleDemanderAdhesion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeEquipeAJoindre.trim()) return;

    // Trouver l'équipe par code d'invitation ou par ID
    const equipeTrouvee = equipes.find(
      (eq) =>
        eq.codeInvitation?.toLowerCase() === codeEquipeAJoindre.trim().toLowerCase() ||
        eq.id.toLowerCase() === codeEquipeAJoindre.trim().toLowerCase()
    );

    if (!equipeTrouvee) {
      ajouterToast({
        titre: 'Code introuvable',
        message: `Aucune équipe ne correspond au code "${codeEquipeAJoindre}". Vérifiez avec votre entraîneur.`,
        type: 'alerte',
      });
      return;
    }

    const sportifCibleId = roleActuel === 'sportif' ? sportifConnecteId : sportifs[0]?.id || 'sp-1';
    creerDemandeAdhesion(sportifCibleId, equipeTrouvee.id, messageMotivation);
    setCodeEquipeAJoindre('');
    setMessageMotivation('');
  };

  const mesDemandes = demandesAdhesion.filter(
    (d) => d.sportifId === (roleActuel === 'sportif' ? sportifConnecteId : 'sp-1')
  );

  const monEquipeActuelle = equipes.find((e) => e.id === sportifConnecte?.equipeId);

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête de la page */}
      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg border"
            style={{
              backgroundColor: `${themeCouleur}20`,
              borderColor: `${themeCouleur}50`,
              color: themeCouleur,
            }}
          >
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Connexion & Espace Compte
            </h1>
            <p className="text-xs text-neutral-400">
              Gérez votre rôle d'accès (Sportif, Entraîneur ou les deux), votre photo de profil et vos adhésions d'équipe.
            </p>
          </div>
        </div>
      </div>

      {/* Bannière de profil interactif */}
      <AmbienceFond
        couleur={themeCouleur}
        couleurSecondaire="#38bdf8"
        couleurFond="#0a0d14"
        styleFond={ambiancePreferee}
        className="rounded-3xl border border-neutral-800 p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            {/* Photo de profil ou avatar */}
            <div className="relative group">
              <div
                className="h-24 w-24 rounded-2xl overflow-hidden border-2 shadow-2xl bg-neutral-900 flex items-center justify-center relative"
                style={{ borderColor: themeCouleur }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${prenom} ${nom}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-black text-white">
                    {prenom.charAt(0)}
                    {nom.charAt(0)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-emerald-500 text-white flex items-center justify-center shadow-lg transition-all"
                title="Changer de photo"
              >
                <Camera className="h-4 w-4 text-emerald-400" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider border shadow-sm"
                  style={{
                    backgroundColor: `${themeCouleur}25`,
                    borderColor: `${themeCouleur}50`,
                    color: themeCouleur,
                  }}
                >
                  {roleCompte === 'les_deux'
                    ? '⚡ Double Rôle (Entraîneur & Sportif)'
                    : roleCompte === 'entraineur'
                    ? '🎯 Entraîneur / Préparateur'
                    : '🏃 Athlète / Sportif'}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {email || 'utilisateur@athletik.fr'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {prenom} {nom}
              </h2>
              <p className="text-xs text-neutral-300 max-w-md">
                Accès complet aux questionnaires de bien-être RPE Borg, suivi de charge d'entraînement et gestion d'équipes.
              </p>
            </div>
          </div>

          {/* Sélecteur rapide de bascule de vue (Mode actif) */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-md flex flex-col items-center gap-3 w-full md:w-auto">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Mode de travail actuellement actif :
            </span>
            <div className="flex items-center gap-2 bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-700">
              <button
                type="button"
                onClick={() => setRoleActuel('entraineur')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roleActuel === 'entraineur'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Entraîneur</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleActuel('sportif')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roleActuel === 'sportif'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Sportif</span>
              </button>
            </div>
          </div>
        </div>
      </AmbienceFond>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE & CENTRE : FORMULAIRE PROFIL & AMBIANCE */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSauvegarderProfil}
            className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 md:p-8 space-y-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Paramètres du profil personnel</h3>
              </div>
              {sauvegardeReussie && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold animate-in fade-in">
                  <Check className="h-3.5 w-3.5" /> Sauvegardé
                </span>
              )}
            </div>

            {/* Choix du type de compte (Sportif, Entraîneur, ou Les Deux) */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Type de compte & Rôle principal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRoleCompte('entraineur')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    roleCompte === 'entraineur'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg ring-1 ring-emerald-500/30'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <Shield className="h-5 w-5 text-emerald-400 mb-2" />
                  <div className="text-xs font-bold text-white">Entraîneur uniquement</div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Créez des équipes, gérez les alertes et analysez les charges.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleCompte('sportif')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    roleCompte === 'sportif'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg ring-1 ring-emerald-500/30'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <Activity className="h-5 w-5 text-emerald-400 mb-2" />
                  <div className="text-xs font-bold text-white">Sportif uniquement</div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Répondez aux questionnaires, suivez votre bien-être et vos équipes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleCompte('les_deux')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    roleCompte === 'les_deux'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg ring-1 ring-emerald-500/30'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <Sparkles className="h-5 w-5 text-amber-400 mb-2" />
                  <div className="text-xs font-bold text-white">Les deux (Coach & Athlète)</div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Basculez librement d'un clic entre vue Coach et vue Sportif.
                  </p>
                </button>
              </div>
            </div>

            {/* Champs d'identité */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 mb-1.5 block">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 mb-1.5 block">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-300 mb-1.5 block">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Photo de profil & avatars préconfigurés */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Photo de profil
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-800/80 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:border-emerald-500 hover:text-white transition-all"
                >
                  <Upload className="h-4 w-4 text-emerald-400" />
                  <span>Importer une photo</span>
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-xs text-rose-400 hover:underline px-2"
                  >
                    Supprimer la photo
                  </button>
                )}
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-2">
                  Ou choisissez un avatar athlétique rapide :
                </span>
                <div className="flex items-center gap-2.5">
                  {AVATARS_PRESETS.map((avUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(avUrl)}
                      className={`h-11 w-11 rounded-xl overflow-hidden border-2 transition-all ${
                        photoUrl === avUrl
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                          : 'border-neutral-700 hover:border-neutral-500 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={avUrl} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Thème de couleur d'ambiance du compte */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Couleur d'ambiance du compte
                </label>
                <span className="text-[11px] font-mono text-neutral-400">{themeCouleur}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {COULEURS_THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setThemeCouleur(th.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      themeCouleur === th.id
                        ? 'border-white text-white shadow-md'
                        : 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-950'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: th.id }}
                    />
                    <span>{th.nom}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-lg cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Enregistrer mon profil</span>
              </button>
            </div>
          </form>

          {/* ZONE DE DANGER : SUPPRESSION DÉFINITIVE DU COMPTE */}
          <div className="mt-8 pt-6 border-t border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Zone critique : Supprimer définitivement mon compte</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              La suppression de votre compte effacera vos identifiants, votre profil et vos données associées sur cet appareil.
            </p>

            {!confirmationSuppressionCompte ? (
              <button
                type="button"
                onClick={() => setConfirmationSuppressionCompte(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer mon compte</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-rose-500/40 space-y-3 animate-in fade-in">
                <p className="text-xs text-rose-300 font-semibold">
                  Êtes-vous certain de vouloir supprimer votre compte ? Cette action est irréversible.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      await supprimerCompte(compteActuel?.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    Oui, supprimer mon compte
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmationSuppressionCompte(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-700 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : ADHESIONS ET GESTION D'EQUIPES */}
        <div className="space-y-6">
          {/* Section Adhésion d'équipe pour l'athlète */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Rejoindre une équipe</h3>
                <p className="text-[11px] text-neutral-400">Via code d'invitation ou lien</p>
              </div>
            </div>

            {/* Équipe actuellement affectée */}
            {monEquipeActuelle ? (
              <div
                className="rounded-2xl border p-4 transition-all"
                style={{
                  backgroundColor: `${monEquipeActuelle.couleur}15`,
                  borderColor: `${monEquipeActuelle.couleur}40`,
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                  Mon équipe actuelle
                </span>
                <div className="flex items-center gap-3">
                  <ClubEcusson
                    presetId={monEquipeActuelle.ecussonPreset}
                    logoUrl={monEquipeActuelle.logoUrl}
                    logoZoom={monEquipeActuelle.logoZoom}
                    couleur={monEquipeActuelle.couleur}
                    couleurSecondaire={monEquipeActuelle.couleurSecondaire}
                    taille="sm"
                    nomClub={monEquipeActuelle.nom}
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{monEquipeActuelle.nom}</h4>
                    <p className="text-[11px] text-neutral-300 opacity-80">
                      {monEquipeActuelle.discipline}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-3.5 text-center text-xs text-neutral-400">
                Vous n'êtes actuellement rattaché à aucune équipe.
              </div>
            )}

            {/* Formulaire pour demander à rejoindre */}
            <form onSubmit={handleDemanderAdhesion} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Code d'équipe (ex: PRO-2026) :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={codeEquipeAJoindre}
                    onChange={(e) => setCodeEquipeAJoindre(e.target.value.toUpperCase())}
                    placeholder="ex: PRO-2026"
                    className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
                  >
                    <span>Envoyer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Message de motivation pour l'entraîneur (facultatif) :
                </label>
                <textarea
                  rows={2}
                  value={messageMotivation}
                  onChange={(e) => setMessageMotivation(e.target.value)}
                  placeholder="Bonjour coach, je souhaite intégrer le groupe..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </form>

            {/* Statut de mes demandes */}
            {mesDemandes.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Historique de mes demandes
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mesDemandes.map((dem) => (
                    <div
                      key={dem.id}
                      className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{dem.equipeNom}</span>
                        <span className="text-[10px] text-neutral-400">{dem.dateDemande}</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          dem.statut === 'acceptee'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : dem.statut === 'refusee'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {dem.statut === 'acceptee'
                          ? 'Validée'
                          : dem.statut === 'refusee'
                          ? 'Refusée'
                          : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Équipes disponibles dans le club */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Groupes & Équipes du club</span>
              </h3>
              <span className="text-xs text-neutral-400 font-mono">{equipes.length} équipes</span>
            </div>

            <div className="space-y-2.5">
              {equipes.map((eq) => (
                <div
                  key={eq.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ClubEcusson
                      presetId={eq.ecussonPreset}
                      logoUrl={eq.logoUrl}
                      logoZoom={eq.logoZoom}
                      couleur={eq.couleur}
                      couleurSecondaire={eq.couleurSecondaire}
                      taille="xs"
                      nomClub={eq.nom}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{eq.nom}</h4>
                      <span className="text-[10px] text-neutral-400">{eq.discipline}</span>
                    </div>
                  </div>

                  <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {eq.codeInvitation || 'ATH-PRO'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
