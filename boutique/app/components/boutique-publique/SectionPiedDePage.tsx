import { LienBoutique } from "./PreviewMode";
import type { CSSProperties } from "react";
import type { PiedDePageState, StyleState, HeroState } from "@/app/components/dashboard-reglages/personnaliser/types";
import type { AvisClient, BoutiqueIdentite } from "@/lib/boutique-types";
import { texteAvecChiffres } from "@/lib/boutique-format";
import { HaloCourbes, Icon } from "./Icons";

const TAILLE_LOGO: Record<PiedDePageState["tailleLogo"], number> = { petite: 32, moyenne: 40, grande: 52 };

// Mêmes logos que la carte "Reversé sur ce compte" (public/images) — repris
// tels quels de PIED_PAIEMENT_APERCU dans BoutiquePreview.tsx : vrais fichiers
// du projet, pas une image inventée.
const MOYENS_PAIEMENT: { label: string; logo: string }[] = [
  { label: "Orange Money", logo: "/images/ORANGE.png" },
  { label: "MTN MoMo", logo: "/images/MTN.svg" },
  { label: "Moov Money", logo: "/images/MOOV.png" },
  { label: "Wave", logo: "/images/wave.png" },
];

// Icônes de réseaux génériques (caméra, lecture, message) — port de
// PIED_RESEAUX_ICONES : `piedDePage.reseaux` reste un simple booléen, sans
// champ pour choisir quels réseaux relier ni leur lien, donc ces icônes
// restent décoratives (pas de href) plutôt que des liens morts.
const RESEAUX_ICONES = [
  "M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M10 9l5 3-5 3Z",
  "M4 4h16v12H8l-4 4Z",
];

/*
  Groupes de liens du pied de page — `piedDePage.colonnesLiens` choisit
  combien de ces groupes s'affichent (2 à 4), comme dans l'éditeur
  (PIED_GROUPES_APERCU). Seuls les liens qui pointent vers une page réelle du
  site public ont un `href` ; les autres restent du texte simple (pas de
  page "Notre histoire"/"Programme fidélité" etc. côté site public
  aujourd'hui) — honnête plutôt que des liens morts vers "#".
*/
function groupesLiens(slug: string): { titre: string; liens: { label: string; href?: string }[] }[] {
  return [
    {
      titre: "Boutique",
      liens: [
        { label: "Tous les produits", href: `/boutique/${slug}#grille` },
        { label: "Catégories", href: `/boutique/${slug}#categories` },
        { label: "Offres", href: `/boutique/${slug}#grille` },
      ],
    },
    {
      titre: "Aide",
      liens: [
        { label: "Mon panier", href: `/boutique/${slug}/panier` },
        { label: "Suivre ma commande" },
        { label: "Questions fréquentes", href: `/boutique/${slug}#faq` },
      ],
    },
    {
      titre: "À propos",
      liens: [{ label: "Notre histoire" }, { label: "Conditions de vente" }, { label: "Confidentialité" }],
    },
    {
      titre: "Communauté",
      liens: [{ label: "Nous écrire" }, { label: "Programme fidélité" }, { label: "Parrainage" }],
    },
  ];
}

/*
  Pied de page — port fidèle de la case "pied-de-page" : logo + présentation,
  icônes réseaux, colonnes de liens, grille de moyens de paiement, décor
  Halo (modèle Halo ou "Courbes lumineuses" activé), badge "achats vérifiés"
  — calculé sur les vrais avis (avis.filter(verifie).length), affiché
  seulement s'il y en a au moins un (pas de "118 achats vérifiés" inventé
  comme dans l'éditeur).
*/
export default function SectionPiedDePage({
  slug,
  identite,
  piedDePage,
  style,
  grandeImage,
  avis,
}: {
  slug: string;
  identite: BoutiqueIdentite;
  piedDePage: PiedDePageState;
  style: StyleState;
  grandeImage: HeroState;
  avis: AvisClient[];
}) {
  const isHalo = style.modele === "halo";
  const FOND: Record<PiedDePageState["couleur"], { background: CSSProperties["background"]; color: string; sousTexte: string; sombre: boolean }> = {
    nuit: { background: isHalo ? "#0B0E1C" : "#1F1328", color: "#CFC6D8", sousTexte: "rgba(255,255,255,.45)", sombre: true },
    clair: { background: "var(--bg)", color: "var(--tx)", sousTexte: "color-mix(in srgb, var(--tx) 45%, transparent)", sombre: false },
    degrade: {
      background: isHalo ? "linear-gradient(120deg,var(--ac),#3A1D8A)" : "linear-gradient(120deg,#EC0C8C,#3A1D8A)",
      color: "#F5E9FF",
      sousTexte: "rgba(255,255,255,.55)",
      sombre: true,
    },
  };
  const fond = FOND[piedDePage.couleur];
  const centre = piedDePage.alignement === "centre";
  const tailleLogo = TAILLE_LOGO[piedDePage.tailleLogo];
  const traitCouleur = fond.sombre ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)";
  const puceCouleur = fond.sombre ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.05)";
  const groupes = groupesLiens(slug).slice(0, piedDePage.colonnesLiens);
  const achatsVerifies = avis.filter((a) => a.verifie).length;

  return (
    <footer className="relative mt-10 overflow-hidden" style={{ background: fond.background, color: fond.color }}>
      {isHalo && fond.sombre && <HaloCourbes ton="sombre" />}
      {!isHalo && grandeImage.courbesLumineuses && <HaloCourbes ton={fond.sombre ? "sombre" : "clair"} />}

      <div className={`relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 ${centre ? "items-center text-center" : "items-start"}`}>
        <div className={`flex w-full flex-col gap-6 ${centre ? "items-center" : "sm:flex-row sm:items-start sm:justify-between"}`}>
          <div className={`flex min-w-0 flex-col gap-3 ${centre ? "items-center" : ""}`}>
            <div className={`flex items-start gap-3 ${centre ? "flex-col items-center text-center" : ""}`}>
              {piedDePage.logoAffiche &&
                (identite.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={identite.logo} alt={identite.nom} className="shrink-0 rounded-full object-cover" style={{ width: tailleLogo, height: tailleLogo }} />
                ) : (
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full bg-white/15 font-bold"
                    style={{ width: tailleLogo, height: tailleLogo, fontSize: tailleLogo * 0.36 }}
                  >
                    {identite.nom.charAt(0).toUpperCase()}
                  </span>
                ))}
              <div className="min-w-0">
                <span className="block text-[17px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
                  {identite.nom}
                </span>
                {piedDePage.presentation && identite.presentation && (
                  <p className="mt-1 max-w-[280px] text-[13px] leading-relaxed opacity-70">{identite.presentation}</p>
                )}
              </div>
            </div>

            {piedDePage.reseaux && (
              <div className={`flex items-center gap-2 ${centre ? "justify-center" : ""}`}>
                {RESEAUX_ICONES.map((path, i) => (
                  <span key={i} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: fond.sombre ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)" }}>
                    <Icon path={path} color={fond.color} size={15} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {(groupes.length > 0 || piedDePage.moyensPaiement) && (
            <div className={`grid gap-x-8 gap-y-5 ${centre ? "grid-cols-2 justify-items-center sm:grid-cols-3" : "grid-cols-2 sm:flex sm:gap-10"}`}>
              {groupes.map((g) => (
                <div key={g.titre} className={centre ? "text-center" : ""}>
                  <p className="text-[12.5px] font-bold opacity-90">{g.titre}</p>
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {g.liens.map((lien) =>
                      lien.href ? (
                        <LienBoutique key={lien.label} href={lien.href} className="text-[12.5px] opacity-65 transition hover:opacity-100 hover:underline">
                          {lien.label}
                        </LienBoutique>
                      ) : (
                        <span key={lien.label} className="text-[12.5px] opacity-55">
                          {lien.label}
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
              {piedDePage.moyensPaiement && (
                <div className={centre ? "text-center" : ""}>
                  <p className="text-[12.5px] font-bold opacity-90">Paiement</p>
                  <div className={`mt-1.5 grid grid-cols-2 gap-1.5 ${centre ? "justify-items-center" : ""}`}>
                    {MOYENS_PAIEMENT.map((m) => (
                      <span key={m.label} className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: puceCouleur }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo} alt="" className="h-4 w-4 shrink-0 rounded object-contain" />
                        <span className="truncate text-[10.5px] font-semibold">{m.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`flex w-full flex-wrap items-center gap-3 border-t pt-5 ${centre ? "justify-center text-center" : "justify-between"}`} style={{ borderColor: traitCouleur }}>
          <p className="text-[12px]" style={{ color: fond.sousTexte }}>
            {texteAvecChiffres(piedDePage.mentionBas || `© ${new Date().getFullYear()} ${identite.nom}`)}
          </p>
          {achatsVerifies > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: "rgba(63,203,142,.16)", color: "#5FE0AA" }}>
              <Icon path="M5 12l4 4 10-10" color="#5FE0AA" size={13} />
              {texteAvecChiffres(`${achatsVerifies} achat${achatsVerifies > 1 ? "s" : ""} vérifié${achatsVerifies > 1 ? "s" : ""}`)}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
