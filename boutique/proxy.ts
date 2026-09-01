import { NextRequest, NextResponse } from "next/server";

/*
  CSP avec nonce par requête pour script-src : remplace 'unsafe-inline'
  (qui neutralisait la protection XSS de la CSP) par un nonce généré à
  chaque requête. Next.js détecte automatiquement ce nonce (via le header
  CSP qu'il lit dans app/layout.tsx avec headers()) et l'applique à ses
  propres scripts de bootstrap/hydration — rien à faire côté composants
  tant qu'aucun <script> ou dangerouslySetInnerHTML n'est ajouté à la main
  (si besoin un jour : passer nonce={nonce} explicitement).

  Contrepartie : lire headers() dans le layout racine force le rendu
  dynamique (SSR par requête) sur toutes les pages sous ce layout — perte
  de la génération statique. Cf. discussion avant d'étendre/retirer.

  style-src garde 'unsafe-inline' : plusieurs composants (Features,
  HeroBrain, HowItWorks, ScrollReveal, PartenaireAgreeLanding) utilisent
  des style={{...}} calculés dynamiquement (délais d'animation, positions
  en %, couleurs de données) — les nonces ne s'appliquent pas aux
  attributs style="" (seuls <style> et <script> supportent nonce en CSP),
  donc pas de fix équivalent possible sans réécriture complète en
  variables CSS. Risque résiduel plus faible que script-src (pas d'exé
  de code, exfiltration CSS uniquement).
*/
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
