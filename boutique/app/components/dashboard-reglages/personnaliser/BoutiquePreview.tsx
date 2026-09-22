"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import * as DrapeauxSvg from "country-flag-icons/react/3x2";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { texteAvecChiffres } from "../../dashboard-accueil/shared";
import type { Appareil, EditeurState, FormulaireState, PageId, SectionId } from "./types";
import { SECTIONS_DEFAUT } from "./types";
import { posterDonneesApercu, estMessageApercuPret } from "../../boutique-publique/PreviewMode";
import { PRODUIT_DEMO as PRODUIT_APERCU, PRODUITS_DEMO as PRODUITS_GRILLE_APERCU, CATEGORIES_DEMO as CATEGORIES_APERCU, fabriquerAvisDemo } from "../../../../lib/boutique-demo";

// Alias pour compatibilité avec SectionRendue (ancienne API) — supprimés de types.ts
const AVIS_APERCU = fabriquerAvisDemo();
// AVIS_DISTRIBUTION_APERCU n'existe plus — SectionAvis calcule depuis avis[]
const AVIS_DISTRIBUTION_APERCU: Record<string, number> = {};


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
// Liste complète des indicatifs (tous pays reconnus par libphonenumber-js),
// pas seulement la Côte d'Ivoire + 5 voisins codés en dur (cf. capture
// utilisateur du 2026-09-21) — noms via Intl.DisplayNames (déjà FR/EN comme
// le reste du fichier), drapeau en SVG local (country-flag-icons) : un emoji
// 🇨🇮 ne s'affiche pas sur Windows (Segoe UI Emoji sans glyphes drapeaux, replié
// en texte "CI"), et une image distante (ex. flagcdn.com) est bloquée par le
// CSP `img-src 'self' blob: data:` (cf. proxy.ts) — le SVG local respecte les
// deux contraintes.
const NOMS_PAYS_FR = new Intl.DisplayNames(["fr"], { type: "region" });
const NOMS_PAYS_EN = new Intl.DisplayNames(["en"], { type: "region" });
const INDICATIFS = getCountries()
  .filter((code) => code in DrapeauxSvg)
  .map((code) => ({
    pays: NOMS_PAYS_FR.of(code) ?? code,
    paysEn: NOMS_PAYS_EN.of(code) ?? code,
    code: `+${getCountryCallingCode(code)}`,
    drapeau: code,
  }))
  .sort((a, b) => a.pays.localeCompare(b.pays, "fr"));
const INDICATIF_DEFAUT = INDICATIFS.find((i) => i.drapeau === "CI") ?? INDICATIFS[0];

function IconeDrapeau({ code, className }: { code: string; className: string }) {
  const Drapeau = DrapeauxSvg[code as keyof typeof DrapeauxSvg];
  return Drapeau ? <Drapeau className={className} /> : null;
}

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

// Rangée de confiance sous le bouton de commande (cf. case "paiement").
const CONFIANCE_ITEMS: { icon: string; label: string; labelEn: string }[] = [
  { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", label: "Livraison rapide", labelEn: "Fast delivery" },
  { icon: "M4 7h16v10H4Zm0 3h16", label: "Paiement sécurisé", labelEn: "Secure payment" },
  { icon: "M12 21s6.5-6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5 6.5 11 6.5 11Z", label: "Retour facile", labelEn: "Easy returns" },
];

/*
  Champs de "Vos informations" (nom, commune, adresse précise, téléphone) —
  extrait en composant indépendant (own useState pour la démo interactive :
  commune/indicatif ouverts, géoloc, adresse modifiable) pour être rendu à
  l'intérieur de la carte "Finaliser ma commande" (case "paiement" de
  SectionRendue, page "commande" uniquement). "formulaire" et "paiement" sont
  fusionnés en une seule carte 2 colonnes (cf. capture utilisateur du
  2026-09-21) : tous deux `verrouillee: true` dans SECTIONS_DEFAUT et déjà
  exclus du repositionnement générique (Monter/Descendre/Largeur/Marges) dans
  ReglagesSection.tsx, donc cette fusion ne casse aucune réorganisation
  possible côté utilisateur. La case "formulaire" du switch ne rend donc plus
  rien elle-même (cf. plus bas) — seul ce composant produit son contenu.
*/
function FormulaireChampsApercu({ f, t }: { f: FormulaireState; t: (fr: string, en: string) => string }) {
  const [communeOuverte, setCommuneOuverte] = useState(false);
  const [communeRecherche, setCommuneRecherche] = useState("");
  const [communeChoisie, setCommuneChoisie] = useState("");
  const [geoloc, setGeoloc] = useState<"repos" | "recherche" | "trouvee" | "refusee">("repos");
  const [adresseModifiable, setAdresseModifiable] = useState(false);
  const [adressePrecise, setAdressePrecise] = useState("");
  const [indicatifOuvert, setIndicatifOuvert] = useState(false);
  const [indicatifRecherche, setIndicatifRecherche] = useState("");
  const [indicatifChoisi, setIndicatifChoisi] = useState(INDICATIF_DEFAUT);
  const [telephone, setTelephone] = useState("");
  const [nomPrenom, setNomPrenom] = useState("");
  const indicatifsFiltres = useMemo(() => {
    const q = indicatifRecherche.trim().toLowerCase();
    if (!q) return INDICATIFS;
    return INDICATIFS.filter((ind) => ind.pays.toLowerCase().includes(q) || ind.paysEn.toLowerCase().includes(q) || ind.code.includes(q));
  }, [indicatifRecherche]);

  const bordure = { borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" };
  const boiteBase = f.styleChamps === "ligne" ? "rounded-none border-0 border-b" : f.styleChamps === "plein" ? "rounded-xl border-0" : "rounded-xl border";
  const boiteClasses = `${boiteBase} px-3 py-2.5`;
  const boiteStyle = (actif?: boolean): React.CSSProperties =>
    f.styleChamps === "plein"
      ? { background: actif ? "color-mix(in srgb, var(--ac) 8%, transparent)" : "color-mix(in srgb, var(--tx) 5%, transparent)" }
      : { borderColor: actif ? "var(--ac)" : bordure.borderColor };
  const libelleDansChamp = f.libellesPosition === "dans-le-champ";
  const libelle = (texte: string) =>
    libelleDansChamp && <p className="text-[7.5px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>{texte}</p>;
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
    <>
      <div className={`grid gap-2 ${f.colonnes === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="col-span-full">
          {labelExterne(t("Nom et prénom", "Full name"))}
          <div className={boiteClasses} style={boiteStyle()}>
            <div className="flex items-center gap-1.5">
              {iconeChamp(iconePersonne)}
              <div className="min-w-0 flex-1">
                {libelleDansChamp && libelle(t("Nom et prénom", "Full name"))}
                <input
                  value={nomPrenom}
                  onChange={(e) => setNomPrenom(e.target.value)}
                  placeholder={libelleDansChamp ? "" : t("Nom et prénom", "Full name")}
                  className={`w-full bg-transparent text-[10px] outline-none ${libelleDansChamp ? "mt-0.5" : ""}`}
                  style={{ color: "var(--tx)" }}
                />
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
                    <span className="truncate text-[10px]" style={{ color: communeChoisie ? "var(--tx)" : "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
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
                    <p className="mt-0.5 truncate text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>{f.texteExempleAdressePrecise}</p>
                  </>
                ) : (
                  <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>{f.libelleAdressePrecise}</p>
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
              <IconeDrapeau code={indicatifChoisi.drapeau} className="h-[9px] w-3 rounded-[1.5px] object-cover" />
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
              <div className="absolute left-0 top-full z-30 mt-1 w-[210px] overflow-hidden rounded-xl border shadow-lg" style={{ ...bordure, background: "var(--bg)" }}>
                <div className="flex items-center gap-1.5 border-b px-2.5 py-2" style={{ borderColor: "color-mix(in srgb, var(--tx) 8%, transparent)" }}>
                  <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" color="color-mix(in srgb, var(--tx) 30%, transparent)" />
                  <input
                    value={indicatifRecherche}
                    onChange={(e) => setIndicatifRecherche(e.target.value)}
                    placeholder={t("Rechercher un pays", "Search a country")}
                    className="w-full bg-transparent text-[10px] outline-none"
                    style={{ color: "var(--tx)" }}
                    autoFocus
                  />
                </div>
                <div className="max-h-[170px] overflow-y-auto">
                  {indicatifsFiltres.map((ind) => (
                    <button
                      key={ind.drapeau}
                      type="button"
                      onClick={() => {
                        setIndicatifChoisi(ind);
                        setIndicatifOuvert(false);
                        setIndicatifRecherche("");
                      }}
                      className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-[10px]"
                      style={ind.drapeau === indicatifChoisi.drapeau ? { background: "color-mix(in srgb, var(--ac) 10%, transparent)", color: "var(--ac)", fontWeight: 600 } : { color: "var(--tx)" }}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <IconeDrapeau code={ind.drapeau} className="h-[9px] w-3 shrink-0 rounded-[1.5px] object-cover" />
                        <span className="truncate">{t(ind.pays, ind.paysEn)}</span>
                      </span>
                      <span className="shrink-0 font-figures">{ind.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {f.boutonLocaliser &&
        (geoloc === "trouvee" ? (
          <>
            {/* Vignette carte statique — cf. capture utilisateur du 2026-09-21,
                panneau 2 "Après « Me localiser »" : rues claires + zone d'eau,
                pin plein centré au-dessus de "Position trouvée". */}
            <div className="relative mt-2 overflow-hidden rounded-xl" style={{ height: 68 }}>
              <svg viewBox="0 0 300 68" preserveAspectRatio="none" className="block h-full w-full">
                <rect width="300" height="68" fill="#EAE3D2" />
                <rect x="0" y="12" width="300" height="7" fill="#F6F1E5" />
                <rect x="46" y="0" width="7" height="68" fill="#F6F1E5" />
                <rect x="130" y="0" width="9" height="68" fill="#F6F1E5" />
                <rect x="0" y="45" width="300" height="6" fill="#F6F1E5" />
                <rect x="205" y="0" width="7" height="68" fill="#F6F1E5" />
                <path d="M215 68 L300 32 L300 68 Z" fill="#C2DBE6" />
                <rect x="64" y="20" width="20" height="16" fill="#DED4BC" />
                <rect x="155" y="49" width="22" height="15" fill="#DED4BC" />
              </svg>
              <span
                className="absolute left-1/2 top-1/2 h-2 w-4 -translate-x-1/2 rounded-full"
                style={{ background: "rgba(0,0,0,.16)", filter: "blur(1px)", marginTop: 9 }}
              />
              <svg viewBox="0 0 24 30" className="absolute left-1/2 top-1/2 h-6 w-5 -translate-x-1/2 -translate-y-[85%]" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>
                <path d="M12 0C5.4 0 0 5.3 0 11.8 0 20.6 12 30 12 30s12-9.4 12-18.2C24 5.3 18.6 0 12 0Z" fill="var(--ac)" />
                <circle cx="12" cy="11.5" r="4.5" fill="#fff" />
              </svg>
            </div>
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
          </>
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
        <div className="mt-2 rounded-xl border px-3 py-2 text-[9.5px]" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)", color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
          {f.mentionType === "choix"
            ? t("Choisis une option pour le livreur (facultatif)", "Pick an option for the courier (optional)")
            : f.mentionType === "date"
            ? t("Une date à préciser pour le livreur ? (facultatif)", "A date for the courier? (optional)")
            : t("Une précision pour le livreur ? (facultatif)", "Anything the courier should know? (optional)")}
        </div>
      )}
    </>
  );
}

// Radio-bouton (cercle plein/vide) et en-tête numéroté rose — répétés pour
// les 4 blocs "1/2/3/4" de la carte "Finaliser ma commande" (case "paiement"
// de SectionRendue, cf. capture utilisateur du 2026-09-21).
function RadioCercle({ actif }: { actif: boolean }) {
  return (
    <span
      className="flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full border-2"
      style={{ borderColor: actif ? "var(--ac)" : "rgba(20,18,32,.25)" }}
    >
      {actif && <span className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--ac)" }} />}
    </span>
  );
}

function TitreNumerote({ n, titre }: { n: number; titre: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <span
        className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
        style={{ background: "var(--ac)" }}
      >
        {n}
      </span>
      <span className="text-[10.5px] font-bold" style={{ color: "#141220" }}>{titre}</span>
    </div>
  );
}

export default function BoutiquePreview({
  state,
  device,
  page,
  boutiqueNom,
  logo,
  donnees,
  slug,
  pleinEcran,
}: {
  state: EditeurState;
  device: Appareil;
  page: PageId;
  boutiqueNom: string;
  logo: string | null;
  /** Données réelles (produits/catégories/avis) passées à l'iframe via postMessage. */
  donnees: import("../../../../lib/boutique-types").BoutiqueDonnees;
  slug: string;
  // Vue "Aperçu" plein écran (œil) : iframe bord à bord, sans cadre de
  // navigateur factice, comme le vrai site.
  pleinEcran?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // URL de base de la route brouillon — changer src = rechargement complet,
  // donc on ne la change QUE quand la page (accueil/commande) change, pas à
  // chaque keystroke de réglage.
  const srcBase = `/boutique/${slug}/apercu${page === "commande" ? "/commande" : ""}`;

  // Pont postMessage : poste donnees à l'iframe dès qu'elle signale "prête"
  // (apercu-pret) ET à chaque changement d'état (réglage en direct).
  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const envoyer = () => {
      if (iframe.contentWindow) posterDonneesApercu(iframe.contentWindow, donnees);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (estMessageApercuPret(event.data)) envoyer();
    };

    window.addEventListener("message", onMessage);
    // Si l'iframe est déjà chargée (ex: changement d'état après montage),
    // envoyer immédiatement sans attendre un nouveau "prêt".
    envoyer();

    return () => window.removeEventListener("message", onMessage);
  }, [donnees, page, slug]);

  // Téléphone : iframe à 375px (vrai téléphone) mise à l'échelle 300/375 dans
  // le cadre de 300px — les media queries Tailwind voient 375px, pas 300px.
  const ECHELLE_PHONE = 300 / 375;

  const iframePhone = (
    <iframe
      ref={iframeRef}
      src={srcBase}
      title={boutiqueNom}
      style={{
        width: 375,
        height: Math.round(600 / ECHELLE_PHONE),
        transform: `scale(${ECHELLE_PHONE})`,
        transformOrigin: "top left",
        border: "none",
        display: "block",
        background: "transparent",
      }}
    />
  );

  if (device === "phone") {
    return (
      <div className="mx-auto w-[300px] shrink-0 rounded-[2.4rem] border-[6px] border-[#141220] bg-[#141220] shadow-[0_30px_70px_-12px_rgba(20,18,32,0.45)]">
        <div className="relative h-[600px] overflow-hidden rounded-[2rem] bg-white">
          <div className="sticky top-0 z-10 flex h-6 items-center justify-center bg-[#fff]">
            <span className="h-4 w-20 rounded-full bg-[#141220]" />
          </div>
          <div style={{ height: "calc(100% - 24px)", overflow: "hidden" }}>
            {iframePhone}
          </div>
        </div>
      </div>
    );
  }

  if (pleinEcran) {
    return (
      <iframe
        ref={iframeRef}
        src={srcBase}
        title={boutiqueNom}
        className="h-full w-full border-none"
      />
    );
  }

  // Cadre "Ordinateur" : iframe pleine largeur dans le cadre redimensionnable.
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
            {page === "commande" ? "/commande" : ""}
          </span>
        </span>
      </div>
      <div className="relative" style={{ height: "calc(100vh - 300px)", minHeight: "440px" }}>
        <iframe
          ref={iframeRef}
          src={srcBase}
          title={boutiqueNom}
          className="h-full w-full border-none"
        />
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
  const lignes = titre.split("\n");
  return (
    <>
      {lignes.map((ligne, i) => {
        const idx = mot ? ligne.toLowerCase().indexOf(mot.toLowerCase()) : -1;
        return (
          <Fragment key={i}>
            {i > 0 && <br />}
            {idx === -1 ? (
              ligne
            ) : (
              <>
                {ligne.slice(0, idx)}
                <span style={{ color: couleur }}>{ligne.slice(idx, idx + mot.length)}</span>
                {ligne.slice(idx + mot.length)}
              </>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

function MiniIcon({ path, color = "currentColor", size = 14 }: { path: string; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ height: size, width: size }} aria-hidden>
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
// `selectionnee`/`onChoisir` (état local du parent, cf. `variantChoisie` dans
// SectionRendue) plutôt qu'un choix figé sur l'index 0 : cliquable comme sur
// une vraie fiche produit (cf. capture utilisateur du 2026-09-21).
function VariantesApercu({
  presentation,
  variantes,
  selectionnee,
  onChoisir,
  t,
}: {
  presentation: EditeurState["infos"]["variantesPresentation"];
  variantes: readonly string[];
  selectionnee: number;
  onChoisir: (i: number) => void;
  t: (fr: string, en: string) => string;
}) {
  const bordureClaire = "color-mix(in srgb, var(--tx) 12%, transparent)";
  const styleChoisi = { borderColor: "var(--ac)", color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 8%, transparent)" };
  if (presentation === "liste") {
    return (
      <div className="flex flex-col gap-1.5">
        {variantes.map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => onChoisir(i)}
            className="flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[10.5px] font-semibold"
            style={i === selectionnee ? styleChoisi : { borderColor: bordureClaire }}
          >
            <span
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px]"
              style={i === selectionnee ? { borderColor: "var(--ac)" } : { borderColor: bordureClaire }}
            >
              {i === selectionnee && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ac)" }} />}
            </span>
            {v}
          </button>
        ))}
      </div>
    );
  }
  if (presentation === "ronds") {
    return (
      <div className="flex flex-wrap gap-2">
        {variantes.map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => onChoisir(i)}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-[8.5px] font-figures-bold leading-tight"
            style={i === selectionnee ? styleChoisi : { borderColor: bordureClaire }}
          >
            {v.split(" ")[0]}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {variantes.map((v, i) => (
        <button
          key={v}
          type="button"
          onClick={() => onChoisir(i)}
          className="rounded-lg border px-3 py-1 text-[10px] font-figures-bold"
          style={i === selectionnee ? styleChoisi : { borderColor: bordureClaire }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// Étiquette "Meilleure vente" (statut réel, dérivé de vosVentes30j) : la
// référence la plus vendue du lot affiché — recalculé à chaque rangée
// (grille pleine vs "Vous aimerez aussi") puisque le lot change selon
// `nombre`. Pas d'égalité gérée à la main : reduce garde le premier max.
