import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Smartphone,
  AlertTriangle,
  HeartPulse,
  Flame,
} from 'lucide-react';
import { Sportif, StatutSportif } from '../../types';
import { SportifModal } from './SportifModal';
import { SportifDetailModal } from './SportifDetailModal';
import { calculerScoreWellnessSportif, calculerACWR } from '../../utils/analytics';

export const SportifsView: React.FC = () => {
  const {
    sportifs,
    equipes,
    reponses,
    indicateurs,
    ajouterSportif,
    modifierSportif,
    supprimerSportif,
    setRoleActuel,
    setSportifConnecteId,
  } = useApp();

  const [recherche, setRecherche] = useState('');
  const [equipeFiltre, setEquipeFiltre] = useState<string>('tous');
  const [statutFiltre, setStatutFiltre] = useState<string>('tous');

  const [modalAjoutOuvert, setModalAjoutOuvert] = useState(false);
  const [sportifEnEdition, setSportifEnEdition] = useState<Sportif | null>(null);
  const [sportifDetail, setSportifDetail] = useState<Sportif | null>(null);

  const equipeMap = new Map(equipes.map((e) => [e.id, e]));

  const sportifsFiltres = sportifs.filter((s) => {
    const matchNom = `${s.prenom} ${s.nom}`.toLowerCase().includes(recherche.toLowerCase()) ||
      s.posteOuSpecialite.toLowerCase().includes(recherche.toLowerCase());
    const matchEquipe = equipeFiltre === 'tous' || s.equipeId === equipeFiltre;
    const matchStatut = statutFiltre === 'tous' || s.statut === statutFiltre;
    return matchNom && matchEquipe && matchStatut;
  });

  const handleAjouterNouveau = () => {
    setSportifEnEdition(null);
    setModalAjoutOuvert(true);
  };

  const handleEditer = (s: Sportif) => {
    setSportifEnEdition(s);
    setModalAjoutOuvert(true);
  };

  const handleSupprimer = (id: string, nom: string) => {
    if (window.confirm(`Confirmez-vous la suppression du sportif ${nom} ainsi que l'ensemble de ses réponses ?`)) {
      supprimerSportif(id);
    }
  };

  const handlePasserEnSportif = (id: string) => {
    setSportifConnecteId(id);
    setRoleActuel('sportif');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Gestion de l’Effectif des Sportifs
            </h1>
            <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-300">
              {sportifs.length} athlètes
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Suivi individuel, scores de forme au réveil, ratios de charge et accès aux questionnaires mobiles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAjouterNouveau}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Ajouter un sportif</span>
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Rechercher un athlète par nom, poste, spécialité..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={equipeFiltre}
            onChange={(e) => setEquipeFiltre(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="tous">Toutes les équipes</option>
            {equipes.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nom}
              </option>
            ))}
          </select>

          <select
            value={statutFiltre}
            onChange={(e) => setStatutFiltre(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="tous">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="En reprise">En reprise</option>
            <option value="Blessé">Blessé</option>
            <option value="Repos">Repos</option>
          </select>
        </div>
      </div>

      {/* Grille des Sportifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sportifsFiltres.map((sp) => {
          const eq = sp.equipeId ? equipeMap.get(sp.equipeId) : null;
          const wellness = calculerScoreWellnessSportif(sp.id, reponses);
          const acwr = calculerACWR(sp.id, reponses);

          // Alertes du jour
          const dateJour = new Date().toISOString().split('T')[0];
          const repJour = reponses.find((r) => r.sportifId === sp.id && r.dateJour === dateJour);
          const alertesDuJour = repJour?.alertes || [];

          return (
            <div
              key={sp.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 hover:border-neutral-700 transition-all shadow-sm"
            >
              <div>
                {/* Haut de carte */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full aspect-square bg-emerald-500/10 text-emerald-400 font-bold text-sm ring-1 ring-emerald-500/30 shrink-0">
                      {sp.initiales}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {sp.prenom} {sp.nom}
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        {sp.posteOuSpecialite || 'Non renseigné'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      sp.statut === 'Actif'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : sp.statut === 'Blessé'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {sp.statut}
                  </span>
                </div>

                {/* Équipe */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: eq?.couleur || '#525252' }}
                  />
                  <span className="text-xs text-neutral-300 font-medium">
                    {eq ? eq.nom : 'Sans équipe'}
                  </span>
                </div>

                {/* Métriques clés */}
                <div className="grid grid-cols-2 gap-2 my-3 rounded-xl bg-neutral-950/60 p-3 border border-neutral-800">
                  <div>
                    <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <HeartPulse className="h-3 w-3 text-emerald-400" />
                      <span>Forme :</span>
                    </span>
                    <span className="text-base font-bold text-white">
                      {wellness.scoreActuel}%
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <Flame className="h-3 w-3 text-amber-400" />
                      <span>ACWR (7j/28j) :</span>
                    </span>
                    <span className="text-base font-bold text-white">
                      {acwr.ratioACWR}
                    </span>
                  </div>
                </div>

                {/* Alerte du jour */}
                {alertesDuJour.length > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 text-[11px] text-rose-300 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">
                      {alertesDuJour[0].message}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSportifDetail(sp)}
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Fiche complète</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Simuler son smartphone"
                    onClick={() => handlePasserEnSportif(sp.id)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-emerald-400"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Modifier"
                    onClick={() => handleEditer(sp)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() => handleSupprimer(sp.id, `${sp.prenom} ${sp.nom}`)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <SportifModal
        ouvert={modalAjoutOuvert}
        surFermer={() => setModalAjoutOuvert(false)}
        surSauvegarder={(donnees) => {
          if (sportifEnEdition) {
            modifierSportif(sportifEnEdition.id, donnees);
          } else {
            ajouterSportif(donnees);
          }
        }}
        sportifEnEdition={sportifEnEdition}
        equipes={equipes}
      />

      <SportifDetailModal
        ouvert={!!sportifDetail}
        surFermer={() => setSportifDetail(null)}
        sportif={sportifDetail}
        equipe={sportifDetail && sportifDetail.equipeId ? equipeMap.get(sportifDetail.equipeId) || null : null}
        reponses={reponses}
        indicateurs={indicateurs}
        surPasserEnSportif={handlePasserEnSportif}
      />
    </div>
  );
};
