import { notFound } from "next/navigation";
import DashboardHeader from "../../../../components/DashboardHeader";
import DashboardSidebar from "../../../../components/DashboardSidebar";
import FicheProduitDrop from "../../../../components/dashboard-produits/FicheProduitDrop";
import { getDropProduit } from "../../../../components/dashboard-produits/dropCatalogue";

/*
  Écran 06 "La fiche d'un produit drop", atteint depuis une tuile du
  catalogue (Écran 05). `params` est une promesse sous Next 16, cf.
  node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md.
*/
export default async function FicheProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produit = getDropProduit(slug);

  if (!produit || produit.prixDrop === null) notFound();

  return (
    <div className="min-h-screen w-full bg-[#FAF7FC] font-sans text-[#141220] antialiased">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1">
          <DashboardHeader />
          <FicheProduitDrop produit={produit} />
        </div>
      </div>
    </div>
  );
}
