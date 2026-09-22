"use client";

import { useState } from "react";
import type { CartesProduitState, GrilleState, MouvementsState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { CategoriePublique, ProduitPublic } from "@/lib/boutique-types";
import ProduitCard from "./ProduitCard";
import { LienBoutique } from "./PreviewMode";

const COLS_ORDI: Record<GrilleState["colonnesOrdinateur"], string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
};
const COLS_TEL: Record<GrilleState["colonnesTelephone"], string> = { 1: "grid-cols-1", 2: "grid-cols-2" };

const TITRES: Record<GrilleState["montrer"], string> = {
  "meilleures-ventes": "Meilleures ventes",
  nouveautes: "Nouveautés",
  choisis: "Sélection",
};

/*
  Grille de produits — port de la case "grille" : densité compacte/
  confortable et défilement horizontal sur téléphone (`defilementTelephone`)
  en plus du nombre de colonnes déjà géré. `config.montrer` reste affiché
  dans le titre de section (comme dans l'éditeur) mais ne retrie pas la
  liste : ProduitPublic n'a ni compteur de ventes ni date de création (cf.
  rapport de tâche), donc "Meilleures ventes"/"Nouveautés" resteraient un tri
  inventé — les `config.nombre` premiers produits réels s'affichent dans
  leur ordre de stockage, comme avant.
*/
export default function SectionGrille({
  slug,
  produits,
  config,
  cartes,
  mouvements,
  recherche = "",
  categorieActive = null,
}: {
  slug: string;
  produits: ProduitPublic[];
  config: GrilleState;
  cartes: CartesProduitState;
  mouvements: MouvementsState;
  /** Terme tapé dans la barre de recherche du header (`?q=`, cf.
   *  BoutiqueHeader.tsx) — filtre sur le nom du produit avant d'appliquer la
   *  limite `config.nombre`, pour que la recherche porte sur tout le
   *  catalogue et non juste les premiers produits affichés. */
  recherche?: string;
  /** Catégorie sélectionnée via `?cat=` (clic sur une tuile de
   *  SectionCategories) — filtre sur `categorieId` avant d'appliquer la
   *  limite `config.nombre`, comme `recherche` ci-dessus. `null` = "Tout
   *  voir" (aucun filtre), le cas par défaut. */
  categorieActive?: CategoriePublique | null;
}) {
  const [voirTout, setVoirTout] = useState(false);
  const terme = recherche.trim().toLowerCase();
  const filtresRecherche = terme ? produits.filter((p) => p.nom.toLowerCase().includes(terme)) : produits;
  const filtres = categorieActive ? filtresRecherche.filter((p) => p.categorieId === categorieActive.id) : filtresRecherche;
  const tronque = !categorieActive && !terme && filtres.length > config.nombre;
  const liste = voirTout ? filtres : filtres.slice(0, config.nombre);
  const defilement = config.defilementTelephone;
  const espace = cartes.densite === "compacte" ? "gap-2.5" : "gap-4";
  const titre = terme ? `Résultats pour « ${recherche.trim()} »` : categorieActive ? categorieActive.nom : TITRES[config.montrer];

  return (
    <section id="grille" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[21px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
          {titre}
        </h2>
        {categorieActive && (
          <LienBoutique href={`/boutique/${slug}#grille`} className="shrink-0 text-[13.5px] font-medium hover:underline" style={{ color: "var(--ac)" }}>
            Tout voir
          </LienBoutique>
        )}
        {tronque && !voirTout && (
          <button
            type="button"
            onClick={() => setVoirTout(true)}
            className="shrink-0 text-[13.5px] font-medium hover:underline"
            style={{ color: "var(--ac)" }}
          >
            Tout voir
          </button>
        )}
      </div>
      {liste.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border border-dashed border-[var(--tx)]/20 px-6 py-16 text-center" style={{ borderRadius: "var(--card-rad)" }}>
          {terme ? (
            <p className="text-[15px] font-semibold">Aucun produit pour « {recherche.trim()} »</p>
          ) : categorieActive ? (
            <p className="text-[15px] font-semibold">Aucun produit dans « {categorieActive.nom} »</p>
          ) : (
            <>
              <p className="text-[15px] font-semibold">Cette boutique prépare ses produits</p>
              <p className="text-[13.5px] text-[var(--tx)]/55">Revenez bientôt pour découvrir la sélection.</p>
            </>
          )}
        </div>
      ) : (
        <>
          {defilement && (
            <div className={`flex ${espace} overflow-x-auto pb-1 sm:hidden`}>
              {liste.map((p) => (
                <div key={p.id} className="w-40 shrink-0">
                  <ProduitCard slug={slug} produit={p} grille={config} cartes={cartes} mouvements={mouvements} />
                </div>
              ))}
            </div>
          )}
          <div className={`${defilement ? "hidden sm:grid" : "grid"} ${espace} ${COLS_TEL[config.colonnesTelephone]} ${COLS_ORDI[config.colonnesOrdinateur]}`}>
            {liste.map((p) => (
              <ProduitCard key={p.id} slug={slug} produit={p} grille={config} cartes={cartes} mouvements={mouvements} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
