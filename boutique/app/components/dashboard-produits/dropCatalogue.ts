/*
  Source unique du catalogue drop (Écran 05 "Catalogue disponible en drop" +
  Écran 06 "Fiche d'un produit drop") — un seul tableau partagé par les deux
  écrans pour ne jamais désynchroniser liste et fiche.

  Seule la catégorie "Beauté et soins" est peuplée de vrais produits, cf.
  maquette ; les autres catégories n'ont qu'un compteur en attendant leur
  propre catalogue. Chiffres statiques, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].
*/

export type DropProduit = {
  slug: string;
  nom: string;
  categorie: string;
  source: "L" | "P" | "AVENIR"; // Drop LM · Drop partenaire · à venir (pas encore de prix)
  prixDrop: number | null; // F
  prixConseille: number | null; // F
  arriveeLe?: string; // renseigné seulement si source === "AVENIR"
  description?: string;
  conditionnement?: string;
  contenance?: string;
  poidsEmballe?: string;
  venduParBoutiques?: number;
  ventesReseau30j?: number;
  vosVentes30j?: number;
  tauxLitigePct?: number;
  prixBasReseau?: number;
  prixMoyenReseau?: number;
  prixHautReseau?: number;
  /** Unités disponibles chez le partenaire, affiché en tag sur la fiche (Écran 06). */
  unitesDisponibles?: number;
  /** Prix auquel le partenaire revend réellement ce produit — distinct de
   *  prixConseille (juste une recommandation) : sert de valeur de départ au
   *  simulateur "Fixer mon prix". Absent -> le simulateur part du conseillé. */
  prixVenteActuel?: number;
  /** Photos produit pour le carousel de la fiche (Écran 06). Aucune pour
   *  l'instant, cf. [[dashboard-mock-data-pending-laravel-api]]. */
  images?: string[];
};

export const CATEGORIES: { nom: string; count: number; nouveautes?: number }[] = [
  { nom: "Beauté et soins", count: 9, nouveautes: 4 },
  { nom: "Électronique", count: 24 },
  { nom: "Maison et cuisine", count: 16 },
  { nom: "Mode et accessoires", count: 31 },
  { nom: "Enfants", count: 9 },
  { nom: "Sport", count: 7 },
  { nom: "Téléphonie", count: 12 },
  { nom: "Bébé et puériculture", count: 11 },
];

export const DROP_PRODUITS: DropProduit[] = [
  {
    slug: "serum-eclat-30ml",
    nom: "Sérum éclat 30 ml",
    categorie: "Beauté et soins",
    source: "L",
    prixDrop: 6200,
    prixConseille: 14000,
    description:
      "Sérum concentré pour le visage en flacon pompe de 30 ml. Texture légère, application matin et soir sur peau propre. Se conserve douze mois après ouverture. Fabriqué et conditionné localement.",
    conditionnement: "Flacon pompe verre",
    contenance: "30 ml",
    poidsEmballe: "180 g",
    venduParBoutiques: 42,
    ventesReseau30j: 1240,
    vosVentes30j: 37,
    tauxLitigePct: 0.8,
    prixBasReseau: 9500,
    prixMoyenReseau: 13400,
    prixHautReseau: 17000,
    unitesDisponibles: 340,
    prixVenteActuel: 12000,
  },
  {
    slug: "masque-argile",
    nom: "Masque argile",
    categorie: "Beauté et soins",
    source: "P",
    prixDrop: 3400,
    prixConseille: 8500,
    description: "Masque à l'argile purifiant, pot 150 g. Application hebdomadaire, rinçage à l'eau tiède.",
    conditionnement: "Pot",
    contenance: "150 g",
    venduParBoutiques: 26,
    ventesReseau30j: 410,
    vosVentes30j: 6,
    tauxLitigePct: 0.3,
    prixBasReseau: 6500,
    prixMoyenReseau: 8100,
    prixHautReseau: 9800,
  },
  {
    slug: "huile-de-ricin",
    nom: "Huile de ricin",
    categorie: "Beauté et soins",
    source: "L",
    prixDrop: 2900,
    prixConseille: 7500,
    description: "Huile de ricin pure 100 ml, flacon compte-gouttes. Cheveux, cils et peau.",
    conditionnement: "Flacon compte-gouttes",
    contenance: "100 ml",
    venduParBoutiques: 51,
    ventesReseau30j: 980,
    vosVentes30j: 58,
    tauxLitigePct: 0.5,
    prixBasReseau: 5800,
    prixMoyenReseau: 7100,
    prixHautReseau: 9200,
  },
  {
    slug: "beurre-de-karite",
    nom: "Beurre de karité 200 g",
    categorie: "Beauté et soins",
    source: "P",
    prixDrop: 4100,
    prixConseille: 9000,
    description: "Beurre de karité brut 200 g, non raffiné. Corps et cheveux.",
    conditionnement: "Pot",
    contenance: "200 g",
    venduParBoutiques: 38,
    ventesReseau30j: 720,
    vosVentes30j: 73,
    tauxLitigePct: 0.2,
    prixBasReseau: 7200,
    prixMoyenReseau: 8600,
    prixHautReseau: 10500,
  },
  {
    slug: "lotion-tonique",
    nom: "Lotion tonique",
    categorie: "Beauté et soins",
    source: "L",
    prixDrop: 3800,
    prixConseille: 8900,
    description: "Lotion tonique visage, flacon 150 ml, sans alcool.",
    conditionnement: "Flacon",
    contenance: "150 ml",
    venduParBoutiques: 33,
    ventesReseau30j: 540,
    vosVentes30j: 9,
    tauxLitigePct: 0.6,
    prixBasReseau: 7000,
    prixMoyenReseau: 8500,
    prixHautReseau: 10200,
  },
  {
    slug: "coffret-soin-nuit",
    nom: "Coffret soin nuit",
    categorie: "Beauté et soins",
    source: "AVENIR",
    prixDrop: null,
    prixConseille: null,
    arriveeLe: "12 septembre",
  },
  {
    slug: "gel-nettoyant",
    nom: "Gel nettoyant",
    categorie: "Beauté et soins",
    source: "P",
    prixDrop: 2200,
    prixConseille: 6000,
    description: "Gel nettoyant visage, flacon pompe 200 ml, tous types de peau.",
    conditionnement: "Flacon pompe",
    contenance: "200 ml",
    venduParBoutiques: 19,
    ventesReseau30j: 260,
    vosVentes30j: 4,
    tauxLitigePct: 0.1,
    prixBasReseau: 4600,
    prixMoyenReseau: 5700,
    prixHautReseau: 7000,
  },
  {
    slug: "creme-de-jour",
    nom: "Crème de jour",
    categorie: "Beauté et soins",
    source: "L",
    prixDrop: 5600,
    prixConseille: 12500,
    description: "Crème de jour hydratante, pot 50 ml, protection légère.",
    conditionnement: "Pot",
    contenance: "50 ml",
    venduParBoutiques: 29,
    ventesReseau30j: 480,
    vosVentes30j: 14,
    tauxLitigePct: 0.4,
    prixBasReseau: 9800,
    prixMoyenReseau: 12000,
    prixHautReseau: 14600,
  },
  {
    slug: "savon-noir",
    nom: "Savon noir",
    categorie: "Beauté et soins",
    source: "P",
    prixDrop: 1400,
    prixConseille: 3900,
    description: "Savon noir traditionnel, pot 300 g, gommage et nettoyage.",
    conditionnement: "Pot",
    contenance: "300 g",
    venduParBoutiques: 22,
    ventesReseau30j: 350,
    vosVentes30j: 11,
    tauxLitigePct: 0.2,
    prixBasReseau: 2800,
    prixMoyenReseau: 3400,
    prixHautReseau: 4200,
  },
];

export function getDropProduit(slug: string): DropProduit | undefined {
  return DROP_PRODUITS.find((p) => p.slug === slug);
}
