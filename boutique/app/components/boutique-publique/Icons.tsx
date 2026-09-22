/*
  Petites icônes/décors partagés par les sections publiques — portés
  fidèlement depuis BoutiquePreview.tsx (MiniIcon, Etoiles, HaloRayons,
  HaloCourbes, FeuilleDecor, WhatsappIcon, PhoneIcon/MailIcon/MapPinIcon) pour
  que le rendu final reste visuellement identique à l'aperçu de l'éditeur.
  Composants purs (pas de "use client" : aucun hook), donc utilisables aussi
  bien depuis des Server Components que des Client Components.
*/

export function Icon({ path, color = "currentColor", size = 16, strokeWidth = 1.6, className }: { path: string; color?: string; size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ height: size, width: size }} className={className} aria-hidden>
      <path d={path} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icône "partager" à 3 nœuds reliés (maquette utilisateur du 2026-09-22) —
 *  dessinée avec <circle>/<line> plutôt qu'un path à arcs pour des ronds
 *  parfaitement réguliers, contrairement à Icon (path seul). */
export function ShareIcon({ size = 20, color = "currentColor", strokeWidth = 2.6 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ height: size, width: size }} aria-hidden>
      <circle cx="7" cy="12" r="3.2" fill="none" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="18" cy="6" r="3.2" fill="none" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="18" cy="18" r="3.2" fill="none" stroke={color} strokeWidth={strokeWidth} />
      <line x1="9.81" y1="10.47" x2="15.19" y2="7.53" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="9.81" y1="13.53" x2="15.19" y2="16.47" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/** Chevron ">" — icône du bouton principal du hero ("Découvrir les soins"). */
export function ChevronRightIcon({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return <Icon path="M9 18l6-6-6-6" color={color} size={size} strokeWidth={2} />;
}

/** Grille 2x2 — icône du bouton secondaire du hero ("Voir les offres"). */
export function GridIcon({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return <Icon path="M3 3h7v7h-7z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7h-7z" color={color} size={size} strokeWidth={1.8} />;
}

export function Etoiles({ note, taille = 14, couleur = "#F2A93B" }: { note: number; taille?: number; couleur?: string }) {
  return (
    <span className="inline-flex gap-[1px]" style={{ color: couleur }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={taille} height={taille} fill={i < Math.round(note) ? "currentColor" : "rgba(140,132,150,.35)"} aria-hidden>
          <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

/** Courbes fines convergeant vers un point lumineux — décor du modèle Halo
 *  (grande image + pied de page nuit dans BoutiquePreview.tsx). */
export function HaloCourbes({ ton = "clair" }: { ton?: "clair" | "sombre" }) {
  const trait = ton === "sombre" ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.6)";
  const point = ton === "sombre" ? "rgba(232,32,126,.55)" : "rgba(255,255,255,.7)";
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
      <path d="M-20 40 C 120 10, 220 150, 420 90" fill="none" stroke={trait} strokeWidth="1" />
      <path d="M-20 130 C 140 190, 260 10, 420 55" fill="none" stroke={trait} strokeWidth="1" />
      <circle cx="338" cy="68" r="3" fill={point} />
    </svg>
  );
}

/** Rayons fins divergeant d'un point lumineux + feuilles éparpillées — décor
 *  du hero "grande image" du modèle Halo. `idSuffix` évite les collisions
 *  d'id SVG (gradients) quand plusieurs instances sont montées sur la page. */
export function HaloRayons({ idSuffix = "" }: { idSuffix?: string }) {
  const foyer = { x: 330, y: 92 };
  const rayons: [number, number][] = [
    [4, 22],
    [4, 92],
    [4, 168],
    [70, 6],
    [96, 190],
    [180, 2],
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
      <radialGradient id={`halo-rayons-foyer${idSuffix}`}>
        <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      {rayons.map(([x, y], i) => (
        <linearGradient key={i} id={`halo-rayon-fade-${idSuffix}-${i}`} x1={foyer.x} y1={foyer.y} x2={x} y2={y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      ))}
      {rayons.map(([x, y], i) => (
        <line key={i} x1={foyer.x} y1={foyer.y} x2={x} y2={y} stroke={`url(#halo-rayon-fade-${idSuffix}-${i})`} strokeWidth="0.75" />
      ))}
      <circle cx={foyer.x} cy={foyer.y} r="14" fill={`url(#halo-rayons-foyer${idSuffix})`} />
      <path d="M244 34 C 254 19, 274 19, 279 36 C 274 52, 254 52, 244 34Z" fill="rgba(255,255,255,.18)" transform="rotate(-25 261 36)" />
      <path d="M296 146 C 308 129, 330 131, 334 150 C 328 168, 306 166, 296 146Z" fill="rgba(255,255,255,.16)" transform="rotate(15 315 148)" />
      <path d="M366 58 C 376 44, 394 46, 396 62 C 392 78, 374 76, 366 58Z" fill="rgba(255,255,255,.16)" transform="rotate(40 381 60)" />
      <circle cx="226" cy="58" r="2" fill="#F5D36B" />
      <circle cx="356" cy="138" r="2" fill="#F5D36B" />
    </svg>
  );
}

export function FeuilleDecor({ className, color = "#fff", opacity = 0.2 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 40 64" className={className} aria-hidden>
      <path d="M20 2C7 11 3 30 20 62 37 30 33 11 20 2Z" fill={color} fillOpacity={opacity} />
      <path d="M20 8v50" stroke={color} strokeOpacity={Math.min(opacity + 0.15, 1)} strokeWidth={1.2} />
    </svg>
  );
}

export function WhatsappIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ height: size, width: size }} fill="#fff" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.24.7-1.4 1.3-1.9 1.4-.5.1-1.1.2-3.5-.7-2.9-1.1-4.8-4-5-4.2-.14-.2-1.2-1.6-1.2-3s.75-2.1 1-2.4c.26-.3.57-.36.76-.36h.55c.18 0 .42-.07.65.5.24.6.82 2 .9 2.15.07.15.12.32.02.5-.1.2-.15.32-.3.5l-.44.5c-.15.15-.3.32-.13.6.16.3.73 1.2 1.57 1.95 1.08 1 2 1.3 2.28 1.44.28.15.44.13.6-.08.17-.2.7-.82.9-1.1.2-.28.4-.23.66-.14.28.1 1.75.83 2.05 1 .3.14.5.2.57.33.08.13.08.72-.16 1.42Z" />
    </svg>
  );
}

export function PhoneIcon({ color = "currentColor", className = "h-3.5 w-3.5" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 3.5h3l1.3 4-2 1.5a10.5 10.5 0 0 0 5.7 5.7l1.5-2 4 1.3v3a1.5 1.5 0 0 1-1.6 1.5C11.5 18 6 12.5 5.5 6.1A1.5 1.5 0 0 1 6 3.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ color = "currentColor", className = "h-3.5 w-3.5" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MapPinIcon({ color = "currentColor", className = "h-3.5 w-3.5" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 21s6.5-6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5 6.5 11 6.5 11Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
