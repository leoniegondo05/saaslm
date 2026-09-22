import { promises as fs } from "fs";
import path from "path";
import type { AvisClient, BoutiqueDonnees, BoutiqueIdentite } from "./boutique-types";
import { ETAT_DEFAUT } from "../app/components/dashboard-reglages/personnaliser/types";

export type { BoutiqueIdentite, ProduitPublic, CategoriePublique, BoutiqueDonnees } from "./boutique-types";

/*
  Pont de persistance entre "Personnaliser ma boutique" (dashboard, privé) et
  "Ma boutique" (site public, /boutique/[slug]) — voir app/api/boutique/[slug]/route.ts
  côté écriture (PUT, appelé par PersonnaliserBoutique.tsx/ProduitsCatalogue.tsx)
  et app/boutique/[slug]/layout.tsx côté lecture.

  Stockage fichier JSON (un fichier par boutique, .data/boutiques/<slug>.json)
  en attendant l'API Laravel — cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
  Volontairement pas localStorage : localStorage est isolé par origine et ne
  peut pas relier un onglet dashboard à un onglet /boutique/[slug] du même
  serveur ; un fichier lu/écrit côté serveur, lui, est visible des deux.
  Remplacer ce module par de vrais appels lib/api/services/boutique.ts quand
  l'API existe — aucun composant n'importe le chemin fichier directement,
  seulement les fonctions exportées ici.
*/

const DOSSIER = path.join(process.cwd(), ".data", "boutiques");

function cheminFichier(slug: string): string {
  // slug déjà normalisé par genererSlug() côté appelant ; on retire quand
  // même tout séparateur de chemin résiduel par sécurité (traversal).
  const sûr = slug.replace(/[^a-z0-9-]/g, "");
  return path.join(DOSSIER, `${sûr}.json`);
}

import { PRODUITS_DEMO, CATEGORIES_DEMO, fabriquerAvisDemo } from "./boutique-demo";

function boutiqueParDefaut(slug: string): BoutiqueDonnees {
  return {
    identite: {
      nom: slug === "awa-beaute" ? "Awa Beauté" : slug,
      slug,
      secteur: "Beauté et soins",
      presentation: "Cosmétiques et soins naturels, préparés et conditionnés à Abidjan. Livraison dans tout le district.",
      logo: null,
      ouverte: true,
    },
    editeur: ETAT_DEFAUT,
    produits: PRODUITS_DEMO,
    categories: CATEGORIES_DEMO,
    avis: fabriquerAvisDemo(),
    misAJour: Date.now(),
  };
}

export async function lireBoutique(slug: string): Promise<BoutiqueDonnees | null> {
  try {
    const brut = await fs.readFile(cheminFichier(slug), "utf-8");
    const donnees = JSON.parse(brut) as BoutiqueDonnees;
    return { ...donnees, avis: donnees.avis ?? [] };
  } catch {
    // Si aucun fichier n'existe sur le disque (ex: sur une autre machine après un git clone
    // ou sur Vercel où .data/ n'est pas versionné), renvoyer une boutique initiale complète
    // avec les produits et images de démonstration plutôt qu'un échec 404 sans images.
    if (slug === "awa-beaute" || slug === "maboutique") {
      return boutiqueParDefaut(slug);
    }
    return null;
  }
}

export async function ecrireBoutique(slug: string, donnees: Omit<BoutiqueDonnees, "misAJour">): Promise<BoutiqueDonnees> {
  const complet: BoutiqueDonnees = { ...donnees, misAJour: Date.now() };
  try {
    await fs.mkdir(DOSSIER, { recursive: true });
    await fs.writeFile(cheminFichier(slug), JSON.stringify(complet, null, 2), "utf-8");
  } catch {
    // Échec silencieux si environnement sans écriture disque (ex: Vercel)
  }
  return complet;
}

/** Fusionne un patch partiel dans la boutique existante (ou vide) — utilisé
 *  quand un écran (ex. ProduitsCatalogue.tsx) ne connaît que "ses" données
 *  (produits) et ne doit pas écraser le reste (editeur, identite) enregistré
 *  par un autre écran. */
export async function fusionnerBoutique(slug: string, patch: Partial<Omit<BoutiqueDonnees, "misAJour">>): Promise<BoutiqueDonnees> {
  const existant = await lireBoutique(slug);
  const base: Omit<BoutiqueDonnees, "misAJour"> = {
    identite: patch.identite ?? existant?.identite ?? IDENTITE_VIDE,
    // Un écran comme MaBoutique.tsx (identité) ou ProduitsCatalogue.tsx
    // (produits) peut enregistrer avant que l'éditeur "Personnaliser ma
    // boutique" ne l'ait jamais fait — ETAT_DEFAUT (mêmes valeurs par
    // défaut que l'éditeur) évite qu'un editeur null fasse planter la page
    // publique tant que le marchand n'a pas encore ouvert l'éditeur.
    editeur: patch.editeur ?? existant?.editeur ?? ETAT_DEFAUT,
    produits: patch.produits ?? existant?.produits ?? [],
    categories: patch.categories ?? existant?.categories ?? [],
    avis: patch.avis ?? existant?.avis ?? [],
  };
  return ecrireBoutique(slug, base);
}

/** Ajoute un avis client réel à la boutique (formulaire public, cf.
 *  app/api/boutique/[slug]/avis/route.ts) sans toucher au reste — contrairement
 *  à fusionnerBoutique(), qui remplacerait tout le tableau `avis` par celui
 *  du patch, ce qui effacerait les avis déjà là si l'appelant n'en connaît
 *  qu'un seul (cas ici). `null` si la boutique n'existe pas (slug inconnu). */
export async function ajouterAvis(slug: string, avis: AvisClient): Promise<BoutiqueDonnees | null> {
  const existant = await lireBoutique(slug);
  if (!existant) return null;
  const { misAJour: _misAJour, ...base } = existant;
  return ecrireBoutique(slug, { ...base, avis: [avis, ...base.avis] });
}

const IDENTITE_VIDE: BoutiqueIdentite = {
  nom: "",
  slug: "",
  secteur: "",
  presentation: "",
  logo: null,
  ouverte: false,
};

export { slugifier as genererSlug } from "./boutique-types";
