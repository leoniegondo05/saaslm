// Section 2/4 de la page "/vision" : citation centrée + sous-titre + un
// bouton blanc plein (pas le bouton rose habituel du reste du site,
// voir la capture fournie par l'utilisateur).
export default function VisionStatement() {
  return (
    <section className="bg-brand-bg px-6 py-24 text-center md:px-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-3xl font-bold leading-tight sm:text-4xl">
          Le commerce africain ne manque ni de vendeurs, ni d&apos;acheteurs,
          ni de compétences pour l&apos;opérer. Il manque de liens entre eux.
        </p>
        <p className="mt-8 text-lg text-brand-white/80">
          Nous construisons ces liens, pays après pays.
        </p>
        <button
          type="button"
          className="mt-10 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90"
        >
          Devenir partenaire agréé
        </button>
      </div>
    </section>
  );
}
