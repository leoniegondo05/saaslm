/*
  Recréation (en SVG + CSS, pas une vidéo) de la séquence d'une vidéo de
  référence, disposition horizontale (voir capture fournie) : un fil
  conducteur sinueux traverse toute la largeur, un point rose le parcourt
  de gauche à droite en laissant une traînée lumineuse, les 4 étapes
  au-dessus s'illuminent l'une après l'autre au passage du point, et
  chacune envoie un rayon lumineux vers un point de convergence rose
  (le "hub") en bas — jusqu'au climax : "sans affiliation" + le CTA.
  Le tout boucle en continu (18s, comme la vidéo d'origine).

  Tout est positionné en % à l'intérieur d'une boîte au ratio VIEW_W/VIEW_H
  (comme HeroBrain.tsx), à partir des coordonnées du viewBox ci-dessous —
  le SVG (fil conducteur + rayons) et les badges HTML se superposent donc
  correctement à n'importe quelle largeur d'écran.

  Section sur fond sombre (bg-brand-bg), comme le reste du site — pas de
  fond blanc isolé. Fil conducteur en dégradé bleu néon
  (how-it-works-wave-gradient, spec anim "session 2"), rayons "structure"
  en dégradé violet → rose, repris de la vidéo de référence, et les 4
  badges en pastille à bordure rose translucide (bg quasi transparent) au
  lieu d'une pastille pleine.
*/
import type { CSSProperties } from "react";
import SectionHeader from "./SectionHeader";

// Dimensions calées sur le calque Figma "group53" (animation complète :
// étapes + fil + rayons + hub) fourni par la maquette.
const VIEW_W = 1097;
const VIEW_H = 638.7802734375;

// Le tracé est utilisé à deux endroits qui doivent rester identiques :
// le <path> du SVG (rendu visuel) et le `offset-path` du point rose
// (globals.css, .how-it-works-dot) qui le fait avancer dessus.
//
// Le x de chaque crête (une par étape) n'est plus une valeur fixe choisie
// à l'œil : il dépend de la largeur réelle du mot du badge (nombre de
// caractères + padding du badge, voir PADDING/CHAR_WIDTH) — sans ça, un mot
// long comme "Personnaliser" rapprochait ses voisins bien plus que les
// autres paires. L'espace lui-même (GAPS) grossit de gauche à droite,
// comme sur la capture de référence (l'écart Créer↔Personnaliser y est
// nettement plus serré que Publier↔Commencer) : ce n'est pas un espacement
// uniforme.
const MARGIN = 34; // marge avant le centre du 1er badge
const GAPS = [110, 150, 190]; // espace bord à bord, croissant, entre badges consécutifs
const PADDING = 60; // px-[22px] de chaque côté du badge, ramené au viewBox
const CHAR_WIDTH = 9; // largeur moyenne d'un caractère (text-xs, Sora)

const STEP_LABELS = ["Créer", "Personnaliser", "Publier", "Commencer"];

// Bleu néon du fil conducteur (spec anim "session 2" : "fine ligne ondulée
// bleu néon") — pas de token dédié pour celui-ci (comme NEON_BRIGHT/PALE
// dans HeroBrain.tsx), il ne sert qu'à ce dégradé.
const NEON_BLUE = "#22d3ee";
const NEON_BLUE_DEEP = "#0891ff";

// Demi-largeur estimée du badge (padding + texte), pour caler son centre
// à GAPS[i] de son voisin plutôt que de coller leurs centres bruts.
function halfBadgeWidth(label: string) {
  return PADDING / 2 + (label.length * CHAR_WIDTH) / 2;
}

// Centre x de chaque étape, en chaîne : chaque badge est posé à GAPS[i-1]
// de bord du précédent, en tenant compte de la demi-largeur des deux.
function buildStepsX(labels: string[]) {
  const xs: number[] = [];
  labels.forEach((label, i) => {
    const half = halfBadgeWidth(label);
    xs.push(
      i === 0
        ? MARGIN + half
        : xs[i - 1] + halfBadgeWidth(labels[i - 1]) + GAPS[i - 1] + half
    );
  });
  return xs;
}

const STEP_X = buildStepsX(STEP_LABELS);

// Y de la courbe (crête/vallée/extrémités). PEAK_Y est repoussé assez bas
// sous les badges (y=17) pour laisser un vrai espace visible entre le mot
// et le fil — sur la capture de référence, le trait ne touche jamais le
// badge, il démarre nettement en dessous. Les rayons partent de ce même
// PEAK_Y (voir STEPS ci-dessous) : ils prolongent la crête, pas le badge.
const PEAK_Y = 100;
const VALLEY_Y = 185;
const START_Y = 151;
const END_Y = 141;

// Points de passage de la courbe : une crête par étape (alignée sur son x),
// une vallée au milieu de chaque paire de crêtes.
function buildWavePoints(xs: number[]) {
  const points = [{ x: 0, y: START_Y }];
  xs.forEach((x, i) => {
    points.push({ x, y: PEAK_Y });
    if (i < xs.length - 1) {
      points.push({ x: (x + xs[i + 1]) / 2, y: VALLEY_Y });
    }
  });
  points.push({ x: VIEW_W, y: END_Y });
  return points;
}

// Interpolation Catmull-Rom (convertie en Bézier cubique, tangentes
// continues à chaque point de passage) plutôt que des segments C bruts :
// ça évite tout changement de direction brusque aux sommets/creux et donne
// une vague organique, régulière, au rendu très propre. Premier/dernier
// point dupliqués comme voisin fantôme (tangente nulle aux extrémités).
//
// Renvoie les segments (pas directement le `d` sérialisé) : réutilisés à la
// fois pour tracer le path et pour mesurer sa longueur d'arc (PEAK_OFFSET_
// PERCENT ci-dessous) — donc le `d` et les % de sommet restent forcément
// synchronisés, aucun recalcul indépendant qui pourrait dériver.
type Pt = { x: number; y: number };
type CubicSegment = { p0: Pt; c1: Pt; c2: Pt; p3: Pt };

function catmullRomSegments(points: Pt[]): CubicSegment[] {
  const segments: CubicSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    segments.push({
      p0: p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p3: p2,
    });
  }
  return segments;
}

function segmentsToPathD(segments: CubicSegment[]) {
  let d = `M${segments[0].p0.x.toFixed(1)},${segments[0].p0.y.toFixed(1)}`;
  for (const seg of segments) {
    d += ` C${seg.c1.x.toFixed(1)},${seg.c1.y.toFixed(1)} ${seg.c2.x.toFixed(1)},${seg.c2.y.toFixed(1)} ${seg.p3.x.toFixed(1)},${seg.p3.y.toFixed(1)}`;
  }
  return d;
}

// Longueur d'un segment cubique par échantillonnage (approximation : sert
// juste à caler le bond du point sur les vrais sommets, pas à un rendu
// géométrique exact).
function cubicLength(seg: CubicSegment, steps = 40) {
  const at = (t: number): Pt => {
    const mt = 1 - t;
    return {
      x: mt * mt * mt * seg.p0.x + 3 * mt * mt * t * seg.c1.x + 3 * mt * t * t * seg.c2.x + t * t * t * seg.p3.x,
      y: mt * mt * mt * seg.p0.y + 3 * mt * mt * t * seg.c1.y + 3 * mt * t * t * seg.c2.y + t * t * t * seg.p3.y,
    };
  };
  let length = 0;
  let prev = at(0);
  for (let i = 1; i <= steps; i++) {
    const p = at(i / steps);
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return length;
}

const WAVE_SEGMENTS = catmullRomSegments(buildWavePoints(STEP_X));
const WAVE_PATH_D = segmentsToPathD(WAVE_SEGMENTS);

// % du trajet total (offset-distance) auquel le point touche chaque sommet
// — sommet = fin des segments 0/2/4/6 (buildWavePoints alterne sommet/
// creux/sommet/...). @keyframes how-it-works-dot-move (globals.css) cale
// le bond dessus (var(--dot-peak-N)) : sans ça, le bond (déclenché à un %
// de TEMPS fixe) tombait à un % d'ARC quelconque, décalé du vrai sommet vu
// l'espacement croissant des étapes (GAPS) — le point bondissait en plein
// vol au lieu de pile sur le mot.
const SEGMENT_LENGTHS = WAVE_SEGMENTS.map((seg) => cubicLength(seg));
const TOTAL_LENGTH = SEGMENT_LENGTHS.reduce((sum, len) => sum + len, 0);
const PEAK_OFFSET_PERCENT = [0, 2, 4, 6].map((segIndex) => {
  const cumulative = SEGMENT_LENGTHS.slice(0, segIndex + 1).reduce((sum, len) => sum + len, 0);
  return (cumulative / TOTAL_LENGTH) * 100;
});

// Point de convergence des 4 rayons ("hub"), sous le fil conducteur —
// centre bas du calque Figma "second animation" (left 299.43 + width
// 808.7/2, top 228.78 + height 477.5, ramené au repère local du group53).
const HUB = { x: 532.28, y: 544.78 };

// Les 4 étapes : Créer → Personnaliser → Publier → Commencer. x/y = centres
// des badges (voir STEP_X ci-dessus). Chaque badge a son propre rayon vers
// HUB + son propre @keyframes (globals.css, how-it-works-ray-N /
// how-it-works-badge-N) car le timing de révélation diffère à chaque fois.
const STEPS = STEP_LABELS.map((label, i) => ({
  id: i + 1,
  label,
  x: STEP_X[i],
  y: 17,
}));

export default function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="bg-brand-bg px-6 py-16 text-brand-white md:px-16"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* "La solution LM" + titre/sous-titre — en haut à gauche, comme sur
            la capture de référence ("Tout commence par une idée" / "Donner-lui
            un espace pour grandir."). Header commun à plusieurs sections, voir
            SectionHeader.tsx. */}
        <SectionHeader
          title="Tout commence par une idée"
          subtitle="Donner-lui un espace pour grandir."
        />

        {/* Fil conducteur + étapes + rayons vers le hub — centré, pas
            plein largeur (sinon trop étiré sur grand écran). */}
        <div
          className="relative mx-auto mt-10 w-full max-w-[820px]"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Dégradé violet → rose repris de la vidéo de référence, pour
                le fil et les rayons "structure" (au lieu du blanc uni). */}
            <defs>
              <linearGradient id="how-it-works-wave-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={NEON_BLUE_DEEP} />
                <stop offset="100%" stopColor={NEON_BLUE} />
              </linearGradient>

              {/* Dégradé du rayon (coordonnées réelles de la ligne, pas
                  objectBoundingBox) : part du hub (opaque, rose) et s'efface
                  progressivement en remontant vers la courbe — invisible
                  (opacity 0) juste avant de l'atteindre, pour ne pas
                  toucher/recouper le fil. Rayon 100% caché (stroke-dashoffset
                  + opacity, .how-it-works-ray-N) jusqu'à ce que le point ait
                  fini de traverser la courbe (78%), puis sort seul, un par
                  un (79/80/81/82%) — pas de trait "fantôme" visible avant. */}
              {STEPS.map((step) => (
                <linearGradient
                  key={step.id}
                  id={`how-it-works-ray-flash-gradient-${step.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={step.x}
                  y1={PEAK_Y}
                  x2={HUB.x}
                  y2={HUB.y}
                >
                  <stop offset="0%" stopColor="var(--color-brand-purple)" stopOpacity={0} />
                  <stop offset="18%" stopColor="var(--color-brand-purple)" stopOpacity={1} />
                  <stop offset="65%" stopColor="var(--color-brand-pink)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--color-brand-pink)" stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>

            {/* Rayons : fil tendu depuis la crête de la courbe (PEAK_Y, sous
                le badge — pas depuis le badge lui-même) jusqu'au hub, en
                dégradé violet → rose (voir <defs> ci-dessus), qui se
                "dessine" (stroke-dashoffset, .how-it-works-ray-N) une fois
                le point arrivé au bout de la courbe — pas au passage du
                badge correspondant. */}
            {STEPS.map((step) => (
              <g key={step.id}>
                <line
                  className={`how-it-works-ray-${step.id}`}
                  x1={step.x}
                  y1={PEAK_Y}
                  x2={HUB.x}
                  y2={HUB.y}
                  stroke={`url(#how-it-works-ray-flash-gradient-${step.id})`}
                  strokeWidth={1}
                  strokeLinecap="round"
                  pathLength={100}
                />
              </g>
            ))}

            {/* Fil conducteur : ligne sinueuse fixe + copie rose qui se
                "dessine" progressivement, traînée du point. */}
            <path
              d={WAVE_PATH_D}
              fill="none"
              stroke="url(#how-it-works-wave-gradient)"
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
            <path
              className="how-it-works-trail"
              d={WAVE_PATH_D}
              fill="none"
              stroke="var(--color-brand-pink)"
              strokeWidth={1.5}
              strokeLinecap="round"
              pathLength={100}
            />

            {/* Point rose qui avance sur le fil conducteur (offset-path).
                DOIT rester un élément SVG (pas un <span> HTML posé par-dessus) :
                offset-path en coordonnées brutes du path n'est mis à l'échelle
                que dans l'espace utilisateur SVG (celui du viewBox). Un <span>
                HTML l'interprète en px bruts du viewport, donc dérive hors de
                la courbe dès que le conteneur n'est plus exactement à
                VIEW_W×VIEW_H (ex : à 820px de large, x=1097 du path finissait
                projeté à 1097px réels au lieu de ~820px → point loin à droite
                du hub, plus du tout "collé" au fil). */}
            <g
              className="how-it-works-dot"
              style={
                {
                  filter: "drop-shadow(0 0 8px rgba(236, 12, 140, 0.8))",
                  offsetPath: `path('${WAVE_PATH_D}')`,
                  "--dot-peak-0": `${PEAK_OFFSET_PERCENT[0].toFixed(2)}%`,
                  "--dot-peak-1": `${PEAK_OFFSET_PERCENT[1].toFixed(2)}%`,
                  "--dot-peak-2": `${PEAK_OFFSET_PERCENT[2].toFixed(2)}%`,
                  "--dot-peak-3": `${PEAK_OFFSET_PERCENT[3].toFixed(2)}%`,
                } as unknown as CSSProperties
              }
              aria-hidden="true"
            >
              <circle r={12} fill="none" stroke="var(--color-brand-pink)" strokeWidth={2} />
              <circle r={7} fill="var(--color-brand-pink)" />
            </g>
          </svg>

          {/* Hub : point de convergence des rayons, halo doux et diffus
              (discret, pas énorme) plutôt que le pulse marqué du Hero. */}
          <span
            className="how-it-works-hub-glow absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-pink"
            style={{
              left: `${(HUB.x / VIEW_W) * 100}%`,
              top: `${(HUB.y / VIEW_H) * 100}%`,
            }}
            aria-hidden="true"
          />

          {/* Les 4 badges, positionnés en % à partir du viewBox.
              PADDING/CHAR_WIDTH (donc STEP_X, l'espacement des badges le
              long du fil) restent calibrés sur la taille ≥sm (px-[22px],
              text-xs) — c'est la seule qui compte pour le calcul, puisque
              GAPS a été choisi pour cette taille-là. En <sm, le conteneur
              (max-w-[820px] w-full) est bien plus étroit que 820px alors
              que les badges gardaient une taille fixe en px : à largeur de
              conteneur identique en %, ils devenaient plus larges que
              l'espace qui leur était réservé et se chevauchaient. D'où une
              taille mobile délibérément plus compacte (px-[10px], 10px) —
              qui ne colle plus exactement au calcul JS, mais laisse assez
              de marge pour ne plus se toucher sur un écran de téléphone. */}
          {STEPS.map((step) => (
            <span
              key={step.id}
              // Pas de -translate-x-1/2/-translate-y-1/2 ici : Tailwind v4 les
              // pose sur la propriété CSS `translate` (indépendante de
              // `transform`), qui se cumule avec le `transform: translate(...)`
              // du @keyframes how-it-works-badge-N (globals.css) — le badge se
              // retrouvait décalé d'une pleine largeur/hauteur (double
              // centrage) au lieu d'une demi. Le centrage -50%/-50% est déjà
              // fait par le keyframe, seule source de vérité ici.
              className={`how-it-works-badge-${step.id} absolute whitespace-nowrap rounded-[13px] border border-brand-pink/25 bg-white/[0.03] px-[10px] py-[6px] text-[10px] text-brand-white sm:px-[22px] sm:py-[10px] sm:text-xs`}
              style={{
                left: `${(step.x / VIEW_W) * 100}%`,
                top: `${(step.y / VIEW_H) * 100}%`,
              }}
            >
              {step.label}
            </span>
          ))}
        </div>

        {/* Climax : message + CTA, comme à la fin de la vidéo de référence. */}
        <div className="how-it-works-cta mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-xl font-bold sm:text-2xl">
            Débuter gratuitement{" "}
            <span className="font-medium text-brand-pink">
              sans affiliation
            </span>
          </p>
          <span className="inline-block rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
            <button
              type="button"
              className="flex items-center gap-2 rounded-[11px] bg-[#0a0e1c] px-[18px] py-3 text-sm font-semibold transition hover:opacity-90"
            >
              Créer ma boutique gratuitement
              <span aria-hidden>»</span>
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
