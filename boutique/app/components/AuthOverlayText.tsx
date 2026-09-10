"use client";

import { useEffect, useState, type ReactNode } from "react";

/*
  Texte superposé sur le visuel des pages Connexion/Inscription
  (app/login/page.tsx, app/inscription/page.tsx).

  Pourquoi un composant client plutôt qu'un simple <div> + classe CSS
  "animate-…" posée directement dans le HTML serveur : Next.js
  précharge (prefetch) ces routes dès que leur <Link> entre dans le
  viewport (voir Hero.tsx / CTA.tsx). Une animation CSS "autoplay"
  posée sur du HTML pré-rendu peut donc déjà être terminée au moment
  où l'utilisateur clique réellement, et le texte apparaît figé tant
  qu'on n'actualise pas la page. Ici, l'animation ne démarre qu'après
  le vrai montage du composant côté client (useEffect), donc elle rejoue
  à chaque navigation, prefetch ou non.
*/
export default function AuthOverlayText({
  label,
  heading,
  cta,
}: {
  label: ReactNode;
  heading: ReactNode;
  /* Bouton optionnel affiché sous l'accroche (ex. "Continuer" sur l'écran
     d'accueil mobile de app/login/page.tsx, voir LoginMobileFlow.tsx) —
     absent des usages existants (desktop, inscription), donc sans effet
     dessus. */
  cta?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Label et accroche collés l'un à l'autre (petit gap), groupe centré au
  // milieu de l'image (justify-center). Le bloc de texte reste borné en
  // largeur (max-w-xs/sm) plutôt que de s'étirer sur toute la px-6/px-10 :
  // sans ça, sur les mobiles larges ou en tablette portrait (tout ce qui
  // reste sous le breakpoint lg de app/login/page.tsx), le <br/> de
  // "heading" force un retour à la ligne mais la 1ʳᵉ ligne s'étale sur
  // presque toute la largeur d'écran — au lieu du bloc compact et centré
  // de la maquette Figma, identique à tout écran mobile.
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center sm:px-10">
      <div className="mx-auto flex w-full max-w-xs flex-col items-center sm:max-w-sm">
        <p
          className={`mb-4 text-sm font-bold text-brand-white sm:text-base ${
            mounted ? "animate-auth-overlay" : "opacity-0"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-lg font-extrabold leading-snug text-brand-white sm:text-xl ${
            mounted ? "animate-auth-overlay" : "opacity-0"
          }`}
          style={mounted ? { animationDelay: "150ms" } : undefined}
        >
          {heading}
        </p>
        {cta && (
          <div
            className={mounted ? "animate-auth-overlay" : "opacity-0"}
            style={mounted ? { animationDelay: "300ms" } : undefined}
          >
            {cta}
          </div>
        )}
      </div>
    </div>
  );
}
