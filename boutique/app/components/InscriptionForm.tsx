"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { register } from "../../lib/api/services/auth";
import { useApiRequest } from "../../lib/api/hooks/useApiRequest";

/*
  Formulaire d'inscription, extrait de app/inscription/page.tsx pour
  pouvoir être un composant client (état + appel API) tout en gardant la
  page en composant serveur (export const metadata).

  Trois vues l'une après l'autre dans cette même page (pas de route à
  part) — écrans 35 et 36 de la maquette fournie par l'utilisateur (LM
  Inscription boutique.html) :
    "formulaire"   les champs habituels (nom, email, téléphone, boutique,
                    mot de passe).
    "conditions"   au clic sur "Créer ma boutique" : la case à cocher des
                    CGU n'est PAS dans le formulaire — cliquer dessus
                    déroule la liste des conditions, et c'est au bas de
                    cette liste, et nulle part ailleurs, qu'elle se
                    trouve (écran 35).
    "confirmation" une fois les CGU acceptées et le compte créé, écran de
                    bienvenue avant de renvoyer vers /login (écran 36) —
                    rien ne connecte automatiquement.

  Prêt à accueillir l'API : dès que POST {NEXT_PUBLIC_API_URL}/api/register
  répond, il suffit de vérifier le format retourné dans
  lib/api/services/auth.ts (RegisterPayload/AuthResponse) — rien ici à
  changer.
*/

const CGU_ARTICLES = [
  {
    titre: "Ce que vous acceptez",
    texte:
      "Vous vous engagez à ne vendre que des produits dont vous avez le droit de disposer, et à répondre de leur conformité devant vos clients.",
  },
  {
    titre: "Ce que la plateforme fait",
    texte:
      "LM met à votre disposition une boutique en ligne, des pages de commande et un suivi des commandes. Elle ne détient jamais vos marchandises tant que vous n'êtes pas affilié à une entreprise agréée.",
  },
  {
    titre: "Vos clients vous appartiennent",
    texte:
      "Les personnes qui commandent chez vous sont vos clientes. Ni la plateforme ni votre futur partenaire ne peut leur écrire pour son compte ni transmettre leur liste.",
  },
  {
    titre: "Vos données",
    texte: "Vos produits, vos commandes et vos chiffres restent exportables à tout moment, dans un fichier que vous pouvez ouvrir ailleurs.",
  },
  {
    titre: "Les litiges",
    texte:
      "Un client dispose d'un délai après réception pour signaler un problème. Ce délai est d'au moins vingt-quatre heures et vous pourrez l'allonger depuis vos réglages.",
  },
  {
    titre: "La fin du service",
    texte: "Vous pouvez fermer votre boutique à tout moment. Les commandes déjà parties iront jusqu'à leur livraison.",
  },
];

const inputBox =
  "mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:mt-3 sm:py-4";

export default function InscriptionForm() {
  const router = useRouter();
  // `run` pas appelé pour l'instant — voir handleAccepterConditions plus
  // bas, backend pas encore branché. Gardé prêt (loading/error déjà
  // câblés dans le JSX) pour le jour où l'appel sera réactivé.
  const { loading, error } = useApiRequest(register);

  const [vue, setVue] = useState<"formulaire" | "conditions" | "confirmation">("formulaire");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [cguAccepte, setCguAccepte] = useState(false);

  // Le clic sur "Créer ma boutique" ne crée rien tant que les CGU ne sont
  // pas acceptées : il ouvre la liste des conditions à la place (écran 35).
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVue("conditions");
  }

  function handleAccepterConditions() {
    if (!cguAccepte) return;
    // POST /api/register pas encore branché côté Laravel (voir le
    // commentaire en tête de fichier) : l'appel échouerait toujours
    // (erreur réseau), donc on affiche directement l'écran de
    // confirmation, comme CreerEspaceForm.tsx pour "Créer mon espace".
    // Une fois la route prête : remplacer ce bloc par
    //   const result = await run({ name, email, phone, shop_name:
    //   shopName, shop_slug: shopSlug, password, password_confirmation:
    //   passwordConfirmation });
    //   if (result) setVue("confirmation");
    setVue("confirmation");
  }

  if (vue === "confirmation") {
    return (
      <div className="mt-6 text-center sm:mt-8">
        <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full border-2 border-[#4FE0AE]/45 bg-[#4FE0AE]/12 text-[#4FE0AE]">
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
            <path d="m6.6 12.4 3.6 3.6 7.2-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-brand-white">Votre identité est enregistrée</h2>
        <p className="mt-2 text-sm font-light text-brand-white/60">
          Un message de bienvenue vient de partir vers votre adresse. Il contient votre identifiant et le lien de connexion.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#4FE0AE]/30 bg-[#4FE0AE]/8 px-4 py-3.5 text-left">
          <span className="text-[#4FE0AE]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path d="m3.8 7.4 8.2 6 8.2-6" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-brand-white">Message de bienvenue envoyé</p>
            <p className="text-[11px] text-brand-white/50">À l&apos;adresse que vous venez de vérifier.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-7 w-full rounded-2xl bg-brand-white px-6 py-3.5 text-sm font-semibold text-brand-bg transition hover:opacity-90"
        >
          Me connecter
        </button>
        <p className="mt-4 text-xs font-light text-brand-white/40">
          À la première connexion, neuf questions sur votre activité. Une par page, deux minutes en tout.
        </p>
      </div>
    );
  }

  if (vue === "conditions") {
    return (
      <div className="mt-6 sm:mt-8">
        <div className="rounded-2xl border border-brand-pink/35 bg-[linear-gradient(180deg,rgba(24,14,32,0.9),rgba(14,10,22,0.9))] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-[14px] font-semibold text-brand-white">Conditions d&apos;utilisation</p>
              <p className="text-[10.5px] font-light text-brand-white/45">Mise à jour le 1er septembre 2026</p>
            </div>
          </div>

          <div className="max-h-72 space-y-4 overflow-y-auto px-5 py-4">
            {CGU_ARTICLES.map((article) => (
              <div key={article.titre}>
                <p className="text-[12.5px] font-semibold text-brand-white">{article.titre}</p>
                <p className="mt-1 text-[11.5px] font-light leading-relaxed text-brand-white/55">{article.texte}</p>
              </div>
            ))}

            {/* La case ne se trouve qu'ici, au bas de la liste — nulle
                part ailleurs dans le formulaire (voir commentaire en
                tête de fichier). */}
            <label className="flex cursor-pointer items-start gap-3 border-t border-white/10 pt-4">
              <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/[0.05]">
                <input
                  type="checkbox"
                  checked={cguAccepte}
                  onChange={(event) => setCguAccepte(event.target.checked)}
                  className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md checked:border-[#4FE0AE] checked:bg-[#4FE0AE]"
                />
                <svg viewBox="0 0 16 16" fill="none" className="hidden h-3 w-3 text-brand-bg peer-checked:block" aria-hidden>
                  <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[12px] font-light text-brand-white/75">
                J&apos;ai lu et j&apos;accepte les conditions d&apos;utilisation. La case n&apos;apparaît qu&apos;ici, au bas de la liste.
              </span>
            </label>
          </div>

          <div className="px-5 pb-5">
            {error && (
              <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error.message}</p>
            )}
            <button
              type="button"
              onClick={handleAccepterConditions}
              disabled={!cguAccepte || loading}
              className="w-full rounded-xl bg-brand-white px-6 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Création…" : "Accepter et créer ma boutique"}
            </button>
            <button
              type="button"
              onClick={() => setVue("formulaire")}
              className="mt-2.5 w-full rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-brand-white/70 transition hover:border-white/30"
            >
              Retour au formulaire
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] font-light text-brand-white/40">
          Cliquer sur la case du bas de page n&apos;ouvre pas une nouvelle fenêtre : la liste se déroule sur place. Le formulaire reste
          derrière, en attente.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-brand-white">
            Nom &amp; prénom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex : Jean DUPONT"
            className={inputBox}
          />
          {error?.fieldError("name") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("name")}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-semibold text-brand-white">
            Adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="info@example.com"
            className={inputBox}
          />
          {error?.fieldError("email") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("email")}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label htmlFor="phone" className="text-sm font-semibold text-brand-white">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+225 07 07 07 07 07"
            className={inputBox}
          />
          {error?.fieldError("phone") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("phone")}</p>
          )}
        </div>

        <div>
          <label htmlFor="shop-name" className="text-sm font-semibold text-brand-white">
            Nom de la boutique
          </label>
          <input
            id="shop-name"
            name="shop-name"
            type="text"
            autoComplete="organization"
            required
            value={shopName}
            onChange={(event) => setShopName(event.target.value)}
            placeholder="Ex : Ma boutique"
            className={inputBox}
          />
          {error?.fieldError("shop_name") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("shop_name")}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="shop-slug" className="text-sm font-semibold text-brand-white">
          Lien de ma boutique
        </label>
        <div className="mt-2 flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] focus-within:border-brand-pink/60 sm:mt-3">
          <input
            id="shop-slug"
            name="shop-slug"
            type="text"
            required
            pattern="[a-z0-9-]+"
            title="Uniquement des lettres minuscules sans accent, chiffres et tirets"
            value={shopSlug}
            onChange={(event) => setShopSlug(event.target.value)}
            placeholder="Ma boutique"
            className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-brand-white placeholder-brand-white/30 outline-none sm:py-4"
          />
          <span className="flex shrink-0 items-center border-l border-white/10 px-5 text-sm font-semibold text-brand-white/50">
            .LM.com
          </span>
        </div>
        {error?.fieldError("shop_slug") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("shop_slug")}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-brand-white">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className={inputBox}
          />
          {error?.fieldError("password") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("password")}</p>
          )}
        </div>

        <div>
          <label htmlFor="password-confirmation" className="text-sm font-semibold text-brand-white">
            Confirmation
          </label>
          <input
            id="password-confirmation"
            name="password-confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            placeholder="********"
            className={inputBox}
          />
        </div>
      </div>

      <Link
        href="/login"
        className="block text-center text-sm font-medium text-brand-pink hover:opacity-80"
      >
        Vous avez déjà un compte ?
      </Link>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-white px-6 py-3 text-sm font-semibold text-brand-bg transition hover:opacity-90 sm:py-4"
      >
        Créer ma boutique
      </button>
    </form>
  );
}
