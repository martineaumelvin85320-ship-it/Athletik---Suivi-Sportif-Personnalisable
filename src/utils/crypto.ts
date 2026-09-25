/**
 * Utilitaire cryptographique pour le hachage sécurisé des mots de passe.
 * Utilise l'API standard Web Crypto (SHA-256) avec salage pour ne jamais
 * stocker de mot de passe en clair.
 */

const SEL_APPLICATION = 'athletik_pro_salt_2026_#9821_secure';

export async function hacherMotDePasse(motDePasseClair: string): Promise<string> {
  const encodeur = new TextEncoder();
  const donneesAvecSel = encodeur.encode(`${SEL_APPLICATION}_${motDePasseClair}`);
  
  const bufferHash = await crypto.subtle.digest('SHA-256', donneesAvecSel);
  const hashArray = Array.from(new Uint8Array(bufferHash));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export async function verifierMotDePasse(
  motDePasseClair: string,
  hashEnregistre: string
): Promise<boolean> {
  const hashCalcule = await hacherMotDePasse(motDePasseClair);
  return hashCalcule === hashEnregistre;
}
