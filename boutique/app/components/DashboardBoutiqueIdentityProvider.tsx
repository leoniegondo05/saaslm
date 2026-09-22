"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { slugifier } from "../../lib/boutique-types";

/*
  Identité de la boutique (nom, slug public, secteur, présentation, statut
  ouverte/fermée) : état partagé entre MaBoutique.tsx (où elle s'édite),
  PersonnaliserBoutique.tsx (qui l'affiche dans sa barre d'outils et
  l'envoie à /api/boutique/[slug] au "Enregistrer") et le header du
  dashboard — même principe que DashboardBoutiqueLogoProvider (contexte
  monté une fois dans app/dashboard/layout.tsx), mais persistée en
  localStorage : contrairement au logo (data URL potentiellement lourde,
  sans backend d'upload), ces champs sont du texte simple et perdre
  "Awa Beauté" à chaque F5 serait plus gênant qu'utile pendant le développement.

  `slug` remplace l'ancien champ libre `adresse` de MaBoutique.tsx
  ("awa-beaute.liivremoi.com" codé en dur) : dérivé automatiquement du nom
  tant que l'utilisateur ne l'a pas modifié à la main (cf. `slugPersonnalise`),
  pour qu'un changement de nom de boutique fasse suivre le lien public sans
  le casser silencieusement une fois personnalisé — cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] pour le choix "fichier JSON
  serveur" plutôt qu'un vrai backend.
*/

export type BoutiqueIdentite = {
  nom: string;
  slug: string;
  secteur: string;
  presentation: string;
  ouverte: boolean;
};

const IDENTITE_DEFAUT: BoutiqueIdentite = {
  nom: "Awa Beauté",
  slug: "awa-beaute",
  secteur: "Beauté et soins",
  presentation:
    "Cosmétiques et soins naturels, préparés et conditionnés à Abidjan. Livraison dans tout le district.",
  ouverte: true,
};

const CLE_STOCKAGE = "lm-boutique-identite";
// Mémorise si le slug a déjà été personnalisé à la main : au-delà, un
// changement de nom ne le régénère plus automatiquement.
const CLE_SLUG_PERSONNALISE = "lm-boutique-slug-personnalise";

type DashboardBoutiqueIdentityContextValue = {
  identite: BoutiqueIdentite;
  /** Met à jour un ou plusieurs champs ; si `nom` change et que le slug n'a
   *  jamais été personnalisé à la main, régénère aussi `slug`. */
  setIdentite: (maj: Partial<BoutiqueIdentite>) => void;
  /** true dès que l'utilisateur a modifié `slug` lui-même au moins une fois. */
  slugPersonnalise: boolean;
};

const DashboardBoutiqueIdentityContext = createContext<DashboardBoutiqueIdentityContextValue | null>(null);

export function DashboardBoutiqueIdentityProvider({ children }: { children: React.ReactNode }) {
  const [identite, setIdentiteRaw] = useState<BoutiqueIdentite>(IDENTITE_DEFAUT);
  const [slugPersonnalise, setSlugPersonnalise] = useState(false);

  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      if (brut) setIdentiteRaw({ ...IDENTITE_DEFAUT, ...(JSON.parse(brut) as Partial<BoutiqueIdentite>) });
      setSlugPersonnalise(localStorage.getItem(CLE_SLUG_PERSONNALISE) === "1");
    } catch {
      // localStorage indisponible : on reste sur IDENTITE_DEFAUT pour la session en cours.
    }
  }, []);

  const setIdentite = (maj: Partial<BoutiqueIdentite>) => {
    setIdentiteRaw((cur) => {
      const slugFourni = typeof maj.slug === "string" && maj.slug !== cur.slug;
      const suivant: BoutiqueIdentite = {
        ...cur,
        ...maj,
        slug: slugFourni
          ? slugifier(maj.slug!)
          : maj.nom && maj.nom !== cur.nom && !slugPersonnalise
            ? slugifier(maj.nom)
            : cur.slug,
      };
      try {
        localStorage.setItem(CLE_STOCKAGE, JSON.stringify(suivant));
        if (slugFourni) {
          localStorage.setItem(CLE_SLUG_PERSONNALISE, "1");
        }
      } catch {
        // idem : échec silencieux, l'identité reste utilisable pour la session en cours.
      }
      if (slugFourni) setSlugPersonnalise(true);
      return suivant;
    });
  };

  return (
    <DashboardBoutiqueIdentityContext.Provider value={{ identite, setIdentite, slugPersonnalise }}>
      {children}
    </DashboardBoutiqueIdentityContext.Provider>
  );
}

export function useDashboardBoutiqueIdentity() {
  const ctx = useContext(DashboardBoutiqueIdentityContext);
  if (!ctx) {
    throw new Error("useDashboardBoutiqueIdentity doit être utilisé sous DashboardBoutiqueIdentityProvider");
  }
  return ctx;
}
