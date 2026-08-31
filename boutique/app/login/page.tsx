import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import AuthOverlayText from "../components/AuthOverlayText";
import LoginMobileFlow from "../components/LoginMobileFlow";
import LoginForm from "../components/LoginForm";

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
    <main className="relative flex h-dvh overflow-hidden lg:h-auto lg:min-h-dvh lg:overflow-visible">
      {/* ── Colonne visuel (image Figma) ── plein bord, moitié d'écran, sans marge ni coin arrondi.
          Pas de h-full : en lg elle s'étire (align-items: stretch, comportement flex par défaut)
          à la hauteur naturelle de la colonne formulaire en face, donc grandit avec elle et
          défile avec la page (plus de cage figée à h-dvh/overflow-hidden côté desktop). */}
      <div className="relative hidden w-1/2 self-stretch overflow-hidden bg-brand-bg lg:flex lg:items-center">
        <Image
          src="/images/Login.png"
          alt="Carte visuelle décorative aux dégradés violet et rose de Livre Moi"
          width={704}
          height={1029}
          className="h-auto w-full"
          priority
        />

        {/* La carte (marge sombre, bordure fine, point rose) est déjà cuite
            dans l'image, pas besoin de la reconstruire en CSS comme sur
            mobile (voir LoginMobileFlow.tsx, qui lui utilise Rectangle.png —
            sans carte — car sa carte est plus petite que l'écran).
            Pas de "fill" : l'image garde son ratio 704×1029 et s'étire en
            largeur pleine (w-full h-auto) au lieu d'être recadrée. Ce qui
            dépasse en hauteur (colonne plus grande que l'image à cette
            largeur) devient de l'espace haut/bas, centré par items-center
            sur le conteneur, comblé par bg-brand-bg posé dessus. */}

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
