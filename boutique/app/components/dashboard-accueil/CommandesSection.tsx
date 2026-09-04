import { Bar, Card, CommuneRow, Divider, FailRow, LegendRow, SectionHeader, StatRow } from "./shared";

// 24 barres pour la bande "heures de commande" — pic 20h-22h, gabarit repris
// des hauteurs de la maquette (0 → 1).
const HOURLY_ORDERS = [
  0.06, 0.05, 0.05, 0.05, 0.06, 0.09, 0.14, 0.2, 0.26, 0.3, 0.34, 0.4, 0.44, 0.38, 0.34, 0.36, 0.42, 0.5, 0.5, 0.7, 1, 1,
  0.6, 0.2,
];

/*
  Section "Commandes" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function CommandesSection({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Commandes"
        title="Ce que devient chaque commande"
        subtitle="De la prise de commande jusqu'à la livraison."
        count="24 indicateurs"
        first={first}
        layout="inline"
      />

      <div className="grid gap-3 lg:grid-cols-4">
        <Card title="Commandes de la période" titleTab className="!bg-white">
          <div className="mt-3 flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[6px] border-white">
              <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-brand-pink border-r-brand-pink" style={{ transform: "rotate(45deg)" }} />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#141220] text-center">
                <div>
                  <p className="text-lg font-bold leading-none text-white">73</p>
                  <p className="text-[8px] text-white/40">au total</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <LegendRow color="#22C55E" label="Livrées" value="45" />
              <LegendRow color="#EC0C8C" label="En cours" value="16" />
              <LegendRow color="#D9D9E0" label="Non livrées" value="12" />
            </div>
          </div>
          <Divider />
          <StatRow label="Taux de livraison" value="79 %" />
          <StatRow label="Dont produits en stockage" value="31" bold={false} />
          <StatRow label="Dont produits en drop" value="42" bold={false} />
          <StatRow label="Articles par commande" value="1,4" bold={false} />
        </Card>

        <Card title="Où en sont les commandes en cours" titleTab className="!bg-white">
          <StatRow label="En coordination" value="4" bold={false} />
          <StatRow label="Affectées à un livreur" value="7" bold={false} />
          <StatRow label="En cours de livraison" value="3" bold={false} />
          <StatRow label="En relance" value="2" bold={false} />
          <Divider />
          <p className="inline-block rounded bg-[#F4F4F6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Les quatre délais</p>
          <StatRow label="Commande → confirmation" value="1 h 40" bold={false} />
          <StatRow label="Confirmation → livreur" value="4 h 10" bold={false} />
          <StatRow label="Livreur → livraison" value="20 h" bold={false} />
          <StatRow label="Total moyen" value="26 h" />
        </Card>

        <Card title="Pourquoi elles n'aboutissent pas" titleTab className="!bg-white">
          <FailRow label="Client injoignable" value={6} pct={100} />
          <FailRow label="Adresse introuvable" value={3} pct={50} />
          <FailRow label="Refus à la livraison" value={2} pct={33} />
          <FailRow label="Produit non conforme" value={1} pct={17} />
          <Divider />
          <StatRow label="Relances demandées" value="9" />
          <StatRow label="Relances abouties" value="6 · 67 %" />
          <StatRow label="Taux d'annulation" value="4 %" />
        </Card>

        <Card title="Quand vos clients règlent" titleTab className="!bg-white">
          <StatRow label="Depuis la page de commande" value="62 %" />
          <Bar pct={62} />
          <div className="mt-2" />
          <StatRow label="Via le lien de commande" value="38 %" />
          <Bar pct={38} color="bg-[#EC0C8C]" />
          <Divider />
          <StatRow label="Livraisons normales" value="62 · 77 % réussies" />
          <StatRow label="Livraisons express" value="11 · 91 % réussies" />
          <StatRow label="Délai moyen express" value="7 h" />
          <StatRow label="Supplément express encaissé" value="22 000 F" />
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.7fr_1fr]">
        <Card
          title="Heures auxquelles vos clients commandent"
          titleTab
          titleAlign="left"
          className="!bg-[#F4F4F6]"
          badge={<p className="text-[10px] text-[#141220]/40">Pic entre 20 h et 22 h · 38 % des commandes</p>}
        >
          <div
            className="mt-3 grid gap-[3px]"
            style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
          >
            {HOURLY_ORDERS.map((v, i) => (
              <span
                key={i}
                className="h-4 rounded-sm"
                style={{ background: v > 0.75 ? "#EC0C8C" : `rgba(236,12,140,${Math.max(0.06, v * 0.55)})` }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[#141220]/40">
            <span>00 h</span>
            <span>06 h</span>
            <span>12 h</span>
            <span>18 h</span>
            <span>23 h</span>
          </div>
          <Divider />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Jours de la semaine</p>
          <div className="mt-2 grid grid-cols-7 gap-2 text-center">
            {[
              ["Lun", 8],
              ["Mar", 9],
              ["Mer", 11],
              ["Jeu", 10],
              ["Ven", 16],
              ["Sam", 14],
              ["Dim", 5],
            ].map(([d, v]) => (
              <div key={d}>
                <p className="text-[9px] text-[#141220]/40">{d}</p>
                <p className={`text-xs font-semibold ${Number(v) >= 14 ? "text-brand-pink" : ""}`}>{v}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Communes livrées" titleTab className="!bg-white">
          <CommuneRow label="Yopougon" pct={41} value="30" barColor="bg-[#000000]" />
          <CommuneRow label="Cocody" pct={27} value="20" />
          <CommuneRow label="Abobo" pct={18} value="13" />
          <CommuneRow label="Marcory" pct={9} value="7" />
          <CommuneRow label="Bingerville" pct={5} value="3" />
          <Divider />
          <StatRow label="Commune la plus rentable" value="Cocody · marge 54 %" />
          <StatRow label="Commune la plus difficile" value="Abobo · 31 % d'échecs" />
        </Card>
      </div>
    </>
  );
}
