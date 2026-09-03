export const PRODUITS_TABS = [
  { key: "mes-produits", label: "Mes produits" },
  { key: "partenaire", label: "Partenaire agréé" },
  { key: "catalogue", label: "Catalogue drop" },
] as const;

export type ProduitsTab = (typeof PRODUITS_TABS)[number]["key"];

/*
  Barre d'onglets de l'onglet "Produits" du rail (voir DashboardSidebar) —
  même mécanique que AccueilNav (dashboard-accueil/AccueilNav.tsx) :
  active = null → tout s'affiche empilé (Mes produits, Partenaire agréé,
  Catalogue drop, dans cet ordre) ; cliquer un onglet filtre sur cette seule
  section. C'est ce que l'on voit d'abord en cliquant "Produits" dans le
  rail, avant même de cliquer un bouton.
*/
export default function ProduitsNav({
  active,
  onChange,
}: {
  active: ProduitsTab | null;
  onChange: (tab: ProduitsTab | null) => void;
}) {
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <NavButton label="Tout" isActive={active === null} onClick={() => onChange(null)} />
      {PRODUITS_TABS.map(({ key, label }) => (
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
          : "bg-white/70 text-[#141220]/60 shadow-[0_2px_10px_rgba(20,18,32,0.06)] hover:bg-white hover:text-[#141220]"
      }`}
    >
      {label}
    </button>
  );
}
