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

  Habillage "verre dépoli" repris de test.html (voir globals.css
  ".login-*") : mêmes champs, même ordre, même logique qu'avant — seules
  les classes CSS changent.

  Prêt à accueillir l'API : dès que POST {NEXT_PUBLIC_API_URL}/api/login
  répond, il suffit de vérifier le format retourné dans
  lib/api/services/auth.ts (AuthResponse) — rien ici à changer.
*/

function IconeEnveloppe() {
  return (
    <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconeCadenas() {
  return (
    <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

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
      className="login-password-toggle"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
        {visible && <path d="M3.5 3.5l17 17" strokeLinecap="round" />}
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
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-field">
        <label htmlFor="email">Addresse Email</label>
        <div className="login-input-shell">
          <IconeEnveloppe />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Ex : info@example.com"
          />
        </div>
        {error?.fieldError("email") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("email")}</p>
        )}
      </div>

      <div className="login-field">
        <label htmlFor="password">Mot de passe</label>
        <div className="login-input-shell">
          <IconeCadenas />
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
          />
          <BoutonOeil visible={passwordVisible} onClick={() => setPasswordVisible((v) => !v)} />
        </div>
        {error?.fieldError("password") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("password")}</p>
        )}
      </div>

      <div className="login-options">
        <label className="login-remember">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span>Se rapeller de moi</span>
        </label>

        <a href="#" className="login-forgot">
          Mot de passe oublié ?
        </a>
      </div>

      <button type="submit" disabled={loading} className="login-submit">
        {loading ? "Connexion…" : "Connexion"} <span>→</span>
      </button>

      {error && <p className="login-error">{error.message}</p>}

      <div className="login-divider">Ou continuer avec</div>

      <div className="login-socials">
        <button type="button" className="login-social">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.56-.2-2.27H12v4.3h6.45a5.51 5.51 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.56-5.17 3.56-8.64Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.76-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.29 14.28A7.21 7.21 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29A12 12 0 0 0 0 12c0 1.93.46 3.75 1.29 5.38l4-3.1Z" />
            <path fill="#EA4335" d="M12 4.77c1.77 0 3.36.61 4.61 1.81l3.46-3.46C17.95 1.12 15.24 0 12 0A12 12 0 0 0 1.29 6.62l4 3.1C6.24 6.88 8.88 4.77 12 4.77Z" />
          </svg>
          <span>Se connecter avec Google</span>
        </button>

        <button type="button" className="login-social">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.05 12.54c-.02-2.23 1.82-3.3 1.9-3.35a4.1 4.1 0 0 0-3.23-1.75c-1.36-.14-2.67.8-3.36.8-.7 0-1.78-.78-2.92-.76a4.3 4.3 0 0 0-3.62 2.2c-1.56 2.7-.4 6.68 1.1 8.87.74 1.07 1.61 2.26 2.75 2.22 1.1-.04 1.52-.7 2.86-.7 1.33 0 1.71.7 2.87.67 1.2-.02 1.96-1.08 2.7-2.15.85-1.23 1.2-2.42 1.22-2.48-.03-.01-2.25-.86-2.27-3.37ZM14.85 6c.61-.74 1.02-1.77.9-2.8-.88.04-1.95.59-2.58 1.33-.56.65-1.05 1.7-.92 2.7.98.08 1.98-.5 2.6-1.23Z" />
          </svg>
          <span>Se connecter avec Apple</span>
        </button>

        <button type="button" className="login-social">
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="12" fill="#1877F2" />
            <path fill="#fff" d="M13.5 20v-7h2.35l.35-2.72H13.5V8.54c0-.79.22-1.33 1.36-1.33h1.45V4.78c-.25-.03-1.1-.1-2.1-.1-2.08 0-3.5 1.27-3.5 3.6v2H8.36V13h2.35v7h2.79Z" />
          </svg>
          <span>Se connecter avec Facebook</span>
        </button>
      </div>

      <p className="login-signup">
        Vous avez déjà un compte ?
        <Link href="/inscription">Créer un compte</Link>
      </p>
    </form>
  );
}
