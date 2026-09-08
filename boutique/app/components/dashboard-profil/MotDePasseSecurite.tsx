"use client";

import { useState } from "react";
import { SectionHeader, Tag } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  "Mot de passe et sécurité" (menu du compte, voir DashboardHeader →
  /dashboard/profil/securite) : niveau de protection, mot de passe, double
  vérification, codes de secours, alerte nouvel appareil — cf. capture
  fournie. Cartes blanches sur fond clair #FAF7FC, même thème que le reste
  du dashboard — cf. [[dashboard-background-fafcfc]] : la maquette fournie
  était en thème sombre, remplacé ici à la demande de l'utilisateur pour
  rester cohérent avec les autres écrans (Mon profil, Mes droits, Mes
  appareils).

  Données de sécurité statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] — à brancher sur l'API Laravel
  (changement réel du mot de passe, double vérification, codes de secours,
  alertes) dès qu'elle existera. Le formulaire de changement de mot de passe
  ci-dessous ne fait donc que valider localement, pas de vrai appel serveur.
*/

const CODES_TOTAL = 8;

export default function MotDePasseSecurite({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [changerMdp, setChangerMdp] = useState(false);
  const [mdpActuel, setMdpActuel] = useState("");
  const [mdpNouveau, setMdpNouveau] = useState("");
  const [mdpConfirmation, setMdpConfirmation] = useState("");
  const [mdpErreur, setMdpErreur] = useState<string | null>(null);
  const [mdpConfirme, setMdpConfirme] = useState(false);

  const [doubleVerification, setDoubleVerification] = useState(true);
  const [methodeVerification, setMethodeVerification] = useState<"message" | "application">("message");
  const [alerteNouvelAppareil, setAlerteNouvelAppareil] = useState(true);

  const [codesRestants, setCodesRestants] = useState(6);
  const [afficherCodes, setAfficherCodes] = useState(false);
  const [codesSecours, setCodesSecours] = useState(() => genererCodesMock());

  const protectionsActives = [true, doubleVerification, codesRestants > 0, alerteNouvelAppareil].filter(Boolean).length;
  const niveauProtection =
    protectionsActives >= 4 ? t("Élevé", "High") : protectionsActives >= 2 ? t("Moyen", "Medium") : t("Faible", "Low");

  const ouvrirChangementMdp = () => {
    setMdpActuel("");
    setMdpNouveau("");
    setMdpConfirmation("");
    setMdpErreur(null);
    setMdpConfirme(false);
    setChangerMdp(true);
  };

  const annulerChangementMdp = () => {
    setChangerMdp(false);
    setMdpErreur(null);
  };

  const enregistrerMdp = () => {
    if (!mdpActuel) return setMdpErreur(t("Le mot de passe actuel est requis.", "Current password is required."));
    if (mdpNouveau.length < 8) return setMdpErreur(t("Le nouveau mot de passe doit compter au moins 8 caractères.", "The new password must be at least 8 characters."));
    if (mdpNouveau !== mdpConfirmation) return setMdpErreur(t("La confirmation ne correspond pas.", "Confirmation doesn't match."));

    setMdpErreur(null);
    setChangerMdp(false);
    setMdpConfirme(true);
    setTimeout(() => setMdpConfirme(false), 4000);
  };

  const genererHuitCodes = () => {
    setCodesRestants(CODES_TOTAL);
    setCodesSecours(genererCodesMock());
  };

  return (
    <>
      <SectionHeader
        eyebrow={t("Sécurité", "Security")}
        title={t("Mot de passe et sécurité", "Password & security")}
        subtitle={t("Votre mot de passe, votre double vérification, vos codes de secours.", "Your password, your two-factor verification, your backup codes.")}
        first={first}
        layout="inline"
      />

      {/* ── Niveau de protection ── */}
      <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">
              {t("Niveau de protection", "Protection level")}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--dashboard-text)] sm:text-4xl">{niveauProtection}</p>
          </div>
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {protectionsActives === 4
              ? t("Quatre protections sur quatre sont en place.", "Four protections out of four are in place.")
              : t(`${protectionsActives} protection${protectionsActives > 1 ? "s" : ""} sur quatre en place.`, `${protectionsActives} of four protections in place.`)}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full"
              style={{
                background:
                  i < protectionsActives
                    ? "linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))"
                    : "color-mix(in srgb, var(--dashboard-text) 8%, transparent)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ── Mot de passe ── */}
        <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple">
                <ShieldIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--dashboard-text)]">{t("Mot de passe", "Password")}</p>
                <p className="text-xs text-[var(--dashboard-text)]/45">{t("Changé il y a 2 mois", "Changed 2 months ago")}</p>
              </div>
            </div>
            <Tag tone="ok">{t("Solide", "Strong")}</Tag>
          </div>

          {mdpConfirme && !changerMdp && (
            <p className="mt-4 rounded-2xl bg-[#dcf5e3] px-3 py-2 text-xs font-semibold text-[#178a3f]">
              {t("Mot de passe mis à jour.", "Password updated.")}
            </p>
          )}

          {changerMdp ? (
            <div className="mt-4 space-y-2.5">
              <input
                type="password"
                value={mdpActuel}
                onChange={(e) => setMdpActuel(e.target.value)}
                placeholder={t("Mot de passe actuel", "Current password")}
                aria-label={t("Mot de passe actuel", "Current password")}
                className="w-full rounded-full border border-brand-pink/40 bg-brand-pink/5 px-4 py-2.5 text-sm text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
              />
              <input
                type="password"
                value={mdpNouveau}
                onChange={(e) => setMdpNouveau(e.target.value)}
                placeholder={t("Nouveau mot de passe", "New password")}
                aria-label={t("Nouveau mot de passe", "New password")}
                className="w-full rounded-full border border-brand-pink/40 bg-brand-pink/5 px-4 py-2.5 text-sm text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
              />
              <input
                type="password"
                value={mdpConfirmation}
                onChange={(e) => setMdpConfirmation(e.target.value)}
                placeholder={t("Confirmer le nouveau mot de passe", "Confirm new password")}
                aria-label={t("Confirmer le nouveau mot de passe", "Confirm new password")}
                className="w-full rounded-full border border-brand-pink/40 bg-brand-pink/5 px-4 py-2.5 text-sm text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
              />
              {mdpErreur && <p className="text-xs font-semibold text-[#c8262d]">{mdpErreur}</p>}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={annulerChangementMdp}
                  className="rounded-full border border-[var(--dashboard-text)]/15 px-4 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
                >
                  {t("Annuler", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={enregistrerMdp}
                  className="rounded-full bg-[#141220] px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
                >
                  {t("Enregistrer", "Save")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={ouvrirChangementMdp}
              className="mt-4 w-full rounded-full border border-brand-pink/40 bg-[var(--dashboard-card-bg)] px-4 py-2.5 text-sm font-semibold text-brand-pink transition hover:bg-brand-pink/10"
            >
              {t("Changer mon mot de passe", "Change my password")}
            </button>
          )}
        </div>

        {/* ── Double vérification ── */}
        <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#dcf5e3] text-[#178a3f]">
                <DeviceIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--dashboard-text)]">{t("Double vérification", "Two-factor verification")}</p>
                <p className="text-xs text-[var(--dashboard-text)]/45">{t("Un code de six chiffres sur tout appareil nouveau", "A six-digit code on every new device")}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={doubleVerification}
              onChange={() => setDoubleVerification((v) => !v)}
              label={t("Double vérification", "Two-factor verification")}
            />
          </div>

          <div className={`mt-4 grid grid-cols-2 gap-2 ${doubleVerification ? "" : "pointer-events-none opacity-40"}`}>
            <button
              type="button"
              onClick={() => setMethodeVerification("message")}
              aria-pressed={methodeVerification === "message"}
              className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-xs font-semibold transition ${
                methodeVerification === "message"
                  ? "border-transparent bg-brand-purple/10 text-brand-purple"
                  : "border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/50 hover:bg-[var(--dashboard-text)]/[0.03]"
              }`}
            >
              <MessageIcon />
              {t("Par message", "By text message")}
            </button>
            <button
              type="button"
              onClick={() => setMethodeVerification("application")}
              aria-pressed={methodeVerification === "application"}
              className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-xs font-semibold transition ${
                methodeVerification === "application"
                  ? "border-transparent bg-brand-purple/10 text-brand-purple"
                  : "border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/50 hover:bg-[var(--dashboard-text)]/[0.03]"
              }`}
            >
              <AppIcon />
              {t("Par application", "By app")}
            </button>
          </div>
        </div>

        {/* ── Codes de secours ── */}
        <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff1d6] text-[#a8690a]">
                <TicketIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--dashboard-text)]">{t("Codes de secours", "Backup codes")}</p>
                <p className="text-xs text-[var(--dashboard-text)]/45">{t("Pour le jour où le téléphone manque", "For the day your phone is missing")}</p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-bold text-[var(--dashboard-text)]">
              {codesRestants} {t("sur", "of")} {CODES_TOTAL}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-8 gap-1.5">
            {Array.from({ length: CODES_TOTAL }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full"
                style={{ background: i < codesRestants ? "#f5a623" : "color-mix(in srgb, var(--dashboard-text) 8%, transparent)" }}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAfficherCodes((v) => !v)}
              className="rounded-full border border-[var(--dashboard-text)]/15 px-4 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              {afficherCodes ? t("Masquer mes codes", "Hide my codes") : t("Voir mes codes", "View my codes")}
            </button>
            <button
              type="button"
              onClick={genererHuitCodes}
              className="rounded-full border border-brand-pink/40 bg-[var(--dashboard-card-bg)] px-4 py-2.5 text-xs font-semibold text-brand-pink transition hover:bg-brand-pink/10"
            >
              {t("En générer huit", "Generate eight")}
            </button>
          </div>

          {afficherCodes && (
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#FAF7FC] p-3 sm:grid-cols-4">
              {codesSecours.map((code, i) => (
                <span
                  key={code}
                  className={`rounded-lg bg-[var(--dashboard-card-bg)] px-2 py-1.5 text-center font-mono text-xs tracking-wide ${
                    i < codesRestants ? "text-[var(--dashboard-text)]" : "text-[var(--dashboard-text)]/25 line-through"
                  }`}
                >
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── M'alerter ── */}
        <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#dbeafe] text-[#1d4ed8]">
                <BellIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--dashboard-text)]">{t("M'alerter", "Alert me")}</p>
                <p className="text-xs text-[var(--dashboard-text)]/45">{t("Dès qu'un appareil inconnu ouvre le compte", "As soon as an unknown device opens the account")}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={alerteNouvelAppareil}
              onChange={() => setAlerteNouvelAppareil((v) => !v)}
              label={t("M'alerter", "Alert me")}
            />
          </div>
          <p className="mt-3 text-xs leading-snug text-[var(--dashboard-text)]/45">
            {t(
              "Un message part avec la ville et l'heure. C'est ce qui prévient d'un mot de passe volé avant qu'il serve.",
              "A message is sent with the city and time. This is what warns of a stolen password before it's used."
            )}
          </p>
        </div>
      </div>
    </>
  );
}

// Huit codes à usage unique, générés côté client pour la maquette — un vrai
// tirage aléatoire cryptographique viendra de l'API Laravel, cf. mémoire en
// tête de fichier.
function genererCodesMock(): string[] {
  return Array.from({ length: CODES_TOTAL }, () =>
    Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

/* ── Petits composants ── */

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
        checked ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[var(--dashboard-text)]/20"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9.2 12 1.9 1.9 3.7-3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="7.5" y="2.5" width="9" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="5.5" y="2.5" width="13" height="19" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M3.5 9.5a2 2 0 0 0 0-3.8V5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v.7a2 2 0 0 0 0 3.8V9.5a2 2 0 0 0 0 3.8v.7a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-.7a2 2 0 0 0 0-3.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 4.5v14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.4 2.4" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
