"use client";

import { useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag, texteAvecChiffres } from "../shared";
import { SEGMENTS_RF, TypeAchat } from "./clientsData";

export default function ClientsRfMatrix({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
      {/* Header de section */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--dashboard-text)] sm:text-base">
            {t("Vos clients, rangés par segment", "Your customers, sorted by segment")}
          </h3>
          <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
            {t(
              "Récence en abscisse — depuis combien de temps ils ont acheté. Fréquence en ordonnée — combien de fois. Le chiffre dans le rond, c'est le nombre de clients.",
              "Recency on horizontal axis — duration since last purchase. Frequency on vertical axis — order count. Numbers represent customer counts."
            )}
          </p>
        </div>
        <TypeAchatTag typeAchat={typeAchat} />
      </div>

      {/* Matrice à 4 quadrants Récence x Fréquence */}
      <div className="relative mt-5 overflow-hidden rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3 sm:p-5">
        {/* Lignes médianes pointillés */}
        <div className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 border-t border-dashed border-[var(--dashboard-text)]/20" />
        <div className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-1/2 border-l border-dashed border-[var(--dashboard-text)]/20" />

        {/* Labels des 4 quadrants */}
        <div className="pointer-events-none grid min-h-[260px] grid-cols-2 grid-rows-2 text-[11px] sm:min-h-[300px]">
          {/* Haut Gauche : À réveiller */}
          <div className="p-2 sm:p-3">
            <span className="font-semibold uppercase tracking-wider text-[var(--dashboard-text)] text-[10px]">
              {t("À RÉVEILLER", "REAWAKEN")}
            </span>
            <span className="ml-1.5 hidden text-[10px] text-[var(--dashboard-text)]/40 sm:inline">
              {t("Achetaient souvent, plus depuis longtemps", "Bought often, but not recently")}
            </span>
          </div>

          {/* Haut Droite : Champions */}
          <div className="p-2 text-right sm:p-3">
            <span className="font-semibold uppercase tracking-wider text-[#10b981] text-[10px]">
              {t("CHAMPIONS", "CHAMPIONS")}
            </span>
            <span className="ml-1.5 hidden text-[10px] text-[var(--dashboard-text)]/40 sm:inline">
              {t("Achètent souvent et récemment", "Buy often and recently")}
            </span>
          </div>

          {/* Bas Gauche : Perdus */}
          <div className="flex flex-col justify-end p-2 sm:p-3">
            <div>
              <span className="font-semibold uppercase tracking-wider text-[#f43f5e] text-[10px]">
                {t("PERDUS", "LOST")}
              </span>
              <span className="ml-1.5 hidden text-[10px] text-[var(--dashboard-text)]/40 sm:inline">
                {t("Une fois, il y a longtemps", "Once, a long time ago")}
              </span>
            </div>
          </div>

          {/* Bas Droite : Nouveaux */}
          <div className="flex flex-col items-end justify-end p-2 text-right sm:p-3">
            <div>
              <span className="font-semibold uppercase tracking-wider text-[#a78bfa] text-[10px]">
                {t("NOUVEAUX", "NEW")}
              </span>
              <span className="ml-1.5 hidden text-[10px] text-[var(--dashboard-text)]/40 sm:inline">
                {t("Une fois, récemment", "Once, recently")}
              </span>
            </div>
          </div>
        </div>

        {/* Bulles de données positionnées sur la grille */}
        <div className="pointer-events-auto absolute inset-0">
          {SEGMENTS_RF.map((seg) => {
            const isHovered = hoveredSegment === seg.id;
            // Taille ajustée légèrement plus compacte
            const compactSize = Math.max(seg.bubbleSize * 0.82, 26);

            return (
              <div
                key={seg.id}
                onMouseEnter={() => setHoveredSegment(seg.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full font-bold text-white shadow transition-all duration-150"
                style={{
                  left: `${seg.bubbleX}%`,
                  top: `${seg.bubbleY}%`,
                  width: `${compactSize}px`,
                  height: `${compactSize}px`,
                  backgroundColor: seg.color,
                  transform: isHovered
                    ? "translate(-50%, -50%) scale(1.12)"
                    : "translate(-50%, -50%) scale(1)",
                  boxShadow: isHovered
                    ? `0 0 14px ${seg.color}90`
                    : `0 2px 8px ${seg.color}40`,
                }}
              >
                <span className="text-[10px] sm:text-[11px] font-semibold font-figures">{seg.count}</span>
              </div>
            );
          })}
        </div>

        {/* Légendes discrètes des axes */}
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-medium tracking-wide text-[var(--dashboard-text)]/40">
          {t("Achat récent →", "Recent purchase →")}
        </div>
        <div className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-medium tracking-wide text-[var(--dashboard-text)]/40">
          {t("← Nombre d'achats", "← Purchase count")}
        </div>
      </div>

      {/* Grille des 6 fiches par segment */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
        {SEGMENTS_RF.map((segment) => {
          const isHighlighted = hoveredSegment === segment.id;
          return (
            <div
              key={segment.id}
              onMouseEnter={() => setHoveredSegment(segment.id)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`flex flex-col justify-between rounded-xl border p-3 transition-all duration-150 ${
                isHighlighted
                  ? "border-[var(--dashboard-text)]/35 bg-[var(--dashboard-surface-2)] shadow-sm"
                  : "border-[var(--dashboard-text)]/8 bg-[var(--dashboard-surface-2)]/30 hover:border-[var(--dashboard-text)]/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--dashboard-text)]/75">
                    {t(segment.titreFr, segment.titreEn)}
                  </span>
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                </div>
                <div className="mt-1 text-lg tracking-tight text-[var(--dashboard-text)] sm:text-xl font-figures-bold">
                  {segment.count}
                </div>
                {segment.partChiffreFr && (
                  <p className="text-[10px] font-medium text-[var(--dashboard-text)]/50">
                    {texteAvecChiffres(t(segment.partChiffreFr, segment.partChiffreEn ?? ""))}
                  </p>
                )}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
                {t(segment.descriptionFr, segment.descriptionEn)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Encart analytique */}
      <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3 sm:p-4">
        <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
          {t(
            "Cinquante-deux clients font la moitié de votre chiffre",
            "Fifty-two customers account for half your revenue"
          )}
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/55">
          {texteAvecChiffres(t(
            "Les champions et les fidèles représentent treize pour cent du fichier et cinquante et un pour cent des ventes. Ce sont eux qu'il faut connaître par leur nom, prévenir en premier d'une nouveauté, et ne jamais laisser attendre au téléphone. À l'autre bout, les quatre-vingt-cinq perdus ne méritent pas un franc de publicité : la même somme dépensée sur les cent quatre dormants rapporte cinq fois plus, parce qu'ils ont déjà acheté une fois et qu'ils savent que le colis arrive.",
            "Champions and loyal customers represent 13% of all accounts and 51% of sales. You should know them by name, notify them first about new arrivals, and never leave them on hold. At the other extreme, the 85 lost customers do not warrant an extra franc of advertising: that same budget spent re-engaging the 104 dormant customers yields 5x more, because they have already ordered once and trust that their package will arrive."
          ))}
        </p>
      </div>
    </div>
  );
}
