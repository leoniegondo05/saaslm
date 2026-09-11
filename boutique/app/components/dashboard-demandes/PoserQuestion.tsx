"use client";

import Link from "next/link";
import { useState } from "react";
import AssistanceLMModal from "../dashboard-accueil/AssistanceLMModal";
import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";
import { SparkleIcon } from "../DashboardHeader";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { EnvoyeeCard, Field, RetourPastille } from "./shared";

/*
  Écran "Poser une question" (/dashboard/demandes/question) : atteint
  depuis le module Questions de "Demandes" (DemandesModules.tsx). Part
  toujours chez le partenaire agréé — pas de destinataire à choisir, pas de
  commande obligatoire (contrairement à un litige). Recopié champ pour
  champ de l'Écran 17 de la maquette "LM besoin d'assistance" fournie :
  pièces jointes et commande rattachée facultatives, encart "Avant
  d'envoyer" avec une question déjà répondue en exemple, et une seule
  porte de sortie si ce n'est pas une question — l'assistance générale
  (DemandesModules), jamais le litige directement ni le support technique
  LM (cf. tableau de la maquette, point 6 : "Une question ne renvoie
  jamais au support LM").
*/

const PARTENAIRE_NOM = "Groupe Logistique Ivoire";

// Commandes proposables pour "Rattacher une commande" — mock propre à cet
// écran (pas les mêmes ids que dashboard-commandes/shared, qui ne connaît
// pas encore C-4816) tant que l'API Laravel ne relie pas les demandes aux
// vraies commandes du compte, cf. mémoire
// [[dashboard-mock-data-pending-laravel-api]].
const COMMANDES_RATTACHABLES = [
  { id: "C-4816", produit: "Sandales tressées" },
  { id: "C-4819", produit: "Sac cabas en raphia" },
  { id: "C-4811", produit: "Foulard en soie" },
];

export default function PoserQuestion({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();

  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [pieces, setPieces] = useState<File[]>([]);
  const [commandeId, setCommandeId] = useState<string | null>(null);
  const [commandeOuverte, setCommandeOuverte] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoyee, setEnvoyee] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);

  const commande = COMMANDES_RATTACHABLES.find((c) => c.id === commandeId) ?? null;

  const ajouterPieces = (fichiers: FileList | null) => {
    if (!fichiers) return;
    setPieces((liste) => [...liste, ...Array.from(fichiers)]);
  };

  const envoyer = () => {
    if (!sujet.trim() || !message.trim()) {
      setErreur(t("Le sujet et le message sont requis.", "Subject and message are required."));
      return;
    }
    setErreur(null);
    setEnvoyee(true);
  };

  const recommencer = () => {
    setSujet("");
    setMessage("");
    setPieces([]);
    setCommandeId(null);
    setEnvoyee(false);
  };

  return (
    <>
      <RetourPastille href="/dashboard/demandes" label={t("Demandes › Questions › Poser", "Requests › Questions › Ask")} />
      <SectionHeader
        eyebrow={t("Demandes · Questions", "Requests · Questions")}
        title={t("Poser une question", "Ask a question")}
        subtitle={t(
          "Réponse le plus tôt possible, neuf heures au maximum. Rien n'est bloqué, ni argent ni stock, et la question peut être posée à tout moment.",
          "Answered as soon as possible, nine hours at most. Nothing is blocked, neither money nor stock, and the question can be asked at any time."
        )}
        first={first}
        layout="inline"
        actions={
          <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] px-3.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
              <TruckIcon />
            </span>
            <div>
              <p className="text-xs font-semibold">{PARTENAIRE_NOM}</p>
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{t("Votre partenaire agréé", "Your approved partner")}</p>
            </div>
          </div>
        }
      />

      {envoyee ? (
        <EnvoyeeCard
          titre={t("Question envoyée", "Question sent")}
          message={t(`${PARTENAIRE_NOM} répond le plus tôt possible, neuf heures au maximum.`, `${PARTENAIRE_NOM} replies as soon as possible, nine hours at most.`)}
          retourLabel={t("Poser une autre question", "Ask another question")}
          onRecommencer={recommencer}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="!bg-[var(--dashboard-card-bg)]">
            {erreur && <p className="mb-3 rounded-xl bg-[#ffe1e2] px-3.5 py-2.5 text-xs font-semibold text-[#c8262d]">{erreur}</p>}

            <Field label={t("Le sujet", "Subject")}>
              <input
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                placeholder={t("ex. Frais logistiques du 26 août", "e.g. Logistics fees for Aug. 26")}
                className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
              />
            </Field>

            <div className="mt-3">
              <Field label={t("Votre question", "Your question")}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder={t("Décrivez votre question…", "Describe your question…")}
                  className="w-full min-w-0 resize-none bg-transparent text-xs font-medium leading-relaxed text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
            </div>

            <div className="mt-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Pièces jointes", "Attachments")}</p>
                <Tag tone="neutral">{t("Facultatif", "Optional")}</Tag>
              </div>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {pieces.map((fichier, i) => (
                  <PieceThumb key={`${fichier.name}-${i}`} fichier={fichier} onRetirer={() => setPieces((liste) => liste.filter((_, j) => j !== i))} />
                ))}
                <label className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[var(--dashboard-text)]/20 text-[var(--dashboard-text)]/40 transition hover:border-brand-pink/40 hover:text-brand-pink">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      ajouterPieces(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="mt-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Rattacher une commande", "Attach an order")}</p>
                <Tag tone="neutral">{t("Facultatif", "Optional")}</Tag>
              </div>
              <div className="relative mt-1.5">
                <button
                  type="button"
                  onClick={() => setCommandeOuverte((o) => !o)}
                  className="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-surface-2)] px-3 py-2.5 text-left text-xs"
                >
                  <span className={commande ? "font-semibold text-[var(--dashboard-text)]" : "text-[var(--dashboard-text)]/40"}>
                    {commande ? `${commande.id} · ${t(commande.produit, commande.produit)}` : t("Choisir une commande…", "Choose an order…")}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" className={`h-3 w-3 shrink-0 text-[var(--dashboard-text)]/40 transition ${commandeOuverte ? "rotate-180" : ""}`} aria-hidden>
                    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {commandeOuverte && (
                  <div className="absolute inset-x-0 top-full z-10 mt-1.5 overflow-hidden rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] shadow-[0_8px_24px_rgba(20,18,32,0.16)]">
                    {commande && (
                      <button
                        type="button"
                        onClick={() => {
                          setCommandeId(null);
                          setCommandeOuverte(false);
                        }}
                        className="block w-full border-b border-[var(--dashboard-text)]/[0.06] px-3.5 py-2.5 text-left text-xs text-[var(--dashboard-text)]/50 transition hover:bg-[var(--dashboard-text)]/[0.03]"
                      >
                        {t("Ne rattacher aucune commande", "Attach no order")}
                      </button>
                    )}
                    {COMMANDES_RATTACHABLES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCommandeId(c.id);
                          setCommandeOuverte(false);
                        }}
                        className={`block w-full px-3.5 py-2.5 text-left text-xs transition last:border-0 ${
                          c.id === commandeId ? "bg-brand-pink/[0.08] font-semibold" : "hover:bg-[var(--dashboard-text)]/[0.03]"
                        }`}
                      >
                        {c.id} <span className="font-normal text-[var(--dashboard-text)]/50">· {t(c.produit, c.produit)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] text-[var(--dashboard-text)]/40">
                {t("Rattacher une commande aide à répondre plus vite, mais ne bloque rien.", "Attaching an order helps answer faster, but blocks nothing.")}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                onClick={envoyer}
                className="rounded-full bg-[#141220] px-5 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
              >
                {t("Envoyer la question", "Send question")}
              </button>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="!bg-[var(--dashboard-card-bg)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">{t("Avant d'envoyer", "Before sending")}</p>
                <Tag tone="neutral">{t("Réponse immédiate", "Instant answer")}</Tag>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--dashboard-text)]/55">
                {t(
                  "Beaucoup de questions ont déjà leur réponse. L'assistance peut vous répondre tout de suite, et vous n'envoyez la question que si la réponse ne suffit pas.",
                  "Many questions already have their answer. The assistant can reply right away, and you only send the question if that answer isn't enough."
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowAssistance(true)}
                className="mt-3 flex w-full items-center gap-2.5 rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] px-3.5 py-2.5 text-left transition hover:border-brand-pink/30"
              >
                <SparkleIcon />
                <span>
                  <span className="block text-xs font-semibold leading-tight">{t("Pourquoi ces frais sont-ils plus élevés ?", "Why are these fees higher?")}</span>
                  <span className="block text-[10px] text-[var(--dashboard-text)]/40">{t("Assistance LM", "LM assistance")}</span>
                </span>
              </button>
            </Card>

            <Card className="!bg-[var(--dashboard-card-bg)]">
              <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Ce n'est peut-être pas une question", "This might not be a question")}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--dashboard-text)]/55">
                {t(
                  "Si le colis est abîmé ou n'est jamais arrivé, ce n'est pas une question mais un litige : il exige des photos, demande une solution précise, et bloque l'argent de la commande jusqu'à la décision.",
                  "If the package is damaged or never arrived, that's not a question but a dispute: it requires photos, requests a specific outcome, and holds the order's money until a decision."
                )}
              </p>
              <Link
                href="/dashboard/demandes"
                className="mt-3 block w-full rounded-full border border-brand-pink/45 bg-[var(--dashboard-card-bg)]/60 px-4 py-2.5 text-center text-xs font-semibold text-brand-pink"
              >
                {t("Besoin d'assistance", "Need help")}
              </Link>
            </Card>

            <Card className="!bg-[var(--dashboard-card-bg)]">
              <Link
                href="/dashboard/demandes"
                className="block w-full rounded-full border border-[var(--dashboard-text)]/15 px-4 py-2.5 text-center text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
              >
                {t("Annuler", "Cancel")}
              </Link>
              <button
                type="button"
                onClick={envoyer}
                className="mt-2 block w-full rounded-full bg-[#141220] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
              >
                {t("Envoyer la question", "Send question")}
              </button>
            </Card>
          </div>
        </div>
      )}

      {showAssistance && <AssistanceLMModal activeTab={null} onFermer={() => setShowAssistance(false)} />}
    </>
  );
}

// Vignette d'une pièce jointe : aperçu image via URL objet locale — le
// fichier ne quitte jamais le navigateur, cf.
// [[dashboard-mock-data-pending-laravel-api]] (pas d'API d'upload encore).
function PieceThumb({ fichier, onRetirer }: { fichier: File; onRetirer: () => void }) {
  const { t } = useDashboardLangue();
  const estImage = fichier.type.startsWith("image/");
  return (
    <div className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-surface-2)]">
      {estImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu local (URL objet), pas une image du site.
        <img src={URL.createObjectURL(fichier)} alt={fichier.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[var(--dashboard-text)]/40">
          {fichier.name.split(".").pop()?.slice(0, 4).toUpperCase()}
        </span>
      )}
      <button
        type="button"
        onClick={onRetirer}
        aria-label={t("Retirer la pièce jointe", "Remove attachment")}
        className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden>
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M2.8 16.2V8.4a1 1 0 0 1 1-1h9.4v8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.2 10.4h3.6l3.4 3.2v2.6h-1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.2" cy="17.4" r="1.9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.6" cy="17.4" r="1.9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
