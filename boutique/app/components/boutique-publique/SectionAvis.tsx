"use client";

import { useMemo, useState } from "react";
import type { AvisApercuState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { AvisClient, ProduitPublic } from "@/lib/boutique-types";
import { texteAvecChiffres } from "@/lib/boutique-format";
import { Etoiles } from "./Icons";
import { LuCheck, LuStar } from "react-icons/lu";

const COLS_ORDI: Record<AvisApercuState["colonnesOrdinateur"], string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

/*
  Avis clients — port de la case "avis". Aucun modèle de données n'existait
  avant cette tâche (AVIS_APERCU de BoutiquePreview.tsx est une démonstration
  figée) : `avis` (lib/boutique-types.ts, AvisClient[]) part d'un tableau
  vide tant qu'aucun avis réel n'a été laissé — la section reste affichée
  (comme demandé) avec un état vide honnête plutôt que masquée, résumé/notes
  calculés sur les vrais avis (moyenne, distribution, compteur vérifié).
*/
export default function SectionAvis({
  avis,
  config,
  couleurEtoiles,
  produits,
}: {
  avis: AvisClient[];
  config: AvisApercuState;
  couleurEtoiles: string;
  produits?: ProduitPublic[];
}) {
  const [filtre, setFiltre] = useState<"tous" | "photos" | 5 | 4>("tous");
  const cols = config.colonnesOrdinateur;

  const moyenne = avis.length ? avis.reduce((s, a) => s + a.note, 0) / avis.length : null;
  const distribution = [5, 4, 3, 2, 1].map((etoiles) => ({
    etoiles,
    pourcent: avis.length ? Math.round((avis.filter((a) => Math.round(a.note) === etoiles).length / avis.length) * 100) : 0,
  }));
  const achatsVerifies = avis.filter((a) => a.verifie).length;

  const tries = useMemo(() => {
    const copie = [...avis];
    if (config.ordre === "mieux-notes") copie.sort((a, b) => b.note - a.note);
    else if (config.ordre === "recents") copie.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    else if (config.ordre === "photos") copie.sort((a, b) => Number(!!b.photo) - Number(!!a.photo));
    return copie;
  }, [avis, config.ordre]);

  const filtres = tries.filter((a) => {
    if (filtre === "photos") return !!a.photo;
    if (filtre === 5 || filtre === 4) return Math.round(a.note) === filtre;
    return true;
  });

  const affiches = filtres.slice(0, config.nombreAffiches);

  return (
    <section id="avis" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-[21px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
          Avis clients
        </h2>
      </div>

      {avis.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border border-dashed border-[var(--tx)]/20 px-6 py-14 text-center" style={{ borderRadius: "var(--card-rad)" }}>
          <LuStar color="color-mix(in srgb, var(--tx) 30%, transparent)" size={26} />
          <p className="text-[15px] font-semibold">Aucun avis pour le moment</p>
          <p className="max-w-sm text-[13.5px] text-[var(--tx)]/55">Les premiers avis client de cette boutique apparaîtront ici.</p>
        </div>
      ) : (
        <>
          {config.filtres && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {(["tous", ...(config.photosClients ? (["photos"] as const) : []), 5, 4] as const).map((f) => (
                <button
                  key={String(f)}
                  type="button"
                  onClick={() => setFiltre(f)}
                  className="shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition"
                  style={
                    filtre === f
                      ? { background: "#0B0E1C", color: "#fff" }
                      : { border: "1px solid color-mix(in srgb, var(--tx) 12%, transparent)", color: "color-mix(in srgb, var(--tx) 55%, transparent)" }
                  }
                >
                  {f === "tous" ? "Tous" : f === "photos" ? "Avec photos" : `${f} étoiles`}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col items-start gap-5 sm:flex-row">
            {config.resumeDesNotes && moyenne != null && (
              <div className="w-full shrink-0 rounded-2xl border border-[var(--tx)]/8 px-5 py-6 text-center sm:w-[180px] sm:text-left">
                <span className="block text-[32px] font-figures-bold leading-none">{moyenne.toFixed(1)}</span>
                <div className="mt-1.5 flex justify-center sm:justify-start">
                  <Etoiles note={moyenne} taille={16} couleur={couleurEtoiles} />
                </div>
                <p className="mt-1.5 text-[12.5px] text-[var(--tx)]/50">{texteAvecChiffres(`${avis.length} avis`)}</p>
                <div className="mt-4 flex flex-col gap-1.5">
                  {distribution.map((d) => (
                    <div key={d.etoiles} className="flex items-center gap-2">
                      <span className="w-3 shrink-0 text-[11px] font-figures text-[var(--tx)]/50">{d.etoiles}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--tx)]/8">
                        <span className="block h-full rounded-full" style={{ width: `${d.pourcent}%`, background: "#F2A93B" }} />
                      </span>
                    </div>
                  ))}
                </div>
                {config.compteurAchatsVerifies && achatsVerifies > 0 && (
                  <span
                    className="mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-bold"
                    style={{ background: "color-mix(in srgb, #1E9E6A 12%, transparent)", color: "#1F8A5B" }}
                  >
                    <LuCheck color="#1E9E6A" size={13} />
                    {texteAvecChiffres(`${achatsVerifies} achats vérifiés`)}
                  </span>
                )}
              </div>
            )}

            <div className={`grid flex-1 gap-4 ${COLS_ORDI[cols]}`}>
              {affiches.map((av) => {
                const produit = av.produitId ? produits?.find((p) => p.id === av.produitId) : undefined;
                return (
                  <div key={av.id} className="rounded-2xl border border-[var(--tx)]/8 px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "var(--ac)" }}>
                        {av.nom
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((m) => m[0]?.toUpperCase())
                          .join("")}
                      </span>
                      <p className="min-w-0 truncate text-[13px] font-bold">{av.nom}</p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Etoiles note={av.note} taille={11} couleur={couleurEtoiles} />
                      {config.date && <span className="text-[11px] text-[var(--tx)]/45">{formatDate(av.date)}</span>}
                      {av.verifie && <span className="text-[11px] font-semibold" style={{ color: "#1F8A5B" }}>✓ Achat vérifié</span>}
                    </div>
                    <p className="mt-2 text-[13px] leading-snug text-[var(--tx)]/70">{av.texte}</p>
                    {config.photosClients && av.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av.photo} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />
                    )}
                    {config.reponsesBoutique && av.reponse && (
                      <div className="mt-2 rounded-lg border-l-2 border-[var(--ac)] bg-[var(--tx)]/[.03] px-2.5 py-2 text-[12px] text-[var(--tx)]/70">
                        <b style={{ color: "var(--ac)" }}>Réponse :</b> {av.reponse}
                      </div>
                    )}
                    {config.produitSousAvis && produit && (
                      <p className="mt-2 truncate border-t border-[var(--tx)]/8 pt-2 text-[11.5px] text-[var(--tx)]/45">{produit.nom}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
