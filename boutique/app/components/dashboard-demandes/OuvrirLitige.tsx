"use client";

import { useRef, useState } from "react";
import { Card, Tag, useMockSave } from "../dashboard-accueil/shared";
import { DELAI_DISPONIBILITE, formatCfa } from "../dashboard-commandes/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { EnvoyeeCard, Field, RetourPastille } from "./shared";

/*
  Écran "Ouvrir un litige" (/dashboard/demandes/litige) : atteint depuis le
  bouton du même nom sur le module Litiges de "Demandes" (DemandesModules.tsx).
  Recopié trait pour trait de la maquette fournie (capture "Demandes › Litiges
  › Ouvrir") plutôt que du gabarit générique des deux autres écrans de
  Demandes (PoserQuestion/SignalerProbleme) : bandeau de délai en pleine
  largeur au lieu du SectionHeader eyebrow/titre, ligne "valeur choisie" façon
  faux champ (cf. IconeCurseur plus bas) au-dessus de la liste réelle,
  3 solutions avec taux de succès et pas 2, 4 pastilles d'immobilisation
  et pas 2, un bloc "Les preuves", et deux boutons (Annuler / Ouvrir).

  Les 3 commandes de la liste (C-4819/C-4817/C-4813) et leurs montants
  reprennent exactement C-4819 de DemandesModules.tsx (LITIGES_EN_COURS :
  même produit, mêmes 19 140 F immobilisés, cf. netDe ci-dessous) — les deux
  écrans parlent du même litige. Données statiques, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

type CommandeLitige = {
  id: string;
  produit: string;
  montantPaye: number;
  quantite: number;
  retenueLogistique: number;
  retenueOperation: number;
  // Heures restantes dans la fenêtre des DELAI_DISPONIBILITE heures pour
  // ouvrir un litige — négatif = fenêtre déjà fermée (commande trop
  // ancienne), comme C-4813 ci-dessous ("reçu il y a 4 jours").
  heuresRestantes: number;
};

const COMMANDES_LITIGE: CommandeLitige[] = [
  { id: "C-4819", produit: "Sac cabas en raphia", montantPaye: 21500, quantite: 1, retenueLogistique: 1560, retenueOperation: 800, heuresRestantes: 66 },
  { id: "C-4817", produit: "Ensemble deux pièces en lin", montantPaye: 19900, quantite: 1, retenueLogistique: 1400, retenueOperation: 750, heuresRestantes: 69 },
  { id: "C-4813", produit: "Sérum éclat 30 ml", montantPaye: 12000, quantite: 1, retenueLogistique: 900, retenueOperation: 625, heuresRestantes: -24 },
];

function netDe(c: CommandeLitige): number {
  return c.montantPaye - c.retenueLogistique - c.retenueOperation;
}

// "reçu il y a 6h" / "reçu il y a 4 jours" — dérivé des heuresRestantes,
// même sens que AnneauCompteARebours (dashboard-commandes/shared) : plus
// heuresRestantes est bas, plus la réception est ancienne.
function ecoule(c: CommandeLitige): { texte: string; texteEn: string } {
  const heures = DELAI_DISPONIBILITE - c.heuresRestantes;
  if (heures < 24) return { texte: `${heures} h`, texteEn: `${heures} h` };
  const jours = Math.round(heures / 24);
  return { texte: `${jours} jour${jours > 1 ? "s" : ""}`, texteEn: `${jours} day${jours > 1 ? "s" : ""}` };
}

const SOLUTIONS = [
  {
    key: "changement-colis" as const,
    label: "Remplacement du colis",
    labelEn: "Parcel exchange",
    // Même bleu que "changement-colis" dans DemandesModules/dashboard-commandes
    // (LITIGE_STATUT_META / ISSUES) — la couleur d'une solution reste la
    // même partout dans le dashboard.
    couleur: "#5AA9FF",
    tauxSucces: 83, // même chiffre que "83 % de remplacements obtenus" (DemandesModules StatRow4)
    icone: <IconExchange />,
  },
  {
    key: "retour-fonds" as const,
    label: "Retour de fonds",
    labelEn: "Funds returned",
    couleur: "#FF7A80",
    tauxSucces: 56,
    icone: <IconRefund />,
  },
  {
    key: "autre" as const,
    label: "Autre demande",
    labelEn: "Other request",
    couleur: "#B79BFF",
    tauxSucces: 60,
    icone: <IconAutre />,
  },
];

const PREUVES_COUNT = 3; // cf. mémoire [[dashboard-mock-data-pending-laravel-api]] : téléversement pas encore branché

export default function OuvrirLitige({ first = true }: { first?: boolean }) {
  const { t, langue } = useDashboardLangue();

  const [commandeId, setCommandeId] = useState<string>(COMMANDES_LITIGE[0].id);
  const [solution, setSolution] = useState<(typeof SOLUTIONS)[number]["key"] | null>(SOLUTIONS[0].key);
  const [description, setDescription] = useState(
    t(
      "Le client a reçu le sac avec une anse décousue. Le défaut est visible sur la couture du haut. Il souhaite le même modèle en échange.",
      "The customer received the bag with a torn strap. The flaw is visible on the top seam. They want the same model exchanged."
    )
  );
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);
  const { saving, trigger } = useMockSave();

  // Preuves ajoutées par le partenaire — les PREUVES_COUNT vignettes grises
  // ne sont que le décor mock déjà présent, celles-ci sont de vraies images
  // choisies sur l'appareil (aperçu local via URL.createObjectURL, rien
  // n'est envoyé nulle part, cf. [[dashboard-mock-data-pending-laravel-api]]).
  const [preuvesAjoutees, setPreuvesAjoutees] = useState<{ id: string; url: string }[]>([]);
  const fichierRef = useRef<HTMLInputElement>(null);

  const ajouterPreuves = (fichiers: FileList | null) => {
    if (!fichiers) return;
    const nouvelles = Array.from(fichiers).map((f) => ({ id: `${f.name}-${f.lastModified}-${Math.random()}`, url: URL.createObjectURL(f) }));
    setPreuvesAjoutees((liste) => [...liste, ...nouvelles]);
  };

  const retirerPreuve = (id: string) => {
    setPreuvesAjoutees((liste) => {
      const cible = liste.find((p) => p.id === id);
      if (cible) URL.revokeObjectURL(cible.url);
      return liste.filter((p) => p.id !== id);
    });
  };

  const commande = COMMANDES_LITIGE.find((c) => c.id === commandeId) ?? null;

  const envoyer = () => {
    if (!commande) return setErreur(t("Choisissez une commande.", "Choose an order."));
    if (commande.heuresRestantes <= 0) return setErreur(t("Cette commande a dépassé le délai d'ouverture.", "This order is past the opening window."));
    if (!solution) return setErreur(t("Choisissez la solution demandée.", "Choose the outcome you're asking for."));
    if (!description.trim()) return setErreur(t("Décrivez ce qui s'est passé.", "Describe what happened."));
    setErreur(null);
    trigger(() => setEnvoye(true));
  };

  const recommencer = () => {
    setSolution(SOLUTIONS[0].key);
    setDescription("");
    setEnvoye(false);
    preuvesAjoutees.forEach((p) => URL.revokeObjectURL(p.url));
    setPreuvesAjoutees([]);
  };

  return (
    <>
      <RetourPastille href="/dashboard/demandes" label={t("Demandes › Litiges › Ouvrir", "Requests › Disputes › Open")} />
      <h2 className="sr-only">{t("Ouvrir un litige", "Open a dispute")}</h2>

      <InfoBar first={first}>
        <b>{DELAI_DISPONIBILITE} {t("heures", "hours")}</b> {t("après la réception pour ouvrir. Ensuite votre partenaire prend la main le plus tôt possible, ", "after receipt to open. Your partner then takes it in hand as soon as possible, ")}
        <b>{t("neuf heures au maximum.", "nine hours at most.")}</b>
      </InfoBar>

      {envoye ? (
        <EnvoyeeCard
          titre={t("Litige ouvert", "Dispute opened")}
          message={t("Votre partenaire agréé prend la main le plus tôt possible, neuf heures au maximum. L'argent de la commande reste suspendu jusqu'à la décision.", "Your approved partner takes it in hand as soon as possible, nine hours at most. The order's money stays held until a decision.")}
          retourLabel={t("Ouvrir un autre litige", "Open another dispute")}
          onRecommencer={recommencer}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <Card className="!bg-[var(--dashboard-card-bg)]">
            {erreur && <p className="mb-3 rounded-xl bg-[#ffe1e2] px-3.5 py-2.5 text-xs font-semibold text-[#c8262d]">{erreur}</p>}

            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("La commande concernée", "The order in question")}</p>
              <Tag tone="pink">{t("Choisie, pas saisie", "Chosen, not typed")}</Tag>
            </div>

            {/* Faux champ : affiche la commande choisie, curseur décoratif
                inclus — le "Choisie, pas saisie" ci-dessus dit bien que rien
                ici ne se tape, la forme de champ n'est qu'un habillage. */}
            {commande && (
              <div className="mt-1.5 flex items-center gap-1.5 rounded-xl border border-brand-pink/40 bg-brand-pink/5 px-3.5 py-2.5 text-xs">
                <span className="font-semibold">{commande.id}</span>
                <span className="truncate text-[var(--dashboard-text)]/50">
                  {commande.produit} · {t("reçu il y a", "received")} {ecoule(commande)[langue === "EN" ? "texteEn" : "texte"]}
                </span>
                <span className="ml-0.5 h-3 w-px shrink-0 animate-pulse bg-brand-pink" aria-hidden />
              </div>
            )}

            <div className="mt-2.5 divide-y divide-[var(--dashboard-text)]/[0.06] overflow-hidden rounded-xl border border-[var(--dashboard-text)]/15">
              {COMMANDES_LITIGE.map((c) => {
                const eligible = c.heuresRestantes > 0;
                const on = c.id === commandeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!eligible}
                    onClick={() => setCommandeId(c.id)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition ${
                      !eligible
                        ? "cursor-not-allowed opacity-45"
                        : on
                        ? "border-l-2 border-brand-pink bg-gradient-to-r from-brand-pink/[0.1] to-transparent"
                        : "hover:bg-[var(--dashboard-text)]/[0.03]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{c.id}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[var(--dashboard-text)]/45">
                        {c.produit} · {formatCfa(c.montantPaye)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-[10px] text-[var(--dashboard-text)]/45">
                        {t("Reçu il y a", "Received")} {ecoule(c)[langue === "EN" ? "texteEn" : "texte"]}
                      </span>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${eligible ? "text-[#178a3f]" : "text-[var(--dashboard-text)]/30"}`}>
                        {eligible ? <IconCheckRing /> : <IconBan />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5">
              <Field label={t("Ce qui s'est passé", "What happened")}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={t("ex. Le client a reçu le produit avec un défaut visible…", "e.g. The customer received the product with a visible defect…")}
                  className="w-full min-w-0 resize-none bg-transparent text-xs font-medium leading-relaxed text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
            </div>

            <div className="mt-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Les preuves", "Proof")}</p>
                <Tag tone="neutral">{PREUVES_COUNT + preuvesAjoutees.length} {t("images", "images")}</Tag>
              </div>
              <div className="mt-1.5 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {Array.from({ length: PREUVES_COUNT }).map((_, i) => (
                  <div key={i} className="flex aspect-square items-center justify-center rounded-xl bg-[var(--dashboard-surface-2)] text-[var(--dashboard-text)]/25">
                    <IconImage />
                  </div>
                ))}
                {preuvesAjoutees.map((p) => (
                  <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--dashboard-surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local d'un object URL, pas une image distante */}
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => retirerPreuve(p.id)}
                      aria-label={t("Retirer cette preuve", "Remove this proof")}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <IconPlus className="h-3 w-3 rotate-45" />
                    </button>
                  </div>
                ))}
                <input
                  ref={fichierRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    ajouterPreuves(e.target.files);
                    e.target.value = ""; // permet de reprendre le même fichier ensuite
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fichierRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[var(--dashboard-text)]/20 text-[var(--dashboard-text)]/35 transition hover:border-brand-pink/40 hover:text-brand-pink"
                  aria-label={t("Ajouter une preuve", "Add proof")}
                >
                  <IconPlus />
                </button>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="!bg-[var(--dashboard-card-bg)]">
              <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("La solution que vous demandez", "The outcome you're asking for")}</p>
              <div className="mt-2 flex flex-col gap-2">
                {SOLUTIONS.map((s) => {
                  const on = solution === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSolution(s.key)}
                      className="flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-xs font-semibold transition"
                      style={
                        on
                          ? { borderColor: `${s.couleur}80`, background: `${s.couleur}14` }
                          : { borderColor: "var(--dashboard-text)1a" }
                      }
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${s.couleur}22`, color: s.couleur }}
                      >
                        {s.icone}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[var(--dashboard-text)]">{t(s.label, s.labelEn)}</span>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
                        style={{ background: `${s.couleur}1f`, color: s.couleur }}
                      >
                        {s.tauxSucces} %
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {commande && (
              <Card className="border !border-[#FFB84D]/30 !bg-[#FFB84D]/[0.06]">
                <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Ce que ce litige immobilise", "What this dispute holds")}</p>
                <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
                  <ImmobiliseTile icone={<IconCoin />} valeur={formatCfa(netDe(commande))} />
                  <ImmobiliseTile icone={<IconBox />} valeur={`${commande.quantite} ${t("unité(s)", "unit(s)")}`} />
                  <ImmobiliseTile icone={<IconClock />} valeur={`${Math.max(commande.heuresRestantes, 0)} h`} />
                  <ImmobiliseTile icone={<IconTag />} valeur={commande.id} />
                </div>
              </Card>
            )}

            <button
              type="button"
              onClick={recommencer}
              disabled={saving}
              className="rounded-full border border-brand-pink/50 bg-transparent px-5 py-3 text-center text-xs font-semibold text-brand-pink transition hover:bg-brand-pink/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("Annuler", "Cancel")}
            </button>
            <button
              type="button"
              onClick={envoyer}
              disabled={saving}
              className="rounded-full bg-white px-5 py-3 text-center text-xs font-semibold text-[#141220] shadow-[0_2px_10px_rgba(20,18,32,0.08)] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70 dark:bg-brand-pink dark:text-white"
            >
              {saving ? t("Envoi…", "Sending…") : t("Ouvrir le litige", "Open the dispute")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Bandeau de délai en pleine largeur — remplace le SectionHeader
// eyebrow/titre pour cet écran précis, recopié de la maquette fournie
// (icône + texte, pas de titre visible séparé).
function InfoBar({ first, children }: { first?: boolean; children: React.ReactNode }) {
  return (
    <div className={`${first ? "mt-6" : "mt-8"} mb-6 flex items-center gap-3 rounded-2xl card-tint px-4 py-3.5 text-xs leading-relaxed text-[var(--dashboard-text)]/70 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] [&_b]:font-semibold [&_b]:text-[var(--dashboard-text)]`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
        <IconCible />
      </span>
      <p>{children}</p>
    </div>
  );
}

function ImmobiliseTile({ icone, valeur }: { icone: React.ReactNode; valeur: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-[#FFB84D]/25 bg-[#FFB84D]/[0.05] px-1.5 py-2.5">
      <span style={{ color: "#a8690a" }}>{icone}</span>
      <p className="truncate text-xs font-bold" style={{ color: "#a8690a" }}>{valeur}</p>
    </div>
  );
}

/* --- icônes, même recette (stroke 1.6-1.8, arrondi) que le reste du dashboard --- */

function IconCible() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

function IconCheckRing() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.2" strokeWidth="1.6" />
      <path d="m8.4 12.2 2.6 2.6 4.8-5.4" />
    </svg>
  );
}

function IconBan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.2" />
      <path d="m6.6 6.6 10.8 10.8" />
    </svg>
  );
}

function IconExchange() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M11 5.4 4.6 8.6v6.8L11 18.6l6.4-3.2V8.6z" />
      <path d="M4.6 8.6 11 11.8l6.4-3.2M11 11.8v6.8" />
      <path d="M15.6 3.8 18.4 6l-2.8 2.2" />
    </svg>
  );
}

function IconRefund() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3.2" y="6.6" width="17.6" height="10.8" rx="2.4" />
      <path d="M14.6 12H9.4M11.4 9.8 9.2 12l2.2 2.2" />
    </svg>
  );
}

function IconAutre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M9.4 9.6a2.6 2.6 0 1 1 3.4 2.5c-.7.3-1 .8-1 1.5v.3" />
      <path d="M12 17v.2" />
    </svg>
  );
}

function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M9.6 14.4c.4.7 1.2 1.1 2.2 1.1 1.4 0 2.4-.8 2.4-1.9 0-2.6-4.6-1.3-4.6-3.9 0-1.1 1-1.9 2.4-1.9.9 0 1.7.4 2.1 1M12 7.4v9.2" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4.6 8 12 4.2 19.4 8 12 11.8 4.6 8Z" />
      <path d="M4.6 8v8L12 19.8 19.4 16V8M12 11.8v8" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.8v4.6l3 1.8" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M13 4.4h5.6a1 1 0 0 1 1 1V11a1 1 0 0 1-.3.7l-8 8a1 1 0 0 1-1.4 0l-6.6-6.6a1 1 0 0 1 0-1.4l8-8a1 1 0 0 1 .7-.3Z" />
      <circle cx="16.4" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.2" />
      <circle cx="8.6" cy="9.6" r="1.5" />
      <path d="m5.4 17 4.8-5.2 3.2 3.4 2.2-2.4 3 4.2" />
    </svg>
  );
}

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}
