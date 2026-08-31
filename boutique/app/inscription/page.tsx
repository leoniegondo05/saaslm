import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import AuthOverlayText from "../components/AuthOverlayText";
import InscriptionMobileFlow from "../components/InscriptionMobileFlow";
import InscriptionForm from "../components/InscriptionForm";

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
            mobile (voir InscriptionMobileFlow.tsx, qui lui utilise
            Rectangle.png — sans carte — car sa carte est plus petite que
            l'écran).
            Pas de "fill" : l'image garde son ratio 704×1029 et s'étire en
            largeur pleine (w-full h-auto) au lieu d'être recadrée. Ce qui
            dépasse en hauteur (colonne plus grande que l'image à cette
            largeur) devient de l'espace haut/bas, centré par items-center
            sur le conteneur, comblé par bg-brand-bg posé dessus. */}

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
          champs (grid sm:grid-cols-2) restent lisibles.
          Sur mobile : viewport fixe (h-dvh + overflow-hidden sur <main>),
          elle seule scrolle (overflow-y-auto) si le formulaire dépasse un
          petit écran. Sur desktop (lg:) : plus de cage, <main> grandit avec
          le contenu et c'est la page entière qui défile, image comprise.
          Sur mobile, InscriptionMobileFlow la masque tant que l'étape
          "Commencer" n'est pas passée (voir
          app/components/InscriptionMobileFlow.tsx) ; sur desktop elle reste
          toujours visible. */}
      <InscriptionMobileFlow>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-brand-white/60 transition hover:text-brand-white"
        >
          <span aria-hidden>←</span> Retour au site
        </Link>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
          {/* Pas de logo au-dessus de "Inscription" : absent de la maquette Figma. */}
          <h1 className="text-2xl font-bold sm:text-3xl">Inscription</h1>
          <p className="mt-2 text-sm text-brand-white/60">
            Créez votre compte pour ouvrir votre boutique.
          </p>

          <InscriptionForm />
        </div>
      </InscriptionMobileFlow>
    </main>
  );
}
