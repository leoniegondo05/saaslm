"use client";

import { useEffect, useState } from "react";
import type { BoutonCommandeTexte, FlottantsState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { Icon, WhatsappIcon } from "./Icons";
import { LienBoutique } from "./PreviewMode";

const LABELS: Record<BoutonCommandeTexte, string> = { "je-commande": "Je commande", commander: "Commander", acheter: "Acheter" };

/*
  Couche flottante — port de ElementsFlottantsApercu dans BoutiquePreview.tsx :
  bulle WhatsApp, onglet latéral "Avis", bouton retour-haut, barre de
  commande fixe sur téléphone (fiche produit/commande seulement). Pas de
  numéro WhatsApp dans BoutiqueIdentite aujourd'hui (cf.
  [[dashboard-mock-data-pending-laravel-api]]) : la bulle reste un bouton
  visuel sans lien plutôt qu'un `wa.me/` inventé.
*/
export default function ElementsFlottants({
  flottants,
  montrerBarreCommande,
  lienCommande,
  boutonTexte,
  boutonFond,
  ancrage = "fixed",
}: {
  flottants: FlottantsState;
  montrerBarreCommande: boolean;
  lienCommande: string;
  boutonTexte: BoutonCommandeTexte;
  boutonFond: string;
  /** "fixed" (défaut, site public) s'ancre à la fenêtre du visiteur.
   *  L'aperçu éditeur passe "absolute" quand ce composant est rendu dans un
   *  cadre téléphone/navigateur factice de taille fixe (pas la fenêtre
   *  réelle) — sinon ces éléments s'ancreraient à la fenêtre du navigateur
   *  de l'éditeur plutôt qu'au cadre d'aperçu. */
  ancrage?: "fixed" | "absolute";
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!flottants.boutonRetourHaut) return;
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [flottants.boutonRetourHaut]);

  const basReserve = montrerBarreCommande ? "5.2rem" : "1rem";
  const cotePrincipal = flottants.whatsappAfficher && flottants.whatsappCote === "droite" ? "left" : "right";

  return (
    <>
      <div className={`pointer-events-none ${ancrage} inset-0 z-40`}>
        {flottants.ongletAvisCote && (
          <a
            href="#avis"
            className="pointer-events-auto absolute right-0 top-1/2 origin-right -translate-y-1/2 -rotate-90 rounded-t-lg bg-[#0B0E1C] px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg"
          >
            Avis
          </a>
        )}
        {flottants.boutonRetourHaut && visible && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Retour en haut"
            className={`pointer-events-auto absolute flex h-11 w-11 items-center justify-center rounded-full shadow-[0_8px_18px_-6px_rgba(11,14,28,0.35)] transition ${
              cotePrincipal === "right" ? "left-4" : "right-4"
            }`}
            style={{ bottom: basReserve, background: "var(--ac)" }}
          >
            <Icon path="M12 19V5M5 12l7-7 7 7" color="#fff" size={18} />
          </button>
        )}
        {flottants.whatsappAfficher && (
          <span
            className={`pointer-events-auto absolute flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.4)] ${
              flottants.whatsappCote === "gauche" ? "left-4" : "right-4"
            }`}
            style={{ bottom: basReserve }}
            aria-hidden
          >
            <WhatsappIcon size={22} />
          </span>
        )}
      </div>

      {montrerBarreCommande && flottants.boutonCommandeTelephone && (
        <div className={`${ancrage} inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white px-4 py-2.5 sm:hidden`}>
          <LienBoutique
            href={lienCommande}
            className="flex w-full items-center justify-center rounded-full py-3 text-[13.5px] font-bold text-white"
            style={{ background: boutonFond }}
          >
            {LABELS[boutonTexte]}
          </LienBoutique>
        </div>
      )}
    </>
  );
}
