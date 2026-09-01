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
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
