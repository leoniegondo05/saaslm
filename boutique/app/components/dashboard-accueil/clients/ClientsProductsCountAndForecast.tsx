"use client";

import { useId, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag, texteAvecChiffres } from "../shared";
import { TypeAchat } from "./clientsData";

export default function ClientsProductsCountAndForecast({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();
  const uid = useId();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
      {/* ── CARTE GAUCHE : Nombre de produits connus ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("Combien de vos produits chaque client connaît", "How many of your products each customer knows")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/40">
                {t(
                  "Nombre de références différentes achetées, par client",
                  "Number of unique SKUs ordered per customer"
                )}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* Barres de proportions des références */}
          <div className="mt-4">
            <div className="flex h-12 items-center gap-2">
              {/* 1 produit : 75% */}
              <div className="flex h-full flex-[75] flex-col justify-center rounded-lg border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-surface-2)]/60 px-2.5">
                <span className="text-[10px] font-figures-bold text-[var(--dashboard-text)]">75 %</span>
              </div>
              {/* 2 produits : 17% */}
              <div className="flex h-full flex-[17] flex-col justify-center rounded-lg border border-[#38bdf8]/30 bg-[#38bdf8]/20 px-2">
                <span className="text-[10px] font-figures-bold text-[#38bdf8]">17 %</span>
              </div>
              {/* 3 produits : 6% */}
              <div className="flex h-full flex-[6] flex-col justify-center rounded-lg border border-[#a78bfa]/30 bg-[#a78bfa]/20 px-1 text-center">
                <span className="text-[9px] font-figures-bold text-[#a78bfa]">6%</span>
              </div>
              {/* 4+ : 2% */}
              <div className="flex h-full flex-[2] flex-col justify-center rounded-lg border border-[#34d399]/30 bg-[#34d399]/20 text-center">
                <span className="text-[8px] font-figures-bold text-[#34d399]">2</span>
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
              <span>{texteAvecChiffres(t("1 produit", "1 product"))}</span>
              <span className="-translate-x-6">{texteAvecChiffres(t("2 produits", "2 products"))}</span>
              <span>{texteAvecChiffres(t("3 produits", "3 products"))}</span>
              <span>{texteAvecChiffres(t("4 et plus", "4 or more"))}</span>
            </div>
          </div>

          {/* Métriques clés */}
          <div className="mt-4 space-y-2 border-t border-[var(--dashboard-text)]/10 pt-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Un seul produit connu", "Only one product known")}
              </span>
              <span className="font-bold text-[#f59e0b]">{texteAvecChiffres("291 clients · 75 %")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Références par client", "Average SKUs per customer")}
              </span>
              <span className="font-semibold">{texteAvecChiffres("1,3 sur 32")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Valeur d'un client à 1 produit", "Value of a 1-product client"))}
              </span>
              <span className="font-semibold font-figures">19 200F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Valeur d'un client à 3 produits", "Value of a 3-product client"))}
              </span>
              <span className="font-figures-bold text-[#10b981]">62 400F</span>
            </div>
            <div className="flex justify-between border-t border-[var(--dashboard-text)]/10 pt-1.5">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Taux de départ d'un client à 1 produit", "Churn rate for 1-product client"))}
              </span>
              <span className="font-bold text-[#f43f5e]">
                {texteAvecChiffres(t("4 fois plus élevé", "4x higher"))}
              </span>
            </div>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
            {texteAvecChiffres(t(
              "Trois quarts de vos clients ne connaissent qu'un seul de vos trente-deux produits",
              "Three quarters of your shoppers only know one of your 32 catalog items"
            ))}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {texteAvecChiffres(t(
              "Un client qui a acheté trois références vaut plus de trois fois celui qui n'en connaît qu'une, et part quatre fois moins. Ce n'est pas seulement l'effet du nombre d'achats : connaître plusieurs produits crée une habitude, une raison de revenir voir. Faire découvrir un deuxième produit est l'action de fidélisation la moins chère qui existe — elle ne demande ni remise ni publicité, seulement de le mentionner au bon moment.",
              "A customer who orders 3 SKUs yields over 3x more lifetime value and churns 4x less frequently. Cross-catalog discovery builds genuine buying habits and store loyalty. Introducing a second product is the most cost-effective retention lever available — requiring no promo code or ad spend, simply timely follow-up recommendations."
            ))}
          </p>
        </div>
      </div>

      {/* ── CARTE DROITE : Votre portefeuille dans un an ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("Votre portefeuille dans un an", "Your active portfolio in one year")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/40">
                {t(
                  "Clients actifs attendus, au rythme actuel de recrutement et de départs",
                  "Projected active buyers at current acquisition vs churn velocity"
                )}
              </p>
            </div>
            <span className="rounded-full bg-[#8A5CF6]/15 px-2 py-0.5 text-[9px] font-semibold text-[#a78bfa]">
              {t("Projection", "Projection")}
            </span>
          </div>

          {/* Graphique de projection style Trading Forecast Corridor */}
          <div className="mt-4">
            <div className="relative w-full">
              <svg
                viewBox="0 0 500 135"
                preserveAspectRatio="none"
                className="w-full h-32 sm:h-36 overflow-visible cursor-crosshair"
              >
                <defs>
                  {/* Dégradé cyan/bleu néon de projection */}
                  <linearGradient id={`forecast-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id={`forecast-line-${uid}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="65%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <filter id={`forecast-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Grille trading horizontale */}
                {[0.33, 0.66, 1].map((lvl) => {
                  const y = 24 + 88 * (1 - lvl);
                  return (
                    <line
                      key={lvl}
                      x1={14}
                      y1={y}
                      x2={486}
                      y2={y}
                      stroke="var(--dashboard-text)"
                      strokeOpacity={0.06}
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Remplissage de projection trading */}
                <path
                  d="M 14 88 C 80 80, 180 34, 330 28 C 390 26, 440 48, 484 58 L 484 112 L 14 112 Z"
                  fill={`url(#forecast-area-${uid})`}
                />

                {/* Ligne d'hypothèse de fidélisation optimale (moyenne réseau 24% sans érosion) */}
                <path
                  d="M 330 28 C 380 26, 430 20, 484 16"
                  fill="none"
                  stroke="#10b981"
                  strokeOpacity={0.5}
                  strokeWidth={1.4}
                  strokeDasharray="4 3"
                />

                {/* Courbe principale de projection néon */}
                <path
                  d="M 14 88 C 80 80, 180 34, 330 28 C 390 26, 440 48, 484 58"
                  fill="none"
                  stroke={`url(#forecast-line-${uid})`}
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  filter={`url(#forecast-glow-${uid})`}
                />

                {/* Ligne repère de base */}
                <line
                  x1={14}
                  y1={112}
                  x2={486}
                  y2={112}
                  stroke="var(--dashboard-text)"
                  strokeOpacity={0.12}
                  strokeWidth={1}
                />

                {/* Points jalons clés */}
                {/* 1. Aujourd'hui (198) */}
                <g>
                  <circle cx={14} cy={88} r={3.5} fill="#38bdf8" />
                  <circle cx={14} cy={88} r={1.8} fill="#ffffff" />
                  <text x={14} y={78} textAnchor="start" className="fill-[#38bdf8] text-[8.5px] font-figures-bold">
                    198
                  </text>
                </g>

                {/* 2. +3 mois (212) */}
                <g>
                  <circle cx={172} cy={50} r={2.5} fill="#38bdf8" fillOpacity={0.7} />
                  <line x1={172} y1={50} x2={172} y2={112} stroke="var(--dashboard-text)" strokeOpacity={0.08} strokeDasharray="2 2" />
                </g>

                {/* 3. +6 mois : PIC DU PORTEFEUILLE (219) */}
                <g>
                  <circle cx={330} cy={28} r={9} fill="#10b981" fillOpacity={0.2} className="animate-ping" />
                  <circle cx={330} cy={28} r={4.5} fill="#10b981" filter={`url(#forecast-glow-${uid})`} />
                  <circle cx={330} cy={28} r={2} fill="#ffffff" />
                  <line x1={330} y1={28} x2={330} y2={112} stroke="#10b981" strokeOpacity={0.3} strokeDasharray="2 2" />
                  {/* Badge PIC 219 */}
                  <g transform="translate(330, 12)">
                    <rect x={-24} y={-8} width={48} height={15} rx={3} fill="#10b981" />
                    <text x={0} y={3} textAnchor="middle" fill="#ffffff" className="text-[8.5px] font-figures-bold select-none">
                      PIC · 219
                    </text>
                  </g>
                </g>

                {/* 4. +12 mois : ÉROSION À 209 */}
                <g>
                  <circle cx={484} cy={58} r={3.5} fill="#f59e0b" />
                  <circle cx={484} cy={58} r={1.8} fill="#ffffff" />
                  <text x={484} y={50} textAnchor="end" className="fill-[#f59e0b] text-[8.5px] font-figures-bold">
                    209
                  </text>
                </g>
              </svg>

              {/* Repères horizontaux temporels alignés */}
              <div className="mt-2 flex justify-between text-[9.5px] text-[var(--dashboard-text)]/50 px-1">
                <span className="text-[#38bdf8] font-bold">{t("Auj.", "Today")}</span>
                <span className="font-figures">+3 mois</span>
                <span className="text-[#10b981] font-figures-bold">+6 mois</span>
                <span className="text-[#f59e0b] font-figures-bold">+12 mois</span>
              </div>
            </div>
          </div>

          {/* Métriques du portefeuille */}
          <div className="mt-4 space-y-1.5 border-t border-[var(--dashboard-text)]/10 pt-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {t("Clients actifs aujourd'hui", "Active clients today")}
              </span>
              <span className="font-figures-bold">198</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Dans six mois", "In 6 months"))}
              </span>
              <span className="font-figures-bold text-[#10b981]">219</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Dans douze mois", "In 12 months"))}
              </span>
              <span className="font-figures-bold text-[#f59e0b]">209</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dashboard-text)]/55">
                {texteAvecChiffres(t("Départs attendus sur 90 jours", "Expected churn over 90 days"))}
              </span>
              <span className="font-figures-bold text-[#f43f5e]">34</span>
            </div>
            <div className="flex justify-between border-t border-[var(--dashboard-text)]/10 pt-1.5">
              <span className="text-[var(--dashboard-text)]/70 font-medium">
                {t("Valeur restante du portefeuille", "Remaining portfolio equity")}
              </span>
              <span className="font-figures-bold">2 455 200F</span>
            </div>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
            {t("La courbe monte, puis redescend", "The curve climbs, then gently erodes")}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {texteAvecChiffres(t(
              "Avec dix-huit pour cent de réachat, chaque nouveau client compense à peine un départ passé le sixième mois : le portefeuille plafonne vers deux cent vingt puis s'érode. À vingt-quatre pour cent, la moyenne du réseau, la même publicité donnerait une courbe qui ne redescend jamais. C'est la démonstration la plus claire que la fidélisation n'est pas un supplément d'âme mais la condition de la croissance : sans elle, il faut recruter toujours plus vite pour rester au même endroit.",
              "With an 18% repeat rate, fresh acquisitions barely offset churn past month 6: your customer base plateaus near 220 then slowly erodes. At the 24% network average, that same ad budget yields a curve that steadily compounds upward. Retention is not an optional bonus — it is the fundamental prerequisite of scalable growth: without it, you must acquire ever faster just to stand still."
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
