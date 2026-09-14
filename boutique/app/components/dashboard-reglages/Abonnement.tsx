"use client";

import { useState } from "react";
import { Card, SectionHeader, Tag } from "../dashboard-accueil/shared";
import { useDashboardLangue } from "../DashboardLanguageProvider";

/*
  Écran 29 "Réglages · abonnement" : ce que la boutique verse chaque mois
  à son partenaire agréé, l'historique, et la résiliation. La carte de
  prélèvement n'a qu'une fiche, celle de "Finances et règlements" — pas
  de doublon ici. Résilier arrête la boutique sans rompre le rattachement
  au partenaire — la fiche le dit avant le bouton. Champs statiques pour
  l'instant, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

const HISTORIQUE = [
  { date: "14 août 2026" },
  { date: "14 juillet 2026" },
  { date: "14 juin 2026" },
  { date: "14 mai 2026" },
  { date: "14 avril 2026" },
];

export default function Abonnement({ first = false }: { first?: boolean }) {
  const { t } = useDashboardLangue();
  const [prelevementAuto, setPrelevementAuto] = useState(true);
  const [enregistre, setEnregistre] = useState(false);

  const enregistrer = () => {
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 1800);
  };

  return (
    <>
      <SectionHeader
        eyebrow={t("Abonnement", "Subscription")}
        title={t("Ce que vous versez chaque mois", "What you pay each month")}
        subtitle={t("Ce que vous devez, et l'historique.", "What you owe, and the history.")}
        first={first}
        layout="inline"
      />

      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={enregistrer}
          className="rounded-full bg-[#141220] px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
        >
          {enregistre ? t("✓ Enregistré", "✓ Saved") : t("Enregistrer", "Save")}
        </button>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-brand-pink/20 bg-brand-pink/[0.05] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Votre abonnement", "Your subscription")}</p>
              <p className="mt-1.5 text-[28px] font-bold tracking-tight text-[var(--dashboard-text)]">
                25 000<span className="ml-1 text-base font-semibold text-[var(--dashboard-text)]/50">F</span>
                <span className="ml-2 text-xs font-normal text-[var(--dashboard-text)]/50">{t("par mois", "per month")}</span>
              </p>
              <p className="mt-1.5 text-xs text-[var(--dashboard-text)]/50">
                {t("Versé à votre partenaire agréé, Groupe Logistique Ivoire.", "Paid to your approved partner, Groupe Logistique Ivoire.")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Prochaine échéance", "Next due date")}</p>
              <p className="mt-1.5 text-base font-bold text-[var(--dashboard-text)]">{t("14 sept.", "Sept. 14")}</p>
              <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">{t("dans 8 jours", "in 8 days")}</p>
            </div>
          </div>
          <div className="my-4 h-px bg-[var(--dashboard-text)]/10" />
          <p className="text-xs text-[var(--dashboard-text)]/50">
            {t(
              "L'abonnement, c'est votre place dans le réseau de votre partenaire : ses entrepôts, ses livreurs, son catalogue. Il est dû qu'il y ait des ventes ou non.",
              "The subscription is your place in your partner's network: their warehouses, their couriers, their catalog. It's due whether or not there are sales."
            )}
          </p>
        </div>

        <Card className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Prélèvement automatique", "Automatic payment")}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[var(--dashboard-text)]/50">
                {t(
                  "Actif par défaut. Le décocher vous oblige à payer à la main chaque mois, et un retard suspend la boutique.",
                  "Active by default. Unchecking it means paying by hand each month, and a late payment suspends the shop."
                )}
              </p>
            </div>
            <ToggleSwitch
              checked={prelevementAuto}
              onChange={() => setPrelevementAuto((v) => !v)}
              label={t("Prélèvement automatique", "Automatic payment")}
            />
          </div>
        </Card>

        <Card title={t("Historique des abonnements", "Subscription history")} titleTab className="!bg-[var(--dashboard-card-bg)]">
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              {t("Tout télécharger", "Download all")}
            </button>
          </div>
          <div className="mt-2 divide-y divide-[var(--dashboard-text)]/10">
            {HISTORIQUE.map(({ date }) => (
              <div key={date} className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                  <CalendarIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--dashboard-text)]">{date}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--dashboard-text)]/50">
                    {t("Abonnement mensuel · Groupe Logistique Ivoire", "Monthly subscription · Groupe Logistique Ivoire")}
                  </p>
                </div>
                <p className="text-xs font-bold text-[var(--dashboard-text)]">25 000 F</p>
                <Tag tone="ok">{t("Payée", "Paid")}</Tag>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
                >
                  {t("Télécharger", "Download")}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="rounded-2xl border border-[#ffb0b1]/40 bg-[#ffe1e2]/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-lg">
              <p className="text-xs font-bold text-[var(--dashboard-text)]">{t("Résilier l'abonnement", "Cancel the subscription")}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--dashboard-text)]/60">
                {t(
                  "Vous restez rattaché à Groupe Logistique Ivoire : le lien entre vous ne se coupe pas. C'est votre boutique qui s'arrête. À la date de fin, elle cesse de fonctionner et vous perdez vos accès — ses entrepôts, ses livreurs et son catalogue ne vous servent plus, faute de boutique pour vendre.",
                  "You remain attached to Groupe Logistique Ivoire: the link between you isn't broken. It's your shop that stops. On the end date, it stops working and you lose your access — their warehouses, couriers and catalog are no longer of use to you, for lack of a shop to sell through."
                )}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full border border-[#c8262d]/30 bg-[var(--dashboard-card-bg)] px-5 py-2.5 text-xs font-semibold text-[#c8262d] transition hover:bg-[#ffe1e2]"
            >
              {t("Résilier", "Cancel")}
            </button>
          </div>
          <div className="my-3 h-px bg-[#141220]/10" />
          <div className="space-y-2">
            <EtapeRow numero={1} texte={t("La boutique reste ouverte jusqu'à la fin du mois déjà payé.", "The shop stays open until the end of the already-paid month.")} />
            <EtapeRow numero={2} texte={t("Vos dépôts de stock doivent être récupérés avant cette date.", "Your stock deposits must be collected before that date.")} />
            <EtapeRow numero={3} texte={t("Les commandes déjà parties iront jusqu'à leur livraison.", "Orders already shipped will go through to delivery.")} />
            <EtapeRow
              numero={4}
              texte={t(
                "À la date de fin, la boutique s'arrête et vos accès se ferment. Le rattachement au partenaire, lui, reste en place : reprendre l'abonnement vous rouvre la même boutique.",
                "On the end date, the shop stops and your access closes. The attachment to the partner, though, stays in place: resuming the subscription reopens the same shop."
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function EtapeRow({ numero, texte }: { numero: number; texte: string }) {
  return (
    <div className="flex items-start gap-2.5 text-xs text-[var(--dashboard-text)]/60">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c8262d]/10 text-[10px] font-bold text-[#c8262d]">
        {numero}
      </span>
      <p className="leading-relaxed">{texte}</p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* Même composant que dashboard-profil/MotDePasseSecurite.tsx, repris à
   l'identique — pas encore mutualisé dans shared.tsx. */
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
        checked ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[var(--dashboard-text)]/20"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}
