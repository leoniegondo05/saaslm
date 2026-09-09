import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

// Cette section est un peu particulière : l'image exportée depuis Figma
// contient déjà tout (la pastille "La solution LM", le titre, la carte de
// l'Afrique et les noms des villes). On l'affiche donc telle quelle, sans
// recréer le texte par-dessus, pour rester parfaitement fidèle à la
// maquette.
//
// Empilement (voir Hero.tsx pour le principe complet) : hauteur de l'image
// plafonnée à 68vh (max-h + w-auto, plutôt que w-full) pour qu'elle tienne
// toujours dans min-h-[calc(100vh-6rem)] sans déborder, quelle que soit la
// hauteur d'écran.
export default function Reach() {
  return (
    <section
      id="un-continent"
      className="sticky top-[120px] flex min-h-[calc(100vh-6rem)] items-center bg-brand-bg px-6 py-16 md:px-16"
    >
      <ScrollReveal className="mx-auto w-full max-w-[1320px] text-center">
        <Image
          src="/images/africa-map.png"
          alt="Un continent, des millions d'opportunités — nous construisons les connexions. Carte de l'Afrique avec Abidjan comme point de départ des connexions vers de nombreuses villes du continent."
          width={1440}
          height={1024}
          className="mx-auto h-auto max-h-[68vh] w-auto rounded-3xl"
        />
      </ScrollReveal>
    </section>
  );
}
