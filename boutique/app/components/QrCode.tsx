import qrcode from "qrcode-generator";

/*
  Vrai QR code (pas un damier factice) — encodé en SVG via qrcode-generator
  (pure JS, pas de canvas), utilisé dans la carte "Mon identité" du
  dashboard (app/dashboard/page.tsx).
*/
export default function QrCode({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();

  const count = qr.getModuleCount();

  return (
    <svg
      viewBox={`0 0 ${count} ${count}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Code personnel QR"
    >
      <rect width={count} height={count} fill="#ffffff" />
      {Array.from({ length: count }).map((_, row) =>
        Array.from({ length: count }).map((_, col) =>
          qr.isDark(row, col) ? (
            <rect
              key={`${row}-${col}`}
              x={col}
              y={row}
              width={1}
              height={1}
              fill="#141220"
            />
          ) : null
        )
      )}
    </svg>
  );
}
