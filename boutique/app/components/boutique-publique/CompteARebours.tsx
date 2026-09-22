"use client";

import { useEffect, useState } from "react";

/*
  Ticks côté client uniquement : `restant` démarre à `null` pour que le
  rendu serveur et le premier rendu client matchent (rien), l'intervalle ne
  s'active qu'après hydratation — évite un mismatch d'hydratation lié à
  Date.now() qui diffère entre le serveur et le navigateur.
*/
export default function CompteARebours({ cibleMs }: { cibleMs: number }) {
  const [restant, setRestant] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRestant(cibleMs - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cibleMs]);

  if (restant === null || restant <= 0) return null;

  const total = Math.floor(restant / 1000);
  const unites = [
    { valeur: Math.floor(total / 86400), label: "jours" },
    { valeur: Math.floor((total % 86400) / 3600), label: "heures" },
    { valeur: Math.floor((total % 3600) / 60), label: "min" },
    { valeur: total % 60, label: "s" },
  ];

  return (
    <div
      className="mt-3 flex items-center gap-2"
      role="timer"
      aria-label={`Offre termine dans ${unites.map((u) => `${u.valeur} ${u.label}`).join(" ")}`}
    >
      {unites.map((u) => (
        <div key={u.label} className="flex w-14 flex-col items-center gap-0.5 rounded-xl bg-white/15 py-2">
          <span className="font-figures text-[17px] font-extrabold leading-none tabular-nums">{String(u.valeur).padStart(2, "0")}</span>
          <span className="text-[10px] font-medium text-white/70">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
