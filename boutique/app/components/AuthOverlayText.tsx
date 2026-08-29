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
}: {
  label: string;
  heading: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Label et accroche collés l'un à l'autre (petit gap), groupe centré au
  // milieu de l'image (justify-center).
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
      <p
        className={`mb-4 text-base font-bold text-brand-white ${
          mounted ? "animate-auth-overlay" : "opacity-0"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-xl font-extrabold leading-snug text-brand-white ${
          mounted ? "animate-auth-overlay" : "opacity-0"
        }`}
        style={mounted ? { animationDelay: "150ms" } : undefined}
      >
        {heading}
      </p>
    </div>
  );
}
