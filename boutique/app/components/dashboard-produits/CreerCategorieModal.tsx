"use client";

import { useEffect, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
import type { Categorie } from "./ajouter-produit/types";

/*
  "Créer une catégorie" (Écran 10 de la maquette "LM · Ajouter un
  produit.html"), atteint depuis le bouton "Ajouter une catégorie" en haut
  de la page Produits (voir ../dashboard-accueil/ProduitsCatalogue.tsx).

  Contrairement à AjouterProduitModal.tsx (qui remplace toute la page),
  ceci est un vrai panneau superposé : la maquette dit explicitement "Le
  panneau s'ouvre par-dessus la page, qui reste visible derrière" — donc
  overlay avec fond assombri, pas un remplacement de contenu.

  Thème clair pour rester cohérent avec le reste du dashboard (la maquette
  d'origine était sombre) — même choix que CreerCollaborateur.tsx,
  cf. mémoire [[dashboard-background-fafcfc]].

  Catégories mock tant que l'API Laravel n'expose pas ce endpoint,
  cf. [[dashboard-mock-data-pending-laravel-api]] — "produits" ci-dessous
  vient du vrai tableau local (compté par ProduitsCatalogue.tsx), pas d'un
  chiffre inventé.
*/

const NOM_MAX = 60;

export default function CreerCategorieModal({
  categories,
  onFermer,
  onCreer,
}: {
  /** Catégories existantes + nombre réel de produits qui leur sont rattachés (compté par l'appelant). */
  categories: (Categorie & { nombreProduits: number })[];
  onFermer: () => void;
  /** Reçoit le nom déjà nettoyé (trim, longueur bornée) au clic "Créer la catégorie". */
  onCreer: (nom: string) => void;
}) {
  const { t } = useDashboardLangue();
  const [nom, setNom] = useState("");

  // Fermeture au clavier (Échap) et sur clic du fond assombri — comportement standard d'un panneau superposé.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  const peutCreer = nom.trim().length > 0;

  const valider = () => {
    const propre = nom.trim().slice(0, NOM_MAX);
    if (!propre) return;
    onCreer(propre);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
      onClick={onFermer}
    >
      {/* stopPropagation : cliquer dans le panneau ne doit pas le fermer, seul le fond assombri le fait. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">{t("Créer une catégorie", "Create a category")}</h2>
          <Tag tone="neutral" className="shrink-0">{t("Visible chez vous seul", "Only visible to you")}</Tag>
        </div>
        <p className="mt-2 text-xs leading-snug text-[var(--dashboard-text)]/50">
          {t(
            "Vos catégories rangent votre boutique et votre page de commande. Elles n'ont rien à voir avec celles du catalogue de votre partenaire.",
            "Your categories organize your shop and your order page. They have nothing to do with your partner's catalog categories."
          )}
        </p>

        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

        <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Nom de la catégorie", "Category name")}</p>
        <input
          autoFocus
          value={nom}
          onChange={(e) => setNom(e.target.value.slice(0, NOM_MAX))}
          onKeyDown={(e) => e.key === "Enter" && valider()}
          placeholder={t("Ex. Enfants", "E.g. Kids")}
          className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
        />

        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

        <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Vos catégories", "Your categories")}</p>
        <div className="mt-1 max-h-48 overflow-y-auto">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 border-b border-[var(--dashboard-text)]/10 py-2 text-xs last:border-0">
              <span className="font-medium">{texteAvecChiffres(t(c.nom, c.nomEn))}</span>
              <span className="shrink-0 text-[var(--dashboard-text)]/40">
                {c.nombreProduits > 0 ? texteAvecChiffres(t(`${c.nombreProduits} produits`, `${c.nombreProduits} products`)) : t("Aucun produit", "No products")}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[9px] leading-snug text-[var(--dashboard-text)]/40">
          {t(
            "Une catégorie sans produit peut être supprimée. Une catégorie qui en contient se renomme, elle ne se supprime pas.",
            "A category with no products can be deleted. One that has products can be renamed, but not deleted."
          )}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onFermer}
            className="flex-1 rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]"
          >
            {t("Annuler", "Cancel")}
          </button>
          <button
            type="button"
            onClick={valider}
            disabled={!peutCreer}
            className="flex-[1.4] rounded-full bg-[#141220] py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-pink"
          >
            {t("Créer la catégorie", "Create the category")}
          </button>
        </div>
      </div>
    </div>
  );
}
