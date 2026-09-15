"use client";

import { useState } from "react";
import { Card, SectionHeader, Tag, useMockSave } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

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
  { key: "orange", label: "Orange Money", labelEn: "Orange Money", actif: true },
  { key: "mtn", label: "MTN MoMo", labelEn: "MTN MoMo", actif: true },
  { key: "wave", label: "Wave", labelEn: "Wave", actif: true },
  { key: "moov", label: "Moov Money", labelEn: "Moov Money", actif: true },
  { key: "carte", label: "Carte bancaire", labelEn: "Bank card", actif: false },
  { key: "livraison", label: "Paiement à la livraison", labelEn: "Cash on delivery", actif: false },
];

export default function PageDeCommande({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [format, setFormat] = useState<FormatLien>("nom");
  const [moyens, setMoyens] = useState(MOYENS_PAIEMENT_INIT);
  const [copie, setCopie] = useState(false);
  const { saving, done, trigger } = useMockSave();

  const basculerMoyen = (key: string) =>
    setMoyens((liste) => liste.map((m) => (m.key === key ? { ...m, actif: !m.actif } : m)));

  const lienComplet = `awa-beaute.liivremoi.com/${EXEMPLES_LIEN[format]}`;

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.${lienComplet}`);
    } catch {
      // presse-papier indisponible (permissions navigateur) — pas bloquant
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 1800);
  };

  return (
    <>
      <SectionHeader
        eyebrow={t("Page de commande", "Order page")}
        title={t("Le lien, l'imposé, les paiements", "The link, the fixed rules, the payments")}
        subtitle={t(
          "L'allure de la page se règle dans « Personnaliser ma boutique » — ici, ce n'est que le lien et les paiements.",
          "The page's look is set in \"Customize my shop\" — here it's only the link and the payments."
        )}
        first={first}
        layout="inline"
      />

      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => trigger()}
          disabled={saving}
          className="rounded-full bg-[#141220] px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 dark:bg-brand-pink"
        >
          {saving ? t("Enregistrement…", "Saving…") : done ? t("✓ Enregistré", "✓ Saved") : t("Enregistrer", "Save")}
        </button>
      </div>

      <div className="grid gap-3">
        <Card title={t("Le lien de commande", "The order link")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-xs">
            <span className="text-[var(--dashboard-text)]/40">awa-beaute.liivremoi.com/</span>
            <span className="font-bold text-[var(--dashboard-text)]">{EXEMPLES_LIEN[format]}</span>
            <button
              type="button"
              onClick={copier}
              className="ml-auto rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              {copie ? t("✓ Copié", "✓ Copied") : t("Copier", "Copy")}
            </button>
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Chaque produit a son propre lien, celui qu'on colle dans une publicité. Le format se règle ici, une fois pour tous les produits.",
              "Each product has its own link, the one you paste into an ad. The format is set here, once for all products."
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FormatChip label={t("Nom du produit", "Product name")} active={format === "nom"} onClick={() => setFormat("nom")} />
            <FormatChip label={t("Référence", "Reference")} active={format === "reference"} onClick={() => setFormat("reference")} />
            <FormatChip
              label={t("Nom et référence", "Name and reference")}
              active={format === "nom-reference"}
              onClick={() => setFormat("nom-reference")}
            />
          </div>
        </Card>

        <Card title={t("Ce qui s'affiche toujours", "What's always shown")} titleTab badge={<Tag tone="warn">{t("Non modifiable", "Not editable")}</Tag>} className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Fixé par la plateforme, sur toutes les pages de commande du réseau. Le client doit savoir quand il sera livré avant de payer.",
              "Set by the platform, on every order page in the network. The customer must know when they'll be delivered before paying."
            )}
          </p>
          <div className="mt-3 space-y-2">
            <ImposeRow
              titre={t("Le délai de livraison · 4 heures en moyenne", "Delivery time · 4 hours on average")}
              note={t(
                "Le même sur toutes les pages du réseau. Seules les livraisons express font exception.",
                "The same on every page in the network. Only express deliveries are an exception."
              )}
            />
            <ImposeRow
              titre={t("Le prix, frais de livraison compris", "The price, delivery fees included")}
              note={t(
                "Aucun montant ne peut apparaître après le paiement.",
                "No amount can appear after payment."
              )}
            />
          </div>
        </Card>

        <Card title={t("Moyens de paiement proposés", "Payment methods offered")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="divide-y divide-[var(--dashboard-text)]/10">
            {moyens.map((m) => (
              <div key={m.key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="text-xs font-semibold text-[var(--dashboard-text)]">{t(m.label, m.labelEn)}</span>
                <ToggleSwitch checked={m.actif} onChange={() => basculerMoyen(m.key)} label={t(m.label, m.labelEn)} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Les frais de paiement en ligne dépendent du moyen choisi par le client et apparaissent dans le détail de chaque commande.",
              "Online payment fees depend on the method the customer chooses and appear in each order's detail."
            )}
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
  const { t } = useDashboardLangue();
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
        {t("Toujours affiché", "Always shown")}
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
