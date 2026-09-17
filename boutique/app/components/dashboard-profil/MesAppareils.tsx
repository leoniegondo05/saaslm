"use client";

import { useState } from "react";
import { SectionHeader, Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran "Mes appareils connectés", atteint depuis "Mes appareils" dans le
  menu du compte (voir DashboardHeader) : liste des appareils actuellement
  connectés au compte, avec possibilité de déconnecter un appareil
  individuellement ou tous sauf celui utilisé pour consulter la page —
  cf. maquette fournie.

  Données statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] — à remplacer par la vraie
  liste de sessions dès que l'API Laravel l'exposera. Le compte de badge
  "3 ouverts" est dérivé de cette liste, contrairement à
  APPAREILS_CONNECTES_COUNT (MonProfil.tsx / menu du compte) qui reste une
  constante séparée pour l'instant faute d'état partagé entre écrans.
*/

type Statut = "actuel" | "normal" | "inhabituel";

type Appareil = {
  id: string;
  type: "ordinateur" | "telephone";
  lieu: string;
  quand: string;
  quandEn: string;
  statut: Statut;
};

const APPAREILS: Appareil[] = [
  { id: "d1", type: "ordinateur", lieu: "Abidjan", quand: "aujourd'hui à 07:42", quandEn: "today at 7:42am", statut: "actuel" },
  { id: "d2", type: "telephone", lieu: "Abidjan", quand: "hier à 21:15", quandEn: "yesterday at 9:15pm", statut: "normal" },
  { id: "d3", type: "ordinateur", lieu: "Bouaké", quand: "il y a 12 jours", quandEn: "12 days ago", statut: "inhabituel" },
];

export default function MesAppareils() {
  const { t } = useDashboardLangue();
  const [appareils, setAppareils] = useState(APPAREILS);

  const deconnecter = (id: string) =>
    setAppareils((liste) => liste.filter((a) => a.id !== id || a.statut === "actuel"));

  const deconnecterTout = () =>
    setAppareils((liste) => liste.filter((a) => a.statut === "actuel"));

  const autresConnectes = appareils.some((a) => a.statut !== "actuel");

  return (
    <>
      <SectionHeader
        eyebrow={t("Mon compte", "My account")}
        title={t("Mes appareils connectés", "My connected devices")}
        subtitle={t("Les appareils actuellement connectés à votre compte.", "The devices currently connected to your account.")}
        count={t(`${appareils.length} ouvert${appareils.length > 1 ? "s" : ""}`, `${appareils.length} open`)}
        first
        layout="inline"
        actions={
          <button
            type="button"
            onClick={deconnecterTout}
            disabled={!autresConnectes}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#c8262d]/25 bg-[var(--dashboard-card-bg)] px-3.5 py-1.5 text-xs font-semibold text-[#c8262d] shadow-[0_2px_12px_rgba(20,18,32,0.05)] transition hover:bg-[#ffe1e2] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--dashboard-card-bg)]"
          >
            <LogOutIcon />
            {t("Tout déconnecter", "Disconnect all")}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {appareils.map((appareil) => (
          <AppareilCard key={appareil.id} appareil={appareil} onDeconnecter={() => deconnecter(appareil.id)} />
        ))}
      </div>
    </>
  );
}

const STATUT_STYLES: Record<Statut, { ring: string; icon: string; tag: "ok" | "warn" | null }> = {
  actuel: { ring: "ring-1 ring-inset ring-[#178a3f]/20", icon: "bg-[#dcf5e3] text-[#178a3f]", tag: "ok" },
  normal: { ring: "ring-1 ring-inset ring-[var(--dashboard-text)]/[0.06]", icon: "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60", tag: null },
  inhabituel: { ring: "ring-1 ring-inset ring-[#f5a623]/25", icon: "bg-[#fff1d6] text-[#a8690a]", tag: "warn" },
};

function AppareilCard({ appareil, onDeconnecter }: { appareil: Appareil; onDeconnecter: () => void }) {
  const { t } = useDashboardLangue();
  const styles = STATUT_STYLES[appareil.statut];
  const estActuel = appareil.statut === "actuel";

  return (
    <div className={`flex flex-col rounded-2xl bg-[var(--dashboard-card-bg)] p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] ${styles.ring}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          {appareil.type === "ordinateur" ? <LaptopIcon /> : <PhoneIcon />}
        </span>
        {styles.tag && (
          <Tag tone={styles.tag}>
            {estActuel ? t("Cet appareil", "This device") : t("Inhabituel", "Unusual")}
          </Tag>
        )}
      </div>

      <p className="mt-3 text-sm font-bold text-[var(--dashboard-text)]">
        {appareil.type === "ordinateur" ? t("Ordinateur", "Computer") : t("Téléphone", "Phone")}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--dashboard-text)]/40">
        <PinIcon />
        {appareil.lieu}
        <span aria-hidden>·</span>
        {texteAvecChiffres(t(appareil.quand, appareil.quandEn))}
      </p>

      <div className="mt-3 h-px bg-[var(--dashboard-text)]/10" />

      <div className="mt-3">
        {estActuel ? (
          <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--dashboard-text)]/35">
            <LockIcon />
            {t("Ne peut pas se fermer", "Can't be closed")}
          </p>
        ) : (
          <button
            type="button"
            onClick={onDeconnecter}
            className="w-full rounded-full border border-[#c8262d]/30 py-2 text-xs font-bold text-[#c8262d] transition hover:bg-[#ffe1e2]"
          >
            {t("Déconnecter", "Disconnect")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 19.5h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
      <path
        d="M12 21s-6.5-5.4-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.6-6.5 11-6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M9 21H5.5a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 5.5 3H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 16.5 20.5 12 16 7.5M9.5 12h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
