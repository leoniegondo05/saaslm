"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "../../lib/api/services/auth";
import { clearToken } from "../../lib/api/token";
import { APPAREILS_CONNECTES_COUNT } from "./dashboard-profil/MonProfil";
import { useDashboardTheme } from "./DashboardThemeProvider";
import { useDashboardLangue } from "./DashboardLanguageProvider";
import { ChevronIcon } from "./DashboardHeader";

// Compte de collaborateurs actifs affiché sur le bouton "Gérer les accès"
// (voir PersonnelAcces.tsx, /dashboard/reglages/acces) — valeur figée
// tant que l'API Laravel n'expose pas le vrai décompte, cf. mémoire
// [[dashboard-mock-data-pending-laravel-api]].
const PERSONNEL_ACTIF_COUNT = 4;

/*
  Rail de navigation du dashboard (partagé entre "Ma journée" et "Accueil"),
  extrait de app/dashboard/page.tsx pour que les deux pages restent en
  synchro visuelle et que l'icône active suive la route réellement affichée
  (usePathname) au lieu d'un booléen "active" codé en dur par page.

  "Réglages" pointe vers Écran 07 "Personnel et accès" (voir
  app/dashboard/reglages/page.tsx).

  Desktop (lg+) : le rail est en `fixed` (jamais en `sticky`) pour ne
  JAMAIS bouger au scroll. Avant, il était en `sticky` à l'intérieur de la
  ligne flex (voir toutes les pages app/dashboard/.../page.tsx) — or cette
  ligne est aussi haute que la colonne de contenu, elle-même souvent plus
  haute que l'écran ; le rail "sticky", plus court que sa ligne, finissait
  donc par décrocher et remonter avec le contenu en fin de scroll (visible
  précisément "quand on scroll pour aller en bas").

  Le rail étant sorti du flux, on rend en plus un espaceur invisible de
  même largeur juste avant lui : c'est lui qui réserve la place dans la
  ligne flex de chaque page, sans avoir à toucher ces ~20 fichiers un par
  un. Le décalage horizontal du rail fixed (classe `lg:left-[...]`
  ci-dessous) est calculé pour coller exactement au bord gauche de cet
  espaceur, donc au conteneur `mx-auto max-w-[1620px] ... lg:pl-3` de
  chaque page — CE SONT LES MÊMES 1620px / 0.75rem (lg:pl-3) que côté
  page : si l'un des deux change un jour, mettre à jour l'autre.
  (Classe Tailwind arbitraire écrite en dur car le JIT scanne le code
  source statiquement — un calc() construit dynamiquement en JS ne
  serait pas détecté.)
*/

const NAV_LINKS = [
  { href: "/dashboard", fr: "Ma journée", en: "My day", Icon: SunIcon },
  { href: "/dashboard/accueil", fr: "Accueil", en: "Home", Icon: HomeIcon },
  { href: "/dashboard/commandes", fr: "Commande", en: "Order", Icon: ClipboardIcon },
  { href: "/dashboard/produits", fr: "Produits", en: "Products", Icon: BoxIcon },
] as const;

 
const REGLAGES = { href: "/dashboard/reglages", fr: "Réglages", en: "Settings" } as const;

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { t } = useDashboardLangue();

  return (
    <>
      {/* Espaceur : occupe la même largeur que le rail dans la ligne flex
          de chaque page, puisque le rail lui-même est en `fixed` (hors
          flux) à partir de lg — voir commentaire plus haut. */}
      <div aria-hidden className="hidden lg:block lg:w-[90px] lg:shrink-0" />
      <aside className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 rounded-full border border-white/50 bg-white/40 px-2 py-2 shadow-[0_8px_32px_rgba(20,18,32,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5 lg:inset-x-auto lg:bottom-8 lg:top-8 lg:left-[max(0px,calc((100vw_-_1620px)/2_+_0.75rem))] lg:w-[90px] lg:rounded-none lg:border-0 lg:border-r lg:border-[#141220]/10 lg:bg-transparent lg:px-3 lg:pt-6 lg:pb-2 lg:shadow-none lg:backdrop-blur-none lg:backdrop-saturate-100 dark:lg:border-white/10 dark:lg:bg-transparent">
        <nav className="flex flex-row items-center justify-around gap-2 lg:h-full lg:flex-col lg:justify-between lg:gap-0">
          <div className="flex flex-row items-center justify-around gap-2 lg:flex-1 lg:flex-col lg:justify-center lg:gap-3">
            {NAV_LINKS.map(({ href, fr, en, Icon }) => (
              <SidebarIcon key={href} href={href} label={t(fr, en)} active={pathname === href}>
                <Icon />
              </SidebarIcon>
            ))}
            <SidebarIcon
              href={REGLAGES.href}
              label={t(REGLAGES.fr, REGLAGES.en)}
              active={pathname === REGLAGES.href}
              className="lg:hidden"
            >
              <GearIcon />
            </SidebarIcon>
            {/* Compte utilisateur : déplacé ici, juste sous "Réglages" (retour
                utilisateur — avant dans DashboardHeader, en haut de la
                navbar). En mobile (ligne), il suit Réglages dans le même
                ordre de lecture ; à partir de lg (colonne), voir plus bas
                pour la version pinée en bas du rail. */}
            <AccountMenuButton className="lg:hidden" />
          </div>
          <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-3">
            <SidebarIcon
              href={REGLAGES.href}
              label={t(REGLAGES.fr, REGLAGES.en)}
              active={pathname === REGLAGES.href}
            >
              <GearIcon />
            </SidebarIcon>
            <AccountMenuButton />
          </div>
        </nav>
      </aside>
    </>
  );
}

/*
  Bouton "Mon compte" : avatar cliquable, ouvre le menu de compte (profil,
  sécurité, droits, appareils, accès, langue, mode nuit, aide, déconnexion)
  — repris tel quel de l'ancienne navbar (DashboardHeader), juste replacé
  ici sous "Réglages" (retour utilisateur). Le panneau s'ouvre vers le
  haut-gauche en mobile (rail en pilule flottante bas d'écran) et vers la
  droite en desktop (rail fixe à gauche), pour ne jamais sortir de l'écran.
*/
function AccountMenuButton({ className }: { className?: string }) {
  const router = useRouter();
  const { langue, setLangue, t } = useDashboardLangue();
  const { modeNuit, toggleModeNuit } = useDashboardTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout(); // appelle aussi clearToken() en cas de succès
    } catch {
      // Backend indisponible ou session déjà expirée : logout() n'a alors
      // pas atteint son clearToken() interne, donc on l'appelle nous-mêmes
      // pour ne jamais laisser un token périmé en localStorage.
      clearToken();
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className={`relative ${className ?? ""}`} ref={menuRef}>
      <button
        type="button"
        aria-label={t("Mon compte", "My account")}
        aria-haspopup="menu"
        aria-expanded={showMenu}
        onClick={() => setShowMenu((open) => !open)}
        className="flex flex-col items-center gap-1 text-[10px] transition"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-md transition hover:bg-[#141220]/[0.08] lg:backdrop-blur-none dark:hover:bg-white/10">
          <UserIcon className="h-4 w-4" />
        </span>
        {t("Mon compte", "My account")}
      </button>

      {showMenu && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-20 mb-2 w-[240px] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_48px_-12px_rgba(20,18,32,0.35)] dark:bg-[#1c1830] lg:bottom-0 lg:right-auto lg:left-full lg:mb-0 lg:ml-2"
        >
          <Link
            href="/dashboard/profil"
            onClick={() => setShowMenu(false)}
            className="flex items-center gap-2 p-2 transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg,#EC0C8C,#3A1D8A)" }}
            >
              <UserIcon className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">Awa K.</span>
              <span className="block text-[10px] text-[#141220]/45 dark:text-[var(--dashboard-text)]/40">{t("Voir mon profil", "View my profile")}</span>
            </span>
            <ChevronIcon direction="right" />
          </Link>

          <div className="px-1.5 pb-1.5">
            <Link
              href="/dashboard/profil/securite"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2.5 rounded-2xl px-1.5 py-1.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
                <ShieldIcon />
              </span>
              <span className="flex-1 text-xs font-medium">{t("Mot de passe et sécurité", "Password & security")}</span>
              <ChevronIcon direction="right" />
            </Link>
            <Link
              href="/dashboard/profil/droits"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2.5 rounded-2xl px-1.5 py-1.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dcf5e3] text-[#178a3f]">
                <UserCheckIcon />
              </span>
              <span className="flex-1 text-xs font-medium">{t("Mes droits", "My permissions")}</span>
              <ChevronIcon direction="right" />
            </Link>
            <Link
              href="/dashboard/profil/appareils"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2.5 rounded-2xl px-1.5 py-1.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#1d4ed8]">
                <DeviceIcon />
              </span>
              <span className="flex-1 text-xs font-medium">{t("Mes appareils", "My devices")}</span>
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#141220] px-1 text-[10px] font-figures-bold text-white">
                {APPAREILS_CONNECTES_COUNT}
              </span>
              <ChevronIcon direction="right" />
            </Link>
            <Link
              href="/dashboard/reglages/acces"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2.5 rounded-2xl px-1.5 py-1.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffe1e2] text-[#c8262d]">
                <PersonPlusIcon />
              </span>
              <span className="flex-1 text-xs font-medium">{t("Gérer les accès", "Manage access")}</span>
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#141220] px-1 text-[10px] font-figures-bold text-white">
                {PERSONNEL_ACTIF_COUNT}
              </span>
              <ChevronIcon direction="right" />
            </Link>
          </div>

          <div className="mx-3.5 h-px bg-[#141220]/10 dark:bg-white/10" />

          <div className="px-1.5 py-1.5">
            <div className="flex items-center gap-2.5 px-1.5 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#141220]/[0.06] text-[#141220]/60 dark:bg-white/10 dark:text-[var(--dashboard-text)]/60">
                <GlobeIcon />
              </span>
              <span className="flex-1 text-xs font-medium">{t("Langue", "Language")}</span>
              <div className="flex items-center rounded-full bg-[#141220]/[0.06] p-0.5 text-[11px] font-semibold dark:bg-white/10">
                <button
                  type="button"
                  onClick={() => setLangue("FR")}
                  className={`rounded-full px-2 py-0.5 transition ${
                    langue === "FR" ? "bg-[#141220] text-white" : "text-[#141220]/40 dark:text-[var(--dashboard-text)]/40"
                  }`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLangue("EN")}
                  className={`rounded-full px-2 py-0.5 transition ${
                    langue === "EN" ? "bg-[#141220] text-white" : "text-[#141220]/40 dark:text-[var(--dashboard-text)]/40"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-1.5 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
                <MoonIcon />
              </span>
              <span className="flex-1 text-xs font-medium">{t("Mode nuit", "Dark mode")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={modeNuit}
                onClick={toggleModeNuit}
                className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
                  modeNuit ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[#141220]/20 dark:bg-white/20"
                }`}
              >
                <span className="h-4 w-4 rounded-full bg-white shadow" />
              </button>
            </div>

            <AccountMenuRow
              icon={<HelpIcon />}
              iconBg="bg-[#fff1d6] text-[#a8690a]"
              label={t("Aide", "Help")}
              onClick={() => setShowMenu(false)}
            />
          </div>

          <div className="mx-3.5 h-px bg-[#141220]/10 dark:bg-white/10" />

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition hover:bg-[#ffe1e2]/40 disabled:opacity-60"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffe1e2] text-[#c8262d]">
              <LogoutIcon />
            </span>
            <span className="text-xs font-semibold text-[#c8262d]">
              {loggingOut ? t("Déconnexion…", "Signing out…") : t("Se déconnecter", "Sign out")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function AccountMenuRow({
  icon,
  iconBg,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-2xl px-1.5 py-1.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </span>
      <span className="flex-1 text-xs font-medium">{label}</span>
      {badge && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#141220] px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
      <ChevronIcon direction="right" />
    </button>
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
  const sharedClassName = `flex flex-col items-center gap-1 text-[10px] transition ${className ?? ""}`;
  const badge = (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-md transition lg:backdrop-blur-none ${
        active
          ? "border border-white/60 bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.1)] dark:border-white/10 dark:bg-white/15 lg:border-0 lg:bg-white dark:lg:bg-white/15"
          : "bg-transparent hover:bg-[#141220]/[0.08] dark:hover:bg-white/10"
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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
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

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 4.5V3.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 3.8v.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
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

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9.2 12 1.9 1.9 3.7-3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="10" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 19.5c1-3.2 3.5-5 5.5-5s3.4 1 4.4 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m15.5 12.5 1.7 1.7 3-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 19.5h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PersonPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="9.5" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19.5c1-3.2 3.5-5 6-5s5 1.8 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18.5 8v5.5M15.75 10.75h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.8 9.3a2.3 2.3 0 1 1 3.4 2c-.9.55-1.2 1-1.2 1.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.7" r="1" fill="currentColor" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M15.5 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12H21M17.5 8.5 21 12l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
