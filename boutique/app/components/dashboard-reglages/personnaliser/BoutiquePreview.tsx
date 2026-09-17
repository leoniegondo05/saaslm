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
  const { style } = state;
  const visibles = state.sections
    .filter((s) => s.visible)
    .map((s) => s.id)
    .filter((id) => {
      const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
      return def.page === "les-deux" || def.page === page;
    });

  const vars: React.CSSProperties = {
    ["--ac" as string]: style.couleurPrincipale,
    ["--bg" as string]: style.couleurFond,
    ["--tx" as string]: style.couleurTexte,
    ["--rad" as string]: boutonRadius[style.boutonForme],
    background: style.couleurFond,
    color: style.couleurTexte,
  };

  const contenu = (
    <div style={vars} className="font-sans text-[12.5px] leading-tight">
      {visibles.map((id) => {
        const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
        const selectionnee = id === sectionChoisie;
        return (
          <div
            key={id}
            onClick={onChoisirSection ? () => onChoisirSection(id) : undefined}
            className={onChoisirSection ? "group/hl relative cursor-pointer" : "relative"}
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
        <div className="relative h-[600px] overflow-y-auto rounded-[2rem] bg-white">
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
      <div className="flex items-center gap-1.5 bg-[#e7e3ee] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="ml-3 truncate rounded-full bg-white px-3 py-1 text-[10px] text-[#6d6577]">
          …/{boutiqueNom.toLowerCase().replace(/\s+/g, "-")}
          {page === "commande" ? "/serum-eclat-30-ml" : ""}
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
          style={{ borderColor: "rgba(0,0,0,.08)", background: transparent ? "transparent" : "var(--bg)" }}
        >
          <Marque logo={logo} taille={tailleLogoPx} />
          {e.nomAvecLogo && <span className="text-[12.5px] font-bold">{boutiqueNom}</span>}
          <div className="ml-auto flex items-center gap-2.5" style={{ color: "var(--tx)" }}>
            {e.rechercheStyle === "barre" ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[rgba(0,0,0,.05)] px-2.5 py-1 text-[9.5px]" style={{ color: "var(--tx)", opacity: 0.5 }}>
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
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold"
                style={{ background: sombre ? "rgba(255,255,255,.16)" : "color-mix(in srgb, var(--ac) 14%, transparent)", color: sombre ? "#fff" : "var(--ac)" }}
              >
                <MiniIcon path="M12 3l2 5 5 1-4 3.6 1 5-4.5-2.5L7 17.6l1-5-4-3.6 5-1Z" color="currentColor" />
                {texteAvecChiffres(h.petitTexte)}
              </span>
              <p className="mt-2 text-[16px] font-bold leading-tight" style={{ fontFamily: "var(--font-bricolage)" }}>
                <TitreAvecMotValorise titre={h.titre} mot={h.motValorise} couleur={sombre ? "#FF7AC0" : "var(--ac)"} />
              </p>
              <p className="mt-1 text-[10px]" style={{ opacity: sombre ? 0.85 : 0.6 }}>
                {t("Des soins naturels pour le visage et le corps, choisis avec soin.", "Natural skincare for face and body, carefully chosen.")}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[10.5px] font-semibold"
                  style={{ background: sombre ? "#fff" : "var(--ac)", color: sombre ? "#0B0E1C" : "#fff", borderRadius: "var(--rad)" }}
                >
                  {h.bouton1Texte}
                </span>
                {h.boutons === 2 && (
                  <span
                    className="inline-flex items-center gap-1.5 border px-3.5 py-2 text-[10.5px] font-semibold"
                    style={{ borderColor: sombre ? "rgba(255,255,255,.4)" : "var(--ac)", color: textColor, borderRadius: "var(--rad)" }}
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
                  <Etoiles note={PRODUIT_APERCU.note} taille={7} />
                  <span className="font-figures-bold">{PRODUIT_APERCU.note}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    case "confiance": {
      const isHalo = state.style.modele === "halo";
      const items: { icon: string; label: string; sub: string }[] = [
        { icon: "M12 3 4 6.5V11c0 4.8 3.4 8.9 8 10 4.6-1.1 8-5.2 8-10V6.5Z", label: t("Produits authentiques", "Genuine products"), sub: t("Choisis par la boutique", "Chosen by the shop") },
        { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", label: t("Livraison rapide", "Fast delivery"), sub: t("4 h en moyenne", "4 h on average") },
        { icon: "M4 7h16v10H4Zm0 3h16", label: t("Paiement à la livraison", "Pay on delivery"), sub: t("Ou en ligne, avec remise", "Or online, with a discount") },
        { icon: "M4 4h16v12H8l-4 4Z", label: t("Service client", "Customer support"), sub: t("Par message ou appel", "By message or call") },
      ];
      const visibles2 = items.slice(0, state.confiance.nombre);
      return (
        <div className={`relative z-10 px-4 ${isHalo ? "-mt-6" : "py-3.5"}`}>
          <div
            className="grid gap-1 rounded-2xl bg-white px-2 py-3"
            style={{ gridTemplateColumns: `repeat(${visibles2.length}, minmax(0,1fr))`, boxShadow: isHalo ? "0 14px 30px -10px rgba(11,14,28,0.28)" : "none", border: isHalo ? "none" : "1px solid rgba(0,0,0,.08)" }}
          >
            {visibles2.map((it) => (
              <div key={it.label} className="flex flex-col items-center gap-1 px-1 text-center">
                <MiniIcon path={it.icon} color="var(--ac)" />
                <span className="text-[7.5px] font-semibold leading-tight text-[#1a1a1a]">{it.label}</span>
                <span className="text-[6.5px] leading-tight text-black/40">{it.sub}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "categories": {
      const cols = Math.max(2, Math.min(state.categories.colonnes, 6));
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Nos catégories", "Our categories")}</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
            {CATEGORIES_APERCU.map((c) => (
              <div key={c.label} className="overflow-hidden rounded-xl border" style={{ borderColor: "rgba(0,0,0,.08)" }}>
                <div className="flex aspect-square items-center justify-center" style={{ background: "color-mix(in srgb, var(--ac) 10%, transparent)" }}>
                  <MiniIcon path="M4 6h16M4 12h16M4 18h16" color="var(--ac)" />
                </div>
                <p className="truncate px-1.5 pt-1 text-[8px] font-semibold">{t(c.label, c.labelEn)}</p>
                <p className="truncate px-1.5 pb-1.5 text-[7px]" style={{ color: "rgba(0,0,0,.4)" }}>
                  {texteAvecChiffres(t(`${c.count} produits`, `${c.count} products`))}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "promo": {
      const remise = state.paiement.remiseEnLignePct;
      const titre = remise > 0 ? t(`Jusqu'à −${remise} % en payant en ligne`, `Up to −${remise}% when paying online`) : t("Nouveaux coffrets disponibles", "New gift sets available");
      const inverse = state.promo.cote === "droite";
      return (
        <div className="px-4 py-3.5">
          <div className={`flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-4 text-white ${inverse ? "flex-row-reverse" : ""}`} style={{ background: "linear-gradient(120deg,#0B0E1C,#1A1240 60%,#3A0F4E)" }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <MiniIcon path="M20 7 12 3 4 7l8 4 8-4Zm0 3-8 4-8-4m0 5 8 4 8-4" color="rgba(255,255,255,.7)" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-semibold">
                {t("Offre du moment", "Current offer")}
              </span>
              <p className="mt-1 text-[12px] font-bold leading-tight">{texteAvecChiffres(titre)}</p>
              {state.promo.compteur && (
                <div className="mt-1.5 flex gap-1">
                  {[["02", t("j", "d")], ["14", t("h", "h")], ["36", t("min", "min")]].map(([v, u]) => (
                    <span key={u} className="rounded-md bg-white/15 px-1.5 py-0.5 text-center text-[8px]">
                      <span className="font-figures-bold">{v}</span> {u}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    case "grille": {
      const isHalo = state.style.modele === "halo";
      const cols = Math.max(2, Math.min(state.grille.colonnes, 5));
      const produits = PRODUITS_GRILLE_APERCU.slice(0, Math.max(2, state.grille.nombre));
      return (
        <div className="px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold">{t("Meilleures ventes", "Best sellers")}</p>
            <span className="text-[9px] font-semibold" style={{ color: "var(--ac)" }}>{t("Tout voir", "See all")}</span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
            {produits.map((p) => (
              <div key={p.nom} className="overflow-hidden rounded-xl border" style={{ borderColor: "rgba(0,0,0,.08)" }}>
                <div className="flex aspect-square items-center justify-center" style={{ background: "rgba(0,0,0,.04)" }}>
                  <MiniIcon path="M4 6h4l1.4-2h5.2L16 6h4v12H4Z" color="rgba(0,0,0,.25)" />
                </div>
                <div className="px-1.5 py-1.5">
                  <p className="truncate text-[8px] font-semibold">{t(p.nom, p.nomEn)}</p>
                  <p className="mt-0.5 text-[9.5px] font-figures-bold" style={{ color: "var(--ac)" }}>{p.prix.toLocaleString("fr-FR")} F</p>
                  {isHalo && (
                    <span className="mt-1 block text-[7px] font-semibold" style={{ color: "var(--ac)" }}>
                      {t("Commander", "Order")}
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
      const items = [
        { icon: "M4 7h16v10H4Zm0 3h16", label: t("Paiement en ligne sécurisé", "Secure online payment") },
        { icon: "M3 11l2-6h14l2 6v2H3Zm2 2v6h2v-6m8 0v6h2v-6", label: t("Suivi de la commande", "Order tracking") },
        { icon: "M4 4h16v12H8l-4 4Z", label: t("Service client", "Customer support") },
        { icon: "M12 3l2 5 5 1-4 3.6 1 5-4.5-2.5L7 17.6l1-5-4-3.6 5-1Z", label: t("Offres régulières", "Regular deals") },
      ].slice(0, Math.max(2, state.engagements.nombre));
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
                <Etoiles note={PRODUIT_APERCU.note} taille={9} />
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
          <p className="text-[15px] font-bold leading-tight">{t(PRODUIT_APERCU.nom, PRODUIT_APERCU.nomEn)}</p>
          {state.infos.noteMoyenne && (
            <p className="mt-1 flex items-center gap-1 text-[10.5px]" style={{ color: "rgba(0,0,0,.45)" }}>
              <Etoiles note={PRODUIT_APERCU.note} /> <span className="font-figures">{PRODUIT_APERCU.note}</span> · <span className="font-figures">{PRODUIT_APERCU.avisCount}</span> {t("avis", "reviews")}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[19px] font-figures-bold">{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
            {state.infos.ancienPrixBarre && (
              <span className="text-[12px] line-through font-figures" style={{ color: "rgba(0,0,0,.4)" }}>
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
            <p className="mt-1.5 text-[10px]" style={{ color: "rgba(0,0,0,.5)" }}>
              {texteAvecChiffres(t(`Plus que ${PRODUIT_APERCU.unitesDisponibles} en stock`, `Only ${PRODUIT_APERCU.unitesDisponibles} left in stock`))}
            </p>
          )}
          {state.infos.variantes && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRODUIT_APERCU.variantes.map((v, i) => (
                <span
                  key={v}
                  className="rounded-full border px-3 py-1 text-[10px] font-figures-bold"
                  style={i === 0 ? { borderColor: "var(--ac)", color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 8%, transparent)" } : { borderColor: "rgba(0,0,0,.12)" }}
                >
                  {v}
                </span>
              ))}
            </div>
          )}
          {state.infos.quantite && (
            <div className="mt-2.5 inline-flex items-center gap-3 rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: "rgba(0,0,0,.12)" }}>
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
          <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,.4)" }}>
            {t("Offres par quantité", "Quantity offers")}
          </p>
          <div className="flex flex-col gap-1.5">
            {state.offres.paliers.map((p) => (
              <div
                key={p.unites}
                className="flex items-center justify-between rounded-xl border px-3 py-2"
                style={p.badge ? { borderColor: "var(--ac)", background: "color-mix(in srgb, var(--ac) 6%, transparent)" } : { borderColor: "rgba(0,0,0,.1)" }}
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
              <div key={c.label} className={`rounded-xl border px-3 py-2.5 ${c.demi ? "" : "col-span-full"}`} style={{ borderColor: "rgba(0,0,0,.12)" }}>
                {state.formulaire.libellesDansChamp ? (
                  <>
                    <p className="text-[7.5px]" style={{ color: "rgba(0,0,0,.4)" }}>{c.label}</p>
                    <p className="mt-0.5 h-2.5 w-2/3 rounded" style={{ background: "rgba(0,0,0,.08)" }} />
                  </>
                ) : (
                  <p className="text-[10px]" style={{ color: "rgba(0,0,0,.4)" }}>{c.label}</p>
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
            <div className="mt-2 rounded-xl border px-3 py-2 text-[9.5px]" style={{ borderColor: "rgba(0,0,0,.12)", color: "rgba(0,0,0,.4)" }}>
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
              className="mb-2 flex w-full items-center justify-between gap-2 border-2 px-3.5 py-2.5 text-left"
              style={{ borderColor: "var(--ac)", background: "color-mix(in srgb, var(--ac) 6%, transparent)", borderRadius: "var(--rad)" }}
            >
              <span className="text-[11px] font-semibold">{t("Payer en ligne", "Pay online")}</span>
              <span className="text-[11.5px] font-figures-bold">
                {prixLigne.toLocaleString("fr-FR")} F
                {remise > 0 && <span className="ml-1 text-[9px] font-normal line-through font-figures" style={{ color: "rgba(0,0,0,.4)" }}>{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>}
              </span>
            </button>
          )}
          {state.paiement.payerALaLivraison && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5" style={{ borderColor: "rgba(0,0,0,.12)" }}>
              <span className="text-[11px] font-semibold">{t("Payer à la livraison", "Pay on delivery")}</span>
              <span className="text-[11.5px] font-figures-bold">{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
            </div>
          )}
          <div className="mb-2.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: "rgba(0,0,0,.12)" }}>
            <div>
              <p className="text-[11px] font-semibold">{t("Livraison standard", "Standard delivery")}</p>
              <p className="text-[9px]" style={{ color: "rgba(0,0,0,.4)" }}>{texteAvecChiffres(t("4 h en moyenne", "4 h on average"))}</p>
            </div>
            <span className="text-[10.5px] font-semibold">{t("Incluse", "Included")}</span>
          </div>
          {state.paiement.livraisonExpress && (
            <div className="mb-2.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: "rgba(0,0,0,.12)" }}>
              <p className="text-[11px] font-semibold">{t("Livraison express", "Express delivery")}</p>
              <span className="text-[10.5px] font-figures-bold">+2 000 F</span>
            </div>
          )}
          <button
            type="button"
            className="w-full py-3 text-center text-[12px] font-bold text-white"
            style={{ background: style_boutonBg(state), borderRadius: "var(--rad)" }}
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
              <Etoiles note={PRODUIT_APERCU.note} taille={11} />
              <p className="text-[9px]" style={{ color: "rgba(0,0,0,.4)" }}><span className="font-figures">{PRODUIT_APERCU.avisCount}</span> {t("avis", "reviews")}</p>
            </div>
          </div>
          <div className={state.avis.disposition === "grille" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
            {AVIS_APERCU.slice(0, state.avis.disposition === "grille" ? 2 : Math.min(2, state.avis.nombreAffiches)).map((a) => (
              <div key={a.nom} className="rounded-xl border px-3 py-2.5" style={{ borderColor: "rgba(0,0,0,.1)" }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "var(--ac)" }}>
                    {a.initiales}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold">{a.nom}</p>
                    <Etoiles note={a.note} taille={8} />
                  </div>
                  {a.verifie && (
                    <span className="shrink-0 text-[8px] font-semibold" style={{ color: "#1F8A5B" }}>
                      ✓ {t("Achat vérifié", "Verified purchase")}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[10px]" style={{ color: "rgba(0,0,0,.55)" }}>{a.texte}</p>
                {a.reponse && (
                  <div className="mt-1.5 rounded-lg border-l-2 px-2 py-1.5 text-[9px]" style={{ borderColor: "var(--ac)", background: "rgba(0,0,0,.03)", color: "rgba(0,0,0,.55)" }}>
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
                <div key={q.question} className="border-b py-2" style={{ borderColor: "rgba(0,0,0,.08)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10.5px] font-semibold">{texteAvecChiffres(q.question)}</p>
                    <span className="shrink-0 text-[11px]" style={{ color: "rgba(0,0,0,.35)" }}>{ouverte ? "−" : "+"}</span>
                  </div>
                  {ouverte && <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "rgba(0,0,0,.5)" }}>{texteAvecChiffres(q.reponse)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "vendu-par":
      return (
        <div className="mx-4 mb-3.5 flex items-center gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: "rgba(0,0,0,.1)", background: "rgba(0,0,0,.02)" }}>
          <Marque logo={logo} taille={22} />
          <div>
            <p className="text-[8px] uppercase tracking-wide" style={{ color: "rgba(0,0,0,.4)" }}>{t("Vendu par", "Sold by")}</p>
            <p className="text-[11.5px] font-bold">{boutiqueNom}</p>
          </div>
        </div>
      );

    case "pied-de-page": {
      const isHalo = state.style.modele === "halo";
      return (
        <div className="relative overflow-hidden px-4 py-4 text-[10px]" style={{ background: isHalo ? "#0B0E1C" : "#1F1328", color: "#CFC6D8" }}>
          {/* mêmes courbes que la grande image, convergeant vers un point lumineux — motif Halo (maquette) */}
          {isHalo && <HaloCourbes ton="sombre" />}
          <div className="relative">
            {state.piedDePage.presentation && (
              <p className="mb-2">
                <b className="block text-white">{boutiqueNom}</b>
                {t("Soins naturels pour le visage et le corps.", "Natural skincare and body care.")}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {state.piedDePage.liens && (
                <>
                  <span>{t("Conditions de vente", "Terms of sale")}</span>
                  <span>{t("Livraison et retours", "Delivery and returns")}</span>
                </>
              )}
              {state.piedDePage.reseaux && <span>Facebook · Instagram</span>}
            </div>
            {state.piedDePage.moyensPaiement && (
              <div className="mt-2 flex gap-1.5">
                {["Orange Money", "MTN MoMo", "Moov Money", "Wave"].map((m) => (
                  <span key={m} className="rounded bg-white/10 px-1.5 py-0.5 text-[8px]">{m}</span>
                ))}
              </div>
            )}
            <p className="mt-2.5 text-[8.5px]" style={{ color: "rgba(255,255,255,.4)" }}>{texteAvecChiffres(state.piedDePage.mentionBas)}</p>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

function style_boutonBg(state: EditeurState): string {
  const { boutonRemplissage, couleurPrincipale } = state.style;
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

function Etoiles({ note, taille = 10 }: { note: number; taille?: number }) {
  return (
    <span className="inline-flex gap-[1px]" style={{ color: "#F2A93B" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={taille} height={taille} fill={i < Math.round(note) ? "currentColor" : "rgba(0,0,0,.15)"} aria-hidden>
          <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}
