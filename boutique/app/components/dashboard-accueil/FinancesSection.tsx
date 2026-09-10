"use client";

import PaymentMethodCard from "../PaymentMethodCard";
import { AreaChart, Bar, Card, Divider, HeaderActionBtn, LegendRow, MiniStat, SectionHeader, StatRow, Tag, WaterfallChart } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Finances" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx pour que ce dernier ne soit plus qu'un
  orchestrateur (cf. FinancesSection/CommandesSection/... + AccueilNav).
*/

/*
  Anneau de proportion (conic-gradient + trou central) — remplace les
  ".donut"/".ring" en SVG du document envoyé, sans librairie : un disque
  et un disque troué de la couleur de la carte par-dessus.
*/
function Ring({ pct, color, trackColor, size = 96, children }: { pct: number; color: string; trackColor?: string; size?: number; children?: React.ReactNode }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, ${trackColor ?? "rgba(20,18,32,0.08)"} ${pct * 3.6}deg)` }}
      />
      <div
        className="absolute rounded-full card-tint"
        style={{ inset: size * 0.16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </div>
    </div>
  );
}

/*
  Barre empilée à plusieurs segments — pour "l'argent immobilisé"
  (stock déposé / suspendu / en livraison / retours), légendée juste en
  dessous avec LegendRow (couleurs partagées).
*/
function StackedBar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
      {segments.map((s, i) => (
        <span key={i} style={{ width: `${s.pct}%`, background: s.color }} />
      ))}
    </div>
  );
}

/*
  Petit badge "N commandes" en rond plein (pas un Ring troué) — coin
  supérieur droit de chaque colonne de comparaisonCard, comme sur le
  document envoyé.
*/
function CountBadge({ count, color, label }: { count: number; color: string; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: `${color}1f`, color }}
      >
        {count}
      </span>
      <span className="text-center text-[7px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{label}</span>
    </div>
  );
}

/*
  Ligne "label — valeur" avec sa barre en dessous, longueur relative au
  panier moyen de la colonne (première ligne) — une colonne = une couleur.
*/
/*
  Double barre "revenu généré (rose) / dépense publicitaire (gris)" —
  carte "D'où viennent vos commandes" : les deux échelles partagent le
  même max (le revenu Meta), la ligne "Ventes organiques" n'a pas de
  dépense donc pas de barre rose au-dessus.
*/
function DualBar({ revenuePct, spendPct }: { revenuePct: number; spendPct: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
        {revenuePct > 0 && <div className="h-full rounded-full bg-brand-pink" style={{ width: `${revenuePct}%` }} />}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-transparent">
        <div className="h-full rounded-full border border-[var(--dashboard-text)]/25" style={{ width: `${Math.max(spendPct, 4)}%` }} />
      </div>
    </div>
  );
}

function CompareRow({ label, value, pct, color, strong = false }: { label: string; value: string; pct: number; color: string; strong?: boolean }) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] first:mt-0">
      <span className="text-[var(--dashboard-text)]/55">{label}</span>
      <span className="flex items-center gap-2">
        <span className={strong ? "font-bold" : "font-semibold"} style={strong ? { color } : undefined}>
          {value}
        </span>
        <span className="w-20 shrink-0">
          <Bar pct={pct} background={color} />
        </span>
      </span>
    </div>
  );
}

export default function FinancesSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();

  // 30 jours de solde disponible (cf. graphe "évolution de la trésorerie") :
  // deux paliers de fin de suspension groupée (bonds), comme sur le modèle envoyé.
  const cashDays = [42, 44, 46, 48, 51, 53, 56, 59, 62, 65, 69, 72, 76, 25, 28, 31, 34, 37, 41, 45, 49, 53, 57, 61, 65, 26, 30, 34, 38, 41];
  const forecastDays = [30, 31, 33, 32, 34, 36, 35, 38, 40, 39, 42, 44, 43, 46, 48];

  // Rangée du haut du document envoyé : le portefeuille (carte gardée) à
  // gauche, le solde du sous-compte à droite — même disposition (scw2).
  const soldeCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Solde de votre sous-compte", "Your sub-account balance")}</h3>
          <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">1 482 300 F</p>
        <p className="mt-2 text-[11px] text-[var(--dashboard-text)]/50">
          {t(
            "Rien ne se demande : dès qu'un client paie, la plateforme répartit le montant entre les sous-comptes de chaque acteur. Votre part arrive sur le portefeuille de l'opérateur choisi par le client.",
            "Nothing to request: as soon as a client pays, the platform splits the amount between each party's sub-account. Your share lands on the wallet of the operator the client used."
          )}
        </p>
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
          <span className="h-full" style={{ width: "69%", background: "linear-gradient(90deg,#4FE0AE,#38BDF8)" }} />
          <span className="h-full" style={{ width: "31%", background: "linear-gradient(90deg,#FFB84D,#FF9A3D)" }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#4FE0AE" }} /><div><p className="font-semibold">1 022 800 F</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Disponible tout de suite", "Available right away")}</p></div></div>
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#FFB84D" }} /><div><p className="font-semibold">459 500 F</p><p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Suspendu · délai de litige", "On hold · dispute window")}</p></div></div>
        </div>
        <div className="mt-3 rounded-2xl p-4" style={{ background: "var(--dashboard-surface-2)" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold">{t("Votre délai de suspension : 72 h", "Your hold period: 72 h")}</p>
              <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
                {t("C'est vous qui le fixez, jamais moins de 24 h. Passé ce délai, votre part devient disponible sans démarche.", "You set it, never under 24 h. Once it's over, your share becomes available with no action needed.")}
              </p>
            </div>
            <span className="inline-flex shrink-0 rounded-md p-px" style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}>
              <button type="button" className="rounded-[5px] bg-[var(--dashboard-card-bg)] px-2.5 py-1.5 text-[9px] font-semibold">
                {t("Changer le délai", "Change the hold period")}
              </button>
            </span>
          </div>
        </div>
      </Card>
  );

  // Deuxième bloc du document : l'évolution du solde jour par jour.
  // Les deux creux (index 13 et 25 dans cashDays) sont des fins de
  // suspension groupées : plusieurs commandes arrivent au terme de leur
  // délai le même jour, d'où le trait vertical pointillé + point blanc
  // sur le graphe, comme sur le document envoyé.
  const cashEndOfHoldMarkers = [13, 25];

  const evolutionCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Évolution de votre trésorerie", "Cash evolution")}</h3>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[9px] font-medium text-[var(--dashboard-text)]/55 sm:flex">
              <span className="h-[2px] w-3 rounded-full" style={{ background: "#22C55E" }} />
              {t("Solde disponible", "Available balance")}
            </span>
            <span className="hidden items-center gap-1.5 text-[9px] font-medium text-[var(--dashboard-text)]/55 sm:flex">
              <span className="w-3 border-t border-dashed" style={{ borderColor: "var(--dashboard-text)", opacity: 0.4 }} />
              {t("Fin de suspension", "End of hold")}
            </span>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Solde disponible, jour par jour, sur la période choisie", "Available balance, day by day, over the chosen period")}</p>
        <AreaChart values={cashDays} color="#22C55E" markers={cashEndOfHoldMarkers} />
        <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
          <span>9 août</span><span>16 août</span><span>23 août</span><span>30 août</span><span>8 sept.</span>
        </div>
        <Divider />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label={t("Point le plus bas", "Lowest point")} value="318 000 F" />
          <MiniStat label={t("Point le plus haut", "Highest point")} value="861 000 F" />
          <MiniStat label={t("Solde moyen", "Average balance")} value="601 400 F" />
          <MiniStat label={t("Variation", "Change")} value="+87 %" tone="pink" />
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "Les deux traits verticaux sont des fins de suspension groupées : plusieurs commandes arrivent au terme de leur délai le même jour, et le disponible fait un bond.",
            "The two vertical lines are grouped hold releases: several orders reach the end of their window the same day, and the available balance jumps."
          )}
        </p>
      </Card>
  );

  // Troisième bloc : le compte de résultat de la période — cascade
  // (encaissé → charges → résultat net), fidèle au document envoyé :
  // titre + marges en % en tête, graphe en cascade, deux encarts
  // numérotés (prix produit partenaire / frais fixés par le partenaire),
  // puis trois pavés de marges en F avec leur explication.
  const compteResultatCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Votre compte de résultat sur la période", "Your P&L for the period")}</h3>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Du montant encaissé à ce qui vous reste réellement", "From what's collected to what's really left")}</p>
          </div>
          <div className="flex flex-wrap items-start gap-4 sm:gap-5">
            <div className="text-center">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge brute", "Gross margin")}</p>
              <p className="mt-0.5 text-sm font-bold">54,2 %</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge de contribution", "Contribution margin")}</p>
              <p className="mt-0.5 text-sm font-bold" style={{ color: "#0C86BE" }}>24,1 %</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge nette", "Net margin")}</p>
              <p className="mt-0.5 text-sm font-bold" style={{ color: "#0E9F6E" }}>21,7 %</p>
            </div>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
        </div>

        <WaterfallChart
          items={[
            { label: t("Encaissé des clients", "Collected from clients"), display: "2 316 400 F", amount: 2316400, kind: "total" },
            { label: t("Prix produit partenaire", "Partner product price"), display: "− 1 062 000 F", amount: -1062000, kind: "delta" },
            { label: t("Frais logistiques", "Logistics fees"), display: "− 178 500 F", amount: -178500, kind: "delta" },
            { label: t("Frais de transaction", "Transaction fees"), display: "− 34 700 F", amount: -34700, kind: "delta" },
            { label: t("Garantie produit", "Product warranty"), display: "− 12 400 F", amount: -12400, kind: "delta" },
            { label: t("Coût des refus", "Cost of refusals"), display: "− 31 000 F", amount: -31000, kind: "delta" },
            { label: t("Publicité", "Advertising"), display: "− 412 000 F", amount: -412000, kind: "delta" },
            { label: t("Commission LM", "LM commission"), display: "− 57 900 F", amount: -57900, kind: "delta" },
            { label: t("Abonnement", "Subscription"), display: "− 25 000 F", amount: -25000, kind: "delta" },
            { label: t("Résultat net", "Net result"), display: "502 900 F", amount: 502900, kind: "total" },
          ]}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "#38BDF8" }}>1</span>
              <div>
                <p className="text-[11px] font-semibold">{t("Prix produit partenaire", "Partner product price")}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
                  {t(
                    "En stockage management, c'est ce que vous avez payé pour constituer votre stock. En dropshipping, c'est le prix que le partenaire agréé a fixé et qu'il retient à chaque vente. Deux origines, une seule ligne.",
                    "In warehousing, it's what you paid to build your stock. In dropshipping, it's the price the approved partner set and keeps on every sale. Two origins, one line."
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "#38BDF8" }}>2</span>
              <div>
                <p className="text-[11px] font-semibold">{t("Frais logistiques, transaction, garantie", "Logistics, transaction, warranty")}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
                  {t(
                    "Les frais logistiques et la garantie produit sont fixés par le partenaire agréé. Les frais de transaction sont ceux des opérateurs mobile money, prélevés au moment du paiement.",
                    "Logistics fees and the product warranty are set by the approved partner. Transaction fees are the mobile-money operators', taken at the moment of payment."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge brute", "Gross margin")}</p>
            <p className="mt-1 text-lg font-bold">1 254 400 F</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce que laisse la marchandise, avant tout frais.", "What the goods leave, before any fees.")}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Marge de contribution", "Contribution margin")}</p>
            <p className="mt-1 text-lg font-bold" style={{ color: "#0C86BE" }}>585 800 F</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t("Après logistique et publicité. C'est le chiffre qui dit si le modèle tient : sous zéro, vendre plus fait perdre plus.", "After logistics and ads. This is the number that says if the model holds: below zero, selling more loses more.")}
            </p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "rgba(79,224,174,.14)" }}>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Résultat net", "Net result")}</p>
            <p className="mt-1 text-lg font-bold" style={{ color: "#0E9F6E" }}>502 900 F</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{t("Après commission et abonnement. Ce qui reste vraiment.", "After commission and subscription. What's really left.")}</p>
          </div>
        </div>
      </Card>
  );

  // Quatrième bloc : la comparaison stockage management / dropshipping —
  // deux colonnes bordées côte à côte (une couleur chacune), comme sur le
  // document envoyé : ring global à droite du header, badge "N commandes"
  // en tête de chaque colonne, lignes avec barre proportionnelle au panier
  // moyen de la colonne, puis taux de contribution / argent avancé en pied.
  const STOCKAGE_COLOR = "#38BDF8";
  const DROP_COLOR = "#EC4899";
  const comparaisonCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Vos deux façons de vendre, comparées", "Your two ways to sell, compared")}</h3>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("La même analyse, ramenée à une commande, de chaque côté", "The same analysis, brought down to one order, on each side")}</p>
          </div>
          <Ring pct={68} color={STOCKAGE_COLOR} trackColor={DROP_COLOR} size={72}>
            <span className="text-xs font-bold">68 %</span>
            <span className="text-[7px] text-[var(--dashboard-text)]/40">{t("stockage", "warehousing")}</span>
          </Ring>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {/* Colonne Stockage management */}
          <div className="rounded-2xl border p-3" style={{ borderColor: `${STOCKAGE_COLOR}40`, background: `${STOCKAGE_COLOR}0d` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold">{t("Stockage management", "Warehousing")}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--dashboard-text)]/45">
                  {t("Votre stock, déposé chez le partenaire. Vous avancez l'argent, vous gardez la marge.", "Your stock, held at the partner's. You front the cash, you keep the margin.")}
                </p>
              </div>
              <CountBadge count={78} color={STOCKAGE_COLOR} label={t("commandes", "orders")} />
            </div>
            <Divider />
            <CompareRow label={t("Panier moyen encaissé", "Average basket collected")} value="20 295 F" pct={100} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Prix produit, déjà payé au fournisseur", "Product price, already paid to supplier")} value="− 9 308 F" pct={46} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Logistique, transaction, garantie", "Logistics, transaction, warranty")} value="− 1 896 F" pct={9} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Acquisition du client", "Client acquisition")} value="− 3 462 F" pct={17} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Commission LM", "LM commission")} value="− 507 F" pct={3} color={STOCKAGE_COLOR} />
            <CompareRow label={t("Marge de contribution", "Contribution margin")} value="5 122 F" pct={25} color={STOCKAGE_COLOR} strong />
            <Divider />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Taux de contribution", "Contribution rate")}</p>
                <p className="mt-0.5 text-sm font-bold" style={{ color: STOCKAGE_COLOR }}>25,2 %</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Argent avancé", "Cash advanced")}</p>
                <p className="mt-0.5 text-sm font-bold">1 842 000 F</p>
              </div>
            </div>
          </div>

          {/* Colonne Dropshipping */}
          <div className="rounded-2xl border p-3" style={{ borderColor: `${DROP_COLOR}40`, background: `${DROP_COLOR}0d` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold">{t("Dropshipping", "Dropshipping")}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--dashboard-text)]/45">
                  {t("Le stock du partenaire. Vous n'avancez rien, il retient son prix à chaque vente.", "The partner's stock. You front nothing, they keep their price on every sale.")}
                </p>
              </div>
              <CountBadge count={41} color={DROP_COLOR} label={t("commandes", "orders")} />
            </div>
            <Divider />
            <CompareRow label={t("Panier moyen encaissé", "Average basket collected")} value="17 888 F" pct={100} color={DROP_COLOR} />
            <CompareRow label={t("Prix fixé par le partenaire, retenu à la vente", "Price set by the partner, kept on the sale")} value="− 8 195 F" pct={46} color={DROP_COLOR} />
            <CompareRow label={t("Logistique, transaction, garantie", "Logistics, transaction, warranty")} value="− 1 896 F" pct={11} color={DROP_COLOR} />
            <CompareRow label={t("Acquisition du client", "Client acquisition")} value="− 3 462 F" pct={19} color={DROP_COLOR} />
            <CompareRow label={t("Commission LM", "LM commission")} value="− 447 F" pct={3} color={DROP_COLOR} />
            <CompareRow label={t("Marge de contribution", "Contribution margin")} value="3 888 F" pct={22} color={DROP_COLOR} strong />
            <Divider />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Taux de contribution", "Contribution rate")}</p>
                <p className="mt-0.5 text-sm font-bold" style={{ color: DROP_COLOR }}>21,7 %</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Argent avancé", "Cash advanced")}</p>
                <p className="mt-0.5 text-sm font-bold">0 F</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Ce que dit l'écart", "What the gap says")}</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Le stockage rapporte 1 234 F de plus par commande, mais immobilise 1 842 000 F. Rapporté à l'argent avancé, il rend environ 21 % sur trente jours. Le dropshipping ne rend rien de moins : il rend sans rien avancer. Le bon dosage dépend de votre trésorerie, pas de votre marge : gardez en stock ce qui tourne vite, laissez au partenaire ce qui dort.",
              "Warehousing yields 1 234 F more per order, but ties up 1 842 000 F. Against the cash advanced, that's roughly 21% over thirty days. Dropshipping yields no less — it yields without advancing anything. The right mix depends on your cash flow, not your margin: keep fast movers in stock, leave slow ones to the partner."
            )}
          </p>
        </div>
      </Card>
  );

  // Rangée à deux colonnes du document : acquisition | coût des refus.
  const acquisitionCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("D'où viennent vos commandes", "Where your orders come from")}</h3>
          <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Attribué par les pixels installés sur votre boutique", "Attributed by the pixels installed on your shop")}</p>
        <div className="mt-3 space-y-2">
          <DualBar revenuePct={100} spendPct={20.9} />
          <DualBar revenuePct={83.9} spendPct={15.9} />
          <DualBar revenuePct={32.4} spendPct={7.2} />
          <DualBar revenuePct={8.1} spendPct={2.2} />
          <DualBar revenuePct={0} spendPct={35.4} />
        </div>
        <div className="mt-3 space-y-2.5">
          {[
            { name: t("Publicité Meta", "Meta ads"), roas: "4,8×", detail: t("186 000 F dépensés · 892 000 F", "186 000 F spent · 892 000 F") },
            { name: t("Publicité TikTok", "TikTok ads"), roas: "5,3×", detail: t("142 000 F dépensés · 748 000 F", "142 000 F spent · 748 000 F") },
            { name: t("Publicité Google", "Google ads"), roas: "4,5×", detail: t("64 000 F dépensés · 289 000 F", "64 000 F spent · 289 000 F") },
            { name: t("Publicité YouTube", "YouTube ads"), roas: "3,6×", detail: t("20 000 F dépensés · 72 000 F", "20 000 F spent · 72 000 F") },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--dashboard-text)]/60">{r.name}</span>
              <span className="text-right">
                <span className="font-semibold text-[#0E9F6E]">{r.roas}</span>
                <span className="ml-1.5 text-[10px] text-[var(--dashboard-text)]/40">{r.detail}</span>
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[var(--dashboard-text)]/40">{t("Ventes organiques", "Organic sales")}</span>
            <span className="text-right text-[10px] text-[var(--dashboard-text)]/40">{t("Aucune dépense · 315 400 F", "No spend · 315 400 F")}</span>
          </div>
        </div>
        <div className="mt-3 rounded-2xl p-3" style={{ background: "rgba(56,189,248,.08)" }}>
          <p className="text-[11px] font-semibold">{t("Ce que la plateforme peut mesurer, et ce qu'elle ne peut pas", "What the platform can measure, and what it can't")}</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Seules les quatre régies qui posent un pixel sur votre page de commande sont attribuables : Meta, TikTok, Google, YouTube. Tout le reste — un live, un partage, un client qui revient, une recommandation — arrive sans étiquette et se range en ventes organiques. Aucun chiffre inventé n'est attribué à un live : ce serait faux, et une décision prise sur un chiffre faux coûte plus cher qu'une absence de chiffre.",
              "Only the four ad networks that place a pixel on your checkout page are attributable: Meta, TikTok, Google, YouTube. Everything else — a livestream, a share, a returning client, a referral — arrives with no label and is filed as organic. No invented number is attributed to a livestream: that would be false, and a decision made on a false number costs more than the absence of one."
            )}
          </p>
        </div>
        <Divider />
        <StatRow label={t("Seuil de rentabilité publicitaire", "Ad break-even threshold")} value="2,4×" />
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {t("En dessous de 2,4 fois la dépense, une commande coûte plus qu'elle ne rapporte. Vos quatre régies sont au-dessus.", "Below 2.4 times the spend, an order costs more than it brings in. Your four ad networks are above it.")}
        </p>
      </Card>
  );

  const refusCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Le coût de ce qui n'arrive pas", "The cost of what doesn't arrive")}</h3>
          <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Un refus coûte selon le moment où il tombe", "A refusal costs depending on when it lands")}</p>
        <div className="mt-3 flex items-center gap-4">
          <Ring pct={80.4} color="#4FE0AE">
            <span className="text-sm font-bold">80,4 %</span>
            <span className="text-[8px] text-[var(--dashboard-text)]/40">{t("Livrées", "Delivered")}</span>
          </Ring>
          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4FE0AE" }} />{t("Livrées et payées", "Delivered and paid")}</span><b>119</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FFB84D" }} />{t("Refusées à l'appel", "Refused on the call")}</span><b>14</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FF7A80" }} />{t("Refusées à la porte", "Refused at the door")}</span><b>9</b></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--dashboard-text)]/20" />{t("Encore en route", "Still on the way")}</span><b>6</b></div>
          </div>
        </div>
        <StackedBar segments={[{ pct: 60.9, color: "#FFB84D" }, { pct: 39.1, color: "#FF7A80" }]} />
        <Divider />
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,184,77,.1)" }}>
            <p className="text-[10px] font-semibold">{t("Refusée à l'appel · 14", "Refused on the call · 14")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t("Le centre d'appel annule depuis son interface avant que la course démarre. Aucun frais logistique, aucune marchandise sortie. Seule la publicité est perdue.", "The call center cancels from its interface before the run starts. No logistics fee, no goods out. Only the ad spend is lost.")}
            </p>
            <p className="mt-1.5 text-xs font-bold" style={{ color: "#C07A0C" }}>48 500 F</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: "rgba(255,122,128,.1)" }}>
            <p className="text-[10px] font-semibold">{t("Refusée à la porte · 9", "Refused at the door · 9")}</p>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
              {t("Le livreur a démarré sa course et marque la commande non livrée. La livraison est due, la récupération aussi, et la marchandise repart.", "The rider has started the run and marks the order not delivered. Delivery is due, so is the pickup, and the goods go back.")}
            </p>
            <p className="mt-1.5 text-xs font-bold" style={{ color: "#DC3A45" }}>53 600 F</p>
          </div>
        </div>
        <Divider />
        <StatRow label={t("Marchandise revenue en stock (S)", "Goods back in stock (W)")} value="118 400 F" />
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "En dropshipping, la marchandise refusée retourne chez le partenaire : elle ne pèse pas sur votre stock. En stockage management, elle revient chez lui à votre nom et redevient vendable.",
            "In dropshipping, refused goods go back to the partner: they don't weigh on your stock. In warehousing, they come back to him under your name and become sellable again."
          )}
        </p>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
          {t("Un refus à l'appel coûte trois fois moins qu'un refus à la porte. Faire appeler plus tôt est le levier le moins cher de cet écran.", "A refusal on the call costs three times less than at the door. Calling earlier is the cheapest lever on this screen.")}
        </p>
      </Card>
  );

  // Blocs pleine largeur suivants du document : produits, argent
  // immobilisé, trésorerie attendue.
  const produitsCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Ce que chaque produit laisse vraiment", "What each product really leaves")}</h3>
          <Tag tone="warn">{t("1 en perte", "1 at a loss")}</Tag>
        </div>
        <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">{t("Marge de contribution par commande, publicité comprise", "Contribution margin per order, ads included")}</p>
        <div className="mt-3 space-y-3">
          {[
            { nature: "S", name: t("Sérum éclat 30 ml", "Radiance serum 30 ml"), pct: 82, val: "31,4 %", tot: "+6 112 F", color: "#4FE0AE" },
            { nature: "S", name: t("Beurre de karité 200 g", "Shea butter 200 g"), pct: 68, val: "26,1 %", tot: "+4 908 F", color: "#4FE0AE" },
            { nature: "D", name: t("Sac cabas en raphia", "Raffia tote bag"), pct: 49, val: "18,8 %", tot: "+3 402 F", color: "#EC0C8C" },
            { nature: "D", name: t("Huile de ricin 100 ml", "Castor oil 100 ml"), pct: 22, val: "8,4 %", tot: "+1 214 F", color: "#FFB84D" },
            { nature: "S", name: t("Sandales tressées", "Woven sandals"), pct: 11, val: "− 1,8 %", tot: "− 340 F", color: "#FF7A80" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 text-xs">
              <span className="flex w-40 shrink-0 items-center gap-1.5 truncate">
                <Tag tone={p.nature === "S" ? "blue" : "pink"} className="!px-1.5 !py-0.5">{p.nature}</Tag>
                {p.name}
              </span>
              <div className="flex-1 px-6">
                <Bar pct={p.pct} color="" background={p.color} />
              </div>
              <span className="w-12 shrink-0 text-right font-semibold">{p.val}</span>
              <span className="w-16 shrink-0 text-right text-[10px] text-[var(--dashboard-text)]/40">{p.tot}</span>
            </div>
          ))}
        </div>
        <Divider />
        <p className="text-[10px] text-[var(--dashboard-text)]/50">
          {t("Les sandales tressées coûtent 340 F par commande après publicité : monter le prix, couper la pub dessus, ou les écouler sans les pousser.", "Woven sandals cost 340 F per order after ads: raise the price, cut ads on it, or clear it without pushing.")}
        </p>
        <Divider />
        <StatRow label={t("Part faite par vos 3 premiers produits", "Share made by your top 3 products")} value="61 %" />
      </Card>
  );

  const immobiliseCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("L'argent que vous avez, sans l'avoir", "The money you have, without having it")}</h3>
            <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("Ce qui est immobilisé et ne peut pas servir aujourd'hui", "What's tied up and can't be used today")}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Total immobilisé", "Total tied up")}</p>
            <p className="mt-0.5 text-lg font-bold" style={{ color: "#C07A0C" }}>2 758 700 F</p>
          </div>
        </div>
        <StackedBar segments={[{ pct: 66.8, color: "#8B5CF6" }, { pct: 16.3, color: "#FFB84D" }, { pct: 8.7, color: "#38BDF8" }, { pct: 8.2, color: "#FF7A80" }]} />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <LegendRow color="#8B5CF6" badge={t("S", "W")} label={t("Stock déposé, en valeur d'achat", "Deposited stock, at cost")} value="1 842 000 F" />
          <LegendRow color="#FFB84D" label={t("Suspendu, le temps du délai de litige", "On hold, for the dispute window")} value="459 500 F" />
          <LegendRow color="#38BDF8" label={t("Colis partis, pas encore livrés", "Shipped, not yet delivered")} value="252 000 F" />
          <LegendRow color="#FF7A80" badge={t("S", "W")} label={t("Marchandise des refus, en retour", "Refused goods, coming back")} value="205 200 F" />
        </div>
        <div className="mt-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] p-3">
          <p className="text-xs font-semibold">{t("Seul le stockage management immobilise du stock", "Only warehousing ties up stock")}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--dashboard-text)]/50">
            {t(
              "Les deux lignes marquées S ne concernent que le stockage management : c'est votre marchandise, payée d'avance et gardée chez le partenaire. En dropshipping, aucun stock ne vous appartient et rien n'est immobilisé de ce côté — c'est tout l'intérêt du modèle, et c'est aussi pourquoi sa marge est plus faible.",
              "The two lines marked W only apply to warehousing: it's your goods, paid upfront and held at the partner. In dropshipping, no stock belongs to you and nothing is tied up there — that's the whole point of the model, and also why its margin is lower."
            )}
          </p>
        </div>
        <Divider />
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
          {t("Combien de temps met votre argent à revenir", "How long it takes your money to come back")}
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[var(--dashboard-text)]/30 text-[8px] font-semibold text-[var(--dashboard-text)]/60">{t("S", "W")}</span>
        </p>
        <div className="mt-2 flex items-stretch gap-2.5 text-center text-[9px]">
          {[
            { v: t("4 j", "4 d"), l: t("Achat et dépôt", "Purchase & deposit") },
            { v: t("18 j", "18 d"), l: t("En stock avant vente", "In stock before sale") },
            { v: t("1,1 j", "1.1 d"), l: t("Livraison", "Delivery") },
            { v: t("3 j", "3 d"), l: t("Délai de litige", "Dispute window") },
          ].map((c, i) => (
            <div key={i} className="flex flex-1 items-center gap-2.5">
              <div className="min-w-0 flex-1 rounded-lg bg-[var(--dashboard-surface-2)] px-3 py-2.5">
                <p className="text-xs font-bold">{c.v}</p>
                <p className="mt-0.5 text-[8px] leading-tight text-[var(--dashboard-text)]/40">{c.l}</p>
              </div>
              <span className="shrink-0 text-[var(--dashboard-text)]/25">{i === 3 ? "=" : "→"}</span>
            </div>
          ))}
          <div className="min-w-0 flex-1 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,184,77,.15)" }}>
            <p className="text-xs font-bold" style={{ color: "#C07A0C" }}>26,1 j</p>
            <p className="mt-0.5 text-[8px] leading-tight text-[var(--dashboard-text)]/40">{t("Du franc sorti au franc disponible", "From cash out to cash available")}</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "Ce cycle n'existe qu'en stockage management. En dropshipping il n'y a pas de franc sorti : le délai se réduit aux 4,1 jours entre la vente et la fin de suspension. Chaque jour retiré du stock libère environ 100 000 F.",
            "This cycle only exists in warehousing. In dropshipping there's no cash out: the window shrinks to the 4.1 days between sale and end of hold. Each day taken off stock frees up about 100 000 F."
          )}
        </p>
      </Card>
  );

  const projectionCard = (
      <Card className="!bg-[var(--dashboard-glass)]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight sm:text-base">{t("Trésorerie attendue", "Expected cash")}</h3>
          <div className="flex items-center gap-1.5">
            <Tag tone="blue">{t("Projection", "Forecast")}</Tag>
            <Tag tone="neutral">{t("Les deux", "Both")}</Tag>
          </div>
        </div>
        <div className="mt-3 grid items-start gap-5 sm:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("30 prochains jours, au rythme actuel", "Next 30 days, at the current pace")}</p>
            <AreaChart values={forecastDays} color="#38BDF8" />
            <div className="mt-1 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
              <span>{t("Auj.", "Today")}</span><span>+10 j</span><span>+20 j</span><span>+30 j</span>
            </div>
          </div>
          <div>
            <StatRow label={t("Solde attendu dans 30 jours", "Expected balance in 30 days")} value={<span className="text-[#0E9F6E]">1 495 000 F</span>} />
            <StatRow label={t("Suspensions qui se libèrent", "Holds being released")} value="459 500 F" />
            <StatRow label={t("Réapprovisionnement à prévoir (S)", "Restock to plan (W)")} value={t("Vers le 22 sept.", "Around Sept. 22")} />
            <StatRow label={t("Abonnement", "Subscription")} value={t("Le 14 · 25 000 F", "On the 14th · 25 000 F")} />
            <p className="mt-2 text-[10px] text-[var(--dashboard-text)]/40">
              {t("Aucun creux sous zéro n'est prévu. Un réapprovisionnement avancé au 19 passerait la courbe au rouge 3 jours.", "No dip below zero is expected. Restocking on the 19th would push the curve red for 3 days.")}
            </p>
          </div>
        </div>
      </Card>
  );

  // Ordre et disposition = le document "Accueil · Finance" envoyé :
  // 1) portefeuille + solde côte à côte, 2) trésorerie, 3) compte de
  // résultat, 4) stockage vs drop, 5) acquisition + refus côte à côte,
  // 6) produits, 7) argent immobilisé, 8) projection — tout en pleine
  // largeur sauf les deux rangées à deux colonnes explicitement notées
  // "côte à côte" dans le document.
  return (
    <>
      <SectionHeader
        eyebrow={t("Finances", "Finances")}
        title={t("Où va votre argent", "Where your money goes")}
        subtitle={t("Ce que la période a encaissé, prélevé et laissé.", "What this period collected, deducted and left over.")}
        first={first}
        layout="inline"
        actions={
          <>
            <HeaderActionBtn>{t("Exporter", "Export")}</HeaderActionBtn>
            <HeaderActionBtn>{t("Comparer à la période précédente", "Compare to previous period")}</HeaderActionBtn>
          </>
        }
      />

      <div className="grid gap-3">
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(260px,320px)_1fr]">
          <PaymentMethodCard />
          {soldeCard}
        </div>

        {evolutionCard}
        {compteResultatCard}
        {comparaisonCard}

        <div className="grid items-start gap-3 sm:grid-cols-2">
          {acquisitionCard}
          {refusCard}
        </div>

        {produitsCard}
        {immobiliseCard}
        {projectionCard}
      </div>
    </>
  );
}
