"use client";

import { useState } from "react";
import type { AvisClient } from "@/lib/boutique-types";
import { usePreviewNavigation } from "./PreviewMode";
import { LuStar } from "react-icons/lu";

const NOM_MAX = 60;
const TEXTE_MAX = 600;

/*
  Formulaire "Laisser un avis" — repliable (bouton texte) pour ne pas
  alourdir la section avis par défaut. Étoiles cliquables construites à la
  main (pas Etoiles de Icons.tsx, qui est un affichage lecture seule d'une
  note déjà connue). `onEnvoye` reçoit l'avis créé par l'API (id/date/verifie
  décidés côté serveur, cf. app/api/boutique/[slug]/avis/route.ts) pour que
  SectionAvis.tsx l'ajoute à sa liste locale sans recharger la page.
*/
export default function FormulaireAvis({
  slug,
  produitId,
  couleurEtoiles,
  onEnvoye,
}: {
  slug: string;
  produitId?: string | null;
  couleurEtoiles: string;
  onEnvoye: (avis: AvisClient) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState<"idle" | "envoi" | "erreur">("idle");
  const preview = usePreviewNavigation();

  // Route /apercu (brouillon dashboard) : `slug` reste le vrai slug de la
  // boutique (cf. ApercuAccueilPage), donc un envoi ici écrirait un vrai
  // avis sur la boutique réellement publiée depuis l'iframe d'édition.
  // Masquer le formulaire dans ce contexte plutôt que de risquer ça.
  if (preview) return null;

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="mb-4 text-[12.5px] font-bold underline underline-offset-2"
        style={{ color: "var(--ac)" }}
      >
        Laisser un avis
      </button>
    );
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (envoi === "envoi" || !nom.trim() || !texte.trim() || note < 1) return;
    setEnvoi("envoi");
    try {
      const reponse = await fetch(`/api/boutique/${slug}/avis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim(), note, texte: texte.trim(), produitId: produitId ?? undefined }),
      });
      if (!reponse.ok) throw new Error();
      const cree = (await reponse.json()) as AvisClient;
      onEnvoye(cree);
      setOuvert(false);
      setNom("");
      setNote(0);
      setTexte("");
      setEnvoi("idle");
    } catch {
      setEnvoi("erreur");
    }
  }

  return (
    <form onSubmit={soumettre} className="mb-5 flex flex-col gap-3 rounded-2xl border border-[var(--tx)]/8 p-4">
      <p className="text-[13.5px] font-bold">Laisser un avis</p>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Note sur 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={note === n}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setSurvol(n)}
            onMouseLeave={() => setSurvol(0)}
            onClick={() => setNote(n)}
            className="p-0.5"
          >
            <LuStar size={22} color={couleurEtoiles} fill={(survol || note) >= n ? couleurEtoiles : "transparent"} />
          </button>
        ))}
      </div>

      <input
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        maxLength={NOM_MAX}
        required
        placeholder="Votre nom"
        className="rounded-lg border border-[var(--tx)]/15 bg-transparent px-3 py-2 text-[13px] outline-none focus:border-[var(--ac)]"
      />
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        maxLength={TEXTE_MAX}
        required
        rows={3}
        placeholder="Votre avis"
        className="resize-none rounded-lg border border-[var(--tx)]/15 bg-transparent px-3 py-2 text-[13px] outline-none focus:border-[var(--ac)]"
      />

      {envoi === "erreur" && <p className="text-[12px] font-medium text-red-500">Envoi impossible, réessayez.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={envoi === "envoi" || note < 1}
          className="rounded-full px-4 py-2 text-[12.5px] font-bold text-white transition disabled:opacity-50"
          style={{ background: "#0B0E1C" }}
        >
          {envoi === "envoi" ? "Envoi…" : "Publier mon avis"}
        </button>
        <button type="button" onClick={() => setOuvert(false)} className="text-[12.5px] font-semibold text-[var(--tx)]/55">
          Annuler
        </button>
      </div>
    </form>
  );
}
