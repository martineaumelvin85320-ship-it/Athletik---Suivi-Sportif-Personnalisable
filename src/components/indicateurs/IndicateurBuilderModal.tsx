import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Eye,
  CheckCircle2,
  Award,
  Sparkles,
  BookOpen,
  Check,
} from 'lucide-react';
import {
  Indicateur,
  TypeIndicateur,
  CategorieIndicateur,
  PalierEchelle,
  EchellePersonnalisee,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { EchellesLibraryModal } from '../echelles/EchellesLibraryModal';
import { EchelleEditorModal } from '../echelles/EchelleEditorModal';

interface IndicateurBuilderModalProps {
  ouvert: boolean;
  surFermer: () => void;
  surSauvegarder: (ind: Omit<Indicateur, 'id'>) => void;
  indicateurEnEdition?: Indicateur | null;
}

export const IndicateurBuilderModal: React.FC<IndicateurBuilderModalProps> = ({
  ouvert,
  surFermer,
  surSauvegarder,
  indicateurEnEdition,
}) => {
  const { echelles, ajouterEchelle } = useApp();

  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState<CategorieIndicateur>('Bien-être');
  const [type, setType] = useState<TypeIndicateur>('echelle_1_10');

  // Options échelles personnalisées & Borg
  const [echelleId, setEchelleId] = useState<string | undefined>(undefined);
  const [paliersEchelle, setPaliersEchelle] = useState<PalierEchelle[] | undefined>(undefined);
  const [modalLibraryOuvert, setModalLibraryOuvert] = useState(false);
  const [modalNouvelleEchelleOuvert, setModalNouvelleEchelleOuvert] = useState(false);

  // Options échelles standards
  const [echelleMin, setEchelleMin] = useState<number>(1);
  const [echelleMax, setEchelleMax] = useState<number>(10);
  const [echellePas, setEchellePas] = useState<number>(1);
  const [libelleMin, setLibelleMin] = useState('');
  const [libelleMax, setLibelleMax] = useState('');

  // Options numérique
  const [unite, setUnite] = useState('');

  // Options booléen
  const [libelleVrai, setLibelleVrai] = useState('Oui');
  const [libelleFaux, setLibelleFaux] = useState('Non');

  // Options choix
  const [optionsChoix, setOptionsChoix] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);
  const [nouvelleOption, setNouvelleOption] = useState('');

  // Polarité & seuils
  const [valeurHautePositive, setValeurHautePositive] = useState(false);
  const [alerteActive, setAlerteActive] = useState(false);
  const [alerteOperateur, setAlerteOperateur] = useState<'>' | '<' | '>=' | '<=' | '=='>('>=');
  const [alerteValeur, setAlerteValeur] = useState<string>('8');
  const [alerteNiveau, setAlerteNiveau] = useState<'attention' | 'critique'>('attention');
  const [alerteMessage, setAlerteMessage] = useState('');

  // Valeur de test pour la prévisualisation en direct
  const [valeurTest, setValeurTest] = useState<any>(null);

  useEffect(() => {
    if (indicateurEnEdition) {
      setNom(indicateurEnEdition.nom);
      setCode(indicateurEnEdition.code);
      setDescription(indicateurEnEdition.description);
      setCategorie(indicateurEnEdition.categorie);
      setType(indicateurEnEdition.type);
      setEchelleMin(indicateurEnEdition.echelleMin ?? 1);
      setEchelleMax(indicateurEnEdition.echelleMax ?? 10);
      setEchellePas(indicateurEnEdition.echellePas ?? 1);
      setLibelleMin(indicateurEnEdition.libelleMin || '');
      setLibelleMax(indicateurEnEdition.libelleMax || '');
      setUnite(indicateurEnEdition.unite || '');
      setLibelleVrai(indicateurEnEdition.libelleVrai || 'Oui');
      setLibelleFaux(indicateurEnEdition.libelleFaux || 'Non');
      setOptionsChoix(indicateurEnEdition.optionsChoix || ['Option 1', 'Option 2']);
      setValeurHautePositive(indicateurEnEdition.valeurHautePositive);

      if (indicateurEnEdition.seuilAlerte) {
        setAlerteActive(indicateurEnEdition.seuilAlerte.actif);
        setAlerteOperateur(indicateurEnEdition.seuilAlerte.operateur);
        setAlerteValeur(String(indicateurEnEdition.seuilAlerte.valeur));
        setAlerteNiveau(indicateurEnEdition.seuilAlerte.niveau);
        setAlerteMessage(indicateurEnEdition.seuilAlerte.message);
      } else {
        setAlerteActive(false);
      }
      setEchelleId(indicateurEnEdition.echelleId);
      setPaliersEchelle(indicateurEnEdition.paliersEchelle);
    } else {
      // Réinitialisation par défaut
      setNom('');
      setCode('');
      setDescription('');
      setCategorie('Bien-être');
      setType('echelle_1_10');
      setEchelleId(undefined);
      setPaliersEchelle(undefined);
      setEchelleMin(1);
      setEchelleMax(10);
      setEchellePas(1);
      setLibelleMin('Faible / Repos');
      setLibelleMax('Élevé / Maximal');
      setUnite('');
      setLibelleVrai('Oui');
      setLibelleFaux('Non');
      setOptionsChoix(['Option 1', 'Option 2', 'Option 3']);
      setValeurHautePositive(false);
      setAlerteActive(false);
      setAlerteOperateur('>=');
      setAlerteValeur('8');
      setAlerteNiveau('attention');
      setAlerteMessage('');
      setValeurTest(5);
    }
  }, [indicateurEnEdition, ouvert]);

  const appliquerEchelle = (ech: EchellePersonnalisee) => {
    setType('echelle_personnalisee');
    setEchelleId(ech.id);
    setEchelleMin(ech.min);
    setEchelleMax(ech.max);
    setEchellePas(ech.pas || 1);
    setLibelleMin(ech.libelleMin || '');
    setLibelleMax(ech.libelleMax || '');
    setPaliersEchelle(ech.paliers && ech.paliers.length > 0 ? ech.paliers : undefined);
    if (ech.paliers && ech.paliers.length > 0) {
      setValeurTest(ech.paliers[0].valeur);
    } else {
      setValeurTest(ech.min);
    }
  };

  // Synchroniser le code quand le nom change si nouveau
  const handleNomChange = (nouveauNom: string) => {
    setNom(nouveauNom);
    if (!indicateurEnEdition) {
      const codeGenere = nouveauNom
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .slice(0, 16);
      setCode(codeGenere);
    }
  };

  const handleAjouterOption = () => {
    if (nouvelleOption.trim()) {
      setOptionsChoix([...optionsChoix, nouvelleOption.trim()]);
      setNouvelleOption('');
    }
  };

  const handleSupprimerOption = (index: number) => {
    setOptionsChoix(optionsChoix.filter((_, i) => i !== index));
  };

  const handleSoumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    let min = echelleMin;
    let max = echelleMax;
    let pas = echellePas;

    if (type === 'echelle_1_5') {
      min = 1;
      max = 5;
      pas = 1;
    } else if (type === 'echelle_1_10') {
      min = 1;
      max = 10;
      pas = 1;
    } else if (type === 'echelle_0_100') {
      min = 0;
      max = 100;
      pas = 5;
    }

    const donneesIndicateur: Omit<Indicateur, 'id'> = {
      nom: nom.trim(),
      code: code.trim() || nom.trim().toUpperCase().slice(0, 12),
      description: description.trim(),
      categorie,
      type,
      echelleId: type === 'echelle_personnalisee' ? echelleId : undefined,
      paliersEchelle: type === 'echelle_personnalisee' ? paliersEchelle : undefined,
      echelleMin: min,
      echelleMax: max,
      echellePas: pas,
      libelleMin: libelleMin.trim() || undefined,
      libelleMax: libelleMax.trim() || undefined,
      unite: unite.trim() || undefined,
      libelleVrai: libelleVrai.trim() || 'Oui',
      libelleFaux: libelleFaux.trim() || 'Non',
      optionsChoix: type === 'choix_unique' || type === 'choix_multiple' ? optionsChoix : undefined,
      valeurHautePositive,
      seuilAlerte: alerteActive
        ? {
            actif: true,
            operateur: alerteOperateur,
            valeur:
              type === 'booleen'
                ? alerteValeur === 'true'
                : isNaN(Number(alerteValeur))
                ? alerteValeur
                : Number(alerteValeur),
            niveau: alerteNiveau,
            message: alerteMessage.trim() || `Alerte détectée sur ${nom}`,
          }
        : undefined,
    };

    surSauvegarder(donneesIndicateur);
    surFermer();
  };

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {indicateurEnEdition ? 'Modifier l’indicateur' : 'Créer un indicateur sur mesure'}
              </h2>
              <p className="text-xs text-neutral-400">
                Définissez précisément le type, l’échelle, la polarité et les seuils d’alerte
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

        {/* Corps avec formulaire + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
          {/* Colonne Paramétrage (7 cols) */}
          <form id="form-indicateur" onSubmit={handleSoumettre} className="lg:col-span-7 p-6 space-y-6">
            {/* 1. Identification */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                1. Identification générale
              </h3>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nom de l’indicateur *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Douleur aux ischios, Sommeil, RPE Foster..."
                  value={nom}
                  onChange={(e) => handleNomChange(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Code interne (identifiant)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="CODE_METRIQUE"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value as CategorieIndicateur)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Bien-être">Bien-être</option>
                    <option value="Charge">Charge d’entraînement</option>
                    <option value="Récupération">Récupération</option>
                    <option value="Physiologique">Physiologique</option>
                    <option value="Performance">Performance</option>
                    <option value="Douleur">Douleur / Médical</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Description / Consigne pour le sportif
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex : Indiquez votre ressenti au réveil avant toute ingestion de café..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Type et Échelle */}
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  2. Type d’échelle & Saisie
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModalLibraryOuvert(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-300 transition-colors"
                  >
                    <BookOpen className="h-3 w-3 text-emerald-400" />
                    <span>Bibliothèque d’échelles</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalNouvelleEchelleOuvert(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Créer une échelle</span>
                  </button>
                </div>
              </div>

              {/* SÉLECTEUR RAPIDE D'ÉCHELLES : BORG & SUR MESURE */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Échelles Référencées (Borg & Personnalisées)</span>
                  </span>
                  {echelleId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEchelleId(undefined);
                        setPaliersEchelle(undefined);
                        setType('echelle_1_10');
                      }}
                      className="text-[10px] text-neutral-400 hover:text-white"
                    >
                      Détacher l’échelle
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Borg CR-10 Bouton rapide */}
                  {echelles.filter((e) => e.isBorg).map((borgEch) => {
                    const estSelectionnee = echelleId === borgEch.id;
                    return (
                      <button
                        key={borgEch.id}
                        type="button"
                        onClick={() => appliquerEchelle(borgEch)}
                        className={`p-2 rounded-xl text-left border transition-all flex items-start justify-between gap-2 ${
                          estSelectionnee
                            ? 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/40 text-white shadow-sm'
                            : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="text-[11px] font-bold line-clamp-1">{borgEch.nom}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                            {borgEch.description}
                          </p>
                        </div>
                        {estSelectionnee && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Échelles du Coach / Sur mesure */}
                {echelles.filter((e) => !e.isBorg).length > 0 && (
                  <div className="pt-1">
                    <label className="block text-[10px] text-neutral-400 mb-1">
                      Ou appliquer une de vos échelles sur mesure :
                    </label>
                    <select
                      value={echelleId || ''}
                      onChange={(e) => {
                        const trouvee = echelles.find((ech) => ech.id === e.target.value);
                        if (trouvee) appliquerEchelle(trouvee);
                      }}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="">-- Choisir une échelle personnalisée ou de référence --</option>
                      {echelles.filter((e) => !e.isBorg).map((ech) => (
                        <option key={ech.id} value={ech.id}>
                          {ech.nom} ({ech.min} à {ech.max}) {ech.isPreset ? '[Standard]' : '[Coach]'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Ou choisissez un format de saisie générique
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'echelle_1_5', label: 'Échelle 1 à 5', desc: 'Classique 5 niveaux' },
                    { id: 'echelle_1_10', label: 'Échelle 1 à 10', desc: 'Standard Wellness / RPE' },
                    { id: 'echelle_0_100', label: 'Échelle 0 à 100', desc: 'Pourcentage / Jauge' },
                    { id: 'echelle_personnalisee', label: 'Échelle libre', desc: 'Min / Max / Pas sur mesure' },
                    { id: 'booleen', label: 'Oui / Non', desc: 'Question binaire' },
                    { id: 'numerique', label: 'Valeur numérique', desc: 'Nombre avec unité (kg, bpm...)' },
                    { id: 'choix_unique', label: 'Choix unique', desc: 'Liste déroulante / boutons' },
                    { id: 'choix_multiple', label: 'Choix multiple', desc: 'Plusieurs options possibles' },
                    { id: 'texte', label: 'Texte libre', desc: 'Zone de texte ouverte' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as TypeIndicateur)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        type === item.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'border-neutral-800 bg-neutral-800/40 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="font-semibold text-xs">{item.label}</div>
                      <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Réglages spécifiques selon type */}
              {type === 'echelle_personnalisee' && (
                <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Borne Min</label>
                      <input
                        type="number"
                        value={echelleMin}
                        onChange={(e) => setEchelleMin(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Borne Max</label>
                      <input
                        type="number"
                        value={echelleMax}
                        onChange={(e) => setEchelleMax(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Pas (Incrément)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={echellePas}
                        onChange={(e) => setEchellePas(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Libellés des bornes (Min / Max) pour toutes les échelles */}
              {type.startsWith('echelle_') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Libellé valeur minimale (ex: Aucun, Très facile...)
                    </label>
                    <input
                      type="text"
                      value={libelleMin}
                      onChange={(e) => setLibelleMin(e.target.value)}
                      placeholder="Ex : Parfaitement reposé"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Libellé valeur maximale (ex: Extrême, Épuisement...)
                    </label>
                    <input
                      type="text"
                      value={libelleMax}
                      onChange={(e) => setLibelleMax(e.target.value)}
                      placeholder="Ex : Épuisement complet"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Options Numérique */}
              {type === 'numerique' && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Unité de mesure (ex: kg, bpm, cm, min, km/h, mmol/L...)
                  </label>
                  <input
                    type="text"
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    placeholder="Ex : bpm"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs text-white"
                  />
                </div>
              )}

              {/* Options Booléen */}
              {type === 'booleen' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Libellé VRAI</label>
                    <input
                      type="text"
                      value={libelleVrai}
                      onChange={(e) => setLibelleVrai(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Libellé FAUX</label>
                    <input
                      type="text"
                      value={libelleFaux}
                      onChange={(e) => setLibelleFaux(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Options Choix */}
              {(type === 'choix_unique' || type === 'choix_multiple') && (
                <div className="space-y-2">
                  <label className="block text-[11px] text-neutral-400">
                    Propositions de réponses
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {optionsChoix.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-neutral-800/80 p-1.5 rounded-lg border border-neutral-700">
                        <span className="flex-1 text-xs text-white pl-2">{opt}</span>
                        <button
                          type="button"
                          onClick={() => handleSupprimerOption(idx)}
                          className="p-1 text-neutral-400 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter une réponse possible..."
                      value={nouvelleOption}
                      onChange={(e) => setNouvelleOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAjouterOption();
                        }
                      }}
                      className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAjouterOption}
                      className="flex items-center gap-1 rounded-xl bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sens & Seuils d'Alerte */}
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                3. Polarité & Détection d’Alerte
              </h3>

              <div className="rounded-xl border border-neutral-800 bg-neutral-800/40 p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={valeurHautePositive}
                    onChange={(e) => setValeurHautePositive(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Une valeur élevée est positive / favorable
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Cocher pour la forme, le sommeil réparateur ou l’énergie. Décocher si une valeur haute
                      signifie un problème (fatigue, courbatures, stress, douleur, RPE excessif).
                    </p>
                  </div>
                </label>
              </div>

              {/* Seuil d'alerte automatique */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Activer une alerte automatique coach
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alerteActive}
                    onChange={(e) => setAlerteActive(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {alerteActive && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">Condition</label>
                        <select
                          value={alerteOperateur}
                          onChange={(e) => setAlerteOperateur(e.target.value as any)}
                          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value=">=">&gt;= Supérieur ou égal</option>
                          <option value=">">&gt; Strictement supérieur</option>
                          <option value="<=">&lt;= Inférieur ou égal</option>
                          <option value="<">&lt; Strictement inférieur</option>
                          <option value="==">== Égal à</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">Valeur seuil</label>
                        {type === 'booleen' ? (
                          <select
                            value={alerteValeur}
                            onChange={(e) => setAlerteValeur(e.target.value)}
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="true">{libelleVrai || 'Vrai'}</option>
                            <option value="false">{libelleFaux || 'Faux'}</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={alerteValeur}
                            onChange={(e) => setAlerteValeur(e.target.value)}
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">Niveau</label>
                        <select
                          value={alerteNiveau}
                          onChange={(e) => setAlerteNiveau(e.target.value as any)}
                          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="attention">Attention (Orange)</option>
                          <option value="critique">Critique (Rouge)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">
                        Message d’alerte affiché au coach
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Fatigue critique, adaptation de séance requise..."
                        value={alerteMessage}
                        onChange={(e) => setAlerteMessage(e.target.value)}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-white placeholder-neutral-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Colonne Aperçu en Direct pour le Sportif (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-neutral-950/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                <Eye className="h-4 w-4 text-emerald-400" />
                <span>Aperçu interactif (Vue Sportif)</span>
              </div>

              {/* Rendu carte de test */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-4 shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-400 mb-1">
                      {categorie}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {nom || 'Nom de votre indicateur'}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {description || 'Description ou consigne pour l’athlète'}
                    </p>
                  </div>
                  {valeurHautePositive ? (
                    <span className="text-[10px] text-emerald-400 font-medium">Positif haut</span>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-medium">Alerte haut</span>
                  )}
                </div>

                {/* Composant de saisie interactif simulé */}
                <div className="pt-2">
                  {/* Si l'indicateur a des paliers personnalisés ou de Borg */}
                  {type === 'echelle_personnalisee' && paliersEchelle && paliersEchelle.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {paliersEchelle.map((pal) => {
                          const actif = valeurTest === pal.valeur;
                          return (
                            <button
                              key={pal.valeur}
                              type="button"
                              onClick={() => setValeurTest(pal.valeur)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                actif
                                  ? 'ring-2 ring-white/40 scale-105 shadow-md text-white'
                                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                              }`}
                              style={
                                actif
                                  ? {
                                      backgroundColor: `${pal.couleur || '#10b981'}30`,
                                      borderColor: pal.couleur || '#10b981',
                                    }
                                  : undefined
                              }
                            >
                              <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{ backgroundColor: pal.couleur || '#10b981' }}
                              />
                              <span>{pal.valeur}</span>
                              <span className="font-normal text-[10px] opacity-90 truncate max-w-[80px]">
                                {pal.libelle}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Palier actuellement sélectionné */}
                      {(() => {
                        const palActuel =
                          paliersEchelle.find((p) => p.valeur === valeurTest) || paliersEchelle[0];
                        return (
                          palActuel && (
                            <div
                              className="p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2"
                              style={{
                                backgroundColor: `${palActuel.couleur || '#10b981'}15`,
                                borderColor: `${palActuel.couleur || '#10b981'}35`,
                              }}
                            >
                              <div>
                                <span
                                  className="font-bold block"
                                  style={{ color: palActuel.couleur || '#10b981' }}
                                >
                                  {palActuel.valeur} — {palActuel.libelle}
                                </span>
                                {palActuel.description && (
                                  <p className="text-[10px] text-neutral-300 mt-0.5">
                                    {palActuel.description}
                                  </p>
                                )}
                              </div>
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            </div>
                          )
                        );
                      })()}
                    </div>
                  ) : type.startsWith('echelle_') ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono text-emerald-400">
                        <span>Sélection :</span>
                        <span className="text-base font-bold bg-neutral-800 px-2.5 py-0.5 rounded-lg">
                          {valeurTest ?? (type === 'echelle_1_5' ? 3 : type === 'echelle_1_10' ? 5 : 50)}
                          {type === 'echelle_0_100' ? '%' : ''}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={type === 'echelle_1_5' ? 1 : type === 'echelle_1_10' ? 1 : type === 'echelle_0_100' ? 0 : echelleMin}
                        max={type === 'echelle_1_5' ? 5 : type === 'echelle_1_10' ? 10 : type === 'echelle_0_100' ? 100 : echelleMax}
                        step={type === 'echelle_personnalisee' ? echellePas : 1}
                        value={valeurTest ?? (type === 'echelle_1_5' ? 3 : type === 'echelle_1_10' ? 5 : 50)}
                        onChange={(e) => setValeurTest(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />

                      {(libelleMin || libelleMax) && (
                        <div className="flex justify-between text-[10px] text-neutral-500">
                          <span>{libelleMin || 'Min'}</span>
                          <span>{libelleMax || 'Max'}</span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {type === 'booleen' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setValeurTest(true)}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          valeurTest === true
                            ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {libelleVrai}
                      </button>
                      <button
                        type="button"
                        onClick={() => setValeurTest(false)}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          valeurTest === false
                            ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {libelleFaux}
                      </button>
                    </div>
                  )}

                  {type === 'numerique' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={valeurTest || ''}
                        onChange={(e) => setValeurTest(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:outline-none"
                      />
                      <span className="text-xs font-medium text-neutral-400 shrink-0">
                        {unite || 'unité'}
                      </span>
                    </div>
                  )}

                  {type === 'choix_unique' && (
                    <div className="space-y-1.5">
                      {optionsChoix.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setValeurTest(opt)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                            valeurTest === opt
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                              : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {type === 'choix_multiple' && (
                    <div className="space-y-1.5">
                      {optionsChoix.map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-xl bg-neutral-800/40 border border-neutral-700/60 text-xs text-neutral-300 cursor-pointer"
                        >
                          <input type="checkbox" className="accent-emerald-500" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {type === 'texte' && (
                    <textarea
                      rows={2}
                      placeholder="Le sportif saisira ses sensations ici..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/60 p-2.5 text-xs text-neutral-300"
                    />
                  )}
                </div>

                {/* Simulation de déclenchement d'alerte */}
                {alerteActive && (
                  <div className="rounded-xl bg-neutral-800/40 border border-neutral-700/60 p-2.5 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-300 mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Règle d’alerte configurée :</span>
                    </div>
                    <span>
                      Déclenchée si la réponse est {alerteOperateur} {alerteValeur} ({alerteNiveau})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pied d'aperçu & validation */}
            <div className="pt-6 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={surFermer}
                className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="form-indicateur"
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 shadow-md transition-colors"
              >
                {indicateurEnEdition ? 'Mettre à jour l’indicateur' : 'Créer l’indicateur'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bibliothèque d'échelles & Borg modal */}
      <EchellesLibraryModal
        ouvert={modalLibraryOuvert}
        surFermer={() => setModalLibraryOuvert(false)}
        surSelectionner={(ech) => {
          appliquerEchelle(ech);
          setModalLibraryOuvert(false);
        }}
      />

      {/* Création d'échelle sur mesure en direct */}
      <EchelleEditorModal
        ouvert={modalNouvelleEchelleOuvert}
        surFermer={() => setModalNouvelleEchelleOuvert(false)}
        surSauvegarder={(donnees) => {
          const nouvelle = ajouterEchelle(donnees);
          appliquerEchelle(nouvelle);
        }}
      />
    </div>
  );
};
