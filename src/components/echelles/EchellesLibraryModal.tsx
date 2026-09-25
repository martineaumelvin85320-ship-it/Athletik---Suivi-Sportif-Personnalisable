import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Shield,
  Award,
  Sliders,
  Sparkles,
  Info,
  Check,
  Search,
} from 'lucide-react';
import { EchellePersonnalisee } from '../../types';
import { EchelleEditorModal } from './EchelleEditorModal';

interface EchellesLibraryModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surSelectionner?: (echelle: EchellePersonnalisee) => void;
}

export const EchellesLibraryModal: React.FC<EchellesLibraryModalProps> = ({
  ouvert,
  surFermer,
  surSelectionner,
}) => {
  const { echelles, ajouterEchelle, modifierEchelle, supprimerEchelle, dupliquerEchelle } =
    useApp();
  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState<'tous' | 'borg' | 'coach' | 'preset'>('tous');
  const [echelleEnEdition, setEchelleEnEdition] = useState<EchellePersonnalisee | null>(null);
  const [modalEditionOuvert, setModalEditionOuvert] = useState(false);
  const [echelleApercueId, setEchelleApercueId] = useState<string>(
    echelles[0]?.id || 'ech-borg-cr10'
  );

  if (!ouvert) return null;

  const echellesFiltrees = echelles.filter((ech) => {
    const correspondRecherche =
      ech.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      ech.description.toLowerCase().includes(recherche.toLowerCase()) ||
      ech.code.toLowerCase().includes(recherche.toLowerCase());

    if (!correspondRecherche) return false;

    if (filtreType === 'borg') return ech.isBorg;
    if (filtreType === 'coach') return !ech.isBorg && !ech.isPreset;
    if (filtreType === 'preset') return ech.isPreset && !ech.isBorg;
    return true;
  });

  const handleAjouter = () => {
    setEchelleEnEdition(null);
    setModalEditionOuvert(true);
  };

  const handleEditer = (ech: EchellePersonnalisee) => {
    setEchelleEnEdition(ech);
    setModalEditionOuvert(true);
  };

  const handleSupprimer = (id: string, nom: string) => {
    if (
      window.confirm(
        `Voulez-vous supprimer l'échelle "${nom}" ? Les indicateurs qui l'utilisent repasseront en échelle standard.`
      )
    ) {
      supprimerEchelle(id);
    }
  };

  const echelleApercue =
    echelles.find((e) => e.id === echelleApercueId) || echelles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bibliothèque des Échelles & Échelle de Borg</span>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                  {echelles.length} échelles
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Créez vos propres échelles sur mesure tout en conservant les échelles de Borg officielles de référence
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

        {/* Barre de recherche et filtres */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une échelle..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setFiltreType('tous')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  filtreType === 'tous'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Toutes
              </button>
              <button
                type="button"
                onClick={() => setFiltreType('borg')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  filtreType === 'borg'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Award className="h-3 w-3" />
                <span>Borg (RPE)</span>
              </button>
              <button
                type="button"
                onClick={() => setFiltreType('coach')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  filtreType === 'coach'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sur mesure
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAjouter}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Créer une échelle sur mesure</span>
          </button>
        </div>

        {/* Contenu split : Liste à gauche, Aperçu interactif à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Liste des échelles (colonne gauche) */}
          <div className="lg:col-span-7 overflow-y-auto p-4 space-y-3 border-r border-neutral-800">
            {/* Note informative Borg */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
              <Award className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block">
                  Échelle de Borg Conservée & Protégée
                </span>
                <span className="text-[11px] text-amber-200/80">
                  L'échelle de Borg CR-10 (Foster) et la Borg 6-20 sont toujours disponibles et protégées. Vous pouvez également créer vos propres échelles personnalisées ou dupliquer une échelle de référence.
                </span>
              </div>
            </div>

            {echellesFiltrees.map((ech) => {
              const estActive = echelleApercueId === ech.id;
              return (
                <div
                  key={ech.id}
                  onClick={() => setEchelleApercueId(ech.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    estActive
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{ech.nom}</h4>
                        {ech.isBorg ? (
                          <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Award className="h-2.5 w-2.5" />
                            Borg Officielle
                          </span>
                        ) : ech.isPreset ? (
                          <span className="rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 text-[9px] font-semibold">
                            Référence
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-semibold">
                            Créée par vous
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                        {ech.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400">
                        <span className="font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] text-neutral-300">
                          {ech.min} à {ech.max} (pas de {ech.pas})
                        </span>
                        {ech.paliers && ech.paliers.length > 0 && (
                          <span>{ech.paliers.length} paliers distincts</span>
                        )}
                      </div>
                    </div>

                    {/* Actions sur l'échelle */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {surSelectionner && (
                        <button
                          type="button"
                          onClick={() => surSelectionner(ech)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-sm transition-colors"
                        >
                          Choisir
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => dupliquerEchelle(ech.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Dupliquer pour personnaliser"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditer(ech)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Modifier cette échelle"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {!ech.isBorg && (
                        <button
                          type="button"
                          onClick={() => handleSupprimer(ech.id, ech.nom)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800"
                          title="Supprimer cette échelle"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Volet de détail / Aperçu interactif (colonne droite) */}
          <div className="lg:col-span-5 overflow-y-auto p-5 bg-neutral-950/90 space-y-4">
            {echelleApercue ? (
              <div className="space-y-4">
                <div className="border-b border-neutral-800 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Détail & Paliers de l'échelle
                    </span>
                    {echelleApercue.isBorg && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Shield className="h-3 w-3" /> Standard Gunnar Borg
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white mt-1">
                    {echelleApercue.nom}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {echelleApercue.description}
                  </p>
                </div>

                {/* Rendu des paliers chiffrés */}
                {echelleApercue.paliers && echelleApercue.paliers.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-300 block">
                      Repères d’évaluation des athlètes :
                    </span>
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {echelleApercue.paliers.map((pal) => (
                        <div
                          key={pal.valeur}
                          className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-6 w-6 rounded-lg font-black text-xs flex items-center justify-center text-white shrink-0 shadow-sm"
                              style={{ backgroundColor: pal.couleur || '#10b981' }}
                            >
                              {pal.valeur}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {pal.libelle}
                              </div>
                              {pal.description && (
                                <div className="text-[10px] text-neutral-400">
                                  {pal.description}
                                </div>
                              )}
                            </div>
                          </div>

                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: pal.couleur || '#10b981' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-xs space-y-2">
                    <span className="font-bold text-white block">Curseur linéaire continu :</span>
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span>{echelleApercue.libelleMin || `Min: ${echelleApercue.min}`}</span>
                      <span>{echelleApercue.libelleMax || `Max: ${echelleApercue.max}`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-800 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditer(echelleApercue)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-900 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Modifier</span>
                  </button>

                  {surSelectionner && (
                    <button
                      type="button"
                      onClick={() => surSelectionner(echelleApercue)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
                    >
                      <Check className="h-4 w-4" />
                      <span>Utiliser pour l'indicateur</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500 text-xs">
                Sélectionnez une échelle pour visualiser ses paliers.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-neutral-800 bg-neutral-900">
          <button
            type="button"
            onClick={surFermer}
            className="rounded-xl border border-neutral-700 px-4 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      <EchelleEditorModal
        ouvert={modalEditionOuvert}
        surFermer={() => setModalEditionOuvert(false)}
        surSauvegarder={(donnees) => {
          if (echelleEnEdition) {
            modifierEchelle(echelleEnEdition.id, donnees);
          } else {
            const creee = ajouterEchelle(donnees);
            setEchelleApercueId(creee.id);
          }
        }}
        echelleEnEdition={echelleEnEdition}
      />
    </div>
  );
};
