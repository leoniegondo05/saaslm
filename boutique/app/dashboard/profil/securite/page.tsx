import DashboardHeader from "../../../components/DashboardHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";
import MotDePasseSecurite from "../../../components/dashboard-profil/MotDePasseSecurite";

/*
  "Mot de passe et sécurité" (menu du compte, voir DashboardHeader) : niveau
  de protection, mot de passe, double vérification, codes de secours,
  alerte nouvel appareil — cf. capture fournie.
*/

export default function MotDePasseSecuritePage() {
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <MotDePasseSecurite />
        </div>
      </div>
    </div>
  );
}
