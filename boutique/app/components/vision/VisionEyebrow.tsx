// Petit label gris, tout en majuscules, utilisé au-dessus des titres des
// sections "Les effets" et "Le constat" de la page "/vision" — distinct de
// SectionBadge.tsx (pastille rose) : ici c'est juste du texte, sans bordure
// ni fond, comme sur les captures fournies par l'utilisateur.
export default function VisionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-white/40">
      {children}
    </p>
  );
}
