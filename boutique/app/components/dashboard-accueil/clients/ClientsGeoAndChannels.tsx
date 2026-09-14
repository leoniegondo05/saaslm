"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag } from "../shared";
import { COMMUNES_DATA, CANAUX_ACQUISITION, TypeAchat } from "./clientsData";

export default function ClientsGeoAndChannels({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();

  return (
    <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
      {/* ── CARTE GAUCHE : Où sont vos clients ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("Où sont vos clients, et lesquels reviennent", "Where your customers are, and who returns")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/45">
                {t(
                  "Le réachat ne dépend pas seulement du produit, la zone compte autant",
                  "Repeat purchases depend not only on catalog, delivery geography matters equally"
                )}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* Tableau des communes */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[var(--dashboard-text)]/10 text-[8px] uppercase tracking-wider text-[var(--dashboard-text)]/40">
                  <th className="pb-2">{t("COMMUNE", "DISTRICT")}</th>
                  <th className="pb-2">{t("RÉACHAT", "REPEAT RATE")}</th>
                  <th className="pb-2 text-right">{t("CLIENTS", "CUSTOMERS")}</th>
                  <th className="pb-2 text-right">{t("PANIER", "BASKET")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dashboard-text)]/5">
                {COMMUNES_DATA.map((c) => {
                  const isHigh = c.reachat >= 18;
                  const barColor = isHigh ? "bg-[#38bdf8]" : "bg-[#fb923c]";

                  return (
                    <tr key={c.nom} className="hover:bg-[var(--dashboard-surface-2)]/25 transition-colors">
                      <td className="py-2.5 font-medium">{c.nom}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 sm:w-28 overflow-hidden rounded-full bg-[var(--dashboard-surface-2)]">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${c.reachat * 3.2}%` }} />
                          </div>
                          <span className={`font-semibold ${isHigh ? "text-[var(--dashboard-text)]" : "text-[#fb923c]"}`}>
                            {c.reachat} %
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-medium text-[var(--dashboard-text)]/70">{c.clients}</td>
                      <td className="py-2.5 text-right font-bold">{c.panier}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
            {t("Le réachat suit exactement le délai de livraison", "Repeat rate mirrors delivery speed with absolute precision")}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Cocody est livré en trois heures quarante et réachète à vingt-six pour cent. Bouaké est livré en onze heures trente et réachète à sept. L'ordre des six communes est le même dans les deux colonnes, sans une seule exception. Ce n'est donc pas une question de pouvoir d'achat : un client livré vite revient, un client qui a attendu ne revient pas. Réduire le délai à Bouaké ne réglerait pas seulement le taux de refus, cela créerait des clients.",
              "Cocody is delivered within 3h40 and exhibits a 26% repeat rate. Bouaké is delivered in 11h30 and re-orders at 7%. The order across all 6 districts matches shipping speed without a single exception. It is not a matter of local purchasing power: a fast delivery brings shoppers back; long transit times eliminate repeat intent. Improving logistics to Bouaké would not only cut refusal rates, it would directly unlock recurring customers."
            )}
          </p>
        </div>
      </div>

      {/* ── CARTE DROITE : Quel canal amène les meilleurs clients ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("Quel canal amène les meilleurs clients", "Which acquisition channel delivers the highest-value customers")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/45">
                {t("Attribué par les pixels. Le reste est rangé en organique.", "Tracked through marketing pixels. Non-pixel sales recorded as organic.")}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* Tableau d'attribution */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[var(--dashboard-text)]/10 text-[8px] uppercase tracking-wider text-[var(--dashboard-text)]/40">
                  <th className="pb-2">{t("CANAL", "CHANNEL")}</th>
                  <th className="pb-2 text-center">{t("CLIENTS", "CUSTOMERS")}</th>
                  <th className="pb-2 text-right">{t("COÛT PAR CLIENT", "CAC")}</th>
                  <th className="pb-2 text-right">{t("REVIENNENT", "RETENTION")}</th>
                  <th className="pb-2 text-right">{t("VALEUR", "LTV")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dashboard-text)]/5">
                {CANAUX_ACQUISITION.map((canal) => {
                  const isGreen = canal.reviennent >= 20;

                  return (
                    <tr key={canal.nomFr} className="hover:bg-[var(--dashboard-surface-2)]/25 transition-colors">
                      <td className="py-2.5 font-medium">
                        {t(canal.nomFr, canal.nomEn)}
                      </td>
                      <td className="py-2.5 text-center font-semibold">{canal.clients}</td>
                      <td className={`py-2.5 text-right font-medium ${canal.isOrganique ? "text-[#10b981] font-bold" : "text-[var(--dashboard-text)]/70"}`}>
                        {canal.coutClient}
                      </td>
                      <td className={`py-2.5 text-right font-bold ${isGreen ? "text-[#10b981]" : "text-[#f59e0b]"}`}>
                        {canal.reviennent} %
                      </td>
                      <td className={`py-2.5 text-right font-bold ${canal.isOrganique ? "text-[#10b981]" : ""}`}>
                        {canal.valeur}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
            {t("Le client qui vient tout seul est le meilleur de tous", "Organic customers represent the highest lifetime value")}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Trente et un pour cent de réachat, trente-quatre mille francs de valeur, et pas un franc de publicité. Il vient d'un partage, d'un live, d'une recommandation — la plateforme ne sait pas dire lequel, faute de pixel, et n'inventera pas la réponse. Mais elle sait dire qu'il vaut quarante pour cent de plus qu'un client acheté. Cela justifie d'entretenir ce qui ne se mesure pas : les lives, les groupes, le bouche-à-oreille. Google amène peu de clients mais les meilleurs des payants : ils cherchaient déjà le produit.",
              "31% repeat purchase rate, 34,200 CFA francs in lifetime revenue, and zero advertising costs spent. These buyers arrive via shares, social lives, or referrals. Without pixel tracking, the platform won't guess the exact touchpoint, but definitively proves they yield 40% more margin than ad-acquired traffic. This demonstrates the critical value of word-of-mouth and organic communities. Among paid ads, Google captures high intent, yielding your strongest paid repeat buyers."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
