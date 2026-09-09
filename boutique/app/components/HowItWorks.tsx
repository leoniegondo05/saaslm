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
      className="sticky top-[104px] flex min-h-[calc(100vh-6rem)] items-center bg-brand-bg px-6 py-16 text-brand-white md:px-16"
    >
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
        <HowItWorksWave className="mt-30" />

        {/* Climax : message + CTA, comme à la fin de la vidéo de référence. */}
        <div className="how-it-works-cta -mt-2 flex flex-col items-center gap-2 text-center">
          <p className="text-xl font-bold sm:text-2xl">
            Rejoindre la solution LM{" "}
            <span className="font-medium text-brand-pink">
              sans affiliation
            </span>
          </p>
          <span className="inline-block rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
            <button
              type="button"
              className="flex items-center gap-2 rounded-[11px] bg-[#0a0e1c] px-[18px] py-3 text-sm font-semibold transition hover:opacity-90"
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
