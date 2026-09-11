"use client";

import { useEffect, useId, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { useFiltrable } from "../DashboardRecherche";

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

  Défilement auto (2,5 s) quand plus d'une image ; interagir avec les
  flèches ou les points ne fait qu'avancer l'image, l'intervalle continue
  derrière (pas besoin de le relancer/pauser pour un carousel aussi court).
*/
export function ProduitCarousel({ images }: { images: string[] }) {
  const { t } = useDashboardLangue();
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 2500);
    return () => clearInterval(id);
  }, [count]);

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
        aria-label={t("Image précédente", "Previous image")}
        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => count > 0 && setIndex((i) => (i + 1) % count)}
        aria-label={t("Image suivante", "Next image")}
        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
      >
        ›
      </button>
      <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t(`Aller à l'image ${i + 1}`, `Go to image ${i + 1}`)}
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
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  count?: string;
  first?: boolean;
  /** "stack": badge au-dessus du titre (défaut). "inline": badge / titre sur une même ligne. */
  layout?: "stack" | "inline";
  /** Boutons optionnels à droite du header (ex: "Exporter", "Comparer à la période précédente"). */
  actions?: React.ReactNode;
}) {
  const badge = (
    <span
      className="inline-flex rounded-full p-px shadow-[0_2px_12px_rgba(20,18,32,0.05)]"
      style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-card-bg)]/80 px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-text)] backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.6)]" />
        {eyebrow}
      </span>
    </span>
  );

  return (
    <div className={first ? "mt-8" : "mt-12"}>
      <div className={`flex flex-wrap items-start justify-between gap-3 ${layout === "inline" ? "mb-12" : "mb-4"}`}>
      {layout === "inline" ? (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {badge}
          <span className="text-lg font-light text-[var(--dashboard-text)]/20">/</span>
          <div className="min-w-0">
            <h2 className="text-xs font-bold tracking-tight sm:text-sm">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">{subtitle}</p>}
          </div>
        </div>
      ) : (
        <div>
          {badge}
          <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">{subtitle}</p>}
        </div>
      )}
      {actions ? (
        <div className="mt-5 flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
      ) : (
        count && (
          <span className="rounded-full bg-[var(--dashboard-card-bg)]/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[var(--dashboard-text)]/40 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
            {count}
          </span>
        )
      )}
      </div>
    </div>
  );
}

/*
  Bouton pilule contour dégradé — pour les actions de header ("Exporter",
  "Comparer à la période précédente") du document envoyé. Même recette que
  le badge "solution LM" (DashboardHeader) et l'onglet actif d'AccueilNav :
  span extérieur en dégradé + p-px = liseré, span/bouton intérieur en fond
  plein pour l'effet "contour de couleur" sans le remplir.
  Distinct de Btn (qui est toujours pleine largeur, pensé pour les CTA de
  carte) : celui-ci reste à sa largeur de contenu, pour s'aligner en ligne.
*/
export function HeaderActionBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-[linear-gradient(90deg,var(--color-brand-pink),rgba(20,18,32,0.08))] p-px shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
      <button
        type="button"
        onClick={onClick}
        className="rounded-full bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-white dark:bg-[#1c1830]/90 dark:hover:bg-[#1c1830]"
      >
        {children}
      </button>
    </span>
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
  // Se cache seule quand une recherche est active (DashboardSearchBar) et
  // qu'aucun texte affiché ici — titre, StatRow, Table... peu importe — ne
  // la contient. Sans effet hors d'Accueil/Réglages (RechercheProvider),
  // cf. DashboardRecherche.tsx.
  const { ref, match } = useFiltrable();
  return (
    <div
      ref={ref}
      className={`rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] ${className}`}
      style={match ? style : { ...style, display: "none" }}
    >
      {title && titleTab && (
        <div className={`relative -mt-4 mb-5 flex items-center ${titleAlign === "left" ? "justify-start" : "justify-center"}`}>
          <p
            className="rounded-b-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]"
            style={{ background: "var(--dashboard-surface-2)", fontFamily: "var(--font-bricolage)" }}
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]">{title}</p>
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
      <span className={light ? "text-white/55" : "text-[var(--dashboard-text)]/50"}>{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${compact ? "text-[var(--dashboard-text)]" : ""}`.trim()}>{value}</span>
    </div>
  );
}

export function LegendRow({ color, label, value, badge }: { color: string; label: string; value: React.ReactNode; badge?: string }) {
  return (
    <div className="text-xs">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className="font-semibold">{value}</span>
        {badge ? (
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[var(--dashboard-text)]/30 text-[8px] font-semibold text-[var(--dashboard-text)]/60">
            {badge}
          </span>
        ) : null}
      </span>
      <p className="mt-0.5 pl-4 text-[10px] leading-tight text-[var(--dashboard-text)]/40">{label}</p>
    </div>
  );
}

export function Divider() {
  return <div className="my-3 h-px bg-[var(--dashboard-text)]/10" />;
}

export function Bar({ pct, color = "bg-brand-pink", background, height = "h-1.5" }: { pct: number; color?: string; background?: string; height?: string }) {
  return (
    <div className={`mt-1.5 ${height} w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]`}>
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
    neutral: "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60",
    dark: "bg-[var(--dashboard-text)]/[0.08] text-[var(--dashboard-text)]/70",
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
    dark: "bg-[#141220] text-white dark:bg-brand-pink",
    outline: "border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)]/60 text-[var(--dashboard-text)]",
    white: "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-[0_2px_10px_rgba(20,18,32,0.08)]",
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

export function Nature({ code }: { code: "S" | "P" | "L" | "O" | "D" | "B" }) {
  const styles: Record<string, string> = {
    // Stockage = bleu (cf. [[dashboard-chart-colors-stockage-drop]]) — même
    // bleu que STOCK_COLOR dans CommandesSection.tsx, jamais de gris neutre.
    S: "bg-[#5AA9FF]/10 text-[#5AA9FF]",
    P: "bg-brand-purple/10 text-brand-purple",
    L: "bg-brand-pink/10 text-brand-pink",
    O: "border border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/40",
    D: "bg-brand-pink/10 text-brand-pink",
    // "Les deux" (stockage + drop) — commandes qui mélangent les deux
    // façons de vendre, cf. légende de CommandesSection.
    B: "border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60",
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
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className={`mt-0.5 text-base font-bold ${tone === "pink" ? "text-brand-pink" : ""}`}>{value}</p>
    </div>
  );
}

export function MiniTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl card-tint p-3 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
      <p className="mt-auto pt-0.5 text-[9px] text-[var(--dashboard-text)]/35">{note}</p>
    </div>
  );
}

export function QuickStat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "ko" }) {
  return (
    <div className="rounded-xl bg-[var(--dashboard-card-bg)] p-2.5 text-center">
      <p className="text-[9px] text-[var(--dashboard-text)]/40">{label}</p>
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
        <span className="flex items-center gap-2 text-[var(--dashboard-text)]/70">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function FailRow({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--dashboard-text)]/50">{label}</span>
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
  barColor = "bg-[var(--dashboard-text)]/50",
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
          <span className="text-[var(--dashboard-text)]/40">
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

export function RatingRow({ label, value, pct, color = "bg-[var(--dashboard-text)]" }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-[var(--dashboard-text)]/40">
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
      <p className="ml-7 mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{note}</p>
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
  const { t } = useDashboardLangue();
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
        aria-label={t("Produit précédent", "Previous product")}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 text-center leading-tight">
        <span className={`block truncate text-[10px] font-semibold ${dark ? "text-white" : ""}`}>{name}</span>
        <span className={`block text-[8px] ${dark ? "text-white/50" : "text-[var(--dashboard-text)]/40"}`}>{position}</span>
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        aria-label={t("Produit suivant", "Next product")}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function Trend({ values }: { values?: number[] }) {
  const data = values && values.length ? values : [3, 5, 4, 8];
  const w = 40;
  const h = 20;
  const pad = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * w,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }));
  // Interpolation cubique monotone (Fritsch-Carlson) : contrairement à
  // Catmull-Rom, la tangente est nulle à chaque pic/creux, donc pas de
  // dépassement (l'ancien rendu créait des "hameçons" autour des extrema).
  const n = points.length;
  const dx = n > 1 ? points[1].x - points[0].x : 0;
  const secants: number[] = [];
  for (let k = 0; k < n - 1; k++) secants.push((points[k + 1].y - points[k].y) / (dx || 1));
  const tangents: number[] = new Array(n).fill(0);
  if (n > 1) {
    tangents[0] = secants[0];
    tangents[n - 1] = secants[n - 2];
    for (let k = 1; k < n - 1; k++) tangents[k] = (secants[k - 1] + secants[k]) / 2;
    for (let k = 0; k < n - 1; k++) {
      if (secants[k] === 0) {
        tangents[k] = 0;
        tangents[k + 1] = 0;
        continue;
      }
      const alpha = tangents[k] / secants[k];
      const beta = tangents[k + 1] / secants[k];
      if (alpha < 0) tangents[k] = 0;
      if (beta < 0) tangents[k + 1] = 0;
      const sq = alpha * alpha + beta * beta;
      if (sq > 9) {
        const tau = 3 / Math.sqrt(sq);
        tangents[k] = tau * alpha * secants[k];
        tangents[k + 1] = tau * beta * secants[k];
      }
    }
  }
  let d = `M ${points[0].x},${points[0].y}`;
  for (let k = 0; k < n - 1; k++) {
    const p0 = points[k];
    const p1 = points[k + 1];
    const cp1x = p0.x + dx / 3;
    const cp1y = p0.y + (tangents[k] * dx) / 3;
    const cp2x = p1.x - dx / 3;
    const cp2y = p1.y - (tangents[k + 1] * dx) / 3;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
  }
  const last = points[points.length - 1];
  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const avgY = h - pad - ((avg - min) / range) * (h - pad * 2);
  const area = `${d} L ${last.x},${h} L ${points[0].x},${h} Z`;
  const uid = useId();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-5 w-10 overflow-visible" aria-hidden fill="none">
      <defs>
        <linearGradient id={`trend-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-pink)" stopOpacity={0.32} />
          <stop offset="100%" stopColor="var(--color-brand-pink)" stopOpacity={0} />
        </linearGradient>
        <filter id={`trend-glow-${uid}`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1={0}
        y1={avgY}
        x2={w}
        y2={avgY}
        stroke="var(--dashboard-text)"
        strokeOpacity={0.18}
        strokeWidth={0.6}
        strokeDasharray="1.2 1.4"
      />
      <path d={area} fill={`url(#trend-fill-${uid})`} stroke="none" />
      <path d={d} stroke="var(--color-brand-pink)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.4} fill="var(--color-brand-pink)" fillOpacity={0.35} filter={`url(#trend-glow-${uid})`} />
      <circle cx={last.x} cy={last.y} r={1.5} fill="var(--color-brand-pink)" />
    </svg>
  );
}

// Bruit déterministique (même formule fractale que le fake-noise GLSL
// classique) : pas de Math.random, donc pas de désaccord SSR/hydratation
// et le graphe reste identique à chaque rendu.
function pseudoNoise(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

/*
  Grand graphe en aire (Trésorerie / Trésorerie attendue), façon ticker
  boursier (cf. capture Yahoo Finance envoyée) : segments DROITS (pas de
  lissage Bézier) subdivisés en micro-dents façon cours de bourse — chaque
  point réel (un jour) reste exact, les points intermédiaires zigzaguent
  autour du segment. Aire en dégradé qui s'évanouit vers le bas, seul le
  dernier point est marqué (point plein + halo).
*/
export function AreaChart({
  values,
  color = "#22C55E",
  markers = [],
  compareValues,
  compareColor,
  gapColor,
}: {
  values: number[];
  color?: string;
  /** Indices (dans `values`) des points "fin de suspension" : trait vertical pointillé + point blanc, comme sur le document envoyé. */
  markers?: number[];
  /** Deuxième courbe superposée sur la même échelle (ex. "Vendu" face à "Demande" dans StockSection). Quand fourni, remplace le dégradé d'aire par la zone entre les deux courbes. */
  compareValues?: number[];
  compareColor?: string;
  /** Couleur de la zone entre les deux courbes (ex. rouge = vente perdue sur rupture). */
  gapColor?: string;
}) {
  const data = values;
  const w = 300;
  const h = 100;
  const padY = 6;
  // Échelle commune aux deux séries : sinon "Vendu" et "Demande" ne seraient
  // pas comparables visuellement (chacune étirée sur son propre min/max).
  const allValues = compareValues ? [...data, ...compareValues] : data;
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;
  // Arrondi des coordonnées : Math.sin (utilisé ci-dessous par pseudoNoise
  // et pour le damping) n'est pas garanti bit-à-bit identique entre le
  // moteur JS du serveur (SSR) et celui du navigateur — sans cet arrondi,
  // le `d` du path diffère de quelques ULP et React signale un désaccord
  // d'hydratation même si le tracé est visuellement identique.
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const subSteps = 6;
  const jitter = (h - padY * 2) * 0.05;
  // Subdivision de chaque segment réel en micro-dents : les extrémités
  // (t=0 et t=1) restent exactes, l'intérieur zigzague avec un bruit
  // déterministe dont l'amplitude s'annule aux deux bouts du segment (pas
  // de discontinuité entre segments successifs). `seedBase` décale le bruit
  // d'une série à l'autre pour que deux courbes superposées ne zigzaguent
  // pas de façon identique.
  function buildPoints(series: number[], seedBase: number) {
    const real = series.map((v, i) => ({
      x: round((i / (series.length - 1 || 1)) * w),
      y: round(h - padY - ((v - min) / range) * (h - padY * 2)),
    }));
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < real.length - 1; i++) {
      const p0 = real[i];
      const p1 = real[i + 1];
      for (let s = 0; s < subSteps; s++) {
        const t = s / subSteps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        const damp = Math.sin(t * Math.PI); // 0 aux bouts, max au milieu
        const n = (pseudoNoise(seedBase + i * 12.9898 + s * 3.71) - 0.5) * 2;
        points.push({ x: round(x), y: round(y + n * damp * jitter) });
      }
    }
    points.push(real[real.length - 1]);
    return { real, points };
  }
  const { real, points } = buildPoints(data, 0);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];
  const area = `${d} L ${last.x},${h} L ${points[0].x},${h} Z`;
  const compare = compareValues ? buildPoints(compareValues, 1000) : null;
  const compareD = compare ? compare.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") : null;
  // Zone entre les deux courbes : contour de la première à l'aller, contour
  // de la seconde au retour, refermé — ex. "argent que personne n'a
  // encaissé" entre Demande et Vendu dans StockSection.
  const gapPath = compare
    ? `${d} L ${[...compare.points].reverse().map((p) => `${p.x},${p.y}`).join(" L ")} Z`
    : null;
  // React 18 useId() renvoie des ":" (ex. ":r4:") : légaux en XML mais
  // connus pour casser la résolution de url(#id) dans un gradient/filter
  // sur certains moteurs de rendu — l'élément qui référence l'id invalide
  // n'est alors PAS rendu du tout (comportement spec SVG pour un filter
  // cassé). On nettoie l'id pour rester sur des caractères sans risque.
  const uid = useId().replace(/:/g, "");
  // Les points (marqueurs + dernier point) sortent du SVG : preserveAspectRatio="none"
  // étire x et y avec des échelles différentes, donc un <circle> y devient une
  // ellipse. En overlay HTML (position % + taille fixe en px), le rond reste rond
  // quel que soit l'étirement du graphe.
  return (
    <div className="relative mt-3 h-24 w-full sm:h-28">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden fill="none">
        <defs>
          <linearGradient id={`area-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {compare && gapPath ? (
          <path d={gapPath} fill={gapColor ?? color} fillOpacity={0.35} stroke="none" />
        ) : (
          // fallback "none" après l'IRI : si la réf gradient ne résout jamais,
          // on obtient un remplissage transparent plutôt qu'un aplat noir/blanc
          // par défaut du moteur de rendu.
          <path d={area} fill={`url(#area-fill-${uid}) none`} stroke="none" />
        )}
        <path d={d} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {compare && compareD && (
          <path d={compareD} stroke={compareColor ?? "#5AA9FF"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )}
        {markers.map((i) => {
          const p = real[i];
          if (!p) return null;
          return (
            <line key={i} x1={p.x} y1={-4} x2={p.x} y2={h} stroke="var(--dashboard-text)" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          );
        })}
      </svg>
      {markers.map((i) => {
        const p = real[i];
        if (!p) return null;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{ left: `${(p.x / w) * 100}%`, top: `${(p.y / h) * 100}%`, width: 4, height: 4, background: "#141220", transform: "translate(-50%,-50%)" }}
          />
        );
      })}
      <span
        className="absolute rounded-full"
        style={{ left: `${(last.x / w) * 100}%`, top: `${(last.y / h) * 100}%`, width: 5, height: 5, background: color, transform: "translate(-50%,-50%)" }}
      />
      {compare && compare.points.length > 0 && (
        <span
          className="absolute rounded-full"
          style={{
            left: `${(compare.points[compare.points.length - 1].x / w) * 100}%`,
            top: `${(compare.points[compare.points.length - 1].y / h) * 100}%`,
            width: 5,
            height: 5,
            background: compareColor ?? "#5AA9FF",
            transform: "translate(-50%,-50%)",
          }}
        />
      )}
    </div>
  );
}

/*
  Bandeau "volume" sous l'aire Niveau (StockSection, "Le mouvement de votre
  stock") — même idée qu'un histogramme de volume sous un cours de bourse
  (cf. [[dashboard-chart-colors-stockage-drop]], rendu bourse/trading
  préféré) : une barre par jour, calculée depuis la variation `values[i] -
  values[i-1]`. Dépôt (variation positive) = vert, monte depuis l'axe
  central ; sortie/vente (variation négative) = gris, descend depuis l'axe
  central. Même palette que Niveau (bleu, inchangé) pour que les trois
  couleurs du bandeau de légende gardent chacune un seul sens dans toute la
  carte.
*/
export function MovementBars({
  values,
  positive = "#4FE0AE",
  negative = "#9096AA",
}: {
  values: number[];
  /** Couleur des barres de dépôt (variation positive). */
  positive?: string;
  /** Couleur des barres de sortie (variation négative). */
  negative?: string;
}) {
  const w = 300;
  const h = 36;
  const n = values.length;
  const deltas = [];
  for (let i = 1; i < n; i++) {
    deltas.push({ x: (i / (n - 1)) * w, d: values[i] - values[i - 1] });
  }
  // Échelles séparées dépôts / sorties : les dépôts (deux gros ressauts)
  // sont un ordre de grandeur au-dessus des sorties (petite baisse
  // quotidienne) — une échelle commune écrasait les barres grises à 1-2px.
  // Chaque côté de l'axe central utilise donc son propre maximum, pour que
  // sorties et dépôts restent lisibles l'un comme l'autre.
  const maxPos = Math.max(...deltas.filter((p) => p.d > 0).map((p) => p.d), 1);
  const maxNeg = Math.max(...deltas.filter((p) => p.d < 0).map((p) => Math.abs(p.d)), 1);
  const barW = n > 1 ? (w / (n - 1)) * 0.6 : w;
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-1 h-9 w-full overflow-visible" aria-hidden fill="none">
      <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="var(--dashboard-text)" strokeOpacity={0.1} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      {deltas.map((p, i) => {
        const isDeposit = p.d > 0;
        const ref = isDeposit ? maxPos : maxNeg;
        const half = Math.max((Math.abs(p.d) / ref) * (h / 2 - 2), 2);
        const y = isDeposit ? h / 2 - half : h / 2;
        return (
          <rect
            key={`${uid}-${i}`}
            x={p.x - barW / 2}
            y={y}
            width={barW}
            height={half}
            rx={barW / 2}
            fill={isDeposit ? positive : negative}
            fillOpacity={isDeposit ? 0.95 : 0.75}
          />
        );
      })}
    </svg>
  );
}

/*
  Graphe en cascade (compte de résultat de la période) : chaque colonne est
  soit un total posé depuis 0 (encaissé de départ, résultat net final —
  kind "total"), soit un delta flottant entre le total courant et le
  suivant (kind "delta", amount signé). Les pointillés horizontaux entre
  colonnes relient le sommet d'une barre au départ de la suivante, comme
  dans le document envoyé — pas de lissage, segments droits uniquement.
*/
export function WaterfallChart({
  items,
}: {
  items: { label: string; display: string; amount: number; kind: "total" | "delta" }[];
}) {
  const n = items.length;
  let running = 0;
  const bars = items.map((it) => {
    let start: number;
    let end: number;
    if (it.kind === "total") {
      start = 0;
      end = it.amount;
      running = it.amount;
    } else {
      start = running;
      end = running + it.amount;
      running = end;
    }
    return { ...it, start, end };
  });
  const max = Math.max(...bars.map((b) => Math.max(b.start, b.end))) || 1;
  const colW = 100;
  const w = n * colW;
  const h = 200;
  const topPad = 14;
  const y = (v: number) => topPad + (h - topPad) * (1 - v / max);
  const gap = colW * 0.3;
  const uid = useId();

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-40 w-full overflow-visible sm:h-48" aria-hidden fill="none">
        {bars.slice(0, -1).map((b, i) => {
          const cy = y(b.end);
          const x1 = i * colW + colW - gap / 2;
          const x2 = (i + 1) * colW + gap / 2;
          return (
            <line
              key={`${uid}-c${i}`}
              x1={x1}
              y1={cy}
              x2={x2}
              y2={cy}
              stroke="var(--dashboard-text)"
              strokeOpacity={0.2}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          );
        })}
        {bars.map((b, i) => {
          const x = i * colW + gap / 2;
          const bw = colW - gap;
          const barTop = y(Math.max(b.start, b.end));
          const barBottom = y(Math.min(b.start, b.end));
          const bh = Math.max(barBottom - barTop, 3);
          const color = b.kind === "total" ? (i === 0 ? "#9096AA" : "#4FE0AE") : "#F08289";
          return <rect key={`${uid}-b${i}`} x={x} y={barTop} width={bw} height={bh} rx={5} fill={color} />;
        })}
      </svg>
      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {bars.map((b, i) => (
          <div key={`${uid}-l${i}`} className="text-center">
            <p className="truncate text-[7.5px] leading-tight text-[var(--dashboard-text)]/40 sm:text-[8px]" title={b.label}>
              {b.label}
            </p>
            <p
              className="mt-0.5 truncate text-[8.5px] font-bold sm:text-[10px]"
              style={{ color: b.kind === "delta" ? "#DC3A45" : i === 0 ? undefined : "#0E9F6E" }}
            >
              {b.display}
            </p>
          </div>
        ))}
      </div>
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
  const { t } = useDashboardLangue();
  // Cellules à faire ressortir en rose (rupture / délai critique) : les
  // valeurs traduites (StockSection) diffèrent des littéraux FR d'origine,
  // donc on matche les deux jeux de chaînes plutôt qu'un seul.
  const URGENT_CELLS = ["Rupture", "1 j", "Out of stock", "1 day"];
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[560px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--dashboard-text)]/10">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
                {h}
              </th>
            ))}
            {evolutions && (
              <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
                {t("Évolution", "Trend")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
              className={`border-b border-[var(--dashboard-text)]/[0.05] last:border-0 ${onRowClick ? "cursor-pointer" : ""} ${
                activeIndex === i ? "bg-brand-pink/5" : ""
              }`}
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3">
                  {j === 0 ? (
                    <span className="font-semibold">{cell}</span>
                  ) : sourceCol === j ? (
                    <Nature code={cell as "S" | "P" | "L" | "O" | "D" | "B"} />
                  ) : (
                    <span className={URGENT_CELLS.includes(cell) ? "text-brand-pink" : ""}>{cell}</span>
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
