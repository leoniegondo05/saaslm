/*
  Types du formulaire "Ajouter un produit" (Écran 08/09/10 des maquettes
  fournies par l'utilisateur). Ils décrivent la forme que prendra la
  requête envoyée à l'API Laravel quand elle existera (cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]]) : chaque composant qui a
  besoin de ces données les lit ici plutôt que de redéfinir sa propre
  forme, pour que le futur branchement API touche un seul endroit
  (AjouterProduitModal.tsx) au lieu de tous les sous-composants.
*/

export type TypeAttribut = "couleur" | "texte";

export type ValeurAttribut = {
  id: string;
  label: string;
  /** Renseigné uniquement pour un attribut de type "couleur" (ex. "#E8B4C8"). */
  couleurHex?: string;
};

export type Attribut = {
  id: string;
  nom: string;
  type: TypeAttribut;
  valeurs: ValeurAttribut[];
};

export type Combinaison = {
  id: string;
  /** Clé technique (valeurs jointes) — sert à retrouver la combinaison quand les attributs changent. */
  cle: string;
  /** Id de la valeur choisie, par id d'attribut. */
  valeurs: Record<string, string>;
  reference: string;
  prixAchat: number | null;
  prixVente: number;
  quantite: number;
  active: boolean;
  /** Une seule combinaison à la fois : sert de base au calcul "Ce qui vous reste" (voir MargeCard.tsx). */
  misEnAvant: boolean;
};

export type Categorie = {
  id: string;
  nom: string;
  nomEn: string;
  /** Data URL (FileReader), même mécanique que le logo boutique (cf.
   *  MaBoutique.tsx) — obligatoire : une catégorie sans image ne peut plus
   *  être créée depuis le dashboard. */
  image: string;
};

/** Charge complète du formulaire — ce qui partira vers l'API à la publication. */
export type NouveauProduit = {
  nom: string;
  categorieId: string | null;
  description: string;
  prixAchat: number | null;
  prixVente: number;
  poidsGrammes: number | null;
  video: File | null;
  photos: File[];
  attributs: Attribut[];
  combinaisons: Combinaison[];
};
