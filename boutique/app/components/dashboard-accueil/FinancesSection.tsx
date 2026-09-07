"use client";

import { useState } from "react";
import PaymentMethodCard from "../PaymentMethodCard";
import { Bar, Btn, Card, Divider, MiniStat, PayRow, SectionHeader, StatRow, Tag } from "./shared";

/*
  Section "Finances" de l'onglet Accueil — extraite de
  app/dashboard/accueil/page.tsx pour que ce dernier ne soit plus qu'un
  orchestrateur (cf. FinancesSection/CommandesSection/... + AccueilNav).
*/

/*
  Icône "agrandir" (coins qui s'écartent) affichée en haut à droite du
  panneau de droite : ouvre la vue plein écran scrollable, cf. bouton
  ExpandButton ci-dessous.
*/
function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Agrandir"
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink transition hover:bg-brand-pink/20"
    >
      <ExpandIcon />
    </button>
  );
}

export default function FinancesSection({ first = true }: { first?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const leftCards = (
    <>
      <PaymentMethodCard />

      <div className="ml-3 self-start rounded-2xl bg-[var(--dashboard-glass)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
        <div className="relative flex items-center justify-center">
          <p
            className="-mt-4 mb-2 rounded-b-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]"
            style={{ background: "var(--dashboard-surface-2)", fontFamily: "var(--font-bricolage)" }}
          >
            Trésorerie disponible
          </p>
          <div className="absolute right-0 top-2">
            <Tag tone="dark" className="border border-[var(--dashboard-text)]/15" style={{ borderRadius: 8 }}>Retirable</Tag>
          </div>
        </div>
        <p className="-ml-4 mt-2 inline-block rounded-r-xl bg-brand-purple py-2 pl-4 pr-4 text-2xl font-bold tracking-tight text-white">
          318 000 F
        </p>
        <p className="mt-3 text-xs text-[#3A4055]">
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

      <div className="-mt-16 self-start overflow-hidden rounded-2xl shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
        <div className="bg-[linear-gradient(140.81deg,#3A1D8A_0%,#070707_100%)] px-4 pb-0 pt-4 text-white">
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
          <div className="mt-3 flex h-16 items-end gap-1">
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
        <div className="bg-[var(--dashboard-glass)] p-4">
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

      <Card title="Ce que la période a coûté" titleTab className="-mt-9 self-start !bg-[var(--dashboard-glass)]">
        <StatRow label="Produits drop achetés" value="248 000" compact />
        <StatRow label="Frais logistiques" value="96 000" compact />
        <StatRow label="Emballage" value="inclus" compact />
        <StatRow label="Garantie contre la perte" value="12 000" compact />
        <StatRow label="Livraisons express" value="22 000" compact />
        <StatRow label="Récupération de marchandise" value="4 000" compact />
        <StatRow label="Commission LM" value="21 060" compact />
        <StatRow label="Frais de paiement en ligne" value="14 900" compact />
        <StatRow label="Coût des retours" value="18 000" compact />
        <Divider />
        <StatRow label="Total prélevé" value="435 960" compact />
        <Bar pct={52} color="bg-[#EC0C8C]" />
        <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">52 % du chiffre d&apos;affaires · 5 972 F par commande</p>
      </Card>
    </>
  );

  const rightCards = (
    <>
      <Card title="Où se trouve votre argent" titleTab className="!bg-[var(--dashboard-glass)]">
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-[var(--dashboard-text)]/40">Encaissé sur la période</p>
            <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold" style={{ background: "var(--dashboard-surface-2)" }}>
              842 500
            </button>
          </div>
          <div>
            <p className="text-[10px] text-[var(--dashboard-text)]/40">Livrés mais non payés</p>
            <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold" style={{ background: "var(--dashboard-surface-2)" }}>
              54 000
            </button>
          </div>
          <div>
            <p className="text-[10px] text-[var(--dashboard-text)]/40">Livrés et payés · rétention</p>
            <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold" style={{ background: "var(--dashboard-surface-2)" }}>
              96 000
            </button>
          </div>
          <div>
            <p className="text-[10px] text-[var(--dashboard-text)]/40">Suspendus pour litige</p>
            <button type="button" className="mt-0.5 rounded-lg px-2 py-1 text-base font-bold text-brand-pink" style={{ background: "var(--dashboard-surface-2)" }}>
              28 000
            </button>
          </div>
        </div>
        <Divider />
        <StatRow label="Prochaine libération" value="41 h 12" />
        <Bar pct={43} color="bg-[linear-gradient(90deg,rgba(255,255,255,0.6)_0%,#EC0C8C_100%)]" />
        <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">3 commandes · rétention de 72 h</p>
        <Divider />
        <StatRow label="Libérable demain" value="62 000 F" />
        <StatRow label="Libérable sous 7 jours" value="134 000 F" />
        <StatRow label="Impayés de plus de 72 h" value={<>18 000 F <span className="text-[var(--dashboard-text)]/40">· 2 commandes</span></>} />
      </Card>

      <div className="mx-4 mt-3 rounded-2xl bg-[linear-gradient(140.81deg,#3A1D8A_0%,#070707_100%)] p-4 text-white shadow-[0_18px_40px_rgba(20,20,60,0.3)]">
        <div className="mb-2 flex items-start justify-between">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Bénéfice net de la période</p>
          <Tag tone="dark" style={{ border: "1px solid #FFFFFF21", color: "#FFFFFFB8" }}>
            Marge 48 %
          </Tag>
        </div>
        <button
          type="button"
          className="-ml-4 mb-3 mt-1 rounded-r-xl py-1 pl-4 pr-3 text-3xl font-bold tracking-tight text-white"
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

      <Card title="Paiements reçus, par moyen" titleTab className="!bg-[var(--dashboard-glass)]">
        <PayRow label="Orange Money" color="#FF7900" value="412 000" pct={49} />
        <PayRow label="Wave" color="#1BA1F2" value="238 500" pct={28} />
        <PayRow label="MTN MoMo" color="#FFCC00" value="121 000" pct={14} />
        <PayRow label="Moov Money" color="#2F72D6" value="71 000" pct={9} />
      </Card>
    </>
  );

  return (
    <>
      <SectionHeader
        eyebrow="Finances"
        title="Où va votre argent"
        subtitle="Ce que la période a encaissé, prélevé et laissé."
        count="28 indicateurs"
        first={first}
        layout="inline"
      />

      <div className="grid items-stretch gap-3 lg:grid-cols-[2fr_1fr] [&>*]:min-w-0">
      <div
        className="grid gap-3 rounded-2xl px-5 pb-12 pt-24 sm:grid-cols-2"
        style={{ backdropFilter: "blur(18.899999618530273px)", background: "var(--dashboard-glass)" }}
      >
        {leftCards}
      </div>

      <div
        className="relative grid gap-3 rounded-2xl px-5 py-12"
        style={{ backdropFilter: "blur(18.899999618530273px)", background: "var(--dashboard-glass)" }}
      >
        <ExpandButton onClick={() => setExpanded(true)} />
        {rightCards}
      </div>
      </div>

      <Card className="mt-3 !p-6" style={{ background: "var(--dashboard-glass)" }}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
              className="flex h-full flex-col rounded-xl p-1.5 text-left"
              style={{ background: "var(--dashboard-surface-2)" }}
            >
              <p className="text-[9px] font-semibold text-[var(--dashboard-text)]">{t.label}</p>
              <p className="mt-0.5 text-xs font-bold">{t.value}</p>
              <p className="mt-auto pt-0.5 text-[8px] font-medium text-[var(--dashboard-text)]">{t.note}</p>
            </button>
          ))}
        </div>
      </Card>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 sm:p-16"
          onClick={() => setExpanded(false)}
        >
          <div
            className="finances-modal-scroll relative max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl px-5 py-12"
            style={{ backdropFilter: "blur(18.899999618530273px)", background: "var(--dashboard-modal-bg)", scrollbarColor: "#EC0C8C transparent" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Fermer"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink transition hover:bg-brand-pink/20"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="grid gap-3">{rightCards}</div>
          </div>
          <style jsx>{`
            .finances-modal-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .finances-modal-scroll::-webkit-scrollbar-thumb {
              background: #ec0c8c;
              border-radius: 9999px;
            }
            .finances-modal-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
