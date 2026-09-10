"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";

const NAV_LINKS = [
  { label: "Ce que nous construisons", href: "/vision" },
  { label: "Partenaire agréé LM", href: "/partenaire-agree" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    // fixed (plus absolute) : reste visible pendant tout le scroll de la
    // page d'accueil, plus seulement au-dessus du Hero. Fond flouté (plutôt
    // que transparent) pour que le texte blanc reste lisible une fois
    // qu'on a scrollé au-delà du fond sombre du Hero.
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-brand-bg/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-6 md:px-16">

        {/* Logo */}
        {isHome ? (
          <a
            href="#hero"
            aria-label="Retour à l'accueil"
            className="flex items-center gap-3 rounded-lg py-1 transition hover:opacity-90"
          >
            <Image
              src="/images/logo.svg"
              alt="Logo LIIVRE MOI"
              width={38}
              height={38}
              className="h-[38px] w-[38px] object-contain"
            />

            <Wordmark className="text-[15px] font-bold tracking-tight text-white" />
          </a>
        ) : (
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="flex items-center gap-3 rounded-lg py-1 transition hover:opacity-90"
          >
            <Image
              src="/images/logo.svg"
              alt="Logo LIIVRE MOI"
              width={38}
              height={38}
              className="h-[38px] w-[38px] object-contain"
            />

            <Wordmark className="text-[15px] font-bold tracking-tight text-white" />
          </Link>
        )}

        {/* Bouton La solution LM */}
        {isHome ? (
          <a
            href="#hero"
            className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm text-white/90 shadow-[0_0_20px_rgba(236,12,140,0.12)] transition hover:bg-white/[0.08]"
          >
            <span className="h-2 w-2 rounded-full bg-brand-pink shadow-[0_0_8px_var(--color-brand-pink)]" />

            <span className="hidden sm:inline">
              La solution LM
            </span>
          </a>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm text-white/90 shadow-[0_0_20px_rgba(236,12,140,0.12)] transition hover:bg-white/[0.08]"
          >
            <span className="h-2 w-2 rounded-full bg-brand-pink shadow-[0_0_8px_var(--color-brand-pink)]" />

            <span className="hidden sm:inline">
              La solution LM
            </span>
          </Link>
        )}

        {/* Navigation */}
        <nav className="hidden items-center gap-4 text-sm font-medium text-white/80 md:flex">
          {NAV_LINKS.map((link, index) => (
            <span
              key={link.label}
              className="flex items-center gap-4"
            >
              {index > 0 && (
                <span
                  className="inline-block h-1 w-1 rounded-full bg-brand-pink"
                  aria-hidden="true"
                />
              )}

              <Link
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>

      </div>
    </header>
  );
}