"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, ProduitCarousel, SectionHeader, StatRow, Tag } from "../dashboard-accueil/shared";

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
  badges: ["Certifiée", "Visitée par LM", "Centre d'appel"],
  infos: [
    { label: "Créée en", value: "2019" },
    { label: "Employés", value: "24" },
    { label: "Entrepôts", value: "3 sites" },
    { label: "Engins de distribution", value: "31" },
    { label: "Représentations", value: "5 villes" },
    { label: "Abonnement mensuel", value: "25 000 F" },
    { label: "Frais logistiques", value: "1 500 F" },
    { label: "Emballage", value: "Inclus" },
    { label: "Garantie perte", value: "Facultative · 500 F" },
    { label: "Livraison express", value: "2 000 F" },
    { label: "Récupération", value: "1 000 F" },
    { label: "Délai moyen", value: "26 h" },
  ],
};

const PROCHAIN_PRODUIT = {
  nom: "Enceinte nomade B4",
  arriveeLe: "4 septembre",
  note: "Prochainement au catalogue de votre partenaire. Prix communiqué à l'arrivée du stock.",
  // Une seule image mock pour l'instant ; le carousel est prêt à en recevoir
  // plusieurs à l'arrivée des vraies photos produit, cf.
  // [[dashboard-mock-data-pending-laravel-api]].
  images: ["/images/baff.png", "/images/iphone.jpg"],
};

const INFOS_VISIBLES = 9;

export default function PartenaireAgree({ first = true }: { first?: boolean }) {
  const [infosOuvertes, setInfosOuvertes] = useState(false);

  return (
    <>
      <SectionHeader
        eyebrow="Partenaire agréé"
        title={PARTENAIRE.nom}
        subtitle="Identité, informations et prochains produits."
        first={first}
        layout="inline"
      />

      <div className="grid gap-4 lg:grid-cols-[334px_1fr]">
        <div>
          <div className="rounded-2xl bg-white p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
            <div className="flex items-center gap-3">
              <span className="h-14 w-14 shrink-0 rounded-2xl bg-[linear-gradient(140deg,#2F6BE0,#011847)]" />
              <div>
                <p className="text-base font-semibold tracking-tight">{PARTENAIRE.nom}</p>
                <p className="text-xs text-[#141220]/50">{PARTENAIRE.ville}</p>
              </div>
            </div>
            <div className="my-3 h-px bg-[#141220]/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#141220]/40">Note du réseau</p>
                <p className="text-base font-bold">
                  {PARTENAIRE.note.toLocaleString("fr-FR")} <span className="text-xs font-normal text-[#141220]/50">/ 10</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#141220]/40">Affiliée depuis</p>
                <p className="text-sm font-semibold">{PARTENAIRE.affilieeDepuis}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PARTENAIRE.badges.map((b) => (
                <Tag key={b} tone="dark">{b}</Tag>
              ))}
            </div>
          </div>

          <Card title="Informations du partenaire" className="relative mt-3 overflow-hidden">
            <div
              className="transition-[max-height] duration-300"
              style={{ maxHeight: infosOuvertes ? PARTENAIRE.infos.length * 32 : INFOS_VISIBLES * 32 }}
            >
              {PARTENAIRE.infos.map((row) => (
                <StatRow key={row.label} label={row.label} value={row.value} bold={false} />
              ))}
            </div>

            {!infosOuvertes && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-end justify-center bg-[linear-gradient(rgba(255,255,255,0),#fff_65%)] pb-1">
                <button
                  type="button"
                  onClick={() => setInfosOuvertes(true)}
                  className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#141220]/10 bg-white px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#141220]/60 shadow-[0_2px_10px_rgba(20,18,32,0.08)]"
                >
                  Dérouler
                  <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </Card>

          <button
            type="button"
            className="mt-3 w-full rounded-full border border-brand-pink/45 bg-white/60 px-4 py-2.5 text-center text-xs font-semibold text-brand-pink"
          >
            Ouvrir un litige
          </button>
        </div>

        <div className="relative flex min-h-[480px] flex-col justify-end overflow-hidden rounded-3xl bg-white p-6 text-white">
          <ProduitCarousel images={PROCHAIN_PRODUIT.images} />
          {/* Dégradé produit : image du produit visible en haut, fondu vers le noir en bas pour la lisibilité du texte. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(238.49deg,rgba(217,217,217,0)_51.88%,#000000_120.52%)]" />
          <div className="relative">
            <Tag tone="pink">Arrive le {PROCHAIN_PRODUIT.arriveeLe}</Tag>
            <p className="mt-2.5 text-3xl font-semibold tracking-tight">{PROCHAIN_PRODUIT.nom}</p>
            <p className="mt-1 max-w-md text-xs text-white/60">{PROCHAIN_PRODUIT.note}</p>
            <Link
              href="/dashboard/produits?tab=catalogue"
              className="mt-4 inline-block rounded-full border border-white/20 bg-black/40 px-4 py-2.5 text-xs font-semibold backdrop-blur-md"
            >
              Voir les produits disponibles en drop
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
