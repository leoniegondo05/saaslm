"use client";

import { useEffect, useRef, useState } from "react";

export default function Affiliation() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      data-section
      data-titre="S'affilier, c'est grandir"
      data-sous="Une boutique choisit une entreprise agréée. Une entreprise agréée en accompagne plusieurs."
      className={`aff-section py-16 px-4 sm:py-33 sm:px-7 max-w-[1500px] mx-auto ${
        visible ? "is-visible" : ""
      }`}
    >
      <video
        src="/images/affilier.mp4"
        className="w-full max-w-[600px] h-auto rounded-2xl mx-auto block"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    </section>
  );
}
