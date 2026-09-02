import Image from "next/image";

/*
  Illustration du cerveau du dashboard (app/dashboard/page.tsx) : image
  fournie (public/images/Frame 119.png), pas de rendu 3D/SVG — plus simple
  et fidèle à 100% à la maquette Figma.
*/
export default function DashboardBrain({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full ${className}`}
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
    </div>
  );
}
