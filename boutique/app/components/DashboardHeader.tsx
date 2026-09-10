"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "../../lib/api/services/auth";
import { clearToken } from "../../lib/api/token";
import { APPAREILS_CONNECTES_COUNT } from "./dashboard-profil/MonProfil";
import { useDashboardTheme } from "./DashboardThemeProvider";
import { useDashboardLangue } from "./DashboardLanguageProvider";

// Compte de collaborateurs actifs affiché sur le bouton "Gérer les accès"
// (voir PersonnelAcces.tsx, /dashboard/parametres/acces) — valeur figée
// tant que l'API Laravel n'expose pas le vrai décompte, cf. mémoire
// [[dashboard-mock-data-pending-laravel-api]].
const PERSONNEL_ACTIF_COUNT = 4;

/*
  Écran 31 "La cloche" : les notifications ne sont plus un réglage, ce
  sont des événements, affichés en haut de l'écran, avant la pastille du
  partenaire agréé. Champs statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/
type CategorieNotif = "commandes" | "litiges" | "argent" | "stock";

const NOTIF_TABS: { key: "tout" | CategorieNotif; label: string }[] = [
  { key: "tout", label: "Tout" },
  { key: "commandes", label: "Commandes" },
  { key: "litiges", label: "Litiges" },
  { key: "argent", label: "Argent" },
  { key: "stock", label: "Stock" },
];

const NOTIF_COULEURS: Record<CategorieNotif, string> = {
  litiges: "#EC0C8C",
  argent: "#178a3f",
  stock: "#2563eb",
  commandes: "#8A90A6",
};

const NOTIFICATIONS_INIT = [
  {
    id: "n1",
    categorie: "litiges" as CategorieNotif,
    titre: "Litige ouvert",
    sousTitre: "C-4819 · Sac cabas en raphia",
    temps: "il y a 12 min",
    lue: false,
  },
  {
    id: "n2",
    categorie: "argent" as CategorieNotif,
    titre: "Règlement effectué",
    sousTitre: "214 000 F vers Orange Money",
    temps: "il y a 2 h",
    lue: false,
  },
  {
    id: "n3",
    categorie: "stock" as CategorieNotif,
    titre: "Dépôt contrôlé",
    sousTitre: "Beurre de karité · 200 reçus, 0 endommagé",
    temps: "il y a 5 h",
    lue: false,
  },
  {
    id: "n4",
    categorie: "stock" as CategorieNotif,
    titre: "Stock bas",
    sousTitre: "Huile de ricin 100 ml · 2 unités restantes",
    temps: "hier",
    lue: true,
  },
  {
    id: "n5",
    categorie: "commandes" as CategorieNotif,
    titre: "Évaluation du mois",
    sousTitre: "À donner avant le 5 septembre",
    temps: "hier",
    lue: true,
  },
  {
    id: "n6",
    categorie: "commandes" as CategorieNotif,
    titre: "Commande livrée",
    sousTitre: "C-4816 · Sandales tressées",
    temps: "hier",
    lue: true,
  },
];

/*
  Barre du haut du dashboard (logo, sélecteur mois/année, badge "solution LM",
  chip partenaire agréé, avatar) — extraite de app/dashboard/page.tsx pour
  être partagée avec app/dashboard/accueil/page.tsx (même en-tête sur les
  deux onglets, cf. maquette : chaque écran garde le même topbar).

  État du sélecteur de mois volontairement local à chaque instance (pas de
  contexte partagé) : rien ne demande aujourd'hui que la période choisie sur
  "Ma journée" et sur "Accueil" reste synchronisée entre les deux pages.
*/

const MONTH_NAMES_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export default function DashboardHeader() {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState(() => new Date(2026, 7, 1));
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  // Langue : état partagé (DashboardLanguageProvider, monté dans
  // app/dashboard/layout.tsx), même pattern que le mode nuit ci-dessous, pour
  // que le bascule agisse sur tout le dashboard et pas juste ce menu.
  const { langue, setLangue, t } = useDashboardLangue();
  const { modeNuit, toggleModeNuit } = useDashboardTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifFiltre, setNotifFiltre] = useState<"tout" | CategorieNotif>("tout");
  const [notifications, setNotifications] = useState(NOTIFICATIONS_INIT);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const nbNonLues = notifications.filter((n) => !n.lue).length;
  const notificationsFiltrees =
    notifFiltre === "tout" ? notifications : notifications.filter((n) => n.categorie === notifFiltre);

  useEffect(() => {
    if (!showAccountMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAccountMenu]);

  useEffect(() => {
    if (!showNotifPanel) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!notifPanelRef.current?.contains(event.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifPanel]);

  const marquerToutLu = () => setNotifications((liste) => liste.map((n) => ({ ...n, lue: true })));
  const marquerLu = (id: string) =>
    setNotifications((liste) => liste.map((n) => (n.id === id ? { ...n, lue: true } : n)));

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

  const monthNames = langue === "EN" ? MONTH_NAMES_EN : MONTH_NAMES_FR;
  const activeMonthIndex = activeDate.getMonth();
  const activeYear = activeDate.getFullYear();
  const visibleMonths = [-1, 0, 1].map((offset) => {
    const d = new Date(activeYear, activeMonthIndex + offset, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, date: d };
  });

  const shiftMonth = (delta: number) => {
    setActiveDate((current) => {
      const next = new Date(current);
      next.setDate(1);
      next.setMonth(current.getMonth() + delta);
      return next;
    });
  };

  const setYear = (year: number) => {
    setActiveDate((current) => {
      const next = new Date(current);
      next.setFullYear(year);
      return next;
    });
    setShowYearPicker(false);
  };

  const setDay = (day: number) => {
    setActiveDate((current) => {
      const next = new Date(current);
      next.setDate(day);
      return next;
    });
    setShowDayPicker(false);
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => activeYear - 2 + i);
  const activeDay = activeDate.getDate();
  const daysInActiveMonth = new Date(activeYear, activeMonthIndex + 1, 0).getDate();
  // Décalage pour aligner le 1er du mois sur sa colonne (grille lun-dim).
  const firstWeekday = (new Date(activeYear, activeMonthIndex, 1).getDay() + 6) % 7;
  const dayOptions = Array.from({ length: daysInActiveMonth }, (_, i) => i + 1);
  const weekdayLabels = langue === "EN" ? ["M", "T", "W", "T", "F", "S", "S"] : ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo.svg"
          alt="Logo LIIVRE MOI"
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 object-contain"
        />

        <div className="relative flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex items-center gap-0.5 rounded-full bg-white/70 p-1 shadow-[0_2px_10px_rgba(20,18,32,0.06)] dark:bg-white/10 sm:gap-1 sm:p-1.5">
            <button
              type="button"
              aria-label={t("Mois précédent", "Previous month")}
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white dark:text-white/50 dark:hover:bg-white/15 sm:h-8 sm:w-8"
            >
              <ChevronIcon direction="left" />
            </button>
            {visibleMonths.map(({ key, date }, index) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (index === 1) {
                    // Mois actif : clic ouvre le picker des jours de ce mois
                    // (au lieu de le faire dépendre de la puce "jour" à part,
                    // qui débordait la navbar, cf. retour utilisateur).
                    setShowDayPicker((open) => !open);
                    setShowYearPicker(false);
                    return;
                  }
                  shiftMonth(index - 1);
                }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition sm:px-4 sm:py-1.5 sm:text-sm ${
                  index === 1
                    ? "bg-white text-[#141220] shadow-[0_2px_8px_rgba(20,18,32,0.1)] dark:bg-white/15 dark:text-[var(--dashboard-text)]"
                    : "hidden text-[#141220]/45 hover:text-[#141220]/70 dark:text-white/40 dark:hover:text-white/70 sm:inline-block"
                }`}
              >
                {monthNames[date.getMonth()]}
              </button>
            ))}
            <button
              type="button"
              aria-label={t("Mois suivant", "Next month")}
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white dark:text-white/50 dark:hover:bg-white/15 sm:h-8 sm:w-8"
            >
              <ChevronIcon direction="right" />
            </button>

            {showDayPicker && (
              <div className="absolute left-0 top-full z-10 mt-2 w-[220px] rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(20,18,32,0.16)] dark:bg-[#1c1830]">
                <p className="mb-2 px-1 text-xs font-semibold text-[#141220]/50 dark:text-white/40">
                  {monthNames[activeMonthIndex]} {activeYear}
                </p>
                <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-[#141220]/40 dark:text-white/40">
                  {weekdayLabels.map((label, i) => (
                    <span key={`${label}-${i}`}>{label}</span>
                  ))}
                  {Array.from({ length: firstWeekday }, (_, i) => (
                    <span key={`empty-${i}`} />
                  ))}
                  {dayOptions.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDay(day)}
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition hover:bg-[#141220]/[0.06] dark:hover:bg-white/10 ${
                        day === activeDay
                          ? "bg-[#141220] text-white dark:bg-brand-pink"
                          : "text-[#141220]/70 dark:text-white/70"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowYearPicker((open) => !open);
              setShowDayPicker(false);
            }}
            className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-[#141220]/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            {activeYear}
          </button>

          {showYearPicker && (
            <div className="absolute left-0 top-full z-10 mt-2 flex flex-col overflow-hidden rounded-2xl bg-white py-1 shadow-[0_8px_24px_rgba(20,18,32,0.16)] dark:bg-[#1c1830]">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setYear(year)}
                  className={`px-5 py-2 text-left text-sm font-medium transition hover:bg-[#141220]/[0.05] dark:hover:bg-white/5 ${
                    year === activeYear ? "text-brand-pink" : "text-[#141220]/70 dark:text-white/70"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      <span className="inline-flex rounded-full bg-[linear-gradient(90deg,var(--color-brand-pink),rgba(20,18,32,0.08))] p-px shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/90 pl-2.5 pr-3.5 py-1.5 text-xs font-medium text-[#141220] dark:bg-[#1c1830]/90 dark:text-[var(--dashboard-text)]">
          <SparkleIcon />
          {t("solution LM", "LM solution")}
        </span>
      </span>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={notifPanelRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={showNotifPanel}
            onClick={() => setShowNotifPanel((open) => !open)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
          >
            <BellIcon />
            {nbNonLues > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[var(--dashboard-bg)] bg-brand-pink px-1 text-[10px] font-bold text-white">
                {nbNonLues}
              </span>
            )}
          </button>

          {showNotifPanel && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-2 w-[340px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_48px_-12px_rgba(20,18,32,0.35)] dark:bg-[#1c1830] sm:w-[400px]"
            >
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-bold text-[var(--dashboard-text)]">Notifications</p>
                  <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/45">
                    {nbNonLues > 0 ? `${nbNonLues} non lue${nbNonLues > 1 ? "s" : ""}` : "Tout est lu"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={marquerToutLu}
                  className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[#141220]/[0.05] dark:hover:bg-white/5"
                >
                  Tout marquer comme lu
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {NOTIF_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNotifFiltre(key)}
                    aria-pressed={notifFiltre === key}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                      notifFiltre === key
                        ? "bg-[#141220] text-white dark:bg-brand-pink"
                        : "bg-[#141220]/[0.05] text-[var(--dashboard-text)]/50 hover:bg-[#141220]/10 dark:bg-white/10 dark:hover:bg-white/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="max-h-[360px] overflow-y-auto border-t border-[#141220]/10 dark:border-white/10">
                {notificationsFiltrees.length === 0 ? (
                  <p className="p-6 text-center text-xs text-[var(--dashboard-text)]/40">
                    Rien à signaler dans cette catégorie.
                  </p>
                ) : (
                  notificationsFiltrees.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => marquerLu(n.id)}
                      className={`flex w-full items-start gap-3 border-b border-[#141220]/[0.04] p-4 text-left transition last:border-0 hover:bg-[#141220]/[0.03] dark:border-white/5 dark:hover:bg-white/5 ${
                        n.lue ? "" : "bg-brand-pink/[0.04]"
                      }`}
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: NOTIF_COULEURS[n.categorie] }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-[var(--dashboard-text)]">{n.titre}</span>
                        <span className="mt-0.5 block text-[11px] text-[var(--dashboard-text)]/50">{n.sousTitre}</span>
                      </span>
                      <span className="shrink-0 text-[10px] text-[var(--dashboard-text)]/40">{n.temps}</span>
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                className="w-full p-3.5 text-center text-xs font-semibold text-[var(--dashboard-text)]/60 transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
              >
                Voir tout l&apos;historique
              </button>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/partenaire-agree"
          className="flex items-center gap-3 rounded-full bg-white/70 p-1.5 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 sm:pr-5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple">
            <BuildingIcon />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-xs text-[#141220]/50 dark:text-white/40">{t("Partenaire agréé", "Approved partner")}</span>
            <span className="block text-sm font-semibold">Groupe Logistique Ivoire</span>
          </span>
        </Link>

        {/* Avatar utilisateur : cliquable, ouvre le menu de compte (profil,
            sécurité, droits, appareils, accès, langue, mode nuit, aide,
            déconnexion) — cf. maquette Figma fournie. */}
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            aria-label={t("Mon compte", "My account")}
            aria-haspopup="menu"
            aria-expanded={showAccountMenu}
            onClick={() => setShowAccountMenu((open) => !open)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
          >
            <UserIcon />
          </button>

          {showAccountMenu && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-2 w-[300px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_48px_-12px_rgba(20,18,32,0.35)] dark:bg-[#1c1830]"
            >
              <Link
                href="/dashboard/profil"
                onClick={() => setShowAccountMenu(false)}
                className="flex items-center gap-3 p-3 transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ background: "linear-gradient(135deg,#EC0C8C,#3A1D8A)" }}
                >
                  <UserIcon className="h-5 w-5 text-white" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">Awa K.</span>
                  <span className="block text-xs text-[#141220]/45 dark:text-white/40">{t("Voir mon profil", "View my profile")}</span>
                </span>
                <ChevronIcon direction="right" />
              </Link>

              <div className="px-2 pb-2">
                <Link
                  href="/dashboard/profil/securite"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
                    <ShieldIcon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t("Mot de passe et sécurité", "Password & security")}</span>
                  <ChevronIcon direction="right" />
                </Link>
                <Link
                  href="/dashboard/profil/droits"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcf5e3] text-[#178a3f]">
                    <UserCheckIcon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t("Mes droits", "My permissions")}</span>
                  <ChevronIcon direction="right" />
                </Link>
                <Link
                  href="/dashboard/profil/appareils"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#1d4ed8]">
                    <DeviceIcon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t("Mes appareils", "My devices")}</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#141220] px-1.5 text-[11px] font-semibold text-white">
                    {APPAREILS_CONNECTES_COUNT}
                  </span>
                  <ChevronIcon direction="right" />
                </Link>
                <Link
                  href="/dashboard/parametres/acces"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffe1e2] text-[#c8262d]">
                    <PersonPlusIcon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t("Gérer les accès", "Manage access")}</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#141220] px-1.5 text-[11px] font-semibold text-white">
                    {PERSONNEL_ACTIF_COUNT}
                  </span>
                  <ChevronIcon direction="right" />
                </Link>
              </div>

              <div className="mx-4 h-px bg-[#141220]/10 dark:bg-white/10" />

              <div className="px-2 py-2">
                <div className="flex items-center gap-3 px-2 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141220]/[0.06] text-[#141220]/60 dark:bg-white/10 dark:text-white/60">
                    <GlobeIcon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t("Langue", "Language")}</span>
                  <div className="flex items-center rounded-full bg-[#141220]/[0.06] p-0.5 text-xs font-semibold dark:bg-white/10">
                    <button
                      type="button"
                      onClick={() => setLangue("FR")}
                      className={`rounded-full px-2.5 py-1 transition ${
                        langue === "FR" ? "bg-[#141220] text-white" : "text-[#141220]/40 dark:text-white/40"
                      }`}
                    >
                      FR
                    </button>
                    <button
                      type="button"
                      onClick={() => setLangue("EN")}
                      className={`rounded-full px-2.5 py-1 transition ${
                        langue === "EN" ? "bg-[#141220] text-white" : "text-[#141220]/40 dark:text-white/40"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
                    <MoonIcon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t("Mode nuit", "Dark mode")}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={modeNuit}
                    onClick={toggleModeNuit}
                    className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                      modeNuit ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[#141220]/20 dark:bg-white/20"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full bg-white shadow" />
                  </button>
                </div>

                <AccountMenuRow
                  icon={<HelpIcon />}
                  iconBg="bg-[#fff1d6] text-[#a8690a]"
                  label={t("Aide", "Help")}
                  onClick={() => setShowAccountMenu(false)}
                />
              </div>

              <div className="mx-4 h-px bg-[#141220]/10 dark:bg-white/10" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#ffe1e2]/40 disabled:opacity-60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffe1e2] text-[#c8262d]">
                  <LogoutIcon />
                </span>
                <span className="text-sm font-semibold text-[#c8262d]">
                  {loggingOut ? t("Déconnexion…", "Signing out…") : t("Se déconnecter", "Sign out")}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
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
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-[#141220]/[0.03] dark:hover:bg-white/5"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#141220] px-1.5 text-[11px] font-semibold text-white">
          {badge}
        </span>
      )}
      <ChevronIcon direction="right" />
    </button>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

export function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d={direction === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon({ className = "text-brand-pink" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`h-4 w-4 ${className}`} aria-hidden>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="white" strokeWidth="1.6" />
      <path
        d="M9 7h1.5M13.5 7H15M9 11h1.5M13.5 11H15M9 15h1.5M13.5 15H15"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
