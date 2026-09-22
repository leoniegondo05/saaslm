"use client";

import { useMemo, useState } from "react";
import type { ProduitPublic } from "@/lib/boutique-types";
import type { BoutonCommandeTexte, EditeurState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { boutonCommandeFond } from "@/lib/boutique-style";
import { texteAvecChiffres } from "@/lib/boutique-format";
import { ShareIcon } from "./Icons";
import { LuCreditCard, LuHeart, LuImage, LuPercent, LuTruck, LuZoomIn, LuZoomOut } from "react-icons/lu";
import { useCart } from "./CartProvider";
import { useBoutiqueRouter } from "./PreviewMode";

const LABELS: Record<BoutonCommandeTexte, string> = { "je-commande": "Je commande", commander: "Commander", acheter: "Acheter" };

/*
  Fiche produit — port fidèle des cases "galerie" + "infos" de
  BoutiquePreview.tsx, fusionnées en 2 colonnes sur ordinateur comme dans
  l'éditeur (cf. commentaire "infosAccolee" dans BoutiquePreview.tsx) :
  rail de vignettes, bouton zoom, compteur d'images, badge "Nouveauté",
  étoiles, prix + ancien prix barré + badge remise, description dépliable,
  barre de stock (sous le seuil réglé), stepper de quantité, bouton de
  commande (couleur boutonCommandeFond) + favori/partager, mini rangée de
  confiance. Pas de sélecteur de variantes ni de badge vidéo : ProduitPublic
  n'a ni variantes ni vidéo (cf. rapport de tâche) — plutôt que d'inventer
  ces données, ces deux blocs sont omis proprement.
*/
export default function ProduitDetailClient({
  slug,
  produit,
  editeur,
}: {
  slug: string;
  produit: ProduitPublic;
  editeur: EditeurState;
}) {
  const { ajouter } = useCart();
  const router = useBoutiqueRouter();
  const [quantite, setQuantite] = useState(1);
  const [imageActive, setImageActive] = useState(0);
  const [zoomActif, setZoomActif] = useState(false);
  const [descriptionEtendue, setDescriptionEtendue] = useState(false);
  const [favori, setFavori] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);

  const g = editeur.galerie;
  const infos = editeur.infos;
  const paiement = editeur.paiement;
  const couleurEtoiles = editeur.style.etoilesCouleur === "principale" ? "var(--ac)" : "#F2A93B";
  const enPromo = produit.prixNormal != null && produit.prixNormal > produit.prix;
  const fondBouton = useMemo(() => boutonCommandeFond(editeur), [editeur]);
  const label = LABELS[paiement.boutonTexte];
  const rupture = produit.stock <= 0;
  const stockMax = produit.stock > 0 ? produit.stock : 99;
  const images = produit.images;
  const ratio = g.format === "portrait" ? "3/4" : "1/1";

  const descriptionLongue = (produit.description ?? "").length > 160;
  const descriptionAffichee =
    infos.description === "complete" || descriptionEtendue || !descriptionLongue ? produit.description : `${(produit.description ?? "").slice(0, 160)}…`;

  const confianceInfos = [
    { icon: LuTruck, texte: "Livraison 4 h en moyenne", actif: true },
    { icon: LuCreditCard, texte: "Paiement à la livraison", actif: paiement.payerALaLivraison },
    { icon: LuPercent, texte: `−${paiement.remiseEnLignePct} % en ligne`, actif: paiement.payerEnLigne },
  ].filter((it) => it.actif);

  function handleCommander() {
    ajouter(produit.id, quantite);
    router.push(`/boutique/${slug}/commande`);
  }

  async function partager() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: produit.nom, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* annulé par le visiteur */
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 1800);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Galerie */}
        <div className={`flex gap-2 ${g.vignettesOrdinateur === "gauche" ? "lg:flex-row" : "lg:flex-col"} ${g.position === "droite" ? "lg:order-2" : ""}`}>
          {g.vignettesOrdinateur === "gauche" && images.length > 1 && (
            <div className="hidden w-16 shrink-0 flex-col gap-2 lg:flex">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageActive(i)}
                  aria-label={`Voir la photo ${i + 1}`}
                  aria-pressed={i === imageActive}
                  className="aspect-square overflow-hidden rounded-lg border-2 transition"
                  style={{ borderColor: i === imageActive ? "var(--ac)" : "transparent", opacity: i === imageActive ? 1 : 0.6 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="relative w-full max-w-sm overflow-hidden bg-[var(--tx)]/5" style={{ aspectRatio: ratio, borderRadius: "var(--card-rad)" }}>
              {images.length > 0 ? (
                <div className="h-full w-full overflow-hidden transition-transform duration-300" style={{ transform: zoomActif ? "scale(1.6)" : "scale(1)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[imageActive]} alt={produit.nom} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--tx)]/25">
                  <LuImage size={64} />
                </div>
              )}
              {g.boutonZoom && images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setZoomActif((v) => !v)}
                  aria-pressed={zoomActif}
                  aria-label={zoomActif ? "Dézoomer" : "Zoomer"}
                  className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  {zoomActif ? <LuZoomOut color="rgba(0,0,0,.65)" /> : <LuZoomIn color="rgba(0,0,0,.65)" />}
                </button>
              )}
              {g.compteur && images.length > 1 && (
                <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {imageActive + 1} / {images.length}
                </span>
              )}
              {g.pointsPosition && images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                  {images.map((_, i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i === imageActive ? "#fff" : "rgba(255,255,255,.5)" }} />
                  ))}
                </div>
              )}
            </div>
            {(g.vignettesOrdinateur === "dessous" || g.vignettesTelephone === "dessous") && images.length > 1 && (
              <div className={`mt-3 flex gap-2 overflow-x-auto ${g.vignettesOrdinateur === "gauche" ? "lg:hidden" : ""}`}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImageActive(i)}
                    aria-label={`Voir la photo ${i + 1}`}
                    aria-pressed={i === imageActive}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition"
                    style={{ borderColor: i === imageActive ? "var(--ac)" : "transparent", opacity: i === imageActive ? 1 : 0.65 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="flex flex-col gap-1">
          {infos.badgeNouveaute && (
            <span className="mb-1 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: "var(--ac)" }}>
              Nouveauté
            </span>
          )}
          <h1 className="text-[16px] font-bold leading-tight sm:text-[18px]" style={{ fontFamily: "var(--font-titre)" }}>
            {produit.nom}
          </h1>
          {infos.etoilesSousNom && produit.note != null && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[var(--tx)]/65">
              <span aria-hidden style={{ color: couleurEtoiles }}>★</span>
              <span className="font-figures">{produit.note.toFixed(1)}</span>·<span className="font-figures">{produit.avisCount}</span> avis
            </div>
          )}
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="text-[17px] font-extrabold">{produit.prix.toLocaleString("fr-FR")} F</span>
            {infos.ancienPrixBarre && enPromo && <span className="text-[12px] text-[var(--tx)]/40 line-through">{produit.prixNormal!.toLocaleString("fr-FR")} F</span>}
            {infos.badgeRemise && paiement.payerEnLigne && paiement.remiseEnLignePct > 0 && (
              <span className="rounded-md px-2 py-1 text-[11px] font-bold text-white" style={{ background: "#0B0E1C" }}>
                −{paiement.remiseEnLignePct} % en ligne
              </span>
            )}
          </div>
          {rupture ? (
            <p className="mt-4 text-[13.5px] font-medium text-[var(--tx)]/60">Rupture de stock — indisponible pour le moment.</p>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              {infos.quantite && (
                <div className="inline-flex h-10 shrink-0 items-center gap-2.5 rounded-full border border-[var(--tx)]/15 px-3.5 text-[11.5px]">
                  <button type="button" onClick={() => setQuantite((q) => Math.max(1, q - 1))} disabled={quantite <= 1} className="flex items-center justify-center disabled:opacity-30" aria-label="Diminuer la quantité">
                    −
                  </button>
                  <span className="text-center font-semibold" aria-live="polite">
                    {quantite}
                  </span>
                  <button type="button" onClick={() => setQuantite((q) => Math.min(stockMax, q + 1))} disabled={quantite >= stockMax} className="flex items-center justify-center disabled:opacity-30" aria-label="Augmenter la quantité">
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={handleCommander}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-6 text-[11px] font-bold text-white transition hover:brightness-110 max-w-[230px]"
                style={{ background: fondBouton, borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
              >
                {label}
              </button>
              {paiement.boutonSecondaire !== "aucun" && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => (paiement.boutonSecondaire === "favori" ? setFavori((v) => !v) : partager())}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                    style={{
                      borderColor: paiement.boutonSecondaire === "favori" && favori ? "transparent" : "color-mix(in srgb, var(--tx) 15%, transparent)",
                      background: paiement.boutonSecondaire === "favori" && favori ? "var(--ac)" : "transparent",
                    }}
                    aria-label={paiement.boutonSecondaire === "favori" ? "Ajouter aux favoris" : "Partager"}
                  >
                    {paiement.boutonSecondaire === "favori" ? (
                      <LuHeart color={favori ? "#fff" : "var(--tx)"} size={20} />
                    ) : (
                      <ShareIcon color="var(--tx)" size={20} />
                    )}
                  </button>
                  {lienCopie && <span className="absolute right-0 top-[calc(100%+6px)] whitespace-nowrap rounded-lg bg-[#141220] px-2.5 py-1.5 text-[11px] font-semibold text-white">Lien copié</span>}
                </div>
              )}
            </div>
          )}

          {paiement.rangeeConfiance && confianceInfos.length > 0 && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--tx)]/8 pt-3">
              {confianceInfos.map((it) => (
                <div key={it.texte} className="flex items-center gap-1.5">
                  <it.icon color="var(--ac)" size={16} />
                  <span className="text-[11px] font-medium leading-tight text-[var(--tx)]/60">{it.texte}</span>
                </div>
              ))}
            </div>
          )}

          {produit.description && (
            <div className="mt-3">
              <p className="text-[14px] leading-relaxed text-[var(--tx)]/75">{descriptionAffichee}</p>
              {infos.description === "courte" && descriptionLongue && !descriptionEtendue && (
                <button type="button" onClick={() => setDescriptionEtendue(true)} className="mt-1 text-[12.5px] font-semibold underline">
                  Lire la suite
                </button>
              )}
            </div>
          )}
          {infos.stockRestant && produit.stock > 0 && produit.stock <= infos.stockAfficherSousUnites && (
            <div className="mt-3">
              <p className="text-[12.5px] text-[var(--tx)]/60">{texteAvecChiffres(`Plus que ${produit.stock} en stock`)}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--tx)]/8">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((produit.stock / infos.stockAfficherSousUnites) * 100))}%`, background: "var(--ac)" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
