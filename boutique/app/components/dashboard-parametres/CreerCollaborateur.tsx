"use client";

import { useMemo, useState } from "react";
import { Divider, Tag } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran "Créer un collaborateur" (/dashboard/parametres/creer), atteint
  depuis le bouton du même nom sur "Gérer les accès" (voir
  PersonnelAcces.tsx). Quatre blocs indépendants — qui, son rôle, combien
  de temps, ses accès — chacun repris seul quand l'API Laravel de gestion
  du personnel arrivera, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].

  Rôles et pages qu'ils ouvrent par défaut : mêmes quatre rôles fixes que
  MesDroits.tsx (dashboard-profil) et mêmes intitulés de pages que la liste
  "Pages accessibles" de PersonnelAcces.tsx — "Administrateur" reste pris
  (un seul par boutique, le propriétaire), donc désactivé ici.

  Rien n'est envoyé au serveur : "Créer le compte et envoyer les accès"
  appelle seulement onCreer avec la charge reconstituée, à l'appelant de
  décider quoi en faire (aujourd'hui : revenir sur la liste).
*/

type RoleKey = "administrateur" | "finances" | "commandes" | "stock";

const ROLES: { key: RoleKey; label: string; labelEn: string; desc: string; descEn: string; pris?: boolean }[] = [
  { key: "administrateur", label: "Administrateur", labelEn: "Administrator", desc: "Tout. Un seul par boutique : le propriétaire.", descEn: "Everything. One per shop: the owner.", pris: true },
  { key: "finances", label: "Finances", labelEn: "Finances", desc: "Chiffres, versements, prix d'achat et marges.", descEn: "Figures, payouts, cost prices and margins." },
  { key: "commandes", label: "Commandes", labelEn: "Orders", desc: "Les commandes, les litiges, l'état du stock.", descEn: "Orders, disputes, stock status." },
  { key: "stock", label: "Stock", labelEn: "Stock", desc: "Produits, dépôts de stock, état du stock.", descEn: "Products, stock warehouses, stock status." },
];

const PAGES: { key: string; label: string; labelEn: string }[] = [
  { key: "ma-journee", label: "Ma journée", labelEn: "My day" },
  { key: "produits", label: "Produits", labelEn: "Products" },
  { key: "stock-depots", label: "Stock et dépôts", labelEn: "Stock and warehouses" },
  { key: "demandes", label: "Demandes", labelEn: "Requests" },
  { key: "commandes", label: "Commandes", labelEn: "Orders" },
  { key: "finances", label: "Finances", labelEn: "Finances" },
];

const ROLE_PAGES: Record<RoleKey, string[]> = {
  administrateur: PAGES.map((p) => p.key),
  finances: ["ma-journee", "finances"],
  commandes: ["ma-journee", "commandes", "demandes", "stock-depots"],
  stock: ["ma-journee", "produits", "stock-depots", "demandes"],
};

type Duree = "7j" | "1m" | "3m" | "1a" | "precises";

const DUREES: { key: Duree; label: string; labelEn: string; jours: number | null }[] = [
  { key: "7j", label: "7 jours", labelEn: "7 days", jours: 7 },
  { key: "1m", label: "1 mois", labelEn: "1 month", jours: 30 },
  { key: "3m", label: "3 mois", labelEn: "3 months", jours: 91 },
  { key: "1a", label: "1 an", labelEn: "1 year", jours: 365 },
  { key: "precises", label: "Dates précises", labelEn: "Specific dates", jours: null },
];

function genererMotDePasse(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bloc = () => Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${bloc()} · ${bloc()} · ${bloc()}`;
}

// Enlève les accents (NFD sépare lettre + marque diacritique, on ne garde
// que les caractères en dessous de 0x0300 : pas d'échappement unicode
// littéral dans la regex pour éviter tout souci d'encodage de ce fichier).
function sansAccents(s: string): string {
  return Array.from(s.normalize("NFD"))
    .filter((ch) => ch.codePointAt(0)! < 0x0300)
    .join("");
}

function slugifier(nom: string): string {
  const parts = sansAccents(nom.trim().toLowerCase())
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[parts.length - 1][0]}`;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function CreerCollaborateur({
  onAnnuler,
  onCreer,
}: {
  onAnnuler: () => void;
  /** Reçoit la charge complète du formulaire au clic "Créer le compte et envoyer les accès". */
  onCreer: (collaborateur: {
    nom: string;
    adresseConnexion: string;
    telephone: string;
    identifiant: string;
    role: RoleKey;
    pages: string[];
    debut: string;
    fin: string;
  }) => void;
}) {
  const { t } = useDashboardLangue();

  const [nom, setNom] = useState("");
  const [adresseConnexion, setAdresseConnexion] = useState("");
  const [telephone, setTelephone] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [identifiantTouche, setIdentifiantTouche] = useState(false);

  const [role, setRole] = useState<RoleKey | null>(null);
  const [pages, setPages] = useState<Set<string>>(new Set());

  const [duree, setDuree] = useState<Duree>("3m");
  const aujourdhui = useMemo(() => new Date(), []);
  const [debut, setDebut] = useState(() => toISODate(aujourdhui));
  const [fin, setFin] = useState(() => {
    const d = new Date(aujourdhui);
    d.setDate(d.getDate() + 91);
    return toISODate(d);
  });

  const [motDePasse, setMotDePasse] = useState(genererMotDePasse);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  const [erreur, setErreur] = useState<string | null>(null);

  const identifiantPropose = slugifier(nom);
  const identifiantAffiche = identifiantTouche ? identifiant : identifiantPropose;

  const choisirRole = (r: (typeof ROLES)[number]) => {
    if (r.pris) return;
    setRole(r.key);
    setPages(new Set(ROLE_PAGES[r.key]));
  };

  const togglePage = (key: string) => {
    if (!role) return;
    if (!ROLE_PAGES[role].includes(key)) return; // le rôle plafonne les pages, cf. note ci-dessous
    setPages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const choisirDuree = (d: Duree) => {
    setDuree(d);
    const preset = DUREES.find((x) => x.key === d);
    if (preset?.jours != null) {
      const debutDate = new Date();
      const finDate = new Date();
      finDate.setDate(finDate.getDate() + preset.jours);
      setDebut(toISODate(debutDate));
      setFin(toISODate(finDate));
    }
  };

  const formatDateLongue = (iso: string) => {
    if (!iso) return "";
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(t("fr-FR", "en-US") as string, { day: "numeric", month: "long", year: "numeric" });
  };

  const valider = () => {
    if (!nom.trim()) return t("Le nom et prénom sont requis.", "Full name is required.");
    if (!/^\S+@\S+\.\S+$/.test(adresseConnexion.trim())) return t("Adresse de connexion invalide.", "Invalid login address.");
    if (!role) return t("Choisissez un rôle.", "Choose a role.");
    if (fin < debut) return t("La date de fin doit suivre la date de début.", "The end date must come after the start date.");
    return null;
  };

  const soumettre = () => {
    const err = valider();
    if (err) {
      setErreur(err);
      return;
    }
    setErreur(null);
    onCreer({
      nom: nom.trim(),
      adresseConnexion: adresseConnexion.trim(),
      telephone: telephone.trim(),
      identifiant: identifiantAffiche,
      role: role!,
      pages: Array.from(pages),
      debut,
      fin,
    });
  };

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("Créer un collaborateur", "Create a team member")}</h2>
          <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">
            {t("Quatre blocs, un écran. Le code à scanner se fabrique tout seul.", "Four blocks, one screen. The scannable code builds itself.")}
          </p>
        </div>
        <nav className="flex flex-wrap gap-1.5">
          {[
            { href: "#bloc-qui", label: t("1 · Qui", "1 · Who") },
            { href: "#bloc-role", label: t("2 · Son rôle", "2 · Their role") },
            { href: "#bloc-duree", label: t("3 · Combien de temps", "3 · How long") },
            { href: "#bloc-acces", label: t("4 · Ses accès", "4 · Their access") },
          ].map((x) => (
            <a
              key={x.href}
              href={x.href}
              className="rounded-full bg-brand-pink/10 px-3 py-1.5 text-[11px] font-semibold text-brand-pink transition hover:bg-brand-pink/20"
            >
              {x.label}
            </a>
          ))}
        </nav>
      </div>

      {erreur && (
        <p className="mt-3 rounded-xl bg-[#ffe1e2] px-3.5 py-2.5 text-xs font-semibold text-[#c8262d]">{erreur}</p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {/* Bloc 1 — Qui */}
          <div id="bloc-qui" className="scroll-mt-24 rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
                {t("1 · Qui est cette personne", "1 · Who is this person")}
              </p>
              <Tag tone="ko">{t("Obligatoire", "Required")}</Tag>
            </div>

            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              <Field label={t("Nom et prénom", "Full name")}>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder={t("ex. Ismaël Traoré", "e.g. Ismaël Traoré")}
                  className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
              <Field label={t("Adresse de connexion", "Login address")}>
                <input
                  value={adresseConnexion}
                  onChange={(e) => setAdresseConnexion(e.target.value)}
                  type="email"
                  placeholder="prenom.nom@boutique.ci"
                  className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
              <Field label={t("Téléphone", "Phone")}>
                <input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  type="tel"
                  placeholder="+225 07 00 00 00 00"
                  className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
              <Field
                label={t("Identifiant", "Username")}
                trailing={!identifiantTouche && identifiantPropose && <Tag tone="pink">{t("Proposé", "Suggested")}</Tag>}
              >
                <input
                  value={identifiantAffiche}
                  onChange={(e) => {
                    setIdentifiantTouche(true);
                    setIdentifiant(e.target.value);
                  }}
                  placeholder="ismael.t"
                  className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
              {t("C'est à l'adresse de connexion que partira le message contenant ses accès.", "The message containing their access will be sent to the login address.")}
            </p>
          </div>

          {/* Bloc 2 — Son rôle */}
          <div id="bloc-role" className="scroll-mt-24 rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("2 · Son rôle", "2 · Their role")}</p>
              <Tag tone="neutral">{t("Quatre rôles, pas un de plus", "Four roles, not one more")}</Tag>
            </div>

            <div className="mt-3.5 flex flex-col gap-2">
              {ROLES.map((r) => {
                const choisi = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => choisirRole(r)}
                    disabled={r.pris}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition disabled:cursor-not-allowed ${
                      choisi
                        ? "border-brand-pink/50 bg-brand-pink/5"
                        : r.pris
                          ? "border-[var(--dashboard-text)]/10 opacity-60"
                          : "border-[var(--dashboard-text)]/10 hover:border-brand-pink/30"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <RoleIcon roleKey={r.key} />
                      <span>
                        <span className="block text-xs font-bold">{t(r.label, r.labelEn)}</span>
                        <span className="block text-[11px] text-[var(--dashboard-text)]/50">{t(r.desc, r.descEn)}</span>
                      </span>
                    </span>
                    <Tag tone={r.pris ? "neutral" : choisi ? "pink" : "neutral"}>
                      {r.pris ? t("Pris", "Taken") : choisi ? t("Choisi", "Chosen") : ""}
                    </Tag>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
              {t(
                "Les rôles sont fixés par la plateforme. Ils ne se créent pas et ne se renomment pas : c'est ce qui permet à LM et au partenaire agréé de savoir qui fait quoi dans n'importe quelle boutique.",
                "Roles are fixed by the platform. They can't be created or renamed: that's what lets LM and the approved partner know who does what in any shop."
              )}
            </p>

            <Divider />

            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
                {t("Les pages que son rôle ouvre", "The pages their role opens")}
              </p>
              <Tag tone="dark">{role ? `${pages.size} ${t("sur", "of")} ${PAGES.length}` : `0 ${t("sur", "of")} ${PAGES.length}`}</Tag>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {PAGES.map((p) => {
                const permise = role ? ROLE_PAGES[role].includes(p.key) : false;
                const cochee = pages.has(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePage(p.key)}
                    disabled={!permise}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition disabled:cursor-not-allowed ${
                      cochee
                        ? "bg-[#dcf5e3] text-[#178a3f]"
                        : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/35"
                    }`}
                  >
                    {cochee && <CheckIcon />}
                    {t(p.label, p.labelEn)}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
              {t(
                "Le rôle coche ces pages. Vous pouvez en retirer, jamais en ajouter au-delà de ce que le rôle permet. Une page retirée disparaît de sa barre de gauche, elle ne s'affiche pas en grisé.",
                "The role checks these pages. You can remove some, never add beyond what the role allows. A removed page disappears from their sidebar, it doesn't show up greyed out."
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Bloc 3 — Combien de temps */}
          <div id="bloc-duree" className="scroll-mt-24 rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("3 · Combien de temps", "3 · How long")}</p>
              <Tag tone="pink">{t(DUREES.find((d) => d.key === duree)!.label, DUREES.find((d) => d.key === duree)!.labelEn)}</Tag>
            </div>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {DUREES.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => choisirDuree(d.key)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    duree === d.key
                      ? "bg-[#141220] text-white dark:bg-brand-pink"
                      : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60 hover:bg-[var(--dashboard-text)]/[0.1]"
                  }`}
                >
                  {t(d.label, d.labelEn)}
                </button>
              ))}
            </div>

            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              <Field label={t("Effectif à partir du", "Effective from")}>
                <input
                  type="date"
                  value={debut}
                  onChange={(e) => {
                    setDuree("precises");
                    setDebut(e.target.value);
                  }}
                  className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none"
                />
              </Field>
              <Field label={t("Jusqu'au", "Until")}>
                <input
                  type="date"
                  value={fin}
                  onChange={(e) => {
                    setDuree("precises");
                    setFin(e.target.value);
                  }}
                  className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none"
                />
              </Field>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
              {t(
                `Avant la première date, le compte existe mais n'ouvre rien. Après la seconde, il se ferme tout seul et son code cesse d'être reconnu. Fin prévue : ${formatDateLongue(fin)}.`,
                `Before the first date, the account exists but opens nothing. After the second, it closes itself and its code stops being recognized. Planned end: ${formatDateLongue(fin)}.`
              )}
            </p>
          </div>

          {/* Bloc 4 — Ses accès */}
          <div id="bloc-acces" className="scroll-mt-24 rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("4 · Ses accès", "4 · Their access")}</p>
              <Tag tone="ok">{t("Générés", "Generated")}</Tag>
            </div>

            <p className="mt-3.5 text-[11px] text-[var(--dashboard-text)]/40">{t("Mot de passe provisoire", "Temporary password")}</p>
            <div className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border border-brand-pink/45 bg-brand-pink/5 px-3 py-2.5">
              <span className="text-xs font-semibold tracking-[0.14em]">
                {motDePasseVisible ? motDePasse : motDePasse.replace(/[^\s·]/g, "•")}
              </span>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMotDePasseVisible((v) => !v)}
                  className="rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[var(--dashboard-text)]/70"
                >
                  {motDePasseVisible ? t("Masquer", "Hide") : t("Voir", "View")}
                </button>
                <button
                  type="button"
                  onClick={() => setMotDePasse(genererMotDePasse())}
                  className="rounded-full bg-brand-pink/15 px-2.5 py-1 text-[10px] font-semibold text-brand-pink"
                >
                  {t("Régénérer", "Regenerate")}
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">
              {t("Il devra le remplacer par le sien à sa première connexion.", "They'll need to replace it with their own at first login.")}
            </p>

            <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple">
                <QrPlaceholderIcon />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold">{t("Son code à scanner", "Their scannable code")}</p>
                  <Tag tone="blue">{t("Automatique", "Automatic")}</Tag>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
                  {t(
                    "Créé en même temps que le compte, lié à cette personne et à son rôle. Il cesse d'être reconnu le jour de fin choisi ci-dessus.",
                    "Created together with the account, tied to this person and their role. It stops being recognized on the end date chosen above."
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-[var(--dashboard-text)]/10 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                <MailIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold">{t("Le message part tout seul", "The message sends itself")}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">
                  {t(
                    "Adresse de connexion, mot de passe provisoire, code à scanner et date de fin — envoyés dès la création. Rien à recopier.",
                    "Login address, temporary password, scannable code and end date — sent as soon as it's created. Nothing to copy over."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 mt-4 flex flex-wrap items-center justify-end gap-2.5 rounded-2xl card-tint p-3.5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
        <button
          type="button"
          onClick={onAnnuler}
          className="rounded-full border border-[var(--dashboard-text)]/15 px-5 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
        >
          {t("Annuler", "Cancel")}
        </button>
        <button
          type="button"
          onClick={soumettre}
          className="rounded-full bg-[#141220] px-5 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
        >
          {t("Créer le compte et envoyer les accès", "Create the account and send access")}
        </button>
      </div>
    </>
  );
}

function Field({ label, trailing, children }: { label: string; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-[var(--dashboard-text)]/40">{label}</p>
        {trailing}
      </div>
      <div className="mt-1.5 rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-surface-2)] px-3 py-2.5">
        {children}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QrPlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 14.5h2.7v2.7h-2.7zM19 14.5h1.5v1.5H19zM14.5 19h1.5v1.5h-1.5zM19 19h1.5v1.5H19z" fill="currentColor" />
    </svg>
  );
}

function RoleIcon({ roleKey }: { roleKey: RoleKey }) {
  const common = "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center";
  const tones: Record<RoleKey, string> = {
    administrateur: "bg-[var(--dashboard-text)]/[0.08] text-[var(--dashboard-text)]/60",
    finances: "bg-[#dcf5e3] text-[#178a3f]",
    commandes: "bg-brand-purple/10 text-brand-purple",
    stock: "bg-brand-pink/10 text-brand-pink",
  };
  const icons: Record<RoleKey, React.ReactNode> = {
    administrateur: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    finances: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5v9M14.8 9.3c-.5-.7-1.5-1.1-2.5-1.1-1.5 0-2.7.8-2.7 1.9 0 1 .9 1.5 2.4 1.8 1.9.4 3 1 3 2.2 0 1.2-1.3 2-2.8 2-1.1 0-2.2-.4-2.8-1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    commandes: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <rect x="5" y="4.5" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 4v-.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    stock: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M4 8 12 4l8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 8v8l8 4 8-4V8M12 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  };
  return <span className={`${common} ${tones[roleKey]}`}>{icons[roleKey]}</span>;
}
