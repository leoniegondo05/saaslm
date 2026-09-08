"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import {
  AnneauCompteARebours,
  Commande,
  ETAPES,
  ISSUES,
  JOURS,
  LITIGE_OUVERT,
  TriangleIcon,
  estSuspendue,
  formatCfa,
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
*/

export default function CommandesListe({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [recherche, setRecherche] = useState("");
  const [aidePourquoi, setAidePourquoi] = useState(false);
  const [litigeOuvert, setLitigeOuvert] = useState<string | null>(null);

  const joursFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return JOURS;
    return JOURS.map((j) => ({
      ...j,
      commandes: j.commandes.filter(
        (c) => c.id.toLowerCase().includes(q) || c.produit.toLowerCase().includes(q)
      ),
    })).filter((j) => j.commandes.length > 0);
  }, [recherche]);

  const totaux = useMemo(() => {
    const toutes = JOURS.flatMap((j) => j.commandes);
    const livrees = toutes.filter((c) => c.statut.type === "livree" || c.statut.type === "disponible").length;
    const encaisse = toutes.filter((c) => !estSuspendue(c)).reduce((s, c) => s + netDe(c), 0);
    const suspendu = toutes.filter(estSuspendue).reduce((s, c) => s + netDe(c), 0);
    return { total: toutes.length, livrees, encaisse, suspendu };
  }, []);

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

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-text)]/35">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("Rechercher une commande ou un produit…", "Search an order or product…")}
            className="w-full rounded-full border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] py-2.5 pl-10 pr-4 text-xs font-medium text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/50"
          />
        </div>
        <button
          type="button"
          onClick={() => setAidePourquoi((v) => !v)}
          aria-pressed={aidePourquoi}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-pink/25 bg-brand-pink/5 px-3.5 py-2.5 text-xs font-semibold text-brand-pink transition hover:bg-brand-pink/10"
        >
          <SparkleIcon />
          {t("Pourquoi mon argent est-il suspendu ?", "Why is my money suspended?")}
        </button>
      </div>

      {aidePourquoi && (
        <div className="mt-2.5 rounded-xl border border-brand-pink/15 bg-brand-pink/5 px-4 py-3 text-xs leading-relaxed text-[var(--dashboard-text)]/70">
          {t(
            "Un montant est suspendu dès qu'un litige est ouvert sur la commande. Il redevient net s'il est tranché en votre faveur, reste barré en cas de retour de fonds, ou repart au statut « Préparation » en cas de changement de colis. Une commande livrée sans litige reste 72 h en compte à rebours avant que son net soit disponible. Le détail complet est dans « Lire une ligne ».",
            "An amount is suspended as soon as a dispute is open on the order. It becomes net again if settled in your favor, stays struck through if funds are returned, or goes back to \"Preparing\" if the parcel is exchanged. A delivered order with no dispute counts down 72 h before its net becomes available. Full detail is in \"Reading a row\"."
          )}
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Card title={t("Commandes", "Orders")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-center text-2xl font-bold tracking-tight">{totaux.total}</p>
          <p className="mt-1 text-center text-[11px] text-[var(--dashboard-text)]/45">
            {t(`${totaux.livrees} livrées`, `${totaux.livrees} delivered`)}
          </p>
        </Card>
        <Card title={t("Encaissé", "Collected")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-center text-2xl font-bold tracking-tight text-[#178a3f]">{formatCfa(totaux.encaisse)}</p>
          <p className="mt-1 text-center text-[11px] text-[var(--dashboard-text)]/45">{t("net, hors litiges", "net, disputes excluded")}</p>
        </Card>
        <Card title={t("Suspendu", "Suspended")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-center text-2xl font-bold tracking-tight text-[var(--dashboard-text)]/50">{formatCfa(totaux.suspendu)}</p>
          <p className="mt-1 text-center text-[11px] text-[var(--dashboard-text)]/45">{t("en attente de résolution", "pending resolution")}</p>
        </Card>
      </div>

      <div className="mt-4 space-y-5">
        {joursFiltres.map((jour) => {
          const livrees = jour.commandes.filter((c) => c.statut.type === "livree" || c.statut.type === "disponible").length;
          const refusees = jour.commandes.filter((c) => c.statut.type === "refusee").length;
          const litiges = jour.commandes.filter((c) => c.statut.type === "litige").length;
          const encaisseJour = jour.commandes.filter((c) => !estSuspendue(c)).reduce((s, c) => s + netDe(c), 0);

          return (
            <div key={jour.cle}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-xl bg-[var(--dashboard-text)]/[0.04] px-3.5 py-2.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{t(jour.date, jour.dateEn)}</p>
                  <NombreEtMot nombre={jour.commandes.length} mot={t("reçues", "received")} />
                </div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <NombreEtMot nombre={livrees} mot={t("livrée", "delivered")} couleur="#178a3f" />
                  <NombreEtMot nombre={refusees} mot={t("refusée", "refused")} couleur="#c8262d" />
                  <NombreEtMot nombre={litiges} mot={t("en litige", "disputed")} couleur="#a8690a" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Encaissé", "Collected")}</p>
                    <p className="text-sm font-bold text-[#178a3f]">{formatCfa(encaisseJour)}</p>
                  </div>
                </div>
              </div>

              <Card className="!bg-[var(--dashboard-card-bg)] !p-0">
                <div className="divide-y divide-[var(--dashboard-text)]/[0.06] overflow-x-auto">
                  {jour.commandes.map((c) => (
                    <LigneCommande
                      key={c.id}
                      commande={c}
                      ouverte={litigeOuvert === c.id}
                      onToggleLitige={() => setLitigeOuvert((id) => (id === c.id ? null : c.id))}
                    />
                  ))}
                </div>
              </Card>
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

  return (
    <div>
      <div className="flex min-w-[720px] items-center gap-4 px-3.5 py-3 text-xs">
        <div className="w-28 shrink-0">
          <p className="font-bold text-[var(--dashboard-text)]">{commande.id}</p>
        </div>

        <div className="min-w-[160px] flex-1">
          <p className="flex items-center gap-1.5 text-[var(--dashboard-text)]/60">
            <span className="truncate">{commande.produit}</span>
            {commande.quantite > 1 && (
              <span className="shrink-0 rounded-full bg-[var(--dashboard-text)]/[0.08] px-1.5 py-0.5 text-[9px] font-bold text-[var(--dashboard-text)]/60">
                ×{commande.quantite}
              </span>
            )}
          </p>
        </div>

        <div className="w-20 shrink-0 text-right font-semibold text-[var(--dashboard-text)]">{formatCfa(commande.montantPaye)}</div>

        <div className="w-16 shrink-0 text-right text-[#c8262d]">
          <span className="inline-flex items-center gap-1">
            <TriangleIcon filled className="rotate-180 text-[#c8262d]" />-{formatCfa(commande.retenueLogistique).replace(" F", "")}
          </span>
        </div>
        <div className="w-16 shrink-0 text-right text-[#c8262d]">
          <span className="inline-flex items-center gap-1">
            <TriangleIcon className="rotate-180 text-[#c8262d]" />-{formatCfa(commande.retenueOperation).replace(" F", "")}
          </span>
        </div>

        <div className="w-24 shrink-0 text-right">
          {suspendue ? (
            <span className="text-[var(--dashboard-text)]/35 line-through">{formatCfa(net)}</span>
          ) : (
            <span className="inline-flex items-center justify-end gap-1 text-sm font-bold text-[#178a3f]">
              <TriangleIcon filled />
              {formatCfa(net)}
            </span>
          )}
        </div>

        <div className="w-40 shrink-0">
          <StatutColonne commande={commande} ouverte={ouverte} onToggleLitige={onToggleLitige} />
        </div>
      </div>

      {ouverte && commande.statut.type === "litige" && (
        <div className="mx-3.5 mb-3 rounded-xl bg-[#fff1d6] px-3.5 py-3">
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

function StatutColonne({
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
      <div className="flex items-center justify-end gap-2">
        <div className="min-w-0 text-right">
          <p className="truncate text-[10.5px] font-bold" style={{ color: info.couleur }}>
            {t(info.label, info.labelEn)}
          </p>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/10">
            <div className="h-full rounded-full" style={{ width: `${progression}%`, background: info.couleur }} />
          </div>
        </div>
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
    );
  }

  if (statut.type === "refusee") {
    return (
      <div className="flex justify-end">
        <Tag tone="ko">{t("Refusée", "Refused")}</Tag>
      </div>
    );
  }

  if (statut.type === "disponible") {
    return (
      <div className="flex justify-end">
        <Tag tone="ok">{t("Disponible", "Available")}</Tag>
      </div>
    );
  }

  if (statut.type === "livree") {
    return (
      <div className="flex items-center justify-end gap-2">
        <div className="h-0.5 w-10 rounded-full bg-[#178a3f]" />
        <AnneauCompteARebours heuresRestantes={statut.heuresRestantes} />
      </div>
    );
  }

  const etape = ETAPES.find((e) => e.etape === statut.etape)!;
  const index = ETAPES.findIndex((e) => e.etape === statut.etape);

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-[128px]">
        <div className="flex gap-1">
          {ETAPES.map((e, i) => (
            <span
              key={e.etape}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: i <= index ? e.couleur : "color-mix(in srgb, var(--dashboard-text) 10%, transparent)" }}
            />
          ))}
        </div>
        <p className="mt-1 flex items-center justify-end gap-1.5 text-[10px] font-semibold" style={{ color: etape.couleur }}>
          {statut.etape === "livraison" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />}
          {t(etape.label, etape.labelEn)}
        </p>
      </div>
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m21 21-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    </svg>
  );
}
