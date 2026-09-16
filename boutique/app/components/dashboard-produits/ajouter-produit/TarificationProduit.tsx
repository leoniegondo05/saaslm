"use client";

/*
  Bloc "Prix d'achat / prix de revente / poids" (Écran 08). La marge
  ("Ce qui vous reste") vit dans sa propre colonne — voir MargeCard.tsx —
  comme dans la maquette où ce sont deux blocs distincts, pas un seul.
*/

import { useDashboardLangue } from "../../DashboardLanguageProvider";

// Sécurité front : un champ numérique reste un <input type="number"> avec
// min="0" pour guider la saisie, mais la valeur n'est jamais reprise
// telle quelle — elle repasse toujours par ce parseur qui refuse
// NaN/négatif avant d'atteindre le state (un <input type="number"> laisse
// par ex. passer "-3" ou un champ vidé sans le bloquer lui-même).
function parseMontant(brut: string): number {
  const n = Number(brut);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

export default function TarificationProduit({
  prixAchat,
  onPrixAchatChange,
  prixVente,
  onPrixVenteChange,
  poidsGrammes,
  onPoidsChange,
}: {
  prixAchat: number | null;
  onPrixAchatChange: (v: number | null) => void;
  prixVente: number;
  onPrixVenteChange: (v: number) => void;
  poidsGrammes: number | null;
  onPoidsChange: (v: number | null) => void;
}) {
  const { t } = useDashboardLangue();

  return (
    <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <Champ
        label={t("Prix d'achat (F)", "Cost price (F)")}
        aide={t(
          "Ce prix ne sort jamais de votre boutique. Ni vos clients, ni votre partenaire agréé ne le voient. Il ne sert qu'à calculer ce qui vous reste.",
          "This price never leaves your shop. Neither your customers nor your approved partner see it. It's only used to calculate what you keep."
        )}
      >
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={prixAchat ?? ""}
          onChange={(e) => onPrixAchatChange(e.target.value === "" ? null : parseMontant(e.target.value))}
          placeholder="8500"
          className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
        />
      </Champ>

      <div className="mt-3">
        <Champ
          label={t("Prix de revente (F)", "Resale price (F)")}
          aide={t(
            "Le prix affiché au client. Ces deux prix s'appliquent à toutes les combinaisons ; vous pouvez en changer une par une dans la liste des variantes.",
            "The price shown to the customer. Both prices apply to every combination; you can change them one by one in the variants list."
          )}
        >
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={prixVente || ""}
            onChange={(e) => onPrixVenteChange(parseMontant(e.target.value))}
            placeholder="19900"
            className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
          />
        </Champ>
      </div>
    </div>
  );
}

function Champ({ label, aide, children }: { label: string; aide?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{label}</p>
      <div className="mt-1.5">{children}</div>
      {aide && <p className="mt-1 text-[9px] text-[var(--dashboard-text)]/35">{aide}</p>}
    </div>
  );
}
