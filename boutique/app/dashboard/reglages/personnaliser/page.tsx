import PersonnaliserBoutique from "../../../components/dashboard-reglages/PersonnaliserBoutique";

/*
  Route à part pour l'éditeur "Personnaliser ma boutique" (plutôt qu'un
  simple state dans dashboard/reglages/page.tsx) : même raison que
  dashboard/produits/ajouter/page.tsx — une actualisation du navigateur ici
  doit rester ici, et l'éditeur a besoin de toute la largeur de l'écran,
  sans le rail de navigation ni l'en-tête habituels du dashboard.
*/
export default function PersonnaliserBoutiquePage() {
  return <PersonnaliserBoutique />;
}
