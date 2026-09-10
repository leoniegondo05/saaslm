"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSearchBar from "../../components/DashboardSearchBar";
import DashboardSidebar from "../../components/DashboardSidebar";
import CommandesListe from "../../components/dashboard-commandes/CommandesListe";
import CommandesNav, { CommandesTab } from "../../components/dashboard-commandes/CommandesNav";
import LireUneLigne from "../../components/dashboard-commandes/LireUneLigne";

/*
  Onglet "Commande" du dashboard, atteint depuis l'icône dédiée du rail
  (voir DashboardSidebar, entre "Accueil" et "Produits") — même mécanique
  que "Produits" et "Réglages" : tab null → les deux fiches empilées,
  tab choisi → une seule fiche, via CommandesNav.
*/

const SECTIONS: Record<CommandesTab, React.ComponentType<{ first?: boolean; recherche?: string }>> = {
  commandes: CommandesListe,
  "lire-une-ligne": LireUneLigne,
};

const TAB_ORDER: CommandesTab[] = ["commandes", "lire-une-ligne"];

export default function CommandesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<CommandesTab | null>(
    initialTab && TAB_ORDER.includes(initialTab as CommandesTab) ? (initialTab as CommandesTab) : null
  );
  const [recherche, setRecherche] = useState("");

  const handleChange = useCallback(
    (tab: CommandesTab | null) => {
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
          <CommandesNav active={activeTab} onChange={handleChange} />

          {activeTab === null ? (
            <>
              {TAB_ORDER.map((tab, index) => {
                const Section = SECTIONS[tab];
                return <Section key={tab} first={index === 0} recherche={recherche} />;
              })}
            </>
          ) : (
            (() => {
              const ActiveSection = SECTIONS[activeTab];
              return <ActiveSection first recherche={recherche} />;
            })()
          )}
        </div>
      </div>
    </div>
  );
}
