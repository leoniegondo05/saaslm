import type { ConfianceState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { Icon } from "./Icons";

// Mêmes 4 icônes que la case "confiance" de BoutiquePreview.tsx (bouclier,
// camion, carte, enveloppe) — un sous-texte fixe par position complète le
// libellé personnalisable, comme dans l'éditeur.
const ICONES: { icon: string; sub: string }[] = [
  { icon: "M12 3 4 6.5V11c0 4.8 3.4 8.9 8 10 4.6-1.1 8-5.2 8-10V6.5Z", sub: "Choisis par la boutique" },
  { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", sub: "4 h en moyenne" },
  { icon: "M4 7h16v10H4Zm0 3h16", sub: "Ou en ligne, avec remise" },
  { icon: "M4 4h16v12H8l-4 4Z", sub: "Par message ou appel" },
];

/*
  Barre de confiance — port fidèle de la case "confiance" : style
  carte/ligne, icônes trait/pleines, et surtout `chevaucheGrandeImage` (la
  barre chevauche le bas de la grande image via une marge négative + ombre
  portée, au lieu de s'afficher dans son propre bloc) — `chevaucheActif` est
  calculé par l'appelant (page.tsx) : vrai seulement quand la section
  précédente réellement rendue est "grande-image".
*/
export default function SectionConfiance({ confiance, chevaucheActif }: { confiance: ConfianceState; chevaucheActif: boolean }) {
  const items = ICONES.slice(0, confiance.nombre).map((it, i) => ({ ...it, label: confiance.atouts[i] })).filter((it) => it.label);
  if (!items.length) return null;
  const enLigne = confiance.style === "ligne";

  return (
    <section className={`relative z-10 mx-auto max-w-5xl px-4 sm:px-6 ${chevaucheActif ? "-mt-8" : "py-6"}`}>
      <div
        className={`bg-white px-2.5 ${enLigne ? "flex flex-wrap items-center justify-around gap-1.5 rounded-2xl py-3" : "grid gap-1.5 rounded-2xl py-4 sm:grid-cols-4"}`}
        style={{
          gridTemplateColumns: enLigne ? undefined : `repeat(${Math.min(items.length, 4)}, minmax(0,1fr))`,
          boxShadow: chevaucheActif ? "0 18px 40px -14px rgba(11,14,28,0.3)" : "0 6px 20px -12px rgba(11,14,28,0.15)",
          border: chevaucheActif ? "none" : "1px solid rgba(0,0,0,.06)",
        }}
      >
        {items.map((it, i) => (
          <div key={i} className={enLigne ? "flex items-center gap-1.5 px-2" : "flex items-center gap-2 px-2 text-left"}>
            {confiance.icones === "pleines" ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--ac)" }}>
                <Icon path={it.icon} color="#fff" size={14} />
              </span>
            ) : (
              <Icon path={it.icon} color="var(--ac)" size={18} />
            )}
            <span className={enLigne ? "contents" : "flex flex-col"}>
              <span className="text-[11.5px] font-semibold leading-tight text-[#1a1a1a]">{it.label}</span>
              {!enLigne && <span className="text-[9.5px] leading-tight text-black/40">{it.sub}</span>}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
