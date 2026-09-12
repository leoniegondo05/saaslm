"use client";

import { useEffect, useRef, useState } from "react";

export default function Reach() {
  const sectionRef = useRef<HTMLElement>(null);
  const arcsRef = useRef<SVGGElement>(null);
  const villesRef = useRef<SVGGElement>(null);
  const continentRef = useRef<SVGPathElement>(null);
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

  // ---- Construction du maillage ----
  useEffect(() => {
    // Coordonnées + hiérarchie des villes nommées.
    const VILLES: Record<
      string,
      { x: number; y: number; t: number; taille: "hub" | "principale" | "secondaire"; ancre?: string }
    > = {
      ABIDJAN:    { x: 260, y: 431, t: 11, taille: "hub" },
      ACCRA:      { x: 308, y: 427, t: 10, taille: "principale" },
      Lagos:      { x: 354, y: 417, t: 11, taille: "hub" },
      BAMAKO:     { x: 209, y: 345, t: 10, taille: "principale" },
      BISSAU:     { x: 113, y: 354, t: 10, taille: "secondaire", ancre: "gauche" },
      ALGER:      { x: 349, y: 62,  t: 11, taille: "hub" },
      KHARTOUM:   { x: 717, y: 317, t: 11, taille: "principale" },
      YAOUNDE:    { x: 457, y: 447, t: 10, taille: "principale" },
      Libreville: { x: 430, y: 488, t: 10, taille: "secondaire" },
      KAMPALA:    { x: 725, y: 489, t: 9,  taille: "secondaire" },
      NAIROBI:    { x: 778, y: 508, t: 10, taille: "hub" },
      KINSHASA:   { x: 505, y: 544, t: 10, taille: "principale" },
      LUANDA:     { x: 479, y: 596, t: 10, taille: "principale" },
      LUSAKA:     { x: 670, y: 673, t: 10, taille: "secondaire" },
      WINDHOEK:   { x: 528, y: 757, t: 8,  taille: "secondaire" },
    };

    const LIENS: [string, string][] = [
      ["ABIDJAN", "ACCRA"],
      ["ABIDJAN", "BAMAKO"],
      ["ABIDJAN", "BISSAU"],
      ["ABIDJAN", "Lagos"],
      ["ACCRA", "Lagos"],
      ["ACCRA", "YAOUNDE"],
      ["BAMAKO", "ALGER"],
      ["BAMAKO", "BISSAU"],
      ["Lagos", "YAOUNDE"],
      ["Lagos", "KINSHASA"],
      ["YAOUNDE", "Libreville"],
      ["Libreville", "LUANDA"],
      ["LUANDA", "WINDHOEK"],
      ["LUANDA", "LUSAKA"],
      ["LUSAKA", "KINSHASA"],
      ["LUSAKA", "NAIROBI"],
      ["KINSHASA", "KAMPALA"],
      ["KAMPALA", "NAIROBI"],
      ["NAIROBI", "KHARTOUM"],
      ["KHARTOUM", "ALGER"],
    ];

    // ---- Filtrage des points muets ----
    // On teste une grille de candidats et on ne garde que ceux
    // qui tombent À L'INTÉRIEUR de la silhouette du continent.
    const continent = continentRef.current;
    const muetsValides: [number, number][] = [];

    if (continent) {
      // Zone de la silhouette (bounding box du continent)
      const bbox = continent.getBBox();

      // Grille de candidats : un point tous les 30px, sur toute la bbox
      const pas = 30;
      const candidats: [number, number][] = [];
      for (let x = bbox.x + pas; x < bbox.x + bbox.width - pas; x += pas) {
        for (let y = bbox.y + pas; y < bbox.y + bbox.height - pas; y += pas) {
          candidats.push([x, y]);
        }
      }

      // On teste chaque candidat : est-il à l'intérieur du continent ?
      const svgEl = continent.ownerSVGElement;
      if (svgEl) {
        candidats.forEach(([x, y]) => {
          const pt = svgEl.createSVGPoint();
          pt.x = x;
          pt.y = y;
          try {
            if (continent.isPointInFill(pt)) {
              // On évite les points trop proches d'une ville nommée
              const tropProche = Object.values(VILLES).some((v) => {
                const dx = v.x - x;
                const dy = v.y - y;
                return Math.sqrt(dx * dx + dy * dy) < 30;
              });
              if (!tropProche) {
                muetsValides.push([x, y]);
              }
            }
          } catch {
            // isPointInFill peut échouer dans certains navigateurs
          }
        });
      }

      // On garde au hasard ~22 points pour ne pas surcharger
      for (let i = muetsValides.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [muetsValides[i], muetsValides[j]] = [muetsValides[j], muetsValides[i]];
      }
      muetsValides.length = Math.min(22, muetsValides.length);
    }

    let arcsHTML = "";
    let villesHTML = "";

    const T0 = 1.1;
    const ECART_ARCS = 0.14;
    const DUREE_ARC = 0.85;

    const villesVues = new Map<string, number>();

    LIENS.forEach(([a, b], i) => {
      const va = VILLES[a];
      const vb = VILLES[b];
      if (!va || !vb) return;

      const tArc = T0 + i * ECART_ARCS;

      const mx = (va.x + vb.x) / 2;
      const my = (va.y + vb.y) / 2;
      const dx = vb.x - va.x;
      const dy = vb.y - va.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const cx = mx - (dy / d) * d * 0.18;
      const cy = my + (dx / d) * d * 0.18;

      const epaisseur = d > 300 ? 1.4 : d > 180 ? 1.1 : 0.9;
      const opacite = d > 300 ? 0.75 : d > 180 ? 0.6 : 0.5;

      arcsHTML += `<path class="arc"
        d="M${va.x},${va.y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${vb.x},${vb.y}"
        stroke="rgba(196,150,240,${opacite})"
        stroke-width="${epaisseur}"
        fill="none"
        style="animation-delay:${tArc.toFixed(2)}s"/>`;

      const tVille = tArc + DUREE_ARC * 0.85;
      if (!villesVues.has(b)) {
        villesVues.set(b, tVille);
      }
    });

    villesVues.forEach((delai, nom) => {
      const v = VILLES[nom];
      if (!v) return;

      const r = v.taille === "hub" ? 7 : v.taille === "principale" ? 5 : 4;
      const ancre = v.ancre === "gauche" ? "end" : "middle";
      const lx = v.ancre === "gauche" ? v.x - 10 : v.x;
      const ly = v.ancre === "gauche" ? v.y + v.t + 6 : v.y + v.t + 6;

      villesHTML += `<g class="ville" style="animation-delay:${delai.toFixed(2)}s">
        <circle cx="${v.x}" cy="${v.y}" r="${r}" fill="#EC0C8C"/>
        <text x="${lx}" y="${ly}" fill="#FAF7FC" font-size="${v.t}"
              font-weight="600" text-anchor="${ancre}" letter-spacing=".5">${nom}</text>
      </g>`;
    });

    const tMuets = T0 + LIENS.length * ECART_ARCS + 0.4;
    muetsValides.forEach(([x, y], i) => {
      villesHTML += `<circle class="ville-muette"
        style="animation-delay:${(tMuets + i * 0.03).toFixed(2)}s"
        cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#EC0C8C" opacity=".85"/>`;
    });

    if (arcsRef.current) arcsRef.current.innerHTML = arcsHTML;
    if (villesRef.current) villesRef.current.innerHTML = villesHTML;

    requestAnimationFrame(() => {
      document.querySelectorAll<SVGPathElement>(".arc").forEach((p) => {
        try {
          p.style.setProperty("--l", String(p.getTotalLength()));
        } catch {}
      });
    });
  }, [visible]);

  return (
    <section
      ref={sectionRef}
      data-section
      data-titre="Un continent, des millions d'opportunités"
      data-sous="Nous construisons les connexions."
      className={`reach-section py-33 px-7 max-w-[1500px] mx-auto ${
        visible ? "is-visible" : ""
      }`}
    >
      {/* <div className="titre-carte reach-titre">
        <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold tracking-[-0.02em]">
          Un continent, des millions d&apos;opportunités
        </h2>
        <p className="text-brand-slate mt-3 text-[17px]">
          Nous construisons les connexions
        </p>
      </div> */}

      <div className="carte-zone">
        <svg viewBox="0 0 1000 950" aria-hidden="true">
          <g className="reach-continent">
            <path
              ref={continentRef}
              d="M237,74 L440,62 L565,117 L691,128 L724,143 L784,263 L859,357
                 L963,354 L887,469 L816,540 L811,573 L829,663 L725,794 L705,841
                 L565,898 L545,888 L495,760 L466,670 L479,596 L467,563 L462,549
                 L434,446 L381,443 L326,422 L260,431 L174,420 L143,394 L90,321
                 L108,281 L133,212 L189,137 Z"
              fill="#111726"
              stroke="rgba(250,247,252,.13)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>

          <g fill="none" strokeWidth="1.2" ref={arcsRef} />
          <g ref={villesRef} />

          <circle
            className="reach-hub-halo"
            cx="260" cy="431" r="22"
            fill="#EC0C8C"
            opacity=".22"
          />
          <circle
            className="reach-hub"
            cx="260" cy="431" r="11"
            fill="#EC0C8C"
          />
          <text
            className="reach-hub-label"
            x="260" y="470"
            fill="#FAF7FC" fontSize="21" fontWeight="600"
            textAnchor="middle" letterSpacing="1"
          >
            ABIDJAN
          </text>
        </svg>
      </div>
    </section>
  );
}