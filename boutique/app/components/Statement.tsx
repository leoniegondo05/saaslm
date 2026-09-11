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
      className={`statement-section relative flex items-center justify-center bg-brand-bg px-6 py-40 text-center md:px-16 ${
        visible ? "is-visible" : ""
      }`}
    >
      {/* ---- Particules roses qui flottent autour ---- */}
      {Array.from({ length: NB_PARTICULES }).map((_, i) => (
        <span
          key={i}
          className={`statement-particule p${i + 1}`}
          style={{ animationDelay: `${0.8 + i * 0.35}s` }}
          aria-hidden="true"
        />
      ))}

      {/* ---- La phrase signature ---- */}
      <p className="statement-text mx-auto max-w-4xl text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-5xl md:text-6xl">
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