import type { CSSProperties } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

/*
  Les deux sens de transfert présentés dans la maquette Figma : l'argent
  peut circuler de l'étranger vers la Côte d'Ivoire, et inversement. Chaque
  sens a sa propre paire d'icônes (banque à l'étranger / bâtiment agréé en
  Côte d'Ivoire) pour bien montrer que ce n'est pas juste un aller simple.

  Dimensions reprises telles quelles du fichier Figma (frame 1440×1024,
  padding 18/122/188/122, gap 91 entre le header et le bloc de contenu ;
  bloc de contenu 1093×579 centré, groupe d'icônes 597×471 collé à gauche,
  téléphone 192×383.3 collé à droite du bloc) — traduites en classes
  Tailwind responsives (xl: = valeurs Figma exactes, en dessous : repli
  mobile/tablette).
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

// Pastille d'icône : rose (institution à l'étranger, icône boutique) ou
// violette (entreprise agréée en Côte d'Ivoire, icône bâtiment), reprises
// telles quelles depuis la maquette Figma.
function IconBox({ icon }: { icon: "bank" | "building" }) {
  const isBank = icon === "bank";
  // Carte quasi noire + halo diffus de la couleur d'accent (rose pour la
  // boutique à l'étranger, violet pour le bâtiment agréé), comme sur la
  // maquette Figma — au lieu d'un fond plein dégradé.
  const accent = isBank ? "#ec0c8c" : "#946eff";
  return (
    <div
      className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12141c] ring-1 ring-inset ring-white/10"
      style={{ boxShadow: `0 0 22px -2px ${accent}66` }}
    >
      {isBank ? (
        // Icône boutique façon Lucide "store" : auvent en dents-de-scie
        // arrondies + façade + porte, traits épais.
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#ec0c8c]" fill="none">
          <path
            d="M3 9V7l2-4h14l2 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 9a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 20v-5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 22 22" className="h-5 w-5 text-[#946eff]" fill="none">
          <rect x="0.75" y="0.75" width="20.5" height="20.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M6 6.5h2M14 6.5h2M6 11h2M14 11h2M6 15.5h2M14 15.5h2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

// Petit globe (méridien + équateur), sous la pastille "bâtiment" (Côte
// d'Ivoire) dans la maquette Figma — symbolise le côté "international" du
// transfert.
function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9.75" />
      <ellipse cx="12" cy="12" rx="5.3" ry="9.75" />
      <path d="M12 2.25v19.5" />
      <path d="M2.25 12h19.5" />
      <path d="M2.83 7.44h18.34" />
      <path d="M2.83 16.57h18.34" />
    </svg>
  );
}

// Petite icône billet/argent — reprend le pictogramme "cash" de la maquette
// Figma (rectangle + fentes), utilisée pour les icônes flottantes autour
// des courbes ("icône d'argent flottant autour").
function MoneyIcon({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`money-icon-float absolute flex h-6 w-8 items-center justify-center rounded-md border border-brand-white/25 bg-brand-bg/60 backdrop-blur-sm ${className}`}
      style={style}
    >
      <svg viewBox="0 0 24 16" className="h-3 w-5" fill="none">
        <rect x="0.75" y="0.75" width="22.5" height="14.5" rx="2" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
      </svg>
    </span>
  );
}

// Une "route" complète : label + pastille + (avatar pour la banque, globe
// pour le bâtiment agréé), comme sur la maquette Figma.
function RouteSide({ label, icon }: { label: string; icon: "bank" | "building" }) {
  return (
    <div className="text-center text-brand-white/60">
      <p className="mb-6 text-xs font-bold uppercase tracking-wide text-brand-white/50">
        {label}
      </p>
      <IconBox icon={icon} />
      <GlobeIcon className="mx-auto mt-5 text-brand-white/60" />
    </div>
  );
}

// La courbe verte "Cash" qui relie les deux pastilles : une bosse molle
// (mirrored selon le sens de la route), avec un point lumineux qui la
// parcourt en boucle, et 3 icônes "argent" flottantes disposées autour
// (comme sur la maquette Figma).
function CashFlow({ index }: { index: number }) {
  const mirrored = index === 1;
  const dip = mirrored ? 6 : 34;
  const rise = mirrored ? 34 : 6;
  const pathId = `cashPath-${index}`;
  const gradientId = `cashFade-${index}`;
  const maskGradientId = `cashTrailFade-${index}`;
  const maskId = `cashTrailMask-${index}`;
  // Cycle complet aller-retour du point : dessin du chemin à l'aller,
  // effacement à l'aller-retour, décalé pour la 2e route (mirrored).
  const dur = 6;
  const begin = mirrored ? `${dur / 2}s` : "0s";
  // Largeur (en unités du viewBox 200x40) de la zone de fondu à la limite
  // dessin/effacement — évite la coupure nette, comme demandé.
  const fadeWidth = 40;
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center px-2">
      <MoneyIcon
        className="left-[6%] top-0 text-brand-pink"
        style={{ animationDelay: "0s" }}
      />
      <MoneyIcon
        className="left-1/2 top-[70%] -translate-x-1/2 text-brand-purple"
        style={{ animationDelay: "1.3s" }}
      />
      <MoneyIcon
        className="right-[6%] top-[10%] text-brand-pink"
        style={{ animationDelay: "2.6s" }}
      />
      <svg viewBox="0 0 200 40" className="w-full" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#35d68a" stopOpacity="0.15" />
            <stop offset="15%" stopColor="#35d68a" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#35d68a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#35d68a" stopOpacity="0.15" />
          </linearGradient>
          {/* Bord mou (pas de coupure nette) sur la limite dessin/effacement :
              opaque avant la position du point, transparent après, avec une
              zone de transition de fadeWidth. x1/x2 suivent le point (mêmes
              dur/begin/keyTimes que animateMotion) pour rester synchronisés
              dans les deux sens. */}
          <linearGradient
            id={maskGradientId}
            x1="0"
            y1="0"
            x2={fadeWidth}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
            <animate
              attributeName="x1"
              values="0;200;0"
              keyTimes="0;0.5;1"
              calcMode="linear"
              dur={`${dur}s`}
              begin={begin}
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values={`${fadeWidth};${200 + fadeWidth};${fadeWidth}`}
              keyTimes="0;0.5;1"
              calcMode="linear"
              dur={`${dur}s`}
              begin={begin}
              repeatCount="indefinite"
            />
          </linearGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="-20" y="-20" width="240" height="80" fill={`url(#${maskGradientId})`} />
          </mask>
        </defs>
        <path
          id={pathId}
          className="flow-path"
          d={`M0 ${dip} C 60 ${dip}, 70 ${rise}, 100 ${rise} S 140 ${dip}, 200 ${dip}`}
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          fill="none"
          mask={`url(#${maskId})`}
        />
        {/* Point lumineux qui fait l'aller-retour sur la courbe en boucle —
            masqué via .flow-dot (globals.css) pour prefers-reduced-motion. */}
        <circle
          className="flow-dot"
          r="3"
          fill="#35d68a"
          style={{ filter: "drop-shadow(0 0 4px rgba(53,214,138,0.85))" }}
        >
          <animateMotion
            dur={`${dur}s`}
            begin={begin}
            repeatCount="indefinite"
            keyPoints="0;1;0"
            keyTimes="0;0.5;1"
            calcMode="linear"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      </svg>
      <span className="relative z-10 mt-1 text-sm font-semibold text-brand-white/50">Cash</span>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="flux-financiers"
      className="sticky top-[112px] flex min-h-[calc(100vh-6rem)] items-center bg-brand-bg px-6 py-16 md:px-16 xl:px-[122px] xl:pb-[188px] xl:pt-[18px]"
    >
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-16 xl:gap-[91px]">
        <ScrollReveal>
          <SectionHeader title="Vos flux financiers se simplifient" />
        </ScrollReveal>

        <ScrollReveal
          delay={100}
          className="relative mx-auto flex w-full max-w-[1320px] flex-col items-center gap-16 sm:gap-20 xl:flex-row xl:items-start xl:justify-between xl:gap-0"
        >
          {/* Les deux routes restent toujours empilées (jamais côte à côte),
              comme sur la maquette Figma : la 2e est le miroir de la 1re.
              Pas de carte/bordure autour de chaque route — les deux flottent
              directement sur le fond de la section, comme sur la maquette. */}
          <div className="flex w-full flex-col gap-16 sm:gap-20 xl:w-[597px] xl:gap-36">
            {ROUTES.map((route, index) => (
              <div
                key={`${route.from}-${route.to}`}
                className="flex items-center justify-between gap-2"
              >
                <RouteSide label={route.from} icon={route.fromIcon} />
                <CashFlow index={index} />
                <RouteSide label={route.to} icon={route.toIcon} />
              </div>
            ))}
          </div>

          {/* Aperçu de l'application mobile : châssis iPhone (encoche,
              boutons latéraux, coques noires) autour de l'écran de
              confirmation de commande, comme sur la maquette Figma. Décalé
              vers le bas (xl:mt-32) plutôt qu'aligné avec les routes : sur
              la maquette, le téléphone n'est pas au même niveau qu'elles,
              il "dépasse" plus bas — mesuré sur la maquette (~37 % de sa
              propre hauteur de décalage vers le bas par rapport au haut
              du bloc des deux routes). */}
          <div className="relative mx-auto w-48 shrink-0 rounded-[3rem] bg-[linear-gradient(160deg,#3a3a3f_0%,#0a0a0c_55%,#000_100%)] p-[3px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] xl:w-[192px] xl:mt-36">
            {/* Boutons latéraux (volume + power), comme sur un iPhone */}
            <span className="absolute -left-[3px] top-24 h-6 w-[3px] rounded-l-sm bg-[#1c1c1f]" />
            <span className="absolute -left-[3px] top-32 h-10 w-[3px] rounded-l-sm bg-[#1c1c1f]" />
            <span className="absolute -left-[3px] top-44 h-10 w-[3px] rounded-l-sm bg-[#1c1c1f]" />
            <span className="absolute -right-[3px] top-28 h-14 w-[3px] rounded-r-sm bg-[#1c1c1f]" />

            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] border border-black bg-[linear-gradient(180deg,#0b0e1c_0%,#000717_60%,#000308_100%)]">
              {/* Encoche (dynamic island) */}
              <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(236,12,140,0.28),transparent)]" />

              {/* Étoiles qui scintillent autour du check, comme sur la
                  maquette Figma. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 10 10"
                className="phone-sparkle absolute left-[24%] top-[22%] h-2 w-2 text-brand-white/70"
                style={{ animationDelay: "0s" }}
                fill="currentColor"
              >
                <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" />
              </svg>
              <svg
                aria-hidden="true"
                viewBox="0 0 10 10"
                className="phone-sparkle absolute right-[20%] top-[28%] h-1.5 w-1.5 text-brand-white/50"
                style={{ animationDelay: "1.1s" }}
                fill="currentColor"
              >
                <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" />
              </svg>

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
                  Cliquez sur le lien pour
                  <br />
                  suivre votre commande
                </p>
              </div>

              <div className="absolute inset-x-4 bottom-8 flex items-center justify-between gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
                <span className="truncate text-[10px] text-brand-white/50">
                  track.liivremoi.com/CMD-2024-VQP
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
        </ScrollReveal>
      </div>
    </section>
  );
}
