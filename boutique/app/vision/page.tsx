import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VisionHero from "../components/vision/VisionHero";
import VisionStatement from "../components/vision/VisionStatement";
import VisionEffects from "../components/vision/VisionEffects";
import VisionConstat from "../components/vision/VisionConstat";

export const metadata: Metadata = {
  title: "Ce que nous construisons — Livre Moi",
  description:
    "Nous bâtissons le plus grand réseau commercial digital d'Afrique.",
};

// Page "Ce que nous construisons", assemblée à partir des 4 captures
// fournies par l'utilisateur, dans leur ordre d'origine. Reliée depuis le
// lien du même nom dans la barre de navigation (voir Navbar.tsx).
export default function VisionPage() {
  return (
    <>
      <Navbar />
      <main>
        <VisionHero />
        <VisionStatement />
        <VisionEffects />
        <VisionConstat />
      </main>
      <Footer />
    </>
  );
}
