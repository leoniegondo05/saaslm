"use client";

import { useState } from "react";
import PaymentMethodCard from "../PaymentMethodCard";
import { AreaChart, Bar, Card, CollapsibleCards, Divider, HeaderActionBtn, LegendRow, MiniStat, Nature, openBrandedReport, periodSeed, scaleForPeriod, SectionHeader, StatRow, Tag, texteAvecChiffres, WaterfallChart } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Finances" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx pour que ce dernier ne soit plus qu'un
  orchestrateur (cf. FinancesSection/CommandesSection/... + AccueilNav).
*/

/*
  Anneau de proportion (conic-gradient + trou central) — remplace les
  ".donut"/".ring" en SVG du document envoyé, sans librairie : un disque
  et un disque troué de la couleur de la carte par-dessus.
*/
function Ring({ pct, color, trackColor, size = 96, children }: { pct: number; color: string; trackColor?: string; size?: number; children?: React.ReactNode }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, ${trackColor ?? "rgba(20,18,32,0.08)"} ${pct * 3.6}deg)` }}
      />
      <div
        className="absolute rounded-full card-tint"
        style={{ inset: size * 0.16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </div>
    </div>
  );
}

/*
  Barre empilée à plusieurs segments — pour "l'argent immobilisé"
  (stock déposé / suspendu / en livraison / retours), légendée juste en
  dessous avec LegendRow (couleurs partagées).
*/
function StackedBar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
      {segments.map((s, i) => (
        <span key={i} style={{ width: `${s.pct}%`, background: s.color }} />
      ))}
    </div>
  );
}

/*
  Petit badge "N commandes" en rond plein (pas un Ring troué) — coin
  supérieur droit de chaque colonne de comparaisonCard, comme sur le
  document envoyé.
*/
function CountBadge({ count, color, label }: { count: number; color: string; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-figures-bold"
        style={{ background: `${color}1f`, color }}
      >
        {count}
      </span>
      <span className="text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{label}</span>
    </div>
  );
}

/*
  Ligne "label — valeur" avec sa barre en dessous, longueur relative au
  panier moyen de la colonne (première ligne) — une colonne = une couleur.
*/
/*
  Double barre "revenu généré (rose) / dépense publicitaire (gris)" —
  carte "D'où viennent vos commandes" : les deux échelles partagent le
  même max (le revenu Meta), la ligne "Ventes organiques" n'a pas de
  dépense donc pas de barre rose au-dessus.
*/
function DualBar({ revenuePct, spendPct }: { revenuePct: number; spendPct: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
        {revenuePct > 0 && <div className="h-full rounded-full bg-brand-pink" style={{ width: `${revenuePct}%` }} />}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-transparent">
        <div className="h-full rounded-full border border-[var(--dashboard-text)]/25" style={{ width: `${Math.max(spendPct, 4)}%` }} />
      </div>
    </div>
  );
}

function CompareRow({ label, value, pct, color, strong = false }: { label: string; value: string; pct: number; color: string; strong?: boolean }) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] first:mt-0">
      <span className="text-[var(--dashboard-text)]/55">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`font-figures-bold ${strong ? "" : "font-semibold"}`} style={strong ? { color } : undefined}>
          {value}
        </span>
        <span className="w-20 shrink-0">
          <Bar pct={pct} background={color} />
        </span>
      </span>
    </div>
  );
}

/*
  Petits formatteurs locaux pour les montants/pourcentages calculés à partir
  des mocks mis à l'échelle par période (cf. scaleForPeriod, shared.tsx) —
  même convention visuelle que les littéraux d'origine ("1 482 300 F",
  "54,2 %", "− 1 062 000 F") pour que rien ne bouge à l'oeil hors des
  chiffres eux-mêmes.
*/
function fmtF(n: number) {
  return `${Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;
}
function fmtDeltaF(n: number) {
  return `− ${fmtF(n)}`;
}
function fmtSignedF(n: number) {
  return n < 0 ? `− ${fmtF(n)}` : `+${fmtF(n)}`;
}
function fmtPct1(n: number) {
  return `${n.toFixed(1).replace(".", ",")} %`;
}
function fmtPctSigned1(n: number) {
  return n < 0 ? `− ${fmtPct1(Math.abs(n))}` : fmtPct1(n);
}
function fmtJours(n: number) {
  return Number.isInteger(n) ? `${n} j` : `${n.toFixed(1).replace(".", ",")} j`;
}

export default function FinancesSection({ first = true, activeDate }: { first?: boolean; activeDate?: Date }) {
  const { t } = useDashboardLangue();

  // Seed déterministe dérivé de la période choisie sur le sélecteur
  // année/mois/jour (cf. [[dashboard-mock-data-pending-laravel-api]]) : fait
  // varier tous les mocks ci-dessous sans backend, cf. shared.tsx.
  const seed = periodSeed(activeDate ?? new Date(2026, 7, 1));

  // "Comparer à la période précédente" : révèle la valeur de la période
  // précédente sous les 4 chiffres de trésorerie, mock en attendant l'API
  // Laravel (cf. [[dashboard-mock-data-pending-laravel-api]]).
  const [compare, setCompare] = useState(false);

  // Délai de suspension fixé par le vendeur — mock local en attendant l'API
  // Laravel (pas encore de persistance côté serveur pour ce réglage).
  const [holdHours, setHoldHours] = useState(72);
  const [editingHold, setEditingHold] = useState(false);
  const [draftHold, setDraftHold] = useState(String(holdHours));
  const draftHoldNum = Number(draftHold);
  const draftHoldInvalid = !Number.isFinite(draftHoldNum) || draftHoldNum < 24;

  function openHoldEditor() {
    setDraftHold(String(holdHours));
    setEditingHold(true);
  }

  function saveHold() {
    if (draftHoldInvalid) return;
    setHoldHours(Math.round(draftHoldNum));
    setEditingHold(false);
  }

  // Mocks mis à l'échelle de la période choisie (cf. seed ci-dessus et
  // [[dashboard-mock-data-pending-laravel-api]]) : chaque valeur "racine" est
  // passée dans scaleForPeriod avec une clé qui lui est propre pour ne pas
  // bouger en lock-step avec les autres stats de la même carte ; les montants
  // qui doivent rester cohérents entre eux (cascade du compte de résultat,
  // totaux, pourcentages) sont ensuite dérivés par simple arithmétique plutôt
  // que remis à l'échelle indépendamment, pour que la cascade/les barres
  // empilées continuent de sommer juste.
  const soldeAvailable = scaleForPeriod(1022800, seed, 0);
  const soldeSuspended = scaleForPeriod(459500, seed, 1); // réutilisé : immobiliseCard, projectionCard, export
  const soldeTotal = soldeAvailable + soldeSuspended;
  const soldePctAvailable = Math.round((soldeAvailable / soldeTotal) * 100);
  const soldePctSuspended = 100 - soldePctAvailable;

  const cashLowest = scaleForPeriod(318000, seed, 3);
  const cashLowestPrev = scaleForPeriod(275000, seed, 4);
  const cashHighest = scaleForPeriod(861000, seed, 5);
  const cashHighestPrev = scaleForPeriod(790000, seed, 6);
  const cashAvg = scaleForPeriod(601400, seed, 7);
  const cashAvgPrev = scaleForPeriod(545000, seed, 8);
  const cashVariationPct = scaleForPeriod(87, seed, 9);
  const cashVariationPrevPct = scaleForPeriod(52, seed, 10);

  const prEncaisse = scaleForPeriod(2316400, seed, 11);
  const prPrixProduit = scaleForPeriod(1062000, seed, 12);
  const prFraisLogistiques = scaleForPeriod(178500, seed, 13);
  const prFraisTransaction = scaleForPeriod(34700, seed, 14);
  const prGarantieProduit = scaleForPeriod(12400, seed, 15);
  const prCoutRefus = scaleForPeriod(31000, seed, 16);
  const prPublicite = scaleForPeriod(412000, seed, 17);
  const prCommissionLM = scaleForPeriod(57900, seed, 18);
  const prAbonnement = scaleForPeriod(25000, seed, 19); // réutilisé : projectionCard, export
  const prGrossMargin = prEncaisse - prPrixProduit;
  const prContributionMargin = prGrossMargin - prFraisLogistiques - prFraisTransaction - prGarantieProduit - prCoutRefus - prPublicite;
  const prNetResult = prContributionMargin - prCommissionLM - prAbonnement;
  const prGrossMarginPct = (prGrossMargin / prEncaisse) * 100;
  const prContributionMarginPct = (prContributionMargin / prEncaisse) * 100;
  const prNetMarginPct = (prNetResult / prEncaisse) * 100;

  const cmpStockagePanier = scaleForPeriod(20295, seed, 20);
  const cmpStockagePrixProduit = scaleForPeriod(9308, seed, 21);
  const cmpLogistiqueFee = scaleForPeriod(1896, seed, 22); // partagé stockage/drop (même frais dans le mock d'origine)
  const cmpAcquisitionFee = scaleForPeriod(3462, seed, 23); // partagé stockage/drop
  const cmpStockageCommission = scaleForPeriod(507, seed, 24);
  const cmpDropPanier = scaleForPeriod(17888, seed, 25);
  const cmpDropPrixFixe = scaleForPeriod(8195, seed, 26);
  const cmpDropCommission = scaleForPeriod(447, seed, 27);
  const cmpStockageOrders = scaleForPeriod(78, seed, 28);
  const cmpDropOrders = scaleForPeriod(41, seed, 29);
  const cmpStockageContribution = cmpStockagePanier - cmpStockagePrixProduit - cmpLogistiqueFee - cmpAcquisitionFee - cmpStockageCommission;
  const cmpDropContribution = cmpDropPanier - cmpDropPrixFixe - cmpLogistiqueFee - cmpAcquisitionFee - cmpDropCommission;
  const cmpStockagePctProduit = Math.round((cmpStockagePrixProduit / cmpStockagePanier) * 100);
  const cmpStockagePctLogistique = Math.round((cmpLogistiqueFee / cmpStockagePanier) * 100);
  const cmpStockagePctAcquisition = Math.round((cmpAcquisitionFee / cmpStockagePanier) * 100);
  const cmpStockagePctCommission = Math.round((cmpStockageCommission / cmpStockagePanier) * 100);
  const cmpStockagePctContribution = Math.round((cmpStockageContribution / cmpStockagePanier) * 100);
  const cmpStockageContributionRate = (cmpStockageContribution / cmpStockagePanier) * 100;
  const cmpDropPctProduit = Math.round((cmpDropPrixFixe / cmpDropPanier) * 100);
  const cmpDropPctLogistique = Math.round((cmpLogistiqueFee / cmpDropPanier) * 100);
  const cmpDropPctAcquisition = Math.round((cmpAcquisitionFee / cmpDropPanier) * 100);
  const cmpDropPctCommission = Math.round((cmpDropCommission / cmpDropPanier) * 100);
  const cmpDropPctContribution = Math.round((cmpDropContribution / cmpDropPanier) * 100);
  const cmpDropContributionRate = (cmpDropContribution / cmpDropPanier) * 100;
  const cmpRingPct = Math.round((cmpStockageOrders / (cmpStockageOrders + cmpDropOrders)) * 100);
  const stockDeposited = scaleForPeriod(1842000, seed, 59); // réutilisé : immobiliseCard ("Stock déposé")

  const acqMetaRevenue = scaleForPeriod(892000, seed, 30);
  const acqMetaSpend = scaleForPeriod(186000, seed, 31);
  const acqTiktokRevenue = scaleForPeriod(748000, seed, 32);
  const acqTiktokSpend = scaleForPeriod(142000, seed, 33);
  const acqGoogleRevenue = scaleForPeriod(289000, seed, 34);
  const acqGoogleSpend = scaleForPeriod(64000, seed, 35);
  const acqYoutubeRevenue = scaleForPeriod(72000, seed, 36);
  const acqYoutubeSpend = scaleForPeriod(20000, seed, 37);
  const acqOrganicRevenue = scaleForPeriod(315400, seed, 38);
  const acqMaxRevenue = Math.max(acqMetaRevenue, acqTiktokRevenue, acqGoogleRevenue, acqYoutubeRevenue, acqOrganicRevenue) || 1;
  const acqMetaRevenuePct = (acqMetaRevenue / acqMaxRevenue) * 100;
  const acqMetaSpendPct = (acqMetaSpend / acqMaxRevenue) * 100;
  const acqTiktokRevenuePct = (acqTiktokRevenue / acqMaxRevenue) * 100;
  const acqTiktokSpendPct = (acqTiktokSpend / acqMaxRevenue) * 100;
  const acqGoogleRevenuePct = (acqGoogleRevenue / acqMaxRevenue) * 100;
  const acqGoogleSpendPct = (acqGoogleSpend / acqMaxRevenue) * 100;
  const acqYoutubeRevenuePct = (acqYoutubeRevenue / acqMaxRevenue) * 100;
  const acqYoutubeSpendPct = (acqYoutubeSpend / acqMaxRevenue) * 100;
  const acqOrganicPct = (acqOrganicRevenue / acqMaxRevenue) * 100;
  const acqMetaRoas = acqMetaRevenue / acqMetaSpend;
  const acqTiktokRoas = acqTiktokRevenue / acqTiktokSpend;
  const acqGoogleRoas = acqGoogleRevenue / acqGoogleSpend;
  const acqYoutubeRoas = acqYoutubeRevenue / acqYoutubeSpend;

  const refDeliveredPaid = scaleForPeriod(119, seed, 39);
  const refRefusedCall = scaleForPeriod(14, seed, 40);
  const refRefusedDoor = scaleForPeriod(9, seed, 41);
  const refStillOnWay = scaleForPeriod(6, seed, 42);
  const refCostCall = scaleForPeriod(48500, seed, 43);
  const refCostDoor = scaleForPeriod(53600, seed, 44);
  const refGoodsBackInStock = scaleForPeriod(118400, seed, 45);
  const refTotalOrders = refDeliveredPaid + refRefusedCall + refRefusedDoor + refStillOnWay || 1;
  const refDeliveredPct = (refDeliveredPaid / refTotalOrders) * 100;
  const refStackCallPct = (refRefusedCall / (refRefusedCall + refRefusedDoor || 1)) * 100;
  const refStackDoorPct = 100 - refStackCallPct;

  const prodTot0 = scaleForPeriod(6112, seed, 46);
  const prodVal0 = scaleForPeriod(314, seed, 47) / 10;
  const prodTot1 = scaleForPeriod(4908, seed, 48);
  const prodVal1 = scaleForPeriod(261, seed, 49) / 10;
  const prodTot2 = scaleForPeriod(3402, seed, 50);
  const prodVal2 = scaleForPeriod(188, seed, 51) / 10;
  const prodTot3 = scaleForPeriod(1214, seed, 52);
  const prodVal3 = scaleForPeriod(84, seed, 53) / 10;
  const prodTot4 = scaleForPeriod(-340, seed, 54);
  const prodVal4 = scaleForPeriod(-18, seed, 55) / 10;
  const prodTop3Share = scaleForPeriod(61, seed, 56);

  const immShippedNotDelivered = scaleForPeriod(252000, seed, 57);
  const immRefusedGoodsReturning = scaleForPeriod(205200, seed, 58);
  const immTotal = stockDeposited + soldeSuspended + immShippedNotDelivered + immRefusedGoodsReturning || 1;
  const immPctStock = (stockDeposited / immTotal) * 100;
  const immPctSuspended = (soldeSuspended / immTotal) * 100;
  const immPctShipped = (immShippedNotDelivered / immTotal) * 100;
  const immPctRefused = (immRefusedGoodsReturning / immTotal) * 100;
  const cycleDaysAchat = scaleForPeriod(4, seed, 60);
  const cycleDaysStock = scaleForPeriod(18, seed, 61);
  const cycleDaysLivraison = scaleForPeriod(11, seed, 62) / 10;
  const cycleDaysLitige = holdHours / 24; // dérivé du réglage réel (holdHours), pas remis à l'échelle
  const cycleDaysTotal = cycleDaysAchat + cycleDaysStock + cycleDaysLivraison + cycleDaysLitige;

  const projExpectedBalance30d = scaleForPeriod(1495000, seed, 64);

  // 30 jours de solde disponible (cf. graphe "évolution de la trésorerie") :
  // deux paliers de fin de suspension groupée (bonds), comme sur le modèle envoyé.
  const cashDays = [42, 44, 46, 48, 51, 53, 56, 59, 62, 65, 69, 72, 76, 25, 28, 31, 34, 37, 41, 45, 49, 53, 57, 61, 65, 26, 30, 34, 38, 41].map((v) => scaleForPeriod(v, seed, 2));
  const forecastDays = [30, 31, 33, 32, 34, 36, 35, 38, 40, 39, 42, 44, 43, 46, 48].map((v) => scaleForPeriod(v, seed, 65));

  // Rangée du haut du document envoyé : le portefeuille (carte gardée) à
  // gauche, le solde du sous-compte à droite — même disposition (scw2).
  const soldeCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Solde de votre sous-compte", "Your sub-account balance")}</h3>
          <Nature code="B" />
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight font-figures-bold text-slate-950 dark:text-slate-50">{fmtF(soldeTotal)}</p>
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
          <span className="h-full" style={{ width: `${soldePctAvailable}%`, background: "linear-gradient(90deg,#4FE0AE,#38BDF8)" }} />
          <span className="h-full" style={{ width: `${soldePctSuspended}%`, background: "linear-gradient(90deg,#FFB84D,#FF9A3D)" }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#4FE0AE" }} /><div><p className="font-semibold font-figures">{fmtF(soldeAvailable)}</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Disponible tout de suite", "Available right away")}</p></div></div>
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#FFB84D" }} /><div><p className="font-semibold font-figures">{fmtF(soldeSuspended)}</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Suspendu · délai de litige", "On hold · dispute window")}</p></div></div>
        </div>
        <div className="mt-3 rounded-2xl p-4" style={{ background: "var(--dashboard-surface-2)" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold">{texteAvecChiffres(t(`Votre délai de suspension : ${holdHours} h`, `Your hold period: ${holdHours} h`))}</p>
              <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
                {t("C'est vous qui le fixez, jamais moins de 24 h. Passé ce délai, votre part devient disponible sans démarche.", "You set it, never under 24 h. Once it's over, your share becomes available with no action needed.")}
              </p>
            </div>
            {!editingHold && (
              <span className="inline-flex shrink-0 rounded-md p-px" style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}>
                <button type="button" onClick={openHoldEditor} className="rounded-[5px] bg-[var(--dashboard-card-bg)] px-2.5 py-1.5 text-[9px] font-semibold">
                  {t("Changer le délai", "Change the hold period")}
                </button>
              </span>
            )}
          </div>
          {editingHold && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--dashboard-text)]/10 pt-3">
              <label className="flex items-center gap-1.5 text-[10px] text-[var(--dashboard-text)]/60">
                {t("Nouveau délai (heures)", "New hold period (hours)")}
                <input
                  type="number"
                  min={24}
                  value={draftHold}
                  onChange={(e) => setDraftHold(e.target.value)}
                  className="w-16 rounded-md border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] px-2 py-1 text-xs font-semibold text-[var(--dashboard-text)]"
                />
              </label>
              <button
                type="button"
                onClick={saveHold}
                disabled={draftHoldInvalid}
                className="rounded-[5px] bg-brand-pink px-2.5 py-1.5 text-[9px] font-semibold text-white disabled:opacity-40"
              >
                {t("Enregistrer", "Save")}
              </button>
              <button
                type="button"
                onClick={() => setEditingHold(false)}
                className="rounded-[5px] border border-[var(--dashboard-text)]/15 px-2.5 py-1.5 text-[9px] font-semibold"
              >
                {t("Annuler", "Cancel")}
              </button>
              {draftHoldInvalid && (
                <span className="w-full text-[9px] text-[#FF7A80]">{t("Jamais moins de 24 h.", "Never under 24 h.")}</span>
              )}
            </div>
          )}
        </div>
      </Card>
  );

  // Deuxième bloc du document : l'évolution du solde jour par jour.
  // Les deux creux (index 13 et 25 dans cashDays) sont des fins de
  // suspension groupées : plusieurs commandes arrivent au terme de leur
  // délai le même jour, d'où le trait vertical pointillé + point blanc
  // sur le graphe, comme sur le document envoyé.
  const cashEndOfHoldMarkers = [13, 25];

  const evolutionCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Évolution de votre trésorerie", "Cash evolution")}</h3>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[9px] font-medium text-[var(--dashboard-text)]/55 sm:flex">
              <span className="h-[2px] w-3 rounded-full" style={{ background: "#22C55E" }} />
              {t("Solde disponible", "Available balance")}
            </span>
            <span className="hidden items-center gap-1.5 text-[9px] font-medium text-[var(--dashboard-text)]/55 sm:flex">
              <span className="w-3 border-t border-dashed" style={{ borderColor: "var(--dashboard-text)", opacity: 0.4 }} />
              {t("Fin de suspension", "End of hold")}
            </span>
            <Nature code="B" />
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Solde disponible, jour par jour, sur la période choisie", "Available balance, day by day, over the chosen period")}</p>
        <AreaChart values={cashDays} color="#22C55E" markers={cashEndOfHoldMarkers} />
        <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
          <span>{texteAvecChiffres("9 août")}</span><span>{texteAvecChiffres("16 août")}</span><span>{texteAvecChiffres("23 août")}</span><span>{texteAvecChiffres("30 août")}</span><span>{texteAvecChiffres("8 sept.")}</span>
        </div>
        <Divider />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label={t("Point le plus bas", "Lowest point")} value={fmtF(cashLowest)} previous={compare ? fmtF(cashLowestPrev) : undefined} previousLabel={t("Période précédente", "Previous period")} />
          <MiniStat label={t("Point le plus haut", "Highest point")} value={fmtF(cashHighest)} previous={compare ? fmtF(cashHighestPrev) : undefined} previousLabel={t("Période précédente", "Previous period")} />
          <MiniStat label={t("Solde moyen", "Average balance")} value={fmtF(cashAvg)} previous={compare ? fmtF(cashAvgPrev) : undefined} previousLabel={t("Période précédente", "Previous period")} />
          <MiniStat label={t("Variation", "Change")} value={`+${cashVariationPct} %`} tone="pink" previous={compare ? `+${cashVariationPrevPct} %` : undefined} previousLabel={t("Variation précédente", "Previous change")} />
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "Les deux traits verticaux sont des fins de suspension groupées : plusieurs commandes arrivent au terme de leur délai le même jour, et le disponible fait un bond.",
            "The two vertical lines are grouped hold releases: several orders reach the end of their window the same day, and the available balance jumps."
          )}
        </p>
      </Card>
  );

  // Troisième bloc : le compte de résultat de la période — cascade
  // (encaissé → charges → résultat net), fidèle au document envoyé :
  // titre + marges en % en tête, graphe en cascade, deux encarts
  // numérotés (prix produit partenaire / frais fixés par le partenaire),
  // puis trois pavés de marges en F avec leur explication.
  const compteResultatCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Votre compte de résultat sur la période", "Your P&L for the period")}</h3>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Du montant encaissé à ce qui vous reste réellement", "From what's collected to what's really left")}</p>
          </div>
          <div className="flex flex-wrap items-start gap-4 sm:gap-5">
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge brute", "Gross margin")}</p>
              <p className="mt-0.5 text-sm font-figures-bold">{fmtPct1(prGrossMarginPct)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge de contribution", "Contribution margin")}</p>
              <p className="mt-0.5 text-sm font-figures-bold" style={{ color: "#0C86BE" }}>{fmtPct1(prContributionMarginPct)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge nette", "Net margin")}</p>
              <p className="mt-0.5 text-sm font-figures-bold" style={{ color: "#0E9F6E" }}>{fmtPct1(prNetMarginPct)}</p>
            </div>
            <Nature code="B" />
          </div>
        </div>

        <WaterfallChart
          items={[
            { label: t("Encaissé des clients", "Collected from clients"), display: fmtF(prEncaisse), amount: prEncaisse, kind: "total" },
            { label: t("Prix produit partenaire", "Partner product price"), display: fmtDeltaF(prPrixProduit), amount: -prPrixProduit, kind: "delta" },
            { label: t("Frais logistiques", "Logistics fees"), display: fmtDeltaF(prFraisLogistiques), amount: -prFraisLogistiques, kind: "delta" },
            { label: t("Frais de transaction", "Transaction fees"), display: fmtDeltaF(prFraisTransaction), amount: -prFraisTransaction, kind: "delta" },
            { label: t("Garantie produit", "Product warranty"), display: fmtDeltaF(prGarantieProduit), amount: -prGarantieProduit, kind: "delta" },
            { label: t("Coût des refus", "Cost of refusals"), display: fmtDeltaF(prCoutRefus), amount: -prCoutRefus, kind: "delta" },
            { label: t("Publicité", "Advertising"), display: fmtDeltaF(prPublicite), amount: -prPublicite, kind: "delta" },
            { label: t("Commission LM", "LM commission"), display: fmtDeltaF(prCommissionLM), amount: -prCommissionLM, kind: "delta" },
            { label: t("Abonnement", "Subscription"), display: fmtDeltaF(prAbonnement), amount: -prAbonnement, kind: "delta" },
            { label: t("Résultat net", "Net result"), display: fmtF(prNetResult), amount: prNetResult, kind: "total" },
          ]}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
          <div className="rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "#38BDF8" }}>1</span>
              <div>
                <p className="text-[11px] font-semibold">{t("Prix produit partenaire", "Partner product price")}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
                  {t(
                    "En stockage management, c'est ce que vous avez payé pour constituer votre stock. En dropshipping, c'est le prix que le partenaire agréé a fixé et qu'il retient à chaque vente. Deux origines, une seule ligne.",
                    "In warehousing, it's what you paid to build your stock. In dropshipping, it's the price the approved partner set and keeps on every sale. Two origins, one line."
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "#38BDF8" }}>2</span>
              <div>
                <p className="text-[11px] font-semibold">{t("Frais logistiques, transaction, garantie", "Logistics, transaction, warranty")}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
                  {t(
                    "Les frais logistiques et la garantie produit sont fixés par le partenaire agréé. Les frais de transaction sont ceux des opérateurs mobile money, prélevés au moment du paiement.",
                    "Logistics fees and the product warranty are set by the approved partner. Transaction fees are the mobile-money operators', taken at the moment of payment."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge brute", "Gross margin")}</p>
            <p className="mt-1 text-lg font-figures-bold">{fmtF(prGrossMargin)}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce que laisse la marchandise, avant tout frais.", "What the goods leave, before any fees.")}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge de contribution", "Contribution margin")}</p>
            <p className="mt-1 text-lg font-figures-bold" style={{ color: "#0C86BE" }}>{fmtF(prContributionMargin)}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t("Après logistique et publicité. C'est le chiffre qui dit si le modèle tient : sous zéro, vendre plus fait perdre plus.", "After logistics and ads. This is the number that says if the model holds: below zero, selling more loses more.")}
            </p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "rgba(79,224,174,.14)" }}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Résultat net", "Net result")}</p>
            <p className="mt-1 text-lg font-figures-bold" style={{ color: "#0E9F6E" }}>{fmtF(prNetResult)}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Après commission et abonnement. Ce qui reste vraiment.", "After commission and subscription. What's really left.")}</p>
          </div>
        </div>
      </Card>
  );

  // Quatrième bloc : la comparaison stockage management / dropshipping —
  // deux colonnes bordées côte à côte (une couleur chacune), comme sur le
  // document envoyé : ring global à droite du header, badge "N commandes"
  // en tête de chaque colonne, lignes avec barre proportionnelle au panier
  // moyen de la colonne, puis taux de contribution / argent avancé en pied.
  const STOCKAGE_COLOR = "#38BDF8";
  const DROP_COLOR = "#EC4899";
  const comparaisonCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Vos deux façons de vendre, comparées", "Your two ways to sell, compared")}</h3>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("La même analyse, ramenée à une commande, de chaque côté", "The same analysis, brought down to one order, on each side")}</p>
          </div>
          <Ring pct={cmpRingPct} color={STOCKAGE_COLOR} trackColor={DROP_COLOR} size={72}>
            <span className="text-xs font-figures-bold">{cmpRingPct} %</span>
            <span className="text-[7px] text-[var(--dashboard-text)]/40">{t("stockage", "warehousing")}</span>
          </Ring>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
          {/* Colonne Stockage management */}
          <div className="rounded-2xl border p-3" style={{ borderColor: `${STOCKAGE_COLOR}40`, background: `${STOCKAGE_COLOR}0d` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold">{t("Stockage management", "Warehousing")}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--dashboard-text)]/40">
                  {t("Votre stock, déposé chez le partenaire. Vous avancez l'argent, vous gardez la marge.", "Your stock, held at the partner's. You front the cash, you keep the margin.")}
                </p>
              </div>
              <CountBadge count={cmpStockageOrders} color={STOCKAGE_COLOR} label={t("commandes", "orders")} />
            </div>
            <Divider />
            <CompareRow label={t("Panier moyen encaissé", "Average basket collected")} value={fmtF(cmpStockagePanier)} pct={100} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Prix produit, déjà payé au fournisseur", "Product price, already paid to supplier")} value={fmtDeltaF(cmpStockagePrixProduit)} pct={cmpStockagePctProduit} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Logistique, transaction, garantie", "Logistics, transaction, warranty")} value={fmtDeltaF(cmpLogistiqueFee)} pct={cmpStockagePctLogistique} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Acquisition du client", "Client acquisition")} value={fmtDeltaF(cmpAcquisitionFee)} pct={cmpStockagePctAcquisition} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Commission LM", "LM commission")} value={fmtDeltaF(cmpStockageCommission)} pct={cmpStockagePctCommission} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Marge de contribution", "Contribution margin")} value={fmtF(cmpStockageContribution)} pct={cmpStockagePctContribution} color={STOCKAGE_COLOR} strong />
            <Divider />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Taux de contribution", "Contribution rate")}</p>
                <p className="mt-0.5 text-sm font-figures-bold" style={{ color: STOCKAGE_COLOR }}>{fmtPct1(cmpStockageContributionRate)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Argent avancé", "Cash advanced")}</p>
                <p className="mt-0.5 text-sm font-figures-bold">{fmtF(stockDeposited)}</p>
              </div>
            </div>
          </div>

          {/* Colonne Dropshipping */}
          <div className="rounded-2xl border p-3" style={{ borderColor: `${DROP_COLOR}40`, background: `${DROP_COLOR}0d` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold">{t("Dropshipping", "Dropshipping")}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--dashboard-text)]/40">
                  {t("Le stock du partenaire. Vous n'avancez rien, il retient son prix à chaque vente.", "The partner's stock. You front nothing, they keep their price on every sale.")}
                </p>
              </div>
              <CountBadge count={cmpDropOrders} color={DROP_COLOR} label={t("commandes", "orders")} />
            </div>
            <Divider />
            <CompareRow label={t("Panier moyen encaissé", "Average basket collected")} value={fmtF(cmpDropPanier)} pct={100} color={DROP_COLOR} />
            <CompareRow label={t("Prix fixé par le partenaire, retenu à la vente", "Price set by the partner, kept on the sale")} value={fmtDeltaF(cmpDropPrixFixe)} pct={cmpDropPctProduit} color={DROP_COLOR} />
            <CompareRow label={t("Logistique, transaction, garantie", "Logistics, transaction, warranty")} value={fmtDeltaF(cmpLogistiqueFee)} pct={cmpDropPctLogistique} color={DROP_COLOR} />
            <CompareRow label={t("Acquisition du client", "Client acquisition")} value={fmtDeltaF(cmpAcquisitionFee)} pct={cmpDropPctAcquisition} color={DROP_COLOR} />
            <CompareRow label={t("Commission LM", "LM commission")} value={fmtDeltaF(cmpDropCommission)} pct={cmpDropPctCommission} color={DROP_COLOR} />
            <CompareRow label={t("Marge de contribution", "Contribution margin")} value={fmtF(cmpDropContribution)} pct={cmpDropPctContribution} color={DROP_COLOR} strong />
            <Divider />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Taux de contribution", "Contribution rate")}</p>
                <p className="mt-0.5 text-sm font-figures-bold" style={{ color: DROP_COLOR }}>{fmtPct1(cmpDropContributionRate)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Argent avancé", "Cash advanced")}</p>
                <p className="mt-0.5 text-sm font-figures-bold">0 F</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Ce que dit l'écart", "What the gap says")}</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {texteAvecChiffres(t(
              "Le stockage rapporte 1 234 F de plus par commande, mais immobilise 1 842 000 F. Rapporté à l'argent avancé, il rend environ 21 % sur trente jours. Le dropshipping ne rend rien de moins : il rend sans rien avancer. Le bon dosage dépend de votre trésorerie, pas de votre marge : gardez en stock ce qui tourne vite, laissez au partenaire ce qui dort.",
              "Warehousing yields 1 234 F more per order, but ties up 1 842 000 F. Against the cash advanced, that's roughly 21% over thirty days. Dropshipping yields no less — it yields without advancing anything. The right mix depends on your cash flow, not your margin: keep fast movers in stock, leave slow ones to the partner."
            ))}
          </p>
        </div>
      </Card>
  );

  // Rangée à deux colonnes du document : acquisition | coût des refus.
  const acquisitionCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("D'où viennent vos commandes", "Where your orders come from")}</h3>
          <Nature code="B" />
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Attribué par les pixels installés sur votre boutique", "Attributed by the pixels installed on your shop")}</p>
        <div className="mt-3 space-y-2">
          <DualBar revenuePct={acqMetaRevenuePct} spendPct={acqMetaSpendPct} />
          <DualBar revenuePct={acqTiktokRevenuePct} spendPct={acqTiktokSpendPct} />
          <DualBar revenuePct={acqGoogleRevenuePct} spendPct={acqGoogleSpendPct} />
          <DualBar revenuePct={acqYoutubeRevenuePct} spendPct={acqYoutubeSpendPct} />
          <DualBar revenuePct={0} spendPct={acqOrganicPct} />
        </div>
        <div className="mt-3 space-y-2.5">
          {[
            { name: t("Publicité Meta", "Meta ads"), roas: `${acqMetaRoas.toFixed(1).replace(".", ",")}×`, detail: t(`${fmtF(acqMetaSpend)} dépensés · ${fmtF(acqMetaRevenue)}`, `${fmtF(acqMetaSpend)} spent · ${fmtF(acqMetaRevenue)}`) },
            { name: t("Publicité TikTok", "TikTok ads"), roas: `${acqTiktokRoas.toFixed(1).replace(".", ",")}×`, detail: t(`${fmtF(acqTiktokSpend)} dépensés · ${fmtF(acqTiktokRevenue)}`, `${fmtF(acqTiktokSpend)} spent · ${fmtF(acqTiktokRevenue)}`) },
            { name: t("Publicité Google", "Google ads"), roas: `${acqGoogleRoas.toFixed(1).replace(".", ",")}×`, detail: t(`${fmtF(acqGoogleSpend)} dépensés · ${fmtF(acqGoogleRevenue)}`, `${fmtF(acqGoogleSpend)} spent · ${fmtF(acqGoogleRevenue)}`) },
            { name: t("Publicité YouTube", "YouTube ads"), roas: `${acqYoutubeRoas.toFixed(1).replace(".", ",")}×`, detail: t(`${fmtF(acqYoutubeSpend)} dépensés · ${fmtF(acqYoutubeRevenue)}`, `${fmtF(acqYoutubeSpend)} spent · ${fmtF(acqYoutubeRevenue)}`) },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--dashboard-text)]/60">{r.name}</span>
              <span className="text-right">
                <span className="font-semibold text-[#0E9F6E] font-figures">{r.roas}</span>
                <span className="ml-1.5 text-[10px] text-[var(--dashboard-text)]/40">{texteAvecChiffres(r.detail)}</span>
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[var(--dashboard-text)]/40">{t("Ventes organiques", "Organic sales")}</span>
            <span className="text-right text-[10px] text-[var(--dashboard-text)]/40">{texteAvecChiffres(t(`Aucune dépense · ${fmtF(acqOrganicRevenue)}`, `No spend · ${fmtF(acqOrganicRevenue)}`))}</span>
          </div>
        </div>
        <div className="mt-3 rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
          <p className="text-[11px] font-semibold">{t("Ce que la plateforme peut mesurer, et ce qu'elle ne peut pas", "What the platform can measure, and what it can't")}</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Seules les quatre régies qui posent un pixel sur votre page de commande sont attribuables : Meta, TikTok, Google, YouTube. Tout le reste — un live, un partage, un client qui revient, une recommandation — arrive sans étiquette et se range en ventes organiques. Aucun chiffre inventé n'est attribué à un live : ce serait faux, et une décision prise sur un chiffre faux coûte plus cher qu'une absence de chiffre.",
              "Only the four ad networks that place a pixel on your checkout page are attributable: Meta, TikTok, Google, YouTube. Everything else — a livestream, a share, a returning client, a referral — arrives with no label and is filed as organic. No invented number is attributed to a livestream: that would be false, and a decision made on a false number costs more than the absence of one."
            )}
          </p>
        </div>
        <Divider />
        <StatRow label={t("Seuil de rentabilité publicitaire", "Ad break-even threshold")} value={<span className="font-figures">2,4×</span>} />
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {texteAvecChiffres(t("En dessous de 2,4 fois la dépense, une commande coûte plus qu'elle ne rapporte. Vos quatre régies sont au-dessus.", "Below 2.4 times the spend, an order costs more than it brings in. Your four ad networks are above it."))}
        </p>
      </Card>
  );

  const refusCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Le coût de ce qui n'arrive pas", "The cost of what doesn't arrive")}</h3>
          <Nature code="B" />
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Un refus coûte selon le moment où il tombe", "A refusal costs depending on when it lands")}</p>
        <div className="mt-3 flex items-center gap-4">
          <Ring pct={refDeliveredPct} color="#4FE0AE">
            <span className="text-sm font-figures-bold">{fmtPct1(refDeliveredPct)}</span>
            <span className="text-[8px] text-[var(--dashboard-text)]/40">{t("Livrées", "Delivered")}</span>
          </Ring>
          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4FE0AE" }} />{t("Livrées et payées", "Delivered and paid")}</span><b className="font-figures">{refDeliveredPaid}</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FFB84D" }} />{t("Refusées à l'appel", "Refused on the call")}</span><b className="font-figures">{refRefusedCall}</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FF7A80" }} />{t("Refusées à la porte", "Refused at the door")}</span><b className="font-figures">{refRefusedDoor}</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--dashboard-text)]/20" />{t("Encore en route", "Still on the way")}</span><b className="font-figures">{refStillOnWay}</b></div>
          </div>
        </div>
        <StackedBar segments={[{ pct: refStackCallPct, color: "#FFB84D" }, { pct: refStackDoorPct, color: "#FF7A80" }]} />
        <Divider />
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,184,77,.1)" }}>
            <p className="text-[10px] font-semibold">{texteAvecChiffres(t(`Refusée à l'appel · ${refRefusedCall}`, `Refused on the call · ${refRefusedCall}`))}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t("Le centre d'appel annule depuis son interface avant que la course démarre. Aucun frais logistique, aucune marchandise sortie. Seule la publicité est perdue.", "The call center cancels from its interface before the run starts. No logistics fee, no goods out. Only the ad spend is lost.")}
            </p>
            <p className="mt-1.5 text-xs font-figures-bold" style={{ color: "#C07A0C" }}>{fmtF(refCostCall)}</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,122,128,.1)" }}>
            <p className="text-[10px] font-semibold">{texteAvecChiffres(t(`Refusée à la porte · ${refRefusedDoor}`, `Refused at the door · ${refRefusedDoor}`))}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t("Le livreur a démarré sa course et marque la commande non livrée. La livraison est due, la récupération aussi, et la marchandise repart.", "The rider has started the run and marks the order not delivered. Delivery is due, so is the pickup, and the goods go back.")}
            </p>
            <p className="mt-1.5 text-xs font-figures-bold" style={{ color: "#DC3A45" }}>{fmtF(refCostDoor)}</p>
          </div>
        </div>
        <Divider />
        <StatRow label={t("Marchandise revenue en stock (S)", "Goods back in stock (W)")} value={<span className="font-figures">{fmtF(refGoodsBackInStock)}</span>} />
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "En dropshipping, la marchandise refusée retourne chez le partenaire : elle ne pèse pas sur votre stock. En stockage management, elle revient chez lui à votre nom et redevient vendable.",
            "In dropshipping, refused goods go back to the partner: they don't weigh on your stock. In warehousing, they come back to him under your name and become sellable again."
          )}
        </p>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {t("Un refus à l'appel coûte trois fois moins qu'un refus à la porte. Faire appeler plus tôt est le levier le moins cher de cet écran.", "A refusal on the call costs three times less than at the door. Calling earlier is the cheapest lever on this screen.")}
        </p>
      </Card>
  );

  // Blocs pleine largeur suivants du document : produits, argent
  // immobilisé, trésorerie attendue.
  const produitsCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Ce que chaque produit laisse vraiment", "What each product really leaves")}</h3>
          <Tag tone="warn">{t("1 en perte", "1 at a loss")}</Tag>
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Marge de contribution par commande, publicité comprise", "Contribution margin per order, ads included")}</p>
        <div className="mt-3 space-y-3">
          {[
            { nature: "S", name: t("Sérum éclat 30 ml", "Radiance serum 30 ml"), pct: 82, val: fmtPctSigned1(prodVal0), tot: fmtSignedF(prodTot0), color: "#4FE0AE" },
            { nature: "S", name: t("Beurre de karité 200 g", "Shea butter 200 g"), pct: 68, val: fmtPctSigned1(prodVal1), tot: fmtSignedF(prodTot1), color: "#4FE0AE" },
            { nature: "D", name: t("Sac cabas en raphia", "Raffia tote bag"), pct: 49, val: fmtPctSigned1(prodVal2), tot: fmtSignedF(prodTot2), color: "#EC0C8C" },
            { nature: "D", name: t("Huile de ricin 100 ml", "Castor oil 100 ml"), pct: 22, val: fmtPctSigned1(prodVal3), tot: fmtSignedF(prodTot3), color: "#FFB84D" },
            { nature: "S", name: t("Sandales tressées", "Woven sandals"), pct: 11, val: fmtPctSigned1(prodVal4), tot: fmtSignedF(prodTot4), color: "#FF7A80" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 text-xs">
              <span className="flex w-40 shrink-0 items-center gap-1.5 truncate">
                <Tag tone={p.nature === "S" ? "blue" : "pink"} className="!px-1.5 !py-0.5">{p.nature}</Tag>
                {p.name}
              </span>
              <div className="flex-1 px-6">
                <Bar pct={p.pct} color="" background={p.color} />
              </div>
              <span className="w-12 shrink-0 text-right font-semibold font-figures">{p.val}</span>
              <span className="w-16 shrink-0 text-right text-[10px] text-[var(--dashboard-text)]/40 font-figures">{p.tot}</span>
            </div>
          ))}
        </div>
        <Divider />
        <p className="text-[10px] text-[var(--dashboard-text)]/50">
          {texteAvecChiffres(t("Les sandales tressées coûtent 340 F par commande après publicité : monter le prix, couper la pub dessus, ou les écouler sans les pousser.", "Woven sandals cost 340 F per order after ads: raise the price, cut ads on it, or clear it without pushing."))}
        </p>
        <Divider />
        <StatRow label={t("Part faite par vos 3 premiers produits", "Share made by your top 3 products")} value={<span className="font-figures">{prodTop3Share} %</span>} />
      </Card>
  );

  const immobiliseCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("L'argent que vous avez, sans l'avoir", "The money you have, without having it")}</h3>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Ce qui est immobilisé et ne peut pas servir aujourd'hui", "What's tied up and can't be used today")}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Total immobilisé", "Total tied up")}</p>
            <p className="mt-0.5 text-lg font-figures-bold" style={{ color: "#C07A0C" }}>{fmtF(immTotal)}</p>
          </div>
        </div>
        <StackedBar segments={[{ pct: immPctStock, color: "#8B5CF6" }, { pct: immPctSuspended, color: "#FFB84D" }, { pct: immPctShipped, color: "#38BDF8" }, { pct: immPctRefused, color: "#FF7A80" }]} />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <LegendRow color="#8B5CF6" badge={t("S", "W")} label={t("Stock déposé, en valeur d'achat", "Deposited stock, at cost")} value={fmtF(stockDeposited)} />
          <LegendRow color="#FFB84D" label={t("Suspendu, le temps du délai de litige", "On hold, for the dispute window")} value={fmtF(soldeSuspended)} />
          <LegendRow color="#38BDF8" label={t("Colis partis, pas encore livrés", "Shipped, not yet delivered")} value={fmtF(immShippedNotDelivered)} />
          <LegendRow color="#FF7A80" badge={t("S", "W")} label={t("Marchandise des refus, en retour", "Refused goods, coming back")} value={fmtF(immRefusedGoodsReturning)} />
        </div>
        <div className="mt-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Seul le stockage management immobilise du stock", "Only warehousing ties up stock")}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
            {t(
              "Les deux lignes marquées S ne concernent que le stockage management : c'est votre marchandise, payée d'avance et gardée chez le partenaire. En dropshipping, aucun stock ne vous appartient et rien n'est immobilisé de ce côté — c'est tout l'intérêt du modèle, et c'est aussi pourquoi sa marge est plus faible.",
              "The two lines marked W only apply to warehousing: it's your goods, paid upfront and held at the partner. In dropshipping, no stock belongs to you and nothing is tied up there — that's the whole point of the model, and also why its margin is lower."
            )}
          </p>
        </div>
        <Divider />
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
          {t("Combien de temps met votre argent à revenir", "How long it takes your money to come back")}
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[var(--dashboard-text)]/30 text-[8px] font-semibold text-[var(--dashboard-text)]/60">{t("S", "W")}</span>
        </p>
        <div className="mt-2 flex items-stretch gap-2.5 text-center text-[9px]">
          {[
            { v: t(fmtJours(cycleDaysAchat), fmtJours(cycleDaysAchat).replace(" j", " d")), l: t("Achat et dépôt", "Purchase & deposit") },
            { v: t(fmtJours(cycleDaysStock), fmtJours(cycleDaysStock).replace(" j", " d")), l: t("En stock avant vente", "In stock before sale") },
            { v: t(fmtJours(cycleDaysLivraison), fmtJours(cycleDaysLivraison).replace(" j", " d")), l: t("Livraison", "Delivery") },
            { v: t(fmtJours(cycleDaysLitige), fmtJours(cycleDaysLitige).replace(" j", " d")), l: t("Délai de litige", "Dispute window") },
          ].map((c, i) => (
            <div key={i} className="flex flex-1 items-center gap-2.5">
              <div className="min-w-0 flex-1 rounded-lg bg-[var(--dashboard-surface-2)] px-3 py-2.5">
                <p className="text-xs font-figures-bold">{c.v}</p>
                <p className="mt-0.5 text-[8px] leading-tight text-[var(--dashboard-text)]/40">{c.l}</p>
              </div>
              <span className="shrink-0 text-[var(--dashboard-text)]/25">{i === 3 ? "=" : "→"}</span>
            </div>
          ))}
          <div className="min-w-0 flex-1 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,184,77,.15)" }}>
            <p className="text-xs font-figures-bold" style={{ color: "#C07A0C" }}>{fmtJours(cycleDaysTotal)}</p>
            <p className="mt-0.5 text-[8px] leading-tight text-[var(--dashboard-text)]/40">{t("Du franc sorti au franc disponible", "From cash out to cash available")}</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {texteAvecChiffres(t(
            "Ce cycle n'existe qu'en stockage management. En dropshipping il n'y a pas de franc sorti : le délai se réduit aux 4,1 jours entre la vente et la fin de suspension. Chaque jour retiré du stock libère environ 100 000 F.",
            "This cycle only exists in warehousing. In dropshipping there's no cash out: the window shrinks to the 4.1 days between sale and end of hold. Each day taken off stock frees up about 100 000 F."
          ))}
        </p>
      </Card>
  );

  const projectionCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Trésorerie attendue", "Expected cash")}</h3>
          <div className="flex items-center gap-1.5">
            <Tag tone="blue">{t("Projection", "Forecast")}</Tag>
            <Nature code="B" />
          </div>
        </div>
        <div className="mt-3 grid items-start gap-5 sm:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
          <div>
            <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("30 prochains jours, au rythme actuel", "Next 30 days, at the current pace")}</p>
            <AreaChart values={forecastDays} color="#38BDF8" />
            <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40 font-figures">
              <span className="font-sans">{t("Auj.", "Today")}</span><span>+10 j</span><span>+20 j</span><span>+30 j</span>
            </div>
          </div>
          <div>
            <StatRow label={t("Solde attendu dans 30 jours", "Expected balance in 30 days")} value={<span className="text-[#0E9F6E] font-figures">{fmtF(projExpectedBalance30d)}</span>} />
            <StatRow label={t("Suspensions qui se libèrent", "Holds being released")} value={<span className="font-figures">{fmtF(soldeSuspended)}</span>} />
            <StatRow label={t("Réapprovisionnement à prévoir (S)", "Restock to plan (W)")} value={texteAvecChiffres(t("Vers le 22 sept.", "Around Sept. 22"))} />
            <StatRow label={t("Abonnement", "Subscription")} value={texteAvecChiffres(t(`Le 14 · ${fmtF(prAbonnement)}`, `On the 14th · ${fmtF(prAbonnement)}`))} />
            <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
              {texteAvecChiffres(t("Aucun creux sous zéro n'est prévu. Un réapprovisionnement avancé au 19 passerait la courbe au rouge 3 jours.", "No dip below zero is expected. Restocking on the 19th would push the curve red for 3 days."))}
            </p>
          </div>
        </div>
      </Card>
  );

  // Ordre et disposition = le document "Accueil · Finance" envoyé :
  // 1) portefeuille + solde côte à côte, 2) trésorerie, 3) compte de
  // résultat, 4) stockage vs drop, 5) acquisition + refus côte à côte,
  // 6) produits, 7) argent immobilisé, 8) projection — tout en pleine
  // largeur sauf les deux rangées à deux colonnes explicitement notées
  // "côte à côte" dans le document.
  // "Exporter" : solde du sous-compte, indicateurs de trésorerie et
  // compte de résultat de la période (cascade du WaterfallChart ci-dessus).
  const [exportDone, setExportDone] = useState(false);
  function handleExport() {
    openBrandedReport(t("Finances", "Finances"), t("Où va votre argent", "Where your money goes"), [
      {
        heading: t("Solde du sous-compte", "Sub-account balance"),
        rows: [
          [t("Solde total", "Total balance"), fmtF(soldeTotal)],
          [t("Disponible tout de suite", "Available right away"), fmtF(soldeAvailable)],
          [t("Suspendu · délai de litige", "On hold · dispute window"), fmtF(soldeSuspended)],
        ],
      },
      {
        heading: t("Trésorerie", "Cash flow"),
        rows: [
          [t("Point le plus bas", "Lowest point"), fmtF(cashLowest)],
          [t("Point le plus haut", "Highest point"), fmtF(cashHighest)],
          [t("Solde moyen", "Average balance"), fmtF(cashAvg)],
          [t("Variation", "Change"), `+${cashVariationPct} %`],
        ],
      },
      {
        heading: t("Compte de résultat de la période", "P&L for the period"),
        columns: [t("Poste", "Item"), t("Montant", "Amount")],
        rows: [
          [t("Encaissé des clients", "Collected from clients"), fmtF(prEncaisse)],
          [t("Prix produit partenaire", "Partner product price"), fmtDeltaF(prPrixProduit)],
          [t("Frais logistiques", "Logistics fees"), fmtDeltaF(prFraisLogistiques)],
          [t("Frais de transaction", "Transaction fees"), fmtDeltaF(prFraisTransaction)],
          [t("Garantie produit", "Product warranty"), fmtDeltaF(prGarantieProduit)],
          [t("Coût des refus", "Cost of refusals"), fmtDeltaF(prCoutRefus)],
          [t("Publicité", "Advertising"), fmtDeltaF(prPublicite)],
          [t("Commission LM", "LM commission"), fmtDeltaF(prCommissionLM)],
          [t("Abonnement", "Subscription"), fmtDeltaF(prAbonnement)],
          [t("Résultat net", "Net result"), fmtF(prNetResult)],
        ],
      },
    ]);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  return (
    <>
      <SectionHeader
        eyebrow={t("Finances", "Finances")}
        title={t("Où va votre argent", "Where your money goes")}
        subtitle={t("Ce que la période a encaissé, prélevé et laissé.", "What this period collected, deducted and left over.")}
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
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-glass)] px-4 py-3 text-[10px] text-[var(--dashboard-text)]/50 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
        <span className="flex items-center gap-1.5"><Nature code="S" /> {t("Stockage management", "Warehousing")}</span>
        <span className="flex items-center gap-1.5"><Nature code="D" /> {t("Dropshipping", "Drop-shipping")}</span>
        <span className="flex items-center gap-1.5"><Nature code="B" /> {t("Les deux", "Both")}</span>
        <span className="ml-auto">{t("La couleur dit à quelle façon de vendre le montant se rapporte.", "The color shows which way of selling the amount relates to.")}</span>
      </div>

      {/* 3 premiers blocs (portefeuille+solde, trésorerie, compte de
          résultat) toujours visibles ; le reste (comparaison stockage/drop,
          acquisition+refus, produits, argent immobilisé, projection) passe
          sous le bouton "Voir tout le contenu" de CollapsibleCards — cf.
          shared.tsx. */}
      <div className="grid gap-3 [&>*]:min-w-0">
        <CollapsibleCards visibleCount={3}>
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(300px,380px)_1fr] [&>*]:min-w-0">
            <PaymentMethodCard />
            {soldeCard}
          </div>

          {evolutionCard}
          {compteResultatCard}
          {comparaisonCard}

          <div className="grid items-start gap-3 sm:grid-cols-2 [&>*]:min-w-0">
            {acquisitionCard}
            {refusCard}
          </div>

          {produitsCard}
          {immobiliseCard}
          {projectionCard}
        </CollapsibleCards>
      </div>
    </>
  );
}
