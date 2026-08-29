import VisionEyebrow from "./VisionEyebrow";

// Section 3/4 de la page "/vision" : "Ce que l'infrastructure produit",
// 3 colonnes séparées par une fine ligne horizontale au-dessus de chaque
// titre (voir la capture fournie par l'utilisateur).
const COLUMNS = [
  {
    title: "Volume",
    body: "Le portefeuille de l'opérateur s'élargit à mesure que le réseau s'étend sur son territoire.",
  },
  {
    title: "Exécution",
    body: "Commandes, stocks et tournées restent synchronisés dans un système unique.",
  },
  {
    title: "Règlement",
    body: "Les fonds sont tracés du paiement de l'acheteur jusqu'au reversement à l'opérateur.",
  },
];

export default function VisionEffects() {
  return (
    <section className="bg-brand-bg px-6 py-24 md:px-16">
      <div className="mx-auto max-w-[1320px]">
        <VisionEyebrow>Les effets</VisionEyebrow>
        <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight sm:text-4xl">
          Ce que l&apos;infrastructure produit
        </h2>

        <div className="mt-20 grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title} className="border-t border-white/15 pt-6">
              <h3 className="text-xl font-bold">{col.title}</h3>
              <p className="mt-4 text-brand-white/70">{col.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
