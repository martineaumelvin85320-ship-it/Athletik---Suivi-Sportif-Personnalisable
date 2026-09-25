import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { Sportif, Equipe, StatutSportif } from '../../types';

interface SportifModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surSauvegarder: (sp: Omit<Sportif, 'id' | 'dateAjout' | 'initiales'>) => void;
  sportifEnEdition?: Sportif | null;
  equipes: Equipe[];
}

export const SportifModal: React.FC<SportifModalProps> = ({
  ouvert,
  surFermer,
  surSauvegarder,
  sportifEnEdition,
  equipes,
}) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [equipeId, setEquipeId] = useState<string>('');
  const [posteOuSpecialite, setPosteOuSpecialite] = useState('');
  const [statut, setStatut] = useState<StatutSportif>('Actif');
  const [dateNaissance, setDateNaissance] = useState('');
  const [telephone, setTelephone] = useState('');
  const [autoriserHistorique, setAutoriserHistorique] = useState(true);

  useEffect(() => {
    if (sportifEnEdition) {
      setPrenom(sportifEnEdition.prenom);
      setNom(sportifEnEdition.nom);
      setEmail(sportifEnEdition.email);
      setEquipeId(sportifEnEdition.equipeId || '');
      setPosteOuSpecialite(sportifEnEdition.posteOuSpecialite || '');
      setStatut(sportifEnEdition.statut);
      setDateNaissance(sportifEnEdition.dateNaissance || '');
      setTelephone(sportifEnEdition.telephone || '');
      setAutoriserHistorique(sportifEnEdition.autoriserHistorique);
    } else {
      setPrenom('');
      setNom('');
      setEmail('');
      setEquipeId(equipes[0]?.id || '');
      setPosteOuSpecialite('');
      setStatut('Actif');
      setDateNaissance('2001-01-01');
      setTelephone('');
      setAutoriserHistorique(true);
    }
  }, [sportifEnEdition, ouvert, equipes]);

  if (!ouvert) return null;

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) return;

    surSauvegarder({
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim() || `${prenom.toLowerCase()}.${nom.toLowerCase()}@club.fr`,
      equipeId: equipeId || null,
      posteOuSpecialite: posteOuSpecialite.trim(),
      statut,
      dateNaissance: dateNaissance || undefined,
      telephone: telephone.trim() || undefined,
      autoriserHistorique,
    });
    surFermer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {sportifEnEdition ? 'Modifier le sportif' : 'Ajouter un nouveau sportif'}
              </h2>
              <p className="text-xs text-neutral-400">
                Fiche athlète et permissions de consultation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={surFermer}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSoumettre} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Lucas"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dubois"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lucas@club.fr"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Téléphone</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Équipe assignée</label>
              <select
                value={equipeId}
                onChange={(e) => setEquipeId(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Sans équipe assignée</option>
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Statut médical / forme</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as StatutSportif)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Actif">Actif (100% apte)</option>
                <option value="En reprise">En reprise progressive</option>
                <option value="Blessé">Blessé / Indisponible</option>
                <option value="Repos">Repos complet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Poste / Spécialité sportive
            </label>
            <input
              type="text"
              value={posteOuSpecialite}
              onChange={(e) => setPosteOuSpecialite(e.target.value)}
              placeholder="Ex : Milieu relayeur, Triathlon, Demi-fond, Pilier..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Droit de consulter son historique */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-800/40 p-3 pt-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoriserHistorique}
                onChange={(e) => setAutoriserHistorique(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-semibold text-white">
                  Autoriser le sportif à consulter son historique personnel
                </span>
                <p className="text-[11px] text-neutral-400">
                  Le sportif pourra voir ses graphiques de progression et ses check-ins précédents sur son mobile.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={surFermer}
              className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400"
            >
              {sportifEnEdition ? 'Mettre à jour' : 'Ajouter le sportif'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
