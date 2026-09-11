"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";

/*
  Recherche plein texte du contenu du dashboard (pas seulement des titres de
  section/fiche) — posée par DashboardSearchBar, consommée ici par Accueil
  (7 sections) et Réglages (6 fiches).

  Principe : RechercheProvider dépose le terme tapé dans un contexte ; tout
  bloc qui se mesure via useFiltrable (Card, cf. dashboard-accueil/shared.tsx)
  ou s'enveloppe dans <Filtrable> se cache seul (display:none, jamais démonté
  — pour ne pas perdre l'état d'un carousel ou d'un onglet interne resté
  ouvert) dès que le texte qu'il affiche réellement ne contient pas le
  terme. Pas de liste de mots-clés à tenir à jour par carte, pas de forme de
  donnée commune à respecter entre les sections : on lit le DOM rendu, quelle
  que soit sa forme.

  Produits et Commande filtrent déjà leurs propres lignes de données
  (ProduitsCatalogue, CommandesListe) et n'ont pas besoin de ce mécanisme :
  leurs pages ne posent pas de RechercheProvider, donc useRecherche() y
  renvoie "" (valeur par défaut du contexte) et Card ne s'y cache jamais.
*/

const RechercheContext = createContext("");

export function RechercheProvider({ value, children }: { value: string; children: React.ReactNode }) {
  return <RechercheContext.Provider value={value.trim().toLowerCase()}>{children}</RechercheContext.Provider>;
}

export function useRecherche() {
  return useContext(RechercheContext);
}

/*
  Mesure le texte réellement rendu sous `ref` et dit s'il contient le terme
  en cours. `onMatchChange` est optionnel — utile pour qu'un parent (une
  section entière) sache si elle n'a plus aucun contenu visible et affiche
  "Aucun résultat" à la place, plutôt que de laisser un titre de section
  sans rien dessous.
*/
export function useFiltrable(onMatchChange?: (match: boolean) => void) {
  const q = useRecherche();
  const ref = useRef<HTMLDivElement>(null);
  const [match, setMatch] = useState(true);

  useLayoutEffect(() => {
    const next = !q || (ref.current?.textContent?.toLowerCase().includes(q) ?? true);
    setMatch(next);
    onMatchChange?.(next);
    // onMatchChange volontairement absent des deps : identité recréée à
    // chaque rendu côté appelant, on ne veut réagir qu'à un terme qui change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return { ref, match };
}

/*
  Version "wrapper" de useFiltrable pour envelopper un bloc qui ne rend pas
  déjà un unique élément racine (ex: une section entière = SectionHeader +
  plusieurs Card) — ajoute un `div` porteur, sans impact visuel en dehors
  d'une grille CSS (les pages Accueil/Réglages empilent leurs sections en
  flux normal, pas en grid).
*/
export function Filtrable({
  children,
  className,
  onMatchChange,
}: {
  children: React.ReactNode;
  className?: string;
  onMatchChange?: (match: boolean) => void;
}) {
  const { ref, match } = useFiltrable(onMatchChange);
  return (
    <div ref={ref} className={className} style={match ? undefined : { display: "none" }}>
      {children}
    </div>
  );
}
