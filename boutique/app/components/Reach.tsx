import Image from "next/image";

// Cette section est un peu particulière : l'image exportée depuis Figma
// contient déjà tout (la pastille "La solution LM", le titre, la carte de
// l'Afrique et les noms des villes). On l'affiche donc telle quelle, sans
// recréer le texte par-dessus, pour rester parfaitement fidèle à la
// maquette.
export default function Reach() {
  return (
    <section id="un-continent" className="px-6 py-16 md:px-16">
      <div className="mx-auto max-w-[1320px]">
        <Image
          src="/images/africa-map.png"
          alt="Un continent, des millions d'opportunités — nous construisons les connexions. Carte de l'Afrique avec Abidjan comme point de départ des connexions vers de nombreuses villes du continent."
          width={1440}
          height={1024}
          className="h-auto w-full rounded-3xl"
        />
      </div>
    </section>
  );
}
