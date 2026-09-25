import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  RoleUtilisateur,
  Indicateur,
  Equipe,
  Sportif,
  Questionnaire,
  ReponseQuestionnaire,
  ParametresClub,
  Seance,
  PhaseSaison,
  EchellePersonnalisee,
  DemandeAdhesion,
  ToastNotification,
  ProfilCompte,
  RoleCompte,
  Clubhouse,
  CompteUtilisateur,
  ActionHistorique,
  TypeActionHistorique,
} from '../types';
import {
  DONNEES_PARAMETRES_INITIALES,
  INDICATEURS_INITIAUX,
  EQUIPES_INITIALES,
  SPORTIFS_INITIAUX,
  QUESTIONNAIRES_INITIAUX,
  SEANCES_INITIALES,
  GENERER_REPONSES_INITIALES,
  ECHELLES_INITIALES,
  CLUBHOUSE_INITIAL,
} from '../data/initialData';
import { PHASES_SAISON_DEFAUT } from '../utils/analytics';
import { evaluerToutesAlertes } from '../utils/evaluation';
import { hacherMotDePasse, verifierMotDePasse } from '../utils/crypto';

interface AppContextType {
  roleActuel: RoleUtilisateur;
  setRoleActuel: (role: RoleUtilisateur) => void;
  sportifConnecteId: string;
  setSportifConnecteId: (id: string) => void;
  sportifConnecte: Sportif | null;

  // Clubhouse (style VEO Cam)
  clubhouse: Clubhouse;
  modifierClubhouse: (updates: Partial<Clubhouse>) => void;
  supprimerClubhouse: () => void;
  clubhouseEstConfigure: boolean;
  equipesDuCoach: Equipe[];

  sportifs: Sportif[];
  equipes: Equipe[];
  indicateurs: Indicateur[];
  echelles: EchellePersonnalisee[];
  questionnaires: Questionnaire[];
  seances: Seance[];
  phasesSaison: PhaseSaison[];
  reponses: ReponseQuestionnaire[];
  parametres: ParametresClub;

  // Échelles personnalisées & Borg
  ajouterEchelle: (ech: Omit<EchellePersonnalisee, 'id'>) => EchellePersonnalisee;
  modifierEchelle: (id: string, updates: Partial<EchellePersonnalisee>) => void;
  supprimerEchelle: (id: string) => boolean;
  dupliquerEchelle: (id: string) => EchellePersonnalisee;

  // Indicateurs
  ajouterIndicateur: (ind: Omit<Indicateur, 'id'>) => Indicateur;
  modifierIndicateur: (id: string, ind: Partial<Indicateur>) => void;
  supprimerIndicateur: (id: string) => boolean;
  dupliquerIndicateur: (id: string) => void;

  // Questionnaires
  ajouterQuestionnaire: (quest: Omit<Questionnaire, 'id' | 'dateCreation'>) => Questionnaire;
  modifierQuestionnaire: (id: string, quest: Partial<Questionnaire>) => void;
  supprimerQuestionnaire: (id: string) => void;

  // Séances
  ajouterSeance: (seance: Omit<Seance, 'id' | 'dateCreation'>) => Seance;
  modifierSeance: (id: string, seance: Partial<Seance>) => void;
  supprimerSeance: (id: string) => void;

  // Planification Saison
  modifierPhaseSaison: (id: string, updates: Partial<PhaseSaison>) => void;
  ajouterPhaseSaison: (phase: Omit<PhaseSaison, 'id'>) => PhaseSaison;

  // Sportifs
  ajouterSportif: (sp: Omit<Sportif, 'id' | 'dateAjout' | 'initiales'>) => Sportif;
  modifierSportif: (id: string, sp: Partial<Sportif>) => void;
  supprimerSportif: (id: string) => void;

  // Équipes
  ajouterEquipe: (eq: Omit<Equipe, 'id' | 'dateCreation'>) => Equipe;
  modifierEquipe: (id: string, eq: Partial<Equipe>) => void;
  supprimerEquipe: (id: string) => void;
  retirerSportifEquipe: (sportifId: string, equipeId: string) => void;
  rejoindreEquipeDirectement: (sportifId: string, equipeId: string) => void;
  quitterEquipe: (sportifId: string) => void;

  // Demandes d'adhésion d'équipe (sportifs <-> entraîneurs)
  demandesAdhesion: DemandeAdhesion[];
  creerDemandeAdhesion: (sportifId: string, equipeId: string, messageMotivation?: string) => DemandeAdhesion | null;
  accepterDemandeAdhesion: (demandeId: string) => void;
  refuserDemandeAdhesion: (demandeId: string) => void;

  // Système de Toasts Notifications
  toasts: ToastNotification[];
  ajouterToast: (toast: Omit<ToastNotification, 'id' | 'dateCreation'>) => void;
  supprimerToast: (id: string) => void;

  // Profil du compte utilisateur
  profilCompte: ProfilCompte;
  mettreAJourProfilCompte: (updates: Partial<ProfilCompte>) => void;

  // Session & Authentification sécurisée
  estConnecte: boolean;
  compteActuel: CompteUtilisateur | null;
  comptesEnregistres: CompteUtilisateur[];
  creerCompte: (donnees: {
    email: string;
    motDePasse: string;
    role: RoleCompte;
    nom: string;
    prenom: string;
    seSouvenir?: boolean;
    equipeId?: string | null;
  }) => Promise<{ succes: boolean; erreur?: string }>;
  connecterCompte: (donnees: {
    email: string;
    motDePasse: string;
    seSouvenir?: boolean;
  }) => Promise<{ succes: boolean; erreur?: string }>;
  supprimerCompte: (compteId?: string) => Promise<boolean>;
  seConnecter: (
    role: RoleUtilisateur,
    options?: {
      roleCompte?: RoleCompte;
      sportifId?: string;
      profil?: Partial<ProfilCompte>;
    }
  ) => void;
  seDeconnecter: () => void;

  // Historique des manipulations & Système d'annulation (Undo / Restore)
  historiqueActions: ActionHistorique[];
  enregistrerAction: (action: Omit<ActionHistorique, 'id' | 'date'>) => ActionHistorique;
  restaurerAction: (actionId: string) => boolean;
  supprimerEntreeHistorique: (actionId: string) => void;

  // Filtrage global d'équipe
  filtreEquipeId: string | null;
  setFiltreEquipeId: (id: string | null) => void;

  // Réponses
  soumettreReponse: (donnees: {
    questionnaireId: string;
    sportifId: string;
    seanceId?: string | null;
    valeurs: Record<string, any>;
    commentaireGeneral?: string;
  }) => ReponseQuestionnaire;
  supprimerReponse: (id: string) => void;

  // Paramètres
  modifierParametres: (updates: Partial<ParametresClub>) => void;
  reinitialiserDonnees: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INDICATEURS: 'athletik_indicateurs_v2',
  ECHELLES: 'athletik_echelles_v2',
  EQUIPES: 'athletik_equipes_clean_v1',
  SPORTIFS: 'athletik_sportifs_clean_v1',
  QUESTIONNAIRES: 'athletik_questionnaires_v2',
  SEANCES: 'athletik_seances_clean_v1',
  PHASES_SAISON: 'athletik_phases_saison_v2',
  REPONSES: 'athletik_reponses_clean_v1',
  PARAMETRES: 'athletik_parametres_v2',
  ROLE: 'athletik_role_v2',
  SPORTIF_CONNECTE: 'athletik_sportif_connecte_v2',
  DEMANDES: 'athletik_demandes_v2',
  PROFIL: 'athletik_profil_v2',
  FILTRE_EQUIPE: 'athletik_filtre_equipe_v2',
  EST_CONNECTE: 'athletik_est_connecte_v3',
  CLUBHOUSE: 'athletik_clubhouse_clean_v1',
  COMPTES: 'athletik_comptes_v2',
  COMPTE_ACTUEL: 'athletik_compte_actuel_v2',
  HISTORIQUE_ACTIONS: 'athletik_historique_actions_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Liste de tous les comptes enregistrés
  const [comptesEnregistres, setComptesEnregistres] = useState<CompteUtilisateur[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Compte utilisateur actuellement actif
  const [compteActuel, setCompteActuel] = useState<CompteUtilisateur | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPTE_ACTUEL);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Clubhouse (style VEO Cam)
  const [clubhouse, setClubhouse] = useState<Clubhouse>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLUBHOUSE);
      return saved ? JSON.parse(saved) : CLUBHOUSE_INITIAL;
    } catch {
      return CLUBHOUSE_INITIAL;
    }
  });

  // Session connectée
  const [estConnecte, setEstConnecte] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.EST_CONNECTE) === 'true';
  });

  // Rôle et sportif sélectionné
  const [roleActuel, setRoleActuelState] = useState<RoleUtilisateur>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE) as RoleUtilisateur;
    return saved === 'sportif' ? 'sportif' : 'entraineur';
  });

  const [sportifConnecteId, setSportifConnecteIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SPORTIF_CONNECTE) || '';
  });

  // Historique des manipulations d'audit (avec Undo)
  const [historiqueActions, setHistoriqueActions] = useState<ActionHistorique[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORIQUE_ACTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // États persistants
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INDICATEURS);
      return saved ? JSON.parse(saved) : INDICATEURS_INITIAUX;
    } catch {
      return INDICATEURS_INITIAUX;
    }
  });

  const [echelles, setEchelles] = useState<EchellePersonnalisee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ECHELLES);
      if (saved) {
        const parsed: EchellePersonnalisee[] = JSON.parse(saved);
        const borgCR10Existe = parsed.some((e) => e.id === 'ech-borg-cr10' || e.code === 'BORG_CR10');
        const borg620Existe = parsed.some((e) => e.id === 'ech-borg-6-20' || e.code === 'BORG_6_20');
        const list = [...parsed];
        if (!borgCR10Existe) {
          const b10 = ECHELLES_INITIALES.find((e) => e.id === 'ech-borg-cr10');
          if (b10) list.unshift(b10);
        }
        if (!borg620Existe) {
          const b20 = ECHELLES_INITIALES.find((e) => e.id === 'ech-borg-6-20');
          if (b20) list.splice(1, 0, b20);
        }
        return list;
      }
      return ECHELLES_INITIALES;
    } catch {
      return ECHELLES_INITIALES;
    }
  });

  const [equipes, setEquipes] = useState<Equipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EQUIPES);
      return saved ? JSON.parse(saved) : EQUIPES_INITIALES;
    } catch {
      return EQUIPES_INITIALES;
    }
  });

  const [sportifs, setSportifs] = useState<Sportif[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPORTIFS);
      return saved ? JSON.parse(saved) : SPORTIFS_INITIAUX;
    } catch {
      return SPORTIFS_INITIAUX;
    }
  });

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONNAIRES);
      return saved ? JSON.parse(saved) : QUESTIONNAIRES_INITIAUX;
    } catch {
      return QUESTIONNAIRES_INITIAUX;
    }
  });

  const [seances, setSeances] = useState<Seance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEANCES);
      return saved ? JSON.parse(saved) : SEANCES_INITIALES;
    } catch {
      return SEANCES_INITIALES;
    }
  });

  const [phasesSaison, setPhasesSaison] = useState<PhaseSaison[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHASES_SAISON);
      return saved ? JSON.parse(saved) : PHASES_SAISON_DEFAUT;
    } catch {
      return PHASES_SAISON_DEFAUT;
    }
  });

  const [reponses, setReponses] = useState<ReponseQuestionnaire[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPONSES);
      return saved ? JSON.parse(saved) : GENERER_REPONSES_INITIALES();
    } catch {
      return GENERER_REPONSES_INITIALES();
    }
  });

  const [parametres, setParametres] = useState<ParametresClub>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARAMETRES);
      return saved ? JSON.parse(saved) : DONNEES_PARAMETRES_INITIALES;
    } catch {
      return DONNEES_PARAMETRES_INITIALES;
    }
  });

  // Sauvegardes persistantes automatiques
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPTES, JSON.stringify(comptesEnregistres));
  }, [comptesEnregistres]);

  useEffect(() => {
    if (compteActuel) {
      if (compteActuel.seSouvenir) {
        localStorage.setItem(STORAGE_KEYS.COMPTE_ACTUEL, JSON.stringify(compteActuel));
      } else {
        localStorage.removeItem(STORAGE_KEYS.COMPTE_ACTUEL);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.COMPTE_ACTUEL);
    }
  }, [compteActuel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORIQUE_ACTIONS, JSON.stringify(historiqueActions));
  }, [historiqueActions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, roleActuel);
  }, [roleActuel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPORTIF_CONNECTE, sportifConnecteId);
  }, [sportifConnecteId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INDICATEURS, JSON.stringify(indicateurs));
  }, [indicateurs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ECHELLES, JSON.stringify(echelles));
  }, [echelles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EQUIPES, JSON.stringify(equipes));
  }, [equipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPORTIFS, JSON.stringify(sportifs));
  }, [sportifs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONNAIRES, JSON.stringify(questionnaires));
  }, [questionnaires]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEANCES, JSON.stringify(seances));
  }, [seances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHASES_SAISON, JSON.stringify(phasesSaison));
  }, [phasesSaison]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPONSES, JSON.stringify(reponses));
  }, [reponses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARAMETRES, JSON.stringify(parametres));
  }, [parametres]);

  // Demandes d'adhésion
  const [demandesAdhesion, setDemandesAdhesion] = useState<DemandeAdhesion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMANDES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandesAdhesion));
  }, [demandesAdhesion]);

  // Notifications Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Profil du compte actif
  const [profilCompte, setProfilCompte] = useState<ProfilCompte>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFIL);
      if (saved) return JSON.parse(saved);
      return {
        id: 'usr-default',
        nom: '',
        prenom: '',
        email: '',
        role: 'entraineur',
        themeCouleur: '#10b981',
        ambiancePreferee: 'terrain',
        dateInscription: new Date().toISOString().split('T')[0],
      };
    } catch {
      return {
        id: 'usr-default',
        nom: '',
        prenom: '',
        email: '',
        role: 'entraineur',
        themeCouleur: '#10b981',
        ambiancePreferee: 'terrain',
        dateInscription: new Date().toISOString().split('T')[0],
      };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFIL, JSON.stringify(profilCompte));
  }, [profilCompte]);

  // Filtre équipe actif
  const [filtreEquipeId, setFiltreEquipeIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.FILTRE_EQUIPE) || null;
  });

  const setFiltreEquipeId = (id: string | null) => {
    setFiltreEquipeIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.FILTRE_EQUIPE, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.FILTRE_EQUIPE);
    }
  };

  const ajouterToast = useCallback((toast: Omit<ToastNotification, 'id' | 'dateCreation'>) => {
    const nouveau: ToastNotification = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dateCreation: new Date().toISOString(),
    };
    setToasts((prev) => [nouveau, ...prev.slice(0, 5)]);
  }, []);

  const supprimerToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Moteur d'Historique des Manipulations & Restauration (Undo) ---
  const enregistrerAction = useCallback(
    (action: Omit<ActionHistorique, 'id' | 'date'>): ActionHistorique => {
      const nouvelle: ActionHistorique = {
        ...action,
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: new Date().toISOString(),
        estRestaure: false,
      };

      setHistoriqueActions((prev) => [nouvelle, ...prev.slice(0, 99)]);
      return nouvelle;
    },
    []
  );

  const supprimerEntreeHistorique = useCallback((actionId: string) => {
    setHistoriqueActions((prev) => prev.filter((a) => a.id !== actionId));
  }, []);

  const restaurerAction = useCallback(
    (actionId: string): boolean => {
      const action = historiqueActions.find((a) => a.id === actionId);
      if (!action || !action.peutRestaurer || action.estRestaure) {
        return false;
      }

      try {
        switch (action.type) {
          case 'suppression_equipe': {
            const eqRestaurer: Equipe = action.donneesAvant?.equipe;
            if (!eqRestaurer) return false;
            setEquipes((prev) => {
              if (prev.some((e) => e.id === eqRestaurer.id)) return prev;
              return [...prev, eqRestaurer];
            });

            // Réaffecter les sportifs rattachés
            const sportifsIds: string[] = action.donneesAvant?.sportifsIds || [];
            if (sportifsIds.length > 0) {
              setSportifs((prev) =>
                prev.map((s) => (sportifsIds.includes(s.id) ? { ...s, equipeId: eqRestaurer.id } : s))
              );
            }
            break;
          }

          case 'suppression_sportif': {
            const spRestaurer: Sportif = action.donneesAvant?.sportif;
            if (!spRestaurer) return false;
            setSportifs((prev) => {
              if (prev.some((s) => s.id === spRestaurer.id)) return prev;
              return [...prev, spRestaurer];
            });

            const reponsesRestaurer: ReponseQuestionnaire[] = action.donneesAvant?.reponses || [];
            if (reponsesRestaurer.length > 0) {
              setReponses((prev) => [...reponsesRestaurer, ...prev]);
            }
            break;
          }

          case 'suppression_clubhouse': {
            const clRestaurer: Clubhouse = action.donneesAvant?.clubhouse;
            if (!clRestaurer) return false;
            setClubhouse(clRestaurer);
            localStorage.setItem(STORAGE_KEYS.CLUBHOUSE, JSON.stringify(clRestaurer));

            if (action.donneesAvant?.equipes) {
              const eqList: Equipe[] = action.donneesAvant.equipes;
              setEquipes((prev) => {
                const existants = new Set(prev.map((e) => e.id));
                const aAjouter = eqList.filter((e) => !existants.has(e.id));
                return [...prev, ...aAjouter];
              });
            }

            if (compteActuel) {
              setCompteActuel((prev) => (prev ? { ...prev, clubhouseCree: true } : null));
              setComptesEnregistres((prev) =>
                prev.map((c) => (c.id === compteActuel.id ? { ...c, clubhouseCree: true } : c))
              );
            }
            break;
          }

          case 'suppression_seance': {
            const seanceRestaurer: Seance = action.donneesAvant?.seance;
            if (!seanceRestaurer) return false;
            setSeances((prev) => {
              if (prev.some((s) => s.id === seanceRestaurer.id)) return prev;
              return [seanceRestaurer, ...prev];
            });
            break;
          }

          case 'suppression_questionnaire': {
            const questRestaurer: Questionnaire = action.donneesAvant?.questionnaire;
            if (!questRestaurer) return false;
            setQuestionnaires((prev) => {
              if (prev.some((q) => q.id === questRestaurer.id)) return prev;
              return [questRestaurer, ...prev];
            });
            break;
          }

          case 'creation_equipe': {
            // Annuler la création = supprimer l'équipe créée
            if (action.entiteId) {
              setEquipes((prev) => prev.filter((e) => e.id !== action.entiteId));
            }
            break;
          }

          case 'creation_sportif': {
            if (action.entiteId) {
              setSportifs((prev) => prev.filter((s) => s.id !== action.entiteId));
            }
            break;
          }

          default:
            return false;
        }

        // Marquer l'action comme restaurée
        setHistoriqueActions((prev) =>
          prev.map((a) => (a.id === actionId ? { ...a, estRestaure: true } : a))
        );

        ajouterToast({
          titre: 'Action restaurée avec succès',
          message: `L'action "${action.titre}" a été annulée et les données ont été rétablies.`,
          type: 'succes',
        });

        return true;
      } catch (err) {
        console.error('Erreur lors de la restauration :', err);
        ajouterToast({
          titre: 'Erreur de restauration',
          message: "Impossible d'annuler cette action.",
          type: 'alerte',
        });
        return false;
      }
    },
    [historiqueActions, compteActuel, ajouterToast]
  );

  // --- Gestion Multi-Comptes Sécurisés ---
  const creerCompte = async (donnees: {
    email: string;
    motDePasse: string;
    role: RoleCompte;
    nom: string;
    prenom: string;
    seSouvenir?: boolean;
    equipeId?: string | null;
  }): Promise<{ succes: boolean; erreur?: string }> => {
    const emailNettoye = donnees.email.trim().toLowerCase();
    if (!emailNettoye || !donnees.motDePasse) {
      return { succes: false, erreur: 'Veuillez saisir une adresse e-mail et un mot de passe valides.' };
    }

    if (donnees.motDePasse.length < 4) {
      return { succes: false, erreur: 'Le mot de passe doit comporter au moins 4 caractères.' };
    }

    // Vérifier l'unicité de l'adresse e-mail
    const emailExiste = comptesEnregistres.some((c) => c.email.toLowerCase() === emailNettoye);
    if (emailExiste) {
      return { succes: false, erreur: 'Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter.' };
    }

    // Hachage sécurisé SHA-256 (jamais de mot de passe en clair)
    const hash = await hacherMotDePasse(donnees.motDePasse);

    const compteId = `usr-${Date.now()}`;
    let sportifIdAssocie: string | undefined = undefined;

    // Si rôle sportif, créer automatiquement son profil athlète vierge
    if (donnees.role === 'sportif' || donnees.role === 'les_deux') {
      const spId = `sp-${Date.now()}`;
      sportifIdAssocie = spId;
      const initiales = `${donnees.prenom.charAt(0)}${donnees.nom.charAt(0)}`.toUpperCase();

      const nouvelAthlete: Sportif = {
        id: spId,
        prenom: donnees.prenom.trim(),
        nom: donnees.nom.trim(),
        email: emailNettoye,
        equipeId: donnees.equipeId || null,
        posteOuSpecialite: 'Athlète',
        statut: 'Actif',
        autoriserHistorique: true,
        initiales,
        dateAjout: new Date().toISOString().split('T')[0],
      };

      setSportifs((prev) => [...prev, nouvelAthlete]);
      setSportifConnecteIdState(spId);
      localStorage.setItem(STORAGE_KEYS.SPORTIF_CONNECTE, spId);
    }

    const nouveauCompte: CompteUtilisateur = {
      id: compteId,
      email: emailNettoye,
      motDePasseHash: hash,
      role: donnees.role,
      nom: donnees.nom.trim(),
      prenom: donnees.prenom.trim(),
      dateCreation: new Date().toISOString().split('T')[0],
      seSouvenir: !!donnees.seSouvenir,
      clubhouseCree: false, // Doit être configuré par l'entraîneur à son premier accès
      sportifIdAssocie,
      equipeId: donnees.equipeId || null,
    };

    setComptesEnregistres((prev) => [...prev, nouveauCompte]);
    setCompteActuel(nouveauCompte);

    // Initialiser le profil utilisateur
    const roleApp: RoleUtilisateur = donnees.role === 'sportif' ? 'sportif' : 'entraineur';
    setRoleActuelState(roleApp);
    localStorage.setItem(STORAGE_KEYS.ROLE, roleApp);

    setProfilCompte({
      id: compteId,
      nom: donnees.nom.trim(),
      prenom: donnees.prenom.trim(),
      email: emailNettoye,
      role: donnees.role,
      sportifIdAssocie,
      themeCouleur: '#10b981',
      ambiancePreferee: 'terrain',
      dateInscription: nouveauCompte.dateCreation,
    });

    setEstConnecte(true);
    localStorage.setItem(STORAGE_KEYS.EST_CONNECTE, 'true');

    enregistrerAction({
      type: 'autre',
      titre: `Création du compte (${donnees.role})`,
      description: `Création du compte de ${donnees.prenom} ${donnees.nom} (${emailNettoye}).`,
      auteurId: compteId,
      auteurNom: `${donnees.prenom} ${donnees.nom}`,
      auteurRole: roleApp,
      peutRestaurer: false,
    });

    ajouterToast({
      titre: 'Compte créé avec succès !',
      message: `Bienvenue ${donnees.prenom}. Votre mot de passe est sécurisé et votre session est active.`,
      type: 'succes',
    });

    return { succes: true };
  };

  const connecterCompte = async (donnees: {
    email: string;
    motDePasse: string;
    seSouvenir?: boolean;
  }): Promise<{ succes: boolean; erreur?: string }> => {
    const emailNettoye = donnees.email.trim().toLowerCase();
    const compte = comptesEnregistres.find((c) => c.email.toLowerCase() === emailNettoye);

    if (!compte) {
      return {
        succes: false,
        erreur: "Aucun compte n'a été trouvé avec cet e-mail. Veuillez vérifier ou créer un compte.",
      };
    }

    const motDePasseCorrect = await verifierMotDePasse(donnees.motDePasse, compte.motDePasseHash);
    if (!motDePasseCorrect) {
      return { succes: false, erreur: 'Mot de passe incorrect. Veuillez réessayer.' };
    }

    // Mise à jour de l'option "Se souvenir de moi"
    const compteMaj: CompteUtilisateur = {
      ...compte,
      seSouvenir: donnees.seSouvenir !== undefined ? donnees.seSouvenir : compte.seSouvenir,
    };

    setCompteActuel(compteMaj);
    setComptesEnregistres((prev) =>
      prev.map((c) => (c.id === compte.id ? compteMaj : c))
    );

    const roleApp: RoleUtilisateur = compte.role === 'sportif' ? 'sportif' : 'entraineur';
    setRoleActuelState(roleApp);
    localStorage.setItem(STORAGE_KEYS.ROLE, roleApp);

    if (compte.sportifIdAssocie) {
      setSportifConnecteIdState(compte.sportifIdAssocie);
      localStorage.setItem(STORAGE_KEYS.SPORTIF_CONNECTE, compte.sportifIdAssocie);
    }

    setProfilCompte({
      id: compte.id,
      nom: compte.nom,
      prenom: compte.prenom,
      email: compte.email,
      role: compte.role,
      sportifIdAssocie: compte.sportifIdAssocie,
      themeCouleur: '#10b981',
      ambiancePreferee: 'terrain',
      dateInscription: compte.dateCreation,
    });

    setEstConnecte(true);
    localStorage.setItem(STORAGE_KEYS.EST_CONNECTE, 'true');

    ajouterToast({
      titre: `Ravi de vous revoir, ${compte.prenom} !`,
      message: `Connexion réussie en mode ${compte.role === 'sportif' ? 'Sportif' : 'Entraîneur'}.`,
      type: 'succes',
    });

    return { succes: true };
  };

  const supprimerCompte = async (compteId?: string): Promise<boolean> => {
    const idCible = compteId || compteActuel?.id || sportifConnecteId;
    if (!idCible) return false;

    // Chercher le compte dans la liste enregistrée
    const compteASupprimer = comptesEnregistres.find(
      (c) =>
        c.id === idCible ||
        c.sportifIdAssocie === idCible ||
        c.email.toLowerCase() === idCible.toLowerCase()
    );

    // Déterminer l'id du profil athlète rattaché (s'il existe)
    const spId = compteASupprimer?.sportifIdAssocie || (sportifs.some((s) => s.id === idCible) ? idCible : undefined);

    if (spId) {
      setSportifs((prev) => prev.filter((s) => s.id !== spId));
      setReponses((prev) => prev.filter((r) => r.sportifId !== spId));
      setDemandesAdhesion((prev) => prev.filter((d) => d.sportifId !== spId));
    }

    // Si entraîneur, détacher ou nettoyer son clubhouse
    const estCoach = !compteASupprimer || compteASupprimer.role === 'entraineur' || compteASupprimer.role === 'les_deux';
    if (estCoach) {
      if (
        clubhouse.proprietaireCoachId === idCible ||
        (compteASupprimer && clubhouse.proprietaireCoachId === compteASupprimer.id) ||
        !clubhouse.proprietaireCoachId
      ) {
        setClubhouse(CLUBHOUSE_INITIAL);
        localStorage.removeItem(STORAGE_KEYS.CLUBHOUSE);
      }
    }

    // Supprimer le compte de la liste enregistrée
    if (compteASupprimer) {
      setComptesEnregistres((prev) => prev.filter((c) => c.id !== compteASupprimer.id));
    } else {
      setComptesEnregistres((prev) =>
        prev.filter((c) => c.id !== idCible && c.sportifIdAssocie !== idCible)
      );
    }

    // Vérifier si le compte supprimé est le compte actuellement actif en session
    const estCompteActif =
      compteActuel?.id === idCible ||
      compteActuel?.sportifIdAssocie === idCible ||
      compteASupprimer?.id === compteActuel?.id ||
      sportifConnecteId === idCible ||
      !compteId;

    if (estCompteActif) {
      setCompteActuel(null);
      setEstConnecte(false);
      setSportifConnecteIdState('');
      localStorage.removeItem(STORAGE_KEYS.COMPTE_ACTUEL);
      localStorage.removeItem(STORAGE_KEYS.EST_CONNECTE);
      localStorage.removeItem(STORAGE_KEYS.SPORTIF_CONNECTE);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
    }

    const nomAuteur = compteASupprimer
      ? `${compteASupprimer.prenom} ${compteASupprimer.nom}`
      : 'Utilisateur';

    const roleAuteur = compteASupprimer?.role || roleActuel;

    enregistrerAction({
      type: 'autre',
      titre: `Suppression du compte (${roleAuteur})`,
      description: `Le compte de ${nomAuteur} a été supprimé définitivement.`,
      auteurId: idCible,
      auteurNom: nomAuteur,
      auteurRole: roleAuteur,
      peutRestaurer: false,
    });

    ajouterToast({
      titre: 'Compte supprimé définitivement',
      message: 'Le compte et l’ensemble des données associées ont été supprimés avec succès.',
      type: 'info',
    });

    return true;
  };

  const seConnecter = (
    role: RoleUtilisateur,
    options?: {
      roleCompte?: RoleCompte;
      sportifId?: string;
      profil?: Partial<ProfilCompte>;
    }
  ) => {
    // Verrouillage de sécurité : un compte sportif ne peut pas basculer en entraîneur
    if (compteActuel && compteActuel.role === 'sportif' && role === 'entraineur') {
      ajouterToast({
        titre: 'Accès restreint',
        message: 'Votre compte sportif ne dispose pas des droits nécessaires pour accéder à l’interface entraîneur.',
        type: 'alerte',
      });
      return;
    }

    setRoleActuelState(role);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);

    if (options?.sportifId) {
      setSportifConnecteIdState(options.sportifId);
      localStorage.setItem(STORAGE_KEYS.SPORTIF_CONNECTE, options.sportifId);
    }

    if (options?.roleCompte || options?.profil) {
      setProfilCompte((prev) => ({
        ...prev,
        ...(options.profil || {}),
        role: options.roleCompte || prev.role,
        sportifIdAssocie: options.sportifId || prev.sportifIdAssocie,
      }));
    }

    setEstConnecte(true);
    localStorage.setItem(STORAGE_KEYS.EST_CONNECTE, 'true');
  };

  const seDeconnecter = () => {
    setEstConnecte(false);
    localStorage.removeItem(STORAGE_KEYS.EST_CONNECTE);

    if (compteActuel && !compteActuel.seSouvenir) {
      setCompteActuel(null);
      localStorage.removeItem(STORAGE_KEYS.COMPTE_ACTUEL);
    }

    ajouterToast({
      titre: 'Déconnexion effectuée',
      message: 'Vous êtes retourné à l’accueil. Vos données restent enregistrées.',
      type: 'info',
    });
  };

  // Verrouillage technique du commutateur de rôle
  const setRoleActuel = (role: RoleUtilisateur) => {
    if (compteActuel && compteActuel.role === 'sportif' && role === 'entraineur') {
      ajouterToast({
        titre: 'Accès interdit',
        message: 'Les sportifs ne peuvent pas accéder à l’interface d’entraînement ni aux paramètres du club.',
        type: 'alerte',
      });
      return;
    }
    setRoleActuelState(role);
  };

  const setSportifConnecteId = (id: string) => {
    setSportifConnecteIdState(id);
  };

  const sportifConnecte =
    sportifs.find((s) => s.id === sportifConnecteId) ||
    sportifs.find((s) => s.id === compteActuel?.sportifIdAssocie) ||
    null;

  // Clubhouse est configuré s'il a un nom et un identifiant
  const clubhouseEstConfigure = !!(clubhouse.id && clubhouse.nom.trim());

  // --- Clubhouse CRUD & Suppression ---
  const modifierClubhouse = (updates: Partial<Clubhouse>) => {
    setClubhouse((prev) => {
      const maj: Clubhouse = {
        ...prev,
        ...updates,
        id: prev.id || `clubhouse-${Date.now()}`,
        proprietaireCoachId: prev.proprietaireCoachId || compteActuel?.id || 'coach-id',
      };
      localStorage.setItem(STORAGE_KEYS.CLUBHOUSE, JSON.stringify(maj));
      return maj;
    });

    if (compteActuel) {
      const compteMaj = { ...compteActuel, clubhouseCree: true };
      setCompteActuel(compteMaj);
      setComptesEnregistres((prev) =>
        prev.map((c) => (c.id === compteActuel.id ? compteMaj : c))
      );
    }

    enregistrerAction({
      type: 'modification_clubhouse',
      titre: 'Mise à jour du Clubhouse',
      description: `Configuration du Clubhouse "${updates.nom || clubhouse.nom || 'Clubhouse'}".`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: clubhouse,
      donneesApres: updates,
      peutRestaurer: false,
    });
  };

  const supprimerClubhouse = () => {
    const clubhouseSnapshot = { ...clubhouse };
    const equipesSnapshot = [...equipes];

    enregistrerAction({
      type: 'suppression_clubhouse',
      titre: `Suppression du Clubhouse "${clubhouseSnapshot.nom}"`,
      description: `Le Clubhouse "${clubhouseSnapshot.nom}" a été supprimé/réinitialisé.`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: { clubhouse: clubhouseSnapshot, equipes: equipesSnapshot },
      donneesApres: null,
      peutRestaurer: true,
      entiteId: clubhouseSnapshot.id,
      entiteType: 'clubhouse',
    });

    // Réinitialiser le Clubhouse à l'état vierge
    setClubhouse(CLUBHOUSE_INITIAL);
    localStorage.removeItem(STORAGE_KEYS.CLUBHOUSE);

    if (compteActuel) {
      const compteMaj = { ...compteActuel, clubhouseCree: false };
      setCompteActuel(compteMaj);
      setComptesEnregistres((prev) =>
        prev.map((c) => (c.id === compteActuel.id ? compteMaj : c))
      );
    }

    ajouterToast({
      titre: 'Clubhouse réinitialisé',
      message: 'Votre Clubhouse a été supprimé. Vous pouvez en créer un nouveau ou restaurer l’ancien depuis l’Historique.',
      type: 'info',
    });
  };

  const equipesDuCoach = equipes.filter((e) => {
    if (!clubhouse.id) return true;
    return e.clubhouseId === clubhouse.id || !e.clubhouseId || e.creeParCoachId === compteActuel?.id;
  });

  // --- Équipes CRUD & Suppression avec Undo ---
  const ajouterEquipe = (eq: Omit<Equipe, 'id' | 'dateCreation'>): Equipe => {
    const codeInvitation =
      eq.codeInvitation?.trim() ||
      `${(eq.nom || 'ATH').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ATH')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const nouvelle: Equipe = {
      ...eq,
      codeInvitation,
      logoZoom: eq.logoZoom || 100,
      id: `eq-${Date.now()}`,
      clubhouseId: clubhouse.id || undefined,
      creeParCoachId: compteActuel?.id || profilCompte.id,
      dateCreation: new Date().toISOString().split('T')[0],
    };

    setEquipes((prev) => [...prev, nouvelle]);

    enregistrerAction({
      type: 'creation_equipe',
      titre: `Création de l'équipe "${nouvelle.nom}"`,
      description: `Création de l'équipe "${nouvelle.nom}" (Code : ${codeInvitation}).`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: null,
      donneesApres: nouvelle,
      peutRestaurer: true,
      entiteId: nouvelle.id,
      entiteType: 'equipe',
    });

    ajouterToast({
      titre: 'Équipe créée avec succès',
      message: `L'équipe "${nouvelle.nom}" est opérationnelle. Code d'invitation : ${codeInvitation}`,
      type: 'succes',
      equipeId: nouvelle.id,
    });

    return nouvelle;
  };

  const modifierEquipe = (id: string, updates: Partial<Equipe>) => {
    const ancienne = equipes.find((e) => e.id === id);
    setEquipes((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

    enregistrerAction({
      type: 'modification_equipe',
      titre: `Modification de l'équipe "${updates.nom || ancienne?.nom || ''}"`,
      description: `Paramètres mis à jour pour l'équipe ${ancienne?.nom}.`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: ancienne,
      donneesApres: updates,
      peutRestaurer: false,
      entiteId: id,
      entiteType: 'equipe',
    });
  };

  const supprimerEquipe = (id: string) => {
    const equipeASupprimer = equipes.find((e) => e.id === id);
    if (!equipeASupprimer) return;

    const sportifsAffectes = sportifs.filter((s) => s.equipeId === id).map((s) => s.id);

    // Enregistrer dans l'historique d'audit avec état complet pour restauration
    enregistrerAction({
      type: 'suppression_equipe',
      titre: `Suppression de l'équipe "${equipeASupprimer.nom}"`,
      description: `L'équipe "${equipeASupprimer.nom}" a été supprimée (${sportifsAffectes.length} sportifs détachés).`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: { equipe: equipeASupprimer, sportifsIds: sportifsAffectes },
      donneesApres: null,
      peutRestaurer: true,
      entiteId: id,
      entiteType: 'equipe',
    });

    setEquipes((prev) => prev.filter((e) => e.id !== id));
    // Détacher les sportifs de cette équipe sans les supprimer
    setSportifs((prev) =>
      prev.map((s) => (s.equipeId === id ? { ...s, equipeId: null } : s))
    );

    if (filtreEquipeId === id) {
      setFiltreEquipeId(null);
    }

    ajouterToast({
      titre: 'Équipe supprimée',
      message: `L'équipe "${equipeASupprimer.nom}" a été supprimée. Vous pouvez l'annuler dans l'Historique.`,
      type: 'info',
    });
  };

  const retirerSportifEquipe = (sportifId: string, equipeId: string) => {
    const sp = sportifs.find((s) => s.id === sportifId);
    const eq = equipes.find((e) => e.id === equipeId);

    setSportifs((prev) =>
      prev.map((s) => (s.id === sportifId ? { ...s, equipeId: null } : s))
    );

    ajouterToast({
      titre: 'Sportif retiré de l’équipe',
      message: `${sp ? `${sp.prenom} ${sp.nom}` : 'Le joueur'} a été détaché de ${eq?.nom || 'l’équipe'}.`,
      type: 'info',
    });
  };

  const rejoindreEquipeDirectement = (sportifId: string, equipeId: string) => {
    const sp = sportifs.find((s) => s.id === sportifId);
    const eq = equipes.find((e) => e.id === equipeId);
    if (!eq) return;

    setSportifs((prev) =>
      prev.map((s) => (s.id === sportifId ? { ...s, equipeId } : s))
    );

    setDemandesAdhesion((prev) =>
      prev.map((d) => (d.sportifId === sportifId && d.equipeId === equipeId ? { ...d, statut: 'acceptee' } : d))
    );

    ajouterToast({
      titre: 'Équipe rejointe !',
      message: `Vous faites maintenant partie de "${eq.nom}". Votre espace est synchronisé !`,
      type: 'succes',
      equipeId: eq.id,
    });
  };

  const quitterEquipe = (sportifId: string) => {
    const sp = sportifs.find((s) => s.id === sportifId);
    const equipePrecedente = equipes.find((e) => e.id === sp?.equipeId);

    setSportifs((prev) =>
      prev.map((s) => (s.id === sportifId ? { ...s, equipeId: null } : s))
    );

    ajouterToast({
      titre: 'Équipe quittée',
      message: `Vous avez quitté l'équipe "${equipePrecedente?.nom || ''}".`,
      type: 'info',
    });
  };

  // --- Sportifs CRUD ---
  const ajouterSportif = (sp: Omit<Sportif, 'id' | 'dateAjout' | 'initiales'>): Sportif => {
    const initiales = `${sp.prenom.charAt(0)}${sp.nom.charAt(0)}`.toUpperCase();
    const nouveau: Sportif = {
      ...sp,
      id: `sp-${Date.now()}`,
      initiales,
      dateAjout: new Date().toISOString().split('T')[0],
    };

    setSportifs((prev) => [...prev, nouveau]);

    enregistrerAction({
      type: 'creation_sportif',
      titre: `Ajout du sportif "${nouveau.prenom} ${nouveau.nom}"`,
      description: `Nouvel athlète créé dans le club : ${nouveau.prenom} ${nouveau.nom}.`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: null,
      donneesApres: nouveau,
      peutRestaurer: true,
      entiteId: nouveau.id,
      entiteType: 'sportif',
    });

    return nouveau;
  };

  const modifierSportif = (id: string, updates: Partial<Sportif>) => {
    const ancien = sportifs.find((s) => s.id === id);
    setSportifs((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          if (updates.prenom || updates.nom) {
            updated.initiales = `${updated.prenom.charAt(0)}${updated.nom.charAt(0)}`.toUpperCase();
          }
          return updated;
        }
        return s;
      })
    );

    enregistrerAction({
      type: 'modification_sportif',
      titre: `Modification du sportif "${ancien?.prenom} ${ancien?.nom}"`,
      description: `Profil de ${ancien?.prenom} ${ancien?.nom} mis à jour.`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: ancien,
      donneesApres: updates,
      peutRestaurer: false,
      entiteId: id,
      entiteType: 'sportif',
    });
  };

  const supprimerSportif = (id: string) => {
    const spASupprimer = sportifs.find((s) => s.id === id);
    if (!spASupprimer) return;

    const reponsesDuSportif = reponses.filter((r) => r.sportifId === id);

    enregistrerAction({
      type: 'suppression_sportif',
      titre: `Suppression du sportif "${spASupprimer.prenom} ${spASupprimer.nom}"`,
      description: `Le sportif "${spASupprimer.prenom} ${spASupprimer.nom}" a été supprimé.`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: { sportif: spASupprimer, reponses: reponsesDuSportif },
      donneesApres: null,
      peutRestaurer: true,
      entiteId: id,
      entiteType: 'sportif',
    });

    setSportifs((prev) => prev.filter((s) => s.id !== id));
    setReponses((prev) => prev.filter((r) => r.sportifId !== id));

    ajouterToast({
      titre: 'Sportif supprimé',
      message: `Le profil de ${spASupprimer.prenom} ${spASupprimer.nom} a été supprimé. Possibilité de restauration dans l'Historique.`,
      type: 'info',
    });
  };

  // --- Gestion des demandes d'adhésion ---
  const creerDemandeAdhesion = (
    sportifId: string,
    equipeId: string,
    messageMotivation?: string
  ): DemandeAdhesion | null => {
    const sp = sportifs.find((s) => s.id === sportifId);
    const eq = equipes.find((e) => e.id === equipeId);
    if (!sp || !eq) return null;

    const existante = demandesAdhesion.find(
      (d) => d.sportifId === sportifId && d.equipeId === equipeId && d.statut === 'en_attente'
    );
    if (existante) {
      ajouterToast({
        titre: 'Demande déjà envoyée',
        message: `Votre demande pour ${eq.nom} est déjà en cours d'examen par le coach.`,
        type: 'info',
      });
      return existante;
    }

    const nouvelleDemande: DemandeAdhesion = {
      id: `dem-${Date.now()}`,
      sportifId: sp.id,
      sportifNom: sp.nom,
      sportifPrenom: sp.prenom,
      sportifEmail: sp.email,
      equipeId: eq.id,
      equipeNom: eq.nom,
      dateDemande: new Date().toISOString().split('T')[0],
      statut: 'en_attente',
      messageMotivation: messageMotivation?.trim(),
    };

    setDemandesAdhesion((prev) => [nouvelleDemande, ...prev]);

    ajouterToast({
      titre: 'Demande d’adhésion envoyée',
      message: `Votre demande pour rejoindre ${eq.nom} a été transmise à l'entraîneur.`,
      type: 'demande',
      demandeAdhesionId: nouvelleDemande.id,
      equipeId: eq.id,
    });

    return nouvelleDemande;
  };

  const accepterDemandeAdhesion = (demandeId: string) => {
    const dem = demandesAdhesion.find((d) => d.id === demandeId);
    if (!dem) return;

    setDemandesAdhesion((prev) =>
      prev.map((d) => (d.id === demandeId ? { ...d, statut: 'acceptee' } : d))
    );

    // Assigner le joueur à l'équipe
    modifierSportif(dem.sportifId, { equipeId: dem.equipeId });
    setToasts((prev) => prev.filter((t) => t.demandeAdhesionId !== demandeId));

    ajouterToast({
      titre: 'Adhésion acceptée !',
      message: `${dem.sportifPrenom} ${dem.sportifNom} fait désormais partie de ${dem.equipeNom}.`,
      type: 'succes',
    });
  };

  const refuserDemandeAdhesion = (demandeId: string) => {
    const dem = demandesAdhesion.find((d) => d.id === demandeId);
    if (!dem) return;

    setDemandesAdhesion((prev) =>
      prev.map((d) => (d.id === demandeId ? { ...d, statut: 'refusee' } : d))
    );

    setToasts((prev) => prev.filter((t) => t.demandeAdhesionId !== demandeId));

    ajouterToast({
      titre: 'Demande refusée',
      message: `La demande de ${dem.sportifPrenom} ${dem.sportifNom} pour ${dem.equipeNom} a été rejetée.`,
      type: 'info',
    });
  };

  // --- Échelles CRUD ---
  const ajouterEchelle = (ech: Omit<EchellePersonnalisee, 'id'>): EchellePersonnalisee => {
    const id = `ech-${Date.now()}`;
    const codeNettoye = ech.code
      ? ech.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
      : ech.nom.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 16);

    const nouvelle: EchellePersonnalisee = {
      ...ech,
      id,
      code: codeNettoye,
      isBorg: false,
      isPreset: false,
    };
    setEchelles((prev) => [...prev, nouvelle]);
    return nouvelle;
  };

  const modifierEchelle = (id: string, updates: Partial<EchellePersonnalisee>) => {
    setEchelles((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return { ...e, ...updates, isBorg: e.isBorg };
        }
        return e;
      })
    );
  };

  const supprimerEchelle = (id: string): boolean => {
    const cible = echelles.find((e) => e.id === id);
    if (cible?.isBorg) {
      alert("L'échelle de Borg est protégée et ne peut pas être supprimée.");
      return false;
    }
    setIndicateurs((prev) =>
      prev.map((ind) => (ind.echelleId === id ? { ...ind, echelleId: undefined } : ind))
    );
    setEchelles((prev) => prev.filter((e) => e.id !== id));
    return true;
  };

  const dupliquerEchelle = (id: string): EchellePersonnalisee => {
    const source = echelles.find((e) => e.id === id) || echelles[0];
    const nouvelle: EchellePersonnalisee = {
      ...source,
      id: `ech-${Date.now()}`,
      nom: `${source.nom} (Copie)`,
      code: `${source.code}_COPIE`,
      isBorg: false,
      isPreset: false,
    };
    setEchelles((prev) => [...prev, nouvelle]);
    return nouvelle;
  };

  // --- Indicateurs CRUD ---
  const ajouterIndicateur = (ind: Omit<Indicateur, 'id'>): Indicateur => {
    const id = `ind-${Date.now()}`;
    const codeNettoye = ind.code
      ? ind.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
      : ind.nom.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 16);

    const nouvelIndicateur: Indicateur = {
      ...ind,
      id,
      code: codeNettoye,
    };
    setIndicateurs((prev) => [nouvelIndicateur, ...prev]);
    return nouvelIndicateur;
  };

  const modifierIndicateur = (id: string, updates: Partial<Indicateur>) => {
    setIndicateurs((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const supprimerIndicateur = (id: string): boolean => {
    const utilise = questionnaires.some((q) => q.indicateurIds.includes(id));
    if (utilise) {
      setQuestionnaires((prev) =>
        prev.map((q) => ({
          ...q,
          indicateurIds: q.indicateurIds.filter((indId) => indId !== id),
        }))
      );
    }
    setIndicateurs((prev) => prev.filter((i) => i.id !== id));
    return true;
  };

  const dupliquerIndicateur = (id: string) => {
    const source = indicateurs.find((i) => i.id === id);
    if (!source) return;
    const clone: Indicateur = {
      ...source,
      id: `ind-${Date.now()}`,
      nom: `${source.nom} (Copie)`,
      code: `${source.code}_COPIE`,
    };
    setIndicateurs((prev) => [clone, ...prev]);
  };

  // --- Questionnaires CRUD ---
  const ajouterQuestionnaire = (quest: Omit<Questionnaire, 'id' | 'dateCreation'>): Questionnaire => {
    const nouveau: Questionnaire = {
      ...quest,
      id: `quest-${Date.now()}`,
      dateCreation: new Date().toISOString().split('T')[0],
    };
    setQuestionnaires((prev) => [nouveau, ...prev]);
    return nouveau;
  };

  const modifierQuestionnaire = (id: string, updates: Partial<Questionnaire>) => {
    setQuestionnaires((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const supprimerQuestionnaire = (id: string) => {
    const questASupprimer = questionnaires.find((q) => q.id === id);
    if (questASupprimer) {
      enregistrerAction({
        type: 'suppression_questionnaire',
        titre: `Suppression du questionnaire "${questASupprimer.titre}"`,
        description: `Le questionnaire "${questASupprimer.titre}" a été supprimé.`,
        auteurId: compteActuel?.id || 'coach-id',
        auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
        auteurRole: roleActuel,
        donneesAvant: { questionnaire: questASupprimer },
        donneesApres: null,
        peutRestaurer: true,
        entiteId: id,
        entiteType: 'questionnaire',
      });
    }
    setQuestionnaires((prev) => prev.filter((q) => q.id !== id));
  };

  // --- Séances CRUD ---
  const ajouterSeance = (seance: Omit<Seance, 'id' | 'dateCreation'>): Seance => {
    const nouvelle: Seance = {
      ...seance,
      id: `sea-${Date.now()}`,
      dateCreation: new Date().toISOString().split('T')[0],
    };
    setSeances((prev) => [nouvelle, ...prev]);

    enregistrerAction({
      type: 'creation_seance',
      titre: `Création de séance : "${nouvelle.titre}"`,
      description: `Séance planifiée le ${nouvelle.date} (${nouvelle.dureeMinutes} min).`,
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: null,
      donneesApres: nouvelle,
      peutRestaurer: false,
      entiteId: nouvelle.id,
      entiteType: 'seance',
    });

    return nouvelle;
  };

  const modifierSeance = (id: string, updates: Partial<Seance>) => {
    setSeances((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const supprimerSeance = (id: string) => {
    const seaASupprimer = seances.find((s) => s.id === id);
    if (seaASupprimer) {
      enregistrerAction({
        type: 'suppression_seance',
        titre: `Suppression de la séance "${seaASupprimer.titre}"`,
        description: `Séance du ${seaASupprimer.date} supprimée.`,
        auteurId: compteActuel?.id || 'coach-id',
        auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
        auteurRole: roleActuel,
        donneesAvant: { seance: seaASupprimer },
        donneesApres: null,
        peutRestaurer: true,
        entiteId: id,
        entiteType: 'seance',
      });
    }
    setSeances((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Planification Saison CRUD ---
  const modifierPhaseSaison = (id: string, updates: Partial<PhaseSaison>) => {
    setPhasesSaison((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const ajouterPhaseSaison = (phase: Omit<PhaseSaison, 'id'>): PhaseSaison => {
    const nouvelle: PhaseSaison = {
      ...phase,
      id: `phase-${Date.now()}`,
    };
    setPhasesSaison((prev) => [...prev, nouvelle]);
    return nouvelle;
  };

  // --- Réponses ---
  const soumettreReponse = ({
    questionnaireId,
    sportifId,
    seanceId,
    valeurs,
    commentaireGeneral,
  }: {
    questionnaireId: string;
    sportifId: string;
    seanceId?: string | null;
    valeurs: Record<string, any>;
    commentaireGeneral?: string;
  }): ReponseQuestionnaire => {
    const now = new Date();
    const alertes = evaluerToutesAlertes(indicateurs, valeurs);

    const nouvelleReponse: ReponseQuestionnaire = {
      id: `rep-${Date.now()}`,
      questionnaireId,
      sportifId,
      seanceId: seanceId || null,
      date: now.toISOString(),
      dateJour: now.toISOString().split('T')[0],
      valeurs,
      commentaireGeneral,
      alertes,
    };

    setReponses((prev) => [nouvelleReponse, ...prev]);
    return nouvelleReponse;
  };

  const supprimerReponse = (id: string) => {
    setReponses((prev) => prev.filter((r) => r.id !== id));
  };

  const modifierParametres = (updates: Partial<ParametresClub>) => {
    const ancien = { ...parametres };
    setParametres((prev) => ({ ...prev, ...updates }));

    enregistrerAction({
      type: 'modification_parametres',
      titre: 'Mise à jour des paramètres du club',
      description: 'Modification des seuils et paramètres du club.',
      auteurId: compteActuel?.id || 'coach-id',
      auteurNom: compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : 'Entraîneur',
      auteurRole: roleActuel,
      donneesAvant: ancien,
      donneesApres: updates,
      peutRestaurer: false,
    });
  };

  const mettreAJourProfilCompte = (updates: Partial<ProfilCompte>) => {
    setProfilCompte((prev) => ({ ...prev, ...updates }));
  };

  const reinitialiserDonnees = () => {
    localStorage.clear();
    setIndicateurs(INDICATEURS_INITIAUX);
    setEchelles(ECHELLES_INITIALES);
    setEquipes(EQUIPES_INITIALES);
    setSportifs(SPORTIFS_INITIAUX);
    setQuestionnaires(QUESTIONNAIRES_INITIAUX);
    setSeances(SEANCES_INITIALES);
    setPhasesSaison(PHASES_SAISON_DEFAUT);
    setReponses(GENERER_REPONSES_INITIALES());
    setParametres(DONNEES_PARAMETRES_INITIALES);
    setClubhouse(CLUBHOUSE_INITIAL);
    setComptesEnregistres([]);
    setCompteActuel(null);
    setHistoriqueActions([]);
    setRoleActuelState('entraineur');
    setSportifConnecteIdState('');
    setEstConnecte(false);
  };

  return (
    <AppContext.Provider
      value={{
        roleActuel,
        setRoleActuel,
        sportifConnecteId,
        setSportifConnecteId,
        sportifConnecte,
        sportifs,
        equipes,
        indicateurs,
        echelles,
        questionnaires,
        seances,
        phasesSaison,
        reponses,
        parametres,
        ajouterEchelle,
        modifierEchelle,
        supprimerEchelle,
        dupliquerEchelle,
        ajouterIndicateur,
        modifierIndicateur,
        supprimerIndicateur,
        dupliquerIndicateur,
        ajouterQuestionnaire,
        modifierQuestionnaire,
        supprimerQuestionnaire,
        ajouterSeance,
        modifierSeance,
        supprimerSeance,
        modifierPhaseSaison,
        ajouterPhaseSaison,
        ajouterSportif,
        modifierSportif,
        supprimerSportif,
        ajouterEquipe,
        modifierEquipe,
        supprimerEquipe,
        retirerSportifEquipe,
        rejoindreEquipeDirectement,
        quitterEquipe,
        demandesAdhesion,
        creerDemandeAdhesion,
        accepterDemandeAdhesion,
        refuserDemandeAdhesion,
        toasts,
        ajouterToast,
        supprimerToast,
        profilCompte,
        mettreAJourProfilCompte,
        estConnecte,
        compteActuel,
        comptesEnregistres,
        creerCompte,
        connecterCompte,
        supprimerCompte,
        seConnecter,
        seDeconnecter,
        clubhouse,
        modifierClubhouse,
        supprimerClubhouse,
        clubhouseEstConfigure,
        equipesDuCoach,
        historiqueActions,
        enregistrerAction,
        restaurerAction,
        supprimerEntreeHistorique,
        filtreEquipeId,
        setFiltreEquipeId,
        soumettreReponse,
        supprimerReponse,
        modifierParametres,
        reinitialiserDonnees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé au sein d’un AppProvider');
  }
  return context;
};
