"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import ProduitsCatalogue from "../../components/dashboard-accueil/ProduitsCatalogue";
import CatalogueDrop from "../../components/dashboard-produits/CatalogueDrop";
import PartenaireAgree from "../../components/dashboard-produits/PartenaireAgree";
import ProduitsNav, { ProduitsTab } from "../../components/dashboard-produits/ProduitsNav";

/*
  Onglet "Produits" du dashboard, atteint depuis l'icône "Produits" du rail
  (voir DashboardSidebar) : un seul écran qui réunit les trois écrans de la
  maquette (03 "Mes produits", 04 "Partenaire agréé", 05 "Catalogue drop"),
  filtrables via ProduitsNav — même mécanique que l'onglet "Accueil"
  (voir app/dashboard/accueil/page.tsx) : tab null → tout empilé, tab
  choisi → une seule section.

  Cliquer l'icône "Produits" (pas de ?tab dans l'URL) affiche donc tout
  d'abord ; les liens qui pointent vers une section précise (chip
  "Partenaire agréé" du header, bouton "Voir le catalogue"...) passent
  ?tab=... pour ouvrir directement sur celle-ci.

  Écran 06 "La fiche d'un produit drop" reste une page à part
  (/dashboard/produits/catalogue/[slug]) : c'est un détail par produit, pas
  une section qu'on empile.
*/

const SECTIONS: Record<ProduitsTab, React.ComponentType<{ first?: boolean }>> = {
  "mes-produits": ProduitsCatalogue,
  partenaire: PartenaireAgree,
  catalogue: CatalogueDrop,
};

const TAB_ORDER: ProduitsTab[] = ["mes-produits", "partenaire", "catalogue"];

export default function ProduitsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ProduitsTab | null>(
    initialTab && TAB_ORDER.includes(initialTab as ProduitsTab) ? (initialTab as ProduitsTab) : null
  );

  // Onglet cliqué change bien la vue, mais laissait l'URL figée sur le
  // ?tab= d'arrivée (ex. lien "Voir le catalogue" -> ?tab=catalogue) :
  // un refresh relisait cette URL et ramenait toujours sur ce même onglet,
  // quel que soit celui affiché au moment du refresh. On garde l'URL
  // synchronisée à chaque changement (replace, pas de nouvelle entrée
  // d'historique) pour que le refresh retrouve l'onglet réellement affiché.
  const handleChange = useCallback(
    (tab: ProduitsTab | null) => {
      setActiveTab(tab);
      const query = tab ? `?tab=${tab}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router]
  );

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,#f4e9f3_0%,#efe2ee_45%,#e8dbe9_100%)] font-sans text-[#141220] antialiased">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <ProduitsNav active={activeTab} onChange={handleChange} />

          {activeTab === null
            ? TAB_ORDER.map((tab, index) => {
                const Section = SECTIONS[tab];
                return <Section key={tab} first={index === 0} />;
              })
            : (() => {
                const ActiveSection = SECTIONS[activeTab];
                return <ActiveSection />;
              })()}
        </div>
      </div>
    </div>
  );
}
