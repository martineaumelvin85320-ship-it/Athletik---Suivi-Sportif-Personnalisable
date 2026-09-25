import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Eye,
  Trash2,
  X,
  Clock,
  User,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ReponseQuestionnaire, ActionHistorique } from '../../types';
import { formaterValeurIndicateur } from '../../utils/evaluation';
import { InfoTooltip } from '../ui/InfoTooltip';

export const HistoriqueView: React.FC = () => {
  const {
    historiqueActions,
    restaurerAction,
    supprimerEntreeHistorique,
    reponses,
    sportifs,
    questionnaires,
    indicateurs,
    supprimerReponse,
    roleActuel,
  } = useApp();

  // Onglet sélectionné : 'audit' (journal des manipulations) ou 'reponses' (check-ins)
  const [ongletPrincipal, setOngletPrincipal] = useState<'audit' | 'reponses'>('audit');

  // Filtres pour le journal d'audit
  const [rechercheAudit, setRechercheAudit] = useState('');
  const [typeFiltreAudit, setTypeFiltreAudit] = useState<string>('tous');
  const [actionDetailInspecteur, setActionDetailInspecteur] = useState<ActionHistorique | null>(null);

  // Filtres pour les réponses aux questionnaires
  const [recherche, setRecherche] = useState('');
  const [sportifFiltre, setSportifFiltre] = useState<string>('tous');
  const [questionnaireFiltre, setQuestionnaireFiltre] = useState<string>('tous');
  const [alerteUniquement, setAlerteUniquement] = useState(false);
  const [reponseDetail, setReponseDetail] = useState<ReponseQuestionnaire | null>(null);

  const spMap = new Map(sportifs.map((s) => [s.id, s]));
  const questMap = new Map(questionnaires.map((q) => [q.id, q]));
  const indMap = new Map(indicateurs.map((i) => [i.id, i]));

  // Filtrage du Journal d'Audit
  const actionsFiltrees = historiqueActions.filter((act) => {
    const matchType = typeFiltreAudit === 'tous' || act.type === typeFiltreAudit;
    const matchRecherche =
      act.titre.toLowerCase().includes(rechercheAudit.toLowerCase()) ||
      act.description.toLowerCase().includes(rechercheAudit.toLowerCase()) ||
      act.auteurNom.toLowerCase().includes(rechercheAudit.toLowerCase());
    return matchType && matchRecherche;
  });

  // Filtrage des Réponses aux Questionnaires
  const reponsesFiltrees = reponses
    .filter((r) => {
      const sp = spMap.get(r.sportifId);
      const nomSp = sp ? `${sp.prenom} ${sp.nom}`.toLowerCase() : '';
      const matchRecherche =
        nomSp.includes(recherche.toLowerCase()) ||
        r.dateJour.includes(recherche) ||
        (r.commentaireGeneral || '').toLowerCase().includes(recherche.toLowerCase());

      const matchSportif = sportifFiltre === 'tous' || r.sportifId === sportifFiltre;
      const matchQuest = questionnaireFiltre === 'tous' || r.questionnaireId === questionnaireFiltre;
      const matchAlerte = !alerteUniquement || (r.alertes && r.alertes.length > 0);

      return matchRecherche && matchSportif && matchQuest && matchAlerte;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSupprimerReponse = (id: string) => {
    if (window.confirm('Voulez-vous supprimer cette réponse de l’historique ?')) {
      supprimerReponse(id);
      if (reponseDetail?.id === id) {
        setReponseDetail(null);
      }
    }
  };

  const formaterDateHeure = (dateIso: string) => {
    try {
      const d = new Date(dateIso);
      return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateIso;
    }
  };

  return (
    <div className="space-y-6">
      {/* EN-TÊTE PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <History className="h-6 w-6 text-emerald-400" />
              <span>Historique & Journal d'Audit</span>
            </h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
              Système Undo actif
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Traçabilité intégrale de toutes les manipulations, comparaison avant/après et restauration en 1 clic.
          </p>
        </div>

        {/* SELECTEUR D'ONGLETS PRINCIPAUX */}
        <div className="flex items-center rounded-2xl bg-neutral-900 border border-neutral-800 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setOngletPrincipal('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              ongletPrincipal === 'audit'
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Manipulations & Restauration ({historiqueActions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setOngletPrincipal('reponses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              ongletPrincipal === 'reponses'
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Check-ins & Questionnaires ({reponses.length})</span>
          </button>
        </div>
      </div>

      {/* VUE 1 : JOURNAL D'AUDIT DES MANIPULATIONS (AVEC UNDO) */}
      {ongletPrincipal === 'audit' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* BARRE DE RECHERCHE ET FILTRES D'AUDIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher par action, auteur, titre..."
                value={rechercheAudit}
                onChange={(e) => setRechercheAudit(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={typeFiltreAudit}
                onChange={(e) => setTypeFiltreAudit(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="tous">Tous les types de modifications</option>
                <option value="suppression_equipe">Suppression d'équipe</option>
                <option value="creation_equipe">Création d'équipe</option>
                <option value="suppression_clubhouse">Suppression de Clubhouse</option>
                <option value="modification_clubhouse">Modification de Clubhouse</option>
                <option value="suppression_sportif">Suppression de sportif</option>
                <option value="creation_sportif">Création de sportif</option>
                <option value="suppression_seance">Suppression de séance</option>
                <option value="creation_seance">Création de séance</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/50 p-2.5 rounded-2xl border border-neutral-800/80">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Cliquez sur <strong>Restaurer</strong> pour rétablir une équipe ou des données supprimées.
              </span>
            </div>
          </div>

          {/* LISTE DES ACTIONS D'HISTORIQUE */}
          {actionsFiltrees.length === 0 ? (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-12 text-center space-y-3">
              <History className="h-10 w-10 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Aucune action enregistrée</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Chaque création, modification ou suppression d'équipe, de joueur ou de Clubhouse apparaîtra automatiquement ici avec son état avant et après.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {actionsFiltrees.map((action) => {
                const estSuppression = action.type.startsWith('suppression');
                const estCreation = action.type.startsWith('creation');

                return (
                  <div
                    key={action.id}
                    className={`rounded-3xl border p-4 sm:p-5 transition-all backdrop-blur-md ${
                      action.estRestaure
                        ? 'border-neutral-800/70 bg-neutral-950/40 opacity-70'
                        : estSuppression
                        ? 'border-rose-500/30 bg-neutral-900/80 hover:border-rose-500/50'
                        : estCreation
                        ? 'border-emerald-500/25 bg-neutral-900/80 hover:border-emerald-500/40'
                        : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* INFORMATIONS PRINCIPALES */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5 ${
                            estSuppression
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                              : estCreation
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                          }`}
                        >
                          {estSuppression ? (
                            <Trash2 className="h-5 w-5" />
                          ) : estCreation ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Activity className="h-5 w-5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-white tracking-tight">
                              {action.titre}
                            </h4>

                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                estSuppression
                                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                  : estCreation
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                  : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                              }`}
                            >
                              {action.type.replace('_', ' ')}
                            </span>

                            {action.estRestaure && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                Restauré / Annulé
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {action.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-400 pt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-neutral-500" />
                              <span>Auteur : <strong className="text-neutral-200">{action.auteurNom}</strong> ({action.auteurRole})</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-neutral-500" />
                              <span>{formaterDateHeure(action.date)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS : RESTAURER (UNDO) ET INSPECTEUR */}
                      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                        {/* Bouton Inspecter les données avant/après */}
                        <button
                          type="button"
                          onClick={() =>
                            setActionDetailInspecteur(
                              actionDetailInspecteur?.id === action.id ? null : action
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Données</span>
                          {actionDetailInspecteur?.id === action.id ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Bouton Restaurer (Annuler l'action) */}
                        {action.peutRestaurer && !action.estRestaure && (
                          <button
                            type="button"
                            onClick={() => restaurerAction(action.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all shadow-md active:scale-98 cursor-pointer"
                            title="Annuler cette action et rétablir l'état antérieur"
                          >
                            <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Restaurer / Annuler</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DÉTAIL / INSPECTEUR COMPARATIF AVANT / APRÈS */}
                    {actionDetailInspecteur?.id === action.id && (
                      <div className="mt-4 pt-4 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in duration-150">
                        {/* État AVANT */}
                        <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                            Données avant la modification :
                          </span>
                          <pre className="text-[10px] text-neutral-300 overflow-x-auto p-2 rounded-xl bg-neutral-900/60 font-mono max-h-48">
                            {action.donneesAvant
                              ? JSON.stringify(action.donneesAvant, null, 2)
                              : 'Aucune donnée antérieure'}
                          </pre>
                        </div>

                        {/* État APRÈS */}
                        <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Données après la modification :
                          </span>
                          <pre className="text-[10px] text-neutral-300 overflow-x-auto p-2 rounded-xl bg-neutral-900/60 font-mono max-h-48">
                            {action.donneesApres
                              ? JSON.stringify(action.donneesApres, null, 2)
                              : 'Données supprimées ou réinitialisées'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VUE 2 : CHECK-INS & QUESTIONNAIRES RÉPONSES */}
      {ongletPrincipal === 'reponses' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher par athlète, mot-clé..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/80 pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={sportifFiltre}
                onChange={(e) => setSportifFiltre(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="tous">Tous les sportifs</option>
                {sportifs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.prenom} {s.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={questionnaireFiltre}
                onChange={(e) => setQuestionnaireFiltre(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="tous">Tous les questionnaires</option>
                {questionnaires.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.titre}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setAlerteUniquement(!alerteUniquement)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-colors border ${
                alerteUniquement
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Avec alertes uniquement</span>
            </button>
          </div>

          {reponsesFiltrees.length === 0 ? (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-12 text-center space-y-2">
              <FileText className="h-8 w-8 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Aucune réponse trouvée</h3>
              <p className="text-xs text-neutral-400">
                Les check-ins complétés par vos athlètes s'afficheront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reponsesFiltrees.map((rep) => {
                const sp = spMap.get(rep.sportifId);
                const quest = questMap.get(rep.questionnaireId);
                const nbAlertes = rep.alertes?.length || 0;

                return (
                  <div
                    key={rep.id}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 transition-all hover:border-neutral-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {sp?.initiales || 'SP'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {sp ? `${sp.prenom} ${sp.nom}` : 'Athlète'}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              • {quest?.titre || 'Questionnaire'}
                            </span>
                            {nbAlertes > 0 && (
                              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                                {nbAlertes} alerte{nbAlertes > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            {formaterDateHeure(rep.date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReponseDetail(rep)}
                          className="flex items-center gap-1 rounded-xl bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Détails</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSupprimerReponse(rep.id)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                          title="Supprimer cette réponse"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALE DE DÉTAIL D'UNE RÉPONSE QUESTIONNAIRE */}
      {reponseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Détail du Questionnaire</h3>
              <button
                type="button"
                onClick={() => setReponseDetail(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(reponseDetail.valeurs).map(([indId, val]) => {
                const ind = indMap.get(indId);
                return (
                  <div
                    key={indId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs"
                  >
                    <span className="text-neutral-400">{ind?.nom || indId}</span>
                    <span className="font-bold text-white font-mono">
                      {ind ? formaterValeurIndicateur(ind, val) : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>

            {reponseDetail.commentaireGeneral && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-neutral-500">
                  Commentaire du joueur :
                </span>
                <p className="text-neutral-300 italic">{reponseDetail.commentaireGeneral}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
