"use client";

import { useState } from "react";
import { Card, openBrandedReport, SectionHeader, Tag } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran 30 "Réglages · confidentialité" : qui voit les données des
  clients, ce que le client voit toujours de la boutique, et les deux
  gestes concrets — exporter tout, ou effacer un client à sa demande.
  Champs statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

const INFOS_TOUJOURS_AFFICHEES = [
  {
    titre: "Le nom de la boutique",
    titreEn: "The shop name",
    note: "Sur la page, le reçu et le colis",
    noteEn: "On the page, the receipt and the parcel",
  },
  {
    titre: "Votre numéro de téléphone",
    titreEn: "Your phone number",
    note: "Pour vous joindre directement",
    noteEn: "To reach you directly",
  },
  {
    titre: "Votre adresse email",
    titreEn: "Your email address",
    note: "Pour vous écrire",
    noteEn: "To write to you",
  },
  {
    titre: "Votre localisation",
    titreEn: "Your location",
    note: "La commune où se trouve la boutique",
    noteEn: "The district where the shop is located",
  },
];

export default function Confidentialite({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();

  // "Exporter tout ce que je possède" : produits, commandes, clients,
  // règlements — un fichier par bloc plutôt qu'un CSV unique, plus lisible
  // une fois ouvert dans un tableur. Chiffres mock en attendant l'API
  // Laravel, cf. [[dashboard-mock-data-pending-laravel-api]] — les mêmes
  // que les sections Produits/Commandes/Clients/Finances de l'Accueil.
  const [exportDone, setExportDone] = useState(false);
  function handleExport() {
    openBrandedReport(t("Vos données", "Your data"), "Groupe Logistique Ivoire", [
      {
        heading: t("Produits", "Products"),
        rows: [
          [t("Références au catalogue", "Items in catalog"), "8"],
          [t("Valeur du stock", "Stock value"), "1 842 000 F"],
        ],
      },
      {
        heading: t("Commandes", "Orders"),
        rows: [
          [t("Commandes reçues sur la période", "Orders received this period"), "148"],
          [t("Livrées et payées", "Delivered and paid"), "119"],
        ],
      },
      {
        heading: t("Clients", "Customers"),
        rows: [[t("Clients au fichier", "Customers on file"), "387"]],
      },
      {
        heading: t("Règlements", "Payouts"),
        rows: [
          [t("Solde du sous-compte", "Sub-account balance"), "1 482 300 F"],
          [t("Disponible tout de suite", "Available right away"), "1 022 800 F"],
        ],
      },
      {
        heading: t("À savoir", "Note"),
        rows: [
          [
            t(
              "Export résumé — le détail ligne par ligne (chaque commande, chaque client) arrivera avec l'API Laravel.",
              "Summary export — line-by-line detail (each order, each customer) will arrive with the Laravel API."
            ),
          ],
        ],
      },
    ]);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  return (
    <>
      <SectionHeader
        eyebrow={t("Confidentialité", "Privacy")}
        title={t("Vos clients, vos données", "Your customers, your data")}
        subtitle={t(
          "Qui voit quoi, ce que le client voit de vous, exporter ou effacer.",
          "Who sees what, what the customer sees of you, export or erase."
        )}
        first={first}
        layout="inline"
      />

      <div className="grid gap-3">
        <Card
          title={t("Qui voit les données de vos clients", "Who sees your customers' data")}
          titleTab
          badge={<Tag tone="ok">{t("Aucun partage commercial", "No commercial sharing")}</Tag>}
          className="!bg-[var(--dashboard-card-bg)]"
        >
          <div className="divide-y divide-[var(--dashboard-text)]/10">
            <div className="flex items-center gap-3 py-2.5 first:pt-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-pink/10 text-brand-pink">
                <PersonIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Vous et vos collaborateurs", "You and your team members")}</p>
                <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">{t("Selon le rôle de chacun", "Depending on each person's role")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2.5 last:pb-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                <PersonIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--dashboard-text)]">Groupe Logistique Ivoire</p>
                <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
                  {t("Le nom, le téléphone et l'adresse, le temps de livrer", "The name, phone number and address, for as long as delivery takes")}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Vos clients vous appartiennent. Votre partenaire agréé ne peut pas leur écrire, leur vendre quoi que ce soit, ni transmettre leur liste à une autre boutique.",
              "Your customers belong to you. Your approved partner cannot contact them, sell them anything, or pass their list on to another shop."
            )}
          </p>
        </Card>

        <Card
          title={t("Ce que le client voit de vous", "What the customer sees of you")}
          titleTab
          badge={<Tag tone="warn">{t("Non modifiable ici", "Not editable here")}</Tag>}
          className="!bg-[var(--dashboard-card-bg)]"
        >
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Quatre informations sont affichées sur votre page de commande et ne se décochent pas. Un client doit pouvoir vous identifier et vous joindre avant de payer : c'est ce qui distingue une vraie boutique d'une page montée en une nuit.",
              "Four pieces of information are shown on your order page and cannot be unchecked. A customer must be able to identify and reach you before paying: that's what sets a real shop apart from a page thrown together overnight."
            )}
          </p>
          <div className="mt-3 space-y-2">
            {INFOS_TOUJOURS_AFFICHEES.map(({ titre, titreEn, note, noteEn }) => (
              <div
                key={titre}
                className="flex items-center gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcf5e3] text-[#178a3f]">
                  <CheckIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{t(titre, titreEn)}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">{t(note, noteEn)}</p>
                </div>
                <Tag tone="neutral" className="shrink-0">
                  {t("Toujours affiché", "Always shown")}
                </Tag>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">
            {t("Ces quatre informations ont été renseignées à l'enregistrement de votre boutique. Pour les corriger, passez par la fiche", "These four details were entered when your shop was registered. To correct them, go to the")}{" "}
            <b className="font-bold text-[var(--dashboard-text)]">{t("Ma boutique", "My shop")}</b>{" "}
            {t(": elles y sont modifiables, mais jamais masquables.", "tab: they can be edited there, but never hidden.")}
          </p>
        </Card>

        <Card title={t("Vos données", "Your data")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-md">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Exporter tout ce que je possède", "Export everything I own")}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
                {t(
                  "Produits, commandes, clients, règlements. Un fichier lisible dans un tableur, qui reste utilisable si vous quittez la plateforme.",
                  "Products, orders, customers, payouts. A spreadsheet-readable file that stays usable if you leave the platform."
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-5 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              {exportDone ? t("Exporté", "Exported") : t("Exporter", "Export")}
            </button>
          </div>

          <div className="my-4 h-px bg-[var(--dashboard-text)]/10" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-md">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Effacer un client à sa demande", "Erase a customer on request")}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
                {t(
                  "Son nom, son téléphone et son adresse disparaissent de toutes vos commandes. Les montants restent, sans nom : vos chiffres ne bougent pas.",
                  "Their name, phone number and address disappear from all your orders. The amounts remain, without a name: your figures don't change."
                )}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-5 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              {t("Rechercher un client", "Search for a customer")}
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
