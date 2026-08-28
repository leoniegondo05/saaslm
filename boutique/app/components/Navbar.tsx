"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { sections, type SectionInfo } from "./sections-data";

// Les liens affichés à droite de la barre de navigation principale.
const NAV_LINKS = [
  { label: "Ce que nous construisons", href: "#comment-ca-marche" },
  { label: "Partenaire agréée LM", href: "#cta" },
];

export default function Navbar() {
  // "scrolled" devient vrai dès que l'utilisateur commence à descendre la
  // page. On s'en sert pour cacher la barre de navigation principale et
  // faire apparaître la barre "flottante" à la place, comme demandé dans
  // les commentaires de la maquette Figma.
  const [scrolled, setScrolled] = useState(false);

  // "activeSection" contient le titre de la section actuellement visible à
  // l'écran, pour l'afficher dans la barre flottante pendant le scroll.
  const [activeSection, setActiveSection] = useState<SectionInfo>(
    sections[0]
  );

  useEffect(() => {
    // On écoute l'évènement "scroll" du navigateur pour savoir si on a
    // commencé à descendre la page (au-delà de 80px, pour éviter que la
    // barre change dès le moindre petit mouvement de souris).
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Un IntersectionObserver surveille quelle section occupe le centre de
    // l'écran. Dès qu'une nouvelle section arrive au centre, on met à jour
    // le titre affiché dans la barre flottante.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = sections.find((s) => s.id === entry.target.id);
          if (section) setActiveSection(section);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" } // se déclenche vers le milieu de l'écran
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Fait remonter la page en douceur jusqu'au Hero (tout en haut).
  const scrollToHero = () => {
    document
      .getElementById("hero")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Barre de navigation principale : visible tout en haut de la page,
          elle disparaît en fondu dès qu'on commence à scroller. */}
      <header
        className={`absolute inset-x-0 top-0 z-40 transition-opacity duration-300 ${
          scrolled ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-6 md:px-16">
          <a
            href="#hero"
            aria-label="Retour à l'accueil"
            className="flex items-center justify-center rounded-lg p-1"
          >
            <Image
              src="/images/logo.svg"
              alt="Logo Livre Moi"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </a>

          <button
            type="button"
            onClick={scrollToHero}
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-brand-white/90"
          >
            <span className="h-2 w-2 rounded-full bg-brand-pink" />
            <span className="hidden sm:inline">La solution LM</span>
          </button>

          <nav className="hidden items-center gap-6 text-sm text-brand-white/70 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition hover:text-brand-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Barre de navigation flottante : cachée par défaut, elle apparaît
          en position fixe dès qu'on scrolle vers le bas et reste visible en
          permanence. Un clic dessus ramène en haut de la page. */}
      <div
        className={`fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-all duration-300 ${
          scrolled
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-6 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={scrollToHero}
          className="flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-brand-bg/90 px-5 py-2.5 text-left shadow-lg shadow-black/40 backdrop-blur"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-pink" />
          <span className="truncate text-sm">
            <span className="font-semibold text-brand-white">
              {activeSection.title}
            </span>
            {activeSection.subtitle && (
              <span className="ml-2 hidden text-brand-white/50 sm:inline">
                {activeSection.subtitle}
              </span>
            )}
          </span>
        </button>
      </div>
    </>
  );
}
