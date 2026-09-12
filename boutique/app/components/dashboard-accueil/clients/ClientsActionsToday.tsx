"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { ACTIONS_AUJOURDHUI, TypeAchat } from "./clientsData";

export default function ClientsActionsToday({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();

  // Seule l'action "drop-jamais-revenus" est marquée tagD (propre au
  // dropshipping) — aucune action n'est marquée comme propre au stockage,
  // donc en vue "stockage" on masque cette seule ligne hors sujet ; en vue
  // "dropshipping" et "les-deux", rien à retirer.
  const actions =
    typeAchat === "stockage" ? ACTIONS_AUJOURDHUI.filter((a) => !a.tagD) : ACTIONS_AUJOURDHUI;

  return (
    <div className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--dashboard-text)] sm:text-base">
            {t("À faire aujourd'hui", "Action items for today")}
          </h3>
          <p className="text-[11px] text-[var(--dashboard-text)]/50">
            {t(
              "Chaque ligne est une liste de clients prête et le message qui va avec",
              "Each row provides an immediate audience list and targeted communication trigger"
            )}
          </p>
        </div>
        <span className="rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2.5 py-1 text-[10px] font-bold text-[#f59e0b]">
          {typeAchat === "les-deux"
            ? t("8 actions · 523 clients", "8 actions · 523 clients")
            : t(`${actions.length} actions`, `${actions.length} actions`)}
        </span>
      </div>

      {/* Liste des actions prêtes (filtrée par typeAchat) */}
      <div className="mt-4 space-y-2.5">
        {actions.map((action) => {
          const isDanger = action.typeIcone === "danger";
          const isWarn = action.typeIcone === "warn";

          return (
            <div
              key={action.id}
              className={`flex flex-col justify-between gap-3 rounded-xl border p-3 sm:flex-row sm:items-center transition-colors ${
                isDanger
                  ? "border-[#f43f5e]/20 bg-[#f43f5e]/5"
                  : isWarn
                  ? "border-[#f59e0b]/15 bg-[var(--dashboard-surface-2)]/30"
                  : "border-[#38bdf8]/20 bg-[#38bdf8]/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icône ! ou i */}
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isDanger
                      ? "bg-[#f43f5e]/20 text-[#f43f5e]"
                      : isWarn
                      ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                      : "bg-[#38bdf8]/20 text-[#38bdf8]"
                  }`}
                >
                  {action.typeIcone === "info" ? "i" : "!"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
                      {t(action.titreFr, action.titreEn)}
                    </h4>
                    {action.tagD && (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ec0c8c]/15 text-[8px] font-bold text-[#ec0c8c]">
                        D
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/55 leading-relaxed sm:text-[11px]">
                    {t(action.descriptionFr, action.descriptionEn)}
                  </p>
                </div>
              </div>

              {/* Bouton d'action */}
              <div className="shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    action.boutonStyle === "primary"
                      ? "bg-[var(--dashboard-text)] text-[var(--dashboard-card-bg)] hover:opacity-90 shadow-xs"
                      : "border border-[var(--dashboard-text)]/20 bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/80 hover:bg-[var(--dashboard-surface-2)]"
                  }`}
                >
                  {t(action.boutonFr, action.boutonEn)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
