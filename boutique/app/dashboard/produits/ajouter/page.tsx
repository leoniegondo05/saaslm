"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardHeader from "../../../components/DashboardHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";
import AjouterProduitModal from "../../../components/dashboard-produits/ajouter-produit/AjouterProduitModal";
import { CATEGORIES_DEFAUT } from "../../../components/dashboard-produits/ajouter-produit/categoriesDefaut";
import {
  definirProduitEnAttente,
  ajouterCategorieEnAttente,
  lireEtViderEditionAOuvrir,
  definirEditionEnAttente,
} from "../../../components/dashboard-produits/ajouter-produit/pendingProduitStore";

/*
  Écran "Ajouter un produit" — page à part (plus un simple toggle de state
  dans ProduitsCatalogue.tsx) pour qu'une actualisation du navigateur ici
  reste ici, au lieu de ramener à la page Produits : même mouvement que
  Catalogue drop / Partenaire agréé (autres écrans sortis de la page
  Produits pour la même raison d'URL propre).

  "Publier"/"Enregistrer en brouillon" et la création de catégorie ne
  peuvent pas écrire directement dans la liste de ProduitsCatalogue (elle
  vit dans une autre page) : ils passent par pendingProduitStore, lu et vidé
  au montage de ProduitsCatalogue. Catégories déjà existantes = uniquement
  CATEGORIES_DEFAUT ici (les catégories ajoutées côté ProduitsCatalogue
  depuis un montage précédent ne remontent pas jusqu'à cette page) — cf.
  [[dashboard-mock-data-pending-laravel-api]], resterait vrai même sans
  cette page tant qu'il n'y a pas d'endpoint catégories.
*/
export default function AjouterProduitPage() {
  const router = useRouter();
  // Lu une seule fois, à l'initialisation du state (pas en useEffect) : le
  // formulaire doit recevoir `initial` dès son tout premier rendu, sinon ses
  // useState internes se figent déjà sur leurs valeurs vides (cf.
  // pendingProduitStore.ts pour le pont "Modifier").
  const [edition] = useState(() => lireEtViderEditionAOuvrir());

  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader activeAccueilTab="Produits" />
          <AjouterProduitModal
            categoriesInitiales={CATEGORIES_DEFAUT}
            initial={edition?.initial}
            modeEdition={!!edition}
            onFermer={() => router.push("/dashboard/produits")}
            onCreer={(produit, statut) => {
              if (edition) {
                definirEditionEnAttente(edition.nomOriginal, produit, statut);
              } else {
                definirProduitEnAttente(produit, statut);
              }
              router.push("/dashboard/produits");
            }}
            onCategorieCreee={(categorie) => ajouterCategorieEnAttente(categorie)}
          />
        </div>
      </div>
    </div>
  );
}
