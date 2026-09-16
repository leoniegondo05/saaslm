"use client";

import { useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import type { Categorie } from "./types";

/*
  Bloc "Nom / catégorie / description" (Écran 08, + Écran 10 pour la
  création de catégorie, réduite ici à une petite ligne de saisie inline
  plutôt qu'un panneau séparé — même résultat, moins de code à maintenir
  tant qu'il n'y a pas d'API catégories à respecter).
*/

// Sécurité front : chaque champ texte est plafonné en longueur *avant*
// d'entrer dans le state (slice), pas seulement via l'attribut HTML
// maxLength — utile si jamais le champ est un jour prérempli par un
// import ou un copier-coller qui dépasse la limite.
const NOM_MAX = 120;
const DESCRIPTION_MAX = 1000;
const CATEGORIE_NOM_MAX = 60;

export default function IdentiteProduit({
  nom,
  onNomChange,
  categories,
  categorieId,
  onCategorieChange,
  onCreerCategorie,
  description,
  onDescriptionChange,
}: {
  nom: string;
  onNomChange: (v: string) => void;
  categories: Categorie[];
  categorieId: string | null;
  onCategorieChange: (id: string) => void;
  onCreerCategorie: (nom: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}) {
  const { t } = useDashboardLangue();
  const [creation, setCreation] = useState(false);
  const [nomCategorie, setNomCategorie] = useState("");

  const validerCreation = () => {
    const propre = nomCategorie.trim().slice(0, CATEGORIE_NOM_MAX);
    if (!propre) return;
    onCreerCategorie(propre);
    setNomCategorie("");
    setCreation(false);
  };

  return (
    <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Nom du produit", "Product name")}</p>
      <input
        value={nom}
        onChange={(e) => onNomChange(e.target.value.slice(0, NOM_MAX))}
        maxLength={NOM_MAX}
        placeholder={t("Ex. Ensemble deux pièces en lin", "E.g. Two-piece linen set")}
        className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
      />
      <p className="mt-1 text-[10px] text-[var(--dashboard-text)]/40">
        {t("Sans la taille ni la couleur : elles se règlent dans les variantes.", "Without size or color: those are set in the variants.")}
      </p>

      <p className="mt-4 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Catégorie", "Category")}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCategorieChange(c.id)}
            className={`rounded-full px-3.5 py-2 text-[11px] font-semibold transition ${
              categorieId === c.id
                ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-[0_2px_10px_rgba(20,18,32,0.12)] ring-1 ring-brand-pink"
                : "bg-black/[0.03] text-[var(--dashboard-text)]/50 hover:bg-black/[0.06]"
            }`}
          >
            {t(c.nom, c.nomEn)}
          </button>
        ))}

        {!creation ? (
          <button
            type="button"
            onClick={() => setCreation(true)}
            className="rounded-full border border-dashed border-brand-pink/50 px-3.5 py-2 text-[11px] font-semibold text-brand-pink"
          >
            + {t("Créer une catégorie", "Create a category")}
          </button>
        ) : (
          <span className="flex items-center gap-1.5">
            <input
              value={nomCategorie}
              onChange={(e) => setNomCategorie(e.target.value.slice(0, CATEGORIE_NOM_MAX))}
              onKeyDown={(e) => e.key === "Enter" && validerCreation()}
              autoFocus
              placeholder={t("Nom de la catégorie", "Category name")}
              className="rounded-full border border-brand-pink/40 bg-transparent px-3 py-2 text-[11px] outline-none"
            />
            <button type="button" onClick={validerCreation} className="rounded-full bg-brand-pink px-3 py-2 text-[11px] font-semibold text-white">
              {t("Ajouter", "Add")}
            </button>
          </span>
        )}
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Description", "Description")}</p>
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value.slice(0, DESCRIPTION_MAX))}
        maxLength={DESCRIPTION_MAX}
        rows={4}
        placeholder={t("Ce que le client lira sur votre page de commande.", "What the customer will read on your order page.")}
        className="mt-1.5 w-full resize-none rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-xs outline-none focus:border-brand-pink dark:bg-white/[0.04]"
      />
      <p className="mt-1 text-right text-[9px] text-[var(--dashboard-text)]/30">{description.length}/{DESCRIPTION_MAX}</p>
    </div>
  );
}
