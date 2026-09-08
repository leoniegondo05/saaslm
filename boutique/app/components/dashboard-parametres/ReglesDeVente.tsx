"use client";

import { useState } from "react";
import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";

/*
  Écran 28 "Réglages · mes règles de vente" : ce que la boutique s'impose
  à elle-même — protection des colis, exigences de publication d'un
  produit, et délai de litige laissé au client. Tout est directement
  cliquable, comme les fiches précédentes. Champs statiques pour
  l'instant, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

const DELAI_MIN = 24; // heures — minimum imposé par la plateforme
const DELAI_MAX = 168; // heures — 7 jours

// Raccourcis sous le curseur : cliquer en pose la valeur exacte, le
// curseur suit. Le curseur reste libre entre ces valeurs.
const DELAIS_RAPIDES = [
  { label: "24 heures", heures: 24 },
  { label: "48 heures", heures: 48 },
  { label: "72 heures", heures: 72 },
  { label: "5 jours", heures: 120 },
  { label: "7 jours", heures: 168 },
];

export default function ReglesDeVente({ first = false }: { first?: boolean }) {
  const [protectionColis, setProtectionColis] = useState(true);
  const [videoObligatoire, setVideoObligatoire] = useState(true);
  const [troisPhotos, setTroisPhotos] = useState(true);
  const [margeMinimale, setMargeMinimale] = useState(true);
  const [delaiHeures, setDelaiHeures] = useState(72);
  const [enregistre, setEnregistre] = useState(false);

  const pctDelai = ((delaiHeures - DELAI_MIN) / (DELAI_MAX - DELAI_MIN)) * 100;

  const enregistrer = () => {
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 1800);
  };

  return (
    <>
      <SectionHeader
        eyebrow="Mes règles de vente"
        title="Ce que vous vous imposez à vous-même"
        subtitle="Protection des colis, exigences de publication, délai de litige."
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
        <Card title="Ce qui protège vos colis" titleTab badge={<Tag tone="ok">Active par défaut</Tag>} className="!bg-[var(--dashboard-card-bg)]">
          <ReglaRow
            titre="Protection contre le vol et la perte"
            note="Cochée d'avance sur chaque nouveau dépôt de stock. Le taux est fixé par votre partenaire agréé, et se confirme dépôt par dépôt."
            checked={protectionColis}
            onChange={() => setProtectionColis((v) => !v)}
          />
        </Card>

        <Card
          title="Ce qu'un produit doit avoir pour être publié"
          titleTab
          badge={<Tag tone="pink">3 règles</Tag>}
          className="!bg-[var(--dashboard-card-bg)]"
        >
          <p className="text-xs text-[var(--dashboard-text)]/50">
            Ces règles bloquent la publication tant qu&apos;elles ne sont pas remplies. C&apos;est
            ce qui empêche une page de commande bâclée de partir en publicité.
          </p>
          <div className="mt-3 space-y-2">
            <ReglaRow
              titre="Vidéo obligatoire"
              note="Un produit sans vidéo ne peut pas être publié. C'est la vidéo qui vend sur téléphone, et 93 % de vos visiteurs sont sur téléphone."
              checked={videoObligatoire}
              onChange={() => setVideoObligatoire((v) => !v)}
            />
            <ReglaRow
              titre="Trois photos au minimum"
              note="Une seule photo suffit rarement à décider quelqu'un."
              checked={troisPhotos}
              onChange={() => setTroisPhotos((v) => !v)}
            />
            <ReglaRow
              titre="Marge minimale"
              note="Refuser la publication sous 15 % de marge nette, frais déduits."
              checked={margeMinimale}
              onChange={() => setMargeMinimale((v) => !v)}
            />
          </div>
        </Card>

        <Card title="Le délai que vous laissez au client" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-xs text-[var(--dashboard-text)]/50">
            C&apos;est vous qui décidez combien de temps un client peut ouvrir un litige après
            avoir reçu son colis. Ce délai vaut pour toutes les commandes de votre boutique.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-4 py-3.5">
            <div className="shrink-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">Délai laissé au client</p>
              <p className="mt-0.5 text-lg font-bold tracking-tight text-[var(--dashboard-text)]">{delaiHeures} h</p>
            </div>

            <div className="min-w-[220px] flex-1">
              <div className="relative flex h-5 items-center">
                <div className="pointer-events-none absolute inset-x-0 h-1.5 rounded-full bg-[var(--dashboard-text)]/10" />
                <div
                  className="pointer-events-none absolute left-0 h-1.5 rounded-full bg-brand-pink"
                  style={{ width: `${pctDelai}%` }}
                />
                <input
                  type="range"
                  min={DELAI_MIN}
                  max={DELAI_MAX}
                  step={1}
                  value={delaiHeures}
                  onChange={(e) => setDelaiHeures(Number(e.target.value))}
                  aria-label="Délai laissé au client, en heures"
                  className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent
                    [&::-webkit-slider-runnable-track]:bg-transparent
                    [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--dashboard-text)]/10
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(20,18,32,0.3)]
                    [&::-moz-range-track]:bg-transparent
                    [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(20,18,32,0.3)]"
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-[var(--dashboard-text)]/40">
                <span>24 h · minimum imposé</span>
                <span>7 jours</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {DELAIS_RAPIDES.map(({ label, heures }) => (
              <button
                key={label}
                type="button"
                onClick={() => setDelaiHeures(heures)}
                aria-pressed={delaiHeures === heures}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                  delaiHeures === heures
                    ? "bg-[#141220] text-white dark:bg-brand-pink"
                    : "border border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/60 hover:bg-[var(--dashboard-text)]/[0.05]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff1d6] px-3 py-2.5">
            <Tag tone="warn">Minimum imposé</Tag>
            <p className="text-[11px] leading-snug text-[#a8690a]">
              Vingt-quatre heures au minimum. La plateforme n&apos;accepte pas moins : un client
              doit avoir le temps d&apos;ouvrir son colis et de constater un problème. Vous pouvez
              donner davantage, jamais moins.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

function ReglaRow({
  titre,
  note,
  checked,
  onChange,
}: {
  titre: string;
  note: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[var(--dashboard-text)]">{titre}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-[var(--dashboard-text)]/50">{note}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={titre} />
    </div>
  );
}

/* Même composant que dashboard-profil/MotDePasseSecurite.tsx, repris à
   l'identique — pas encore mutualisé dans shared.tsx. */
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
