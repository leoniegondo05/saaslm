"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DashboardDayWelcome from "../components/DashboardDayWelcome";
import DashboardHeader, { ChevronIcon } from "../components/DashboardHeader";
import DashboardSidebar from "../components/DashboardSidebar";
import QrCode from "../components/QrCode";
import { useDashboardLangue } from "../components/DashboardLanguageProvider";
import { texteAvecChiffres } from "../components/dashboard-accueil/shared";

/*
  Tableau de bord (dashboard) affiché après connexion, reproduction exacte
  de la maquette Figma fournie. Thème clair volontairement différent du
  reste du site (dark) — c'est l'espace "propriétaire de boutique", pas la
  vitrine publique, donc on sort de bg-brand-bg/text-brand-white posés par
  app/layout.tsx en fixant nos propres couleurs sur le wrapper racine.

  Données ("Awa Konan", montants, communes...) statiques pour l'instant :
  à brancher sur l'API dès qu'elle expose ces routes (commandes du jour,
  météo, identité du compte).
*/

const COMMUNES_EXPOSEES = [
  { label: "Abobo", variant: "default" },
  { label: "Cocody", variant: "default" },
  { label: "Koumassi", variant: "default" },
  { label: "Adjamé", variant: "default" },
  { label: "Macory", variant: "default" },
  { label: "Treichville", variant: "default" },
  { label: "Yopougon", variant: "default" },
  { label: "Port-Bouët", variant: "highlight" },
] as const;

export default function DashboardPage() {
  const { t } = useDashboardLangue();
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        {/* ── Nav : barre du bas façon app mobile sur mobile/tablette,
            barre latérale sticky à partir de lg (desktop) ── */}
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />

          {/* ── Salutation ── */}
          <h1 className="mt-10 text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            {t("Bonjour Awa,", "Hello Awa,")}
            <br />
            {t("voici votre ", "here's your ")}
            <span className="text-brand-pink">{t("journée.", "day.")}</span>
          </h1>

          {/* ── Grille principale ── */}
          <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[290px_1fr_320px]">
            {/* Colonne gauche : météo + recommandation + événements à venir */}
            <div className="flex flex-col gap-3">
              <WeatherCard />

              <LocalConditionsCard />

              <div className="flex items-center gap-3 rounded-2xl card-tint border border-[var(--dashboard-text)]/10 p-3 pr-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
                  <WarningIcon />
                </span>
                <span>
                  <span className="block text-xs text-[var(--dashboard-text)]/50">
                    {t("Recommandation", "Recommendation")}
                  </span>
                  <span className="block whitespace-nowrap text-sm font-semibold">
                    {texteAvecChiffres(t("Livrer à yopougon avant 23h", "Deliver to Yopougon before 11pm"))}
                  </span>
                </span>
              </div>

              <EventsCard />
            </div>

            {/* Colonne centrale : entre la carte "Aujourd'hui" (gauche) et la
                carte ventes "Hier · aujourd'hui · demain" (droite) —
                DashboardDayWelcome vit ici, pas sous le titre. */}
            <div className="relative order-3 sm:col-span-2 lg:order-none lg:col-span-1">
              <DashboardDayWelcome />
            </div>

            {/* Colonne droite : ventes + identité — une seule carte, les deux
                sections sont liées (pas deux cartes séparées par un gap) */}
            <div className="order-2 flex flex-col rounded-2xl card-tint border border-[var(--dashboard-text)]/10 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] lg:order-none">
              <div className="p-3">
                <span className="inline-flex items-center gap-2 text-xs text-[var(--dashboard-text)]/50">
                  <TrendUpIcon />
                  {t("Hier · aujourd'hui · demain", "Yesterday · today · tomorrow")}
                </span>

                <div className="mt-2 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[var(--dashboard-text)]/50">
                      {t("Aujourd'hui", "Today")}
                    </p>
                    <p className="mt-0.5 text-xl font-figures-bold">48 300 F</p>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand-pink px-2.5 py-1 text-xs font-semibold text-white">
                      <ClockIcon />{texteAvecChiffres(t("5 commandes en cours", "5 orders in progress"))}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--dashboard-text)]/50">
                      {texteAvecChiffres(t("Hier. Ven . 29", "Yesterday. Fri. 29"))}
                    </p>
                    <p className="mt-0.5 text-lg font-figures-bold">118 400 F</p>
                    <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/40">
                      {texteAvecChiffres(t("12 commandes", "12 orders"))}
                      <br />
                      {texteAvecChiffres(t("9 livrées", "9 delivered"))}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-px bg-[var(--dashboard-text)]/10" />

                <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
                  {t("Objectif demain soir", "Tomorrow evening's target")}
                </p>
                <p className="mt-0.5 text-2xl font-figures-bold">142 000 F</p>

                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
                    <div className="h-full w-[34%] rounded-full bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))]" />
                  </div>
                  <p className="mt-1.5 text-xs">
                    <span className="font-semibold font-figures">34 %</span>{" "}
                    <span className="text-[var(--dashboard-text)]/50">{t("du chemin fait", "of the way there")}</span>
                  </p>
                  <p className="text-xs text-[var(--dashboard-text)]/50">
                    {texteAvecChiffres(t("Il reste que 93 700 F", "Only 93,700 F left"))}
                  </p>
                </div>
              </div>

              {/* Pas de trait dessiné : la démarcation vient d'une ombre
                  portée très douce (comme si "Mon identité" était une
                  plaque posée sous la carte ventes), pas d'une ligne. */}
              <div className="rounded-t-[28px] p-3 shadow-[inset_0_10px_14px_-14px_rgba(20,18,32,0.16)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t("Mon identité", "My identity")}</h3>
                  <span className="rounded-full bg-[#dcf5e3] px-2.5 py-1 text-xs font-semibold text-[#178a3f]">
                    {t("Validé", "Verified")}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[auto_1px_1fr] items-stretch gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--dashboard-text)]/10 bg-white p-1.5">
                    <QrCode
                      value="https://liivremoi.com/id/awa-konan"
                      className="h-full w-full"
                    />
                  </div>

                  <div className="bg-[var(--dashboard-text)]/10" aria-hidden />

                  <div className="flex min-w-0 flex-col justify-center gap-1.5 text-xs">
                    <div>
                      <p className="font-semibold">Awa Konan</p>
                      <p className="text-[var(--dashboard-text)]/50">{t("Propriétaire · Admin", "Owner · Admin")}</p>
                    </div>
                    <div className="text-[var(--dashboard-text)]/50">
                      <p className="break-words">a.konan@awabeaute.ci</p>
                      <p>{texteAvecChiffres(t("Créée le 14 mars 2026", "Created on March 14, 2026"))}</p>
                      <p>{texteAvecChiffres(t("Expire le 14 sept. 2026", "Expires on Sept. 14, 2026"))}</p>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[var(--dashboard-text)]/40">
                  {t(
                    "Code personnel, lié à votre compte. Il sert à ouvrir l'application mobile avec vos droits.",
                    "Personal code, linked to your account. Used to open the mobile app with your permissions."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LOCAL_CONDITIONS = [
  {
    fr: "Trafic",
    en: "Traffic",
    badgeClass: "bg-[#f5a623] text-white",
    dotClass: "bg-[#f5a623]",
    rows: [
      {
        fr: "Statut :",
        en: "Status:",
        valueFr: "Boulevard VGE fermé",
        valueEn: "Boulevard VGE closed",
      },
    ],
  },
  {
    fr: "Boulvard",
    en: "Boulevard",
    badgeClass: "bg-[#e0442b] text-white",
    dotClass: "bg-[#e0442b]",
    rows: [
      {
        fr: "Statut :",
        en: "Status:",
        valueFr: "Trafic dense au Plateau",
        valueEn: "Heavy traffic in Plateau",
      },
      { fr: "Heure :", en: "Time:", valueFr: "7 h – 9 h 30", valueEn: "7am – 9:30am" },
    ],
  },
  {
    fr: "Douane",
    en: "Customs",
    badgeClass: "bg-[#16a34a] text-white",
    dotClass: "bg-[#16a34a]",
    rows: [
      {
        fr: "Statut :",
        en: "Status:",
        valueFr: "Aucune restriction douanière",
        valueEn: "No customs restrictions",
      },
    ],
  },
] as const;

// Cadence de rotation automatique des 3 phases dans la pastille compacte
// "Conditions locales" (colonne gauche du dashboard).
const LOCAL_CONDITIONS_ROTATION_MS = 3500;

// Abidjan (Côte d'Ivoire) : position par défaut si la géolocalisation
// navigateur est refusée/indisponible — cohérent avec les communes
// (Yopougon, Plateau...) déjà affichées plus bas dans cette card.
const DEFAULT_WEATHER_COORDS = { latitude: 5.36, longitude: -4.0083 };

/*
  Jours fériés Côte d'Ivoire — dates fixes certaines ; les fêtes mobiles
  (calées sur calendrier lunaire : Tabaski, Aïd al-Fitr, Maouloud, lundis de
  Pâques/Pentecôte, Ascension) sont approximatives et À VÉRIFIER/AJUSTER
  chaque année — pas de source officielle branchée, données statiques
  entretenues à la main (cf. [[dashboard-mock-data-pending-laravel-api]]).
  `noel: true` déclenche en plus le rappel "articles de Noël" sur la carte.
*/
const HOLIDAYS_CI = [
  { date: "2026-01-01", fr: "Jour de l'An", en: "New Year's Day" },
  { date: "2026-04-06", fr: "Lundi de Pâques (approx.)", en: "Easter Monday (approx.)" },
  { date: "2026-05-01", fr: "Fête du Travail", en: "Labour Day" },
  { date: "2026-05-14", fr: "Ascension (approx.)", en: "Ascension Day (approx.)" },
  { date: "2026-05-25", fr: "Lundi de Pentecôte (approx.)", en: "Whit Monday (approx.)" },
  { date: "2026-05-27", fr: "Tabaski / Aïd al-Adha (approx.)", en: "Tabaski / Eid al-Adha (approx.)" },
  { date: "2026-08-07", fr: "Fête de l'Indépendance", en: "Independence Day" },
  { date: "2026-08-15", fr: "Assomption", en: "Assumption Day" },
  { date: "2026-08-26", fr: "Maouloud (approx.)", en: "Mawlid (approx.)" },
  { date: "2026-11-01", fr: "Toussaint", en: "All Saints' Day" },
  { date: "2026-12-25", fr: "Noël", en: "Christmas", noel: true },
] as const;

// Partenaire logistique fermé les jours fériés — pas encore de calendrier
// affilié réel côté API (aucun champ dédié trouvé dans le schéma actuel) :
// mock dérivé des jours fériés ci-dessus en attendant que le Laravel expose
// le vrai calendrier d'indisponibilité par affilié.
const AFFILIATE_NAME = "Cotransport";

// Fenêtre d'anticipation de la carte "Événements à venir".
const UPCOMING_WINDOW_DAYS = 14;

// Table de correspondance codes météo WMO (renvoyés par Open-Meteo) →
// libellé FR/EN / emoji / couleur, réutilisée pour "Aujourd'hui" et "Demain".
// `t` reçu en paramètre (pas de hook ici, fonction pure hors composant).
function describeWeatherCode(
  code: number,
  t: (fr: string, en: string) => string
): {
  label: string;
  emoji: string;
  colorClass: string;
} {
  if (code === 0) return { label: t("Temps ensoleillé", "Sunny"), emoji: "☀️", colorClass: "text-[#16a34a]" };
  if (code === 1) return { label: t("Temps clair", "Clear skies"), emoji: "🌤️", colorClass: "text-[#16a34a]" };
  if (code === 2) return { label: t("Passages nuageux", "Partly cloudy"), emoji: "⛅", colorClass: "text-[#f5a623]" };
  if (code === 3) return { label: t("Ciel couvert", "Overcast"), emoji: "☁️", colorClass: "text-[#f5a623]" };
  if (code === 45 || code === 48) return { label: t("Brouillard", "Fog"), emoji: "🌫️", colorClass: "text-[#f5a623]" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: t("Bruine", "Drizzle"), emoji: "🌦️", colorClass: "text-[#f5a623]" };
  if ([61, 63, 80].includes(code)) return { label: t("Pluie légère", "Light rain"), emoji: "🌧️", colorClass: "text-[#f5a623]" };
  if ([65, 66, 67, 81, 82].includes(code)) return { label: t("Fortes pluies", "Heavy rain"), emoji: "🌧️", colorClass: "text-[#e0442b]" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: t("Neige", "Snow"), emoji: "❄️", colorClass: "text-[#f5a623]" };
  if ([95, 96, 99].includes(code)) return { label: t("Orage", "Thunderstorm"), emoji: "⛈️", colorClass: "text-[#e0442b]" };
  return { label: t("Temps pluvieux", "Rainy"), emoji: "🌦️", colorClass: "text-[#f5a623]" };
}

type WeatherState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      todayCode: number;
      todayTempMax: number;
      tomorrowCode: number;
      tomorrowTempMax: number;
    };

// Récupère la météo temps réel (Open-Meteo, sans clé API) pour la position
// du navigateur, avec repli sur Abidjan si la géolocalisation est refusée,
// indisponible ou trop lente.
function useLiveWeather(): WeatherState {
  const [weather, setWeather] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,temperature_2m&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=2`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("météo indisponible");
        const data = await res.json();
        if (cancelled) return;
        setWeather({
          status: "ready",
          todayCode: data.current.weather_code,
          todayTempMax: Math.round(data.daily.temperature_2m_max[0]),
          tomorrowCode: data.daily.weather_code[1],
          tomorrowTempMax: Math.round(data.daily.temperature_2m_max[1]),
        });
      } catch {
        if (!cancelled) setWeather({ status: "error" });
      }
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          fetchWeather(position.coords.latitude, position.coords.longitude),
        () =>
          fetchWeather(
            DEFAULT_WEATHER_COORDS.latitude,
            DEFAULT_WEATHER_COORDS.longitude
          ),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_WEATHER_COORDS.latitude, DEFAULT_WEATHER_COORDS.longitude);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return weather;
}

/*
  Carte "Aujourd'hui" (météo). L'ancien toggle interne vers une 2ème vue
  "Conditions locales" (grille trafic/boulevard/douane) a été retiré :
  cette info vit maintenant dans sa propre pastille compacte, cf.
  LocalConditionsCard ci-dessous. Météo branchée en temps réel sur
  Open-Meteo (position navigateur, ou Abidjan par défaut) — seules les
  communes exposées restent statiques.
*/
function WeatherCard() {
  const { t } = useDashboardLangue();
  const weather = useLiveWeather();

  const today =
    weather.status === "ready" ? describeWeatherCode(weather.todayCode, t) : null;
  const tomorrow =
    weather.status === "ready"
      ? describeWeatherCode(weather.tomorrowCode, t)
      : null;

  return (
    <div className="rounded-2xl card-tint border border-[var(--dashboard-text)]/10 p-3 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <div className="flex items-start justify-between">
        <h2 className="text-base font-semibold">{t("Aujourd'hui", "Today")}</h2>
        {today && today.emoji === "☀️" ? (
          <Image
            src="/images/Météo.png"
            alt={today.label}
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center text-2xl leading-none"
            role="img"
            aria-label={today?.label ?? t("Météo en cours de chargement", "Weather loading")}
          >
            {today?.emoji ?? "…"}
          </span>
        )}
      </div>
      <p
        className={`mt-1 text-sm font-semibold ${
          today?.colorClass ?? "text-[var(--dashboard-text)]/50"
        }`}
      >
        {weather.status === "error"
          ? t("Météo indisponible", "Weather unavailable")
          : (today?.label ?? t("Chargement de la météo…", "Loading weather…"))}
      </p>
      <p className="text-xs text-[var(--dashboard-text)]/50">
        {weather.status === "ready"
          ? texteAvecChiffres(`${t("Toute la journée", "All day")} · ${weather.todayTempMax}°C`)
          : t("Toute la journée", "All day")}
      </p>

      <div className="my-2 h-px bg-[var(--dashboard-text)]/10" />

      <h3 className="text-sm font-semibold">{t("Demain", "Tomorrow")}</h3>
      <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">
        {weather.status === "ready" && tomorrow
          ? texteAvecChiffres(`${tomorrow.label} · ${weather.tomorrowTempMax}°C`)
          : weather.status === "error"
            ? t("Indisponible.", "Unavailable.")
            : t("Chargement…", "Loading…")}
      </p>

      <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">{t("Communes exposées", "Exposed areas")}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {COMMUNES_EXPOSEES.map((commune) => (
          <span
            key={commune.label}
            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
              commune.variant === "highlight"
                ? "bg-[#32BD00B0] text-[var(--dashboard-text)]"
                : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/70"
            }`}
          >
            {commune.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/*
  Pastille compacte "Conditions locales" — même gabarit que la pastille
  "Recommandation" (icône ronde + libellé + valeur), mais fait défiler les
  3 phases (Trafic / Boulevard / Douane) toutes les LOCAL_CONDITIONS_ROTATION_MS
  comme un mini-carrousel. Clic dessus = ouvre LocalConditionsModal avec le
  détail complet des 3 phases (remplace l'ancienne grille encastrée dans la
  carte météo, jugée trop chargée).
*/
function LocalConditionsCard() {
  const { t } = useDashboardLangue();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % LOCAL_CONDITIONS.length);
    }, LOCAL_CONDITIONS_ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  const phase = LOCAL_CONDITIONS[phaseIndex];
  const headline = phase.rows[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl card-tint border border-[var(--dashboard-text)]/10 p-3 pr-4 text-left shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]"
        aria-haspopup="dialog"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${phase.badgeClass}`}
        >
          {t(phase.fr, phase.en).slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between">
            <span className="text-xs text-[var(--dashboard-text)]/50">
              {t("Conditions locales", "Local conditions")}
            </span>
            <CarouselDots count={LOCAL_CONDITIONS.length} activeIndex={phaseIndex} />
          </span>
          <span className="block truncate text-sm font-semibold">
            {t(phase.fr, phase.en)} · {texteAvecChiffres(t(headline.valueFr, headline.valueEn))}
          </span>
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-text)]/[0.06]">
          <ChevronIcon direction="right" />
        </span>
      </button>

      <LocalConditionsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

// Détail complet des 3 phases, ouvert au clic sur LocalConditionsCard.
function LocalConditionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useDashboardLangue();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("Conditions locales", "Local conditions")}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl card-tint p-5 shadow-[0_20px_50px_-15px_rgba(20,18,32,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">{t("Conditions locales", "Local conditions")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Fermer", "Close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-text)]/[0.06]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {LOCAL_CONDITIONS.map((condition) => (
            <div
              key={condition.fr}
              className="flex gap-3 rounded-2xl bg-[var(--dashboard-card-bg)] p-3 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]"
            >
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${condition.dotClass}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t(condition.fr, condition.en)}</p>
                {condition.rows.map((row) => (
                  <p key={row.fr} className="mt-1 text-xs leading-snug text-[var(--dashboard-text)]/60">
                    <span className="text-[var(--dashboard-text)]/40">{t(row.fr, row.en)}</span>{" "}
                    {texteAvecChiffres(t(row.valueFr, row.valueEn))}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Nombre de jours (entier, peut être négatif) entre aujourd'hui et une date
// "YYYY-MM-DD", comparaison sur la date seule (minuit local des deux côtés).
function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/*
  Carte "Événements à venir" : jours fériés dans les UPCOMING_WINDOW_DAYS
  prochains jours (cf. HOLIDAYS_CI), avec rappel articles pour Noël et
  fermeture du partenaire logistique affilié. Recalculée à chaque rendu à
  partir de la date du jour (pas de state/effect nécessaire, pas d'appel
  réseau — tout est dérivé de la liste statique ci-dessus).
*/
function EventsCard() {
  const { t } = useDashboardLangue();

  const upcoming = HOLIDAYS_CI.map((holiday) => ({ ...holiday, inDays: daysUntil(holiday.date) }))
    .filter((holiday) => holiday.inDays >= 0 && holiday.inDays <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => a.inDays - b.inDays);

  if (upcoming.length === 0) {
    return (
      <div className="rounded-2xl card-tint border border-[var(--dashboard-text)]/10 p-3 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
        <h3 className="text-sm font-semibold">{t("Événements à venir", "Upcoming events")}</h3>
        <p className="mt-1 text-xs text-[var(--dashboard-text)]/50">
          {texteAvecChiffres(t("Rien dans les 14 prochains jours.", "Nothing in the next 14 days."))}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl card-tint border border-[var(--dashboard-text)]/10 p-3 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <h3 className="text-sm font-semibold">{t("Événements à venir", "Upcoming events")}</h3>
      <div className="mt-2 flex flex-col gap-2.5">
        {upcoming.map((holiday) => (
          <div key={holiday.date}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{t(holiday.fr, holiday.en)}</span>
              <span className="shrink-0 rounded-full bg-[var(--dashboard-text)]/[0.06] px-2 py-0.5 text-[11px] font-medium text-[var(--dashboard-text)]/70">
                {holiday.inDays === 0
                  ? t("Aujourd'hui", "Today")
                  : holiday.inDays === 1
                    ? t("Demain", "Tomorrow")
                    : texteAvecChiffres(t(`Dans ${holiday.inDays} j`, `In ${holiday.inDays}d`))}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">
              {t(
                `${AFFILIATE_NAME} (partenaire livraison) fermé ce jour.`,
                `${AFFILIATE_NAME} (delivery partner) closed that day.`
              )}
            </p>
            {"noel" in holiday && holiday.noel ? (
              <p className="mt-0.5 text-xs font-semibold text-brand-pink">
                {t("Pensez à mettre en avant vos articles de Noël.", "Time to feature your Christmas products.")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function CarouselDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            i === activeIndex ? "bg-[var(--dashboard-text)]" : "bg-[var(--dashboard-text)]/20"
          }`}
        />
      ))}
    </div>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 8v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink" aria-hidden>
      <path
        d="M3 16l6-6 4 4 8-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 5h6v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="mr-0.5 inline h-3 w-3"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
      <path
        d="M12 7v5l3.5 2"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
