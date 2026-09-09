import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import AuthOverlayText from "../components/AuthOverlayText";
import NetworkBackground from "../components/vision/NetworkBackground";
import LoginMobileFlow from "../components/LoginMobileFlow";
import LoginForm from "../components/LoginForm";

export const metadata: Metadata = {
  title: "Connexion — LIIVRE MOI",
  description: "Connectez-vous pour gérer votre boutique LIIVRE MOI.",
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
    <main className="relative flex h-dvh overflow-hidden lg:h-auto lg:min-h-dvh lg:overflow-visible">
      {/* ── Colonne visuel (image Figma) ── plein bord, moitié d'écran, sans marge ni coin arrondi.
          Pas de h-full : en lg elle s'étire (align-items: stretch, comportement flex par défaut)
          à la hauteur naturelle de la colonne formulaire en face, donc grandit avec elle et
          défile avec la page (plus de cage figée à h-dvh/overflow-hidden côté desktop). */}
      <div className="relative hidden w-1/2 self-stretch overflow-hidden bg-brand-bg lg:flex lg:items-center">
        {/* Même maillage de points que VisionHero (app/vision) plutôt qu'un
            dégradé flou façon "mesh SaaS" — plus proche de l'identité du
            site (réseau/connexions) et, comme lui, s'estompe vers
            transparent sur les bords : révèle nativement le même
            bg-brand-bg que la colonne formulaire, donc la jonction entre
            les deux colonnes reste automatiquement alignée. */}
        <NetworkBackground />

        {/* Cadre "carte" (bordure fine, coins arrondis, badge logo,
            initiales) reconstruit en CSS — même principe que la version
            mobile (voir LoginMobileFlow.tsx), plutôt qu'une carte cuite
            dans une image. */}
        <div className="absolute inset-6 rounded-3xl border border-white/20 sm:inset-8">
          <span className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-black/20 backdrop-blur">
            <Image
              src="/images/logo.svg"
              alt="Logo LIIVRE MOI"
              width={40}
              height={40}
              className="h-full w-full scale-150 object-contain"
            />
          </span>
          <span className="absolute bottom-6 left-6 text-sm font-semibold text-brand-white/60">
            LM
          </span>
        </div>

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

      {/* ── Colonne formulaire ── sur mobile : viewport fixe (h-dvh + overflow-hidden sur
          <main>), elle seule scrolle (overflow-y-auto) si le contenu dépasse un petit écran.
          Sur desktop (lg:) : plus de cage, <main> grandit avec le contenu (lg:h-auto,
          lg:overflow-visible) et c'est la page entière qui défile, image comprise (voir
          lg:overflow-visible plus bas dans LoginMobileFlow.tsx).
          Sur mobile, LoginMobileFlow la masque tant que l'étape "Continuer" n'est pas passée
          (voir app/components/LoginMobileFlow.tsx) ; sur desktop elle reste toujours visible. */}
      <LoginMobileFlow>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-brand-white/60 transition hover:text-brand-white"
        >
          <span aria-hidden>←</span> Retour au site
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          {/* Pas de logo au-dessus de "Connexion" : absent de la maquette Figma. */}
          <h1 className="text-2xl font-bold sm:text-3xl">Connexion</h1>
          <p className="mt-2 text-sm text-brand-white/60">
            Accédez au tableau de bord de votre boutique.
          </p>

          <LoginForm />
        </div>
      </LoginMobileFlow>
    </main>
  );
}