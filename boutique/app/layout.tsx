import type { Metadata } from "next";
import { Sora, Bricolage_Grotesque, Inter } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";

// On charge la police "Sora" (celle utilisée dans la maquette Figma) depuis
// Google Fonts. Next.js télécharge le fichier de police au moment du build
// et le sert directement depuis notre site : aucune requête n'est envoyée
// au navigateur du visiteur vers les serveurs de Google (bon pour la vie
// privée et pour la vitesse de chargement).
// La variable CSS "--font-sora" créée ici est ensuite branchée sur
// "--font-sans" dans app/globals.css.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

// Police "Bricolage Grotesque" — utilisée pour les entêtes (pastilles) des
// cards du dashboard accueil. Variable "--font-bricolage".
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

// Police "Inter" — demandée par l'utilisateur (2026-09-17) pour les entêtes
// de card de la page Réglages, à la place de Sora. Hors charte graphique
// (Sora + Bricolage Grotesque) — ajoutée sur instruction directe.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LIIVRE MOI — La solution LM",
  description:
    "Toute votre logistique e-commerce, une seule plateforme.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/images/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lecture obligatoire pour que Next.js applique le nonce (proxy.ts)
  // à ses propres scripts de bootstrap — cf. commentaire dans proxy.ts.
  // On récupère aussi sa valeur pour l'appliquer nous-même à notre <Script>
  // ci-dessous : l'attache "automatique" de Next.js ne couvre que ses propres
  // scripts, pas ceux qu'on ajoute à la main (cf. doc content-security-policy,
  // "Any <Script> components using the nonce prop") — sans ça, le nonce="" mal
  // résolu sur ce <script> déclenchait un hydration mismatch en dev.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="fr" suppressHydrationWarning className={`${sora.variable} ${bricolage.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-brand-bg font-sans text-brand-white antialiased">
        {/* Script anti-flash thème sombre : exécuté de manière synchrone avant
            tout paint pour poser la classe "dark" sur <html> si le mode nuit
            est actif — sans ce script, React bascule la classe dans un useEffect
            et l'utilisateur voit un éclair clair au rechargement.
            beforeInteractive doit être placé dans <body> (pas <head>) — Next.js
            l'y déplace lui-même au moment du build ; le laisser dans <head>
            empêche cette interception spéciale et React 19 tente alors de rendre
            un <script> littéral, ce qui déclenche l'erreur console.
            (cf. https://nextjs.org/docs/app/api-reference/components/script). */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("lm-dashboard-mode-nuit")==="1")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}