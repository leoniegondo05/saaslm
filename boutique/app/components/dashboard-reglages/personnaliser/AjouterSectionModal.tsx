"use client";

import { useEffect, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { SECTIONS_DEFAUT, sectionsDisponibles } from "./types";
import type { SectionId, SectionState } from "./types";

/*
  Fenêtre "Ajouter une section" — ouverte depuis le bouton du même nom en bas
  de SectionsPanel.tsx (onglet Sections). Bibliothèque de blocs de contenu
  génériques (Texte, Image et texte, Garanties...) : chacun n'existe qu'en un
  seul exemplaire par boutique (comme les 17 sections fixes de SECTIONS_DEFAUT)
  et disparaît de la grille une fois ajouté, cf. `sectionsDisponibles`.

  Même recette de fenêtre que ChangerCarteModal.tsx (fixed inset-0 + fond
  assombri + stopPropagation + Échap), thème du dashboard (var(--dashboard-*)).

  Pas de vrai "modèle de section réutilisable" côté API (aucun endpoint
  Laravel pour ça, cf. mémoire [[dashboard-mock-data-pending-laravel-api]]) :
  le pied "Sections enregistrées" ci-dessous reste informatif — il rappelle
  juste que les sections déjà ajoutées ("les-deux", cf. types.ts) sont déjà
  visibles sur l'accueil et la page de commande, plutôt que de prétendre à
  un vrai copier-coller de section entre pages.
*/

export default function AjouterSectionModal({
  sections,
  onAjouter,
  onFermer,
}: {
  sections: SectionState[];
  onAjouter: (id: SectionId) => void;
  onFermer: () => void;
}) {
  const { t } = useDashboardLangue();
  const [recherche, setRecherche] = useState("");
  const [plieeReutiliser, setPlieeReutiliser] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  const disponibles = sectionsDisponibles(sections);
  const q = recherche.trim().toLowerCase();
  const filtrees = q
    ? disponibles.filter((d) => d.label.toLowerCase().includes(q) || d.labelEn.toLowerCase().includes(q))
    : disponibles;

  const ajoutees = sections.filter((s) => SECTIONS_DEFAUT.find((d) => d.id === s.id)?.libre);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={onFermer}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-[28px] bg-[var(--dashboard-card-bg)] p-5 text-[var(--dashboard-text)] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: "linear-gradient(135deg,var(--color-brand-pink),var(--color-brand-purple))" }}
          >
            <PlusIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold" style={{ fontFamily: "var(--font-bricolage)" }}>
              {t("Ajouter une section", "Add a section")}
            </p>
            <p className="text-[10.5px] font-semibold text-brand-pink">{t("Bibliothèque", "Library")}</p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            aria-label={t("Fermer", "Close")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--dashboard-text)]/50 transition hover:bg-[var(--dashboard-text)]/[0.06]"
          >
            <CroixIcon />
          </button>
        </div>

        <div className="relative mt-4">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-text)]/35">
            <LoupeIcon />
          </span>
          <input
            autoFocus
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("Rechercher une section", "Search a section")}
            className="w-full rounded-full border border-[var(--dashboard-text)]/12 bg-[var(--dashboard-text)]/[0.04] py-2.5 pl-10 pr-3.5 text-[12px] outline-none focus:border-brand-pink"
          />
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5">
          {filtrees.length === 0 ? (
            <p className="px-1 py-6 text-center text-[11px] text-[var(--dashboard-text)]/45">
              {t("Aucune section ne correspond à cette recherche.", "No section matches this search.")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filtrees.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onAjouter(d.id)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-text)]/10 px-2.5 py-2.5 text-left transition hover:border-brand-pink/50 hover:bg-brand-pink/5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--dashboard-text)]/60">
                    <MiniIcon path={d.icone!} />
                  </span>
                  <span className="min-w-0 truncate text-[11px] font-semibold text-[var(--dashboard-text)]">
                    {t(d.label, d.labelEn)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-[var(--dashboard-text)]/10 pt-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
            <NuageIcon /> {t("Sections enregistrées", "Saved sections")}
          </p>
          <button
            type="button"
            onClick={() => setPlieeReutiliser((v) => !v)}
            disabled={ajoutees.length === 0}
            className="flex w-full items-center justify-between gap-2 text-left disabled:cursor-default"
          >
            <span className="text-[11px] font-semibold text-brand-pink">{t("Réutiliser sur une autre page", "Reuse on another page")}</span>
            <span className="shrink-0 text-[10.5px] font-semibold text-brand-pink">
              {texteNombreSections(ajoutees.length, t)}
            </span>
          </button>
          {!plieeReutiliser && ajoutees.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ajoutees.map((s) => {
                const def = SECTIONS_DEFAUT.find((d) => d.id === s.id)!;
                return (
                  <span key={s.id} className="rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[var(--dashboard-text)]/70">
                    {t(def.label, def.labelEn)}
                  </span>
                );
              })}
            </div>
          )}
          {!plieeReutiliser && ajoutees.length > 0 && (
            <p className="mt-1.5 text-[9.5px] leading-snug text-[var(--dashboard-text)]/40">
              {t("Déjà visibles sur l'accueil et la page de commande.", "Already visible on the home and order pages.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function texteNombreSections(n: number, t: (fr: string, en: string) => string): string {
  return t(`${n} section${n > 1 ? "s" : ""}`, `${n} section${n > 1 ? "s" : ""}`);
}

function MiniIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CroixIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LoupeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path d="m19 19-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function NuageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <path d="M7 17.5a4 4 0 0 1-.5-7.97 5 5 0 0 1 9.6-1.9A4.5 4.5 0 0 1 17.5 17.5H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
