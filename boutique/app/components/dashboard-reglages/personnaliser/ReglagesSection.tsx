"use client";

import { Tag, texteAvecChiffres } from "../../dashboard-accueil/shared";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { SECTIONS_DEFAUT } from "./types";
import type { EditeurState, FaqItem, SectionId } from "./types";

/*
  Colonne de droite : réglages de la section choisie dans SectionsPanel.tsx.
  Un bloc de fonctions par section (mêmes id que SECTIONS_DEFAUT) plutôt
  qu'un formulaire générique — chaque section a sa propre forme de données
  (cf. types.ts), pas de schéma commun à tenir.
*/

export default function ReglagesSection({
  sectionId,
  state,
  setState,
}: {
  sectionId: SectionId;
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
}) {
  const { t } = useDashboardLangue();
  const def = SECTIONS_DEFAUT.find((d) => d.id === sectionId)!;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--dashboard-text)]/10 pb-2.5">
        <p className="text-[12.5px] font-bold text-[var(--dashboard-text)]">{t(def.label, def.labelEn)}</p>
        {def.verrouillee && <Tag tone="neutral">{t("Toujours présente", "Always shown")}</Tag>}
      </div>
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto pr-0.5">
        <Corps sectionId={sectionId} state={state} setState={setState} t={t} />
      </div>
    </div>
  );
}

function Corps({
  sectionId,
  state,
  setState,
  t,
}: {
  sectionId: SectionId;
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  t: (fr: string, en: string) => string;
}) {
  switch (sectionId) {
    case "bandeau":
      return (
        <>
          <Champ
            label={t("Message", "Message")}
            value={state.bandeau.message}
            onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, message: v } }))}
          />
          <Segmente
            label={t("Défilement", "Scrolling")}
            value={state.bandeau.defilement}
            options={[
              { value: "fixe", label: t("Fixe", "Fixed") },
              { value: "tour-a-tour", label: t("Tour à tour", "One at a time") },
              { value: "continu", label: t("Continu", "Continuous") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, defilement: v as typeof s.bandeau.defilement } }))}
          />
        </>
      );

    case "entete":
      return (
        <>
          <Ligne label={t("Nom à côté du logo", "Name next to the logo")}>
            <Interrupteur checked={state.entete.nomAvecLogo} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, nomAvecLogo: v } }))} />
          </Ligne>
          <Segmente
            label={t("Position du logo", "Logo position")}
            value={state.entete.positionLogo}
            options={[
              { value: "gauche", label: t("Gauche", "Left") },
              { value: "centre", label: t("Centre", "Center") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, positionLogo: v as typeof s.entete.positionLogo } }))}
          />
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">{t("Icônes", "Icons")}</p>
          <div className="flex flex-wrap gap-1.5">
            <Puce active={state.entete.recherche} label={t("Recherche", "Search")} onClick={() => setState((s) => ({ ...s, entete: { ...s.entete, recherche: !s.entete.recherche } }))} />
            <Puce active={state.entete.panier} label={t("Panier", "Cart")} onClick={() => setState((s) => ({ ...s, entete: { ...s.entete, panier: !s.entete.panier } }))} />
            <Puce active={state.entete.compte} label={t("Compte", "Account")} onClick={() => setState((s) => ({ ...s, entete: { ...s.entete, compte: !s.entete.compte } }))} />
          </div>
        </>
      );

    case "galerie":
      return (
        <>
          <Ligne label={t("Lecture automatique", "Autoplay")} note={t("Sans le son au départ", "Muted at first")}>
            <Interrupteur checked={state.galerie.lectureAuto} onChange={(v) => setState((s) => ({ ...s, galerie: { ...s.galerie, lectureAuto: v } }))} />
          </Ligne>
          <Ligne label={t("Répéter la vidéo", "Loop the video")}>
            <Interrupteur checked={state.galerie.repeter} onChange={(v) => setState((s) => ({ ...s, galerie: { ...s.galerie, repeter: v } }))} />
          </Ligne>
          <Segmente
            label={t("Format", "Format")}
            value={state.galerie.format}
            options={[
              { value: "carre", label: t("Carré", "Square") },
              { value: "portrait", label: t("Portrait", "Portrait") },
              { value: "paysage", label: t("Paysage", "Landscape") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, galerie: { ...s.galerie, format: v as typeof s.galerie.format } }))}
          />
          <Champ label={t("Texte du badge", "Badge text")} value={state.galerie.badge} onChange={(v) => setState((s) => ({ ...s, galerie: { ...s.galerie, badge: v } }))} />
          <p className="rounded-xl border border-dashed border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Aucune photo n'est encore déposée pour ce produit. Ajoutez-en depuis sa fiche, dans Produits.",
              "No photo has been uploaded for this product yet. Add some from its page, under Products."
            )}
          </p>
        </>
      );

    case "infos":
      return (
        <>
          {([
            ["noteMoyenne", t("Note moyenne", "Average rating")],
            ["ancienPrixBarre", t("Ancien prix barré", "Old price struck through")],
            ["badgeRemise", t("Badge de remise", "Discount badge")],
            ["stockRestant", t("Stock restant", "Remaining stock")],
            ["variantes", t("Variantes", "Variants")],
            ["quantite", t("Quantité", "Quantity")],
          ] as const).map(([key, label]) => (
            <Ligne key={key} label={label}>
              <Interrupteur checked={state.infos[key]} onChange={(v) => setState((s) => ({ ...s, infos: { ...s.infos, [key]: v } }))} />
            </Ligne>
          ))}
        </>
      );

    case "offres":
      return (
        <>
          <Ligne label={t("Proposer des offres", "Offer quantity discounts")}>
            <Interrupteur checked={state.offres.actif} onChange={(v) => setState((s) => ({ ...s, offres: { ...s.offres, actif: v } }))} />
          </Ligne>
          {state.offres.actif && (
            <div className="space-y-1.5">
              {state.offres.paliers.map((p, i) => (
                <div key={p.unites} className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-text)]/10 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[var(--dashboard-text)]">
                    <span className="font-figures">{p.unites}</span> {p.unites > 1 ? t("flacons", "bottles") : t("flacon", "bottle")}
                    {p.badge && <span className="ml-1 text-[9px] font-normal text-brand-pink">· {p.badge}</span>}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={p.remisePct}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        offres: {
                          ...s.offres,
                          paliers: s.offres.paliers.map((x, j) => (j === i ? { ...x, remisePct: Number(e.target.value) } : x)),
                        },
                      }))
                    }
                    className="w-14 rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-2 py-1 text-right text-[11px] font-semibold text-[var(--dashboard-text)] outline-none focus:border-brand-pink/50 font-figures"
                  />
                  <span className="text-[10px] text-[var(--dashboard-text)]/40">%</span>
                </div>
              ))}
            </div>
          )}
        </>
      );

    case "formulaire":
      return (
        <>
          <div>
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
              {t("Champs obligatoires", "Required fields")}
            </p>
            <div className="space-y-1">
              {[t("Nom et prénom", "Full name"), t("Commune", "District"), t("Adresse précise", "Precise address"), t("Téléphone", "Phone number")].map((c) => (
                <div key={c} className="flex items-center gap-2 rounded-lg bg-[var(--dashboard-text)]/[0.03] px-2.5 py-1.5 text-[10.5px] text-[var(--dashboard-text)]/70">
                  <CadenasIcon />
                  {c}
                </div>
              ))}
            </div>
          </div>
          <Segmente
            label={t("Colonnes", "Columns")}
            value={String(state.formulaire.colonnes)}
            options={[
              { value: "1", label: t("Une", "One") },
              { value: "2", label: t("Deux", "Two") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, colonnes: Number(v) as 1 | 2 } }))}
          />
          <Ligne label={t("Libellés dans le champ", "Labels inside the field")}>
            <Interrupteur checked={state.formulaire.libellesDansChamp} onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, libellesDansChamp: v } }))} />
          </Ligne>
          <Ligne label={t("Étapes numérotées", "Numbered steps")}>
            <Interrupteur checked={state.formulaire.etapesNumerotees} onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, etapesNumerotees: v } }))} />
          </Ligne>
          <Ligne label={t("Bouton « Me localiser »", "“Locate me” button")}>
            <Interrupteur checked={state.formulaire.boutonLocaliser} onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, boutonLocaliser: v } }))} />
          </Ligne>
          <Ligne label={t("Mention spécifique", "Special note")} note={t("Facultative pour le client", "Optional for the customer")}>
            <Interrupteur checked={state.formulaire.mentionSpecifique} onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, mentionSpecifique: v } }))} />
          </Ligne>
        </>
      );

    case "paiement":
      return (
        <>
          <Ligne label={t("Payer en ligne", "Pay online")}>
            <Interrupteur checked={state.paiement.payerEnLigne} onChange={(v) => setState((s) => ({ ...s, paiement: { ...s.paiement, payerEnLigne: v } }))} />
          </Ligne>
          {state.paiement.payerEnLigne && (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-text)]/10 px-3 py-2">
              <span className="flex-1 text-[11px] font-semibold text-[var(--dashboard-text)]">{t("Remise si paiement en ligne", "Discount for paying online")}</span>
              <input
                type="number"
                min={0}
                max={90}
                value={state.paiement.remiseEnLignePct}
                onChange={(e) => setState((s) => ({ ...s, paiement: { ...s.paiement, remiseEnLignePct: Number(e.target.value) } }))}
                className="w-14 rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-2 py-1 text-right text-[11px] font-semibold text-[var(--dashboard-text)] outline-none focus:border-brand-pink/50 font-figures"
              />
              <span className="text-[10px] text-[var(--dashboard-text)]/40">%</span>
            </div>
          )}
          <Ligne label={t("Payer à la livraison", "Pay on delivery")}>
            <Interrupteur checked={state.paiement.payerALaLivraison} onChange={(v) => setState((s) => ({ ...s, paiement: { ...s.paiement, payerALaLivraison: v } }))} />
          </Ligne>
          <Ligne label={t("Livraison express", "Express delivery")} note={texteAvecChiffres(t("+2 000 F, fixé par le partenaire agréé", "+2,000 F, set by the approved partner"))}>
            <Interrupteur checked={state.paiement.livraisonExpress} onChange={(v) => setState((s) => ({ ...s, paiement: { ...s.paiement, livraisonExpress: v } }))} />
          </Ligne>
          <a
            href="/dashboard/reglages?tab=commande"
            className="block rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] font-semibold text-brand-pink"
          >
            {t("Orange Money, MTN MoMo, Moov Money, Wave → réglés dans Page de commande", "Orange Money, MTN MoMo, Moov Money, Wave → set in Order page")}
          </a>
        </>
      );

    case "avis":
      return (
        <>
          <Segmente
            label={t("Disposition", "Layout")}
            value={state.avis.disposition}
            options={[
              { value: "liste", label: t("Liste", "List") },
              { value: "grille", label: t("Grille", "Grid") },
              { value: "carrousel", label: t("Carrousel", "Carousel") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, avis: { ...s.avis, disposition: v as typeof s.avis.disposition } }))}
          />
          <div>
            <p className="mb-1 flex items-center justify-between text-[10.5px] font-medium text-[var(--dashboard-text)]">
              <span>{t("Avis affichés", "Reviews shown")}</span>
              <span className="text-[var(--dashboard-text)]/50 font-figures">{state.avis.nombreAffiches}</span>
            </p>
            <input
              type="range"
              min={2}
              max={12}
              value={state.avis.nombreAffiches}
              onChange={(e) => setState((s) => ({ ...s, avis: { ...s.avis, nombreAffiches: Number(e.target.value) } }))}
              className="w-full accent-brand-pink"
            />
          </div>
          <p className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Le badge « Achat vérifié » est posé automatiquement sur les avis liés à une commande livrée.",
              "The “Verified purchase” badge is added automatically to reviews tied to a delivered order."
            )}
          </p>
        </>
      );

    case "faq":
      return (
        <>
          <Ligne label={t("Première question ouverte", "First question expanded")}>
            <Interrupteur checked={state.faq.premiereOuverte} onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, premiereOuverte: v } }))} />
          </Ligne>
          <div className="space-y-2">
            {state.faq.items.map((item, i) => (
              <div key={i} className="rounded-xl border border-[var(--dashboard-text)]/10 p-2.5">
                <Champ
                  label={t("Question", "Question")}
                  value={item.question}
                  onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, items: patchFaq(s.faq.items, i, { question: v }) } }))}
                />
                <div className="mt-2">
                  <Champ
                    label={t("Réponse", "Answer")}
                    value={item.reponse}
                    multiline
                    onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, items: patchFaq(s.faq.items, i, { reponse: v }) } }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setState((s) => ({ ...s, faq: { ...s.faq, items: s.faq.items.filter((_, j) => j !== i) } }))}
                  className="mt-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/40 hover:text-[#c8262d]"
                >
                  {t("Supprimer", "Delete")}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setState((s) => ({
                ...s,
                faq: { ...s.faq, items: [...s.faq.items, { question: t("Nouvelle question", "New question"), reponse: "" }] },
              }))
            }
            className="w-full rounded-xl border border-dashed border-brand-pink/40 py-2 text-[10.5px] font-semibold text-brand-pink"
          >
            + {t("Ajouter une question", "Add a question")}
          </button>
        </>
      );

    case "vendu-par":
      return (
        <p className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
          {t(
            "Reprend le nom, le téléphone, l'adresse email et la localisation renseignés dans « Ma boutique ». Ne se masque pas.",
            "Pulls the name, phone number, email and location set in “My shop”. Cannot be hidden."
          )}
        </p>
      );

    case "pied-de-page":
      return (
        <>
          {([
            ["presentation", t("Présentation", "About")],
            ["liens", t("Liens", "Links")],
            ["reseaux", t("Réseaux sociaux", "Social links")],
            ["moyensPaiement", t("Moyens de paiement acceptés", "Accepted payment methods")],
          ] as const).map(([key, label]) => (
            <Ligne key={key} label={label}>
              <Interrupteur checked={state.piedDePage[key]} onChange={(v) => setState((s) => ({ ...s, piedDePage: { ...s.piedDePage, [key]: v } }))} />
            </Ligne>
          ))}
          <Champ
            label={t("Mention du bas", "Bottom note")}
            value={state.piedDePage.mentionBas}
            onChange={(v) => setState((s) => ({ ...s, piedDePage: { ...s.piedDePage, mentionBas: v } }))}
          />
        </>
      );

    default:
      return null;
  }
}

function patchFaq(items: FaqItem[], index: number, patch: Partial<FaqItem>): FaqItem[] {
  return items.map((it, i) => (i === index ? { ...it, ...patch } : it));
}

const champBoxClasses =
  "mt-1 w-full rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-2.5 py-2 text-[11px] font-medium text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/50 focus:bg-brand-pink/5";

function Champ({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{label}</p>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={`${champBoxClasses} resize-none leading-relaxed`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={champBoxClasses} />
      )}
    </div>
  );
}

function Ligne({ label, note, children }: { label: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[var(--dashboard-text)]">{label}</p>
        {note && <p className="mt-0.5 text-[9.5px] text-[var(--dashboard-text)]/40">{note}</p>}
      </div>
      {children}
    </div>
  );
}

function Segmente({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[10.5px] font-medium text-[var(--dashboard-text)]">{label}</p>
      <div className="grid gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`truncate rounded-lg py-1.5 text-[10px] font-semibold transition ${
              value === o.value ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Puce({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
        active ? "bg-brand-pink/12 text-brand-pink" : "bg-[var(--dashboard-text)]/[0.05] text-[var(--dashboard-text)]/50"
      }`}
    >
      {label}
    </button>
  );
}

function Interrupteur({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${checked ? "justify-end bg-[#141220] dark:bg-brand-pink" : "justify-start bg-[var(--dashboard-text)]/20"}`}
    >
      <span className="h-4 w-4 rounded-full bg-white shadow" />
    </button>
  );
}

function CadenasIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
