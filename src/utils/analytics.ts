import { ReponseQuestionnaire, Sportif, Indicateur, PointMME, Seance, PhaseSaison } from '../types';

export interface ScoreWellnessJour {
  sportifId: string;
  dateJour: string;
  readinessScore: number; // 0-100
  sommeil: number | null;
  fatigue: number | null;
  courbatures: number | null;
  stress: number | null;
  douleur: boolean;
  alertesCount: number;
}

export interface ChargeJour {
  sportifId: string;
  dateJour: string;
  rpe: number;
  duree: number;
  chargeUA: number; // RPE * duree
}

export interface ACWRResult {
  chargeAigue7j: number; // Somme des 7 derniers jours
  chargeChronique28j: number; // Moyenne hebdo sur 28j
  ratioACWR: number; // Aiguë / Chronique
  zone: 'faible' | 'optimale' | 'elevee' | 'critique';
  descriptionZone: string;
}

/**
 * Calcule la charge d'entraînement UA (Unités Arbitraires de Foster) pour une réponse.
 * RÈGLE FONDAMENTALE (Foster, 1998) : La durée de la séance n'est PAS un temps effectif individuel.
 * La séance est prise dans son ensemble (du début au coup de sifflet final)
 * et c'est l'entraîneur qui la note pour l'ensemble du groupe, et non les joueurs.
 */
export function extraireChargeReponse(
  rep: ReponseQuestionnaire,
  seanceAssociee?: Seance | null
): { rpe: number; duree: number; chargeUA: number } | null {
  const rpe = Number(rep.valeurs['ind-rpe-seance'] ?? rep.valeurs['RPE_FOSTER']);
  // La durée provient prioritairement de la séance fixée par le coach dans son ensemble
  const duree = seanceAssociee?.dureeMinutes ?? Number(rep.valeurs['ind-duree-seance'] ?? rep.valeurs['DUREE_MIN'] ?? 60);

  if (!isNaN(rpe) && !isNaN(duree) && rpe > 0 && duree > 0) {
    return {
      rpe,
      duree,
      chargeUA: Math.round(rpe * duree),
    };
  }
  return null;
}

/**
 * Calcule l'historique et les Moyennes Mobiles Exponentielles (MME 7 jours et MME 28 jours / EWMA)
 * Selon le modèle scientifique de référence (Gabbett & Murray) :
 * - Facteur d'atténuation aiguë (7 jours) : lambda_a = 2 / (7 + 1) = 0.25
 * - Facteur d'atténuation chronique (28 jours) : lambda_c = 2 / (28 + 1) = 2 / 29 ≈ 0.068965
 */
export function calculerSerieMME(
  sportifId: string | 'tous',
  reponses: ReponseQuestionnaire[],
  nbJoursAffichage: number = 28
): PointMME[] {
  // Construire la chronologie sur les 42 derniers jours pour bien initialiser l'EWMA
  const totalJoursCalcul = Math.max(35, nbJoursAffichage + 14);
  const datesChronologiques: string[] = [];

  for (let i = totalJoursCalcul - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    datesChronologiques.push(d.toISOString().split('T')[0]);
  }

  // Filtrer les réponses
  const reponsesFiltrees = sportifId === 'tous'
    ? reponses
    : reponses.filter((r) => r.sportifId === sportifId);

  // Somme des charges par jour
  const chargesParJour: Record<string, number> = {};
  for (const dateStr of datesChronologiques) {
    chargesParJour[dateStr] = 0;
  }

  for (const r of reponsesFiltrees) {
    if (chargesParJour[r.dateJour] !== undefined) {
      const c = extraireChargeReponse(r);
      if (c) {
        chargesParJour[r.dateJour] += c.chargeUA;
      }
    }
  }

  const lambda7 = 2 / (7 + 1); // 0.25
  const lambda28 = 2 / (28 + 1); // 0.068965

  let mme7Precedente = 0;
  let mme28Precedente = 0;
  const serieComplete: PointMME[] = [];

  datesChronologiques.forEach((dateStr, idx) => {
    const chargeDuJour = chargesParJour[dateStr] || 0;

    let mme7Actuelle: number;
    let mme28Actuelle: number;

    if (idx === 0) {
      mme7Actuelle = chargeDuJour > 0 ? chargeDuJour : 350;
      mme28Actuelle = chargeDuJour > 0 ? chargeDuJour : 350;
    } else {
      mme7Actuelle = (chargeDuJour * lambda7) + (mme7Precedente * (1 - lambda7));
      mme28Actuelle = (chargeDuJour * lambda28) + (mme28Precedente * (1 - lambda28));
    }

    mme7Precedente = mme7Actuelle;
    mme28Precedente = mme28Actuelle;

    const ratio = mme28Actuelle > 0 ? Number((mme7Actuelle / mme28Actuelle).toFixed(2)) : 1.0;

    let zone: PointMME['zone'] = 'optimale';
    if (ratio < 0.8) zone = 'faible';
    else if (ratio >= 0.8 && ratio <= 1.3) zone = 'optimale';
    else if (ratio > 1.3 && ratio <= 1.5) zone = 'elevee';
    else zone = 'critique';

    const dObj = new Date(dateStr + 'T12:00:00');
    const nomJour = dObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

    serieComplete.push({
      date: dateStr,
      nomJour,
      chargeJour: chargeDuJour,
      mme7j: Math.round(mme7Actuelle),
      mme28j: Math.round(mme28Actuelle),
      ratioACWR_MME: ratio,
      zone,
    });
  });

  // Ne renvoyer que les nbJoursAffichage derniers jours demandés
  return serieComplete.slice(-nbJoursAffichage);
}

/**
 * Calcule l'ACWR (Acute:Chronic Workload Ratio) pour un athlète
 */
export function calculerACWR(sportifId: string, reponses: ReponseQuestionnaire[]): ACWRResult {
  // Filtrer les réponses de charge du sportif
  const reponsesCharge = reponses
    .filter((r) => r.sportifId === sportifId)
    .sort((a, b) => new Date(b.dateJour).getTime() - new Date(a.dateJour).getTime());

  // Obtenir les charges par jour
  const chargesParJour: Record<string, number> = {};
  for (const r of reponsesCharge) {
    const c = extraireChargeReponse(r);
    if (c) {
      chargesParJour[r.dateJour] = (chargesParJour[r.dateJour] || 0) + c.chargeUA;
    }
  }

  const joursUniques = Object.keys(chargesParJour).sort().reverse();

  // 7 derniers jours (Aiguë)
  const septDerniers = joursUniques.slice(0, 7);
  const chargeAigue = septDerniers.reduce((acc, j) => acc + (chargesParJour[j] || 0), 0);

  // 28 derniers jours (Chronique)
  const vingtHuitDerniers = joursUniques.slice(0, 28);
  const chargeTotale28j = vingtHuitDerniers.reduce((acc, j) => acc + (chargesParJour[j] || 0), 0);
  // Moyenne hebdomadaire chronique (divisé par le nombre de semaines équivalentes)
  const nbSemaines = Math.max(1, vingtHuitDerniers.length / 7);
  const chargeChronique = Math.round(chargeTotale28j / nbSemaines);

  let ratio = 1.0;
  if (chargeChronique > 0) {
    ratio = Number((chargeAigue / chargeChronique).toFixed(2));
  }

  let zone: ACWRResult['zone'] = 'optimale';
  let descriptionZone = 'Zone optimale (0.8 - 1.3) : Stimulus adapté';

  if (ratio < 0.8) {
    zone = 'faible';
    descriptionZone = 'Sous-charge (< 0.8) : Risque de désentraînement';
  } else if (ratio >= 0.8 && ratio <= 1.3) {
    zone = 'optimale';
    descriptionZone = 'Zone de performance optimale (0.8 - 1.3)';
  } else if (ratio > 1.3 && ratio <= 1.5) {
    zone = 'elevee';
    descriptionZone = 'Charge élevée (1.3 - 1.5) : Risque accru de blessure';
  } else {
    zone = 'critique';
    descriptionZone = 'Pic de charge critique (> 1.5) : Risque très élevé';
  }

  return {
    chargeAigue7j: chargeAigue,
    chargeChronique28j: chargeChronique,
    ratioACWR: ratio,
    zone,
    descriptionZone,
  };
}

/**
 * Calcule le score global de forme / bien-être d'un athlète (0 à 100)
 */
export function calculerScoreWellnessSportif(
  sportifId: string,
  reponses: ReponseQuestionnaire[]
): { scoreActuel: number; tendance: 'hausse' | 'stable' | 'baisse'; dernierCheckin: ReponseQuestionnaire | null } {
  const reps = reponses
    .filter((r) => r.sportifId === sportifId && r.questionnaireId === 'quest-wellness-matin')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (reps.length === 0) {
    return { scoreActuel: 75, tendance: 'stable', dernierCheckin: null };
  }

  const dernier = reps[0];
  const penultieme = reps[1];

  const evaluerReponseScore = (r: ReponseQuestionnaire): number => {
    if (r.valeurs['ind-readiness-percent'] !== undefined) {
      return Number(r.valeurs['ind-readiness-percent']);
    }
    // Calcul de secours basé sur sommeil, fatigue, stress, courbatures
    const sommeil = Number(r.valeurs['ind-sommeil'] || 3); // 1-5
    const fatigue = Number(r.valeurs['ind-fatigue'] || 5); // 1-10
    const stress = Number(r.valeurs['ind-stress'] || 5); // 1-10
    const courbatures = Number(r.valeurs['ind-courbatures'] || 2); // 1-5
    const douleur = r.valeurs['ind-douleur-presence'] === true;

    const base = ((sommeil / 5) * 35) + ((1 - fatigue / 10) * 30) + ((1 - stress / 10) * 20) + ((1 - courbatures / 5) * 15);
    let total = Math.round(base);
    if (douleur) total = Math.max(10, total - 25);
    return total;
  };

  const scoreActuel = evaluerReponseScore(dernier);
  const scorePrecedent = penultieme ? evaluerReponseScore(penultieme) : scoreActuel;

  let tendance: 'hausse' | 'stable' | 'baisse' = 'stable';
  if (scoreActuel > scorePrecedent + 4) {
    tendance = 'hausse';
  } else if (scoreActuel < scorePrecedent - 4) {
    tendance = 'baisse';
  }

  return { scoreActuel, tendance, dernierCheckin: dernier };
}

/**
 * Phases par défaut d'une saison sportive (ex : Saison 2026-2027)
 */
export const PHASES_SAISON_DEFAUT: PhaseSaison[] = [
  {
    id: 'phase-prep-gen',
    nom: 'Préparation Générale (GPP)',
    dateDebut: '2026-08-01',
    dateFin: '2026-08-31',
    couleur: '#38bdf8', // sky-400
    objectifChargeHebdoUA: 2800,
    description: 'Volume foncier aérobie, renforcement structurel, reprise progressive.',
  },
  {
    id: 'phase-prep-spec',
    nom: 'Préparation Spécifique (SPP)',
    dateDebut: '2026-09-01',
    dateFin: '2026-09-30',
    couleur: '#10b981', // emerald-500
    objectifChargeHebdoUA: 3200,
    description: 'Intensités cibles, VMA, vitesse, opposition tactique et matchs amicaux.',
  },
  {
    id: 'phase-comp-aller',
    nom: 'Compétition - Phase Aller',
    dateDebut: '2026-10-01',
    dateFin: '2026-12-20',
    couleur: '#f59e0b', // amber-500
    objectifChargeHebdoUA: 2600,
    description: 'Gestion de la charge de match, fraîcheur le week-end, micro-cycles compétitifs.',
  },
  {
    id: 'phase-treve',
    nom: 'Trêve Hivernale & Régénération',
    dateDebut: '2026-12-21',
    dateFin: '2027-01-05',
    couleur: '#a855f7', // purple-500
    objectifChargeHebdoUA: 1200,
    description: 'Décharge active, récupération physique et mentale, maintien aérobie individuel.',
  },
  {
    id: 'phase-comp-retour',
    nom: 'Compétition - Phase Retour',
    dateDebut: '2027-01-06',
    dateFin: '2027-04-30',
    couleur: '#ec4899', // pink-500
    objectifChargeHebdoUA: 2700,
    description: 'Rythme compétitif soutenu, rotations d’effectif, prévention des blessures d’usure.',
  },
  {
    id: 'phase-playoffs',
    nom: 'Play-offs / Finales & Affûtage',
    dateDebut: '2027-05-01',
    dateFin: '2027-06-15',
    couleur: '#f43f5e', // rose-500
    objectifChargeHebdoUA: 2100,
    description: 'Affûtage (tapering), baisse du volume (-30%), maintien de l’intensité maximale.',
  },
];

/**
 * Détermine la phase de la saison pour une date donnée (YYYY-MM-DD)
 */
export function trouverPhaseSaisonPourDate(dateStr: string, phases: PhaseSaison[] = PHASES_SAISON_DEFAUT): PhaseSaison | null {
  return phases.find((p) => dateStr >= p.dateDebut && dateStr <= p.dateFin) || null;
}

/**
 * Calcule la charge sRPE de Foster (UA) prévue pour une séance
 * Charge = RPE (1-10) * Temps d'entraînement (minutes)
 */
export function calculerChargePrevueSeance(seance: Seance): {
  rpePrevu: number;
  dureeMinutes: number;
  chargePrevueUA: number;
} {
  const rpe = seance.rpePrevu ?? 5;
  const duree = seance.dureeMinutes ?? 60;
  return {
    rpePrevu: rpe,
    dureeMinutes: duree,
    chargePrevueUA: Math.round(rpe * duree),
  };
}

/**
 * Analyse le débriefing réel d'une séance (confrontation sRPE prévu coach vs réalisé athlètes)
 */
export function debrieferSeanceSRPE(
  seance: Seance,
  reponses: ReponseQuestionnaire[]
): {
  chargePrevueUA: number;
  rpePrevu: number;
  dureePrevue: number;
  rpeMoyenReel: number | null;
  dureeMoyenneReelle: number | null;
  chargeMoyenneReelleUA: number | null;
  totalChargeReelleUA: number;
  nbReponses: number;
  deltaRpe: number | null;
  deltaChargeUA: number | null;
} {
  const chargePrevue = calculerChargePrevueSeance(seance);

  // Réponses associées (par ID de séance explicite ou par date + questionnaire séance)
  const reps = reponses.filter(
    (r) =>
      r.seanceId === seance.id ||
      (r.dateJour === seance.date && r.questionnaireId === 'quest-rpe-seance')
  );

  if (reps.length === 0) {
    return {
      chargePrevueUA: chargePrevue.chargePrevueUA,
      rpePrevu: chargePrevue.rpePrevu,
      dureePrevue: chargePrevue.dureeMinutes,
      rpeMoyenReel: null,
      dureeMoyenneReelle: null,
      chargeMoyenneReelleUA: null,
      totalChargeReelleUA: 0,
      nbReponses: 0,
      deltaRpe: null,
      deltaChargeUA: null,
    };
  }

  const rpes: number[] = [];
  const durees: number[] = [];
  const charges: number[] = [];

  reps.forEach((r) => {
    const c = extraireChargeReponse(r, seance);
    if (c) {
      rpes.push(c.rpe);
      // Durée globale notée par le coach pour toute la séance (non temps effectif individuel)
      durees.push(seance.dureeMinutes);
      charges.push(Math.round(c.rpe * seance.dureeMinutes));
    }
  });

  const rpeMoyen = rpes.length > 0 ? Number((rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1)) : null;
  // La durée globale de la séance est fixée par le coach pour l'ensemble du groupe
  const dureeMoy = seance.dureeMinutes;
  const chargeMoy = charges.length > 0 ? Math.round(charges.reduce((a, b) => a + b, 0) / charges.length) : null;
  const totalCharge = charges.reduce((a, b) => a + b, 0);

  return {
    chargePrevueUA: chargePrevue.chargePrevueUA,
    rpePrevu: chargePrevue.rpePrevu,
    dureePrevue: chargePrevue.dureeMinutes,
    rpeMoyenReel: rpeMoyen,
    dureeMoyenneReelle: dureeMoy,
    chargeMoyenneReelleUA: chargeMoy,
    totalChargeReelleUA: totalCharge,
    nbReponses: reps.length,
    deltaRpe: rpeMoyen !== null ? Number((rpeMoyen - chargePrevue.rpePrevu).toFixed(1)) : null,
    deltaChargeUA: chargeMoy !== null ? chargeMoy - chargePrevue.chargePrevueUA : null,
  };
}

/**
 * Calcule les indicateurs sRPE d'une semaine complète
 * - Charge hebdomadaire totale prévue (UA)
 * - Charge hebdomadaire totale réalisée (UA)
 * - Monotonie (moyenne journalière / écart-type)
 * - Contrainte / Strain (Charge hebdomadaire * Monotonie)
 */
export function calculerMetriquesSemaineSRPE(
  dateLundiStr: string,
  seances: Seance[],
  reponses: ReponseQuestionnaire[]
): {
  datesSemaine: string[];
  chargePrevueTotaleUA: number;
  chargeReelleMoyenneTotaleUA: number;
  seancesSemaine: Seance[];
  monotonie: number;
  contrainte: number;
  nbSeances: number;
} {
  const datesSemaine: string[] = [];
  const baseDate = new Date(dateLundiStr + 'T00:00:00');

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    datesSemaine.push(d.toISOString().split('T')[0]);
  }

  const seancesSemaine = seances.filter((s) => datesSemaine.includes(s.date));

  // Charge prévue totale
  const chargePrevueTotaleUA = seancesSemaine.reduce((sum, s) => {
    return sum + (s.rpePrevu ?? 5) * (s.dureeMinutes ?? 60);
  }, 0);

  // Charge réelle par jour pour le calcul de monotonie
  const chargesParJour: number[] = datesSemaine.map((dStr) => {
    const repsDuJour = reponses.filter((r) => r.dateJour === dStr);
    const charges = repsDuJour
      .map((r) => extraireChargeReponse(r)?.chargeUA)
      .filter((c): c is number => c !== undefined && c !== null);

    if (charges.length > 0) {
      return charges.reduce((a, b) => a + b, 0) / charges.length;
    }
    // Si pas de débriefing réel mais séance prévue
    const seanceJour = seancesSemaine.find((s) => s.date === dStr);
    return seanceJour ? (seanceJour.rpePrevu ?? 5) * (seanceJour.dureeMinutes ?? 60) : 0;
  });

  const chargeReelleMoyenneTotaleUA = Math.round(chargesParJour.reduce((a, b) => a + b, 0));

  // Monotonie : Moyenne journalière / Ecart-type journalier
  const mean = chargeReelleMoyenneTotaleUA / 7;
  const variance = chargesParJour.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 7;
  const stdDev = Math.sqrt(variance);
  const monotonie = stdDev > 0 ? Number((mean / stdDev).toFixed(2)) : 1.0;

  // Contrainte (Foster Strain) = Charge totale * Monotonie
  const contrainte = Math.round(chargeReelleMoyenneTotaleUA * monotonie);

  return {
    datesSemaine,
    chargePrevueTotaleUA,
    chargeReelleMoyenneTotaleUA,
    seancesSemaine,
    monotonie,
    contrainte,
    nbSeances: seancesSemaine.length,
  };
}
