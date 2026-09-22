import type { BoutiqueDonnees, ProduitPublic } from "@/lib/boutique-types";
import { boutonCommandeFond } from "@/lib/boutique-style";
import BoutiqueHeader from "./BoutiqueHeader";
import SectionPiedDePage from "./SectionPiedDePage";
import ProduitDetailClient from "./ProduitDetailClient";
import CheminNavigation from "./CheminNavigation";
import SectionOngletsDetails from "./SectionOngletsDetails";
import SectionAvis from "./SectionAvis";
import SectionProduitsLies from "./SectionProduitsLies";
import SectionVenduPar from "./SectionVenduPar";
import ElementsFlottants from "./ElementsFlottants";

/*
  Corps de la fiche produit — extrait de app/boutique/[slug]/produit/
  [produitId]/page.tsx, même raison que AccueilContenu.tsx (partagé entre la
  vraie route et app/boutique/[slug]/apercu/produit/[produitId]/page.tsx).
*/
export default function ProduitContenu({ donnees, slug, produit }: { donnees: BoutiqueDonnees; slug: string; produit: ProduitPublic }) {
  const { editeur, avis } = donnees;
  const visible = (id: string) => editeur.sections.find((s) => s.id === id)?.visible ?? true;
  const avisProduit = avis.filter((a) => !a.produitId || a.produitId === produit.id);

  return (
    <>
      <BoutiqueHeader slug={slug} identite={donnees.identite} entete={editeur.entete} page="commande" />
      {visible("chemin-navigation") && (
        <div data-section-id="chemin-navigation">
          <CheminNavigation slug={slug} boutiqueNom={donnees.identite.nom} page={produit.nom} />
        </div>
      )}
      <div data-section-id="galerie">
        <ProduitDetailClient slug={slug} produit={produit} editeur={editeur} />
      </div>
      {visible("onglets-details") && (
        <div data-section-id="onglets-details">
          <SectionOngletsDetails config={editeur.ongletsDetails} produit={produit} />
        </div>
      )}
      {visible("avis") && (
        <div data-section-id="avis">
          <SectionAvis avis={avisProduit} config={editeur.avis} couleurEtoiles={editeur.style.etoilesCouleur === "principale" ? "var(--ac)" : "#F2A93B"} produits={donnees.produits} />
        </div>
      )}
      {visible("produits-lies") && (
        <div data-section-id="produits-lies">
          <SectionProduitsLies
            slug={slug}
            produits={donnees.produits}
            produitActuelId={produit.id}
            categorieId={produit.categorieId}
            config={editeur.produitsLies}
            cartes={editeur.cartesProduit}
            mouvements={editeur.mouvements}
          />
        </div>
      )}
      {visible("vendu-par") && (
        <div data-section-id="vendu-par">
          <SectionVenduPar identite={donnees.identite} />
        </div>
      )}
      <div data-section-id="pied-de-page">
        <SectionPiedDePage slug={slug} identite={donnees.identite} piedDePage={editeur.piedDePage} style={editeur.style} grandeImage={editeur.grandeImage} avis={avis} />
      </div>
      <ElementsFlottants
        flottants={editeur.flottants}
        montrerBarreCommande={true}
        lienCommande={`/boutique/${slug}/commande`}
        boutonTexte={editeur.paiement.boutonTexte}
        boutonFond={boutonCommandeFond(editeur)}
      />
    </>
  );
}
