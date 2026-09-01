import NetworkBackground from "./NetworkBackground";
import ScrollReveal from "../ScrollReveal";

// Section 1/4 de la page "/vision" — capture fournie par l'utilisateur :
// grand titre centré sur fond sombre, avec un maillage de points
// bleus/roses en arrière-plan (voir NetworkBackground.tsx).
export default function VisionHero() {
  return (
    <section className="relative overflow-hidden bg-brand-bg px-6 py-32 md:px-16">
      <NetworkBackground />
      {/* Déjà dans le viewport au chargement : le ScrollReveal joue donc
          comme une entrée en fondu au lieu d'un déclenchement au scroll. */}
      <ScrollReveal className="relative mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
          Nous bâtissons le plus grand réseau commercial digital{" "}
          <span className="text-brand-pink">d’Afrique</span>
        </h1>
      </ScrollReveal>
    </section>
  );
}
