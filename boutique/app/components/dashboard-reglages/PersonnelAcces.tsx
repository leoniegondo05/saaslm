"use client";

import { useState } from "react";
import Link from "next/link";
import { Divider, MiniTile, SectionHeader, Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
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
  /** Part de la période de validité qui reste (0-100) : porte la barre sous chaque carte, absente pour un accès révoqué. */
  validitePct?: number;
  details?: {
    creeLe: string;
    creeLeEn: string;
    premiereConnexion: string;
    premiereConnexionEn: string;
    derniereConnexion: string;
    derniereConnexionEn: string;
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
    validitePct: 62,
    details: {
      creeLe: "2 avril 2026",
      creeLeEn: "April 2, 2026",
      premiereConnexion: "2 avril · 14 h 20",
      premiereConnexionEn: "April 2 · 14:20",
      derniereConnexion: "Hier · 17 h 05",
      derniereConnexionEn: "Yesterday · 17:05",
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
    validitePct: 74,
    details: {
      creeLe: "20 janv. 2026",
      creeLeEn: "Jan 20, 2026",
      premiereConnexion: "20 janv. · 9 h 10",
      premiereConnexionEn: "Jan 20 · 9:10",
      derniereConnexion: "Aujourd'hui · 8 h 42",
      derniereConnexionEn: "Today · 8:42",
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
    validitePct: 6,
    details: {
      creeLe: "5 juin 2026",
      creeLeEn: "June 5, 2026",
      premiereConnexion: "5 juin · 11 h 30",
      premiereConnexionEn: "June 5 · 11:30",
      derniereConnexion: "Hier · 19 h 15",
      derniereConnexionEn: "Yesterday · 19:15",
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
    validitePct: 35,
    details: {
      creeLe: "20 août 2026",
      creeLeEn: "Aug 20, 2026",
      premiereConnexion: "Jamais",
      premiereConnexionEn: "Never",
      derniereConnexion: "Jamais",
      derniereConnexionEn: "Never",
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
      creeLeEn: "Feb 3, 2026",
      premiereConnexion: "3 févr. · 10 h 05",
      premiereConnexionEn: "Feb 3 · 10:05",
      derniereConnexion: "17 août · 16 h 40",
      derniereConnexionEn: "Aug 17 · 16:40",
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
  const bientot = COLLABORATEURS.filter((c) => c.statut.tone === "warn").length;
  const revoques = COLLABORATEURS.filter((c) => c.statut.tone === "ko").length;

  return (
    <>
      <SectionHeader
        eyebrow={t("Réglages", "Settings")}
        title={t("Gérer les accès", "Manage access")}
        subtitle={t("Vos collaborateurs, leurs droits, et la création d'un nouveau compte.", "Your team members, their permissions, and creating a new account.")}
        first={first}
        layout="inline"
      />

      {/* Vue d'ensemble : mêmes chiffres que la liste en dessous, juste lus d'un coup d'œil */}
      <div className="grid grid-cols-3 gap-2.5">
        <MiniTile
          label={t("Comptes actifs", "Active accounts")}
          value={String(actifs)}
          note={t(`sur ${COLLABORATEURS.length} au total`, `of ${COLLABORATEURS.length} total`)}
        />
        <MiniTile
          label={t("Expirent bientôt", "Expiring soon")}
          value={String(bientot)}
          note={t("accès à renouveler", "access to renew")}
        />
        <MiniTile
          label={t("Accès révoqués", "Revoked access")}
          value={String(revoques)}
          note={t("compte(s) retiré(s)", "account(s) removed")}
        />
      </div>

      <div className="mt-4 grid items-start gap-4 min-[1100px]:grid-cols-[320px_1fr]">
        {/* Colonne 1 : créer un collaborateur + comment ça marche */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/reglages/creer"
            className="group flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed border-brand-pink/30 bg-brand-pink/[0.04] p-6 text-center transition hover:border-brand-pink/50 hover:bg-brand-pink/[0.08]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink transition group-hover:scale-105">
              <PersonPlusIcon large />
            </span>
            <p className="text-base font-bold tracking-tight">{t("Créer un collaborateur", "Create a team member")}</p>
            <p className="text-xs leading-relaxed text-[var(--dashboard-text)]/60">
              {t(
                "Nom, rôle, pages accessibles et date d'expiration : ses accès partent tout seuls dès la création.",
                "Name, role, accessible pages and expiry date: their access is sent automatically as soon as the account is created."
              )}
            </p>
            <span className="mt-1 flex items-center gap-2 rounded-full bg-[#141220] px-4 py-2.5 text-xs font-semibold text-white transition group-hover:brightness-110 dark:bg-brand-pink">
              <PersonPlusIcon />
              {t("Nouveau badge d'accès", "New access badge")}
            </span>
          </Link>

          <div className="rounded-2xl card-tint p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
              {t("Comment se passe l'arrivée d'un collaborateur", "How a team member's arrival works")}
            </p>
            <div className="mt-3.5 flex flex-col">
              {ETAPES.map((e, i) => (
                <div key={e.titre} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < ETAPES.length - 1 && (
                    <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-[var(--dashboard-text)]/10" />
                  )}
                  <span className="z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-brand-pink text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-semibold">{t(e.titre.replace(/^\d+\s*·\s*/, ""), e.titreEn.replace(/^\d+\s*·\s*/, ""))}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[var(--dashboard-text)]/60">{t(e.note, e.noteEn)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne 2 : liste du personnel, une carte "badge" par collaborateur */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
            {t("Personnel de la boutique", "Shop staff")}
          </p>

          <div className="flex flex-col gap-2.5">
            {COLLABORATEURS.map((c, i) => {
              const open = ouvert === i && !!c.details;
              const revoque = c.statut.tone === "ko";
              return (
                <div
                  key={c.nom}
                  className={`relative overflow-hidden rounded-2xl card-tint shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] transition ${
                    open ? "ring-1 ring-brand-pink/30" : ""
                  } ${revoque ? "opacity-70" : ""}`}
                >
                  {/* Liseré couleur du collaborateur — même teinte que son avatar, façon tranche de badge d'accès */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1"
                    style={{
                      background: revoque
                        ? "repeating-linear-gradient(45deg, color-mix(in srgb, var(--dashboard-text) 25%, transparent) 0 4px, transparent 4px 8px)"
                        : c.couleur || "color-mix(in srgb, var(--dashboard-text) 20%, transparent)",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => c.details && setOuvert(open ? -1 : i)}
                    disabled={!c.details}
                    className="flex w-full items-center gap-3 py-3.5 pl-5 pr-3.5 text-left disabled:cursor-default"
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
                        {revoque ? "" : t("Expire le", "Expires on")}
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

                  {/* Validité restante avant expiration — jauge, pas juste une date en texte */}
                  {!revoque && typeof c.validitePct === "number" && (
                    <div className="ml-5 mr-3.5 mb-3.5 -mt-1.5 h-[3px] overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
                      <div className="h-full rounded-full" style={{ width: `${c.validitePct}%`, background: c.couleur }} />
                    </div>
                  )}

                  {open && c.details && (
                    <div className="border-t border-[var(--dashboard-text)]/[0.06] bg-[color-mix(in_srgb,var(--dashboard-text)_2%,transparent)] p-3.5">
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 min-[1360px]:grid-cols-5">
                        <DetailTile label={t("Compte créé le", "Account created on")} value={t(c.details.creeLe, c.details.creeLeEn)} />
                        <DetailTile label={t("Première connexion", "First login")} value={t(c.details.premiereConnexion, c.details.premiereConnexionEn)} />
                        <DetailTile label={t("Dernière connexion", "Last login")} value={t(c.details.derniereConnexion, c.details.derniereConnexionEn)} />
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
