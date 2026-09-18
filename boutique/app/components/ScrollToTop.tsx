"use client";

import { useEffect, useState } from "react";

// Flèche "remonter en haut" : apparaît une fois arrivé tout en bas de la
// page (comme demandé), pas dès le premier scroll — évite de polluer
// l'écran pendant la lecture normale. Seuil de 24px pour tolérer les
// pages dont la hauteur totale n'est pas un multiple pixel-parfait.
const BOTTOM_THRESHOLD_PX = 24;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkPosition = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const isScrollable = scrollHeight > window.innerHeight + BOTTOM_THRESHOLD_PX;
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= scrollHeight - BOTTOM_THRESHOLD_PX;
      setVisible(isScrollable && scrolledToBottom);
    };

    checkPosition();
    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("resize", checkPosition);
    return () => {
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Remonter en haut de la page"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-4 z-50 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white shadow-[0_10px_30px_rgba(236,12,140,0.45)] transition hover:brightness-110 sm:right-6 lg:bottom-8 lg:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}

function ArrowUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 19V5M6 11l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
