"use client";

import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { texteAvecChiffres } from "../../dashboard-accueil/shared";
import type { EditeurState, SectionId } from "./types";
import { AVIS_APERCU, PRODUIT_APERCU } from "./types";

/*
  Aperçu en direct de la page de commande, tel que le client la verrait —
  reflète `state` (sections visibles, ordre, style, réglages de chaque
  section) sans aller-retour serveur : tout se voit à l'écran dès qu'un
  réglage change, avant même "Enregistrer" (cf. PersonnaliserBoutique.tsx,
  "modifications en attente").

  Volontairement une page à un seul produit (celui choisi dans la barre du
  haut, ici toujours "Sérum éclat 30 ml") plutôt qu'un site à onglets : c'est
  ce que "Personnaliser ma boutique" habille d'abord, la page que le client
  ouvre depuis un lien produit.
*/

const boutonRadius: Record<string, string> = { carre: "6px", arrondi: "12px", pilule: "999px" };

export default function BoutiquePreview({
  state,
  device,
  boutiqueNom,
  logo,
}: {
  state: EditeurState;
  device: "phone" | "desktop";
  boutiqueNom: string;
  logo: string | null;
}) {
  const { t } = useDashboardLangue();
  const { style } = state;
  const visibles = state.sections.filter((s) => s.visible).map((s) => s.id);

  const vars: React.CSSProperties = {
    ["--ac" as string]: style.couleurPrincipale,
    ["--bg" as string]: style.couleurFond,
    ["--tx" as string]: style.couleurTexte,
    ["--rad" as string]: boutonRadius[style.boutonForme],
    background: style.couleurFond,
    color: style.couleurTexte,
  };

  const contenu = (
    <div style={vars} className="font-sans text-[12.5px] leading-tight">
      {visibles.map((id) => (
        <SectionRendue key={id} id={id} state={state} boutiqueNom={boutiqueNom} logo={logo} t={t} />
      ))}
    </div>
  );

  if (device === "phone") {
    return (
      <div className="mx-auto w-[300px] shrink-0 rounded-[2.4rem] border-[6px] border-[#141220] bg-[#141220] shadow-[0_30px_70px_-12px_rgba(20,18,32,0.45)]">
        <div className="relative h-[600px] overflow-y-auto rounded-[2rem] bg-white">
          <div className="sticky top-0 z-10 flex h-6 items-center justify-center bg-[var(--bg,#fff)]">
            <span className="h-4 w-20 rounded-full bg-[#141220]" />
          </div>
          {contenu}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--dashboard-text)]/10 shadow-[0_30px_70px_-16px_rgba(20,18,32,0.35)]">
      <div className="flex items-center gap-1.5 bg-[#e7e3ee] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9c3d4]" />
        <span className="ml-3 truncate rounded-full bg-white px-3 py-1 text-[10px] text-[#6d6577]">
          …/{boutiqueNom.toLowerCase().replace(/\s+/g, "-")}/serum-eclat-30-ml
        </span>
      </div>
      <div className="max-h-[640px] overflow-y-auto">{contenu}</div>
    </div>
  );
}

function SectionRendue({
  id,
  state,
  boutiqueNom,
  logo,
  t,
}: {
  id: SectionId;
  state: EditeurState;
  boutiqueNom: string;
  logo: string | null;
  t: (fr: string, en: string) => string;
}) {
  switch (id) {
    case "bandeau":
      return (
        <div className="px-4 py-2 text-center text-[10.5px] font-medium" style={{ background: "var(--ac)", color: "#fff" }}>
          {texteAvecChiffres(state.bandeau.message)}
        </div>
      );

    case "entete":
      return (
        <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${state.entete.positionLogo === "centre" ? "justify-center" : ""}`} style={{ borderColor: "rgba(0,0,0,.08)" }}>
          <Marque logo={logo} taille={20} />
          {state.entete.nomAvecLogo && <span className="text-[12.5px] font-bold">{boutiqueNom}</span>}
          <div className="ml-auto flex items-center gap-2.5" style={{ color: "var(--tx)" }}>
            {state.entete.recherche && <MiniIcon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35" />}
            {state.entete.panier && <MiniIcon path="M5.5 8h13l-1 12.5h-11ZM9 8V6.5a3 3 0 0 1 6 0V8" />}
            {state.entete.compte && <MiniIcon path="M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Zm-6 6a6 6 0 0 1 12 0" />}
          </div>
        </div>
      );

    case "galerie": {
      const ratio = state.galerie.format === "portrait" ? "3/4" : state.galerie.format === "paysage" ? "16/9" : "1/1";
      return (
        <div className="relative">
          <div
            className="flex items-center justify-center"
            style={{ aspectRatio: ratio, background: "linear-gradient(150deg, rgba(236,12,140,.10), rgba(58,29,138,.10))" }}
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
                <MiniIcon path="M4 6h4l1.4-2h5.2L16 6h4v12H4Z" color="rgba(0,0,0,.35)" />
              </span>
              <span className="text-[9.5px]" style={{ color: "rgba(0,0,0,.4)" }}>
                {t("Aucune photo déposée", "No photo uploaded yet")}
              </span>
            </div>
          </div>
          {state.galerie.lectureAuto && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur">
              {texteAvecChiffres(state.galerie.badge)}
            </span>
          )}
        </div>
      );
    }

    case "infos": {
      return (
        <div className="px-4 py-3.5">
          <p className="text-[15px] font-bold leading-tight">{t(PRODUIT_APERCU.nom, PRODUIT_APERCU.nomEn)}</p>
          {state.infos.noteMoyenne && (
            <p className="mt-1 flex items-center gap-1 text-[10.5px]" style={{ color: "rgba(0,0,0,.45)" }}>
              <Etoiles note={PRODUIT_APERCU.note} /> <span className="font-figures">{PRODUIT_APERCU.note}</span> · <span className="font-figures">{PRODUIT_APERCU.avisCount}</span> {t("avis", "reviews")}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[19px] font-figures-bold">{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
            {state.infos.ancienPrixBarre && (
              <span className="text-[12px] line-through font-figures" style={{ color: "rgba(0,0,0,.4)" }}>
                {PRODUIT_APERCU.prixConseille.toLocaleString("fr-FR")} F
              </span>
            )}
            {state.infos.badgeRemise && (
              <span className="rounded-full px-2 py-0.5 text-[9px] font-figures-bold text-white" style={{ background: "#D8347E" }}>
                −{Math.round((1 - PRODUIT_APERCU.prixVente / PRODUIT_APERCU.prixConseille) * 100)} %
              </span>
            )}
          </div>
          {state.infos.stockRestant && (
            <p className="mt-1.5 text-[10px]" style={{ color: "rgba(0,0,0,.5)" }}>
              {texteAvecChiffres(t(`Plus que ${PRODUIT_APERCU.unitesDisponibles} en stock`, `Only ${PRODUIT_APERCU.unitesDisponibles} left in stock`))}
            </p>
          )}
          {state.infos.variantes && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRODUIT_APERCU.variantes.map((v, i) => (
                <span
                  key={v}
                  className="rounded-full border px-3 py-1 text-[10px] font-figures-bold"
                  style={i === 0 ? { borderColor: "var(--ac)", color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 8%, transparent)" } : { borderColor: "rgba(0,0,0,.12)" }}
                >
                  {v}
                </span>
              ))}
            </div>
          )}
          {state.infos.quantite && (
            <div className="mt-2.5 inline-flex items-center gap-3 rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: "rgba(0,0,0,.12)" }}>
              <span>−</span>
              <span className="font-figures-bold">1</span>
              <span>+</span>
            </div>
          )}
        </div>
      );
    }

    case "offres":
      if (!state.offres.actif) return null;
      return (
        <div className="px-4 pb-3.5">
          <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,.4)" }}>
            {t("Offres par quantité", "Quantity offers")}
          </p>
          <div className="flex flex-col gap-1.5">
            {state.offres.paliers.map((p) => (
              <div
                key={p.unites}
                className="flex items-center justify-between rounded-xl border px-3 py-2"
                style={p.badge ? { borderColor: "var(--ac)", background: "color-mix(in srgb, var(--ac) 6%, transparent)" } : { borderColor: "rgba(0,0,0,.1)" }}
              >
                <span className="text-[11px] font-semibold">
                  <span className="font-figures">{p.unites}</span> {p.unites > 1 ? t("flacons", "bottles") : t("flacon", "bottle")}
                  {p.badge && <span className="ml-1.5 text-[9px] font-bold" style={{ color: "var(--ac)" }}>· {p.badge}</span>}
                </span>
                <span className={p.remisePct > 0 ? "text-[11px] font-figures-bold" : "text-[11px] font-bold"}>{p.remisePct > 0 ? `−${p.remisePct} %` : t("Prix normal", "Regular price")}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "formulaire": {
      const champs = [
        { label: t("Nom et prénom", "Full name"), demi: false },
        { label: t("Commune", "District"), demi: state.formulaire.colonnes === 2 },
        { label: t("Adresse précise", "Precise address"), demi: state.formulaire.colonnes === 2 },
        { label: t("Téléphone", "Phone number"), demi: false },
      ];
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Vos informations", "Your information")}</p>
          <div className={`grid gap-2 ${state.formulaire.colonnes === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {champs.map((c) => (
              <div key={c.label} className={`rounded-xl border px-3 py-2.5 ${c.demi ? "" : "col-span-full"}`} style={{ borderColor: "rgba(0,0,0,.12)" }}>
                {state.formulaire.libellesDansChamp ? (
                  <>
                    <p className="text-[7.5px]" style={{ color: "rgba(0,0,0,.4)" }}>{c.label}</p>
                    <p className="mt-0.5 h-2.5 w-2/3 rounded" style={{ background: "rgba(0,0,0,.08)" }} />
                  </>
                ) : (
                  <p className="text-[10px]" style={{ color: "rgba(0,0,0,.4)" }}>{c.label}</p>
                )}
              </div>
            ))}
          </div>
          {state.formulaire.boutonLocaliser && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-[10.5px] font-semibold" style={{ borderColor: "var(--ac)", color: "var(--ac)" }}>
              <MiniIcon path="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z" color="var(--ac)" />
              {t("Me localiser maintenant", "Locate me now")}
            </div>
          )}
          {state.formulaire.mentionSpecifique && (
            <div className="mt-2 rounded-xl border px-3 py-2 text-[9.5px]" style={{ borderColor: "rgba(0,0,0,.12)", color: "rgba(0,0,0,.4)" }}>
              {t("Une précision pour le livreur ? (facultatif)", "Anything the courier should know? (optional)")}
            </div>
          )}
        </div>
      );
    }

    case "paiement": {
      const remise = state.paiement.remiseEnLignePct;
      const prixLigne = Math.round((PRODUIT_APERCU.prixVente * (100 - remise)) / 100);
      return (
        <div className="px-4 pb-3.5">
          {state.paiement.payerEnLigne && (
            <button
              type="button"
              className="mb-2 flex w-full items-center justify-between gap-2 border-2 px-3.5 py-2.5 text-left"
              style={{ borderColor: "var(--ac)", background: "color-mix(in srgb, var(--ac) 6%, transparent)", borderRadius: "var(--rad)" }}
            >
              <span className="text-[11px] font-semibold">{t("Payer en ligne", "Pay online")}</span>
              <span className="text-[11.5px] font-figures-bold">
                {prixLigne.toLocaleString("fr-FR")} F
                {remise > 0 && <span className="ml-1 text-[9px] font-normal line-through font-figures" style={{ color: "rgba(0,0,0,.4)" }}>{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>}
              </span>
            </button>
          )}
          {state.paiement.payerALaLivraison && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5" style={{ borderColor: "rgba(0,0,0,.12)" }}>
              <span className="text-[11px] font-semibold">{t("Payer à la livraison", "Pay on delivery")}</span>
              <span className="text-[11.5px] font-figures-bold">{PRODUIT_APERCU.prixVente.toLocaleString("fr-FR")} F</span>
            </div>
          )}
          <div className="mb-2.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: "rgba(0,0,0,.12)" }}>
            <div>
              <p className="text-[11px] font-semibold">{t("Livraison standard", "Standard delivery")}</p>
              <p className="text-[9px]" style={{ color: "rgba(0,0,0,.4)" }}>{texteAvecChiffres(t("4 h en moyenne", "4 h on average"))}</p>
            </div>
            <span className="text-[10.5px] font-semibold">{t("Incluse", "Included")}</span>
          </div>
          {state.paiement.livraisonExpress && (
            <div className="mb-2.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: "rgba(0,0,0,.12)" }}>
              <p className="text-[11px] font-semibold">{t("Livraison express", "Express delivery")}</p>
              <span className="text-[10.5px] font-figures-bold">+2 000 F</span>
            </div>
          )}
          <button
            type="button"
            className="w-full py-3 text-center text-[12px] font-bold text-white"
            style={{ background: style_boutonBg(state), borderRadius: "var(--rad)" }}
          >
            {t("Je commande", "I order")} · <span className="font-figures-bold">{(state.paiement.payerEnLigne ? prixLigne : PRODUIT_APERCU.prixVente).toLocaleString("fr-FR")} F</span>
          </button>
        </div>
      );
    }

    case "avis":
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Ce que disent nos clientes", "What our customers say")}</p>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[22px] font-figures-bold leading-none">{PRODUIT_APERCU.note}</span>
            <div>
              <Etoiles note={PRODUIT_APERCU.note} taille={11} />
              <p className="text-[9px]" style={{ color: "rgba(0,0,0,.4)" }}><span className="font-figures">{PRODUIT_APERCU.avisCount}</span> {t("avis", "reviews")}</p>
            </div>
          </div>
          <div className={state.avis.disposition === "grille" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
            {AVIS_APERCU.slice(0, state.avis.disposition === "grille" ? 2 : Math.min(2, state.avis.nombreAffiches)).map((a) => (
              <div key={a.nom} className="rounded-xl border px-3 py-2.5" style={{ borderColor: "rgba(0,0,0,.1)" }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "var(--ac)" }}>
                    {a.initiales}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold">{a.nom}</p>
                    <Etoiles note={a.note} taille={8} />
                  </div>
                  {a.verifie && (
                    <span className="shrink-0 text-[8px] font-semibold" style={{ color: "#1F8A5B" }}>
                      ✓ {t("Achat vérifié", "Verified purchase")}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[10px]" style={{ color: "rgba(0,0,0,.55)" }}>{a.texte}</p>
                {a.reponse && (
                  <div className="mt-1.5 rounded-lg border-l-2 px-2 py-1.5 text-[9px]" style={{ borderColor: "var(--ac)", background: "rgba(0,0,0,.03)", color: "rgba(0,0,0,.55)" }}>
                    <b style={{ color: "var(--ac)" }}>{boutiqueNom} :</b> {a.reponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold">{t("Questions fréquentes", "Frequently asked questions")}</p>
          <div className="flex flex-col">
            {state.faq.items.map((q, i) => {
              const ouverte = i === 0 && state.faq.premiereOuverte ? true : !!q.ouverte;
              return (
                <div key={q.question} className="border-b py-2" style={{ borderColor: "rgba(0,0,0,.08)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10.5px] font-semibold">{texteAvecChiffres(q.question)}</p>
                    <span className="shrink-0 text-[11px]" style={{ color: "rgba(0,0,0,.35)" }}>{ouverte ? "−" : "+"}</span>
                  </div>
                  {ouverte && <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "rgba(0,0,0,.5)" }}>{texteAvecChiffres(q.reponse)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "vendu-par":
      return (
        <div className="mx-4 mb-3.5 flex items-center gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: "rgba(0,0,0,.1)", background: "rgba(0,0,0,.02)" }}>
          <Marque logo={logo} taille={22} />
          <div>
            <p className="text-[8px] uppercase tracking-wide" style={{ color: "rgba(0,0,0,.4)" }}>{t("Vendu par", "Sold by")}</p>
            <p className="text-[11.5px] font-bold">{boutiqueNom}</p>
          </div>
        </div>
      );

    case "pied-de-page":
      return (
        <div className="px-4 py-4 text-[10px]" style={{ background: "#1F1328", color: "#CFC6D8" }}>
          {state.piedDePage.presentation && (
            <p className="mb-2">
              <b className="block text-white">{boutiqueNom}</b>
              {t("Soins naturels pour le visage et le corps.", "Natural skincare and body care.")}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {state.piedDePage.liens && (
              <>
                <span>{t("Conditions de vente", "Terms of sale")}</span>
                <span>{t("Livraison et retours", "Delivery and returns")}</span>
              </>
            )}
            {state.piedDePage.reseaux && <span>Facebook · Instagram</span>}
          </div>
          {state.piedDePage.moyensPaiement && (
            <div className="mt-2 flex gap-1.5">
              {["Orange Money", "MTN MoMo", "Moov Money", "Wave"].map((m) => (
                <span key={m} className="rounded bg-white/10 px-1.5 py-0.5 text-[8px]">{m}</span>
              ))}
            </div>
          )}
          <p className="mt-2.5 text-[8.5px]" style={{ color: "rgba(255,255,255,.4)" }}>{texteAvecChiffres(state.piedDePage.mentionBas)}</p>
        </div>
      );

    default:
      return null;
  }
}

function style_boutonBg(state: EditeurState): string {
  const { boutonRemplissage, couleurPrincipale } = state.style;
  if (boutonRemplissage === "degrade") return `linear-gradient(100deg, ${couleurPrincipale}, #3A1D8A)`;
  return couleurPrincipale;
}

function Marque({ logo, taille }: { logo: string | null; taille: number }) {
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- aperçu, pas une image du domaine
    <img src={logo} alt="" className="shrink-0 rounded-full object-cover" style={{ width: taille, height: taille }} />
  ) : (
    <span
      className="shrink-0 rounded-full"
      style={{ width: taille, height: taille, background: "linear-gradient(140deg,var(--color-brand-pink),var(--color-brand-purple))" }}
    />
  );
}

function MiniIcon({ path, color = "currentColor" }: { path: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[14px] w-[14px]" aria-hidden>
      <path d={path} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Etoiles({ note, taille = 10 }: { note: number; taille?: number }) {
  return (
    <span className="inline-flex gap-[1px]" style={{ color: "#F2A93B" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={taille} height={taille} fill={i < Math.round(note) ? "currentColor" : "rgba(0,0,0,.15)"} aria-hidden>
          <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}
