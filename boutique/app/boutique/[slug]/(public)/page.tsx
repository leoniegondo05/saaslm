import { notFound } from "next/navigation";
import { lireBoutique } from "@/lib/boutique-store";
import AccueilContenu from "@/app/components/boutique-publique/AccueilContenu";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string; cat?: string }> };

export default async function BoutiqueAccueilPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { q, cat } = await searchParams;
  const donnees = await lireBoutique(slug);
  if (!donnees || !donnees.identite.ouverte) notFound();

  return <AccueilContenu donnees={donnees} slug={slug} recherche={(q ?? "").trim()} categorieActiveId={cat ?? null} />;
}
