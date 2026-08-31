/*
  Point d'entrée unique pour brancher le backend Laravel.

  Étape à faire quand l'API sera prête :
    1. Renseigner NEXT_PUBLIC_API_URL dans .env.local (voir .env.example).
    2. Vérifier/adapter les chemins ci-dessous (ENDPOINTS) sur les vraies
       routes Laravel (routes/api.php) — les valeurs actuelles sont des
       conventions REST/Sanctum standard, à ajuster si le backend diffère.
    3. Rien d'autre à changer côté services (lib/api/services/*) ni côté
       composants : ils consomment ENDPOINTS, pas des URLs en dur.
*/

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

// Regroupées par domaine pour rester lisible à mesure que l'API grossit
// (produits, commandes, boutique…), même si seul "auth" existe pour l'instant.
export const ENDPOINTS = {
  auth: {
    register: "/api/register",
    login: "/api/login",
    logout: "/api/logout",
    me: "/api/user",
  },
} as const;
