"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // ---- IntersectionObserver ----
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const oeil = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            oeil.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    oeil.observe(el);
    return () => oeil.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section
      data-titre=""
      className={`cta-section relative bg-[linear-gradient(to_bottom,#000717_0%,#101625_25%,#3f4350_50%,#7b7d87_70%,#b5b4bd_85%,#faf7fc_100%)] ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="cta-gradient grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center px-5 sm:px-10 lg:px-16 pt-20 sm:pt-28 lg:pt-33 pb-24 sm:pb-32 lg:pb-40 max-w-[1500px] mx-auto">
        {/* ---------- Colonne gauche : texte + boutons ---------- */}
        <div>
          <h2 className="cta-ligne-1 text-[clamp(26px,2.9vw,40px)] font-normal leading-[1.28] tracking-[-0.015em]">
            E-commerçant,<br />
            Entreprise de logistique<b>:</b>
          </h2>

          <h2 className="cta-ligne-2 text-[clamp(26px,2.9vw,40px)] leading-[1.28] tracking-[-0.015em] mt-6 sm:mt-8.5">
            <b>
              votre voyage commence{" "}
              <em className="cta-ici text-brand-pink not-italic font-bold">
                ici
              </em>
              .
            </b>
          </h2>

          {/* ---- Boutons : 2 colonnes égales sur mobile, flex sur desktop ---- */}
          <div className="grid grid-cols-2 gap-3 mt-8 sm:flex sm:gap-4.5 sm:flex-wrap sm:mt-13">
            {/* Bouton principal : coque dégradée + fond noir + lien */}
            <span className="cta-bouton-1 rounded-xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px flex">
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-1.5 rounded-[11px] bg-[#0a0e1c] px-3 py-2.5 text-[12px] font-semibold text-brand-white no-underline transition hover:opacity-90 sm:gap-2 sm:px-[18px] sm:py-3 sm:text-sm"
              >
                <span className="text-center leading-tight">
                  Créer ma boutique
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> gratuitement</span>
                </span>
                <span className="hidden sm:flex text-brand-white opacity-85">
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

            {/* Bouton secondaire : fond blanc plein */}
            <Link
              href="/partenaire-agree"
              className="cta-bouton-2 flex items-center justify-center rounded-xl bg-white px-3 py-2.5 text-[12px] font-semibold text-black no-underline transition hover:opacity-90 sm:px-[18px] sm:py-3 sm:text-sm"
            >
              <span className="text-center leading-tight">
                Devenir partenaire
                <br className="sm:hidden" />
                <span className="hidden sm:inline"> agréé</span>
              </span>
            </Link>
          </div>
        </div>

        {/* ---------- Colonne droite : vidéo de la porte ---------- */}
        <div className="cta-video overflow-hidden rounded-3xl">
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
      </div>
    </section>
  );
}