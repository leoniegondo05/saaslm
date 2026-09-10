import DashboardHeader from "../../components/DashboardHeader";
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
*/
export default function ProduitsPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <ProduitsCatalogue />
        </div>
      </div>
    </div>
  );
}
