import ScrollReveal from "../ScrollReveal";
import VisionEyebrow from "./VisionEyebrow";

// Section 4/4 de la page "/vision" : "La coordination est le point de
// rupture" — colonne de texte cadrée à gauche, reste de la largeur laissé
// vide, comme sur la capture fournie par l'utilisateur.
//
// C'est aussi la dernière section avant le Footer (fond blanc, voir
// Footer.tsx) : le fond passe donc en dégradé du bleu nuit de la marque
// jusqu'au blanc (mêmes paliers que le dégradé déjà utilisé dans CTA.tsx),
// avec un padding bas généreux pour laisser le dégradé s'éclaircir avant de
// rejoindre le footer, sans coupure nette.
export default function VisionConstat() {
  return (
    <section className="bg-[linear-gradient(to_bottom,#000717_0%,#101625_25%,#3f4350_50%,#7b7d87_70%,#b5b4bd_85%,#faf7fc_100%)] px-6 pt-24 pb-40 md:px-16 md:pb-56">
      <div className="mx-auto max-w-[1320px]">
        <ScrollReveal>
          <VisionEyebrow>Le constat</VisionEyebrow>
          <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
            La coordination est le point de rupture
          </h2>

          <div className="mt-8 max-w-xl space-y-6 text-brand-white/70">
            <p>
              Chaque commande met en relation au moins quatre parties : une
              boutique, un opérateur logistique, un livreur, un acheteur.
              Aucune ne dispose de la même information au même moment.
            </p>
            <p>
              Cet écart se comble par de la coordination manuelle. Elle
              représente un coût diffus, supporté par l&apos;ensemble de la
              chaîne, qui limite le volume qu&apos;une entreprise peut
              absorber sans perte de contrôle.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
