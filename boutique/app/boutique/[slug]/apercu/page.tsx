"use client";

import { useParams, useSearchParams } from "next/navigation";
import AccueilContenu from "@/app/components/boutique-publique/AccueilContenu";
import { CartProvider } from "@/app/components/boutique-publique/CartProvider";
import { ApercuChargement, PreviewNavigationProvider, useApercuDonnees } from "@/app/components/boutique-publique/PreviewMode";
import { variablesBoutique } from "@/lib/boutique-style";

/*
  Route brouillon de la page d'accueil — miroir de app/boutique/[slug]/
  (public)/page.tsx, mais alimentée par postMessage (état non enregistré du
  dashboard) plutôt que par lireBoutique(). Rendue dans une iframe par
  BoutiquePreview.tsx — cf. PreviewMode.tsx pour le pont postMessage et la
  réécriture de navigation.

  Hors du groupe (public) : pas de garde `identite.ouverte`/notFound() ici
  (une boutique fermée doit quand même se prévisualiser), et les variables
  CSS viennent de l'état reçu, pas du fichier enregistré.
*/
export default function ApercuAccueilPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const donnees = useApercuDonnees();

  if (!donnees) return <ApercuChargement />;

  return (
    <div style={variablesBoutique(donnees.editeur)} className="min-h-screen">
      <PreviewNavigationProvider value={{ actif: true }}>
        <CartProvider slug={slug} previsualisation>
          <AccueilContenu donnees={donnees} slug={slug} recherche={searchParams.get("q") ?? ""} categorieActiveId={searchParams.get("cat")} />
        </CartProvider>
      </PreviewNavigationProvider>
    </div>
  );
}
