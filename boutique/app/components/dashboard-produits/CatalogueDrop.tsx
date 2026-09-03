"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionHeader, Nature, Tag } from "../dashboard-accueil/shared";
import { CATEGORIES, DROP_PRODUITS } from "./dropCatalogue";

/*
  Écran 05 "Catalogue disponible en drop" : catégories à gauche, produits de
  la catégorie choisie en carrés à droite. Chaque tuile mène à sa fiche
  (Écran 06, /dashboard/produits/catalogue/[slug]) — sauf les produits "à
  venir", qui n'ont pas encore de fiche.
*/

const F = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export default function CatalogueDrop({ first = true }: { first?: boolean }) {
  const [categorie, setCategorie] = useState(CATEGORIES[0].nom);
  const produits = DROP_PRODUITS.filter((p) => p.categorie === categorie);

  return (
    <>
      <SectionHeader
        eyebrow="Catalogue drop"
        title="Produits disponibles chez le partenaire"
        subtitle="Aucun stock à avancer : vous choisissez, il livre."
        first={first}
      />

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Catégories</p>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => {
            const active = cat.nom === categorie;
            return (
              <button
                key={cat.nom}
                type="button"
                onClick={() => setCategorie(cat.nom)}
                className={`relative rounded-2xl px-4 py-3 text-left transition ${
                  active ? "bg-[linear-gradient(120deg,#ffffff,#e3e7f3)]" : "card-tint"
                }`}
              >
                <p className="text-xs font-semibold">{cat.nom}</p>
                {cat.nouveautes && <p className="mt-0.5 text-[10px] text-[#141220]/40">{cat.nouveautes} nouveautés</p>}
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold ${active ? "text-brand-pink" : "text-[#141220]/25"}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
            {categorie} · {produits.length} produits
          </p>
          <div className="flex gap-1.5">
            <Tag tone="neutral">Trier</Tag>
            <Tag tone="neutral">Filtrer</Tag>
          </div>
        </div>

        {produits.length === 0 ? (
          <p className="rounded-2xl card-tint p-6 text-center text-xs text-[#141220]/40">
            Catalogue de cette catégorie à venir.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {produits.map((p) => {
              const tile = (
                <div className="rounded-2xl border border-[#141220]/[0.06] card-tint overflow-hidden">
                  <div className="relative flex aspect-square items-center justify-center bg-[radial-gradient(260px_180px_at_50%_44%,rgba(236,12,140,0.16),transparent_66%)]">
                    <span className="h-1/2 w-1/2 rounded-2xl border border-[#141220]/10 bg-white/70" />
                    <span className="absolute left-2.5 top-2.5">
                      {p.source === "AVENIR" ? (
                        <Tag tone="neutral">À venir</Tag>
                      ) : (
                        <Tag tone={p.source === "L" ? "pink" : "blue"}>{p.source === "L" ? "Drop LM" : "Partenaire"}</Tag>
                      )}
                    </span>
                    {p.source !== "AVENIR" && (
                      <span className="absolute right-2.5 top-2.5">
                        <Nature code={p.source} />
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold">{p.nom}</p>
                    <p className="mt-0.5 text-[10px] text-[#141220]/50">
                      {p.prixDrop !== null ? `${F(p.prixDrop)} · conseillé ${F(p.prixConseille!)}` : `Prix à l'arrivée · ${p.arriveeLe}`}
                    </p>
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
