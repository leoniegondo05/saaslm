import type { Metadata } from "next";
import { Sora, Bricolage_Grotesque, Inter } from "next/font/google";
import { headers } from "next/headers";
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
  // Lecture obligatoire pour que Next.js applique le nonce (middleware.ts)
  // à ses propres scripts de bootstrap — cf. commentaire dans middleware.ts.
  await headers();

  return (
    <html lang="fr" className={`${sora.variable} ${bricolage.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-brand-bg font-sans text-brand-white antialiased">
        {children}
      </body>
    </html>
  );
}