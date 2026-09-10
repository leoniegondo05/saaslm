"use client";

import { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSearchBar from "../../components/DashboardSearchBar";
import DashboardSidebar from "../../components/DashboardSidebar";
import ProduitsCatalogue from "../../components/dashboard-accueil/ProduitsCatalogue";

/*
  Onglet "Produits" du dashboard, atteint depuis l'icône "Produits" du rail
  (voir DashboardSidebar) : Écran 03 "Mes produits" uniquement.

  Écran 04 "Partenaire agréé" et Écran 05 "Catalogue drop" sont chacun une
  page à part (/dashboard/partenaire-agree, /dashboard/produits/catalogue),
  atteintes depuis la chip du header et le bouton "Voir les produits
  disponibles en drop" — plus des onglets ici (ProduitsNav retiré, une
  seule section ne justifiait plus de barre d'onglets).

  Écran 06 "La fiche d'un produit drop" reste une page à part
  (/dashboard/produits/catalogue/[slug]).

  Premier branchement réel de DashboardSearchBar (les 3 autres pages —
  Accueil, Commande, Réglages — gardent la barre visuelle seule pour
  l'instant) : le texte tapé filtre les lignes du tableau dans
  ProduitsCatalogue, cf. commentaire là-bas.
*/
export default function ProduitsPage() {
  const [recherche, setRecherche] = useState("");
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <DashboardSearchBar onChange={setRecherche} />
          <ProduitsCatalogue recherche={recherche} />
        </div>
      </div>
    </div>
  );
}
