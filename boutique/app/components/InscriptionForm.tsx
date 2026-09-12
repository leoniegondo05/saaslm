"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { register } from "../../lib/api/services/auth";
import { useApiRequest } from "../../lib/api/hooks/useApiRequest";

/*
  Formulaire d'inscription, extrait de app/inscription/page.tsx pour
  pouvoir être un composant client (état + appel API) tout en gardant la
  page en composant serveur (export const metadata).

  Trois vues l'une après l'autre dans cette même page (pas de route à
  part) — écrans 35 et 36 de la maquette fournie par l'utilisateur (LM
  Inscription boutique.html) :
    "formulaire"   les champs habituels (nom, email, téléphone, mot de
                    passe), dans cet ordre précis (demande utilisateur) :
                    nom & prénom, puis téléphone (avec indicatif pays +
                    drapeau), puis e-mail (avec son code de confirmation),
                    puis mot de passe + confirmation. Nom et lien de la
                    boutique ne sont PLUS demandés ici (demande
                    utilisateur) : le parcours "Compléter mon profil"
                    (CompleterProfilWizard.tsx, step 10) les recueille et
                    génère le lien lm.ci/... automatiquement.
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

// Indicatifs proposés au champ téléphone (drapeau + code pays) — zone
// francophone d'Afrique de l'Ouest/Centrale où LM opère, plus la France.
// +225 (Côte d'Ivoire) reste la valeur par défaut, déjà utilisée comme
// exemple de placeholder plus bas. `iso` sert de clé pour <Drapeau> —
// drapeaux dessinés en SVG inline (pas d'emoji : rendu quasi absent sur
// Windows, glyphe manquant ou remplacé par le code pays en texte selon
// la police ; pas de CDN d'images non plus, bloqué par le
// Content-Security-Policy actuel — img-src 'self' blob: data: dans
// proxy.ts, voir [[csp-nonce-proxy-tradeoff]]).
const INDICATIFS = [
  { pays: "Côte d'Ivoire", iso: "CI", code: "+225" },
  { pays: "Sénégal", iso: "SN", code: "+221" },
  { pays: "France", iso: "FR", code: "+33" },
  { pays: "Cameroun", iso: "CM", code: "+237" },
  { pays: "Bénin", iso: "BJ", code: "+229" },
  { pays: "Togo", iso: "TG", code: "+228" },
  { pays: "Mali", iso: "ML", code: "+223" },
  { pays: "Burkina Faso", iso: "BF", code: "+226" },
  { pays: "Guinée", iso: "GN", code: "+224" },
  { pays: "Niger", iso: "NE", code: "+227" },
  { pays: "Gabon", iso: "GA", code: "+241" },
  { pays: "Congo", iso: "CG", code: "+242" },
  { pays: "RD Congo", iso: "CD", code: "+243" },
  { pays: "Maroc", iso: "MA", code: "+212" },
  { pays: "Nigeria", iso: "NG", code: "+234" },
  { pays: "Ghana", iso: "GH", code: "+233" },
  { pays: "Tunisie", iso: "TN", code: "+216" },
  { pays: "Algérie", iso: "DZ", code: "+213" },
  { pays: "Égypte", iso: "EG", code: "+20" },
  { pays: "Kenya", iso: "KE", code: "+254" },
  { pays: "Rwanda", iso: "RW", code: "+250" },
  { pays: "Tchad", iso: "TD", code: "+235" },
  { pays: "Mauritanie", iso: "MR", code: "+222" },
  { pays: "Guinée-Bissau", iso: "GW", code: "+245" },
  { pays: "Cap-Vert", iso: "CV", code: "+238" },
  { pays: "Sierra Leone", iso: "SL", code: "+232" },
  { pays: "Liberia", iso: "LR", code: "+231" },
  { pays: "Belgique", iso: "BE", code: "+32" },
  { pays: "Suisse", iso: "CH", code: "+41" },
  { pays: "Allemagne", iso: "DE", code: "+49" },
  { pays: "Royaume-Uni", iso: "GB", code: "+44" },
  { pays: "Espagne", iso: "ES", code: "+34" },
  { pays: "Portugal", iso: "PT", code: "+351" },
  { pays: "Italie", iso: "IT", code: "+39" },
  { pays: "Pays-Bas", iso: "NL", code: "+31" },
  { pays: "États-Unis", iso: "US", code: "+1" },
  { pays: "Canada", iso: "CA", code: "+1" },
  { pays: "Émirats arabes unis", iso: "AE", code: "+971" },
  { pays: "Inde", iso: "IN", code: "+91" },
  { pays: "Chine", iso: "CN", code: "+86" },
];

// Étoile à 5 branches (unité, pointe en haut) utilisée par plusieurs
// drapeaux ci-dessous — mise à l'échelle et positionnée via `transform`.
const POINTS_ETOILE =
  "0,-1 0.2234,-0.3074 0.9511,-0.309 0.3614,0.1174 0.5878,0.809 0,0.38 -0.5878,0.809 -0.3614,0.1174 -0.9511,-0.309 -0.2234,-0.3074";

function Etoile({ cx, cy, rayon, couleur }: { cx: number; cy: number; rayon: number; couleur: string }) {
  return <polygon points={POINTS_ETOILE} transform={`translate(${cx} ${cy}) scale(${rayon})`} fill={couleur} />;
}

function BandesVerticales({ couleurs }: { couleurs: string[] }) {
  const largeur = 30 / couleurs.length;
  return (
    <>
      {couleurs.map((couleur, index) => (
        <rect key={index} x={index * largeur} y={0} width={largeur} height={20} fill={couleur} />
      ))}
    </>
  );
}

function BandesHorizontales({ couleurs }: { couleurs: string[] }) {
  const hauteur = 20 / couleurs.length;
  return (
    <>
      {couleurs.map((couleur, index) => (
        <rect key={index} x={0} y={index * hauteur} width={30} height={hauteur} fill={couleur} />
      ))}
    </>
  );
}

// Un <rect>/<polygon> par pays, dans un viewBox 30x20 commun — approximations
// simplifiées (bandes + étoile stylisée), pas les emblèmes officiels au
// tracé exact, mais reconnaissables à la taille d'une puce de formulaire.
function Drapeau({ iso }: { iso: string }) {
  switch (iso) {
    case "CI":
      return <BandesVerticales couleurs={["#FF8200", "#FFFFFF", "#009E60"]} />;
    case "SN":
      return (
        <>
          <BandesVerticales couleurs={["#00853F", "#FDEF42", "#E31B23"]} />
          <Etoile cx={15} cy={10} rayon={2.6} couleur="#00853F" />
        </>
      );
    case "FR":
      return <BandesVerticales couleurs={["#002654", "#FFFFFF", "#CE1126"]} />;
    case "CM":
      return (
        <>
          <BandesVerticales couleurs={["#007A5E", "#CE1126", "#FCD116"]} />
          <Etoile cx={15} cy={10} rayon={2.6} couleur="#FCD116" />
        </>
      );
    case "BJ":
      return (
        <>
          <rect x={0} y={0} width={12} height={20} fill="#008751" />
          <rect x={12} y={0} width={18} height={10} fill="#FCD116" />
          <rect x={12} y={10} width={18} height={10} fill="#E8112D" />
        </>
      );
    case "TG":
      return (
        <>
          <BandesHorizontales couleurs={["#006A4E", "#FFCE00", "#006A4E", "#FFCE00", "#006A4E"]} />
          <rect x={0} y={0} width={12} height={11} fill="#D21034" />
          <Etoile cx={6} cy={5.5} rayon={1.8} couleur="#FFFFFF" />
        </>
      );
    case "ML":
      return <BandesVerticales couleurs={["#14B53A", "#FCD116", "#CE1126"]} />;
    case "BF":
      return (
        <>
          <BandesHorizontales couleurs={["#EF2B2D", "#009E49"]} />
          <Etoile cx={15} cy={10} rayon={2.6} couleur="#FCD116" />
        </>
      );
    case "GN":
      return <BandesVerticales couleurs={["#CE1126", "#FCD116", "#009460"]} />;
    case "NE":
      return (
        <>
          <BandesHorizontales couleurs={["#E05206", "#FFFFFF", "#0DB02B"]} />
          <circle cx={15} cy={10} r={2.4} fill="#E05206" />
        </>
      );
    case "GA":
      return <BandesHorizontales couleurs={["#009E60", "#FCD116", "#3A75C4"]} />;
    case "CG":
      return (
        <>
          <polygon points="0,0 30,0 0,13.3" fill="#009543" />
          <polygon points="30,0 0,13.3 0,20 30,6.7" fill="#FBDE4A" />
          <polygon points="0,20 30,20 30,6.7" fill="#DC241F" />
        </>
      );
    case "CD":
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#007FFF" />
          <polygon points="0,13 0,20 30,7 30,0" fill="#F7D618" />
          <polygon points="0,15 0,18 30,5 30,2" fill="#CE1021" />
          <Etoile cx={7} cy={6} rayon={2} couleur="#F7D618" />
        </>
      );
    case "MA":
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#C1272D" />
          <Etoile cx={15} cy={10} rayon={3.2} couleur="#006233" />
        </>
      );
    case "NG":
      return <BandesVerticales couleurs={["#008751", "#FFFFFF", "#008751"]} />;
    case "GH":
      return (
        <>
          <BandesHorizontales couleurs={["#CE1126", "#FCD116", "#006B3F"]} />
          <Etoile cx={15} cy={10} rayon={2.4} couleur="#000000" />
        </>
      );
    case "TN":
      // Croissant + étoile omis (simplifié en étoile seule) : détail trop
      // fin pour un chip de 20x14.
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#E70013" />
          <circle cx={15} cy={10} r={5.5} fill="#FFFFFF" />
          <Etoile cx={15} cy={10} rayon={2.2} couleur="#E70013" />
        </>
      );
    case "DZ":
      // Croissant + étoile simplifiés en étoile seule (voir TN).
      return (
        <>
          <BandesVerticales couleurs={["#006233", "#FFFFFF"]} />
          <Etoile cx={15} cy={10} rayon={2.6} couleur="#D21034" />
        </>
      );
    case "EG":
      // Aigle de Saladin omis : bandes seules.
      return <BandesHorizontales couleurs={["#CE1126", "#FFFFFF", "#000000"]} />;
    case "KE":
      // Bouclier + lances omis : bandes seules (liseré blanc simplifié).
      return <BandesHorizontales couleurs={["#000000", "#BB0000", "#006600"]} />;
    case "RW":
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#00A1DE" />
          <rect x={0} y={13.3} width={30} height={3.3} fill="#FAD201" />
          <rect x={0} y={16.7} width={30} height={3.3} fill="#20603D" />
          <circle cx={22} cy={6} r={3} fill="#FAD201" />
        </>
      );
    case "TD":
      return <BandesVerticales couleurs={["#002664", "#FECB00", "#C60C30"]} />;
    case "MR":
      // Croissant + étoile simplifiés en étoile seule (voir TN).
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#00A95C" />
          <Etoile cx={15} cy={10} rayon={2.8} couleur="#FFC400" />
        </>
      );
    case "GW":
      return (
        <>
          <rect x={12} y={0} width={18} height={10} fill="#FCD116" />
          <rect x={12} y={10} width={18} height={10} fill="#009E49" />
          <rect x={0} y={0} width={12} height={20} fill="#CE1126" />
          <Etoile cx={6} cy={10} rayon={2.2} couleur="#000000" />
        </>
      );
    case "CV":
      // Anneau d'étoiles omis (10 petites étoiles) : une seule, centrée.
      return (
        <>
          <BandesHorizontales couleurs={["#003893", "#003893", "#FFFFFF", "#CF2027", "#FFFFFF", "#003893", "#003893"]} />
          <Etoile cx={15} cy={10} rayon={2} couleur="#F7D116" />
        </>
      );
    case "SL":
      return <BandesHorizontales couleurs={["#1EB53A", "#FFFFFF", "#0072C6"]} />;
    case "LR":
      // 11 bandes + carré étoilé simplifiés en 3 bandes + canton uni.
      return (
        <>
          <BandesHorizontales couleurs={["#BF0A30", "#FFFFFF", "#BF0A30"]} />
          <rect x={0} y={0} width={12} height={10} fill="#002868" />
          <Etoile cx={6} cy={5} rayon={1.8} couleur="#FFFFFF" />
        </>
      );
    case "BE":
      return <BandesVerticales couleurs={["#000000", "#FDDA24", "#EF3340"]} />;
    case "CH":
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#D52B1E" />
          <rect x={12} y={5} width={6} height={10} fill="#FFFFFF" />
          <rect x={9} y={8} width={12} height={4} fill="#FFFFFF" />
        </>
      );
    case "DE":
      return <BandesHorizontales couleurs={["#000000", "#DD0000", "#FFCE00"]} />;
    case "GB":
      // Union Jack simplifié (pas de diagonales Saint-Patrick) : croix
      // blanche + croix rouge sur fond bleu.
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#00247D" />
          <rect x={12} y={0} width={6} height={20} fill="#FFFFFF" />
          <rect x={0} y={7} width={30} height={6} fill="#FFFFFF" />
          <rect x={13.5} y={0} width={3} height={20} fill="#CF142B" />
          <rect x={0} y={8.5} width={30} height={3} fill="#CF142B" />
        </>
      );
    case "ES":
      return <BandesHorizontales couleurs={["#AA151B", "#F1BF00", "#AA151B"]} />;
    case "PT":
      // Écusson omis : bandes seules.
      return <BandesVerticales couleurs={["#046A38", "#046A38", "#DA291C", "#DA291C", "#DA291C"]} />;
    case "IT":
      return <BandesVerticales couleurs={["#008C45", "#F4F5F0", "#CD212A"]} />;
    case "NL":
      return <BandesHorizontales couleurs={["#AE1C28", "#FFFFFF", "#21468B"]} />;
    case "US":
      // 13 bandes + 50 étoiles simplifiées en 7 bandes + canton uni.
      return (
        <>
          <BandesHorizontales couleurs={["#B22234", "#FFFFFF", "#B22234", "#FFFFFF", "#B22234", "#FFFFFF", "#B22234"]} />
          <rect x={0} y={0} width={13} height={11.4} fill="#3C3B6E" />
        </>
      );
    case "CA":
      // Feuille d'érable simplifiée en losange.
      return (
        <>
          <BandesVerticales couleurs={["#FF0000", "#FFFFFF", "#FF0000"]} />
          <polygon points="15,6 18,10 15,14 12,10" fill="#FF0000" />
        </>
      );
    case "AE":
      return (
        <>
          <BandesHorizontales couleurs={["#00732F", "#FFFFFF", "#000000"]} />
          <rect x={0} y={0} width={8} height={20} fill="#FF0000" />
        </>
      );
    case "IN":
      // Chakra (roue) simplifiée en cercle.
      return (
        <>
          <BandesHorizontales couleurs={["#FF9933", "#FFFFFF", "#138808"]} />
          <circle cx={15} cy={10} r={2.6} fill="none" stroke="#000080" strokeWidth={0.6} />
        </>
      );
    case "CN":
      // Constellation des 5 étoiles simplifiée en une seule.
      return (
        <>
          <rect x={0} y={0} width={30} height={20} fill="#DE2910" />
          <Etoile cx={7} cy={6} rayon={2.6} couleur="#FFDE00" />
        </>
      );
    default:
      return <rect x={0} y={0} width={30} height={20} fill="#333333" />;
  }
}

function DrapeauChip({ iso }: { iso: string }) {
  return (
    <span className="inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] border border-white/15" aria-hidden>
      <svg viewBox="0 0 30 20" className="h-full w-full">
        <Drapeau iso={iso} />
      </svg>
    </span>
  );
}

// Bouton "oeil" pour basculer un champ mot de passe en clair — icône
// barrée quand le mot de passe est déjà visible (clic = repasser en
// masqué).
function BoutonOeil({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      tabIndex={-1}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-white/40 transition hover:text-brand-white/80"
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
        <path
          d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
        {visible && <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      </svg>
    </button>
  );
}

// Règles mot de passe — purement informatives : affichées en direct
// pendant la saisie (checklist + barre de force sous le champ) mais
// jamais imposées, ni ici ni au submit (demande utilisateur : le
// mot de passe choisi est toujours accepté, on se contente de signaler
// s'il est solide ou non). "chiffres qui se suivent" = deux chiffres adjacents consécutifs, dans
// un sens ou l'autre (12, 21, 89, 98…). "même caractère deux fois" =
// n'importe quel caractère répété n'importe où dans le mot de passe, pas
// seulement à la suite.
function aDesChiffresConsecutifs(pw: string) {
  for (let i = 0; i < pw.length - 1; i += 1) {
    const a = pw[i];
    const b = pw[i + 1];
    if (/\d/.test(a) && /\d/.test(b) && Math.abs(Number(b) - Number(a)) === 1) {
      return true;
    }
  }
  return false;
}

function aUnCaractereRepete(pw: string) {
  return new Set(pw).size !== pw.length;
}

function contientLeNom(pw: string, nom: string) {
  const pwMin = pw.toLowerCase();
  return nom
    .toLowerCase()
    .split(/\s+/)
    .filter((mot) => mot.length >= 2)
    .some((mot) => pwMin.includes(mot));
}

function contientLeTelephone(pw: string, telephone: string) {
  const chiffres = telephone.replace(/\D/g, "");
  if (chiffres.length < 4) return false;
  for (let i = 0; i <= chiffres.length - 4; i += 1) {
    if (pw.includes(chiffres.slice(i, i + 4))) return true;
  }
  return false;
}

function reglesMotDePasse(pw: string, nom: string, telephone: string) {
  return {
    longueur: pw.length >= 8,
    majusculeMinuscule: /[A-Z]/.test(pw) && /[a-z]/.test(pw),
    chiffre: /\d/.test(pw),
    pasDeSuite: !aDesChiffresConsecutifs(pw),
    pasDeRepetition: !aUnCaractereRepete(pw),
    pasLeNom: !contientLeNom(pw, nom),
    pasLeTelephone: !contientLeTelephone(pw, telephone),
  };
}

// Indicateur de force — informatif seulement, ne bloque jamais la
// saisie ni la soumission (demande utilisateur : l'utilisateur peut
// mettre le mot de passe qu'il veut, on lui signale juste si c'est
// solide ou non). Score = nombre de règles respectées parmi les 7 de
// reglesMotDePasse ci-dessus.
type ForceMotDePasse = { score: number; label: string; couleur: string };

function forceMotDePasse(pw: string, nom: string, telephone: string): ForceMotDePasse {
  if (pw.length === 0) return { score: 0, label: "", couleur: "" };
  const regles = reglesMotDePasse(pw, nom, telephone);
  const score = Object.values(regles).filter(Boolean).length;
  if (score <= 2) return { score, label: "Faible", couleur: "#E8524B" };
  if (score <= 4) return { score, label: "Peu solide", couleur: "#F5A623" };
  if (score <= 6) return { score, label: "Solide", couleur: "#4FE0AE" };
  return { score, label: "Très solide", couleur: "#4FE0AE" };
}

export default function InscriptionForm() {
  const router = useRouter();
  // `run` pas appelé pour l'instant — voir handleAccepterConditions plus
  // bas, backend pas encore branché. Gardé prêt (loading/error déjà
  // câblés dans le JSX) pour le jour où l'appel sera réactivé.
  const { loading, error } = useApiRequest(register);

  const [vue, setVue] = useState<"formulaire" | "conditions" | "confirmation">("formulaire");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Valeur d'état = iso du pays, pas l'indicatif : plusieurs pays
  // partagent le même indicatif (+1 pour États-Unis et Canada), l'iso
  // reste seul unique.
  const [indicatif, setIndicatif] = useState(INDICATIFS[0].iso);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [cguAccepte, setCguAccepte] = useState(false);
  const [erreurMotDePasse, setErreurMotDePasse] = useState<string | null>(null);

  // Code de confirmation envoyé par e-mail : pas d'endpoint Laravel pour
  // l'instant (voir lib/api/services/auth.ts, rien pour
  // send-code/verify-code) — mot de passe verrouillé tant que le code (6
  // chiffres) n'est pas saisi. À brancher sur le vrai flux dès que la
  // route existe.
  // Bouton "Valider" dans le champ e-mail (demande utilisateur) : la case
  // du code ne s'affiche qu'après ce clic, et le bouton reste grisé tant
  // que l'adresse ne respecte pas le format e-mail (emailValide).
  // Modifier l'adresse après coup referme la case et vide le code déjà
  // saisi — un nouveau code correspondrait à une autre adresse.
  const CODE_LENGTH = 6;
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [codeEnvoye, setCodeEnvoye] = useState(false);
  const codeBoxRefs = useRef<Array<HTMLInputElement | null>>([]);

  function handleEmailChange(value: string) {
    setEmail(value);
    setCodeEnvoye(false);
    setCodeDigits(Array(CODE_LENGTH).fill(""));
  }

  function handleValiderEmail() {
    if (!emailValide) return;
    // Pas d'appel réseau pour l'instant (voir commentaire ci-dessus) :
    // on affiche directement la case du code, comme le reste du
    // formulaire tant que Laravel n'est pas branché.
    setCodeEnvoye(true);
  }

  // Sélecteur d'indicatif custom (pas un <select> natif) : capture de
  // référence copiée de la maquette, drapeau + nom du pays + code visibles
  // dans le bouton fermé, liste déroulante au clic. Fermeture au clic
  // en dehors du bloc (indicatifRef).
  const [indicatifOuvert, setIndicatifOuvert] = useState(false);
  const indicatifRef = useRef<HTMLDivElement | null>(null);
  const paysSelectionne = INDICATIFS.find((pays) => pays.iso === indicatif) ?? INDICATIFS[0];

  useEffect(() => {
    function fermerSiClicDehors(event: MouseEvent) {
      if (indicatifRef.current && !indicatifRef.current.contains(event.target as Node)) {
        setIndicatifOuvert(false);
      }
    }
    document.addEventListener("mousedown", fermerSiClicDehors);
    return () => document.removeEventListener("mousedown", fermerSiClicDehors);
  }, []);

  // Focus direct sur la 1ère case du code dès qu'elle apparaît (clic sur
  // "Valider") — évite un clic de plus pour commencer à taper.
  useEffect(() => {
    if (codeEnvoye) codeBoxRefs.current[0]?.focus();
  }, [codeEnvoye]);

  const emailValide = /\S+@\S+\.\S+/.test(email);
  const confirmationCode = codeDigits.join("");
  const codeValide = confirmationCode.length === CODE_LENGTH;
  const regles = reglesMotDePasse(password, name, phone);
  const force = forceMotDePasse(password, name, phone);
  // Le mot de passe n'a pas besoin de respecter toutes les règles
  // ci-dessus pour être accepté (demande utilisateur : l'utilisateur
  // met ce qu'il veut, la checklist n'est qu'informative). Seule
  // exigence dure : ne pas être vide et correspondre à sa confirmation.

  function handleCodeDigitChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setCodeDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) {
      codeBoxRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeDigitKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeBoxRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setCodeDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < CODE_LENGTH; i += 1) next[i] = pasted[i] ?? "";
      return next;
    });
    codeBoxRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  // Le clic sur "Créer ma boutique" ne crée rien tant que les CGU ne sont
  // pas acceptées : il ouvre la liste des conditions à la place (écran 35).
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Pas d'exigence de force : l'utilisateur choisit le mot de passe
    // qu'il veut, la checklist plus bas ne fait que l'informer. Seule
    // vérification bloquante : les deux champs doivent correspondre.
    if (password !== passwordConfirmation) {
      setErreurMotDePasse("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setErreurMotDePasse(null);
    setVue("conditions");
  }

  function handleAccepterConditions() {
    if (!cguAccepte) return;
    // POST /api/register pas encore branché côté Laravel (voir le
    // commentaire en tête de fichier) : l'appel échouerait toujours
    // (erreur réseau), donc on affiche directement l'écran de
    // confirmation, comme CreerEspaceForm.tsx pour "Créer mon espace".
    // Une fois la route prête : remplacer ce bloc par
    //   const result = await run({ name, email, phone:
    //   `${paysSelectionne.code} ${phone}`, password,
    //   password_confirmation: passwordConfirmation });
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
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-brand-white">Votre identité est enregistrée</h2>
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
      {/* Ordre demandé : nom & prénom, puis téléphone (indicatif +
          drapeau), puis e-mail (+ son code de confirmation), puis mot de
          passe + confirmation. Boutique (nom + lien) tout en bas, masquée
          tant que ces champs-là ne sont pas remplis (voir plus loin). */}
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
        <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-brand-white/50">
          Numéro de téléphone
        </label>
        {/* Deux blocs séparés (pas un bandeau unique) : bouton indicatif
            (drapeau + nom du pays + code + chevron) à gauche, champ
            numéro à droite — reprend la maquette utilisateur. */}
        <div className="mt-2 flex gap-3 sm:mt-3">
          <div className="relative shrink-0" ref={indicatifRef}>
            <button
              type="button"
              onClick={() => setIndicatifOuvert((ouvert) => !ouvert)}
              aria-haspopup="listbox"
              aria-expanded={indicatifOuvert}
              className="flex h-full items-center gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-4 py-3 text-sm text-brand-white outline-none transition focus:border-brand-pink/60 sm:py-4"
            >
              <DrapeauChip iso={paysSelectionne.iso} />
              <span className="font-medium">{paysSelectionne.pays}</span>
              <span className="text-brand-white/50">{paysSelectionne.code}</span>
              <svg
                viewBox="0 0 12 8"
                className={`h-2.5 w-2.5 shrink-0 text-brand-white/40 transition ${indicatifOuvert ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {indicatifOuvert && (
              <ul
                role="listbox"
                className="absolute left-0 top-full z-10 mt-2 max-h-56 w-60 overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0e1c] py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                {INDICATIFS.map((pays) => (
                  <li key={pays.iso} role="option" aria-selected={pays.iso === indicatif}>
                    <button
                      type="button"
                      onClick={() => {
                        setIndicatif(pays.iso);
                        setIndicatifOuvert(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-brand-white transition hover:bg-white/5"
                    >
                      <DrapeauChip iso={pays.iso} />
                      <span className="flex-1">{pays.pays}</span>
                      <span className="text-brand-white/50">{pays.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮"
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 text-sm tracking-[0.3em] text-brand-white caret-brand-pink placeholder-brand-white/25 outline-none transition focus:border-brand-pink/60 sm:py-4"
          />
        </div>
        {error?.fieldError("phone") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("phone")}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-brand-white">
          Adresse e-mail
        </label>
        {/* Bouton "Valider" dans le champ, à droite (pr-24 sur l'input
            pour que le texte saisi ne passe pas dessous) : grisé tant
            que l'adresse ne respecte pas le format e-mail. Marge du haut
            (mt-2/sm:mt-3) portée par CE div, pas par l'input : sinon elle
            ne se "collapse" pas hors du div (position: relative
            n'empêche pas la collapse en théorie, mais Tailwind/le
            navigateur la garde ici dans la boîte du div), ce qui
            agrandissait le div et décentrait le bouton vers le haut. */}
        <div className="relative mt-2 sm:mt-3">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => handleEmailChange(event.target.value)}
            placeholder="info@example.com"
            className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 pr-24 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 sm:py-4 sm:pr-28"
          />
          <button
            type="button"
            onClick={handleValiderEmail}
            disabled={!emailValide}
            className="absolute inset-y-0 right-2 my-auto flex h-8 items-center justify-center rounded-xl bg-brand-pink px-3.5 text-xs font-semibold leading-none text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:opacity-30"
          >
            Valider
          </button>
        </div>
        {error?.fieldError("email") && (
          <p className="mt-1.5 text-xs text-red-400">{error.fieldError("email")}</p>
        )}
      </div>

      {codeEnvoye && (
        <div>
          <label htmlFor="confirmation-code" className="text-sm font-semibold text-brand-white">
            Code de confirmation
          </label>
          <div className="mt-2 flex gap-2 sm:mt-3 sm:gap-3">
            {codeDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  codeBoxRefs.current[index] = el;
                }}
                id={index === 0 ? "confirmation-code" : undefined}
                name={`confirmation-code-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                required
                value={digit}
                onChange={(event) => handleCodeDigitChange(index, event.target.value)}
                onKeyDown={(event) => handleCodeDigitKeyDown(index, event)}
                onPaste={handleCodePaste}
                className="h-12 w-10 rounded-xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] text-center text-lg font-semibold text-brand-white outline-none transition focus:border-brand-pink/60 sm:h-14 sm:w-12"
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-light text-brand-white/40">Code à 6 chiffres envoyé à votre adresse e-mail.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-brand-white">
            Mot de passe
          </label>
          {/* mt-2/sm:mt-3 porté par le div, pas par l'input — voir
              commentaire équivalent au champ e-mail plus haut : sinon le
              div s'agrandit de cette marge et le bouton oeil (centré via
              inset-y-0/my-auto) se retrouve décalé vers le haut. */}
          <div className="relative mt-2 sm:mt-3">
            <input
              id="password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={!codeValide}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 pr-11 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 disabled:cursor-not-allowed disabled:opacity-40 sm:py-4"
            />
            <BoutonOeil visible={passwordVisible} onClick={() => setPasswordVisible((v) => !v)} />
          </div>
          {error?.fieldError("password") && (
            <p className="mt-1.5 text-xs text-red-400">{error.fieldError("password")}</p>
          )}
        </div>

        <div>
          <label htmlFor="password-confirmation" className="text-sm font-semibold text-brand-white">
            Confirmation
          </label>
          <div className="relative mt-2 sm:mt-3">
            <input
              id="password-confirmation"
              name="password-confirmation"
              type={passwordConfirmationVisible ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={!codeValide}
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="********"
              className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#141a30_0%,#0a0e1c_100%)] px-5 py-3 pr-11 text-sm text-brand-white placeholder-brand-white/30 outline-none transition focus:border-brand-pink/60 disabled:cursor-not-allowed disabled:opacity-40 sm:py-4"
            />
            <BoutonOeil
              visible={passwordConfirmationVisible}
              onClick={() => setPasswordConfirmationVisible((v) => !v)}
            />
          </div>
        </div>
      </div>

      {/* Indicateur de force — purement informatif : aucune de ces règles
          n'est obligatoire, l'utilisateur peut soumettre le mot de passe
          de son choix (demande utilisateur). La barre + le libellé disent
          juste si c'est faible/peu solide/solide/très solide ; la liste
          en dessous détaille pourquoi, sans jamais bloquer la suite. */}
      {password.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
          <div className="flex items-center justify-between text-xs font-light">
            <span className="text-brand-white/50">Solidité du mot de passe</span>
            <span style={{ color: force.couleur }} className="font-semibold">
              {force.label}
            </span>
          </div>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: force.score > i * 2 ? force.couleur : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
          <ul className="mt-3 grid gap-1.5 text-xs font-light sm:grid-cols-2">
            <li className={regles.longueur ? "text-[#4FE0AE]" : "text-brand-white/45"}>
              {regles.longueur ? "✓" : "○"} Huit caractères au minimum
            </li>
            <li className={regles.majusculeMinuscule ? "text-[#4FE0AE]" : "text-brand-white/45"}>
              {regles.majusculeMinuscule ? "✓" : "○"} Une majuscule et une minuscule
            </li>
            <li className={regles.chiffre ? "text-[#4FE0AE]" : "text-brand-white/45"}>
              {regles.chiffre ? "✓" : "○"} Au moins un chiffre
            </li>
            <li className={regles.pasDeSuite ? "text-[#4FE0AE]" : "text-brand-white/45"}>
              {regles.pasDeSuite ? "✓" : "○"} Pas de chiffres qui se suivent
            </li>
            <li className={regles.pasDeRepetition ? "text-[#4FE0AE]" : "text-brand-white/45"}>
              {regles.pasDeRepetition ? "✓" : "○"} Pas deux fois le même caractère
            </li>
            <li className={regles.pasLeNom ? "text-[#4FE0AE]" : "text-brand-white/45"}>
              {regles.pasLeNom ? "✓" : "○"} Rien qui reprenne votre nom
            </li>
            <li className={regles.pasLeTelephone ? "text-[#4FE0AE]" : "text-brand-white/45"}>
              {regles.pasLeTelephone ? "✓" : "○"} Rien qui reprenne votre téléphone
            </li>
          </ul>
          <p className="mt-3 text-[11px] font-light text-brand-white/40">
            Ces critères ne sont pas obligatoires — vous pouvez continuer même si le mot de passe est faible.
          </p>
        </div>
      )}

      {erreurMotDePasse && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {erreurMotDePasse}
        </p>
      )}

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
        Suivant
      </button>
    </form>
  );
}
