import Link from "next/link";
import HeroBrainVideo from "./HeroBrainVideo";

export default function Hero() {
  return (
    // Empilement façon "cartes qui se chevauchent" (technique CSS pure —
    // voir test.html fourni par l'utilisateur) : chaque section de la page
    // est sticky avec un top légèrement croissant (96/104/112/120/128/144px
    // ici — mêmes écarts que la référence : 0/8/16/24/32/48px, décalés de
    // 96px pour laisser la place à la Navbar fixe). Pas de z-index
    // explicite : l'ordre du DOM suffit, une section plus bas dans le HTML
    // se peint naturellement par-dessus celle du dessus. bg-brand-bg
    // explicite indispensable : sans fond opaque, la section laisserait
    // transparaître celle qu'elle est censée recouvrir.
    <section
      id="hero"
      className="sticky top-[6px] flex min-h-[calc(100vh-6rem)] items-center overflow-hidden bg-brand-bg px-6 pb-6 pt-20 md:px-16 md:pb-24 md:pt-16"
    >
      {/* ── MOBILE ONLY : cerveau en arrière-plan, atténué ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-55 lg:hidden">
        <HeroBrainVideo className="w-[130%] max-w-none" />
      </div>

      {/* ── Grille principale ── */}
      <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-8 lg:grid-cols-[420px_1fr]">

        {/* Colonne texte — même disposition "en cascade" que le prototype
            hero-brain : chaque ligne du titre est indentée un peu plus que
            la précédente (ml-4 puis ml-8), et le sous-titre / bouton / "Sans
            s'engager" suivent avec leur propre décalage (ml-20, puis un
            ml-20 supplémentaire rien que pour "Sans s'engager"). */}
        <div>
          <h1 className="text-left text-4xl font-extrabold leading-[1.16] tracking-[-0.02em] sm:text-5xl lg:text-[56px]">
            <span className="block">une vente</span>
            <span className="ml-4 block">un réseau</span>
            <span className="ml-8 block">
              Tout <span className="text-brand-pink">s&apos;active</span>
            </span>
          </h1>

          <p className="ml-20 mt-[1.6rem] max-w-[36ch] text-brand-white/60">
            toute votre logistique e-commerce, une seule plateforme
          </p>

          <div className="ml-20 mt-[2.4rem] flex flex-col items-start gap-3">
            {/* Bouton conforme à la maquette Figma (mesuré en pixels :
                218×52, fond quasi-noir #050C1C, fine bordure dégradée
                rose→violet, texte blanc) — priorité à la maquette sur la
                charte graphique en cas de conflit, comme demandé. */}
            <span className="inline-block rounded-2xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-[14px] bg-[#0a0e1c] px-[18px] py-4 text-sm font-semibold transition hover:opacity-90"
              >
                commencer maintenant
                <svg width="26" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M2 2L8 8L2 14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 2L17 8L11 14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </span>
            <span className="ml-20 text-xs text-brand-white/40">
              Sans s&apos;engager
            </span>
          </div>
        </div>

        {/* ── DESKTOP ONLY : cerveau en colonne à droite ── */}
        <div className="relative hidden lg:block">
          <HeroBrainVideo />
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
