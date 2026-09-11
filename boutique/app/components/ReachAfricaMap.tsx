/*
  Carte de l'Afrique : Abidjan comme point de départ ("hub") des connexions
  vers de nombreuses villes du continent. Reprend à l'identique la
  silhouette, la liste de villes et le calcul des arcs de la maquette de
  référence fournie par l'utilisateur (accueil-lm-anime.html, section
  "Un continent, des millions d'opportunités") — contrairement à une
  version précédente qui utilisait un fond de carte géographiquement exact
  (SVG du domaine public), remplacée ici pour rester identique à la
  référence.

  Le calcul des arcs (Q d'une quadratique, courbée perpendiculairement au
  segment Abidjan→ville) est fait une seule fois au chargement du module,
  comme HowItWorksWave.tsx — pas de useEffect qui injecte du innerHTML
  comme dans la référence (c'était nécessaire en JS/DOM vanilla, pas en
  React où le rendu déclaratif suffit).

  Couleurs : rose/violet = nos tokens de marque (--color-brand-pink/-purple/
  -pink-light, mêmes valeurs que --fuchsia/--violet/--dragee dans la
  référence) ; le remplissage du continent (#111726) et le mauve des arcs
  (rgba(196,150,240,.6)) sont des couleurs d'illustration ponctuelles, sans
  équivalent dans nos tokens de marque, gardées telles quelles.
*/
type City = {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  side?: "left";
};

const ABIDJAN = { x: 260, y: 431 };

const CITIES: City[] = [
  { name: "ALGER", x: 349, y: 62, fontSize: 11 },
  { name: "BISSAU", x: 113, y: 354, fontSize: 11, side: "left" },
  { name: "BAMAKO", x: 209, y: 345, fontSize: 11 },
  { name: "ACCRA", x: 308, y: 427, fontSize: 11 },
  { name: "Lagos", x: 354, y: 417, fontSize: 11 },
  { name: "KHARTOUM", x: 717, y: 317, fontSize: 11 },
  { name: "YAOUNDE", x: 457, y: 447, fontSize: 11 },
  { name: "Libreville", x: 430, y: 488, fontSize: 10 },
  { name: "KAMPALA", x: 725, y: 489, fontSize: 8 },
  { name: "NAIROBI", x: 778, y: 508, fontSize: 8 },
  { name: "KINSHASA", x: 505, y: 544, fontSize: 11 },
  { name: "LUANDA", x: 479, y: 596, fontSize: 11 },
  { name: "LUSAKA", x: 670, y: 673, fontSize: 11 },
  { name: "WINDHOEK", x: 528, y: 757, fontSize: 8 },
];

// Points secondaires, sans nom — juste pour densifier la carte comme sur
// la référence.
const MUTED_DOTS: [number, number][] = [
  [513, 71], [439, 151], [479, 206], [680, 234], [766, 226], [898, 151],
  [919, 248], [994, 340], [901, 355], [957, 499], [981, 587], [892, 641],
  [944, 672], [843, 671], [845, 763], [1081, 642], [684, 51], [432, 261],
  [573, 327], [661, 316], [795, 346], [715, 366],
];

// Arc quadratique Abidjan→ville, courbé perpendiculairement au segment —
// même formule que la référence : le milieu du segment est décalé de
// 0.17× sa propre longueur, dans la direction perpendiculaire (-dy, dx).
// (Dans le JS d'origine ce facteur était normalisé par la longueur du
// segment puis multiplié par cette même longueur : les deux s'annulent,
// il ne reste donc que `-dy*0.17`/`dx*0.17` — pas la peine de recalculer
// une racine carrée pour un résultat identique.)
function arcPathTo(city: City) {
  const mx = (ABIDJAN.x + city.x) / 2;
  const my = (ABIDJAN.y + city.y) / 2;
  const dx = city.x - ABIDJAN.x;
  const dy = city.y - ABIDJAN.y;
  const cx = mx - dy * 0.17;
  const cy = my + dx * 0.17;
  return `M${ABIDJAN.x},${ABIDJAN.y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${city.x},${city.y}`;
}

export default function ReachAfricaMap() {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      <svg viewBox="0 0 1000 950" aria-hidden="true">
        {/* Silhouette simplifiée du continent + une petite île (Madagascar). */}
        <path
          d="M237,74 L440,62 L565,117 L691,128 L724,143 L784,263 L859,357
             L963,354 L887,469 L816,540 L811,573 L829,663 L725,794 L705,841
             L565,898 L545,888 L495,760 L466,670 L479,596 L467,563 L462,549
             L434,446 L381,443 L326,422 L260,431 L174,420 L143,394 L90,321
             L108,281 L133,212 L189,137 Z"
          fill="#111726"
          stroke="rgba(250,247,252,.13)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <path
          d="M934,628 C948,650 952,700 944,742 C938,776 922,792 910,784
             C898,776 898,742 904,706 C910,668 920,632 934,628 Z"
          fill="#111726"
          stroke="rgba(250,247,252,.13)"
          strokeWidth={1.2}
        />

        {/* Arcs + villes : le trait se dessine (stroke-dashoffset) et les
            points/étiquettes apparaissent en fondu quand la section entre
            dans le viewport — voir .affiliation-trace/.affiliation-icon
            dans globals.css (déclenchées par ScrollReveal, comme le
            diagramme de la section "S'affilier"). */}
        <g fill="none" strokeWidth={1.2}>
          {CITIES.map((city) => (
            <path
              key={city.name}
              className="affiliation-trace"
              d={arcPathTo(city)}
              stroke="rgba(196,150,240,.6)"
            />
          ))}
        </g>

        <g className="affiliation-icon">
          {CITIES.map((city) => {
            const isLeft = city.side === "left";
            return (
              <g key={city.name}>
                <circle cx={city.x} cy={city.y} r={5} fill="var(--color-brand-pink)" />
                <text
                  x={isLeft ? city.x - 10 : city.x}
                  y={isLeft ? city.y + 4 : city.y + city.fontSize + 6}
                  fill="var(--color-brand-white)"
                  fontSize={city.fontSize}
                  fontWeight={600}
                  textAnchor={isLeft ? "end" : "middle"}
                  letterSpacing={0.5}
                >
                  {city.name}
                </text>
              </g>
            );
          })}
          {MUTED_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4} fill="var(--color-brand-pink)" fillOpacity={0.85} />
          ))}
        </g>

        {/* Abidjan : point de départ de toutes les connexions. */}
        <circle cx={ABIDJAN.x} cy={ABIDJAN.y} r={11} fill="var(--color-brand-pink)" />
        <circle cx={ABIDJAN.x} cy={ABIDJAN.y} r={22} fill="var(--color-brand-pink)" fillOpacity={0.22} />
        <text
          x={ABIDJAN.x}
          y={ABIDJAN.y + 39}
          fill="var(--color-brand-white)"
          fontSize={21}
          fontWeight={600}
          textAnchor="middle"
          letterSpacing={1}
        >
          ABIDJAN
        </text>
      </svg>
    </div>
  );
}
