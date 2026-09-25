export type RoleUtilisateur = 'entraineur' | 'sportif';

export type TypeIndicateur =
  | 'echelle_1_5'
  | 'echelle_1_10'
  | 'echelle_0_100'
  | 'echelle_personnalisee'
  | 'booleen'
  | 'numerique'
  | 'choix_unique'
  | 'choix_multiple'
  | 'texte';

export type CategorieIndicateur =
  | 'Charge'
  | 'Bien-être'
  | 'Récupération'
  | 'Physiologique'
  | 'Performance'
  | 'Douleur'
  | 'Autre';

export type StatutSportif = 'Actif' | 'Blessé' | 'Repos' | 'En reprise';

export interface SeuilAlerte {
  actif: boolean;
  operateur: '>' | '<' | '>=' | '<=' | '==';
  valeur: number | string | boolean;
  message: string;
  niveau: 'attention' | 'critique';
}

export interface PalierEchelle {
  valeur: number;
  libelle: string;
  description?: string;
  couleur?: string;
  emoji?: string;
}

export type ModeEchelle = 'borg_cr10' | 'borg_6_20' | 'paliers_personnalises' | 'continue_bornes';

export interface EchellePersonnalisee {
  id: string;
  nom: string;
  code: string;
  description: string;
  mode: ModeEchelle;
  min: number;
  max: number;
  pas: number;
  libelleMin?: string;
  libelleMax?: string;
  paliers: PalierEchelle[];
  isBorg?: boolean; // Vrai pour les échelles de Borg officielles protégées
  isPreset?: boolean;
}

export interface Indicateur {
  id: string;
  code: string;
  nom: string;
  description: string;
  categorie: CategorieIndicateur;
  type: TypeIndicateur;
  // Référence à une échelle personnalisée ou Borg
  echelleId?: string;
  paliersEchelle?: PalierEchelle[];
  // Options d'échelles standards
  echelleMin?: number;
  echelleMax?: number;
  echellePas?: number;
  libelleMin?: string;
  libelleMax?: string;
  // Options numériques
  unite?: string;
  // Options pour choix
  optionsChoix?: string[];
  // Options booléen
  libelleVrai?: string;
  libelleFaux?: string;
  // Seuil d'alerte
  seuilAlerte?: SeuilAlerte;
  // Sens de la métrique (ex: true si une valeur élevée est favorable, false si elle signale fatigue/douleur)
  valeurHautePositive: boolean;
  obligatoireParDefaut?: boolean;
}

export type StyleFondEquipe = 'terrain' | 'stade' | 'degrade' | 'mesh' | 'carbone' | 'uni';

export interface Clubhouse {
  id: string;
  nom: string;
  discipline: string;
  proprietaireCoachId: string;
  proprietaireNom: string;
  logoUrl?: string;
  couleurPrimaire?: string;
  description?: string;
  dateCreation: string;
}

export interface Equipe {
  id: string;
  nom: string;
  discipline: string;
  categorie?: string;
  description: string;
  clubhouseId?: string; // ID du Clubhouse (style VEO Cam)
  creeParCoachId?: string; // ID du coach créateur
  couleur: string; // Couleur primaire du club (hex)
  couleurSecondaire?: string; // Couleur secondaire / accent (hex)
  couleurFond?: string; // Couleur d'ambiance de fond (hex foncé, ex: #0a1322, #071911, #18080f)
  styleFond?: StyleFondEquipe; // Texture d'ambiance
  logoUrl?: string; // Image uploadée (base64 ou URL)
  logoZoom?: number; // Pourcentage de zoom / redimensionnement (ex: 50 à 200, défaut 100)
  ecussonPreset?: string; // Identifiant de l'écusson vectoriel de club
  ecussonCouleur?: string;
  devise?: string; // Devise ou slogan du club
  deviseOuSlogan?: string; // Devise ou slogan du club
  lieuOuStade?: string; // Nom du stade ou centre d'entraînement
  codeInvitation?: string; // Code d'adhésion court pour les sportifs (ex: ATH-742)
  dateCreation: string;
}

export interface DemandeAdhesion {
  id: string;
  sportifId: string;
  sportifNom: string;
  sportifPrenom: string;
  sportifEmail: string;
  sportifAvatar?: string;
  equipeId: string;
  equipeNom: string;
  dateDemande: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  messageMotivation?: string;
}

export interface ToastNotification {
  id: string;
  titre: string;
  message: string;
  type: 'info' | 'succes' | 'alerte' | 'demande';
  dateCreation: string;
  demandeAdhesionId?: string;
  equipeId?: string;
}

export type RoleCompte = 'sportif' | 'entraineur' | 'les_deux';

export interface ProfilCompte {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  avatarUrl?: string;
  photoUrl?: string;
  role: RoleCompte;
  sportifIdAssocie?: string; // Si le compte est aussi sportif (ex: rôle "les_deux")
  themeCouleur?: string; // Couleur d'accent préférée
  ambiancePreferee?: StyleFondEquipe;
  dateInscription: string;
}

export interface Sportif {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  equipeId: string | null;
  posteOuSpecialite: string;
  statut: StatutSportif;
  dateNaissance?: string;
  telephone?: string;
  autoriserHistorique: boolean; // Le sportif a le droit de voir son historique
  initiales: string;
  dateAjout: string;
}

export interface Questionnaire {
  id: string;
  titre: string;
  description: string;
  frequence: 'Quotidien' | 'Après séance' | 'Hebdomadaire' | 'Ponctuel';
  momentJournee: 'Matin' | 'Soir' | 'Après entraînement' | 'Libre';
  tempsEstimeMinutes: number;
  indicateurIds: string[];
  actif: boolean;
  attributionType: 'tous' | 'equipe' | 'sportifs';
  cibleEquipeIds: string[];
  cibleSportifIds: string[];
  dateCreation: string;
}

export interface Seance {
  id: string;
  titre: string;
  type: 'Entraînement' | 'Match / Compétition' | 'Musculation' | 'Cardio / VMA' | 'Technique / Tactique' | 'Récupération';
  date: string; // YYYY-MM-DD
  heureDebut?: string; // HH:mm
  dureeMinutes: number;
  rpePrevu?: number; // RPE prévu par le coach (1-10)
  equipeId?: string | null;
  questionnaireId?: string; // Questionnaire associé
  description?: string;
  phaseSaison?: string; // Phase de la saison (ex: 'Préparation spécifique', 'Compétition', etc.)
  statut: 'Planifiée' | 'En cours' | 'Terminée';
  dateCreation: string;
}

export interface PhaseSaison {
  id: string;
  nom: string;
  dateDebut: string; // YYYY-MM-DD
  dateFin: string; // YYYY-MM-DD
  couleur: string;
  objectifChargeHebdoUA: number; // UA sRPE recommandée par semaine
  description?: string;
}

export interface AlerteReponse {
  indicateurId: string;
  indicateurNom: string;
  valeur: any;
  message: string;
  niveau: 'attention' | 'critique';
}

export interface ReponseQuestionnaire {
  id: string;
  questionnaireId: string;
  sportifId: string;
  seanceId?: string | null; // Référence à la séance spécifique si débrief de séance
  date: string; // ISO
  dateJour: string; // YYYY-MM-DD
  valeurs: Record<string, any>;
  commentaireGeneral?: string;
  alertes: AlerteReponse[];
}

export interface PointMME {
  date: string; // YYYY-MM-DD
  nomJour: string;
  chargeJour: number; // UA brute du jour
  mme7j: number; // Moyenne Mobile Exponentielle 7 jours (Aiguë)
  mme28j: number; // Moyenne Mobile Exponentielle 28 jours (Chronique)
  ratioACWR_MME: number; // mme7j / mme28j
  zone: 'faible' | 'optimale' | 'elevee' | 'critique';
}

export interface ParametresClub {
  nomOrganisation: string;
  nomEntraineur: string;
  discipline: string;
  emailContact: string;
  autoriserHistoriqueParDefaut: boolean;
  seuilChargeElevee: number; // ex: RPE * min > 600
  couleurPrincipale: string;
}

export interface CompteUtilisateur {
  id: string;
  email: string;
  motDePasseHash: string; // Hash SHA-256 avec sel, jamais en clair
  role: RoleCompte;
  nom: string;
  prenom: string;
  dateCreation: string;
  seSouvenir?: boolean;
  clubhouseCree?: boolean; // Pour l'entraîneur: true si son clubhouse a été configuré
  sportifIdAssocie?: string; // Pour le sportif ou double rôle
  equipeId?: string | null;
}

export type TypeActionHistorique =
  | 'creation_equipe'
  | 'suppression_equipe'
  | 'modification_equipe'
  | 'creation_sportif'
  | 'suppression_sportif'
  | 'modification_sportif'
  | 'creation_seance'
  | 'suppression_seance'
  | 'modification_seance'
  | 'creation_questionnaire'
  | 'suppression_questionnaire'
  | 'modification_clubhouse'
  | 'suppression_clubhouse'
  | 'modification_parametres'
  | 'suppression_reponse'
  | 'adhesion_equipe'
  | 'autre';

export interface ActionHistorique {
  id: string;
  type: TypeActionHistorique;
  titre: string;
  description: string;
  date: string; // ISO
  auteurId: string;
  auteurNom: string;
  auteurRole: RoleUtilisateur | RoleCompte;
  donneesAvant?: any;
  donneesApres?: any;
  peutRestaurer?: boolean;
  estRestaure?: boolean;
  entiteId?: string;
  entiteType?: 'equipe' | 'sportif' | 'seance' | 'clubhouse' | 'questionnaire' | 'reponse' | 'parametres';
}
