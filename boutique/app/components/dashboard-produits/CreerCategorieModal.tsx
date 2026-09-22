"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
import type { Categorie } from "./ajouter-produit/types";

/*
  "Créer une catégorie" (Écran 10 de la maquette "LM · Ajouter un
  produit.html"), atteint depuis le bouton "Ajouter une catégorie" en haut
  de la page Produits (voir ../dashboard-accueil/ProduitsCatalogue.tsx) et
  depuis "+ Créer une catégorie" du formulaire "Ajouter un produit" (voir
  ajouter-produit/IdentiteProduit.tsx + AjouterProduitModal.tsx) — un seul
  panneau pour les deux entrées, plutôt qu'une saisie inline dupliquée, pour
  que l'image reste obligatoire partout où une catégorie se crée.

  Contrairement à AjouterProduitModal.tsx (qui remplace toute la page),
  ceci est un vrai panneau superposé : la maquette dit explicitement "Le
  panneau s'ouvre par-dessus la page, qui reste visible derrière" — donc
  overlay avec fond assombri, pas un remplacement de contenu.

  Thème clair pour rester cohérent avec le reste du dashboard (la maquette
  d'origine était sombre) — même choix que CreerCollaborateur.tsx,
  cf. mémoire [[dashboard-background-fafcfc]].

  Image obligatoire (data URL, FileReader) : même mécanique que le logo
  boutique (cf. MaBoutique.tsx/MonProfil.tsx) — aucun endpoint Laravel
  d'upload n'existe encore, mais contrairement aux photos produit
  (URL.createObjectURL, filtrées avant l'envoi à /api/boutique/[slug] car un
  blob: ne survit pas hors de l'onglet), une data URL est une chaîne
  sérialisable : elle est bien écrite dans le JSON de la boutique et
  ressort donc sur le site public, cf. [[dashboard-mock-data-pending-laravel-api]].

  Catégories mock tant que l'API Laravel n'expose pas ce endpoint,
  cf. [[dashboard-mock-data-pending-laravel-api]] — "produits" ci-dessous
  vient du vrai tableau local (compté par ProduitsCatalogue.tsx) quand
  disponible ; l'appel depuis le formulaire "Ajouter un produit" ne connaît
  pas ce compte (produit en cours de saisie, pas encore dans le catalogue)
  et l'omet.
*/

const NOM_MAX = 60;
const IMAGE_TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_TAILLE_MAX_MO = 5;

export default function CreerCategorieModal({
  categories,
  onFermer,
  onCreer,
  onModifier,
}: {
  /** Catégories existantes + nombre réel de produits qui leur sont rattachés (compté par l'appelant, quand connu). */
  categories: (Categorie & { nombreProduits?: number })[];
  onFermer: () => void;
  /** Reçoit le nom déjà nettoyé (trim, longueur bornée) et l'image (data URL) au clic "Créer la catégorie". */
  onCreer: (nom: string, image: string) => void;
  /** Reçoit l'id de la catégorie modifiée, son nouveau nom et sa nouvelle image, au clic "Enregistrer les modifications". */
  onModifier?: (id: string, nom: string, image: string) => void;
}) {
  const { t } = useDashboardLangue();
  const [edition, setEdition] = useState<Categorie | null>(null);
  const [nom, setNom] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fermeture au clavier (Échap) et sur clic du fond assombri — comportement standard d'un panneau superposé.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  const choisirImage = (fichier: File | undefined) => {
    setErreur(null);
    if (!fichier) return;
    if (!IMAGE_TYPES_ACCEPTES.includes(fichier.type)) {
      setErreur(t("Format d'image non pris en charge.", "Unsupported image format."));
      return;
    }
    if (fichier.size > IMAGE_TAILLE_MAX_MO * 1024 * 1024) {
      setErreur(t(`Image trop lourde (max ${IMAGE_TAILLE_MAX_MO} Mo).`, `Image too large (max ${IMAGE_TAILLE_MAX_MO} MB).`));
      return;
    }
    const lecteur = new FileReader();
    lecteur.onload = () => setImage(lecteur.result as string);
    lecteur.readAsDataURL(fichier);
  };

  const reinitialiser = () => {
    setEdition(null);
    setNom("");
    setImage(null);
    setErreur(null);
  };

  const ouvrirEdition = (c: Categorie) => {
    setEdition(c);
    setNom(c.nom);
    setImage(c.image);
    setErreur(null);
  };

  const peutValider = nom.trim().length > 0 && image !== null;

  const valider = () => {
    const propre = nom.trim().slice(0, NOM_MAX);
    if (!propre || !image) return;
    if (edition) {
      onModifier?.(edition.id, propre, image);
    } else {
      onCreer(propre, image);
    }
    reinitialiser();
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
          <h2 className="text-xl font-bold tracking-tight">
            {edition ? t("Modifier la catégorie", "Edit the category") : t("Créer une catégorie", "Create a category")}
          </h2>
          <Tag tone="neutral" className="shrink-0">{t("Visible chez vous seul", "Only visible to you")}</Tag>
        </div>
        <p className="mt-2 text-xs leading-snug text-[var(--dashboard-text)]/50">
          {t(
            "Vos catégories rangent votre boutique et votre page de commande. Elles n'ont rien à voir avec celles du catalogue de votre partenaire.",
            "Your categories organize your shop and your order page. They have nothing to do with your partner's catalog categories."
          )}
        </p>

        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

        <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Image de la catégorie", "Category image")}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("Choisir une image", "Choose an image")}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--dashboard-text)]/20 bg-black/[0.02] dark:bg-white/[0.04]"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <PhotoIcon />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-[var(--dashboard-text)]/15 px-3.5 py-2 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]"
            >
              {image ? t("Changer l'image", "Change image") : t("Ajouter une image", "Add an image")}
            </button>
            <p className="mt-1 text-[9px] leading-snug text-[var(--dashboard-text)]/40">
              {t("Obligatoire — affichée dans la section « Catégories » de votre boutique.", "Required — shown in your shop's “Categories” section.")}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_TYPES_ACCEPTES.join(",")}
            className="hidden"
            onChange={(e) => { choisirImage(e.target.files?.[0]); e.target.value = ""; }}
          />
        </div>
        {erreur && <p className="mt-1.5 text-[10px] text-[#c8262d]">{texteAvecChiffres(erreur)}</p>}

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
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vignette locale (data URL) */}
                  <img src={c.image} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="truncate font-medium">{texteAvecChiffres(t(c.nom, c.nomEn))}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {c.nombreProduits !== undefined && (
                  <span className="text-[var(--dashboard-text)]/40">
                    {c.nombreProduits > 0 ? texteAvecChiffres(t(`${c.nombreProduits} produits`, `${c.nombreProduits} products`)) : t("Aucun produit", "No products")}
                  </span>
                )}
                {onModifier && (
                  <button
                    type="button"
                    onClick={() => ouvrirEdition(c)}
                    className="rounded-full px-2 py-1 text-[10px] font-semibold text-brand-pink transition hover:bg-brand-pink/10"
                  >
                    {t("Modifier", "Edit")}
                  </button>
                )}
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
            onClick={edition ? reinitialiser : onFermer}
            className="flex-1 rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03]"
          >
            {edition ? t("Annuler la modification", "Cancel edit") : t("Annuler", "Cancel")}
          </button>
          <button
            type="button"
            onClick={valider}
            disabled={!peutValider}
            className="flex-[1.4] rounded-full bg-[#141220] py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-pink"
          >
            {edition ? t("Enregistrer les modifications", "Save changes") : t("Créer la catégorie", "Create the category")}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--dashboard-text)]/30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4.5 17 4.8-5 3.6 3.8 2.4-2.6L20 17" />
    </svg>
  );
}
