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

export type ApercuNavigation = { actif: true; edition?: boolean };

const PreviewNavigationContext = createContext<ApercuNavigation | null>(null);

export const PreviewNavigationProvider = PreviewNavigationContext.Provider;

export function usePreviewNavigation(): ApercuNavigation | null {
  return useContext(PreviewNavigationContext);
}

/** "/boutique/<slug>[...]" -> "/boutique/<slug>/apercu[...]" — un lien du
 *  site public visé depuis l'intérieur de l'iframe brouillon reste dans le
 *  brouillon plutôt que de sortir vers la vraie page publique. */
function versApercu(href: string): string {
  const chemin = href.replace(/^(\/boutique\/[^/?#]+)(\/|$|\?|#)/, "$1/apercu$2");
  // Propage `edition=1` aux navigations internes du brouillon (ex: clic sur
  // une carte produit depuis l'accueil) — sinon le mode sélection (cf.
  // useSelectionApercu) se perd dès la première navigation, `edition` ne
  // faisant partie du href d'origine (celui-ci vise le site public, qui
  // n'en a pas besoin).
  if (typeof window !== "undefined" && window.location.search.includes("edition=1") && !chemin.includes("edition=")) {
    return `${chemin}${chemin.includes("?") ? "&" : "?"}edition=1`;
  }
  return chemin;
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

/*
  Sélection de section directement dans l'aperçu (data-section-id posé sur
  chaque bloc par AccueilContenu/CommandeContenu/ProduitContenu) : cliquer un
  bloc du brouillon ouvre son panneau de réglages dans le dashboard, sans
  passer par la liste "Sections" de gauche — cf. useSelectionApercu ci-dessous,
  appelé uniquement par les routes /apercu, avec `edition` (query `?edition=1`,
  posée par BoutiquePreview.tsx seulement sur les deux iframes d'édition, pas
  sur la fenêtre "Aperçu" plein écran ni le site public).
*/
const APERCU_SECTION_CLIC = "apercu-section-clic";
const APERCU_SECTION_ACTIVE = "apercu-section-active";

export type MessageApercuSectionClic = { type: typeof APERCU_SECTION_CLIC; sectionId: string };
export type MessageApercuSectionActive = { type: typeof APERCU_SECTION_ACTIVE; sectionId: string | null };

/** Poste vers le parent (dashboard) qu'un bloc du brouillon a été cliqué —
 *  BoutiquePreview.tsx écoute ce message pour sélectionner la section. */
function posterClicSection(sectionId: string) {
  const message: MessageApercuSectionClic = { type: APERCU_SECTION_CLIC, sectionId };
  window.parent.postMessage(message, window.location.origin);
}

export function estMessageApercuSectionClic(data: unknown): data is MessageApercuSectionClic {
  return !!data && typeof data === "object" && (data as { type?: unknown }).type === APERCU_SECTION_CLIC;
}

/** Poste vers l'iframe quelle section est actuellement ouverte dans le
 *  panneau de réglages (onglet "Sections" seulement, cf. PersonnaliserBoutique.tsx)
 *  — l'aperçu peut alors surligner en direct la partie qu'on s'apprête à modifier. */
export function posterSectionActive(cible: Window, sectionId: string | null) {
  const message: MessageApercuSectionActive = { type: APERCU_SECTION_ACTIVE, sectionId };
  cible.postMessage(message, window.location.origin);
}

function estMessageApercuSectionActive(data: unknown): data is MessageApercuSectionActive {
  return !!data && typeof data === "object" && (data as { type?: unknown }).type === APERCU_SECTION_ACTIVE;
}

/** À appeler par les routes /apercu/** avec le `edition` lu depuis l'URL
 *  (cf. commentaire ci-dessus). Rend chaque `[data-section-id]` cliquable :
 *  un clic annule l'action réelle du bloc (preventDefault+stopPropagation en
 *  phase de capture — en édition, cliquer désigne la section, ça ne doit pas
 *  déclencher "Ajouter au panier" ni une navigation) et prévient le
 *  dashboard. Le survol trace un contour pointillé, la section actuellement
 *  ouverte dans le panneau un contour plein — sur le premier enfant du
 *  wrapper (celui-ci est en `display:contents` dans AccueilContenu, donc
 *  sans boîte propre à contourner). */
export function useSelectionApercu(edition: boolean) {
  const [sectionActive, setSectionActive] = useState<string | null>(null);
  const [sectionSurvolee, setSectionSurvolee] = useState<string | null>(null);

  useEffect(() => {
    if (!edition) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (estMessageApercuSectionActive(event.data)) setSectionActive(event.data.sectionId);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [edition]);

  useEffect(() => {
    if (!edition) return;

    const trouverSection = (cible: EventTarget | null): HTMLElement | null => {
      let el = cible instanceof Element ? cible : null;
      while (el && !el.hasAttribute("data-section-id")) el = el.parentElement;
      return el as HTMLElement | null;
    };

    const onMouseOver = (e: MouseEvent) => setSectionSurvolee(trouverSection(e.target)?.dataset.sectionId ?? null);
    const onMouseOut = () => setSectionSurvolee(null);
    const onClick = (e: MouseEvent) => {
      const section = trouverSection(e.target);
      if (!section?.dataset.sectionId) return;
      e.preventDefault();
      e.stopPropagation();
      posterClicSection(section.dataset.sectionId);
    };

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("click", onClick, true);
    };
  }, [edition]);

  useEffect(() => {
    if (!edition) return;
    const wrappers = document.querySelectorAll<HTMLElement>("[data-section-id]");
    wrappers.forEach((wrapper) => {
      const cible = wrapper.firstElementChild;
      if (!(cible instanceof HTMLElement)) return;
      const id = wrapper.dataset.sectionId;
      cible.style.cursor = "pointer";
      if (id === sectionActive) {
        cible.style.outline = "2px solid #EC0C8C";
        cible.style.outlineOffset = "-2px";
      } else if (id === sectionSurvolee) {
        cible.style.outline = "2px dashed rgba(236,12,140,.55)";
        cible.style.outlineOffset = "-2px";
      } else {
        cible.style.outline = "";
        cible.style.outlineOffset = "";
      }
    });
    return () => {
      wrappers.forEach((wrapper) => {
        const cible = wrapper.firstElementChild;
        if (cible instanceof HTMLElement) {
          cible.style.outline = "";
          cible.style.outlineOffset = "";
          cible.style.cursor = "";
        }
      });
    };
  }, [edition, sectionActive, sectionSurvolee]);
}

/** Affiché par les routes brouillon tant qu'aucune donnée n'est reçue —
 *  quasi invisible en usage normal (le dashboard poste dès le montage de
 *  l'iframe), sert surtout si la route /apercu est ouverte directement hors
 *  iframe (aucun parent pour répondre au message "prêt"). */
export function ApercuChargement() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 animate-[fadeInApercu_.4s_ease]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#faf7fc]/70 animate-[pulseDotApercu_1s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-[12px] tracking-wide text-[#8c8496]">Chargement de l&apos;aperçu…</p>
      <style>{`
        @keyframes pulseDotApercu { 0%, 80%, 100% { opacity: .25; transform: scale(.75); } 40% { opacity: 1; transform: scale(1); } }
        @keyframes fadeInApercu { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
