"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DashboardBrain from "../components/DashboardBrain";
import DashboardHeader, { ChevronIcon } from "../components/DashboardHeader";
import DashboardSidebar from "../components/DashboardSidebar";
import QrCode from "../components/QrCode";
import { useDashboardLangue } from "../components/DashboardLanguageProvider";

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
          <h1 className="mt-10 text-4xl font-bold leading-[1.15] tracking-tight sm:text-[44px]">
            {t("Bonjour Awa,", "Hello Awa,")}
            <br />
            {t("voici votre ", "here's your ")}
            <span className="text-brand-pink">{t("journée.", "day.")}</span>
          </h1>

          {/* ── Grille principale ── */}
          <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[290px_1fr_320px]">
            {/* Colonne gauche : météo + recommandation */}
            <div className="flex flex-col gap-3">
              <WeatherCard />

              <div className="flex items-center gap-3 rounded-2xl card-tint p-3 pr-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
                  <WarningIcon />
                </span>
                <span>
                  <span className="block text-xs text-[var(--dashboard-text)]/50">
                    {t("Recommandation", "Recommendation")}
                  </span>
                  <span className="block whitespace-nowrap text-sm font-semibold">
                    {t("Livrer à yopougon avant 23h", "Deliver to Yopougon before 11pm")}
                  </span>
                </span>
              </div>
            </div>

            {/* Colonne centrale : cerveau */}
            <div className="relative order-3 flex items-center justify-center py-10 sm:col-span-2 lg:order-none lg:col-span-1 lg:py-0">
              <div className="w-full max-w-[420px]">
                <DashboardBrain />
              </div>
            </div>

            {/* Colonne droite : ventes + identité — une seule carte, les deux
                sections sont liées (pas deux cartes séparées par un gap) */}
            <div className="order-2 flex flex-col rounded-2xl card-tint shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] lg:order-none">
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
                    <p className="mt-0.5 text-xl font-bold">48.300F</p>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand-pink px-2.5 py-1 text-xs font-semibold text-white">
                      <ClockIcon />{t("5 commandes en cours", "5 orders in progress")}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--dashboard-text)]/50">
                      {t("Hier. Ven . 29", "Yesterday. Fri. 29")}
                    </p>
                    <p className="mt-0.5 text-lg font-bold">118 400 F</p>
                    <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/40">
                      {t("12 commandes", "12 orders")}
                      <br />
                      {t("9 livrées", "9 delivered")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-px bg-[var(--dashboard-text)]/10" />

                <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
                  {t("Objectif demain soir", "Tomorrow evening's target")}
                </p>
                <p className="mt-0.5 text-2xl font-bold">142 000 F</p>

                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
                    <div className="h-full w-[34%] rounded-full bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))]" />
                  </div>
                  <p className="mt-1.5 text-xs">
                    <span className="font-semibold">34%</span>{" "}
                    <span className="text-[var(--dashboard-text)]/50">{t("du chemin fait", "of the way there")}</span>
                  </p>
                  <p className="text-xs text-[var(--dashboard-text)]/50">
                    {t("Il reste que 93 700 F", "Only 93,700 F left")}
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
                      <p>{t("Créée le 14 mars 2026", "Created on March 14, 2026")}</p>
                      <p>{t("Expire le 14 sept. 2026", "Expires on Sept. 14, 2026")}</p>
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

// Abidjan (Côte d'Ivoire) : position par défaut si la géolocalisation
// navigateur est refusée/indisponible — cohérent avec les communes
// (Yopougon, Plateau...) déjà affichées plus bas dans cette card.
const DEFAULT_WEATHER_COORDS = { latitude: 5.36, longitude: -4.0083 };

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
  Carte "Aujourd'hui" (météo) : deux vues qui se remplacent l'une l'autre
  au clic sur "Conditions locale" / "Météo", comme sur la maquette Figma
  (2ème card = "Conditions locales" avec trafic/boulevard/douane + retour).
  Météo branchée en temps réel sur Open-Meteo (position navigateur, ou
  Abidjan par défaut) — seules les communes exposées restent statiques.
*/
function WeatherCard() {
  const { t } = useDashboardLangue();
  const [view, setView] = useState<"meteo" | "conditions">("meteo");
  const weather = useLiveWeather();

  const today =
    weather.status === "ready" ? describeWeatherCode(weather.todayCode, t) : null;
  const tomorrow =
    weather.status === "ready"
      ? describeWeatherCode(weather.tomorrowCode, t)
      : null;

  return (
    <div className="rounded-2xl card-tint p-3 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
      {view === "meteo" ? (
        <>
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
              ? `${t("Toute la journée", "All day")} · ${weather.todayTempMax}°C`
              : t("Toute la journée", "All day")}
          </p>

          <div className="my-2 h-px bg-[var(--dashboard-text)]/10" />

          <h3 className="text-sm font-semibold">{t("Demain", "Tomorrow")}</h3>
          <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">
            {weather.status === "ready" && tomorrow
              ? `${tomorrow.label} · ${weather.tomorrowTempMax}°C`
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

          <div className="mt-3 flex items-center justify-between">
            <PaginationDots activeIndex={0} />
            <button
              type="button"
              onClick={() => setView("conditions")}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              {t("Conditions locale", "Local conditions")}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dashboard-text)]/[0.06]">
                <ChevronIcon direction="right" />
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-center text-base font-bold">{t("Conditions locales", "Local conditions")}</h2>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LOCAL_CONDITIONS.map((condition) => (
              <div
                key={condition.fr}
                className="flex flex-col gap-2 rounded-2xl border border-[var(--dashboard-text)]/[0.06] bg-[var(--dashboard-card-bg)] p-2 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]"
              >
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-center text-[11px] font-semibold ${condition.badgeClass}`}
                >
                  {t(condition.fr, condition.en)}
                </span>
                {condition.rows.map((row) => (
                  <div key={row.fr}>
                    <p className="text-[11px] font-medium text-[var(--dashboard-text)]/70">
                      {t(row.fr, row.en)}
                    </p>
                    <p className="mt-1 rounded-lg bg-[var(--dashboard-text)]/[0.05] px-2 py-1.5 text-[11px] leading-snug text-[var(--dashboard-text)]/60">
                      {t(row.valueFr, row.valueEn)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dashboard-card-bg)] shadow-[0_2px_10px_rgba(20,18,32,0.12)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141220] text-white dark:bg-brand-pink">
                <UserIcon />
              </span>
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <PaginationDots activeIndex={1} />
            <button
              type="button"
              onClick={() => setView("meteo")}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dashboard-card-bg)] shadow-[0_2px_10px_rgba(20,18,32,0.1)]">
                <ChevronIcon direction="left" />
              </span>
              {t("Météo", "Weather")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PaginationDots({ activeIndex }: { activeIndex: 0 | 1 }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          activeIndex === 0 ? "bg-[var(--dashboard-text)]" : "bg-[var(--dashboard-text)]/20"
        }`}
      />
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          activeIndex === 1 ? "bg-[var(--dashboard-text)]" : "bg-[var(--dashboard-text)]/20"
        }`}
      />
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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
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
