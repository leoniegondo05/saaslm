"use client";

import { useEffect, useRef, useState } from "react";

const NB_PARTICULES = 10;

export default function Statement() {
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
      { threshold: 0.3, rootMargin: "0px 0px -15% 0px" }
    );
    oeil.observe(el);
    return () => oeil.disconnect();
  }, []);

  return (
    <section
      id="commerce-digital"
      ref={sectionRef}
      data-section
      data-titre=""
      className={`statement-section relative flex items-center justify-center bg-brand-bg px-5 py-24 text-center sm:px-8 sm:py-32 md:px-16 md:py-40 ${
        visible ? "is-visible" : ""
      }`}
    >
      {/* ---- Particules roses qui flottent autour ----
          Sur mobile, on masque les particules qui tomberaient trop près
          des bords (p1, p8, p10) car la section est étroite et elles
          sortent du cadre ou collent au texte. */}
      {Array.from({ length: NB_PARTICULES }).map((_, i) => (
        <span
          key={i}
          className={`statement-particule p${i + 1} ${
            i === 0 || i === 7 || i === 9 ? "hidden sm:block" : ""
          }`}
          style={{ animationDelay: `${0.8 + i * 0.35}s` }}
          aria-hidden="true"
        />
      ))}

      {/* ---- La phrase signature ---- */}
      <p className="statement-text mx-auto max-w-[22ch] text-[clamp(24px,7.5vw,32px)] font-semibold leading-[1.25] tracking-[-0.02em] sm:max-w-3xl sm:text-5xl sm:leading-[1.15] md:max-w-4xl md:text-6xl">
        <span className="statement-shine">
          Le commerce digital{" "}
          <span className="statement-word text-brand-pink">
            orchestré
          </span>{" "}
          de bout en bout.
        </span>
      </p>
    </section>
  );
}