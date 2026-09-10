"use client";

import { Bar, Card, Divider, Nature, SectionHeader, StatRow, Table, Tag } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Section "Commandes" de l'onglet Accueil — refonte complète d'après la
  maquette "LM · Accueil · Commandes" fournie (fichier HTML). Remplace
  l'ancienne version (KPI + parcours + heures/jours) par l'écran complet :
  parcours de la commande, rythme (jour, mois, heure), centre d'appel,
  livraison, panier/risque, temps par étape, motifs de refus, communes,
  clients qui reviennent, comparaison au réseau, litiges, signaux à traiter,
  projection à 7 jours et bloc assistance IA.

  Chiffres statiques en attendant l'API Laravel, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

// --- "Vos commandes, jour par jour" — 10 barres empilées stockage/drop,
// même logique d'échantillon que le graphe de chiffre d'affaires de
// FinancesSection (pas un jour par barre sur toute la période, un aperçu
// de forme).
const DAILY_ORDERS = [4, 5, 7, 6, 8, 10, 6, 9, 11, 7];
const STOCK_SHARE = 0.655; // 65,5 % des commandes en stockage management

// --- "Le cycle du mois" — 10 tranches de ~3 jours sur le mois ; la zone de
// paie (autour du 25 au 5) ressort nettement plus haute.
const MONTH_BUCKETS = [
  { pct: 46, paie: true }, // 1–3
  { pct: 40, paie: false },
  { pct: 34, paie: false },
  { pct: 30, paie: false },
  { pct: 36, paie: false },
  { pct: 32, paie: false },
  { pct: 38, paie: false },
  { pct: 44, paie: false },
  { pct: 78, paie: true }, // 25–27
  { pct: 100, paie: true }, // 28–31
];

// 24 barres pour la bande "heures de commande" — pic 20h-22h.
const HOURLY_ORDERS = [
  0.06, 0.05, 0.05, 0.05, 0.06, 0.09, 0.14, 0.2, 0.26, 0.3, 0.34, 0.4, 0.44, 0.38, 0.34, 0.36, 0.42, 0.5, 0.5, 0.7, 1, 1,
  0.6, 0.2,
];

const WEEKDAYS = [
  { fr: "Lun", en: "Mon", value: 8 },
  { fr: "Mar", en: "Tue", value: 9 },
  { fr: "Mer", en: "Wed", value: 11 },
  { fr: "Jeu", en: "Thu", value: 10 },
  { fr: "Ven", en: "Fri", value: 16 },
  { fr: "Sam", en: "Sat", value: 14 },
  { fr: "Dim", en: "Sun", value: 5 },
] as const;

// --- "7 prochains jours" — projection, aujourd'hui + 6 jours.
const PROJECTION = [
  { fr: "Auj.", en: "Today", pct: 46 },
  { fr: "Mer", en: "Wed", pct: 54 },
  { fr: "Jeu", en: "Thu", pct: 39 },
  { fr: "Ven", en: "Fri", pct: 46 },
  { fr: "Sam", en: "Sat", pct: 70 },
  { fr: "Dim", en: "Sun", pct: 85 },
  { fr: "Lun", en: "Mon", pct: 62 },
] as const;

function SegmentBar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
      {segments.map((s, i) => (
        <span key={i} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${s.pct}%`, background: s.color }} />
      ))}
    </div>
  );
}

function FunnelStep({ value, label, rate, tone }: { value: string; label: string; rate?: string; tone?: "ok" | "mid" | "bad" }) {
  const rateColor = tone === "ok" ? "text-[#178a3f]" : tone === "bad" ? "text-[#c8262d]" : tone === "mid" ? "text-[#a8690a]" : "text-[var(--dashboard-text)]/40";
  return (
    <div className="text-center">
      <p className="text-lg font-bold tracking-tight sm:text-xl">{value}</p>
      <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">{label}</p>
      {rate && <p className={`mt-1 text-[10px] font-semibold ${rateColor}`}>{rate}</p>}
    </div>
  );
}

function StatBar({ value, label, pct, color = "bg-brand-pink" }: { value: string; label: string; pct: number; color?: string }) {
  return (
    <div>
      <p className="text-lg font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{label}</p>
      <Bar pct={pct} color={color} />
    </div>
  );
}

function MotifRow({
  code,
  label,
  value,
  pct,
  last = false,
}: {
  code: "S" | "D" | "B";
  label: string;
  value: number;
  pct: number;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-2.5"}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

function ZoneRow({ commune, pct, volume, delai, bad = false }: { commune: string; pct: number; volume: string; delai: string; bad?: boolean }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={bad ? "text-[#c8262d]" : ""}>{commune}</span>
        <span className="font-semibold">{pct} %</span>
        <span className="w-14 shrink-0 text-right text-[var(--dashboard-text)]/40">{volume}</span>
        <span className="w-14 shrink-0 text-right text-[var(--dashboard-text)]/40">{delai}</span>
      </div>
      <Bar pct={pct} color={bad ? "bg-[#FFB020]" : "bg-brand-pink"} />
    </div>
  );
}

function BenchRow({ label, you, network, delta }: { label: string; you: string; network: string; delta: string }) {
  return (
    <div className="mt-2.5 grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-3 text-xs first:mt-3">
      <span className="text-[var(--dashboard-text)]/50">{label}</span>
      <span className="font-semibold text-[#178a3f]">{you}</span>
      <span className="text-[var(--dashboard-text)]/40">{network}</span>
      <span className="text-[10px] font-semibold text-[#178a3f]">{delta}</span>
    </div>
  );
}

function DisputeReasonRow({ code, label, note, pct }: { code: "S" | "D" | "B"; label: string; note: string; pct: number }) {
  return (
    <div className="mt-2.5 flex items-start gap-3 rounded-xl bg-[var(--dashboard-surface-2)] p-3 first:mt-3">
      <Nature code={code} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">{label}</p>
          <p className="text-xs font-bold">{pct} %</p>
        </div>
        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{note}</p>
      </div>
    </div>
  );
}

function Signal({ tone, title, desc, cta }: { tone: "ko" | "warn" | "info"; title: string; desc: string; cta: string }) {
  const dot = tone === "ko" ? "bg-[#FF5A62] text-white" : tone === "warn" ? "bg-[#FFB020] text-white" : "bg-brand-purple/15 text-brand-purple";
  const border = tone === "ko" ? "border-[#FF5A62]/25" : "border-[var(--dashboard-text)]/10";
  return (
    <div className={`mt-2.5 flex items-center gap-3 rounded-xl border bg-[var(--dashboard-surface-2)] p-3 first:mt-3 ${border}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dot}`}>{tone === "info" ? "i" : "!"}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{title}</p>
        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{desc}</p>
      </div>
      <span className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold">{cta}</span>
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  wait: "bg-[var(--dashboard-text)]/[0.08] text-[var(--dashboard-text)]/60",
  assist: "bg-brand-purple/10 text-brand-purple",
  prep: "bg-[#2563EB1A] text-[#2563EB]",
  liv: "bg-brand-pink/10 text-brand-pink",
  dispute: "bg-[#FFB0201A] text-[#a8690a]",
};

function LiveOrderRow({
  code,
  id,
  label,
  status,
  statusKey,
  since,
  amount,
  dispute = false,
}: {
  code: "S" | "D";
  id: string;
  label: string;
  status: string;
  statusKey: keyof typeof STATUS_TONE;
  since: string;
  amount: string;
  dispute?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${dispute ? "bg-[#FFB0200D]" : ""}`}>
      <Nature code={code} />
      <span className="w-16 shrink-0 text-xs font-semibold">{id}</span>
      <span className="min-w-0 flex-1 truncate text-xs text-[var(--dashboard-text)]/60">{label}</span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${STATUS_TONE[statusKey]}`}>{status}</span>
      <span className="w-16 shrink-0 text-right text-[10px] text-[var(--dashboard-text)]/40">{since}</span>
      <span className="w-20 shrink-0 text-right text-xs font-semibold">{amount}</span>
    </div>
  );
}

const IA_QUESTIONS = [
  { fr: "Pourquoi Abobo refuse plus que Cocody ?", en: "Why does Abobo refuse more than Cocody?" },
  { fr: "Combien me coûtent les clients injoignables ?", en: "How much do unreachable customers cost me?" },
  { fr: "À quelle heure dois-je faire appeler ?", en: "What time should I have calls made?" },
  { fr: "Le dropshipping se refuse-t-il plus que mon stock ?", en: "Does drop-shipping get refused more than my own stock?" },
  { fr: "Quel jour dois-je pousser ma publicité ?", en: "Which day should I push my ads?" },
  { fr: "Combien vaut un client qui revient ?", en: "What's a returning customer worth?" },
  { fr: "Où est-ce que je perds le plus, la transformation ou la livraison ?", en: "Where do I lose the most, conversion or delivery?" },
  { fr: "Dois-je continuer à livrer Bouaké ?", en: "Should I keep delivering to Bouaké?" },
  { fr: "Pourquoi mes gros paniers ne se livrent pas ?", en: "Why don't my large baskets get delivered?" },
  { fr: "Quand dois-je relancer un client qui a acheté une fois ?", en: "When should I follow up with a one-time buyer?" },
  { fr: "Suis-je au-dessus ou en dessous des autres boutiques ?", en: "Am I above or below other shops?" },
  { fr: "Quelle référence va manquer avant samedi ?", en: "Which item will run out before Saturday?" },
  { fr: "Mes litiges viennent-ils du produit ou de l'emballage ?", en: "Do my disputes come from the product or the packaging?" },
  { fr: "Combien vaut dix minutes gagnées sur le délai d'appel ?", en: "What's ten minutes saved on call delay worth?" },
] as const;

export default function CommandesSection({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  return (
    <>
      <SectionHeader
        eyebrow={t("Commandes", "Orders")}
        title={t("Ce que devient chaque commande", "What happens to each order")}
        subtitle={t(
          "De la visite de votre page jusqu'à la fin du délai de litige — et où, méthodiquement, elle se perd.",
          "From the visit to your page through to the end of the dispute window — and where, methodically, it gets lost."
        )}
        count={t("38 indicateurs", "38 metrics")}
        first={first}
        layout="inline"
      />

      {/* Légende : quelle couleur renvoie à quelle façon de vendre */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--dashboard-glass)] px-4 py-3 text-[10px] text-[var(--dashboard-text)]/50">
        <span className="flex items-center gap-1.5"><Nature code="S" /> {t("Stockage management", "Warehousing")}</span>
        <span className="flex items-center gap-1.5"><Nature code="D" /> {t("Dropshipping", "Drop-shipping")}</span>
        <span className="flex items-center gap-1.5"><Nature code="B" /> {t("Les deux", "Both")}</span>
        <span className="ml-auto">{t("La couleur dit à quelle façon de vendre la commande se rapporte.", "The color shows which way of selling the order relates to.")}</span>
      </div>

      {/* KPI de la période */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Commandes reçues", "Orders received")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">148</p>
          <p className="mt-1 text-[10px] font-semibold text-[#178a3f]">{t("+22 % vs période précédente", "+22% vs previous period")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Confirmées à l'appel", "Confirmed by phone")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">134</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("90,5 % des reçues", "90.5% of orders received")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Livrées et payées", "Delivered and paid")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#178a3f]">119</p>
          <p className="mt-1 text-[10px] font-semibold text-[#178a3f]">{t("80,4 % des reçues", "80.4% of orders received")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Refusées", "Refused")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#c8262d]">23</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("14 à l'appel · 9 à la porte", "14 by phone · 9 at the door")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("En cours", "In progress")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">6</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("dont 2 en litige", "incl. 2 in dispute")}</p>
        </Card>
      </div>

      {/* Le parcours d'une commande */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Le parcours d'une commande, étape par étape", "The order journey, step by step")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("De la visite de votre page jusqu'à la fin du délai de litige", "From your page visit to the end of the dispute window")}</p>
          </div>
          <Nature code="B" />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          <FunnelStep value="8 420" label={t("Visites de la page", "Page visits")} />
          <FunnelStep value="148" label={t("Commandes passées", "Orders placed")} rate={t("1,76 % de transformation", "1.76% conversion")} tone="bad" />
          <FunnelStep value="134" label={t("Confirmées à l'appel", "Confirmed by phone")} rate="90,5 %" tone="ok" />
          <FunnelStep value="119" label={t("Livrées et payées", "Delivered and paid")} rate="88,8 %" tone="mid" />
          <FunnelStep value="117" label={t("Sans litige", "Without dispute")} rate="98,3 %" tone="ok" />
        </div>
        <SegmentBar
          segments={[
            { pct: 40, color: "rgba(255,255,255,0.12)" },
            { pct: 15, color: "#8B5CF6" },
            { pct: 15, color: "#5AA9FF" },
            { pct: 15, color: "#4FE0AE" },
            { pct: 15, color: "#EC0C8C" },
          ]}
        />
        <Divider />
        <p className="text-xs font-semibold">{t("Où vous perdez le plus", "Where you lose the most")}</p>
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
          {t(
            "Entre la visite et la commande. Sur mille personnes qui ouvrent votre page, dix-huit commandent. Gagner un dixième de point de transformation vaut plus que gagner cinq points de livraison : la première marche coûte de la publicité déjà payée, la seconde coûte des courses déjà faites.",
            "Between the visit and the order. Out of a thousand people who open your page, eighteen order. Gaining a tenth of a point of conversion is worth more than five points of delivery: the first step costs advertising already paid for, the second costs courier runs already made."
          )}
        </p>
      </Card>

      {/* Jour par jour + cycle du mois */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card title={t("Vos commandes, jour par jour", "Your orders, day by day")} titleTab titleAlign="left" className="!bg-[var(--dashboard-surface-2)]">
          <div className="mt-2 flex h-28 items-end gap-1.5">
            {DAILY_ORDERS.map((v, i) => {
              const s = Math.round(v * STOCK_SHARE);
              const d = v - s;
              const max = Math.max(...DAILY_ORDERS);
              return (
                <div key={i} className="flex flex-1 flex-col justify-end" style={{ height: "100%" }}>
                  <div className="flex flex-1 flex-col justify-end" style={{ height: `${(v / max) * 100}%` }}>
                    <span className="rounded-t bg-brand-pink" style={{ height: `${(d / v) * 100}%` }} />
                    <span className="bg-[var(--dashboard-text)]/25" style={{ height: `${(s / v) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Divider />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBar value="97" label={t("Stockage · 65,5 %", "Warehousing · 65.5%")} pct={65.5} color="bg-[var(--dashboard-text)]/40" />
            <StatBar value="51" label={t("Dropshipping · 34,5 %", "Drop-shipping · 34.5%")} pct={34.5} />
            <div>
              <p className="text-lg font-bold tracking-tight">8</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Meilleur jour · samedi 23 août", "Best day · Sat Aug 23")}</p>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">4,9</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Moyenne par jour · 30 jours", "Average per day · 30 days")}</p>
            </div>
          </div>
        </Card>

        <Card title={t("Le cycle du mois", "The monthly cycle")} titleTab titleAlign="left" className="!bg-[var(--dashboard-surface-2)]" badge={<Tag tone="warn">{t("Zone de paie", "Payday window")}</Tag>}>
          <div className="mt-2 flex h-28 items-end gap-1.5">
            {MONTH_BUCKETS.map((b, i) => (
              <span
                key={i}
                className="flex-1 rounded-t"
                style={{ height: `${b.pct}%`, background: b.paie ? "linear-gradient(180deg,#FF8BC4,#EC0C8C)" : "rgba(255,255,255,0.16)" }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            <span>1</span>
            <span>10</span>
            <span>20</span>
            <span>31</span>
          </div>
          <Divider />
          <p className="text-xs font-semibold">{t("41 % de vos commandes tombent entre le 25 et le 5", "41% of your orders fall between the 25th and the 5th")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "C'est la fenêtre des salaires. Concentrer la publicité sur cette fenêtre, et garder du stock pour elle, vaut mieux que lisser la dépense sur trente jours. Un réapprovisionnement livré le 26 arrive trop tard pour la vague.",
              "That's the payday window. Concentrating advertising there, and keeping stock for it, beats spreading spend evenly over thirty days. Restock delivered on the 26th arrives too late for the wave."
            )}
          </p>
        </Card>
      </div>

      {/* Centre d'appel + performance de livraison */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Le travail du centre d'appel", "The call center's work")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("143 commandes appelées, 1,9 tentative en moyenne", "143 orders called, 1.9 attempts on average")}</p>
            </div>
            <Nature code="B" />
          </div>
          <SegmentBar
            segments={[
              { pct: 55, color: "#4FE0AE" },
              { pct: 24, color: "#38BDF8" },
              { pct: 15, color: "#FFB020" },
              { pct: 6, color: "#FF5A62" },
            ]}
          />
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4FE0AE]" />{t("Joint au premier appel", "Reached on the first call")}</span><span className="font-semibold">78 · 55 %</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#38BDF8]" />{t("Joint au deuxième", "Reached on the second")}</span><span className="font-semibold">34 · 24 %</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FFB020]" />{t("Joint au troisième", "Reached on the third")}</span><span className="font-semibold">22 · 15 %</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF5A62]" />{t("Jamais joint", "Never reached")}</span><span className="font-semibold">9 · 6 %</span></div>
          </div>
          <Divider />
          <StatRow label={t("Délai avant le premier appel", "Time to first call")} value="42 min" bold={false} />
          <StatRow label={t("Durée moyenne d'un appel", "Average call length")} value="2 min 40" bold={false} />
          <StatRow label={t("Confirmation au 1er appel", "Confirmation on 1st call")} value={<span className="text-[#178a3f]">94 %</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Un client joint au premier appel confirme à 94 %. Au troisième, il ne confirme plus qu'à 68 % : le temps qui passe abîme l'envie autant que le doute. Chaque tranche de dix minutes gagnée sur le délai d'appel vaut environ un point de confirmation.",
              "A customer reached on the first call confirms at 94%. By the third, only 68%: time erodes desire as much as doubt. Every ten minutes saved on call delay is worth about a point of confirmation."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("La performance de livraison", "Delivery performance")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce qui se passe une fois le colis parti", "What happens once the parcel is out")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <StatBar value="86 %" label={t("Livrées au premier passage", "Delivered on first attempt")} pct={86} color="bg-[#4FE0AE]" />
            <StatBar value="11 %" label={t("Livrées après reprogrammation", "Delivered after rescheduling")} pct={11} color="bg-[#FFB020]" />
            <StatBar value="1,3" label={t("Passages par commande livrée", "Attempts per delivered order")} pct={43} />
            <StatBar value="7 %" label={t("Commandes en express", "Express orders")} pct={7} color="bg-brand-purple" />
          </div>
          <Divider />
          <StatRow label={t("Délai de course, standard", "Delivery time, standard")} value="4 h 12" bold={false} />
          <StatRow label={t("Délai de course, express", "Delivery time, express")} value={<span className="text-[#178a3f]">1 h 48</span>} />
          <StatRow label={t("Taux de livraison en express", "Delivery rate, express")} value={<span className="text-[#178a3f]">93 %</span>} />
          <StatRow label={t("Reprogrammations qui n'aboutissent pas", "Reschedules that don't go through")} value={<span className="text-[#c8262d]">3 sur 16</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "L'express se livre treize points au-dessus du standard. Sur les paniers de plus de 50 000 F, où le refus atteint 42 %, le proposer d'office coûterait 2 000 F et sauverait bien plus.",
              "Express delivers thirteen points above standard. On baskets over 50 000 F, where refusal reaches 42%, offering it by default would cost 2 000 F and save far more."
            )}
          </p>
        </Card>
      </div>

      {/* Le panier et son risque */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Le panier et son risque", "The basket and its risk")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Plus le panier monte, moins il se livre", "The bigger the basket, the less it delivers")}</p>
          </div>
          <Nature code="B" />
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex h-32 items-end gap-2">
            {[91, 86, 74, 58].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] font-semibold">{v} %</span>
                <span className="w-full rounded-t bg-brand-purple/70" style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <Table
            head={[t("Tranche", "Bracket"), t("Cmd", "Orders"), t("Livrées", "Delivered"), t("Marge moyenne", "Average margin")]}
            rows={[
              [t("Moins de 10 000 F", "Under 10 000 F"), "21", "91 %", "2 180 F"],
              [t("10 000 à 20 000 F", "10 000 to 20 000 F"), "67", "86 %", "4 420 F"],
              [t("20 000 à 50 000 F", "20 000 to 50 000 F"), "48", "74 %", "7 890 F"],
              [t("Plus de 50 000 F", "Over 50 000 F"), "12", "58 %", "13 200 F"],
            ]}
          />
        </div>
        <Divider />
        <div className="grid gap-2 sm:grid-cols-3">
          <StatRow label={t("Articles par commande", "Items per order")} value="1,4" bold={false} />
          <StatRow label={t("Commandes à plusieurs articles", "Multi-item orders")} value="27 %" bold={false} />
          <StatRow label={t("Panier moyen d'une commande multiple", "Average basket, multi-item order")} value={<span className="text-[#178a3f]">31 700 F</span>} />
        </div>
        <Divider />
        <p className="text-xs font-semibold">{t("Le gros panier rapporte plus et arrive moins", "The big basket pays more and arrives less")}</p>
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
          {t(
            "Au-dessus de 50 000 F, une commande sur deux seulement se livre, alors qu'elle porte six fois la marge d'un petit panier. Trois leviers connus : appeler ces commandes en premier, proposer l'express d'office, ou demander un acompte au-delà d'un seuil.",
            "Above 50 000 F, only one order in two gets delivered, yet it carries six times the margin of a small basket. Three known levers: call these orders first, offer express by default, or ask for a deposit past a threshold."
          )}
        </p>
      </Card>

      {/* Où passe le temps + pourquoi les commandes n'aboutissent pas */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Où passe le temps", "Where the time goes")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Durée moyenne de chaque étape, en heures ouvrées", "Average time per step, business hours")}</p>
            </div>
            <Nature code="B" />
          </div>
          <SegmentBar
            segments={[
              { pct: 8, color: "#8A90A6" },
              { pct: 15, color: "#B79BFF" },
              { pct: 25, color: "#5AA9FF" },
              { pct: 52, color: "#FF7CB8" },
            ]}
          />
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#8A90A6]" />{t("Reçue, en attente d'appel", "Received, awaiting call")}</span><span className="font-semibold">42 min</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#B79BFF]" />{t("Appel du centre, jusqu'à confirmation", "Call center, to confirmation")}</span><span className="font-semibold">1 h 12</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#5AA9FF]" />{t("Confirmée, jusqu'au colis prêt", "Confirmed, to parcel ready")}</span><span className="font-semibold">2 h 05</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF7CB8]" />{t("Colis prêt, jusqu'à la livraison", "Parcel ready, to delivery")}</span><span className="font-semibold">4 h 12</span></div>
          </div>
          <Divider />
          <StatRow label={t("Total en heures ouvrées", "Total in business hours")} value="8 h 11" bold={false} />
          <StatRow label={t("Total réel, nuits comprises", "Real total, nights included")} value="26 h" bold={false} />
          <StatRow label={t("Moyenne du réseau", "Network average")} value={<span className="text-[#178a3f]">{t("31 h · vous êtes devant", "31 h · you're ahead")}</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Une commande passée à vingt-deux heures attend le matin : c'est ce décalage qui creuse l'écart entre huit heures de travail et vingt-six heures d'attente pour le client.",
              "An order placed at ten pm waits until morning: that gap is what stretches eight working hours into twenty-six hours of waiting for the customer."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Pourquoi les commandes n'aboutissent pas", "Why orders don't go through")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Motif enregistré par le centre d'appel ou par le livreur", "Reason logged by the call center or the courier")}</p>
            </div>
            <Tag tone="warn">{t("23 refus", "23 refusals")}</Tag>
          </div>
          <div className="mt-3">
            <MotifRow code="B" label={t("Injoignable après trois appels", "Unreachable after three calls")} value={9} pct={100} />
            <MotifRow code="B" label={t("A changé d'avis", "Changed their mind")} value={7} pct={78} />
            <MotifRow code="B" label={t("Frais de livraison jugés élevés", "Delivery fees seen as too high")} value={2} pct={22} />
            <MotifRow code="D" label={t("Produit non conforme à l'attente", "Product not as expected")} value={2} pct={22} />
            <MotifRow code="B" label={t("Adresse introuvable", "Address not found")} value={1} pct={11} />
            <MotifRow code="B" label={t("Doublon ou hors zone", "Duplicate or out of zone")} value={2} pct={22} last />
          </div>
          <Divider />
          <p className="text-xs font-semibold">{t("Le premier motif n'est pas un refus, c'est un silence", "The top reason isn't a refusal, it's silence")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Neuf commandes sur vingt-trois tombent parce que personne ne décroche. Un message avant l'appel, ou un appel à une autre heure, les récupère en partie. Les deux refus pour produit non conforme sont tous en dropshipping : la fiche du partenaire promet autre chose que ce qui arrive.",
              "Nine orders out of twenty-three fall through because no one picks up. A message before the call, or a call at another time, recovers some of them. Both refusals for non-conforming products are drop-shipped: the partner's listing promises something else than what arrives."
            )}
          </p>
        </Card>
      </div>

      {/* Communes + heures de commande */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Où vous livrez, et où ça résiste", "Where you deliver, and where it resists")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Taux de livraison et délai moyen par commune", "Delivery rate and average time by district")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
            <span>{t("Commune", "District")}</span>
            <span>{t("Livraison · volume · délai", "Delivery · volume · time")}</span>
          </div>
          <ZoneRow commune="Cocody" pct={89} volume={t("38 cmd", "38 ord.")} delai="3 h 40" />
          <ZoneRow commune="Marcory" pct={86} volume={t("22 cmd", "22 ord.")} delai="3 h 55" />
          <ZoneRow commune="Treichville" pct={83} volume={t("15 cmd", "15 ord.")} delai="4 h 10" />
          <ZoneRow commune="Yopougon" pct={74} volume={t("31 cmd", "31 ord.")} delai="4 h 45" bad />
          <ZoneRow commune="Abobo" pct={68} volume={t("24 cmd", "24 ord.")} delai="5 h 20" bad />
          <ZoneRow commune="Bouaké" pct={61} volume={t("18 cmd", "18 ord.")} delai="11 h 30" bad />
          <Divider />
          <p className="text-xs font-semibold">{t("28 points d'écart entre Cocody et Bouaké", "28 points between Cocody and Bouaké")}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Bouaké représente 12 % de vos commandes et 26 % de vos refus. À 61 % de livraison et 11 h 30 de délai, chaque commande y rapporte moins qu'ailleurs une fois les refus payés. Deux réponses possibles : demander un acompte sur cette zone, ou ne plus y pousser de publicité.",
              "Bouaké makes up 12% of your orders and 26% of your refusals. At 61% delivery and an 11h30 lead time, each order there earns less once refusals are paid for. Two options: ask for a deposit in that zone, or stop advertising there."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Quand vos clients commandent", "When your customers order")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Densité des commandes par heure de la journée", "Order density by hour of day")}</p>
            </div>
            <Nature code="B" />
          </div>
          <div className="mt-3 grid gap-[3px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
            {HOURLY_ORDERS.map((v, i) => {
              const isPeak = i >= 19;
              const background = isPeak
                ? v > 0.75
                  ? "#EC0C8C"
                  : `rgba(236,12,140,${Math.max(0.25, v * 0.9)})`
                : `color-mix(in srgb, var(--dashboard-text) ${Math.round(Math.max(0.08, v * 0.6) * 100)}%, transparent)`;
              return <span key={i} className="h-4 rounded-sm" style={{ background }} />;
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            <span>{t("00 h", "12am")}</span>
            <span>{t("06 h", "6am")}</span>
            <span>{t("12 h", "12pm")}</span>
            <span>{t("18 h", "6pm")}</span>
            <span>{t("23 h", "11pm")}</span>
          </div>
          <Divider />
          <div className="grid grid-cols-4 gap-2 text-center sm:grid-cols-7">
            {WEEKDAYS.map(({ fr, en, value }) => (
              <div key={fr}>
                <p className="text-[9px] text-[var(--dashboard-text)]/40">{t(fr, en)}</p>
                <p className={`text-xs font-semibold ${value >= 14 ? "text-brand-pink" : ""}`}>{value}</p>
              </div>
            ))}
          </div>
          <Divider />
          <StatRow label={t("Heure de pointe", "Peak hour")} value={t("20 h – 22 h · 31 % des commandes", "8pm – 10pm · 31% of orders")} bold={false} />
          <StatRow label={t("Taux de confirmation le soir", "Confirmation rate in the evening")} value={<span className="text-[#a8690a]">{t("82 % contre 94 % le matin", "82% vs 94% in the morning")}</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Trente et un pour cent des commandes tombent entre vingt et vingt-deux heures, et ce sont celles qui se confirment le moins bien : douze points de moins que les commandes du matin. Douze heures séparent la commande de l'appel, et l'envie retombe.",
              "Thirty-one percent of orders land between 8 and 10pm, and those confirm worst: twelve points below morning orders. Twelve hours separate the order from the call, and desire fades."
            )}
          </p>
        </Card>
      </div>

      {/* Clients qui reviennent + comparaison au réseau */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Vos clients reviennent-ils ?", "Do your customers come back?")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Part de chaque semaine d'acquisition qui a recommandé", "Share of each acquisition week that reordered")}</p>
            </div>
            <Nature code="B" />
          </div>
          <Table
            className="mt-3"
            head={[t("Semaine", "Week"), t("À 30 jours", "At 30 days"), t("À 60 jours", "At 60 days"), t("À 90 jours", "At 90 days")]}
            rows={[
              [t("Semaine 1", "Week 1"), "14 %", "21 %", "26 %"],
              [t("Semaine 2", "Week 2"), "12 %", "19 %", "24 %"],
              [t("Semaine 3", "Week 3"), "16 %", "23 %", "—"],
              [t("Semaine 4", "Week 4"), "11 %", "17 %", "—"],
              [t("Semaine 5", "Week 5"), "13 %", "—", "—"],
              [t("Semaine 6", "Week 6"), "9 %", "—", "—"],
            ]}
          />
          <Divider />
          <StatRow label={t("Délai moyen entre la 1re et la 2e commande", "Average time between order 1 and 2")} value={t("34 jours", "34 days")} bold={false} />
          <StatRow label={t("Commandes par client sur 12 mois", "Orders per customer over 12 months")} value="1,4" bold={false} />
          <StatRow label={t("Valeur d'un client sur sa vie", "Customer lifetime value")} value={<span className="text-[#178a3f]">27 100 F</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Un client sur quatre revient dans les trois mois, et le second achat arrive vers le trente-quatrième jour. Une relance au vingt-huitième jour tomberait juste avant cette fenêtre.",
              "One customer in four returns within three months, and the second purchase lands around day thirty-four. A follow-up on day twenty-eight would land just before that window."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Vous, comparée aux autres", "You, compared to others")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Moyenne des boutiques du réseau, même catégorie et même taille", "Average of network shops in your category and size")}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_auto_auto] gap-3 text-[9px] uppercase tracking-[0.12em] text-[var(--dashboard-text)]/35">
            <span />
            <span>{t("Vous", "You")}</span>
            <span>{t("Réseau", "Network")}</span>
            <span />
          </div>
          <BenchRow label={t("Transformation", "Conversion")} you="1,76 %" network="1,42 %" delta="+24 %" />
          <BenchRow label={t("Confirmation à l'appel", "Phone confirmation")} you="90,5 %" network="84,0 %" delta="+8 %" />
          <BenchRow label={t("Livraison", "Delivery")} you="80,4 %" network="72,5 %" delta="+11 %" />
          <BenchRow label={t("Taux de litige", "Dispute rate")} you="1,7 %" network="3,1 %" delta={t("2× moins", "2× less")} />
          <BenchRow label={t("Délai de bout en bout", "End-to-end time")} you="26 h" network="31 h" delta="−16 %" />
          <Divider />
          <p className="text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Ces moyennes sont calculées sur les boutiques de votre catégorie et de votre volume, jamais sur une boutique identifiable. Vous êtes devant sur les cinq indicateurs : votre marge de progression est ailleurs, dans la transformation de vos visites.",
              "These averages are computed across shops in your category and volume, never a single identifiable shop. You're ahead on all five metrics: your room for improvement lies elsewhere, in converting your visits."
            )}
          </p>
        </Card>
      </div>

      {/* Litiges */}
      <Card className="mt-3 !bg-[var(--dashboard-glass)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{t("Les litiges, et ce qu'ils coûtent", "Disputes, and what they cost")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ouverts pendant le délai de suspension que vous avez fixé", "Opened during the hold period you've set")}</p>
          </div>
          <Tag tone="warn" className="shrink-0">{t("2 en cours · 47 480 F bloqués", "2 in progress · 47 480 F on hold")}</Tag>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><p className="text-lg font-bold tracking-tight">1,7 %</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Taux de litige · 2 sur 119 livrées", "Dispute rate · 2 of 119 delivered")}</p></div>
          <div><p className="text-lg font-bold tracking-tight">14 h</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Délai moyen de résolution", "Average resolution time")}</p></div>
          <div><p className="text-lg font-bold tracking-tight">{t("Remplacement", "Replacement")}</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Issue la plus fréquente · 83 %", "Most common outcome · 83%")}</p></div>
          <div><p className="text-lg font-bold tracking-tight text-[#c8262d]">3 400 F</p><p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Coût moyen d'un litige", "Average cost of a dispute")}</p></div>
        </div>
        <Divider />
        <DisputeReasonRow code="S" label={t("Produit abîmé à l'arrivée", "Product damaged on arrival")} note={t("14 cas sur 26 depuis le début · emballage ou manutention", "14 of 26 cases so far · packaging or handling")} pct={54} />
        <DisputeReasonRow code="D" label={t("Produit différent de l'annonce", "Product different from the listing")} note={t("7 cas · uniquement sur le catalogue du partenaire", "7 cases · partner catalog only")} pct={27} />
        <DisputeReasonRow code="B" label={t("Article manquant dans le colis", "Missing item in the parcel")} note={t("5 cas · commandes à plusieurs articles", "5 cases · multi-item orders")} pct={19} />
        <Divider />
        <p className="text-xs font-semibold">{t("Deux litiges sur trois viennent du colis, pas du produit", "Two disputes in three come from the parcel, not the product")}</p>
        <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/50">
          {t(
            "Abîmé à l'arrivée et article manquant représentent soixante-treize pour cent des cas : des questions d'emballage et de préparation, à porter au partenaire agréé. Le tiers restant, produit différent de l'annonce, ne concerne que le dropshipping et se règle en corrigeant les fiches du catalogue.",
            "Damaged on arrival and missing items make up seventy-three percent of cases: packaging and prep issues, on the partner. The remaining third, product different from the listing, only concerns drop-shipping and is fixed by correcting the catalog listings."
          )}
        </p>
      </Card>

      {/* À regarder aujourd'hui + projection 7 jours */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("À regarder aujourd'hui", "To look at today")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Ce que la plateforme a repéré et que personne n'a encore traité", "What the platform has flagged that no one has handled yet")}</p>
            </div>
            <Tag tone="warn" className="shrink-0">{t("5 signaux", "5 signals")}</Tag>
          </div>
          <div className="mt-3">
            <Signal
              tone="ko"
              title={t("2 commandes bloquées depuis plus de 6 heures", "2 orders stuck for over 6 hours")}
              desc={t("C-4828 et C-4829 attendent une confirmation. Au-delà de six heures, elles ne se confirment plus qu'à 61 %.", "C-4828 and C-4829 are awaiting confirmation. Past six hours, confirmation drops to 61%.")}
              cta={t("Voir", "View")}
            />
            <Signal
              tone="warn"
              title={t("Un même numéro, 4 commandes refusées", "Same number, 4 refused orders")}
              desc={t("Toutes annulées à l'appel en douze jours. À mettre en liste d'attente avant de relancer une course.", "All cancelled by phone within twelve days. Hold before sending another courier.")}
              cta={t("Voir", "View")}
            />
            <Signal
              tone="warn"
              title={t("3 adresses identiques, clients différents", "3 identical addresses, different customers")}
              desc={t("Même repère, trois noms. Souvent un point de retrait informel, parfois autre chose.", "Same landmark, three names. Often an informal pickup point, sometimes something else.")}
              cta={t("Voir", "View")}
            />
            <Signal
              tone="info"
              title={t("Sérum éclat : 8 commandes, 4 jours de stock", "Radiance serum: 8 orders, 4 days of stock")}
              desc={t("Au rythme actuel, rupture le 12 septembre. Le réapprovisionnement met 4 jours.", "At the current pace, stockout on Sept. 12. Restocking takes 4 days.")}
              cta={t("Voir", "View")}
            />
            <Signal
              tone="info"
              title={t("Bouaké : 61 % de livraison sur 18 commandes", "Bouaké: 61% delivery on 18 orders")}
              desc={t("Vingt points sous votre moyenne. Le volume commence à peser sur le résultat.", "Twenty points below your average. Volume is starting to weigh on results.")}
              cta={t("Voir", "View")}
            />
          </div>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Les sept prochains jours", "The next seven days")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Estimation à partir de votre saisonnalité", "Estimate based on your seasonality")}</p>
            </div>
            <Tag tone="blue" className="shrink-0">{t("Projection", "Projection")}</Tag>
          </div>
          <div className="mt-3 flex h-20 items-end gap-1.5">
            {PROJECTION.map(({ fr, pct }, i) => (
              <span key={fr} className="flex-1 rounded-t" style={{ height: `${pct}%`, background: i >= 4 ? "#EC0C8C" : "rgba(236,12,140,0.35)" }} />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
            {PROJECTION.map(({ fr, en }) => (
              <span key={fr}>{t(fr, en)}</span>
            ))}
          </div>
          <Divider />
          <StatRow label={t("Commandes attendues", "Expected orders")} value="52" bold={false} />
          <StatRow label={t("Dont livrées, au taux actuel", "Of which delivered, at current rate")} value="42" bold={false} />
          <StatRow label={t("Chiffre d'affaires attendu", "Expected revenue")} value={<span className="text-[#178a3f]">817 500 F</span>} />
          <StatRow label={t("Références en rupture avant dimanche", "References out of stock before Sunday")} value={<span className="text-[#a8690a]">2</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Le pic de samedi tombe pendant la fenêtre des salaires. Deux références manqueront avant : les commander aujourd'hui les fait arriver à temps.",
              "Saturday's peak falls during the payday window. Two references will run out before then: ordering them today gets them there in time."
            )}
          </p>
        </Card>
      </div>

      {/* Clients + commandes en cours */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div>
            <p className="text-sm font-semibold">{t("Vos clients", "Your customers")}</p>
            <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Nouveaux, revenants, et ce qu'ils valent", "New, returning, and what they're worth")}</p>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
              style={{ background: "conic-gradient(#4FE0AE 0% 18.2%, var(--dashboard-surface-2) 18.2% 100%)" }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dashboard-card-bg)] text-center">
                <div>
                  <p className="text-sm font-bold leading-none">18,2 %</p>
                  <p className="mt-0.5 text-[8px] text-[var(--dashboard-text)]/40">{t("reviennent", "return")}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <StatRow label={t("Clients servis", "Customers served")} value="121" bold={false} />
              <StatRow label={t("Dont déjà venus", "Of which returning")} value={<span className="text-[#178a3f]">22</span>} />
            </div>
          </div>
          <Divider />
          <StatRow label={t("Panier d'un nouveau client", "New customer basket")} value="18 400 F" bold={false} />
          <StatRow label={t("Panier d'un client qui revient", "Returning customer basket")} value={<span className="text-[#178a3f]">24 300 F</span>} />
          <StatRow label={t("Taux de livraison d'un revenant", "Returning customer delivery rate")} value={<span className="text-[#178a3f]">96 %</span>} />
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/50">
            {t(
              "Il commande un tiers plus cher, se livre à quatre-vingt-seize pour cent au lieu de quatre-vingts, et ne coûte aucune publicité. Chaque point gagné sur ce taux rapporte davantage qu'un point de transformation.",
              "They order a third more, deliver at ninety-six percent instead of eighty, and cost no advertising. Every point gained on this rate is worth more than a point of conversion."
            )}
          </p>
        </Card>

        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t("Ce qui bouge en ce moment", "What's moving right now")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Les six commandes encore en route", "The six orders still on their way")}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3.5 py-2 text-[10px] font-semibold">{t("Ouvrir les commandes", "Open orders")}</span>
          </div>
          <div className="mt-3 divide-y divide-[var(--dashboard-text)]/[0.05]">
            <LiveOrderRow code="S" id="C-4831" label={t("Sérum éclat 30 ml", "Radiance serum 30 ml")} status={t("Livraison", "Delivery")} statusKey="liv" since={t("2 h 10", "2h10")} amount="21 500 F" />
            <LiveOrderRow code="S" id="C-4830" label={t("Beurre de karité 200 g ×2", "Shea butter 200 g ×2")} status={t("Préparation", "Prep")} statusKey="prep" since={t("48 min", "48 min")} amount="17 800 F" />
            <LiveOrderRow code="D" id="C-4829" label={t("Sac cabas en raphia", "Raffia tote bag")} status={t("Assistance", "Support")} statusKey="assist" since="1 h 05" amount="19 900 F" />
            <LiveOrderRow code="D" id="C-4828" label={t("Huile de ricin 100 ml", "Castor oil 100 ml")} status={t("En attente d'appel", "Awaiting call")} statusKey="wait" since={t("22 min", "22 min")} amount="12 400 F" />
            <LiveOrderRow code="S" id="C-4819" label={t("Sac cabas en raphia", "Raffia tote bag")} status={t("Litige ouvert", "Dispute open")} statusKey="dispute" since="12 h" amount="19 140 F" dispute />
            <LiveOrderRow code="D" id="C-4816" label={t("Sandales tressées ×2", "Braided sandals ×2")} status={t("Litige ouvert", "Dispute open")} statusKey="dispute" since={t("1 j", "1 day")} amount="28 340 F" dispute />
          </div>
        </Card>
      </div>

      {/* Bloc assistance IA */}
      <Card className="mt-3 border border-brand-purple/25 !bg-[var(--dashboard-glass)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 3.2l2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold">{t("Ce que l'assistance peut répondre depuis cet écran", "What support can answer from this screen")}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/50">{t("Toutes ces questions se répondent avec les seules données affichées ci-dessus", "All of these can be answered using only the data shown above")}</p>
            </div>
          </div>
          <Tag tone="blue" className="shrink-0">{t("38 variables croisables", "38 cross-referenceable metrics")}</Tag>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {IA_QUESTIONS.map(({ fr, en }) => (
            <p key={fr} className="rounded-xl bg-[var(--dashboard-surface-2)] px-3 py-2.5 text-[11px] text-[var(--dashboard-text)]/70">
              « {t(fr, en)} »
            </p>
          ))}
        </div>
      </Card>

      <p className="mt-3 max-w-3xl border-l-2 border-brand-pink/40 pl-3 text-[11px] text-[var(--dashboard-text)]/50">
        {t(
          "Un taux de refus ne veut rien dire sans sa nature de vente. En stockage management, une commande refusée renvoie votre marchandise, déjà payée, dans un entrepôt. En dropshipping elle ne vous coûte que la course et la publicité. Le même pourcentage cache deux réalités financières opposées.",
          "A refusal rate means nothing without its way of selling. In warehousing, a refused order sends your merchandise, already paid for, back into storage. In drop-shipping it only costs you the courier run and the ad spend. The same percentage hides two opposite financial realities."
        )}
      </p>
    </>
  );
}
