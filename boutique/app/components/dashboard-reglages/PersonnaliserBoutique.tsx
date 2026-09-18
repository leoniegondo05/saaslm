"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { useDashboardBoutiqueLogo } from "../DashboardBoutiqueLogoProvider";
import { texteAvecChiffres } from "../dashboard-accueil/shared";
import BoutiquePreview from "./personnaliser/BoutiquePreview";
import ReglagesBoutique from "./personnaliser/ReglagesBoutique";
import ReglagesSection from "./personnaliser/ReglagesSection";
import SectionsPanel from "./personnaliser/SectionsPanel";
import StyleReglages from "./personnaliser/StyleReglages";
import { ETAT_DEFAUT, SECTIONS_DEFAUT, fusionnerEtatPersiste } from "./personnaliser/types";
import type { EditeurState, PageId, SectionId } from "./personnaliser/types";
import type { BoutiqueReglageId } from "./personnaliser/ReglagesBoutique";
import type { StyleReglageId } from "./personnaliser/StyleReglages";

/*
  Écran "Personnaliser ma boutique" — ouvert depuis le bouton en bas de la
  fiche "Ma boutique" (Réglages), voir MaBoutique.tsx. Page à part entière
  (route propre app/dashboard/reglages/personnaliser/page.tsx) plutôt qu'une
  fenêtre par-dessus : trois colonnes — sections/style à gauche, aperçu en
  direct au centre, réglages de la section choisie à droite — comme décrit
  dans la maquette fournie.

  "Nom de la boutique" reste celui posé en dur dans MaBoutique.tsx
  (IDENTITE_INIT.nom, "Awa Beauté") : aucun store partagé pour l'identité de
  la boutique n'existe encore (seul le logo l'est, via
  DashboardBoutiqueLogoProvider) — cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]].

  Annuler/rétablir : chaque changement empile l'état précédent dans `past`
  (vidé au chargement et à chaque Enregistrer/Annuler) ; la maquette
  n'attend rien de plus fin qu'un aller-retour par clic. Le compteur de
  "modifications en attente" est simplement `past.length`.
*/

const NOM_BOUTIQUE = "Awa Beauté";

// Persistance locale (pas encore d'API Laravel pour cet écran, cf. mémoire
// [[dashboard-mock-data-pending-laravel-api]]) : sans ça, actualiser la page
// remet tout à ETAT_DEFAUT et perd les modifications en cours ("modifications
// en attente" retombe à 0 sans qu'elles aient été vraiment enregistrées).
// On ne relit localStorage qu'après le montage (useEffect) pour éviter un
// mismatch d'hydratation SSR — le premier rendu reste sur les valeurs par
// défaut, identiques côté serveur et client.
const CLE_STOCKAGE = "lm-personnaliser-boutique";

type EtatPersiste = {
  state: EditeurState;
  page: PageId;
  onglet: "sections" | "style" | "boutique";
  sectionChoisie: SectionId;
  reglageBoutique: BoutiqueReglageId;
  styleReglage: StyleReglageId;
};

export default function PersonnaliserBoutique() {
  const { t } = useDashboardLangue();
  const { logo } = useDashboardBoutiqueLogo();

  const [state, setStateRaw] = useState<EditeurState>(ETAT_DEFAUT);
  const [baseline, setBaseline] = useState<EditeurState>(ETAT_DEFAUT);
  const [past, setPast] = useState<EditeurState[]>([]);
  const [future, setFuture] = useState<EditeurState[]>([]);

  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  // "accueil" par défaut, comme U.page:'home' dans la maquette — c'est la
  // page qu'un visiteur voit en premier, avant même la fiche produit.
  const [page, setPage] = useState<PageId>("accueil");
  const [onglet, setOnglet] = useState<"sections" | "style" | "boutique">("sections");
  const [sectionChoisie, setSectionChoisie] = useState<SectionId>("grande-image");
  const [reglageBoutique, setReglageBoutique] = useState<BoutiqueReglageId>("identite");
  const [styleReglage, setStyleReglage] = useState<StyleReglageId>("modele");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "done">("idle");
  // Œil "aperçu" de la maquette : ouvre la vitrine en plein écran, sans
  // aucun contour de sélection ni panneau, telle qu'un client la verrait.
  const [apercuOuvert, setApercuOuvert] = useState(false);

  // Section par défaut à afficher à droite quand on bascule de page, si la
  // section choisie jusque-là n'existe pas sur l'autre page (bandeau,
  // en-tête, avis, faq et pied de page restent valables sur les deux).
  const SECTION_PAR_DEFAUT: Record<PageId, SectionId> = { accueil: "grande-image", commande: "infos" };
  // Chargement une fois montée : remplace aussi la référence "baseline" pour
  // que le badge reparte de "Tout est enregistré" plutôt que de compter les
  // modifications déjà présentes comme "en attente".
  //
  // `charge` bloque l'effet de sauvegarde ci-dessous tant que ce chargement
  // n'est pas passé : sinon cet effet de sauvegarde tourne au montage avec
  // les valeurs par défaut (le setState* du chargement est asynchrone, pas
  // encore répercuté dans ce rendu) et écrase le blob tout juste lu —
  // c'était le bug : actualiser la page ramenait toujours à la section par
  // défaut au lieu de rester sur la section choisie.
  const [charge, setCharge] = useState(false);
  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      if (brut) {
        const sauvegarde = JSON.parse(brut) as Partial<EtatPersiste>;
        if (sauvegarde.state) {
          const etatFusionne = fusionnerEtatPersiste(sauvegarde.state);
          setStateRaw(etatFusionne);
          setBaseline(etatFusionne);
        }
        if (sauvegarde.page) setPage(sauvegarde.page);
        if (sauvegarde.onglet) setOnglet(sauvegarde.onglet);
        if (sauvegarde.sectionChoisie) setSectionChoisie(sauvegarde.sectionChoisie);
        if (sauvegarde.reglageBoutique) setReglageBoutique(sauvegarde.reglageBoutique);
        if (sauvegarde.styleReglage) setStyleReglage(sauvegarde.styleReglage);
      }
    } catch {
      // localStorage indisponible (navigation privée, quota...) : on reste sur ETAT_DEFAUT.
    } finally {
      setCharge(true);
    }
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      const donnees: EtatPersiste = { state, page, onglet, sectionChoisie, reglageBoutique, styleReglage };
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(donnees));
    } catch {
      // idem : échec silencieux, la personnalisation reste utilisable pour la session en cours.
    }
  }, [charge, state, page, onglet, sectionChoisie, reglageBoutique, styleReglage]);

  const choisirPage = (p: PageId) => {
    setPage(p);
    setSectionChoisie((cur) => {
      const def = SECTIONS_DEFAUT.find((d) => d.id === cur);
      if (def && (def.page === "les-deux" || def.page === p)) return cur;
      return SECTION_PAR_DEFAUT[p];
    });
  };

  const setState = (updater: (s: EditeurState) => EditeurState) => {
    setStateRaw((s) => {
      setPast((p) => [...p, s]);
      setFuture([]);
      return updater(s);
    });
  };

  const undo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setFuture((f) => [state, ...f]);
    setPast((p) => p.slice(0, -1));
    setStateRaw(prev);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setPast((p) => [...p, state]);
    setFuture((f) => f.slice(1));
    setStateRaw(next);
  };

  const annuler = () => {
    setStateRaw(baseline);
    setPast([]);
    setFuture([]);
  };

  const enregistrer = () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    setTimeout(() => {
      setBaseline(state);
      setPast([]);
      setFuture([]);
      setSaveStatus("done");
      setTimeout(() => setSaveStatus("idle"), 1800);
    }, 500);
  };

  const pending = past.length;

  return (
    <div className="min-h-screen w-full bg-[var(--dashboard-bg)] font-sans text-[var(--dashboard-text)] antialiased transition-colors">
      <div className="mx-auto flex max-w-[1620px] flex-col gap-4 px-4 pb-10 pt-6 sm:px-6 md:px-10">
        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] px-4 py-3">
          <Link
            href="/dashboard/ma-boutique"
            className="flex items-center gap-1.5 rounded-full border border-[var(--dashboard-text)]/12 px-3 py-1.5 text-[11px] font-semibold text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.05]"
          >
            <FlecheIcon /> {t("Ma boutique", "My shop")}
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold" style={{ fontFamily: "var(--font-bricolage)" }}>
              {t("Personnaliser ma boutique", "Customize my shop")}
            </p>
            <p className="truncate text-[10.5px] text-[var(--dashboard-text)]/40">{NOM_BOUTIQUE}</p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-[var(--dashboard-text)]/[0.06] p-1">
              <button
                type="button"
                onClick={() => choisirPage("accueil")}
                className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${page === "accueil" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
              >
                {t("Accueil", "Home")}
              </button>
              <button
                type="button"
                onClick={() => choisirPage("commande")}
                className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${page === "commande" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
              >
                {t("Page de commande", "Order page")}
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-[var(--dashboard-text)]/[0.06] p-1">
              <button
                type="button"
                onClick={() => setDevice("phone")}
                className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${device === "phone" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
              >
                {t("Téléphone", "Phone")}
              </button>
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${device === "desktop" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
              >
                {t("Ordinateur", "Computer")}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={past.length === 0}
                aria-label={t("Annuler la dernière action", "Undo last action")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--dashboard-text)]/12 text-[var(--dashboard-text)]/60 transition hover:bg-[var(--dashboard-text)]/[0.05] disabled:opacity-30"
              >
                <UndoIcon />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={future.length === 0}
                aria-label={t("Rétablir", "Redo")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--dashboard-text)]/12 text-[var(--dashboard-text)]/60 transition hover:bg-[var(--dashboard-text)]/[0.05] disabled:opacity-30"
              >
                <UndoIcon miroir />
              </button>
            </div>

            {pending === 0 ? (
              <span className="rounded-full bg-[#dcf5e3] px-2.5 py-1 text-[10px] font-semibold text-[#178a3f]">
                {t("Tout est enregistré", "All saved")}
              </span>
            ) : (
              <span className="rounded-full bg-[#fff1d6] px-2.5 py-1 text-[10px] font-semibold text-[#a8690a]">
                {texteAvecChiffres(t(`${pending} modification${pending > 1 ? "s" : ""} en attente`, `${pending} pending change${pending > 1 ? "s" : ""}`))}
              </span>
            )}

            <button
              type="button"
              onClick={() => setApercuOuvert(true)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--dashboard-text)]/12 px-3 py-1.5 text-[10.5px] font-semibold text-[var(--dashboard-text)]/70 transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              <OeilIcon /> {t("Aperçu", "Preview")}
            </button>

            <button
              type="button"
              onClick={annuler}
              disabled={pending === 0}
              aria-label={t("Annuler les modifications", "Discard changes")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ff5a62]/40 bg-[#ff5a62]/10 text-[#ff5a62] transition hover:brightness-95 disabled:opacity-30"
            >
              <CroixIcon />
            </button>
            <button
              type="button"
              onClick={enregistrer}
              disabled={saveStatus === "saving"}
              aria-label={saveStatus === "saving" ? t("Enregistrement…", "Saving…") : t("Enregistrer", "Save")}
              title={saveStatus === "saving" ? t("Enregistrement…", "Saving…") : t("Enregistrer", "Save")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
              style={{ background: "linear-gradient(150deg,#FF5AA3,#EC0C8C 55%,#3A1D8A)" }}
            >
              <CheckIcon />
            </button>
          </div>
        </div>

        {/* Trois colonnes */}
        <div className="grid gap-4 lg:grid-cols-[238px_1fr_320px]">
          <div className="lg:h-[calc(100vh-160px)]">
            <SectionsPanel
              state={state}
              setState={setState}
              page={page}
              onglet={onglet}
              setOnglet={setOnglet}
              sectionChoisie={sectionChoisie}
              setSectionChoisie={setSectionChoisie}
              reglageBoutique={reglageBoutique}
              setReglageBoutique={setReglageBoutique}
              styleReglage={styleReglage}
              setStyleReglage={setStyleReglage}
            />
          </div>

          <div className="flex items-start justify-center overflow-y-auto rounded-2xl border border-dashed border-[var(--dashboard-text)]/10 bg-[radial-gradient(circle_at_50%_0%,rgba(236,12,140,0.06),transparent_60%)] p-5 lg:h-[calc(100vh-160px)]">
            <BoutiquePreview
              state={state}
              device={device}
              page={page}
              boutiqueNom={NOM_BOUTIQUE}
              logo={logo}
              sectionChoisie={sectionChoisie}
              onChoisirSection={setSectionChoisie}
            />
          </div>

          <div className="lg:h-[calc(100vh-160px)]">
            {onglet === "boutique" ? (
              <ReglagesBoutique
                reglageBoutique={reglageBoutique}
                onOuvrirSection={(id) => {
                  setOnglet("sections");
                  setSectionChoisie(id);
                }}
                state={state}
                setState={setState}
              />
            ) : onglet === "style" ? (
              <StyleReglages styleReglage={styleReglage} state={state} setState={setState} />
            ) : (
              <ReglagesSection sectionId={sectionChoisie} state={state} setState={setState} page={page} />
            )}
          </div>
        </div>
      </div>

      {apercuOuvert && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--dashboard-bg)]">
          <div className="flex items-center gap-3 border-b border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setApercuOuvert(false)}
              aria-label={t("Fermer l'aperçu", "Close preview")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--dashboard-text)]/12 text-[var(--dashboard-text)]/60 transition hover:bg-[var(--dashboard-text)]/[0.05]"
            >
              <CroixIcon />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold" style={{ fontFamily: "var(--font-bricolage)" }}>
                {t("Aperçu", "Preview")}
              </p>
              <p className="truncate text-[10.5px] text-[var(--dashboard-text)]/40">{NOM_BOUTIQUE}</p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-[var(--dashboard-text)]/[0.06] p-1">
                <button
                  type="button"
                  onClick={() => choisirPage("accueil")}
                  className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${page === "accueil" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
                >
                  {t("Accueil", "Home")}
                </button>
                <button
                  type="button"
                  onClick={() => choisirPage("commande")}
                  className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${page === "commande" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
                >
                  {t("Page de commande", "Order page")}
                </button>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[var(--dashboard-text)]/[0.06] p-1">
                <button
                  type="button"
                  onClick={() => setDevice("phone")}
                  className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${device === "phone" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
                >
                  {t("Téléphone", "Phone")}
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("desktop")}
                  className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${device === "desktop" ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"}`}
                >
                  {t("Ordinateur", "Computer")}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-start justify-center overflow-y-auto p-6">
            <BoutiquePreview state={state} device={device} page={page} boutiqueNom={NOM_BOUTIQUE} logo={logo} />
          </div>
        </div>
      )}
    </div>
  );
}

function FlecheIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <path d="M14.5 5 7.5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UndoIcon({ miroir = false }: { miroir?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" style={miroir ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d="M9 5.5 4.5 10 9 14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 10H14a5 5 0 0 1 0 10h-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OeilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
