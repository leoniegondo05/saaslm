"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { register } from "../../lib/api/services/auth";
import { useApiRequest } from "../../lib/api/hooks/useApiRequest";

/*
  Formulaire d'inscription, extrait de app/inscription/page.tsx pour
  pouvoir être un composant client (état + appel API) tout en gardant la
  page en composant serveur (export const metadata).

  Prêt à accueillir l'API : dès que POST {NEXT_PUBLIC_API_URL}/api/register
  répond, il suffit de vérifier le format retourné dans
  lib/api/services/auth.ts (RegisterPayload/AuthResponse) — rien ici à
  changer.
*/
export default function InscriptionForm() {
  const router = useRouter();
  const { run, loading, error } = useApiRequest(register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [terms, setTerms] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await run({
      name,
      email,
      phone,
      shop_name: shopName,
      shop_slug: shopSlug,
      password,
      password_confirmation: passwordConfirmation,
    });
    if (result) {
      // TODO: pointer vers le tableau de bord une fois sa route créée.
      router.push("/");
    }
  }

  return (
    <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit}>
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-brand-white">
            Nom &amp; prénom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex : Jean DUPONT"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
          />
          {error?.fieldError("name") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("name")}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-semibold text-brand-white">
            Adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="info@example.com"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
          />
          {error?.fieldError("email") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("email")}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label htmlFor="phone" className="text-sm font-semibold text-brand-white">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+225 07 07 07 07 07"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
          />
          {error?.fieldError("phone") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("phone")}</p>
          )}
        </div>

        <div>
          <label htmlFor="shop-name" className="text-sm font-semibold text-brand-white">
            Nom de la boutique
          </label>
          <input
            id="shop-name"
            name="shop-name"
            type="text"
            autoComplete="organization"
            required
            value={shopName}
            onChange={(event) => setShopName(event.target.value)}
            placeholder="Ex : Ma boutique"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
          />
          {error?.fieldError("shop_name") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("shop_name")}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="shop-slug" className="text-sm font-semibold text-brand-white">
          Lien de ma boutique
        </label>
        <div className="mt-2 flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] focus-within:border-brand-pink/60 sm:mt-3">
          <input
            id="shop-slug"
            name="shop-slug"
            type="text"
            required
            value={shopSlug}
            onChange={(event) => setShopSlug(event.target.value)}
            placeholder="Ma boutique"
            className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none sm:py-4"
          />
          <span className="flex shrink-0 items-center border-l border-white/10 px-5 text-sm font-semibold text-brand-white/50">
            .LM.com
          </span>
        </div>
        {error?.fieldError("shop_slug") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("shop_slug")}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-brand-white">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
          />
          {error?.fieldError("password") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("password")}</p>
          )}
        </div>

        <div>
          <label htmlFor="password-confirmation" className="text-sm font-semibold text-brand-white">
            Confirmation
          </label>
          <input
            id="password-confirmation"
            name="password-confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            placeholder="********"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
          />
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-white">
          <input
            type="checkbox"
            name="terms"
            required
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md"
          />
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="hidden h-3.5 w-3.5 text-brand-bg peer-checked:block"
            aria-hidden
          >
            <path
              d="M13 4L6 11L3 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-sm text-brand-white/80">
          J&apos;accepte les conditions d&apos;utilisation.
        </span>
      </label>

      <Link
        href="/login"
        className="block text-center text-sm font-medium text-brand-pink hover:opacity-80"
      >
        Vous avez déjà un compte ?
      </Link>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-white px-6 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
      >
        {loading ? "Création…" : "Créer ma boutique"}
      </button>
    </form>
  );
}
