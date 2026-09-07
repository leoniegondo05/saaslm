"use client";

import Link from "next/link";
import { useState } from "react";
import QrCode from "../QrCode";
import { Btn, Card, Divider, SectionHeader, Tag } from "../dashboard-accueil/shared";

/*
  Écran 07 "Personnel et accès" : la fiche d'identité de la personne
  connectée (même carte que sur "Ma journée", voir app/dashboard/page.tsx),
  la liste dépliable des collaborateurs de la boutique avec leurs droits, et
  le formulaire de création d'un nouveau compte. Atteint depuis l'icône
  "Réglages" du rail (voir DashboardSidebar).

  Chiffres et comptes statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] — à brancher sur l'API Laravel
  quand elle exposera la gestion du personnel (création de compte,
  révocation, code à scanner généré à la première connexion...).
*/

type Statut = { label: string; tone: "ok" | "warn" | "ko" | "neutral" };

type Collaborateur = {
  nom: string;
  role: string;
  email: string;
  statut: Statut;
  expire: string;
  couleur: string;
  details?: {
    creeLe: string;
    premiereConnexion: string;
    derniereConnexion: string;
    motDePasseChange: string;
    codeRenouvele: string;
    pages: string[];
  };
};

const MOI = {
  nom: "Awa Konan",
  role: "Propriétaire · Admin",
  email: "a.konan@awabeaute.ci",
  creeLe: "14 mars 2026",
  expireLe: "14 sept. 2026",
};

const COLLABORATEURS: Collaborateur[] = [
  {
    nom: "Fatou Silué",
    role: "Comptable",
    email: "f.silue@awabeaute.ci",
    statut: { label: "Active", tone: "ok" },
    expire: "12 sept.",
    couleur: "linear-gradient(140deg,#3ED8A5,#0B6B4F)",
    details: {
      creeLe: "2 avril 2026",
      premiereConnexion: "2 avril · 14 h 20",
      derniereConnexion: "Hier · 17 h 05",
      motDePasseChange: "Oui",
      codeRenouvele: "1 fois",
      pages: ["Ma journée", "Finances", "Accueil · finances seules"],
    },
  },
  {
    nom: "Ismaël Traoré",
    role: "Admin",
    email: "i.traore@awabeaute.ci",
    statut: { label: "Actif", tone: "ok" },
    expire: "30 sept.",
    couleur: "linear-gradient(140deg,#2F6BE0,#011847)",
    details: {
      creeLe: "20 janv. 2026",
      premiereConnexion: "20 janv. · 9 h 10",
      derniereConnexion: "Aujourd'hui · 8 h 42",
      motDePasseChange: "Oui",
      codeRenouvele: "2 fois",
      pages: ["Ma journée", "Finances", "Commandes", "Stock et dépôts", "Produits", "Litiges"],
    },
  },
  {
    nom: "Yao Pacôme",
    role: "Responsable commandes",
    email: "y.pacome@awabeaute.ci",
    statut: { label: "Expire dans 3 jours", tone: "warn" },
    expire: "2 sept.",
    couleur: "linear-gradient(140deg,#FFB020,#8A5A00)",
    details: {
      creeLe: "5 juin 2026",
      premiereConnexion: "5 juin · 11 h 30",
      derniereConnexion: "Hier · 19 h 15",
      motDePasseChange: "Oui",
      codeRenouvele: "Aucune",
      pages: ["Ma journée", "Commandes"],
    },
  },
  {
    nom: "Nadège Ouattara",
    role: "Responsable stock",
    email: "n.ouattara@awabeaute.ci",
    statut: { label: "Jamais connectée", tone: "neutral" },
    expire: "20 sept.",
    couleur: "linear-gradient(140deg,#A279FF,#2A1466)",
    details: {
      creeLe: "20 août 2026",
      premiereConnexion: "Jamais",
      derniereConnexion: "Jamais",
      motDePasseChange: "Non",
      codeRenouvele: "Aucune",
      pages: ["Ma journée", "Stock et dépôts"],
    },
  },
  {
    nom: "Aya Diomandé",
    role: "Ancienne responsable stock",
    email: "",
    statut: { label: "Révoquée", tone: "ko" },
    expire: "Révoquée le 18 août",
    couleur: "",
    details: {
      creeLe: "3 févr. 2026",
      premiereConnexion: "3 févr. · 10 h 05",
      derniereConnexion: "17 août · 16 h 40",
      motDePasseChange: "Oui",
      codeRenouvele: "1 fois",
      pages: ["Ma journée", "Stock et dépôts"],
    },
  },
];

const ETAPES = [
  { titre: "1 · Créer le compte", note: "Nom, rôle, pages accessibles et date d'expiration." },
  { titre: "2 · Communiquer les accès", note: "Une adresse de connexion et un mot de passe, transmis par le propriétaire." },
  { titre: "3 · Première connexion", note: "Le collaborateur entre les deux et change son mot de passe." },
  { titre: "4 · Son code apparaît", note: "Il obtient son propre code à scanner, valable jusqu'à la date fixée." },
];

// Réutilisé par le menu du compte (DashboardHeader) pour le badge
// "Gérer les accès", afin de ne pas dupliquer ce chiffre à la main.
export const PERSONNEL_ACTIF_COUNT = COLLABORATEURS.filter(
  (c) => c.statut.tone !== "ko",
).length;

export default function PersonnelAcces({ first = true }: { first?: boolean }) {
  const [ouvert, setOuvert] = useState(0);

  return (
    <>
      <SectionHeader
        eyebrow="Réglages"
        title="Personnel et accès"
        subtitle="Créer un collaborateur, lui envoyer ses accès, son code personnel."
        first={first}
        layout="inline"
      />

      <div className="grid items-start gap-4 min-[1360px]:grid-cols-[320px_1fr_300px] [&>*]:min-w-0">
        {/* Colonne 1 : mon identité */}
        <div>
          <div className="rounded-2xl bg-[var(--dashboard-card-bg)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">Mon identité</p>
              <Tag tone="dark">Valide 15 jours</Tag>
            </div>

            <div className="mt-3.5 flex items-start gap-3.5">
              <div className="h-[110px] w-[110px] shrink-0 overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 bg-white p-2">
                <QrCode value="https://liivremoi.com/id/awa-konan" className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold tracking-tight">{MOI.nom}</p>
                <p className="text-xs font-semibold text-brand-pink">{MOI.role}</p>
                <Divider />
                <p className="text-xs text-[var(--dashboard-text)]/50">Adresse de connexion</p>
                <p className="break-words text-xs font-semibold">{MOI.email}</p>
                <p className="mt-1.5 text-xs text-[var(--dashboard-text)]/50">Créée le</p>
                <p className="text-xs font-semibold">{MOI.creeLe}</p>
                <p className="mt-1.5 text-xs text-[var(--dashboard-text)]/50">Expire le</p>
                <p className="text-xs font-semibold">{MOI.expireLe}</p>
              </div>
            </div>

            <Divider />
            <p className="text-xs text-[var(--dashboard-text)]/70">
              Votre code est personnel. Ouvrez l&apos;application mobile, choisissez « Scanner mon code » et
              présentez-le : vous entrez avec vos droits, et seulement les vôtres.
            </p>

            <div className="mt-3.5 flex gap-2">
              <Btn variant="dark">Renouveler mon code</Btn>
              <Btn variant="outline">Changer mon mot de passe</Btn>
            </div>
          </div>
        </div>

        {/* Colonne 2 : liste du personnel */}
        <div>
          {/* Carte "Gérer les accès" : en-tête icône + titre + badge nombre
              de comptes actifs, puis une ligne par collaborateur avec ses
              tags de statut et un bouton "Gérer" explicite qui déplie le
              détail (droits, dates, actions) — repris de la maquette
              fournie par l'utilisateur pour cet écran. */}
          <div className="overflow-hidden rounded-[28px] bg-[var(--dashboard-card-bg)] shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffe1e2] text-[#c8262d]">
                  <AccessIcon />
                </span>
                <p className="text-sm font-bold text-[var(--dashboard-text)]">Gérer les accès</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag tone="dark">{PERSONNEL_ACTIF_COUNT} comptes</Tag>
                <Tag tone="neutral">Filtrer par rôle</Tag>
              </div>
            </div>

            <div className="divide-y divide-[var(--dashboard-text)]/[0.06] border-t border-[var(--dashboard-text)]/[0.06]">
              {COLLABORATEURS.map((c, i) => {
                const open = ouvert === i && !!c.details;
                const codeActif = c.statut.tone === "ok" || c.statut.tone === "warn";
                return (
                  <div key={c.nom} className={open ? "bg-brand-pink/[0.03]" : ""}>
                    <div className="flex items-center gap-3 p-3.5">
                      <span
                        className="h-9 w-9 shrink-0 rounded-full"
                        style={{ background: c.couleur || "color-mix(in srgb, var(--dashboard-text) 6%, transparent)" }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{c.nom}</span>
                        <span className="block truncate text-[11px] text-[var(--dashboard-text)]/50">
                          {c.role}
                          {c.details && ` · ${c.details.pages.length} pages`}
                        </span>
                      </span>
                      <span className="hidden items-center gap-1.5 sm:flex">
                        {codeActif && <Tag tone="dark">Code actif</Tag>}
                        <Tag tone={c.statut.tone}>{c.statut.label}</Tag>
                      </span>
                      {c.details && (
                        <button
                          type="button"
                          onClick={() => setOuvert(open ? -1 : i)}
                          className="shrink-0 rounded-full border border-brand-pink/40 px-3.5 py-1.5 text-[11px] font-semibold text-brand-pink transition hover:bg-brand-pink/10"
                        >
                          Gérer
                        </button>
                      )}
                    </div>

                    {open && c.details && (
                      <div className="border-t border-[var(--dashboard-text)]/[0.06] bg-black/[0.015] p-3.5">
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 min-[1360px]:grid-cols-5">
                          <DetailTile label="Compte créé le" value={c.details.creeLe} />
                          <DetailTile label="Première connexion" value={c.details.premiereConnexion} />
                          <DetailTile label="Dernière connexion" value={c.details.derniereConnexion} />
                          <DetailTile label="Mot de passe changé" value={c.details.motDePasseChange} />
                          <DetailTile label="Code renouvelé" value={c.details.codeRenouvele} />
                        </div>
                        <Divider />
                        <p className="mb-1.5 text-[10px] text-[var(--dashboard-text)]/40">Pages accessibles</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.details.pages.map((p, pi) => (
                            <Tag key={p} tone={pi % 2 === 0 ? "dark" : "ok"}>{p}</Tag>
                          ))}
                        </div>
                        <Divider />
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink">
                            Modifier les droits
                          </button>
                          <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink">
                            Prolonger la validité
                          </button>
                          <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink">
                            Réinitialiser le mot de passe
                          </button>
                          <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-brand-pink dark:bg-white/10">
                            Révoquer l&apos;accès
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Card title="Comment se passe l'arrivée d'un collaborateur" titleTab className="mt-3">
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ETAPES.map((e) => (
                <div key={e.titre}>
                  <p className="inline-block rounded-md px-3 py-1.5 text-[10px] font-semibold" style={{ background: "var(--dashboard-surface-2)" }}>
                    {e.titre}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#000000]">{e.note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Colonne 3 : ouvrir le formulaire "Créer un collaborateur" (voir
            CreerCollaborateur.tsx, /dashboard/parametres/creer) — cette
            colonne ne fait plus qu'y renvoyer, le vrai formulaire (rôle,
            durée, mot de passe, code à scanner) vit sur son propre écran. */}
        <div className="rounded-[28px] border border-brand-pink/25 bg-brand-pink/5 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--dashboard-card-bg)] text-brand-pink shadow-[0_4px_14px_rgba(236,12,140,0.18)]">
            <AccessIcon />
          </span>
          <p className="mt-3 text-sm font-bold text-[var(--dashboard-text)]">Créer un collaborateur</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--dashboard-text)]/55">
            Nom, rôle parmi les quatre, pages autorisées, période d&apos;accès. Son code à scanner est généré à
            la création et part avec son mot de passe provisoire.
          </p>
          <Link
            href="/dashboard/parametres/creer"
            className="mt-3.5 block w-full rounded-full bg-[var(--dashboard-card-bg)] px-4 py-2.5 text-center text-xs font-semibold text-[var(--dashboard-text)] shadow-[0_2px_10px_rgba(20,18,32,0.08)] transition hover:brightness-95"
          >
            Créer un collaborateur
          </Link>
        </div>
      </div>
    </>
  );
}

function AccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="9.5" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19.5c1-3.2 3.5-5 6-5s5 1.8 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18.5 8v5.5M15.75 10.75h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--dashboard-card-bg)] p-3 text-center shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-1.5 text-sm font-bold">{value}</p>
    </div>
  );
}
