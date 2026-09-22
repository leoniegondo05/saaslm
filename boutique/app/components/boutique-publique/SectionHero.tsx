import { LienBoutique } from "./PreviewMode";
import type { CSSProperties, ReactNode } from "react";
import type { HeroState, StyleState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { ProduitPublic } from "@/lib/boutique-types";
import { texteAvecChiffres } from "@/lib/boutique-format";
import { ChevronRightIcon, Etoiles, GridIcon, HaloRayons } from "./Icons";

const MIN_HAUTEUR: Record<HeroState["hauteur"], number> = { s: 340, m: 420, l: 520 };

/** Découpe `titre` en lignes (`\n`) et met `motValorise` en évidence (1re
 *  occurrence par ligne, insensible à la casse) — port de TitreAvecMotValorise
 *  dans BoutiquePreview.tsx. */
function titreMisEnValeur(titre: string, mot: string, couleur: string): ReactNode {
  const lignes = titre.split("\n");
  return lignes.map((ligne, i) => {
    const idx = mot.trim() ? ligne.toLowerCase().indexOf(mot.toLowerCase()) : -1;
    return (
      <span key={i} className="block">
        {idx === -1 ? (
          ligne
        ) : (
          <>
            {ligne.slice(0, idx)}
            <span style={{ color: couleur }}>{ligne.slice(idx, idx + mot.length)}</span>
            {ligne.slice(idx + mot.length)}
          </>
        )}
      </span>
    );
  });
}

/*
  Grande image / hero de l'accueil — port fidèle de la case "grande-image" de
  BoutiquePreview.tsx : badge + titre avec mot valorisé, sous-titre, 1-2
  boutons, photo produit avec masque radial + badge remise + carte note, et
  décoration "Halo" (courbes lumineuses) quand `style.modele === "halo"`.
  Dégradé/uni construits à partir de --ac (couleur du marchand), comme
  l'éditeur. `hero.sousTitre` pilote maintenant vraiment le sous-titre (champ
  éditeur ajouté à HeroState) ; `hero.imageProduit`, quand le marchand en a
  importé une, prime sur la photo du `produitVedette` (premier produit réel
  de la boutique) — même priorité que BoutiquePreview.tsx (`h.imageProduit ??
  photo par défaut`). `noteMoyenne`/`avisCount` agrégés sur les produits réels
  (pas de note inventée) — la carte "note" ne s'affiche que si au moins un
  produit a une note.
*/
export default function SectionHero({
  slug,
  hero,
  style,
  remiseEnLignePct,
  produitVedette,
  noteMoyenne,
  avisCount,
}: {
  slug: string;
  hero: HeroState;
  style: StyleState;
  remiseEnLignePct: number;
  produitVedette?: ProduitPublic;
  noteMoyenne: number | null;
  avisCount: number;
}) {
  const isHalo = style.modele === "halo";
  const inverse = hero.imagePosition === "gauche";
  const centree = hero.imagePosition === "centre";
  const centreTexte = centree || hero.texteAlign === "centre";
  const minH = MIN_HAUTEUR[hero.hauteur];
  const sombre = hero.typeFond !== "degrade" || isHalo;
  const textColor = sombre ? "#fff" : "var(--tx)";
  const couleurEtoiles = style.etoilesCouleur === "principale" ? "var(--ac)" : "#F2A93B";

  const fonds: Record<HeroState["typeFond"], CSSProperties["background"]> = {
    degrade: isHalo ? "linear-gradient(135deg, var(--ac) 45%, #6B21D6 78%, #0B0E1C)" : "color-mix(in srgb, var(--ac) 8%, var(--bg))",
    uni: "var(--ac)",
    photo: "linear-gradient(160deg, rgba(11,14,28,.65), rgba(11,14,28,.35)), linear-gradient(135deg, #6B21D6, #0B0E1C)",
  };
  const styleFond: CSSProperties =
    hero.typeFond === "photo" && hero.image
      ? { backgroundImage: `linear-gradient(160deg, rgba(11,14,28,.55), rgba(11,14,28,.25)), url(${hero.image})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: fonds[hero.typeFond] };

  const imageProduitDefaut = produitVedette?.images?.[0];
  const imageProduitDefautAlt = produitVedette?.images?.[hero.imageDifferenteSurTelephone ? 1 : 0] ?? imageProduitDefaut;
  const image = hero.imageProduit ?? imageProduitDefaut;
  const imageAlt = hero.imageProduit ?? imageProduitDefautAlt;

  return (
    <section id="grande-image" className="relative overflow-hidden px-5 pb-16 pt-24 sm:px-10 sm:pt-28 lg:px-16" style={{ minHeight: minH, ...styleFond, color: textColor }}>
      {hero.courbesLumineuses && isHalo && <HaloRayons idSuffix="-hero" />}
      <div
        className={`relative mx-auto flex h-full max-w-6xl gap-8 ${
          centree ? "flex-col items-center text-center" : `flex-col items-start sm:items-center ${inverse ? "sm:flex-row-reverse" : "sm:flex-row"}`
        }`}
        style={{ maxWidth: hero.imagePosition === "centre" ? 720 : undefined }}
      >
        <div className={`min-w-0 flex-1 ${centreTexte ? "flex flex-col items-center text-center" : ""}`}>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{ background: sombre ? "rgba(255,255,255,.16)" : "color-mix(in srgb, var(--ac) 14%, transparent)", color: sombre ? "#fff" : "var(--ac)" }}
          >
            {texteAvecChiffres(hero.petitTexte)}
          </span>
          <h1
            className="mt-3 max-w-xl text-[32px] leading-[1.08] sm:text-[38px] lg:text-[46px]"
            style={{
              fontFamily: "var(--font-titre)",
              fontWeight: "var(--titre-graisse)" as unknown as number,
              letterSpacing: "var(--titre-espacement)",
              textTransform: "var(--titre-majuscules)" as CSSProperties["textTransform"],
            }}
          >
            {titreMisEnValeur(hero.titre, hero.motValorise, sombre ? "#FF7AC0" : "var(--ac)")}
          </h1>
          {hero.sousTitre && (
            <p className="mt-3 max-w-md text-[15px]" style={{ opacity: sombre ? 0.85 : 0.65 }}>
              {texteAvecChiffres(hero.sousTitre)}
            </p>
          )}
          <div className={`mt-6 mb-2 flex flex-wrap gap-3 ${centreTexte ? "justify-center" : ""}`}>
            {hero.bouton1Texte && (
              <LienBoutique
                href={`/boutique/${slug}#grille`}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-[13px] font-bold transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: sombre ? "#fff" : "var(--ac)", color: sombre ? "#0B0E1C" : "#fff", borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as CSSProperties["textTransform"] }}
              >
                {hero.bouton1Texte}
                <ChevronRightIcon color={sombre ? "#0B0E1C" : "#fff"} />
              </LienBoutique>
            )}
            {hero.boutons === 2 && hero.bouton2Texte && (
              <LienBoutique
                href={`/boutique/${slug}#grille`}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-[13px] font-bold transition hover:bg-white/10"
                style={{
                  borderWidth: "var(--btn-border)",
                  borderStyle: "solid",
                  borderColor: sombre ? "rgba(255,255,255,.5)" : "var(--ac)",
                  color: textColor,
                  borderRadius: "var(--rad)",
                  textTransform: "var(--btn-uppercase)" as CSSProperties["textTransform"],
                }}
              >
                {hero.bouton2Texte}
                <GridIcon color={textColor} />
              </LienBoutique>
            )}
          </div>
        </div>

        {image && !centree && (
          <div
            className={`relative flex shrink-0 items-center justify-center ${inverse ? "sm:translate-x-28" : "sm:-translate-x-28"}`}
            style={{ height: minH * 0.55, width: minH * 0.55, maxWidth: 320, maxHeight: 320 }}
          >
            <picture className="block h-full w-full overflow-hidden rounded-[28px]">
              <source media="(max-width: 639px)" srcSet={imageAlt} />
              <img
                src={image}
                alt={produitVedette?.nom ?? ""}
                className="h-full w-full object-cover"
                style={{ maskImage: "radial-gradient(circle, #000 55%, transparent 100%)", WebkitMaskImage: "radial-gradient(circle, #000 55%, transparent 100%)" }}
              />
            </picture>
            {hero.badge && remiseEnLignePct > 0 && (
              <span className="absolute -right-3 -top-3 flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-full bg-white text-center shadow-[0_10px_24px_-6px_rgba(11,14,28,0.35)]">
                <span className="text-[15px] font-figures-bold leading-none" style={{ color: "var(--ac)" }}>
                  −{remiseEnLignePct} %
                </span>
                <span className="px-1.5 text-[7.5px] font-semibold leading-[1.15]" style={{ color: "rgba(20,18,32,.55)" }}>
                  en payant en ligne
                </span>
              </span>
            )}
            {hero.note && noteMoyenne != null && (
              <span className="absolute -bottom-3 -left-3 flex flex-col items-start gap-1 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_10px_24px_-6px_rgba(11,14,28,0.35)]">
                <Etoiles note={noteMoyenne} taille={12} couleur={couleurEtoiles} />
                <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-[13px] font-figures-bold text-[#0B0E1C]">{noteMoyenne.toFixed(1)}</span>
                  <span className="text-[9px] font-medium" style={{ color: "rgba(20,18,32,.5)" }}>
                    {texteAvecChiffres(`${avisCount} avis clients`)}
                  </span>
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
