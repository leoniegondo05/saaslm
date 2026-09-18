"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { texteAvecChiffres } from "../../dashboard-accueil/shared";
import type { EditeurState, PageId, SectionId } from "./types";
import { AVIS_APERCU, CATEGORIES_APERCU, PRODUIT_APERCU, PRODUITS_GRILLE_APERCU, SECTIONS_DEFAUT } from "./types";

/*
  Aperçu en direct de la boutique, tel que le client la verrait — reflète
  `state` (sections visibles, ordre, style, réglages de chaque section) sans
  aller-retour serveur : tout se voit à l'écran dès qu'un réglage change,
  avant même "Enregistrer" (cf. PersonnaliserBoutique.tsx, "modifications en
  attente").

  Deux pages simulées (`page`, cf. commentaire de PageId dans types.ts) :
  "accueil" (grande image, catégories, grille de produits…) et "commande",
  toujours celle d'un seul produit ("Sérum éclat 30 ml", choisi dans la
  barre du haut) plutôt qu'un site à onglets — c'est ce que "Personnaliser
  ma boutique" habille en premier, la page qu'un client ouvre depuis un lien
  produit.
*/

const boutonRadius: Record<string, string> = { carre: "6px", arrondi: "12px", pilule: "999px" };
const OMBRE_CARTE: Record<string, string> = { aucune: "none", legeres: "0 10px 24px -12px rgba(11,14,28,.3)", marquees: "0 18px 34px -10px rgba(11,14,28,.5)" };
const ESPACE_SECTION: Record<string, string> = { serre: "0px", normal: "10px", aere: "22px" };
const MARGE_SECTION: Record<"petites" | "moyennes" | "grandes", number> = { petites: 4, moyennes: 14, grandes: 28 };

// Onglet Style · Mouvements — "Effet au survol" (page) et "Animation" du
// bouton de commande (cf. StyleReglages.tsx, MouvementsReglages).
function classeEffetSurvol(effet: EditeurState["mouvements"]["effetSurvol"], brightness: string): string {
  if (effet === "aucun") return "";
  const transform = effet === "zoom" ? "hover:scale-105" : "hover:-translate-y-0.5";
  return `transition ${transform} ${brightness}`;
}

function classeAnimationBoutonCommande(animation: EditeurState["mouvements"]["boutonCommandeAnimation"]): string {
  if (animation === "pulsation") return "animate-pulse";
  if (animation === "vibration") return "animate-[dashboard-preview-vibrer_0.4s_ease-in-out_infinite]";
  return "";
}

// Onglet Style · Textes — deux polices de la charte graphique LM seulement
// (Sora, Bricolage Grotesque : cf. CHARTE_GRAPHIQUE.md et types.ts/TexteState).
// Même graisse/interlettrage pour "Moderne" et "Élégante" (cf. capture
// utilisateur du 2026-09-18 : gras et serré dans les deux cas) — seule la
// police change entre les deux, pas l'intensité du style.
const FONT_TITRES: Record<string, string> = { moderne: "var(--font-bricolage)", elegante: "var(--font-sora)" };
const FONT_CORPS: Record<string, string> = { Sora: "var(--font-sora)", "Bricolage Grotesque": "var(--font-bricolage)" };
const TAILLE_TEXTE_BASE: Record<string, string> = { petite: "12.5px", moyenne: "13.5px", grande: "14.5px" };
const TITRE_GRAISSE: Record<string, number> = { demi: 600, gras: 800 };
const TITRE_ESPACEMENT: Record<string, string> = { serre: "-0.01em", normal: "normal" };

export default function BoutiquePreview({
  state,
  device,
  page,
  boutiqueNom,
  logo,
  sectionChoisie,
  onChoisirSection,
}: {
  state: EditeurState;
  device: "phone" | "desktop";
  page: PageId;
  boutiqueNom: string;
  logo: string | null;
  sectionChoisie?: SectionId;
  onChoisirSection?: (id: SectionId) => void;
}) {
  const { t } = useDashboardLangue();
  const { style, texte } = state;
  let visibles = state.sections
    .filter((s) => s.visible)
    .map((s) => s.id)
    .filter((id) => {
      const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
      return def.page === "les-deux" || def.page === page;
    });

  // "Position dans la page" de "confiance" n'est plus un champ séparé (cf.
  // types.ts, positionConfianceActuelle/placerConfiance) : c'est l'ordre de
  // "confiance" dans `state.sections` lui-même, donc Monter/Descendre et ce
  // réglage agissent tous deux sur la même donnée et restent synchronisés
  // avec l'aperçu — pas de logique de repositionnement à part ici.

  // "Position dans la page" de "categories" (réglage propre à cette section, cf. CategoriesState).
  if (visibles.includes("categories")) {
    const sansCategories = visibles.filter((id) => id !== "categories");
    const ancre: SectionId =
      state.categories.position === "apres-grande-image"
        ? "grande-image"
        : state.categories.position === "apres-produits"
          ? "grille"
          : "pied-de-page";
    const avant = state.categories.position === "avant-pied-de-page";
    const indexAncre = sansCategories.indexOf(ancre);
    if (indexAncre !== -1) {
      const insertion = avant ? indexAncre : indexAncre + 1;
      visibles = [...sansCategories.slice(0, insertion), "categories", ...sansCategories.slice(insertion)];
    }
  }

  // "Fond du site · Apparence" (onglet Style · Couleurs) force le fond/texte
  // globaux, indépendamment du modèle choisi — bascule manuelle au-dessus
  // du fond/texte propres au modèle (couleurFond/couleurTexte).
  const fondEffectif = style.apparence === "sombre" ? "#141220" : style.couleurFond;
  const texteEffectif = style.apparence === "sombre" ? "#FFFFFF" : style.couleurTexte;

  const vars: React.CSSProperties = {
    ["--ac" as string]: style.couleurPrincipale,
    ["--bg" as string]: fondEffectif,
    ["--tx" as string]: texteEffectif,
    ["--rad" as string]: boutonRadius[style.boutonForme],
    ["--btn-uppercase" as string]: style.boutonTexteMajuscules ? "uppercase" : "none",
    ["--btn-border" as string]: style.epaisseurContour === "epaisse" ? "2.5px" : "1.5px",
    ["--card-shadow" as string]: OMBRE_CARTE[style.ombres],
    ["--section-gap" as string]: ESPACE_SECTION[style.espacementSections],
    ["--font-titre" as string]: FONT_TITRES[texte.titresPolice],
    ["--font-corps" as string]: FONT_CORPS[texte.texteCourantPolice],
    ["--titre-graisse" as string]: TITRE_GRAISSE[texte.graisseTitres],
    ["--titre-espacement" as string]: TITRE_ESPACEMENT[texte.espacementLettres],
    ["--titre-majuscules" as string]: texte.titresMajuscules ? "uppercase" : "none",
    background: fondEffectif,
    color: texteEffectif,
    fontFamily: "var(--font-corps)",
  };

  const contenu = (
    <div
      style={{
        ...vars,
        fontSize: TAILLE_TEXTE_BASE[texte.tailleTexte],
        paddingLeft: device === "desktop" && style.largeurOrdinateur === "large" ? 0 : device === "desktop" ? 48 : undefined,
        paddingRight: device === "desktop" && style.largeurOrdinateur === "large" ? 0 : device === "desktop" ? 48 : undefined,
      }}
      className="leading-tight"
    >
      {visibles.map((id, i) => {
        const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
        const sec = state.sections.find((s) => s.id === id)!;
        if (device === "phone" && !sec.visibleTelephone) return null;
        if (device === "desktop" && !sec.visibleOrdinateur) return null;
        const selectionnee = id === sectionChoisie;
        // Bandeau ignore les réglages génériques (Largeur/Marges/Couleurs) :
        // toujours plein-bord, sans marge, avec sa propre couleur (cf. "Affichage"
        // dans Corps ci-dessus) — pas de "Pour cette section" pour lui non plus.
        const margeVerticale = id === "bandeau" ? 0 : MARGE_SECTION[sec.marges];
        const largeurInset = id === "bandeau" ? 0 : sec.largeur === "page" ? (device === "phone" ? 12 : 28) : 0;
        const couleursOverride: React.CSSProperties =
          id === "bandeau"
            ? {}
            : sec.couleurs === "nuit"
              ? { background: "#141220", color: "#fff", ["--bg" as string]: "#141220", ["--tx" as string]: "#fff" }
              : sec.couleurs === "douces"
                ? { background: "color-mix(in srgb, var(--ac) 6%, var(--bg))" }
                : {};
        return (
          <div
            key={id}
            onClick={onChoisirSection ? () => onChoisirSection(id) : undefined}
            className={onChoisirSection ? "group/hl relative cursor-pointer" : "relative"}
            style={{
              ...(i > 0 ? { marginTop: "var(--section-gap)" } : undefined),
              paddingTop: margeVerticale,
              paddingBottom: margeVerticale,
              marginLeft: largeurInset,
              marginRight: largeurInset,
              ...couleursOverride,
            }}
          >
            <SectionRendue id={id} state={state} device={device} page={page} boutiqueNom={boutiqueNom} logo={logo} t={t} />
            {onChoisirSection && (
              <div
                className={`pointer-events-none absolute inset-0 z-20 rounded-[4px] border-[1.5px] border-[#E8207E] transition-opacity ${
                  selectionnee ? "opacity-100" : "opacity-0 group-hover/hl:opacity-100"
                }`}
                style={{ boxShadow: "0 0 0 3px rgba(232,32,126,.18)" }}
              >
                <span className="absolute -left-[1.5px] -top-[19px] flex items-center gap-1 whitespace-nowrap rounded-t-[5px] bg-[#E8207E] px-[7px] py-[3px] text-[7.5px] font-semibold text-white">
                  {t(def.label, def.labelEn)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (device === "phone") {
    return (
      <div className="mx-auto w-[300px] shrink-0 rounded-[2.4rem] border-[6px] border-[#141220] bg-[#141220] shadow-[0_30px_70px_-12px_rgba(20,18,32,0.45)]">
        <div className="no-scrollbar relative h-[600px] overflow-y-auto rounded-[2rem] bg-white">
          <div className="sticky top-0 z-10 flex h-6 items-center justify-center bg-[var(--bg,#fff)]">
            <span className="h-4 w-20 rounded-full bg-[#141220]" />
          </div>
          {contenu}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 shadow-[0_30px_70px_-16px_rgba(20,18,32,0.35)]">
      <div className="flex items-center gap-1.5 bg-[#e7e3ee] px-3.5 pt-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="ml-2 flex items-center gap-1.5 truncate rounded-t-lg bg-white px-3 py-1.5 text-[10px] font-medium text-[#3a3542]">
          <Marque logo={logo} taille={12} />
          <span className="truncate">{boutiqueNom}</span>
          <MiniIcon path="M6 6l12 12M18 6 6 18" color="#a39cae" />
        </span>
      </div>
      <div className="flex items-center gap-2 bg-white px-3.5 py-2">
        <MiniIcon path="M15 5 8 12l7 7" color="#a39cae" />
        <MiniIcon path="M9 5l7 7-7 7" color="#a39cae" />
        <MiniIcon path="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5" color="#a39cae" />
        <span className="ml-1 flex flex-1 items-center gap-1.5 truncate rounded-full bg-[#f0edf5] px-3 py-1 text-[10px] text-[#6d6577]">
          <MiniIcon path="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5Z" color="#6d6577" />
          <span className="truncate">
            …/{boutiqueNom.toLowerCase().replace(/\s+/g, "-")}
            {page === "commande" ? "/serum-eclat-30-ml" : ""}
          </span>
        </span>
      </div>
      <div className="max-h-[640px] overflow-y-auto">{contenu}</div>
    </div>
  );
}

function SectionRendue({
  id,
  state,
  device,
  page,
  boutiqueNom,
  logo,
  t,
}: {
  id: SectionId;
  state: EditeurState;
  device: "phone" | "desktop";
  page: PageId;
  boutiqueNom: string;
  logo: string | null;
  t: (fr: string, en: string) => string;
}) {
  const couleurEtoiles = state.style.etoilesCouleur === "principale" ? "var(--ac)" : "#F2A93B";
  switch (id) {
    case "bandeau": {
      const b = state.bandeau;
      const fondsCouleur: Record<typeof b.couleur, { background: string; color: string }> = {
        nuit: { background: "#141220", color: "#fff" },
        principale: { background: "var(--ac)", color: "#fff" },
        claire: { background: "var(--bg)", color: "var(--tx)" },
      };
      return (
        <div
          className={`relative flex items-center justify-center gap-1.5 px-4 py-2 text-center text-[10.5px] font-medium ${b.resteVisibleEnDefilant ? "sticky top-0 z-10" : ""}`}
          style={fondsCouleur[b.couleur]}
        >
          {b.iconeDevantMessage && <MiniIcon path="M12 3l2 5 5 1-4 3.6 1 5-4.5-2.5L7 17.6l1-5-4-3.6 5-1Z" />}
          <span>{texteAvecChiffres(b.messages[b.messageActif] ?? b.messages[0])}</span>
          {b.compteARebours && <span className="font-figures-bold opacity-80">· 05:12:33</span>}
          {b.fermable && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <MiniIcon path="M6 6l12 12M18 6 6 18" />
            </span>
          )}
        </div>
      );
    }

    case "entete": {
      const e = state.entete;
      const positionLogo = device === "phone" ? e.positionLogoMobile : e.positionLogo;
      const tailleLogoPx = e.tailleLogo === "s" ? 16 : e.tailleLogo === "l" ? 26 : 20;
      // "En remontant" demanderait de suivre le sens du défilement en JS ;
      // simplifié ici en sticky classique comme "Toujours", cf. note dans
      // types.ts sur resteVisible — l'aperçu reste honnête sur la position,
      // pas sur la nuance d'apparition.
      const transparent = e.transparentSurHero && page === "accueil";
      return (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 ${positionLogo === "centre" ? "justify-center" : ""} ${
            e.resteVisible !== "non" ? "sticky top-0 z-10" : ""
          } ${transparent ? "" : "border-b"}`}
          style={{ borderColor: "color-mix(in srgb, var(--tx) 08%, transparent)", background: transparent ? "transparent" : "var(--bg)" }}
        >
          <Marque logo={logo} taille={tailleLogoPx} />
          {e.nomAvecLogo && <span className="text-[12.5px] font-bold">{boutiqueNom}</span>}
          <div className="ml-auto flex items-center gap-2.5" style={{ color: "var(--tx)" }}>
            {e.rechercheStyle === "barre" ? (
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px]" style={{ background: "color-mix(in srgb, var(--tx) 5%, transparent)", color: "var(--tx)", opacity: 0.5 }}>
                <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" />
                {t("Rechercher…", "Search…")}
              </span>
            ) : (
              <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" />
            )}
            {e.panierStyle === "sac" ? (
              <MiniIcon path="M5.5 8h13l-1 12.5h-11ZM9 8V6.5a3 3 0 0 1 6 0V8" />
            ) : (
              <MiniIcon path="M3 4h2l1.6 11.2A2 2 0 0 0 8.6 17H18a2 2 0 0 0 2-1.6L21.4 8H6" />
            )}
            {e.compte && <MiniIcon path="M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Zm-6 6a6 6 0 0 1 12 0" />}
            {e.nousEcrire && (
              <span
                className="whitespace-nowrap rounded-full px-2.5 py-1 text-[9.5px] font-semibold"
                style={{ background: "var(--ac)", color: "#fff", borderRadius: "var(--rad)" }}
              >
                {t("Nous écrire", "Message us")}
              </span>
            )}
          </div>
        </div>
      );
    }

    case "grande-image": {
      const isHalo = state.style.modele === "halo";
      const h = state.grandeImage;
      const remise = state.paiement.remiseEnLignePct;
      const inverse = h.imagePosition === "gauche";
      const centree = h.imagePosition === "centre";
      const centreTexte = centree || h.texteAlign === "centre";
      const minH = h.hauteur === "s" ? 150 : h.hauteur === "l" ? 230 : 190;
      const sombre = h.typeFond !== "degrade" || isHalo;
      const textColor = sombre ? "#fff" : "var(--tx)";
      const fonds: Record<typeof h.typeFond, React.CSSProperties["background"]> = {
        degrade: isHalo ? "linear-gradient(135deg, #E8207E, #6B21D6 60%, #0B0E1C)" : "color-mix(in srgb, var(--ac) 8%, var(--bg))",
        uni: "var(--ac)",
        photo: "linear-gradient(160deg, rgba(11,14,28,.65), rgba(11,14,28,.35)), linear-gradient(135deg, #6B21D6, #0B0E1C)",
      };
      const imagePhone = device === "phone" && h.imageDifferenteSurTelephone;
      return (
        <div className="relative overflow-hidden px-4 py-5" style={{ minHeight: minH, background: fonds[h.typeFond], color: textColor }}>
          {h.courbesLumineuses && <HaloCourbes ton={sombre ? "sombre" : "clair"} />}
          <div className={`relative flex h-full items-center gap-4 ${centree ? "flex-col text-center" : inverse ? "flex-row-reverse" : ""}`}>
            <div className={`min-w-0 flex-1 ${centreTexte ? "flex flex-col items-center text-center" : ""}`}>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold"
                  style={{ background: sombre ? "rgba(255,255,255,.16)" : "color-mix(in srgb, var(--ac) 14%, transparent)", color: sombre ? "#fff" : "var(--ac)" }}
                >
                  <MiniIcon path="M12 3l2 5 5 1-4 3.6 1 5-4.5-2.5L7 17.6l1-5-4-3.6 5-1Z" color="currentColor" />
                  {texteAvecChiffres(h.petitTexte)}
                </span>
                {state.style.periodeFeteActive && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold"
                    style={{ background: sombre ? "rgba(255,255,255,.16)" : "color-mix(in srgb, var(--ac) 14%, transparent)", color: sombre ? "#fff" : "var(--ac)" }}
                  >
                    🎄 {t("Période de fête", "Holiday period")}
                  </span>
                )}
              </div>
              <p
                className="mt-2 text-[16px] leading-tight"
                style={{
                  fontFamily: "var(--font-titre)",
                  fontWeight: "var(--titre-graisse)" as unknown as number,
                  letterSpacing: "var(--titre-espacement)",
                  textTransform: "var(--titre-majuscules)" as React.CSSProperties["textTransform"],
                }}
              >
                <TitreAvecMotValorise titre={h.titre} mot={h.motValorise} couleur={sombre ? "#FF7AC0" : "var(--ac)"} />
              </p>
              <p className="mt-1 text-[10px]" style={{ opacity: sombre ? 0.85 : 0.6 }}>
                {t("Des soins naturels pour le visage et le corps, choisis avec soin.", "Natural skincare for face and body, carefully chosen.")}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[10.5px] font-semibold ${classeEffetSurvol(state.mouvements.effetSurvol, "hover:brightness-110")}`}
                  style={{ background: sombre ? "#fff" : "var(--ac)", color: sombre ? "#0B0E1C" : "#fff", borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
                >
                  {h.bouton1Texte}
                </span>
                {h.boutons === 2 && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[10.5px] font-semibold ${classeEffetSurvol(state.mouvements.effetSurvol, "hover:brightness-90")}`}
                    style={{
                      borderWidth: "var(--btn-border)",
                      borderStyle: "solid",
                      borderColor: sombre ? "rgba(255,255,255,.4)" : "var(--ac)",
                      color: textColor,
                      borderRadius: "var(--rad)",
                      textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"],
                    }}
                  >
                    {h.bouton2Texte}
                  </span>
                )}
              </div>
            </div>
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl" style={{ background: sombre ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.06)" }}>
              <MiniIcon path={imagePhone ? "M6 4h12v16H6Z M9 8h6v6H9Z" : "M4 6h4l1.4-2h5.2L16 6h4v12H4Z"} color={sombre ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.3)"} />
              {h.badge && remise > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-[#0B0E1C] px-1.5 py-0.5 text-[7.5px] font-figures-bold text-white shadow">
                  −{remise}%
                </span>
              )}
              {h.note && (
                <span className="absolute -bottom-2 -left-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-[#0B0E1C] shadow-[0_8px_18px_-6px_rgba(11,14,28,0.4)]">
                  <Etoiles note={PRODUIT_APERCU.note} taille={7} couleur={couleurEtoiles} />
                  <span className="font-figures-bold">{PRODUIT_APERCU.note}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    case "confiance": {
      const c = state.confiance;
      const icones: { icon: string; sub: string }[] = [
        { icon: "M12 3 4 6.5V11c0 4.8 3.4 8.9 8 10 4.6-1.1 8-5.2 8-10V6.5Z", sub: t("Choisis par la boutique", "Chosen by the shop") },
        { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", sub: t("4 h en moyenne", "4 h on average") },
        { icon: "M4 7h16v10H4Zm0 3h16", sub: t("Ou en ligne, avec remise", "Or online, with a discount") },
        { icon: "M4 4h16v12H8l-4 4Z", sub: t("Par message ou appel", "By message or call") },
      ];
      const visibles2 = icones.slice(0, c.nombre).map((it, i) => ({ ...it, label: c.atouts[i] }));
      const enLigne = c.style === "ligne";
      return (
        <div className={`relative z-10 px-4 ${c.chevaucheGrandeImage ? "-mt-6" : "py-3.5"}`}>
          <div
            className={`bg-white px-2 ${enLigne ? "flex items-center justify-around gap-1 py-2.5 rounded-2xl" : "grid gap-1 rounded-2xl py-3"}`}
            style={{
              ...(enLigne ? {} : { gridTemplateColumns: `repeat(${visibles2.length}, minmax(0,1fr))` }),
              boxShadow: c.chevaucheGrandeImage ? "0 14px 30px -10px rgba(11,14,28,0.28)" : "none",
              border: c.chevaucheGrandeImage ? "none" : "1px solid rgba(0,0,0,.08)",
            }}
          >
            {visibles2.map((it, i) => (
              <div key={i} className={enLigne ? "flex items-center gap-1 px-1" : "flex flex-col items-center gap-1 px-1 text-center"}>
                {c.icones === "pleines" ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--ac)" }}>
                    <MiniIcon path={it.icon} color="#fff" />
                  </span>
                ) : (
                  <MiniIcon path={it.icon} color="var(--ac)" />
                )}
                <span className="text-[7.5px] font-semibold leading-tight text-[#1a1a1a]">{it.label}</span>
                {!enLigne && <span className="text-[6.5px] leading-tight text-black/40">{it.sub}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "categories": {
      const c = state.categories;
      const rond = c.formeImages === "rond";
      const defilement = device === "phone" && c.colonnesTelephone === "defilement";
      const cols = device === "phone" ? Number(c.colonnesTelephone) || 2 : c.colonnesOrdinateur;
      const carte = (cat: (typeof CATEGORIES_APERCU)[number]) => (
        <div key={cat.label} className={defilement ? "w-16 shrink-0" : ""}>
          <div
            className={`flex aspect-square items-center justify-center ${rond ? "rounded-full" : "overflow-hidden rounded-xl border"}`}
            style={{
              background: "color-mix(in srgb, var(--ac) 10%, transparent)",
              borderColor: rond ? undefined : "color-mix(in srgb, var(--tx) 08%, transparent)",
            }}
          >
            <MiniIcon path="M4 6h16M4 12h16M4 18h16" color="var(--ac)" />
          </div>
          <p className={`truncate px-1.5 pt-1 text-[8px] font-semibold ${rond ? "text-center" : ""}`}>{t(cat.label, cat.labelEn)}</p>
          {c.nombreProduits && (
            <p className={`truncate px-1.5 pb-1.5 text-[7px] ${rond ? "text-center" : ""}`} style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>
              {texteAvecChiffres(t(`${cat.count} produits`, `${cat.count} products`))}
            </p>
          )}
        </div>
      );
      return (
        <div className="px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold">{t(c.titre, c.titre)}</p>
            {c.lienToutVoir && <span className="text-[9px] font-semibold text-brand-pink">{t("Tout voir", "See all")}</span>}
          </div>
          {defilement ? (
            <div className="flex gap-2 overflow-x-auto">{CATEGORIES_APERCU.map(carte)}</div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {CATEGORIES_APERCU.map(carte)}
            </div>
          )}
        </div>
      );
    }

    case "promo": {
      const p = state.promo;
      const inverse = p.cote === "droite";
      const fond = p.fond === "nuit" ? "#0B0E1C" : "linear-gradient(120deg,#0B0E1C,#1A1240 60%,#3A0F4E)";
      return (
        <div className="px-4 py-3.5">
          <div className={`flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-4 text-white ${inverse ? "flex-row-reverse" : ""}`} style={{ background: fond }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <MiniIcon path="M20 7 12 3 4 7l8 4 8-4Zm0 3-8 4-8-4m0 5 8 4 8-4" color="rgba(255,255,255,.7)" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-semibold">{p.petitTexte}</span>
              <p className="mt-1 text-[12px] font-bold leading-tight">{texteAvecChiffres(p.titre)}</p>
              {p.compteur && (
                <div className="mt-1.5 flex gap-1">
                  {[["02", t("j", "d")], ["14", t("h", "h")], ["36", t("min", "min")]].map(([v, u]) => (
                    <span key={u} className="rounded-md bg-white/15 px-1.5 py-0.5 text-center text-[8px]">
                      <span className="font-figures-bold">{v}</span> {u}
                    </span>
                  ))}
                </div>
              )}
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[9.5px] font-semibold text-[#0B0E1C]">
                {p.boutonTexte}
              </span>
            </div>
          </div>
        </div>
      );
    }

    case "grille": {
      const g = state.grille;
      const isHalo = state.style.modele === "halo";
      const defilement = device === "phone" && g.defilementTelephone;
      const cols = device === "phone" ? g.colonnesTelephone : g.colonnesOrdinateur;
      const produits = PRODUITS_GRILLE_APERCU.slice(0, g.nombre);
      const c = state.cartesProduit;
      const rayon = c.style === "sans-cadre" ? 0 : state.style.arrondi;
      const espace = c.densite === "compacte" ? "gap-1.5" : "gap-2";
      const paddingTexte = c.densite === "compacte" ? "px-1.5 py-1" : "px-1.5 py-1.5";
      const dotsCouleurs = ["#0B0E1C", state.style.couleurPrincipale, "#F5C1DC"];
      const titreGrille =
        g.montrer === "meilleures-ventes" ? t("Meilleures ventes", "Best sellers") : g.montrer === "nouveautes" ? t("Nouveautés", "New arrivals") : t("Sélection", "Handpicked");
      return (
        <div className="px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold">{titreGrille}</p>
            <span className="text-[9px] font-semibold" style={{ color: "var(--ac)" }}>{t("Tout voir", "See all")}</span>
          </div>
          <div className={defilement ? `flex ${espace} overflow-x-auto` : `grid ${espace}`} style={defilement ? undefined : { gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
            {produits.map((p) => (
              <div
                key={p.nom}
                className={`group relative overflow-hidden ${defilement ? "w-24 shrink-0" : ""} ${c.style === "bordure" ? "border" : ""}`}
                style={{
                  borderColor: c.style === "bordure" ? "color-mix(in srgb, var(--tx) 14%, transparent)" : undefined,
                  borderRadius: rayon,
                  boxShadow: c.style === "ombre" ? "var(--card-shadow)" : undefined,
                }}
              >
                <div className="relative flex items-center justify-center overflow-hidden" style={{ aspectRatio: "1/1", background: "color-mix(in srgb, var(--tx) 04%, transparent)" }}>
                  <MiniIcon
                    path="M4 6h4l1.4-2h5.2L16 6h4v12H4Z"
                    color="color-mix(in srgb, var(--tx) 25%, transparent)"
                  />
                  {c.deuxiemePhotoSurvol && (
                    <div className="absolute inset-0 bg-black/0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: "color-mix(in srgb, var(--tx) 08%, transparent)" }} />
                  )}
                  {g.badges && c.positionBadges === "coin" && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-[#0B0E1C] px-1.5 py-0.5 text-[7px] font-figures-bold text-white">
                      −15%
                    </span>
                  )}
                  {g.coeurFavoris && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/85">
                      <MiniIcon path="M12 20s-6.2-3.9-8.4-7.6C1.8 9.4 3.6 6 7 6c1.9 0 3.4 1 5 2.8C13.6 7 15.1 6 17 6c3.4 0 5.2 3.4 3.4 6.4C18.2 16.1 12 20 12 20Z" color="var(--ac)" />
                    </span>
                  )}
                  {c.commandeRapide && (
                    <span
                      className="absolute bottom-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white opacity-0 transition duration-200 group-hover:opacity-100"
                      style={{ background: "var(--ac)" }}
                    >
                      <MiniIcon path="M12 5v14M5 12h14" color="#fff" />
                    </span>
                  )}
                </div>
                <div className={paddingTexte}>
                  {g.badges && c.positionBadges === "dessous" && (
                    <span className="mb-0.5 inline-block rounded-full bg-[#0B0E1C] px-1.5 py-0.5 text-[7px] font-figures-bold text-white">
                      −15%
                    </span>
                  )}
                  <p className="truncate text-[8px] font-semibold">{t(p.nom, p.nomEn)}</p>
                  {g.noteEtoiles && <Etoiles note={4.6} taille={6} couleur={couleurEtoiles} />}
                  {c.rondsCouleurVariantes && (
                    <div className="mt-0.5 flex gap-0.5">
                      {dotsCouleurs.map((couleur) => (
                        <span key={couleur} className="h-2 w-2 rounded-full border border-white/40" style={{ background: couleur }} />
                      ))}
                    </div>
                  )}
                  <p className="mt-0.5 text-[9.5px] font-figures-bold" style={{ color: "var(--ac)" }}>
                    {(g.prixAffiche === "normal" ? p.prixNormal : p.prix).toLocaleString("fr-FR")} F
                  </p>
                  {g.bouton === "texte" && (
                    <span className="mt-1 block text-[7px] font-semibold" style={{ color: "var(--ac)" }}>
                      {t("Commander", "Order")}
                    </span>
                  )}
                  {g.bouton === "icone" && (
                    <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--ac) 12%, transparent)" }}>
                      <MiniIcon path="M5.5 8h13l-1 12.5h-11ZM9 8V6.5a3 3 0 0 1 6 0V8" color="var(--ac)" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "engagements": {
      const icones = [
        "M4 7h16v10H4Zm0 3h16",
        "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6",
        "M4 4h16v12H8l-4 4Z",
        "M12 3l2 5 5 1-4 3.6 1 5-4.5-2.5L7 17.6l1-5-4-3.6 5-1Z",
      ];
      const items = icones.slice(0, state.engagements.nombre).map((icon, i) => ({ icon, label: state.engagements.items[i] }));
      return (
        <div className="grid gap-2 px-4 py-3.5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
          {items.map((it) => (
            <div key={it.label} className="flex flex-col items-center gap-1 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--ac) 12%, transparent)" }}>
                <MiniIcon path={it.icon} color="var(--ac)" />
              </span>
              <span className="text-[7.5px] font-semibold leading-tight">{it.label}</span>
            </div>
          ))}
        </div>
      );
    }

    case "galerie": {
      const ratio = state.galerie.format === "portrait" ? "3/4" : state.galerie.format === "paysage" ? "16/9" : "1/1";
      const isHalo = state.style.modele === "halo";
      return (
        <div className="relative">
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              aspectRatio: ratio,
              background: isHalo
                ? "linear-gradient(150deg, #F7D9EA, #E9DFF7 55%, #FCE9EF)"
                : "linear-gradient(150deg, rgba(236,12,140,.10), rgba(58,29,138,.10))",
            }}
          >
            {/* courbes fines convergeant vers un point lumineux, motif Halo (maquette) */}
            {isHalo && <HaloCourbes />}
            <div className="relative flex flex-col items-center gap-1.5 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
                <MiniIcon path="M4 6h4l1.4-2h5.2L16 6h4v12H4Z" color="rgba(0,0,0,.35)" />
              </span>
              <span className="text-[9.5px]" style={{ color: "rgba(0,0,0,.4)" }}>
                {t("Aucune photo déposée", "No photo uploaded yet")}
              </span>
            </div>
            {isHalo && (
              <span className="absolute -bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[9.5px] font-semibold shadow-[0_10px_24px_-8px_rgba(11,14,28,0.35)]">
                <Etoiles note={PRODUIT_APERCU.note} taille={9} couleur={couleurEtoiles} />
                <span className="font-figures-bold">{PRODUIT_APERCU.note}</span>
              </span>
            )}
          </div>
          {state.galerie.lectureAuto && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur">
              {texteAvecChiffres(state.galerie.badge)}
            </span>
          )}
          {/* barre de confiance qui chevauche le bas de l'image, motif Halo (maquette) */}
          {isHalo && (
            <div className="relative z-10 mx-4 -mt-5 flex items-center justify-around gap-1 rounded-2xl bg-white px-2 py-2.5 shadow-[0_14px_30px_-10px_rgba(11,14,28,0.28)]">
              {[
                { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", label: t("Livraison rapide", "Fast delivery") },
                { icon: "M4 7h16v10H4Zm0 3h16", label: t("Paiement sécurisé", "Secure payment") },
                { icon: "M12 21s6.5-6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5 6.5 11 6.5 11Z", label: t("Retour facile", "Easy returns") },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 px-1 text-center">
                  <MiniIcon path={item.icon} color="#E8207E" />
                  <span className="text-[7.5px] font-semibold leading-tight" style={{ color: "rgba(0,0,0,.55)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "infos": {
      const isHalo = state.style.modele === "halo";
      return (
        <div className="px-4 py-3.5">
          <p
            className="text-[15px] leading-tight"
            style={{
              fontFamily: "var(--font-titre)",
              fontWeight: "var(--titre-graisse)" as unknown as number,
              letterSpacing: "var(--titre-espacement)",
              textTransform: "var(--titre-majuscules)" as React.CSSProperties["textTransform"],
            }}
          >
            {t(PRODUIT_APERCU.nom, PRODUIT_APERCU.nomEn)}
          </p>
          {state.infos.noteMoyenne && (
            <p className="mt-1 flex items-center gap-1 text-[10.5px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
              <Etoiles note={PRODUIT_APERCU.note} couleur={couleurEtoiles} /> <span className="font-figures">{PRODUIT_APERCU.note}</span> · <span className="font-figures">{PRODUIT_APERCU.avisCount}</span> {t("avis", "reviews")}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[19px] font-figures-bold">{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
            {state.infos.ancienPrixBarre && (
              <span className="text-[12px] line-through font-figures" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>
                {PRODUIT_APERCU.prixConseille.toLocaleString("fr-FR")} F
              </span>
            )}
            {state.infos.badgeRemise && (
              // fond nuit plutôt que rose plein pour le modèle Halo, cf. maquette ("badge de remise sombre")
              <span className="rounded-full px-2 py-0.5 text-[9px] font-figures-bold text-white" style={{ background: isHalo ? "#0B0E1C" : "#D8347E" }}>
                −{Math.round((1 - PRODUIT_APERCU.prixVente / PRODUIT_APERCU.prixConseille) * 100)} %
              </span>
            )}
          </div>
          {state.infos.stockRestant && (
            <p className="mt-1.5 text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 5%, transparent)" }}>
              {texteAvecChiffres(t(`Plus que ${PRODUIT_APERCU.unitesDisponibles} en stock`, `Only ${PRODUIT_APERCU.unitesDisponibles} left in stock`))}
            </p>
          )}
          {state.infos.variantes && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRODUIT_APERCU.variantes.map((v, i) => (
                <span
                  key={v}
                  className="rounded-full border px-3 py-1 text-[10px] font-figures-bold"
                  style={i === 0 ? { borderColor: "var(--ac)", color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 8%, transparent)" } : { borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}
                >
                  {v}
                </span>
              ))}
            </div>
          )}
          {state.infos.quantite && (
            <div className="mt-2.5 inline-flex items-center gap-3 rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}>
              <span>−</span>
              <span className="font-figures-bold">1</span>
              <span>+</span>
            </div>
          )}
        </div>
      );
    }

    case "offres":
      if (!state.offres.actif) return null;
      return (
        <div className="px-4 pb-3.5">
          <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>
            {t("Offres par quantité", "Quantity offers")}
          </p>
          <div className="flex flex-col gap-1.5">
            {state.offres.paliers.map((p) => (
              <div
                key={p.unites}
                className="flex items-center justify-between rounded-xl border px-3 py-2"
                style={p.badge ? { borderColor: "var(--ac)", background: "color-mix(in srgb, var(--ac) 6%, transparent)" } : { borderColor: "color-mix(in srgb, var(--tx) 1%, transparent)" }}
              >
                <span className="text-[11px] font-semibold">
                  <span className="font-figures">{p.unites}</span> {p.unites > 1 ? t("flacons", "bottles") : t("flacon", "bottle")}
                  {p.badge && <span className="ml-1.5 text-[9px] font-bold" style={{ color: "var(--ac)" }}>· {p.badge}</span>}
                </span>
                <span className={p.remisePct > 0 ? "text-[11px] font-figures-bold" : "text-[11px] font-bold"}>{p.remisePct > 0 ? `−${p.remisePct} %` : t("Prix normal", "Regular price")}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "formulaire": {
      const champs = [
        { label: t("Nom et prénom", "Full name"), demi: false },
        { label: t("Commune", "District"), demi: state.formulaire.colonnes === 2 },
        { label: t("Adresse précise", "Precise address"), demi: state.formulaire.colonnes === 2 },
        { label: t("Téléphone", "Phone number"), demi: false },
      ];
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Vos informations", "Your information")}</p>
          <div className={`grid gap-2 ${state.formulaire.colonnes === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {champs.map((c) => (
              <div key={c.label} className={`rounded-xl border px-3 py-2.5 ${c.demi ? "" : "col-span-full"}`} style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}>
                {state.formulaire.libellesDansChamp ? (
                  <>
                    <p className="text-[7.5px]" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{c.label}</p>
                    <p className="mt-0.5 h-2.5 w-2/3 rounded" style={{ background: "color-mix(in srgb, var(--tx) 08%, transparent)" }} />
                  </>
                ) : (
                  <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{c.label}</p>
                )}
              </div>
            ))}
          </div>
          {state.formulaire.boutonLocaliser && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-[10.5px] font-semibold" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>
              <MiniIcon path="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z" color="var(--ac)" />
              {t("Me localiser maintenant", "Locate me now")}
            </div>
          )}
          {state.formulaire.mentionSpecifique && (
            <div className="mt-2 rounded-xl border px-3 py-2 text-[9.5px]" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)", color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>
              {t("Une précision pour le livreur ? (facultatif)", "Anything the courier should know? (optional)")}
            </div>
          )}
        </div>
      );
    }

    case "paiement": {
      const remise = state.paiement.remiseEnLignePct;
      const prixLigne = Math.round((PRODUIT_APERCU.prixVente * (100 - remise)) / 100);
      return (
        <div className="px-4 pb-3.5">
          {state.paiement.payerEnLigne && (
            <button
              type="button"
              className="mb-2 flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
              style={{
                borderWidth: "var(--btn-border)",
                borderStyle: "solid",
                borderColor: "var(--ac)",
                background: "color-mix(in srgb, var(--ac) 6%, transparent)",
                borderRadius: "var(--rad)",
                textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"],
              }}
            >
              <span className="text-[11px] font-semibold">{t("Payer en ligne", "Pay online")}</span>
              <span className="text-[11.5px] font-figures-bold">
                {prixLigne.toLocaleString("fr-FR")} F
                {remise > 0 && <span className="ml-1 text-[9px] font-normal line-through font-figures" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>}
              </span>
            </button>
          )}
          {state.paiement.payerALaLivraison && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}>
              <span className="text-[11px] font-semibold">{t("Payer à la livraison", "Pay on delivery")}</span>
              <span className="text-[11.5px] font-figures-bold">{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
            </div>
          )}
          <div className="mb-2.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}>
            <div>
              <p className="text-[11px] font-semibold">{t("Livraison standard", "Standard delivery")}</p>
              <p className="text-[9px]" style={{ color: "rgba(0,0,0,.4)" }}>{texteAvecChiffres(t("4 h en moyenne", "4 h on average"))}</p>
            </div>
            <span className="text-[10.5px] font-semibold">{t("Incluse", "Included")}</span>
          </div>
          {state.paiement.livraisonExpress && (
            <div className="mb-2.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}>
              <p className="text-[11px] font-semibold">{t("Livraison express", "Express delivery")}</p>
              <span className="text-[10.5px] font-figures-bold">+2 000 F</span>
            </div>
          )}
          <button
            type="button"
            className={`w-full py-3 text-center text-[12px] font-bold text-white transition hover:brightness-110 ${classeAnimationBoutonCommande(state.mouvements.boutonCommandeAnimation)}`}
            style={{ background: style_boutonCommandeBg(state), borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
          >
            {t("Je commande", "I order")} · <span className="font-figures-bold">{(state.paiement.payerEnLigne ? prixLigne : PRODUIT_APERCU.prixVente).toLocaleString("fr-FR")} F</span>
          </button>
        </div>
      );
    }

    case "avis":
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Ce que disent nos clientes", "What our customers say")}</p>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[22px] font-figures-bold leading-none">{PRODUIT_APERCU.note}</span>
            <div>
              <Etoiles note={PRODUIT_APERCU.note} taille={11} couleur={couleurEtoiles} />
              <p className="text-[9px]" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}><span className="font-figures">{PRODUIT_APERCU.avisCount}</span> {t("avis", "reviews")}</p>
            </div>
          </div>
          <div className={state.avis.disposition === "grille" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
            {AVIS_APERCU.slice(0, state.avis.disposition === "grille" ? 2 : Math.min(2, state.avis.nombreAffiches)).map((a) => (
              <div key={a.nom} className="rounded-xl border px-3 py-2.5" style={{ borderColor: "color-mix(in srgb, var(--tx) 1%, transparent)" }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "var(--ac)" }}>
                    {a.initiales}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold">{a.nom}</p>
                    <Etoiles note={a.note} taille={8} couleur={couleurEtoiles} />
                  </div>
                  {a.verifie && (
                    <span className="shrink-0 text-[8px] font-semibold" style={{ color: "#1F8A5B" }}>
                      ✓ {t("Achat vérifié", "Verified purchase")}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>{a.texte}</p>
                {a.reponse && (
                  <div className="mt-1.5 rounded-lg border-l-2 px-2 py-1.5 text-[9px]" style={{ borderColor: "var(--ac)", background: "color-mix(in srgb, var(--tx) 03%, transparent)", color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
                    <b style={{ color: "var(--ac)" }}>{boutiqueNom} :</b> {a.reponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Questions fréquentes", "Frequently asked questions")}</p>
          <div className="flex flex-col">
            {state.faq.items.map((q, i) => {
              const ouverte = i === 0 && state.faq.premiereOuverte ? true : !!q.ouverte;
              return (
                <div key={q.question} className="border-b py-2" style={{ borderColor: "color-mix(in srgb, var(--tx) 08%, transparent)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10.5px] font-semibold">{texteAvecChiffres(q.question)}</p>
                    <span className="shrink-0 text-[11px]" style={{ color: "color-mix(in srgb, var(--tx) 35%, transparent)" }}>{ouverte ? "−" : "+"}</span>
                  </div>
                  {ouverte && <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--tx) 5%, transparent)" }}>{texteAvecChiffres(q.reponse)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "vendu-par":
      return (
        <div className="mx-4 mb-3.5 flex items-center gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: "color-mix(in srgb, var(--tx) 1%, transparent)", background: "color-mix(in srgb, var(--tx) 02%, transparent)" }}>
          <Marque logo={logo} taille={22} />
          <div>
            <p className="text-[8px] uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{t("Vendu par", "Sold by")}</p>
            <p className="text-[11.5px] font-bold">{boutiqueNom}</p>
          </div>
        </div>
      );

    case "pied-de-page": {
      const p = state.piedDePage;
      const isHalo = state.style.modele === "halo";
      const fondsPied: Record<EditeurState["piedDePage"]["couleur"], { background: string; color: string; sousTexte: string }> = {
        nuit: { background: isHalo ? "#0B0E1C" : "#1F1328", color: "#CFC6D8", sousTexte: "rgba(255,255,255,.4)" },
        clair: { background: "var(--bg)", color: "var(--tx)", sousTexte: "rgba(0,0,0,.4)" },
        degrade: { background: "linear-gradient(120deg,#EC0C8C,#3A1D8A)", color: "#F5E9FF", sousTexte: "rgba(255,255,255,.5)" },
      };
      const fond = fondsPied[p.couleur];
      const sombreFond = p.couleur !== "clair";
      const centre = p.alignement === "centre";
      const tailleLogoPx = p.tailleLogo === "petite" ? 16 : p.tailleLogo === "grande" ? 26 : 20;
      return (
        <div className="relative overflow-hidden px-4 py-4 text-[10px]" style={{ background: fond.background, color: fond.color, textAlign: centre ? "center" : "left" }}>
          {/* mêmes courbes que la grande image, convergeant vers un point lumineux — motif Halo (maquette) */}
          {isHalo && sombreFond && <HaloCourbes ton="sombre" />}
          <div className="relative">
            {p.logoAffiche && (
              <div className={`mb-2 flex ${centre ? "justify-center" : ""}`}>
                <Marque logo={logo} taille={tailleLogoPx} />
              </div>
            )}
            {p.presentation && (
              <p className="mb-2">
                <b className="block" style={{ color: sombreFond ? "#fff" : "var(--tx)" }}>{boutiqueNom}</b>
                {t("Soins naturels pour le visage et le corps.", "Natural skincare and body care.")}
              </p>
            )}
            <div className={`flex flex-wrap gap-x-4 gap-y-1 ${centre ? "justify-center" : ""}`}>
              {[t("Conditions de vente", "Terms of sale"), t("Livraison et retours", "Delivery and returns"), t("Confidentialité", "Privacy"), t("FAQ", "FAQ")]
                .slice(0, p.colonnesLiens)
                .map((lien) => (
                  <span key={lien}>{lien}</span>
                ))}
              {p.reseaux && <span>Facebook · Instagram</span>}
            </div>
            {p.moyensPaiement && (
              <div className={`mt-2 flex flex-wrap gap-1.5 ${centre ? "justify-center" : ""}`}>
                {["Orange Money", "MTN MoMo", "Moov Money", "Wave"].map((m) => (
                  <span key={m} className="rounded px-1.5 py-0.5 text-[8px]" style={{ background: sombreFond ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)" }}>{m}</span>
                ))}
              </div>
            )}
            <p className="mt-2.5 text-[8.5px]" style={{ color: fond.sousTexte }}>{texteAvecChiffres(p.mentionBas)}</p>
          </div>
        </div>
      );
    }

    // Sections de bibliothèque (cf. AjouterSectionModal.tsx) : pas de mise en
    // page dédiée pour chacune (18 blocs génériques), un aperçu de type
    // "espace réservé" suffit à confirmer l'ajout et la position choisie —
    // "Pour cette section" (largeur/marges/couleurs, cf. SectionRendue plus
    // haut) et Monter/Descendre/Masquer restent, eux, pleinement fonctionnels.
    default: {
      const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
      return (
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-current/20 px-4 py-8 text-center opacity-60">
          <p className="text-[11px] font-semibold">{t(def.label, def.labelEn)}</p>
          <p className="text-[9px]">{t("Contenu à personnaliser depuis le panneau de droite.", "Content to customize from the right-hand panel.")}</p>
        </div>
      );
    }
  }
}

function style_boutonCommandeBg(state: EditeurState): string {
  const { boutonCommandeCouleur, boutonRemplissage, couleurPrincipale } = state.style;
  if (boutonCommandeCouleur === "nuit") return "#0B0E1C";
  if (boutonCommandeCouleur === "violet") return "linear-gradient(100deg,#6B21D6,#3A1D8A)";
  if (boutonRemplissage === "degrade") return `linear-gradient(100deg, ${couleurPrincipale}, #3A1D8A)`;
  return couleurPrincipale;
}

function Marque({ logo, taille }: { logo: string | null; taille: number }) {
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- aperçu, pas une image du domaine
    <img src={logo} alt="" className="shrink-0 rounded-full object-cover" style={{ width: taille, height: taille }} />
  ) : (
    <span
      className="shrink-0 rounded-full"
      style={{ width: taille, height: taille, background: "linear-gradient(140deg,var(--color-brand-pink),var(--color-brand-purple))" }}
    />
  );
}

/*
  Courbes fines convergeant vers un point lumineux — décor propre au modèle
  Halo (grande image + pied de page de la maquette). Deux tons : "clair" sur
  le dégradé pastel de la galerie, "sombre" sur le pied de page nuit.
*/
function HaloCourbes({ ton = "clair" }: { ton?: "clair" | "sombre" }) {
  const trait = ton === "sombre" ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.6)";
  const point = ton === "sombre" ? "rgba(232,32,126,.55)" : "rgba(255,255,255,.7)";
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
      <path d="M-20 40 C 120 10, 220 150, 420 90" fill="none" stroke={trait} strokeWidth="1" />
      <path d="M-20 130 C 140 190, 260 10, 420 55" fill="none" stroke={trait} strokeWidth="1" />
      <circle cx="338" cy="68" r="3" fill={point} />
    </svg>
  );
}

function TitreAvecMotValorise({ titre, mot, couleur }: { titre: string; mot: string; couleur: string }) {
  const idx = mot ? titre.toLowerCase().indexOf(mot.toLowerCase()) : -1;
  if (idx === -1) return <>{titre}</>;
  return (
    <>
      {titre.slice(0, idx)}
      <span style={{ color: couleur }}>{titre.slice(idx, idx + mot.length)}</span>
      {titre.slice(idx + mot.length)}
    </>
  );
}

function MiniIcon({ path, color = "currentColor" }: { path: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[14px] w-[14px]" aria-hidden>
      <path d={path} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Etoiles({ note, taille = 10, couleur = "#F2A93B" }: { note: number; taille?: number; couleur?: string }) {
  return (
    <span className="inline-flex gap-[1px]" style={{ color: couleur }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={taille} height={taille} fill={i < Math.round(note) ? "currentColor" : "rgba(140,132,150,.5)"} aria-hidden>
          <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}
