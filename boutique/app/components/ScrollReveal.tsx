"use client";

import { useEffect, useRef, ReactNode, JSX } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  /** Attributs data-* pour le titre de la Navbar */
  dataTitre?: string;
  dataSous?: string;
  dataSection?: boolean;
};

export default function ScrollReveal({
  children,
  className = "",
  as: Tag = "section",
  delay,
  dataTitre,
  dataSous,
  dataSection,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const oeil = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            oeil.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    oeil.observe(el);
    return () => oeil.disconnect();
  }, []);

  const dataAttrs: Record<string, unknown> = {};
  if (dataSection) dataAttrs["data-section"] = true;
  if (dataTitre !== undefined) dataAttrs["data-titre"] = dataTitre;
  if (dataSous !== undefined) dataAttrs["data-sous"] = dataSous;

  const DynamicTag = Tag as any;

  return (
    <DynamicTag
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...dataAttrs}
    >
      {children}
    </DynamicTag>
  );
}