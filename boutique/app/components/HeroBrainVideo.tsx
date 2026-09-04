"use client";

/*
  Remplace l'ancienne animation WebGL (HeroBrainThree) par la vidéo
  /videos/cerveau.mp4, en boucle infinie, sans aucun repère visuel de
  lecteur vidéo (pas de controls, pas de barre, pas de bord rectangulaire
  visible). Le masque radial fait disparaître le fond et les bords de la
  vidéo dans le fond sombre du site, pour qu'elle se lise comme une
  animation 3D générée par code plutôt qu'un rectangle vidéo posé sur la
  page.

  Note : on n'utilise PAS mix-blend-mode ici. Ça a été testé sur le
  prototype hero-brain — mix-blend-mode ne se compose pas de façon fiable
  sur <video> selon les navigateurs (le décodage vidéo passe souvent par
  une couche de composition séparée qui ignore le blending CSS), et ça
  peut réapparaître comme un rectangle visible selon le contexte
  d'empilement autour du composant. Le mask-image seul suffit et est
  fiable partout.

  Le ratio du conteneur (914 / 822) doit être le ratio RÉEL du fichier
  vidéo, pas un ratio Figma approximatif : avec object-cover + un ratio
  différent, la vidéo doit être rognée pour remplir le cadre, et ce
  rognage peut mordre sur une pièce du cerveau proche du bord (vu en
  particulier sur la pièce bleue en haut à gauche, qui semblait "coupée").
  object-contain + le bon ratio affichent la vidéo entière sans aucun
  rognage, exactement comme sur le prototype hero-brain — donc aucun
  risque de couper quoi que ce soit, quel que soit le navigateur.
*/
export default function HeroBrainVideo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`hero-brain-video relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: "914 / 822" }}
      role="img"
      aria-label="Animation 3D du cerveau"
    >
      <video
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          // closest-side (pas la valeur par défaut farthest-corner) : le
          // fondu doit être terminé (transparent) au moment où il touche le
          // bord le plus proche, sinon le haut/bas/côtés du cadre (plus
          // proches que les coins) gardent un bord dur visible — c'était le
          // bug ici, corrigé pareil que sur hero-brain.
          WebkitMaskImage:
            "radial-gradient(closest-side, black 60%, transparent 100%)",
          maskImage:
            "radial-gradient(closest-side, black 60%, transparent 100%)",
        }}
        src="/videos/cerveau.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
