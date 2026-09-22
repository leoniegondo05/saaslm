import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import HowItWorks from "@/app/components/HowItWorks";
import Affiliation from "@/app/components/Affiliation";
import Features from "@/app/components/Features";
import Reach from "@/app/components/Reach";
import Statement from "@/app/components/Statement";
import CTA from "@/app/components/CTA";
import Footer from "@/app/components/Footer";
import ScrollToTop from "@/app/components/ScrollToTop";

// La page d'accueil : on assemble ici, dans l'ordre, toutes les sections
// telles qu'elles apparaissent dans la maquette de référence
// (accueil-lm-anime.html). Chaque section a son propre fichier dans
// app/components, pour que le code reste facile à lire et à modifier
// section par section — un collègue avait reproduit la référence fidèlement
// mais en une seule page monolithique (useEffect géant + tout le CSS en
// <style jsx global>) ; ce fichier reprend la même page, éclatée dans les
// composants déjà en place, avec nos tokens de couleur (--color-brand-*)
// à la place des valeurs hexadécimales brutes, et les vraies vidéos
// (cerveau, porte) à la place des emplacements d'image de la référence
export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-brand-bg text-brand-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Affiliation />
        <Features />
        <Reach />
        <Statement />
        <CTA />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
