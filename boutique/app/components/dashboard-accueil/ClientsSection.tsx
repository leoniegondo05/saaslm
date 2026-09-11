"use client";

import { useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { HeaderActionBtn, SectionHeader } from "./shared";
import { KPIS_CLIENTS, TypeAchat } from "./clients/clientsData";
import ClientsRfMatrix from "./clients/ClientsRfMatrix";
import ClientsGrowthChart from "./clients/ClientsGrowthChart";
import ClientsValueDonut from "./clients/ClientsValueDonut";
import ClientsProductsGateway from "./clients/ClientsProductsGateway";
import ClientsReliabilityRetention from "./clients/ClientsReliabilityRetention";
import ClientsPaymentImpact from "./clients/ClientsPaymentImpact";
import ClientsReliabilityMatrix from "./clients/ClientsReliabilityMatrix";
import ClientsStockVsDrop from "./clients/ClientsStockVsDrop";
import ClientsGeoAndChannels from "./clients/ClientsGeoAndChannels";
import ClientsProductsCountAndForecast from "./clients/ClientsProductsCountAndForecast";
import ClientsSegmentQuality from "./clients/ClientsSegmentQuality";
import ClientsActionsToday from "./clients/ClientsActionsToday";

/*
  Comme pour CommandesSection et StockSection, le bloc "assistance IA" en
  pied de section (bulles de questions) est parti dans le bouton
  "solution LM" du navbar (DashboardHeader.tsx → AssistanceLMModal.tsx) :
  ouvert sur l'onglet Clients, il montre les mêmes questions
  (dashboard-accueil/assistanceQuestions.ts, clé "Clients"), plus besoin de
  scroller toute la section pour les voir. Ancien composant
  clients/ClientsAiAssistance.tsx supprimé, devenu mort.
*/

export default function ClientsSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [typeAchat, setTypeAchat] = useState<TypeAchat>("les-deux");

  return (
    <div className="space-y-6">
      {/* ── EN-TÊTE OFFICIEL DU DASHBOARD ── */}
      <SectionHeader
        eyebrow={t("Clients", "Customers")}
        title={t("Qui achète, et qui revient", "Who buys, and who comes back")}
        subtitle={t(
          "Tout se recalcule sur la période choisie en haut de l'écran.",
          "All indicators automatically recalculate based on the period selected above."
        )}
        first={first}
        layout="inline"
        actions={
          <>
            <HeaderActionBtn>
              {t("Exporter", "Export")}
            </HeaderActionBtn>
            <HeaderActionBtn>
              {t("Comparer à la période précédente", "Compare to previous period")}
            </HeaderActionBtn>
          </>
        }
      />

      {/* ── BARRE DE SÉLECTION DU TYPE D'ACHAT ── */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] px-4 py-2.5 sm:flex-row sm:items-center shadow-sm transition-colors">
        {/* Pills de filtre */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stockage Management */}
          <button
            type="button"
            onClick={() => setTypeAchat("stockage")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
              typeAchat === "stockage"
                ? "bg-[#0284c7]/20 text-[#0284c7] border border-[#0284c7] shadow-[0_0_10px_rgba(2,132,199,0.25)] dark:text-[#38bdf8] dark:border-[#38bdf8]"
                : "bg-[var(--dashboard-surface-2)] text-[var(--dashboard-text)]/70 border border-transparent hover:border-[var(--dashboard-text)]/20"
            }`}
          >
            {t("ACHATS EN STOCKAGE MANAGEMENT", "STOCKAGE MANAGEMENT ORDERS")}
          </button>

          {/* Dropshipping */}
          <button
            type="button"
            onClick={() => setTypeAchat("dropshipping")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
              typeAchat === "dropshipping"
                ? "bg-[#ec0c8c]/20 text-[#ec0c8c] border border-[#ec0c8c] shadow-[0_0_10px_rgba(236,12,140,0.25)]"
                : "bg-[var(--dashboard-surface-2)] text-[var(--dashboard-text)]/70 border border-transparent hover:border-[var(--dashboard-text)]/20"
            }`}
          >
            {t("ACHATS EN DROPSHIPPING", "DROPSHIPPING ORDERS")}
          </button>

          {/* Les Deux */}
          <button
            type="button"
            onClick={() => setTypeAchat("les-deux")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
              typeAchat === "les-deux"
                ? "bg-[var(--dashboard-text)] text-[var(--dashboard-card-bg)] border border-[var(--dashboard-text)] shadow-sm"
                : "bg-[var(--dashboard-surface-2)] text-[var(--dashboard-text)]/70 border border-transparent hover:border-[var(--dashboard-text)]/20"
            }`}
          >
            {t("Les deux", "Both")}
          </button>
        </div>

        {/* Note informative à droite */}
        <p className="text-[10px] text-[var(--dashboard-text)]/50 sm:text-right">
          {t(
            "Un client n'a pas de nature : ses achats en ont une. La couleur suit ce qu'il a acheté.",
            "Customers have no fixed type: their purchases do. Visuals reflect purchase categories."
          )}
        </p>
      </div>

      {/* ── GRILLE DES 6 KPIS PRINCIPAUX ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {KPIS_CLIENTS.map((kpi) => (
          <div
            key={kpi.id}
            className="flex flex-col justify-between rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3.5 shadow-[0_4px_12px_-4px_rgba(20,18,32,0.08)] transition-colors"
          >
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--dashboard-text)]/45">
                {t(kpi.labelFr, kpi.labelEn)}
              </span>
              <div
                className={`mt-1.5 text-xl font-bold tracking-tight sm:text-2xl ${
                  kpi.id === "actifs" ? "text-[#10b981]" : ""
                } ${kpi.id === "reviennent" || kpi.id === "a-relancer" ? "text-[#f59e0b]" : ""}`}
              >
                {kpi.valeur}
              </div>
            </div>

            <div className="mt-1.5 text-[10px]">
              {kpi.evolutionFr && (
                <span className={`font-semibold ${kpi.evolutionColor ?? "text-[#10b981]"}`}>
                  {t(kpi.evolutionFr, kpi.evolutionEn ?? "")}
                </span>
              )}
              {kpi.sousLabelFr && (
                <span className="text-[var(--dashboard-text)]/50">
                  {t(kpi.sousLabelFr, kpi.sousLabelEn ?? "")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION 1 : VOS CLIENTS RANGÉS PAR SEGMENT (MATRICE RFM) ── */}
      <ClientsRfMatrix />

      {/* ── SECTION 2 : COMMENT VOTRE FICHIER GRANDIT (HISTOGRAMME 12 SEMAINES) ── */}
      <ClientsGrowthChart />

      {/* ── SECTION 3 : CE QUE VAUT UN CLIENT / DÉCILES / DONUT CHART ── */}
      <ClientsValueDonut />

      {/* ── SECTION 4 : PASSERELLES PRODUITS (PREMIER & SECOND ACHAT) ── */}
      <ClientsProductsGateway />

      {/* ── SECTION 5 : QUAND ILS REVIENNENT & FIABILITÉ CLIENTS ── */}
      <ClientsReliabilityRetention />

      {/* ── SECTION 6 : COMMENT ILS PAIENT ET IMPACT SUR LA MARGE ── */}
      <ClientsPaymentImpact />

      {/* ── SECTION 7 : SCORE DE FIABILITÉ & MATRICE VALEUR / FIABILITÉ ── */}
      <ClientsReliabilityMatrix />

      {/* ── SECTION 8 : EXPÉRIENCE STOCKAGE MANAGEMENT VS DROPSHIPPING ── */}
      <ClientsStockVsDrop />

      {/* ── SECTION 9 : OÙ SONT VOS CLIENTS (GÉO) & CANAUX D'ACQUISITION ── */}
      <ClientsGeoAndChannels />

      {/* ── SECTION 10 : PROFONDEUR DE CATALOGUE & PROJECTION PORTEFEUILLE 12 MOIS ── */}
      <ClientsProductsCountAndForecast />

      {/* ── SECTION 11 : QUALITÉ DE LA RELATION, SEGMENT PAR SEGMENT ── */}
      <ClientsSegmentQuality />

      {/* ── SECTION 12 : À FAIRE AUJOURD'HUI (ACTIONS & RELANCES PRÊTES) ── */}
      <ClientsActionsToday />
    </div>
  );
}
