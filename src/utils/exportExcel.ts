import * as XLSX from 'xlsx';
import { Sportif, Equipe, Indicateur, Questionnaire, ReponseQuestionnaire, Seance } from '../types';
import {
  calculerACWR,
  calculerScoreWellnessSportif,
  extraireChargeReponse,
  calculerSerieMME,
} from './analytics';
import { formaterValeurIndicateur } from './evaluation';

interface ExportOptions {
  equipes: Equipe[];
  sportifs: Sportif[];
  indicateurs: Indicateur[];
  questionnaires: Questionnaire[];
  reponses: ReponseQuestionnaire[];
  seances?: Seance[];
  filtreEquipeId?: string;
  filtreSportifId?: string;
  filtrePeriodeJours?: number;
}

export function exporterVersExcel({
  equipes,
  sportifs,
  indicateurs,
  questionnaires,
  reponses,
  seances = [],
  filtreEquipeId,
  filtreSportifId,
  filtrePeriodeJours,
}: ExportOptions): void {
  const wb = XLSX.utils.book_new();

  const equipeMap = new Map(equipes.map((e) => [e.id, e.nom]));
  const sportifMap = new Map(sportifs.map((s) => [s.id, `${s.prenom} ${s.nom}`]));
  const questionnaireMap = new Map(questionnaires.map((q) => [q.id, q.titre]));
  const indicateurMap = new Map(indicateurs.map((i) => [i.id, i]));

  // Filtrer les réponses
  let reponsesFiltrees = [...reponses];
  if (filtreSportifId && filtreSportifId !== 'tous') {
    reponsesFiltrees = reponsesFiltrees.filter((r) => r.sportifId === filtreSportifId);
  } else if (filtreEquipeId && filtreEquipeId !== 'tous') {
    const sportifsDeLEquipe = new Set(sportifs.filter((s) => s.equipeId === filtreEquipeId).map((s) => s.id));
    reponsesFiltrees = reponsesFiltrees.filter((r) => sportifsDeLEquipe.has(r.sportifId));
  }

  if (filtrePeriodeJours && filtrePeriodeJours > 0) {
    const dateLimite = new Date();
    dateLimite.setDate(dateLimite.getDate() - filtrePeriodeJours);
    reponsesFiltrees = reponsesFiltrees.filter((r) => new Date(r.date) >= dateLimite);
  }

  // --- FEUILLE 1 : Synthèse Athlètes ---
  const syntheseData = sportifs
    .filter((s) => {
      if (filtreSportifId && filtreSportifId !== 'tous') return s.id === filtreSportifId;
      if (filtreEquipeId && filtreEquipeId !== 'tous') return s.equipeId === filtreEquipeId;
      return true;
    })
    .map((s) => {
      const wellness = calculerScoreWellnessSportif(s.id, reponses);
      const acwr = calculerACWR(s.id, reponses);
      const nbReponsesTotal = reponses.filter((r) => r.sportifId === s.id).length;
      const nbAlertesActives = reponses
        .filter((r) => r.sportifId === s.id && r.dateJour === new Date().toISOString().split('T')[0])
        .reduce((acc, r) => acc + (r.alertes?.length || 0), 0);

      return {
        'Nom complet': `${s.prenom} ${s.nom}`,
        'Équipe': s.equipeId ? (equipeMap.get(s.equipeId) || 'Non assigné') : 'Non assigné',
        'Poste / Spécialité': s.posteOuSpecialite || 'Non renseigné',
        'Statut': s.statut,
        'Score de Forme (0-100)': `${wellness.scoreActuel}%`,
        'Tendance Forme': wellness.tendance === 'hausse' ? 'Progression' : wellness.tendance === 'baisse' ? 'Dégradation' : 'Stable',
        'Ratio ACWR (7j/28j)': acwr.ratioACWR,
        'Zone de Charge ACWR': acwr.descriptionZone,
        'Charge Aiguë 7j (UA)': acwr.chargeAigue7j,
        'Alertes du Jour': nbAlertesActives,
        'Total Questionnaires Remplis': nbReponsesTotal,
        'Email': s.email,
        'Téléphone': s.telephone || '',
      };
    });

  const wsSynthese = XLSX.utils.json_to_sheet(syntheseData);
  XLSX.utils.book_append_sheet(wb, wsSynthese, 'Synthèse Athlètes');

  // --- FEUILLE 2 : Réponses Détaillées ---
  const detailReponsesData = reponsesFiltrees.map((r) => {
    const sportifNom = sportifMap.get(r.sportifId) || r.sportifId;
    const sportifObj = sportifs.find((s) => s.id === r.sportifId);
    const equipeNom = (sportifObj && sportifObj.equipeId && equipeMap.get(sportifObj.equipeId)) || 'Non assigné';
    const questionnaireTitre = questionnaireMap.get(r.questionnaireId) || r.questionnaireId;

    const ligne: Record<string, any> = {
      'Date': r.dateJour,
      'Heure': new Date(r.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      'Sportif': sportifNom,
      'Équipe': equipeNom,
      'Questionnaire': questionnaireTitre,
      'Nombre d’Alertes': r.alertes?.length || 0,
      'Détail Alertes': r.alertes?.map((a) => `[${a.niveau.toUpperCase()}] ${a.indicateurNom}: ${a.message}`).join(' | ') || 'Aucune',
      'Commentaire du Sportif': r.commentaireGeneral || r.valeurs['ind-notes-sensations'] || '',
    };

    // Ajouter chaque indicateur rempli
    for (const [indId, val] of Object.entries(r.valeurs)) {
      const ind = indicateurMap.get(indId);
      const colNom = ind ? ind.nom : indId;
      ligne[colNom] = ind ? formaterValeurIndicateur(ind, val) : String(val);
    }

    return ligne;
  });

  const wsReponses = XLSX.utils.json_to_sheet(detailReponsesData);
  XLSX.utils.book_append_sheet(wb, wsReponses, 'Toutes les Réponses');

  // --- FEUILLE 3 : Charge de Travail (sRPE Foster) ---
  const chargeData: any[] = [];
  for (const r of reponsesFiltrees) {
    const sAssociee = seances.find((s) => s.id === r.seanceId);
    const c = extraireChargeReponse(r, sAssociee);
    if (c) {
      const sObj = sportifs.find((s) => s.id === r.sportifId);
      chargeData.push({
        'Date': r.dateJour,
        'Sportif': sObj ? `${sObj.prenom} ${sObj.nom}` : r.sportifId,
        'Équipe': sObj && sObj.equipeId ? (equipeMap.get(sObj.equipeId) || '') : '',
        'RPE Perçu (1-10, joueur)': c.rpe,
        'Durée Globale Séance (min, coach)': c.duree,
        'Charge Totale (UA = RPE x min coach)': c.chargeUA,
        'Niveau d’Intensité': c.rpe >= 8 ? 'Très Élevé' : c.rpe >= 6 ? 'Modéré à Élevé' : 'Léger',
        'Notes Séance': r.valeurs['ind-notes-sensations'] || '',
      });
    }
  }

  if (chargeData.length > 0) {
    const wsCharge = XLSX.utils.json_to_sheet(chargeData);
    XLSX.utils.book_append_sheet(wb, wsCharge, 'Suivi des Charges (sRPE)');
  }

  // --- FEUILLE 4 : Séances par Séance & Débriefings ---
  if (seances.length > 0) {
    const seancesData = seances.map((s) => {
      const eq = equipes.find((e) => e.id === s.equipeId);
      const repsSeance = reponses.filter((r) => r.seanceId === s.id);
      const rpes = repsSeance
        .map((r) => extraireChargeReponse(r, s)?.rpe)
        .filter((val): val is number => val !== undefined && val !== null);
      const rpeMoyen = rpes.length > 0 ? Number((rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1)) : '';
      const charges = repsSeance
        .map((r) => extraireChargeReponse(r, s)?.chargeUA)
        .filter((val): val is number => val !== undefined && val !== null);
      const chargeMoy = charges.length > 0 ? Math.round(charges.reduce((a, b) => a + b, 0) / charges.length) : '';

      return {
        'Date': s.date,
        'Heure': s.heureDebut || '',
        'Titre Séance': s.titre,
        'Type': s.type,
        'Équipe': eq ? eq.nom : 'Tous',
        'Durée Globale Coach (min)': s.dureeMinutes,
        'RPE Cible Coach': s.rpePrevu ?? '',
        'RPE Moyen Débriefé': rpeMoyen,
        'Charge Moyenne UA': chargeMoy,
        'Nombre Débriefs': repsSeance.length,
        'Statut': s.statut,
        'Consignes / Description': s.description || '',
      };
    });

    const wsSeances = XLSX.utils.json_to_sheet(seancesData);
    XLSX.utils.book_append_sheet(wb, wsSeances, 'Séances & Débriefings');
  }

  // --- FEUILLE 5 : Série Chronologique MME 7j & 28j (EWMA) ---
  const sportifsCibles = sportifs.filter((s) => {
    if (filtreSportifId && filtreSportifId !== 'tous') return s.id === filtreSportifId;
    if (filtreEquipeId && filtreEquipeId !== 'tous') return s.equipeId === filtreEquipeId;
    return true;
  });

  const mmeExportData: any[] = [];
  sportifsCibles.forEach((sp) => {
    const points = calculerSerieMME(sp.id, reponses, 28);
    points.forEach((p) => {
      mmeExportData.push({
        'Date': p.date,
        'Jour': p.nomJour,
        'Sportif': `${sp.prenom} ${sp.nom}`,
        'Charge Journalière (UA)': p.chargeJour,
        'MME 7j (Aiguë)': p.mme7j,
        'MME 28j (Chronique)': p.mme28j,
        'Ratio EWMA ACWR': p.ratioACWR_MME,
        'Zone de Risque': p.zone.toUpperCase(),
      });
    });
  });

  if (mmeExportData.length > 0) {
    const wsMME = XLSX.utils.json_to_sheet(mmeExportData);
    XLSX.utils.book_append_sheet(wb, wsMME, 'Modèle MME 7j & 28j');
  }

  // --- FEUILLE 6 : Dictionnaire des Indicateurs ---
  const indicateursData = indicateurs.map((ind) => ({
    'Code Métrique': ind.code,
    'Nom': ind.nom,
    'Catégorie': ind.categorie,
    'Type d’Échelle': ind.type,
    'Borne Min': ind.echelleMin ?? '',
    'Borne Max': ind.echelleMax ?? '',
    'Unité': ind.unite || '',
    'Sens de la Métrique': ind.valeurHautePositive ? 'Valeur haute positive (bon)' : 'Valeur haute d’alerte (mauvais)',
    'Alerte Active': ind.seuilAlerte?.actif ? 'Oui' : 'Non',
    'Règle d’Alerte': ind.seuilAlerte?.actif ? `${ind.seuilAlerte.operateur} ${ind.seuilAlerte.valeur} (${ind.seuilAlerte.niveau})` : 'Aucune',
    'Message Alerte': ind.seuilAlerte?.message || '',
    'Description': ind.description,
  }));

  const wsIndicateurs = XLSX.utils.json_to_sheet(indicateursData);
  XLSX.utils.book_append_sheet(wb, wsIndicateurs, 'Indicateurs Personnalisés');

  // Génération du fichier Excel
  const dateStr = new Date().toISOString().split('T')[0];
  const nomFichier = `Athletik_Export_Donnees_${dateStr}.xlsx`;
  XLSX.writeFile(wb, nomFichier);
}
