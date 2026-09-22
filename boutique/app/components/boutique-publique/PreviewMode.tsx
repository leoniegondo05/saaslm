"use client";

import Link from "next/link";
import { useRouter as useRouterNext } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import type { AnchorHTMLAttributes } from "react";
import type { BoutiqueDonnees } from "@/lib/boutique-types";

/*
  Sandbox de navigation entre le site public (/boutique/[slug]/**) et
  l'aperçu éditeur — cf. app/boutique/[slug]/apercu/** (nouvelles routes
  "brouillon", rendues dans une iframe par BoutiquePreview.tsx, cf. rapport
  de tâche "aperçu = même code que le site public, via iframe").

  Les composants de section (BoutiqueHeader, ProduitCard, ProduitDetailClient,
  CommandeClient...) codent en dur des chemins réels ("/boutique/<slug>/
  commande", ".../produit/<id>"...). À l'intérieur de l'iframe brouillon, ces
  chemins doivent rester dans /apercu (sinon cliquer "Commander" ferait
  sortir l'iframe du brouillon vers la vraie boutique, potentiellement non
  enregistrée ou fermée) — LienBoutique/useBoutiqueRouter réécrivent le
  chemin vers son équivalent /apercu quand ce contexte est monté, sinon se
  comportent exactement comme next/link et useRouter (site public : contexte
  absent, aucun changement de comportement).

  Pas d'interception de clic ni de simulation de page ici (contrairement à
  une version précédente de ce fichier) : l'iframe a sa propre navigation
  réelle, confinée par le navigateur — pousser une URL /apercu/... à
  next/navigation suffit.
*/

export type ApercuNavigation = { actif: true };

const PreviewNavigationContext = createContext<ApercuNavigation | null>(null);

export const PreviewNavigationProvider = PreviewNavigationContext.Provider;

export function usePreviewNavigation(): ApercuNavigation | null {
  return useContext(PreviewNavigationContext);
}

/** "/boutique/<slug>[...]" -> "/boutique/<slug>/apercu[...]" — un lien du
 *  site public visé depuis l'intérieur de l'iframe brouillon reste dans le
 *  brouillon plutôt que de sortir vers la vraie page publique. */
function versApercu(href: string): string {
  return href.replace(/^(\/boutique\/[^/?#]+)(\/|$|\?|#)/, "$1/apercu$2");
}

type RouteurBoutique = { push: (href: string) => void; replace: (href: string) => void };

/** Remplace next/navigation's useRouter dans les composants de
 *  boutique-publique/* qui naviguent par programme (BoutiqueHeader —
 *  recherche, ProduitDetailClient — bouton commander, CommandeClient —
 *  redirections) : router réel hors aperçu ; en aperçu, même router réel,
 *  juste réécrit vers /apercu. */
export function useBoutiqueRouter(): RouteurBoutique {
  const routerNext = useRouterNext();
  const preview = usePreviewNavigation();
  if (!preview) return routerNext;
  return {
    push: (href) => routerNext.push(versApercu(href)),
    replace: (href) => routerNext.replace(versApercu(href)),
  };
}

type LienBoutiqueProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Remplace next/link dans boutique-publique/* : `<Link>` normal hors
 *  aperçu ; en aperçu, même `<Link>`, juste réécrit vers /apercu. */
export function LienBoutique({ href, ...props }: LienBoutiqueProps) {
  const preview = usePreviewNavigation();
  return <Link href={preview ? versApercu(href) : href} {...props} />;
}

/*
  Pont postMessage entre le dashboard (BoutiquePreview.tsx, qui possède
  l'état non enregistré : identite/state/produits/categories/avis) et les
  routes brouillon (app/boutique/[slug]/apercu/**, rendues dans son iframe) —
  même origine des deux côtés (même app Next), donc pas de payload à valider
  au-delà de l'origine elle-même.
*/
const APERCU_PRET = "apercu-pret";
const APERCU_DONNEES = "apercu-donnees";

export type MessageApercuPret = { type: typeof APERCU_PRET };
export type MessageApercuDonnees = { type: typeof APERCU_DONNEES; donnees: BoutiqueDonnees };

/** Poste `donnees` vers une iframe /apercu déjà chargée — à appeler par
 *  BoutiquePreview.tsx à chaque changement d'état, et en réponse à
 *  MessageApercuPret (l'iframe signale qu'elle est prête à recevoir, ce qui
 *  peut arriver après un changement d'état si elle vient de (re)charger). */
export function posterDonneesApercu(cible: Window, donnees: BoutiqueDonnees) {
  const message: MessageApercuDonnees = { type: APERCU_DONNEES, donnees };
  cible.postMessage(message, window.location.origin);
}

export function estMessageApercuPret(data: unknown): data is MessageApercuPret {
  return !!data && typeof data === "object" && (data as { type?: unknown }).type === APERCU_PRET;
}

/** Côté route brouillon : reçoit `donnees` par postMessage du parent
 *  (dashboard). `null` tant que rien n'est reçu (chargement, ou route
 *  ouverte hors iframe — cf. commentaire dans apercu/page.tsx). */
export function useApercuDonnees(): BoutiqueDonnees | null {
  const [donnees, setDonnees] = useState<BoutiqueDonnees | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data = event.data as Partial<MessageApercuDonnees>;
      if (data?.type === APERCU_DONNEES && data.donnees) setDonnees(data.donnees);
    }
    window.addEventListener("message", onMessage);
    const pret: MessageApercuPret = { type: APERCU_PRET };
    window.parent.postMessage(pret, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return donnees;
}

/** Affiché par les routes brouillon tant qu'aucune donnée n'est reçue —
 *  quasi invisible en usage normal (le dashboard poste dès le montage de
 *  l'iframe), sert surtout si la route /apercu est ouverte directement hors
 *  iframe (aucun parent pour répondre au message "prêt"). */
export function ApercuChargement() {
  return <div className="flex min-h-screen items-center justify-center text-[13px] text-[#8c8496]">Chargement de l&apos;aperçu…</div>;
}
