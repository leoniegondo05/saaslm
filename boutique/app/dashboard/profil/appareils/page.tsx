import DashboardHeader from "../../../components/DashboardHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";
import MesAppareils from "../../../components/dashboard-profil/MesAppareils";

/*
  "Mes appareils" (menu du compte, voir DashboardHeader) : liste des
  appareils connectés au compte et leur déconnexion — cf. maquette
  fournie.
*/

export default function MesAppareilsPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <MesAppareils />
        </div>
      </div>
    </div>
  );
}
