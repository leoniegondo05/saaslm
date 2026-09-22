import type { EngagementsState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { Icon } from "./Icons";

// Mêmes 4 icônes fixes par position que la case "engagements" de
// BoutiquePreview.tsx (carte, camion, enveloppe, étoile) avec leur
// sous-libellé fixe.
const ICONES = [
  { icon: "M4 7h16v10H4Zm0 3h16", sous: "Orange Money, MTN MoMo, Moov Money, Wave" },
  { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", sous: "Du départ à la livraison" },
  { icon: "M4 4h16v12H8l-4 4Z", sous: "Par message ou appel" },
  { icon: "M12 3l2 5 5 1-4 3.6 1 5-4.5-2.5L7 17.6l1-5-4-3.6 5-1Z", sous: "Réservées aux clientes" },
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
        className="grid rounded-2xl border"
        style={{
          borderColor: "color-mix(in srgb, var(--ac) 20%, transparent)",
          background: "color-mix(in srgb, var(--ac) 5%, transparent)",
          gridTemplateColumns: `repeat(2, minmax(0,1fr))`,
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            className="flex flex-1 items-center gap-2.5 px-4 py-3.5 sm:[&:nth-child(n+3)]:border-t-0"
            style={{
              borderLeft: i % 2 !== 0 ? "1px solid color-mix(in srgb, var(--ac) 15%, transparent)" : undefined,
              borderTop: i >= 2 ? "1px solid color-mix(in srgb, var(--ac) 15%, transparent)" : undefined,
            }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--ac) 14%, transparent)" }}>
              <Icon path={it.icon} color="var(--ac)" size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold leading-tight">{it.label}</p>
              <p className="mt-0.5 truncate text-[11px] leading-tight" style={{ color: "var(--ac)", opacity: 0.8 }}>
                {it.sous}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
