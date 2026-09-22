import { DROP_PRODUITS } from "../app/components/dashboard-produits/dropCatalogue";
import type { AvisClient, CategoriePublique, ProduitPublic } from "./boutique-types";

/*
  Fixtures de démonstration pour l'aperçu éditeur ("Personnaliser ma
  boutique") — remplacent PRODUIT_APERCU/PRODUITS_GRILLE_APERCU/
  CATEGORIES_APERCU/AVIS_APERCU/AVIS_DISTRIBUTION_APERCU (ex-personnaliser/
  types.ts). Contrairement à ces anciennes constantes, celles-ci sont
  typées littéralement ProduitPublic[]/CategoriePublique[]/AvisClient[] —
  mêmes champs que les vraies données d'une boutique — pour que
  BoutiquePreview.tsx alimente les MÊMES composants (app/components/
  boutique-publique/*) que le site public, avec ces fixtures comme repli
  uniquement quand la boutique n'a pas encore de vrai produit/catégorie/avis
  enregistré (cf. lib/boutique-store.ts, PersonnaliserBoutique.tsx).

  Produits issus de dropCatalogue.ts (mêmes données que "Ajouter au
  catalogue" côté dashboard-produits) plutôt qu'inventés : catégorie "Beauté
  et soins", seule peuplée à ce jour. `images` reste vide comme sur
  DropProduit — pas de fausse photo, cf. [[dashboard-mock-data-pending-laravel-api]].
*/

const PRODUITS_BEAUTE = DROP_PRODUITS.filter((p) => p.categorie === "Beauté et soins");

const NOTES_DEMO: Record<string, { note: number; avisCount: number }> = {
  "serum-eclat-30ml": { note: 4.7, avisCount: 126 },
  "masque-argile": { note: 4.5, avisCount: 64 },
  "huile-de-ricin": { note: 4.8, avisCount: 212 },
  "beurre-de-karite": { note: 4.9, avisCount: 98 },
  "lotion-tonique": { note: 4.3, avisCount: 74 },
  "coffret-soin-nuit": { note: 4.6, avisCount: 41 },
};

const IMAGES_DEMO: Record<string, string[]> = {
  "serum-eclat-30ml": ["/images/serum1.avif", "/images/serum2.jpg"],
  "masque-argile": ["/images/1.jpg"],
  "huile-de-ricin": ["/images/4.jpg"],
  "beurre-de-karite": ["/images/5.png"],
  "lotion-tonique": ["/images/7.jpg"],
  "coffret-soin-nuit": ["/images/2.jpg"],
  "gel-nettoyant": ["/images/8.webp"],
  "creme-de-jour": ["/images/3.jpg"],
};

export const PRODUITS_DEMO: ProduitPublic[] = PRODUITS_BEAUTE.slice(0, 6).map((p) => ({
  id: `demo-${p.slug}`,
  slug: p.slug,
  nom: p.nom,
  nomEn: p.nomEn ?? p.nom,
  prix: p.prixVenteActuel ?? p.prixConseille ?? 0,
  prixNormal: p.prixConseille ?? p.prixVenteActuel ?? undefined,
  categorieId: null,
  images: (p.images && p.images.length > 0) ? p.images : (IMAGES_DEMO[p.slug] ?? ["/images/serum1.avif"]),
  stock: 120,
  note: NOTES_DEMO[p.slug]?.note ?? 4.5,
  avisCount: NOTES_DEMO[p.slug]?.avisCount ?? 0,
  description: p.description,
}));

/* Produit vedette de l'aperçu "commande" — le sérum, comme avant
   (PRODUIT_APERCU), mais désormais juste le premier élément de
   PRODUITS_DEMO plutôt qu'une forme de données à part : même nom de champs
   que ProduitPublic partout, aucune traduction séparée à maintenir. */
export const PRODUIT_DEMO: ProduitPublic = PRODUITS_DEMO[0];

export const CATEGORIES_DEMO: CategoriePublique[] = [
  { id: "demo-soins-visage", nom: "Soins visage", nomEn: "Face care", image: "/images/serum1.avif" },
  { id: "demo-cremes", nom: "Crèmes", nomEn: "Creams", image: "/images/5.png" },
  { id: "demo-lotions", nom: "Lotions", nomEn: "Lotions", image: "/images/7.jpg" },
  { id: "demo-savons", nom: "Savons", nomEn: "Soaps", image: "/images/1.jpg" },
  { id: "demo-coffrets", nom: "Coffrets", nomEn: "Gift sets", image: "/images/2.jpg" },
  { id: "demo-huiles", nom: "Huiles", nomEn: "Oils", image: "/images/4.jpg" },
];

type AvisDemoSource = {
  id: string;
  nom: string;
  note: number;
  texte: string;
  joursEcoules: number;
  verifie: boolean;
  reponse?: string;
  produitSlug?: string;
};

const AVIS_DEMO_SOURCE: AvisDemoSource[] = [
  {
    id: "demo-avis-1",
    nom: "Aya K.",
    note: 5,
    texte: "Texture légère, ma peau est plus lumineuse après deux semaines.",
    joursEcoules: 12,
    verifie: true,
    produitSlug: "serum-eclat-30ml",
  },
  {
    id: "demo-avis-2",
    nom: "Fatou B.",
    note: 5,
    texte: "Le masque à l'argile est doux, il ne tire pas la peau. J'en ai repris deux.",
    joursEcoules: 7,
    verifie: true,
    produitSlug: "masque-argile",
  },
  {
    id: "demo-avis-3",
    nom: "Mariam D.",
    note: 4,
    texte: "Reçu très vite et bien emballé. Je recommande.",
    joursEcoules: 10,
    verifie: true,
    reponse: "Merci Mariam, à très bientôt !",
    produitSlug: "beurre-de-karite",
  },
];

/* Fonction plutôt que constante figée : `date` est calculée par rapport à
   Date.now() à l'appel, pour que "il y a X jours" reste correct quelle que
   soit la durée de la session d'édition plutôt que de figer une date au
   chargement du module. `produitId` se résout contre PRODUITS_DEMO (via le
   slug du catalogue drop) plutôt que d'embarquer un objet produit à part —
   même mécanique que le vrai AvisClient.produitId, qui référence toujours
   un id de PRODUITS_DEMO/produits réels plutôt qu'un doublon de nom. */
export function fabriquerAvisDemo(): AvisClient[] {
  return AVIS_DEMO_SOURCE.map((a) => ({
    id: a.id,
    nom: a.nom,
    note: a.note,
    texte: a.texte,
    date: new Date(Date.now() - a.joursEcoules * 86400000).toISOString(),
    verifie: a.verifie,
    photo: null,
    reponse: a.reponse ?? null,
    produitId: a.produitSlug ? (PRODUITS_DEMO.find((p) => p.slug === a.produitSlug)?.id ?? null) : null,
  }));
}
