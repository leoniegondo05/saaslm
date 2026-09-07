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

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Votre page de commande" titleTab className="!bg-[var(--dashboard-glass)] self-start">
          <div className="mt-4 flex items-end justify-between gap-2">
            <p className="-ml-4 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-3xl font-bold tracking-tight text-white">
              2 140
            </p>
            <p className="pb-1 text-xs text-[var(--dashboard-text)]/40">visites</p>
          </div>
          <Divider />
          <StatRow label="Commandes obtenues" value="73" />
          <StatRow label="Taux de transformation" value="3,4 %" />
          <StatRow label="Visiteurs uniques" value="1 780" />
          <StatRow label="Temps moyen sur la page" value="1 min 12" />
          <StatRow label="Visites depuis un téléphone" value="93 %" />
        </Card>

        <Card title="D'où viennent vos visiteurs" titleTab className="!bg-[var(--dashboard-glass)] self-start">
          <SourceRow label="TikTok" value="912" pct={43} color="bg-[linear-gradient(270.03deg,#000000_10.99%,#FFFFFF_107.31%)]" />
          <SourceRow label="WhatsApp et lien direct" value="556" pct={26} color="bg-[#3CB500]" />
          <SourceRow label="Facebook" value="385" pct={18} color="bg-[#2F6BE0]" />
          <SourceRow label="Instagram" value="192" pct={9} color="bg-[linear-gradient(90deg,rgba(251,134,0,0.58)_0%,rgba(58,29,138,0.58)_50%,rgba(205,0,24,0.58)_100%)]" />
          <SourceRow label="Google" value="95" pct={4} color="bg-[linear-gradient(93.86deg,rgba(212,0,64,0.57)_5.96%,rgba(4,108,182,0.57)_49.14%,rgba(161,140,0,0.57)_116.83%)]" />
        </Card>

        <Card title="Ce que chaque source rapporte" titleTab className="!bg-[var(--dashboard-glass)] self-start">
          <StatRow label="TikTok" value="3,1 % · 28 commandes" />
          <StatRow label="WhatsApp et direct" value="4,9 % · 27" />
          <StatRow label="Facebook" value="2,6 % · 10" />
          <StatRow label="Instagram" value="3,1 % · 6" />
          <StatRow label="Google" value="2,1 % · 2" />
          <Divider />
          <p className="text-[10px] text-[var(--dashboard-text)]/40">
            Le lien direct transforme le mieux : ce sont des clients déjà convaincus quand ils arrivent.
          </p>
        </Card>

        <Card title="Paniers abandonnés" titleTab className="!bg-[var(--dashboard-glass)]">
          <div className="mt-4 flex items-end justify-between gap-2">
            <p className="-ml-4 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-3xl font-bold tracking-tight text-white">
              23
            </p>
            <p className="mb-1 rounded-md px-3 py-1 text-xs text-[var(--dashboard-text)]/60" style={{ background: "var(--dashboard-surface-2)" }}>
              soit 287 000 F
            </p>
          </div>
          <Divider />
          <StatRow label="Abandon après le prix" value="11" />
          <StatRow label="Abandon au paiement" value="7" />
          <StatRow label="Abandon à l'adresse" value="5" />
          <StatRow label="Relancés" value="9 · 3 récupérés" />
          <Divider />
          <StatRow label="Pixels connectés" value="3 sur 4" />
          <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">Google Ads reste à connecter.</p>
        </Card>
      </div>
    </>
  );
}
