import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Check,
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, supprimerToast, accepterDemandeAdhesion, refuserDemandeAdhesion, roleActuel } =
    useApp();

  // Auto-dismiss propre pour les toasts informatifs simples
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      const now = Date.now();
      toasts.forEach((t) => {
        if (t.type !== 'demande') {
          const creation = new Date(t.dateCreation).getTime();
          if (now - creation > 5000) {
            supprimerToast(t.id);
          }
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [toasts, supprimerToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none sm:max-w-md px-2 sm:px-0">
      {toasts.map((toast) => {
        const isDemande = toast.type === 'demande';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              isDemande
                ? 'bg-neutral-900/98 border-emerald-500/50 shadow-emerald-950/40 text-white ring-1 ring-emerald-500/30'
                : toast.type === 'succes'
                ? 'bg-neutral-900/98 border-emerald-500/40 text-emerald-300'
                : toast.type === 'alerte'
                ? 'bg-neutral-900/98 border-rose-500/40 text-rose-300'
                : 'bg-neutral-900/98 border-neutral-700/60 text-neutral-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isDemande
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                      : toast.type === 'succes'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : toast.type === 'alerte'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  {isDemande ? (
                    <UserPlus className="h-5 w-5" />
                  ) : toast.type === 'succes' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : toast.type === 'alerte' ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white tracking-wide truncate">
                      {toast.titre}
                    </h4>
                    {isDemande && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 shrink-0">
                        Action requise
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed break-words">
                    {toast.message}
                  </p>

                  {/* Actions directes si demande d'adhésion pour l'entraîneur */}
                  {isDemande && toast.demandeAdhesionId && roleActuel === 'entraineur' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          accepterDemandeAdhesion(toast.demandeAdhesionId!);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Accepter</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          refuserDemandeAdhesion(toast.demandeAdhesionId!);
                        }}
                        className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton fermeture systématique et fiable */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  supprimerToast(toast.id);
                }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer shrink-0 z-10"
                title="Supprimer cette notification"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
