"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Parcours "Compléter mon profil" : 9 questions (une par page) + un écran de
  nommage de la boutique + une fiche récapitulative, affichés une seule fois
  après la connexion et avant le tableau de bord — reproduction du flux
  décrit dans la maquette fournie par l'utilisateur (LM Inscription
  boutique.html, écrans 37 à 47).

  L'écran de nommage (écran 46, step 10) est désormais le SEUL endroit où
  nom et lien de la boutique sont demandés (demande utilisateur) —
  InscriptionForm.tsx ne les recueille plus (RegisterPayload n'a plus
  shop_name/shop_slug, voir lib/api/services/auth.ts). Le lien s'affiche
  ici sous la forme "lm.ci/slug" ; brancher une vraie route API devra
  choisir ce format ou l'aligner sur autre chose déjà en place ailleurs.
  L'identifiant "B-24187" et le statut "Disponible" du lien sont pour
  l'instant des valeurs mock, faute de backend pour vérifier la
  disponibilité réelle ou générer l'identifiant.

  Ce que ces écrans NE couvrent PAS (hors scope de ce composant, voir la
  question posée avant de coder) : l'écran d'identité en deux colonnes
  avec code de vérification par email (écrans 32-34) et les conditions
  d'utilisation dépliantes (écran 35).

  Aucune route API pour l'instant : les réponses restent en state React,
  perdues à la fermeture de l'onglet. Quand le backend exposera une route
  (ex. POST /api/profil-boutique), brancher ici avec useApiRequest comme
  InscriptionForm.tsx, et n'avancer à l'étape suivante qu'au succès.

  Pas encore de logique "à afficher une seule fois" : LoginForm.tsx
  redirige ICI systématiquement après connexion plutôt que vers
  /dashboard. Il manque un indicateur côté compte ("profil complété") pour
  sauter ce parcours aux connexions suivantes — à ajouter quand l'API
  existera (ex. champ `profil_complete` sur la réponse de /api/login).
*/

type Statut = "enregistree" | "aucune";
type Experience = "debutant" | "amateur" | "confirme" | "expert";
type Origine = "importes" | "locaux" | "fabrique";
type Modele = "b2c" | "b2b" | "b2b2c" | "c2b" | "d2c";

type Answers = {
  statut: Statut | null;
  experience: Experience | null;
  chiffreAffaires: string | null;
  origine: Origine | null;
  categories: string[];
  paysVente: string[];
  canaux: string[];
  modele: Modele | null;
  distribution: string[];
  nomBoutique: string;
};

const ANSWERS_VIDES: Answers = {
  statut: null,
  experience: null,
  chiffreAffaires: null,
  origine: null,
  categories: [],
  paysVente: ["Côte d'Ivoire"],
  canaux: [],
  modele: null,
  distribution: [],
  nomBoutique: "",
};

const NB_QUESTIONS = 9;

// Mock en attendant une route API (voir commentaire en tête de fichier).
const IDENTIFIANT_BOUTIQUE_MOCK = "B-24187";

function slugifier(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EXPERIENCE_OPTIONS: { value: Experience; label: string; niveau: string; desc: string }[] = [
  { value: "debutant", label: "Moins d'un an", niveau: "Débutant", desc: "Je commence tout juste." },
  { value: "amateur", label: "Un à trois ans", niveau: "Amateur", desc: "J'ai passé les premiers mois." },
  { value: "confirme", label: "Trois à cinq ans", niveau: "Confirmé", desc: "L'activité tourne régulièrement." },
  { value: "expert", label: "Plus de cinq ans", niveau: "Expert", desc: "C'est mon métier depuis longtemps." },
];

const CA_OPTIONS = [
  "Moins de 500 000 F",
  "500 000 à 2 millions F",
  "2 à 10 millions F",
  "Plus de 10 millions F",
];

const ORIGINE_OPTIONS: { value: Origine; label: string; desc: string }[] = [
  { value: "importes", label: "Des produits importés", desc: "Je les achète à l'étranger et je les revends ici." },
  { value: "locaux", label: "Des produits locaux", desc: "Je les achète auprès de producteurs ou de grossistes d'ici." },
  { value: "fabrique", label: "Des produits que je fabrique", desc: "Je les fabrique moi-même et je les vends." },
];

const CATEGORIES = [
  { label: "Beauté et soins", desc: "Cosmétiques, soins du visage, produits capillaires, ongles" },
  { label: "Santé et bien-être", desc: "Compléments, appareils de mesure, hygiène, orthopédie" },
  { label: "Parfums", desc: "Parfums, eaux de toilette, brumes, encens et bougies" },
  { label: "Mode et prêt-à-porter", desc: "Vêtements femme, homme et enfant, tissus, pagnes" },
  { label: "Chaussures et maroquinerie", desc: "Chaussures, sacs, ceintures, portefeuilles, valises" },
  { label: "Bijoux et accessoires", desc: "Bijoux, montres, lunettes, foulards, chapeaux" },
  { label: "Gadgets et high-tech", desc: "Objets connectés, caméras, enceintes, petits appareils" },
  { label: "Téléphonie et accessoires", desc: "Téléphones, écouteurs, coques, chargeurs, cartes mémoire" },
  { label: "Électroménager", desc: "Réfrigérateurs, ventilateurs, mixeurs, fers, machines à laver" },
  { label: "Maison et cuisine", desc: "Ustensiles, vaisselle, rangement, linge de maison" },
  { label: "Décoration et ameublement", desc: "Meubles, tapis, luminaires, rideaux, tableaux" },
  { label: "Bébé et puériculture", desc: "Couches, biberons, poussettes, lits, vêtements bébé" },
  { label: "Enfants et jouets", desc: "Jouets, jeux, articles d'éveil, fournitures scolaires" },
  { label: "Sport et fitness", desc: "Tenues, matériel de musculation, ballons, vélos" },
  { label: "Alimentaire et boissons", desc: "Épicerie, produits secs, condiments, boissons, café" },
  { label: "Auto, moto et pièces", desc: "Pièces détachées, accessoires, entretien, casques, pneus" },
  { label: "Papeterie et bureau", desc: "Fournitures, cahiers, imprimantes, mobilier de bureau" },
  { label: "Agriculture et élevage", desc: "Semences, intrants, petit matériel, alimentation animale" },
] as const;

const MAX_CATEGORIES = 3;

// Drapeau reconstitué en dégradé CSS (comme la maquette), pas d'image :
// pas de flag SVG au catalogue du projet pour l'instant.
const PAYS_DISPONIBLES: { nom: string; indicatif: string; drapeau: string }[] = [
  { nom: "Bénin", indicatif: "+229", drapeau: "linear-gradient(90deg,#008751 0 40%,transparent 40%),linear-gradient(180deg,#FCD116 50%,#E8112D 50%)" },
  { nom: "Togo", indicatif: "+228", drapeau: "linear-gradient(90deg,#D21034 0 40%,transparent 40%),repeating-linear-gradient(180deg,#006A4E 0 20%,#FFCE00 20% 40%)" },
  { nom: "Sénégal", indicatif: "+221", drapeau: "linear-gradient(90deg,#00853F 33.33%,#FDEF42 33.33%,#FDEF42 66.66%,#E31B23 66.66%)" },
  { nom: "Mali", indicatif: "+223", drapeau: "linear-gradient(90deg,#14B53A 33.33%,#FCD116 33.33%,#FCD116 66.66%,#CE1126 66.66%)" },
  { nom: "Guinée", indicatif: "+224", drapeau: "linear-gradient(90deg,#CE1126 33.33%,#FCD116 33.33%,#FCD116 66.66%,#009460 66.66%)" },
  { nom: "Cameroun", indicatif: "+237", drapeau: "linear-gradient(90deg,#007A5E 33.33%,#CE1126 33.33%,#CE1126 66.66%,#FCD116 66.66%)" },
  { nom: "Niger", indicatif: "+227", drapeau: "linear-gradient(180deg,#E05206 33.33%,#fff 33.33%,#fff 66.66%,#0DB02B 66.66%)" },
  { nom: "Burkina Faso", indicatif: "+226", drapeau: "linear-gradient(180deg,#EF2B2D 50%,#009E49 50%)" },
  { nom: "Ghana", indicatif: "+233", drapeau: "linear-gradient(180deg,#CE1126 33.33%,#FCD116 33.33%,#FCD116 66.66%,#006B3F 66.66%)" },
  { nom: "Nigeria", indicatif: "+234", drapeau: "linear-gradient(90deg,#008751 33.33%,#fff 33.33%,#fff 66.66%,#008751 66.66%)" },
  { nom: "Gabon", indicatif: "+241", drapeau: "linear-gradient(180deg,#009E60 33.33%,#FCD116 33.33%,#FCD116 66.66%,#3A75C4 66.66%)" },
  { nom: "RD Congo", indicatif: "+243", drapeau: "linear-gradient(135deg,#007FFF 0 60%,#F7D618 60% 64%,#CE1021 64% 100%)" },
  { nom: "Congo", indicatif: "+242", drapeau: "linear-gradient(45deg,#DC241F 33.33%,#FBDE4A 33.33%,#FBDE4A 66.66%,#009543 66.66%)" },
  { nom: "Tchad", indicatif: "+235", drapeau: "linear-gradient(90deg,#002664 33.33%,#FECB00 33.33%,#FECB00 66.66%,#C60C30 66.66%)" },
  { nom: "Mauritanie", indicatif: "+222", drapeau: "linear-gradient(180deg,#D01C1F 0 8%,#00A95C 8% 92%,#D01C1F 92% 100%)" },
  { nom: "Guinée-Bissau", indicatif: "+245", drapeau: "linear-gradient(90deg,#CE1126 0 33%,transparent 33%),linear-gradient(180deg,#FCD116 50%,#009739 50%)" },
  { nom: "Sierra Leone", indicatif: "+232", drapeau: "linear-gradient(180deg,#1EB53A 33.33%,#fff 33.33%,#fff 66.66%,#0072C6 66.66%)" },
  { nom: "Maroc", indicatif: "+212", drapeau: "#C1272D" },
  { nom: "Tunisie", indicatif: "+216", drapeau: "#E70013" },
  { nom: "Algérie", indicatif: "+213", drapeau: "linear-gradient(90deg,#006233 50%,#fff 50%)" },
  { nom: "Rwanda", indicatif: "+250", drapeau: "linear-gradient(180deg,#00A1DE 50%,#FAD201 50% 65%,#20603D 65% 100%)" },
  { nom: "Belgique", indicatif: "+32", drapeau: "linear-gradient(90deg,#000 33.33%,#FAE042 33.33%,#FAE042 66.66%,#ED2939 66.66%)" },
  { nom: "France", indicatif: "+33", drapeau: "linear-gradient(90deg,#002395 33.33%,#fff 33.33%,#fff 66.66%,#ED2939 66.66%)" },
  { nom: "États-Unis", indicatif: "+1", drapeau: "linear-gradient(180deg,#B22234 0 20%,#fff 20% 40%,#B22234 40% 60%,#fff 60% 80%,#B22234 80% 100%)" },
  { nom: "Canada", indicatif: "+1", drapeau: "linear-gradient(90deg,#FF0000 25%,#fff 25%,#fff 75%,#FF0000 75%)" },
];
const PAYS_ORIGINE = "Côte d'Ivoire";
const VILLE_ORIGINE = "Abidjan";
const DRAPEAU_ORIGINE = "linear-gradient(90deg,#F77F00 33.33%,#fff 33.33%,#fff 66.66%,#009E60 66.66%)";

function drapeauPays(nom: string): string {
  if (nom === PAYS_ORIGINE) return DRAPEAU_ORIGINE;
  return PAYS_DISPONIBLES.find((p) => p.nom === nom)?.drapeau ?? "#333";
}

const CANAUX = [
  "Publicité Facebook",
  "Publicité TikTok",
  "Publicité YouTube",
  "Publicité Google",
  "Live Facebook",
  "Live TikTok",
  "Live Snapchat",
  "Vente organique",
];

const MODELE_OPTIONS: { value: Modele; label: string; desc: string }[] = [
  { value: "b2c", label: "B2C · Je vends au consommateur", desc: "Vos acheteurs sont des particuliers. C'est le cas de la plupart des boutiques du réseau." },
  { value: "b2b", label: "B2B · Je vends à des boutiques", desc: "Vous êtes grossiste ou importateur : vos acheteurs sont des commerçants, qui revendent ensuite." },
  { value: "b2b2c", label: "B2B2C · Je vends aux deux", desc: "Vous approvisionnez des boutiques et vous vendez aussi en direct au consommateur." },
  { value: "c2b", label: "C2B · Je fournis des entreprises", desc: "Vous produisez en votre nom propre et ce sont des entreprises qui vous achètent." },
  { value: "d2c", label: "D2C · Je fabrique et je vends moi-même", desc: "Vous êtes le fabricant et vous vendez directement, sans revendeur." },
];

const DISTRIBUTION_OPTIONS = [
  { value: "stock", label: "Mon propre stock", desc: "J'achète et je stocke la marchandise avant de la vendre." },
  { value: "dropshipping", label: "Dropshipping", desc: "Je vends des produits dont je ne détiens pas le stock." },
  { value: "precommande", label: "Vente par précommande", desc: "Je prends d'abord les commandes, puis je constitue le stock." },
  { value: "commande", label: "Fabrication à la commande", desc: "Je prends la commande, puis je fabrique avant de livrer." },
];

const cardBase =
  "rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] p-4 text-left transition";

function OptionCard({
  selected,
  multi,
  onClick,
  label,
  desc,
  badge,
}: {
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cardBase} flex items-start gap-3 ${
        selected
          ? "border-brand-pink bg-[linear-gradient(135deg,rgba(236,12,140,0.3),rgba(58,29,138,0.18))] shadow-[0_0_0_1px_rgba(236,12,140,0.5)]"
          : "hover:border-white/20"
      }`}
    >
      <span
        className={`mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center border ${
          multi ? "rounded-[5px]" : "rounded-full"
        } ${selected ? "border-brand-pink bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.7)]" : "border-white/25"}`}
      >
        {selected && (
          <svg viewBox="0 0 24 24" fill="none" className="h-[10px] w-[10px]" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#000717" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[16px] font-semibold tracking-tight text-brand-white">{label}</span>
          {badge && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                selected ? "bg-white/15 text-brand-white" : "border border-brand-pink/30 bg-brand-pink/10 text-brand-pink"
              }`}
            >
              {badge}
            </span>
          )}
        </span>
        {desc && <span className="mt-1 block text-[13px] font-light text-brand-white/60">{desc}</span>}
      </span>
    </button>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: NB_QUESTIONS }).map((_, index) => (
        <i
          key={index}
          className={`block h-1 w-6 rounded-full ${
            index < step ? "bg-[linear-gradient(90deg,var(--color-brand-pink),var(--color-brand-purple))]" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function QuestionShell({
  step,
  question,
  sub,
  children,
  canContinue,
  onBack,
  onNext,
  wide,
}: {
  step: number;
  question: string;
  sub: string;
  children: React.ReactNode;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
  wide?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <div className="flex items-center gap-5 border-b border-white/10 pb-6">
        <Image src="/images/logo.svg" alt="Logo LIIVRE MOI" width={52} height={52} className="h-[52px] w-[52px] shrink-0 object-contain" />
        <ProgressBar step={step} />
        <span className="ml-auto shrink-0 text-[9.5px] font-bold uppercase tracking-[0.1em] text-brand-white/40">
          Question {step} sur {NB_QUESTIONS}
        </span>
      </div>

      <div className={`mx-auto mt-9 w-full flex-1 ${wide ? "max-w-3xl" : "max-w-2xl"}`}>
        <h1 className="text-[27px] font-bold leading-[1.22] tracking-tight text-brand-white">{question}</h1>
        <p className="mt-2 text-[11.5px] font-light text-brand-white/60">{sub}</p>

        <div className="mt-6">{children}</div>

        <div className="mt-9 flex items-center justify-between gap-3">
          {/* Bordure en dégradé : border-image ignore border-radius (coins
              carrés garantis), donc pas d'autre choix que l'astuce
              padding-1px + fond dégradé dessous / fond uni arrondi dessus. */}
          <button
            type="button"
            onClick={onBack}
            style={{ background: "linear-gradient(90deg,#EC0C8C 0%,#3A1D8A 58.35%,#FFFFFF 100%)" }}
            className="rounded-2xl p-[1px] transition hover:brightness-110"
          >
            <span className="flex items-center justify-center rounded-[15px] bg-brand-bg px-11 py-3.5 text-[11px] font-semibold text-brand-white">
              Retour
            </span>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className="rounded-2xl bg-brand-white px-9 py-3.5 text-[11px] font-semibold text-brand-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompleterProfilWizard() {
  const router = useRouter();
  // 1..9 = questions, 10 = nommage de la boutique (écran 46), 11 = fiche récapitulative
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(ANSWERS_VIDES);
  const [paysChoisi, setPaysChoisi] = useState(PAYS_DISPONIBLES[0]?.nom ?? "");
  const [listePaysOuverte, setListePaysOuverte] = useState(false);
  const paysChoisiInfo = PAYS_DISPONIBLES.find((p) => p.nom === paysChoisi);

  function toggleCategorie(label: string) {
    setAnswers((precedent) => {
      const deja = precedent.categories.includes(label);
      if (deja) return { ...precedent, categories: precedent.categories.filter((c) => c !== label) };
      if (precedent.categories.length >= MAX_CATEGORIES) return precedent;
      return { ...precedent, categories: [...precedent.categories, label] };
    });
  }

  function toggleCanal(label: string) {
    setAnswers((precedent) => ({
      ...precedent,
      canaux: precedent.canaux.includes(label)
        ? precedent.canaux.filter((c) => c !== label)
        : [...precedent.canaux, label],
    }));
  }

  function toggleDistribution(value: string) {
    setAnswers((precedent) => ({
      ...precedent,
      distribution: precedent.distribution.includes(value)
        ? precedent.distribution.filter((d) => d !== value)
        : [...precedent.distribution, value],
    }));
  }

  function ajouterPays() {
    if (!paysChoisi) return;
    setAnswers((precedent) =>
      precedent.paysVente.includes(paysChoisi)
        ? precedent
        : { ...precedent, paysVente: [...precedent.paysVente, paysChoisi] }
    );
  }

  function retirerPays(nom: string) {
    if (nom === PAYS_ORIGINE) return; // le pays d'origine ne se retire pas
    setAnswers((precedent) => ({ ...precedent, paysVente: precedent.paysVente.filter((p) => p !== nom) }));
  }

  function suivant() {
    setStep((s) => Math.min(s + 1, NB_QUESTIONS + 2));
  }
  function precedent() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function entrerDansMaBoutique() {
    // TODO: rediriger vers le dashboard GRATUIT une fois cette page
    // intégrée (voir commentaire en tête de fichier) — /dashboard est
    // pour l'instant le seul tableau de bord disponible côté frontend.
    router.push("/dashboard");
  }

  if (step === 1) {
    return (
      <QuestionShell
        step={1}
        question="Êtes-vous une entreprise légalement constituée ?"
        sub="Une seule réponse."
        canContinue={answers.statut !== null}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          <OptionCard
            selected={answers.statut === "enregistree"}
            onClick={() => setAnswers({ ...answers, statut: "enregistree" })}
            label="Oui, entreprise enregistrée"
            desc="J'ai un registre de commerce ou un document équivalent."
          />
          <OptionCard
            selected={answers.statut === "aucune"}
            onClick={() => setAnswers({ ...answers, statut: "aucune" })}
            label="Non, pas encore"
            desc="Je vends en mon nom propre, sans structure déclarée."
          />
        </div>
      </QuestionShell>
    );
  }

  if (step === 2) {
    return (
      <QuestionShell
        step={2}
        question="Combien d'années d'expérience avez-vous dans la vente ?"
        sub="Une seule réponse. Le niveau se déduit tout seul."
        canContinue={answers.experience !== null}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              selected={answers.experience === option.value}
              onClick={() => setAnswers({ ...answers, experience: option.value })}
              label={option.label}
              desc={option.desc}
              badge={option.niveau}
            />
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 3) {
    return (
      <QuestionShell
        step={3}
        question="Quel est votre chiffre d'affaires moyen par mois ?"
        sub="Une seule réponse. Elle n'est montrée à personne d'autre."
        canContinue={answers.chiffreAffaires !== null}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {CA_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              selected={answers.chiffreAffaires === option}
              onClick={() => setAnswers({ ...answers, chiffreAffaires: option })}
              label={option}
            />
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 4) {
    return (
      <QuestionShell
        step={4}
        question="D'où viennent vos produits ?"
        sub="Une seule réponse."
        canContinue={answers.origine !== null}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="grid gap-2.5">
          {ORIGINE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              selected={answers.origine === option.value}
              onClick={() => setAnswers({ ...answers, origine: option.value })}
              label={option.label}
              desc={option.desc}
            />
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 5) {
    return (
      <QuestionShell
        step={5}
        question="Quel est votre catalogue ?"
        sub={`Trois réponses au maximum · ${answers.categories.length}/${MAX_CATEGORIES} choisies.`}
        canContinue={answers.categories.length > 0}
        onBack={precedent}
        onNext={suivant}
        wide
      >
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <OptionCard
              key={cat.label}
              multi
              selected={answers.categories.includes(cat.label)}
              onClick={() => toggleCategorie(cat.label)}
              label={cat.label}
              desc={cat.desc}
            />
          ))}
        </div>
        <p className="mt-5 border-l border-white/15 pl-3.5 text-[11px] font-light leading-relaxed text-brand-white/50">
          Ce choix range vos produits, sert de filtre à vos clients sur votre page de commande, et permet aux
          entreprises agréées de savoir si elles savent transporter ce que vous vendez — un cosmétique liquide et
          une pièce de moto ne s&apos;emballent pas de la même façon.
        </p>
      </QuestionShell>
    );
  }

  if (step === 6) {
    return (
      <QuestionShell
        step={6}
        question="Dans quels pays vendez-vous ?"
        sub="Votre pays est déjà là. Ajoutez les autres un par un, et validez chacun avant de passer au suivant."
        canContinue={answers.paysVente.length > 0}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="flex flex-wrap gap-2">
          {answers.paysVente.map((nom) => {
            const info = PAYS_DISPONIBLES.find((p) => p.nom === nom);
            const estOrigine = nom === PAYS_ORIGINE;
            return (
              <span
                key={nom}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11.5px] font-medium ${
                  estOrigine ? "border-brand-pink/40 bg-brand-pink/10" : "border-white/15 bg-white/[0.04]"
                }`}
              >
                <i className="block h-3.5 w-5 rounded-sm" style={{ background: estOrigine ? DRAPEAU_ORIGINE : info?.drapeau }} />
                {nom}
                {estOrigine ? (
                  <em className="rounded-full bg-brand-pink/15 px-2 py-0.5 text-[8px] font-bold not-italic uppercase tracking-wider text-brand-pink">
                    Votre pays
                  </em>
                ) : (
                  <button type="button" onClick={() => retirerPays(nom)} aria-label={`Retirer ${nom}`} className="text-brand-white/50 hover:text-brand-white">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
                      <path d="M7.6 7.6 16.4 16.4M16.4 7.6 7.6 16.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </span>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => setListePaysOuverte((o) => !o)}
            className="flex h-[52px] flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-4 text-left text-[12.5px] font-medium text-brand-white outline-none transition focus:border-brand-pink/60"
          >
            <i className="block h-3.5 w-5 shrink-0 rounded-sm" style={{ background: paysChoisiInfo?.drapeau }} />
            <span className="flex-1">{paysChoisi}</span>
            <svg
              width="11"
              height="7"
              viewBox="0 0 12 8"
              fill="none"
              aria-hidden
              className={`shrink-0 text-brand-white/40 transition-transform ${listePaysOuverte ? "rotate-180" : ""}`}
            >
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={ajouterPays}
            className="shrink-0 rounded-2xl bg-brand-white px-6 text-[11.5px] font-semibold text-brand-bg transition hover:opacity-90"
          >
            Ajouter ce pays
          </button>
        </div>

        {listePaysOuverte && (
          <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0e1e] p-1.5">
            {PAYS_DISPONIBLES.filter((p) => !answers.paysVente.includes(p.nom)).map((p) => (
              <button
                key={p.nom}
                type="button"
                onClick={() => {
                  setPaysChoisi(p.nom);
                  setListePaysOuverte(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12.5px] transition ${
                  p.nom === paysChoisi ? "bg-white/[0.07] font-semibold text-brand-white" : "font-light text-brand-white/70 hover:bg-white/[0.04]"
                }`}
              >
                <i className="block h-3.5 w-5 shrink-0 rounded-sm" style={{ background: p.drapeau }} />
                <span className="flex-1">{p.nom}</span>
                <span className="text-brand-white/50">{p.indicatif}</span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-5 border-l border-white/15 pl-3.5 text-[11px] font-light leading-relaxed text-brand-white/50">
          Un seul pays s&apos;ajoute à la fois, et il faut le valider pour qu&apos;il rejoigne la liste du haut. Chaque
          pays ajouté engage une zone qu&apos;une entreprise agréée devra pouvoir couvrir. Votre pays d&apos;origine
          ne peut pas être retiré ; les autres se retirent d&apos;une croix.
        </p>
      </QuestionShell>
    );
  }

  if (step === 7) {
    return (
      <QuestionShell
        step={7}
        question="Comment trouvez-vous vos clients ?"
        sub="Plusieurs réponses possibles."
        canContinue={answers.canaux.length > 0}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {CANAUX.map((canal) => (
            <OptionCard key={canal} multi selected={answers.canaux.includes(canal)} onClick={() => toggleCanal(canal)} label={canal} />
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 8) {
    return (
      <QuestionShell
        step={8}
        question="À qui vendez-vous ?"
        sub="Une seule réponse. C'est elle qui décide de ce que la plateforme vous proposera."
        canContinue={answers.modele !== null}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="grid gap-2.5">
          {MODELE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              selected={answers.modele === option.value}
              onClick={() => setAnswers({ ...answers, modele: option.value })}
              label={option.label}
              desc={option.desc}
            />
          ))}
        </div>
      </QuestionShell>
    );
  }

  if (step === 9) {
    return (
      <QuestionShell
        step={9}
        question="Comment constituez-vous ce que vous vendez ?"
        sub="Plusieurs réponses possibles : beaucoup de boutiques en combinent deux."
        canContinue={answers.distribution.length > 0}
        onBack={precedent}
        onNext={suivant}
      >
        <div className="grid gap-2.5">
          {DISTRIBUTION_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              multi
              selected={answers.distribution.includes(option.value)}
              onClick={() => toggleDistribution(option.value)}
              label={option.label}
              desc={option.desc}
            />
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-[#2A6E8C]/40 bg-[linear-gradient(160deg,rgba(24,64,98,0.22),rgba(20,26,48,0.4))] p-4">
          <p className="text-[13px] font-semibold text-brand-white">Ce que votre réponse ouvrira</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2E6FA0] text-[13px] font-bold text-brand-white">
                S
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-brand-white">Stockage Management</p>
                <p className="mt-0.5 text-[11px] font-light leading-relaxed text-brand-white/50">
                  Pour votre propre stock : vous déposez, le partenaire garde et livre.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2E6FA0] text-[13px] font-bold text-brand-white">
                P
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-brand-white">Drop du partenaire</p>
                <p className="mt-0.5 text-[11px] font-light leading-relaxed text-brand-white/50">
                  Pour le dropshipping : aucun stock avancé de votre part.
                </p>
              </div>
            </div>
          </div>
        </div>
      </QuestionShell>
    );
  }

  if (step === 10) {
    const slug = slugifier(answers.nomBoutique) || "votre-boutique";
    return (
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
        <h1 className="text-[27px] font-bold leading-[1.22] tracking-tight text-brand-white">
          Comment s&apos;appelle votre boutique ?
        </h1>
        <p className="mt-2 text-[11.5px] font-light text-brand-white/60">
          C&apos;est le seul renseignement qui concerne la boutique et non vous. Jusqu&apos;ici, tout parlait de
          l&apos;entrepreneur.
        </p>

        <div className="mt-6">
          <label htmlFor="nom-boutique" className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-white/40">
            Nom de la boutique
          </label>
          <input
            id="nom-boutique"
            type="text"
            autoComplete="organization"
            value={answers.nomBoutique}
            onChange={(event) => setAnswers({ ...answers, nomBoutique: event.target.value })}
            placeholder="Ex : Ma boutique"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-4 text-[17px] font-bold text-brand-white outline-none transition placeholder:font-normal placeholder:text-brand-white/30 focus:border-brand-pink/60"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-[#0e1226] p-1.5">
          <div className="flex items-center gap-4 px-3.5 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1B3A6B]/50 text-[#6FAEFF]">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
                <path
                  d="M9.5 14.5 14.5 9.5M8 17l-1.5 1.5a3 3 0 0 1-4.24-4.24L4 12.5m12-3L17.5 8a3 3 0 1 0-4.24-4.24L11.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-brand-white/40">Le lien de votre boutique</p>
              <p className="truncate text-[15px] font-bold text-brand-white">
                <span className="font-normal text-brand-white/50">lm.ci/</span>
                {slug}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[#4FE0AE]/45 bg-[#4FE0AE]/10 px-3 py-1 text-[10.5px] font-semibold text-[#4FE0AE]">
              Disponible
            </span>
          </div>

          <div className="border-t border-white/5" />

          <div className="flex items-center gap-4 px-3.5 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-pink/15 text-brand-pink">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-brand-white/40">L&apos;identifiant de votre boutique</p>
              <p className="text-[15px] font-bold text-brand-white">{IDENTIFIANT_BOUTIQUE_MOCK}</p>
            </div>
            <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10.5px] font-semibold text-brand-white/70">
              Définitif
            </span>
          </div>
        </div>

        <p className="mt-5 border-l border-white/15 pl-3.5 text-[11px] font-light leading-relaxed text-brand-white/50">
          Le lien se fabrique tout seul à partir du nom, pendant que vous l&apos;écrivez. Il peut être modifié une
          fois, avant la publication de votre premier produit. L&apos;identifiant, lui, ne change jamais : c&apos;est
          par lui que le partenaire agréé, les livreurs et le centre d&apos;appel reconnaissent votre boutique, même
          si vous la renommez.
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-9">
          <button
            type="button"
            onClick={precedent}
            className="rounded-2xl border border-brand-pink/60 px-11 py-3.5 text-[11px] font-semibold text-brand-white transition hover:bg-brand-pink/10"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={suivant}
            disabled={answers.nomBoutique.trim().length === 0}
            className="rounded-2xl bg-brand-white px-9 py-3.5 text-[11px] font-semibold text-brand-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Créer ma boutique
          </button>
        </div>
      </div>
    );
  }

  // ---------- étape 11 : fiche récapitulative (écran 47) ----------
  const experienceLabel = EXPERIENCE_OPTIONS.find((o) => o.value === answers.experience);
  const origineLabel = ORIGINE_OPTIONS.find((o) => o.value === answers.origine);
  const modeleLabel = MODELE_OPTIONS.find((o) => o.value === answers.modele);
  const distributionLabel = DISTRIBUTION_OPTIONS.filter((o) => answers.distribution.includes(o.value))
    .map((o) => o.label)
    .join(" et ");

  const lignes: { label: string; valeur: string; pays?: string[]; accent?: boolean }[] = [
    { label: "Boutique ouverte depuis", valeur: "Aujourd'hui" },
    { label: "Pays de la boutique", valeur: `${PAYS_ORIGINE} · ${VILLE_ORIGINE}`, pays: [PAYS_ORIGINE] },
    { label: "Pays où elle vend", valeur: answers.paysVente.join(", "), pays: answers.paysVente, accent: true },
    { label: "Statut", valeur: answers.statut === "enregistree" ? "Entreprise enregistrée" : "Sans structure déclarée" },
    { label: "Expérience", valeur: experienceLabel ? `${experienceLabel.label} · ${experienceLabel.niveau.toLowerCase()}` : "—", accent: true },
    { label: "Chiffre d'affaires moyen", valeur: answers.chiffreAffaires ?? "—", accent: true },
    { label: "Origine des produits", valeur: origineLabel?.label ?? "—", accent: true },
    { label: "Catégories", valeur: answers.categories.join(" · ") || "—" },
    { label: "Canaux de vente", valeur: answers.canaux.join(", ") || "—" },
    { label: "Modèle", valeur: modeleLabel?.label ?? "—" },
    { label: "Distribution", valeur: distributionLabel || "—", accent: true },
  ];

  const MASQUES = ["Nom et prénoms", "Numéro de téléphone", "Adresse email", "Adresse exacte"];

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <div className="flex items-center gap-3">
        <Image src="/images/logo.svg" alt="Logo LIIVRE MOI" width={52} height={52} className="h-[52px] w-[52px] shrink-0 object-contain" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-white/50">Terminé</span>
      </div>

      <div className="mt-9 flex items-center gap-4">
        <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 border-[#4FE0AE]/45 bg-[#4FE0AE]/10 text-[#4FE0AE]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <path d="m6.6 12.4 3.6 3.6 7.2-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-white">Votre boutique est ouverte</h1>
          <p className="mt-1 text-[11.5px] font-light text-brand-white/60">
            Gratuite, sans engagement. Vous pouvez créer vos premiers produits dès maintenant.
          </p>
        </div>
      </div>

      {/* fiche vue par les entreprises agréées */}
      <div className="mt-6 rounded-2xl border border-brand-purple/40 bg-[linear-gradient(160deg,rgba(58,29,138,0.22),rgba(20,26,48,0.4))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-brand-white">Ce que les entreprises agréées verront de vous</p>
            <p className="mt-1 max-w-md text-[10.5px] font-light text-brand-white/55">
              C&apos;est à partir de cette fiche qu&apos;une entreprise agréée peut vous repérer et vous proposer une
              affiliation. Elle ne contient rien qui permette de vous joindre directement.
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {lignes.map((ligne) => (
            <div key={ligne.label} className="flex items-center justify-between gap-4 py-2.5 text-[11px]">
              <span className="font-light text-brand-white/50">{ligne.label}</span>
              <span
                className={`flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-right font-semibold ${
                  ligne.accent ? "text-brand-pink" : "text-brand-white"
                }`}
              >
                {ligne.pays
                  ? ligne.pays.map((nom, index) => (
                      <span key={nom} className="flex items-center gap-1.5">
                        <i className="block h-2.5 w-4 shrink-0 rounded-[1px]" style={{ background: drapeauPays(nom) }} />
                        {nom}
                        {index < ligne.pays!.length - 1 && ","}
                      </span>
                    ))
                  : ligne.valeur}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ce qui reste masqué */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-brand-white">Ce qui reste masqué</p>
          <span className="rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[8.5px] font-semibold text-brand-white/70">
            Jamais transmis sans votre accord
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MASQUES.map((champ) => (
            <div key={champ} className="flex items-center gap-2.5 text-[10px] font-light text-brand-white/40">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
                <rect x="4.6" y="10.4" width="14.8" height="9.4" rx="2.6" stroke="currentColor" strokeWidth="1.4" fill="none" />
                <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
              {champ}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-light text-brand-white/40">
          Une entreprise agréée qui souhaite vous contacter passe par la plateforme. Vos coordonnées ne lui sont
          communiquées qu&apos;après votre accord, et jamais avant.
        </p>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          title="Bientôt disponible"
          className="rounded-2xl border border-white/15 px-6 py-3.5 text-[11px] font-semibold text-brand-white/60"
        >
          Voir les entreprises agréées
        </button>
        <button
          type="button"
          onClick={entrerDansMaBoutique}
          className="rounded-2xl bg-brand-white px-9 py-3.5 text-[11px] font-semibold text-brand-bg transition hover:opacity-90"
        >
          Entrer dans ma boutique
        </button>
      </div>
    </div>
  );
}
