"use client";

import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function CTA() {
  return (
    // Dégradé plein écran (pas juste sur le contenu centré, d'où ce
    // <section> englobant) : sans lui, on passait directement du fond
    // sombre de la page au blanc plat du footer, ce qui faisait un
    // décrochage brutal — ce dégradé assombri→blanc fait la transition
    // progressivement, jusqu'à rejoindre exactement le blanc du footer
    // (#faf7fc, même valeur que --color-brand-white).
    <section className="bg-[linear-gradient(to_bottom,#000717_0%,#101625_25%,#3f4350_50%,#7b7d87_70%,#b5b4bd_85%,#faf7fc_100%)]">
      <ScrollReveal
        dataSection
        dataTitre=""
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-16 pt-33 pb-40 max-w-[1500px] mx-auto"
      >
        <div>
          <h2 className="text-[clamp(26px,2.9vw,40px)] font-normal leading-[1.28] tracking-[-0.015em]">
            E-commerçant,<br />
            Entreprise de logistique<b>:</b>
          </h2>
          <h2 className="text-[clamp(26px,2.9vw,40px)] leading-[1.28] tracking-[-0.015em] mt-8.5">
            <b>
              votre voyage commence{" "}
              <em className="text-brand-pink not-italic font-bold">ici</em>.
            </b>
          </h2>
          <div className="flex gap-4.5 flex-wrap mt-13">
            {/* Boutons conformes à la maquette Figma (mesurée en pixels),
                pas .btn-cta/.btn-cta-secondary (glassmorphism de la charte)
                — priorité à la maquette sur la charte en cas de conflit,
                comme demandé plus tôt sur ce projet. */}
            <span className="inline-block rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-[11px] bg-[#0a0e1c] px-[18px] py-4 text-sm font-semibold text-brand-white no-underline transition hover:opacity-90"
              >
                Créer ma boutique gratuitement
                <span className="flex text-brand-white opacity-85">
                  <svg width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 1l5 5-5 5M11 1l5 5-5 5M20 1l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </span>
            <Link
              href="/partenaire-agree"
              className="flex items-center gap-2 rounded-xl bg-white px-[18px] py-4 text-sm font-semibold text-black no-underline transition hover:opacity-90"
            >
              Devenir partenaire agréé
            </Link>
          </div>
        </div>

        {/* Vidéo de la porte, jouée en boucle sans son ni contrôles pour se
            fondre comme une animation 3D plutôt qu'une vidéo classique. */}
        <div className="visuel-cta overflow-hidden rounded-3xl">
          <video
            src="/videos/porte.MP4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            className="h-full w-full object-cover"
            aria-label="Une main ouvre une porte avec une serrure connectée, révélant une rue de boutiques illuminées de nuit, symbolisant l'ouverture vers votre nouvelle boutique en ligne"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
