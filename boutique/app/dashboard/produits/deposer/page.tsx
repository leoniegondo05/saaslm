"use client";

import { useRouter } from "next/navigation";
import DashboardHeader from "../../../components/DashboardHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";
import DeposerStockModal from "../../../components/dashboard-produits/DeposerStockModal";
import { PRODUITS_INITIAUX } from "../../../components/dashboard-accueil/ProduitsCatalogue";
import { definirDepotEnAttente } from "../../../components/dashboard-produits/pendingDepotStore";

/*
  "Déposer un stock" en page à part — atteint uniquement depuis mobile/
  tablette (ProduitsCatalogue.tsx redirige ici sous le breakpoint lg au
  lieu d'ouvrir DeposerStockModal en panneau superposé, dont la grille
  formulaire + talon rendait mal compressée dans une fenêtre modale).

  Même mouvement qu'app/dashboard/produits/ajouter/page.tsx : le
  catalogue produits vit dans ProduitsCatalogue.tsx (autre page), donc
  cette route ne connaît que PRODUITS_INITIAUX — pas les produits/stocks
  déjà modifiés depuis un montage précédent de la page Produits, cf.
  [[dashboard-mock-data-pending-laravel-api]]. Le dépôt validé revient via
  pendingDepotStore, lu et vidé au montage de ProduitsCatalogue.
*/
export default function DeposerStockPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <DeposerStockModal
            produits={PRODUITS_INITIAUX}
            pleinePage
            onFermer={() => router.push("/dashboard/produits")}
            onValider={(depot) => {
              definirDepotEnAttente(depot);
              router.push("/dashboard/produits");
            }}
          />
        </div>
      </div>
    </div>
  );
}
