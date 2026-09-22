import { promises as fs } from "fs";
import path from "path";
import type { BoutiqueDonnees, BoutiqueIdentite } from "./boutique-types";
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

export async function lireBoutique(slug: string): Promise<BoutiqueDonnees | null> {
  try {
    const brut = await fs.readFile(cheminFichier(slug), "utf-8");
    const donnees = JSON.parse(brut) as BoutiqueDonnees;
    // `avis` ajouté après coup (cf. AvisClient dans boutique-types.ts) : un
    // fichier .json déjà écrit par une boutique existante ne l'a pas encore
    // — tableau vide plutôt qu'`undefined` pour que SectionAvis.tsx n'ait
    // jamais à se soucier d'un champ manquant.
    return { ...donnees, avis: donnees.avis ?? [] };
  } catch {
    return null;
  }
}

export async function ecrireBoutique(slug: string, donnees: Omit<BoutiqueDonnees, "misAJour">): Promise<BoutiqueDonnees> {
  await fs.mkdir(DOSSIER, { recursive: true });
  const complet: BoutiqueDonnees = { ...donnees, misAJour: Date.now() };
  await fs.writeFile(cheminFichier(slug), JSON.stringify(complet, null, 2), "utf-8");
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

const IDENTITE_VIDE: BoutiqueIdentite = {
  nom: "",
  slug: "",
  secteur: "",
  presentation: "",
  logo: null,
  ouverte: false,
};

export { slugifier as genererSlug } from "./boutique-types";
