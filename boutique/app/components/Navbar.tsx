"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [replie, setReplie] = useState(false);
  const [actif, setActif] = useState(false);
  const [titre, setTitre] = useState("");
  const [sous, setSous] = useState("");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [lienSurvole, setLienSurvole] = useState<number | null>(null);

  const [dotArc, setDotArc] = useState(false);
  const [pillOpen, setPillOpen] = useState(false);

  // ---- Animation d'entrée du point rose + pastille ----
  useEffect(() => {
    const t1 = setTimeout(() => setDotArc(true), 80);
    const t2 = setTimeout(() => setPillOpen(true), 80 + 1350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // ---- Scroll + IntersectionObserver ----
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

  // ---- Fermeture au clavier (Échap) + blocage du scroll ----
  useEffect(() => {
    if (!menuOuvert) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOuvert(false);
    };
    document.addEventListener("keydown", onKey);

    // Bloque le scroll de la page quand le menu est ouvert
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
    };
  }, [menuOuvert]);

  const dotClasses = (size: string) =>
    `${size} rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.9)] shrink-0 nav-dot relative ${
      dotArc ? "nav-dot-arc" : ""
    }`;

  const pillClasses = (extra: string) =>
    `nav-pill flex items-center rounded-full font-medium whitespace-nowrap pointer-events-auto ${extra} ${
      pillOpen ? "nav-pill-open" : ""
    }`;

  // Liste des liens (réutilisée pour le menu mobile)
  const liens = [
    { href: "/vision", label: "Ce que nous construisons" },
    { href: "/partenaire-agree", label: "Partenaire agréé LM" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-100 pointer-events-none
          px-3 py-3 sm:px-8 sm:py-5.5
          ${actif ? "navbar-actif" : ""}
          ${replie ? "navbar-hide" : ""}
        `}
      >
        {/* ============================================================
            MOBILE
            ============================================================ */}
        <div className="flex flex-col gap-2.5 lg:hidden">
          {/* Ligne 1 : logo + burger */}
          <div className="flex items-center justify-between gap-2">
            {/* max-w-none : sans ça, le reset Tailwind (img{max-width:100%})
                écrase la largeur voulue (w-11) par celle, plus petite, du
                conteneur parent — c'est ce qui rendait le logo plus petit
                que prévu. */}
            <div className="navbar-fade shrink-0 w-15 h-15 rounded-[10px] flex items-center justify-center cursor-pointer pointer-events-auto" >
              <img src="/favicon.svg" alt="logo" className="w-15 h-15 max-w-none" />
            </div>

            <button
              type="button"
              aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOuvert}
              onClick={() => setMenuOuvert((v) => !v)}
              className={`nav-burger pointer-events-auto shrink-0 w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md ${
                menuOuvert ? "is-open" : ""
              }`}
            >
              <span className="nav-burger-line" />
              <span className="nav-burger-line" />
              <span className="nav-burger-line" />
            </button>
          </div>

          {/* Ligne 2 : pastille centrée — sur sa propre ligne, indépendante
              du titre de section (voir ci-dessous), pour qu'elle reste
              visuellement centrée même quand un titre apparaît : les deux
              partageaient auparavant un seul justify-content:center, donc
              c'est le GROUPE (pastille + titre) qui se centrait, pas la
              pastille elle-même, qui se retrouvait décalée à gauche dès
              qu'un titre de section s'affichait à côté. */}
          <div className="flex items-center justify-center">
            <div className={pillClasses("gap-1.5 px-2.5 py-1.5 text-[11px]")}>
              <i className={dotClasses("w-2 h-2")} />
              <span className="nav-pill-text">La solution LM</span>
            </div>
          </div>

          {/* Ligne 3 : titre de section, centré lui aussi, sous la pastille */}
          {actif && (
            <div className="flex items-center justify-center gap-2 min-w-0">
              <div className="nav-trait w-px h-5 bg-brand-white/45 rotate-20 origin-center shrink-0" />
              <div className="nav-suite max-w-[220px] min-w-0">
                <b className="block text-[11px] font-semibold leading-tight truncate text-center">
                  {titre}
                </b>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            DESKTOP
            ============================================================ */}
        {/* grid 1fr/auto/1fr plutôt que flex+justify-between : avec
            justify-between, la pastille (élément du milieu) ne se centre
            que si le logo et les liens de droite font exactement la même
            largeur — comme les liens sont bien plus larges que le logo,
            l'espace se répartissait à parts égales et poussait toute la
            pastille vers la gauche. Deux colonnes 1fr identiques de chaque
            côté garantissent que la colonne du milieu reste au centre réel
            de la barre, quelle que soit la largeur du logo ou des liens. */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-start">
          <div className="navbar-fade w-13 h-13 flex items-center justify-center justify-self-start">
            <img src="/favicon.svg" alt="logo" className="w-10 h-10 max-w-none" />
          </div>

          <div className="flex items-center gap-4 pt-1 justify-self-center">
            <div className={pillClasses("gap-2.5 px-5 py-2.25 text-sm")}>
              <i className={dotClasses("w-2.5 h-2.5")} />
              <span className="nav-pill-text">La solution LM</span>
            </div>
            <div className="nav-trait w-px h-8.5 bg-brand-white/45 rotate-20 origin-center" />
            <div className="nav-suite">
              <b className="block text-[15px] font-semibold leading-tight">{titre}</b>
              <span className="block text-xs text-brand-slate leading-snug">
                {sous}
              </span>
            </div>
          </div>

          <nav className="navbar-fade pointer-events-auto flex items-center gap-3 text-[14.5px] pt-2.25 justify-self-end">
            <a
              href="/vision"
              className="pointer-events-auto text-brand-white no-underline opacity-90 hover:opacity-100 hover:text-brand-pink-light cursor-pointer"
            >
              Ce que nous construisons
            </a>
            <em className="text-brand-pink not-italic">·</em>
            <a
              href="/partenaire-agree"
              className="pointer-events-auto text-brand-white no-underline opacity-90 hover:opacity-100 hover:text-brand-pink-light cursor-pointer"
            >
              Partenaire agréé LM
            </a>
          </nav>
        </div>
      </header>

      {/* ============================================================
          MENU LATÉRAL DROIT (mobile uniquement)
          ============================================================ */}
      {/* Overlay */}
      <div
        className={`nav-menu-overlay lg:hidden ${menuOuvert ? "is-open" : ""}`}
        onClick={() => setMenuOuvert(false)}
        aria-hidden={!menuOuvert}
      />

      {/* Panneau */}
      <aside
        className={`nav-menu-panel lg:hidden ${menuOuvert ? "is-open" : ""}`}
        aria-hidden={!menuOuvert}
      >

        <nav className="nav-menu-list  mt-15" onMouseLeave={() => setLienSurvole(null)}>
          {/* Le point rose qui se déplace verticalement */}
          <span
            className={`nav-menu-dot ${
              lienSurvole !== null ? "is-visible" : ""
            }`}
            style={{
              top: lienSurvole !== null ? `${lienSurvole * 56 + 28}px` : "28px",
            }}
          />

          {liens.map((lien, i) => (
            <a
              key={lien.href}
              href={lien.href}
              className={`nav-menu-link ${
                lienSurvole === i ? "actif" : ""
              }`}
              onMouseEnter={() => setLienSurvole(i)}
              onFocus={() => setLienSurvole(i)}
              onClick={() => setMenuOuvert(false)}
            >
              {lien.label}
            </a>
          ))}
        </nav>

        <div className="nav-menu-footer">
          <span className="brand">
            LIIVRE <em>MOI</em>
          </span>
          <span className="tagline">
            Le commerce digital orchestré de bout en bout.
          </span>
        </div>
      </aside>
    </>
  );
}