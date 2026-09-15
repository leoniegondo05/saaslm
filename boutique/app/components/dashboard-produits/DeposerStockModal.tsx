"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { Nature, Tag } from "../dashboard-accueil/shared";
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
  const [protectionActivee, setProtectionActivee] = useState<boolean | null>(null);
  const [modeDepot, setModeDepot] = useState<ModeDepot | null>(null);
  const [nomPrenom, setNomPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [localisation, setLocalisation] = useState<Localisation | null>(null);
  const [erreurLocalisation, setErreurLocalisation] = useState<string | null>(null);

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
  const valeurTotale = quantite * prixUnitaire;

  const etape2Deverrouillee = produit !== null;
  const etape3Deverrouillee = etape2Deverrouillee && quantite > 0 && dateDepot !== "";
  const etape4Deverrouillee = etape3Deverrouillee && protectionActivee !== null;
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
    if (!peutValider || produitIndex === null || protectionActivee === null || modeDepot === null) return;
    onValider({
      produitIndex,
      quantite,
      dateDepot,
      codeDepot,
      valeurTotale,
      protectionActivee,
      modeDepot,
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
                      <p className="truncate text-sm font-semibold">{t(produit.nom, produit.nomEn)}</p>
                      <p className="text-[10px] text-[var(--dashboard-text)]/45">
                        {t(`Stock actuel : ${produit.stock}`, `Current stock: ${produit.stock}`)} · {F(prixUnitaire)}
                      </p>
                    </div>
                  </div>
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
                      resultats.map(({ p, i }) => (
                        <button
                          key={`${p.nom}-${i}`}
                          type="button"
                          onClick={() => setProduitIndex(i)}
                          className="flex w-full items-center gap-2.5 border-b border-[var(--dashboard-text)]/[0.06] px-3 py-2 text-left text-xs last:border-0 hover:bg-[var(--dashboard-text)]/[0.04]"
                        >
                          <ProduitVignette produit={p} size={32} />
                          <span className="min-w-0 flex-1 truncate font-medium">{t(p.nom, p.nomEn)}</span>
                          <span className="shrink-0 text-[var(--dashboard-text)]/40">{F(p.achat ?? p.vente)}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </Etape>

            {/* Étape 2 — Détails du stock */}
            <Etape numero={2} titre={t("Détails du stock", "Stock details")} verrouillee={!etape2Deverrouillee}>
              <div className="grid grid-cols-2 gap-3">
                <Champ label={t("Quantité", "Quantity")}>
                  <input
                    type="number"
                    min={1}
                    value={quantite}
                    onChange={(e) => setQuantite(Math.max(1, Number(e.target.value) || 1))}
                    disabled={!etape2Deverrouillee}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink disabled:opacity-50 dark:bg-white/[0.04]"
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
                <Champ label={t("Code dépôt", "Deposit code")}>
                  <input
                    readOnly
                    value={etape2Deverrouillee ? codeDepot : "—"}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.04] px-3 py-2 text-sm text-[var(--dashboard-text)]/60 outline-none"
                  />
                </Champ>
                <Champ label={t("Valeur totale", "Total value")}>
                  <input
                    readOnly
                    value={etape2Deverrouillee ? F(valeurTotale) : "—"}
                    className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.04] px-3 py-2 text-sm font-semibold outline-none"
                  />
                </Champ>
              </div>
            </Etape>

            {/* Étape 3 — Protection */}
            <Etape numero={3} titre={t("Protection", "Protection")} verrouillee={!etape3Deverrouillee}>
              <div className="flex gap-2">
                <ChoixPill
                  actif={protectionActivee === true}
                  onClick={() => setProtectionActivee(true)}
                  disabled={!etape3Deverrouillee}
                >
                  {t("Activer la protection", "Enable protection")}
                </ChoixPill>
                <ChoixPill
                  actif={protectionActivee === false}
                  onClick={() => setProtectionActivee(false)}
                  disabled={!etape3Deverrouillee}
                >
                  {t("Ne pas activer", "Don't enable")}
                </ChoixPill>
              </div>
              {protectionActivee === true && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#dcf5e3] px-3 py-2.5 text-[#178a3f]">
                  <ShieldIcon />
                  <p className="text-xs leading-snug">
                    {t(
                      "Votre produit sera protégé : en cas de perte ou de dommage pendant son stockage.",
                      "Your product will be protected: in case of loss or damage during storage."
                    )}
                  </p>
                </div>
              )}
            </Etape>

            {/* Étape 4 — Configuration logistique : rien à saisir, la
                boutique n'est affiliée qu'à une seule entreprise agréée
                (cf. Affiliation.tsx), donc son nom s'affiche seul. */}
            <Etape numero={4} titre={t("Configuration logistique", "Logistics setup")} verrouillee={!etape4Deverrouillee}>
              <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[var(--dashboard-text)]/40">
                {t("Entreprise agréée", "Approved partner")}
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
                  <EntrepotIcon />
                </span>
                <span className="text-sm font-semibold">{ENTREPRISE_AGREEE}</span>
              </div>
            </Etape>

            {/* Étape 5 — Modalité de dépôt */}
            <Etape numero={5} titre={t("Modalité de dépôt", "Deposit method")} verrouillee={!etape5Deverrouillee}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <CarteChoix
                  actif={modeDepot === "moi-meme"}
                  disabled={!etape5Deverrouillee}
                  icone={<CamionIcon />}
                  titre={t("Je dépose moi-même", "I'll deposit it myself")}
                  sousTitre={t("Ouvre l'itinéraire vers l'entreprise agréée", "Opens directions to the approved partner")}
                  onClick={ouvrirItineraire}
                />
                <CarteChoix
                  actif={modeDepot === "recuperation"}
                  disabled={!etape5Deverrouillee}
                  icone={<EntrepotIcon />}
                  titre={t("L'entreprise agréée récupère", "The approved partner picks up")}
                  sousTitre={t("Renseignez vos disponibilités", "Fill in your availability")}
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
                        className="w-full rounded-xl border border-[var(--dashboard-text)]/15 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-brand-pink dark:bg-white/[0.04]"
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
                        <span className="text-[10px] text-[var(--dashboard-text)]/50">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
              {t("Récapitulatif", "Summary")}
            </p>

            {produit && (
              <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-[var(--dashboard-card-bg)] p-2.5">
                <ProduitVignette produit={produit} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{t(produit.nom, produit.nomEn)}</p>
                  <p className="text-[10px] text-[var(--dashboard-text)]/45">{F(prixUnitaire)} {t("/ unité", "/ unit")}</p>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2.5 text-xs">
              <RecapBloc titre={t("Stock", "Stock")} couleur="#5AA9FF">
                <RecapLigne label={t("Code dépôt", "Deposit code")} valeur={etape2Deverrouillee ? codeDepot : "—"} />
                <RecapLigne label={t("Quantité", "Quantity")} valeur={etape2Deverrouillee ? `${quantite}` : "—"} />
              </RecapBloc>

              {etape2Deverrouillee && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-[#141220] px-3 py-2.5 dark:bg-brand-pink">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">
                    {t("Valeur totale", "Total value")}
                  </span>
                  <span className="text-sm font-bold text-white">{F(valeurTotale)}</span>
                </div>
              )}

              <RecapBloc
                titre={t("Protection", "Protection")}
                couleur={protectionActivee ? "#178a3f" : "#5A6072"}
              >
                <RecapLigne
                  label={t("Statut", "Status")}
                  valeur={
                    protectionActivee === null
                      ? "—"
                      : <Tag tone={protectionActivee ? "ok" : "neutral"}>{protectionActivee ? t("Activée", "Enabled") : t("Non activée", "Not enabled")}</Tag>
                  }
                />
              </RecapBloc>

              <RecapBloc titre={t("Logistique", "Logistics")} couleur="#3A1D8A">
                <RecapLigne label={t("Entreprise agréée", "Approved partner")} valeur={ENTREPRISE_AGREEE} />
                <RecapLigne
                  label={t("Mode", "Method")}
                  valeur={
                    modeDepot === null
                      ? "—"
                      : modeDepot === "moi-meme"
                        ? t("Dépôt par vous-même", "Self deposit")
                        : t("Récupération par le partenaire", "Partner pickup")
                  }
                />
                {modeDepot === "recuperation" && (
                  <>
                    <RecapLigne label={t("Contact", "Contact")} valeur={nomPrenom || "—"} />
                    <RecapLigne label={t("Téléphone", "Phone")} valeur={telephone || "—"} />
                    <RecapLigne
                      label={t("Créneau", "Time slot")}
                      valeur={heureDebut && heureFin ? `${heureDebut} – ${heureFin}` : "—"}
                    />
                    <RecapLigne
                      label={t("Position", "Location")}
                      valeur={localisation ? t("Capturée", "Captured") : "—"}
                    />
                  </>
                )}
              </RecapBloc>
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

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{t("Déposer un stock", "Deposit stock")}</h1>
        <p className="mt-1 text-sm text-[var(--dashboard-text)]/50">
          {t("Cinq étapes pour enregistrer un dépôt de stock physique.", "Five steps to record a physical stock deposit.")}
        </p>

        <div className="mb-10 mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr] lg:items-start">
          <div className="space-y-4">{colonneEtapes}</div>
          <div className="rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] lg:sticky lg:top-6">
            {colonneRecap}
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
        <div className="flex items-start justify-between gap-3 border-b border-[var(--dashboard-text)]/10 p-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("Déposer un stock", "Deposit stock")}</h2>
            <p className="mt-1 text-xs text-[var(--dashboard-text)]/50">
              {t("Cinq étapes pour enregistrer un dépôt de stock physique.", "Five steps to record a physical stock deposit.")}
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

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.7fr_1fr]">
          <div className="min-h-0 space-y-4 overflow-y-auto p-5">{colonneEtapes}</div>
          <div className="flex min-h-0 flex-col overflow-y-auto border-t border-[var(--dashboard-text)]/10 bg-[var(--dashboard-surface-2)] p-5 lg:border-t-0 lg:border-l">
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
  children,
}: {
  numero: number;
  titre: string;
  /** Étape pas encore atteignable — visible mais grisée, cf. talon "visible une fois..." de la référence. */
  verrouillee?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl card-tint p-4 shadow-[0_8px_20px_-6px_rgba(20,18,32,0.18)] transition ${verrouillee ? "opacity-40" : ""}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#141220] text-[11px] font-bold text-white dark:bg-brand-pink">
          {numero}
        </span>
        <p className="text-sm font-semibold">{titre}</p>
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

function ChoixPill({
  actif,
  onClick,
  disabled,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-full border px-3 py-2 text-[11px] font-semibold transition disabled:cursor-not-allowed ${
        actif
          ? "border-brand-pink bg-brand-pink/10 text-brand-pink"
          : "border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/70 hover:bg-[var(--dashboard-text)]/[0.04]"
      }`}
    >
      {children}
    </button>
  );
}

function CarteChoix({
  actif,
  disabled,
  icone,
  titre,
  sousTitre,
  onClick,
}: {
  actif: boolean;
  disabled?: boolean;
  icone: React.ReactNode;
  titre: string;
  sousTitre: string;
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
      <span className="text-[10px] leading-snug text-[var(--dashboard-text)]/45">{sousTitre}</span>
    </button>
  );
}

function RecapBloc({ titre, couleur, children }: { titre: string; couleur: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border-l-[3px] bg-[var(--dashboard-card-bg)]" style={{ borderColor: couleur }}>
      <div className="flex items-center gap-1.5 px-2.5 pt-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: couleur }} />
        <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: couleur }}>{titre}</p>
      </div>
      <div className="space-y-1 p-2.5">{children}</div>
    </div>
  );
}

function RecapLigne({ label, valeur }: { label: string; valeur: React.ReactNode }) {
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

function EntrepotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10 12 4l9 6v9H3z" />
      <path d="M9 19v-6h6v6" />
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
