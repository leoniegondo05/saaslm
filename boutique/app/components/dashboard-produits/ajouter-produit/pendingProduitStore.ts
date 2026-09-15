import type { Categorie, NouveauProduit } from "./types";

/*
  Pont entre l'écran "Ajouter un produit" (page à part depuis qu'un
  F5/actualisation dessus ne doit plus ramener à la page Produits, cf.
  page.tsx de ../../../dashboard/produits/ajouter/) et ProduitsCatalogue.tsx
  qui tient la liste des produits.

  Variables de module (pas de state React, pas de sessionStorage) :
  survivent à une navigation client Next.js (router.push reste un montage/
  démontage React, le module JS ne se recharge pas) mais repartent à zéro
  sur une vraie actualisation navigateur — exactement ce qu'on veut, et ça
  évite d'avoir à sérialiser les File (vidéo/photos) qu'un stockage
  persistant (sessionStorage, localStorage) ne peut pas porter tels quels.

  Purement temporaire : cf. mémoire [[dashboard-mock-data-pending-laravel-api]]
  — le jour où l'API Laravel existe, "Publier"/"Enregistrer en brouillon"
  posteront directement, plus besoin de repasser par la page Produits pour
  afficher le résultat.
*/

let produitEnAttente: { produit: NouveauProduit; statut: "brouillon" | "publie" } | null = null;
let categoriesEnAttente: Categorie[] = [];

export function definirProduitEnAttente(produit: NouveauProduit, statut: "brouillon" | "publie") {
  produitEnAttente = { produit, statut };
}

/** Lit le produit en attente puis vide le pont — à appeler une seule fois, au montage de ProduitsCatalogue. */
export function lireEtViderProduitEnAttente() {
  const valeur = produitEnAttente;
  produitEnAttente = null;
  return valeur;
}

/*
  Même pont, sens inverse, pour "Modifier" (fiche produit, voir
  ProduitsCatalogue.tsx) : `editionAOuvrir` porte les valeurs à préremplir
  vers la page /ajouter (lu à son montage), `editionEnAttente` porte le
  résultat au retour — identifié par `nomOriginal` plutôt qu'un id (le
  catalogue mock n'en a pas encore, cf.
  [[dashboard-mock-data-pending-laravel-api]]), pour retrouver la bonne
  ligne même si l'ordre du tableau a changé entre-temps.
*/
let editionAOuvrir: { nomOriginal: string; initial: Partial<NouveauProduit> } | null = null;
let editionEnAttente: { nomOriginal: string; produit: NouveauProduit; statut: "brouillon" | "publie" } | null = null;

export function ouvrirEditionProduit(nomOriginal: string, initial: Partial<NouveauProduit>) {
  editionAOuvrir = { nomOriginal, initial };
}

export function lireEtViderEditionAOuvrir() {
  const valeur = editionAOuvrir;
  editionAOuvrir = null;
  return valeur;
}

export function definirEditionEnAttente(nomOriginal: string, produit: NouveauProduit, statut: "brouillon" | "publie") {
  editionEnAttente = { nomOriginal, produit, statut };
}

export function lireEtViderEditionEnAttente() {
  const valeur = editionEnAttente;
  editionEnAttente = null;
  return valeur;
}

export function ajouterCategorieEnAttente(categorie: Categorie) {
  categoriesEnAttente = [...categoriesEnAttente, categorie];
}

/** Lit les catégories créées depuis le formulaire puis vide le pont. */
export function lireEtViderCategoriesEnAttente() {
  const valeur = categoriesEnAttente;
  categoriesEnAttente = [];
  return valeur;
}
