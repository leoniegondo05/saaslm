"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/*
  Panier de la boutique publique (/boutique/[slug]) — persisté en
  localStorage sous la clé `lm-panier-${slug}`, une boutique par clé pour ne
  jamais mélanger le panier d'un marchand avec celui d'un autre visité dans
  le même navigateur.

  Même patron que PersonnaliserBoutique.tsx (cf. `charge`/useEffect autour de
  CLE_STOCKAGE) : on ne relit localStorage qu'après le montage pour éviter un
  mismatch d'hydratation SSR (le premier rendu, identique serveur/client,
  reste sur un panier vide) — voir `pret` ci-dessous, qui distingue "panier
  pas encore relu" de "panier réellement vide" pour les pages qui doivent
  agir différemment dans ces deux cas (ex. commande/page.tsx : rediriger
  seulement une fois sûr que le panier est vraiment vide).
*/

export type CartItem = { produitId: string; quantite: number };

type CartContextValue = {
  items: CartItem[];
  ajouter: (produitId: string, quantite?: number) => void;
  retirer: (produitId: string) => void;
  definirQuantite: (produitId: string, quantite: number) => void;
  vider: () => void;
  nombreArticles: number;
  /** `true` une fois la lecture localStorage terminée (cf. commentaire plus
   *  haut) — ajout au-delà de la liste demandée, nécessaire pour ne pas
   *  rediriger "panier vide" avant d'avoir eu la chance de le relire. */
  pret: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart() doit être appelé sous <CartProvider>");
  return ctx;
}

export function CartProvider({
  slug,
  children,
  previsualisation = false,
  itemsInitiaux,
}: {
  slug: string;
  children: ReactNode;
  /** true dans l'aperçu éditeur (BoutiquePreview.tsx) : le panier reste en
   *  mémoire pour la session d'édition, jamais lu ni écrit sur
   *  localStorage — évite qu'ouvrir l'éditeur pollue le vrai panier d'un
   *  visiteur (ou du marchand lui-même) sous le même `slug`. `ajouter`/
   *  `retirer`/... se comportent à l'identique, seule la persistance change. */
  previsualisation?: boolean;
  /** Panier de départ (aperçu "commande" uniquement, cf. apercu/commande/
   *  page.tsx) : CommandeClient.tsx ne rend rien et redirige si le panier
   *  est vide à son premier rendu — un `useEffect` qui ajouterait un article
   *  après coup arrive toujours trop tard (les effets des descendants,
   *  CommandeClient inclus, se déclenchent avant ceux d'un ancêtre au même
   *  commit, donc la redirection "panier vide" a déjà eu lieu). Poser l'état
   *  initial directement évite ce problème d'ordre : le panier n'est jamais
   *  vide au premier rendu. Ignoré hors `previsualisation`. */
  itemsInitiaux?: CartItem[];
}) {
  const cle = previsualisation ? null : `lm-panier-${slug}`;
  const [items, setItems] = useState<CartItem[]>(previsualisation ? (itemsInitiaux ?? []) : []);
  const [pret, setPret] = useState(previsualisation);

  useEffect(() => {
    if (!cle) return;
    try {
      const brut = localStorage.getItem(cle);
      if (brut) {
        const sauvegarde = JSON.parse(brut) as unknown;
        if (Array.isArray(sauvegarde)) {
          setItems(
            sauvegarde.filter(
              (i): i is CartItem => !!i && typeof i.produitId === "string" && typeof i.quantite === "number" && i.quantite > 0
            )
          );
        }
      }
    } catch {
      // localStorage indisponible (navigation privée, quota...) : panier vide pour la session.
    } finally {
      setPret(true);
    }
    // `cle` dépend de `slug`/`previsualisation`, fixes pour la durée de vie du provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pret || !cle) return;
    try {
      localStorage.setItem(cle, JSON.stringify(items));
    } catch {
      // idem : échec silencieux, le panier reste utilisable pour la session en cours.
    }
  }, [pret, cle, items]);

  const ajouter = useCallback((produitId: string, quantite = 1) => {
    setItems((prev) => {
      const existant = prev.find((i) => i.produitId === produitId);
      if (existant) {
        return prev.map((i) => (i.produitId === produitId ? { ...i, quantite: i.quantite + quantite } : i));
      }
      return [...prev, { produitId, quantite }];
    });
  }, []);

  const retirer = useCallback((produitId: string) => {
    setItems((prev) => prev.filter((i) => i.produitId !== produitId));
  }, []);

  const definirQuantite = useCallback((produitId: string, quantite: number) => {
    setItems((prev) => {
      if (quantite <= 0) return prev.filter((i) => i.produitId !== produitId);
      return prev.map((i) => (i.produitId === produitId ? { ...i, quantite } : i));
    });
  }, []);

  const vider = useCallback(() => setItems([]), []);

  const nombreArticles = useMemo(() => items.reduce((somme, i) => somme + i.quantite, 0), [items]);

  const valeur = useMemo<CartContextValue>(
    () => ({ items, ajouter, retirer, definirQuantite, vider, nombreArticles, pret }),
    [items, ajouter, retirer, definirQuantite, vider, nombreArticles, pret]
  );

  return <CartContext.Provider value={valeur}>{children}</CartContext.Provider>;
}
