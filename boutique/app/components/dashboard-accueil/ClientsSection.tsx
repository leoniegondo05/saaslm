"use client";

import { Card, ClientRow, Divider, RatingRow, SectionHeader, StatRow, Tag } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Clients" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function ClientsSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  return (
    <>
      <SectionHeader
        eyebrow={t("Clients", "Customers")}
        title={t("Qui achète, et qui revient", "Who buys, and who comes back")}
        subtitle={t("Ce que valent vos clients et ce qu'ils pensent.", "What your customers are worth and what they think.")}
        count={t("14 indicateurs", "14 metrics")}
        first={first}
        layout="inline"
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={t("Qui achète chez vous", "Who buys from you")} titleTab className="!bg-[var(--dashboard-glass)]">
          <StatRow label={t("Clients servis", "Customers served")} value="73" />
          <StatRow label={t("Nouveaux clients", "New customers")} value="58 · 79 %" />
          <StatRow label={t("Clients revenus", "Returning customers")} value="15 · 21 %" />
          <StatRow label={t("Deuxième achat en", "Second purchase within")} value={t("17 jours", "17 days")} />
          <StatRow label={t("Meilleur client", "Best customer")} value="68 000 F" />
          <Divider />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--dashboard-text)]/50">{t("Clients à risque", "At-risk customers")}</p>
            <Tag tone="warn">4</Tag>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">
            {t(
              "Deux échecs de livraison ou plus. À rappeler avant d'expédier.",
              "Two or more failed deliveries. Call before shipping."
            )}
          </p>
        </Card>

        <Card title={t("Vos cinq meilleurs clients", "Your top five customers")} titleTab className="!bg-[var(--dashboard-glass)]">
          <ClientRow name="Traoré M." zone="Cocody" value="68 000 F" orders={5} pct={100} showCommandeLabel barColor="bg-[linear-gradient(90deg,#FF8BCB_0%,#EC0C8C_100%)]" />
          <ClientRow name="Konan A." zone="Yopougon" value="51 000 F" orders={4} pct={75} barColor="bg-[#FFC2E2]" />
          <ClientRow name="Aya D." zone="Marcory" value="38 000 F" orders={3} pct={56} barColor="bg-[#FFC2E2A6]" />
          <ClientRow name="Koffi B." zone="Abobo" value="27 000 F" orders={2} pct={40} barColor="bg-[#FFC2E26E]" />
          <ClientRow name="Silué F." zone="Cocody" value="24 000 F" orders={2} pct={35} barColor="bg-[#FFC2E26E]" />
        </Card>

        <Card title={t("Ce qu'ils pensent", "What they think")} titleTab className="!bg-[var(--dashboard-glass)]">
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="text-3xl font-bold tracking-tight">4,6</p>
            <p className="pb-1 text-xs text-[var(--dashboard-text)]/40">{t("sur 5 · 41 avis", "out of 5 · 41 reviews")}</p>
          </div>
          <div className="mt-3 space-y-2">
            <RatingRow label={t("5 étoiles", "5 stars")} value="28" pct={68} />
            <RatingRow label={t("4 étoiles", "4 stars")} value="8" pct={20} color="bg-[#FFC2E2A6]" />
            <RatingRow label={t("3 étoiles et moins", "3 stars and below")} value="5" pct={12} color="bg-[#FF5A62]" />
          </div>
          <Divider />
          <p className="text-[10px] text-[var(--dashboard-text)]/40">
            {t('Dernier avis négatif : « Casque reçu sans le câble » · 27 août', 'Latest negative review: "Headset arrived without the cable" · Aug 27')}
          </p>
        </Card>

        <Card title={t("Panier moyen par commune", "Average basket by district")} titleTab className="!bg-[var(--dashboard-glass)]">
          <StatRow label="Cocody" value="16 400 F" />
          <StatRow label="Bingerville" value="14 800 F" />
          <StatRow label="Marcory" value="13 200 F" />
          <StatRow label="Yopougon" value="11 900 F" />
          <StatRow label="Abobo" value="9 600 F" />
          <Divider />
          <StatRow label={t("Commandes à 2 articles ou plus", "Orders with 2+ items")} value="26 %" />
          <StatRow label={t("Clients ayant laissé un avis", "Customers who left a review")} value="56 %" />
        </Card>
      </div>
    </>
  );
}
