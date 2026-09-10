import SectionHeader from "./SectionHeader";
import ScrollReveal from "./ScrollReveal";
import ReachAfricaMap from "./ReachAfricaMap";

// Cette section utilisait auparavant une image exportée depuis Figma qui
// contenait déjà tout (pastille, titre, carte, noms de villes) — pas
// pratique : aucun texte réel (illisible pour un lecteur d'écran, flou au
// zoom) et impossible à faire évoluer sans repasser par Figma. Le titre
// est maintenant un SectionHeader comme les autres sections, et la carte
// un vrai composant vectoriel (voir ReachAfricaMap.tsx).
export default function Reach() {
  return (
    <section
      id="un-continent"
      className="sticky top-[120px] flex min-h-[calc(100vh-6rem)] items-center bg-brand-bg px-6 py-10 md:px-16"
    >
      <ScrollReveal className="mx-auto w-full max-w-[1320px]">
        <SectionHeader
          title="Un continent, des millions d'opportunités"
          subtitle="Nous construisons les connexions."
        />
        <ReachAfricaMap />
      </ScrollReveal>
    </section>
  );
}
