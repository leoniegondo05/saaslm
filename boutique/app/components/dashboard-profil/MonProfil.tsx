"use client";

import { useRef, useState } from "react";
import QrCode from "../QrCode";
import { SectionHeader } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran "Mon profil", atteint depuis "Voir mon profil" dans le menu du
  compte (voir DashboardHeader) : photo (avatar généré ou vraie photo),
  code personnel à scanner, et détails du compte. Cartes blanches sur fond
  clair #FAF7FC, mêmes couleurs/ombres que le reste du dashboard (cf.
  [[dashboard-background-fafcfc]] — la première version utilisait le thème
  sombre du site public, remplacé ici à la demande de l'utilisateur pour
  rester cohérent avec les autres écrans du dashboard).

  Données de compte statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] — à brancher sur l'API Laravel
  (identité, code personnel, appareils connectés...) dès qu'elle existera.
*/

// Réutilisé par le menu du compte (DashboardHeader) pour le badge
// "Mes appareils", afin de ne pas dupliquer ce chiffre à la main.
export const APPAREILS_CONNECTES_COUNT = 3;

const PROFIL = {
  nomAffiche: "Awa K.",
  role: "Administratrice de la boutique",
  roleEn: "Shop administrator",
  depuis: "4 mars 2025",
  depuisEn: "March 4, 2025",
  email: "a.konan@awabeaute.ci",
  telephone: "+225 07 00 00 00 00",
};

// Seuls ces trois champs sont modifiables depuis "Modifier" (le reste —
// rôle, boutique, appareils, dates... — vient du compte/API, pas de la
// personne elle-même).
type ChampModifiable = "nomAffiche" | "email" | "telephone";

export default function MonProfil() {
  const { t } = useDashboardLangue();
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [revealed, setRevealed] = useState<{ email: boolean; phone: boolean }>({
    email: false,
    phone: false,
  });

  const toggleReveal = (key: "email" | "phone") =>
    setRevealed((r) => ({ ...r, [key]: !r[key] }));

  // État "modifiable" du profil, séparé de PROFIL (les valeurs d'origine) :
  // aucun endpoint Laravel n'existe encore pour persister ces changements
  // (cf. mémoire en tête de fichier), donc "Enregistrer" ne fait pour
  // l'instant que mettre à jour cet état local, pas un vrai compte.
  const [profil, setProfil] = useState({
    nomAffiche: PROFIL.nomAffiche,
    email: PROFIL.email,
    telephone: PROFIL.telephone,
  });
  const [brouillon, setBrouillon] = useState(profil);
  const [enEdition, setEnEdition] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const commencerEdition = () => {
    setBrouillon(profil);
    setErreur(null);
    setEnEdition(true);
  };

  const annulerEdition = () => {
    setBrouillon(profil);
    setErreur(null);
    setEnEdition(false);
  };

  const enregistrerEdition = () => {
    const nomAffiche = brouillon.nomAffiche.trim();
    const email = brouillon.email.trim();
    const telephone = brouillon.telephone.trim();

    if (!nomAffiche) return setErreur(t("Le nom est requis.", "Name is required."));
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErreur(t("Adresse e-mail invalide.", "Invalid email address."));
    if (!telephone) return setErreur(t("Le téléphone est requis.", "Phone is required."));

    setProfil({ nomAffiche, email, telephone });
    setErreur(null);
    setEnEdition(false);
  };

  const modifierBrouillon = (champ: ChampModifiable, valeur: string) =>
    setBrouillon((b) => ({ ...b, [champ]: valeur }));

  const detailFields = [
    { icon: <PersonIcon />, label: t("Nom complet", "Full name"), value: profil.nomAffiche, editableKey: "nomAffiche" as const },
    {
      icon: <MailIcon />,
      label: t("Adresse de connexion", "Login address"),
      value: profil.email,
      verified: t("VÉRIFIÉE", "VERIFIED"),
      maskKey: "email" as const,
      editableKey: "email" as const,
    },
    { icon: <ShieldIcon />, label: t("Son rôle", "Their role"), value: t("Administrateur", "Administrator") },
    { icon: <PersonBadgeIcon />, label: t("Identifiant", "Username"), value: "awa.k" },
    {
      icon: <PhoneIcon />,
      label: t("Téléphone", "Phone"),
      value: profil.telephone,
      verified: t("VÉRIFIÉ", "VERIFIED"),
      maskKey: "phone" as const,
      editableKey: "telephone" as const,
    },
    { icon: <HomeIcon />, label: t("Boutique", "Shop"), value: "Awa Beauté" },
    { icon: <CheckCircleIcon />, label: t("État du compte", "Account status"), value: t("Actif", "Active") },
    { icon: <ClockIcon />, label: t("Dernière connexion", "Last login"), value: t("Aujourd'hui · 07:42", "Today · 7:42am") },
    { icon: <LaptopIcon />, label: t("Appareils connectés", "Connected devices"), value: String(APPAREILS_CONNECTES_COUNT) },
    { icon: <TruckIcon />, label: t("Partenaire agréé", "Approved partner"), value: "Groupe Logistique Ivoire" },
    { icon: <FileIcon />, label: t("Contrat de la boutique", "Shop contract"), value: t("Affiliée · depuis mars 2025", "Affiliated · since March 2025") },
    { icon: <CalendarIcon />, label: t("Compte créé le", "Account created on"), value: t("4 mars 2025", "March 4, 2025") },
  ];

  // Aperçu local uniquement (FileReader → data URL) : aucun endpoint
  // Laravel n'existe encore pour l'upload, cf. mémoire ci-dessus. À
  // remplacer par un vrai envoi (multipart) + URL retournée par l'API.
  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5 Mo, garde-fou simple

    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <SectionHeader
        eyebrow={t("Mon compte", "My account")}
        title={t("Mon profil", "My profile")}
        subtitle={t("Votre identité, votre code personnel, vos appareils.", "Your identity, your personal code, your devices.")}
        first
        layout="inline"
      />

      <div className="overflow-hidden rounded-[32px] bg-[var(--dashboard-card-bg)] shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
        {/* ── Bannière + avatar ── */}
        <div
          className="relative h-40 overflow-hidden sm:h-48"
          style={{
            backgroundImage:
              "linear-gradient(120deg, var(--color-brand-pink) 0%, var(--color-brand-purple) 55%, #2f6bf0 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 14px)",
            }}
            aria-hidden
          />
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {enEdition && (
              <button
                type="button"
                onClick={annulerEdition}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                {t("Annuler", "Cancel")}
              </button>
            )}
            <button
              type="button"
              onClick={enEdition ? enregistrerEdition : commencerEdition}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              {enEdition ? <CheckBadgeIcon /> : <PencilIcon />}
              {enEdition ? t("Enregistrer", "Save") : t("Modifier mon profil", "Edit my profile")}
            </button>
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
            {/* Colonne identité */}
            <div>
              <div className="relative -mt-14 sm:-mt-16">
                <div
                  className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[6px] border-[var(--dashboard-card-bg)]"
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
                    <img src={photo} alt={t("Photo de profil", "Profile photo")} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{ background: "linear-gradient(140deg,var(--color-brand-pink),var(--color-brand-purple))" }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label={t("Changer la photo de profil", "Change profile photo")}
                    className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--dashboard-card-bg)] bg-[#141220] text-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition hover:brightness-110 dark:bg-brand-pink"
                  >
                    <CameraIcon />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePickPhoto}
                  className="hidden"
                />
              </div>

              <h1 className="mt-4 flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight text-[var(--dashboard-text)]">
                {enEdition ? (
                  <input
                    value={brouillon.nomAffiche}
                    onChange={(e) => modifierBrouillon("nomAffiche", e.target.value)}
                    placeholder={t("Nom complet", "Full name")}
                    aria-label={t("Nom complet", "Full name")}
                    className="min-w-0 max-w-full rounded-lg border border-brand-pink/40 bg-brand-pink/5 px-2 py-1 text-2xl font-bold text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
                  />
                ) : (
                  profil.nomAffiche
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcf5e3] px-3 py-1 text-xs font-semibold text-[#178a3f]">
                  <CheckBadgeIcon />
                  {t("Compte vérifié", "Verified account")}
                </span>
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-[var(--dashboard-text)]/50">
                <CalendarIcon />
                {t(PROFIL.role, PROFIL.roleEn)} · {t("dans l'équipe depuis le", "on the team since")} {t(PROFIL.depuis, PROFIL.depuisEn)}
              </p>
            </div>

            {/* Colonne code personnel : fond opaque + ombre marquée, pour
                bien se détacher de la bannière colorée qu'elle chevauche
                (lg:-mt-20) plutôt que de s'y fondre. */}
            <div className="relative z-10 rounded-3xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-4 shadow-[0_16px_32px_-12px_rgba(20,18,32,0.35)] lg:-mt-20">
              <div className="flex items-start gap-3">
                <div className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 bg-white p-1.5">
                  <QrCode value="https://liivremoi.com/id/awa-konan" className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-[var(--dashboard-text)]">{t("Mon code à scanner", "My scannable code")}</p>
                    <span className="shrink-0 rounded-full bg-brand-purple/10 px-2.5 py-1 text-[10px] font-semibold text-brand-purple">
                      {t("Application mobile", "Mobile app")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-snug text-[var(--dashboard-text)]/50">
                    {t(
                      '« Scanner mon code » dans l\'application mobile : vous entrez avec vos droits, et seulement les vôtres.',
                      '"Scan my code" in the mobile app: you get in with your permissions, and only yours.'
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-px bg-[var(--dashboard-text)]/10" />

              <p className="mt-3 text-xs text-[var(--dashboard-text)]/50">{t("Valable jusqu'au 12 nov. 2026 · 74 jours", "Valid until Nov. 12, 2026 · 74 days")}</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
                <div
                  className="h-full rounded-full"
                  style={{ width: "58%", background: "linear-gradient(90deg,var(--color-brand-pink),#f5a623)" }}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-full border border-brand-pink/40 bg-[var(--dashboard-card-bg)] px-2 py-2 text-[11px] font-semibold text-brand-pink transition hover:bg-brand-pink/10"
                >
                  <DownloadIcon />
                  {t("Télécharger", "Download")}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#141220] px-2 py-2 text-[11px] font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
                >
                  {t("Renouveler", "Renew")}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[#c8262d]/30 bg-[var(--dashboard-card-bg)] px-2 py-2 text-[11px] font-semibold text-[#c8262d] transition hover:bg-[#ffe1e2]"
                >
                  {t("Révoquer", "Revoke")}
                </button>
              </div>
              <p className="mt-2.5 text-[10px] leading-snug text-[var(--dashboard-text)]/40">
                {t(
                  "Renouveler crée un nouveau code et annule l'ancien à la seconde. Révoquer coupe sans en créer : le geste du téléphone perdu.",
                  "Renewing creates a new code and cancels the old one instantly. Revoking cuts access without creating one: the lost-phone move."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Détails du profil ── */}
      <div className="mt-4 rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink">
              <PersonIcon />
            </span>
            <h2 className="text-base font-bold text-[var(--dashboard-text)]">{t("Détails du profil", "Profile details")}</h2>
          </div>
          <div className="flex items-center gap-2">
            {enEdition && (
              <button
                type="button"
                onClick={annulerEdition}
                className="rounded-full border border-[var(--dashboard-text)]/15 px-4 py-1.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
              >
                {t("Annuler", "Cancel")}
              </button>
            )}
            <button
              type="button"
              onClick={enEdition ? enregistrerEdition : commencerEdition}
              className="rounded-full border border-[var(--dashboard-text)]/15 px-4 py-1.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              {enEdition ? t("Enregistrer", "Save") : t("Modifier", "Edit")}
            </button>
          </div>
        </div>

        <div className="mt-4 h-px bg-[var(--dashboard-text)]/10" />
        {enEdition && erreur && (
          <p className="mt-3 text-xs font-semibold text-[#c8262d]">{erreur}</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {detailFields.map((field) => (
            <div key={field.label} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                {field.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] text-[var(--dashboard-text)]/40">{field.label}</p>
                  {field.verified && (
                    <span className="rounded-full bg-[#dcf5e3] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#178a3f]">
                      {field.verified}
                    </span>
                  )}
                  {field.maskKey && !enEdition && (
                    <button
                      type="button"
                      onClick={() => toggleReveal(field.maskKey!)}
                      aria-label={
                        revealed[field.maskKey]
                          ? t(`Masquer ${field.label.toLowerCase()}`, `Hide ${field.label.toLowerCase()}`)
                          : t(`Afficher ${field.label.toLowerCase()}`, `Show ${field.label.toLowerCase()}`)
                      }
                      className="text-[var(--dashboard-text)]/30 transition hover:text-[var(--dashboard-text)]/60"
                    >
                      {revealed[field.maskKey] ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  )}
                </div>
                {enEdition && field.editableKey ? (
                  <input
                    value={brouillon[field.editableKey]}
                    onChange={(e) => modifierBrouillon(field.editableKey!, e.target.value)}
                    type={field.editableKey === "email" ? "email" : field.editableKey === "telephone" ? "tel" : "text"}
                    aria-label={field.label}
                    className="mt-1 w-full min-w-0 rounded-lg border border-brand-pink/40 bg-brand-pink/5 px-2 py-1 text-sm font-semibold text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
                  />
                ) : field.maskKey && !revealed[field.maskKey] ? (
                  <div className="mt-1.5 flex gap-1" aria-hidden>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} className="h-1.5 w-3 rounded-sm bg-[var(--dashboard-text)]/10" />
                    ))}
                  </div>
                ) : (
                  <p className="mt-0.5 truncate text-sm font-bold text-[var(--dashboard-text)]">{field.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Icônes (traits fins, cohérentes avec le reste du site) ── */

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="m14.5 5 4.5 4.5L8 20.5H3.5V16L14.5 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.7l1-1.6h7.6l1 1.6h1.7A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.3 12.2 2.4 2.4 5-5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 3.5v11M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 17v2A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.4 6.6C4 8.2 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.7 0 3.1-.5 4.3-1.2M9.8 5.7c.7-.15 1.4-.2 2.2-.2 6 0 9.5 6.5 9.5 6.5s-.7 1.3-2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 10.1a2.6 2.6 0 0 0 3.6 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="8.5" r="3.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c1.1-3.3 3.8-5.2 7-5.2s5.9 1.9 7 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PersonBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="9.5" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 19.5c.9-3 3.2-4.7 5.5-4.7s4.6 1.7 5.5 4.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="15.5" y="6.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M6 3.5h3l1.3 4-2 1.5a10.5 10.5 0 0 0 5.7 5.7l1.5-2 4 1.3v3a1.5 1.5 0 0 1-1.6 1.5C11.5 18 6 12.5 5.5 6.1A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M4 11.5 12 4l8 7.5M6 9.8V20h12V9.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.3 12.2 2.4 2.4 5-5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 19.5h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="2.5" y="7" width="11" height="9" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 10h3.7l3.3 3.3V16h-7v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M6 3.5h8l4 4v13H6V3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12h6M9 15.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
