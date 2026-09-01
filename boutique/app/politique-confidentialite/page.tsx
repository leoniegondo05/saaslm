import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — LIIVRE MOI",
  description: "Politique de confidentialité de LIIVRE MOI.",
};

// Page placeholder — remplace le lien href="#" du footer (voir Footer.tsx).
// Contenu légal définitif à rédiger avec les informations officielles de
// la société (identité de l'éditeur, données collectées, base légale,
// durée de conservation, droits RGPD, contact DPO...).
export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-24 sm:px-10">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-6 text-sm text-brand-white/60">
          Cette page est en cours de rédaction. Notre politique de
          confidentialité détaillée sera publiée ici prochainement.
        </p>
      </main>
      <Footer />
    </>
  );
}
