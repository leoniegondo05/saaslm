"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import AjouterSectionModal from "./AjouterSectionModal";
import { SECTIONS_DEFAUT, ajouterSection, appartientPage, deplacerSection, reordonnerSections, supprimerSection } from "./types";
import type { EditeurState, PageId, SectionId } from "./types";
import type { BoutiqueReglageId } from "./ReglagesBoutique";
import { BOUTIQUE_REGLAGES_DEFAUT } from "./ReglagesBoutique";
import type { StyleReglageId } from "./StyleReglages";
import { STYLE_REGLAGES_DEFAUT } from "./StyleReglages";

/*
  Colonne de gauche de l'éditeur : onglet "Sections" (ordre, visibilité,
  section choisie) et onglet "Style" (modèle de départ, couleurs, boutons —
  vaut pour toute la boutique, pas seulement cette page). Panneau de droite
  correspondant : ReglagesSection.tsx.

  "Sections" ne montre que celles de la page active (`page`, venue de
  PersonnaliserBoutique.tsx) — même `state.sections` pour les deux pages
  (cf. commentaire de SECTIONS_DEFAUT dans types.ts), on filtre juste ce qui
  nourrit la liste plutôt que dupliquer ce panneau.
*/

// Paires de sections rendues sous une ligne-mère (icône + cadenas) avec
// leurs enfants indentés dessous, cf. maquette "Contenu de la page" — pas
// tout le groupe `SectionDef.groupe` (celui-ci sert plus largement, ex.
// "Produit" couvre aussi Offres/Onglets détails/Vous aimerez aussi, qui eux
// restent des lignes plates avec le petit label "PRODUIT" au-dessus, comme
// avant). "produit" ici regroupe seulement Galerie + Informations produit,
// "commande" seulement Vos informations + Paiement et livraison (repliable
// via chevron, son libellé de ligne-mère diffère du groupe "Commande").
const PARENT_ENFANTS: Record<"produit" | "commande", { ids: SectionId[]; label: string; labelEn: string; icone: string; repliable: boolean }> = {
  produit: { ids: ["galerie", "infos"], label: "Produit", labelEn: "Product", icone: "M4 8.5 12 4l8 4.5v8L12 21l-8-4.5zM12 21v-8.5M4 8.5 12 13l8-4.5", repliable: false },
  commande: { ids: ["paiement", "formulaire"], label: "Formulaire de commande", labelEn: "Order form", icone: "M6 4.5h12v15H6zM9 8.5h6M9 12h6M9 15.5h4", repliable: true },
};

function clePere(id: SectionId): "produit" | "commande" | null {
  if (PARENT_ENFANTS.produit.ids.includes(id)) return "produit";
  if (PARENT_ENFANTS.commande.ids.includes(id)) return "commande";
  return null;
}

export default function SectionsPanel({
  state,
  setState,
  page,
  onglet,
  setOnglet,
  sectionChoisie,
  setSectionChoisie,
  reglageBoutique,
  setReglageBoutique,
  styleReglage,
  setStyleReglage,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  page: PageId;
  onglet: "sections" | "style" | "boutique";
  setOnglet: (o: "sections" | "style" | "boutique") => void;
  sectionChoisie: SectionId;
  setSectionChoisie: (id: SectionId) => void;
  reglageBoutique: BoutiqueReglageId;
  setReglageBoutique: (id: BoutiqueReglageId) => void;
  styleReglage: StyleReglageId;
  setStyleReglage: (id: StyleReglageId) => void;
}) {
  const { t } = useDashboardLangue();
  const [modalAjoutOuvert, setModalAjoutOuvert] = useState(false);
  // Repli visuel des paires "produit"/"commande" (cf. PARENT_ENFANTS) — seule
  // "commande" est repliable (chevron dans la maquette), "produit" reste
  // toujours ouvert.
  const [groupesReplies, setGroupesReplies] = useState<Partial<Record<"produit" | "commande", boolean>>>({});
  // Glisser-déposer (cf. reordonnerSections dans types.ts) : `dragId` est la
  // section en cours de déplacement, `survolId` celle actuellement survolée
  // (affiche une ligne d'insertion juste au-dessus). Les boutons Monter/
  // Descendre restent à côté — plus fiables au clavier/tactile, le
  // glisser-déposer ne les remplace pas.
  const [dragId, setDragId] = useState<SectionId | null>(null);
  const [survolId, setSurvolId] = useState<SectionId | null>(null);
  const estDeplacable = (id: SectionId) => id !== "pied-de-page" && id !== "bouton-commande-fixe";

  const toggleVisible = (id: SectionId) =>
    setState((s) => ({
      ...s,
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, visible: !sec.visible } : sec)),
    }));

  // Monte/descend au sein de la page active seulement : une section "les-deux"
  // comme bandeau/avis partage sa position entre les deux pages, cf. types.ts
  // — la déplacer depuis l'une la déplace aussi, logiquement, pour l'autre.
  const deplacer = (id: SectionId, sens: -1 | 1) => setState((s) => ({ ...s, sections: deplacerSection(s.sections, id, page, sens) }));

  const ajouter = (id: SectionId) => {
    setState((s) => ({ ...s, sections: ajouterSection(s.sections, id) }));
    setSectionChoisie(id);
    setModalAjoutOuvert(false);
  };

  const supprimer = (id: SectionId) => {
    setState((s) => ({ ...s, sections: supprimerSection(s.sections, id) }));
    if (sectionChoisie === id) setSectionChoisie("pied-de-page");
  };

  const sectionsPage = state.sections.filter((sec) => appartientPage(sec.id, page));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3">
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1">
        {(["sections", "style", "boutique"] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOnglet(o)}
            className={`rounded-lg py-1.5 text-[11px] font-semibold transition ${
              onglet === o ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"
            }`}
          >
            {o === "sections" ? t("Sections", "Sections") : o === "style" ? t("Style", "Style") : t("Boutique", "Shop")}
          </button>
        ))}
      </div>

      {onglet === "boutique" ? (
        <BoutiqueMenu reglageBoutique={reglageBoutique} setReglageBoutique={setReglageBoutique} />
      ) : onglet === "sections" ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          {sectionsPage.map((sec, i) => {
            const def = SECTIONS_DEFAUT.find((d) => d.id === sec.id)!;
            const defPrecedent = i > 0 ? SECTIONS_DEFAUT.find((d) => d.id === sectionsPage[i - 1].id) : null;
            const nouveauGroupe = !defPrecedent || defPrecedent.groupe !== def.groupe;
            const cle = clePere(sec.id);
            const clePrecedente = i > 0 ? clePere(sectionsPage[i - 1].id) : null;
            const nouvellePaire = !!cle && cle !== clePrecedente;
            const pere = cle ? PARENT_ENFANTS[cle] : null;
            const replie = !!(pere?.repliable && cle && groupesReplies[cle]);
            const cetteSectionDeplacable = estDeplacable(sec.id);
            return (
              <motion.div key={sec.id} layout="position" transition={{ type: "spring", stiffness: 600, damping: 45 }}>
                {survolId === sec.id && dragId && dragId !== sec.id && (
                  <div className="mx-1 h-0.5 rounded-full bg-brand-pink" />
                )}
                {nouvellePaire && pere && (
                  <div className="mb-1 mt-3 flex items-center gap-1.5 rounded-xl bg-[var(--dashboard-text)]/[0.05] px-2 py-1.5 first:mt-0">
                    <span className="shrink-0 text-[var(--dashboard-text)]/45">
                      <MiniIcon path={pere.icone} />
                    </span>
                    <span className="flex-1 truncate text-[11.5px] font-semibold text-[var(--dashboard-text)]">
                      {t(pere.label, pere.labelEn)}
                    </span>
                    {pere.repliable && cle && (
                      <button
                        type="button"
                        onClick={() => setGroupesReplies((r) => ({ ...r, [cle]: !r[cle] }))}
                        aria-label={replie ? t("Déplier", "Expand") : t("Replier", "Collapse")}
                        className="shrink-0 text-[var(--dashboard-text)]/40 hover:text-[var(--dashboard-text)]"
                      >
                        <ChevronBasIcon replie={replie} />
                      </button>
                    )}
                    <span className="shrink-0 text-[var(--dashboard-text)]/30">
                      <CadenasIcon />
                    </span>
                  </div>
                )}
                {!cle && nouveauGroupe && (
                  <p className="mb-1.5 mt-3 px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 first:mt-0">
                    {t(def.groupe, def.groupeEn)}
                  </p>
                )}
                {!replie && (
                <div
                  draggable={cetteSectionDeplacable}
                  onDragStart={(e) => {
                    if (!cetteSectionDeplacable) return;
                    setDragId(sec.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    if (!dragId || !cetteSectionDeplacable || dragId === sec.id) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setSurvolId(sec.id);
                  }}
                  onDragLeave={() => setSurvolId((s) => (s === sec.id ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId && dragId !== sec.id) {
                      setState((s) => ({ ...s, sections: reordonnerSections(s.sections, page, dragId, sec.id) }));
                    }
                    setDragId(null);
                    setSurvolId(null);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setSurvolId(null);
                  }}
                  className={`group flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-left transition ${cle ? "ml-3" : ""} ${
                    sectionChoisie === sec.id
                      ? "border-brand-pink/50 bg-transparent"
                      : "border-transparent hover:bg-[var(--dashboard-text)]/[0.04]"
                  } ${!sec.visible ? "opacity-45" : ""} ${dragId === sec.id ? "opacity-40" : ""}`}
                >
                  {cetteSectionDeplacable && (
                    <span className="shrink-0 cursor-grab text-[var(--dashboard-text)]/25 active:cursor-grabbing" aria-hidden>
                      <PoigneeIcon />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSectionChoisie(sec.id)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[11.5px] font-semibold text-[var(--dashboard-text)]"
                  >
                    {def.icone && (
                      <span className={`shrink-0 ${sectionChoisie === sec.id ? "text-brand-pink" : "text-[var(--dashboard-text)]/45"}`}>
                        <MiniIcon path={def.icone} />
                      </span>
                    )}
                    <span className="truncate">{t(def.label, def.labelEn)}</span>
                  </button>
                  {sec.id !== "pied-de-page" && sec.id !== "bouton-commande-fixe" && (
                    <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => deplacer(sec.id, -1)}
                        aria-label={t("Monter", "Move up")}
                        className="flex h-5 w-5 items-center justify-center rounded text-[var(--dashboard-text)]/40 hover:text-[var(--dashboard-text)] disabled:opacity-0"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={i === sectionsPage.length - 1}
                        onClick={() => deplacer(sec.id, 1)}
                        aria-label={t("Descendre", "Move down")}
                        className="flex h-5 w-5 items-center justify-center rounded text-[var(--dashboard-text)]/40 hover:text-[var(--dashboard-text)] disabled:opacity-0"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                  {def.verrouillee ? (
                    <span title={t("Toujours présente", "Always shown")} className="shrink-0 text-[var(--dashboard-text)]/30">
                      <CadenasIcon />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleVisible(sec.id)}
                      aria-label={t("Afficher ou masquer", "Show or hide")}
                      className="shrink-0 text-[var(--dashboard-text)]/40 hover:text-[var(--dashboard-text)]"
                    >
                      <OeilIcon barre={!sec.visible} />
                    </button>
                  )}
                  {def.libre && (
                    <button
                      type="button"
                      onClick={() => supprimer(sec.id)}
                      aria-label={t("Supprimer la section", "Delete the section")}
                      className="shrink-0 text-[var(--dashboard-text)]/40 opacity-0 transition hover:text-[#ff5a62] group-hover:opacity-100"
                    >
                      <PoubelleIcon />
                    </button>
                  )}
                </div>
                )}
              </motion.div>
            );
          })}

          <button
            type="button"
            onClick={() => setModalAjoutOuvert(true)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-pink/50 py-2.5 text-[11px] font-semibold text-brand-pink transition hover:bg-brand-pink/10"
          >
            <PlusIcon /> {t("Ajouter une section", "Add a section")}
          </button>
        </div>
      ) : (
        <StyleMenu styleReglage={styleReglage} setStyleReglage={setStyleReglage} />
      )}

      {modalAjoutOuvert && (
        <AjouterSectionModal sections={state.sections} onAjouter={ajouter} onFermer={() => setModalAjoutOuvert(false)} />
      )}
    </div>
  );
}

function StyleMenu({
  styleReglage,
  setStyleReglage,
}: {
  styleReglage: StyleReglageId;
  setStyleReglage: (id: StyleReglageId) => void;
}) {
  const { t } = useDashboardLangue();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
      <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
        {t("Valable sur toutes les pages", "Applies to all pages")}
      </p>
      <div className="flex flex-col gap-0.5">
        {STYLE_REGLAGES_DEFAUT.map((r) => {
          const selectionne = r.id === styleReglage;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setStyleReglage(r.id)}
              className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-[11.5px] font-semibold transition ${
                selectionne
                  ? "border-brand-pink/50 bg-transparent text-[var(--dashboard-text)]"
                  : "border-transparent text-[var(--dashboard-text)]/70 hover:bg-[var(--dashboard-text)]/[0.05]"
              }`}
            >
              <span className={selectionne ? "text-brand-pink" : "text-[var(--dashboard-text)]/45"}>
                <MiniIcon path={r.icone} />
              </span>
              {t(r.label, r.labelEn)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BoutiqueMenu({
  reglageBoutique,
  setReglageBoutique,
}: {
  reglageBoutique: BoutiqueReglageId;
  setReglageBoutique: (id: BoutiqueReglageId) => void;
}) {
  const { t } = useDashboardLangue();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
      <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
        {t("Réglages de la boutique", "Shop settings")}
      </p>
      <div className="flex flex-col gap-0.5">
        {BOUTIQUE_REGLAGES_DEFAUT.map((r) => {
          const selectionne = r.id === reglageBoutique;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setReglageBoutique(r.id)}
              className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-[11.5px] font-semibold transition ${
                selectionne
                  ? "border-brand-pink/50 bg-transparent text-[var(--dashboard-text)]"
                  : "border-transparent text-[var(--dashboard-text)]/70 hover:bg-[var(--dashboard-text)]/[0.05]"
              }`}
            >
              <span className={selectionne ? "text-brand-pink" : "text-[var(--dashboard-text)]/45"}>
                <MiniIcon path={r.icone} />
              </span>
              {t(r.label, r.labelEn)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PoigneeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <circle cx="9" cy="6.5" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="9" cy="17.5" r="1.4" />
      <circle cx="15" cy="6.5" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="15" cy="17.5" r="1.4" />
    </svg>
  );
}

function MiniIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OeilIcon({ barre }: { barre: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      {barre && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.5" />}
    </svg>
  );
}

function ChevronBasIcon({ replie }: { replie: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-3.5 w-3.5 transition-transform ${replie ? "-rotate-90" : ""}`} aria-hidden>
      <path d="M6 9.5 12 15l6-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CadenasIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PoubelleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M5 7h14M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M7 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h5a1.5 1.5 0 0 0 1.5-1.4L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
