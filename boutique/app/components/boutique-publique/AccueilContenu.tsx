import { SECTIONS_DEFAUT } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { SectionState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { BoutiqueDonnees } from "@/lib/boutique-types";
import { boutonCommandeFond } from "@/lib/boutique-style";
import BoutiqueHeader from "./BoutiqueHeader";
import SectionBandeau from "./SectionBandeau";
import SectionHero from "./SectionHero";
import SectionConfiance from "./SectionConfiance";
import SectionCategories from "./SectionCategories";
import SectionPromo from "./SectionPromo";
import SectionGrille from "./SectionGrille";
import SectionAvis from "./SectionAvis";
import SectionFaq from "./SectionFaq";
import SectionEngagements from "./SectionEngagements";
import SectionPiedDePage from "./SectionPiedDePage";
import ElementsFlottants from "./ElementsFlottants";

/** `visibleTelephone`/`visibleOrdinateur` n'ont de sens qu'en CSS ici (pas
 *  de détection d'appareil côté serveur) : on masque au lieu de retirer du
 *  DOM, pour que le rendu reste correct aux deux tailles sans dépendre du
 *  JS. `contents` (jamais `block`) : ce wrapper ne doit former aucune boîte —
 *  sinon il devient le containing block du header sticky (BoutiqueHeader) et
 *  le piège dans sa propre hauteur (~76px), qui se décroche du scroll après
 *  quelques dizaines de pixels au lieu de rester fixé (retour utilisateur :
 *  "le navbar doit rester fixé au scroll"). `contents` garde le show/hide
 *  responsive sans ajouter de boîte. */
function classeVisibilite(section: SectionState): string {
  if (!section.visibleTelephone) return "hidden md:contents";
  if (!section.visibleOrdinateur) return "contents md:hidden";
  return "contents";
}

/*
  Corps de la page d'accueil — extrait de app/boutique/[slug]/page.tsx pour
  être rendu à la fois par cette page (données lues côté serveur via
  lireBoutique) et par app/boutique/[slug]/apercu/page.tsx (données reçues
  par postMessage du dashboard, cf. rapport de tâche "aperçu = même code que
  le site public"). `data-section-id` sur chaque wrapper : point d'ancrage
  pour le survol/sélection de section de l'éditeur (Phase B, pas encore
  câblée), inoffensif sur le site public.
*/
export default function AccueilContenu({
  donnees,
  slug,
  recherche = "",
  categorieActiveId = null,
}: {
  donnees: BoutiqueDonnees;
  slug: string;
  recherche?: string;
  categorieActiveId?: string | null;
}) {
  const { editeur, produits, categories, identite, avis } = donnees;

  const sectionsAccueil = editeur.sections.filter((s) => {
    if (!s.visible) return false;
    const def = SECTIONS_DEFAUT.find((d) => d.id === s.id);
    return !!def && (def.page === "accueil" || def.page === "les-deux");
  });

  const produitVedette = produits.find((p) => p.images[0]) ?? produits[0];
  const produitsNotes = produits.filter((p) => p.note != null);
  const noteMoyenne = produitsNotes.length ? produitsNotes.reduce((s, p) => s + (p.note ?? 0), 0) / produitsNotes.length : null;
  const avisCountTotal = produits.reduce((s, p) => s + (p.avisCount ?? 0), 0);
  const couleurEtoiles = editeur.style.etoilesCouleur === "principale" ? "var(--ac)" : "#F2A93B";

  let precedentId: string | null = null;

  return (
    <>
      {sectionsAccueil.map((section) => {
        let contenu: React.ReactNode;
        switch (section.id) {
          case "bandeau":
            contenu = <SectionBandeau bandeau={editeur.bandeau} />;
            break;
          case "entete":
            contenu = (
              <BoutiqueHeader slug={slug} identite={identite} entete={editeur.entete} page="accueil" rechercheInitiale={recherche} />
            );
            break;
          case "grande-image":
            contenu = (
              <SectionHero
                slug={slug}
                hero={editeur.grandeImage}
                style={editeur.style}
                remiseEnLignePct={editeur.paiement.remiseEnLignePct}
                produitVedette={produitVedette}
                noteMoyenne={noteMoyenne}
                avisCount={avisCountTotal}
              />
            );
            break;
          case "confiance":
            contenu = <SectionConfiance confiance={editeur.confiance} chevaucheActif={editeur.confiance.chevaucheGrandeImage && precedentId === "grande-image"} />;
            break;
          case "categories":
            contenu = <SectionCategories slug={slug} categories={categories} produits={produits} config={editeur.categories} />;
            break;
          case "promo":
            contenu = <SectionPromo slug={slug} promo={editeur.promo} produitVedette={produitVedette} />;
            break;
          case "grille":
            contenu = (
              <SectionGrille
                slug={slug}
                produits={produits}
                config={editeur.grille}
                cartes={editeur.cartesProduit}
                mouvements={editeur.mouvements}
                recherche={recherche}
                categorieActive={categories.find((c) => c.id === categorieActiveId) ?? null}
              />
            );
            break;
          case "avis":
            contenu = <SectionAvis avis={avis} config={editeur.avis} couleurEtoiles={couleurEtoiles} produits={produits} slug={slug} />;
            break;
          case "faq":
            contenu = <SectionFaq faq={editeur.faq} />;
            break;
          case "engagements":
            contenu = <SectionEngagements engagements={editeur.engagements} />;
            break;
          case "pied-de-page":
            contenu = (
              <SectionPiedDePage slug={slug} identite={identite} piedDePage={editeur.piedDePage} style={editeur.style} grandeImage={editeur.grandeImage} avis={avis} />
            );
            break;
          default:
            // Sections "lib-*" (bibliothèque de blocs libres) : hors périmètre
            // de cette tâche (rendu générique de BoutiquePreview.tsx sans donnée
            // propre) — cf. rapport de tâche.
            precedentId = section.id;
            return null;
        }
        precedentId = section.id;
        return (
          <div key={section.id} data-section-id={section.id} className={classeVisibilite(section)}>
            {contenu}
          </div>
        );
      })}
      <ElementsFlottants
        flottants={editeur.flottants}
        montrerBarreCommande={false}
        lienCommande={`/boutique/${slug}`}
        boutonTexte={editeur.paiement.boutonTexte}
        boutonFond={boutonCommandeFond(editeur)}
      />
    </>
  );
}
