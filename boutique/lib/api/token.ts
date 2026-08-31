/*
  Stockage du token d'authentification (Laravel Sanctum : token Bearer
  classique via /api/login, cf. https://laravel.com/docs/sanctum#spa-authentication).

  Si le backend choisit plutôt l'auth par cookie (Sanctum SPA + sessions),
  ce fichier devient un no-op (le cookie est géré par le navigateur) : seul
  client.ts a besoin d'ajouter `credentials: "include"`, rien côté
  composants ne change.
*/

const TOKEN_KEY = "lm_auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
