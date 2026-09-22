import type { ConfianceState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { LuCreditCard, LuMessageCircle, LuShieldCheck, LuTruck } from "react-icons/lu";
import type { IconType } from "react-icons";

// Mêmes 4 icônes que la case "confiance" de BoutiquePreview.tsx (bouclier,
// camion, carte, enveloppe) — un sous-texte fixe par position complète le
// libellé personnalisable, comme dans l'éditeur.
const ICONES: { icon: IconType; sub: string }[] = [
  { icon: LuShieldCheck, sub: "Choisis par la boutique" },
  { icon: LuTruck, sub: "4 h en moyenne" },
  { icon: LuCreditCard, sub: "Ou en ligne, avec remise" },
  { icon: LuMessageCircle, sub: "Par message ou appel" },
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
    <section className={`relative z-10 mx-auto max-w-5xl px-4 sm:px-6 ${chevaucheActif ? "-mt-8 sm:-mt-9" : "py-6"}`}>
      <div
        className={`bg-white ${
          enLigne
            ? "flex flex-wrap items-center justify-around gap-3 sm:gap-5 rounded-2xl sm:rounded-[20px] px-4 sm:px-6 py-3.5 sm:py-4"
            : "grid gap-2.5 sm:gap-3 rounded-2xl sm:rounded-[20px] px-4 sm:px-6 py-4.5 sm:py-5 sm:grid-cols-4"
        }`}
        style={{
          gridTemplateColumns: enLigne ? undefined : `repeat(${Math.min(items.length, 4)}, minmax(0,1fr))`,
          boxShadow: chevaucheActif ? "0 18px 40px -14px rgba(11,14,28,0.22)" : "0 6px 20px -12px rgba(11,14,28,0.12)",
          border: chevaucheActif ? "none" : "1px solid rgba(0,0,0,.06)",
        }}
      >
        {items.map((it, i) => (
          <div key={i} className={enLigne ? "flex items-center gap-2.5 px-2" : "flex items-center gap-2.5 px-2 text-left"}>
            {confiance.icones === "pleines" ? (
              <span
                className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 shrink-0 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--ac) 12%, transparent)" }}
              >
                <it.icon color="var(--ac)" size={16} />
              </span>
            ) : (
              <it.icon color="var(--ac)" size={19} />
            )}
            <span className={enLigne ? "contents" : "flex flex-col"}>
              <span className="text-[12.5px] sm:text-[13px] font-semibold leading-tight text-[#1a1a1a]">{it.label}</span>
              {!enLigne && <span className="mt-0.5 text-[10px] sm:text-[10.5px] leading-tight text-black/45">{it.sub}</span>}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
