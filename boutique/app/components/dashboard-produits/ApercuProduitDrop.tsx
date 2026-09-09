"use client";

import Link from "next/link";
import { useState } from "react";
import { ProduitCarousel, Tag } from "../dashboard-accueil/shared";
import type { DropProduit } from "./dropCatalogue";
import { getCategoryLabelEn } from "./dropCatalogue";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Aperçu produit atteint depuis le bouton "Voir la fiche" de l'aperçu en
  avant du catalogue drop (Écran 05, CatalogueDrop.tsx) — différent de la
  fiche complète (Écran 06, FicheProduitDrop.tsx, atteinte elle depuis une
  tuile) : juste les photos en grand et un bouton "Précommander" (mock, cf.
  [[dashboard-mock-data-pending-laravel-api]] : pas de vraie commande tant
  que le backend n'existe pas). Pas de prix détaillé, description ni
  simulateur ici.
*/
export default function ApercuProduitDrop({ produit }: { produit: DropProduit }) {
  const { t } = useDashboardLangue();
  const [precommande, setPrecommande] = useState(false);
  const [interesse, setInteresse] = useState(false);

  const categorieLabel = t(produit.categorie, getCategoryLabelEn(produit.categorie));
  const conditionnementLabel = produit.conditionnement ? t(produit.conditionnement, produit.conditionnementEn ?? produit.conditionnement) : undefined;

  return (
    <>
      <Link
        href="/dashboard/produits/catalogue"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)]/60 px-3.5 py-2 text-xs font-semibold"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {categorieLabel}
      </Link>

      <div className="relative mt-4 flex min-h-[70vh] flex-col justify-end overflow-hidden rounded-3xl bg-[var(--dashboard-card-bg)] p-6 text-white">
        <ProduitCarousel images={produit.images ?? []} />
        {/* Dégradé produit : fondu vers le noir pour la lisibilité du texte.
            Vide tant que le produit n'a pas de photos, cf.
            [[dashboard-mock-data-pending-laravel-api]]. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(217,217,217,0)_40%,#000000_92%)]" />
        <div className="relative">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            <Tag tone="pink">{produit.source === "L" ? t("Drop LM", "LM drop") : t("Partenaire", "Partner")}</Tag>
            {produit.unitesDisponibles !== undefined && (
              <Tag tone="neutral">{t("Disponible", "Available")} · {t(`${produit.unitesDisponibles} unités`, `${produit.unitesDisponibles} units`)}</Tag>
            )}
          </div>
          <p className="text-3xl font-semibold tracking-tight">{t(produit.nom, produit.nomEn ?? produit.nom)}</p>
          <p className="mt-1 text-xs text-white/60">
            {[categorieLabel, conditionnementLabel, produit.contenance].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPrecommande(true)}
              disabled={precommande}
              aria-pressed={precommande}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                precommande ? "bg-white/15 text-white" : "bg-white text-[#141220] hover:brightness-95"
              }`}
            >
              {precommande ? t("Précommande enregistrée", "Preorder saved") : t("Précommander", "Preorder")}
            </button>
            <button
              type="button"
              onClick={() => setInteresse(true)}
              disabled={interesse}
              aria-pressed={interesse}
              className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                interesse ? "border-white/15 bg-white/15 text-white" : "border-white/30 text-white hover:bg-white/10"
              }`}
            >
              {interesse ? t("Intérêt enregistré", "Interest saved") : t("Je suis intéressé", "I'm interested")}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-white/50">
            {t("Ce sont des articles à venir : précommandez ou dites que ça vous intéresse.", "These are upcoming products: preorder or let us know you're interested.")}
          </p>
        </div>
      </div>
    </>
  );
}
