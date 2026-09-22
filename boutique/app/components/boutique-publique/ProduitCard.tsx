"use client";

import { useRef, useState } from "react";
import type { CartesProduitState, GrilleState, MouvementsState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { ProduitPublic } from "@/lib/boutique-types";
import { LuHeart, LuImage, LuPlus, LuShoppingCart } from "react-icons/lu";
import { useCart } from "./CartProvider";
import { LienBoutique } from "./PreviewMode";
import { volerVersPanier } from "./volerVersPanier";

const EFFET_SURVOL: Record<MouvementsState["effetSurvol"], string> = {
  aucun: "",
  soulever: "transition duration-200 hover:-translate-y-1 hover:shadow-[var(--card-shadow)]",
  zoom: "transition duration-200",
};

/*
  Carte produit — grille d'accueil (SectionGrille.tsx) et "Vous aimerez
  aussi" (ProduitsLies.tsx) — port de CarteProduit dans BoutiquePreview.tsx :
  style ombre/bordure/sans-cadre, densité confortable/compacte, cœur
  favoris (état visiteur local, pas persisté — même choix que l'éditeur),
  badge "Nouveauté" (produits sans encore d'avis, seule donnée réelle
  disponible pour approcher "pas encore de ventes" — pas de champ
  `vosVentes30j`/date de création côté ProduitPublic donc pas de badge
  "Meilleure vente" inventé ici, cf. rapport de tâche), effet de survol
  (`mouvements.effetSurvol`).
*/
export default function ProduitCard({
  slug,
  produit,
  grille,
  cartes,
  mouvements,
}: {
  slug: string;
  produit: ProduitPublic;
  grille: Pick<GrilleState, "noteEtoiles" | "bouton" | "coeurFavoris" | "badges" | "prixAffiche">;
  cartes: CartesProduitState;
  mouvements: MouvementsState;
}) {
  const { ajouter } = useCart();
  const [ajoute, setAjoute] = useState(false);
  const [favori, setFavori] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const image = produit.images[0];
  const enPromo = produit.prixNormal != null && produit.prixNormal > produit.prix;
  const rupture = produit.stock <= 0;
  const nouveau = grille.badges && (produit.avisCount ?? 0) === 0;

  function handleAjouter(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (rupture) return;
    volerVersPanier(imageRef.current);
    ajouter(produit.id, 1);
    setAjoute(true);
    setTimeout(() => setAjoute(false), 1400);
  }

  function basculerFavori(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavori((v) => !v);
  }

  const rayonCarte = cartes.style === "sans-cadre" ? 0 : "var(--card-rad)";
  const paddingTexte = cartes.densite === "compacte" ? "p-2" : "p-3.5";

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden ${cartes.style === "bordure" ? "border border-[var(--tx)]/10" : ""} ${EFFET_SURVOL[mouvements.effetSurvol]}`}
      style={{ borderRadius: rayonCarte, boxShadow: cartes.style === "ombre" ? "var(--card-shadow)" : undefined, background: cartes.style !== "sans-cadre" ? "var(--tx)/[.015]" : undefined }}
    >
      <LienBoutique
        href={`/boutique/${slug}/produit/${produit.id}`}
        className="relative block overflow-hidden bg-[var(--tx)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ac)]"
        style={{ aspectRatio: cartes.densite === "compacte" ? "6/5" : "1/1" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imageRef}
            src={image}
            alt={produit.nom}
            className={`h-full w-full object-cover ${mouvements.effetSurvol === "zoom" ? "transition duration-300 group-hover:scale-110" : "transition duration-300 group-hover:scale-105"}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--tx)]/25">
            <LuImage size={40} />
          </div>
        )}
        {grille.badges && (enPromo || nouveau) && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white"
            style={{ background: nouveau && !enPromo ? "linear-gradient(100deg,#6B21D6,#3A1D8A)" : "var(--ac)" }}
          >
            {enPromo ? "Promo" : "Nouveauté"}
          </span>
        )}
        {grille.coeurFavoris && (
          <button
            type="button"
            onClick={basculerFavori}
            aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={favori}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition"
            style={{ background: favori ? "var(--ac)" : "rgba(255,255,255,0.85)" }}
          >
            <LuHeart color={favori ? "#fff" : "var(--ac)"} size={14} />
          </button>
        )}
        {rupture && <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[12px] font-semibold text-white">Rupture de stock</span>}
      </LienBoutique>
      <div className={`flex flex-1 flex-col gap-1.5 ${paddingTexte}`}>
        <LienBoutique href={`/boutique/${slug}/produit/${produit.id}`} className="text-[14px] font-medium leading-snug hover:underline">
          {produit.nom}
        </LienBoutique>
        {grille.noteEtoiles && produit.note != null && (
          <div className="flex items-center gap-1 text-[12px] text-[var(--tx)]/55">
            <span aria-hidden style={{ color: "var(--ac)" }}>★</span>
            <span>{produit.note.toFixed(1)}</span>
            <span>· {produit.avisCount} avis</span>
          </div>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-[15px] font-bold">{produit.prix.toLocaleString("fr-FR")} F</span>
          {enPromo && <span className="text-[12.5px] text-[var(--tx)]/40 line-through">{produit.prixNormal!.toLocaleString("fr-FR")} F</span>}
        </div>
        {grille.bouton !== "aucun" && (
          <button
            type="button"
            onClick={handleAjouter}
            disabled={rupture}
            className="mt-2 inline-flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ac)]"
            style={{ background: "var(--ac)", borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
            aria-label={grille.bouton === "icone" ? `Ajouter ${produit.nom} au panier` : undefined}
          >
            {rupture ? "Indisponible" : ajoute ? "Ajouté !" : grille.bouton === "icone" ? (
              <LuPlus size={16} />
            ) : (
              <>
                <LuShoppingCart size={15} />
                Ajouter au panier
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
