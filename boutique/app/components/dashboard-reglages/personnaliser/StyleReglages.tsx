"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { ETAT_DEFAUT, MODELES, STYLE_DEFAUT } from "./types";
import type { CartesProduitZoneId, EditeurState, ModeleId } from "./types";

/*
  Onglet "Style" de l'éditeur (deuxième onglet à côté de "Sections" et
  "Boutique", cf. SectionsPanel.tsx) : réglages d'apparence valables sur
  toutes les pages de la boutique. Menu de gauche défini ici
  (STYLE_REGLAGES_DEFAUT, rendu par StyleMenu dans SectionsPanel.tsx) pour
  rester à côté du panneau de droite correspondant (StyleReglages, exporté
  par défaut) — même principe que ReglagesBoutique.tsx.
*/

export type StyleReglageId = "modele" | "couleurs" | "textes" | "formes-espaces" | "cartes-produit" | "mouvements";

export const STYLE_REGLAGES_DEFAUT: { id: StyleReglageId; label: string; labelEn: string; icone: string; sousTitre?: string; sousTitreEn?: string }[] = [
  { id: "modele", label: "Modèle", labelEn: "Theme", icone: "M4 4h7v7H4Zm9 0h7v7h-7ZM4 13h7v7H4Zm9 0h7v7h-7Z" },
  {
    id: "couleurs",
    label: "Couleurs",
    labelEn: "Colors",
    icone: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-3.5 5.5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm7 0a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM8 15a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm8 1.5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z",
    sousTitre: "Tout le site",
    sousTitreEn: "Whole site",
  },
  {
    id: "textes",
    label: "Textes",
    labelEn: "Text",
    icone: "M4 6h16M4 12h10M4 18h7",
    sousTitre: "Polices et tailles",
    sousTitreEn: "Fonts and sizes",
  },
  { id: "formes-espaces", label: "Formes et espaces", labelEn: "Shapes and spacing", icone: "M4 4h7v7H4Zm10.5 2.5L20 12l-5.5 5.5L9 12Z" },
  { id: "cartes-produit", label: "Cartes produit", labelEn: "Product cards", icone: "M4 6h16v12H4Zm0 4h16M8 16h4" },
  {
    id: "mouvements",
    label: "Mouvements",
    labelEn: "Motion",
    icone: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z",
    sousTitre: "Animations et effets",
    sousTitreEn: "Animations and effects",
  },
];

export default function StyleReglages({
  styleReglage,
  state,
  setState,
}: {
  styleReglage: StyleReglageId;
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const def = STYLE_REGLAGES_DEFAUT.find((r) => r.id === styleReglage)!;

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
        {styleReglage === "modele" ? (
          <ModeleReglages state={state} setState={setState} />
        ) : styleReglage === "couleurs" ? (
          <CouleursReglages state={state} setState={setState} />
        ) : styleReglage === "textes" ? (
          <TextesReglages state={state} setState={setState} />
        ) : styleReglage === "formes-espaces" ? (
          <FormesEtEspacesReglages state={state} setState={setState} />
        ) : styleReglage === "cartes-produit" ? (
          <CartesProduitReglages state={state} setState={setState} />
        ) : (
          <MouvementsReglages state={state} setState={setState} />
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

function GroupeTitre({ label, icone }: { label: string; icone?: string }) {
  return (
    <p className="flex items-center gap-1.5 border-t border-[var(--dashboard-text)]/10 pt-2.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 first:border-t-0 first:pt-0">
      {icone && (
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0 text-brand-pink" aria-hidden>
          <path d={icone} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </p>
  );
}

function Interrupteur({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-4.5 w-8 shrink-0 items-center rounded-full p-0.5 transition ${checked ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[var(--dashboard-text)]/20"}`}
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

function SegmentPills<T extends string | number>({
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

function ModeleReglages({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();

  const appliquerModele = (id: ModeleId) => {
    const m = MODELES.find((x) => x.id === id)!;
    setState((s) => ({
      ...s,
      style: { ...s.style, modele: id, couleurFond: m.fond, couleurTexte: m.texte, couleurPrincipale: m.accent },
    }));
  };

  const reinitialiserModele = () =>
    setState((s) => (s.style.garderTextesImages ? { ...s, style: STYLE_DEFAUT } : { ...ETAT_DEFAUT }));

  return (
    <div>
      <GroupeTitre label={t("Modèle de départ", "Starting theme")} />
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
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

      <GroupeTitre label={t("Après le choix", "After choosing")} />
      <div className="mt-1.5 space-y-2.5">
        <Ligne label={t("Garder mes textes et images", "Keep my text and images")}>
          <Interrupteur
            checked={state.style.garderTextesImages}
            onChange={(v) => setState((s) => ({ ...s, style: { ...s.style, garderTextesImages: v } }))}
          />
        </Ligne>
        <button type="button" onClick={reinitialiserModele} className="text-[10.5px] font-semibold text-brand-pink">
          {t("Revenir au modèle d'origine", "Revert to original theme")}
        </button>
      </div>
    </div>
  );
}

const COULEURS_PRESETS = ["#E8207E", "#EC0C8C", "#7C3AED", "#A78BFA", "#2563EB", "#16A34A", "#F97316", "#EF4444"];

const ICONE_GOUTTE = "M12 3.5c3 3.8 6 7.2 6 10.5a6 6 0 1 1-12 0c0-3.3 3-6.7 6-10.5Z";
const ICONE_PANIER = "M4.5 7h15l-1.4 9.5a2 2 0 0 1-2 1.7H7.9a2 2 0 0 1-2-1.7Zm3-1.5V5a4.5 4.5 0 0 1 9 0v.5";
const ICONE_LUNE = "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z";
const ICONE_ROUAGE = "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM4 12h1.5M18.5 12H20M12 4v1.5M12 18.5V20M6.5 6.5l1 1M16.5 16.5l1 1M6.5 17.5l1-1M16.5 7.5l1-1";

function CouleursReglages({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const set = <K extends keyof EditeurState["style"]>(key: K, value: EditeurState["style"][K]) =>
    setState((s) => ({ ...s, style: { ...s.style, [key]: value } }));
  const majPiedDePage = (patch: Partial<EditeurState["piedDePage"]>) =>
    setState((s) => ({ ...s, piedDePage: { ...s.piedDePage, ...patch } }));
  const majBandeau = (patch: Partial<EditeurState["bandeau"]>) =>
    setState((s) => ({ ...s, bandeau: { ...s.bandeau, ...patch } }));

  return (
    <>
      <div>
        <GroupeTitre label={t("Couleur principale", "Primary color")} icone={ICONE_GOUTTE} />
        <p className="mt-1.5 text-[10.5px] font-semibold text-[var(--dashboard-text)]">{t("Boutons, prix en ligne, badges", "Buttons, online price, badges")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {COULEURS_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("couleurPrincipale", c)}
              aria-label={c}
              className="h-6.5 w-6.5 shrink-0 rounded-full transition"
              style={{
                background: c,
                boxShadow: state.style.couleurPrincipale.toLowerCase() === c.toLowerCase() ? "0 0 0 2px var(--dashboard-card-bg), 0 0 0 3.5px currentColor" : undefined,
                color: c,
              }}
            />
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="text-[10.5px] font-medium text-[var(--dashboard-text)]">{t("Teinte exacte", "Exact shade")}</p>
          <label
            className="relative h-6.5 w-6.5 shrink-0 cursor-pointer overflow-hidden rounded-full border border-[var(--dashboard-text)]/15"
            style={{ background: "conic-gradient(from 0deg,#EC0C8C,#F97316,#EAB308,#16A34A,#2563EB,#7C3AED,#EC0C8C)" }}
          >
            <input
              type="color"
              value={state.style.couleurPrincipale}
              onChange={(e) => set("couleurPrincipale", e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={t("Teinte exacte", "Exact shade")}
            />
          </label>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Bouton de commande", "Order button")} icone={ICONE_PANIER} />
        <div className="mt-1.5">
          <Ligne label={t("Couleur", "Color")}>
            <SegmentPills
              options={[
                ["nuit", t("Nuit", "Night")],
                ["principale", t("Principale", "Primary")],
                ["violet", t("Violet", "Purple")],
              ]}
              value={state.style.boutonCommandeCouleur}
              onChange={(v) => set("boutonCommandeCouleur", v)}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Fond du site", "Site background")} icone={ICONE_LUNE} />
        <div className="mt-1.5">
          <Ligne label={t("Apparence", "Appearance")}>
            <SegmentPills
              options={[
                ["clair", t("Clair", "Light")],
                ["sombre", t("Sombre", "Dark")],
              ]}
              value={state.style.apparence}
              onChange={(v) => set("apparence", v)}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Autres zones", "Other areas")} icone={ICONE_ROUAGE} />
        <div className="mt-1.5 space-y-3">
          <div>
            <p className="mb-1.5 text-[10.5px] font-medium text-[var(--dashboard-text)]">{t("Bandeau d'annonce", "Announcement bar")}</p>
            <SegmentPills
              options={[
                ["nuit", t("Nuit", "Night")],
                ["principale", t("Principale", "Primary")],
                ["claire", t("Claire", "Light")],
              ]}
              value={state.bandeau.couleur}
              onChange={(v) => majBandeau({ couleur: v })}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[10.5px] font-medium text-[var(--dashboard-text)]">{t("Pied de page", "Footer")}</p>
            <SegmentPills
              options={[
                ["nuit", t("Nuit", "Night")],
                ["clair", t("Clair", "Light")],
                ["degrade", t("Dégradé", "Gradient")],
              ]}
              value={state.piedDePage.couleur}
              onChange={(v) => majPiedDePage({ couleur: v })}
            />
          </div>

          <Ligne label={t("Étoiles", "Stars")}>
            <SegmentPills
              options={[
                ["or", t("Or", "Gold")],
                ["principale", t("Principale", "Primary")],
              ]}
              value={state.style.etoilesCouleur}
              onChange={(v) => set("etoilesCouleur", v)}
            />
          </Ligne>

          <div>
            <Ligne label={t("Période de fête programmée", "Scheduled holiday period")}>
              <Interrupteur checked={state.style.periodeFeteActive} onChange={(v) => set("periodeFeteActive", v)} />
            </Ligne>
            <p className="mt-0.5 text-[9px] text-brand-pink">{t("Du 20 au 31 décembre", "Dec 20 to 31")}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Selecteur<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="relative block rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2 text-[var(--dashboard-text)]">
      <span className="block text-[9px] text-[var(--dashboard-text)]/45">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-0.5 w-full appearance-none bg-transparent text-[11px] font-semibold text-[var(--dashboard-text)] outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]">
            {o}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--dashboard-text)]/40" aria-hidden>
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

function TextesReglages({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const set = <K extends keyof EditeurState["texte"]>(key: K, value: EditeurState["texte"][K]) =>
    setState((s) => ({ ...s, texte: { ...s.texte, [key]: value } }));

  return (
    <>
      <div>
        <GroupeTitre label={t("Polices", "Fonts")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Titres", "Headings")}>
            <SegmentPills
              options={[
                ["moderne", t("Moderne", "Modern")],
                ["elegante", t("Élégante", "Elegant")],
              ]}
              value={state.texte.titresPolice}
              onChange={(v) => set("titresPolice", v)}
            />
          </Ligne>
          <Selecteur
            label={t("Texte courant", "Body text")}
            value={state.texte.texteCourantPolice}
            options={["Sora", "Bricolage Grotesque"] as const}
            onChange={(v) => set("texteCourantPolice", v)}
          />
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Tailles", "Sizes")} />
        <div className="mt-1.5 space-y-2.5">
          <div>
            <p className="mb-1.5 text-[10.5px] font-medium text-[var(--dashboard-text)]">{t("Taille du texte", "Text size")}</p>
            <SegmentPills
              options={[
                ["petite", t("Petite", "Small")],
                ["moyenne", t("Moyenne", "Medium")],
                ["grande", t("Grande", "Large")],
              ]}
              value={state.texte.tailleTexte}
              onChange={(v) => set("tailleTexte", v)}
            />
          </div>
          <Ligne label={t("Titres en majuscules", "Uppercase headings")}>
            <Interrupteur checked={state.texte.titresMajuscules} onChange={(v) => set("titresMajuscules", v)} />
          </Ligne>
          <Ligne label={t("Graisse des titres", "Heading weight")}>
            <SegmentPills
              options={[
                ["demi", t("Demi", "Medium")],
                ["gras", t("Gras", "Bold")],
              ]}
              value={state.texte.graisseTitres}
              onChange={(v) => set("graisseTitres", v)}
            />
          </Ligne>
          <Ligne label={t("Espacement des lettres", "Letter spacing")}>
            <SegmentPills
              options={[
                ["serre", t("Serré", "Tight")],
                ["normal", t("Normal", "Normal")],
              ]}
              value={state.texte.espacementLettres}
              onChange={(v) => set("espacementLettres", v)}
            />
          </Ligne>
        </div>
      </div>
    </>
  );
}

function FormesEtEspacesReglages({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const set = <K extends keyof EditeurState["style"]>(key: K, value: EditeurState["style"][K]) =>
    setState((s) => ({ ...s, style: { ...s.style, [key]: value } }));

  return (
    <>
      <div>
        <GroupeTitre label={t("Angles et ombres", "Corners and shadows")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Arrondi des angles", "Corner radius")}>
            <SegmentPills
              options={[
                [0, "0"],
                [8, "8"],
                [18, "18"],
                [26, "26"],
              ]}
              value={state.style.arrondi}
              onChange={(v) => set("arrondi", v)}
            />
          </Ligne>
          <Ligne label={t("Ombres", "Shadows")}>
            <SegmentPills
              options={[
                ["aucune", t("Aucune", "None")],
                ["legeres", t("Légères", "Light")],
                ["marquees", t("Marquées", "Strong")],
              ]}
              value={state.style.ombres}
              onChange={(v) => set("ombres", v)}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Boutons", "Buttons")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Forme", "Shape")}>
            <SegmentPills
              options={[
                ["carre", t("Carré", "Square")],
                ["arrondi", t("Arrondi", "Rounded")],
                ["pilule", t("Pilule", "Pill")],
              ]}
              value={state.style.boutonForme}
              onChange={(v) => set("boutonForme", v)}
            />
          </Ligne>
          <Ligne label={t("Texte en majuscules", "Uppercase text")}>
            <Interrupteur checked={state.style.boutonTexteMajuscules} onChange={(v) => set("boutonTexteMajuscules", v)} />
          </Ligne>
          <Ligne label={t("Épaisseur du contour", "Border thickness")}>
            <SegmentPills
              options={[
                ["fine", t("Fine", "Thin")],
                ["epaisse", t("Épaisse", "Thick")],
              ]}
              value={state.style.epaisseurContour}
              onChange={(v) => set("epaisseurContour", v)}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Espaces", "Spacing")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Entre les sections", "Between sections")}>
            <SegmentPills
              options={[
                ["serre", t("Serré", "Tight")],
                ["normal", t("Normal", "Normal")],
                ["aere", t("Aéré", "Airy")],
              ]}
              value={state.style.espacementSections}
              onChange={(v) => set("espacementSections", v)}
            />
          </Ligne>
          <Ligne label={t("Largeur sur ordinateur", "Desktop width")}>
            <SegmentPills
              options={[
                ["normale", t("Normale", "Normal")],
                ["large", t("Large", "Wide")],
              ]}
              value={state.style.largeurOrdinateur}
              onChange={(v) => set("largeurOrdinateur", v)}
            />
          </Ligne>
        </div>
      </div>
    </>
  );
}

const ICONE_ALLURE = "M12 3.5c3 3.8 6 7.2 6 10.5a6 6 0 1 1-12 0c0-3.3 3-6.7 6-10.5Z";
const ICONE_COMPORTEMENT = "M13 2 4 14h6l-1 8 9-12h-6Z";
const ICONE_ZONES = "M12 3a6 6 0 0 0-6 6c0 4.5 6 12 6 12s6-7.5 6-12a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z";

const ZONE_VERROUILLEE = { label: "Grilles de produits", labelEn: "Product grids" };
// "vous-aimerez-aussi" contrôle la visibilité de la section "produits-lies"
// (page commande, cf. BoutiquePreview.tsx) — désactivée ici, cette section
// ne s'affiche pas, même ajoutée/visible côté SectionsPanel.tsx.
const ZONES_BASCULABLES: { id: CartesProduitZoneId; label: string; labelEn: string }[] = [
  { id: "vous-aimerez-aussi", label: "Vous aimerez aussi", labelEn: "You may also like" },
  { id: "recherche", label: "Recherche", labelEn: "Search" },
  { id: "rayons", label: "Rayons", labelEn: "Categories" },
];

function TagPill({ label, active, verrouille, onClick }: { label: string; active: boolean; verrouille?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      disabled={verrouille}
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[9.5px] font-semibold transition ${
        active
          ? "border-transparent bg-brand-pink text-white"
          : "border-brand-pink/50 text-[var(--dashboard-text)] disabled:cursor-default"
      }`}
    >
      {label}
    </button>
  );
}

function CartesProduitReglages({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const c = state.cartesProduit;
  const maj = (patch: Partial<EditeurState["cartesProduit"]>) =>
    setState((s) => ({ ...s, cartesProduit: { ...s.cartesProduit, ...patch } }));
  const basculerZone = (id: CartesProduitZoneId) =>
    maj({ zones: c.zones.includes(id) ? c.zones.filter((z) => z !== id) : [...c.zones, id] });

  return (
    <>
      <div>
        <GroupeTitre label={t("Allure", "Look")} icone={ICONE_ALLURE} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Style", "Style")}>
            <SegmentPills
              options={[
                ["ombre", t("Ombre", "Shadow")],
                ["bordure", t("Bordure", "Border")],
                ["sans-cadre", t("Sans cadre", "Frameless")],
              ]}
              value={c.style}
              onChange={(v) => maj({ style: v })}
            />
          </Ligne>
          <Ligne label={t("Position des badges", "Badge position")}>
            <SegmentPills
              options={[
                ["coin", t("Coin", "Corner")],
                ["dessous", t("Dessous", "Below")],
              ]}
              value={c.positionBadges}
              onChange={(v) => maj({ positionBadges: v })}
            />
          </Ligne>
          <Ligne label={t("Densité", "Density")}>
            <SegmentPills
              options={[
                ["confortable", t("Confortable", "Comfortable")],
                ["compacte", t("Compacte", "Compact")],
              ]}
              value={c.densite}
              onChange={(v) => maj({ densite: v })}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Comportement", "Behavior")} icone={ICONE_COMPORTEMENT} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Deuxième photo au survol", "Second photo on hover")}>
            <Interrupteur checked={c.deuxiemePhotoSurvol} onChange={(v) => maj({ deuxiemePhotoSurvol: v })} />
          </Ligne>
          <Ligne label={t("Ronds de couleur des variantes", "Variant color dots")}>
            <Interrupteur checked={c.rondsCouleurVariantes} onChange={(v) => maj({ rondsCouleurVariantes: v })} />
          </Ligne>
          <Ligne label={t("Commande rapide sans quitter la page", "Quick order without leaving the page")}>
            <Interrupteur checked={c.commandeRapide} onChange={(v) => maj({ commandeRapide: v })} />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Où cela s'applique", "Where this applies")} icone={ICONE_ZONES} />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <TagPill label={t(ZONE_VERROUILLEE.label, ZONE_VERROUILLEE.labelEn)} active verrouille />
          {ZONES_BASCULABLES.map((z) => (
            <TagPill
              key={z.id}
              label={t(z.label, z.labelEn)}
              active={c.zones.includes(z.id)}
              onClick={() => basculerZone(z.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function MouvementsReglages({
  state,
  setState,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const m = state.mouvements;
  const maj = (patch: Partial<EditeurState["mouvements"]>) =>
    setState((s) => ({ ...s, mouvements: { ...s.mouvements, ...patch } }));

  return (
    <>
      <div>
        <GroupeTitre label={t("Page", "Page")} />
        <div className="mt-1.5 space-y-2.5">
          <Ligne label={t("Apparition au défilement", "Reveal on scroll")}>
            <Interrupteur checked={m.apparitionAuDefilement} onChange={(v) => maj({ apparitionAuDefilement: v })} />
          </Ligne>
          <Ligne label={t("Effet au survol", "Hover effect")}>
            <SegmentPills
              options={[
                ["aucun", t("Aucun", "None")],
                ["soulever", t("Soulever", "Lift")],
                ["zoom", t("Zoom", "Zoom")],
              ]}
              value={m.effetSurvol}
              onChange={(v) => maj({ effetSurvol: v })}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Bouton de commande", "Order button")} />
        <div className="mt-1.5">
          <Ligne label={t("Animation", "Animation")}>
            <SegmentPills
              options={[
                ["aucun", t("Aucune", "None")],
                ["pulsation", t("Pulsation", "Pulse")],
                ["vibration", t("Vibration", "Vibration")],
              ]}
              value={m.boutonCommandeAnimation}
              onChange={(v) => maj({ boutonCommandeAnimation: v })}
            />
          </Ligne>
        </div>
      </div>

      <div>
        <GroupeTitre label={t("Icônes", "Icons")} />
        <div className="mt-1.5">
          <Ligne label={t("Style des icônes", "Icon style")}>
            <SegmentPills
              options={[
                ["trait", t("Trait", "Outline")],
                ["pleines", t("Pleines", "Filled")],
              ]}
              value={m.styleIcones}
              onChange={(v) => maj({ styleIcones: v })}
            />
          </Ligne>
        </div>
      </div>
    </>
  );
}
