"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Petit wrapper générique "révèle au scroll" : fondu + léger glissement vers
// le haut la 1ère fois que le bloc entre dans le viewport (IntersectionObserver,
// pas de dépendance à framer-motion pour un effet aussi simple). Demandé pour
// la page /vision, jugée "trop sèche" sans animation au défilement — même
// mécanisme réutilisable pour d'autres pages si besoin.
//
// `delay` (ms) sert à décaler plusieurs Reveal les uns des autres (ex : les
// colonnes de VisionEffects) pour un effet en cascade plutôt que synchronisé.
// prefers-reduced-motion : affiché directement, sans transition (voir
// classe .scroll-reveal dans globals.css).
export default function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      // Se déclenche un peu avant que le bloc soit entièrement visible, dès
      // qu'il entre dans le tiers bas de l'écran.
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className ?? ""}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
