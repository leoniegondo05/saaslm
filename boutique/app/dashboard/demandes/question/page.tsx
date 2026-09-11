import DashboardHeader from "../../../components/DashboardHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";
import PoserQuestion from "../../../components/dashboard-demandes/PoserQuestion";

// "Poser une question" (/dashboard/demandes/question), cf. app/components/dashboard-demandes/PoserQuestion.tsx.
export default function PoserQuestionPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 md:px-10 lg:flex-row lg:pb-10 lg:pl-3 lg:pt-8">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:px-6">
          <DashboardHeader />
          <PoserQuestion />
        </div>
      </div>
    </div>
  );
}
