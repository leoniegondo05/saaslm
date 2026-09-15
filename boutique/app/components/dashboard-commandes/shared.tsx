"use client";

/*
  Types, données et petits composants partagés entre les deux fiches de
  l'onglet "Commandes" — "Les commandes" (CommandesListe, Écran 11) et
  "Lire une ligne" (LireUneLigne, Écran 12) — pour que la seconde puisse
  annoter exactement les mêmes données que la première affiche. Même
  principe que dashboard-accueil/shared.tsx. Données statiques pour
  l'instant, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
*/

export type Etape = "attente" | "assistance" | "preparation" | "livraison";
/* Un litige n'a pas de "cause" affichée ici — il a une issue, une fois
   tranché. Tant qu'elle vaut null, le litige est ouvert. */
export type IssueLitige = "changement-colis" | "retour-fonds" | "faveur";

export type Statut =
  | { type: "etape"; etape: Etape }
  | { type: "livree"; heuresRestantes: number }
  | { type: "disponible" }
  | { type: "refusee" }
  | { type: "relance" }
  | { type: "litige"; issue: IssueLitige | null };

export type Commande = {
  id: string;
  produit: string;
  quantite: number;
  montantPaye: number;
  retenueLogistique: number;
  retenueOperation: number;
  statut: Statut;
};

export type Jour = {
  cle: string;
  date: string;
  dateEn: string;
  commandes: Commande[];
};

export const ETAPES: { etape: Etape; label: string; labelEn: string; couleur: string }[] = [
  { etape: "attente", label: "En attente", labelEn: "Awaiting", couleur: "#B9B9C6" },
  { etape: "assistance", label: "Assistance", labelEn: "Support", couleur: "#8A5CF6" },
  { etape: "preparation", label: "Préparation", labelEn: "Preparing", couleur: "#2563eb" },
  { etape: "livraison", label: "Livraison", labelEn: "Delivery", couleur: "#EC0C8C" },
];

// Un litige ouvert (issue: null) — libellé et note génériques, en attente
// de décision entre les trois issues ci-dessous.
export const LITIGE_OUVERT = {
  label: "Litige",
  labelEn: "Dispute",
  couleur: "#a8690a",
  note: "En attente d'une décision : changement de colis, retour de fonds, ou clôture en votre faveur. Le trait reste orange et l'argent suspendu tant que rien n'est tranché.",
  noteEn: "Awaiting a decision: parcel exchange, funds returned, or closed in your favor. The line stays orange and the money suspended until something is decided.",
};

export const ISSUES: Record<
  IssueLitige,
  { label: string; labelEn: string; couleur: string; progression: number; note: string; noteEn: string }
> = {
  "changement-colis": {
    label: "Changement de colis",
    labelEn: "Parcel exchange",
    couleur: "#2563eb",
    progression: 45,
    note: "Un nouveau colis part. Le point revient en préparation et repart avec lui. L'argent reste suspendu, et l'anneau des soixante-douze heures ne démarre qu'à la nouvelle livraison.",
    noteEn: "A new parcel goes out. The point returns to preparation and starts over with it. Money stays suspended, and the 72-hour ring only starts at the new delivery.",
  },
  "retour-fonds": {
    label: "Retour de fonds",
    labelEn: "Funds returned",
    couleur: "#c8262d",
    progression: 85,
    note: "Le client est remboursé. Le point s'arrête là, le montant reste barré, et rien n'entre dans l'encaissé de la journée.",
    noteEn: "The customer is refunded. The point stops there, the amount stays struck through, and nothing enters that day's total collected.",
  },
  faveur: {
    label: "Disponible",
    labelEn: "Available",
    couleur: "#178a3f",
    progression: 100,
    note: "Le litige est tranché en votre faveur. Le trait passe au vert, le montant redevient vert, et l'argent est immédiatement à vous.",
    noteEn: "The dispute is settled in your favor. The line turns green, the amount turns green again, and the money is yours immediately.",
  },
};

export const DELAI_DISPONIBILITE = 72; // heures — même délai que "mes règles de vente"

export const TAUX = { cfa: 1, eur: 1 / 655.957, usd: 1 / 610 };
export const DEVISES = [
  { key: "cfa" as const, label: "Franc CFA", labelEn: "CFA franc", suffixe: "F" },
  { key: "eur" as const, label: "Euro", labelEn: "Euro", suffixe: "€" },
  { key: "usd" as const, label: "Dollar", labelEn: "Dollar", suffixe: "$" },
];

// Recalcule les libellés "Aujourd'hui · [jour] [mois]" / "Hier · [jour] [mois]"
// sur la date choisie dans DashboardHeader, pour que CommandesListe (Écran 11)
// et LireUneLigne (Écran 12) affichent toujours une date cohérente avec le
// sélecteur, même si le contenu des commandes reste le jeu figé de JOURS.
export function libellesJour(base: Date): Record<"aujourdhui" | "hier", { date: string; dateEn: string }> {
  const hier = new Date(base);
  hier.setDate(hier.getDate() - 1);
  return {
    aujourdhui: {
      date: `Aujourd'hui · ${base.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`,
      dateEn: `Today · ${base.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    },
    hier: {
      date: `Hier · ${hier.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`,
      dateEn: `Yesterday · ${hier.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    },
  };
}

export const JOURS: Jour[] = [
  {
    cle: "aujourdhui",
    date: "Aujourd'hui · 8 septembre",
    dateEn: "Today · September 8",
    commandes: [
      {
        id: "CMD-58231",
        produit: "Sérum éclat 30 ml",
        quantite: 1,
        montantPaye: 12500,
        retenueLogistique: 900,
        retenueOperation: 625,
        statut: { type: "etape", etape: "livraison" },
      },
      {
        id: "CMD-58227",
        produit: "Coffret soin visage",
        quantite: 2,
        montantPaye: 27000,
        retenueLogistique: 1800,
        retenueOperation: 1350,
        statut: { type: "etape", etape: "preparation" },
      },
      {
        id: "CMD-58219",
        produit: "Baume corps karité",
        quantite: 1,
        montantPaye: 8000,
        retenueLogistique: 700,
        retenueOperation: 400,
        statut: { type: "etape", etape: "attente" },
      },
      {
        id: "CMD-58204",
        produit: "Huile capillaire ricin",
        quantite: 3,
        montantPaye: 21000,
        retenueLogistique: 1500,
        retenueOperation: 1050,
        statut: { type: "livree", heuresRestantes: 58 },
      },
    ],
  },
  {
    cle: "hier",
    date: "Hier · 7 septembre",
    dateEn: "Yesterday · September 7",
    commandes: [
      {
        id: "CMD-58166",
        produit: "Sérum éclat 30 ml",
        quantite: 1,
        montantPaye: 12500,
        retenueLogistique: 900,
        retenueOperation: 625,
        statut: { type: "livree", heuresRestantes: 6 },
      },
      {
        id: "CMD-58159",
        produit: "Crème hydratante 50 ml",
        quantite: 1,
        montantPaye: 9500,
        retenueLogistique: 750,
        retenueOperation: 475,
        statut: { type: "disponible" },
      },
      {
        id: "CMD-58148",
        produit: "Coffret soin visage",
        quantite: 1,
        montantPaye: 13500,
        retenueLogistique: 900,
        retenueOperation: 675,
        statut: { type: "litige", issue: null },
      },
      {
        id: "CMD-58140",
        produit: "Baume corps karité",
        quantite: 2,
        montantPaye: 16000,
        retenueLogistique: 1400,
        retenueOperation: 800,
        statut: { type: "litige", issue: "changement-colis" },
      },
      {
        id: "CMD-58125",
        produit: "Sérum éclat 30 ml",
        quantite: 1,
        montantPaye: 12500,
        retenueLogistique: 900,
        retenueOperation: 625,
        statut: { type: "litige", issue: "retour-fonds" },
      },
      {
        id: "CMD-58133",
        produit: "Huile capillaire ricin",
        quantite: 1,
        montantPaye: 7000,
        retenueLogistique: 600,
        retenueOperation: 350,
        statut: { type: "refusee" },
      },
      {
        id: "CMD-58117",
        produit: "Crème hydratante 50 ml",
        quantite: 1,
        montantPaye: 9500,
        retenueLogistique: 750,
        retenueOperation: 475,
        statut: { type: "relance" },
      },
    ],
  },
];

export function formatCfa(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR").replace(/ /g, " ")} F`;
}

export function formatDevise(montant: number, devise: "cfa" | "eur" | "usd"): string {
  const valeur = montant * TAUX[devise];
  const suffixe = DEVISES.find((d) => d.key === devise)!.suffixe;
  if (devise === "cfa") return `${Math.round(valeur).toLocaleString("fr-FR").replace(/ /g, " ")} ${suffixe}`;
  return `${valeur.toFixed(2).replace(".", ",")} ${suffixe}`;
}

export function netDe(c: Commande): number {
  return c.montantPaye - c.retenueLogistique - c.retenueOperation;
}

export function estSuspendue(c: Commande): boolean {
  return (c.statut.type === "litige" && c.statut.issue !== "faveur") || c.statut.type === "relance";
}

export function TriangleIcon({ filled = false, className = "" }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-2.5 w-2.5 ${className}`} aria-hidden>
      <path
        d="M12 4 21 20 3 20Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnneauCompteARebours({
  heuresRestantes,
  size = 36,
  etiquette,
}: {
  heuresRestantes: number;
  size?: number;
  /** Texte affiché au centre — par défaut "{heuresRestantes}h" ; à fournir pour les valeurs en minutes. */
  etiquette?: string;
}) {
  const rayon = size === 36 ? 15 : (size / 36) * 15;
  const circonference = 2 * Math.PI * rayon;
  const pct = Math.min(1, Math.max(0, heuresRestantes / DELAI_DISPONIBILITE));
  // Échelle en racine (pct^0.4, pas pct brut) : en linéaire, tout ce qui
  // passe sous ~1h sur les 72h totales donne un offset quasi nul, donc un
  // arc visible quasi complet — indiscernable du rond plein "Disponible"
  // (cf. capture envoyée, anneau "58 min" qui semblait figé/complet alors
  // qu'il restait du temps). La racine étire l'écart près de la fin tout en
  // gardant 0h→anneau vide et 72h→anneau plein aux deux bouts.
  const offset = circonference * Math.pow(pct, 0.4);
  const centre = size / 2;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ height: size, width: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" style={{ height: size, width: size }}>
        <circle cx={centre} cy={centre} r={rayon} fill="none" stroke="var(--dashboard-text)" strokeOpacity="0.1" strokeWidth="3" />
        <circle
          cx={centre}
          cy={centre}
          r={rayon}
          fill="none"
          stroke="#EC0C8C"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circonference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* "58 min"/"2 min" (étiquette custom, cf. Palier dans LireUneLigne)
          sont plus longs que "72h"/"6h" — même taille de texte fixe pour
          tous, ça collait aux bords du cercle. Police plus petite au-delà
          de 4 caractères pour garder de l'air. */}
      <span
        className={`font-bold text-[var(--dashboard-text)] ${
          (etiquette ?? `${heuresRestantes}h`).length > 4 ? "text-[7px]" : "text-[9px]"
        }`}
      >
        {etiquette ?? `${heuresRestantes}h`}
      </span>
    </div>
  );
}
