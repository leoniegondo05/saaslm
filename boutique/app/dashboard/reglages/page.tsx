"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSearchBar from "../../components/DashboardSearchBar";
import DashboardSidebar from "../../components/DashboardSidebar";
import Abonnement from "../../components/dashboard-reglages/Abonnement";
import Confidentialite from "../../components/dashboard-reglages/Confidentialite";
import FinancesReglements from "../../components/dashboard-reglages/FinancesReglements";
import MaBoutique from "../../components/dashboard-reglages/MaBoutique";
import PageDeCommande from "../../components/dashboard-reglages/PageDeCommande";
import ReglagesNav, { REGLAGES_TABS, ReglagesTab } from "../../components/dashboard-reglages/ReglagesNav";
import ReglesDeVente from "../../components/dashboard-reglages/ReglesDeVente";
import { useDashboardLangue } from "../../components/DashboardLanguageProvider";

/*
  Onglet "Réglages" du dashboard, atteint depuis l'icône engrenage du
  rail (voir DashboardSidebar) — même mécanique que l'onglet "Produits"
  (voir app/dashboard/produits/page.tsx) : tab null → tout empilé, tab
  choisi → une seule fiche, via ReglagesNav.

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

export default function ReglagesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useDashboardLangue();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ReglagesTab | null>(
    initialTab && TAB_ORDER.includes(initialTab as ReglagesTab) ? (initialTab as ReglagesTab) : null
  );
  const [recherche, setRecherche] = useState("");

  // Même logique que sur "Accueil" (app/dashboard/accueil/page.tsx) : pas de
  // donnée commune entre les 6 fiches de réglages pour un filtrage plein
  // texte, la recherche filtre donc par titre de fiche.
  const termeRecherche = recherche.trim().toLowerCase();
  const tabsAffiches = termeRecherche
    ? TAB_ORDER.filter((tab) => {
        const meta = REGLAGES_TABS.find((r) => r.key === tab)!;
        return meta.label.toLowerCase().includes(termeRecherche) || meta.labelEn.toLowerCase().includes(termeRecherche);
      })
    : TAB_ORDER;

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
          <DashboardSearchBar onChange={setRecherche} />
          <ReglagesNav active={activeTab} onChange={handleChange} />

          {activeTab === null ? (
            tabsAffiches.length === 0 ? (
              <p className="mt-10 text-center text-xs text-[var(--dashboard-text)]/45">
                {t(`Aucun réglage pour « ${recherche} ».`, `No setting for “${recherche}”.`)}
              </p>
            ) : (
              tabsAffiches.map((tab, index) => {
                const Section = SECTIONS[tab];
                return <Section key={tab} first={index === 0} />;
              })
            )
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
