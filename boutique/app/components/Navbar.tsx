"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [replie, setReplie] = useState(false);
  const [actif, setActif] = useState(false);
  const [titre, setTitre] = useState("");
  const [sous, setSous] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setReplie(window.scrollY > window.innerHeight * 0.65);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const veilleur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (!e.isIntersecting) return;
          const t = (e.target as HTMLElement).dataset.titre || "";
          const s = (e.target as HTMLElement).dataset.sous || "";
          setTitre(t);
          setSous(s);
          setActif(t !== "");
        });
      },
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
    );

    document
      .querySelectorAll("[data-section]")
      .forEach((el) => veilleur.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      veilleur.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-100 pointer-events-none
        px-3 py-3 sm:px-8 sm:py-5.5
        ${actif ? "navbar-actif" : ""}
        ${replie ? "navbar-hide" : ""}
      `}
    >
      {/* ============================================================
          MOBILE : deux lignes, tout compact
          ============================================================ */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        {/* Ligne 1 : logo + liens */}
        <div className="flex items-center justify-between gap-2">
          <div className="navbar-fade shrink-0 w-8 h-8 rounded-[10px] bg-linear-[150deg] from-[#1B1233] to-[#0D0A1C] border border-brand-pink/35 flex items-center justify-center">
            <img src="/favicon.svg" alt="logo" className="w-4.5 h-4.5" />
          </div>

          <nav className="navbar-fade pointer-events-auto flex items-center gap-1.5 text-[11px] leading-none min-w-0">
            <a
              href="/vision"
              className="text-brand-white no-underline opacity-90 hover:opacity-100 hover:text-brand-pink-light whitespace-nowrap"
            >
              Ce que nous construisons
            </a>
            <em className="text-brand-pink not-italic">·</em>
            <a
              href="/partenaire-agree-lm.html"
              className="text-brand-white no-underline opacity-90 hover:opacity-100 hover:text-brand-pink-light whitespace-nowrap"
            >
              Partenaire agréé LM
            </a>
          </nav>
        </div>

        {/* Ligne 2 : pastille centrée */}
        <div className="flex items-center justify-center gap-2 min-w-0">
          <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[rgba(18,12,34,0.85)] border border-brand-pink/30 backdrop-blur-[10px] text-[11px] font-medium whitespace-nowrap">
            <i className="w-2 h-2 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.9)]" />
            La solution LM
          </div>

          {actif && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="nav-trait w-px h-5 bg-brand-white/45 rotate-20 origin-center shrink-0" />
              <div className="nav-suite max-w-[140px] min-w-0">
                <b className="block text-[11px] font-semibold leading-tight truncate">
                  {titre}
                </b>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          DESKTOP : disposition 3 colonnes d'origine
          ============================================================ */}
      <div className="hidden lg:flex items-start justify-between">
        <div className="navbar-fade w-10.5 h-10.5 rounded-[13px] bg-linear-[150deg] from-[#1B1233] to-[#0D0A1C] border border-brand-pink/35 flex items-center justify-center">
          <img src="/favicon.svg" alt="logo" className="w-6 h-6" />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className="pointer-events-auto flex items-center gap-2.5 px-5 py-2.25 rounded-full bg-[rgba(18,12,34,0.85)] border border-brand-pink/30 backdrop-blur-[10px] text-sm font-medium whitespace-nowrap">
            <i className="w-2.5 h-2.5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.9)]" />
            La solution LM
          </div>
          <div className="nav-trait w-px h-8.5 bg-brand-white/45 rotate-20 origin-center" />
          <div className="nav-suite">
            <b className="block text-[15px] font-semibold leading-tight">
              {titre}
            </b>
            <span className="block text-xs text-brand-slate leading-snug">
              {sous}
            </span>
          </div>
        </div>

        <nav className="navbar-fade pointer-events-auto flex items-center gap-3 text-[14.5px] pt-2.25">
          <a
            href="/vision"
            className="pointer-events-auto text-brand-white no-underline opacity-90 hover:opacity-100 hover:text-brand-pink-light cursor-pointer"
          >
            Ce que nous construisons
          </a>
          <em className="text-brand-pink not-italic">·</em>
          <a
            href="/partenaire-agree-lm.html"
            className="pointer-events-auto text-brand-white no-underline opacity-90 hover:opacity-100 hover:text-brand-pink-light cursor-pointer"
          >
            Partenaire agréé LM
          </a>
        </nav>
      </div>
    </header>
  );
}