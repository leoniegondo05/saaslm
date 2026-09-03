import PaymentMethodCard from "../PaymentMethodCard";
import { Bar, Btn, Card, Divider, MiniStat, MiniTile, PayRow, SectionHeader, StatRow, Tag } from "./shared";

/*
  Section "Finances" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx pour que ce dernier ne soit plus qu'un
  orchestrateur (cf. FinancesSection/CommandesSection/... + AccueilNav).
*/
export default function FinancesSection({ first = true }: { first?: boolean }) {
  return (
    <>
      <SectionHeader
        eyebrow="Finances"
        title="Où va votre argent"
        subtitle="Ce que la période a encaissé, prélevé et laissé."
        count="28 indicateurs"
        first={first}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <PaymentMethodCard />

        <div className="rounded-2xl bg-[linear-gradient(168deg,#FFFFFF_0%,#EFF1F8_64%,#DFE3EF_100%)] p-4 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8095]">
              Trésorerie disponible
            </p>
            <Tag tone="dark">Retirable</Tag>
          </div>
          <p className="mt-1 text-3xl font-bold tracking-tight">318 000 F</p>
          <p className="mt-1 text-xs text-[#3A4055]">
            Sur 5 commandes libérées, reversées par votre partenaire.
          </p>
          <Divider />
          <StatRow label="Dernier versement" value="22 août · 214 000 F" />
          <StatRow label="Versements ce mois" value="2" />
          <StatRow label="Délai moyen de versement" value="1,4 jour" />
          <StatRow label="Demande en attente" value="aucune" />
          <Btn variant="dark" className="mt-4">
            Demander mon versement
          </Btn>
        </div>

        <Card title="Où se trouve votre argent">
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniStat label="Encaissé sur la période" value="842 500" />
            <MiniStat label="Livrés mais non payés" value="54 000" />
            <MiniStat label="Livrés et payés · rétention" value="96 000" />
            <MiniStat label="Suspendus pour litige" value="28 000" tone="pink" />
          </div>
          <Divider />
          <StatRow label="Prochaine libération" value="41 h 12" />
          <Bar pct={43} color="bg-brand-pink" />
          <p className="mt-1.5 text-[10px] text-[#141220]/40">3 commandes · rétention de 72 h</p>
          <Divider />
          <StatRow label="Libérable demain" value="62 000 F" />
          <StatRow label="Libérable sous 7 jours" value="134 000 F" />
          <StatRow label="Impayés de plus de 72 h" value={<>18 000 F <span className="text-[#141220]/40">· 2 commandes</span></>} />
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(20,18,32,0.06)] lg:col-span-1">
          <div className="bg-[linear-gradient(180deg,#3B1FA8,#141A56)] p-4 text-white">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
                Chiffre d&apos;affaires · 15 – 30 août
              </p>
              <Tag tone="dark">+18 %</Tag>
            </div>
            <div className="mt-3 flex h-14 items-end gap-1">
              {[32, 54, 40, 68, 56, 84, 100, 66, 74, 48, 62, 80].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background: h === 100 ? "linear-gradient(180deg,#FF8BC4,#EC0C8C)" : "rgba(255,255,255,0.22)",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="bg-[linear-gradient(180deg,#D9DEF0,#FFFFFF)] p-4">
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold tracking-tight">842 500 F</p>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B8095]">Meilleure journée</p>
                <p className="text-xs font-semibold">27 août · 96 400 F</p>
              </div>
            </div>
            <Divider />
            <StatRow label="Panier moyen" value="13 050 F · +6 %" />
            <StatRow label="Ticket le plus élevé" value="48 000 F" />
            <StatRow label="Ticket le plus bas" value="3 900 F" />
            <StatRow label="Chiffre d'affaires perdu" value="148 000 F · 12 commandes" />
            <StatRow label="Écart facturé / encaissé" value="54 000 F" />
          </div>
        </div>

        <Card title="Ce que la période a coûté">
          <StatRow label="Produits drop achetés" value="248 000" bold={false} />
          <StatRow label="Frais logistiques" value="96 000" bold={false} />
          <StatRow label="Emballage" value="inclus" bold={false} />
          <StatRow label="Garantie contre la perte" value="12 000" bold={false} />
          <StatRow label="Livraisons express" value="22 000" bold={false} />
          <StatRow label="Récupération de marchandise" value="4 000" bold={false} />
          <StatRow label="Commission LM" value="21 060" bold={false} />
          <StatRow label="Frais de paiement en ligne" value="14 900" bold={false} />
          <StatRow label="Coût des retours" value="18 000" bold={false} />
          <Divider />
          <StatRow label="Total prélevé" value="435 960" />
          <Bar pct={52} color="bg-[#141220]/40" />
          <p className="mt-1.5 text-[10px] text-[#141220]/40">52 % du chiffre d&apos;affaires · 5 972 F par commande</p>
        </Card>

        <div>
          <div className="rounded-2xl bg-[linear-gradient(155deg,#3B1FA8_0%,#1B1E72_46%,#0A0E28_100%)] p-4 text-white shadow-[0_18px_40px_rgba(20,20,60,0.3)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Bénéfice net de la période</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">406 540 F</p>
            <div className="mt-1 flex items-center gap-2">
              <Tag tone="dark">Marge 48 %</Tag>
              <span className="text-[10px] text-white/50">+ 6 points sur 30 jours</span>
            </div>
            <div className="my-3 h-px bg-white/15" />
            <StatRow label="Marge sur stockage" value="46 %" light />
            <StatRow label="Marge sur drop" value="33 %" light />
            <StatRow label="Marge sur produits propres" value="71 %" light />
          </div>
          <Card title="Paiements reçus, par moyen" className="mt-3">
            <PayRow label="Orange Money" color="#FF7900" value="412 000" pct={49} />
            <PayRow label="Wave" color="#1BA1F2" value="238 500" pct={28} />
            <PayRow label="MTN MoMo" color="#FFCC00" value="121 000" pct={14} />
            <PayRow label="Moov Money" color="#2F72D6" value="71 000" pct={9} />
          </Card>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MiniTile label="Abonnement" value="25 000 F" note="Échéance 14 sept." />
        <MiniTile label="Commission LM" value="21 060 F" note="2,5 % effectif" />
        <MiniTile label="Reste à percevoir" value="150 000 F" />
        <MiniTile label="Valeur du stock déposé" value="1 209 100 F" />
        <MiniTile label="Prévision à 7 jours" value="512 000 F" note="Au rythme actuel" />
        <MiniTile label="Trésorerie totale" value="468 000 F" />
      </div>
    </>
  );
}
