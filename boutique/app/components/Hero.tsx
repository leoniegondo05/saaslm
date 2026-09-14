"use client";

import Link from "next/link";
import HeroBrainVideo from "./HeroBrainVideo";

export default function Hero() {
  return (
    <section
      data-section
      data-titre=""
      className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center gap-10 pt-37.5 px-7 pb-22.5 max-w-[1500px] mx-auto"
    >
      <div>
        <h1 className="titre-ouverture text-[clamp(42px,5.3vw,76px)] font-bold leading-[1.06] tracking-[-0.025em] mb-8.5">
          <span className="hero-line hero-line-1">une vente</span>
          <span className="hero-line hero-line-2">un réseau</span>
          <span className="hero-line hero-line-3">
            Tout <em className="text-brand-pink not-italic">s&apos;active</em>
          </span>
        </h1>
        <p className="hero-sub text-brand-white/62 text-[17px] max-w-[370px] mb-8.5 pl-1 lg:ml-30 ml-15">
          toute votre logistique e-commerce, une seule plateforme
        </p>
        <div>
          <span className="hero-cta inline-block rounded-2xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px lg:ml-25 ml-15">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-[14px] bg-[#0a0e1c] px-[18px] py-3 text-sm font-semibold text-brand-white no-underline transition hover:opacity-90"
            >
              commencer maintenant
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
          <small className="hero-mention block mt-3.25 pl-1.5 text-[13.5px] text-brand-white/50 lg:ml-40 ml-25">
            Sans s&apos;engager
          </small>
        </div>
      </div>

      <div className="hero-video visuel-hero">
        <HeroBrainVideo />
      </div>
    </section>
  );
}