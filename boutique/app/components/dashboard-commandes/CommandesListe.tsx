"use client";

import { useId, useMemo, useState } from "react";
import { Card, periodSeed, scaleForPeriod, SectionHeader, Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import {
  AnneauCompteARebours,
  Commande,
  ETAPES,
  ISSUES,
  JOURS,
  LITIGE_OUVERT,
  Statut,
  TriangleIcon,
  estSuspendue,
  formatCfa,
  libellesJour,
  netDe,
} from "./shared";

/*
  Écran 11 "Les commandes" : liste des commandes groupées par jour, avec
  pour chaque ligne le montant payé, les deux retenues (logistique et
  opération), le net qui vous revient, et où en est la commande — piste
  d'étapes puis anneau de compte à rebours de 72 h une fois livrée
  (disponibilité des fonds). Le détail de lecture d'une ligne — icônes,
  couleurs, litiges, devises — est sa propre fiche : voir LireUneLigne
  (Écran 12), atteinte depuis CommandesNav.

  Chaque commande est une ligne de tableau (pas une carte) — une bordure de
  couleur à gauche rappelle en un coup d'œil où elle en est, même repère que
  la piste d'étapes / l'anneau qu'elle contient. Colonnes : commande, payé,
  retenues, net, statut.

  `recherche` vient de DashboardSearchBar, posée au-dessus de CommandesNav
  dans dashboard/commandes/page.tsx (plus d'input dupliqué ici) : filtre par
  id ou nom de produit, jour par jour, un jour sans résultat disparaît.
*/

function statutColor(statut: Statut): string {
  if (statut.type === "litige") return statut.issue ? ISSUES[statut.issue].couleur : LITIGE_OUVERT.couleur;
  if (statut.type === "relance") return "#3a1d8a";
  if (statut.type === "refusee") return "#c8262d";
  if (statut.type === "disponible" || statut.type === "livree") return "#178a3f";
  return ETAPES.find((e) => e.etape === statut.etape)!.couleur;
}

export default function CommandesListe({
  first = false,
  recherche = "",
  activeDate,
}: {
  first?: boolean;
  recherche?: string;
  /** Redescendu par app/dashboard/commandes/page.tsx (sélecteur année/mois/jour
   *  du DashboardHeader) : fait varier les montants mock ci-dessous selon la
   *  période choisie, cf. [[dashboard-mock-data-pending-laravel-api]]. */
  activeDate?: Date;
}) {
  const { t } = useDashboardLangue();
  const [litigeOuvert, setLitigeOuvert] = useState<string | null>(null);
  const base = activeDate ?? new Date(2026, 7, 1);
  const seed = periodSeed(base);

  // JOURS reste la source de vérité partagée avec LireUneLigne (qui, elle,
  // affiche volontairement un exemple figé) — ici on ne fait que dériver une
  // copie aux montants mis à l'échelle de la période, et aux libellés
  // "Aujourd'hui" / "Hier" recalculés sur activeDate, sans toucher au module.
  const jours = useMemo(() => {
    const labels = libellesJour(base);
    return JOURS.map((j, ji) => ({
      ...j,
      ...(j.cle === "aujourdhui" || j.cle === "hier" ? labels[j.cle] : {}),
      commandes: j.commandes.map((c, ci) => ({
        ...c,
        montantPaye: scaleForPeriod(c.montantPaye, seed, ji * 100 + ci * 3),
        retenueLogistique: scaleForPeriod(c.retenueLogistique, seed, ji * 100 + ci * 3 + 1),
        retenueOperation: scaleForPeriod(c.retenueOperation, seed, ji * 100 + ci * 3 + 2),
      })),
    }));
  }, [base, seed]);

  const joursFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return jours;
    return jours
      .map((j) => ({
        ...j,
        commandes: j.commandes.filter(
          (c) => c.id.toLowerCase().includes(q) || c.produit.toLowerCase().includes(q)
        ),
      }))
      .filter((j) => j.commandes.length > 0);
  }, [jours, recherche]);

  const totaux = useMemo(() => {
    const toutes = jours.flatMap((j) => j.commandes);
    const livrees = toutes.filter((c) => c.statut.type === "livree" || c.statut.type === "disponible").length;
    const encaisse = toutes.filter((c) => !estSuspendue(c)).reduce((s, c) => s + netDe(c), 0);
    const suspendu = toutes.filter(estSuspendue).reduce((s, c) => s + netDe(c), 0);
    const litiges = toutes.filter((c) => c.statut.type === "litige").length;
    return { total: toutes.length, livrees, encaisse, suspendu, litiges };
  }, [jours]);

  // Répartition par statut (donut) : chaque commande range dans une seule
  // des 5 catégories — mêmes couleurs que le reste de l'écran (StatutBloc,
  // ETAPES, ISSUES) pour qu'un même statut garde toujours la même couleur.
  const repartitionStatut = useMemo(() => {
    const toutes = jours.flatMap((j) => j.commandes);
    const categories = [
      { label: t("En cours", "In progress"), couleur: "#5AA9FF", count: toutes.filter((c) => c.statut.type === "etape").length },
      { label: t("Livrée", "Delivered"), couleur: "#178a3f", count: toutes.filter((c) => c.statut.type === "livree" || c.statut.type === "disponible").length },
      { label: t("Refusée", "Refused"), couleur: "#c8262d", count: toutes.filter((c) => c.statut.type === "refusee").length },
      { label: t("Litige", "Dispute"), couleur: "#a8690a", count: toutes.filter((c) => c.statut.type === "litige").length },
      { label: t("Relancée", "Relaunched"), couleur: "#3a1d8a", count: toutes.filter((c) => c.statut.type === "relance").length },
    ].filter((c) => c.count > 0);
    return { categories, total: toutes.length };
  }, [jours, t]);

  // Payé (brut) vs Encaissé (net, hors commandes suspendues) par jour — les
  // deux nombres que le sous-titre de l'écran annonce déjà ("ce que le
  // client a payé" / "ce qui vous revient"), juste mis en barres au lieu de
  // texte. Pas de fausse série temporelle : que les jours réellement dans
  // JOURS (aujourd'hui/hier).
  const payeVsEncaisse = useMemo(
    () =>
      jours.map((j) => ({
        label: t(j.date, j.dateEn).split(" · ")[0],
        paye: j.commandes.reduce((s, c) => s + c.montantPaye, 0),
        encaisse: j.commandes.filter((c) => !estSuspendue(c)).reduce((s, c) => s + netDe(c), 0),
      })),
    [jours, t]
  );

  return (
    <>
      <SectionHeader
        eyebrow={t("Commandes", "Orders")}
        title={t("Chaque commande, de la réception au règlement", "Every order, from receipt to payout")}
        subtitle={t(
          "Ce que le client a payé, ce qui est retenu, et ce qui vous revient — jour par jour.",
          "What the customer paid, what's withheld, and what's yours — day by day."
        )}
        first={first}
        layout="inline"
      />

      {/* 4 tuiles, médaillon coloré en coin — même langage visuel que la
          page Produits (cf. StatCell de ProduitsCatalogue.tsx) : label
          discret, gros chiffre, accent couleur, sans dupliquer le
          composant (pages restent indépendantes, pas de nouveau composant
          partagé pour ça). */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label={t("Commandes", "Orders")} value={totaux.total} note={t(`${totaux.livrees} livrées`, `${totaux.livrees} delivered`)} dot="#141220" />
        <KpiTile label={t("Encaissé", "Collected")} value={formatCfa(totaux.encaisse)} note={t("net, hors litiges", "net, disputes excluded")} dot="#178a3f" valueClassName="text-[#178a3f]" />
        <KpiTile label={t("Suspendu", "Suspended")} value={formatCfa(totaux.suspendu)} note={t("en attente de résolution", "pending resolution")} dot="#a8690a" valueClassName="text-[#a8690a]" />
        <KpiTile label={t("Litiges", "Disputes")} value={totaux.litiges} note={t("sur la période", "this period")} dot="#a8690a" />
      </div>

      {/* Deux graphes, inspirés de la référence envoyée (barres + anneau) :
          à gauche payé vs encaissé jour par jour (reprend exactement le
          sous-titre de l'écran, juste en barres), à droite la répartition
          des commandes par statut — mêmes couleurs que StatutBloc plus bas,
          pas de nouvelle légende à apprendre. */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <Card title={t("Payé vs encaissé", "Paid vs collected")} className="!bg-[var(--dashboard-glass)]">
          <PayeEncaisseBarChart data={payeVsEncaisse} />
        </Card>
        <Card title={t("Répartition par statut", "Status breakdown")} className="!bg-[var(--dashboard-glass)]">
          <StatutDonut categories={repartitionStatut.categories} total={repartitionStatut.total} />
        </Card>
      </div>

      <div className="mt-5 space-y-6">
        {joursFiltres.map((jour) => {
          const livrees = jour.commandes.filter((c) => c.statut.type === "livree" || c.statut.type === "disponible").length;
          const refusees = jour.commandes.filter((c) => c.statut.type === "refusee").length;
          const litiges = jour.commandes.filter((c) => c.statut.type === "litige").length;
          const relancees = jour.commandes.filter((c) => c.statut.type === "relance").length;
          const encaisseJour = jour.commandes.filter((c) => !estSuspendue(c)).reduce((s, c) => s + netDe(c), 0);

          return (
            <div key={jour.cle}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-2xl bg-[var(--dashboard-glass)] px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{texteAvecChiffres(t(jour.date, jour.dateEn))}</p>
                  <NombreEtMot nombre={jour.commandes.length} mot={t("reçues", "received")} />
                </div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <NombreEtMot nombre={livrees} mot={t("livrée", "delivered")} couleur="#178a3f" />
                  <NombreEtMot nombre={refusees} mot={t("refusée", "refused")} couleur="#c8262d" />
                  <NombreEtMot nombre={litiges} mot={t("en litige", "disputed")} couleur="#a8690a" />
                  <NombreEtMot nombre={relancees} mot={t("relancée", "relaunched")} couleur="#3a1d8a" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Encaissé", "Collected")}</p>
                    <p className="text-sm text-[#178a3f] font-figures-bold">{formatCfa(encaisseJour)}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-glass)]">
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">
                    <div className="grid grid-cols-[minmax(0,1fr)_100px_130px_110px_minmax(160px,1fr)] gap-4 border-b border-[var(--dashboard-text)]/10 px-4 py-2">
                      {[t("Commande", "Order"), t("Payé", "Paid"), t("Retenues", "Withheld"), t("Net", "Net"), t("Statut", "Status")].map((h, i) => (
                        <p
                          key={h}
                          className={`text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 ${i > 0 ? "text-right" : ""} ${i === 4 ? "text-left" : ""}`}
                        >
                          {h}
                        </p>
                      ))}
                    </div>
                    <div className="divide-y divide-[var(--dashboard-text)]/[0.06]">
                      {jour.commandes.map((c) => (
                        <LigneCommande
                          key={c.id}
                          commande={c}
                          ouverte={litigeOuvert === c.id}
                          onToggleLitige={() => setLitigeOuvert((id) => (id === c.id ? null : c.id))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {joursFiltres.length === 0 && (
          <p className="rounded-xl border border-[var(--dashboard-text)]/10 px-4 py-6 text-center text-xs text-[var(--dashboard-text)]/40">
            {t("Aucune commande ne correspond à votre recherche.", "No order matches your search.")}
          </p>
        )}
      </div>
    </>
  );
}

function LigneCommande({
  commande,
  ouverte,
  onToggleLitige,
}: {
  commande: Commande;
  ouverte: boolean;
  onToggleLitige: () => void;
}) {
  const { t } = useDashboardLangue();
  const net = netDe(commande);
  const suspendue = estSuspendue(commande);
  const accent = statutColor(commande.statut);

  return (
    <div>
      <div
        className="relative grid grid-cols-[minmax(0,1fr)_100px_130px_110px_minmax(160px,1fr)] items-center gap-4 px-4 py-3 transition hover:bg-[var(--dashboard-text)]/[0.03]"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />

        <div className="min-w-0 pl-2">
          <div className="flex items-baseline gap-2">
            <p className="text-[12.5px] text-[var(--dashboard-text)] font-figures-bold">{commande.id}</p>
            {commande.quantite > 1 && (
              <span className="shrink-0 rounded-full bg-[var(--dashboard-text)]/[0.08] px-1.5 py-0.5 text-[9px] font-bold text-[var(--dashboard-text)]/60">
                ×{commande.quantite}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-[var(--dashboard-text)]/55">{commande.produit}</p>
        </div>

        <p className="text-right text-[12.5px] font-semibold text-[var(--dashboard-text)] font-figures">{formatCfa(commande.montantPaye)}</p>

        <div className="flex flex-col items-end gap-0.5 text-[10.5px] font-semibold text-[#c8262d] font-figures">
          <span className="inline-flex items-center gap-1">
            <TriangleIcon filled className="rotate-180" />-{formatCfa(commande.retenueLogistique).replace(" F", "")}
          </span>
          <span className="inline-flex items-center gap-1">
            <TriangleIcon className="rotate-180" />-{formatCfa(commande.retenueOperation).replace(" F", "")}
          </span>
        </div>

        {suspendue ? (
          <p className="text-right text-[13px] text-[var(--dashboard-text)]/40 line-through font-figures-bold">{formatCfa(net)}</p>
        ) : (
          <p className="flex items-center justify-end gap-1 text-sm tracking-tight text-[#178a3f] font-figures-bold">
            <TriangleIcon filled />
            {formatCfa(net)}
          </p>
        )}

        <StatutBloc commande={commande} ouverte={ouverte} onToggleLitige={onToggleLitige} />
      </div>

      {ouverte && commande.statut.type === "litige" && (
        <div className="mx-4 mb-3 rounded-xl bg-[#fff1d6] px-3.5 py-3">
          {(() => {
            const info = commande.statut.issue ? ISSUES[commande.statut.issue] : LITIGE_OUVERT;
            return (
              <>
                <p className="text-[11px] font-bold" style={{ color: info.couleur }}>
                  {t(info.label, info.labelEn)}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#a8690a]">{t(info.note, info.noteEn)}</p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function StatutBloc({
  commande,
  ouverte,
  onToggleLitige,
}: {
  commande: Commande;
  ouverte: boolean;
  onToggleLitige: () => void;
}) {
  const { t } = useDashboardLangue();
  const statut = commande.statut;

  if (statut.type === "litige") {
    const info = statut.issue ? ISSUES[statut.issue] : LITIGE_OUVERT;
    const progression = statut.issue ? ISSUES[statut.issue].progression : 20;
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10.5px] font-bold" style={{ color: info.couleur }}>
            {t(info.label, info.labelEn)}
          </p>
          <button
            type="button"
            onClick={onToggleLitige}
            aria-expanded={ouverte}
            className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition hover:bg-[#fff1d6]"
            style={{ borderColor: `${info.couleur}40`, color: info.couleur }}
          >
            {ouverte ? t("Masquer", "Hide") : t("Voir", "View")}
          </button>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/10">
          <div className="h-full rounded-full" style={{ width: `${progression}%`, background: info.couleur }} />
        </div>
      </div>
    );
  }

  if (statut.type === "relance") {
    return <Tag tone="blue">{t("Relancée", "Relaunched")}</Tag>;
  }

  if (statut.type === "refusee") {
    return <Tag tone="ko">{t("Refusée", "Refused")}</Tag>;
  }

  if (statut.type === "disponible") {
    return <Tag tone="ok">{t("Disponible", "Available")}</Tag>;
  }

  if (statut.type === "livree") {
    return (
      <div className="flex items-center gap-2.5">
        <div className="h-0.5 flex-1 rounded-full bg-[#178a3f]" />
        <AnneauCompteARebours heuresRestantes={statut.heuresRestantes} size={32} />
      </div>
    );
  }

  const etape = ETAPES.find((e) => e.etape === statut.etape)!;
  const index = ETAPES.findIndex((e) => e.etape === statut.etape);

  return (
    <div>
      <div className="flex gap-1">
        {ETAPES.map((e, i) => (
          <span
            key={e.etape}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: i <= index ? e.couleur : "color-mix(in srgb, var(--dashboard-text) 10%, transparent)" }}
          />
        ))}
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: etape.couleur }}>
        {statut.etape === "livraison" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />}
        {t(etape.label, etape.labelEn)}
      </p>
    </div>
  );
}

/* Le chiffre est grand et coloré, le mot est petit et gris : on compte
   avant de lire. Un compte à zéro disparaît. */
function NombreEtMot({ nombre, mot, couleur }: { nombre: number; mot: string; couleur?: string }) {
  if (nombre === 0) return null;
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-sm font-figures-bold" style={couleur ? { color: couleur } : undefined}>
        {nombre}
      </span>
      <span className="text-[10px] text-[var(--dashboard-text)]/40">{mot}</span>
    </span>
  );
}

function KpiTile({
  label,
  value,
  note,
  dot,
  valueClassName = "",
}: {
  label: string;
  value: string | number;
  note?: string;
  dot: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl bg-[var(--dashboard-glass)] p-5 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold tracking-tight text-[var(--dashboard-text)]">{label}</p>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: `${dot}1F` }}>
          <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        </span>
      </div>
      <p className={`mt-2 text-2xl tracking-tight font-figures-bold ${valueClassName}`}>{value}</p>
      {note && <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{note}</p>}
    </div>
  );
}

/*
  Barres appairées payé (clair) / encaissé (foncé) par jour — inspirées de
  la référence envoyée (paires de barres bleues par jour), mais sur deux
  vraies valeurs de l'écran plutôt que deux années arbitraires. Grille
  pointillée horizontale même idée que la référence.
*/
function PayeEncaisseBarChart({ data }: { data: { label: string; paye: number; encaisse: number }[] }) {
  const { t } = useDashboardLangue();
  const max = Math.max(...data.flatMap((d) => [d.paye, d.encaisse]), 1);
  const ticks = 4;
  return (
    <div className="mt-2">
      <div className="flex items-center gap-4 text-[10px] text-[var(--dashboard-text)]/40">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#5AA9FF]" />
          {t("Payé", "Paid")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#011847]" />
          {t("Encaissé", "Collected")}
        </span>
      </div>

      <div className="relative mt-3 h-40">
        {Array.from({ length: ticks + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-x-0 border-t border-dashed border-[var(--dashboard-text)]/10"
            style={{ top: `${(i / ticks) * 100}%` }}
          />
        ))}
        <div className="relative flex h-full items-end justify-around gap-6 px-2">
          {data.map((d) => (
            <div key={d.label} className="flex h-full items-end gap-1.5">
              <div
                className="w-4 rounded-t-md bg-[#5AA9FF] sm:w-6"
                style={{ height: `${Math.max((d.paye / max) * 100, 3)}%` }}
                title={formatCfa(d.paye)}
              />
              <div
                className="w-4 rounded-t-md bg-[#011847] sm:w-6"
                style={{ height: `${Math.max((d.encaisse / max) * 100, 3)}%` }}
                title={formatCfa(d.encaisse)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-around gap-6 px-2">
        {data.map((d) => (
          <p key={d.label} className="text-center text-[10px] font-semibold text-[var(--dashboard-text)]/50">
            {d.label}
          </p>
        ))}
      </div>
    </div>
  );
}

/*
  Anneau de répartition par statut — segments proportionnels au nombre de
  commandes par catégorie, mêmes couleurs que StatutBloc/ETAPES/ISSUES plus
  haut sur l'écran. Légende à droite/dessous plutôt qu'au survol : cohérent
  avec le reste du dashboard qui n'a pas de tooltip de graphe.
*/
function StatutDonut({ categories, total }: { categories: { label: string; couleur: string; count: number }[]; total: number }) {
  const uid = useId().replace(/:/g, "");
  const size = 120;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circonference = 2 * Math.PI * r;
  let cumul = 0;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-28 w-28 shrink-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dashboard-text)" strokeOpacity="0.06" strokeWidth={stroke} />
        {categories.map((c) => {
          const part = total > 0 ? c.count / total : 0;
          const dash = part * circonference;
          const offset = -cumul * circonference;
          cumul += part;
          return (
            <circle
              key={`${uid}-${c.label}`}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={c.couleur}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circonference - dash}`}
              strokeDashoffset={offset}
              strokeLinecap={categories.length > 1 ? "butt" : "round"}
            />
          );
        })}
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {categories.map((c) => (
          <div key={c.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--dashboard-text)]/60">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.couleur }} />
              {c.label}
            </span>
            <span className="font-semibold">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
