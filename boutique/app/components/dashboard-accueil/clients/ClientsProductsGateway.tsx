"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag, texteAvecChiffres } from "../shared";
import { PRODUITS_ENTREE, TypeAchat } from "./clientsData";

export default function ClientsProductsGateway({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();

  // Filtre réel sur le type de produit d'entrée : S = stockage, D = drop.
  // "les-deux" garde toutes les lignes, comme avant ce toggle.
  const produits =
    typeAchat === "les-deux"
      ? PRODUITS_ENTREE
      : PRODUITS_ENTREE.filter((item) => item.type === (typeAchat === "stockage" ? "S" : "D"));

  return (
    <div className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--dashboard-text)] sm:text-base">
            {t(
              "Par quel produit ils entrent, et ce qu'ils achètent ensuite",
              "Which product hooks them first, and what they buy next"
            )}
          </h3>
          <p className="text-[11px] text-[var(--dashboard-text)]/50">
            {texteAvecChiffres(t(
              "Premier achat, puis deuxième, sur les 288 clients qui ont acheté au moins une fois il y a plus de deux mois",
              "First vs second purchase across 288 customers who ordered at least once over two months ago"
            ))}
          </p>
        </div>
        <TypeAchatTag typeAchat={typeAchat} />
      </div>

      {/* Tableau des parcours produits */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-[var(--dashboard-text)]/10 text-[9px] uppercase tracking-wider text-[var(--dashboard-text)]/45">
              <th className="pb-2 font-semibold">{t("PRODUIT DU PREMIER ACHAT", "INITIAL PRODUCT PURCHASED")}</th>
              <th className="pb-2 text-right font-semibold sm:text-center">{t("CLIENTS ENTRÉS PAR LUI", "ACQUIRED VIA THIS")}</th>
              <th className="pb-2 text-right font-semibold">{t("REVIENNENT", "RETENTION")}</th>
              <th className="pb-2 pl-5 font-semibold">{t("PRODUIT DU DEUXIÈME ACHAT", "FOLLOW-UP SECOND PURCHASE")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dashboard-text)]/5">
            {produits.map((item) => {
              const colorClass =
                item.tauxRetour >= 20
                  ? "text-[#10b981]"
                  : item.tauxRetour >= 10
                  ? "text-[#f59e0b]"
                  : "text-[#f43f5e]";

              return (
                <tr key={item.id} className="group hover:bg-[var(--dashboard-surface-2)]/30 transition-colors">
                  {/* Produit d'entrée */}
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                          item.type === "S"
                            ? "bg-[#0284c7]/15 text-[#0284c7] dark:bg-[#38bdf8]/20 dark:text-[#38bdf8]"
                            : "bg-[#ec0c8c]/15 text-[#ec0c8c]"
                        }`}
                        title={item.type === "S" ? "Stockage management" : "Dropshipping"}
                      >
                        {item.type}
                      </span>
                      <span className="font-semibold text-[var(--dashboard-text)]">
                        {texteAvecChiffres(item.nom)}
                      </span>
                    </div>
                  </td>

                  {/* Nombre de clients */}
                  <td className="py-2.5 text-right font-semibold font-figures text-[var(--dashboard-text)] sm:text-center">
                    {item.clientsEntres}
                  </td>

                  {/* Taux de retour */}
                  <td className={`py-2.5 text-right font-bold font-figures ${colorClass}`}>
                    {item.tauxRetour} %
                  </td>

                  {/* Deuxième achat */}
                  <td className="py-2.5 pl-5">
                    {item.produitDeuxiemeAchatNom === "Aucun produit dominant" ? (
                      <span className="text-[var(--dashboard-text)]/35 italic text-[10px]">
                        {t("Aucun produit dominant", "No dominant repeat product")}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {item.produitDeuxiemeAchatType && (
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                              item.produitDeuxiemeAchatType === "S"
                                ? "bg-[#0284c7]/15 text-[#0284c7] dark:bg-[#38bdf8]/20 dark:text-[#38bdf8]"
                                : "bg-[#ec0c8c]/15 text-[#ec0c8c]"
                            }`}
                          >
                            {item.produitDeuxiemeAchatType}
                          </span>
                        )}
                        <span className="font-medium text-[var(--dashboard-text)]/75">
                          {texteAvecChiffres(item.produitDeuxiemeAchatNom)}
                        </span>
                        {item.produitDeuxiemeAchatPct && (
                          <span className="font-semibold font-figures text-[var(--dashboard-text)]">
                            · {item.produitDeuxiemeAchatPct} %
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Encart analytique */}
      <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3 sm:p-4">
        <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
          {t(
            "Le sérum n'est pas seulement votre meilleure vente, c'est votre meilleure porte d'entrée",
            "The serum is not just your top seller, it is your strongest customer gateway"
          )}
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/55">
          {texteAvecChiffres(t(
            "Vingt-six pour cent des clients entrés par le sérum reviennent, contre quatre pour cent de ceux entrés par les sandales. Et six fois sur dix, leur deuxième achat est le beurre de karité. Cela vaut mieux qu'une règle de marge : mettre la publicité sur le sérum, c'est acheter un client qui reviendra ; la mettre sur les sandales, c'est acheter une vente unique, sur un produit qui perd déjà de l'argent. Les deux produits d'entrée les plus faibles sont aussi les deux plus chers et les plus refusés.",
            "26% of customers whose first order was the serum return, compared to barely 4% for those buying sandals. In 6 out of 10 cases, their second purchase is the shea butter. This insight is much more valuable than a pure markup formula: investing ad dollars into the serum purchases a recurring customer; promoting sandals yields a one-off sale on an item with already negative margins and elevated refusal rates."
          ))}
        </p>
      </div>
    </div>
  );
}
