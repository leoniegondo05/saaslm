import type { NextConfig } from "next";

// Content-Security-Policy déplacée dans middleware.ts : elle a besoin d'un
// nonce généré par requête (script-src), impossible à faire ici puisque
// headers() dans next.config.ts est figé au build, pas par requête.
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // geolocation=(self) : le bouton "Capturer ma position" du
            // formulaire "Déposer un stock" (DeposerStockModal.tsx) en a
            // besoin — bloqué en () avant, c'était la vraie cause des
            // erreurs "Permissions policy violation" côté geolocalisation,
            // pas l'aperçu éditeur. Caméra/micro restent bloqués (inutilisés).
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
