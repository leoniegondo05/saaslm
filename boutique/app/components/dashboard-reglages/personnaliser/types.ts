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

export type SectionGroupe = "Haut de page" | "Produit" | "Commande" | "Contenu" | "Bas de page";

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
  | "pied-de-page";

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
};

// Ordre unique qui, une fois filtré par page, reproduit exactement l'ordre
// de chaque page de la maquette : filtré sur "commande" (+ "les-deux") on
// retombe sur l'ordre déjà en place (inchangé) ; filtré sur "accueil" (+
// "les-deux") on retombe sur ann/header/hero/trust/cats/promo/best/
// reviews/faq/eng/footer de `defaults().order.home`.
export const SECTIONS_DEFAUT: SectionDef[] = [
  { id: "bandeau", label: "Bandeau d'annonce", labelEn: "Announcement bar", groupe: "Haut de page", groupeEn: "Top of page", page: "les-deux" },
  { id: "entete", label: "En-tête", labelEn: "Header", groupe: "Haut de page", groupeEn: "Top of page", verrouillee: true, page: "les-deux" },
  { id: "grande-image", label: "Grande image", labelEn: "Hero image", groupe: "Haut de page", groupeEn: "Top of page", verrouillee: true, page: "accueil" },
  { id: "confiance", label: "Barre de confiance", labelEn: "Trust bar", groupe: "Contenu", groupeEn: "Content", page: "accueil" },
  { id: "categories", label: "Catégories", labelEn: "Categories", groupe: "Contenu", groupeEn: "Content", page: "accueil" },
  { id: "promo", label: "Bannière d'offre", labelEn: "Offer banner", groupe: "Contenu", groupeEn: "Content", page: "accueil" },
  { id: "grille", label: "Grille de produits", labelEn: "Product grid", groupe: "Contenu", groupeEn: "Content", page: "accueil" },
  { id: "galerie", label: "Galerie · vidéo et photos", labelEn: "Gallery · video and photos", groupe: "Produit", groupeEn: "Product", verrouillee: true, page: "commande" },
  { id: "infos", label: "Informations produit", labelEn: "Product information", groupe: "Produit", groupeEn: "Product", page: "commande" },
  { id: "offres", label: "Offres par quantité", labelEn: "Quantity offers", groupe: "Produit", groupeEn: "Product", page: "commande" },
  { id: "formulaire", label: "Formulaire de commande", labelEn: "Order form", groupe: "Commande", groupeEn: "Order", verrouillee: true, page: "commande" },
  { id: "paiement", label: "Paiement et livraison", labelEn: "Payment and delivery", groupe: "Commande", groupeEn: "Order", verrouillee: true, page: "commande" },
  { id: "avis", label: "Avis clients", labelEn: "Customer reviews", groupe: "Contenu", groupeEn: "Content", page: "les-deux" },
  { id: "faq", label: "Questions fréquentes", labelEn: "Frequently asked questions", groupe: "Contenu", groupeEn: "Content", page: "les-deux" },
  { id: "engagements", label: "Engagements", labelEn: "Commitments", groupe: "Contenu", groupeEn: "Content", page: "accueil" },
  { id: "vendu-par", label: "Vendu par", labelEn: "Sold by", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true, page: "commande" },
  { id: "pied-de-page", label: "Pied de page", labelEn: "Footer", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true, page: "les-deux" },
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

export const SECTIONS_ETAT_DEFAUT: SectionState[] = SECTIONS_DEFAUT.map((s) => ({
  id: s.id,
  visible: true,
  largeur: "page",
  marges: "moyennes",
  couleurs: "claires",
  visibleTelephone: true,
  visibleOrdinateur: true,
}));

export type ModeleId = "halo" | "eclat" | "epure" | "nuit" | "marche";

// "Halo" en premier et par défaut (STYLE_DEFAUT plus bas) : modèle vedette
// de la maquette fournie — grande image en dégradé, courbes lumineuses,
// pied de page nuit. Palette propre à ce modèle (pas les tokens LM du
// tableau de bord), comme les autres lignes de ce tableau.
export const MODELES: { id: ModeleId; nom: string; nomEn: string; fond: string; texte: string; accent: string }[] = [
  { id: "halo", nom: "Halo", nomEn: "Halo", fond: "#FCF6FA", texte: "#0B0E1C", accent: "#E8207E" },
  { id: "eclat", nom: "Éclat", nomEn: "Radiance", fond: "#FFFFFF", texte: "#1D1724", accent: "#EC0C8C" },
  { id: "epure", nom: "Épure", nomEn: "Bare", fond: "#F6F4EF", texte: "#222222", accent: "#222222" },
  { id: "nuit", nom: "Nuit", nomEn: "Night", fond: "#15101D", texte: "#FFFFFF", accent: "#EC0C8C" },
  { id: "marche", nom: "Marché", nomEn: "Market", fond: "#FFF5E6", texte: "#3B2A1A", accent: "#E07A1F" },
];

export type BoutonForme = "carre" | "arrondi" | "pilule";
export type BoutonRemplissage = "plein" | "contour" | "degrade";

export type StyleState = {
  modele: ModeleId;
  apparence: "clair" | "sombre";
  couleurPrincipale: string;
  couleurFond: string;
  couleurTexte: string;
  arrondi: number; // px, cartes/champs
  boutonForme: BoutonForme;
  boutonRemplissage: BoutonRemplissage;
};

export const STYLE_DEFAUT: StyleState = {
  modele: "halo",
  apparence: "clair",
  couleurPrincipale: "#E8207E",
  couleurFond: "#FCF6FA",
  couleurTexte: "#0B0E1C",
  arrondi: 18,
  boutonForme: "pilule",
  boutonRemplissage: "plein",
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
  disposition: "liste" | "grille" | "carrousel";
  nombreAffiches: number;
  premierePhotoGalerie: boolean;
};

export type FaqItem = { question: string; reponse: string; ouverte?: boolean };

export type FaqApercuState = {
  premiereOuverte: boolean;
  items: FaqItem[];
};

export type PiedDePageState = {
  presentation: boolean;
  liens: boolean;
  reseaux: boolean;
  moyensPaiement: boolean;
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

export type ConfianceState = {
  nombre: 3 | 4;
};

export type CategoriesState = {
  colonnes: number; // 3 à 6
};

export type PromoState = {
  cote: "gauche" | "droite";
  compteur: boolean;
};

export type GrilleState = {
  colonnes: number; // 3 à 5
  nombre: number; // 2 à 6
};

export type EngagementsState = {
  nombre: number; // 2 à 4
};

export type EditeurState = {
  sections: SectionState[];
  style: StyleState;
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
};

export const ETAT_DEFAUT: EditeurState = {
  sections: SECTIONS_ETAT_DEFAUT,
  style: STYLE_DEFAUT,
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
  confiance: { nombre: 4 },
  categories: { colonnes: 5 },
  promo: { cote: "gauche", compteur: true },
  grille: { colonnes: 4, nombre: 4 },
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
  avis: { disposition: "liste", nombreAffiches: 6, premierePhotoGalerie: true },
  engagements: { nombre: 4 },
  faq: {
    premiereOuverte: true,
    items: [
      { question: "Comment appliquer le sérum ?", reponse: "Deux à trois gouttes matin et soir, sur une peau propre, avant la crème.", ouverte: true },
      { question: "Convient-il aux peaux sensibles ?", reponse: "Formule douce, sans parfum, testée dermatologiquement." },
      { question: "Puis-je payer à la livraison ?", reponse: "Oui, le paiement à la livraison est proposé sur cette page." },
    ],
  },
  piedDePage: {
    presentation: true,
    liens: true,
    reseaux: true,
    moyensPaiement: true,
    mentionBas: "© 2026 Awa Beauté",
  },
};

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
