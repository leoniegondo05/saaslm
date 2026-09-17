import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import MaBoutique from "../../components/dashboard-reglages/MaBoutique";
import { MA_BOUTIQUE_ASSISTANCE_QUESTIONS } from "../../components/dashboard-accueil/assistanceQuestions";

/*
  "Ma boutique" (/dashboard/ma-boutique), atteinte uniquement depuis le logo
  boutique du header (voir DashboardHeader.tsx) — n'est plus une fiche de
  l'onglet Réglages (retour utilisateur du 2026-09-17). Même squelette de
  page que app/dashboard/demandes/page.tsx (sidebar + header + contenu) ;
  le contenu lui-même vit dans MaBoutique.tsx.
*/
export default function MaBoutiquePage() {
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader
            pageQuestions={MA_BOUTIQUE_ASSISTANCE_QUESTIONS}
            pageLabel={{ fr: "Ma boutique", en: "My shop" }}
          />
          <MaBoutique first />
        </div>
      </div>
    </div>
  );
}
