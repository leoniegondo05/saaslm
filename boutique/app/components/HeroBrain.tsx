import Image from "next/image";

/*
  Illustration statique du Hero : un cerveau composé de 5 pièces distinctes,
  écartées en cercle autour d'un point rose central, reliées par 5 traits.
  Positions et rotation (-12.53deg, uniforme sur toutes les pièces) copiées
  du fichier Figma (frame "point de liaison", node 10944:192).

  Le fichier Figma statique (node 10944:192) ne contenait qu'un pulse
  d'opacité sur l'ensemble du groupe (pièces + traits), voir
  .hero-brain-cluster / @keyframes hero-brain-pulse dans globals.css.

  Ajout demandé (hors export Figma statique, inspiré du prototype Figma /
  export Jitter fournis en référence) : les 5 pièces se rapprochent et se
  croisent pour former un seul cerveau assemblé, bien plus grand, puis
  repartent à leur position d'origine — en boucle continue. Le
  déplacement de chaque pièce (--piece-dx / --piece-dy, en cqw/cqh = %
  de la boîte 965×926) est calculé ici à partir de ASSEMBLED[id] -
  position d'origine de la pièce (cibles choisies à la main, pièce par
  pièce, pour que les lobes s'emboîtent plutôt que de tous converger vers
  un même point) ; l'agrandissement (scale) qui accompagne ce
  rapprochement vit sur .hero-brain-cluster (globals.css,
  hero-brain-cluster-scale). L'animation des pièces elle-même
  (hero-brain-piece-gather, globals.css) utilise la propriété `translate`
  séparée du `transform` inline (translate(-50%,-50%) + rotation), donc
  les deux se cumulent sans interférer.

  Le point rose + les 5 traits en zigzag viennent d'un export Figma
  (hero-brain-connector.png, 512×540 = taille exacte de la frame "point de
  liaison" node 10944:192) plutôt que d'être redessinés en CSS — le zigzag
  et les angles sont donc pixel-perfect. CONNECTOR positionne cet export
  dans la boîte 965×926 ; il rend derrière les pièces (ordre DOM), comme
  dans Figma.

  Repère : tout est positionné en % à l'intérieur d'une boîte dont le
  ratio (965 / 926) reprend celui de la frame Figma d'origine.
*/

const CONNECTOR = { left: 16.34, top: 21.56, width: 53.06, height: 58.3 }; // % de la boîte 965×926
const DOT_CENTER = { left: 40.67, top: 39.45 }; // centre du point rose dans l'export, % de la boîte
const ROTATION = -12.53; // deg, tilt uniforme de toutes les pièces (Figma)

// Position de chaque pièce une fois le cerveau assemblé (% de la boîte,
// centre de la pièce) — choisies à la main par essais visuels (capture
// d'écran + ajustements) pour que les lobes s'emboîtent en un seul volume
// reconnaissable, plutôt que de toutes converger vers DOT_CENTER. Combinée
// au scale(1.65) de hero-brain-cluster-scale (globals.css) au même moment.
// Chaque pièce garde sa taille d'origine (aucun scale individuel) : ces
// cibles sont volontairement resserrées vers DOT_CENTER (bien plus que la
// disposition éclatée) pour que les 5 pièces, à taille inchangée, se
// recouvrent assez pour lire comme un seul volume plutôt que 5 taches qui
// se touchent à peine.
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
  left: number; // % de la boîte, centre de la pièce
  top: number; // % de la boîte, centre de la pièce
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

export default function HeroBrain({ className = "" }: { className?: string }) {
  return (
    <div
      className={`hero-brain relative w-full ${className}`}
      style={{ aspectRatio: "965 / 926" }}
      aria-label="Réseau de connexions animé par un point central rose, symbolisant la solution LM"
      role="img"
    >
      {/* Point rose + traits (export Figma) et pièces : pulsent ensemble en opacité */}
      <div className="hero-brain-cluster">
        <div
          className="hero-brain-connector"
          style={{
            left: `${CONNECTOR.left}%`,
            top: `${CONNECTOR.top}%`,
            width: `${CONNECTOR.width}%`,
            height: `${CONNECTOR.height}%`,
          }}
        >
          <Image
            src="/images/hero-brain/hero-brain-connector.png"
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 45vw, 25vw"
            aria-hidden="true"
          />
        </div>

        {PIECES.map((piece) => (
          <div
            key={piece.id}
            className="hero-brain-piece"
            style={{
              left: `${piece.left}%`,
              top: `${piece.top}%`,
              width: `${piece.width}%`,
              height: `${piece.height}%`,
              zIndex: piece.zIndex,
              transform: `translate(-50%, -50%) rotate(${ROTATION}deg)`,
              // Déplacement vers la position assemblée de cette pièce
              // (ASSEMBLED), consommé par @keyframes hero-brain-piece-gather
              // (globals.css) via `translate`.
              ["--piece-dx" as string]: `${ASSEMBLED[piece.id].left - piece.left}cqw`,
              ["--piece-dy" as string]: `${ASSEMBLED[piece.id].top - piece.top}cqh`,
            }}
          >
            <Image
              src={piece.src}
              alt={piece.alt}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 45vw, 25vw"
              priority
            />
          </div>
        ))}
      </div>

      {/* Halo du point rose : indépendant du pulse, clignote en continu */}
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
