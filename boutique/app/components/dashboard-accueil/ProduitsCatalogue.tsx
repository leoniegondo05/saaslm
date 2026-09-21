"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Btn, Card, Divider, HeaderActionBtn, Nature, ProductSelector, SectionHeader, StatRow, Tag, texteAvecChiffres, Trend } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import CreerCategorieModal from "../dashboard-produits/CreerCategorieModal";
import type { DepotValide } from "../dashboard-produits/DeposerStockModal";
import { CATEGORIES_DEFAUT } from "../dashboard-produits/ajouter-produit/categoriesDefaut";
import {
  lireEtViderProduitEnAttente,
  lireEtViderCategoriesEnAttente,
  lireEtViderEditionEnAttente,
  ouvrirEditionProduit,
} from "../dashboard-produits/ajouter-produit/pendingProduitStore";
import { lireEtViderDepotEnAttente, definirDepotAPreselectionner } from "../dashboard-produits/pendingDepotStore";
import type { Categorie, NouveauProduit } from "../dashboard-produits/ajouter-produit/types";

/*
  Page "Produits" (Écran 03 des maquettes) : tous les produits de la
  boutique, toutes natures confondues, dans un seul tableau, avec la fiche
  du produit sélectionné à droite. Distincte de ProduitsSection.tsx (qui
  reste la section-résumé de l'onglet Accueil) — ici c'est l'écran complet
  atteint depuis l'icône "Produits" du rail (voir DashboardSidebar).

  Chiffres statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] — à brancher sur l'API Laravel
  quand elle expose le catalogue produits. Le bouton "Ajouter un produit"
  mène à /dashboard/produits/ajouter (page à part, voir
  app/dashboard/produits/ajouter/page.tsx — pas un modal en state ici :
  une actualisation dessus doit y rester, pas ramener à cette page) ; le
  produit saisi revient via pendingProduitStore et s'ajoute à cette liste
  locale au montage.
*/

type Nature4 = "S" | "P" | "L";
type Etat = { label: string; labelEn: string; tone: "ok" | "warn" | "ko" };

export type Produit = {
  nom: string;
  nomEn: string;
  nature: Nature4;
  achat: number | null; // F — null si aucun coût de revient déclaré
  vente: number; // F
  stock: number;
  vendu: number;
  margePct: number; // %
  avis: number | null; // / 5 — null si jamais vendu
  etat: Etat;
  fraisPreleves?: number; // F par vente, pour la fiche détaillée
  couverture?: string;
  couvertureEn?: string;
  litiges?: number;
  tendance: number[]; // ventes / semaine, 6 dernières semaines — pour le mini diagramme
  images?: string[]; // URLs — absent/vide si le produit n'a pas encore de visuel
  categorieId?: string | null; // id d'une Categorie (voir ajouter-produit/types.ts) — absent pour les produits d'exemple ci-dessous
};

// Images de test /images/1..8 (voir public/images) — juste pour avoir des
// vignettes réelles pendant le développement, pas des vraies photos produit,
// cf. [[dashboard-mock-data-pending-laravel-api]].
export const PRODUITS_INITIAUX: Produit[] = [
  { nom: "Montre connectée S8", nomEn: "S8 connected watch", nature: "L", achat: 6200, vente: 14000, stock: 340, vendu: 48, margePct: 31, avis: 4.5, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 1660, couverture: "21 jours", couvertureEn: "21 days", litiges: 3, tendance: [5, 6, 5, 7, 6, 8, 7, 9, 10, 11], images: ["/images/1.jpg"] },
  { nom: "Sérum éclat 30 ml", nomEn: "Radiance serum 30 ml", nature: "S", achat: 4300, vente: 12000, stock: 83, vendu: 37, margePct: 46, avis: 4.7, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 2180, couverture: "22 jours", couvertureEn: "22 days", litiges: 0, tendance: [4, 5, 4, 6, 5, 7, 6, 8, 9, 5], images: ["/images/serum1.avif", "/images/serum2.jpg"] },
  { nom: "Casque sans fil X2", nomEn: "X2 wireless headset", nature: "P", achat: 4800, vente: 11000, stock: 96, vendu: 21, margePct: 34, avis: 3.4, etat: { label: "Avis négatifs", labelEn: "Negative reviews", tone: "warn" }, fraisPreleves: 1420, couverture: "13 jours", couvertureEn: "13 days", litiges: 1, tendance: [6, 6, 5, 5, 4, 4, 3, 3, 2, 1], images: ["/images/3.jpg"] },
  { nom: "Huile de ricin 100 ml", nomEn: "Castor oil 100 ml", nature: "S", achat: 2600, vente: 7500, stock: 2, vendu: 58, margePct: 44, avis: 4.8, etat: { label: "Rupture · 1 j", labelEn: "Out of stock · 1 day", tone: "ko" }, fraisPreleves: 1580, couverture: "1 jour", couvertureEn: "1 day", litiges: 0, tendance: [7, 8, 7, 9, 10, 11, 12, 13, 12, 14], images: ["/images/4.jpg"] },
  { nom: "Beurre de karité 200 g", nomEn: "Shea butter 200 g", nature: "S", achat: 4100, vente: 9000, stock: 127, vendu: 73, margePct: 42, avis: 4.6, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 1120, couverture: "34 jours", couvertureEn: "34 days", litiges: 0, tendance: [8, 8, 7, 8, 9, 8, 9, 10, 9, 10], images: ["/images/5.png"] },
  { nom: "Bracelet cuir", nomEn: "Leather bracelet", nature: "S", achat: 3800, vente: 6000, stock: 28, vendu: 2, margePct: 29, avis: 4.2, etat: { label: "Rotation lente", labelEn: "Slow turnover", tone: "warn" }, fraisPreleves: 460, couverture: "60+ jours", couvertureEn: "60+ days", litiges: 0, tendance: [2, 2, 1, 1, 1, 0, 1, 0, 1, 0], images: ["/images/6.png"] },
  { nom: "Lotion tonique", nomEn: "Toning lotion", nature: "L", achat: 3800, vente: 8900, stock: 210, vendu: 9, margePct: 38, avis: 4.4, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 1440, couverture: "40 jours", couvertureEn: "40 days", litiges: 0, tendance: [3, 2, 3, 2, 3, 2, 4, 3, 4, 3], images: ["/images/7.jpg"] },
  { nom: "Gel nettoyant", nomEn: "Cleansing gel", nature: "P", achat: 2200, vente: 6000, stock: 140, vendu: 4, margePct: 36, avis: null, etat: { label: "Jamais vendu", labelEn: "Never sold", tone: "warn" }, fraisPreleves: 940, couverture: "35 jours", couvertureEn: "35 days", litiges: 0, tendance: [0, 0, 0, 1, 0, 0, 1, 0, 0, 1], images: ["/images/8.webp"] },
];

// Couleur de la tuile-icône du tableau — reprend exactement la couleur de
// nature déjà posée en badge à côté du nom (S bleu / P violet / L rose,
// cf. Nature dans shared.tsx) : pas une couleur inventée, juste agrandie en
// fond de tuile. Tant qu'aucune vraie photo produit n'existe côté serveur
// (cf. [[dashboard-mock-data-pending-laravel-api]]), la tuile montre une
// icône de catégorie plutôt qu'un lien vers un fichier qui n'existe pas.
const NATURE_HEX: Record<Nature4, string> = { S: "#5AA9FF", P: "#3a1d8a", L: "#ec0c8c" };

// Catégorie visuelle déduite du nom — juste pour choisir la bonne icône de
// tuile (montre/flacon/casque/pot/bracelet), aucun lien avec `nature`
// (stockage/drop) qui reste la seule info métier portée par la couleur.
function iconeCategorie(nom: string) {
  const n = nom.toLowerCase();
  if (n.includes("montre")) return <MontreIcon />;
  if (n.includes("casque")) return <CasqueIcon />;
  if (n.includes("bracelet")) return <BraceletIcon />;
  if (n.includes("beurre")) return <PotIcon />;
  if (n.includes("sérum") || n.includes("huile") || n.includes("lotion") || n.includes("gel")) return <FlaconIcon />;
  return <PhotoIcon />;
}

// Palier de performance de la ligne (jauge + libellé), dérivé de la marge —
// même seuils/couleurs que le reste du dashboard : vert #178a3f (bon),
// orange #a8690a (moyen), rouge #c8262d (mauvais), cf.
// [[dashboard-chart-colors-stockage-drop]] pour la convention de couleurs.
function performanceDeMarge(margePct: number): { label: string; labelEn: string; couleur: string } {
  if (margePct >= 40) return { label: "Excellente", labelEn: "Excellent", couleur: "#178a3f" };
  if (margePct >= 25) return { label: "Bonne", labelEn: "Good", couleur: "#a8690a" };
  return { label: "Faible", labelEn: "Low", couleur: "#c8262d" };
}

/*
  Transforme la charge du formulaire "Ajouter un produit" en une ligne du
  tableau local. Purement un mapping d'affichage : le jour où l'API
  Laravel existe, c'est sa réponse (avec un vrai id, de vraies URLs de
  photos hébergées...) qui remplacera ce mapping, pas les composants du
  formulaire eux-mêmes — cf. [[dashboard-mock-data-pending-laravel-api]].
  Les photos choisies ne sont jamais uploadées (pas d'endpoint de stockage)
  mais on les affiche quand même via URL.createObjectURL — un blob local au
  navigateur, pas un lien vers un fichier serveur inexistant, même technique
  que l'aperçu déjà fait dans MediaProduit.tsx.
*/
function produitDepuisFormulaire(donnees: NouveauProduit, statut: "brouillon" | "publie"): Produit {
  const margePct = donnees.prixAchat !== null && donnees.prixVente > 0
    ? Math.round(((donnees.prixVente - donnees.prixAchat) / donnees.prixVente) * 100)
    : 0;
  const stockInitial = donnees.combinaisons.length > 0
    ? donnees.combinaisons.reduce((total, c) => total + (c.active ? c.quantite : 0), 0)
    : 0;

  return {
    nom: donnees.nom,
    nomEn: donnees.nom, // saisie boutique, pas de traduction automatique côté front
    nature: "S",
    achat: donnees.prixAchat,
    vente: donnees.prixVente,
    categorieId: donnees.categorieId,
    stock: stockInitial,
    vendu: 0,
    margePct,
    avis: null,
    etat: statut === "brouillon"
      ? { label: "Brouillon", labelEn: "Draft", tone: "warn" }
      : { label: "Actif", labelEn: "Active", tone: "ok" },
    litiges: 0,
    tendance: [0, 0, 0, 0, 0, 0],
    images: donnees.photos.map((f) => URL.createObjectURL(f)),
  };
}

export default function ProduitsCatalogue({ first = true, recherche = "" }: { first?: boolean; recherche?: string }) {
  const router = useRouter();
  const { t, langue } = useDashboardLangue();
  const numberLocale = langue === "EN" ? "en-US" : "fr-FR";
  const F = (n: number) => `${n.toLocaleString(numberLocale)} F`;
  const [produits, setProduits] = useState<Produit[]>(PRODUITS_INITIAUX);
  const [categories, setCategories] = useState<Categorie[]>(CATEGORIES_DEFAUT);
  // Visibilité côté boutique — mock local (pas encore d'endpoint, cf.
  // [[dashboard-mock-data-pending-laravel-api]]) : masquée par défaut pour
  // un produit en rupture, visible pour le reste.
  const [visibles, setVisibles] = useState<boolean[]>(() => PRODUITS_INITIAUX.map((p) => p.etat.tone !== "ko"));
  const [selected, setSelectedRaw] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [categorieModalOuverte, setCategorieModalOuverte] = useState(false);
  const produit = produits[selected];
  const photos = produit.images ?? [];

  // Changer de produit repart toujours sur sa première photo.
  const setSelected = (updater: number | ((i: number) => number)) => {
    setSelectedRaw(updater);
    setPhoto(0);
  };

  // Nouveau produit ajouté en tête de liste et sélectionné directement,
  // pour que la boutique voie tout de suite le résultat de sa saisie.
  const ajouterProduit = (donnees: NouveauProduit, statut: "brouillon" | "publie") => {
    setProduits((prev) => [produitDepuisFormulaire(donnees, statut), ...prev]);
    setVisibles((prev) => [statut === "publie", ...prev]);
    setSelected(0);
  };

  // Une catégorie créée depuis le formulaire "Ajouter un produit" doit
  // aussi apparaître ici : source unique de vérité pour les catégories de
  // la boutique, pas une copie qui divergerait des deux côtés.
  const ajouterCategorie = (nom: string) => {
    setCategories((prev) => [...prev, { id: `cat-${Math.random().toString(36).slice(2, 9)}`, nom, nomEn: nom }]);
  };

  // Dépôt validé : incrémente le stock du produit choisi. Reste local tant
  // que l'API Laravel n'expose pas d'endpoint de dépôt, cf.
  // [[dashboard-mock-data-pending-laravel-api]] — les autres détails du
  // dépôt (protection, logistique, récupération) ne sont pas encore
  // persistés ailleurs que dans ce mock. `produitIndex` vient de la liste
  // passée au moment de l'ouverture : correct en panneau superposé (même
  // liste), mais suppose que l'ordre n'a pas changé depuis quand le dépôt
  // vient de la page à part (voir pendingDepotStore.ts) — même caveat que
  // pendingProduitStore.ts pour les catégories.
  const validerDepot = (depot: DepotValide) => {
    setProduits((prev) =>
      prev.map((p, i) => (i === depot.produitIndex ? { ...p, stock: p.stock + depot.quantite } : p))
    );
  };

  // Retour de "Modifier" (fiche produit) : met à jour la ligne identifiée
  // par son nom d'origine, sans toucher au stock/vendu/avis/litiges/tendance
  // — ces données opérationnelles ne se modifient pas depuis ce formulaire
  // (le stock passe par "Réapprovisionner", cf. validerDepot ci-dessus).
  const appliquerEdition = (nomOriginal: string, donnees: NouveauProduit, statut: "brouillon" | "publie") => {
    setProduits((prev) =>
      prev.map((p) => {
        if (p.nom !== nomOriginal) return p;
        const margePct = donnees.prixAchat !== null && donnees.prixVente > 0
          ? Math.round(((donnees.prixVente - donnees.prixAchat) / donnees.prixVente) * 100)
          : p.margePct;
        return {
          ...p,
          nom: donnees.nom,
          nomEn: donnees.nom,
          categorieId: donnees.categorieId,
          achat: donnees.prixAchat,
          vente: donnees.prixVente,
          margePct,
          etat: statut === "brouillon" ? { label: "Brouillon", labelEn: "Draft", tone: "warn" } : p.etat,
          images: donnees.photos.length > 0 ? donnees.photos.map((f) => URL.createObjectURL(f)) : p.images,
        };
      })
    );
  };

  // Le formulaire vit maintenant sur sa propre page
  // (/dashboard/produits/ajouter) : ce qu'il produit revient via
  // pendingProduitStore plutôt qu'un callback direct, donc on le lit une
  // seule fois au montage puis on vide le pont pour ne pas réappliquer le
  // même produit à chaque re-render. Même pont pour le dépôt de stock
  // validé depuis la page à part (mobile/tablette, voir pendingDepotStore.ts).
  useEffect(() => {
    const enAttente = lireEtViderProduitEnAttente();
    if (enAttente) ajouterProduit(enAttente.produit, enAttente.statut);
    const nouvellesCategories = lireEtViderCategoriesEnAttente();
    if (nouvellesCategories.length > 0) setCategories((prev) => [...prev, ...nouvellesCategories]);
    const depotEnAttente = lireEtViderDepotEnAttente();
    if (depotEnAttente) validerDepot(depotEnAttente);
    const editionEnAttente = lireEtViderEditionEnAttente();
    if (editionEnAttente) appliquerEdition(editionEnAttente.nomOriginal, editionEnAttente.produit, editionEnAttente.statut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toujours en page à part (voir app/dashboard/produits/deposer/page.tsx),
  // y compris en desktop : le formulaire à deux colonnes + talon se présente
  // mieux sur une page dédiée qu'en panneau superposé, quelle que soit la
  // largeur d'écran — décision utilisateur, cf. l'ancien découpage par
  // breakpoint lg encore visible dans DeposerStockModal.tsx (prop pleinePage).
  // Présélection ("Réapprovisionner") transmise par nom via pendingDepotStore
  // (la page /deposer vit sur PRODUITS_INITIAUX, pas ce tableau local).
  const ouvrirDepotStock = (produitIndex: number | null = null) => {
    if (produitIndex !== null) definirDepotAPreselectionner(produits[produitIndex].nom);
    router.push("/dashboard/produits/deposer");
  };

  // "Modifier" (fiche produit) : envoie nom/catégorie/prix vers le formulaire
  // via le pont dédié (cf. pendingProduitStore.ts) — description/poids/
  // vidéo/photos/variantes ne sont pas gardés sur la ligne du tableau, donc
  // repartent vides même en édition.
  const modifierProduit = () => {
    ouvrirEditionProduit(produit.nom, {
      nom: produit.nom,
      categorieId: produit.categorieId ?? null,
      prixAchat: produit.achat,
      prixVente: produit.vente,
    });
    router.push("/dashboard/produits/ajouter");
  };

  // "Retirer de la boutique" : masque le produit (même bascule que la
  // colonne Visibilité du tableau) — pas une suppression, cf.
  // [[dashboard-mock-data-pending-laravel-api]] pour l'absence d'endpoint de
  // suppression réel. Petite confirmation visuelle le temps que la boutique
  // voie l'effet, même motif que handleExport dans CommandesSection.tsx.
  const [retireConfirme, setRetireConfirme] = useState(false);
  const retirerProduit = () => {
    setVisibles((prev) => prev.map((v, vi) => (vi === selected ? false : v)));
    setRetireConfirme(true);
    setTimeout(() => setRetireConfirme(false), 1800);
  };

  // Nombre réel de produits par catégorie — pas un chiffre d'exemple :
  // les produits de démonstration ci-dessus n'ont pas de categorieId, donc
  // les catégories mock démarrent à 0 tant qu'aucun produit ne leur est
  // rattaché (cf. [[dashboard-mock-data-pending-laravel-api]]).
  const categoriesAvecCompte = categories.map((c) => ({
    ...c,
    nombreProduits: produits.filter((p) => p.categorieId === c.id).length,
  }));

  const publies = produits.length;
  const enStockage = produits.filter((p) => p.nature === "S").length;
  const enDrop = produits.filter((p) => p.nature === "P" || p.nature === "L").length;
  const dropPartenaire = produits.filter((p) => p.nature === "P").length;
  const dropLm = produits.filter((p) => p.nature === "L").length;
  const jamaisVendus = produits.filter((p) => p.avis === null).length;
  const margeMoyenne = Math.round(produits.reduce((sum, p) => sum + p.margePct, 0) / produits.length);
  const stockTotal = produits.filter((p) => p.nature === "S").reduce((sum, p) => sum + p.stock, 0);

  const benefice = produit.achat !== null
    ? produit.vente - produit.achat - (produit.fraisPreleves ?? 0)
    : Math.round((produit.vente * produit.margePct) / 100);

  // Filtre du tableau par DashboardSearchBar (voir dashboard/produits/page.tsx) :
  // sur le nom FR/EN, pas sur les autres colonnes — c'est la recherche d'un
  // produit par nom, pas une recherche plein texte du tableau. Les stats
  // au-dessus (publiés, en stockage...) et la fiche à droite restent sur
  // `produits` en entier : ce sont des chiffres globaux de la boutique, pas
  // un résultat de recherche.
  const termeRecherche = recherche.trim().toLowerCase();
  const lignesTableau = produits
    .map((p, i) => ({ p, i }))
    .filter(
      ({ p }) =>
        !termeRecherche ||
        p.nom.toLowerCase().includes(termeRecherche) ||
        p.nomEn.toLowerCase().includes(termeRecherche)
    );

  return (
    <>
      <SectionHeader
        eyebrow={t("Produits", "Products")}
        title={t("Tous vos produits", "All your products")}
        subtitle={t("Toutes natures confondues, dans un seul tableau.", "All types combined, in a single table.")}
        first={first}
        layout="inline"
      />

      {/* Cinq tuiles distinctes, badge circulaire coloré en coin (repris de
          la référence envoyée : label discret + gros chiffre + accent
          couleur en médaillon) — code couleur nature déjà en place ailleurs
          dans le dashboard (cf. [[dashboard-chart-colors-stockage-drop]] —
          stockage bleu, drop rose). Une seule tuile porte l'élément
          signature (vague de marge par produit) : le reste reste sobre. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCell label={t("Produits publiés", "Published products")} value={publies} dot="#141220" />
        <StatCell label={t("En stockage", "Warehoused")} value={enStockage} note={t(`${stockTotal} unités`, `${stockTotal} units`)} dot="#5AA9FF" />
        <StatCell label={t("En drop", "In drop")} value={enDrop} note={t(`${dropPartenaire} partenaire · ${dropLm} LM`, `${dropPartenaire} partner · ${dropLm} LM`)} dot="#EC0C8C" />
        <StatCell label={t("Jamais vendus", "Never sold")} value={jamaisVendus} dot="#DC9A3A" />
        <StatCell
          label={t("Marge moyenne", "Average margin")}
          value={`${margeMoyenne} %`}
          dot="#EC0C8C"
          accent
          wave={produits.map((p) => p.margePct)}
          note={t(`Réparti sur ${produits.length} produits`, `Across ${produits.length} products`)}
        />
      </div>

      <div className="mt-3 mb-8 grid gap-3 lg:grid-cols-[1.75fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <HeaderActionBtn onClick={() => setCategorieModalOuverte(true)}>
              {t("Ajouter une catégorie", "Add a category")}
            </HeaderActionBtn>
            <HeaderActionBtn onClick={() => ouvrirDepotStock()}>{t("Déposer un stock", "Deposit stock")}</HeaderActionBtn>
            <Link
              href="/dashboard/produits/ajouter"
              className="shrink-0 rounded-full bg-brand-pink px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(236,12,140,0.35)] transition hover:bg-brand-pink/90"
            >
              {t("Ajouter un produit", "Add a product")}
            </Link>
          </div>
          <div className="overflow-x-auto pt-10">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--dashboard-text)]/10">
                  {[
                    t("Produit", "Product"),
                    t("Performance", "Performance"),
                    t("Stock", "Stock"),
                    t("Prix", "Price"),
                    t("Tendance", "Trend"),
                    t("Visibilité", "Visibility"),
                    "",
                  ].map((h) => (
                    <th key={h} className="pb-2 pr-3 text-[11px] font-bold tracking-tight text-[var(--dashboard-text)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignesTableau.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[var(--dashboard-text)]/40">
                      {t(`Aucun produit pour « ${recherche} ».`, `No product for “${recherche}”.`)}
                    </td>
                  </tr>
                ) : (
                  lignesTableau.map(({ p, i }) => {
                    const performance = performanceDeMarge(p.margePct);
                    const photo = p.images?.[0];
                    return (
                      <tr
                        key={`${p.nom}-${i}`}
                        onClick={() => setSelected(i)}
                        className={`cursor-pointer border-b border-[var(--dashboard-text)]/[0.05] last:border-0 hover:bg-[var(--dashboard-text)]/[0.04] ${
                          i === selected ? "bg-brand-pink/5" : ""
                        }`}
                      >
                        <td
                          className={`border-l-[3px] py-2.5 pl-2 pr-3 ${
                            i === selected ? "border-brand-pink" : "border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                              style={photo ? { background: "var(--dashboard-card-bg)" } : { background: `${NATURE_HEX[p.nature]}17`, color: NATURE_HEX[p.nature] }}
                            >
                              {photo ? <Image src={photo} alt={t(p.nom, p.nomEn)} fill sizes="40px" className="object-cover" /> : iconeCategorie(p.nom)}
                            </span>
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5">
                                <Nature code={p.nature} />
                                <span className="truncate text-[13px] font-semibold">{texteAvecChiffres(t(p.nom, p.nomEn))}</span>
                              </p>
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="flex items-center gap-1 text-[10px] text-[var(--dashboard-text)]/50 font-figures">
                                  <StarIcon />
                                  {p.avis !== null ? p.avis.toLocaleString(numberLocale) : "—"}
                                </span>
                                <Tag tone={p.etat.tone} className="!px-1.5 !py-0.5 !text-[9px]">
                                  {t(p.etat.label, p.etat.labelEn)}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <PerformanceGauge pct={p.margePct} color={performance.couleur} />
                            <div>
                              <p className="text-[11px] font-bold" style={{ color: performance.couleur }}>
                                {t(performance.label, performance.labelEn)}
                              </p>
                              <p className="text-[10px] text-[var(--dashboard-text)]/40"><span className="font-figures">{p.margePct} %</span> {t("marge", "margin")}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`py-2.5 pr-3 font-semibold font-figures ${p.stock < 10 ? "text-[#c8262d]" : "text-[var(--dashboard-text)]/70"}`}>{p.stock}</td>
                        <td className="py-2.5 pr-3 font-semibold font-figures">{F(p.vente)}</td>
                        <td className="py-2.5 pr-3">
                          <Trend values={p.tendance} />
                        </td>
                        <td className="py-2.5 pr-3" onClick={(e) => e.stopPropagation()}>
                          <ToggleSwitch
                            checked={visibles[i] ?? true}
                            onChange={() => setVisibles((prev) => prev.map((v, vi) => (vi === i ? !v : v)))}
                            label={t(`Visibilité de ${p.nom}`, `${p.nom} visibility`)}
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center justify-end gap-1 text-[var(--dashboard-text)]/40">
                            <IconBtn title={t("Modifier", "Edit")} onClick={() => setSelected(i)}>
                              <PencilIcon />
                            </IconBtn>
                            <IconBtn title={t("Aperçu boutique", "Storefront preview")} onClick={() => setSelected(i)}>
                              <EyeIcon />
                            </IconBtn>
                            <IconBtn title={t("Plus d'actions", "More actions")} onClick={() => setSelected(i)}>
                              <DotsIcon />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title={t("Fiche du produit", "Product sheet")} titleTab className="!bg-[var(--dashboard-glass)]">
          <ProductSelector
            name={t(produit.nom, produit.nomEn)}
            position={t(`Produit ${selected + 1} sur ${produits.length}`, `Product ${selected + 1} of ${produits.length}`)}
            className="mt-3 w-full"
            onPrev={() => setSelected((i) => (i - 1 + produits.length) % produits.length)}
            onNext={() => setSelected((i) => (i + 1) % produits.length)}
          />

          <button
            type="button"
            onClick={() => photos.length > 1 && setPhoto((i) => (i + 1) % photos.length)}
            title={photos.length > 1 ? t("Voir la photo suivante", "View next photo") : undefined}
            className="relative mt-3 flex h-[110px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--dashboard-card-bg)]"
          >
            {photos.length > 0 ? (
              <Image
                src={photos[photo]}
                alt={t(produit.nom, produit.nomEn)}
                fill
                sizes="220px"
                className="object-cover"
              />
            ) : (
              <span className="h-16 w-16 rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)]/70" />
            )}

            {/* Blanc en haut, gris en bas : assombrit le coin bas-droit où
                vivent les dots (sans lui, un point blanc y était invisible,
                cf. [[dashboard-mock-data-pending-laravel-api]] pour l'absence
                de vraie photo tant que l'API ne les fournit pas). */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#c4c4c4_100%)]" />

            {/* 3 dots par défaut (pas 1) tant qu'il n'y a pas de vraies
                photos : signale que c'est un carousel à trois emplacements,
                prêt à les recevoir, cf. [[dashboard-mock-data-pending-laravel-api]]. */}
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
              {(photos.length > 0 ? photos : [null, null, null]).map((_, i) => (
                <span
                  key={i}
                  className={i === photo ? "h-1.5 w-4 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/40"}
                />
              ))}
            </div>
          </button>

          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Nature code={produit.nature} />
              <span className="text-xs font-semibold">{texteAvecChiffres(t(produit.nom, produit.nomEn))}</span>
            </span>
            <Tag tone={produit.etat.tone}>{t(produit.etat.label, produit.etat.labelEn)}</Tag>
          </div>

          <Divider />
          {/* Panneau surélevé pour le groupe "argent" : le distingue du
              groupe stock/avis/litiges en dessous, plutôt que quatre lignes
              de même poids visuel noyées dans la carte. */}
          <div className="rounded-xl p-3" style={{ background: "var(--dashboard-surface-2)" }}>
            <StatRow label={t("Prix de vente", "Sale price")} value={<span className="font-figures">{F(produit.vente)}</span>} compact />
            {produit.achat !== null && <StatRow label={t("Coût de revient", "Cost price")} value={<span className="font-figures">{F(produit.achat)}</span>} compact />}
            {produit.fraisPreleves !== undefined && <StatRow label={t("Frais prélevés", "Fees deducted")} value={<span className="font-figures">{F(produit.fraisPreleves)}</span>} compact />}
            <StatRow label={t("Bénéfice par vente", "Profit per sale")} value={<span className="text-sm text-brand-pink font-figures">{F(benefice)}</span>} compact />
          </div>
          <Divider />
          <StatRow label={t("Stock restant", "Remaining stock")} value={<span className="font-figures">{produit.stock} · {(produit.couverture ? t(produit.couverture, produit.couvertureEn ?? produit.couverture) : "—")}</span>} />
          <StatRow label={t("Vendu sur la période", "Sold this period")} value={<span className="font-figures">{produit.vendu}</span>} />
          <StatRow label={t("Note moyenne", "Average rating")} value={<span className="font-figures">{produit.avis !== null ? `${produit.avis.toLocaleString(numberLocale)} / 5` : "—"}</span>} />
          <StatRow label={t("Litiges", "Disputes")} value={<span className="font-figures">{produit.litiges ?? 0}</span>} />

          <div className="mt-3.5 flex gap-2">
            <Btn variant="white" onClick={modifierProduit}>{t("Modifier", "Edit")}</Btn>
            <Btn variant="dark" onClick={() => ouvrirDepotStock(selected)}>{t("Réapprovisionner", "Restock")}</Btn>
          </div>
          <Btn variant="dark" className="mt-2 mb-2" onClick={retirerProduit} disabled={visibles[selected] === false}>
            {retireConfirme
              ? t("Retiré ✓", "Removed ✓")
              : visibles[selected] === false
                ? t("Déjà retiré de la boutique", "Already removed from shop")
                : t("Retirer de la boutique", "Remove from shop")}
          </Btn>
        </Card>
      </div>

      {categorieModalOuverte && (
        <CreerCategorieModal
          categories={categoriesAvecCompte}
          onFermer={() => setCategorieModalOuverte(false)}
          onCreer={(nom) => {
            ajouterCategorie(nom);
            setCategorieModalOuverte(false);
          }}
        />
      )}
    </>
  );
}

function StatCell({
  label,
  value,
  note,
  dot,
  accent = false,
  wave,
}: {
  label: string;
  value: string | number;
  note?: string;
  /** Couleur du médaillon en coin — code couleur nature du dashboard. */
  dot: string;
  /** Chiffre affiché en rose (métrique la plus regardée de la rangée). */
  accent?: boolean;
  /** Série de valeurs (une par produit, pas dans le temps) pour la vague
   *  qui déborde en bas de la tuile — élément signature réservé à UNE
   *  seule tuile (Marge moyenne), pas répété partout. */
  wave?: number[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--dashboard-card-bg)] p-5 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold tracking-tight text-[var(--dashboard-text)]">{label}</p>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ background: `${dot}1F` }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        </span>
      </div>
      <p className={`mt-3 text-2xl tracking-tight font-figures-bold ${accent ? "text-brand-pink" : ""}`}>{value}</p>
      {note && <p className="mt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{note}</p>}
      {wave && wave.length > 1 && <MarginWave values={wave} color={dot} />}
    </div>
  );
}

/*
  Vague qui déborde en bas de la tuile "Marge moyenne" (inspirée de la
  référence envoyée) : contrairement au sparkline d'une ligne du tableau
  (Trend, dans shared.tsx), l'axe X ici n'est PAS le temps — chaque point
  est la marge d'un produit, dans l'ordre du catalogue. Un seul stat porte
  cet élément, pour rester "signature" et ne pas alourdir les 4 autres.
*/
/* Jauge en anneau de la colonne "Performance" — même technique que
   AnneauCompteARebours (dashboard-commandes/shared.tsx) : cercle de fond
   translucide + cercle coloré tronqué au strokeDasharray, pas mutualisée
   entre les deux dossiers (cf. commentaire équivalent sur ToggleSwitch
   ci-dessous). */
function PerformanceGauge({ pct, color, size = 30 }: { pct: number; color: string; size?: number }) {
  const rayon = (size / 2) - 3;
  const circonference = 2 * Math.PI * rayon;
  const rempli = Math.min(1, Math.max(0, pct / 60)); // 60 % de marge = jauge pleine
  const offset = circonference * (1 - rempli);
  const centre = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" style={{ height: size, width: size }}>
      <circle cx={centre} cy={centre} r={rayon} fill="none" stroke="var(--dashboard-text)" strokeOpacity="0.1" strokeWidth="3" />
      <circle
        cx={centre}
        cy={centre}
        r={rayon}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circonference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--dashboard-text)]/25" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4.5 17 4.8-5 3.6 3.8 2.4-2.6L20 17" />
    </svg>
  );
}

function MontreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="7.5" y="8" width="9" height="8" rx="2" />
      <path d="M9 8V5.2h6V8M9 16v2.8h6V16M12 10.5V12l1.4.8" />
    </svg>
  );
}

function CasqueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="6" rx="1.6" />
      <rect x="17" y="13" width="4" height="6" rx="1.6" />
    </svg>
  );
}

function BraceletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="7" strokeDasharray="3.4 3" />
      <circle cx="12" cy="5.3" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="10" width="12" height="9" rx="2" />
      <path d="M5.5 10h13M7.5 10V7.5a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5V10" />
    </svg>
  );
}

function FlaconIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="8.5" y="9" width="7" height="10.5" rx="1.8" />
      <path d="M10.3 9V6.2a1.7 1.7 0 0 1 1.7-1.7 1.7 1.7 0 0 1 1.7 1.7V9" />
      <path d="M8.5 13h7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 text-[#DC9A3A]" fill="currentColor" aria-hidden>
      <path d="M12 2.5 15 9 22 9.7 16.8 14.2 18.3 21 12 17.3 5.7 21 7.2 14.2 2 9.7 9 9Z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16.5 3.5 20.5 7.5 8 20 3.5 20.5 4 16Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

function IconBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[var(--dashboard-text)]/8 hover:text-[var(--dashboard-text)]"
    >
      {children}
    </button>
  );
}

/* Même composant que dashboard-reglages/FinancesReglements.tsx et
   dashboard-profil/MotDePasseSecurite.tsx, repris à l'identique — pas
   encore mutualisé dans shared.tsx. */
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
        checked ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[var(--dashboard-text)]/20"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}

function MarginWave({ values, color }: { values: number[]; color: string }) {
  const w = 200;
  const h = 40;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => ({
    x: (i / (values.length - 1 || 1)) * w,
    y: h - ((v - min) / range) * (h - 6) - 3,
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const area = `${d} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-9 w-full" aria-hidden fill="none">
      <path d={area} fill={color} fillOpacity={0.12} stroke="none" />
      <path d={d} stroke={color} strokeOpacity={0.5} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
