"use client";

import Link from "next/link";
import { Card } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Petits éléments partagés par les trois formulaires de "Demandes"
  (OuvrirLitige, PoserQuestion, SignalerProbleme) : le champ étiqueté et
  l'écran de confirmation après envoi. Même recette que
  CreerCollaborateur.tsx (dashboard-reglages) — rien n'est envoyé à une API
  pour l'instant, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

/*
  Pastille "retour" en haut de chaque écran de Demandes — même forme que la
  maquette fournie (chevron + fil d'Ariane, ex. "Partenaire agréé ›
  Demandes"), posée au-dessus du header du dashboard plutôt que dedans
  puisque DashboardHeader est partagé par tout le dashboard.
*/
export function RetourPastille({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-6 mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)]/70 px-3.5 py-2 text-[11px] font-semibold text-[var(--dashboard-text)] shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-[var(--dashboard-card-bg)]"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
        <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  );
}

export function Field({ label, badge, children }: { label: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-[var(--dashboard-text)]/40">{label}</p>
        {badge}
      </div>
      <div className="mt-1.5 rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-surface-2)] px-3 py-2.5">
        {children}
      </div>
    </div>
  );
}

export function EnvoyeeCard({
  titre,
  message,
  retourLabel,
  onRecommencer,
}: {
  titre: string;
  message: string;
  retourLabel: string;
  onRecommencer: () => void;
}) {
  const { t } = useDashboardLangue();
  return (
    <Card className="!bg-[var(--dashboard-card-bg)]">
      <div className="flex flex-col items-center py-6 text-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dcf5e3] text-[#178a3f]">
          <CheckCircleIcon />
        </span>
        <p className="mt-3 text-sm font-bold">{titre}</p>
        <p className="mt-1 max-w-sm text-xs text-[var(--dashboard-text)]/50">{message}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRecommencer}
            className="rounded-full border border-[var(--dashboard-text)]/15 px-4 py-2 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
          >
            {retourLabel}
          </button>
          <Link
            href="/dashboard/demandes"
            className="rounded-full bg-[#141220] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
          >
            {t("Retour aux demandes", "Back to requests")}
          </Link>
        </div>
      </div>
    </Card>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.4 12.2 2.6 2.6 4.8-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
