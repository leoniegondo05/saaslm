import { LienBoutique } from "./PreviewMode";
import type { PromoState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { ProduitPublic } from "@/lib/boutique-types";
import { texteAvecChiffres } from "@/lib/boutique-format";
import { FeuilleDecor } from "./Icons";

/*
  Bannière d'offre — port de la case "promo" : illustration produit (photo
  réelle du produit vedette, masque radial), feuilles décoratives, "Jusqu'au
  <finOffre>". Le compte à rebours chiffré de l'éditeur (`compteur`, "02
  jours 14 h 36 min 08 s") est une démonstration statique dans
  BoutiquePreview.tsx, pas une vraie donnée temporelle exploitable ici
  (`finOffre` est un texte libre, pas une date structurée) — plutôt que
  d'afficher un décompte figé et trompeur sur le site public, ce réglage
  n'ajoute ici que le texte "Jusqu'au…" déjà présent, cf. rapport de tâche.
  `promo.image`, quand le marchand en a importé une, prime sur la photo du
  produit vedette — même priorité que hero.imageProduit (SectionHero.tsx).
*/
export default function SectionPromo({ slug, promo, produitVedette }: { slug: string; promo: PromoState; produitVedette?: ProduitPublic }) {
  const inverse = promo.cote === "droite";
  const fond = promo.fond === "nuit" ? "linear-gradient(160deg,#170A22,#0B0E1C 65%)" : "linear-gradient(120deg, var(--ac), color-mix(in srgb, var(--ac) 40%, black))";
  // "rayon-offres"/"tous-les-produits" retombent sur la grille produits de
  // la page : pas encore de page de rayon dédiée ni de catalogue séparé
  // (cf. rapport de tâche). "personnalise" doit utiliser l'URL saisie par
  // le marchand — sans ça le bouton n'avait nulle part où aller.
  const lien =
    promo.lienBouton === "accueil"
      ? `/boutique/${slug}`
      : promo.lienBouton === "personnalise"
        ? promo.lienPersonnalise || `/boutique/${slug}#grille`
        : `/boutique/${slug}#grille`;
  const image = promo.image ?? produitVedette?.images?.[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div
        className={`flex flex-col items-start gap-6 overflow-hidden p-7 text-left text-white sm:p-10 md:items-center md:gap-14 ${
          inverse ? "md:flex-row-reverse" : "md:flex-row"
        }`}
        style={{ borderRadius: "var(--card-rad)", background: fond }}
      >
        {image && (
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl sm:h-52 sm:w-52">
            <FeuilleDecor className="absolute left-2 top-0 h-20 w-12 -rotate-12" opacity={0.18} />
            <FeuilleDecor className="absolute right-2 top-3 h-16 w-10 rotate-[18deg]" color="#F5C1DC" opacity={0.35} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="relative h-full w-full object-cover"
              style={{ maskImage: "radial-gradient(circle, #000 55%, transparent 100%)", WebkitMaskImage: "radial-gradient(circle, #000 55%, transparent 100%)" }}
            />
          </div>
        )}
        <div className={`min-w-0 flex-1 ${inverse ? "md:text-right" : "md:text-left"}`}>
          {promo.petitTexte && <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/85">{promo.petitTexte}</span>}
          <h3 className="mt-2 max-w-xl text-[24px] font-extrabold leading-tight sm:text-[29px]" style={{ fontFamily: "var(--font-titre)" }}>
            {texteAvecChiffres(promo.titre)}
          </h3>
          {promo.sousTitre && <p className="mt-1.5 max-w-lg text-[14px] text-white/85">{promo.sousTitre}</p>}
          {promo.finOffre && <p className="mt-1 text-[12px] text-white/65">{texteAvecChiffres(`Jusqu'au ${promo.finOffre}`)}</p>}
          {promo.boutonTexte && (
            <LienBoutique
              href={lien}
              className="mt-4 inline-flex items-center px-5 py-2.5 text-[13.5px] font-bold transition hover:brightness-95"
              style={{ background: "#fff", color: "var(--ac)", borderRadius: "var(--rad)" }}
            >
              {promo.boutonTexte}
            </LienBoutique>
          )}
        </div>
      </div>
    </section>
  );
}
