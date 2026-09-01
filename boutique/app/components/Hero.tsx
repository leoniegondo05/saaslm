import Link from "next/link";
import HeroBrain from "./HeroBrain";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden px-6 pb-6 pt-20 md:px-16 md:pb-24 md:pt-16"
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

          <p className="mt-4 max-w-sm text-brand-white/60 lg:mt-6">
            toute votre logistique e-commerce, une seule plateforme
          </p>

          <div className="mt-6 flex flex-col items-start gap-3 lg:mt-8">
            <span className="inline-block rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-[11px] bg-[#0a0e1c] px-[18px] py-4 text-sm font-semibold transition hover:opacity-90"
              >
                commencer maintenant
                <span aria-hidden>»</span>
              </Link>
            </span>
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

      {/* ── MOBILE ONLY : liens "Ce que nous construisons" / "Partenaire
          agréé LM", cachés du md:flex de la Navbar en dessous de lg. On les
          répète ici en bas du Hero pour qu'ils restent accessibles au
          scroll, juste avant que la section HowItWorks ne commence. ── */}
      <div className="relative mt-6 flex flex-col items-start gap-3 lg:hidden">
        <span className="inline-block w-full rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
          <Link
            href="/vision"
            className="flex items-center justify-center rounded-[11px] bg-[#0a0e1c] px-5 py-3 text-center text-sm font-semibold transition hover:opacity-90"
          >
            Ce que nous construisons
          </Link>
        </span>
        <span className="inline-block w-full rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
          <Link
            href="/partenaire-agree"
            className="flex items-center justify-center rounded-[11px] bg-[#0a0e1c] px-5 py-3 text-center text-sm font-semibold transition hover:opacity-90"
          >
            Partenaire agréé LM
          </Link>
        </span>
      </div>
    </section>
  );
}
