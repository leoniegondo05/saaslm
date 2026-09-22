import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { lireBoutique } from "@/lib/boutique-store";
import { variablesBoutique } from "@/lib/boutique-style";
import { CartProvider } from "@/app/components/boutique-publique/CartProvider";

/*
  Portail de la boutique publique — seul endroit qui vérifie que la boutique
  existe et est ouverte (`identite.ouverte`) ; notFound() ici couvre donc
  automatiquement toutes les pages du groupe de routes (public). Pose aussi
  les variables CSS de marque (--ac/--bg/--tx/--rad/...) sur le wrapper
  racine, pour que le thème du marchand s'applique à absolument tout ce qui
  suit, sans avoir à les repasser page par page.

  Volontairement dans le groupe (public), pas directement sous
  app/boutique/[slug]/ : app/boutique/[slug]/apercu/** (routes brouillon de
  l'aperçu éditeur, cf. PreviewMode.tsx) doit échapper à cette garde — une
  boutique fermée ou pas encore enregistrée doit quand même se prévisualiser,
  et l'aperçu pose ses propres variables CSS à partir de l'état non enregistré
  (postMessage) plutôt que du fichier .data/boutiques/<slug>.json.
*/

type Params = { params: Promise<{ slug: string }> };

export default async function BoutiquePubliqueLayout({ children, params }: { children: ReactNode } & Params) {
  const { slug } = await params;
  const donnees = await lireBoutique(slug);
  if (!donnees || !donnees.identite.ouverte) notFound();

  return (
    <div style={variablesBoutique(donnees.editeur)} className="min-h-screen">
      <CartProvider slug={slug}>{children}</CartProvider>
    </div>
  );
}
