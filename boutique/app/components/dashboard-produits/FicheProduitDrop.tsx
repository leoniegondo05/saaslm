"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, ProduitCarousel, Tag } from "../dashboard-accueil/shared";
import type { DropProduit } from "./dropCatalogue";

/*
  Écran 06 "La fiche d'un produit drop" : les quatre prix (le vôtre, moyen,
  bas, haut du réseau), la description, et un simulateur qui recalcule ce
  qu'il vous reste selon le prix de vente que vous fixez. Reçoit le produit
  déjà résolu (voir app/dashboard/produits/catalogue/[slug]/page.tsx) plutôt
  que de refaire la recherche ici.
*/

const F = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} F`;

// Barème logistique du partenaire (voir Écran 04) : mêmes 1 500 F de frais
// fixes ; la commission suit le taux du réseau (~4 % du prix de vente fixé).
const FRAIS_LOGISTIQUES = 1500;
const TAUX_COMMISSION = 0.04;

export default function FicheProduitDrop({ produit }: { produit: DropProduit }) {
  const [monPrix, setMonPrix] = useState(produit.prixVenteActuel ?? produit.prixConseille ?? produit.prixDrop ?? 0);
  const commission = Math.round(monPrix * TAUX_COMMISSION);
  const ilReste = monPrix - (produit.prixDrop ?? 0) - FRAIS_LOGISTIQUES - commission;

  const scalePct =
    produit.prixBasReseau && produit.prixHautReseau
      ? Math.min(100, Math.max(0, ((monPrix - produit.prixBasReseau) / (produit.prixHautReseau - produit.prixBasReseau)) * 100))
      : 50;

  return (
    <>
      <Link
        href="/dashboard/produits?tab=catalogue"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)]/60 px-3.5 py-2 text-xs font-semibold"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {produit.categorie}
      </Link>

      <div className="relative mt-4 flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl bg-[var(--dashboard-card-bg)] p-6 text-white">
        <ProduitCarousel images={produit.images ?? []} />
        {/* Dégradé produit : fondu vers le noir pour la lisibilité du texte.
            Vide tant que le produit n'a pas de photos, cf.
            [[dashboard-mock-data-pending-laravel-api]]. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(217,217,217,0)_40%,#000000_92%)]" />
        {/* Barre de progression (vidéo en lecture en arrière-plan) : blanche,
            avec un segment rose figurant la portion déjà lue. */}
        <div className="pointer-events-none absolute inset-x-4 bottom-0 h-[3px] overflow-hidden rounded-full bg-white/90">
          <span className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-brand-pink" />
        </div>
        <div className="relative">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            <Tag tone="pink">{produit.source === "L" ? "Drop LM" : "Partenaire"}</Tag>
            {produit.unitesDisponibles !== undefined && (
              <Tag tone="neutral">Disponible · {produit.unitesDisponibles} unités</Tag>
            )}
            <Tag tone="neutral">Réf. {produit.slug.slice(0, 8).toUpperCase()}</Tag>
          </div>
          <p className="text-3xl font-semibold tracking-tight">{produit.nom}</p>
          <p className="mt-1 text-xs text-white/60">
            {[produit.categorie, produit.conditionnement, produit.contenance].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-3 lg:grid-cols-[1.1fr_1.25fr_0.95fr] [&>*]:min-w-0">
        <Card title="Les quatre prix" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--dashboard-text)]/40">Vous payez ce produit</p>
            <Tag tone="dark">Sur ce partenaire</Tag>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="-ml-4 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-2xl font-bold tracking-tight text-white">
              {F(produit.prixDrop ?? 0)}
            </p>
            <Tag tone="neutral">Prix drop</Tag>
          </div>
          <div className="my-3 h-px bg-[var(--dashboard-text)]/10" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--dashboard-text)]/50">Prix moyen de revente</span>
            <span className="font-semibold">{produit.prixMoyenReseau ? F(produit.prixMoyenReseau) : "—"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[var(--dashboard-text)]/50">Le plus bas pratiqué</span>
            <span className="font-semibold">{produit.prixBasReseau ? F(produit.prixBasReseau) : "—"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[var(--dashboard-text)]/50">Le plus haut pratiqué</span>
            <span className="font-semibold">{produit.prixHautReseau ? F(produit.prixHautReseau) : "—"}</span>
          </div>
          {produit.prixBasReseau && produit.prixHautReseau && (
            <>
              <div className="relative mt-3 h-1 rounded-full bg-[linear-gradient(90deg,#C9CFDD,#EC0C8C)]">
                <span
                  className="absolute -top-1.5 h-4 w-0.5 rounded-full bg-[#141220] shadow-[0_0_0_2px_#fff]"
                  style={{ left: `${scalePct}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] text-[var(--dashboard-text)]/40">
                <span>{F(produit.prixBasReseau)}</span>
                <span className="font-semibold text-[var(--dashboard-text)]">Vous : {F(monPrix)}</span>
                <span>{F(produit.prixHautReseau)}</span>
              </div>
            </>
          )}
        </Card>

        <Card title="Description" titleTab className="!bg-[var(--dashboard-card-bg)]">
          <p className="mt-2.5 text-xs text-[var(--dashboard-text)]/70">{produit.description ?? "—"}</p>
          <div className="my-3 h-px bg-[var(--dashboard-text)]/10" />
          {produit.conditionnement && <Row label="Conditionnement" value={produit.conditionnement} />}
          {produit.contenance && <Row label="Contenance" value={produit.contenance} />}
          {produit.poidsEmballe && <Row label="Poids emballé" value={produit.poidsEmballe} />}
          {produit.venduParBoutiques !== undefined && <Row label="Vendu par" value={`${produit.venduParBoutiques} boutiques du réseau`} />}
          {produit.ventesReseau30j !== undefined && <Row label="Ventes du réseau · 30 j" value={String(produit.ventesReseau30j)} />}
          {produit.vosVentes30j !== undefined && <Row label="Vos ventes · 30 j" value={String(produit.vosVentes30j)} />}
          {produit.tauxLitigePct !== undefined && <Row label="Taux de litige" value={`${produit.tauxLitigePct} %`} />}
        </Card>

        <div>
          <div className="rounded-2xl bg-[linear-gradient(155deg,#3B1FA8_0%,#1B1E72_46%,#0A0E28_100%)] p-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Fixer mon prix</p>
            <div className="mt-2.5 rounded-2xl border border-white/25 bg-white/10 px-3.5 py-2.5">
              <p className="text-[10px] text-white/60">Mon prix de vente</p>
              <input
                type="number"
                value={monPrix}
                onChange={(e) => setMonPrix(Number(e.target.value) || 0)}
                className="w-full bg-transparent text-lg font-bold tabular-nums outline-none"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/55">
              <span>− Prix du produit</span>
              <span className="text-white/80">{F(produit.prixDrop ?? 0)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-white/55">
              <span>− Frais logistiques</span>
              <span className="text-white/80">{F(FRAIS_LOGISTIQUES)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-white/55">
              <span>− Commission et paiement</span>
              <span className="text-white/80">{F(commission)}</span>
            </div>
            <div className="my-3 h-px bg-white/15" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Il vous reste</span>
              <span className={`text-lg font-bold ${ilReste < 0 ? "text-red-300" : "text-brand-pink"}`}>{F(ilReste)}</span>
            </div>
          </div>
          <button type="button" className="mt-3 w-full rounded-full bg-[var(--dashboard-card-bg)] px-4 py-2.5 text-center text-xs font-semibold shadow-[0_2px_10px_rgba(20,18,32,0.08)]">
            Choisir le produit
          </button>
          <button type="button" className="mt-2 w-full rounded-full bg-[#141220] px-4 py-2.5 text-center text-xs font-semibold text-white dark:bg-brand-pink">
            Mettre de côté
          </button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center justify-between text-xs">
      <span className="text-[var(--dashboard-text)]/50">{label}</span>
      <span>{value}</span>
    </div>
  );
}
