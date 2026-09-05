"use client";

import { useState } from "react";

/*
  Petits composants d'appui partagés par toutes les sections de l'onglet
  "Accueil" (Finances, Commandes, Clients, Acquisition, Stock, Produits,
  Alertes) — extraits de app/dashboard/accueil/page.tsx pour que chaque
  section vive dans son propre fichier sans dupliquer Card/StatRow/Tag/etc.
*/

/*
  Carousel image d'un produit : utilisé sur la fiche "Prochain produit" du
  partenaire agréé (PartenaireAgree.tsx) et sur la fiche produit du
  catalogue drop (FicheProduitDrop.tsx). Flèches restent visibles même sans
  aucune image (produit pas encore photographié) : le carousel doit se voir
  prêt, cf. [[dashboard-mock-data-pending-laravel-api]]. Les flèches sont
  alors décoratives (rien à faire défiler) mais ne cassent rien : le calcul
  d'index se protège de la division par zéro.
*/
export function ProduitCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  return (
    <>
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden={i !== index}
          className="absolute inset-6 bg-contain bg-no-repeat bg-right transition-opacity duration-500"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}

      <button
        type="button"
        onClick={() => count > 0 && setIndex((i) => (i - 1 + count) % count)}
        aria-label="Image précédente"
        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => count > 0 && setIndex((i) => (i + 1) % count)}
        aria-label="Image suivante"
        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
      >
        ›
      </button>
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Aller à l'image ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  count,
  first = false,
  layout = "stack",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: string;
  first?: boolean;
  /** "stack": badge au-dessus du titre (défaut). "inline": badge / titre sur une même ligne. */
  layout?: "stack" | "inline";
}) {
  const badge = (
    <span
      className="inline-flex rounded-full p-px shadow-[0_2px_12px_rgba(20,18,32,0.05)]"
      style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#141220] backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.6)]" />
        {eyebrow}
      </span>
    </span>
  );

  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${layout === "inline" ? "mb-12" : "mb-4"} ${first ? "mt-8" : "mt-12"}`}>
      {layout === "inline" ? (
        <div className="flex items-center gap-3">
          {badge}
          <span className="text-lg font-light text-[#141220]/20">/</span>
          <div>
            <h2 className="text-xs font-bold tracking-tight sm:text-sm">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[#141220]/50">{subtitle}</p>}
          </div>
        </div>
      ) : (
        <div>
          {badge}
          <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[#141220]/50">{subtitle}</p>}
        </div>
      )}
      {count && (
        <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[#141220]/40 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
          {count}
        </span>
      )}
    </div>
  );
}

export function Card({
  title,
  badge,
  badgeAlign = "right",
  titleAlign = "center",
  titleTab = false,
  className = "",
  style,
  children,
}: {
  title?: string;
  badge?: React.ReactNode;
  /** Position du badge quand titleTab est actif. Défaut: "right". */
  badgeAlign?: "left" | "right";
  /** Position de l'étiquette de titre quand titleTab est actif. Défaut: "center". */
  titleAlign?: "left" | "center";
  /** Titre affiché en étiquette centrée (façon "onglet"), comme la carte Trésorerie disponible. */
  titleTab?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] ${className}`} style={style}>
      {title && titleTab && (
        <div className={`relative -mt-4 mb-5 flex items-center ${titleAlign === "left" ? "justify-start" : "justify-center"}`}>
          <p
            className="rounded-b-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]"
            style={{ background: "#F0EDF0", fontFamily: "var(--font-bricolage)" }}
          >
            {title}
          </p>
          {badge && (
            <div className={`absolute top-2 ${badgeAlign === "left" ? "left-0" : "right-0"}`}>{badge}</div>
          )}
        </div>
      )}
      {title && !titleTab && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">{title}</p>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatRow({
  label,
  value,
  bold = true,
  light = false,
  compact = false,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  light?: boolean;
  /** Espacement réduit (mt-1 au lieu de mt-2.5), pour cards à liste longue. */
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mt-1 flex items-center justify-between gap-3 text-xs first:mt-1" : "mt-2.5 flex items-center justify-between gap-3 text-xs first:mt-3"}>
      <span className={light ? "text-white/55" : "text-[#141220]/50"}>{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${compact ? "text-black" : ""}`.trim()}>{value}</span>
    </div>
  );
}

export function LegendRow({ color, label, value }: { color: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-[#141220]/50">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export function Divider() {
  return <div className="my-3 h-px bg-[#141220]/10" />;
}

export function Bar({ pct, color = "bg-brand-pink", background }: { pct: number; color?: string; background?: string }) {
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#141220]/[0.08]">
      <div
        className={`h-full rounded-full ${background ? "" : color}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, ...(background ? { background } : {}) }}
      />
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className = "",
  style,
}: {
  children: React.ReactNode;
  tone?: "pink" | "ok" | "warn" | "ko" | "blue" | "neutral" | "dark";
  className?: string;
  style?: React.CSSProperties;
}) {
  const tones: Record<string, string> = {
    pink: "bg-brand-pink/10 text-brand-pink",
    ok: "bg-[#dcf5e3] text-[#178a3f]",
    warn: "bg-[#fff1d6] text-[#a8690a]",
    ko: "bg-[#ffe1e2] text-[#c8262d]",
    blue: "bg-brand-purple/10 text-brand-purple",
    neutral: "bg-[#141220]/[0.06] text-[#141220]/60",
    dark: "bg-[#141220]/[0.08] text-[#141220]/70",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tones[tone]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "outline",
  className = "",
  style,
}: {
  children: React.ReactNode;
  variant?: "dark" | "outline" | "white";
  className?: string;
  style?: React.CSSProperties;
}) {
  const variants: Record<string, string> = {
    dark: "bg-[#141220] text-white",
    outline: "border border-[#141220]/15 bg-white/60 text-[#141220]",
    white: "bg-white text-[#141220] shadow-[0_2px_10px_rgba(20,18,32,0.08)]",
  };
  return (
    <button
      type="button"
      className={`w-full rounded-full px-4 py-2.5 text-center text-xs font-semibold transition hover:brightness-95 ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function Nature({ code }: { code: "S" | "P" | "L" | "O" | "D" }) {
  const styles: Record<string, string> = {
    S: "bg-[#141220]/[0.08] text-[#141220]/60",
    P: "bg-brand-purple/10 text-brand-purple",
    L: "bg-brand-pink/10 text-brand-pink",
    O: "border border-[#141220]/15 text-[#141220]/40",
    D: "bg-brand-pink/10 text-brand-pink",
  };
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${styles[code]}`}>
      {code}
    </span>
  );
}

export function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pink";
}) {
  return (
    <div>
      <p className="text-[10px] text-[#141220]/40">{label}</p>
      <p className={`mt-0.5 text-base font-bold ${tone === "pink" ? "text-brand-pink" : ""}`}>{value}</p>
    </div>
  );
}

export function MiniTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl card-tint p-3 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
      <p className="text-[10px] text-[#141220]/40">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
      <p className="mt-auto pt-0.5 text-[9px] text-[#141220]/35">{note}</p>
    </div>
  );
}

export function QuickStat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "ko" }) {
  return (
    <div className="rounded-xl bg-white p-2.5 text-center">
      <p className="text-[9px] text-[#141220]/40">{label}</p>
      <p
        className={`mt-0.5 text-center text-sm font-bold ${
          tone === "ok" ? "text-[#178a3f]" : tone === "ko" ? "text-[#c8262d]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function PayRow({ label, color, value, pct }: { label: string; color: string; value: string; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-[#141220]/70">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#141220]/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function FailRow({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#141220]/50">{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

export function CommuneRow({
  label,
  pct,
  value,
  barColor = "bg-[#141220]/50",
}: {
  label: string;
  pct: number;
  value: string;
  barColor?: string;
}) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {pct} % · {value}
        </span>
      </div>
      <Bar pct={pct} color={barColor} />
    </div>
  );
}

export function ClientRow({
  name,
  zone,
  value,
  orders,
  pct,
  showCommandeLabel = false,
  barColor = "bg-[#FFC2E2]",
}: {
  name: string;
  zone: string;
  value: string;
  orders: number;
  pct: number;
  /** Affiche "commande(s)" en toutes lettres derrière le nombre (réservé à la première ligne). */
  showCommandeLabel?: boolean;
  barColor?: string;
}) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>
          {name} · {zone}
        </span>
        <span>
          <span className="font-semibold">{value}</span>
          <span className="text-[#141220]/40">
            {" "}
            · {orders}
            {showCommandeLabel ? ` commande${orders > 1 ? "s" : ""}` : ""}
          </span>
        </span>
      </div>
      <Bar pct={pct} color={barColor} />
    </div>
  );
}

export function RatingRow({ label, value, pct, color = "bg-[#141220]" }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-[#141220]/40">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

export function SourceRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {value} · {pct} %
        </span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

export function TopProductRow({ code, name, value, pct, background }: { code: "S" | "P" | "L" | "O"; name: string; value: string; pct: number; background?: string }) {
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" background={background} />
    </div>
  );
}

export function NatureRow({
  code,
  name,
  value,
  note,
  last = false,
}: {
  code: "S" | "P" | "L" | "O" | "D";
  name: string;
  value: string;
  note: string;
  last?: boolean;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <p className="ml-7 mt-0.5 text-[10px] text-[#141220]/40">{note}</p>
      {!last && <Divider />}
    </>
  );
}

export function AlertRow({
  code,
  name,
  tag,
  tone,
  last = false,
  tagClassName = "",
}: {
  code: "S" | "P" | "L" | "O";
  name: string;
  tag: string;
  tone: "warn" | "ko";
  last?: boolean;
  tagClassName?: string;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <Tag tone={tone} className={tagClassName}>{tag}</Tag>
      </div>
      {!last && <Divider />}
    </>
  );
}

export function ProductSelector({
  name,
  position,
  dark = false,
  className = "",
  onPrev,
  onNext,
}: {
  name: string;
  position: string;
  dark?: boolean;
  className?: string;
  /** Optionnels : sans eux les flèches restent décoratives (comportement historique). */
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-1.5 py-1 ${
        dark ? "border-white/20 bg-white/10" : "border-brand-pink/30 bg-brand-pink/5"
      } ${className}`}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!onPrev}
        aria-label="Produit précédent"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-white text-[#141220]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 text-center leading-tight">
        <span className={`block truncate text-[10px] font-semibold ${dark ? "text-white" : ""}`}>{name}</span>
        <span className={`block text-[8px] ${dark ? "text-white/50" : "text-[#141220]/40"}`}>{position}</span>
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        aria-label="Produit suivant"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-white text-[#141220]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function Trend({ values }: { values?: number[] }) {
  const bars = values && values.length ? values : [3, 5, 4, 8];
  const max = Math.max(...bars);
  return (
    <div className="flex h-5 items-end gap-[3px]" aria-hidden>
      {bars.map((v, i) => (
        <span
          key={i}
          className="w-1.5 rounded-sm"
          style={{
            height: `${Math.max((v / max) * 100, 12)}%`,
            background: i === bars.length - 1 ? "var(--color-brand-pink)" : "#E4E1E8",
          }}
        />
      ))}
    </div>
  );
}

export function Table({
  head,
  rows,
  className = "",
  sourceCol,
  evolutions,
  activeIndex,
  onRowClick,
}: {
  head: string[];
  rows: string[][];
  className?: string;
  sourceCol?: number;
  evolutions?: number[][];
  /** Ligne mise en avant (ex: produit sélectionné dans un carousel lié). */
  activeIndex?: number;
  /** Optionnel : rend les lignes cliquables (ex: pour piloter un carousel lié). */
  onRowClick?: (index: number) => void;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[560px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#141220]/10">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#141220]/35">
                {h}
              </th>
            ))}
            {evolutions && (
              <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#141220]/35">
                Évolution
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
              className={`border-b border-[#141220]/[0.05] last:border-0 ${onRowClick ? "cursor-pointer" : ""} ${
                activeIndex === i ? "bg-brand-pink/5" : ""
              }`}
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3">
                  {j === 0 ? (
                    <span className="font-semibold">{cell}</span>
                  ) : sourceCol === j ? (
                    <Nature code={cell as "S" | "P" | "L" | "O"} />
                  ) : (
                    <span className={cell === "Rupture" || cell === "1 j" ? "text-brand-pink" : ""}>{cell}</span>
                  )}
                </td>
              ))}
              {evolutions && (
                <td className="py-2 pr-3">
                  <Trend values={evolutions[i]} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
