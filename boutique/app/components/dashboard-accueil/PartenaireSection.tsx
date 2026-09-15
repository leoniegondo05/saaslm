"use client";

import { useId, useRef, useState } from "react";
import {
  AreaChart,
  Bar,
  Card,
  CollapsibleCards,
  Divider,
  HeaderActionBtn,
  Nature,
  openBrandedReport,
  periodSeed,
  scaleForPeriod,
  SectionHeader,
  StatRow,
  Tag,
} from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Partenaire" de l'onglet Accueil — remplace l'ancienne section
  "Alertes" (AlertesSection.tsx, supprimée). Contenu repris du dossier de
  maquettes fourni ("Écran 7 · Accueil · Partenaire agréé") : mêmes
  libellés et mêmes chiffres, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]], ces chiffres sont statiques
  en attendant l'API Laravel.

  Treize ensembles, trente-huit variables : la fiche du partenaire et sa
  grille tarifaire, ses six engagements contractuels confrontés au
  réalisé, comment ses trente-quatre boutiques le notent chaque mois et où
  se situe cette boutique, le coût réel de la relation manquements
  compris, ses trois sites comparés, sa progression depuis la signature,
  les échanges en attente, les échéances du contrat, et ce qu'il faut lui
  porter, dans l'ordre.

  Comme pour CommandesSection/ClientsSection/StockSection/ProduitsSection/
  LitigesSection, pas de bloc "assistance IA" local : les questions que
  "solution LM" sait répondre depuis cet écran vivent dans
  dashboard-accueil/assistanceQuestions.ts (clé "Partenaire") — retiré d'ici
  le bloc dupliqué qui les listait en dur en pied de section.
*/

const STOCKAGE_COLOR = "#5AA9FF"; // stockage = bleu, cf. [[dashboard-chart-colors-stockage-drop]]
const DROP_COLOR = "#EC0C8C"; // dropshipping = rose

// Couleurs propres à "Ses trois sites" (délai / casse) — série distincte de
// stockage/dropshipping, donc palette locale plutôt que STOCKAGE_COLOR/DROP_COLOR.
const DELAY_COLOR = "#4EA8DE";
const CASSE_COLOR = "#D96B6E";

/* Anneau de six axes (radar) — comparaison "vous" / "ses autres boutiques"
   sur les six critères de l'évaluation mensuelle. Même logique de
   polygone que le document envoyé, réécrite en SVG généré. */
function RadarChart({
  axes,
  you,
  network,
  max = 10,
}: {
  axes: string[];
  you: number[];
  network: number[];
  max?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 88;
  const n = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, v: number) => {
    const rr = (v / max) * r;
    return { x: cx + rr * Math.cos(angle(i)), y: cy + rr * Math.sin(angle(i)) };
  };
  const toPath = (vals: number[]) =>
    vals
      .map((v, i) => {
        const p = point(i, v);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");
  const rings = [0.33, 0.66, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-full w-full max-w-[240px] overflow-visible">
      {rings.map((lvl) => (
        <polygon
          key={lvl}
          points={Array.from({ length: n }, (_, i) => {
            const p = point(i, max * lvl);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(" ")}
          fill="none"
          stroke="var(--dashboard-text)"
          strokeOpacity={lvl === 1 ? 0.16 : 0.07}
        />
      ))}
      {axes.map((_, i) => {
        const p = point(i, max);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--dashboard-text)" strokeOpacity={0.07} />;
      })}
      <polygon points={toPath(network)} fill="var(--dashboard-text)" fillOpacity={0.07} stroke="var(--dashboard-text)" strokeOpacity={0.32} strokeWidth={1.4} strokeDasharray="4 3" />
      <polygon points={toPath(you)} fill={`url(#partenaire-radar-${uid})`} stroke="#38BDF8" strokeWidth={2} />
      <defs>
        <radialGradient id={`partenaire-radar-${uid}`}>
          <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.32} />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.08} />
        </radialGradient>
      </defs>
      {you.map((v, i) => {
        const p = point(i, v);
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#38BDF8" stroke="var(--dashboard-card-bg)" strokeWidth={1.5} />;
      })}
      {axes.map((label, i) => {
        const p = point(i, max * 1.22);
        return (
          <text
            key={label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--dashboard-text)]/45 text-[7.5px] font-medium"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* Anneau simple (camembert en donut) pour "Ce que la relation vous coûte
   réellement" — conic-gradient CSS plutôt que du SVG : les segments sont
   de simples pourcentages cumulés, pas besoin de calculer des arcs. Le trou
   central reprend var(--dashboard-glass), le même fond que la Card, pour
   qu'il se fonde dedans au lieu de trancher un disque plein. */
function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; pct: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  let acc = 0;
  const stops = segments
    .map((s) => {
      const start = acc;
      acc += s.pct;
      return `${s.color} ${start}% ${acc}%`;
    })
    .join(", ");
  return (
    <div className="relative mx-auto h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
      <div
        className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full text-center"
        style={{ background: "var(--dashboard-glass)" }}
      >
        <p className="text-base font-bold leading-tight">{centerValue}</p>
        <p className="text-[8px] leading-tight text-[var(--dashboard-text)]/45">{centerLabel}</p>
      </div>
    </div>
  );
}

function EngagementRow({
  title,
  detail,
  realized,
  target,
  pct,
  ok,
}: {
  title: string;
  detail: string;
  realized: string;
  target: string;
  pct: number;
  ok: boolean;
}) {
  return (
    <div
      className={`mt-3 first:mt-0 rounded-2xl ${ok ? "" : "border p-3"}`}
      style={
        ok
          ? undefined
          : {
              background: "linear-gradient(135deg, rgba(200,38,45,.12), rgba(236,12,140,.06))",
              borderColor: "rgba(255,122,128,.35)",
            }
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-start gap-2 min-w-0">
          <span
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              background: ok ? "rgba(79,224,174,.16)" : "rgba(255,122,128,.18)",
              color: ok ? "#178a3f" : "#c8262d",
            }}
          >
            {ok ? "✓" : "✕"}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold">{title}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{detail}</p>
          </div>
        </div>
        <div className="mr-3 w-24 shrink-0 sm:mr-6 sm:w-32">
          <Bar pct={Math.min(pct, 100)} background={ok ? "#4FE0AE" : "#FF7A80"} />
        </div>
        <span className={`w-16 shrink-0 text-right text-[11px] font-semibold ${ok ? "text-[#178a3f]" : "text-[#c8262d]"}`}>
          {realized} / {target}
        </span>
      </div>
    </div>
  );
}

/* Paire de carrés (délai / casse) par site, taille proportionnelle à la
   valeur dans sa propre série — même logique que la capture : Bouaké,
   pire sur les deux métriques, ressort visuellement le plus grand. */
function siteBoxSize(value: number, max: number) {
  const MIN = 44;
  const MAX = 132;
  return Math.round(MIN + (value / max) * (MAX - MIN));
}

function SiteBars({
  sites,
}: {
  sites: { name: string; delayH: number; cassePct: number }[];
}) {
  const maxDelay = Math.max(...sites.map((s) => s.delayH));
  const maxCasse = Math.max(...sites.map((s) => s.cassePct));
  return (
    <div className="flex items-end justify-between gap-4 px-1 sm:px-4">
      {sites.map((s) => {
        const delaySize = siteBoxSize(s.delayH, maxDelay);
        const casseSize = siteBoxSize(s.cassePct, maxCasse);
        return (
          <div key={s.name} className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-2">
              <div
                className="rounded-xl"
                style={{ width: delaySize, height: delaySize, background: DELAY_COLOR }}
              />
              <div
                className="rounded-xl"
                style={{ width: casseSize, height: casseSize, background: CASSE_COLOR }}
              />
            </div>
            <p className="text-[10px] font-semibold text-[var(--dashboard-text)]/50">{s.name}</p>
          </div>
        );
      })}
    </div>
  );
}

function SiteCard({
  name,
  delay,
  casse,
  detail,
  tone,
}: {
  name: string;
  delay: string;
  casse: string;
  detail: string;
  tone: "ok" | "neutral" | "bad";
}) {
  const bg = tone === "ok" ? "rgba(79,224,174,.08)" : tone === "bad" ? "rgba(255,122,128,.08)" : "var(--dashboard-surface-2)";
  const border = tone === "ok" ? "rgba(79,224,174,.3)" : tone === "bad" ? "rgba(255,122,128,.32)" : "transparent";
  return (
    <div className="rounded-2xl border p-3" style={{ background: bg, borderColor: border }}>
      <p className="text-xs font-semibold">{name}</p>
      <p className="mt-1 text-lg font-bold tracking-tight">{delay}</p>
      <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{casse}</p>
      <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{detail}</p>
    </div>
  );
}

function TimelineItem({
  date,
  title,
  detail,
  tag,
  tone,
  last = false,
}: {
  date: string;
  title: string;
  detail: string;
  tag?: string;
  tone: "ok" | "key" | "end";
  last?: boolean;
}) {
  const dotColor = tone === "key" ? "#4FE0AE" : tone === "ok" ? "#4FE0AE" : "var(--dashboard-text)";
  return (
    <div className="grid grid-cols-[64px_16px_1fr] gap-0">
      <div className="pr-2 pt-0.5 text-right text-[10px] font-semibold text-[var(--dashboard-text)]/60">{date}</div>
      <div className="relative flex justify-center">
        {!last && <div className="absolute top-3 bottom-[-14px] w-px" style={{ background: "var(--dashboard-text)", opacity: 0.12 }} />}
        <span
          className="relative z-10 mt-0.5 h-3 w-3 rounded-full border-2"
          style={{ borderColor: dotColor, background: "var(--dashboard-card-bg)" }}
        />
      </div>
      <div className="pb-4 pl-3">
        <p className={`text-xs font-semibold ${tone === "key" ? "text-[#178a3f]" : ""}`}>{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">{detail}</p>
        {tag && (
          <span className="mt-1.5 inline-flex rounded-full bg-[var(--dashboard-text)]/[0.06] px-2 py-0.5 text-[9px] font-semibold text-[var(--dashboard-text)]/60">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionItem({
  n,
  title,
  detail,
  tone,
}: {
  n: number;
  title: string;
  detail: string;
  tone: "ko" | "warn" | "blue";
}) {
  const dot =
    tone === "ko"
      ? { bg: "rgba(255,122,128,.16)", color: "#c8262d" }
      : tone === "warn"
      ? { bg: "rgba(255,184,77,.18)", color: "#a8690a" }
      : { bg: "rgba(90,169,255,.16)", color: "#0C86BE" };
  return (
    <div className="flex items-start gap-3 rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ background: dot.bg, color: dot.color }}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">{detail}</p>
      </div>
    </div>
  );
}

type EchangeItem = {
  id: string;
  wait: string;
  title: string;
  nature: "B" | "S" | "D";
  detail: string;
  tone: "bad" | "warn" | "neutral";
};

// Une note à un décimal, virgule française — "8,0" et pas juste "8" : c'est
// la convention déjà utilisée par les libellés du radar de comparaison.
function formatDecimal(n: number) {
  return (Math.round(n * 10) / 10).toFixed(1).replace(".", ",");
}

// Note globale ("Votre note", "Votre dernière évaluation") : pas de
// décimale inutile quand la moyenne tombe rond (9 plutôt que 9,0), comme
// dans la maquette d'origine.
function formatNote(n: number) {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(".", ",");
}

/* Petite modale locale — même recette que AssistanceLMModal (fond assombri,
   panneau qui stoppe la propagation du clic, croix de fermeture) mais sans
   le fil de conversation : ici juste un titre et le contenu du formulaire.
   Sert à "Écrire" et "Évaluer ce mois", les deux seules actions du header
   qui ont besoin de collecter une saisie avant d'agir. */
function PartenaireModal({
  title,
  subtitle,
  closeLabel = "Fermer",
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  closeLabel?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-16 sm:pt-24" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 text-[var(--dashboard-text)] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight sm:text-base">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 rounded-full p-1.5 text-[var(--dashboard-text)]/40 transition hover:bg-[var(--dashboard-text)]/[0.06] hover:text-[var(--dashboard-text)]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />
        {children}
      </div>
    </div>
  );
}

export default function PartenaireSection({ first = true, activeDate }: { first?: boolean; activeDate?: Date }) {
  const { t } = useDashboardLangue();

  // Graine déterministe issue de la période sélectionnée dans le header
  // (année/mois/jour) : fait varier les chiffres mock ci-dessous plutôt que
  // de les laisser figés quel que soit le picker (cf.
  // [[dashboard-mock-data-pending-laravel-api]]). 1er août 2026 reprend la
  // date par défaut déjà utilisée ailleurs dans le dashboard, donc aucun
  // changement de comportement tant qu'aucune période n'est sélectionnée.
  const seed = periodSeed(activeDate ?? new Date(2026, 7, 1));

  // Regroupement des milliers façon "178 500" (espace simple), même style
  // que les montants déjà écrits en dur dans cette section.
  function groupFr(n: number) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  // "Xh YY" à partir d'un nombre d'heures décimal (ex. 3,667 → "3 h 40").
  function formatHM(hours: number) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} h ${String(m).padStart(2, "0")}`;
  }
  // Un même facteur pour toute une série (historique/courbe) plutôt qu'un
  // bruit indépendant point par point, pour ne pas casser une progression.
  function scaleSeries(values: number[], key: number, variance = 0.12) {
    return values.map((v) => scaleForPeriod(v * 10, seed, key, variance) / 10);
  }

  // ── Chiffres racine qui varient avec la période sélectionnée. Le reste de
  // la section (totaux, pourcentages, textes) en découle par l'arithmétique
  // déjà en place plutôt que d'être re-scalé indépendamment (cf. consigne
  // "ne pas doubler le scaling").
  const noteEntreprise = scaleForPeriod(84, seed, 0, 0.05) / 10;
  const boutiquesAffiliees = scaleForPeriod(34, seed, 1, 0.15);
  const boutiquesZone = Math.min(boutiquesAffiliees, scaleForPeriod(11, seed, 2, 0.2));
  const boutiquesRepondu = Math.min(boutiquesAffiliees, scaleForPeriod(29, seed, 36, 0.15));

  // Grille tarifaire : les tarifs (rate) restent ceux fixés par le
  // partenaire (contractuels, cf. commentaire plus bas) ; seules les
  // quantités varient avec le volume du mois, et les montants/le total en
  // découlent par simple multiplication.
  const rate1 = 1500;
  const rate2 = 500;
  const rate3 = 2000;
  const rate4 = 1000;
  const rate5 = 25000;
  const qty1 = scaleForPeriod(119, seed, 8, 0.25); // colis livrés (frais logistiques)
  const qty2 = scaleForPeriod(248, seed, 9, 0.2) / 10; // garantie contre la perte
  const qty3 = scaleForPeriod(8, seed, 10, 0.3); // livraison express
  const qty4 = scaleForPeriod(9, seed, 11, 0.3); // récupération colis refusé
  const amount1 = rate1 * qty1;
  const amount2 = Math.round(rate2 * qty2);
  const amount3 = rate3 * qty3;
  const amount4 = rate4 * qty4;
  const amount5 = rate5; // abonnement mensuel, 1 mois
  const totalGrille = amount1 + amount2 + amount3 + amount4 + amount5;
  const coutParCommande = Math.round(totalGrille / qty1);
  const partCA = scaleForPeriod(104, seed, 12, 0.1) / 10;

  // Coût réel : manquements (litiges + casse à sa charge) ajoutés au
  // versé ci-dessus.
  const litigesCost = scaleForPeriod(11300, seed, 19, 0.25);
  const casseCost = scaleForPeriod(18400, seed, 20, 0.25);
  const manquements = litigesCost + casseCost;
  const coutReel = totalGrille + manquements;
  const coutParCommandeReel = Math.round(coutReel / qty1);

  // Six engagements : la cible (target) est contractuelle, donc fixe ; seul
  // le réalisé varie avec la période. "ok" reste tel quel (narratif figé,
  // cf. bloc "Quatre sur six" plus bas).
  const realizedH1 = scaleForPeriod(18, seed, 13, 0.25);
  const pct1 = Math.min(Math.round((realizedH1 / 24) * 100), 100);
  const realizedH2 = scaleForPeriod(26, seed, 14, 0.2);
  const pct2 = Math.min(Math.round((realizedH2 / 48) * 100), 100);
  const realizedMin3 = scaleForPeriod(160, seed, 15, 0.2);
  const realizedH3 = Math.floor(realizedMin3 / 60);
  const realizedM3 = realizedMin3 % 60;
  const pct3 = Math.min(Math.round((realizedMin3 / 60 / 9) * 100), 100);
  const realizedPct4 = scaleForPeriod(860, seed, 16, 0.05) / 10;
  const pct4 = Math.min(Math.round((realizedPct4 / 85) * 100), 100);
  const realizedCasse5 = scaleForPeriod(16, seed, 17, 0.08) / 10;
  const pct5 = Math.min(Math.round((realizedCasse5 / 1) * 100), 100);
  const realizedReponse6 = scaleForPeriod(14, seed, 18, 0.08);
  const pct6 = Math.min(Math.round((realizedReponse6 / 9) * 100), 100);

  const demandesTotal = scaleForPeriod(31, seed, 21, 0.2);
  const demandesTraitees = Math.min(demandesTotal, scaleForPeriod(24, seed, 22, 0.2));
  const demandesTraiteesPct = Math.round((demandesTraitees / demandesTotal) * 100);
  const demandesSansReponse = scaleForPeriod(4, seed, 23, 0.3);

  // Ses trois sites : unités/commandes servies, puis délai (h) et casse (%)
  // utilisés à la fois par SiteBars (tailles) et par les SiteCard sous les
  // carrés.
  const siteCocodyUnits = scaleForPeriod(104, seed, 24, 0.2);
  const siteCocodyOrders = scaleForPeriod(71, seed, 25, 0.2);
  const siteYopougonUnits = scaleForPeriod(49, seed, 26, 0.2);
  const siteYopougonOrders = scaleForPeriod(34, seed, 27, 0.2);
  const siteBouakeUnits = scaleForPeriod(15, seed, 28, 0.2);
  const siteBouakeOrders = scaleForPeriod(18, seed, 29, 0.2);
  const siteCocodyDelay = scaleForPeriod((3 + 40 / 60) * 10, seed, 30, 0.15) / 10;
  const siteCocodyCasse = scaleForPeriod(8, seed, 31, 0.15) / 10;
  const siteYopougonDelay = scaleForPeriod((4 + 45 / 60) * 10, seed, 32, 0.15) / 10;
  const siteYopougonCasse = scaleForPeriod(14, seed, 33, 0.15) / 10;
  const siteBouakeDelay = scaleForPeriod((11 + 30 / 60) * 10, seed, 34, 0.15) / 10;
  const siteBouakeCasse = scaleForPeriod(32, seed, 35, 0.15) / 10;

  // Titres des échanges déjà relancés (bouton "Relancer" cliqué). Pas
  // d'écriture serveur tant que l'API Laravel n'existe pas
  // (cf. [[dashboard-mock-data-pending-laravel-api]]) : on retient l'état
  // localement pour que le bouton réagisse quand même au clic.
  const [echangesRelances, setEchangesRelances] = useState<string[]>([]);

  // État du bouton "Composer le relevé" : pas d'envoi serveur tant que
  // l'API Laravel n'existe pas (cf. [[dashboard-mock-data-pending-laravel-api]]),
  // donc le clic compose le relevé (points 1 à 4, ceux à porter au
  // partenaire — le point 5 est pour l'évaluation mensuelle, pas ce canal)
  // et le copie dans le presse-papiers.
  const [releveCopie, setReleveCopie] = useState(false);

  // Les 4 points chiffrés/datés à porter au partenaire (bloc "À porter à
  // votre partenaire"). Source commune à l'affichage (ActionItem) et au
  // texte copié par "Composer le relevé".
  const pointsPourPartenaire: { tone: "ko" | "warn" | "blue"; title: string; detail: string }[] = [
    {
      tone: "ko",
      title: t("Le dépôt direct à Bouaké", "Direct deposit at Bouaké"),
      detail: t(
        "Une demande, trois effets : le délai passerait de 11 h 30 à environ 5 h, la casse de 3,2 % à moins de 1,5 %, et le taux de livraison de la zone remonterait. Demande envoyée le 6 septembre, toujours sans réponse.",
        "One request, three effects: delay would drop from 11 h 30 to about 5 h, breakage from 3.2% to under 1.5%, and the area's delivery rate would climb. Request sent September 6, still no reply."
      ),
    },
    {
      tone: "ko",
      title: t("L'emballage, engagement non tenu", "Packaging, a commitment not kept"),
      detail: t(
        "1,6 % de casse pour 1 % engagé, et sept litiges pour emballage insuffisant. L'emballage est compris dans les frais logistiques qu'elle a elle-même fixés : une prestation payée n'a pas été rendue. 18 400 F sur la période.",
        "1.6% breakage against 1% committed, and seven disputes over inadequate packaging. Packaging is included in the logistics fee the partner itself set: a paid-for service was not delivered. 18,400 F over the period."
      ),
    },
    {
      tone: "warn",
      title: t("La fiche du sac cabas", "The tote bag listing"),
      detail: t(
        "Quatre litiges sur vingt-quatre ventes, tous pour une couleur qui ne correspond pas. La fiche est dans son catalogue : elle seule peut la corriger. Demande en attente depuis un jour.",
        "Four disputes out of twenty-four sales, all over a mismatched color. The listing is in its catalog: only the partner can fix it. Request pending for a day."
      ),
    },
    {
      tone: "warn",
      title: t("Le délai de réponse", "The response delay"),
      detail: t(
        "14 h contre 9 h engagées, et quatre demandes sans réponse au-delà de deux jours. Cela ne coûte rien directement, mais bloque les trois points ci-dessus.",
        "14 h against 9 h committed, and four requests unanswered past two days. It costs nothing directly, but blocks the three points above."
      ),
    },
  ];

  // Historique du taux de livraison depuis la signature (avril → septembre).
  const performanceHistory = scaleSeries([71, 74, 76.5, 78.3, 79.1, 80.4], 3, 0.12);
  const collectiveRatings = scaleSeries([6.9, 7.2, 7.5, 7.8, 8.1, 8.4], 4, 0.08);
  const perfStart = performanceHistory[0];
  const perfToday = performanceHistory[performanceHistory.length - 1];
  const perfProgress = Math.round((perfToday - perfStart) * 10) / 10;
  const perfLast3 = Math.round((perfToday - performanceHistory[3]) * 10) / 10;

  // ── "Voir le contrat" : scroll vers la card "Le contrat et ses échéances",
  // déjà présente plus bas dans cette même section. Pas besoin de modale,
  // l'info existe déjà à l'écran.
  const contratRef = useRef<HTMLDivElement>(null);

  // ── "Évaluer ce mois" : les six critères notés par vous, modifiables via
  // la modale. "networkRatings" (ses autres boutiques) ne bouge pas ici —
  // seule votre propre boutique note depuis cet écran.
  const radarAxesCourts = [t("Délai", "Delay"), t("Fiabilité", "Reliability"), t("Qualité colis", "Parcel quality"), t("Litiges", "Disputes"), t("Réactivité", "Responsiveness"), t("Qualité-prix", "Value")];
  const radarAxesLongs = [
    t("Délai de livraison", "Delivery delay"),
    t("Fiabilité des livraisons", "Delivery reliability"),
    t("Qualité du colis", "Parcel quality"),
    t("Traitement des litiges", "Dispute handling"),
    t("Réactivité", "Responsiveness"),
    t("Rapport qualité-prix", "Value for money"),
  ];
  const networkRatings = scaleSeries([8.2, 8.4, 7.6, 8.8, 7.4, 8.0], 5, 0.08);
  const [radarYou, setRadarYou] = useState(() => scaleSeries([8.8, 8.0, 6.2, 9.4, 5.5, 8.2], 6, 0.1));
  const yourRatingsInit = scaleSeries([7, 7.6, 8.1, 8.6, 8.9, 9], 7, 0.1);
  const [votreNote, setVotreNote] = useState(yourRatingsInit[yourRatingsInit.length - 1]);
  const [yourRatings, setYourRatings] = useState(yourRatingsInit);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalDraft, setEvalDraft] = useState(radarYou);
  const radarRows = radarAxesLongs.map((label, i) => ({
    label,
    you: radarYou[i],
    net: networkRatings[i],
    bad: radarYou[i] < networkRatings[i],
  }));

  // ── "Écrire" : la modale prépend le message envoyé à "Vos échanges en
  // cours" (les trois demandes historiques restent traduites en direct par
  // t(), donc hors état ; seuls les messages ajoutés ici, déjà figés au
  // moment de l'envoi, vivent dans un state).
  const defaultEchanges: EchangeItem[] = [
    { id: "bouake-depot", wait: t("2 j", "2 d"), title: t("Demande de dépôt direct à Bouaké", "Request for direct deposit at Bouaké"), nature: "S" as const, detail: t("Envoyée le 6 septembre. Sans réponse. C'est la demande qui règlerait à la fois le délai, la casse et le taux de refus de cette zone.", "Sent September 6. No reply. This request would fix the delay, the breakage and the refusal rate in this area, all at once."), tone: "bad" as const },
    { id: "fiche-sac", wait: t("1 j", "1 d"), title: t("Correction de la fiche « Sac cabas en raphia »", "Fix to the “Raffia tote bag” listing"), nature: "D" as const, detail: t("La couleur annoncée ne correspond pas. Quatre litiges déjà. Fiche de son catalogue, donc elle seule peut la modifier.", "The listed color doesn't match. Four disputes already. It's from its catalog, so only the partner can edit it."), tone: "warn" as const },
    { id: "litige-4816", wait: t("6 h", "6 h"), title: t("Litige C-4816, avis sur la conformité", "Dispute C-4816, conformity opinion needed"), nature: "D" as const, detail: t("Elle doit dire si le produit expédié correspond à sa fiche. Le client attend depuis un jour.", "It must say whether the shipped product matches its listing. The customer has been waiting a day."), tone: "neutral" as const },
  ];
  const [extraEchanges, setExtraEchanges] = useState<EchangeItem[]>([]);
  const echanges = [...extraEchanges, ...defaultEchanges];
  const [showEcrireModal, setShowEcrireModal] = useState(false);
  const [ecrireText, setEcrireText] = useState("");

  // ── "Exporter" : CSV de la grille tarifaire, des six engagements et de la
  // répartition du coût réel — les trois tableaux chiffrés de cette section.
  const exportRateCard = [
    { name: t("Frais logistiques par colis livré", "Logistics fee per delivered parcel"), rate: `${groupFr(rate1)} F`, qty: t(`${qty1} colis`, `${qty1} parcels`), amount: `${groupFr(amount1)} F` },
    { name: t("Garantie contre la perte", "Loss guarantee"), rate: `${groupFr(rate2)} F`, qty: formatDecimal(qty2), amount: `${groupFr(amount2)} F` },
    { name: t("Livraison express", "Express delivery"), rate: `${groupFr(rate3)} F`, qty: t(`${qty3} colis`, `${qty3} parcels`), amount: `${groupFr(amount3)} F` },
    { name: t("Récupération d'un colis refusé", "Retrieving a refused parcel"), rate: `${groupFr(rate4)} F`, qty: t(`${qty4} colis`, `${qty4} parcels`), amount: `${groupFr(amount4)} F` },
    { name: t("Abonnement mensuel", "Monthly subscription"), rate: `${groupFr(rate5)} F`, qty: t("1 mois", "1 month"), amount: `${groupFr(amount5)} F` },
  ];
  const exportEngagements = [
    { title: t("Enlèvement sous 24 h après confirmation", "Pickup within 24 h of confirmation"), realized: `${realizedH1} h`, target: t("24 h", "24 h"), ok: true },
    { title: t("Livraison sous 48 h après enlèvement", "Delivery within 48 h of pickup"), realized: `${realizedH2} h`, target: t("48 h", "48 h"), ok: true },
    { title: t("Prise en main d'un litige sous 9 h", "Taking a dispute in hand within 9 h"), realized: `${realizedH3} h ${String(realizedM3).padStart(2, "0")}`, target: t("9 h", "9 h"), ok: true },
    { title: t("Au moins 85 % de livraison au premier passage", "At least 85% delivered on first attempt"), realized: `${formatDecimal(realizedPct4)} %`, target: "85 %", ok: true },
    { title: t("Pas plus de 1 % de casse sur votre stock", "No more than 1% breakage on your stock"), realized: `${formatDecimal(realizedCasse5)} %`, target: "1 %", ok: false },
    { title: t("Réponse à vos messages sous 9 h", "Reply to your messages within 9 h"), realized: `${realizedReponse6} h`, target: t("9 h", "9 h"), ok: false },
  ];
  const [exportDone, setExportDone] = useState(false);

  function handleExport() {
    openBrandedReport(t("Partenaire agréé", "Approved partner"), "Groupe Logistique Ivoire", [
      {
        heading: t("Grille tarifaire", "Rate card"),
        columns: [t("Désignation", "Item"), t("Tarif", "Rate"), t("Quantité", "Qty"), t("Montant", "Amount")],
        rows: [
          ...exportRateCard.map((r) => [r.name, r.rate, r.qty, r.amount]),
          [t("Total sur la période", "Total for the period"), "", "", `${groupFr(totalGrille)} F`],
        ],
      },
      {
        heading: t("Ses six engagements", "Its six commitments"),
        columns: [t("Engagement", "Commitment"), t("Réalisé", "Achieved"), t("Cible", "Target"), t("Tenu", "Kept")],
        rows: exportEngagements.map((e) => [e.title, e.realized, e.target, e.ok ? t("Oui", "Yes") : t("Non", "No")]),
      },
      {
        heading: t("Répartition du coût réel", "Real cost breakdown"),
        columns: [t("Poste", "Item"), "%"],
        rows: costBreakdown.map((c) => [c.label, c.pct]),
      },
    ]);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  // Répartition du total versé (totalGrille) — mêmes libellés/couleurs que
  // la légende de l'anneau, réutilisés pour le donut et la liste en
  // dessous. Pourcentages dérivés des montants ci-dessus plutôt que
  // re-scalés indépendamment (somme proche de 100, comme sur un vrai
  // relevé arrondi poste par poste).
  const costBreakdown = [
    { label: t("Frais logistiques", "Logistics fees"), pct: Math.round((amount1 / totalGrille) * 100), color: "#EC0C8C" },
    { label: t("Abonnement", "Subscription"), pct: Math.round((amount5 / totalGrille) * 100), color: "#8B5CF6" },
    { label: t("Express", "Express"), pct: Math.round((amount3 / totalGrille) * 100), color: "#38BDF8" },
    { label: t("Garantie", "Guarantee"), pct: Math.round((amount2 / totalGrille) * 100), color: "#4FE0AE" },
    { label: t("Récupération des refus", "Refusal retrieval"), pct: Math.round((amount4 / totalGrille) * 100), color: "#FFB84D" },
  ];

  return (
    <>
      <SectionHeader
        eyebrow={t("Partenaire", "Partner")}
        title={t("Accueil · Partenaire agréé", "Home · Approved partner")}
        subtitle={t(
          "Sa grille, ses engagements confrontés au réalisé, comment ses boutiques le notent, et ce qu'il faut lui porter.",
          "Its rate card, its commitments against what actually happened, how its shops rate it, and what to bring to it."
        )}
        count={t("39 variables", "39 variables")}
        first={first}
        layout="inline"
        actions={
          <>
            <HeaderActionBtn onClick={handleExport}>
              {exportDone ? t("Exporté", "Exported") : t("Exporter", "Export")}
            </HeaderActionBtn>
            <HeaderActionBtn
              onClick={() => {
                setEvalDraft(radarYou);
                setShowEvalModal(true);
              }}
            >
              {t("Évaluer ce mois", "Rate this month")}
            </HeaderActionBtn>
          </>
        }
      />

      <div className="grid gap-3 [&>*]:min-w-0">
        <CollapsibleCards visibleCount={3}>
          {/* ── Fiche du partenaire ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start gap-4">
              <div
                className="h-16 w-16 shrink-0 rounded-2xl"
                style={{ background: "linear-gradient(140deg,#5AA9FF,#2563EB 55%,#1B3FA8)" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
                  {t("Entreprise agréée", "Approved partner")}
                </p>
                <h3 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Groupe Logistique Ivoire</h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/45">
                  {t(
                    "Affiliée depuis le 12 mars 2026 · six mois · contrat reconduit tacitement chaque mois",
                    "Affiliated since March 12, 2026 · six months · contract tacitly renewed every month"
                  )}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <HeaderActionBtn onClick={() => setShowEcrireModal(true)}>{t("Écrire", "Message")}</HeaderActionBtn>
                <HeaderActionBtn onClick={() => contratRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  {t("Voir le contrat", "View contract")}
                </HeaderActionBtn>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--dashboard-text)]/10 pt-4 sm:grid-cols-3 lg:grid-cols-6">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Note de l'entreprise agréée", "Approved partner rating")}
                </p>
                <p className="mt-1 text-base font-bold">
                  {formatDecimal(noteEntreprise)}<span className="text-[var(--dashboard-text)]/40">/10</span>
                </p>
                <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{t(`moyenne de ses ${boutiquesAffiliees} boutiques`, `average of its ${boutiquesAffiliees} shops`)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Votre dernière évaluation", "Your last rating")}
                </p>
                <p className="mt-1 text-base font-bold text-[#178a3f]">
                  {formatNote(votreNote)}<span className="text-[var(--dashboard-text)]/40">/10</span>
                </p>
                <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{t("donnée le 1er septembre", "given September 1st")}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Boutiques affiliées", "Affiliated shops")}
                </p>
                <p className="mt-1 text-base font-bold">{boutiquesAffiliees}</p>
                <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{t(`dont ${boutiquesZone} dans votre zone`, `${boutiquesZone} of them in your area`)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Sites de stockage", "Storage sites")}
                </p>
                <p className="mt-1 text-base font-bold">3</p>
                <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">Cocody · Yopougon · Bouaké</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Jours d'enlèvement", "Pickup days")}
                </p>
                <p className="mt-1 text-sm font-bold">{t("Lundi · jeudi", "Monday · Thursday")}</p>
                <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{t("fixés par elle", "set by the partner")}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Engagements tenus", "Commitments kept")}
                </p>
                <p className="mt-1 text-base font-bold text-[#a8690a]">{t("4 sur 6", "4 of 6")}</p>
                <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{t("sur la période", "over the period")}</p>
              </div>
            </div>
          </Card>

          {/* ── Grille tarifaire ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Sa grille tarifaire", "Its rate card")}</h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">
                  {t(
                    "Établie par elle, inscrite à votre contrat d'affiliation. LM ne la fixe pas et ne la modifie pas.",
                    "Set by the partner, written into your affiliation contract. LM does not set it or change it."
                  )}
                </p>
              </div>
              <Tag tone="neutral">{t("Valeurs d'exemple", "Example values")}</Tag>
            </div>

            <div className="mt-3 space-y-2.5">
              {[
                {
                  nature: "B" as const,
                  name: t("Frais logistiques par colis livré", "Logistics fee per delivered parcel"),
                  detail: t("Enlèvement, emballage, transport, remise au client", "Pickup, packaging, transport, hand-off to customer"),
                  rate: `${groupFr(rate1)} F`,
                  qty: t(`${qty1} colis`, `${qty1} parcels`),
                  amount: `${groupFr(amount1)} F`,
                },
                {
                  nature: "S" as const,
                  name: t("Garantie contre la perte", "Loss guarantee"),
                  detail: t("Couvre ce qui disparaît ou casse chez elle", "Covers what goes missing or breaks on its site"),
                  rate: `${groupFr(rate2)} F`,
                  qty: formatDecimal(qty2),
                  amount: `${groupFr(amount2)} F`,
                },
                {
                  nature: "B" as const,
                  name: t("Livraison express", "Express delivery"),
                  detail: t("Course prioritaire, 1 h 48 en moyenne", "Priority run, 1 h 48 on average"),
                  rate: `${groupFr(rate3)} F`,
                  qty: t(`${qty3} colis`, `${qty3} parcels`),
                  amount: `${groupFr(amount3)} F`,
                },
                {
                  nature: "S" as const,
                  name: t("Récupération d'un colis refusé", "Retrieving a refused parcel"),
                  detail: t("Retour de la marchandise au site", "Goods returned to the site"),
                  rate: `${groupFr(rate4)} F`,
                  qty: t(`${qty4} colis`, `${qty4} parcels`),
                  amount: `${groupFr(amount4)} F`,
                },
                {
                  nature: "B" as const,
                  name: t("Abonnement mensuel", "Monthly subscription"),
                  detail: t("Versé à elle, pas à LM", "Paid to the partner, not to LM"),
                  rate: `${groupFr(rate5)} F`,
                  qty: t("1 mois", "1 month"),
                  amount: `${groupFr(amount5)} F`,
                },
              ].map((row) => (
                <div key={row.name} className="flex items-center gap-3 text-xs">
                  <Nature code={row.nature} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{row.name}</span>
                    <span className="block truncate text-[10px] text-[var(--dashboard-text)]/40">{row.detail}</span>
                  </span>
                  <span className="w-16 shrink-0 text-right text-[10px] text-[var(--dashboard-text)]/40">{row.rate}</span>
                  <span className="w-16 shrink-0 text-right text-[10px] text-[var(--dashboard-text)]/40">{row.qty}</span>
                  <span className="w-20 shrink-0 text-right font-semibold">{row.amount}</span>
                </div>
              ))}
            </div>
            <Divider />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{t("Total sur la période", "Total for the period")}</span>
              <span className="text-base font-bold">{groupFr(totalGrille)} F</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Coût par commande livrée", "Cost per delivered order")}
                </p>
                <p className="mt-0.5 text-sm font-bold">{groupFr(coutParCommande)} F</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Part de votre chiffre d'affaires", "Share of your revenue")}
                </p>
                <p className="mt-0.5 text-sm font-bold">{formatDecimal(partCA)} %</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Rythme des règlements", "Payout rhythm")}
                </p>
                <p className="mt-0.5 text-sm font-bold">{t("Automatique", "Automatic")}</p>
                <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("à chaque fin de suspension", "at each end of hold")}</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                  {t("Prochain enlèvement", "Next pickup")}
                </p>
                <p className="mt-0.5 text-sm font-bold">{t("Jeudi 11", "Thursday the 11th")}</p>
              </div>
            </div>
          </Card>

          {/* ── Six engagements ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight sm:text-base">
                  {t("Ses six engagements, tenus ou non", "Its six commitments, kept or not")}
                </h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">
                  {t(
                    "Ce que le contrat prévoit, et ce qui s'est réellement passé sur la période",
                    "What the contract provides for, and what actually happened over the period"
                  )}
                </p>
              </div>
              <Tag tone="warn">{t("2 engagements non tenus", "2 commitments not kept")}</Tag>
            </div>

            <div className="mt-3">
              <EngagementRow
                title={t("Enlèvement sous 24 h après confirmation", "Pickup within 24 h of confirmation")}
                detail={t(`Réalisé en ${realizedH1} h en moyenne`, `Achieved in ${realizedH1} h on average`)}
                realized={`${realizedH1} h`}
                target={t("24 h", "24 h")}
                pct={pct1}
                ok
              />
              <EngagementRow
                title={t("Livraison sous 48 h après enlèvement", "Delivery within 48 h of pickup")}
                detail={t(`Réalisé en ${realizedH2} h en moyenne, nuits comprises`, `Achieved in ${realizedH2} h on average, nights included`)}
                realized={`${realizedH2} h`}
                target={t("48 h", "48 h")}
                pct={pct2}
                ok
              />
              <EngagementRow
                title={t("Prise en main d'un litige sous 9 h", "Taking a dispute in hand within 9 h")}
                detail={t(
                  `Réalisé en ${realizedH3} h ${String(realizedM3).padStart(2, "0")}. C'est un maximum imposé par LM, pas par elle.`,
                  `Achieved in ${realizedH3} h ${String(realizedM3).padStart(2, "0")}. This maximum is set by LM, not by the partner.`
                )}
                realized={`${realizedH3} h ${String(realizedM3).padStart(2, "0")}`}
                target={t("9 h", "9 h")}
                pct={pct3}
                ok
              />
              <EngagementRow
                title={t("Au moins 85 % de livraison au premier passage", "At least 85% delivered on first attempt")}
                detail={t(`Réalisé ${formatDecimal(realizedPct4)} %`, `Achieved ${formatDecimal(realizedPct4)}%`)}
                realized={`${formatDecimal(realizedPct4)} %`}
                target="85 %"
                pct={pct4}
                ok
              />
              <EngagementRow
                title={t("Pas plus de 1 % de casse sur votre stock", "No more than 1% breakage on your stock")}
                detail={t(
                  `Réalisé ${formatDecimal(realizedCasse5)} %. Le dépassement vient presque entièrement du site de Bouaké.`,
                  `Achieved ${formatDecimal(realizedCasse5)}%. The overrun comes almost entirely from the Bouaké site.`
                )}
                realized={`${formatDecimal(realizedCasse5)} %`}
                target="1 %"
                pct={pct5}
                ok={false}
              />
              <EngagementRow
                title={t("Réponse à vos messages sous 9 h", "Reply to your messages within 9 h")}
                detail={t(
                  `Réalisé en ${realizedReponse6} h. Trois de vos demandes attendent depuis plus d'un jour.`,
                  `Achieved in ${realizedReponse6} h. Three of your requests have been waiting over a day.`
                )}
                realized={`${realizedReponse6} h`}
                target={t("9 h", "9 h")}
                pct={pct6}
                ok={false}
              />
            </div>

            <div className="mt-4 rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
              <p className="text-[11px] font-semibold">
                {t(
                  "Quatre sur six, et les deux manqués ne sont pas de même gravité",
                  "Four out of six, and the two missed are not equally serious"
                )}
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                {t(
                  "La casse coûte de l'argent tout de suite : zéro virgule six point de dépassement sur votre stock, c'est environ dix-huit mille francs sur la période. Le délai de réponse, lui, ne coûte rien directement mais retarde tout le reste : un litige, une demande d'enlèvement supplémentaire, une correction de fiche. Les deux se portent dans la même conversation, mais seul le premier se chiffre.",
                  "Breakage costs money right away: 0.6 points of overrun on your stock is about eighteen thousand francs over the period. The response delay costs nothing directly but stalls everything else: a dispute, an extra pickup request, a listing fix. Both belong in the same conversation, but only the first one has a price tag."
                )}
              </p>
            </div>
          </Card>

          {/* ── Radar de comparaison ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight sm:text-base">
                  {t("Comment ses boutiques la notent, critère par critère", "How its shops rate it, criterion by criterion")}
                </h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">
                  {t(
                    "Votre évaluation du mois, face à la moyenne des trente-trois autres boutiques affiliées",
                    "Your rating this month, against the average of the other thirty-three affiliated shops"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />{t("Votre évaluation", "Your rating")}</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full border border-[var(--dashboard-text)]/40" />{t("Ses autres boutiques", "Its other shops")}</span>
              </div>
            </div>

            <div className="mt-3 grid items-center gap-4 lg:grid-cols-[220px_1fr]">
              <RadarChart axes={radarAxesCourts} you={radarYou} network={networkRatings} />
              <div className="space-y-2">
                {radarRows.map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[11px] ${row.bad ? "bg-[#ffe1e2]/60" : ""}`}
                  >
                    <span className="text-[var(--dashboard-text)]/60">{row.label}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold">{formatDecimal(row.you)}</span>
                      <span className="text-[var(--dashboard-text)]/35">{formatDecimal(row.net)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
              <p className="text-[11px] font-semibold">
                {t(
                  "Sur deux critères, vous êtes moins bien servi que ses autres boutiques",
                  "On two criteria, you are served worse than its other shops"
                )}
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                {t(
                  "La qualité du colis et la réactivité. Sur les quatre autres critères, vous êtes au niveau ou au-dessus. Ce n'est donc ni un problème de moyens ni une limite du métier : elle sait faire mieux, elle le fait pour onze de ses boutiques dans votre zone. C'est la demande la plus solide qu'on puisse formuler, parce qu'elle repose sur ses propres chiffres et n'exige rien qu'elle ne fasse déjà ailleurs.",
                  "Parcel quality and responsiveness. On the other four criteria, you're at par or above. So this isn't a resource problem or a limit of the trade: the partner knows how to do better, and does it for eleven of its shops in your area. It's the strongest possible request, because it rests on the partner's own numbers and asks for nothing it doesn't already do elsewhere."
                )}
              </p>
            </div>
          </Card>

          {/* ── Coût réel de la relation ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Ce que la relation vous coûte réellement", "What the relationship really costs you")}</h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">
                  {t("Sa grille, plus ce que ses manquements vous laissent sur les bras", "Its rate card, plus what its shortfalls leave you to carry")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-right text-[9px] font-semibold uppercase leading-tight tracking-[0.1em] text-[var(--dashboard-text)]/50">
                {t("B", "B")}
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[136px_1fr]">
              {/* Anneau + légende */}
              <div className="flex flex-col items-center gap-4 lg:items-stretch">
                <DonutChart segments={costBreakdown} centerValue={groupFr(totalGrille)} centerLabel={t("F versés", "F paid")} />
                <div className="space-y-1.5">
                  {costBreakdown.map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="flex items-center gap-1.5 text-[var(--dashboard-text)]/60">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.color }} />
                        {r.label}
                      </span>
                      <span className="shrink-0 font-semibold">{r.pct} %</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Versé + manquements = coût réel */}
                <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
                  <div className="rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Ce que vous lui versez", "What you pay it")}</p>
                    <p className="mt-2 text-xl font-bold">{groupFr(totalGrille)}F</p>
                    <p className="mt-1 text-[10px] leading-snug text-[var(--dashboard-text)]/40">{t("Sa grille, appliquée à votre volume du mois.", "Its rate card, applied to your volume this month.")}</p>
                  </div>
                  <div className="hidden text-center text-lg text-[var(--dashboard-text)]/25 sm:block">+</div>
                  <div className="rounded-2xl border p-3" style={{ background: "linear-gradient(135deg, rgba(200,38,45,.12), rgba(236,12,140,.06))", borderColor: "rgba(255,122,128,.35)" }}>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c8262d]/70">{t("Ce que ses manquements vous coûtent", "What its shortfalls cost you")}</p>
                    <p className="mt-2 text-xl font-bold text-[#c8262d]">{groupFr(manquements)}F</p>
                    <p className="mt-1 text-[10px] leading-snug text-[var(--dashboard-text)]/40">{t("Litiges à sa charge, casse au-delà du seuil, marchandise non couverte.", "Its share of disputes, breakage beyond the threshold, uncovered goods.")}</p>
                  </div>
                  <div className="hidden text-center text-lg text-[var(--dashboard-text)]/25 sm:block">=</div>
                  <div className="rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Coût réel de la relation", "Real cost of the relationship")}</p>
                    <p className="mt-2 text-xl font-bold">{groupFr(coutReel)}F</p>
                    <p className="mt-1 text-[10px] leading-snug text-[var(--dashboard-text)]/40">{t(`Soit ${groupFr(coutParCommandeReel)} F par commande livrée, et non ${groupFr(coutParCommande)} F.`, `That's ${groupFr(coutParCommandeReel)} F per delivered order, not ${groupFr(coutParCommande)} F.`)}</p>
                  </div>
                </div>

                {/* Litiges + casse */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
                    <p className="text-[11px] font-semibold">{t("Litiges dont elle est responsable", "Disputes it's responsible for")}</p>
                    <p className="mt-1 text-base font-bold" style={{ color: "#c8262d" }}>{groupFr(litigesCost)}F</p>
                    <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("20 litiges sur 26 depuis l'ouverture, ramenés au mois", "20 of 26 disputes since opening, brought back to a month")}</p>
                  </div>
                  <div className="rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {t("Casse au-delà du seuil contractuel", "Breakage beyond the contractual threshold")}
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[var(--dashboard-text)]/30 text-[8px] font-semibold text-[var(--dashboard-text)]/60">
                        S
                      </span>
                    </p>
                    <p className="mt-1 text-base font-bold" style={{ color: "#c8262d" }}>{groupFr(casseCost)}F</p>
                    <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t(`${formatDecimal(realizedCasse5)} % constaté pour 1 % engagé`, `${formatDecimal(realizedCasse5)}% observed against 1% committed`)}</p>
                  </div>
                </div>
              </div>

              {/* Note pleine largeur */}
              <div className="rounded-2xl p-3 lg:col-span-2" style={{ background: "var(--dashboard-surface-2)" }}>
                <p className="text-[11px] font-semibold">{t("Le vrai prix n'est pas celui de la grille", "The real price isn't the one on the rate card")}</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                  {t(
                    "Deux mille vingt-quatre francs par commande sur le papier, deux mille deux cent soixante-quatorze en réalité : douze pour cent d'écart, qui ne figurent sur aucune facture. C'est ce chiffre-là qu'il faut poser sur la table quand on demande une correction — il transforme un reproche en manque à gagner, et il ne met en cause ni les tarifs ni la bonne foi du partenaire, seulement deux engagements précis.",
                    "Two thousand twenty-four francs per order on paper, two thousand two hundred seventy-four in reality: a twelve percent gap that appears on no invoice. That's the number to put on the table when asking for a correction — it turns a complaint into lost earnings, without questioning the rates or the partner's good faith, only two specific commitments."
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* ── Ses trois sites ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Ses trois sites ne se valent pas", "Its three sites are not equal")}</h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Délai de livraison et taux de casse, site par site", "Delivery delay and breakage rate, site by site")}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: DELAY_COLOR }} />{t("Délai en heures", "Delay in hours")}</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: CASSE_COLOR }} />{t("Casse en %", "Breakage in %")}</span>
              </div>
            </div>
            <div className="mt-6">
              <SiteBars
                sites={[
                  { name: "Cocody", delayH: siteCocodyDelay, cassePct: siteCocodyCasse },
                  { name: "Yopougon", delayH: siteYopougonDelay, cassePct: siteYopougonCasse },
                  { name: "Bouaké", delayH: siteBouakeDelay, cassePct: siteBouakeCasse },
                ]}
              />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SiteCard
                name="Cocody"
                delay={formatHM(siteCocodyDelay)}
                casse={t(`${formatDecimal(siteCocodyCasse)} % de casse`, `${formatDecimal(siteCocodyCasse)}% breakage`)}
                detail={t(`${siteCocodyUnits} de vos unités · ${siteCocodyOrders} commandes servies`, `${siteCocodyUnits} of your units · ${siteCocodyOrders} orders served`)}
                tone="ok"
              />
              <SiteCard
                name="Yopougon"
                delay={formatHM(siteYopougonDelay)}
                casse={t(`${formatDecimal(siteYopougonCasse)} % de casse`, `${formatDecimal(siteYopougonCasse)}% breakage`)}
                detail={t(`${siteYopougonUnits} unités · ${siteYopougonOrders} commandes`, `${siteYopougonUnits} units · ${siteYopougonOrders} orders`)}
                tone="neutral"
              />
              <SiteCard
                name="Bouaké"
                delay={formatHM(siteBouakeDelay)}
                casse={t(`${formatDecimal(siteBouakeCasse)} % de casse`, `${formatDecimal(siteBouakeCasse)}% breakage`)}
                detail={t(`${siteBouakeUnits} unités · ${siteBouakeOrders} commandes servies`, `${siteBouakeUnits} units · ${siteBouakeOrders} orders served`)}
                tone="bad"
              />
            </div>
            <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
              <p className="text-[11px] font-semibold">
                {t("Bouaké sert plus de commandes qu'il ne détient de stock", "Bouaké serves more orders than it holds stock for")}
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                {t(
                  "Dix-huit commandes pour quinze unités sur place : la différence part de Cocody, ce qui ajoute un transfert, donc deux manipulations et plusieurs heures. C'est la cause des onze heures trente de délai, des trois virgule deux pour cent de casse et du plus mauvais taux de livraison de vos six communes. La demande à formuler est simple et vérifiable : déposer directement à Bouaké la part destinée à cette zone. Elle le fait déjà pour d'autres boutiques de son réseau.",
                  "Eighteen orders for fifteen units on site: the difference is shipped from Cocody, which adds a transfer, so two handling steps and several hours. That's the cause of the eleven-hour-thirty delay, the 3.2% breakage, and the worst delivery rate of your six districts. The request to make is simple and verifiable: deposit directly at Bouaké the share meant for that area. The partner already does it for other shops in its network."
                )}
              </p>
            </div>
          </Card>

          {/* ── Performance depuis le début ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Sa performance depuis le début de la relation", "Its performance since the relationship began")}</h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Taux de livraison mois par mois, sur vos commandes", "Delivery rate month by month, on your orders")}</p>
              </div>
            </div>
            <AreaChart values={performanceHistory} color="#4FE0AE" />
            <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
              <span>Avril</span><span>Mai</span><span>Juin</span><span>Juillet</span><span>Août</span><span>Sept.</span>
            </div>
            <Divider />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatRow compact label={t("Au démarrage", "At the start")} value={`${formatDecimal(perfStart)} %`} />
              <StatRow compact label={t("Aujourd'hui", "Today")} value={<span className="text-[#178a3f]">{formatDecimal(perfToday)} %</span>} />
              <StatRow compact label={t("Progression", "Progress")} value={<span className="text-[#178a3f]">{perfProgress >= 0 ? "+" : ""}{formatDecimal(perfProgress)} pts</span>} />
              <StatRow compact label={t("Trois derniers mois", "Last three months")} value={<span className="text-[#a8690a]">{perfLast3 >= 0 ? "+" : ""}{formatDecimal(perfLast3)} pt</span>} />
            </div>
            <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
              {t(
                "La courbe monte franchement les trois premiers mois puis s'aplatit. C'est le comportement normal d'une relation qui se rode : les gains faciles ont été faits. Les points suivants ne viendront plus d'eux-mêmes — ils viendront des deux engagements manqués et du site de Bouaké.",
                "The curve rises sharply the first three months then flattens. That's normal for a relationship settling in: the easy gains are done. Further points won't come by themselves — they'll come from the two missed commitments and the Bouaké site."
              )}
            </p>
          </Card>

          {/* ── Évaluation mensuelle ── */}
          <div className="grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
            <Card className="!bg-[var(--dashboard-glass)]">
              <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("L'évaluation mensuelle", "The monthly rating")}</h3>
              <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">
                {t(
                  "Chaque début de mois, les trente-quatre boutiques affiliées reçoivent le même message : évaluez votre partenaire agréé. La note sur dix est la moyenne de toutes ces réponses.",
                  "At the start of each month, the thirty-four affiliated shops get the same message: rate your approved partner. The rating out of ten is the average of all these answers."
                )}
              </p>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 text-[10px] font-bold text-brand-purple">1</span>
                  <div>
                    <p className="text-xs font-semibold">{t("Le message part le 1er du mois", "The message goes out on the 1st")}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("À toutes les boutiques affiliées, en même temps.", "To all affiliated shops, at the same time.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 text-[10px] font-bold text-brand-purple">2</span>
                  <div>
                    <p className="text-xs font-semibold">{t("Chacune note six critères sur dix", "Each one rates six criteria out of ten")}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Délai, fiabilité, qualité du colis, litiges, réactivité, rapport qualité-prix.", "Delay, reliability, parcel quality, disputes, responsiveness, value for money.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 text-[10px] font-bold text-brand-purple">3</span>
                  <div>
                    <p className="text-xs font-semibold">{t("La moyenne devient sa note", "The average becomes its rating")}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Visible par toutes les boutiques du réseau, et par les entrepreneurs qui cherchent un partenaire.", "Visible to every shop in the network, and to entrepreneurs looking for a partner.")}</p>
                  </div>
                </div>
              </div>
              <Divider />
              <StatRow label={t("Boutiques ayant répondu ce mois", "Shops that answered this month")} value={t(`${boutiquesRepondu} sur ${boutiquesAffiliees}`, `${boutiquesRepondu} of ${boutiquesAffiliees}`)} />
              <StatRow label={t("Votre note", "Your rating")} value={<span className="text-[#178a3f]">{formatNote(votreNote)} / 10</span>} />
              <StatRow label={t("Note collective du mois", "This month's collective rating")} value={`${formatDecimal(collectiveRatings[collectiveRatings.length - 1])} / 10`} />
              <StatRow label={t("Votre première évaluation", "Your first rating")} value={t(`Avril · ${formatNote(yourRatingsInit[0])} / 10`, `April · ${formatNote(yourRatingsInit[0])} / 10`)} />
            </Card>

            <Card className="!bg-[var(--dashboard-glass)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Six mois d'évaluations", "Six months of ratings")}</h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="h-[2px] w-3 rounded-full bg-[#38BDF8]" />{t("La vôtre", "Yours")}</span>
                  <span className="flex items-center gap-1.5"><span className="h-[2px] w-3 rounded-full border-t border-dashed" style={{ borderColor: "var(--dashboard-text)", opacity: 0.4 }} />{t("Collective", "Collective")}</span>
                </div>
              </div>
              <AreaChart values={yourRatings} color="#38BDF8" compareValues={collectiveRatings} compareColor="#9096AA" />
              <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
                <span>Avril</span><span>Mai</span><span>Juin</span><span>Juil.</span><span>Août</span><span>Sept.</span>
              </div>
              <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
                <p className="text-[11px] font-semibold">{t("Vous notez au-dessus de la moyenne de ses boutiques", "Your rating is above its shops' average")}</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                  {t(
                    "Neuf contre huit virgule quatre. Votre relation est meilleure que celle qu'elle entretient avec le reste de ses boutiques, et elle s'est améliorée de deux points en six mois. Une évaluation haute n'empêche pas une demande précise : elle la rend plus facile à entendre.",
                    "Nine against eight point four. Your relationship is better than the one the partner has with its other shops, and it has improved by two points in six months. A high rating doesn't rule out a precise request: it makes it easier to hear."
                  )}
                </p>
              </div>
            </Card>
          </div>

          {/* ── Échanges en cours + échéances du contrat ── */}
          <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
            <Card className="!bg-[var(--dashboard-glass)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Vos échanges en cours", "Your ongoing exchanges")}</h3>
                  <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Trois demandes attendent une réponse", "Three requests are waiting for a reply")}</p>
                </div>
                <Tag tone="warn">{t(`Réponse moyenne : ${realizedReponse6} h`, `Average reply: ${realizedReponse6} h`)}</Tag>
              </div>
              <div className="mt-3 space-y-2">
                {echanges.map((row) => (
                  <div
                    key={row.id}
                    className={`flex items-start gap-3 rounded-2xl p-3 ${row.tone === "bad" ? "bg-[#ffe1e2]/50" : row.tone === "warn" ? "bg-[#fff1d6]/60" : ""}`}
                    style={row.tone === "neutral" ? { background: "var(--dashboard-surface-2)" } : undefined}
                  >
                    <span className="mt-0.5 shrink-0 text-[10px] font-semibold text-[var(--dashboard-text)]/45">{row.wait}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-semibold">
                        {row.title} <Nature code={row.nature} />
                      </p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">{row.detail}</p>
                    </div>
                    <HeaderActionBtn
                      disabled={echangesRelances.includes(row.id)}
                      onClick={() =>
                        setEchangesRelances((prev) => (prev.includes(row.id) ? prev : [...prev, row.id]))
                      }
                    >
                      {echangesRelances.includes(row.id) ? t("Relancé", "Sent") : t("Relancer", "Follow up")}
                    </HeaderActionBtn>
                  </div>
                ))}
              </div>
              <Divider />
              <StatRow label={t("Demandes envoyées depuis l'affiliation", "Requests sent since affiliation")} value={String(demandesTotal)} />
              <StatRow label={t("Traitées favorablement", "Handled favorably")} value={<span className="text-[#178a3f]">{demandesTraitees} · {demandesTraiteesPct} %</span>} />
              <StatRow label={t("Sans réponse au-delà de 48 h", "No reply after 48 h")} value={<span className="text-[#c8262d]">{demandesSansReponse}</span>} />
              <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
                {t(
                  "Trois demandes sur quatre aboutissent : la relation fonctionne quand elle répond. Le problème n'est pas le refus, c'est le silence.",
                  "Three requests out of four succeed: the relationship works when the partner replies. The problem isn't refusal, it's silence."
                )}
              </p>
            </Card>

            <Card className="!bg-[var(--dashboard-glass)]">
              <div ref={contratRef} className="scroll-mt-24">
                <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Le contrat et ses échéances", "The contract and its deadlines")}</h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Ce qui est dû de part et d'autre, et quand cela se revoit", "What's due on each side, and when it gets revisited")}</p>
              </div>
              <div className="mt-3">
                <TimelineItem
                  date={t("12 mars 2026", "Mar 12, 2026")}
                  title={t("Signature de l'affiliation", "Affiliation signed")}
                  detail={t("Après votre vérification d'identité. La grille tarifaire et les six engagements sont fixés ce jour-là.", "After your identity check. The rate card and the six commitments are fixed that day.")}
                  tone="ok"
                />
                <TimelineItem
                  date={t("Chaque mois", "Every month")}
                  title={t("Reconduction tacite", "Tacit renewal")}
                  detail={t("Le contrat se prolonge de lui-même. L'abonnement est prélevé automatiquement et versé à votre partenaire, pas à LM.", "The contract renews itself. The subscription is debited automatically and paid to your partner, not to LM.")}
                  tag={t("Prochain prélèvement : le 14", "Next debit: the 14th")}
                  tone="ok"
                />
                <TimelineItem
                  date={t("12 mars 2027", "Mar 12, 2027")}
                  title={t("Révision annuelle de la grille", "Annual rate card review")}
                  detail={t(
                    "Elle peut proposer de nouveaux tarifs, vous pouvez les refuser. C'est le moment où les écarts constatés pèsent le plus lourd — à condition d'avoir gardé les relevés.",
                    "It can propose new rates, you can refuse them. This is when the observed gaps carry the most weight — provided you kept the records."
                  )}
                  tag={t("Dans 6 mois", "In 6 months")}
                  tone="key"
                />
                <TimelineItem
                  date={t("À tout moment", "At any time")}
                  title={t("Fin de l'affiliation", "End of affiliation")}
                  detail={t(
                    "Vous pouvez y mettre fin sans motif. Votre stock doit être retiré ou transféré, à vos frais, et les litiges en cours se terminent avant la clôture. Votre boutique continue d'exister en mode gratuit.",
                    "You can end it without cause. Your stock must be withdrawn or transferred, at your expense, and ongoing disputes must close before termination. Your shop keeps existing in free mode."
                  )}
                  tone="end"
                  last
                />
              </div>
            </Card>
          </div>

          {/* ── À porter au partenaire ── */}
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("À porter à votre partenaire, dans cet ordre", "To raise with your partner, in this order")}</h3>
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">
                  {t("Chaque ligne est chiffrée, datée et vérifiable. C'est ce qui distingue une demande d'une plainte.", "Each line is costed, dated and verifiable. That's what tells a request apart from a complaint.")}
                </p>
              </div>
              <HeaderActionBtn
                onClick={() => {
                  const releve = pointsPourPartenaire
                    .map((item, i) => `${i + 1}. ${item.title}\n${item.detail}`)
                    .join("\n\n");
                  navigator.clipboard?.writeText(releve).then(() => {
                    setReleveCopie(true);
                    setTimeout(() => setReleveCopie(false), 2500);
                  });
                }}
              >
                {releveCopie ? t("Relevé copié", "Statement copied") : t("Composer le relevé", "Draft the statement")}
              </HeaderActionBtn>
            </div>
            <div className="mt-3 space-y-2">
              {pointsPourPartenaire.map((item, i) => (
                <ActionItem key={item.title} n={i + 1} tone={item.tone} title={item.title} detail={item.detail} />
              ))}
              <ActionItem
                n={5}
                tone="blue"
                title={t("Vos deux points faibles à écrire dans l'évaluation du mois", "Your two weak points to note in this month's rating")}
                detail={t(
                  "La qualité du colis et la réactivité sont les deux critères où vous notez plus bas que ses autres boutiques. L'évaluation mensuelle est le canal prévu pour cela : elle est lue, agrégée, et elle pèse sur sa note publique.",
                  "Parcel quality and responsiveness are the two criteria where you rate lower than its other shops. The monthly rating is the channel meant for this: it's read, aggregated, and weighs on its public score."
                )}
              />
            </div>
          </Card>
        </CollapsibleCards>
      </div>

      {showEcrireModal && (
        <PartenaireModal
          title={t("Écrire au partenaire", "Message the partner")}
          subtitle={t(
            "Envoyé à Groupe Logistique Ivoire. Réponse habituelle sous 14 h.",
            "Sent to Groupe Logistique Ivoire. Usual reply within 14 h."
          )}
          closeLabel={t("Fermer", "Close")}
          onClose={() => setShowEcrireModal(false)}
        >
          <textarea
            value={ecrireText}
            onChange={(e) => setEcrireText(e.target.value)}
            rows={4}
            placeholder={t("Votre message…", "Your message…")}
            className="w-full resize-none rounded-2xl p-3 text-xs text-[var(--dashboard-text)] outline-none"
            style={{ background: "var(--dashboard-surface-2)" }}
          />
          <button
            type="button"
            disabled={!ecrireText.trim()}
            onClick={() => {
              const texte = ecrireText.trim();
              if (!texte) return;
              setExtraEchanges((prev) => [
                {
                  id: `msg-${Date.now()}`,
                  wait: t("À l'instant", "Just now"),
                  title: t("Votre message", "Your message"),
                  nature: "S" as const,
                  detail: texte,
                  tone: "neutral" as const,
                },
                ...prev,
              ]);
              setEcrireText("");
              setShowEcrireModal(false);
            }}
            className="mt-3 w-full rounded-full py-2 text-xs font-semibold text-white transition disabled:opacity-40"
            style={{ background: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 100%)" }}
          >
            {t("Envoyer", "Send")}
          </button>
        </PartenaireModal>
      )}

      {showEvalModal && (
        <PartenaireModal
          title={t("Évaluer ce mois", "Rate this month")}
          subtitle={t(
            "Six critères sur dix. La moyenne devient votre note.",
            "Six criteria out of ten. The average becomes your rating."
          )}
          closeLabel={t("Fermer", "Close")}
          onClose={() => setShowEvalModal(false)}
        >
          <div className="space-y-3">
            {radarAxesLongs.map((label, i) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--dashboard-text)]/70">{label}</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={evalDraft[i]}
                  onChange={(e) => {
                    const v = Math.min(10, Math.max(0, Number(e.target.value)));
                    setEvalDraft((prev) => prev.map((x, idx) => (idx === i ? v : x)));
                  }}
                  className="w-16 rounded-full px-2 py-1 text-right text-xs font-semibold text-[var(--dashboard-text)] outline-none"
                  style={{ background: "var(--dashboard-surface-2)" }}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const moyenne = Math.round((evalDraft.reduce((a, b) => a + b, 0) / evalDraft.length) * 10) / 10;
              setRadarYou(evalDraft);
              setVotreNote(moyenne);
              setYourRatings((prev) => [...prev.slice(0, -1), moyenne]);
              setShowEvalModal(false);
            }}
            className="mt-4 w-full rounded-full py-2 text-xs font-semibold text-white transition"
            style={{ background: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 100%)" }}
          >
            {t("Enregistrer la note", "Save rating")}
          </button>
        </PartenaireModal>
      )}
    </>
  );
}
