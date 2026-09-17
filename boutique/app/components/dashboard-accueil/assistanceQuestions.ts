import type { AccueilTab } from "./AccueilNav";
import type { ReglagesTab } from "../dashboard-reglages/ReglagesNav";

/*
  Questions que "solution LM" (badge devenu bouton dans DashboardHeader,
  cf. AssistanceLMModal.tsx) peut répondre depuis l'onglet Accueil — une
  liste par section, groundée sur les seules données réellement affichées
  par ce composant (même règle que l'ancien bloc "assistance IA" de
  CommandesSection.tsx, dont ce fichier reprend et étend le principe).

  Chiffres statiques tant que l'API Laravel n'expose pas ces endpoints,
  cf. mémoire [[dashboard-mock-data-pending-laravel-api]] — chaque question
  ci-dessous se répond avec un chiffre qui existe déjà dans la section
  correspondante (FinancesSection.tsx, CommandesSection.tsx, etc.), aucune
  n'invente une donnée absente de l'écran.
*/

export type AssistanceQuestion = { fr: string; en: string };

export const ASSISTANCE_QUESTIONS: Record<AccueilTab, AssistanceQuestion[]> = {
  Finances: [
    { fr: "Combien vais-je avoir de disponible dans 30 jours ?", en: "How much will I have available in 30 days?" },
    { fr: "Pourquoi mon argent reste-t-il suspendu 72 heures ?", en: "Why is my money held for 72 hours?" },
    { fr: "Le stockage me rapporte-t-il vraiment plus que le dropshipping ?", en: "Does warehousing really earn me more than dropshipping?" },
    { fr: "Quelle publicité me rapporte le plus par franc dépensé ?", en: "Which ad channel returns the most per franc spent?" },
    { fr: "Combien me coûtent mes refus, à l'appel et à la porte ?", en: "How much do my refusals cost me, on the call and at the door?" },
    { fr: "Quel produit me fait perdre de l'argent ?", en: "Which product is losing me money?" },
    { fr: "Combien d'argent ai-je immobilisé en ce moment ?", en: "How much money do I have tied up right now?" },
    { fr: "Combien de temps met mon argent à revenir en stockage management ?", en: "How long does my money take to come back in warehousing?" },
    { fr: "Où se situe mon seuil de rentabilité publicitaire ?", en: "Where's my ad break-even threshold?" },
    { fr: "Ma marge de contribution tient-elle après publicité et logistique ?", en: "Does my contribution margin hold after ads and logistics?" },
    { fr: "Quand dois-je réapprovisionner sans casser ma trésorerie ?", en: "When should I restock without breaking my cash flow?" },
    { fr: "Quelle part de mon résultat net part en commission LM et en abonnement ?", en: "How much of my net result goes to LM commission and subscription?" },
  ],
  Commandes: [
    { fr: "Pourquoi Abobo refuse plus que Cocody ?", en: "Why does Abobo refuse more than Cocody?" },
    { fr: "Combien me coûtent les clients injoignables ?", en: "How much do unreachable customers cost me?" },
    { fr: "À quelle heure dois-je faire appeler ?", en: "What time should I have calls made?" },
    { fr: "Le dropshipping se refuse-t-il plus que mon stock ?", en: "Does drop-shipping get refused more than my own stock?" },
    { fr: "Quel jour dois-je pousser ma publicité ?", en: "Which day should I push my ads?" },
    { fr: "Combien vaut un client qui revient ?", en: "What's a returning customer worth?" },
    { fr: "Où est-ce que je perds le plus, la transformation ou la livraison ?", en: "Where do I lose the most, conversion or delivery?" },
    { fr: "Dois-je continuer à livrer Bouaké ?", en: "Should I keep delivering to Bouaké?" },
    { fr: "Pourquoi mes gros paniers ne se livrent pas ?", en: "Why don't my large baskets get delivered?" },
    { fr: "Quand dois-je relancer un client qui a acheté une fois ?", en: "When should I follow up with a one-time buyer?" },
    { fr: "Suis-je au-dessus ou en dessous des autres boutiques ?", en: "Am I above or below other shops?" },
    { fr: "Quelle référence va manquer avant samedi ?", en: "Which item will run out before Saturday?" },
    { fr: "Mes litiges viennent-ils du produit ou de l'emballage ?", en: "Do my disputes come from the product or the packaging?" },
    { fr: "Combien vaut dix minutes gagnées sur le délai d'appel ?", en: "What's ten minutes saved on call delay worth?" },
  ],
  Clients: [
    { fr: "Combien de mes clients reviennent, et en combien de temps ?", en: "How many of my customers come back, and how fast?" },
    { fr: "Qui sont mes clients à risque, et pourquoi les rappeler avant d'expédier ?", en: "Who are my at-risk customers, and why call before shipping?" },
    { fr: "Quel est mon meilleur client, et combien vaut-il ?", en: "Who's my best customer, and what's their value?" },
    { fr: "Qui dois-je relancer aujourd'hui, et avec quel produit ?", en: "Who should I re-engage today, and with which product?" },
    { fr: "Combien vaut un client, et combien me coûte-t-il ?", en: "How much is a customer worth, and what do they cost?" },
    { fr: "Quelle commune a le panier moyen le plus élevé ?", en: "Which district has the highest average basket?" },
    { fr: "Pourquoi mes clients de Bouaké ne reviennent-ils pas ?", en: "Why aren't my Bouaké customers returning?" },
    { fr: "Quel canal amène les meilleurs clients ?", en: "Which channel brings the highest-value customers?" },
    { fr: "Combien de chiffre dort dans mon fichier ?", en: "How much dormant revenue is sleeping in my customer base?" },
    { fr: "Est-ce que je recrute plus que je ne fidélise ?", en: "Am I acquiring more than I am retaining?" },
    { fr: "Que pensent mes clients de moi, note et derniers avis ?", en: "What do my customers think of me, rating and latest reviews?" },
    { fr: "Quelle part de mes clients laisse un avis ?", en: "What share of my customers leaves a review?" },
    { fr: "Combien de clients achètent plusieurs articles à la fois ?", en: "How many customers buy several items at once?" },
    { fr: "Combien de temps avant qu'un client fasse son deuxième achat ?", en: "How long before a customer makes their second purchase?" },
  ],
  Litiges: [
    { fr: "D'où viennent vraiment mes litiges ?", en: "Where do my disputes really come from?" },
    { fr: "Qu'est-ce qui est de ma faute, et qu'est-ce qui relève du partenaire ?", en: "What's my fault, and what's on the partner?" },
    { fr: "Combien me coûtent mes litiges sur six mois ?", en: "How much have my disputes cost me over six months?" },
    { fr: "Que puis-je exiger de mon partenaire, avec quels chiffres ?", en: "What can I demand from my partner, with which numbers?" },
    { fr: "Est-ce que mes clients reviennent après un litige ?", en: "Do my customers come back after a dispute?" },
    { fr: "En combien de temps dois-je répondre pour garder le client ?", en: "How fast do I need to respond to keep the customer?" },
    { fr: "Le drop me fait-il plus de litiges que mon stock ?", en: "Does drop-shipping bring me more disputes than my own stock?" },
    { fr: "Mon délai de litige de 72 heures est-il le bon ?", en: "Is my 72-hour dispute window the right one?" },
    { fr: "Suis-je meilleur ou moins bon que les autres boutiques ?", en: "Am I better or worse than other shops?" },
    { fr: "Vaut-il mieux remplacer ou rembourser ?", en: "Is it better to replace or refund?" },
    { fr: "Quel geste réduirait le plus mes litiges ?", en: "Which move would cut my disputes the most?" },
    { fr: "Quelles références concentrent le plus de litiges ?", en: "Which items concentrate the most disputes?" },
  ],
  Stock: [
    { fr: "Que dois-je déposer jeudi, et pour combien ?", en: "What should I deposit Thursday, and for how much?" },
    { fr: "Quelles références vont périmer avant d'être vendues ?", en: "Which items will expire before they sell?" },
    { fr: "Combien m'ont coûté mes ruptures ce mois-ci ?", en: "How much did my stockouts cost me this month?" },
    { fr: "Qu'est-ce que mes clients cherchent et que je n'ai pas ?", en: "What are customers searching for that I don't have?" },
    { fr: "Pourquoi Bouaké casse-t-il autant ?", en: "Why does Bouaké break so much?" },
    { fr: "Mes retours sont-ils encore vendables ?", en: "Are my returns still sellable?" },
    { fr: "Quelle référence immobilise le plus longtemps mon argent ?", en: "Which item ties up my money the longest?" },
    { fr: "Puis-je vendre plus sans acheter de stock ?", en: "Can I sell more without buying stock?" },
    { fr: "Quelle demande recule et laquelle accélère ?", en: "Which demand is falling, and which is accelerating?" },
    { fr: "À partir de quel niveau dois-je recommander le sérum ?", en: "At what level should I reorder the serum?" },
    { fr: "Combien puis-je réclamer à mon fournisseur ?", en: "How much can I claim from my supplier?" },
    { fr: "Est-ce que je surstocke quelque chose ?", en: "Am I overstocking something?" },
  ],
  Produits: [
    { fr: "Quelle référence dois-je arrêter ?", en: "Which item should I stop selling?" },
    { fr: "Qu'est-ce que je peux vendre plus cher sans perdre de ventes ?", en: "What can I price higher without losing sales?" },
    { fr: "Quelles tailles dois-je recommander au prochain dépôt ?", en: "Which sizes should I reorder at the next deposit?" },
    { fr: "Pourquoi mes sandales se refusent-elles autant ?", en: "Why do my sandals get refused so much?" },
    { fr: "Combien de stock dort dans l'entrepôt ?", en: "How much stock is sitting dormant in the warehouse?" },
    { fr: "Quelles références vont manquer avant dix jours ?", en: "Which items will run out within ten days?" },
    { fr: "Le partenaire a-t-il encore du stock sur ce que je vends ?", en: "Does the partner still have stock on what I sell?" },
    { fr: "Mes prix sont-ils dans le marché ?", en: "Are my prices in line with the market?" },
    { fr: "Quels produits mériteraient plus de publicité ?", en: "Which products deserve more ad spend?" },
    { fr: "Une fiche complète vend-elle vraiment mieux ?", en: "Does a complete listing really sell better?" },
    { fr: "Le dropshipping se refuse-t-il plus que mon stock ?", en: "Does drop-shipping get refused more than my own stock?" },
    { fr: "Quelles références encombrent ma page pour rien ?", en: "Which items clutter my page for nothing?" },
    { fr: "Quel produit est en fin de course ?", en: "Which product is winding down?" },
  ],
  Partenaire: [
    { fr: "Mon partenaire tient-il ses engagements ?", en: "Is my partner honoring its commitments?" },
    { fr: "Combien me coûte-t-il vraiment, tout compris ?", en: "What does it really cost me, all in?" },
    { fr: "Que puis-je lui demander, et avec quels chiffres ?", en: "What can I ask for, and with which numbers?" },
    { fr: "Suis-je aussi bien servi que ses autres boutiques ?", en: "Am I served as well as its other shops?" },
    { fr: "Quelle note dois-je lui donner ce mois-ci, et pourquoi ?", en: "What rating should I give it this month, and why?" },
    { fr: "Mes évaluations passées ont-elles produit un effet ?", en: "Have my past ratings had any effect?" },
    { fr: "Lequel de ses trois sites me pénalise ?", en: "Which of its three sites is holding me back?" },
    { fr: "Sa performance progresse-t-elle ou stagne-t-elle ?", en: "Is its performance improving or stalling?" },
    { fr: "Quelles demandes attendent encore une réponse ?", en: "Which requests are still waiting for a reply?" },
    { fr: "Quand puis-je discuter de sa grille ?", en: "When can I discuss its rate card?" },
    { fr: "Qu'est-ce qui est de sa responsabilité dans mes litiges ?", en: "What is its share of responsibility in my disputes?" },
    { fr: "Que se passe-t-il si je mets fin à l'affiliation ?", en: "What happens if I end the affiliation?" },
  ],
};

/*
  Vue "Tout" (aucun onglet actif) et pages hors Accueil (pas de section
  active à faire correspondre) : brief condensé, les 2 premières questions
  — les plus importantes, tri déjà volontaire dans chaque liste ci-dessus —
  de chacune des 7 sections plutôt que la liste complète (~70+ questions,
  illisible en un panneau). Recalculé à chaque appel, une seule source.
*/
export function getAssistanceBrief(): { tab: AccueilTab; questions: AssistanceQuestion[] }[] {
  return (Object.keys(ASSISTANCE_QUESTIONS) as AccueilTab[]).map((tab) => ({
    tab,
    questions: ASSISTANCE_QUESTIONS[tab].slice(0, 2),
  }));
}

/*
  Mêmes principes que ASSISTANCE_QUESTIONS ci-dessus, mais pour les 6
  fiches de l'onglet Réglages (voir ReglagesNav.tsx et
  app/dashboard/reglages/page.tsx) — chaque question se répond avec un
  champ ou un texte déjà affiché sur la fiche correspondante (MaBoutique.tsx,
  PageDeCommande.tsx, FinancesReglements.tsx, ReglesDeVente.tsx,
  Abonnement.tsx, Confidentialite.tsx), aucune donnée inventée, même règle
  que le reste du dashboard, cf. [[dashboard-mock-data-pending-laravel-api]].
*/
/*
  "Ma boutique" n'est plus une fiche de l'onglet Réglages (retour
  utilisateur du 2026-09-17 : accessible uniquement via le logo boutique du
  header, voir app/dashboard/ma-boutique/page.tsx) — questions sorties de
  REGLAGES_ASSISTANCE_QUESTIONS vers sa propre liste, même mécanique que
  DEMANDES_ASSISTANCE_QUESTIONS / PARTENAIRE_AGREE_ASSISTANCE_QUESTIONS
  ci-dessous (page sans onglet → `pageQuestions`/`pageLabel`).
*/
export const MA_BOUTIQUE_ASSISTANCE_QUESTIONS: AssistanceQuestion[] = [
  { fr: "Qui fixe les jours et heures de passage du livreur ?", en: "Who sets the courier's pickup days and times?" },
  { fr: "À quoi sert l'adresse d'enlèvement ?", en: "What's the pickup address used for?" },
  { fr: "Où s'affiche le logo de ma boutique une fois déposé ?", en: "Where does my shop logo show up once uploaded?" },
  { fr: "Quel est mon secteur d'activité principal ?", en: "What's my main business sector?" },
  { fr: "Ma boutique est-elle actuellement ouverte aux clients ?", en: "Is my shop currently open to customers?" },
];

export const REGLAGES_ASSISTANCE_QUESTIONS: Record<ReglagesTab, AssistanceQuestion[]> = {
  commande: [
    { fr: "Quels formats puis-je choisir pour le lien de ma page de commande ?", en: "Which formats can I pick for my order page link?" },
    { fr: "Quel délai de livraison s'affiche toujours sur ma page, et puis-je le changer ?", en: "What delivery time always shows on my page, and can I change it?" },
    { fr: "Le prix affiché inclut-il les frais de livraison ?", en: "Does the displayed price include delivery fees?" },
    { fr: "Quels moyens de paiement sont actifs sur ma page en ce moment ?", en: "Which payment methods are active on my page right now?" },
    { fr: "Où se règle l'apparence de ma page de commande ?", en: "Where do I set the look of my order page?" },
  ],
  finances: [
    { fr: "Puis-je choisir où je reçois mon argent selon le moyen de paiement du client ?", en: "Can I choose where I receive money based on the customer's payment method?" },
    { fr: "À quoi sert ma carte de prélèvement, et quand est-elle débitée ?", en: "What's my payment card for, and when is it charged?" },
    { fr: "Changer ma devise convertit-il les montants déjà enregistrés ?", en: "Does changing my currency convert amounts already recorded?" },
    { fr: "Un reçu est-il envoyé automatiquement à mes clients ?", en: "Is a receipt sent to my customers automatically?" },
    { fr: "Est-ce que je reçois un export mensuel de mes ventes ?", en: "Do I get a monthly export of my sales?" },
  ],
  "regles-vente": [
    { fr: "Pourquoi la vidéo est-elle obligatoire pour publier un produit ?", en: "Why is video required to publish a product?" },
    { fr: "Combien de photos minimum dois-je fournir par produit ?", en: "How many photos minimum do I need per product?" },
    { fr: "Sous quel seuil de marge un produit ne peut-il pas être publié ?", en: "Below what margin can a product not be published?" },
    { fr: "Quel est le délai minimum que je dois laisser à un client pour ouvrir un litige ?", en: "What's the minimum window I must give a customer to open a dispute?" },
    { fr: "Qui fixe le taux de protection contre le vol et la perte de mes colis ?", en: "Who sets the theft-and-loss protection rate for my parcels?" },
  ],
  abonnement: [
    { fr: "Combien je paie d'abonnement chaque mois, et à qui ?", en: "How much subscription do I pay each month, and to whom?" },
    { fr: "Dois-je payer l'abonnement même sans aucune vente ?", en: "Do I owe the subscription even with no sales at all?" },
    { fr: "Que se passe-t-il si je désactive le prélèvement automatique ?", en: "What happens if I turn off automatic payment?" },
    { fr: "Si je résilie, est-ce que je perds mon rattachement à mon partenaire ?", en: "If I cancel, do I lose my attachment to my partner?" },
    { fr: "Mes dépôts de stock, que dois-je en faire avant la fin de mon abonnement ?", en: "What must I do with my stock deposits before my subscription ends?" },
  ],
  confidentialite: [
    { fr: "Mon partenaire agréé peut-il contacter mes clients directement ?", en: "Can my approved partner contact my customers directly?" },
    { fr: "Quelles informations sur moi le client voit-il toujours, sans pouvoir les masquer ?", en: "What information about me does the customer always see, unable to be hidden?" },
    { fr: "Que devient un client que j'efface à sa demande ?", en: "What happens to a customer I erase on request?" },
    { fr: "Qu'est-ce qui est inclus dans l'export de mes données ?", en: "What's included in my data export?" },
    { fr: "Où puis-je corriger mon téléphone ou mon email affichés au client ?", en: "Where can I correct the phone or email shown to the customer?" },
  ],
};

export function getReglagesAssistanceBrief(): { tab: ReglagesTab; questions: AssistanceQuestion[] }[] {
  return (Object.keys(REGLAGES_ASSISTANCE_QUESTIONS) as ReglagesTab[]).map((tab) => ({
    tab,
    questions: REGLAGES_ASSISTANCE_QUESTIONS[tab].slice(0, 2),
  }));
}

/*
  Mêmes principes que ci-dessus, mais pour deux pages hors Accueil/Réglages
  qui n'ont pas d'onglets (DashboardHeader y était monté sans prop, donc
  "solution LM" retombait sur le briefing des 7 sections Accueil — retour
  utilisateur du 2026-09-16 : questions doivent parler de CETTE page).
  Une seule liste chacune (pas de brief à raccourcir, pas de sous-onglet),
  groundée sur les seules données affichées par le composant correspondant :
  DemandesModules.tsx (règles des 72h/9h de litige, chiffres des trois
  modules Litiges/Questions/Support) et PartenaireAgree.tsx (PARTENAIRE,
  PROCHAIN_PRODUIT) — même règle [[dashboard-mock-data-pending-laravel-api]].
*/
export const DEMANDES_ASSISTANCE_QUESTIONS: AssistanceQuestion[] = [
  { fr: "Combien de temps ai-je pour ouvrir un litige après réception par le client ?", en: "How long do I have to open a dispute after the customer receives the order?" },
  { fr: "En combien de temps mon partenaire doit-il prendre un litige en main ?", en: "How fast must my partner take a dispute in hand?" },
  { fr: "Combien d'argent est bloqué en ce moment par mes litiges ?", en: "How much money is held right now by my disputes?" },
  { fr: "Quelle part de mes litiges se solde par un remplacement obtenu ?", en: "What share of my disputes end with an exchange granted?" },
  { fr: "Combien de temps met un litige à être tranché en moyenne ?", en: "How long does a dispute take to settle on average?" },
  { fr: "Une question au partenaire bloque-t-elle mon argent ou mon stock ?", en: "Does a question to my partner block my money or my stock?" },
  { fr: "Combien de questions ai-je posées à mon partenaire depuis le début, et combien ont eu réponse ?", en: "How many questions have I asked my partner since the start, and how many got answered?" },
  { fr: "Combien de temps met mon partenaire à répondre à une question ?", en: "How long does my partner take to answer a question?" },
  { fr: "Qui répond quand je signale un problème technique, LM ou le partenaire ?", en: "Who replies when I report a technical problem, LM or the partner?" },
  { fr: "Combien de signalements techniques ai-je faits, et combien sont déjà corrigés ?", en: "How many technical reports have I filed, and how many are already fixed?" },
  { fr: "Quelle différence entre un litige, une question et un signalement ?", en: "What's the difference between a dispute, a question and a report?" },
  { fr: "Combien de temps LM met-il à corriger un problème signalé, en moyenne ?", en: "How long does LM take to fix a reported problem, on average?" },
];

export const COMMANDES_ASSISTANCE_QUESTIONS: AssistanceQuestion[] = [
  { fr: "Combien de commandes ai-je reçues sur la période affichée ?", en: "How many orders did I receive over the shown period?" },
  { fr: "Combien d'argent est réellement encaissé, net des retenues ?", en: "How much money is actually collected, net of withholdings?" },
  { fr: "Combien d'argent reste suspendu en attente de résolution ?", en: "How much money stays suspended pending resolution?" },
  { fr: "Qu'est-ce qui retient une commande, la logistique ou l'opération ?", en: "What withholds part of an order, logistics or operation?" },
  { fr: "Combien de commandes sont en ce moment en litige ?", en: "How many orders are currently in dispute?" },
  { fr: "Que devient l'argent d'une commande en litige tant qu'il n'est pas tranché ?", en: "What happens to a disputed order's money until it's settled?" },
  { fr: "Quelle différence entre changement de colis, retour de fonds et gain de cause ?", en: "What's the difference between parcel exchange, funds returned and ruled in my favor?" },
  { fr: "Combien de temps après la livraison mon argent devient-il disponible ?", en: "How long after delivery does my money become available?" },
  { fr: "Qu'est-ce qu'une commande relancée, et bloque-t-elle mon argent ?", en: "What's a relaunched order, and does it block my money?" },
  { fr: "Comment se répartissent mes commandes entre en cours, livrée, refusée, litige et relancée ?", en: "How are my orders split between in progress, delivered, refused, disputed and relaunched?" },
  { fr: "Quelle est la différence entre ce que le client a payé et ce qui m'est réellement versé ?", en: "What's the difference between what the customer paid and what I'm actually paid out?" },
  { fr: "Par quelles étapes passe une commande avant la livraison ?", en: "What stages does an order go through before delivery?" },
];

export const PARTENAIRE_AGREE_ASSISTANCE_QUESTIONS: AssistanceQuestion[] = [
  { fr: "Quelle note mon partenaire a-t-il sur le réseau ?", en: "What rating does my partner have on the network?" },
  { fr: "Depuis quand suis-je affilié à mon partenaire ?", en: "Since when am I affiliated with my partner?" },
  { fr: "Combien coûte l'abonnement mensuel de mon partenaire ?", en: "How much is my partner's monthly subscription?" },
  { fr: "Combien coûtent les frais logistiques par commande ?", en: "How much are the logistics fees per order?" },
  { fr: "L'emballage est-il inclus dans les frais logistiques ?", en: "Is packaging included in the logistics fees?" },
  { fr: "Combien coûte la garantie perte, et est-elle obligatoire ?", en: "How much does loss protection cost, and is it mandatory?" },
  { fr: "Combien coûte la livraison express chez mon partenaire ?", en: "How much does express delivery cost with my partner?" },
  { fr: "Combien d'entrepôts et de villes couvre mon partenaire ?", en: "How many warehouses and cities does my partner cover?" },
  { fr: "Combien d'engins de distribution mon partenaire possède-t-il ?", en: "How many delivery vehicles does my partner own?" },
  { fr: "Quel est le délai moyen de livraison de mon partenaire ?", en: "What's my partner's average delivery lead time?" },
  { fr: "Quel est le prochain produit à venir chez mon partenaire, et quand ?", en: "What's the next product coming to my partner, and when?" },
  { fr: "Mon partenaire est-il certifié et visité par LM ?", en: "Is my partner certified and visited by LM?" },
];
