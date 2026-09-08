import type { Metadata } from "next";
import CompleterProfilWizard from "../components/onboarding/CompleterProfilWizard";

export const metadata: Metadata = {
  title: "Compléter mon profil — LIIVRE MOI",
  description: "Neuf questions sur votre activité, avant d'accéder à votre boutique.",
};

/*
  Page destination après la connexion (voir LoginForm.tsx), avant le
  tableau de bord — écrans 37 à 47 de la maquette fournie par
  l'utilisateur (LM Inscription boutique.html). Composant client extrait
  dans CompleterProfilWizard.tsx (état des 9 réponses + navigation),
  cette page reste un composant serveur pour exporter `metadata`.
*/
export default function CompleterProfilPage() {
  return (
    <main className="min-h-dvh bg-brand-bg">
      <CompleterProfilWizard />
    </main>
  );
}
