export const REGLAGES_TABS = [
  { key: "ma-boutique", label: "Ma boutique" },
  { key: "commande", label: "Page de commande" },
  { key: "finances", label: "Finances et règlements" },
  { key: "regles-vente", label: "Mes règles de vente" },
  { key: "abonnement", label: "Abonnement" },
  { key: "confidentialite", label: "Confidentialité" },
] as const;

export type ReglagesTab = (typeof REGLAGES_TABS)[number]["key"];

/*
  Barre d'onglets de l'onglet "Paramètres" du rail (voir DashboardSidebar) —
  même mécanique que ProduitsNav (dashboard-produits/ProduitsNav.tsx) :
  active = null → toutes les fiches s'affichent empilées, cliquer un onglet
  filtre sur cette seule fiche. "Personnel et accès" (dans le profil) et
  "Le partenaire agréé" (son propre onglet sous Produits) ne sont pas des
  fiches d'ici — ce sont des liens sortants, cf. la fiche "Ma boutique".
*/
export default function ReglagesNav({
  active,
  onChange,
}: {
  active: ReglagesTab | null;
  onChange: (tab: ReglagesTab | null) => void;
}) {
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <NavButton label="Tout" isActive={active === null} onClick={() => onChange(null)} />
      {REGLAGES_TABS.map(({ key, label }) => (
        <NavButton key={key} label={label} isActive={key === active} onClick={() => onChange(key)} />
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
