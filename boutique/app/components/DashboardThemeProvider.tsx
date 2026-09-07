"use client";

import { createContext, useContext, useEffect, useState } from "react";

/*
  Mode nuit du dashboard : état partagé entre toutes les pages (Ma journée,
  Accueil, Produits, Paramètres, Profil...) via ce contexte, monté une seule
  fois dans app/dashboard/layout.tsx — au lieu du booléen purement local qui
  vivait avant dans DashboardHeader (cf. commentaire retiré là-bas) et ne
  changeait donc jamais rien à l'écran.

  Persisté en localStorage pour survivre à une navigation/reload, et reflété
  en posant/retirant la classe "dark" sur <html> : globals.css lit cette
  classe (@custom-variant dark) pour piloter les couleurs (fond de page,
  cartes .card-tint, header, rail de navigation).
*/

// Exportée pour que le script anti-flash de app/dashboard/layout.tsx lise
// exactement la même clé sans la dupliquer en dur à deux endroits.
export const STORAGE_KEY = "lm-dashboard-mode-nuit";

type DashboardThemeContextValue = {
  modeNuit: boolean;
  toggleModeNuit: () => void;
};

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  // Lu depuis localStorage dès le premier rendu client pour éviter un flash
  // clair→sombre ; côté serveur/premier paint ça reste "false" (pas d'accès
  // à window), sans conséquence visuelle notable ici.
  const [modeNuit, setModeNuit] = useState(false);

  // Lecture + application au montage UNIQUEMENT (pas d'effet séparé qui
  // réécrirait localStorage à chaque changement de `modeNuit` : cet ancien
  // second useEffect s'exécutait aussi au tout premier rendu, avec
  // `modeNuit` encore à sa valeur initiale `false`, et écrivait donc "0"
  // dans localStorage juste après que ce bloc-ci ait lu "1" — la préférence
  // sauvegardée était effacée à chaque actualisation de page avant même que
  // React ait eu le temps de refaire un rendu avec la bonne valeur. Le
  // bascule (`toggleModeNuit` ci-dessous) applique maintenant lui-même la
  // classe et l'écriture localStorage, donc plus qu'un seul endroit qui
  // écrit, plus de course entre lecture et écriture.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        setModeNuit(true);
        document.documentElement.classList.add("dark");
      }
    } catch {
      // localStorage indisponible (navigation privée, etc.) : on reste en
      // mode clair par défaut, tant pis pour la persistance.
    }
  }, []);

  const toggleModeNuit = () => {
    setModeNuit((v) => {
      const next = !v;
      document.documentElement.classList.toggle("dark", next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // idem : on ignore, ça reste fonctionnel pour la session en cours.
      }
      return next;
    });
  };

  return (
    <DashboardThemeContext.Provider value={{ modeNuit, toggleModeNuit }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const ctx = useContext(DashboardThemeContext);
  if (!ctx) {
    throw new Error("useDashboardTheme doit être utilisé sous DashboardThemeProvider");
  }
  return ctx;
}
