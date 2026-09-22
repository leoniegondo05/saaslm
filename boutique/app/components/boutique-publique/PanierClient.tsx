"use client";

import type { ProduitPublic } from "@/lib/boutique-types";
import type { EditeurState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { boutonCommandeFond } from "@/lib/boutique-style";
import { useCart, type CartItem } from "./CartProvider";
import { LienBoutique } from "./PreviewMode";

type Ligne = { item: CartItem; produit: ProduitPublic };

export default function PanierClient({ slug, produits, editeur }: { slug: string; produits: ProduitPublic[]; editeur: EditeurState }) {
  const { items, pret, definirQuantite, retirer } = useCart();

  // Ne rien afficher tant que le panier n'est pas relu depuis localStorage
  // (évite un flash "panier vide" avant hydratation, cf. CartProvider.tsx).
  if (!pret) return null;

  const lignes: Ligne[] = items
    .map((item) => ({ item, produit: produits.find((p) => p.id === item.produitId) }))
    .filter((l): l is Ligne => !!l.produit);

  const total = lignes.reduce((somme, l) => somme + l.produit.prix * l.item.quantite, 0);

  if (lignes.length === 0) {
    return (
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <p className="text-[17px] font-semibold">Votre panier est vide</p>
        <p className="max-w-sm text-[14px] text-[var(--tx)]/60">Parcourez la boutique pour trouver votre bonheur.</p>
        <LienBoutique
          href={`/boutique/${slug}`}
          className="mt-2 px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:brightness-110"
          style={{ background: "var(--ac)", borderRadius: "var(--rad)" }}
        >
          Retour à la boutique
        </LienBoutique>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-[23px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
        Votre panier
      </h1>
      <div className="flex flex-col divide-y divide-[var(--tx)]/10">
        {lignes.map(({ item, produit }) => (
          <div key={produit.id} className="flex flex-wrap items-center gap-3 py-4 sm:flex-nowrap sm:gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--tx)]/5">
              {produit.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={produit.images[0]} alt={produit.nom} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-[120px] flex-1">
              <LienBoutique href={`/boutique/${slug}/produit/${produit.id}`} className="block truncate text-[14px] font-medium hover:underline">
                {produit.nom}
              </LienBoutique>
              <p className="text-[12.5px] text-[var(--tx)]/55">{produit.prix.toLocaleString("fr-FR")} F</p>
            </div>
            <div className="inline-flex items-center border border-[var(--tx)]/15" style={{ borderRadius: "var(--card-rad)" }}>
              <button
                type="button"
                onClick={() => definirQuantite(produit.id, item.quantite - 1)}
                className="flex h-8 w-8 items-center justify-center text-[15px]"
                aria-label={`Diminuer la quantité de ${produit.nom}`}
              >
                −
              </button>
              <span className="w-8 text-center text-[13.5px] font-semibold">{item.quantite}</span>
              <button
                type="button"
                onClick={() => definirQuantite(produit.id, item.quantite + 1)}
                className="flex h-8 w-8 items-center justify-center text-[15px]"
                aria-label={`Augmenter la quantité de ${produit.nom}`}
              >
                +
              </button>
            </div>
            <span className="w-20 shrink-0 text-right text-[14px] font-bold">{(produit.prix * item.quantite).toLocaleString("fr-FR")} F</span>
            <button
              type="button"
              onClick={() => retirer(produit.id)}
              className="shrink-0 p-1.5 text-[var(--tx)]/40 transition hover:text-[var(--ac)]"
              aria-label={`Retirer ${produit.nom} du panier`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-end gap-4 border-t border-[var(--tx)]/10 pt-6">
        <div className="flex items-center gap-3 text-[16px] font-bold">
          <span>Total</span>
          <span>{total.toLocaleString("fr-FR")} F</span>
        </div>
        <LienBoutique
          href={`/boutique/${slug}/commande`}
          className="px-6 py-3 text-[14px] font-bold text-white transition hover:brightness-110"
          style={{
            background: boutonCommandeFond(editeur),
            borderRadius: "var(--rad)",
            textTransform: editeur.style.boutonTexteMajuscules ? "uppercase" : "none",
          }}
        >
          Passer la commande
        </LienBoutique>
      </div>
    </section>
  );
}
