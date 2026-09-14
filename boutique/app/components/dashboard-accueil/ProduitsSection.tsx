"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, Card, CollapsibleCards, Divider, HeaderActionBtn, Nature, SectionHeader, StatRow, Tag } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Produits" de l'onglet Accueil — refonte complète d'après la
  maquette "LM · Accueil · Produits" fournie (fichier HTML). Remplace
  l'ancienne version (top 5 / quatre natures / position prix drop /
  catalogue accessible) par l'écran complet : quadrant vitesse et marge,
  concentration du catalogue, état des fiches, tableau complet des
  références qui vendent, produits qu'on refuse, jours de vente restants
  des deux côtés, combinaisons qui partent, cycle de vie, prix comparés au
  réseau, références à traiter aujourd'hui.

  Comme pour CommandesSection et StockSection, le bloc "assistance IA" du
  document (bulles de questions) est parti dans le bouton "solution LM" du
  navbar (DashboardHeader.tsx → AssistanceLMModal.tsx) : les questions pour
  cet onglet vivent dans dashboard-accueil/assistanceQuestions.ts, mises à
  jour avec ce nouvel écran.

  Chiffres statiques en attendant l'API Laravel, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]]. Bleu = stockage management,
  rose = dropshipping, neutre = les deux, cf. mémoire
  [[dashboard-chart-colors-stockage-drop]].

  Seuls "Sérum éclat 30 ml", "Beurre de karité 200 g" et "Huile de ricin
  100 ml" existent dans le mock de ProduitsCatalogue.tsx : seuls ces
  noms-là reçoivent un lien filtré (/dashboard/produits?q=...), les autres
  références de cet écran (Sandales tressées, Ensemble lin, Sac cabas,
  Savon noir, Foulard en soie, Masque argile, Crème mains) renvoient sur la
  liste sans filtre, même règle que StockSection/CommandesSection.
*/

const STOCK_COLOR = "#5AA9FF";

/* Anneau de proportion — même recette que StockSection/FinancesSection
   (dupliquée ici : convention du dossier, chaque section garde ses petits
   composants). */
function Ring({
  segments,
  size = 100,
  className,
  children,
}: {
  segments: { pct: number; color: string }[];
  size?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const stops = segments.reduce<{ end: number; parts: string[] }>(
    (state, s) => {
      const end = state.end + s.pct * 3.6;
      return { end, parts: [...state.parts, `${s.color} ${state.end}deg ${end}deg`] };
    },
    { end: 0, parts: [] }
  ).parts;
  const gradient = `conic-gradient(${stops.join(", ")})`;
  return (
    <div className={`relative shrink-0 ${className ?? ""}`} style={{ width: size, height: size }}>
      <div className="h-full w-full rounded-full" style={{ background: gradient }} />
      <div className="absolute rounded-full card-tint" style={{ inset: size * 0.16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function KpiCard({ label, value, valueColor, note, noteColor }: { label: string; value: string; valueColor?: string; note: string; noteColor?: string }) {
  return (
    <Card className="!bg-[var(--dashboard-glass)]">
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-[10px]" style={noteColor ? { color: noteColor } : undefined}>
        <span className={noteColor ? "" : "text-[var(--dashboard-text)]/40"}>{note}</span>
      </p>
    </Card>
  );
}

/* Ligne "label — barre — valeur" horizontale, réutilisée pour le classement
   des refus et les jours de couverture (une couleur, comme dans StockSection). */
function RankBar({ label, value, pct, color, valueColor }: { label: string; value: string; pct: number; color: string; valueColor?: string }) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-3 text-xs first:mt-0">
      <span className="min-w-0 flex-1 truncate text-[var(--dashboard-text)]/60">{label}</span>
      <span className="w-20 shrink-0"><Bar pct={pct} background={color} /></span>
      <span className="w-16 shrink-0 text-right font-semibold" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  );
}

const QUAD_TONE: Record<string, { bg: string; color: string }> = {
  loc: { bg: "rgba(79,224,174,.14)", color: "#178a3f" },
  pep: { bg: "rgba(139,92,246,.16)", color: "#7A45E0" },
  vol: { bg: "rgba(56,189,248,.14)", color: "#0C86BE" },
  mrt: { bg: "rgba(255,90,98,.14)", color: "#c8262d" },
};

function QuadTag({ name, kind, label }: { name: string; kind: keyof typeof QUAD_TONE; label: string }) {
  const s = QUAD_TONE[kind];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-glass)] px-3 py-1.5 text-[11px]">
      <b className="font-medium">{name}</b>
      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ background: s.bg, color: s.color }}>{label}</span>
    </span>
  );
}

// Quadrant vitesse/marge : dix références, mêmes coordonnées et rayons que
// la maquette (viewBox 560×300), recolorées bleu stockage / rose drop (cf.
// mémoire couleurs). Ligne pointillée rouge = seuil de marge nulle.
const QUAD_DOTS: { cx: number; cy: number; r: number; nature: "S" | "D" }[] = [
  { cx: 468.1, cy: 47.4, r: 17.0, nature: "S" },
  { cx: 383.8, cy: 78.9, r: 14.9, nature: "S" },
  { cx: 290.0, cy: 122.4, r: 12.4, nature: "D" },
  { cx: 343.1, cy: 184.3, r: 13.8, nature: "D" },
  { cx: 258.8, cy: 245.0, r: 11.6, nature: "S" },
  { cx: 165.0, cy: 100.4, r: 9.2, nature: "S" },
  { cx: 111.9, cy: 149.8, r: 7.9, nature: "D" },
  { cx: 83.8, cy: 168.8, r: 7.1, nature: "D" },
  { cx: 211.9, cy: 130.1, r: 10.3, nature: "S" },
  { cx: 136.9, cy: 179.5, r: 8.4, nature: "S" },
];

// Concentration du catalogue : 20 barres décroissantes (chiffre d'affaires
// cumulé, référence par référence) + courbe de part cumulée.
const CONCENTRATION_BARS = [116, 112.5, 108.9, 84.6, 70, 56.1, 33.5, 23.1, 13.7, 10.4, 7.3, 5.7, 4.2, 3.3, 2.6, 2.1, 1.7, 1.4, 1.2, 0.9];
const CONCENTRATION_CUM = [29, 24, 20, 16, 13, 11, 9, 7.5, 6.2, 5.1, 4.2, 3.5, 2.9, 2.4, 2.0, 1.6, 1.35, 1.1, 0.95, 0.8];

// Combinaisons vendues — Ensemble lin deux pièces, taille × couleur.
const COMBO_ROWS: { color: string; values: number[] }[] = [
  { color: "Noir", values: [3, 9, 14, 6] },
  { color: "Beige", values: [2, 7, 11, 5] },
  { color: "Terre", values: [1, 4, 6, 2] },
  { color: "Vert", values: [0, 2, 3, 1] },
  { color: "Rouge", values: [0, 1, 1, 0] },
];
const COMBO_MAX = 14;

function LifeSpark({ values, color }: { values: number[]; color: string }) {
  const w = 100;
  const h = 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * w, y: h - 3 - ((v - min) / range) * (h - 6) }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-[100px] shrink-0 overflow-visible" aria-hidden fill="none">
      <path d={d} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2} fill={color} />
    </svg>
  );
}

const LIFE_TONE: Record<"up" | "flat" | "down", { color: string; fr: string; en: string }> = {
  up: { color: "#178a3f", fr: "En croissance", en: "Growing" },
  flat: { color: "#a8690a", fr: "Sur un plateau", en: "Plateauing" },
  down: { color: "#c8262d", fr: "En fin de course", en: "Winding down" },
};

function LifeItem({ code, name, values, kind, age }: { code: "S" | "D"; name: string; values: number[]; kind: "up" | "flat" | "down"; age: string }) {
  const { t } = useDashboardLangue();
  const tone = LIFE_TONE[kind];
  return (
    <div className="mt-2.5 flex items-center gap-3 first:mt-0">
      <span className="flex items-center gap-2 min-w-0 flex-1 text-xs"><Nature code={code} /><span className="truncate">{name}</span></span>
      <LifeSpark values={values} color={tone.color} />
      <span className="w-28 shrink-0 text-right">
        <span className="block text-[10px] font-semibold" style={{ color: tone.color }}>{t(tone.fr, tone.en)}</span>
        <span className="block text-[9px] text-[var(--dashboard-text)]/35">{age}</span>
      </span>
    </div>
  );
}

const REFUS_TONE: Record<"ok" | "mid" | "bad", string> = { ok: "#178a3f", mid: "#a8690a", bad: "#c8262d" };

function PriceRow({ name, prix, reseau, ecart, ecartUp, refus, refusTone }: { name: string; prix: string; reseau: string; ecart: string; ecartUp: boolean; refus: string; refusTone: "ok" | "mid" | "bad" }) {
  return (
    <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.6fr] items-center gap-2 py-2 text-xs">
      <span className="font-semibold">{name}</span>
      <span className="text-[var(--dashboard-text)]/60">{prix}</span>
      <span className="text-[var(--dashboard-text)]/60">{reseau}</span>
      <span className="font-semibold" style={{ color: ecartUp ? "#a8690a" : "#178a3f" }}>{ecart}</span>
      <span className="text-right font-semibold" style={{ color: REFUS_TONE[refusTone] }}>{refus}</span>
    </div>
  );
}

function ProductRow({
  code,
  name,
  unites,
  ca,
  marge,
  margeNeg = false,
  parJour,
  couverture,
  refus,
  litiges,
  neg = false,
}: {
  code: "S" | "D";
  name: string;
  unites: string;
  ca: string;
  marge: string;
  margeNeg?: boolean;
  parJour: string;
  couverture: string;
  refus: string;
  litiges: string;
  neg?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[1.6fr_0.5fr_0.9fr_0.6fr_0.6fr_0.6fr_0.5fr_0.5fr] items-center gap-2 py-2 text-xs ${neg ? "rounded-lg bg-[#c8262d0d] px-2" : ""}`}>
      <span className="flex items-center gap-2 font-semibold"><Nature code={code} />{name}</span>
      <span className="text-[var(--dashboard-text)]/60">{unites}</span>
      <span className="text-[var(--dashboard-text)]/60">{ca}</span>
      <span className="font-semibold" style={{ color: margeNeg ? "#c8262d" : "#178a3f" }}>{marge}</span>
      <span className="text-[var(--dashboard-text)]/60">{parJour}</span>
      <span className="text-[var(--dashboard-text)]/60">{couverture}</span>
      <span className="text-[var(--dashboard-text)]/60">{refus}</span>
      <span className="text-right text-[var(--dashboard-text)]/60">{litiges}</span>
    </div>
  );
}

function AlertItem({ tone, code, title, desc, cta, href }: { tone: "r" | "w" | "b"; code?: "S" | "D" | "B"; title: string; desc: string; cta: string; href: string }) {
  const dot = tone === "r" ? "bg-[#FF5A62] text-white" : tone === "w" ? "bg-[#FFB020] text-white" : "bg-brand-purple/15 text-brand-purple";
  const border = tone === "r" ? "border-[#FF5A62]/25" : "border-[var(--dashboard-text)]/10";
  return (
    <div className={`mt-2.5 flex items-center gap-3 rounded-xl border bg-[var(--dashboard-surface-2)] p-3 first:mt-3 ${border}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dot}`}>{tone === "b" ? "i" : "!"}</span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-xs font-semibold">
          {title}
          {code && <Nature code={code} />}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{desc}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold transition hover:border-[var(--dashboard-text)]/30 hover:bg-[var(--dashboard-text)]/5"
      >
        {cta}
      </Link>
    </div>
  );
}

// Tableau "Toutes vos références qui vendent" — données à plat pour que le
// bouton "Trier par marge" (tri décroissant sur margeValue) et l'ordre par
// défaut (celui de la maquette) restent tous les deux disponibles côté
// client, sans dupliquer les JSX de ProductRow.
const PRODUCT_TABLE_ROWS: {
  code: "S" | "D";
  nameFr: string;
  nameEn: string;
  unites: string;
  ca: string;
  margeDisplay: string;
  margeValue: number;
  parJour: string;
  couvFr: string;
  couvEn: string;
  refus: string;
  litiges: string;
}[] = [
  { code: "S", nameFr: "Sérum éclat 30 ml", nameEn: "Radiance serum 30 ml", unites: "41", ca: "492 000 F", margeDisplay: "31,4 %", margeValue: 31.4, parJour: "1,37", couvFr: "4 j", couvEn: "4d", refus: "12 %", litiges: "0" },
  { code: "S", nameFr: "Beurre de karité 200 g", nameEn: "Shea butter 200 g", unites: "33", ca: "462 000 F", margeDisplay: "26,1 %", margeValue: 26.1, parJour: "1,10", couvFr: "19 j", couvEn: "19d", refus: "15 %", litiges: "2" },
  { code: "D", nameFr: "Sac cabas en raphia", nameEn: "Raffia tote bag", unites: "24", ca: "477 600 F", margeDisplay: "18,8 %", margeValue: 18.8, parJour: "0,80", couvFr: "+6 j", couvEn: "+6d", refus: "21 %", litiges: "1" },
  { code: "D", nameFr: "Huile de ricin 100 ml", nameEn: "Castor oil 100 ml", unites: "29", ca: "359 600 F", margeDisplay: "8,4 %", margeValue: 8.4, parJour: "0,97", couvFr: "3 j", couvEn: "3d", refus: "18 %", litiges: "0" },
  { code: "S", nameFr: "Sandales tressées", nameEn: "Woven sandals", unites: "21", ca: "297 500 F", margeDisplay: "−1,8 %", margeValue: -1.8, parJour: "0,70", couvFr: "26 j", couvEn: "26d", refus: "34 %", litiges: "1" },
  { code: "S", nameFr: "Ensemble lin deux pièces", nameEn: "Two-piece linen set", unites: "12", ca: "238 800 F", margeDisplay: "22,5 %", margeValue: 22.5, parJour: "0,40", couvFr: "41 j", couvEn: "41d", refus: "28 %", litiges: "0" },
  { code: "S", nameFr: "Savon noir 250 g", nameEn: "Black soap 250 g", unites: "16", ca: "128 000 F", margeDisplay: "17,5 %", margeValue: 17.5, parJour: "0,55", couvFr: "11 j", couvEn: "11d", refus: "14 %", litiges: "0" },
  { code: "D", nameFr: "Foulard en soie", nameEn: "Silk scarf", unites: "7", ca: "58 100 F", margeDisplay: "14,2 %", margeValue: 14.2, parJour: "0,23", couvFr: "+6 j", couvEn: "+6d", refus: "9 %", litiges: "0" },
];

export default function ProduitsSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  // "Trier par marge" : tri décroissant sur la marge, toggle vers l'ordre
  // par défaut de la maquette (celui du tableau ci-dessus). "Tout voir"
  // n'a rien à replier ici (les 8 lignes sont déjà toutes affichées) : il
  // renvoie au catalogue complet, même lien que les autres CTA "Voir" de
  // cet écran (cf. AlertItem plus bas).
  const [sortByMarge, setSortByMarge] = useState(false);
  const productRows = useMemo(() => {
    if (!sortByMarge) return PRODUCT_TABLE_ROWS;
    return [...PRODUCT_TABLE_ROWS].sort((a, b) => b.margeValue - a.margeValue);
  }, [sortByMarge]);

  return (
    <>
      <SectionHeader
        eyebrow={t("Produits", "Products")}
        title={t("Vos références, placées", "Your products, placed")}
        subtitle={
          <>
            {t("Concentration du catalogue, état des fiches, tableau complet, produits qu'on refuse,", "Catalog concentration, listing quality, full table, refused products,")}
            <br />
            {t("jours de vente restants, combinaisons qui partent, cycle de vie, prix comparés au réseau.", "days of sales left, top combinations, lifecycle, prices against the network.")}
          </>
        }
        first={first}
        layout="inline"
        actions={
          <>
            <HeaderActionBtn>{t("Exporter", "Export")}</HeaderActionBtn>
            <HeaderActionBtn>{t("Comparer à la période précédente", "Compare to previous period")}</HeaderActionBtn>
          </>
        }
      />

      {/* Légende : quelle couleur renvoie à quelle façon de vendre */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--dashboard-glass)] px-4 py-3 text-[10px] text-[var(--dashboard-text)]/50">
        <span className="flex items-center gap-1.5"><Nature code="S" /> {t("Stockage management", "Warehousing")}</span>
        <span className="flex items-center gap-1.5"><Nature code="D" /> {t("Dropshipping", "Drop-shipping")}</span>
        <span className="flex items-center gap-1.5"><Nature code="B" /> {t("Les deux", "Both")}</span>
        <span className="ml-auto">{t("La couleur dit à quelle façon de vendre la référence appartient.", "The color says which way of selling the item belongs to.")}</span>
      </div>

      {/* 3 premiers blocs (KPI, quadrant vitesse/marge, concentration du
          catalogue + état des fiches) toujours visibles ; le reste passe
          sous le bouton "Voir tout le contenu" de CollapsibleCards — cf.
          shared.tsx. */}
      <CollapsibleCards visibleCount={3}>
      {/* KPI de la période */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label={t("Références au catalogue", "Catalog items")} value="32" note={t("21 en stock · 11 en drop", "21 warehoused · 11 drop")} />
        <KpiCard label={t("Qui ont vendu", "That sold")} value="24" valueColor="#178a3f" note={t("75 % du catalogue", "75% of the catalog")} />
        <KpiCard label={t("Unités vendues", "Units sold")} value="167" note={t("+19 % vs période précédente", "+19% vs previous period")} noteColor="#178a3f" />
        <KpiCard label={t("Marge moyenne", "Average margin")} value="24,1 %" note={t("−1,4 point", "−1.4 point")} />
        <KpiCard label={t("Références à traiter", "Items needing action")} value="6" valueColor="#a8690a" note={t("rupture, perte ou fiche bloquée", "stockout, loss, or blocked listing")} />
      </div>

      {/* Quadrant vitesse / marge */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Vos références, placées", "Your items, placed")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Vitesse de vente en abscisse, marge de contribution en ordonnée. La taille du rond, c'est le volume.", "Sales speed on the x-axis, contribution margin on the y-axis. The circle's size is the volume.")}</p>
          </div>
          <span className="flex items-center gap-3 text-[9px] font-medium text-[var(--dashboard-text)]/55">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: STOCK_COLOR }} />{t("Stockage", "Warehousing")}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />{t("Dropshipping", "Drop-shipping")}</span>
          </span>
        </div>

        <div className="relative mt-4 h-[220px] sm:h-[240px]">
          <div className="absolute left-3 top-1 z-10 text-[10px] font-bold uppercase tracking-wide text-[var(--dashboard-text)]/30">
            {t("Pépites", "Gems")}
            <span className="mt-0.5 block text-[9px] font-normal normal-case tracking-normal text-[var(--dashboard-text)]/40">{t("Marge forte, vente lente", "High margin, slow sales")}</span>
          </div>
          <div className="absolute right-3 top-1 z-10 text-right text-[10px] font-bold uppercase tracking-wide text-[var(--dashboard-text)]/30">
            {t("Locomotives", "Flagships")}
            <span className="mt-0.5 block text-[9px] font-normal normal-case tracking-normal text-[var(--dashboard-text)]/40">{t("Marge forte, vente rapide", "High margin, fast sales")}</span>
          </div>
          <div className="absolute bottom-6 left-3 z-10 text-[10px] font-bold uppercase tracking-wide text-[var(--dashboard-text)]/30">
            {t("Poids morts", "Dead weight")}
            <span className="mt-0.5 block text-[9px] font-normal normal-case tracking-normal text-[var(--dashboard-text)]/40">{t("Marge faible, vente lente", "Low margin, slow sales")}</span>
          </div>
          <div className="absolute bottom-6 right-3 z-10 text-right text-[10px] font-bold uppercase tracking-wide text-[var(--dashboard-text)]/30">
            {t("Volume pur", "Pure volume")}
            <span className="mt-0.5 block text-[9px] font-normal normal-case tracking-normal text-[var(--dashboard-text)]/40">{t("Marge faible, vente rapide", "Low margin, fast sales")}</span>
          </div>
          <div className="absolute inset-y-0 left-1/2 w-full max-w-[520px] -translate-x-1/2">
            <svg viewBox="0 0 560 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden fill="none">
              <line x1={259} y1={10} x2={259} y2={275} stroke="var(--dashboard-text)" strokeOpacity={0.14} strokeWidth={1} strokeDasharray="4 4" />
              <line x1={35} y1={139} x2={545} y2={139} stroke="var(--dashboard-text)" strokeOpacity={0.14} strokeWidth={1} strokeDasharray="4 4" />
              <line x1={35} y1={234} x2={545} y2={234} stroke="#c8262d" strokeOpacity={0.5} strokeWidth={1.4} strokeDasharray="5 4" />
            </svg>
            {QUAD_DOTS.map((d, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(d.cx / 560) * 100}%`,
                  top: `${(d.cy / 300) * 100}%`,
                  width: d.r * 1.8,
                  height: d.r * 1.8,
                  transform: "translate(-50%, -50%)",
                  background: d.nature === "S" ? STOCK_COLOR : "#EC0C8C",
                  opacity: 0.72,
                  border: `1.4px solid ${d.nature === "S" ? STOCK_COLOR : "#EC0C8C"}`,
                }}
              />
            ))}
            <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-[var(--dashboard-text)]/35">{t("Unités vendues par jour →", "Units sold per day →")}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <QuadTag name={t("Sérum éclat", "Radiance serum")} kind="loc" label={t("Locomotive", "Flagship")} />
          <QuadTag name={t("Beurre de karité", "Shea butter")} kind="loc" label={t("Locomotive", "Flagship")} />
          <QuadTag name={t("Ensemble lin", "Linen set")} kind="pep" label={t("Pépite", "Gem")} />
          <QuadTag name={t("Huile de ricin", "Castor oil")} kind="vol" label={t("Volume pur", "Pure volume")} />
          <QuadTag name={t("Sandales tressées", "Woven sandals")} kind="mrt" label={t("Poids mort", "Dead weight")} />
        </div>

        <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Ce que chaque case commande", "What each case dictates")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Les locomotives portent la boutique : elles ne doivent jamais manquer, et la publicité doit aller là. Les pépites méritent d'être poussées, elles ont de la marge et pas encore de volume. Le volume pur fait tourner la trésorerie sans enrichir : à garder tant qu'il ne coûte pas de stock. Les poids morts se sortent du catalogue, ou changent de prix. Une référence sous la ligne rouge — les sandales — vous coûte de l'argent à chaque vente.",
              "Flagships carry the shop: they must never run out, and ads should go there. Gems deserve a push, they have margin and not yet volume. Pure volume keeps cash moving without enriching you: keep it as long as it doesn't cost stock. Dead weight gets dropped from the catalog, or repriced. An item under the red line — the sandals — costs you money on every sale."
            )}
          </p>
        </div>
      </Card>

      {/* Concentration du catalogue + état des fiches */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-[1.25fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("La concentration du catalogue", "Catalog concentration")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Chiffre d'affaires cumulé, référence par référence", "Cumulative revenue, item by item")}</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
          <svg viewBox="0 0 300 140" preserveAspectRatio="none" className="mt-3 h-32 w-full overflow-visible" aria-hidden fill="none">
            {CONCENTRATION_BARS.map((v, i) => (
              <rect key={i} x={i * 15.1} y={140 - v} width={13.1} height={v} rx={1.5} fill="var(--dashboard-text)" opacity={0.16} />
            ))}
            <path
              d={CONCENTRATION_CUM.map((v, i) => `${i === 0 ? "M" : "L"} ${i * 15.1 + 6},${140 - v * 3.6}`).join(" ")}
              stroke="#178a3f"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1={51} y1={0} x2={51} y2={140} stroke="var(--dashboard-text)" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="3 4" />
          </svg>
          <div className="flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            <span>{t("1re", "1st")}</span><span>{t("5e", "5th")}</span><span>{t("10e", "10th")}</span><span>{t("15e", "15th")}</span><span>{t("20e", "20th")}</span>
          </div>
          <Divider />
          <StatRow label={t("Part du chiffre d'affaires faite par 4 références", "Revenue share made by 4 items")} value={<span style={{ color: "#a8690a" }}>68 %</span>} />
          <StatRow label={t("Références sous 1 % du chiffre d'affaires", "Items under 1% of revenue")} value="14" />
          <StatRow label={t("Références sans une seule vente", "Items with zero sales")} value={<span style={{ color: "#c8262d" }}>8</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
            {t(
              "Quatre références sur trente-deux font les deux tiers du chiffre. C'est efficace et fragile à la fois : une rupture sur l'une d'elles coûte un tiers du mois. Les quatorze références sous un pour cent encombrent la page de commande sans rien rapporter.",
              "Four items out of thirty-two make two-thirds of the revenue. That's efficient and fragile at once: a stockout on any one of them costs a third of the month. The fourteen items under one percent clutter the order page for nothing."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-sm font-semibold">{t("L'état du catalogue", "Catalog status")}</p>
          <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce qui est en ligne, et ce qui ne l'est pas", "What's live, and what isn't")}</p>
          <div className="mt-3 flex flex-col items-center gap-3">
            <Ring
              segments={[
                { pct: (26 / 32) * 100, color: "#4FE0AE" },
                { pct: (3 / 32) * 100, color: "#FF5A62" },
                { pct: (2 / 32) * 100, color: "#FFB020" },
                { pct: (1 / 32) * 100, color: "#9096AA" },
              ]}
              size={100}
            >
              <span className="text-lg font-bold">32</span>
              <span className="text-[8px] text-[var(--dashboard-text)]/40">{t("références", "items")}</span>
            </Ring>
            <div className="w-full space-y-1.5 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#4FE0AE" }} />{t("En vente", "Live")} <b className="ml-auto">26</b></span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#FF5A62" }} />{t("En rupture", "Out of stock")} <b className="ml-auto">3</b></span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#FFB020" }} />{t("Dormantes, 30 jours sans vente", "Dormant, 30 days no sale")} <b className="ml-auto">2</b></span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--dashboard-text)]/25" />{t("Brouillon, fiche incomplète", "Draft, incomplete listing")} <b className="ml-auto">1</b></span>
            </div>
          </div>
          <Divider />
          <StatRow label={t("Fiches sans vidéo", "Listings without video")} value={<span style={{ color: "#c8262d" }}>{t("2 · 1 publication bloquée", "2 · 1 listing blocked")}</span>} />
          <StatRow label={t("Fiches à moins de trois photos", "Listings under three photos")} value="4" />
          <StatRow label={t("Transformation, fiche complète", "Conversion, complete listing")} value={<span style={{ color: "#178a3f" }}>2,3 %</span>} />
          <StatRow label={t("Transformation, fiche incomplète", "Conversion, incomplete listing")} value="1,1 %" />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
            {t(
              "Une fiche complète transforme deux fois mieux. C'est le rendement le plus élevé de cet écran, et il ne coûte que du temps.",
              "A complete listing converts twice as well. It's the best return on this screen, and it only costs time."
            )}
          </p>
        </Card>
      </div>

      {/* Tableau complet des références qui vendent */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Toutes vos références qui vendent", "All your selling items")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Huit colonnes, la même ligne pour tout le monde", "Eight columns, the same line for everyone")}</p>
          </div>
          <div className="flex gap-2">
            <HeaderActionBtn onClick={() => setSortByMarge((v) => !v)}>
              {sortByMarge ? t("Ordre par défaut", "Default order") : t("Trier par marge", "Sort by margin")}
            </HeaderActionBtn>
            <Link
              href="/dashboard/produits"
              className="group relative inline-flex shrink-0 rounded-full p-px transition-all shadow-[0_2px_12px_rgba(20,18,32,0.05)] hover:opacity-95"
              style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}
            >
              <span className="inline-flex items-center rounded-full bg-[var(--dashboard-card-bg)]/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--dashboard-text)] backdrop-blur-md transition group-hover:bg-[var(--dashboard-card-bg)]/70">
                {t("Tout voir", "See all")}
              </span>
            </Link>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.6fr_0.5fr_0.9fr_0.6fr_0.6fr_0.6fr_0.5fr_0.5fr] gap-2 border-b border-[var(--dashboard-text)]/10 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
              <span>{t("Référence", "Item")}</span><span>{t("Unités", "Units")}</span><span>{t("Chiffre d'affaires", "Revenue")}</span><span>{t("Marge", "Margin")}</span><span>{t("Ventes/j", "Sales/day")}</span><span>{t("Couverture", "Coverage")}</span><span>{t("Refus", "Refusals")}</span><span className="text-right">{t("Litiges", "Disputes")}</span>
            </div>
            <div className="divide-y divide-[var(--dashboard-text)]/[0.05]">
              {productRows.map((r) => (
                <ProductRow
                  key={r.nameFr}
                  code={r.code}
                  name={t(r.nameFr, r.nameEn)}
                  unites={r.unites}
                  ca={r.ca}
                  marge={r.margeDisplay}
                  margeNeg={r.margeValue < 0}
                  parJour={r.parJour}
                  couverture={t(r.couvFr, r.couvEn)}
                  refus={r.refus}
                  litiges={r.litiges}
                  neg={r.margeValue < 0}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "La couverture se lit des deux côtés, mais pas de la même façon. En stockage management c'est votre stock, compté au jour près. En dropshipping c'est celui du partenaire agréé : la plateforme le lit dans sa base et ne l'affiche que jusqu'à six jours. Au-delà, elle écrit « plus de six jours » et n'en dit pas plus, parce que ce n'est pas votre stock à gérer.",
            "Coverage reads on both sides, but not the same way. In warehousing it's your own stock, counted to the day. In drop-shipping it's the approved partner's: the platform reads it from their database and only shows it up to six days. Beyond that, it just says \"over six days\", because it isn't your stock to manage."
          )}
        </p>
      </Card>

      {/* Produits qu'on refuse + jours de vente restants */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Les produits qu'on refuse", "The products that get refused")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Part des commandes refusées, référence par référence", "Share of refused orders, item by item")}</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
          <div className="mt-3">
            <RankBar label={t("Sandales tressées", "Woven sandals")} value="34 %" pct={100} color="#c8262d" valueColor="#c8262d" />
            <RankBar label={t("Ensemble lin deux pièces", "Two-piece linen set")} value="28 %" pct={82} color="#c8262d" valueColor="#c8262d" />
            <RankBar label={t("Sac cabas en raphia", "Raffia tote bag")} value="21 %" pct={62} color="#a8690a" valueColor="#a8690a" />
            <RankBar label={t("Huile de ricin 100 ml", "Castor oil 100 ml")} value="18 %" pct={53} color="#a8690a" valueColor="#a8690a" />
            <RankBar label={t("Beurre de karité 200 g", "Shea butter 200 g")} value="15 %" pct={44} color="#9096AA" />
            <RankBar label={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} value="12 %" pct={35} color="#178a3f" valueColor="#178a3f" />
            <RankBar label={t("Foulard en soie", "Silk scarf")} value="9 %" pct={26} color="#178a3f" valueColor="#178a3f" />
          </div>
          <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Les deux produits les plus refusés sont les deux plus chers", "The two most refused products are the two most expensive")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Sandales et ensemble en lin dépassent trente mille francs et se refusent trois fois plus que le sérum. Ce n'est pas le produit qu'on refuse, c'est le montant : au moment de payer, la somme paraît autre que sur l'écran. Annoncer le total livraison comprise dès la page de commande fait baisser ce chiffre partout où on l'a essayé.",
                "Sandals and the linen set are over thirty thousand francs and get refused three times more than the serum. It isn't the product being refused, it's the amount: at the moment of paying, the sum feels different from the one on screen. Announcing the total with delivery included right on the order page lowers this figure everywhere it's been tried."
              )}
            </p>
          </div>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Combien de jours de vente il vous reste", "How many days of sales you have left")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Stock disponible divisé par la vitesse de vente", "Available stock divided by sales speed")}</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>

          <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(90,169,255,.07)", border: "1px solid rgba(90,169,255,.24)" }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{t("Votre stock", "Your stock")}</p>
              <Tag tone="blue">{t("Stockage management", "Warehousing")}</Tag>
            </div>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Compté au jour près. Le seuil marque vos quatre jours de réapprovisionnement.", "Counted to the day. The threshold marks your four days of replenishment lead time.")}</p>
            <div className="mt-2.5">
              <RankBar label={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} value={t("4 j", "4d")} pct={15} color="#c8262d" valueColor="#c8262d" />
              <RankBar label={t("Crème mains 75 ml", "Hand cream 75 ml")} value={t("7 j", "7d")} pct={26} color="#a8690a" valueColor="#a8690a" />
              <RankBar label={t("Savon noir 250 g", "Black soap 250 g")} value={t("11 j", "11d")} pct={40} color="#178a3f" valueColor="#178a3f" />
              <RankBar label={t("Beurre de karité 200 g", "Shea butter 200 g")} value={t("19 j", "19d")} pct={69} color="#178a3f" valueColor="#178a3f" />
              <RankBar label={t("Sandales tressées", "Woven sandals")} value={t("26 j", "26d")} pct={95} color="#9096AA" />
              <RankBar label={t("Ensemble lin deux pièces", "Two-piece linen set")} value={t("41 j", "41d")} pct={100} color="#9096AA" />
            </div>
            <Divider />
            <StatRow label={t("Délai de réapprovisionnement", "Replenishment lead time")} value={t("4 jours", "4 days")} />
            <StatRow label={t("Stock dormant, plus de 30 jours", "Dormant stock, over 30 days")} value={<span style={{ color: "#a8690a" }}>412 000 F</span>} />
          </div>

          <CollapsibleCards visibleCount={0}>
            <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(236,12,140,.07)", border: "1px solid rgba(236,12,140,.24)" }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">{t("Le stock du partenaire", "The partner's stock")}</p>
                <Tag tone="pink">{t("Dropshipping", "Drop-shipping")}</Tag>
              </div>
              <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Lu dans sa base, affiché jusqu'à six jours seulement. Au-delà, rien à surveiller.", "Read from their database, shown only up to six days. Beyond that, nothing to watch.")}</p>
              <div className="mt-2.5">
                <RankBar label={t("Huile de ricin 100 ml", "Castor oil 100 ml")} value={t("3 j", "3d")} pct={50} color="#c8262d" valueColor="#c8262d" />
                <RankBar label={t("Masque argile 100 g", "Clay mask 100 g")} value={t("5 j", "5d")} pct={83} color="#a8690a" valueColor="#a8690a" />
                <RankBar label={t("Sac cabas en raphia", "Raffia tote bag")} value={t("Plus de 6 j", "Over 6d")} pct={100} color="#178a3f" valueColor="#178a3f" />
                <RankBar label={t("Foulard en soie", "Silk scarf")} value={t("Plus de 6 j", "Over 6d")} pct={100} color="#178a3f" valueColor="#178a3f" />
              </div>
              <div className="mt-3 rounded-lg bg-[var(--dashboard-surface-2)] p-2.5">
                <p className="text-[10px] font-semibold">{t("Pourquoi six jours et pas plus", "Why six days and no more")}</p>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
                  {t(
                    "Ce stock ne vous appartient pas et vous ne le réapprovisionnez pas : le compter au jour près ne vous servirait à rien. En revanche, savoir qu'il descend sous six jours vous permet de couper la publicité avant de vendre un produit que le partenaire ne pourra plus expédier.",
                    "This stock isn't yours and you don't replenish it: counting it to the day would be useless. Knowing it drops under six days, though, lets you cut ads before selling a product the partner won't be able to ship anymore."
                  )}
                </p>
              </div>
              <Divider />
              <StatRow label={t("Sous six jours en ce moment", "Under six days right now")} value={<span style={{ color: "#c8262d" }}>{t("2 références · alerte", "2 items · alert")}</span>} />
            </div>

            <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
              <p className="text-xs font-semibold">{t("Deux stocks, deux façons de les lire", "Two stocks, two ways of reading them")}</p>
              <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
                {t(
                  "D'un côté votre marchandise, payée d'avance, qu'il faut réapprovisionner à temps : quatre jours de couverture sur votre première locomotive, c'est un signal rouge. De l'autre celle du partenaire, que vous ne commandez pas : la seule chose utile est de savoir quand elle s'épuise, pour arrêter de la pousser en publicité. La plateforme s'arrête donc à six jours, et déclenche une alerte en dessous.",
                  "On one side your goods, paid up front, that need replenishing on time: four days of coverage on your top flagship is a red signal. On the other the partner's, which you don't order: the only useful thing is knowing when it runs low, to stop pushing ads on it. The platform stops at six days, and raises an alert below that."
                )}
              </p>
            </div>
          </CollapsibleCards>
        </Card>
      </div>

      {/* Combinaisons qui se vendent */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Quelles combinaisons se vendent", "Which combinations sell")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ensemble en lin deux pièces · taille et couleur, unités vendues", "Two-piece linen set · size and color, units sold")}</p>
          </div>
          <Tag tone="blue">{t("Stockage management", "Warehousing")}</Tag>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto">
          <div className="flex flex-none flex-col justify-end gap-1.5 pt-6">
            {COMBO_ROWS.map((r) => (
              <span key={r.color} className="flex h-9 items-center text-[10px] text-[var(--dashboard-text)]/50">{t(r.color, r.color)}</span>
            ))}
          </div>
          <div className="min-w-[280px] flex-1">
            <div className="flex gap-1.5">
              {["S", "M", "L", "XL"].map((s) => (
                <span key={s} className="flex-1 text-center text-[10px] font-semibold text-[var(--dashboard-text)]/50">{s}</span>
              ))}
            </div>
            <div className="mt-1.5 space-y-1.5">
              {COMBO_ROWS.map((r) => (
                <div key={r.color} className="flex gap-1.5">
                  {r.values.map((v, i) => (
                    <div
                      key={i}
                      className="flex h-9 flex-1 items-center justify-center rounded-lg text-[11px] font-bold"
                      style={{ background: `rgba(139,92,246,${0.08 + (v / COMBO_MAX) * 0.75})`, color: v / COMBO_MAX > 0.5 ? "#fff" : "var(--dashboard-text)" }}
                    >
                      {v > 0 ? v : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Taille la plus vendue", "Best-selling size")}</p><p className="mt-0.5 text-base font-bold">L</p><p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/35">{t("35 unités sur 73", "35 units out of 73")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Couleur la plus vendue", "Best-selling color")}</p><p className="mt-0.5 text-base font-bold">{t("Noir", "Black")}</p><p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/35">{t("32 unités", "32 units")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Combinaisons qui n'ont rien vendu", "Combinations with zero sales")}</p><p className="mt-0.5 text-base font-bold" style={{ color: "#a8690a" }}>{t("6 sur 20", "6 of 20")}</p><p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/35">{t("dont tout le rouge", "including all of the red")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Stock immobilisé dessus", "Stock tied up in them")}</p><p className="mt-0.5 text-base font-bold">87 000 F</p><p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/35">{t("jamais commandé", "never ordered")}</p></div>
        </div>
        <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Le rouge et le XL ne partent pas", "Red and XL don't move")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Six combinaisons sur vingt n'ont jamais été commandées, et elles portent 87 000 F de stock. Au prochain dépôt, commander la même chose reviendrait à immobiliser deux fois. Le bon réflexe est de doubler le L noir et le L beige, et de ne plus reprendre de rouge.",
              "Six combinations out of twenty have never been ordered, and they carry 87 000 F of stock. Ordering the same thing at the next deposit would tie up money twice. The right move is to double black L and beige L, and stop restocking red."
            )}
          </p>
        </div>
      </Card>

      {/* Cycle de vie + prix comparés au réseau */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Où en est chaque référence de sa vie", "Where each item stands in its life")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ventes hebdomadaires depuis le lancement", "Weekly sales since launch")}</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
          <div className="mt-3">
            <LifeItem code="S" name={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} values={[4, 5, 6, 7, 8, 9, 10, 11, 13, 14]} kind="up" age={t("Lancé il y a 10 semaines", "Launched 10 weeks ago")} />
            <LifeItem code="S" name={t("Beurre de karité 200 g", "Shea butter 200 g")} values={[8, 7, 8, 7, 8, 7, 8, 7, 8, 7]} kind="flat" age={t("Lancé il y a 7 mois", "Launched 7 months ago")} />
            <LifeItem code="S" name={t("Sandales tressées", "Woven sandals")} values={[9, 8, 7, 6, 5, 4, 4, 3, 3, 2]} kind="down" age={t("Lancé il y a 5 mois", "Launched 5 months ago")} />
          </div>
          <Divider />
          <StatRow label={t("Nouveautés lancées sur la période", "New items launched this period")} value="3" />
          <StatRow label={t("Dont une au-dessus de la moyenne du catalogue", "Of which one above the catalog average")} value={<span style={{ color: "#178a3f" }}>1</span>} />
          <StatRow label={t("Âge moyen d'une référence", "Average item age")} value={t("4,2 mois", "4.2 months")} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
            {t(
              "Une référence en fin de course se reconnaît trois semaines avant la rupture d'envie : les ventes baissent alors que le refus monte. C'est le moment de l'écouler, pas d'en recommander.",
              "An item winding down shows itself three weeks before demand runs out: sales drop while refusals rise. That's the time to clear it, not reorder it."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Vos prix, comparés au réseau", "Your prices, against the network")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Même catégorie, produits équivalents, boutiques anonymes", "Same category, equivalent products, anonymous shops")}</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[420px]">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-2 border-b border-[var(--dashboard-text)]/10 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
                <span>{t("Référence", "Item")}</span><span>{t("Votre prix", "Your price")}</span><span>{t("Réseau", "Network")}</span><span>{t("Écart", "Gap")}</span><span className="text-right">{t("Refus", "Refusals")}</span>
              </div>
              <div className="divide-y divide-[var(--dashboard-text)]/[0.05]">
                <PriceRow name={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} prix="12 000 F" reseau="13 400 F" ecart="−10 %" ecartUp={false} refus="12 %" refusTone="ok" />
                <PriceRow name={t("Beurre de karité 200 g", "Shea butter 200 g")} prix="14 000 F" reseau="13 100 F" ecart="+7 %" ecartUp refus="15 %" refusTone="mid" />
                <PriceRow name={t("Huile de ricin 100 ml", "Castor oil 100 ml")} prix="12 400 F" reseau="10 900 F" ecart="+14 %" ecartUp refus="18 %" refusTone="mid" />
                <PriceRow name={t("Sandales tressées", "Woven sandals")} prix="14 170 F" reseau="11 800 F" ecart="+20 %" ecartUp refus="34 %" refusTone="bad" />
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Le sérum est vingt pour cent sous le marché et se refuse le moins", "The serum is twenty percent under market and gets refused the least")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Vous pouvez monter son prix de mille francs sans toucher au volume : ce serait 41 000 F de marge en plus sur la période. À l'inverse, les sandales sont vingt pour cent au-dessus du réseau et se refusent trois fois plus. Le prix explique le refus mieux que le produit.",
                "You can raise its price by a thousand francs without touching volume: that would be 41 000 F more margin this period. Conversely, the sandals sit twenty percent above the network and get refused three times more. Price explains the refusal better than the product does."
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Références à traiter aujourd'hui */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]" style={{ borderColor: "rgba(255,184,77,.3)" }}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Les références à traiter", "Items to handle")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Sept références classées par ce que leur inaction coûte", "Seven items ranked by what inaction costs")}</p>
          </div>
          <Tag tone="warn">{t("7 signaux", "7 signals")}</Tag>
        </div>
        <AlertItem
          tone="r"
          code="S"
          title={t("Sérum éclat : rupture dans 4 jours", "Radiance serum: out of stock in 4 days")}
          desc={t("Votre première locomotive. Le réapprovisionnement met quatre jours : commandé aujourd'hui, il arrive juste. Demain, il est trop tard et vous perdez 12 ventes.", "Your top flagship. Replenishment takes four days: ordered today, it arrives just in time. Tomorrow, it's too late and you lose 12 sales.")}
          cta={t("Réapprovisionner", "Restock")}
          href={`/dashboard/produits?q=${encodeURIComponent(t("Sérum éclat", "Radiance serum"))}`}
        />
        <AlertItem
          tone="r"
          code="S"
          title={t("Sandales tressées : marge négative", "Woven sandals: negative margin")}
          desc={t("−340 F par commande une fois la publicité comptée, et 34 % de refus. Vingt pour cent au-dessus du prix réseau. Monter le prix n'aidera pas : baisser la publicité, oui.", "−340 F per order once ads are counted, and 34% refusals. Twenty percent above the network price. Raising the price won't help: cutting ads will.")}
          cta={t("Voir", "View")}
          href="/dashboard/produits"
        />
        <AlertItem
          tone="r"
          code="D"
          title={t("Huile de ricin : le partenaire n'a plus que 3 jours", "Castor oil: the partner has only 3 days left")}
          desc={t("Ce n'est pas votre stock et vous ne pouvez pas le réapprovisionner. Coupez la publicité dessus : vendre maintenant, c'est promettre un colis que le partenaire ne pourra pas expédier.", "This isn't your stock and you can't replenish it. Cut ads on it: selling now means promising a parcel the partner won't be able to ship.")}
          cta={t("Couper la publicité", "Cut ads")}
          href="/dashboard/produits/catalogue"
        />
        <AlertItem
          tone="w"
          code="S"
          title={t("Ensemble en lin : 41 jours de couverture", "Linen set: 41 days of coverage")}
          desc={t("238 000 F immobilisés, dont 87 000 F sur des combinaisons jamais commandées. Ne pas reprendre de rouge ni de XL au prochain dépôt.", "238 000 F tied up, of which 87 000 F on combinations never ordered. Don't restock red or XL at the next deposit.")}
          cta={t("Voir", "View")}
          href="/dashboard/produits"
        />
        <AlertItem
          tone="w"
          code="D"
          title={t("Masque argile : une fiche sans vidéo", "Clay mask: a listing without video")}
          desc={t("La publication est bloquée par votre propre règle. La fiche est prête par ailleurs : il manque quinze secondes de vidéo.", "Publication is blocked by your own rule. The listing is otherwise ready: it's missing fifteen seconds of video.")}
          cta={t("Compléter", "Complete it")}
          href="/dashboard/produits/catalogue"
        />
        <AlertItem
          tone="b"
          code="S"
          title={t("Sérum éclat : dix pour cent sous le prix du réseau", "Radiance serum: ten percent under the network price")}
          desc={t("Le produit qui se refuse le moins et se vend le plus vite. Mille francs de plus rapporteraient 41 000 F sur la période.", "The product that gets refused the least and sells the fastest. A thousand francs more would earn 41 000 F this period.")}
          cta={t("Voir", "View")}
          href={`/dashboard/produits?q=${encodeURIComponent(t("Sérum éclat", "Radiance serum"))}`}
        />
        <AlertItem
          tone="b"
          code="B"
          title={t("Huit références n'ont jamais vendu", "Eight items have never sold")}
          desc={t("Elles encombrent la page de commande et allongent le choix. Les retirer améliore la transformation sans rien coûter.", "They clutter the order page and lengthen the choice. Removing them improves conversion at no cost.")}
          cta={t("Voir", "View")}
          href="/dashboard/produits"
        />
      </Card>
      </CollapsibleCards>
    </>
  );
}
