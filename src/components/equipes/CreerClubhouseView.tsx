import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Sparkles,
  Camera,
  Upload,
  ArrowRight,
  Shield,
  Layers,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { InfoTooltip } from '../ui/InfoTooltip';

export const CreerClubhouseView: React.FC<{ onClubhouseCree?: () => void }> = ({ onClubhouseCree }) => {
  const { modifierClubhouse, profilCompte, ajouterToast, compteActuel } = useApp();

  const [nom, setNom] = useState('');
  const [discipline, setDiscipline] = useState('Football & Omnisport');
  const [proprietaireNom, setProprietaireNom] = useState(
    compteActuel ? `${compteActuel.prenom} ${compteActuel.nom}` : profilCompte.prenom ? `${profilCompte.prenom} ${profilCompte.nom}` : 'Coach Principal'
  );
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [couleurPrimaire, setCouleurPrimaire] = useState('#10b981');

  const handleFichierLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop volumineuse. Taille maximum conseillée : 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      alert('Veuillez donner un nom à votre Clubhouse officiel.');
      return;
    }

    modifierClubhouse({
      nom: nom.trim(),
      discipline: discipline.trim(),
      proprietaireNom: proprietaireNom.trim(),
      description: description.trim(),
      logoUrl: logoUrl.trim(),
      couleurPrimaire,
      dateCreation: new Date().toISOString().split('T')[0],
    });

    ajouterToast({
      titre: 'Clubhouse officiel créé !',
      message: `Bienvenue dans votre Clubhouse "${nom.trim()}". Vous avez désormais accès à l'ensemble de vos outils d'entraîneur.`,
      type: 'succes',
    });

    if (onClubhouseCree) {
      onClubhouseCree();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      {/* BANNIÈRE SUPÉRIEURE DE BIENVENUE */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          <span>PREMIÈRE ÉTAPE OBLIGATOIRE DU COACH</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Créer ton <span className="text-emerald-400">Clubhouse</span>
        </h1>

        <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Votre Clubhouse est le quartier général de votre club ou structure sportive. Il regroupe
          exclusivement vos équipes, athlètes et données de performance dans un espace strictement sécurisé.
        </p>
      </div>

      {/* FORMULAIRE DE CRÉATION DU CLUBHOUSE */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-neutral-800 bg-neutral-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6"
      >
        {/* APERÇU ROND EN DIRECT DU LOGO DU CLUBHOUSE */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl border border-neutral-800/80 bg-neutral-950/60">
          <div
            className="h-24 w-24 rounded-full border-4 overflow-hidden aspect-square bg-neutral-900 shadow-2xl flex items-center justify-center shrink-0 transition-all duration-300"
            style={{ borderColor: couleurPrimaire }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo Clubhouse"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center font-black text-2xl text-white rounded-full"
                style={{ backgroundColor: `${couleurPrimaire}20`, color: couleurPrimaire }}
              >
                <Building2 className="h-10 w-10" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-black text-white">
                {nom.trim() || 'Nom de votre Clubhouse'}
              </h3>
              <InfoTooltip
                titre="Logo Rond Clubhouse"
                texte="Comme sur VEO Cam, le logo du Clubhouse officiel est présenté sous forme de cercle parfait."
              />
            </div>
            <p className="text-xs text-neutral-400">
              {discipline} • Dirigé par {proprietaireNom}
            </p>

            <div>
              <input
                type="file"
                id="clubhouse-premier-logo"
                accept="image/*"
                onChange={handleFichierLogo}
                className="hidden"
              />
              <label
                htmlFor="clubhouse-premier-logo"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold cursor-pointer transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{logoUrl ? 'Changer l’image' : 'Importer le logo du club'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* CHAMPS DE CONFIGURATION */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Nom officiel du Clubhouse <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : Performance Academy FC, RC Triathlon, Pôle Rugby Elite..."
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Discipline sportive principale
              </label>
              <input
                type="text"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="Ex : Football, Athlétisme, Cyclisme, Rugby..."
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Entraîneur responsable / Propriétaire
              </label>
              <input
                type="text"
                value={proprietaireNom}
                onChange={(e) => setProprietaireNom(e.target.value)}
                placeholder="Ex : Alexandre Roy"
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* COULEUR OFFICIELLE */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Couleur d’accentuation officielle
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={couleurPrimaire}
                onChange={(e) => setCouleurPrimaire(e.target.value)}
                className="h-10 w-12 rounded-xl border border-neutral-800 cursor-pointer bg-neutral-950 p-0.5"
              />
              <input
                type="text"
                value={couleurPrimaire}
                onChange={(e) => setCouleurPrimaire(e.target.value)}
                className="w-32 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-neutral-400">
                Cette couleur personnalisera l'en-tête et les graphiques de votre espace.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Description ou devise du club (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ex : Centre d'entraînement de haute intensité et quantification scientifique de l'effort..."
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* BOUTON DE VALIDATION */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-98"
          >
            <span>Valider et ouvrir mon Clubhouse</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      </form>
    </div>
  );
};
