"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import MediaProduit from "./MediaProduit";
import IdentiteProduit from "./IdentiteProduit";
import TarificationProduit from "./TarificationProduit";
import MargeCard from "./MargeCard";
import VariantesProduit from "./VariantesProduit";
import { recalculerCombinaisons } from "./combinaisons";
import { CATEGORIES_DEFAUT } from "./categoriesDefaut";
import type { Attribut, Categorie, Combinaison, NouveauProduit } from "./types";

/*
  Écran "Ajouter un produit" (Écran 08 de la maquette "LM · Ajouter un
  produit.html" fournie par l'utilisateur), ouvert depuis le bouton du
  même nom sur la page Produits (voir
  ../../dashboard-accueil/ProduitsCatalogue.tsx).

  Ce n'est PAS une fenêtre superposée : le composant remplace juste le
  contenu de la page à l'intérieur de la colonne centrale — DashboardSidebar
  et DashboardHeader restent affichés parce qu'ils sont rendus par la page
  parente (app/dashboard/produits/page.tsx), exactement comme
  ProduitsNav bascule d'une section à l'autre sans jamais toucher au rail.

  Quatre blocs indépendants (média, identité, tarification + marge,
  variantes) : chacun se reprend seul, sans toucher aux autres, quand
  l'API Laravel du catalogue produits arrivera —
  cf. mémoire [[dashboard-mock-data-pending-laravel-api]].

  Rien n'est envoyé au serveur ici : "Publier" et "Enregistrer en
  brouillon" appellent seulement onCreer avec la charge NouveauProduit
  reconstituée. C'est à l'appelant (aujourd'hui : ajouter la ligne dans le
  tableau local ; demain : un hook qui poste vers l'API) de décider quoi
  en faire — pas de fetch ni de token géré ici.

  Sécurité front : chaque sous-composant borne déjà ce qui entre dans son
  propre state (longueur des champs, type/taille des fichiers, nombres
  assainis) ; ici, on ajoute seulement la condition de publication
  (peutPublier) pour qu'un produit sans nom ni prix ne puisse pas être
  publié — le bouton reste désactivé tant que la condition n'est pas
  remplie. Aucun texte utilisateur n'est jamais injecté en HTML brut :
  tout passe par du JSX, échappé par React.
*/

const REF_PREFIXE_DEFAUT = "PRD";

function idAleatoire(prefixe: string) {
  return `${prefixe}-${Math.random().toString(36).slice(2, 9)}`;
}

// Repris texte pour texte de la maquette (bloc "Comment se crée un
// produit", bas de l'Écran 08) : les six étapes dans leur ordre d'origine.
const ETAPES = [
  { titre: "1 · La vidéo", titreEn: "1 · The video", texte: "Verticale. C'est elle qui tourne sur votre page de commande.", texteEn: "Vertical. It's the one that plays on your order page." },
  { titre: "2 · Les photos", titreEn: "2 · The photos", texte: "Elles défilent dans le carré, au centre de la vidéo.", texteEn: "They scroll in the square, at the center of the video." },
  { titre: "3 · Le nom", titreEn: "3 · The name", texte: "La référence se crée toute seule dès qu'il est saisi.", texteEn: "The reference builds itself as soon as it's entered." },
  { titre: "4 · La catégorie", titreEn: "4 · The category", texte: "Une des vôtres, ou une nouvelle que vous créez.", texteEn: "One of yours, or a new one you create." },
  { titre: "5 · Les deux prix", titreEn: "5 · The two prices", texte: "Le décompte se met à jour pendant la saisie.", texteEn: "The breakdown updates as you type." },
  { titre: "6 · Les variantes", titreEn: "6 · The variants", texte: "Les attributs se posent, les combinaisons se créent seules.", texteEn: "Attributes are set, combinations build themselves." },
] as const;

// Trois lettres + un numéro qui se suit (cf. maquette, point 3) — figée une
// fois calculée pour un montage donné, elle ne doit plus changer ensuite,
// même si le nom du produit est encore retouché.
function genererReference(): string {
  const numero = String(Math.floor(1000 + Math.random() * 9000));
  return `${REF_PREFIXE_DEFAUT}-${numero}`;
}

export default function AjouterProduitModal({
  categoriesInitiales = CATEGORIES_DEFAUT,
  onFermer,
  onCreer,
  onCategorieCreee,
}: {
  /** Catégories déjà existantes de la boutique — mock tant que l'API n'expose pas ce endpoint. */
  categoriesInitiales?: Categorie[];
  onFermer: () => void;
  /** Reçoit la charge complète du formulaire au clic "Publier" ou "Enregistrer en brouillon". */
  onCreer: (produit: NouveauProduit, statut: "brouillon" | "publie") => void;
  /** Optionnel : prévient le parent qu'une catégorie a été créée depuis ce formulaire, pour qu'il la garde dans sa propre liste (voir ProduitsCatalogue.tsx + CreerCategorieModal.tsx). */
  onCategorieCreee?: (categorie: Categorie) => void;
}) {
  const { t, langue } = useDashboardLangue();

  const [categories, setCategories] = useState(categoriesInitiales);
  const [nom, setNom] = useState("");
  const [categorieId, setCategorieId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [prixAchat, setPrixAchat] = useState<number | null>(null);
  const [prixVente, setPrixVente] = useState(0);
  const [poidsGrammes, setPoidsGrammes] = useState<number | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [attributs, setAttributs] = useState<Attribut[]>([]);
  const [combinaisons, setCombinaisons] = useState<Combinaison[]>([]);

  // Référence et date figées à l'ouverture du formulaire, pas recalculées
  // à chaque frappe (cf. maquette : "Elle ne change plus ensuite").
  const reference = useMemo(genererReference, []);
  const dateCreation = useMemo(
    () => new Date().toLocaleDateString(langue === "EN" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    [langue]
  );
  const categorieLabel = useMemo(() => {
    const c = categories.find((cat) => cat.id === categorieId);
    return c ? t(c.nom, c.nomEn) : null;
  }, [categories, categorieId, t]);

  // Les combinaisons se recalculent à chaque changement d'attribut/valeur,
  // en conservant quantité/référence/état de celles qui existent déjà
  // (voir recalculerCombinaisons) — jamais l'inverse : les attributs ne se
  // modifient jamais à partir des combinaisons.
  useEffect(() => {
    setCombinaisons((precedentes) => recalculerCombinaisons(attributs, precedentes, REF_PREFIXE_DEFAUT, prixAchat, prixVente));
    // prixAchat/prixVente volontairement absents des dépendances : ils ne
    // servent qu'à initialiser une combinaison neuve, pas à écraser celles
    // déjà personnalisées quand on retouche le prix global.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributs]);

  const patchCombinaison = (id: string, patch: Partial<Combinaison>) => {
    setCombinaisons((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  // Une seule combinaison "mise en avant" à la fois — celle sur laquelle
  // MargeCard base son calcul (cf. maquette : "Choisissez-en une autre et
  // le calcul suit").
  const mettreEnAvant = (id: string) => {
    setCombinaisons((prev) => prev.map((c) => ({ ...c, misEnAvant: c.id === id })));
  };

  const creerCategorie = (nomCategorie: string) => {
    const id = idAleatoire("cat");
    const categorie: Categorie = { id, nom: nomCategorie, nomEn: nomCategorie };
    setCategories((prev) => [...prev, categorie]);
    setCategorieId(id);
    onCategorieCreee?.(categorie);
  };

  // Fermeture au clavier (Échap), comportement standard d'un écran de saisie plein.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  // Nom + prix de revente strictement positif : seules exigences pour
  // publier. Le reste (photos, variantes...) peut se compléter après, cf.
  // logique "brouillon" de la maquette.
  const peutPublier = nom.trim().length > 0 && prixVente > 0;
  const peutEnregistrerBrouillon = nom.trim().length > 0;

  // Même base de calcul que MargeCard (la combinaison mise en avant s'il y
  // en a une, sinon les prix globaux) — dupliqué ici volontairement en un
  // simple booléen plutôt que de faire remonter la marge depuis un enfant :
  // plus simple à lire que de partager un state pour une seule comparaison.
  // Frais/commission estimés — même formule que MargeCard.tsx (voir ses
  // constantes ESTIMATION_*), dupliquée ici pour la seule comparaison
  // "vente à perte" plutôt que de partager un state pour ça.
  const combinaisonMiseEnAvant = combinaisons.find((c) => c.misEnAvant) ?? null;
  const achatCalcul = combinaisonMiseEnAvant ? combinaisonMiseEnAvant.prixAchat : prixAchat;
  const venteCalcul = combinaisonMiseEnAvant ? combinaisonMiseEnAvant.prixVente : prixVente;
  const fraisEstimes = (poidsGrammes ?? 0) * 2.5 + venteCalcul * 0.04;
  const venteAPerte = achatCalcul !== null && venteCalcul > 0 && venteCalcul - achatCalcul - fraisEstimes < 0;

  const construireCharge = (): NouveauProduit => ({
    nom: nom.trim(),
    categorieId,
    description: description.trim(),
    prixAchat,
    prixVente,
    poidsGrammes,
    video,
    photos,
    attributs,
    combinaisons,
  });

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onFermer}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--dashboard-card-bg)]/70 px-3.5 py-2 text-xs font-medium text-[var(--dashboard-text)]/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] hover:bg-[var(--dashboard-card-bg)]"
        >
          ← {t("Produits", "Products")} <span className="text-[var(--dashboard-text)]/30">›</span>{" "}
          <span className="font-semibold text-[var(--dashboard-text)]">{t("Ajouter un produit", "Add a product")}</span>
        </button>
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{t("Ajouter un produit", "Add a product")}</h1>
      <p className="mt-1 text-sm text-[var(--dashboard-text)]/50">
        {t(
          "La référence et les combinaisons se créent toutes seules à partir de ce que vous saisissez.",
          "The reference and combinations build themselves from what you enter."
        )}
      </p>

      <div className="mt-6">
        <MediaProduit
          valeur={{ video, photos }}
          onChange={(v) => { setVideo(v.video); setPhotos(v.photos); }}
          infos={{
            nom,
            categorieLabel,
            reference,
            combinaisons: combinaisons.length,
            dateCreation,
            brouillon: true,
          }}
        />
      </div>

      {/* Trois colonnes comme dans la maquette : identité, tarification,
          puis la marge à part — pas un simple encart sous le prix. */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_1fr_0.95fr]">
        <IdentiteProduit
          nom={nom}
          onNomChange={setNom}
          categories={categories}
          categorieId={categorieId}
          onCategorieChange={setCategorieId}
          onCreerCategorie={creerCategorie}
          description={description}
          onDescriptionChange={setDescription}
        />
        <TarificationProduit
          prixAchat={prixAchat}
          onPrixAchatChange={setPrixAchat}
          prixVente={prixVente}
          onPrixVenteChange={setPrixVente}
          poidsGrammes={poidsGrammes}
          onPoidsChange={setPoidsGrammes}
        />
        <MargeCard prixAchat={prixAchat} prixVente={prixVente} poidsGrammes={poidsGrammes} combinaisons={combinaisons} attributs={attributs} />
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold">{t("Les variantes", "The variants")}</p>
        <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">
          {t("Vous posez les attributs et leurs valeurs. Les combinaisons se créent toutes seules.", "You set the attributes and their values. Combinations build themselves.")}
        </p>
        <div className="mt-2.5">
          <VariantesProduit
            attributs={attributs}
            onAttributsChange={setAttributs}
            combinaisons={combinaisons}
            onCombinaisonChange={patchCombinaison}
            onMettreEnAvant={mettreEnAvant}
            prixAchatGlobal={prixAchat}
            prixVenteGlobal={prixVente}
          />
        </div>
      </div>

      {/* "Comment se crée un produit" (Écran 08, bas de maquette) : repris
          tel quel, texte pour texte — la boutique voit d'un coup d'œil
          l'ordre des six étapes avant de se lancer dans le détail. */}
      <p className="mt-6 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">
        {t("Comment se crée un produit", "How a product gets created")}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ETAPES.map(({ titre, titreEn, texte, texteEn }) => (
          <div key={titre} className="rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3">
            <p className="text-[11px] font-semibold">{t(titre, titreEn)}</p>
            <p className="mt-0.5 text-[9px] leading-snug text-[var(--dashboard-text)]/40">{t(texte, texteEn)}</p>
          </div>
        ))}
      </div>

      {/* Avertissement vente à perte (Écran 08) : affiché seulement quand
          le calcul le déclenche réellement, pas en permanence — la
          maquette le montre toujours mais dans un contexte où il
          s'applique déjà à l'exemple choisi. */}
      {venteAPerte && (
        <div className="mt-3 rounded-[28px] border border-[#f5c451]/40 bg-[#fff1d6]/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--dashboard-text)]/70">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#a8690a] align-middle" />
              {t(
                "Le prix de revente ne couvre pas son prix d'achat et les frais : la ligne « Il vous reste » passe au rouge et la publication est retenue le temps d'une confirmation.",
                "The resale price doesn't cover its cost price and fees: the “What you keep” line turns red and publishing is held pending confirmation."
              )}
            </p>
            <span className="shrink-0 rounded-full bg-[#fff1d6] px-2.5 py-1 text-[10px] font-semibold text-[#a8690a]">{t("Vente à perte", "Selling at a loss")}</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[28px] bg-[var(--dashboard-card-bg)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
        <p className="flex-1 text-[10px] text-[var(--dashboard-text)]/40">
          {t(
            "Un brouillon garde tout ce qui est saisi. Le produit n'apparaît chez vos clients qu'une fois publié.",
            "A draft keeps everything entered. The product only appears to customers once published."
          )}
        </p>
        {/* Remplace "Annuler" de nos premières versions : la maquette n'a
            pas de bouton d'annulation ici, le fil d'ariane "← Produits" en
            haut d'écran suffit à quitter. Pas de vraie page de commande
            tant que le produit n'est pas publié (rien à montrer), donc
            désactivé avec une explication plutôt que de simuler un lien
            qui ne mène nulle part. */}
        <button
          type="button"
          disabled
          title={t("Disponible une fois le produit publié.", "Available once the product is published.")}
          className="rounded-full border border-brand-pink/40 px-5 py-2.5 text-xs font-semibold text-brand-pink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("Voir ma page de commande", "View my order page")}
        </button>
        <button
          type="button"
          onClick={() => onCreer(construireCharge(), "brouillon")}
          disabled={!peutEnregistrerBrouillon}
          className="rounded-full border border-brand-pink/40 px-5 py-2.5 text-xs font-semibold text-brand-pink disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-pink/10"
        >
          {t("Enregistrer en brouillon", "Save as draft")}
        </button>
        <button
          type="button"
          onClick={() => onCreer(construireCharge(), "publie")}
          disabled={!peutPublier}
          className="rounded-full bg-[#141220] px-6 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-pink"
        >
          {t("Publier le produit", "Publish the product")}
        </button>
      </div>
    </>
  );
}
