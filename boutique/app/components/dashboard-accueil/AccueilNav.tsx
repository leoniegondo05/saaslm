"use client";

import { useDashboardLangue } from "../DashboardLanguageProvider";

export const ACCUEIL_TABS = [
  "Finances",
  "Commandes",
  "Produits",
  "Stock",
  "Clients",
  "Litiges",
  "Partenaire",
] as const;

export type AccueilTab = (typeof ACCUEIL_TABS)[number];

// Les valeurs ci-dessus servent aussi de clé pour SECTIONS (accueil/page.tsx)
// et de valeur d'URL (?tab=...) : elles restent en FR, seul le libellé
// affiché change avec la langue.
export const TAB_LABELS_EN: Record<AccueilTab, string> = {
  Finances: "Finances",
  Commandes: "Orders",
  Clients: "Customers",
  Litiges: "Disputes",
  Stock: "Stock",
  Produits: "Products",
  Partenaire: "Partner",
};

/*
  Barre de navigation par onglets de l'écran Accueil : remplace la barre de
  recherche + le bouton "Analyser ma boutique" (retiré, cf. demande).

  active = null → vue par défaut, toutes les sections empilées (comportement
  d'origine). Cliquer un onglet (Finances, Commandes...) filtre sur cette
  seule section ; "Tout" ramène à la vue empilée.
*/
export default function AccueilNav({
  active,
  onChange,
}: {
  active: AccueilTab | null;
  onChange: (tab: AccueilTab | null) => void;
}) {
  const { t } = useDashboardLangue();
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <NavButton label={t("Tout", "All")} isActive={active === null} onClick={() => onChange(null)} />
      {ACCUEIL_TABS.map((tab) => (
        <NavButton key={tab} label={t(tab, TAB_LABELS_EN[tab])} isActive={tab === active} onClick={() => onChange(tab)} />
      ))}
    </nav>
  );
}

function NavButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition sm:px-3.5 sm:py-2 sm:text-xs ${
        isActive
          ? "bg-[linear-gradient(135deg,var(--color-brand-pink),#2a1668_45%,#1a2a8a_100%)] text-white shadow-[0_8px_24px_rgba(58,29,138,0.28)]"
          : "bg-[var(--dashboard-card-bg)]/70 text-[var(--dashboard-text)]/60 shadow-[0_2px_10px_rgba(20,18,32,0.06)] hover:bg-[var(--dashboard-card-bg)] hover:text-[var(--dashboard-text)]"
      }`}
    >
      {label}
    </button>
  );
}
