"use client";

import { useEffect, useRef, useState } from "react";

const NB_VUES = 3;
const DELAI_REPRISE_AUTO = 4000;
const INTERVALLE_AUTO = 4500;

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [autoActif, setAutoActif] = useState(true);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  // ---- IntersectionObserver : déclenche l'entrée en cascade ----
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
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    oeil.observe(el);
    return () => oeil.disconnect();
  }, []);

  // ---- Une fois visible : on calcule la longueur de chaque courbe ----
  useEffect(() => {
    if (!visible) return;
    requestAnimationFrame(() => {
      document
        .querySelectorAll<SVGPathElement>(".feat-curve")
        .forEach((p) => {
          try {
            p.style.setProperty("--flow-len", String(p.getTotalLength()));
          } catch {}
        });
    });
  }, [visible]);

  // ---- Rotation automatique ----
  useEffect(() => {
    if (!autoActif) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % NB_VUES);
    }, INTERVALLE_AUTO);
    return () => clearInterval(id);
  }, [autoActif]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const programmerReprise = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAutoActif(true), DELAI_REPRISE_AUTO);
  };

  const changerVue = (delta: number) => {
    setIndex((i) => (i + delta + NB_VUES) % NB_VUES);
    setAutoActif(false);
    programmerReprise();
  };

  const allerA = (i: number) => {
    setIndex(i);
    setAutoActif(false);
    programmerReprise();
  };

  // ---- Swipe tactile ----
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    changerVue(dx < 0 ? 1 : -1);
  };

  // ---- Swipe souris ----
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    pointerRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointerRef.current) return;
    const dx = e.clientX - pointerRef.current.x;
    const dy = e.clientY - pointerRef.current.y;
    pointerRef.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    changerVue(dx < 0 ? 1 : -1);
  };

  return (
    <section
      ref={sectionRef}
      data-section
      data-titre="Vos flux financiers se simplifient"
      data-sous="Encaissé automatiquement, par les moyens de paiement locaux."
      className={`feat-section py-33 px-7 max-w-[1500px] mx-auto ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-center">
        {/* ==================== SVG ==================== */}
        <svg viewBox="0 0 900 620" aria-hidden="true">
          <defs>
            <symbol id="billet" viewBox="0 0 26 14">
              <rect x="1" y="1" width="24" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="13" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 5v4M21 5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </symbol>
            <symbol id="globe" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="15" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <ellipse cx="17" cy="17" rx="6.4" ry="15" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M2.6 12h28.8M2.6 22h28.8M17 2v30" stroke="currentColor" strokeWidth="1.7" />
            </symbol>
            <symbol id="boutique-feat" viewBox="0 0 34 30">
              <path d="M4 10h26v17H4z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M2 4h30l2 6H0z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M9 14h16M9 19h16M9 24h16" stroke="currentColor" strokeWidth="2" />
            </symbol>
            <symbol id="immeuble-feat" viewBox="0 0 30 30">
              <path d="M4 27V9l9-5v23M13 27V13l13 5v9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M7.5 13h2M7.5 18h2M17.5 20h2M21.5 21h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </symbol>
          </defs>

          {/* ---------- Ligne 1 (haut) ---------- */}
          <text className="feat-icon feat-d-1" x="20" y="46" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">
            AUTRE PAYS
          </text>
          <g className="feat-icon feat-d-1" color="#EC0C8C">
            <rect x="42" y="76" width="56" height="56" rx="12" fill="rgba(236,12,140,.08)" stroke="rgba(236,12,140,.45)" />
            <use href="#boutique-feat" x="55" y="90" width="30" height="27" />
          </g>
          <g className="feat-icon feat-d-2" color="#FAF7FC">
            <use href="#globe" x="53" y="152" width="34" height="34" />
          </g>

          <text className="feat-icon feat-d-3" x="490" y="46" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">
            CÔTE D&apos;IVOIRE
          </text>
          <g className="feat-icon feat-d-3" color="#8B6BE8">
            <rect x="540" y="76" width="56" height="56" rx="12" fill="rgba(109,63,214,.10)" stroke="rgba(109,63,214,.5)" />
            <use href="#immeuble-feat" x="554" y="90" width="28" height="28" />
          </g>
          <g className="feat-icon feat-d-4" color="#FAF7FC">
            <use href="#globe" x="551" y="152" width="34" height="34" />
          </g>

          <text className="feat-icon feat-d-2" x="250" y="126" fill="rgba(250,247,252,.34)" fontSize="30">
            Cash
          </text>

          {/* Courbe 1 : se dessine de gauche à droite */}
          <path
            id="flux-1"
            className="flow-path feat-curve delay-1"
            d="M170,208 C244,208 266,132 340,128 C414,124 428,166 502,162"
            fill="none"
            stroke="#4C8B4A"
            strokeWidth="2.4"
          />
          {/* x="-13" y="-7" (≈ -width/2, -height/2) n'est PAS une position
              absolue : animateMotion ADDITIONNE la coordonnée courante du
              chemin à ce x/y — c'est ce qui centre le billet sur le point
              du tracé (au lieu d'y placer son coin haut-gauche). Y mettre
              une position absolue casse le centrage une fois l'animation
              lancée. Le fondu d'apparition (.feat-billet en CSS) applique
              le même transition-delay à tous les billets ; on le
              surcharge ici par billet en ligne pour le faire coïncider
              avec le "begin" propre à chacun. */}
          <g color="rgba(250,247,252,.6)">
            {[0, 1.5, 2.9].map((begin, i) => (
              <use
                key={i}
                className="feat-billet"
                href="#billet"
                width="26"
                height="14"
                x="-13"
                y="-7"
                style={{ transitionDelay: `${begin + 1.4}s` }}
              >
                <animateMotion dur="4.4s" repeatCount="indefinite" begin={`${begin + 1.4}s`}>
                  <mpath href="#flux-1" />
                </animateMotion>
              </use>
            ))}
          </g>

          {/* ---------- Ligne 2 (bas) ---------- */}
          <text className="feat-icon feat-d-5" x="20" y="336" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">
            CÔTE D&apos;IVOIRE
          </text>
          <g className="feat-icon feat-d-5" color="#8B6BE8">
            <rect x="42" y="366" width="56" height="56" rx="12" fill="rgba(109,63,214,.10)" stroke="rgba(109,63,214,.5)" />
            <use href="#immeuble-feat" x="56" y="380" width="28" height="28" />
          </g>
          <g className="feat-icon feat-d-6" color="#FAF7FC">
            <use href="#globe" x="53" y="442" width="34" height="34" />
          </g>

          <text className="feat-icon feat-d-7" x="490" y="336" fill="#FAF7FC" fontSize="17" letterSpacing="1.4">
            AUTRE PAYS
          </text>
          <g className="feat-icon feat-d-7" color="#EC0C8C">
            <rect x="540" y="366" width="56" height="56" rx="12" fill="rgba(236,12,140,.08)" stroke="rgba(236,12,140,.45)" />
            <use href="#boutique-feat" x="553" y="380" width="30" height="27" />
          </g>
          <g className="feat-icon feat-d-8" color="#FAF7FC">
            <use href="#globe" x="551" y="442" width="34" height="34" />
          </g>

          <text className="feat-icon feat-d-6" x="250" y="416" fill="rgba(250,247,252,.34)" fontSize="30">
            Cash
          </text>

          {/* Courbe 2 */}
          <path
            id="flux-2"
            className="flow-path feat-curve delay-2"
            d="M170,498 C244,498 266,422 340,418 C414,414 428,456 502,452"
            fill="none"
            stroke="#4C8B4A"
            strokeWidth="2.4"
          />
          {/* Même raisonnement que la courbe 1 : x/y = petit décalage de
              centrage (-13,-7), et le transition-delay est surchargé en
              ligne par billet pour coïncider avec son "begin". */}
          <g color="rgba(250,247,252,.6)">
            {[0.7, 2.2, 3.6].map((begin, i) => (
              <use
                key={i}
                className="feat-billet"
                href="#billet"
                width="26"
                height="14"
                x="-13"
                y="-7"
                style={{ transitionDelay: `${begin + 1.4}s` }}
              >
                <animateMotion dur="4.4s" repeatCount="indefinite" begin={`${begin + 1.4}s`}>
                  <mpath href="#flux-2" />
                </animateMotion>
              </use>
            ))}
          </g>
        </svg>

        {/* ==================== TÉLÉPHONE ==================== */}
        <div className="telephone feat-phone" style={{ height: "60%" }}>
          <div className="ecran">
            <div className="encoche" />

            <div
              className="rail"
              style={{
                width: `${NB_VUES * 100}%`,
                transform: `translateX(-${(index * 100) / NB_VUES}%)`,
                transition: autoActif
                  ? "transform 0.7s cubic-bezier(0.65,0,0.35,1)"
                  : "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
                animation: "none",
                touchAction: "pan-y",
                cursor: "grab",
                userSelect: "none",
              }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              {/* Écran 1 : confirmation */}
              <div className="vue">
                <div className="coche phone-sparkle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FAF7FC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>Votre commande<br />a bien été effectuée</h4>
                <p>Cliquez sur le lien pour<br />suivre votre commande</p>
                <div className="lien-suivi" style={{ fontSize: 8, fontWeight: 500, color: "#FAF7FC" }}>
                  track.liivremoi.com/CMD-2034-YOP
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 9l4-4M6 3h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Écran 2 : suivi */}
              <div className="vue">
                <h4 style={{ marginBottom: 6 }}>Suivi de commande</h4>
                <div className="etape faite"><i /> Commande confirmée</div>
                <div className="etape faite"><i /> Colis pris en charge</div>
                <div className="etape faite"><i /> En cours de livraison</div>
                <div className="etape"><i /> Paiement à la réception</div>
                <div className="moyen">Mobile money <span>›</span></div>
                <div className="moyen">Carte bancaire <span>›</span></div>
              </div>

              {/* Écran 3 : montant débité */}
              <div className="vue">
                <p>Montant débité</p>
                <div className="montant">24 500 F</div>
                <div className="debite">Paiement confirmé</div>
                <p style={{ marginTop: 10 }}>Le vendeur est crédité<br />automatiquement.</p>
              </div>
            </div>

            {/* Indicateurs (petits points cliquables) */}
            {/* <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {Array.from({ length: NB_VUES }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Aller à l'écran ${i + 1}`}
                  onClick={() => allerA(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-4 bg-brand-pink"
                      : "w-1.5 bg-brand-white/30 hover:bg-brand-white/50"
                  }`}
                />
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}