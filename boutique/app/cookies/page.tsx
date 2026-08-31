import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Paramètres cookies — Livre Moi",
  description: "Gestion des cookies sur Livre Moi.",
};

// Page placeholder — remplace le lien href="#" du footer (voir Footer.tsx).
// Le vrai réglage des cookies (bannière de consentement, catégories,
// opt-in/opt-out par finalité) reste à implémenter ; cette page ne fait
// pour l'instant qu'expliquer la situation actuelle.
export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-24 sm:px-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Paramètres cookies</h1>
        <p className="mt-6 text-sm text-brand-white/60">
          Cette page est en cours de rédaction. Le centre de préférences
          cookies (consentement par catégorie) sera disponible ici
          prochainement. Le site n&apos;utilise actuellement aucun cookie de
          mesure d&apos;audience ou publicitaire.
        </p>
      </main>
      <Footer />
    </>
  );
}
