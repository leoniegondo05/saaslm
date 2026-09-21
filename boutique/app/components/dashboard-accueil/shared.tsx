"use client";

import { Children, useEffect, useId, useState } from "react";
import { useDashboardLangue } from "../DashboardLanguageProvider";
import { useFiltrable, useRecherche } from "../DashboardRecherche";

/*
  Petits composants d'appui partagés par toutes les sections de l'onglet
  "Accueil" (Finances, Commandes, Clients, Litiges, Stock, Produits,
  Partenaire) — extraits de app/dashboard/accueil/page.tsx pour que chaque
  section vive dans son propre fichier sans dupliquer Card/StatRow/Tag/etc.
*/

/*
  Isole les chiffres d'une phrase (ex. "Votre délai de suspension : 72 h")
  pour leur appliquer "font-figures" sans toucher au reste du texte, sans
  avoir à découper chaque traduction FR/EN à la main (ordre des mots
  différent selon la langue) — un même passage à travers un split regex
  marche pour les deux. Partagé (pas juste dashboard/page.tsx) : toute
  phrase du dashboard qui mélange texte et chiffre(s) passe par ici plutôt
  que par une classe posée à la main sur un fragment de string.
*/
// Connecteurs courts coincés ENTRE deux chiffres ("17 h 05", "07:42",
// "6 sur 8") sont inclus dans le même bloc que les chiffres : sinon le
// connecteur, hors du split, hérite du gras du parent (souvent plus fort
// que le poids "chiffres") — il ressort plus gras que les chiffres qu'il
// sépare, ce qui saute aux yeux. Deux types couverts :
//  - symboles ":"/"/"−" directement collés à un chiffre (heure "07:42",
//    plage) — même classe que "," / "." / espace (déjà utilisés pour les
//    séparateurs de milliers "1 480").
//  - mots-connecteurs courts (h/min/mn/j/s = unités, "sur" = fraction/ratio
//    "6 sur 8", + les noms de mois FR/EN pour "4 mars 2025" en un seul
//    bloc), whitelist stricte (pas un \w+ générique — testé : un \w+
//    générique avale aussi "et"/"à" dans "entre 3 et 12 heures"/"de 5 à 10
//    jours", donc écarté) pour ne jamais absorber un vrai mot français pris
//    en sandwich entre deux nombres qui n'a rien à voir ("7 litiges sur 26" :
//    "litiges" reste hors figures, seul "sur" — juste avant le second
//    chiffre — est absorbé).
const MOIS = "janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|January|February|March|April|May|June|July|August|September|October|November|December|janv\\.?|févr\\.?|avr\\.?|juil\\.?|sept\\.?|oct\\.?|nov\\.?|déc\\.?";
const RE_CHIFFRES = new RegExp(`(\\d+(?:[.,:/\\-\\s]\\d+|\\s?(?:h|min|mn|j|s|sur|${MOIS})\\s?\\d+)*)`, "g");

export function texteAvecChiffres(texte: string) {
  return texte.split(RE_CHIFFRES).map((partie, i) =>
    /\d/.test(partie) ? (
      <span key={i} className="font-figures">
        {partie}
      </span>
    ) : (
      partie
    )
  );
}

/*
  Export "Exporter" — utilisé par chaque section (Finances, Commandes,
  Clients, Litiges, Stock, Produits, Partenaire, Confidentialité) : même
  recette partout pour ne pas la réécrire à chaque section. Un CSV brut ne
  porte aucune couleur ; ici on ouvre un document HTML autonome, aux
  couleurs LIIVRE MOI exactes (cf. mémoire [[charte-graphique-livre-moi]] :
  bleu nuit #011847, rose fuchsia #EC0C8C, indigo #3A1D8A, blanc cassé
  #FAF7FC, police Sora), puis on déclenche l'impression : l'utilisateur
  choisit "Enregistrer en PDF" dans la boîte de dialogue native du
  navigateur — un vrai PDF propre, sans dépendance ajoutée au projet. Les
  chiffres exportés sont ceux déjà affichés à l'écran (cf.
  [[dashboard-mock-data-pending-laravel-api]], mock en attendant l'API
  Laravel), donc pas d'appel réseau ici.
*/
export type ExportSection = {
  heading: string;
  columns?: string[];
  rows: (string | number)[][];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function openBrandedReport(title: string, subtitle: string, sections: ExportSection[]) {
  const win = window.open("", "_blank");
  if (!win) return; // bloqueur de popup : on abandonne plutôt que de planter

  const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const sectionsHtml = sections
    .map(
      (s) => `
      <h2>${escapeHtml(s.heading)}</h2>
      <table>
        ${s.columns ? `<thead><tr>${s.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>` : ""}
        <tbody>
          ${s.rows
            .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(String(c))}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>`
    )
    .join("");

  win.document.write(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');
  :root { --navy: #011847; --pink: #EC0C8C; --indigo: #3A1D8A; --offwhite: #FAF7FC; --slate: #5A6072; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; background: var(--offwhite); color: #000; font-family: Sora, sans-serif; }
  header { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 3px solid var(--pink); margin-bottom: 24px; }
  .logo { width: 44px; height: 44px; flex-shrink: 0; }
  .wordmark { margin: 0; font-family: Sora, sans-serif; font-size: 15px; font-weight: 700; color: var(--navy); letter-spacing: .01em; }
  .wordmark .o { color: var(--pink); }
  h1 { margin: 2px 0 0; font-family: Sora, sans-serif; font-size: 19px; font-weight: 700; color: #000; }
  .subtitle { margin: 3px 0 0; font-size: 11px; color: var(--slate); }
  h2 { margin: 26px 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--indigo); }
  h2:first-of-type { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 7px 10px; text-align: left; border-bottom: 1px solid rgba(1,24,71,0.1); }
  th { font-weight: 600; color: var(--navy); background: rgba(236,12,140,0.06); }
  tr:last-child td { border-bottom: none; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid rgba(1,24,71,0.1); font-size: 9px; color: var(--slate); }
  @media print { body { padding: 18px; } }
</style>
</head>
<body>
  <header>
    <img class="logo" src="${window.location.origin}/images/logo.svg" alt="LIIVRE MOI" />
    <div>
      <p class="wordmark">LIIVRE M<span class="o">O</span>I</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="subtitle">${escapeHtml(subtitle)}</p>
    </div>
  </header>
  ${sectionsHtml}
  <footer>Exporté le ${escapeHtml(dateStr)} · données de la période affichée à l'écran</footer>
</body>
</html>`);
  win.document.close();
  win.focus();
  win.onload = () => win.print();
  setTimeout(() => win.print(), 400); // filet si onload ne se déclenche pas (document.write direct)
}

/*
  Galerie image d'un produit style e-commerce : miniatures verticales à
  gauche (desktop) / horizontales en bas (mobile), grande image principale
  au centre avec fond sombre violet, badge "Vidéo" + compteur N/total +
  icône loupe + points de navigation. Utilisé sur la fiche produit du
  catalogue drop (FicheProduitDrop.tsx) et l'aperçu partenaire.
  Défilement auto (3 s) quand plus d'une image.
*/
export function ProduitCarousel({ images, videoUrl }: { images: string[]; videoUrl?: string }) {
  const { t } = useDashboardLangue();
  const [index, setIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const count = images.length;
  const totalSlides = (videoUrl ? 1 : 0) + count;
  const THUMBS_VISIBLE = 4;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % totalSlides), 3000);
    return () => clearInterval(id);
  }, [totalSlides]);

  // Slides : vidéo en premier si présente, puis images
  const slides: Array<{ type: "video"; src: string } | { type: "image"; src: string }> = [
    ...(videoUrl ? [{ type: "video" as const, src: videoUrl }] : []),
    ...images.map((src) => ({ type: "image" as const, src })),
  ];

  const currentSlide = slides[index];

  const scrollThumbs = (dir: 1 | -1) => {
    setThumbStart((s) => Math.max(0, Math.min(s + dir, Math.max(0, slides.length - THUMBS_VISIBLE))));
  };

  return (
    <div className="overflow-hidden flex flex-col gap-3 sm:flex-row sm:gap-4">
      {/* ── Miniatures verticales (desktop : colonne gauche) ── */}
      <div className="order-2 flex flex-row gap-2 sm:order-1 sm:flex-col">
        {/* Flèche haut — desktop seulement */}
        <button
          type="button"
          onClick={() => scrollThumbs(-1)}
          disabled={thumbStart === 0}
          aria-label={t("Monter", "Scroll up")}
          className="hidden sm:flex h-7 w-16 items-center justify-center rounded-lg bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/40 transition hover:text-[var(--dashboard-text)] disabled:opacity-20"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 -rotate-90 sm:rotate-0">
            <path d="m5 15 7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Vignettes */}
        <div className="flex flex-row gap-2 sm:flex-col">
          {slides.slice(thumbStart, thumbStart + THUMBS_VISIBLE).map((slide, i) => {
            const realIdx = thumbStart + i;
            const active = realIdx === index;
            return (
              <button
                key={realIdx}
                type="button"
                onClick={() => setIndex(realIdx)}
                aria-label={slide.type === "video" ? t("Vidéo", "Video") : t(`Image ${realIdx + 1}`, `Image ${realIdx + 1}`)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-[72px] sm:w-[72px] ${
                  active
                    ? "border-brand-pink shadow-[0_0_0_1px_#EC0C8C]"
                    : "border-[var(--dashboard-text)]/10 opacity-60 hover:opacity-90"
                }`}
                style={
                  slide.type === "image"
                    ? { backgroundImage: `url(${slide.src})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: "linear-gradient(135deg, #3B1FA8 0%, #1B1E72 60%, #0A0E28 100%)" }
                }
              >
                {slide.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5 drop-shadow">
                      <path d="M8 5v14l11-7L8 5Z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Flèche bas — desktop seulement */}
        <button
          type="button"
          onClick={() => scrollThumbs(1)}
          disabled={thumbStart + THUMBS_VISIBLE >= slides.length}
          aria-label={t("Descendre", "Scroll down")}
          className="hidden sm:flex h-7 w-16 items-center justify-center rounded-lg bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/40 transition hover:text-[var(--dashboard-text)] disabled:opacity-20"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 -rotate-90 sm:rotate-0">
            <path d="m19 9-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Grande image principale ── */}
      <div className="relative order-1 flex-1 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#3B1FA8_0%,#1B1E72_50%,#0A0E28_100%)] sm:order-2">
        {/* Slide actif */}
        {currentSlide?.type === "image" && (
          <img
            key={index}
            src={currentSlide.src}
            alt={t(`Image du produit ${index + 1}`, `Product image ${index + 1}`)}
            className="h-64 w-full object-contain sm:h-[340px]"
            draggable={false}
          />
        )}
        {currentSlide?.type === "video" && (
          <video
            src={currentSlide.src}
            className="h-64 w-full object-cover sm:h-[340px]"
            muted
            loop
            autoPlay
            playsInline
          />
        )}
        {!currentSlide && (
          <div className="flex h-64 w-full items-center justify-center sm:h-[340px]">
            <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14 text-white/20">
              <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="21" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="m6 33 10-8 8 6 6-5 12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Badge Vidéo (coin haut gauche) */}
        {currentSlide?.type === "video" && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
              <path d="M8 5v14l11-7L8 5Z" />
            </svg>
            {t("Vidéo", "Video")}
          </span>
        )}

        {/* Compteur N/total (coin haut droit) */}
        {totalSlides > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {index + 1}/{totalSlides}
          </span>
        )}

        {/* Loupe (coin bas droit) */}
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={t("Agrandir", "Zoom in")}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#141220] shadow transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Points de navigation (bas centre) */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t(`Aller à la slide ${i + 1}`, `Go to slide ${i + 1}`)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox zoom ── */}
      {zoomed && currentSlide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("Vue agrandie", "Zoomed view")}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label={t("Fermer", "Close")}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>
          {currentSlide.type === "image" ? (
            <img
              src={currentSlide.src}
              alt={t("Vue agrandie du produit", "Zoomed product view")}
              className="max-h-full max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          ) : (
            <video
              src={currentSlide.src}
              className="max-h-full max-w-full rounded-2xl object-contain"
              muted
              loop
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  count,
  first = false,
  layout = "stack",
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  count?: string;
  first?: boolean;
  /** "stack": badge au-dessus du titre (défaut). "inline": badge / titre sur une même ligne. */
  layout?: "stack" | "inline";
  /** Boutons optionnels à droite du header (ex: "Exporter", "Comparer à la période précédente"). */
  actions?: React.ReactNode;
}) {
  const badge = (
    <span
      className="inline-flex rounded-full p-px shadow-[0_2px_12px_rgba(20,18,32,0.05)]"
      style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-card-bg)]/80 px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-text)] backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.6)]" />
        {eyebrow}
      </span>
    </span>
  );

  return (
    <div className={first ? "mt-8" : "mt-12"}>
      <div className={`flex flex-wrap items-start justify-between gap-3 ${layout === "inline" ? "mb-12" : "mb-4"}`}>
      {layout === "inline" ? (
        // basis-full (en dessous de sm) : sans ça, ce groupe (flex-1 +
        // min-w-0) se laissait écraser à une largeur quasi nulle par les
        // boutons `actions` à droite (eux "shrink-0") au lieu de passer à
        // la ligne — le flex-wrap du parent ne se déclenchait jamais
        // puisque min-w-0 rendait "tout tenir sur une ligne" toujours
        // possible, juste illisible (titre/sous-titre en un mot par
        // ligne). basis-full force ce groupe à occuper toute la largeur
        // sur mobile, ce qui pousse `actions` sur sa propre ligne.
        <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-auto">
          {badge}
          <span className="text-lg font-light text-[var(--dashboard-text)]/20">/</span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight sm:text-base">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">{subtitle}</p>}
          </div>
        </div>
      ) : (
        <div>
          {badge}
          <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--dashboard-text)]/50">{subtitle}</p>}
        </div>
      )}
      {actions ? (
        <div className="mt-5 flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
      ) : (
        count && (
          <span className="rounded-full bg-[var(--dashboard-card-bg)]/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[var(--dashboard-text)]/40 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
            {count}
          </span>
        )
      )}
      </div>
    </div>
  );
}

/*
  Bouton pilule contour dégradé — pour les actions de header ("Exporter",
  "Comparer à la période précédente") du document envoyé. Même recette que
  le badge "solution LM" (DashboardHeader) et l'onglet actif d'AccueilNav :
  span extérieur en dégradé + p-px = liseré, span/bouton intérieur en fond
  plein pour l'effet "contour de couleur" sans le remplir.
  Distinct de Btn (qui est toujours pleine largeur, pensé pour les CTA de
  carte) : celui-ci reste à sa largeur de contenu, pour s'aligner en ligne.
*/
export function HeaderActionBtn({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative inline-flex shrink-0 rounded-full p-px transition-all shadow-[0_2px_12px_rgba(20,18,32,0.05)] hover:opacity-95 disabled:cursor-default disabled:opacity-60 disabled:hover:opacity-60"
      style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}
    >
      <span className="inline-flex items-center rounded-full bg-[var(--dashboard-card-bg)]/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--dashboard-text)] backdrop-blur-md transition group-hover:bg-[var(--dashboard-card-bg)]/70 group-disabled:group-hover:bg-[var(--dashboard-card-bg)]/90">
        {children}
      </span>
    </button>
  );
}

export function Card({
  title,
  badge,
  badgeAlign = "right",
  titleAlign = "center",
  titleTab = false,
  titleUppercase = true,
  titleFont = "sans",
  className = "",
  style,
  children,
}: {
  title?: string;
  badge?: React.ReactNode;
  /** Position du badge quand titleTab est actif. Défaut: "right". */
  badgeAlign?: "left" | "right";
  /** Position de l'étiquette de titre quand titleTab est actif. Défaut: "center". */
  titleAlign?: "left" | "center";
  /** Titre affiché en étiquette centrée (façon "onglet"), comme la carte Trésorerie disponible. */
  titleTab?: boolean;
  /** Casse du titre en étiquette. Défaut: majuscules. Mis à false sur Réglages (retour utilisateur du 2026-09-17). */
  titleUppercase?: boolean;
  /** Police du titre en étiquette. Défaut: Sora (--font-sans). "inter" mis sur Réglages (retour utilisateur du 2026-09-17, hors charte graphique). */
  titleFont?: "sans" | "inter";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  // Se cache seule quand une recherche est active (DashboardSearchBar) et
  // qu'aucun texte affiché ici — titre, StatRow, Table... peu importe — ne
  // la contient. Sans effet hors d'Accueil/Réglages (RechercheProvider),
  // cf. DashboardRecherche.tsx.
  const { ref, match } = useFiltrable();
  return (
    <div
      ref={ref}
      className={`rounded-2xl card-tint border border-[var(--dashboard-text)]/10 p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] ${className}`}
      style={match ? style : { ...style, display: "none" }}
    >
      {title && titleTab && (
        <div className={`relative -mt-4 mb-5 flex items-center ${titleAlign === "left" ? "justify-start" : "justify-center"}`}>
          <p
            className={`rounded-b-lg px-3 py-1.5 font-semibold text-[var(--dashboard-text)] ${titleUppercase ? "text-[10px] uppercase tracking-[0.16em]" : "text-[13px] tracking-normal"}`}
            style={{ background: "var(--dashboard-surface-2)", fontFamily: titleFont === "inter" ? "var(--font-inter)" : "var(--font-sans)" }}
          >
            {title}
          </p>
          {badge && (
            <div className={`absolute top-2 ${badgeAlign === "left" ? "left-0" : "right-0"}`}>{badge}</div>
          )}
        </div>
      )}
      {title && !titleTab && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text)]">{title}</p>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

/*
  Réduit une longue pile de cards à `visibleCount` (les premières restent
  toujours visibles), le reste passant sous un fondu + bouton "Voir tout le
  contenu" — pour qu'une section (Finances, Commandes...) ne noie pas
  l'écran au premier chargement. Chaque enfant = un bloc déjà assemblé par
  la section (une Card seule, ou une rangée à deux colonnes) : la logique
  ignore leur contenu, elle ne fait que couper la liste. Ne rend rien de
  spécial si la section a peu de blocs (<= visibleCount) : pas de bouton
  inutile pour 2-3 cards.
*/
export function CollapsibleCards({
  children,
  visibleCount = 3,
}: {
  children: React.ReactNode;
  visibleCount?: number;
}) {
  const { t } = useDashboardLangue();
  const [open, setOpen] = useState(false);

  // Une recherche active (DashboardSearchBar) force l'ouverture : une Card
  // qui matche le terme mais qui tombe après `visibleCount` se cache "seule"
  // en display:block (cf. useFiltrable) mais restait piégée sous max-h-28 —
  // invisible malgré le match, ce qui donnait l'impression que la recherche
  // ne trouvait rien. `open` manuel toujours respecté par-dessus (`||`).
  const recherche = useRecherche();
  const effectiveOpen = open || recherche !== "";
  const blocks = Children.toArray(children);

  if (blocks.length <= visibleCount) return <>{blocks}</>;

  const shown = blocks.slice(0, visibleCount);
  const hidden = blocks.slice(visibleCount);

  return (
    <>
      {shown}
      <div className="relative">
        <div
          className={`grid gap-3 overflow-hidden transition-[max-height] duration-500 ease-in-out ${
            effectiveOpen ? "max-h-[20000px]" : "max-h-28"
          }`}
        >
          {hidden}
        </div>
        {!effectiveOpen && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            style={{ background: "linear-gradient(to bottom, transparent, var(--dashboard-bg) 80%)" }}
          />
        )}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={effectiveOpen}
          className="relative -mt-1 flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(236,12,140,0.35)] transition hover:bg-brand-pink/90"
        >
          {effectiveOpen ? t("Réduire", "Show less") : t(`Voir tout le contenu (+${hidden.length})`, `Show all content (+${hidden.length})`)}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`h-3 w-3 shrink-0 transition-transform ${effectiveOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}

export function StatRow({
  label,
  value,
  bold = true,
  light = false,
  compact = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  bold?: boolean;
  light?: boolean;
  /** Espacement réduit (mt-1 au lieu de mt-2.5), pour cards à liste longue. */
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mt-1 flex items-center justify-between gap-3 text-xs first:mt-1" : "mt-2.5 flex items-center justify-between gap-3 text-xs first:mt-3"}>
      <span className={light ? "text-white/55" : "text-[var(--dashboard-text)]/50"}>{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${compact ? "text-[var(--dashboard-text)]" : ""}`.trim()}>{value}</span>
    </div>
  );
}

export function LegendRow({ color, label, value, badge }: { color: string; label: string; value: React.ReactNode; badge?: string }) {
  return (
    <div className="text-xs">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className="font-semibold font-figures">{value}</span>
        {badge ? (
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[var(--dashboard-text)]/30 text-[8px] font-semibold text-[var(--dashboard-text)]/60">
            {badge}
          </span>
        ) : null}
      </span>
      <p className="mt-0.5 pl-4 text-[10px] leading-tight text-[var(--dashboard-text)]/40">{label}</p>
    </div>
  );
}

export function Divider() {
  return <div className="my-3 h-px bg-[var(--dashboard-text)]/10" />;
}

export function Bar({ pct, color = "bg-brand-pink", background, height = "h-1.5" }: { pct: number; color?: string; background?: string; height?: string }) {
  return (
    <div className={`mt-1.5 ${height} w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]`}>
      <div
        className={`h-full rounded-full ${background ? "" : color}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, ...(background ? { background } : {}) }}
      />
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className = "",
  style,
}: {
  children: React.ReactNode;
  tone?: "pink" | "ok" | "warn" | "ko" | "blue" | "neutral" | "dark";
  className?: string;
  style?: React.CSSProperties;
}) {
  const tones: Record<string, string> = {
    pink: "bg-brand-pink/10 text-brand-pink",
    ok: "bg-[#dcf5e3] text-[#178a3f]",
    warn: "bg-[#fff1d6] text-[#a8690a]",
    ko: "bg-[#ffe1e2] text-[#c8262d]",
    blue: "bg-brand-purple/10 text-brand-purple",
    neutral: "bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60",
    dark: "bg-[var(--dashboard-text)]/[0.08] text-[var(--dashboard-text)]/70",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tones[tone]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

/*
  Badge par carte reflétant le toggle S/D/B de ClientsSection.tsx
  (typeAchat) — même convention que le <Nature code="B" /> posé à côté de
  chaque titre de carte dans CommandesSection/ProduitsSection : juste le
  carré de couleur, le sens (S/D/B) est expliqué une seule fois par la
  légende de section (cf. ClientsSection.tsx), pas répété en toutes lettres
  sur chaque carte.
*/
export function TypeAchatTag({ typeAchat }: { typeAchat: "stockage" | "dropshipping" | "les-deux" }) {
  const code = typeAchat === "stockage" ? "S" : typeAchat === "dropshipping" ? "D" : "B";
  return <Nature code={code} />;
}

export function Btn({
  children,
  variant = "outline",
  className = "",
  style,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "dark" | "outline" | "white";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    dark: "bg-[#141220] text-white dark:bg-brand-pink",
    outline: "border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-card-bg)]/60 text-[var(--dashboard-text)]",
    white: "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)] shadow-[0_2px_10px_rgba(20,18,32,0.08)]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-full px-4 py-2.5 text-center text-xs font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function Nature({ code }: { code: "S" | "P" | "L" | "O" | "D" | "B" }) {
  const styles: Record<string, string> = {
    // Stockage = bleu (cf. [[dashboard-chart-colors-stockage-drop]]) — même
    // bleu que STOCK_COLOR dans CommandesSection.tsx, jamais de gris neutre.
    S: "bg-[#5AA9FF]/10 text-[#5AA9FF]",
    P: "bg-brand-purple/10 text-brand-purple",
    L: "bg-brand-pink/10 text-brand-pink",
    O: "border border-[var(--dashboard-text)]/15 text-[var(--dashboard-text)]/40",
    D: "bg-brand-pink/10 text-brand-pink",
    // "Les deux" (stockage + drop) — commandes qui mélangent les deux
    // façons de vendre, cf. légende de CommandesSection.
    B: "border border-[var(--dashboard-text)]/15 bg-[var(--dashboard-text)]/[0.06] text-[var(--dashboard-text)]/60",
  };
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${styles[code]}`}>
      {code}
    </span>
  );
}

export function MiniStat({
  label,
  value,
  tone,
  previous,
  previousLabel,
}: {
  label: string;
  value: string;
  tone?: "pink";
  /** Valeur de la période précédente, affichée quand "Comparer à la période
   *  précédente" est actif (cf. FinancesSection). */
  previous?: string;
  previousLabel?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className={`mt-0.5 text-base font-figures-bold ${tone === "pink" ? "text-brand-pink" : ""}`}>{value}</p>
      {previous && <p className="mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{previousLabel} : {previous}</p>}
    </div>
  );
}

export function MiniTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl card-tint p-3 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)]">
      <p className="text-[10px] text-[var(--dashboard-text)]/40">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
      <p className="mt-auto pt-0.5 text-[9px] text-[var(--dashboard-text)]/40">{note}</p>
    </div>
  );
}

export function QuickStat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "ko" }) {
  return (
    <div className="rounded-xl bg-[var(--dashboard-card-bg)] p-2.5 text-center">
      <p className="text-[9px] text-[var(--dashboard-text)]/40">{label}</p>
      <p
        className={`mt-0.5 text-center text-sm font-bold ${
          tone === "ok" ? "text-[#178a3f]" : tone === "ko" ? "text-[#c8262d]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function PayRow({ label, color, value, pct }: { label: string; color: string; value: string; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-[var(--dashboard-text)]/70">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--dashboard-text)]/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function FailRow({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--dashboard-text)]/50">{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

export function CommuneRow({
  label,
  pct,
  value,
  barColor = "bg-[var(--dashboard-text)]/50",
}: {
  label: string;
  pct: number;
  value: string;
  barColor?: string;
}) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {pct} % · {value}
        </span>
      </div>
      <Bar pct={pct} color={barColor} />
    </div>
  );
}

export function ClientRow({
  name,
  zone,
  value,
  orders,
  pct,
  showCommandeLabel = false,
  barColor = "bg-[#FFC2E2]",
}: {
  name: string;
  zone: string;
  value: string;
  orders: number;
  pct: number;
  /** Affiche "commande(s)" en toutes lettres derrière le nombre (réservé à la première ligne). */
  showCommandeLabel?: boolean;
  barColor?: string;
}) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>
          {name} · {zone}
        </span>
        <span>
          <span className="font-semibold">{value}</span>
          <span className="text-[var(--dashboard-text)]/40">
            {" "}
            · {orders}
            {showCommandeLabel ? ` commande${orders > 1 ? "s" : ""}` : ""}
          </span>
        </span>
      </div>
      <Bar pct={pct} color={barColor} />
    </div>
  );
}

export function RatingRow({ label, value, pct, color = "bg-[var(--dashboard-text)]" }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-[var(--dashboard-text)]/40">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

export function SourceRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {value} · {pct} %
        </span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

export function TopProductRow({ code, name, value, pct, background }: { code: "S" | "P" | "L" | "O"; name: string; value: string; pct: number; background?: string }) {
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" background={background} />
    </div>
  );
}

export function NatureRow({
  code,
  name,
  value,
  note,
  last = false,
}: {
  code: "S" | "P" | "L" | "O" | "D";
  name: string;
  value: string;
  note: string;
  last?: boolean;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <p className="ml-7 mt-0.5 text-[10px] text-[var(--dashboard-text)]/40">{note}</p>
      {!last && <Divider />}
    </>
  );
}

export function ProductSelector({
  name,
  position,
  dark = false,
  className = "",
  onPrev,
  onNext,
}: {
  name: string;
  position: string;
  dark?: boolean;
  className?: string;
  /** Optionnels : sans eux les flèches restent décoratives (comportement historique). */
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { t } = useDashboardLangue();
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-1.5 py-1 ${
        dark ? "border-white/20 bg-white/10" : "border-brand-pink/30 bg-brand-pink/5"
      } ${className}`}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!onPrev}
        aria-label={t("Produit précédent", "Previous product")}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 text-center leading-tight">
        <span className={`block truncate text-[10px] font-semibold ${dark ? "text-white" : ""}`}>{texteAvecChiffres(name)}</span>
        <span className={`block text-[8px] ${dark ? "text-white/50" : "text-[var(--dashboard-text)]/40"}`}>{texteAvecChiffres(position)}</span>
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        aria-label={t("Produit suivant", "Next product")}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-[var(--dashboard-card-bg)] text-[var(--dashboard-text)]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
          <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function Trend({ values }: { values?: number[] }) {
  const data = values && values.length ? values : [3, 5, 4, 8];
  const w = 40;
  const h = 20;
  const pad = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * w,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }));
  // Interpolation cubique monotone (Fritsch-Carlson) : contrairement à
  // Catmull-Rom, la tangente est nulle à chaque pic/creux, donc pas de
  // dépassement (l'ancien rendu créait des "hameçons" autour des extrema).
  const n = points.length;
  const dx = n > 1 ? points[1].x - points[0].x : 0;
  const secants: number[] = [];
  for (let k = 0; k < n - 1; k++) secants.push((points[k + 1].y - points[k].y) / (dx || 1));
  const tangents: number[] = new Array(n).fill(0);
  if (n > 1) {
    tangents[0] = secants[0];
    tangents[n - 1] = secants[n - 2];
    for (let k = 1; k < n - 1; k++) tangents[k] = (secants[k - 1] + secants[k]) / 2;
    for (let k = 0; k < n - 1; k++) {
      if (secants[k] === 0) {
        tangents[k] = 0;
        tangents[k + 1] = 0;
        continue;
      }
      const alpha = tangents[k] / secants[k];
      const beta = tangents[k + 1] / secants[k];
      if (alpha < 0) tangents[k] = 0;
      if (beta < 0) tangents[k + 1] = 0;
      const sq = alpha * alpha + beta * beta;
      if (sq > 9) {
        const tau = 3 / Math.sqrt(sq);
        tangents[k] = tau * alpha * secants[k];
        tangents[k + 1] = tau * beta * secants[k];
      }
    }
  }
  let d = `M ${points[0].x},${points[0].y}`;
  for (let k = 0; k < n - 1; k++) {
    const p0 = points[k];
    const p1 = points[k + 1];
    const cp1x = p0.x + dx / 3;
    const cp1y = p0.y + (tangents[k] * dx) / 3;
    const cp2x = p1.x - dx / 3;
    const cp2y = p1.y - (tangents[k + 1] * dx) / 3;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
  }
  const last = points[points.length - 1];
  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const avgY = h - pad - ((avg - min) / range) * (h - pad * 2);
  const area = `${d} L ${last.x},${h} L ${points[0].x},${h} Z`;
  const uid = useId();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-5 w-10 overflow-visible" aria-hidden fill="none">
      <defs>
        <linearGradient id={`trend-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-pink)" stopOpacity={0.32} />
          <stop offset="100%" stopColor="var(--color-brand-pink)" stopOpacity={0} />
        </linearGradient>
        <filter id={`trend-glow-${uid}`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1={0}
        y1={avgY}
        x2={w}
        y2={avgY}
        stroke="var(--dashboard-text)"
        strokeOpacity={0.18}
        strokeWidth={0.6}
        strokeDasharray="1.2 1.4"
      />
      <path d={area} fill={`url(#trend-fill-${uid})`} stroke="none" />
      <path d={d} stroke="var(--color-brand-pink)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.4} fill="var(--color-brand-pink)" fillOpacity={0.35} filter={`url(#trend-glow-${uid})`} />
      <circle cx={last.x} cy={last.y} r={1.5} fill="var(--color-brand-pink)" />
    </svg>
  );
}

// Bruit déterministique (même formule fractale que le fake-noise GLSL
// classique) : pas de Math.random, donc pas de désaccord SSR/hydratation
// et le graphe reste identique à chaque rendu.
function pseudoNoise(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

/*
  Seed déterministe dérivé de la période choisie sur le sélecteur
  année/mois/jour du DashboardHeader (cf. [[dashboard-mock-data-pending-laravel-api]]
  — mock en attendant l'API Laravel) : permet à chaque section (Finances,
  Commandes, Clients, Litiges, Stock, Produits, Partenaire) de faire varier
  ses chiffres selon la période affichée, sans dépendre de Math.random
  (SSR/hydratation identiques) ni d'un vrai backend. Une même date donne
  toujours le même seed, donc les mêmes chiffres.
*/
export function periodSeed(date: Date): number {
  return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
}

// 1er août 2026 : date par défaut du sélecteur (DashboardHeader,
// app/dashboard/accueil/page.tsx) et donc de tout premier rendu, sans clic
// utilisateur — les chiffres mock ont été calés sur la maquette ("Écran 02 ·
// Accueil", cf. [[dashboard-mock-data-pending-laravel-api]]) pour CETTE
// date précise. scaleForPeriod court-circuite le bruit à cette période pour
// que le premier rendu affiche exactement ces chiffres, identiques à la
// maquette ; seul un vrai changement de période (clic année/mois/jour) les
// fait varier.
const BASELINE_SEED = periodSeed(new Date(2026, 7, 1));

/*
  Fait varier `base` d'un facteur déterministe dans [1 - variance, 1 +
  variance] selon `seed` (cf. periodSeed) et `key` (un nombre arbitraire par
  statistique, pour que deux stats de la même carte ne bougent pas à
  l'identique). Résultat arrondi à l'entier le plus proche — les mock actuels
  sont tous des quantités/montants entiers. À la période par défaut
  (BASELINE_SEED), renvoie `base` tel quel (cf. commentaire ci-dessus).
*/
export function scaleForPeriod(base: number, seed: number, key = 0, variance = 0.35): number {
  if (seed === BASELINE_SEED) return base;
  const factor = 1 - variance + pseudoNoise(seed * 12.9898 + key * 78.233) * variance * 2;
  return Math.round(base * factor);
}

/*
  Grand graphe en aire (Trésorerie / Trésorerie attendue), façon ticker
  boursier (cf. capture Yahoo Finance envoyée) : segments DROITS (pas de
  lissage Bézier) subdivisés en micro-dents façon cours de bourse — chaque
  point réel (un jour) reste exact, les points intermédiaires zigzaguent
  autour du segment. Aire en dégradé qui s'évanouit vers le bas, seul le
  dernier point est marqué (point plein + halo).
*/
export function AreaChart({
  values,
  color = "#22C55E",
  markers = [],
  compareValues,
  compareColor,
  gapColor,
  glow = false,
  grid = false,
}: {
  values: number[];
  color?: string;
  /** Indices (dans `values`) des points "fin de suspension" : trait vertical pointillé + point blanc, comme sur le document envoyé. */
  markers?: number[];
  /** Deuxième courbe superposée sur la même échelle (ex. "Vendu" face à "Demande" dans StockSection). Quand fourni, remplace le dégradé d'aire par la zone entre les deux courbes. */
  compareValues?: number[];
  compareColor?: string;
  /** Couleur de la zone entre les deux courbes (ex. rouge = vente perdue sur rupture). */
  gapColor?: string;
  /** Halo lumineux sur les courbes + anneau qui pulse autour du dernier point (rendu bourse/trading, cf. [[dashboard-chart-colors-stockage-drop]]). Optionnel : ne change rien aux graphes existants tant que non activé. */
  glow?: boolean;
  /** Trois lignes de quadrillage horizontales, très discrètes, derrière l'aire. */
  grid?: boolean;
}) {
  const data = values;
  const w = 300;
  const h = 100;
  const padY = 6;
  // Échelle commune aux deux séries : sinon "Vendu" et "Demande" ne seraient
  // pas comparables visuellement (chacune étirée sur son propre min/max).
  const allValues = compareValues ? [...data, ...compareValues] : data;
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;
  // Arrondi des coordonnées : Math.sin (utilisé ci-dessous par pseudoNoise
  // et pour le damping) n'est pas garanti bit-à-bit identique entre le
  // moteur JS du serveur (SSR) et celui du navigateur — sans cet arrondi,
  // le `d` du path diffère de quelques ULP et React signale un désaccord
  // d'hydratation même si le tracé est visuellement identique.
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const subSteps = 6;
  const jitter = (h - padY * 2) * 0.05;
  // Subdivision de chaque segment réel en micro-dents : les extrémités
  // (t=0 et t=1) restent exactes, l'intérieur zigzague avec un bruit
  // déterministe dont l'amplitude s'annule aux deux bouts du segment (pas
  // de discontinuité entre segments successifs). `seedBase` décale le bruit
  // d'une série à l'autre pour que deux courbes superposées ne zigzaguent
  // pas de façon identique.
  function buildPoints(series: number[], seedBase: number) {
    const real = series.map((v, i) => ({
      x: round((i / (series.length - 1 || 1)) * w),
      y: round(h - padY - ((v - min) / range) * (h - padY * 2)),
    }));
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < real.length - 1; i++) {
      const p0 = real[i];
      const p1 = real[i + 1];
      for (let s = 0; s < subSteps; s++) {
        const t = s / subSteps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        const damp = Math.sin(t * Math.PI); // 0 aux bouts, max au milieu
        const n = (pseudoNoise(seedBase + i * 12.9898 + s * 3.71) - 0.5) * 2;
        points.push({ x: round(x), y: round(y + n * damp * jitter) });
      }
    }
    points.push(real[real.length - 1]);
    return { real, points };
  }
  const { real, points } = buildPoints(data, 0);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];
  const area = `${d} L ${last.x},${h} L ${points[0].x},${h} Z`;
  const compare = compareValues ? buildPoints(compareValues, 1000) : null;
  const compareD = compare ? compare.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") : null;
  // Zone entre les deux courbes : contour de la première à l'aller, contour
  // de la seconde au retour, refermé — ex. "argent que personne n'a
  // encaissé" entre Demande et Vendu dans StockSection.
  const gapPath = compare
    ? `${d} L ${[...compare.points].reverse().map((p) => `${p.x},${p.y}`).join(" L ")} Z`
    : null;
  // React 18 useId() renvoie des ":" (ex. ":r4:") : légaux en XML mais
  // connus pour casser la résolution de url(#id) dans un gradient/filter
  // sur certains moteurs de rendu — l'élément qui référence l'id invalide
  // n'est alors PAS rendu du tout (comportement spec SVG pour un filter
  // cassé). On nettoie l'id pour rester sur des caractères sans risque.
  const uid = useId().replace(/:/g, "");
  // Les points (marqueurs + dernier point) sortent du SVG : preserveAspectRatio="none"
  // étire x et y avec des échelles différentes, donc un <circle> y devient une
  // ellipse. En overlay HTML (position % + taille fixe en px), le rond reste rond
  // quel que soit l'étirement du graphe.
  return (
    <div className="relative mt-3 h-24 w-full sm:h-28">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden fill="none">
        <defs>
          <linearGradient id={`area-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {glow && compare && (
            <linearGradient id={`gap-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gapColor ?? color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={gapColor ?? color} stopOpacity={0.12} />
            </linearGradient>
          )}
          {glow && (
            // Flou large sous le trait plein : le trait garde des bords nets,
            // le flou seul porte le halo (2 passes SourceGraphic empilées).
            <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        {grid &&
          [0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} y1={h * f} x2={w} y2={h * f} stroke="var(--dashboard-text)" strokeOpacity={0.06} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
        {compare && gapPath ? (
          <path d={gapPath} fill={glow ? `url(#gap-fill-${uid})` : (gapColor ?? color)} fillOpacity={glow ? 1 : 0.35} stroke="none" />
        ) : (
          // fallback "none" après l'IRI : si la réf gradient ne résout jamais,
          // on obtient un remplissage transparent plutôt qu'un aplat noir/blanc
          // par défaut du moteur de rendu.
          <path d={area} fill={`url(#area-fill-${uid}) none`} stroke="none" />
        )}
        <path
          d={d}
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter={glow ? `url(#glow-${uid})` : undefined}
        />
        {compare && compareD && (
          <path d={compareD} stroke={compareColor ?? "#5AA9FF"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )}
        {markers.map((i) => {
          const p = real[i];
          if (!p) return null;
          return (
            <line key={i} x1={p.x} y1={-4} x2={p.x} y2={h} stroke="var(--dashboard-text)" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          );
        })}
      </svg>
      {markers.map((i) => {
        const p = real[i];
        if (!p) return null;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{ left: `${(p.x / w) * 100}%`, top: `${(p.y / h) * 100}%`, width: 4, height: 4, background: "#141220", transform: "translate(-50%,-50%)" }}
          />
        );
      })}
      {glow && (
        <span
          className="absolute animate-ping rounded-full"
          style={{
            left: `${(last.x / w) * 100}%`,
            top: `${(last.y / h) * 100}%`,
            width: 10,
            height: 10,
            background: color,
            opacity: 0.5,
            transform: "translate(-50%,-50%)",
          }}
        />
      )}
      <span
        className="absolute rounded-full"
        style={{
          left: `${(last.x / w) * 100}%`,
          top: `${(last.y / h) * 100}%`,
          width: 5,
          height: 5,
          background: color,
          boxShadow: glow ? `0 0 6px 1px ${color}` : undefined,
          transform: "translate(-50%,-50%)",
        }}
      />
      {compare && compare.points.length > 0 && (
        <span
          className="absolute rounded-full"
          style={{
            left: `${(compare.points[compare.points.length - 1].x / w) * 100}%`,
            top: `${(compare.points[compare.points.length - 1].y / h) * 100}%`,
            width: 5,
            height: 5,
            background: compareColor ?? "#5AA9FF",
            transform: "translate(-50%,-50%)",
          }}
        />
      )}
    </div>
  );
}

/*
  Bandeau "volume" sous l'aire Niveau (StockSection, "Le mouvement de votre
  stock") — même idée qu'un histogramme de volume sous un cours de bourse
  (cf. [[dashboard-chart-colors-stockage-drop]], rendu bourse/trading
  préféré) : une barre par jour, calculée depuis la variation `values[i] -
  values[i-1]`. Dépôt (variation positive) = vert, monte depuis l'axe
  central ; sortie/vente (variation négative) = gris, descend depuis l'axe
  central. Même palette que Niveau (bleu, inchangé) pour que les trois
  couleurs du bandeau de légende gardent chacune un seul sens dans toute la
  carte.
*/
export function MovementBars({
  values,
  positive = "#4FE0AE",
  negative = "#9096AA",
}: {
  values: number[];
  /** Couleur des barres de dépôt (variation positive). */
  positive?: string;
  /** Couleur des barres de sortie (variation négative). */
  negative?: string;
}) {
  const w = 300;
  const h = 36;
  const n = values.length;
  const deltas = [];
  for (let i = 1; i < n; i++) {
    deltas.push({ x: (i / (n - 1)) * w, d: values[i] - values[i - 1] });
  }
  // Échelles séparées dépôts / sorties : les dépôts (deux gros ressauts)
  // sont un ordre de grandeur au-dessus des sorties (petite baisse
  // quotidienne) — une échelle commune écrasait les barres grises à 1-2px.
  // Chaque côté de l'axe central utilise donc son propre maximum, pour que
  // sorties et dépôts restent lisibles l'un comme l'autre.
  const maxPos = Math.max(...deltas.filter((p) => p.d > 0).map((p) => p.d), 1);
  const maxNeg = Math.max(...deltas.filter((p) => p.d < 0).map((p) => Math.abs(p.d)), 1);
  const barW = n > 1 ? (w / (n - 1)) * 0.6 : w;
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-1 h-9 w-full overflow-visible" aria-hidden fill="none">
      <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="var(--dashboard-text)" strokeOpacity={0.1} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      {deltas.map((p, i) => {
        const isDeposit = p.d > 0;
        const ref = isDeposit ? maxPos : maxNeg;
        const half = Math.max((Math.abs(p.d) / ref) * (h / 2 - 2), 2);
        const y = isDeposit ? h / 2 - half : h / 2;
        return (
          <rect
            key={`${uid}-${i}`}
            x={p.x - barW / 2}
            y={y}
            width={barW}
            height={half}
            rx={barW / 2}
            fill={isDeposit ? positive : negative}
            fillOpacity={isDeposit ? 0.95 : 0.75}
          />
        );
      })}
    </svg>
  );
}

/*
  Graphe en cascade (compte de résultat de la période) : chaque colonne est
  soit un total posé depuis 0 (encaissé de départ, résultat net final —
  kind "total"), soit un delta flottant entre le total courant et le
  suivant (kind "delta", amount signé). Les pointillés horizontaux entre
  colonnes relient le sommet d'une barre au départ de la suivante, comme
  dans le document envoyé — pas de lissage, segments droits uniquement.
*/
export function WaterfallChart({
  items,
}: {
  items: { label: string; display: string; amount: number; kind: "total" | "delta" }[];
}) {
  const n = items.length;
  let running = 0;
  const bars = items.map((it) => {
    let start: number;
    let end: number;
    if (it.kind === "total") {
      start = 0;
      end = it.amount;
      running = it.amount;
    } else {
      start = running;
      end = running + it.amount;
      running = end;
    }
    return { ...it, start, end };
  });
  const max = Math.max(...bars.map((b) => Math.max(b.start, b.end))) || 1;
  const colW = 100;
  const w = n * colW;
  const h = 200;
  const topPad = 14;
  const y = (v: number) => topPad + (h - topPad) * (1 - v / max);
  const gap = colW * 0.3;
  const uid = useId();

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-40 w-full overflow-visible sm:h-48" aria-hidden fill="none">
        {bars.slice(0, -1).map((b, i) => {
          const cy = y(b.end);
          const x1 = i * colW + colW - gap / 2;
          const x2 = (i + 1) * colW + gap / 2;
          return (
            <line
              key={`${uid}-c${i}`}
              x1={x1}
              y1={cy}
              x2={x2}
              y2={cy}
              stroke="var(--dashboard-text)"
              strokeOpacity={0.2}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          );
        })}
        {bars.map((b, i) => {
          const x = i * colW + gap / 2;
          const bw = colW - gap;
          const barTop = y(Math.max(b.start, b.end));
          const barBottom = y(Math.min(b.start, b.end));
          const bh = Math.max(barBottom - barTop, 3);
          const color = b.kind === "total" ? (i === 0 ? "#9096AA" : "#4FE0AE") : "#F08289";
          return <rect key={`${uid}-b${i}`} x={x} y={barTop} width={bw} height={bh} rx={5} fill={color} />;
        })}
      </svg>
      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {bars.map((b, i) => (
          <div key={`${uid}-l${i}`} className="text-center">
            <p className="truncate text-[7.5px] leading-tight text-[var(--dashboard-text)]/40 sm:text-[8px]" title={b.label}>
              {b.label}
            </p>
            <p
              className="mt-0.5 truncate text-[8.5px] sm:text-[10px] font-figures-bold"
              style={{ color: b.kind === "delta" ? "#DC3A45" : i === 0 ? undefined : "#0E9F6E" }}
            >
              {b.display}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
  Skeleton d'une Card (cf. Card ci-dessus) : même forme/ombre/arrondi, juste
  un titre + quelques barres en pulse à la place du contenu réel — affiché
  pendant SectionSkeleton (chargement de l'onglet Accueil) avant que les 7
  sections (Finances, Commandes, Clients...) ne se montent.
*/
export function CardSkeleton({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={`rounded-2xl card-tint p-4 shadow-[0_6px_16px_-4px_rgba(20,18,32,0.18)] ${className}`}>
      <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--dashboard-text)]/10" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-[var(--dashboard-text)]/[0.08]"
            style={{ width: `${85 - i * 14}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/*
  Skeleton d'une section entière (badge/titre + grille de CardSkeleton) —
  une par onglet (Finances, Commandes, Clients, Litiges, Stock, Produits,
  Partenaire) pendant le court chargement simulé de l'onglet Accueil (cf.
  [[dashboard-mock-data-pending-laravel-api]] : pas encore de vraie requête
  à attendre, juste le temps de laisser les cartes réelles se monter sans
  à-coup visuel).
*/
export function SectionSkeleton({ first = false, cards = 3 }: { first?: boolean; cards?: number }) {
  return (
    <div className={first ? "mt-8" : "mt-12"}>
      <div className="mb-4 h-7 w-40 animate-pulse rounded-full bg-[var(--dashboard-text)]/10" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} lines={2 + (i % 3)} />
        ))}
      </div>
    </div>
  );
}

/*
  État "saving" pour tout bouton d'action du dashboard (Enregistrer, Créer,
  Envoyer…) qui n'a encore aucun endpoint Laravel derrière lui, cf. mémoire
  [[dashboard-mock-data-pending-laravel-api]]. Sans backend, ces clics
  changeaient l'état instantanément — aucun retour visuel entre le clic et
  la confirmation. Ce hook rejoue le délai qu'un vrai appel réseau aura
  (courte phase "saving" avant "done") pour que le clic donne toujours un
  retour immédiat, quel que soit l'écran.
*/
export function useMockSave(pendingMs = 500, confirmMs = 1800) {
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

  const trigger = (onDone?: () => void) => {
    if (status === "saving") return;
    setStatus("saving");
    setTimeout(() => {
      setStatus("done");
      onDone?.();
      setTimeout(() => setStatus("idle"), confirmMs);
    }, pendingMs);
  };

  return { status, saving: status === "saving", done: status === "done", trigger };
}

export function Table({
  head,
  rows,
  className = "",
  sourceCol,
  evolutions,
  activeIndex,
  onRowClick,
}: {
  head: string[];
  rows: string[][];
  className?: string;
  sourceCol?: number;
  evolutions?: number[][];
  /** Ligne mise en avant (ex: produit sélectionné dans un carousel lié). */
  activeIndex?: number;
  /** Optionnel : rend les lignes cliquables (ex: pour piloter un carousel lié). */
  onRowClick?: (index: number) => void;
}) {
  const { t } = useDashboardLangue();
  // Cellules à faire ressortir en rose (rupture / délai critique) : les
  // valeurs traduites (StockSection) diffèrent des littéraux FR d'origine,
  // donc on matche les deux jeux de chaînes plutôt qu'un seul.
  const URGENT_CELLS = ["Rupture", "1 j", "Out of stock", "1 day"];
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[560px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--dashboard-text)]/10">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                {h}
              </th>
            ))}
            {evolutions && (
              <th className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text)]/40">
                {t("Évolution", "Trend")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
              className={`border-b border-[var(--dashboard-text)]/[0.05] last:border-0 ${onRowClick ? "cursor-pointer" : ""} ${
                activeIndex === i ? "bg-brand-pink/5" : ""
              }`}
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3">
                  {j === 0 ? (
                    <span className="font-semibold">{cell}</span>
                  ) : sourceCol === j ? (
                    <Nature code={cell as "S" | "P" | "L" | "O" | "D" | "B"} />
                  ) : (
                    <span className={URGENT_CELLS.includes(cell) ? "text-brand-pink" : ""}>{cell}</span>
                  )}
                </td>
              ))}
              {evolutions && (
                <td className="py-2 pr-3">
                  <Trend values={evolutions[i]} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
