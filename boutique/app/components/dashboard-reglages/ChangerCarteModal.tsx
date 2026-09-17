"use client";

import { useEffect, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { useMockSave } from "../dashboard-accueil/shared";

/*
  Panneau "Changer" de la carte de prélèvement (FinancesReglements.tsx,
  fiche "Votre carte de prélèvement" — seule fiche à porter cette carte,
  cf. mémoire [[dashboard-mock-data-pending-laravel-api]] et le commentaire
  d'Abonnement.tsx qui y renvoie). Même recette de panneau que
  CreerCategorieModal.tsx (fixed inset-0 + fond assombri + stopPropagation
  + Échap) — thème clair du dashboard, cf. mémoire
  [[dashboard-background-fafcfc]].

  Aucun endpoint Laravel/Stripe n'existe encore pour enregistrer une vraie
  carte : "Enregistrer" ne fait que remplacer la carte affichée par les 4
  derniers chiffres saisis, jamais un numéro inventé au hasard. Le jour où
  l'API existe, seul `onEnregistrer` (côté appelant) a besoin de changer.
*/

export type Carte = { marque: "Visa" | "Mastercard" | "Carte"; derniers4: string; nomComplet: string };

function detecterMarque(numero: string): Carte["marque"] {
  if (numero.startsWith("4")) return "Visa";
  if (numero.startsWith("5")) return "Mastercard";
  return "Carte";
}

export default function ChangerCarteModal({
  onFermer,
  onEnregistrer,
}: {
  onFermer: () => void;
  /** Reçoit la carte déjà nettoyée (marque détectée, 4 derniers chiffres) au clic "Enregistrer". */
  onEnregistrer: (carte: Carte) => void;
}) {
  const { t } = useDashboardLangue();
  const [nomComplet, setNomComplet] = useState("");
  const [numero, setNumero] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvc, setCvc] = useState("");
  const { saving, trigger } = useMockSave();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  const chiffresNumero = numero.replace(/\D/g, "");
  const chiffresExpiration = expiration.replace(/\D/g, "");
  const peutEnregistrer =
    nomComplet.trim().length > 0 && chiffresNumero.length === 16 && chiffresExpiration.length === 4 && cvc.length >= 3;

  const formaterNumero = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formaterExpiration = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const valider = () => {
    if (!peutEnregistrer) return;
    trigger(() =>
      onEnregistrer({ marque: detecterMarque(chiffresNumero), derniers4: chiffresNumero.slice(-4), nomComplet: nomComplet.trim() })
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={onFermer}>
      {/* stopPropagation : cliquer dans le panneau ne doit pas le fermer, seul le fond assombri le fait. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 text-[var(--dashboard-text)] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <h2 className="text-xl font-bold tracking-tight">{t("Changer de carte", "Change card")}</h2>
        <p className="mt-2 text-xs leading-snug text-[var(--dashboard-text)]/50">
          {t(
            "Cette carte ne sert qu'au prélèvement de votre abonnement mensuel, jamais à recevoir de l'argent.",
            "This card is used only to charge your monthly subscription, never to receive money."
          )}
        </p>

        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Nom complet", "Full name")}</p>
          <input
            autoFocus
            value={nomComplet}
            onChange={(e) => setNomComplet(e.target.value)}
            placeholder={t("Nom sur la carte", "Name on card")}
            className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
          />
        </div>

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Numéro de carte", "Card number")}</p>
          <input
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(formaterNumero(e.target.value))}
            placeholder="4417 0000 0000 0000"
            className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04] font-figures"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Expiration", "Expiry")}</p>
            <input
              inputMode="numeric"
              value={expiration}
              onChange={(e) => setExpiration(formaterExpiration(e.target.value))}
              placeholder="MM/AA"
              className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04] font-figures"
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">CVC</p>
            <input
              inputMode="numeric"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04] font-figures"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onFermer}
            disabled={saving}
            className="flex-1 rounded-full border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)] py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("Annuler", "Cancel")}
          </button>
          <button
            type="button"
            onClick={valider}
            disabled={!peutEnregistrer || saving}
            className="flex-[1.4] rounded-full bg-[#141220] py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-pink"
          >
            {saving ? t("Enregistrement…", "Saving…") : t("Enregistrer la carte", "Save the card")}
          </button>
        </div>
      </div>
    </div>
  );
}
