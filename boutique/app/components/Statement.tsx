import ScrollReveal from "./ScrollReveal";
import SectionBadge from "./SectionBadge";

// Une courte section "citation" au centre de la page, comme dans la
// maquette Figma : juste la pastille et une grande phrase centrée.
export default function Statement() {
  return (
    <section
      id="commerce-digital"
      className="flex items-center bg-brand-bg px-6 py-32 text-center md:px-16"
    >
      <ScrollReveal className="w-full">
        {/* <div className="flex justify-center">
          <SectionBadge />
        </div> */}
        <p className="mx-auto mt-8 max-w-3xl text-2xl font-semibold sm:text-4xl">
          Le commerce digital orchestré de bout en bout.
        </p>
      </ScrollReveal>
    </section>
  );
}
