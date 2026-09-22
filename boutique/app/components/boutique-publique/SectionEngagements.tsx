import type { EngagementsState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { LuCreditCard, LuMessageCircle, LuSparkles, LuTruck } from "react-icons/lu";

// Mêmes 4 icônes fixes par position que la case "engagements" de
// BoutiquePreview.tsx (carte, camion, enveloppe, étoile) avec leur
// sous-libellé fixe.
const ICONES = [
  { icon: LuCreditCard, sous: "Orange Money, MTN MoMo, Moov Money, Wave" },
  { icon: LuTruck, sous: "Du départ à la livraison" },
  { icon: LuMessageCircle, sous: "Par message ou appel" },
  { icon: LuSparkles, sous: "Réservées aux clientes" },
];

/*
  Rangée d'engagements — port fidèle de la case "engagements" : bande teintée
  bordée, icône + sous-libellé fixe par position, grille 2×2 sur téléphone
  (au lieu d'une ligne trop étroite à 4 colonnes).
*/
export default function SectionEngagements({ engagements }: { engagements: EngagementsState }) {
  const items = ICONES.slice(0, engagements.nombre).map((it, i) => ({ ...it, label: engagements.items[i] })).filter((it) => it.label);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div
        className="grid grid-cols-2 rounded-2xl border sm:grid-cols-4"
        style={{
          borderColor: "color-mix(in srgb, var(--ac) 20%, transparent)",
          background: "color-mix(in srgb, var(--ac) 5%, transparent)",
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-4 py-3.5 [&:nth-child(2n)]:border-l [&:nth-child(n+3)]:border-t sm:[&:nth-child(2n)]:border-l-0 sm:[&:nth-child(n+2)]:border-l sm:[&:nth-child(n+3)]:border-t-0"
            style={{ borderColor: "color-mix(in srgb, var(--ac) 15%, transparent)" }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--ac) 14%, transparent)" }}>
              <it.icon color="var(--ac)" size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold leading-tight">{it.label}</p>
              <p className="mt-0.5 whitespace-normal text-[11px] leading-tight" style={{ color: "var(--ac)", opacity: 0.8 }}>
                {it.sous}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
