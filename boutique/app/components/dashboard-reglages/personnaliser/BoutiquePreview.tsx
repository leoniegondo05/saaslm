"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import * as DrapeauxSvg from "country-flag-icons/react/3x2";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { texteAvecChiffres } from "../../dashboard-accueil/shared";
import type { Appareil, EditeurState, FormulaireState, PageId, SectionId } from "./types";
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
  sectionChoisie,
  onChoisirSection,
  pleinEcran,
}: {
  state: EditeurState;
  device: Appareil;
  page: PageId;
  boutiqueNom: string;
  logo: string | null;
  sectionChoisie?: SectionId;
  onChoisirSection?: (id: SectionId) => void;
  // Vue "Aperçu" plein écran (œil, cf. PersonnaliserBoutique.tsx) : rendu
  // sans cadre de navigateur factice ni hauteur figée — bord à bord, largeur
  // et défilement naturels de la fenêtre, comme le vrai site le ferait.
  pleinEcran?: boolean;
}) {
  const { t } = useDashboardLangue();
  const { style, texte } = state;
  // "Je commande" (case "infos"/"paiement" de SectionRendue) doit animer le
  // panier de l'entête — deux instances séparées de SectionRendue (une par
  // section), donc l'état du déclenchement vit ici et redescend en props
  // plutôt que dans un state local à l'entête (cf. retour utilisateur du
  // 2026-09-21, "le calque doit se faire au niveau du panier de la navbar").
  const [panierPulseId, setPanierPulseId] = useState(0);
  const declencherPulsePanier = () => setPanierPulseId((n) => n + 1);
  // Recherche de l'entête (case "entete" ci-dessous) : même raison de la
  // lever ici que panierPulseId — l'entête et la grille de produits sont deux
  // instances séparées de SectionRendue, donc le texte tapé doit redescendre
  // en props pour que la grille filtre réellement ses cartes (retour
  // utilisateur : "la barre de recherche du navbar doit être fonctionnelle").
  const [rechercheEntete, setRechercheEntete] = useState("");
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
        // "formulaire" est fusionné dans la carte "Finaliser ma commande" de
        // "paiement" (cf. FormulaireChampsApercu) : pas de wrapper propre,
        // sinon un espace vide (padding de section) apparaît à sa place.
        if (id === "formulaire") return null;
        // "infos" en mode ordinateur (capture du 2026-09-21) : rendue collée à
        // "galerie" dans une même div à 2 colonnes (cf. plus bas, branche
        // id === "galerie") plutôt que dans son propre wrapper pleine largeur.
        if (device === "desktop" && id === "infos" && visibles[i - 1] === "galerie") {
          const secGalerie = state.sections.find((s) => s.id === "galerie");
          if (secGalerie?.visibleOrdinateur) return null;
        }
        const selectionnee = id === sectionChoisie;
        // Bandeau ignore les réglages génériques (Largeur/Marges/Couleurs) :
        // toujours plein-bord, sans marge, avec sa propre couleur (cf. "Affichage"
        // dans Corps ci-dessus) — pas de "Pour cette section" pour lui non plus.
        // Bandeau, entête et pied-de-page : collés bord-à-bord, sans marge verticale ni section-gap.
        const CHROME_EDGE = new Set(["bandeau", "entete", "pied-de-page"]);
        // Barre de confiance qui chevauche la grande image : son propre "-mt-6"
        // (case "confiance" ci-dessous) ne peut remonter que jusqu'au bord de
        // SA boîte — le paddingTop et le marginTop posés ici sur le wrapper
        // restent en dehors de ce collapsing et laissaient un espace blanc
        // entre le hero et la barre. On les annule dans ce cas précis pour
        // qu'elle reste collée au hero, y compris juste après un chargement
        // (avant toute interaction utilisateur).
        const colleAuHero = id === "confiance" && state.confiance.chevaucheGrandeImage && visibles[i - 1] === "grande-image";
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

        // "galerie" + "infos" en mode ordinateur (capture du 2026-09-21) : une
        // seule div "produit", 2 colonnes (galerie à gauche, infos à droite),
        // comme sur une vraie fiche produit — plutôt que 2 blocs pleine
        // largeur empilés (comportement conservé tel quel sur téléphone).
        const secInfos = state.sections.find((s) => s.id === "infos");
        const infosAccolee = id === "galerie" && device === "desktop" && visibles[i + 1] === "infos" && !!secInfos?.visibleOrdinateur;

        const itemStyleCommun = {
          marginTop: i > 0 && !CHROME_EDGE.has(id) && visibles[i - 1] !== "entete" && !colleAuHero ? "var(--section-gap)" : undefined,
          marginLeft: largeurInset,
          marginRight: largeurInset,
        } as React.CSSProperties;

        if (infosAccolee) {
          const defInfos = SECTIONS_DEFAUT.find((d) => d.id === "infos")!;
          const selectionneeInfos = "infos" === sectionChoisie;
          const margeVerticaleInfos = MARGE_SECTION[secInfos!.marges];
          const couleursOverrideInfos: React.CSSProperties =
            secInfos!.couleurs === "nuit"
              ? { background: "#141220", color: "#fff", ["--bg" as string]: "#141220", ["--tx" as string]: "#fff" }
              : secInfos!.couleurs === "douces"
                ? { background: "color-mix(in srgb, var(--ac) 6%, var(--bg))" }
                : {};
          return (
            <div key="galerie-infos" className="grid grid-cols-2 items-start gap-8" style={itemStyleCommun}>
              <div
                onClick={onChoisirSection ? () => onChoisirSection("galerie") : undefined}
                className={onChoisirSection ? "group/hl relative min-w-0 cursor-pointer" : "relative min-w-0"}
                style={{ paddingTop: margeVerticale, paddingBottom: margeVerticale, ...couleursOverride }}
              >
                <SectionRendue id="galerie" state={state} device={device} page={page} boutiqueNom={boutiqueNom} logo={logo} t={t} panierPulseId={panierPulseId} onCommande={declencherPulsePanier} recherche={rechercheEntete} onRechercheChange={setRechercheEntete} />
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
              <div
                onClick={onChoisirSection ? () => onChoisirSection("infos") : undefined}
                className={onChoisirSection ? "group/hl relative min-w-0 cursor-pointer" : "relative min-w-0"}
                style={{ paddingTop: margeVerticaleInfos, paddingBottom: margeVerticaleInfos, ...couleursOverrideInfos }}
              >
                <SectionRendue id="infos" state={state} device={device} page={page} boutiqueNom={boutiqueNom} logo={logo} t={t} panierPulseId={panierPulseId} onCommande={declencherPulsePanier} recherche={rechercheEntete} onRechercheChange={setRechercheEntete} />
                {onChoisirSection && (
                  <div
                    className={`pointer-events-none absolute inset-0 z-20 rounded-[4px] border-[1.5px] border-[#E8207E] transition-opacity ${
                      selectionneeInfos ? "opacity-100" : "opacity-0 group-hover/hl:opacity-100"
                    }`}
                    style={{ boxShadow: "0 0 0 3px rgba(232,32,126,.18)" }}
                  >
                    <span className="absolute -left-[1.5px] -top-[19px] flex items-center gap-1 whitespace-nowrap rounded-t-[5px] bg-[#E8207E] px-[7px] py-[3px] text-[7.5px] font-semibold text-white">
                      {t(defInfos.label, defInfos.labelEn)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={id}
            onClick={onChoisirSection ? () => onChoisirSection(id) : undefined}
            className={onChoisirSection ? "group/hl relative cursor-pointer" : "relative"}
            style={{
              ...itemStyleCommun,
              paddingTop: colleAuHero ? 0 : margeVerticale,
              paddingBottom: margeVerticale,
              ...couleursOverride,
            }}
          >
            <SectionRendue id={id} state={state} device={device} page={page} boutiqueNom={boutiqueNom} logo={logo} t={t} panierPulseId={panierPulseId} onCommande={declencherPulsePanier} recherche={rechercheEntete} onRechercheChange={setRechercheEntete} />
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

  // Vue plein écran (œil "Aperçu") : bord à bord, sans cadre de navigateur
  // factice ni hauteur figée — la fenêtre réelle du visiteur fait défiler la
  // page, comme sur le vrai site (cf. commentaire de `pleinEcran` ci-dessus).
  if (pleinEcran) {
    return (
      <div className="relative w-full">
        {contenu}
        <ElementsFlottantsApercu flottants={state.flottants} boutonTexte={state.paiement.boutonTexte} page={page} device={device} t={t} pleinEcran />
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
  pleinEcran,
}: {
  flottants: EditeurState["flottants"];
  boutonTexte: EditeurState["paiement"]["boutonTexte"];
  page: PageId;
  device: Appareil;
  t: (fr: string, en: string) => string;
  // Vue plein écran : ancré à la fenêtre réelle (fixed) plutôt qu'au bloc
  // d'aperçu (absolute), pour suivre le défilement comme un vrai site.
  pleinEcran?: boolean;
}) {
  // Le bouton de commande fixe n'a de sens que sur téléphone, sur la page de
  // commande (cf. maquette, "Bouton de commande fixe sur téléphone") — sur
  // l'accueil ou sur ordinateur, rien à commander en bas de l'écran.
  const barreCommande = flottants.boutonCommandeTelephone && device === "phone" && page === "commande";
  const basReserve = barreCommande ? 58 : 12; // px laissés libres au-dessus de la barre de commande pour ne pas la recouvrir
  const ancrage = pleinEcran ? "fixed" : "absolute";
  return (
    <div className={`pointer-events-none ${ancrage} inset-0 z-30 ${pleinEcran ? "" : "overflow-hidden rounded-[inherit]"}`}>
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
  panierPulseId,
  onCommande,
  recherche,
  onRechercheChange,
}: {
  id: SectionId;
  state: EditeurState;
  device: Appareil;
  page: PageId;
  boutiqueNom: string;
  logo: string | null;
  t: (fr: string, en: string) => string;
  // Compteur incrémenté par le parent (BoutiquePreview) à chaque "Je
  // commande" — l'entête et "infos"/"paiement" sont des instances séparées
  // de SectionRendue, donc ce signal redescend en prop (cf. onCommande).
  panierPulseId?: number;
  onCommande?: () => void;
  // Texte tapé dans la barre de recherche de l'entête, levé au parent pour la
  // même raison que panierPulseId : la grille de produits (case "grille") est
  // une instance séparée de SectionRendue et doit filtrer sur ce même texte.
  recherche?: string;
  onRechercheChange?: (value: string) => void;
}) {
  const couleurEtoiles = state.style.etoilesCouleur === "principale" ? "var(--ac)" : "#F2A93B";
  // Anime le panier de l'entête quand panierPulseId change (déclenché par un
  // clic "Je commande" ailleurs) — ignore le premier rendu pour ne pas
  // rejouer l'animation à chaque remontage (ex. changement de page) si un
  // pulse a déjà eu lieu avant.
  const [panierPulseVisible, setPanierPulseVisible] = useState(false);
  const panierPulseMonte = useRef(false);
  // Style "icone" (loupe seule) de la case "entete" ci-dessous : la barre ne
  // se déplie qu'au clic, local à cette instance (contrairement au texte
  // tapé, qui doit lui rester levé au parent — cf. prop `recherche`).
  const [rechercheDepliee, setRechercheDepliee] = useState(false);
  useEffect(() => {
    if (!panierPulseMonte.current) {
      panierPulseMonte.current = true;
      return;
    }
    if (!panierPulseId) return;
    setPanierPulseVisible(true);
    const minuteur = setTimeout(() => setPanierPulseVisible(false), 1200);
    return () => clearTimeout(minuteur);
  }, [panierPulseId]);

  // Démo interactive du bloc "Payer avec" (case "paiement" ci-dessous, cf.
  // capture utilisateur du 2026-09-21) : Orange Money présélectionné, comme
  // sur la capture — les mêmes logos que la carte "Reversé sur ce compte"
  // (PIED_PAIEMENT_APERCU, en tête de fichier).
  const [methodePaiementChoisie, setMethodePaiementChoisie] = useState(PIED_PAIEMENT_APERCU[0].label);

  // Démo interactive de la carte "Finaliser ma commande" (case "paiement"
  // ci-dessous) : "Mode de paiement", "Livraison" et le bouton final "Je
  // commande" étaient des blocs figés (radios jamais cliquables, bouton sans
  // onClick — cf. retour utilisateur du 2026-09-21, "les boutons ne
  // fonctionnent pas"). État local (pas un réglage) pour les mêmes raisons
  // que methodePaiementChoisie ci-dessus : ce sont des choix du visiteur.
  const [modePaiementChoisi, setModePaiementChoisi] = useState<"en-ligne" | "a-la-livraison">(
    state.paiement.payerEnLigne ? "en-ligne" : "a-la-livraison"
  );
  const [livraisonChoisie, setLivraisonChoisie] = useState<"standard" | "express">("standard");
  const [commandeFinaliseeEnvoyee, setCommandeFinaliseeEnvoyee] = useState(false);
  const finaliserCommande = () => {
    setCommandeFinaliseeEnvoyee(true);
    onCommande?.();
    setTimeout(() => setCommandeFinaliseeEnvoyee(false), 1800);
  };

  // Démo interactive du bloc "faq" (case ci-dessous) : les +/− ouvrent/ferment
  // la réponse au clic, indépendamment de state.faq (réglages, pas interaction).
  const [faqOuvertes, setFaqOuvertes] = useState<Record<number, boolean>>({});

  // Démo interactive du bloc "onglets-details" (case ci-dessous) : clic sur un
  // onglet change le contenu affiché, indépendamment de state.ongletsDetails
  // (réglages, pas interaction). Remis à 0 si la liste d'onglets change.
  const [ongletDetailsActif, setOngletDetailsActif] = useState(0);

  // Démo interactive du bloc "galerie" (case ci-dessous) : clic sur une
  // vignette change la grande image, indépendamment de state.galerie (réglages, pas interaction).
  const [imageActive, setImageActive] = useState(0);
  // Démo interactive du bouton zoom (case "galerie" ci-dessous) : clic
  // agrandit l'illustration dans le cadre existant (overflow-hidden du cadre
  // sert de fenêtre de recadrage), reclic la remet à sa taille normale.
  const [zoomActif, setZoomActif] = useState(false);
  // Démo interactive du badge "Vidéo" (case "galerie" ci-dessous) : clic sur
  // le bouton play bascule play/pause, purement visuel — pas de vraie vidéo
  // dans l'aperçu, juste l'affordance attendue d'une vraie vidéo.
  const [videoEnLecture, setVideoEnLecture] = useState(false);
  // Démo interactive du bouton "Partager"/"Favoris" (case "infos" ci-dessous) :
  // partage natif si dispo (mobile/HTTPS), sinon lien copié — comme sur la
  // vraie fiche produit ; "favori" reste juste un état local basculé au clic.
  const [favoriActif, setFavoriActif] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);
  const partagerProduit = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: PRODUIT_APERCU.nom, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* annulé par l'utilisateur — rien à faire */
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 1800);
    }
  };

  // Démo interactive de "Contenance"/quantité/"Lire la suite"/"Je commande"
  // (case "infos" ci-dessous, cf. capture utilisateur du 2026-09-21 : boutons
  // non branchés) : état local (pas un réglage) puisque ce sont des choix du
  // visiteur, pas de la boutique.
  const [variantChoisie, setVariantChoisie] = useState(0);
  const [quantiteChoisie, setQuantiteChoisie] = useState(1);
  const [descriptionEtendue, setDescriptionEtendue] = useState(false);
  const [commandeConfirmee, setCommandeConfirmee] = useState(false);
  const commander = () => {
    setCommandeConfirmee(true);
    onCommande?.();
    setTimeout(() => setCommandeConfirmee(false), 1800);
  };

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
          className={`relative flex items-center justify-center gap-1 px-3 py-1.5 text-center text-[9.5px] font-medium ${b.resteVisibleEnDefilant ? "sticky top-0 z-10" : ""}`}
          style={fondsCouleur[b.couleur]}
        >
          {b.iconeDevantMessage && <MiniIcon path="M12 3l2 5 5 1-4 3.6 1 5-4.5-2.5L7 17.6l1-5-4-3.6 5-1Z" size={11} />}
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
          }`}
          style={{ background: transparent ? "transparent" : "var(--bg)" }}
        >
          <Marque logo={logo} taille={tailleLogoPx} />
          {e.nomAvecLogo && <span className="text-[12.5px] font-bold">{boutiqueNom}</span>}
          <div className="ml-auto flex items-center gap-2.5" style={{ color: "var(--tx)" }}>
            {e.rechercheStyle === "barre" ? (
              <label className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px]" style={{ background: "color-mix(in srgb, var(--tx) 5%, transparent)", color: "var(--tx)" }}>
                <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" />
                <input
                  type="text"
                  value={recherche ?? ""}
                  onChange={(ev) => onRechercheChange?.(ev.target.value)}
                  placeholder={t("Rechercher…", "Search…")}
                  className="w-16 min-w-0 bg-transparent placeholder:opacity-50 focus:outline-none"
                  style={{ color: "var(--tx)" }}
                />
                {recherche && (
                  <button type="button" aria-label={t("Effacer", "Clear")} onClick={() => onRechercheChange?.("")}>
                    <MiniIcon path="M6 6l12 12M18 6 6 18" />
                  </button>
                )}
              </label>
            ) : rechercheDepliee ? (
              <label className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px]" style={{ background: "color-mix(in srgb, var(--tx) 5%, transparent)", color: "var(--tx)" }}>
                <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" />
                <input
                  type="text"
                  autoFocus
                  value={recherche ?? ""}
                  onChange={(ev) => onRechercheChange?.(ev.target.value)}
                  onBlur={() => {
                    if (!recherche) setRechercheDepliee(false);
                  }}
                  placeholder={t("Rechercher…", "Search…")}
                  className="w-16 min-w-0 bg-transparent placeholder:opacity-50 focus:outline-none"
                  style={{ color: "var(--tx)" }}
                />
                <button
                  type="button"
                  aria-label={t("Fermer la recherche", "Close search")}
                  onClick={() => {
                    onRechercheChange?.("");
                    setRechercheDepliee(false);
                  }}
                >
                  <MiniIcon path="M6 6l12 12M18 6 6 18" />
                </button>
              </label>
            ) : (
              <button type="button" aria-label={t("Rechercher", "Search")} onClick={() => setRechercheDepliee(true)}>
                <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" />
              </button>
            )}
            <span className="relative flex items-center">
              {e.panierStyle === "sac" ? (
                <MiniIcon path="M5.5 8h13l-1 12.5h-11ZM9 8V6.5a3 3 0 0 1 6 0V8" />
              ) : (
                <MiniIcon path="M3 4h2l1.6 11.2A2 2 0 0 0 8.6 17H18a2 2 0 0 0 2-1.6L21.4 8H6" />
              )}
              {panierPulseVisible && (
                <span className="pointer-events-none absolute -right-1 -top-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--ac)" }} />
                  <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white" style={{ background: "var(--ac)" }}>
                    1
                  </span>
                </span>
              )}
            </span>
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
      // Photo réellement importée (cf. ReglagesSection.tsx > ChampImage) plutôt
      // que le dégradé de secours ci-dessus, seulement utilisé tant qu'aucune
      // photo n'a été choisie.
      const styleFond: React.CSSProperties =
        h.typeFond === "photo" && h.image
          ? { backgroundImage: `linear-gradient(160deg, rgba(11,14,28,.55), rgba(11,14,28,.25)), url(${h.image})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: fonds[h.typeFond] };
      return (
        <div className="relative overflow-hidden px-14 py-14" style={{ minHeight: minH, ...styleFond, color: textColor }}>
          {h.courbesLumineuses && isHalo && <HaloRayons />}
          {/* Contenu toujours centré avec maxWidth (plus étroit en "page" qu'en "pleine") pour que texte et image restent groupés ; le fond reste plein-bord */}
          <div
            className={`relative flex h-full gap-3 ${
              centree
                ? "flex-col items-center text-center"
                : device === "phone"
                  ? "flex-col items-start"
                  : `items-center ${inverse ? "flex-row-reverse" : ""}`
            }`}
            style={{
              maxWidth: device === "phone" ? "100%" : sec.largeur === "page" ? 520 : 960,
              margin: "0 auto",
            }}
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
                className={`mt-2 leading-tight ${device === "phone" ? "text-[36px]" : "text-[44px]"}`}
                style={{
                  fontFamily: "var(--font-titre)",
                  fontWeight: "var(--titre-graisse)" as unknown as number,
                  letterSpacing: "var(--titre-espacement)",
                  textTransform: "var(--titre-majuscules)" as React.CSSProperties["textTransform"],
                  textWrap: "pretty",
                }}
              >
                <TitreAvecMotValorise titre={h.titre} mot={h.motValorise} couleur={sombre ? "#FF7AC0" : "var(--ac)"} />
              </p>
              <p className="mt-1 text-[10px]" style={{ opacity: sombre ? 0.85 : 0.6, textWrap: "pretty" }}>
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
            <div className={`relative flex shrink-0 items-center justify-center ${device === "phone" ? "h-40 w-40" : "h-64 w-64"}`}>
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
                <span className="absolute -top-4 -right-4 flex h-24 w-24 flex-col items-center justify-center gap-0.5 rounded-full bg-white text-center shadow-[0_10px_24px_-6px_rgba(11,14,28,0.35)]">
                  <span className="text-[16px] font-figures-bold leading-none" style={{ color: "var(--ac)" }}>
                    −{remise} %
                  </span>
                  <span className="px-1.5 text-[8px] font-semibold leading-[1.15]" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
                    {t("en payant en ligne", "when paying online")}
                  </span>
                </span>
              )}
              {h.note && (
                <span className="absolute -bottom-4 -left-4 flex flex-col items-start gap-1 rounded-xl bg-white px-4 py-3 shadow-[0_10px_24px_-6px_rgba(11,14,28,0.35)]">
                  <Etoiles note={PRODUIT_APERCU.note} taille={11} couleur={couleurEtoiles} />
                  <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-[13px] font-figures-bold text-[#0B0E1C]">{PRODUIT_APERCU.note}</span>
                    <span className="text-[9px] font-medium" style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>
                      {texteAvecChiffres(t(`${PRODUIT_APERCU.avisCount} avis clients`, `${PRODUIT_APERCU.avisCount} customer reviews`))}
                    </span>
                  </span>
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
        <div className={`relative z-10 mx-auto max-w-[820px] px-4 ${c.chevaucheGrandeImage ? "-mt-6" : "py-3.5"}`}>
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
        <div className="px-6 py-3.5">
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
        <div className="px-6 py-3.5">
          <div
            className={`overflow-hidden rounded-2xl px-5 py-5 text-white ${
              phone ? "flex flex-col gap-3" : `flex min-h-[140px] items-center justify-center gap-16 px-12 py-8 ${inverse ? "flex-row-reverse" : ""}`
            }`}
            style={{ background: fond }}
          >
            <div
              className={`relative overflow-hidden rounded-xl ${phone ? "h-32 w-full" : "h-48 w-48 shrink-0"}`}
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
              <ProduitIllustration variante="flacon" accent="#fff" />
            </div>
            <div className={phone ? "min-w-0" : "min-w-0 max-w-[76%]"}>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold">{p.petitTexte}</span>
              <p className={`mt-1.5 font-bold leading-tight ${phone ? "text-[19px]" : "text-[24px]"}`}>{texteAvecChiffres(p.titre)}</p>
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
      // Badge calculé sur le pool complet (avant filtre recherche) puis
      // reporté par nom sur la liste affichée, pour ne pas sauter d'un
      // produit à l'autre selon ce que le filtre laisse visible.
      const meilleureVenteNom = produits[indexMeilleureVente(produits)]?.nom;
      const q = (recherche ?? "").trim().toLowerCase();
      const produitsAffiches = q
        ? produits.filter((p) => p.nom.toLowerCase().includes(q) || p.nomEn.toLowerCase().includes(q))
        : produits;
      return (
        <div className="px-6 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold">{titreGrille}</p>
            <span className="text-[9px] font-semibold" style={{ color: "var(--ac)" }}>{t("Tout voir", "See all")}</span>
          </div>
          {produitsAffiches.length === 0 ? (
            <p className="py-4 text-center text-[10px] opacity-50">
              {t(`Aucun produit pour « ${recherche} ».`, `No product for “${recherche}”.`)}
            </p>
          ) : (
            <div className={defilement ? `flex ${espace} overflow-x-auto` : `grid ${espace}`} style={defilement ? undefined : { gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {produitsAffiches.map((p, i) => (
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
                  badge={p.nom === meilleureVenteNom ? "populaire" : p.ventes30j === 0 ? "nouveau" : undefined}
                  compact
                  t={t}
                />
              ))}
            </div>
          )}
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
        <div className="px-6 py-3.5">
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
                    onClick={() => {
                      setImageActive(i);
                      // Changer de vignette remet le bouton play (nouvelle "lecture" pas encore lancée).
                      setVideoEnLecture(false);
                    }}
                    className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg"
                    style={{
                      aspectRatio: "1/1",
                      background: "color-mix(in srgb, var(--tx) 04%, transparent)",
                      boxShadow: i === imageActive ? "0 0 0 1.5px var(--ac)" : undefined,
                    }}
                  >
                    <ProduitIllustration variante={PRODUIT_ILLUSTRATIONS[i % PRODUIT_ILLUSTRATIONS.length]} accent="var(--ac)" />
                    {/* Seule la 1ère vignette est la vidéo (réglage "Vidéo en lecture
                        automatique", cf. ReglagesSection.tsx) : les 3 autres sont des
                        photos, pas d'icône play dessus. */}
                    {i === 0 && g.lectureAuto && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <MiniIcon path="M9 6l9 6-9 6V6Z" color="#fff" size={9} />
                      </span>
                    )}
                  </div>
                ))}
                {/* Indice de défilement sous les 4 vignettes (maquette du 2026-09-21) — purement
                    décoratif ici, l'aperçu ne fait pas défiler d'autres photos que ces 4. */}
                <span
                  className="mx-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "color-mix(in srgb, var(--tx) 06%, transparent)" }}
                >
                  <MiniIcon path="M6 9l6 6 6-6" size={9} color="color-mix(in srgb, var(--tx) 40%, transparent)" />
                </span>
              </div>
            )}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden"
              style={{
                aspectRatio: ratio,
                maxWidth: 260,
                background: isHalo
                  ? "linear-gradient(150deg, #F7D9EA, #E9DFF7 55%, #FCE9EF)"
                  : "linear-gradient(150deg, rgba(236,12,140,.10), rgba(58,29,138,.10))",
              }}
            >
              {/* courbes fines convergeant vers un point lumineux, motif Halo (maquette) */}
              {isHalo && <HaloCourbes />}
              <div
                className="relative flex h-full w-full items-center justify-center transition-transform duration-300"
                style={{ transform: zoomActif ? "scale(1.6)" : "scale(1)" }}
              >
                <ProduitIllustration variante={PRODUIT_ILLUSTRATIONS[imageActive % PRODUIT_ILLUSTRATIONS.length]} accent="var(--ac)" />
              </div>
              {g.boutonZoom && (
                <button
                  type="button"
                  onClick={() => setZoomActif((v) => !v)}
                  aria-pressed={zoomActif}
                  aria-label={zoomActif ? t("Dézoomer", "Zoom out") : t("Zoomer", "Zoom in")}
                  className="absolute bottom-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85"
                >
                  <MiniIcon
                    path={zoomActif ? "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l4 4M8 11h6" : "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l4 4M11 8v6M8 11h6"}
                    color="rgba(0,0,0,.6)"
                  />
                </button>
              )}
              {/* Badge + bouton play seulement sur la vignette vidéo (index 0)
                  sélectionnée — les 3 autres sont des photos, pas de vidéo dessus.
                  Le bouton play disparaît une fois la lecture lancée (comme une
                  vraie vidéo) plutôt que de rester affiché en permanence. */}
              {g.lectureAuto && imageActive === 0 && (
                <>
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur">
                    {t("Vidéo", "Video")}
                  </span>
                  {!videoEnLecture && (
                    <button
                      type="button"
                      onClick={() => setVideoEnLecture(true)}
                      aria-label={t("Lire la vidéo", "Play video")}
                      className="absolute left-1/2 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 backdrop-blur"
                    >
                      <MiniIcon path="M9 6l9 6-9 6V6Z" color="#fff" size={16} />
                    </button>
                  )}
                </>
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
        </div>
      );
    }

    case "infos": {
      const isHalo = state.style.modele === "halo";
      // "Bouton de commande" et sa mini barre de confiance vivent normalement
      // dans la section "paiement" (plus bas, dans le bloc "Finaliser ma
      // commande") ; la maquette du 2026-09-21 en montre une seconde
      // occurrence ici, juste sous la quantité — un bouton d'achat rapide en
      // haut de fiche, en plus du récapitulatif complet plus bas. Libellés
      // propres à cette carte (délai réel, mode de livraison, remise en
      // ligne) plutôt que ceux de CONFIANCE_ITEMS, cf. maquette.
      const remiseEnLigne = state.paiement.remiseEnLignePct;
      const confianceInfos = [
        { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", ligne1: t("Livraison 4 h", "4 h delivery"), ligne2: t("en moyenne", "on average"), actif: true },
        { icon: "M4 7h16v10H4Zm0 3h16", ligne1: t("Paiement", "Payment"), ligne2: t("à la livraison", "on delivery"), actif: state.paiement.payerALaLivraison },
        { icon: "M3 6.5h18v11H3zM3 10h18", ligne1: t(`−${remiseEnLigne} % en ligne`, `−${remiseEnLigne}% online`), ligne2: t("Mobile money", "Mobile money"), actif: state.paiement.payerEnLigne },
      ].filter((it) => it.actif);
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
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[19px] font-figures-bold">{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
            {state.infos.ancienPrixBarre && (
              <span className="text-[12px] line-through font-figures" style={{ color: "color-mix(in srgb, var(--tx) 40%, transparent)" }}>
                {PRODUIT_APERCU.prixConseille.toLocaleString("fr-FR")} F
              </span>
            )}
            {state.infos.badgeRemise && (
              // Rectangle sombre "−X % en ligne" (maquette) plutôt que la pastille ronde
              // précédente — pourcentage de state.paiement.remiseEnLignePct (le même que le
              // bouton "Payer en ligne" plus bas) plutôt qu'un calcul prix vente/conseillé,
              // pour rester cohérent avec ce que "en ligne" désigne réellement.
              <span className="rounded-md px-2 py-1 text-[9.5px] font-figures-bold text-white" style={{ background: "#0B0E1C" }}>
                −{remiseEnLigne} % {t("en ligne", "online")}
              </span>
            )}
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
            {state.infos.description === "complete" || descriptionEtendue
              ? t(PRODUIT_APERCU.descriptionComplete, PRODUIT_APERCU.descriptionCompleteEn)
              : t(PRODUIT_APERCU.descriptionCourte, PRODUIT_APERCU.descriptionCourteEn)}
          </p>
          {state.infos.description === "courte" && !descriptionEtendue && (
            <button type="button" onClick={() => setDescriptionEtendue(true)} className="mt-0.5 text-[9.5px] font-semibold underline" style={{ color: "var(--tx)" }}>
              {t("Lire la suite", "Read more")}
            </button>
          )}
          {/* "Stock restant · Afficher sous" (panneau "Informations produit") : le bloc ne
              s'affiche que sous ce seuil, pas simplement quand le réglage est activé. */}
          {state.infos.stockRestant && PRODUIT_APERCU.unitesDisponibles <= state.infos.stockAfficherSousUnites && (
            <div className="mt-2">
              <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--tx) 5%, transparent)" }}>
                {texteAvecChiffres(t(`Plus que ${PRODUIT_APERCU.unitesDisponibles} en stock`, `Only ${PRODUIT_APERCU.unitesDisponibles} left in stock`))}
              </p>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--tx) 8%, transparent)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((PRODUIT_APERCU.unitesDisponibles / state.infos.stockAfficherSousUnites) * 100))}%`,
                    background: "var(--ac)",
                  }}
                />
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[9.5px] font-semibold" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
              {t("Contenance", "Size")} : {PRODUIT_APERCU.variantes[variantChoisie]}
            </p>
            {state.infos.lienConseilsUtilisation && (
              <a href="#" className="flex items-center gap-1 text-[9.5px] font-semibold underline" style={{ color: "var(--tx)" }}>
                <MiniIcon path="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8h.01M11 11h1v5h1" color="var(--tx)" size={11} />
                {t("Conseils d'utilisation", "How to use")}
              </a>
            )}
          </div>
          <div className="mt-1.5">
            <VariantesApercu
              presentation={state.infos.variantesPresentation}
              variantes={PRODUIT_APERCU.variantes}
              selectionnee={variantChoisie}
              onChoisir={setVariantChoisie}
              t={t}
            />
          </div>
          {state.infos.quantite && (
            <div className="mt-3 flex items-center gap-2.5">
              <div className="inline-flex h-[42px] shrink-0 items-center gap-3 rounded-full border px-3.5 text-[11px]" style={{ borderColor: "color-mix(in srgb, var(--tx) 12%, transparent)" }}>
                <button
                  type="button"
                  onClick={() => setQuantiteChoisie((q) => Math.max(1, q - 1))}
                  aria-label={t("Retirer une unité", "Remove one")}
                >
                  −
                </button>
                <span className="font-figures-bold">{quantiteChoisie}</span>
                <button
                  type="button"
                  onClick={() => setQuantiteChoisie((q) => Math.min(PRODUIT_APERCU.unitesDisponibles, q + 1))}
                  aria-label={t("Ajouter une unité", "Add one")}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={commander}
                className={`flex h-[42px] flex-1 items-center justify-center gap-2 rounded-full px-4 text-center text-[12px] font-bold text-white transition hover:brightness-110 ${classeAnimationBoutonCommande(state.mouvements.boutonCommandeAnimation)}`}
                style={{ background: style_boutonCommandeBg(state), textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
              >
                <MiniIcon path="M3 4h2l1.6 11.2A2 2 0 0 0 8.6 17H18a2 2 0 0 0 2-1.6L21.4 8H6" color="#fff" size={14} />
                {commandeConfirmee ? t("Ajouté !", "Added!") : t(...BOUTON_COMMANDE_LABELS[state.paiement.boutonTexte])}
              </button>
              {state.paiement.boutonSecondaire !== "aucun" && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => (state.paiement.boutonSecondaire === "favori" ? setFavoriActif((v) => !v) : partagerProduit())}
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-full border transition"
                    style={{
                      borderColor:
                        state.paiement.boutonSecondaire === "favori" && favoriActif
                          ? "transparent"
                          : "color-mix(in srgb, var(--tx) 12%, transparent)",
                      background: state.paiement.boutonSecondaire === "favori" && favoriActif ? "#E8207E" : "transparent",
                    }}
                    aria-label={state.paiement.boutonSecondaire === "favori" ? t("Ajouter aux favoris", "Add to favorites") : t("Partager", "Share")}
                    aria-pressed={state.paiement.boutonSecondaire === "favori" ? favoriActif : undefined}
                  >
                    <MiniIcon
                      path={
                        state.paiement.boutonSecondaire === "favori"
                          ? "M12 20s-6.2-3.9-8.4-7.6C1.8 9.4 3.6 6 7 6c1.9 0 3.4 1 5 2.8C13.6 7 15.1 6 17 6c3.4 0 5.2 3.4 3.4 6.4C18.2 16.1 12 20 12 20Z"
                          : "M18 8a3 3 0 1 0-2.8-4M18 16a3 3 0 1 0-2.8 4M6 13.5a3 3 0 1 0 0-3M8.7 11.2l6.6-3.7M8.7 14.8l6.2 3.5"
                      }
                      color={state.paiement.boutonSecondaire === "favori" && favoriActif ? "#fff" : "var(--tx)"}
                    />
                  </button>
                  {lienCopie && (
                    <span
                      className="absolute right-0 top-[calc(100%+6px)] whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-semibold text-white"
                      style={{ background: "#141220" }}
                    >
                      {t("Lien copié", "Link copied")}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          {state.paiement.rangeeConfiance && confianceInfos.length > 0 && (
            <div className="mt-3 flex items-center justify-between gap-1">
              {confianceInfos.map((it) => (
                <div key={it.ligne1} className="flex items-center gap-1.5">
                  <MiniIcon path={it.icon} color="var(--ac)" />
                  <span className="text-[7.5px] font-semibold leading-tight" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
                    {it.ligne1}
                    <br />
                    {it.ligne2}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Fusionnée dans la carte "Finaliser ma commande" (case "paiement",
    // colonne "Vos informations") — cf. commentaire de FormulaireChampsApercu
    // en tête de fichier.
    case "formulaire":
      return null;

    case "paiement": {
      const remise = state.paiement.remiseEnLignePct;
      const prixLigne = Math.round((PRODUIT_APERCU.prixVente * (100 - remise)) / 100);
      const remiseMontant = PRODUIT_APERCU.prixVente - prixLigne;
      const fraisExpress = 2000;
      const totalCommande =
        (modePaiementChoisi === "en-ligne" ? prixLigne : PRODUIT_APERCU.prixVente) +
        (livraisonChoisie === "express" ? fraisExpress : 0);
      const carteClasses = `rounded-xl bg-white ${device === "phone" ? "p-2" : "p-2.5"}`;
      const carteStyle: React.CSSProperties = { boxShadow: "0 6px 16px -10px rgba(20,18,32,.22)" };

      return (
        <div className={device === "phone" ? "px-2.5 pb-3.5" : "px-4 pb-3.5"}>
          <div className={device === "phone" ? "rounded-2xl p-2" : "rounded-2xl p-3"} style={{ background: "linear-gradient(180deg,#F6F0FA,#F9F5FC)" }}>
            <p className="text-[13px] font-extrabold" style={{ color: "#141220" }}>{t("Finaliser ma commande", "Complete my order")}</p>
            <p className="mt-0.5 text-[9px]" style={{ color: "rgba(20,18,32,.55)" }}>
              {t("Payez en ligne ou à la livraison, puis indique où te livrer.", "Pay online or on delivery, then tell us where to deliver.")}
            </p>

            <div className={`mt-2.5 grid gap-2 ${device === "desktop" ? "grid-cols-2" : "grid-cols-1"}`}>
              {/* Colonne gauche : paiement + livraison */}
              <div className="flex flex-col gap-2">
                {/* 1. Mode de paiement */}
                <div className={carteClasses} style={carteStyle}>
                  <TitreNumerote n={1} titre={t("Mode de paiement", "Payment method")} />
                  <div className="grid grid-cols-2 gap-1.5">
                    {state.paiement.payerEnLigne && (
                      <button
                        type="button"
                        onClick={() => setModePaiementChoisi("en-ligne")}
                        className="relative flex flex-col items-start gap-0.5 rounded-lg border px-2 py-2 text-left"
                        style={{
                          borderWidth: modePaiementChoisi === "en-ligne" ? "var(--btn-border)" : "1px",
                          borderColor: modePaiementChoisi === "en-ligne" ? "var(--ac)" : "rgba(20,18,32,.12)",
                          background: modePaiementChoisi === "en-ligne" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                        }}
                      >
                        {remise > 0 && (
                          <span className="absolute -right-1 -top-1.5 rounded-full px-1.5 py-0.5 text-[6.5px] font-bold text-white" style={{ background: "var(--ac)" }}>
                            −{remise} %
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <RadioCercle actif={modePaiementChoisi === "en-ligne"} />
                          <span className="text-[9px] font-bold" style={{ color: "#141220" }}>{t("Payer en ligne", "Pay online")}</span>
                        </span>
                        <span className="pl-[17px] text-[6.5px] leading-tight" style={{ color: "rgba(20,18,32,.45)" }}>{state.paiement.texteRemiseOption}</span>
                        <span className="pl-[17px] text-[9.5px] font-figures-bold" style={{ color: "#141220" }}>
                          {prixLigne.toLocaleString("fr-FR")} F
                          {remise > 0 && (
                            <span className="ml-1 text-[6.5px] font-normal line-through font-figures" style={{ color: "rgba(20,18,32,.35)" }}>
                              {PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F
                            </span>
                          )}
                        </span>
                      </button>
                    )}
                    {state.paiement.payerALaLivraison && (
                      <button
                        type="button"
                        onClick={() => setModePaiementChoisi("a-la-livraison")}
                        className="flex flex-col items-start gap-0.5 rounded-lg border px-2 py-2 text-left"
                        style={{
                          borderWidth: modePaiementChoisi === "a-la-livraison" ? "var(--btn-border)" : "1px",
                          borderColor: modePaiementChoisi === "a-la-livraison" ? "var(--ac)" : "rgba(20,18,32,.12)",
                          background: modePaiementChoisi === "a-la-livraison" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <RadioCercle actif={modePaiementChoisi === "a-la-livraison"} />
                          <span className="text-[9px] font-bold" style={{ color: "#141220" }}>{t("Payer à la livraison", "Pay on delivery")}</span>
                        </span>
                        <span className="pl-[17px] text-[6.5px] leading-tight" style={{ color: "rgba(20,18,32,.45)" }}>
                          {t("Vous payez à réception", "You pay on receipt")}
                        </span>
                        <span className="pl-[17px] text-[9.5px] font-figures-bold" style={{ color: "#141220" }}>
                          {PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Payer avec */}
                {state.paiement.payerEnLigne && modePaiementChoisi === "en-ligne" && (
                  <div className={carteClasses} style={carteStyle}>
                    <TitreNumerote n={2} titre={t("Payer avec", "Pay with")} />
                    <div className="grid grid-cols-4 gap-1.5">
                      {PIED_PAIEMENT_APERCU.map((m) => {
                        const selectionne = methodePaiementChoisie === m.label;
                        return (
                          <button
                            key={m.label}
                            type="button"
                            onClick={() => setMethodePaiementChoisie(m.label)}
                            className="relative flex flex-col items-center gap-1 rounded-lg border px-1 py-1.5"
                            style={{
                              borderWidth: selectionne ? "var(--btn-border)" : "1px",
                              borderColor: selectionne ? "var(--ac)" : "rgba(20,18,32,.12)",
                              background: selectionne ? "color-mix(in srgb, var(--ac) 4%, transparent)" : "transparent",
                            }}
                          >
                            {selectionne && (
                              <span
                                className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                                style={{ background: "var(--ac)" }}
                              >
                                <MiniIcon path="M5 12l4 4 10-10" color="#fff" size={8} />
                              </span>
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu, pas une image du domaine */}
                            <img
                              src={m.logo}
                              alt=""
                              className="h-3.5 w-3.5 object-contain"
                              style={{ filter: selectionne ? "none" : "grayscale(1)", opacity: selectionne ? 1 : 0.45 }}
                            />
                            <span
                              className="truncate text-center text-[6.5px] font-semibold leading-tight"
                              style={{ color: selectionne ? "#141220" : "rgba(20,18,32,.45)" }}
                            >
                              {m.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Livraison */}
                <div className={carteClasses} style={carteStyle}>
                  <TitreNumerote n={3} titre={t("Livraison", "Delivery")} />
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLivraisonChoisie("standard")}
                      className="flex flex-col items-start gap-0.5 rounded-lg border px-2 py-2 text-left"
                      style={{
                        borderWidth: livraisonChoisie === "standard" ? "var(--btn-border)" : "1px",
                        borderColor: livraisonChoisie === "standard" ? "var(--ac)" : "rgba(20,18,32,.12)",
                        background: livraisonChoisie === "standard" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <RadioCercle actif={livraisonChoisie === "standard"} />
                        <span className="text-[9px] font-bold" style={{ color: "#141220" }}>{t("Livraison standard", "Standard delivery")}</span>
                      </span>
                      <span className="pl-[17px] text-[6.5px] leading-tight" style={{ color: "rgba(20,18,32,.45)" }}>
                        {texteAvecChiffres(t("4 h en moyenne", "4 h on average"))}
                      </span>
                      <span className="pl-[17px] text-[8.5px] font-semibold" style={{ color: "#141220" }}>{t("Incluse", "Included")}</span>
                    </button>
                    {state.paiement.livraisonExpress && (
                      <button
                        type="button"
                        onClick={() => setLivraisonChoisie("express")}
                        className="flex flex-col items-start gap-0.5 rounded-lg border px-2 py-2 text-left"
                        style={{
                          borderWidth: livraisonChoisie === "express" ? "var(--btn-border)" : "1px",
                          borderColor: livraisonChoisie === "express" ? "var(--ac)" : "rgba(20,18,32,.12)",
                          background: livraisonChoisie === "express" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <RadioCercle actif={livraisonChoisie === "express"} />
                          <span className="text-[9px] font-bold" style={{ color: "#141220" }}>{t("Livraison express", "Express delivery")}</span>
                        </span>
                        <span className="pl-[17px] text-[6.5px] leading-tight" style={{ color: "rgba(20,18,32,.45)" }}>{state.paiement.texteExpress}</span>
                        <span className="pl-[17px] text-[8.5px] font-figures-bold" style={{ color: "#141220" }}>+2 000 F</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite : Vos informations + résumé + CTA */}
              <div className={carteClasses} style={carteStyle}>
                <TitreNumerote n={4} titre={t("Vos informations", "Your information")} />
                <FormulaireChampsApercu f={state.formulaire} t={t} />

                <div className="mt-2.5 rounded-lg p-2 text-[8.5px]" style={{ background: "rgba(20,18,32,.03)" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "rgba(20,18,32,.6)" }}>{t(PRODUIT_APERCU.nom, PRODUIT_APERCU.nomEn)} × 1</span>
                    <span className="font-figures-bold" style={{ color: "#141220" }}>{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
                  </div>
                  {modePaiementChoisi === "en-ligne" && remise > 0 && (
                    <div className="mt-1 flex items-center justify-between">
                      <span style={{ color: "var(--ac)" }}>{t("Remise paiement en ligne", "Online payment discount")}</span>
                      <span className="font-figures-bold" style={{ color: "var(--ac)" }}>−{remiseMontant.toLocaleString("fr-FR")} F</span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <span style={{ color: "rgba(20,18,32,.6)" }}>
                      {livraisonChoisie === "express" ? t("Livraison express", "Express delivery") : t("Livraison standard", "Standard delivery")}
                    </span>
                    <span className="font-semibold font-figures" style={{ color: "#141220" }}>
                      {livraisonChoisie === "express" ? `+${fraisExpress.toLocaleString("fr-FR")} F` : t("Incluse", "Included")}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between border-t pt-1.5" style={{ borderColor: "rgba(20,18,32,.1)" }}>
                    <span className="text-[9.5px] font-bold" style={{ color: "#141220" }}>{t("Total", "Total")}</span>
                    <span className="text-[11.5px] font-figures-bold" style={{ color: "#141220" }}>{totalCommande.toLocaleString("fr-FR")} F</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={finaliserCommande}
                  className={`mt-2.5 flex w-full items-center justify-center gap-1.5 py-2.5 text-[10.5px] font-bold text-white transition hover:brightness-110 ${classeAnimationBoutonCommande(state.mouvements.boutonCommandeAnimation)}`}
                  style={{ background: style_boutonCommandeBg(state), borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
                >
                  <MiniIcon path="M3 4h2l1.6 11.2A2 2 0 0 0 8.6 17H18a2 2 0 0 0 2-1.6L21.4 8H6" color="#fff" size={12} />
                  {commandeFinaliseeEnvoyee ? t("Commande envoyée !", "Order sent!") : t(...BOUTON_COMMANDE_LABELS[state.paiement.boutonTexte])} ·{" "}
                  <span className="font-figures-bold">{totalCommande.toLocaleString("fr-FR")} F</span>
                </button>
                <p className="mt-1.5 text-center text-[7.5px]" style={{ color: "rgba(20,18,32,.4)" }}>
                  {modePaiementChoisi === "en-ligne"
                    ? t(
                        `Paiement par ${methodePaiementChoisie} à l'étape suivante`,
                        `Payment by ${methodePaiementChoisie} at the next step`
                      )
                    : t("Vous payez en espèces à réception du colis", "You pay in cash on receipt of the package")}
                </p>
              </div>
            </div>

            {state.paiement.rangeeConfiance && (
              <div className="mt-3 flex items-center justify-around gap-1">
                {CONFIANCE_ITEMS.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1 px-1 text-center">
                    <MiniIcon path={item.icon} color="var(--ac)" />
                    <span className="text-[7.5px] font-semibold leading-tight" style={{ color: "rgba(20,18,32,.55)" }}>
                      {t(item.label, item.labelEn)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    case "onglets-details": {
      const o = state.ongletsDetails;
      const isHalo = state.style.modele === "halo";
      const actif = Math.min(ongletDetailsActif, o.onglets.length - 1);
      const texteOnglet = (o.contenus ?? [])[actif];
      const contenu = (
        <>
          {texteOnglet && (
            <p className="text-[10.5px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--tx) 55%, transparent)" }}>
              {texteAvecChiffres(texteOnglet)}
            </p>
          )}
          {actif === 0 && o.atoutsAvecIcones && (
            <ul className="space-y-1.5">
              {o.atouts.slice(0, o.nombreAtouts).map((a) => (
                <li key={a} className="flex items-start gap-1.5 text-[10.5px]" style={{ color: "color-mix(in srgb, var(--tx) 65%, transparent)" }}>
                  <MiniIcon path="M5 12l4 4 10-10" color="var(--ac)" size={13} />
                  {a}
                </li>
              ))}
            </ul>
          )}
        </>
      );
      const image = o.grandeImage && (
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-xl"
          style={{
            aspectRatio: device === "phone" ? "16/9" : "1/1",
            background: isHalo ? "linear-gradient(150deg, #F7D9EA, #E9DFF7 55%, #FCE9EF)" : "color-mix(in srgb, var(--ac) 06%, transparent)",
          }}
        >
          {isHalo && <HaloCourbes />}
          <ProduitIllustration variante="flacon" accent="var(--ac)" />
        </div>
      );
      const secOnglets = state.sections.find((s) => s.id === "onglets-details");
      const paddingOnglets = secOnglets?.marges === "petites" ? 8 : secOnglets?.marges === "grandes" ? 24 : 16;
      return (
        <div style={{ padding: paddingOnglets }}>
          {o.presentation === "accordeon" ? (
            <div>
              {o.onglets.map((onglet, i) => (
                <div key={i} className="border-t py-2 first:border-t-0" style={{ borderColor: "color-mix(in srgb, var(--tx) 08%, transparent)" }}>
                  <button
                    type="button"
                    onClick={() => setOngletDetailsActif(i === actif ? -1 : i)}
                    className="flex w-full items-center justify-between text-left text-[10.5px] font-semibold"
                  >
                    <span>{onglet}</span>
                    <span style={{ color: "color-mix(in srgb, var(--tx) 45%, transparent)" }}>{i === actif ? "−" : "+"}</span>
                  </button>
                  {i === actif && <div className="mt-2 space-y-2">{contenu}</div>}
                </div>
              ))}
              {image && <div className="mt-3">{image}</div>}
            </div>
          ) : (
            <>
              <div className="flex gap-4 border-b" style={{ borderColor: "color-mix(in srgb, var(--tx) 08%, transparent)" }}>
                {o.onglets.map((onglet, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setOngletDetailsActif(i)}
                    className={`truncate border-b-2 pb-2 text-[9.5px] ${i === actif ? "font-bold" : "font-medium"}`}
                    style={
                      i === actif
                        ? { color: "var(--tx)", borderColor: "var(--ac)" }
                        : { color: "color-mix(in srgb, var(--tx) 35%, transparent)", borderColor: "transparent" }
                    }
                  >
                    {onglet}
                  </button>
                ))}
              </div>
              <div className={device === "phone" ? "mt-3 flex flex-col gap-3" : "mt-3 grid grid-cols-[1fr_120px] items-start gap-3"}>
                <div className="space-y-2">{contenu}</div>
                {image}
              </div>
            </>
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
        <div className="px-6 py-3.5">
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
        <div className="px-6 py-3.5">
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
              const parDefaut = i === 0 && fq.premiereOuverte ? true : !!q.ouverte;
              const ouverte = faqOuvertes[i] ?? parDefaut;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFaqOuvertes((s) => ({ ...s, [i]: !ouverte }))}
                  className="rounded-xl border px-2.5 py-2 text-left"
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
                </button>
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

    case "vendu-par": {
      const traitVenduPar = "color-mix(in srgb, var(--tx) 10%, transparent)";
      const iconeVenduPar = "color-mix(in srgb, var(--tx) 30%, transparent)";
      return (
        <div className="mx-4 mb-3.5 flex items-center gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: "color-mix(in srgb, var(--tx) 1%, transparent)", background: "color-mix(in srgb, var(--tx) 02%, transparent)" }}>
          <Marque logo={logo} taille={22} />
          <div className="shrink-0">
            <p className="text-[8px] uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--tx) 4%, transparent)" }}>{t("Vendu par", "Sold by")}</p>
            <p className="text-[11.5px] font-bold">{boutiqueNom}</p>
          </div>
          <div className="flex flex-1 items-center gap-2.5">
            <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: traitVenduPar }} />
            <PhoneIcon color={iconeVenduPar} />
            <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: traitVenduPar }} />
            <MailIcon color={iconeVenduPar} />
            <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: traitVenduPar }} />
            <MapPinIcon color={iconeVenduPar} />
          </div>
        </div>
      );
    }

    case "pied-de-page": {
      const p = state.piedDePage;
      const isHalo = state.style.modele === "halo";
      const h = state.grandeImage;
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
          {/* Halo : courbes du pied de page nuit (maquette). Autres modèles : reprend
              ici la même courbe que la grande image, contrôlée par le même
              interrupteur "Courbes lumineuses" (onglet grande image). */}
          {isHalo && sombreFond && <HaloCourbes ton="sombre" />}
          {!isHalo && h.courbesLumineuses && <HaloCourbes ton={sombreFond ? "sombre" : "clair"} />}

          <div
            className="relative block w-full overflow-hidden rounded-lg border px-4 py-3"
            style={{ borderColor: traitCouleur, background: sombreFond ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)" }}
          >
            <div className={`flex gap-4 ${centre ? "flex-col items-center text-center" : "flex-wrap items-start justify-between"}`}>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className={`flex items-start gap-1.5 ${centre ? "flex-col items-center text-center" : ""}`}>
                  {p.logoAffiche && <Marque logo={logo} taille={tailleLogoPx} />}
                  <div className="min-w-0">
                    <b className="block text-[10px]" style={{ color: sombreFond ? "#fff" : "var(--tx)" }}>
                      {boutiqueNom}
                    </b>
                    {p.presentation && (
                      <p className="mt-0.5 max-w-[220px] text-[7.5px] leading-snug" style={{ opacity: 0.6 }}>
                        {t(
                          "Des soins naturels pour le visage et le corps, préparés avec des recettes sûres.",
                          "Natural skincare for face and body, made with safe recipes."
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {p.reseaux && (
                  <div className={`flex items-center gap-1 ${centre ? "justify-center" : ""}`}>
                    {PIED_RESEAUX_ICONES.map((path, i) => (
                      <span
                        key={i}
                        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: sombreFond ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)" }}
                      >
                        <MiniIcon path={path} color={sombreFond ? "#fff" : "var(--tx)"} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {nbColonnes > 0 && (
                <div
                  className="grid gap-x-5 gap-y-2"
                  style={{
                    gridTemplateColumns: `repeat(${colsGrille}, max-content)`,
                    justifyContent: centre ? "center" : "start",
                  }}
                >
                  {groupes.map((g) => (
                    <div key={g.titre[0]} className={centre ? "text-center" : ""}>
                      <p className="text-[8.5px] font-bold">{t(...g.titre)}</p>
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        {g.liens.map((lien) => (
                          <span key={lien[0]} className="truncate text-[8px]" style={{ opacity: 0.6 }}>
                            {t(...lien)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {p.moyensPaiement && (
                    <div className={centre ? "text-center" : ""}>
                      <p className="text-[8.5px] font-bold">{t("Paiement", "Payment")}</p>
                      <div className={`mt-0.5 grid grid-cols-2 gap-1 ${centre ? "justify-items-center" : ""}`}>
                        {PIED_PAIEMENT_APERCU.map((m) => (
                          <span key={m.label} className="flex items-center gap-1 rounded-md px-1 py-0.5" style={{ background: puceCouleur }}>
                            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu, pas une image du domaine */}
                            <img src={m.logo} alt="" className="h-2.5 w-2.5 shrink-0 rounded-[3px] object-contain" />
                            <span className="truncate text-[6.5px] font-semibold">{m.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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

    // Sections de bibliothèque (cf. AjouterSectionModal.tsx) : un seul bloc
    // de contenu générique (titre/texte/image/bouton, réglé dans
    // ReglagesSection.tsx > case "default") plutôt qu'une mise en page par
    // type — remplace l'ancien espace réservé qui ne menait à aucun réglage
    // réel. "Pour cette section" (largeur/marges/couleurs) et
    // Monter/Descendre/Masquer restent, eux, gérés par SectionRendue plus haut.
    default: {
      const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
      const sec = state.sections.find((s) => s.id === id);
      const titre = sec?.contenuTitre?.trim() || t(def.label, def.labelEn);
      const texte = sec?.contenuTexte?.trim() ?? "";
      const image = sec?.contenuImage ?? null;
      const boutonTexte = sec?.contenuBoutonTexte?.trim() ?? "";
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
            <img src={image} alt="" className="max-h-56 w-full max-w-md rounded-2xl object-cover" />
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
            {titre}
          </p>
          {texte && (
            <p className="max-w-md text-[10.5px] leading-relaxed" style={{ opacity: 0.65 }}>
              {texte}
            </p>
          )}
          {boutonTexte && (
            <span
              className={`mt-1 inline-flex items-center whitespace-nowrap px-4 py-2 text-[10.5px] font-semibold text-white ${classeEffetSurvol(state.mouvements.effetSurvol, "hover:brightness-110")}`}
              style={{ background: "var(--ac)", borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
            >
              {boutonTexte}
            </span>
          )}
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

function PhoneIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
      <path
        d="M6 3.5h3l1.3 4-2 1.5a10.5 10.5 0 0 0 5.7 5.7l1.5-2 4 1.3v3a1.5 1.5 0 0 1-1.6 1.5C11.5 18 6 12.5 5.5 6.1A1.5 1.5 0 0 1 6 3.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
      <path d="M12 21s6.5-6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5 6.5 11 6.5 11Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
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
  // Démo interactive du coeur "favoris" et du bouton "Commander" de la carte
  // (grille accueil et "Vous aimerez aussi") : état local par carte, pas un
  // réglage (state.grille/produitsLies) — ce sont des choix du visiteur, même
  // logique que favoriActif/commander sur la fiche produit ci-dessus.
  const [favori, setFavori] = useState(false);
  const [ajoutee, setAjoutee] = useState(false);
  const basculerFavori = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavori((v) => !v);
  };
  const commander = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAjoutee(true);
    setTimeout(() => setAjoutee(false), 1500);
  };
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
          <button
            type="button"
            onClick={basculerFavori}
            aria-label={favori ? t("Retirer des favoris", "Remove from favorites") : t("Ajouter aux favoris", "Add to favorites")}
            aria-pressed={favori}
            className={`absolute right-1.5 top-1.5 flex items-center justify-center rounded-full transition ${iconeTaille}`}
            style={{ background: favori ? "#E8207E" : "rgba(255,255,255,0.85)" }}
          >
            <MiniIcon
              path="M12 20s-6.2-3.9-8.4-7.6C1.8 9.4 3.6 6 7 6c1.9 0 3.4 1 5 2.8C13.6 7 15.1 6 17 6c3.4 0 5.2 3.4 3.4 6.4C18.2 16.1 12 20 12 20Z"
              color={favori ? "#fff" : "var(--ac)"}
            />
          </button>
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
          <button
            type="button"
            onClick={commander}
            className="mx-2 mt-1 flex items-center justify-center gap-1 rounded-full py-1 text-[7px] font-semibold text-white transition hover:brightness-110"
            style={{ background: "var(--ac)" }}
          >
            <MiniIcon path="M5.5 8h13l-1 12.5h-11ZM9 8V6.5a3 3 0 0 1 6 0V8" color="#fff" />
            {ajoutee ? t("Ajoutée !", "Added!") : t("Commander", "Order")}
          </button>
        )}
        {g.bouton === "icone" && (
          <button
            type="button"
            onClick={commander}
            aria-label={t("Commander", "Order")}
            className="mt-1 flex h-4 w-4 items-center justify-center rounded-full transition"
            style={{ background: ajoutee ? "var(--ac)" : "color-mix(in srgb, var(--ac) 12%, transparent)" }}
          >
            <MiniIcon path="M5.5 8h13l-1 12.5h-11ZM9 8V6.5a3 3 0 0 1 6 0V8" color={ajoutee ? "#fff" : "var(--ac)"} />
          </button>
        )}
      </div>
    </div>
  );
}
