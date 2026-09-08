"use client";

import { useState } from "react";
import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";

/*
  Écran 26 "Réglages · la page de commande" : le format du lien de
  commande, ce que la plateforme impose d'afficher (non modifiable), et
  les moyens de paiement acceptés. Tout est éditable directement, comme
  "Ma boutique" — pas de mode "Modifier" préalable. Champs statiques pour
  l'instant, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].

  L'allure de la page elle-même (couleurs, mise en page) se règle dans
  "Personnaliser ma boutique" (fiche "Ma boutique"), pas ici.
*/

type FormatLien = "nom" | "reference" | "nom-reference";

const EXEMPLES_LIEN: Record<FormatLien, string> = {
  nom: "serum-eclat-30ml",
  reference: "SKU-14829",
  "nom-reference": "serum-eclat-30ml-SKU14829",
};

const MOYENS_PAIEMENT_INIT = [
  { key: "orange", label: "Orange Money", actif: true },
  { key: "mtn", label: "MTN MoMo", actif: true },
  { key: "wave", label: "Wave", actif: true },
  { key: "moov", label: "Moov Money", actif: true },
  { key: "carte", label: "Carte bancaire", actif: false },
  { key: "livraison", label: "Paiement à la livraison", actif: false },
];

export default function PageDeCommande({ first = false }: { first?: boolean }) {
  const [format, setFormat] = useState<FormatLien>("nom");
  const [moyens, setMoyens] = useState(MOYENS_PAIEMENT_INIT);
  const [copie, setCopie] = useState(false);
  const [enregistre, setEnregistre] = useState(false);

  const basculerMoyen = (key: string) =>
    setMoyens((liste) => liste.map((m) => (m.key === key ? { ...m, actif: !m.actif } : m)));

  const lienComplet = `lm.ci/awa-beaute/${EXEMPLES_LIEN[format]}`;

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(`https://${lienComplet}`);
    } catch {
      // presse-papier indisponible (permissions navigateur) — pas bloquant
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 1800);
  };

  const enregistrer = () => {
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 1800);
  };

  return (
    <>
      <SectionHeader
        eyebrow="Page de commande"
        title="Le lien, l'imposé, les paiements"
        subtitle="L'allure de la page se règle dans « Personnaliser ma boutique » — ici, ce n'est que le lien et les paiements."
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
        <Card title="Le lien de commande" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-xs">
            <span className="text-[var(--dashboard-text)]/40">lm.ci/awa-beaute/</span>
            <span className="font-bold text-[var(--dashboard-text)]">{EXEMPLES_LIEN[format]}</span>
            <button
              type="button"
              onClick={copier}
              className="ml-auto rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              {copie ? "✓ Copié" : "Copier"}
            </button>
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            Chaque produit a son propre lien, celui qu&apos;on colle dans une publicité. Le format
            se règle ici, une fois pour tous les produits.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FormatChip label="Nom du produit" active={format === "nom"} onClick={() => setFormat("nom")} />
            <FormatChip label="Référence" active={format === "reference"} onClick={() => setFormat("reference")} />
            <FormatChip
              label="Nom et référence"
              active={format === "nom-reference"}
              onClick={() => setFormat("nom-reference")}
            />
          </div>
        </Card>

        <Card title="Ce qui s'affiche toujours" titleTab badge={<Tag tone="warn">Non modifiable</Tag>} className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-xs text-[var(--dashboard-text)]/50">
            Fixé par la plateforme, sur toutes les pages de commande du réseau. Le client doit
            savoir quand il sera livré avant de payer.
          </p>
          <div className="mt-3 space-y-2">
            <ImposeRow
              titre="Le délai de livraison · 4 heures en moyenne"
              note="Le même sur toutes les pages du réseau. Seules les livraisons express font exception."
            />
            <ImposeRow
              titre="Le prix, frais de livraison compris"
              note="Aucun montant ne peut apparaître après le paiement."
            />
          </div>
        </Card>

        <Card title="Moyens de paiement proposés" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="divide-y divide-[var(--dashboard-text)]/10">
            {moyens.map((m) => (
              <div key={m.key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="text-xs font-semibold text-[var(--dashboard-text)]">{m.label}</span>
                <ToggleSwitch checked={m.actif} onChange={() => basculerMoyen(m.key)} label={m.label} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            Les frais de paiement en ligne dépendent du moyen choisi par le client et apparaissent
            dans le détail de chaque commande.
          </p>
        </Card>
      </div>
    </>
  );
}

function FormatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#141220] text-white dark:bg-brand-pink"
          : "border border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/60 hover:bg-[var(--dashboard-text)]/[0.05]"
      }`}
    >
      {label}
    </button>
  );
}

function ImposeRow({ titre, note }: { titre: string; note: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcf5e3] text-[#178a3f]">
        <CheckIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[var(--dashboard-text)]">{titre}</p>
        <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">{note}</p>
      </div>
      <Tag tone="neutral" className="shrink-0">
        Toujours affiché
      </Tag>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="m6 12.5 4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
