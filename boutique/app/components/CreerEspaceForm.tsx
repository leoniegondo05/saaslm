"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

/*
  Formulaire "Créer mon espace", reproduction pixel de la maquette
  creation-compte-entreprise-agreee-lm.html fournie par l'utilisateur
  (couleurs --nuit #0B1030 / --lavande #FAF7FC / --carte #EDE8F7 /
  --fuchsia #EC0C8C / --bord #DCD7E8 / --gris #6E6880, en arbitraire
  Tailwind plutôt que les jetons brand-* du reste du site — même choix
  que PartenaireForm.tsx/PartenaireAgreePage : cette page a son propre
  univers visuel, clair, distinct du thème sombre du reste du site).

  Page destination du bouton "Créer mon espace" du mail de validation
  partenaire (courrier-validation-partenaire-lm.html, {{lien_creation_compte}}),
  ouverte depuis app/creer-mon-espace/page.tsx une fois le dossier
  accepté côté admin. email/entreprise (portés par le lien en query
  string) servent de valeur initiale des champs correspondants —
  éditables, pas en lecture seule : rien dans la maquette ne les
  distingue des autres champs.

  Étape 1 : compte du responsable (nom, email, téléphone, mot de passe).
  Étape 2 : entreprise (nom, lien .LM.com, adresse, ville/pays, RCCM
  optionnel replié) + acceptation des conditions. La logique JS de la
  maquette (bascule d'étape, dépli du bloc RCCM) est reprise telle
  quelle en state React plutôt qu'en manipulation du DOM.

  PAS DE ROUTE API CÔTÉ BACKEND (Laravel) POUR L'INSTANT — ni pour créer
  le compte, ni pour vérifier le token du lien. À la place, "Créer mon
  espace" affiche l'écran de confirmation directement, comme
  PartenaireForm.tsx pour la demande d'adhésion. Quand la route
  existera (recevant aussi le token de searchParams, à vérifier côté
  serveur avant toute création) :
    1. Ajouter le endpoint dans lib/api/config.ts (ENDPOINTS), à côté de
       ENDPOINTS.auth — ex. ENDPOINTS.partenaire.creerEspace.
    2. Ajouter le service correspondant dans lib/api/services/ (payload :
       nom, email, telephone, mot de passe, entreprise, lien, adresse,
       ville, pays, rccm, token), sur le modèle de lib/api/services/auth.ts.
    3. Brancher ici avec useApiRequest (lib/api/hooks/useApiRequest.ts),
       comme InscriptionForm.tsx : remplacer handleSubmit par un appel
       à run(payload), n'afficher l'écran de confirmation qu'au succès,
       et rendre error?.fieldError(...) sous les champs concernés.
*/

const PAYS = [
  "Côte d'Ivoire",
  "Bénin",
  "Burkina Faso",
  "Cameroun",
  "Ghana",
  "Mali",
  "Sénégal",
  "Togo",
  "Autre",
];

const inputBox =
  "h-14 w-full rounded-[13px] border border-[#DCD7E8] bg-white px-[18px] text-[15.5px] text-[#0B1030] outline-none transition placeholder:text-[#A49DB5] " +
  "focus:border-[#EC0C8C] focus:shadow-[0_0_0_3px_rgba(236,12,140,0.13)]";

function Champ({
  id,
  label,
  type = "text",
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
} & Record<string, unknown>) {
  return (
    <div>
      <label htmlFor={id} className="mb-[9px] block text-sm font-semibold text-[#0B1030]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputBox}
        {...rest}
      />
    </div>
  );
}

export default function CreerEspaceForm({
  email,
  entreprise,
}: {
  email: string;
  entreprise: string;
}) {
  const [etape, setEtape] = useState<1 | 2>(1);
  const [rccmOuvert, setRccmOuvert] = useState(false);
  const [cree, setCree] = useState(false);

  // Étape 1 — compte du responsable
  const [nom, setNom] = useState("");
  const [emailCompte, setEmailCompte] = useState(email);
  const [tel, setTel] = useState("");
  const [mdp, setMdp] = useState("");
  const [mdp2, setMdp2] = useState("");

  // Étape 2 — entreprise
  const [nomEntreprise, setNomEntreprise] = useState(entreprise);
  const [lien, setLien] = useState("");
  const [rue, setRue] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [rccm, setRccm] = useState("");
  const [cgu, setCgu] = useState(false);

  function handleContinuer(event: FormEvent) {
    event.preventDefault();
    setEtape(2);
  }

  function handleCreerEspace(event: FormEvent) {
    event.preventDefault();
    // Aucune route Laravel branchée pour l'instant : voir le commentaire
    // en tête de fichier pour l'endroit exact où brancher useApiRequest
    // quand ENDPOINTS.partenaire.creerEspace existera.
    setCree(true);
  }

  if (cree) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(236,12,140,0.4)] bg-[rgba(236,12,140,0.12)] text-[#EC0C8C]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#0B1030]">
          Votre espace est prêt
        </h3>
        <p className="mx-auto mt-2 max-w-[42ch] text-[#6E6880]">
          Vous pourrez y installer vos équipes, vos zones et vos premières boutiques.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-[13px] bg-[#0B1030] px-8 py-[15px] text-[15.5px] font-semibold text-white transition hover:-translate-y-[2px] hover:shadow-[0_14px_28px_rgba(11,16,48,0.24)]"
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[580px]">
      {/* .marque */}
      <div className="mb-[46px] flex items-center gap-[11px]">
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#0B1030]">
          <i className="block h-3 w-3 rounded-full bg-[#EC0C8C]" />
        </span>
        <b className="text-base font-bold tracking-[-0.02em] text-[#0B1030]">LIIVRE MOI</b>
      </div>

      {/* ---------- étape 1 ---------- */}
      {etape === 1 && (
        <form onSubmit={handleContinuer}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#EC0C8C]">
            Étape 1 sur 2
          </p>
          <h2 className="text-[31px] font-bold tracking-[-0.032em] text-[#0B1030]">
            Votre compte
          </h2>
          <p className="mb-8 mt-2 text-[15.5px] text-[#6E6880]">
            Créez l&apos;accès du responsable de l&apos;entreprise.
          </p>

          <div className="mb-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-x-[26px]">
            <Champ
              id="nom"
              label="Nom & prénom"
              value={nom}
              onChange={setNom}
              placeholder="Ex : Jean DUPONT"
              autoComplete="name"
              required
            />
            <Champ
              id="email"
              label="Adresse e-mail"
              type="email"
              value={emailCompte}
              onChange={setEmailCompte}
              placeholder="info@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-5">
            <Champ
              id="tel"
              label="Téléphone"
              type="tel"
              value={tel}
              onChange={setTel}
              placeholder="+225 07 07 07 07 07"
              autoComplete="tel"
              required
            />
          </div>

          <div className="mb-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-x-[26px]">
            <Champ
              id="mdp"
              label="Mot de passe"
              type="password"
              value={mdp}
              onChange={setMdp}
              placeholder="********"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Champ
              id="mdp2"
              label="Confirmation"
              type="password"
              value={mdp2}
              onChange={setMdp2}
              placeholder="********"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-[28px] h-[58px] w-full rounded-[13px] bg-[#0B1030] text-[15.5px] font-semibold text-white transition hover:-translate-y-[2px] hover:shadow-[0_14px_28px_rgba(11,16,48,0.24)]"
          >
            Continuer
          </button>
          <p className="mt-6 text-center text-[15px] text-[#6E6880]">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-[#EC0C8C] hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      )}

      {/* ---------- étape 2 ---------- */}
      {etape === 2 && (
        <form onSubmit={handleCreerEspace}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#EC0C8C]">
            Étape 2 sur 2
          </p>
          <h2 className="text-[31px] font-bold tracking-[-0.032em] text-[#0B1030]">
            Votre entreprise
          </h2>
          <p className="mb-8 mt-2 text-[15.5px] text-[#6E6880]">
            Ces informations ouvrent votre espace.
          </p>

          <div className="mb-5">
            <Champ
              id="entreprise"
              label="Nom de l'entreprise"
              value={nomEntreprise}
              onChange={setNomEntreprise}
              placeholder="EX : Ma société"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="lien" className="mb-[9px] block text-sm font-semibold text-[#0B1030]">
              Lien de mon espace
            </label>
            {/* .champ-lien : input + suffixe .LM.com accolés */}
            <div className="flex items-stretch">
              <input
                id="lien"
                name="lien"
                type="text"
                value={lien}
                onChange={(event) => setLien(event.target.value)}
                placeholder="Ma société"
                required
                className="h-14 w-full rounded-l-[13px] border border-r-0 border-[#DCD7E8] bg-white px-[18px] text-[15.5px] text-[#0B1030] outline-none transition placeholder:text-[#A49DB5] focus:border-[#EC0C8C] focus:shadow-[0_0_0_3px_rgba(236,12,140,0.13)]"
              />
              <span className="flex items-center whitespace-nowrap rounded-r-[13px] bg-[#0B1030] px-[22px] text-[15px] font-semibold text-white">
                .LM.com
              </span>
            </div>
          </div>

          <div className="mb-5">
            <Champ
              id="rue"
              label="Adresse"
              value={rue}
              onChange={setRue}
              placeholder="Rue, quartier"
              autoComplete="street-address"
              required
            />
          </div>

          <div className="mb-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-x-[26px]">
            <Champ
              id="ville"
              label="Ville"
              value={ville}
              onChange={setVille}
              placeholder="Ex : Abidjan"
              required
            />
            <div className="relative">
              <label htmlFor="pays" className="mb-[9px] block text-sm font-semibold text-[#0B1030]">
                Pays
              </label>
              <select
                id="pays"
                name="pays"
                value={pays}
                onChange={(event) => setPays(event.target.value)}
                required
                className={`${inputBox} cursor-pointer appearance-none`}
              >
                <option value="" disabled hidden />
                {PAYS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute bottom-[19px] right-[18px] text-[#6E6880]">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                  <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </div>

          {!rccmOuvert && (
            <button
              type="button"
              onClick={() => setRccmOuvert(true)}
              className="mb-[22px] inline-block text-[14.5px] font-medium text-[#EC0C8C] hover:underline"
            >
              Vous avez un numéro d&apos;immatriculation ?
            </button>
          )}
          {rccmOuvert && (
            <div className="mb-5">
              <Champ
                id="rccm"
                label="Numéro d'immatriculation"
                value={rccm}
                onChange={setRccm}
                placeholder="RCCM ou équivalent"
                autoFocus
              />
            </div>
          )}

          {/* .accord : case à cocher personnalisée, coche en carré bleu nuit */}
          <label className="mt-[26px] flex cursor-pointer items-center gap-[14px]">
            <span className="relative flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border-[1.5px] border-[#DCD7E8] bg-white">
              <input
                type="checkbox"
                name="cgu"
                required
                checked={cgu}
                onChange={(event) => setCgu(event.target.checked)}
                className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-lg checked:border-[#0B1030] checked:bg-[#0B1030]"
              />
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="hidden h-3.5 w-3.5 text-white peer-checked:block"
                aria-hidden
              >
                <path
                  d="M13 4L6 11L3 8"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[15px] text-[#0B1030]">
              J&apos;accepte les conditions d&apos;utilisation.
            </span>
          </label>

          <button
            type="submit"
            className="mt-[28px] h-[58px] w-full rounded-[13px] bg-[#0B1030] text-[15.5px] font-semibold text-white transition hover:-translate-y-[2px] hover:shadow-[0_14px_28px_rgba(11,16,48,0.24)]"
          >
            Créer mon espace
          </button>
          <button
            type="button"
            onClick={() => setEtape(1)}
            className="mt-[10px] h-[52px] w-full rounded-[13px] border border-[#DCD7E8] text-[15px] font-medium text-[#0B1030] transition hover:border-[#0B1030]"
          >
            Retour
          </button>
        </form>
      )}

      {/* .points : indicateur d'étape */}
      <div className="mt-[34px] flex justify-center gap-2">
        <span
          className={`h-2 rounded-full transition-all ${etape === 1 ? "w-7 bg-[#0B1030]" : "w-2 bg-[#DCD7E8]"}`}
        />
        <span
          className={`h-2 rounded-full transition-all ${etape === 2 ? "w-7 bg-[#0B1030]" : "w-2 bg-[#DCD7E8]"}`}
        />
      </div>
    </div>
  );
}
