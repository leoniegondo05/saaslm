import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import HowItWorks from "@/app/components/HowItWorks";
import Features from "@/app/components/Features";
import Reach from "@/app/components/Reach";
import Statement from "@/app/components/Statement";
import CTA from "@/app/components/CTA";
import Footer from "@/app/components/Footer";

// La page d'accueil : on assemble ici, dans l'ordre, toutes les sections
// telles qu'elles apparaissent dans la maquette Figma. Chaque section a son
// propre fichier dans app/components, pour que le code reste facile à lire
// et à modifier section par section.
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Reach />
        <Statement />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
