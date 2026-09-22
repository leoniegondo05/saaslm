"use client";

import { useState } from "react";
import type { OngletsDetailsState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { ProduitPublic } from "@/lib/boutique-types";
import { LuCheck } from "react-icons/lu";

/*
  Onglets détails — port de la case "onglets-details" : présentation onglets
  ou accordéon, atouts avec icônes sur le premier onglet, image latérale
  optionnelle (photo réelle du produit plutôt qu'une illustration
  générique). `contenus`/`onglets`/`atouts` restent des textes libres de
  l'éditeur (pas de champ dédié par produit côté ProduitPublic).
*/
export default function SectionOngletsDetails({ config, produit }: { config: OngletsDetailsState; produit?: ProduitPublic }) {
  const [actif, setActif] = useState(0);
  const idx = Math.min(actif, config.onglets.length - 1);
  const texte = config.contenus[idx];
  const image = config.grandeImage && produit?.images?.[0];

  const contenu = (
    <>
      {texte && <p className="text-[13.5px] leading-relaxed text-[var(--tx)]/70">{texte}</p>}
      {idx === 0 && config.atoutsAvecIcones && (
        <ul className="mt-2 flex flex-col gap-2">
          {config.atouts.slice(0, config.nombreAtouts).map((a) => (
            <li key={a} className="flex items-start gap-2 text-[13.5px] text-[var(--tx)]/75">
              <LuCheck color="var(--ac)" size={15} className="mt-0.5 shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const bloc = image && (
    <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--tx)]/5 sm:w-40 sm:shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="h-full w-full object-cover" />
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {config.presentation === "accordeon" ? (
        <div>
          {config.onglets.map((onglet, i) => (
            <div key={i} className="border-t border-[var(--tx)]/8 py-3 first:border-t-0">
              <button type="button" onClick={() => setActif(i === idx ? -1 : i)} className="flex w-full items-center justify-between text-left text-[14px] font-semibold">
                {onglet}
                <span className="text-[var(--tx)]/45">{i === idx ? "−" : "+"}</span>
              </button>
              {i === idx && <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">{contenu}</div>}
            </div>
          ))}
          {bloc && <div className="mt-3">{bloc}</div>}
        </div>
      ) : (
        <>
          <div className="flex gap-6 overflow-x-auto border-b border-[var(--tx)]/8">
            {config.onglets.map((onglet, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActif(i)}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-[13.5px] ${i === idx ? "font-bold" : "font-medium text-[var(--tx)]/45"}`}
                style={{ borderColor: i === idx ? "var(--ac)" : "transparent", color: i === idx ? "var(--tx)" : undefined }}
              >
                {onglet}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex-1">{contenu}</div>
            {bloc}
          </div>
        </>
      )}
    </section>
  );
}
