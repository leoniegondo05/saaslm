"use client";

import { useEffect, useRef, useState } from "react";
import type { BoutiqueIdentite } from "@/lib/boutique-types";
import type { EnteteState, PageId } from "@/app/components/dashboard-reglages/personnaliser/types";
import { LuSearch } from "react-icons/lu";
import CartBadge from "./CartBadge";
import { LienBoutique, useBoutiqueRouter } from "./PreviewMode";

const TAILLE_LOGO: Record<EnteteState["tailleLogo"], number> = { s: 30, m: 36, l: 46 };

/*
  En-tête de la boutique publique — port fidèle de la case "entete" de
  BoutiquePreview.tsx (cf. rapport de tâche "site public identique au
  preview") : logo+nom (position gauche/centre, ordinateur/téléphone
  distincts), recherche barre/icône, panier avec pulsation à l'ajout, icône
  compte, bouton "Nous écrire", mode transparent-sur-hero avec bascule au
  défilement, `resteVisible` (toujours / en remontant — simplifié en sticky
  classique, même simplification assumée que l'éditeur : "reste honnête sur
  la position, pas sur la nuance d'apparition/disparition au sens du
  défilement") / non (scrolle avec la page).

  "Compte" et "Nous écrire" restent des icônes/bouton purement visuels : ni
  compte client ni canal de contact (téléphone/WhatsApp) n'existe encore
  dans BoutiqueIdentite (cf. mémoire [[dashboard-mock-data-pending-laravel-api]]) —
  cohérent avec le reste du site public, qui n'invente jamais de donnée.
*/
export default function BoutiqueHeader({
  slug,
  identite,
  entete,
  page,
  rechercheInitiale = "",
}: {
  slug: string;
  identite: BoutiqueIdentite;
  entete: EnteteState;
  page: PageId;
  /** Terme déjà tapé (repris de `?q=` sur la page accueil, cf.
   *  app/boutique/[slug]/page.tsx) — pour que le champ ne se vide pas si le
   *  header se ré-affiche (ex. après navigation) alors qu'un filtre est actif. */
  rechercheInitiale?: string;
}) {
  const router = useBoutiqueRouter();
  const transparentSurHero = entete.transparentSurHero && page === "accueil";
  const [defile, setDefile] = useState(false);
  const [rechercheDepliee, setRechercheDepliee] = useState(false);
  const rechercheRef = useRef<HTMLInputElement>(null);

  // Un seul des 3 rendus de champ recherche existe à la fois (barre fixe /
  // icône dépliée / bouton icône seul, cf. `entete.rechercheStyle` plus bas) :
  // même gestionnaire Entrée pour les 3, navigue vers la grille de la page
  // accueil avec le terme en `?q=` — SectionGrille (page accueil) lit ce
  // paramètre et filtre les produits par nom, cf. app/boutique/[slug]/page.tsx.
  // Un simple <input type="search"> sans state ni onChange ne servait à rien
  // avant ce correctif (retour utilisateur : "la barre de recherche...doit
  // fonctionner").
  const lancerRecherche = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const valeur = event.currentTarget.value.trim();
    const query = valeur ? `?q=${encodeURIComponent(valeur)}` : "";
    router.push(`/boutique/${slug}${query}#grille`);
  };

  useEffect(() => {
    if (!transparentSurHero) return;
    const onScroll = () => setDefile(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentSurHero]);

  const transparentActif = transparentSurHero && !defile;
  const positionLogo = entete.positionLogo; // ordinateur
  const positionLogoMobile = entete.positionLogoMobile;
  const tailleLogo = TAILLE_LOGO[entete.tailleLogo];

  const initiales =
    identite.nom
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((mot) => mot[0]?.toUpperCase())
      .join("") || "?";

  const texteCouleur = transparentActif ? "#fff" : "var(--tx)";

  // Mode transparent-sur-hero : le header garde sa place dans le flux
  // (sticky) mais une marge basse négative égale à sa propre hauteur "avale"
  // l'espace qu'il occupe, pour que la grande image commence à y=0 et
  // apparaisse "derrière" lui — sans ce repli, le header transparent
  // n'aurait rien à laisser transparaître (juste le fond de page).
  // Hauteur fixe (76px) pendant que ce mode est actif, seule la couleur
  // change au défilement (`defile`), pour ne jamais faire sauter la mise en
  // page une fois ce repli appliqué.
  return (
    <header
      className={`z-40 w-full transition-colors duration-200 ${
        entete.resteVisible === "non" ? "relative" : "sticky top-0"
      } ${transparentSurHero ? "h-[76px] -mb-[76px]" : ""} ${
        transparentActif ? "bg-transparent" : "border-b border-[var(--tx)]/10 bg-[var(--bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/85"
      }`}
      style={{ color: texteCouleur }}
    >
      <div
        className={`mx-auto flex h-full max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 ${
          positionLogo === "centre" ? "sm:justify-center" : ""
        } ${positionLogoMobile === "centre" ? "justify-center" : "justify-start"}`}
      >
        <LienBoutique href={`/boutique/${slug}`} className={`flex shrink-0 items-center gap-2.5 ${positionLogo === "centre" ? "sm:absolute sm:left-1/2 sm:-translate-x-1/2" : ""}`}>
          {identite.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={identite.logo} alt={identite.nom} className="shrink-0 rounded-full object-cover" style={{ width: tailleLogo, height: tailleLogo }} />
          ) : (
            <span
              className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
              style={{ width: tailleLogo, height: tailleLogo, background: "var(--ac)", fontSize: tailleLogo * 0.38 }}
            >
              {initiales}
            </span>
          )}
          {entete.nomAvecLogo && (
            <span className="max-w-[140px] truncate text-[16px] font-bold sm:max-w-none" style={{ fontFamily: "var(--font-titre)" }}>
              {identite.nom}
            </span>
          )}
        </LienBoutique>

        {entete.menuLiens.length > 0 && (
          <nav className="ml-4 hidden items-center gap-4 md:flex">
            {entete.menuLiens.map((lien) => (
              <LienBoutique
                key={lien.label}
                href={lien.label.trim().toLowerCase() === "accueil" ? `/boutique/${slug}` : `/boutique/${slug}#grille`}
                className="flex items-center gap-1 whitespace-nowrap text-[13.5px] font-medium opacity-90 transition hover:opacity-100"
              >
                {lien.label}
                {typeof lien.compteur === "number" && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ background: transparentActif ? "rgba(255,255,255,.2)" : "color-mix(in srgb, var(--ac) 14%, transparent)", color: transparentActif ? "#fff" : "var(--ac)" }}
                  >
                    {lien.compteur}
                  </span>
                )}
              </LienBoutique>
            ))}
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {entete.rechercheStyle === "barre" ? (
            <label className="relative block max-w-[120px] sm:max-w-[220px]">
              <span className="sr-only">Rechercher un produit</span>
              <LuSearch color={transparentActif ? "rgba(255,255,255,.7)" : "var(--tx)"} size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                ref={rechercheRef}
                type="search"
                defaultValue={rechercheInitiale}
                onKeyDown={lancerRecherche}
                placeholder="Rechercher…"
                className="w-full rounded-full py-2 pl-8 pr-3 text-[13px] outline-none transition"
                style={{
                  background: transparentActif ? "rgba(255,255,255,.16)" : "color-mix(in srgb, var(--tx) 5%, transparent)",
                  color: texteCouleur,
                }}
              />
            </label>
          ) : rechercheDepliee ? (
            <label className="relative block">
              <input
                ref={rechercheRef}
                autoFocus
                type="search"
                defaultValue={rechercheInitiale}
                onKeyDown={lancerRecherche}
                onBlur={() => setRechercheDepliee(false)}
                placeholder="Rechercher…"
                className="w-28 rounded-full px-3 py-2 text-[13px] outline-none sm:w-40"
                style={{ background: "color-mix(in srgb, var(--tx) 5%, transparent)", color: texteCouleur }}
              />
            </label>
          ) : (
            <button
              type="button"
              aria-label="Rechercher"
              onClick={() => setRechercheDepliee(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--tx)]/5"
            >
              <LuSearch color={texteCouleur} size={16} />
            </button>
          )}



          {entete.nousEcrire && (
            <span
              className="hidden whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-semibold sm:inline-flex"
              style={{ background: "var(--ac)", color: "#fff", borderRadius: "var(--rad)" }}
            >
              Nous écrire
            </span>
          )}

          <CartBadge slug={slug} panierStyle={entete.panierStyle} couleur={texteCouleur} />
        </div>
      </div>
    </header>
  );
}
