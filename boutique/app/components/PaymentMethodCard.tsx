"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useDashboardLangue } from "./DashboardLanguageProvider";

/*
  Carte "Reversé sur ce compte" du dashboard Accueil : un jeu de cartes
  empilées (Orange Money, Wave, MTN MoMo, Moov Money), les pastilles en bas
  servent de sélecteur — cliquer une couleur affiche la carte du moyen de
  paiement correspondant. Reproduction du modèle carte prépayée envoyé par
  l'utilisateur : fond sombre teinté marque, arcs dégradés (rose → violet →
  blanc, cf. couleurs fournies) dans le coin supérieur droit, vrai logo de
  la marque (public/images) + nom en haut à gauche, "VISA" remplacé par
  "Compte actif", "Card Balance" par "Reversé sur ce compte", numéro masqué
  + icône sans-contact + puce en bas — pas de ligne cardholder/EXP/CVV,
  l'utilisateur n'en a pas besoin. Données statiques en attendant l'API
  Laravel, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

type Method = {
  id: string;
  label: string;
  short: string;
  dot: string;
  base: string;
  logoSrc: string;
  logoWide?: boolean; // logo transparent, pas carré (ex: MTN) : pas de cadre arrondi
};

const METHODS: Method[] = [
  {
    id: "om",
    label: "Orange Money",
    short: "OM",
    dot: "#FF7900",
    base: "#1A0F06",
    logoSrc: "/images/ORANGE.png",
  },
  {
    id: "wave",
    label: "Wave",
    short: "WV",
    dot: "#1BA1F2",
    base: "#071726",
    logoSrc: "/images/wave.png",
  },
  {
    id: "mtn",
    label: "MTN MoMo",
    short: "MTN",
    dot: "#FFCC00",
    base: "#14120A",
    logoSrc: "/images/MTN.svg",
    logoWide: true,
  },
  {
    id: "moov",
    label: "Moov Money",
    short: "MV",
    dot: "#2F72D6",
    base: "#0A1020",
    logoSrc: "/images/MOOV.png",
  },
];

// Dégradé exact fourni (rose → violet → blanc) pour les traits, ancré en
// coordonnées absolues (userSpaceOnUse) pour que les 4 lignes partagent le
// même balayage de couleur au lieu de répéter chacune tout le dégradé.
const TRAIT_GRADIENT_ID = "payment-card-trait-gradient";
const CARD_W = 340;
const CARD_H = 208; // carte agrandie (cf. min-h-52 plus bas) pour laisser respirer la courbe

// Plat depuis le bord gauche jusqu'à ~65-70% de la largeur (reste dans
// l'espace vide entre logo/nom et badge "Compte actif"), puis grande courbe
// fluide (cubique, pas d'angle serré) vers le haut — reste à l'intérieur de
// la carte, ne touche jamais bord droit ni bord haut, jamais lu comme un
// contour de carte. Remonté pour rester au-dessus du numéro masqué en bas.
//
// 3 tracés distincts (pas une seule translation verticale) : un dy uniforme
// écrase l'écart visuel là où la courbe devient presque verticale (l'écart
// vertical constant devient une distance perpendiculaire minuscule sur un
// segment quasi vertical → traits qui semblent collés/fondus en un seul en
// haut). Ici chaque trait a son propre point de cambrure et sa propre fin,
// légèrement décalés en x ET en y, pour garder un écart visible tout du long.
const TRAIT_LINES = [
  { path: "M0,138 L185,138 C204,138 220,80 220,8", width: 6 },
  { path: "M0,130 L180,130 C197,130 210,74 210,4", width: 5 },
  { path: "M0,122 L175,122 C190,122 202,67 202,0", width: 4 },
];

function CardArcs() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={TRAIT_GRADIENT_ID} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CARD_W} y2="0">
          <stop offset="0%" stopColor="#EC0C8C" />
          <stop offset="58.35%" stopColor="#3A1D8A" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      {TRAIT_LINES.map((line) => (
        <path
          key={line.path}
          d={line.path}
          stroke={`url(#${TRAIT_GRADIENT_ID})`}
          strokeWidth={line.width}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}

function ContactlessIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white/70">
      <path d="M5 8.5a8 8 0 0 1 0 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 5.5a12.5 12.5 0 0 1 0 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2.5a16 16 0 0 1 0 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const SWIPE_THRESHOLD = 40;

export default function PaymentMethodCard() {
  const { t } = useDashboardLangue();
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const dirRef = useRef<1 | -1>(1); // sens de l'anim d'entrée, façon changement de page
  const method = METHODS[active];
  const behind1 = METHODS[(active + 1) % METHODS.length];
  const behind2 = METHODS[(active + 2) % METHODS.length];

  const next = () => {
    dirRef.current = 1;
    setActive((a) => (a + 1) % METHODS.length);
  };
  const prev = () => {
    dirRef.current = -1;
    setActive((a) => (a - 1 + METHODS.length) % METHODS.length);
  };
  const goTo = (i: number) => {
    dirRef.current = i >= active ? 1 : -1;
    setActive(i);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    setDragX(e.clientX - startXRef.current);
  };
  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      dragX < 0 ? next() : prev();
    } else {
      // petit déplacement (ou simple tap) → clic sur la carte = carte suivante
      next();
    }
    setDragX(0);
  };

  return (
    <div className="relative pt-6">
      {/* cartes empilées derrière — profondeur : plus loin = plus flou */}
      <div
        className="absolute inset-x-6 top-0 h-52 rounded-2xl border border-white/10 opacity-60 backdrop-blur-md transition-[background] duration-300 ease-out"
        style={{ background: behind2.base }}
      />
      <div
        className="absolute inset-x-2 top-2 h-52 rounded-2xl opacity-85 transition-[background] duration-300 ease-out"
        style={{ background: behind1.base }}
      />

      <div
        key={method.id}
        className={dirRef.current === 1 ? "payment-card-enter-fwd" : "payment-card-enter-back"}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={t(
            `Voir le moyen de paiement suivant (actuel : ${method.label})`,
            `See next payment method (current: ${method.label})`
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") next();
            if (e.key === "ArrowLeft") prev();
          }}
          className="relative min-h-52 touch-pan-y cursor-grab overflow-hidden rounded-2xl px-4 pt-4 pb-1.5 text-white shadow-[0_18px_40px_rgba(20,18,32,0.28)] select-none active:cursor-grabbing"
          style={{
            background: method.base,
            transform: `translateX(${dragX}px)`,
            transition: draggingRef.current ? "none" : "transform 0.2s ease",
          }}
        >
          <CardArcs />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {/* vrai logo marque */}
                {method.logoWide ? (
                  <Image src={method.logoSrc} alt={method.label} width={40} height={20} className="h-6 w-auto" />
                ) : (
                  <Image
                    src={method.logoSrc}
                    alt={method.label}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                )}
                <span className="text-base font-bold tracking-tight">{method.label}</span>
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/90">
                {t("Compte actif", "Active account")}
              </span>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-white/50">
              {t("Reversé sur ce compte", "Paid out to this account")}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight font-figures">318 000 F</p>

            <div className="mt-12 flex items-center justify-between">
              <span className="text-xs tracking-[0.22em] text-white/70">•••• •••• •••• 4417</span>
              <span className="flex items-center gap-1.5">
                <ContactlessIcon />
                {/* puce carte */}
                <Image src="/images/sim.png" alt="" width={24} height={20} className="h-5 w-6 object-contain" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-1.5">
        {METHODS.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={m.label}
            aria-pressed={i === active}
            className="flex h-3 items-center px-0.5"
          >
            <span
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === active ? 20 : 6, background: m.dot, opacity: i === active ? 1 : 0.35 }}
            />
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] text-[#141220]/40">
        Orange Money · Wave · MTN MoMo · Moov Money
      </p>
    </div>
  );
}
