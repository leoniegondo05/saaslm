/*
  Types et données par défaut de l'éditeur "Personnaliser ma boutique"
  (Réglages · Ma boutique → bouton en bas de fiche). Regroupés ici pour que
  PersonnaliserBoutique.tsx (état + barre d'outils), SectionsPanel.tsx
  (liste des sections + onglet Style) et BoutiquePreview.tsx (aperçu en
  direct) partagent la même forme sans se réimporter en boucle.

  Le produit d'aperçu reprend tel quel "Sérum éclat 30 ml" du catalogue drop
  (dropCatalogue.ts : prixVenteActuel 12000, prixConseille 14000,
  unitesDisponibles 340) plutôt qu'un produit inventé — même boutique
  "Awa Beauté" que MaBoutique.tsx. `images` reste vide comme dans la vraie
  fiche : aucune photo n'a encore été déposée pour ce produit (pas un mock
  provisoire à combler, un vrai état vide, cf. MediaProduit.tsx "Aucune
  photo") donc l'aperçu montre un espace réservé plutôt qu'une fausse photo.
  Même logique pour PRODUITS_GRILLE_APERCU/CATEGORIES_APERCU plus bas.

  Deux pages simulées (maquette fournie) : "accueil" et "commande" (celle
  déjà décrite ci-dessus). Une seule liste de sections plutôt que deux
  objets parallèles — chaque SectionDef porte `page` pour dire à quelle(s)
  page(s) elle appartient ; bandeau/en-tête/pied de page et avis/faq sont
  communs aux deux (cf. `S.order.home`/`S.order.product` de la maquette, qui
  partagent déjà 'ann'/'header'/'footer' et incluent tous deux 'reviews'/
  'faq'). Ça évite de dupliquer sections/hid/x dans EditeurState pour une
  différence qui n'est, au fond, qu'un filtre d'affichage.
*/

import { DROP_PRODUITS } from "../../dashboard-produits/dropCatalogue";

export type SectionGroupe = "Haut de page" | "Produit" | "Commande" | "Contenu" | "Sections personnalisées" | "Bas de page" | "Par-dessus la page";

export type PageId = "accueil" | "commande";

export type SectionId =
  | "bandeau"
  | "entete"
  | "chemin-navigation"
  | "grande-image"
  | "confiance"
  | "categories"
  | "promo"
  | "grille"
  | "galerie"
  | "infos"
  | "offres"
  | "formulaire"
  | "paiement"
  | "onglets-details"
  | "avis"
  | "faq"
  | "engagements"
  | "produits-lies"
  | "vendu-par"
  | "pied-de-page"
  | "bouton-commande-fixe"
  // Sections de bibliothèque (bouton "Ajouter une section" en bas de
  // SectionsPanel.tsx) : absentes de SECTIONS_ETAT_DEFAUT (cf. `libre` sur
  // leur SectionDef) tant qu'on ne les a pas ajoutées depuis la fenêtre
  // AjouterSectionModal.tsx ; "les-deux" comme bandeau/avis une fois
  // ajoutées, cf. commentaire de page ci-dessous.
  | "lib-texte"
  | "lib-image-texte"
  | "lib-avant-apres"
  | "lib-mode-emploi"
  | "lib-composition"
  | "lib-tableau-comparatif"
  | "lib-garanties"
  | "lib-video"
  | "lib-photos-clients"
  | "lib-compte-rebours"
  | "lib-bandeau-defilant"
  | "lib-offres"
  | "lib-produits-vus"
  | "lib-galerie"
  | "lib-contact"
  | "lib-fenetre-promo"
  | "lib-colonnes-libres"
  | "lib-espace";

export type SectionDef = {
  id: SectionId;
  label: string;
  labelEn: string;
  groupe: SectionGroupe;
  groupeEn: string;
  /** Page(s) où la section apparaît dans l'aperçu et dans la liste de
   *  gauche ; "les-deux" pour le chrome partagé (bandeau, en-tête, pied de
   *  page) et pour avis/faq, présents sur les deux pages dans la maquette. */
  page: PageId | "les-deux";
  /** Ne se masque pas (cf. section "Les règles" de la maquette) : la
   *  case à cocher de visibilité est remplacée par un cadenas. */
  verrouillee?: boolean;
  /** Sous-titre affiché sous le nom de la section dans ReglagesSection.tsx (facultatif). */
  description?: string;
  descriptionEn?: string;
  /** Section de bibliothèque : ne fait pas partie de SECTIONS_ETAT_DEFAUT
   *  (absente de la page tant qu'on ne l'a pas ajoutée) et apparaît dans
   *  la fenêtre "Ajouter une section" plutôt que directement dans la liste. */
  libre?: boolean;
  /** Tracé d'icône (viewBox 24×24) montré devant le nom de la section dans
   *  SectionsPanel.tsx et, pour les sections `libre`, dans la fenêtre
   *  "Ajouter une section" — cf. AjouterSectionModal.tsx. */
  icone?: string;
};

// Ordre unique qui, une fois filtré par page, reproduit exactement l'ordre
// de chaque page de la maquette : filtré sur "commande" (+ "les-deux") on
// retombe sur l'ordre déjà en place (inchangé) ; filtré sur "accueil" (+
// "les-deux") on retombe sur ann/header/hero/trust/cats/promo/best/
// reviews/faq/eng/footer de `defaults().order.home`.
export const SECTIONS_DEFAUT: SectionDef[] = [
  { id: "bandeau", label: "Bandeau d'annonce", labelEn: "Announcement bar", groupe: "Haut de page", groupeEn: "Top of page", page: "les-deux", icone: "M3 10v4h4l6 4V6l-6 4H3zM16 9a3 3 0 0 1 0 6" },
  { id: "entete", label: "En-tête", labelEn: "Header", groupe: "Haut de page", groupeEn: "Top of page", verrouillee: true, page: "les-deux", icone: "M4 5h16v14H4zM4 9h16" },
  { id: "chemin-navigation", label: "Chemin de navigation", labelEn: "Breadcrumb", groupe: "Haut de page", groupeEn: "Top of page", page: "commande", icone: "M3 12h2l2-4 3 8 3-8 2 4h6" },
  { id: "grande-image", label: "Grande image", labelEn: "Hero image", groupe: "Haut de page", groupeEn: "Top of page", page: "accueil", icone: "M4 5.5h16v13H4zM4 15l4.5-4.5L12 14l3-3 5 5.5M9 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { id: "categories", label: "Catégories", labelEn: "Categories", groupe: "Contenu", groupeEn: "Content", page: "accueil", icone: "M4 4.5h7v7H4zM13 4.5h7v7h-7zM4 13.5h7v7H4zM13 13.5h7v7h-7z" },
  { id: "confiance", label: "Barre de confiance", labelEn: "Trust bar", groupe: "Contenu", groupeEn: "Content", page: "accueil", description: "Atouts de la boutique", descriptionEn: "Shop's trust badges", icone: "M12 3.5 19 6v6c0 5-3 8-7 9-4-1-7-4-7-9V6z" },
  { id: "promo", label: "Bannière d'offre", labelEn: "Offer banner", groupe: "Contenu", groupeEn: "Content", page: "accueil", description: "Offre du moment", descriptionEn: "Current offer", icone: "M20 12 12 20 4 12V4h8zM7.5 7.5h.01" },
  { id: "grille", label: "Grille de produits", labelEn: "Product grid", groupe: "Contenu", groupeEn: "Content", page: "accueil", icone: "M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" },
  { id: "galerie", label: "Galerie", labelEn: "Gallery", groupe: "Produit", groupeEn: "Product", verrouillee: true, page: "commande", description: "Vidéo puis photos", descriptionEn: "Video then photos", icone: "M4 5.5h16v13H4zM10 9.5l5 2.5-5 2.5z" },
  { id: "infos", label: "Informations produit", labelEn: "Product information", groupe: "Produit", groupeEn: "Product", verrouillee: true, page: "commande", description: "Nom, prix, variantes, bouton", descriptionEn: "Name, price, variants, button", icone: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8h.01M11 11h1v5h1" },
  { id: "offres", label: "Offres par quantité", labelEn: "Quantity offers", groupe: "Produit", groupeEn: "Product", page: "commande", icone: "M19 5 5 19M7.5 7.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM16.5 20.1a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" },
  { id: "paiement", label: "Paiement et livraison", labelEn: "Payment and delivery", groupe: "Commande", groupeEn: "Order", verrouillee: true, page: "commande", icone: "M3 6.5h18v11H3zM3 10h18" },
  { id: "formulaire", label: "Vos informations", labelEn: "Your information", groupe: "Commande", groupeEn: "Order", verrouillee: true, page: "commande", description: "Champs du client", descriptionEn: "Customer fields", icone: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 10a2.4 2.4 0 1 0 0-4.8M2.5 19c0-3 2.7-5.4 6-5.4s6 2.4 6 5.4M15 13.8c2.3.5 4 2.5 4 5.2" },
  { id: "onglets-details", label: "Onglets détails", labelEn: "Detail tabs", groupe: "Produit", groupeEn: "Product", page: "commande", description: "Description, caractéristiques, livraison", descriptionEn: "Description, specs, delivery", icone: "M4 6h7v3H4zM13 6h7v3h-7zM4 11h16v7H4z" },
  { id: "avis", label: "Avis clients", labelEn: "Customer reviews", groupe: "Contenu", groupeEn: "Content", page: "les-deux", description: "Notes et commentaires", descriptionEn: "Ratings and comments", icone: "M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 6-5.2-2.8-5.2 2.8 1-6-4.3-4.2 5.9-.8z" },
  { id: "faq", label: "Questions fréquentes", labelEn: "Frequently asked questions", groupe: "Contenu", groupeEn: "Content", page: "les-deux", icone: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.4v.3M12 16.5h.01" },
  { id: "engagements", label: "Engagements", labelEn: "Commitments", groupe: "Contenu", groupeEn: "Content", page: "accueil", description: "Rangée d'assurances", descriptionEn: "Row of trust badges", icone: "M12 3.5 19 6v6c0 5-3 8-7 9-4-1-7-4-7-9V6zM9 12l2 2 4-4" },
  { id: "produits-lies", label: "Vous aimerez aussi", labelEn: "You may also like", groupe: "Produit", groupeEn: "Product", page: "commande", description: "Produits similaires en fin de page", descriptionEn: "Related products near the bottom", icone: "M12 8.3c-1.6-2-4.6-2-5.8-.2-1.2 1.8-.4 4 1.4 5.7L12 17l4.4-3.2c1.8-1.7 2.6-3.9 1.4-5.7-1.2-1.8-4.2-1.8-5.8.2ZM4 20h16" },
  { id: "vendu-par", label: "Vendu par", labelEn: "Sold by", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true, page: "commande", description: "Quatre informations toujours visibles", descriptionEn: "Four details always visible", icone: "M4 9 5 4h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6" },
  { id: "pied-de-page", label: "Pied de page", labelEn: "Footer", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true, page: "les-deux", description: "Bas de toutes les pages", descriptionEn: "Bottom of every page", icone: "M4 5h16v14H4zM4 15h16" },
  { id: "bouton-commande-fixe", label: "Bouton de commande fixe", labelEn: "Fixed order button", groupe: "Par-dessus la page", groupeEn: "Over the page", verrouillee: true, page: "commande", description: "Sur téléphone seulement", descriptionEn: "Phone only", icone: "M4 4h2l1 2h13l-1.5 8h-11L6 6M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" },

  // Bibliothèque de la fenêtre "Ajouter une section" (cf. AjouterSectionModal.tsx) —
  // `libre: true` : absentes de SECTIONS_ETAT_DEFAUT ci-dessous, "les-deux" une fois
  // ajoutées (même partage de position que bandeau/avis, cf. commentaire plus haut).
  { id: "lib-texte", label: "Texte", labelEn: "Text", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M6 4.5h12M12 4.5v15" },
  { id: "lib-image-texte", label: "Image et texte", labelEn: "Image and text", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 5.5h7v7H4zM13 7h7M13 10h7M13 13h7M4 17.5h16" },
  { id: "lib-avant-apres", label: "Avant / après", labelEn: "Before / after", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 5h7v14H4zM13 5h7v14h-7zM12 4v16" },
  { id: "lib-mode-emploi", label: "Mode d'emploi", labelEn: "How to use", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M6 6.5h2M11 6.5h7M6 12h2M11 12h7M6 17.5h2M11 17.5h7" },
  { id: "lib-composition", label: "Composition", labelEn: "Ingredients", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { id: "lib-tableau-comparatif", label: "Tableau comparatif", labelEn: "Comparison table", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 5h16v14H4zM4 10h16M4 15h16M10 5v14M16 5v14" },
  { id: "lib-garanties", label: "Garanties", labelEn: "Guarantees", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M12 3.5 19 6v6c0 5-3 8-7 9-4-1-7-4-7-9V6z" },
  { id: "lib-video", label: "Vidéo en plus", labelEn: "Extra video", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 5.5h16v13H4zM10 9.5l5 2.5-5 2.5z" },
  { id: "lib-photos-clients", label: "Photos des clients", labelEn: "Customer photos", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M8.5 12a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4zM16 12a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zM3.5 19c0-2.8 2.2-5 5-5s5 2.2 5 5M12.5 19c0-2.3 1.9-4.2 4.2-4.2s4.2 1.9 4.2 4.2" },
  { id: "lib-compte-rebours", label: "Compte à rebours", labelEn: "Countdown", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
  { id: "lib-bandeau-defilant", label: "Bandeau défilant", labelEn: "Scrolling banner", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M3 8h18M3 12.5h12M3 17h18" },
  { id: "lib-offres", label: "Offres par quantité", labelEn: "Quantity offers", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M19 5 5 19M7.5 7.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM16.5 20.1a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" },
  { id: "lib-produits-vus", label: "Produits vus récemment", labelEn: "Recently viewed products", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 8.5 12 4l8 4.5v8L12 21l-8-4.5zM12 21v-8.5M4 8.5 12 13l8-4.5" },
  { id: "lib-galerie", label: "Galerie de photos", labelEn: "Photo gallery", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 4.5h12v12H4zM8 16.5h12v-12" },
  { id: "lib-contact", label: "Contact", labelEn: "Contact", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 6h16v12H4zM4 6l8 7 8-7" },
  { id: "lib-fenetre-promo", label: "Fenêtre promotionnelle", labelEn: "Promotional popup", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4.5 6h15v13h-15zM4.5 10h15M9 6v4" },
  { id: "lib-colonnes-libres", label: "Colonnes libres", labelEn: "Free columns", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M4 4.5h5v15H4zM9.5 4.5h5v15h-5zM15 4.5h5v15h-5z" },
  { id: "lib-espace", label: "Espace", labelEn: "Spacer", groupe: "Sections personnalisées", groupeEn: "Custom sections", page: "les-deux", libre: true, icone: "M12 3.5v17M8 7.5l4-4 4 4M8 16.5l4 4 4-4" },
];

/** Réglages génériques d'une section (groupe "Pour cette section" en bas de
 *  chaque panneau, cf. ReglagesSection.tsx) — communs à toutes les sections
 *  plutôt que dupliqués dans chaque XxxState, à la différence des réglages
 *  propres à une section (contenu, disposition...). */
export type SectionState = {
  id: SectionId;
  visible: boolean;
  largeur: "page" | "pleine";
  marges: "petites" | "moyennes" | "grandes";
  couleurs: "claires" | "douces" | "nuit";
  visibleTelephone: boolean;
  visibleOrdinateur: boolean;
};

// Les sections `libre` (bibliothèque "Ajouter une section") en sont exclues :
// elles n'existent dans `state.sections` qu'une fois ajoutées, cf. ajouterSection.
export const SECTIONS_ETAT_DEFAUT: SectionState[] = SECTIONS_DEFAUT.filter((s) => !s.libre).map((s) => ({
  id: s.id,
  visible: true,
  largeur: "page",
  marges: "moyennes",
  couleurs: "claires",
  visibleTelephone: true,
  visibleOrdinateur: true,
}));

/** Sections de la bibliothèque pas encore présentes dans `sections` — nourrit
 *  la grille d'AjouterSectionModal.tsx (une section `libre` disparaît de la
 *  grille une fois ajoutée, cf. `ajouterSection`). */
export function sectionsDisponibles(sections: SectionState[]): SectionDef[] {
  const presentes = new Set(sections.map((s) => s.id));
  return SECTIONS_DEFAUT.filter((d) => d.libre && !presentes.has(d.id));
}

/** `true` si la section appartient à la page donnée (cf. `SectionDef.page`
 *  ci-dessus) — partagé par SectionsPanel.tsx (liste de gauche) et
 *  ReglagesSection.tsx (boutons Monter/Descendre/Masquer du panneau de
 *  droite) pour ne pas dupliquer cette règle. */
export function appartientPage(id: SectionId, page: PageId): boolean {
  const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
  return def.page === "les-deux" || def.page === page;
}

/** Échange la section `id` avec sa voisine (au sein de la page active
 *  seulement, cf. `appartientPage`) dans le sens `sens`. Renvoie le tableau
 *  inchangé si le déplacement est hors limites. */
export function deplacerSection(sections: SectionState[], id: SectionId, page: PageId, sens: -1 | 1): SectionState[] {
  const visibles = sections.filter((sec) => appartientPage(sec.id, page));
  const vi = visibles.findIndex((sec) => sec.id === id);
  const vj = vi + sens;
  if (vi < 0 || vj < 0 || vj >= visibles.length) return sections;
  const idA = visibles[vi].id;
  const idB = visibles[vj].id;
  const iA = sections.findIndex((sec) => sec.id === idA);
  const iB = sections.findIndex((sec) => sec.id === idB);
  const copie = [...sections];
  [copie[iA], copie[iB]] = [copie[iB], copie[iA]];
  return copie;
}

/** Ajoute une section de bibliothèque (cf. `sectionsDisponibles`) juste avant
 *  le pied de page — dernière position "normale" avant le bloc verrouillé,
 *  cf. AjouterSectionModal.tsx. Sans effet si `id` est déjà présente. */
export function ajouterSection(sections: SectionState[], id: SectionId): SectionState[] {
  if (sections.some((s) => s.id === id)) return sections;
  const nouvelle: SectionState = {
    id,
    visible: true,
    largeur: "page",
    marges: "moyennes",
    couleurs: "claires",
    visibleTelephone: true,
    visibleOrdinateur: true,
  };
  const indexPied = sections.findIndex((s) => s.id === "pied-de-page");
  if (indexPied === -1) return [...sections, nouvelle];
  return [...sections.slice(0, indexPied), nouvelle, ...sections.slice(indexPied)];
}

/** Retire une section de bibliothèque déjà ajoutée (cf. bouton de suppression
 *  dans SectionsPanel.tsx) — réservé aux sections `libre` : les sections
 *  fixes se masquent (`toggleVisible`) mais ne se suppriment jamais. */
export function supprimerSection(sections: SectionState[], id: SectionId): SectionState[] {
  return sections.filter((s) => s.id !== id);
}

export type ModeleId = "halo" | "eclat" | "nuit";

// "Halo" en premier et par défaut (STYLE_DEFAUT plus bas) : modèle vedette
// de la maquette fournie — grande image en dégradé, courbes lumineuses,
// pied de page nuit. Palette propre à ce modèle (pas les tokens LM du
// tableau de bord), comme les autres lignes de ce tableau.
export const MODELES: { id: ModeleId; nom: string; nomEn: string; fond: string; texte: string; accent: string }[] = [
  { id: "halo", nom: "Halo", nomEn: "Halo", fond: "#FCF6FA", texte: "#0B0E1C", accent: "#E8207E" },
  { id: "eclat", nom: "Éclat", nomEn: "Radiance", fond: "#FFFFFF", texte: "#1D1724", accent: "#EC0C8C" },
  { id: "nuit", nom: "Nuit", nomEn: "Night", fond: "#15101D", texte: "#FFFFFF", accent: "#EC0C8C" },
];

export type BoutonForme = "carre" | "arrondi" | "pilule";
export type BoutonRemplissage = "plein" | "contour" | "degrade";

export type StyleState = {
  modele: ModeleId;
  apparence: "clair" | "sombre";
  couleurPrincipale: string;
  couleurFond: string;
  couleurTexte: string;
  arrondi: number; // px, cartes/champs et angles (onglet Formes et espaces)
  ombres: "aucune" | "legeres" | "marquees";
  boutonForme: BoutonForme;
  boutonRemplissage: BoutonRemplissage;
  boutonTexteMajuscules: boolean;
  epaisseurContour: "fine" | "epaisse";
  espacementSections: "serre" | "normal" | "aere";
  largeurOrdinateur: "normale" | "large";
  /** Couleur du bouton de commande — indépendante de couleurPrincipale
   *  (cf. onglet Style · Couleurs de la maquette, groupe "Bouton de commande"). */
  boutonCommandeCouleur: "nuit" | "principale" | "violet";
  etoilesCouleur: "or" | "principale";
  /** Bascule de la période de fête programmée (dates fixes côté maquette : du 20 au 31 décembre). */
  periodeFeteActive: boolean;
  /** Groupe "Après le choix" du modèle (cf. StyleReglages.tsx) : si activé,
   *  "Revenir au modèle d'origine" ne touche que le style (couleurs/fond) et
   *  laisse textes/images des sections tels quels ; sinon il remet tout
   *  l'éditeur à ETAT_DEFAUT. */
  garderTextesImages: boolean;
};

export const STYLE_DEFAUT: StyleState = {
  modele: "halo",
  apparence: "clair",
  couleurPrincipale: "#E8207E",
  couleurFond: "#FCF6FA",
  couleurTexte: "#0B0E1C",
  arrondi: 18,
  ombres: "legeres",
  boutonForme: "pilule",
  boutonRemplissage: "plein",
  boutonTexteMajuscules: false,
  epaisseurContour: "fine",
  espacementSections: "normal",
  largeurOrdinateur: "normale",
  boutonCommandeCouleur: "nuit",
  etoilesCouleur: "or",
  periodeFeteActive: false,
  garderTextesImages: true,
};

export type BandeauMessage = {
  texte: string;
  /** Nom court affiché sur l'onglet du sélecteur "Message affiché". */
  etiquette: string;
};

export type BandeauState = {
  messages: BandeauMessage[];
  /** Index dans `messages` montré dans l'aperçu (et utilisé tel quel en
   *  défilement "fixe") — le défilement réel entre les messages n'a de
   *  sens que côté boutique publiée, pas dans cet aperçu statique. */
  messageActif: number;
  iconeDevantMessage: boolean;
  compteARebours: boolean;
  defilement: "fixe" | "tour-a-tour" | "continu";
  couleur: "nuit" | "principale" | "claire";
  fermable: boolean;
  surToutesLesPages: boolean;
  resteVisibleEnDefilant: boolean;
};

export type MenuLien = { label: string; compteur?: number };

export type EnteteState = {
  nomAvecLogo: boolean;
  positionLogo: "gauche" | "centre"; // sur ordinateur
  positionLogoMobile: "centre" | "gauche"; // sur téléphone — centré par défaut, contrairement à l'ordinateur
  tailleLogo: "s" | "m" | "l";
  /** Fond transparent tant que l'en-tête chevauche la grande image — n'a
   *  de sens que sur l'accueil, seule page à avoir une grande image. */
  transparentSurHero: boolean;
  rechercheStyle: "barre" | "icone";
  panierStyle: "sac" | "chariot";
  compte: boolean;
  nousEcrire: boolean;
  grandMenuAvecImages: boolean;
  resteVisible: "non" | "toujours" | "en-remontant";
  menuLiens: MenuLien[];
};

export type GalerieState = {
  vignettesOrdinateur: "gauche" | "dessous" | "aucune";
  vignettesTelephone: "dessous" | "aucune";
  format: "carre" | "portrait";
  position: "gauche" | "droite";
  boutonZoom: boolean;
  compteur: boolean;
  pointsPosition: boolean;
  lectureAuto: boolean;
  repeter: boolean;
  photosDefilentApresVideo: boolean;
  dureeParPhoto: 2 | 3 | 5;
  passage: "glisser" | "fondu";
};

export type DescriptionAffichage = "courte" | "complete";
export type VariantesPresentation = "cases" | "ronds" | "liste";

export type InfosState = {
  badgeNouveaute: boolean;
  etoilesSousNom: boolean;
  description: DescriptionAffichage;
  stockRestant: boolean;
  lienConseilsUtilisation: boolean;
  quantite: boolean;
  /** Pas dans la maquette "Informations produit" fournie (badge « Nouveauté », étoiles,
   *  description, stock, lien, quantité, rangée de confiance) — gardés en fin de groupe
   *  "Blocs affichés" plutôt que retirés, pour ne pas perdre ces réglages existants. */
  ancienPrixBarre: boolean;
  badgeRemise: boolean;
  variantesPresentation: VariantesPresentation;
  /** Cf. "Stock restant · Afficher sous" de la maquette : le bloc stock (ci-dessus)
   *  ne s'affiche que lorsque `PRODUIT_APERCU.unitesDisponibles` est sous ce seuil. */
  stockAfficherSousUnites: number;
};

export type OffresState = {
  actif: boolean;
  paliers: { unites: number; remisePct: number; badge?: string }[];
};

export type FormulaireState = {
  colonnes: 1 | 2;
  styleChamps: "cadre" | "plein" | "ligne";
  libellesPosition: "dans-le-champ" | "au-dessus";
  iconesDansChamps: boolean;
  boutonLocaliser: boolean;
  mentionSpecifique: boolean;
  mentionType: "texte" | "choix" | "date";
  libelleAdressePrecise: string;
  texteExempleAdressePrecise: string;
};

export type BoutonCommandeTexte = "je-commande" | "commander" | "acheter";

export type PaiementApercuState = {
  payerEnLigne: boolean;
  remiseEnLignePct: number;
  /** Texte affiché sous la remise (ex. "Remise appliquée tout de suite"). */
  texteRemiseOption: string;
  payerALaLivraison: boolean;
  /** Mode de paiement présenté en premier au client sur la page de commande. */
  modePreselectionne: "en-ligne" | "a-la-livraison";
  livraisonExpress: boolean;
  /** Mode de livraison présenté en premier au client. */
  livraisonPreselectionnee: "standard" | "express";
  /** Texte affiché à côté de l'option express (ex. "Plus rapide"). */
  texteExpress: string;
  /** Un seul bouton carré, Partager OU Favoris (pas les deux à la fois). */
  boutonSecondaire: "aucun" | "partager" | "favori";
  rangeeConfiance: boolean;
  /** Réglé depuis le panneau "Informations produit" (groupe "Bouton de commande",
   *  cf. ReglagesSection.tsx) même si l'état vit ici, à côté du reste du bouton. */
  boutonTexte: BoutonCommandeTexte;
  totalDansBouton: boolean;
};

export type OngletsDetailsState = {
  /** Onglets (par défaut) ou accordéon, cf. groupe "Affichage" du panneau. */
  presentation: "onglets" | "accordeon";
  grandeImage: boolean;
  /** Affiche `atouts` (ci-dessous) sous forme de liste à puces avec icônes. */
  atoutsAvecIcones: boolean;
  /** Libellés des onglets, éditables (cf. menuLiens dans EnteteState pour le
   *  même patron ajouter/renommer/retirer). Le premier est actif dans l'aperçu. */
  onglets: string[];
  nombreAtouts: 3 | 4;
  atouts: [string, string, string, string];
};

export type PositionOngletsDetails = "sous-produit" | "apres-commande" | "avant-pied-de-page";

/** Même logique que positionAvisActuelle/placerAvis plus bas, mais sur les
 *  ancres de la page "commande" : "infos" (sous le produit) et "formulaire"
 *  (juste après le bloc commande), cf. SECTIONS_DEFAUT. */
export function positionOngletsDetailsActuelle(sections: SectionState[]): PositionOngletsDetails {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("onglets-details");
  if (i < 0) return "apres-commande";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "infos") return "sous-produit";
  return "apres-commande";
}

export function placerOngletsDetails(sections: SectionState[], cible: PositionOngletsDetails): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansOnglets = ids.filter((id) => id !== "onglets-details");
  const ancre: SectionId = cible === "sous-produit" ? "infos" : cible === "apres-commande" ? "formulaire" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansOnglets.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansOnglets.slice(0, insertion), "onglets-details" as SectionId, ...sansOnglets.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type ProduitsLiesState = {
  choisirSelon: "meme-rayon" | "meilleures-ventes";
  nombre: 4 | 8;
  colonnesOrdinateur: 2 | 3 | 4;
  colonnesTelephone: 1 | 2;
  noteEtoiles: boolean;
  coeurFavoris: boolean;
  bouton: "texte" | "icone" | "aucun";
};

export type PositionProduitsLies = "sous-produit" | "apres-commande" | "apres-details" | "avant-pied-de-page";

/** Même logique que positionOngletsDetailsActuelle/placerOngletsDetails ci-dessus,
 *  avec une ancre de plus ("après les détails" = juste après "onglets-details"). */
export function positionProduitsLiesActuelle(sections: SectionState[]): PositionProduitsLies {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("produits-lies");
  if (i < 0) return "apres-commande";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "infos") return "sous-produit";
  if (ids[i - 1] === "onglets-details") return "apres-details";
  return "apres-commande";
}

export function placerProduitsLies(sections: SectionState[], cible: PositionProduitsLies): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansProduitsLies = ids.filter((id) => id !== "produits-lies");
  const ancre: SectionId =
    cible === "sous-produit" ? "infos" : cible === "apres-commande" ? "formulaire" : cible === "apres-details" ? "onglets-details" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansProduitsLies.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansProduitsLies.slice(0, insertion), "produits-lies" as SectionId, ...sansProduitsLies.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type AvisApercuState = {
  disposition: "grille" | "liste" | "carrousel";
  colonnesOrdinateur: 2 | 3 | 4;
  colonnesTelephone: 1 | 2;
  nombreAffiches: 3 | 6;
  ordre: "recents" | "mieux-notes" | "photos";
  resumeDesNotes: boolean;
  photosClients: boolean;
  reponsesBoutique: boolean;
  produitSousAvis: boolean;
  date: boolean;
  filtres: boolean;
  compteurAchatsVerifies: boolean;
  etoilesSousNomProduit: boolean;
  demanderAvisApresLivraison: boolean;
  questionsClientsSousProduit: boolean;
};

export type PositionAvis = "apres-grande-image" | "apres-categories" | "apres-produits" | "avant-pied-de-page";

/** Même logique que positionConfianceActuelle/placerConfiance plus bas : pas
 *  de champ `position` séparé, "Position dans la page" lit et écrit l'ordre
 *  de "avis" dans `state.sections`. Opère sur le tableau complet comme pour
 *  confiance/promo/grille : "avis" est présent sur les deux pages ("les-deux",
 *  cf. SECTIONS_DEFAUT), mais ses ancres ici (grande-image/catégories/grille)
 *  n'existent que sur l'accueil, donc ce contrôle n'a d'effet visible que là. */
export function positionAvisActuelle(sections: SectionState[]): PositionAvis {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("avis");
  if (i < 0) return "apres-produits";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "grande-image") return "apres-grande-image";
  if (ids[i - 1] === "categories") return "apres-categories";
  return "apres-produits";
}

export function placerAvis(sections: SectionState[], cible: PositionAvis): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansAvis = ids.filter((id) => id !== "avis");
  const ancre: SectionId =
    cible === "apres-grande-image" ? "grande-image" : cible === "apres-categories" ? "categories" : cible === "apres-produits" ? "grille" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansAvis.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansAvis.slice(0, insertion), "avis" as SectionId, ...sansAvis.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type FaqItem = { question: string; reponse: string; ouverte?: boolean };

export type FaqApercuState = {
  colonnes: "une" | "deux";
  premiereOuverte: boolean;
  icone: "plus" | "fleche";
  rechercheActivee: boolean;
  boutonPoserQuestion: boolean;
  items: FaqItem[];
};

export type PositionFaq = "apres-grande-image" | "apres-categories" | "apres-produits" | "avant-pied-de-page";

/** Même logique que positionAvisActuelle/placerAvis plus haut : "faq" est
 *  présente sur les deux pages ("les-deux", cf. SECTIONS_DEFAUT) mais ses
 *  ancres ici n'existent que sur l'accueil. */
export function positionFaqActuelle(sections: SectionState[]): PositionFaq {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("faq");
  if (i < 0) return "apres-produits";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "grande-image") return "apres-grande-image";
  if (ids[i - 1] === "categories") return "apres-categories";
  return "apres-produits";
}

export function placerFaq(sections: SectionState[], cible: PositionFaq): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansFaq = ids.filter((id) => id !== "faq");
  const ancre: SectionId =
    cible === "apres-grande-image" ? "grande-image" : cible === "apres-categories" ? "categories" : cible === "apres-produits" ? "grille" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansFaq.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansFaq.slice(0, insertion), "faq" as SectionId, ...sansFaq.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type PiedDePageState = {
  logoAffiche: boolean;
  tailleLogo: "petite" | "moyenne" | "grande";
  presentation: boolean;
  reseaux: boolean;
  colonnesLiens: 2 | 3 | 4;
  moyensPaiement: boolean;
  colonnesRepliablesTelephone: boolean;
  couleur: "nuit" | "clair" | "degrade";
  alignement: "gauche" | "centre";
  mentionBas: string;
};

/* ── Sections propres à la page d'accueil ── */

/** État de la section "grande-image" — nommé HeroState (pas GrandeImageState)
 *  pour rester court, comme MODELES/StyleState plus haut. */
export type HeroState = {
  imagePosition: "droite" | "gauche" | "centre";
  hauteur: "s" | "m" | "l";
  texteAlign: "gauche" | "centre";
  boutons: 1 | 2;
  typeFond: "degrade" | "uni" | "photo";
  courbesLumineuses: boolean;
  /** Pas d'upload d'image dédié au mobile pour l'instant — le réglage
   *  existe déjà côté produit (cf. logique similaire), l'aperçu se contente
   *  d'un indice visuel plutôt que deux vraies images. */
  imageDifferenteSurTelephone: boolean;
  badge: boolean;
  note: boolean;
  petitTexte: string;
  titre: string;
  /** Sous-chaîne de `titre` mise en couleur (1re occurrence, insensible à la casse). */
  motValorise: string;
  bouton1Texte: string;
  bouton2Texte: string;
};

export type PositionConfiance = "apres-grande-image" | "apres-categories" | "apres-produits" | "avant-pied-de-page";

export type ConfianceState = {
  nombre: 3 | 4;
  style: "carte" | "ligne";
  /** Chevauche le bas de la grande image (marge négative + ombre portée) au lieu de s'afficher dans son propre bloc. */
  chevaucheGrandeImage: boolean;
  icones: "trait" | "pleines";
  /** Libellé des 4 atouts (icône et sous-texte restent fixes par position) ; seuls les `nombre` premiers sont affichés. */
  atouts: [string, string, string, string];
};

/** Pas de champ `position` séparé dans ConfianceState : la position réelle
 *  dans la page, c'est l'ordre de "confiance" dans `state.sections` (celui
 *  que Monter/Descendre modifie déjà, cf. ReglagesSection.tsx) — un champ à
 *  part aurait pu diverger de cet ordre et rendre les boutons Monter/
 *  Descendre sans effet visible sur l'aperçu. "Position dans la page" lit et
 *  écrit donc ce même ordre via les deux fonctions ci-dessous plutôt que de
 *  dupliquer l'état.
 *
 *  positionConfianceActuelle déduit le segment sélectionné du voisinage
 *  immédiat de "confiance" dans `sections` (son prédécesseur, ou "avant le
 *  pied de page" si son successeur est "pied-de-page") ; placerConfiance
 *  fait l'inverse : elle déplace "confiance" juste après (ou juste avant,
 *  pour "avant-pied-de-page") l'ancre correspondante. Opère sur le tableau
 *  complet (pas seulement la page "accueil") : "confiance" et ses ancres
 *  n'existent que sur "accueil"/"les-deux", donc pas besoin de filtrer par
 *  page pour les réordonner entre elles — les sections propres à "commande"
 *  gardent leur ordre relatif intact. */
export function positionConfianceActuelle(sections: SectionState[]): PositionConfiance {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("confiance");
  if (i < 0) return "apres-categories";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "grande-image") return "apres-grande-image";
  if (ids[i - 1] === "grille") return "apres-produits";
  return "apres-categories";
}

export function placerConfiance(sections: SectionState[], cible: PositionConfiance): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansConfiance = ids.filter((id) => id !== "confiance");
  const ancre: SectionId =
    cible === "apres-grande-image" ? "grande-image" : cible === "apres-categories" ? "categories" : cible === "apres-produits" ? "grille" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansConfiance.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansConfiance.slice(0, insertion), "confiance" as SectionId, ...sansConfiance.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type CategoriesState = {
  colonnesOrdinateur: 3 | 4 | 5 | 6;
  colonnesTelephone: "2" | "3" | "defilement";
  formeImages: "carte" | "rond";
  nombreProduits: boolean;
  lienToutVoir: boolean;
  titre: string;
};

export type PositionCategories = "apres-grande-image" | "apres-produits" | "avant-pied-de-page";

/** Même logique que positionConfianceActuelle/placerConfiance ci-dessus : pas
 *  de champ `position` séparé dans CategoriesState, "Position dans la page"
 *  lit et écrit l'ordre de "categories" dans `state.sections` pour rester
 *  cohérent avec Monter/Descendre — un champ à part avait rendu ces boutons
 *  sans effet visible sur l'aperçu (cf. BoutiquePreview.tsx). */
export function positionCategoriesActuelle(sections: SectionState[]): PositionCategories {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("categories");
  if (i < 0) return "apres-grande-image";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "grille") return "apres-produits";
  return "apres-grande-image";
}

export function placerCategories(sections: SectionState[], cible: PositionCategories): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansCategories = ids.filter((id) => id !== "categories");
  const ancre: SectionId = cible === "apres-produits" ? "grille" : cible === "avant-pied-de-page" ? "pied-de-page" : "grande-image";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansCategories.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansCategories.slice(0, insertion), "categories" as SectionId, ...sansCategories.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type PositionPromo = "apres-grande-image" | "apres-categories" | "apres-produits" | "avant-pied-de-page";

export type PromoState = {
  cote: "gauche" | "droite";
  fond: "degrade" | "nuit";
  compteur: boolean;
  petitTexte: string;
  titre: string;
  sousTitre: string;
  finOffre: string;
  boutonTexte: string;
  lienBouton: "rayon-offres" | "accueil" | "tous-les-produits" | "personnalise";
};

/** Même logique que positionConfianceActuelle/placerConfiance ci-dessus : pas
 *  de champ `position` séparé, "Position dans la page" lit et écrit l'ordre
 *  de "promo" dans `state.sections` pour rester cohérent avec Monter/Descendre. */
export function positionPromoActuelle(sections: SectionState[]): PositionPromo {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("promo");
  if (i < 0) return "apres-categories";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "grande-image") return "apres-grande-image";
  if (ids[i - 1] === "grille") return "apres-produits";
  return "apres-categories";
}

export function placerPromo(sections: SectionState[], cible: PositionPromo): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansPromo = ids.filter((id) => id !== "promo");
  const ancre: SectionId =
    cible === "apres-grande-image" ? "grande-image" : cible === "apres-categories" ? "categories" : cible === "apres-produits" ? "grille" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansPromo.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansPromo.slice(0, insertion), "promo" as SectionId, ...sansPromo.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type PositionGrille = "apres-grande-image" | "apres-categories" | "avant-pied-de-page";

export type GrilleState = {
  montrer: "meilleures-ventes" | "nouveautes" | "choisis";
  nombre: 4 | 8;
  colonnesOrdinateur: 2 | 3 | 4 | 5;
  colonnesTelephone: 1 | 2;
  defilementTelephone: boolean;
  noteEtoiles: boolean;
  prixAffiche: "en-ligne" | "normal";
  bouton: "texte" | "icone" | "aucun";
  coeurFavoris: boolean;
  badges: boolean;
};

/** Même logique que positionConfianceActuelle/placerConfiance ci-dessus : pas
 *  de champ `position` séparé, "Position dans la page" lit et écrit l'ordre
 *  de "grille" dans `state.sections`. Pas d'ancre "apres-produits" ici (ce
 *  serait la grille elle-même) : seulement grande-image/catégories/pied de
 *  page, comme dans la maquette. */
export function positionGrilleActuelle(sections: SectionState[]): PositionGrille {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("grille");
  if (i < 0) return "apres-grande-image";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "categories") return "apres-categories";
  return "apres-grande-image";
}

export function placerGrille(sections: SectionState[], cible: PositionGrille): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansGrille = ids.filter((id) => id !== "grille");
  const ancre: SectionId = cible === "apres-grande-image" ? "grande-image" : cible === "apres-categories" ? "categories" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansGrille.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansGrille.slice(0, insertion), "grille" as SectionId, ...sansGrille.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type PositionEngagements = "apres-grande-image" | "apres-categories" | "apres-produits" | "avant-pied-de-page";

export type EngagementsState = {
  nombre: 3 | 4;
  /** Libellé des 4 engagements (icône reste fixe par position) ; seuls les `nombre` premiers sont affichés. */
  items: [string, string, string, string];
};

/** Même logique que positionConfianceActuelle/placerConfiance ci-dessus : pas
 *  de champ `position` séparé, "Position dans la page" lit et écrit l'ordre
 *  de "engagements" dans `state.sections` pour rester cohérent avec Monter/Descendre. */
export function positionEngagementsActuelle(sections: SectionState[]): PositionEngagements {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("engagements");
  if (i < 0) return "apres-categories";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "grande-image") return "apres-grande-image";
  if (ids[i - 1] === "grille") return "apres-produits";
  return "apres-categories";
}

export function placerEngagements(sections: SectionState[], cible: PositionEngagements): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansEngagements = ids.filter((id) => id !== "engagements");
  const ancre: SectionId =
    cible === "apres-grande-image" ? "grande-image" : cible === "apres-categories" ? "categories" : cible === "apres-produits" ? "grille" : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansEngagements.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansEngagements.slice(0, insertion), "engagements" as SectionId, ...sansEngagements.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type PositionVenduPar = "sous-le-bouton" | "sous-produit" | "apres-commande" | "apres-details" | "avant-pied-de-page";

/** Même logique que positionProduitsLiesActuelle/placerProduitsLies ci-dessus : pas de champ
 *  `position` séparé dans InfosState, le panneau "Vendu par" lit et écrit l'ordre de
 *  "vendu-par" dans `state.sections`. "Emplacement" (Bas de page / Sous le bouton) n'est
 *  qu'un regroupement d'affichage : "Sous le bouton" vaut "sous-le-bouton" (juste après
 *  "paiement"), "Bas de page" recouvre les quatre ancres fines de "Position dans la page". */
export function positionVenduParActuelle(sections: SectionState[]): PositionVenduPar {
  const ids = sections.map((s) => s.id);
  const i = ids.indexOf("vendu-par");
  if (i < 0) return "avant-pied-de-page";
  if (ids[i + 1] === "pied-de-page") return "avant-pied-de-page";
  if (ids[i - 1] === "paiement") return "sous-le-bouton";
  if (ids[i - 1] === "infos") return "sous-produit";
  if (ids[i - 1] === "onglets-details") return "apres-details";
  return "apres-commande";
}

export function placerVenduPar(sections: SectionState[], cible: PositionVenduPar): SectionState[] {
  const ids = sections.map((s) => s.id);
  const sansVenduPar = ids.filter((id) => id !== "vendu-par");
  const ancre: SectionId =
    cible === "sous-le-bouton"
      ? "paiement"
      : cible === "sous-produit"
        ? "infos"
        : cible === "apres-commande"
          ? "formulaire"
          : cible === "apres-details"
            ? "onglets-details"
            : "pied-de-page";
  const avant = cible === "avant-pied-de-page";
  const indexAncre = sansVenduPar.indexOf(ancre);
  if (indexAncre === -1) return sections;
  const insertion = avant ? indexAncre : indexAncre + 1;
  const nouvelOrdre = [...sansVenduPar.slice(0, insertion), "vendu-par" as SectionId, ...sansVenduPar.slice(insertion)];
  return nouvelOrdre.map((id) => sections.find((s) => s.id === id)!);
}

export type FlottantsState = {
  boutonCommandeTelephone: boolean;
  whatsappAfficher: boolean;
  whatsappCote: "droite" | "gauche";
  ongletAvisCote: boolean;
  boutonRetourHaut: boolean;
};

export type CartesProduitZoneId = "vous-aimerez-aussi" | "recherche" | "rayons";

export type CartesProduitState = {
  style: "ombre" | "bordure" | "sans-cadre";
  positionBadges: "coin" | "dessous";
  densite: "confortable" | "compacte";
  deuxiemePhotoSurvol: boolean;
  rondsCouleurVariantes: boolean;
  commandeRapide: boolean;
  // "Grilles de produits" est toujours actif (verrouillé, cf. StyleReglages.tsx) — seules ces zones se choisissent.
  zones: CartesProduitZoneId[];
};

export type MouvementsState = {
  apparitionAuDefilement: boolean;
  effetSurvol: "aucun" | "soulever" | "zoom";
  boutonCommandeAnimation: "aucun" | "pulsation" | "vibration";
  styleIcones: "trait" | "pleines";
};

/** Onglet Style · Textes — les deux polices restent celles de la charte
 *  graphique LM (Sora et Bricolage Grotesque, cf. CHARTE_GRAPHIQUE.md) :
 *  "Titres" choisit laquelle des deux habille les titres ("Moderne" =
 *  Bricolage Grotesque, déjà utilisée pour le Dashboard ; "Élégante" =
 *  Sora Semibold, cf. H2 de la charte) et "Texte courant" choisit celle du
 *  corps de texte. Aucune police hors charte n'est proposée. */
export type TitresPoliceId = "moderne" | "elegante";
export type TexteCourantPoliceId = "Sora" | "Bricolage Grotesque";

export type TexteState = {
  titresPolice: TitresPoliceId;
  texteCourantPolice: TexteCourantPoliceId;
  tailleTexte: "petite" | "moyenne" | "grande";
  titresMajuscules: boolean;
  graisseTitres: "demi" | "gras";
  espacementLettres: "serre" | "normal";
};

export const TEXTE_DEFAUT: TexteState = {
  titresPolice: "moderne",
  texteCourantPolice: "Sora",
  tailleTexte: "petite",
  titresMajuscules: false,
  graisseTitres: "gras",
  espacementLettres: "normal",
};

export type EditeurState = {
  sections: SectionState[];
  style: StyleState;
  texte: TexteState;
  cartesProduit: CartesProduitState;
  mouvements: MouvementsState;
  bandeau: BandeauState;
  entete: EnteteState;
  grandeImage: HeroState;
  confiance: ConfianceState;
  categories: CategoriesState;
  promo: PromoState;
  grille: GrilleState;
  galerie: GalerieState;
  infos: InfosState;
  offres: OffresState;
  formulaire: FormulaireState;
  paiement: PaiementApercuState;
  ongletsDetails: OngletsDetailsState;
  avis: AvisApercuState;
  faq: FaqApercuState;
  engagements: EngagementsState;
  produitsLies: ProduitsLiesState;
  piedDePage: PiedDePageState;
  flottants: FlottantsState;
};

export const ETAT_DEFAUT: EditeurState = {
  sections: SECTIONS_ETAT_DEFAUT,
  style: STYLE_DEFAUT,
  texte: TEXTE_DEFAUT,
  cartesProduit: {
    style: "ombre",
    positionBadges: "coin",
    densite: "confortable",
    deuxiemePhotoSurvol: true,
    rondsCouleurVariantes: true,
    commandeRapide: true,
    zones: ["vous-aimerez-aussi", "recherche", "rayons"],
  },
  mouvements: {
    apparitionAuDefilement: false,
    effetSurvol: "soulever",
    boutonCommandeAnimation: "aucun",
    styleIcones: "trait",
  },
  bandeau: {
    messages: [
      { texte: "Livraison en 4 h en moyenne", etiquette: "Livraison" },
      { texte: "Payez en ligne et économisez", etiquette: "Remise en ligne" },
      { texte: "Nouvelle gamme de soins disponible", etiquette: "Nouveauté" },
    ],
    messageActif: 0,
    iconeDevantMessage: true,
    compteARebours: false,
    defilement: "tour-a-tour",
    couleur: "nuit",
    fermable: false,
    surToutesLesPages: true,
    resteVisibleEnDefilant: false,
  },
  entete: {
    nomAvecLogo: true,
    positionLogo: "gauche",
    positionLogoMobile: "centre",
    tailleLogo: "m",
    transparentSurHero: true,
    rechercheStyle: "barre",
    panierStyle: "sac",
    compte: true,
    nousEcrire: false,
    grandMenuAvecImages: false,
    resteVisible: "en-remontant",
    menuLiens: [{ label: "Accueil" }, { label: "Soins visage", compteur: 3 }, { label: "Corps" }, { label: "Nouveautés" }, { label: "Offres" }],
  },
  grandeImage: {
    imagePosition: "droite",
    hauteur: "m",
    texteAlign: "gauche",
    boutons: 2,
    typeFond: "degrade",
    courbesLumineuses: true,
    imageDifferenteSurTelephone: false,
    badge: true,
    note: true,
    petitTexte: "Livraison en 4 h en moyenne",
    titre: "Une peau qui rayonne, chaque jour.",
    motValorise: "rayonne",
    bouton1Texte: "Découvrir les soins",
    bouton2Texte: "Voir les offres",
  },
  confiance: {
    nombre: 4,
    style: "carte",
    chevaucheGrandeImage: true,
    icones: "trait",
    atouts: ["Produits authentiques", "Livraison en 4 h en moyenne", "Paiement à la livraison", "Service client"],
  },
  categories: {
    colonnesOrdinateur: 5,
    colonnesTelephone: "defilement",
    formeImages: "carte",
    nombreProduits: true,
    lienToutVoir: true,
    titre: "Nos catégories",
  },
  promo: {
    cote: "gauche",
    fond: "degrade",
    compteur: true,
    petitTexte: "Offre du moment",
    titre: "Jusqu'à -30 % en payant en ligne",
    sousTitre: "Sur toute la gamme de soins, pendant la durée de l'offre.",
    finOffre: "30 sept. 2026 · 23 h 59",
    boutonTexte: "J'en profite",
    lienBouton: "rayon-offres",
  },
  grille: {
    montrer: "meilleures-ventes",
    nombre: 4,
    colonnesOrdinateur: 4,
    colonnesTelephone: 2,
    defilementTelephone: false,
    noteEtoiles: true,
    prixAffiche: "en-ligne",
    bouton: "texte",
    coeurFavoris: true,
    badges: true,
  },
  galerie: {
    vignettesOrdinateur: "gauche",
    vignettesTelephone: "dessous",
    format: "carre",
    position: "gauche",
    boutonZoom: true,
    compteur: true,
    pointsPosition: true,
    lectureAuto: true,
    repeter: false,
    photosDefilentApresVideo: true,
    dureeParPhoto: 3,
    passage: "glisser",
  },
  infos: {
    badgeNouveaute: true,
    etoilesSousNom: true,
    description: "courte",
    stockRestant: true,
    lienConseilsUtilisation: true,
    quantite: true,
    ancienPrixBarre: true,
    badgeRemise: true,
    variantesPresentation: "cases",
    stockAfficherSousUnites: 20,
  },
  offres: {
    actif: true,
    paliers: [
      { unites: 1, remisePct: 0 },
      { unites: 2, remisePct: 10, badge: "Le plus choisi" },
      { unites: 3, remisePct: 15 },
    ],
  },
  formulaire: {
    colonnes: 2,
    styleChamps: "cadre",
    libellesPosition: "dans-le-champ",
    iconesDansChamps: false,
    boutonLocaliser: true,
    mentionSpecifique: true,
    mentionType: "texte",
    libelleAdressePrecise: "Adresse précise",
    texteExempleAdressePrecise: "Quartier, rue, repère",
  },
  paiement: {
    payerEnLigne: true,
    remiseEnLignePct: 30,
    texteRemiseOption: "Remise appliquée tout de suite",
    payerALaLivraison: true,
    modePreselectionne: "en-ligne",
    livraisonExpress: true,
    livraisonPreselectionnee: "standard",
    texteExpress: "Plus rapide",
    boutonSecondaire: "favori",
    rangeeConfiance: true,
    boutonTexte: "je-commande",
    totalDansBouton: false,
  },
  ongletsDetails: {
    presentation: "onglets",
    grandeImage: true,
    atoutsAvecIcones: true,
    onglets: ["Détails", "Composition", "Utilisation", "Livraison et retours"],
    nombreAtouts: 4,
    atouts: ["Texture légère, absorption rapide", "Formule sans paraben ni sulfate", "Convient aux peaux sensibles", "Testé dermatologiquement"],
  },
  avis: {
    disposition: "grille",
    colonnesOrdinateur: 3,
    colonnesTelephone: 1,
    nombreAffiches: 3,
    ordre: "photos",
    resumeDesNotes: true,
    photosClients: true,
    reponsesBoutique: true,
    produitSousAvis: true,
    date: true,
    filtres: true,
    compteurAchatsVerifies: true,
    etoilesSousNomProduit: true,
    demanderAvisApresLivraison: true,
    questionsClientsSousProduit: false,
  },
  engagements: {
    nombre: 4,
    items: ["Paiement en ligne sécurisé", "Suivi de la commande", "Service client", "Offres régulières"],
  },
  produitsLies: {
    choisirSelon: "meme-rayon",
    nombre: 4,
    colonnesOrdinateur: 4,
    colonnesTelephone: 2,
    noteEtoiles: true,
    coeurFavoris: true,
    bouton: "texte",
  },
  faq: {
    colonnes: "deux",
    premiereOuverte: true,
    icone: "plus",
    rechercheActivee: false,
    boutonPoserQuestion: false,
    items: [
      { question: "Comment appliquer le sérum ?", reponse: "Deux à trois gouttes matin et soir, sur une peau propre, avant la crème.", ouverte: true },
      { question: "Convient-il aux peaux sensibles ?", reponse: "Formule douce, sans parfum, testée dermatologiquement." },
      { question: "Puis-je payer à la livraison ?", reponse: "Oui, le paiement à la livraison est proposé sur cette page." },
    ],
  },
  piedDePage: {
    logoAffiche: true,
    tailleLogo: "moyenne",
    presentation: true,
    reseaux: true,
    colonnesLiens: 3,
    moyensPaiement: true,
    colonnesRepliablesTelephone: true,
    couleur: "degrade",
    alignement: "gauche",
    mentionBas: "© 2026 Awa Beauté",
  },
  flottants: {
    boutonCommandeTelephone: true,
    whatsappAfficher: false,
    whatsappCote: "droite",
    ongletAvisCote: false,
    boutonRetourHaut: true,
  },
};

/** Fusionne un état sauvegardé (localStorage, potentiellement plus ancien
 *  que le schéma courant) avec ETAT_DEFAUT, clé par clé de premier niveau —
 *  un champ ajouté depuis (ex. `confiance.atouts`) retombe sur sa valeur par
 *  défaut plutôt que de planter le rendu (`undefined`) si l'objet sauvegardé
 *  ne le porte pas encore. Une fusion superficielle par section suffit : les
 *  tableaux/objets imbriqués (atouts, menuLiens, items...) sont toujours
 *  réécrits en bloc par l'éditeur, jamais modifiés champ par champ à la main. */
export function fusionnerEtatPersiste(sauvegarde: Partial<EditeurState> | undefined): EditeurState {
  if (!sauvegarde) return ETAT_DEFAUT;
  const fusion = { ...ETAT_DEFAUT } as EditeurState;
  for (const cle of Object.keys(ETAT_DEFAUT) as (keyof EditeurState)[]) {
    const valeur = sauvegarde[cle];
    if (valeur === undefined) continue;
    const defautCle = ETAT_DEFAUT[cle];
    (fusion as Record<string, unknown>)[cle] =
      typeof defautCle === "object" && defautCle !== null && !Array.isArray(defautCle) ? { ...defautCle, ...valeur } : valeur;
  }
  // `sections` est un tableau : la boucle ci-dessus le remplace tel quel
  // (pas de fusion champ à champ comme pour les objets) — une sauvegarde
  // antérieure à l'ajout d'une SectionDef (ex. "bouton-commande-fixe" ou,
  // en son temps, "vendu-par") ne la verrait donc jamais apparaître, section
  // manquante en silence plutôt qu'en erreur. On reconstruit `sections` dans
  // l'ordre canonique de SECTIONS_ETAT_DEFAUT (état sauvegardé réutilisé
  // quand il existe pour cet id, sinon valeur par défaut) plutôt que de
  // rajouter les ids manquants en vrac : sinon ils atterrissent tous juste
  // avant le pied de page (position de `ajouterSection`) au lieu de leur
  // place normale, et les en-têtes de groupe (SectionsPanel.tsx) se
  // répètent. Les sections de bibliothèque déjà ajoutées par l'utilisateur
  // (id connu mais hors SECTIONS_ETAT_DEFAUT) gardent leur état sauvegardé
  // et sont réinsérées juste avant le pied de page, dans leur ordre
  // d'origine — même position que `ajouterSection`. Les ids qu'aucune
  // SectionDef ne reconnaît plus (section retirée depuis) sont écartés.
  const idsConnus = new Set(SECTIONS_DEFAUT.map((d) => d.id));
  const idsFixes = new Set(SECTIONS_ETAT_DEFAUT.map((d) => d.id));
  const parId = new Map(fusion.sections.filter((s) => idsConnus.has(s.id)).map((s) => [s.id, s]));
  const sectionsFixes = SECTIONS_ETAT_DEFAUT.map((d) => parId.get(d.id) ?? d);
  const sectionsLibres = fusion.sections.filter((s) => idsConnus.has(s.id) && !idsFixes.has(s.id));
  const indexPied = sectionsFixes.findIndex((s) => s.id === "pied-de-page");
  fusion.sections =
    indexPied === -1
      ? [...sectionsFixes, ...sectionsLibres]
      : [...sectionsFixes.slice(0, indexPied), ...sectionsLibres, ...sectionsFixes.slice(indexPied)];

  // bandeau.messages était un tableau de chaînes avant l'introduction de
  // BandeauMessage ({texte, etiquette}) — une sauvegarde localStorage plus
  // ancienne planterait sinon l'aperçu (texteAvecChiffres reçoit un `.texte`
  // undefined puisque l'élément est directement la chaîne).
  fusion.bandeau = {
    ...fusion.bandeau,
    messages: (fusion.bandeau.messages as unknown[]).map((m, i) =>
      typeof m === "string" ? { texte: m, etiquette: `Message ${i + 1}` } : (m as BandeauMessage)
    ),
  };
  return fusion;
}

/* Produit d'aperçu — voir dropCatalogue.ts (source unique du catalogue drop) */
export const PRODUIT_APERCU = {
  nom: "Sérum éclat 30 ml",
  nomEn: "Radiance serum 30 ml",
  prixVente: 12000,
  prixConseille: 14000,
  unitesDisponibles: 340,
  note: 4.7,
  avisCount: 126,
  variantes: ["30 ml", "50 ml"],
  descriptionCourte: "Sérum concentré en actifs éclat, pour un teint unifié au quotidien.",
  descriptionCourteEn: "A brightening-actives concentrate for an even, radiant complexion.",
  descriptionComplete:
    "Sérum concentré en actifs éclat qui unifie le teint et repulpe la peau dès les premières semaines. Texture légère à absorption rapide, convient aux peaux sensibles, sans paraben ni sulfate.",
  descriptionCompleteEn:
    "A brightening-actives concentrate that evens out skin tone and plumps the skin from the first few weeks. Lightweight, fast-absorbing texture, suitable for sensitive skin, paraben- and sulfate-free.",
};

export type AvisApercuItem = {
  initiales: string;
  nom: string;
  note: number;
  texte: string;
  texteEn: string;
  verifie: boolean;
  jour: number;
  photos: boolean;
  reponse?: string;
  reponseEn?: string;
  produit?: { nom: string; nomEn: string; illustration: "flacon" | "pot" | "tube" | "pompe" };
};

export const AVIS_APERCU: AvisApercuItem[] = [
  {
    initiales: "AK",
    nom: "Aya K.",
    note: 5,
    texte: "Texture légère, ma peau est plus lumineuse après deux semaines.",
    texteEn: "Lightweight texture, my skin is brighter after two weeks.",
    verifie: true,
    jour: 12,
    photos: true,
    produit: { nom: "Sérum éclat 30 ml", nomEn: "Radiance serum 30 ml", illustration: "flacon" as const },
  },
  {
    initiales: "FB",
    nom: "Fatou B.",
    note: 5,
    texte: "Le savon noir est doux, il ne tire pas la peau. J'en ai repris deux.",
    texteEn: "The black soap is gentle, it doesn't tighten the skin. I bought two more.",
    verifie: true,
    jour: 7,
    photos: false,
    produit: { nom: "Savon noir 100 g", nomEn: "Black soap 100 g", illustration: "tube" as const },
  },
  {
    initiales: "MD",
    nom: "Mariam D.",
    note: 4,
    texte: "Reçu très vite et bien emballé. Je recommande.",
    texteEn: "Received very quickly and well packaged. I recommend it.",
    verifie: true,
    jour: 10,
    photos: false,
    reponse: "Merci Mariam, à très bientôt !",
    reponseEn: "Thank you Mariam, see you soon!",
    produit: { nom: "Crème de jour 50 g", nomEn: "Day cream 50 g", illustration: "pot" as const },
  },
];

/* Distribution des notes (résumé "4,7 · 126 avis") — mock au même titre que
   AVIS_APERCU ci-dessus, en attendant l'API Laravel. */
export const AVIS_DISTRIBUTION_APERCU = [
  { etoiles: 5, pourcent: 82 },
  { etoiles: 4, pourcent: 12 },
  { etoiles: 3, pourcent: 4 },
  { etoiles: 2, pourcent: 1 },
  { etoiles: 1, pourcent: 1 },
];

/* Note moyenne + nombre d'avis par référence de la grille — mock au même
   titre que PRODUIT_APERCU/AVIS_APERCU ci-dessus (aucune agrégation d'avis
   par produit côté API pour l'instant), cf. [[dashboard-mock-data-pending-laravel-api]]. */
const NOTES_GRILLE_APERCU: Record<string, { note: number; avisCount: number }> = {
  "serum-eclat-30ml": { note: 4.7, avisCount: 126 },
  "masque-argile": { note: 4.5, avisCount: 64 },
  "huile-de-ricin": { note: 4.8, avisCount: 212 },
  "beurre-de-karite": { note: 4.9, avisCount: 98 },
  "lotion-tonique": { note: 4.3, avisCount: 74 },
  "coffret-soin-nuit": { note: 4.6, avisCount: 41 },
};

/* Grille de produits de la page d'accueil — même source que PRODUIT_APERCU
   ci-dessus (dropCatalogue.ts), pas une liste inventée : les produits
   "Beauté et soins" du catalogue drop, seule catégorie peuplée à ce jour.
   `ventes30j` (vosVentes30j du catalogue, 0 si absent) sert à distinguer, à
   l'affichage, la référence "Meilleure vente" (la plus vendue du lot) des
   références "Nouveauté" (pas encore de ventes) — cf. BoutiquePreview.tsx. */
export const PRODUITS_GRILLE_APERCU = DROP_PRODUITS.filter((p) => p.categorie === "Beauté et soins").slice(0, 6).map((p) => ({
  nom: p.nom,
  nomEn: p.nomEn ?? p.nom,
  prix: p.prixVenteActuel ?? p.prixConseille ?? 0,
  prixNormal: p.prixConseille ?? p.prixVenteActuel ?? 0,
  contenance: p.contenance ?? p.poidsEmballe ?? "",
  ventes30j: p.vosVentes30j ?? 0,
  note: NOTES_GRILLE_APERCU[p.slug]?.note ?? 4.5,
  avisCount: NOTES_GRILLE_APERCU[p.slug]?.avisCount ?? 0,
}));

/* Catégories de navigation de la page d'accueil — pas une donnée métier
   réelle (aucun découpage en sous-catégories de boutique n'existe encore
   côté API), juste des cartes d'accès rapide comme dans la maquette,
   nommées d'après les familles de produits déjà présentes dans le
   catalogue drop "Beauté et soins" ci-dessus. */
export const CATEGORIES_APERCU = [
  { label: "Soins visage", labelEn: "Face care", count: 12, icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9 10h.01M15 10h.01M8 15c1.5 1.5 6.5 1.5 8 0" },
  { label: "Crèmes", labelEn: "Creams", count: 8, icon: "M6 6h12v3H6ZM9 6V4h6v2M7 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9Z" },
  { label: "Lotions", labelEn: "Lotions", count: 6, icon: "M10 2h4v2h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V2Z" },
  { label: "Savons", labelEn: "Soaps", count: 9, icon: "M4 9a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9ZM9 12c1-1 2-1 3 0s2 1 3 0" },
  { label: "Coffrets", labelEn: "Gift sets", count: 4, icon: "M4 8h16v12H4V8ZM2 5h20v3H2V5ZM12 5v15M12 5c-1.5-3-5-3-5 0s3.5 3 5 0M12 5c1.5-3 5-3 5 0s-3.5 3-5 0" },
  { label: "Huiles", labelEn: "Oils", count: 5, icon: "M12 2c3 4 6 8 6 12a6 6 0 0 1-12 0c0-4 3-8 6-12Z" },
];
