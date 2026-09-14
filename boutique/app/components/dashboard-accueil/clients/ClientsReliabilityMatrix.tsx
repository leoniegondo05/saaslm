"use client";

import { useId, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { TypeAchatTag } from "../shared";
import { TypeAchat } from "./clientsData";

export default function ClientsReliabilityMatrix({ typeAchat }: { typeAchat: TypeAchat }) {
  const { t } = useDashboardLangue();
  const uid = useId();
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
      {/* ── CARTE GAUCHE : Le score de fiabilité ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("Le score de fiabilité", "Customer reliability score")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/45">
                {t(
                  "Calculé sur quatre choses : décroche au téléphone, confirme, reçoit le colis, n'ouvre pas de litige",
                  "Computed across 4 factors: phone pickup, confirmation, parcel acceptance, dispute-free"
                )}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* Courbe de distribution de fiabilité style Trading Density Curve */}
          <div className="mt-4">
            <div className="relative w-full">
              <svg
                viewBox="0 0 500 135"
                preserveAspectRatio="none"
                className="w-full h-32 sm:h-36 overflow-visible cursor-crosshair"
              >
                <defs>
                  {/* Dégradé multi-paliers le long du tracé de fiabilité */}
                  <linearGradient id={`density-line-${uid}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="18%" stopColor="#f43f5e" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="42%" stopColor="#f59e0b" />
                    <stop offset="60%" stopColor="#38bdf8" />
                    <stop offset="82%" stopColor="#38bdf8" />
                    <stop offset="88%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>

                  {/* Dégradé vertical sous la cloche de densité */}
                  <linearGradient id={`density-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>

                  <filter id={`density-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Lignes de grille trading horizontales avec valeurs d'échelle à droite */}
                {[0.25, 0.5, 0.75, 1].map((lvl) => {
                  const y = 20 + 86 * (1 - lvl);
                  const val = Math.round(150 * lvl);
                  return (
                    <g key={lvl}>
                      <line
                        x1={14}
                        y1={y}
                        x2={462}
                        y2={y}
                        stroke="var(--dashboard-text)"
                        strokeOpacity={0.06}
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                      <text
                        x={486}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-[var(--dashboard-text)]/30 text-[8px] font-mono select-none"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Faisceaux lumineux volumétriques (Aura Beams) sous chaque pic */}
                {[
                  { id: "tres-faible", x: 20, y: 92, color: "#f43f5e" },
                  { id: "faible", x: 125, y: 74, color: "#f97316" },
                  { id: "moyen", x: 240, y: 42, color: "#f59e0b" },
                  { id: "bon", x: 360, y: 18, color: "#38bdf8", isPeak: true },
                  { id: "excellent", x: 475, y: 56, color: "#10b981" },
                ].map((beam) => {
                  const isHovered = hoveredTier === beam.id;
                  return (
                    <g key={`beam-${beam.id}`}>
                      {/* Faisceau vertical dégradé */}
                      <rect
                        x={beam.x - 22}
                        y={beam.y}
                        width={44}
                        height={106 - beam.y}
                        rx={4}
                        fill={beam.color}
                        fillOpacity={isHovered ? 0.28 : beam.isPeak ? 0.18 : 0.08}
                        className="transition-all duration-150"
                      />
                      {/* Trait laser vertical vers la base */}
                      <line
                        x1={beam.x}
                        y1={beam.y}
                        x2={beam.x}
                        y2={106}
                        stroke={beam.color}
                        strokeOpacity={isHovered ? 0.8 : beam.isPeak ? 0.5 : 0.25}
                        strokeWidth={beam.isPeak ? 1.5 : 1}
                        strokeDasharray="2 2"
                      />
                    </g>
                  );
                })}

                {/* Remplissage de l'aire sous la courbe */}
                <path
                  d="M 20 92 C 60 88, 85 78, 125 74 C 170 70, 195 48, 240 42 C 285 36, 315 16, 360 18 C 405 20, 440 44, 475 56 L 475 106 L 20 106 Z"
                  fill={`url(#density-area-${uid})`}
                />

                {/* Courbe de distribution principale néon */}
                <path
                  d="M 20 92 C 60 88, 85 78, 125 74 C 170 70, 195 48, 240 42 C 285 36, 315 16, 360 18 C 405 20, 440 44, 475 56"
                  fill="none"
                  stroke={`url(#density-line-${uid})`}
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  filter={`url(#density-glow-${uid})`}
                />

                {/* Ligne de base */}
                <line
                  x1={14}
                  y1={106}
                  x2={486}
                  y2={106}
                  stroke="var(--dashboard-text)"
                  strokeOpacity={0.12}
                  strokeWidth={1}
                />

                {/* 5 Nœuds balises de fiabilité */}
                {[
                  { id: "tres-faible", count: 22, x: 20, y: 92, color: "#f43f5e" },
                  { id: "faible", count: 47, x: 125, y: 74, color: "#f97316" },
                  { id: "moyen", count: 108, x: 240, y: 42, color: "#f59e0b" },
                  { id: "bon", count: 142, x: 360, y: 18, color: "#38bdf8", isPeak: true },
                  { id: "excellent", count: 68, x: 475, y: 56, color: "#10b981" },
                ].map((tier) => {
                  const isHovered = hoveredTier === tier.id;
                  return (
                    <g
                      key={tier.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredTier(tier.id)}
                      onMouseLeave={() => setHoveredTier(null)}
                    >
                      {/* Halo pulsé sur le sommet (Bon · 142) */}
                      {tier.isPeak && (
                        <circle cx={tier.x} cy={tier.y} r={9} fill="#38bdf8" fillOpacity={0.25} className="animate-ping" />
                      )}

                      {/* Anneau balise extérieure */}
                      <circle
                        cx={tier.x}
                        cy={tier.y}
                        r={tier.isPeak ? 5.5 : isHovered ? 5.5 : 4}
                        fill={tier.color}
                        className="transition-all"
                      />
                      <circle cx={tier.x} cy={tier.y} r={1.8} fill="#ffffff" />
                      {/* Hitbox */}
                      <circle cx={tier.x} cy={tier.y} r={18} fill="transparent" />

                      {/* Badge / Chiffre au-dessus du point */}
                      {tier.isPeak ? (
                        <g transform={`translate(${tier.x}, ${tier.y - 12})`}>
                          <rect x={-32} y={-7} width={64} height={14} rx={3} fill="#38bdf8" />
                          <text x={0} y={3} textAnchor="middle" fill="#ffffff" className="text-[8px] font-mono font-bold select-none">
                            SOMMET · 142
                          </text>
                        </g>
                      ) : (
                        <g transform={`translate(${tier.x}, ${tier.y - 10})`}>
                          <rect x={-12} y={-6} width={24} height={12} rx={2.5} fill={tier.color} fillOpacity={0.9} />
                          <text x={0} y={2.5} textAnchor="middle" fill="#ffffff" className="text-[7.5px] font-mono font-bold select-none">
                            {tier.count}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Repères sous la courbe de fiabilité */}
              <div className="mt-2 flex justify-between text-[9.5px] font-mono text-[var(--dashboard-text)]/50 px-1">
                <span className="text-[#f43f5e] font-semibold">{t("Très faible", "Very low")}</span>
                <span className="text-[#f97316] font-semibold">{t("Faible", "Low")}</span>
                <span className="text-[#f59e0b] font-semibold">{t("Moyen", "Average")}</span>
                <span className="text-[#38bdf8] font-bold">{t("Bon", "Good")}</span>
                <span className="text-[#10b981] font-bold">{t("Excellent", "Excellent")}</span>
              </div>
            </div>
          </div>

          {/* 5 Niveaux avec boutons d'action */}
          <div className="mt-4 space-y-2">
            {/* Excellent */}
            <div className="flex items-center justify-between rounded-xl border border-[#10b981]/25 bg-[#10b981]/5 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#10b981]">68</span>
                <div>
                  <h4 className="text-[11px] font-semibold text-[var(--dashboard-text)]">
                    {t("Excellent · 90 à 100", "Excellent · 90 to 100")}
                  </h4>
                  <p className="text-[9px] text-[var(--dashboard-text)]/45">
                    {t("Décrochent, confirment, reçoivent. Aucun litige.", "Pick up, confirm, receive. Zero disputes.")}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full bg-[#10b981]/15 px-2.5 py-1 text-[10px] font-semibold text-[#10b981]">
                {t("Servir sans condition", "Serve unconditionally")}
              </span>
            </div>

            {/* Bon */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/30 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[var(--dashboard-text)]">142</span>
                <div>
                  <h4 className="text-[11px] font-semibold text-[var(--dashboard-text)]">
                    {t("Bon · 70 à 89", "Good · 70 to 89")}
                  </h4>
                  <p className="text-[9px] text-[var(--dashboard-text)]/45">
                    {t("Le gros du fichier. Comportement normal.", "Majority of customers. Standard behavior.")}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[var(--dashboard-text)]/65">
                {t("Servir normalement", "Serve normally")}
              </span>
            </div>

            {/* Moyen */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/30 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[var(--dashboard-text)]">108</span>
                <div>
                  <h4 className="text-[11px] font-semibold text-[var(--dashboard-text)]">
                    {t("Moyen · 50 à 69", "Average · 50 to 69")}
                  </h4>
                  <p className="text-[9px] text-[var(--dashboard-text)]/45">
                    {t("Un refus ou plusieurs appels avant contact.", "One refusal or multiple calls before answer.")}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[var(--dashboard-text)]/65">
                {t("Appeler avant d'expédier", "Call before shipping")}
              </span>
            </div>

            {/* Faible */}
            <div className="flex items-center justify-between rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#f59e0b]">47</span>
                <div>
                  <h4 className="text-[11px] font-semibold text-[var(--dashboard-text)]">
                    {t("Faible · 30 à 49", "Low · 30 to 49")}
                  </h4>
                  <p className="text-[9px] text-[var(--dashboard-text)]/45">
                    {t("Deux refus, ou souvent injoignables.", "Two refusals, or frequently unreachable.")}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full bg-[#f59e0b]/15 px-2.5 py-1 text-[10px] font-semibold text-[#f59e0b]">
                {t("Confirmer deux fois", "Double confirm")}
              </span>
            </div>

            {/* Très faible */}
            <div className="flex items-center justify-between rounded-xl border border-[#f43f5e]/25 bg-[#f43f5e]/5 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#f43f5e]">22</span>
                <div>
                  <h4 className="text-[11px] font-semibold text-[#f43f5e]">
                    {t("Très faible · moins de 30", "Very low · under 30")}
                  </h4>
                  <p className="text-[9px] text-[var(--dashboard-text)]/45">
                    {t("Trois refus ou plus. Chaque commande coûte une course.", "Three or more refusals. Every dispatch costs fees.")}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full bg-[#f43f5e]/15 px-2.5 py-1 text-[10px] font-semibold text-[#f43f5e]">
                {t("Achat direct seulement", "Prepaid only")}
              </span>
            </div>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
            {t("Vingt-deux clients, et la plateforme sait quoi en faire", "Twenty-two customers, and the platform knows how to handle them")}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Ils ne sont pas à exclure : ils sont à servir autrement. Leur proposer le paiement immédiat plutôt que le paiement à la livraison règle tout — s'ils paient, le colis part sans risque ; s'ils ne paient pas, la course n'a pas lieu. Aucun client perdu, aucune course perdue. Sur les trente derniers jours, ces vingt-deux numéros ont coûté 41 800 F en courses non payées.",
              "Do not exclude them: serve them through adapted terms. Recommending upfront digital prepayment instead of COD completely protects your balance sheet: if they prepay, the courier dispatches without risk; if not, no delivery fee is lost. Zero lost revenue, zero wasted courier runs. Over the last 30 days, these 22 accounts accounted for 41,800 CFA francs in unpaid delivery runs."
            )}
          </p>
        </div>
      </div>

      {/* ── CARTE DROITE : Valeur et fiabilité, croisées ── */}
      <div className="flex flex-col justify-between rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_4px_16px_-4px_rgba(20,18,32,0.1)] transition-colors sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-[var(--dashboard-text)] sm:text-sm">
                {t("Valeur et fiabilité, croisées", "Value vs reliability matrix")}
              </h3>
              <p className="text-[10px] text-[var(--dashboard-text)]/45">
                {t(
                  "Ce qu'un client rapporte en abscisse, à quel point on peut compter sur lui en ordonnée",
                  "Customer revenue on horizontal axis, operational dependability on vertical axis"
                )}
              </p>
            </div>
            <TypeAchatTag typeAchat={typeAchat} />
          </div>

          {/* Graphique à 4 quadrants */}
          <div className="relative mt-4 overflow-hidden rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-4">
            <div className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 border-t border-dashed border-[var(--dashboard-text)]/20" />
            <div className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-1/2 border-l border-dashed border-[var(--dashboard-text)]/20" />

            <div className="grid min-h-[170px] grid-cols-2 grid-rows-2 text-[10px]">
              {/* Haut Gauche : À DÉVELOPPER */}
              <div className="p-1">
                <span className="font-semibold uppercase tracking-wider text-[#38bdf8] text-[9px]">
                  {t("À DÉVELOPPER", "NURTURE")}
                </span>
                <p className="text-[8px] text-[var(--dashboard-text)]/40">{t("Fiables mais petits paniers", "Reliable, small baskets")}</p>
              </div>

              {/* Haut Droite : À CHOUCHOUTER */}
              <div className="p-1 text-right">
                <span className="font-semibold uppercase tracking-wider text-[#10b981] text-[9px]">
                  {t("À CHOUCHOUTER", "VIP CARE")}
                </span>
                <p className="text-[8px] text-[var(--dashboard-text)]/40">{t("Gros paniers et fiables", "Large baskets, reliable")}</p>
              </div>

              {/* Bas Gauche : À LAISSER */}
              <div className="flex flex-col justify-end p-1">
                <span className="font-semibold uppercase tracking-wider text-[var(--dashboard-text)]/50 text-[9px]">
                  {t("À LAISSER", "LEAVE")}
                </span>
                <p className="text-[8px] text-[var(--dashboard-text)]/40">{t("Petits paniers, peu fiables", "Small baskets, low trust")}</p>
              </div>

              {/* Bas Droite : À SÉCURISER */}
              <div className="flex flex-col items-end justify-end p-1 text-right">
                <span className="font-semibold uppercase tracking-wider text-[#fb923c] text-[9px]">
                  {t("À SÉCURISER", "SECURE")}
                </span>
                <p className="text-[8px] text-[var(--dashboard-text)]/40">{t("Gros paniers mais risqués", "Large baskets, high risk")}</p>
              </div>
            </div>

            {/* Bulles interactives de la matrice croisée */}
            <div className="pointer-events-none absolute inset-0">
              {/* Bulle 142 (À DÉVELOPPER) */}
              <div className="absolute top-[32%] left-[36%] -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#38bdf8] text-white text-[11px] font-bold shadow-md">
                142
              </div>
              {/* Bulle 68 (À CHOUCHOUTER) */}
              <div className="absolute top-[34%] left-[78%] -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#34d399] text-white text-[11px] font-bold shadow-md">
                68
              </div>
              {/* Bulle 146 (À LAISSER) */}
              <div className="absolute top-[72%] left-[34%] -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#5A6072] text-white text-[11px] font-bold shadow-md">
                146
              </div>
              {/* Bulle 31 (À SÉCURISER) */}
              <div className="absolute top-[68%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f59e0b] text-white text-[10px] font-bold shadow-md">
                31
              </div>
            </div>

            {/* Légendes des axes */}
            <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-medium text-[var(--dashboard-text)]/35">
              {t("Valeur du client →", "Customer value →")}
            </div>
            <div className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-medium text-[var(--dashboard-text)]/35">
              {t("← Fiabilité", "← Reliability")}
            </div>
          </div>

          {/* Grille 4 cartes descriptives */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {/* À chouchouter */}
            <div className="rounded-xl border border-[#10b981]/30 bg-[#10b981]/5 p-2.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#10b981]">
                {t("À chouchouter", "VIP Care")}
              </span>
              <div className="mt-0.5 text-base font-bold text-[var(--dashboard-text)]">68</div>
              <p className="text-[9px] font-semibold text-[var(--dashboard-text)]/60">{t("41 % du chiffre", "41% revenue")}</p>
              <p className="mt-1 text-[8px] text-[var(--dashboard-text)]/45 leading-tight">
                {t("Nouveautés en avant-première, express offert, jamais d'attente au téléphone.", "Preview access, free express, priority call.")}
              </p>
            </div>

            {/* À sécuriser */}
            <div className="rounded-xl border border-[#fb923c]/30 bg-[#fb923c]/5 p-2.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#fb923c]">
                {t("À sécuriser", "Secure")}
              </span>
              <div className="mt-0.5 text-base font-bold text-[#10b981]">31</div>
              <p className="text-[9px] font-semibold text-[var(--dashboard-text)]/60">{t("14 % du chiffre", "14% revenue")}</p>
              <p className="mt-1 text-[8px] text-[var(--dashboard-text)]/45 leading-tight">
                {t("Ils achètent gros mais refusent parfois. Leur proposer le paiement immédiat.", "Buy big but return sometimes. Offer prepayment.")}
              </p>
            </div>

            {/* À développer */}
            <div className="rounded-xl border border-[#38bdf8]/30 bg-[#38bdf8]/5 p-2.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#38bdf8]">
                {t("À développer", "Nurture")}
              </span>
              <div className="mt-0.5 text-base font-bold text-[var(--dashboard-text)]">142</div>
              <p className="text-[9px] font-semibold text-[var(--dashboard-text)]/60">{t("32 % du chiffre", "32% revenue")}</p>
              <p className="mt-1 text-[8px] text-[var(--dashboard-text)]/45 leading-tight">
                {t("Fiables mais petits paniers. C'est là que le deuxième produit se vend.", "Reliable, small baskets. Cross-sell items.")}
              </p>
            </div>

            {/* À laisser */}
            <div className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/30 p-2.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--dashboard-text)]/50">
                {t("À laisser", "Leave")}
              </span>
              <div className="mt-0.5 text-base font-bold text-[var(--dashboard-text)]">146</div>
              <p className="text-[9px] font-semibold text-[var(--dashboard-text)]/60">{t("13 % du chiffre", "13% revenue")}</p>
              <p className="mt-1 text-[8px] text-[var(--dashboard-text)]/45 leading-tight">
                {t("Ni valeur ni fiabilité. Ne rien dépenser dessus.", "Neither value nor reliability. Spend zero.")}
              </p>
            </div>
          </div>
        </div>

        {/* Encart analytique */}
        <div className="mt-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)]/40 p-3">
          <h4 className="text-xs font-bold text-[var(--dashboard-text)]">
            {t("Les trente et un clients « à sécuriser » sont ceux qui coûtent le plus cher à mal traiter", "The 31 'Secure' clients cost the most if mistreated")}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Ils font quatorze pour cent du chiffre avec les paniers les plus gros, et refusent une fois sur trois. Les exclure vous ferait perdre plus que leurs refus ne vous coûtent. Les servir sans précaution revient à payer des courses de gros colis qui reviennent. Le paiement immédiat est exactement l'outil fait pour eux, et c'est le seul endroit du fichier où il faut le proposer activement.",
              "They generate 14% of revenue with the largest average baskets, but refuse one out of three shipments. Excluding them would cost more in lost gross sales than their returns cost. Delivering unconditionally means paying delivery runs for heavy packages that return. Prepayment is the exact remedy built for them, and this is the only segment where you should actively promote it."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
