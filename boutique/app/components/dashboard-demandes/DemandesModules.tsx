"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, SectionHeader } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { RetourPastille } from "./shared";

/*
  "Demandes" (/dashboard/demandes), atteinte depuis le bouton "Besoin
  d'assistance" de la fiche "Le partenaire agréé" (PartenaireAgree.tsx).
  Trois modules empilés à gauche (Litiges, Questions, Support technique
  LM), le module choisi s'ouvre en grand à droite — même principe que la
  maquette "LM besoin d'assistance" fournie, adapté au système de design
  du dashboard (Card/jetons de couleur) plutôt qu'à sa feuille de style
  propre.

  Les trois listes (litiges, questions, signalements) sont recopiées telle
  quelle de la maquette — aucune n'a encore de vraie donnée derrière (pas
  de champ "qui a ouvert" sur Commande, pas de modèle Question/Signalement
  côté API), cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

type ModuleKey = "litiges" | "questions" | "support";

// Onglet choisi (Litiges/Questions/Support) gardé au rechargement — même
// recette localStorage que DashboardThemeProvider/DashboardLanguageProvider.
const ACTIF_STORAGE_KEY = "lm-demandes-actif";

function lireActifStocke(): ModuleKey {
  if (typeof window === "undefined") return "litiges";
  const v = window.localStorage.getItem(ACTIF_STORAGE_KEY);
  return v === "litiges" || v === "questions" || v === "support" ? v : "litiges";
}

const COULEUR: Record<ModuleKey, string> = {
  litiges: "#EC0C8C", // brand-pink — même rose que NOTIF_COULEURS.litiges (DashboardHeader)
  questions: "#8A5CF6", // même violet que ETAPES "assistance" (dashboard-commandes/shared)
  support: "#2563eb", // même bleu que ETAPES "preparation"
};

type Qui = "client" | "partenaire" | "vous";

const QUI_META: Record<Qui, { label: string; labelEn: string; dot: string }> = {
  client: { label: "Le client", labelEn: "The customer", dot: "#ffffff" },
  partenaire: { label: "Le partenaire", labelEn: "The partner", dot: "#9B6BFF" },
  vous: { label: "Vous", labelEn: "You", dot: "#E8207E" },
};

type LitigeStatut = "cree" | "en-traitement" | "changement-colis" | "retour-fonds" | "gain-cause";

const LITIGE_STATUT_META: Record<LitigeStatut, { label: string; labelEn: string; couleur: string }> = {
  cree: { label: "Créé", labelEn: "Created", couleur: "#FFB84D" },
  "en-traitement": { label: "En traitement", labelEn: "In progress", couleur: "#B79BFF" },
  "changement-colis": { label: "Changement de colis", labelEn: "Parcel exchange", couleur: "#5AA9FF" },
  "retour-fonds": { label: "Retour de fonds", labelEn: "Funds returned", couleur: "#FF7A80" },
  "gain-cause": { label: "Gain de cause", labelEn: "Ruled in your favor", couleur: "#4FE0AE" },
};

type LitigeRow = {
  id: string;
  ref: string;
  produit: string;
  qte?: number;
  qui: Qui;
  montant: string;
  statut: LitigeStatut;
  date: string;
  tranche: boolean;
};

const LITIGES_EN_COURS: LitigeRow[] = [
  { id: "D-208", ref: "C-4819", produit: "Sac cabas en raphia", qui: "client", montant: "19 140 F", statut: "cree", date: "29 août · 09:12", tranche: false },
  { id: "D-207", ref: "C-4816", produit: "Sandales tressées", qte: 2, qui: "partenaire", montant: "28 340 F", statut: "en-traitement", date: "28 août · 14:20", tranche: false },
];

const LITIGES_TRANCHES: LitigeRow[] = [
  { id: "D-205", ref: "C-4812", produit: "Sac cabas en raphia", qui: "vous", montant: "19 140 F", statut: "changement-colis", date: "27 août · 10:40", tranche: true },
  { id: "D-202", ref: "C-4811", produit: "Foulard en soie", qui: "client", montant: "8 300 F", statut: "retour-fonds", date: "26 août · 17:05", tranche: true },
  { id: "D-199", ref: "C-4810", produit: "Sandales tressées", qte: 2, qui: "vous", montant: "28 340 F", statut: "gain-cause", date: "26 août · 08:15", tranche: true },
];
const LITIGES_TRANCHES_TOTAL = 24; // la maquette n'en liste que 3 sur 24 — même chose ici

type QuestionRow = {
  id: string;
  sujet: string;
  statut: "en-cours" | "repondue";
  date: string;
};

const QUESTIONS: QuestionRow[] = [
  { id: "D-206", sujet: "Frais logistiques du 26 août · calcul incompris", statut: "en-cours", date: "29 août · 08:40" },
  { id: "D-204", sujet: "Enlèvement du 30 août · créneau du matin possible ?", statut: "repondue", date: "26 août · 11:20" },
  { id: "D-201", sujet: "Versement du 24 août · date de virement", statut: "repondue", date: "25 août · 09:50" },
  { id: "D-197", sujet: "Livraison à Bouaké · délai à annoncer aux clients", statut: "repondue", date: "22 août · 15:30" },
];
// La maquette n'en liste que 14/13 — même chose ici que LITIGES_TRANCHES_TOTAL : QUESTIONS ne montre qu'un échantillon.
const QUESTIONS_TOTAL = 14;
const QUESTIONS_REPONDUES_TOTAL = 13;

type SignalementRow = {
  id: string;
  sujet: string;
  statut: "en-cours" | "corrige";
  date: string;
};

const SIGNALEMENTS: SignalementRow[] = [
  { id: "D-203", sujet: "Page de commande · la vidéo ne se lance pas sur téléphone", statut: "en-cours", date: "29 août · 07:15" },
  { id: "D-200", sujet: "Export du tableau des ventes · fichier vide", statut: "corrige", date: "25 août · 16:40" },
  { id: "D-196", sujet: "Accès d'un collaborateur · code refusé après changement", statut: "corrige", date: "21 août · 10:05" },
  { id: "D-191", sujet: "Photos d'un produit · téléversement bloqué à 80 %", statut: "corrige", date: "18 août · 13:25" },
];
// Comme LITIGES_TRANCHES_TOTAL : la maquette n'affiche que les 3 derniers
// signalements corrigés, mais le compteur ("6 déjà corrigés") porte sur le
// total réel. IDs en "D-" (même compteur que les litiges), pas "S-" — la
// maquette "LM besoin d'assistance" numérote toutes les demandes dans une
// séquence unique.
const SIGNALEMENTS_CORRIGES_TOTAL = 6;
const SIGNALEMENTS_TOTAL = 7;

export default function DemandesModules({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [actif, setActif] = useState<ModuleKey>("litiges");

  // Lu après montage seulement (pas en initialiseur de useState) pour éviter
  // un écart HTML serveur/client : le serveur rend toujours "litiges".
  useEffect(() => {
    setActif(lireActifStocke());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ACTIF_STORAGE_KEY, actif);
  }, [actif]);

  const questionsEnCours = QUESTIONS.filter((q) => q.statut === "en-cours");
  const questionsRepondues = QUESTIONS.filter((q) => q.statut === "repondue");
  const signalementsEnCours = SIGNALEMENTS.filter((s) => s.statut === "en-cours");
  const signalementsCorriges = SIGNALEMENTS.filter((s) => s.statut === "corrige");

  const MODULES: { key: ModuleKey; titre: string; titreEn: string; sous: string; sousEn: string; enCours: number; total: number; icone: React.ReactNode }[] = [
    {
      key: "litiges",
      titre: "Litiges",
      titreEn: "Disputes",
      sous: "Sur une commande. Bloque l'argent et le stock.",
      sousEn: "On an order. Holds the money and the stock.",
      enCours: LITIGES_EN_COURS.length,
      total: LITIGES_TRANCHES_TOTAL + LITIGES_EN_COURS.length,
      icone: <IconeLitige />,
    },
    {
      key: "questions",
      titre: "Questions",
      titreEn: "Questions",
      sous: "Au partenaire. Réponse au plus tôt, rien n'est bloqué.",
      sousEn: "To the partner. Answered as soon as possible, nothing is blocked.",
      enCours: questionsEnCours.length,
      total: QUESTIONS_TOTAL,
      icone: <IconeQuestion />,
    },
    {
      key: "support",
      titre: "Support technique LM",
      titreEn: "LM technical support",
      sous: "L'application. Va chez LM, réponse au plus tôt.",
      sousEn: "The app. Goes to LM, answered as soon as possible.",
      enCours: signalementsEnCours.length,
      total: SIGNALEMENTS_TOTAL,
      icone: <IconeSupport />,
    },
  ];

  return (
    <>
      <RetourPastille href="/dashboard/partenaire-agree" label={t("Partenaire agréé › Demandes", "Approved partner › Requests")} />
      <SectionHeader
        eyebrow={t("Partenaire agréé", "Approved partner")}
        title={t("Besoin d'assistance", "Need help")}
        subtitle={t(
          "Litiges, questions au partenaire, support technique LM : trois portes, chacune avec sa règle de temps.",
          "Disputes, questions to the partner, LM technical support: three doors, each with its own time rule."
        )}
        first={first}
        layout="inline"
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr] [&>*]:min-w-0">
        {/* Colonne des modules */}
        <div className="flex flex-col gap-3">
          {MODULES.map((m) => {
            const on = actif === m.key;
            const couleur = COULEUR[m.key];
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setActif(m.key)}
                className="rounded-2xl p-4 text-left shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] transition"
                style={
                  on
                    ? { background: `${couleur}14`, border: `1px solid ${couleur}66`, boxShadow: `0 12px 28px -8px ${couleur}40` }
                    : { background: "var(--dashboard-card-bg)", border: "1px solid var(--dashboard-text)10" }
                }
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={on ? { background: `${couleur}26`, color: couleur } : { background: "var(--dashboard-text)0d", color: "var(--dashboard-text)" }}
                >
                  {m.icone}
                </span>
                <p className="mt-3 text-sm font-bold tracking-tight" style={{ color: on ? couleur : "var(--dashboard-text)" }}>
                  {t(m.titre, m.titreEn)}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--dashboard-text)]/50">{t(m.sous, m.sousEn)}</p>
                <p className="mt-3 text-[10px] text-[var(--dashboard-text)]/40">
                  <b className="text-xs font-bold" style={{ color: on ? couleur : "var(--dashboard-text)" }}>
                    {m.enCours}
                  </b>{" "}
                  {t("en cours", "in progress")} <span className="mx-1.5">·</span>
                  <b className="text-xs font-bold text-[var(--dashboard-text)]/70">{m.total}</b> {t("au total", "in total")}
                </p>
              </button>
            );
          })}
        </div>

        {/* Volet du module actif */}
        {actif === "litiges" && (
          <Card style={{ borderTop: `3px solid ${COULEUR.litiges}`, background: `linear-gradient(180deg, ${COULEUR.litiges}0f, var(--dashboard-card-bg) 140px)` }}>
            <PaneHeader
              titre={t("Litiges", "Disputes")}
              sous={t("Une commande précise, des preuves, la solution que vous demandez.", "One specific order, proof, and the outcome you're asking for.")}
              cta={t("Ouvrir un litige", "Open a dispute")}
              href="/dashboard/demandes/litige"
              couleur={COULEUR.litiges}
            />
            <Regles
              items={[
                <>
                  <b>{t("72 heures", "72 hours")}</b> {t("pour ouvrir un litige, à compter de la réception par le client. Passé ce délai la commande est close et l'argent versé.", "to open a dispute, from receipt by the customer. Past that, the order closes and the money is released.")}
                </>,
                <>
                  {t("Votre partenaire répond le plus tôt possible, ", "Your partner replies as soon as possible, ")}
                  <b>{t("neuf heures au maximum", "nine hours at most")}</b> {t("pour prendre le litige en main.", "to take the dispute in hand.")}
                </>,
              ]}
            />
            <StatRow4
              stats={[
                { valeur: "47 480 F", label: t("bloqués en ce moment", "held right now"), couleur: LITIGE_STATUT_META.cree.couleur },
                { valeur: "83 %", label: t("de remplacements obtenus", "of exchanges granted"), couleur: LITIGE_STATUT_META["gain-cause"].couleur },
                { valeur: "14 h", label: t("pour être tranché en moyenne", "average time to settle") },
                { valeur: "26", label: t("depuis le début", "since the start") },
              ]}
            />

            <GroupTitre label={t("En cours", "In progress")} count={LITIGES_EN_COURS.length} couleur={COULEUR.litiges} />
            <ul>
              {LITIGES_EN_COURS.map((l) => (
                <LitigeLigne key={l.id} row={l} />
              ))}
            </ul>

            <GroupTitre label={t("Tranchés", "Settled")} count={LITIGES_TRANCHES_TOTAL} />
            <ul>
              {LITIGES_TRANCHES.map((l) => (
                <LitigeLigne key={l.id} row={l} />
              ))}
            </ul>
          </Card>
        )}

        {actif === "questions" && (
          <Card style={{ borderTop: `3px solid ${COULEUR.questions}`, background: `linear-gradient(180deg, ${COULEUR.questions}0f, var(--dashboard-card-bg) 140px)` }}>
            <PaneHeader
              titre={t("Questions au partenaire", "Questions to the partner")}
              sous={t("Un tarif, un délai, un enlèvement, un versement qui tarde. Tout ce qui se règle en parlant.", "A rate, a lead time, a pickup, a late payout. Anything settled by talking.")}
              cta={t("Poser une question", "Ask a question")}
              href="/dashboard/demandes/question"
              couleur={COULEUR.questions}
            />
            <Regles
              items={[
                <>
                  {t("Une question ne bloque ", "A question blocks neither ")}
                  <b>{t("ni argent ni stock", "money nor stock")}</b>
                  {t(", et peut être posée à n'importe quel moment.", ", and can be asked any time.")}
                </>,
                <>
                  {t("Votre partenaire répond le plus tôt possible, ", "Your partner replies as soon as possible, ")}
                  <b>{t("neuf heures au maximum.", "nine hours at most.")}</b>
                </>,
              ]}
            />
            <StatRow4
              stats={[
                { valeur: `${QUESTIONS_TOTAL}`, label: t("posées depuis le début", "asked since the start") },
                { valeur: `${QUESTIONS_REPONDUES_TOTAL}`, label: t("déjà répondues", "already answered"), couleur: "#178a3f" },
                { valeur: "4 h", label: t("de réponse en moyenne", "average reply time") },
                { valeur: "2 j", label: t("la plus longue attente", "longest wait") },
              ]}
            />

            <GroupTitre label={t("En cours", "In progress")} count={questionsEnCours.length} couleur={COULEUR.questions} />
            <ul>
              {questionsEnCours.length === 0 && <VideRow texte={t("Aucune question en cours.", "No question in progress.")} />}
              {questionsEnCours.map((q) => (
                <SimpleLigne key={q.id} id={q.id} sujet={q.sujet} date={q.date} etat={t("En traitement", "In progress")} couleur={COULEUR.questions} />
              ))}
            </ul>

            <GroupTitre label={t("Répondues", "Answered")} count={QUESTIONS_REPONDUES_TOTAL} />
            <ul>
              {questionsRepondues.map((q) => (
                <SimpleLigne key={q.id} id={q.id} sujet={q.sujet} date={q.date} etat={t("Répondue", "Answered")} couleur="#178a3f" resolue />
              ))}
            </ul>
          </Card>
        )}

        {actif === "support" && (
          <Card style={{ borderTop: `3px solid ${COULEUR.support}`, background: `linear-gradient(180deg, ${COULEUR.support}0f, var(--dashboard-card-bg) 140px)` }}>
            <PaneHeader
              titre={t("Support technique LM", "LM technical support")}
              sous={t("Une page qui ne charge pas, une vidéo qui ne part pas, un accès perdu, un chiffre qui semble faux.", "A page that won't load, a video that won't play, lost access, a figure that looks wrong.")}
              cta={t("Signaler un problème", "Report a problem")}
              href="/dashboard/demandes/support"
              couleur={COULEUR.support}
            />
            <Regles
              items={[
                <>
                  {t("LM répond ", "LM replies ")}
                  <b>{t("le plus tôt possible", "as soon as possible")}</b>
                  {t(". Un accès bloqué ou un compte suspect passe devant tout le reste.", ". Blocked access or a suspicious account jumps the queue.")}
                </>,
                <>
                  {t("Se signale ", "Reported ")}
                  <b>{t("à tout moment", "any time")}</b>
                  {t(", sans délai d'ouverture, et ne bloque jamais d'argent.", ", with no opening window, and never blocks money.")}
                </>,
              ]}
            />
            <StatRow4
              stats={[
                { valeur: "LM", label: t("répond directement", "replies directly"), couleur: COULEUR.support },
                { valeur: `${SIGNALEMENTS_TOTAL}`, label: t("signalés depuis le début", "reported since the start") },
                { valeur: `${SIGNALEMENTS_CORRIGES_TOTAL}`, label: t("déjà corrigés", "already fixed"), couleur: "#178a3f" },
                { valeur: "9 h", label: t("de correction observée en moyenne", "average observed fix time") },
              ]}
            />

            <GroupTitre label={t("En cours", "In progress")} count={signalementsEnCours.length} couleur={COULEUR.support} />
            <ul>
              {signalementsEnCours.length === 0 && <VideRow texte={t("Aucun signalement en cours.", "No report in progress.")} />}
              {signalementsEnCours.map((s) => (
                <SimpleLigne key={s.id} id={s.id} sujet={s.sujet} date={s.date} etat={t("En traitement", "In progress")} couleur={COULEUR.support} />
              ))}
            </ul>

            <GroupTitre label={t("Corrigés", "Fixed")} count={SIGNALEMENTS_CORRIGES_TOTAL} />
            <ul>
              {signalementsCorriges.map((s) => (
                <SimpleLigne key={s.id} id={s.id} sujet={s.sujet} date={s.date} etat={t("Corrigé", "Fixed")} couleur="#178a3f" resolue />
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}

function PaneHeader({ titre, sous, cta, href, couleur }: { titre: string; sous: string; cta: string; href: string; couleur: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-lg font-bold tracking-tight">{titre}</p>
        <p className="mt-1 max-w-md text-xs text-[var(--dashboard-text)]/50">{sous}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-full px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:brightness-110"
        style={{ background: couleur }}
      >
        {cta}
      </Link>
    </div>
  );
}

// Boîtes "règles de temps" sous le titre du volet — texte et emplacement du
// gras recopiés mot pour mot de la maquette "LM besoin d'assistance"
// (le gras y est neutre, jamais teinté de la couleur du module).
function Regles({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
      {items.map((contenu, i) => (
        <div key={i} className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] px-3.5 py-3 text-[11px] leading-relaxed text-[var(--dashboard-text)]/60 [&_b]:font-semibold [&_b]:text-[var(--dashboard-text)]">
          {contenu}
        </div>
      ))}
    </div>
  );
}

function StatRow4({ stats }: { stats: { valeur: string; label: string; couleur?: string }[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[var(--dashboard-text)]/10 py-4 sm:grid-cols-4">
      {stats.map((s, i) => (
        <div key={i}>
          <p className="text-lg font-bold tracking-tight" style={s.couleur ? { color: s.couleur } : undefined}>
            {s.valeur}
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/45">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function GroupTitre({ label, count, couleur }: { label: string; count: number; couleur?: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-xs font-bold">
      {label}
      <span className="text-[10px] font-semibold" style={{ color: couleur ?? "var(--dashboard-text)" }}>
        {count}
      </span>
    </div>
  );
}

function VideRow({ texte }: { texte: string }) {
  return <li className="py-3 text-xs text-[var(--dashboard-text)]/40">{texte}</li>;
}

function StatutIcone({ couleur, children }: { couleur: string; children: React.ReactNode }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
      style={{ borderColor: couleur, color: couleur, background: `${couleur}0d` }}
    >
      {children}
    </span>
  );
}

// Icône par statut de litige — même tracé que le module Litiges dans la
// maquette "LM besoin d'assistance" fournie (Créé = horloge, En traitement
// = flèche circulaire, changement de colis = échange, retour de fonds =
// retour, gain de cause = coche).
function IconeStatutLitige({ statut }: { statut: LitigeStatut }) {
  const cls = "h-3.5 w-3.5";
  if (statut === "en-traitement") return <IconeEnTraitement className={cls} />;
  if (statut === "changement-colis")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d="M11 5.4 4.6 8.6v6.8L11 18.6l6.4-3.2V8.6z" />
        <path d="M4.6 8.6 11 11.8l6.4-3.2M11 11.8v6.8" />
        <path d="M15.6 3.8 18.4 6l-2.8 2.2" />
      </svg>
    );
  if (statut === "retour-fonds")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <rect x="3.2" y="6.6" width="17.6" height="10.8" rx="2.4" />
        <path d="M14.6 12H9.4M11.4 9.8 9.2 12l2.2 2.2" />
      </svg>
    );
  if (statut === "gain-cause") return <IconeCheck className={cls} />;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.8v4.6M12 15.6v.2" />
    </svg>
  );
}

function IconeCheck({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="8.2" strokeWidth="1.6" />
      <path d="m8.4 12.2 2.6 2.6 4.8-5.4" />
    </svg>
  );
}

function IconeEnTraitement({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 12a8 8 0 1 1-2.5-5.8" />
      <path d="M20.2 4.6V10h-5.4" />
    </svg>
  );
}

function VoirBtn({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text)]/50">
      {label}
    </span>
  );
}

function QuiPastille({ qui }: { qui: Qui }) {
  const { t } = useDashboardLangue();
  const meta = QUI_META[qui];
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[10.5px] text-[var(--dashboard-text)]/55">
      <i className="h-1.5 w-1.5 shrink-0 rounded-full border border-[var(--dashboard-text)]/15" style={{ background: meta.dot }} />
      {t(meta.label, meta.labelEn)}
    </span>
  );
}

function LitigeLigne({ row }: { row: LitigeRow }) {
  const { t } = useDashboardLangue();
  const meta = LITIGE_STATUT_META[row.statut];
  // Barré/gris pour un litige tranché qui n'est pas un gain de cause
  // (changement de colis, retour de fonds) — même règle que estSuspendue
  // (dashboard-commandes/shared) : reste hors de l'encaissé tant que ce
  // n'est pas un gain de cause.
  const barre = row.tranche && row.statut !== "gain-cause";
  const vert = row.statut === "gain-cause";

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-[var(--dashboard-text)]/[0.06] py-3 text-xs last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {row.id} <span className="font-normal text-[var(--dashboard-text)]/50">· {row.ref} · {row.produit}{row.qte ? ` ×${row.qte}` : ""}</span>
        </p>
      </div>
      <i className="hidden h-px flex-1 bg-[var(--dashboard-text)]/10 sm:block" />
      <QuiPastille qui={row.qui} />
      <span className={`w-[84px] shrink-0 text-right font-bold ${barre ? "text-[var(--dashboard-text)]/40 line-through" : ""}`} style={vert ? { color: meta.couleur } : undefined}>
        {row.montant}
      </span>
      <div className="flex w-[168px] shrink-0 items-center gap-2">
        <StatutIcone couleur={meta.couleur}>
          <IconeStatutLitige statut={row.statut} />
        </StatutIcone>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold" style={{ color: meta.couleur }}>{t(meta.label, meta.labelEn)}</p>
          <p className="text-[10px] text-[var(--dashboard-text)]/40">{row.date}</p>
        </div>
      </div>
      {row.tranche && <VoirBtn label={t("Voir", "View")} />}
    </li>
  );
}

function SimpleLigne({
  id,
  sujet,
  date,
  etat,
  couleur,
  resolue,
}: {
  id: string;
  sujet: string;
  date: string;
  etat: string;
  couleur: string;
  /** Affiche le bouton "Voir" — réservé aux lignes déjà closes (répondue/corrigé). */
  resolue?: boolean;
}) {
  const { t } = useDashboardLangue();
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--dashboard-text)]/[0.06] py-3 text-xs last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {id} <span className="font-normal text-[var(--dashboard-text)]/50">· {sujet}</span>
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{date}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatutIcone couleur={couleur}>{resolue ? <IconeCheck /> : <IconeEnTraitement />}</StatutIcone>
        <p className="text-[11px] font-semibold" style={{ color: couleur }}>{etat}</p>
      </div>
      {resolue && <VoirBtn label={t("Voir", "View")} />}
    </li>
  );
}

function IconeLitige() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M6.6 3.8h10.8v16.4H6.6z" />
      <path d="M12 7.8v4.6M12 15.6v.2" />
    </svg>
  );
}

function IconeQuestion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M4.5 5.4h15v10.2h-8.6L6.5 19.4v-3.8h-2z" />
      <path d="M9.4 9.4h5.2M9.4 12.2h3.2" />
    </svg>
  );
}

function IconeSupport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M14.9 4.7a4.6 4.6 0 0 0-5.7 5.9l-4.8 4.8 2.5 2.5 4.8-4.8a4.6 4.6 0 0 0 5.9-5.7l-2.7 2.7-2.2-2.2z" />
    </svg>
  );
}
