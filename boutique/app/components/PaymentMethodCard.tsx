"use client";

import { useRef, useState } from "react";

/*
  Carte "Reversé sur ce compte" du dashboard Accueil : un jeu de cartes
  empilées (Orange Money, Wave, MTN MoMo, Moov Money), les pastilles en bas
  servent de sélecteur — cliquer une couleur affiche la carte du moyen de
  paiement correspondant. Données statiques en attendant l'API Laravel,
  cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

type Method = {
  id: string;
  label: string;
  short: string;
  dot: string;
  gradient: string;
  iconText: string;
  textDark?: boolean;
};

const METHODS: Method[] = [
  {
    id: "om",
    label: "Orange Money",
    short: "OM",
    dot: "#FF7900",
    gradient: "linear-gradient(118.07deg, #FFA24D 0%, #FF7900 46%, #B85200 100%)",
    iconText: "#FF7900",
  },
  {
    id: "wave",
    label: "Wave",
    short: "WV",
    dot: "#1BA1F2",
    gradient: "linear-gradient(118.07deg, #6DC5FA 0%, #1BA1F2 46%, #0A3D91 100%)",
    iconText: "#0A3D91",
  },
  {
    id: "mtn",
    label: "MTN MoMo",
    short: "MTN",
    dot: "#FFCC00",
    gradient: "linear-gradient(118.07deg, #FFE066 0%, #FFCC00 46%, #B38F00 100%)",
    iconText: "#B38F00",
    textDark: true,
  },
  {
    id: "moov",
    label: "Moov Money",
    short: "MV",
    dot: "#2F72D6",
    gradient: "linear-gradient(118.07deg, #6E9EEB 0%, #2F72D6 46%, #123B7A 100%)",
    iconText: "#123B7A",
  },
];

const SWIPE_THRESHOLD = 40;

export default function PaymentMethodCard() {
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
        className="absolute inset-x-6 top-0 h-40 rounded-2xl border border-white/20 opacity-60 backdrop-blur-md transition-[background] duration-300 ease-out"
        style={{ background: behind2.gradient }}
      />
      <div
        className="absolute inset-x-2 top-2 h-40 rounded-2xl opacity-85 transition-[background] duration-300 ease-out"
        style={{ background: behind1.gradient }}
      />

      <div
        key={method.id}
        className={dirRef.current === 1 ? "payment-card-enter-fwd" : "payment-card-enter-back"}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`Voir le moyen de paiement suivant (actuel : ${method.label})`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") next();
            if (e.key === "ArrowLeft") prev();
          }}
          className={`relative touch-pan-y cursor-grab overflow-hidden rounded-2xl p-4 shadow-[0_18px_40px_rgba(20,18,32,0.28)] select-none active:cursor-grabbing ${
            method.textDark ? "text-[#141220]" : "text-white"
          }`}
          style={{
            background: method.gradient,
            transform: `translateX(${dragX}px)`,
            transition: draggingRef.current ? "none" : "transform 0.2s ease",
          }}
        >
          <span
            className={`pointer-events-none absolute rounded-full ${
              method.textDark ? "bg-black/[0.06]" : ""
            }`}
            style={{ right: -30, top: -40, width: 130, height: 130, background: method.textDark ? undefined : "#FFFFFF29" }}
          />
          <span
            className={`pointer-events-none absolute rounded-full ${
              method.textDark ? "bg-black/[0.06]" : ""
            }`}
            style={{ left: -34, top: -40, width: 105, height: 105, background: method.textDark ? undefined : "#FFFFFF29" }}
          />
          <span
            className={`pointer-events-none absolute rounded-full ${
              method.textDark ? "bg-black/[0.06]" : ""
            }`}
            style={{ left: -32, bottom: -46, width: 115, height: 115, background: method.textDark ? undefined : "#FFFFFF29" }}
          />
          <div className="relative flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-bold">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-[10px] font-extrabold"
                style={{ color: method.iconText }}
              >
                {method.short}
              </span>
              {method.label}
            </span>
            <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              Compte actif
            </span>
          </div>
          <p className={`mt-4 text-[10px] uppercase tracking-[0.16em] ${method.textDark ? "text-black/50" : "text-white/70"}`}>
            Reversé sur ce compte
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">318 000 F</p>
          <div className={`mt-3 flex items-center justify-between text-[10px] ${method.textDark ? "text-black/50" : "text-white/70"}`}>
            <span className="tracking-[0.18em]">•••• •••• 4417</span>
            <span>30 / 08</span>
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
