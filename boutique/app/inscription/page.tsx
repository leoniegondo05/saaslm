import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import InscriptionMobileFlow from "../components/InscriptionMobileFlow";
import InscriptionForm from "../components/InscriptionForm";

export const metadata: Metadata = {
  title: "Inscription — LIIVRE MOI",
  description: "Créez votre compte pour lancer votre boutique LIIVRE MOI.",
};

/*
  Page d'inscription — même habillage "verre dépoli" que app/login/page.tsx
  (repris de test.html, voir globals.css ".login-*"). Contenu et
  disposition du formulaire inchangés (nom, téléphone, e-mail + code,
  mot de passe + confirmation, puis CGU, puis confirmation — voir
  InscriptionForm.tsx) ; même accroche ("Bienvenue sur LIIVRE MOI" +
  "Ici commence votre indépendance commerciale."), même titre
  "Inscription", même sous-titre, même mécanique mobile
  (InscriptionMobileFlow : écran d'intro avec "Commencer" avant
  d'afficher le formulaire). Seul l'habillage visuel change.
*/
export default function InscriptionPage() {
  return (
    <main className="login-page">
      <div className="login-ambient a" aria-hidden="true" />
      <div className="login-ambient b" aria-hidden="true" />
      <div className="login-ambient c" aria-hidden="true" />
      <div className="login-orb" aria-hidden="true" />
      <div className="login-orb two" aria-hidden="true" />

      <section className="login-card">
        {/* ── Colonne visuel ── desktop uniquement (981px+) ; sur mobile,
            InscriptionMobileFlow affiche son propre écran d'intro avec le
            même contenu (voir plus bas). */}
        <div className="login-left">
          <Image
            src="/images/logo.svg"
            alt="Logo LIIVRE MOI"
            width={58}
            height={58}
            className="login-logo"
          />

          <div className="login-left-copy">
            <h1 className="login-h1">
              Créé votre compte  <span> en toute simplicité</span>.
            </h1>
          </div>

          <div className="login-shape one" aria-hidden="true" />
          <div className="login-shape two" aria-hidden="true" />
        </div>

        {/* ── Colonne formulaire ── */}
        <InscriptionMobileFlow>
          <Link href="/" aria-label="Retour au site" className="login-back">
            ←
          </Link>

          <p className="login-form-subtitle">
            Créé votre compte  <span> en toute simplicité</span>.
          </p>

          <InscriptionForm />
        </InscriptionMobileFlow>
      </section>
    </main>
  );
}
