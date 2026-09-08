"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import Abonnement from "../../components/dashboard-parametres/Abonnement";
import Confidentialite from "../../components/dashboard-parametres/Confidentialite";
import FinancesReglements from "../../components/dashboard-parametres/FinancesReglements";
import MaBoutique from "../../components/dashboard-parametres/MaBoutique";
import PageDeCommande from "../../components/dashboard-parametres/PageDeCommande";
import ReglagesAccueil from "../../components/dashboard-parametres/ReglagesAccueil";
import ReglagesNav, { ReglagesTab } from "../../components/dashboard-parametres/ReglagesNav";
import ReglesDeVente from "../../components/dashboard-parametres/ReglesDeVente";

/*
  Onglet "Paramètres" du dashboard, atteint depuis l'icône engrenage du
  rail (voir DashboardSidebar) — même mécanique que l'onglet "Produits"
  (voir app/dashboard/produits/page.tsx) : tab null → tout empilé, tab
  choisi → une seule fiche, via ReglagesNav. La différence avec Produits :
  "tout" commence par l'écran d'accueil "Réglages" (ReglagesAccueil, écran
  24 de la fiche de référence — un raccourci vers chaque fiche, plus ce
  qui ne vit pas ici et pourquoi), suivi des six fiches, dans cet ordre.

  "Personnel et accès" (dans le profil) et "Le partenaire agréé" (son
  propre onglet sous Produits) ne sont pas des fiches d'ici — l'ancien
  écran "Personnel et accès" de cette page a été retiré, redondant avec
  /dashboard/profil/droits.

  Seule "Ma boutique" est construite en détail pour l'instant ; les cinq
  autres fiches sont des reprises de la fiche de référence (six fiches
  Réglages) réduites à leur intitulé et à ce qu'elles contiendront, en
  attendant d'être construites une par une.
*/

const SECTIONS: Record<ReglagesTab, React.ComponentType<{ first?: boolean }>> = {
  "ma-boutique": MaBoutique,
  commande: PageDeCommande,
  finances: FinancesReglements,
  "regles-vente": ReglesDeVente,
  abonnement: Abonnement,
  confidentialite: Confidentialite,
};

const TAB_ORDER: ReglagesTab[] = [
  "ma-boutique",
  "commande",
  "finances",
  "regles-vente",
  "abonnement",
  "confidentialite",
];

export default function ParametresPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ReglagesTab | null>(
    initialTab && TAB_ORDER.includes(initialTab as ReglagesTab) ? (initialTab as ReglagesTab) : null
  );

  const handleChange = useCallback(
    (tab: ReglagesTab | null) => {
      setActiveTab(tab);
      const query = tab ? `?tab=${tab}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router]
  );

  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <ReglagesNav active={activeTab} onChange={handleChange} />

          {activeTab === null ? (
            <>
              <ReglagesAccueil onSelectTab={handleChange} first />
              {TAB_ORDER.map((tab) => {
                const Section = SECTIONS[tab];
                return <Section key={tab} />;
              })}
            </>
          ) : (
            (() => {
              const ActiveSection = SECTIONS[activeTab];
              return <ActiveSection first />;
            })()
          )}
        </div>
      </div>
    </div>
  );
}
