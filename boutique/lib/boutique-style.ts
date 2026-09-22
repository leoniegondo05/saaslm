import type { CSSProperties } from "react";
import type { EditeurState } from "../app/components/dashboard-reglages/personnaliser/types";

/*
  Traduit `EditeurState.style`/`texte` (couleurs, police, formes — réglés
  dans l'onglet "Style" de l'éditeur) en variables CSS, pour que la boutique
  publique (/boutique/[slug]) affiche exactement ce que le marchand a choisi.

  Copie volontaire de la logique déjà présente dans BoutiquePreview.tsx
  (variable `vars`, ~ligne 579) plutôt qu'un import : BoutiquePreview.tsx ne
  l'exporte pas et reste le composant fragile de l'éditeur — dupliquer ces
  ~20 lignes pures évite d'y toucher (cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] pour le contexte plus large du
  pont éditeur ↔ public). Garder les deux synchronisées si l'un des deux
  réglages change de forme.
*/

export const RAYON_BOUTON: Record<EditeurState["style"]["boutonForme"], string> = {
  carre: "6px",
  arrondi: "12px",
  pilule: "999px",
};

export const OMBRE_CARTE: Record<EditeurState["style"]["ombres"], string> = {
  aucune: "none",
  legeres: "0 10px 24px -12px rgba(11,14,28,.3)",
  marquees: "0 18px 34px -10px rgba(11,14,28,.5)",
};

export const ESPACE_SECTION: Record<EditeurState["style"]["espacementSections"], string> = {
  serre: "0px",
  normal: "10px",
  aere: "22px",
};

const FONT_TITRES: Record<string, string> = { moderne: "var(--font-bricolage)", elegante: "var(--font-sora)" };
const FONT_CORPS: Record<string, string> = { Sora: "var(--font-sora)", "Bricolage Grotesque": "var(--font-bricolage)" };
const TAILLE_TEXTE_BASE: Record<string, string> = { petite: "13.5px", moyenne: "15px", grande: "16.5px" };
const TITRE_GRAISSE: Record<string, number> = { demi: 600, gras: 800 };
const TITRE_ESPACEMENT: Record<string, string> = { serre: "-0.01em", normal: "normal" };

export function variablesBoutique(state: EditeurState): CSSProperties {
  const { style, texte } = state;
  const fondEffectif = style.apparence === "sombre" ? "#141220" : style.couleurFond;
  const texteEffectif = style.apparence === "sombre" ? "#FFFFFF" : style.couleurTexte;

  return {
    ["--ac" as string]: style.couleurPrincipale,
    ["--bg" as string]: fondEffectif,
    ["--tx" as string]: texteEffectif,
    ["--rad" as string]: RAYON_BOUTON[style.boutonForme],
    // Rayon des CARTES/images/encadrés (produits, avis, FAQ, résumé panier…)
    // — distinct de --rad (boutons uniquement, peut valoir 999px en pilule) :
    // appliquer --rad à un grand rectangle donnait des coins énormes/moches
    // (retour utilisateur 2026-09-22). `style.arrondi` est déjà le champ que
    // l'éditeur utilise pour ces mêmes éléments (cf. BoutiquePreview.tsx,
    // variable `rayon` des cartes produit).
    ["--card-rad" as string]: `${style.arrondi}px`,
    // Rayon des champs de formulaire — l'éditeur (FormulaireChampsApercu)
    // les garde à un arrondi fixe modéré indépendant de boutonForme/arrondi
    // (rounded-xl / rounded-none selon styleChamps, jamais 999px) ; ~12px
    // reproduit ce choix côté boutique publique.
    ["--field-rad" as string]: "12px",
    ["--btn-uppercase" as string]: style.boutonTexteMajuscules ? "uppercase" : "none",
    ["--btn-border" as string]: style.epaisseurContour === "epaisse" ? "2.5px" : "1.5px",
    ["--card-shadow" as string]: OMBRE_CARTE[style.ombres],
    ["--section-gap" as string]: ESPACE_SECTION[style.espacementSections],
    ["--font-titre" as string]: FONT_TITRES[texte.titresPolice],
    ["--font-corps" as string]: FONT_CORPS[texte.texteCourantPolice],
    ["--titre-graisse" as string]: TITRE_GRAISSE[texte.graisseTitres],
    ["--titre-espacement" as string]: TITRE_ESPACEMENT[texte.espacementLettres],
    ["--titre-majuscules" as string]: texte.titresMajuscules ? "uppercase" : "none",
    background: fondEffectif,
    color: texteEffectif,
    fontFamily: "var(--font-corps)",
    fontSize: TAILLE_TEXTE_BASE[texte.tailleTexte],
  };
}

export function boutonCommandeFond(state: EditeurState): string {
  const { boutonCommandeCouleur, boutonRemplissage, couleurPrincipale } = state.style;
  if (boutonCommandeCouleur === "nuit") return "#0B0E1C";
  if (boutonCommandeCouleur === "violet") return "linear-gradient(100deg,#6B21D6,#3A1D8A)";
  if (boutonRemplissage === "degrade") return `linear-gradient(100deg, ${couleurPrincipale}, #3A1D8A)`;
  return couleurPrincipale;
}
