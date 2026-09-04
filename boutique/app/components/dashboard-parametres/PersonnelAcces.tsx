"use client";

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

export default function PersonnelAcces({ first = true }: { first?: boolean }) {
  const [ouvert, setOuvert] = useState(0);

  return (
    <>
      <SectionHeader
        eyebrow="Réglages"
        title="Personnel et accès"
        subtitle="Créer un collaborateur, lui envoyer ses accès, son code personnel."
        first={first}
      />

      <div className="grid gap-4 min-[1360px]:grid-cols-[320px_1fr_300px]">
        {/* Colonne 1 : mon identité */}
        <div>
          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Mon identité</p>
              <Tag tone="dark">Valide 15 jours</Tag>
            </div>

            <div className="mt-3.5 flex items-start gap-3.5">
              <div className="h-[110px] w-[110px] shrink-0 overflow-hidden rounded-2xl border border-[#141220]/10 bg-white p-2">
                <QrCode value="https://liivremoi.com/id/awa-konan" className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold tracking-tight">{MOI.nom}</p>
                <p className="text-xs font-semibold text-brand-pink">{MOI.role}</p>
                <Divider />
                <p className="text-xs text-[#141220]/50">Adresse de connexion</p>
                <p className="break-words text-xs font-semibold">{MOI.email}</p>
                <p className="mt-1.5 text-xs text-[#141220]/50">Créée le</p>
                <p className="text-xs font-semibold">{MOI.creeLe}</p>
                <p className="mt-1.5 text-xs text-[#141220]/50">Expire le</p>
                <p className="text-xs font-semibold">{MOI.expireLe}</p>
              </div>
            </div>

            <Divider />
            <p className="text-xs text-[#141220]/70">
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
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Personnel de la boutique · {COLLABORATEURS.filter((c) => c.statut.tone !== "ko").length} comptes actifs
            </p>
            <Tag tone="neutral">Filtrer par rôle</Tag>
          </div>

          <div className="flex flex-col gap-2.5">
            {COLLABORATEURS.map((c, i) => {
              const open = ouvert === i && !!c.details;
              return (
                <div
                  key={c.nom}
                  className={`overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(20,18,32,0.06)] transition ${
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
                      style={{ background: c.couleur || "rgba(20,18,32,0.06)" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{c.nom}</span>
                      <span className="block truncate text-[11px] text-[#141220]/50">
                        {c.role}
                        {c.email && ` · ${c.email}`}
                      </span>
                    </span>
                    <Tag tone={c.statut.tone}>{c.statut.label}</Tag>
                    <span className="hidden text-right sm:block">
                      <span className="block text-[9px] text-[#141220]/40">
                        {c.statut.tone === "ko" ? "" : "Expire le"}
                      </span>
                      <span className="block text-xs font-semibold">{c.expire}</span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`h-3.5 w-3.5 shrink-0 text-[#141220]/40 transition-transform ${open ? "rotate-90" : ""}`}
                    >
                      <path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {open && c.details && (
                    <div className="border-t border-[#141220]/[0.06] bg-black/[0.015] p-3.5">
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 min-[1360px]:grid-cols-5">
                        <DetailTile label="Compte créé le" value={c.details.creeLe} />
                        <DetailTile label="Première connexion" value={c.details.premiereConnexion} />
                        <DetailTile label="Dernière connexion" value={c.details.derniereConnexion} />
                        <DetailTile label="Mot de passe changé" value={c.details.motDePasseChange} />
                        <DetailTile label="Code renouvelé" value={c.details.codeRenouvele} />
                      </div>
                      <Divider />
                      <p className="mb-1.5 text-[10px] text-[#141220]/40">Pages accessibles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.details.pages.map((p, pi) => (
                          <Tag key={p} tone={pi % 2 === 0 ? "dark" : "ok"}>{p}</Tag>
                        ))}
                      </div>
                      <Divider />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white">
                          Modifier les droits
                        </button>
                        <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white">
                          Prolonger la validité
                        </button>
                        <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white">
                          Réinitialiser le mot de passe
                        </button>
                        <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-brand-pink">
                          Révoquer l&apos;accès
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Card title="Comment se passe l'arrivée d'un collaborateur" className="mt-3">
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ETAPES.map((e) => (
                <div key={e.titre}>
                  <p className="text-xs font-semibold">{e.titre}</p>
                  <p className="mt-0.5 text-[11px] text-[#141220]/50">{e.note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Colonne 3 : créer un collaborateur */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Créer un collaborateur</p>
            <Tag tone="pink">Nouveau</Tag>
          </div>

          <FormField label="Nom et prénom" value="Nadège Ouattara" />

          <p className="mt-3 text-[11px] text-[#141220]/40">Rôle</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Tag tone="neutral">Admin</Tag>
            <Tag tone="neutral">Comptable</Tag>
            <Tag tone="neutral">Commandes</Tag>
            <Tag tone="pink">Stock</Tag>
          </div>

          <FormField label="Adresse de connexion" value="n.ouattara@awabeaute.ci" className="mt-3" />

          <p className="mt-3 text-[11px] text-[#141220]/40">Mot de passe provisoire</p>
          <div className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border border-brand-pink/45 bg-brand-pink/5 px-3 py-2.5">
            <span className="text-xs tracking-[0.16em]">Kx7 · 4Q2 · vT9</span>
            <Tag tone="neutral">Copier</Tag>
          </div>
          <p className="mt-1.5 text-[10px] text-[#141220]/40">
            À communiquer au collaborateur. Il devra le changer à sa première connexion.
          </p>

          <p className="mt-3 text-[11px] text-[#141220]/40">Date d&apos;expiration de l&apos;accès</p>
          <div className="mt-1.5 flex items-center justify-between rounded-xl border border-[#141220]/15 bg-black/[0.02] px-3 py-2.5">
            <span className="text-xs">20 septembre 2026</span>
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[#141220]/40">
              <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          <p className="mt-3 text-[11px] text-[#141220]/40">Pages accessibles</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Tag tone="pink">Ma journée</Tag>
            <Tag tone="pink">Stock et dépôts</Tag>
            <Tag tone="pink">Produits</Tag>
            <Tag tone="neutral">Finances</Tag>
            <Tag tone="neutral">Commandes</Tag>
            <Tag tone="neutral">Litiges</Tag>
          </div>

          <Btn variant="dark" className="mt-3.5">Créer le compte et générer les accès</Btn>
          <p className="mt-1.5 text-center text-[10px] text-[#141220]/40">
            Le code à scanner apparaîtra après sa première connexion.
          </p>
        </Card>
      </div>
    </>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
      <p className="text-[10px] text-[#141220]/40">{label}</p>
      <p className="mt-1.5 text-sm font-bold">{value}</p>
    </div>
  );
}

function FormField({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] text-[#141220]/40">{label}</p>
      <div className="mt-1.5 rounded-xl border border-[#141220]/15 bg-black/[0.02] px-3 py-2.5">
        <p className="text-xs">{value}</p>
      </div>
    </div>
  );
}
