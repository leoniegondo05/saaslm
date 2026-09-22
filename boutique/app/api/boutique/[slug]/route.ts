import { NextResponse } from "next/server";
import { fusionnerBoutique, lireBoutique, type BoutiqueDonnees } from "../../../../lib/boutique-store";

/*
  Pont "Personnaliser ma boutique" (dashboard) → "Ma boutique" (public),
  cf. lib/boutique-store.ts pour le détail du stockage et pourquoi un
  fichier plutôt que localStorage. Un seul PUT (fusion partielle) plutôt que
  PUT+PATCH séparés : PersonnaliserBoutique.tsx envoie { identite, editeur },
  ProduitsCatalogue.tsx envoie { produits, categories } — fusionnerBoutique()
  garde ce que l'autre écran a déjà enregistré.

  Pas d'authentification ici : aucune session serveur n'existe encore côté
  Next (le token vit dans lib/api/token.ts, côté client, pour le futur
  backend Laravel) — cf. mémoire [[dashboard-mock-data-pending-laravel-api]].
  Le slug agit comme clé de la boutique ; à brancher sur le vrai compte
  connecté (via le token Laravel) quand l'API existera, pour qu'un
  utilisateur ne puisse écrire que sa propre boutique.
*/

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const donnees = await lireBoutique(slug);
  if (!donnees) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }
  return NextResponse.json(donnees);
}

export async function PUT(request: Request, { params }: Params) {
  const { slug } = await params;
  let patch: Partial<Omit<BoutiqueDonnees, "misAJour">>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const donnees = await fusionnerBoutique(slug, patch);
  return NextResponse.json(donnees);
}
