import PaymentMethodCard from "../PaymentMethodCard";
import { Bar, Btn, Card, Divider, MiniStat, PayRow, SectionHeader, StatRow, Tag } from "./shared";

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

        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
          <div className="relative flex items-center justify-center">
            <p
              className="-mt-4 rounded-b-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8095]"
              style={{ background: "#F0EDF0" }}
            >
              Trésorerie disponible
            </p>
            <div className="absolute right-0 top-2">
              <Tag tone="dark" className="border border-[#D8D8DC]" style={{ borderRadius: 8 }}>Retirable</Tag>
            </div>
          </div>
          <p className="-ml-4 mt-2 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-2xl font-bold tracking-tight text-white">
            318 000 F
          </p>
          <p className="mt-1 text-xs text-[#3A4055]">
            Sur 5 commandes libérées, reversées par votre partenaire.
          </p>
          <Divider />
          <StatRow label="Dernier versement" value="22 août · 214 000 F" />
          <StatRow label="Versements ce mois" value="2" />
          <StatRow label="Délai moyen de versement" value="1,4 jour" />
          <StatRow label="Demande en attente" value="aucune" />
          <Btn variant="dark" className="mt-4" style={{ borderRadius: 10 }}>
            Demander mon versement
          </Btn>
        </div>

        <Card title="Où se trouve votre argent" titleTab className="!bg-white">
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-[#141220]/40">Encaissé sur la période</p>
              <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold" style={{ background: "#D2D2D2A1" }}>
                842 500
              </button>
            </div>
            <div>
              <p className="text-[10px] text-[#141220]/40">Livrés mais non payés</p>
              <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold" style={{ background: "#D2D2D2A1" }}>
                54 000
              </button>
            </div>
            <div>
              <p className="text-[10px] text-[#141220]/40">Livrés et payés · rétention</p>
              <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold" style={{ background: "#D2D2D2A1" }}>
                96 000
              </button>
            </div>
            <div>
              <p className="text-[10px] text-[#141220]/40">Suspendus pour litige</p>
              <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold text-brand-pink" style={{ background: "#D2D2D2A1" }}>
                28 000
              </button>
            </div>
          </div>
          <Divider />
          <StatRow label="Prochaine libération" value="41 h 12" />
          <Bar pct={43} color="bg-[linear-gradient(90deg,rgba(255,255,255,0.6)_0%,#EC0C8C_100%)]" />
          <p className="mt-1.5 text-[10px] text-[#141220]/40">3 commandes · rétention de 72 h</p>
          <Divider />
          <StatRow label="Libérable demain" value="62 000 F" />
          <StatRow label="Libérable sous 7 jours" value="134 000 F" />
          <StatRow label="Impayés de plus de 72 h" value={<>18 000 F <span className="text-[#141220]/40">· 2 commandes</span></>} />
        </Card>
      </div>

      <div className="mt-3 grid items-start gap-3 lg:grid-cols-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
        <div className="overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
          <div className="bg-[linear-gradient(140.81deg,#3A1D8A_0%,#070707_100%)] p-4 text-white">
            <div className="relative -mx-4 -mt-4 flex items-center justify-center px-4 pb-2 pt-0">
              <p
                className="rounded-b-md px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/80"
                style={{ background: "linear-gradient(91.66deg, rgba(255, 255, 255, 0.1) 2.62%, rgba(33, 18, 74, 0.1) 101.03%)" }}
              >
                Chiffre d&apos;affaires · 15 – 30 août
              </p>
              <Tag
                tone="dark"
                className="absolute right-0 top-3 !rounded-lg text-white/80"
                style={{
                  background: "linear-gradient(91.66deg, rgba(255, 255, 255, 0.1) 2.62%, rgba(33, 18, 74, 0.1) 101.03%)",
                }}
              >
                -18 %
              </Tag>
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
          <div className="bg-white p-4">
            <div className="flex items-end justify-between">
              <p className="-ml-4 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-2xl font-bold tracking-tight text-white">
                842 500 F
              </p>
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

        <Card title="Ce que la période a coûté" titleTab className="!bg-white">
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
          <Bar pct={52} color="bg-[#EC0C8C]" />
          <p className="mt-1.5 text-[10px] text-[#141220]/40">52 % du chiffre d&apos;affaires · 5 972 F par commande</p>
        </Card>

        <Card className="!bg-white !p-3 sm:col-span-2">
          <div className="grid grid-cols-6 gap-2">
            {[
              { label: "Abonnement", value: "25 000 F", note: "Échéance 14 sept." },
              { label: "Commission LM", value: "21 060 F", note: "2,5 % effectif" },
              { label: "Reste à percevoir", value: "150 000 F" },
              { label: "Prévision à 7 jours", value: "512 000 F", note: "Au rythme actuel" },
              { label: "Trésorerie totale", value: "468 000 F" },
              { label: "Valeur du stock déposé", value: "1 209 100 F" },
            ].map((t) => (
              <button
                key={t.label}
                type="button"
                className="flex h-full flex-col rounded-xl p-2 text-left"
                style={{ background: "#F0EDF0" }}
              >
                <p className="text-[9px] text-[#141220]/40">{t.label}</p>
                <p className="mt-0.5 text-xs font-bold">{t.value}</p>
                <p className="mt-auto pt-0.5 text-[8px] text-[#141220]/35">{t.note}</p>
              </button>
            ))}
          </div>
        </Card>
        </div>

        <div>
          <div className="rounded-2xl bg-[linear-gradient(140.81deg,#3A1D8A_0%,#070707_100%)] p-4 text-white shadow-[0_18px_40px_rgba(20,20,60,0.3)]">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Bénéfice net de la période</p>
              <Tag tone="dark" style={{ border: "1px solid #FFFFFF21", color: "#FFFFFFB8" }}>
                Marge 48 %
              </Tag>
            </div>
            <button
              type="button"
              className="-ml-4 mt-1 rounded-r-xl py-1 pl-4 pr-3 text-3xl font-bold tracking-tight text-white"
              style={{
                background:
                  "linear-gradient(93.86deg, rgba(255, 255, 255, 0.23) 3.16%, rgba(33, 18, 74, 0.23) 97.81%)",
              }}
            >
              406 540 F
            </button>
            <div className="mt-1 flex justify-end">
              <span className="text-[10px] text-white/50">+ 6 points sur 30 jours</span>
            </div>
            <div className="my-3 h-px bg-white/15" />
            <StatRow label="Marge sur stockage" value="46 %" light />
            <StatRow label="Marge sur drop" value="33 %" light />
            <StatRow label="Marge sur produits propres" value="71 %" light />
          </div>
          <Card title="Paiements reçus, par moyen" titleTab className="mt-3 !bg-white">
            <PayRow label="Orange Money" color="#FF7900" value="412 000" pct={49} />
            <PayRow label="Wave" color="#1BA1F2" value="238 500" pct={28} />
            <PayRow label="MTN MoMo" color="#FFCC00" value="121 000" pct={14} />
            <PayRow label="Moov Money" color="#2F72D6" value="71 000" pct={9} />
          </Card>
        </div>
      </div>
    </>
  );
}
