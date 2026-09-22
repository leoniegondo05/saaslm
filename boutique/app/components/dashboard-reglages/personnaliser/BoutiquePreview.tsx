"use client";

import { useEffect, useRef } from "react";
import type { Appareil, PageId, SectionId } from "./types";
import { posterDonneesApercu, estMessageApercuPret, posterSectionActive, estMessageApercuSectionClic } from "../../boutique-publique/PreviewMode";
import type { BoutiqueDonnees } from "@/lib/boutique-types";

/*
  Aperçu en direct de la boutique, tel que le client la verrait — une iframe
  pointée sur la route brouillon (/boutique/[slug]/apercu[/commande]) qui
  exécute le MÊME code que le site public (app/components/boutique-publique/*),
  alimentée par `donnees` via postMessage plutôt que par lireBoutique() —
  cf. PreviewMode.tsx pour le pont postMessage et la réécriture de
  navigation. Se met à jour en direct à chaque changement de réglage, avant
  même "Enregistrer" (cf. PersonnaliserBoutique.tsx, "modifications en
  attente"), sans recharger l'iframe.

  Deux pages simulées (`page`, cf. PageId dans types.ts) : "accueil"
  (apercu/page.tsx) et "commande" (apercu/commande/page.tsx, paiement +
  livraison) — la fiche produit (apercu/produit/[produitId]) reste
  atteignable depuis l'intérieur de l'iframe (ex. via un lien produit) en
  navigation réelle, comme un vrai visiteur.
*/

export default function BoutiquePreview({
  device,
  page,
  boutiqueNom,
  logo,
  donnees,
  slug,
  pleinEcran,
  sectionActive,
  onSelectionnerSection,
}: {
  device: Appareil;
  page: PageId;
  boutiqueNom: string;
  logo: string | null;
  /** Données réelles (produits/catégories/avis) passées à l'iframe via postMessage. */
  donnees: BoutiqueDonnees;
  slug: string;
  // Vue "Aperçu" plein écran (œil) : iframe bord à bord, sans cadre de
  // navigateur factice, comme le vrai site.
  pleinEcran?: boolean;
  /** Section actuellement ouverte dans le panneau de droite (onglet
   *  "Sections" seulement) — surlignée en direct dans l'aperçu. Fourni
   *  seulement par le canevas d'édition, jamais par la fenêtre "Aperçu"
   *  plein écran (rendu client réel, aucune sélection à y faire). */
  sectionActive?: SectionId | null;
  /** Reçoit l'id de la section cliquée à l'intérieur de l'aperçu — présence
   *  de ce prop active le mode édition (cf. `edition` ci-dessous) : query
   *  `?edition=1` sur l'iframe, clics interceptés côté brouillon plutôt que
   *  de déclencher leur action réelle (cf. useSelectionApercu, PreviewMode.tsx). */
  onSelectionnerSection?: (id: SectionId) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const edition = !!onSelectionnerSection;

  // URL de base de la route brouillon — changer src = rechargement complet,
  // donc on ne la change QUE quand la page (accueil/commande) change, pas à
  // chaque keystroke de réglage.
  const srcBase = `/boutique/${slug}/apercu${page === "commande" ? "/commande" : ""}${edition ? "?edition=1" : ""}`;

  // Pont postMessage : poste donnees (+ sectionActive en mode édition) à
  // l'iframe dès qu'elle signale "prête" (apercu-pret) ET à chaque
  // changement d'état (réglage en direct) ; reçoit en retour le clic sur une
  // section du brouillon (mode édition seulement).
  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const envoyer = () => {
      if (!iframe.contentWindow) return;
      posterDonneesApercu(iframe.contentWindow, donnees);
      if (edition) posterSectionActive(iframe.contentWindow, sectionActive ?? null);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (estMessageApercuPret(event.data)) envoyer();
      else if (edition && onSelectionnerSection && estMessageApercuSectionClic(event.data)) {
        onSelectionnerSection(event.data.sectionId as SectionId);
      }
    };

    window.addEventListener("message", onMessage);
    // Si l'iframe est déjà chargée (ex: changement d'état après montage),
    // envoyer immédiatement sans attendre un nouveau "prêt".
    envoyer();

    return () => window.removeEventListener("message", onMessage);
  }, [donnees, page, slug, edition, sectionActive, onSelectionnerSection]);

  // Téléphone : iframe à 375px (vrai téléphone) mise à l'échelle 300/375 dans
  // le cadre de 300px — les media queries Tailwind voient 375px, pas 300px.
  const ECHELLE_PHONE = 300 / 375;

  const iframePhone = (
    <iframe
      ref={iframeRef}
      src={srcBase}
      title={boutiqueNom}
      style={{
        width: 375,
        height: Math.round(600 / ECHELLE_PHONE),
        transform: `scale(${ECHELLE_PHONE})`,
        transformOrigin: "top left",
        border: "none",
        display: "block",
        background: "transparent",
      }}
    />
  );

  if (device === "phone") {
    return (
      <div className="mx-auto w-[300px] shrink-0 rounded-[2.4rem] border-[6px] border-[#141220] bg-[#141220] shadow-[0_30px_70px_-12px_rgba(20,18,32,0.45)]">
        <div className="relative h-[600px] overflow-hidden rounded-[2rem] bg-white">
          <div className="sticky top-0 z-10 flex h-6 items-center justify-center bg-[#fff]">
            <span className="h-4 w-20 rounded-full bg-[#141220]" />
          </div>
          <div style={{ height: "calc(100% - 24px)", overflow: "hidden" }}>
            {iframePhone}
          </div>
        </div>
      </div>
    );
  }

  if (pleinEcran) {
    return (
      <iframe
        ref={iframeRef}
        src={srcBase}
        title={boutiqueNom}
        className="h-full w-full border-none"
      />
    );
  }

  // Cadre "Ordinateur" : iframe pleine largeur dans le cadre redimensionnable.
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 shadow-[0_30px_70px_-16px_rgba(20,18,32,0.35)]">
      <div className="flex items-center gap-1.5 bg-[#e7e3ee] px-3.5 pt-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="ml-2 flex items-center gap-1.5 truncate rounded-t-lg bg-white px-3 py-1.5 text-[10px] font-medium text-[#3a3542]">
          <Marque logo={logo} taille={12} />
          <span className="truncate">{boutiqueNom}</span>
          <MiniIcon path="M6 6l12 12M18 6 6 18" color="#a39cae" />
        </span>
      </div>
      <div className="flex items-center gap-2 bg-white px-3.5 py-2">
        <MiniIcon path="M15 5 8 12l7 7" color="#a39cae" />
        <MiniIcon path="M9 5l7 7-7 7" color="#a39cae" />
        <MiniIcon path="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5" color="#a39cae" />
        <span className="ml-1 flex flex-1 items-center gap-1.5 truncate rounded-full bg-[#f0edf5] px-3 py-1 text-[10px] text-[#6d6577]">
          <MiniIcon path="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5Z" color="#6d6577" />
          <span className="truncate">
            …/{boutiqueNom.toLowerCase().replace(/\s+/g, "-")}
            {page === "commande" ? "/commande" : ""}
          </span>
        </span>
      </div>
      <div className="relative" style={{ height: "calc(100vh - 300px)", minHeight: "440px" }}>
        <iframe
          ref={iframeRef}
          src={srcBase}
          title={boutiqueNom}
          className="h-full w-full border-none"
        />
      </div>
    </div>
  );
}


// Chrome de la barre de titre du mockup navigateur (cadre "Ordinateur"
// ci-dessus) — logo/nom de la boutique, sans équivalent côté site public.
function Marque({ logo, taille }: { logo: string | null; taille: number }) {
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- aperçu, pas une image du domaine
    <img src={logo} alt="" className="shrink-0 rounded-full object-cover" style={{ width: taille, height: taille }} />
  ) : (
    <span
      className="shrink-0 rounded-full"
      style={{ width: taille, height: taille, background: "linear-gradient(140deg,var(--color-brand-pink),var(--color-brand-purple))" }}
    />
  );
}

function MiniIcon({ path, color = "currentColor", size = 14 }: { path: string; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ height: size, width: size }} aria-hidden>
      <path d={path} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

