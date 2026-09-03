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
      />

      <div className="grid gap-3 pb-4 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Ce qui demande une décision
            </p>
            <Tag tone="pink">5 alertes</Tag>
          </div>
          <AlertRow code="S" name="Huile de ricin" tag="Rupture sous 1 jour" tone="ko" />
          <AlertRow code="S" name="Coffret parfum" tag="En rupture · retiré de la page" tone="ko" />
          <AlertRow code="S" name="Bracelet cuir" tag="Rotation lente · 28 immobilisées" tone="warn" />
          <AlertRow code="P" name="Casque X2" tag="4 avis négatifs" tone="warn" />
          <AlertRow code="L" name="Montre S8" tag="3 litiges ce mois" tone="warn" last />
          <div className="my-3 h-px bg-[#141220]/10" />
          <StatRow label="Alertes traitées ce mois" value="11" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">Litiges</p>
            <Tag tone="pink">1 en cours</Tag>
          </div>
          <StatRow label="Montant suspendu" value="28 000 F" />
          <StatRow label="Ouvert par" value="Le client final" />
          <StatRow label="Depuis" value="3 jours" />
          <StatRow label="Résolus ce mois" value="4" />
          <StatRow label="Délai moyen de résolution" value="5 jours" />
          <StatRow label="Montant récupéré" value="46 000 F" />
          <StatRow label="Montant perdu" value="12 000 F" />
          <StatRow label="Taux de litige" value="1,4 %" />
          <button
            type="button"
            className="mt-4 w-full rounded-full border border-brand-pink/40 py-2.5 text-center text-xs font-semibold text-brand-pink transition hover:bg-brand-pink/5"
          >
            Voir le litige en cours
          </button>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">
              Votre partenaire
            </p>
            <Tag tone="dark">Note 8,4</Tag>
          </div>
          <StatRow label="Délai moyen de livraison" value="26 h" />
          <StatRow label="Moyenne du réseau" value="31 h" />
          <StatRow label="Taux de livraison" value="79 %" />
          <StatRow label="Retards ce mois" value="5" />
          <StatRow label="Écarts sur mes dépôts" value="3 unités" />
          <StatRow label="Réponses à l'assistance" value="3 h en moyenne" />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#141220]/50">Évaluation du mois</span>
            <Tag tone="pink">À donner</Tag>
          </div>
        </Card>
      </div>
    </>
  );
}
