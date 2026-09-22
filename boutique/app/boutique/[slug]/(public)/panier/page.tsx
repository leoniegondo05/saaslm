import { notFound } from "next/navigation";
import { lireBoutique } from "@/lib/boutique-store";
import PanierContenu from "@/app/components/boutique-publique/PanierContenu";

type Params = { params: Promise<{ slug: string }> };

export default async function PanierPage({ params }: Params) {
  const { slug } = await params;
  const donnees = await lireBoutique(slug);
  if (!donnees || !donnees.identite.ouverte) notFound();

  return <PanierContenu donnees={donnees} slug={slug} />;
}
