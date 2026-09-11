import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import DemandesModules from "../../components/dashboard-demandes/DemandesModules";

/*
  "Demandes" (/dashboard/demandes), atteinte depuis le bouton "Besoin
  d'assistance" de "Le partenaire agréé" (voir
  app/components/dashboard-produits/PartenaireAgree.tsx). Même squelette de
  page que app/dashboard/partenaire-agree/page.tsx (sidebar + header +
  contenu) ; le contenu lui-même (trois modules, litiges/questions/support)
  vit dans DemandesModules.
*/
export default function DemandesPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <DemandesModules />
        </div>
      </div>
    </div>
  );
}
