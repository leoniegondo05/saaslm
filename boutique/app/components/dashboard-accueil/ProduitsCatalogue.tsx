"use client";

import { useState } from "react";
import { Btn, Card, Divider, MiniTile, Nature, ProductSelector, SectionHeader, StatRow, Tag } from "./shared";

/*
  Page "Produits" (Écran 03 des maquettes) : tous les produits de la
  boutique, toutes natures confondues, dans un seul tableau, avec la fiche
  du produit sélectionné à droite. Distincte de ProduitsSection.tsx (qui
  reste la section-résumé de l'onglet Accueil) — ici c'est l'écran complet
  atteint depuis l'icône "Produits" du rail (voir DashboardSidebar).

  Chiffres statiques pour l'instant, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]] — à brancher sur l'API Laravel
  quand elle expose le catalogue produits.
*/

type Nature4 = "S" | "P" | "L" | "O";
type Etat = { label: string; tone: "ok" | "warn" | "ko" };

type Produit = {
  nom: string;
  nature: Nature4;
  achat: number | null; // F — null pour un produit propre sans coût de revient déclaré
  vente: number; // F
  stock: number;
  vendu: number;
  margePct: number; // %
  avis: number | null; // / 5 — null si jamais vendu
  etat: Etat;
  fraisPreleves?: number; // F par vente, pour la fiche détaillée
  couverture?: string;
  litiges?: number;
};

const PRODUITS: Produit[] = [
  { nom: "Montre connectée S8", nature: "L", achat: 6200, vente: 14000, stock: 340, vendu: 48, margePct: 31, avis: 4.5, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 1660, couverture: "21 jours", litiges: 3 },
  { nom: "Sérum éclat 30 ml", nature: "S", achat: 4300, vente: 12000, stock: 83, vendu: 37, margePct: 46, avis: 4.7, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 2180, couverture: "22 jours", litiges: 0 },
  { nom: "Casque sans fil X2", nature: "P", achat: 4800, vente: 11000, stock: 96, vendu: 21, margePct: 34, avis: 3.4, etat: { label: "Avis négatifs", tone: "warn" }, fraisPreleves: 1420, couverture: "13 jours", litiges: 1 },
  { nom: "Huile de ricin 100 ml", nature: "S", achat: 2600, vente: 7500, stock: 2, vendu: 58, margePct: 44, avis: 4.8, etat: { label: "Rupture · 1 j", tone: "ko" }, fraisPreleves: 1580, couverture: "1 jour", litiges: 0 },
  { nom: "Beurre de karité 200 g", nature: "S", achat: 4100, vente: 9000, stock: 127, vendu: 73, margePct: 42, avis: 4.6, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 1120, couverture: "34 jours", litiges: 0 },
  { nom: "Coffret parfum", nature: "O", achat: null, vente: 9000, stock: 0, vendu: 40, margePct: 71, avis: 4.9, etat: { label: "En rupture", tone: "ko" }, couverture: "rupture", litiges: 0 },
  { nom: "Bracelet cuir", nature: "S", achat: 3800, vente: 6000, stock: 28, vendu: 2, margePct: 29, avis: 4.2, etat: { label: "Rotation lente", tone: "warn" }, fraisPreleves: 460, couverture: "60+ jours", litiges: 0 },
  { nom: "Lotion tonique", nature: "L", achat: 3800, vente: 8900, stock: 210, vendu: 9, margePct: 38, avis: 4.4, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 1440, couverture: "40 jours", litiges: 0 },
  { nom: "Gel nettoyant", nature: "P", achat: 2200, vente: 6000, stock: 140, vendu: 4, margePct: 36, avis: null, etat: { label: "Jamais vendu", tone: "warn" }, fraisPreleves: 940, couverture: "35 jours", litiges: 0 },
];

const F = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export default function ProduitsCatalogue({ first = true }: { first?: boolean }) {
  const [selected, setSelected] = useState(0);
  const produit = PRODUITS[selected];

  const publies = PRODUITS.length;
  const enStockage = PRODUITS.filter((p) => p.nature === "S").length;
  const enDrop = PRODUITS.filter((p) => p.nature === "P" || p.nature === "L").length;
  const dropPartenaire = PRODUITS.filter((p) => p.nature === "P").length;
  const dropLm = PRODUITS.filter((p) => p.nature === "L").length;
  const propres = PRODUITS.filter((p) => p.nature === "O").length;
  const jamaisVendus = PRODUITS.filter((p) => p.avis === null).length;
  const margeMoyenne = Math.round(PRODUITS.reduce((sum, p) => sum + p.margePct, 0) / PRODUITS.length);
  const stockTotal = PRODUITS.filter((p) => p.nature === "S").reduce((sum, p) => sum + p.stock, 0);

  const benefice = produit.achat !== null
    ? produit.vente - produit.achat - (produit.fraisPreleves ?? 0)
    : Math.round((produit.vente * produit.margePct) / 100);

  return (
    <>
      <SectionHeader
        eyebrow="Produits"
        title="Tous vos produits"
        subtitle="Toutes natures confondues, dans un seul tableau."
        count={`${PRODUITS.length} produits`}
        first={first}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <MiniTile label="Produits publiés" value={String(publies)} />
        <MiniTile label="En stockage" value={String(enStockage)} note={`${stockTotal} unités`} />
        <MiniTile label="En drop" value={String(enDrop)} note={`${dropPartenaire} partenaire · ${dropLm} LM`} />
        <MiniTile label="Produits propres" value={String(propres)} />
        <MiniTile label="Jamais vendus" value={String(jamaisVendus)} />
        <MiniTile label="Marge moyenne" value={`${margeMoyenne} %`} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.75fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Tag tone="neutral">Tous</Tag>
              <Tag tone="neutral">Propres</Tag>
              <Tag tone="neutral">Stockage</Tag>
              <Tag tone="neutral">Drop</Tag>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-full border border-[#141220]/15 bg-white/60 px-3.5 py-2 text-xs font-semibold">
                Déposer un stock
              </button>
              <button type="button" className="rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-[0_2px_10px_rgba(20,18,32,0.08)]">
                Ajouter un produit
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#141220]/10">
                  {["Produit", "Nature", "Achat", "Vente", "Stock", "Vendu", "Marge", "Avis", "État"].map((h) => (
                    <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#141220]/35">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUITS.map((p, i) => (
                  <tr
                    key={p.nom}
                    onClick={() => setSelected(i)}
                    className={`cursor-pointer border-b border-[#141220]/[0.05] last:border-0 hover:bg-[#141220]/[0.03] ${
                      i === selected ? "bg-brand-pink/5" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{p.nom}</td>
                    <td className="py-2 pr-3"><Nature code={p.nature} /></td>
                    <td className="py-2 pr-3">{p.achat !== null ? F(p.achat) : "—"}</td>
                    <td className="py-2 pr-3">{F(p.vente)}</td>
                    <td className="py-2 pr-3">{p.stock}</td>
                    <td className="py-2 pr-3">{p.vendu}</td>
                    <td className="py-2 pr-3">{p.margePct} %</td>
                    <td className="py-2 pr-3">{p.avis !== null ? p.avis.toLocaleString("fr-FR") : "—"}</td>
                    <td className="py-2 pr-3">
                      <Tag tone={p.etat.tone}>{p.etat.label}</Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Fiche du produit</p>
          <ProductSelector
            name={produit.nom}
            position={`Produit ${selected + 1} sur ${PRODUITS.length}`}
            className="mt-2"
            onPrev={() => setSelected((i) => (i - 1 + PRODUITS.length) % PRODUITS.length)}
            onNext={() => setSelected((i) => (i + 1) % PRODUITS.length)}
          />

          <div className="mt-3 flex h-[110px] items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(236,12,140,0.14),transparent_70%)]">
            <span className="h-16 w-16 rounded-2xl border border-[#141220]/10 bg-white/70" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Nature code={produit.nature} />
              <span className="text-xs font-semibold">{produit.nom}</span>
            </span>
            <Tag tone={produit.etat.tone}>{produit.etat.label}</Tag>
          </div>

          <Divider />
          <StatRow label="Prix de vente" value={F(produit.vente)} />
          {produit.achat !== null && <StatRow label="Coût de revient" value={F(produit.achat)} />}
          {produit.fraisPreleves !== undefined && <StatRow label="Frais prélevés" value={F(produit.fraisPreleves)} />}
          <StatRow label="Bénéfice par vente" value={<span className="text-brand-pink">{F(benefice)}</span>} />
          <Divider />
          <StatRow label="Stock restant" value={`${produit.stock} · ${produit.couverture ?? "—"}`} />
          <StatRow label="Vendu sur la période" value={String(produit.vendu)} />
          <StatRow label="Note moyenne" value={produit.avis !== null ? `${produit.avis.toLocaleString("fr-FR")} / 5` : "—"} />
          <StatRow label="Litiges" value={String(produit.litiges ?? 0)} />

          <div className="mt-3.5 flex gap-2">
            <Btn variant="white">Modifier</Btn>
            <Btn variant="outline">Réapprovisionner</Btn>
          </div>
          <Btn variant="outline" className="mt-2">Retirer de la boutique</Btn>
        </Card>
      </div>
    </>
  );
}
