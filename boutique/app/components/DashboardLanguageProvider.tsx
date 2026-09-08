"use client";

import { createContext, useContext, useEffect, useState } from "react";

/*
  Langue du dashboard : même pattern que DashboardThemeProvider (mode nuit) —
  état partagé entre toutes les pages via ce contexte, monté une seule fois
  dans app/dashboard/layout.tsx, plutôt que le booléen purement local qui
  vivait avant dans DashboardHeader (cf. commentaire retiré là-bas, "purement
  visuel pour l'instant, pas d'i18n câblée").

  Source de vérité au premier rendu : un cookie, lu côté serveur par
  app/dashboard/layout.tsx (Server Component) et transmis ici via la prop
  `initialLangue` — pas de flash FR→EN au chargement, contrairement à une
  lecture localStorage-only (qui ne peut se faire qu'après montage, donc
  après le premier rendu serveur toujours en FR). setLangue() écrit à la
  fois le cookie (pour le prochain rendu serveur) et localStorage (lu ici en
  secours si le cookie n'existe pas encore, ex. bascule faite avant ce
  changement, ou cookies désactivés).

  Approche volontairement légère plutôt qu'une librairie i18n avec fichiers
  de clés séparés (next-intl, etc.) : `t(fr, en)` prend directement les deux
  chaînes en argument, appelé au fil du JSX — pas de clé à maintenir, la
  traduction reste à côté du texte d'origine.
*/

// Nom partagé par le cookie (lu côté serveur dans dashboard/layout.tsx) et
// la clé localStorage (repli côté client) — une seule constante pour les
// deux, comme STORAGE_KEY pour le mode nuit.
export const LANG_STORAGE_KEY = "lm-dashboard-langue";

export type Langue = "FR" | "EN";

type DashboardLanguageContextValue = {
  langue: Langue;
  setLangue: (langue: Langue) => void;
  /** Retourne `en` si la langue active est EN, sinon `fr`. */
  t: (fr: string, en: string) => string;
};

const DashboardLanguageContext = createContext<DashboardLanguageContextValue | null>(null);

// 1 an — même durée que les cookies de préférence habituels (thème, langue).
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function writeCookie(value: Langue) {
  try {
    document.cookie = `${LANG_STORAGE_KEY}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    // document.cookie indisponible dans de très rares contextes (sandbox
    // stricte) : on ignore, localStorage reste le repli pour cette session.
  }
}

export function DashboardLanguageProvider({
  children,
  initialLangue = "FR",
}: {
  children: React.ReactNode;
  /** Langue déterminée côté serveur (cookie), passée par app/dashboard/layout.tsx. */
  initialLangue?: Langue;
}) {
  const [langue, setLangueState] = useState<Langue>(initialLangue);

  // Migration/repli : un cookie absent (première visite après l'ajout du
  // cookie, ou cookies bloqués) mais un localStorage déjà rempli par un
  // ancien bascule — on aligne l'état dessus et on écrit le cookie pour que
  // le prochain rendu serveur reparte directement dans la bonne langue (plus
  // de flash au 2e chargement). Sans effet quand le cookie était déjà
  // présent : `stored === langue` alors, rien à faire.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if ((stored === "EN" || stored === "FR") && stored !== langue) {
        setLangueState(stored);
        writeCookie(stored);
      }
    } catch {
      // localStorage indisponible (navigation privée, etc.) : on reste sur
      // la langue déterminée côté serveur, tant pis pour ce repli.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- migration au montage uniquement
  }, []);

  const setLangue = (next: Langue) => {
    setLangueState(next);
    writeCookie(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // idem : ça reste fonctionnel pour la session en cours.
    }
  };

  const t = (fr: string, en: string) => (langue === "EN" ? en : fr);

  return (
    <DashboardLanguageContext.Provider value={{ langue, setLangue, t }}>
      {children}
    </DashboardLanguageContext.Provider>
  );
}

export function useDashboardLangue() {
  const ctx = useContext(DashboardLanguageContext);
  if (!ctx) {
    throw new Error("useDashboardLangue doit être utilisé sous DashboardLanguageProvider");
  }
  return ctx;
}
