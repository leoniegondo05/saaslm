"use client";

import { useEffect, useState } from "react";
import type { BandeauState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { texteAvecChiffres } from "@/lib/boutique-format";
import { LuMegaphone, LuX } from "react-icons/lu";

const CLASSES: Record<BandeauState["couleur"], string> = {
  nuit: "bg-[#0B0E1C] text-white",
  principale: "text-white",
  claire: "bg-[var(--tx)]/10 text-[var(--tx)]",
};

/*
  Bandeau d'annonce — port de la case "bandeau" : défilement tour-à-tour/
  continu entre les messages (`defilement`, minuterie côté client — la
  version précédente affichait seulement le message actif en statique),
  sticky au défilement (`resteVisibleEnDefilant`) et bouton fermer
  (`fermable`, état local). Pas de compte à rebours chiffré :
  `compteARebours` (BandeauState) est un simple bouton "activé/désactivé"
  dans l'éditeur, sans date de fin associée nulle part dans le schéma — un
  décompte inventé (comme "05:12:33" dans BoutiquePreview.tsx, qui est une
  démonstration figée) induirait le client en erreur sur le site réel, donc
  ce réglage n'a ici aucun effet visuel, cf. rapport de tâche.
*/
export default function SectionBandeau({ bandeau }: { bandeau: BandeauState }) {
  const [index, setIndex] = useState(bandeau.messageActif);
  const [ferme, setFerme] = useState(false);

  useEffect(() => {
    if (bandeau.defilement === "fixe" || bandeau.messages.length <= 1) return;
    const minuteur = setInterval(() => setIndex((i) => (i + 1) % bandeau.messages.length), 4000);
    return () => clearInterval(minuteur);
  }, [bandeau.defilement, bandeau.messages.length]);

  if (!bandeau.messages.length || ferme) return null;
  const message = bandeau.messages[index] ?? bandeau.messages[0];
  const style = bandeau.couleur === "principale" ? { background: "var(--ac)" } : undefined;

  return (
    <div className={`relative px-4 py-2 text-center text-[12.5px] font-medium ${CLASSES[bandeau.couleur]} ${bandeau.resteVisibleEnDefilant ? "sticky top-0 z-40" : ""}`} style={style}>
      <p className="mx-auto flex max-w-6xl items-center justify-center gap-2">
        {bandeau.iconeDevantMessage && <LuMegaphone size={16} />}
        {texteAvecChiffres(message.texte)}
      </p>
      {bandeau.fermable && (
        <button type="button" onClick={() => setFerme(true)} aria-label="Fermer" className="absolute right-3 top-1/2 -translate-y-1/2">
          <LuX size={16} />
        </button>
      )}
    </div>
  );
}
