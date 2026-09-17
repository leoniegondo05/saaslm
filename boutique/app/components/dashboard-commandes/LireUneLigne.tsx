"use client";

import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import {
  AnneauCompteARebours,
  Commande,
  DEVISES,
  ETAPES,
  ISSUES,
  IssueLitige,
  JOURS,
  estSuspendue,
  formatCfa,
  formatDevise,
  libellesJour,
  netDe,
  TriangleIcon,
} from "./shared";

/*
  Écran 12 "Lire une ligne" : pas une commande à traiter, une notice —
  comment lire "Les commandes" (CommandesListe, Écran 11). Reprend, colonne
  par colonne, l'exemple annoté de la maquette, puis documente la piste
  d'étapes, l'anneau de 72 h, les deux retenues, les trois issues d'un
  litige, le résumé d'une journée, et la conversion en devise — toujours
  avec les données de démonstration partagées (cf. ./shared), pour rester
  cohérente avec ce que "Les commandes" affiche réellement.
*/

const EXEMPLE: Commande = {
  id: "CMD-64817",
  produit: "Ensemble deux pièces en lin",
  quantite: 1,
  montantPaye: 19900,
  retenueLogistique: 1500,
  retenueOperation: 800,
  statut: { type: "livree", heuresRestantes: 69 },
};

const JOUR_RESUME_BASE = JOURS[1]; // "Hier" — contient un peu de tout : livrée, disponible, litiges, refusée

export default function LireUneLigne({ first = false, activeDate }: { first?: boolean; activeDate?: Date }) {
  const { t } = useDashboardLangue();
  const net = netDe(EXEMPLE);

  // Commandes de l'exemple volontairement figées (fiche pédagogique, cf.
  // shared.tsx) — seul le libellé de date suit le sélecteur du dashboard.
  const JOUR_RESUME = { ...JOUR_RESUME_BASE, ...libellesJour(activeDate ?? new Date(2026, 7, 1)).hier };

  const livreesResume = JOUR_RESUME.commandes.filter((c) => c.statut.type === "livree" || c.statut.type === "disponible").length;
  const refuseesResume = JOUR_RESUME.commandes.filter((c) => c.statut.type === "refusee").length;
  const litigesResume = JOUR_RESUME.commandes.filter((c) => c.statut.type === "litige").length;
  const relanceesResume = JOUR_RESUME.commandes.filter((c) => c.statut.type === "relance").length;
  const encaisseResume = JOUR_RESUME.commandes.filter((c) => !estSuspendue(c)).reduce((s, c) => s + netDe(c), 0);

  return (
    <>
      <SectionHeader
        eyebrow={t("Lire une ligne", "Reading a row")}
        title={t("Ce que chaque colonne veut dire", "What each column means")}
        subtitle={t(
          "Trois tailles, pas plus. Ce qui se lit en grand, ce qui se lit en moyen, ce qui ne se lit pas du tout mais se voit.",
          "Three sizes, no more. What reads large, what reads medium, what isn't read at all but is seen."
        )}
        first={first}
        layout="inline"
      />

      {/* Deuxième essai (le premier, chiffres roses flottants sur une carte
          isolée + trois pavés gris à part, ne plaisait pas du tout —
          capture envoyée) : le vrai repère hiérarchique porte sur les
          libellés eux-mêmes (PAYÉ, NET, RETENUES, DISPONIBLE), pas sur des
          numéros renvoyant à une légende séparée. Carte + légende posées
          côte à côte pour ne plus laisser tout ce vide autour d'une
          vignette perdue au centre. */}
      <Card className="!bg-[var(--dashboard-card-bg)]">
        <div className="grid items-center gap-6 lg:grid-cols-[300px_1fr]">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-glass)] p-4 pl-5 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
            <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-[#178a3f]" />

            <p className="text-[15px] font-bold tracking-tight text-[var(--dashboard-text)]">{EXEMPLE.id}</p>
            <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/55">{EXEMPLE.produit}</p>

            <div className="mt-3.5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Payé", "Paid")}</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--dashboard-text)]">{formatCfa(EXEMPLE.montantPaye)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Net", "Net")}</p>
                <p className="mt-0.5 flex items-center justify-end gap-1 text-lg tracking-tight text-[#178a3f] font-figures-bold">
                  <TriangleIcon filled />
                  {formatCfa(net)}
                </p>
              </div>
            </div>

            <p className="mt-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Retenues", "Deductions")}</p>
            <div className="mt-0.5 flex items-center gap-3 text-[10.5px] font-semibold text-[#c8262d]">
              <span className="flex items-center gap-1">
                <TriangleIcon filled className="rotate-180" />-{formatCfa(EXEMPLE.retenueLogistique)}
              </span>
              <span className="flex items-center gap-1">
                <TriangleIcon className="rotate-180" />-{formatCfa(EXEMPLE.retenueOperation)}
              </span>
            </div>

            <div className="mt-3.5 flex items-center gap-2.5 border-t border-[var(--dashboard-text)]/[0.08] pt-3">
              <div className="h-0.5 flex-1 rounded-full bg-[#178a3f]" />
              <AnneauCompteARebours heuresRestantes={69} size={32} />
            </div>
          </div>

          <div className="space-y-4">
            <Taille
              couleur="#EC0C8C"
              titre={t("Grand", "Large")}
              note={t(
                "Le numéro et ce qui vous revient. Les deux seules choses qu'on cherche en ouvrant l'écran.",
                "The number and what's yours. The only two things you look for when opening the screen."
              )}
            />
            <Taille
              couleur="#3A1D8A"
              titre={t("Moyen", "Medium")}
              note={t(
                "Le montant payé par le client. Utile, mais on ne le cherche pas : il attend d'être trouvé.",
                "The amount the customer paid. Useful, but not what you're looking for: it waits to be found."
              )}
            />
            <Taille
              couleur="#5A6072"
              titre={t("Petit", "Small")}
              note={t(
                "Le produit, les deux retenues, l'avancement, l'anneau. Se voient sans se lire.",
                "The product, the two deductions, the progress, the ring. Seen without being read."
              )}
            />
          </div>
        </div>
      </Card>

      {/* Troisième design (le deuxième — une seule barre multicolore continue
          avec libellés/phrases posés au-dessus/dessous en rangées séparées
          — ne plaisait pas non plus) : chaque étape devient un bloc à part
          entière (fond teinté + libellé + phrase ensemble), reliés par un
          chevron plutôt qu'un trait de couleur qui traverse tout l'écran.
          Mêmes 4 étapes + Livrée, mêmes phrases. */}
      <Card
        title={t("Le point avance", "The point moves along")}
        badge={<Medaillon couleur="#3A1D8A" />}
        className="mt-3 !bg-[var(--dashboard-card-bg)] overflow-x-auto"
      >
        <div className="mt-3.5 flex min-w-[760px] items-stretch gap-1.5">
          {ETAPES.map((e, i) => (
            <div key={e.etape} className="flex items-stretch gap-1.5">
              <div
                className="w-[130px] shrink-0 rounded-xl px-3 py-2.5"
                style={{ background: `${e.couleur}14`, borderTop: `2px solid ${e.couleur}` }}
              >
                <p className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: e.couleur }}>
                  {e.etape === "livraison" && <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full" style={{ background: e.couleur }} />}
                  {t(e.label, e.labelEn)}
                </p>
                <p className="mt-1 text-[9.5px] leading-snug text-[var(--dashboard-text)]/50">
                  {i === 0 && t("La commande arrive. Personne ne la prend.", "The order comes in. No one has taken it yet.")}
                  {i === 1 && t("Un centre d'appel s'en occupe.", "A call center handles it.")}
                  {i === 2 && t("Le colis se prépare.", "The parcel is being prepared.")}
                  {i === 3 && t("Le livreur a démarré. Le point bat.", "The courier has left. The point pulses.")}
                </p>
              </div>
              <span aria-hidden className="flex shrink-0 items-center text-sm text-[var(--dashboard-text)]/20">›</span>
            </div>
          ))}
          <div className="w-[130px] shrink-0 rounded-xl px-3 py-2.5" style={{ background: "#178a3f14", borderTop: "2px solid #178a3f" }}>
            <p className="text-[10px] font-bold text-[#178a3f]">{t("Livrée", "Delivered")}</p>
            <p className="mt-1 text-[9.5px] leading-snug text-[var(--dashboard-text)]/50">
              {t("Le mot disparaît, le trait vert et l'anneau suffisent.", "The word disappears, the green line and the ring are enough.")}
            </p>
          </div>
        </div>
      </Card>

      {/* Idem pour celle-ci — les 6 anneaux flottaient chacun dans leur coin,
          avec du vide entre eux. Reliés maintenant par un fil, façon frise
          chronologique : mêmes 6 paliers, mêmes libellés/notes. */}
      <Card
        title={t("Soixante-douze heures, puis l'argent est à vous", "Seventy-two hours, then the money is yours")}
        badge={<Medaillon couleur="#EC0C8C" />}
        className="mt-3 !bg-[var(--dashboard-card-bg)] overflow-x-auto"
      >
        <div className="relative mt-3.5 min-w-[640px]">
          <div
            aria-hidden
            className="absolute inset-x-2 top-5 h-px"
            style={{ background: "linear-gradient(90deg, rgba(236,12,140,0.35), rgba(23,138,63,0.35))" }}
          />
          <div className="relative flex items-start justify-between gap-2">
            <Palier heures={72} label="72 h" note={t("À la livraison", "At delivery")} />
            <Palier heures={41} label="41 h" note={t("Le lendemain", "The next day")} />
            <Palier heures={6} label="6 h" note={t("Dernières heures", "Final hours")} />
            <Palier heures={58 / 60} label={t("58 min", "58 min")} note={t("La dernière heure passe aux minutes", "The last hour switches to minutes")} />
            <Palier heures={2 / 60} label={t("2 min", "2 min")} note={t("Presque au bout", "Almost there")} />
            <div className="flex w-10 flex-col items-center gap-1.5 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#178a3f] bg-[var(--dashboard-card-bg)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#178a3f]" />
              </span>
              <p className="text-[10px] font-bold text-[#178a3f]">{t("Disponible", "Available")}</p>
              <p className="max-w-[90px] text-[9px] leading-snug text-[var(--dashboard-text)]/40">{t("L'argent peut être retiré", "The money can be withdrawn")}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title={t("Les deux retenues, en détail", "The two deductions, in detail")}
        badge={<Medaillon couleur="#011847" />}
        className="mt-3 !bg-[var(--dashboard-card-bg)]"
      >
        {/* Deuxième design (le premier — deux pavés côte à côte, texte
            seul, aucun montant — ne plaisait pas) : une barre proportionnelle
            de la commande ${EXEMPLE.id} elle-même, découpée net/logistique/
            opération, puis le détail ligne par ligne avec les vrais
            montants. Mêmes données (les deux triangles, mêmes textes),
            juste rendues concrètes au lieu d'abstraites. */}
        <div className="mt-3.5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full">
            <div style={{ width: `${(net / EXEMPLE.montantPaye) * 100}%`, background: "#178a3f" }} />
            <div style={{ width: `${(EXEMPLE.retenueLogistique / EXEMPLE.montantPaye) * 100}%`, background: "#c8262d" }} />
            <div style={{ width: `${(EXEMPLE.retenueOperation / EXEMPLE.montantPaye) * 100}%`, background: "#f08289" }} />
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">
            {t(`Sur ${formatCfa(EXEMPLE.montantPaye)} payés par le client, commande ${EXEMPLE.id}`, `Out of ${formatCfa(EXEMPLE.montantPaye)} paid by the customer, order ${EXEMPLE.id}`)}
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#dcf5e3] text-[#178a3f]">
                <TriangleIcon filled />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Net · ce qui vous revient", "Net · what's yours")}</p>
                  <p className="shrink-0 text-xs font-bold text-[#178a3f]">{formatCfa(net)}</p>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--dashboard-text)]/50">
                  {t("Le montant payé, une fois les deux retenues ci-dessous faites.", "The amount paid, once the two deductions below are taken.")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#ffe1e2] text-[#c8262d]">
                <TriangleIcon filled className="rotate-180" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Triangle plein · logistique", "Filled triangle · logistics")}</p>
                  <p className="shrink-0 text-xs font-bold text-[#c8262d]">-{formatCfa(EXEMPLE.retenueLogistique)}</p>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--dashboard-text)]/50">
                  {t(
                    "Ce que garde le partenaire agréé pour la collecte, le stockage et la livraison du colis.",
                    "What the approved partner keeps for collecting, storing, and delivering the parcel."
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#ffe1e2] text-[#f08289]">
                <TriangleIcon className="rotate-180" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Triangle vide · opération", "Outline triangle · operations")}</p>
                  <p className="shrink-0 text-xs font-bold text-[#f08289]">-{formatCfa(EXEMPLE.retenueOperation)}</p>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--dashboard-text)]/50">
                  {t(
                    "Ce que garde la plateforme pour le paiement en ligne, l'hébergement de la page, et le support.",
                    "What the platform keeps for online payment, hosting the page, and support."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title={t("Un litige à trois issues", "A dispute has three outcomes")}
        badge={<Tag tone="warn">{t("En attente · trait orange", "Pending · orange line")}</Tag>}
        className="mt-3 !bg-[var(--dashboard-card-bg)]"
      >
        <p className="mt-3.5 text-xs text-[var(--dashboard-text)]/50">
          {t(
            "Tant qu'il est ouvert, le trait est orange et l'argent suspendu. Quand il est tranché, le trait prend la couleur de l'issue et le bouton « Voir » donne la décision écrite.",
            "While it's open, the line is orange and the money suspended. Once settled, the line takes the color of the outcome, and the \"View\" button gives the written decision."
          )}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(Object.keys(ISSUES) as IssueLitige[]).map((cle) => {
            const issue = ISSUES[cle];
            return (
              <div key={cle} className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3.5 py-3">
                <p className="text-xs font-bold" style={{ color: issue.couleur }}>
                  {t(issue.label, issue.labelEn)}
                </p>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/10">
                  <div className="h-full rounded-full" style={{ width: `${issue.progression}%`, background: issue.couleur }} />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--dashboard-text)]/55">{t(issue.note, issue.noteEn)}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title={t("Le résumé d'une journée", "A day's summary")}
        badge={<Medaillon couleur="#3A1D8A" />}
        className="mt-3 !bg-[var(--dashboard-card-bg)]"
      >
        <div className="mt-3.5 rounded-xl bg-[var(--dashboard-text)]/[0.04] px-3.5 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">{t(JOUR_RESUME.date, JOUR_RESUME.dateEn)}</p>
              <span className="flex items-baseline gap-1">
                <span className="text-sm text-[var(--dashboard-text)] font-figures-bold">{JOUR_RESUME.commandes.length}</span>
                <span className="text-[10px] text-[var(--dashboard-text)]/40">{t("reçues", "received")}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="flex items-baseline gap-1">
                <span className="text-sm text-[#178a3f] font-figures-bold">{livreesResume}</span>
                <span className="text-[10px] text-[var(--dashboard-text)]/40">{t("livrée", "delivered")}</span>
              </span>
              <span className="flex items-baseline gap-1">
                <span className="text-sm text-[#c8262d] font-figures-bold">{refuseesResume}</span>
                <span className="text-[10px] text-[var(--dashboard-text)]/40">{t("refusée", "refused")}</span>
              </span>
              <span className="flex items-baseline gap-1">
                <span className="text-sm text-[#a8690a] font-figures-bold">{litigesResume}</span>
                <span className="text-[10px] text-[var(--dashboard-text)]/40">{t("en litige", "disputed")}</span>
              </span>
              <span className="flex items-baseline gap-1">
                <span className="text-sm text-[#3a1d8a] font-figures-bold">{relanceesResume}</span>
                <span className="text-[10px] text-[var(--dashboard-text)]/40">{t("relancée", "relaunched")}</span>
              </span>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Encaissé", "Collected")}</p>
                <p className="text-sm text-[#178a3f] font-figures-bold">{formatCfa(encaisseResume)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title={t("La devise suit vos réglages", "The currency follows your settings")}
        badge={<Medaillon couleur="#011847" />}
        className="mt-3 !bg-[var(--dashboard-card-bg)]"
      >
        <p className="mt-3.5 text-xs text-[var(--dashboard-text)]/50">
          {t(
            `Les mêmes montants que la commande ${EXEMPLE.id}, convertis à titre indicatif — vos règlements restent toujours en franc CFA.`,
            `The same amounts as order ${EXEMPLE.id}, converted for illustration — your payouts always stay in CFA francs.`
          )}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--dashboard-text)]/10">
                {[t("Devise", "Currency"), t("Payé", "Paid"), t("Logistique", "Logistics"), t("Opération", "Operations"), t("Net", "Net")].map((h) => (
                  <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEVISES.map((d) => (
                <tr key={d.key} className="border-b border-[var(--dashboard-text)]/[0.05] last:border-0">
                  <td className="py-2 pr-3 font-semibold text-[var(--dashboard-text)]">{t(d.label, d.labelEn)}</td>
                  <td className="py-2 pr-3 font-semibold">{formatDevise(EXEMPLE.montantPaye, d.key)}</td>
                  <td className="py-2 pr-3 text-[#c8262d]">-{formatDevise(EXEMPLE.retenueLogistique, d.key)}</td>
                  <td className="py-2 pr-3 text-[#c8262d]">-{formatDevise(EXEMPLE.retenueOperation, d.key)}</td>
                  <td className="py-2 pr-3 text-sm text-[#178a3f] font-figures-bold">{formatDevise(net, d.key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* Médaillon coloré posé dans le coin "badge" d'un Card — mêmes couleurs
   primaires/secondaires de la charte LIIVRE MOI (fuchsia, indigo, bleu
   nuit, cf. [[charte-graphique-livre-moi]]), pas les couleurs
   fonctionnelles de statut (vert/rouge/orange) déjà utilisées ailleurs sur
   cette même page pour livrée/refusée/litige. Un repère visuel discret par
   section, cohérent avec les tuiles de CommandesListe/ProduitsCatalogue.
   Titre en étiquette simple (pas titleTab) : la pilule grise qui débordait
   en haut de carte ne plaisait pas du tout, cf. capture envoyée. */
function Medaillon({ couleur }: { couleur: string }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: `${couleur}1F` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: couleur }} />
    </span>
  );
}

/* Point coloré à gauche du titre — pas un numéro renvoyant à une légende,
   juste un repère de hiérarchie : fuchsia (le plus voyant) pour ce qu'on
   cherche en premier, jusqu'à gris ardoise pour ce qui se voit sans se
   lire. Couleurs charte, cf. [[charte-graphique-livre-moi]]. */
function Taille({ titre, note, couleur }: { titre: string; note: string; couleur: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/50">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: couleur }} />
        {titre}
      </p>
      <p className="mt-1 pl-3.5 text-[11px] leading-relaxed text-[var(--dashboard-text)]/55">{note}</p>
    </div>
  );
}

function Palier({ heures, label, note }: { heures: number; label: string; note: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <AnneauCompteARebours heuresRestantes={heures} etiquette={label} size={40} />
      <p className="max-w-[90px] text-[9px] leading-snug text-[var(--dashboard-text)]/40">{note}</p>
    </div>
  );
}
