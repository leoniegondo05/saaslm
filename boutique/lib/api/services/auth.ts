import { apiFetch } from "../client";
import { ENDPOINTS } from "../config";
import { setToken, clearToken } from "../token";

/*
  Service d'authentification. Adapte les noms de champs (name, email,
  phone, password, password_confirmation…) sur les vraies validations
  Laravel dès qu'elles seront connues — le reste (client, hook,
  composants) n'a pas à bouger.

  Plus de shop_name/shop_slug ici (demande utilisateur) : nom et lien de
  la boutique sont désormais recueillis dans CompleterProfilWizard.tsx
  (step 10), après l'inscription — voir son commentaire d'en-tête pour le
  détail du payload à brancher côté API le jour venu.
*/

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>(ENDPOINTS.auth.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>(ENDPOINTS.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  await apiFetch<void>(ENDPOINTS.auth.logout, { method: "POST" });
  clearToken();
}

export async function me(): Promise<AuthUser> {
  return apiFetch<AuthUser>(ENDPOINTS.auth.me, { method: "GET" });
}
