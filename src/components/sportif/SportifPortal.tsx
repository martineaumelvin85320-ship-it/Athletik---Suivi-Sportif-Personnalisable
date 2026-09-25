import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  AlertTriangle,
  History,
  HeartPulse,
  Flame,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  Check,
  Info,
  CalendarCheck2,
  Activity,
  Shield,
  Users,
  MapPin,
  Sparkles,
  QrCode,
  LogOut,
  Plus,
  Copy,
  Trash2,
  User,
  KeyRound,
  Mail,
} from 'lucide-react';
import { Questionnaire, Indicateur, ReponseQuestionnaire, Seance, Equipe } from '../../types';
import { formaterValeurIndicateur } from '../../utils/evaluation';
import {
  calculerScoreWellnessSportif,
  calculerACWR,
  calculerSerieMME,
} from '../../utils/analytics';
import { GraphiqueMME } from '../analyses/GraphiqueMME';
import { AmbienceFond, getAmbienceStyle } from '../equipes/AmbienceFond';
import { ClubEcusson } from '../equipes/ClubEcusson';
import { InvitationEquipeModal } from '../equipes/InvitationEquipeModal';
import { ConnexionModal } from '../compte/ConnexionModal';

export const SportifPortal: React.FC = () => {
  const {
    sportifConnecte,
    sportifs,
    equipes,
    setSportifConnecteId,
    questionnaires,
    indicateurs,
    reponses,
    seances,
    soumettreReponse,
    setRoleActuel,
    rejoindreEquipeDirectement,
    quitterEquipe,
    creerDemandeAdhesion,
    demandesAdhesion,
    ajouterToast,
    compteActuel,
    supprimerCompte,
    seDeconnecter,
  } = useApp();

  const [confirmerSuppressionAthlete, setConfirmerSuppressionAthlete] = useState(false);
  const [questionnaireActif, setQuestionnaireActif] = useState<Questionnaire | null>(null);
  const [seanceEnDebrief, setSeanceEnDebrief] = useState<Seance | null>(null);
  const [valeursFormulaire, setValeursFormulaire] = useState<Record<string, any>>({});
  const [commentaireLibre, setCommentaireLibre] = useState('');
  const [confirmationEnvoyee, setConfirmationEnvoyee] = useState<ReponseQuestionnaire | null>(null);
  const [ongletSportif, setOngletSportif] = useState<'a_faire' | 'historique' | 'equipe' | 'mon_compte'>('a_faire');

  // État pour rejoindre une équipe par code
  const [codeEquipeSaisi, setCodeEquipeSaisi] = useState('');
  const [modalInvitationOuvert, setModalInvitationOuvert] = useState(false);
  const [modalConnexionOuvert, setModalConnexionOuvert] = useState(false);
  const [codeCopie, setCodeCopie] = useState(false);

  if (!sportifConnecte) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-neutral-400">Aucun profil de sportif sélectionné.</p>
        <button
          type="button"
          onClick={() => setModalConnexionOuvert(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-bold"
        >
          Choisir ou créer un compte sportif
        </button>
        <ConnexionModal
          ouvert={modalConnexionOuvert}
          surFermer={() => setModalConnexionOuvert(false)}
        />
      </div>
    );
  }

  // Équipe attribuée au sportif
  const equipe = equipes.find((e) => e.id === sportifConnecte.equipeId);
  const couleurPrimaire = equipe?.couleur || '#10b981';
  const couleurSecondaire = equipe?.couleurSecondaire || '#38bdf8';
  const couleurFond = equipe?.couleurFond || '#0c0f14';
  const styleFond = equipe?.styleFond || 'stade';

  const indMap = new Map(indicateurs.map((i) => [i.id, i]));
  const dateAujourdhui = new Date().toISOString().split('T')[0];

  // Questionnaires assignés à ce sportif
  const questionnairesAttribues = questionnaires.filter((q) => {
    if (!q.actif) return false;
    if (q.attributionType === 'tous') return true;
    if (q.attributionType === 'equipe' && sportifConnecte.equipeId) {
      return q.cibleEquipeIds.includes(sportifConnecte.equipeId);
    }
    if (q.attributionType === 'sportifs') {
      return q.cibleSportifIds.includes(sportifConnecte.id);
    }
    return false;
  });

  // Réponses du sportif
  const mesReponses = reponses
    .filter((r) => r.sportifId === sportifConnecte.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Vérifier si un questionnaire a déjà été rempli aujourd'hui
  const estRempliAujourdhui = (questId: string) => {
    return mesReponses.some((r) => r.questionnaireId === questId && r.dateJour === dateAujourdhui);
  };

  const demarrerQuestionnaire = (q: Questionnaire, seanceAssociee?: Seance) => {
    setQuestionnaireActif(q);
    setSeanceEnDebrief(seanceAssociee || null);
    setConfirmationEnvoyee(null);
    setCommentaireLibre('');

    // Pré-remplir les valeurs par défaut
    const initialVals: Record<string, any> = {};
    q.indicateurIds.forEach((id) => {
      const ind = indMap.get(id);
      if (ind) {
        if (id === 'ind-duree-seance' || ind.code === 'DUREE_MIN') {
          initialVals[id] = seanceAssociee ? seanceAssociee.dureeMinutes : 75;
        } else if (ind.type === 'echelle_1_5') initialVals[id] = 3;
        else if (ind.type === 'echelle_1_10') initialVals[id] = 5;
        else if (ind.type === 'echelle_0_100') initialVals[id] = 50;
        else if (ind.type === 'echelle_personnalisee') initialVals[id] = ind.echelleMin ?? 1;
        else if (ind.type === 'booleen') initialVals[id] = false;
        else if (ind.type === 'numerique') initialVals[id] = '';
        else if (ind.type === 'choix_unique') initialVals[id] = ind.optionsChoix?.[0] || '';
        else if (ind.type === 'choix_multiple') initialVals[id] = [];
        else if (ind.type === 'texte') initialVals[id] = '';
      }
    });
    setValeursFormulaire(initialVals);
  };

  const handleChangerValeur = (indId: string, valeur: any) => {
    setValeursFormulaire((prev) => ({
      ...prev,
      [indId]: valeur,
    }));
  };

  const handleValiderEnvoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionnaireActif) return;

    const valeursFinales = { ...valeursFormulaire };
    if (seanceEnDebrief) {
      valeursFinales['ind-duree-seance'] = seanceEnDebrief.dureeMinutes;
    }

    const rep = soumettreReponse({
      questionnaireId: questionnaireActif.id,
      sportifId: sportifConnecte.id,
      seanceId: seanceEnDebrief?.id || undefined,
      valeurs: valeursFinales,
      commentaireGeneral: commentaireLibre.trim() || undefined,
    });

    setConfirmationEnvoyee(rep);
    setQuestionnaireActif(null);
    setSeanceEnDebrief(null);
  };

  const handleRejoindreParCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeEquipeSaisi.trim()) return;

    const codeNettoye = codeEquipeSaisi.trim().toUpperCase();
    const equipeTrouvee = equipes.find(
      (eq) => eq.codeInvitation?.trim().toUpperCase() === codeNettoye
    );

    if (equipeTrouvee) {
      rejoindreEquipeDirectement(sportifConnecte.id, equipeTrouvee.id);
      setCodeEquipeSaisi('');
    } else {
      ajouterToast({
        titre: 'Code d’équipe invalide',
        message: `Aucune équipe trouvée avec le code "${codeNettoye}". Vérifiez le code fourni par l'entraîneur.`,
        type: 'alerte',
      });
    }
  };

  const copierCodeInvitation = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCodeCopie(true);
    setTimeout(() => setCodeCopie(false), 2000);
    ajouterToast({
      titre: 'Code copié',
      message: `Code d'équipe ${code} copié dans le presse-papier.`,
      type: 'info',
    });
  };

  const wellness = calculerScoreWellnessSportif(sportifConnecte.id, reponses);
  const acwr = calculerACWR(sportifConnecte.id, reponses);

  // Coéquipiers dans la même équipe
  const coequipiers = equipe ? sportifs.filter((s) => s.equipeId === equipe.id) : [];

  return (
    <AmbienceFond
      couleur={couleurPrimaire}
      couleurSecondaire={couleurSecondaire}
      couleurFond={couleurFond}
      styleFond={styleFond}
      className="min-h-full -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 transition-colors duration-700"
    >
      <div className="max-w-2xl mx-auto space-y-6 pb-20 sm:pb-8">
        {/* BANNIÈRE SUPÉRIEURE D'IMMERSION DU CLUB OU RECRUTEMENT */}
        {equipe ? (
          /* Sportif affilié : Immersion aux couleurs, écusson et ambiance du club */
          <div
            className="rounded-3xl border p-5 sm:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-500"
            style={{
              borderColor: `${couleurPrimaire}40`,
              backgroundColor: 'rgba(10, 12, 16, 0.85)',
              boxShadow: `0 20px 40px -15px ${couleurPrimaire}25`,
            }}
          >
            {/* Lueur supérieure dans la couleur du club */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: couleurPrimaire }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Écusson officiel du club avec zoom et couleurs de l'entraîneur */}
                <ClubEcusson
                  presetId={equipe.ecussonPreset}
                  logoUrl={equipe.logoUrl}
                  logoZoom={equipe.logoZoom}
                  couleur={equipe.couleur}
                  couleurSecondaire={equipe.couleurSecondaire}
                  taille="xl"
                />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-neutral-950 shadow-sm"
                      style={{ backgroundColor: couleurPrimaire }}
                    >
                      {equipe.discipline || 'Sport'} • {equipe.categorie || 'Club'}
                    </span>
                    {equipe.lieuOuStade && (
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <MapPin className="h-3 w-3" style={{ color: couleurPrimaire }} />
                        {equipe.lieuOuStade}
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {equipe.nom}
                  </h1>

                  {equipe.devise && (
                    <p
                      className="text-xs italic font-medium tracking-wide"
                      style={{ color: `${couleurPrimaire}ee` }}
                    >
                      « {equipe.devise} »
                    </p>
                  )}
                </div>
              </div>

              {/* Profil personnel de l'athlète (cloisonnement strict) */}
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <div className="flex items-center gap-2.5 rounded-full bg-neutral-950/80 px-3 py-1.5 border border-white/10 shadow-inner">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 border"
                    style={{
                      borderColor: couleurPrimaire,
                      backgroundColor: `${couleurPrimaire}20`,
                      color: couleurPrimaire,
                    }}
                  >
                    {sportifConnecte.initiales}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {sportifConnecte.prenom} {sportifConnecte.nom}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {sportifConnecte.posteOuSpecialite || 'Sportif'}
                    </span>
                  </div>
                </div>

                {compteActuel?.role === 'les_deux' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRoleActuel('entraineur')}
                      className="px-3 py-1 rounded-full text-[11px] font-bold text-neutral-950 transition-all shadow-sm cursor-pointer"
                      style={{ backgroundColor: couleurPrimaire }}
                      title="Basculer vers l'espace entraîneur"
                    >
                      Espace Coach
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Barre de navigation d'onglets du portail sportif */}
            <div className="mt-5 pt-4 border-t border-white/10 flex rounded-2xl bg-black/40 p-1 border border-neutral-800/80 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  setOngletSportif('a_faire');
                  setQuestionnaireActif(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                  ongletSportif === 'a_faire'
                    ? 'shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                style={
                  ongletSportif === 'a_faire'
                    ? {
                        backgroundColor: couleurPrimaire,
                        color: '#000000',
                      }
                    : {}
                }
              >
                <CalendarCheck2 className="h-3.5 w-3.5" />
                <span>Mes Check-ins</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOngletSportif('historique');
                  setQuestionnaireActif(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                  ongletSportif === 'historique'
                    ? 'shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                style={
                  ongletSportif === 'historique'
                    ? {
                        backgroundColor: couleurPrimaire,
                        color: '#000000',
                      }
                    : {}
                }
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Historique & Forme</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOngletSportif('equipe');
                  setQuestionnaireActif(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                  ongletSportif === 'equipe'
                    ? 'shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                style={
                  ongletSportif === 'equipe'
                    ? {
                        backgroundColor: couleurPrimaire,
                        color: '#000000',
                      }
                    : {}
                }
              >
                <Users className="h-3.5 w-3.5" />
                <span>Mon Équipe ({coequipiers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOngletSportif('mon_compte');
                  setQuestionnaireActif(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                  ongletSportif === 'mon_compte'
                    ? 'shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                style={
                  ongletSportif === 'mon_compte'
                    ? {
                        backgroundColor: couleurPrimaire,
                        color: '#000000',
                      }
                    : {}
                }
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Mon Compte</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sportif sans équipe : Carte d'accueil et d'adhésion immédiate */
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 backdrop-blur-md shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full aspect-square bg-neutral-800 text-neutral-300 font-black text-lg border border-neutral-700 shrink-0">
                  {sportifConnecte.initiales}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Bonjour, {sportifConnecte.prenom} !
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Vous n'avez pas encore d'équipe assignée. Rejoignez votre club pour que votre
                    interface adopte son ambiance (couleur, écusson, stade).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOngletSportif(ongletSportif === 'mon_compte' ? 'a_faire' : 'mon_compte')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    ongletSportif === 'mon_compte'
                      ? 'bg-emerald-500 text-neutral-950 font-bold border-emerald-400'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Mon Compte</span>
                </button>
                {compteActuel?.role === 'les_deux' && (
                  <button
                    type="button"
                    onClick={() => setRoleActuel('entraineur')}
                    className="px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer"
                  >
                    Vue Coach
                  </button>
                )}
              </div>
            </div>

            {/* Saisie directe du code d'invitation */}
            <form onSubmit={handleRejoindreParCode} className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Rejoindre avec un code d'invitation ou QR Code
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={codeEquipeSaisi}
                  onChange={(e) => setCodeEquipeSaisi(e.target.value.toUpperCase())}
                  placeholder="Ex : PRO-2026, U21-8840..."
                  className="flex-1 font-mono uppercase tracking-wider rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black transition-all shadow-md shrink-0"
                >
                  Rejoindre le club
                </button>
              </div>
            </form>

            {/* Liste rapide des équipes créées par l'entraîneur avec bouton 1-clic */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Ou choisissez directement votre équipe :</span>
                <span className="font-mono text-[11px]">{equipes.length} équipes disponibles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {equipes.map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => rejoindreEquipeDirectement(sportifConnecte.id, eq.id)}
                    className="flex items-center justify-between p-3 rounded-2xl border text-left transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: `${eq.couleur}12`,
                      borderColor: `${eq.couleur}40`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <ClubEcusson
                        presetId={eq.ecussonPreset}
                        logoUrl={eq.logoUrl}
                        logoZoom={eq.logoZoom}
                        couleur={eq.couleur}
                        couleurSecondaire={eq.couleurSecondaire}
                        taille="sm"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{eq.nom}</h4>
                        <span className="text-[10px] text-neutral-400">
                          {eq.categorie} • Code : {eq.codeInvitation}
                        </span>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black text-neutral-950 shrink-0 shadow-sm"
                      style={{ backgroundColor: eq.couleur }}
                    >
                      Rejoindre
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation d'envoi réussi */}
        {confirmationEnvoyee && !questionnaireActif && (
          <div
            className="rounded-3xl border p-5 text-center space-y-3 shadow-xl animate-fade-in"
            style={{
              borderColor: `${couleurPrimaire}40`,
              backgroundColor: `${couleurPrimaire}15`,
            }}
          >
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-neutral-950 font-black shadow-md"
              style={{ backgroundColor: couleurPrimaire }}
            >
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Check-in enregistré avec succès !</h3>
              <p className="text-xs text-neutral-300 mt-1">
                Vos données ont été transmises instantanément à l'entraîneur de{' '}
                {equipe ? equipe.nom : 'votre club'}.
              </p>
            </div>

            {confirmationEnvoyee.alertes && confirmationEnvoyee.alertes.length > 0 && (
              <div className="mt-3 rounded-2xl bg-neutral-900/90 border border-amber-500/30 p-3 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Points de vigilance relevés :</span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 list-disc pl-4">
                  {confirmationEnvoyee.alertes.map((a, i) => (
                    <li key={i}>
                      <span className="font-semibold text-white">{a.indicateurNom}</span> : {a.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setConfirmationEnvoyee(null)}
              className="rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Fermer
            </button>
          </div>
        )}

        {/* MODE 1 : EN COURS DE RÉPONSE À UN QUESTIONNAIRE */}
        {questionnaireActif ? (
          <form
            onSubmit={handleValiderEnvoi}
            className="rounded-3xl border border-neutral-800 bg-neutral-900/95 p-6 space-y-6 shadow-2xl backdrop-blur-md"
            style={{
              borderColor: `${couleurPrimaire}30`,
            }}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <button
                type="button"
                onClick={() => setQuestionnaireActif(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour aux questionnaires</span>
              </button>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${couleurPrimaire}20`,
                  color: couleurPrimaire,
                }}
              >
                {questionnaireActif.tempsEstimeMinutes} min estimées
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                {equipe && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${couleurPrimaire}20`,
                      color: couleurPrimaire,
                    }}
                  >
                    {equipe.nom}
                  </span>
                )}
                {seanceEnDebrief && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                    Débriefing de séance : {seanceEnDebrief.titre}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">{questionnaireActif.titre}</h2>
              <p className="text-xs text-neutral-400 mt-1">{questionnaireActif.description}</p>
            </div>

            {/* Saisie de chacun des indicateurs configurés par le coach */}
            <div className="space-y-6">
              {questionnaireActif.indicateurIds.map((indId, index) => {
                const ind = indMap.get(indId);
                if (!ind) return null;
                const valeur = valeursFormulaire[indId];

                return (
                  <div
                    key={indId}
                    className="rounded-2xl border border-neutral-800/90 bg-neutral-950/70 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Question {index + 1} • {ind.categorie}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">{ind.nom}</h3>
                        {ind.description && (
                          <p className="text-xs text-neutral-400 mt-0.5">{ind.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      {/* Échelles avec curseur personnalisé aux couleurs du club */}
                      {ind.type.startsWith('echelle_') && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-400">Votre évaluation :</span>
                            <span
                              className="rounded-xl border px-3 py-1 font-mono text-base font-black shadow-sm"
                              style={{
                                backgroundColor: `${couleurPrimaire}20`,
                                borderColor: `${couleurPrimaire}50`,
                                color: couleurPrimaire,
                              }}
                            >
                              {valeur ?? (ind.type === 'echelle_1_5' ? 3 : ind.type === 'echelle_1_10' ? 5 : 50)}
                              {ind.type === 'echelle_0_100' ? '%' : ''}
                            </span>
                          </div>

                          <input
                            type="range"
                            min={ind.echelleMin ?? (ind.type === 'echelle_0_100' ? 0 : 1)}
                            max={ind.echelleMax ?? (ind.type === 'echelle_1_5' ? 5 : ind.type === 'echelle_0_100' ? 100 : 100)}
                            step={ind.echellePas ?? 1}
                            value={valeur ?? (ind.type === 'echelle_1_5' ? 3 : ind.type === 'echelle_1_10' ? 5 : 50)}
                            onChange={(e) => handleChangerValeur(indId, Number(e.target.value))}
                            style={{ accentColor: couleurPrimaire }}
                            className="w-full h-2 bg-neutral-800 rounded-lg cursor-pointer"
                          />

                          <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                            <span>{ind.libelleMin || `Min (${ind.echelleMin ?? 1})`}</span>
                            <span>{ind.libelleMax || `Max (${ind.echelleMax ?? 10})`}</span>
                          </div>
                        </div>
                      )}

                      {/* Booléen (Oui/Non) */}
                      {ind.type === 'booleen' && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleChangerValeur(indId, true)}
                            className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                              valeur === true
                                ? 'shadow-md'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                            }`}
                            style={
                              valeur === true
                                ? {
                                    backgroundColor: couleurPrimaire,
                                    borderColor: couleurPrimaire,
                                    color: '#000000',
                                  }
                                : {}
                            }
                          >
                            {ind.libelleVrai || 'Oui'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangerValeur(indId, false)}
                            className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                              valeur === false
                                ? 'shadow-md'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                            }`}
                            style={
                              valeur === false
                                ? {
                                    backgroundColor: couleurPrimaire,
                                    borderColor: couleurPrimaire,
                                    color: '#000000',
                                  }
                                : {}
                            }
                          >
                            {ind.libelleFaux || 'Non'}
                          </button>
                        </div>
                      )}

                      {/* Durée fixée par le coach */}
                      {(indId === 'ind-duree-seance' || ind.code === 'DUREE_MIN') && (
                        <div
                          className="rounded-xl border p-3.5 space-y-2"
                          style={{
                            borderColor: `${couleurPrimaire}40`,
                            backgroundColor: `${couleurPrimaire}10`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-300">
                              Durée enregistrée pour la séance :
                            </span>
                            <span
                              className="font-mono text-sm font-black"
                              style={{ color: couleurPrimaire }}
                            >
                              {seanceEnDebrief ? seanceEnDebrief.dureeMinutes : 75} minutes
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            Fixée par le staff pour l'entraînement dans son ensemble.
                          </p>
                        </div>
                      )}

                      {/* Texte libre */}
                      {ind.type === 'texte' && (
                        <textarea
                          rows={2}
                          value={valeur ?? ''}
                          onChange={(e) => handleChangerValeur(indId, e.target.value)}
                          placeholder="Tapez vos remarques ici..."
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-2.5 text-xs text-white focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Commentaire optionnel */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Message direct ou remarque pour le coach (optionnel)
              </label>
              <textarea
                rows={2}
                value={commentaireLibre}
                onChange={(e) => setCommentaireLibre(e.target.value)}
                placeholder="Ex : Sensation de gêne aux ischios, besoin d'adapter l'intensité..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            {/* Boutons d'envoi aux couleurs du club */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuestionnaireActif(null)}
                className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 py-3 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all shadow-lg"
                style={{
                  backgroundColor: couleurPrimaire,
                  color: '#000000',
                  boxShadow: `0 8px 20px -4px ${couleurPrimaire}40`,
                }}
              >
                <Send className="h-4 w-4 stroke-[2.5]" />
                <span>Transmettre mon check-in</span>
              </button>
            </div>
          </form>
        ) : ongletSportif === 'a_faire' ? (
          /* MODE 2 : SÉANCES ET QUESTIONNAIRES DU JOUR */
          <div className="space-y-6">
            {/* Séances à débriefer */}
            {(() => {
              const seancesConcernes = seances
                .filter((s) => !s.equipeId || s.equipeId === sportifConnecte.equipeId)
                .slice(0, 3);

              if (seancesConcernes.length === 0) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarCheck2 className="h-4 w-4" style={{ color: couleurPrimaire }} />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Séances de l'équipe à débriefer ({seancesConcernes.length})
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {seancesConcernes.map((s) => {
                      const dejaDebriefee = mesReponses.some(
                        (r) =>
                          r.seanceId === s.id ||
                          (r.dateJour === s.date && r.questionnaireId === 'quest-rpe-seance')
                      );

                      return (
                        <div
                          key={s.id}
                          className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-3 backdrop-blur-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="rounded px-2 py-0.5 text-[10px] font-bold"
                                  style={{
                                    backgroundColor: `${couleurPrimaire}20`,
                                    color: couleurPrimaire,
                                  }}
                                >
                                  {s.type}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {s.date} {s.heureDebut ? `à ${s.heureDebut}` : ''}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-white">{s.titre}</h3>
                              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                                <span>Durée coach : {s.dureeMinutes} min</span>
                                {s.rpePrevu !== undefined && (
                                  <span>Cible : RPE {s.rpePrevu}/10</span>
                                )}
                              </div>
                            </div>

                            {dejaDebriefee ? (
                              <span
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border shrink-0"
                                style={{
                                  backgroundColor: `${couleurPrimaire}15`,
                                  borderColor: `${couleurPrimaire}40`,
                                  color: couleurPrimaire,
                                }}
                              >
                                <Check className="h-3 w-3" /> Débriefée
                              </span>
                            ) : (
                              <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/20 shrink-0">
                                À débriefer
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const quest =
                                questionnaires.find((q) => q.id === s.questionnaireId) ||
                                questionnaires.find((q) => q.id === 'quest-rpe-seance') ||
                                questionnaires[0];
                              if (quest) demarrerQuestionnaire(quest, s);
                            }}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-md"
                            style={
                              dejaDebriefee
                                ? {
                                    backgroundColor: '#262626',
                                    color: '#d4d4d4',
                                  }
                                : {
                                    backgroundColor: couleurPrimaire,
                                    color: '#000000',
                                  }
                            }
                          >
                            <CalendarCheck2 className="h-4 w-4" />
                            <span>
                              {dejaDebriefee
                                ? 'Modifier mon débriefing'
                                : 'Débriefer cette séance (Mon RPE)'}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Questionnaires réguliers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Check-ins réguliers ({questionnairesAttribues.length})
                </h2>
                <span className="text-xs text-neutral-400">{dateAujourdhui}</span>
              </div>

              <div className="space-y-3">
                {questionnairesAttribues.map((q) => {
                  const faitAujourdhui = estRempliAujourdhui(q.id);
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3 backdrop-blur-sm hover:border-neutral-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                              {q.frequence}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              ~{q.tempsEstimeMinutes} min
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{q.titre}</h3>
                          <p className="text-xs text-neutral-400 mt-1">{q.description}</p>
                        </div>

                        {faitAujourdhui && (
                          <span
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border shrink-0"
                            style={{
                              backgroundColor: `${couleurPrimaire}15`,
                              borderColor: `${couleurPrimaire}40`,
                              color: couleurPrimaire,
                            }}
                          >
                            <Check className="h-3 w-3" /> Fait aujourd’hui
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => demarrerQuestionnaire(q)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all shadow-md"
                        style={
                          faitAujourdhui
                            ? {
                                backgroundColor: '#262626',
                                color: '#d4d4d4',
                              }
                            : {
                                backgroundColor: couleurPrimaire,
                                color: '#000000',
                              }
                        }
                      >
                        <span>
                          {faitAujourdhui ? 'Compléter à nouveau' : 'Répondre au check-in'}
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : ongletSportif === 'historique' ? (
          /* MODE 3 : HISTORIQUE & BILAN DE FORME PERSONNEL */
          <div className="space-y-4">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4 backdrop-blur-sm">
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: couleurPrimaire }}
              >
                Mon Bilan de Forme & Fatigue
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-neutral-950/70 p-4 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block mb-1">Score Wellness</span>
                  <span
                    className="text-3xl font-black"
                    style={{ color: couleurPrimaire }}
                  >
                    {wellness.scoreActuel}%
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-1">
                    Tendance : {wellness.tendance === 'hausse' ? 'Progression' : 'Stable'}
                  </span>
                </div>

                <div className="rounded-2xl bg-neutral-950/70 p-4 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block mb-1">Ratio ACWR (Charge)</span>
                  <span className="text-3xl font-black text-amber-400">{acwr.ratioACWR}</span>
                  <span className="text-[10px] text-neutral-500 block mt-1 truncate">
                    {acwr.zone === 'optimale' ? 'Zone optimale' : acwr.zone}
                  </span>
                </div>
              </div>
            </div>

            {/* Graphique MME */}
            <div className="space-y-2">
              <GraphiqueMME
                serieMME={calculerSerieMME(sportifConnecte.id, reponses, 28)}
                titre="Mon Évolution MME 7j & MME 28j"
              />
            </div>

            {/* Historique des derniers check-ins */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Mes derniers check-ins ({mesReponses.length})
              </h3>

              {mesReponses.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="font-bold text-white">{rep.dateJour}</span>
                    <span>
                      {new Date(rep.date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {Object.entries(rep.valeurs).slice(0, 4).map(([indId, val]) => {
                      const ind = indMap.get(indId);
                      return (
                        <div key={indId} className="rounded-xl bg-neutral-950/60 p-2">
                          <span className="text-[10px] text-neutral-500 block truncate">
                            {ind ? ind.nom : indId}
                          </span>
                          <span className="font-semibold text-neutral-200">
                            {ind ? formaterValeurIndicateur(ind, val) : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MODE 4 : MON ÉQUIPE & VESTIAIRE */
          <div className="space-y-5">
            {equipe ? (
              <>
                {/* Carte Identité du club */}
                <div
                  className="rounded-3xl border p-6 space-y-4 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(10, 12, 16, 0.85)',
                    borderColor: `${couleurPrimaire}40`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ClubEcusson
                        presetId={equipe.ecussonPreset}
                        logoUrl={equipe.logoUrl}
                        logoZoom={equipe.logoZoom}
                        couleur={equipe.couleur}
                        couleurSecondaire={equipe.couleurSecondaire}
                        taille="md"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Mon Club
                        </span>
                        <h3 className="text-lg font-black text-white">{equipe.nom}</h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalInvitationOuvert(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-950 transition-all shadow-md"
                      style={{ backgroundColor: couleurPrimaire }}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>QR Code & Partage</span>
                    </button>
                  </div>

                  {/* Code d'invitation à partager */}
                  <div className="flex items-center justify-between rounded-2xl bg-black/50 p-3 border border-white/10">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">
                        Code d'invitation pour vos coéquipiers :
                      </span>
                      <span
                        className="font-mono text-base font-black tracking-wider"
                        style={{ color: couleurPrimaire }}
                      >
                        {equipe.codeInvitation}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copierCodeInvitation(equipe.codeInvitation)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                      {codeCopie ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bouton pour quitter ou tester un autre club */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => quitterEquipe(sportifConnecte.id)}
                      className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Quitter cette équipe</span>
                    </button>

                    <span className="text-[11px] text-neutral-500">
                      Ambiance : {equipe.styleFond || 'stade'} • Écusson : {equipe.ecussonPreset}
                    </span>
                  </div>
                </div>

                {/* Effectif et coéquipiers (Vestiaire du club) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Vestiaire & Effectif ({coequipiers.length} athlètes)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {coequipiers.map((coeq) => {
                      const estMoi = coeq.id === sportifConnecte.id;

                      return (
                        <div
                          key={coeq.id}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-sm transition-all ${
                            estMoi
                              ? 'bg-neutral-900/90 shadow-md ring-1'
                              : 'bg-neutral-950/60 border-neutral-800/80'
                          }`}
                          style={
                            estMoi
                              ? {
                                  borderColor: couleurPrimaire,
                                  boxShadow: `0 0 15px ${couleurPrimaire}20`,
                                }
                              : {}
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-9 w-9 rounded-full aspect-square flex items-center justify-center font-bold text-xs shrink-0 border"
                              style={{
                                backgroundColor: `${couleurPrimaire}20`,
                                color: couleurPrimaire,
                                borderColor: `${couleurPrimaire}40`,
                              }}
                            >
                              {coeq.initiales}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">
                                  {coeq.prenom} {coeq.nom}
                                </span>
                                {estMoi && (
                                  <span
                                    className="text-[9px] font-black px-1.5 py-0.2 rounded-full"
                                    style={{
                                      backgroundColor: couleurPrimaire,
                                      color: '#000000',
                                    }}
                                  >
                                    MOI
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400">
                                {coeq.posteOuSpecialite || 'Sportif'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            {estMoi ? (
                              <>
                                <span
                                  className="font-mono text-xs font-bold block"
                                  style={{ color: couleurPrimaire }}
                                >
                                  {wellness.scoreActuel}%
                                </span>
                                <span className="text-[9px] text-neutral-500 uppercase">Mon Wellness</span>
                              </>
                            ) : (
                              <span className="text-[10px] text-neutral-400 font-semibold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800">
                                Coéquipier
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ONGLET 4 : MON COMPTE ATHLÈTE & SÉCURITÉ */}
        {ongletSportif === 'mon_compte' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Carte Profil Athlète */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-neutral-800 pb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl aspect-square font-black text-xl border-2 shadow-lg"
                    style={{
                      backgroundColor: `${couleurPrimaire}25`,
                      color: couleurPrimaire,
                      borderColor: `${couleurPrimaire}50`,
                    }}
                  >
                    {sportifConnecte.initiales}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <h2 className="text-xl font-black text-white">
                        {sportifConnecte.prenom} {sportifConnecte.nom}
                      </h2>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-neutral-950"
                        style={{ backgroundColor: couleurPrimaire }}
                      >
                        Compte Sportif
                      </span>
                      {compteActuel?.role === 'les_deux' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                          Coach & Joueur
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-neutral-500" />
                      <span>{compteActuel?.email || sportifConnecte.email}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={seDeconnecter}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 hover:border-neutral-600 bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Se déconnecter</span>
                </button>
              </div>

              {/* Détails du compte */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    Statut du compte
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">Actif & Sécurisé</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 block">
                    Inscrit le {compteActuel?.dateCreation || 'Récemment'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    Équipe attribuée
                  </span>
                  <div className="text-sm font-bold text-white truncate">
                    {equipe ? equipe.nom : 'Aucune équipe'}
                  </div>
                  <span className="text-[11px] text-neutral-400 block truncate">
                    {equipe ? `${equipe.discipline} • ${equipe.categorie}` : 'Athlète indépendant'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    Bilan des réponses
                  </span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {reponses.filter((r) => r.sportifId === sportifConnecte.id).length} formulaires
                  </div>
                  <span className="text-[11px] text-neutral-400 block">
                    Historique conservé
                  </span>
                </div>
              </div>

              {/* Sécurité et confidentialité */}
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>Confidentialité et Étancheité Sportif</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Votre espace athlète est strictement isolé des outils entraîneurs. Votre mot de passe est sécurisé par hachage cryptographique SHA-256. Seul votre staff technique a accès à vos bilans de charge ACWR et wellness dans le cadre du suivi de performance.
                </p>
              </div>

              {/* ZONE CRITIQUE : SUPPRESSION DÉFINITIVE DU COMPTE SPORTIF */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Zone Critique : Supprimer mon compte Sportif
                  </h3>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  La suppression de votre compte est définitive. Toutes vos données seront irrémédiablement effacées de cet appareil : profil joueur, réponses aux questionnaires matinaux, débriefings de séances RPE Borg, et rattachement à votre équipe.
                </p>

                {!confirmerSuppressionAthlete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmerSuppressionAthlete(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-500/50 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer définitivement mon compte</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-rose-500/50 space-y-3 animate-in fade-in">
                    <p className="text-xs text-rose-300 font-bold">
                      Êtes-vous absolument sûr de vouloir supprimer votre compte athlète ? Cette opération ne peut pas être annulée.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          await supprimerCompte(compteActuel?.id || sportifConnecte.id);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
                      >
                        Oui, supprimer définitivement
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmerSuppressionAthlete(false)}
                        className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PIED DE PAGE DU PORTAIL ATHLÈTE AVEC OPTION DE SUPPRESSION DE COMPTE */}
        <div className="pt-8 pb-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Portail Athlète Personnel • Espace strictement confidentiel</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setOngletSportif('mon_compte');
                setQuestionnaireActif(null);
              }}
              className="text-neutral-400 hover:text-emerald-400 underline cursor-pointer"
            >
              Gérer mon compte
            </button>
          </div>
          {!confirmerSuppressionAthlete ? (
            <button
              type="button"
              onClick={() => setConfirmerSuppressionAthlete(true)}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-rose-400 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Supprimer mon compte</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-rose-500/40 animate-in fade-in">
              <span className="text-rose-400 font-bold text-xs">Supprimer définitivement ce compte ?</span>
              <button
                type="button"
                onClick={async () => {
                  await supprimerCompte(compteActuel?.id || sportifConnecte.id);
                }}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors cursor-pointer"
              >
                Oui, supprimer
              </button>
              <button
                type="button"
                onClick={() => setConfirmerSuppressionAthlete(false)}
                className="px-3 py-1 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modales contextuelles */}
      {equipe && (
        <InvitationEquipeModal
          ouvert={modalInvitationOuvert}
          surFermer={() => setModalInvitationOuvert(false)}
          equipe={equipe}
        />
      )}

      <ConnexionModal
        ouvert={modalConnexionOuvert}
        surFermer={() => setModalConnexionOuvert(false)}
      />
    </AmbienceFond>
  );
};
