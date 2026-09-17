"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { Nature, Tag, texteAvecChiffres } from "../dashboard-accueil/shared";
import type { Produit } from "../dashboard-accueil/ProduitsCatalogue";

/*
  "Déposer un stock", ouvert depuis le bouton du même nom en haut de la
  page Produits (voir ../dashboard-accueil/ProduitsCatalogue.tsx). Même
  famille de panneau superposé que CreerCategorieModal.tsx (overlay +
  fond assombri, thème clair/dashboard — cf. mémoire
  [[dashboard-background-fafcfc]]), mais en 5 étapes progressives + un
  talon récapitulatif, sur le modèle envoyé par l'utilisateur (formulaire
  "Nouveau Dépôt" à deux colonnes) — la mise en page est reprise, pas la
  palette : ici on reste sur les couleurs/tokens du dashboard, pas le beige
  de la référence (cf. mémoire [[charte-graphique-livre-moi]]).

  Ne concerne que les produits "en stockage" (nature "S") : un produit en
  drop (nature "P"/"L") n'a pas de stock physique à déposer chez LIIVRE
  MOI. Toutes les données restent locales/mock tant que l'API Laravel ne
  couvre pas les dépôts, cf. [[dashboard-mock-data-pending-laravel-api]].
*/

// Une boutique est affiliée à une seule entreprise agréée à la fois (cf.
// Affiliation.tsx : "Une boutique choisit une entreprise agréée") — même
// nom mock que la fiche partenaire de l'onglet Accueil
// (dashboard-accueil/PartenaireSection.tsx), pas une saisie libre : rien à
// configurer ici, juste l'afficher, cf. [[dashboard-mock-data-pending-laravel-api]].
const ENTREPRISE_AGREEE = "Groupe Logistique Ivoire";

// Taux du frais de protection (perte/dommage pendant le stockage), prélevé
// sur la valeur du dépôt si l'utilisateur l'active — cf. bascule Étape 3.
const TAUX_PROTECTION = 0.05;

type ModeDepot = "moi-meme" | "recuperation";

type Localisation = { lat: number; lng: number };

export type DepotValide = {
  produitIndex: number;
  quantite: number;
  dateDepot: string;
  codeDepot: string;
  valeurTotale: number;
  protectionActivee: boolean;
  modeDepot: ModeDepot;
  notes?: string;
  recuperation?: {
    nomPrenom: string;
    telephone: string;
    heureDebut: string;
    heureFin: string;
    localisation: Localisation | null;
  };
};

// Code lisible et unique à l'affichage : LM-AAAAMMJJ-XXXXX, même esprit que
// la référence envoyée (ex. "LM-20260915-7F3A2C"), pas de vraie contrainte
// d'unicité côté serveur tant que ceci reste local.
function genererCodeDepot(): string {
  const jour = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffixe = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `LM-${jour}-${suffixe}`;
}

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

// Réf/SKU affichés en étape 1 et dans le talon (cf. "Réf. ENC-BT-014  SKU-4471"
// de la référence) — dérivés du nom + index, déterministes (stables au
// re-render), pas de vrai champ réf/SKU côté Produit tant que l'API Laravel
// ne les fournit pas, cf. [[dashboard-mock-data-pending-laravel-api]].
function refEtSku(nom: string, index: number): { ref: string; sku: string } {
  const initiales = nom
    .split(/\s+/)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3) || "PRD";
  let hash = 0;
  for (let i = 0; i < nom.length; i++) hash = (hash * 31 + nom.charCodeAt(i)) >>> 0;
  return {
    ref: `${initiales}-${String(index + 1).padStart(3, "0")}`,
    sku: `SKU-${String(hash % 10000).padStart(4, "0")}`,
  };
}

export default function DeposerStockModal({
  produits,
  onFermer,
  onValider,
  pleinePage = false,
  produitIndexInitial = null,
}: {
  /** Catalogue complet (voir ProduitsCatalogue.tsx) — filtré ici aux produits en stockage. */
  produits: Produit[];
  onFermer: () => void;
  onValider: (depot: DepotValide) => void;
  /** Rendu en page à part (breadcrumb + h1, pas d'overlay) au lieu du
   *  panneau superposé — pour mobile/tablette où la grille formulaire +
   *  talon compressée dans une fenêtre modale rendait mal, cf. l'appelant
   *  (ProduitsCatalogue.tsx) qui choisit selon la largeur d'écran. */
  pleinePage?: boolean;
  /** Index (dans `produits`, pas dans la liste filtrée stockage) déjà choisi
   *  à l'ouverture — depuis le bouton "Réapprovisionner" de la fiche produit
   *  sélectionnée. Ignoré si ce produit n'est pas en stockage (nature "S") :
   *  reste alors sur le choix manuel. */
  produitIndexInitial?: number | null;
}) {
  const { t, langue } = useDashboardLangue();
  const numberLocale = langue === "EN" ? "en-US" : "fr-FR";
  const F = (n: number) => `${n.toLocaleString(numberLocale)} F`;

  const [recherche, setRecherche] = useState("");
  const [produitIndex, setProduitIndex] = useState<number | null>(
    produitIndexInitial !== null && produits[produitIndexInitial]?.nature === "S" ? produitIndexInitial : null
  );
  const [quantite, setQuantite] = useState(1);
  const [dateDepot, setDateDepot] = useState(aujourdhui);
  const [protectionActivee, setProtectionActivee] = useState(false);
  const [modeDepot, setModeDepot] = useState<ModeDepot | null>(null);
  const [nomPrenom, setNomPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [localisation, setLocalisation] = useState<Localisation | null>(null);
  const [erreurLocalisation, setErreurLocalisation] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Code dépôt stable pour la durée de vie du panneau (pas régénéré à
  // chaque re-render) : identifie ce dépôt précis dans le récapitulatif.
  const codeDepot = useMemo(() => genererCodeDepot(), []);

  // Pas d'Échap en page à part : ce raccourci a du sens pour fermer un
  // panneau superposé, pas pour quitter une page entière sans confirmation.
  useEffect(() => {
    if (pleinePage) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFermer, pleinePage]);

  const produitsStockage = produits
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.nature === "S");

  // Liste complète affichée tant que rien n'est tapé — la recherche ne
  // filtre qu'à partir de 2 caractères, elle ne conditionne pas l'affichage
  // de la liste (sinon impossible de choisir un produit sans taper).
  const termeRecherche = recherche.trim().toLowerCase();
  const resultats = produitsStockage.filter(
    ({ p }) =>
      termeRecherche.length < 2 ||
      p.nom.toLowerCase().includes(termeRecherche) ||
      p.nomEn.toLowerCase().includes(termeRecherche)
  );

  const produit = produitIndex !== null ? produits[produitIndex] : null;
  const prixUnitaire = produit ? (produit.achat ?? produit.vente) : 0;
  const valeurBase = quantite * prixUnitaire;
  const fraisProtection = protectionActivee ? Math.round(valeurBase * TAUX_PROTECTION) : 0;
  const valeurTotale = valeurBase + fraisProtection;
  const refSku = produit ? refEtSku(produit.nom, produitIndex ?? 0) : { ref: "—", sku: "—" };

  const etape2Deverrouillee = produit !== null;
  const etape3Deverrouillee = etape2Deverrouillee && quantite > 0 && dateDepot !== "";
  const etape4Deverrouillee = etape3Deverrouillee;
  const etape5Deverrouillee = etape4Deverrouillee;

  const recuperationComplete =
    nomPrenom.trim() !== "" && telephone.trim() !== "" && heureDebut !== "" && heureFin !== "";

  const peutValider =
    etape5Deverrouillee &&
    modeDepot !== null &&
    (modeDepot === "moi-meme" || recuperationComplete);

  const ouvrirItineraire = () => {
    setModeDepot("moi-meme");
    const destination = encodeURIComponent(`${ENTREPRISE_AGREEE}, Côte d'Ivoire`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank", "noopener,noreferrer");
  };

  const capturerLocalisation = () => {
    setErreurLocalisation(null);
    // navigator.geolocation existe même en contexte non sécurisé (http hors
    // localhost) mais getCurrentPosition y échoue toujours en
    // PERMISSION_DENIED sans jamais afficher de popup — cause la plus
    // probable en test mobile via IP réseau plutôt que localhost/HTTPS.
    if (!window.isSecureContext) {
      setErreurLocalisation(t(
        "Nécessite HTTPS (ou localhost) — pas dispo en http sur IP réseau.",
        "Requires HTTPS (or localhost) — unavailable over http on a network IP."
      ));
      return;
    }
    if (!navigator.geolocation) {
      setErreurLocalisation(t("Non supporté par ce navigateur.", "Not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocalisation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages: Record<number, [string, string]> = {
          1: ["Permission refusée — autorise la localisation pour ce site.", "Permission denied — allow location for this site."],
          2: ["Position introuvable (GPS/réseau coupé ?).", "Position unavailable (GPS/network off?)."],
          3: ["Délai dépassé, réessaie.", "Timed out, try again."],
        };
        const [fr, en] = messages[err.code] ?? ["Localisation indisponible.", "Location unavailable."];
        setErreurLocalisation(t(fr, en));
      },
      { timeout: 10000 }
    );
  };

  const valider = () => {
    if (!peutValider || produitIndex === null || modeDepot === null) return;
    onValider({
      produitIndex,
      quantite,
      dateDepot,
      codeDepot,
      valeurTotale,
      protectionActivee,
      modeDepot,
      notes: notes.trim() || undefined,
      recuperation:
        modeDepot === "recuperation"
          ? { nomPrenom: nomPrenom.trim(), telephone: telephone.trim(), heureDebut, heureFin, localisation }
          : undefined,
    });
  };

  const colonneEtapes = (
    <>
            {/* Étape 1 — Sélection du produit */}
            <Etape numero={1} titre={t("Sélection du produit", "Product selection")}>
              {produit ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ProduitVignette produit={produit} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{texteAvecChiffres(t(produit.nom, produit.nomEn))}</p>
                      <p className="truncate text-[10px] text-[var(--dashboard-text)]/40">
                        {t("Réf.", "Ref.")} <span className="font-figures-bold">{refSku.ref}</span> · <span className="font-figures-bold">{refSku.sku}</span> · {texteAvecChiffres(t(`Stock : ${produit.stock}`, `Stock: ${produit.stock}`))}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-figures-bold">{F(prixUnitaire)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProduitIndex(null);
                        setRecherche("");
                      }}
                      className="shrink-0 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[10px] font-semibold transition hover:bg-[var(--dashboard-text)]/[0.04]"
                    >
                      {t("Changer", "Change")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    autoFocus
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder={t("Nom du produit…", "Product name…")}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2.5 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
                  />
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-[var(--dashboard-text)]/10">
                    {resultats.length === 0 ? (
                      <p className="p-3 text-[11px] text-[var(--dashboard-text)]/40">
                        {t("Aucun produit en stockage trouvé.", "No warehoused product found.")}
                      </p>
                    ) : (
                      resultats.map(({ p, i }) => {
                        const rs = refEtSku(p.nom, i);
                        return (
                          <button
                            key={`${p.nom}-${i}`}
                            type="button"
                            onClick={() => setProduitIndex(i)}
                            className="flex w-full items-center gap-2.5 border-b border-[var(--dashboard-text)]/[0.06] px-3 py-2 text-left text-xs last:border-0 hover:bg-[var(--dashboard-text)]/[0.04]"
                          >
                            <ProduitVignette produit={p} size={32} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{texteAvecChiffres(t(p.nom, p.nomEn))}</span>
                              <span className="block truncate text-[10px] text-[var(--dashboard-text)]/40"><span className="font-figures-bold">{rs.ref}</span> · <span className="font-figures-bold">{rs.sku}</span></span>
                            </span>
                            <span className="shrink-0 font-figures-bold text-[var(--dashboard-text)]/70">{F(p.achat ?? p.vente)}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </Etape>

            {/* Étape 2 — Détails du stock */}
            <Etape
              numero={2}
              titre={t("Détails du stock", "Stock details")}
              verrouillee={!etape2Deverrouillee}
              badgeVerrouillee={t("Visible une fois le produit choisi", "Visible once the product is chosen")}
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
                <Champ label={t("Code dépôt", "Deposit code")}>
                  <input
                    readOnly
                    value={etape2Deverrouillee ? codeDepot : "—"}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.04] px-3 py-2 text-sm text-[var(--dashboard-text)]/60 outline-none font-figures"
                  />
                </Champ>
                <Champ label={t("Quantité", "Quantity")}>
                  <input
                    type="number"
                    min={1}
                    value={quantite}
                    onChange={(e) => setQuantite(Math.max(1, Number(e.target.value) || 1))}
                    disabled={!etape2Deverrouillee}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink disabled:opacity-50 dark:bg-white/[0.04] font-figures"
                  />
                </Champ>
                <Champ label={t("Date de dépôt", "Deposit date")}>
                  <input
                    type="date"
                    value={dateDepot}
                    onChange={(e) => setDateDepot(e.target.value)}
                    disabled={!etape2Deverrouillee}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink disabled:opacity-50 dark:bg-white/[0.04]"
                  />
                </Champ>
                <Champ label={t("Valeur totale", "Total value")}>
                  <input
                    readOnly
                    value={etape2Deverrouillee ? F(valeurBase) : "—"}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.04] px-3 py-2 text-sm font-semibold outline-none font-figures"
                  />
                </Champ>
              </div>
            </Etape>

            {/* Étape 3 — Protection */}
            <Etape
              numero={3}
              titre={t("Protection", "Protection")}
              verrouillee={!etape3Deverrouillee}
              badgeVerrouillee={t("Visible après la quantité et la date", "Visible once quantity and date are set")}
            >
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{t("Protection du dépôt", "Deposit protection")}</p>
                  <p className="text-[10px] text-[var(--dashboard-text)]/40">
                    {texteAvecChiffres(t(`Frais de protection : ${TAUX_PROTECTION * 100}% de la valeur, ajoutés si activée`, `Protection fee: ${TAUX_PROTECTION * 100}% of the value, added if enabled`))}
                  </p>
                </div>
                <ToggleSwitch
                  actif={protectionActivee}
                  disabled={!etape3Deverrouillee}
                  onClick={() => setProtectionActivee((prev) => !prev)}
                />
              </div>
              {protectionActivee && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#dcf5e3] px-3 py-2.5 text-[#178a3f]">
                  <ShieldIcon />
                  <p className="text-xs leading-snug">
                    {t(
                      "Votre produit sera protégé en cas de perte ou de dommage pendant son stockage.",
                      "Your product will be protected in case of loss or damage during storage."
                    )}
                    {" "}
                    <span className="font-semibold">
                      {texteAvecChiffres(t(
                        `Frais de protection (${TAUX_PROTECTION * 100}%) : ${F(fraisProtection)}, ajoutés à la valeur totale.`,
                        `Protection fee (${TAUX_PROTECTION * 100}%): ${F(fraisProtection)}, added to the total value.`
                      ))}
                    </span>
                  </p>
                </div>
              )}
            </Etape>

            {/* Étape 4 — Configuration logistique : rien à saisir, la
                boutique n'est affiliée qu'à une seule entreprise agréée
                (cf. Affiliation.tsx), donc son nom s'affiche seul. */}
            <Etape
              numero={4}
              titre={t("Configuration logistique", "Logistics setup")}
              verrouillee={!etape4Deverrouillee}
              badgeVerrouillee={t("Visible après la protection", "Visible once protection is set")}
            >
              <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">
                {t("Entreprise agréée", "Approved partner")}
              </p>
              <div className="rounded-2xl border border-brand-purple/15 bg-gradient-to-br from-brand-purple/10 via-brand-purple/[0.03] to-transparent px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-purple text-white shadow-[0_8px_18px_-6px_rgba(58,29,138,0.5)]">
                    <BuildingIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{ENTREPRISE_AGREEE}</p>
                    <p className="truncate text-[11px] text-[var(--dashboard-text)]/50">
                      {t("Livraison et collecte des dépôts", "Delivery and deposit pickup")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-brand-purple/10 pt-2.5">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">
                    {t("Statut", "Status")}
                  </span>
                  <Tag tone="ok">{t("Partenaire actif", "Active partner")}</Tag>
                </div>
              </div>
            </Etape>

            {/* Étape 5 — Modalité de dépôt */}
            <Etape
              numero={5}
              titre={t("Modalité de dépôt", "Deposit method")}
              verrouillee={!etape5Deverrouillee}
              badgeVerrouillee={t("Visible après la configuration logistique", "Visible once logistics is configured")}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <CarteChoix
                  actif={modeDepot === "moi-meme"}
                  disabled={!etape5Deverrouillee}
                  icone={<CamionIcon />}
                  titre={t("Je dépose moi-même", "I'll deposit it myself")}
                  sousTitre={t("Ouvre l'itinéraire vers l'entreprise agréée", "Opens directions to the approved partner")}
                  tag={<Tag tone="ok">{t("Activation immédiate", "Immediate activation")}</Tag>}
                  onClick={ouvrirItineraire}
                />
                <CarteChoix
                  actif={modeDepot === "recuperation"}
                  disabled={!etape5Deverrouillee}
                  icone={<EntrepotIcon />}
                  titre={t("L'entreprise agréée récupère", "The approved partner picks up")}
                  sousTitre={t("Renseignez vos disponibilités", "Fill in your availability")}
                  tag={<Tag tone="warn">{t("En attente de validation", "Pending validation")}</Tag>}
                  onClick={() => setModeDepot("recuperation")}
                />
              </div>

              {modeDepot === "recuperation" && (
                <div className="mt-3 space-y-3 rounded-xl border border-[var(--dashboard-text)]/10 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Champ label={t("Nom et prénom", "Full name")}>
                      <input
                        value={nomPrenom}
                        onChange={(e) => setNomPrenom(e.target.value)}
                        className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
                      />
                    </Champ>
                    <Champ label={t("Numéro de téléphone", "Phone number")}>
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="+225 07 00 00 00 00"
                        className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04] font-figures"
                      />
                    </Champ>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Champ label={t("Disponible à partir de", "Available from")}>
                      <input
                        type="time"
                        value={heureDebut}
                        onChange={(e) => setHeureDebut(e.target.value)}
                        className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
                      />
                    </Champ>
                    <Champ label={t("Jusqu'à", "Until")}>
                      <input
                        type="time"
                        value={heureFin}
                        onChange={(e) => setHeureFin(e.target.value)}
                        className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
                      />
                    </Champ>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">
                      {t("Localisation actuelle", "Current location")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={capturerLocalisation}
                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--dashboard-text)]/15 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-[var(--dashboard-text)]/[0.04]"
                      >
                        <PinIcon />
                        {t("Capturer ma position", "Capture my location")}
                      </button>
                      {localisation && (
                        <span className="text-[10px] text-[var(--dashboard-text)]/50 font-figures">
                          {localisation.lat.toFixed(5)}, {localisation.lng.toFixed(5)}
                        </span>
                      )}
                      {erreurLocalisation && !localisation && (
                        <span className="text-[10px] text-[#c8262d]">{erreurLocalisation}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Etape>

            {/* Étape 6 — Informations complémentaires : notes libres visibles
                par le partenaire logistique au moment de la collecte/du dépôt. */}
            <Etape
              numero={6}
              titre={t("Informations complémentaires", "Additional information")}
              verrouillee={!etape5Deverrouillee}
              badgeVerrouillee={t("Visible après la modalité de dépôt", "Visible once deposit method is set")}
            >
              <Champ label={t("Notes (optionnel)", "Notes (optional)")}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!etape5Deverrouillee}
                  rows={2}
                  placeholder={t("Ex. colis fragile, prévoir emballage renforcé…", "E.g. fragile parcel, use reinforced packaging…")}
                  className="w-full resize-none rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink disabled:opacity-50 dark:bg-white/[0.04]"
                />
              </Champ>
              <p className="mt-1.5 text-[10px] text-[var(--dashboard-text)]/40">
                {t("Visibles par le partenaire logistique.", "Visible to the logistics partner.")}
              </p>
            </Etape>
    </>
  );

  // Talon récapitulatif — un accent de couleur par bloc, même logique que
  // le reste du dashboard (nature stockage = bleu, cf.
  // [[dashboard-chart-colors-stockage-drop]]), pour qu'un coup d'œil
  // suffise à situer chaque groupe d'infos. Contenu seul (sans le
  // conteneur qui le positionne : colonne à droite en modal, carte
  // sticky en page à part, cf. les deux gabarits plus bas).
  const colonneRecap = (
    <>
            <EyebrowTag>{t("Talon", "Stub")}</EyebrowTag>
            <p className="mt-1 text-sm font-bold tracking-tight">{t("Récapitulatif", "Summary")}</p>

            <div className="mt-3 space-y-3 text-xs">
              <RecapSection titre={t("Produit", "Product")}>
                <RecapLigne label={t("Nom", "Name")} valeur={produit ? texteAvecChiffres(t(produit.nom, produit.nomEn)) : "—"} />
                <RecapLigne label={t("Référence", "Reference")} valeur={produit ? <span className="font-figures-bold">{refSku.ref}</span> : "—"} />
                <RecapLigne label="SKU" valeur={produit ? <span className="font-figures-bold">{refSku.sku}</span> : "—"} />
                <RecapLigne label={t("Prix unitaire", "Unit price")} valeur={produit ? <span className="font-figures-bold">{F(prixUnitaire)}</span> : "—"} />
              </RecapSection>

              <RecapSection titre={t("Stock", "Stock")}>
                <RecapLigne label={t("Code dépôt", "Deposit code")} valeur={etape2Deverrouillee ? <span className="font-figures-bold">{codeDepot}</span> : "—"} />
                <RecapLigne label={t("Quantité", "Quantity")} valeur={etape2Deverrouillee ? texteAvecChiffres(t(`${quantite} unités`, `${quantite} units`)) : "—"} />
              </RecapSection>

              {etape2Deverrouillee && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--dashboard-text)]/[0.05] px-3 py-2.5">
                  <span className="text-xs font-semibold">{t("Valeur totale", "Total value")}</span>
                  <span className="text-sm font-figures-bold">{F(valeurTotale)}</span>
                </div>
              )}

              <RecapSection titre={t("Protection", "Protection")}>
                <RecapLigne
                  label={t("Statut", "Status")}
                  valeur={<Tag tone={protectionActivee ? "ok" : "neutral"}>{protectionActivee ? t("Activée", "Enabled") : t("Non activée", "Not enabled")}</Tag>}
                />
                {protectionActivee && (
                  <RecapLigne label={texteAvecChiffres(t(`Frais (${TAUX_PROTECTION * 100}%)`, `Fee (${TAUX_PROTECTION * 100}%)`))} valeur={<span className="font-figures-bold">{F(fraisProtection)}</span>} />
                )}
              </RecapSection>

              <RecapSection titre={t("Logistique", "Logistics")}>
                <RecapLigne
                  label={t("Type", "Type")}
                  valeur={
                    modeDepot === null
                      ? "—"
                      : modeDepot === "moi-meme"
                        ? t("Vous-même", "Yourself")
                        : ENTREPRISE_AGREEE
                  }
                />
                {modeDepot === "recuperation" && (
                  <>
                    <RecapLigne label={t("Contact", "Contact")} valeur={nomPrenom || "—"} />
                    <RecapLigne label={t("Téléphone", "Phone")} valeur={telephone ? <span className="font-figures-bold">{telephone}</span> : "—"} />
                    <RecapLigne
                      label={t("Créneau", "Time slot")}
                      valeur={heureDebut && heureFin ? <span className="font-figures-bold">{`${heureDebut} – ${heureFin}`}</span> : "—"}
                    />
                    <RecapLigne
                      label={t("Position", "Location")}
                      valeur={localisation ? t("Capturée", "Captured") : "—"}
                    />
                  </>
                )}
                {modeDepot !== null && (
                  <Tag tone={modeDepot === "moi-meme" ? "ok" : "warn"} className="mt-1">
                    {modeDepot === "moi-meme"
                      ? t("Activation immédiate", "Immediate activation")
                      : t("En attente de collecte", "Pending pickup")}
                  </Tag>
                )}
              </RecapSection>

              <RecapSection titre={t("Conseils", "Tips")}>
                <div className="space-y-1.5 text-[11px] text-[var(--dashboard-text)]/60">
                  <ConseilLigne>{t("Vérifiez la quantité avant de valider", "Check the quantity before validating")}</ConseilLigne>
                  <ConseilLigne>{t("Le code dépôt est unique, conservez-le", "The deposit code is unique, keep it")}</ConseilLigne>
                  {modeDepot === "moi-meme" && (
                    <ConseilLigne>{t("Activation immédiate à la dépose", "Immediate activation on drop-off")}</ConseilLigne>
                  )}
                </div>
              </RecapSection>
            </div>

            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={valider}
                disabled={!peutValider}
                className="w-full rounded-full bg-[#141220] py-3 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(20,18,32,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none dark:bg-brand-pink dark:shadow-[0_4px_16px_rgba(236,12,140,0.35)]"
              >
                {t("Valider le dépôt", "Validate the deposit")}
              </button>
            </div>
    </>
  );

  // Page à part (mobile/tablette) : même breadcrumb + h1 qu'AjouterProduitModal.tsx
  // quand il est monté sur sa propre route — convention déjà établie dans ce
  // dossier pour un formulaire trop dense pour un panneau superposé.
  if (pleinePage) {
    return (
      <>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onFermer}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--dashboard-card-bg)]/70 px-3.5 py-2 text-xs font-medium text-[var(--dashboard-text)]/70 shadow-[0_2px_10px_rgba(20,18,32,0.06)] hover:bg-[var(--dashboard-card-bg)]"
          >
            ← {t("Produits", "Products")} <span className="text-[var(--dashboard-text)]/30">›</span>{" "}
            <span className="font-semibold text-[var(--dashboard-text)]">{t("Déposer un stock", "Deposit stock")}</span>
          </button>
        </div>

        <EyebrowTag className="mt-4">{t("Dépôt de stock · Formulaire", "Stock deposit · Form")}</EyebrowTag>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("Déposer un stock", "Deposit stock")}</h1>
        <p className="mt-1 text-sm text-[var(--dashboard-text)]/50">
          {t("Six étapes pour enregistrer un dépôt de stock physique.", "Six steps to record a physical stock deposit.")}
        </p>

        <div className="mt-4 border-t border-dashed border-[var(--dashboard-text)]/15" />

        <InfoCallout className="mt-4">
          {t(
            "Chaque dépôt génère un code unique et une valeur totale calculée automatiquement — vérifiez le produit et la quantité avant de valider.",
            "Each deposit generates a unique code and an automatically computed total value — check the product and quantity before validating."
          )}
        </InfoCallout>

        <div className="mb-10 mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1.7fr_1fr] md:items-start">
          <div className="space-y-4">{colonneEtapes}</div>
          <div className="md:sticky md:top-6">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
              <ScissorsIcon /> {t("Détacher · Talon récapitulatif", "Detach · Summary stub")}
            </p>
            <div className="rounded-2xl card-tint p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
              {colonneRecap}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4" onClick={onFermer}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-[var(--dashboard-card-bg)] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="border-b border-[var(--dashboard-text)]/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <EyebrowTag>{t("Dépôt de stock · Formulaire", "Stock deposit · Form")}</EyebrowTag>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight">{t("Déposer un stock", "Deposit stock")}</h2>
              <p className="mt-1 text-xs text-[var(--dashboard-text)]/50">
                {t("Six étapes pour enregistrer un dépôt de stock physique.", "Six steps to record a physical stock deposit.")}
              </p>
            </div>
            <button
              type="button"
              onClick={onFermer}
              aria-label={t("Fermer", "Close")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--dashboard-text)]/50 transition hover:bg-[var(--dashboard-text)]/8 hover:text-[var(--dashboard-text)]"
            >
              <CroixIcon />
            </button>
          </div>

          <div className="mt-3 border-t border-dashed border-[var(--dashboard-text)]/15" />

          <InfoCallout className="mt-3">
            {t(
              "Chaque dépôt génère un code unique et une valeur totale calculée automatiquement — vérifiez le produit et la quantité avant de valider.",
              "Each deposit generates a unique code and an automatically computed total value — check the product and quantity before validating."
            )}
          </InfoCallout>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.7fr_1fr]">
          <div className="min-h-0 space-y-4 overflow-y-auto p-5">{colonneEtapes}</div>
          <div className="flex min-h-0 flex-col overflow-y-auto border-t border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] p-5 lg:border-t-0 lg:border-l">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
              <ScissorsIcon /> {t("Détacher · Talon récapitulatif", "Detach · Summary stub")}
            </p>
            {colonneRecap}
          </div>
        </div>
      </div>
    </div>
  );
}

// Même vignette que le tableau du catalogue (ProduitsCatalogue.tsx) : photo
// si le produit en a une, sinon le badge Nature coloré en repli — jamais de
// case vide.
function ProduitVignette({ produit, size = 40 }: { produit: Produit; size?: number }) {
  const photo = produit.images?.[0];
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--dashboard-card-bg)]"
      style={{ height: size, width: size }}
    >
      {photo ? <Image src={photo} alt={produit.nom} fill sizes={`${size}px`} className="object-cover" /> : <Nature code={produit.nature} />}
    </span>
  );
}

function Etape({
  numero,
  titre,
  verrouillee = false,
  badgeVerrouillee,
  children,
}: {
  numero: number;
  titre: string;
  /** Étape pas encore atteignable — visible mais grisée, cf. talon "visible une fois..." de la référence. */
  verrouillee?: boolean;
  /** Puce à droite du titre quand verrouillée (ex. "Visible une fois le produit choisi", cf. référence). */
  badgeVerrouillee?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl card-tint p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] transition ${verrouillee ? "opacity-40" : ""}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#141220] text-[11px] font-figures-bold text-white dark:bg-brand-pink">
            {numero}
          </span>
          <p className="text-sm font-semibold">{titre}</p>
        </div>
        {verrouillee && badgeVerrouillee && (
          <span className="shrink-0 rounded-full bg-brand-purple/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand-purple">
            {badgeVerrouillee}
          </span>
        )}
      </div>
      <fieldset disabled={verrouillee} className="contents">
        {children}
      </fieldset>
    </div>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">{label}</p>
      {children}
    </label>
  );
}

// Bascule on/off pour la Protection (Étape 3) — remplace l'ancien choix à
// deux pastilles : un binaire activé/désactivé se prête mieux à un switch
// qu'à deux boutons distincts, avec l'état "désactivé" comme défaut naturel.
function ToggleSwitch({
  actif,
  onClick,
  disabled,
}: {
  actif: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
        actif ? "bg-brand-pink" : "bg-[var(--dashboard-text)]/15"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          actif ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function CarteChoix({
  actif,
  disabled,
  icone,
  titre,
  sousTitre,
  tag,
  onClick,
}: {
  actif: boolean;
  disabled?: boolean;
  icone: React.ReactNode;
  titre: string;
  sousTitre: string;
  /** Puce de statut sous le sous-titre (cf. cartes "Client / LIIVREMOI / Logisticien externe" de la référence). */
  tag?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition disabled:cursor-not-allowed ${
        actif
          ? "border-brand-pink bg-brand-pink/5"
          : "border-[var(--dashboard-text)]/12 hover:bg-[var(--dashboard-text)]/[0.03]"
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${actif ? "bg-brand-pink/15 text-brand-pink" : "bg-[var(--dashboard-text)]/8 text-[var(--dashboard-text)]/60"}`}>
        {icone}
      </span>
      <span className="text-xs font-semibold">{titre}</span>
      <span className="text-[10px] leading-snug text-[var(--dashboard-text)]/40">{sousTitre}</span>
      {tag && <span className="mt-0.5">{tag}</span>}
    </button>
  );
}

// Section du talon récapitulatif — label muet + séparateur pointillé au-dessus
// (sauf la première), pas d'accent de couleur par bloc : format plat repris
// tel quel de la référence envoyée par l'utilisateur.
function RecapSection({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-dashed border-[var(--dashboard-text)]/15 pt-3 first:border-t-0 first:pt-0">
      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--dashboard-text)]/40">{titre}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// Repère "● LABEL" en petites majuscules — même rôle que l'eyebrow de la
// référence ("● RÉCAPITULATIF VISUEL", "● TALON") au-dessus d'un titre.
function EyebrowTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40 ${className}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-pink" />
      {children}
    </p>
  );
}

// Bandeau "Exemple illustratif" de la référence, recoloré aux tokens du
// dashboard plutôt que son bleu d'origine (cf. [[charte-graphique-livre-moi]]).
function InfoCallout({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl bg-brand-pink/8 px-3.5 py-2.5 text-[11px] leading-snug text-[var(--dashboard-text)]/70 ${className}`}>
      <InfoIcon />
      <p>{children}</p>
    </div>
  );
}

function ConseilLigne({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5">
      <CheckIcon />
      <span>{children}</span>
    </p>
  );
}

function RecapLigne({ label, valeur }: { label: React.ReactNode; valeur: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[var(--dashboard-text)]/50">{label}</span>
      <span className="font-semibold">{valeur}</span>
    </div>
  );
}

function CroixIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CamionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4l4 3v3h-8z" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="16.5" cy="18" r="1.6" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="1.5" strokeWidth="1.6" />
      <path
        d="M9 7h1.5M13.5 7H15M9 11h1.5M13.5 11H15M9 15h1.5M13.5 15H15"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EntrepotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h1.5M13.5 7H15M9 11h1.5M13.5 11H15M9 15h1.5M13.5 15H15" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-pink" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 8v.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-3 w-3 shrink-0 text-[#178a3f]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <path d="M8.5 7.5 20 18M20 6 8.5 16.5" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}
