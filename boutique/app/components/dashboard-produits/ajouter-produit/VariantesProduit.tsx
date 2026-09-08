"use client";

import { useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { Tag } from "../../dashboard-accueil/shared";
import { libelleCombinaison } from "./combinaisons";
import type { Attribut, Combinaison } from "./types";

/*
  Bloc "Variantes" (Écran 08 + Écran 09 simplifié) : pose des attributs
  (Taille, Couleur, ou un type créé) et de leurs valeurs ; les
  combinaisons sont calculées par le parent (voir combinaisons.ts) et
  seulement affichées / éditées ici (quantité, activation).

  Volontairement plus simple que la maquette pour la couleur : un
  <input type="color"> natif remplace la roue chromatique dessinée à la
  main — même résultat (choisir une teinte exacte) pour un composant bien
  plus léger à maintenir.
*/

const TYPES_PREDEFINIS = [
  "Taille", "Pointure", "Contenance", "Matière", "Modèle", "Parfum", "Longueur", "Poids", "Puissance",
] as const;

// Teintes courantes (Écran 09 de la maquette) : un raccourci avant la roue,
// pas la liste des couleurs du produit — cliquer un pastille pré-remplit
// le sélecteur de la roue, la boutique nomme ensuite la couleur elle-même.
const PALETTE_COULEURS = [
  "#1A1A1F", "#6E6E78", "#E4E8F2", "#D9C3A5", "#8B4A2B", "#E8B4C8",
  "#E8207E", "#6B21D6", "#1E3A8A", "#3ED8A5", "#FFB020", "#FF5A62",
] as const;

const NOM_ATTRIBUT_MAX = 40;
const NOM_VALEUR_MAX = 40;

// Même parseur que TarificationProduit : jamais de NaN/négatif dans le state.
function parseMontant(brut: string): number | null {
  if (brut === "") return null;
  const n = Number(brut);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

// Identifiants générés côté client uniquement pour distinguer les lignes
// à l'écran (clés React, retrouver une combinaison) — jamais utilisés
// comme identifiant définitif : l'API attribuera les siens à la création.
function idAleatoire(prefixe: string) {
  return `${prefixe}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function VariantesProduit({
  attributs,
  onAttributsChange,
  combinaisons,
  onCombinaisonChange,
  onMettreEnAvant,
  prixAchatGlobal,
  prixVenteGlobal,
}: {
  attributs: Attribut[];
  onAttributsChange: (a: Attribut[]) => void;
  combinaisons: Combinaison[];
  onCombinaisonChange: (id: string, patch: Partial<Combinaison>) => void;
  /** Une seule à la fois : sert de base au calcul "Ce qui vous reste" (voir MargeCard.tsx). */
  onMettreEnAvant: (id: string) => void;
  /** Prix saisis dans le bloc Tarification — servent de source pour "Même prix partout". */
  prixAchatGlobal: number | null;
  prixVenteGlobal: number;
}) {
  const { t, langue } = useDashboardLangue();
  const F = (n: number) => `${n.toLocaleString(langue === "EN" ? "en-US" : "fr-FR")}`;
  const [nouvelleValeur, setNouvelleValeur] = useState<Record<string, string>>({});
  // Un attribut à la fois affiche son petit champ d'ajout (cercle "+"
  // cliqué) — pas besoin de state partagé, chaque attribut a le sien.
  const [ajoutOuvert, setAjoutOuvert] = useState<Record<string, boolean>>({});
  // Affordance visuelle uniquement pour l'instant : aucune API de photo par
  // combinaison n'existe encore (cf. [[dashboard-mock-data-pending-laravel-api]]) —
  // le bouton n'écrase rien, il annonce juste l'intention pour l'instant.
  const [photoParCouleur, setPhotoParCouleur] = useState(false);

  const appliquerMemePrixPartout = () => {
    combinaisons.forEach((c) => onCombinaisonChange(c.id, { prixAchat: prixAchatGlobal, prixVente: prixVenteGlobal }));
  };

  const ajouterAttribut = (nom: string, type: "texte" | "couleur") => {
    const propre = nom.trim().slice(0, NOM_ATTRIBUT_MAX);
    if (!propre || attributs.some((a) => a.nom.toLowerCase() === propre.toLowerCase())) return;
    onAttributsChange([...attributs, { id: idAleatoire("attr"), nom: propre, type, valeurs: [] }]);
  };

  const retirerAttribut = (id: string) => {
    onAttributsChange(attributs.filter((a) => a.id !== id));
  };

  const ajouterValeur = (attributId: string, brut: string) => {
    // Une virgule permet de saisir plusieurs valeurs d'un coup (cf. maquette : "S, M, L").
    const nouvelles = brut.split(",").map((v) => v.trim().slice(0, NOM_VALEUR_MAX)).filter(Boolean);
    if (!nouvelles.length) return;
    onAttributsChange(
      attributs.map((a) =>
        a.id === attributId
          ? {
              ...a,
              valeurs: [
                ...a.valeurs,
                ...nouvelles
                  .filter((label) => !a.valeurs.some((v) => v.label.toLowerCase() === label.toLowerCase()))
                  .map((label) => ({ id: idAleatoire("val"), label })),
              ],
            }
          : a
      )
    );
    setNouvelleValeur((prev) => ({ ...prev, [attributId]: "" }));
  };

  const ajouterCouleur = (attributId: string, hex: string, label: string) => {
    const propre = label.trim().slice(0, NOM_VALEUR_MAX) || hex;
    onAttributsChange(
      attributs.map((a) =>
        a.id === attributId ? { ...a, valeurs: [...a.valeurs, { id: idAleatoire("val"), label: propre, couleurHex: hex }] } : a
      )
    );
  };

  const retirerValeur = (attributId: string, valeurId: string) => {
    onAttributsChange(attributs.map((a) => (a.id === attributId ? { ...a, valeurs: a.valeurs.filter((v) => v.id !== valeurId) } : a)));
  };

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[0.85fr_1.4fr]">
      {/* Colonne gauche : les attributs posés + ceux qu'on peut ajouter */}
      <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
        <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Vos attributs", "Your attributes")}</p>

        <div className="mt-2 flex flex-col gap-2.5">
          {attributs.map((attribut) => (
            <div key={attribut.id} className="rounded-2xl border border-[var(--dashboard-text)]/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">{attribut.nom}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => retirerAttribut(attribut.id)} className="text-[9px] text-[var(--dashboard-text)]/35 hover:text-[#c8262d]">
                    {t("Retirer", "Remove")}
                  </button>
                  <Tag tone="neutral">{t(`${attribut.valeurs.length} valeurs`, `${attribut.valeurs.length} values`)}</Tag>
                </div>
              </div>

              {attribut.type === "couleur" ? (
                <>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {attribut.valeurs.map((v) => (
                      <span key={v.id} className="flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-1.5 text-[10px] font-medium dark:bg-white/[0.06]">
                        <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: v.couleurHex }} />
                        {v.label}
                        <button type="button" onClick={() => retirerValeur(attribut.id, v.id)} aria-label={t("Retirer cette valeur", "Remove this value")} className="text-[var(--dashboard-text)]/40">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <ChoixCouleur onAjouter={(hex, label) => ajouterCouleur(attribut.id, hex, label)} />
                </>
              ) : (
                // Pastilles rondes (cf. maquette : S · M · L · XL), pas des
                // étiquettes rectangulaires — une valeur de taille/pointure/etc.
                // se lit comme un bouton de sélection, pas comme un tag libre.
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {attribut.valeurs.map((v) => (
                    <div key={v.id} className="group relative">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dashboard-text)]/15 bg-black/[0.03] text-[11px] font-semibold dark:bg-white/[0.06]">
                        {v.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => retirerValeur(attribut.id, v.id)}
                        aria-label={t("Retirer cette valeur", "Remove this value")}
                        className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[9px] text-white group-hover:flex"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {ajoutOuvert[attribut.id] ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={nouvelleValeur[attribut.id] ?? ""}
                        onChange={(e) => setNouvelleValeur((prev) => ({ ...prev, [attribut.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            ajouterValeur(attribut.id, nouvelleValeur[attribut.id] ?? "");
                          }
                          if (e.key === "Escape") setAjoutOuvert((prev) => ({ ...prev, [attribut.id]: false }));
                        }}
                        placeholder={t("S, M, L…", "S, M, L…")}
                        className="w-24 rounded-full border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-[11px] outline-none focus:border-brand-pink dark:bg-white/[0.04]"
                      />
                      <button
                        type="button"
                        onClick={() => ajouterValeur(attribut.id, nouvelleValeur[attribut.id] ?? "")}
                        aria-label={t("Valider cette valeur", "Confirm this value")}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141220] text-[13px] font-semibold text-white dark:bg-brand-pink"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAjoutOuvert((prev) => ({ ...prev, [attribut.id]: true }))}
                      aria-label={t("Ajouter une valeur", "Add a value")}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-[var(--dashboard-text)]/25 text-[13px] text-[var(--dashboard-text)]/40 hover:border-brand-pink/50 hover:text-brand-pink"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Ajouter un attribut", "Add an attribute")}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button type="button" onClick={() => ajouterAttribut("Couleur", "couleur")} className="rounded-full border border-dashed border-[var(--dashboard-text)]/20 px-3 py-1.5 text-[10px] font-medium text-[var(--dashboard-text)]/60">
            {t("Couleur", "Color")}
          </button>
          {TYPES_PREDEFINIS.map((nom) => (
            <button key={nom} type="button" onClick={() => ajouterAttribut(nom, "texte")} className="rounded-full border border-dashed border-[var(--dashboard-text)]/20 px-3 py-1.5 text-[10px] font-medium text-[var(--dashboard-text)]/60">
              {nom}
            </button>
          ))}
          <NouvelAttributPersonnalise onValider={(nom) => ajouterAttribut(nom, "texte")} />
        </div>
        <p className="mt-3 text-[9px] leading-snug text-[var(--dashboard-text)]/35">
          {t(
            "Ces types servent à tous vos produits : des tailles pour un vêtement, des pointures pour une chaussure, des contenances pour un flacon, une puissance pour un appareil. Un attribut que vous créez vous-même reste disponible pour vos produits suivants.",
            "These types apply to all your products: sizes for clothing, shoe sizes for footwear, capacities for a bottle, a power rating for an appliance. An attribute you create yourself stays available for your next products."
          )}
        </p>

        <div className="my-3.5 h-px bg-[var(--dashboard-text)]/10" />

        <p className="text-[9px] leading-snug text-[var(--dashboard-text)]/35">
          {t(
            "Les valeurs se saisissent une par une, ou d'un coup en les séparant par une virgule. Une couleur se prend dans la palette, ou se trouve exactement à la roue.",
            "Values can be entered one by one, or all at once separated by a comma. A color can be picked from the palette, or found exactly with the wheel."
          )}
        </p>
      </div>

      {/* Colonne droite : les combinaisons, générées automatiquement */}
      <div className="rounded-[28px] bg-[var(--dashboard-card-bg)] p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{t("Les combinaisons", "The combinations")}</p>
          <span className="rounded-full bg-brand-pink/10 px-2.5 py-1 text-[10px] font-semibold text-brand-pink">
            {t(`${combinaisons.length} combinaisons`, `${combinaisons.length} combinations`)}
          </span>
        </div>

        {combinaisons.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--dashboard-text)]/40">
            {t("Posez au moins un attribut avec une valeur pour voir les combinaisons.", "Add at least one attribute with a value to see combinations.")}
          </p>
        ) : (
          <>
          <p className="mt-1 text-[9px] text-[var(--dashboard-text)]/35">
            {t("Cliquez une combinaison pour la mettre en avant : « Ce qui vous reste » se calcule sur elle.", "Click a combination to feature it: “What you keep” is calculated on it.")}
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--dashboard-text)]/10">
                  <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">{t("Combinaison", "Combination")}</th>
                  <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">{t("Référence", "Reference")}</th>
                  <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">{t("Achat", "Cost")}</th>
                  <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">{t("Vente", "Price")}</th>
                  <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">{t("Quantité", "Quantity")}</th>
                  <th className="pb-2 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/35">{t("En vente", "For sale")}</th>
                </tr>
              </thead>
              <tbody>
                {combinaisons.map((c) => (
                  <tr key={c.id} className={`border-b border-[var(--dashboard-text)]/[0.05] last:border-0 ${!c.active ? "opacity-40" : ""}`}>
                    <td className="py-2 pr-3 font-medium">
                      <button
                        type="button"
                        onClick={() => onMettreEnAvant(c.id)}
                        disabled={!c.active}
                        title={t("Baser le calcul de marge sur cette combinaison", "Base the margin calculation on this combination")}
                        className="flex items-center gap-1.5 disabled:cursor-not-allowed"
                      >
                        {libelleCombinaison(c, attributs)}
                        {c.misEnAvant && <Tag tone="pink" className="!px-2 !py-0.5 !text-[8px]">{t("Mise en avant", "Featured")}</Tag>}
                      </button>
                    </td>
                    <td className="py-2 pr-3 text-[var(--dashboard-text)]/50">{c.reference}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={0}
                        disabled={!c.active}
                        value={c.prixAchat ?? ""}
                        onChange={(e) => onCombinaisonChange(c.id, { prixAchat: parseMontant(e.target.value) })}
                        placeholder="—"
                        className="w-20 rounded-lg border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-2 py-1 text-xs outline-none focus:border-brand-pink disabled:opacity-40 dark:bg-white/[0.04]"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={0}
                        disabled={!c.active}
                        value={c.prixVente || ""}
                        onChange={(e) => onCombinaisonChange(c.id, { prixVente: parseMontant(e.target.value) ?? 0 })}
                        placeholder="—"
                        className="w-20 rounded-lg border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-2 py-1 text-xs font-semibold outline-none focus:border-brand-pink disabled:opacity-40 dark:bg-white/[0.04]"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={0}
                        disabled={!c.active}
                        value={c.quantite}
                        onChange={(e) => onCombinaisonChange(c.id, { quantite: Math.max(0, Math.round(Number(e.target.value)) || 0) })}
                        className="w-16 rounded-lg border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-2 py-1 text-xs outline-none focus:border-brand-pink disabled:opacity-40 dark:bg-white/[0.04]"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onCombinaisonChange(c.id, { active: !c.active })}
                        aria-pressed={c.active}
                        aria-label={t("Activer ou désactiver cette combinaison", "Toggle this combination")}
                        className={`h-5 w-9 rounded-full transition ${c.active ? "bg-brand-pink" : "bg-[var(--dashboard-text)]/15"}`}
                      >
                        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${c.active ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Note + actions groupées, comme dans la maquette : "Même prix
            partout" recopie le prix d'achat/vente global sur chaque
            combinaison (celles déjà retouchées à la main sont aussi
            écrasées — c'est le but du bouton, pas un bug). */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[58%] text-[9px] leading-snug text-[var(--dashboard-text)]/35">
            {photoParCouleur
              ? t(
                  "Chaque couleur pourra recevoir sa propre photo une fois les photos ajoutées au produit.",
                  "Each color will be able to get its own photo once photos are added to the product."
                )
              : t(
                  "Une combinaison que vous ne vendez pas s'éteint d'un geste : elle disparaît de votre page de commande, sa référence reste réservée, et elle se rallume quand vous voulez.",
                  "A combination you're not selling switches off with one click: it disappears from your order page, its reference stays reserved, and you can switch it back on anytime."
                )}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={appliquerMemePrixPartout}
              disabled={combinaisons.length === 0}
              title={t(`Applique ${prixVenteGlobal ? F(prixVenteGlobal) : "—"} à toutes les combinaisons`, `Applies ${prixVenteGlobal ? F(prixVenteGlobal) : "—"} to every combination`)}
              className="rounded-full border border-brand-pink/40 px-3.5 py-2 text-[10px] font-semibold text-brand-pink transition hover:bg-brand-pink/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("Même prix partout", "Same price everywhere")}
            </button>
            <button
              type="button"
              onClick={() => setPhotoParCouleur((v) => !v)}
              aria-pressed={photoParCouleur}
              className={`rounded-full border px-3.5 py-2 text-[10px] font-semibold transition ${
                photoParCouleur ? "border-brand-pink bg-brand-pink/10 text-brand-pink" : "border-brand-pink/40 text-brand-pink hover:bg-brand-pink/10"
              }`}
            >
              {t("Photo par couleur", "Photo per color")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoixCouleur({ onAjouter }: { onAjouter: (hex: string, label: string) => void }) {
  const { t } = useDashboardLangue();
  const [hex, setHex] = useState("#E8207E");
  const [label, setLabel] = useState("");
  return (
    <div className="mt-2">
      {/* Teintes courantes : un clic pré-remplit le sélecteur ci-dessous,
          la couleur n'est ajoutée qu'au clic sur "+" (le nom reste à saisir). */}
      <div className="flex flex-wrap gap-1.5">
        {PALETTE_COULEURS.map((couleur) => (
          <button
            key={couleur}
            type="button"
            onClick={() => setHex(couleur)}
            aria-label={t(`Choisir ${couleur}`, `Pick ${couleur}`)}
            aria-pressed={hex === couleur}
            className={`h-6 w-6 shrink-0 rounded-md border transition ${hex === couleur ? "border-[var(--dashboard-text)] ring-2 ring-brand-pink/40" : "border-[var(--dashboard-text)]/15"}`}
            style={{ background: couleur }}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
      <input
        type="color"
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        aria-label={t("Choisir exactement la teinte", "Pick the exact shade")}
        title={t("La roue : pour une teinte exacte", "The wheel: for an exact shade")}
        className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-[var(--dashboard-text)]/15 bg-transparent p-0.5"
      />
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value.slice(0, NOM_VALEUR_MAX))}
        placeholder={t("Nom de la couleur", "Color name")}
        className="min-w-0 flex-1 rounded-lg border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-2.5 py-2 text-[11px] outline-none focus:border-brand-pink dark:bg-white/[0.04]"
      />
      <button
        type="button"
        onClick={() => {
          if (label.trim()) {
            onAjouter(hex, label);
            setLabel("");
          }
        }}
        className="rounded-lg bg-[#141220] px-2.5 py-2 text-[11px] font-semibold text-white dark:bg-brand-pink"
      >
        +
      </button>
      </div>
    </div>
  );
}

function NouvelAttributPersonnalise({ onValider }: { onValider: (nom: string) => void }) {
  const { t } = useDashboardLangue();
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");

  const valider = () => {
    if (!nom.trim()) return;
    onValider(nom);
    setNom("");
    setOuvert(false);
  };

  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)} className="rounded-full bg-brand-pink/10 px-3 py-1.5 text-[10px] font-semibold text-brand-pink">
        + {t("Créer le mien", "Create my own")}
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <input
        autoFocus
        value={nom}
        onChange={(e) => setNom(e.target.value.slice(0, NOM_ATTRIBUT_MAX))}
        onKeyDown={(e) => e.key === "Enter" && valider()}
        placeholder={t("Nom de l'attribut", "Attribute name")}
        className="rounded-full border border-brand-pink/40 bg-transparent px-3 py-1.5 text-[10px] outline-none"
      />
      <button type="button" onClick={valider} className="rounded-full bg-brand-pink px-2.5 py-1.5 text-[10px] font-semibold text-white">
        {t("Ajouter", "Add")}
      </button>
    </span>
  );
}
