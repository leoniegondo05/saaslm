import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import LoginMobileFlow from "../components/LoginMobileFlow";
import LoginForm from "../components/LoginForm";

export const metadata: Metadata = {
  title: "Connexion — LIIVRE MOI",
  description: "Connectez-vous pour gérer votre boutique LIIVRE MOI.",
};

/*
  Page de connexion — habillage "verre dépoli" repris de test.html
  (maquette réalisée par l'utilisateur avec ChatGPT, voir globals.css
  ".login-*"). Accroche visuelle alignée sur celle de l'inscription
  ("Ici commence votre indépendance commerciale.", demande explicite de
  l'utilisateur) ; même titre "Connexion", même sous-titre, mêmes liens —
  et même mécanique mobile (LoginMobileFlow : écran d'intro avec
  "Continuer" avant d'afficher le formulaire, colonne visuel masquée
  sous 981px). Seul l'habillage visuel + cette accroche changent ; le
  reste du contenu/de la disposition du formulaire est inchangé.
*/
export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-ambient a" aria-hidden="true" />
      <div className="login-ambient b" aria-hidden="true" />
      <div className="login-ambient c" aria-hidden="true" />
      <div className="login-orb" aria-hidden="true" />
      <div className="login-orb two" aria-hidden="true" />

      <section className="login-card">
        {/* ── Colonne visuel ── desktop uniquement (981px+) ; sur mobile,
            LoginMobileFlow affiche son propre écran d'intro avec le même
            contenu (voir plus bas). */}
        <div className="login-left">
          <Image
            src="/images/logo.svg"
            alt="Logo LIIVRE MOI"
            width={58}
            height={58}
            className="login-logo"
          />

          <div className="login-left-copy">
            <h3 className="login-h1">
              Ici commence votre <span>indépendance commerciale</span>.
            </h3>
          </div>

          <div className="login-shape one" aria-hidden="true" />
          <div className="login-shape two" aria-hidden="true" />
        </div>

        {/* ── Colonne formulaire ── */}
        <LoginMobileFlow>
          <Link href="/" aria-label="Retour au site" className="login-back">
            ←
          </Link>

          <LoginForm />
        </LoginMobileFlow>
      </section>
    </main>
  );
}
