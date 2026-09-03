import FloatingAiAssistant from "../components/FloatingAiAssistant";

/*
  Layout partagé par toutes les pages du dashboard ("Ma journée",
  "Accueil"...) : la bulle IA doit se promener sur chaque écran, donc elle
  est montée ici une seule fois plutôt que copiée dans chaque page.
*/
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FloatingAiAssistant />
    </>
  );
}
