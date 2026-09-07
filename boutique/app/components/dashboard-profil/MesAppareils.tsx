"use client";

import { useState } from "react";
import { SectionHeader } from "../dashboard-accueil/shared";

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
  statut: Statut;
};

const APPAREILS: Appareil[] = [
  { id: "d1", type: "ordinateur", lieu: "Abidjan", quand: "aujourd'hui à 07:42", statut: "actuel" },
  { id: "d2", type: "telephone", lieu: "Abidjan", quand: "hier à 21:15", statut: "normal" },
  { id: "d3", type: "ordinateur", lieu: "Bouaké", quand: "il y a 12 jours", statut: "inhabituel" },
];

export default function MesAppareils() {
  const [appareils, setAppareils] = useState(APPAREILS);

  const deconnecter = (id: string) =>
    setAppareils((liste) => liste.filter((a) => a.id !== id || a.statut === "actuel"));

  const deconnecterTout = () =>
    setAppareils((liste) => liste.filter((a) => a.statut === "actuel"));

  const autresConnectes = appareils.some((a) => a.statut !== "actuel");

  return (
    <>
      <SectionHeader
        eyebrow="Mon compte"
        title="Mes appareils connectés"
        subtitle="Les appareils actuellement connectés à votre compte."
        count={`${appareils.length} ouvert${appareils.length > 1 ? "s" : ""}`}
        first
        layout="inline"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {appareils.map((appareil) => (
          <AppareilCard key={appareil.id} appareil={appareil} onDeconnecter={() => deconnecter(appareil.id)} />
        ))}
      </div>

      <button
        type="button"
        onClick={deconnecterTout}
        disabled={!autresConnectes}
        className="mt-4 w-full rounded-full border border-[#c8262d]/30 bg-[var(--dashboard-card-bg)] py-3.5 text-sm font-bold text-[#c8262d] shadow-[0_8px_20px_-6px_rgba(20,18,32,0.12)] transition hover:bg-[#ffe1e2] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--dashboard-card-bg)]"
      >
        Tout déconnecter sauf cet appareil
      </button>
    </>
  );
}

const STATUT_STYLES: Record<Statut, { card: string; icon: string; badge?: { label: string; className: string } }> = {
  actuel: {
    card: "border border-[#178a3f]/25 bg-[#178a3f]/[0.04]",
    icon: "bg-[#dcf5e3] text-[#178a3f]",
    badge: { label: "Cet appareil", className: "bg-[#dcf5e3] text-[#178a3f]" },
  },
  normal: {
    card: "border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)]",
    icon: "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60",
  },
  inhabituel: {
    card: "border border-[#f5a623]/30 bg-[#f5a623]/[0.05]",
    icon: "bg-[#fff1d6] text-[#a8690a]",
    badge: { label: "Inhabituel", className: "bg-[#fff1d6] text-[#a8690a]" },
  },
};

function AppareilCard({ appareil, onDeconnecter }: { appareil: Appareil; onDeconnecter: () => void }) {
  const styles = STATUT_STYLES[appareil.statut];
  const estActuel = appareil.statut === "actuel";

  return (
    <div className={`flex flex-col rounded-[24px] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.1)] ${styles.card}`}>
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${styles.icon}`}>
        {appareil.type === "ordinateur" ? <LaptopIcon /> : <PhoneIcon />}
      </span>

      <p className="mt-4 text-lg font-bold text-[var(--dashboard-text)]">
        {appareil.type === "ordinateur" ? "Ordinateur" : "Téléphone"}
      </p>
      <p className="mt-1 text-sm text-[var(--dashboard-text)]/45">
        {appareil.lieu} · {appareil.quand}
      </p>

      <div className="mt-4 h-px bg-[var(--dashboard-text)]/10" />

      <div className="mt-4 flex items-center justify-between gap-3">
        {styles.badge && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge.className}`}>
            {styles.badge.label}
          </span>
        )}
        {estActuel ? (
          <span className="text-xs text-[var(--dashboard-text)]/35">Ne peut pas se fermer</span>
        ) : (
          <button
            type="button"
            onClick={onDeconnecter}
            className="w-full rounded-full border border-[#c8262d]/30 bg-[var(--dashboard-card-bg)] py-2.5 text-sm font-bold text-[#c8262d] transition hover:bg-[#ffe1e2]"
          >
            Déconnecter
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 19.5h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
