"use client";

import { Tag, texteAvecChiffres } from "../../dashboard-accueil/shared";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { CATEGORIES_APERCU, SECTIONS_DEFAUT, appartientPage, deplacerSection, placerAvis, placerConfiance, placerEngagements, placerFaq, placerGrille, placerPromo, positionAvisActuelle, positionConfianceActuelle, positionEngagementsActuelle, positionFaqActuelle, positionGrilleActuelle, positionPromoActuelle } from "./types";
import type { EditeurState, FaqItem, MenuLien, PageId, PositionAvis, PositionConfiance, PositionEngagements, PositionFaq, PositionGrille, PositionPromo, SectionId, SectionState } from "./types";

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
  page,
}: {
  sectionId: SectionId;
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  page: PageId;
}) {
  const { t } = useDashboardLangue();
  const def = SECTIONS_DEFAUT.find((d) => d.id === sectionId)!;
  const sectionState = state.sections.find((s) => s.id === sectionId);
  const majSection = (patch: Partial<SectionState>) =>
    setState((s) => ({ ...s, sections: s.sections.map((sec) => (sec.id === sectionId ? { ...sec, ...patch } : sec)) }));

  const sectionsPage = state.sections.filter((sec) => appartientPage(sec.id, page));
  const indexPage = sectionsPage.findIndex((sec) => sec.id === sectionId);
  const deplacer = (sens: -1 | 1) => setState((s) => ({ ...s, sections: deplacerSection(s.sections, sectionId, page, sens) }));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3.5">
      <div className="mb-3 border-b border-[var(--dashboard-text)]/10 pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-[var(--dashboard-text)]">{t(def.label, def.labelEn)}</p>
            {def.description && (
              <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/45">{t(def.description, def.descriptionEn ?? def.description)}</p>
            )}
          </div>
          {def.verrouillee && <Tag tone="neutral">{t("Toujours présente", "Always shown")}</Tag>}
        </div>
        {sectionState && (
          <div className="mt-2.5 flex items-center gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1">
            <button
              type="button"
              disabled={indexPage <= 0}
              onClick={() => deplacer(-1)}
              className="flex-1 rounded-lg py-1 text-[10px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-card-bg)] disabled:opacity-30"
            >
              {t("Monter", "Move up")}
            </button>
            <button
              type="button"
              disabled={indexPage < 0 || indexPage >= sectionsPage.length - 1}
              onClick={() => deplacer(1)}
              className="flex-1 rounded-lg py-1 text-[10px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-card-bg)] disabled:opacity-30"
            >
              {t("Descendre", "Move down")}
            </button>
            {!def.verrouillee && (
              <button
                type="button"
                onClick={() => majSection({ visible: !sectionState.visible })}
                className="flex-1 rounded-lg py-1 text-[10px] font-semibold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-card-bg)]"
              >
                {sectionState.visible ? t("Masquer", "Hide") : t("Afficher", "Show")}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        <Corps sectionId={sectionId} state={state} setState={setState} t={t} />
        {sectionState && sectionId !== "bandeau" && sectionId !== "entete" && sectionId !== "pied-de-page" && (
          <>
            <GroupeTitre label={t("Pour cette section", "For this section")} />
            <Ligne label={t("Largeur", "Width")}>
              <SegmentPills
                value={sectionState.largeur}
                options={[
                  { value: "page", label: t("Page", "Boxed") },
                  { value: "pleine", label: t("Pleine", "Full width") },
                ]}
                onChange={(v) => majSection({ largeur: v as SectionState["largeur"] })}
              />
            </Ligne>
            <Ligne label={t("Marges", "Margins")}>
              <SegmentPills
                value={sectionState.marges}
                options={[
                  { value: "petites", label: t("Petites", "Small") },
                  { value: "moyennes", label: t("Moyennes", "Medium") },
                  { value: "grandes", label: t("Grandes", "Large") },
                ]}
                onChange={(v) => majSection({ marges: v as SectionState["marges"] })}
              />
            </Ligne>
            <Ligne label={t("Couleurs", "Colors")}>
              <SegmentPills
                value={sectionState.couleurs}
                options={[
                  { value: "claires", label: t("Claires", "Light") },
                  { value: "douces", label: t("Douces", "Soft") },
                  { value: "nuit", label: t("Nuit", "Night") },
                ]}
                onChange={(v) => majSection({ couleurs: v as SectionState["couleurs"] })}
              />
            </Ligne>
            <Ligne label={t("Visible sur téléphone", "Visible on phone")}>
              <Interrupteur checked={sectionState.visibleTelephone} onChange={(v) => majSection({ visibleTelephone: v })} />
            </Ligne>
            <Ligne label={t("Visible sur ordinateur", "Visible on computer")}>
              <Interrupteur checked={sectionState.visibleOrdinateur} onChange={(v) => majSection({ visibleOrdinateur: v })} />
            </Ligne>
            {!def.verrouillee && (
              <Ligne label={t("Afficher la section", "Show this section")}>
                <Interrupteur checked={sectionState.visible} onChange={(v) => majSection({ visible: v })} />
              </Ligne>
            )}
          </>
        )}
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
    case "bandeau": {
      const b = state.bandeau;
      return (
        <>
          <GroupeTitre label={t("Contenu", "Content")} />
          {b.messages.length > 1 && (
            <Segmente
              label={t("Message affiché", "Message shown")}
              value={String(b.messageActif)}
              options={b.messages.map((_, i) => ({ value: String(i), label: t(`Message ${i + 1}`, `Message ${i + 1}`) }))}
              onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, messageActif: Number(v) } }))}
            />
          )}
          <div className="space-y-2">
            {b.messages.map((msg, i) => (
              <div key={i} className="rounded-xl border border-[var(--dashboard-text)]/10 p-2.5">
                <Champ
                  label={t(`Message ${i + 1}`, `Message ${i + 1}`)}
                  value={msg}
                  onChange={(v) =>
                    setState((s) => ({ ...s, bandeau: { ...s.bandeau, messages: s.bandeau.messages.map((m, j) => (j === i ? v : m)) } }))
                  }
                />
                {b.messages.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setState((s) => {
                        const messages = s.bandeau.messages.filter((_, j) => j !== i);
                        return { ...s, bandeau: { ...s.bandeau, messages, messageActif: Math.min(s.bandeau.messageActif, messages.length - 1) } };
                      })
                    }
                    className="mt-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/40 hover:text-[#c8262d]"
                  >
                    {t("Supprimer", "Delete")}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, bandeau: { ...s.bandeau, messages: [...s.bandeau.messages, t("Nouveau message", "New message")] } }))}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-pink/40 px-3.5 py-1.5 text-[10px] font-semibold text-brand-pink"
          >
            + {t("Ajouter un message", "Add a message")}
          </button>
          <Ligne label={t("Icône devant le message", "Icon before the message")}>
            <Interrupteur checked={b.iconeDevantMessage} onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, iconeDevantMessage: v } }))} />
          </Ligne>
          <Ligne label={t("Compte à rebours", "Countdown")}>
            <Interrupteur checked={b.compteARebours} onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, compteARebours: v } }))} />
          </Ligne>

          <GroupeTitre label={t("Affichage", "Display")} />
          <Segmente
            label={t("Défilement", "Scrolling")}
            value={b.defilement}
            options={[
              { value: "fixe", label: t("Fixe", "Fixed") },
              { value: "tour-a-tour", label: t("Tour à tour", "One at a time") },
              { value: "continu", label: t("Continu", "Continuous") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, defilement: v as typeof s.bandeau.defilement } }))}
          />
          <Segmente
            label={t("Couleurs", "Colors")}
            value={b.couleur}
            options={[
              { value: "nuit", label: t("Nuit", "Night") },
              { value: "principale", label: t("Principale", "Brand") },
              { value: "claire", label: t("Claire", "Light") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, couleur: v as typeof s.bandeau.couleur } }))}
          />
          <Ligne label={t("Le client peut le fermer", "The customer can close it")}>
            <Interrupteur checked={b.fermable} onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, fermable: v } }))} />
          </Ligne>
          <Ligne label={t("Sur toutes les pages", "On every page")}>
            <Interrupteur checked={b.surToutesLesPages} onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, surToutesLesPages: v } }))} />
          </Ligne>
          <Ligne label={t("Reste visible en défilant", "Stays visible while scrolling")}>
            <Interrupteur checked={b.resteVisibleEnDefilant} onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, resteVisibleEnDefilant: v } }))} />
          </Ligne>
        </>
      );
    }

    case "entete":
      return (
        <>
          <GroupeTitre label={t("Disposition", "Layout")} />
          <Ligne label={t("Sur ordinateur", "On computer")}>
            <SegmentPills
              value={state.entete.positionLogo}
              options={[
                { value: "gauche", label: t("Logo à gauche", "Logo on the left") },
                { value: "centre", label: t("Logo au centre", "Logo centered") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, positionLogo: v as typeof s.entete.positionLogo } }))}
            />
          </Ligne>
          <Ligne label={t("Logo sur téléphone", "Logo on phone")}>
            <SegmentPills
              value={state.entete.positionLogoMobile}
              options={[
                { value: "centre", label: t("Au centre", "Centered") },
                { value: "gauche", label: t("À gauche", "Left") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, positionLogoMobile: v as typeof s.entete.positionLogoMobile } }))}
            />
          </Ligne>
          <Ligne label={t("Taille du logo", "Logo size")}>
            <SegmentPills
              value={state.entete.tailleLogo}
              options={[
                { value: "s", label: t("Petite", "Small") },
                { value: "m", label: t("Moyenne", "Medium") },
                { value: "l", label: t("Grande", "Large") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, tailleLogo: v as typeof s.entete.tailleLogo } }))}
            />
          </Ligne>
          <Ligne label={t("Nom à côté du logo", "Name next to the logo")}>
            <Interrupteur checked={state.entete.nomAvecLogo} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, nomAvecLogo: v } }))} />
          </Ligne>
          <Ligne label={t("Transparent sur la grande image", "Transparent over the hero image")} note={t("Accueil seulement", "Home only")}>
            <Interrupteur checked={state.entete.transparentSurHero} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, transparentSurHero: v } }))} />
          </Ligne>

          <GroupeTitre label={t("Éléments", "Elements")} />
          <Ligne label={t("Recherche", "Search")}>
            <SegmentPills
              value={state.entete.rechercheStyle}
              options={[
                { value: "barre", label: t("Barre", "Bar") },
                { value: "icone", label: t("Icône", "Icon") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, rechercheStyle: v as typeof s.entete.rechercheStyle } }))}
            />
          </Ligne>
          <Ligne label={t("Icône du panier", "Cart icon")}>
            <SegmentPills
              value={state.entete.panierStyle}
              options={[
                { value: "sac", label: t("Sac", "Bag") },
                { value: "chariot", label: t("Chariot", "Cart") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, panierStyle: v as typeof s.entete.panierStyle } }))}
            />
          </Ligne>
          <Ligne label={t("Compte client", "Customer account")}>
            <Interrupteur checked={state.entete.compte} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, compte: v } }))} />
          </Ligne>
          <Ligne label={t('Bouton « Nous écrire »', 'Button "Message us"')}>
            <Interrupteur checked={state.entete.nousEcrire} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, nousEcrire: v } }))} />
          </Ligne>
          <Ligne label={t("Grand menu avec images", "Large menu with images")}>
            <Interrupteur checked={state.entete.grandMenuAvecImages} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, grandMenuAvecImages: v } }))} />
          </Ligne>

          <GroupeTitre label={t("Comportement", "Behavior")} />
          <Ligne label={t("Reste visible", "Stays visible")}>
            <SegmentPills
              value={state.entete.resteVisible}
              options={[
                { value: "non", label: t("Non", "No") },
                { value: "toujours", label: t("Toujours", "Always") },
                { value: "en-remontant", label: t("En remontant", "On scroll up") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, resteVisible: v as typeof s.entete.resteVisible } }))}
            />
          </Ligne>

          <p className="text-[10px] font-medium text-[var(--dashboard-text)]/50">{t("Menu", "Menu")}</p>
          <div className="flex flex-wrap gap-1.5">
            {state.entete.menuLiens.map((lien, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full bg-[var(--dashboard-text)]/[0.06] py-1 pl-2.5 pr-1">
                <input
                  value={lien.label}
                  onChange={(ev) =>
                    setState((s) => ({ ...s, entete: { ...s.entete, menuLiens: patchLien(s.entete.menuLiens, i, { label: ev.target.value }) } }))
                  }
                  style={{ width: `${Math.max(lien.label.length, 3)}ch` }}
                  className="bg-transparent text-[10px] font-medium text-[var(--dashboard-text)] outline-none"
                />
                {lien.compteur !== undefined && <span className="text-[9px] text-[var(--dashboard-text)]/40">· {lien.compteur}</span>}
                <button
                  type="button"
                  aria-label={t("Retirer ce lien", "Remove this link")}
                  onClick={() => setState((s) => ({ ...s, entete: { ...s.entete, menuLiens: s.entete.menuLiens.filter((_, j) => j !== i) } }))}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none text-[var(--dashboard-text)]/30 hover:bg-[#c8262d]/10 hover:text-[#c8262d]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, entete: { ...s.entete, menuLiens: [...s.entete.menuLiens, { label: t("Nouveau lien", "New link") }] } }))}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-pink/40 px-3.5 py-1.5 text-[10px] font-semibold text-brand-pink"
          >
            + {t("Ajouter un lien", "Add a link")}
          </button>
        </>
      );

    case "grande-image": {
      const h = state.grandeImage;
      return (
        <>
          <GroupeTitre label={t("Disposition", "Layout")} />
          <Ligne label={t("Image", "Image")}>
            <SegmentPills
              value={h.imagePosition}
              options={[
                { value: "droite", label: t("À droite", "On the right") },
                { value: "gauche", label: t("À gauche", "On the left") },
                { value: "centre", label: t("Centrée", "Centered") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, imagePosition: v as typeof s.grandeImage.imagePosition } }))}
            />
          </Ligne>
          <Ligne label={t("Hauteur", "Height")}>
            <SegmentPills
              value={h.hauteur}
              options={[
                { value: "s", label: t("Petite", "Small") },
                { value: "m", label: t("Moyenne", "Medium") },
                { value: "l", label: t("Grande", "Large") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, hauteur: v as typeof s.grandeImage.hauteur } }))}
            />
          </Ligne>
          <Ligne label={t("Texte", "Text")}>
            <SegmentPills
              value={h.texteAlign}
              options={[
                { value: "gauche", label: t("À gauche", "On the left") },
                { value: "centre", label: t("Centrée", "Centered") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, texteAlign: v as typeof s.grandeImage.texteAlign } }))}
            />
          </Ligne>
          <Ligne label={t("Boutons", "Buttons")}>
            <SegmentPills
              value={String(h.boutons)}
              options={[
                { value: "1", label: t("Un", "One") },
                { value: "2", label: t("Deux", "Two") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, boutons: Number(v) as 1 | 2 } }))}
            />
          </Ligne>

          <GroupeTitre label={t("Fond", "Background")} />
          <Ligne label={t("Type de fond", "Background type")}>
            <SegmentPills
              value={h.typeFond}
              options={[
                { value: "degrade", label: t("Dégradé", "Gradient") },
                { value: "uni", label: t("Uni", "Solid") },
                { value: "photo", label: t("Photo", "Photo") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, typeFond: v as typeof s.grandeImage.typeFond } }))}
            />
          </Ligne>
          <Ligne label={t("Courbes lumineuses", "Light curves")}>
            <Interrupteur checked={h.courbesLumineuses} onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, courbesLumineuses: v } }))} />
          </Ligne>
          <Ligne label={t("Image différente sur téléphone", "Different image on phone")}>
            <Interrupteur
              checked={h.imageDifferenteSurTelephone}
              onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, imageDifferenteSurTelephone: v } }))}
            />
          </Ligne>

          <GroupeTitre label={t("Détails", "Details")} />
          <Ligne label={t("Pastille ronde de la remise", "Round discount badge")}>
            <Interrupteur checked={h.badge} onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, badge: v } }))} />
          </Ligne>
          <Ligne label={t("Carte des avis", "Rating card")}>
            <Interrupteur checked={h.note} onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, note: v } }))} />
          </Ligne>
          <Champ
            label={t("Petit texte", "Small text")}
            value={h.petitTexte}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, petitTexte: v } }))}
          />
          <Champ label={t("Titre", "Title")} value={h.titre} onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, titre: v } }))} />
          <Champ
            label={t("Mot mis en valeur", "Highlighted word")}
            value={h.motValorise}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, motValorise: v } }))}
          />
          <Champ
            label={t("Bouton 1", "Button 1")}
            value={h.bouton1Texte}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, bouton1Texte: v } }))}
          />
          <Champ
            label={t("Bouton 2", "Button 2")}
            value={h.bouton2Texte}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, bouton2Texte: v } }))}
          />
        </>
      );
    }

    case "confiance": {
      const c = state.confiance;
      const majConfiance = (patch: Partial<EditeurState["confiance"]>) => setState((s) => ({ ...s, confiance: { ...s.confiance, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Affichage", "Display")} />
          <Segmente
            label={t("Nombre d'atouts", "Number of highlights")}
            value={String(c.nombre)}
            options={[
              { value: "3", label: t("Trois", "Three") },
              { value: "4", label: t("Quatre", "Four") },
            ]}
            onChange={(v) => majConfiance({ nombre: Number(v) as 3 | 4 })}
          />
          <Ligne label={t("Style", "Style")}>
            <SegmentPills
              value={c.style}
              options={[
                { value: "carte", label: t("Carte", "Card") },
                { value: "ligne", label: t("Ligne", "Row") },
              ]}
              onChange={(v) => majConfiance({ style: v as typeof c.style })}
            />
          </Ligne>
          <Ligne label={t("Chevauche la grande image", "Overlaps the hero image")}>
            <Interrupteur checked={c.chevaucheGrandeImage} onChange={(v) => majConfiance({ chevaucheGrandeImage: v })} />
          </Ligne>
          <Ligne label={t("Icônes", "Icons")}>
            <SegmentPills
              value={c.icones}
              options={[
                { value: "trait", label: t("Trait", "Outline") },
                { value: "pleines", label: t("Pleines", "Filled") },
              ]}
              onChange={(v) => majConfiance({ icones: v as typeof c.icones })}
            />
          </Ligne>

          <GroupeTitre label={t("Atouts", "Highlights")} />
          {c.atouts.map((atout, i) => (
            <div key={i} className="rounded-xl border border-[var(--dashboard-text)]/10 p-2.5">
              <Champ
                label={t(`Atout ${i + 1}`, `Highlight ${i + 1}`)}
                value={atout}
                onChange={(v) =>
                  majConfiance({ atouts: c.atouts.map((a, j) => (j === i ? v : a)) as EditeurState["confiance"]["atouts"] })
                }
              />
            </div>
          ))}

          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionConfianceActuelle(state.sections)}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-categories", label: t("Après les catégories", "After the categories") },
              { value: "apres-produits", label: t("Après les produits", "After the products") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerConfiance(s.sections, v as PositionConfiance) }))}
          />
        </>
      );
    }

    case "categories": {
      const c = state.categories;
      const majCategories = (patch: Partial<EditeurState["categories"]>) => setState((s) => ({ ...s, categories: { ...s.categories, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Colonnes", "Columns")} />
          <Ligne label={t("Sur ordinateur", "On computer")}>
            <SegmentPills
              value={String(c.colonnesOrdinateur)}
              options={[3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majCategories({ colonnesOrdinateur: Number(v) as EditeurState["categories"]["colonnesOrdinateur"] })}
            />
          </Ligne>
          <Ligne label={t("Sur téléphone", "On phone")}>
            <SegmentPills
              value={c.colonnesTelephone}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "defilement", label: t("Défilement", "Scrolling") },
              ]}
              onChange={(v) => majCategories({ colonnesTelephone: v as EditeurState["categories"]["colonnesTelephone"] })}
            />
          </Ligne>

          <GroupeTitre label={t("Cartes", "Cards")} />
          <Ligne label={t("Forme des images", "Image shape")}>
            <SegmentPills
              value={c.formeImages}
              options={[
                { value: "carte", label: t("Carte", "Card") },
                { value: "rond", label: t("Rond", "Round") },
              ]}
              onChange={(v) => majCategories({ formeImages: v as EditeurState["categories"]["formeImages"] })}
            />
          </Ligne>
          <Ligne label={t("Nombre de produits", "Product count")}>
            <Interrupteur checked={c.nombreProduits} onChange={(v) => majCategories({ nombreProduits: v })} />
          </Ligne>
          <Ligne label={t('Lien « Tout voir »', 'Button "See all"')}>
            <Interrupteur checked={c.lienToutVoir} onChange={(v) => majCategories({ lienToutVoir: v })} />
          </Ligne>

          <GroupeTitre label={t("Catégories", "Categories")} />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES_APERCU.map((cat) => (
              <Tag key={cat.label} tone="pink">
                {t(cat.label, cat.labelEn)}
              </Tag>
            ))}
          </div>
          <Champ label={t("Titre", "Title")} value={c.titre} onChange={(v) => majCategories({ titre: v })} />
          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={c.position}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-produits", label: t("Après les produits", "After the products") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => majCategories({ position: v as EditeurState["categories"]["position"] })}
          />
        </>
      );
    }

    case "promo": {
      const p = state.promo;
      const majPromo = (patch: Partial<EditeurState["promo"]>) => setState((s) => ({ ...s, promo: { ...s.promo, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Affichage", "Display")} />
          <Ligne label={t("Image", "Image")}>
            <SegmentPills
              value={p.cote}
              options={[
                { value: "gauche", label: t("À gauche", "On the left") },
                { value: "droite", label: t("À droite", "On the right") },
              ]}
              onChange={(v) => majPromo({ cote: v as typeof p.cote })}
            />
          </Ligne>
          <Ligne label={t("Fond", "Background")}>
            <SegmentPills
              value={p.fond}
              options={[
                { value: "degrade", label: t("Dégradé", "Gradient") },
                { value: "nuit", label: t("Nuit", "Night") },
              ]}
              onChange={(v) => majPromo({ fond: v as typeof p.fond })}
            />
          </Ligne>
          <Ligne label={t("Compte à rebours", "Countdown")}>
            <Interrupteur checked={p.compteur} onChange={(v) => majPromo({ compteur: v })} />
          </Ligne>

          <GroupeTitre label={t("Contenu", "Content")} />
          <Champ label={t("Petit texte", "Small text")} value={p.petitTexte} onChange={(v) => majPromo({ petitTexte: v })} />
          <Champ label={t("Titre", "Title")} value={p.titre} onChange={(v) => majPromo({ titre: v })} />
          <Champ label={t("Fin de l'offre", "Offer ends")} value={p.finOffre} onChange={(v) => majPromo({ finOffre: v })} />
          <Champ label={t("Bouton", "Button")} value={p.boutonTexte} onChange={(v) => majPromo({ boutonTexte: v })} />
          <Selecteur
            label={t("Lien du bouton", "Button link")}
            value={p.lienBouton}
            options={[
              { value: "rayon-offres", label: t("Rayon Offres", "Offers category") },
              { value: "accueil", label: t("Page d'accueil", "Home page") },
              { value: "tous-les-produits", label: t("Tous les produits", "All products") },
              { value: "personnalise", label: t("Lien personnalisé", "Custom link") },
            ]}
            onChange={(v) => majPromo({ lienBouton: v as typeof p.lienBouton })}
          />

          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionPromoActuelle(state.sections)}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-categories", label: t("Après les catégories", "After the categories") },
              { value: "apres-produits", label: t("Après les produits", "After the products") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerPromo(s.sections, v as PositionPromo) }))}
          />
        </>
      );
    }

    case "grille": {
      const g = state.grille;
      const majGrille = (patch: Partial<EditeurState["grille"]>) => setState((s) => ({ ...s, grille: { ...s.grille, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Produits", "Products")} />
          <Segmente
            label={t("Montrer", "Show")}
            value={g.montrer}
            options={[
              { value: "meilleures-ventes", label: t("Meilleures ventes", "Best sellers") },
              { value: "nouveautes", label: t("Nouveautés", "New arrivals") },
              { value: "choisis", label: t("Choisis", "Handpicked") },
            ]}
            onChange={(v) => majGrille({ montrer: v as EditeurState["grille"]["montrer"] })}
          />
          <Ligne label={t("Nombre", "Count")}>
            <SegmentPills
              value={String(g.nombre)}
              options={[4, 8].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majGrille({ nombre: Number(v) as EditeurState["grille"]["nombre"] })}
            />
          </Ligne>

          <GroupeTitre label={t("Colonnes", "Columns")} />
          <Ligne label={t("Sur ordinateur", "On computer")}>
            <SegmentPills
              value={String(g.colonnesOrdinateur)}
              options={[2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majGrille({ colonnesOrdinateur: Number(v) as EditeurState["grille"]["colonnesOrdinateur"] })}
            />
          </Ligne>
          <Ligne label={t("Sur téléphone", "On phone")}>
            <SegmentPills
              value={String(g.colonnesTelephone)}
              options={[1, 2].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majGrille({ colonnesTelephone: Number(v) as EditeurState["grille"]["colonnesTelephone"] })}
            />
          </Ligne>
          <Ligne label={t("Défilement sur téléphone", "Scroll on phone")}>
            <Interrupteur checked={g.defilementTelephone} onChange={(v) => majGrille({ defilementTelephone: v })} />
          </Ligne>

          <GroupeTitre label={t("Cartes", "Cards")} />
          <Ligne label={t("Note en étoiles", "Star rating")}>
            <Interrupteur checked={g.noteEtoiles} onChange={(v) => majGrille({ noteEtoiles: v })} />
          </Ligne>
          <Segmente
            label={t("Prix affiché", "Price shown")}
            value={g.prixAffiche}
            options={[
              { value: "en-ligne", label: t("Prix en ligne", "Online price") },
              { value: "normal", label: t("Prix normal", "Regular price") },
            ]}
            onChange={(v) => majGrille({ prixAffiche: v as EditeurState["grille"]["prixAffiche"] })}
          />
          <Segmente
            label={t("Bouton", "Button")}
            value={g.bouton}
            options={[
              { value: "texte", label: t("Texte", "Text") },
              { value: "icone", label: t("Icône", "Icon") },
              { value: "aucun", label: t("Aucun", "None") },
            ]}
            onChange={(v) => majGrille({ bouton: v as EditeurState["grille"]["bouton"] })}
          />
          <Ligne label={t("Coeur favoris", "Favorite heart")}>
            <Interrupteur checked={g.coeurFavoris} onChange={(v) => majGrille({ coeurFavoris: v })} />
          </Ligne>
          <Ligne label={t("Badges", "Badges")}>
            <Interrupteur checked={g.badges} onChange={(v) => majGrille({ badges: v })} />
          </Ligne>

          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionGrilleActuelle(state.sections)}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-categories", label: t("Après les catégories", "After the categories") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerGrille(s.sections, v as PositionGrille) }))}
          />
        </>
      );
    }

    case "engagements": {
      const e = state.engagements;
      const majEngagements = (patch: Partial<EditeurState["engagements"]>) => setState((s) => ({ ...s, engagements: { ...s.engagements, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Affichage", "Display")} />
          <Segmente
            label={t("Nombre d'engagements", "Number of commitments")}
            value={String(e.nombre)}
            options={[
              { value: "3", label: t("Trois", "Three") },
              { value: "4", label: t("Quatre", "Four") },
            ]}
            onChange={(v) => majEngagements({ nombre: Number(v) as 3 | 4 })}
          />

          <GroupeTitre label={t("Engagements", "Commitments")} />
          {e.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-[var(--dashboard-text)]/10 p-2.5">
              <Champ
                label={t(`Engagement ${i + 1}`, `Commitment ${i + 1}`)}
                value={item}
                onChange={(v) => majEngagements({ items: e.items.map((it, j) => (j === i ? v : it)) as EditeurState["engagements"]["items"] })}
              />
            </div>
          ))}

          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionEngagementsActuelle(state.sections)}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-categories", label: t("Après les catégories", "After the categories") },
              { value: "apres-produits", label: t("Après les produits", "After the products") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerEngagements(s.sections, v as PositionEngagements) }))}
          />
        </>
      );
    }

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

    case "avis": {
      const a = state.avis;
      const majAvis = (patch: Partial<EditeurState["avis"]>) => setState((s) => ({ ...s, avis: { ...s.avis, ...patch } }));
      return (
        <>
          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionAvisActuelle(state.sections)}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-categories", label: t("Après les catégories", "After the categories") },
              { value: "apres-produits", label: t("Après les produits", "After the products") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerAvis(s.sections, v as PositionAvis) }))}
          />

          <GroupeTitre label={t("Disposition", "Layout")} />
          <Ligne label={t("Présentation", "Layout style")}>
            <SegmentPills
              value={a.disposition}
              options={[
                { value: "grille", label: t("Grille", "Grid") },
                { value: "liste", label: t("Liste", "List") },
                { value: "carrousel", label: t("Carrousel", "Carousel") },
              ]}
              onChange={(v) => majAvis({ disposition: v as typeof a.disposition })}
            />
          </Ligne>
          <Ligne label={t("Colonnes sur ordinateur", "Columns on computer")}>
            <SegmentPills
              value={String(a.colonnesOrdinateur)}
              options={[2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majAvis({ colonnesOrdinateur: Number(v) as EditeurState["avis"]["colonnesOrdinateur"] })}
            />
          </Ligne>
          <Ligne label={t("Colonnes sur téléphone", "Columns on phone")}>
            <SegmentPills
              value={String(a.colonnesTelephone)}
              options={[1, 2].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majAvis({ colonnesTelephone: Number(v) as EditeurState["avis"]["colonnesTelephone"] })}
            />
          </Ligne>
          <Ligne label={t("Nombre d'avis", "Number of reviews")}>
            <SegmentPills
              value={String(a.nombreAffiches)}
              options={[3, 6].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majAvis({ nombreAffiches: Number(v) as EditeurState["avis"]["nombreAffiches"] })}
            />
          </Ligne>
          <Segmente
            label={t("Ordre", "Order")}
            value={a.ordre}
            options={[
              { value: "recents", label: t("Récents", "Recent") },
              { value: "mieux-notes", label: t("Mieux notés", "Top rated") },
              { value: "photos", label: t("Photos", "With photos") },
            ]}
            onChange={(v) => majAvis({ ordre: v as typeof a.ordre })}
          />

          <GroupeTitre label={t("Éléments affichés", "Displayed elements")} />
          {([
            ["resumeDesNotes", t("Résumé des notes", "Rating summary")],
            ["photosClients", t("Photos des clients", "Customer photos")],
            ["reponsesBoutique", t("Réponses de la boutique", "Shop replies")],
            ["produitSousAvis", t("Produit sous l'avis", "Product under the review")],
            ["date", t("Date", "Date")],
            ["filtres", t("Filtres", "Filters")],
            ["compteurAchatsVerifies", t("Compteur d'achats vérifiés", "Verified purchase count")],
            ["etoilesSousNomProduit", t("Étoiles sous le nom du produit", "Stars under the product name")],
          ] as const).map(([key, label]) => (
            <Ligne key={key} label={label}>
              <Interrupteur checked={a[key]} onChange={(v) => majAvis({ [key]: v } as Partial<EditeurState["avis"]>)} />
            </Ligne>
          ))}
          <Ligne label={t('Onglet « Avis » sur le côté', '"Reviews" tab on the side')}>
            <Interrupteur
              checked={state.flottants.ongletAvisCote}
              onChange={(v) => setState((s) => ({ ...s, flottants: { ...s.flottants, ongletAvisCote: v } }))}
            />
          </Ligne>
          <Ligne label={t("Couleur des étoiles", "Star color")}>
            <SegmentPills
              value={state.style.etoilesCouleur}
              options={[
                { value: "or", label: t("Or", "Gold") },
                { value: "principale", label: t("Principale", "Brand") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, style: { ...s.style, etoilesCouleur: v as typeof s.style.etoilesCouleur } }))}
            />
          </Ligne>

          <GroupeTitre label={t("Gérer les avis", "Manage reviews")} />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-pink/40 px-3 py-1.5 text-[10px] font-semibold text-brand-pink"
            >
              + {t("Ajouter un avis", "Add a review")}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/70"
            >
              {t("Importer", "Import")}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/70"
            >
              {t("Répondre", "Reply")}
            </button>
          </div>
          <Ligne label={t("Demander un avis après la livraison", "Ask for a review after delivery")}>
            <Interrupteur checked={a.demanderAvisApresLivraison} onChange={(v) => majAvis({ demanderAvisApresLivraison: v })} />
          </Ligne>
          <Ligne label={t("Questions des clients sous le produit", "Customer questions under the product")}>
            <Interrupteur checked={a.questionsClientsSousProduit} onChange={(v) => majAvis({ questionsClientsSousProduit: v })} />
          </Ligne>
          <Ligne label={t('Badge « Achat vérifié »', '"Verified purchase" badge')}>
            <span className="rounded-full bg-[var(--dashboard-text)]/[0.06] px-2.5 py-1 text-[9.5px] font-semibold text-[var(--dashboard-text)]/55">
              {t("Automatique", "Automatic")}
            </span>
          </Ligne>
          <p className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Le badge « Achat vérifié » est posé automatiquement sur les avis liés à une commande livrée.",
              "The “Verified purchase” badge is added automatically to reviews tied to a delivered order."
            )}
          </p>
        </>
      );
    }

    case "faq": {
      const sectionState = state.sections.find((sec) => sec.id === "faq");
      const majSection = (patch: Partial<SectionState>) =>
        setState((s) => ({ ...s, sections: s.sections.map((sec) => (sec.id === "faq" ? { ...sec, ...patch } : sec)) }));
      return (
        <>
          {sectionState && (
            <Ligne label={t("Afficher la section", "Show this section")}>
              <Interrupteur checked={sectionState.visible} onChange={(v) => majSection({ visible: v })} />
            </Ligne>
          )}
          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionFaqActuelle(state.sections)}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-categories", label: t("Après les catégories", "After the categories") },
              { value: "apres-produits", label: t("Après les produits", "After the products") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerFaq(s.sections, v as PositionFaq) }))}
          />

          <GroupeTitre label={t("Affichage", "Display")} />
          <Ligne label={t("Colonnes", "Columns")}>
            <SegmentPills
              value={state.faq.colonnes}
              options={[
                { value: "une", label: t("Une", "One") },
                { value: "deux", label: t("Deux", "Two") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, colonnes: v as EditeurState["faq"]["colonnes"] } }))}
            />
          </Ligne>
          <Ligne label={t("Première question ouverte", "First question expanded")}>
            <Interrupteur checked={state.faq.premiereOuverte} onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, premiereOuverte: v } }))} />
          </Ligne>
          <Ligne label={t("Icône", "Icon")}>
            <SegmentPills
              value={state.faq.icone}
              options={[
                { value: "plus", label: t("Plus", "Plus") },
                { value: "fleche", label: t("Flèche", "Arrow") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, icone: v as EditeurState["faq"]["icone"] } }))}
            />
          </Ligne>
          <Ligne label={t("Recherche dans les questions", "Search within questions")}>
            <Interrupteur checked={state.faq.rechercheActivee} onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, rechercheActivee: v } }))} />
          </Ligne>
          <Ligne label={t('Bouton « Poser une question »', '"Ask a question" button')}>
            <Interrupteur
              checked={state.faq.boutonPoserQuestion}
              onChange={(v) => setState((s) => ({ ...s, faq: { ...s.faq, boutonPoserQuestion: v } }))}
            />
          </Ligne>

          <GroupeTitre label={t("Questions et réponses", "Questions and answers")} />
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
    }

    case "vendu-par":
      return (
        <p className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
          {t(
            "Reprend le nom, le téléphone, l'adresse email et la localisation renseignés dans « Ma boutique ». Ne se masque pas.",
            "Pulls the name, phone number, email and location set in “My shop”. Cannot be hidden."
          )}
        </p>
      );

    case "pied-de-page": {
      const p = state.piedDePage;
      const majPied = (patch: Partial<EditeurState["piedDePage"]>) => setState((s) => ({ ...s, piedDePage: { ...s.piedDePage, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Marque", "Brand")} />
          <Ligne label={t("Logo dans le pied de page", "Logo in the footer")}>
            <Interrupteur checked={p.logoAffiche} onChange={(v) => majPied({ logoAffiche: v })} />
          </Ligne>
          <Ligne label={t("Taille du logo", "Logo size")}>
            <SegmentPills
              value={p.tailleLogo}
              options={[
                { value: "petite", label: t("Petite", "Small") },
                { value: "moyenne", label: t("Moyenne", "Medium") },
                { value: "grande", label: t("Grande", "Large") },
              ]}
              onChange={(v) => majPied({ tailleLogo: v as typeof p.tailleLogo })}
            />
          </Ligne>
          <Ligne label={t("Présentation", "About")}>
            <Interrupteur checked={p.presentation} onChange={(v) => majPied({ presentation: v })} />
          </Ligne>
          <Ligne label={t("Réseaux sociaux", "Social links")}>
            <Interrupteur checked={p.reseaux} onChange={(v) => majPied({ reseaux: v })} />
          </Ligne>

          <GroupeTitre label={t("Colonnes", "Columns")} />
          <Ligne label={t("Colonnes de liens", "Link columns")}>
            <SegmentPills
              value={String(p.colonnesLiens)}
              options={[2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majPied({ colonnesLiens: Number(v) as EditeurState["piedDePage"]["colonnesLiens"] })}
            />
          </Ligne>
          <Ligne label={t("Moyens de paiement", "Payment methods")}>
            <Interrupteur checked={p.moyensPaiement} onChange={(v) => majPied({ moyensPaiement: v })} />
          </Ligne>
          <Ligne label={t("Colonnes repliables sur téléphone", "Collapsible columns on phone")}>
            <Interrupteur checked={p.colonnesRepliablesTelephone} onChange={(v) => majPied({ colonnesRepliablesTelephone: v })} />
          </Ligne>

          <GroupeTitre label={t("Allure", "Look")} />
          <Ligne label={t("Fond", "Background")}>
            <SegmentPills
              value={p.couleur}
              options={[
                { value: "nuit", label: t("Nuit", "Night") },
                { value: "clair", label: t("Clair", "Light") },
                { value: "degrade", label: t("Dégradé", "Gradient") },
              ]}
              onChange={(v) => majPied({ couleur: v as typeof p.couleur })}
            />
          </Ligne>
          <Ligne label={t("Alignement", "Alignment")}>
            <SegmentPills
              value={p.alignement}
              options={[
                { value: "gauche", label: t("Gauche", "Left") },
                { value: "centre", label: t("Centre", "Center") },
              ]}
              onChange={(v) => majPied({ alignement: v as typeof p.alignement })}
            />
          </Ligne>
          <Ligne label={t('Bouton « Retour en haut »', '"Back to top" button')}>
            <Interrupteur
              checked={state.flottants.boutonRetourHaut}
              onChange={(v) => setState((s) => ({ ...s, flottants: { ...s.flottants, boutonRetourHaut: v } }))}
            />
          </Ligne>
          <Ligne label={t("Compteur d'achats vérifiés", "Verified purchase count")}>
            <Interrupteur
              checked={state.avis.compteurAchatsVerifies}
              onChange={(v) => setState((s) => ({ ...s, avis: { ...s.avis, compteurAchatsVerifies: v } }))}
            />
          </Ligne>

          <GroupeTitre label={t("Textes", "Texts")} />
          <Champ label={t("Mention du bas", "Bottom note")} value={p.mentionBas} onChange={(v) => majPied({ mentionBas: v })} />
          <div className="flex flex-wrap gap-1.5">
            <Tag tone="pink">{t("Conditions de vente", "Terms of sale")}</Tag>
            <Tag tone="pink">{t("Confidentialité", "Privacy")}</Tag>
          </div>
        </>
      );
    }

    default:
      return null;
  }
}

function patchFaq(items: FaqItem[], index: number, patch: Partial<FaqItem>): FaqItem[] {
  return items.map((it, i) => (i === index ? { ...it, ...patch } : it));
}

function patchLien(liens: MenuLien[], index: number, patch: Partial<MenuLien>): MenuLien[] {
  return liens.map((l, i) => (i === index ? { ...l, ...patch } : l));
}

const champBoxClasses =
  "mt-1 w-full rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-2.5 py-2 text-[11px] font-medium text-[var(--dashboard-text)] outline-none transition focus:border-brand-pink/50";

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

function Selecteur({
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
      <p className="text-[9.5px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{label}</p>
      <div className="relative mt-1">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${champBoxClasses} mt-0 appearance-none pr-7`}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--dashboard-text)]/40" aria-hidden>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
            className={`truncate rounded-lg py-1 text-[10px] font-semibold transition ${
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

function SegmenteGrille({
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
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--dashboard-text)]/[0.05] p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold leading-tight transition ${
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

function SegmentPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--dashboard-text)]/10 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9.5px] font-semibold transition ${
            value === o.value ? "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-sm" : "text-[var(--dashboard-text)]/50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function GroupeTitre({ label }: { label: string }) {
  return (
    <p className="border-t border-[var(--dashboard-text)]/10 pt-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 first:border-t-0 first:pt-0">
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
