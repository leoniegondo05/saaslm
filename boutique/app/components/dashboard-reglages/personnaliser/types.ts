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
*/

export type SectionGroupe = "Haut de page" | "Produit" | "Commande" | "Contenu" | "Bas de page";

export type SectionId =
  | "bandeau"
  | "entete"
  | "galerie"
  | "infos"
  | "offres"
  | "formulaire"
  | "paiement"
  | "avis"
  | "faq"
  | "vendu-par"
  | "pied-de-page";

export type SectionDef = {
  id: SectionId;
  label: string;
  labelEn: string;
  groupe: SectionGroupe;
  groupeEn: string;
  /** Ne se masque pas (cf. section "Les règles" de la maquette) : la
   *  case à cocher de visibilité est remplacée par un cadenas. */
  verrouillee?: boolean;
};

export const SECTIONS_DEFAUT: SectionDef[] = [
  { id: "bandeau", label: "Bandeau d'annonce", labelEn: "Announcement bar", groupe: "Haut de page", groupeEn: "Top of page" },
  { id: "entete", label: "En-tête", labelEn: "Header", groupe: "Haut de page", groupeEn: "Top of page", verrouillee: true },
  { id: "galerie", label: "Galerie · vidéo et photos", labelEn: "Gallery · video and photos", groupe: "Produit", groupeEn: "Product", verrouillee: true },
  { id: "infos", label: "Informations produit", labelEn: "Product information", groupe: "Produit", groupeEn: "Product" },
  { id: "offres", label: "Offres par quantité", labelEn: "Quantity offers", groupe: "Produit", groupeEn: "Product" },
  { id: "formulaire", label: "Formulaire de commande", labelEn: "Order form", groupe: "Commande", groupeEn: "Order", verrouillee: true },
  { id: "paiement", label: "Paiement et livraison", labelEn: "Payment and delivery", groupe: "Commande", groupeEn: "Order", verrouillee: true },
  { id: "avis", label: "Avis clients", labelEn: "Customer reviews", groupe: "Contenu", groupeEn: "Content" },
  { id: "faq", label: "Questions fréquentes", labelEn: "Frequently asked questions", groupe: "Contenu", groupeEn: "Content" },
  { id: "vendu-par", label: "Vendu par", labelEn: "Sold by", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true },
  { id: "pied-de-page", label: "Pied de page", labelEn: "Footer", groupe: "Bas de page", groupeEn: "Bottom of page", verrouillee: true },
];

export type SectionState = { id: SectionId; visible: boolean };

export const SECTIONS_ETAT_DEFAUT: SectionState[] = SECTIONS_DEFAUT.map((s) => ({ id: s.id, visible: true }));

export type ModeleId = "eclat" | "epure" | "nuit" | "marche";

export const MODELES: { id: ModeleId; nom: string; nomEn: string; fond: string; texte: string; accent: string }[] = [
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
  modele: "eclat",
  apparence: "clair",
  couleurPrincipale: "#EC0C8C",
  couleurFond: "#FFFFFF",
  couleurTexte: "#1D1724",
  arrondi: 12,
  boutonForme: "arrondi",
  boutonRemplissage: "plein",
};

export type BandeauState = {
  message: string;
  defilement: "fixe" | "tour-a-tour" | "continu";
};

export type EnteteState = {
  nomAvecLogo: boolean;
  positionLogo: "gauche" | "centre";
  recherche: boolean;
  panier: boolean;
  compte: boolean;
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

export type EditeurState = {
  sections: SectionState[];
  style: StyleState;
  bandeau: BandeauState;
  entete: EnteteState;
  galerie: GalerieState;
  infos: InfosState;
  offres: OffresState;
  formulaire: FormulaireState;
  paiement: PaiementApercuState;
  avis: AvisApercuState;
  faq: FaqApercuState;
  piedDePage: PiedDePageState;
};

export const ETAT_DEFAUT: EditeurState = {
  sections: SECTIONS_ETAT_DEFAUT,
  style: STYLE_DEFAUT,
  bandeau: { message: "Nouvelle gamme de soins disponible", defilement: "tour-a-tour" },
  entete: { nomAvecLogo: true, positionLogo: "gauche", recherche: true, panier: true, compte: false },
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
