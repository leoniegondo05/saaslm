"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "framer-motion";

/*
  Illustration du Hero : un cerveau composé de 5 pièces distinctes, écartées
  en cercle autour d'un point rose central, reliées par 5 traits.

  Réécrit avec framer-motion (à partir d'un essai fourni par l'utilisateur,
  bâti sur un composant BrainHero en framer-motion + <motion.img> + traits
  SVG dessinés à la main) : on garde les mêmes 5 images et les mêmes deux
  jeux de positions (PIECES = éclaté, position d'origine Figma ; ASSEMBLED =
  rassemblé, cibles choisies à la main pour que les lobes s'emboîtent) que
  l'ancienne version CSS, mais c'est maintenant framer-motion qui anime le
  passage de l'un à l'autre — plus besoin de --piece-dx/--piece-dy en
  variables CSS ni de @keyframes séparés.

  Animation 100% automatique, boucle infinie (LOOP ci-dessous), partout —
  pas de bouton Assembler/Désassembler : le déclenchement au clic (essai
  d'origine) a été retiré à la demande de l'utilisateur.

  Autre différence avec l'ancienne version : les 5 traits ne viennent plus
  d'un export Figma statique (hero-brain-connector.png, calé uniquement sur
  la position éclatée) mais sont dessinés en SVG (<BrainLines>) à partir des
  mêmes coordonnées PIECES/ASSEMBLED que les pièces elles-mêmes — les traits
  suivent donc exactement chaque pièce, dans les deux états.

  Repère : tout est positionné en % à l'intérieur d'une boîte dont le ratio
  (965 / 926) reprend celui de la frame Figma d'origine.
*/

const DOT_CENTER = { left: 40.67, top: 39.45 }; // centre du point rose, % de la boîte
const ROTATION = -12.53; // deg, tilt uniforme de toutes les pièces (Figma)

// Position de chaque pièce une fois le cerveau assemblé (% de la boîte,
// centre de la pièce) — choisies à la main par essais visuels pour que les
// lobes s'emboîtent en un seul volume reconnaissable.
const ASSEMBLED: Record<string, { left: number; top: number }> = {
  top: { left: 43.8, top: 35.2 },
  left: { left: 38.3, top: 40.7 },
  right: { left: 45.7, top: 41.6 },
  "bottom-left": { left: 38.3, top: 46.7 },
  "bottom-right": { left: 44.9, top: 49.6 },
};

type Piece = {
  id: string;
  src: string;
  alt: string;
  left: number; // % de la boîte, centre de la pièce (position éclatée)
  top: number; // % de la boîte, centre de la pièce (position éclatée)
  width: number; // % de la largeur de la boîte
  height: number; // % de la hauteur de la boîte
  zIndex: number;
};

const PIECES: Piece[] = [
  {
    id: "top",
    src: "/images/hero-brain/piece-top.png",
    alt: "Lobe supérieur du cerveau, violet",
    left: 60.1,
    top: 22.7,
    width: 34,
    height: 23,
    zIndex: 5,
  },
  {
    id: "left",
    src: "/images/hero-brain/piece-left.png",
    alt: "Lobe gauche du cerveau, bleu nuit",
    left: 14.5,
    top: 28.1,
    width: 27,
    height: 32,
    zIndex: 3,
  },
  {
    id: "right",
    src: "/images/hero-brain/piece-right.png",
    alt: "Lobe droit du cerveau, lavande",
    left: 76.7,
    top: 50.8,
    width: 30,
    height: 19,
    zIndex: 4,
  },
  {
    id: "bottom-left",
    src: "/images/hero-brain/piece-bottom-left.png",
    alt: "Lobe inférieur gauche du cerveau, noir",
    left: 31.1,
    top: 65.9,
    width: 24,
    height: 23,
    zIndex: 2,
  },
  {
    id: "bottom-right",
    src: "/images/hero-brain/piece-bottom-right.png",
    alt: "Lobe inférieur droit du cerveau, bleu avec tige",
    left: 61.1,
    top: 78.8,
    width: 27,
    height: 27,
    zIndex: 1,
  },
];

// Boucle automatique, seule et unique animation désormais (plus de bouton
// Assembler/Désassembler) : va-et-vient continu entre éclaté → assemblé →
// éclaté, en fond comme dans la colonne desktop de Hero.tsx.
const LOOP: Transition = {
  duration: 2.6,
  times: [0, 0.5, 1],
  ease: "easeInOut",
  repeat: Infinity,
  repeatDelay: 0.7,
};

export default function HeroBrain({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  // Transition + valeurs cibles utilisées pour chaque pièce ET pour les
  // traits qui la relient au point rose (mêmes coordonnées, donc les traits
  // suivent toujours exactement les pièces). prefers-reduced-motion : pas
  // de boucle, cerveau affiché assemblé (état fixe).
  const transition: Transition = reduceMotion ? { duration: 0 } : LOOP;

  const targetFor = (piece: Piece) => {
    const gathered = ASSEMBLED[piece.id];
    const base = { left: piece.left, top: piece.top };
    if (reduceMotion) return gathered;
    // boucle : éclaté → assemblé → éclaté
    return {
      left: [base.left, gathered.left, base.left],
      top: [base.top, gathered.top, base.top],
    };
  };

  // Même logique que targetFor, mais pour une valeur scalaire (rayon des
  // cercles du halo central en SVG) plutôt qu'une position par pièce.
  const scalarFor = (base: number, gathered: number) =>
    reduceMotion ? gathered : [base, gathered, base];

  return (
    <div
      className={`hero-brain relative w-full ${className}`}
      style={{ aspectRatio: "965 / 926" }}
    >
      <div
        className="absolute inset-0"
        aria-label="Réseau de connexions animé par un point central rose, symbolisant la solution LM"
        role="img"
      >
        <BrainLines
          pieces={PIECES}
          targetFor={targetFor}
          scalarFor={scalarFor}
          transition={transition}
        />

        {PIECES.map((piece) => {
          const target = targetFor(piece);
          return (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                width: `${piece.width}%`,
                height: `${piece.height}%`,
                zIndex: piece.zIndex,
                x: "-50%",
                y: "-50%",
                rotate: ROTATION,
              }}
              initial={{ left: `${piece.left}%`, top: `${piece.top}%` }}
              animate={{
                left: toPercent(target.left),
                top: toPercent(target.top),
              }}
              transition={transition}
            >
              <Image
                src={piece.src}
                alt={piece.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 45vw, 25vw"
                priority
              />
            </motion.div>
          );
        })}
      </div>

      {/* Halo du point rose : indépendant du reste, clignote en continu */}
      <div
        className="hero-brain-dot"
        style={{ left: `${DOT_CENTER.left}%`, top: `${DOT_CENTER.top}%` }}
        aria-hidden="true"
      >
        <span className="hero-brain-dot-core animate-brand-glow" />
      </div>
    </div>
  );
}

// framer-motion accepte un nombre, une chaîne ("42%") ou un tableau de ces
// deux (pour la boucle) comme valeur de style animée — cette fonction
// convertit nos valeurs (nombre ou tableau de nombres, en % de la boîte)
// dans le format attendu.
function toPercent(value: number | number[]): string | string[] {
  return Array.isArray(value) ? value.map((v) => `${v}%`) : `${value}%`;
}

// Nuances néon dérivées du rose de marque (var(--color-brand-pink),
// #ec0c8c) : pas de token dédié pour celles-ci, elles ne servent qu'au
// glow SVG ci-dessous (halo flou + cœur brillant).
const NEON_BRIGHT = "#ff4da6";
const NEON_PALE = "#ffb3d9";

/*
  Traits reliant chaque pièce au point rose central, en SVG plutôt qu'en
  export Figma : le viewBox reprend exactement l'espace en % (0-100 sur
  chaque axe, indépendamment étirés via preserveAspectRatio="none") utilisé
  par PIECES/ASSEMBLED, donc chaque trait part du point rose et arrive
  pile au centre de sa pièce, dans les deux états.

  Style "néon" (repris d'un essai fourni par l'utilisateur) : chaque trait
  est dessiné deux fois — une passe floue (filter="url(#neonGlow)", plus
  épaisse) derrière une passe nette par-dessus — et s'épaissit/s'illumine
  quand le cerveau est assemblé. Même traitement pour les points aux
  extrémités et pour le halo central (3 cercles imbriqués + cœur clair).
*/
function BrainLines({
  pieces,
  targetFor,
  scalarFor,
  transition,
}: {
  pieces: Piece[];
  targetFor: (piece: Piece) => { left: number | number[]; top: number | number[] };
  scalarFor: (base: number, gathered: number) => number | number[];
  transition: Transition;
}) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="hero-brain-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="blur1" />
          <feGaussianBlur stdDeviation="1.2" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hero-brain-center-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {pieces.map((piece) => {
        const target = targetFor(piece);
        const strokeWidth = scalarFor(0.3, 0.85);
        const glowOpacity = scalarFor(0.25, 0.9);
        const lineOpacity = scalarFor(0.4, 1);
        return (
          <g key={piece.id}>
            {/* passe floue, derrière */}
            <motion.line
              x1={DOT_CENTER.left}
              y1={DOT_CENTER.top}
              animate={{ x2: target.left, y2: target.top, strokeWidth, opacity: glowOpacity }}
              transition={transition}
              stroke="var(--color-brand-pink)"
              strokeLinecap="round"
              filter="url(#hero-brain-neon-glow)"
            />
            {/* passe nette, par-dessus */}
            <motion.line
              x1={DOT_CENTER.left}
              y1={DOT_CENTER.top}
              animate={{
                x2: target.left,
                y2: target.top,
                strokeWidth: scalarFor(0.14, 0.3),
                opacity: lineOpacity,
              }}
              transition={transition}
              stroke={NEON_BRIGHT}
              strokeLinecap="round"
            />
            {/* point à l'extrémité : halo + cœur clair */}
            <motion.circle
              animate={{ cx: target.left, cy: target.top, r: scalarFor(0.6, 1.1), opacity: glowOpacity }}
              transition={transition}
              fill="var(--color-brand-pink)"
              filter="url(#hero-brain-neon-glow)"
            />
            <motion.circle
              animate={{ cx: target.left, cy: target.top, r: scalarFor(0.3, 0.55), opacity: lineOpacity }}
              transition={transition}
              fill={NEON_PALE}
            />
          </g>
        );
      })}

      {/* halo central : 3 cercles imbriqués (externe très flou, moyen glow,
          anneau) + cœur clair — s'agrandissent et s'illuminent à l'assemblage. */}
      <g>
        <motion.circle
          cx={DOT_CENTER.left}
          cy={DOT_CENTER.top}
          animate={{ r: scalarFor(3.5, 7), opacity: scalarFor(0.08, 0.25) }}
          transition={transition}
          fill="var(--color-brand-pink)"
          filter="url(#hero-brain-center-glow)"
        />
        <motion.circle
          cx={DOT_CENTER.left}
          cy={DOT_CENTER.top}
          animate={{ r: scalarFor(1.7, 3.1), opacity: scalarFor(0.4, 0.9) }}
          transition={transition}
          fill="var(--color-brand-pink)"
          filter="url(#hero-brain-neon-glow)"
        />
        <motion.circle
          cx={DOT_CENTER.left}
          cy={DOT_CENTER.top}
          animate={{ r: scalarFor(2.3, 4), opacity: scalarFor(0.3, 1) }}
          transition={transition}
          fill="none"
          stroke="var(--color-brand-pink)"
          strokeWidth={0.28}
        />
        <motion.circle
          cx={DOT_CENTER.left}
          cy={DOT_CENTER.top}
          animate={{ r: scalarFor(0.7, 1.4) }}
          transition={transition}
          fill={NEON_PALE}
        />
      </g>
    </svg>
  );
}
