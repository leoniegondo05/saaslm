"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { MODELES, SECTIONS_DEFAUT } from "./types";
import type { EditeurState, ModeleId, PageId, SectionId } from "./types";

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

export default function SectionsPanel({
  state,
  setState,
  page,
  onglet,
  setOnglet,
  sectionChoisie,
  setSectionChoisie,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  page: PageId;
  onglet: "sections" | "style";
  setOnglet: (o: "sections" | "style") => void;
  sectionChoisie: SectionId;
  setSectionChoisie: (id: SectionId) => void;
}) {
  const { t } = useDashboardLangue();

  const toggleVisible = (id: SectionId) =>
    setState((s) => ({
      ...s,
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, visible: !sec.visible } : sec)),
    }));

  const appartientPage = (id: SectionId) => {
    const def = SECTIONS_DEFAUT.find((d) => d.id === id)!;
    return def.page === "les-deux" || def.page === page;
  };

  // Monte/descend au sein de la page active seulement : on retrouve les deux
  // voisins dans la liste filtrée, puis on échange leurs positions dans le
  // tableau complet (une section "les-deux" comme bandeau/avis partage sa
  // position entre les deux pages, cf. types.ts — la déplacer depuis l'une
  // la déplace aussi, logiquement, pour l'autre).
  const deplacer = (id: SectionId, sens: -1 | 1) =>
    setState((s) => {
      const visibles = s.sections.filter((sec) => appartientPage(sec.id));
      const vi = visibles.findIndex((sec) => sec.id === id);
      const vj = vi + sens;
      if (vi < 0 || vj < 0 || vj >= visibles.length) return s;
      const idA = visibles[vi].id;
      const idB = visibles[vj].id;
      const iA = s.sections.findIndex((sec) => sec.id === idA);
      const iB = s.sections.findIndex((sec) => sec.id === idB);
      const copie = [...s.sections];
      [copie[iA], copie[iB]] = [copie[iB], copie[iA]];
      return { ...s, sections: copie };
    });

  const sectionsPage = state.sections.filter((sec) => appartientPage(sec.id));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3">
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1">
        {(["sections", "style"] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOnglet(o)}
            className={`rounded-lg py-1.5 text-[11px] font-semibold transition ${
              onglet === o ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"
            }`}
          >
            {o === "sections" ? t("Sections", "Sections") : t("Style", "Style")}
          </button>
        ))}
      </div>

      {onglet === "sections" ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          {sectionsPage.map((sec, i) => {
            const def = SECTIONS_DEFAUT.find((d) => d.id === sec.id)!;
            const defPrecedent = i > 0 ? SECTIONS_DEFAUT.find((d) => d.id === sectionsPage[i - 1].id) : null;
            const nouveauGroupe = !defPrecedent || defPrecedent.groupe !== def.groupe;
            return (
              <div key={sec.id}>
                {nouveauGroupe && (
                  <p className="mb-1.5 mt-3 px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 first:mt-0">
                    {t(def.groupe, def.groupeEn)}
                  </p>
                )}
                <div
                  className={`group flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition ${
                    sectionChoisie === sec.id
                      ? "bg-brand-pink/10 ring-1 ring-brand-pink/40"
                      : "hover:bg-[var(--dashboard-text)]/[0.04]"
                  } ${!sec.visible ? "opacity-45" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setSectionChoisie(sec.id)}
                    className="min-w-0 flex-1 truncate text-left text-[11.5px] font-semibold text-[var(--dashboard-text)]"
                  >
                    {t(def.label, def.labelEn)}
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
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
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <StylePanel state={state} setState={setState} />
      )}
    </div>
  );
}

function StylePanel({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const set = <K extends keyof EditeurState["style"]>(key: K, value: EditeurState["style"][K]) =>
    setState((s) => ({ ...s, style: { ...s.style, [key]: value } }));

  const appliquerModele = (id: ModeleId) => {
    const m = MODELES.find((x) => x.id === id)!;
    setState((s) => ({
      ...s,
      style: { ...s.style, modele: id, couleurFond: m.fond, couleurTexte: m.texte, couleurPrincipale: m.accent },
    }));
  };

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5">
      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
          {t("Modèle de départ", "Starting theme")}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {MODELES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => appliquerModele(m.id)}
              className={`rounded-xl border p-1.5 text-left transition ${
                state.style.modele === m.id ? "border-brand-pink shadow-[0_0_0_2px_rgba(236,12,140,0.15)]" : "border-[var(--dashboard-text)]/10"
              }`}
            >
              <div className="h-10 rounded-lg" style={{ background: m.fond, border: "1px solid rgba(0,0,0,.06)" }}>
                <div className="h-2.5 w-7 rounded-sm" style={{ background: m.accent, opacity: 0.8, margin: "6px 0 0 5px" }} />
              </div>
              <p className="mt-1 truncate text-[10px] font-semibold text-[var(--dashboard-text)]">{t(m.nom, m.nomEn)}</p>
            </button>
          ))}
        </div>
      </div>

      <ChampCouleur label={t("Couleur principale", "Primary color")} value={state.style.couleurPrincipale} onChange={(v) => set("couleurPrincipale", v)} />
      <ChampCouleur label={t("Fond", "Background")} value={state.style.couleurFond} onChange={(v) => set("couleurFond", v)} />
      <ChampCouleur label={t("Texte", "Text")} value={state.style.couleurTexte} onChange={(v) => set("couleurTexte", v)} />

      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
          {t("Police", "Typeface")}
        </p>
        <div className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[11px]">
          <p className="font-semibold text-[var(--dashboard-text)]" style={{ fontFamily: "var(--font-sans)" }}>Bricolage Grotesque</p>
          <p className="mt-0.5 text-[var(--dashboard-text)]/50">{t("Titres — charte graphique LM", "Headings — LM brand guide")}</p>
          <p className="mt-1.5 font-semibold text-[var(--dashboard-text)]">Sora</p>
          <p className="mt-0.5 text-[var(--dashboard-text)]/50">{t("Texte courant — charte graphique LM", "Body text — LM brand guide")}</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
          {t("Forme des boutons", "Button shape")}
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1">
          {(["carre", "arrondi", "pilule"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => set("boutonForme", f)}
              className={`rounded-lg py-1.5 text-[10px] font-semibold transition ${
                state.style.boutonForme === f ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"
              }`}
            >
              {f === "carre" ? t("Carré", "Square") : f === "arrondi" ? t("Arrondi", "Rounded") : t("Pilule", "Pill")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
          {t("Remplissage des boutons", "Button fill")}
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1">
          {(["plein", "contour", "degrade"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => set("boutonRemplissage", f)}
              className={`rounded-lg py-1.5 text-[10px] font-semibold transition ${
                state.style.boutonRemplissage === f ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"
              }`}
            >
              {f === "plein" ? t("Plein", "Solid") : f === "contour" ? t("Contour", "Outline") : t("Dégradé", "Gradient")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChampCouleur({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <label className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-[var(--dashboard-text)]/15" style={{ background: value }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <span className="flex-1 text-[11px] font-medium text-[var(--dashboard-text)]">{label}</span>
      <code className="text-[9.5px] uppercase text-[var(--dashboard-text)]/40">{value}</code>
    </div>
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

function CadenasIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
