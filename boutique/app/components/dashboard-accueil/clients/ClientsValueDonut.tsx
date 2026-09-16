"use client";

import { useId, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag, texteAvecChiffres } from "../shared";
import { TypeAchat } from "./clientsData";

export default function ClientsValueDonut({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();
  const uid = useId();
  const [hoveredDecile, setHoveredDecile] = useState<number | null>(null);

  const total = 387;
  const pctActifs = (198 / total) * 100;
  const pctDormants = (104 / total) * 100;
  const pctPerdus = (85 / total) * 100;

  const c = 2 * Math.PI * 40;
  const strokeActifs = (pctActifs / 100) * c;
  const strokeDormants = (pctDormants / 100) * c;
  const strokePerdus = (pctPerdus / 100) * c;

  const offsetActifs = 0;
  const offsetDormants = -strokeActifs;
  const offsetPerdus = -(strokeActifs + strokeDormants);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* ── CARTE 1 : Ce que vaut un client, ce qu'il coûte ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("Ce que vaut un client, ce qu'il coûte", "Customer value vs acquisition cost")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/45">
                {t("Sur toute la durée de la relation", "Over customer lifetime relationship")}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* Jauges horizontales */}
          <div className="mt-4 space-y-2">
            <div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-surface-2)]">
                <div className="h-full w-full rounded-full bg-[#34d399]" />
              </div>
            </div>
            <div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-surface-2)]">
                <div className="h-full w-[24%] rounded-full bg-[#5A6072]" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                <span className="text-[var(--dashboard-text)]/65">
                  {t("Ce qu'il vous rapporte au total", "Total lifetime revenue")}
                </span>
              </div>
              <span className="font-bold font-figures">27 100F</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5A6072]" />
                <span className="text-[var(--dashboard-text)]/65">
                  {t("Ce qu'il a coûté à faire venir", "Acquisition cost spent")}
                </span>
              </div>
              <span className="font-bold font-figures">3 462F</span>
            </div>
          </div>

          {/* Métriques clés */}
          <div className="mt-4 space-y-2 border-t border-[var(--dashboard-text)]/10 pt-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Rapport valeur sur coût", "Value-to-cost ratio")}
              </span>
              <span className="font-bold text-[#10b981]">
                {texteAvecChiffres(t("7,8 pour 1", "7.8 to 1"))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Achats par client sur sa vie", "Lifetime orders per customer")}
              </span>
              <span className="font-semibold font-figures">1,4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Marge de contribution par client", "Contribution margin per customer")}
              </span>
              <span className="font-semibold font-figures">6 574F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Temps pour rembourser l'acquisition", "Time to payback CAC")}
              </span>
              <span className="font-bold text-[#10b981]">
                {texteAvecChiffres(t("Dès le premier achat", "Upon 1st purchase"))}
              </span>
            </div>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h5 className="text-[11px] font-bold text-[var(--dashboard-text)]">
            {t(
              "Un client rembourse sa publicité dès la première commande",
              "A customer repays their ad cost from the very first order"
            )}
          </h5>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {texteAvecChiffres(t(
              "C'est confortable, et c'est ce qui vous permet de recruter sans risque. Mais le rapport de sept virgule huit repose sur un virgule quatre achat : il tiendrait à quinze si vos clients achetaient deux fois. La marge de progression n'est pas dans la publicité, elle est dans le deuxième achat.",
              "This provides strong cashflow security, allowing risk-free customer acquisition. However, the 7.8x ratio currently rests on only 1.4 purchases: it would jump past 15x if customers simply bought twice. Your real leverage is not more advertising, but accelerating the second purchase."
            ))}
          </p>
        </div>
      </div>

      {/* ── CARTE 2 : Qui fait votre chiffre (STYLE SHAKURO TRENDS) ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                  {t("Qui fait votre chiffre", "Who drives your revenue")}
                </h3>
                <span className="text-[var(--dashboard-text)]/40 text-xs font-bold px-1 py-0.5 rounded cursor-default">
                  ···
                </span>
              </div>
              <p className="text-[10px] text-[var(--dashboard-text)]/45">
                {texteAvecChiffres(t("Vos clients rangés par dix pour cent, du meilleur au moins bon", "Customers ranked in 10% deciles, from best to lowest"))}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* Toggles interactifs type Shakuro (○ / ●) */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-medium border-b border-[var(--dashboard-text)]/10 pb-2.5">
            <span className="text-[var(--dashboard-text)]/40 uppercase text-[9px]">
              {t("Vues :", "Views:")}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--dashboard-text)]">
              <span className="h-2 w-2 rounded-full bg-[#f05638]" />
              {t("Part du CA", "Revenue Share")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--dashboard-text)]/75">
              <span className="h-2 w-2 rounded-full border border-[#38bdf8] bg-[#38bdf8]/40" />
              {t("Panier", "Avg. Basket")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--dashboard-text)]/50">
              <span className="h-2 w-2 rounded-full border border-[#94a3b8] bg-transparent" />
              {t("Cumul", "Cumulative")}
            </span>
          </div>

          {/* Graphique Courbe Style Shakuro Trends */}
          <div className="mt-3">
            {(() => {
              // 10 Déciles D1..D10
              const decilesData = [
                { d: 1, pct: 34, panier: "41 800F", panierNum: 41.8, cumul: 34, delta: "+3.2%", label: "D1" },
                { d: 2, pct: 18, panier: "28 400F", panierNum: 28.4, cumul: 52, delta: "+4.1%", label: "D2" },
                { d: 3, pct: 12, panier: "22 100F", panierNum: 22.1, cumul: 64, delta: "-1.5%", label: "D3" },
                { d: 4, pct: 9, panier: "18 500F", panierNum: 18.5, cumul: 73, delta: "-2.7%", label: "D4" },
                { d: 5, pct: 7, panier: "16 200F", panierNum: 16.2, cumul: 80, delta: "-1.2%", label: "D5" },
                { d: 6, pct: 6, panier: "14 000F", panierNum: 14.0, cumul: 86, delta: "-0.8%", label: "D6" },
                { d: 7, pct: 5, panier: "12 500F", panierNum: 12.5, cumul: 91, delta: "-0.5%", label: "D7" },
                { d: 8, pct: 4, panier: "11 000F", panierNum: 11.0, cumul: 95, delta: "-0.4%", label: "D8" },
                { d: 9, pct: 3, panier: "9 500F", panierNum: 9.5, cumul: 98, delta: "-0.3%", label: "D9" },
                { d: 10, pct: 2, panier: "7 200F", panierNum: 7.2, cumul: 100, delta: "-0.2%", label: "D10" },
              ];

              const gWidth = 500;
              const gHeight = 145;
              const gPadLeft = 20;
              const gPadRight = 24;
              const gPadTop = 18;
              const gPadBottom = 28;
              const gChartW = gWidth - gPadLeft - gPadRight;
              const gChartH = gHeight - gPadTop - gPadBottom;

              const maxPct = 38; // Max Y pour la part de CA
              const maxPanier = 45; // Max Y pour le panier normalisé

              const coords = decilesData.map((item, idx) => {
                const x = gPadLeft + (idx / (decilesData.length - 1)) * gChartW;
                const yPct = gPadTop + gChartH - (item.pct / maxPct) * gChartH;
                const yPanier = gPadTop + gChartH - (item.panierNum / maxPanier) * gChartH;
                const yCumul = gPadTop + gChartH - (item.cumul / 100) * gChartH;
                return { ...item, x, yPct, yPanier, yCumul };
              });

              // Bézier Spline fluide
              const makeSmooth = (pts: { x: number; y: number }[]) => {
                let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
                for (let i = 0; i < pts.length - 1; i++) {
                  const p0 = i > 0 ? pts[i - 1] : pts[i];
                  const p1 = pts[i];
                  const p2 = pts[i + 1];
                  const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;
                  const cp1x = p1.x + (p2.x - p0.x) / 4.2;
                  const cp1y = p1.y + (p2.y - p0.y) / 4.2;
                  const cp2x = p2.x - (p3.x - p1.x) / 4.2;
                  const cp2y = p2.y - (p3.y - p1.y) / 4.2;
                  d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
                }
                return d;
              };

              const pathPct = makeSmooth(coords.map((p) => ({ x: p.x, y: p.yPct })));
              const pathPanier = makeSmooth(coords.map((p) => ({ x: p.x, y: p.yPanier })));
              const pathCumul = makeSmooth(coords.map((p) => ({ x: p.x, y: p.yCumul })));

              const areaPct = `${pathPct} L ${coords[coords.length - 1].x} ${gHeight - gPadBottom} L ${coords[0].x} ${gHeight - gPadBottom} Z`;

              // Point actif par défaut (D1 ou survol)
              const selectedPoint = hoveredDecile !== null
                ? coords[hoveredDecile - 1] ?? coords[0]
                : coords[0];

              return (
                <div className="relative w-full select-none">
                  <svg
                    viewBox={`0 0 ${gWidth} ${gHeight}`}
                    preserveAspectRatio="none"
                    className="w-full h-32 sm:h-36 overflow-visible cursor-crosshair"
                    onMouseLeave={() => setHoveredDecile(null)}
                  >
                    <defs>
                      <linearGradient id={`shakuro-decile-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f05638" stopOpacity={0.22} />
                        <stop offset="60%" stopColor="#f05638" stopOpacity={0.05} />
                        <stop offset="100%" stopColor="#f05638" stopOpacity={0} />
                      </linearGradient>

                      <filter id={`shakuro-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f05638" floodOpacity={0.3} />
                      </filter>
                    </defs>

                    {/* Lignes de repère horizontales fines */}
                    {[0.33, 0.66, 1].map((lvl) => {
                      const y = gPadTop + gChartH * (1 - lvl);
                      return (
                        <line
                          key={lvl}
                          x1={gPadLeft}
                          y1={y}
                          x2={gWidth - gPadRight}
                          y2={y}
                          stroke="var(--dashboard-text)"
                          strokeOpacity={0.06}
                          strokeDasharray="4 4"
                          strokeWidth={1}
                        />
                      );
                    })}

                    {/* Aire sous la courbe corail */}
                    <path d={areaPct} fill={`url(#shakuro-decile-area-${uid})`} />

                    {/* Courbe Cumul (Pointillée ardoise) */}
                    <path
                      d={pathCumul}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />

                    {/* Courbe Panier moyen (Bleu ciel vibrant) */}
                    <path
                      d={pathPanier}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Courbe Part du CA (Corail Shakuro ultra-élégant) */}
                    <path
                      d={pathPct}
                      fill="none"
                      stroke="#f05638"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter={`url(#shakuro-glow-${uid})`}
                    />

                    {/* Réticule & Point Live Actif */}
                    {selectedPoint && (
                      <g>
                        {/* Ligne verticale pointillée de visée */}
                        <line
                          x1={selectedPoint.x}
                          y1={gPadTop - 4}
                          x2={selectedPoint.x}
                          y2={gHeight - gPadBottom}
                          stroke="var(--dashboard-text)"
                          strokeOpacity={0.25}
                          strokeDasharray="3 3"
                          strokeWidth={1.2}
                        />

                        {/* Anneau Corail sur la courbe de part */}
                        <circle
                          cx={selectedPoint.x}
                          cy={selectedPoint.yPct}
                          r={5.5}
                          fill="var(--dashboard-card-bg)"
                          stroke="#f05638"
                          strokeWidth={2.2}
                        />
                        <circle cx={selectedPoint.x} cy={selectedPoint.yPct} r={2} fill="#f05638" />

                        {/* Anneau Cyan sur la courbe Panier */}
                        <circle
                          cx={selectedPoint.x}
                          cy={selectedPoint.yPanier}
                          r={4.5}
                          fill="var(--dashboard-card-bg)"
                          stroke="#38bdf8"
                          strokeWidth={1.8}
                        />

                        {/* BADGE CIRCULAIRE ROUGE/CORAIL SUR L'AXE X (SIGNATURE SHAKURO) */}
                        <g transform={`translate(${selectedPoint.x}, ${gHeight - gPadBottom + 11})`}>
                          <circle cx={0} cy={0} r={9.5} fill="#f05638" />
                          <text
                            x={0}
                            y={3}
                            textAnchor="middle"
                            fill="#ffffff"
                            className="text-[9px] font-bold font-figures select-none"
                          >
                            {selectedPoint.d}
                          </text>
                        </g>

                        {/* CARTE TOOLTIP FLOTTANTE EXACT TYPE SHAKURO */}
                        {(() => {
                          const tipW = 104;
                          const tipH = 58;
                          const isRight = selectedPoint.x > gWidth - gPadRight - tipW - 10;
                          const tipX = isRight ? selectedPoint.x - tipW - 10 : selectedPoint.x + 10;
                          const tipY = Math.max(gPadTop - 6, Math.min(selectedPoint.yPct - 35, gHeight - tipH - 20));

                          return (
                            <g transform={`translate(${tipX}, ${tipY})`}>
                              <rect
                                x={0}
                                y={0}
                                width={tipW}
                                height={tipH}
                                rx={8}
                                fill="var(--dashboard-card-bg)"
                                stroke="var(--dashboard-text)"
                                strokeOpacity={0.12}
                                strokeWidth={1}
                                className="shadow-lg"
                              />

                              {/* Ligne 1 : Part CA */}
                              <g transform="translate(8, 16)">
                                <rect x={0} y={-5} width={2.5} height={9} rx={1.2} fill="#f05638" />
                                <text x={7} y={2} className="fill-[var(--dashboard-text)]/65 text-[9px] font-medium select-none">
                                  Part CA
                                </text>
                                <text x={tipW - 16} y={2} textAnchor="end" className="fill-[var(--dashboard-text)] text-[9px] font-bold font-figures select-none">
                                  {selectedPoint.pct}%
                                </text>
                              </g>

                              {/* Ligne 2 : Panier */}
                              <g transform="translate(8, 32)">
                                <rect x={0} y={-5} width={2.5} height={9} rx={1.2} fill="#38bdf8" />
                                <text x={7} y={2} className="fill-[var(--dashboard-text)]/65 text-[9px] font-medium select-none">
                                  Panier
                                </text>
                                <text x={tipW - 16} y={2} textAnchor="end" className="fill-[var(--dashboard-text)] text-[9px] font-bold font-figures select-none">
                                  {selectedPoint.panierNum}k
                                </text>
                              </g>

                              {/* Ligne 3 : Cumul */}
                              <g transform="translate(8, 48)">
                                <rect x={0} y={-5} width={2.5} height={9} rx={1.2} fill="#94a3b8" />
                                <text x={7} y={2} className="fill-[var(--dashboard-text)]/65 text-[9px] font-medium select-none">
                                  Cumul
                                </text>
                                <text x={tipW - 16} y={2} textAnchor="end" className="fill-[var(--dashboard-text)] text-[9px] font-bold font-figures select-none">
                                  {selectedPoint.cumul}%
                                </text>
                              </g>
                            </g>
                          );
                        })()}
                      </g>
                    )}

                    {/* Ligne de base */}
                    <line
                      x1={gPadLeft}
                      y1={gHeight - gPadBottom}
                      x2={gWidth - gPadRight}
                      y2={gHeight - gPadBottom}
                      stroke="var(--dashboard-text)"
                      strokeOpacity={0.08}
                      strokeWidth={1}
                    />

                    {/* Labels des déciles le long de l'axe X */}
                    {coords.map((p) => {
                      const showLabel = p.d === 1 || p.d === 3 || p.d === 5 || p.d === 10;
                      const labelText =
                        p.d === 1
                          ? t("TOP 10%", "TOP 10%")
                          : p.d === 3
                          ? t("TOP 30%", "TOP 30%")
                          : p.d === 5
                          ? t("MÉDIAN", "MEDIAN")
                          : p.d === 10
                          ? t("FIN 10%", "BOTTOM")
                          : "";

                      if (!showLabel) return null;
                      const isCovered = selectedPoint.d === p.d;

                      return (
                        <text
                          key={`axis-label-${p.d}`}
                          x={p.x}
                          y={gHeight - gPadBottom + 13}
                          textAnchor="middle"
                          className={`text-[8px] font-figures tracking-wider font-semibold transition-opacity ${
                            isCovered ? "opacity-0" : "fill-[var(--dashboard-text)]/40"
                          }`}
                        >
                          {labelText}
                        </text>
                      );
                    })}

                    {/* Zones de détection au survol */}
                    {coords.map((p) => {
                      const sliceW = gChartW / coords.length;
                      return (
                        <rect
                          key={`hit-${p.d}`}
                          x={p.x - sliceW / 2}
                          y={0}
                          width={sliceW}
                          height={gHeight}
                          fill="transparent"
                          onMouseEnter={() => setHoveredDecile(p.d)}
                          className="cursor-crosshair"
                        />
                      );
                    })}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* Indicateurs déciles */}
          <div className="mt-4 space-y-1.5 border-t border-[var(--dashboard-text)]/10 pt-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Part faite par les 10 % meilleurs", "Share from top 10%"))}
              </span>
              <span className="font-bold font-figures text-[#f05638]">34 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Part faite par les 30 % meilleurs", "Share from top 30%"))}
              </span>
              <span className="font-semibold font-figures text-[#38bdf8]">64 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Panier moyen des 10 % meilleurs", "Top 10% average basket"))}
              </span>
              <span className="font-semibold font-figures">41 800F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Panier moyen des autres", "Other customers average basket")}
              </span>
              <span className="font-semibold font-figures">16 200F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Taux de livraison des 10 % meilleurs", "Top 10% delivery rate"))}
              </span>
              <span className="font-bold font-figures text-[#10b981]">97 %</span>
            </div>
          </div>
        </div>

        {/* Note de bas de carte */}
        <p className="mt-3 text-[10px] leading-relaxed text-[var(--dashboard-text)]/45">
          {texteAvecChiffres(t(
            "Trente-neuf clients font un tiers de votre chiffre, avec un panier deux fois et demie plus gros et presque aucun refus. Ce sont les seuls à qui il vaut la peine de proposer une nouveauté avant tout le monde, ou l'express sans le facturer.",
            "Thirty-nine top customers generate one-third of all sales, with baskets 2.5x larger and virtually zero refusals. They are the only segment where offering preview access or free VIP express shipping makes immense economic sense."
          ))}
        </p>
      </div>

      {/* ── CARTE 3 : L'état du fichier (Donut) ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
              {t("L'état du fichier", "Database status")}
            </h3>
            <p className="text-[10px] text-[var(--dashboard-text)]/45">
              {t("Depuis quand chaque client n'a plus acheté", "Inactivity duration per customer")}
            </p>
          </div>

          {/* Donut Chart SVG plus compact */}
          <div className="relative mx-auto my-3 flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#34d399"
                strokeWidth="11"
                strokeDasharray={`${strokeActifs} ${c}`}
                strokeDashoffset={offsetActifs}
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="11"
                strokeDasharray={`${strokeDormants} ${c}`}
                strokeDashoffset={offsetDormants}
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth="11"
                strokeDasharray={`${strokePerdus} ${c}`}
                strokeDashoffset={offsetPerdus}
              />
            </svg>
            <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold tracking-tight text-[var(--dashboard-text)] font-figures">{total}</span>
              <span className="text-[9px] text-[var(--dashboard-text)]/40">
                {t("clients", "clients")}
              </span>
            </div>
          </div>

          {/* Légende du donut */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                <span className="text-[var(--dashboard-text)]/65">
                  {texteAvecChiffres(t("Actifs, moins de 90 jours", "Active, under 90 days"))}
                </span>
              </div>
              <span className="font-semibold font-figures">198</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                <span className="text-[var(--dashboard-text)]/65">
                  {texteAvecChiffres(t("Dormants, 3 à 6 mois", "Dormant, 3 to 6 months"))}
                </span>
              </div>
              <span className="font-semibold font-figures">104</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" />
                <span className="text-[var(--dashboard-text)]/65">
                  {texteAvecChiffres(t("Perdus, plus de 6 mois", "Lost, over 6 months"))}
                </span>
              </div>
              <span className="font-semibold font-figures">85</span>
            </div>
          </div>

          {/* Métriques d'action dormants */}
          <div className="mt-3 space-y-1.5 border-t border-[var(--dashboard-text)]/10 pt-2.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Valeur dormante récupérable", "Recoverable dormant value")}
              </span>
              <span className="font-bold font-figures text-[#f59e0b]">1 240 000F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Taux de réveil constaté", "Observed reactivation rate")}
              </span>
              <span className="font-semibold font-figures">11 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Chiffre attendu d'une relance", "Expected campaign revenue")}
              </span>
              <span className="font-bold font-figures text-[#10b981]">136 400F</span>
            </div>
          </div>
        </div>

        {/* Note de synthèse */}
        <p className="mt-3 text-[10px] leading-relaxed text-[var(--dashboard-text)]/45">
          {texteAvecChiffres(t(
            "Cent quatre dormants, onze pour cent qui reviennent quand on les relance : c'est onze clients et cent trente-six mille francs, pour le coût d'un message. Aucun canal publicitaire ne rend cela.",
            "104 dormant customers with an 11% reactivation rate: that means 11 recaptured buyers and 136,000 CFA francs for the simple cost of a broadcast SMS. No ad channel matches that ROI."
          ))}
        </p>
      </div>
    </div>
  );
}
