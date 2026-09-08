"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  Rail de navigation du dashboard (partagé entre "Ma journée" et "Accueil"),
  extrait de app/dashboard/page.tsx pour que les deux pages restent en
  synchro visuelle et que l'icône active suive la route réellement affichée
  (usePathname) au lieu d'un booléen "active" codé en dur par page.

  "Réglages" pointe vers Écran 07 "Personnel et accès" (voir
  app/dashboard/parametres/page.tsx).
*/

const NAV_LINKS = [
  { href: "/dashboard", label: "Ma journée", Icon: SunIcon },
  { href: "/dashboard/accueil", label: "Accueil", Icon: HomeIcon },
  { href: "/dashboard/produits", label: "Produits", Icon: BoxIcon },
] as const;

const REGLAGES = { href: "/dashboard/parametres", label: "Paramètres" } as const;

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 rounded-full border border-white/50 bg-white/40 px-2 py-2 shadow-[0_8px_32px_rgba(20,18,32,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5 lg:inset-auto lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-[90px] lg:shrink-0 lg:rounded-none lg:border-0 lg:border-r lg:border-[#141220]/10 lg:bg-transparent lg:px-3 lg:py-6 lg:shadow-none lg:backdrop-blur-none lg:backdrop-saturate-100 dark:lg:border-white/10">
      <nav className="flex flex-row items-center justify-around gap-2 lg:h-full lg:flex-col lg:justify-between lg:gap-0">
        <div className="flex flex-row items-center justify-around gap-2 lg:flex-1 lg:flex-col lg:justify-center lg:gap-8">
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <SidebarIcon key={href} href={href} label={label} active={pathname === href}>
              <Icon />
            </SidebarIcon>
          ))}
          <SidebarIcon
            href={REGLAGES.href}
            label={REGLAGES.label}
            active={pathname === REGLAGES.href}
            className="lg:hidden"
          >
            <GearIcon />
          </SidebarIcon>
        </div>
        <SidebarIcon
          href={REGLAGES.href}
          label={REGLAGES.label}
          active={pathname === REGLAGES.href}
          className="hidden lg:flex"
        >
          <GearIcon />
        </SidebarIcon>
      </nav>
    </aside>
  );
}

function SidebarIcon({
  label,
  href,
  active,
  children,
  className,
}: {
  label: string;
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const sharedClassName = `flex flex-col items-center gap-1.5 text-[11px] text-[#141220] transition dark:text-[var(--dashboard-text)] ${className ?? ""}`;
  const badge = (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur-md transition lg:backdrop-blur-none ${
        active
          ? "border border-white/60 bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.1)] dark:border-white/10 dark:bg-white/15 lg:border-0 lg:bg-white dark:lg:bg-white/15"
          : "bg-[#141220]/[0.04] hover:bg-[#141220]/[0.08] dark:bg-white/5 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {badge}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={sharedClassName}>
      {badge}
      {label}
    </button>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M4 11.5 12 4l8 7.5M6 9.8V20h12V9.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M3.5 7.5 12 3l8.5 4.5L12 12 3.5 7.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 7.5V16.5L12 21l8.5-4.5V7.5M12 12V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
