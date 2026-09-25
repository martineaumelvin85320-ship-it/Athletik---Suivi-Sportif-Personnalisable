import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  Plus,
  Clock,
  Calendar,
  Users,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { Questionnaire } from '../../types';
import { QuestionnaireBuilderModal } from './QuestionnaireBuilderModal';

interface QuestionnairesViewProps {
  onTesterQuestionnaire?: (questId: string) => void;
}

export const QuestionnairesView: React.FC<QuestionnairesViewProps> = ({
  onTesterQuestionnaire,
}) => {
  const {
    questionnaires,
    indicateurs,
    equipes,
    sportifs,
    ajouterQuestionnaire,
    modifierQuestionnaire,
    supprimerQuestionnaire,
    setRoleActuel,
  } = useApp();

  const [modalOuvert, setModalOuvert] = useState(false);
  const [questionnaireEnEdition, setQuestionnaireEnEdition] = useState<Questionnaire | null>(null);

  const indMap = new Map(indicateurs.map((i) => [i.id, i]));
  const equipeMap = new Map(equipes.map((e) => [e.id, e]));

  const handleOuvrirNouveau = () => {
    setQuestionnaireEnEdition(null);
    setModalOuvert(true);
  };

  const handleEditer = (q: Questionnaire) => {
    setQuestionnaireEnEdition(q);
    setModalOuvert(true);
  };

  const handleSupprimer = (id: string, titre: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le questionnaire "${titre}" ?`)) {
      supprimerQuestionnaire(id);
    }
  };

  const handleTester = (questId: string) => {
    setRoleActuel('sportif');
    if (onTesterQuestionnaire) {
      onTesterQuestionnaire(questId);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Gestion des Questionnaires
            </h1>
            <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-300">
              {questionnaires.length}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configurez les formulaires de check-in (wellness, charge sRPE, récupération) et assignez-les aux athlètes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOuvrirNouveau}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau questionnaire</span>
        </button>
      </div>

      {/* Liste des questionnaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionnaires.map((q) => {
          const nbIndicateurs = q.indicateurIds.length;
          return (
            <div
              key={q.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 hover:border-neutral-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        q.actif ? 'bg-emerald-400' : 'bg-neutral-600'
                      }`}
                    />
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {q.actif ? 'Actif pour les sportifs' : 'Désactivé'}
                    </span>
                  </div>
                  <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                    {q.frequence} • {q.momentJournee}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{q.titre}</h3>
                <p className="text-xs text-neutral-400 line-clamp-2">{q.description}</p>

                {/* Métadonnées */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  <div className="flex items-center gap-1 rounded-lg bg-neutral-800/80 px-2.5 py-1 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span>~{q.tempsEstimeMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-neutral-800/80 px-2.5 py-1 text-[11px]">
                    <ClipboardList className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{nbIndicateurs} indicateur{nbIndicateurs > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-neutral-800/80 px-2.5 py-1 text-[11px]">
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      {q.attributionType === 'tous'
                        ? 'Tous les sportifs'
                        : q.attributionType === 'equipe'
                        ? `${q.cibleEquipeIds.length} équipe(s)`
                        : `${q.cibleSportifIds.length} sportif(s)`}
                    </span>
                  </div>
                </div>

                {/* Liste aperçu des indicateurs */}
                <div className="mt-4 space-y-1 rounded-xl bg-neutral-950/60 p-3 border border-neutral-800/80">
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1.5">
                    Indicateurs intégrés :
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {q.indicateurIds.map((id) => {
                      const ind = indMap.get(id);
                      if (!ind) return null;
                      return (
                        <span
                          key={id}
                          className="rounded-lg bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300 border border-neutral-700/50"
                        >
                          {ind.nom}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTester(q.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-neutral-700 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-emerald-400" />
                  <span>Tester (Vue Sportif)</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditer(q)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSupprimer(q.id, q.titre)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-rose-400 transition-colors"
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

      <QuestionnaireBuilderModal
        ouvert={modalOuvert}
        surFermer={() => setModalOuvert(false)}
        surSauvegarder={(donnees) => {
          if (questionnaireEnEdition) {
            modifierQuestionnaire(questionnaireEnEdition.id, donnees);
          } else {
            ajouterQuestionnaire(donnees);
          }
        }}
        questionnaireEnEdition={questionnaireEnEdition}
        tousIndicateurs={indicateurs}
        equipes={equipes}
        sportifs={sportifs}
      />
    </div>
  );
};
