"use client";

import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import { useDashboardLangue } from "../../components/DashboardLanguageProvider";

/*
  Onglet "Commande" du dashboard, atteint depuis l'icône dédiée du rail
  (voir DashboardSidebar, entre "Accueil" et "Produits"). Page vide pour
  l'instant — contenu à construire, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

export default function CommandesPage() {
  const { t } = useDashboardLangue();

  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />

          <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-[#141220]/10 text-sm text-[#141220]/50 dark:border-white/10 dark:text-[var(--dashboard-text)]/50">
            {t("Contenu à venir.", "Content coming soon.")}
          </div>
        </div>
      </div>
    </div>
  );
}
