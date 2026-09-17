"use client";

import { Tag, texteAvecChiffres } from "../../dashboard-accueil/shared";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { SECTIONS_DEFAUT } from "./types";
import type { EditeurState, FaqItem, MenuLien, SectionId, SectionState } from "./types";

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
  const sectionState = state.sections.find((s) => s.id === sectionId);
  const majSection = (patch: Partial<SectionState>) =>
    setState((s) => ({ ...s, sections: s.sections.map((sec) => (sec.id === sectionId ? { ...sec, ...patch } : sec)) }));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-card-bg)] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--dashboard-text)]/10 pb-2.5">
        <p className="text-[12.5px] font-bold text-[var(--dashboard-text)]">{t(def.label, def.labelEn)}</p>
        {def.verrouillee && <Tag tone="neutral">{t("Toujours présente", "Always shown")}</Tag>}
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        <Corps sectionId={sectionId} state={state} setState={setState} t={t} />
        {!def.verrouillee && sectionState && (
          <>
            <GroupeTitre label={t("Pour cette section", "For this section")} />
            <Segmente
              label={t("Largeur", "Width")}
              value={sectionState.largeur}
              options={[
                { value: "page", label: t("Page", "Boxed") },
                { value: "pleine", label: t("Pleine", "Full width") },
              ]}
              onChange={(v) => majSection({ largeur: v as SectionState["largeur"] })}
            />
            <Segmente
              label={t("Marges", "Margins")}
              value={sectionState.marges}
              options={[
                { value: "petites", label: t("Petites", "Small") },
                { value: "moyennes", label: t("Moyennes", "Medium") },
                { value: "grandes", label: t("Grandes", "Large") },
              ]}
              onChange={(v) => majSection({ marges: v as SectionState["marges"] })}
            />
            <Segmente
              label={t("Couleurs", "Colors")}
              value={sectionState.couleurs}
              options={[
                { value: "claires", label: t("Claires", "Light") },
                { value: "douces", label: t("Douces", "Soft") },
                { value: "nuit", label: t("Nuit", "Night") },
              ]}
              onChange={(v) => majSection({ couleurs: v as SectionState["couleurs"] })}
            />
            <Ligne label={t("Visible sur téléphone", "Visible on phone")}>
              <Interrupteur checked={sectionState.visibleTelephone} onChange={(v) => majSection({ visibleTelephone: v })} />
            </Ligne>
            <Ligne label={t("Visible sur ordinateur", "Visible on computer")}>
              <Interrupteur checked={sectionState.visibleOrdinateur} onChange={(v) => majSection({ visibleOrdinateur: v })} />
            </Ligne>
            <Ligne label={t("Afficher la section", "Show this section")}>
              <Interrupteur checked={sectionState.visible} onChange={(v) => majSection({ visible: v })} />
            </Ligne>
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
          <Segmente
            label={t("Sur ordinateur", "On computer")}
            value={state.entete.positionLogo}
            options={[
              { value: "gauche", label: t("Logo à gauche", "Logo on the left") },
              { value: "centre", label: t("Logo au centre", "Logo centered") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, positionLogo: v as typeof s.entete.positionLogo } }))}
          />
          <Segmente
            label={t("Logo sur téléphone", "Logo on phone")}
            value={state.entete.positionLogoMobile}
            options={[
              { value: "centre", label: t("Au centre", "Centered") },
              { value: "gauche", label: t("À gauche", "Left") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, positionLogoMobile: v as typeof s.entete.positionLogoMobile } }))}
          />
          <Segmente
            label={t("Taille du logo", "Logo size")}
            value={state.entete.tailleLogo}
            options={[
              { value: "s", label: t("Petite", "Small") },
              { value: "m", label: t("Moyenne", "Medium") },
              { value: "l", label: t("Grande", "Large") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, tailleLogo: v as typeof s.entete.tailleLogo } }))}
          />
          <Ligne label={t("Nom à côté du logo", "Name next to the logo")}>
            <Interrupteur checked={state.entete.nomAvecLogo} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, nomAvecLogo: v } }))} />
          </Ligne>
          <Ligne label={t("Transparent sur la grande image", "Transparent over the hero image")} note={t("Accueil seulement", "Home only")}>
            <Interrupteur checked={state.entete.transparentSurHero} onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, transparentSurHero: v } }))} />
          </Ligne>

          <GroupeTitre label={t("Éléments", "Elements")} />
          <Segmente
            label={t("Recherche", "Search")}
            value={state.entete.rechercheStyle}
            options={[
              { value: "barre", label: t("Barre", "Bar") },
              { value: "icone", label: t("Icône", "Icon") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, rechercheStyle: v as typeof s.entete.rechercheStyle } }))}
          />
          <Segmente
            label={t("Icône du panier", "Cart icon")}
            value={state.entete.panierStyle}
            options={[
              { value: "sac", label: t("Sac", "Bag") },
              { value: "chariot", label: t("Chariot", "Cart") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, panierStyle: v as typeof s.entete.panierStyle } }))}
          />
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
          <Segmente
            label={t("Reste visible", "Stays visible")}
            value={state.entete.resteVisible}
            options={[
              { value: "non", label: t("Non", "No") },
              { value: "toujours", label: t("Toujours", "Always") },
              { value: "en-remontant", label: t("En remontant", "On scroll up") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, entete: { ...s.entete, resteVisible: v as typeof s.entete.resteVisible } }))}
          />

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
          <Segmente
            label={t("Image", "Image")}
            value={h.imagePosition}
            options={[
              { value: "droite", label: t("À droite", "On the right") },
              { value: "gauche", label: t("À gauche", "On the left") },
              { value: "centre", label: t("Centrée", "Centered") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, imagePosition: v as typeof s.grandeImage.imagePosition } }))}
          />
          <Segmente
            label={t("Hauteur", "Height")}
            value={h.hauteur}
            options={[
              { value: "s", label: t("Petite", "Small") },
              { value: "m", label: t("Moyenne", "Medium") },
              { value: "l", label: t("Grande", "Large") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, hauteur: v as typeof s.grandeImage.hauteur } }))}
          />
          <Segmente
            label={t("Texte", "Text")}
            value={h.texteAlign}
            options={[
              { value: "gauche", label: t("À gauche", "On the left") },
              { value: "centre", label: t("Centrée", "Centered") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, texteAlign: v as typeof s.grandeImage.texteAlign } }))}
          />
          <Segmente
            label={t("Boutons", "Buttons")}
            value={String(h.boutons)}
            options={[
              { value: "1", label: t("Un", "One") },
              { value: "2", label: t("Deux", "Two") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, boutons: Number(v) as 1 | 2 } }))}
          />

          <GroupeTitre label={t("Fond", "Background")} />
          <Segmente
            label={t("Type de fond", "Background type")}
            value={h.typeFond}
            options={[
              { value: "degrade", label: t("Dégradé", "Gradient") },
              { value: "uni", label: t("Uni", "Solid") },
              { value: "photo", label: t("Photo", "Photo") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, grandeImage: { ...s.grandeImage, typeFond: v as typeof s.grandeImage.typeFond } }))}
          />
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

    case "confiance":
      return (
        <Segmente
          label={t("Nombre d'atouts", "Number of highlights")}
          value={String(state.confiance.nombre)}
          options={[
            { value: "3", label: t("Trois", "Three") },
            { value: "4", label: t("Quatre", "Four") },
          ]}
          onChange={(v) => setState((s) => ({ ...s, confiance: { ...s.confiance, nombre: Number(v) as 3 | 4 } }))}
        />
      );

    case "categories":
      return (
        <div>
          <p className="mb-1 flex items-center justify-between text-[10.5px] font-medium text-[var(--dashboard-text)]">
            <span>{t("Colonnes", "Columns")}</span>
            <span className="text-[var(--dashboard-text)]/50 font-figures">{state.categories.colonnes}</span>
          </p>
          <input
            type="range"
            min={3}
            max={6}
            value={state.categories.colonnes}
            onChange={(e) => setState((s) => ({ ...s, categories: { ...s.categories, colonnes: Number(e.target.value) } }))}
            className="w-full accent-brand-pink"
          />
        </div>
      );

    case "promo":
      return (
        <>
          <Segmente
            label={t("Côté de l'illustration", "Illustration side")}
            value={state.promo.cote}
            options={[
              { value: "gauche", label: t("Gauche", "Left") },
              { value: "droite", label: t("Droite", "Right") },
            ]}
            onChange={(v) => setState((s) => ({ ...s, promo: { ...s.promo, cote: v as typeof s.promo.cote } }))}
          />
          <Ligne label={t("Compte à rebours", "Countdown")}>
            <Interrupteur checked={state.promo.compteur} onChange={(v) => setState((s) => ({ ...s, promo: { ...s.promo, compteur: v } }))} />
          </Ligne>
        </>
      );

    case "grille":
      return (
        <>
          <div>
            <p className="mb-1 flex items-center justify-between text-[10.5px] font-medium text-[var(--dashboard-text)]">
              <span>{t("Colonnes", "Columns")}</span>
              <span className="text-[var(--dashboard-text)]/50 font-figures">{state.grille.colonnes}</span>
            </p>
            <input
              type="range"
              min={3}
              max={5}
              value={state.grille.colonnes}
              onChange={(e) => setState((s) => ({ ...s, grille: { ...s.grille, colonnes: Number(e.target.value) } }))}
              className="w-full accent-brand-pink"
            />
          </div>
          <div>
            <p className="mb-1 flex items-center justify-between text-[10.5px] font-medium text-[var(--dashboard-text)]">
              <span>{t("Produits affichés", "Products shown")}</span>
              <span className="text-[var(--dashboard-text)]/50 font-figures">{state.grille.nombre}</span>
            </p>
            <input
              type="range"
              min={2}
              max={6}
              value={state.grille.nombre}
              onChange={(e) => setState((s) => ({ ...s, grille: { ...s.grille, nombre: Number(e.target.value) } }))}
              className="w-full accent-brand-pink"
            />
          </div>
        </>
      );

    case "engagements":
      return (
        <div>
          <p className="mb-1 flex items-center justify-between text-[10.5px] font-medium text-[var(--dashboard-text)]">
            <span>{t("Nombre d'engagements", "Number of commitments")}</span>
            <span className="text-[var(--dashboard-text)]/50 font-figures">{state.engagements.nombre}</span>
          </p>
          <input
            type="range"
            min={2}
            max={4}
            value={state.engagements.nombre}
            onChange={(e) => setState((s) => ({ ...s, engagements: { ...s.engagements, nombre: Number(e.target.value) } }))}
            className="w-full accent-brand-pink"
          />
        </div>
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

function patchLien(liens: MenuLien[], index: number, patch: Partial<MenuLien>): MenuLien[] {
  return liens.map((l, i) => (i === index ? { ...l, ...patch } : l));
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
