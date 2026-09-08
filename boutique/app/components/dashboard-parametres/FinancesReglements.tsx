"use client";

import { useState } from "react";
import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";

/*
  Écran 27 "Réglages · finances et règlements" : devise, portefeuilles par
  opérateur (lecture seule — ouverts par LM), carte de prélèvement de
  l'abonnement, et documents comptables. Recevoir (les portefeuilles) et
  payer (la carte) n'ont rien à voir, la fiche les sépare nettement,
  comme la fiche de référence. Champs statiques pour l'instant, cf.
  mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

type Devise = "cfa" | "eur" | "usd";

const DEVISES: { key: Devise; label: string }[] = [
  { key: "cfa", label: "Franc CFA · F" },
  { key: "eur", label: "Euro · €" },
  { key: "usd", label: "Dollar · $" },
];

const PORTEFEUILLES = [
  { label: "Orange Money" },
  { label: "MTN MoMo" },
  { label: "Wave" },
  { label: "Moov Money" },
];

export default function FinancesReglements({ first = false }: { first?: boolean }) {
  const [devise, setDevise] = useState<Devise>("cfa");
  const [raisonSociale, setRaisonSociale] = useState("Awa Beauté");
  const [contribuable, setContribuable] = useState("");
  const [regimeTva, setRegimeTva] = useState("Non assujettie");
  const [exercice, setExercice] = useState("Janvier – décembre");
  const [emettreRecu, setEmettreRecu] = useState(true);
  const [exportMensuel, setExportMensuel] = useState(true);
  const [enregistre, setEnregistre] = useState(false);

  const enregistrer = () => {
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 1800);
  };

  return (
    <>
      <SectionHeader
        eyebrow="Finances et règlements"
        title="Recevoir d'un côté, payer de l'autre"
        subtitle="Votre devise, vos portefeuilles, votre carte de prélèvement et vos mentions comptables."
        first={first}
        layout="inline"
      />

      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={enregistrer}
          className="rounded-full bg-[#141220] px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
        >
          {enregistre ? "✓ Enregistré" : "Enregistrer"}
        </button>
      </div>

      <div className="grid gap-3">
        <Card title="Devise de référence" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex flex-wrap gap-2">
            {DEVISES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDevise(key)}
                aria-pressed={devise === key}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                  devise === key
                    ? "bg-[#141220] text-white dark:bg-brand-pink"
                    : "border border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/60 hover:bg-[var(--dashboard-text)]/[0.05]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            Choisie une fois, elle s&apos;applique à tous les montants de la plateforme : prix,
            frais, règlements, factures. La modifier convertit l&apos;affichage, jamais les
            montants déjà enregistrés.
          </p>
        </Card>

        <Card title="Vos portefeuilles" titleTab badge={<Tag tone="warn">Lecture seule</Tag>} className="!bg-[var(--dashboard-card-bg)]">
          <div className="divide-y divide-[var(--dashboard-text)]/10">
            {PORTEFEUILLES.map(({ label }) => (
              <div key={label} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dcf5e3] text-[#178a3f]">
                  <WalletIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{label}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
                    Reçoit ce que vos clients paient par {label}
                  </p>
                </div>
                <Tag tone="ok" className="shrink-0">
                  Ouvert par LM
                </Tag>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            Vous ne choisissez pas où vous recevez votre argent : chaque opérateur a son
            portefeuille, ouvert pour vous par LM, et vous êtes réglé sur celui par lequel le
            client a payé. Un client qui règle par Wave alimente votre portefeuille Wave. Vous ne
            pouvez ni en ajouter, ni en retirer : la liste suit les moyens de paiement acceptés sur
            votre page de commande.
          </p>
        </Card>

        <Card title="Votre carte de prélèvement" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
              <CardIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">Visa •••• 4417</p>
              <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">Prélevée le 14 de chaque mois</p>
            </div>
            <Tag tone="ok" className="shrink-0">
              Active
            </Tag>
            <button
              type="button"
              className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              Changer
            </button>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-full border border-[var(--dashboard-text)]/15 px-4 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
          >
            Enregistrer une autre carte Visa ou Mastercard
          </button>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            Cette carte ne sert qu&apos;à une chose : le prélèvement de votre abonnement mensuel.
            Elle ne reçoit jamais d&apos;argent, et aucun autre montant n&apos;y est prélevé.
          </p>
        </Card>

        <Card title="Documents comptables" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ label="Raison sociale" value={raisonSociale} onChange={setRaisonSociale} />
            <Champ
              label="Numéro de contribuable"
              value={contribuable}
              placeholder="Non renseigné"
              onChange={setContribuable}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ label="Régime de TVA" value={regimeTva} onChange={setRegimeTva} />
            <Champ label="Exercice comptable" value={exercice} onChange={setExercice} />
          </div>

          <div className="my-4 h-px bg-[var(--dashboard-text)]/10" />

          <div className="flex items-center justify-between gap-3 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">Émettre un reçu au client</p>
              <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
                Envoyé automatiquement après chaque livraison payée.
              </p>
            </div>
            <ToggleSwitch checked={emettreRecu} onChange={() => setEmettreRecu((v) => !v)} label="Émettre un reçu au client" />
          </div>
          <div className="flex items-center justify-between gap-3 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">Export mensuel des ventes</p>
              <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
                Un fichier récapitulatif le premier de chaque mois.
              </p>
            </div>
            <ToggleSwitch checked={exportMensuel} onChange={() => setExportMensuel((v) => !v)} label="Export mensuel des ventes" />
          </div>
        </Card>
      </div>
    </>
  );
}

const champBoxClasses =
  "mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/50 focus:bg-brand-pink/5";

function Champ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{label}</p>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={champBoxClasses}
      />
    </div>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3" y="6.5" width="18" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15.5" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3" y="6.5" width="18" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* Même composant que dashboard-profil/MotDePasseSecurite.tsx, repris à
   l'identique — pas encore mutualisé dans shared.tsx. */
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
        checked ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[var(--dashboard-text)]/20"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}
