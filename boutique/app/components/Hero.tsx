import HeroBrain from "./HeroBrain";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden px-6 pb-24 pt-24 md:px-16 md:pt-16"
    >
      {/* ── MOBILE ONLY : cerveau en arrière-plan, atténué ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-55 lg:hidden">
        <HeroBrain className="w-[130%] max-w-none" />
      </div>

      {/* ── Grille principale ── */}
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-8 lg:grid-cols-[420px_1fr]">

        {/* Colonne texte */}
        <div>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[56px]">
            une vente
            <br />
            un réseau
            <br />
            Tout <span className="text-brand-pink">s'active</span>
          </h1>

          <p className="mt-6 max-w-sm text-brand-white/60">
            toute votre logistique e-commerce, une seule plateforme
          </p>

          <div className="mt-8 flex flex-col items-start gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] px-[18px] py-4 text-sm font-semibold transition hover:bg-white/[0.06]"
            >
              commencer maintenant
              <span aria-hidden>»</span>
            </button>
            <span className="text-xs text-brand-white/40">
              Sans s'engager
            </span>
          </div>
        </div>

        {/* ── DESKTOP ONLY : cerveau en colonne à droite ── */}
        <div className="relative hidden lg:block">
          <HeroBrain />
        </div>
      </div>
    </section>
  );
}
