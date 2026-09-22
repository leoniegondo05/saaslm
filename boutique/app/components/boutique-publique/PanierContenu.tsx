import type { BoutiqueDonnees } from "@/lib/boutique-types";
import BoutiqueHeader from "./BoutiqueHeader";
import SectionPiedDePage from "./SectionPiedDePage";
import PanierClient from "./PanierClient";

/*
  Corps de la page panier — extrait de app/boutique/[slug]/panier/page.tsx,
  même raison que AccueilContenu.tsx.
*/
export default function PanierContenu({ donnees, slug }: { donnees: BoutiqueDonnees; slug: string }) {
  return (
    <>
      <BoutiqueHeader slug={slug} identite={donnees.identite} entete={donnees.editeur.entete} page="commande" />
      <div data-section-id="panier">
        <PanierClient slug={slug} produits={donnees.produits} editeur={donnees.editeur} />
      </div>
      <div data-section-id="pied-de-page">
        <SectionPiedDePage
          slug={slug}
          identite={donnees.identite}
          piedDePage={donnees.editeur.piedDePage}
          style={donnees.editeur.style}
          grandeImage={donnees.editeur.grandeImage}
          avis={donnees.avis}
        />
      </div>
    </>
  );
}
