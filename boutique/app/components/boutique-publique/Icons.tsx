import { LuChevronRight, LuGrid2X2, LuMail, LuMapPin, LuPhone, LuShare2 } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";

/*
  Petites icônes/décors partagés par les sections publiques — portés
  fidèlement depuis BoutiquePreview.tsx (Etoiles, HaloRayons, HaloCourbes,
  FeuilleDecor) pour que le rendu final reste visuellement identique à
  l'aperçu de l'éditeur. Les icônes fonctionnelles (recherche, coche,
  chevrons, etc.) viennent de react-icons/lu (Lucide) directement dans
  chaque composant appelant plutôt que d'un chemin SVG maison — cf. demande
  du 2026-09-22 ("les icônes ne me plaisent pas, installe react-icons").
  Composants purs (pas de "use client" : aucun hook), donc utilisables aussi
  bien depuis des Server Components que des Client Components.
*/

export function ShareIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return <LuShare2 size={size} color={color} aria-hidden />;
}

/** Chevron ">" — icône du bouton principal du hero ("Découvrir les soins"). */
export function ChevronRightIcon({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return <LuChevronRight size={size} color={color} aria-hidden />;
}

/** Grille 2x2 — icône du bouton secondaire du hero ("Voir les offres"). */
export function GridIcon({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return <LuGrid2X2 size={size} color={color} aria-hidden />;
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
  return <FaWhatsapp size={size} color="#fff" aria-hidden />;
}

export function PhoneIcon({ color = "currentColor", className = "h-3.5 w-3.5" }: { color?: string; className?: string }) {
  return <LuPhone color={color} className={className} aria-hidden />;
}

export function MailIcon({ color = "currentColor", className = "h-3.5 w-3.5" }: { color?: string; className?: string }) {
  return <LuMail color={color} className={className} aria-hidden />;
}

export function MapPinIcon({ color = "currentColor", className = "h-3.5 w-3.5" }: { color?: string; className?: string }) {
  return <LuMapPin color={color} className={className} aria-hidden />;
}
