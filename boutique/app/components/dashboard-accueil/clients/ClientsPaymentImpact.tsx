"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag } from "../shared";
import { TypeAchat } from "./clientsData";

export default function ClientsPaymentImpact({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();

  return (
    <div className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--dashboard-text)] sm:text-base">
            {t("Comment ils paient, et ce que cela change", "How customers pay, and the impact it creates")}
          </h3>
          <p className="text-[11px] text-[var(--dashboard-text)]/50">
            {t(
              "Deux modes seulement sur la plateforme : payer tout de suite, ou payer au livreur",
              "Only two options available on the platform: pay upfront online, or cash on delivery"
            )}
          </p>
        </div>
        <TypeAchatTag typeAchat={typeAchat} />
      </div>

      {/* Barres de répartition */}
      <div className="mt-4 space-y-1.5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-surface-2)]">
          <div className="h-full w-[19%] rounded-full bg-[#34d399]" />
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-surface-2)]">
          <div className="h-full w-[81%] rounded-full bg-[#5A6072]/50" />
        </div>
      </div>

      {/* Grille comparative */}
      <div className="mt-4 grid gap-3.5 sm:grid-cols-2 [&>*]:min-w-0">
        {/* CARTE 1 : Achat direct */}
        <div className="rounded-xl border border-[#10b981]/25 bg-[#10b981]/5 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--dashboard-text)]">
              {t("Achat direct", "Prepaid online order")}
            </h4>
            <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[9px] font-semibold text-[#10b981]">
              {t("75 clients · 19 %", "75 customers · 19%")}
            </span>
          </div>
          <p className="text-[10px] text-[var(--dashboard-text)]/40">
            {t("Payé au moment de la commande.", "Paid upfront upon order checkout.")}
          </p>

          <div className="mt-4 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Taux de livraison", "Delivery success rate")}
              </span>
              <span className="font-bold text-[#10b981]">99 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Panier moyen", "Average basket value")}
              </span>
              <span className="font-semibold">24 600F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Reviennent acheter", "Repeat buyers")}
              </span>
              <span className="font-bold text-[#10b981]">34 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Coût des refus par commande", "Refusal cost per order")}
              </span>
              <span className="font-bold text-[#10b981]">0F</span>
            </div>
            <div className="flex justify-between border-t border-[var(--dashboard-text)]/10 pt-1.5 font-bold">
              <span className="text-[var(--dashboard-text)]/75">
                {t("Marge de contribution", "Contribution margin")}
              </span>
              <span className="text-[#10b981]">7 940F</span>
            </div>
          </div>
        </div>

        {/* CARTE 2 : Paiement à la livraison */}
        <div className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/30 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--dashboard-text)]">
              {t("Paiement à la livraison", "Cash on Delivery (COD)")}
            </h4>
            <span className="rounded-full bg-[var(--dashboard-text)]/10 px-2 py-0.5 text-[9px] font-semibold text-[var(--dashboard-text)]/55">
              {t("312 clients · 81 %", "312 customers · 81%")}
            </span>
          </div>
          <p className="text-[10px] text-[var(--dashboard-text)]/40">
            {t("Payé au livreur, à la remise du colis.", "Paid directly to courier upon package delivery.")}
          </p>

          <div className="mt-4 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Taux de livraison", "Delivery success rate")}
              </span>
              <span className="font-bold text-[#f59e0b]">76 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Panier moyen", "Average basket value")}
              </span>
              <span className="font-semibold">18 100F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Reviennent acheter", "Repeat buyers")}
              </span>
              <span className="font-semibold">15 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Coût des refus par commande", "Refusal cost per order")}
              </span>
              <span className="font-bold text-[#f43f5e]">862F</span>
            </div>
            <div className="flex justify-between border-t border-[var(--dashboard-text)]/10 pt-1.5 font-bold">
              <span className="text-[var(--dashboard-text)]/75">
                {t("Marge de contribution", "Contribution margin")}
              </span>
              <span className="text-[var(--dashboard-text)]">4 128F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloc Highlight conversion */}
      <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/35 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-text)]/10 text-base text-[var(--dashboard-text)] shadow-xs font-figures-bold">
            28
          </div>
          <div>
            <h5 className="text-xs font-semibold text-[var(--dashboard-text)]">
              {t(
                "clients sont passés au paiement immédiat après une première livraison réussie",
                "customers shifted to upfront prepayment after their first successful delivery"
              )}
            </h5>
            <p className="text-[10px] text-[var(--dashboard-text)]/50">
              {t(
                "Sur les 99 nouveaux du mois. Une fois qu'ils ont vu le colis arriver, la confiance suffit : ils n'ont plus besoin de garder l'argent jusqu'à la porte.",
                "Out of 99 monthly newcomers. Once they see the parcel actually arrive, trust takes over: they no longer insist on holding cash at their door."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:text-right shrink-0">
          <span className="text-xl text-[#10b981] sm:text-2xl font-figures-bold">+92 %</span>
          <span className="text-[10px] font-semibold text-[var(--dashboard-text)]/65">
            {t("de marge sur ces clients", "higher margin on these buyers")}
          </span>
        </div>
      </div>

      {/* Encart analytique */}
      <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3 sm:p-4">
        <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
          {t(
            "Le paiement immédiat n'est pas une contrainte à imposer, c'est une confiance à gagner",
            "Prepayment is not a rule to force, it is a relationship earned through reliability"
          )}
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/55">
          {t(
            "Un client qui paie d'avance rapporte quatre-vingt-douze pour cent de marge en plus : panier plus gros, zéro refus, réachat doublé. Mais personne ne paie d'avance à une boutique qu'il ne connaît pas. La seule façon de faire grandir ces dix-neuf pour cent est de réussir la première livraison, puis de le proposer — pas de l'exiger. Vos vingt-huit conversions du mois viennent toutes d'un premier colis arrivé à l'heure.",
            "A customer who prepays upfront yields +92% extra gross contribution: larger orders, zero refusal fees, doubled repeat rate. But no shopper prepays an unfamiliar storefront. The only sustainable path to scale this 19% share is executing the first delivery flawlessly, then smoothly offering prepayment on subsequent orders — never demanding it aggressively. Your 28 monthly prepaid conversions all stemmed from a first parcel delivered on time."
          )}
        </p>
      </div>
    </div>
  );
}
