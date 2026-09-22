import type { EditeurState } from "../app/components/dashboard-reglages/personnaliser/types";

/*
  Formes de données partagées entre le dashboard (écriture) et le site
  public /boutique/[slug] (lecture) — séparées de boutique-store.ts (qui
  importe "fs") pour rester importables depuis des composants client
  (CartProvider, pages publiques "use client") sans tirer un module Node
  dans le bundle navigateur.
*/

export type BoutiqueIdentite = {
  nom: string;
  slug: string;
  secteur: string;
  presentation: string;
  logo: string | null;
  ouverte: boolean;
};

export type ProduitPublic = {
  id: string;
  slug: string;
  nom: string;
  nomEn: string;
  prix: number;
  prixNormal?: number;
  categorieId: string | null;
  images: string[];
  stock: number;
  note: number | null;
  avisCount: number;
  description?: string;
};

export type CategoriePublique = { id: string; nom: string; nomEn: string };

/** Avis client réel — pas de modèle de données avant cette tâche (la
 *  section "avis" de BoutiquePreview.tsx tourne sur des données de
 *  démonstration, AVIS_APERCU). Forme minimale alignée sur ce que la section
 *  publique affiche réellement (cf. SectionAvis.tsx) : un tableau vide par
 *  défaut (aucun avis inventé) plutôt qu'une section absente du site public. */
export type AvisClient = {
  id: string;
  nom: string;
  note: number; // 1-5
  texte: string;
  date: string; // ISO, pour affichage relatif
  verifie: boolean;
  photo?: string | null;
  reponse?: string | null;
  produitId?: string | null;
};

export type BoutiqueDonnees = {
  identite: BoutiqueIdentite;
  editeur: EditeurState;
  produits: ProduitPublic[];
  categories: CategoriePublique[];
  avis: AvisClient[];
  misAJour: number;
};

/** Même transformation partout (dashboard, store fichier, route API) : pas
 *  d'accents, minuscules, espaces/ponctuation → tiret, jamais de tiret en
 *  bord. */
export function slugifier(nom: string): string {
  const brut = nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return brut || "boutique";
}
