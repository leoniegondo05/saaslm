"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Card, SectionHeader, Tag, useMockSave } from "../dashboard-accueil/shared";
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
*/

const SECTEURS = [
  { value: "Beauté et soins", label: "Beauté et soins", labelEn: "Beauty and care" },
  { value: "Mode et accessoires", label: "Mode et accessoires", labelEn: "Fashion and accessories" },
  { value: "Alimentation", label: "Alimentation", labelEn: "Food" },
  { value: "Électronique", label: "Électronique", labelEn: "Electronics" },
  { value: "Maison et déco", label: "Maison et déco", labelEn: "Home and decor" },
];

const OUI_NON = [
  { value: "Oui", label: "Oui", labelEn: "Yes" },
  { value: "Non", label: "Non", labelEn: "No" },
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

      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => trigger()}
          disabled={saving}
          className="rounded-full bg-[#141220] px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 dark:bg-brand-pink"
        >
          {saving ? t("Enregistrement…", "Saving…") : done ? t("✓ Enregistré", "✓ Saved") : t("Enregistrer", "Save")}
        </button>
      </div>

      <div className="grid gap-3">
        <Card title={t("Identité", "Identity")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-[var(--dashboard-card-bg)] shadow-[0_2px_10px_rgba(20,18,32,0.1)]">
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
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--dashboard-card-bg)] bg-[#141220] text-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition hover:brightness-110 dark:bg-brand-pink"
              >
                <CameraIcon />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickLogo} className="hidden" />
            <div>
              <p className="text-xs font-semibold text-[var(--dashboard-text)]">{t("Logo de la boutique", "Shop logo")}</p>
              <p className="text-[11px] text-[var(--dashboard-text)]/50">
                {t("Affiché dans le header du dashboard.", "Shown in the dashboard header.")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label={t("Nom de la boutique", "Shop name")}
              value={identite.nom}
              onChange={(nom) => setIdentite((b) => ({ ...b, nom }))}
            />
            <ChampLectureSeule label={t("Identifiant de la boutique", "Shop ID")} value={IDENTIFIANT_BOUTIQUE} />
          </div>
          <div className="mt-3">
            <ChampSelect
              label={t("Secteur principal", "Main sector")}
              value={identite.secteur}
              options={SECTEURS}
              onChange={(secteur) => setIdentite((b) => ({ ...b, secteur }))}
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
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label={t("Adresse de la boutique", "Shop address")}
              value={identite.adresse}
              onChange={(adresse) => setIdentite((b) => ({ ...b, adresse }))}
            />
            <ChampSelect
              label={t("Boutique ouverte", "Shop open")}
              value={identite.ouverte ? "Oui" : "Non"}
              options={OUI_NON}
              onChange={(v) => setIdentite((b) => ({ ...b, ouverte: v === "Oui" }))}
            />
          </div>
        </Card>

        <Card title={t("Adresse d'enlèvement", "Pickup address")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Là où le livreur du partenaire vient chercher vos colis et vos dépôts. Les jours et les heures de passage sont fixés par le partenaire.",
              "Where the partner's courier comes to collect your parcels and deposits. Pickup days and times are set by the partner."
            )}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label={t("Commune", "District")}
              value={enlevement.commune}
              onChange={(commune) => setEnlevement((e) => ({ ...e, commune }))}
            />
            <Champ
              label={t("Quartier", "Neighborhood")}
              value={enlevement.quartier}
              onChange={(quartier) => setEnlevement((e) => ({ ...e, quartier }))}
            />
          </div>
          <div className="mt-3">
            <Champ
              label={t("Adresse précise et repère", "Precise address and landmark")}
              value={enlevement.adressePrecise}
              placeholder={t("Non renseignée", "Not provided")}
              onChange={(adressePrecise) => setEnlevement((e) => ({ ...e, adressePrecise }))}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label={t("Téléphone d'enlèvement", "Pickup phone number")}
              value={enlevement.telephone}
              onChange={(telephone) => setEnlevement((e) => ({ ...e, telephone }))}
            />
            <Champ
              label={t("Personne à contacter", "Contact person")}
              value={enlevement.contact}
              onChange={(contact) => setEnlevement((e) => ({ ...e, contact }))}
            />
          </div>
        </Card>

        <Card
          title={t("Visible par vos clients", "Shown to your customers")}
          titleTab
          badge={<Tag tone="neutral">{t("Toujours affiché", "Always shown")}</Tag>}
          className="!bg-[var(--dashboard-card-bg)]"
        >
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Avec le nom de la boutique, ces informations restent visibles sur chaque page de commande — la section « Vendu par » ne se masque pas.",
              "Along with the shop name, this information stays visible on every order page — the “Sold by” section can't be hidden."
            )}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label={t("Téléphone", "Phone number")}
              value={visiblePublic.telephone}
              placeholder={t("Non renseigné", "Not provided")}
              onChange={(telephone) => setVisiblePublic((v) => ({ ...v, telephone }))}
            />
            <Champ
              label={t("Adresse email", "Email address")}
              value={visiblePublic.email}
              placeholder={t("Non renseignée", "Not provided")}
              onChange={(email) => setVisiblePublic((v) => ({ ...v, email }))}
            />
          </div>
          <div className="mt-3">
            <Champ
              label={t("Localisation", "Location")}
              value={visiblePublic.localisation}
              placeholder={t("Non renseignée", "Not provided")}
              onChange={(localisation) => setVisiblePublic((v) => ({ ...v, localisation }))}
            />
          </div>
        </Card>

        <Link
          href="/dashboard/reglages/personnaliser"
          className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl p-px transition hover:brightness-105"
          style={{ backgroundImage: "linear-gradient(100deg, #EC0C8C 0%, #6B21D6 55%, rgba(255,255,255,.4) 100%)" }}
        >
          <span className="flex w-full items-center gap-3.5 rounded-[15px] px-4 py-3.5" style={{ background: "linear-gradient(120deg, rgba(236,12,140,.14), rgba(58,29,138,.16) 60%, var(--dashboard-card-bg) 100%)" }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-pink/40 bg-brand-pink/15 text-brand-pink">
              <PaletteIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-[var(--dashboard-text)]">{t("Personnaliser ma boutique", "Customize my shop")}</span>
              <span className="block text-[10.5px] text-[var(--dashboard-text)]/55">
                {t("Sections, style, formulaire de commande, avis, questions", "Sections, style, order form, reviews, questions")}
              </span>
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-[0_2px_10px_rgba(20,18,32,0.15)] transition group-hover:translate-x-0.5">
              <FlecheDroiteIcon />
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}

const champBoxClasses =
  "mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/50 focus:bg-brand-pink/5";

function Champ({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{label}</p>
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
          className={champBoxClasses}
        />
      )}
    </div>
  );
}

function ChampLectureSeule({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{label}</p>
      <p className={`${champBoxClasses} flex items-center text-[var(--dashboard-text)]/60`}>{value}</p>
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
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.7l1-1.6h7.6l1 1.6h1.7A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.5" />
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
