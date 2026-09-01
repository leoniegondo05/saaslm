"use client";

import { useEffect, useState, type FormEvent } from "react";
import styles from "../../partenaire-agree/partenaire-agree.module.css";

/*
  Contenu du panneau de candidature (#formulaire puis #merci dans la
  maquette partenaire-agree-lm.html) : le panneau lui-même (.voile/.panneau/
  .fermer) reste dans PartenaireAgreeLanding.tsx (structure/effets "verre"
  portés dans partenaire-agree.module.css), seuls les champs sont ici, en
  Tailwind direct — même convention que CreerEspaceForm.tsx/PartenaireForm.tsx
  — plutôt que les classes .groupe/.bloc de la maquette d'origine.

  Aucune route API pour l'instant (voir CreerEspaceForm.tsx/PartenaireForm.tsx
  pour l'endroit où brancher useApiRequest le jour où
  ENDPOINTS.partenaire.candidature existera) : "Envoyer ma demande" affiche
  directement l'écran de confirmation, comme la maquette.
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

const ANCIENNETE = ["Moins d'un an", "1 à 3 ans", "3 à 5 ans", "Plus de 5 ans"];

const VOLUME = ["Moins de 200", "200 à 1 000", "1 000 à 5 000", "Plus de 5 000"];

const ENTREPOT = ["Oui, un entrepôt", "Oui, plusieurs entrepôts", "Non, pas encore"];

const inputBox =
  "w-full rounded-[10px] border border-[#D7D2E0] bg-white px-[14px] py-3 text-[14.5px] text-[#0B0616] outline-none transition placeholder:text-[#A49DB5] " +
  "focus:border-[#EC0C8C] focus:shadow-[0_0_0_3px_rgba(236,12,140,0.12)]";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-[7px] block text-[13px] font-semibold text-[#0B0616]">
      {children}
    </label>
  );
}

export default function CandidatureForm({
  open,
  initialEmail,
}: {
  open: boolean;
  initialEmail: string;
}) {
  const [envoye, setEnvoye] = useState(false);

  const [societe, setSociete] = useState("");
  const [rccm, setRccm] = useState("");
  const [pays, setPays] = useState("Côte d'Ivoire");
  const [villes, setVilles] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fonction, setFonction] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [anciennete, setAnciennete] = useState(ANCIENNETE[0]);
  const [livreurs, setLivreurs] = useState("");
  const [volume, setVolume] = useState(VOLUME[0]);
  const [entrepot, setEntrepot] = useState(ENTREPOT[0]);
  const [message, setMessage] = useState("");

  // Reprend l'adresse saisie dans le champ du heros à chaque ouverture du
  // panneau, comme le script de la maquette (voile.ouvrir()).
  useEffect(() => {
    if (open) {
      setEnvoye(false);
      setEmail((current) => current || initialEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div className={`${styles.merci} ${styles.visible}`}>
        <div className={styles.rondOk}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3>Votre demande est partie</h3>
        <p>
          Nous examinons votre dossier et revenons vers vous par email sous quelques jours
          ouvrés.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 id="titre-formulaire">Demande pour devenir partenaire agréé</h2>
      <p className={styles.intro}>
        Tous les champs sont utiles à l&apos;examen de votre dossier. Comptez dix minutes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mt-[26px] grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="societe">Nom de la société</Label>
            <input
              id="societe"
              className={inputBox}
              value={societe}
              onChange={(e) => setSociete(e.target.value)}
              placeholder="Ex. Rapid Logistics SARL"
              required
            />
          </div>
          <div>
            <Label htmlFor="rccm">Numéro d&apos;immatriculation</Label>
            <input
              id="rccm"
              className={inputBox}
              value={rccm}
              onChange={(e) => setRccm(e.target.value)}
              placeholder="RCCM ou équivalent"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pays">Pays d&apos;exploitation</Label>
            <select
              id="pays"
              className={`${inputBox} cursor-pointer`}
              value={pays}
              onChange={(e) => setPays(e.target.value)}
            >
              {PAYS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="villes">Villes et zones couvertes</Label>
            <input
              id="villes"
              className={inputBox}
              value={villes}
              onChange={(e) => setVilles(e.target.value)}
              placeholder="Ex. Abidjan, Bouaké, Yamoussoukro"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="responsable">Nom du responsable</Label>
            <input
              id="responsable"
              className={inputBox}
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              placeholder="Prénom et nom"
              required
            />
          </div>
          <div>
            <Label htmlFor="fonction">Fonction</Label>
            <input
              id="fonction"
              className={inputBox}
              value={fonction}
              onChange={(e) => setFonction(e.target.value)}
              placeholder="Ex. Directeur général"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Email professionnel</Label>
            <input
              id="email"
              type="email"
              className={inputBox}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@societe.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="tel">Téléphone</Label>
            <input
              id="tel"
              type="tel"
              className={inputBox}
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              placeholder="+225 …"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="anciennete">Depuis quand livrez-vous ?</Label>
            <select
              id="anciennete"
              className={`${inputBox} cursor-pointer`}
              value={anciennete}
              onChange={(e) => setAnciennete(e.target.value)}
            >
              {ANCIENNETE.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="livreurs">Nombre de livreurs</Label>
            <input
              id="livreurs"
              type="number"
              min={0}
              className={inputBox}
              value={livreurs}
              onChange={(e) => setLivreurs(e.target.value)}
              placeholder="Ex. 15"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="volume">Livraisons par mois</Label>
            <select
              id="volume"
              className={`${inputBox} cursor-pointer`}
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            >
              {VOLUME.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="entrepot">Disposez-vous d&apos;un entrepôt ?</Label>
            <select
              id="entrepot"
              className={`${inputBox} cursor-pointer`}
              value={entrepot}
              onChange={(e) => setEntrepot(e.target.value)}
            >
              {ENTREPOT.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="message">Quelque chose à ajouter ?</Label>
          <textarea
            id="message"
            className={`${inputBox} min-h-[96px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Vos clients actuels, vos contraintes, ce que vous attendez de LM."
          />
        </div>

        <button
          type="submit"
          className="mt-[26px] w-full rounded-xl bg-[#0B0616] py-4 text-[15.5px] font-semibold text-white transition hover:bg-[#241934]"
        >
          Envoyer ma demande
        </button>
        <p className="mt-[14px] text-center text-[12.5px] text-[#6C6579]">
          En envoyant ce formulaire, vous acceptez que LM utilise ces informations pour
          examiner votre candidature.
        </p>
      </form>
    </div>
  );
}
