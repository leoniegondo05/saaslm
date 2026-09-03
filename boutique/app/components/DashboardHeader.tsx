"use client";

import Image from "next/image";
import { useState } from "react";

/*
  Barre du haut du dashboard (logo, sélecteur mois/année, badge "solution LM",
  chip partenaire agréé, avatar) — extraite de app/dashboard/page.tsx pour
  être partagée avec app/dashboard/accueil/page.tsx (même en-tête sur les
  deux onglets, cf. maquette : chaque écran garde le même topbar).

  État du sélecteur de mois volontairement local à chaque instance (pas de
  contexte partagé) : rien ne demande aujourd'hui que la période choisie sur
  "Ma journée" et sur "Accueil" reste synchronisée entre les deux pages.
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

export default function DashboardHeader() {
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
          <div className="flex items-center gap-0.5 rounded-full bg-white/70 p-1 shadow-[0_2px_10px_rgba(20,18,32,0.06)] sm:gap-1 sm:p-1.5">
            <button
              type="button"
              aria-label="Mois précédent"
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white sm:h-8 sm:w-8"
            >
              <ChevronIcon direction="left" />
            </button>
            {visibleMonths.map(({ key, date }, index) => (
              <button
                key={key}
                type="button"
                onClick={() => shiftMonth(index - 1)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition sm:px-4 sm:py-1.5 sm:text-sm ${
                  index === 1
                    ? "bg-white text-[#141220] shadow-[0_2px_8px_rgba(20,18,32,0.1)]"
                    : "hidden text-[#141220]/45 hover:text-[#141220]/70 sm:inline-block"
                }`}
              >
                {MONTH_NAMES[date.getMonth()]}
              </button>
            ))}
            <button
              type="button"
              aria-label="Mois suivant"
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#141220]/50 transition hover:bg-white sm:h-8 sm:w-8"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowYearPicker((open) => !open)}
            className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-[#141220]/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-white sm:px-3 sm:py-1.5 sm:text-sm"
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
                    year === activeYear ? "text-brand-pink" : "text-[#141220]/70"
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

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="flex items-center gap-3 rounded-full bg-white/70 p-1.5 shadow-[0_2px_10px_rgba(20,18,32,0.06)] sm:pr-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple">
            <BuildingIcon />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-xs text-[#141220]/50">Partenaire agréé</span>
            <span className="block text-sm font-semibold">Groupe Logistique Ivoire</span>
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
