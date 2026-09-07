"use client";

import { SectionHeader } from "../dashboard-accueil/shared";

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
  DashboardHeader → /dashboard/parametres).

  Effectifs par rôle et matrice de droits statiques pour l'instant, cf.
  mémoire [[dashboard-mock-data-pending-laravel-api]] — cohérents avec les
  collaborateurs listés dans dashboard-parametres/PersonnelAcces.tsx
  (Fatou Silué = Finances, Yao Pacôme + Ismaël Traoré = Commandes,
  Nadège Ouattara = Stock) ; à remplacer par les vrais comptes et droits
  dès que l'API Laravel les exposera.
*/

type RoleKey = "administrateur" | "finances" | "commandes" | "stock";

const ROLES: { key: RoleKey; label: string; sub: string }[] = [
  { key: "administrateur", label: "Administrateur", sub: "Le propriétaire · vous" },
  { key: "finances", label: "Finances", sub: "1 personne" },
  { key: "commandes", label: "Commandes", sub: "2 personnes" },
  { key: "stock", label: "Stock", sub: "1 personne" },
];

const PERMISSIONS: { label: string; access: Record<RoleKey, boolean> }[] = [
  {
    label: "Voir et gérer les commandes",
    access: { administrateur: true, finances: false, commandes: true, stock: false },
  },
  {
    label: "Ouvrir un litige, poser une question",
    access: { administrateur: true, finances: false, commandes: true, stock: true },
  },
  {
    label: "Signaler un problème technique",
    access: { administrateur: true, finances: true, commandes: true, stock: true },
  },
  {
    label: "Voir l'état du stock",
    access: { administrateur: true, finances: false, commandes: true, stock: true },
  },
  {
    label: "Déposer du stock",
    access: { administrateur: true, finances: false, commandes: false, stock: true },
  },
  {
    label: "Ajouter et modifier des produits",
    access: { administrateur: true, finances: false, commandes: false, stock: true },
  },
  {
    label: "Voir les prix d'achat et les marges",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Voir les chiffres et les versements",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Demander un versement",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Créer et révoquer des accès",
    access: { administrateur: true, finances: false, commandes: false, stock: false },
  },
  {
    label: "Modifier les réglages de la boutique",
    access: { administrateur: true, finances: false, commandes: false, stock: false },
  },
];

// Rôle de la personne connectée : sa colonne est mise en avant dans la
// grille. Vient de PROFIL.role côté MonProfil.tsx (mock, même remarque).
const MON_ROLE: RoleKey = "administrateur";

export default function MesDroits() {
  return (
    <>
      <SectionHeader
        eyebrow="Mon compte"
        title="Mes droits"
        subtitle="Les quatre rôles de la boutique et ce que chacun peut faire."
        count="Administrateur · tout ouvert"
        first
        layout="inline"
      />

      <div className="overflow-hidden rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:p-6">
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
                    <p className="text-sm font-bold text-[var(--dashboard-text)]">{role.label}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/40">{role.sub}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, i) => (
                <tr key={perm.label} className="border-t border-[var(--dashboard-text)]/[0.06]">
                  <td className="py-3.5 pr-4 text-sm text-[var(--dashboard-text)]/80">{perm.label}</td>
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
          Quatre rôles, fixés par la plateforme. Ils ne se créent pas et ne se renomment pas :
          une boutique qui invente ses propres rôles finit avec{" "}
          <span className="font-semibold text-brand-pink">
            des droits que personne ne sait plus expliquer
          </span>
          . L&apos;administrateur peut en revanche{" "}
          <span className="font-semibold text-brand-purple">
            retirer des pages à quelqu&apos;un à l&apos;intérieur de son rôle
          </span>
          .
        </p>
      </div>
    </>
  );
}

function AccessDot({ allowed }: { allowed: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
        allowed ? "bg-[#dcf5e3] text-[#178a3f]" : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/25"
      }`}
      aria-label={allowed ? "Autorisé" : "Non autorisé"}
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
