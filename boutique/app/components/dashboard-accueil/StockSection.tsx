"use client";

import { useState } from "react";
import { Btn, Card, Divider, Nature, ProductSelector, QuickStat, SectionHeader, StatRow, Table, Tag } from "./shared";

/*
  Section "Stock" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/

type Depot = {
  name: string;
  nature: "S" | "P" | "L" | "O";
  deposedLe: string;
  entrepot: string;
  reference: string;
  garantie: string;
  tag: { label: string; tone: "ok" | "warn" | "ko" | "dark" };
  quick: [string, string, string, string, string];
  quick2: [string, string, string, string, string];
  parcours: { debut: string; fin: string };
  note: string;
  restant: string;
  valeur: string;
  sortieMoyenne: string;
  ruptureEstimee: string;
  rotation: string;
};

// 4 dépôts en cours — repris de la table "Mes quatre dépôts" ci-dessous, un
// jeu de données complet par dépôt pour alimenter la fiche + le panneau
// "Évolution du stock" quand on navigue au carousel.
const DEPOTS: Depot[] = [
  {
    name: "Sérum éclat 30 ml",
    nature: "S",
    deposedLe: "Déposé le 22 août à 09 h 40",
    entrepot: "Entrepôt Yopougon",
    reference: "dépôt DP-0341",
    garantie: "garantie souscrite",
    tag: { label: "3 unités écartées", tone: "ko" },
    quick: ["120", "117", "3", "117", "34"],
    quick2: ["83", "6", "514 600", "22 j", "12 000"],
    parcours: { debut: "22 août", fin: "23 août" },
    note: "3 flacons cassés relevés au contrôle, photos jointes par le partenaire. Un litige reste ouvrable jusqu'au 22 septembre.",
    restant: "83",
    valeur: "514 600 F",
    sortieMoyenne: "1,6 par jour",
    ruptureEstimee: "21 septembre",
    rotation: "0,4 fois par mois",
  },
  {
    name: "Huile de ricin 100 ml",
    nature: "S",
    deposedLe: "Déposé le 28 août à 14 h 10",
    entrepot: "Entrepôt Cocody",
    reference: "dépôt DP-0288",
    garantie: "sans garantie",
    tag: { label: "Contrôle en cours", tone: "warn" },
    quick: ["60", "—", "—", "60", "58"],
    quick2: ["2", "1", "2 400", "1 j", "—"],
    parcours: { debut: "28 août", fin: "29 août" },
    note: "Dépôt encore au contrôle de conformité, résultat attendu aujourd'hui. Couverture très faible, réassort à prévoir.",
    restant: "2",
    valeur: "2 400 F",
    sortieMoyenne: "2,1 par jour",
    ruptureEstimee: "5 septembre",
    rotation: "1,9 fois par mois",
  },
  {
    name: "Beurre de karité 200 g",
    nature: "S",
    deposedLe: "Déposé le 12 août à 08 h 15",
    entrepot: "Entrepôt Marcory",
    reference: "dépôt DP-0402",
    garantie: "garantie souscrite",
    tag: { label: "Conforme", tone: "ok" },
    quick: ["200", "200", "0", "200", "73"],
    quick2: ["127", "15", "762 000", "34 j", "8 000"],
    parcours: { debut: "12 août", fin: "13 août" },
    note: "Aucun écart relevé au contrôle, dépôt clôturé conforme. Bonne couverture, pas de réassort à prévoir dans l'immédiat.",
    restant: "127",
    valeur: "762 000 F",
    sortieMoyenne: "3,2 par jour",
    ruptureEstimee: "6 octobre",
    rotation: "0,9 fois par mois",
  },
  {
    name: "Coffret parfum",
    nature: "P",
    deposedLe: "Déposé le 2 août à 10 h 30",
    entrepot: "Entrepôt Yopougon",
    reference: "dépôt DP-0195",
    garantie: "sans garantie",
    tag: { label: "Rupture de stock", tone: "dark" },
    quick: ["40", "40", "0", "40", "40"],
    quick2: ["0", "0", "0", "Rupture", "0"],
    parcours: { debut: "2 août", fin: "3 août" },
    note: "Dernier flacon vendu le 2 août. Dépôt épuisé, réassort à prévoir avec le partenaire.",
    restant: "0",
    valeur: "0 F",
    sortieMoyenne: "1,3 par jour",
    ruptureEstimee: "Déjà en rupture",
    rotation: "1,2 fois par mois",
  },
];

export default function StockSection({ first = true }: { first?: boolean }) {
  const [index, setIndex] = useState(0);
  const depot = DEPOTS[index];
  const goPrev = () => setIndex((i) => (i - 1 + DEPOTS.length) % DEPOTS.length);
  const goNext = () => setIndex((i) => (i + 1) % DEPOTS.length);

  return (
    <>
      <SectionHeader
        eyebrow="Stock"
        title="Ce que vous avez confié"
        subtitle="Chaque dépôt, du départ de chez vous jusqu'à la vente."
        count="Flèches pour changer de produit"
        first={first}
      />

      <div className="grid gap-3 lg:grid-cols-[1.9fr_1fr]">
        <Card className="!bg-white">
          <div className="flex items-center justify-between gap-3">
            <p
              className="rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8095]"
              style={{ background: "#F0EDF0" }}
            >
              Fiche d&apos;un dépôt
            </p>
            <ProductSelector
              name={depot.name}
              position={`Dépôt ${index + 1} sur ${DEPOTS.length}`}
              onPrev={goPrev}
              onNext={goNext}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Nature code={depot.nature} />
              <div>
                <p className="text-xs font-semibold">{depot.deposedLe}</p>
                <p className="text-[10px] text-[#141220]/40">
                  {depot.entrepot} · {depot.reference} · {depot.garantie}
                </p>
              </div>
            </div>
            <Tag tone={depot.tag.tone}>{depot.tag.label}</Tag>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            <QuickStat label="Quantité déposée" value={depot.quick[0]} />
            <QuickStat label="Reçu conforme" value={depot.quick[1]} tone="ok" />
            <QuickStat label="Endommagé à la réception" value={depot.quick[2]} tone="ko" />
            <QuickStat label="Mis en distribution" value={depot.quick[3]} />
            <QuickStat label="Vendu sur la période" value={depot.quick[4]} />
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            <QuickStat label="Restant en entrepôt" value={depot.quick2[0]} />
            <QuickStat label="Réservé aux commandes" value={depot.quick2[1]} />
            <QuickStat label="Valeur immobilisée" value={depot.quick2[2]} />
            <QuickStat label="Couverture" value={depot.quick2[3]} />
            <QuickStat label="Frais de garantie" value={depot.quick2[4]} />
          </div>

          <Divider />
          <div className="flex items-center justify-between text-[10px] text-[#141220]/40">
            <span>Parcours du dépôt</span>
            <span>{depot.parcours.debut} → {depot.parcours.fin}</span>
          </div>
          <div className="mt-2 flex gap-1">
            {[1, 1, 1, 1].map((_, i) => (
              <span key={i} className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
            <span>Demande envoyée</span>
            <span>Récupérée chez moi</span>
            <span>Contrôle de conformité</span>
            <span>Disponible à la vente</span>
          </div>

          <Divider />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-[10px] text-[#141220]/40">{depot.note}</p>
            <div className="flex gap-2">
              <span className="rounded-full border border-[#141220]/15 px-3.5 py-2 text-[10px] font-semibold">
                Voir le contrôle
              </span>
              <span className="rounded-full border border-brand-pink/40 px-3.5 py-2 text-[10px] font-semibold text-brand-pink">
                Ouvrir un litige
              </span>
            </div>
          </div>

          <Divider />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Mes quatre dépôts
            </p>
            <Tag tone="dark">240 unités · 1 209 100 F</Tag>
          </div>
          <Table
            className="mt-3"
            head={["Produit", "Déposé le", "Stocké", "Conforme", "Endommagé", "Vendu", "Restant", "Couverture"]}
            rows={[
              ["Sérum éclat 30 ml", "22 août", "120", "117", "3", "34", "83", "22 j"],
              ["Huile de ricin 100 ml", "28 août", "60", "—", "—", "58", "2", "1 j"],
              ["Beurre de karité 200 g", "12 août", "200", "200", "0", "73", "127", "34 j"],
              ["Coffret parfum", "2 août", "40", "40", "0", "40", "0", "Rupture"],
            ]}
            evolutions={[
              [4, 6, 8, 9],
              [2, 5, 4, 8],
              [5, 5, 6, 8],
              [6, 4, 2, 1],
            ]}
            activeIndex={index}
            onRowClick={setIndex}
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Produits que je revends sans stock · drop
            </p>
            <div className="flex gap-1.5">
              <Tag tone="blue">3 du partenaire</Tag>
              <Tag tone="pink">2 de LM</Tag>
            </div>
          </div>
          <Table
            className="mt-3"
            head={["Produit", "Source", "Prix drop", "Vendu", "Dispo à la source", "Couverture", "Marge", "Litiges"]}
            rows={[
              ["Montre connectée S8", "L", "6 200", "48", "340", "21 j", "31 %", "3"],
              ["Casque sans fil X2", "P", "4 800", "21", "96", "13 j", "34 %", "1"],
              ["Lotion tonique", "L", "3 800", "9", "210", "40 j", "38 %", "0"],
              ["Masque argile", "P", "3 400", "6", "18", "6 j", "29 %", "0"],
              ["Gel nettoyant", "P", "2 200", "4", "140", "35 j", "36 %", "0"],
            ]}
            sourceCol={1}
            evolutions={[
              [3, 6, 5, 9],
              [4, 3, 6, 7],
              [2, 3, 5, 6],
              [5, 4, 3, 3],
              [3, 3, 2, 4],
            ]}
          />
        </Card>

        <div>
          <div className="overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
            <div className="relative bg-[linear-gradient(153.4deg,#3A1D8A_16.68%,#000000_135.1%)] p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Évolution du stock</p>
              </div>
              <ProductSelector
                name={depot.name}
                position={`Produit ${index + 1} sur ${DEPOTS.length}`}
                dark
                className="mt-2"
                onPrev={goPrev}
                onNext={goNext}
              />
              <div className="mt-3 h-10">
                <svg
                  viewBox="0 0 205.5 60.6"
                  className="absolute opacity-100"
                  style={{ width: 205.5, height: 60.595703125, top: 86.4, left: 82.08 }}
                  fill="none"
                >
                  <g stroke="white" strokeOpacity={0.12} strokeWidth={0.5} vectorEffect="non-scaling-stroke">
                    <line x1={0} y1={4} x2={205.5} y2={4} />
                    <line x1={0} y1={20.5} x2={205.5} y2={20.5} />
                    <line x1={0} y1={37} x2={205.5} y2={37} />
                    <line x1={0} y1={53.5} x2={205.5} y2={53.5} />
                    <line x1={17} y1={0} x2={17} y2={60.6} />
                    <line x1={68} y1={0} x2={68} y2={60.6} />
                    <line x1={119} y1={0} x2={119} y2={60.6} />
                    <line x1={170} y1={0} x2={170} y2={60.6} />
                  </g>
                  <path
                    d="M4,4 C50,34 90,44 201,44"
                    stroke="var(--color-brand-pink)"
                    strokeWidth={1}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={4} cy={4} r={2} fill="var(--color-brand-pink)" />
                  <circle cx={201} cy={44} r={2} fill="var(--color-brand-pink)" />
                  <path
                    d="M201,4 C155,34 115,44 4,44"
                    stroke="white"
                    strokeWidth={1}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={201} cy={4} r={2} fill="white" />
                  <circle cx={4} cy={44} r={2} fill="white" />
                </svg>
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] text-white/50">
                <span>— Restant</span>
                <span className="text-brand-pink">- - Sorties cumulées</span>
              </div>
            </div>
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Restant</p>
                  <p className="-ml-4 inline-block rounded-r-xl bg-brand-purple py-1 pl-4 pr-4 text-xl font-bold text-white">
                    {depot.restant}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Valeur</p>
                  <p className="-mr-4 inline-block rounded-l-xl bg-brand-purple py-1 pl-4 pr-4 text-sm font-bold text-white">
                    {depot.valeur}
                  </p>
                </div>
              </div>
              <Divider />
              <StatRow label="Sortie moyenne" value={depot.sortieMoyenne} />
              <StatRow label="Rupture estimée" value={depot.ruptureEstimee} />
              <StatRow label="Rotation" value={depot.rotation} />
            </div>
          </div>

          <Card title="Tous dépôts confondus" titleTab className="mt-3 !bg-white">
            <StatRow label="Unités en entrepôt" value="240" />
            <StatRow label="Déposé depuis le 1er août" value="420" />
            <StatRow label="Endommagé à la réception" value="3 · 0,7 %" />
            <StatRow label="Écarts non résolus" value="1" />
            <StatRow label="Couverture moyenne" value="19 jours" />
            <StatRow label="Stock dormant" value="28 unités · 60 j sans vente" />
            <StatRow label="Délai moyen de contrôle" value="1,2 jour" />
          </Card>

          <Card
            title="Envois récents"
            titleTab
            className="mt-3 !bg-white"
            badge={<Tag tone="pink">1 en cours</Tag>}
          >
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold">Huile de ricin · 60</span>
              <span className="text-[#141220]/40">28 août</span>
            </div>
            <div className="mt-1.5 flex gap-1">
              <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
              <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
              <span className="h-1 flex-1 rounded-full bg-[#141220]/10" />
              <span className="h-1 flex-1 rounded-full bg-[#141220]/10" />
            </div>
            <p className="mt-1.5 text-[10px] text-[#141220]/40">Au contrôle · résultat attendu aujourd&apos;hui</p>
            <Divider />
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#141220]/50">Sérum éclat · 120</span>
              <Tag tone="warn">3 écartés</Tag>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#141220]/50">Beurre de karité · 200</span>
              <Tag tone="ok">Conforme</Tag>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#141220]/50">Coffret parfum · 40</span>
              <Tag tone="ok">Conforme</Tag>
            </div>
            <Btn variant="dark" className="mt-4">
              Déposer un nouveau stock
            </Btn>
          </Card>
        </div>
      </div>
    </>
  );
}
