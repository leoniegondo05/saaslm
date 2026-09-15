"use client";

import { useMemo, useState } from "react";
import { Card, periodSeed, scaleForPeriod, SectionHeader, Tag } from "../dashboard-accueil/shared";
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
    return { total: toutes.length, livrees, encaisse, suspendu };
  }, [jours]);

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

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Commandes", "Orders")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{totaux.total}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t(`${totaux.livrees} livrées`, `${totaux.livrees} delivered`)}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Encaissé", "Collected")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#178a3f]">{formatCfa(totaux.encaisse)}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("net, hors litiges", "net, disputes excluded")}</p>
        </Card>
        <Card className="!bg-[var(--dashboard-glass)]">
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{t("Suspendu", "Suspended")}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#a8690a]">{formatCfa(totaux.suspendu)}</p>
          <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">{t("en attente de résolution", "pending resolution")}</p>
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
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{t(jour.date, jour.dateEn)}</p>
                  <NombreEtMot nombre={jour.commandes.length} mot={t("reçues", "received")} />
                </div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <NombreEtMot nombre={livrees} mot={t("livrée", "delivered")} couleur="#178a3f" />
                  <NombreEtMot nombre={refusees} mot={t("refusée", "refused")} couleur="#c8262d" />
                  <NombreEtMot nombre={litiges} mot={t("en litige", "disputed")} couleur="#a8690a" />
                  <NombreEtMot nombre={relancees} mot={t("relancée", "relaunched")} couleur="#3a1d8a" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Encaissé", "Collected")}</p>
                    <p className="text-sm font-bold text-[#178a3f]">{formatCfa(encaisseJour)}</p>
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
                          className={`text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35 ${i > 0 ? "text-right" : ""} ${i === 4 ? "text-left" : ""}`}
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
          <p className="rounded-xl border border-[var(--dashboard-text)]/10 px-4 py-6 text-center text-xs text-[var(--dashboard-text)]/45">
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
            <p className="text-[12.5px] font-bold text-[var(--dashboard-text)]">{commande.id}</p>
            {commande.quantite > 1 && (
              <span className="shrink-0 rounded-full bg-[var(--dashboard-text)]/[0.08] px-1.5 py-0.5 text-[9px] font-bold text-[var(--dashboard-text)]/60">
                ×{commande.quantite}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-[var(--dashboard-text)]/55">{commande.produit}</p>
        </div>

        <p className="text-right text-[12.5px] font-semibold text-[var(--dashboard-text)]">{formatCfa(commande.montantPaye)}</p>

        <div className="flex flex-col items-end gap-0.5 text-[10.5px] font-semibold text-[#c8262d]">
          <span className="inline-flex items-center gap-1">
            <TriangleIcon filled className="rotate-180" />-{formatCfa(commande.retenueLogistique).replace(" F", "")}
          </span>
          <span className="inline-flex items-center gap-1">
            <TriangleIcon className="rotate-180" />-{formatCfa(commande.retenueOperation).replace(" F", "")}
          </span>
        </div>

        {suspendue ? (
          <p className="text-right text-[13px] font-bold text-[var(--dashboard-text)]/35 line-through">{formatCfa(net)}</p>
        ) : (
          <p className="flex items-center justify-end gap-1 text-[15px] font-bold tracking-tight text-[#178a3f]">
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
      <span className="text-sm font-bold" style={couleur ? { color: couleur } : undefined}>
        {nombre}
      </span>
      <span className="text-[10px] text-[var(--dashboard-text)]/45">{mot}</span>
    </span>
  );
}
