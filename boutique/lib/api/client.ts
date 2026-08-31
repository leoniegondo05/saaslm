import { API_BASE_URL } from "./config";
import { ApiError, type ApiErrorPayload } from "./types";
import { getToken } from "./token";

/*
  Client fetch générique. Chaque service (lib/api/services/*) l'appelle
  avec un chemin d'ENDPOINTS et un body typé — aucun service n'a à
  connaître l'URL de base, les headers ou le format d'erreur.
*/
export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  if (!API_BASE_URL) {
    // Signal explicite plutôt qu'un échec réseau silencieux tant que
    // NEXT_PUBLIC_API_URL n'est pas renseigné (voir lib/api/config.ts).
    throw new ApiError(0, {
      message:
        "API non configurée : NEXT_PUBLIC_API_URL est manquant (voir .env.example).",
    });
  }

  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Réponse sans contenu (204, logout…)
  if (response.status === 204) {
    return undefined as TResponse;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const payload: ApiErrorPayload = data ?? {
      message: `Erreur ${response.status}`,
    };
    throw new ApiError(response.status, payload);
  }

  return data as TResponse;
}
