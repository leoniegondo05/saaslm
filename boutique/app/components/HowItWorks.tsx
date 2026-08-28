import SectionHeader from "./SectionHeader";

// Les 4 étapes affichées sous forme de "pilules" dans la maquette Figma :
// Créer → Personnaliser → Publier → Commencer.
const STEPS = ["Créer", "Personnaliser", "Publier", "Commencer"];

export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="px-6 py-24 md:px-16">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          title="Tout commence par une idée"
          subtitle="Donnez-lui un espace pour grandir."
        />

        <div className="mt-20 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step} className="flex justify-center">
              <span className="rounded-full border border-brand-pink/40 px-6 py-2 text-sm">
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Le point rose lumineux vers lequel toutes les étapes convergent,
            comme sur la maquette Figma (dans le Figma, des lignes en
            pointillés relient chaque pilule à ce point). */}
        <div className="mt-16 flex justify-center">
          <span className="animate-brand-glow h-4 w-4 rounded-full bg-brand-pink" />
        </div>
      </div>
    </section>
  );
}
