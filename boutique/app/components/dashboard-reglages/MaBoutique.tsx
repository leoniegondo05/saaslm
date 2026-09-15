"use client";

import { useState } from "react";
import { Card, SectionHeader, useMockSave } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran 25 "Réglages · Ma boutique" : identité, adresse d'enlèvement, et
  l'accès à la personnalisation. Les champs sont éditables directement,
  sans passer par un mode "Modifier" au préalable — seul "Enregistrer"
  fige l'état courant. Aucun endpoint Laravel n'existe encore pour
  persister (cf. mémoire [[dashboard-mock-data-pending-laravel-api]]) :
  "Enregistrer" ne fait donc que confirmer visuellement.
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

export default function MaBoutique({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [identite, setIdentite] = useState(IDENTITE_INIT);
  const [enlevement, setEnlevement] = useState(ENLEVEMENT_INIT);
  const { saving, done, trigger } = useMockSave();

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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label={t("Nom de la boutique", "Shop name")}
              value={identite.nom}
              onChange={(nom) => setIdentite((b) => ({ ...b, nom }))}
            />
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
