"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { Tag } from "../shared";
import { SEGMENTS_QUALITY } from "./clientsData";

export default function ClientsSegmentQuality() {
  const { t } = useDashboardLangue();

  return (
    <div className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--dashboard-text)] sm:text-base">
            {t("La qualité de la relation, segment par segment", "Relationship quality across segments")}
          </h3>
          <p className="text-[11px] text-[var(--dashboard-text)]/50">
            {t(
              "Un champion et un nouveau ne se comportent pas pareil au téléphone",
              "A champion and a new shopper behave totally differently on verification calls"
            )}
          </p>
        </div>
        <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
      </div>

      {/* Tableau des segments */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-[var(--dashboard-text)]/10 text-[8px] uppercase tracking-wider text-[var(--dashboard-text)]/40">
              <th className="pb-2 font-semibold">{t("SEGMENT", "SEGMENT")}</th>
              <th className="pb-2 text-center font-semibold">{t("DÉCROCHE AU 1ER APPEL", "1ST CALL PICKUP")}</th>
              <th className="pb-2 text-center font-semibold">{t("CONFIRME", "CONFIRMS")}</th>
              <th className="pb-2 text-center font-semibold">{t("REÇOIT LE COLIS", "DELIVERED")}</th>
              <th className="pb-2 text-center font-semibold">{t("OUVRE UN LITIGE", "DISPUTE RATE")}</th>
              <th className="pb-2 text-center font-semibold">{t("PAIE D'AVANCE", "PREPAYMENT")}</th>
              <th className="pb-2 text-right font-semibold">{t("PRODUITS CONNUS", "KNOWN SKUS")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dashboard-text)]/5">
            {SEGMENTS_QUALITY.map((row) => (
              <tr key={row.id} className="hover:bg-[var(--dashboard-surface-2)]/25 transition-colors">
                <td className="py-2.5 font-semibold text-[var(--dashboard-text)]">
                  {t(row.titreFr, row.titreEn)}
                </td>
                <td className={`py-2.5 text-center font-bold ${
                  row.decrocheTone === "ok" ? "text-[#10b981]" : row.decrocheTone === "danger" ? "text-[#f43f5e]" : row.decrocheTone === "warn" ? "text-[#f59e0b]" : ""
                }`}>
                  {row.decroche}
                </td>
                <td className={`py-2.5 text-center font-semibold ${row.confirme === "—" ? "text-[var(--dashboard-text)]/30" : "text-[#10b981]"}`}>
                  {row.confirme}
                </td>
                <td className={`py-2.5 text-center font-bold ${
                  row.recoitTone === "ok" ? "text-[#10b981]" : row.recoitTone === "warn" ? "text-[#f59e0b]" : "text-[var(--dashboard-text)]/30"
                }`}>
                  {row.recoit}
                </td>
                <td className={`py-2.5 text-center font-bold ${
                  row.litigeTone === "ok" ? "text-[#10b981]" : row.litigeTone === "danger" ? "text-[#f43f5e]" : "text-[var(--dashboard-text)]/70"
                }`}>
                  {row.litige}
                </td>
                <td className={`py-2.5 text-center font-bold ${
                  row.paieAvanceTone === "ok" ? "text-[#10b981]" : row.paieAvanceTone === "warn" ? "text-[#f59e0b]" : "text-[var(--dashboard-text)]/70"
                }`}>
                  {row.paieAvance}
                </td>
                <td className="py-2.5 text-right font-medium text-[var(--dashboard-text)]/80">
                  {row.produitsConnus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Encart analytique */}
      <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3 sm:p-4">
        <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
          {t("Le litige est un signal de départ, pas un incident isolé", "Disputes are early churn signals, not isolated accidents")}
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/55">
          {t(
            "Zéro virgule quatre pour cent chez les champions, quatre virgule un chez ceux qui partent, cinq virgule huit chez les perdus. Dans presque tous les cas, le litige arrive avant le départ, pas après. Cela veut dire qu'un litige bien traité est la meilleure occasion de fidélisation de toute la relation : le client est encore là, il vous parle, et sa décision de revenir ou non se prend dans les heures qui suivent. Un litige réglé en moins de trois heures fait revenir soixante-huit pour cent des clients ; au-delà de vingt-quatre heures, dix-neuf.",
            "0.4% dispute frequency among champions, 4.1% among churning buyers, and 5.8% among lost customers. In virtually every instance, disputes precede churn rather than follow it. Rapid, empathetic dispute resolution is your greatest retention opportunity: the buyer is actively in dialogue, and their decision to stay or leave is determined within hours. Disputes resolved in under 3 hours recover 68% of customers; past 24 hours, recovery collapses to 19%."
          )}
        </p>
      </div>
    </div>
  );
}
