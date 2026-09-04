import { Card, ClientRow, Divider, RatingRow, SectionHeader, StatRow, Tag } from "./shared";

/*
  Section "Clients" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function ClientsSection({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Clients"
        title="Qui achète, et qui revient"
        subtitle="Ce que valent vos clients et ce qu'ils pensent."
        count="14 indicateurs"
        first={first}
        layout="inline"
      />

      <div className="grid gap-3 lg:grid-cols-4">
        <Card title="Qui achète chez vous" titleTab className="!bg-white">
          <StatRow label="Clients servis" value="73" />
          <StatRow label="Nouveaux clients" value="58 · 79 %" />
          <StatRow label="Clients revenus" value="15 · 21 %" />
          <StatRow label="Deuxième achat en" value="17 jours" />
          <StatRow label="Meilleur client" value="68 000 F" />
          <Divider />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#141220]/50">Clients à risque</p>
            <Tag tone="warn">4</Tag>
          </div>
          <p className="mt-1.5 text-[10px] text-[#141220]/40">
            Deux échecs de livraison ou plus. À rappeler avant d&apos;expédier.
          </p>
        </Card>

        <Card title="Vos cinq meilleurs clients" titleTab className="!bg-white">
          <ClientRow name="Traoré M." zone="Cocody" value="68 000 F" orders={5} pct={100} />
          <ClientRow name="Konan A." zone="Yopougon" value="51 000 F" orders={4} pct={75} />
          <ClientRow name="Aya D." zone="Marcory" value="38 000 F" orders={3} pct={56} />
          <ClientRow name="Koffi B." zone="Abobo" value="27 000 F" orders={2} pct={40} />
          <ClientRow name="Silué F." zone="Cocody" value="24 000 F" orders={2} pct={35} />
        </Card>

        <Card title="Ce qu'ils pensent" titleTab className="!bg-white">
          <div className="mt-1 flex items-end gap-2">
            <p className="text-3xl font-bold tracking-tight">4,6</p>
            <p className="pb-1 text-xs text-[#141220]/40">sur 5 · 41 avis</p>
          </div>
          <div className="mt-3 space-y-2">
            <RatingRow label="5 étoiles" value="28" pct={68} />
            <RatingRow label="4 étoiles" value="8" pct={20} />
            <RatingRow label="3 étoiles et moins" value="5" pct={12} color="bg-[#FF5A62]" />
          </div>
          <Divider />
          <p className="text-[10px] text-[#141220]/40">
            Dernier avis négatif : « Casque reçu sans le câble » · 27 août
          </p>
        </Card>

        <Card title="Panier moyen par commune" titleTab className="!bg-white">
          <StatRow label="Cocody" value="16 400 F" />
          <StatRow label="Bingerville" value="14 800 F" />
          <StatRow label="Marcory" value="13 200 F" />
          <StatRow label="Yopougon" value="11 900 F" />
          <StatRow label="Abobo" value="9 600 F" />
          <Divider />
          <StatRow label="Commandes à 2 articles ou plus" value="26 %" />
          <StatRow label="Clients ayant laissé un avis" value="56 %" />
        </Card>
      </div>
    </>
  );
}
