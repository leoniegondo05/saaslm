import Image from "next/image";
import Link from "next/link";
import SectionBadge from "./SectionBadge";

export default function CTA() {
  return (
    <section
      id="cta"
      className="bg-[linear-gradient(to_bottom,#000717_0%,#101625_25%,#3f4350_50%,#7b7d87_70%,#b5b4bd_85%,#faf7fc_100%)] px-6 py-24 md:px-16"
    >
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionBadge />

          <p className="mt-6 text-lg text-brand-white/70">
            E-commerçant,
            <br />
            Entreprise de logistique :
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            votre voyage commence{" "}
            <span className="text-brand-pink">ici</span>.
          </h2>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-brand-pink px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Créer ma boutique gratuitement
            </Link>
            <button
              type="button"
              className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold transition hover:bg-white/5"
            >
              Devenir partenaire agréé
            </button>
          </div>
        </div>

        {/* Visuel exporté depuis Figma. On utilise le composant Image de
            Next.js (plutôt qu'une balise <img> classique) car il optimise
            automatiquement l'image (taille, format, chargement différé). */}
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl">
          <Image
            src="/images/cta-image.png"
            alt="Une main ouvre une porte avec une serrure connectée, révélant une rue de boutiques illuminées de nuit, symbolisant l'ouverture vers votre nouvelle boutique en ligne"
            width={600}
            height={640}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
