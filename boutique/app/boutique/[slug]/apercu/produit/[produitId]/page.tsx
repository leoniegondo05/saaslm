"use client";

import { useParams } from "next/navigation";
import ProduitContenu from "@/app/components/boutique-publique/ProduitContenu";
import { CartProvider } from "@/app/components/boutique-publique/CartProvider";
import { ApercuChargement, PreviewNavigationProvider, useApercuDonnees } from "@/app/components/boutique-publique/PreviewMode";
import { variablesBoutique } from "@/lib/boutique-style";

/*
  Route brouillon de la fiche produit — miroir de app/boutique/[slug]/
  (public)/produit/[produitId]/page.tsx, cf. apercu/page.tsx pour le
  fonctionnement général (postMessage, hors garde `identite.ouverte`).

  C'est cette route que le dashboard affiche pour l'onglet "Page de
  commande" de l'éditeur (BoutiquePreview.tsx) — la fiche produit reste le
  contenu principal de cette page côté éditeur (galerie/infos/onglets-
  détails/avis/produits-liés/vendu-par) ; "Commander" à l'intérieur de
  l'iframe navigue réellement vers apercu/commande (cf. PreviewMode.tsx),
  exactement comme un vrai visiteur.
*/
export default function ApercuProduitPage() {
  const { slug, produitId } = useParams<{ slug: string; produitId: string }>();
  const donnees = useApercuDonnees();

  if (!donnees) return <ApercuChargement />;

  const produit = donnees.produits.find((p) => p.id === produitId) ?? donnees.produits[0];
  if (!produit) {
    return <div className="flex min-h-screen items-center justify-center text-[13px] text-[#8c8496]">Aucun produit à prévisualiser.</div>;
  }

  return (
    <div style={variablesBoutique(donnees.editeur)} className="min-h-screen">
      <PreviewNavigationProvider value={{ actif: true }}>
        <CartProvider slug={slug} previsualisation>
          <ProduitContenu donnees={donnees} slug={slug} produit={produit} />
        </CartProvider>
      </PreviewNavigationProvider>
    </div>
  );
}
