import FloatingAiAssistant from "../components/FloatingAiAssistant";
import { DashboardThemeProvider, STORAGE_KEY } from "../components/DashboardThemeProvider";

/*
  Layout partagé par toutes les pages du dashboard ("Ma journée",
  "Accueil"...) : la bulle IA doit se promener sur chaque écran, donc elle
  est montée ici une seule fois plutôt que copiée dans chaque page.

  DashboardThemeProvider monté ici (et pas plus haut, dans app/layout.tsx)
  car le mode nuit ne concerne que le dashboard, pas le site public — voir
  DashboardThemeProvider.tsx pour le détail (contexte + classe "dark" sur
  <html> + persistance localStorage).
*/

// Script "anti-flash" : DashboardThemeProvider lit localStorage dans un
// useEffect, qui ne s'exécute qu'APRÈS le premier rendu/paint — sur un
// rechargement complet (F5) avec le mode nuit déjà choisi, l'utilisateur
// voit donc toujours un éclair clair avant que React ne bascule en sombre.
// Ce petit <script> synchrone, injecté avant le contenu de la page, pose la
// classe "dark" sur <html> AVANT que le navigateur ne peigne quoi que ce
// soit (un script sans async/defer bloque le rendu de ce qui le suit dans
// le flux HTML) — React retrouve ensuite la classe déjà posée à
// l'hydratation, donc rien à corriger, pas de flash. Pattern standard pour
// un thème sombre persistant (ex. next-themes).
const NO_FLASH_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})==="1")document.documentElement.classList.add("dark")}catch(e){}`;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeProvider>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      {children}
      <FloatingAiAssistant />
    </DashboardThemeProvider>
  );
}
