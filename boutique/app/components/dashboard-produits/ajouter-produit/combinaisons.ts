import type { Attribut, Combinaison } from "./types";

/*
  Logique pure (aucun état React ici) qui transforme une liste d'attributs
  en liste de combinaisons — Taille (4 valeurs) x Couleur (3 valeurs) = 12
  lignes. Isolée dans son propre fichier pour rester testable et
  réutilisable telle quelle le jour où l'API Laravel calculera elle-même
  ces combinaisons côté serveur (cf. [[dashboard-mock-data-pending-laravel-api]]).
*/

/** Clé stable d'une combinaison de valeurs (dépend de l'ordre des attributs, mais celui-ci ne change pas en cours de saisie). */
function cleCombinaison(valeurs: Record<string, string>, attributs: Attribut[]): string {
  return attributs.map((a) => valeurs[a.id] ?? "").join("|");
}

/** Produit cartésien des valeurs de chaque attribut. Un attribut sans valeur est simplement ignoré (pas de blocage). */
function produitCartesien(attributs: Attribut[]): Record<string, string>[] {
  return attributs.reduce<Record<string, string>[]>(
    (acc, attribut) => {
      if (attribut.valeurs.length === 0) return acc;
      const next: Record<string, string>[] = [];
      for (const base of acc) {
        for (const valeur of attribut.valeurs) {
          next.push({ ...base, [attribut.id]: valeur.id });
        }
      }
      return next;
    },
    [{}]
  );
}

/**
 * Recalcule les combinaisons à partir des attributs actuels, en conservant
 * référence / prix / quantité / état des combinaisons déjà existantes
 * (retrouvées par leur clé de valeurs) : ajouter une valeur ajoute les
 * lignes manquantes sans toucher aux autres, comme décrit dans la maquette.
 */
export function recalculerCombinaisons(
  attributs: Attribut[],
  precedentes: Combinaison[],
  refPrefixe: string,
  prixAchatDefaut: number | null,
  prixVenteDefaut: number
): Combinaison[] {
  if (attributs.length === 0) return [];
  const parCle = new Map(precedentes.map((c) => [c.cle, c]));
  const combinaisons = produitCartesien(attributs).map((valeurs, index) => {
    const cle = cleCombinaison(valeurs, attributs);
    const existante = parCle.get(cle);
    if (existante) return existante;
    const suffixe = String(index + 1).padStart(2, "0");
    return {
      id: `${refPrefixe}-${suffixe}-${cle}`,
      cle,
      valeurs,
      reference: `${refPrefixe}-${suffixe}`,
      prixAchat: prixAchatDefaut,
      prixVente: prixVenteDefaut,
      quantite: 0,
      active: true,
      misEnAvant: false,
    };
  });

  // Toujours une combinaison "mise en avant" dès qu'il y en a au moins une
  // (cf. maquette : le calcul de marge s'appuie dessus) — la première sert
  // de choix par défaut tant que la boutique n'en a pas choisi une autre.
  if (combinaisons.length > 0 && !combinaisons.some((c) => c.misEnAvant)) {
    combinaisons[0] = { ...combinaisons[0], misEnAvant: true };
  }
  return combinaisons;
}

/** Libellé lisible d'une combinaison ("S · Noir") — partagé entre le tableau des combinaisons et le calcul de marge. */
export function libelleCombinaison(c: Combinaison, attributs: Attribut[]): string {
  return attributs
    .map((a) => a.valeurs.find((v) => v.id === c.valeurs[a.id])?.label)
    .filter(Boolean)
    .join(" · ");
}
