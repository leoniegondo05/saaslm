// Petit composant réutilisable : la "pastille" rose "La solution LM" que
// l'on retrouve en haut de presque toutes les sections dans la maquette
// Figma. On le sort dans son propre fichier pour ne pas répéter le même
// bout de code partout.
export default function SectionBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs text-brand-white/80">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
      La solution LM
    </span>
  );
}
