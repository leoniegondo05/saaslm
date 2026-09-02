"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
// Note: OrbitControls n'est pas utilisé directement ici pour éviter les conflits de
// défilement dans le Hero (déjà retiré selon votre demande précédente), 
// mais la rotation automatique est conservée.

/*
  Version WebGL (three.js) de l'illustration du Hero, mise à jour
  avec la "Version Finale Noms Réels" du 02/09/2026 :
  - Nouvelles positions et échelles pour les lobes
  - Nouvelle logique d'explosion (explosionFactor)
  - Animation de pulsation et de lignes ajoutée
*/

const BASE = "/images/hero-brain/";

type LobeData = {
  name: string;
  pos: [number, number, number];
  scale: number;
  order: number;
};

// Nouveaux paramètres des lobes
const LOBES_DATA: LobeData[] = [
  { name: "piece-top.png", pos: [2.0, 2.5, -1], scale: 9.5, order: 1 },
  { name: "piece-left.png", pos: [-2.5, 2.0, 0], scale: 9.0, order: 2 },
  { name: "piece-bottom-right.png", pos: [2.5, -1.5, -2], scale: 8.5, order: 0 },
  { name: "piece-bottom-left.png", pos: [-2.0, -2.0, 1], scale: 8.5, order: 3 },
];

// Paramètres des lignes (image connector unique, réutilisée à plusieurs rotations)
const LINES_DATA: { name: string; rot: number }[] = [
  { name: "hero-brain-connector.png", rot: 0.8 },
  { name: "hero-brain-connector.png", rot: -0.5 },
  { name: "hero-brain-connector.png", rot: 1.5 },
  { name: "hero-brain-connector.png", rot: -1.2 },
  { name: "hero-brain-connector.png", rot: 0.2 },
  { name: "hero-brain-connector.png", rot: -0.8 },
];

export default function HeroBrainThree({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    scene.background = null;

    // Recul de la caméra ajusté à 22
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const disposables: { texture: THREE.Texture; material: THREE.Material }[] = [];

    function createSprite(filename: string, scale: number, renderOrder: number) {
      const texture = loader.load(BASE + filename);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(scale, scale, 1);
      sprite.renderOrder = renderOrder;
      disposables.push({ texture, material });
      return sprite;
    }

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // A. LE CENTRE (Dot) - renderOrder 10
    const centerSprite = createSprite("dot.png", 2.5, 10);
    brainGroup.add(centerSprite);

    // B. LES LOBES DU CERVEAU
    const lobeSprites = LOBES_DATA.map((data) => {
      const sprite = createSprite(data.name, data.scale, data.order);
      const basePos = new THREE.Vector3(...data.pos);
      sprite.position.copy(basePos);
      brainGroup.add(sprite);
      return { sprite, basePos };
    });

    // C. LES LIGNES DE CONNEXION
    const lineSprites = LINES_DATA.map((data) => {
      const sprite = createSprite(data.name, 7, 5); // Order 5
      sprite.rotation.z = data.rot;
      sprite.material.opacity = 0; // Cachées au départ
      brainGroup.add(sprite);
      return sprite;
    });

    function resize() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let time = 0;
    let frameId = 0;

    function renderAt(forcedTime?: number) {
      const t = forcedTime !== undefined ? forcedTime : time;
      
      // Cycle sinusoïdal : 0 (assemblé) -> 1 (explosé) -> 0
      const explosionFactor = reduceMotion ? 0 : (Math.sin(t) + 1) / 2;

      // 1. Animation du Centre (Pulsation cardiaque)
      const pulse = reduceMotion ? 2.5 : 2.5 + Math.sin(t * 6) * 0.3;
      centerSprite.scale.set(pulse, pulse, 1);

      // 2. Animation des Lobes (Explosion)
      lobeSprites.forEach((item) => {
        // Direction : du centre (0,0,0) vers la position du lobe
        const direction = item.basePos.clone().normalize().multiplyScalar(5);
        // Position actuelle = Position de base + (Direction * Facteur d'explosion)
        const currentPos = item.basePos.clone().add(direction.multiplyScalar(explosionFactor));
        item.sprite.position.copy(currentPos);
      });

      // 3. Animation des Lignes (Apparition en fondu)
      lineSprites.forEach((sprite, i) => {
        // Opacité liée à l'explosion
        sprite.material.opacity = explosionFactor;
        // Petit flottement organique
        if (!reduceMotion) {
          sprite.position.y = Math.sin(t * 2 + i) * 0.4;
        } else {
          sprite.position.y = 0;
        }
      });

      renderer.render(scene, camera);
    }

    if (reduceMotion) {
      renderAt(0); // Rendu statique assemblé
    } else {
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.015; // Vitesse du cycle (snippet)
        
        // Simule le autoRotate des OrbitControls
        brainGroup.rotation.y += 0.002; 

        renderAt();
      };
      animate();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      disposables.forEach(({ texture, material }) => {
        texture.dispose();
        material.dispose();
      });
      renderer.dispose();
      container!.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      className={`hero-brain-three relative w-full ${className}`}
      style={{ aspectRatio: "258.30847778468376 / 242.10753440861822" }}
      role="img"
      aria-label="Animation 3D du cerveau, version finale"
    >
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}

