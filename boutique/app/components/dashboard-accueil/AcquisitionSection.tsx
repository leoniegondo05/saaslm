import { Card, Divider, SectionHeader, SourceRow, StatRow } from "./shared";

/*
  Section "Acquisition" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function AcquisitionSection({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Acquisition"
        title="D'où viennent vos ventes"
        subtitle="Votre page de commande et vos sources de trafic."
        count="14 indicateurs"
        first={first}
        layout="inline"
      />

      <div className="grid gap-3 lg:grid-cols-4">
        <Card title="Votre page de commande" titleTab className="!bg-[#FFFFFF70]">
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="-ml-4 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-3xl font-bold tracking-tight text-white">
              2 140
            </p>
            <p className="pb-1 text-xs text-[#141220]/40">visites</p>
          </div>
          <Divider />
          <StatRow label="Commandes obtenues" value="73" />
          <StatRow label="Taux de transformation" value="3,4 %" />
          <StatRow label="Visiteurs uniques" value="1 780" />
          <StatRow label="Temps moyen sur la page" value="1 min 12" />
          <StatRow label="Visites depuis un téléphone" value="93 %" />
        </Card>

        <Card title="D'où viennent vos visiteurs" titleTab className="!bg-[#FFFFFF70]">
          <SourceRow label="TikTok" value="912" pct={43} color="bg-brand-pink" />
          <SourceRow label="WhatsApp et lien direct" value="556" pct={26} color="bg-[#141220]/70" />
          <SourceRow label="Facebook" value="385" pct={18} color="bg-[#2F6BE0]" />
          <SourceRow label="Instagram" value="192" pct={9} color="bg-[#141220]/30" />
          <SourceRow label="Google" value="95" pct={4} color="bg-[#141220]/20" />
        </Card>

        <Card title="Ce que chaque source rapporte" titleTab className="!bg-[#FFFFFF70]">
          <StatRow label="TikTok" value="3,1 % · 28 commandes" />
          <StatRow label="WhatsApp et direct" value="4,9 % · 27" />
          <StatRow label="Facebook" value="2,6 % · 10" />
          <StatRow label="Instagram" value="3,1 % · 6" />
          <StatRow label="Google" value="2,1 % · 2" />
          <Divider />
          <p className="text-[10px] text-[#141220]/40">
            Le lien direct transforme le mieux : ce sont des clients déjà convaincus quand ils arrivent.
          </p>
        </Card>

        <Card title="Paniers abandonnés" titleTab className="!bg-[#FFFFFF70]">
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="-ml-4 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-3xl font-bold tracking-tight text-white">
              23
            </p>
            <p className="pb-1 text-xs text-[#141220]/40">soit 287 000 F</p>
          </div>
          <Divider />
          <StatRow label="Abandon après le prix" value="11" />
          <StatRow label="Abandon au paiement" value="7" />
          <StatRow label="Abandon à l'adresse" value="5" />
          <StatRow label="Relancés" value="9 · 3 récupérés" />
          <Divider />
          <StatRow label="Pixels connectés" value="3 sur 4" />
          <p className="mt-1.5 text-[10px] text-[#141220]/40">Google Ads reste à connecter.</p>
        </Card>
      </div>
    </>
  );
}
