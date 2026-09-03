import Link from "next/link";
import { Card, SectionHeader, StatRow, Tag } from "../dashboard-accueil/shared";

/*
  Écran 04 "Le partenaire agréé" : identité du partenaire, ses informations
  (barème logistique) et le prochain produit à venir chez lui, avec un lien
  vers le catalogue drop complet (Écran 05). Atteint depuis l'onglet
  "Partenaire agréé" de ProduitsNav, ou la chip "Partenaire agréé" du header
  (voir DashboardHeader) sur n'importe quel écran du dashboard.

  Une seule fiche pour l'instant (le partenaire de la boutique connectée) —
  pas de tableau de partenaires, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

const PARTENAIRE = {
  nom: "Groupe Logistique Ivoire",
  ville: "Cocody Riviera · Abidjan",
  note: 8.4,
  affilieeDepuis: "14 mars 2026",
  badges: ["Certifiée", "Visitée par LM", "Centre d'appel"],
  infos: [
    { label: "Créée en", value: "2019" },
    { label: "Employés", value: "24" },
    { label: "Entrepôts", value: "3 sites" },
    { label: "Engins de distribution", value: "31" },
    { label: "Représentations", value: "5 villes" },
    { label: "Abonnement mensuel", value: "25 000 F" },
    { label: "Frais logistiques", value: "1 500 F" },
    { label: "Emballage", value: "Inclus" },
    { label: "Garantie perte", value: "Facultative · 500 F" },
    { label: "Livraison express", value: "2 000 F" },
    { label: "Récupération", value: "1 000 F" },
    { label: "Délai moyen", value: "26 h" },
  ],
};

const PROCHAIN_PRODUIT = {
  nom: "Enceinte nomade B4",
  arriveeLe: "4 septembre",
  note: "Prochainement au catalogue de votre partenaire. Prix communiqué à l'arrivée du stock.",
};

export default function PartenaireAgree({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Partenaire agréé"
        title={PARTENAIRE.nom}
        subtitle="Identité, informations et prochains produits."
        first={first}
      />

      <div className="grid gap-4 lg:grid-cols-[334px_1fr]">
        <div>
          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
            <div className="flex items-center gap-3">
              <span className="h-14 w-14 shrink-0 rounded-2xl bg-[linear-gradient(140deg,#2F6BE0,#011847)]" />
              <div>
                <p className="text-base font-semibold tracking-tight">{PARTENAIRE.nom}</p>
                <p className="text-xs text-[#141220]/50">{PARTENAIRE.ville}</p>
              </div>
            </div>
            <div className="my-3 h-px bg-[#141220]/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#141220]/40">Note du réseau</p>
                <p className="text-base font-bold">
                  {PARTENAIRE.note.toLocaleString("fr-FR")} <span className="text-xs font-normal text-[#141220]/50">/ 10</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#141220]/40">Affiliée depuis</p>
                <p className="text-sm font-semibold">{PARTENAIRE.affilieeDepuis}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PARTENAIRE.badges.map((b) => (
                <Tag key={b} tone="dark">{b}</Tag>
              ))}
            </div>
          </div>

          <Card title="Informations du partenaire" className="mt-3">
            {PARTENAIRE.infos.map((row) => (
              <StatRow key={row.label} label={row.label} value={row.value} bold={false} />
            ))}
          </Card>

          <button
            type="button"
            className="mt-3 w-full rounded-full border border-brand-pink/45 bg-white/60 px-4 py-2.5 text-center text-xs font-semibold text-brand-pink"
          >
            Ouvrir un litige
          </button>
        </div>

        <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-[linear-gradient(155deg,#171238_0%,#0A0D1C_55%,#25082A_100%)] p-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_380px_at_60%_44%,rgba(236,12,140,0.24),transparent_62%)]" />
          <span className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/15 bg-white/[0.06]" />
          <div className="relative">
            <Tag tone="pink">Arrive le {PROCHAIN_PRODUIT.arriveeLe}</Tag>
            <p className="mt-2.5 text-3xl font-semibold tracking-tight">{PROCHAIN_PRODUIT.nom}</p>
            <p className="mt-1 max-w-md text-xs text-white/60">{PROCHAIN_PRODUIT.note}</p>
            <Link
              href="/dashboard/produits?tab=catalogue"
              className="mt-4 inline-block rounded-full border border-white/20 bg-black/40 px-4 py-2.5 text-xs font-semibold backdrop-blur-md"
            >
              Voir les produits disponibles en drop
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
