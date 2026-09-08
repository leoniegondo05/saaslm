"use client";

import { Card, Tag, SectionHeader } from "../dashboard-accueil/shared";

/*
  Écran 30 "Réglages · confidentialité" : qui voit les données des
  clients, ce que le client voit toujours de la boutique, et les deux
  gestes concrets — exporter tout, ou effacer un client à sa demande.
  Champs statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

const INFOS_TOUJOURS_AFFICHEES = [
  { titre: "Le nom de la boutique", note: "Sur la page, le reçu et le colis" },
  { titre: "Votre numéro de téléphone", note: "Pour vous joindre directement" },
  { titre: "Votre adresse email", note: "Pour vous écrire" },
  { titre: "Votre localisation", note: "La commune où se trouve la boutique" },
];

export default function Confidentialite({ first = false }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Confidentialité"
        title="Vos clients, vos données"
        subtitle="Qui voit quoi, ce que le client voit de vous, exporter ou effacer."
        first={first}
        layout="inline"
      />

      <div className="grid gap-3">
        <Card
          title="Qui voit les données de vos clients"
          titleTab
          badge={<Tag tone="ok">Aucun partage commercial</Tag>}
          className="!bg-[var(--dashboard-card-bg)]"
        >
          <div className="divide-y divide-[var(--dashboard-text)]/10">
            <div className="flex items-center gap-3 py-2.5 first:pt-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-pink/10 text-brand-pink">
                <PersonIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--dashboard-text)]">Vous et vos collaborateurs</p>
                <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">Selon le rôle de chacun</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2.5 last:pb-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                <PersonIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--dashboard-text)]">Groupe Logistique Ivoire</p>
                <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
                  Le nom, le téléphone et l&apos;adresse, le temps de livrer
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            Vos clients vous appartiennent. Votre partenaire agréé ne peut pas leur écrire, leur
            vendre quoi que ce soit, ni transmettre leur liste à une autre boutique.
          </p>
        </Card>

        <Card
          title="Ce que le client voit de vous"
          titleTab
          badge={<Tag tone="warn">Non modifiable ici</Tag>}
          className="!bg-[var(--dashboard-card-bg)]"
        >
          <p className="text-xs text-[var(--dashboard-text)]/50">
            Quatre informations sont affichées sur votre page de commande et ne se décochent pas.
            Un client doit pouvoir vous identifier et vous joindre avant de payer : c&apos;est ce
            qui distingue une vraie boutique d&apos;une page montée en une nuit.
          </p>
          <div className="mt-3 space-y-2">
            {INFOS_TOUJOURS_AFFICHEES.map(({ titre, note }) => (
              <div
                key={titre}
                className="flex items-center gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcf5e3] text-[#178a3f]">
                  <CheckIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{titre}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">{note}</p>
                </div>
                <Tag tone="neutral" className="shrink-0">
                  Toujours affiché
                </Tag>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            Ces quatre informations ont été renseignées à l&apos;enregistrement de votre boutique.
            Pour les corriger, passez par la fiche <b className="font-bold text-[var(--dashboard-text)]">Ma boutique</b> : elles y sont
            modifiables, mais jamais masquables.
          </p>
        </Card>

        <Card title="Vos données" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-md">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">Exporter tout ce que je possède</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
                Produits, commandes, clients, règlements. Un fichier lisible dans un tableur, qui
                reste utilisable si vous quittez la plateforme.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-5 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              Exporter
            </button>
          </div>

          <div className="my-4 h-px bg-[var(--dashboard-text)]/10" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-md">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">Effacer un client à sa demande</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
                Son nom, son téléphone et son adresse disparaissent de toutes vos commandes. Les
                montants restent, sans nom : vos chiffres ne bougent pas.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-5 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              Rechercher un client
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <circle cx="12" cy="8.4" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.6c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="m6 12.5 4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
