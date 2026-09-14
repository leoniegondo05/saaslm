import type { AccueilTab } from "./AccueilNav";

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
