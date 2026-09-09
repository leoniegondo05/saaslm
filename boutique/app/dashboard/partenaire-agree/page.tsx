import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import PartenaireAgree from "../../components/dashboard-produits/PartenaireAgree";

/*
  Écran 04 "Le partenaire agréé", atteint depuis la chip "Partenaire agréé"
  du header (voir DashboardHeader) sur n'importe quel écran du dashboard —
  page à part, plus un onglet de l'onglet "Produits" (voir
  app/dashboard/produits/page.tsx et son historique git : le composant y
  était empilé/filtrable via ProduitsNav, déplacé ici sur demande).
*/
export default function PartenaireAgreePage() {
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <PartenaireAgree />
        </div>
      </div>
    </div>
  );
}
