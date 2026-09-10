"use client";

import { useState } from "react";
import { Btn, Card, Divider, Nature, ProductSelector, QuickStat, SectionHeader, StatRow, Table, Tag } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Stock" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/

type Depot = {
  name: string;
  nameEn: string;
  nature: "S" | "P" | "L" | "O";
  deposedLe: string;
  deposedLeEn: string;
  entrepot: string;
  entrepotEn: string;
  reference: string;
  garantie: string;
  garantieEn: string;
  tag: { label: string; labelEn: string; tone: "ok" | "warn" | "ko" | "dark" };
  quick: [string, string, string, string, string];
  quick2: [string, string, string, string, string];
  parcours: { debut: string; debutEn: string; fin: string; finEn: string };
  note: string;
  noteEn: string;
  restant: string;
  valeur: string;
  sortieMoyenne: string;
  sortieMoyenneEn: string;
  ruptureEstimee: string;
  ruptureEstimeeEn: string;
  rotation: string;
  rotationEn: string;
};

// 4 dépôts en cours — repris de la table "Mes quatre dépôts" ci-dessous, un
// jeu de données complet par dépôt pour alimenter la fiche + le panneau
// "Évolution du stock" quand on navigue au carousel.
const DEPOTS: Depot[] = [
  {
    name: "Sérum éclat 30 ml",
    nameEn: "Radiance serum 30 ml",
    nature: "S",
    deposedLe: "Déposé le 22 août à 09 h 40",
    deposedLeEn: "Deposited on Aug 22 at 9:40am",
    entrepot: "Entrepôt Yopougon",
    entrepotEn: "Yopougon warehouse",
    reference: "dépôt DP-0341",
    garantie: "garantie souscrite",
    garantieEn: "insured",
    tag: { label: "3 unités écartées", labelEn: "3 units rejected", tone: "ko" },
    quick: ["120", "117", "3", "117", "34"],
    quick2: ["83", "6", "514 600", "22 j", "12 000"],
    parcours: { debut: "22 août", debutEn: "Aug 22", fin: "23 août", finEn: "Aug 23" },
    note: "3 flacons cassés relevés au contrôle, photos jointes par le partenaire. Un litige reste ouvrable jusqu'au 22 septembre.",
    noteEn: "3 broken bottles found during inspection, photos attached by the partner. A dispute can still be opened until Sept. 22.",
    restant: "83",
    valeur: "514 600 F",
    sortieMoyenne: "1,6 par jour",
    sortieMoyenneEn: "1.6 per day",
    ruptureEstimee: "21 septembre",
    ruptureEstimeeEn: "Sept. 21",
    rotation: "0,4 fois par mois",
    rotationEn: "0.4 times per month",
  },
  {
    name: "Huile de ricin 100 ml",
    nameEn: "Castor oil 100 ml",
    nature: "S",
    deposedLe: "Déposé le 28 août à 14 h 10",
    deposedLeEn: "Deposited on Aug 28 at 2:10pm",
    entrepot: "Entrepôt Cocody",
    entrepotEn: "Cocody warehouse",
    reference: "dépôt DP-0288",
    garantie: "sans garantie",
    garantieEn: "uninsured",
    tag: { label: "Contrôle en cours", labelEn: "Inspection in progress", tone: "warn" },
    quick: ["60", "—", "—", "60", "58"],
    quick2: ["2", "1", "2 400", "1 j", "—"],
    parcours: { debut: "28 août", debutEn: "Aug 28", fin: "29 août", finEn: "Aug 29" },
    note: "Dépôt encore au contrôle de conformité, résultat attendu aujourd'hui. Couverture très faible, réassort à prévoir.",
    noteEn: "Deposit still under compliance inspection, result expected today. Very low coverage, restock to plan for.",
    restant: "2",
    valeur: "2 400 F",
    sortieMoyenne: "2,1 par jour",
    sortieMoyenneEn: "2.1 per day",
    ruptureEstimee: "5 septembre",
    ruptureEstimeeEn: "Sept. 5",
    rotation: "1,9 fois par mois",
    rotationEn: "1.9 times per month",
  },
  {
    name: "Beurre de karité 200 g",
    nameEn: "Shea butter 200 g",
    nature: "S",
    deposedLe: "Déposé le 12 août à 08 h 15",
    deposedLeEn: "Deposited on Aug 12 at 8:15am",
    entrepot: "Entrepôt Marcory",
    entrepotEn: "Marcory warehouse",
    reference: "dépôt DP-0402",
    garantie: "garantie souscrite",
    garantieEn: "insured",
    tag: { label: "Conforme", labelEn: "Compliant", tone: "ok" },
    quick: ["200", "200", "0", "200", "73"],
    quick2: ["127", "15", "762 000", "34 j", "8 000"],
    parcours: { debut: "12 août", debutEn: "Aug 12", fin: "13 août", finEn: "Aug 13" },
    note: "Aucun écart relevé au contrôle, dépôt clôturé conforme. Bonne couverture, pas de réassort à prévoir dans l'immédiat.",
    noteEn: "No discrepancy found during inspection, deposit closed as compliant. Good coverage, no restock needed for now.",
    restant: "127",
    valeur: "762 000 F",
    sortieMoyenne: "3,2 par jour",
    sortieMoyenneEn: "3.2 per day",
    ruptureEstimee: "6 octobre",
    ruptureEstimeeEn: "Oct. 6",
    rotation: "0,9 fois par mois",
    rotationEn: "0.9 times per month",
  },
  {
    name: "Coffret parfum",
    nameEn: "Perfume gift set",
    nature: "P",
    deposedLe: "Déposé le 2 août à 10 h 30",
    deposedLeEn: "Deposited on Aug 2 at 10:30am",
    entrepot: "Entrepôt Yopougon",
    entrepotEn: "Yopougon warehouse",
    reference: "dépôt DP-0195",
    garantie: "sans garantie",
    garantieEn: "uninsured",
    tag: { label: "Rupture de stock", labelEn: "Out of stock", tone: "dark" },
    quick: ["40", "40", "0", "40", "40"],
    quick2: ["0", "0", "0", "Rupture", "0"],
    parcours: { debut: "2 août", debutEn: "Aug 2", fin: "3 août", finEn: "Aug 3" },
    note: "Dernier flacon vendu le 2 août. Dépôt épuisé, réassort à prévoir avec le partenaire.",
    noteEn: "Last bottle sold on Aug 2. Deposit depleted, restock to plan with the partner.",
    restant: "0",
    valeur: "0 F",
    sortieMoyenne: "1,3 par jour",
    sortieMoyenneEn: "1.3 per day",
    ruptureEstimee: "Déjà en rupture",
    ruptureEstimeeEn: "Already out of stock",
    rotation: "1,2 fois par mois",
    rotationEn: "1.2 times per month",
  },
];

export default function StockSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [index, setIndex] = useState(0);
  const depot = DEPOTS[index];
  const goPrev = () => setIndex((i) => (i - 1 + DEPOTS.length) % DEPOTS.length);
  const goNext = () => setIndex((i) => (i + 1) % DEPOTS.length);

  return (
    <>
      <SectionHeader
        eyebrow={t("Stock", "Stock")}
        title={t("Ce que vous avez confié", "What you've entrusted")}
        subtitle={t("Chaque dépôt, du départ de chez vous jusqu'à la vente.", "Every deposit, from pickup at yours to the sale.")}
        count={t("Flèches pour changer de produit", "Arrows to switch product")}
        first={first}
        layout="inline"
      />

      <div className="grid gap-3 lg:grid-cols-[1.9fr_1fr] [&>*]:min-w-0">
        <Card style={{ background: "var(--dashboard-glass)" }}>
          <div className="flex items-center justify-between gap-3">
            <p
              className="rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]"
              style={{ background: "var(--dashboard-surface-2)", fontFamily: "var(--font-bricolage)" }}
            >
              {t("Fiche d'un dépôt", "Deposit sheet")}
            </p>
            <ProductSelector
              name={t(depot.name, depot.nameEn)}
              position={t(`Dépôt ${index + 1} sur ${DEPOTS.length}`, `Deposit ${index + 1} of ${DEPOTS.length}`)}
              onPrev={goPrev}
              onNext={goNext}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Nature code={depot.nature} />
              <div>
                <p className="text-xs font-semibold">{t(depot.deposedLe, depot.deposedLeEn)}</p>
                <p className="text-[10px] text-[var(--dashboard-text)]/40">
                  {t(depot.entrepot, depot.entrepotEn)} · {depot.reference} · {t(depot.garantie, depot.garantieEn)}
                </p>
              </div>
            </div>
            <Tag tone={depot.tag.tone}>{t(depot.tag.label, depot.tag.labelEn)}</Tag>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <QuickStat label={t("Quantité déposée", "Quantity deposited")} value={depot.quick[0]} />
            <QuickStat label={t("Reçu conforme", "Received compliant")} value={depot.quick[1]} tone="ok" />
            <QuickStat label={t("Endommagé à la réception", "Damaged on receipt")} value={depot.quick[2]} tone="ko" />
            <QuickStat label={t("Mis en distribution", "Put into distribution")} value={depot.quick[3]} />
            <QuickStat label={t("Vendu sur la période", "Sold this period")} value={depot.quick[4]} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <QuickStat label={t("Restant en entrepôt", "Remaining in warehouse")} value={depot.quick2[0]} />
            <QuickStat label={t("Réservé aux commandes", "Reserved for orders")} value={depot.quick2[1]} />
            <QuickStat label={t("Valeur immobilisée", "Value tied up")} value={depot.quick2[2]} />
            <QuickStat label={t("Couverture", "Coverage")} value={depot.quick2[3]} />
            <QuickStat label={t("Frais de garantie", "Insurance fee")} value={depot.quick2[4]} />
          </div>

          <Divider />
          <div className="flex items-center justify-between text-[10px] text-[var(--dashboard-text)]/40">
            <span>{t("Parcours du dépôt", "Deposit journey")}</span>
            <span>{t(depot.parcours.debut, depot.parcours.debutEn)} → {t(depot.parcours.fin, depot.parcours.finEn)}</span>
          </div>
          <div className="mt-2 flex gap-1">
            {[1, 1, 1, 1].map((_, i) => (
              <span key={i} className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            <span>{t("Demande envoyée", "Request sent")}</span>
            <span>{t("Récupérée chez moi", "Picked up from me")}</span>
            <span>{t("Contrôle de conformité", "Compliance inspection")}</span>
            <span>{t("Disponible à la vente", "Available for sale")}</span>
          </div>

          <Divider />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-[10px] text-[var(--dashboard-text)]/40">{t(depot.note, depot.noteEn)}</p>
            <div className="flex gap-2">
              <span className="rounded-full border border-[var(--dashboard-text)]/15 px-3.5 py-2 text-[10px] font-semibold">
                {t("Voir le contrôle", "View inspection")}
              </span>
              <span className="rounded-full border border-brand-pink/40 px-3.5 py-2 text-[10px] font-semibold text-brand-pink">
                {t("Ouvrir un litige", "Open a dispute")}
              </span>
            </div>
          </div>

          <Divider />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
              {t("Mes quatre dépôts", "My four deposits")}
            </p>
            <Tag tone="dark">{t("240 unités · 1 209 100 F", "240 units · 1 209 100 F")}</Tag>
          </div>
          <Table
            className="mt-3"
            head={[
              t("Produit", "Product"),
              t("Déposé le", "Deposited on"),
              t("Stocké", "Stocked"),
              t("Conforme", "Compliant"),
              t("Endommagé", "Damaged"),
              t("Vendu", "Sold"),
              t("Restant", "Remaining"),
              t("Couverture", "Coverage"),
            ]}
            rows={[
              [t("Sérum éclat 30 ml", "Radiance serum 30 ml"), t("22 août", "Aug 22"), "120", "117", "3", "34", "83", "22 j"],
              [t("Huile de ricin 100 ml", "Castor oil 100 ml"), t("28 août", "Aug 28"), "60", "—", "—", "58", "2", "1 j"],
              [t("Beurre de karité 200 g", "Shea butter 200 g"), t("12 août", "Aug 12"), "200", "200", "0", "73", "127", "34 j"],
              [t("Coffret parfum", "Perfume gift set"), t("2 août", "Aug 2"), "40", "40", "0", "40", "0", t("Rupture", "Out of stock")],
            ]}
            evolutions={[
              [4, 5, 4, 6, 5, 7, 6, 8, 7, 9],
              [2, 3, 2, 5, 3, 4, 5, 6, 7, 8],
              [5, 4, 5, 5, 6, 5, 7, 6, 7, 8],
              [6, 7, 5, 6, 4, 5, 3, 2, 2, 1],
            ]}
            activeIndex={index}
            onRowClick={setIndex}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
              {t("Produits que je revends sans stock · drop", "Products I resell without stock · drop")}
            </p>
            <div className="flex gap-1.5">
              <Tag tone="blue">{t("3 du partenaire", "3 from the partner")}</Tag>
              <Tag tone="pink">{t("2 de LM", "2 from LM")}</Tag>
            </div>
          </div>
          <Table
            className="mt-3"
            head={[
              t("Produit", "Product"),
              t("Source", "Source"),
              t("Prix drop", "Drop price"),
              t("Vendu", "Sold"),
              t("Dispo à la source", "Available at source"),
              t("Couverture", "Coverage"),
              t("Marge", "Margin"),
              t("Litiges", "Disputes"),
            ]}
            rows={[
              [t("Montre connectée S8", "S8 connected watch"), "D", "6 200", "48", "340", "21 j", "31 %", "3"],
              [t("Casque sans fil X2", "X2 wireless headset"), "S", "4 800", "21", "96", "13 j", "34 %", "1"],
              [t("Lotion tonique", "Toning lotion"), "D", "3 800", "9", "210", "40 j", "38 %", "0"],
              [t("Masque argile", "Clay mask"), "S", "3 400", "6", "18", "6 j", "29 %", "0"],
              [t("Gel nettoyant", "Cleansing gel"), "S", "2 200", "4", "140", "35 j", "36 %", "0"],
            ]}
            sourceCol={1}
            evolutions={[
              [3, 4, 3, 5, 4, 6, 5, 7, 6, 9],
              [4, 5, 3, 4, 5, 4, 6, 5, 6, 7],
              [2, 3, 2, 4, 3, 5, 4, 5, 5, 6],
              [5, 4, 5, 3, 4, 2, 3, 2, 3, 3],
              [3, 2, 3, 4, 2, 3, 1, 2, 3, 4],
            ]}
          />
        </Card>

        <div>
          <div className="overflow-hidden rounded-2xl shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
            <div className="relative bg-[linear-gradient(153.4deg,#3A1D8A_16.68%,#000000_135.1%)] p-4 text-white">
              <div className="-mt-4 mb-3 flex items-center justify-center">
                <p
                  className="rounded-b-lg px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/80"
                  style={{
                    background:
                      "linear-gradient(97.49deg, rgba(255, 255, 255, 0.27) -2.86%, rgba(49, 25, 117, 0.27) 102.18%)",
                  }}
                >
                  {t("Évolution du stock", "Stock trend")}
                </p>
              </div>
              <ProductSelector
                name={t(depot.name, depot.nameEn)}
                position={t(`Produit ${index + 1} sur ${DEPOTS.length}`, `Product ${index + 1} of ${DEPOTS.length}`)}
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
                <span>— {t("Restant", "Remaining")}</span>
                <span className="text-brand-pink">- - {t("Sorties cumulées", "Cumulative outflow")}</span>
              </div>
            </div>
            <div className="bg-[var(--dashboard-glass)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">{t("Restant", "Remaining")}</p>
                  <p className="-ml-4 mt-1.5 inline-block rounded-r-xl bg-brand-purple py-1 pl-4 pr-4 text-xl font-bold text-white">
                    {depot.restant}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">{t("Valeur", "Value")}</p>
                  <p className="-mr-4 mt-1.5 inline-block rounded-l-xl bg-brand-purple py-1 pl-4 pr-4 text-sm font-bold text-white">
                    {depot.valeur}
                  </p>
                </div>
              </div>
              <Divider />
              <StatRow label={t("Sortie moyenne", "Average outflow")} value={t(depot.sortieMoyenne, depot.sortieMoyenneEn)} />
              <StatRow label={t("Rupture estimée", "Estimated stockout")} value={t(depot.ruptureEstimee, depot.ruptureEstimeeEn)} />
              <StatRow label={t("Rotation", "Turnover")} value={t(depot.rotation, depot.rotationEn)} />
            </div>
          </div>

          <Card title={t("Tous dépôts confondus", "All deposits combined")} titleTab className="mt-3 !bg-[var(--dashboard-glass)]">
            <StatRow label={t("Unités en entrepôt", "Units in warehouse")} value="240" />
            <StatRow label={t("Déposé depuis le 1er août", "Deposited since Aug 1")} value="420" />
            <StatRow label={t("Endommagé à la réception", "Damaged on receipt")} value={t("3 · 0,7 %", "3 · 0.7%")} />
            <StatRow label={t("Écarts non résolus", "Unresolved discrepancies")} value="1" />
            <StatRow label={t("Couverture moyenne", "Average coverage")} value={t("19 jours", "19 days")} />
            <StatRow label={t("Stock dormant", "Dormant stock")} value={t("28 unités · 60 j sans vente", "28 units · 60 days without sale")} />
            <StatRow label={t("Délai moyen de contrôle", "Average inspection time")} value={t("1,2 jour", "1.2 days")} />
          </Card>

          <Card
            title={t("Envois récents", "Recent shipments")}
            titleTab
            className="mt-3 !bg-[var(--dashboard-glass)]"
            badge={<Tag tone="pink">{t("1 en cours", "1 in progress")}</Tag>}
          >
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold">{t("Huile de ricin · 60", "Castor oil · 60")}</span>
              <span className="text-[var(--dashboard-text)]/40">{t("28 août", "Aug 28")}</span>
            </div>
            <div className="mt-1.5 flex gap-1">
              <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
              <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
              <span className="h-1 flex-1 rounded-full bg-[var(--dashboard-text)]/10" />
              <span className="h-1 flex-1 rounded-full bg-[var(--dashboard-text)]/10" />
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">{t("Au contrôle · résultat attendu aujourd'hui", "Under inspection · result expected today")}</p>
            <Divider />
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--dashboard-text)]/50">{t("Sérum éclat · 120", "Radiance serum · 120")}</span>
              <Tag tone="warn">{t("3 écartés", "3 rejected")}</Tag>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[var(--dashboard-text)]/50">{t("Beurre de karité · 200", "Shea butter · 200")}</span>
              <Tag tone="ok">{t("Conforme", "Compliant")}</Tag>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[var(--dashboard-text)]/50">{t("Coffret parfum · 40", "Perfume gift set · 40")}</span>
              <Tag tone="ok">{t("Conforme", "Compliant")}</Tag>
            </div>
            <Btn variant="dark" className="mt-4 !rounded-lg">
              {t("Déposer un nouveau stock", "Deposit new stock")}
            </Btn>
          </Card>
        </div>
      </div>
    </>
  );
}
