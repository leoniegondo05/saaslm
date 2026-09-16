"use client";

import { useId, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { texteAvecChiffres } from "../shared";
import { CROISSANCE_SEMAINES } from "./clientsData";

export default function ClientsGrowthChart() {
  const { t } = useDashboardLangue();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"hebdo" | "cumule">("hebdo");

  const uid = useId();

  // Dimensions SVG avec marges fines et compactes (marge minimale)
  const width = 1000;
  const height = 220;
  const padLeft = 16;
  const padRight = 24;
  const padTop = 18;
  const padBottom = 26;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Calcul des données hebdomadaires vs cumulées
  let cumNouveaux = 0;
  let cumReviennent = 0;
  const cumuleData = CROISSANCE_SEMAINES.map((item) => {
    cumNouveaux += item.nouveaux;
    cumReviennent += item.reviennent;
    return {
      semaine: item.semaine,
      nouveaux: cumNouveaux,
      reviennent: cumReviennent,
    };
  });

  const activeDataset = activeTab === "hebdo" ? CROISSANCE_SEMAINES : cumuleData;

  // Valeur Max pour l'échelle Y
  const totals = activeDataset.map((d) => d.nouveaux + d.reviennent);
  const maxVal = Math.max(...totals, 10);
  const maxY = Math.ceil(maxVal * 1.12);

  // Calcul des coordonnées avec marge de respiration à gauche et droite
  const count = activeDataset.length;
  const points = activeDataset.map((item, idx) => {
    const total = item.nouveaux + item.reviennent;
    const x = padLeft + (idx / (count - 1)) * chartW;
    const y = padTop + chartH - (total / maxY) * chartH;
    const yReviennent = padTop + chartH - (item.reviennent / maxY) * chartH;
    const ratio = Math.round((item.reviennent / (total || 1)) * 100);

    return {
      ...item,
      idx,
      total,
      x,
      y,
      yReviennent,
      ratio,
    };
  });

  // Construction d'une courbe spline Bézier continue
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`;

  // Point actif (au survol ou dernier par défaut)
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  // Variations et extrêmes
  const firstTotal = points[0].total;
  const currentTotal = activePoint.total;
  const deltaPct = Math.round(((currentTotal - firstTotal) / (firstTotal || 1)) * 100);
  const peakPoint = points.reduce((max, p) => (p.total > max.total ? p : max), points[0]);

  return (
    <div className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] shadow-[0_8px_24px_-6px_rgba(20,18,32,0.12)] transition-colors overflow-hidden">
      {/* ── BANDEAU STYLE TRADING APP (HUD HEADER) ── */}
      <div className="p-4 sm:p-5 border-b border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--dashboard-text)]/60">
                {t("CROISSANCE DU FICHIER CLIENT", "CUSTOMER BASE GROWTH")}
              </h3>
              <span className="rounded bg-[var(--dashboard-text)]/[0.06] px-1.5 py-0.5 text-[9px] font-figures text-[var(--dashboard-text)]/50">
                LIVE · 12W
              </span>
            </div>

            {/* Chiffre vedette dynamique type cours de bourse */}
            <div className="mt-1.5 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold font-figures tracking-tight text-[var(--dashboard-text)]">
                {activePoint.total}{" "}
                <span className="text-sm font-sans font-medium text-[var(--dashboard-text)]/50">
                  {t("clients", "customers")}
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold font-figures ${
                  deltaPct >= 0
                    ? "bg-[#10b981]/15 text-[#10b981]"
                    : "bg-[#f43f5e]/15 text-[#f43f5e]"
                }`}
              >
                {deltaPct >= 0 ? "+" : ""}
                {deltaPct} %
              </span>
              <span className="text-[11px] font-figures text-[var(--dashboard-text)]/40 hidden sm:inline">
                {activePoint.semaine}
              </span>
            </div>
          </div>

          {/* HUD Metrics en temps réel & Sélecteur de vue */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* HUD Stats */}
            <div className="flex items-center gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)]/80 px-3 py-1.5 text-[11px] shadow-xs backdrop-blur-md">
              <div>
                <span className="text-[9px] text-[var(--dashboard-text)]/40 block">
                  {t("REVIENNENT", "RETURNING")}
                </span>
                <span className="font-bold font-figures text-[#10b981]">+{activePoint.reviennent}</span>
              </div>
              <div className="h-6 w-px bg-[var(--dashboard-text)]/10" />
              <div>
                <span className="text-[9px] text-[var(--dashboard-text)]/40 block">
                  {t("NOUVEAUX", "NEW")}
                </span>
                <span className="font-bold font-figures text-[#38bdf8]">+{activePoint.nouveaux}</span>
              </div>
              <div className="h-6 w-px bg-[var(--dashboard-text)]/10" />
              <div>
                <span className="text-[9px] text-[var(--dashboard-text)]/40 block">
                  {t("RATIO", "RATIO")}
                </span>
                <span className="font-bold font-figures text-[var(--dashboard-text)]">{activePoint.ratio}%</span>
              </div>
            </div>

            {/* Timeframe switch */}
            <div className="flex rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/50 p-1 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("hebdo")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeTab === "hebdo"
                    ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-xs font-bold"
                    : "text-[var(--dashboard-text)]/50 hover:text-[var(--dashboard-text)]"
                }`}
              >
                {t("Hebdo", "Weekly")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cumule")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeTab === "cumule"
                    ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-xs font-bold"
                    : "text-[var(--dashboard-text)]/50 hover:text-[var(--dashboard-text)]"
                }`}
              >
                {t("Cumulé", "Cumulative")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ZONE GRAPHIQUE AVEC MARGES FINES ET ÉLÉGANTES (STYLE TRADING PRO) ── */}
      <div className="relative w-full px-2.5 sm:px-4 py-2 bg-[var(--dashboard-card-bg)] cursor-crosshair select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-52 sm:h-60 overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Dégradé Trading Vert Néon (Area Fill) */}
            <linearGradient id={`trading-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.38} />
              <stop offset="35%" stopColor="#10b981" stopOpacity={0.18} />
              <stop offset="75%" stopColor="#38bdf8" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>

            {/* Dégradé Ligne Trading */}
            <linearGradient id={`trading-line-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Lueur Néon Trading */}
            <filter id={`trading-glow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── GRILLE DE FOND TRADING HORIZONTALE ── */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + chartH * (1 - ratio);
            const labelVal = Math.round(maxY * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="var(--dashboard-text)"
                  strokeOpacity={0.07}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <text
                  x={width - padRight}
                  y={y - 4}
                  textAnchor="end"
                  className="fill-[var(--dashboard-text)]/30 text-[9px] font-figures select-none"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* ── VOLUME BARS AU BAS DU CADRE (STYLE TRADINGVIEW) ── */}
          {points.map((p) => {
            const barW = (chartW / count) * 0.45;
            const hVol = (p.total / maxY) * 45;
            const yVol = height - padBottom - hVol;
            const isTarget = activePoint.idx === p.idx;

            return (
              <g key={`vol-${p.semaine}`}>
                <rect
                  x={p.x - barW / 2}
                  y={yVol}
                  width={barW}
                  height={hVol}
                  rx={2}
                  className="transition-opacity duration-150"
                  fill={p.reviennent >= 8 ? "#10b981" : "#38bdf8"}
                  fillOpacity={isTarget ? 0.45 : 0.15}
                />
              </g>
            );
          })}

          {/* ── AIRE SOUS LA COURBE ── */}
          <path d={areaPath} fill={`url(#trading-area-${uid})`} />

          {/* ── COURBE PRINCIPALE NÉON ── */}
          <path
            d={linePath}
            fill="none"
            stroke={`url(#trading-line-${uid})`}
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#trading-glow-${uid})`}
          />

          {/* ── REPERES DES EXTRÊMES (ATH / ATL) ── */}
          <g>
            {/* Pic Max */}
            <circle cx={peakPoint.x} cy={peakPoint.y} r={2.5} fill="#10b981" />
            <text
              x={peakPoint.x}
              y={peakPoint.y - 7}
              textAnchor="middle"
              className="fill-[#10b981] text-[8px] font-figures font-bold"
            >
              ATH {peakPoint.total}
            </text>
          </g>

          {/* ── RÉTICULE CROSSHAIR & POINT LIVE ACTIF ── */}
          {activePoint && (
            <g>
              {/* Ligne verticale X */}
              <line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={height - padBottom}
                stroke="#10b981"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
                strokeWidth={1.2}
              />

              {/* Ligne horizontale Y */}
              <line
                x1={padLeft}
                y1={activePoint.y}
                x2={width - padRight}
                y2={activePoint.y}
                stroke="#10b981"
                strokeOpacity={0.3}
                strokeDasharray="3 3"
                strokeWidth={1}
              />

              {/* Badge cours au niveau du point actif */}
              <g transform={`translate(${Math.max(padLeft, Math.min(activePoint.x - 17, width - padRight - 34))}, ${Math.max(padTop + 4, activePoint.y - 14)})`}>
                <rect
                  x={0}
                  y={-9}
                  width={34}
                  height={18}
                  rx={4}
                  fill="#10b981"
                />
                <text
                  x={17}
                  y={3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="text-[9px] font-figures font-bold select-none"
                >
                  {activePoint.total}
                </text>
              </g>

              {/* Repère de niveau sur l'axe droit */}
              <g transform={`translate(${width - padRight - 24}, ${activePoint.y})`}>
                <rect
                  x={0}
                  y={-7}
                  width={24}
                  height={14}
                  rx={2.5}
                  fill="#10b981"
                  fillOpacity={0.85}
                />
                <text
                  x={12}
                  y={3}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="text-[8px] font-figures font-bold select-none"
                >
                  {activePoint.total}
                </text>
              </g>

              {/* Halo d'impulsion live */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={10}
                fill="#10b981"
                fillOpacity={0.2}
                className="animate-ping"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={5}
                fill="#10b981"
                filter={`url(#trading-glow-${uid})`}
              />
              <circle cx={activePoint.x} cy={activePoint.y} r={2.5} fill="#ffffff" />
            </g>
          )}

          {/* ── LIGNE DE BASE TRADING ── */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="var(--dashboard-text)"
            strokeOpacity={0.1}
            strokeWidth={1}
          />

          {/* ── AXE TEMPOREL (SEMAINES) ── */}
          {points.map((p) => {
            const isSelected = activePoint.idx === p.idx;
            return (
              <text
                key={`label-${p.semaine}`}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className={`text-[9px] font-figures transition-colors ${
                  isSelected
                    ? "fill-[#10b981] font-bold"
                    : "fill-[var(--dashboard-text)]/40"
                }`}
              >
                {p.semaine.replace("Sem. ", "S")}
              </text>
            );
          })}

          {/* ── ZONES DE DÉTECTION SOURIS (SLICES) ── */}
          {points.map((p, idx) => {
            const sliceW = chartW / count;
            const sliceX = p.x - sliceW / 2;
            return (
              <rect
                key={`hitbox-${p.semaine}`}
                x={sliceX}
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

      {/* ── 4 MÉTRIQUES SOUS LE GRAPHIQUE TRADING ── */}
      <div className="grid grid-cols-2 gap-3 border-t border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/10 p-4 sm:grid-cols-4 sm:p-5">
        <div className="rounded-xl border border-[var(--dashboard-text)]/5 bg-[var(--dashboard-card-bg)] p-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--dashboard-text)]/45">
            {t("PIC D'ACQUISITION", "PEAK INFLOW")}
          </span>
          <div className="mt-1 text-base font-bold text-[#10b981]">
            <span className="font-figures">+58</span> {t("clients", "clients")}
          </div>
          <span className="text-[10px] text-[var(--dashboard-text)]/40">
            {texteAvecChiffres(t("Semaine 10 (Sérum éclat)", "Week 10 (Glow Serum)"))}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--dashboard-text)]/5 bg-[var(--dashboard-card-bg)] p-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--dashboard-text)]/45">
            {t("RÉCURRENCE MOYENNE", "RETENTION AVERAGE")}
          </span>
          <div className="mt-1 text-base font-bold text-[#38bdf8]">
            <span className="font-figures">+9,4</span> {t("retours/sem", "returns/wk")}
          </div>
          <span className="text-[10px] text-[var(--dashboard-text)]/40">
            {texteAvecChiffres(t("18,2 % du flux entrant", "18.2% of inflow"))}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--dashboard-text)]/5 bg-[var(--dashboard-card-bg)] p-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--dashboard-text)]/45">
            {t("CROISSANCE NETTE", "NET GROWTH")}
          </span>
          <div className="mt-1 text-base font-bold font-figures text-[#10b981]">
            +34,2 %
          </div>
          <span className="text-[10px] text-[var(--dashboard-text)]/40">
            {texteAvecChiffres(t("Sur les 12 dernières semaines", "Over last 12 weeks"))}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--dashboard-text)]/5 bg-[var(--dashboard-card-bg)] p-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--dashboard-text)]/45">
            {t("PROJECTION S13", "FORECAST W13")}
          </span>
          <div className="mt-1 text-base font-bold text-[var(--dashboard-text)]">
            <span className="font-figures">~62</span> {t("clients", "clients")}
          </div>
          <span className="text-[10px] text-[var(--dashboard-text)]/40">
            {texteAvecChiffres(t("Confiance modèle 91 %", "91% confidence"))}
          </span>
        </div>
      </div>
    </div>
  );
}
