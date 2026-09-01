import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import PartenaireAgreeLanding from "../components/partenaire-agree/PartenaireAgreeLanding";

export const metadata: Metadata = {
  title: "Partenaire agréé LM — LIIVRE MOI",
  description:
    "Rejoignez le réseau LM. Une plateforme pour piloter toute votre exploitation, et des e-commerçants à servir.",
};

/*
  Page liée depuis "Partenaire agréé LM" dans la barre de navigation
  (voir NAV_LINKS dans Navbar.tsx) — remplace l'ancien formulaire direct
  par la page de présentation complète du réseau de partenaires, fidèle à
  la maquette partenaire-agree-lm.html fournie par l'utilisateur (voir
  PartenaireAgreeLanding.tsx et partenaire-agree.module.css). Le bouton
  "Devenir partenaire agréé" de VisionStatement.tsx pointe vers cette même
  page, qui ouvre elle-même le panneau de candidature.

  <Navbar /> partagé du site, posé par-dessus le dégradé du heros — comme
  toutes les autres pages (voir vision/page.tsx).
*/
export default function PartenaireAgreePage() {
  return (
    <>
      <Navbar />
      <PartenaireAgreeLanding />
    </>
  );
}
