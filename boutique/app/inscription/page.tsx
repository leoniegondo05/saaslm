import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import AuthOverlayText from "../components/AuthOverlayText";

export const metadata: Metadata = {
  title: "Inscription — Livre Moi",
  description: "Créez votre compte pour lancer votre boutique Livre Moi.",
};

/*
  Page d'inscription, symétrique de app/login/page.tsx (même carte
  visuel + même animation d'entrée .animate-auth-overlay), pour qui
  clique "Pas de compte ? Inscription" depuis la page de connexion.
*/
export default function InscriptionPage() {
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
          label="Bienvenue sur LiivreMoi"
          heading="Ici commence votre indépendance commerciale."
        />
      </div>

      {/* ── Colonne formulaire ──
          Plus riche que Connexion (compte boutique, pas juste compte
          utilisateur) : nom, email, téléphone, nom + lien (sous-domaine
          .LM.com) de la boutique, mot de passe + confirmation. Colonne
          élargie (max-w-xl au lieu de max-w-md) pour que les paires de
          champs (grid sm:grid-cols-2) restent lisibles. Viewport fixe
          (h-dvh + overflow-hidden sur <main>) : elle seule scrolle
          (overflow-y-auto) si le formulaire dépasse un petit écran, la
          page ne bouge jamais. */}
      <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 sm:gap-6 md:px-16 md:py-10">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-brand-white/60 transition hover:text-brand-white"
        >
          <span aria-hidden>←</span> Retour au site
        </Link>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
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

          <h1 className="text-2xl font-bold sm:text-3xl">Inscription</h1>
          <p className="mt-2 text-sm text-brand-white/60">
            Créez votre compte pour ouvrir votre boutique.
          </p>

          <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-brand-white"
                >
                  Nom &amp; prénom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ex : Jean DUPONT"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-brand-white"
                >
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="info@example.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-brand-white"
                >
                  Téléphone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+225 07 07 07 07 07"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
                />
              </div>

              <div>
                <label
                  htmlFor="shop-name"
                  className="text-sm font-semibold text-brand-white"
                >
                  Nom de la boutique
                </label>
                <input
                  id="shop-name"
                  name="shop-name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Ex : Ma boutique"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="shop-slug"
                className="text-sm font-semibold text-brand-white"
              >
                Lien de ma boutique
              </label>
              {/* Sous-domaine : champ + suffixe ".LM.com" fixe dans le même
                  encadré, séparés par un liseré. */}
              <div className="mt-2 flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] focus-within:border-brand-pink/60 sm:mt-3">
                <input
                  id="shop-slug"
                  name="shop-slug"
                  type="text"
                  placeholder="Ma boutique"
                  className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none sm:py-4"
                />
                <span className="flex shrink-0 items-center border-l border-white/10 px-5 text-sm font-semibold text-brand-white/50">
                  .LM.com
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
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
                  autoComplete="new-password"
                  placeholder="********"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
                />
              </div>

              <div>
                <label
                  htmlFor="password-confirmation"
                  className="text-sm font-semibold text-brand-white"
                >
                  Confirmation
                </label>
                <input
                  id="password-confirmation"
                  name="password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="********"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
                />
              </div>
            </div>

            {/* Case à cocher : même style personnalisé (carré blanc +
                coche) que "Se rappeler de moi" sur /login. */}
            <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
              <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-white">
                <input
                  type="checkbox"
                  name="terms"
                  required
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
                J&apos;accepte les conditions d&apos;utilisation.
              </span>
            </label>

            <Link
              href="/login"
              className="block text-center text-sm font-medium text-brand-pink hover:opacity-80"
            >
              Vous avez déjà un compte ?
            </Link>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-white px-6 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90 sm:py-4"
            >
              Créer ma boutique
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
