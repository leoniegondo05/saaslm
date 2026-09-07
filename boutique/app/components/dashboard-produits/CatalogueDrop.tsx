"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionHeader, Tag } from "../dashboard-accueil/shared";
import { CATEGORIES, DROP_PRODUITS } from "./dropCatalogue";

/*
  Écran 05 "Catalogue disponible en drop" : aperçu du produit en avant à
  gauche (les nouveautés de la catégorie), catégories au centre, produits de
  la catégorie choisie en carrés à droite. Chaque tuile mène à sa fiche
  (Écran 06, /dashboard/produits/catalogue/[slug]) — sauf les produits "à
  venir", qui n'ont pas encore de fiche.
*/

const F = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export default function CatalogueDrop({ first = true }: { first?: boolean }) {
  const [categorie, setCategorieRaw] = useState(CATEGORIES[0].nom);
  const [previewIndex, setPreviewIndex] = useState(0);
  const produits = DROP_PRODUITS.filter((p) => p.categorie === categorie);

  // Changer de catégorie repart toujours sur le premier aperçu.
  const setCategorie = (nom: string) => {
    setCategorieRaw(nom);
    setPreviewIndex(0);
  };

  const categorieActive = CATEGORIES.find((c) => c.nom === categorie);
  const nouveautes = produits.filter((p) => p.source !== "AVENIR").slice(0, categorieActive?.nouveautes ?? undefined);
  const preview = nouveautes[previewIndex];

  return (
    <>
      <SectionHeader
        eyebrow="Catalogue drop"
        title="Produits disponibles chez le partenaire"
        subtitle="Aucun stock à avancer : vous choisissez, il livre."
        first={first}
        layout="inline"
      />

      <div className="grid gap-4 lg:grid-cols-[260px_200px_1fr] [&>*]:min-w-0">
        <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 lg:mb-60">
          {/* Fond attend la photo du produit en avant (background-image sur cette
              div) ; le dégradé ci-dessous fait le fondu vers le noir pour la
              lisibilité du texte, cf. [[dashboard-mock-data-pending-laravel-api]]. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(217,217,217,0)_40%,#000000_92%)]" />
          {preview ? (
            <>
              {nouveautes.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((i) => (i - 1 + nouveautes.length) % nouveautes.length)}
                    aria-label="Produit précédent"
                    className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#141220]/25 text-white backdrop-blur-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                      <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((i) => (i + 1) % nouveautes.length)}
                    aria-label="Produit suivant"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#141220]/25 text-white backdrop-blur-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                      <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}

              <span className="relative z-10">
                <Tag tone={preview.source === "L" ? "pink" : "neutral"}>{preview.source === "L" ? "Drop LM" : "Partenaire"}</Tag>
              </span>

              <div className="relative z-10">
                <h3 className="text-base font-bold text-white">{preview.nom}</h3>
                <p className="mt-1 text-[11px] text-white/70">
                  Vous payez {F(preview.prixDrop!)} · conseillé {F(preview.prixConseille!)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Link
                    href={`/dashboard/produits/catalogue/${preview.slug}`}
                    className="rounded-full bg-[#141220] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:brightness-95 dark:bg-brand-pink"
                  >
                    Voir la fiche
                  </Link>
                  {nouveautes.length > 1 && (
                    <div className="flex items-center gap-1">
                      {nouveautes.map((_, i) => (
                        <span
                          key={i}
                          className={i === previewIndex ? "h-1.5 w-4 rounded-full bg-[var(--dashboard-card-bg)]" : "h-1.5 w-1.5 rounded-full bg-[var(--dashboard-card-bg)]/40"}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="relative z-10 m-auto max-w-[80%] text-center text-xs text-white/70">
              Catalogue de cette catégorie à venir.
            </p>
          )}
        </div>

      <div>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">Catégories</p>
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = cat.nom === categorie;
            return (
              <button
                key={cat.nom}
                type="button"
                onClick={() => setCategorie(cat.nom)}
                className={`relative rounded-2xl px-3.5 py-2.5 text-left transition ${
                  active ? "bg-[linear-gradient(120deg,var(--dashboard-card-bg),var(--dashboard-surface-2))]" : "card-tint"
                }`}
              >
                <p className="text-xs font-semibold">{cat.nom}</p>
                {cat.nouveautes && <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{cat.nouveautes} nouveautés</p>}
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold ${active ? "text-brand-pink" : "text-[var(--dashboard-text)]/25"}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
            {categorie} · {produits.length} produits
          </p>
          <div className="flex gap-1.5">
            <Tag tone="neutral">Trier</Tag>
            <Tag tone="neutral">Filtrer</Tag>
          </div>
        </div>

        {produits.length === 0 ? (
          <p className="rounded-2xl card-tint p-6 text-center text-xs text-[var(--dashboard-text)]/40">
            Catalogue de cette catégorie à venir.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {produits.map((p) => {
              const glow =
                p.source === "L"
                  ? "bg-[linear-gradient(165deg,rgba(236,12,140,0.38)_0%,rgba(236,12,140,0.05)_100%)]"
                  : p.source === "P"
                  ? "bg-[linear-gradient(165deg,color-mix(in_srgb,var(--dashboard-text)_16%,transparent)_0%,color-mix(in_srgb,var(--dashboard-text)_2%,transparent)_100%)]"
                  : "bg-[var(--dashboard-text)]/[0.03]";
              const badgeLabel = p.source === "AVENIR" ? "À venir" : p.source === "L" ? "Drop" : "Stock Management";
              const badgeColor = p.source === "L" ? "#EC0C8C" : "#6b7280";
              const tile = (
                <div className="relative">
                  <div className={`relative flex aspect-square items-center justify-center rounded-[20px] ${glow}`}>
                    <span className="absolute left-2 top-2 rounded-full bg-[var(--dashboard-card-bg)] px-2 py-1 text-[9px] font-semibold" style={{ color: badgeColor }}>
                      {badgeLabel}
                    </span>
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#141220]/45 backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                        <path
                          d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z"
                          stroke="#ffffff"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="relative z-10 -mt-6 mx-2 rounded-2xl bg-[var(--dashboard-card-bg)] p-2 shadow-[0_4px_16px_rgba(20,18,32,0.1)]">
                    <p className="truncate text-[11px] font-bold">{p.nom}</p>
                    {p.source === "AVENIR" ? (
                      <p className="mt-0.5 truncate text-[9px] text-[var(--dashboard-text)]/50">Prix à l&apos;arrivée · {p.arriveeLe}</p>
                    ) : (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-brand-purple px-2 py-0.5 text-[9px] font-bold text-white">{F(p.prixDrop!)}</span>
                        <span className="truncate text-[9px] text-[var(--dashboard-text)]/70">conseillé {F(p.prixConseille!)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
              return p.source === "AVENIR" ? (
                <div key={p.slug}>{tile}</div>
              ) : (
                <Link key={p.slug} href={`/dashboard/produits/catalogue/${p.slug}`}>
                  {tile}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
