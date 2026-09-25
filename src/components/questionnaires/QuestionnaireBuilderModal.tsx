import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardList,
  Check,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Users,
  Eye,
} from 'lucide-react';
import { Questionnaire, Indicateur, Equipe, Sportif } from '../../types';

interface QuestionnaireBuilderModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surSauvegarder: (quest: Omit<Questionnaire, 'id' | 'dateCreation'>) => void;
  questionnaireEnEdition?: Questionnaire | null;
  tousIndicateurs: Indicateur[];
  equipes: Equipe[];
  sportifs: Sportif[];
}

export const QuestionnaireBuilderModal: React.FC<QuestionnaireBuilderModalProps> = ({
  ouvert,
  surFermer,
  surSauvegarder,
  questionnaireEnEdition,
  tousIndicateurs,
  equipes,
  sportifs,
}) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [frequence, setFrequence] = useState<'Quotidien' | 'Après séance' | 'Hebdomadaire' | 'Ponctuel'>('Quotidien');
  const [momentJournee, setMomentJournee] = useState<'Matin' | 'Soir' | 'Après entraînement' | 'Libre'>('Matin');
  const [tempsEstime, setTempsEstime] = useState(2);
  const [indicateurIds, setIndicateurIds] = useState<string[]>([]);
  const [actif, setActif] = useState(true);

  // Attribution
  const [attributionType, setAttributionType] = useState<'tous' | 'equipe' | 'sportifs'>('tous');
  const [cibleEquipeIds, setCibleEquipeIds] = useState<string[]>([]);
  const [cibleSportifIds, setCibleSportifIds] = useState<string[]>([]);

  useEffect(() => {
    if (questionnaireEnEdition) {
      setTitre(questionnaireEnEdition.titre);
      setDescription(questionnaireEnEdition.description);
      setFrequence(questionnaireEnEdition.frequence);
      setMomentJournee(questionnaireEnEdition.momentJournee);
      setTempsEstime(questionnaireEnEdition.tempsEstimeMinutes);
      setIndicateurIds(questionnaireEnEdition.indicateurIds);
      setActif(questionnaireEnEdition.actif);
      setAttributionType(questionnaireEnEdition.attributionType);
      setCibleEquipeIds(questionnaireEnEdition.cibleEquipeIds || []);
      setCibleSportifIds(questionnaireEnEdition.cibleSportifIds || []);
    } else {
      setTitre('');
      setDescription('');
      setFrequence('Quotidien');
      setMomentJournee('Matin');
      setTempsEstime(2);
      // Par défaut on propose les indicateurs clés
      setIndicateurIds(tousIndicateurs.slice(0, 4).map((i) => i.id));
      setActif(true);
      setAttributionType('tous');
      setCibleEquipeIds([]);
      setCibleSportifIds([]);
    }
  }, [questionnaireEnEdition, ouvert, tousIndicateurs]);

  if (!ouvert) return null;

  const toggleIndicateur = (id: string) => {
    if (indicateurIds.includes(id)) {
      setIndicateurIds(indicateurIds.filter((i) => i !== id));
    } else {
      setIndicateurIds([...indicateurIds, id]);
    }
  };

  const deplacerIndicateur = (index: number, direction: 'haut' | 'bas') => {
    const nouvelleListe = [...indicateurIds];
    const cible = direction === 'haut' ? index - 1 : index + 1;
    if (cible < 0 || cible >= nouvelleListe.length) return;
    const temp = nouvelleListe[index];
    nouvelleListe[index] = nouvelleListe[cible];
    nouvelleListe[cible] = temp;
    setIndicateurIds(nouvelleListe);
  };

  const toggleEquipe = (id: string) => {
    if (cibleEquipeIds.includes(id)) {
      setCibleEquipeIds(cibleEquipeIds.filter((e) => e !== id));
    } else {
      setCibleEquipeIds([...cibleEquipeIds, id]);
    }
  };

  const toggleSportif = (id: string) => {
    if (cibleSportifIds.includes(id)) {
      setCibleSportifIds(cibleSportifIds.filter((s) => s !== id));
    } else {
      setCibleSportifIds([...cibleSportifIds, id]);
    }
  };

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    surSauvegarder({
      titre: titre.trim(),
      description: description.trim(),
      frequence,
      momentJournee,
      tempsEstimeMinutes: Number(tempsEstime) || 2,
      indicateurIds,
      actif,
      attributionType,
      cibleEquipeIds,
      cibleSportifIds,
    });
    surFermer();
  };

  const indMap = new Map(tousIndicateurs.map((i) => [i.id, i]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {questionnaireEnEdition ? 'Modifier le questionnaire' : 'Créer un questionnaire'}
              </h2>
              <p className="text-xs text-neutral-400">
                Assemblez les indicateurs de votre choix et attribuez le formulaire aux équipes
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

        {/* Formulaire */}
        <form id="form-quest" onSubmit={handleSoumettre} className="overflow-y-auto p-6 space-y-6">
          {/* Titre et Détails */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Titre du questionnaire *
              </label>
              <input
                type="text"
                required
                placeholder="Ex : Wellness Quotidien Matin, Débrief Séance..."
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Description / Consignes pour le sportif
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : À remplir dès le réveil avant le petit-déjeuner..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Fréquence</label>
                <select
                  value={frequence}
                  onChange={(e) => setFrequence(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Quotidien">Quotidien</option>
                  <option value="Après séance">Après séance</option>
                  <option value="Hebdomadaire">Hebdomadaire</option>
                  <option value="Ponctuel">Ponctuel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Moment conseillé
                </label>
                <select
                  value={momentJournee}
                  onChange={(e) => setMomentJournee(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Matin">Matin (Réveil)</option>
                  <option value="Après entraînement">Après entraînement</option>
                  <option value="Soir">Soir (Coucher)</option>
                  <option value="Libre">Libre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Temps estimé (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={tempsEstime}
                  onChange={(e) => setTempsEstime(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Sélection & Ordonnancement des indicateurs */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Indicateurs inclus ({indicateurIds.length} sélectionnés)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Cochez les indicateurs à intégrer et ajustez l’ordre d’apparition.
                </p>
              </div>
            </div>

            {/* Liste des indicateurs sélectionnés avec réordonnancement */}
            {indicateurIds.length > 0 && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Ordre d’affichage dans le formulaire :
                </span>
                <div className="space-y-1.5">
                  {indicateurIds.map((id, index) => {
                    const ind = indMap.get(id);
                    if (!ind) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded-lg bg-neutral-800/90 border border-neutral-700/60 px-3 py-2 text-xs text-white"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-bold text-neutral-300">
                            {index + 1}
                          </span>
                          <span className="font-semibold">{ind.nom}</span>
                          <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                            {ind.categorie}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => deplacerIndicateur(index, 'haut')}
                            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === indicateurIds.length - 1}
                            onClick={() => deplacerIndicateur(index, 'bas')}
                            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleIndicateur(id)}
                            className="p-1 text-neutral-400 hover:text-rose-400 ml-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tous les indicateurs disponibles */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Bibliothèque disponible :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {tousIndicateurs.map((ind) => {
                  const estSelectionne = indicateurIds.includes(ind.id);
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => toggleIndicateur(ind.id)}
                      className={`flex items-start justify-between rounded-xl p-2.5 text-left border transition-all ${
                        estSelectionne
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                          : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{ind.nom}</div>
                        <div className="text-[10px] text-neutral-500">{ind.categorie} • {ind.type}</div>
                      </div>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border mt-0.5 ${
                          estSelectionne
                            ? 'bg-emerald-500 border-emerald-500 text-neutral-950'
                            : 'border-neutral-600'
                        }`}
                      >
                        {estSelectionne && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Attribution aux Sportifs */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Attribution du Questionnaire
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tous', libelle: 'Tous les sportifs' },
                { id: 'equipe', libelle: 'Par Équipes' },
                { id: 'sportifs', libelle: 'Sportifs ciblés' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAttributionType(opt.id as any)}
                  className={`rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                    attributionType === opt.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {opt.libelle}
                </button>
              ))}
            </div>

            {attributionType === 'equipe' && (
              <div className="space-y-2 rounded-xl bg-neutral-800/30 p-3 border border-neutral-800">
                <span className="text-xs text-neutral-300 font-medium">Sélectionnez les équipes cibles :</span>
                <div className="flex flex-wrap gap-2">
                  {equipes.map((eq) => {
                    const estCible = cibleEquipeIds.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => toggleEquipe(eq.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                          estCible
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: eq.couleur || '#10b981' }}
                        />
                        <span>{eq.nom}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {attributionType === 'sportifs' && (
              <div className="space-y-2 rounded-xl bg-neutral-800/30 p-3 border border-neutral-800">
                <span className="text-xs text-neutral-300 font-medium">Sélectionnez les sportifs cibles :</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                  {sportifs.map((sp) => {
                    const estCible = cibleSportifIds.includes(sp.id);
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => toggleSportif(sp.id)}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium border text-left transition-colors ${
                          estCible
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span>{sp.prenom} {sp.nom}</span>
                        {estCible && <Check className="h-3 w-3 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Pied de modal */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900 px-6 py-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={actif}
              onChange={(e) => setActif(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500"
            />
            <span>Questionnaire actif et disponible</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={surFermer}
              className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="form-quest"
              disabled={indicateurIds.length === 0}
              className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 disabled:opacity-40"
            >
              {questionnaireEnEdition ? 'Mettre à jour' : 'Enregistrer le questionnaire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
