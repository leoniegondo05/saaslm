"use client";

import { Bar, Card, CommuneRow, Divider, FailRow, LegendRow, SectionHeader, StatRow } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

// 24 barres pour la bande "heures de commande" — pic 20h-22h, gabarit repris
// des hauteurs de la maquette (0 → 1).
const HOURLY_ORDERS = [
  0.06, 0.05, 0.05, 0.05, 0.06, 0.09, 0.14, 0.2, 0.26, 0.3, 0.34, 0.4, 0.44, 0.38, 0.34, 0.36, 0.42, 0.5, 0.5, 0.7, 1, 1,
  0.6, 0.2,
];

const WEEKDAYS = [
  { fr: "Lun", en: "Mon", value: 8 },
  { fr: "Mar", en: "Tue", value: 9 },
  { fr: "Mer", en: "Wed", value: 11 },
  { fr: "Jeu", en: "Thu", value: 10 },
  { fr: "Ven", en: "Fri", value: 16 },
  { fr: "Sam", en: "Sat", value: 14 },
  { fr: "Dim", en: "Sun", value: 5 },
] as const;

/*
  Section "Commandes" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function CommandesSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  return (
    <>
      <SectionHeader
        eyebrow={t("Commandes", "Orders")}
        title={t("Ce que devient chaque commande", "What happens to each order")}
        subtitle={t("De la prise de commande jusqu'à la livraison.", "From order placed through to delivery.")}
        count={t("24 indicateurs", "24 metrics")}
        first={first}
        layout="inline"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={t("Commandes de la période", "Orders this period")} titleTab className="!bg-[var(--dashboard-glass)] self-start">
          <div className="mt-3 flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[6px] border-[var(--dashboard-card-bg)]">
              <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-brand-pink border-r-brand-pink" style={{ transform: "rotate(45deg)" }} />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#141220] text-center dark:bg-brand-pink">
                <div>
                  <p className="text-lg font-bold leading-none text-white">73</p>
                  <p className="text-[8px] text-white/40">{t("au total", "total")}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <LegendRow color="#22C55E" label={t("Livrées", "Delivered")} value="45" />
              <LegendRow color="#EC0C8C" label={t("En cours", "In progress")} value="16" />
              <LegendRow color="#D9D9E0" label={t("Non livrées", "Not delivered")} value="12" />
            </div>
          </div>
          <Divider />
          <StatRow label={t("Taux de livraison", "Delivery rate")} value="79 %" />
          <StatRow label={t("Dont produits en stockage", "Of which warehoused products")} value="31" bold={false} />
          <StatRow label={t("Dont produits en drop", "Of which drop-shipped products")} value="42" bold={false} />
          <StatRow label={t("Articles par commande", "Items per order")} value="1,4" bold={false} />
        </Card>

        <Card title={t("Où en sont les commandes en cours", "Status of orders in progress")} titleTab className="!bg-[var(--dashboard-glass)]">
          <StatRow label={t("En coordination", "Being coordinated")} value="4" bold={false} />
          <StatRow label={t("Affectées à un livreur", "Assigned to a courier")} value="7" bold={false} />
          <StatRow label={t("En cours de livraison", "Out for delivery")} value="3" bold={false} />
          <StatRow label={t("En relance", "Being followed up")} value="2" bold={false} />
          <Divider />
          <p className="inline-block rounded bg-[var(--dashboard-surface-2)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("Les quatre délais", "The four lead times")}</p>
          <StatRow label={t("Commande → confirmation", "Order → confirmation")} value="1 h 40" bold={false} />
          <StatRow label={t("Confirmation → livreur", "Confirmation → courier")} value="4 h 10" bold={false} />
          <StatRow label={t("Livreur → livraison", "Courier → delivery")} value="20 h" bold={false} />
          <StatRow label={t("Total moyen", "Average total")} value="26 h" />
        </Card>

        <Card title={t("Pourquoi elles n'aboutissent pas", "Why they don't go through")} titleTab className="!bg-[var(--dashboard-glass)] self-start">
          <FailRow label={t("Client injoignable", "Customer unreachable")} value={6} pct={100} />
          <FailRow label={t("Adresse introuvable", "Address not found")} value={3} pct={50} />
          <FailRow label={t("Refus à la livraison", "Refused at delivery")} value={2} pct={33} />
          <FailRow label={t("Produit non conforme", "Product not as described")} value={1} pct={17} />
          <Divider />
          <StatRow label={t("Relances demandées", "Follow-ups requested")} value="9" />
          <StatRow label={t("Relances abouties", "Successful follow-ups")} value="6 · 67 %" />
          <StatRow label={t("Taux d'annulation", "Cancellation rate")} value="4 %" />
        </Card>

        <Card title={t("Quand vos clients règlent", "When your customers pay")} titleTab className="!bg-[var(--dashboard-glass)] self-start">
          <StatRow label={t("Depuis la page de commande", "From the order page")} value="62 %" />
          <Bar pct={62} />
          <div className="mt-2" />
          <StatRow label={t("Via le lien de commande", "Via the order link")} value="38 %" />
          <Bar pct={38} color="bg-[#EC0C8C]" />
          <Divider />
          <StatRow label={t("Livraisons normales", "Standard deliveries")} value={t("62 · 77 % réussies", "62 · 77% successful")} />
          <StatRow label={t("Livraisons express", "Express deliveries")} value={t("11 · 91 % réussies", "11 · 91% successful")} />
          <StatRow label={t("Délai moyen express", "Average express time")} value="7 h" />
          <StatRow label={t("Supplément express encaissé", "Express surcharge collected")} value="22 000 F" />
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.7fr_1fr] [&>*]:min-w-0">
        <Card
          title={t("Heures auxquelles vos clients commandent", "Hours when your customers order")}
          titleTab
          titleAlign="left"
          className="!bg-[var(--dashboard-surface-2)] self-start"
          badge={<p className="text-[10px] text-[var(--dashboard-text)]">{t("Pic entre 20 h et 22 h · 38 % des commandes", "Peak between 8pm and 10pm · 38% of orders")}</p>}
        >
          <div
            className="mt-3 grid gap-[3px]"
            style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
          >
            {HOURLY_ORDERS.map((v, i) => {
              // Rose uniquement sur la plage de pic (19h-23h) — reste en
              // dégradé gris neutre, cf. capture.
              const isPeak = i >= 19;
              const background = isPeak
                ? v > 0.75
                  ? "#EC0C8C"
                  : `rgba(236,12,140,${Math.max(0.25, v * 0.9)})`
                : `color-mix(in srgb, var(--dashboard-text) ${Math.round(Math.max(0.08, v * 0.6) * 100)}%, transparent)`;
              return <span key={i} className="h-4 rounded-sm" style={{ background }} />;
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            <span>{t("00 h", "12am")}</span>
            <span>{t("06 h", "6am")}</span>
            <span>{t("12 h", "12pm")}</span>
            <span>{t("18 h", "6pm")}</span>
            <span>{t("23 h", "11pm")}</span>
          </div>
          <Divider />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("Jours de la semaine", "Days of the week")}</p>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center sm:grid-cols-7">
            {WEEKDAYS.map(({ fr, en, value }) => (
              <div key={fr}>
                <p className="text-[9px] text-[var(--dashboard-text)]/40">{t(fr, en)}</p>
                <p className={`text-xs font-semibold ${value >= 14 ? "text-brand-pink" : ""}`}>{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("Communes livrées", "Districts delivered to")} titleTab className="!bg-[var(--dashboard-glass)]">
          <CommuneRow label="Yopougon" pct={41} value="30" barColor="bg-[var(--dashboard-text)]" />
          <CommuneRow label="Cocody" pct={27} value="20" barColor="bg-[var(--dashboard-text)]/75" />
          <CommuneRow label="Abobo" pct={18} value="13" barColor="bg-[var(--dashboard-text)]/55" />
          <CommuneRow label="Marcory" pct={9} value="7" barColor="bg-[var(--dashboard-text)]/35" />
          <CommuneRow label="Bingerville" pct={5} value="3" barColor="bg-[var(--dashboard-text)]/20" />
          <Divider />
          <StatRow label={t("Commune la plus rentable", "Most profitable district")} value={t("Cocody · marge 54 %", "Cocody · 54% margin")} />
          <StatRow label={t("Commune la plus difficile", "Toughest district")} value={t("Abobo · 31 % d'échecs", "Abobo · 31% failure rate")} />
        </Card>
      </div>
    </>
  );
}
