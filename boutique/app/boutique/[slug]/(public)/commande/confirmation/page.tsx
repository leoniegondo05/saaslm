import Link from "next/link";
import { notFound } from "next/navigation";
import { lireBoutique } from "@/lib/boutique-store";

type Params = { params: Promise<{ slug: string }> };

/*
  Confirmation — page de remerciement, sans dépendance au panier (déjà vidé
  par CommandeClient.tsx avant la redirection ici). Reprend les vrais
  réglages EditeurState.apresCommande (titre/message) pour que le texte
  affiché soit celui choisi par le marchand, pas un texte figé.
*/
export default async function ConfirmationPage({ params }: Params) {
  const { slug } = await params;
  const donnees = await lireBoutique(slug);
  if (!donnees || !donnees.identite.ouverte) notFound();

  const { titre, message } = donnees.editeur.apresCommande;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-5 px-4 py-20 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full text-white" style={{ background: "var(--ac)" }}>
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4.5 12.5 9.5 17.5 19.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h1 className="text-[23px] font-bold" style={{ fontFamily: "var(--font-titre)" }}>
        {titre || "Merci, votre commande est enregistrée"}
      </h1>
      <p className="text-[14px] text-[var(--tx)]/70">{message || "Nous vous contactons bientôt pour confirmer la livraison."}</p>
      <Link
        href={`/boutique/${slug}`}
        className="mt-2 px-6 py-3 text-[14px] font-bold text-white transition hover:brightness-110"
        style={{ background: "var(--ac)", borderRadius: "var(--rad)" }}
      >
        Retour à la boutique
      </Link>
    </section>
  );
}
