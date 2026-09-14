"use client";

import Link from "next/link";
import { AreaChart, Bar, Card, CollapsibleCards, Divider, HeaderActionBtn, Nature, SectionHeader, StatRow, Table, Tag } from "./shared";
import RetentionCard from "./RetentionCard";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Commandes" de l'onglet Accueil — refonte complète d'après la
  maquette "LM · Accueil · Commandes" fournie (fichier HTML). Remplace
  l'ancienne version (KPI + parcours + heures/jours) par l'écran complet :
  parcours de la commande, rythme (jour, mois, heure), centre d'appel,
  livraison, panier/risque, temps par étape, motifs de refus, communes,
  clients qui reviennent, comparaison au réseau, litiges, signaux à traiter,
  projection à 7 jours.

  L'ancien bloc "assistance IA" (14 questions statiques en pied de section)
  est parti dans le bouton "solution LM" du navbar (DashboardHeader.tsx →
  AssistanceLMModal.tsx) : ouvert sur cet onglet Commandes, il montre les
  mêmes questions (dashboard-accueil/assistanceQuestions.ts), plus besoin
  de scroller toute la section pour les voir.

  Chiffres statiques en attendant l'API Laravel, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

// --- "Vos commandes, jour par jour" — 10 barres empilées stockage/drop,
// même logique d'échantillon que le graphe de chiffre d'affaires de
// FinancesSection (pas un jour par barre sur toute la période, un aperçu
// de forme).
const DAILY_ORDERS = [4, 5, 7, 6, 8, 10, 6, 9, 11, 7];
const STOCK_SHARE = 0.655; // 65,5 % des commandes en stockage management

// Convention couleur dashboard : stockage = bleu, dropshipping = rose,
// sur toute barre de progression / graph qui oppose les deux (cf. mémoire
// dashboard-chart-colors-stockage-drop).
const STOCK_COLOR = "#5AA9FF";

// --- "Le panier et son risque" — barres = nb commandes par tranche de
// panier (colonne "Cmd" de la table), ligne pointillée = taux de livraison
// en % (colonne "Livrées"). Mêmes valeurs des deux côtés, une seule source.
const BASKET_LABELS = ["< 10 k", "10-20 k", "20-50 k", "> 50 k"];
const BASKET_ORDERS = [21, 67, 48, 12];
const BASKET_DELIVERY_RATE = [91, 86, 74, 58];
// Même violet que "Commandes passées" (FunnelStep plus haut dans ce fichier,
// box={{ color: "#8B5CF6" }}) — pas brand-purple (#3A1D8A, trop sombre/indigo).
const ORDERS_COLOR = "#8B5CF6";
const DELIVERY_RATE_COLOR = "#4FE0AE";

// Courbe lissée (Catmull-Rom → Bézier cubique, tension 1/6) pour le combo
// aire/ligne de "Le panier et son risque" — remplace l'ancien histogramme
// à colonnes plates par une forme continue, cohérente avec le reste du
// dashboard (AreaChart de shared.tsx utilise le même principe de lissage).
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

// --- "Le cycle du mois" — 10 tranches de ~3 jours sur le mois ; la zone de
// paie (autour du 25 au 5) ressort nettement plus haute.
const MONTH_BUCKETS = [
  { pct: 46, paie: true }, // 1–3
  { pct: 40, paie: false },
  { pct: 34, paie: false },
  { pct: 30, paie: false },
  { pct: 36, paie: false },
  { pct: 32, paie: false },
  { pct: 38, paie: false },
  { pct: 44, paie: false },
  { pct: 78, paie: true }, // 25–27
  { pct: 100, paie: true }, // 28–31
];

// --- "Quand vos clients commandent" — densité par jour × tranche de 2 h
// (8 colonnes, 7 h30-23 h30 en pratique, étiquette = heure centrale de la
// tranche). Intensité 0-1, colorée en rose brand_pink (cf. formule de
// couleur sur la cellule) : basse = à peine teintée, haute = pleine
// couleur. Samedi ressort nettement au-dessus (meilleur jour, ~1,4× la
// moyenne), 20 h-22 h est la tranche la plus chargée sur toute la semaine.
const HOUR_SLOTS = ["8 h", "10 h", "12 h", "14 h", "16 h", "18 h", "20 h", "22 h"] as const;

const WEEK_HOURLY: { fr: string; en: string; values: number[] }[] = [
  { fr: "Lun", en: "Mon", values: [0.1, 0.12, 0.55, 0.5, 0.18, 0.15, 0.62, 0.8] },
  { fr: "Mar", en: "Tue", values: [0.12, 0.14, 0.6, 0.55, 0.2, 0.16, 0.68, 0.72] },
  { fr: "Mer", en: "Wed", values: [0.14, 0.15, 0.58, 0.52, 0.22, 0.18, 0.66, 0.88] },
  { fr: "Jeu", en: "Thu", values: [0.13, 0.14, 0.62, 0.58, 0.2, 0.17, 0.7, 0.82] },
  { fr: "Ven", en: "Fri", values: [0.16, 0.18, 0.65, 0.6, 0.24, 0.2, 0.74, 0.78] },
  { fr: "Sam", en: "Sat", values: [0.22, 0.26, 0.85, 0.8, 0.34, 0.3, 0.92, 1] },
  { fr: "Dim", en: "Sun", values: [0.15, 0.16, 0.72, 0.66, 0.22, 0.18, 0.78, 0.74] },
];

// --- "7 prochains jours" — projection, aujourd'hui + 6 jours.
const PROJECTION = [
  { fr: "Auj.", en: "Today", pct: 46 },
  { fr: "Mer", en: "Wed", pct: 54 },
  { fr: "Jeu", en: "Thu", pct: 39 },
  { fr: "Ven", en: "Fri", pct: 46 },
  { fr: "Sam", en: "Sat", pct: 70 },
  { fr: "Dim", en: "Sun", pct: 85 },
  { fr: "Lun", en: "Mon", pct: 62 },
] as const;

function SegmentBar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
      {segments.map((s, i) => (
        <span key={i} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${s.pct}%`, background: s.color }} />
      ))}
    </div>
  );
}

// Couleurs des 5 étapes, dans l'ordre — réutilisées par le nœud (FunnelStep)
// et par la ligne dégradée qui les relie (FunnelTrack).
const FUNNEL_COLORS = ["#9096AA", "#8B5CF6", "#5AA9FF", "#4FE0AE", "#3DA88C"];

// Étape du parcours, carte "Le parcours d'une commande" — pas de pavé
// rectangulaire : un nœud numéroté (pastille pleine) posé sur une ligne
// dégradée commune (FunnelTrack, dessinée par le parent), value/label/taux
// empilés dessous. Style pipeline/timeline plutôt que case pleine.
function FunnelStep({
  step,
  value,
  label,
  rate,
  rateColor,
  color,
}: {
  step: number;
  value: string;
  label: string;
  rate?: string;
  rateColor?: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-4 ring-[var(--dashboard-glass)]"
        style={{ background: color }}
      >
        {step}
      </span>
      <p className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{label}</p>
      {rate && (
        <p className="mt-1 text-[10px] font-semibold" style={{ color: rateColor }}>
          {rate}
        </p>
      )}
    </div>
  );
}

// Ligne derrière les 5 nœuds, un dégradé par intervalle (couleur de l'étape
// de départ → couleur de l'étape d'arrivée) — passe au travers des centres
// des pastilles (top-4 = moitié de h-8), 10 %/90 % ~ centre du 1er/dernier
// nœud dans une grille à 5 colonnes égales.
function FunnelTrack() {
  return (
    <div className="absolute left-[10%] right-[10%] top-4 flex h-[3px] overflow-hidden rounded-full">
      {FUNNEL_COLORS.slice(0, -1).map((c, i) => (
        <span key={i} className="h-full flex-1" style={{ background: `linear-gradient(90deg, ${c} 0%, ${FUNNEL_COLORS[i + 1]} 100%)` }} />
      ))}
    </div>
  );
}

function StatBar({ value, label, pct, color = "bg-brand-pink" }: { value: string; label: string; pct: number; color?: string }) {
  return (
    <div>
      <p className="text-lg font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{label}</p>
      <Bar pct={pct} color={color} />
    </div>
  );
}

function MotifRow({
  code,
  label,
  value,
  pct,
  last = false,
}: {
  code: "S" | "D" | "B";
  label: string;
  value: number;
  pct: number;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-2.5"}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

// Dégradé de la barre selon la performance de la commune : vert → bleu tant
// que la livraison tient (Cocody, Marcory, Treichville), orange → rose dès
// qu'elle résiste (Yopougon, Abobo, Bouaké) — cf. maquette "Où vous livrez,
// et où ça résiste". Distinct de la convention stockage=bleu/drop=rose
// (mémoire [[dashboard-chart-colors-stockage-drop]]) : ici la couleur note
// la performance de livraison, pas la façon de vendre.
const ZONE_GRADIENT_GOOD = "linear-gradient(90deg, #22C55E 0%, #38BDF8 100%)";
const ZONE_GRADIENT_BAD = "linear-gradient(90deg, #FFB020 0%, #F5576C 100%)";

function ZoneRow({ commune, pct, volume, delai, bad = false }: { commune: string; pct: number; volume: string; delai: string; bad?: boolean }) {
  return (
    <div className="mt-3 flex items-center gap-3 text-xs first:mt-4">
      <span className="w-20 shrink-0 font-semibold">{commune}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: bad ? ZONE_GRADIENT_BAD : ZONE_GRADIENT_GOOD }}
        />
      </div>
      <span className={`w-10 shrink-0 text-right font-bold ${bad ? "text-[#FFB020]" : ""}`}>{pct} %</span>
      <span className="w-14 shrink-0 text-right text-[var(--dashboard-text)]/40">{volume}</span>
      <span className="w-16 shrink-0 text-right text-[var(--dashboard-text)]/40">{delai}</span>
    </div>
  );
}

function BenchBar({ youPct, networkPct }: { youPct: number; networkPct: number }) {
  return (
    <div className="mt-1.5 space-y-2 first:mt-0">
      <div className="h-2 rounded-full bg-brand-pink" style={{ width: `${youPct}%` }} />
      <div className="h-2 rounded-full bg-[#9096AA]" style={{ width: `${networkPct}%` }} />
    </div>
  );
}

function BenchRow({
  label,
  you,
  network,
  delta,
  youPct,
  networkPct,
}: {
  label: string;
  you: string;
  network: string;
  delta: string;
  youPct: number;
  networkPct: number;
}) {
  return (
    <div className="mt-3 first:mt-0">
      <BenchBar youPct={youPct} networkPct={networkPct} />
      <div className="mt-1.5 grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-3 text-xs">
        <span className="text-[var(--dashboard-text)]/50">{label}</span>
        <span className="font-semibold text-[#178a3f]">{you}</span>
        <span className="text-[var(--dashboard-text)]/40">{network}</span>
        <span className="text-[10px] font-semibold text-[#178a3f]">{delta}</span>
      </div>
    </div>
  );
}

function DisputeReasonRow({ code, label, note, pct }: { code: "S" | "D" | "B"; label: string; note: string; pct: number }) {
  return (
    <div className="mt-2.5 flex items-start gap-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3 first:mt-3">
      <Nature code={code} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">{label}</p>
          <p className="text-xs font-bold">{pct} %</p>
        </div>
        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{note}</p>
      </div>
    </div>
  );
}

// `href` : Sérum éclat pointe vers /dashboard/produits?q=... (préremplit
// DashboardSearchBar, l'id existe dans ProduitsCatalogue, filtre réel).
// Les 4 autres renvoient vers la liste des commandes sans filtre : les
// identifiants C-4828/C-4829 et la ville Bouaké sont propres à ce panneau,
// absents des données mock de CommandesListe (cf.
// [[dashboard-mock-data-pending-laravel-api]]) — un lien filtré donnerait
// "aucun résultat", donc on renvoie sur la liste plutôt que sur un filtre
// qui mentirait.
function Signal({ tone, title, desc, cta, href }: { tone: "ko" | "warn" | "info"; title: string; desc: string; cta: string; href: string }) {
  const dot = tone === "ko" ? "bg-[#FF5A62] text-white" : tone === "warn" ? "bg-[#FFB020] text-white" : "bg-brand-purple/15 text-brand-purple";
  const border = tone === "ko" ? "border-[#FF5A62]/25" : "border-[var(--dashboard-text)]/10";
  return (
    <div className={`mt-2.5 flex items-center gap-3 rounded-xl border bg-[var(--dashboard-surface-2)] p-3 first:mt-3 ${border}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dot}`}>{tone === "info" ? "i" : "!"}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{title}</p>
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

const STATUS_TONE: Record<string, string> = {
  wait: "bg-[var(--dashboard-text)]/[0.08] text-[var(--dashboard-text)]/60",
  assist: "bg-brand-purple/10 text-brand-purple",
  prep: "bg-[#2563EB1A] text-[#2563EB]",
  liv: "bg-brand-pink/10 text-brand-pink",
  dispute: "bg-[#FFB0201A] text-[#a8690a]",
};

function LiveOrderRow({
  code,
  id,
  label,
  status,
  statusKey,
  since,
  amount,
  dispute = false,
}: {
  code: "S" | "D";
  id: string;
  label: string;
  status: string;
  statusKey: keyof typeof STATUS_TONE;
  since: string;
  amount: string;
  dispute?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${dispute ? "bg-[#FFB0200D]" : ""}`}>
      <Nature code={code} />
      <span className="w-16 shrink-0 text-xs font-semibold">{id}</span>
      <span className="min-w-0 flex-1 truncate text-xs text-[var(--dashboard-text)]/60">{label}</span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${STATUS_TONE[statusKey]}`}>{status}</span>
      <span className="w-16 shrink-0 text-right text-[10px] text-[var(--dashboard-text)]/40">{since}</span>
      <span className="w-20 shrink-0 text-right text-xs font-semibold">{amount}</span>
    </div>
  );
}

export default function CommandesSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  return (
    <>
      <SectionHeader
        eyebrow={t("Commandes", "Orders")}
        title={t("Ce que devient chaque commande", "What happens to each order")}
        subtitle={
          t("fr", "en") !== "en" ? (
            <>
              De la visite de votre page jusqu'à la fin du délai de litige
              <br />
              — et où, méthodiquement, elle se perd.
            </>
          ) : (
            <>
              From the visit to your page through to the end of the dispute window
              <br />
              — and where, methodically, it gets lost.
            </>
          )
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
        <span className="ml-auto">{t("La couleur dit à quelle façon de vendre la commande se rapporte.", "The color shows which way of selling the order relates to.")}</span>
      </div>

      {/* 3 premiers blocs (KPI, parcours de commande, jour par jour + cycle
          du mois) toujours visibles ; le reste passe sous le bouton
          "Voir tout le contenu" de CollapsibleCards — cf. shared.tsx. */}
      <CollapsibleCards visibleCount={3}>
      {/* KPI de la période */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Commandes reçues", "Orders received")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">148</p>
          <p className="mt-1 text-[10px] font-semibold text-[#178a3f]">{t("+22 % vs période précédente", "+22% vs previous period")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Confirmées à l'appel", "Confirmed by phone")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">134</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("90,5 % des reçues", "90.5% of orders received")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Livrées et payées", "Delivered and paid")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#178a3f]">119</p>
          <p className="mt-1 text-[10px] font-semibold text-[#178a3f]">{t("80,4 % des reçues", "80.4% of orders received")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Refusées", "Refused")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#c8262d]">23</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("14 à l'appel · 9 à la porte", "14 by phone · 9 at the door")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("En cours", "In progress")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">6</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("dont 2 en litige", "incl. 2 in dispute")}</p>
        </Card>
      </div>

      {/* Le parcours d'une commande — fond adaptatif au thème comme le
          reste de la carte (var(--dashboard-*)), seules les boîtes de
          l'entonnoir gardent leur couleur pleine fixe. */}
      <Card className="mt-3 overflow-hidden !bg-[var(--dashboard-glass)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Le parcours d'une commande, étape par étape", "The order journey, step by step")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("De la visite de votre page jusqu'à la fin du délai de litige", "From your page visit to the end of the dispute window")}</p>
          </div>
          <Nature code="B" />
        </div>
        <div className="relative mt-6">
          <FunnelTrack />
          <div className="relative grid grid-cols-5 gap-2">
            <FunnelStep step={1} value="8 420" label={t("Visites de la page", "Page visits")} color={FUNNEL_COLORS[0]} />
            <FunnelStep
              step={2}
              value="148"
              label={t("Commandes passées", "Orders placed")}
              rate={t("1,76 % de transformation", "1.76% conversion")}
              rateColor="#EC0C8C"
              color={FUNNEL_COLORS[1]}
            />
            <FunnelStep step={3} value="134" label={t("Confirmées à l'appel", "Confirmed by phone")} rate="90,5 %" rateColor="#178a3f" color={FUNNEL_COLORS[2]} />
            <FunnelStep step={4} value="119" label={t("Livrées et payées", "Delivered and paid")} rate="88,8 %" rateColor="#a8690a" color={FUNNEL_COLORS[3]} />
            <FunnelStep step={5} value="117" label={t("Sans litige", "Without dispute")} rate="98,3 %" rateColor="#178a3f" color={FUNNEL_COLORS[4]} />
          </div>
        </div>
        <Divider />
        <p className="text-xs font-semibold">{t("Où vous perdez le plus", "Where you lose the most")}</p>
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
          {t(
            "Entre la visite et la commande. Sur mille personnes qui ouvrent votre page, dix-huit commandent. Gagner un dixième de point de transformation vaut plus que gagner cinq points de livraison : la première marche coûte de la publicité déjà payée, la seconde coûte des courses déjà faites.",
            "Between the visit and the order. Out of a thousand people who open your page, eighteen order. Gaining a tenth of a point of conversion is worth more than five points of delivery: the first step costs advertising already paid for, the second costs courier runs already made."
          )}
        </p>
      </Card>

      {/* Jour par jour + cycle du mois */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card title={t("Vos commandes, jour par jour", "Your orders, day by day")} titleTab titleAlign="left" className="!bg-[var(--dashboard-surface-2)]">
          <div className="mt-2 flex h-28 items-end gap-1.5">
            {DAILY_ORDERS.map((v, i) => {
              const s = Math.round(v * STOCK_SHARE);
              const d = v - s;
              const max = Math.max(...DAILY_ORDERS);
              return (
                <div key={i} className="flex flex-1 flex-col justify-end" style={{ height: "100%" }}>
                  <div className="flex flex-1 flex-col justify-end" style={{ height: `${(v / max) * 100}%` }}>
                    <span className="rounded-t bg-brand-pink" style={{ height: `${(d / v) * 100}%` }} />
                    <span style={{ height: `${(s / v) * 100}%`, background: STOCK_COLOR }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Divider />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBar value="97" label={t("Stockage · 65,5 %", "Warehousing · 65.5%")} pct={65.5} color="bg-[#5AA9FF]" />
            <StatBar value="51" label={t("Dropshipping · 34,5 %", "Drop-shipping · 34.5%")} pct={34.5} />
            <div>
              <p className="text-lg font-bold tracking-tight">8</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Meilleur jour · samedi 23 août", "Best day · Sat Aug 23")}</p>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">4,9</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Moyenne par jour · 30 jours", "Average per day · 30 days")}</p>
            </div>
          </div>
        </Card>

        <Card title={t("Le cycle du mois", "The monthly cycle")} titleTab titleAlign="left" className="!bg-[var(--dashboard-surface-2)]" badge={<Tag tone="warn">{t("Zone de paie", "Payday window")}</Tag>}>
          <AreaChart values={MONTH_BUCKETS.map((b) => b.pct)} color="#EC0C8C" markers={[0, 8]} />
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            <span>1</span>
            <span>10</span>
            <span>20</span>
            <span>31</span>
          </div>
          <Divider />
          <p className="text-xs font-semibold">{t("41 % de vos commandes tombent entre le 25 et le 5", "41% of your orders fall between the 25th and the 5th")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "C'est la fenêtre des salaires. Concentrer la publicité sur cette fenêtre, et garder du stock pour elle, vaut mieux que lisser la dépense sur trente jours. Un réapprovisionnement livré le 26 arrive trop tard pour la vague.",
              "That's the payday window. Concentrating advertising there, and keeping stock for it, beats spreading spend evenly over thirty days. Restock delivered on the 26th arrives too late for the wave."
            )}
          </p>
        </Card>
      </div>

      {/* Centre d'appel + performance de livraison */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Le travail du centre d'appel", "The call center's work")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("143 commandes appelées, 1,9 tentative en moyenne", "143 orders called, 1.9 attempts on average")}</p>
            </div>
            <Nature code="B" />
          </div>
          <SegmentBar
            segments={[
              { pct: 55, color: "#4FE0AE" },
              { pct: 24, color: "#38BDF8" },
              { pct: 15, color: "#FFB020" },
              { pct: 6, color: "#FF5A62" },
            ]}
          />
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4FE0AE]" />{t("Joint au premier appel", "Reached on the first call")}</span><span className="font-semibold">78 · 55 %</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#38BDF8]" />{t("Joint au deuxième", "Reached on the second")}</span><span className="font-semibold">34 · 24 %</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FFB020]" />{t("Joint au troisième", "Reached on the third")}</span><span className="font-semibold">22 · 15 %</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF5A62]" />{t("Jamais joint", "Never reached")}</span><span className="font-semibold">9 · 6 %</span></div>
          </div>
          <Divider />
          <StatRow label={t("Délai avant le premier appel", "Time to first call")} value="42 min" bold={false} />
          <StatRow label={t("Durée moyenne d'un appel", "Average call length")} value="2 min 40" bold={false} />
          <StatRow label={t("Confirmation au 1er appel", "Confirmation on 1st call")} value={<span className="text-[#178a3f]">94 %</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Un client joint au premier appel confirme à 94 %. Au troisième, il ne confirme plus qu'à 68 % : le temps qui passe abîme l'envie autant que le doute. Chaque tranche de dix minutes gagnée sur le délai d'appel vaut environ un point de confirmation.",
              "A customer reached on the first call confirms at 94%. By the third, only 68%: time erodes desire as much as doubt. Every ten minutes saved on call delay is worth about a point of confirmation."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("La performance de livraison", "Delivery performance")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce qui se passe une fois le colis parti", "What happens once the parcel is out")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <StatBar value="86 %" label={t("Livrées au premier passage", "Delivered on first attempt")} pct={86} color="bg-[#4FE0AE]" />
            <StatBar value="11 %" label={t("Livrées après reprogrammation", "Delivered after rescheduling")} pct={11} color="bg-[#FFB020]" />
            <StatBar value="1,3" label={t("Passages par commande livrée", "Attempts per delivered order")} pct={43} />
            <StatBar value="7 %" label={t("Commandes en express", "Express orders")} pct={7} color="bg-brand-purple" />
          </div>
          <Divider />
          <StatRow label={t("Délai de course, standard", "Delivery time, standard")} value="4 h 12" bold={false} />
          <StatRow label={t("Délai de course, express", "Delivery time, express")} value={<span className="text-[#178a3f]">1 h 48</span>} />
          <StatRow label={t("Taux de livraison en express", "Delivery rate, express")} value={<span className="text-[#178a3f]">93 %</span>} />
          <StatRow label={t("Reprogrammations qui n'aboutissent pas", "Reschedules that don't go through")} value={<span className="text-[#c8262d]">3 sur 16</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "L'express se livre treize points au-dessus du standard. Sur les paniers de plus de 50 000 F, où le refus atteint 42 %, le proposer d'office coûterait 2 000 F et sauverait bien plus.",
              "Express delivers thirteen points above standard. On baskets over 50 000 F, where refusal reaches 42%, offering it by default would cost 2 000 F and save far more."
            )}
          </p>
        </Card>
      </div>

      {/* Le panier et son risque */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Le panier et son risque", "The basket and its risk")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Plus le panier monte, moins il se livre", "The bigger the basket, the less it delivers")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text)]/60">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1" style={{ background: `${ORDERS_COLOR}1a` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ORDERS_COLOR }} />
                {t("Commandes", "Orders")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1" style={{ background: `${DELIVERY_RATE_COLOR}1a` }}>
                <span className="h-[2px] w-3 rounded-full" style={{ background: DELIVERY_RATE_COLOR }} />
                {t("Taux de livraison", "Delivery rate")}
              </span>
            </div>
            <Nature code="B" />
          </div>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <div>
            {/* Combo aire (commandes, échelle propre à la série) + ligne
                pointillée (taux de livraison, échelle 0-100 directe) —
                remplace l'histogramme à colonnes plates par une forme
                continue lissée (smoothPath), plus lisible sur la tendance
                baissière du taux de livraison. */}
            <div className="relative h-32 overflow-hidden rounded-xl" style={{ background: "var(--dashboard-surface-2)" }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                {/* Repères horizontaux discrets — 25/50/75 % de la hauteur. */}
                {[25, 50, 75].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--dashboard-text)" strokeOpacity={0.06} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                ))}
                <defs>
                  <linearGradient id="basket-orders-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ORDERS_COLOR} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={ORDERS_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {(() => {
                  const maxOrders = Math.max(...BASKET_ORDERS);
                  const ordersPts = BASKET_ORDERS.map((count, i) => ({
                    x: (i + 0.5) * (100 / BASKET_ORDERS.length),
                    y: 100 - (count / maxOrders) * 88,
                  }));
                  const ordersLine = smoothPath(ordersPts);
                  const ordersArea = `${ordersLine} L ${ordersPts[ordersPts.length - 1].x},100 L ${ordersPts[0].x},100 Z`;
                  const deliveryPts = BASKET_DELIVERY_RATE.map((v, i) => ({
                    x: (i + 0.5) * (100 / BASKET_DELIVERY_RATE.length),
                    y: 100 - v,
                  }));
                  return (
                    <>
                      <path d={ordersArea} fill="url(#basket-orders-fill)" stroke="none" />
                      <path d={ordersLine} fill="none" stroke={ORDERS_COLOR} strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                      <path
                        d={smoothPath(deliveryPts)}
                        fill="none"
                        stroke={DELIVERY_RATE_COLOR}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </>
                  );
                })()}
              </svg>
              {/* Points en overlay HTML (pas dans le SVG) : le viewBox est étiré en
                  non-uniforme (preserveAspectRatio="none"), un <circle> suivrait cet
                  étirement et deviendrait une ellipse — même souci et même fix que
                  AreaChart, cf. shared.tsx. */}
              {BASKET_ORDERS.map((count, i) => {
                const maxOrders = Math.max(...BASKET_ORDERS);
                return (
                  <span
                    key={i}
                    className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
                    style={{
                      left: `${(i + 0.5) * (100 / BASKET_ORDERS.length)}%`,
                      top: `${100 - (count / maxOrders) * 88}%`,
                      background: ORDERS_COLOR,
                      // @ts-expect-error -- CSS var custom prop pour la couleur du ring Tailwind
                      "--tw-ring-color": "var(--dashboard-glass)",
                    }}
                  />
                );
              })}
              {BASKET_DELIVERY_RATE.map((v, i) => (
                <span
                  key={i}
                  className="pointer-events-none absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${(i + 0.5) * (100 / BASKET_DELIVERY_RATE.length)}%`,
                    top: `${100 - v}%`,
                    background: DELIVERY_RATE_COLOR,
                  }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex gap-2 text-[9px] text-[var(--dashboard-text)]/40">
              {BASKET_LABELS.map((label) => (
                <span key={label} className="flex-1 text-center">{label}</span>
              ))}
            </div>
          </div>
          <div>
            {/* Table maison (pas le composant `Table` partagé) : "Livrées" a
                besoin d'une couleur par palier + la pire tranche d'une teinte
                de fond — le `Table` partagé ne fait que du texte plat, cf.
                shared.tsx. Même seuils/couleurs que le reste du dashboard :
                vert #178a3f (bon), orange #a8690a (moyen), rouge #c8262d (mauvais). */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--dashboard-text)]/10">
                    {[t("Tranche", "Bracket"), t("Cmd", "Orders"), t("Livrées", "Delivered"), t("Marge moyenne", "Average margin")].map((h) => (
                      <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [t("Moins de 10 000 F", "Under 10 000 F"), BASKET_ORDERS[0], BASKET_DELIVERY_RATE[0], "2 180 F"],
                    [t("10 000 à 20 000 F", "10 000 to 20 000 F"), BASKET_ORDERS[1], BASKET_DELIVERY_RATE[1], "4 420 F"],
                    [t("20 000 à 50 000 F", "20 000 to 50 000 F"), BASKET_ORDERS[2], BASKET_DELIVERY_RATE[2], "7 890 F"],
                    [t("Plus de 50 000 F", "Over 50 000 F"), BASKET_ORDERS[3], BASKET_DELIVERY_RATE[3], "13 200 F"],
                  ].map((row, i) => {
                    const [bracket, cmd, delivered, margin] = row as [string, number, number, string];
                    const worst = delivered < 60;
                    const deliveredColor = delivered >= 85 ? "#178a3f" : delivered >= 60 ? "#a8690a" : "#c8262d";
                    return (
                      <tr key={bracket} className={`border-b border-[var(--dashboard-text)]/[0.05] last:border-0 ${worst ? "bg-[#c8262d0d]" : ""}`}>
                        <td className="py-2 pr-3"><span className="font-semibold">{bracket}</span></td>
                        <td className="py-2 pr-3">{cmd}</td>
                        <td className="py-2 pr-3" style={{ color: deliveredColor }}>{delivered} %</td>
                        <td className="py-2 pr-3">{margin}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Divider />
            <div className="flex flex-col gap-2">
              <StatRow label={t("Articles par commande", "Items per order")} value="1,4" bold={false} />
              <StatRow label={t("Commandes à plusieurs articles", "Multi-item orders")} value="27 %" bold={false} />
              <StatRow label={t("Panier moyen d'une commande multiple", "Average basket, multi-item order")} value={<span className="text-[#178a3f]">31 700 F</span>} />
            </div>
          </div>
        </div>
        <Divider />
        <p className="text-xs font-semibold">{t("Le gros panier rapporte plus et arrive moins", "The big basket pays more and arrives less")}</p>
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
          {t(
            "Au-dessus de 50 000 F, une commande sur deux seulement se livre, alors qu'elle porte six fois la marge d'un petit panier. Trois leviers connus : appeler ces commandes en premier, proposer l'express d'office, ou demander un acompte au-delà d'un seuil.",
            "Above 50 000 F, only one order in two gets delivered, yet it carries six times the margin of a small basket. Three known levers: call these orders first, offer express by default, or ask for a deposit past a threshold."
          )}
        </p>
      </Card>

      {/* Où passe le temps + pourquoi les commandes n'aboutissent pas */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Où passe le temps", "Where the time goes")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Durée moyenne de chaque étape, en heures ouvrées", "Average time per step, business hours")}</p>
            </div>
            <Nature code="B" />
          </div>
          <SegmentBar
            segments={[
              { pct: 8, color: "#8A90A6" },
              { pct: 15, color: "#B79BFF" },
              { pct: 25, color: "#5AA9FF" },
              { pct: 52, color: "#FF7CB8" },
            ]}
          />
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#8A90A6]" />{t("Reçue, en attente d'appel", "Received, awaiting call")}</span><span className="font-semibold">42 min</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#B79BFF]" />{t("Appel du centre, jusqu'à confirmation", "Call center, to confirmation")}</span><span className="font-semibold">1 h 12</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#5AA9FF]" />{t("Confirmée, jusqu'au colis prêt", "Confirmed, to parcel ready")}</span><span className="font-semibold">2 h 05</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF7CB8]" />{t("Colis prêt, jusqu'à la livraison", "Parcel ready, to delivery")}</span><span className="font-semibold">4 h 12</span></div>
          </div>
          <Divider />
          <StatRow label={t("Total en heures ouvrées", "Total in business hours")} value="8 h 11" bold={false} />
          <StatRow label={t("Total réel, nuits comprises", "Real total, nights included")} value="26 h" bold={false} />
          <StatRow label={t("Moyenne du réseau", "Network average")} value={<span className="text-[#178a3f]">{t("31 h · vous êtes devant", "31 h · you're ahead")}</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Une commande passée à vingt-deux heures attend le matin : c'est ce décalage qui creuse l'écart entre huit heures de travail et vingt-six heures d'attente pour le client.",
              "An order placed at ten pm waits until morning: that gap is what stretches eight working hours into twenty-six hours of waiting for the customer."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Pourquoi les commandes n'aboutissent pas", "Why orders don't go through")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Motif enregistré par le centre d'appel ou par le livreur", "Reason logged by the call center or the courier")}</p>
            </div>
            <Tag tone="warn">{t("23 refus", "23 refusals")}</Tag>
          </div>
          <div className="mt-3">
            <MotifRow code="B" label={t("Injoignable après trois appels", "Unreachable after three calls")} value={9} pct={100} />
            <MotifRow code="B" label={t("A changé d'avis", "Changed their mind")} value={7} pct={78} />
            <MotifRow code="D" label={t("Produit non conforme à l'attente", "Product not as expected")} value={2} pct={22} />
            <MotifRow code="B" label={t("Adresse introuvable", "Address not found")} value={1} pct={11} />
            <MotifRow code="B" label={t("Doublon ou hors zone", "Duplicate or out of zone")} value={2} pct={22} last />
          </div>
          <Divider />
          <p className="text-xs font-semibold">{t("Le premier motif n'est pas un refus, c'est un silence", "The top reason isn't a refusal, it's silence")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Neuf commandes sur vingt-trois tombent parce que personne ne décroche. Un message avant l'appel, ou un appel à une autre heure, les récupère en partie. Les deux refus pour produit non conforme sont tous en dropshipping : la fiche du partenaire promet autre chose que ce qui arrive.",
              "Nine orders out of twenty-three fall through because no one picks up. A message before the call, or a call at another time, recovers some of them. Both refusals for non-conforming products are drop-shipped: the partner's listing promises something else than what arrives."
            )}
          </p>
        </Card>
      </div>

      {/* Communes + heures de commande */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Où vous livrez, et où ça résiste", "Where you deliver, and where it resists")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Taux de livraison et délai moyen par commune", "Delivery rate and average time by district")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-4 flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
            <span className="w-20 shrink-0">{t("Commune", "District")}</span>
            <span className="flex-1 text-center">{t("Taux de livraison", "Delivery rate")}</span>
            <span className="w-10 shrink-0" />
            <span className="w-14 shrink-0 text-right">{t("Volume", "Volume")}</span>
            <span className="w-16 shrink-0 text-right">{t("Délai", "Time")}</span>
          </div>
          <ZoneRow commune="Cocody" pct={89} volume={t("38 cmd", "38 ord.")} delai="3 h 40" />
          <ZoneRow commune="Marcory" pct={86} volume={t("22 cmd", "22 ord.")} delai="3 h 55" />
          <ZoneRow commune="Treichville" pct={83} volume={t("15 cmd", "15 ord.")} delai="4 h 10" />
          <ZoneRow commune="Yopougon" pct={74} volume={t("31 cmd", "31 ord.")} delai="4 h 45" bad />
          <ZoneRow commune="Abobo" pct={68} volume={t("24 cmd", "24 ord.")} delai="5 h 20" bad />
          <ZoneRow commune="Bouaké" pct={61} volume={t("18 cmd", "18 ord.")} delai="11 h 30" bad />
          <div className="mt-4 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Vingt-huit points d'écart entre Cocody et Bouaké", "Twenty-eight points between Cocody and Bouaké")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Bouaké représente 12 % de vos commandes et 26 % de vos refus. À 61 % de livraison et 11 h 30 de délai, chaque commande y rapporte moins qu'ailleurs une fois les refus payés. Deux réponses possibles : demander un acompte sur cette zone, ou ne plus y pousser de publicité.",
                "Bouaké makes up 12% of your orders and 26% of your refusals. At 61% delivery and an 11h30 lead time, each order there earns less once refusals are paid for. Two options: ask for a deposit in that zone, or stop advertising there."
              )}
            </p>
          </div>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Quand vos clients commandent", "When your customers order")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Densité des commandes par jour et par tranche horaire", "Order density by day and time slot")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-4 space-y-1.5">
            {WEEK_HOURLY.map(({ fr, en, values }) => (
              <div key={fr} className="flex items-center gap-2">
                <span className="w-7 shrink-0 text-[9px] text-[var(--dashboard-text)]/40">{t(fr, en)}</span>
                <div className="grid flex-1 gap-1.5" style={{ gridTemplateColumns: `repeat(${HOUR_SLOTS.length}, minmax(0, 1fr))` }}>
                  {values.map((v, i) => (
                    <span key={i} className="h-5 rounded-md" style={{ background: `rgba(236,12,140,${(0.12 + v * 0.78).toFixed(2)})` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-[var(--dashboard-text)]/40">
            <span className="w-7 shrink-0" />
            <div className="grid flex-1 gap-1.5" style={{ gridTemplateColumns: `repeat(${HOUR_SLOTS.length}, minmax(0, 1fr))` }}>
              {HOUR_SLOTS.map((h) => (
                <span key={h} className="text-center">{h}</span>
              ))}
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">{t("Heure de pointe", "Peak hour")}</p>
              <p className="mt-1 text-base font-bold tracking-tight">{t("20 h – 22 h", "8pm – 10pm")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("31 % des commandes", "31% of orders")}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">{t("Meilleur jour", "Best day")}</p>
              <p className="mt-1 text-base font-bold tracking-tight">{t("Samedi", "Saturday")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("1,4 fois la moyenne", "1.4× the average")}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">{t("Taux de confirmation le soir", "Confirmation rate in the evening")}</p>
              <p className="mt-1 text-base font-bold tracking-tight text-[#a8690a]">82 %</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("contre 94 % le matin", "vs 94% in the morning")}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-[var(--dashboard-surface-2)] p-3">
            <p className="text-xs font-semibold">{t("Vos clients commandent le soir, vos appels partent le matin", "Your customers order at night, your calls go out in the morning")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Trente et un pour cent des commandes tombent entre vingt et vingt-deux heures, et ce sont celles qui se confirment le moins bien : douze points de moins que les commandes du matin. Douze heures séparent la commande de l'appel, et l'envie retombe.",
                "Thirty-one percent of orders land between 8 and 10pm, and those confirm worst: twelve points below morning orders. Twelve hours separate the order from the call, and desire fades."
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Clients qui reviennent + comparaison au réseau */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <RetentionCard />

        <Card className="!bg-[var(--dashboard-glass)] flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Vous, comparée aux autres", "You, compared to others")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Moyenne des boutiques du réseau, même catégorie et même taille", "Average of network shops in your category and size")}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-[9px] uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">
            <span />
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full bg-brand-pink" />
              {t("Vous", "You")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full bg-[#9096AA]" />
              {t("Réseau", "Network")}
            </span>
            <span />
          </div>
          <div className="mt-3 space-y-3">
            <BenchRow label={t("Transformation", "Conversion")} you="1,76 %" network="1,42 %" delta="+24 %" youPct={100} networkPct={78} />
            <BenchRow label={t("Confirmation à l'appel", "Phone confirmation")} you="90,5 %" network="84,0 %" delta="+8 %" youPct={100} networkPct={90} />
            <BenchRow label={t("Livraison", "Delivery")} you="80,4 %" network="72,5 %" delta="+11 %" youPct={100} networkPct={86} />
            <BenchRow label={t("Taux de litige", "Dispute rate")} you="1,7 %" network="3,1 %" delta={t("2× moins", "2× less")} youPct={48} networkPct={40} />
            <BenchRow label={t("Délai de bout en bout", "End-to-end time")} you="26 h" network="31 h" delta="−16 %" youPct={100} networkPct={82} />
          </div>
          <div className="mt-auto">
            <Divider />
            <p className="text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Ces moyennes sont calculées sur les boutiques de votre catégorie et de votre volume, jamais sur une boutique identifiable. Vous êtes devant sur les cinq indicateurs : votre marge de progression est ailleurs, dans la transformation de vos visites.",
                "These averages are computed across shops in your category and volume, never a single identifiable shop. You're ahead on all five metrics: your room for improvement lies elsewhere, in converting your visits."
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Litiges */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Les litiges, et ce qu'ils coûtent", "Disputes, and what they cost")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ouverts pendant le délai de suspension que vous avez fixé", "Opened during the hold period you've set")}</p>
          </div>
          <Tag tone="warn" className="shrink-0">{t("2 en cours · 47 480 F bloqués", "2 in progress · 47 480 F on hold")}</Tag>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><p className="text-lg font-bold tracking-tight">1,7 %</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Taux de litige · 2 sur 119 livrées", "Dispute rate · 2 of 119 delivered")}</p></div>
          <div><p className="text-lg font-bold tracking-tight">14 h</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Délai moyen de résolution", "Average resolution time")}</p></div>
          <div><p className="text-lg font-bold tracking-tight">{t("Remplacement", "Replacement")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Issue la plus fréquente · 83 %", "Most common outcome · 83%")}</p></div>
          <div><p className="text-lg font-bold tracking-tight text-[#c8262d]">3 400 F</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Coût moyen d'un litige", "Average cost of a dispute")}</p></div>
        </div>
        <Divider />
        <DisputeReasonRow code="S" label={t("Produit abîmé à l'arrivée", "Product damaged on arrival")} note={t("14 cas sur 26 depuis le début · emballage ou manutention", "14 of 26 cases so far · packaging or handling")} pct={54} />
        <DisputeReasonRow code="D" label={t("Produit différent de l'annonce", "Product different from the listing")} note={t("7 cas · uniquement sur le catalogue du partenaire", "7 cases · partner catalog only")} pct={27} />
        <DisputeReasonRow code="B" label={t("Article manquant dans le colis", "Missing item in the parcel")} note={t("5 cas · commandes à plusieurs articles", "5 cases · multi-item orders")} pct={19} />
        <Divider />
        <p className="text-xs font-semibold">{t("Deux litiges sur trois viennent du colis, pas du produit", "Two disputes in three come from the parcel, not the product")}</p>
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
          {t(
            "Abîmé à l'arrivée et article manquant représentent soixante-treize pour cent des cas : des questions d'emballage et de préparation, à porter au partenaire agréé. Le tiers restant, produit différent de l'annonce, ne concerne que le dropshipping et se règle en corrigeant les fiches du catalogue.",
            "Damaged on arrival and missing items make up seventy-three percent of cases: packaging and prep issues, on the partner. The remaining third, product different from the listing, only concerns drop-shipping and is fixed by correcting the catalog listings."
          )}
        </p>
      </Card>

      {/* À regarder aujourd'hui + projection 7 jours */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("À regarder aujourd'hui", "To look at today")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce que la plateforme a repéré et que personne n'a encore traité", "What the platform has flagged that no one has handled yet")}</p>
            </div>
            <Tag tone="warn" className="shrink-0">{t("5 signaux", "5 signals")}</Tag>
          </div>
          <div className="mt-3">
            <Signal
              tone="ko"
              title={t("2 commandes bloquées depuis plus de 6 heures", "2 orders stuck for over 6 hours")}
              desc={t("C-4828 et C-4829 attendent une confirmation. Au-delà de six heures, elles ne se confirment plus qu'à 61 %.", "C-4828 and C-4829 are awaiting confirmation. Past six hours, confirmation drops to 61%.")}
              cta={t("Voir", "View")}
              href="/dashboard/commandes?tab=commandes"
            />
            <Signal
              tone="warn"
              title={t("Un même numéro, 4 commandes refusées", "Same number, 4 refused orders")}
              desc={t("Toutes annulées à l'appel en douze jours. À mettre en liste d'attente avant de relancer une course.", "All cancelled by phone within twelve days. Hold before sending another courier.")}
              cta={t("Voir", "View")}
              href="/dashboard/commandes?tab=commandes"
            />
            <Signal
              tone="warn"
              title={t("3 adresses identiques, clients différents", "3 identical addresses, different customers")}
              desc={t("Même repère, trois noms. Souvent un point de retrait informel, parfois autre chose.", "Same landmark, three names. Often an informal pickup point, sometimes something else.")}
              cta={t("Voir", "View")}
              href="/dashboard/commandes?tab=commandes"
            />
            <Signal
              tone="info"
              title={t("Sérum éclat : 8 commandes, 4 jours de stock", "Radiance serum: 8 orders, 4 days of stock")}
              desc={t("Au rythme actuel, rupture le 12 septembre. Le réapprovisionnement met 4 jours.", "At the current pace, stockout on Sept. 12. Restocking takes 4 days.")}
              cta={t("Voir", "View")}
              href={`/dashboard/produits?q=${encodeURIComponent(t("Sérum éclat", "Radiance serum"))}`}
            />
            <Signal
              tone="info"
              title={t("Bouaké : 61 % de livraison sur 18 commandes", "Bouaké: 61% delivery on 18 orders")}
              desc={t("Vingt points sous votre moyenne. Le volume commence à peser sur le résultat.", "Twenty points below your average. Volume is starting to weigh on results.")}
              cta={t("Voir", "View")}
              href="/dashboard/commandes?tab=commandes"
            />
          </div>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Les sept prochains jours", "The next seven days")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Estimation à partir de votre saisonnalité", "Estimate based on your seasonality")}</p>
            </div>
            <Tag tone="blue" className="shrink-0">{t("Projection", "Projection")}</Tag>
          </div>
          <AreaChart values={PROJECTION.map((p) => p.pct)} color="#EC0C8C" markers={[4]} />
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            {PROJECTION.map(({ fr, en }) => (
              <span key={fr}>{t(fr, en)}</span>
            ))}
          </div>
          <Divider />
          <StatRow label={t("Commandes attendues", "Expected orders")} value="52" bold={false} />
          <StatRow label={t("Dont livrées, au taux actuel", "Of which delivered, at current rate")} value="42" bold={false} />
          <StatRow label={t("Chiffre d'affaires attendu", "Expected revenue")} value={<span className="text-[#178a3f]">817 500 F</span>} />
          <StatRow label={t("Références en rupture avant dimanche", "References out of stock before Sunday")} value={<span className="text-[#a8690a]">2</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Le pic de samedi tombe pendant la fenêtre des salaires. Deux références manqueront avant : les commander aujourd'hui les fait arriver à temps.",
              "Saturday's peak falls during the payday window. Two references will run out before then: ordering them today gets them there in time."
            )}
          </p>
        </Card>
      </div>

      {/* Clients + commandes en cours */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Vos clients", "Your customers")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Nouveaux, revenants, et ce qu'ils valent", "New, returning, and what they're worth")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
              style={{ background: "conic-gradient(#4FE0AE 0% 18.2%, var(--dashboard-surface-2) 18.2% 100%)" }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dashboard-card-bg)] text-center">
                <div>
                  <p className="text-sm font-bold leading-none">18,2 %</p>
                  <p className="mt-0.5 text-[8px] text-[var(--dashboard-text)]/40">{t("reviennent", "return")}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <StatRow label={t("Clients servis", "Customers served")} value="121" bold={false} />
              <StatRow label={t("Dont déjà venus", "Of which returning")} value={<span className="text-[#178a3f]">22</span>} />
            </div>
          </div>
          <Divider />
          <StatRow label={t("Panier d'un nouveau client", "New customer basket")} value="18 400 F" bold={false} />
          <StatRow label={t("Panier d'un client qui revient", "Returning customer basket")} value={<span className="text-[#178a3f]">24 300 F</span>} />
          <StatRow label={t("Taux de livraison d'un revenant", "Returning customer delivery rate")} value={<span className="text-[#178a3f]">96 %</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Il commande un tiers plus cher, se livre à quatre-vingt-seize pour cent au lieu de quatre-vingts, et ne coûte aucune publicité. Chaque point gagné sur ce taux rapporte davantage qu'un point de transformation.",
              "They order a third more, deliver at ninety-six percent instead of eighty, and cost no advertising. Every point gained on this rate is worth more than a point of conversion."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce qui bouge en ce moment", "What's moving right now")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Les six commandes encore en route", "The six orders still on their way")}</p>
            </div>
            <Link
              href="/dashboard/commandes"
              className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3.5 py-2 text-[10px] font-semibold transition hover:border-[var(--dashboard-text)]/30 hover:bg-[var(--dashboard-text)]/5"
            >
              {t("Ouvrir les commandes", "Open orders")}
            </Link>
          </div>
          <div className="mt-3 divide-y divide-[var(--dashboard-text)]/[0.05]">
            <LiveOrderRow code="S" id="C-4831" label={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} status={t("Livraison", "Delivery")} statusKey="liv" since={t("2 h 10", "2h10")} amount="21 500 F" />
            <LiveOrderRow code="S" id="C-4830" label={t("Beurre de karité 200 g ×2", "Shea butter 200 g ×2")} status={t("Préparation", "Prep")} statusKey="prep" since={t("48 min", "48 min")} amount="17 800 F" />
            <LiveOrderRow code="D" id="C-4829" label={t("Sac cabas en raphia", "Raffia tote bag")} status={t("Assistance", "Support")} statusKey="assist" since="1 h 05" amount="19 900 F" />
            <LiveOrderRow code="D" id="C-4828" label={t("Huile de ricin 100 ml", "Castor oil 100 ml")} status={t("En attente d'appel", "Awaiting call")} statusKey="wait" since={t("22 min", "22 min")} amount="12 400 F" />
            <LiveOrderRow code="S" id="C-4819" label={t("Sac cabas en raphia", "Raffia tote bag")} status={t("Litige ouvert", "Dispute open")} statusKey="dispute" since="12 h" amount="19 140 F" dispute />
            <LiveOrderRow code="D" id="C-4816" label={t("Sandales tressées ×2", "Braided sandals ×2")} status={t("Litige ouvert", "Dispute open")} statusKey="dispute" since={t("1 j", "1 day")} amount="28 340 F" dispute />
          </div>
        </Card>
      </div>
      </CollapsibleCards>
    </>
  );
}
