"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useDashboardLangue } from "./DashboardLanguageProvider";

/*
  Bannière "ciel" dans la colonne centrale de la grille de
  app/dashboard/page.tsx ("Ma journée") — entre la carte "Aujourd'hui"
  (météo, colonne gauche) et la carte ventes "Hier · aujourd'hui · demain"
  (colonne droite). Remplace DashboardBrain (soleil qui suivait la souris en
  `position: fixed` sur toute la page, en continu) : ici la scène est
  CONTENUE dans son propre cadre et joue une séquence d'entrée une fois au
  montage (l'astre se lève depuis l'horizon, rayons, reflet qui ondule) avant
  de retomber dans une respiration ambiante discrète — inspirée de
  public/images/soleil.png (dégradé jaune→orange, reflet en vaguelettes,
  oiseaux en chevron), redessinée en CSS pour rester nette à toute taille et
  suivre les couleurs de la charte (cf. mémoire
  [[charte-graphique-livre-moi]]).

  Change avec l'heure locale du navigateur (cf. getPhaseForHour ci-dessous) :
    - 5h–7h59  "dawn"  : aube — nuages qui dérivent devant un soleil pâle,
                         rayons discrets qui percent dessous/autour.
    - 8h–17h59 "day"   : plein jour — soleil franc, rayons vifs, oiseaux.
    - 18h–4h59 "night" : nuit — l'astre devient une lune dont la FORME suit
                         le vrai cycle lunaire du jour (croissant, quartier,
                         gibbeuse, pleine lune... cf. buildMoonPath), pas
                         toujours un disque plein, avec cratères sur la
                         partie éclairée ; pas de rayons, juste un halo
                         froid ; étoiles qui scintillent au lieu des
                         oiseaux. Signale "la nuit commence" dès 18h.
  Recalculé au montage puis toutes les 5 min (PHASE_CHECK_MS) pour suivre un
  changement d'heure si le dashboard reste ouvert — pas de tick seconde par
  seconde, inutile pour un changement qui n'arrive qu'à l'heure pile.

  Fond : transparent, pas de carte (pas de card-tint/ombre/bord). Le cadre
  remplit toute sa cellule de grille (absolute inset-0, hauteur = celle des
  colonnes voisines) avec overflow-hidden — halo et rayons sont eux aussi en
  inset-0 avec un dégradé "closest-side" qui s'éteint à 0 pile avant le bord
  le plus proche dans toutes les directions, donc rien ne se coupe net ET
  rien ne déborde dans le document (une version précédente laissait le halo
  déborder du cadre, ce qui gonflait la hauteur scrollable de toute la
  page — évité ici en gardant l'éclat contenu dans son propre fade).

  3D : perspective + transform-style: preserve-3d sur le cadre, chaque couche
  (halo, rayons, astre, reflet, oiseaux/nuages/étoiles) posée à un translateZ
  différent + léger tilt au survol borné au cadre lui-même (pas `window`,
  contrairement à l'ancien DashboardBrain) pour une profondeur crédible sans
  reprendre tout l'écran.

  prefers-reduced-motion: reduce → toutes les boucles/l'entrée sont coupées,
  la scène s'affiche directement dans son état final (phase du moment quand
  même appliquée, seul le mouvement est coupé).
*/

type Phase = "dawn" | "day" | "night";

function getPhaseForHour(hour: number): Phase {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 18) return "day";
  return "night"; // 18h–4h59 : couvre toute la nuit, pas seulement la soirée
}

/*
  Forme réelle de la lune (nuit) : elle n'est pas toujours ronde, elle passe
  par les phases du cycle synodique (nouvelle lune → croissant → quartier →
  gibbeuse → pleine lune → ...) — d'où le "souvent en forme de banane"
  (croissant) demandé. Calculée à partir de la date/heure du navigateur, pas
  du hasard, donc cohérente avec la vraie lune du jour.

  synodicMonth : durée moyenne d'un cycle lunaire complet (nouvelle lune à
  nouvelle lune), ~29,53 jours. knownNewMoonUtc : une nouvelle lune de
  référence connue (6 janv. 2000, 18:14 UTC) — le nombre de cycles écoulés
  depuis cette date, modulo synodicMonth, donne la phase actuelle (0 =
  nouvelle lune, 0.5 = pleine lune).

  buildMoonPath dessine le contour de la partie éclairée avec la technique
  classique "deux arcs" (utilisée par la plupart des générateurs d'icônes de
  phase lunaire) : un cercle plein de rayon 48 découpé en deux demi-arcs
  entre le haut (50,2) et le bas (50,98) du viewBox 0-100 ; le second arc a
  un rayon horizontal `r` qui varie avec cos(phase·2π) et un sens (`sweep`)
  qui bascule selon le signe — validé aux 4 points de repère : phase 0 (r=48,
  même sens que le 1er arc) => les deux arcs se superposent, aire nette
  nulle => nouvelle lune invisible ; phase 0,25 (r=0) => 2e arc dégénère en
  ligne droite => demi-disque => premier quartier ; phase 0,5 (r=48, sens
  opposé) => les deux demi-disques opposés recomposent un disque complet =>
  pleine lune ; entre les deux, la largeur du croissant/de la bosse varie en
  continu avec |r|.
*/
const MOON_SYNODIC_DAYS = 29.530588853;
const MOON_KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

function getMoonPhaseFraction(date: Date): number {
  const diffDays = (date.getTime() - MOON_KNOWN_NEW_MOON_UTC) / 86_400_000;
  const cycles = diffDays / MOON_SYNODIC_DAYS;
  return cycles - Math.floor(cycles); // 0..1, 0 = nouvelle lune, 0.5 = pleine
}

function buildMoonPath(phaseFraction: number): { path: string; illuminated: number } {
  const angle = phaseFraction * 2 * Math.PI;
  const rSigned = 48 * Math.cos(angle);
  const r = Math.abs(rSigned);
  const sweep1 = 1;
  const sweep2 = rSigned >= 0 ? sweep1 : 1 - sweep1;
  return {
    path: `M50,2 A48,48 0 1,${sweep1} 50,98 A${r.toFixed(2)},48 0 1,${sweep2} 50,2 Z`,
    illuminated: (1 - Math.cos(angle)) / 2, // 0 = nouvelle lune, 1 = pleine
  };
}

const PHASE_CHECK_MS = 5 * 60 * 1000;

// Couleurs par phase. "day" reprend telles quelles les couleurs déjà
// approuvées (orange/jaune du soleil) ; "dawn" les adoucit vers le rose de
// la charte ([[charte-graphique-livre-moi]] : --color-brand-pink) ; "night"
// bascule sur un gris-bleu neutre (couleur de lune, pas une couleur de
// marque), pas de rayons — juste la lune et son halo froid.
const PHASE_STYLES: Record<
  Phase,
  {
    haloColor: string;
    rayColor: string;
    rayOpacity: number;
    orbGradient: string;
    orbGlow: string;
    ariaFr: string;
    ariaEn: string;
  }
> = {
  dawn: {
    haloColor: "255,178,150",
    rayColor: "255,190,150",
    rayOpacity: 0.18,
    orbGradient: "linear-gradient(180deg, #ffe4bb 0%, #ffb199 55%, #ff8f70 100%)",
    orbGlow: "0 0 40px 8px rgba(255,150,140,0.35), 0 0 90px 24px rgba(255,150,140,0.16)",
    ariaFr: "Le jour se lève, un nuage passe : votre journée commence tout doucement.",
    ariaEn: "Dawn is breaking, a cloud drifts by: your day is starting gently.",
  },
  day: {
    haloColor: "255,157,31",
    rayColor: "255,176,32",
    rayOpacity: 0.32,
    orbGradient: "linear-gradient(180deg, #ffcf3d 0%, #ff9d1f 55%, #f9670e 100%)",
    orbGlow: "0 0 60px 10px rgba(255,157,31,0.45), 0 0 110px 30px rgba(255,157,31,0.2)",
    ariaFr: "Le soleil est haut : votre journée bat son plein.",
    ariaEn: "The sun is high: your day is in full swing.",
  },
  night: {
    haloColor: "140,150,235",
    rayColor: "170,180,240",
    rayOpacity: 0.1,
    orbGradient: "linear-gradient(160deg, #eef2fb 0%, #cfd8ea 55%, #9aa5c9 100%)",
    orbGlow: "0 0 40px 8px rgba(140,160,255,0.35), 0 0 90px 24px rgba(140,160,255,0.15)",
    ariaFr: "La lune se lève : la nuit commence.",
    ariaEn: "The moon is rising: night is falling.",
  },
};

export default function DashboardDayWelcome() {
  const { t } = useDashboardLangue();
  const frameRef = useRef<HTMLDivElement>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [risen, setRisen] = useState(reducedMotion);
  // "day" par défaut le temps du premier rendu serveur (pas d'horloge côté
  // serveur fiable) — corrigé côté client juste après le montage, cf. effet
  // ci-dessous ; évite un mismatch d'hydratation (même rendu serveur/client
  // au premier passage).
  const [phase, setPhase] = useState<Phase>("day");
  // Forme de la lune (nuit uniquement) — valeur par défaut arbitraire, sans
  // effet tant que phase !== "night" (donc jamais visible avant le premier
  // sync côté client, pas de souci d'hydratation ici).
  const [moon, setMoon] = useState(() => buildMoonPath(0.5));
  const style = PHASE_STYLES[phase];

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = requestAnimationFrame(() => setRisen(true));
    return () => cancelAnimationFrame(id);
  }, [reducedMotion]);

  useEffect(() => {
    const sync = () => {
      const now = new Date();
      setPhase(getPhaseForHour(now.getHours()));
      setMoon(buildMoonPath(getMoonPhaseFraction(now)));
    };
    sync();
    const id = setInterval(sync, PHASE_CHECK_MS);
    return () => clearInterval(id);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      ref={frameRef}
      onPointerMove={reducedMotion ? undefined : handlePointerMove}
      onPointerLeave={reducedMotion ? undefined : handlePointerLeave}
      className="absolute inset-0 overflow-hidden"
      style={{ perspective: "900px", background: "transparent" }}
      role="img"
      aria-label={t(style.ariaFr, style.ariaEn)}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Halo derrière tout, respire — l'"éclat". Taille = le cadre lui-même
            (inset-0, pas de px fixe) et dégradé "closest-side" (le fade
            touche 0 pile sur le bord le plus proche, dans toutes les
            directions) : le cadre parent (overflow-hidden, rempli sa
            cellule de grille) contient tout, rien ne déborde dans la page. */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ transform: "translateZ(-60px)" }}
          initial={reducedMotion ? undefined : { opacity: 0, scale: 0.7 }}
          animate={
            reducedMotion
              ? {
                  background: `radial-gradient(circle closest-side at 50% 58%, rgba(${style.haloColor},0.5) 0%, rgba(${style.haloColor},0.2) 45%, transparent 78%)`,
                  opacity: 0.65,
                  scale: 1,
                }
              : {
                  background: `radial-gradient(circle closest-side at 50% 58%, rgba(${style.haloColor},0.5) 0%, rgba(${style.haloColor},0.2) 45%, transparent 78%)`,
                  opacity: risen ? [0, 0.9, 0.65] : 0,
                  scale: risen ? [0.7, 1.15, 1] : 0.7,
                }
          }
          transition={
            reducedMotion
              ? { background: { duration: 0.8 } }
              : { duration: 1.6, ease: [0.16, 1, 0.3, 1] }
          }
        />

        {/* Rayons (soleil, jour/aube uniquement) : conique tournant
            lentement, même règle de fade que le halo. Pas de rayons la
            nuit — juste la lune et son halo froid. */}
        {phase !== "night" && (
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              transform: "translateZ(-40px)",
              background: `repeating-conic-gradient(from 0deg, rgba(${style.rayColor},${style.rayOpacity}) 0deg 5deg, transparent 5deg 16deg)`,
              maskImage:
                "radial-gradient(circle closest-side at 50% 58%, black 20%, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(circle closest-side at 50% 58%, black 20%, transparent 72%)",
            }}
            initial={reducedMotion ? undefined : { opacity: 0, rotate: 0 }}
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: risen ? 1 : 0, rotate: 360 }
            }
            transition={
              reducedMotion
                ? undefined
                : {
                    opacity: { duration: 1.1, delay: 0.15 },
                    rotate: { duration: 90, repeat: Infinity, ease: "linear" },
                  }
            }
          />
        )}

        {/* Oiseaux (jour) : chevrons volant une fois à l'entrée, comme sur
            soleil.png. */}
        {!reducedMotion &&
          phase === "day" &&
          BIRDS.map((bird, i) => (
            <motion.svg
              key={i}
              aria-hidden
              viewBox="0 0 24 12"
              className="absolute h-[10px] w-[18px] text-[var(--dashboard-text)]/40"
              style={{ top: bird.top, transform: "translateZ(30px)" }}
              initial={{ x: "-10%", opacity: 0 }}
              animate={risen ? { x: "340%", opacity: [0, 1, 1, 0] } : undefined}
              transition={{
                duration: 3.2,
                delay: 0.6 + i * 0.25,
                ease: "easeInOut",
                times: [0, 0.15, 0.8, 1],
              }}
            >
              <path
                d="M1 8 Q6 1 12 6 Q18 1 23 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </motion.svg>
          ))}

        {/* Étoiles (nuit) : petits points qui scintillent en boucle,
            positions fixes (pas de random par rendu, sinon ça saute à
            chaque re-render). */}
        {phase === "night" &&
          STARS.map((star, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="absolute h-[3px] w-[3px] rounded-full bg-white"
              style={{ top: star.top, left: star.left, transform: "translateZ(25px)" }}
              initial={reducedMotion ? undefined : { opacity: 0.15 }}
              animate={
                reducedMotion
                  ? { opacity: 0.7 }
                  : { opacity: [0.15, 0.9, 0.15] }
              }
              transition={
                reducedMotion
                  ? undefined
                  : { duration: 2.6 + star.delay, repeat: Infinity, ease: "easeInOut", delay: star.delay }
              }
            />
          ))}

        {/* Nuage vedette (aube) : couvre la moitié basse du soleil pile —
            centré sur lui (même axe horizontal, "left: 50%" + calc sur sa
            propre largeur) et calé juste sous son bord bas (bottom du
            soleil = 48%, cf. plus bas) pour que sa moitié haute ("la tête")
            dépasse par-dessus. Un ancien bug faisait dériver les nuages
            avec `x` en % — un % de transform est relatif à la largeur DU
            NUAGE, pas du cadre, et sans `left` de base ils restaient
            collés au bord gauche, jamais sur le soleil centré. Corrigé ici
            avec `left` en calc()/% (relatif au cadre, comme le veut CSS). */}
        {phase === "dawn" && (
          <motion.div
            aria-hidden
            className="absolute"
            style={{
              bottom: "calc(48% - 40px)",
              left: "calc(50% - 100px)",
              width: "200px",
              height: "84px",
              transform: "translateZ(35px)",
              filter: "drop-shadow(0 10px 16px rgba(20,18,32,0.18))",
            }}
            initial={reducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
            animate={
              reducedMotion
                ? { opacity: 1, scale: 1 }
                : risen
                  ? {
                      opacity: 1,
                      scale: 1,
                      left: ["calc(50% - 110px)", "calc(50% - 90px)", "calc(50% - 110px)"],
                    }
                  : { opacity: 0, scale: 0.85 }
            }
            transition={
              reducedMotion
                ? undefined
                : {
                    opacity: { duration: 1, delay: 0.3 },
                    scale: { duration: 1, delay: 0.3 },
                    left: { duration: 14, repeat: Infinity, ease: "easeInOut" },
                  }
            }
          >
            {/* Vrai nuage : plusieurs cercles blancs qui se chevauchent
                (même couleur/opacité, donc aucune jointure visible) plutôt
                qu'une simple pilule — silhouette "bosses" classique. Une
                seule ombre portée sur le groupe entier (filter: drop-shadow
                ci-dessus, suit la silhouette réelle) au lieu d'une ombre par
                cercle qui aurait fait un tas flou. */}
            <div className="absolute inset-x-[6%] bottom-0 h-[44%] rounded-full bg-gradient-to-b from-white to-[#eef0f5]" />
            <div className="absolute bottom-[14%] left-[2%] h-[64%] w-[34%] rounded-full bg-gradient-to-b from-white to-[#eef0f5]" />
            <div className="absolute bottom-[20%] left-[28%] h-[82%] w-[42%] rounded-full bg-gradient-to-b from-white to-[#eef0f5]" />
            <div className="absolute bottom-[16%] left-[60%] h-[58%] w-[30%] rounded-full bg-gradient-to-b from-white to-[#eef0f5]" />
            <div className="absolute bottom-[8%] left-[78%] h-[38%] w-[22%] rounded-full bg-gradient-to-b from-white to-[#eef0f5]" />
          </motion.div>
        )}

        {/* Volutes secondaires : plus petites, floues, traversent tout le
            cadre en boucle pour l'ambiance — `left` en %, donc bien relatif
            à la largeur du cadre cette fois. */}
        {phase === "dawn" &&
          CLOUD_WISPS.map((cloud, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="absolute rounded-full bg-white/90 blur-md"
              style={{
                bottom: cloud.bottom,
                width: cloud.width,
                height: cloud.height,
                transform: "translateZ(30px)",
              }}
              initial={reducedMotion ? undefined : { left: cloud.startLeft, opacity: 0 }}
              animate={
                reducedMotion
                  ? { left: cloud.startLeft, opacity: 0.8 }
                  : risen
                    ? { left: [cloud.startLeft, cloud.endLeft, cloud.startLeft], opacity: 0.8 }
                    : { left: cloud.startLeft, opacity: 0 }
              }
              transition={
                reducedMotion
                  ? undefined
                  : {
                      left: { duration: cloud.duration, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 1, delay: 0.3 },
                    }
              }
            />
          ))}

        {/* Astre : soleil (jour/aube) ou lune (nuit) — se lève depuis
            l'horizon puis respire doucement. La nuit, le disque plein est
            remplacé par le croissant/la forme réelle du jour (SVG, cf.
            buildMoonPath) : le fond de ce cadre passe donc à transparent
            pour la nuit (sinon le disque plein resterait visible derrière
            le croissant et annulerait l'effet) — le halo (boxShadow) reste,
            rond, comme un vrai halo lunaire indépendant de la forme. */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 h-[132px] w-[132px] -translate-x-1/2 rounded-full sm:h-[156px] sm:w-[156px]"
          style={{ bottom: "48%", transform: "translateZ(10px)" }}
          initial={reducedMotion ? undefined : { y: 90, opacity: 0, scale: 0.7 }}
          animate={
            reducedMotion
              ? {
                  background: phase === "night" ? "transparent" : style.orbGradient,
                  boxShadow: style.orbGlow,
                  opacity: 1,
                  scale: 1,
                }
              : {
                  background: phase === "night" ? "transparent" : style.orbGradient,
                  boxShadow: style.orbGlow,
                  y: risen ? [90, -6, 0] : 90,
                  opacity: risen ? 1 : 0,
                  scale: risen ? 1 : 0.7,
                }
          }
          transition={
            reducedMotion
              ? { background: { duration: 0.8 }, boxShadow: { duration: 0.8 } }
              : { duration: 1.3, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {/* Croissant/forme lunaire du jour (nuit) ou reflet chaud (soleil) */}
          {phase === "night" ? (
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="moonLit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eef2fb" />
                  <stop offset="55%" stopColor="#cfd8ea" />
                  <stop offset="100%" stopColor="#9aa5c9" />
                </linearGradient>
                <clipPath id="moonClip">
                  <path d={moon.path} />
                </clipPath>
              </defs>
              {/* Contour discret du disque complet : reste visible même à
                  la nouvelle lune (illuminated ~0, path quasi invisible)
                  pour qu'on comprenne "il y a une lune ici", pas un bug. */}
              <circle cx={50} cy={50} r={48} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              <path d={moon.path} fill="url(#moonLit)" />
              {/* Cratères, uniquement sur la portion éclairée (clip = même
                  contour que la partie lumineuse). */}
              <g clipPath="url(#moonClip)">
                <circle cx={62} cy={30} r={7} fill="#9aa5c9" opacity={0.5} />
                <circle cx={32} cy={58} r={5} fill="#9aa5c9" opacity={0.4} />
                <circle cx={60} cy={68} r={4} fill="#9aa5c9" opacity={0.45} />
              </g>
            </svg>
          ) : (
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full"
              animate={
                reducedMotion
                  ? undefined
                  : { scale: [1, 1.035, 1] }
              }
              transition={
                reducedMotion
                  ? undefined
                  : { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }
              }
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), transparent 55%)",
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

const BIRDS = [{ top: "22%" }, { top: "32%" }, { top: "18%" }] as const;

const STARS = [
  { top: "10%", left: "18%", delay: 0 },
  { top: "22%", left: "72%", delay: 0.4 },
  { top: "6%", left: "48%", delay: 0.8 },
  { top: "34%", left: "30%", delay: 1.2 },
  { top: "16%", left: "85%", delay: 0.6 },
  { top: "40%", left: "60%", delay: 1.6 },
] as const;

// `left` en % (relatif au cadre, comme CSS le fait naturellement) pour que
// les volutes traversent vraiment tout le cadre — pas `x`/transform (relatif
// à leur propre largeur, cf. le nuage vedette juste au-dessus pour le détail
// du bug corrigé). `bottom` proche de celui du soleil (48%) pour rester à sa
// hauteur, pas ailleurs dans le cadre.
const CLOUD_WISPS = [
  { bottom: "60%", width: "70px", height: "22px", startLeft: "-20%", endLeft: "115%", duration: 24 },
  { bottom: "38%", width: "54px", height: "18px", startLeft: "120%", endLeft: "-30%", duration: 30 },
] as const;
