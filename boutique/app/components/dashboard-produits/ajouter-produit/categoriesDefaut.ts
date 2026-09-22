import type { Categorie } from "./types";

/*
  Catégories de départ d'une boutique — mock tant que l'API Laravel
  n'expose pas ce endpoint, cf. [[dashboard-mock-data-pending-laravel-api]].
  Partagé entre AjouterProduitModal.tsx (choix de catégorie sur un produit)
  et CreerCategorieModal.tsx (gestion depuis le bouton "Ajouter une
  catégorie" de la page Produits) pour que les deux listent les mêmes
  catégories plutôt que deux copies qui divergent.
*/
export const CATEGORIES_DEFAUT: Categorie[] = [
  { id: "mode-femme", nom: "Mode femme", nomEn: "Women's fashion", image: "/images/1.jpg" },
  { id: "chaussures", nom: "Chaussures", nomEn: "Shoes", image: "/images/6.png" },
  { id: "accessoires", nom: "Accessoires", nomEn: "Accessories", image: "/images/2.jpg" },
  { id: "beaute", nom: "Beauté", nomEn: "Beauty", image: "/images/serum1.avif" },
  { id: "maison", nom: "Maison", nomEn: "Home", image: "/images/7.jpg" },
];
