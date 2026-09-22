"use client";

import { useRef, useState } from "react";

import { Tag, texteAvecChiffres } from "../../dashboard-accueil/shared";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { CATEGORIES_DEMO } from "@/lib/boutique-demo";
import { SECTIONS_DEFAUT, appartientPage, deplacerSection, placerAvis, placerCategories, placerConfiance, placerEngagements, placerFaq, placerGrille, placerOngletsDetails, placerProduitsLies, placerPromo, placerVenduPar, positionAvisActuelle, positionCategoriesActuelle, positionConfianceActuelle, positionEngagementsActuelle, positionFaqActuelle, positionGrilleActuelle, positionOngletsDetailsActuelle, positionProduitsLiesActuelle, positionPromoActuelle, positionVenduParActuelle } from "./types";
import type { BandeauMessage, EditeurState, FaqItem, FormulaireState, GalerieState, MenuLien, OngletsDetailsState, PageId, PositionAvis, PositionCategories, PositionConfiance, PositionEngagements, PositionFaq, PositionGrille, PositionOngletsDetails, PositionProduitsLies, PositionPromo, PositionVenduPar, SectionId, SectionState } from "./types";

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
  onOuvrirSection,
}: {
  sectionId: SectionId;
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  page: PageId;
  onOuvrirSection?: (sectionId: SectionId) => void;
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
          {def.verrouillee && <Tag tone="neutral">{t("Toujours présent", "Always shown")}</Tag>}
        </div>
        {sectionState && sectionId !== "bandeau" && sectionId !== "entete" && sectionId !== "pied-de-page" && sectionId !== "galerie" && sectionId !== "infos" && sectionId !== "bouton-commande-fixe" && sectionId !== "formulaire" && sectionId !== "paiement" && (
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
        {sectionState && sectionId !== "bandeau" && sectionId !== "entete" && sectionId !== "pied-de-page" && sectionId !== "galerie" && sectionId !== "infos" && sectionId !== "bouton-commande-fixe" && sectionId !== "formulaire" && sectionId !== "paiement" && (
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
        <Corps sectionId={sectionId} state={state} setState={setState} t={t} onOuvrirSection={onOuvrirSection} />
      </div>
    </div>
  );
}

function Corps({
  sectionId,
  state,
  setState,
  t,
  onOuvrirSection,
}: {
  sectionId: SectionId;
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  t: (fr: string, en: string) => string;
  onOuvrirSection?: (sectionId: SectionId) => void;
}) {
  switch (sectionId) {
    case "bandeau": {
      const b = state.bandeau;
      const majMessage = (i: number, patch: Partial<BandeauMessage>) =>
        setState((s) => ({ ...s, bandeau: { ...s.bandeau, messages: s.bandeau.messages.map((m, j) => (j === i ? { ...m, ...patch } : m)) } }));
      return (
        <>
          <GroupeTitre label={t("Contenu", "Content")} />
          {b.messages.length > 1 && (
            <Segmente
              label={t("Message affiché", "Message shown")}
              value={String(b.messageActif)}
              options={b.messages.map((m, i) => ({ value: String(i), label: m.etiquette || t(`Message ${i + 1}`, `Message ${i + 1}`) }))}
              onChange={(v) => setState((s) => ({ ...s, bandeau: { ...s.bandeau, messageActif: Number(v) } }))}
            />
          )}
          <div className="space-y-2">
            {b.messages.map((msg, i) => (
              <div key={i} className="rounded-xl bg-[var(--dashboard-text)]/[0.05] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1 text-[9.5px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">
                    <span className="shrink-0">{t(`Message ${i + 1}`, `Message ${i + 1}`)}</span>
                    <span className="shrink-0">·</span>
                    <input
                      type="text"
                      value={msg.etiquette}
                      onChange={(e) => majMessage(i, { etiquette: e.target.value })}
                      title={t("Étiquette de l'onglet", "Tab label")}
                      className="min-w-0 flex-1 bg-transparent text-[9.5px] normal-case tracking-normal text-[var(--dashboard-text)]/60 outline-none"
                    />
                  </div>
                  {b.messages.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setState((s) => {
                          const messages = s.bandeau.messages.filter((_, j) => j !== i);
                          return { ...s, bandeau: { ...s.bandeau, messages, messageActif: Math.min(s.bandeau.messageActif, messages.length - 1) } };
                        })
                      }
                      className="shrink-0 text-[10px] font-semibold text-[var(--dashboard-text)]/40 hover:text-[#c8262d]"
                    >
                      {t("Supprimer", "Delete")}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={msg.texte}
                  onChange={(e) => majMessage(i, { texte: e.target.value })}
                  className="mt-0.5 w-full bg-transparent text-[12.5px] font-bold text-[var(--dashboard-text)] outline-none"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setState((s) => ({
                ...s,
                bandeau: {
                  ...s.bandeau,
                  messages: [
                    ...s.bandeau.messages,
                    { texte: t("Nouveau message", "New message"), etiquette: t(`Message ${s.bandeau.messages.length + 1}`, `Message ${s.bandeau.messages.length + 1}`) },
                  ],
                },
              }))
            }
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
          {h.typeFond === "photo" && (
            <ChampImage
              label={t("Photo de fond", "Background photo")}
              value={h.image}
              onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, image: v } }))}
            />
          )}
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
          <Champ
            label={t("Titre", "Title")}
            value={h.titre}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, titre: v } }))}
            multiline
            rows={3}
          />
          <Champ
            label={t("Mot mis en valeur", "Highlighted word")}
            value={h.motValorise}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, motValorise: v } }))}
          />
          <Champ
            label={t("Sous-titre", "Subtitle")}
            value={h.sousTitre}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, sousTitre: v } }))}
            multiline
            rows={2}
          />
          <ChampImage
            label={t("Photo produit", "Product photo")}
            value={h.imageProduit}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, imageProduit: v } }))}
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
            {CATEGORIES_DEMO.map((cat) => (
              <Tag key={cat.id} tone="pink">
                {t(cat.nom, cat.nomEn)}
              </Tag>
            ))}
          </div>
          <Champ label={t("Titre", "Title")} value={c.titre} onChange={(v) => majCategories({ titre: v })} />
          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionCategoriesActuelle(state.sections)}
            options={[
              { value: "apres-grande-image", label: t("Après la grande image", "After the hero image") },
              { value: "apres-produits", label: t("Après les produits", "After the products") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerCategories(s.sections, v as PositionCategories) }))}
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
          <ChampImage label={t("Photo produit", "Product photo")} value={p.image} onChange={(v) => majPromo({ image: v })} />
          <Champ label={t("Petit texte", "Small text")} value={p.petitTexte} onChange={(v) => majPromo({ petitTexte: v })} />
          <Champ label={t("Titre", "Title")} value={p.titre} onChange={(v) => majPromo({ titre: v })} />
          <Champ label={t("Sous-titre", "Subtitle")} value={p.sousTitre} onChange={(v) => majPromo({ sousTitre: v })} />
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
          {p.lienBouton === "personnalise" && (
            <Champ
              label={t("URL du lien", "Link URL")}
              value={p.lienPersonnalise}
              placeholder="https://…"
              onChange={(v) => majPromo({ lienPersonnalise: v })}
            />
          )}

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

    case "galerie": {
      const g = state.galerie;
      const majGalerie = (patch: Partial<GalerieState>) => setState((s) => ({ ...s, galerie: { ...s.galerie, ...patch } }));
      const vignettesApercu = [
        "M4 5.5h16v13H4zM10 9.5l5 2.5-5 2.5z",
        "M6 4h12v16H6z",
        "M4 4.5h12v12H4zM8 16.5h12v-12",
        "M12 2 4 7v10l8 5 8-5V7z",
        "M6 4h9l3 3v13H6z",
        "M4 8.5 12 4l8 4.5v8L12 21l-8-4.5z",
      ];
      return (
        <>
          <GroupeTitre icone="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" label={t("Ordre d'affichage", "Display order")} />
          <div className="flex flex-wrap gap-1.5">
            {vignettesApercu.map((icone, i) => (
              <div
                key={i}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                style={{ background: `color-mix(in srgb, var(--dashboard-text) ${6 + (i % 3) * 3}%, transparent)` }}
              >
                <MiniIcone chemin={icone} />
                <span className="absolute left-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-black/55 text-[6.5px] font-bold leading-none text-white">
                  {i + 1}
                </span>
                {i === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="ml-px h-2 w-2 text-[#141220]" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[var(--dashboard-text)]">{t("Vidéo et photos", "Video and photos")}</span>
            <a href="/dashboard/produits" className="text-[11px] font-semibold text-brand-pink">
              {t("Fiche produit", "Product page")}
            </a>
          </div>

          <GroupeTitre icone="M4 4.5h12v12H4zM8 16.5h12v-12" label={t("Vignettes", "Thumbnails")} />
          <Ligne label={t("Sur ordinateur", "On computer")}>
            <SegmentPills
              value={g.vignettesOrdinateur}
              options={[
                { value: "gauche", label: t("À gauche", "On the left") },
                { value: "dessous", label: t("Dessous", "Below") },
                { value: "aucune", label: t("Aucune", "None") },
              ]}
              onChange={(v) => majGalerie({ vignettesOrdinateur: v as GalerieState["vignettesOrdinateur"] })}
            />
          </Ligne>
          <Ligne label={t("Sur téléphone", "On phone")}>
            <SegmentPills
              value={g.vignettesTelephone}
              options={[
                { value: "dessous", label: t("Dessous", "Below") },
                { value: "aucune", label: t("Aucune", "None") },
              ]}
              onChange={(v) => majGalerie({ vignettesTelephone: v as GalerieState["vignettesTelephone"] })}
            />
          </Ligne>

          <GroupeTitre icone="M4 5.5h16v13H4zM10 9.5l5 2.5-5 2.5z" label={t("Cadre", "Frame")} />
          <Ligne label={t("Format", "Format")}>
            <SegmentPills
              value={g.format}
              options={[
                { value: "carre", label: t("Carré", "Square") },
                { value: "portrait", label: t("Portrait", "Portrait") },
              ]}
              onChange={(v) => majGalerie({ format: v as GalerieState["format"] })}
            />
          </Ligne>
          <Ligne label={t("Position", "Position")}>
            <SegmentPills
              value={g.position}
              options={[
                { value: "gauche", label: t("À gauche", "On the left") },
                { value: "droite", label: t("À droite", "On the right") },
              ]}
              onChange={(v) => majGalerie({ position: v as GalerieState["position"] })}
            />
          </Ligne>
          <Ligne label={t("Bouton zoom", "Zoom button")}>
            <Interrupteur checked={g.boutonZoom} onChange={(v) => majGalerie({ boutonZoom: v })} />
          </Ligne>
          <Ligne label={t("Compteur 1 / 6", "Counter 1 / 6")}>
            <Interrupteur checked={g.compteur} onChange={(v) => majGalerie({ compteur: v })} />
          </Ligne>
          <Ligne label={t("Points de position", "Position dots")}>
            <Interrupteur checked={g.pointsPosition} onChange={(v) => majGalerie({ pointsPosition: v })} />
          </Ligne>

          <GroupeTitre icone="M8 5v14l11-7z" label={t("Lecture", "Playback")} />
          <Ligne label={t("Vidéo en lecture automatique", "Video autoplay")} note={t("Sans le son au départ", "Muted at first")}>
            <Interrupteur checked={g.lectureAuto} onChange={(v) => majGalerie({ lectureAuto: v })} />
          </Ligne>
          <Ligne label={t("Répéter la vidéo", "Loop the video")}>
            <Interrupteur checked={g.repeter} onChange={(v) => majGalerie({ repeter: v })} />
          </Ligne>
          <Ligne label={t("Photos qui défilent après la vidéo", "Photos advance after the video")}>
            <Interrupteur checked={g.photosDefilentApresVideo} onChange={(v) => majGalerie({ photosDefilentApresVideo: v })} />
          </Ligne>
          <Ligne label={t("Durée par photo", "Duration per photo")}>
            <SegmentPills
              value={String(g.dureeParPhoto)}
              options={[2, 3, 5].map((n) => ({ value: String(n), label: `${n} s` }))}
              onChange={(v) => majGalerie({ dureeParPhoto: Number(v) as GalerieState["dureeParPhoto"] })}
            />
          </Ligne>
          <Ligne label={t("Passage", "Transition")}>
            <SegmentPills
              value={g.passage}
              options={[
                { value: "glisser", label: t("Glisser", "Slide") },
                { value: "fondu", label: t("Fondu", "Fade") },
              ]}
              onChange={(v) => majGalerie({ passage: v as GalerieState["passage"] })}
            />
          </Ligne>
        </>
      );
    }

    case "infos": {
      const majInfos = (patch: Partial<EditeurState["infos"]>) => setState((s) => ({ ...s, infos: { ...s.infos, ...patch } }));
      const majPaiement = (patch: Partial<EditeurState["paiement"]>) => setState((s) => ({ ...s, paiement: { ...s.paiement, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Blocs affichés", "Displayed blocks")} />
          <Ligne label={t("Badge « Nouveauté »", "“New” badge")}>
            <Interrupteur checked={state.infos.badgeNouveaute} onChange={(v) => majInfos({ badgeNouveaute: v })} />
          </Ligne>
          <Ligne label={t("Étoiles sous le nom", "Stars under the name")}>
            <Interrupteur checked={state.infos.etoilesSousNom} onChange={(v) => majInfos({ etoilesSousNom: v })} />
          </Ligne>
          <Ligne label={t("Description", "Description")}>
            <SegmentPills
              value={state.infos.description}
              options={[
                { value: "courte", label: t("Courte", "Short") },
                { value: "complete", label: t("Complète", "Full") },
              ]}
              onChange={(v) => majInfos({ description: v as EditeurState["infos"]["description"] })}
            />
          </Ligne>
          <Ligne label={t("Stock restant", "Remaining stock")}>
            <Interrupteur checked={state.infos.stockRestant} onChange={(v) => majInfos({ stockRestant: v })} />
          </Ligne>
          <Ligne label={t("Lien « Conseils d'utilisation »", "“How to use” link")}>
            <Interrupteur checked={state.infos.lienConseilsUtilisation} onChange={(v) => majInfos({ lienConseilsUtilisation: v })} />
          </Ligne>
          <Ligne label={t("Quantité", "Quantity")}>
            <Interrupteur checked={state.infos.quantite} onChange={(v) => majInfos({ quantite: v })} />
          </Ligne>
          <Ligne label={t("Rangée de confiance", "Trust row")} note={t("Livraison, paiement, retours", "Delivery, payment, returns")}>
            <Interrupteur checked={state.paiement.rangeeConfiance} onChange={(v) => majPaiement({ rangeeConfiance: v })} />
          </Ligne>
          <Ligne label={t("Ancien prix barré", "Old price struck through")}>
            <Interrupteur checked={state.infos.ancienPrixBarre} onChange={(v) => majInfos({ ancienPrixBarre: v })} />
          </Ligne>
          <Ligne label={t("Badge de remise", "Discount badge")}>
            <Interrupteur checked={state.infos.badgeRemise} onChange={(v) => majInfos({ badgeRemise: v })} />
          </Ligne>

          <GroupeTitre label={t("Variantes", "Variants")} />
          <Segmente
            label={t("Présentation", "Display")}
            value={state.infos.variantesPresentation}
            options={[
              { value: "cases", label: t("Cases", "Boxes") },
              { value: "ronds", label: t("Ronds", "Circles") },
              { value: "liste", label: t("Liste", "List") },
            ]}
            onChange={(v) => majInfos({ variantesPresentation: v as EditeurState["infos"]["variantesPresentation"] })}
          />

          <GroupeTitre label={t("Bouton de commande", "Order button")} />
          <Segmente
            label={t("Texte", "Text")}
            value={state.paiement.boutonTexte}
            options={[
              { value: "je-commande", label: t("Je commande", "I order") },
              { value: "commander", label: t("Commander", "Order") },
              { value: "acheter", label: t("Acheter", "Buy") },
            ]}
            onChange={(v) => majPaiement({ boutonTexte: v as EditeurState["paiement"]["boutonTexte"] })}
          />
          <Segmente
            label={t("Animation", "Animation")}
            value={state.mouvements.boutonCommandeAnimation}
            options={[
              { value: "aucun", label: t("Aucune", "None") },
              { value: "pulsation", label: t("Pulsation", "Pulse") },
              { value: "vibration", label: t("Vibration", "Vibration") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, mouvements: { ...s.mouvements, boutonCommandeAnimation: v as EditeurState["mouvements"]["boutonCommandeAnimation"] } }))}
          />
          <Ligne label={t("Total dans le bouton", "Total in the button")}>
            <Interrupteur checked={state.paiement.totalDansBouton} onChange={(v) => majPaiement({ totalDansBouton: v })} />
          </Ligne>
          <Segmente
            label={t("Bouton à côté", "Side button")}
            value={state.paiement.boutonSecondaire}
            options={[
              { value: "partager", label: t("Partager", "Share") },
              { value: "favori", label: t("Favoris", "Favorite") },
              { value: "aucun", label: t("Aucun", "None") },
            ]}
            onChange={(v) => majPaiement({ boutonSecondaire: v as EditeurState["paiement"]["boutonSecondaire"] })}
          />

          <GroupeTitre label={t("Stock restant", "Remaining stock")} />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium text-[var(--dashboard-text)]">{t("Afficher sous", "Show under")}</p>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={999}
                value={state.infos.stockAfficherSousUnites}
                onChange={(e) => majInfos({ stockAfficherSousUnites: Number(e.target.value) })}
                className="w-14 rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-2 py-1 text-right text-[11px] font-semibold text-[var(--dashboard-text)] outline-none focus:border-brand-pink/50 font-figures"
              />
              <span className="text-[10px] text-[var(--dashboard-text)]/40">{t("unités", "units")}</span>
            </div>
          </div>
        </>
      );
    }

    case "formulaire":
      return (
        <>
          <div>
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
              {t("Champs", "Fields")}
            </p>
            <div className="space-y-2">
              <ChampObligatoire label={t("Nom et prénom", "Full name")} />
              <ChampObligatoire label={t("Commune (liste)", "District (list)")} />
              <ChampObligatoire label={t("Adresse précise", "Precise address")} />
              <Ligne label={t("Bouton « Me localiser »", "“Locate me” button")}>
                <Interrupteur checked={state.formulaire.boutonLocaliser} onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, boutonLocaliser: v } }))} />
              </Ligne>
              <ChampObligatoire label={t("Téléphone et indicatif", "Phone and dialing code")} />
              <Ligne label={t("Mention spécifique", "Special note")}>
                <Interrupteur checked={state.formulaire.mentionSpecifique} onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, mentionSpecifique: v } }))} />
              </Ligne>
              {state.formulaire.mentionSpecifique && (
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { value: "texte", label: t("Texte", "Text") },
                      { value: "choix", label: t("Choix", "Choice") },
                      { value: "date", label: t("Date", "Date") },
                    ] as { value: FormulaireState["mentionType"]; label: string }[]
                  ).map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setState((s) => ({ ...s, formulaire: { ...s.formulaire, mentionType: o.value } }))}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                        state.formulaire.mentionType === o.value
                          ? "border-brand-pink/40 bg-brand-pink/10 text-brand-pink"
                          : "border-[var(--dashboard-text)]/10 text-[var(--dashboard-text)]/60"
                      }`}
                    >
                      + {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <GroupeTitre label={t("Allure des champs", "Field style")} />
          <Segmente
            label={t("Style", "Style")}
            value={state.formulaire.styleChamps}
            options={[
              { value: "cadre", label: t("Cadre", "Bordered") },
              { value: "plein", label: t("Plein", "Filled") },
              { value: "ligne", label: t("Ligne", "Underline") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, styleChamps: v as FormulaireState["styleChamps"] } }))}
          />
          <Segmente
            label={t("Libellés", "Labels")}
            value={state.formulaire.libellesPosition}
            options={[
              { value: "dans-le-champ", label: t("Dans le champ", "Inside the field") },
              { value: "au-dessus", label: t("Au-dessus", "Above") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, libellesPosition: v as FormulaireState["libellesPosition"] } }))}
          />
          <Ligne label={t("Icônes dans les champs", "Icons in the fields")}>
            <Interrupteur checked={state.formulaire.iconesDansChamps} onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, iconesDansChamps: v } }))} />
          </Ligne>

          <GroupeTitre label={t("Textes", "Texts")} />
          <Champ
            label={t("Libellé", "Label")}
            value={state.formulaire.libelleAdressePrecise}
            onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, libelleAdressePrecise: v } }))}
          />
          <Champ
            label={t("Texte d'exemple", "Example text")}
            value={state.formulaire.texteExempleAdressePrecise}
            onChange={(v) => setState((s) => ({ ...s, formulaire: { ...s.formulaire, texteExempleAdressePrecise: v } }))}
          />
        </>
      );

    case "paiement": {
      const majPaiement = (patch: Partial<EditeurState["paiement"]>) => setState((s) => ({ ...s, paiement: { ...s.paiement, ...patch } }));
      const majInfos = (patch: Partial<EditeurState["infos"]>) => setState((s) => ({ ...s, infos: { ...s.infos, ...patch } }));
      return (
        <>
          <GroupeTitre icone="M3 6.5h18v11H3zM3 10h18" label={t("Paiement en ligne", "Online payment")} />
          <Segmente
            label={t("Remise", "Discount")}
            value={String(state.paiement.remiseEnLignePct)}
            options={[0, 10, 20, 30].map((n) => ({ value: String(n), label: `${n} %` }))}
            onChange={(v) => majPaiement({ remiseEnLignePct: Number(v) })}
          />
          <Ligne label={t("Ancien prix barré", "Old price struck through")}>
            <Interrupteur checked={state.infos.ancienPrixBarre} onChange={(v) => majInfos({ ancienPrixBarre: v })} />
          </Ligne>
          <Ligne label={t("Badge de remise", "Discount badge")}>
            <Interrupteur checked={state.infos.badgeRemise} onChange={(v) => majInfos({ badgeRemise: v })} />
          </Ligne>
          <Champ
            label={t("Texte de l'option", "Option text")}
            value={state.paiement.texteRemiseOption}
            onChange={(v) => majPaiement({ texteRemiseOption: v })}
          />

          <GroupeTitre label={t("Mode proposé en premier", "Mode offered first")} />
          <Segmente
            label={t("Présélectionné", "Preselected")}
            value={state.paiement.modePreselectionne}
            options={[
              { value: "en-ligne", label: t("En ligne", "Online") },
              { value: "a-la-livraison", label: t("À la livraison", "On delivery") },
            ]}
            onChange={(v) => majPaiement({ modePreselectionne: v as EditeurState["paiement"]["modePreselectionne"] })}
          />

          <GroupeTitre label={t("Moyens de paiement en ligne", "Online payment methods")} />
          {[
            [t("Orange Money", "Orange Money")],
            [t("MTN MoMo", "MTN MoMo")],
            [t("Moov Money", "Moov Money")],
            [t("Wave", "Wave")],
          ].map(([label]) => (
            <Ligne key={label} label={label}>
              <Tag tone="neutral" className="gap-1">
                <CadenasIcon />
                {t("Toujours", "Always")}
              </Tag>
            </Ligne>
          ))}

          <GroupeTitre label={t("Livraison", "Delivery")} />
          <Ligne label={t("Standard", "Standard")}>
            <Tag tone="neutral" className="gap-1">
              <CadenasIcon />
              {texteAvecChiffres(t("4 h en moyenne", "4 h average"))}
            </Tag>
          </Ligne>
          <Ligne label={t("Proposer l'express", "Offer express")} note={t("Selon les Réglages de la boutique", "Depending on the shop's Settings")}>
            <Interrupteur checked={state.paiement.livraisonExpress} onChange={(v) => majPaiement({ livraisonExpress: v })} />
          </Ligne>
          <Segmente
            label={t("Présélectionnée", "Preselected")}
            value={state.paiement.livraisonPreselectionnee}
            options={[
              { value: "standard", label: t("Standard", "Standard") },
              { value: "express", label: t("Express", "Express") },
            ]}
            onChange={(v) => majPaiement({ livraisonPreselectionnee: v as EditeurState["paiement"]["livraisonPreselectionnee"] })}
          />
          <Champ
            label={t("Texte de l'express", "Express text")}
            value={state.paiement.texteExpress}
            onChange={(v) => majPaiement({ texteExpress: v })}
          />
        </>
      );
    }

    case "onglets-details":
      return <ReglagesOnglets state={state} setState={setState} t={t} />;

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
          {/* Gestion des avis (ajouter/importer/répondre) touche aux données
              (avis réels), pas au réglage d'affichage de cet écran — nécessite
              l'API avis (cf. mémoire [[dashboard-mock-data-pending-laravel-api]]).
              Désactivés avec infobulle plutôt que boutons muets sans handler :
              on ne feint pas une action qui n'existe pas encore. */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled
              title={t("Bientôt disponible — arrive avec l'API avis", "Coming soon — arrives with the reviews API")}
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-dashed border-brand-pink/40 px-3 py-1.5 text-[10px] font-semibold text-brand-pink opacity-50"
            >
              + {t("Ajouter un avis", "Add a review")}
            </button>
            <button
              type="button"
              disabled
              title={t("Bientôt disponible — arrive avec l'API avis", "Coming soon — arrives with the reviews API")}
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/70 opacity-50"
            >
              {t("Importer", "Import")}
            </button>
            <button
              type="button"
              disabled
              title={t("Bientôt disponible — arrive avec l'API avis", "Coming soon — arrives with the reviews API")}
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/70 opacity-50"
            >
              {t("Répondre", "Reply")}
            </button>
          </div>
          <Ligne label={t("Demander un avis après la livraison", "Ask for a review after delivery")}>
            <Interrupteur checked={a.demanderAvisApresLivraison} onChange={(v) => majAvis({ demanderAvisApresLivraison: v })} />
          </Ligne>
          {/* Pas de bloc "questions clients" côté site public pour l'instant
              (contrairement à la FAQ, cf. SectionFaq.tsx) — ce réglage
              n'aurait aucun effet visible tant que ce bloc n'existe pas.
              Désactivé plutôt que muet, même logique que "Gérer les avis"
              ci-dessus. */}
          <Ligne label={t("Questions des clients sous le produit", "Customer questions under the product")}>
            <span
              title={t("Bientôt disponible — arrive avec le bloc questions clients", "Coming soon — arrives with the customer questions block")}
              className="inline-block opacity-50"
            >
              <span className="pointer-events-none">
                <Interrupteur checked={a.questionsClientsSousProduit} onChange={(v) => majAvis({ questionsClientsSousProduit: v })} />
              </span>
            </span>
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

    case "produits-lies": {
      const pl = state.produitsLies;
      const majProduitsLies = (patch: Partial<EditeurState["produitsLies"]>) => setState((s) => ({ ...s, produitsLies: { ...s.produitsLies, ...patch } }));
      return (
        <>
          <GroupeTitre label={t("Produits", "Products")} />
          <Segmente
            label={t("Choisis selon", "Chosen by")}
            value={pl.choisirSelon}
            options={[
              { value: "meme-rayon", label: t("Même rayon", "Same category") },
              { value: "meilleures-ventes", label: t("Meilleures ventes", "Best sellers") },
            ]}
            onChange={(v) => majProduitsLies({ choisirSelon: v as EditeurState["produitsLies"]["choisirSelon"] })}
          />
          <Ligne label={t("Nombre", "Count")}>
            <SegmentPills
              value={String(pl.nombre)}
              options={[4, 8].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majProduitsLies({ nombre: Number(v) as EditeurState["produitsLies"]["nombre"] })}
            />
          </Ligne>

          <GroupeTitre label={t("Colonnes", "Columns")} />
          <Ligne label={t("Sur ordinateur", "On computer")}>
            <SegmentPills
              value={String(pl.colonnesOrdinateur)}
              options={[2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majProduitsLies({ colonnesOrdinateur: Number(v) as EditeurState["produitsLies"]["colonnesOrdinateur"] })}
            />
          </Ligne>
          <Ligne label={t("Sur téléphone", "On phone")}>
            <SegmentPills
              value={String(pl.colonnesTelephone)}
              options={[1, 2].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => majProduitsLies({ colonnesTelephone: Number(v) as EditeurState["produitsLies"]["colonnesTelephone"] })}
            />
          </Ligne>

          <GroupeTitre label={t("Cartes", "Cards")} />
          <Ligne label={t("Note en étoiles", "Star rating")}>
            <Interrupteur checked={pl.noteEtoiles} onChange={(v) => majProduitsLies({ noteEtoiles: v })} />
          </Ligne>
          <Ligne label={t("Coeur favoris", "Favorite heart")}>
            <Interrupteur checked={pl.coeurFavoris} onChange={(v) => majProduitsLies({ coeurFavoris: v })} />
          </Ligne>
          <Segmente
            label={t("Bouton", "Button")}
            value={pl.bouton}
            options={[
              { value: "texte", label: t("Texte", "Text") },
              { value: "icone", label: t("Icône", "Icon") },
              { value: "aucun", label: t("Aucun", "None") },
            ]}
            onChange={(v) => majProduitsLies({ bouton: v as EditeurState["produitsLies"]["bouton"] })}
          />

          <SegmenteGrille
            label={t("Position dans la page", "Position on the page")}
            value={positionProduitsLiesActuelle(state.sections)}
            options={[
              { value: "sous-produit", label: t("Sous le produit", "Below the product") },
              { value: "apres-commande", label: t("Après la commande", "After the order block") },
              { value: "apres-details", label: t("Après les détails", "After the details") },
              { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, sections: placerProduitsLies(s.sections, v as PositionProduitsLies) }))}
          />

          {!state.cartesProduit.zones.includes("vous-aimerez-aussi") && (
            <p className="rounded-xl border border-dashed border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
              {t(
                "Section masquée : active « Vous aimerez aussi » dans l'onglet Style → Cartes produit → Où cela s'applique.",
                "Section hidden: enable “You may also like” in the Style tab → Product cards → Where this applies."
              )}
            </p>
          )}
          <p className="rounded-xl border border-dashed border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Style des cartes (forme, densité, effets…) réglé dans Style → Cartes produit.",
              "Card style (shape, density, effects…) set in Style → Product cards."
            )}
          </p>
        </>
      );
    }

    case "vendu-par": {
      const positionVenduPar = positionVenduParActuelle(state.sections);
      const emplacementVenduPar: "bas-de-page" | "sous-le-bouton" = positionVenduPar === "sous-le-bouton" ? "sous-le-bouton" : "bas-de-page";
      return (
        <>
          <GroupeTitre icone="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8h.01M11 11h1v5h1" label={t("Informations", "Information")} />
          <div className="space-y-2">
            {[
              t("Nom de la boutique", "Shop name"),
              t("Téléphone", "Phone number"),
              t("Adresse email", "Email address"),
              t("Localisation", "Location"),
            ].map((label) => (
              <Ligne key={label} label={label}>
                <Tag tone="neutral" className="gap-1">
                  <CadenasIcon />
                  {t("Toujours", "Always")}
                </Tag>
              </Ligne>
            ))}
          </div>

          <GroupeTitre icone="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12zM12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" label={t("Place", "Placement")} />
          <Segmente
            label={t("Emplacement", "Location")}
            value={emplacementVenduPar}
            options={[
              { value: "bas-de-page", label: t("Bas de page", "Bottom of page") },
              { value: "sous-le-bouton", label: t("Sous le bouton", "Under the button") },
            ]}
            onChange={(v) =>
              setState((s) => ({
                ...s,
                sections: placerVenduPar(
                  s.sections,
                  v === "sous-le-bouton" ? "sous-le-bouton" : positionVenduPar === "sous-le-bouton" ? "avant-pied-de-page" : positionVenduPar
                ),
              }))
            }
          />
          {emplacementVenduPar === "bas-de-page" && (
            <SegmenteGrille
              label={t("Position dans la page", "Position on the page")}
              value={positionVenduPar}
              options={[
                { value: "sous-produit", label: t("Sous le produit", "Below the product") },
                { value: "apres-commande", label: t("Après la commande", "After the order block") },
                { value: "apres-details", label: t("Après les détails", "After the details") },
                { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
              ]}
              onChange={(v) => setState((s) => ({ ...s, sections: placerVenduPar(s.sections, v as PositionVenduPar) }))}
            />
          )}

          <p className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Reprend le nom, le téléphone, l'adresse email et la localisation renseignés dans « Ma boutique ». Ne se masque pas.",
              "Pulls the name, phone number, email and location set in “My shop”. Cannot be hidden."
            )}
          </p>
        </>
      );
    }

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

    case "bouton-commande-fixe":
      return (
        <>
          <p className="rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[10.5px] leading-relaxed text-[var(--dashboard-text)]/55">
            {t(
              "Reste collé en bas de l'écran pendant que le client fait défiler la page de commande, sur téléphone seulement.",
              "Stays pinned to the bottom of the screen while the customer scrolls the order page, on phone only."
            )}
          </p>
          <Ligne label={t("Afficher sur téléphone", "Show on phone")}>
            <Interrupteur
              checked={state.flottants.boutonCommandeTelephone}
              onChange={(v) => setState((s) => ({ ...s, flottants: { ...s.flottants, boutonCommandeTelephone: v } }))}
            />
          </Ligne>
          <Ligne label={t("Total dans le bouton", "Total in the button")}>
            <Interrupteur
              checked={state.paiement.totalDansBouton}
              onChange={(v) => setState((s) => ({ ...s, paiement: { ...s.paiement, totalDansBouton: v } }))}
            />
          </Ligne>

          <GroupeTitre
            icone="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
            label={t("À voir sur la page de commande", "See it on the order page")}
          />
          <button
            type="button"
            onClick={() => onOuvrirSection?.("galerie")}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-3 py-2.5 text-[11px] font-semibold text-brand-pink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("Ouvrir cette page", "Open this page")}
          </button>
        </>
      );

    // Sections de bibliothèque (`libre: true` dans SECTIONS_DEFAUT, ajoutées
    // depuis AjouterSectionModal.tsx) : un seul bloc de contenu générique
    // (titre/texte/image/bouton) plutôt qu'un panneau par type — remplace
    // l'ancien "Contenu à personnaliser depuis le panneau de droite" qui ne
    // menait nulle part, cf. rendu par défaut dans BoutiquePreview.tsx.
    default: {
      const sec = state.sections.find((s) => s.id === sectionId);
      if (!sec) return null;
      const majContenu = (patch: Partial<SectionState>) =>
        setState((s) => ({ ...s, sections: s.sections.map((x) => (x.id === sectionId ? { ...x, ...patch } : x)) }));
      const boutonRempli = (sec.contenuBoutonTexte ?? "").trim().length > 0;
      return (
        <>
          <GroupeTitre label={t("Contenu", "Content")} />
          <Champ label={t("Titre", "Title")} value={sec.contenuTitre ?? ""} onChange={(v) => majContenu({ contenuTitre: v })} />
          <Champ label={t("Texte", "Text")} value={sec.contenuTexte ?? ""} onChange={(v) => majContenu({ contenuTexte: v })} multiline rows={4} />
          <ChampImage label={t("Image", "Image")} value={sec.contenuImage ?? null} onChange={(v) => majContenu({ contenuImage: v })} />
          <Champ
            label={t("Texte du bouton (facultatif)", "Button text (optional)")}
            value={sec.contenuBoutonTexte ?? ""}
            onChange={(v) => majContenu({ contenuBoutonTexte: v })}
          />
          {boutonRempli && (
            <Champ label={t("Lien du bouton", "Button link")} value={sec.contenuBoutonLien ?? ""} onChange={(v) => majContenu({ contenuBoutonLien: v })} />
          )}
        </>
      );
    }
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
  rows = 2,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{label}</p>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${champBoxClasses} resize-none leading-relaxed`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={champBoxClasses} />
      )}
    </div>
  );
}

/** Import d'image locale (data URL, FileReader) — pas d'upload serveur tant
 *  qu'il n'y a pas d'API (cf. [[dashboard-mock-data-pending-laravel-api]]),
 *  mais un vrai fichier choisi par l'utilisateur plutôt qu'un mock figé. */
function ChampImage({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  const { t } = useDashboardLangue();
  const inputRef = useRef<HTMLInputElement>(null);

  const choisir = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const lecteur = new FileReader();
    lecteur.onload = () => onChange(lecteur.result as string);
    lecteur.readAsDataURL(fichier);
    e.target.value = "";
  };

  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{label}</p>
      <div className="mt-1 flex items-center gap-2.5">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), pas une image du domaine
          <img src={value} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--dashboard-text)]/20 text-[var(--dashboard-text)]/35">
            <ImageIcon />
          </span>
        )}
        <div className="flex min-w-0 flex-col items-start gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[10px] font-semibold text-brand-pink transition hover:brightness-90"
          >
            {value ? t("Remplacer", "Replace") : t("Importer une image", "Upload an image")}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[10px] font-semibold text-[var(--dashboard-text)]/40 transition hover:text-[#c8262d]"
            >
              {t("Retirer", "Remove")}
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={choisir} className="hidden" />
    </div>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M4 5h16v14H4Zm0 10 5-5 3 3 4-4 4 4M9 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

function ChampObligatoire({ label }: { label: string }) {
  const { t } = useDashboardLangue();
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] font-medium text-[var(--dashboard-text)]">{label}</p>
      <Tag tone="neutral" className="gap-1">
        <CadenasIcon />
        {t("Obligatoire", "Required")}
      </Tag>
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

function GroupeTitre({ label, icone }: { label: string; icone?: string }) {
  return (
    <p className="flex items-center gap-1.5 border-t border-[var(--dashboard-text)]/10 pt-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 first:border-t-0 first:pt-0">
      {icone && (
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
          <path d={icone} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </p>
  );
}

function MiniIcone({ chemin }: { chemin: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d={chemin} stroke="var(--dashboard-text)" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

/* ── Sous-composant dédié pour le case "onglets-details" ──────────────────────
   Séparé de Corps pour pouvoir utiliser useState (hooks interdits dans un case
   de switch). Gère la sélection de l'onglet actif et l'édition de son contenu.
*/
function ReglagesOnglets({
  state,
  setState,
  t,
}: {
  state: EditeurState;
  setState: (updater: (s: EditeurState) => EditeurState) => void;
  t: (fr: string, en: string) => string;
}) {
  const o = state.ongletsDetails;
  const majOnglets = (patch: Partial<EditeurState["ongletsDetails"]>) =>
    setState((s) => ({ ...s, ongletsDetails: { ...s.ongletsDetails, ...patch } }));

  const [ongletActif, setOngletActif] = useState(0);
  const actif = Math.min(ongletActif, o.onglets.length - 1);

  const majContenu = (valeur: string) => {
    const contenus = [...(o.contenus ?? o.onglets.map(() => ""))];
    contenus[actif] = valeur;
    majOnglets({ contenus });
  };

  const majNomOnglet = (i: number, valeur: string) => {
    majOnglets({ onglets: o.onglets.map((v, j) => (j === i ? valeur : v)) });
  };

  const retirerOnglet = (i: number) => {
    const nouveauxOnglets = o.onglets.filter((_, j) => j !== i);
    const nouveauxContenus = (o.contenus ?? []).filter((_, j) => j !== i);
    majOnglets({ onglets: nouveauxOnglets, contenus: nouveauxContenus });
    if (ongletActif >= nouveauxOnglets.length) setOngletActif(Math.max(0, nouveauxOnglets.length - 1));
  };

  const ajouterOnglet = () => {
    const label = t("Nouvel onglet", "New tab");
    majOnglets({
      onglets: [...o.onglets, label],
      contenus: [...(o.contenus ?? []), ""],
    });
    setOngletActif(o.onglets.length);
  };

  return (
    <>
      <GroupeTitre label={t("Affichage", "Display")} />
      <Ligne label={t("Présentation", "Layout style")}>
        <SegmentPills
          value={o.presentation}
          options={[
            { value: "onglets", label: t("Onglets", "Tabs") },
            { value: "accordeon", label: t("Accordéon", "Accordion") },
          ]}
          onChange={(v) => majOnglets({ presentation: v as OngletsDetailsState["presentation"] })}
        />
      </Ligne>
      <Ligne label={t("Grande image de détail", "Large detail image")}>
        <Interrupteur checked={o.grandeImage} onChange={(v) => majOnglets({ grandeImage: v })} />
      </Ligne>
      <Ligne label={t("Liste d'atouts avec icônes", "Highlight list with icons")}>
        <Interrupteur checked={o.atoutsAvecIcones} onChange={(v) => majOnglets({ atoutsAvecIcones: v })} />
      </Ligne>

      <GroupeTitre label={t("Onglets", "Tabs")} />

      {/* Sélecteur d'onglet actif */}
      <div className="flex flex-wrap gap-1.5">
        {o.onglets.map((onglet, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOngletActif(i)}
            className={`flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1 text-[10px] font-medium transition ${
              i === actif
                ? "bg-brand-pink/15 text-brand-pink ring-1 ring-brand-pink/30"
                : "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]"
            }`}
          >
            <input
              value={onglet}
              onClick={(e) => e.stopPropagation()}
              onChange={(ev) => majNomOnglet(i, ev.target.value)}
              style={{ width: `${Math.max(onglet.length, 3)}ch` }}
              className="bg-transparent outline-none"
            />
            <span
              role="button"
              aria-label={t("Retirer cet onglet", "Remove this tab")}
              onClick={(e) => { e.stopPropagation(); retirerOnglet(i); }}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none text-[var(--dashboard-text)]/30 hover:bg-[#c8262d]/10 hover:text-[#c8262d]"
            >
              ×
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={ajouterOnglet}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-pink/40 px-3.5 py-1.5 text-[10px] font-semibold text-brand-pink"
      >
        + {t("Ajouter un onglet", "Add a tab")}
      </button>

      {/* Éditeur de contenu de l'onglet sélectionné */}
      {o.onglets.length > 0 && (
        <div className="rounded-xl border border-[var(--dashboard-text)]/10 p-2.5">
          <p className="mb-1.5 text-[10px] font-semibold text-[var(--dashboard-text)]/50">
            {t(`Contenu · ${o.onglets[actif]}`, `Content · ${o.onglets[actif]}`)}
          </p>
          <textarea
            value={(o.contenus ?? [])[actif] ?? ""}
            onChange={(e) => majContenu(e.target.value)}
            rows={4}
            placeholder={t("Texte affiché dans cet onglet…", "Text shown in this tab…")}
            className="w-full resize-none rounded-lg border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-text)]/[0.03] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-text)]/30 focus:border-brand-pink/40"
          />
        </div>
      )}

      <SegmenteGrille
        label={t("Position dans la page", "Position on the page")}
        value={positionOngletsDetailsActuelle(state.sections)}
        options={[
          { value: "sous-produit", label: t("Sous le produit", "Below the product") },
          { value: "apres-commande", label: t("Après la commande", "After the order block") },
          { value: "avant-pied-de-page", label: t("Avant le pied de page", "Before the footer") },
        ]}
        onChange={(v) => setState((s) => ({ ...s, sections: placerOngletsDetails(s.sections, v as PositionOngletsDetails) }))}
      />

      {o.atoutsAvecIcones && (
        <>
          <GroupeTitre label={t("Atouts", "Highlights")} />
          <Segmente
            label={t("Nombre d'atouts", "Number of highlights")}
            value={String(o.nombreAtouts)}
            options={[
              { value: "3", label: t("Trois", "Three") },
              { value: "4", label: t("Quatre", "Four") },
            ]}
            onChange={(v) => majOnglets({ nombreAtouts: Number(v) as 3 | 4 })}
          />
          {o.atouts.map((atout, i) => (
            <div key={i} className="rounded-xl border border-[var(--dashboard-text)]/10 p-2.5">
              <Champ
                label={t(`Atout ${i + 1}`, `Highlight ${i + 1}`)}
                value={atout}
                onChange={(v) => majOnglets({ atouts: o.atouts.map((a, j) => (j === i ? v : a)) as EditeurState["ongletsDetails"]["atouts"] })}
              />
            </div>
          ))}
        </>
      )}
    </>
  );
}
