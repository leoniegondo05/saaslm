"use client";

import { useMemo, useState } from "react";
import type { FaqApercuState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { Icon } from "./Icons";

/*
  FAQ — port de la case "faq" : barre de recherche (`rechercheActivee`),
  icône +/− ou chevron (`icone`), bouton "Poser une question". Passé en
  Client Component (au lieu des <details> natifs précédents) pour que la
  recherche filtre réellement la liste, comme dans l'éditeur.
*/
export default function SectionFaq({ faq }: { faq: FaqApercuState }) {
  const [recherche, setRecherche] = useState("");
  const [ouvertes, setOuvertes] = useState<Record<number, boolean>>({});

  const items = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return faq.items.map((item, i) => ({ item, i })).filter(({ item }) => !q || item.question.toLowerCase().includes(q) || item.reponse.toLowerCase().includes(q));
  }, [faq.items, recherche]);

  if (!faq.items.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h2 className="mb-5 text-[21px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
        Questions fréquentes
      </h2>

      {faq.rechercheActivee && (
        <label className="mb-5 flex max-w-md items-center gap-2 rounded-full border border-[var(--tx)]/12 px-4 py-2.5">
          <Icon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" color="color-mix(in srgb, var(--tx) 45%, transparent)" size={16} />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une question…"
            className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-[var(--tx)]/40"
          />
        </label>
      )}

      {items.length === 0 ? (
        <p className="py-6 text-center text-[13.5px] text-[var(--tx)]/50">Aucune question pour « {recherche} ».</p>
      ) : (
        <div className={`grid gap-3 ${faq.colonnes === "deux" ? "md:grid-cols-2" : ""}`}>
          {items.map(({ item, i }) => {
            const defaut = i === 0 && faq.premiereOuverte;
            const ouverte = ouvertes[i] ?? defaut;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOuvertes((s) => ({ ...s, [i]: !ouverte }))}
                aria-expanded={ouverte}
                className="border border-[var(--tx)]/10 p-4 text-left transition"
                style={{ borderRadius: "var(--card-rad)", borderColor: ouverte ? "color-mix(in srgb, var(--ac) 30%, transparent)" : undefined }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] font-semibold">{item.question}</span>
                  <span className="mt-0.5 shrink-0" style={{ color: "var(--ac)" }} aria-hidden>
                    {faq.icone === "fleche" ? (
                      <Icon path={ouverte ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} color="var(--ac)" size={16} />
                    ) : (
                      <span className="text-[18px] font-semibold leading-none">{ouverte ? "−" : "+"}</span>
                    )}
                  </span>
                </div>
                {ouverte && <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--tx)]/75">{item.reponse}</p>}
              </button>
            );
          })}
        </div>
      )}

      {faq.boutonPoserQuestion && (
        <button
          type="button"
          className="mt-5 w-full rounded-full border py-2.5 text-[13px] font-semibold transition hover:bg-[var(--ac)]/5 sm:w-auto sm:px-6"
          style={{ borderColor: "color-mix(in srgb, var(--ac) 35%, transparent)", color: "var(--ac)" }}
        >
          Poser une question
        </button>
      )}
    </section>
  );
}
