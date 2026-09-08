"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, ProduitCarousel, SectionHeader, StatRow, Tag } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran 04 "Le partenaire agréé" : identité du partenaire, ses informations
  (barème logistique) et le prochain produit à venir chez lui, avec un lien
  vers le catalogue drop complet (Écran 05). Atteint depuis l'onglet
  "Partenaire agréé" de ProduitsNav, ou la chip "Partenaire agréé" du header
  (voir DashboardHeader) sur n'importe quel écran du dashboard.

  Une seule fiche pour l'instant (le partenaire de la boutique connectée) —
  pas de tableau de partenaires, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

const PARTENAIRE = {
  nom: "Groupe Logistique Ivoire",
  ville: "Cocody Riviera · Abidjan",
  note: 8.4,
  affilieeDepuis: "14 mars 2026",
  affilieeDepuisEn: "March 14, 2026",
  badges: [
    { fr: "Certifiée", en: "Certified" },
    { fr: "Visitée par LM", en: "Visited by LM" },
    { fr: "Centre d'appel", en: "Call center" },
  ],
  infos: [
    { label: "Créée en", labelEn: "Founded in", value: "2019" },
    { label: "Employés", labelEn: "Employees", value: "24" },
    { label: "Entrepôts", labelEn: "Warehouses", value: "3 sites", valueEn: "3 sites" },
    { label: "Engins de distribution", labelEn: "Delivery vehicles", value: "31" },
    { label: "Représentations", labelEn: "Locations", value: "5 villes", valueEn: "5 cities" },
    { label: "Abonnement mensuel", labelEn: "Monthly subscription", value: "25 000 F" },
    { label: "Frais logistiques", labelEn: "Logistics fees", value: "1 500 F" },
    { label: "Emballage", labelEn: "Packaging", value: "Inclus", valueEn: "Included" },
    { label: "Garantie perte", labelEn: "Loss protection", value: "Facultative · 500 F", valueEn: "Optional · 500 F" },
    { label: "Livraison express", labelEn: "Express delivery", value: "2 000 F" },
    { label: "Récupération", labelEn: "Recovery", value: "1 000 F" },
    { label: "Délai moyen", labelEn: "Average lead time", value: "26 h" },
  ],
};

const PROCHAIN_PRODUIT = {
  nom: "Enceinte nomade B4",
  nomEn: "B4 portable speaker",
  arriveeLe: "4 septembre",
  arriveeLeEn: "Sept. 4",
  note: "Prochainement au catalogue de votre partenaire. Prix communiqué à l'arrivée du stock.",
  noteEn: "Coming soon to your partner's catalog. Price to be announced on stock arrival.",
  // Une seule image mock pour l'instant ; le carousel est prêt à en recevoir
  // plusieurs à l'arrivée des vraies photos produit, cf.
  // [[dashboard-mock-data-pending-laravel-api]].
  images: ["/images/baff.png", "/images/iphone.jpg"],
};

const INFOS_VISIBLES = 9;

export default function PartenaireAgree({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [infosOuvertes, setInfosOuvertes] = useState(false);

  return (
    <>
      <SectionHeader
        eyebrow={t("Partenaire agréé", "Approved partner")}
        title={PARTENAIRE.nom}
        subtitle={t("Identité, informations et prochains produits.", "Identity, details and upcoming products.")}
        first={first}
        layout="inline"
      />

      <div className="grid gap-4 lg:grid-cols-[334px_1fr] [&>*]:min-w-0">
        <div>
          <div className="rounded-2xl bg-[var(--dashboard-card-bg)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
            <div className="flex items-center gap-3">
              <span className="h-14 w-14 shrink-0 rounded-2xl bg-[linear-gradient(140deg,#2F6BE0,#011847)]" />
              <div>
                <p className="text-base font-semibold tracking-tight">{PARTENAIRE.nom}</p>
                <p className="text-xs text-[var(--dashboard-text)]/50">{PARTENAIRE.ville}</p>
              </div>
            </div>
            <div className="my-3 h-px bg-[var(--dashboard-text)]/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("Note du réseau", "Network rating")}</p>
                <p className="text-base font-bold">
                  {PARTENAIRE.note.toLocaleString("fr-FR")} <span className="text-xs font-normal text-[var(--dashboard-text)]/50">/ 10</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("Affiliée depuis", "Partner since")}</p>
                <p className="text-sm font-semibold">{t(PARTENAIRE.affilieeDepuis, PARTENAIRE.affilieeDepuisEn)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PARTENAIRE.badges.map((b) => (
                <Tag key={b.fr} tone="dark">{t(b.fr, b.en)}</Tag>
              ))}
            </div>
          </div>

          <Card title={t("Informations du partenaire", "Partner details")} titleTab className="relative mt-3 overflow-hidden !bg-[var(--dashboard-card-bg)]">
            <div
              className="transition-[max-height] duration-300"
              style={{ maxHeight: infosOuvertes ? PARTENAIRE.infos.length * 32 : INFOS_VISIBLES * 32 }}
            >
              {PARTENAIRE.infos.map((row) => (
                <StatRow key={row.label} label={t(row.label, row.labelEn)} value={t(row.value, row.valueEn ?? row.value)} bold={false} />
              ))}
            </div>

            {!infosOuvertes && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-end justify-center bg-[linear-gradient(transparent,var(--dashboard-card-bg)_65%)] pb-1">
                <button
                  type="button"
                  onClick={() => setInfosOuvertes(true)}
                  className="pointer-events-auto flex items-center gap-1 rounded-full border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/60 shadow-[0_2px_10px_rgba(20,18,32,0.08)]"
                >
                  {t("Dérouler", "Expand")}
                  <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </Card>

          <button
            type="button"
            className="mt-3 w-full rounded-full border border-brand-pink/45 bg-[var(--dashboard-card-bg)]/60 px-4 py-2.5 text-center text-xs font-semibold text-brand-pink"
          >
            {t("Ouvrir un litige", "Open a dispute")}
          </button>
        </div>

        <div className="relative flex min-h-[480px] flex-col justify-end overflow-hidden rounded-3xl bg-[var(--dashboard-card-bg)] p-6 text-white">
          <ProduitCarousel images={PROCHAIN_PRODUIT.images} />
          {/* Dégradé produit : image du produit visible en haut, fondu vers le noir en bas pour la lisibilité du texte. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(217,217,217,0)_40%,#000000_92%)]" />
          <div className="relative">
            <Tag tone="pink">{t(`Arrive le ${PROCHAIN_PRODUIT.arriveeLe}`, `Arriving ${PROCHAIN_PRODUIT.arriveeLeEn}`)}</Tag>
            <p className="mt-2.5 text-3xl font-semibold tracking-tight">{t(PROCHAIN_PRODUIT.nom, PROCHAIN_PRODUIT.nomEn)}</p>
            <p className="mt-1 max-w-md text-xs text-white/60">{t(PROCHAIN_PRODUIT.note, PROCHAIN_PRODUIT.noteEn)}</p>
            <Link
              href="/dashboard/produits?tab=catalogue"
              className="mt-4 inline-block rounded-full border border-white/20 bg-black/40 px-4 py-2.5 text-xs font-semibold backdrop-blur-md"
            >
              {t("Voir les produits disponibles en drop", "View products available in drop")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
