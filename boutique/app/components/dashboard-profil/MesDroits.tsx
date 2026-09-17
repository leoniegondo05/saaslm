"use client";

import { SectionHeader, texteAvecChiffres } from "../dashboard-accueil/shared";
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

  Refonte visuelle (demandée par l'utilisateur, le rendu "tableau plat"
  d'origine jugé trop terne) : bannière de rôle façon MonProfil.tsx (même
  dégradé rose→indigo→marine, cf. [[charte-graphique-livre-moi]]), cartes
  de rôle avec icône avant la matrice, et permissions regroupées par
  catégorie (Commandes, Stock, Finances, Administration, Support) au lieu
  d'une liste plate de 11 lignes — plus facile à parcourir visuellement.
*/

type RoleKey = "administrateur" | "finances" | "commandes" | "stock";

const ROLES: { key: RoleKey; label: string; labelEn: string; sub: string; subEn: string; icon: React.ReactNode }[] = [
  { key: "administrateur", label: "Administrateur", labelEn: "Administrator", sub: "Le propriétaire · vous", subEn: "The owner · you", icon: <ShieldIcon /> },
  { key: "finances", label: "Finances", labelEn: "Finances", sub: "1 personne", subEn: "1 person", icon: <WalletIcon /> },
  { key: "commandes", label: "Commandes", labelEn: "Orders", sub: "2 personnes", subEn: "2 people", icon: <TruckIcon /> },
  { key: "stock", label: "Stock", labelEn: "Stock", sub: "1 personne", subEn: "1 person", icon: <BoxIcon /> },
];

type CategoryKey = "commandes" | "stock" | "finances" | "administration" | "support";

const CATEGORIES: { key: CategoryKey; label: string; labelEn: string; icon: React.ReactNode }[] = [
  { key: "commandes", label: "Commandes", labelEn: "Orders", icon: <TruckIcon /> },
  { key: "stock", label: "Stock & produits", labelEn: "Stock & products", icon: <BoxIcon /> },
  { key: "finances", label: "Finances", labelEn: "Finances", icon: <WalletIcon /> },
  { key: "administration", label: "Administration", labelEn: "Administration", icon: <ShieldIcon /> },
  { key: "support", label: "Support", labelEn: "Support", icon: <QuestionIcon /> },
];

const PERMISSIONS: { label: string; labelEn: string; category: CategoryKey; access: Record<RoleKey, boolean> }[] = [
  {
    label: "Voir et gérer les commandes",
    labelEn: "View and manage orders",
    category: "commandes",
    access: { administrateur: true, finances: false, commandes: true, stock: false },
  },
  {
    label: "Ouvrir un litige, poser une question",
    labelEn: "Open a dispute, ask a question",
    category: "commandes",
    access: { administrateur: true, finances: false, commandes: true, stock: true },
  },
  {
    label: "Voir l'état du stock",
    labelEn: "View stock status",
    category: "stock",
    access: { administrateur: true, finances: false, commandes: true, stock: true },
  },
  {
    label: "Déposer du stock",
    labelEn: "Deposit stock",
    category: "stock",
    access: { administrateur: true, finances: false, commandes: false, stock: true },
  },
  {
    label: "Ajouter et modifier des produits",
    labelEn: "Add and edit products",
    category: "stock",
    access: { administrateur: true, finances: false, commandes: false, stock: true },
  },
  {
    label: "Voir les prix d'achat et les marges",
    labelEn: "View cost prices and margins",
    category: "finances",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Voir les chiffres et les versements",
    labelEn: "View figures and payouts",
    category: "finances",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Demander un versement",
    labelEn: "Request a payout",
    category: "finances",
    access: { administrateur: true, finances: true, commandes: false, stock: false },
  },
  {
    label: "Créer et révoquer des accès",
    labelEn: "Create and revoke access",
    category: "administration",
    access: { administrateur: true, finances: false, commandes: false, stock: false },
  },
  {
    label: "Modifier les réglages de la boutique",
    labelEn: "Change shop settings",
    category: "administration",
    access: { administrateur: true, finances: false, commandes: false, stock: false },
  },
  {
    label: "Signaler un problème technique",
    labelEn: "Report a technical issue",
    category: "support",
    access: { administrateur: true, finances: true, commandes: true, stock: true },
  },
];

// Rôle de la personne connectée : sa colonne est mise en avant dans la
// grille. Vient de PROFIL.role côté MonProfil.tsx (mock, même remarque).
const MON_ROLE: RoleKey = "administrateur";

// Aplati catégories + permissions en une seule liste de lignes de tableau
// (plutôt que categories.map(cat => perms.map(...)) imbriqué) : évite
// d'avoir à retourner un <> sans clé par catégorie dans le tbody, React
// exige une clé sur chaque enfant direct d'une liste.
type Row =
  | { type: "category"; key: string; category: (typeof CATEGORIES)[number] }
  | { type: "perm"; key: string; perm: (typeof PERMISSIONS)[number]; lastOfCategory: boolean };

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const cat of CATEGORIES) {
    const perms = PERMISSIONS.filter((p) => p.category === cat.key);
    if (perms.length === 0) continue;
    rows.push({ type: "category", key: `cat-${cat.key}`, category: cat });
    perms.forEach((perm, i) => {
      rows.push({ type: "perm", key: `perm-${perm.label}`, perm, lastOfCategory: i === perms.length - 1 });
    });
  }
  return rows;
}

export default function MesDroits() {
  const { t } = useDashboardLangue();
  const monRole = ROLES.find((r) => r.key === MON_ROLE)!;
  const rows = buildRows();

  return (
    <>
      <SectionHeader
        eyebrow={t("Mon compte", "My account")}
        title={t("Mes droits", "My permissions")}
        subtitle={t("Les quatre rôles de la boutique et ce que chacun peut faire.", "The shop's four roles and what each one can do.")}
        first
        layout="inline"
      />

      {/* ── Bannière rôle actif, écho du style MonProfil ── */}
      <div className="overflow-hidden rounded-[32px] bg-[var(--dashboard-card-bg)] shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
        <div
          className="relative overflow-hidden p-5 sm:p-6"
          style={{
            backgroundImage: "linear-gradient(120deg, var(--color-brand-pink) 0%, var(--color-brand-purple) 62%, #011847 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
            aria-hidden
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white backdrop-blur-md">
              {monRole.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white/70">{t("Votre rôle", "Your role")}</p>
              <p className="text-lg font-bold text-white sm:text-xl">{t(monRole.label, monRole.labelEn)}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <CheckBadgeIcon />
              {t("Tout ouvert", "Everything open")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Cartes de rôle ── */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROLES.map((role) => {
          const actif = role.key === MON_ROLE;
          return (
            <div
              key={role.key}
              className={`rounded-2xl border p-4 transition ${
                actif
                  ? "border-brand-pink/40 bg-brand-pink/[0.06] shadow-[0_8px_20px_-10px_rgba(236,12,140,0.45)]"
                  : "border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)]"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  actif ? "bg-brand-pink/15 text-brand-pink" : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60"
                }`}
              >
                {role.icon}
              </span>
              <p className="mt-2.5 flex items-center gap-1.5 text-sm font-bold text-[var(--dashboard-text)]">
                {t(role.label, role.labelEn)}
                {actif && (
                  <span className="rounded-full bg-brand-pink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    {t("Vous", "You")}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/40">{texteAvecChiffres(t(role.sub, role.subEn))}</p>
            </div>
          );
        })}
      </div>

      {/* ── Matrice des permissions, groupée par catégorie ── */}
      <div className="mt-4 overflow-hidden rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink">
            <ListIcon />
          </span>
          <h2 className="text-base font-bold text-[var(--dashboard-text)]">{t("Ce que chacun peut faire", "What each role can do")}</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-[280px]" />
                {ROLES.map((role) => (
                  <th
                    key={role.key}
                    className={`px-3 pb-3 text-center align-bottom ${
                      role.key === MON_ROLE ? "rounded-t-2xl bg-brand-pink/[0.05]" : ""
                    }`}
                  >
                    <p className="text-xs font-bold text-[var(--dashboard-text)]">{t(role.label, role.labelEn)}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                row.type === "category" ? (
                  <tr key={row.key}>
                    <td colSpan={ROLES.length + 1} className="pb-2 pt-5 first:pt-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                          {row.category.icon}
                        </span>
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--dashboard-text)]/35">
                          {t(row.category.label, row.category.labelEn)}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.key} className="border-t border-[var(--dashboard-text)]/[0.06]">
                    <td className="py-3 pr-4 text-sm text-[var(--dashboard-text)]/80">{t(row.perm.label, row.perm.labelEn)}</td>
                    {ROLES.map((role) => (
                      <td
                        key={role.key}
                        className={`px-3 py-3 text-center ${
                          role.key === MON_ROLE
                            ? `bg-brand-pink/[0.05] ${row.lastOfCategory ? "rounded-b-2xl" : ""}`
                            : ""
                        }`}
                      >
                        <AccessDot allowed={row.perm.access[role.key]} />
                      </td>
                    ))}
                  </tr>
                )
              )}
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

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="2.5" y="7" width="11" height="9" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 10h3.7l3.3 3.3V16h-7v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.5 8v9L12 21.5m0-9v9m8.5-13.5v9L12 21.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.5c0-1.5 1.1-2.5 2.5-2.5s2.5.9 2.5 2.2c0 1.3-1 1.8-1.8 2.3-.7.4-1.1.9-1.1 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M8 6.5h12M8 12h12M8 17.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="4" cy="6.5" r="1.1" fill="currentColor" />
      <circle cx="4" cy="12" r="1.1" fill="currentColor" />
      <circle cx="4" cy="17.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.3 12.2 2.4 2.4 5-5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
