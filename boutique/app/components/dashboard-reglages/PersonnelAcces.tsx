"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Divider, SectionHeader, Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran "Gérer les accès" (/dashboard/reglages/acces), atteint depuis le
  bouton du même nom dans le menu du compte (voir DashboardHeader). Reprend
  l'ancien écran 07 "Personnel et accès" (git : PersonnelAcces.tsx avant son
  retrait du 2026-09-07, cf. commentaire dans DashboardHeader) : la fiche
  d'identité de la personne connectée et la liste dépliable des
  collaborateurs de la boutique.

  Différence avec l'ancienne version : le formulaire de création n'est plus
  une 3e colonne encastrée ici — c'est son propre écran, plus détaillé,
  atteint via le bouton "Créer un collaborateur" ci-dessous
  (CreerCollaborateur.tsx, /dashboard/reglages/creer).

  Chiffres et comptes statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] — à brancher sur l'API Laravel
  quand elle exposera la gestion du personnel (création de compte,
  révocation, code à scanner généré à la première connexion...). Cohérent
  avec la matrice de rôles de MesDroits.tsx (dashboard-profil) : Fatou
  Silué = Finances, Yao Pacôme + Ismaël Traoré = Commandes, Nadège
  Ouattara = Stock.
*/

type Statut = { label: string; labelEn: string; tone: "ok" | "warn" | "ko" | "neutral" };

type Collaborateur = {
  nom: string;
  role: string;
  roleEn: string;
  email: string;
  statut: Statut;
  expire: string;
  expireEn: string;
  couleur: string;
  details?: {
    creeLe: string;
    premiereConnexion: string;
    derniereConnexion: string;
    motDePasseChange: string;
    motDePasseChangeEn: string;
    codeRenouvele: string;
    codeRenouveleEn: string;
    pages: string[];
    pagesEn: string[];
  };
};

const COLLABORATEURS: Collaborateur[] = [
  {
    nom: "Fatou Silué",
    role: "Comptable",
    roleEn: "Accountant",
    email: "f.silue@awabeaute.ci",
    statut: { label: "Active", labelEn: "Active", tone: "ok" },
    expire: "12 sept.",
    expireEn: "Sep 12",
    couleur: "linear-gradient(140deg,#3ED8A5,#0B6B4F)",
    details: {
      creeLe: "2 avril 2026",
      premiereConnexion: "2 avril · 14 h 20",
      derniereConnexion: "Hier · 17 h 05",
      motDePasseChange: "Oui",
      motDePasseChangeEn: "Yes",
      codeRenouvele: "1 fois",
      codeRenouveleEn: "Once",
      pages: ["Ma journée", "Finances", "Accueil · finances seules"],
      pagesEn: ["My day", "Finances", "Home · finances only"],
    },
  },
  {
    nom: "Ismaël Traoré",
    role: "Admin",
    roleEn: "Admin",
    email: "i.traore@awabeaute.ci",
    statut: { label: "Actif", labelEn: "Active", tone: "ok" },
    expire: "30 sept.",
    expireEn: "Sep 30",
    couleur: "linear-gradient(140deg,#2F6BE0,#011847)",
    details: {
      creeLe: "20 janv. 2026",
      premiereConnexion: "20 janv. · 9 h 10",
      derniereConnexion: "Aujourd'hui · 8 h 42",
      motDePasseChange: "Oui",
      motDePasseChangeEn: "Yes",
      codeRenouvele: "2 fois",
      codeRenouveleEn: "Twice",
      pages: ["Ma journée", "Finances", "Commandes", "Stock et dépôts", "Produits", "Litiges"],
      pagesEn: ["My day", "Finances", "Orders", "Stock and warehouses", "Products", "Disputes"],
    },
  },
  {
    nom: "Yao Pacôme",
    role: "Responsable commandes",
    roleEn: "Orders manager",
    email: "y.pacome@awabeaute.ci",
    statut: { label: "Expire dans 3 jours", labelEn: "Expires in 3 days", tone: "warn" },
    expire: "2 sept.",
    expireEn: "Sep 2",
    couleur: "linear-gradient(140deg,#FFB020,#8A5A00)",
    details: {
      creeLe: "5 juin 2026",
      premiereConnexion: "5 juin · 11 h 30",
      derniereConnexion: "Hier · 19 h 15",
      motDePasseChange: "Oui",
      motDePasseChangeEn: "Yes",
      codeRenouvele: "Aucune",
      codeRenouveleEn: "None",
      pages: ["Ma journée", "Commandes"],
      pagesEn: ["My day", "Orders"],
    },
  },
  {
    nom: "Nadège Ouattara",
    role: "Responsable stock",
    roleEn: "Stock manager",
    email: "n.ouattara@awabeaute.ci",
    statut: { label: "Jamais connectée", labelEn: "Never logged in", tone: "neutral" },
    expire: "20 sept.",
    expireEn: "Sep 20",
    couleur: "linear-gradient(140deg,#A279FF,#2A1466)",
    details: {
      creeLe: "20 août 2026",
      premiereConnexion: "Jamais",
      derniereConnexion: "Jamais",
      motDePasseChange: "Non",
      motDePasseChangeEn: "No",
      codeRenouvele: "Aucune",
      codeRenouveleEn: "None",
      pages: ["Ma journée", "Stock et dépôts"],
      pagesEn: ["My day", "Stock and warehouses"],
    },
  },
  {
    nom: "Aya Diomandé",
    role: "Ancienne responsable stock",
    roleEn: "Former stock manager",
    email: "",
    statut: { label: "Révoquée", labelEn: "Revoked", tone: "ko" },
    expire: "Révoquée le 18 août",
    expireEn: "Revoked Aug 18",
    couleur: "",
    details: {
      creeLe: "3 févr. 2026",
      premiereConnexion: "3 févr. · 10 h 05",
      derniereConnexion: "17 août · 16 h 40",
      motDePasseChange: "Oui",
      motDePasseChangeEn: "Yes",
      codeRenouvele: "1 fois",
      codeRenouveleEn: "Once",
      pages: ["Ma journée", "Stock et dépôts"],
      pagesEn: ["My day", "Stock and warehouses"],
    },
  },
];

const ETAPES = [
  { titre: "1 · Créer le compte", titreEn: "1 · Create the account", note: "Nom, rôle, pages accessibles et date d'expiration.", noteEn: "Name, role, accessible pages and expiry date." },
  { titre: "2 · Communiquer les accès", titreEn: "2 · Share the access", note: "Une adresse de connexion et un mot de passe, transmis par le propriétaire.", noteEn: "A login address and a password, sent by the owner." },
  { titre: "3 · Première connexion", titreEn: "3 · First login", note: "Le collaborateur entre les deux et change son mot de passe.", noteEn: "The team member enters both and changes their password." },
  { titre: "4 · Son code apparaît", titreEn: "4 · Their code appears", note: "Il obtient son propre code à scanner, valable jusqu'à la date fixée.", noteEn: "They get their own scannable code, valid until the set date." },
];

export default function PersonnelAcces({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [ouvert, setOuvert] = useState(0);
  const actifs = COLLABORATEURS.filter((c) => c.statut.tone !== "ko").length;

  return (
    <>
      <SectionHeader
        eyebrow={t("Réglages", "Settings")}
        title={t("Gérer les accès", "Manage access")}
        subtitle={t("Vos collaborateurs, leurs droits, et la création d'un nouveau compte.", "Your team members, their permissions, and creating a new account.")}
        first={first}
        layout="inline"
      />

      <div className="grid items-start gap-4 min-[1100px]:grid-cols-[320px_1fr]">
        {/* Colonne 1 : créer un collaborateur */}
        <div>
          <div className="rounded-2xl card-tint p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
              <PersonPlusIcon large />
            </span>
            <p className="mt-3.5 text-base font-bold tracking-tight">{t("Créer un collaborateur", "Create a team member")}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--dashboard-text)]/60">
              {t(
                "Nom, rôle, pages accessibles et date d'expiration : ses accès partent tout seuls dès la création.",
                "Name, role, accessible pages and expiry date: their access is sent automatically as soon as the account is created."
              )}
            </p>
            <Divider />
            <Link
              href="/dashboard/reglages/creer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#141220] px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
            >
              <PersonPlusIcon />
              {t("Créer un collaborateur", "Create a team member")}
            </Link>
          </div>
        </div>

        {/* Colonne 2 : liste du personnel */}
        <div>
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
              {t("Personnel de la boutique", "Shop staff")} · {texteAvecChiffres(t(`${actifs} comptes actifs`, `${actifs} active accounts`))}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {COLLABORATEURS.map((c, i) => {
              const open = ouvert === i && !!c.details;
              return (
                <div
                  key={c.nom}
                  className={`overflow-hidden rounded-2xl card-tint shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] transition ${
                    open ? "ring-1 ring-brand-pink/30" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => c.details && setOuvert(open ? -1 : i)}
                    disabled={!c.details}
                    className="flex w-full items-center gap-3 p-3.5 text-left disabled:cursor-default"
                  >
                    <span
                      className="h-9 w-9 shrink-0 rounded-full"
                      style={{ background: c.couleur || "color-mix(in srgb, var(--dashboard-text) 6%, transparent)" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{c.nom}</span>
                      <span className="block truncate text-[11px] text-[var(--dashboard-text)]/50">
                        {t(c.role, c.roleEn)}
                        {c.email && ` · ${c.email}`}
                      </span>
                    </span>
                    <Tag tone={c.statut.tone}>{texteAvecChiffres(t(c.statut.label, c.statut.labelEn))}</Tag>
                    <span className="hidden text-right sm:block">
                      <span className="block text-[9px] text-[var(--dashboard-text)]/40">
                        {c.statut.tone === "ko" ? "" : t("Expire le", "Expires on")}
                      </span>
                      <span className="block text-xs font-semibold">{texteAvecChiffres(t(c.expire, c.expireEn))}</span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`h-3.5 w-3.5 shrink-0 text-[var(--dashboard-text)]/40 transition-transform ${open ? "rotate-90" : ""}`}
                    >
                      <path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {open && c.details && (
                    <div className="border-t border-[var(--dashboard-text)]/[0.06] bg-[color-mix(in_srgb,var(--dashboard-text)_2%,transparent)] p-3.5">
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 min-[1360px]:grid-cols-5">
                        <DetailTile label={t("Compte créé le", "Account created on")} value={c.details.creeLe} />
                        <DetailTile label={t("Première connexion", "First login")} value={c.details.premiereConnexion} />
                        <DetailTile label={t("Dernière connexion", "Last login")} value={c.details.derniereConnexion} />
                        <DetailTile label={t("Mot de passe changé", "Password changed")} value={t(c.details.motDePasseChange, c.details.motDePasseChangeEn)} />
                        <DetailTile label={t("Code renouvelé", "Code renewed")} value={t(c.details.codeRenouvele, c.details.codeRenouveleEn)} />
                      </div>
                      <Divider />
                      <p className="mb-1.5 text-[10px] text-[var(--dashboard-text)]/40">{t("Pages accessibles", "Accessible pages")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.details.pages.map((p, pi) => (
                          <Tag key={p} tone={pi % 2 === 0 ? "dark" : "ok"}>{t(p, c.details!.pagesEn[pi])}</Tag>
                        ))}
                      </div>
                      <Divider />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink">
                          {t("Modifier les droits", "Edit permissions")}
                        </button>
                        <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink">
                          {t("Prolonger la validité", "Extend validity")}
                        </button>
                        <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink">
                          {t("Réinitialiser le mot de passe", "Reset password")}
                        </button>
                        <button type="button" className="rounded-full border border-[#c8262d]/30 px-3.5 py-2 text-xs font-semibold text-[#c8262d]">
                          {t("Révoquer l'accès", "Revoke access")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Card title={t("Comment se passe l'arrivée d'un collaborateur", "How a team member's arrival works")} titleTab className="mt-3">
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ETAPES.map((e) => (
                <div key={e.titre}>
                  <p className="inline-block rounded-md px-3 py-1.5 text-[10px] font-semibold" style={{ background: "var(--dashboard-surface-2)" }}>
                    {texteAvecChiffres(t(e.titre, e.titreEn))}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/70">{t(e.note, e.noteEn)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl card-tint p-3 text-center shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-1.5 text-sm font-bold">{texteAvecChiffres(value)}</p>
    </div>
  );
}

function PersonPlusIcon({ large = false }: { large?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={large ? "h-5 w-5" : "h-3.5 w-3.5"} aria-hidden>
      <circle cx="9.5" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19.5c.9-3.3 3.2-5.2 6-5.2s5.1 1.9 6 5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18.5 8v5.5M15.75 10.75h5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
