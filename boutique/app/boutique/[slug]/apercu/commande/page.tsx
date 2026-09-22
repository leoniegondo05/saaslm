"use client";

import { useParams } from "next/navigation";
import CommandeContenu from "@/app/components/boutique-publique/CommandeContenu";
import { CartProvider } from "@/app/components/boutique-publique/CartProvider";
import { ApercuChargement, PreviewNavigationProvider, useApercuDonnees } from "@/app/components/boutique-publique/PreviewMode";
import { variablesBoutique } from "@/lib/boutique-style";

/*
  Route brouillon de la page commande/paiement — miroir de app/boutique/[slug]/
  (public)/commande/page.tsx, cf. apercu/page.tsx pour le fonctionnement général
  (postMessage, pas de garde identite.ouverte).

  Auto-seed du panier sandboxé : on passe itemsInitiaux directement au
  CartProvider plutôt qu'un AutoSeedPanier via useEffect — ce dernier arrive
  toujours après le premier rendu de CommandeClient (les effets des descendants
  se déclenchent avant ceux d'un ancêtre, cf. commentaire dans CartProvider.tsx),
  donc CommandeClient voyait le panier vide dès le premier rendu et redirigeait
  instantanément vers l'accueil avant que le seed ne s'exécute.
*/
export default function ApercuCommandePage() {
  const { slug } = useParams<{ slug: string }>();
  const donnees = useApercuDonnees();

  if (!donnees) return <ApercuChargement />;

  // Premier produit disponible comme item initial : le panier n'est jamais
  // vide au premier rendu, CommandeClient s'affiche normalement.
  const premierProduit = donnees.produits[0];
  const itemsInitiaux = premierProduit ? [{ produitId: premierProduit.id, quantite: 1 }] : [];

  return (
    <div style={variablesBoutique(donnees.editeur)} className="min-h-screen">
      <PreviewNavigationProvider value={{ actif: true }}>
        <CartProvider slug={slug} previsualisation itemsInitiaux={itemsInitiaux}>
          <CommandeContenu donnees={donnees} slug={slug} />
        </CartProvider>
      </PreviewNavigationProvider>
    </div>
  );
}
