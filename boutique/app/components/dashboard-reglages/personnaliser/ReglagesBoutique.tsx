"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { useDashboardBoutiqueLogo } from "../../DashboardBoutiqueLogoProvider";
import { ICONE_PAGE_LIBRE } from "./types";
import type { EditeurState, PageEntree, PixelRegieId, SectionId, VersionSnapshot } from "./types";

/*
  Onglet "Boutique" de l'éditeur (troisième onglet à côté de "Sections" et
  "Style", cf. SectionsPanel.tsx) : réglages qui valent pour toute la
  boutique plutôt que pour une section ou un modèle visuel — nom/logo,
  pages, éléments flottants, etc. Menu de gauche défini ici
  (BOUTIQUE_REGLAGES_DEFAUT) pour rester à côté du panneau de droite
  correspondant (ReglagesBoutique, exporté par défaut).

  Seul "Identité" a un contenu réel pour l'instant (nom + logo, sur le
  même principe que MaBoutique.tsx — logo partagé via
  DashboardBoutiqueLogoProvider, nom en état local le temps qu'un store
  partagé existe, cf. mémoire [[dashboard-mock-data-pending-laravel-api]]).
  Les autres catégories restent des emplacements réservés.
*/

export type BoutiqueReglageId =
  | "identite"
  | "pages"
  | "flottants"
  | "apres-commande"
  | "referencement"
  | "pixels"
  | "versions";

export const BOUTIQUE_REGLAGES_DEFAUT: {
  id: BoutiqueReglageId;
  label: string;
  labelEn: string;
  icone: string;
  sousTitre?: string;
  sousTitreEn?: string;
}[] = [
  {
    id: "identite",
    label: "Identité",
    labelEn: "Identity",
    icone: "M4 5h16v14H4Zm0 10 5-5 3 3 4-4 4 4M9 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
    sousTitre: "Logo et icône d'onglet",
    sousTitreEn: "Logo and tab icon",
  },
  {
    id: "pages",
    label: "Pages et modèles",
    labelEn: "Pages and templates",
    icone: "M6 3h9l4 4v14H6Zm9 0v4h4M9 11h6M9 15h6",
    sousTitre: "Toutes les pages de la boutique",
    sousTitreEn: "All the shop's pages",
  },
  { id: "flottants", label: "Éléments flottants", labelEn: "Floating elements", icone: "M4 5h13v11H8l-4 4Zm14-2h2v2m-2 5h2v2m-6-9h2v2" },
  { id: "apres-commande", label: "Après la commande", labelEn: "After checkout", icone: "M5 12.5 10 17l9-10" },
  { id: "referencement", label: "Référencement et partage", labelEn: "SEO and sharing", icone: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9m0-18c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9M3.5 9h17M3.5 15h17" },
  { id: "pixels", label: "Pixels publicitaires", labelEn: "Ad pixels", icone: "M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2.1 2.1M8.6 15.4l-2.1 2.1m11 0-2.1-2.1M8.6 8.6 6.5 6.5M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" },
  {
    id: "versions",
    label: "Versions et programmation",
    labelEn: "Versions and scheduling",
    icone: "M12 5v7l4.5 2.5M4 12a8 8 0 1 1 2.6 5.9M4 12v5m0-5h5",
    sousTitre: "Revenir en arrière, planifier",
    sousTitreEn: "Go back, schedule",
  },
];

export default function ReglagesBoutique({
  reglageBoutique,
  onOuvrirSection,
  state,
  setState,
  versions,
  onRestaurerVersion,
}: {
  reglageBoutique: BoutiqueReglageId;
  /** Bascule l'éditeur sur l'onglet "Sections" et sélectionne cette section (ex. "Grande image" de l'accueil) — cf. PersonnaliserBoutique.tsx. */
  onOuvrirSection?: (sectionId: SectionId) => void;
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  /** Instantanés pris à chaque "Enregistrer" (cf. PersonnaliserBoutique.tsx) — le plus récent en premier. */
  versions: VersionSnapshot[];
  onRestaurerVersion: (id: string) => void;
}) {
  const { t } = useDashboardLangue();
  const def = BOUTIQUE_REGLAGES_DEFAUT.find((r) => r.id === reglageBoutique)!;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3">
      <div className="mb-2.5 flex items-center gap-2 border-b border-[var(--dashboard-text)]/10 pb-2.5">
        <span
          className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: "linear-gradient(140deg,var(--color-brand-pink),var(--color-brand-purple))" }}
        >
          <MiniIconGros path={def.icone} />
        </span>
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold text-[var(--dashboard-text)]">{t(def.label, def.labelEn)}</p>
          {def.sousTitre && <p className="truncate text-[9px] text-[var(--dashboard-text)]/45">{t(def.sousTitre, def.sousTitreEn ?? def.sousTitre)}</p>}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {reglageBoutique === "identite" ? (
          <IdentiteReglages state={state} setState={setState} onOuvrirSection={onOuvrirSection} />
        ) : reglageBoutique === "pages" ? (
          <PagesEtModeles state={state} setState={setState} onOuvrirSection={onOuvrirSection} />
        ) : reglageBoutique === "flottants" ? (
          <ElementsFlottants state={state} setState={setState} />
        ) : reglageBoutique === "apres-commande" ? (
          <ApresLaCommande state={state} setState={setState} />
        ) : reglageBoutique === "referencement" ? (
          <ReferencementEtPartage state={state} setState={setState} />
        ) : reglageBoutique === "versions" ? (
          <VersionsEtProgrammation state={state} setState={setState} versions={versions} onRestaurerVersion={onRestaurerVersion} />
        ) : reglageBoutique === "pixels" ? (
          <PixelsPublicitaires state={state} setState={setState} />
        ) : (
          <Placeholder />
        )}
      </div>
    </div>
  );
}

function MiniIconGros({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GroupeTitre({ label }: { label: string }) {
  return (
    <p className="border-t border-[var(--dashboard-text)]/10 pt-2.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 first:border-t-0 first:pt-0">
      {label}
    </p>
  );
}

function Interrupteur({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`flex h-4.5 w-8 shrink-0 items-center rounded-full p-0.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${checked ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[var(--dashboard-text)]/20"}`}
    >
      <span className="h-3.5 w-3.5 rounded-full bg-white shadow" />
    </button>
  );
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10.5px] font-medium text-[var(--dashboard-text)]">{label}</p>
      {children}
    </div>
  );
}

function IdentiteReglages({
  state,
  setState,
  onOuvrirSection,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  /** Ouvre l'onglet "Sections" sur l'en-tête — nom et taille du logo se règlent là, pas ici (un seul réglage réel par notion). */
  onOuvrirSection?: (sectionId: SectionId) => void;
}) {
  const { t } = useDashboardLangue();
  const { logo, setLogo } = useDashboardBoutiqueLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconeInputRef = useRef<HTMLInputElement>(null);
  const iconeOnglet = state.identite.iconeOnglet;

  const choisirLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const lecteur = new FileReader();
    lecteur.onload = () => setLogo(lecteur.result as string);
    lecteur.readAsDataURL(fichier);
  };

  const choisirIcone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const lecteur = new FileReader();
    lecteur.onload = () => setState((s) => ({ ...s, identite: { ...s.identite, iconeOnglet: lecteur.result as string } }));
    lecteur.readAsDataURL(fichier);
  };

  return (
    <>
      <div>
        <GroupeTitre label={t("Logo", "Logo")} />
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          <LogoApercu fond="clair" logo={logo} />
          <LogoApercu fond="sombre" logo={logo} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("Ajouter un logo", "Upload a logo")}
            className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[var(--dashboard-text)]/20 text-[var(--dashboard-text)]/40 transition hover:border-brand-pink/50 hover:text-brand-pink"
          >
            <UploadIcon />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={choisirLogo} className="hidden" />
      </div>

      <div>
        <GroupeTitre label={t("Nom et taille du logo", "Logo name and size")} />
        <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--dashboard-text)]/45">
          {t("Réglés depuis l'en-tête de la boutique, visibles sur l'aperçu en direct.", "Set from the shop header, visible right away in the live preview.")}
        </p>
        <button
          type="button"
          onClick={() => onOuvrirSection?.("entete")}
          className="mt-1.5 text-[10px] font-semibold text-brand-pink transition hover:brightness-90"
        >
          {t("Ouvrir les réglages de l'en-tête", "Open header settings")}
        </button>
      </div>

      <div>
        <GroupeTitre label={t("Icône de l'onglet", "Tab icon")} />
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {iconeOnglet ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
              <img src={iconeOnglet} alt="" className="h-5 w-5 rounded object-cover" />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/40">
                <ImageIcon />
              </span>
            )}
            <p className="text-[10.5px] font-medium text-[var(--dashboard-text)]">{t("Image carrée", "Square image")}</p>
          </div>
          <button
            type="button"
            onClick={() => iconeInputRef.current?.click()}
            className="text-[10px] font-semibold text-brand-pink transition hover:brightness-90"
          >
            {t("Remplacer", "Replace")}
          </button>
        </div>
        <input ref={iconeInputRef} type="file" accept="image/*" onChange={choisirIcone} className="hidden" />
      </div>

      <div>
        <GroupeTitre label={t("Informations toujours visibles", "Always-visible information")} />
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-[10.5px] font-medium text-[var(--dashboard-text)]">
            {t("Nom, téléphone, email, localisation", "Name, phone, email, location")}
          </p>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--dashboard-text)]/[0.06] px-2 py-0.5 text-[9px] font-semibold text-[var(--dashboard-text)]/60">
            <CadenasIcon /> {t("Fixes", "Fixed")}
          </span>
        </div>
      </div>
    </>
  );
}

function LogoApercu({ fond, logo }: { fond: "clair" | "sombre"; logo: string | null }) {
  return (
    <div
      className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[var(--dashboard-text)]/10"
      style={{ background: fond === "clair" ? "#fff" : "#141220" }}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
        <img src={logo} alt="" className="h-3/5 w-3/5 object-contain" />
      ) : (
        <span
          className="h-3/5 w-3/5 rounded-full"
          style={{ background: "linear-gradient(140deg,var(--color-brand-pink),var(--color-brand-purple))" }}
        />
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 15V5m0 0 4 4m-4-4-4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M4 5h16v14H4Zm0 10 5-5 3 3 4-4 4 4M9 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CadenasIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PagesEtModeles({
  state,
  setState,
  onOuvrirSection,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  onOuvrirSection?: (sectionId: SectionId) => void;
}) {
  const { t } = useDashboardLangue();
  const { liste: pages, pageChoisie, produitsParPage, suiteDeLaListe, filtresEtTri } = state.pages;
  const [creation, setCreation] = useState<"page" | "modele" | null>(null);
  const [pageOuverteId, setPageOuverteId] = useState<string | null>(null);

  const majPages = (patch: Partial<EditeurState["pages"]>) => setState((s) => ({ ...s, pages: { ...s.pages, ...patch } }));

  // "Accueil" est "construite en sections" (cf. PAGES_DEFAUT) : l'ouvrir
  // n'a pas de réglages propres à afficher ici, ça bascule direct sur le
  // vrai éditeur de sa première section (onglet "Sections" à gauche,
  // ReglagesSection.tsx à droite) plutôt que de dupliquer ce panneau.
  const ouvrirPage = (page: PageEntree) => {
    if (page.id === "accueil" && onOuvrirSection) {
      onOuvrirSection("grande-image");
      return;
    }
    setPageOuverteId(page.id);
  };

  const creerEntree = (nom: string) => {
    const id = `${creation}-${Date.now()}`;
    majPages({
      liste: [
        ...pages,
        {
          id,
          label: nom,
          labelEn: nom,
          sousTitre: creation === "modele" ? "Modèle" : "Page libre",
          sousTitreEn: creation === "modele" ? "Template" : "Free page",
          icone: ICONE_PAGE_LIBRE,
        },
      ],
      pageChoisie: id,
    });
    setCreation(null);
  };

  const pageOuverte = pageOuverteId ? pages.find((p) => p.id === pageOuverteId) ?? null : null;

  if (pageOuverte) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPageOuverteId(null)}
          className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[var(--dashboard-text)]/60 transition hover:text-[var(--dashboard-text)]"
        >
          <span className="rotate-180"><ChevronIcon /></span> {t("Pages", "Pages")}
        </button>
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
            <MiniIconGros path={pageOuverte.icone} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold text-[var(--dashboard-text)]">{t(pageOuverte.label, pageOuverte.labelEn)}</p>
            {pageOuverte.sousTitre && (
              <p className="truncate text-[9.5px] text-[var(--dashboard-text)]/45">{t(pageOuverte.sousTitre, pageOuverte.sousTitreEn ?? pageOuverte.sousTitre)}</p>
            )}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-[var(--dashboard-text)]/45">
          {t("Réglages détaillés de cette page bientôt disponibles.", "Detailed settings for this page coming soon.")}
        </p>
      </>
    );
  }

  return (
    <>
      <div>
        <GroupeTitre label={t("Pages", "Pages")} />
        <div className="mt-1.5 flex flex-col gap-1">
          {pages.map((page) => {
            const selectionnee = page.id === pageChoisie;
            return (
              <div
                key={page.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  majPages({ pageChoisie: page.id });
                  if (page.id === "accueil") ouvrirPage(page);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  majPages({ pageChoisie: page.id });
                  if (page.id === "accueil") ouvrirPage(page);
                }}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                  selectionnee
                    ? "bg-brand-pink/10 ring-1 ring-brand-pink/40"
                    : "hover:bg-[var(--dashboard-text)]/[0.05]"
                }`}
              >
                <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60">
                  <MiniIconGros path={page.icone} />
                </span>
                <span className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-[var(--dashboard-text)]">{t(page.label, page.labelEn)}</p>
                  {page.sousTitre && (
                    <p className="truncate text-[9px] text-[var(--dashboard-text)]/45">{t(page.sousTitre, page.sousTitreEn ?? page.sousTitre)}</p>
                  )}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ouvrirPage(page);
                  }}
                  aria-label={t("Ouvrir la page", "Open page")}
                  className="shrink-0 text-[var(--dashboard-text)]/30 transition hover:text-[var(--dashboard-text)]"
                >
                  <ChevronIcon />
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCreation("page")}
            className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[var(--dashboard-text)]/15 px-2.5 py-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.05]"
          >
            <PlusIcon /> {t("Créer une page", "Create a page")}
          </button>
          <button
            type="button"
            onClick={() => setCreation("modele")}
            className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[var(--dashboard-text)]/15 px-2.5 py-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.05]"
          >
            <PlusIcon /> {t("Créer un modèle", "Create a template")}
          </button>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Page de rayon", "Category page")} />
        <div className="mt-1.5 space-y-3">
          <Ligne label={t("Produits par page", "Products per page")}>
            <input
              type="number"
              min={1}
              value={produitsParPage}
              onChange={(e) => majPages({ produitsParPage: Number(e.target.value) || 1 })}
              className="w-12 rounded-lg border border-[var(--dashboard-text)]/15 bg-transparent px-1.5 py-0.5 text-right text-[10.5px] font-semibold text-[var(--dashboard-text)]"
            />
          </Ligne>

          <div>
            <p className="mb-1.5 text-[10.5px] font-medium text-[var(--dashboard-text)]">{t("Suite de la liste", "Pagination")}</p>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1">
              {([
                ["numeros", t("Numéros", "Numbers")],
                ["voir-plus", t("Voir plus", "Load more")],
                ["automatique", t("Automatique", "Automatic")],
              ] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => majPages({ suiteDeLaListe: v })}
                  className={`rounded-lg py-1.5 text-[10px] font-semibold transition ${
                    suiteDeLaListe === v ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Ligne label={t("Filtres et tri", "Filters and sorting")}>
            <Interrupteur checked={filtresEtTri} onChange={(v) => majPages({ filtresEtTri: v })} />
          </Ligne>
        </div>
      </div>

      {creation && (
        <CreerPageOuModeleModal
          type={creation}
          onFermer={() => setCreation(null)}
          onCreer={creerEntree}
        />
      )}
    </>
  );
}

function CreerPageOuModeleModal({
  type,
  onFermer,
  onCreer,
}: {
  type: "page" | "modele";
  onFermer: () => void;
  onCreer: (nom: string) => void;
}) {
  const { t } = useDashboardLangue();
  const [nom, setNom] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  const peutCreer = nom.trim().length > 0;
  const valider = () => peutCreer && onCreer(nom.trim().slice(0, 60));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={onFermer}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <h2 className="text-base font-bold text-[var(--dashboard-text)]">
          {type === "modele" ? t("Créer un modèle", "Create a template") : t("Créer une page", "Create a page")}
        </h2>
        <p className="mt-1 text-[11px] text-[var(--dashboard-text)]/50">
          {type === "modele"
            ? t("Un modèle réutilisable pour un groupe de produits.", "A reusable template for a group of products.")
            : t("Une page libre, ajoutée à la liste des pages.", "A free page, added to the pages list.")}
        </p>

        <p className="mt-3.5 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">
          {t("Nom", "Name")}
        </p>
        <input
          autoFocus
          value={nom}
          onChange={(e) => setNom(e.target.value.slice(0, 60))}
          onKeyDown={(e) => e.key === "Enter" && valider()}
          placeholder={type === "modele" ? t("Ex. Coffrets", "E.g. Gift sets") : t("Ex. Foire aux questions", "E.g. FAQ")}
          className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.04] px-3 py-2.5 text-sm text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onFermer}
            className="flex-1 rounded-full border border-[var(--dashboard-text)]/15 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
          >
            {t("Annuler", "Cancel")}
          </button>
          <button
            type="button"
            onClick={valider}
            disabled={!peutCreer}
            className="flex-[1.4] rounded-full bg-[#141220] py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-pink"
          >
            {type === "modele" ? t("Créer le modèle", "Create the template") : t("Créer la page", "Create the page")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ElementsFlottants({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const f = state.flottants;
  const maj = (patch: Partial<EditeurState["flottants"]>) =>
    setState((s) => ({ ...s, flottants: { ...s.flottants, ...patch } }));

  return (
    <>
      <div>
        <GroupeTitre label={t("Bouton de commande fixe", "Fixed order button")} />
        <div className="mt-1.5">
          <Ligne label={t("Sur téléphone", "On mobile")}>
            <Interrupteur checked={f.boutonCommandeTelephone} onChange={(v) => maj({ boutonCommandeTelephone: v })} />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Bouton WhatsApp", "WhatsApp button")} />
        <div className="mt-1.5 space-y-3">
          <Ligne label={t("Afficher", "Show")}>
            <Interrupteur checked={f.whatsappAfficher} onChange={(v) => maj({ whatsappAfficher: v })} />
          </Ligne>
          <Ligne label={t("Côté", "Side")}>
            <SegmentPills
              options={[
                ["droite", t("Droite", "Right")],
                ["gauche", t("Gauche", "Left")],
              ]}
              value={f.whatsappCote}
              onChange={(v) => maj({ whatsappCote: v })}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Autres", "Other")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t('Onglet « Avis » sur le côté', '"Reviews" tab on the side')}>
            <Interrupteur checked={f.ongletAvisCote} onChange={(v) => maj({ ongletAvisCote: v })} />
          </Ligne>
          <Ligne label={t('Bouton « Retour en haut »', '"Back to top" button')}>
            <Interrupteur checked={f.boutonRetourHaut} onChange={(v) => maj({ boutonRetourHaut: v })} />
          </Ligne>
        </div>
      </div>
    </>
  );
}

function SegmentPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--dashboard-text)]/10 p-0.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9.5px] font-semibold transition ${
            value === v ? "bg-white text-[#141220] shadow-sm" : "text-[var(--dashboard-text)]/50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const champBoxClasses =
  "mt-1.5 w-full rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-2.5 py-2 text-[10.5px] font-medium text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/50";

function Champ({
  label,
  value,
  onChange,
  multiline = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  multiline?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{label}</p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          rows={2}
          className={`${champBoxClasses} resize-none leading-relaxed`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          className={`${champBoxClasses} ${readOnly ? "text-[var(--dashboard-text)]/50" : ""}`}
        />
      )}
    </div>
  );
}

/*
  Après la commande : page de confirmation affichée au client, offre
  complémentaire proposée avant expédition, et message de confirmation
  envoyé (SMS ou WhatsApp). Tout est mock local pour l'instant, sur le
  même principe que les autres onglets (cf.
  [[dashboard-mock-data-pending-laravel-api]]) — pas encore de sauvegarde
  ni d'envoi réel.
*/
const PRODUITS_OFFRE_MOCK = ["Crème de jour", "Sérum éclat 30 ml", "Baume à lèvres", "Huile démêlante"];

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{label}</p>
      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${champBoxClasses} mt-0 appearance-none pr-7`}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[var(--dashboard-text)]/40">
          <ChevronIcon />
        </span>
      </div>
    </div>
  );
}

function ApresLaCommande({ state, setState }: { state: EditeurState; setState: (updater: (s: EditeurState) => EditeurState) => void }) {
  const { t } = useDashboardLangue();
  const c = state.apresCommande;
  const maj = (patch: Partial<EditeurState["apresCommande"]>) => setState((s) => ({ ...s, apresCommande: { ...s.apresCommande, ...patch } }));

  return (
    <>
      <div>
        <GroupeTitre label={t("Page de confirmation", "Confirmation page")} />
        <div className="mt-1.5 space-y-2.5">
          <Champ label={t("Titre", "Title")} value={c.titre} onChange={(v) => maj({ titre: v })} />
          <Champ label={t("Message", "Message")} value={c.message} onChange={(v) => maj({ message: v })} multiline />
        </div>
        <div className="mt-2.5 space-y-2.5">
          <Ligne label={t("Récapitulatif", "Order summary")}>
            <Interrupteur checked={c.recapitulatif} onChange={(v) => maj({ recapitulatif: v })} />
          </Ligne>
          <Ligne label={t("Lien de suivi", "Tracking link")}>
            <Interrupteur checked={c.lienDeSuivi} onChange={(v) => maj({ lienDeSuivi: v })} />
          </Ligne>
          <Ligne label={t("Bouton WhatsApp", "WhatsApp button")}>
            <Interrupteur checked={c.boutonWhatsapp} onChange={(v) => maj({ boutonWhatsapp: v })} />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Offre complémentaire", "Add-on offer")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Proposer avant expédition", "Offer before shipping")}>
            <Interrupteur checked={c.proposerAvantExpedition} onChange={(v) => maj({ proposerAvantExpedition: v })} />
          </Ligne>
          <Select label={t("Produit", "Product")} value={c.produitOffre} onChange={(v) => maj({ produitOffre: v })} options={PRODUITS_OFFRE_MOCK} />
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{t("Remise", "Discount")}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={100}
                value={c.remise}
                onChange={(e) => maj({ remise: Number(e.target.value) || 0 })}
                className="w-14 rounded-lg border border-[var(--dashboard-text)]/15 bg-transparent px-2 py-1.5 text-right text-[10.5px] font-semibold text-[var(--dashboard-text)]"
              />
              <span className="text-[10.5px] font-semibold text-[var(--dashboard-text)]/60">%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Message au client", "Message to the customer")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Envoyé par", "Sent by")}>
            <SegmentPills
              options={[
                ["sms", t("SMS", "SMS")],
                ["whatsapp", t("WhatsApp", "WhatsApp")],
              ]}
              value={c.envoyePar}
              onChange={(v) => maj({ envoyePar: v })}
            />
          </Ligne>
          <Champ label={t("Texte", "Text")} value={c.texteClient} onChange={(v) => maj({ texteClient: v })} multiline />
        </div>
      </div>
    </>
  );
}

/*
  Référencement et partage : titre/description SEO + lien du produit,
  aperçu du lien tel que partagé (réseaux sociaux, messageries), et
  visibilité dans les moteurs de recherche. Produit de démo repris de
  DROP_PRODUITS (dropCatalogue.ts, slug "serum-eclat-30ml") pour rester
  cohérent avec le reste du dashboard — aucune vraie photo produit
  disponible pour l'instant (cf. [[dashboard-mock-data-pending-laravel-api]]),
  d'où la vignette en dégradé de marque plutôt qu'une image inventée.
*/
function ReferencementEtPartage({ state, setState }: { state: EditeurState; setState: (updater: (s: EditeurState) => EditeurState) => void }) {
  const { t } = useDashboardLangue();
  const s = state.seo;
  const maj = (patch: Partial<EditeurState["seo"]>) => setState((st) => ({ ...st, seo: { ...st.seo, ...patch } }));
  const lienProduit = ".../awa-beaute/serum-eclat-30-ml";
  const descriptionCourte = s.description.split(".")[0].trim() + ".";

  return (
    <>
      <div className="space-y-2.5">
        <Champ label={t("Titre dans les moteurs de recherche", "Title in search engines")} value={s.titre} onChange={(v) => maj({ titre: v })} />
        <Champ label={t("Description", "Description")} value={s.description} onChange={(v) => maj({ description: v })} multiline />
        <Champ label={t("Lien du produit", "Product link")} value={lienProduit} readOnly />
      </div>

      <div>
        <GroupeTitre label={t("Aperçu du lien partagé", "Shared link preview")} />
        <div className="mt-1.5 overflow-hidden rounded-xl border border-[var(--dashboard-text)]/10">
          <div
            className="flex aspect-[16/9] items-center justify-center"
            style={{ background: "linear-gradient(135deg,var(--color-brand-pink),var(--color-brand-purple))" }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
              <MiniIconGros path="M8.5 9h7v10.5h-7Zm1.8 0V6.2a1.7 1.7 0 0 1 1.7-1.7 1.7 1.7 0 0 1 1.7 1.7V9M8.5 13h7" />
            </span>
          </div>
          <div className="bg-[var(--dashboard-card-bg)] p-2.5">
            <p className="truncate text-[10.5px] font-bold text-[var(--dashboard-text)]">{s.titre}</p>
            <p className="truncate text-[9.5px] text-[var(--dashboard-text)]/55">{descriptionCourte}</p>
            <p className="mt-0.5 truncate text-[8.5px] uppercase tracking-[0.06em] text-[var(--dashboard-text)]/35">.../awa-beaute</p>
          </div>
        </div>
      </div>

      <Ligne label={t("Visible dans les moteurs de recherche", "Visible in search engines")}>
        <Interrupteur checked={s.visible} onChange={(v) => maj({ visible: v })} />
      </Ligne>
    </>
  );
}

/*
  Versions et programmation : revenir à une version réellement enregistrée
  (instantané pris à chaque clic sur "Enregistrer", cf. `versions` fourni
  par PersonnaliserBoutique.tsx — plus de liste figée), préparer un
  brouillon, et régler une date de mise en ligne. Le brouillon et la
  programmation restent des intentions persistées (localStorage) plutôt que
  des actions réellement exécutées : aucune API ne peut encore les déclencher,
  cf. [[dashboard-mock-data-pending-laravel-api]].
*/
function formatDateHeure(date: Date, t: (fr: string, en: string) => string) {
  const jour = date.getDate();
  const moisFr = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][date.getMonth()];
  const moisEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
  const heure = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const annee = date.getFullYear();
  return t(
    `${jour} ${moisFr} ${annee} · ${heure} h ${minute}`,
    `${moisEn} ${jour}, ${annee} · ${heure}:${minute}`
  );
}

function VersionsEtProgrammation({
  state,
  setState,
  versions,
  onRestaurerVersion,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  versions: VersionSnapshot[];
  onRestaurerVersion: (id: string) => void;
}) {
  const { t } = useDashboardLangue();
  const prog = state.programmation;
  const majProg = (patch: Partial<EditeurState["programmation"]>) => setState((s) => ({ ...s, programmation: { ...s.programmation, ...patch } }));
  const [choixOuvert, setChoixOuvert] = useState(false);
  const [dateModalOuverte, setDateModalOuverte] = useState(false);

  const derniereVersion = versions[0];
  const dateProgrammation = new Date(prog.dateIso);

  return (
    <>
      <div>
        <GroupeTitre label={t("Versions", "Versions")} />
        <div className="mt-1.5 space-y-3">
          <Ligne label={t("Dernière sauvegarde", "Last saved version")}>
            <span className="text-[10.5px] font-semibold text-brand-pink">
              {derniereVersion ? formatDateHeure(new Date(derniereVersion.horodatage), t) : t("Aucune pour l'instant", "None yet")}
            </span>
          </Ligne>

          <Ligne label={t("Revenir à une version", "Revert to a version")}>
            <button
              type="button"
              onClick={() => setChoixOuvert(true)}
              disabled={versions.length === 0}
              className="text-[10px] font-semibold text-brand-pink transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("Choisir", "Choose")}
            </button>
          </Ligne>

          <Ligne label={t("Préparer un brouillon", "Prepare a draft")}>
            <Interrupteur checked={prog.brouillon} onChange={(v) => majProg({ brouillon: v })} />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Programmation", "Scheduling")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Mettre en ligne à une date", "Publish on a date")}>
            <Interrupteur checked={prog.active} onChange={(v) => majProg({ active: v })} />
          </Ligne>

          <button
            type="button"
            onClick={() => prog.active && setDateModalOuverte(true)}
            disabled={!prog.active}
            className={`w-full rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.04] px-3 py-2.5 text-left transition ${
              prog.active ? "hover:bg-[var(--dashboard-text)]/[0.07]" : "cursor-not-allowed opacity-40"
            }`}
          >
            <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{t("Date", "Date")}</p>
            <p className="text-[11px] font-semibold text-[var(--dashboard-text)]">{formatDateHeure(dateProgrammation, t)}</p>
          </button>
        </div>
      </div>

      {choixOuvert && (
        <ChoisirVersionModal
          versions={versions}
          onFermer={() => setChoixOuvert(false)}
          onRestaurer={(id) => {
            onRestaurerVersion(id);
            setChoixOuvert(false);
          }}
        />
      )}

      {dateModalOuverte && (
        <ProgrammerDateModal
          date={dateProgrammation}
          onFermer={() => setDateModalOuverte(false)}
          onValider={(d) => {
            majProg({ dateIso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` });
            setDateModalOuverte(false);
          }}
        />
      )}
    </>
  );
}

function ChoisirVersionModal({
  versions,
  onFermer,
  onRestaurer,
}: {
  versions: VersionSnapshot[];
  onFermer: () => void;
  onRestaurer: (id: string) => void;
}) {
  const { t } = useDashboardLangue();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={onFermer}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <h2 className="text-base font-bold text-[var(--dashboard-text)]">{t("Revenir à une version", "Revert to a version")}</h2>
        <p className="mt-1 text-[11px] text-[var(--dashboard-text)]/50">
          {t("La boutique reprendra l'apparence de la version choisie.", "The shop will switch back to the appearance of the chosen version.")}
        </p>

        <div className="mt-3.5 flex max-h-64 flex-col gap-1 overflow-y-auto">
          {versions.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onRestaurer(v.id)}
              className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              <span>
                <p className="text-[11px] font-semibold text-[var(--dashboard-text)]">{formatDateHeure(new Date(v.horodatage), t)}</p>
                <p className="text-[9px] text-[var(--dashboard-text)]/45">{v.label}</p>
              </span>
              {i === 0 && (
                <span className="shrink-0 rounded-full bg-brand-pink/10 px-2 py-0.5 text-[8.5px] font-semibold text-brand-pink">
                  {t("Plus récente", "Most recent")}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onFermer}
          className="mt-4 w-full rounded-full border border-[var(--dashboard-text)]/15 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
        >
          {t("Annuler", "Cancel")}
        </button>
      </div>
    </div>
  );
}

function ProgrammerDateModal({
  date,
  onFermer,
  onValider,
}: {
  date: Date;
  onFermer: () => void;
  onValider: (d: Date) => void;
}) {
  const { t } = useDashboardLangue();
  const pad = (n: number) => String(n).padStart(2, "0");
  const [jour, setJour] = useState(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  const [heure, setHeure] = useState(`${pad(date.getHours())}:${pad(date.getMinutes())}`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer]);

  const valider = () => {
    const [annee, mois, jourNum] = jour.split("-").map(Number);
    const [h, m] = heure.split(":").map(Number);
    if (!annee || !mois || !jourNum) return;
    onValider(new Date(annee, mois - 1, jourNum, h || 0, m || 0));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={onFermer}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] bg-[var(--dashboard-card-bg)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <h2 className="text-base font-bold text-[var(--dashboard-text)]">{t("Mettre en ligne à une date", "Publish on a date")}</h2>

        <div className="mt-3.5 flex gap-2">
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{t("Date", "Date")}</p>
            <input
              type="date"
              value={jour}
              onChange={(e) => setJour(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.04] px-3 py-2.5 text-[11px] font-semibold text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
            />
          </div>
          <div className="w-24">
            <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{t("Heure", "Time")}</p>
            <input
              type="time"
              value={heure}
              onChange={(e) => setHeure(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.04] px-3 py-2.5 text-[11px] font-semibold text-[var(--dashboard-text)] outline-none focus:border-brand-pink"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onFermer}
            className="flex-1 rounded-full border border-[var(--dashboard-text)]/15 py-2.5 text-xs font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-text)]/[0.05]"
          >
            {t("Annuler", "Cancel")}
          </button>
          <button
            type="button"
            onClick={valider}
            className="flex-[1.4] rounded-full bg-[#141220] py-2.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-brand-pink"
          >
            {t("Programmer", "Schedule")}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
  Pixels publicitaires : régies (Meta, TikTok, Google, YouTube) reçues par
  la boutique et les trois événements qu'elles reçoivent (vue de page,
  début de commande, commande validée), envoyés sur toutes les pages —
  fixe pour l'instant, cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
  Identifiant mock affiché une fois la régie activée (Meta et TikTok
  démarrent activés, Google et YouTube démarrent éteints) — pas de
  vérification d'identifiant réel tant que l'API Laravel n'existe pas, donc
  les quatre interrupteurs restent librement activables.
*/
const REGIES_PIXELS = [
  { id: "meta", nom: "Meta", identifiantMock: "742019663488521", actifParDefaut: true },
  { id: "tiktok", nom: "TikTok", identifiantMock: "CQK3H93C77U9G6NJ8G1G", actifParDefaut: true },
  { id: "google", nom: "Google", identifiantMock: "AW-108452937", actifParDefaut: false },
  { id: "youtube", nom: "YouTube", identifiantMock: "UC-8f0a2c9d41", actifParDefaut: false },
] as const;

function PixelsPublicitaires({ state, setState }: { state: EditeurState; setState: (updater: (s: EditeurState) => EditeurState) => void }) {
  const { t } = useDashboardLangue();
  const actives = state.pixels.actives;
  const setActif = (id: PixelRegieId, v: boolean) => setState((s) => ({ ...s, pixels: { actives: { ...s.pixels.actives, [id]: v } } }));

  return (
    <>
      <div>
        <GroupeTitre label={t("Régies", "Ad networks")} />
        <div className="mt-1.5 space-y-2.5">
          {REGIES_PIXELS.map((regie) => {
            const actif = !!actives[regie.id];
            return (
              <div key={regie.id} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-text)]/[0.06]"
                  style={!actif ? { color: "color-mix(in srgb, var(--dashboard-text) 35%, transparent)" } : undefined}
                >
                  <RegieMiniIcon id={regie.id} actif={actif} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-bold text-[var(--dashboard-text)]">{regie.nom}</p>
                  <p className="truncate text-[9px] text-[var(--dashboard-text)]/45">
                    {actif ? regie.identifiantMock : t("Aucun identifiant", "No ID")}
                  </p>
                </div>
                <Interrupteur checked={actif} onChange={(v) => setActif(regie.id, v)} />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Événements envoyés", "Events sent")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Vue de la page", "Page view")}>
            <PillFixe>{t("Toujours", "Always")}</PillFixe>
          </Ligne>
          <Ligne label={t("Début de commande", "Order started")}>
            <PillFixe>{t("Toujours", "Always")}</PillFixe>
          </Ligne>
          <Ligne label={t("Commande validée", "Order confirmed")}>
            <PillFixe>{t("Toujours", "Always")}</PillFixe>
          </Ligne>
          <Ligne label={t("Pages concernées", "Pages covered")}>
            <PillFixe>{t("Toutes", "All")}</PillFixe>
          </Ligne>
        </div>
      </div>
    </>
  );
}

function PillFixe({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--dashboard-text)]/[0.06] px-2 py-1 text-[9px] font-semibold text-[var(--dashboard-text)]/60">
      <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden>
        <rect x="6" y="10.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  );
}

/*
  Icônes de régie : en gris (currentColor, hérité du conteneur) tant que la
  régie est éteinte, en couleur de marque réelle une fois activée — retour
  utilisateur du 2026-09-18 (l'ancien carré à fond dégradé rose/violet
  derrière chaque logo ne plaisait pas). Google reste un tracé multicolore
  fixe (ses quatre couleurs de marque) même éteint, sinon le "G" perd toute
  lisibilité en gris uni.
*/
function RegieMiniIcon({ id, actif }: { id: string; actif: boolean }) {
  switch (id) {
    case "meta":
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
          <path
            d="M6 16.5c1.6 0 2.7-1.3 3.8-3.3.8-1.4 1.5-2.7 2.2-2.7s1.4 1.3 2.2 2.7c1.1 2 2.2 3.3 3.8 3.3s2.9-1.5 2.9-4.5-1.3-4.5-2.9-4.5c-1.6 0-2.7 1.3-3.8 3.3-.8 1.4-1.5 2.7-2.2 2.7s-1.4-1.3-2.2-2.7C8.7 8.8 7.6 7.5 6 7.5 4.4 7.5 3.1 9 3.1 12S4.4 16.5 6 16.5Z"
            fill="none"
            stroke={actif ? "#0866FF" : "currentColor"}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
          <path
            d="M14 4v10.2a2.8 2.8 0 1 1-2.4-2.77M14 4c.3 2.1 1.8 3.6 4 3.9"
            fill="none"
            stroke={actif ? "#010101" : "currentColor"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {actif && (
            <path
              d="M13.4 4c.3 2.1 1.8 3.6 4 3.9"
              fill="none"
              stroke="#25F4EE"
              strokeWidth="1.1"
              strokeLinecap="round"
              transform="translate(-0.6,-0.5)"
            />
          )}
        </svg>
      );
    case "google":
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
          {actif ? (
            <path
              fill="#4285F4"
              d="M21.6 12.23c0-.7-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"
            />
          ) : null}
          {actif ? (
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.1H3.06v2.58A10 10 0 0 0 12 22Z"
            />
          ) : null}
          {actif ? (
            <path fill="#FBBC05" d="M6.41 13.94a6 6 0 0 1 0-3.88V7.48H3.06a10 10 0 0 0 0 9.04l3.35-2.58Z" />
          ) : null}
          {actif ? (
            <path
              fill="#EA4335"
              d="M12 6.02c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.94 5.48l3.35 2.58C7.2 7.77 9.4 6.02 12 6.02Z"
            />
          ) : (
            <path
              d="M20 12.2c0-.6-.05-1.2-.15-1.7H12v3.3h4.5a3.9 3.9 0 0 1-1.7 2.6v2.1h2.7c1.6-1.5 2.5-3.7 2.5-6.3ZM12 20c2.2 0 4.1-.7 5.5-2l-2.7-2.1c-.75.5-1.7.8-2.8.8-2.15 0-3.97-1.45-4.62-3.4H4.55v2.15A8 8 0 0 0 12 20ZM7.38 13.3a4.8 4.8 0 0 1 0-3.06V8.09H4.55a8 8 0 0 0 0 7.36l2.83-2.15ZM12 6.98c1.2 0 2.27.42 3.12 1.23l2.34-2.34C15.9 4.5 14.1 3.8 12 3.8a8 8 0 0 0-7.45 4.3l2.83 2.15C7.98 8.43 9.8 6.98 12 6.98Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          )}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
          <rect x="3" y="6.5" width="18" height="11" rx="3" fill="none" stroke={actif ? "#FF0000" : "currentColor"} strokeWidth="1.8" />
          <path d="m10.5 9.8 4.5 2.2-4.5 2.2V9.8Z" fill={actif ? "#FF0000" : "none"} stroke={actif ? "#FF0000" : "currentColor"} strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
  }
}

function Placeholder() {
  const { t } = useDashboardLangue();
  return (
    <p className="text-[11px] text-[var(--dashboard-text)]/45">
      {t("Bientôt disponible.", "Coming soon.")}
    </p>
  );
}
