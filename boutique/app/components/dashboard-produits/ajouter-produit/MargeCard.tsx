"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { libelleCombinaison } from "./combinaisons";
import type { Attribut, Combinaison } from "./types";

/*
  "Ce qui vous reste" (Écran 08, point 5) : troisième colonne à part
  entière dans la maquette — reproduit ici avec le même détail (barre à
  quatre segments, lignes prix de revente / achat / frais / commission,
  puis "Il vous reste" répété en bas), pas juste la marge brute.

  Dès qu'il y a des variantes, le calcul porte sur la combinaison "mise en
  avant" (voir VariantesProduit.tsx — une seule à la fois, choisie en
  cliquant une ligne du tableau des combinaisons) ; sans variante, on
  retombe sur les prix saisis dans TarificationProduit.

  Frais logistiques et commission : AUCUNE API de tarification n'existe
  encore pour les calculer (cf. [[dashboard-mock-data-pending-laravel-api]]).
  Les deux formules ci-dessous (ESTIMATION_*) sont une approximation
  raisonnable pour que l'écran ne soit pas vide en attendant — à remplacer
  intégralement par la réponse de l'API le jour où elle existe, pas à
  garder comme référence de calcul réelle.
*/

// Estimation grossière, pas un tarif réel — cf. note ci-dessus.
const ESTIMATION_FRAIS_LOGISTIQUES_PAR_GRAMME = 2.5;
const ESTIMATION_TAUX_COMMISSION = 0.04; // 4 % du prix de revente

const COULEUR_ACHAT = "#3A4055";
const COULEUR_FRAIS = "#6B21D6";
const COULEUR_COMMISSION = "#B79BFF";
const COULEUR_MARGE = "#E8207E";

export default function MargeCard({
  prixAchat,
  prixVente,
  poidsGrammes,
  combinaisons,
  attributs,
}: {
  /** Prix/poids globaux (bloc Tarification) — utilisés seulement s'il n'y a aucune variante. */
  prixAchat: number | null;
  prixVente: number;
  poidsGrammes: number | null;
  combinaisons: Combinaison[];
  attributs: Attribut[];
}) {
  const { t, langue } = useDashboardLangue();
  const F = (n: number) => `${Math.round(n).toLocaleString(langue === "EN" ? "en-US" : "fr-FR")} F`;

  const combinaisonMiseEnAvant = combinaisons.find((c) => c.misEnAvant) ?? null;
  const achatCalcul = combinaisonMiseEnAvant ? combinaisonMiseEnAvant.prixAchat : prixAchat;
  const venteCalcul = combinaisonMiseEnAvant ? combinaisonMiseEnAvant.prixVente : prixVente;

  const fraisLogistiques = poidsGrammes !== null ? poidsGrammes * ESTIMATION_FRAIS_LOGISTIQUES_PAR_GRAMME : 0;
  const commission = venteCalcul > 0 ? venteCalcul * ESTIMATION_TAUX_COMMISSION : 0;

  const marge = achatCalcul !== null ? venteCalcul - achatCalcul - fraisLogistiques - commission : null;
  const margePct = marge !== null && venteCalcul > 0 ? Math.round((marge / venteCalcul) * 100) : null;
  const venteAPerte = marge !== null && marge < 0;

  // Largeurs de la barre, en % du prix de revente — même segments que la
  // maquette (achat / frais / commission / ce qui reste), calées sur 100 %
  // au lieu de laisser un vide si l'arrondi ne tombe pas juste.
  const pct = (n: number) => (venteCalcul > 0 ? Math.max(0, Math.min(100, (n / venteCalcul) * 100)) : 0);
  const segments = achatCalcul !== null
    ? [
        { couleur: COULEUR_ACHAT, largeur: pct(achatCalcul) },
        { couleur: COULEUR_FRAIS, largeur: pct(fraisLogistiques) },
        { couleur: COULEUR_COMMISSION, largeur: pct(commission) },
        { couleur: COULEUR_MARGE, largeur: Math.max(0, 100 - pct(achatCalcul) - pct(fraisLogistiques) - pct(commission)) },
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

      {/* Barre à quatre segments — achat / frais logistiques / commission /
          ce qui reste, comme dans la maquette. */}
      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        {segments.map((s, i) => (
          <span key={i} className="h-full" style={{ width: `${s.largeur}%`, background: s.couleur }} />
        ))}
      </div>

      <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

      <LigneMontant label={t("Prix de revente", "Resale price")} valeur={venteCalcul > 0 ? F(venteCalcul) : "—"} accent />
      <LigneMontant label={t("Prix d'achat", "Cost price")} valeur={achatCalcul !== null ? `− ${F(achatCalcul)}` : "—"} couleur={COULEUR_ACHAT} />
      <LigneMontant label={t("Frais logistiques", "Logistics fees")} valeur={achatCalcul !== null ? `− ${F(fraisLogistiques)}` : "—"} couleur={COULEUR_FRAIS} />
      <LigneMontant label={t("Commission et paiement", "Commission & payment")} valeur={achatCalcul !== null ? `− ${F(commission)}` : "—"} couleur={COULEUR_COMMISSION} />

      <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">{t("Il vous reste", "You keep")}</span>
        <span className={`text-base font-bold ${venteAPerte ? "text-[#c8262d]" : ""}`}>{marge !== null ? F(marge) : "—"}</span>
      </div>

      <p className="mt-3 text-[9px] leading-snug text-[var(--dashboard-text)]/35">
        {venteAPerte
          ? t("Le prix de revente ne couvre pas le prix d'achat et les frais : vente à perte.", "The resale price doesn't cover the cost price and fees: selling at a loss.")
          : combinaisonMiseEnAvant
            ? t(
                `Calcul fait sur la combinaison ${libelleCombinaison(combinaisonMiseEnAvant, attributs)}, celle qui est mise en avant dans la liste des variantes. Choisissez-en une autre et le calcul suit.`,
                `Calculated on the ${libelleCombinaison(combinaisonMiseEnAvant, attributs)} combination, the one featured in the variants list. Pick another one and the calculation follows.`
              )
            : t(
                "Frais logistiques et commission sont estimés en attendant l'API de tarification.",
                "Logistics fees and commission are estimated pending the pricing API."
              )}
      </p>
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
