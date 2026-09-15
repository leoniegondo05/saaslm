"use client";

import { useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { CollapsibleCards, HeaderActionBtn, Nature, openBrandedReport, periodSeed, scaleForPeriod, SectionHeader } from "./shared";
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

/*
  Les 6 KPIS_CLIENTS (clientsData.ts) arrivent déjà formatés en chaîne
  ("27 100F", "18,2 %"...) plutôt qu'en nombre brut — contrairement aux
  autres sections (Finances...), rien n'est en dur dans ce fichier-ci. Pour
  que le sélecteur année/mois/jour fasse quand même varier ces cartes (cf.
  [[dashboard-mock-data-pending-laravel-api]]) sans toucher clientsData.ts,
  on extrait le nombre porté par la chaîne (espaces = milliers, virgule =
  décimale, suffixe "F"/"%" optionnel), on le fait varier via
  scaleForPeriod, puis on reformate à l'identique. Renvoie la chaîne
  d'origine si le format ne matche pas — on ne casse jamais l'affichage
  pour un cas imprévu.
*/
function scaleValeurStr(valeur: string, seed: number, key: number): string {
  const m = valeur.match(/^(\d[\d\s]*)(,\d+)?(\s*%|\s*F)?$/);
  if (!m) return valeur;
  const decimals = m[2] ? m[2].length - 1 : 0;
  const multiplier = 10 ** decimals;
  const intPart = Number(m[1].replace(/\s/g, ""));
  const decPart = m[2] ? Number("0" + m[2].replace(",", ".")) : 0;
  const base = Math.round((intPart + decPart) * multiplier);
  const scaled = scaleForPeriod(base, seed, key) / multiplier;
  const suffix = m[3] ?? "";
  const [intStr, decStr] = scaled.toFixed(decimals).split(".");
  const withThousands = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return withThousands + (decStr ? "," + decStr : "") + suffix;
}

export default function ClientsSection({ first = true, activeDate }: { first?: boolean; activeDate?: Date }) {
  const { t } = useDashboardLangue();
  // Seed déterministe dérivé de la période choisie sur le sélecteur du
  // DashboardHeader — cf. [[dashboard-mock-data-pending-laravel-api]].
  // Date par défaut alignée sur celle utilisée ailleurs dans le dashboard :
  // même comportement qu'avant quand activeDate n'est pas encore fourni.
  const seed = periodSeed(activeDate ?? new Date(2026, 7, 1));
  // Plus de toggle S/D/B : les autres sections (Commandes, Produits) n'en
  // ont pas non plus, juste la légende ci-dessous. typeAchat reste passé
  // aux sous-blocs pour le badge <Nature> et les filtres déjà écrits
  // (ClientsProductsGateway, ClientsActionsToday, ClientsStockVsDrop), figé
  // sur "les-deux" tant qu'aucun sélecteur ne le pilote.
  const typeAchat: TypeAchat = "les-deux";

  // "Comparer à la période précédente" : révèle prevValeur sous chaque KPI,
  // mock en attendant l'API Laravel (cf. [[dashboard-mock-data-pending-laravel-api]]).
  const [compare, setCompare] = useState(false);

  // "Exporter" : les 6 KPI clients affichés en haut de section.
  const [exportDone, setExportDone] = useState(false);
  function handleExport() {
    openBrandedReport(t("Clients", "Customers"), t("Qui achète, et qui revient", "Who buys, and who comes back"), [
      {
        heading: t("Indicateurs clients", "Customer metrics"),
        columns: [t("Indicateur", "Metric"), t("Valeur", "Value"), t("Évolution", "Change"), t("Note", "Note")],
        rows: KPIS_CLIENTS.map((kpi, i) => [
          t(kpi.labelFr, kpi.labelEn),
          scaleValeurStr(kpi.valeur, seed, i),
          kpi.evolutionFr ? t(kpi.evolutionFr, kpi.evolutionEn ?? "") : "",
          kpi.sousLabelFr ? t(kpi.sousLabelFr, kpi.sousLabelEn ?? "") : "",
        ]),
      },
    ]);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

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
            <HeaderActionBtn onClick={handleExport}>
              {exportDone ? t("Exporté", "Exported") : t("Exporter", "Export")}
            </HeaderActionBtn>
            <HeaderActionBtn onClick={() => setCompare((c) => !c)}>
              {compare ? t("Revenir à la période actuelle", "Back to current period") : t("Comparer à la période précédente", "Compare to previous period")}
            </HeaderActionBtn>
          </>
        }
      />

      {/* Légende : quelle couleur renvoie à quelle façon de vendre — même
          bloc que CommandesSection/ProduitsSection, cf. [[dashboard-chart-colors-stockage-drop]].
          Les badges <Nature> posés à côté de chaque titre de sous-bloc
          ci-dessous (S/D/B) suivent ce code, sur la sélection du toggle
          au-dessus. */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--dashboard-glass)] px-4 py-3 text-[10px] text-[var(--dashboard-text)]/50">
        <span className="flex items-center gap-1.5"><Nature code="S" /> {t("Stockage management", "Warehousing")}</span>
        <span className="flex items-center gap-1.5"><Nature code="D" /> {t("Dropshipping", "Drop-shipping")}</span>
        <span className="flex items-center gap-1.5"><Nature code="B" /> {t("Les deux", "Both")}</span>
        <span className="ml-auto">{t("La couleur dit à quelle façon de vendre l'achat se rapporte.", "The color shows which way of selling the purchase relates to.")}</span>
      </div>

      {/* ── GRILLE DES 6 KPIS PRINCIPAUX ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {KPIS_CLIENTS.map((kpi, i) => {
          const valeur = scaleValeurStr(kpi.valeur, seed, i);
          const prevValeur = kpi.prevValeur ? scaleValeurStr(kpi.prevValeur, seed, i) : undefined;
          return (
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
                  {valeur}
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
              {compare && prevValeur && (
                <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/35">
                  {t("Période précédente", "Previous period")} : {prevValeur}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 3 premières sous-sections (RFM, croissance du fichier, valeur
          client) toujours visibles ; le reste passe sous le bouton "Voir
          tout le contenu" de CollapsibleCards — cf. shared.tsx. */}
      <CollapsibleCards visibleCount={3}>
        {/* ── SECTION 1 : VOS CLIENTS RANGÉS PAR SEGMENT (MATRICE RFM) ── */}
        <ClientsRfMatrix typeAchat={typeAchat} />

        {/* ── SECTION 2 : COMMENT VOTRE FICHIER GRANDIT (HISTOGRAMME 12 SEMAINES) ── */}
        <ClientsGrowthChart />

        {/* ── SECTION 3 : CE QUE VAUT UN CLIENT / DÉCILES / DONUT CHART ── */}
        <ClientsValueDonut typeAchat={typeAchat} />

        {/* ── SECTION 4 : PASSERELLES PRODUITS (PREMIER & SECOND ACHAT) ── */}
        <ClientsProductsGateway typeAchat={typeAchat} />

        {/* ── SECTION 5 : QUAND ILS REVIENNENT & FIABILITÉ CLIENTS ── */}
        <ClientsReliabilityRetention typeAchat={typeAchat} />

        {/* ── SECTION 6 : COMMENT ILS PAIENT ET IMPACT SUR LA MARGE ── */}
        <ClientsPaymentImpact typeAchat={typeAchat} />

        {/* ── SECTION 7 : SCORE DE FIABILITÉ & MATRICE VALEUR / FIABILITÉ ── */}
        <ClientsReliabilityMatrix typeAchat={typeAchat} />

        {/* ── SECTION 8 : EXPÉRIENCE STOCKAGE MANAGEMENT VS DROPSHIPPING ── */}
        <ClientsStockVsDrop typeAchat={typeAchat} />

        {/* ── SECTION 9 : OÙ SONT VOS CLIENTS (GÉO) & CANAUX D'ACQUISITION ── */}
        <ClientsGeoAndChannels typeAchat={typeAchat} />

        {/* ── SECTION 10 : PROFONDEUR DE CATALOGUE & PROJECTION PORTEFEUILLE 12 MOIS ── */}
        <ClientsProductsCountAndForecast typeAchat={typeAchat} />

        {/* ── SECTION 11 : QUALITÉ DE LA RELATION, SEGMENT PAR SEGMENT ── */}
        <ClientsSegmentQuality typeAchat={typeAchat} />

        {/* ── SECTION 12 : À FAIRE AUJOURD'HUI (ACTIONS & RELANCES PRÊTES) ── */}
        <ClientsActionsToday typeAchat={typeAchat} />
      </CollapsibleCards>
    </div>
  );
}
