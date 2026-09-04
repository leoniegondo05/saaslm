"use client";

/*
  Remplace l'ancienne animation WebGL (HeroBrainThree) par la vidéo
  /videos/cerveau.mp4, en boucle infinie, sans aucun repère visuel de
  lecteur vidéo (pas de controls, pas de barre, pas de bord rectangulaire
  visible). Le blend "screen" + le masque radial font disparaître le fond
  et les bords de la vidéo dans le fond sombre du site, pour qu'elle se
  lise comme une animation 3D générée par code plutôt qu'un rectangle
  vidéo posé sur la page.
*/
export default function HeroBrainVideo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`hero-brain-video relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: "258.30847778468376 / 242.10753440861822" }}
      role="img"
      aria-label="Animation 3D du cerveau"
    >
      <video
        className="absolute inset-0 h-full w-full scale-125 object-cover"
        style={{
          mixBlendMode: "screen",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 55%, transparent 78%)",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 55%, transparent 78%)",
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
