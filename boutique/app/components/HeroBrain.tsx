"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "framer-motion";

/*
  Illustration du Hero : un cerveau composé de 5 pièces distinctes, écartées
  en cercle autour d'un point de relai central (image hero-brain-connector.png).

  Réécrit avec framer-motion (à partir d'un essai fourni par l'utilisateur,
  bâti sur un composant BrainHero en framer-motion + <motion.img>) : on garde
  les mêmes 5 images et les mêmes deux jeux de positions (PIECES = éclaté,
  position d'origine Figma ; ASSEMBLED = rassemblé, cibles choisies à la main
  pour que les lobes s'emboîtent) que l'ancienne version CSS, mais c'est
  maintenant framer-motion qui anime le passage de l'un à l'autre — plus
  besoin de --piece-dx/--piece-dy en variables CSS ni de @keyframes séparés.

  Animation 100% automatique, boucle infinie (LOOP ci-dessous), partout —
  pas de bouton Assembler/Désassembler : le déclenchement au clic (essai
  d'origine) a été retiré à la demande de l'utilisateur.

  Pas de traits/flèches SVG dessinés à la main (retirés à la demande de
  l'utilisateur) : le point de relai est l'export Figma statique
  hero-brain-connector.png (lignes + point), et son opacité diminue à
  mesure que les pièces se rassemblent, jusqu'à disparaître une fois le
  cerveau assemblé (voir animate={{ opacity: scalarFor(1, 0) }} plus bas).
  (Un essai avec 6 images séparées — dot/indigo/bleu/black/white/"blue
  bottom".png, une par branche — a été tenté le 01/09/2026 puis abandonné
  à la demande de l'utilisateur, retour au PNG unique.)

  Repère : tout est positionné en % à l'intérieur d'une boîte dont le ratio
  reprend celui du cadre Figma d'origine (« le tout » fourni par
  l'utilisateur le 01/09/2026 : 258.30847778468376 × 242.10753440861822).

  PIECES et CONNECTOR viennent des dimensions Figma exactes de chaque
  calque envoyées par l'utilisateur ce même jour (cadre + chaque pièce/trait
  en left/top/width/height/angle) : le centre de chaque boîte Figma
  (left+width/2, top+height/2) reste valable quelle que soit sa rotation
  propre — la rotation autour du centre ne déplace pas le centre — donc
  converti tel quel en % du cadre pour positionner chaque image. Les
  valeurs top/left des deux pièces « top » et « left » avaient d'abord été
  affectées telles quelles à partir des libellés Figma (qui semblaient
  inversés par rapport à leur position visuelle) ; l'utilisateur a confirmé
  à l'écran que c'était bien une inversion involontaire, donc les couples
  left/top/width/height des pièces « top » et « left » sont ici échangés
  entre elles pour revenir à leur position visuelle réelle.

  Cadrage du point de relai (.hero-brain-dot en CSS) recalé sur le cadre
  Figma ci-dessus : régression linéaire à partir du centre du point + des
  5 pointes de trait détectées par scan de pixels dans le PNG (512×540),
  mises en correspondance avec le centre de chaque pièce.
*/

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
    left: 67.76,
    top: 25.22,
    width: 41.86,
    height: 38.93,
    zIndex: 5,
  },
  {
    id: "left",
    src: "/images/hero-brain/piece-left.png",
    alt: "Lobe gauche du cerveau, bleu nuit",
    left: 14.76,
    top: 35.26,
    width: 33.94,
    height: 42.1,
    zIndex: 3,
  },
  {
    id: "right",
    src: "/images/hero-brain/piece-right.png",
    alt: "Lobe droit du cerveau, lavande",
    left: 87.69,
    top: 56.32,
    width: 44.69,
    height: 29.88,
    zIndex: 4,
  },
  {
    id: "bottom-left",
    src: "/images/hero-brain/piece-bottom-left.png",
    alt: "Lobe inférieur gauche du cerveau, noir",
    left: 34.74,
    top: 78.49,
    width: 28.99,
    height: 30.47,
    zIndex: 2,
  },
  {
    id: "bottom-right",
    src: "/images/hero-brain/piece-bottom-right.png",
    alt: "Lobe inférieur droit du cerveau, bleu avec tige",
    left: 70.9,
    top: 91.09,
    width: 38.04,
    height: 31.08,
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

  // Transition partagée par les pièces et par l'opacité du point de relai.
  // prefers-reduced-motion : pas de boucle, cerveau affiché assemblé (état
  // fixe), point de relai invisible (opacité gathered = 0).
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

  // Même logique que targetFor, mais pour une valeur scalaire — sert ici à
  // l'opacité du point de relai (1 éclaté → 0 assemblé).
  const scalarFor = (base: number, gathered: number) =>
    reduceMotion ? gathered : [base, gathered, base];

  return (
    <div
      className={`hero-brain relative w-full ${className}`}
      style={{ aspectRatio: "258.30847778468376 / 242.10753440861822" }}
    >
      <div
        className="absolute inset-0"
        aria-label="Réseau de connexions animé par un point de relai, symbolisant la solution LM"
        role="img"
      >
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

      {/* Point de relai : visible tant que les lobes sont écartés, s'estompe
          à mesure qu'ils se rassemblent (opacité 1 → 0), disparaît une fois
          le cerveau assemblé. */}
      <motion.div
        className="hero-brain-dot"
        animate={{ opacity: scalarFor(1, 0) }}
        transition={transition}
        aria-hidden="true"
      >
        <Image
          src="/images/hero-brain/hero-brain-connector.png"
          alt=""
          fill
          className="hero-brain-dot-core object-contain"
          priority
        />
      </motion.div>
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

