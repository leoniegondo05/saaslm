"use client";

import { useEffect, useRef } from "react";
import ScrollReveal from "./ScrollReveal";

export default function Reach() {
  const arcsRef = useRef<SVGGElement>(null);
  const villesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const abidjan = { x: 260, y: 431 };
    const villes = [
      { n: "ALGER", x: 349, y: 62, t: 11 },
      { n: "BISSAU", x: 113, y: 354, t: 11, cote: "gauche" },
      { n: "BAMAKO", x: 209, y: 345, t: 11 },
      { n: "ACCRA", x: 308, y: 427, t: 11 },
      { n: "Lagos", x: 354, y: 417, t: 11 },
      { n: "KHARTOUM", x: 717, y: 317, t: 11 },
      { n: "YAOUNDE", x: 457, y: 447, t: 11 },
      { n: "Libreville", x: 430, y: 488, t: 10 },
      { n: "KAMPALA", x: 725, y: 489, t: 8 },
      { n: "NAIROBI", x: 778, y: 508, t: 8 },
      { n: "KINSHASA", x: 505, y: 544, t: 11 },
      { n: "LUANDA", x: 479, y: 596, t: 11 },
      { n: "LUSAKA", x: 670, y: 673, t: 11 },
      { n: "WINDHOEK", x: 528, y: 757, t: 8 },
    ];
    const muets = [
      [513, 71], [439, 151], [479, 206], [680, 234], [766, 226], [898, 151],
      [919, 248], [994, 340], [901, 355], [957, 499], [981, 587], [892, 641],
      [944, 672], [843, 671], [845, 763], [1081, 642], [684, 51], [432, 261],
      [573, 327], [661, 316], [795, 346], [715, 366],
    ];

    let arcsHTML = "";
    let ptsHTML = "";

    villes.forEach((v, i) => {
      const mx = (abidjan.x + v.x) / 2;
      const my = (abidjan.y + v.y) / 2;
      const dx = v.x - abidjan.x;
      const dy = v.y - abidjan.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const cx = mx - (dy / d) * d * 0.17;
      const cy = my + (dx / d) * d * 0.17;
      arcsHTML += `<path class="arc" d="M${abidjan.x},${abidjan.y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${v.x},${v.y}" stroke="rgba(196,150,240,.6)" style="transition-delay:${(i * 0.09).toFixed(2)}s"/>`;

      const ancre = v.cote === "gauche" ? "end" : "middle";
      const lx = v.cote === "gauche" ? v.x - 10 : v.x;
      const ly = v.cote === "gauche" ? v.y + 4 : v.y + v.t + 6;
      ptsHTML += `<g class="ville" style="transition-delay:${(0.5 + i * 0.07).toFixed(2)}s">
        <circle cx="${v.x}" cy="${v.y}" r="5" fill="#EC0C8C"/>
        <text x="${lx}" y="${ly}" fill="#FAF7FC" font-size="${v.t}" font-weight="600" text-anchor="${ancre}" letter-spacing=".5">${v.n}</text>
      </g>`;
    });

    muets.forEach((p, i) => {
      ptsHTML += `<circle class="ville" style="transition-delay:${(0.8 + i * 0.03).toFixed(2)}s" cx="${p[0]}" cy="${p[1]}" r="4" fill="#EC0C8C" opacity=".85"/>`;
    });

    if (arcsRef.current) arcsRef.current.innerHTML = arcsHTML;
    if (villesRef.current) villesRef.current.innerHTML = ptsHTML;

    requestAnimationFrame(() => {
      document.querySelectorAll<SVGPathElement>(".trace, .arc").forEach((p) => {
        try {
          p.style.setProperty("--l", String(p.getTotalLength()));
        } catch {}
      });
    });
  }, []);

  return (
    <ScrollReveal
      dataSection
      dataTitre="Un continent, des millions d'opportunités"
      dataSous="Nous construisons les connexions."
      className="py-33 px-7 max-w-[1500px] mx-auto"
    >
      <div className="titre-carte">
        <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold tracking-[-0.02em]">
          Un continent, des millions d&apos;opportunités
        </h2>
        <p className="text-brand-slate mt-3 text-[17px]">
          Nous construisons les connexions
        </p>
      </div>
      <div className="carte-zone">
        <svg viewBox="0 0 1000 950" aria-hidden="true">
          <path
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
          <path
            d="M934,628 C948,650 952,700 944,742 C938,776 922,792 910,784
               C898,776 898,742 904,706 C910,668 920,632 934,628 Z"
            fill="#111726"
            stroke="rgba(250,247,252,.13)"
            strokeWidth="1.2"
          />

          <g fill="none" strokeWidth="1.2" ref={arcsRef} />
          <g ref={villesRef} />

          <circle cx="260" cy="431" r="11" fill="#EC0C8C" className="reach-hub-glow" />
          <circle cx="260" cy="431" r="22" fill="#EC0C8C" opacity=".22" />
          <text x="260" y="470" fill="#FAF7FC" fontSize="21" fontWeight="600" textAnchor="middle" letterSpacing="1">
            ABIDJAN
          </text>
        </svg>
      </div>
    </ScrollReveal>
  );
}