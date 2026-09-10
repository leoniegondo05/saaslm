"use client";

import { useRef, useState } from "react";
import { useDashboardLangue } from "./DashboardLanguageProvider";

/*
  Barre de recherche partagée, posée juste sous DashboardHeader (au-dessus
  des onglets de titre — AccueilNav, CommandesNav, ReglagesNav — ou
  directement au-dessus du contenu sur "Produits", qui n'a pas d'onglets) :
  Accueil, Produits, Commande, Réglages, cf. demande.

  État (texte tapé) géré ici, mais le filtrage reste au choix de chaque
  page : `onChange` est optionnel — une page qui ne le passe pas garde la
  barre purement visuelle, une page qui le passe reçoit le texte à chaque
  frappe et applique son propre filtre sur
  ses propres données (tableau produits, liste commandes, sections
  finances, cartes réglages — pas de forme commune entre elles, donc pas
  de logique de filtrage partagée ici).
*/
export default function DashboardSearchBar({
  placeholder,
  onChange,
}: {
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  const { t } = useDashboardLangue();
  const [value, setValueRaw] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const setValue = (next: string) => {
    setValueRaw(next);
    onChange?.(next);
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-[480px]">
      <label className="flex items-center gap-2.5 rounded-full bg-white/70 px-4 py-2.5 shadow-[0_2px_10px_rgba(20,18,32,0.06)] transition focus-within:shadow-[0_2px_14px_rgba(20,18,32,0.1)] dark:bg-white/10">
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder ?? t("Rechercher…", "Search…")}
          className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text)]/40 focus:outline-none sm:text-[13px]"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label={t("Effacer", "Clear")}
            className="shrink-0 text-[var(--dashboard-text)]/40 transition hover:text-[var(--dashboard-text)]/70"
          >
            <ClearIcon />
          </button>
        )}
      </label>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[var(--dashboard-text)]/40" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
