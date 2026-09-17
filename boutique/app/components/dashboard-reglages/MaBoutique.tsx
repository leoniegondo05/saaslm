"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SectionHeader, Tag, useMockSave } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { useDashboardBoutiqueLogo } from "../DashboardBoutiqueLogoProvider";

/*
  Écran 25 "Réglages · Ma boutique" : identité, adresse d'enlèvement, ce qui
  reste toujours visible par les clients, et l'accès à la personnalisation
  (PersonnaliserBoutique.tsx, route /dashboard/reglages/personnaliser). Les
  champs sont éditables directement, sans passer par un mode "Modifier" au
  préalable — seul "Enregistrer" fige l'état courant. Aucun endpoint
  Laravel n'existe encore pour persister (cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]]) : "Enregistrer" ne fait donc
  que confirmer visuellement.

  Retour utilisateur du 2026-09-17 ("j'aime vraiment pas" le design) : cet
  écran est maintenant atteint seul depuis le logo boutique du header (plus
  une fiche de l'onglet Réglages), mais gardait le look "formulaire
  d'onglet" — cards titleTab, avatar minuscule, champs gris uniformes.
  Redesign vers le même vocabulaire visuel que les autres écrans autonomes
  du dashboard (MonProfil.tsx) : bannière dégradée + avatar qui chevauche,
  statut "ouverte/fermée" en badge cliquable, cartes à en-tête icône plutôt
  que titre en étiquette. Couleurs/police inchangées (charte
  [[charte-graphique-livre-moi]]).
*/

const SECTEURS = [
  { value: "Beauté et soins", label: "Beauté et soins", labelEn: "Beauty and care" },
  { value: "Mode et accessoires", label: "Mode et accessoires", labelEn: "Fashion and accessories" },
  { value: "Alimentation", label: "Alimentation", labelEn: "Food" },
  { value: "Électronique", label: "Électronique", labelEn: "Electronics" },
  { value: "Maison et déco", label: "Maison et déco", labelEn: "Home and decor" },
];

type Identite = {
  nom: string;
  secteur: string;
  presentation: string;
  adresse: string;
  ouverte: boolean;
};

type Enlevement = {
  commune: string;
  quartier: string;
  adressePrecise: string;
  telephone: string;
  contact: string;
};

const IDENTITE_INIT: Identite = {
  nom: "Awa Beauté",
  secteur: "Beauté et soins",
  presentation:
    "Cosmétiques et soins naturels, préparés et conditionnés à Abidjan. Livraison dans tout le district.",
  adresse: "awa-beaute.liivremoi.com",
  ouverte: true,
};

const ENLEVEMENT_INIT: Enlevement = {
  commune: "Cocody",
  quartier: "Riviera 3",
  adressePrecise: "",
  telephone: "+225 07 00 00 00 00",
  contact: "Awa K.",
};

// Généré par la plateforme à la création de la boutique — non modifiable
// ici, cf. Écran 25.
const IDENTIFIANT_BOUTIQUE = "BTQ-7K4Q2";

type VisiblePublic = { telephone: string; email: string; localisation: string };

// Laissés vides comme dans la maquette : rien à afficher tant qu'ils ne
// sont pas renseignés, plutôt qu'une fausse valeur de démonstration.
const VISIBLE_PUBLIC_INIT: VisiblePublic = { telephone: "", email: "", localisation: "" };

export default function MaBoutique({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [identite, setIdentite] = useState(IDENTITE_INIT);
  const [enlevement, setEnlevement] = useState(ENLEVEMENT_INIT);
  const [visiblePublic, setVisiblePublic] = useState(VISIBLE_PUBLIC_INIT);
  const { saving, done, trigger } = useMockSave();
  const { logo, setLogo } = useDashboardBoutiqueLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aperçu local uniquement (FileReader → data URL), même limite que
  // MonProfil.tsx : aucun endpoint Laravel n'existe encore pour l'upload.
  const handlePickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5 Mo, garde-fou simple

    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <SectionHeader
        eyebrow={t("Ma boutique", "My shop")}
        title={t("Qui vous êtes, où l'on vient vous chercher", "Who you are, where you'll be picked up")}
        subtitle={t(
          "Votre identité, l'adresse d'enlèvement, et l'accès à la personnalisation.",
          "Your identity, the pickup address, and access to customization."
        )}
        first={first}
        layout="inline"
      />

      {/* ── Bannière identité, même vocabulaire que MonProfil.tsx ── */}
      <div className="overflow-hidden rounded-[32px] bg-[var(--dashboard-card-bg)] shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
        <div
          className="relative h-28 overflow-hidden sm:h-32"
          style={{
            backgroundImage:
              "linear-gradient(120deg, var(--color-brand-pink) 0%, var(--color-brand-purple) 62%, #011847 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
            aria-hidden
          />
          <div className="absolute right-4 top-4">
            <button
              type="button"
              onClick={() => trigger()}
              disabled={saving}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? t("Enregistrement…", "Saving…") : done ? t("✓ Enregistré", "✓ Saved") : t("Enregistrer", "Save")}
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <div className="relative -mt-10 flex flex-wrap items-end gap-4 sm:-mt-12">
            <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-[5px] border-[var(--dashboard-card-bg)]">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
                <img src={logo} alt={t("Logo de la boutique", "Shop logo")} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full"
                  style={{ background: "linear-gradient(140deg,var(--color-brand-pink),var(--color-brand-purple))" }}
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t("Changer le logo de la boutique", "Change shop logo")}
                className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--dashboard-card-bg)] bg-[#141220] text-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition hover:brightness-110 dark:bg-brand-pink"
              >
                <CameraIcon />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickLogo} className="hidden" />

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={identite.nom}
                  onChange={(e) => setIdentite((b) => ({ ...b, nom: e.target.value }))}
                  aria-label={t("Nom de la boutique", "Shop name")}
                  className="min-w-0 max-w-full rounded-lg border border-transparent bg-transparent px-1 -mx-1 text-xl font-bold tracking-tight text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/40 focus:bg-brand-pink/5"
                />
                <button
                  type="button"
                  onClick={() => setIdentite((b) => ({ ...b, ouverte: !b.ouverte }))}
                  aria-pressed={identite.ouverte}
                  className="shrink-0"
                >
                  <Tag tone={identite.ouverte ? "ok" : "ko"} className="cursor-pointer gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {identite.ouverte ? t("Boutique ouverte", "Shop open") : t("Boutique fermée", "Shop closed")}
                  </Tag>
                </button>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--dashboard-text)]/40">
                <TagIcon />
                <span className="font-figures">{IDENTIFIANT_BOUTIQUE}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChampSelect
              label={t("Secteur principal", "Main sector")}
              value={identite.secteur}
              options={SECTEURS}
              onChange={(secteur) => setIdentite((b) => ({ ...b, secteur }))}
            />
            <Champ
              icon={<GlobeIcon />}
              label={t("Adresse de la boutique", "Shop address")}
              value={identite.adresse}
              onChange={(adresse) => setIdentite((b) => ({ ...b, adresse }))}
            />
          </div>
          <div className="mt-3">
            <Champ
              label={t("Phrase de présentation", "Tagline")}
              value={identite.presentation}
              multiline
              onChange={(presentation) => setIdentite((b) => ({ ...b, presentation }))}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <SectionCard icon={<MapPinIcon />} title={t("Adresse d'enlèvement", "Pickup address")}>
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Là où le livreur du partenaire vient chercher vos colis et vos dépôts. Les jours et les heures de passage sont fixés par le partenaire.",
              "Where the partner's courier comes to collect your parcels and deposits. Pickup days and times are set by the partner."
            )}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              icon={<MapPinIcon />}
              label={t("Commune", "District")}
              value={enlevement.commune}
              onChange={(commune) => setEnlevement((e) => ({ ...e, commune }))}
            />
            <Champ
              icon={<MapPinIcon />}
              label={t("Quartier", "Neighborhood")}
              value={enlevement.quartier}
              onChange={(quartier) => setEnlevement((e) => ({ ...e, quartier }))}
            />
          </div>
          <div className="mt-3">
            <Champ
              icon={<MapPinIcon />}
              label={t("Adresse précise et repère", "Precise address and landmark")}
              value={enlevement.adressePrecise}
              placeholder={t("Non renseignée", "Not provided")}
              onChange={(adressePrecise) => setEnlevement((e) => ({ ...e, adressePrecise }))}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              icon={<PhoneIcon />}
              label={t("Téléphone d'enlèvement", "Pickup phone number")}
              value={enlevement.telephone}
              onChange={(telephone) => setEnlevement((e) => ({ ...e, telephone }))}
              numeric
            />
            <Champ
              icon={<PersonIcon />}
              label={t("Personne à contacter", "Contact person")}
              value={enlevement.contact}
              onChange={(contact) => setEnlevement((e) => ({ ...e, contact }))}
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={<EyeIcon />}
          title={t("Visible par vos clients", "Shown to your customers")}
          badge={<Tag tone="neutral">{t("Toujours affiché", "Always shown")}</Tag>}
        >
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Avec le nom de la boutique, ces informations restent visibles sur chaque page de commande — la section « Vendu par » ne se masque pas.",
              "Along with the shop name, this information stays visible on every order page — the “Sold by” section can't be hidden."
            )}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              icon={<PhoneIcon />}
              label={t("Téléphone", "Phone number")}
              value={visiblePublic.telephone}
              placeholder={t("Non renseigné", "Not provided")}
              onChange={(telephone) => setVisiblePublic((v) => ({ ...v, telephone }))}
              numeric
            />
            <Champ
              icon={<MailIcon />}
              label={t("Adresse email", "Email address")}
              value={visiblePublic.email}
              placeholder={t("Non renseignée", "Not provided")}
              onChange={(email) => setVisiblePublic((v) => ({ ...v, email }))}
            />
          </div>
          <div className="mt-3">
            <Champ
              icon={<MapPinIcon />}
              label={t("Localisation", "Location")}
              value={visiblePublic.localisation}
              placeholder={t("Non renseignée", "Not provided")}
              onChange={(localisation) => setVisiblePublic((v) => ({ ...v, localisation }))}
            />
          </div>
        </SectionCard>
      </div>

      {/*
        Bordure dégradée rose → violet permanente (pas seulement au survol),
        cf. retour utilisateur du 2026-09-17 alignant ce bouton sur la
        maquette "Personnaliser ma boutique" : carte de fond + liseré 1px en
        p-[1px] plutôt qu'un ::after masqué (non exprimable en classes
        Tailwind seules), tokens de la charte LM et non le rose brut de la
        maquette — ce bouton appartient au chrome du tableau de bord.
      */}
      <Link
        href="/dashboard/reglages/personnaliser"
        className="group mt-3 block rounded-[28px] p-[1px] shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] transition hover:shadow-[0_10px_22px_-4px_rgba(236,12,140,0.28)]"
        style={{ background: "linear-gradient(100deg, var(--color-brand-pink), var(--color-brand-purple) 65%, rgba(58,29,138,0.25))" }}
      >
        <span className="flex items-center gap-3.5 rounded-[27px] card-tint p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-pink/60 bg-brand-pink/10 text-brand-pink shadow-[0_0_14px_rgba(236,12,140,0.3)]">
            <PaletteIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[var(--dashboard-text)]" style={{ fontFamily: "var(--font-bricolage)" }}>
              {t("Personnaliser ma boutique", "Customize my shop")}
            </span>
            <span className="block text-[10.5px] text-[var(--dashboard-text)]/55">
              {t("Sections, style, formulaire de commande, avis, questions", "Sections, style, order form, reviews, questions")}
            </span>
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#141220] shadow-[0_4px_12px_rgba(20,18,32,0.18)] transition group-hover:translate-x-0.5 dark:bg-white/90">
            <FlecheDroiteIcon />
          </span>
        </span>
      </Link>
    </>
  );
}

/*
  Carte à en-tête "icône + titre", même recette que le bloc "Détails du
  profil" de MonProfil.tsx : plus de poids visuel qu'un simple titre en
  étiquette (Card titleTab), cohérent avec un écran désormais autonome
  plutôt qu'une fiche d'onglet.
*/
function SectionCard({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] card-tint border border-[var(--dashboard-text)]/10 p-5 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink">
            {icon}
          </span>
          <h2 className="text-sm font-bold text-[var(--dashboard-text)]">{title}</h2>
        </div>
        {badge}
      </div>
      <div className="mt-3 h-px bg-[var(--dashboard-text)]/10" />
      <div className="mt-3">{children}</div>
    </div>
  );
}

const champBoxClasses =
  "mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/50 focus:bg-brand-pink/5";

function Champ({
  icon,
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  numeric = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
        {icon && <span className="text-[var(--dashboard-text)]/30">{icon}</span>}
        {label}
      </p>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${champBoxClasses} resize-none leading-relaxed`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={numeric ? `${champBoxClasses} font-figures` : champBoxClasses}
        />
      )}
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 2-.8 2-1.8 0-1.3-1.1-1.6-1.1-2.7 0-1 .8-1.7 1.9-1.7h2.2a3.5 3.5 0 0 0 3.5-3.5c0-4.2-3.8-7.3-8.5-7.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="7.8" cy="11.2" r="1.1" fill="currentColor" />
      <circle cx="10.4" cy="7.6" r="1.1" fill="currentColor" />
      <circle cx="14.8" cy="7.9" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FlecheDroiteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path d="M11.3 3.5h5.2a2 2 0 0 1 2 2v5.2a2 2 0 0 1-.6 1.4l-7.6 7.6a2 2 0 0 1-2.8 0l-4.7-4.7a2 2 0 0 1 0-2.8l7.6-7.6a2 2 0 0 1 1.4-.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.2 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.2-3.4-8.5S9.8 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path d="M12 21s6.5-6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5 6.5 11 6.5 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path
        d="M6 3.5h3l1.3 4-2 1.5a10.5 10.5 0 0 0 5.7 5.7l1.5-2 4 1.3v3a1.5 1.5 0 0 1-1.6 1.5C11.5 18 6 12.5 5.5 6.1A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <circle cx="12" cy="8.5" r="3.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20c1.1-3.3 3.8-5.2 7-5.2s5.9 1.9 7 5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChampSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; labelEn: string }[];
  onChange: (value: string) => void;
}) {
  const { t } = useDashboardLangue();
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{label}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${champBoxClasses} cursor-pointer`}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label, option.labelEn)}
          </option>
        ))}
      </select>
    </div>
  );
}
