"use client";

import { useEffect, useRef } from "react";

const CRETES = [0.117, 0.351, 0.595, 0.842];

export default function HowItWorksWave() {
  const pisteRef = useRef<HTMLDivElement>(null);
  const vagueRef = useRef<SVGPathElement>(null);
  const curseurRef = useRef<SVGGElement>(null);
  const foyerRef = useRef<SVGCircleElement>(null);
  const pilulesRef = useRef<(SVGGElement | null)[]>([]);
  const halosRef = useRef<(SVGCircleElement | null)[]>([]);
  const rayonsRef = useRef<(SVGLineElement | null)[]>([]);
  const cycleRef = useRef<HTMLSpanElement>(null);
  const fixeRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const longueurRef = useRef(0);

  useEffect(() => {
    const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vague = vagueRef.current;
    const piste = pisteRef.current;
    if (!vague || !piste) return;

    longueurRef.current = vague.getTotalLength();
    vague.style.strokeDasharray = String(longueurRef.current);
    vague.style.strokeDashoffset = String(longueurRef.current);

    const borne = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    const dessine = () => {
      const r = piste.getBoundingClientRect();
      const course = piste.offsetHeight - window.innerHeight;
      const p = course > 0 ? borne(-r.top / course) : 0;
      const L = longueurRef.current;

      const av = borne(p / 0.55);
      vague.style.strokeDashoffset = String(L * (1 - av));
      const pt = vague.getPointAtLength(L * av);
      curseurRef.current?.setAttribute("transform", `translate(${pt.x},${pt.y})`);
      if (curseurRef.current)
        curseurRef.current.style.opacity = av >= 1 ? "0" : "1";

      CRETES.forEach((c, i) => {
        const a = borne((av - c) / 0.07);
        const h = halosRef.current[i];
        if (h) {
          h.style.opacity = String(a * (1 - borne((av - c - 0.1) / 0.06)));
          h.setAttribute("r", String(9 + a * 15));
        }
        const b = borne((av - c - 0.045) / 0.075);
        const pi = pilulesRef.current[i];
        if (pi) {
          pi.style.opacity = String(b);
          pi.style.transform = `translateY(${26 * (1 - b)}px) scale(${0.86 + 0.14 * b})`;
        }
      });

      const cv = borne((p - 0.55) / 0.15);
      rayonsRef.current.forEach((l, i) => {
        if (l) l.style.opacity = String(borne((cv - i * 0.08) / 0.5));
      });
      if (foyerRef.current) foyerRef.current.style.opacity = String(cv);

      // Une seule phrase reste ("Rejoindre la solution LM") : plus de
      // cycle à 3 temps (0/0.34/0.67), elle apparaît dès que ph > 0, comme
      // .fixe juste à côté.
      const ph = borne((p - 0.7) / 0.3);
      const actif = ph > 0 ? 0 : -1;
      if (cycleRef.current) {
        Array.from(cycleRef.current.children).forEach((m, i) => {
          (m as HTMLElement).classList.toggle("actif", i === actif);
        });
      }
      if (fixeRef.current)
        fixeRef.current.classList.toggle("actif", ph > 0);
      if (ctaRef.current)
        ctaRef.current.classList.toggle("actif", ph > 0.72);
    };

    if (calme) {
      vague.style.strokeDashoffset = "0";
      if (curseurRef.current) curseurRef.current.style.opacity = "0";
      if (foyerRef.current) foyerRef.current.style.opacity = "1";
      halosRef.current.forEach((h) => h && (h.style.opacity = "0"));
      pilulesRef.current.forEach((p) => {
        if (p) {
          p.style.opacity = "1";
          p.style.transform = "none";
        }
      });
      rayonsRef.current.forEach((l) => l && (l.style.opacity = "1"));
      if (cycleRef.current)
        Array.from(cycleRef.current.children).forEach((m, i) =>
          (m as HTMLElement).classList.toggle("actif", i === 0)
        );
      fixeRef.current?.classList.add("actif");
      ctaRef.current?.classList.add("actif");
      return;
    }

    let enAttente = false;
    const onScroll = () => {
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(() => {
        dessine();
        enAttente = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={pisteRef} className="piste-vague" id="piste-vague">
      <div className="cadre-vague">
        <div className="w-full max-w-[1500px] mx-auto">
          <svg viewBox="0 0 1440 620" aria-hidden="true">
            <defs>
              <linearGradient id="degrade-vague" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EC0C8C" />
                <stop offset="40%" stopColor="#5B34C9" />
                <stop offset="100%" stopColor="#3A1D8A" />
              </linearGradient>
              <linearGradient id="degrade-rayon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B6BE8" stopOpacity=".15" />
                <stop offset="100%" stopColor="#EC0C8C" stopOpacity=".95" />
              </linearGradient>
              <radialGradient id="lueur">
                <stop offset="0%" stopColor="#FF63BE" stopOpacity=".95" />
                <stop offset="45%" stopColor="#EC0C8C" stopOpacity=".45" />
                <stop offset="100%" stopColor="#EC0C8C" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Les rayons partent maintenant des crêtes de la vague,
                pas des pilules — ils s'appuient sur la courbe au lieu
                de la traverser. */}
            <g>
              {([[300, 225], [560, 210], [830, 200], [1105, 192]] as const).map(
                ([x, y], i) => (
                  <line
                    key={i}
                    ref={(el) => { rayonsRef.current[i] = el; }}
                    className="rayon"
                    x1={x}
                    y1={y}
                    x2="720"
                    y2="560"
                    stroke="url(#degrade-rayon)"
                    strokeWidth="1.6"
                  />
                )
              )}
            </g>

            <path
              ref={vagueRef}
              d="M170,300 C220,300 250,225 300,225 C350,225 380,290 430,290
                 C480,290 510,210 560,210 C610,210 640,280 690,280
                 C745,280 780,200 830,200 C885,200 915,272 970,272
                 C1025,272 1055,192 1105,192 C1160,192 1225,268 1280,268"
              fill="none"
              stroke="url(#degrade-vague)"
              strokeWidth="1.5"
            />

            <g ref={curseurRef}>
              <circle r="16" fill="rgba(236,12,140,.16)" />
              <circle r="9" fill="#EC0C8C" stroke="#FFC2E2" strokeWidth="1.6" />
            </g>

            <g>
              {([[300, 225], [560, 210], [830, 200], [1105, 192]] as const).map(
                ([cx, cy], i) => (
                  <circle
                    key={i}
                    ref={(el) => { halosRef.current[i] = el; }}
                    className="halo-crete"
                    cx={cx}
                    cy={cy}
                    r="9"
                    fill="none"
                    stroke="#FFC2E2"
                    strokeWidth="1.6"
                  />
                )
              )}
            </g>

            <g>
              <g ref={(el) => { pilulesRef.current[0] = el; }} className="pilule-vague">
                <rect x="242" y="108" width="116" height="46" rx="23" strokeWidth="1" />
                <text x="300" y="138" textAnchor="middle">Créer</text>
              </g>
              <g ref={(el) => { pilulesRef.current[1] = el; }} className="pilule-vague">
                <rect x="474" y="108" width="172" height="46" rx="23" strokeWidth="1" />
                <text x="560" y="138" textAnchor="middle">Personnaliser</text>
              </g>
              <g ref={(el) => { pilulesRef.current[2] = el; }} className="pilule-vague">
                <rect x="762" y="108" width="136" height="46" rx="23" strokeWidth="1" />
                <text x="830" y="138" textAnchor="middle">Publier</text>
              </g>
              <g ref={(el) => { pilulesRef.current[3] = el; }} className="pilule-vague">
                <rect x="1024" y="108" width="162" height="46" rx="23" strokeWidth="1" />
                <text x="1105" y="138" textAnchor="middle">Commencer</text>
              </g>
            </g>

            <circle ref={foyerRef} cx="720" cy="560" r="50" fill="url(#lueur)" opacity="0" />
          </svg>

          <div className="text-center mt-5 min-h-[150px] flex flex-col items-center justify-start">
            <div className="flex items-baseline justify-center gap-5 flex-wrap text-[clamp(26px,3.1vw,41px)] font-semibold tracking-[-0.015em] min-h-[56px]">
              <span ref={cycleRef} className="mot-cycle">
                <b>Rejoindre la solution LM</b>
              </span>
              <span ref={fixeRef} className="fixe">sans affiliation</span>
            </div>
            <div ref={ctaRef} className="cta-vague mt-7.5">
              <span className="inline-block rounded-2xl bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))] p-px">
                <a
                  href="#"
                  className="flex items-center gap-2 rounded-[14px] bg-[#0a0e1c] px-[18px] py-4 text-sm font-semibold text-brand-white no-underline transition hover:opacity-90"
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
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}