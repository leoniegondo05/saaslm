"use client";

import { AlertRow, Card, SectionHeader, StatRow, Tag } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Alertes" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function AlertesSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  return (
    <>
      <SectionHeader
        eyebrow={t("Alertes", "Alerts")}
        title={t("Ce qui demande une décision", "What needs a decision")}
        subtitle={t("Ruptures, litiges et tenue de votre partenaire.", "Stockouts, disputes and your partner's performance.")}
        count={t("16 indicateurs", "16 metrics")}
        first={first}
        layout="inline"
      />

      <div className="grid items-start gap-3 pb-4 lg:grid-cols-3">
        <Card
          title={t("Ce qui demande une décision", "What needs a decision")}
          titleTab
          className="!bg-[var(--dashboard-glass)]"
          badge={<Tag tone="pink">{t("5 alertes", "5 alerts")}</Tag>}
        >
          <AlertRow code="S" name={t("Huile de ricin", "Castor oil")} tag={t("Rupture sous 1 jour", "Out of stock in 1 day")} tone="ko" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FF5A62]" />
          <AlertRow code="S" name={t("Coffret parfum", "Perfume gift set")} tag={t("En rupture · retiré de la page", "Out of stock · removed from page")} tone="ko" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FF5A62]" />
          <AlertRow code="S" name={t("Bracelet cuir", "Leather bracelet")} tag={t("Rotation lente · 28 immobilisées", "Slow turnover · 28 stuck")} tone="warn" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FFB020]" />
          <AlertRow code="P" name={t("Casque X2", "X2 headset")} tag={t("4 avis négatifs", "4 negative reviews")} tone="warn" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FFB020]" />
          <AlertRow code="L" name={t("Montre S8", "S8 watch")} tag={t("3 litiges ce mois", "3 disputes this month")} tone="warn" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FFB020]" last />
          <div className="my-3 h-px bg-[var(--dashboard-text)]/10" />
          <StatRow label={t("Alertes traitées ce mois", "Alerts handled this month")} value="11" />
        </Card>

        <Card title={t("Litiges", "Disputes")} titleTab className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="pink" className="mb-2">{t("1 en cours", "1 in progress")}</Tag>}>
          <div className="mt-3">
          <StatRow
            label={t("Montant suspendu", "Amount on hold")}
            value={
              <span className="-mr-4 inline-block rounded-l-xl bg-brand-purple py-2 pl-4 pr-4 text-sm font-bold text-white">
                28 000 F
              </span>
            }
          />
          </div>
          <StatRow label={t("Ouvert par", "Opened by")} value={t("Le client final", "The end customer")} />
          <StatRow label={t("Depuis", "Open since")} value={t("3 jours", "3 days")} />
          <StatRow label={t("Résolus ce mois", "Resolved this month")} value="4" />
          <StatRow label={t("Délai moyen de résolution", "Average resolution time")} value={t("5 jours", "5 days")} />
          <StatRow label={t("Montant récupéré", "Amount recovered")} value="46 000 F" />
          <StatRow label={t("Montant perdu", "Amount lost")} value="12 000 F" />
          <StatRow label={t("Taux de litige", "Dispute rate")} value="1,4 %" />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="w-full rounded-full bg-brand-pink py-2.5 text-center text-xs font-semibold text-white shadow-[0_4px_16px_rgba(236,12,140,0.35)] transition hover:bg-brand-pink/90"
            >
              {t("Voir le litige en cours", "View the ongoing dispute")}
            </button>
          </div>
        </Card>

        <Card
          title={t("Votre partenaire", "Your partner")}
          titleTab
          className="!bg-[var(--dashboard-glass)]"
          badge={
            <Tag tone="dark" style={{ background: "var(--dashboard-card-bg)", boxShadow: "0 2px 10px rgba(20,18,32,0.12)" }}>
              <span className="text-yellow-400">★</span> {t("Note 8,4", "Rating 8.4")}
            </Tag>
          }
        >
          <StatRow label={t("Délai moyen de livraison", "Average delivery time")} value="26 h" />
          <StatRow label={t("Moyenne du réseau", "Network average")} value="31 h" />
          <StatRow label={t("Taux de livraison", "Delivery rate")} value="79 %" />
          <StatRow label={t("Retards ce mois", "Delays this month")} value="5" />
          <StatRow label={t("Écarts sur mes dépôts", "Discrepancies on my drop-offs")} value={t("3 unités", "3 units")} />
          <StatRow label={t("Réponses à l'assistance", "Support response time")} value={t("3 h en moyenne", "3 h on average")} />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[var(--dashboard-text)]/50">{t("Évaluation du mois", "This month's rating")}</span>
            <Tag tone="pink">{t("À donner", "To rate")}</Tag>
          </div>
        </Card>
      </div>
    </>
  );
}
