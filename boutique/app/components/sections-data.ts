// Ce fichier centralise le "badge" et le titre de chaque grande section de
// la page d'accueil. On les réutilise à deux endroits :
//   1) en haut de chaque section, comme sur la maquette Figma ;
//   2) dans la barre de navigation flottante (voir Navbar.tsx), qui affiche
//      automatiquement le titre de la section actuellement visible à
//      l'écran pendant que l'utilisateur fait défiler la page.
export type SectionInfo = {
  id: string;
  title: string;
  subtitle?: string;
};

export const sections: SectionInfo[] = [
  {
    id: "hero",
    title: "Toute votre logistique e-commerce",
    subtitle: "Une seule plateforme.",
  },
  {
    id: "comment-ca-marche",
    title: "Tout commence par une idée",
    subtitle: "Donnez-lui un espace pour grandir.",
  },
  {
    id: "flux-financiers",
    title: "Vos flux financiers se simplifient",
  },
  {
    id: "un-continent",
    title: "Un continent, des millions d'opportunités",
    subtitle: "Nous construisons les connexions.",
  },
  {
    id: "commerce-digital",
    title: "Le commerce digital orchestré de bout en bout",
  },
  {
    id: "cta",
    title: "Votre voyage commence ici",
  },
];
