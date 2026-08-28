import type { Metadata } from "next";
import { Sora } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Livre Moi — La solution LM",
  description:
    "Toute votre logistique e-commerce, une seule plateforme.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={sora.variable}>
      <body className="flex min-h-screen flex-col bg-brand-bg font-sans text-brand-white antialiased">
        {children}
      </body>
    </html>
  );
}