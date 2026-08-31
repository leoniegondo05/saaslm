import SectionHeader from "./SectionHeader";

/*
  Les deux sens de transfert présentés dans la maquette Figma : l'argent
  peut circuler de l'étranger vers la Côte d'Ivoire, et inversement. Chaque
  sens a sa propre paire d'icônes (banque à l'étranger / bâtiment agréé en
  Côte d'Ivoire) pour bien montrer que ce n'est pas juste un aller simple.
*/
const ROUTES = [
  {
    from: "Autre pays",
    fromIcon: "bank" as const,
    to: "Côte d’Ivoire",
    toIcon: "building" as const,
  },
  {
    from: "Côte d’Ivoire",
    fromIcon: "building" as const,
    to: "Autre pays",
    toIcon: "bank" as const,
  },
];

// Pastille d'icône : rose (institution à l'étranger, icône banque) ou
// violette (entreprise agréée en Côte d'Ivoire, icône bâtiment), reprises
// telles quelles depuis la maquette Figma.
function IconBox({ icon }: { icon: "bank" | "building" }) {
  const isBank = icon === "bank";
  return (
    <div
      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
        isBank
          ? "bg-[radial-gradient(circle_at_35%_30%,#ff3fb0,#ec0c8c)] shadow-[0_0_20px_-4px_rgba(236,12,140,0.8)]"
          : "bg-[radial-gradient(circle_at_35%_30%,#5b34c9,#241160)] ring-1 ring-inset ring-[#946eff]/40"
      }`}
    >
      {isBank ? (
        <svg viewBox="0 0 26 22" className="h-5 w-6" fill="none">
          <path
            d="M0 6 13 0 26 6"
            stroke="#faf7fc"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0 6h26M3 9v10M9.5 9v10M16.5 9v10M23 9v10M-1 22h28"
            stroke="#faf7fc"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 22 22" className="h-5 w-5" fill="none">
          <rect x="0.75" y="0.75" width="20.5" height="20.5" rx="3" stroke="#faf7fc" strokeWidth="1.5" />
          <path
            d="M6 6.5h2M14 6.5h2M6 11h2M14 11h2M6 15.5h2M14 15.5h2"
            stroke="#faf7fc"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

// Petit globe (méridien + équateur), sous chaque pastille d'icône dans la
// maquette Figma — symbolise le côté "international" du transfert.
function GlobeIcon() {
  return (
    <svg viewBox="0 0 28 28" className="mx-auto mt-3 h-6 w-6" fill="none">
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.3" />
      <ellipse cx="14" cy="14" rx="6" ry="13" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
      <path d="M1 14h26M2.5 7.5h23M2.5 20.5h23" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" />
    </svg>
  );
}

// La courbe verte "Cash" qui relie les deux pastilles : une bosse molle
// (mirrored selon le sens de la route), avec une icône billet à chaque
// extrémité, comme sur la maquette Figma.
function CashFlow({ index }: { index: number }) {
  const mirrored = index === 1;
  const dip = mirrored ? 6 : 34;
  const rise = mirrored ? 34 : 6;
  const pathId = `cashPath-${index}`;
  const gradientId = `cashFade-${index}`;
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center px-2">
      <svg viewBox="0 0 200 40" className="w-full" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#35d68a" stopOpacity="0.15" />
            <stop offset="15%" stopColor="#35d68a" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#35d68a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#35d68a" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          id={pathId}
          d={`M0 ${dip} C 60 ${dip}, 70 ${rise}, 100 ${rise} S 140 ${dip}, 200 ${dip}`}
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          fill="none"
        />
        {/* Point lumineux qui parcourt la courbe en boucle — masqué via
            .flow-dot (globals.css) pour prefers-reduced-motion. */}
        <circle
          className="flow-dot"
          r="3"
          fill="#35d68a"
          style={{ filter: "drop-shadow(0 0 4px rgba(53,214,138,0.85))" }}
        >
          <animateMotion
            dur="4.5s"
            repeatCount="indefinite"
            begin={mirrored ? "2.1s" : "0s"}
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      </svg>
      <span className="mt-1 text-sm font-semibold text-brand-white/50">Cash</span>
    </div>
  );
}

export default function Features() {
  return (
    <section id="flux-financiers" className="px-6 py-24 md:px-16">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader title="Vos flux financiers se simplifient" />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_320px] lg:items-center">
          {/* Les deux routes restent toujours empilées (jamais côte à côte),
              comme sur la maquette Figma : la 2e est le miroir de la 1re.
              Pas de carte/bordure autour de chaque route — les deux flottent
              directement sur le fond de la section, comme sur la maquette. */}
          <div className="flex flex-col gap-16 sm:gap-20">
            {ROUTES.map((route, index) => (
              <div
                key={`${route.from}-${route.to}`}
                className="flex items-center justify-between gap-2"
              >
                <div className="text-center text-brand-white/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-white/50">
                    {route.from}
                  </p>
                  <IconBox icon={route.fromIcon} />
                  <GlobeIcon />
                </div>

                <CashFlow index={index} />

                <div className="text-center text-brand-white/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-white/50">
                    {route.to}
                  </p>
                  <IconBox icon={route.toIcon} />
                  <GlobeIcon />
                </div>
              </div>
            ))}
          </div>

          {/* Aperçu de l'application mobile : châssis iPhone (encoche,
              boutons latéraux, coques noires) autour de l'écran de
              confirmation de commande, comme sur la maquette Figma. */}
          <div className="relative mx-auto w-60 rounded-[3rem] bg-[linear-gradient(160deg,#3a3a3f_0%,#0a0a0c_55%,#000_100%)] p-[3px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
            {/* Boutons latéraux (volume + power), comme sur un iPhone */}
            <span className="absolute -left-[3px] top-24 h-6 w-[3px] rounded-l-sm bg-[#1c1c1f]" />
            <span className="absolute -left-[3px] top-32 h-10 w-[3px] rounded-l-sm bg-[#1c1c1f]" />
            <span className="absolute -left-[3px] top-44 h-10 w-[3px] rounded-l-sm bg-[#1c1c1f]" />
            <span className="absolute -right-[3px] top-28 h-14 w-[3px] rounded-r-sm bg-[#1c1c1f]" />

            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] border border-black bg-[linear-gradient(180deg,#0b0e1c_0%,#000717_60%,#000308_100%)]">
              {/* Encoche (dynamic island) */}
              <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(236,12,140,0.28),transparent)]" />

              <div className="absolute inset-x-0 top-[30%] flex flex-col items-center px-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-white/70">
                  <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                    <path
                      d="M4 10.5 8 14.5 16 5.5"
                      stroke="#faf7fc"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="mt-4 text-sm font-bold leading-snug text-brand-white">
                  Votre commande
                  <br />a bien été effectuée
                </p>
                <p className="mt-2 text-[11px] leading-snug text-brand-white/40">
                  Suivez-la depuis votre
                  <br />
                  espace commandes
                </p>
              </div>

              <div className="absolute inset-x-4 bottom-8 flex items-center justify-between gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
                <span className="truncate text-[10px] text-brand-white/50">
                  livraison-boutique#4821.com
                </span>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-brand-pink" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>

              <svg
                viewBox="0 0 16 16"
                className="absolute bottom-6 right-3 h-4 w-4 rotate-[20deg] text-brand-pink drop-shadow-[0_0_6px_rgba(236,12,140,0.8)]"
                fill="currentColor"
              >
                <path d="M0 0 14 6 4 8 0 16Z" />
              </svg>

              {/* Barre d'accueil (home indicator) iPhone */}
              <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
