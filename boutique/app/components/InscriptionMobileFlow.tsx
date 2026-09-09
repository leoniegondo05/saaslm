"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import AuthOverlayText from "./AuthOverlayText";
import NetworkBackground from "./vision/NetworkBackground";

/*
  Symétrique de LoginMobileFlow.tsx, pour app/inscription/page.tsx.
  Sur mobile (< lg), la colonne visuel est masquée (voir "hidden ... lg:block")
  et le formulaire s'affichait donc directement, sans passer par l'écran
  "Ici commence votre indépendance commerciale." + bouton "Commencer" de la
  maquette Figma. Ce composant réintroduit cette étape : un écran plein écran
  (image + texte + "Commencer") au-dessus du formulaire, qui ne se démonte
  qu'au clic sur "Commencer". Le desktop, qui affiche déjà les deux colonnes
  côte à côte, ignore cette étape (lg:hidden / lg:flex) et voit le formulaire
  tout de suite.
*/
export default function InscriptionMobileFlow({
  children,
}: {
  children: ReactNode;
}) {
  const [step, setStep] = useState<"intro" | "form">("intro");

  return (
    <>
      {step === "intro" && (
        // Même maillage de points que la colonne visuel desktop (voir
        // app/inscription/page.tsx) plutôt que Rectangle.png : identité
        // "réseau" du site au lieu d'un dégradé flou figé, et un cadre
        // (bordure + coins arrondis, fond transparent) posé en retrait
        // par-dessus (marge ~20px sur les côtés, ~80px en haut/bas).
        <div className="absolute inset-0 z-10 bg-brand-bg lg:hidden">
          <NetworkBackground />

          <div className="absolute inset-x-5 inset-y-20 rounded-3xl border border-white/25 sm:inset-x-6 sm:inset-y-24">
            {/* Badge haut-gauche (logo dans un carré arrondi), repris de la
                maquette Figma — c'est le logo LIIVRE MOI, pas un simple point.
                Le SVG a une bonne marge interne intégrée à son viewBox : même
                agrandi, le tracé reste petit dedans. Le liseré blanc + le
                scale-150 (recadré par overflow-hidden) compensent : ça
                marque bien le badge et ça fait "déborder" le logo pour
                combler l'espace. */}
            <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/40 bg-black/30 backdrop-blur">
              <Image
                src="/images/logo.svg"
                alt="Logo LIIVRE MOI"
                width={40}
                height={40}
                className="h-full w-full scale-150 object-contain"
              />
            </span>

            <AuthOverlayText
              label="Bienvenue sur LIIVRE MOI"
              heading="Ici commence votre indépendance commerciale."
              cta={
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="mt-6 rounded-xl bg-brand-white px-8 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90"
                >
                  Commencer
                </button>
              }
            />

            {/* Initiales "LM" bas-gauche, comme sur l'image de référence. */}
            <span className="absolute bottom-5 left-5 text-sm font-semibold text-brand-white/60">
              LM
            </span>
          </div>
        </div>
      )}

      <div
        className={`w-full flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 sm:gap-6 md:px-16 md:py-10 lg:flex lg:overflow-visible ${
          step === "form" ? "flex" : "hidden lg:flex"
        }`}
      >
        {children}
      </div>
    </>
  );
}
