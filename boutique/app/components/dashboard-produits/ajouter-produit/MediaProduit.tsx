"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardLangue } from "../../DashboardLanguageProvider";
import { Tag, texteAvecChiffres } from "../../dashboard-accueil/shared";

/*
  Bloc "vidéo + photos + bandeau" du formulaire (Écran 08 de la maquette
  fournie) : la vidéo occupe le haut sur toute la largeur, le carré des
  photos est posé au centre, et la ligne du bas porte le nom du produit
  d'un côté et ce qui se remplit tout seul (référence, combinaisons, date,
  état) de l'autre — reproduit tel quel, cf. maquette "LM · Ajouter un
  produit.html" fournie par l'utilisateur.

  Gère uniquement la sélection de fichiers et leur aperçu local
  (URL.createObjectURL) : aucun envoi réseau ici — le fichier brut remonte
  tel quel au parent (AjouterProduitModal) qui le transmettra à l'API
  Laravel plus tard, cf. [[dashboard-mock-data-pending-laravel-api]].

  Sécurité front (rappel : une garde-fou côté UX, jamais un remplacement de
  la validation serveur) :
  - type MIME ET taille vérifiés en JS avant tout aperçu — l'attribut
    "accept" du <input> est un simple filtre de confort, il se contourne ;
  - nombre de photos plafonné ;
  - chaque URL d'aperçu créée est révoquée à son remplacement ou au
    démontage, pour ne pas fuir de mémoire sur une page qui reste ouverte
    longtemps.
*/

const VIDEO_TYPES_ACCEPTES = ["video/mp4", "video/quicktime", "video/webm"];
const VIDEO_TAILLE_MAX_MO = 80;
const PHOTO_TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_TAILLE_MAX_MO = 5;
const PHOTOS_MAX = 6;

function tailleValide(fichier: File, maxMo: number) {
  return fichier.size <= maxMo * 1024 * 1024;
}

export type MediaProduitValeur = {
  video: File | null;
  photos: File[];
};

/** Ce qui se remplit tout seul, affiché sur la ligne du bas (cf. Écran 08 point 3). */
export type InfosApercu = {
  nom: string;
  categorieLabel: string | null;
  reference: string;
  combinaisons: number;
  dateCreation: string;
  brouillon: boolean;
};

export default function MediaProduit({
  valeur,
  onChange,
  infos,
}: {
  valeur: MediaProduitValeur;
  onChange: (v: MediaProduitValeur) => void;
  infos: InfosApercu;
}) {
  const { t } = useDashboardLangue();
  const [erreur, setErreur] = useState<string | null>(null);
  const [photoActive, setPhotoActive] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [videoApercu, setVideoApercu] = useState<string | null>(null);
  const [photosApercu, setPhotosApercu] = useState<string[]>([]);

  // Aperçus dérivés des fichiers : recréés seulement quand les fichiers
  // changent, systématiquement révoqués ensuite (nettoyage de l'effet).
  useEffect(() => {
    const url = valeur.video ? URL.createObjectURL(valeur.video) : null;
    setVideoApercu(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [valeur.video]);

  useEffect(() => {
    const urls = valeur.photos.map((f) => URL.createObjectURL(f));
    setPhotosApercu(urls);
    setPhotoActive(0);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [valeur.photos]);

  const choisirVideo = (fichier: File | undefined) => {
    setErreur(null);
    if (!fichier) return;
    if (!VIDEO_TYPES_ACCEPTES.includes(fichier.type)) {
      setErreur(t("Format vidéo non pris en charge.", "Unsupported video format."));
      return;
    }
    if (!tailleValide(fichier, VIDEO_TAILLE_MAX_MO)) {
      setErreur(t(`Vidéo trop lourde (max ${VIDEO_TAILLE_MAX_MO} Mo).`, `Video too large (max ${VIDEO_TAILLE_MAX_MO} MB).`));
      return;
    }
    onChange({ ...valeur, video: fichier });
  };

  const ajouterPhotos = (fichiers: FileList | null) => {
    setErreur(null);
    if (!fichiers) return;
    const restantes = PHOTOS_MAX - valeur.photos.length;
    if (restantes <= 0) {
      setErreur(t(`${PHOTOS_MAX} photos au maximum.`, `${PHOTOS_MAX} photos maximum.`));
      return;
    }
    const valides: File[] = [];
    for (const fichier of Array.from(fichiers).slice(0, restantes)) {
      if (!PHOTO_TYPES_ACCEPTES.includes(fichier.type)) {
        setErreur(t("Une image a un format non pris en charge.", "An image has an unsupported format."));
        continue;
      }
      if (!tailleValide(fichier, PHOTO_TAILLE_MAX_MO)) {
        setErreur(t(`Une image dépasse ${PHOTO_TAILLE_MAX_MO} Mo.`, `An image exceeds ${PHOTO_TAILLE_MAX_MO} MB.`));
        continue;
      }
      valides.push(fichier);
    }
    if (valides.length) onChange({ ...valeur, photos: [...valeur.photos, ...valides] });
  };

  const retirerPhoto = (index: number) => {
    onChange({ ...valeur, photos: valeur.photos.filter((_, i) => i !== index) });
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--dashboard-text)]/10 bg-[#0c0f1c]">
      {/* Vidéo plein cadre, verticale — même exigence que la maquette : la
          quasi-totalité des clients arrivent depuis un téléphone. */}
      <div className="relative flex h-[380px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#2A0F3E_0%,#0A1338_45%,#050509_100%)] sm:h-[440px]">
        {videoApercu ? (
          <video src={videoApercu} className="absolute inset-0 h-full w-full object-cover opacity-70" muted loop autoPlay playsInline />
        ) : (
          <span className="text-xs text-white/40">{t("Aucune vidéo pour l'instant", "No video yet")}</span>
        )}

        {/* Fondu bas pour que le bandeau nom/infos reste lisible sur la vidéo. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 to-transparent" />

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3.5 py-2 text-[11px] font-semibold text-white backdrop-blur-md"
        >
          {valeur.video ? t("Remplacer la vidéo", "Replace video") : t("Ajouter une vidéo", "Add a video")}
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept={VIDEO_TYPES_ACCEPTES.join(",")}
          className="hidden"
          onChange={(e) => { choisirVideo(e.target.files?.[0]); e.target.value = ""; }}
        />

        {/* Carré des photos, posé au centre de la vidéo (Écran 08, point 2). */}
        <div className="relative z-10 flex h-[170px] w-[170px] items-center justify-center overflow-hidden rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-sm sm:h-[190px] sm:w-[190px]">
          {photosApercu.length > 0 ? (
            <span
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${photosApercu[photoActive]})` }}
            />
          ) : (
            <span className="text-[10px] text-white/40">{t("Aucune photo", "No photo")}</span>
          )}
          {photosApercu.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {photosApercu.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhotoActive(i)}
                  aria-label={t(`Aller à la photo ${i + 1}`, `Go to photo ${i + 1}`)}
                  className={i === photoActive ? "h-1.5 w-4 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/40"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bande de vignettes, centrée sous le carré : celles déjà
            ajoutées, puis le carré à signe plus pour en ajouter une. */}
        <div className="absolute bottom-24 left-0 right-0 z-10 flex justify-center gap-2 sm:bottom-28">
          {photosApercu.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setPhotoActive(i)}
              className={`relative h-9 w-9 overflow-hidden rounded-xl border bg-cover bg-center ${i === photoActive ? "border-white" : "border-white/25"}`}
              style={{ backgroundImage: `url(${src})` }}
            >
              <span
                onClick={(e) => { e.stopPropagation(); retirerPhoto(i); }}
                role="button"
                aria-label={t("Retirer cette photo", "Remove this photo")}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[9px] text-white"
              >
                ×
              </span>
            </button>
          ))}
          {valeur.photos.length < PHOTOS_MAX && (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              aria-label={t("Ajouter une photo", "Add a photo")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-white/35 text-white/70"
            >
              +
            </button>
          )}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept={PHOTO_TYPES_ACCEPTES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => { ajouterPhotos(e.target.files); e.target.value = ""; }}
        />

        {/* Ligne du bas : le nom à gauche, ce qui se remplit tout seul à
            droite (Écran 08, point 3) — posé à plat sur la vidéo, sans
            cadre ni fond, comme dans la maquette. */}
        <div className="absolute inset-x-5 bottom-4 z-10 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Tag tone="dark" className="!bg-white/15 !text-white">{t("Produit propre", "Own product")}</Tag>
              {infos.categorieLabel && <Tag tone="pink">{infos.categorieLabel}</Tag>}
            </div>
            <p className="mt-1.5 truncate text-lg font-bold text-white sm:text-xl">
              {infos.nom ? texteAvecChiffres(infos.nom) : t("Nom du produit à venir", "Product name to come")}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-end gap-x-4 gap-y-1.5 text-[10px] text-white/85">
            <InfoColonne label={t("Référence", "Reference")} value={<span className="font-figures-bold">{infos.reference}</span>} />
            <InfoColonne label={t("Combinaisons", "Combinations")} value={<span className="font-figures-bold">{infos.combinaisons}</span>} />
            <InfoColonne label={t("Créé le", "Created on")} value={texteAvecChiffres(infos.dateCreation)} />
            <InfoColonne label={t("État", "Status")} value={infos.brouillon ? t("Brouillon", "Draft") : t("Actif", "Active")} />
          </div>
        </div>
      </div>

      {erreur && <p className="border-t border-white/10 p-3 text-[11px] text-[#FF8CA0]">{texteAvecChiffres(erreur)}</p>}
    </div>
  );
}

function InfoColonne({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-right">
      <p className="text-[8px] uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}
