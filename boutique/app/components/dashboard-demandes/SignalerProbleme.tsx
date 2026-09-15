"use client";

import { useRef, useState } from "react";
import { Card, SectionHeader, useMockSave } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { EnvoyeeCard, Field, RetourPastille } from "./shared";

/*
  Écran "Signaler un problème" (/dashboard/demandes/support) : atteint
  depuis le module Support technique LM de "Demandes"
  (DemandesModules.tsx). Seul destinataire qui n'est pas le partenaire
  agréé — va chez LM. Pas de commande à rattacher, pas de solution à
  choisir : on décrit, et on dit si c'est bloquant.
*/

const LIEUX: { key: string; label: string; labelEn: string }[] = [
  { key: "commande", label: "Page de commande", labelEn: "Order page" },
  { key: "produits", label: "Produits", labelEn: "Products" },
  { key: "commandes", label: "Commandes", labelEn: "Orders" },
  { key: "versements", label: "Versements", labelEn: "Payouts" },
  { key: "acces", label: "Accès et sécurité", labelEn: "Access & security" },
  { key: "autre", label: "Autre", labelEn: "Other" },
];

const GRAVITES: { key: string; label: string; labelEn: string; note: string; noteEn: string; couleur: string }[] = [
  { key: "gene", label: "Oui, c'est gênant", labelEn: "Yes, it's annoying", note: "Je continue autrement", noteEn: "I'll work around it", couleur: "#4FE0AE" },
  { key: "ventes", label: "Ça me fait perdre des ventes", labelEn: "It's costing me sales", note: "Mes clients voient le défaut", noteEn: "My customers see the issue", couleur: "#FFB84D" },
  { key: "bloque", label: "Je suis bloqué ou mon compte est en danger", labelEn: "I'm blocked or my account is at risk", note: "Passe devant tout le reste", noteEn: "Jumps the queue", couleur: "#FF7A80" },
];

// Un icône par pièce jointe automatique (Joint automatiquement), même
// tracé et même ordre que la maquette "LM besoin d'assistance" (Écran 18).
const JOINTS: { key: string; label: string; labelEn: string }[] = [
  { key: "telephone", label: "Téléphone", labelEn: "Phone" },
  { key: "navigateur", label: "Navigateur", labelEn: "Browser" },
  { key: "heure", label: "Heure", labelEn: "Time" },
  { key: "page", label: "La page", labelEn: "The page" },
];

// Captures d'écran jointes au signalement : aperçu local (URL objet) tant
// qu'il n'existe pas d'endpoint d'upload côté API, cf. mémoire
// [[dashboard-mock-data-pending-laravel-api]] — rien n'est envoyé, la
// pièce jointe reste en mémoire du navigateur comme le reste du formulaire.
type Capture = { id: string; url: string };

export default function SignalerProbleme({ first = true }: { first?: boolean }) {
  const { t } = useDashboardLangue();

  const [lieu, setLieu] = useState<string>("commande");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [gravite, setGravite] = useState<string>("gene");
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);
  const { saving, trigger } = useMockSave();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ajouterCaptures = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const ajoutees = Array.from(files).map((f) => ({ id: `${f.name}-${f.lastModified}-${Math.random()}`, url: URL.createObjectURL(f) }));
    setCaptures((c) => [...c, ...ajoutees]);
  };

  const envoyer = () => {
    if (!sujet.trim() || !message.trim()) {
      setErreur(t("Le sujet et la description sont requis.", "Subject and description are required."));
      return;
    }
    setErreur(null);
    trigger(() => setEnvoye(true));
  };

  const recommencer = () => {
    setLieu("commande");
    setSujet("");
    setMessage("");
    setGravite("gene");
    setCaptures([]);
    setEnvoye(false);
  };

  return (
    <>
      <RetourPastille href="/dashboard/demandes" label={t("Demandes › Support technique › Signaler", "Requests › Technical support › Report")} />
      <SectionHeader
        eyebrow={t("Demandes · Support technique", "Requests · Technical support")}
        title={t("Signaler un problème", "Report a problem")}
        subtitle={t(
          "Réponse le plus tôt possible. Rien n'est bloqué, et un problème d'accès ou de sécurité passe devant tout le reste.",
          "Answered as soon as possible. Nothing is blocked, and an access or security issue jumps the queue."
        )}
        first={first}
        layout="inline"
        actions={<DestinationBadge />}
      />

      {envoye ? (
        <EnvoyeeCard
          titre={t("Signalement envoyé", "Report sent")}
          message={t("LM répond le plus tôt possible. L'appareil, le navigateur et l'heure sont déjà joints à votre place.", "LM replies as soon as possible. Your device, browser and time have already been attached for you.")}
          retourLabel={t("Signaler un autre problème", "Report another problem")}
          onRecommencer={recommencer}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="!bg-[var(--dashboard-card-bg)]">
            <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Où ça se passe", "Where it happens")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LIEUX.map((l) => {
                const on = lieu === l.key;
                return (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => setLieu(l.key)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                      on ? "bg-[#141220] text-white dark:bg-brand-pink" : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60 hover:bg-[var(--dashboard-text)]/[0.1]"
                    }`}
                  >
                    {t(l.label, l.labelEn)}
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5">
              <Field label={t("Le sujet", "Subject")}>
                <input
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder={t("ex. La vidéo ne se lance pas sur téléphone", "e.g. The video won't play on phone")}
                  className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
            </div>

            <div className="mt-3">
              <Field label={t("Ce qui se passe", "What's happening")}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder={t("Décrivez le problème…", "Describe the problem…")}
                  className="w-full min-w-0 resize-none bg-transparent text-xs font-medium leading-relaxed text-[var(--dashboard-text)] outline-none placeholder:font-normal placeholder:text-[var(--dashboard-text)]/30"
                />
              </Field>
            </div>

            <div className="mt-3.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  ajouterCaptures(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Captures d'écran", "Screenshots")}</p>
                {captures.length > 0 && (
                  <span className="rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[var(--dashboard-text)]/60">
                    {t(`${captures.length} image${captures.length > 1 ? "s" : ""}`, `${captures.length} image${captures.length > 1 ? "s" : ""}`)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {captures.map((c) => (
                  <div
                    key={c.id}
                    className="h-14 w-14 shrink-0 rounded-xl border border-[var(--dashboard-text)]/15 bg-cover bg-center"
                    style={{ backgroundImage: `url(${c.url})` }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={t("Ajouter une capture d'écran", "Add a screenshot")}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--dashboard-text)]/25 text-[var(--dashboard-text)]/40 transition hover:border-[var(--dashboard-text)]/40 hover:text-[var(--dashboard-text)]/60"
                >
                  <IconePlus />
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--dashboard-text)]/40">
                {t(
                  "Une capture vaut mieux qu'une description : elle montre l'écran exact et l'heure.",
                  "A screenshot beats a description: it shows the exact screen and time."
                )}
              </p>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="!bg-[var(--dashboard-card-bg)]">
              <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Est-ce que vous pouvez travailler ?", "Can you still work?")}</p>
              <div className="mt-2 flex flex-col gap-2">
                {GRAVITES.map((g) => {
                  const on = gravite === g.key;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setGravite(g.key)}
                      className="flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition"
                      style={on ? { borderColor: `${g.couleur}80`, background: `${g.couleur}10` } : { borderColor: "var(--dashboard-text)1a" }}
                    >
                      <span className="shrink-0" style={{ color: g.couleur }}>
                        <IconeGravite gravite={g.key} />
                      </span>
                      <span className="min-w-0">
                        <p className="text-xs font-semibold" style={{ color: on ? g.couleur : "var(--dashboard-text)" }}>
                          {t(g.label, g.labelEn)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/45">{t(g.note, g.noteEn)}</p>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="!bg-[var(--dashboard-card-bg)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[var(--dashboard-text)]/40">{t("Joint automatiquement", "Attached automatically")}</p>
                <span className="rounded-full bg-[#38BDF8]/15 px-2.5 py-1 text-[10px] font-semibold text-[#0EA5E9]">
                  {t("Sans rien saisir", "Nothing to fill in")}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {JOINTS.map((j) => (
                  <div
                    key={j.key}
                    className="flex flex-col items-center gap-2 rounded-xl border border-[#38BDF8]/25 bg-[#38BDF8]/5 px-2 py-3 text-center"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#38BDF8]">
                      <IconeJoint joint={j.key} />
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--dashboard-text)]">{t(j.label, j.labelEn)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--dashboard-text)]/55">
                {t(
                  "L'appareil, le navigateur, l'heure exacte et la page où vous étiez partent avec le signalement. Rien à écrire, LM reproduit le problème sans vous rappeler.",
                  "Device, browser, exact time and the page you were on are sent with the report. Nothing to write — LM reproduces the issue without calling you back."
                )}
              </p>
            </Card>

            <Card className="!bg-[var(--dashboard-card-bg)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-[var(--dashboard-text)]">{t("Avant d'envoyer", "Before you send")}</p>
                <span className="rounded-full bg-brand-purple/15 px-2.5 py-1 text-[10px] font-semibold text-brand-purple">
                  {t("Réponse immédiate", "Instant answer")}
                </span>
              </div>
              <button
                type="button"
                className="mt-2.5 flex w-full items-center gap-2.5 rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-surface-2)] px-3.5 py-2.5 text-left transition hover:bg-[var(--dashboard-text)]/[0.04]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
                  <IconeEtincelle />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-[var(--dashboard-text)]">
                    {sujet.trim() ? t(`Pourquoi « ${sujet.trim()} » ?`, `Why "${sujet.trim()}"?`) : t("Pourquoi ma vidéo ne se lance pas ?", "Why won't my video play?")}
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{t("Assistance LM", "LM assistance")}</span>
                </span>
              </button>
            </Card>

            {erreur && <p className="rounded-xl bg-[#ffe1e2] px-3.5 py-2.5 text-xs font-semibold text-[#c8262d]">{erreur}</p>}

            <Card className="!bg-[var(--dashboard-card-bg)]">
              <button
                type="button"
                onClick={recommencer}
                disabled={saving}
                className="w-full rounded-full border border-brand-pink/50 bg-transparent px-5 py-2.5 text-center text-xs font-semibold text-brand-pink transition hover:bg-brand-pink/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("Annuler", "Cancel")}
              </button>
              <button
                type="button"
                onClick={envoyer}
                disabled={saving}
                className="mt-2 w-full rounded-full bg-[#141220] px-5 py-2.5 text-center text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 dark:bg-brand-pink"
              >
                {saving ? t("Envoi…", "Sending…") : t("Envoyer à LM", "Send to LM")}
              </button>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

// Pastille destinataire, à droite du titre : rappelle que ce formulaire ne
// va pas chez le partenaire agréé (comme Litiges/Questions) mais chez LM
// directement — même recette que le chip "Partenaire agréé" de
// DashboardHeader, teinte bleue pour matcher COULEUR.support de
// DemandesModules.tsx.
function DestinationBadge() {
  const { t } = useDashboardLangue();
  return (
    <span className="flex items-center gap-2 rounded-full border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] px-3 py-1.5 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#38BDF8]/15 text-[#38BDF8]">
        <IconeSupport />
      </span>
      <span className="leading-tight">
        <span className="block text-[11px] font-semibold text-[var(--dashboard-text)]">{t("Support technique LM", "LM technical support")}</span>
        <span className="block text-[10px] text-[var(--dashboard-text)]/45">{t("Pas votre partenaire", "Not your partner")}</span>
      </span>
    </span>
  );
}

function IconeSupport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M14.9 4.7a4.6 4.6 0 0 0-5.7 5.9l-4.8 4.8 2.5 2.5 4.8-4.8a4.6 4.6 0 0 0 5.9-5.7l-2.7 2.7-2.2-2.2z" />
    </svg>
  );
}

// Icône de chaque option "Est-ce que vous pouvez travailler ?" — même
// tracé que la maquette (cercle + coche / cercle + point d'exclamation /
// bouclier + point d'exclamation).
function IconeGravite({ gravite }: { gravite: string }) {
  const cls = "h-4 w-4";
  if (gravite === "gene")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="m8.4 12.2 2.6 2.6 4.8-5.4" />
      </svg>
    );
  if (gravite === "ventes")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.8v4.6M12 15.6v.2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M12 3.4 5 6.2v5.6c0 4 3 7 7 8.8 4-1.8 7-4.8 7-8.8V6.2z" />
      <path d="M12 8.6v4M12 15.4v.2" />
    </svg>
  );
}

// Icône de chaque pièce jointe automatique (Joint automatiquement) — même
// tracé que la maquette (téléphone / globe / horloge / document).
function IconeJoint({ joint }: { joint: string }) {
  const cls = "h-4 w-4";
  if (joint === "telephone")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <rect x="7" y="2.8" width="10" height="18.4" rx="2.4" />
        <path d="M10.8 18.6h2.4" />
      </svg>
    );
  if (joint === "navigateur")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <circle cx="12" cy="12" r="8.4" />
        <path d="M3.8 12h16.4M12 3.6c2.2 2.4 3.3 5.3 3.3 8.4s-1.1 6-3.3 8.4c-2.2-2.4-3.3-5.3-3.3-8.4S9.8 6 12 3.6z" />
      </svg>
    );
  if (joint === "heure")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.6V12l3 1.8" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <path d="M6.4 3.8h11.2v16.4l-2.8-1.7-2.8 1.7-2.8-1.7-2.8 1.7z" />
      <path d="M9.6 8.6h4.8M9.6 12.4h4.8" />
    </svg>
  );
}

function IconeEtincelle() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 3.2l2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2z" />
    </svg>
  );
}

function IconePlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}
