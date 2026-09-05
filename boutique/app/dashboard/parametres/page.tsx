import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";
import PersonnelAcces from "../../components/dashboard-parametres/PersonnelAcces";

/*
  Onglet "Réglages" du dashboard, atteint depuis l'icône engrenage du rail
  (voir DashboardSidebar) : Écran 07 "Personnel et accès" — un seul écran
  pour l'instant, pas d'onglets internes comme /dashboard/produits.
*/

export default function ParametresPage() {
  return (
    <div className="min-h-screen w-full bg-[#FAF7FC] font-sans text-[#141220] antialiased">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <PersonnelAcces />
        </div>
      </div>
    </div>
  );
}
