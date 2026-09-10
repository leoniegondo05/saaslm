"use client";

import { useState } from "react";
import { Card, Divider, NatureRow, Nature, ProductSelector, SectionHeader, StatRow, TopProductRow } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Produits" (natures) de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/

// Catalogue drop (nature P + L) pour la carte "Ma position sur les prix drop".
// Chiffres statiques, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
const PRIX_DROP = [
  { nom: "Montre connectée S8", nomEn: "S8 connected watch", achat: 6200, vente: 14000, margeNette: 31, venduPar: 42, prixMoyenReseau: 13400, ecart: "+ 4 %", bas: 5400, moyen: 7100, haut: 8900, position: 38 },
  { nom: "Casque sans fil X2", nomEn: "X2 wireless headset", achat: 4800, vente: 11000, margeNette: 34, venduPar: 29, prixMoyenReseau: 10600, ecart: "+ 4 %", bas: 4200, moyen: 5600, haut: 7100, position: 41 },
  { nom: "Lotion tonique", nomEn: "Toning lotion", achat: 3800, vente: 8900, margeNette: 38, venduPar: 18, prixMoyenReseau: 9200, ecart: "− 3 %", bas: 3300, moyen: 4600, haut: 5900, position: 33 },
  { nom: "Gel nettoyant", nomEn: "Cleansing gel", achat: 2200, vente: 6000, margeNette: 36, venduPar: 15, prixMoyenReseau: 5800, ecart: "+ 3 %", bas: 1900, moyen: 2700, haut: 3500, position: 44 },
  { nom: "Enceinte Bluetooth mini", nomEn: "Mini Bluetooth speaker", achat: 5100, vente: 12500, margeNette: 33, venduPar: 24, prixMoyenReseau: 12100, ecart: "+ 3 %", bas: 4500, moyen: 6100, haut: 7800, position: 47 },
  { nom: "Chargeur sans fil 15W", nomEn: "15W wireless charger", achat: 2600, vente: 6800, margeNette: 40, venduPar: 33, prixMoyenReseau: 6500, ecart: "+ 5 %", bas: 2200, moyen: 3100, haut: 4000, position: 52 },
  { nom: "Écouteurs sport", nomEn: "Sport earbuds", achat: 3400, vente: 9200, margeNette: 37, venduPar: 27, prixMoyenReseau: 8900, ecart: "+ 3 %", bas: 3000, moyen: 4200, haut: 5400, position: 45 },
  { nom: "Ceinture connectée", nomEn: "Connected belt", achat: 4700, vente: 10500, margeNette: 30, venduPar: 11, prixMoyenReseau: 11200, ecart: "− 6 %", bas: 4000, moyen: 5500, haut: 7000, position: 27 },
  { nom: "Lampe LED USB", nomEn: "USB LED lamp", achat: 1500, vente: 4200, margeNette: 41, venduPar: 19, prixMoyenReseau: 4000, ecart: "+ 5 %", bas: 1400, moyen: 1900, haut: 2500, position: 55 },
  { nom: "Support téléphone voiture", nomEn: "Car phone mount", achat: 1200, vente: 3500, margeNette: 43, venduPar: 22, prixMoyenReseau: 3300, ecart: "+ 6 %", bas: 1100, moyen: 1600, haut: 2100, position: 58 },
  { nom: "Powerbank 10000 mAh", nomEn: "10000 mAh power bank", achat: 3900, vente: 9800, margeNette: 35, venduPar: 31, prixMoyenReseau: 9500, ecart: "+ 3 %", bas: 3400, moyen: 4700, haut: 6100, position: 43 },
  { nom: "Câble USB-C tressé", nomEn: "Braided USB-C cable", achat: 800, vente: 2500, margeNette: 45, venduPar: 26, prixMoyenReseau: 2300, ecart: "+ 9 %", bas: 700, moyen: 1000, haut: 1300, position: 61 },
];

export default function ProduitsSection({ first = true }: { first?: boolean }) {
  const { t, langue } = useDashboardLangue();
  const [selectedDrop, setSelectedDrop] = useState(0);
  const drop = PRIX_DROP[selectedDrop];
  const numberLocale = langue === "EN" ? "en-US" : "fr-FR";
  return (
    <>
      <SectionHeader
        eyebrow={t("Produits", "Products")}
        title={t("Vos quatre façons de vendre", "Your four ways to sell")}
        subtitle={t("Ce que chaque nature de produit vous rapporte.", "What each type of product earns you.")}
        count={t("20 indicateurs", "20 metrics")}
        first={first}
        layout="inline"
      />

      <div className="grid items-start gap-3 lg:grid-cols-3">
        <Card
          title={t("Top 5 des produits", "Top 5 products")}
          titleTab
          className="!bg-[var(--dashboard-glass)]"
          badge={<p className="text-[10px] text-[var(--dashboard-text)]/40">{t("sur la période", "this period")}</p>}
        >
          <TopProductRow code="L" name={t("Montre connectée S8", "S8 connected watch")} value="48 · 672 000" pct={100} background="linear-gradient(90deg, #FF8BCB 0%, #EC0C8C 100%)" />
          <TopProductRow code="S" name={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} value="37 · 444 000" pct={77} background="#8B90A6" />
          <TopProductRow code="P" name={t("Casque sans fil X2", "X2 wireless headset")} value="21 · 231 000" pct={44} background="#2F6BE0BF" />
          <TopProductRow code="S" name={t("Huile de ricin", "Castor oil")} value="14 · 105 000" pct={29} background="#FFFFFF" />
          <TopProductRow code="O" name={t("Coffret parfum", "Perfume gift set")} value="9 · 81 000" pct={19} background="#8B90A666" />
          <Divider />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
            {t("Les moins rentables", "Least profitable")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Nature code="S" />
              {t("Bracelet cuir", "Leather bracelet")}
            </span>
            <span className="text-[var(--dashboard-text)]/50">{t("2 ventes · 29 %", "2 sales · 29%")}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Nature code="P" />
              {t("Gel nettoyant", "Cleansing gel")}
            </span>
            <span className="text-[var(--dashboard-text)]/50">{t("4 ventes · 36 %", "4 sales · 36%")}</span>
          </div>
          <Divider />
          <p className="text-[10px] text-[var(--dashboard-text)]/40">
            {t("S · stocké Management · drop LM", "S · warehoused Management · LM drop")}
          </p>
        </Card>

        <Card title={t("Vos quatre natures de produits", "Your four product types")} titleTab className="!bg-[var(--dashboard-glass)]">
          <div className="mt-2 flex h-2 overflow-hidden rounded-full">
            <span className="h-full" style={{ width: "36%", background: "var(--dashboard-surface-2)" }} />
            <span className="h-full bg-[var(--dashboard-text)]/30" style={{ width: "17%" }} />
            <span className="h-full bg-[#2F6BE0]" style={{ width: "29%" }} />
            <span className="h-full bg-brand-pink" style={{ width: "18%" }} />
          </div>
          <NatureRow code="S" name={t("Stockage Management", "Management warehousing")} value="4 · 284 500" note={t("Marge 46 % · 240 unités immobilisées · 22 j de couverture", "46% margin · 240 units tied up · 22 days of cover")} />
          <NatureRow code="D" name={t("Drop", "Drop")} value="8 · 112 000" note={t("Marge 71 % · vous livrez vous-même · aucun frais partenaire", "71% margin · you deliver yourself · no partner fees")} last />
          <Divider />
          <StatRow label={t("Nature qui vend le plus", "Best-selling type")} value={t("Drop du partenaire", "Partner drop")} />
        </Card>

        <div>
          <Card title={t("Ma position sur les prix drop", "My position on drop pricing")} titleTab className="!bg-[var(--dashboard-glass)]">
            <ProductSelector
              name={t(drop.nom, drop.nomEn)}
              position={t(
                `Produit ${selectedDrop + 1} sur ${PRIX_DROP.length}`,
                `Product ${selectedDrop + 1} of ${PRIX_DROP.length}`
              )}
              className="mt-2"
              onPrev={() => setSelectedDrop((i) => (i - 1 + PRIX_DROP.length) % PRIX_DROP.length)}
              onNext={() => setSelectedDrop((i) => (i + 1) % PRIX_DROP.length)}
            />
            <p className="mt-3 mb-3 text-xs">
              {t("Vous payez", "You pay")} <b>{drop.achat.toLocaleString(numberLocale)} F</b> · {t("vous revendez", "you resell for")} <b>{drop.vente.toLocaleString(numberLocale)} F</b>
            </p>
            <div className="relative mt-3 h-1 rounded-full bg-[linear-gradient(90deg,#C9CFDD,#EC0C8C)]">
              <span
                className="absolute -top-1.5 h-4 w-0.5 rounded-full bg-[var(--dashboard-text)] shadow-[0_0_0_2px_var(--dashboard-card-bg)]"
                style={{ left: `${drop.position}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
              <span>{t("Bas", "Low")} {drop.bas.toLocaleString(numberLocale)}</span>
              <span>{t("Moyen", "Average")} {drop.moyen.toLocaleString(numberLocale)}</span>
              <span>{t("Haut", "High")} {drop.haut.toLocaleString(numberLocale)}</span>
            </div>
            <Divider />
            <StatRow label={t("Marge nette", "Net margin")} value={`${drop.margeNette} %`} />
            <StatRow label={t("Vendu par", "Sold by")} value={t(`${drop.venduPar} boutiques`, `${drop.venduPar} shops`)} />
            <StatRow label={t("Prix moyen du réseau", "Network average price")} value={`${drop.prixMoyenReseau.toLocaleString(numberLocale)} F`} />
            <StatRow label={t("Votre écart au marché", "Your gap to market")} value={drop.ecart} />
          </Card>

          <Card title={t("Catalogue accessible", "Accessible catalog")} titleTab className="mt-3 !bg-[var(--dashboard-glass)]">
            <StatRow label={t("Drop", "Drop")} value="117" />
            <StatRow label={t("Nouveautés ce mois", "New this month")} value="12" />
            <StatRow label={t("Produits à venir", "Coming soon")} value="6" />
            <StatRow label={t("Jamais vendus chez vous", "Never sold by you")} value="3" />
            <StatRow label={t("Mis de côté", "Set aside")} value="5" />
          </Card>
        </div>
      </div>
    </>
  );
}
