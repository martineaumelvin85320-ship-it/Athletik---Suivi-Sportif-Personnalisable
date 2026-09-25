import React, { useState, useEffect } from 'react';
import { X, CalendarCheck2, Clock, Users, Flame, Calendar, Sparkles, Repeat } from 'lucide-react';
import { Seance, Equipe, Questionnaire, PhaseSaison } from '../../types';
import { PHASES_SAISON_DEFAUT, trouverPhaseSaisonPourDate } from '../../utils/analytics';

interface SeanceModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surSauvegarder: (seance: Omit<Seance, 'id' | 'dateCreation'>, repetitionsSemaines?: number) => void;
  seanceEnEdition?: Seance | null;
  dateParDefaut?: string;
  valeursInitiales?: {
    titre?: string;
    type?: Seance['type'];
    dureeMinutes?: number;
    rpePrevu?: number;
    description?: string;
  } | null;
  equipes: Equipe[];
  questionnaires: Questionnaire[];
  phasesSaison?: PhaseSaison[];
}

export const SeanceModal: React.FC<SeanceModalProps> = ({
  ouvert,
  surFermer,
  surSauvegarder,
  seanceEnEdition,
  dateParDefaut,
  valeursInitiales,
  equipes,
  questionnaires,
  phasesSaison = PHASES_SAISON_DEFAUT,
}) => {
  const [titre, setTitre] = useState('');
  const [type, setType] = useState<Seance['type']>('Entraînement');
  const [date, setDate] = useState(dateParDefaut || new Date().toISOString().split('T')[0]);
  const [heureDebut, setHeureDebut] = useState('10:00');
  const [dureeMinutes, setDureeMinutes] = useState(75);
  const [rpePrevu, setRpePrevu] = useState<number>(7);
  const [equipeId, setEquipeId] = useState<string>('');
  const [questionnaireId, setQuestionnaireId] = useState<string>('');
  const [phaseSaison, setPhaseSaison] = useState<string>('');
  const [description, setDescription] = useState('');
  const [statut, setStatut] = useState<Seance['statut']>('Planifiée');
  const [repetitionsSemaines, setRepetitionsSemaines] = useState<number>(0);

  useEffect(() => {
    if (seanceEnEdition) {
      setTitre(seanceEnEdition.titre);
      setType(seanceEnEdition.type);
      setDate(seanceEnEdition.date);
      setHeureDebut(seanceEnEdition.heureDebut || '10:00');
      setDureeMinutes(seanceEnEdition.dureeMinutes);
      setRpePrevu(seanceEnEdition.rpePrevu ?? 7);
      setEquipeId(seanceEnEdition.equipeId || '');
      setQuestionnaireId(seanceEnEdition.questionnaireId || '');
      setPhaseSaison(seanceEnEdition.phaseSaison || '');
      setDescription(seanceEnEdition.description || '');
      setStatut(seanceEnEdition.statut);
      setRepetitionsSemaines(0);
    } else {
      const initDate = dateParDefaut || new Date().toISOString().split('T')[0];
      setTitre(valeursInitiales?.titre || '');
      setType(valeursInitiales?.type || 'Entraînement');
      setDate(initDate);
      setHeureDebut('10:00');
      setDureeMinutes(valeursInitiales?.dureeMinutes ?? 75);
      setRpePrevu(valeursInitiales?.rpePrevu ?? 7);
      setEquipeId(equipes[0]?.id || '');
      setQuestionnaireId(questionnaires[0]?.id || '');
      // Déterminer la phase de saison en fonction de la date choisie
      const phaseTrouvee = trouverPhaseSaisonPourDate(initDate, phasesSaison);
      setPhaseSaison(phaseTrouvee?.nom || 'Préparation Spécifique (SPP)');
      setDescription(valeursInitiales?.description || '');
      setStatut('Planifiée');
      setRepetitionsSemaines(0);
    }
  }, [seanceEnEdition, ouvert, dateParDefaut, valeursInitiales, equipes, questionnaires, phasesSaison]);

  // Si l'utilisateur change la date, mettre à jour la phase de saison suggérée si non forcée
  const handleChangerDate = (nouvelleDate: string) => {
    setDate(nouvelleDate);
    const phaseTrouvee = trouverPhaseSaisonPourDate(nouvelleDate, phasesSaison);
    if (phaseTrouvee) {
      setPhaseSaison(phaseTrouvee.nom);
    }
  };

  if (!ouvert) return null;

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    surSauvegarder(
      {
        titre: titre.trim(),
        type,
        date,
        heureDebut: heureDebut || undefined,
        dureeMinutes: Number(dureeMinutes) || 60,
        rpePrevu: Number(rpePrevu) || undefined,
        equipeId: equipeId || null,
        questionnaireId: questionnaireId || undefined,
        phaseSaison: phaseSaison.trim() || undefined,
        description: description.trim() || undefined,
        statut,
      },
      repetitionsSemaines > 0 ? repetitionsSemaines : undefined
    );
    surFermer();
  };

  const chargePrevue = Math.round((Number(rpePrevu) || 0) * (Number(dureeMinutes) || 0));

  const getNiveauCharge = (ua: number) => {
    if (ua < 300) return { libelle: 'Légère / Récupération', couleur: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    if (ua < 600) return { libelle: 'Modérée / Optimale', couleur: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (ua < 850) return { libelle: 'Intense / Développement', couleur: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { libelle: 'Maximale / Choc', couleur: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const niveau = getNiveauCharge(chargePrevue);

  const appliquerDateRapide = (decalageJours: number) => {
    const d = new Date();
    d.setDate(d.getDate() + decalageJours);
    const dateStr = d.toISOString().split('T')[0];
    handleChangerDate(dateStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {seanceEnEdition ? 'Modifier la séance planifiée' : 'Planifier une séance d’entraînement'}
              </h2>
              <p className="text-xs text-neutral-400">
                Choix des dates, calcul sRPE (Foster) et positionnement dans la saison
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
        <form onSubmit={handleSoumettre} className="overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Nom / Thème de la séance *
            </label>
            <input
              type="text"
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex : Vitesse & Appuis courts, Musculation Puissance..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Type de séance</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Entraînement">Entraînement collectif</option>
                <option value="Musculation">Musculation / Force</option>
                <option value="Cardio / VMA">Cardio / VMA / Intervalles</option>
                <option value="Technique / Tactique">Technique / Tactique</option>
                <option value="Match / Compétition">Match / Compétition</option>
                <option value="Récupération">Récupération / Mobilité</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Statut</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as any)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Planifiée">Planifiée (à venir sur le planning)</option>
                <option value="En cours">En cours de déroulement</option>
                <option value="Terminée">Terminée (ouverte au débriefing)</option>
              </select>
            </div>
          </div>

          {/* Date de la séance et raccourcis rapides */}
          <div className="space-y-1.5 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Date de la séance sur le planning *</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => appliquerDateRapide(0)}
                  className="rounded px-2 py-0.5 text-[10px] font-medium bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                >
                  Aujourd’hui
                </button>
                <button
                  type="button"
                  onClick={() => appliquerDateRapide(1)}
                  className="rounded px-2 py-0.5 text-[10px] font-medium bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                >
                  Demain
                </button>
                <button
                  type="button"
                  onClick={() => appliquerDateRapide(7)}
                  className="rounded px-2 py-0.5 text-[10px] font-medium bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                >
                  +7j
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleChangerDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <input
                  type="time"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Phase de la saison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Phase de la saison (Macrocycle)
              </label>
              <select
                value={phaseSaison}
                onChange={(e) => setPhaseSaison(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
              >
                {phasesSaison.map((p) => (
                  <option key={p.id} value={p.nom}>
                    {p.nom}
                  </option>
                ))}
                <option value="Autre phase personnalisée">Autre phase personnalisée</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Équipe concernée</label>
              <select
                value={equipeId}
                onChange={(e) => setEquipeId(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Tous les sportifs (Tout le club)</option>
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Paramètres de charge sRPE (Borg CR10 x Temps) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-emerald-400" />
                <span>Charge d'Entraînement sRPE (Méthode de Foster)</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                Charge (UA) = RPE (1-10) × Temps (min)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Durée globale de la séance (minutes) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={300}
                    required
                    value={dureeMinutes}
                    onChange={(e) => setDureeMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 pl-3 pr-12 py-2 text-xs text-white focus:outline-none font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400">min</span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Séance dans son ensemble (non temps effectif), notée par le coach.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  RPE cible coach (1 à 10) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.5}
                    required
                    value={rpePrevu}
                    onChange={(e) => setRpePrevu(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 pl-3 pr-14 py-2 text-xs text-white focus:outline-none font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400">/ 10</span>
                </div>
              </div>
            </div>

            {/* Résultat visuel du calcul sRPE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-neutral-900 p-3 border border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                  UA
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">Charge sRPE Cible Planifiée</div>
                  <div className="text-sm font-bold text-white">
                    {rpePrevu} RPE × {dureeMinutes} min = <span className="text-emerald-400">{chargePrevue} UA</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold text-center ${niveau.couleur}`}>
                {niveau.libelle}
              </div>
            </div>
          </div>

          {/* Répétition sur plusieurs semaines (Option de planification de microcycles) */}
          {!seanceEnEdition && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-sky-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Répéter sur le planning</div>
                  <div className="text-[10px] text-neutral-400">
                    Dupliquer ce même créneau hebdomadaire sur les semaines suivantes
                  </div>
                </div>
              </div>

              <select
                value={repetitionsSemaines}
                onChange={(e) => setRepetitionsSemaines(Number(e.target.value))}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value={0}>Ne pas répéter (séance unique)</option>
                <option value={1}>+ 1 semaine (2 séances)</option>
                <option value={2}>+ 2 semaines (3 séances)</option>
                <option value={3}>+ 3 semaines (mésocycle de 4 séances)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Description / Consignes ou thèmes travaillés
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Focus sur les accélérations, intensité haute dès le premier bloc..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
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
              className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
            >
              {seanceEnEdition
                ? 'Mettre à jour la séance'
                : repetitionsSemaines > 0
                ? `Planifier ${repetitionsSemaines + 1} séances`
                : 'Enregistrer sur le planning'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
