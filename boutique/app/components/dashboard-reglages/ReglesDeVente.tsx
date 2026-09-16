"use client";

import { useState } from "react";
import { Card, SectionHeader, Tag, useMockSave } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

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
  { label: "24 heures", labelEn: "24 hours", heures: 24 },
  { label: "48 heures", labelEn: "48 hours", heures: 48 },
  { label: "72 heures", labelEn: "72 hours", heures: 72 },
  { label: "5 jours", labelEn: "5 days", heures: 120 },
  { label: "7 jours", labelEn: "7 days", heures: 168 },
];

export default function ReglesDeVente({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [protectionColis, setProtectionColis] = useState(true);
  const [videoObligatoire, setVideoObligatoire] = useState(true);
  const [troisPhotos, setTroisPhotos] = useState(true);
  const [margeMinimale, setMargeMinimale] = useState(true);
  const [delaiHeures, setDelaiHeures] = useState(72);
  const { saving, done, trigger } = useMockSave();

  const pctDelai = ((delaiHeures - DELAI_MIN) / (DELAI_MAX - DELAI_MIN)) * 100;

  return (
    <>
      <SectionHeader
        eyebrow={t("Mes règles de vente", "My sales rules")}
        title={t("Ce que vous vous imposez à vous-même", "What you require of yourself")}
        subtitle={t(
          "Protection des colis, exigences de publication, délai de litige.",
          "Parcel protection, publishing requirements, dispute window."
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
        <Card title={t("Ce qui protège vos colis", "What protects your parcels")} titleTab badge={<Tag tone="ok">{t("Active par défaut", "Active by default")}</Tag>} className="!bg-[var(--dashboard-card-bg)]">
          <ReglaRow
            titre={t("Protection contre le vol et la perte", "Protection against theft and loss")}
            note={t(
              "Cochée d'avance sur chaque nouveau dépôt de stock. Le taux est fixé par votre partenaire agréé, et se confirme dépôt par dépôt.",
              "Checked in advance on every new stock deposit. The rate is set by your approved partner, and confirmed deposit by deposit."
            )}
            checked={protectionColis}
            onChange={() => setProtectionColis((v) => !v)}
          />
        </Card>

        <Card
          title={t("Ce qu'un produit doit avoir pour être publié", "What a product needs to be published")}
          titleTab
          badge={<Tag tone="pink">{t("3 règles", "3 rules")}</Tag>}
          className="!bg-[var(--dashboard-card-bg)]"
        >
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "Ces règles bloquent la publication tant qu'elles ne sont pas remplies. C'est ce qui empêche une page de commande bâclée de partir en publicité.",
              "These rules block publishing until they're met. It's what keeps a sloppy order page from going out in an ad."
            )}
          </p>
          <div className="mt-3 space-y-2">
            <ReglaRow
              titre={t("Vidéo obligatoire", "Video required")}
              note={t(
                "Un produit sans vidéo ne peut pas être publié. C'est la vidéo qui vend sur téléphone, et 93 % de vos visiteurs sont sur téléphone.",
                "A product without a video cannot be published. Video is what sells on phones, and 93% of your visitors are on phones."
              )}
              checked={videoObligatoire}
              onChange={() => setVideoObligatoire((v) => !v)}
            />
            <ReglaRow
              titre={t("Trois photos au minimum", "Three photos minimum")}
              note={t(
                "Une seule photo suffit rarement à décider quelqu'un.",
                "A single photo is rarely enough to convince someone."
              )}
              checked={troisPhotos}
              onChange={() => setTroisPhotos((v) => !v)}
            />
            <ReglaRow
              titre={t("Marge minimale", "Minimum margin")}
              note={t(
                "Refuser la publication sous 15 % de marge nette, frais déduits.",
                "Refuse publishing below 15% net margin, fees deducted."
              )}
              checked={margeMinimale}
              onChange={() => setMargeMinimale((v) => !v)}
            />
          </div>
        </Card>

        <Card title={t("Le délai que vous laissez au client", "The window you give the customer")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "C'est vous qui décidez combien de temps un client peut ouvrir un litige après avoir reçu son colis. Ce délai vaut pour toutes les commandes de votre boutique.",
              "You decide how long a customer can open a dispute after receiving their parcel. This window applies to every order in your shop."
            )}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-4 py-3.5">
            <div className="shrink-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Délai laissé au client", "Window given to the customer")}</p>
              <p className="mt-0.5 text-lg font-bold tracking-tight text-[var(--dashboard-text)] font-figures">{delaiHeures} h</p>
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
                  aria-label={t("Délai laissé au client, en heures", "Window given to the customer, in hours")}
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
                <span>{t("24 h · minimum imposé", "24 h · minimum required")}</span>
                <span>{t("7 jours", "7 days")}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {DELAIS_RAPIDES.map(({ label, labelEn, heures }) => (
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
                {t(label, labelEn)}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff1d6] px-3 py-2.5">
            <Tag tone="warn">{t("Minimum imposé", "Minimum required")}</Tag>
            <p className="text-[11px] leading-snug text-[#a8690a]">
              {t(
                "Vingt-quatre heures au minimum. La plateforme n'accepte pas moins : un client doit avoir le temps d'ouvrir son colis et de constater un problème. Vous pouvez donner davantage, jamais moins.",
                "Twenty-four hours minimum. The platform won't accept less: a customer must have time to open their parcel and notice a problem. You can give more, never less."
              )}
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
