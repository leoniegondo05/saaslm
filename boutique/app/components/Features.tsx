import SectionHeader from "./SectionHeader";

// Les deux sens de transfert présentés dans la maquette Figma : l'argent
// peut circuler de l'étranger vers la Côte d'Ivoire, et inversement.
const ROUTES = [
  { from: "Autre pays", to: "Côte d’Ivoire" },
  { from: "Côte d’Ivoire", to: "Autre pays" },
];

export default function Features() {
  return (
    <section id="flux-financiers" className="px-6 py-24 md:px-16">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader title="Vos flux financiers se simplifient" />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="grid gap-6 sm:grid-cols-2">
            {ROUTES.map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-6"
              >
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-brand-white/40">
                    {route.from}
                  </p>
                  <div className="mx-auto mt-3 h-10 w-10 rounded-full bg-white/5" />
                </div>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-brand-pink/60 to-brand-purple/60"
                />
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-brand-white/40">
                    {route.to}
                  </p>
                  <div className="mx-auto mt-3 h-10 w-10 rounded-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>

          {/* Aperçu de l'application mobile : remplace ce cadre par une
              vraie capture d'écran exportée depuis Figma quand tu
              l'auras. */}
          <div className="mx-auto aspect-[9/18] w-56 rounded-[2.5rem] border border-white/10 bg-white/[0.03]" />
        </div>
      </div>
    </section>
  );
}
