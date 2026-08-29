import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import AuthOverlayText from "../components/AuthOverlayText";

export const metadata: Metadata = {
  title: "Connexion — Livre Moi",
  description: "Connectez-vous pour gérer votre boutique Livre Moi.",
};

/*
  Page de connexion recréée d'après la maquette Figma reçue en deux
  captures :
    1) la carte visuel (public/images/Login.png), à gauche, avec le
       texte superposé ("Bienvenue sur votre boutique" + accroche) et
       une légère animation d'entrée (.animate-auth-overlay, définie
       dans app/globals.css)
    2) le formulaire (email, mot de passe, "se rappeler de moi",
       "mot de passe oublié ?", bouton "Connexion"), à droite

  Accessible depuis la Hero ("commencer maintenant") et depuis la CTA
  ("Créer ma boutique gratuitement"), qui pointent toutes deux vers
  cette page. Un lien "Retour au site" ramène à l'accueil, un bouton
  "Inscription" mène vers app/inscription/page.tsx pour qui n'a pas
  encore de compte.
*/
export default function LoginPage() {
  return (
    <main className="flex h-dvh overflow-hidden">
      {/* ── Colonne visuel (image Figma) ── plein bord, moitié d'écran, sans marge ni coin arrondi */}
      <div className="relative hidden h-full w-1/2 overflow-hidden lg:block">
        <Image
          src="/images/Login.png"
          alt="Carte visuelle décorative aux dégradés violet et rose de Livre Moi"
          fill
          className="object-cover"
          priority
        />

        <AuthOverlayText
          label="Bienvenue sur votre boutique"
          heading={
            <>
              Connectez-vous pour accéder à
              <br />
              votre tableau de bord d'administration sécurisé.
            </>
          }
        />
      </div>

      {/* ── Colonne formulaire ── viewport fixe (h-dvh + overflow-hidden sur <main>) : elle seule
          scrolle (overflow-y-auto) si le contenu dépasse un petit écran, la page ne bouge jamais. */}
      <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 sm:gap-6 md:px-16 md:py-10">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-brand-white/60 transition hover:text-brand-white"
        >
          <span aria-hidden>←</span> Retour au site
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="mb-6 inline-flex items-center justify-center rounded-lg sm:mb-8"
          >
            <Image
              src="/images/logo.svg"
              alt="Logo Livre Moi"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </Link>

          <h1 className="text-2xl font-bold sm:text-3xl">Connexion</h1>
          <p className="mt-2 text-sm text-brand-white/60">
            Accédez au tableau de bord de votre boutique.
          </p>

          <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-brand-white"
              >
                Addresse Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Ex : info@example.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-brand-white"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="inline-flex cursor-pointer items-center gap-3">
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-white">
                  <input
                    type="checkbox"
                    name="remember"
                    className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md"
                  />
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="hidden h-3.5 w-3.5 text-brand-bg peer-checked:block"
                    aria-hidden
                  >
                    <path
                      d="M13 4L6 11L3 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm text-brand-white/80">
                  Se rapeller de moi
                </span>
              </label>

              <a
                href="#"
                className="text-sm font-medium text-brand-pink hover:opacity-80"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-white px-6 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90 sm:py-4"
            >
              Connexion
            </button>

            <Link
              href="/inscription"
              className="block w-full rounded-xl border border-white/15 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white/5 sm:py-4"
            >
              Pas de compte ? Inscription
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
}
