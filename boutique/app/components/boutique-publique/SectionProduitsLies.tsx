import type { CartesProduitState, GrilleState, MouvementsState, ProduitsLiesState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { ProduitPublic } from "@/lib/boutique-types";
import ProduitCard from "./ProduitCard";

const COLS_ORDI: Record<ProduitsLiesState["colonnesOrdinateur"], string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };
const COLS_TEL: Record<ProduitsLiesState["colonnesTelephone"], string> = { 1: "grid-cols-1", 2: "grid-cols-2" };

/*
  "Vous aimerez aussi" — port de la case "produits-lies" : réglages propres
  (colonnes, nombre, étoiles, favoris, bouton), distincts de ceux de la
  grille de l'accueil, cf. ProduitsLiesState dans types.ts.
  `choisirSelon: "meme-rayon"` s'appuie sur categorieId (donnée réelle) ;
  "meilleures-ventes" retombe sur le même pool faute de compteur de ventes
  réel (cf. même limite que SectionGrille.tsx).
*/
export default function SectionProduitsLies({
  slug,
  produits,
  produitActuelId,
  categorieId,
  config,
  cartes,
  mouvements,
}: {
  slug: string;
  produits: ProduitPublic[];
  produitActuelId: string;
  categorieId: string | null;
  config: ProduitsLiesState;
  cartes: CartesProduitState;
  mouvements: MouvementsState;
}) {
  const pool =
    config.choisirSelon === "meme-rayon" && categorieId
      ? produits.filter((p) => p.categorieId === categorieId && p.id !== produitActuelId)
      : produits.filter((p) => p.id !== produitActuelId);
  const liste = pool.slice(0, config.nombre);
  if (liste.length === 0) return null;

  const grilleConfig: Pick<GrilleState, "noteEtoiles" | "bouton" | "coeurFavoris" | "badges" | "prixAffiche"> = {
    noteEtoiles: config.noteEtoiles,
    coeurFavoris: config.coeurFavoris,
    bouton: config.bouton,
    badges: true,
    prixAffiche: "en-ligne",
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h2 className="mb-5 text-[19px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
        Vous aimerez aussi
      </h2>
      <div className={`grid gap-4 ${COLS_TEL[config.colonnesTelephone]} ${COLS_ORDI[config.colonnesOrdinateur]}`}>
        {liste.map((p) => (
          <ProduitCard key={p.id} slug={slug} produit={p} grille={grilleConfig} cartes={cartes} mouvements={mouvements} />
        ))}
      </div>
    </section>
  );
}
