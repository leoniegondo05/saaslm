import SectionBadge from "./SectionBadge";

// En-tête réutilisable pour les sections "Comment ça marche", "Flux
// financiers", "Un continent" et "Commerce digital" : la pastille rose,
// une petite barre inclinée, puis le titre et le sous-titre. C'est
// exactement la mise en page qu'on retrouve dans la maquette Figma pour
// chacune de ces sections.
type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export default function SectionHeader({
  title,
  subtitle,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-wrap items-start gap-4 ${
        align === "center" ? "justify-center text-center" : ""
      }`}
    >
      <SectionBadge />
      <span
        aria-hidden
        className="hidden h-5 w-px rotate-12 bg-white/20 sm:block"
      />
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-brand-white/50">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
