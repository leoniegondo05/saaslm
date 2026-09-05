"use client";

import Image from "next/image";
import { useState } from "react";
import { Btn, Card, Divider, Nature, ProductSelector, SectionHeader, StatRow, Tag } from "./shared";

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

type Nature4 = "S" | "P" | "L";
type Etat = { label: string; tone: "ok" | "warn" | "ko" };

type Produit = {
  nom: string;
  nature: Nature4;
  achat: number | null; // F — null si aucun coût de revient déclaré
  vente: number; // F
  stock: number;
  vendu: number;
  margePct: number; // %
  avis: number | null; // / 5 — null si jamais vendu
  etat: Etat;
  fraisPreleves?: number; // F par vente, pour la fiche détaillée
  couverture?: string;
  litiges?: number;
  tendance: number[]; // ventes / semaine, 6 dernières semaines — pour le mini diagramme
  images?: string[]; // URLs — absent/vide si le produit n'a pas encore de visuel
};

const PRODUITS: Produit[] = [
  { nom: "Montre connectée S8", nature: "L", achat: 6200, vente: 14000, stock: 340, vendu: 48, margePct: 31, avis: 4.5, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 1660, couverture: "21 jours", litiges: 3, tendance: [5, 7, 6, 9, 10, 11] },
  { nom: "Sérum éclat 30 ml", nature: "S", achat: 4300, vente: 12000, stock: 83, vendu: 37, margePct: 46, avis: 4.7, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 2180, couverture: "22 jours", litiges: 0, tendance: [4, 6, 5, 8, 9, 5] },
  { nom: "Casque sans fil X2", nature: "P", achat: 4800, vente: 11000, stock: 96, vendu: 21, margePct: 34, avis: 3.4, etat: { label: "Avis négatifs", tone: "warn" }, fraisPreleves: 1420, couverture: "13 jours", litiges: 1, tendance: [6, 5, 4, 3, 2, 1] },
  { nom: "Huile de ricin 100 ml", nature: "S", achat: 2600, vente: 7500, stock: 2, vendu: 58, margePct: 44, avis: 4.8, etat: { label: "Rupture · 1 j", tone: "ko" }, fraisPreleves: 1580, couverture: "1 jour", litiges: 0, tendance: [7, 9, 11, 13, 12, 14] },
  { nom: "Beurre de karité 200 g", nature: "S", achat: 4100, vente: 9000, stock: 127, vendu: 73, margePct: 42, avis: 4.6, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 1120, couverture: "34 jours", litiges: 0, tendance: [8, 8, 9, 10, 9, 10] },
  { nom: "Bracelet cuir", nature: "S", achat: 3800, vente: 6000, stock: 28, vendu: 2, margePct: 29, avis: 4.2, etat: { label: "Rotation lente", tone: "warn" }, fraisPreleves: 460, couverture: "60+ jours", litiges: 0, tendance: [2, 1, 1, 0, 1, 0] },
  { nom: "Lotion tonique", nature: "L", achat: 3800, vente: 8900, stock: 210, vendu: 9, margePct: 38, avis: 4.4, etat: { label: "Actif", tone: "ok" }, fraisPreleves: 1440, couverture: "40 jours", litiges: 0, tendance: [3, 2, 3, 2, 4, 3] },
  { nom: "Gel nettoyant", nature: "P", achat: 2200, vente: 6000, stock: 140, vendu: 4, margePct: 36, avis: null, etat: { label: "Jamais vendu", tone: "warn" }, fraisPreleves: 940, couverture: "35 jours", litiges: 0, tendance: [0, 0, 1, 0, 0, 1] },
];

function MiniTrend({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-5 items-end gap-[3px]">
      {data.map((v, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full ${i === data.length - 1 ? "bg-brand-pink" : "bg-[#141220]/15"}`}
          style={{ height: `${Math.max((v / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

const F = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export default function ProduitsCatalogue({ first = true }: { first?: boolean }) {
  const [selected, setSelectedRaw] = useState(0);
  const [photo, setPhoto] = useState(0);
  const produit = PRODUITS[selected];
  const photos = produit.images ?? [];

  // Changer de produit repart toujours sur sa première photo.
  const setSelected = (updater: number | ((i: number) => number)) => {
    setSelectedRaw(updater);
    setPhoto(0);
  };

  const publies = PRODUITS.length;
  const enStockage = PRODUITS.filter((p) => p.nature === "S").length;
  const enDrop = PRODUITS.filter((p) => p.nature === "P" || p.nature === "L").length;
  const dropPartenaire = PRODUITS.filter((p) => p.nature === "P").length;
  const dropLm = PRODUITS.filter((p) => p.nature === "L").length;
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
        layout="inline"
      />

      {/* Un seul cadre, séparé par des traits (divide-x/y) — pas cinq cartes
          côte à côte : chaque étiquette reste en onglet (même trait que
          Card titleTab) mais posée sur le même fond continu. */}
      <div className="grid grid-cols-2 divide-x divide-y divide-[#141220]/10 overflow-hidden rounded-2xl bg-white shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        <StatCell label="Produits publiés" value={publies} />
        <StatCell label="En stockage" value={enStockage} note={`${stockTotal} unités`} />
        <StatCell label="En drop" value={enDrop} note={`${dropPartenaire} partenaire · ${dropLm} LM`} />
        <StatCell label="Jamais vendus" value={jamaisVendus} />
        <StatCell label="Marge moyenne" value={`${margeMoyenne} %`} />
      </div>

      <div className="mt-3 mb-8 grid gap-3 lg:grid-cols-[1.75fr_1fr]">
        <Card className="!bg-[#FFFFFF70]">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex gap-2">
              <button type="button" className="rounded-full border border-[#141220]/15 bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white">
                Ajouter une catégorie
              </button> 
              <button type="button" className="rounded-full bg-[#141220] px-3.5 py-2 text-xs font-semibold text-white">
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
                  {["Produit", "Source", "Achat", "Vente", "Stock", "Vendu", "Marge", "Avis", "État", "Tendance"].map((h) => (
                    <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#141220]/35">
                      {h === "Produit" ? (
                        <span className="inline-block rounded-full bg-[#141220] px-3 py-2 text-white">{h}</span>
                      ) : (
                        h
                      )}
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
                    <td className="py-2 pr-3">
                      <MiniTrend data={p.tendance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Fiche du produit" titleTab className="!bg-[#FFFFFF70]">
          <ProductSelector
            name={produit.nom}
            position={`Produit ${selected + 1} sur ${PRODUITS.length}`}
            className="mt-3 w-full"
            onPrev={() => setSelected((i) => (i - 1 + PRODUITS.length) % PRODUITS.length)}
            onNext={() => setSelected((i) => (i + 1) % PRODUITS.length)}
          />

          <button
            type="button"
            onClick={() => photos.length > 1 && setPhoto((i) => (i + 1) % photos.length)}
            title={photos.length > 1 ? "Voir la photo suivante" : undefined}
            className="relative mt-3 flex h-[110px] w-full items-center justify-center overflow-hidden rounded-2xl bg-white"
          >
            {photos.length > 0 ? (
              <Image
                src={photos[photo]}
                alt={produit.nom}
                fill
                sizes="220px"
                className="object-cover"
              />
            ) : (
              <span className="h-16 w-16 rounded-2xl border border-[#141220]/10 bg-white/70" />
            )}

            {/* Blanc en haut, gris en bas : assombrit le coin bas-droit où
                vivent les dots (sans lui, un point blanc y était invisible,
                cf. [[dashboard-mock-data-pending-laravel-api]] pour l'absence
                de vraie photo tant que l'API ne les fournit pas). */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#c4c4c4_100%)]" />

            {/* 3 dots par défaut (pas 1) tant qu'il n'y a pas de vraies
                photos : signale que c'est un carousel à trois emplacements,
                prêt à les recevoir, cf. [[dashboard-mock-data-pending-laravel-api]]. */}
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
              {(photos.length > 0 ? photos : [null, null, null]).map((_, i) => (
                <span
                  key={i}
                  className={i === photo ? "h-1.5 w-4 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/40"}
                />
              ))}
            </div>
          </button>

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
            <Btn variant="dark">Réapprovisionner</Btn>
          </div>
          <Btn variant="dark" className="mt-2 mb-2">Retirer de la boutique</Btn>
        </Card>
      </div>
    </>
  );
}

function StatCell({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="px-4 pb-4 pt-4">
      <div className="relative -mt-4 flex justify-center">
        <p
          className="rounded-b-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8095]"
          style={{ background: "#F0EDF0" }}
        >
          {label}
        </p>
      </div>
      <p className="mt-2 text-center text-xl font-bold tracking-tight">{value}</p>
      {note && <p className="mt-0.5 text-center text-[9px] text-[#141220]/35">{note}</p>}
    </div>
  );
}
