import type { BoutiqueDonnees } from "@/lib/boutique-types";
import { boutonCommandeFond } from "@/lib/boutique-style";
import BoutiqueHeader from "./BoutiqueHeader";
import SectionPiedDePage from "./SectionPiedDePage";
import CommandeClient from "./CommandeClient";
import CheminNavigation from "./CheminNavigation";
import ElementsFlottants from "./ElementsFlottants";

/*
  Corps de la page de commande/paiement — extrait de app/boutique/[slug]/
  commande/page.tsx, même raison que AccueilContenu.tsx (partagé avec
  app/boutique/[slug]/apercu/commande/page.tsx).
*/
export default function CommandeContenu({ donnees, slug }: { donnees: BoutiqueDonnees; slug: string }) {
  const visible = donnees.editeur.sections.find((s) => s.id === "chemin-navigation")?.visible ?? true;

  return (
    <>
      <BoutiqueHeader slug={slug} identite={donnees.identite} entete={donnees.editeur.entete} page="commande" />
      {visible && (
        <div data-section-id="chemin-navigation">
          <CheminNavigation slug={slug} boutiqueNom={donnees.identite.nom} page="Commande" />
        </div>
      )}
      <div data-section-id="paiement">
        <CommandeClient slug={slug} produits={donnees.produits} editeur={donnees.editeur} />
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
      <ElementsFlottants
        flottants={{ ...donnees.editeur.flottants, boutonCommandeTelephone: false }}
        montrerBarreCommande={false}
        lienCommande={`/boutique/${slug}/commande`}
        boutonTexte={donnees.editeur.paiement.boutonTexte}
        boutonFond={boutonCommandeFond(donnees.editeur)}
      />
    </>
  );
}
