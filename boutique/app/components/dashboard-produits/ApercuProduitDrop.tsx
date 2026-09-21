"use client";

import Link from "next/link";
import { useState } from "react";
import { ProduitCarousel, Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
import type { DropProduit } from "./dropCatalogue";
import { getCategoryLabelEn } from "./dropCatalogue";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Aperçu produit atteint depuis le bouton "Voir la fiche" de l'aperçu en
  avant du catalogue drop (Écran 05, CatalogueDrop.tsx) — différent de la
  fiche complète (Écran 06, FicheProduitDrop.tsx, atteinte elle depuis une
  tuile) : juste les photos en grand et un bouton "Je suis intéressé" (mock, cf.
  [[dashboard-mock-data-pending-laravel-api]] : pas de vraie commande tant
  que le backend n'existe pas). Pas de prix détaillé, description ni
  simulateur ici.
*/
export default function ApercuProduitDrop({ produit }: { produit: DropProduit }) {
  const { t } = useDashboardLangue();
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

      {/* ── Galerie + infos côte à côte ── */}
      <div className="mt-4 grid items-start gap-8" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px' }}>

        {/* Galerie (colonne gauche) */}
        <div className="min-w-0">
          <ProduitCarousel images={produit.images ?? []} />
        </div>

        {/* Infos produit (colonne droite) */}
        <div>
          <div className="flex flex-wrap gap-1.5">
            <Tag tone="pink">{produit.source === "L" ? t("Drop LM", "LM drop") : t("Partenaire", "Partner")}</Tag>
            {produit.unitesDisponibles !== undefined && (
              <Tag tone="neutral">
                <span>{t("Disponible", "Available")} · {texteAvecChiffres(t(`${produit.unitesDisponibles} unités`, `${produit.unitesDisponibles} units`))}</span>
              </Tag>
            )}
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{texteAvecChiffres(t(produit.nom, produit.nomEn ?? produit.nom))}</p>
          <p className="mt-1 text-xs text-[var(--dashboard-text)]/50">
            {texteAvecChiffres([categorieLabel, conditionnementLabel, produit.contenance].filter(Boolean).join(" · "))}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setInteresse(true)}
              disabled={interesse}
              aria-pressed={interesse}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                interesse ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/60" : "bg-[#141220] text-white hover:brightness-95 dark:bg-brand-pink"
              }`}
            >
              {interesse ? t("Intérêt enregistré", "Interest saved") : t("Je suis intéressé", "I'm interested")}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[var(--dashboard-text)]/50">
            {t("Ce sont des articles à venir : dites que ça vous intéresse.", "These are upcoming products: let us know you're interested.")}
          </p>
        </div>
      </div>
    </>
  );
}
