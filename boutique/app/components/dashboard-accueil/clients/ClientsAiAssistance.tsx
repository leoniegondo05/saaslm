"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { IA_QUESTIONS_CLIENTS } from "./clientsData";

export default function ClientsAiAssistance() {
  const { t } = useDashboardLangue();

  return (
    <div className="rounded-2xl border border-brand-purple/25 bg-[var(--dashboard-glass)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] backdrop-blur-md transition-colors sm:p-5">
      {/* En-tête avec icône étincelle / IA */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 3.2l2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
              {t(
                "Ce que l'assistance peut répondre depuis cet écran",
                "What assistant can answer from this screen"
              )}
            </h3>
            <p className="text-[10px] text-[var(--dashboard-text)]/45">
              {t(
                "Toutes ces questions se répondent avec les seules données affichées ci-dessus",
                "All these questions are fully resolved using only the metrics presented above"
              )}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#8A5CF6]/15 px-2.5 py-1 text-[9px] font-bold text-[#a78bfa]">
          {t("58 variables croisables", "58 cross-referenceable metrics")}
        </span>
      </div>

      {/* Grille des 18 questions types */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {IA_QUESTIONS_CLIENTS.map(({ fr, en }) => (
          <button
            key={fr}
            type="button"
            className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 px-3 py-2 text-left text-[11px] text-[var(--dashboard-text)]/75 transition hover:bg-[var(--dashboard-surface-2)] hover:text-[var(--dashboard-text)] hover:border-[var(--dashboard-text)]/20"
          >
            « {t(fr, en)} »
          </button>
        ))}
      </div>

      {/* Note explicative d'intelligence opérationnelle */}
      <p className="mt-4 border-l-2 border-brand-purple/50 pl-3 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50 sm:text-[11px]">
        {t(
          "Chaque client porte dix-neuf attributs : segment, score de fiabilité, récence, fréquence, montant cumulé, panier moyen, mode de paiement, nombre de références connues, produit d'entrée, produit de deuxième achat, délai entre achats, taux de décroché, taux de confirmation, taux de livraison, litiges ouverts, délai de résolution, commune, canal d'acquisition et nature de ses achats. C'est ce qui permet à l'assistance de ne pas répondre « relancez vos dormants », mais « relancez ces trente et un clients aujourd'hui, avec ce produit-là, parce qu'ils sont au jour vingt-huit et que six sur dix achètent celui-ci en deuxième ».",
          "Every customer profile carries nineteen dynamic attributes: RFM segment, reliability score, recency, frequency, cumulative spend, average basket, payment preference, catalog depth, initial gateway product, repeat purchase SKU, re-order cycle, pickup rate, confirmation rate, delivery success, active disputes, resolution speed, district, acquisition source and channel nature. This empowers the AI assistant to give precise operational directives rather than generic tips: 'Reach out to these 31 clients today with this exact product, as they sit on day 28 and 60% re-order this item second.'"
        )}
      </p>
    </div>
  );
}
