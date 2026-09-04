"use client";

import { useState } from "react";
import { Card, Divider, NatureRow, Nature, ProductSelector, SectionHeader, StatRow, TopProductRow } from "./shared";

/*
  Section "Produits" (natures) de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/

// Catalogue drop (nature P + L) pour la carte "Ma position sur les prix drop".
// Chiffres statiques, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
const PRIX_DROP = [
  { nom: "Montre connectée S8", achat: 6200, vente: 14000, margeNette: 31, venduPar: 42, prixMoyenReseau: 13400, ecart: "+ 4 %", bas: 5400, moyen: 7100, haut: 8900, position: 38 },
  { nom: "Casque sans fil X2", achat: 4800, vente: 11000, margeNette: 34, venduPar: 29, prixMoyenReseau: 10600, ecart: "+ 4 %", bas: 4200, moyen: 5600, haut: 7100, position: 41 },
  { nom: "Lotion tonique", achat: 3800, vente: 8900, margeNette: 38, venduPar: 18, prixMoyenReseau: 9200, ecart: "− 3 %", bas: 3300, moyen: 4600, haut: 5900, position: 33 },
  { nom: "Gel nettoyant", achat: 2200, vente: 6000, margeNette: 36, venduPar: 15, prixMoyenReseau: 5800, ecart: "+ 3 %", bas: 1900, moyen: 2700, haut: 3500, position: 44 },
  { nom: "Enceinte Bluetooth mini", achat: 5100, vente: 12500, margeNette: 33, venduPar: 24, prixMoyenReseau: 12100, ecart: "+ 3 %", bas: 4500, moyen: 6100, haut: 7800, position: 47 },
  { nom: "Chargeur sans fil 15W", achat: 2600, vente: 6800, margeNette: 40, venduPar: 33, prixMoyenReseau: 6500, ecart: "+ 5 %", bas: 2200, moyen: 3100, haut: 4000, position: 52 },
  { nom: "Écouteurs sport", achat: 3400, vente: 9200, margeNette: 37, venduPar: 27, prixMoyenReseau: 8900, ecart: "+ 3 %", bas: 3000, moyen: 4200, haut: 5400, position: 45 },
  { nom: "Ceinture connectée", achat: 4700, vente: 10500, margeNette: 30, venduPar: 11, prixMoyenReseau: 11200, ecart: "− 6 %", bas: 4000, moyen: 5500, haut: 7000, position: 27 },
  { nom: "Lampe LED USB", achat: 1500, vente: 4200, margeNette: 41, venduPar: 19, prixMoyenReseau: 4000, ecart: "+ 5 %", bas: 1400, moyen: 1900, haut: 2500, position: 55 },
  { nom: "Support téléphone voiture", achat: 1200, vente: 3500, margeNette: 43, venduPar: 22, prixMoyenReseau: 3300, ecart: "+ 6 %", bas: 1100, moyen: 1600, haut: 2100, position: 58 },
  { nom: "Powerbank 10000 mAh", achat: 3900, vente: 9800, margeNette: 35, venduPar: 31, prixMoyenReseau: 9500, ecart: "+ 3 %", bas: 3400, moyen: 4700, haut: 6100, position: 43 },
  { nom: "Câble USB-C tressé", achat: 800, vente: 2500, margeNette: 45, venduPar: 26, prixMoyenReseau: 2300, ecart: "+ 9 %", bas: 700, moyen: 1000, haut: 1300, position: 61 },
];

export default function ProduitsSection({ first = true }: { first?: boolean }) {
  const [selectedDrop, setSelectedDrop] = useState(0);
  const drop = PRIX_DROP[selectedDrop];
  return (
    <>
      <SectionHeader
        eyebrow="Produits"
        title="Vos quatre façons de vendre"
        subtitle="Ce que chaque nature de produit vous rapporte."
        count="20 indicateurs"
        first={first}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Card
          title="Top 5 des produits"
          titleTab
          className="!bg-white"
          badge={<p className="text-[10px] text-[#141220]/40">sur la période</p>}
        >
          <TopProductRow code="L" name="Montre connectée S8" value="48 · 672 000" pct={100} />
          <TopProductRow code="S" name="Sérum éclat 30 ml" value="37 · 444 000" pct={77} />
          <TopProductRow code="P" name="Casque sans fil X2" value="21 · 231 000" pct={44} />
          <TopProductRow code="S" name="Huile de ricin" value="14 · 105 000" pct={29} />
          <TopProductRow code="O" name="Coffret parfum" value="9 · 81 000" pct={19} />
          <Divider />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
            Les moins rentables
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Nature code="S" />
              Bracelet cuir
            </span>
            <span className="text-[#141220]/50">2 ventes · 29 %</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Nature code="P" />
              Gel nettoyant
            </span>
            <span className="text-[#141220]/50">4 ventes · 36 %</span>
          </div>
          <Divider />
          <p className="text-[10px] text-[#141220]/40">
            S · stocké chez le partenaire &nbsp; P · drop du partenaire &nbsp; L · drop LM &nbsp; O · produit propre
          </p>
        </Card>

        <Card title="Vos quatre natures de produits" titleTab className="!bg-white">
          <div className="mt-2 flex h-2 overflow-hidden rounded-full">
            <span className="h-full" style={{ width: "36%", background: "#141220" }} />
            <span className="h-full bg-[#141220]/30" style={{ width: "17%" }} />
            <span className="h-full bg-[#2F6BE0]" style={{ width: "29%" }} />
            <span className="h-full bg-brand-pink" style={{ width: "18%" }} />
          </div>
          <NatureRow code="S" name="Stockage Management" value="4 · 284 500" note="Marge 46 % · 240 unités immobilisées · 22 j de couverture" />
          <NatureRow code="D" name="Drop" value="8 · 112 000" note="Marge 71 % · vous livrez vous-même · aucun frais partenaire" />
          <NatureRow code="D" name="Drop" value="7 · 301 000" note="Marge 34 % · aucun stock avancé · 1 litige" />
          <NatureRow code="D" name="Drop" value="5 · 145 000" note="Marge 31 % · catalogue de la plateforme · 3 litiges" last />
          <Divider />
          <StatRow label="Nature la plus rentable" value="Drop" />
          <StatRow label="Nature qui vend le plus" value="Drop" />
        </Card>

        <div>
          <Card title="Ma position sur les prix drop" titleTab className="!bg-white">
            <ProductSelector
              name={drop.nom}
              position={`Produit ${selectedDrop + 1} sur ${PRIX_DROP.length}`}
              className="mt-2"
              onPrev={() => setSelectedDrop((i) => (i - 1 + PRIX_DROP.length) % PRIX_DROP.length)}
              onNext={() => setSelectedDrop((i) => (i + 1) % PRIX_DROP.length)}
            />
            <p className="mt-2 text-xs">
              Vous payez <b>{drop.achat.toLocaleString("fr-FR")} F</b> · vous revendez <b>{drop.vente.toLocaleString("fr-FR")} F</b>
            </p>
            <div className="relative mt-3 h-1 rounded-full bg-[linear-gradient(90deg,#C9CFDD,#EC0C8C)]">
              <span
                className="absolute -top-1.5 h-4 w-0.5 rounded-full bg-[#141220] shadow-[0_0_0_2px_#fff]"
                style={{ left: `${drop.position}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
              <span>Bas {drop.bas.toLocaleString("fr-FR")}</span>
              <span>Moyen {drop.moyen.toLocaleString("fr-FR")}</span>
              <span>Haut {drop.haut.toLocaleString("fr-FR")}</span>
            </div>
            <Divider />
            <StatRow label="Marge nette" value={`${drop.margeNette} %`} />
            <StatRow label="Vendu par" value={`${drop.venduPar} boutiques`} />
            <StatRow label="Prix moyen du réseau" value={`${drop.prixMoyenReseau.toLocaleString("fr-FR")} F`} />
            <StatRow label="Votre écart au marché" value={drop.ecart} />
          </Card>

          <Card title="Catalogue accessible" className="mt-3">
            <StatRow label="Produits du partenaire" value="117" />
            <StatRow label="Produits LM" value="64" />
            <StatRow label="Nouveautés ce mois" value="12" />
            <StatRow label="Produits à venir" value="6" />
            <StatRow label="Jamais vendus chez vous" value="3" />
            <StatRow label="Mis de côté" value="5" />
          </Card>
        </div>
      </div>
    </>
  );
}
