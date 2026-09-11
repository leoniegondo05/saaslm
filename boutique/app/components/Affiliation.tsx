"use client";

import { useEffect, useRef } from "react";
import ScrollReveal from "./ScrollReveal";

export default function Affiliation() {
  const grilleRef = useRef<SVGGElement>(null);
  const filsRef = useRef<SVGGElement>(null);
  const icoRef = useRef<SVGGElement>(null);

  useEffect(() => {
    // Grille de 20 immeubles
    if (grilleRef.current) {
      let html = "";
      for (let l = 0; l < 5; l++) {
        for (let c = 0; c < 4; c++) {
          const x = 446 + c * 56;
          const y = 284 + l * 55;
          if (c === 1 && l === 2) continue;
          html += `<rect x="${x}" y="${y}" width="40" height="40" rx="8" fill="rgba(250,247,252,.03)" stroke="rgba(250,247,252,.14)"/>
                   <use href="#immeuble" x="${x + 7}" y="${y + 7}" width="26" height="26"/>`;
        }
      }
      grilleRef.current.innerHTML = html;
    }

    const liste = [
      { x: 752, y: 362, r: -22 }, { x: 840, y: 302, r: -14 }, { x: 924, y: 255, r: -8 },
      { x: 1026, y: 192, r: 0 }, { x: 1119, y: 247, r: 9 }, { x: 1202, y: 306, r: 15 },
      { x: 1265, y: 353, r: 22 },
    ];
    if (filsRef.current) {
      filsRef.current.innerHTML = liste
        .map((p) => `<path class="trace affiliation-trace" d="M1016,516 L${p.x},${p.y + 22}"/>`)
        .join("");
    }
    if (icoRef.current) {
      icoRef.current.innerHTML = liste
        .map(
          (p, i) =>
            `<g class="icone-boutique affiliation-icon" style="transition-delay:${(0.5 + i * 0.09).toFixed(2)}s" transform="rotate(${p.r} ${p.x} ${p.y})">
              <rect x="${p.x - 21}" y="${p.y - 21}" width="42" height="42" rx="9" fill="rgba(236,12,140,.07)" stroke="rgba(236,12,140,.55)"/>
              <use href="#boutique" x="${p.x - 15}" y="${p.y - 13}" width="30" height="27"/>
            </g>`
        )
        .join("");
    }

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
      dataTitre="S'affilier, c'est grandir"
      dataSous="Une boutique choisit une entreprise agréée. Une entreprise agréée en accompagne plusieurs."
      className="py-33 px-7 max-w-[1500px] mx-auto"
    >
      <svg viewBox="0 0 1440 800" aria-hidden="true">
        <defs>
          <linearGradient id="fil-boutique" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EC0C8C" />
            <stop offset="100%" stopColor="#6D3FD6" />
          </linearGradient>
          <linearGradient id="verre" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#161C31" stopOpacity=".95" />
            <stop offset="100%" stopColor="#0A1020" stopOpacity=".8" />
          </linearGradient>
          <symbol id="boutique" viewBox="0 0 34 30">
            <path d="M4 10h26v17H4z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M2 4h30l2 6H0z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M9 14h16M9 19h16M9 24h16" stroke="currentColor" strokeWidth="2" />
          </symbol>
          <symbol id="immeuble" viewBox="0 0 30 30">
            <path d="M4 27V9l9-5v23M13 27V13l13 5v9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M7.5 13h2M7.5 18h2M17.5 20h2M21.5 21h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </symbol>
        </defs>

        <g transform="rotate(-8 244 352)">
          <rect x="126" y="305" width="236" height="95" rx="14" fill="url(#verre)" stroke="rgba(250,247,252,.14)" />
          <g color="#EC0C8C"><use href="#boutique" x="150" y="340" width="30" height="27" /></g>
          <text x="192" y="350" fill="#FAF7FC" fontSize="19" fontWeight="600">Evan store</text>
          <text x="192" y="368" fill="rgba(250,247,252,.55)" fontSize="10.5">Ancienneté : 1 an 3 mois</text>
          <text x="192" y="382" fill="rgba(250,247,252,.55)" fontSize="10.5">Secteur : Électronique &amp; accessoires</text>
        </g>

        <circle cx="231" cy="411" r="7" fill="#EC0C8C" />
        <path
          className="trace affiliation-trace"
          d="M231,411 C292,411 322,456 382,447 C442,438 462,412 506,411"
          fill="none"
          stroke="url(#fil-boutique)"
          strokeWidth="1.7"
        />

        <g color="rgba(250,247,252,.22)" ref={grilleRef} />
        <g color="#6D3FD6">
          <rect x="502" y="391" width="40" height="40" rx="8" fill="rgba(109,63,214,.10)" stroke="rgba(109,63,214,.55)" />
          <use href="#immeuble" x="509" y="398" width="26" height="26" />
        </g>

        <text x="226" y="748" fill="rgba(250,247,252,.75)" fontSize="15" textAnchor="end">Evan store</text>
        <circle cx="328" cy="742" r="21" fill="none" stroke="#EC0C8C" strokeWidth="2.4" />
        <circle cx="354" cy="742" r="21" fill="none" stroke="#6D3FD6" strokeWidth="2.4" />
        <text x="390" y="748" fill="rgba(250,247,252,.75)" fontSize="15">Company</text>

        <g stroke="rgba(255,194,226,.5)" strokeWidth="1.1" fill="none" ref={filsRef} />
        <g color="#EC0C8C" ref={icoRef} />

        <rect x="897" y="516" width="238" height="100" rx="14" fill="url(#verre)" stroke="rgba(250,247,252,.12)" />
        <g color="#6D3FD6"><use href="#immeuble" x="988" y="528" width="56" height="56" /></g>
        <text x="1016" y="600" fill="rgba(250,247,252,.72)" fontSize="9.5" textAnchor="middle" letterSpacing="0.4">
          COURSIERS : 15   ANCIENNETÉ : 5 ans
        </text>
        <text x="1016" y="612" fill="rgba(250,247,252,.72)" fontSize="9.5" textAnchor="middle" letterSpacing="0.4">
          LIEU : ADJAMÉ
        </text>
      </svg>
    </ScrollReveal>
  );
}