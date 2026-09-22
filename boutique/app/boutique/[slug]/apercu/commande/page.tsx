"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import CommandeContenu from "@/app/components/boutique-publique/CommandeContenu";
import { CartProvider, useCart } from "@/app/components/boutique-publique/CartProvider";
import { ApercuChargement, PreviewNavigationProvider, useApercuDonnees } from "@/app/components/boutique-publique/PreviewMode";
import { variablesBoutique } from "@/lib/boutique-style";
import type { BoutiqueDonnees } from "@/lib/boutique-types";

/*
  Route brouillon de la page commande/paiement — miroir de app/boutique/[slug]/
  (public)/commande/page.tsx, cf. apercu/page.tsx pour le fonctionnement général
  (postMessage, pas de garde identite.ouverte).

  Auto-seed du panier sandboxé : si le marchand ouvre cet onglet directement
  depuis l'éditeur sans avoir cliqué "Commander" auparavant, le panier préview
  est vide et CommandeClient ne rendrait rien. On ajoute le premier produit
  disponible automatiquement — même comportement qu'un vrai visiteur qui
  commence par la fiche produit, juste fait pour lui.
*/

function AutoSeedPanier({ donnees }: { donnees: BoutiqueDonnees }) {
  const { items, ajouter, pret } = useCart();
  useEffect(() => {
    if (!pret) return;
    const produitsDansLePanier = items.map((i) => i.produitId);
    const aucunProduitDisponible = donnees.produits.every((p) => !produitsDansLePanier.includes(p.id));
    if (aucunProduitDisponible && donnees.produits[0]) {
      ajouter(donnees.produits[0].id, 1);
    }
  }, [pret, items, donnees.produits, ajouter]);
  return null;
}

export default function ApercuCommandePage() {
  const { slug } = useParams<{ slug: string }>();
  const donnees = useApercuDonnees();

  if (!donnees) return <ApercuChargement />;

  return (
    <div style={variablesBoutique(donnees.editeur)} className="min-h-screen">
      <PreviewNavigationProvider value={{ actif: true }}>
        <CartProvider slug={slug} previsualisation>
          <AutoSeedPanier donnees={donnees} />
          <CommandeContenu donnees={donnees} slug={slug} />
        </CartProvider>
      </PreviewNavigationProvider>
    </div>
  );
}
