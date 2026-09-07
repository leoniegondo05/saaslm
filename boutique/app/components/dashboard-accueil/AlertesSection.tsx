import { AlertRow, Card, SectionHeader, StatRow, Tag } from "./shared";

/*
  Section "Alertes" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx.
*/
export default function AlertesSection({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Alertes"
        title="Ce qui demande une décision"
        subtitle="Ruptures, litiges et tenue de votre partenaire."
        count="16 indicateurs"
        first={first}
        layout="inline"
      />

      <div className="grid items-start gap-3 pb-4 lg:grid-cols-3">
        <Card
          title="Ce qui demande une décision"
          titleTab
          className="!bg-[var(--dashboard-glass)]"
          badge={<Tag tone="pink">5 alertes</Tag>}
        >
          <AlertRow code="S" name="Huile de ricin" tag="Rupture sous 1 jour" tone="ko" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FF5A62]" />
          <AlertRow code="S" name="Coffret parfum" tag="En rupture · retiré de la page" tone="ko" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FF5A62]" />
          <AlertRow code="S" name="Bracelet cuir" tag="Rotation lente · 28 immobilisées" tone="warn" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FFB020]" />
          <AlertRow code="P" name="Casque X2" tag="4 avis négatifs" tone="warn" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FFB020]" />
          <AlertRow code="L" name="Montre S8" tag="3 litiges ce mois" tone="warn" tagClassName="!bg-[var(--dashboard-card-bg)] !text-[#FFB020]" last />
          <div className="my-3 h-px bg-[var(--dashboard-text)]/10" />
          <StatRow label="Alertes traitées ce mois" value="11" />
        </Card>

        <Card title="Litiges" titleTab className="!bg-[var(--dashboard-glass)]" badge={<Tag tone="pink" className="mb-2">1 en cours</Tag>}>
          <div className="mt-3">
          <StatRow
            label="Montant suspendu"
            value={
              <span className="-mr-4 inline-block rounded-l-xl bg-brand-purple py-2 pl-4 pr-4 text-sm font-bold text-white">
                28 000 F
              </span>
            }
          />
          </div>
          <StatRow label="Ouvert par" value="Le client final" />
          <StatRow label="Depuis" value="3 jours" />
          <StatRow label="Résolus ce mois" value="4" />
          <StatRow label="Délai moyen de résolution" value="5 jours" />
          <StatRow label="Montant récupéré" value="46 000 F" />
          <StatRow label="Montant perdu" value="12 000 F" />
          <StatRow label="Taux de litige" value="1,4 %" />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="w-full rounded-full bg-brand-pink py-2.5 text-center text-xs font-semibold text-white shadow-[0_4px_16px_rgba(236,12,140,0.35)] transition hover:bg-brand-pink/90"
            >
              Voir le litige en cours
            </button>
          </div>
        </Card>

        <Card
          title="Votre partenaire"
          titleTab
          className="!bg-[var(--dashboard-glass)]"
          badge={
            <Tag tone="dark" style={{ background: "var(--dashboard-card-bg)", boxShadow: "0 2px 10px rgba(20,18,32,0.12)" }}>
              <span className="text-yellow-400">★</span> Note 8,4
            </Tag>
          }
        >
          <StatRow label="Délai moyen de livraison" value="26 h" />
          <StatRow label="Moyenne du réseau" value="31 h" />
          <StatRow label="Taux de livraison" value="79 %" />
          <StatRow label="Retards ce mois" value="5" />
          <StatRow label="Écarts sur mes dépôts" value="3 unités" />
          <StatRow label="Réponses à l'assistance" value="3 h en moyenne" />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[var(--dashboard-text)]/50">Évaluation du mois</span>
            <Tag tone="pink">À donner</Tag>
          </div>
        </Card>
      </div>
    </>
  );
}
