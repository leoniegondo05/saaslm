"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchat } from "./clientsData";

export default function ClientsStockVsDrop({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();

  // Cette carte compare déjà S et D côte à côte : le toggle ne filtre rien
  // ici (les deux colonnes restent nécessaires à la comparaison), il fait
  // ressortir la colonne choisie et estompe l'autre. "les-deux" = normal.
  const dimStockage = typeAchat === "dropshipping";
  const dimDrop = typeAchat === "stockage";

  return (
    <div className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
      {/* En-tête */}
      <div>
        <h3 className="text-sm font-bold tracking-tight text-[var(--dashboard-text)] sm:text-base">
          {t(
            "Le client d'un produit en stock et celui d'un produit en drop",
            "In-stock buyers vs drop-shipped buyers"
          )}
        </h3>
        <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
          {t(
            "Le même client, deux expériences différentes selon ce qu'il achète",
            "The same shopper, two completely distinct experiences depending on product origin"
          )}
        </p>
      </div>

      {/* 2 Colonnes comparatives */}
      <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
        {/* Colonne 1 : Stockage management */}
        <div
          className={`rounded-xl border border-[#0284c7]/25 bg-[#0284c7]/5 p-4 transition-opacity ${
            dimStockage ? "opacity-40" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--dashboard-text)]">
              {t("Acheté en stockage management", "Purchased from managed stock")}
            </h4>
            <span className="rounded-full bg-[#0284c7]/15 px-2 py-0.5 text-[9px] font-bold text-[#0284c7] dark:text-[#38bdf8]">
              {t("97 CLIENTS", "97 CUSTOMERS")}
            </span>
          </div>
          <p className="text-[10px] text-[var(--dashboard-text)]/45">
            {t("Votre marchandise, que vous avez vue et emballée.", "Your goods, inspected and packed under your standard.")}
          </p>

          <div className="mt-4 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Panier moyen", "Average basket value")}
              </span>
              <span className="font-bold">20 295F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Taux de livraison", "Delivery success rate")}
              </span>
              <span className="font-bold text-[#10b981]">80 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Litige pour produit non conforme", "Disputes for non-compliant item")}
              </span>
              <span className="font-bold text-[#10b981]">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Reviennent acheter", "Repeat buyers")}
              </span>
              <span className="font-bold text-[#10b981]">23 %</span>
            </div>
            <div className="flex justify-between border-t border-[var(--dashboard-text)]/10 pt-1.5 font-bold">
              <span className="text-[var(--dashboard-text)]/75">
                {t("Note de satisfaction", "Satisfaction rating")}
              </span>
              <span className="text-[#10b981]">4,4 / 5</span>
            </div>
          </div>
        </div>

        {/* Colonne 2 : Dropshipping */}
        <div
          className={`rounded-xl border border-[#ec0c8c]/25 bg-[#ec0c8c]/5 p-4 transition-opacity ${
            dimDrop ? "opacity-40" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--dashboard-text)]">
              {t("Acheté en dropshipping", "Purchased via drop-shipping")}
            </h4>
            <span className="rounded-full bg-[#ec0c8c]/15 px-2 py-0.5 text-[9px] font-bold text-[#ec0c8c]">
              {t("51 CLIENTS", "51 CUSTOMERS")}
            </span>
          </div>
          <p className="text-[10px] text-[var(--dashboard-text)]/45">
            {t("La marchandise du partenaire, décrite par sa fiche.", "Partner catalog items, fulfilled directly by supplier.")}
          </p>

          <div className="mt-4 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Panier moyen", "Average basket value")}
              </span>
              <span className="font-bold">17 888F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Taux de livraison", "Delivery success rate")}
              </span>
              <span className="font-semibold text-[var(--dashboard-text)]">76 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Litige pour produit non conforme", "Disputes for non-compliant item")}
              </span>
              <span className="font-bold text-[#f43f5e]">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Reviennent acheter", "Repeat buyers")}
              </span>
              <span className="font-bold text-[#f43f5e]">9 %</span>
            </div>
            <div className="flex justify-between border-t border-[var(--dashboard-text)]/10 pt-1.5 font-bold">
              <span className="text-[var(--dashboard-text)]/75">
                {t("Note de satisfaction", "Satisfaction rating")}
              </span>
              <span className="text-[#f59e0b]">3,8 / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Encart analytique */}
      <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3 sm:p-4">
        <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
          {t("Le drop vous fait vendre, mais vous fait moins de clients", "Drop-shipping drives volume, but builds fewer repeat clients")}
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/55">
          {t(
            "Neuf pour cent de réachat contre vingt-trois. Six dixièmes de point de satisfaction en moins. Et les sept litiges pour produit non conforme sont tous de ce côté — ce sont les fiches du partenaire, reprises telles quelles, qui promettent autre chose que ce qui arrive. Le dropshipping reste excellent pour tester une envie sans acheter de stock, et pour combler ce qui vous manque. Mais un client acquis sur un produit en drop revient deux fois et demie moins : à panier égal, il vaut moins cher. Vérifier les fiches avant de les activer, et faire entrer les nouveaux clients par vos propres produits, corrige les deux à la fois.",
            "A 9% repeat rate compared to 23%. 0.6 rating points lower in customer reviews. All 7 product non-compliance disputes originated here — supplier product descriptions promising features that differ upon physical arrival. Drop-shipping remains an incredible tool to test demand with zero inventory risk. However, a customer acquired through drop-shipping is 2.5x less likely to re-order. Thoroughly verifying partner product listings and steering initial customer acquisition toward your own stocked catalog resolves both issues simultaneously."
          )}
        </p>
      </div>
    </div>
  );
}
