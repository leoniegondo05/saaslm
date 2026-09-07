"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import QrCode from "../QrCode";
import { Divider, Tag } from "../dashboard-accueil/shared";
import { ChevronIcon, SparkleIcon } from "../DashboardHeader";

/*
  Écran "Créer un collaborateur", atteint depuis le bouton du même nom sur
  Écran 07 "Personnel et accès" (voir PersonnelAcces.tsx) : quatre blocs sur
  un seul écran (qui, rôle, durée, accès générés), puis un écran de
  confirmation avec le code à scanner — cf. maquette fournie par
  l'utilisateur pour ce clic.

  Thème clair, cohérent avec le reste du dashboard (cf. mémoire
  [[dashboard-background-fafcfc]] — la maquette d'origine était sombre).

  Aucun endpoint Laravel n'existe encore pour créer un compte : "Créer le
  compte et envoyer les accès" ne fait que basculer sur l'écran de
  confirmation avec des données locales, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

type RoleId = "administrateur" | "finances" | "commandes" | "stock";

const PAGES_ORDRE = ["Ma journée", "Produits", "Stock et dépôts", "Litiges", "Commandes", "Finances"] as const;

const ROLES: {
  id: RoleId;
  label: string;
  desc: string;
  pages: readonly string[];
  disabled?: boolean;
  aide: string;
}[] = [
  {
    id: "administrateur",
    label: "Administrateur",
    desc: "Tout. Un seul par boutique : le propriétaire.",
    pages: PAGES_ORDRE,
    disabled: true,
    aide: "Quel rôle pour la personne qui remplace la propriétaire ?",
  },
  {
    id: "finances",
    label: "Finances",
    desc: "Chiffres, versements, prix d'achat et marges.",
    pages: ["Ma journée", "Finances"],
    aide: "Quel rôle pour une personne aux finances ?",
  },
  {
    id: "commandes",
    label: "Commandes",
    desc: "Les commandes, les litiges, l'état du stock.",
    pages: ["Ma journée", "Commandes", "Litiges", "Stock et dépôts"],
    aide: "Quel rôle pour une personne aux commandes ?",
  },
  {
    id: "stock",
    label: "Stock",
    desc: "Produits, dépôts de stock, état du stock.",
    pages: ["Ma journée", "Produits", "Stock et dépôts", "Litiges"],
    aide: "Quel rôle pour une personne au stock ?",
  },
];

const DUREES: { id: string; label: string; addDays?: number; addMonths?: number }[] = [
  { id: "7j", label: "7 jours", addDays: 7 },
  { id: "1m", label: "1 mois", addMonths: 1 },
  { id: "3m", label: "3 mois", addMonths: 3 },
  { id: "1a", label: "1 an", addMonths: 12 },
  { id: "precises", label: "Dates précises" },
];

const MOIS_MINUSCULE = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function formatDateLongue(d: Date) {
  return `${d.getDate()} ${MOIS_MINUSCULE[d.getMonth()]} ${d.getFullYear()}`;
}

// Plage Unicode des diacritiques combinants (U+0300-U+036F), construite via
// codes plutôt qu'un littéral regex : évite tout souci d'encodage du fichier
// source avec des caractères combinants bruts.
const DIACRITIQUES = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");

function sansAccents(s: string) {
  return s.normalize("NFD").replace(DIACRITIQUES, "");
}

function genererMotDePasse() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const groupe = () => Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${groupe()} · ${groupe()} · ${groupe()}`;
}

export default function CreerCollaborateur() {
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [identifiantEdite, setIdentifiantEdite] = useState<string | null>(null);

  const [roleId, setRoleId] = useState<RoleId>("stock");
  const [pagesRetirees, setPagesRetirees] = useState<Set<string>>(new Set());

  const [dureeId, setDureeId] = useState("3m");
  const [dateFinManuelle, setDateFinManuelle] = useState<string | null>(null);

  const [motDePasse, setMotDePasse] = useState(genererMotDePasse);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  const [cree, setCree] = useState(false);

  const role = ROLES.find((r) => r.id === roleId)!;
  const pagesActives = role.pages.filter((p) => !pagesRetirees.has(p));

  const identifiantPropose = useMemo(() => {
    const [prenom, ...reste] = nom.trim().split(/\s+/).filter(Boolean);
    const nomFamille = reste.at(-1);
    if (!prenom) return "";
    const p = sansAccents(prenom).toLowerCase();
    return nomFamille ? `${p}.${sansAccents(nomFamille).toLowerCase()[0]}` : p;
  }, [nom]);
  const identifiant = identifiantEdite ?? identifiantPropose;

  const dateDebut = new Date();
  const duree = DUREES.find((d) => d.id === dureeId)!;
  const dateFinAuto = new Date(dateDebut);
  if (duree.addDays) dateFinAuto.setDate(dateFinAuto.getDate() + duree.addDays);
  if (duree.addMonths) dateFinAuto.setMonth(dateFinAuto.getMonth() + duree.addMonths);
  const dateFinAffichee = dureeId === "precises" && dateFinManuelle ? new Date(dateFinManuelle) : dateFinAuto;

  const togglePage = (page: string) => {
    setPagesRetirees((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const choisirRole = (id: RoleId) => {
    const r = ROLES.find((x) => x.id === id)!;
    if (r.disabled) return;
    setRoleId(id);
    setPagesRetirees(new Set());
  };

  const reinitialiser = () => {
    setNom("");
    setAdresse("");
    setTelephone("");
    setIdentifiantEdite(null);
    setRoleId("stock");
    setPagesRetirees(new Set());
    setDureeId("3m");
    setDateFinManuelle(null);
    setMotDePasse(genererMotDePasse());
    setMotDePasseVisible(false);
    setCree(false);
  };

  const peutCreer = nom.trim().length > 0 && adresse.trim().length > 0;

  if (cree) {
    return (
      <CreationReussie
        nom={nom || "Nouveau collaborateur"}
        role={role}
        pages={pagesActives}
        identifiant={identifiant}
        dateFin={dateFinAffichee}
        onCreerAutre={reinitialiser}
      />
    );
  }

  return (
    <>
      {/* Fil d'ariane + astuce contextuelle + partenaire, sous DashboardHeader */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--dashboard-card-bg)]/70 px-3.5 py-2 text-xs font-medium text-[var(--dashboard-text)]/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
          <Link href="/dashboard/parametres" aria-label="Retour" className="flex items-center hover:text-[var(--dashboard-text)]">
            <ChevronIcon direction="left" />
          </Link>
          <Link href="/dashboard/profil" className="hover:text-[var(--dashboard-text)]">Mon profil</Link>
          <span className="text-[var(--dashboard-text)]/30">›</span>
          <Link href="/dashboard/parametres" className="hover:text-[var(--dashboard-text)]">Gérer les accès</Link>
          <span className="text-[var(--dashboard-text)]/30">›</span>
          <span className="font-semibold text-[var(--dashboard-text)]">Créer</span>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-brand-pink/10 px-4 py-2 text-xs font-semibold text-brand-pink">
          <SparkleIcon />
          {role.aide}
          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-pink/70">Assistance LM</span>
        </span>

        <Tag tone="pink">Administrateur uniquement</Tag>
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Créer un collaborateur</h1>
      <p className="mt-1 text-sm text-[var(--dashboard-text)]/50">Quatre blocs, un écran. Le code à scanner se fabrique tout seul.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Bloc 1 : qui */}
        <Bloc titre="1 · Qui est cette personne" badge={<Tag tone="warn">Obligatoire</Tag>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Champ label="Nom et prénom">
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ismaël Traoré"
                className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5 text-xs outline-none focus:border-brand-pink"
              />
            </Champ>
            <Champ label="Adresse de connexion">
              <input
                type="email"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="i.traore@awabeaute.ci"
                className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5 text-xs outline-none focus:border-brand-pink"
              />
            </Champ>
            <Champ label="Téléphone">
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5 text-xs outline-none focus:border-brand-pink"
              />
            </Champ>
            <Champ label="Identifiant">
              <div className="flex items-center gap-1.5">
                <input
                  value={identifiant}
                  onChange={(e) => setIdentifiantEdite(e.target.value)}
                  placeholder="prenom.n"
                  className="w-full min-w-0 rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5 text-xs outline-none focus:border-brand-pink"
                />
                <Tag tone="neutral" className="shrink-0">Proposé</Tag>
              </div>
            </Champ>
          </div>
          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
            C&apos;est à l&apos;adresse de connexion que partira le message contenant ses accès.
          </p>
        </Bloc>

        {/* Bloc 3 : combien de temps */}
        <Bloc titre="3 · Combien de temps" badge={<Tag tone="pink">{duree.label}</Tag>}>
          <div className="flex flex-wrap gap-1.5">
            {DUREES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDureeId(d.id)}
                className={`rounded-full px-3.5 py-2 text-[11px] font-semibold transition ${
                  d.id === dureeId ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-[0_2px_10px_rgba(20,18,32,0.12)]" : "bg-black/[0.03] text-[var(--dashboard-text)]/50 hover:bg-black/[0.06]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Champ label="Effectif à partir du">
              <DateBox value={formatDateLongue(dateDebut)} />
            </Champ>
            <Champ label="Jusqu'au">
              {dureeId === "precises" ? (
                <input
                  type="date"
                  onChange={(e) => setDateFinManuelle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5 text-xs outline-none focus:border-brand-pink"
                />
              ) : (
                <DateBox value={formatDateLongue(dateFinAffichee)} />
              )}
            </Champ>
          </div>
          <p className="mt-3 text-[10px] leading-snug text-[var(--dashboard-text)]/40">
            Avant la première date, le compte existe mais n&apos;ouvre rien. Après la seconde, il se ferme tout seul et son code cesse d&apos;être reconnu.
          </p>
        </Bloc>

        {/* Bloc 2 : rôle */}
        <Bloc titre="2 · Son rôle" badge={<Tag tone="warn">Quatre rôles, pas un de plus</Tag>}>
          <div className="flex flex-col gap-1.5">
            {ROLES.map((r) => {
              const selected = r.id === roleId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => choisirRole(r.id)}
                  disabled={r.disabled}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                    selected
                      ? "border-brand-pink/50 bg-brand-pink/5"
                      : r.disabled
                        ? "border-[var(--dashboard-text)]/10 bg-black/[0.02] dark:bg-white/[0.04] cursor-default"
                        : "border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] hover:border-brand-pink/30"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold">{r.label}</span>
                    <span className="block text-[10px] text-[var(--dashboard-text)]/45">{r.desc}</span>
                  </span>
                  {r.disabled ? (
                    <Tag tone="neutral" className="shrink-0">Pris</Tag>
                  ) : selected ? (
                    <Tag tone="ok" className="shrink-0">Choisi</Tag>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-2">
            <p className="text-[10px] text-[var(--dashboard-text)]/40">Les pages que son rôle ouvre</p>
            <Tag tone="pink">{pagesActives.length} sur {PAGES_ORDRE.length}</Tag>
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {PAGES_ORDRE.map((p) => {
              const permise = role.pages.includes(p);
              const active = permise && !pagesRetirees.has(p);
              return (
                <button
                  key={p}
                  type="button"
                  disabled={!permise}
                  onClick={() => togglePage(p)}
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[10px] font-medium transition ${
                    active
                      ? "border-[#178a3f]/25 bg-[#dcf5e3] text-[#178a3f]"
                      : "border-dashed border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/30"
                  }`}
                >
                  {active ? <CheckMini /> : <span className="h-3 w-3 shrink-0 rounded-full border border-[var(--dashboard-text)]/20" />}
                  <span className="truncate">{p}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] leading-snug text-[var(--dashboard-text)]/40">
            Le rôle coche ces pages. Vous pouvez en retirer, jamais en ajouter au-delà de ce que le rôle permet. Une page retirée disparaît de sa barre à gauche, elle ne s&apos;affiche pas en grisé.
          </p>
        </Bloc>

        {/* Bloc 4 : accès générés */}
        <Bloc titre="4 · Ses accès" badge={<Tag tone="ok">Générés</Tag>}>
          <p className="text-[10px] text-[var(--dashboard-text)]/40">Mot de passe provisoire</p>
          <div className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border border-brand-pink/45 bg-brand-pink/5 px-3 py-2.5">
            <span className="text-xs tracking-[0.16em]">{motDePasseVisible ? motDePasse : "••• · ••• · •••"}</span>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setMotDePasseVisible((v) => !v)}
                className="rounded-full border border-brand-pink/40 px-2.5 py-1 text-[10px] font-semibold text-brand-pink transition hover:bg-brand-pink/10"
              >
                {motDePasseVisible ? "Masquer" : "Voir"}
              </button>
              <button
                type="button"
                onClick={() => setMotDePasse(genererMotDePasse())}
                className="rounded-full border border-[var(--dashboard-text)]/15 px-2.5 py-1 text-[10px] font-semibold text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.05]"
              >
                Régénérer
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">Il devra le remplacer par le sien à sa première connexion.</p>

          <Divider />

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple">
              <QrIconMini />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-[var(--dashboard-text)]">Son code à scanner</p>
                <Tag tone="blue" className="shrink-0">Automatique</Tag>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-[var(--dashboard-text)]/45">
                Créé en même temps que le compte, lié à cette personne et à son rôle. Il cesse d&apos;être reconnu le {formatDateLongue(dateFinAffichee)}.
              </p>
            </div>
          </div>

          <Divider />

          <div className="flex items-start gap-3 rounded-2xl bg-[#dcf5e3]/50 p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcf5e3] text-[#178a3f]">
              <MailMiniIcon />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">Le message part tout seul</p>
              <p className="mt-0.5 text-[10px] leading-snug text-[var(--dashboard-text)]/50">
                Adresse de connexion, mot de passe provisoire, code à scanner et date de fin — envoyés dès la création. Rien à recopier.
              </p>
            </div>
          </div>
        </Bloc>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/dashboard/parametres"
          className="rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] px-5 py-3 text-center text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]"
        >
          Annuler
        </Link>
        <button
          type="button"
          disabled={!peutCreer}
          onClick={() => setCree(true)}
          className="flex-1 rounded-full bg-[#141220] px-5 py-3 text-center text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-pink"
        >
          Créer le compte et envoyer les accès
        </button>
      </div>
    </>
  );
}

function CreationReussie({
  nom,
  role,
  pages,
  identifiant,
  dateFin,
  onCreerAutre,
}: {
  nom: string;
  role: (typeof ROLES)[number];
  pages: string[];
  identifiant: string;
  dateFin: Date;
  onCreerAutre: () => void;
}) {
  const etapes = [
    "Il reçoit le message avec adresse, son mot de passe provisoire et son code.",
    "Il se connecte et choisit immédiatement son propre mot de passe.",
    `Son code lui ouvre l'application mobile avec les droits du rôle ${role.label}, et rien d'autre.`,
    `Le ${formatDateLongue(dateFin)}, tout se ferme sans que vous ayez à y penser.`,
  ];

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/parametres"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--dashboard-card-bg)]/70 px-3.5 py-2 text-xs font-medium text-[var(--dashboard-text)]/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition hover:bg-[var(--dashboard-card-bg)]"
        >
          <ChevronIcon direction="left" />
          Mon profil <span className="text-[var(--dashboard-text)]/30">›</span> Gérer les accès <span className="text-[var(--dashboard-text)]/30">›</span>{" "}
          <span className="font-semibold text-[var(--dashboard-text)]">Créer</span>
        </Link>
        <Tag tone="pink">Administrateur uniquement</Tag>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 text-center shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
          <div className="mx-auto h-[180px] w-[180px] overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 p-2">
            <QrCode value={`https://liivremoi.com/id/${identifiant || "collaborateur"}`} className="h-full w-full" />
          </div>
          <p className="mt-4 text-base font-bold">{nom}</p>
          <p className="text-xs text-[var(--dashboard-text)]/50">Rôle {role.label} · {pages.length} pages</p>

          <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">Valable jusqu&apos;au {formatDateLongue(dateFin)}</p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
            <div className="h-full w-[6%] rounded-full" style={{ background: "linear-gradient(90deg,#178a3f,#f5a623)" }} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] px-2 py-2 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]">
              Télécharger
            </button>
            <button type="button" className="rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] px-2 py-2 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]">
              Imprimer
            </button>
          </div>
        </div>

        <div>
          <div className="rounded-[28px] bg-[#dcf5e3]/40 p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.1)]">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcf5e3] text-[#178a3f]">
                <CheckMini className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--dashboard-text)]">Le compte est créé et le message est parti</p>
                <p className="text-[10px] text-[var(--dashboard-text)]/45">Envoyé à l&apos;adresse de connexion il y a quelques secondes.</p>
              </div>
            </div>

            <Divider />

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">Ce que le message contient</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["Son adresse de connexion", "Son mot de passe provisoire", "Son code à scanner", "La date de fin de son accès"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-[11px] text-[var(--dashboard-text)]/70">
                  <CheckMini className="h-3.5 w-3.5 shrink-0 text-[#178a3f]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]">
                Renvoyer le message
              </button>
              <button type="button" className="rounded-full border border-brand-pink/40 bg-[var(--dashboard-card-bg)] px-4 py-2.5 text-xs font-semibold text-brand-pink transition hover:bg-brand-pink/10">
                Copier les accès
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">Ce qui va se passer</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {etapes.map((texte, i) => (
                <div key={texte} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-text)]/[0.06] text-[10px] font-bold text-[var(--dashboard-text)]/60">
                    {i + 1}
                  </span>
                  <p className="text-xs leading-snug text-[var(--dashboard-text)]/70">{texte}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[28px] bg-black/[0.02] dark:bg-white/[0.04] p-4">
            <p className="max-w-md text-[10px] leading-snug text-[var(--dashboard-text)]/45">
              Tant qu&apos;il ne s&apos;est pas connecté, son compte reste marqué « jamais connecté » dans la liste, et vous pouvez encore tout modifier.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onCreerAutre}
                className="rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]"
              >
                Créer un autre
              </button>
              <Link
                href="/dashboard/parametres"
                className="rounded-full bg-[#141220] px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
              >
                Terminer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Bloc({ titre, badge, children }: { titre: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <p className="inline-block rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ background: "var(--dashboard-surface-2)" }}>
          {titre}
        </p>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function DateBox({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5">
      <span className="text-xs">{value}</span>
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0 text-[var(--dashboard-text)]/40">
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function CheckMini({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QrIconMini() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14h3v3h-3zM19.5 14h1M14 19.5h1M17.5 17.5h3v3h-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function MailMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
