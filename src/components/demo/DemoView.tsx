import React, { useState } from 'react';
import {
  Compass,
  Activity,
  Shield,
  Users,
  HeartPulse,
  Flame,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  Sparkles,
  Zap,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  RotateCcw,
  Sliders,
  Calendar,
} from 'lucide-react';
import { InfoTooltip } from '../ui/InfoTooltip';

export const DemoView: React.FC<{ onNaviguer?: (onglet: string) => void }> = ({ onNaviguer }) => {
  const [sectionActive, setSectionActive] = useState<'apercu' | 'rpe' | 'acwr' | 'wellness' | 'clubhouse' | 'undo'>('apercu');

  // Mini-simulateur interactif RPE (purement en mémoire locale, sans créer de profil)
  const [simDuree, setSimDuree] = useState(75);
  const [simRpe, setSimRpe] = useState(7);
  const chargeSimulee = simDuree * simRpe;

  // Simulateur ACWR
  const [simAigue, setSimAigue] = useState(2450);
  const [simChronique, setSimChronique] = useState(2200);
  const ratioSimule = simChronique > 0 ? (simAigue / simChronique).toFixed(2) : '1.00';
  const ratioNum = parseFloat(ratioSimule);

  let zoneRatio = 'optimale';
  let zoneCouleur = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let zoneLibelle = 'Sweet Spot Optimal (0.8 - 1.3) : Progression & Protection';
  if (ratioNum < 0.8) {
    zoneRatio = 'faible';
    zoneCouleur = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    zoneLibelle = 'Sous-charge (< 0.8) : Risque de désentraînement';
  } else if (ratioNum > 1.5) {
    zoneRatio = 'critique';
    zoneCouleur = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    zoneLibelle = 'Zone Critique (> 1.5) : Risque élevé de blessure';
  } else if (ratioNum > 1.3) {
    zoneRatio = 'elevee';
    zoneCouleur = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    zoneLibelle = 'Charge Élevée (1.3 - 1.5) : Vigilance requise';
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* BANNIÈRE D'ACCUEIL DU GUIDE DÉMO */}
      <div className="relative rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CENTRE DE DÉCOUVERTE & GUIDE OFFICIEL</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Comment fonctionne <span className="text-emerald-400">ATHLETIK</span> ?
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
            Bienvenue dans le guide interactif. Cette section vous présente les principes scientifiques
            de quantification de charge, le fonctionnement des interfaces Entraîneur et Sportif,
            sans générer aucun profil ou équipe factice dans votre espace de travail.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Base de données propre & vierge</span>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Séparation stricte des rôles</span>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Système de restauration (Undo)</span>
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION RAPIDE ENTRE LES CHAPITRES DE DÉMO */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'apercu', label: 'Vue d’ensemble', icone: Compass },
          { id: 'rpe', label: 'Charge & sRPE', icone: Flame },
          { id: 'acwr', label: 'Ratios ACWR & MME', icone: TrendingUp },
          { id: 'wellness', label: 'Bilan Wellness', icone: HeartPulse },
          { id: 'clubhouse', label: 'Clubhouse & Équipes', icone: Shield },
          { id: 'undo', label: 'Historique & Restauration', icone: RotateCcw },
        ].map((tab) => {
          const Icone = tab.icone;
          const actif = sectionActive === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSectionActive(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all shrink-0 border ${
                actif
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Icone className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1 : VUE D'ENSEMBLE */}
      {sectionActive === 'apercu' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carte 1 : Rôle Entraîneur */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Rôle Entraîneur (Coach)</span>
                      <InfoTooltip
                        titre="Accès Staff Technique"
                        texte="L'entraîneur pilote son Clubhouse, crée ses équipes, planifie les séances et supervise les alertes de charge en temps réel."
                      />
                    </h3>
                    <p className="text-xs text-neutral-400">Centre de pilotage et d'analyse</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Staff
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                À sa première connexion, l'entraîneur configure son <strong>Clubhouse</strong> (organisation sportive,
                discipline, logo rond et couleur). Il peut ensuite :
              </p>

              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Créer, modifier et supprimer des équipes avec un code d'invitation unique (ex : ATH-742).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Programmer des séances d'entraînement et diffuser des questionnaires RPE.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Recevoir en direct les demandes d'adhésion d'athlètes et valider ou refuser les candidatures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Consulter l'historique complet et restaurer une suppression par erreur grâce à la fonction Undo.</span>
                </li>
              </ul>
            </div>

            {/* Carte 2 : Rôle Sportif */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Rôle Sportif (Athlète)</span>
                      <InfoTooltip
                        titre="Espace Athlète Protégé"
                        texte="L'athlète accède uniquement à son portail. Ses coéquipiers sont anonymisés dans le vestiaire pour préserver la confidentialité médicale."
                      />
                    </h3>
                    <p className="text-xs text-neutral-400">Portail individuel & vestiaire</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Athlète
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Le sportif dispose d'un espace 100% cloisonné. Il ne peut jamais accéder à la gestion d'équipe ni aux données
                d'autres athlètes. Ses fonctionnalités clés :
              </p>

              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Remplir ses check-ins matinaux (Sommeil, Douleurs, Fatigue, Humeur) en moins de 60 secondes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Débriefer après séance en indiquant son RPE ressenti sur les échelles de Borg.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Rejoindre son équipe officielle avec le code communiqué par son coach.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Voir l'ambiance du vestiaire sous forme de météo collective sans voir les données privées des autres.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2 : CHARGE & RPE */}
      {sectionActive === 'rpe' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Méthode de la Charge de Session (Foster sRPE)</span>
                  <InfoTooltip
                    titre="Calcul de la charge sRPE"
                    texte="La charge d'entraînement (en UA) est le produit de la durée de la séance en minutes par la perception de l'effort (RPE de 0 à 10)."
                  />
                </h3>
                <p className="text-xs text-neutral-400">Formule validée : Charge (UA) = Durée (min) × RPE</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              La méthode de Carl Foster permet de quantifier la contrainte interne subie par le sportif, quel que soit son sport.
              Essayez le simulateur ci-dessous pour visualiser le calcul sans altérer vos données :
            </p>

            {/* Simulateur interactif RPE */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Simulateur interactif en direct</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  Charge calculée : {chargeSimulee} UA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-400">Durée de la séance</span>
                    <span className="font-bold text-white">{simDuree} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="5"
                    value={simDuree}
                    onChange={(e) => setSimDuree(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-400">Perception de l'effort (Borg CR10)</span>
                    <span className="font-bold text-white">{simRpe} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={simRpe}
                    onChange={(e) => setSimRpe(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-900 text-xs text-neutral-400 flex items-center justify-between">
                <span>Interprétation :</span>
                <span className="text-neutral-200 font-semibold">
                  {chargeSimulee < 300
                    ? 'Séance légère de récupération ou régénération'
                    : chargeSimulee < 600
                    ? 'Séance d’intensité moyenne à dominante développement'
                    : 'Séance lourde / intensive nécessitant un temps de récupération adapté'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3 : ACWR & MME */}
      {sectionActive === 'acwr' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Modèle ACWR (Acute:Chronic Workload Ratio) par MME</span>
                  <InfoTooltip
                    titre="Ratio ACWR & Moyenne Mobile Exponentielle"
                    texte="L'ACWR compare la fatigue aiguë des 7 derniers jours à l'aptitude chronique des 28 derniers jours. La MME accorde plus de poids aux jours les plus récents."
                  />
                </h3>
                <p className="text-xs text-neutral-400">Recherches du Dr Tim Gabbett & validation scientifique</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Le ratio ACWR permet d'anticiper le risque de blessure musculaire ou tendineuse. Lorsque la charge augmente trop vite
              par rapport à ce à quoi le corps est préparé, le ratio dépasse 1.5, multipliant le risque de blessure par 3 à 5.
            </p>

            {/* Simulateur ACWR */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Simulation du Ratio A/C en direct
                </span>
                <span className={`text-xs font-mono font-black px-3 py-1 rounded-xl border ${zoneCouleur}`}>
                  Ratio : {ratioSimule}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-400">Charge Aiguë (7 jours - Fatigue)</span>
                    <span className="font-bold text-white">{simAigue} UA</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="50"
                    value={simAigue}
                    onChange={(e) => setSimAigue(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-400">Charge Chronique (28 jours - Préparation)</span>
                    <span className="font-bold text-white">{simChronique} UA</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="50"
                    value={simChronique}
                    onChange={(e) => setSimChronique(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs font-semibold ${zoneCouleur}`}>
                {zoneLibelle}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4 : WELLNESS */}
      {sectionActive === 'wellness' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Bilan Wellness & Récupération</span>
                  <InfoTooltip
                    titre="Indicateurs de Hooper & Mackinnon"
                    texte="Le score Wellness mesure le sommeil, la fatigue, les courbatures musculaires et le stress perçu pour adapter l'entraînement du jour."
                  />
                </h3>
                <p className="text-xs text-neutral-400">Détection précoce du surentraînement et de la fatigue nerveuse</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">😴</span> Sommeil
                </h4>
                <p className="text-[11px] text-neutral-400">Qualité et durée du repos nocturne. Clé de voûte de la régénération nerveuse.</p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">⚡</span> Fatigue Générale
                </h4>
                <p className="text-[11px] text-neutral-400">Niveau d'énergie ressenti au réveil avant toute sollicitation physique.</p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">🩹</span> Courbatures & DOMS
                </h4>
                <p className="text-[11px] text-neutral-400">Douleurs musculaires d'apparition retardée et tensions localisées.</p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">🧠</span> Stress & Humeur
                </h4>
                <p className="text-[11px] text-neutral-400">Charge mentale, vie personnelle ou scolaire pouvant affecter la performance.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5 : CLUBHOUSE & ÉQUIPES */}
      {sectionActive === 'clubhouse' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Architecture VEO Cam : Clubhouse & Cloisonnement</span>
                  <InfoTooltip
                    titre="Cloisonnement strict"
                    texte="Chaque entraîneur possède son Clubhouse privé. Les équipes et athlètes créés dans un Clubhouse ne sont jamais accessibles par un tiers."
                  />
                </h3>
                <p className="text-xs text-neutral-400">Gestion sécurisée multi-équipes avec codes d'invitation uniques</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-2">
                <div className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Clubhouse Unique</span>
                </div>
                <p className="text-xs text-neutral-400">
                  L'organisation centrale du coach avec logo rond officiel, discipline et charte de couleur.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-2">
                <div className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Équipes & Écussons</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Chaque équipe possède son écusson vectoriel, son ambiance visuelle et son code d'adhésion individuel.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-2">
                <div className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Gestion & Suppression</span>
                </div>
                <p className="text-xs text-neutral-400">
                  L'entraîneur peut à tout moment modifier ou supprimer ses équipes, ou réinitialiser son Clubhouse en toute liberté.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6 : HISTORIQUE & ANNULATION (UNDO) */}
      {sectionActive === 'undo' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Système de Traçabilité & Restauration (Undo)</span>
                  <InfoTooltip
                    titre="Sécurité des données"
                    texte="Toute suppression ou modification d'équipe ou de joueur est historisée avec l'état avant et après. En cas d'erreur, un clic sur 'Restaurer' rétablit les données."
                  />
                </h3>
                <p className="text-xs text-neutral-400">Journal d'audit horodaté pour éviter toute perte de données accidentelle</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Dans l'onglet <strong>Historique</strong>, chaque action importante (création ou suppression d'une équipe,
              d'un sportif, d'une séance) enregistre l'utilisateur auteur, l'horodatage, l'état avant et après modification.
              Si vous supprimez une équipe par inadvertance, vous pouvez la restaurer immédiatement sans devoir tout ressaisir.
            </p>

            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-amber-400" />
              <span>
                Le système d'annulation protège l'ensemble de votre travail et garantit la réversibilité de vos manipulations.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
