"use client";

import { useState } from "react";

/*
  Carte "Reversé sur ce compte" du dashboard Accueil : un jeu de cartes
  empilées (Orange Money, MTN MoMo, Wave, Moov Money, Carte bancaire), les
  pastilles en bas servent de sélecteur — cliquer une couleur affiche la
  carte du moyen de paiement correspondant. Données statiques en attendant
  l'API Laravel, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
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
    id: "mtn",
    label: "MTN MoMo",
    short: "MTN",
    dot: "#FFCC00",
    gradient: "linear-gradient(118.07deg, #FFE066 0%, #FFCC00 46%, #B38F00 100%)",
    iconText: "#B38F00",
    textDark: true,
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
    id: "moov",
    label: "Moov Money",
    short: "MV",
    dot: "#2F72D6",
    gradient: "linear-gradient(118.07deg, #6E9EEB 0%, #2F72D6 46%, #123B7A 100%)",
    iconText: "#123B7A",
  },
  {
    id: "cb",
    label: "Carte bancaire",
    short: "CB",
    dot: "#8A90A0",
    gradient: "linear-gradient(118.07deg, #78808F 0%, #4A5568 46%, #20242E 100%)",
    iconText: "#2D3748",
  },
];

export default function PaymentMethodCard() {
  const [active, setActive] = useState(0);
  const method = METHODS[active];

  return (
    <div className="relative pt-6">
      {/* cartes empilées derrière — profondeur : plus loin = plus flou */}
      <div className="absolute inset-x-6 top-0 h-40 rounded-2xl bg-[linear-gradient(160deg,#7A8296_0%,#3A4152_100%)] opacity-30 blur-md" />
      <div className="absolute inset-x-4 top-1 h-40 rounded-2xl bg-[linear-gradient(160deg,#4A5568_0%,#2D3748_100%)] opacity-60 blur-sm" />
      <div className="absolute inset-x-2 top-2 h-40 rounded-2xl bg-[linear-gradient(160deg,#1BA1F2_0%,#0A3D91_100%)] opacity-80" />

      <div
        className={`relative overflow-hidden rounded-2xl p-4 shadow-[0_18px_40px_rgba(20,18,32,0.28)] ${
          method.textDark ? "text-[#141220]" : "text-white"
        }`}
        style={{ background: method.gradient }}
      >
        <span
          className={`pointer-events-none absolute rounded-full ${
            method.textDark ? "bg-black/[0.06]" : "bg-white/[0.16]"
          }`}
          style={{ right: -56, top: -70, width: 200, height: 200 }}
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
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
              method.textDark ? "bg-white/70 text-[#141220]" : "bg-white/90 text-[#141220]"
            }`}
          >
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

      <div className="mt-2 flex justify-center gap-1.5">
        {METHODS.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={m.label}
            aria-pressed={i === active}
            className="flex h-3 items-center px-0.5"
          >
            <span
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === active ? 20 : 6, background: i === active ? m.dot : "rgba(20,18,32,0.15)" }}
            />
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] text-[#141220]/40">
        Orange Money · MTN MoMo · Wave · Moov Money · Carte bancaire
      </p>
    </div>
  );
}
