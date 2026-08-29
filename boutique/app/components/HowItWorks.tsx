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
  fond blanc isolé. Fil + rayons "structure" en dégradé violet → rose
  (how-it-works-wave-gradient), repris de la vidéo de référence, et les 4
  badges en pastille à bordure rose translucide (bg quasi transparent) au
  lieu d'une pastille pleine.
*/
import SectionBadge from "./SectionBadge";

const VIEW_W = 1000;
const VIEW_H = 640;

// Le tracé est utilisé à deux endroits qui doivent rester identiques :
// le <path> du SVG (rendu visuel) et le `offset-path` du point rose
// (globals.css, .how-it-works-dot) qui le fait avancer dessus.
//
// Courbe lissée par interpolation Catmull-Rom (convertie en Bézier cubique,
// tangentes continues à chaque point de passage) plutôt que des segments
// C bruts : ça évite tout changement de direction brusque aux sommets/creux
// et donne une vague organique, régulière, au rendu très propre.
//
// Les 4 crêtes ("montagnes") sont alignées sur le x de chaque étape
// (STEPS ci-dessous : 240 / 460 / 685 / 910) — comme sur la maquette de
// référence, chaque mot a bien sa propre bosse juste en dessous — avec une
// vallée entre chaque paire de crêtes.
const WAVE_PATH_D =
  "M0,145 C40,136.7 181.7,89.5 240,95 C298.3,100.5 313.3,178 350,178 C386.7,178 423,95 460,95 C497,95 534.5,178 572,178 C609.5,178 647.5,95 685,95 C722.5,95 759.5,178 797,178 C834.5,178 876.2,102.2 910,95 C943.8,87.8 985,128.3 1000,135";

// Point de convergence des 4 rayons ("hub"), sous le fil conducteur.
const HUB = { x: 600, y: 580 };

// Les 4 étapes de la maquette Figma : Créer → Personnaliser → Publier →
// Commencer. Chaque badge a son propre rayon vers HUB + son propre
// @keyframes (globals.css, how-it-works-ray-N / how-it-works-badge-N) car
// le timing de révélation diffère à chaque fois.
const STEPS = [
  { id: 1, label: "Créer", x: 240, y: 50 },
  { id: 2, label: "Personnaliser", x: 460, y: 50 },
  { id: 3, label: "Publier", x: 685, y: 50 },
  { id: 4, label: "Commencer", x: 910, y: 50 },
];

export default function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="bg-brand-bg px-6 py-16 text-brand-white md:px-16"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* "La solution LM" + son descriptif — en haut à gauche, comme sur
            la capture. Même pastille (bordure claire, fond sombre) que sur
            le reste du site : voir SectionBadge.tsx. */}
        <div className="flex flex-wrap items-start gap-4">
          <SectionBadge />
          <p className="max-w-sm text-sm text-brand-white/60">
            Une boutique choisit une entreprise agréée. Une entreprise
            agréée en accompagne plusieurs.
          </p>
        </div>

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
                <stop offset="0%" stopColor="var(--color-brand-purple)" />
                <stop offset="100%" stopColor="var(--color-brand-pink)" />
              </linearGradient>

              {/* Un dégradé par rayon (coordonnées réelles de la ligne, pas
                  objectBoundingBox) : clair/subtil près du badge en haut,
                  puis de plus en plus foncé/saturé (violet → rose) en
                  descendant vers le hub — dégradé continu, sans palier. */}
              {STEPS.map((step) => (
                <linearGradient
                  key={step.id}
                  id={`how-it-works-ray-gradient-${step.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={step.x}
                  y1={step.y + 30}
                  x2={HUB.x}
                  y2={HUB.y}
                >
                  <stop offset="0%" stopColor="var(--color-brand-white)" stopOpacity={0.35} />
                  <stop offset="55%" stopColor="var(--color-brand-purple)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--color-brand-pink)" stopOpacity={0.95} />
                </linearGradient>
              ))}
            </defs>

            {/* Rayons : fil tendu du dessous du badge jusqu'au hub, en
                dégradé propre au rayon (voir <defs> ci-dessus) + copie rose
                qui se "dessine" (stroke-dashoffset) au moment où le point
                atteint le badge correspondant. */}
            {STEPS.map((step) => (
              <g key={step.id}>
                <line
                  x1={step.x}
                  y1={step.y + 30}
                  x2={HUB.x}
                  y2={HUB.y}
                  stroke={`url(#how-it-works-ray-gradient-${step.id})`}
                  strokeWidth={1}
                  strokeLinecap="round"
                />
                <line
                  className={`how-it-works-ray-${step.id}`}
                  x1={step.x}
                  y1={step.y + 30}
                  x2={HUB.x}
                  y2={HUB.y}
                  stroke="var(--color-brand-pink)"
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
          </svg>

          {/* Point rose qui avance sur le fil conducteur (offset-path). */}
          <span
            className="how-it-works-dot absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-pink shadow-[0_0_16px_4px_rgba(236,12,140,0.7)]"
            style={{
              left: 0,
              top: 0,
              offsetPath: `path('${WAVE_PATH_D}')`,
            }}
            aria-hidden="true"
          />

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

          {/* Les 4 badges, positionnés en % à partir du viewBox. */}
          {STEPS.map((step) => (
            <span
              key={step.id}
              className={`how-it-works-badge-${step.id} absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-pink/25 bg-white/[0.03] px-6 py-2 text-sm text-brand-white`}
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
          <p className="text-sm font-medium text-brand-pink">
            sans affiliation
          </p>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-brand-pink px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Créer ma boutique gratuitement
            <span aria-hidden>»»»</span>
          </button>
        </div>
      </div>
    </section>
  );
}
