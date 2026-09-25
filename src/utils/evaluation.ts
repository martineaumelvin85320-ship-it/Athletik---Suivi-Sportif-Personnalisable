import { Indicateur, AlerteReponse } from '../types';

export function evaluerAlerteIndicateur(indicateur: Indicateur, valeur: any): AlerteReponse | null {
  if (!indicateur.seuilAlerte || !indicateur.seuilAlerte.actif) {
    return null;
  }

  const { operateur, valeur: seuilValeur, message, niveau } = indicateur.seuilAlerte;

  let declenche = false;

  if (valeur === undefined || valeur === null || valeur === '') {
    return null;
  }

  // Comparaisons numériques
  const numValeur = Number(valeur);
  const numSeuil = Number(seuilValeur);

  if (!isNaN(numValeur) && !isNaN(numSeuil)) {
    switch (operateur) {
      case '>':
        declenche = numValeur > numSeuil;
        break;
      case '>=':
        declenche = numValeur >= numSeuil;
        break;
      case '<':
        declenche = numValeur < numSeuil;
        break;
      case '<=':
        declenche = numValeur <= numSeuil;
        break;
      case '==':
        declenche = numValeur === numSeuil;
        break;
    }
  } else if (typeof valeur === 'boolean' || seuilValeur === 'true' || seuilValeur === 'false' || typeof seuilValeur === 'boolean') {
    const boolVal = Boolean(valeur);
    const boolSeuil = seuilValeur === true || seuilValeur === 'true';
    if (operateur === '==') {
      declenche = boolVal === boolSeuil;
    }
  } else {
    // Comparaison textuelle
    if (operateur === '==') {
      declenche = String(valeur).trim().toLowerCase() === String(seuilValeur).trim().toLowerCase();
    }
  }

  if (declenche) {
    return {
      indicateurId: indicateur.id,
      indicateurNom: indicateur.nom,
      valeur,
      message: message || `Seuil dépassé (${valeur} ${operateur} ${seuilValeur})`,
      niveau,
    };
  }

  return null;
}

export function evaluerToutesAlertes(indicateurs: Indicateur[], valeurs: Record<string, any>): AlerteReponse[] {
  const alertes: AlerteReponse[] = [];
  const indMap = new Map<string, Indicateur>(indicateurs.map((i) => [i.id, i]));

  for (const [indId, val] of Object.entries(valeurs)) {
    const ind = indMap.get(indId);
    if (ind) {
      const alerte = evaluerAlerteIndicateur(ind, val);
      if (alerte) {
        alertes.push(alerte);
      }
    }
  }

  return alertes;
}

export function formaterValeurIndicateur(indicateur: Indicateur, valeur: any): string {
  if (valeur === undefined || valeur === null || valeur === '') {
    return 'Non renseigné';
  }

  switch (indicateur.type) {
    case 'booleen':
      return valeur ? (indicateur.libelleVrai || 'Oui') : (indicateur.libelleFaux || 'Non');
    case 'numerique':
      return `${valeur} ${indicateur.unite || ''}`.trim();
    case 'echelle_0_100':
      return `${valeur}%`;
    case 'echelle_1_5':
      return `${valeur} / 5`;
    case 'echelle_1_10':
      return `${valeur} / 10`;
    case 'echelle_personnalisee':
      return `${valeur} (${indicateur.echelleMin || 0} - ${indicateur.echelleMax || 10})`;
    case 'choix_multiple':
      return Array.isArray(valeur) ? valeur.join(', ') : String(valeur);
    default:
      return String(valeur);
  }
}
