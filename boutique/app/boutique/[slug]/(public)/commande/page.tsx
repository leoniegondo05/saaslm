import { notFound } from "next/navigation";
import { lireBoutique } from "@/lib/boutique-store";
import CommandeContenu from "@/app/components/boutique-publique/CommandeContenu";

type Params = { params: Promise<{ slug: string }> };

export default async function CommandePage({ params }: Params) {
  const { slug } = await params;
  const donnees = await lireBoutique(slug);
  if (!donnees || !donnees.identite.ouverte) notFound();

  return <CommandeContenu donnees={donnees} slug={slug} />;
}
