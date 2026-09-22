import type { ReactNode } from "react";

/*
  Copie volontaire de `texteAvecChiffres` (app/components/dashboard-accueil/shared.tsx)
  pour la boutique publique : le fichier source est marqué "use client" et
  importe des providers du dashboard (useDashboardLangue, useFiltrable) —
  l'importer depuis /boutique/[slug] tirerait tout ce contexte dans le bundle
  public pour une seule fonction pure. Garder les deux synchronisées si la
  regex change (cf. avertissement similaire en tête de boutique-style.ts).
*/

const MOIS =
  "janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|January|February|March|April|May|June|July|August|September|October|November|December|janv\\.?|févr\\.?|avr\\.?|juil\\.?|sept\\.?|oct\\.?|nov\\.?|déc\\.?";
const RE_CHIFFRES = new RegExp(`(\\d+(?:[.,:/\\-\\s]\\d+|\\s?(?:h|min|mn|j|s|sur|${MOIS})\\s?\\d+)*)`, "g");

export function texteAvecChiffres(texte: string): ReactNode[] {
  return texte.split(RE_CHIFFRES).map((partie, i) =>
    /\d/.test(partie) ? (
      <span key={i} className="font-figures">
        {partie}
      </span>
    ) : (
      partie
    )
  );
}
