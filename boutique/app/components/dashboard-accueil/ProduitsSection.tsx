import { Card, Divider, NatureRow, Nature, ProductSelector, SectionHeader, StatRow, TopProductRow } from "./shared";

/*
  Section "Produits" (natures) de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function ProduitsSection({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Produits"
        title="Vos quatre façons de vendre"
        subtitle="Ce que chaque nature de produit vous rapporte."
        count="20 indicateurs"
        first={first}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Top 5 des produits
            </p>
            <p className="text-[10px] text-[#141220]/40">sur la période</p>
          </div>
          <TopProductRow code="L" name="Montre connectée S8" value="48 · 672 000" pct={100} />
          <TopProductRow code="S" name="Sérum éclat 30 ml" value="37 · 444 000" pct={77} />
          <TopProductRow code="P" name="Casque sans fil X2" value="21 · 231 000" pct={44} />
          <TopProductRow code="S" name="Huile de ricin" value="14 · 105 000" pct={29} />
          <TopProductRow code="O" name="Coffret parfum" value="9 · 81 000" pct={19} />
          <Divider />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
            Les moins rentables
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Nature code="S" />
              Bracelet cuir
            </span>
            <span className="text-[#141220]/50">2 ventes · 29 %</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Nature code="P" />
              Gel nettoyant
            </span>
            <span className="text-[#141220]/50">4 ventes · 36 %</span>
          </div>
          <Divider />
          <p className="text-[10px] text-[#141220]/40">
            S · stocké chez le partenaire &nbsp; P · drop du partenaire &nbsp; L · drop LM &nbsp; O · produit propre
          </p>
        </Card>

        <Card title="Vos quatre natures de produits">
          <div className="mt-2 flex h-2 overflow-hidden rounded-full">
            <span className="h-full" style={{ width: "36%", background: "#141220" }} />
            <span className="h-full bg-[#141220]/30" style={{ width: "17%" }} />
            <span className="h-full bg-[#2F6BE0]" style={{ width: "29%" }} />
            <span className="h-full bg-brand-pink" style={{ width: "18%" }} />
          </div>
          <NatureRow code="S" name="Stockage Management" value="4 · 284 500" note="Marge 46 % · 240 unités immobilisées · 22 j de couverture" />
          <NatureRow code="O" name="Produits propres" value="8 · 112 000" note="Marge 71 % · vous livrez vous-même · aucun frais partenaire" />
          <NatureRow code="P" name="Drop du partenaire" value="7 · 301 000" note="Marge 34 % · aucun stock avancé · 1 litige" />
          <NatureRow code="L" name="Drop LM" value="5 · 145 000" note="Marge 31 % · catalogue de la plateforme · 3 litiges" last />
          <Divider />
          <StatRow label="Nature la plus rentable" value="Produits propres" />
          <StatRow label="Nature qui vend le plus" value="Drop du partenaire" />
        </Card>

        <div>
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                Ma position sur les prix drop
              </p>
            </div>
            <ProductSelector name="Montre connectée S8" position="Produit 1 sur 12" className="mt-2" />
            <p className="mt-2 text-xs">
              Vous payez <b>6 200 F</b> · vous revendez <b>14 000 F</b>
            </p>
            <div className="relative mt-3 h-1 rounded-full bg-[linear-gradient(90deg,#C9CFDD,#EC0C8C)]">
              <span
                className="absolute -top-1.5 h-4 w-0.5 rounded-full bg-[#141220] shadow-[0_0_0_2px_#fff]"
                style={{ left: "38%" }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
              <span>Bas 5 400</span>
              <span>Moyen 7 100</span>
              <span>Haut 8 900</span>
            </div>
            <Divider />
            <StatRow label="Marge nette" value="31 %" />
            <StatRow label="Vendu par" value="42 boutiques" />
            <StatRow label="Prix moyen du réseau" value="13 400 F" />
            <StatRow label="Votre écart au marché" value="+ 4 %" />
          </Card>

          <Card title="Catalogue accessible" className="mt-3">
            <StatRow label="Produits du partenaire" value="117" />
            <StatRow label="Produits LM" value="64" />
            <StatRow label="Nouveautés ce mois" value="12" />
            <StatRow label="Produits à venir" value="6" />
            <StatRow label="Jamais vendus chez vous" value="3" />
            <StatRow label="Mis de côté" value="5" />
          </Card>
        </div>
      </div>
    </>
  );
}
