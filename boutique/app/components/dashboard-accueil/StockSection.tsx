"use client";

import Link from "next/link";
import { useState } from "react";
import { AreaChart, Bar, Btn, Card, CollapsibleCards, Divider, HeaderActionBtn, MovementBars, Nature, openBrandedReport, periodSeed, scaleForPeriod, SectionHeader, StatRow, Tag } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Stock" de l'onglet Accueil — refonte complète d'après la
  maquette "LM · Accueil · Stock" fournie (fichier HTML). Remplace
  l'ancienne version (carousel de 4 dépôts + fiche + tableau) par l'écran
  complet : vendable vs immobilisé, mouvement du stock, âge et rotation,
  répartition par entrepôt du partenaire, dates limites par lot, qualité à
  chaque passage de main, valeur réelle des retours, demande face au stock,
  recherches sans réponse, ce que le partenaire tient en dropshipping,
  réapprovisionnement à déposer, point de commande référence par référence,
  signaux à traiter aujourd'hui.

  Comme pour CommandesSection, le bloc "assistance IA" du document (bulles
  de questions) est parti dans le bouton "solution LM" du navbar
  (DashboardHeader.tsx → AssistanceLMModal.tsx) : les questions pour cet
  onglet vivent dans dashboard-accueil/assistanceQuestions.ts, mises à jour
  avec ce nouvel écran.

  Chiffres statiques en attendant l'API Laravel, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]]. Bleu = stockage management,
  rose = dropshipping, neutre = les deux, cf. mémoire
  [[dashboard-chart-colors-stockage-drop]].
*/

const STOCK_COLOR = "#5AA9FF";

/* Anneau de proportion — même recette que FinancesSection (dupliquée ici :
   convention du dossier, chaque section garde ses petits composants). */
function Ring({ pct, color, trackColor, segments, size = 96, className, children }: { pct?: number; color?: string; trackColor?: string; segments?: { pct: number; color: string }[]; size?: number; className?: string; children?: React.ReactNode }) {
  let gradient: string;
  if (segments) {
    let acc = 0;
    const stops = segments.map((s) => {
      const from = acc;
      acc += s.pct * 3.6;
      return `${s.color} ${from}deg ${acc}deg`;
    });
    gradient = `conic-gradient(${stops.join(", ")})`;
  } else {
    gradient = `conic-gradient(${color} ${(pct ?? 0) * 3.6}deg, ${trackColor ?? "rgba(20,18,32,0.08)"} ${(pct ?? 0) * 3.6}deg)`;
  }
  return (
    <div className={`relative shrink-0 ${className ?? ""}`} style={{ width: size, height: size }}>
      <div className="h-full w-full rounded-full" style={{ background: gradient }} />
      <div className="absolute rounded-full card-tint" style={{ inset: size * 0.16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function StackedBar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
      {segments.map((s, i) => (
        <span key={i} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${s.pct}%`, background: s.color }} />
      ))}
    </div>
  );
}

function KpiCard({ label, value, valueColor, note, noteColor, previous }: { label: string; value: string; valueColor?: string; note: string; noteColor?: string; previous?: string }) {
  const { t } = useDashboardLangue();
  return (
    <Card className="!bg-[var(--dashboard-glass)]">
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-[10px]" style={noteColor ? { color: noteColor } : undefined}>
        <span className={noteColor ? "" : "text-[var(--dashboard-text)]/40"}>{note}</span>
      </p>
      {previous && (
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/35">
          {t("Période précédente", "Previous period")} : {previous}
        </p>
      )}
    </Card>
  );
}

/* Ligne "label — barre — valeur" horizontale, réutilisée pour la rotation
   par référence et les recherches sans réponse (classement, une couleur). */
function RankRow({ label, value, pct, color, valueColor }: { label: string; value: string; pct: number; color: string; valueColor?: string }) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-3 text-xs first:mt-0">
      <span className="min-w-0 flex-1 truncate text-[var(--dashboard-text)]/60">{label}</span>
      <span className="w-24 shrink-0"><Bar pct={pct} background={color} /></span>
      <span className="w-16 shrink-0 text-right font-semibold" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  );
}

const AGE_TONE: Record<string, string> = { ok: "#178a3f", mid: "#a8690a", bad: "#c8262d" };

// Blocs "depuis quand" — même palette que la barre empilée vendable/immobilisé
// plus haut dans le fichier (vert/bleu/or/rouge), hauteur proportionnelle au
// poids de la tranche, calée sur la maquette (blocs pleins, dernier en pilule).
function AgeBlock({ pct, maxPct, color, label, pill = false }: { pct: number; maxPct: number; color: string; label: string; pill?: boolean }) {
  const height = Math.max(28, Math.round((pct / maxPct) * 112));
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className={`w-full ${pill ? "rounded-full" : "rounded-2xl"}`} style={{ height, background: color }} />
      <span className="text-center text-[9px] text-[var(--dashboard-text)]/40">{label}</span>
    </div>
  );
}

function AgeRow({ label, value, pct, tone }: { label: string; value: string; pct: string; tone: "ok" | "mid" | "bad" }) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-3 text-xs first:mt-0">
      <span className="flex-1 text-[var(--dashboard-text)]/60">{label}</span>
      <span className="font-semibold">{value}</span>
      <span className="w-10 shrink-0 text-right font-semibold" style={{ color: AGE_TONE[tone] }}>{pct}</span>
    </div>
  );
}

function WarehouseRow({ site, unites, commandes, delai, bad = false }: { site: string; unites: string; commandes: string; delai: string; bad?: boolean }) {
  return (
    <div className={`grid grid-cols-[1.2fr_0.6fr_1fr_0.8fr] items-center gap-2 py-2 text-xs ${bad ? "rounded-lg bg-[#c8262d0d] px-2" : ""}`}>
      <span className="font-semibold">{site}</span>
      <span className="text-[var(--dashboard-text)]/60">{unites}</span>
      <span className="text-[var(--dashboard-text)]/60">{commandes}</span>
      <span className={`text-right font-semibold ${bad ? "text-[#c8262d]" : ""}`}>{delai}</span>
    </div>
  );
}

const LOT_TONE: Record<string, { bg: string; color: string }> = {
  urg: { bg: "rgba(255,122,128,.16)", color: "#c8262d" },
  att: { bg: "rgba(255,184,77,.16)", color: "#a8690a" },
  ok: { bg: "rgba(79,224,174,.14)", color: "#178a3f" },
  none: { bg: "var(--dashboard-surface-2)", color: "var(--dashboard-text)" },
};

// Barres au-dessus du tableau des lots — une par lot, longueur = jours
// restants sur une échelle de 9 mois (le lot le plus lointain). Le trait
// pointillé marque les deux mois (cf. sous-titre de la carte) : au-delà,
// couleur verte, en-deçà orange/rouge selon l'urgence (LOT_TONE).
const LOT_BAR_MAX_DAYS = 270;
const LOT_BAR_TWO_MONTHS_PCT = (60 / LOT_BAR_MAX_DAYS) * 100;
const LOT_BAR_COLOR: Record<string, string> = { urg: "#FF5A62", att: "#FFB020", ok: "#4FE0AE", none: "" };

function LotProgress({ items }: { items: { days: number | null; tone: keyof typeof LOT_TONE }[] }) {
  return (
    <div className="relative mt-4 space-y-2">
      <div className="pointer-events-none absolute inset-y-0 border-l border-dashed border-[var(--dashboard-text)]/25" style={{ left: `${LOT_BAR_TWO_MONTHS_PCT}%` }} />
      {items.map((it, i) => (
        <div key={i} className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
          {it.days !== null && (
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (it.days / LOT_BAR_MAX_DAYS) * 100)}%`, background: LOT_BAR_COLOR[it.tone] }} />
          )}
        </div>
      ))}
    </div>
  );
}

function LotBadge({ tone, children }: { tone: keyof typeof LOT_TONE; children: React.ReactNode }) {
  const s = LOT_TONE[tone];
  return (
    <span className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold" style={{ background: s.bg, color: s.color }}>
      {children}
    </span>
  );
}

function LotRow({ name, unites, date, valeur, badgeTone, badgeLabel, dim = false }: { name: string; unites: string; date: string; valeur: string; badgeTone: keyof typeof LOT_TONE; badgeLabel: string; dim?: boolean }) {
  return (
    <div className={`grid grid-cols-[1.6fr_0.5fr_1fr_0.9fr_1fr] items-center gap-2 py-2 text-xs ${dim ? "opacity-50" : ""} ${badgeTone === "urg" ? "rounded-lg bg-[#c8262d0d] px-2" : badgeTone === "att" ? "rounded-lg bg-[#a8690a0d] px-2" : ""}`}>
      <span className="font-semibold">{name}</span>
      <span className="text-[var(--dashboard-text)]/60">{unites}</span>
      <span className="text-[var(--dashboard-text)]/60">{date}</span>
      <span className="text-[var(--dashboard-text)]/60">{valeur}</span>
      <span className="text-right"><LotBadge tone={badgeTone}>{badgeLabel}</LotBadge></span>
    </div>
  );
}

const REPLEN_TONE: Record<string, string> = { bad: "#c8262d", mid: "#a8690a", ok: "" };
const REPLEN_BADGE: Record<string, { bg: string; color: string }> = {
  urgent: { bg: "rgba(255,122,128,.16)", color: "#c8262d" },
  conseille: { bg: "var(--dashboard-surface-2)", color: "var(--dashboard-text)" },
  non: { bg: "var(--dashboard-surface-2)", color: "var(--dashboard-text-muted, inherit)" },
};

function ReplenishRow({
  name,
  stock,
  couverture,
  couvertureTone,
  qty,
  cost,
  badge,
  badgeKind,
  dim = false,
}: {
  name: string;
  stock: string;
  couverture: string;
  couvertureTone: "ok" | "mid" | "bad";
  qty: string;
  cost: string;
  badge: string;
  badgeKind: "urgent" | "conseille" | "non";
  dim?: boolean;
}) {
  const b = REPLEN_BADGE[badgeKind];
  return (
    <div className={`grid grid-cols-[1.4fr_0.6fr_0.8fr_0.6fr_1fr_1fr] items-center gap-2 py-2 text-xs ${dim ? "opacity-45" : ""} ${badgeKind === "urgent" ? "rounded-lg bg-[#c8262d0d] px-2" : ""}`}>
      <span className="font-semibold">{name}</span>
      <span className="text-[var(--dashboard-text)]/60">{stock}</span>
      <span className="font-semibold" style={couvertureTone !== "ok" ? { color: REPLEN_TONE[couvertureTone] } : undefined}>{couverture}</span>
      <span className="font-semibold">{qty}</span>
      <span className="text-[var(--dashboard-text)]/60">{cost}</span>
      <span className="text-right"><span className="rounded-full px-2.5 py-1 text-[9px] font-semibold" style={{ background: b.bg, color: b.color }}>{badge}</span></span>
    </div>
  );
}

const OP_BADGE: Record<string, { bg: string; color: string; label: (t: (fr: string, en: string) => string) => string }> = {
  under: { bg: "rgba(255,122,128,.16)", color: "#c8262d", label: (t) => t("Sous le seuil", "Under threshold") },
  at: { bg: "rgba(255,184,77,.16)", color: "#a8690a", label: (t) => t("Au seuil", "At threshold") },
  ok: { bg: "rgba(79,224,174,.14)", color: "#178a3f", label: (t) => t("Confortable", "Comfortable") },
  over: { bg: "rgba(139,92,246,.16)", color: "#7A45E0", label: (t) => t("Surstock", "Overstock") },
};

function OrderPointRow({
  name,
  perDay,
  consumed,
  reserve,
  point,
  stock,
  stockBad,
  badge,
}: {
  name: string;
  perDay: string;
  consumed: string;
  reserve: string;
  point: string;
  stock: string;
  stockBad: boolean;
  badge: keyof typeof OP_BADGE;
}) {
  const { t } = useDashboardLangue();
  const b = OP_BADGE[badge];
  return (
    <div className={`grid grid-cols-[1.4fr_0.7fr_0.9fr_0.6fr_0.9fr_0.6fr_1fr] items-center gap-2 py-2 text-xs ${badge === "under" ? "rounded-lg bg-[#c8262d0d] px-2" : ""}`}>
      <span className="font-semibold">{name}</span>
      <span className="text-[var(--dashboard-text)]/60">{perDay}</span>
      <span className="text-[var(--dashboard-text)]/60">{consumed}</span>
      <span className="text-[var(--dashboard-text)]/60">{reserve}</span>
      <span className="font-semibold text-brand-pink">{point}</span>
      <span className="font-semibold" style={stockBad ? { color: "#c8262d" } : { color: "#178a3f" }}>{stock}</span>
      <span className="text-right"><span className="rounded-full px-2.5 py-1 text-[9px] font-semibold" style={{ background: b.bg, color: b.color }}>{b.label(t)}</span></span>
    </div>
  );
}

function AlertItem({ tone, code, title, desc, cta, href }: { tone: "r" | "w" | "b"; code?: "S" | "D"; title: string; desc: string; cta: string; href: string }) {
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

// "Le mouvement de votre stock" — niveau jour par jour, 2 dépôts en cours
// de période (ressauts), déclin régulier entre eux (vitesse de vente).
const STOCK_LEVEL = [
  238, 230, 222, 214, 206, 198, 190, 182, 175, 168, 161, 155, 149,
  230, 222, 214, 206, 198, 190, 183, 176, 169, 163, 157, 151,
  245, 236, 227, 218, 210, 168,
];

// "La demande face à votre stock" — demande estimée vs vendu, l'écart entre
// les deux est la vente perdue sur rupture. Sommes calées sur les KPI
// affichés sous le graphe : 135 (Demande estimée), 123 (Vendu), écart 12
// (Perdu sur rupture) — les deux courbes se superposent partout sauf sur
// les pics, où VENDU_STOCK décroche : c'est la zone rouge.
const DEMAND = [3, 4, 3, 4, 4, 5, 4, 6, 5, 7, 4, 5, 4, 4, 3, 4, 4, 4, 5, 4, 6, 5, 4, 5, 7, 4, 4, 5, 4, 5];
const VENDU_STOCK = [3, 4, 3, 4, 4, 5, 4, 5, 4, 5, 4, 5, 4, 4, 3, 4, 4, 4, 5, 3, 6, 5, 4, 5, 4, 3, 4, 3, 3, 5];

export default function StockSection({ first = true, activeDate }: { first?: boolean; activeDate?: Date }) {
  const { t, langue } = useDashboardLangue();

  // Période sélectionnée sur le picker du DashboardHeader → seed déterministe
  // qui fait varier les chiffres mock ci-dessous (cf.
  // [[dashboard-mock-data-pending-laravel-api]]) ; 2026-08-01 par défaut =
  // même date que le reste du dashboard tant qu'aucune période n'est choisie.
  const seed = periodSeed(activeDate ?? new Date(2026, 7, 1));
  const numberLocale = langue === "EN" ? "en-US" : "fr-FR";
  const F = (n: number) => `${n.toLocaleString(numberLocale)} F`;
  const N = (n: number) => n.toLocaleString(numberLocale);
  const dec1 = (n: number) => (n / 10).toLocaleString(numberLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const dec2 = (n: number) => (n / 100).toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // KPI de la période
  const stockValue = scaleForPeriod(1842000, seed, 0);
  const stockValuePrev = scaleForPeriod(1758000, seed, 1);
  const resaleValue = scaleForPeriod(3210000, seed, 2);
  const resaleValuePrev = scaleForPeriod(3050000, seed, 3);
  const turnover = scaleForPeriod(89, seed, 4); // ×10 → décimale via dec1
  const turnoverPrev = scaleForPeriod(77, seed, 5);
  const coverage = scaleForPeriod(41, seed, 6);
  const coveragePrev = scaleForPeriod(46, seed, 7);
  const serviceRate = scaleForPeriod(94, seed, 8);
  const serviceRatePrev = scaleForPeriod(91, seed, 9);

  // Vendable vs immobilisé
  const availableUnits = scaleForPeriod(118, seed, 10);
  const reservedUnits = scaleForPeriod(26, seed, 11);
  const blockedUnits = scaleForPeriod(5, seed, 12);
  const returnedUnits = scaleForPeriod(19, seed, 13);
  const sellableTotal = availableUnits + reservedUnits + blockedUnits + returnedUnits;
  const pctOf = (n: number) => (sellableTotal > 0 ? (n / sellableTotal) * 100 : 0);

  // Mouvement du stock
  const depositedUnits = scaleForPeriod(170, seed, 14);
  const soldUnits = scaleForPeriod(123, seed, 15);
  const discrepancyUnits = scaleForPeriod(4, seed, 16);

  // Depuis quand la marchandise est là (valeur d'achat par tranche d'âge)
  const ageUnder30 = scaleForPeriod(842000, seed, 17);
  const age30to60 = scaleForPeriod(588000, seed, 18);
  const age60to90 = scaleForPeriod(286000, seed, 19);
  const ageOver90 = scaleForPeriod(126000, seed, 20);
  const ageTotal = ageUnder30 + age30to60 + age60to90 + ageOver90;
  const agePct = (n: number) => (ageTotal > 0 ? (n / ageTotal) * 100 : 0);
  const ageMaxPct = Math.max(agePct(ageUnder30), agePct(age30to60), agePct(age60to90), agePct(ageOver90));

  // Rotation par référence (fois par an, ×10 → décimale via dec1)
  const rotSerum = scaleForPeriod(94, seed, 21);
  const rotKarite = scaleForPeriod(68, seed, 22);
  const rotSavon = scaleForPeriod(51, seed, 23);
  const rotCreme = scaleForPeriod(42, seed, 24);
  const rotSandales = scaleForPeriod(26, seed, 25);
  const rotLin = scaleForPeriod(18, seed, 26);
  const rotMax = Math.max(rotSerum, rotKarite, rotSavon, rotCreme, rotSandales, rotLin);
  const rotPct = (n: number) => (rotMax > 0 ? (n / rotMax) * 100 : 0);

  // Où se trouve la marchandise (sites du partenaire)
  const stockCocody = scaleForPeriod(104, seed, 27);
  const stockYopougon = scaleForPeriod(49, seed, 28);
  const stockBouake = scaleForPeriod(15, seed, 29);
  const sitesTotal = stockCocody + stockYopougon + stockBouake;
  const commandesCocody = scaleForPeriod(71, seed, 30);
  const commandesYopougon = scaleForPeriod(34, seed, 31);
  const commandesBouake = scaleForPeriod(18, seed, 32);

  // Qualité à chaque passage de main
  const qualityReception = scaleForPeriod(977, seed, 33); // ×10 → dec1
  const qualityDelivery = scaleForPeriod(989, seed, 34);
  const returnsResellable = scaleForPeriod(73, seed, 35);
  const breakageCocody = scaleForPeriod(8, seed, 36); // ×10 → dec1
  const breakageYopougon = scaleForPeriod(14, seed, 37);
  const breakageBouake = scaleForPeriod(32, seed, 38);
  const breakageMax = Math.max(breakageCocody, breakageYopougon, breakageBouake);
  const breakagePct = (n: number) => (breakageMax > 0 ? (n / breakageMax) * 100 : 0);

  // Ce que valent vos retours
  const returnIntactCount = scaleForPeriod(12, seed, 39);
  const returnDamagedCount = scaleForPeriod(5, seed, 40);
  const returnDefectCount = scaleForPeriod(2, seed, 41);
  const returnIntactValue = scaleForPeriod(132000, seed, 42);
  const returnDamagedValue = scaleForPeriod(54000, seed, 43);
  const returnDefectValue = scaleForPeriod(19200, seed, 44);
  const returnValueTotal = returnIntactValue + returnDamagedValue + returnDefectValue;
  const returnValueLost = returnDamagedValue + returnDefectValue;

  // La demande face au stock
  const demandEstimated = scaleForPeriod(135, seed, 45);
  const demandLost = Math.max(0, demandEstimated - soldUnits);
  const demandServiceRate = demandEstimated > 0 ? Math.round((soldUnits / demandEstimated) * 100) : 0;
  const marginLost = scaleForPeriod(56300, seed, 46);
  const trendSerum = scaleForPeriod(34, seed, 47);
  const trendKarite = scaleForPeriod(8, seed, 48);
  const trendSandales = scaleForPeriod(22, seed, 49);

  // Recherches sans réponse
  const searchGel = scaleForPeriod(41, seed, 50);
  const searchHuile = scaleForPeriod(28, seed, 51);
  const searchMasque = scaleForPeriod(22, seed, 52);
  const searchSavon = scaleForPeriod(17, seed, 53);
  const searchCreme = scaleForPeriod(11, seed, 54);
  const searchMax = Math.max(searchGel, searchHuile, searchMasque, searchSavon, searchCreme);
  const searchPct = (n: number) => (searchMax > 0 ? (n / searchMax) * 100 : 0);

  // Ce que le partenaire tient (dropshipping)
  const dropSales = scaleForPeriod(733400, seed, 55);
  const dropDisputes = scaleForPeriod(7, seed, 56);
  const dropDisputesTotal = scaleForPeriod(26, seed, 57);
  const dropAvailable = scaleForPeriod(10, seed, 58);

  // Stock partagé entre "à déposer jeudi" et "point de commande" : mêmes
  // références, même niveau de stock affiché dans les deux cartes.
  const stockSerum = scaleForPeriod(6, seed, 59);
  const stockCreme = scaleForPeriod(2, seed, 60);
  const stockSavon = scaleForPeriod(6, seed, 61);
  const stockKarite = scaleForPeriod(21, seed, 62);
  const stockSandales = scaleForPeriod(18, seed, 63);
  const stockLin = scaleForPeriod(16, seed, 64);

  const replenSerumQty = scaleForPeriod(42, seed, 65);
  const replenSerumCost = scaleForPeriod(218400, seed, 66);
  const replenCremeQty = scaleForPeriod(14, seed, 67);
  const replenCremeCost = scaleForPeriod(61600, seed, 68);
  const replenSavonQty = scaleForPeriod(18, seed, 69);
  const replenSavonCost = scaleForPeriod(72000, seed, 70);
  const replenKariteQty = scaleForPeriod(12, seed, 71);
  const replenKariteCost = scaleForPeriod(134000, seed, 72);
  const replenBudget = replenSerumCost + replenCremeCost + replenSavonCost + replenKariteCost;

  const opSerumPerDay = scaleForPeriod(137, seed, 73); // ×100 → dec2
  const opSerumConsumed = scaleForPeriod(6, seed, 74);
  const opSerumReserve = scaleForPeriod(7, seed, 75);
  const opSerumPoint = scaleForPeriod(13, seed, 76);
  const opCremePerDay = scaleForPeriod(31, seed, 77);
  const opCremeConsumed = scaleForPeriod(2, seed, 78);
  const opCremeReserve = scaleForPeriod(2, seed, 79);
  const opCremePoint = scaleForPeriod(4, seed, 80);
  const opSavonPerDay = scaleForPeriod(55, seed, 81);
  const opSavonConsumed = scaleForPeriod(3, seed, 82);
  const opSavonReserve = scaleForPeriod(3, seed, 83);
  const opSavonPoint = scaleForPeriod(6, seed, 84);
  const opKaritePerDay = scaleForPeriod(110, seed, 85);
  const opKariteConsumed = scaleForPeriod(5, seed, 86);
  const opKariteReserve = scaleForPeriod(6, seed, 87);
  const opKaritePoint = scaleForPeriod(11, seed, 88);
  const opSandalesPerDay = scaleForPeriod(70, seed, 89);
  const opSandalesConsumed = scaleForPeriod(3, seed, 90);
  const opSandalesReserve = scaleForPeriod(4, seed, 91);
  const opSandalesPoint = scaleForPeriod(7, seed, 92);
  const opLinPerDay = scaleForPeriod(40, seed, 93);
  const opLinConsumed = scaleForPeriod(2, seed, 94);
  const opLinReserve = scaleForPeriod(2, seed, 95);
  const opLinPoint = scaleForPeriod(4, seed, 96);

  // Mouvement du stock + demande face au stock : mêmes courbes que plus bas
  // dans le fichier (STOCK_LEVEL / DEMAND / VENDU_STOCK), mises à l'échelle
  // de la période. Même clé (300 + i) pour DEMAND et VENDU_STOCK afin que le
  // rapport entre les deux courbes (et la zone de rupture) reste cohérent.
  const stockLevel = STOCK_LEVEL.map((v, i) => scaleForPeriod(v, seed, 200 + i));
  const demand = DEMAND.map((v, i) => scaleForPeriod(v, seed, 300 + i));
  const venduStock = VENDU_STOCK.map((v, i) => scaleForPeriod(v, seed, 300 + i));

  // "Comparer à la période précédente" : révèle une ligne "Période
  // précédente" sous chaque KPI. Pas de vraie période antérieure tant que
  // l'API Laravel n'existe pas (cf. [[dashboard-mock-data-pending-laravel-api]]),
  // donc valeurs mock cohérentes avec les écarts déjà affichés (ex: 8,9× −
  // 1,2 = 7,7× pour la rotation annuelle, dont l'écart est connu).
  const [compare, setCompare] = useState(false);

  // "Exporter" : KPI de la période, répartition vendable/immobilisé,
  // sites du partenaire et lots à date limite — les tableaux chiffrés
  // déjà affichés en haut de section.
  const [exportDone, setExportDone] = useState(false);
  function handleExport() {
    openBrandedReport(t("Stock", "Stock"), t("Ce qui est vendable, et ce qui ne l'est pas", "What's sellable, and what isn't"), [
      {
        heading: t("Indicateurs de la période", "Period metrics"),
        columns: [t("Indicateur", "Metric"), t("Valeur", "Value"), t("Note", "Note")],
        rows: [
          [t("Valeur du stock", "Stock value"), F(stockValue), t("prix d'achat · 168 unités", "cost price · 168 units")],
          [t("Valeur de revente", "Resale value"), F(resaleValue), t("si tout se vend au prix affiché", "if everything sells at listed price")],
          [t("Rotation annuelle", "Annual turnover"), `${dec1(turnover)}×`, t("+1,2 vs période précédente", "+1.2 vs previous period")],
          [t("Couverture moyenne", "Average coverage"), `${N(coverage)} j`, t("au rythme de vente actuel", "at the current sales pace")],
          [t("Taux de service", "Service rate"), `${N(serviceRate)} %`, t("12 ventes perdues sur rupture", "12 sales lost to stockouts")],
        ],
      },
      {
        heading: t("Vendable vs immobilisé", "Sellable vs tied up"),
        rows: [
          [t("Disponibles à la vente", "Available for sale"), N(availableUnits)],
          [t("Réservées par des commandes en cours", "Reserved for orders in progress"), N(reservedUnits)],
          [t("Bloquées par un litige", "Blocked by a dispute"), N(blockedUnits)],
          [t("En retour après un refus", "Returned after a refusal"), N(returnedUnits)],
        ],
      },
      {
        heading: t("Sites du partenaire", "Partner sites"),
        columns: [t("Site", "Site"), t("Unités", "Units"), t("Cmd. servies", "Orders served"), t("Délai moyen", "Avg. time")],
        rows: [
          ["Cocody", N(stockCocody), N(commandesCocody), "3 h 40"],
          ["Yopougon", N(stockYopougon), N(commandesYopougon), "4 h 45"],
          ["Bouaké", N(stockBouake), N(commandesBouake), "11 h 30"],
        ],
      },
      {
        heading: t("Lots et dates limites", "Batches and deadlines"),
        columns: [t("Référence et lot", "Item and batch"), t("Unités", "Units"), t("Date limite", "Deadline"), t("Valeur", "Value"), t("Reste", "Remaining")],
        rows: [
          [t("Crème mains 75 ml · lot C-2408", "Hand cream 75 ml · batch C-2408"), "2", t("5 octobre 2026", "Oct. 5, 2026"), "8 800 F", t("27 jours", "27 days")],
          [t("Beurre de karité 200 g · lot K-2409", "Shea butter 200 g · batch K-2409"), "21", t("12 novembre 2026", "Nov. 12, 2026"), "59 200 F", t("2 mois", "2 months")],
          [t("Sérum éclat 30 ml · lot A-2411", "Radiance serum 30 ml · batch A-2411"), "6", t("18 janvier 2027", "Jan. 18, 2027"), "31 200 F", t("4 mois", "4 months")],
          [t("Savon noir 250 g · lot S-2412", "Black soap 250 g · batch S-2412"), "6", t("Juin 2027", "June 2027"), "24 000 F", t("9 mois", "9 months")],
        ],
      },
    ]);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  return (
    <>
      <SectionHeader
        eyebrow={t("Stock", "Stock")}
        title={t("Ce qui est vendable, et ce qui ne l'est pas", "What's sellable, and what isn't")}
        subtitle={
          <>
            {t("Dates limites par lot, qualité à chaque passage de main,", "Deadlines by batch, quality at every handoff,")}
            <br />
            {t("valeur réelle des retours, âge et rotation, sites du partenaire,", "real value of returns, age and turnover, partner sites,")}
            <br />
            {t(
              "demande face au stock, point de commande référence par référence.",
              "demand against stock, reorder point reference by reference."
            )}
          </>
        }
        first={first}
        layout="inline"
        actions={
          <>
            <HeaderActionBtn onClick={handleExport}>{exportDone ? t("Exporté", "Exported") : t("Exporter", "Export")}</HeaderActionBtn>
            <HeaderActionBtn onClick={() => setCompare((c) => !c)}>
              {compare ? t("Revenir à la période actuelle", "Back to current period") : t("Comparer à la période précédente", "Compare to previous period")}
            </HeaderActionBtn>
          </>
        }
      />

      {/* Légende : quelle couleur renvoie à quelle façon de vendre */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--dashboard-glass)] px-4 py-3 text-[10px] text-[var(--dashboard-text)]/50">
        <span className="flex items-center gap-1.5"><Nature code="S" /> {t("Stockage management", "Warehousing")}</span>
        <span className="flex items-center gap-1.5"><Nature code="D" /> {t("Dropshipping", "Drop-shipping")}</span>
        <span className="flex items-center gap-1.5"><Nature code="B" /> {t("Les deux", "Both")}</span>
        <span className="ml-auto">{t("Bleu : votre marchandise. Rose : celle du partenaire. Neutre : ce qui vaut des deux côtés.", "Blue: your goods. Pink: the partner's. Neutral: what applies to both.")}</span>
      </div>

      {/* 3 premiers blocs (KPI, vendable/immobilisé, mouvement du stock)
          toujours visibles ; le reste passe sous le bouton "Voir tout le
          contenu" de CollapsibleCards — cf. shared.tsx. */}
      <CollapsibleCards visibleCount={3}>
      {/* KPI de la période */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label={t("Valeur du stock", "Stock value")} value={F(stockValue)} note={t("prix d'achat · 168 unités", "cost price · 168 units")} previous={compare ? F(stockValuePrev) : undefined} />
        <KpiCard label={t("Valeur de revente", "Resale value")} value={F(resaleValue)} valueColor="#178a3f" note={t("si tout se vend au prix affiché", "if everything sells at listed price")} previous={compare ? F(resaleValuePrev) : undefined} />
        <KpiCard label={t("Rotation annuelle", "Annual turnover")} value={`${dec1(turnover)}×`} note={t("+1,2 vs période précédente", "+1.2 vs previous period")} noteColor="#178a3f" previous={compare ? `${dec1(turnoverPrev)}×` : undefined} />
        <KpiCard label={t("Couverture moyenne", "Average coverage")} value={`${N(coverage)} j`} note={t("au rythme de vente actuel", "at the current sales pace")} previous={compare ? `${N(coveragePrev)} j` : undefined} />
        <KpiCard label={t("Taux de service", "Service rate")} value={`${N(serviceRate)} %`} valueColor="#a8690a" note={t("12 ventes perdues sur rupture", "12 sales lost to stockouts")} noteColor="#c8262d" previous={compare ? `${N(serviceRatePrev)} %` : undefined} />
      </div>

      {/* Vendable vs immobilisé */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Ce qu'il y a dans l'entrepôt, et ce qui est vraiment vendable", "What's in the warehouse, and what's really sellable")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("168 unités déposées, toutes ne sont pas disponibles", "168 units deposited, not all are available")}</p>
          </div>
          <Tag tone="blue">S</Tag>
        </div>
        <StackedBar segments={[{ pct: pctOf(availableUnits), color: "#4FE0AE" }, { pct: pctOf(reservedUnits), color: "#38BDF8" }, { pct: pctOf(blockedUnits), color: "#FFB020" }, { pct: pctOf(returnedUnits), color: "#FF5A62" }]} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "#4FE0AE" }} /><div><p className="text-xs font-semibold">{N(availableUnits)} {t("unités", "units")}</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Disponibles à la vente", "Available for sale")}</p></div></div>
          <div className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "#38BDF8" }} /><div><p className="text-xs font-semibold">{N(reservedUnits)} {t("unités", "units")}</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Réservées par des commandes en cours", "Reserved for orders in progress")}</p></div></div>
          <div className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "#FFB020" }} /><div><p className="text-xs font-semibold">{N(blockedUnits)} {t("unités", "units")}</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Bloquées par un litige", "Blocked by a dispute")}</p></div></div>
          <div className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "#FF5A62" }} /><div><p className="text-xs font-semibold">{N(returnedUnits)} {t("unités", "units")}</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("En retour après un refus", "Returned after a refusal")}</p></div></div>
        </div>
        <div className="mt-4 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Trente unités sur cent soixante-huit ne peuvent pas être vendues aujourd'hui", "Thirty units out of a hundred and sixty-eight can't be sold today")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Les réservées partiront, les bloquées attendent une décision, mais les dix-neuf en retour sont la vraie question : elles ont voyagé deux fois, elles sont revenues, et rien ne dit qu'elles sont encore vendables. Un contrôle à leur arrivée évite de les revendre abîmées et de créer un second litige.",
              "Reserved units will move, blocked ones await a decision, but the nineteen returns are the real issue: they've traveled twice, come back, and nothing says they're still sellable. Checking them on arrival avoids reselling damaged goods and creating a second dispute."
            )}
          </p>
        </div>
      </Card>

      {/* Mouvement du stock */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Le mouvement de votre stock", "The movement of your stock")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Niveau jour par jour, dépôts et sorties", "Level day by day, deposits and outflows")}</p>
          </div>
          <span className="flex items-center gap-3 text-[9px] font-medium text-[var(--dashboard-text)]/55">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: STOCK_COLOR }} />{t("Niveau", "Level")}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4FE0AE" }} />{t("Dépôts", "Deposits")}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#9096AA" }} />{t("Sorties", "Outflows")}</span>
          </span>
        </div>
        <AreaChart values={stockLevel} color={STOCK_COLOR} />
        <MovementBars values={stockLevel} positive="#4FE0AE" negative="#9096AA" />
        <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
          <span>9 août</span><span>16 août</span><span>23 août</span><span>30 août</span><span>8 sept.</span>
        </div>
        <Divider />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Déposé", "Deposited")}</p><p className="mt-0.5 text-base font-bold" style={{ color: "#178a3f" }}>{N(depositedUnits)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("en 2 dépôts", "in 2 deposits")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Vendu", "Sold")}</p><p className="mt-0.5 text-base font-bold">{N(soldUnits)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("4,1 par jour", "4.1 per day")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Revenu", "Returned")}</p><p className="mt-0.5 text-base font-bold" style={{ color: "#c8262d" }}>{N(returnedUnits)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("après refus", "after refusal")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Écarts constatés", "Discrepancies found")}</p><p className="mt-0.5 text-base font-bold" style={{ color: "#a8690a" }}>{N(discrepancyUnits)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("casse ou manquant", "breakage or missing")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Prochain dépôt", "Next deposit")}</p><p className="mt-0.5 text-base font-bold">{t("Jeudi 11", "Thursday 11")}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("déjà planifié", "already planned")}</p></div>
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "Les deux ressauts sont vos dépôts. Entre eux, la pente descend régulièrement : c'est la vitesse de vente. Plus la pente est raide, moins la couverture dure — et c'est cette pente, pas le niveau, qui dit quand redéposer.",
            "The two jumps are your deposits. Between them, the slope declines steadily: that's the sell-through speed. The steeper the slope, the shorter the coverage — and it's this slope, not the level, that says when to restock."
          )}
        </p>
      </Card>

      {/* Âge du stock + rotation par référence */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Depuis quand votre marchandise est là", "How long your goods have been sitting")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Valeur d'achat, par tranche d'ancienneté", "Cost value, by age bracket")}</p>
            </div>
            <Tag tone="blue">S</Tag>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <AgeBlock pct={agePct(ageUnder30)} maxPct={ageMaxPct} color="#4FE0AE" label={t("< 30 j", "<30d")} />
            <AgeBlock pct={agePct(age30to60)} maxPct={ageMaxPct} color="#38BDF8" label={t("30-60 j", "30-60d")} />
            <AgeBlock pct={agePct(age60to90)} maxPct={ageMaxPct} color="#FFB020" label={t("60-90 j", "60-90d")} />
            <AgeBlock pct={agePct(ageOver90)} maxPct={ageMaxPct} color="#FF5A62" label={t("> 90 j", ">90d")} pill />
          </div>
          <div className="mt-4">
            <AgeRow label={t("Moins de 30 jours", "Under 30 days")} value={F(ageUnder30)} pct={`${Math.round(agePct(ageUnder30))} %`} tone="ok" />
            <AgeRow label={t("30 à 60 jours", "30 to 60 days")} value={F(age30to60)} pct={`${Math.round(agePct(age30to60))} %`} tone="ok" />
            <AgeRow label={t("60 à 90 jours", "60 to 90 days")} value={F(age60to90)} pct={`${Math.round(agePct(age60to90))} %`} tone="mid" />
            <AgeRow label={t("Plus de 90 jours", "Over 90 days")} value={F(ageOver90)} pct={`${Math.round(agePct(ageOver90))} %`} tone="bad" />
          </div>
          <div className="mt-4 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Quatre cent douze mille francs dorment depuis plus de deux mois", "Four hundred twelve thousand francs have been sitting for over two months")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "C'est de l'argent que vous avez sorti et qui ne revient pas. Passé quatre-vingt-dix jours, une marchandise ne se vend presque jamais au prix prévu : mieux vaut la solder maintenant à petite marge que la garder six mois de plus en espérant mieux.",
                "That's money you paid out and that isn't coming back. Past ninety days, goods almost never sell at the planned price: better to clear them now at a thin margin than hold six more months hoping for better."
              )}
            </p>
          </div>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Combien de fois par an chaque référence tourne", "How many times a year each item turns over")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("En dessous de 4 fois, le stock coûte plus qu'il ne rapporte", "Under 4 times, stock costs more than it earns")}</p>
            </div>
            <Tag tone="blue">S</Tag>
          </div>
          <div className="mt-3">
            <RankRow label={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} value={`${dec1(rotSerum)} ${t("fois", "times")}`} pct={rotPct(rotSerum)} color="#178a3f" valueColor="#178a3f" />
            <RankRow label={t("Beurre de karité 200 g", "Shea butter 200 g")} value={`${dec1(rotKarite)} ${t("fois", "times")}`} pct={rotPct(rotKarite)} color="#178a3f" valueColor="#178a3f" />
            <RankRow label={t("Savon noir 250 g", "Black soap 250 g")} value={`${dec1(rotSavon)} ${t("fois", "times")}`} pct={rotPct(rotSavon)} color="#178a3f" valueColor="#178a3f" />
            <RankRow label={t("Crème mains 75 ml", "Hand cream 75 ml")} value={`${dec1(rotCreme)} ${t("fois", "times")}`} pct={rotPct(rotCreme)} color="#5AA9FF" />
            <RankRow label={t("Sandales tressées", "Woven sandals")} value={`${dec1(rotSandales)} ${t("fois", "times")}`} pct={rotPct(rotSandales)} color="#FFB020" valueColor="#a8690a" />
            <RankRow label={t("Ensemble lin deux pièces", "Two-piece linen set")} value={`${dec1(rotLin)} ${t("fois", "times")}`} pct={rotPct(rotLin)} color="#FF5A62" valueColor="#c8262d" />
          </div>
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
            {t(
              "Le sérum se renouvelle plus de neuf fois par an : chaque franc investi dessus travaille neuf fois. L'ensemble en lin ne tourne pas deux fois : le même franc y reste immobilisé six mois. À marge égale, la référence qui tourne vite rapporte cinq fois plus.",
              "The serum turns over more than nine times a year: every franc invested in it works nine times. The linen set doesn't turn twice: the same franc stays tied up there for six months. At equal margin, the fast-turning item earns five times more."
            )}
          </p>
        </Card>
      </div>

      {/* Où se trouve la marchandise */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Où se trouve votre marchandise", "Where your goods are")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Répartition entre les trois sites de votre partenaire", "Spread across your partner's three sites")}</p>
          </div>
          <Tag tone="blue">S</Tag>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-x-48 [&>*]:min-w-0">
          <div className="flex flex-col items-center gap-3">
            <Ring
              segments={[
                { pct: (stockCocody / sitesTotal) * 100, color: "#38BDF8" },
                { pct: (stockYopougon / sitesTotal) * 100, color: "#8B5CF6" },
                { pct: (stockBouake / sitesTotal) * 100, color: "#FFB020" },
              ]}
              size={100}
              className="sm:ml-28"
            >
              <span className="text-lg font-bold">{N(sitesTotal)}</span>
              <span className="text-[8px] text-[var(--dashboard-text)]/40">{t("unités", "units")}</span>
            </Ring>
            <div className="w-full space-y-1.5 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#38BDF8" }} />Cocody <b className="ml-auto">{N(stockCocody)}</b></span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#8B5CF6" }} />Yopougon <b className="ml-auto">{N(stockYopougon)}</b></span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#FFB020" }} />Bouaké <b className="ml-auto">{N(stockBouake)}</b></span>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-[1.2fr_0.6fr_1fr_0.8fr] gap-2 border-b border-[var(--dashboard-text)]/10 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
              <span>{t("Site", "Site")}</span><span>{t("Unités", "Units")}</span><span>{t("Cmd. servies", "Orders served")}</span><span className="text-right">{t("Délai moyen", "Avg. time")}</span>
            </div>
            <div className="divide-y divide-[var(--dashboard-text)]/[0.05]">
              <WarehouseRow site="Cocody" unites={N(stockCocody)} commandes={N(commandesCocody)} delai="3 h 40" />
              <WarehouseRow site="Yopougon" unites={N(stockYopougon)} commandes={N(commandesYopougon)} delai="4 h 45" />
              <WarehouseRow site="Bouaké" unites={N(stockBouake)} commandes={N(commandesBouake)} delai="11 h 30" bad={commandesBouake > stockBouake} />
            </div>
            <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
              <p className="text-xs font-semibold">{t("Bouaké sert plus de commandes qu'il n'a de stock", "Bouaké serves more orders than it has stock")}</p>
              <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
                {t(
                  "Dix-huit commandes servies pour quinze unités sur place : la différence part de Cocody, et c'est ce transfert qui explique les onze heures de délai. Déposer davantage à Bouaké réduirait le délai et le taux de refus de cette zone, aujourd'hui le plus mauvais des trois.",
                  "Eighteen orders served for fifteen units on hand: the gap comes from Cocody, and that transfer explains the eleven-hour lead time. Depositing more directly at Bouaké would cut the lead time and refusal rate of that zone, currently the worst of the three."
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Lots et dates limites */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Vos lots et leurs dates limites", "Your batches and their deadlines")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Au-delà de deux mois, une marchandise devient difficile à écouler", "Past two months, goods become hard to move")}</p>
          </div>
          <div className="flex items-center gap-2"><Tag tone="warn">{t("68 000 F à risque", "68 000 F at risk")}</Tag><Tag tone="blue">S</Tag></div>
        </div>
        <LotProgress
          items={[
            { days: 27, tone: "urg" },
            { days: 60, tone: "att" },
            { days: 120, tone: "ok" },
            { days: 270, tone: "ok" },
            { days: null, tone: "none" },
          ]}
        />
        <div className="mt-3 grid grid-cols-[1.6fr_0.5fr_1fr_0.9fr_1fr] gap-2 border-b border-[var(--dashboard-text)]/10 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
          <span>{t("Référence et lot", "Item and batch")}</span><span>{t("Unités", "Units")}</span><span>{t("Date limite", "Deadline")}</span><span>{t("Valeur", "Value")}</span><span className="text-right">{t("Reste", "Remaining")}</span>
        </div>
        <div className="max-h-[340px] divide-y divide-[var(--dashboard-text)]/[0.05] overflow-y-auto pr-1">
          <LotRow name={t("Crème mains 75 ml · lot C-2408", "Hand cream 75 ml · batch C-2408")} unites="2" date={t("5 octobre 2026", "Oct. 5, 2026")} valeur="8 800 F" badgeTone="urg" badgeLabel={t("27 jours", "27 days")} />
          <LotRow name={t("Beurre de karité 200 g · lot K-2409", "Shea butter 200 g · batch K-2409")} unites="21" date={t("12 novembre 2026", "Nov. 12, 2026")} valeur="59 200 F" badgeTone="att" badgeLabel={t("2 mois", "2 months")} />
          <LotRow name={t("Sérum éclat 30 ml · lot A-2411", "Radiance serum 30 ml · batch A-2411")} unites="6" date={t("18 janvier 2027", "Jan. 18, 2027")} valeur="31 200 F" badgeTone="ok" badgeLabel={t("4 mois", "4 months")} />
          <LotRow name={t("Savon noir 250 g · lot S-2412", "Black soap 250 g · batch S-2412")} unites="6" date={t("Juin 2027", "June 2027")} valeur="24 000 F" badgeTone="ok" badgeLabel={t("9 mois", "9 months")} />
          <LotRow name={t("Textile et maroquinerie", "Textiles and leather goods")} unites="34" date={t("Sans date limite", "No deadline")} valeur="—" badgeTone="none" badgeLabel={t("Non concerné", "Not applicable")} dim />
        </div>
        <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Le beurre de karité est le vrai sujet, pas la crème mains", "Shea butter is the real issue, not the hand cream")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "La crème expire dans vingt-sept jours mais ne pèse que 8 800 F : deux unités, on les écoule ou on les perd, c'est sans conséquence. Le beurre de karité expire dans deux mois et porte 59 200 F, avec dix-neuf jours de couverture : au rythme actuel il partira, mais sans marge d'erreur. Une semaine de rupture publicitaire dessus et vous vous retrouvez avec du stock périmé.",
              "The cream expires in twenty-seven days but is worth only 8 800 F: two units, sell them or lose them, no real consequence. Shea butter expires in two months and carries 59 200 F, with nineteen days of coverage: at the current pace it'll sell through, but with no margin for error. A week of ad downtime on it and you're left with expired stock."
            )}
          </p>
        </div>
      </Card>

      {/* Qualité à chaque passage de main + valeur des retours */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("La qualité, à chaque passage de main", "Quality, at every handoff")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce qui se casse, et où", "What breaks, and where")}</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
          <div className="mt-3 flex items-center gap-2 text-center">
            <div className="flex-1 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
              <p className="text-lg font-bold">{dec1(qualityReception)} %</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Conformes à la réception", "Compliant on receipt")}</p>
              <p className="mt-1 text-[9px] text-[var(--dashboard-text)]/40">{t("11 écarts sur 486", "11 discrepancies out of 486")}</p>
            </div>
            <span className="shrink-0 text-[var(--dashboard-text)]/25">→</span>
            <div className="flex-1 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
              <p className="text-lg font-bold">{dec1(qualityDelivery)} %</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Intacts à la livraison", "Intact on delivery")}</p>
              <p className="mt-1 text-[9px] text-[var(--dashboard-text)]/40">{t("2 litiges pour produit abîmé", "2 disputes for damaged goods")}</p>
            </div>
            <span className="shrink-0 text-[var(--dashboard-text)]/25">→</span>
            <div className="flex-1 rounded-xl p-3" style={{ background: "rgba(255,90,98,.1)" }}>
              <p className="text-lg font-bold" style={{ color: "#c8262d" }}>{N(returnsResellable)} %</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Revendables après un retour", "Resellable after a return")}</p>
              <p className="mt-1 text-[9px] text-[var(--dashboard-text)]/40">{t("5 sur 19 abîmées au voyage", "5 of 19 damaged in transit")}</p>
            </div>
          </div>
          <Divider />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Taux de casse par site", "Breakage rate by site")}</p>
          <div className="mt-2.5">
            <RankRow label="Cocody" value={`${dec1(breakageCocody)} %`} pct={breakagePct(breakageCocody)} color="#178a3f" valueColor="#178a3f" />
            <RankRow label="Yopougon" value={`${dec1(breakageYopougon)} %`} pct={breakagePct(breakageYopougon)} color="#a8690a" valueColor="#a8690a" />
            <RankRow label="Bouaké" value={`${dec1(breakageBouake)} %`} pct={breakagePct(breakageBouake)} color="#c8262d" valueColor="#c8262d" />
          </div>
          <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Bouaké casse quatre fois plus que Cocody", "Bouaké breaks four times more than Cocody")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Trois virgule deux pour cent contre zéro virgule huit. Ce n'est pas la faute du produit, c'est la route : la marchandise y arrive après un transfert depuis Cocody, donc deux manipulations de plus. Déposer directement à Bouaké réglerait la casse et le délai d'un même geste.",
                "Three point two percent against zero point eight. It's not the product's fault, it's the route: goods arrive there after a transfer from Cocody, so two extra handlings. Depositing directly at Bouaké would fix the breakage and the lead time in one move."
              )}
            </p>
          </div>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce que valent vos retours", "What your returns are worth")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Dix-neuf unités revenues, toutes ne se revendent pas", "Nineteen units back, not all resellable")}</p>
            </div>
            <Tag tone="blue">S</Tag>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(79,224,174,.08)" }}>
              <span className="w-7 shrink-0 text-center text-lg font-bold" style={{ color: "#178a3f" }}>{N(returnIntactCount)}</span>
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t("Intactes, remises en vente", "Intact, back on sale")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Refus sans ouverture du colis. Aucune perte.", "Refused unopened. No loss.")}</p></div>
              <span className="shrink-0 text-xs font-bold">{F(returnIntactValue)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,184,77,.08)" }}>
              <span className="w-7 shrink-0 text-center text-lg font-bold" style={{ color: "#a8690a" }}>{N(returnDamagedCount)}</span>
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t("Abîmées pendant le voyage", "Damaged in transit")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Emballage ouvert ou écrasé. À solder ou à jeter.", "Open or crushed packaging. Clear or discard.")}</p></div>
              <span className="shrink-0 text-xs font-bold">{F(returnDamagedValue)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,90,98,.08)" }}>
              <span className="w-7 shrink-0 text-center text-lg font-bold" style={{ color: "#c8262d" }}>{N(returnDefectCount)}</span>
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t("Défaut de fabrication", "Manufacturing defect")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Le client avait raison. À réclamer au fournisseur.", "The customer was right. Claimable from the supplier.")}</p></div>
              <span className="shrink-0 text-xs font-bold">{F(returnDefectValue)}</span>
            </div>
          </div>
          <Divider />
          <StatRow label={t("Valeur récupérée", "Value recovered")} value={<span style={{ color: "#178a3f" }}>{F(returnIntactValue)} {t("sur", "of")} {F(returnValueTotal)}</span>} />
          <StatRow label={t("Perdu sur les retours", "Lost on returns")} value={<span style={{ color: "#c8262d" }}>{F(returnValueLost)}</span>} />
          <StatRow label={t("Dont récupérable auprès du fournisseur", "Of which claimable from the supplier")} value={F(returnDefectValue)} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
            {t(
              "Un colis refusé revient rarement neuf. Faire contrôler les retours à l'arrivée, plutôt qu'au moment de les revendre, évite de créer un second litige sur la même marchandise et permet de réclamer à temps ce qui est défectueux.",
              "A refused parcel rarely comes back like new. Having returns checked on arrival, rather than when reselling them, avoids creating a second dispute on the same goods and lets you claim defects in time."
            )}
          </p>
        </Card>
      </div>

      {/* Demande face au stock */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("La demande face à votre stock", "Demand against your stock")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce que les clients ont voulu acheter, et ce que vous avez pu leur vendre", "What customers wanted to buy, and what you could sell them")}</p>
          </div>
          <span className="flex items-center gap-3 text-[9px] font-medium text-[var(--dashboard-text)]/55">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FF7A80" }} />{t("Demande", "Demand")}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#5AA9FF" }} />{t("Vendu", "Sold")}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#c8262d" }} />{t("Perdu sur rupture", "Lost to stockout")}</span>
          </span>
        </div>
        <AreaChart values={demand} color="#FF7A80" compareValues={venduStock} compareColor="#5AA9FF" gapColor="#c8262d" />
        <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
          <span>9 août</span><span>16 août</span><span>23 août</span><span>30 août</span><span>8 sept.</span>
        </div>
        <Divider />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Demande estimée", "Estimated demand")}</p><p className="mt-0.5 text-base font-bold">{N(demandEstimated)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("unités sur la période", "units this period")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Vendu", "Sold")}</p><p className="mt-0.5 text-base font-bold">{N(soldUnits)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("91 % de la demande", "91% of demand")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Perdu sur rupture", "Lost to stockout")}</p><p className="mt-0.5 text-base font-bold" style={{ color: "#c8262d" }}>{N(demandLost)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("214 000 F de chiffre", "214 000 F in revenue")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Marge perdue", "Margin lost")}</p><p className="mt-0.5 text-base font-bold" style={{ color: "#c8262d" }}>{F(marginLost)}</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("sur 3 références", "on 3 items")}</p></div>
          <div><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Taux de service", "Service rate")}</p><p className="mt-0.5 text-base font-bold" style={{ color: "#a8690a" }}>{N(demandServiceRate)} %</p><p className="text-[9px] text-[var(--dashboard-text)]/40">{t("cible du réseau : 95 %", "network target: 95%")}</p></div>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl p-3" style={{ background: "rgba(79,224,174,.08)" }}>
            <p className="text-xs font-semibold">{t("Sérum éclat 30 ml", "Radiance serum 30 ml")}</p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: "#178a3f" }}>+{N(trendSerum)} %</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("La demande accélère depuis trois semaines. C'est aussi la référence en rupture dans quatre jours.", "Demand has accelerated for three weeks. It's also the item running out in four days.")}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(255,184,77,.08)" }}>
            <p className="text-xs font-semibold">{t("Beurre de karité 200 g", "Shea butter 200 g")}</p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: "#a8690a" }}>+{N(trendKarite)} %</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Demande stable. Le stock suit, mais la date limite approche.", "Demand stable. Stock keeps pace, but the deadline is near.")}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(255,90,98,.08)" }}>
            <p className="text-xs font-semibold">{t("Sandales tressées", "Woven sandals")}</p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: "#c8262d" }}>−{N(trendSandales)} %</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("La demande recule depuis un mois, et il reste vingt-six jours de couverture.", "Demand has fallen for a month, and twenty-six days of coverage remain.")}</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("La zone rouge entre les deux courbes, c'est de l'argent que personne n'a encaissé", "The red zone between the two curves is money nobody collected")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Douze clients ont voulu acheter et n'ont pas pu. Ce n'est pas une vente reportée : dans neuf cas sur dix, ils achètent ailleurs et ne reviennent pas. Deux cent quatorze mille francs de chiffre, cinquante-six mille de marge, perdus pour quatre jours de stock manquant sur trois références. C'est le coût réel d'une rupture, et il dépasse toujours celui d'un surstock raisonnable.",
              "Twelve customers wanted to buy and couldn't. That's not a postponed sale: nine times out of ten, they buy elsewhere and don't come back. Two hundred fourteen thousand francs in revenue, fifty-six thousand in margin, lost over four days of missing stock on three items. That's the real cost of a stockout, and it always beats a reasonable overstock."
            )}
          </p>
        </div>
      </Card>

      {/* Recherches sans réponse + ce que tient le partenaire en drop */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce qu'on vous demande et que vous n'avez pas", "What's requested that you don't have")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Recherches faites sur votre boutique, sans résultat", "Searches made on your shop, no result")}</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
          <div className="mt-3">
            <RankRow label={t("Gel douche", "Shower gel")} value={N(searchGel)} pct={searchPct(searchGel)} color="#EC4899" />
            <RankRow label={t("Huile de coco", "Coconut oil")} value={N(searchHuile)} pct={searchPct(searchHuile)} color="#EC4899" />
            <RankRow label={t("Masque cheveux", "Hair mask")} value={N(searchMasque)} pct={searchPct(searchMasque)} color="#EC4899" />
            <RankRow label={t("Savon liquide", "Liquid soap")} value={N(searchSavon)} pct={searchPct(searchSavon)} color="#EC4899" />
            <RankRow label={t("Crème solaire", "Sunscreen")} value={N(searchCreme)} pct={searchPct(searchCreme)} color="#EC4899" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
            <Tag tone="ok">{t("Gel douche · 3 au catalogue partenaire", "Shower gel · 3 in partner catalog")}</Tag>
            <Tag tone="ok">{t("Huile de coco · 2 au catalogue partenaire", "Coconut oil · 2 in partner catalog")}</Tag>
            <Tag tone="ok">{t("Masque cheveux · 5 au catalogue partenaire", "Hair mask · 5 in partner catalog")}</Tag>
            <Tag tone="neutral">{t("Savon liquide · à sourcer vous-même", "Liquid soap · source it yourself")}</Tag>
            <Tag tone="neutral">{t("Crème solaire · à sourcer vous-même", "Sunscreen · source it yourself")}</Tag>
          </div>
          <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Cent dix-neuf recherches sans réponse, dont quatre-vingt-onze déjà disponibles chez votre partenaire", "119 unanswered searches, 91 already available from your partner")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Trois familles de produits que vos clients cherchent chez vous existent déjà au catalogue du partenaire, en dropshipping. Les ajouter ne coûte rien : pas d'achat, pas de dépôt, pas d'immobilisation. C'est le seul endroit de cet écran où l'on peut gagner du chiffre sans sortir un franc.",
                "Three product families your customers search for already exist in the partner's dropshipping catalog. Adding them costs nothing: no purchase, no deposit, nothing tied up. It's the only place on this screen where you can gain revenue without spending a franc."
              )}
            </p>
          </div>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce que le partenaire tient pour vous", "What the partner holds for you")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Onze références vendues sans stock de votre part", "Eleven items sold with none of your own stock")}</p>
            </div>
            <Tag tone="pink">{t("Dropshipping", "Drop-shipping")}</Tag>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,90,98,.08)" }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#FF5A62" }} />
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t("Huile de ricin 100 ml", "Castor oil 100 ml")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Le partenaire arrive au bout", "Partner running low")}</p></div>
              <Tag tone="ko">{t("Au plus 6 jours", "6 days max")}</Tag>
            </div>
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,90,98,.08)" }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#FF5A62" }} />
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t("Masque argile 100 g", "Clay mask 100 g")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Le partenaire arrive au bout", "Partner running low")}</p></div>
              <Tag tone="ko">{t("Au plus 6 jours", "6 days max")}</Tag>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#4FE0AE]" />
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t("9 autres références", "9 other items")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Rien à surveiller", "Nothing to watch")}</p></div>
              <Tag tone="dark">{t("Plus de 6 jours", "Over 6 days")}</Tag>
            </div>
          </div>
          <Divider />
          <StatRow label={t("Ventes faites sans avancer un franc", "Sales made without fronting a franc")} value={<span style={{ color: "#178a3f" }}>{F(dropSales)}</span>} />
          <StatRow label={t("Immobilisation de votre côté", "Tied up on your side")} value="0 F" />
          <StatRow label={t("Litiges pour produit non conforme", "Disputes for non-conforming goods")} value={<span style={{ color: "#a8690a" }}>{N(dropDisputes)} {t("sur", "of")} {N(dropDisputesTotal)}</span>} />
          <StatRow label={t("Références disponibles et non activées", "Available items not yet activated")} value={<span style={{ color: "#178a3f" }}>{N(dropAvailable)}</span>} />
          <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Le drop ne coûte rien en stock, mais coûte en qualité de fiche", "Drop costs nothing in stock, but costs in listing quality")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Sept litiges sur vingt-six viennent de produits qui ne ressemblaient pas à l'annonce, et ils sont tous en dropshipping : ce sont les photos et les descriptions du partenaire, que vous reprenez telles quelles. Vérifier une fiche avant de l'activer coûte dix minutes et évite un litige à 3 400 F.",
                "Seven disputes out of twenty-six come from products that didn't match the listing, and all of them are dropshipped: it's the partner's photos and descriptions, which you reuse as-is. Checking a listing before activating it takes ten minutes and avoids a 3 400 F dispute."
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Réapprovisionnement à déposer jeudi */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Ce qu'il faut déposer jeudi", "What to deposit Thursday")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Quantités calculées sur trente jours de couverture, délai de réapprovisionnement déduit", "Quantities calculated on thirty days of coverage, replenishment lead time deducted")}</p>
          </div>
          <div className="flex items-center gap-2"><Tag tone="pink">{`${t("Budget", "Budget")} ${F(replenBudget)}`}</Tag><Tag tone="blue">S</Tag></div>
        </div>
        <div className="mt-3 grid grid-cols-[1.4fr_0.6fr_0.8fr_0.6fr_1fr_1fr] gap-2 border-b border-[var(--dashboard-text)]/10 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
          <span>{t("Référence", "Item")}</span><span>{t("En stock", "In stock")}</span><span>{t("Couverture", "Coverage")}</span><span>{t("À déposer", "To deposit")}</span><span>{t("Coût", "Cost")}</span><span className="text-right">{t("État", "Status")}</span>
        </div>
        <div className="max-h-[340px] divide-y divide-[var(--dashboard-text)]/[0.05] overflow-y-auto pr-1">
          <ReplenishRow name={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} stock={N(stockSerum)} couverture={t("4 jours", "4 days")} couvertureTone="bad" qty={N(replenSerumQty)} cost={F(replenSerumCost)} badge={t("Urgent", "Urgent")} badgeKind="urgent" />
          <ReplenishRow name={t("Crème mains 75 ml", "Hand cream 75 ml")} stock={N(stockCreme)} couverture={t("7 jours", "7 days")} couvertureTone="mid" qty={N(replenCremeQty)} cost={F(replenCremeCost)} badge={t("Urgent", "Urgent")} badgeKind="urgent" />
          <ReplenishRow name={t("Savon noir 250 g", "Black soap 250 g")} stock={N(stockSavon)} couverture={t("11 jours", "11 days")} couvertureTone="ok" qty={N(replenSavonQty)} cost={F(replenSavonCost)} badge={t("Conseillé", "Advised")} badgeKind="conseille" />
          <ReplenishRow name={t("Beurre de karité 200 g", "Shea butter 200 g")} stock={N(stockKarite)} couverture={t("19 jours", "19 days")} couvertureTone="ok" qty={N(replenKariteQty)} cost={F(replenKariteCost)} badge={t("Conseillé", "Advised")} badgeKind="conseille" />
          <ReplenishRow name={t("Sandales tressées", "Woven sandals")} stock={N(stockSandales)} couverture={t("26 jours", "26 days")} couvertureTone="ok" qty="0" cost="—" badge={t("Ne pas reprendre", "Don't restock")} badgeKind="non" dim />
          <ReplenishRow name={t("Ensemble lin deux pièces", "Two-piece linen set")} stock={N(stockLin)} couverture={t("41 jours", "41 days")} couvertureTone="ok" qty="0" cost="—" badge={t("Ne pas reprendre", "Don't restock")} badgeKind="non" dim />
        </div>
        <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Deux références urgentes, deux à ne pas reprendre", "Two urgent items, two not to restock")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Le sérum est votre première locomotive et il tombe en rupture dans quatre jours : c'est la seule ligne qui ne souffre aucun retard. À l'inverse, les sandales et l'ensemble en lin ont respectivement vingt-six et quarante et un jours devant eux, et l'un des deux perd de l'argent à chaque vente. Reprendre ces deux-là au prochain dépôt reviendrait à immobiliser une deuxième fois ce qui ne s'est pas encore vendu.",
              "The serum is your top seller and runs out in four days: the only line that can't afford any delay. Conversely, the sandals and the linen set have twenty-six and forty-one days left respectively, and one of them loses money on every sale. Restocking those two at the next deposit would tie up a second time what hasn't sold yet."
            )}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Le dépôt de jeudi est déjà planifié avec votre partenaire. Le contenu peut être modifié jusqu'à mercredi soir.", "Thursday's deposit is already scheduled with your partner. Contents can be changed until Wednesday evening.")}</p>
          <div className="flex shrink-0 gap-2">
            <Btn variant="outline" className="!w-auto px-4">{t("Modifier", "Edit")}</Btn>
            <Btn variant="white" className="!w-auto px-5">{t("Valider ce dépôt", "Confirm this deposit")}</Btn>
          </div>
        </div>
      </Card>

      {/* Point de commande */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Votre point de commande, référence par référence", "Your reorder point, item by item")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Le niveau à partir duquel il faut redéposer, calculé sur vos ventes et vos délais", "The level below which you must restock, based on your sales and lead times")}</p>
          </div>
          <Tag tone="blue">S</Tag>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dashboard-text)]/10 text-[10px] font-bold">1</span>
            <p className="mt-2 text-xs font-semibold">{t("Ce qui part pendant le délai", "What sells during the lead time")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Vos ventes par jour, multipliées par les quatre jours que met le dépôt à arriver.", "Your daily sales, times the four days the deposit takes to arrive.")}</p>
          </div>
          <div className="rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dashboard-text)]/10 text-[10px] font-bold">2</span>
            <p className="mt-2 text-xs font-semibold">{t("Une réserve de sécurité", "A safety reserve")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("De quoi tenir si les ventes s'accélèrent ou si le dépôt prend du retard. Ici, cinq jours.", "Enough to hold if sales speed up or the deposit runs late. Here, five days.")}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(232,32,126,.1)" }}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink/20 text-[10px] font-bold text-brand-pink">3</span>
            <p className="mt-2 text-xs font-semibold">{t("Le point de commande", "The reorder point")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Quand le stock descend à ce niveau, on redépose. Sans attendre, sans réfléchir.", "When stock drops to this level, restock. No waiting, no second-guessing.")}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[1.4fr_0.7fr_0.9fr_0.6fr_0.9fr_0.6fr_1fr] gap-2 border-b border-[var(--dashboard-text)]/10 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
          <span>{t("Référence", "Item")}</span><span>{t("Ventes/j", "Sales/day")}</span><span>{t("Conso. 4 j", "4-day use")}</span><span>{t("Réserve", "Reserve")}</span><span>{t("Pt commande", "Reorder pt")}</span><span>{t("En stock", "In stock")}</span><span className="text-right">{t("État", "Status")}</span>
        </div>
        <div className="max-h-[340px] divide-y divide-[var(--dashboard-text)]/[0.05] overflow-y-auto pr-1">
          <OrderPointRow name={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} perDay={dec2(opSerumPerDay)} consumed={N(opSerumConsumed)} reserve={N(opSerumReserve)} point={N(opSerumPoint)} stock={N(stockSerum)} stockBad badge="under" />
          <OrderPointRow name={t("Crème mains 75 ml", "Hand cream 75 ml")} perDay={dec2(opCremePerDay)} consumed={N(opCremeConsumed)} reserve={N(opCremeReserve)} point={N(opCremePoint)} stock={N(stockCreme)} stockBad badge="under" />
          <OrderPointRow name={t("Savon noir 250 g", "Black soap 250 g")} perDay={dec2(opSavonPerDay)} consumed={N(opSavonConsumed)} reserve={N(opSavonReserve)} point={N(opSavonPoint)} stock={N(stockSavon)} stockBad={false} badge="at" />
          <OrderPointRow name={t("Beurre de karité 200 g", "Shea butter 200 g")} perDay={dec2(opKaritePerDay)} consumed={N(opKariteConsumed)} reserve={N(opKariteReserve)} point={N(opKaritePoint)} stock={N(stockKarite)} stockBad={false} badge="ok" />
          <OrderPointRow name={t("Sandales tressées", "Woven sandals")} perDay={dec2(opSandalesPerDay)} consumed={N(opSandalesConsumed)} reserve={N(opSandalesReserve)} point={N(opSandalesPoint)} stock={N(stockSandales)} stockBad={false} badge="ok" />
          <OrderPointRow name={t("Ensemble lin deux pièces", "Two-piece linen set")} perDay={dec2(opLinPerDay)} consumed={N(opLinConsumed)} reserve={N(opLinReserve)} point={N(opLinPoint)} stock={N(stockLin)} stockBad={false} badge="over" />
        </div>
        <div className="mt-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Une règle qui remplace le jugement", "A rule that replaces judgment")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Le point de commande enlève la décision de l'équation : on ne se demande plus s'il faut redéposer, on regarde si le stock est passé sous le chiffre. Deux références y sont, une l'atteint, une le dépasse de quatre fois. L'ensemble en lin est à seize unités pour un seuil de quatre : c'est un an de couverture immobilisé, et c'est exactement ce que cette colonne sert à ne plus refaire.",
              "The reorder point removes judgment from the equation: you no longer ask whether to restock, you check if stock fell under the number. Two items are there, one is right at it, one is four times over. The linen set sits at sixteen units for a threshold of four: that's a year of coverage tied up, and it's exactly what this column exists to stop repeating."
            )}
          </p>
        </div>
      </Card>

      {/* À traiter aujourd'hui — badge S/D optionnel (Nature) sur le titre
          quand le signal se rapporte à une seule façon de vendre (absent
          sur les retours, communs aux deux). `href` : Sérum éclat et
          Beurre de karité pointent vers /dashboard/produits?q=... (les deux
          seuls noms de ce panneau présents dans ProduitsCatalogue, cf.
          [[dashboard-mock-data-pending-laravel-api]]) ; l'ensemble en lin
          renvoie sur la liste sans filtre pour la même raison qu'en
          CommandesSection (un filtre sur un nom absent du mock donnerait
          "aucun résultat") ; les deux signaux catalogue partenaire pointent
          vers /dashboard/produits/catalogue, Bouaké vers la liste des
          commandes. */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]" style={{ borderColor: "rgba(255,184,77,.3)" }}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("À traiter aujourd'hui", "To handle today")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Classé par ce que l'inaction coûte", "Ranked by the cost of inaction")}</p>
          </div>
          <Tag tone="warn">{t("7 signaux", "7 signals")}</Tag>
        </div>
        <AlertItem
          tone="r"
          code="S"
          title={t("Sérum éclat sous son point de commande, et la demande accélère", "Radiance serum under its reorder point, and demand is accelerating")}
          desc={t("Six unités pour un seuil de treize, et une demande en hausse de 34 %. Le dépôt met quatre jours. Validé aujourd'hui il arrive juste ; demain, douze ventes de perdues.", "Six units for a threshold of thirteen, and demand up 34%. The deposit takes four days. Confirmed today it arrives just in time; tomorrow, twelve sales lost.")}
          cta={t("Valider le dépôt", "Confirm the deposit")}
          href={`/dashboard/produits?q=${encodeURIComponent(t("Sérum éclat", "Radiance serum"))}`}
        />
        <AlertItem
          tone="r"
          code="S"
          title={t("Beurre de karité : 59 200 F qui expirent dans deux mois", "Shea butter: 59 200 F expiring in two months")}
          desc={t("Vingt et une unités, dix-neuf jours de couverture. Au rythme actuel elles partent, mais sans marge d'erreur. Ne pas ralentir la publicité dessus.", "Twenty-one units, nineteen days of coverage. At the current pace they'll sell, but with no margin for error. Don't slow down ads on it.")}
          cta={t("Voir", "View")}
          href={`/dashboard/produits?q=${encodeURIComponent(t("Beurre de karité", "Shea butter"))}`}
        />
        <AlertItem
          tone="w"
          title={t("Sept unités revenues sont abîmées ou défectueuses", "Seven returned units are damaged or defective")}
          desc={t("73 200 F de valeur perdue, dont 19 200 F réclamables au fournisseur si la demande part sous quinze jours.", "73 200 F of lost value, of which 19 200 F claimable from the supplier if filed within fifteen days.")}
          cta={t("Réclamer", "Claim")}
          href="/dashboard/produits"
        />
        <AlertItem
          tone="w"
          code="S"
          title={t("Bouaké casse quatre fois plus que Cocody", "Bouaké breaks four times more than Cocody")}
          desc={t("3,2 % contre 0,8 %. La marchandise y arrive après un transfert, donc deux manipulations de plus. Un dépôt direct réglerait la casse et le délai.", "3.2% against 0.8%. Goods arrive there after a transfer, so two extra handlings. A direct deposit would fix the breakage and the lead time.")}
          cta={t("Voir", "View")}
          href="/dashboard/commandes?tab=commandes"
        />
        <AlertItem
          tone="b"
          code="D"
          title={t("Quatre-vingt-onze recherches sans réponse, déjà au catalogue partenaire", "Ninety-one unanswered searches, already in the partner catalog")}
          desc={t("Gel douche, huile de coco, masque cheveux. Les activer ne coûte ni achat ni dépôt.", "Shower gel, coconut oil, hair mask. Activating them costs no purchase, no deposit.")}
          cta={t("Voir le catalogue", "View catalog")}
          href="/dashboard/produits/catalogue"
        />
        <AlertItem
          tone="b"
          code="S"
          title={t("Ensemble en lin : quatre fois son point de commande", "Linen set: four times its reorder point")}
          desc={t("Seize unités pour un seuil de quatre, et une demande qui ne bouge pas. Ne rien reprendre au prochain dépôt.", "Sixteen units for a threshold of four, and flat demand. Don't restock it at the next deposit.")}
          cta={t("Voir", "View")}
          href="/dashboard/produits"
        />
        <AlertItem
          tone="b"
          code="D"
          title={t("Deux références du partenaire arrivent au bout", "Two of the partner's items are running low")}
          desc={t("Rien à réapprovisionner de votre côté : le seul geste utile est de couper la publicité dessus.", "Nothing to restock on your side: the only useful move is cutting ads on them.")}
          cta={t("Voir", "View")}
          href="/dashboard/produits/catalogue"
        />
      </Card>
      </CollapsibleCards>
    </>
  );
}
