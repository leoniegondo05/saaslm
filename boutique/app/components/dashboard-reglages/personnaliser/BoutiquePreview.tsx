"use client";

import { useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { texteAvecChiffres } from "../../dashboard-accueil/shared";
import type { EditeurState, PageId, SectionId } from "./types";
import { AVIS_APERCU, AVIS_DISTRIBUTION_APERCU, CATEGORIES_APERCU, PRODUIT_APERCU, PRODUITS_GRILLE_APERCU, SECTIONS_DEFAUT } from "./types";

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

// Formulaire de commande, aperçu "commande" (cf. capture utilisateur du
// 2026-09-19) : liste des communes suit le pays/zones desservies, "Me
// localiser" remplit l'adresse précise via la position du téléphone, et
// l'indicatif suit le pays du client — trois listes démonstratives (aucun
// vrai découpage géographique par pays n'existe encore côté données).
const COMMUNES_CI = ["Abobo", "Adjamé", "Anyama", "Attécoubé", "Bingerville", "Cocody", "Koumassi", "Marcory"];
const INDICATIFS = [
  { pays: "Côte d'Ivoire", paysEn: "Ivory Coast", code: "+225", drapeau: "🇨🇮" },
  { pays: "Sénégal", paysEn: "Senegal", code: "+221", drapeau: "🇸🇳" },
  { pays: "Mali", paysEn: "Mali", code: "+223", drapeau: "🇲🇱" },
  { pays: "Burkina Faso", paysEn: "Burkina Faso", code: "+226", drapeau: "🇧🇫" },
  { pays: "Togo", paysEn: "Togo", code: "+228", drapeau: "🇹🇬" },
  { pays: "Bénin", paysEn: "Benin", code: "+229", drapeau: "🇧🇯" },
];

// Pied de page — groupes de liens démonstratifs (cf. "Colonnes de liens" dans
// ReglagesSection.tsx, `piedDePage.colonnesLiens` sélectionne combien de ces
// groupes s'affichent, dans l'ordre). "À propos" reprend les deux liens fixes
// déjà annoncés comme tags dans le panneau de réglages (Conditions de vente,
// Confidentialité).
const PIED_GROUPES_APERCU: { titre: [string, string]; liens: [string, string][] }[] = [
  {
    titre: ["Boutique", "Shop"],
    liens: [
      ["Soins visage", "Face care"],
      ["Corps", "Body"],
      ["Coffrets", "Gift sets"],
      ["Offres", "Deals"],
    ],
  },
  {
    titre: ["Aide", "Help"],
    liens: [
      ["Suivre ma commande", "Track my order"],
      ["Livraison et retours", "Delivery and returns"],
      ["Questions fréquentes", "FAQ"],
    ],
  },
  {
    titre: ["À propos", "About"],
    liens: [
      ["Notre histoire", "Our story"],
      ["Conditions de vente", "Terms of sale"],
      ["Confidentialité", "Privacy"],
    ],
  },
  {
    titre: ["Communauté", "Community"],
    liens: [
      ["Nous écrire", "Contact us"],
      ["Programme fidélité", "Loyalty program"],
      ["Parrainage", "Referral"],
    ],
  },
];

// Mêmes logos que la carte "Reversé sur ce compte" (cf. PaymentMethodCard.tsx,
// fichiers dans public/images) — vrais logos plutôt qu'une icône générique.
const PIED_PAIEMENT_APERCU: { label: string; logo: string }[] = [
  { label: "Orange Money", logo: "/images/ORANGE.png" },
  { label: "MTN MoMo", logo: "/images/MTN.svg" },
  { label: "Moov Money", logo: "/images/MOOV.png" },
  { label: "Wave", logo: "/images/wave.png" },
];

// Icônes de réseaux (rangée sous la présentation) — génériques (caméra,
// lecture, message) : "Réseaux sociaux" n'a pas encore de champ où choisir
// quels réseaux sont reliés, cf. `piedDePage.reseaux` (booléen simple).
const PIED_RESEAUX_ICONES = [
  "M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M10 9l5 3-5 3Z",
  "M4 4h16v12H8l-4 4Z",
];

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

// "Bouton de commande · Texte" (panneau "Informations produit", cf. ReglagesSection.tsx) —
// réutilisé par le bouton principal et par la barre fixe sur téléphone (ElementsFlottantsApercu).
const BOUTON_COMMANDE_LABELS: Record<EditeurState["paiement"]["boutonTexte"], [string, string]> = {
  "je-commande": ["Je commande", "I order"],
  commander: ["Commander", "Order"],
  acheter: ["Acheter", "Buy"],
};

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

// Rangée de confiance réutilisée à deux endroits de la page commande : la
// version Halo qui chevauche la galerie (couleurs figées, cf. case "galerie")
// et la version thème-aware sous le bouton de commande (cf. case "paiement").
const CONFIANCE_ITEMS: { icon: string; label: string; labelEn: string }[] = [
  { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", label: "Livraison rapide", labelEn: "Fast delivery" },
  { icon: "M4 7h16v10H4Zm0 3h16", label: "Paiement sécurisé", labelEn: "Secure payment" },
  { icon: "M12 21s6.5-6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5 6.5 11 6.5 11Z", label: "Retour facile", labelEn: "Easy returns" },
];

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
  const visibles = state.sections
    .filter((s) => s.visible)
    .map((s) => s.id)
    .filter((id) => {
      const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
      return def.page === "les-deux" || def.page === page;
    });

  // "Position dans la page" de "confiance" et "categories" n'est plus un champ
  // séparé (cf. types.ts, positionConfianceActuelle/placerConfiance et
  // positionCategoriesActuelle/placerCategories) : c'est l'ordre de la section
  // dans `state.sections` lui-même, donc Monter/Descendre et ce réglage
  // agissent tous deux sur la même donnée et restent synchronisés avec
  // l'aperçu — pas de logique de repositionnement à part ici.

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
        // Pas de padding global : chaque section gère son propre inset
        // (bandeau/entete/pied-de-page/pleine = bord-à-bord, page = 28px).
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
        // Bandeau, entête et pied-de-page : collés bord-à-bord, sans marge verticale ni section-gap.
        const CHROME_EDGE = new Set(["bandeau", "entete", "pied-de-page"]);
        const margeVerticale = CHROME_EDGE.has(id) ? 0 : MARGE_SECTION[sec.marges];
        // FULL_EDGE : toujours inset 0 latéralement (fond couvre tout).
        // Grande-image : la largeur "page" se gère en interne (maxWidth),
        // pas via marginLeft/Right pour que le fond reste plein-bord.
        const FULL_EDGE = new Set(["bandeau", "entete", "pied-de-page", "grande-image"]);
        const insetDesktop = style.largeurOrdinateur === "large" ? 8 : 28;
        const largeurInset =
          FULL_EDGE.has(id)
            ? 0
            : sec.largeur === "page"
              ? device === "phone" ? 12 : insetDesktop
              : 0;
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
              // Pas de section-gap avant le pied-de-page (collé en bas comme le bandeau en haut)
              ...(i > 0 && !CHROME_EDGE.has(id) ? { marginTop: "var(--section-gap)" } : undefined),
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
          <ElementsFlottantsApercu flottants={state.flottants} boutonTexte={state.paiement.boutonTexte} page={page} device={device} t={t} />
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
      {/*
        Hauteur du contenu adaptée à l'écran : 100vh moins la hauteur de la
        barre d'outils (≈ 72px), le padding du conteneur (≈ 40px + 40px),
        la barre de titre du navigateur simulée ci-dessus (≈ 60px) et une
        marge de sécurité — évite le max-h figé à 640px qui coupait
        le contenu sur les écrans < 900px.
      */}
      <div className="relative" style={{ height: "calc(100vh - 300px)", minHeight: "440px" }}>
        <div className="no-scrollbar h-full overflow-y-auto">{contenu}</div>
        <ElementsFlottantsApercu flottants={state.flottants} boutonTexte={state.paiement.boutonTexte} page={page} device={device} t={t} />
      </div>
    </div>
  );
}

/*
  "Éléments flottants" (cf. ReglagesBoutique.tsx, onglet du même nom) — bouton
  de commande fixe sur téléphone, bouton WhatsApp, fenêtre promotionnelle,
  onglet "Avis" sur le côté et retour en haut. Réglages déjà en place côté
  FlottantsState mais jamais rendus dans cet aperçu jusqu'ici : chacun se
  voyait dans son panneau de réglages sans jamais apparaître à l'écran, à
  l'inverse de toutes les autres sections (cf. commentaire en tête de
  fichier : "tout se voit à l'écran dès qu'un réglage change"). Couche
  superposée à `contenu` (pas une section : ce sont des éléments de chrome
  qui flottent par-dessus la page, pas un bloc dans son ordre), ancrée sur le
  conteneur défilant plutôt que sur la fenêtre du navigateur puisque cet
  aperçu est lui-même une fenêtre réduite.
*/
function ElementsFlottantsApercu({
  flottants,
  boutonTexte,
  page,
  device,
  t,
}: {
  flottants: EditeurState["flottants"];
  boutonTexte: EditeurState["paiement"]["boutonTexte"];
  page: PageId;
  device: "phone" | "desktop";
  t: (fr: string, en: string) => string;
}) {
  // Le bouton de commande fixe n'a de sens que sur téléphone, sur la page de
  // commande (cf. maquette, "Bouton de commande fixe sur téléphone") — sur
  // l'accueil ou sur ordinateur, rien à commander en bas de l'écran.
  const barreCommande = flottants.boutonCommandeTelephone && device === "phone" && page === "commande";
  const basReserve = barreCommande ? 58 : 12; // px laissés libres au-dessus de la barre de commande pour ne pas la recouvrir
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[inherit]">
      {flottants.ongletAvisCote && (
        <span
          className="pointer-events-auto absolute right-0 top-1/2 origin-right -translate-y-1/2 -rotate-90 rounded-t-md bg-[#0B0E1C] px-2.5 py-1 text-[8px] font-semibold text-white"
        >
          {t("Avis", "Reviews")}
        </span>
      )}
      {flottants.boutonRetourHaut && (
        <span
          className={`pointer-events-auto absolute flex h-7 w-7 items-center justify-center rounded-full shadow-[0_8px_18px_-6px_rgba(11,14,28,0.35)] ${
            // Côté opposé au bouton WhatsApp quand les deux sont affichés du même côté (cf. capture : à droite par défaut, WhatsApp étant caché).
            flottants.whatsappAfficher && flottants.whatsappCote === "droite" ? "left-3" : "right-3"
          }`}
          style={{ bottom: basReserve, background: "var(--ac)" }}
        >
          <MiniIcon path="M12 19V5M5 12l7-7 7 7" color="#fff" />
        </span>
      )}
      {flottants.whatsappAfficher && (
        <span
          className={`pointer-events-auto absolute flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.4)] ${
            flottants.whatsappCote === "gauche" ? "left-3" : "right-3"
          }`}
          style={{ bottom: basReserve }}
        >
          <WhatsappIcon />
        </span>
      )}
      {barreCommande && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 border-t bg-white px-3 py-2" style={{ borderColor: "rgba(0,0,0,.08)" }}>
          <button type="button" className="w-full rounded-full bg-[#0B0E1C] py-2.5 text-[11px] font-bold text-white">
            {t(...BOUTON_COMMANDE_LABELS[boutonTexte])}
          </button>
        </div>
      )}
    </div>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="#fff" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.24.7-1.4 1.3-1.9 1.4-.5.1-1.1.2-3.5-.7-2.9-1.1-4.8-4-5-4.2-.14-.2-1.2-1.6-1.2-3s.75-2.1 1-2.4c.26-.3.57-.36.76-.36h.55c.18 0 .42-.07.65.5.24.6.82 2 .9 2.15.07.15.12.32.02.5-.1.2-.15.32-.3.5l-.44.5c-.15.15-.3.32-.13.6.16.3.73 1.2 1.57 1.95 1.08 1 2 1.3 2.28 1.44.28.15.44.13.6-.08.17-.2.7-.82.9-1.1.2-.28.4-.23.66-.14.28.1 1.75.83 2.05 1 .3.14.5.2.57.33.08.13.08.72-.16 1.42Z" />
    </svg>
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

  // Démo interactive du bloc "formulaire" (case ci-dessous) : trois listes
  // que le client ouvre au clic dans le vrai formulaire de commande.
  const [communeOuverte, setCommuneOuverte] = useState(false);
  const [communeRecherche, setCommuneRecherche] = useState("");
  const [communeChoisie, setCommuneChoisie] = useState("");
  const [geoloc, setGeoloc] = useState<"repos" | "recherche" | "trouvee" | "refusee">("repos");
  const [adresseModifiable, setAdresseModifiable] = useState(false);
  const [adressePrecise, setAdressePrecise] = useState("");
  const [indicatifOuvert, setIndicatifOuvert] = useState(false);
  const [indicatifChoisi, setIndicatifChoisi] = useState(INDICATIFS[0]);
  const [telephone, setTelephone] = useState("");

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
          <span>{texteAvecChiffres((b.messages[b.messageActif] ?? b.messages[0]).texte)}</span>
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

    case "chemin-navigation":
      return (
        <div className="flex items-center gap-1 overflow-hidden px-4 py-2 text-[9.5px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
          <span className="shrink-0">{t("Accueil", "Home")}</span>
          <span className="shrink-0">›</span>
          <span className="shrink-0 truncate">{boutiqueNom}</span>
          <span className="shrink-0">›</span>
          <span className="truncate font-semibold" style={{ color: "var(--tx)" }}>
            {t(PRODUIT_APERCU.nom, PRODUIT_APERCU.nomEn)}
          </span>
        </div>
      );

    case "grande-image": {
      const sec = state.sections.find((s) => s.id === id)!;
      const isHalo = state.style.modele === "halo";
      const h = state.grandeImage;
      const remise = state.paiement.remiseEnLignePct;
      const inverse = h.imagePosition === "gauche";
      const centree = h.imagePosition === "centre";
      const centreTexte = centree || h.texteAlign === "centre";
      const minH = h.hauteur === "s" ? 240 : h.hauteur === "l" ? 360 : 300;
      const sombre = h.typeFond !== "degrade" || isHalo;
      const textColor = sombre ? "#fff" : "var(--tx)";
      const fonds: Record<typeof h.typeFond, React.CSSProperties["background"]> = {
        degrade: isHalo ? "linear-gradient(135deg, #E8207E 45%, #6B21D6 78%, #0B0E1C)" : "color-mix(in srgb, var(--ac) 8%, var(--bg))",
        uni: "var(--ac)",
        photo: "linear-gradient(160deg, rgba(11,14,28,.65), rgba(11,14,28,.35)), linear-gradient(135deg, #6B21D6, #0B0E1C)",
      };
      const imagePhone = device === "phone" && h.imageDifferenteSurTelephone;
      return (
        <div className="relative overflow-hidden px-6 py-8" style={{ minHeight: minH, background: fonds[h.typeFond], color: textColor }}>
          {h.courbesLumineuses && (isHalo ? <HaloRayons /> : <HaloCourbes ton={sombre ? "sombre" : "clair"} />)}
          {/* largeur "page" : contenu centré avec maxWidth, fond reste plein-bord */}
          <div
            className={`relative flex h-full gap-3 ${
              centree
                ? "flex-col items-center text-center"
                : device === "phone"
                  ? "flex-col items-start"
                  : `items-center ${inverse ? "flex-row-reverse" : ""}`
            }`}
            style={sec.largeur === "page" ? { maxWidth: device === "phone" ? "100%" : 520, margin: "0 auto" } : undefined}
          >
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
                className="mt-2 text-[24px] leading-tight"
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
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[10.5px] font-semibold ${classeEffetSurvol(state.mouvements.effetSurvol, "hover:brightness-110")}`}
                  style={{ background: sombre ? "#fff" : "var(--ac)", color: sombre ? "#0B0E1C" : "#fff", borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
                >
                  {h.bouton1Texte}
                </span>
                {h.boutons === 2 && (
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[10.5px] font-semibold ${classeEffetSurvol(state.mouvements.effetSurvol, "hover:brightness-90")}`}
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
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <img
                  src={imagePhone ? "/images/serum2.jpg" : "/images/serum1.avif"}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    maskImage: "radial-gradient(circle, #000 55%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(circle, #000 55%, transparent 100%)",
                  }}
                />
              </div>
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
      const carte = (cat: (typeof CATEGORIES_APERCU)[number], i: number) => (
        <div
          key={cat.label}
          className={`w-full overflow-hidden rounded-lg bg-white shadow-[0_6px_16px_-8px_rgba(20,18,32,0.18)] ${defilement ? "w-16 shrink-0" : ""}`}
        >
          <div className={`flex aspect-square items-center justify-center overflow-hidden ${rond ? "m-2 rounded-full" : ""}`}>
            <img src={i % 2 === 0 ? "/images/serum1.avif" : "/images/serum2.jpg"} alt="" className="h-full w-full object-cover object-top" />
          </div>
          <p className={`truncate px-2 pt-1.5 text-[8px] font-semibold ${rond ? "text-center" : ""}`}>{t(cat.label, cat.labelEn)}</p>
          {c.nombreProduits && (
            <p className={`truncate px-2 pb-2 text-[7px] ${rond ? "text-center" : ""}`} style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
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
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {CATEGORIES_APERCU.slice(0, cols).map(carte)}
            </div>
          )}
        </div>
      );
    }

    case "promo": {
      const p = state.promo;
      const inverse = p.cote === "droite";
      const phone = device === "phone";
      const fond = p.fond === "nuit" ? "linear-gradient(160deg,#170A22,#0B0E1C 65%)" : "linear-gradient(135deg,#6B21D6,#E8207E)";
      return (
        <div className="px-4 py-3.5">
          <div
            className={`overflow-hidden rounded-2xl px-5 py-5 text-white ${
              phone ? "flex flex-col gap-3" : `flex min-h-[112px] items-center justify-center gap-4 py-6 ${inverse ? "flex-row-reverse" : ""}`
            }`}
            style={{ background: fond }}
          >
            <div
              className={phone ? "relative flex h-32 w-full items-end justify-center" : "flex h-28 w-28 shrink-0 items-end justify-center"}
              style={{
                maskImage: "radial-gradient(circle, #000 55%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(circle, #000 55%, transparent 100%)",
              }}
            >
              {phone && (
                <>
                  <FeuilleDecor className="absolute left-4 top-0 h-16 w-10 -rotate-12" opacity={0.18} />
                  <FeuilleDecor className="absolute right-4 top-2 h-14 w-9 rotate-[18deg]" color="#F5C1DC" opacity={0.35} />
                </>
              )}
              {(["flacon", "pompe", "pot"] as const).map((variante, i) => (
                <div key={variante} className={`h-full ${phone ? "w-24" : "w-1/3"} ${i > 0 ? "-ml-3" : ""}`}>
                  <ProduitIllustration variante={variante} accent="#fff" />
                </div>
              ))}
            </div>
            <div className={phone ? "min-w-0" : "min-w-0 max-w-[76%]"}>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold">{p.petitTexte}</span>
              <p className="mt-1.5 text-[19px] font-bold leading-tight">{texteAvecChiffres(p.titre)}</p>
              {p.sousTitre && <p className="mt-1 text-[9px] leading-snug text-white/75">{p.sousTitre}</p>}
              {p.compteur && (
                <div className="mt-2 flex gap-1.5">
                  {[["02", t("jours", "days")], ["14", t("heures", "hours")], ["36", t("min", "min")], ["08", "s"]].map(([v, u]) => (
                    <span key={u} className="flex flex-col items-center rounded-md bg-white/15 px-2 py-1 text-center text-[9px]">
                      <span className="font-figures-bold">{v}</span> {u}
                    </span>
                  ))}
                </div>
              )}
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-[#0B0E1C]">
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
      const espace = c.densite === "compacte" ? "gap-2.5" : "gap-3.5";
      const paddingTexte = c.densite === "compacte" ? "px-1.5 py-1" : "px-1.5 py-1.5";
      const dotsCouleurs = ["#0B0E1C", state.style.couleurPrincipale, "#F5C1DC"];
      const titreGrille =
        g.montrer === "meilleures-ventes" ? t("Meilleures ventes", "Best sellers") : g.montrer === "nouveautes" ? t("Nouveautés", "New arrivals") : t("Sélection", "Handpicked");
      const meilleureVenteIndex = indexMeilleureVente(produits);
      return (
        <div className="px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold">{titreGrille}</p>
            <span className="text-[9px] font-semibold" style={{ color: "var(--ac)" }}>{t("Tout voir", "See all")}</span>
          </div>
          <div className={defilement ? `flex ${espace} overflow-x-auto` : `grid ${espace}`} style={defilement ? undefined : { gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
            {produits.map((p, i) => (
              <CarteProduit
                key={p.nom}
                p={p}
                g={g}
                c={c}
                dotsCouleurs={dotsCouleurs}
                rayon={rayon}
                paddingTexte={paddingTexte}
                couleurEtoiles={couleurEtoiles}
                scroll={defilement}
                variante={PRODUIT_ILLUSTRATIONS[i % PRODUIT_ILLUSTRATIONS.length]}
                badge={i === meilleureVenteIndex ? "populaire" : p.ventes30j === 0 ? "nouveau" : undefined}
                compact
                t={t}
              />
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
      // Sous-libellé fixe par position, comme l'icône (cf. types.ts) : pas de champ éditable,
      // ce sont les 4 mêmes garanties quel que soit le libellé personnalisé au-dessus.
      const sousLibelles = [
        t("Orange Money, MTN MoMo, Moov Money, Wave", "Orange Money, MTN MoMo, Moov Money, Wave"),
        t("Du départ à la livraison", "From pickup to delivery"),
        t("Par message ou appel", "By message or call"),
        t("Réservées aux clientes", "Reserved for customers"),
      ];
      const items = icones.slice(0, state.engagements.nombre).map((icon, i) => ({ icon, label: state.engagements.items[i], sousLabel: sousLibelles[i] }));
      // Téléphone : ligne unique trop étroite pour icône + titre + sous-libellé sur 4 colonnes,
      // donc grille 2×2 (bordure haute sur la 2e rangée, bordure gauche sur la 2e colonne).
      const colsPhone = 2;
      return (
        <div className="px-4 py-3.5">
          <div
            className={device === "phone" ? "grid rounded-lg border px-2.5 py-2.5" : "flex items-stretch rounded-lg border px-2.5 py-2.5"}
            style={{
              borderColor: "color-mix(in srgb, var(--ac) 20%, transparent)",
              background: "color-mix(in srgb, var(--ac) 5%, transparent)",
              ...(device === "phone" ? { gridTemplateColumns: `repeat(${colsPhone}, minmax(0,1fr))` } : undefined),
            }}
          >
            {items.map((it, i) => (
              <div
                key={it.label}
                className="flex flex-1 items-center gap-1.5 px-2 py-1"
                style={
                  device === "phone"
                    ? {
                        borderLeft: i % colsPhone > 0 ? "1px solid color-mix(in srgb, var(--ac) 15%, transparent)" : undefined,
                        borderTop: i >= colsPhone ? "1px solid color-mix(in srgb, var(--ac) 15%, transparent)" : undefined,
                      }
                    : i > 0
                      ? { borderLeft: "1px solid color-mix(in srgb, var(--ac) 15%, transparent)" }
                      : undefined
                }
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--ac) 14%, transparent)" }}>
                  <MiniIcon path={it.icon} color="var(--ac)" />
                </span>
                <div className="min-w-0">
                  <p className="text-[7px] font-bold leading-tight">{it.label}</p>
                  <p className="mt-0.5 truncate text-[6px] leading-tight" style={{ color: "var(--ac)", opacity: 0.75 }}>{it.sousLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "galerie": {
      const g = state.galerie;
      const ratio = g.format === "portrait" ? "3/4" : "1/1";
      const isHalo = state.style.modele === "halo";
      return (
        <div className="relative">
          <div className="flex gap-1.5">
            {g.vignettesOrdinateur === "gauche" && (
              <div className="flex w-9 shrink-0 flex-col gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="relative flex items-center justify-center overflow-hidden rounded-lg"
                    style={{
                      aspectRatio: "1/1",
                      background: "color-mix(in srgb, var(--tx) 04%, transparent)",
                      boxShadow: i === 0 ? "0 0 0 1.5px var(--ac)" : undefined,
                    }}
                  >
                    <ProduitIllustration variante={PRODUIT_ILLUSTRATIONS[i % PRODUIT_ILLUSTRATIONS.length]} accent="var(--ac)" />
                  </div>
                ))}
              </div>
            )}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden"
              style={{
                aspectRatio: ratio,
                background: isHalo
                  ? "linear-gradient(150deg, #F7D9EA, #E9DFF7 55%, #FCE9EF)"
                  : "linear-gradient(150deg, rgba(236,12,140,.10), rgba(58,29,138,.10))",
              }}
            >
              {/* courbes fines convergeant vers un point lumineux, motif Halo (maquette) */}
              {isHalo && <HaloCourbes />}
              <div className="relative flex h-full w-full items-center justify-center">
                <ProduitIllustration variante="flacon" accent="var(--ac)" />
              </div>
              {isHalo && (
                <span className="absolute -bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[9.5px] font-semibold shadow-[0_10px_24px_-8px_rgba(11,14,28,0.35)]">
                  <Etoiles note={PRODUIT_APERCU.note} taille={9} couleur={couleurEtoiles} />
                  <span className="font-figures-bold">{PRODUIT_APERCU.note}</span>
                </span>
              )}
              {g.boutonZoom && (
                <span className="absolute bottom-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85">
                  <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l4 4" color="rgba(0,0,0,.6)" />
                </span>
              )}
              {g.lectureAuto && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur">
                  {t("Vidéo", "Video")}
                </span>
              )}
              {g.compteur && (
                <span className="absolute right-2.5 top-2.5 rounded-full bg-black/45 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur font-figures">
                  1 / 6
                </span>
              )}
              {g.pointsPosition && (
                <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="h-1 w-1 rounded-full" style={{ background: i === 0 ? "#fff" : "rgba(255,255,255,.5)" }} />
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* barre de confiance qui chevauche le bas de l'image, motif Halo (maquette) */}
          {isHalo && (
            <div className="relative z-10 mx-4 -mt-5 flex items-center justify-around gap-1 rounded-2xl bg-white px-2 py-2.5 shadow-[0_14px_30px_-10px_rgba(11,14,28,0.28)]">
              {CONFIANCE_ITEMS.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 px-1 text-center">
                  <MiniIcon path={item.icon} color="#E8207E" />
                  <span className="text-[7.5px] font-semibold leading-tight" style={{ color: "rgba(0,0,0,.55)" }}>
                    {t(item.label, item.labelEn)}
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
          {state.infos.badgeNouveaute && (
            <span
              className="mb-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-figures-bold text-white"
              style={{ background: isHalo ? "linear-gradient(100deg,#E8207E,#6B21D6)" : "var(--ac)" }}
            >
              {t("Nouveauté", "New")}
            </span>
          )}
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
          {state.infos.etoilesSousNom && (
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
          {/* "Stock restant · Afficher sous" (panneau "Informations produit") : le bloc ne
              s'affiche que sous ce seuil, pas simplement quand le réglage est activé. */}
          {state.infos.stockRestant && PRODUIT_APERCU.unitesDisponibles <= state.infos.stockAfficherSousUnites && (
            <p className="mt-1.5 text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 5%, transparent)" }}>
              {texteAvecChiffres(t(`Plus que ${PRODUIT_APERCU.unitesDisponibles} en stock`, `Only ${PRODUIT_APERCU.unitesDisponibles} left in stock`))}
            </p>
          )}
          <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
            {state.infos.description === "complete"
              ? t(PRODUIT_APERCU.descriptionComplete, PRODUIT_APERCU.descriptionCompleteEn)
              : t(PRODUIT_APERCU.descriptionCourte, PRODUIT_APERCU.descriptionCourteEn)}
          </p>
          {state.infos.lienConseilsUtilisation && (
            <a href="#" className="mt-1 inline-block text-[9.5px] font-semibold underline" style={{ color: "var(--ac)" }}>
              {t("Conseils d'utilisation", "How to use")}
            </a>
          )}
          <div className="mt-3">
            <VariantesApercu presentation={state.infos.variantesPresentation} variantes={PRODUIT_APERCU.variantes} t={t} />
          </div>
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
      const f = state.formulaire;
      const bordure = { borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" };
      const boiteBase = f.styleChamps === "ligne" ? "rounded-none border-0 border-b" : f.styleChamps === "plein" ? "rounded-xl border-0" : "rounded-xl border";
      const boiteClasses = `${boiteBase} px-3 py-2.5`;
      const boiteStyle = (actif?: boolean): React.CSSProperties =>
        f.styleChamps === "plein"
          ? { background: actif ? "color-mix(in srgb, var(--ac) 8%, transparent)" : "color-mix(in srgb, var(--tx) 5%, transparent)" }
          : { borderColor: actif ? "var(--ac)" : bordure.borderColor };
      const libelleDansChamp = f.libellesPosition === "dans-le-champ";
      const libelle = (texte: string) =>
        libelleDansChamp && <p className="text-[7.5px]" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{texte}</p>;
      const labelExterne = (texte: string) =>
        !libelleDansChamp && (
          <p className="mb-1 text-[9px] font-medium" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
            {texte}
          </p>
        );
      const iconeChamp = (chemin: string) =>
        f.iconesDansChamps && <MiniIcon path={chemin} color="color-mix(in srgb, var(--tx) 30%, transparent)" />;
      const iconePersonne = "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6";
      const iconeLieu = "M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z";
      const iconeTelephone = "M6.5 3h3l1.2 4.5-2 1.6a11 11 0 0 0 5.2 5.2l1.6-2 4.5 1.2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z";
      const communesFiltrees = COMMUNES_CI.filter((c) => c.toLowerCase().includes(communeRecherche.toLowerCase()));
      const localiser = () => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          setGeoloc("refusee");
          return;
        }
        setGeoloc("recherche");
        navigator.geolocation.getCurrentPosition(
          () => {
            setGeoloc("trouvee");
            setAdressePrecise(t("Position actuelle du téléphone", "Phone's current position"));
          },
          () => setGeoloc("refusee")
        );
      };
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Vos informations", "Your information")}</p>
          <div className={`grid gap-2 ${f.colonnes === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="col-span-full">
              {labelExterne(t("Nom et prénom", "Full name"))}
              <div className={boiteClasses} style={boiteStyle()}>
                <div className="flex items-center gap-1.5">
                  {iconeChamp(iconePersonne)}
                  <div className="min-w-0 flex-1">
                    {libelleDansChamp ? (
                      <>
                        {libelle(t("Nom et prénom", "Full name"))}
                        <p className="mt-0.5 h-2.5 w-2/3 rounded" style={{ background: "color-mix(in srgb, var(--tx) 08%, transparent)" }} />
                      </>
                    ) : (
                      <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{t("Nom et prénom", "Full name")}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Commune — liste + recherche */}
            <div className={f.colonnes === 2 ? "" : "col-span-full"}>
              {labelExterne(t("Commune", "District"))}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCommuneOuverte((v) => !v)}
                  className={`w-full text-left ${boiteClasses}`}
                  style={boiteStyle(communeOuverte)}
                >
                  <div className="flex items-center gap-1.5">
                    {iconeChamp(iconeLieu)}
                    <div className="min-w-0 flex-1">
                      {libelle(t("Commune", "District"))}
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate text-[10px]" style={{ color: communeChoisie ? "var(--tx)" : "color-mix(in srgb, var(--tx) 4%, transparent)" }}>
                          {communeChoisie || t("Choisir", "Select")}
                        </span>
                        <MiniIcon path="M6 9l6 6 6-6" color="color-mix(in srgb, var(--tx) 30%, transparent)" />
                      </span>
                    </div>
                  </div>
                </button>
                {communeOuverte && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[170px] overflow-y-auto rounded-xl border shadow-lg" style={{ ...bordure, background: "var(--bg)" }}>
                    <div className="flex items-center gap-1.5 border-b px-2.5 py-2" style={{ borderColor: "color-mix(in srgb, var(--tx) 8%, transparent)" }}>
                      <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" color="color-mix(in srgb, var(--tx) 30%, transparent)" />
                      <input
                        value={communeRecherche}
                        onChange={(e) => setCommuneRecherche(e.target.value)}
                        placeholder={t("Rechercher une commune", "Search a district")}
                        className="w-full bg-transparent text-[10px] outline-none"
                        style={{ color: "var(--tx)" }}
                      />
                    </div>
                    {communesFiltrees.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCommuneChoisie(c);
                          setCommuneOuverte(false);
                          setCommuneRecherche("");
                        }}
                        className="block w-full px-2.5 py-1.5 text-left text-[10px]"
                        style={c === communeChoisie ? { background: "color-mix(in srgb, var(--ac) 10%, transparent)", color: "var(--ac)", fontWeight: 600 } : { color: "var(--tx)" }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Adresse précise — remplie/modifiable après "Me localiser" */}
            <div className={f.colonnes === 2 ? "" : "col-span-full"}>
              {labelExterne(f.libelleAdressePrecise)}
              <div className={boiteClasses} style={boiteStyle()}>
                <div className="flex items-center gap-1.5">
                  {iconeChamp(iconeLieu)}
                  <div className="min-w-0 flex-1">
                    {geoloc === "trouvee" ? (
                      <>
                        {libelle(f.libelleAdressePrecise)}
                        {adresseModifiable ? (
                          <input
                            value={adressePrecise}
                            onChange={(e) => setAdressePrecise(e.target.value)}
                            onBlur={() => setAdresseModifiable(false)}
                            autoFocus
                            placeholder={f.texteExempleAdressePrecise}
                            className="mt-0.5 w-full bg-transparent text-[10px] outline-none"
                            style={{ color: "var(--tx)" }}
                          />
                        ) : (
                          <span className="mt-0.5 flex items-center justify-between gap-1">
                            <span className="flex items-center gap-1 truncate text-[10px]" style={{ color: "var(--tx)" }}>
                              {!f.iconesDansChamps && <MiniIcon path={iconeLieu} color="var(--ac)" />}
                              {adressePrecise}
                            </span>
                            <button type="button" onClick={() => setAdresseModifiable(true)} className="shrink-0 text-[9.5px] font-semibold underline" style={{ color: "var(--ac)" }}>
                              {t("Modifier", "Edit")}
                            </button>
                          </span>
                        )}
                      </>
                    ) : libelleDansChamp ? (
                      <>
                        {libelle(f.libelleAdressePrecise)}
                        <p className="mt-0.5 truncate text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{f.texteExempleAdressePrecise}</p>
                      </>
                    ) : (
                      <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{f.libelleAdressePrecise}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Téléphone — indicatif pays + numéro */}
            <div className="col-span-full">
              {labelExterne(t("Téléphone et indicatif", "Phone and dialing code"))}
              <div className={`relative flex overflow-visible ${boiteBase}`} style={boiteStyle()}>
                {f.iconesDansChamps && (
                  <span className="flex shrink-0 items-center pl-2.5">
                    <MiniIcon path={iconeTelephone} color="color-mix(in srgb, var(--tx) 30%, transparent)" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIndicatifOuvert((v) => !v)}
                  className="flex shrink-0 items-center gap-1 border-r px-2.5 py-2.5"
                  style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}
                >
                  <span className="text-[12px]">{indicatifChoisi.drapeau}</span>
                  <span className="text-[10px] font-semibold" style={{ color: "var(--tx)" }}>{indicatifChoisi.code}</span>
                  <MiniIcon path="M6 9l6 6 6-6" color="color-mix(in srgb, var(--tx) 30%, transparent)" />
                </button>
                <input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value.replace(/[^\d\s]/g, ""))}
                  placeholder={t("Numéro de téléphone", "Phone number")}
                  className="flex-1 bg-transparent px-3 py-2.5 text-[10px] outline-none"
                  style={{ color: "var(--tx)" }}
                />
                {indicatifOuvert && (
                  <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[175px] overflow-hidden rounded-xl border shadow-lg" style={{ ...bordure, background: "var(--bg)" }}>
                    {INDICATIFS.map((ind) => (
                      <button
                        key={ind.code}
                        type="button"
                        onClick={() => {
                          setIndicatifChoisi(ind);
                          setIndicatifOuvert(false);
                        }}
                        className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[10px]"
                        style={ind.code === indicatifChoisi.code ? { background: "color-mix(in srgb, var(--ac) 10%, transparent)", color: "var(--ac)", fontWeight: 600 } : { color: "var(--tx)" }}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-[12px]">{ind.drapeau}</span>
                          {t(ind.pays, ind.paysEn)}
                        </span>
                        <span className="font-figures">{ind.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {f.boutonLocaliser &&
            (geoloc === "trouvee" ? (
              <div
                className="mt-2 flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-semibold"
                style={{ borderColor: "#1E9E6A", color: "#1E9E6A", background: "color-mix(in srgb, #1E9E6A 6%, transparent)" }}
              >
                <MiniIcon path="M5 12l4 4 10-10" color="#1E9E6A" />
                <span>
                  {t("Position trouvée", "Position found")}
                  <br />
                  <span className="font-normal opacity-80">{t("Adresse précise remplie", "Precise address filled in")}</span>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={localiser}
                className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-[10.5px] font-semibold"
                style={{ borderColor: "var(--ac)", color: "var(--ac)" }}
              >
                <MiniIcon path="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z" color="var(--ac)" />
                {geoloc === "recherche" ? t("Recherche en cours…", "Locating…") : t("Me localiser maintenant", "Locate me now")}
              </button>
            ))}
          {geoloc === "refusee" && (
            <p className="mt-1.5 text-[9.5px]" style={{ color: "#D8347E" }}>
              {t("Position indisponible, remplis l'adresse précise à la main.", "Location unavailable, fill in the precise address by hand.")}
            </p>
          )}
          {f.mentionSpecifique && (
            <div className="mt-2 rounded-xl border px-3 py-2 text-[9.5px]" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)", color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>
              {f.mentionType === "choix"
                ? t("Choisis une option pour le livreur (facultatif)", "Pick an option for the courier (optional)")
                : f.mentionType === "date"
                ? t("Une date à préciser pour le livreur ? (facultatif)", "A date for the courier? (optional)")
                : t("Une précision pour le livreur ? (facultatif)", "Anything the courier should know? (optional)")}
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`flex-1 py-3 text-center text-[12px] font-bold text-white transition hover:brightness-110 ${classeAnimationBoutonCommande(state.mouvements.boutonCommandeAnimation)}`}
              style={{ background: style_boutonCommandeBg(state), borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
            >
              {t(...BOUTON_COMMANDE_LABELS[state.paiement.boutonTexte])}
              {state.paiement.totalDansBouton && (
                <>
                  {" "}
                  · <span className="font-figures-bold">{(state.paiement.payerEnLigne ? prixLigne : PRODUIT_APERCU.prixVente).toLocaleString("fr-FR")} F</span>
                </>
              )}
            </button>
            {state.paiement.boutonSecondaire !== "aucun" && (
              <button
                type="button"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center border"
                style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)", borderRadius: "12px" }}
                aria-label={state.paiement.boutonSecondaire === "favori" ? t("Ajouter aux favoris", "Add to favorites") : t("Partager", "Share")}
              >
                <MiniIcon
                  path={
                    state.paiement.boutonSecondaire === "favori"
                      ? "M12 20s-6.2-3.9-8.4-7.6C1.8 9.4 3.6 6 7 6c1.9 0 3.4 1 5 2.8C13.6 7 15.1 6 17 6c3.4 0 5.2 3.4 3.4 6.4C18.2 16.1 12 20 12 20Z"
                      : "M18 8a3 3 0 1 0-2.8-4M18 16a3 3 0 1 0-2.8 4M6 13.5a3 3 0 1 0 0-3M8.7 11.2l6.6-3.7M8.7 14.8l6.2 3.5"
                  }
                  color="var(--tx)"
                />
              </button>
            )}
          </div>
          {state.paiement.rangeeConfiance && (
            <div className="mt-2.5 flex items-center justify-around gap-1">
              {CONFIANCE_ITEMS.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 px-1 text-center">
                  <MiniIcon path={item.icon} color="var(--ac)" />
                  <span className="text-[7.5px] font-semibold leading-tight" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
                    {t(item.label, item.labelEn)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "onglets-details": {
      const o = state.ongletsDetails;
      const isHalo = state.style.modele === "halo";
      const estLivraison = /livraison/i.test(o.onglets[0] ?? "");
      const contenu = estLivraison ? (
        <p className="text-[10.5px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
          {texteAvecChiffres(
            t(
              "Livraison en 4 h en moyenne partout en Côte d'Ivoire. Retours acceptés sous 7 jours.",
              "Delivery in 4 h on average across Ivory Coast. Returns accepted within 7 days."
            )
          )}
        </p>
      ) : o.atoutsAvecIcones ? (
        <ul className="space-y-1.5">
          {o.atouts.slice(0, o.nombreAtouts).map((a) => (
            <li key={a} className="flex items-start gap-1.5 text-[10.5px]" style={{ color: "color-mix(in srgb, var(--tx) 65%, transparent)" }}>
              <span
                className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--ac) 12%, transparent)" }}
              >
                <MiniIcon path="M5 12l4 4 10-10" color="var(--ac)" />
              </span>
              {a}
            </li>
          ))}
        </ul>
      ) : null;
      return (
        <div className="px-4 py-3.5">
          {o.presentation === "accordeon" ? (
            <div>
              {o.onglets.map((onglet, i) => (
                <div key={i} className="border-t py-2 first:border-t-0" style={{ borderColor: "color-mix(in srgb, var(--tx) 08%, transparent)" }}>
                  <div className="flex items-center justify-between text-[10.5px] font-semibold">
                    <span>{onglet}</span>
                    <span style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>{i === 0 ? "−" : "+"}</span>
                  </div>
                  {i === 0 && <div className="mt-2">{contenu}</div>}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex gap-1 rounded-full p-1" style={{ background: "color-mix(in srgb, var(--tx) 05%, transparent)" }}>
                {o.onglets.map((onglet, i) => (
                  <span
                    key={i}
                    className="flex-1 truncate rounded-full py-1.5 text-center text-[9.5px] font-semibold"
                    style={i === 0 ? { background: "var(--ac)", color: "#fff" } : { color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}
                  >
                    {onglet}
                  </span>
                ))}
              </div>
              <div className="mt-3">{contenu}</div>
            </>
          )}
          {o.grandeImage && (
            <div
              className="relative mt-3 flex items-center justify-center overflow-hidden rounded-xl"
              style={{
                aspectRatio: "16/9",
                background: isHalo ? "linear-gradient(150deg, #F7D9EA, #E9DFF7 55%, #FCE9EF)" : "color-mix(in srgb, var(--tx) 04%, transparent)",
              }}
            >
              {isHalo && <HaloCourbes />}
              <MiniIcon path="M4 6h4l1.4-2h5.2L16 6h4v12H4Z" color="color-mix(in srgb, var(--tx) 25%, transparent)" />
            </div>
          )}
        </div>
      );
    }

    case "avis": {
      const a = state.avis;
      const cols = device === "phone" ? 1 : a.colonnesOrdinateur;
      const avisAffiches = AVIS_APERCU.slice(0, Math.min(AVIS_APERCU.length, a.nombreAffiches));
      const filtres = [t("Tous", "All"), ...(a.photosClients ? [t("Avec photos", "With photos")] : []), t("5 étoiles", "5 stars"), t("4 étoiles", "4 stars")];
      const resume = (
        <>
          <span className="text-[30px] font-figures-bold leading-none">{PRODUIT_APERCU.note}</span>
          <Etoiles note={PRODUIT_APERCU.note} taille={15} couleur={couleurEtoiles} />
          <p className="mt-1 text-[11px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
            <span className="font-figures">{PRODUIT_APERCU.avisCount}</span> {t("avis", "reviews")}
          </p>
          {device !== "phone" && (
            <div className="mt-3 flex flex-col gap-1.5">
              {AVIS_DISTRIBUTION_APERCU.map((d) => (
                <div key={d.etoiles} className="flex items-center gap-2">
                  <span className="w-2.5 shrink-0 text-[9px] font-figures" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>{d.etoiles}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--tx) 08%, transparent)" }}>
                    <span className="block h-full rounded-full" style={{ width: `${d.pourcent}%`, background: "#F2A93B" }} />
                  </span>
                </div>
              ))}
            </div>
          )}
          {a.compteurAchatsVerifies && (
            <span
              className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-bold"
              style={{ background: "color-mix(in srgb, #1E9E6A 12%, transparent)", color: "#1F8A5B" }}
            >
              <MiniIcon path="M5 12l4 4 10-10" color="#1E9E6A" />
              {texteAvecChiffres(t("118 achats vérifiés", "118 verified purchases"))}
            </span>
          )}
        </>
      );
      return (
        <div className="px-4 py-3.5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[15px] font-bold">{t("Ce que disent nos clientes", "What our customers say")}</p>
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold" style={{ color: "var(--ac)" }}>
              {t("Tous les avis", "See all reviews")}
              <MiniIcon path="M9 5l7 7-7 7" color="var(--ac)" />
            </span>
          </div>

          {a.filtres && (
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {filtres.map((f, i) => (
                <span
                  key={f}
                  className="shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold"
                  style={
                    i === 0
                      ? { background: "#0B0E1C", color: "#fff" }
                      : { border: "1px solid color-mix(in srgb, var(--tx) 10%, transparent)", color: "color-mix(in srgb, var(--tx) 55%, transparent)" }
                  }
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className={device === "phone" ? "flex flex-col gap-3" : "flex items-start gap-3"}>
            {a.resumeDesNotes && (
              <div
                className={device === "phone" ? "w-full rounded-xl border px-4 py-5" : "w-[168px] shrink-0 rounded-xl border px-4 py-5"}
                style={{ borderColor: "color-mix(in srgb, var(--tx) 06%, transparent)" }}
              >
                {resume}
              </div>
            )}
            <div className="grid flex-1 gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {avisAffiches.map((av) => (
                <div key={av.nom} className="rounded-xl border px-3 py-2.5" style={{ borderColor: "color-mix(in srgb, var(--tx) 06%, transparent)" }}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9.5px] font-bold text-white" style={{ background: "var(--ac)" }}>
                      {av.initiales}
                    </span>
                    <p className="min-w-0 truncate text-[11px] font-bold">{av.nom}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Etoiles note={av.note} taille={9} couleur={couleurEtoiles} />
                    {a.date && (
                      <span className="text-[9px]" style={{ color: "color-mix(in srgb, var(--tx) 40%, transparent)" }}>
                        {texteAvecChiffres(t(`${av.jour} sept.`, `Sep ${av.jour}`))}
                      </span>
                    )}
                    {av.verifie && (
                      <span className="text-[9px] font-semibold" style={{ color: "#1F8A5B" }}>
                        ✓ {t("Achat vérifié", "Verified purchase")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>{t(av.texte, av.texteEn)}</p>
                  {a.photosClients && av.photos && (
                    <div className="mt-1.5 flex gap-1.5">
                      {(["flacon", "pot"] as const).map((v, i) => (
                        <span key={i} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--tx) 04%, transparent)" }}>
                          <ProduitIllustration variante={v} accent="var(--ac)" />
                        </span>
                      ))}
                    </div>
                  )}
                  {a.reponsesBoutique && av.reponse && (
                    <div className="mt-1.5 rounded-lg border-l-2 px-2 py-1.5 text-[9.5px]" style={{ borderColor: "var(--ac)", background: "color-mix(in srgb, var(--tx) 03%, transparent)", color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
                      <b style={{ color: "var(--ac)" }}>{boutiqueNom} :</b> {t(av.reponse, av.reponseEn ?? av.reponse)}
                    </div>
                  )}
                  {a.produitSousAvis && av.produit && (
                    <div className="mt-1.5 flex items-center gap-1.5 border-t pt-1.5" style={{ borderColor: "color-mix(in srgb, var(--tx) 06%, transparent)" }}>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded" style={{ background: "color-mix(in srgb, var(--tx) 04%, transparent)" }}>
                        <ProduitIllustration variante={av.produit.illustration} accent="color-mix(in srgb, var(--tx) 35%, transparent)" />
                      </span>
                      <span className="truncate text-[9px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
                        {t(av.produit.nom, av.produit.nomEn)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "faq": {
      const fq = state.faq;
      const colonnes = device === "phone" ? "grid-cols-1" : fq.colonnes === "deux" ? "grid-cols-2" : "grid-cols-1";
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Questions fréquentes", "Frequently asked questions")}</p>

          {fq.rechercheActivee && (
            <div
              className="mb-2.5 flex items-center gap-1.5 rounded-full border px-2.5 py-1.5"
              style={{ borderColor: "color-mix(in srgb, var(--tx) 10%, transparent)" }}
            >
              <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" color="color-mix(in srgb, var(--tx) 30%, transparent)" />
              <span className="text-[9.5px]" style={{ color: "color-mix(in srgb, var(--tx) 35%, transparent)" }}>
                {t("Rechercher une question…", "Search a question…")}
              </span>
            </div>
          )}

          <div className={`grid ${colonnes} gap-2`}>
            {fq.items.map((q, i) => {
              const ouverte = i === 0 && fq.premiereOuverte ? true : !!q.ouverte;
              return (
                <div
                  key={i}
                  className="rounded-xl border px-2.5 py-2"
                  style={{
                    borderColor: ouverte ? "color-mix(in srgb, var(--ac) 30%, transparent)" : "color-mix(in srgb, var(--tx) 08%, transparent)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-semibold leading-snug">{texteAvecChiffres(q.question)}</p>
                    <span className="mt-0.5 shrink-0" style={{ color: "var(--ac)" }}>
                      {fq.icone === "fleche" ? (
                        <MiniIcon path={ouverte ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} color="var(--ac)" />
                      ) : (
                        <span className="text-[11px] font-semibold">{ouverte ? "−" : "+"}</span>
                      )}
                    </span>
                  </div>
                  {ouverte && (
                    <p className="mt-1 text-[9px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
                      {texteAvecChiffres(q.reponse)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {fq.boutonPoserQuestion && (
            <button
              type="button"
              className="mt-2.5 w-full rounded-full border py-1.5 text-[9.5px] font-semibold"
              style={{ borderColor: "color-mix(in srgb, var(--ac) 35%, transparent)", color: "var(--ac)" }}
            >
              {t("Poser une question", "Ask a question")}
            </button>
          )}
        </div>
      );
    }

    case "produits-lies": {
      if (!state.cartesProduit.zones.includes("vous-aimerez-aussi")) return null;
      const pl = state.produitsLies;
      const c = state.cartesProduit;
      const g: Pick<EditeurState["grille"], "badges" | "coeurFavoris" | "noteEtoiles" | "prixAffiche" | "bouton"> = {
        badges: state.grille.badges,
        prixAffiche: state.grille.prixAffiche,
        noteEtoiles: pl.noteEtoiles,
        coeurFavoris: pl.coeurFavoris,
        bouton: pl.bouton,
      };
      const cols = device === "phone" ? pl.colonnesTelephone : pl.colonnesOrdinateur;
      const rayon = c.style === "sans-cadre" ? 0 : state.style.arrondi;
      const espace = c.densite === "compacte" ? "gap-2.5" : "gap-3.5";
      const paddingTexte = c.densite === "compacte" ? "px-1.5 py-1" : "px-1.5 py-1.5";
      const dotsCouleurs = ["#0B0E1C", state.style.couleurPrincipale, "#F5C1DC"];
      const produits = PRODUITS_GRILLE_APERCU.slice(0, pl.nombre);
      const meilleureVenteIndex = indexMeilleureVente(produits);
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Vous aimerez aussi", "You may also like")}</p>
          <div className={`grid ${espace}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
            {produits.map((p, i) => (
              <CarteProduit
                key={p.nom}
                p={p}
                g={g}
                c={c}
                dotsCouleurs={dotsCouleurs}
                rayon={rayon}
                paddingTexte={paddingTexte}
                couleurEtoiles={couleurEtoiles}
                scroll={false}
                variante={PRODUIT_ILLUSTRATIONS[i % PRODUIT_ILLUSTRATIONS.length]}
                badge={i === meilleureVenteIndex ? "populaire" : p.ventes30j === 0 ? "nouveau" : undefined}
                t={t}
              />
            ))}
          </div>
        </div>
      );
    }

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
        degrade: { background: isHalo ? "linear-gradient(120deg,#E8207E,#3A1D8A)" : "linear-gradient(120deg,#EC0C8C,#3A1D8A)", color: "#F5E9FF", sousTexte: "rgba(255,255,255,.5)" },
      };
      const fond = fondsPied[p.couleur];
      const sombreFond = p.couleur !== "clair";
      const centre = p.alignement === "centre";
      const tailleLogoPx = p.tailleLogo === "petite" ? 16 : p.tailleLogo === "grande" ? 26 : 20;
      const traitCouleur = sombreFond ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)";
      const puceCouleur = sombreFond ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.05)";
      const groupes = PIED_GROUPES_APERCU.slice(0, p.colonnesLiens);
      const nbColonnes = groupes.length + (p.moyensPaiement ? 1 : 0);
      // Téléphone + "Colonnes repliables" : empilées en une seule liste plutôt
      // qu'un vrai accordéon interactif (cf. "entete/resteVisible" plus haut,
      // même simplification assumée — l'aperçu reste honnête sur le contenu,
      // pas sur la nuance d'interaction).
      const colsGrille = device === "phone" ? (p.colonnesRepliablesTelephone ? 1 : Math.min(2, nbColonnes)) : nbColonnes;
      return (
        <div className="relative overflow-hidden px-4 py-4 text-[10px]" style={{ background: fond.background, color: fond.color }}>
          {/* mêmes courbes que la grande image, convergeant vers un point lumineux — motif Halo (maquette) */}
          {isHalo && sombreFond && <HaloCourbes ton="sombre" />}

          <div
            className="relative overflow-hidden rounded-2xl border px-2.5 py-2"
            style={{ borderColor: traitCouleur, background: sombreFond ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)" }}
          >
            <div className={`flex items-start gap-2.5 ${centre ? "flex-col items-center text-center" : ""}`}>
              {p.logoAffiche && <Marque logo={logo} taille={tailleLogoPx} />}
              <div className="min-w-0 flex-1">
                <b className="block text-[12px]" style={{ color: sombreFond ? "#fff" : "var(--tx)" }}>
                  {boutiqueNom}
                </b>
                {p.presentation && (
                  <p className="mt-0.5 text-[9px] leading-relaxed" style={{ opacity: 0.6 }}>
                    {t(
                      "Des soins naturels pour le visage et le corps, préparés avec des recettes sûres.",
                      "Natural skincare for face and body, made with safe recipes."
                    )}
                  </p>
                )}
              </div>
            </div>

            {p.reseaux && (
              <div className={`mt-2 flex items-center gap-1.5 ${centre ? "justify-center" : ""}`}>
                {PIED_RESEAUX_ICONES.map((path, i) => (
                  <span
                    key={i}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: sombreFond ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)" }}
                  >
                    <MiniIcon path={path} color={sombreFond ? "#fff" : "var(--tx)"} />
                  </span>
                ))}
              </div>
            )}

            {nbColonnes > 0 && (
              <div
                className="mt-2.5 grid gap-x-8 gap-y-2.5 border-t pt-2.5"
                style={{
                  gridTemplateColumns: `repeat(${colsGrille}, max-content)`,
                  justifyContent: centre ? "center" : "start",
                  borderColor: traitCouleur,
                }}
              >
                {groupes.map((g) => (
                  <div key={g.titre[0]} className={centre ? "text-center" : ""}>
                    <p className="text-[9.5px] font-bold">{t(...g.titre)}</p>
                    <div className="mt-1.5 flex flex-col gap-1">
                      {g.liens.map((lien) => (
                        <span key={lien[0]} className="truncate text-[9px]" style={{ opacity: 0.6 }}>
                          {t(...lien)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {p.moyensPaiement && (
                  <div className={centre ? "text-center" : ""}>
                    <p className="text-[9.5px] font-bold">{t("Paiement", "Payment")}</p>
                    <div className={`mt-1.5 grid grid-cols-2 gap-1.5 ${centre ? "justify-items-center" : ""}`}>
                      {PIED_PAIEMENT_APERCU.map((m) => (
                        <span key={m.label} className="flex items-center gap-1 rounded-lg px-1.5 py-1" style={{ background: puceCouleur }}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- aperçu, pas une image du domaine */}
                          <img src={m.logo} alt="" className="h-3.5 w-3.5 shrink-0 rounded-[3px] object-contain" />
                          <span className="truncate text-[7.5px] font-semibold">{m.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`relative mt-3 flex flex-wrap items-center gap-2 ${centre ? "justify-center text-center" : "justify-between"}`}>
            <p className="text-[8.5px]" style={{ color: fond.sousTexte }}>
              {texteAvecChiffres(p.mentionBas)} · {t("Conditions de vente", "Terms of sale")} · {t("Confidentialité", "Privacy")}
            </p>
            {state.avis.compteurAchatsVerifies && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-semibold"
                style={{ background: "rgba(63,203,142,.16)", color: "#5FE0AA" }}
              >
                <MiniIcon path="M5 12l4 4 10-10" color="#5FE0AA" />
                {texteAvecChiffres(t("118 achats vérifiés", "118 verified purchases"))}
              </span>
            )}
          </div>
        </div>
      );
    }

    // Élément flottant, pas une section dans le flux : déjà rendu en overlay
    // par ElementsFlottantsApercu ci-dessus (cf. `barreCommande`), quelle que
    // soit sa position dans `state.sections` — rien à afficher ici.
    case "bouton-commande-fixe":
      return null;

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

/*
  Rayons fins divergeant d'un point lumineux + feuilles éparpillées — décor
  du hero grande-image du modèle Halo (maquette), remplace HaloCourbes pour
  ce cas précis : un point de lumière près du produit d'où partent des
  traits droits, quelques feuilles translucides et deux points dorés.
*/
function HaloRayons() {
  const foyer = { x: 330, y: 92 };
  const rayons: [number, number][] = [
    [4, 22], [4, 92], [4, 168], [70, 6], [96, 190], [180, 2],
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
      <radialGradient id="halo-rayons-foyer">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      {rayons.map(([x, y], i) => (
        <linearGradient key={i} id={`halo-rayon-fade-${i}`} x1={foyer.x} y1={foyer.y} x2={x} y2={y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      ))}
      {rayons.map(([x, y], i) => (
        <line key={i} x1={foyer.x} y1={foyer.y} x2={x} y2={y} stroke={`url(#halo-rayon-fade-${i})`} strokeWidth="0.75" />
      ))}
      <circle cx={foyer.x} cy={foyer.y} r="14" fill="url(#halo-rayons-foyer)" />
      <path d="M244 34 C 254 19, 274 19, 279 36 C 274 52, 254 52, 244 34Z" fill="rgba(255,255,255,.18)" transform="rotate(-25 261 36)" />
      <path d="M296 146 C 308 129, 330 131, 334 150 C 328 168, 306 166, 296 146Z" fill="rgba(255,255,255,.16)" transform="rotate(15 315 148)" />
      <path d="M366 58 C 376 44, 394 46, 396 62 C 392 78, 374 76, 366 58Z" fill="rgba(255,255,255,.16)" transform="rotate(40 381 60)" />
      <circle cx="226" cy="58" r="2" fill="#F5D36B" />
      <circle cx="356" cy="138" r="2" fill="#F5D36B" />
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

/*
  Images de produit test (photos réelles) — deux photos de test (serum1/
  serum2, cf. public/images) remplacent les silhouettes SVG le temps de
  vérifier le rendu visuel avec de vraies photos plutôt que des glyphes,
  cf. [[dashboard-mock-data-pending-laravel-api]]. Alternance par variante
  (flacon/pompe → serum1, pot/tube → serum2), pas un vrai lien produit→photo.
*/
const PRODUIT_ILLUSTRATIONS = ["flacon", "pot", "tube", "pompe"] as const;
type ProduitIllustrationId = (typeof PRODUIT_ILLUSTRATIONS)[number];
const PRODUIT_ILLUSTRATION_SRC: Record<ProduitIllustrationId, string> = {
  flacon: "/images/serum1.avif",
  pompe: "/images/serum1.avif",
  pot: "/images/serum2.jpg",
  tube: "/images/serum2.jpg",
};

function ProduitIllustration({ variante }: { variante: ProduitIllustrationId; accent?: string }) {
  return (
    <img
      src={PRODUIT_ILLUSTRATION_SRC[variante]}
      alt=""
      className="h-full w-full object-cover"
      aria-hidden
    />
  );
}

function FeuilleDecor({ className, color = "#fff", opacity = 0.2 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 40 64" className={className} aria-hidden>
      <path d="M20 2C7 11 3 30 20 62 37 30 33 11 20 2Z" fill={color} fillOpacity={opacity} />
      <path d="M20 8v50" stroke={color} strokeOpacity={Math.min(opacity + 0.15, 1)} strokeWidth={1.2} />
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

// "Variantes · Présentation" (panneau "Informations produit", cf. ReglagesSection.tsx) —
// première variante toujours mise en avant (choix par défaut), comme l'ancien rendu "cases".
function VariantesApercu({
  presentation,
  variantes,
  t,
}: {
  presentation: EditeurState["infos"]["variantesPresentation"];
  variantes: readonly string[];
  t: (fr: string, en: string) => string;
}) {
  const bordureClaire = "color-mix(in srgb, var(--tx) 12%, transparent)";
  const styleChoisi = { borderColor: "var(--ac)", color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 8%, transparent)" };
  if (presentation === "liste") {
    return (
      <div className="flex flex-col gap-1.5">
        {variantes.map((v, i) => (
          <div
            key={v}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[10.5px] font-semibold"
            style={i === 0 ? styleChoisi : { borderColor: bordureClaire }}
          >
            <span
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px]"
              style={i === 0 ? { borderColor: "var(--ac)" } : { borderColor: bordureClaire }}
            >
              {i === 0 && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ac)" }} />}
            </span>
            {v}
          </div>
        ))}
      </div>
    );
  }
  if (presentation === "ronds") {
    return (
      <div className="flex flex-wrap gap-2">
        {variantes.map((v, i) => (
          <span
            key={v}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-[8.5px] font-figures-bold leading-tight"
            style={i === 0 ? styleChoisi : { borderColor: bordureClaire }}
          >
            {v.split(" ")[0]}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {variantes.map((v, i) => (
        <span key={v} className="rounded-lg border px-3 py-1 text-[10px] font-figures-bold" style={i === 0 ? styleChoisi : { borderColor: bordureClaire }}>
          {v}
        </span>
      ))}
    </div>
  );
}

// Étiquette "Meilleure vente" (statut réel, dérivé de vosVentes30j) : la
// référence la plus vendue du lot affiché — recalculé à chaque rangée
// (grille pleine vs "Vous aimerez aussi") puisque le lot change selon
// `nombre`. Pas d'égalité gérée à la main : reduce garde le premier max.
function indexMeilleureVente(produits: (typeof PRODUITS_GRILLE_APERCU)[number][]): number {
  return produits.reduce((meilleur, p, i) => (p.ventes30j > produits[meilleur].ventes30j ? i : meilleur), 0);
}

// Corps de carte produit partagé par case "grille" (accueil) et case
// "produits-lies" (commande, "Vous aimerez aussi") — mêmes réglages de
// contenu (state.grille) et de style (state.cartesProduit) dans les deux cas,
// pour que les deux rangées restent identiques par construction.
function CarteProduit({
  p,
  g,
  c,
  dotsCouleurs,
  rayon,
  paddingTexte,
  couleurEtoiles,
  scroll,
  variante,
  badge,
  compact,
  t,
}: {
  p: (typeof PRODUITS_GRILLE_APERCU)[number];
  g: Pick<EditeurState["grille"], "badges" | "coeurFavoris" | "noteEtoiles" | "prixAffiche" | "bouton">;
  c: EditeurState["cartesProduit"];
  dotsCouleurs: string[];
  rayon: number;
  paddingTexte: string;
  couleurEtoiles: string;
  /** Carte de largeur fixe dans une rangée défilante (produits-lies, grille en mode défilement téléphone) vs cellule de grille pleine largeur. */
  scroll: boolean;
  variante: ProduitIllustrationId;
  /** "populaire" = référence la plus vendue du lot, "nouveau" = pas encore de vente (cf. indexMeilleureVente ci-dessus). */
  badge?: "populaire" | "nouveau";
  /** Grille de produits de l'accueil seulement (cf. retour utilisateur "cards trop grandes") :
      photo moins haute, coins et icônes plus petits — "Vous aimerez aussi" garde la taille normale. */
  compact?: boolean;
  t: (fr: string, en: string) => string;
}) {
  const enPromo = g.prixAffiche === "en-ligne" && p.prixNormal > p.prix;
  const etiquette = badge && (
    <span
      className="inline-block rounded-full px-1.5 py-0.5 text-[6.5px] font-bold text-white"
      style={{ background: badge === "populaire" ? "#D8347E" : "linear-gradient(100deg,#6B21D6,#3A1D8A)" }}
    >
      {badge === "populaire" ? t("Meilleure vente", "Best seller") : t("Nouveauté", "New")}
    </span>
  );
  // Coins de carte plafonnés à 10px : le réglage global "Formes et espaces"
  // (arrondi, jusqu'à ~28px pour les boutons/champs) rendait ces petites
  // cartes trop arrondies (cf. capture utilisateur du 2026-09-21) — la
  // carte produit garde des coins nets même quand le site choisit un style
  // très arrondi ailleurs.
  const rayonCarte = Math.min(rayon, compact ? 8 : 10);
  const iconeTaille = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden ${scroll ? "w-24 shrink-0" : ""} ${c.style === "bordure" ? "border" : ""}`}
      style={{
        borderColor: c.style === "bordure" ? "color-mix(in srgb, var(--tx) 14%, transparent)" : undefined,
        borderRadius: rayonCarte,
        boxShadow: c.style === "ombre" ? "var(--card-shadow)" : undefined,
      }}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: compact ? "6/5" : "1/1", background: "linear-gradient(160deg, color-mix(in srgb, var(--ac) 16%, transparent), color-mix(in srgb, var(--tx) 04%, transparent) 75%)" }}
      >
        <ProduitIllustration variante={variante} accent="var(--ac)" />
        {c.deuxiemePhotoSurvol && (
          <div className="absolute inset-0 bg-black/0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: "color-mix(in srgb, var(--tx) 08%, transparent)" }} />
        )}
        {g.badges && c.positionBadges === "coin" && etiquette && <span className="absolute left-1.5 top-1.5">{etiquette}</span>}
        {g.coeurFavoris && (
          <span className={`absolute right-1.5 top-1.5 flex items-center justify-center rounded-full bg-white/85 ${iconeTaille}`}>
            <MiniIcon path="M12 20s-6.2-3.9-8.4-7.6C1.8 9.4 3.6 6 7 6c1.9 0 3.4 1 5 2.8C13.6 7 15.1 6 17 6c3.4 0 5.2 3.4 3.4 6.4C18.2 16.1 12 20 12 20Z" color="var(--ac)" />
          </span>
        )}
        {c.commandeRapide && (
          <span
            className={`absolute bottom-1.5 right-1.5 flex items-center justify-center rounded-full text-white opacity-0 transition duration-200 group-hover:opacity-100 ${iconeTaille}`}
            style={{ background: "var(--ac)" }}
          >
            <MiniIcon path="M12 5v14M5 12h14" color="#fff" />
          </span>
        )}
      </div>
      {/* flex-col + le bloc infos en flex-1 : le bouton reste collé en bas
          de chaque carte, aligné sur toute la rangée, même quand une carte a
          un nom sur deux lignes ou une étiquette que sa voisine n'a pas
          (cf. capture utilisateur du 2026-09-21, boutons pas alignés). */}
      <div className={`flex flex-1 flex-col ${paddingTexte}`}>
        <div className="flex-1">
          {g.badges && c.positionBadges === "dessous" && etiquette && <div className="mb-0.5">{etiquette}</div>}
          <p className="truncate text-[8px] font-semibold">{t(p.nom, p.nomEn)}</p>
          {p.contenance && <p className="text-[7px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>{p.contenance}</p>}
          {g.noteEtoiles && (
            <p className="mt-0.5 flex items-center gap-1">
              <Etoiles note={p.note} taille={6} couleur={couleurEtoiles} />
              <span className="text-[6.5px]" style={{ color: "color-mix(in srgb, var(--tx) 40%, transparent)" }}>({p.avisCount})</span>
            </p>
          )}
          {c.rondsCouleurVariantes && (
            <div className="mt-0.5 flex gap-0.5">
              {dotsCouleurs.map((couleur) => (
                <span key={couleur} className="h-2 w-2 rounded-full border border-white/40" style={{ background: couleur }} />
              ))}
            </div>
          )}
          <p className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[9.5px] font-figures-bold" style={{ color: "var(--ac)" }}>
              {(g.prixAffiche === "normal" ? p.prixNormal : p.prix).toLocaleString("fr-FR")} F
            </span>
            {enPromo && (
              <span className="text-[7px] line-through font-figures" style={{ color: "color-mix(in srgb, var(--tx) 35%, transparent)" }}>
                {p.prixNormal.toLocaleString("fr-FR")} F
              </span>
            )}
          </p>
          {enPromo && <p className="text-[6px]" style={{ color: "color-mix(in srgb, var(--tx) 40%, transparent)" }}>{t("en payant en ligne", "when paying online")}</p>}
        </div>
        {g.bouton === "texte" && (
          <span className="mx-2 mt-1 flex items-center justify-center gap-1 rounded-full py-1 text-[7px] font-semibold text-white" style={{ background: "var(--ac)" }}>
            <MiniIcon path="M5.5 8h13l-1 12.5h-11ZM9 8V6.5a3 3 0 0 1 6 0V8" color="#fff" />
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
  );
}
