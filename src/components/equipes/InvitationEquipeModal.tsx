import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Copy,
  Check,
  Share2,
  Users,
  UserPlus,
  UserMinus,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Equipe } from '../../types';
import { ClubEcusson } from './ClubEcusson';
import { useApp } from '../../context/AppContext';
import { getAmbienceStyle } from './AmbienceFond';

interface InvitationEquipeModalProps {
  ouvert: boolean;
  surFermer: () => void;
  equipe: Equipe | null;
}

export const InvitationEquipeModal: React.FC<InvitationEquipeModalProps> = ({
  ouvert,
  surFermer,
  equipe,
}) => {
  const {
    sportifs,
    demandesAdhesion,
    accepterDemandeAdhesion,
    refuserDemandeAdhesion,
    retirerSportifEquipe,
  } = useApp();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [lienCopie, setLienCopie] = useState(false);
  const [codeCopie, setCodeCopie] = useState(false);
  const [ongletActif, setOngletActif] = useState<'qrcode' | 'demandes' | 'membres'>('qrcode');

  const codeInvitation = equipe?.codeInvitation || (equipe ? `ATH-${equipe.id.substring(3, 7)}` : 'ATH-PRO');
  const lienInvitation = typeof window !== 'undefined'
    ? `${window.location.origin}/?rejoindre=${codeInvitation}`
    : `https://athletik.app/?rejoindre=${codeInvitation}`;

  useEffect(() => {
    if (equipe && ouvert) {
      QRCode.toDataURL(lienInvitation, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Erreur génération QR Code', err));
    }
  }, [equipe, ouvert, lienInvitation]);

  if (!ouvert || !equipe) return null;

  const handleCopierLien = () => {
    navigator.clipboard.writeText(lienInvitation);
    setLienCopie(true);
    setTimeout(() => setLienCopie(false), 2500);
  };

  const handleCopierCode = () => {
    navigator.clipboard.writeText(codeInvitation);
    setCodeCopie(true);
    setTimeout(() => setCodeCopie(false), 2500);
  };

  const membresEquipe = sportifs.filter((s) => s.equipeId === equipe.id);
  const demandesPourEquipe = demandesAdhesion.filter(
    (d) => d.equipeId === equipe.id && d.statut === 'en_attente'
  );

  const styleAmbience = getAmbienceStyle(
    equipe.couleur,
    equipe.couleurSecondaire,
    equipe.couleurFond,
    equipe.styleFond
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête héro avec ambiance d'équipe */}
        <div
          className="relative border-b border-neutral-800 p-6 overflow-hidden"
          style={styleAmbience}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ClubEcusson
                presetId={equipe.ecussonPreset}
                logoUrl={equipe.logoUrl}
                logoZoom={equipe.logoZoom}
                couleur={equipe.couleur}
                couleurSecondaire={equipe.couleurSecondaire}
                taille="lg"
                nomClub={equipe.nom}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${equipe.couleur}25`,
                      color: equipe.couleurSecondaire || equipe.couleur,
                      border: `1px solid ${equipe.couleur}40`,
                    }}
                  >
                    Invitation Athlètes
                  </span>
                  <span className="text-xs text-neutral-300">• {equipe.discipline}</span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight mt-1">{equipe.nom}</h2>
                <p className="text-xs text-neutral-300 opacity-90">
                  Lien direct & QR Code pour permettre aux sportifs d'adhérer à votre groupe
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={surFermer}
              className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors bg-black/40 border border-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation des sous-onglets */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setOngletActif('qrcode')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
              ongletActif === 'qrcode'
                ? 'border-emerald-500 text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>Lien & QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setOngletActif('demandes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
              ongletActif === 'demandes'
                ? 'border-emerald-500 text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UserPlus className="h-4 w-4 text-emerald-400" />
            <span>Demandes reçues</span>
            {demandesPourEquipe.length > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                {demandesPourEquipe.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOngletActif('membres')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
              ongletActif === 'membres'
                ? 'border-emerald-500 text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="h-4 w-4 text-neutral-400" />
            <span>Effectif actuel ({membresEquipe.length})</span>
          </button>
        </div>

        {/* Contenu principal */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* ONGLET 1 : QR CODE & LIEN D'INVITATION */}
          {ongletActif === 'qrcode' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code stylisé avec fond blanc pour contraste optique parfait */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-center space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-neutral-200 ring-4 ring-emerald-500/20">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code ${equipe.nom}`}
                      className="h-44 w-44 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="h-44 w-44 flex items-center justify-center text-neutral-400 text-xs">
                      Génération du QR code...
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" /> Scannez avec l'appareil photo
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Ouvre directement la demande d'adhésion sur le téléphone du sportif
                  </p>
                </div>
              </div>

              {/* Code d'invitation & Partage rapide */}
              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Code court d'équipe
                  </span>
                  <div className="flex items-center justify-between gap-3 bg-neutral-900 p-3 rounded-xl border border-neutral-700/80">
                    <span className="font-mono text-xl font-extrabold tracking-wider text-emerald-400">
                      {codeInvitation}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopierCode}
                      className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                      {codeCopie ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copier le code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    L'athlète peut entrer ce code dans son onglet Connexion ou Profil pour faire sa demande.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Lien direct d'adhésion
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={lienInvitation}
                      className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopierLien}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
                    >
                      {lienCopie ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300/90 leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>
                    <strong>Contrôle sécurisé de l'entraîneur :</strong> L'athlète n'accède pas au groupe tant que vous n'avez pas expressément validé sa demande d'adhésion.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2 : DEMANDES REÇUES */}
          {ongletActif === 'demandes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Demandes d'adhésion en attente pour cette équipe
                </span>
                <span className="text-xs text-neutral-400">
                  {demandesPourEquipe.length} demande{demandesPourEquipe.length > 1 ? 's' : ''}
                </span>
              </div>

              {demandesPourEquipe.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 p-8 text-center">
                  <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-neutral-300">Aucune demande en attente</p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Partagez le lien d'invitation ou le QR Code pour inviter vos sportifs à rejoindre {equipe.nom}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {demandesPourEquipe.map((dem) => (
                    <div
                      key={dem.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                          {dem.sportifPrenom.charAt(0)}
                          {dem.sportifNom.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">
                              {dem.sportifPrenom} {dem.sportifNom}
                            </h4>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {dem.dateDemande}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">{dem.sportifEmail}</p>
                          {dem.messageMotivation && (
                            <p className="text-xs text-neutral-300 italic mt-1 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                              « {dem.messageMotivation} »
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => accepterDemandeAdhesion(dem.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accepter</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => refuserDemandeAdhesion(dem.id)}
                          className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ONGLET 3 : MEMBRES DE L'EQUIPE ET RETRAIT */}
          {ongletActif === 'membres' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">Effectif assigné à {equipe.nom}</h3>
                  <p className="text-[11px] text-neutral-400">
                    Vous pouvez retirer un joueur de l'équipe à tout moment (l'équipe disparaîtra alors de son espace athlète).
                  </p>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {membresEquipe.length} joueur{membresEquipe.length > 1 ? 's' : ''}
                </span>
              </div>

              {membresEquipe.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 p-8 text-center text-xs text-neutral-400">
                  Aucun sportif n'est encore assigné à cette équipe.
                </div>
              ) : (
                <div className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
                  {membresEquipe.map((sp) => (
                    <div
                      key={sp.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-200 border border-neutral-700">
                          {sp.initiales}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">
                            {sp.prenom} {sp.nom}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                            <span>{sp.posteOuSpecialite || 'Sportif'}</span>
                            <span>•</span>
                            <span>{sp.email}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Retirer ${sp.prenom} ${sp.nom} de l'équipe "${equipe.nom}" ? Cette équipe n'apparaîtra plus sur son espace.`
                            )
                          ) {
                            retirerSportifEquipe(sp.id, equipe.id);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-rose-500/50 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 text-xs font-medium transition-colors"
                        title="Retirer de l'équipe"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        <span>Retirer de l'équipe</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 px-6 py-3.5 bg-neutral-900/90 flex justify-end">
          <button
            type="button"
            onClick={surFermer}
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
