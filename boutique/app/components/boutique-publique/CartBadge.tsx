"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { LienBoutique } from "./PreviewMode";

/*
  Icône panier de l'en-tête (BoutiqueHeader.tsx) — seul fragment client de
  l'en-tête : le compteur dépend du panier (localStorage), pas connu côté
  serveur avant hydratation. `panierStyle` reprend EnteteState.panierStyle
  ("sac" | "chariot", cf. types.ts) pour matcher le choix du marchand.

  Pulsation à l'ajout — port du comportement `panierPulseId` de
  BoutiquePreview.tsx (case "entete" : icône panier animée quand une
  commande est passée ailleurs sur la page) : ici directement dérivée du
  compteur réel du panier (nombreArticles) plutôt que d'un signal séparé,
  puisque ce compteur est la vraie donnée — plus simple et tout aussi fidèle
  visuellement.
*/
export default function CartBadge({ slug, panierStyle = "sac", couleur = "currentColor" }: { slug: string; panierStyle?: "sac" | "chariot"; couleur?: string }) {
  const { nombreArticles } = useCart();
  const [pulse, setPulse] = useState(false);
  const precedent = useRef<number | null>(null);

  useEffect(() => {
    if (precedent.current !== null && nombreArticles > precedent.current) {
      setPulse(true);
      const minuteur = setTimeout(() => setPulse(false), 1200);
      precedent.current = nombreArticles;
      return () => clearTimeout(minuteur);
    }
    precedent.current = nombreArticles;
  }, [nombreArticles]);

  return (
    <LienBoutique
      href={`/boutique/${slug}/panier`}
      aria-label={`Voir le panier${nombreArticles > 0 ? ` (${nombreArticles} article${nombreArticles > 1 ? "s" : ""})` : ""}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--tx)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ac)]"
      style={{ color: couleur }}
    >
      {panierStyle === "chariot" ? (
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 4h2l1.6 11.2A2 2 0 0 0 8.6 17H18a2 2 0 0 0 2-1.6L21.4 8H6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9.5" cy="20.5" r="1.4" />
          <circle cx="17.5" cy="20.5" r="1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 8h12l-1 12H7L6 8Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
        </svg>
      )}
      {nombreArticles > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center">
          {pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--ac)" }} />}
          <span className="relative flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold text-white" style={{ background: "var(--ac)" }}>
            {nombreArticles > 99 ? "99+" : nombreArticles}
          </span>
        </span>
      )}
    </LienBoutique>
  );
}
