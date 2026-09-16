"use client";

import { Card, Divider, Nature, StatRow, texteAvecChiffres } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Carte "Vos clients reviennent-ils ?" — cohortes de rétention par semaine
  d'acquisition (30/60/90 jours). Card standard (var(--dashboard-*), suit
  le thème clair/sombre), pas de panneau toujours-sombre.

  Une semaine plus ancienne a eu le temps d'atteindre 60/90 jours ; une
  semaine récente n'a encore que son chiffre à 30 jours. D'où le triangle
  de cellules vides (bordure seule, sans remplissage) en bas à droite.
*/

type Cohorte = {
  semaine: number;
  j30: number | null;
  j60: number | null;
  j90: number | null;
};

const COHORTES: Cohorte[] = [
  { semaine: 1, j30: 14, j60: 21, j90: 26 },
  { semaine: 2, j30: 12, j60: 19, j90: 24 },
  { semaine: 3, j30: 16, j60: 23, j90: null },
  { semaine: 4, j30: 11, j60: 17, j90: null },
  { semaine: 5, j30: 13, j60: null, j90: null },
  { semaine: 6, j30: 9, j60: null, j90: null },
];

const VALEURS = COHORTES.flatMap((c) => [c.j30, c.j60, c.j90]).filter((v): v is number => v != null);
const MIN = Math.min(...VALEURS);
const MAX = Math.max(...VALEURS);

// Échelle séquentielle une teinte (vert), foncée→claire selon l'intensité —
// mêmes bornes que le vert "positif" déjà utilisé ailleurs (WaterfallChart
// / FinancesSection #0E9F6E, #4FE0AE), assombri en haut de plage pour que
// le texte blanc en gras reste lisible même sur les cellules les plus fortes.
function cellColor(v: number) {
  const t = MAX === MIN ? 0.5 : (v - MIN) / (MAX - MIN);
  const lightness = 34 + t * 20; // 34% (foncé) → 54% (clair)
  return `hsl(156, 42%, ${lightness}%)`;
}

function Cell({ value }: { value: number | null }) {
  if (value == null) {
    return <div className="h-11 flex-1 rounded-xl border border-[var(--dashboard-text)]/15" />;
  }
  return (
    <div
      className="flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-extrabold text-white font-figures"
      style={{ background: cellColor(value) }}
    >
      {value} %
    </div>
  );
}

export default function RetentionCard() {
  const { t } = useDashboardLangue();

  return (
    <Card className="!bg-[var(--dashboard-glass)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{t("Vos clients reviennent-ils ?", "Do your customers come back?")}</p>
          <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">
            {t("Part de chaque semaine d'acquisition qui a recommandé", "Share of each acquisition week that reordered")}
          </p>
        </div>
        <Nature code="B" />
      </div>

      <div className="mt-4 flex gap-2 pl-12">
        <span className="flex-1 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">
          {texteAvecChiffres(t("À 30 jours", "At 30 days"))}
        </span>
        <span className="flex-1 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">
          {texteAvecChiffres(t("À 60 jours", "At 60 days"))}
        </span>
        <span className="flex-1 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">
          {texteAvecChiffres(t("À 90 jours", "At 90 days"))}
        </span>
      </div>

      <div className="mt-2 space-y-2">
        {COHORTES.map((c) => (
          <div key={c.semaine} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-[11px] text-[var(--dashboard-text)]/50">
              {texteAvecChiffres(t(`Sem. ${c.semaine}`, `Wk ${c.semaine}`))}
            </span>
            <Cell value={c.j30} />
            <Cell value={c.j60} />
            <Cell value={c.j90} />
          </div>
        ))}
      </div>

      <Divider />

      <StatRow label={t("Délai moyen entre la 1re et la 2e commande", "Average time between 1st and 2nd order")} value={<span className="font-figures">{t("34 jours", "34 days")}</span>} bold={false} />
      <StatRow label={t("Commandes par client sur 12 mois", "Orders per customer over 12 months")} value={<span className="font-figures">1,4</span>} bold={false} />
      <StatRow label={t("Valeur d'un client sur sa vie", "Customer lifetime value")} value={<span className="text-[#178a3f] font-figures">27 100 F</span>} />

      <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
        {t(
          "Un client sur quatre revient dans les trois mois, et le second achat arrive vers le trente-quatrième jour. Une relance au vingt-huitième jour tomberait juste avant cette fenêtre, au moment où l'envie existe déjà.",
          "One customer in four returns within three months, and the second purchase lands around day thirty-four. A follow-up on day twenty-eight would land just ahead of that window, right when the urge is already there."
        )}
      </p>
    </Card>
  );
}
