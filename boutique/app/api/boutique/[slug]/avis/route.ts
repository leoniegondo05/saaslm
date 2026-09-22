import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { ajouterAvis, lireBoutique } from "../../../../../lib/boutique-store";
import type { AvisClient } from "../../../../../lib/boutique-types";

/*
  Soumission d'avis client (formulaire public, cf. FormulaireAvis.tsx dans
  SectionAvis.tsx) — endpoint séparé du PUT de ../route.ts : celui-ci reçoit
  la boutique *entière* depuis le dashboard (propriétaire), pas adapté à un
  visiteur anonyme qui n'a et ne doit avoir accès qu'à "ajouter un avis".

  Pas d'authentification ici non plus (cf. mémoire [[dashboard-mock-data-pending-laravel-api]],
  même limite que ../route.ts), donc tout se joue sur ce que ce endpoint
  *ne fait pas* : `verifie` et `reponse` sont toujours fixés côté serveur
  (jamais lus depuis le corps de la requête) pour qu'un visiteur ne puisse
  pas s'auto-attribuer un badge "achat vérifié" ni forger une réponse de la
  boutique. Pas de limite de débit ni de captcha — à ajouter avec l'API
  Laravel si le spam devient un problème réel.
*/

type Params = { params: Promise<{ slug: string }> };

const NOTE_MIN = 1;
const NOTE_MAX = 5;
const NOM_MAX = 60;
const TEXTE_MAX = 600;

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;

  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { nom, note, texte, produitId } = (corps ?? {}) as Record<string, unknown>;
  const nomPropre = typeof nom === "string" ? nom.trim().slice(0, NOM_MAX) : "";
  const textePropre = typeof texte === "string" ? texte.trim().slice(0, TEXTE_MAX) : "";
  const notePropre = typeof note === "number" ? Math.round(note) : NaN;

  if (!nomPropre || !textePropre || !Number.isFinite(notePropre) || notePropre < NOTE_MIN || notePropre > NOTE_MAX) {
    return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
  }

  const donnees = await lireBoutique(slug);
  if (!donnees) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  // Un produitId qui ne correspond à aucun produit de cette boutique est
  // ignoré (avis rattaché à rien, plutôt qu'à un produit d'une autre
  // boutique ou inventé) plutôt que de faire échouer tout l'envoi.
  const produitIdPropre = typeof produitId === "string" && donnees.produits.some((p) => p.id === produitId) ? produitId : null;

  const avis: AvisClient = {
    id: randomUUID(),
    nom: nomPropre,
    note: notePropre,
    texte: textePropre,
    date: new Date().toISOString(),
    verifie: false,
    photo: null,
    reponse: null,
    produitId: produitIdPropre,
  };

  const misAJour = await ajouterAvis(slug, avis);
  if (!misAJour) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  return NextResponse.json(avis, { status: 201 });
}
