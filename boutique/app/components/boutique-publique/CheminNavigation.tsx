import { LienBoutique } from "./PreviewMode";

/*
  Chemin de navigation — port de la case "chemin-navigation" (page de
  commande/fiche produit uniquement, cf. SECTIONS_DEFAUT dans types.ts).
*/
export default function CheminNavigation({ slug, boutiqueNom, page }: { slug: string; boutiqueNom: string; page: string }) {
  return (
    <div className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-hidden px-4 py-3 text-[12.5px] text-[var(--tx)]/50 sm:px-6">
      <LienBoutique href={`/boutique/${slug}`} className="shrink-0 hover:underline">
        Accueil
      </LienBoutique>
      <span className="shrink-0">›</span>
      <LienBoutique href={`/boutique/${slug}`} className="shrink-0 truncate hover:underline">
        {boutiqueNom}
      </LienBoutique>
      <span className="shrink-0">›</span>
      <span className="truncate font-semibold text-[var(--tx)]">{page}</span>
    </div>
  );
}
