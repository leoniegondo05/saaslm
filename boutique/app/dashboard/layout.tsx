import { cookies } from "next/headers";
import { DashboardThemeProvider } from "../components/DashboardThemeProvider";
import { DashboardLanguageProvider, LANG_STORAGE_KEY, type Langue } from "../components/DashboardLanguageProvider";
import { DashboardBoutiqueLogoProvider } from "../components/DashboardBoutiqueLogoProvider";
import { DashboardBoutiqueIdentityProvider } from "../components/DashboardBoutiqueIdentityProvider";
import ScrollToTop from "../components/ScrollToTop";

/*
  Layout partagé par toutes les pages du dashboard ("Ma journée",
  "Accueil"...) : la bulle IA doit se promener sur chaque écran, donc elle
  est montée ici une seule fois plutôt que copiée dans chaque page.

  DashboardThemeProvider monté ici (et pas plus haut, dans app/layout.tsx)
  car le mode nuit ne concerne que le dashboard, pas le site public — voir
  DashboardThemeProvider.tsx pour le détail (contexte + classe "dark" sur
  <html> + persistance localStorage).

  Langue lue depuis un cookie ICI (Server Component, cookies() de
  next/headers) et transmise en prop initiale à DashboardLanguageProvider :
  contrairement au mode nuit (juste une classe CSS ajoutée par un script
  avant peinture, cf. NO_FLASH_SCRIPT), la langue change le VRAI texte
  rendu par React — un script anti-flash ne suffit pas à l'éviter, il
  faudrait cacher tout le contenu jusqu'à lecture de localStorage. Partir
  du cookie donne la bonne langue dès le rendu serveur, sans flash FR→EN
  ni EN→FR au chargement. Ce cookies() rend cette route dynamique (déjà le
  cas ici, cf. mémoire [[csp-nonce-proxy-tradeoff]]).
*/

async function getInitialLangue(): Promise<Langue> {
  const store = await cookies();
  const value = store.get(LANG_STORAGE_KEY)?.value;
  return value === "EN" ? "EN" : "FR";
}


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLangue = await getInitialLangue();
  return (
    <DashboardThemeProvider>
      <DashboardLanguageProvider initialLangue={initialLangue}>
        <DashboardBoutiqueLogoProvider>
        <DashboardBoutiqueIdentityProvider>
        {/* Script anti-flash déplacé dans app/layout.tsx (head du root layout,
            Server Component) pour respecter la contrainte React 19 qui interdit
            les <script> dans le rendu client. */}
          {/* display:contents : ce div n'existe que pour donner un
              sélecteur CSS au scope "chiffres du dashboard" (voir
              ".dashboard-figures-scope" dans globals.css) — il ne doit rien
              changer à la mise en page (flex/grid) des écrans qu'il entoure. */}
          <div className="dashboard-figures-scope" style={{ display: "contents" }}>
            {children}
          </div>
          <ScrollToTop />
        </DashboardBoutiqueIdentityProvider>
        </DashboardBoutiqueLogoProvider>
      </DashboardLanguageProvider>
    </DashboardThemeProvider>
  );
}
