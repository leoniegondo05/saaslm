import { LienBoutique } from "./PreviewMode";
import type { CategoriesState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { CategoriePublique, ProduitPublic } from "@/lib/boutique-types";
import { texteAvecChiffres } from "@/lib/boutique-format";

const COLS_TEL: Record<CategoriesState["colonnesTelephone"], string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  defilement: "grid-flow-col auto-cols-[42%] overflow-x-auto snap-x snap-mandatory sm:grid-flow-row sm:auto-cols-auto sm:overflow-visible",
};
const COLS_ORDI: Record<CategoriesState["colonnesOrdinateur"], string> = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

/*
  Catégories réelles (donnees.categories, pas de mock) — port de la case
  "categories" : vraie photo du premier produit de la catégorie (au lieu
  d'une pastille à l'initiale) quand disponible, forme ronde/carrée, compteur
  produits, et défilement horizontal sur téléphone (`colonnesTelephone ===
  "defilement"`). CategoriePublique n'a toujours pas de champ image propre —
  utiliser la photo d'un produit réel de la catégorie reste plus fidèle
  qu'une image inventée ou qu'un champ ajouté sans écran pour le renseigner.
*/
export default function SectionCategories({
  slug,
  categories,
  produits,
  config,
}: {
  slug: string;
  categories: CategoriePublique[];
  produits: ProduitPublic[];
  config: CategoriesState;
}) {
  if (!categories.length) return null;
  const rond = config.formeImages === "rond";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[21px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
          {config.titre || "Nos catégories"}
        </h2>
        {config.lienToutVoir && (
          <LienBoutique href={`/boutique/${slug}#grille`} className="shrink-0 text-[13.5px] font-medium hover:underline" style={{ color: "var(--ac)" }}>
            Tout voir
          </LienBoutique>
        )}
      </div>
      <div className={`grid gap-3 pb-1 ${COLS_TEL[config.colonnesTelephone]} ${COLS_ORDI[config.colonnesOrdinateur]}`}>
        {categories.map((cat) => {
          const produitsCategorie = produits.filter((p) => p.categorieId === cat.id);
          const photo = produitsCategorie.find((p) => p.images[0])?.images[0];
          const nombre = produitsCategorie.length;
          return (
            <LienBoutique
              key={cat.id}
              href={`/boutique/${slug}?cat=${cat.id}#grille`}
              className="group flex snap-start flex-col items-center gap-2 p-2.5 text-center transition hover:opacity-90"
            >
              <div
                className="flex aspect-square w-full items-center justify-center overflow-hidden"
                style={{
                  background: "color-mix(in srgb, var(--ac) 12%, transparent)",
                  color: "var(--ac)",
                  borderRadius: rond ? "999px" : "var(--card-rad)",
                }}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <span className="text-[21px] font-bold">{cat.nom.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="text-[13px] font-medium leading-tight">{cat.nom}</span>
              {config.nombreProduits && (
                <span className="text-[11.5px] text-[var(--tx)]/50">{texteAvecChiffres(`${nombre} produit${nombre > 1 ? "s" : ""}`)}</span>
              )}
            </LienBoutique>
          );
        })}
      </div>
    </section>
  );
}
