import { Btn, Card, Divider, Nature, ProductSelector, QuickStat, SectionHeader, StatRow, Table, Tag } from "./shared";

/*
  Section "Stock" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function StockSection({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Stock"
        title="Ce que vous avez confié"
        subtitle="Chaque dépôt, du départ de chez vous jusqu'à la vente."
        count="Flèches pour changer de produit"
        first={first}
      />

      <div className="grid gap-3 lg:grid-cols-[1.9fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Fiche d&apos;un dépôt
            </p>
            <ProductSelector name="Sérum éclat 30 ml" position="Dépôt 1 sur 4" />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Nature code="S" />
              <div>
                <p className="text-xs font-semibold">Déposé le 22 août à 09 h 40</p>
                <p className="text-[10px] text-[#141220]/40">
                  Entrepôt Yopougon · dépôt DP-0341 · garantie souscrite
                </p>
              </div>
            </div>
            <Tag tone="ko">3 unités écartées</Tag>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            <QuickStat label="Quantité déposée" value="120" />
            <QuickStat label="Reçu conforme" value="117" tone="ok" />
            <QuickStat label="Endommagé à la réception" value="3" tone="ko" />
            <QuickStat label="Mis en distribution" value="117" />
            <QuickStat label="Vendu sur la période" value="34" />
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            <QuickStat label="Restant en entrepôt" value="83" />
            <QuickStat label="Réservé aux commandes" value="6" />
            <QuickStat label="Valeur immobilisée" value="514 600" />
            <QuickStat label="Couverture" value="22 j" />
            <QuickStat label="Frais de garantie" value="12 000" />
          </div>

          <Divider />
          <div className="flex items-center justify-between text-[10px] text-[#141220]/40">
            <span>Parcours du dépôt</span>
            <span>22 août → 23 août</span>
          </div>
          <div className="mt-2 flex gap-1">
            {[1, 1, 1, 1].map((_, i) => (
              <span key={i} className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
            <span>Demande envoyée</span>
            <span>Récupérée chez moi</span>
            <span>Contrôle de conformité</span>
            <span>Disponible à la vente</span>
          </div>

          <Divider />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-[10px] text-[#141220]/40">
              3 flacons cassés relevés au contrôle, photos jointes par le partenaire. Un litige reste
              ouvrable jusqu&apos;au 22 septembre.
            </p>
            <div className="flex gap-2">
              <span className="rounded-full border border-[#141220]/15 px-3.5 py-2 text-[10px] font-semibold">
                Voir le contrôle
              </span>
              <span className="rounded-full border border-brand-pink/40 px-3.5 py-2 text-[10px] font-semibold text-brand-pink">
                Ouvrir un litige
              </span>
            </div>
          </div>

          <Divider />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Mes quatre dépôts
            </p>
            <Tag tone="dark">240 unités · 1 209 100 F</Tag>
          </div>
          <Table
            className="mt-3"
            head={["Produit", "Déposé le", "Déposé", "Conforme", "Endommagé", "Vendu", "Restant", "Couverture"]}
            rows={[
              ["Sérum éclat 30 ml", "22 août", "120", "117", "3", "34", "83", "22 j"],
              ["Huile de ricin 100 ml", "28 août", "60", "—", "—", "58", "2", "1 j"],
              ["Beurre de karité 200 g", "12 août", "200", "200", "0", "73", "127", "34 j"],
              ["Coffret parfum", "2 août", "40", "40", "0", "40", "0", "Rupture"],
            ]}
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Produits que je revends sans stock · drop
            </p>
            <div className="flex gap-1.5">
              <Tag tone="blue">3 du partenaire</Tag>
              <Tag tone="pink">2 de LM</Tag>
            </div>
          </div>
          <Table
            className="mt-3"
            head={["Produit", "Source", "Prix drop", "Vendu", "Dispo à la source", "Couverture", "Marge", "Litiges"]}
            rows={[
              ["Montre connectée S8", "L", "6 200", "48", "340", "21 j", "31 %", "3"],
              ["Casque sans fil X2", "P", "4 800", "21", "96", "13 j", "34 %", "1"],
              ["Lotion tonique", "L", "3 800", "9", "210", "40 j", "38 %", "0"],
              ["Masque argile", "P", "3 400", "6", "18", "6 j", "29 %", "0"],
              ["Gel nettoyant", "P", "2 200", "4", "140", "35 j", "36 %", "0"],
            ]}
            sourceCol={1}
          />
        </Card>

        <div>
          <div className="overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
            <div className="bg-[linear-gradient(180deg,#3B1FA8,#141A56)] p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Évolution du stock</p>
              </div>
              <ProductSelector name="Sérum éclat 30 ml" position="Produit 1 sur 4" dark className="mt-2" />
              <div className="mt-3 flex h-12 items-end gap-1">
                {[80, 68, 62, 46, 38, 22].map((h, i) => (
                  <span key={i} className="flex-1 rounded-t bg-white/25" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] text-white/50">
                <span>— Restant</span>
                <span className="text-brand-pink">- - Sorties cumulées</span>
              </div>
            </div>
            <div className="bg-[linear-gradient(180deg,#D9DEF0,#FFFFFF)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Restant</p>
                  <p className="text-xl font-bold">83</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Valeur</p>
                  <p className="text-sm font-bold">514 600 F</p>
                </div>
              </div>
              <Divider />
              <StatRow label="Sortie moyenne" value="1,6 par jour" />
              <StatRow label="Rupture estimée" value="21 septembre" />
              <StatRow label="Rotation" value="0,4 fois par mois" />
            </div>
          </div>

          <Card title="Tous dépôts confondus" className="mt-3">
            <StatRow label="Unités en entrepôt" value="240" />
            <StatRow label="Déposé depuis le 1er août" value="420" />
            <StatRow label="Endommagé à la réception" value="3 · 0,7 %" />
            <StatRow label="Écarts non résolus" value="1" />
            <StatRow label="Couverture moyenne" value="19 jours" />
            <StatRow label="Stock dormant" value="28 unités · 60 j sans vente" />
            <StatRow label="Délai moyen de contrôle" value="1,2 jour" />
          </Card>

          <Card className="mt-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
                Envois récents
              </p>
              <Tag tone="pink">1 en cours</Tag>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold">Huile de ricin · 60</span>
              <span className="text-[#141220]/40">28 août</span>
            </div>
            <div className="mt-1.5 flex gap-1">
              <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
              <span className="h-1 flex-1 rounded-full bg-[linear-gradient(90deg,#6B21D6,#EC0C8C)]" />
              <span className="h-1 flex-1 rounded-full bg-[#141220]/10" />
              <span className="h-1 flex-1 rounded-full bg-[#141220]/10" />
            </div>
            <p className="mt-1.5 text-[10px] text-[#141220]/40">Au contrôle · résultat attendu aujourd&apos;hui</p>
            <Divider />
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#141220]/50">Sérum éclat · 120</span>
              <Tag tone="warn">3 écartés</Tag>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#141220]/50">Beurre de karité · 200</span>
              <Tag tone="ok">Conforme</Tag>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#141220]/50">Coffret parfum · 40</span>
              <Tag tone="ok">Conforme</Tag>
            </div>
            <Btn variant="outline" className="mt-4">
              Déposer un nouveau stock
            </Btn>
          </Card>
        </div>
      </div>
    </>
  );
}
