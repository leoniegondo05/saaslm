import type { DepotValide } from "./DeposerStockModal";

/*
  Pont entre l'écran "Déposer un stock" en page à part (mobile/tablette,
  voir app/dashboard/produits/deposer/page.tsx) et ProduitsCatalogue.tsx qui
  tient la liste des produits — même recette que pendingProduitStore.ts
  (ajouter-produit/) pour la même raison : le formulaire vit sur une autre
  route, il ne peut pas écrire directement dans le state de la page Produits.

  Variable de module, pas sessionStorage : survit à un router.push (le
  module JS ne se recharge pas) mais repart à zéro sur une vraie
  actualisation — voulu, cf. pendingProduitStore.ts pour le détail du
  raisonnement. Purement temporaire tant que l'API Laravel n'expose pas de
  endpoint de dépôt, cf. [[dashboard-mock-data-pending-laravel-api]].
*/

let depotEnAttente: DepotValide | null = null;

export function definirDepotEnAttente(depot: DepotValide) {
  depotEnAttente = depot;
}

/** Lit le dépôt en attente puis vide le pont — à appeler une seule fois, au montage de ProduitsCatalogue. */
export function lireEtViderDepotEnAttente() {
  const valeur = depotEnAttente;
  depotEnAttente = null;
  return valeur;
}
