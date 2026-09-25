import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Indicateur, CategorieIndicateur } from '../../types';
import { IndicateurBuilderModal } from './IndicateurBuilderModal';
import { EchellesLibraryModal } from '../echelles/EchellesLibraryModal';

export const IndicateursView: React.FC = () => {
  const {
    indicateurs,
    echelles,
    ajouterIndicateur,
    modifierIndicateur,
    supprimerIndicateur,
    dupliquerIndicateur,
  } = useApp();

  const [recherche, setRecherche] = useState('');
  const [categorieFiltre, setCategorieFiltre] = useState<string>('tous');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modalEchellesOuvert, setModalEchellesOuvert] = useState(false);
  const [indicateurEnEdition, setIndicateurEnEdition] = useState<Indicateur | null>(null);

  const categories: (CategorieIndicateur | 'tous')[] = [
    'tous',
    'Bien-être',
    'Charge',
    'Récupération',
    'Physiologique',
    'Performance',
    'Douleur',
    'Autre',
  ];

  const indicateursFiltres = indicateurs.filter((ind) => {
    const matchNom =
      ind.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      ind.code.toLowerCase().includes(recherche.toLowerCase()) ||
      ind.description.toLowerCase().includes(recherche.toLowerCase());
    const matchCat = categorieFiltre === 'tous' || ind.categorie === categorieFiltre;
    return matchNom && matchCat;
  });

  const handleOuvrirNouveau = () => {
    setIndicateurEnEdition(null);
    setModalOuvert(true);
  };

  const handleEditer = (ind: Indicateur) => {
    setIndicateurEnEdition(ind);
    setModalOuvert(true);
  };

  const handleSupprimer = (id: string, nom: string) => {
    if (window.confirm(`Confirmez-vous la suppression définitive de l’indicateur "${nom}" ?`)) {
      supprimerIndicateur(id);
    }
  };

  const formaterTypeBadge = (ind: Indicateur) => {
    if (ind.echelleId) {
      const echelleAssociee = echelles.find((e) => e.id === ind.echelleId);
      if (echelleAssociee?.isBorg) {
        return 'Échelle de Borg (CR-10 / 6-20)';
      }
      if (echelleAssociee) {
        return `Échelle : ${echelleAssociee.nom}`;
      }
    }

    if (ind.paliersEchelle && ind.paliersEchelle.length > 0) {
      return `Échelle ${ind.paliersEchelle.length} paliers`;
    }

    switch (ind.type) {
      case 'echelle_1_5':
        return 'Échelle 1 à 5';
      case 'echelle_1_10':
        return 'Échelle 1 à 10';
      case 'echelle_0_100':
        return 'Échelle 0 à 100';
      case 'echelle_personnalisee':
        return 'Échelle sur mesure';
      case 'booleen':
        return 'Oui / Non';
      case 'numerique':
        return 'Numérique libre';
      case 'choix_unique':
        return 'Choix unique';
      case 'choix_multiple':
        return 'Choix multiple';
      case 'texte':
        return 'Texte libre';
      default:
        return ind.type;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Bibliothèque d’Indicateurs & Échelles
            </h1>
            <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-300">
              {indicateurs.length} indicateurs
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Créez vos propres métriques et échelles sur mesure tout en conservant les échelles de Borg officielles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setModalEchellesOuvert(true)}
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors shadow-sm"
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span>Échelles & Borg ({echelles.length})</span>
          </button>

          <button
            type="button"
            onClick={handleOuvrirNouveau}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un indicateur</span>
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres par Catégorie */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, code (ex: SOMMEIL, RPE)..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Badges de catégories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategorieFiltre(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                categorieFiltre === cat
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {cat === 'tous' ? 'Toutes les catégories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des Indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicateursFiltres.map((ind) => {
          const echelleAssociee = ind.echelleId
            ? echelles.find((e) => e.id === ind.echelleId)
            : null;

          return (
            <div
              key={ind.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 hover:border-neutral-700 hover:bg-neutral-900 transition-all shadow-sm"
            >
              <div>
                {/* Entête de carte */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                    {ind.categorie}
                  </span>
                  <div className="flex items-center gap-1">
                    {echelleAssociee?.isBorg && (
                      <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 flex items-center gap-0.5">
                        <Award className="h-2.5 w-2.5" />
                        Borg
                      </span>
                    )}
                    <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ind.code}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {ind.nom}
                </h3>

                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                  {ind.description || 'Aucune consigne spécifique.'}
                </p>

                {/* Détails du type d'échelle */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-lg bg-neutral-800/80 px-2.5 py-1 text-neutral-300 ring-1 ring-neutral-700/60 font-medium flex items-center gap-1">
                    {echelleAssociee?.isBorg && <Award className="h-3 w-3 text-amber-400" />}
                    <span>{formaterTypeBadge(ind)}</span>
                  </span>

                  {ind.type.startsWith('echelle_') && (
                    <span className="rounded-lg bg-neutral-800/80 px-2 py-1 text-neutral-400 text-[10px]">
                      {ind.echelleMin} → {ind.echelleMax}
                    </span>
                  )}

                  {ind.unite && (
                    <span className="rounded-lg bg-neutral-800/80 px-2 py-1 text-neutral-400 text-[10px]">
                      Unité: {ind.unite}
                    </span>
                  )}

                  {ind.valeurHautePositive ? (
                    <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Haut = Bon
                    </span>
                  ) : (
                    <span className="rounded-lg bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                      Haut = Alerte
                    </span>
                  )}
                </div>

                {/* Règle d'alerte */}
                {ind.seuilAlerte?.actif && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <span className="font-semibold">
                        Alerte si {ind.seuilAlerte.operateur} {String(ind.seuilAlerte.valeur)}
                      </span>
                      <p className="text-[10px] text-amber-400/80 mt-0.5">
                        {ind.seuilAlerte.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Barre d'actions */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono">
                  {ind.type.startsWith('echelle_')
                    ? `${ind.libelleMin || 'Min'} ↔ ${ind.libelleMax || 'Max'}`
                    : ind.type}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => dupliquerIndicateur(ind.id)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    title="Dupliquer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditer(ind)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSupprimer(ind.id, ind.nom)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <IndicateurBuilderModal
        ouvert={modalOuvert}
        surFermer={() => setModalOuvert(false)}
        surSauvegarder={(donnees) => {
          if (indicateurEnEdition) {
            modifierIndicateur(indicateurEnEdition.id, donnees);
          } else {
            ajouterIndicateur(donnees);
          }
        }}
        indicateurEnEdition={indicateurEnEdition}
      />

      <EchellesLibraryModal
        ouvert={modalEchellesOuvert}
        surFermer={() => setModalEchellesOuvert(false)}
      />
    </div>
  );
};
