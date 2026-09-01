import type { Metadata } from "next";
import CreerEspaceForm from "../components/CreerEspaceForm";
import CreerEspaceIllustration from "../components/CreerEspaceIllustration";

export const metadata: Metadata = {
  title: "Créer mon espace — Entreprise agréée LM",
  description: "Créez votre compte responsable pour ouvrir votre espace partenaire agréé LM.",
};

/*
  Page destination du bouton "Créer mon espace" du mail de validation
  partenaire (courrier-validation-partenaire-lm.html, {{lien_creation_compte}}),
  envoyé une fois le dossier de app/partenaire-agree/page.tsx accepté
  côté admin.

  Reproduction pixel de la maquette creation-compte-entreprise-agreee-lm.html
  fournie par l'utilisateur : écran plein cadre en deux colonnes (formulaire
  à gauche / panneau illustré "carte" à droite), sans Navbar/Footer du site
  (absents de la maquette d'origine — univers visuel propre à ce parcours,
  comme app/partenaire-agree/page.tsx et sa variante sombre). D'où le
  wrapper bg-[#FAF7FC] text-[#0B1030] min-h-screen : il recouvre le
  bg-brand-bg sombre posé sur <body> par app/layout.tsx pour toutes les
  pages du site.

  email/entreprise portés par le lien en query string (?email=...&entreprise=...&token=...),
  transmis à CreerEspaceForm comme valeur initiale des champs
  correspondants. Pas de vérification du token pour l'instant : aucune
  route API ne l'émet ni ne le valide encore côté backend (voir le
  commentaire en tête de CreerEspaceForm.tsx pour l'endroit exact où la
  brancher). D'ici là, la page reste accessible directement pour
  prévisualiser le flux.
*/
export default async function CreerEspacePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; entreprise?: string; token?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";
  const entreprise = params.entreprise ?? "";

  return (
    // Breakpoints (900px / 1240px) et ordre repris à l'identique de .ecran
    // dans la maquette : panneau au-dessus du formulaire (order -1) et sous-
    // titre masqué sous 900px, deux colonnes côte à côte au-delà.
    <div className="grid min-h-screen bg-[#FAF7FC] text-[#0B1030] min-[901px]:grid-cols-2">
      {/* .zone — colonne formulaire (à gauche) */}
      <section className="flex flex-col justify-center px-[22px] py-9 min-[901px]:px-[34px] min-[901px]:py-10 min-[1241px]:px-[62px] min-[1241px]:py-12">
        <CreerEspaceForm email={email} entreprise={entreprise} />
      </section>

      {/* .panneau — colonne illustrée (à droite sur desktop, en haut sur mobile) */}
      <section className="relative order-first flex flex-col justify-center overflow-hidden rounded-[28px] bg-[#EDE8F7] py-10 min-[901px]:order-none min-[901px]:m-5 min-[901px]:ml-0 min-[901px]:py-14 min-[1241px]:py-14">
        <div className="px-8 pb-2 min-[1241px]:px-[54px] min-[1241px]:pb-3">
          <h1 className="max-w-[22ch] text-[26px] font-bold leading-[1.16] tracking-[-0.035em] min-[901px]:max-w-[16ch] min-[901px]:text-[clamp(28px,2.5vw,40px)]">
            Ici commence votre réseau.
          </h1>
          <p className="mt-[14px] hidden max-w-[34ch] text-base text-[#6E6880] min-[901px]:block">
            Vos entrepôts, vos livreurs et vos boutiques, réunis dans un seul espace.
          </p>
        </div>
        <CreerEspaceIllustration className="mt-[28px] block h-auto w-full" />
      </section>
    </div>
  );
}
