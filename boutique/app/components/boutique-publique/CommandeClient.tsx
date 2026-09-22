"use client";

import { useEffect, useState } from "react";
import type { ProduitPublic } from "@/lib/boutique-types";
import type { BoutonCommandeTexte, EditeurState } from "@/app/components/dashboard-reglages/personnaliser/types";
import { boutonCommandeFond } from "@/lib/boutique-style";
import { texteAvecChiffres } from "@/lib/boutique-format";
import { LuCheck, LuCreditCard, LuRotateCcw, LuShoppingCart, LuTruck } from "react-icons/lu";
import FormulaireChamps, { VALEURS_FORMULAIRE_VIDES, type ValeursFormulaire } from "./FormulaireChamps";
import { useCart, type CartItem } from "./CartProvider";
import { useBoutiqueRouter } from "./PreviewMode";

type Ligne = { item: CartItem; produit: ProduitPublic };

const LABELS: Record<BoutonCommandeTexte, string> = { "je-commande": "Je commande", commander: "Commander", acheter: "Acheter" };

const MOYENS_PAIEMENT = [
  { label: "Orange Money", logo: "/images/ORANGE.png" },
  { label: "MTN MoMo", logo: "/images/MTN.svg" },
  { label: "Moov Money", logo: "/images/MOOV.png" },
  { label: "Wave", logo: "/images/wave.png" },
];

function RadioCercle({ actif }: { actif: boolean }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: actif ? "var(--ac)" : "color-mix(in srgb, var(--tx) 25%, transparent)" }}>
      {actif && <span className="h-2 w-2 rounded-full" style={{ background: "var(--ac)" }} />}
    </span>
  );
}

function TitreNumerote({ n, titre }: { n: number; titre: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2 lg:mb-1.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white lg:h-5 lg:w-5" style={{ background: "var(--ac)" }}>
        {n}
      </span>
      <span className="text-[14px] font-bold lg:text-[13px]">{titre}</span>
    </div>
  );
}

/*
  Commande / paiement — fusion "formulaire" + "paiement" en une seule carte
  "Finaliser ma commande" 2 colonnes, port fidèle de la case "paiement" de
  BoutiquePreview.tsx (radios numérotés, grille "Payer avec", options de
  livraison, "Vos informations" via FormulaireChamps.tsx, récapitulatif,
  CTA final) — adapté à un vrai panier multi-produits (`lignes`) là où
  l'éditeur ne simule qu'un seul produit fixe. Toujours pas d'API de
  commandes réelle (cf. [[dashboard-mock-data-pending-laravel-api]]) :
  la soumission simule un envoi puis vide le panier et route vers la
  confirmation, comme avant.
*/
export default function CommandeClient({ slug, produits, editeur }: { slug: string; produits: ProduitPublic[]; editeur: EditeurState }) {
  const router = useBoutiqueRouter();
  const { items, pret, vider } = useCart();
  const [valeurs, setValeurs] = useState<ValeursFormulaire>(VALEURS_FORMULAIRE_VIDES);
  const [modePaiement, setModePaiement] = useState<"en-ligne" | "a-la-livraison">(editeur.paiement.payerEnLigne ? editeur.paiement.modePreselectionne : "a-la-livraison");
  const [methodePaiement, setMethodePaiement] = useState(MOYENS_PAIEMENT[0].label);
  const [livraison, setLivraison] = useState<"standard" | "express">(editeur.paiement.livraisonPreselectionnee);
  const [envoi, setEnvoi] = useState<"idle" | "envoi">("idle");

  const lignes: Ligne[] = items.map((item) => ({ item, produit: produits.find((p) => p.id === item.produitId) })).filter((l): l is Ligne => !!l.produit);

  useEffect(() => {
    if (pret && lignes.length === 0) router.replace(`/boutique/${slug}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pret, lignes.length, slug]);

  if (!pret) return null;
  if (lignes.length === 0) return null;

  const sousTotal = lignes.reduce((s, l) => s + l.produit.prix * l.item.quantite, 0);
  const remise = editeur.paiement.remiseEnLignePct;
  const prixEnLigne = Math.round((sousTotal * (100 - remise)) / 100);
  const remiseMontant = sousTotal - prixEnLigne;
  const fraisExpress = 2000;
  const total = (modePaiement === "en-ligne" ? prixEnLigne : sousTotal) + (livraison === "express" ? fraisExpress : 0);

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (envoi === "envoi") return;
    setEnvoi("envoi");
    setTimeout(() => {
      vider();
      router.push(`/boutique/${slug}/commande/confirmation`);
    }, 900);
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-5">
      <h1 className="mb-6 text-[22px] font-bold lg:mb-3 lg:text-[19px]" style={{ fontFamily: "var(--font-titre)" }}>
        Finaliser ma commande
      </h1>
      <form onSubmit={soumettre} className="grid gap-4 lg:grid-cols-2 lg:gap-3">
        {/* Colonne gauche : paiement + livraison */}
        <div className="flex flex-col gap-4 lg:gap-3">
          <div className="rounded-2xl border border-[var(--tx)]/8 p-4 shadow-sm lg:p-3">
            <TitreNumerote n={1} titre="Mode de paiement" />
            <div className="grid grid-cols-2 gap-2 lg:gap-1.5">
              {editeur.paiement.payerEnLigne && (
                <button
                  type="button"
                  onClick={() => setModePaiement("en-ligne")}
                  className="relative flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left lg:py-2"
                  style={{
                    borderWidth: modePaiement === "en-ligne" ? "var(--btn-border)" : "1px",
                    borderColor: modePaiement === "en-ligne" ? "var(--ac)" : "color-mix(in srgb, var(--tx) 12%, transparent)",
                    background: modePaiement === "en-ligne" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                  }}
                >
                  {remise > 0 && (
                    <span className="absolute -right-1.5 -top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "var(--ac)" }}>
                      −{remise} %
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <RadioCercle actif={modePaiement === "en-ligne"} />
                    <span className="text-[13px] font-bold">Payer en ligne</span>
                  </span>
                  <span className="pl-[22px] text-[10.5px] leading-tight text-[var(--tx)]/50">{editeur.paiement.texteRemiseOption}</span>
                  <span className="pl-[22px] text-[13.5px] font-figures-bold">
                    {prixEnLigne.toLocaleString("fr-FR")} F
                    {remise > 0 && <span className="ml-1 text-[10.5px] font-normal text-[var(--tx)]/35 line-through">{sousTotal.toLocaleString("fr-FR")} F</span>}
                  </span>
                </button>
              )}
              {editeur.paiement.payerALaLivraison && (
                <button
                  type="button"
                  onClick={() => setModePaiement("a-la-livraison")}
                  className="flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left lg:py-2"
                  style={{
                    borderWidth: modePaiement === "a-la-livraison" ? "var(--btn-border)" : "1px",
                    borderColor: modePaiement === "a-la-livraison" ? "var(--ac)" : "color-mix(in srgb, var(--tx) 12%, transparent)",
                    background: modePaiement === "a-la-livraison" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <RadioCercle actif={modePaiement === "a-la-livraison"} />
                    <span className="text-[13px] font-bold">Payer à la livraison</span>
                  </span>
                  <span className="pl-[22px] text-[10.5px] leading-tight text-[var(--tx)]/50">Vous payez à réception</span>
                  <span className="pl-[22px] text-[13.5px] font-figures-bold">{sousTotal.toLocaleString("fr-FR")} F</span>
                </button>
              )}
            </div>
          </div>

          {editeur.paiement.payerEnLigne && modePaiement === "en-ligne" && (
            <div className="rounded-2xl border border-[var(--tx)]/8 p-4 shadow-sm lg:p-3">
              <TitreNumerote n={2} titre="Payer avec" />
              <div className="grid grid-cols-4 gap-2 lg:gap-1.5">
                {MOYENS_PAIEMENT.map((m) => {
                  const selectionne = methodePaiement === m.label;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMethodePaiement(m.label)}
                      className="relative flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5 lg:py-2"
                      style={{
                        borderWidth: selectionne ? "var(--btn-border)" : "1px",
                        borderColor: selectionne ? "var(--ac)" : "color-mix(in srgb, var(--tx) 12%, transparent)",
                        background: selectionne ? "color-mix(in srgb, var(--ac) 4%, transparent)" : "transparent",
                      }}
                    >
                      {selectionne && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "var(--ac)" }}>
                          <LuCheck color="#fff" size={10} />
                        </span>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.logo} alt="" className="h-5 w-5 object-contain" style={{ filter: selectionne ? "none" : "grayscale(1)", opacity: selectionne ? 1 : 0.45 }} />
                      <span className="truncate text-center text-[10px] font-semibold" style={{ opacity: selectionne ? 1 : 0.55 }}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--tx)]/8 p-4 shadow-sm lg:p-3">
            <TitreNumerote n={3} titre="Livraison" />
            <div className="grid grid-cols-2 gap-2 lg:gap-1.5">
              <button
                type="button"
                onClick={() => setLivraison("standard")}
                className="flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left lg:py-2"
                style={{
                  borderWidth: livraison === "standard" ? "var(--btn-border)" : "1px",
                  borderColor: livraison === "standard" ? "var(--ac)" : "color-mix(in srgb, var(--tx) 12%, transparent)",
                  background: livraison === "standard" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                }}
              >
                <span className="flex items-center gap-1.5">
                  <RadioCercle actif={livraison === "standard"} />
                  <span className="text-[13px] font-bold">Livraison standard</span>
                </span>
                <span className="pl-[22px] text-[10.5px] leading-tight text-[var(--tx)]/50">{texteAvecChiffres("4 h en moyenne")}</span>
                <span className="pl-[22px] text-[12px] font-semibold">Incluse</span>
              </button>
              {editeur.paiement.livraisonExpress && (
                <button
                  type="button"
                  onClick={() => setLivraison("express")}
                  className="flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left lg:py-2"
                  style={{
                    borderWidth: livraison === "express" ? "var(--btn-border)" : "1px",
                    borderColor: livraison === "express" ? "var(--ac)" : "color-mix(in srgb, var(--tx) 12%, transparent)",
                    background: livraison === "express" ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <RadioCercle actif={livraison === "express"} />
                    <span className="text-[13px] font-bold">Livraison express</span>
                  </span>
                  <span className="pl-[22px] text-[10.5px] leading-tight text-[var(--tx)]/50">{editeur.paiement.texteExpress}</span>
                  <span className="pl-[22px] text-[12.5px] font-figures-bold">+{fraisExpress.toLocaleString("fr-FR")} F</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite : coordonnées + récapitulatif + CTA */}
        <div className="rounded-2xl border border-[var(--tx)]/8 p-4 shadow-sm lg:p-3">
          <TitreNumerote n={4} titre="Vos informations" />
          <FormulaireChamps f={editeur.formulaire} valeurs={valeurs} onChange={setValeurs} />

          <div className="mt-4 rounded-xl bg-[var(--tx)]/[.03] p-3.5 text-[13px] lg:mt-3 lg:p-3">
            {lignes.map(({ item, produit }) => (
              <div key={produit.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-[var(--tx)]/65">
                  {produit.nom} × {item.quantite}
                </span>
                <span className="shrink-0 font-figures-bold">{(produit.prix * item.quantite).toLocaleString("fr-FR")} F</span>
              </div>
            ))}
            {modePaiement === "en-ligne" && remise > 0 && (
              <div className="mt-1.5 flex items-center justify-between border-t border-[var(--tx)]/8 pt-1.5">
                <span style={{ color: "var(--ac)" }}>Remise paiement en ligne</span>
                <span className="font-figures-bold" style={{ color: "var(--ac)" }}>
                  −{remiseMontant.toLocaleString("fr-FR")} F
                </span>
              </div>
            )}
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[var(--tx)]/65">{livraison === "express" ? "Livraison express" : "Livraison standard"}</span>
              <span className="font-figures font-semibold">{livraison === "express" ? `+${fraisExpress.toLocaleString("fr-FR")} F` : "Incluse"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[var(--tx)]/10 pt-2">
              <span className="text-[14px] font-bold">Total</span>
              <span className="text-[16px] font-figures-bold">{total.toLocaleString("fr-FR")} F</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={envoi === "envoi"}
            className="mt-4 flex w-full items-center justify-center gap-2 py-3.5 text-[14px] font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 lg:mt-3 lg:py-3"
            style={{ background: boutonCommandeFond(editeur), borderRadius: "var(--rad)", textTransform: "var(--btn-uppercase)" as React.CSSProperties["textTransform"] }}
          >
            {envoi === "envoi" ? (
              "Envoi en cours…"
            ) : (
              <>
                <LuShoppingCart size={16} />
                {LABELS[editeur.paiement.boutonTexte]} · <span className="font-figures-bold">{total.toLocaleString("fr-FR")} F</span>
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-[var(--tx)]/45 lg:mt-1.5">
            {modePaiement === "en-ligne" ? `Paiement par ${methodePaiement} à l'étape suivante` : "Vous payez en espèces à réception du colis"}
          </p>

          {editeur.paiement.rangeeConfiance && (
            <div className="mt-4 flex items-center justify-around gap-1 border-t border-[var(--tx)]/8 pt-4 lg:mt-3 lg:pt-3">
              {[
                { icon: LuTruck, label: "Livraison rapide" },
                { icon: LuCreditCard, label: "Paiement sécurisé" },
                { icon: LuRotateCcw, label: "Retour facile" },
              ].map((it) => (
                <div key={it.label} className="flex flex-col items-center gap-1 px-1 text-center">
                  <it.icon color="var(--ac)" size={16} />
                  <span className="text-[10.5px] font-semibold leading-tight text-[var(--tx)]/60">{it.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
