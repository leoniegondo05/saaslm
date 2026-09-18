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

export type SectionGroupe = "Haut de page" | "Produit" | "Commande" | "Contenu" | "Sections personnalisées" | "Bas de page";

export type PageId = "accueil" | "commande";

export type SectionId =
  | "bandeau"
  | "entete"
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
  | "avis"
  | "faq"
  | "engagements"
  | "vendu-par"
  | "pied-de-page"
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
  /** Tracé d'icône (viewBox 24×24) montré dans la fenêtre "Ajouter une
   *  section" — cf. AjouterSectionModal.tsx. */
  icone?: string;
};

// Ordre unique qui, une fois filtré par page, reproduit exactement l'ordre
// de chaque page de la maquette : filtré sur "commande" (+ "les-deux") on
// retombe sur l'ordre déjà en place (inchangé) ; filtré sur "accueil" (+
// "les-deux") on retombe sur ann/header/hero/trust/cats/promo/best/
// reviews/faq/eng/footer de `defaults().order.home`.
export const SECTIONS_DEFAUT: SectionDef[] = [
  { id: "bandeau", label: "Bandeau d'annonce", labelEn: "Announcement bar", groupe: "Haut de page", groupeEn: "Top of page", page: "les-deux" },
  { id: "entete", label: "En-tête", labelEn: "Header", groupe: "Haut de page", groupeEn: "Top of page", verrouillee: true, page: "les-deux" },
  { id: "grande-image", label: "Grande image", labelEn: "Hero image", groupe: "Haut de page", groupeEn: "Top of page", page: "accueil" },
  { id: "confiance", label: "Barre de confiance", labelEn: "Trust bar", groupe: "Contenu", groupeEn: "Content", page: "accueil", description: "Atouts de la boutique", descriptionEn: "Shop's trust badges" },
  { id: "categories", label: "Catégories", labelEn: "Categories", groupe: "Contenu", groupeEn: "Content", page: "accueil" },
  { id: "promo", label: "Bannière d'offre", labelEn: "Offer banner", groupe: "Contenu", groupeEn: "Content", page: "accueil", description: "Offre du moment", descriptionEn: "Current offer" },
  { id: "grille", label: "Grille de produits", labelEn: "Product grid", groupe: "Contenu", groupeEn: "Content", page: "accueil" },
  { id: "galerie", label: "Galerie · vidéo et photos", labelEn: "Gallery · video and photos", groupe: "Produit", groupeEn: "Product", verrouillee: true, page: "commande" },
  { id: "infos", label: "Informations produit", labelEn: "Product information", groupe: "Produit", groupeEn: "Product", page: "commande" },
  { id: "offres", label: "Offres par quantité", labelEn: "Quantity offers", groupe: "Produit", groupeEn: "Product", page: "commande" },
  { id: "formulaire", label: "Formulaire de commande", labelEn: "Order form", groupe: "Commande", groupeEn: "Order", verrouillee: true, page: "commande" },
  { id: "paiement", label: "Paiement et livraison", labelEn: "Payment and delivery", groupe: "Commande", groupeEn: "Order", verrouillee: true, page: "commande" },
  { id: "avis", label: "Avis clients", labelEn: "Customer reviews", groupe: "Contenu", groupeEn: "Content", page: "les-deux", description: "Notes et commentaires", descriptionEn: "Ratings and comments" },
  { id: "faq", label: "Questions fréquentes", labelEn: "Frequently asked questions", groupe: "Contenu", groupeEn: "Content", page: "les-deux" },
  { id: "engagements", label: "Engagements", labelEn: "Commitments", groupe: "Contenu", groupeEn: "Content", page: "accueil", description: "Rangée d'assurances", descriptionEn: "Row of trust badges" },
  { id: "vendu-par", label: "Vendu par", labelEn: "Sold by", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true, page: "commande" },
  { id: "pied-de-page", label: "Pied de page", labelEn: "Footer", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true, page: "les-deux", description: "Bas de toutes les pages", descriptionEn: "Bottom of every page" },

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

export type BandeauState = {
  messages: string[];
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
  lectureAuto: boolean;
  repeter: boolean;
  format: "carre" | "portrait" | "paysage";
  badge: string;
};

export type InfosState = {
  noteMoyenne: boolean;
  ancienPrixBarre: boolean;
  badgeRemise: boolean;
  stockRestant: boolean;
  variantes: boolean;
  quantite: boolean;
};

export type OffresState = {
  actif: boolean;
  paliers: { unites: number; remisePct: number; badge?: string }[];
};

export type FormulaireState = {
  colonnes: 1 | 2;
  libellesDansChamp: boolean;
  etapesNumerotees: boolean;
  boutonLocaliser: boolean;
  mentionSpecifique: boolean;
};

export type PaiementApercuState = {
  payerEnLigne: boolean;
  remiseEnLignePct: number;
  payerALaLivraison: boolean;
  livraisonExpress: boolean;
};

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
  position: "apres-grande-image" | "apres-produits" | "avant-pied-de-page";
};

export type PositionPromo = "apres-grande-image" | "apres-categories" | "apres-produits" | "avant-pied-de-page";

export type PromoState = {
  cote: "gauche" | "droite";
  fond: "degrade" | "nuit";
  compteur: boolean;
  petitTexte: string;
  titre: string;
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

export type FlottantsState = {
  boutonCommandeTelephone: boolean;
  whatsappAfficher: boolean;
  whatsappCote: "droite" | "gauche";
  popupAfficher: boolean;
  popupApparition: "10s" | "mi-page" | "sortie";
  popupFrequence: "une-fois" | "chaque-visite";
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
  avis: AvisApercuState;
  faq: FaqApercuState;
  engagements: EngagementsState;
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
    messages: ["Livraison en 4 h en moyenne", "Payez en ligne et économisez", "Nouvelle gamme de soins disponible"],
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
    transparentSurHero: false,
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
    position: "apres-grande-image",
  },
  promo: {
    cote: "gauche",
    fond: "degrade",
    compteur: true,
    petitTexte: "Offre du moment",
    titre: "Jusqu'à -30 % en payant en ligne",
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
  galerie: { lectureAuto: true, repeter: false, format: "carre", badge: "Vidéo" },
  infos: { noteMoyenne: true, ancienPrixBarre: true, badgeRemise: true, stockRestant: true, variantes: true, quantite: true },
  offres: {
    actif: true,
    paliers: [
      { unites: 1, remisePct: 0 },
      { unites: 2, remisePct: 10, badge: "Le plus choisi" },
      { unites: 3, remisePct: 15 },
    ],
  },
  formulaire: { colonnes: 2, libellesDansChamp: true, etapesNumerotees: true, boutonLocaliser: true, mentionSpecifique: true },
  paiement: { payerEnLigne: true, remiseEnLignePct: 30, payerALaLivraison: true, livraisonExpress: false },
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
    popupAfficher: false,
    popupApparition: "sortie",
    popupFrequence: "une-fois",
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
};

export const AVIS_APERCU = [
  { initiales: "AK", nom: "Aya K.", note: 5, texte: "Texture légère, ma peau est plus lumineuse après deux semaines.", verifie: true },
  { initiales: "MD", nom: "Mariam D.", note: 4, texte: "Reçu très vite et bien emballé.", verifie: true, reponse: "Merci Mariam, à très bientôt !" },
];

/* Grille de produits de la page d'accueil — même source que PRODUIT_APERCU
   ci-dessus (dropCatalogue.ts), pas une liste inventée : les produits
   "Beauté et soins" du catalogue drop, seule catégorie peuplée à ce jour. */
export const PRODUITS_GRILLE_APERCU = DROP_PRODUITS.filter((p) => p.categorie === "Beauté et soins").slice(0, 6).map((p) => ({
  nom: p.nom,
  nomEn: p.nomEn ?? p.nom,
  prix: p.prixVenteActuel ?? p.prixConseille ?? 0,
  prixNormal: p.prixConseille ?? p.prixVenteActuel ?? 0,
}));

/* Catégories de navigation de la page d'accueil — pas une donnée métier
   réelle (aucun découpage en sous-catégories de boutique n'existe encore
   côté API), juste des cartes d'accès rapide comme dans la maquette,
   nommées d'après les familles de produits déjà présentes dans le
   catalogue drop "Beauté et soins" ci-dessus. */
export const CATEGORIES_APERCU = [
  { label: "Soins visage", labelEn: "Face care", count: 12 },
  { label: "Crèmes", labelEn: "Creams", count: 8 },
  { label: "Lotions", labelEn: "Lotions", count: 6 },
  { label: "Savons", labelEn: "Soaps", count: 9 },
  { label: "Coffrets", labelEn: "Gift sets", count: 4 },
  { label: "Huiles", labelEn: "Oils", count: 5 },
];
