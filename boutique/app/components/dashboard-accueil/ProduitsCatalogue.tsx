"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Btn, Card, Divider, Nature, ProductSelector, SectionHeader, StatRow, Tag, Trend } from "./shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import CreerCategorieModal from "../dashboard-produits/CreerCategorieModal";
import { CATEGORIES_DEFAUT } from "../dashboard-produits/ajouter-produit/categoriesDefaut";
import { lireEtViderProduitEnAttente, lireEtViderCategoriesEnAttente } from "../dashboard-produits/ajouter-produit/pendingProduitStore";
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

type Produit = {
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

const PRODUITS_INITIAUX: Produit[] = [
  { nom: "Montre connectée S8", nomEn: "S8 connected watch", nature: "L", achat: 6200, vente: 14000, stock: 340, vendu: 48, margePct: 31, avis: 4.5, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 1660, couverture: "21 jours", couvertureEn: "21 days", litiges: 3, tendance: [5, 6, 5, 7, 6, 8, 7, 9, 10, 11] },
  { nom: "Sérum éclat 30 ml", nomEn: "Radiance serum 30 ml", nature: "S", achat: 4300, vente: 12000, stock: 83, vendu: 37, margePct: 46, avis: 4.7, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 2180, couverture: "22 jours", couvertureEn: "22 days", litiges: 0, tendance: [4, 5, 4, 6, 5, 7, 6, 8, 9, 5] },
  { nom: "Casque sans fil X2", nomEn: "X2 wireless headset", nature: "P", achat: 4800, vente: 11000, stock: 96, vendu: 21, margePct: 34, avis: 3.4, etat: { label: "Avis négatifs", labelEn: "Negative reviews", tone: "warn" }, fraisPreleves: 1420, couverture: "13 jours", couvertureEn: "13 days", litiges: 1, tendance: [6, 6, 5, 5, 4, 4, 3, 3, 2, 1] },
  { nom: "Huile de ricin 100 ml", nomEn: "Castor oil 100 ml", nature: "S", achat: 2600, vente: 7500, stock: 2, vendu: 58, margePct: 44, avis: 4.8, etat: { label: "Rupture · 1 j", labelEn: "Out of stock · 1 day", tone: "ko" }, fraisPreleves: 1580, couverture: "1 jour", couvertureEn: "1 day", litiges: 0, tendance: [7, 8, 7, 9, 10, 11, 12, 13, 12, 14] },
  { nom: "Beurre de karité 200 g", nomEn: "Shea butter 200 g", nature: "S", achat: 4100, vente: 9000, stock: 127, vendu: 73, margePct: 42, avis: 4.6, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 1120, couverture: "34 jours", couvertureEn: "34 days", litiges: 0, tendance: [8, 8, 7, 8, 9, 8, 9, 10, 9, 10] },
  { nom: "Bracelet cuir", nomEn: "Leather bracelet", nature: "S", achat: 3800, vente: 6000, stock: 28, vendu: 2, margePct: 29, avis: 4.2, etat: { label: "Rotation lente", labelEn: "Slow turnover", tone: "warn" }, fraisPreleves: 460, couverture: "60+ jours", couvertureEn: "60+ days", litiges: 0, tendance: [2, 2, 1, 1, 1, 0, 1, 0, 1, 0] },
  { nom: "Lotion tonique", nomEn: "Toning lotion", nature: "L", achat: 3800, vente: 8900, stock: 210, vendu: 9, margePct: 38, avis: 4.4, etat: { label: "Actif", labelEn: "Active", tone: "ok" }, fraisPreleves: 1440, couverture: "40 jours", couvertureEn: "40 days", litiges: 0, tendance: [3, 2, 3, 2, 3, 2, 4, 3, 4, 3] },
  { nom: "Gel nettoyant", nomEn: "Cleansing gel", nature: "P", achat: 2200, vente: 6000, stock: 140, vendu: 4, margePct: 36, avis: null, etat: { label: "Jamais vendu", labelEn: "Never sold", tone: "warn" }, fraisPreleves: 940, couverture: "35 jours", couvertureEn: "35 days", litiges: 0, tendance: [0, 0, 0, 1, 0, 0, 1, 0, 0, 1] },
];

// Code affiché dans la colonne "Source" du tableau : L (LM) et P (partenaire)
// sont deux variantes de drop — on les affiche sous le même badge "D", S
// (stockage) reste distinct. Le champ `nature` d'origine garde P/L intacts
// pour les compteurs "dropPartenaire"/"dropLm" ci-dessous.
const sourceBadge = (nature: Nature4) => (nature === "S" ? "S" : "D");

/*
  Transforme la charge du formulaire "Ajouter un produit" en une ligne du
  tableau local. Purement un mapping d'affichage : le jour où l'API
  Laravel existe, c'est sa réponse (avec un vrai id, de vraies URLs de
  photos hébergées...) qui remplacera ce mapping, pas les composants du
  formulaire eux-mêmes — cf. [[dashboard-mock-data-pending-laravel-api]].
  Les photos choisies restent pour l'instant dans le formulaire (fichiers
  locaux, jamais uploadés) : sans endpoint de stockage, on n'affiche pas de
  faux lien vers un fichier qui n'existe nulle part côté serveur.
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
  };
}

export default function ProduitsCatalogue({ first = true }: { first?: boolean }) {
  const { t, langue } = useDashboardLangue();
  const numberLocale = langue === "EN" ? "en-US" : "fr-FR";
  const F = (n: number) => `${n.toLocaleString(numberLocale)} F`;
  const [produits, setProduits] = useState<Produit[]>(PRODUITS_INITIAUX);
  const [categories, setCategories] = useState<Categorie[]>(CATEGORIES_DEFAUT);
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
    setSelected(0);
  };

  // Une catégorie créée depuis le formulaire "Ajouter un produit" doit
  // aussi apparaître ici : source unique de vérité pour les catégories de
  // la boutique, pas une copie qui divergerait des deux côtés.
  const ajouterCategorie = (nom: string) => {
    setCategories((prev) => [...prev, { id: `cat-${Math.random().toString(36).slice(2, 9)}`, nom, nomEn: nom }]);
  };

  // Le formulaire vit maintenant sur sa propre page
  // (/dashboard/produits/ajouter) : ce qu'il produit revient via
  // pendingProduitStore plutôt qu'un callback direct, donc on le lit une
  // seule fois au montage puis on vide le pont pour ne pas réappliquer le
  // même produit à chaque re-render.
  useEffect(() => {
    const enAttente = lireEtViderProduitEnAttente();
    if (enAttente) ajouterProduit(enAttente.produit, enAttente.statut);
    const nouvellesCategories = lireEtViderCategoriesEnAttente();
    if (nouvellesCategories.length > 0) setCategories((prev) => [...prev, ...nouvellesCategories]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <>
      <SectionHeader
        eyebrow={t("Produits", "Products")}
        title={t("Tous vos produits", "All your products")}
        subtitle={t("Toutes natures confondues, dans un seul tableau.", "All types combined, in a single table.")}
        count={t(`${produits.length} produits`, `${produits.length} products`)}
        first={first}
        layout="inline"
      />

      {/* Un seul cadre, séparé par des traits (divide-x/y) — pas cinq cartes
          côte à côte : chaque étiquette reste en onglet (même trait que
          Card titleTab) mais posée sur le même fond continu. */}
      <div className="grid grid-cols-2 divide-x divide-y divide-[var(--dashboard-text)]/10 overflow-hidden rounded-2xl bg-[var(--dashboard-card-bg)] shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        <StatCell label={t("Produits publiés", "Published products")} value={publies} />
        <StatCell label={t("En stockage", "Warehoused")} value={enStockage} note={t(`${stockTotal} unités`, `${stockTotal} units`)} />
        <StatCell label={t("En drop", "In drop")} value={enDrop} note={t(`${dropPartenaire} partenaire · ${dropLm} LM`, `${dropPartenaire} partner · ${dropLm} LM`)} />
        <StatCell label={t("Jamais vendus", "Never sold")} value={jamaisVendus} />
        <StatCell label={t("Marge moyenne", "Average margin")} value={`${margeMoyenne} %`} />
      </div>

      <div className="mt-3 mb-8 grid gap-3 lg:grid-cols-[1.75fr_1fr] [&>*]:min-w-0">
        <Card className="!bg-[var(--dashboard-glass)]">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategorieModalOuverte(true)}
                className="rounded-full border border-[var(--dashboard-text)]/15 bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink"
              >
                {t("Ajouter une catégorie", "Add a category")}
              </button>
              <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white dark:bg-brand-pink">
                {t("Déposer un stock", "Deposit stock")}
              </button>
              <Link
                href="/dashboard/produits/ajouter"
                className="rounded-full bg-[var(--dashboard-card-bg)] px-4 py-2 text-xs font-semibold shadow-[0_2px_10px_rgba(20,18,32,0.08)]"
              >
                {t("Ajouter un produit", "Add a product")}
              </Link>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--dashboard-text)]/10">
                  {[
                    t("Produit", "Product"),
                    t("Source", "Source"),
                    t("Achat", "Cost"),
                    t("Vente", "Price"),
                    t("Stock", "Stock"),
                    t("Vendu", "Sold"),
                    t("Marge", "Margin"),
                    t("Avis", "Rating"),
                    t("État", "Status"),
                    t("Tendance", "Trend"),
                  ].map((h, i) => (
                    <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">
                      {i === 0 ? (
                        <span className="inline-block rounded-full bg-[#141220] px-3 py-2 text-white dark:bg-brand-pink">{h}</span>
                      ) : (
                        h
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produits.map((p, i) => (
                  <tr
                    key={`${p.nom}-${i}`}
                    onClick={() => setSelected(i)}
                    className={`cursor-pointer border-b border-[var(--dashboard-text)]/[0.05] last:border-0 hover:bg-[var(--dashboard-text)]/[0.03] ${
                      i === selected ? "bg-brand-pink/5" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{t(p.nom, p.nomEn)}</td>
                    <td className="py-2 pr-3"><Nature code={sourceBadge(p.nature)} /></td>
                    <td className="py-2 pr-3">{p.achat !== null ? F(p.achat) : "—"}</td>
                    <td className="py-2 pr-3">{F(p.vente)}</td>
                    <td className="py-2 pr-3">{p.stock}</td>
                    <td className="py-2 pr-3">{p.vendu}</td>
                    <td className="py-2 pr-3">{p.margePct} %</td>
                    <td className="py-2 pr-3">{p.avis !== null ? p.avis.toLocaleString(numberLocale) : "—"}</td>
                    <td className="py-2 pr-3">
                      <Tag tone={p.etat.tone}>{t(p.etat.label, p.etat.labelEn)}</Tag>
                    </td>
                    <td className="py-2 pr-3">
                      <Trend values={p.tendance} />
                    </td>
                  </tr>
                ))}
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
              <span className="text-xs font-semibold">{t(produit.nom, produit.nomEn)}</span>
            </span>
            <Tag tone={produit.etat.tone}>{t(produit.etat.label, produit.etat.labelEn)}</Tag>
          </div>

          <Divider />
          <StatRow label={t("Prix de vente", "Sale price")} value={F(produit.vente)} />
          {produit.achat !== null && <StatRow label={t("Coût de revient", "Cost price")} value={F(produit.achat)} />}
          {produit.fraisPreleves !== undefined && <StatRow label={t("Frais prélevés", "Fees deducted")} value={F(produit.fraisPreleves)} />}
          <StatRow label={t("Bénéfice par vente", "Profit per sale")} value={<span className="text-brand-pink">{F(benefice)}</span>} />
          <Divider />
          <StatRow label={t("Stock restant", "Remaining stock")} value={`${produit.stock} · ${(produit.couverture ? t(produit.couverture, produit.couvertureEn ?? produit.couverture) : "—")}`} />
          <StatRow label={t("Vendu sur la période", "Sold this period")} value={String(produit.vendu)} />
          <StatRow label={t("Note moyenne", "Average rating")} value={produit.avis !== null ? `${produit.avis.toLocaleString(numberLocale)} / 5` : "—"} />
          <StatRow label={t("Litiges", "Disputes")} value={String(produit.litiges ?? 0)} />

          <div className="mt-3.5 flex gap-2">
            <Btn variant="white">{t("Modifier", "Edit")}</Btn>
            <Btn variant="dark">{t("Réapprovisionner", "Restock")}</Btn>
          </div>
          <Btn variant="dark" className="mt-2 mb-2">{t("Retirer de la boutique", "Remove from shop")}</Btn>
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

function StatCell({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="px-4 pb-4 pt-4">
      <div className="relative -mt-4 flex justify-center">
        <p
          className="rounded-b-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8095]"
          style={{ background: "var(--dashboard-surface-2)" }}
        >
          {label}
        </p>
      </div>
      <p className="mt-2 text-center text-xl font-bold tracking-tight">{value}</p>
      {note && <p className="mt-0.5 text-center text-[9px] text-[var(--dashboard-text)]/35">{note}</p>}
    </div>
  );
}
