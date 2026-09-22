import type { BoutiqueIdentite } from "@/lib/boutique-types";
import { MailIcon, MapPinIcon, PhoneIcon } from "./Icons";

/*
  Bande "Vendu par <boutique>" — port de la case "vendu-par". BoutiqueIdentite
  n'a pas de champ téléphone/email/adresse publique aujourd'hui (cf.
  [[dashboard-mock-data-pending-laravel-api]]) : les icônes restent
  décoratives (pas de vrai numéro/adresse à afficher) plutôt que d'inventer
  un contact, même simplification assumée que le pied de page.
*/
export default function SectionVenduPar({ identite }: { identite: BoutiqueIdentite }) {
  const trait = "color-mix(in srgb, var(--tx) 10%, transparent)";
  const icone = "color-mix(in srgb, var(--tx) 35%, transparent)";
  const initiales = identite.nom.charAt(0).toUpperCase();

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--tx)]/8 bg-[var(--tx)]/[.02] px-5 py-4">
        {identite.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={identite.logo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: "var(--ac)" }}>
            {initiales}
          </span>
        )}
        <div className="shrink-0">
          <p className="text-[10.5px] uppercase tracking-wide text-[var(--tx)]/45">Vendu par</p>
          <p className="text-[14px] font-bold">{identite.nom}</p>
        </div>
        <div className="ml-auto hidden flex-1 items-center gap-3 sm:flex">
          <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: trait }} />
          <PhoneIcon color={icone} />
          <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: trait }} />
          <MailIcon color={icone} />
          <span className="h-0 flex-1 border-t border-dashed" style={{ borderColor: trait }} />
          <MapPinIcon color={icone} />
        </div>
      </div>
    </section>
  );
}
