"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AreaChart, Card, CollapsibleCards, Divider, HeaderActionBtn, Nature, openBrandedReport, periodSeed, scaleForPeriod, SectionHeader, StatRow, Tag, texteAvecChiffres } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Litiges" de l'onglet Accueil — remplace l'ancienne section
  "Acquisition" (page de commande, sources de trafic, paniers abandonnés),
  retirée : ce contenu n'a plus sa place dans l'onglet Accueil (cf. demande).

  Reprend et développe le petit bloc "Litiges" déjà présent dans
  CommandesSection.tsx (mêmes identifiants C-4819/C-4816, mêmes montants,
  même taux 1,7 % / 26 litiges depuis l'ouverture — une seule source de
  vérité pour ces chiffres) en écran complet : litiges en cours, taux dans
  le temps, flux motif → cause → responsable, relevé à porter au partenaire
  agréé, vie d'un litige heure par heure, issues, effet sur le réachat
  client selon la vitesse de réponse, références à risque, comparaison
  stockage/dropshipping, actions recommandées.

  Chiffres statiques en attendant l'API Laravel, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]]. Couleurs stockage=bleu,
  dropshipping=rose, cf. mémoire [[dashboard-chart-colors-stockage-drop]].

  Comme CommandesSection/ClientsSection, pas de bloc "assistance IA" local :
  les questions que "solution LM" sait répondre depuis cet écran vivent
  dans dashboard-accueil/assistanceQuestions.ts (clé "Litiges").
*/

const GREEN = "#178a3f";
const GREEN_CHART = "#4FE0AE";
const AMBER = "#a8690a";
const AMBER_CHART = "#FFB020";
const RED = "#c8262d";
const RED_CHART = "#FF5A62";
const GREY_CHART = "#9096AA";
const PURPLE_CHART = "#8B5CF6";

function KpiTile({ label, value, valueColor, sub, subColor }: { label: string; value: string; valueColor?: string; sub: string; subColor?: string }) {
  return (
    <div className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3.5 shadow-[0_4px_12px_-4px_rgba(20,18,32,0.08)] transition-colors">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-1.5 text-xl tracking-tight sm:text-2xl font-figures-bold" style={{ color: valueColor }}>
        {value}
      </p>
      <p className={`mt-1 text-[10px] ${subColor ? "" : "text-[var(--dashboard-text)]/50"}`} style={{ color: subColor }}>
        {texteAvecChiffres(sub)}
      </p>
    </div>
  );
}

function DisputeStat({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <p className="text-[9px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-1 text-xs font-semibold" style={{ color: valueColor }}>
        {texteAvecChiffres(value)}
      </p>
    </div>
  );
}

function DisputeCard({
  code,
  id,
  amount,
  motif,
  since,
  sinceColor,
  handled,
  remaining,
  remainingColor,
  pct,
  pctColor,
  note,
  borderColor,
}: {
  code: "S" | "D";
  id: string;
  amount: string;
  motif: string;
  since: string;
  sinceColor?: string;
  handled: string;
  remaining: string;
  remainingColor?: string;
  pct: number;
  pctColor: string;
  note: string;
  borderColor: string;
}) {
  const { t } = useDashboardLangue();
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor, background: `${borderColor}0d` }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Nature code={code} />
          <span className="text-sm font-bold tracking-tight">{texteAvecChiffres(id)}</span>
          <Tag tone="warn">{t("Litige ouvert", "Dispute open")}</Tag>
        </div>
        <span className="text-sm font-figures-bold">{amount}</span>
      </div>
      <div className="mt-3.5 grid grid-cols-3 gap-3 sm:grid-cols-5">
        <DisputeStat label={t("Ouvert par", "Opened by")} value={t("Le client", "The customer")} />
        <DisputeStat label={t("Motif déclaré", "Stated reason")} value={motif} />
        <DisputeStat label={t("Ouvert depuis", "Open since")} value={since} valueColor={sinceColor} />
        <DisputeStat label={t("Prise en main", "Handled")} value={handled} valueColor={GREEN} />
        <DisputeStat label={t("Reste avant échéance", "Time left")} value={remaining} valueColor={remainingColor} />
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pctColor }} />
      </div>
      <p className="mt-2.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">{note}</p>
    </div>
  );
}

function TimelineStep({
  time,
  timeNote,
  dotColor,
  title,
  titleColor,
  desc,
  badges,
  last = false,
}: {
  time: string;
  timeNote?: string;
  dotColor: string;
  title: string;
  titleColor?: string;
  desc: string;
  badges: string[];
  last?: boolean;
}) {
  return (
    <div className="grid grid-cols-[64px_20px_1fr] gap-0 sm:grid-cols-[84px_20px_1fr]">
      <div className="pr-3 pt-0.5 text-right">
        <p className="text-sm tracking-tight font-figures-bold">{time}</p>
        {timeNote && <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{texteAvecChiffres(timeNote)}</p>}
      </div>
      <div className="relative flex justify-center">
        {!last && <span className="absolute top-4 bottom-[-14px] w-px bg-[var(--dashboard-text)]/15" />}
        <span
          className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2"
          style={{ borderColor: dotColor, background: "var(--dashboard-bg)" }}
        />
      </div>
      <div className={last ? "pb-0" : "pb-6"}>
        <p className="text-xs font-semibold" style={{ color: titleColor }}>
          {texteAvecChiffres(title)}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">{texteAvecChiffres(desc)}</p>
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span key={b} className="rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-[9px] font-semibold text-[var(--dashboard-text)]/65">
                {texteAvecChiffres(b)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sankey "motif → cause → responsable" : les liens ne sont pas inventés — ils
// se déduisent des totaux déjà présents (motifs, causes, responsables somment
// tous à 26) et du texte de la carte ("sept fois sur quatorze", "vingt litiges
// sur vingt-six chez le partenaire", "vos quatre fiches trop flatteuses" :
// une seule répartition motif → cause → responsable rend ces trois phrases
// vraies en même temps). Rendu en SVG à la main (pas de lib de sankey) parce
// que le flux est minuscule et fixe : 3 → 6 → 3 nœuds.
type SankeyMotif = { fr: string; en: string; value: number };
type SankeyCause = { fr: string; en: string; value: number; color: string; motif: number; resp: number };
type SankeyResp = { fr: string; en: string; value: number; pct: string; color: string };

function MotifResponsableSankey({ motifs, causes, resp }: { motifs: SankeyMotif[]; causes: SankeyCause[]; resp: SankeyResp[] }) {
  const { t } = useDashboardLangue();
  const uid = useId();

  const VIEW_W = 900;
  const PLOT_H = 300;
  const PAD_TOP = 12;
  const VIEW_H = PLOT_H + PAD_TOP * 2;
  const NODE_W = 8;
  const X_MOTIF = 200;
  const X_CAUSE = 452;
  const X_RESP = 712;
  const total = motifs.reduce((s, m) => s + m.value, 0);
  // Unité calée sur la colonne la plus dense (les 6 causes, gap 16) pour
  // qu'aucune ne descende sous une hauteur lisible.
  const CAUSE_GAP = 16;
  const UNIT = (PLOT_H - CAUSE_GAP * (causes.length - 1)) / total;

  function layout<T extends { value: number }>(nodes: T[], gap: number) {
    const totalH = nodes.reduce((s, n) => s + n.value * UNIT, 0) + gap * (nodes.length - 1);
    let y = PAD_TOP + (PLOT_H - totalH) / 2;
    return nodes.map((n) => {
      const h = n.value * UNIT;
      const y0 = y;
      y += h + gap;
      return { ...n, y0, h };
    });
  }

  const motifL = layout(motifs, 10);
  const causeL = layout(causes, CAUSE_GAP);
  const respL = layout(resp, 10);

  // Empilement des liens à l'intérieur d'un même nœud partagé (plusieurs
  // causes vers "Le partenaire agréé", par ex.) : un compteur par nœud.
  const motifOffset = motifs.map(() => 0);
  const respOffset = resp.map(() => 0);
  const links = causeL.flatMap((c, i) => {
    const mOff = motifOffset[c.motif];
    motifOffset[c.motif] += c.h;
    const rOff = respOffset[c.resp];
    respOffset[c.resp] += c.h;
    const inLink = { x0: X_MOTIF + NODE_W, y0: motifL[c.motif].y0 + mOff + c.h / 2, x1: X_CAUSE, y1: c.y0 + c.h / 2, color: c.color, w: c.h };
    const outLink = { x0: X_CAUSE + NODE_W, y0: c.y0 + c.h / 2, x1: X_RESP, y1: respL[c.resp].y0 + rOff + c.h / 2, color: c.color, w: c.h };
    return [{ ...inLink, key: `${uid}-in${i}` }, { ...outLink, key: `${uid}-out${i}` }];
  });

  const ribbon = (x0: number, y0: number, x1: number, y1: number) => {
    const xm = (x0 + x1) / 2;
    return `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1}`;
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
        <span>{t("Ce que le client déclare", "What the customer states")}</span>
        <span>{t("La cause identifiée", "The identified cause")}</span>
        <span>{t("Qui devait l'éviter", "Who should have avoided it")}</span>
      </div>
      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full min-w-[820px]" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }} aria-hidden fill="none">
          {links.map((l) => (
            <path key={l.key} d={ribbon(l.x0, l.y0, l.x1, l.y1)} stroke={l.color} strokeOpacity={0.28} strokeWidth={Math.max(l.w, 1)} fill="none" />
          ))}
          {motifL.map((m, i) => (
            <g key={`${uid}-m${i}`}>
              <rect x={X_MOTIF} y={m.y0} width={NODE_W} height={Math.max(m.h, 2)} rx={2} fill="#9096AA" />
              <text x={X_MOTIF - 10} y={m.y0 + m.h / 2 + 3} textAnchor="end" fontSize={11} fill="var(--dashboard-text)" fillOpacity={0.8}>
                {t(m.fr, m.en)}
                <tspan fontWeight={700} fillOpacity={1} dx={8} fontFamily='-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'>{m.value}</tspan>
              </text>
            </g>
          ))}
          {causeL.map((c, i) => (
            <g key={`${uid}-c${i}`}>
              <rect x={X_CAUSE} y={c.y0} width={NODE_W} height={Math.max(c.h, 2)} rx={2} fill={c.color} />
              <text x={X_CAUSE + NODE_W + 6} y={c.y0 - 3} fontSize={9} fontWeight={600} fill="var(--dashboard-text)" fillOpacity={0.75}>
                {t(c.fr, c.en)}
              </text>
              <text
                x={X_CAUSE + NODE_W + 6}
                y={c.y0 + c.h / 2 + 3.5}
                fontSize={10}
                fontWeight={700}
                fill={c.color}
                fontFamily='-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              >
                {c.value}
              </text>
            </g>
          ))}
          {respL.map((r, i) => (
            <g key={`${uid}-r${i}`}>
              <rect x={X_RESP} y={r.y0} width={NODE_W} height={Math.max(r.h, 2)} rx={2} fill={r.color} />
              <text x={X_RESP + NODE_W + 10} y={r.y0 + r.h / 2 + 3} fontSize={11} fill="var(--dashboard-text)" fillOpacity={0.8}>
                {t(r.fr, r.en)}
                <tspan fontWeight={700} fillOpacity={1} dx={8} fontFamily='-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'>{r.value}</tspan>
                <tspan fontSize={9} fillOpacity={0.4} dx={5} fontFamily='-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'>{r.pct}</tspan>
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function RiskRow({
  code,
  name,
  ventes,
  litiges,
  taux,
  taux_color,
  cause,
  bad = false,
}: {
  code: "S" | "D";
  name: string;
  ventes: number;
  litiges: number;
  taux: string;
  taux_color: string;
  cause: string;
  bad?: boolean;
}) {
  return (
    <tr className={`border-b border-[var(--dashboard-text)]/[0.05] last:border-0 ${bad ? "bg-[#c8262d0d]" : ""}`}>
      <td className="py-2 pr-3">
        <span className="flex items-center gap-2 font-semibold">
          <Nature code={code} />
          <span>{texteAvecChiffres(name)}</span>
        </span>
      </td>
      <td className="py-2 pr-3 font-figures">{ventes}</td>
      <td className="py-2 pr-3 font-figures">{litiges}</td>
      <td className="py-2 pr-3 font-figures-bold" style={{ color: taux_color }}>
        {taux}
      </td>
      <td className="py-2 pr-3 text-[var(--dashboard-text)]/55">{texteAvecChiffres(cause)}</td>
    </tr>
  );
}

function PartnerRow({
  poste,
  litiges,
  cout,
  reseau,
  votreCas,
  votreCasColor,
  bad = false,
  total = false,
}: {
  poste: string;
  litiges: string;
  cout: string;
  reseau: string;
  votreCas: string;
  votreCasColor?: string;
  bad?: boolean;
  total?: boolean;
}) {
  return (
    <tr className={`border-b border-[var(--dashboard-text)]/[0.05] last:border-0 ${bad ? "bg-[#c8262d0d]" : ""} ${total ? "border-t border-[var(--dashboard-text)]/15" : ""}`}>
      <td className={`py-2.5 pr-3 ${total ? "font-bold" : "font-semibold"}`}>{texteAvecChiffres(poste)}</td>
      <td className="py-2.5 pr-3 font-figures">{litiges}</td>
      <td className={`py-2.5 pr-3 ${total ? "font-figures-bold" : "font-figures"}`}>{cout}</td>
      <td className="py-2.5 pr-3 font-figures text-[var(--dashboard-text)]/50">{reseau}</td>
      <td className="py-2.5 pr-3 font-semibold" style={{ color: votreCasColor }}>
        {texteAvecChiffres(votreCas)}
      </td>
    </tr>
  );
}

function ActionItem({
  tone,
  title,
  code,
  desc,
  cta,
  href,
}: {
  tone: "ko" | "warn" | "info";
  title: string;
  code?: "S" | "D" | "B";
  desc: string;
  cta: string;
  href?: string;
}) {
  const dot = tone === "ko" ? "bg-[#FF5A62] text-white" : tone === "warn" ? "bg-[#FFB020] text-white" : "bg-brand-purple/15 text-brand-purple";
  const border = tone === "ko" ? "border-[#FF5A62]/25" : "border-[var(--dashboard-text)]/10";
  const content = (
    <div className={`mt-2.5 flex items-center gap-3 rounded-xl border bg-[var(--dashboard-surface-2)] p-3 first:mt-3 ${border}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dot}`}>{tone === "info" ? "i" : "!"}</span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span>{texteAvecChiffres(title)}</span>
          {code && <Nature code={code} />}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{texteAvecChiffres(desc)}</p>
      </div>
      <span className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold transition hover:border-[var(--dashboard-text)]/30 hover:bg-[var(--dashboard-text)]/5">
        {texteAvecChiffres(cta)}
      </span>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function LitigesSection({ first = true, activeDate }: { first?: boolean; activeDate?: Date }) {
  const { t } = useDashboardLangue();
  // Fait varier les mock de la section selon la période choisie sur le
  // sélecteur du DashboardHeader, cf. [[dashboard-mock-data-pending-laravel-api]]
  // — même date par défaut que l'ancien état local (2026-08-01).
  const seed = periodSeed(activeDate ?? new Date(2026, 7, 1));

  // "Taux de litige dans le temps" — vous (en baisse) vs réseau (stable),
  // même échelle AreaChart que le reste du dashboard (cf. shared.tsx). La
  // zone colorée entre les deux courbes = l'économie réalisée.
  const VOUS_TREND = [3.1, 2.6, 2.2, 1.9, 1.8, 1.7].map((v) => scaleForPeriod(v, seed, 0));
  const RESEAU_TREND = [3.1, 3.1, 3.1, 3.1, 3.1, 3.1].map((v) => scaleForPeriod(v, seed, 1));
  const MONTHS = [
    { fr: "Avril", en: "April" },
    { fr: "Mai", en: "May" },
    { fr: "Juin", en: "June" },
    { fr: "Juillet", en: "July" },
    { fr: "Août", en: "August" },
    { fr: "Sept.", en: "Sept." },
  ];

  // "Le respect des délais" — répartition des 26 litiges par tranche de
  // prise en main. Les deux dernières tranches (au-delà de 9 h, maximum
  // contractuel) ressortent en rouge.
  const HANDLING_BUCKETS = [
    { fr: "< 1 h", en: "< 1h", count: scaleForPeriod(8, seed, 2) },
    { fr: "1-3 h", en: "1-3h", count: scaleForPeriod(13, seed, 2) },
    { fr: "3-6 h", en: "3-6h", count: scaleForPeriod(3, seed, 2) },
    { fr: "6-9 h", en: "6-9h", count: scaleForPeriod(1, seed, 2) },
    { fr: "> 9 h", en: "> 9h", count: scaleForPeriod(1, seed, 2) },
  ];
  const maxBucket = Math.max(...HANDLING_BUCKETS.map((b) => b.count));

  // "Comment ils se terminent" — 26 litiges, 4 issues. Donut en
  // conic-gradient, même recette que le donut "Vos clients" de
  // CommandesSection.
  const OUTCOMES = [
    { fr: "Remplacement", en: "Replacement", count: scaleForPeriod(20, seed, 3), color: GREEN_CHART },
    { fr: "Remboursement", en: "Refund", count: scaleForPeriod(4, seed, 3), color: AMBER_CHART },
    { fr: "Geste commercial", en: "Goodwill gesture", count: scaleForPeriod(1, seed, 3), color: PURPLE_CHART },
    { fr: "Litige non fondé", en: "Dispute rejected", count: scaleForPeriod(1, seed, 3), color: GREY_CHART },
  ];
  let acc = 0;
  // Total recalculé (plutôt que le 26 d'origine) : les counts ci-dessus
  // varient désormais avec la période, le dégradé conique doit rester
  // cohérent avec leur somme réelle.
  const outcomesTotal = OUTCOMES.reduce((s, o) => s + o.count, 0);
  const outcomeStops = OUTCOMES.map((o) => {
    const start = (acc / outcomesTotal) * 100;
    acc += o.count;
    const end = (acc / outcomesTotal) * 100;
    return `${o.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`;
  }).join(", ");

  // "Ce qu'un litige fait au client, selon la vitesse de réponse" — part de
  // réachat par tranche de résolution, comparée au réachat sans litige
  // (18 %, trait de référence).
  const REPURCHASE = [
    { fr: "< 3 h", en: "< 3h", pct: scaleForPeriod(68, seed, 4), color: GREEN_CHART },
    { fr: "3-12 h", en: "3-12h", pct: scaleForPeriod(44, seed, 4), color: GREEN_CHART },
    { fr: "12-24 h", en: "12-24h", pct: scaleForPeriod(29, seed, 4), color: AMBER_CHART },
    { fr: "> 24 h", en: "> 24h", pct: scaleForPeriod(19, seed, 4), color: RED_CHART },
  ];
  // Recalculé (plutôt que le 68 d'origine) : suit désormais la valeur
  // scaleForPeriod la plus haute au lieu d'un maximum figé.
  const maxRepurchase = Math.max(...REPURCHASE.map((r) => r.pct));

  const flowMotifs = [
    { fr: "Produit abîmé à l'arrivée", en: "Product damaged on arrival", value: scaleForPeriod(14, seed, 6) },
    { fr: "Différent de l'annonce", en: "Different from the listing", value: scaleForPeriod(9, seed, 6) },
    { fr: "Article manquant", en: "Missing item", value: scaleForPeriod(3, seed, 6) },
  ];
  // motif/resp = index dans flowMotifs / flowResp. Répartition déduite du
  // texte de la carte plus bas (seule répartition qui rend les trois phrases
  // vraies à la fois — voir commentaire sur MotifResponsableSankey) :
  //   Produit abîmé (14)      = Emballage(7) + Manutention(5) + Défaut fab.(2)
  //   Différent de l'annonce(9) = Fiche catalogue(5) + Votre fiche(4)
  //   Article manquant (3)    = Erreur de préparation(3)
  const flowCauses = [
    { fr: "Emballage insuffisant", en: "Insufficient packaging", value: scaleForPeriod(7, seed, 7), color: RED_CHART, motif: 0, resp: 0 },
    { fr: "Manutention au transport", en: "Handling in transit", value: scaleForPeriod(5, seed, 7), color: AMBER_CHART, motif: 0, resp: 0 },
    { fr: "Fiche du catalogue partenaire", en: "Partner catalog listing", value: scaleForPeriod(5, seed, 7), color: PURPLE_CHART, motif: 1, resp: 0 },
    { fr: "Votre propre fiche", en: "Your own listing", value: scaleForPeriod(4, seed, 7), color: "#EC0C8C", motif: 1, resp: 1 },
    { fr: "Erreur de préparation", en: "Prep error", value: scaleForPeriod(3, seed, 7), color: "#5AA9FF", motif: 2, resp: 0 },
    { fr: "Défaut de fabrication", en: "Manufacturing defect", value: scaleForPeriod(2, seed, 7), color: GREY_CHART, motif: 0, resp: 2 },
  ];
  const flowResp = [
    { fr: "Le partenaire agréé", en: "The approved partner", value: scaleForPeriod(20, seed, 8), pct: "77 %", color: "#5AA9FF" },
    { fr: "Vous", en: "You", value: scaleForPeriod(4, seed, 8), pct: "15 %", color: "#EC0C8C" },
    { fr: "Le fournisseur", en: "The supplier", value: scaleForPeriod(2, seed, 8), pct: "8 %", color: AMBER_CHART },
  ];

  // "Exporter" : KPI de la période, issues des litiges et responsable réel.
  const [exportDone, setExportDone] = useState(false);
  function handleExport() {
    openBrandedReport(t("Litiges", "Disputes"), t("Un litige n'est pas un incident, c'est une information", "A dispute isn't an incident, it's information"), [
      {
        heading: t("Indicateurs de la période", "Period metrics"),
        columns: [t("Indicateur", "Metric"), t("Valeur", "Value"), t("Note", "Note")],
        rows: [
          [t("Taux de litige", "Dispute rate"), "1,7 %", t("réseau : 3,1 %", "network: 3.1%")],
          [t("Ouverts en ce moment", "Open right now"), "2", t("47 480 F suspendus", "47 480 F on hold")],
          [t("Prise en main moyenne", "Average handling time"), "2 h 40", t("maximum contractuel : 9 h", "contractual max: 9h")],
          [t("Résolution moyenne", "Average resolution"), "14 h", t("73 % sous 24 h", "73% under 24h")],
          [t("Coût moyen", "Average cost"), "3 400 F", t("course de reprise comprise", "return trip included")],
          [t("Votre délai de litige", "Your dispute window"), "72 h", t("minimum autorisé : 24 h", "minimum allowed: 24h")],
        ],
      },
      {
        heading: t("Comment ils se terminent (26 litiges)", "How they end (26 disputes)"),
        rows: OUTCOMES.map((o) => [t(o.fr, o.en), o.count]),
      },
      {
        heading: t("Responsable réel", "Actual party at fault"),
        rows: flowResp.map((r) => [t(r.fr, r.en), r.value, r.pct]),
      },
    ]);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  return (
    <>
      <SectionHeader
        eyebrow={t("Litiges", "Disputes")}
        title={t("Un litige n'est pas un incident, c'est une information", "A dispute isn't an incident, it's information")}
        subtitle={t(
          "Des litiges en cours jusqu'au responsable réel — et le plus souvent, une information sur votre partenaire.",
          "From open disputes to the real party at fault — and most often, information about your partner."
        )}
        first={first}
        layout="inline"
        actions={
          <>
            <HeaderActionBtn onClick={handleExport}>{exportDone ? t("Exporté", "Exported") : t("Exporter", "Export")}</HeaderActionBtn>
            <HeaderActionBtn>{t("Changer mon délai de litige", "Change my dispute window")}</HeaderActionBtn>
          </>
        }
      />

      {/* Légende : quelle couleur renvoie à quelle façon de vendre */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-glass)] px-4 py-3 text-[10px] text-[var(--dashboard-text)]/50 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
        <span className="flex items-center gap-1.5"><Nature code="S" /> {t("Stockage management", "Warehousing")}</span>
        <span className="flex items-center gap-1.5"><Nature code="D" /> {t("Dropshipping", "Drop-shipping")}</span>
        <span className="flex items-center gap-1.5"><Nature code="B" /> {t("Les deux", "Both")}</span>
        <span className="ml-auto">{t("La couleur dit à quelle façon de vendre le litige se rapporte.", "The color shows which way of selling the dispute relates to.")}</span>
      </div>

      {/* KPI de la période */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <KpiTile label={t("Taux de litige", "Dispute rate")} value="1,7 %" subColor={GREEN} sub={t("réseau : 3,1 %", "network: 3.1%")} />
        <KpiTile label={t("Ouverts en ce moment", "Open right now")} value="2" valueColor={AMBER} sub={t("47 480 F suspendus", "47 480 F on hold")} />
        <KpiTile label={t("Prise en main moyenne", "Average handling time")} value="2 h 40" valueColor={GREEN} sub={t("maximum contractuel : 9 h", "contractual max: 9h")} />
        <KpiTile label={t("Résolution moyenne", "Average resolution")} value="14 h" sub={t("73 % sous 24 h", "73% under 24h")} />
        <KpiTile label={t("Coût moyen", "Average cost")} value="3 400 F" valueColor={RED} sub={t("course de reprise comprise", "return trip included")} />
        <KpiTile label={t("Votre délai de litige", "Your dispute window")} value="72 h" sub={t("minimum autorisé : 24 h", "minimum allowed: 24h")} />
      </div>

      {/* 3 premiers blocs (litiges en cours, taux dans le temps, flux
          motif → cause → responsable) toujours visibles ; le reste passe
          sous "Voir tout le contenu" — cf. shared.tsx. */}
      <CollapsibleCards visibleCount={3}>
        {/* Les deux litiges en cours */}
        <Card className="mt-3 !bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Les deux litiges en cours", "The two open disputes")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">
                {t("Chaque heure compte : le compte à rebours du client tourne, et l'argent reste suspendu.", "Every hour counts: the customer's countdown is running, and the money stays on hold.")}
              </p>
            </div>
            <Tag tone="warn" className="shrink-0">{texteAvecChiffres(t("47 480 F bloqués", "47 480 F on hold"))}</Tag>
          </div>
          <div className="mt-3.5 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
            <DisputeCard
              code="S"
              id="C-4819"
              amount="19 140 F"
              motif={t("Article manquant", "Missing item")}
              since="12 h"
              sinceColor={AMBER}
              handled={t("Faite en 1 h 20", "Done in 1h20")}
              remaining="60 h"
              pct={scaleForPeriod(17, seed, 9)}
              pctColor="#5AA9FF"
              borderColor="#5AA9FF"
              note={t(
                "Le client dit avoir reçu un article au lieu de deux. Le partenaire a confirmé la préparation à deux articles. Une photo du colis reçu tranchera.",
                "The customer says they received one item instead of two. The partner confirmed the parcel was prepared with two. A photo of the received parcel will settle it."
              )}
            />
            <DisputeCard
              code="D"
              id="C-4816"
              amount="28 340 F"
              motif={t("Différent de l'annonce", "Different from the listing")}
              since={t("1 j", "1 day")}
              sinceColor={RED}
              handled={t("Faite en 3 h 10", "Done in 3h10")}
              remaining="48 h"
              remainingColor={RED}
              pct={scaleForPeriod(33, seed, 10)}
              pctColor={AMBER_CHART}
              borderColor="#EC0C8C"
              note={t(
                "Produit du catalogue partenaire. La couleur reçue ne correspond pas à la photo de la fiche. Le septième cas du même type, tous en dropshipping.",
                "Product from the partner catalog. The color received doesn't match the listing photo. The seventh case of this type, all drop-shipped."
              )}
            />
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
            {texteAvecChiffres(t(
              "Les deux ont été pris en main dans les délais. Au-delà de 24 heures de résolution, le réachat de ces clients tombe à 19 % : le second est déjà dans cette zone.",
              "Both were taken in hand on time. Past 24 hours of resolution, repurchase for these customers drops to 19%: the second is already in that zone."
            ))}
          </p>
        </Card>

        {/* Taux de litige dans le temps */}
        <Card className="mt-3 !bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Votre taux de litige dans le temps", "Your dispute rate over time")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Six derniers mois, comparé aux boutiques de votre catégorie", "Last six months, compared to shops in your category")}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--dashboard-text)]/60">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full" style={{ background: GREEN_CHART }} />{t("Vous", "You")}</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full bg-[#9096AA]" />{t("Réseau", "Network")}</span>
            </div>
          </div>
          <AreaChart values={VOUS_TREND} color={GREEN_CHART} compareValues={RESEAU_TREND} compareColor="#9096AA" gapColor={GREEN_CHART} glow grid />
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            {MONTHS.map((m) => (
              <span key={m.fr}>{t(m.fr, m.en)}</span>
            ))}
          </div>
          <Divider />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("Litiges cumulés", "Cumulative disputes")}</p>
              <p className="mt-1 text-base tracking-tight font-figures-bold">26</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{texteAvecChiffres(t("sur 1 480 livraisons", "of 1 480 deliveries"))}</p>
            </div>
            <div>
              <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("Il y a six mois", "Six months ago")}</p>
              <p className="mt-1 text-base tracking-tight font-figures-bold">3,1 %</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("au niveau du réseau", "at network level")}</p>
            </div>
            <div>
              <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("Aujourd'hui", "Today")}</p>
              <p className="mt-1 text-base tracking-tight font-figures-bold" style={{ color: GREEN }}>1,7 %</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("deux fois mieux", "twice as good")}</p>
            </div>
            <div>
              <p className="text-[9px] text-[var(--dashboard-text)]/40">{t("Économie réalisée", "Savings achieved")}</p>
              <p className="mt-1 text-base tracking-tight font-figures-bold" style={{ color: GREEN }}>71 400 F</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("sur six mois", "over six months")}</p>
            </div>
          </div>
          <Divider />
          <p className="text-xs font-semibold">{t("La baisse n'est pas un hasard, elle est datée", "The drop isn't luck, it's dated")}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
            {t(
              "La courbe décroche entre avril et juin, au moment où l'emballage a été renforcé sur les cosmétiques. Le réseau, lui, ne bouge pas. Le taux de litige est une variable de gestion et non une fatalité : il se pilote par des gestes précis, et chaque dixième de point gagné vaut environ 5 000 F par mois.",
              "The curve breaks between April and June, right when packaging was reinforced on cosmetics. The network, meanwhile, doesn't move. Dispute rate is a management variable, not a fate: it's steered by precise moves, and every tenth of a point gained is worth about 5 000 F a month."
            )}
          </p>
        </Card>

        {/* Du motif déclaré au responsable réel */}
        <Card className="mt-3 !bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Du motif déclaré au responsable réel", "From the stated reason to who's really at fault")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{texteAvecChiffres(t("Les 26 litiges depuis l'ouverture, ce que le client a dit jusqu'à qui devait l'éviter", "The 26 disputes since launch, from what the customer said to who should have avoided it"))}</p>
            </div>
            <Nature code="B" />
          </div>
          <MotifResponsableSankey motifs={flowMotifs} causes={flowCauses} resp={flowResp} />
          <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/60 p-4">
            <p className="text-xs font-semibold">{t("L'emballage n'est pas votre travail, c'est celui du partenaire", "Packaging isn't your job, it's the partner's")}</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
              {t(
                "Quatorze clients déclarent un produit abîmé et pensent au livreur. Sept fois sur quatorze, la cause est un emballage insuffisant — et l'emballage est compris dans les frais logistiques que vous payez à votre partenaire agréé. Vingt litiges sur vingt-six sont dans ce cas. Le seul poste dont vous êtes seul responsable, ce sont vos quatre fiches trop flatteuses.",
                "Fourteen customers report a damaged product and think of the courier. Seven times out of fourteen, the cause is insufficient packaging — and packaging is included in the logistics fee you pay your approved partner. Twenty of twenty-six disputes fall here. The only item you're solely responsible for is your own four overselling listings."
              )}
            </p>
          </div>
        </Card>

        {/* Ce que votre partenaire doit corriger */}
        <Card className="mt-3 !bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce que votre partenaire doit corriger", "What your partner needs to fix")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{texteAvecChiffres(t("20 litiges sur 26 relèvent de sa prestation. Voici le dossier, prêt à lui être envoyé.", "20 of 26 disputes fall on his side of the service. Here's the file, ready to send him."))}</p>
            </div>
            <Link
              href="/dashboard/partenaire-agree"
              className="shrink-0 rounded-full bg-[var(--dashboard-text)] px-4 py-2 text-[10px] font-semibold text-[var(--dashboard-bg)] transition hover:opacity-90"
            >
              {t("Envoyer ce relevé", "Send this report")}
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--dashboard-text)]/10">
                  {[t("Poste", "Item"), t("Litiges", "Disputes"), t("Coût pour vous", "Cost to you"), t("Sa moyenne réseau", "His network average"), t("Votre cas", "Your case")].map((h) => (
                    <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <PartnerRow poste={t("Emballage insuffisant", "Insufficient packaging")} litiges="7" cout="23 800 F" reseau="1,1 %" votreCas={t("2,8 % · deux fois pire", "2.8% · twice as bad")} votreCasColor={RED} bad />
                <PartnerRow poste={t("Manutention pendant le transport", "Handling in transit")} litiges="5" cout="17 000 F" reseau="0,9 %" votreCas="2,0 %" votreCasColor={AMBER} />
                <PartnerRow poste={t("Fiches de son catalogue inexactes", "Inaccurate catalog listings")} litiges="5" cout="17 000 F" reseau="1,4 %" votreCas="2,0 %" votreCasColor={AMBER} />
                <PartnerRow poste={t("Erreur de préparation du colis", "Parcel prep error")} litiges="3" cout="10 200 F" reseau="0,6 %" votreCas="1,2 %" />
                <PartnerRow poste={t("Total à sa charge", "Total on his side")} litiges="20" cout="68 000 F" reseau="—" votreCas="—" total />
              </tbody>
            </table>
          </div>
          <Divider />
          <p className="text-xs font-semibold">{t("L'emballage est compris dans les frais logistiques que vous payez", "Packaging is included in the logistics fee you pay")}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
            {texteAvecChiffres(t(
              "Le montant de ces frais est fixé par votre entreprise agréée, pas par LM. Quel que soit ce montant, l'emballage y est inclus. Sept litiges pour emballage insuffisant, dont trois sur la même référence textile, veulent dire qu'une prestation déjà payée n'a pas été rendue. 2,8 % contre 1,1 % de moyenne sur son réseau : ce n'est pas une fatalité du métier, c'est un écart. Le relevé ci-dessus contient les numéros de commande, les photos des clients et les dates — c'est ce qui transforme une plainte en demande.",
              "The amount of this fee is set by your approved company, not by LM. Whatever that amount, packaging is included in it. Seven disputes for insufficient packaging, three of them on the same textile item, mean a service already paid for wasn't delivered. 2.8% against a 1.1% average on his network: not a fact of the trade, a gap. The report above carries order numbers, customer photos and dates — that's what turns a complaint into a claim."
            ))}
          </p>
        </Card>

        {/* La vie d'un litige, heure par heure */}
        <Card className="mt-3 !bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("La vie d'un litige, heure par heure", "The life of a dispute, hour by hour")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Vos moyennes, et ce que chaque étape doit respecter", "Your averages, and what each step must respect")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-5">
            <TimelineStep
              time="0 h"
              dotColor={GREEN_CHART}
              title={t("Le client ouvre le litige", "The customer opens the dispute")}
              desc={t(
                "Il a 72 heures après la livraison pour le faire — c'est vous qui avez fixé ce délai, le minimum autorisé est de 24 heures. Sa part d'argent cesse de se libérer et le stock concerné se bloque.",
                "They have 72 hours after delivery — you set that window, the minimum allowed is 24 hours. Their share of the money stops releasing and the related stock is frozen."
              )}
              badges={[t("Votre délai : 72 h", "Your window: 72h"), t("Minimum : 24 h", "Minimum: 24h")]}
            />
            <TimelineStep
              time="2 h 40"
              timeNote={t("moyenne", "average")}
              dotColor={GREEN_CHART}
              title={t("Prise en main", "Handled")}
              desc={t(
                "Quelqu'un dit au client qu'on s'en occupe. Le maximum contractuel est de 9 heures, vous êtes à 2 h 40. 21 litiges sur 26 pris en main sous 3 heures, un seul a dépassé les 9 heures.",
                "Someone tells the customer it's being handled. The contractual max is 9 hours, you're at 2h40. 21 of 26 disputes handled within 3 hours, only one went past 9 hours."
              )}
              badges={[t("Vous : 2 h 40", "You: 2h40"), t("Maximum : 9 h", "Max: 9h"), t("Dépassements : 1", "Overruns: 1")]}
            />
            <TimelineStep
              time="3 h"
              timeNote={t("seuil clé", "key threshold")}
              dotColor={GREEN_CHART}
              titleColor={GREEN}
              title={t("La fenêtre qui décide du client", "The window that decides the customer")}
              desc={t(
                "Un litige résolu avant la 3e heure ramène 68 % des clients — presque quatre fois votre réachat habituel. Passé ce cap, chaque tranche d'heures en enlève une part.",
                "A dispute resolved before the 3rd hour brings back 68% of customers — nearly four times your usual repurchase rate. Past that mark, every hour bracket takes a share off."
              )}
              badges={[t("< 3 h : 68 % reviennent", "< 3h: 68% return")]}
            />
            <TimelineStep
              time="14 h"
              timeNote={t("moyenne", "average")}
              dotColor={AMBER_CHART}
              title={t("Résolution", "Resolution")}
              desc={t(
                "Remplacement dans 20 cas sur 26, remboursement dans 4. Un remplacement coûte 2 500 F, un remboursement 8 900 F : trois fois et demie plus, et le client repart sans son produit.",
                "Replacement in 20 of 26 cases, refund in 4. A replacement costs 2 500 F, a refund 8 900 F: three and a half times more, and the customer leaves without their product."
              )}
              badges={[t("Vous : 14 h", "You: 14h"), t("73 % sous 24 h", "73% under 24h")]}
            />
            <TimelineStep
              time="24 h"
              timeNote={t("point de rupture", "breaking point")}
              dotColor={RED_CHART}
              titleColor={RED}
              title={t("Au-delà, l'occasion est perdue", "Past this, the moment is lost")}
              desc={t(
                "Le réachat retombe à 19 %, le niveau d'un client qui n'a jamais eu de problème. Le litige n'a plus rien apporté : il a coûté sans rien construire.",
                "Repurchase falls back to 19%, the level of a customer who never had a problem. The dispute brought nothing more: it cost without building anything."
              )}
              badges={[t("> 24 h : 19 % reviennent", "> 24h: 19% return")]}
            />
            <TimelineStep
              time="72 h"
              dotColor="#9096AA"
              title={t("Fin du délai, l'argent se libère", "End of window, the money releases")}
              desc={t(
                "Sans litige ouvert, la part de la boutique devient disponible sans aucune démarche. Avec un litige non tranché, elle reste suspendue jusqu'à la décision.",
                "With no dispute open, the shop's share becomes available with no action needed. With an unresolved dispute, it stays on hold until a decision is made."
              )}
              badges={[]}
              last
            />
          </div>
        </Card>

        {/* Respect des délais + comment ils se terminent */}
        <div className="mt-3 grid items-start gap-3 lg:grid-cols-2 [&>*]:min-w-0">
          <Card
            title={t("Le respect des délais", "Meeting the deadlines")}
            titleTab
            titleAlign="left"
            badge={<Nature code="B" />}
            className="!bg-[var(--dashboard-glass)]"
          >
            <p className="-mt-3 mb-3 text-[10px] text-[var(--dashboard-text)]/50">
              {t("Le trait rose marque les neuf heures de prise en main maximum", "The pink line marks the nine-hour maximum handling time")}
            </p>
            <div className="relative flex h-24 items-end gap-2">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 border-l border-dashed border-brand-pink"
                style={{ left: `${(4 / HANDLING_BUCKETS.length) * 100}%` }}
              />
              {HANDLING_BUCKETS.map((b) => (
                <div key={b.fr} className="flex flex-1 flex-col justify-end" style={{ height: "100%" }}>
                  <div className="w-full rounded-t" style={{ height: `${Math.max((b.count / maxBucket) * 100, 6)}%`, background: GREEN_CHART }} />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex gap-2 text-[9px] text-[var(--dashboard-text)]/40">
              {HANDLING_BUCKETS.map((b) => (
                <span key={b.fr} className="flex-1 text-center">{texteAvecChiffres(t(b.fr, b.en))}</span>
              ))}
            </div>
            <Divider />
            <StatRow label={t("Pris en main sous 3 heures", "Handled within 3 hours")} value={<span style={{ color: GREEN }}>{texteAvecChiffres("21 sur 26")}</span>} />
            <StatRow label={t("Dépassements du maximum de 9 h", "Overruns of the 9h max")} value={<span className="font-figures" style={{ color: RED }}>1</span>} />
            <StatRow label={t("Résolus dans les 24 h", "Resolved within 24h")} value={texteAvecChiffres("19 sur 26 · 73 %")} bold={false} />
            <StatRow
              label={t("Délai le plus long", "Longest delay")}
              value={<span style={{ color: AMBER }}>{texteAvecChiffres(t("3 j · attente fournisseur", "3 days · waiting on supplier"))}</span>}
            />
            <StatRow label={t("Argent immobilisé pendant les litiges", "Money held during disputes")} value={texteAvecChiffres("14 h × 26 litiges")} bold={false} />
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
              {t(
                "Prendre un litige en main vite ne le résout pas, mais cela suffit souvent : dire au client qu'on s'en occupe dans l'heure change son comportement plus que la solution elle-même.",
                "Taking a dispute in hand fast doesn't resolve it, but it's often enough: telling the customer it's handled within the hour changes their behavior more than the fix itself."
              )}
            </p>
          </Card>

          <Card className="!bg-[var(--dashboard-glass)]">
            <p className="text-sm font-semibold">{t("Comment ils se terminent", "How they end")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{texteAvecChiffres(t("26 litiges, quatre issues possibles", "26 disputes, four possible outcomes"))}</p>
            <div className="mt-4 flex items-center gap-5">
              <div
                className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(${outcomeStops})` }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--dashboard-card-bg)] text-center">
                  <div>
                    <p className="text-base leading-none font-figures-bold">26</p>
                    <p className="mt-1 text-[8px] text-[var(--dashboard-text)]/40">{t("litiges", "disputes")}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {OUTCOMES.map((o) => (
                  <div key={o.fr} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-[var(--dashboard-text)]/70">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: o.color }} />
                      {t(o.fr, o.en)}
                    </span>
                    <span className="font-figures-bold">{o.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <Divider />
            <StatRow label={t("Coût d'un remplacement", "Cost of a replacement")} value={texteAvecChiffres("2 500 F")} bold={false} />
            <StatRow label={t("Coût d'un remboursement", "Cost of a refund")} value={<span className="font-figures" style={{ color: RED }}>8 900 F</span>} />
            <StatRow label={t("Coût total sur six mois", "Total cost over six months")} value={texteAvecChiffres("88 400 F")} bold={false} />
            <StatRow label={t("Marge perdue", "Margin lost")} value={<span className="font-figures" style={{ color: RED }}>47 200 F</span>} />
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
              {t(
                "Un remplacement coûte trois fois et demie moins qu'un remboursement, et garde le client. Le proposer en premier n'est pas une économie mesquine : c'est ce qui préserve la relation, parce que le client repart avec ce qu'il voulait.",
                "A replacement costs three and a half times less than a refund, and keeps the customer. Offering it first isn't a petty saving: it's what preserves the relationship, because the customer leaves with what they wanted."
              )}
            </p>
          </Card>
        </div>

        {/* Effet de la vitesse de réponse sur le réachat */}
        <Card className="mt-3 !bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce qu'un litige fait au client, selon la vitesse de réponse", "What a dispute does to the customer, depending on response speed")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{texteAvecChiffres(t("Part des clients qui rachètent après un litige, contre 18 % sans litige", "Share of customers who repurchase after a dispute, against 18% with no dispute"))}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.35fr] [&>*]:min-w-0">
            <div>
              <div className="relative flex h-32 gap-3 rounded-xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
                <span
                  className="pointer-events-none absolute left-3 right-3 border-t border-dashed"
                  style={{ bottom: `${(scaleForPeriod(18, seed, 5) / maxRepurchase) * 100}%`, borderColor: "var(--dashboard-text)", opacity: 0.3 }}
                />
                {REPURCHASE.map((r) => (
                  <div key={r.fr} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[10px] font-figures-bold">{r.pct} %</span>
                    <div className="w-full rounded-t" style={{ height: `${(r.pct / maxRepurchase) * 100}%`, background: r.color }} />
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex gap-3 text-[9px] text-[var(--dashboard-text)]/40">
                {REPURCHASE.map((r) => (
                  <span key={r.fr} className="flex-1 text-center">{texteAvecChiffres(t(r.fr, r.en))}</span>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between rounded-xl bg-[var(--dashboard-surface-2)] px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold">{texteAvecChiffres(t("Résolu en moins de 3 heures", "Resolved in under 3 hours"))}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Presque quatre fois votre réachat habituel.", "Nearly four times your usual repurchase rate.")}</p>
                </div>
                <span className="text-lg font-figures-bold" style={{ color: GREEN }}>68 %</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--dashboard-surface-2)] px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold">{texteAvecChiffres(t("Résolu entre 3 et 12 heures", "Resolved between 3 and 12 hours"))}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Encore largement au-dessus.", "Still well above.")}</p>
                </div>
                <span className="text-lg font-figures-bold" style={{ color: GREEN }}>44 %</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--dashboard-surface-2)] px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold">{texteAvecChiffres(t("Résolu entre 12 et 24 heures", "Resolved between 12 and 24 hours"))}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Le bénéfice s'efface.", "The benefit fades.")}</p>
                </div>
                <span className="text-lg font-figures-bold" style={{ color: AMBER }}>29 %</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--dashboard-surface-2)] px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold">{texteAvecChiffres(t("Résolu après 24 heures", "Resolved after 24 hours"))}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Au niveau d'un client sans histoire.", "At the level of a customer with no history.")}</p>
                </div>
                <span className="text-lg font-figures-bold" style={{ color: RED }}>19 %</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-dashed border-[var(--dashboard-text)]/15 px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold">{t("Aucun litige", "No dispute")}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Votre réachat de référence.", "Your baseline repurchase rate.")}</p>
                </div>
                <span className="text-lg font-bold">18 %</span>
              </div>
            </div>
          </div>
          <Divider />
          <p className="text-xs font-semibold">{t("Un litige réglé vite fidélise mieux qu'une commande sans problème", "A dispute solved fast builds more loyalty than a problem-free order")}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
            {t(
              "68 % contre 18 %. C'est le résultat le plus contre-intuitif du tableau de bord : un client dont le problème est réglé sous 3 heures a vu la boutique tenir sa parole sous pression, ce qu'une livraison normale ne prouve jamais. Un litige n'est donc pas un accident à minimiser, c'est le seul moment où vous pouvez démontrer quelque chose. Passé 24 heures, l'occasion est perdue et l'effet devient nul.",
              "68% against 18%. It's the most counter-intuitive result in the dashboard: a customer whose problem is solved within 3 hours saw the shop keep its word under pressure, something a normal delivery never proves. A dispute isn't an accident to minimize — it's the only moment you get to demonstrate something. Past 24 hours, the moment is lost and the effect becomes nil."
            )}
          </p>
        </Card>

        {/* Références à risque + stockage vs dropshipping */}
        <div className="mt-3 grid items-start gap-3 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
          <Card className="!bg-[var(--dashboard-glass)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{t("Les références qui posent problème", "The items causing trouble")}</p>
                <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Litiges rapportés au nombre de ventes de chaque référence", "Disputes relative to each item's number of sales")}</p>
              </div>
              <Nature code="B" />
            </div>
            <div className="mt-3.5 overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--dashboard-text)]/10">
                    {[t("Référence", "Item"), t("Ventes", "Sales"), t("Litiges", "Disputes"), t("Taux", "Rate"), t("Cause dominante", "Main cause")].map((h) => (
                      <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <RiskRow code="S" name={t("Ensemble lin deux pièces", "Linen two-piece set")} ventes={scaleForPeriod(12, seed, 11)} litiges={scaleForPeriod(3, seed, 12)} taux="25 %" taux_color={RED} cause={t("Emballage du partenaire", "Partner's packaging")} bad />
                  <RiskRow code="D" name={t("Sac cabas en raphia", "Raffia tote bag")} ventes={scaleForPeriod(24, seed, 11)} litiges={scaleForPeriod(4, seed, 12)} taux="17 %" taux_color={RED} cause={t("Fiche du partenaire", "Partner's listing")} bad />
                  <RiskRow code="D" name={t("Huile de ricin 100 ml", "Castor oil 100 ml")} ventes={scaleForPeriod(29, seed, 11)} litiges={scaleForPeriod(3, seed, 12)} taux="10 %" taux_color={AMBER} cause={t("Votre fiche", "Your own listing")} />
                  <RiskRow code="S" name={t("Beurre de karité 200 g", "Shea butter 200 g")} ventes={scaleForPeriod(33, seed, 11)} litiges={scaleForPeriod(2, seed, 12)} taux="6 %" taux_color={AMBER} cause={t("Emballage du partenaire", "Partner's packaging")} />
                  <RiskRow code="S" name={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} ventes={scaleForPeriod(41, seed, 11)} litiges={scaleForPeriod(0, seed, 12)} taux="0 %" taux_color={GREEN} cause={t("Aucun litige", "No dispute")} />
                </tbody>
              </table>
            </div>
            <Divider />
            <p className="text-xs font-semibold">{texteAvecChiffres(t("Deux références concentrent 7 litiges sur 26", "Two items account for 7 of 26 disputes"))}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
              {t(
                "L'ensemble en lin cumule tout : couverture qui recule, demande faible, et un quart de ses ventes en litige parce que le textile est plié dans un emballage qui ne lui convient pas. Ni le carton ni la photo ne sont de votre ressort ici : l'emballage relève du partenaire, la fiche du sac cabas aussi. Sur ces deux références, votre levier n'est pas de corriger vous-même, c'est d'exiger. Le sérum, votre plus grosse vente, n'a jamais eu un seul litige.",
                "The linen set has everything against it: shrinking coverage, weak demand, and a quarter of its sales in dispute because the fabric is folded in packaging that doesn't suit it. Neither the box nor the photo is on you here: packaging is on the partner, so is the tote bag's listing. On these two items, your lever isn't to fix it yourself, it's to demand better. The serum, your top seller, has never had a single dispute."
              )}
            </p>
          </Card>

          <Card className="!bg-[var(--dashboard-glass)]">
            <p className="text-sm font-semibold">{t("Litige en stock, litige en drop", "Dispute in stock, dispute in drop")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Deux problèmes qui n'ont presque rien en commun", "Two problems that have almost nothing in common")}</p>
            <div className="mt-3.5 grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
              <div className="rounded-xl border border-[#5AA9FF]/30 bg-[#5AA9FF]/5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold">{t("Sur votre stock", "On your own stock")}</p>
                  <Nature code="S" />
                </div>
                <div className="mt-2.5 space-y-1.5 text-[11px]">
                  <StatRow label={t("Litiges", "Disputes")} value={<span className="font-figures">14</span>} bold={false} />
                  <StatRow label={t("Taux de litige", "Dispute rate")} value={<span className="font-figures" style={{ color: GREEN }}>1,4 %</span>} />
                  <StatRow label={t("Cause dominante", "Main cause")} value={t("Emballage partenaire", "Partner packaging")} bold={false} />
                  <StatRow label={t("Résolution moyenne", "Average resolution")} value={<span className="font-figures" style={{ color: GREEN }}>9 h</span>} />
                  <StatRow label={t("Issue en remplacement", "Replacement outcome")} value={<span className="font-figures" style={{ color: GREEN }}>93 %</span>} />
                  <StatRow label={t("Marchandise récupérée", "Goods retrieved")} value={t("Oui", "Yes")} bold={false} />
                </div>
                <p className="mt-2.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                  {texteAvecChiffres(t("Vous avez la marchandise chez le partenaire, il remplace le jour même. Le problème est physique et se corrige avec un meilleur emballage — de son côté.", "You have the goods at the partner's, he replaces the same day. The problem is physical and gets fixed with better packaging — on his side."))}
                </p>
              </div>
              <div className="rounded-xl border border-[#EC0C8C]/30 bg-[#EC0C8C]/5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold">{t("Sur le stock du partenaire", "On the partner's stock")}</p>
                  <Nature code="D" />
                </div>
                <div className="mt-2.5 space-y-1.5 text-[11px]">
                  <StatRow label={t("Litiges", "Disputes")} value={<span className="font-figures">12</span>} bold={false} />
                  <StatRow label={t("Taux de litige", "Dispute rate")} value={<span className="font-figures" style={{ color: RED }}>2,6 %</span>} />
                  <StatRow label={t("Cause dominante", "Main cause")} value={t("Fiche inexacte", "Inaccurate listing")} bold={false} />
                  <StatRow label={t("Résolution moyenne", "Average resolution")} value={<span className="font-figures" style={{ color: AMBER }}>21 h</span>} />
                  <StatRow label={t("Issue en remplacement", "Replacement outcome")} value={<span className="font-figures" style={{ color: AMBER }}>58 %</span>} />
                  <StatRow label={t("Marchandise récupérée", "Goods retrieved")} value={t("Par le partenaire", "By the partner")} bold={false} />
                </div>
                <p className="mt-2.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                  {texteAvecChiffres(t("Vous dépendez du partenaire pour vérifier et remplacer, d'où deux fois plus de temps. Le problème est descriptif et se corrige avant la vente.", "You depend on the partner to verify and replace, hence twice the time. The problem is descriptive and gets fixed before the sale."))}
                </p>
              </div>
            </div>
            <div className="mt-3.5 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] p-3.5">
              <p className="text-xs font-semibold">{t("Le drop double votre taux de litige, mais pour une raison entièrement évitable", "Drop-shipping doubles your dispute rate, for an entirely avoidable reason")}</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t(
                  "2,6 % contre 1,4 %. Ce n'est pas que les produits du partenaire soient moins bons : c'est qu'ils sont vendus sur la foi de fiches que personne n'a vérifiées. La responsabilité de la fiche inexacte est la sienne, mais le geste préventif est le vôtre : dix minutes de lecture avant d'activer une fiche évitent un litige à 3 400 F.",
                  "2.6% against 1.4%. It's not that the partner's products are worse: it's that they're sold on the strength of listings nobody checked. The inaccurate listing is on him, but the preventive move is on you: ten minutes reading before activating a listing avoids a 3 400 F dispute."
                ))}
              </p>
            </div>
          </Card>
        </div>

        {/* Actions recommandées */}
        <Card className="mt-3 !bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce qui réduirait vos litiges, classé par effet", "What would cut your disputes, ranked by impact")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Chaque ligne chiffre ce qu'elle éviterait sur six mois", "Each line quantifies what it would avoid over six months")}</p>
            </div>
            <Tag tone="warn" className="shrink-0">{texteAvecChiffres(t("6 actions", "6 actions"))}</Tag>
          </div>
          <div>
            <ActionItem
              tone="ko"
              code="B"
              title={t("Porter le relevé d'emballage à votre partenaire", "Bring the packaging report to your partner")}
              desc={t("7 litiges, 23 800 F, et 2,8 % contre 1,1 % sur son réseau. L'emballage est compris dans les frais logistiques que vous payez : le relevé est prêt.", "7 disputes, 23 800 F, and 2.8% against 1.1% on his network. Packaging is included in the fee you pay: the report is ready.")}
              cta={t("Envoyer le relevé", "Send the report")}
              href="/dashboard/partenaire-agree"
            />
            <ActionItem
              tone="ko"
              code="S"
              title={t("Corriger vos quatre fiches trop flatteuses", "Fix your four overselling listings")}
              desc={t("Le seul poste dont vous êtes seul responsable. 4 litiges, 13 600 F, parce que la photo promet plus que le produit.", "The only item you're solely responsible for. 4 disputes, 13 600 F, because the photo promises more than the product.")}
              cta={t("Voir les fiches", "View listings")}
              href="/dashboard/produits"
            />
            <ActionItem
              tone="warn"
              code="D"
              title={t("Relire les fiches du partenaire avant de les activer", "Reread the partner's listings before activating them")}
              desc={t("5 litiges viennent de son catalogue. La faute est la sienne, la prévention est la vôtre : dix minutes de lecture par fiche.", "5 disputes come from his catalog. The fault is his, the prevention is yours: ten minutes of reading per listing.")}
              cta={t("Voir les 11 fiches", "View the 11 listings")}
              href="/dashboard/produits"
            />
            <ActionItem
              tone="warn"
              code="D"
              title={t("Répondre au litige C-4816 avant la 24e heure", "Answer dispute C-4816 before the 24th hour")}
              desc={t("Ouvert depuis 1 jour. Encore dans la fenêtre où le client peut revenir : à 24 h, le réachat passe de 29 à 19 %.", "Open for 1 day. Still in the window where the customer can come back: at 24h, repurchase drops from 29 to 19%.")}
              cta={t("Traiter", "Handle")}
              href="/dashboard/commandes?tab=commandes"
            />
            <ActionItem
              tone="info"
              code="S"
              title={t("Réclamer les deux défauts de fabrication au fournisseur", "Claim the two manufacturing defects from the supplier")}
              desc={t("12 800 F récupérables. La fenêtre de réclamation se ferme 15 jours après réception.", "12 800 F recoverable. The claim window closes 15 days after receipt.")}
              cta={t("Réclamer", "Claim")}
            />
            <ActionItem
              tone="info"
              code="S"
              title={t("Signaler au partenaire la casse de Bouaké", "Report the Bouaké breakage to your partner")}
              desc={t("3,2 % contre 0,8 % à Cocody. 5 litiges liés au transfert entre sites.", "3.2% against 0.8% in Cocody. 5 disputes tied to the transfer between sites.")}
              cta={t("Écrire", "Write")}
              href="/dashboard/partenaire-agree"
            />
          </div>
        </Card>
      </CollapsibleCards>
    </>
  );
}
