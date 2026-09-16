"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSearchBar from "../../components/DashboardSearchBar";
import DashboardSidebar from "../../components/DashboardSidebar";
import CommandesListe from "../../components/dashboard-commandes/CommandesListe";
import CommandesNav, { CommandesTab } from "../../components/dashboard-commandes/CommandesNav";
import LireUneLigne from "../../components/dashboard-commandes/LireUneLigne";
import { SectionSkeleton } from "../../components/dashboard-accueil/shared";
import { COMMANDES_ASSISTANCE_QUESTIONS } from "../../components/dashboard-accueil/assistanceQuestions";

/*
  Onglet "Commande" du dashboard, atteint depuis l'icône dédiée du rail
  (voir DashboardSidebar, entre "Accueil" et "Produits") — même mécanique
  que "Produits" et "Réglages" : tab null → les deux fiches empilées,
  tab choisi → une seule fiche, via CommandesNav.
*/

const SECTIONS: Record<CommandesTab, React.ComponentType<{ first?: boolean; recherche?: string; activeDate?: Date }>> = {
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
  // Même défaut/pattern que app/dashboard/accueil/page.tsx : levé ici pour
  // être redescendu à CommandesListe (montants mock + libellés "Aujourd'hui"/
  // "Hier") et à LireUneLigne (libellé de date de son exemple), cf.
  // [[dashboard-mock-data-pending-laravel-api]]. LireUneLigne garde ses
  // commandes d'exemple figées — fiche pédagogique — mais la date affichée
  // suit désormais le sélecteur, comme partout ailleurs dans le dashboard.
  const [activeDate, setActiveDate] = useState(() => new Date(2026, 7, 1));

  // Même skeleton temporaire que app/dashboard/accueil/page.tsx (mock
  // statique, cf. [[dashboard-mock-data-pending-laravel-api]]).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

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
          <DashboardHeader
            activeDate={activeDate}
            onActiveDateChange={setActiveDate}
            pageQuestions={COMMANDES_ASSISTANCE_QUESTIONS}
            pageLabel={{ fr: "Commandes", en: "Orders" }}
          />
          <DashboardSearchBar onChange={setRecherche} />
          <CommandesNav active={activeTab} onChange={handleChange} />

          {loading ? (
            activeTab === null ? (
              <>
                {TAB_ORDER.map((tab, index) => (
                  <SectionSkeleton key={tab} first={index === 0} />
                ))}
              </>
            ) : (
              <SectionSkeleton first />
            )
          ) : activeTab === null ? (
            <>
              {TAB_ORDER.map((tab, index) => {
                const Section = SECTIONS[tab];
                return <Section key={tab} first={index === 0} recherche={recherche} activeDate={activeDate} />;
              })}
            </>
          ) : (
            (() => {
              const ActiveSection = SECTIONS[activeTab];
              return <ActiveSection first recherche={recherche} activeDate={activeDate} />;
            })()
          )}
        </div>
      </div>
    </div>
  );
}
