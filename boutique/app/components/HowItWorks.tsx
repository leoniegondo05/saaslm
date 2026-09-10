/*
  Deuxième section de la page d'accueil : titre, fil conducteur + étapes
  (voir HowItWorksWave.tsx) et CTA de climax, comme à l'origine — pas de
  calque de fond persistant (essai HomeSceneBackground abandonné).
*/
import SectionHeader from "./SectionHeader";
import HowItWorksWave from "./HowItWorksWave";

export default function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="sticky top-[104px] flex min-h-[calc(100vh-6rem)] items-start overflow-hidden bg-brand-bg px-6 pb-10 pt-10 text-brand-white md:px-16"
    >
      {/* py-10 (pas py-16) + fil conducteur réduit (voir max-w-[640px] dans
          HowItWorksWave.tsx) + mt-10 (pas mt-30) : sans cette réduction, le
          contenu (titre + fil + CTA) dépassait min-h-[calc(100vh-6rem)] sur
          un écran de hauteur normale.

          items-start (pas items-center) : la section suivante (Features)
          commence à recouvrir celle-ci par le bas dès le tout début du
          scroll — pas seulement une fois la section pleinement affichée —
          donc plus un élément est bas, moins il a de marge avant d'être
          recouvert. Centrer le contenu plaçait le CTA (le plus bas) trop
          près du bord bas de la fenêtre épinglée. En alignant le contenu en
          haut, tout l'espace libre restant se retrouve sous le CTA au lieu
          d'être réparti en haut ET en bas — le CTA a donc le temps d'être vu
          avant que Features n'arrive. */}
      <div className="mx-auto w-full max-w-[1320px]">
        {/* "La solution LM" + titre/sous-titre — en haut à gauche, comme sur
            la capture de référence ("Tout commence par une idée" / "Donner-lui
            un espace pour grandir."). Header commun à plusieurs sections, voir
            SectionHeader.tsx. */}
        <SectionHeader
          title="Tout commence par une idée"
          subtitle="Donner-lui un espace pour grandir."
        />

        {/* Fil conducteur + étapes + rayons vers le hub — centré, pas
            plein largeur (sinon trop étiré sur grand écran). */}
        <HowItWorksWave className="mt-10" />

        {/* Climax : message + CTA, comme à la fin de la vidéo de référence. */}
        <div className="how-it-works-cta -mt-2 flex flex-col items-center gap-2 text-center">
          <p className="text-xl font-bold sm:text-2xl">
            Rejoindre la solution LM{" "}
            <span className="font-medium text-brand-pink">
              sans affiliation
            </span>
          </p>
          {/* Bouton conforme à la maquette Figma, voir Hero.tsx. */}
          <span className="inline-block rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px mt-5">
            <button
              type="button"
              className="flex items-center gap-2 rounded-[11px] bg-[#0a0e1c] px-[18px] py-3 text-sm font-semibold transition hover:opacity-90 cursor-pointer sm:text-base"
            >
              Créer ma boutique gratuitement
              <span aria-hidden>»</span>
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
