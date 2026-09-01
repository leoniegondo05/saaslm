import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — LIIVRE MOI",
  description: "Conditions générales d'utilisation de LIIVRE MOI.",
};

// Page placeholder — remplace le lien href="#" du footer (voir Footer.tsx).
// Conditions générales définitives à rédiger (objet du service, obligations
// des utilisateurs et de LIIVRE MOI, responsabilité, résiliation...).
export default function ConditionsUtilisationPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-24 sm:px-10">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Conditions d&apos;utilisation
        </h1>
        <p className="mt-6 text-sm text-brand-white/60">
          Cette page est en cours de rédaction. Nos conditions générales
          d&apos;utilisation détaillées seront publiées ici prochainement.
        </p>
      </main>
      <Footer />
    </>
  );
}
