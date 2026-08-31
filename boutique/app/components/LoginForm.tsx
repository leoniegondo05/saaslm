"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "../../lib/api/services/auth";
import { useApiRequest } from "../../lib/api/hooks/useApiRequest";

/*
  Formulaire de connexion, extrait de app/login/page.tsx pour pouvoir être
  un composant client (état + appel API) tout en gardant la page en
  composant serveur (export const metadata).

  Prêt à accueillir l'API : dès que POST {NEXT_PUBLIC_API_URL}/api/login
  répond, il suffit de vérifier le format retourné dans
  lib/api/services/auth.ts (AuthResponse) — rien ici à changer.
*/
export default function LoginForm() {
  const router = useRouter();
  const { run, loading, error } = useApiRequest(login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await run({ email, password, remember });
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

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-brand-white">
          Addresse Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Ex : info@example.com"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
        />
        {error?.fieldError("email") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("email")}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-brand-white">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="********"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4"
        />
        {error?.fieldError("password") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("password")}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <label className="inline-flex cursor-pointer items-center gap-3">
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-white">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
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
          <span className="text-sm text-brand-white/80">Se rapeller de moi</span>
        </label>

        <a href="#" className="text-sm font-medium text-brand-pink hover:opacity-80">
          Mot de passe oublié ?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-white px-6 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
      >
        {loading ? "Connexion…" : "Connexion"}
      </button>

      <Link
        href="/inscription"
        className="block w-full rounded-xl border border-white/15 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white/5 sm:py-4"
      >
        Pas de compte ? Inscription
      </Link>
    </form>
  );
}
