"use client";

import { SectionHeader } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran "Mes droits", atteint depuis "Mes droits" dans le menu du compte
  (voir DashboardHeader) : la grille des quatre rôles fixes de la
  plateforme (Administrateur, Finances, Commandes, Stock) et, pour chacun,
  les actions qu'il permet — cf. maquette fournie.

  Rôles fixés par la plateforme (voir note en bas de page) : ni créés, ni
  renommés par la boutique. Seule la colonne du rôle de la personne
  connectée est mise en avant (ici Administrateur, cf. PROFIL.role dans
  MonProfil) et seul un administrateur peut retirer une page à quelqu'un à
  l'intérieur de son rôle (bouton "Gérer les accès", voir
  DashboardHeader → /dashboard/reglages).

  Effectifs par rôle et matrice de droits statiques pour l'instant, cf.
  mémoire [[dashboard-mock-data-pending-laravel-api]] — cohérents avec les
  collaborateurs listés dans dashboard-reglages/PersonnelAcces.tsx
  (Fatou Silué = Finances, Yao Pacôme + Ismaël Traoré = Commandes,
  Nadège Ouattara = Stock) ; à remplacer par les vrais comptes et droits
  dès que l'API Laravel les exposera.
*/

type RoleKey = "administrateur" | "finances" | "commandes" | "stock";

const ROLES: { key: RoleKey; label: string; labelEn: string; sub: string; subEn: string }[] = [
  { key: "administrateur", label: "Administrateur", labelEn: "Administrator", sub: "Le propriétaire · vous", subEn: "The owner · you" },
  { key: "finances", label: "Finances", labelEn: "Finances", sub: "1 personne", subEn: "1 person" },
  { key: "commandes", label: "Commandes", labelEn: "Orders", sub: "2 personnes", subEn: "2 people" },
  { key: "stock", label: "Stock", labelEn: "Stock", sub: "1 personne", subEn: "1 person" },
];

const PERMISSIONS: { label: string; labelEn: string; access: Record<RoleKey, boolean> }[] = [
  {
    label: "Voir et gérer les commandes",
    labelEn: "View and manage orders",
    access: { administrateur: true, finances: false, commandes: true, stock: false },
  },
  {
    label: "Ouvrir un litige, poser une question",
    labelEn: "Open a dispute, ask a question",
    access: { administrateur: true, finances: false, commandes: true, stock: true },
  },
  {
    label: "Signaler un problème technique",
    labelEn: "Report a technical issue",
    access: { administrateur: true, finances: true, commandes: true, stock: true },
  },
  {
    label: "Voir l'état du stock",
    labelEn: "View stock status",
    access: { administrateur: true, finances: false, commandes: true, stock: true },
  },
  {
    label: "Déposer du stock",
    labelEn: "Deposit stock",
    access: { administrateur: true, finances: false, commandes: false, stock: true },
  },
  {
    label: "Ajouter et modifier des produits",
    labelEn: "Add and edit products",
    access: { administrateur: true, finances: false, commandes: false, stock: true },
  },
  {
    label: "Voir les prix d'achat et les marges",
    labelEn: "View cost prices and margins",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Voir les chiffres et les versements",
    labelEn: "View figures and payouts",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Demander un versement",
    labelEn: "Request a payout",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Créer et révoquer des accès",
    labelEn: "Create and revoke access",
    access: { administrateur: true, finances: false, commandes: false, stock: false },
  },
  {
    label: "Modifier les réglages de la boutique",
    labelEn: "Change shop settings",
    access: { administrateur: true, finances: false, commandes: false, stock: false },
  },
];

// Rôle de la personne connectée : sa colonne est mise en avant dans la
// grille. Vient de PROFIL.role côté MonProfil.tsx (mock, même remarque).
const MON_ROLE: RoleKey = "administrateur";

export default function MesDroits() {
  const { t } = useDashboardLangue();
  return (
    <>
      <SectionHeader
        eyebrow={t("Mon compte", "My account")}
        title={t("Mes droits", "My permissions")}
        subtitle={t("Les quatre rôles de la boutique et ce que chacun peut faire.", "The shop's four roles and what each one can do.")}
        count={t("Administrateur · tout ouvert", "Administrator · everything open")}
        first
        layout="inline"
      />

      <div className="overflow-hidden rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-[280px]" />
                {ROLES.map((role) => (
                  <th
                    key={role.key}
                    className={`px-3 pb-4 text-center align-bottom ${
                      role.key === MON_ROLE ? "rounded-t-2xl bg-[var(--dashboard-text)]/[0.04]" : ""
                    }`}
                  >
                    <p className="text-sm font-bold text-[var(--dashboard-text)]">{t(role.label, role.labelEn)}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/40">{t(role.sub, role.subEn)}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, i) => (
                <tr key={perm.label} className="border-t border-[var(--dashboard-text)]/[0.06]">
                  <td className="py-3.5 pr-4 text-sm text-[var(--dashboard-text)]/80">{t(perm.label, perm.labelEn)}</td>
                  {ROLES.map((role) => (
                    <td
                      key={role.key}
                      className={`px-3 py-3.5 text-center ${
                        role.key === MON_ROLE
                          ? `bg-[var(--dashboard-text)]/[0.04] ${i === PERMISSIONS.length - 1 ? "rounded-b-2xl" : ""}`
                          : ""
                      }`}
                    >
                      <AccessDot allowed={perm.access[role.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 h-px bg-[var(--dashboard-text)]/10" />
        <p className="mt-4 text-xs leading-relaxed text-[var(--dashboard-text)]/50">
          {t("Quatre rôles, fixés par la plateforme. Ils ne se créent pas et ne se renomment pas : une boutique qui invente ses propres rôles finit avec", "Four roles, fixed by the platform. They can't be created or renamed: a shop that invents its own roles ends up with")}{" "}
          <span className="font-semibold text-brand-pink">
            {t("des droits que personne ne sait plus expliquer", "permissions no one can explain anymore")}
          </span>
          . {t("L'administrateur peut en revanche", "The administrator can, however,")}{" "}
          <span className="font-semibold text-brand-purple">
            {t("retirer des pages à quelqu'un à l'intérieur de son rôle", "remove pages from someone within their role")}
          </span>
          .
        </p>
      </div>
    </>
  );
}

function AccessDot({ allowed }: { allowed: boolean }) {
  const { t } = useDashboardLangue();
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
        allowed ? "bg-[#dcf5e3] text-[#178a3f]" : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/25"
      }`}
      aria-label={allowed ? t("Autorisé", "Allowed") : t("Non autorisé", "Not allowed")}
    >
      {allowed ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
          <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}
