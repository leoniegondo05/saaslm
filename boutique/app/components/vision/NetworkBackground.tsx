// Fond décoratif "réseau de points" utilisé derrière le titre de
// VisionHero.tsx (voir capture fournie par l'utilisateur) : un semis de
// points bleus/roses reliés par de fines lignes, comme un maillage de
// connexions à travers tout le continent.
//
// Généré une seule fois via un PRNG à graine fixe (mulberry32) plutôt
// qu'avec Math.random() : le rendu reste strictement identique à chaque
// requête serveur et lors de l'hydratation côté client, pas de flash /
// mismatch. Chaque point est dessiné deux fois (halo flou + cœur net),
// comme le style "néon" déjà utilisé dans HeroBrain.tsx.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VIEW_W = 1400;
const VIEW_H = 800;
const POINT_COUNT = 110;
const PINK = "#ec0c8c";
const BLUE = "#2f6fe0";

type Point = { x: number; y: number; r: number; color: string; opacity: number };

const random = mulberry32(42);

// Deux bandes horizontales ondulées (gauche et droite), comme sur la
// capture, avec un creux moins dense au centre derrière le texte.
const POINTS: Point[] = Array.from({ length: POINT_COUNT }, (_, i) => {
  const band = i % 2 === 0 ? 0.22 : 0.72; // centre de bande, en fraction de largeur
  const x = ((band + (random() - 0.5) * 0.55) % 1) * VIEW_W;
  const wave = Math.sin(x / 140) * 90;
  const y = VIEW_H * 0.5 + wave + (random() - 0.5) * 260;
  const isPink = random() < 0.28;
  return {
    x,
    y,
    r: 1.4 + random() * 2.4,
    color: isPink ? PINK : BLUE,
    opacity: 0.35 + random() * 0.55,
  };
});

// Quelques lignes reliant des points voisins dans chaque bande, pour
// suggérer un maillage plutôt qu'un simple nuage de points.
const LINES = POINTS.slice(0, -1)
  .map((p, i) => ({ a: p, b: POINTS[i + 1] }))
  .filter((_, i) => i % 3 === 0);

export default function NetworkBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="vision-network-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <radialGradient id="vision-network-vignette" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#0b1230" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#000717" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={VIEW_W} height={VIEW_H} fill="url(#vision-network-vignette)" />

      {LINES.map((line, i) => (
        <line
          key={i}
          x1={line.a.x}
          y1={line.a.y}
          x2={line.b.x}
          y2={line.b.y}
          stroke={line.a.color}
          strokeOpacity={0.12}
          strokeWidth={1}
        />
      ))}

      {POINTS.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r * 2.4} fill={p.color} opacity={p.opacity * 0.35} filter="url(#vision-network-blur)" />
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity={p.opacity} />
        </g>
      ))}
    </svg>
  );
}
