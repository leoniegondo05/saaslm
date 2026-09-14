"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { libelleCombinaison } from "./combinaisons";
import type { Attribut, Combinaison } from "./types";

/*
  "Ce qui vous reste" (Écran 08, point 5) : troisième colonne à part
  entière dans la maquette — reproduit ici avec le même détail (barre à
  segments, lignes prix de revente / achat, puis "Il vous reste" répété
  en bas), pas juste la marge brute.

  Dès qu'il y a des variantes, le calcul porte sur la combinaison "mise en
  avant" (voir VariantesProduit.tsx — une seule à la fois, choisie en
  cliquant une ligne du tableau des combinaisons) ; sans variante, on
  retombe sur les prix saisis dans TarificationProduit.

  Frais logistiques et commission retirés du calcul (pas d'API de
  tarification pour les estimer, cf. [[dashboard-mock-data-pending-laravel-api]]) :
  la marge est prix de revente − prix d'achat, sans plus.
*/

const COULEUR_ACHAT = "#3A4055";
const COULEUR_MARGE = "#E8207E";

export default function MargeCard({
  prixAchat,
  prixVente,
  combinaisons,
  attributs,
}: {
  /** Prix globaux (bloc Tarification) — utilisés seulement s'il n'y a aucune variante. */
  prixAchat: number | null;
  prixVente: number;
  combinaisons: Combinaison[];
  attributs: Attribut[];
}) {
  const { t, langue } = useDashboardLangue();
  const F = (n: number) => `${Math.round(n).toLocaleString(langue === "EN" ? "en-US" : "fr-FR")} F`;

  const combinaisonMiseEnAvant = combinaisons.find((c) => c.misEnAvant) ?? null;
  const achatCalcul = combinaisonMiseEnAvant ? combinaisonMiseEnAvant.prixAchat : prixAchat;
  const venteCalcul = combinaisonMiseEnAvant ? combinaisonMiseEnAvant.prixVente : prixVente;

  const marge = achatCalcul !== null ? venteCalcul - achatCalcul : null;
  const margePct = marge !== null && venteCalcul > 0 ? Math.round((marge / venteCalcul) * 100) : null;
  const venteAPerte = marge !== null && marge < 0;

  // Largeurs de la barre, en % du prix de revente — achat / ce qui reste,
  // calées sur 100 % au lieu de laisser un vide si l'arrondi ne tombe pas juste.
  const pct = (n: number) => (venteCalcul > 0 ? Math.max(0, Math.min(100, (n / venteCalcul) * 100)) : 0);
  const segments = achatCalcul !== null
    ? [
        { couleur: COULEUR_ACHAT, largeur: pct(achatCalcul) },
        { couleur: COULEUR_MARGE, largeur: Math.max(0, 100 - pct(achatCalcul)) },
      ]
    : [];

  return (
    <div className="flex h-full flex-col rounded-[28px] bg-[var(--dashboard-card-bg)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">{t("Ce qui vous reste", "What you keep")}</p>
        <span className="shrink-0 rounded-full bg-black/[0.05] px-2.5 py-1 text-[9px] font-semibold text-[var(--dashboard-text)]/50 dark:bg-white/[0.08]">
          {t("À chaque chiffre saisi", "As you type")}
        </span>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <p className={`text-3xl font-bold tracking-tight ${venteAPerte ? "text-[#c8262d]" : ""}`}>{marge !== null ? F(marge) : "—"}</p>
        {margePct !== null && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${venteAPerte ? "bg-[#ffe1e2] text-[#c8262d]" : "bg-black/[0.05] text-[var(--dashboard-text)]/60 dark:bg-white/[0.08]"}`}>
            {t("Marge", "Margin")} {margePct}%
          </span>
        )}
      </div>

      {/* Barre à deux segments — achat / ce qui reste. */}
      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        {segments.map((s, i) => (
          <span key={i} className="h-full" style={{ width: `${s.largeur}%`, background: s.couleur }} />
        ))}
      </div>

      <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

      <LigneMontant label={t("Prix de revente", "Resale price")} valeur={venteCalcul > 0 ? F(venteCalcul) : "—"} accent />
      <LigneMontant label={t("Prix d'achat", "Cost price")} valeur={achatCalcul !== null ? `− ${F(achatCalcul)}` : "—"} couleur={COULEUR_ACHAT} />

      <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">{t("Il vous reste", "You keep")}</span>
        <span className={`text-base font-bold ${venteAPerte ? "text-[#c8262d]" : ""}`}>{marge !== null ? F(marge) : "—"}</span>
      </div>

      {(venteAPerte || combinaisonMiseEnAvant) && (
        <p className="mt-3 text-[9px] leading-snug text-[var(--dashboard-text)]/35">
          {venteAPerte
            ? t("Le prix de revente ne couvre pas le prix d'achat : vente à perte.", "The resale price doesn't cover the cost price: selling at a loss.")
            : combinaisonMiseEnAvant
              ? t(
                  `Calcul fait sur la combinaison ${libelleCombinaison(combinaisonMiseEnAvant, attributs)}, celle qui est mise en avant dans la liste des variantes. Choisissez-en une autre et le calcul suit.`,
                  `Calculated on the ${libelleCombinaison(combinaisonMiseEnAvant, attributs)} combination, the one featured in the variants list. Pick another one and the calculation follows.`
                )
              : null}
        </p>
      )}
    </div>
  );
}

function LigneMontant({
  label,
  valeur,
  couleur,
  accent = false,
}: {
  label: string;
  valeur: string;
  /** Pastille de couleur devant le libellé — absente pour la ligne "Prix de revente". */
  couleur?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs first:mt-0" style={{ marginTop: accent ? 0 : 7 }}>
      <span className={`flex items-center gap-1.5 ${accent ? "text-[var(--dashboard-text)]/50" : "text-[var(--dashboard-text)]/50"}`}>
        {couleur && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: couleur }} />}
        {label}
      </span>
      <span className={accent ? "font-semibold" : ""}>{valeur}</span>
    </div>
  );
}
