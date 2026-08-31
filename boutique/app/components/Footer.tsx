"use client";

import Image from "next/image";
import { useState } from "react";

const LEGAL_LINKS = [
  "Politique de confidentialité",
  "Conditions d'utilisation",
  "Paramètres cookies",
];

// Icônes SVG des réseaux sociaux avec style violet comme dans la maquette
const SocialIcons = {
  Facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  YouTube: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
};

const SOCIALS = [
  { name: "Facebook", href: "#", Icon: SocialIcons.Facebook },
  { name: "Instagram", href: "#", Icon: SocialIcons.Instagram },
  { name: "X", href: "#", Icon: SocialIcons.X },
  { name: "LinkedIn", href: "#", Icon: SocialIcons.LinkedIn },
  { name: "YouTube", href: "#", Icon: SocialIcons.YouTube },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  // Ce site n'a pas encore de service d'envoi d'e-mails branché : on se
  // contente donc d'empêcher le rechargement de la page et d'afficher un
  // message de confirmation. Pour un vrai formulaire, il faudra créer une
  // route API qui appelle un service d'e-mailing, en gardant sa clé secrète
  // dans une variable d'environnement (jamais dans le code).
  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="bg-brand-white px-6 py-16 text-brand-bg md:px-16">
      <div className="mx-auto grid max-w-[1320px] gap-12 sm:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">
            Parlons de votre <span className="text-brand-pink">PROJET</span>
          </h2>
          <p className="mt-3 text-sm text-brand-bg/60">
            Une question, un projet de partenariat ?
            <br />
            Notre équipe vous répond rapidement.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">S'abonner</h2>
          <p className="mt-3 text-sm text-brand-bg/60">
            Restez informé des nouvelles fonctionnalités et mises à jour de
            notre plateforme.
          </p>

          <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Votre adresse email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Votre adresse email"
              className="w-full rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm text-brand-bg/70 outline-none focus:border-brand-pink"
            />
            <button
              type="submit"
              className="w-full shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black sm:w-auto"
            >
              S'abonner
            </button>
          </form>

          {subscribed ? (
            <p className="mt-2 text-xs text-brand-pink">
              Merci, votre inscription est prise en compte !
            </p>
          ) : (
            <p className="mt-2 text-xs text-brand-bg/40">
              En vous abonnant, vous acceptez notre politique de
              confidentialité et consentez à recevoir nos communications.
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1320px] flex-col items-start justify-between gap-6 border-t border-black/10 pt-6 text-xs text-brand-bg/50 sm:flex-row sm:items-center sm:gap-4">
        <nav className="order-1 flex flex-col items-start gap-4 sm:order-2 sm:flex-row sm:flex-wrap sm:justify-center">
          {LEGAL_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="underline-offset-2 hover:underline"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="order-2 flex items-center gap-2 sm:order-1">
          <Image
            src="/images/logo.svg"
            alt="Logo LiivreMoi"
            width={28}
            height={28}
            className="hidden h-7 w-7 object-contain opacity-70 sm:block"
          />
          <p>© 2026 LiivreMoi. Tous droits réservés.</p>
        </div>

        {/* Icônes réseaux sociaux réelles avec couleur violette */}
        <div className="order-3 hidden gap-4 sm:flex">
          {SOCIALS.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              aria-label={name}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2E1A8E] text-white transition-opacity hover:opacity-80"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
