import { notFound } from "next/navigation";
import { lireBoutique } from "@/lib/boutique-store";
import ProduitContenu from "@/app/components/boutique-publique/ProduitContenu";

type Params = { params: Promise<{ slug: string; produitId: string }> };

export default async function ProduitPage({ params }: Params) {
  const { slug, produitId } = await params;
  const donnees = await lireBoutique(slug);
  if (!donnees || !donnees.identite.ouverte) notFound();

  const produit = donnees.produits.find((p) => p.id === produitId);
  if (!produit) notFound();

  return <ProduitContenu donnees={donnees} slug={slug} produit={produit} />;
}
