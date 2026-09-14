"use client";

import { useId, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag } from "../shared";
import { CLIENTS_SURVEILLANCE, TypeAchat } from "./clientsData";

export default function ClientsReliabilityRetention({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();

  return (
    <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
      {/* ── CARTE GAUCHE : Quand ils reviennent (STYLE INDICE FINANCIER S&P 500 / MARKET INDEX) ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          {/* En-tête avec titre et badge statut */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                  {t("Quand ils reviennent", "When they return")}
                </h3>
              </div>
              <p className="text-[10px] text-[var(--dashboard-text)]/45 mt-0.5">
                {t(
                  "Distribution temporelle des 2èmes achats après la 1ère commande",
                  "Second order distribution timeline after 1st order"
                )}
              </p>
            </div>
            <span className="rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-2 py-0.5 text-[9px] font-semibold text-[#10b981]">
              {t("Fenêtre utile J20–J50", "Golden window D20–D50")}
            </span>
          </div>

          {/* Bandeau de cotation type S&P 500 / Rolex Market Index */}
          <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--dashboard-text)]/10 pb-3">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[var(--dashboard-text)]">
                34 <span className="text-xs font-sans font-medium text-[var(--dashboard-text)]/50">{t("jours", "days")}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[10px] font-bold font-mono text-[#10b981]">
                ↑ 78,4 % {t("en fenêtre utile", "in golden window")}
              </span>
              <span className="text-[11px] font-mono text-[var(--dashboard-text)]/45 hidden sm:inline">
                {t("Délai moyen constaté", "Observed median")}
              </span>
            </div>

            {/* Commutateurs de période type S&P 500 (1D, 1M, 1Y, 5Y...) */}
            <div className="flex items-center gap-1 rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-0.5 text-[10px] font-medium">
              <button
                type="button"
                className="rounded px-2 py-0.5 text-[var(--dashboard-text)]/50 hover:text-[var(--dashboard-text)]"
              >
                J30
              </button>
              <button
                type="button"
                className="rounded px-2 py-0.5 text-[var(--dashboard-text)]/50 hover:text-[var(--dashboard-text)]"
              >
                J60
              </button>
              <button
                type="button"
                className="rounded bg-[var(--dashboard-card-bg)] px-2 py-0.5 font-bold text-[var(--dashboard-text)] shadow-xs"
              >
                J90
              </button>
            </div>
          </div>

          {/* ── ZONE GRAPHIQUE STYLE S&P 500 AVEC GRADUATIONS Y & DÉGRADÉ VERT ÉMERAUDE ── */}
          <RetentionIndexChart />

          {/* Métriques clés */}
          <div className="mt-4 space-y-1.5 border-t border-[var(--dashboard-text)]/10 pt-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Délai moyen avant le deuxième achat", "Average delay before 2nd order")}
              </span>
              <span className="font-semibold font-mono">34 {t("jours", "days")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Meilleur moment pour relancer", "Optimal re-engagement timing")}
              </span>
              <span className="font-bold text-[#10b981] font-mono">
                {t("Jour 28 (Avant le sommet)", "Day 28 (Before peak)")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Après 75 jours sans achat", "After 75 days without order")}
              </span>
              <span className="font-bold text-[#f43f5e] font-mono">
                {t("3 % reviennent (zone dormante)", "3% return (dormant)")}
              </span>
            </div>
          </div>
        </div>

        {/* Note stratégique */}
        <p className="mt-3 text-[10px] leading-relaxed text-[var(--dashboard-text)]/45">
          {t(
            "La cloche est nette : presque tous les deuxièmes achats se font entre le vingtième et le cinquantième jour. Relancer au jour vingt-huit tombe juste avant le sommet, au moment où l'envie existe mais où le geste n'est pas encore fait. Relancer au jour soixante-quinze ne sert plus à rien.",
            "The bell curve is crystal clear: almost all repeat orders occur between day 20 and day 50. Triggering a campaign at day 28 hits the sweet spot right before the peak, while the desire is alive but the purchase has not yet been executed. Reaching out after day 75 has almost zero effectiveness."
          )}
        </p>
      </div>

      {/* ── CARTE DROITE : La fiabilité de vos clients ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("La fiabilité de vos clients", "Customer delivery reliability")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/45">
                {t(
                  "Tous ne se comportent pas de la même façon au téléphone et à la porte",
                  "Customer behavior varies drastically at phone confirmation and delivery door"
                )}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* 3 Blocs de taux empilés */}
          <div className="mt-4 space-y-2">
            {/* Clients déjà venus */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[#10b981] sm:text-2xl">97 %</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--dashboard-text)]">
                    {t("Clients déjà venus", "Returning customers")}
                  </h4>
                  <p className="text-[10px] text-[var(--dashboard-text)]/45">
                    {t("Taux de livraison. Ils savent que le colis arrive.", "Delivery success rate. They expect the parcel.")}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[var(--dashboard-text)]/60">
                {t("22 clients", "22 customers")}
              </span>
            </div>

            {/* Premier achat */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[var(--dashboard-text)] sm:text-2xl">80 %</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--dashboard-text)]">
                    {t("Premier achat", "First-time buyers")}
                  </h4>
                  <p className="text-[10px] text-[var(--dashboard-text)]/45">
                    {t("Taux de livraison. La moyenne de la boutique.", "Delivery rate. Storewide average benchmark.")}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[var(--dashboard-text)]/60">
                {t("99 clients", "99 customers")}
              </span>
            </div>

            {/* Clients à surveiller */}
            <div className="flex items-center justify-between rounded-xl border border-[#f43f5e]/20 bg-[#f43f5e]/5 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[#f43f5e] sm:text-2xl">34 %</span>
                <div>
                  <h4 className="text-xs font-semibold text-[#f43f5e]">
                    {t("Clients à surveiller", "High-risk accounts")}
                  </h4>
                  <p className="text-[10px] text-[var(--dashboard-text)]/45">
                    {t("Deux refus ou plus à leur actif.", "Two or more failed delivery refusals on record.")}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#f43f5e]">
                {t("6 clients", "6 customers")}
              </span>
            </div>
          </div>

          {/* Tableau des clients à surveiller */}
          <div className="mt-3.5 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[var(--dashboard-text)]/10 text-[8px] uppercase tracking-wider text-[var(--dashboard-text)]/40">
                  <th className="pb-1.5">{t("CLIENT", "CUSTOMER")}</th>
                  <th className="pb-1.5 text-center">{t("COMMANDES", "ORDERS")}</th>
                  <th className="pb-1.5 text-center text-[#f43f5e]">{t("REFUS", "REFUSALS")}</th>
                  <th className="pb-1.5">{t("DERNIER MOTIF", "LATEST REASON")}</th>
                  <th className="pb-1.5 text-right">{t("ACTION", "ACTION")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dashboard-text)]/5">
                {CLIENTS_SURVEILLANCE.map((cli) => (
                  <tr key={cli.numero}>
                    <td className="py-2 font-medium">{cli.numero}</td>
                    <td className="py-2 text-center font-semibold">{cli.commandes}</td>
                    <td className="py-2 text-center font-bold text-[#f43f5e]">{cli.refus}</td>
                    <td className="py-2 text-[10px] text-[var(--dashboard-text)]/55">
                      {t(cli.dernierMotifFr, cli.dernierMotifEn)}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          cli.actionTone === "danger"
                            ? "bg-[#f43f5e]/15 text-[#f43f5e]"
                            : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/65"
                        }`}
                      >
                        {t(cli.actionFr, cli.actionEn)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
            {t(
              "Un client qui a déjà reçu un colis se livre à quatre-vingt-dix-sept pour cent",
              "A customer with one delivered order reaches 97% delivery success"
            )}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Dix-sept points au-dessus d'un nouveau. C'est l'argument financier le plus fort de cet écran : faire revenir un client ne rapporte pas seulement un panier plus gros, cela supprime presque le risque de refus. À l'inverse, six numéros cumulent deux refus ou plus. Ils ne sont pas à exclure : leur proposer le paiement immédiat au lieu du paiement à la livraison permet de continuer à les servir sans payer de course perdue.",
              "17 percentage points above a first-time shopper. This is the single strongest financial argument: retaining customers doesn't just increase basket sizes, it virtually eliminates expensive delivery cancellations. Conversely, 6 phone numbers have 2+ refusals. Do not block them outright: requiring advance prepayment rather than Cash on Delivery allows you to keep capturing sales without absorbing wasted courier fees."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── COMPOSANT GRAPHIQUE INSPIRÉ DU DESIGN S&P 500 & ROLEX MARKET INDEX ──
function RetentionIndexChart() {
  const { t } = useDashboardLangue();
  const uid = useId();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Distribution temporelle des réachats sur 90 jours
  const data = [
    { day: 0, pct: 2, descFr: "1er achat", descEn: "1st order" },
    { day: 7, pct: 4, descFr: "Découverte", descEn: "Discovery" },
    { day: 14, pct: 8, descFr: "Usage produit", descEn: "Product use" },
    { day: 20, pct: 19, descFr: "Début fenêtre d'or", descEn: "Window start", isWindowStart: true },
    { day: 24, pct: 28, descFr: "Réapprovisionnement", descEn: "Replenishment" },
    { day: 28, pct: 38, descFr: "Relance optimale", descEn: "Optimal outreach", isRelance: true },
    { day: 31, pct: 42, descFr: "Forte intensité", descEn: "High intensity" },
    { day: 34, pct: 44, descFr: "Pic maximal (sommet)", descEn: "Peak orders", isPeak: true },
    { day: 38, pct: 39, descFr: "Phase haute", descEn: "High phase" },
    { day: 42, pct: 30, descFr: "Décélération", descEn: "Deceleration" },
    { day: 50, pct: 18, descFr: "Fin fenêtre utile", descEn: "Window end", isWindowEnd: true },
    { day: 60, pct: 10, descFr: "Refroidissement", descEn: "Cooling off" },
    { day: 70, pct: 5, descFr: "Signal faible", descEn: "Weak signal" },
    { day: 75, pct: 3, descFr: "Seuil critique 3%", descEn: "Critical 3% threshold", isCritical: true },
    { day: 82, pct: 2, descFr: "Dormant", descEn: "Dormant" },
    { day: 90, pct: 1.5, descFr: "Perdu sans action", descEn: "Lost without action" },
  ];

  const width = 500;
  const height = 160;
  const padLeft = 32;
  const padRight = 24;
  const padTop = 18;
  const padBottom = 26;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const maxDay = 90;
  const maxVal = 50;

  const points = data.map((d, idx) => {
    const x = padLeft + (d.day / maxDay) * chartW;
    const y = padTop + chartH - (d.pct / maxVal) * chartH;
    return { ...d, idx, x, y };
  });

  // Construction spline Bézier
  let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;
    const cp1x = p1.x + (p2.x - p0.x) / 4.2;
    const cp1y = p1.y + (p2.y - p0.y) / 4.2;
    const cp2x = p2.x - (p3.x - p1.x) / 4.2;
    const cp2y = p2.y - (p3.y - p1.y) / 4.2;
    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`;

  // Coordonnées de la fenêtre utile J20 - J50
  const xWindowStart = padLeft + (20 / maxDay) * chartW;
  const xWindowEnd = padLeft + (50 / maxDay) * chartW;
  const peakPoint = points.find((p) => p.isPeak) ?? points[7];
  const relancePoint = points.find((p) => p.isRelance) ?? points[5];

  // Point actif
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : peakPoint;

  return (
    <div className="relative mt-4 w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-36 sm:h-44 overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          {/* Dégradé vertical vert émeraude inspiré du S&P 500 */}
          <linearGradient id={`sp500-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.34} />
            <stop offset="65%" stopColor="#10b981" stopOpacity={0.06} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
          </linearGradient>

          {/* Dégradé de la fenêtre utile J20-J50 */}
          <linearGradient id={`sp500-window-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>

          {/* Lueur de crête */}
          <filter id={`sp500-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── GRADUATIONS D'ÉCHELLE Y TYPE S&P 500 À GAUCHE ── */}
        {[10, 20, 30, 40].map((val) => {
          const y = padTop + chartH - (val / maxVal) * chartH;
          return (
            <g key={val}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="var(--dashboard-text)"
                strokeOpacity={0.06}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--dashboard-text)]/35 text-[8px] font-mono select-none"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* ── ZONE SURLIGNÉE : FENÊTRE UTILE J20–J50 ── */}
        <rect
          x={xWindowStart}
          y={padTop}
          width={xWindowEnd - xWindowStart}
          height={chartH}
          fill={`url(#sp500-window-${uid})`}
          stroke="#10b981"
          strokeOpacity={0.25}
          strokeWidth={1}
          strokeDasharray="3 3"
          rx={3}
        />
        <text
          x={(xWindowStart + xWindowEnd) / 2}
          y={padTop + 10}
          textAnchor="middle"
          className="fill-[#10b981] text-[7.5px] font-mono font-bold tracking-wider uppercase select-none opacity-80"
        >
          {t("FENÊTRE D'OR (78% DES 2ES ACHATS)", "GOLDEN WINDOW (78% REPEAT)")}
        </text>

        {/* ── AIRE SOUS LA COURBE VERT ÉMERAUDE ── */}
        <path d={areaPath} fill={`url(#sp500-area-${uid})`} />

        {/* ── COURBE PRINCIPALE INDICE S&P 500 ── */}
        <path
          d={linePath}
          fill="none"
          stroke="#10b981"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#sp500-glow-${uid})`}
        />

        {/* ── MARQUEUR RELANCE OPTIMALE (JOUR 28) ── */}
        <g>
          <line
            x1={relancePoint.x}
            y1={relancePoint.y}
            x2={relancePoint.x}
            y2={height - padBottom}
            stroke="#10b981"
            strokeOpacity={0.4}
            strokeDasharray="2 2"
            strokeWidth={1}
          />
          <circle cx={relancePoint.x} cy={relancePoint.y} r={3} fill="#10b981" />
          <g transform={`translate(${relancePoint.x - 28}, ${relancePoint.y - 12})`}>
            <rect x={0} y={-6} width={56} height={12} rx={3} fill="#10b981" fillOpacity={0.15} stroke="#10b981" strokeWidth={0.8} />
            <text x={28} y={3} textAnchor="middle" fill="#10b981" className="text-[7px] font-mono font-bold select-none">
              RELANCE J28
            </text>
          </g>
        </g>

        {/* ── BADGE ROLEX MARKET INDEX AU SOMMET DU PIC (JOUR 34) ── */}
        <g>
          <circle cx={peakPoint.x} cy={peakPoint.y} r={9} fill="#10b981" fillOpacity={0.2} className="animate-ping" />
          <circle cx={peakPoint.x} cy={peakPoint.y} r={4.5} fill="#10b981" />
          <circle cx={peakPoint.x} cy={peakPoint.y} r={2} fill="#ffffff" />

          {/* Badge façon WatchCharts Rolex Market Index */}
          <g transform={`translate(${peakPoint.x + 8}, ${peakPoint.y - 8})`}>
            <rect x={0} y={-8} width={64} height={16} rx={3.5} fill="#10b981" className="shadow-md" />
            <text x={32} y={3.5} textAnchor="middle" fill="#ffffff" className="text-[8px] font-mono font-bold select-none">
              PIC · 34j (44%)
            </text>
          </g>
        </g>

        {/* ── POINT ACTIF INTERACTIF AU SURVOL ── */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={height - padBottom}
              stroke="var(--dashboard-text)"
              strokeOpacity={0.3}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={5}
              fill="var(--dashboard-card-bg)"
              stroke="#10b981"
              strokeWidth={2}
            />

            {/* Bulle d'information flottante */}
            {hoveredIdx !== null && (
              (() => {
                const tipW = 88;
                const tipH = 40;
                const isRight = activePoint.x > width - padRight - tipW - 10;
                const tipX = isRight ? activePoint.x - tipW - 8 : activePoint.x + 8;
                const tipY = Math.max(padTop, activePoint.y - 25);

                return (
                  <g transform={`translate(${tipX}, ${tipY})`}>
                    <rect
                      x={0}
                      y={0}
                      width={tipW}
                      height={tipH}
                      rx={6}
                      fill="var(--dashboard-card-bg)"
                      stroke="var(--dashboard-text)"
                      strokeOpacity={0.15}
                      strokeWidth={1}
                      className="shadow-lg"
                    />
                    <text x={8} y={14} className="fill-[var(--dashboard-text)] text-[9px] font-bold font-mono select-none">
                      Jour {activePoint.day} ({activePoint.pct}%)
                    </text>
                    <text x={8} y={28} className="fill-[var(--dashboard-text)]/60 text-[8px] font-sans select-none">
                      {t(activePoint.descFr, activePoint.descEn)}
                    </text>
                  </g>
                );
              })()
            )}
          </g>
        )}

        {/* ── LIGNE DE BASE HORIZONTALE TYPE S&P 500 ── */}
        <line
          x1={padLeft}
          y1={height - padBottom}
          x2={width - padRight}
          y2={height - padBottom}
          stroke="var(--dashboard-text)"
          strokeOpacity={0.12}
          strokeWidth={1}
        />

        {/* ── AXE X : JALONS TEMPORELS TYPE GOOGLE FINANCE ── */}
        {[
          { day: 0, label: "0 j" },
          { day: 14, label: "14 j" },
          { day: 28, label: "28 j" },
          { day: 34, label: "34 j (Pic)" },
          { day: 50, label: "50 j" },
          { day: 75, label: "75 j" },
          { day: 90, label: "90 j" },
        ].map((tick) => {
          const x = padLeft + (tick.day / maxDay) * chartW;
          const isHighlight = tick.day === 34 || tick.day === 28;

          return (
            <g key={tick.day}>
              <line
                x1={x}
                y1={height - padBottom}
                x2={x}
                y2={height - padBottom + 4}
                stroke="var(--dashboard-text)"
                strokeOpacity={0.2}
                strokeWidth={1}
              />
              <text
                x={x}
                y={height - padBottom + 13}
                textAnchor="middle"
                className={`text-[8px] font-mono transition-colors select-none ${
                  isHighlight ? "fill-[#10b981] font-bold" : "fill-[var(--dashboard-text)]/40"
                }`}
              >
                {tick.label}
              </text>
            </g>
          );
        })}

        {/* ── ZONES DE DÉTECTION SOURIS (SLICES) ── */}
        {points.map((p, idx) => {
          const sliceW = chartW / points.length;
          return (
            <rect
              key={`slice-${p.day}`}
              x={p.x - sliceW / 2}
              y={0}
              width={sliceW}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(idx)}
              className="cursor-crosshair"
            />
          );
        })}
      </svg>
    </div>
  );
}

