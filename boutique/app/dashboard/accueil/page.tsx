"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import AccueilNav, { ACCUEIL_TABS, AccueilTab } from "../../components/dashboard-accueil/AccueilNav";
import FinancesSection from "../../components/dashboard-accueil/FinancesSection";
import CommandesSection from "../../components/dashboard-accueil/CommandesSection";
import ClientsSection from "../../components/dashboard-accueil/ClientsSection";
import AcquisitionSection from "../../components/dashboard-accueil/AcquisitionSection";
import StockSection from "../../components/dashboard-accueil/StockSection";
import ProduitsSection from "../../components/dashboard-accueil/ProduitsSection";
import AlertesSection from "../../components/dashboard-accueil/AlertesSection";

/*
  Onglet "Accueil" du dashboard boutique : le tableau de données complet
  (finances, commandes, clients, acquisition, stock, produits, alertes),
  atteint depuis l'icône "Accueil" du rail (voir DashboardSidebar).

  Chaque thématique était auparavant empilée sur une seule page géante —
  éclaté ici en un composant par section (app/components/dashboard-accueil/)
  + AccueilNav. Par défaut ("Tout", activeTab null) les sections restent
  empilées comme avant ; cliquer un onglet filtre sur cette seule section
  (barre de recherche et bouton "Analyser ma boutique" retirés, remplacés par
  ces onglets).

  Même fond et même ossature que "Ma journée" (app/dashboard/page.tsx) —
  dégradé clair bg-[radial-gradient(...)], rail + en-tête partagés — pour
  que les deux onglets restent visuellement un seul et même dashboard.
  Contenu traduit du dossier de maquettes fourni ("Écran 02 · Accueil") :
  mêmes libellés et mêmes chiffres, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]], ces chiffres sont statiques
  en attendant l'API Laravel.
*/

const SECTIONS: Record<AccueilTab, React.ComponentType<{ first?: boolean }>> = {
  Finances: FinancesSection,
  Commandes: CommandesSection,
  Clients: ClientsSection,
  Acquisition: AcquisitionSection,
  Stock: StockSection,
  Produits: ProduitsSection,
  Alertes: AlertesSection,
};

export default function AccueilPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<AccueilTab | null>(
    initialTab && (ACCUEIL_TABS as readonly string[]).includes(initialTab) ? (initialTab as AccueilTab) : null
  );

  // Même bug que sur /dashboard/produits (cf. commentaire dans ce fichier
  // avant ce correctif) : le clic d'onglet ne touchait pas l'URL, donc un
  // refresh perdait toujours l'onglet actif et retombait sur "Tout". On lit
  // le tab depuis ?tab= au montage et on la resynchronise à chaque clic.
  const handleChange = useCallback(
    (tab: AccueilTab | null) => {
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

          <AccueilNav active={activeTab} onChange={handleChange} />

          {activeTab === null
            ? ACCUEIL_TABS.map((tab, index) => {
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
