"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

/*
  Symétrique de LoginMobileFlow.tsx. Sur mobile (< 981px), la colonne
  visuel de app/inscription/page.tsx (.login-left) est masquée (voir
  globals.css) et le formulaire s'affichait donc directement — sans
  passer par l'écran "Bienvenue sur LIIVRE MOI" + "Ici commence votre
  indépendance commerciale." + bouton "Commencer". Ce composant
  réintroduit cette étape : un écran plein cadre (logo + accroche +
  halos "aurore" + "Commencer") au-dessus du formulaire, qui ne se
  démonte qu'au clic sur "Commencer". Le desktop, qui affiche déjà les
  deux colonnes côte à côte, ignore cette étape et voit le formulaire
  tout de suite (voir règles @media dans globals.css).

  Même mécanique que l'ancienne version (avant l'habillage "verre
  dépoli") — seul le visuel change (halos + carte en verre au lieu du
  maillage de points).
*/
export default function InscriptionMobileFlow({
  children,
}: {
  children: ReactNode;
}) {
  const [step, setStep] = useState<"intro" | "form">("intro");

  // Bloque le scroll de la page tant que l'écran d'intro (logo + accroche
  // + "Commencer") est affiché sur mobile : son contenu est toujours
  // court et centré, il ne doit jamais pouvoir défiler pour révéler du
  // vide en dessous — seul le formulaire (étape "form") peut, lui, avoir
  // besoin de défiler s'il est long. Sans effet sur desktop, où l'intro
  // ne s'affiche de toute façon jamais (voir globals.css) : on ignore le
  // verrou si le viewport est déjà en largeur desktop.
  useEffect(() => {
    if (step !== "intro") return;
    if (window.matchMedia("(min-width: 981px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [step]);

  return (
    <>
      {step === "intro" && (
        <div className="login-mobile-intro">
          <div className="login-ambient a" aria-hidden="true" />
          <div className="login-ambient c" aria-hidden="true" />
          <div className="login-orb two" aria-hidden="true" />

          <Image
            src="/images/logo.svg"
            alt="Logo LIIVRE MOI"
            width={48}
            height={48}
            className="login-logo"
          />

          <div className="login-left-copy">
            <h1 className="login-h1">
              Créé votre compte  <span> en toute simplicité</span>.
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setStep("form")}
            className="login-submit login-mobile-continue"
          >
            Commencer <span>→</span>
          </button>

          <div className="login-shape one" aria-hidden="true" />
        </div>
      )}

      <div className={`login-right ${step === "form" ? "" : "is-hidden-mobile"}`}>
        <div className="login-form-wrap">{children}</div>
      </div>
    </>
  );
}
