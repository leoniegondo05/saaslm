"use client";

/*
  Animation "vol vers le panier" — clone la vignette produit cliquée et
  l'anime (trajectoire en arc, via 3 keyframes) jusqu'à l'icône panier de
  l'en-tête (BoutiqueHeader → CartBadge, repérée par [data-cart-target]).
  Purement visuel : le clone est détaché du DOM (position fixed, z-index
  élevé, pointer-events none) et retiré à la fin de l'animation — n'affecte
  ni le state du panier (déjà mis à jour par ajouter()) ni l'accessibilité.
*/

// Petit "ding" synthétisé (Web Audio, aucun fichier audio à charger) joué à
// l'arrivée dans le panier — deux tons courts en octave (accord doux) plutôt
// qu'un bip plat, pour un rendu "chic" et discret.
function jouerSonArrivee() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const maintenant = ctx.currentTime;
    [1046.5, 1568].forEach((frequence, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequence;
      const depart = maintenant + i * 0.05;
      gain.gain.setValueAtTime(0, depart);
      gain.gain.linearRampToValueAtTime(0.09, depart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, depart + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(depart);
      osc.stop(depart + 0.4);
    });
    setTimeout(() => ctx.close(), 600);
  } catch {
    /* audio indisponible (autoplay bloqué, etc.) — animation seule suffit */
  }
}

export function volerVersPanier(source: HTMLImageElement | null) {
  if (!source || typeof window === "undefined") return;
  const cible = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!cible) return;

  const depart = source.getBoundingClientRect();
  const arrivee = cible.getBoundingClientRect();
  if (depart.width === 0 || depart.height === 0) return;

  const clone = source.cloneNode(false) as HTMLImageElement;
  clone.className = "";
  clone.style.cssText = `
    position: fixed;
    left: ${depart.left}px;
    top: ${depart.top}px;
    width: ${depart.width}px;
    height: ${depart.height}px;
    margin: 0;
    object-fit: cover;
    border-radius: var(--card-rad, 12px);
    box-shadow: 0 8px 24px rgba(0,0,0,.25);
    pointer-events: none;
    z-index: 9999;
    will-change: transform, opacity;
  `;
  document.body.appendChild(clone);

  const xDepart = depart.left + depart.width / 2;
  const yDepart = depart.top + depart.height / 2;
  const xArrivee = arrivee.left + arrivee.width / 2;
  const yArrivee = arrivee.top + arrivee.height / 2;
  // point médian relevé (arc), pas ligne droite
  const xMilieu = (xDepart + xArrivee) / 2 - xDepart;
  const yMilieu = Math.min(yDepart, yArrivee) - 100 - yDepart;
  const xFinal = xArrivee - xDepart;
  const yFinal = yArrivee - yDepart;
  const tailleCible = 22; // ~ taille icône panier
  const echelleFinale = tailleCible / Math.max(depart.width, depart.height);

  const anim = clone.animate(
    [
      { transform: "translate(0px, 0px) scale(1)", opacity: 1, offset: 0 },
      { transform: `translate(${xMilieu}px, ${yMilieu}px) scale(0.75)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${xFinal}px, ${yFinal}px) scale(${echelleFinale})`, opacity: 0.15, offset: 1 },
    ],
    { duration: 1050, easing: "cubic-bezier(.32,.64,.38,1)" }
  );

  const retirer = () => {
    clone.remove();
    jouerSonArrivee();
  };
  anim.onfinish = retirer;
  anim.oncancel = () => clone.remove();
}
