"use client";

import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";
import type { ReglagesTab } from "./ReglagesNav";
import { REGLAGES_TABS } from "./ReglagesNav";

/*
  Écran 24 "Réglages · six fiches" : l'écran d'accueil de "Paramètres",
  affiché quand aucun onglet de ReglagesNav n'est choisi. Contrairement à
  l'onglet "Tout" de Produits (qui empile les trois écrans), celui-ci ne
  répète pas les fiches : il donne un raccourci vers chacune et dit
  clairement ce qui ne vit pas ici et pourquoi — exactement le rôle de la
  fiche de référence "les six fiches".
*/

const RACCOURCIS: { tab: ReglagesTab; icon: React.ReactNode; note: string }[] = [
  { tab: "ma-boutique", icon: <HomeIcon />, note: "Personnalisée" },
  { tab: "commande", icon: <DocIcon />, note: "Publiée" },
  { tab: "finances", icon: <WalletIcon />, note: "Franc CFA" },
  { tab: "regles-vente", icon: <ShieldIcon />, note: "4 règles actives" },
  { tab: "abonnement", icon: <CalendarIcon />, note: "25 000 F par mois" },
  { tab: "confidentialite", icon: <LockIcon />, note: "Conforme" },
];

const PAS_ICI = [
  {
    icon: <PersonIcon />,
    title: "Personnel et accès",
    text: "Dans votre profil. Cela regarde les personnes, pas la boutique.",
  },
  {
    icon: <TruckIcon />,
    title: "Le partenaire agréé",
    text: "Il a son propre onglet, avec son contrat et ses tarifs.",
  },
  {
    icon: <TagIcon />,
    title: "Catégories et variantes",
    text: "Elles se créent là où on les utilise, dans Produits.",
  },
  {
    icon: <BellIcon />,
    title: "Les notifications",
    text: "La cloche est en haut de l'écran, avant le partenaire agréé.",
  },
  {
    icon: <ClockIcon />,
    title: "Les jours et heures d'enlèvement",
    text: "Fixés par le partenaire agréé, pas par la boutique.",
  },
  {
    icon: <WalletIcon />,
    title: "Le rythme des règlements",
    text: "Décidé par le partenaire agréé, dans son contrat.",
  },
];

export default function ReglagesAccueil({
  onSelectTab,
  first = false,
}: {
  onSelectTab: (tab: ReglagesTab) => void;
  first?: boolean;
}) {
  return (
    <>
      <SectionHeader
        eyebrow="Réglages"
        title="Ce qui engage la boutique entière, et rien d'autre"
        subtitle="Six fiches. Tout ce qui est déjà réglé ailleurs, ou décidé par le partenaire agréé, ne se recopie pas ici."
        first={first}
        layout="inline"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RACCOURCIS.map(({ tab, icon, note }) => {
          const label = REGLAGES_TABS.find((t) => t.key === tab)?.label ?? tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className="flex items-center gap-3 rounded-2xl card-tint p-4 text-left shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] transition hover:brightness-[0.98]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--dashboard-text)]">{label}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--dashboard-text)]/50">{note}</p>
              </div>
              <ChevronIcon />
            </button>
          );
        })}
      </div>

      <Card title="Ce qui n'est pas ici, et pourquoi" className="!bg-[var(--dashboard-card-bg)] mt-3">
        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {PAS_ICI.map(({ icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                {icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--dashboard-text)]">{title}</p>
                <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink">
          <ShieldCheckIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--dashboard-text)]">Réservé à l&apos;administrateur</p>
          <p className="mt-1 text-xs text-[var(--dashboard-text)]/50">
            Un collaborateur ne voit pas cet onglet dans sa barre de gauche. Ce qui se règle ici
            engage la boutique entière.
          </p>
        </div>
        <Tag tone="pink">Awa K.</Tag>
      </div>
    </>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du dashboard) ── */

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[var(--dashboard-text)]/25" aria-hidden>
      <path d="m9.5 5.5 7 6.5-7 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M4 11.5 12 4l8 7.5M6 9.8V20h12V9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 8.5h17M6.6 6.5h.2M9.2 6.5h.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3" y="6.5" width="18" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15.5" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="4.6" y="10.4" width="14.8" height="9.4" rx="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="9" cy="8.4" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.4 19.6c0-3.3 2.5-5.6 5.6-5.6 1.4 0 2.7.4 3.7 1.2M17.8 13.4v6.2M14.7 16.5h6.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M2.8 16.2V8.4a1 1 0 0 1 1-1h9.4v8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.2 10.4h3.6l3.4 3.2v2.6h-1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.2" cy="17.4" r="1.9" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.6" cy="17.4" r="1.9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M12 3.6 4 7.8v8.4l8 4.2 8-4.2V7.8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 7.8 12 12l8-4.2M12 12v8.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M18 9a6 6 0 1 0-12 0c0 6-2.4 7.4-2.4 7.4h16.8S18 15 18 9z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.8 20a2 2 0 0 1-3.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M12 3.2 5 6v5.6c0 4.2 2.9 7.3 7 9.2 4.1-1.9 7-5 7-9.2V6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9.3 11.9 1.9 1.9 3.6-3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
