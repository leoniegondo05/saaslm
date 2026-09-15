"use client";

import { createContext, useContext, useState } from "react";

/*
  Logo de la boutique connectée : état partagé entre l'écran "Réglages ·
  Ma boutique" (où il est déposé, cf. MaBoutique.tsx) et l'icône "Ma
  boutique" du header (DashboardHeader.tsx), qui vivent sur des routes
  différentes — pas d'autre moyen de le faire remonter jusqu'au header
  qu'un contexte monté une fois dans app/dashboard/layout.tsx, même
  principe que DashboardLanguageProvider.

  Aperçu local uniquement (FileReader → data URL), pas de persistance
  localStorage : aucun endpoint Laravel n'existe encore pour l'upload, cf.
  mémoire [[dashboard-mock-data-pending-laravel-api]] — remplacé plus tard
  par une vraie URL renvoyée par l'API. Repart donc à zéro (icône par
  défaut) à chaque rechargement complet, comme la photo de profil dans
  MonProfil.tsx.
*/

type DashboardBoutiqueLogoContextValue = {
  logo: string | null;
  setLogo: (logo: string | null) => void;
};

const DashboardBoutiqueLogoContext = createContext<DashboardBoutiqueLogoContextValue | null>(null);

export function DashboardBoutiqueLogoProvider({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState<string | null>(null);

  return (
    <DashboardBoutiqueLogoContext.Provider value={{ logo, setLogo }}>
      {children}
    </DashboardBoutiqueLogoContext.Provider>
  );
}

export function useDashboardBoutiqueLogo() {
  const ctx = useContext(DashboardBoutiqueLogoContext);
  if (!ctx) {
    throw new Error("useDashboardBoutiqueLogo doit être utilisé sous DashboardBoutiqueLogoProvider");
  }
  return ctx;
}
