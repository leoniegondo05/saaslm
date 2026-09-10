/*
  Carte de l'Afrique : Abidjan comme point de départ ("hub") des connexions
  vers de nombreuses villes du continent. Remplace l'ancienne version où le
  graphiste avait tout exporté depuis Figma en une seule image PNG (pastille
  "La solution LM", titre, carte, noms de villes compris) — pas pratique :
  aucun texte réel (illisible pour un lecteur d'écran, imprécis au zoom) et
  impossible à faire évoluer sans re-exporter depuis Figma.

  Ici, la carte elle-même reste un tracé vectoriel (fond de carte du domaine
  public — voir /public/images/africa-map.svg, silhouette des pays, pas de
  contenu éditorial dedans), chargée comme une image de fond. Par-dessus,
  un SVG "overlay" (même repère de coordonnées que le fond, superposition
  au pixel près par positionnement en %, comme HowItWorksWave.tsx) dessine
  les rayons + les points, et les noms de ville sont de vrais <span> HTML —
  donc du vrai texte, accessible et net à n'importe quelle résolution.

  Coordonnées des villes : pas une projection géographique — un simple
  repérage visuel (mesure des pixels de l'ancienne image de référence,
  recalé sur les vrais contours de chaque pays dans ce fond de carte) pour
  rester fidèle à la maquette d'origine.
*/
const VIEW_W = 1123.0895;
const VIEW_H = 1105.1122;

// Abidjan : point de départ de toutes les connexions.
const HUB = { x: 275, y: 510 };

type City = { id: string; label: string; x: number; y: number };

const CITIES: City[] = [
  { id: "alger", label: "ALGER", x: 350, y: 100 },
  { id: "bamako", label: "BAMAKO", x: 290, y: 370 },
  { id: "khartoum", label: "KHARTOUM", x: 660, y: 300 },
  { id: "accra", label: "ACCRA", x: 330, y: 505 },
  { id: "lagos", label: "LAGOS", x: 400, y: 510 },
  { id: "yaounde", label: "YAOUNDÉ", x: 510, y: 480 },
  { id: "libreville", label: "LIBREVILLE", x: 465, y: 570 },
  { id: "kinshasa", label: "KINSHASA", x: 525, y: 610 },
  { id: "kampala", label: "KAMPALA", x: 742, y: 565 },
  { id: "nairobi", label: "NAIROBI", x: 815, y: 590 },
  { id: "luanda", label: "LUANDA", x: 505, y: 685 },
  { id: "lusaka", label: "LUSAKA", x: 680, y: 765 },
  { id: "windhoek", label: "WINDHOEK", x: 545, y: 880 },
  { id: "bissau", label: "BISSAU", x: 163, y: 424 },
];

// Liens entre villes (pas seulement vers Abidjan) : chaque ville reliée à
// ses 2 plus proches voisines (distance euclidienne sur les coordonnées
// ci-dessus), pour un vrai réseau interconnecté plutôt qu'une simple
// étoile centrée sur le hub. Un maillage complet (91 paires pour 14
// villes) aurait été illisible — 2 voisines par ville donne un maillage
// visible sans surcharger la carte, tracé en dessous des rayons vers
// Abidjan (plus discret, pas de dégradé).
const CITY_LINKS: [string, string][] = [
  ["accra", "bamako"],
  ["accra", "bissau"],
  ["accra", "lagos"],
  ["alger", "bamako"],
  ["alger", "khartoum"],
  ["bamako", "bissau"],
  ["kampala", "khartoum"],
  ["kampala", "lusaka"],
  ["kampala", "nairobi"],
  ["khartoum", "yaounde"],
  ["kinshasa", "libreville"],
  ["kinshasa", "luanda"],
  ["lagos", "libreville"],
  ["lagos", "yaounde"],
  ["libreville", "luanda"],
  ["libreville", "yaounde"],
  ["luanda", "lusaka"],
  ["luanda", "windhoek"],
  ["lusaka", "nairobi"],
  ["lusaka", "windhoek"],
];

// Petits points décoratifs (sans nom), pour donner à la carte la même
// densité que la capture de référence — pas de rayon, juste un repère
// visuel discret.
const DECORATIVE_DOTS: [number, number][] = [
  [702.4, 837.0],
  [965.5, 837.0],
  [72.4, 234.1],
  [127.8, 301.8],
  [792.0, 662.8],
  [826.1, 769.4],
  [637.0, 986.2],
  [413.7, 112.5],
  [406.6, 336.9],
  [176.2, 136.3],
  [844.6, 467.3],
  [715.2, 484.8],
  [740.8, 354.4],
  [710.9, 234.1],
  [776.4, 873.4],
  [527.5, 326.9],
  [634.1, 873.4],
];

const CITY_BY_ID = new Map(CITIES.map((city) => [city.id, city]));

export default function ReachAfricaMap() {
  return (
    <div
      className="relative mx-auto w-full max-w-[580px]"
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
    >
      {/* Fond de carte (silhouette des pays) — pur habillage visuel, le
          contenu qui compte (villes, titre) est du vrai texte à côté. */}
      <img
        src="/images/africa-map.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {CITIES.map((city) => (
            <linearGradient
              key={city.id}
              id={`reach-ray-gradient-${city.id}`}
              gradientUnits="userSpaceOnUse"
              x1={city.x}
              y1={city.y}
              x2={HUB.x}
              y2={HUB.y}
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
              <stop offset="35%" stopColor="var(--color-brand-purple)" stopOpacity={0.7} />
              <stop offset="100%" stopColor="var(--color-brand-pink)" stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>

        {DECORATIVE_DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="var(--color-brand-pink)" fillOpacity={0.5} />
        ))}

        {/* Maillage ville à ville (voir CITY_LINKS) — tracé en dessous des
            rayons vers Abidjan, trait plein discret (pas de dégradé) pour
            que le hub reste le point le plus lumineux de la carte. */}
        {CITY_LINKS.map(([fromId, toId]) => {
          const from = CITY_BY_ID.get(fromId)!;
          const to = CITY_BY_ID.get(toId)!;
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--color-brand-purple)"
              strokeOpacity={0.75}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}

        {CITIES.map((city) => (
          <line
            key={city.id}
            x1={city.x}
            y1={city.y}
            x2={HUB.x}
            y2={HUB.y}
            stroke={`url(#reach-ray-gradient-${city.id})`}
            strokeWidth={1.25}
            strokeLinecap="round"
          />
        ))}

        {CITIES.map((city) => (
          <circle key={city.id} cx={city.x} cy={city.y} r={4.5} fill="var(--color-brand-pink)" />
        ))}

        {/* Abidjan : point de départ, plus gros que les autres villes.
            Le halo lumineux est un <span> HTML séparé juste en dessous
            (reach-hub-glow, voir globals.css) : box-shadow ne s'applique
            pas de façon fiable à une forme SVG, voir HowItWorksWave.tsx
            pour le même choix sur le hub du fil conducteur. */}
        <circle cx={HUB.x} cy={HUB.y} r={9} fill="var(--color-brand-pink)" />
      </svg>

      {/* Halo du hub Abidjan — <span> HTML, pas SVG (voir commentaire
          ci-dessus). */}
      <span
        className="reach-hub-glow absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-pink"
        style={{ left: `${(HUB.x / VIEW_W) * 100}%`, top: `${(HUB.y / VIEW_H) * 100}%` }}
        aria-hidden="true"
      />

      {CITIES.map((city) => (
        <span
          key={city.id}
          className="absolute -translate-x-1/2 translate-y-[10px] whitespace-nowrap text-[9px] font-semibold tracking-wide text-brand-white/80 sm:text-[10px]"
          style={{ left: `${(city.x / VIEW_W) * 100}%`, top: `${(city.y / VIEW_H) * 100}%` }}
        >
          {city.label}
        </span>
      ))}

      <span
        className="absolute -translate-x-1/2 translate-y-[14px] whitespace-nowrap text-xs font-bold text-brand-white sm:text-sm"
        style={{ left: `${(HUB.x / VIEW_W) * 100}%`, top: `${(HUB.y / VIEW_H) * 100}%` }}
      >
        ABIDJAN
      </span>
    </div>
  );
}
