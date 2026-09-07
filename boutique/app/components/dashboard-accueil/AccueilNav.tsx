export const ACCUEIL_TABS = [
  "Finances",
  "Commandes",
  "Clients",
  "Acquisition",
  "Stock",
  "Produits",
  "Alertes",
] as const;

export type AccueilTab = (typeof ACCUEIL_TABS)[number];

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
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <NavButton label="Tout" isActive={active === null} onClick={() => onChange(null)} />
      {ACCUEIL_TABS.map((tab) => (
        <NavButton key={tab} label={tab} isActive={tab === active} onClick={() => onChange(tab)} />
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
      className={`rounded-full px-4 py-2.5 text-xs font-semibold transition sm:px-5 sm:text-sm ${
        isActive
          ? "bg-[linear-gradient(135deg,var(--color-brand-pink),#2a1668_45%,#1a2a8a_100%)] text-white shadow-[0_8px_24px_rgba(58,29,138,0.28)]"
          : "bg-[var(--dashboard-card-bg)]/70 text-[var(--dashboard-text)]/60 shadow-[0_2px_10px_rgba(20,18,32,0.06)] hover:bg-[var(--dashboard-card-bg)] hover:text-[var(--dashboard-text)]"
      }`}
    >
      {label}
    </button>
  );
}
