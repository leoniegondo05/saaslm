"use client";

import { useState } from "react";
import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";

/*
  Écran 25 "Réglages · Ma boutique" : identité, adresse d'enlèvement, et
  l'accès à la personnalisation. Les champs sont éditables directement,
  sans passer par un mode "Modifier" au préalable — seul "Enregistrer"
  fige l'état courant. Aucun endpoint Laravel n'existe encore pour
  persister (cf. mémoire [[dashboard-mock-data-pending-laravel-api]]) :
  "Enregistrer" ne fait donc que confirmer visuellement.

  "Personnaliser ma boutique" n'a pas encore d'écran construit côté
  frontend (contrairement à la fiche de référence, qui suppose l'existant
  à reprendre) : le bloc et son bouton sont affichés, mais le bouton ne
  mène nulle part pour l'instant.
*/

const SECTEURS = ["Beauté et soins", "Mode et accessoires", "Alimentation", "Électronique", "Maison et déco"];

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
  adresse: "lm.ci/awa-beaute",
  ouverte: true,
};

const ENLEVEMENT_INIT: Enlevement = {
  commune: "Cocody",
  quartier: "Riviera 3",
  adressePrecise: "",
  telephone: "+225 07 00 00 00 00",
  contact: "Awa K.",
};

const PERSONNALISATION_ITEMS = [
  "Logo, favicon et bannière",
  "Couleur principale et couleur des boutons",
  "Écriture et forme des coins",
  "Barre du haut et bandeau d'annonce",
  "Disposition de la fiche produit",
  "Pied de page, réseaux et mentions",
  "Pixel Meta, pixel TikTok, Google Analytics",
  "Aperçu avant publication",
];

export default function MaBoutique({ first = false }: { first?: boolean }) {
  const [identite, setIdentite] = useState(IDENTITE_INIT);
  const [enlevement, setEnlevement] = useState(ENLEVEMENT_INIT);
  const [enregistre, setEnregistre] = useState(false);

  const enregistrer = () => {
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 1800);
  };

  return (
    <>
      <SectionHeader
        eyebrow="Ma boutique"
        title="Qui vous êtes, où l'on vient vous chercher"
        subtitle="Votre identité, l'adresse d'enlèvement, et l'accès à la personnalisation."
        first={first}
        layout="inline"
      />

      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={enregistrer}
          className="rounded-full bg-[#141220] px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
        >
          {enregistre ? "✓ Enregistré" : "Enregistrer"}
        </button>
      </div>

      <div className="grid gap-3">
        <Card title="Identité" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label="Nom de la boutique"
              value={identite.nom}
              onChange={(nom) => setIdentite((b) => ({ ...b, nom }))}
            />
            <ChampSelect
              label="Secteur principal"
              value={identite.secteur}
              options={SECTEURS}
              onChange={(secteur) => setIdentite((b) => ({ ...b, secteur }))}
            />
          </div>
          <div className="mt-3">
            <Champ
              label="Phrase de présentation"
              value={identite.presentation}
              multiline
              onChange={(presentation) => setIdentite((b) => ({ ...b, presentation }))}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label="Adresse de la boutique"
              value={identite.adresse}
              onChange={(adresse) => setIdentite((b) => ({ ...b, adresse }))}
            />
            <ChampSelect
              label="Boutique ouverte"
              value={identite.ouverte ? "Oui" : "Non"}
              options={["Oui", "Non"]}
              onChange={(v) => setIdentite((b) => ({ ...b, ouverte: v === "Oui" }))}
            />
          </div>
        </Card>

        <Card title="Adresse d'enlèvement" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-xs text-[var(--dashboard-text)]/50">
            Là où le livreur du partenaire vient chercher vos colis et vos dépôts. Les jours et
            les heures de passage sont fixés par le partenaire.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label="Commune"
              value={enlevement.commune}
              onChange={(commune) => setEnlevement((e) => ({ ...e, commune }))}
            />
            <Champ
              label="Quartier"
              value={enlevement.quartier}
              onChange={(quartier) => setEnlevement((e) => ({ ...e, quartier }))}
            />
          </div>
          <div className="mt-3">
            <Champ
              label="Adresse précise et repère"
              value={enlevement.adressePrecise}
              placeholder="Non renseignée"
              onChange={(adressePrecise) => setEnlevement((e) => ({ ...e, adressePrecise }))}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Champ
              label="Téléphone d'enlèvement"
              value={enlevement.telephone}
              onChange={(telephone) => setEnlevement((e) => ({ ...e, telephone }))}
            />
            <Champ
              label="Personne à contacter"
              value={enlevement.contact}
              onChange={(contact) => setEnlevement((e) => ({ ...e, contact }))}
            />
          </div>
        </Card>

        <div
          className="rounded-2xl p-5 text-white shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]"
          style={{ backgroundImage: "linear-gradient(155deg,#3B1FA8 0%,#1B1E72 46%,#0A0E28 100%)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold tracking-tight">Personnaliser ma boutique</p>
              <p className="mt-1 max-w-lg text-xs text-white/60">
                Tout ce que le client voit : les images, les couleurs, l&apos;écriture, la barre
                du haut, la façon dont un produit s&apos;affiche, le pied de page et le suivi
                publicitaire.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="shrink-0 cursor-not-allowed rounded-full bg-white/90 px-5 py-2.5 text-xs font-semibold text-[#141220] opacity-60"
              title="Écran à venir"
            >
              Personnaliser ma boutique
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {PERSONNALISATION_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-pink" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 px-3 py-2.5">
            <Tag tone="warn">Écran à venir</Tag>
            <p className="text-[11px] leading-snug text-white/70">
              Le bouton ne mène nulle part pour l&apos;instant : cet écran n&apos;a pas encore été
              construit côté application.
            </p>
          </div>
        </div>
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
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{label}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${champBoxClasses} cursor-pointer`}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
