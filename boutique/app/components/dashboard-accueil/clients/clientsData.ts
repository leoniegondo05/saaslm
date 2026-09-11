export type TypeAchat = "stockage" | "dropshipping" | "les-deux";

export interface KpiItem {
  id: string;
  labelFr: string;
  labelEn: string;
  valeur: string;
  evolutionFr?: string;
  evolutionEn?: string;
  evolutionColor?: string;
  sousLabelFr?: string;
  sousLabelEn?: string;
}

export interface RfSegment {
  id: string;
  titreFr: string;
  titreEn: string;
  count: number;
  partChiffreFr?: string;
  partChiffreEn?: string;
  descriptionFr: string;
  descriptionEn: string;
  badgeTone?: "success" | "info" | "warn" | "danger" | "neutral";
  statutActionFr?: string;
  statutActionEn?: string;
  color: string;
  bubbleX: number; // 0-100%
  bubbleY: number; // 0-100%
  bubbleSize: number; // px
}

export interface SemaineCroissance {
  semaine: string;
  nouveaux: number;
  reviennent: number;
}

export interface ProduitEntree {
  id: string;
  nom: string;
  type: "S" | "D"; // Stockage ou Dropshipping
  clientsEntres: number;
  tauxRetour: number; // %
  produitDeuxiemeAchatNom: string;
  produitDeuxiemeAchatType?: "S" | "D";
  produitDeuxiemeAchatPct?: number;
}

export interface ClientSurveillance {
  numero: string;
  commandes: number;
  refus: number;
  dernierMotifFr: string;
  dernierMotifEn: string;
  actionFr: string;
  actionEn: string;
  actionTone: "danger" | "warn" | "neutral";
}

// Données Communes (Géographie)
export interface CommuneData {
  nom: string;
  reachat: number; // %
  clients: number;
  panier: string;
}

// Données Canaux d'Acquisition
export interface CanalAcquisition {
  nomFr: string;
  nomEn: string;
  clients: number;
  coutClient: string;
  reviennent: number; // %
  valeur: string;
  isOrganique?: boolean;
}

// Données Relation par segment
export interface SegmentQualityRow {
  id: string;
  titreFr: string;
  titreEn: string;
  decroche: string;
  decrocheTone?: "ok" | "warn" | "danger";
  confirme: string;
  recoit: string;
  recoitTone?: "ok" | "warn" | "danger";
  litige: string;
  litigeTone?: "ok" | "danger";
  paieAvance: string;
  paieAvanceTone?: "ok" | "warn";
  produitsConnus: string;
}

// Action à faire aujourd'hui
export interface ActionAujourdhui {
  id: string;
  titreFr: string;
  titreEn: string;
  descriptionFr: string;
  descriptionEn: string;
  boutonFr: string;
  boutonEn: string;
  typeIcone: "danger" | "warn" | "info";
  boutonStyle?: "primary" | "secondary";
  tagD?: boolean;
}

// ── DONNÉES DE RÉFÉRENCE ──

export const KPIS_CLIENTS: KpiItem[] = [
  {
    id: "clients-fichier",
    labelFr: "CLIENTS AU FICHIER",
    labelEn: "TOTAL REGISTERED CUSTOMERS",
    valeur: "387",
    evolutionFr: "+99 sur la période",
    evolutionEn: "+99 over the period",
    evolutionColor: "text-[#10b981]",
  },
  {
    id: "actifs",
    labelFr: "ACTIFS",
    labelEn: "ACTIVE CUSTOMERS",
    valeur: "198",
    sousLabelFr: "achat de moins de 90 jours",
    sousLabelEn: "purchased within 90 days",
    evolutionColor: "text-[#10b981]",
  },
  {
    id: "valeur-client",
    labelFr: "VALEUR D'UN CLIENT",
    labelEn: "CUSTOMER LIFETIME VALUE",
    valeur: "27 100F",
    sousLabelFr: "sur toute sa vie",
    sousLabelEn: "over their full lifetime",
  },
  {
    id: "cout-acquisition",
    labelFr: "COÛT POUR L'ACQUÉRIR",
    labelEn: "ACQUISITION COST",
    valeur: "3 462F",
    evolutionFr: "rapport de 7,8 pour 1",
    evolutionEn: "7.8 to 1 ratio",
    evolutionColor: "text-[#10b981]",
  },
  {
    id: "reviennent",
    labelFr: "REVIENNENT",
    labelEn: "RETENTION RATE",
    valeur: "18,2 %",
    sousLabelFr: "réseau : 24 %",
    sousLabelEn: "network benchmark: 24%",
    evolutionColor: "text-[#f59e0b]",
  },
  {
    id: "a-relancer",
    labelFr: "À RELANCER",
    labelEn: "TO RE-ENGAGE",
    valeur: "104",
    sousLabelFr: "dormants récupérables",
    sousLabelEn: "recoverable dormant customers",
    evolutionColor: "text-[#f59e0b]",
  },
];

export const SEGMENTS_RF: RfSegment[] = [
  {
    id: "champions",
    titreFr: "Champions",
    titreEn: "Champions",
    count: 18,
    partChiffreFr: "24 % du chiffre",
    partChiffreEn: "24% of revenue",
    descriptionFr: "Trois achats ou plus, le dernier ce mois. À traiter en priorité sur tout.",
    descriptionEn: "Three or more purchases, the latest this month. Top priority above all.",
    color: "#10b981",
    bubbleX: 74,
    bubbleY: 34,
    bubbleSize: 32,
  },
  {
    id: "fideles",
    titreFr: "Fidèles",
    titreEn: "Loyal",
    count: 34,
    partChiffreFr: "27 % du chiffre",
    partChiffreEn: "27% of revenue",
    descriptionFr: "Deux achats, réguliers. Le socle de la boutique.",
    descriptionEn: "Two purchases, regular. The core foundation of your store.",
    color: "#38bdf8",
    bubbleX: 58,
    bubbleY: 48,
    bubbleSize: 40,
  },
  {
    id: "nouveaux-prometteurs",
    titreFr: "Nouveaux prometteurs",
    titreEn: "Promising Newcomers",
    count: 99,
    partChiffreFr: "19 % du chiffre",
    partChiffreEn: "19% of revenue",
    descriptionFr: "Premier achat ce mois. Le second se joue dans les cinq semaines.",
    descriptionEn: "First purchase this month. Second purchase happens within five weeks.",
    color: "#a78bfa",
    bubbleX: 78,
    bubbleY: 72,
    bubbleSize: 64,
  },
  {
    id: "a-reveiller",
    titreFr: "À réveiller",
    titreEn: "Needs Reawakening",
    count: 104,
    partChiffreFr: "dormants",
    partChiffreEn: "dormant",
    descriptionFr: "Achetaient bien, rien depuis trois à six mois. Récupérables.",
    descriptionEn: "Used to buy well, nothing in 3 to 6 months. Recoverable.",
    color: "#f59e0b",
    statutActionFr: "Récupérables.",
    statutActionEn: "Recoverable.",
    bubbleX: 42,
    bubbleY: 52,
    bubbleSize: 66,
  },
  {
    id: "en-train-de-partir",
    titreFr: "En train de partir",
    titreEn: "Churn Risk",
    count: 47,
    partChiffreFr: "signal faible",
    partChiffreEn: "weak signal",
    descriptionFr: "Fréquence en baisse. Encore joignables, bientôt plus.",
    descriptionEn: "Declining frequency. Still reachable, but not for long.",
    color: "#fb923c",
    bubbleX: 47,
    bubbleY: 38,
    bubbleSize: 44,
  },
  {
    id: "perdus",
    titreFr: "Perdus",
    titreEn: "Lost Customers",
    count: 85,
    partChiffreFr: "plus de 6 mois",
    partChiffreEn: "over 6 months ago",
    descriptionFr: "Un achat, jamais revenus. Ne rien dépenser dessus.",
    descriptionEn: "Single purchase, never returned. Spend zero ad budget here.",
    color: "#f43f5e",
    bubbleX: 26,
    bubbleY: 70,
    bubbleSize: 58,
  },
];

export const CROISSANCE_SEMAINES: SemaineCroissance[] = [
  { semaine: "Sem. 1", nouveaux: 28, reviennent: 4 },
  { semaine: "Sem. 2", nouveaux: 34, reviennent: 6 },
  { semaine: "Sem. 3", nouveaux: 26, reviennent: 5 },
  { semaine: "Sem. 4", nouveaux: 38, reviennent: 8 },
  { semaine: "Sem. 5", nouveaux: 32, reviennent: 6 },
  { semaine: "Sem. 6", nouveaux: 45, reviennent: 9 },
  { semaine: "Sem. 7", nouveaux: 39, reviennent: 8 },
  { semaine: "Sem. 8", nouveaux: 50, reviennent: 12 },
  { semaine: "Sem. 9", nouveaux: 42, reviennent: 9 },
  { semaine: "Sem. 10", nouveaux: 58, reviennent: 16 },
  { semaine: "Sem. 11", nouveaux: 46, reviennent: 11 },
  { semaine: "Sem. 12", nouveaux: 48, reviennent: 12 },
];

export const PRODUITS_ENTREE: ProduitEntree[] = [
  {
    id: "serum-eclat",
    nom: "Sérum éclat 30 ml",
    type: "S",
    clientsEntres: 118,
    tauxRetour: 26,
    produitDeuxiemeAchatNom: "Beurre de karité",
    produitDeuxiemeAchatType: "S",
    produitDeuxiemeAchatPct: 61,
  },
  {
    id: "beurre-karite",
    nom: "Beurre de karité 200 g",
    type: "S",
    clientsEntres: 64,
    tauxRetour: 22,
    produitDeuxiemeAchatNom: "Sérum éclat",
    produitDeuxiemeAchatType: "S",
    produitDeuxiemeAchatPct: 54,
  },
  {
    id: "huile-ricin",
    nom: "Huile de ricin 100 ml",
    type: "D",
    clientsEntres: 52,
    tauxRetour: 14,
    produitDeuxiemeAchatNom: "Beurre de karité",
    produitDeuxiemeAchatType: "S",
    produitDeuxiemeAchatPct: 43,
  },
  {
    id: "sac-cabas",
    nom: "Sac cabas en raphia",
    type: "D",
    clientsEntres: 31,
    tauxRetour: 6,
    produitDeuxiemeAchatNom: "Aucun produit dominant",
  },
  {
    id: "sandales",
    nom: "Sandales tressées",
    type: "S",
    clientsEntres: 23,
    tauxRetour: 4,
    produitDeuxiemeAchatNom: "Aucun produit dominant",
  },
];

export const CLIENTS_SURVEILLANCE: ClientSurveillance[] = [
  {
    numero: "Numéro •••• 4417",
    commandes: 4,
    refus: 4,
    dernierMotifFr: "Annulé à l'appel",
    dernierMotifEn: "Cancelled on call",
    actionFr: "Achat direct seulement",
    actionEn: "Prepaid only",
    actionTone: "danger",
  },
  {
    numero: "Numéro •••• 2208",
    commandes: 3,
    refus: 2,
    dernierMotifFr: "Injoignable",
    dernierMotifEn: "Unreachable",
    actionFr: "Appeler avant d'expédier",
    actionEn: "Call before shipping",
    actionTone: "neutral",
  },
  {
    numero: "Numéro •••• 9134",
    commandes: 5,
    refus: 2,
    dernierMotifFr: "A changé d'avis",
    dernierMotifEn: "Changed their mind",
    actionFr: "Surveiller",
    actionEn: "Monitor",
    actionTone: "neutral",
  },
];

export const COMMUNES_DATA: CommuneData[] = [
  { nom: "Cocody", reachat: 26, clients: 108, panier: "22 400" },
  { nom: "Marcory", reachat: 22, clients: 61, panier: "19 800" },
  { nom: "Treichville", reachat: 19, clients: 44, panier: "18 100" },
  { nom: "Yopougon", reachat: 14, clients: 89, panier: "16 900" },
  { nom: "Abobo", reachat: 11, clients: 57, panier: "15 400" },
  { nom: "Bouaké", reachat: 7, clients: 28, panier: "14 200" },
];

export const CANAUX_ACQUISITION: CanalAcquisition[] = [
  { nomFr: "Publicité Meta", nomEn: "Meta Ads", clients: 46, coutClient: "4 043F", reviennent: 16, valeur: "24 800F" },
  { nomFr: "Publicité TikTok", nomEn: "TikTok Ads", clients: 38, coutClient: "3 737F", reviennent: 15, valeur: "23 100F" },
  { nomFr: "Publicité Google", nomEn: "Google Ads", clients: 14, coutClient: "4 571F", reviennent: 24, valeur: "29 600F" },
  { nomFr: "Publicité YouTube", nomEn: "YouTube Ads", clients: 4, coutClient: "5 000F", reviennent: 18, valeur: "21 400F" },
  { nomFr: "Organique", nomEn: "Organic", clients: 19, coutClient: "0F", reviennent: 31, valeur: "34 200F", isOrganique: true },
];

export const SEGMENTS_QUALITY: SegmentQualityRow[] = [
  {
    id: "champions",
    titreFr: "Champions",
    titreEn: "Champions",
    decroche: "91 %",
    decrocheTone: "ok",
    confirme: "98 %",
    recoit: "97 %",
    recoitTone: "ok",
    litige: "0,4 %",
    litigeTone: "ok",
    paieAvance: "48 %",
    paieAvanceTone: "ok",
    produitsConnus: "2,8",
  },
  {
    id: "fideles",
    titreFr: "Fidèles",
    titreEn: "Loyal",
    decroche: "82 %",
    decrocheTone: "ok",
    confirme: "94 %",
    recoit: "93 %",
    recoitTone: "ok",
    litige: "1,1 %",
    paieAvance: "31 %",
    produitsConnus: "2,1",
  },
  {
    id: "nouveaux",
    titreFr: "Nouveaux prometteurs",
    titreEn: "Promising Newcomers",
    decroche: "54 %",
    confirme: "89 %",
    recoit: "80 %",
    recoitTone: "warn",
    litige: "1,9 %",
    paieAvance: "14 %",
    paieAvanceTone: "warn",
    produitsConnus: "1,0",
  },
  {
    id: "reveiller",
    titreFr: "À réveiller",
    titreEn: "Needs Reawakening",
    decroche: "41 %",
    decrocheTone: "warn",
    confirme: "—",
    recoit: "—",
    litige: "2,2 %",
    paieAvance: "18 %",
    produitsConnus: "1,4",
  },
  {
    id: "partir",
    titreFr: "En train de partir",
    titreEn: "Churn Risk",
    decroche: "38 %",
    decrocheTone: "warn",
    confirme: "76 %",
    recoit: "71 %",
    recoitTone: "warn",
    litige: "4,1 %",
    litigeTone: "danger",
    paieAvance: "9 %",
    produitsConnus: "1,2",
  },
  {
    id: "perdus",
    titreFr: "Perdus",
    titreEn: "Lost Customers",
    decroche: "22 %",
    decrocheTone: "danger",
    confirme: "—",
    recoit: "—",
    litige: "5,8 %",
    litigeTone: "danger",
    paieAvance: "4 %",
    produitsConnus: "1,0",
  },
];

export const ACTIONS_AUJOURDHUI: ActionAujourdhui[] = [
  {
    id: "relance-j28",
    titreFr: "31 clients arrivent au jour 28 de leur premier achat",
    titreEn: "31 customers reach day 28 after their 1st order",
    descriptionFr: "La fenêtre du deuxième achat s'ouvre. Six sur dix prennent le beurre de karité après un sérum : c'est ce produit qu'il faut leur proposer, pas le catalogue entier.",
    descriptionEn: "The repeat window opens. 6 out of 10 pick shea butter after serum: propose this exact item, not your whole catalog.",
    boutonFr: "Relancer",
    boutonEn: "Re-engage",
    typeIcone: "danger",
    boutonStyle: "primary",
  },
  {
    id: "valeur-endormie",
    titreFr: "104 dormants, 1 240 000 F de valeur endormie",
    titreEn: "104 dormant accounts, 1,240,000 F dormant value",
    descriptionFr: "Onze pour cent reviennent quand on les relance, soit environ 136 400 F pour le coût d'un message. Commencer par les 34 anciens fidèles de la liste.",
    descriptionEn: "11% return upon outreach, delivering ~136,400 F for the price of an SMS broadcast. Start with the 34 formerly loyal buyers.",
    boutonFr: "Voir la liste",
    boutonEn: "View list",
    typeIcone: "danger",
    boutonStyle: "primary",
  },
  {
    id: "train-de-partir",
    titreFr: "47 clients en train de partir",
    titreEn: "47 customers drifting away",
    descriptionFr: "Leur fréquence baisse mais ils achètent encore. Une attention maintenant coûte moins qu'un réveil dans trois mois.",
    descriptionEn: "Their frequency is slowing but they still purchase. Caring for them now costs much less than reactivating them in three months.",
    boutonFr: "Voir",
    boutonEn: "View",
    typeIcone: "warn",
  },
  {
    id: "faible-fiabilite",
    titreFr: "22 numéros à score de fiabilité très faible",
    titreEn: "22 phone numbers with very low reliability score",
    descriptionFr: "41 800 F de courses non payées sur trente jours. Leur proposer le paiement immédiat plutôt que le paiement à la livraison : s'ils paient, le colis part sans risque ; sinon, aucune course n'a lieu.",
    descriptionEn: "41,800 F in unpaid courier runs over 30 days. Offer upfront prepayment instead of COD: if they pay, dispatch safely; if not, avoid wasted delivery runs.",
    boutonFr: "Voir",
    boutonEn: "View",
    typeIcone: "warn",
  },
  {
    id: "champions-nouveautes",
    titreFr: "18 champions n'ont pas vu vos deux dernières nouveautés",
    titreEn: "18 champions haven't seen your latest two drops",
    descriptionFr: "Quarante et un pour cent de votre chiffre. Panier deux fois et demie plus gros, quatre-vingt-dix-sept pour cent de livraison, la moitié paie déjà d'avance. Les prévenir en premier ne coûte rien et se vend presque toujours.",
    descriptionEn: "41% of your revenue. 2.5x larger basket, 97% delivery success, half prepaying upfront. Giving them priority notice costs zero and almost always converts.",
    boutonFr: "Voir",
    boutonEn: "View",
    typeIcone: "info",
  },
  {
    id: "un-seul-produit",
    titreFr: "291 clients ne connaissent qu'un seul de vos produits",
    titreEn: "291 customers only know a single product",
    descriptionFr: "Un client à trois références vaut trois fois plus et part quatre fois moins. Leur faire découvrir un deuxième produit ne demande ni remise ni publicité.",
    descriptionEn: "A customer knowing 3 SKUs is worth 3x more and churns 4x less. Introducing a second product requires neither discount nor ad spend.",
    boutonFr: "Voir",
    boutonEn: "View",
    typeIcone: "warn",
  },
  {
    id: "gros-panier-refus",
    titreFr: "31 clients à gros panier refusent une fois sur trois",
    titreEn: "31 high-basket customers refuse 1 in 3 deliveries",
    descriptionFr: "Quatorze pour cent du chiffre. Les exclure coûterait plus que leurs refus : c'est sur eux qu'il faut proposer le paiement immédiat.",
    descriptionEn: "14% of revenue. Excluding them costs more than their returns: proactively propose upfront prepayment to secure these transactions.",
    boutonFr: "Voir",
    boutonEn: "View",
    typeIcone: "warn",
  },
  {
    id: "drop-jamais-revenus",
    titreFr: "8 clients entrés par un produit en drop, jamais revenus",
    titreEn: "8 customers acquired via dropshipping who never returned",
    descriptionFr: "Neuf pour cent de réachat de ce côté contre vingt-trois. Leur proposer une fois un de vos propres produits vaut mieux que de les relancer sur le même.",
    descriptionEn: "9% repeat rate here vs 23% in stock. Offering one of your own stocked products works far better than pitching the same drop item.",
    boutonFr: "Voir",
    boutonEn: "View",
    typeIcone: "info",
    tagD: true,
  },
];
