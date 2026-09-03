"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DashboardBrain from "../components/DashboardBrain";
import QrCode from "../components/QrCode";

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

const MONTH_NAMES = [
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
  // Mois affiché au centre de la pastille + les deux mois voisins ; l'année
  // suit automatiquement le mois (déc. -> janv. change l'année) et reste
  // choisissable à la main via le sélecteur qui s'ouvre au clic sur le millésime.
  const [activeDate, setActiveDate] = useState(() => new Date(2026, 7, 1));
  const [showYearPicker, setShowYearPicker] = useState(false);

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

  const yearOptions = Array.from({ length: 5 }, (_, i) => activeYear - 2 + i);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,#f4e9f3_0%,#efe2ee_45%,#e8dbe9_100%)] font-sans text-[#141220] antialiased">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pt-8">
        {/* ── Barre latérale d'icônes ── */}
        <aside className="flex w-full shrink-0 flex-row items-center justify-center py-2 lg:sticky lg:top-8 lg:mt-[260px] lg:h-[calc(100vh-20rem)] lg:w-[70px] lg:flex-col lg:py-6">
          <nav className="flex flex-row items-center gap-6 lg:flex-col lg:gap-8">
            <SidebarIcon label="Ma journée" active>
              <SunIcon />
            </SidebarIcon>
            <SidebarIcon label="Accueil">
              <HomeIcon />
            </SidebarIcon>
            <SidebarIcon label="Produits">
              <BoxIcon />
            </SidebarIcon>
            <SidebarIcon label="Paramètres">
              <GearIcon />
            </SidebarIcon>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {/* ── Barre du haut ── */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.svg"
                alt="Logo LIIVRE MOI"
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
              />

              <div className="relative flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-white/70 p-1.5 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
                  <button
                    type="button"
                    aria-label="Mois précédent"
                    onClick={() => shiftMonth(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white"
                  >
                    <ChevronIcon direction="left" />
                  </button>
                  {visibleMonths.map(({ key, date }, index) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => shiftMonth(index - 1)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        index === 1
                          ? "bg-white text-[#141220] shadow-[0_2px_8px_rgba(20,18,32,0.1)]"
                          : "text-[#141220]/45 hover:text-[#141220]/70"
                      }`}
                    >
                      {MONTH_NAMES[date.getMonth()]}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="Mois suivant"
                    onClick={() => shiftMonth(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white"
                  >
                    <ChevronIcon direction="right" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowYearPicker((open) => !open)}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-[#141220]/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white"
                >
                  {activeYear}
                </button>

                {showYearPicker && (
                  <div className="absolute left-0 top-full z-10 mt-2 flex flex-col overflow-hidden rounded-2xl bg-white py-1 shadow-[0_8px_24px_rgba(20,18,32,0.16)]">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setYear(year)}
                        className={`px-5 py-2 text-left text-sm font-medium transition hover:bg-[#141220]/[0.05] ${
                          year === activeYear
                            ? "text-brand-pink"
                            : "text-[#141220]/70"
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
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-medium text-[#141220]">
                <SparkleIcon />
                solution LM
              </span>
            </span>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-3 rounded-full bg-white/70 py-1.5 pl-1.5 pr-5 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple">
                  <BuildingIcon />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs text-[#141220]/50">
                    Partenaire agréé
                  </span>
                  <span className="block text-sm font-semibold">
                    Groupe Logistique Ivoire
                  </span>
                </span>
              </span>

              <button
                type="button"
                aria-label="Notifications"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white"
              >
                <BellIcon />
              </button>
              <button
                type="button"
                aria-label="Mon compte"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white"
              >
                <UserIcon />
              </button>
            </div>
          </header>

          {/* ── Salutation ── */}
          <h1 className="mt-10 text-4xl font-bold leading-[1.15] tracking-tight sm:text-[44px]">
            Bonjour Awa,
            <br />
            voici votre <span className="text-brand-pink">journée.</span>
          </h1>

          {/* ── Grille principale ── */}
          <div className="relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-[320px_1fr_380px]">
            {/* Colonne gauche : météo + recommandation */}
            <div className="flex flex-col gap-5">
              <WeatherCard />

              <div className="flex items-center gap-4 rounded-[28px] card-tint p-5 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
                  <WarningIcon />
                </span>
                <span>
                  <span className="block text-xs text-[#141220]/50">
                    Recommandation
                  </span>
                  <span className="block text-sm font-semibold">
                    Livrer à yopougon avant 23h
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
            <div className="order-2 flex flex-col rounded-[28px] card-tint shadow-[0_4px_24px_rgba(20,18,32,0.06)] lg:order-none">
              <div className="p-6">
                <span className="inline-flex items-center gap-2 text-xs text-[#141220]/50">
                  <TrendUpIcon />
                  Hier · aujourd&apos;hui · demain
                </span>

                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#141220]/50">
                      Aujourd&apos;hui
                    </p>
                    <p className="mt-1 text-2xl font-bold">48.300F</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-pink px-3 py-1 text-xs font-semibold text-white">
                      <ClockIcon />5 commandes en cours
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#141220]/50">
                      Hier. Ven . 29
                    </p>
                    <p className="mt-1 text-xl font-bold">118 400 F</p>
                    <p className="mt-1 text-xs text-[#141220]/40">
                      12 commandes
                      <br />
                      9 livrées
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-px bg-[#141220]/10" />

                <p className="mt-6 text-xs text-[#141220]/50">
                  Objectif demain soir
                </p>
                <p className="mt-1 text-3xl font-bold">142 000 F</p>

                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#141220]/[0.08]">
                    <div className="h-full w-[34%] rounded-full bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))]" />
                  </div>
                  <p className="mt-3 text-xs">
                    <span className="font-semibold">34%</span>{" "}
                    <span className="text-[#141220]/50">du chemin fait</span>
                  </p>
                  <p className="text-xs text-[#141220]/50">
                    Il reste que 93 700 F
                  </p>
                </div>
              </div>

              {/* Pas de trait dessiné : la démarcation vient d'une ombre
                  portée très douce (comme si "Mon identité" était une
                  plaque posée sous la carte ventes), pas d'une ligne. */}
              <div className="rounded-t-[28px] p-6 shadow-[inset_0_10px_14px_-14px_rgba(20,18,32,0.16)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Mon identité</h3>
                  <span className="rounded-full bg-[#dcf5e3] px-3 py-1 text-xs font-semibold text-[#178a3f]">
                    Validé
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-[auto_1px_1fr] items-stretch gap-5">
                  <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl border border-[#141220]/10 bg-white p-1.5">
                    <QrCode
                      value="https://liivremoi.com/id/awa-konan"
                      className="h-full w-full"
                    />
                  </div>

                  <div className="bg-[#141220]/10" aria-hidden />

                  <div className="flex min-w-0 flex-col justify-center gap-3 text-xs">
                    <div>
                      <p className="font-semibold">Awa Konan</p>
                      <p className="text-[#141220]/50">Propriétaire · Admin</p>
                    </div>
                    <div className="text-[#141220]/50">
                      <p className="break-words">a.konan@awabeaute.ci</p>
                      <p>Créée le 14 mars 2026</p>
                      <p>Expire le 14 sept. 2026</p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-xs text-[#141220]/40">
                  Code personnel, lié à votre compte. Il sert à ouvrir
                  l&apos;application mobile avec vos droits.
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
    label: "Trafic",
    badgeClass: "bg-[#f5a623] text-white",
    rows: [{ label: "Statut :", value: "Boulevard VGE fermé" }],
  },
  {
    label: "Boulvard",
    badgeClass: "bg-[#e0442b] text-white",
    rows: [
      { label: "Statut :", value: "Trafic dense au Plateau" },
      { label: "Heure :", value: "7 h – 9 h 30" },
    ],
  },
  {
    label: "Douane",
    badgeClass: "bg-[#16a34a] text-white",
    rows: [{ label: "Statut :", value: "Aucune restriction douanière" }],
  },
] as const;

// Abidjan (Côte d'Ivoire) : position par défaut si la géolocalisation
// navigateur est refusée/indisponible — cohérent avec les communes
// (Yopougon, Plateau...) déjà affichées plus bas dans cette card.
const DEFAULT_WEATHER_COORDS = { latitude: 5.36, longitude: -4.0083 };

// Table de correspondance codes météo WMO (renvoyés par Open-Meteo) →
// libellé FR / emoji / couleur, réutilisée pour "Aujourd'hui" et "Demain".
function describeWeatherCode(code: number): {
  label: string;
  emoji: string;
  colorClass: string;
} {
  if (code === 0) return { label: "Temps ensoleillé", emoji: "☀️", colorClass: "text-[#16a34a]" };
  if (code === 1) return { label: "Temps clair", emoji: "🌤️", colorClass: "text-[#16a34a]" };
  if (code === 2) return { label: "Passages nuageux", emoji: "⛅", colorClass: "text-[#f5a623]" };
  if (code === 3) return { label: "Ciel couvert", emoji: "☁️", colorClass: "text-[#f5a623]" };
  if (code === 45 || code === 48) return { label: "Brouillard", emoji: "🌫️", colorClass: "text-[#f5a623]" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Bruine", emoji: "🌦️", colorClass: "text-[#f5a623]" };
  if ([61, 63, 80].includes(code)) return { label: "Pluie légère", emoji: "🌧️", colorClass: "text-[#f5a623]" };
  if ([65, 66, 67, 81, 82].includes(code)) return { label: "Fortes pluies", emoji: "🌧️", colorClass: "text-[#e0442b]" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Neige", emoji: "❄️", colorClass: "text-[#f5a623]" };
  if ([95, 96, 99].includes(code)) return { label: "Orage", emoji: "⛈️", colorClass: "text-[#e0442b]" };
  return { label: "Temps pluvieux", emoji: "🌦️", colorClass: "text-[#f5a623]" };
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
  const [view, setView] = useState<"meteo" | "conditions">("meteo");
  const weather = useLiveWeather();

  const today =
    weather.status === "ready" ? describeWeatherCode(weather.todayCode) : null;
  const tomorrow =
    weather.status === "ready"
      ? describeWeatherCode(weather.tomorrowCode)
      : null;

  return (
    <div className="rounded-[28px] card-tint p-6 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
      {view === "meteo" ? (
        <>
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold">Aujourd&apos;hui</h2>
            {today && today.emoji === "☀️" ? (
              <Image
                src="/images/Météo.png"
                alt={today.label}
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
            ) : (
              <span
                className="flex h-16 w-16 items-center justify-center text-5xl leading-none"
                role="img"
                aria-label={today?.label ?? "Météo en cours de chargement"}
              >
                {today?.emoji ?? "…"}
              </span>
            )}
          </div>
          <p
            className={`mt-2 text-sm font-semibold ${
              today?.colorClass ?? "text-[#141220]/50"
            }`}
          >
            {weather.status === "error"
              ? "Météo indisponible"
              : (today?.label ?? "Chargement de la météo…")}
          </p>
          <p className="text-xs text-[#141220]/50">
            {weather.status === "ready"
              ? `Toute la journée · ${weather.todayTempMax}°C`
              : "Toute la journée"}
          </p>

          <div className="my-5 h-px bg-[#141220]/10" />

          <h3 className="text-base font-semibold">Demain</h3>
          <p className="mt-1 text-xs text-[#141220]/50">
            {weather.status === "ready" && tomorrow
              ? `${tomorrow.label} · ${weather.tomorrowTempMax}°C`
              : weather.status === "error"
                ? "Indisponible."
                : "Chargement…"}
          </p>

          <p className="mt-6 text-xs text-[#141220]/50">Communes exposées</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMMUNES_EXPOSEES.map((commune) => (
              <span
                key={commune.label}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                  commune.variant === "highlight"
                    ? "bg-[#dcf5e3] text-[#178a3f]"
                    : "bg-[#141220]/[0.06] text-[#141220]/70"
                }`}
              >
                {commune.label}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <PaginationDots activeIndex={0} />
            <button
              type="button"
              onClick={() => setView("conditions")}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              Conditions locale
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141220]/[0.06]">
                <ChevronIcon direction="right" />
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-center text-lg font-bold">Conditions locales</h2>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LOCAL_CONDITIONS.map((condition) => (
              <div
                key={condition.label}
                className="flex flex-col gap-2.5 rounded-2xl border border-[#141220]/[0.06] bg-white p-2.5"
              >
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-center text-[11px] font-semibold ${condition.badgeClass}`}
                >
                  {condition.label}
                </span>
                {condition.rows.map((row) => (
                  <div key={row.label}>
                    <p className="text-[11px] font-medium text-[#141220]/70">
                      {row.label}
                    </p>
                    <p className="mt-1 rounded-lg bg-[#141220]/[0.05] px-2 py-1.5 text-[11px] leading-snug text-[#141220]/60">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(20,18,32,0.12)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141220] text-white">
                <UserIcon />
              </span>
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <PaginationDots activeIndex={1} />
            <button
              type="button"
              onClick={() => setView("meteo")}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(20,18,32,0.1)]">
                <ChevronIcon direction="left" />
              </span>
              Météo
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
          activeIndex === 0 ? "bg-[#141220]" : "bg-[#141220]/20"
        }`}
      />
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          activeIndex === 1 ? "bg-[#141220]" : "bg-[#141220]/20"
        }`}
      />
    </div>
  );
}

function SidebarIcon({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-1.5 text-[11px] transition ${
        active ? "text-[#141220]" : "text-[#141220]/40 hover:text-[#141220]/70"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
          active
            ? "bg-white shadow-[0_2px_10px_rgba(20,18,32,0.08)]"
            : "bg-[#141220]/[0.04] hover:bg-[#141220]/[0.08]"
        }`}
      >
        {children}
      </span>
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
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1-1.55V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.5a1.7 1.7 0 0 0 1.55 1H19.5a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
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

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-brand-pink"
      aria-hidden
    >
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="1.5"
        stroke="white"
        strokeWidth="1.6"
      />
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
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
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
