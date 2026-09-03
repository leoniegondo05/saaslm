import Image from "next/image";

/*
  Illustration du cerveau du dashboard (app/dashboard/page.tsx) : image
  fournie (public/images/Frame 119.png), pas de rendu 3D/SVG — plus simple
  et fidèle à 100% à la maquette Figma.
*/
export default function DashboardBrain({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full dashboard-brain-float ${className}`}
      style={{ aspectRatio: "340 / 254" }}
    >
      <Image
        src="/images/Frame 119.png"
        alt="Illustration du cerveau LM"
        fill
        sizes="(min-width: 1024px) 420px, 60vw"
        className="object-contain"
        priority
      />

      {/* 3 traits courbes collés au cerveau, reliant sa surface aux 3
          pastilles roses déjà présentes dans Frame 119.png (repérées par
          scan pixel : haut 249.5,4.5 · gauche 16.5,59.5 · bas-droite
          334.5,186.5, sur l'image native 340×254). */}
      <svg
        viewBox="0 0 340 254"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="brainLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-pink)" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" />
          </linearGradient>
        </defs>
        <path
          d="M219,49 Q238,10 247,7"
          fill="none"
          stroke="url(#brainLineGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="dashboard-brain-line-pulse"
          style={{ animationDelay: "0s" }}
        />
        <path
          d="M79,86 Q30,50 19,60"
          fill="none"
          stroke="url(#brainLineGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="dashboard-brain-line-pulse"
          style={{ animationDelay: "0.8s" }}
        />
        <path
          d="M250,154 Q300,145 332,185"
          fill="none"
          stroke="url(#brainLineGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="dashboard-brain-line-pulse"
          style={{ animationDelay: "1.6s" }}
        />
      </svg>
    </div>
  );
}
