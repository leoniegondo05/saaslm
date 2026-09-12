"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "../../lib/api/services/auth";
import { useApiRequest } from "../../lib/api/hooks/useApiRequest";
import { API_BASE_URL } from "../../lib/api/config";

/*
  Formulaire de connexion, extrait de app/login/page.tsx pour pouvoir être
  un composant client (état + appel API) tout en gardant la page en
  composant serveur (export const metadata).

  Prêt à accueillir l'API : dès que POST {NEXT_PUBLIC_API_URL}/api/login
  répond, il suffit de vérifier le format retourné dans
  lib/api/services/auth.ts (AuthResponse) — rien ici à changer.
*/

// Bouton "oeil" pour basculer le champ mot de passe en clair — icône
// barrée quand le mot de passe est déjà visible (clic = repasser en
// masqué). Copie de celui d'InscriptionForm.tsx (composants de formulaire
// autonomes dans ce projet, pas de dossier ui/ partagé pour l'instant).
function BoutonOeil({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      tabIndex={-1}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-white/40 transition hover:text-brand-white/80"
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
        <path
          d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
        {visible && <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      </svg>
    </button>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { run, loading, error } = useApiRequest(login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Tant que NEXT_PUBLIC_API_URL n'est pas configuré (démo Vercel sans
    // backend Laravel), POST /api/login échouerait toujours (voir apiFetch
    // dans lib/api/client.ts) : on saute l'appel réseau et on va direct où
    // mènerait une connexion réussie, même principe que
    // InscriptionForm.tsx/handleAccepterConditions. À retirer dès que
    // l'API répond réellement.
    if (!API_BASE_URL) {
      router.push("/completer-profil");
      return;
    }

    const result = await run({ email, password, remember });
    if (result) {
      // Avant le dashboard : 9 questions sur l'activité + fiche
      // récapitulative (voir app/completer-profil/page.tsx, écrans 37-47
      // de la maquette). Pas encore de flag "profil complété" côté API
      // pour sauter ce parcours aux connexions suivantes — à ajouter
      // quand /api/login l'exposera.
      router.push("/completer-profil");
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
        {/* mt-2/sm:mt-3 porté par le div, pas par l'input : sinon le
            div s'agrandit de cette marge et le bouton oeil (centré via
            inset-y-0/my-auto) se retrouve décalé vers le haut — voir
            InscriptionForm.tsx pour le détail de la mesure du bug. */}
        <div className="relative mt-2 sm:mt-3">
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 pr-11 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:py-4"
          />
          <BoutonOeil visible={passwordVisible} onClick={() => setPasswordVisible((v) => !v)} />
        </div>
        {error?.fieldError("password") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("password")}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <label className="inline-flex cursor-pointer items-center gap-3">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-xl"
            />
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="hidden h-4 w-4 text-brand-bg peer-checked:block"
              aria-hidden
            >
              <path
                d="M13 4L6 11L3 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-sm text-brand-white">Se rapeller de moi</span>
        </label>

        <a href="#" className="text-sm font-medium text-brand-pink hover:opacity-80">
          Mot de passe oublié ?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-bg transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
      >
        {loading ? "Connexion…" : "Connexion"}
      </button>

      <div className="flex items-center gap-4 pt-3 pb-1">
        <span className="h-px flex-1 bg-white/10" aria-hidden />
        <span className="text-sm text-brand-white/70">Ou continuer avec</span>
        <span className="h-px flex-1 bg-white/10" aria-hidden />
      </div>

      <div className="mx-auto max-w-sm space-y-3">
        <button
          type="button"
          className="flex w-full items-center gap-3.5 rounded-full border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] pl-9 pr-6 py-3 text-sm font-medium text-brand-white transition hover:border-white/20 hover:brightness-110 sm:pl-11 sm:pr-7 sm:py-3.5"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">
            <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden>
              <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
              <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
              <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
              <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
              <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z" />
            </svg>
          </span>
          <span>Se connecter avec Google</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3.5 rounded-full border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] pl-9 pr-6 py-3 text-sm font-medium text-brand-white transition hover:border-white/20 hover:brightness-110 sm:pl-11 sm:pr-7 sm:py-3.5"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">
            <svg viewBox="0 0 384 512" className="h-6 w-6 fill-white" aria-hidden>
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
          </span>
          <span>Se connecter avec Apple</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3.5 rounded-full border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] pl-9 pr-6 py-3 text-sm font-medium text-brand-white transition hover:border-white/20 hover:brightness-110 sm:pl-11 sm:pr-7 sm:py-3.5"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]">
            <svg viewBox="0 0 320 512" className="h-4 w-4 fill-black" aria-hidden>
              <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
            </svg>
          </span>
          <span>Se connecter avec Facebook</span>
        </button>
      </div>

      <p className="pt-2 text-center text-sm text-brand-white">
        Vous avez déjà un compte ?{" "}
        <Link href="/inscription" className="font-medium text-brand-pink hover:opacity-80">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
