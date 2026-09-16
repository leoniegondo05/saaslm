"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDashboardLangue } from "./DashboardLanguageProvider";
import { useDashboardBoutiqueLogo } from "./DashboardBoutiqueLogoProvider";
import type { AccueilTab } from "./dashboard-accueil/AccueilNav";
import type { ReglagesTab } from "./dashboard-reglages/ReglagesNav";
import AssistanceLMModal from "./dashboard-accueil/AssistanceLMModal";
import type { AssistanceQuestion } from "./dashboard-accueil/assistanceQuestions";

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
  chip partenaire agréé, icône boutique) — extraite de app/dashboard/page.tsx pour
  être partagée avec app/dashboard/accueil/page.tsx (même en-tête sur les
  deux onglets, cf. maquette : chaque écran garde le même topbar).

  État du sélecteur de mois local par défaut (pas de contexte partagé) :
  rien ne demande que la période choisie sur "Ma journée" et sur "Accueil"
  reste synchronisée entre les deux pages. app/dashboard/accueil/page.tsx le
  contrôle malgré tout via `activeDate`/`onActiveDateChange` (cf. props
  ci-dessous), pour redescendre la période choisie à ses 7 sections et faire
  varier leurs chiffres mock en fonction — cf. [[dashboard-mock-data-pending-laravel-api]].
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

export default function DashboardHeader({
  activeAccueilTab = null,
  activeReglagesTab,
  pageQuestions,
  pageLabel,
  activeDate: controlledDate,
  onActiveDateChange,
}: {
  /**
   * Onglet actif de l'écran Accueil (AccueilNav), passé par
   * app/dashboard/accueil/page.tsx : détermine si "solution LM" ouvre les
   * questions d'une seule section ou le briefing des 7. Sur toute autre
   * page du dashboard (pas de notion d'onglet-section), reste à null →
   * le bouton ouvre le briefing, cf. AssistanceLMModal.tsx — sauf si
   * `pageQuestions` est passé (voir plus bas).
   */
  activeAccueilTab?: AccueilTab | null;
  /**
   * Onglet actif de l'écran Réglages (ReglagesNav), passé par
   * app/dashboard/reglages/page.tsx uniquement : bascule "solution LM" sur
   * les questions des 6 fiches Réglages plutôt que sur activeAccueilTab
   * (undefined sur toute autre page → ignoré, cf. AssistanceLMModal.tsx).
   */
  activeReglagesTab?: ReglagesTab | null;
  /**
   * Liste de questions propre à une page sans onglet (Demandes,
   * Partenaire agréé — voir assistanceQuestions.ts,
   * DEMANDES_ASSISTANCE_QUESTIONS / PARTENAIRE_AGREE_ASSISTANCE_QUESTIONS) :
   * évite que "solution LM" y retombe sur le briefing des 7 sections
   * Accueil (retour utilisateur du 2026-09-16). `pageLabel` est le titre
   * FR/EN affiché dans le sous-titre du panneau (cf. AssistanceLMModal.tsx).
   */
  pageQuestions?: AssistanceQuestion[];
  pageLabel?: { fr: string; en: string };
  /**
   * Période sélectionnée, contrôlée par le parent (ex. app/dashboard/accueil/page.tsx,
   * qui la redescend à ses 7 sections pour faire varier leurs chiffres mock
   * selon l'année/mois/jour choisi). Sans ces deux props, le sélecteur reste
   * géré en interne (état local), comportement historique de "Ma journée".
   */
  activeDate?: Date;
  onActiveDateChange?: (date: Date) => void;
}) {
  const [localDate, setLocalDate] = useState(() => new Date());
  const activeDate = controlledDate ?? localDate;
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonthIndex = today.getMonth();
  const todayDay = today.getDate();
  // Bloque toute navigation vers un mois/jour futur (retour utilisateur :
  // on ne doit pas pouvoir consulter "demain", seulement le passé et
  // aujourd'hui).
  const clampToToday = (date: Date) => {
    if (
      date.getFullYear() > todayYear ||
      (date.getFullYear() === todayYear && date.getMonth() > todayMonthIndex)
    ) {
      return new Date(todayYear, todayMonthIndex, todayDay);
    }
    if (
      date.getFullYear() === todayYear &&
      date.getMonth() === todayMonthIndex &&
      date.getDate() > todayDay
    ) {
      return new Date(todayYear, todayMonthIndex, todayDay);
    }
    return date;
  };
  const setActiveDate = (updater: Date | ((current: Date) => Date)) => {
    const raw = typeof updater === "function" ? (updater as (current: Date) => Date)(activeDate) : updater;
    const next = clampToToday(raw);
    if (onActiveDateChange) onActiveDateChange(next);
    else setLocalDate(next);
  };
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);
  // Langue : état partagé (DashboardLanguageProvider, monté dans
  // app/dashboard/layout.tsx), même pattern que le mode nuit ci-dessous, pour
  // que le bascule agisse sur tout le dashboard et pas juste ce menu.
  const { langue, t } = useDashboardLangue();
  const { logo: boutiqueLogo } = useDashboardBoutiqueLogo();

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifFiltre, setNotifFiltre] = useState<"tout" | CategorieNotif>("tout");
  const [notifications, setNotifications] = useState(NOTIFICATIONS_INIT);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const nbNonLues = notifications.filter((n) => !n.lue).length;
  const notificationsFiltrees =
    notifFiltre === "tout" ? notifications : notifications.filter((n) => n.categorie === notifFiltre);

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

  const monthNames = langue === "EN" ? MONTH_NAMES_EN : MONTH_NAMES_FR;
  const activeMonthIndex = activeDate.getMonth();
  const activeYear = activeDate.getFullYear();
  const isCurrentMonth = activeYear === todayYear && activeMonthIndex === todayMonthIndex;
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

  const yearOptions = Array.from({ length: 5 }, (_, i) => activeYear - 2 + i).filter((year) => year <= todayYear);
  const activeDay = activeDate.getDate();
  const daysInActiveMonth = new Date(activeYear, activeMonthIndex + 1, 0).getDate();
  // Décalage pour aligner le 1er du mois sur sa colonne (grille lun-dim).
  const firstWeekday = (new Date(activeYear, activeMonthIndex, 1).getDay() + 6) % 7;
  const dayOptions = Array.from({ length: daysInActiveMonth }, (_, i) => i + 1);
  const weekdayLabels = langue === "EN" ? ["M", "T", "W", "T", "F", "S", "S"] : ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      {/* Ligne 1 mobile : logo+date d'un côté, icônes (notif/partenaire/user)
          de l'autre, jamais coupée entre elles (retour utilisateur : tout
          info importante, doit tenir sur 1 ligne en mobile). À partir de sm,
          "contents" efface ce wrapper : logo+date et icônes redeviennent 2
          enfants directs du header (layout desktop inchangé). Le badge
          "solution LM" ne fait plus partie de cette ligne : il est `fixed`,
          hors flux, cf. commentaire plus bas. */}
      <div className="flex w-full items-center justify-between gap-3 sm:contents">
        <div className="flex items-center gap-2.5 sm:order-1">
        <Image
          src="/images/logo.svg"
          alt="Logo LIIVRE MOI"
          width={44}
          height={44}
          className="h-8 w-8 shrink-0 object-contain sm:h-11 sm:w-11"
        />

        <div className="relative flex items-center gap-1.5 sm:gap-2">
          {/* Anneau de contour en 1px (bg + p-px), même épaisseur que le
              badge "solution LM" ci-dessous (cf. retour utilisateur). */}
          <div className="relative rounded-full bg-[#141220]/10 p-px dark:bg-white/15">
            <div className="flex items-center gap-0.5 rounded-full bg-white/70 p-0.5 dark:bg-white/10 sm:gap-1 sm:p-1">
              <button
                type="button"
                aria-label={t("Mois précédent", "Previous month")}
                onClick={() => shiftMonth(-1)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white dark:text-[var(--dashboard-text)]/50 dark:hover:bg-white/15 sm:h-6 sm:w-6"
              >
                <ChevronIcon direction="left" />
              </button>
              {visibleMonths.map(({ key, date }, index) => (
                <button
                  key={key}
                  type="button"
                  disabled={index === 2 && isCurrentMonth}
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
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium transition sm:px-2.5 sm:py-1 sm:text-[11px] ${
                    index === 1
                      ? "bg-white text-[#141220] shadow-[0_2px_8px_rgba(20,18,32,0.1)] dark:bg-white/15 dark:text-[var(--dashboard-text)]"
                      : "hidden text-[#141220]/45 hover:text-[#141220]/70 dark:text-[var(--dashboard-text)]/40 dark:hover:text-[var(--dashboard-text)]/70 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-[#141220]/45 sm:inline-block"
                  }`}
                >
                  {monthNames[date.getMonth()]}
                </button>
              ))}
              <button
                type="button"
                aria-label={t("Mois suivant", "Next month")}
                onClick={() => shiftMonth(1)}
                disabled={isCurrentMonth}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:text-[var(--dashboard-text)]/50 dark:hover:bg-white/15 sm:h-6 sm:w-6"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>

            {showDayPicker && (
              <div className="absolute left-0 top-full z-10 mt-2 w-[220px] rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(20,18,32,0.16)] dark:bg-[#1c1830]">
                <p className="mb-2 px-1 text-xs font-semibold text-[#141220]/50 dark:text-[var(--dashboard-text)]/40">
                  {monthNames[activeMonthIndex]} {activeYear}
                </p>
                <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-[#141220]/40 dark:text-[var(--dashboard-text)]/40">
                  {weekdayLabels.map((label, i) => (
                    <span key={`${label}-${i}`}>{label}</span>
                  ))}
                  {Array.from({ length: firstWeekday }, (_, i) => (
                    <span key={`empty-${i}`} />
                  ))}
                  {dayOptions.map((day) => {
                    const isFuture = isCurrentMonth && day > todayDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isFuture}
                        onClick={() => setDay(day)}
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition hover:bg-[#141220]/[0.06] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-white/10 ${
                          day === activeDay
                            ? "bg-[#141220] text-white dark:bg-brand-pink"
                            : "text-[#141220]/70 dark:text-[var(--dashboard-text)]/70"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Même anneau 1px que le sélecteur de mois ci-dessus. */}
          <span className="shrink-0 rounded-full bg-[#141220]/10 p-px shadow-[0_2px_10px_rgba(20,18,32,0.06)] dark:bg-white/15">
            <button
              type="button"
              onClick={() => {
                setShowYearPicker((open) => !open);
                setShowDayPicker(false);
              }}
              className="block rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-[#141220]/70 transition hover:bg-white dark:bg-white/10 dark:text-[var(--dashboard-text)]/70 dark:hover:bg-white/15 sm:px-2 sm:py-1 sm:text-[11px]"
            >
              {activeYear}
            </button>
          </span>

          {showYearPicker && (
            <div className="absolute left-0 top-full z-10 mt-2 flex flex-col overflow-hidden rounded-2xl bg-white py-1 shadow-[0_8px_24px_rgba(20,18,32,0.16)] dark:bg-[#1c1830]">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setYear(year)}
                  className={`px-5 py-2 text-left text-sm font-medium transition hover:bg-[#141220]/[0.05] dark:hover:bg-white/5 ${
                    year === activeYear ? "text-brand-pink" : "text-[#141220]/70 dark:text-[var(--dashboard-text)]/70"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Icônes : notif, partenaire agréé, avatar. Reste dans le même
          wrapper que logo+date en mobile (ligne 1, justify-between) ;
          sm:order-3 la remet à droite du badge en desktop. */}
      <div className="flex items-center gap-1.5 sm:order-3 sm:gap-2 lg:gap-4">
        <div className="relative" ref={notifPanelRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={showNotifPanel}
            onClick={() => setShowNotifPanel((open) => !open)}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
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
          className="flex items-center gap-1.5 rounded-full bg-white/70 p-1 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 sm:pr-3.5"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple">
            <BuildingIcon />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[10px] text-[#141220]/50 dark:text-[var(--dashboard-text)]/40">{t("Partenaire agréé", "Approved partner")}</span>
            <span className="block text-[11px] font-semibold">Groupe Logistique Ivoire</span>
          </span>
        </Link>

        {/* Logo de la boutique connectée : accès direct à la fiche "Ma
            boutique" (Réglages), où il est déposé — voir MaBoutique.tsx et
            DashboardBoutiqueLogoProvider.tsx. Pas encore de logo déposé
            (mock, aucun endpoint Laravel) : repli sur l'icône générique
            ShopIcon. Le bouton de compte (avatar, menu
            profil/sécurité/déconnexion…) a été déplacé dans le rail de nav,
            sous l'icône Réglages — voir DashboardSidebar.tsx. */}
        <Link
          href="/dashboard/reglages?tab=ma-boutique"
          aria-label={t("Ma boutique", "My shop")}
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
        >
          {boutiqueLogo ? (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
            <img src={boutiqueLogo} alt="" className="h-full w-full object-cover" />
          ) : (
            <ShopIcon />
          )}
        </Link>
      </div>
      </div>

      {/* Espaceur mobile : le badge "solution LM" est `fixed` (hors flux,
          voir plus bas) donc ne pousse plus rien en dessous — sans lui, la
          barre de recherche (DashboardSearchBar, posée juste après ce
          header) ou le titre "Bonjour Awa" (Ma journée) remontaient sous le
          badge flottant (retour utilisateur : "trop collé à la barre de
          recherche en mode mobile"). Réserve donc ici la hauteur que le
          badge occupait avant (sa propre ligne + le gap-3 du header), pour
          revenir à l'espacement d'origine. Uniquement en mobile : à partir
          de sm, le badge partageait déjà la ligne logo/icônes (pas de
          hauteur en plus à réserver). */}
      <div className="h-12 w-full sm:hidden" aria-hidden />

      {/* Bouton "solution LM" : `fixed` (jamais `sticky`) pour rester
          visible EN PERMANENCE quel que soit le défilement, y compris tout
          en bas de page — même piège déjà rencontré et documenté sur le
          rail de nav (voir DashboardSidebar.tsx) : un `sticky` posé dans
          cette colonne de contenu, souvent plus haute que l'écran, finit
          par décrocher et remonter avec le contenu en fin de scroll.

          Repositionné "au milieu, là où il était" (retour utilisateur, la
           1ère version en haut-à-droite ne convenait pas) : le wrapper ci-
          dessous reprend toute la largeur de l'écran juste pour centrer le
          badge (flex + justify-center), `lg:pl-[90px]` compensant la
          largeur du rail desktop (DashboardSidebar) pour centrer dans la
          colonne de contenu et non tout l'écran — ce wrapper est
          `pointer-events-none` (il ne doit rien bloquer sous lui) et seul
          le badge repasse en `pointer-events-auto`. Décalage vertical plus
          grand en mobile (top-[4.75rem]) qu'à partir de sm (sm:top-6,
          lg:top-8) : en mobile le badge occupait sa PROPRE ligne sous
          logo/icônes (2 lignes dans le header non-fixe), alors qu'à partir
          de sm il partageait leur ligne — sans ce décalage il se
          superposerait à cette 1ère ligne, toujours visible puisqu'elle
          n'est pas fixed. Ouvre AssistanceLMModal : questions de l'onglet
          Accueil actif, ou briefing des 7 sections si aucun (cf. commentaire
          sur le prop activeAccueilTab plus haut). animate-solution-lm
          (globals.css) : halo rose qui pulse doucement pour signaler que le
          badge est cliquable (retour utilisateur). */}
      <div className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-40 flex justify-center px-4 sm:top-6 sm:px-6 md:px-10 lg:top-8 lg:pl-[90px] lg:pr-6">
        <span className="animate-solution-lm pointer-events-auto inline-flex rounded-full bg-[linear-gradient(90deg,var(--color-brand-pink),rgba(20,18,32,0.08))] p-px">
          <button
            type="button"
            onClick={() => setShowAssistance(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 pl-2 pr-3 py-2 text-[11px] font-medium text-[#141220] shadow-[0_2px_10px_rgba(20,18,32,0.12)] transition hover:bg-white dark:bg-[#1c1830]/90 dark:text-[var(--dashboard-text)] dark:hover:bg-[#1c1830] sm:py-1"
          >
            <SparkleIcon />
            {t("solution LM", "LM solution")}
          </button>
        </span>
      </div>

      {showAssistance && (
        <AssistanceLMModal
          activeTab={activeAccueilTab}
          activeReglagesTab={activeReglagesTab}
          pageQuestions={pageQuestions}
          pageLabel={pageLabel}
          onFermer={() => setShowAssistance(false)}
        />
      )}
    </header>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

export function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
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
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
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

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M4 9.5 5.2 4h13.6l1.2 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9.5a2.3 2.3 0 0 0 4.5.6 2.3 2.3 0 0 0 4.5 0 2.3 2.3 0 0 0 4.5 0 2.3 2.3 0 0 0 4.5-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 11v9h13v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5.5h4V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
