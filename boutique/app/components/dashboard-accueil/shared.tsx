/*
  Petits composants d'appui partagés par toutes les sections de l'onglet
  "Accueil" (Finances, Commandes, Clients, Acquisition, Stock, Produits,
  Alertes) — extraits de app/dashboard/accueil/page.tsx pour que chaque
  section vive dans son propre fichier sans dupliquer Card/StatRow/Tag/etc.
*/

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  count,
  first = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: string;
  first?: boolean;
}) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${first ? "mt-8" : "mt-12"}`}>
      <div>
        <span
          className="inline-flex rounded-full p-px shadow-[0_2px_12px_rgba(20,18,32,0.05)]"
          style={{ backgroundImage: "linear-gradient(90deg, #EC0C8C 0%, #3A1D8A 58.35%, #FFFFFF 100%)" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#141220] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(236,12,140,0.6)]" />
            {eyebrow}
          </span>
        </span>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#141220]/50">{subtitle}</p>}
      </div>
      {count && (
        <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[#141220]/40 shadow-[0_2px_10px_rgba(20,18,32,0.06)]">
          {count}
        </span>
      )}
    </div>
  );
}

export function Card({
  title,
  badge,
  badgeAlign = "right",
  titleAlign = "center",
  titleTab = false,
  className = "",
  children,
}: {
  title?: string;
  badge?: React.ReactNode;
  /** Position du badge quand titleTab est actif. Défaut: "right". */
  badgeAlign?: "left" | "right";
  /** Position de l'étiquette de titre quand titleTab est actif. Défaut: "center". */
  titleAlign?: "left" | "center";
  /** Titre affiché en étiquette centrée (façon "onglet"), comme la carte Trésorerie disponible. */
  titleTab?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl card-tint p-4 shadow-[0_4px_24px_rgba(20,18,32,0.06)] ${className}`}>
      {title && titleTab && (
        <div className={`relative -mt-4 flex items-center ${titleAlign === "left" ? "justify-start" : "justify-center"}`}>
          <p
            className="rounded-b-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8095]"
            style={{ background: "#F0EDF0" }}
          >
            {title}
          </p>
          {badge && (
            <div className={`absolute top-2 ${badgeAlign === "left" ? "left-0" : "right-0"}`}>{badge}</div>
          )}
        </div>
      )}
      {title && !titleTab && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141220]/40">{title}</p>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatRow({
  label,
  value,
  bold = true,
  light = false,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  light?: boolean;
}) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-3 text-xs first:mt-3">
      <span className={light ? "text-white/55" : "text-[#141220]/50"}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

export function LegendRow({ color, label, value }: { color: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-[#141220]/50">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export function Divider() {
  return <div className="my-3 h-px bg-[#141220]/10" />;
}

export function Bar({ pct, color = "bg-brand-pink" }: { pct: number; color?: string }) {
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#141220]/[0.08]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className = "",
  style,
}: {
  children: React.ReactNode;
  tone?: "pink" | "ok" | "warn" | "ko" | "blue" | "neutral" | "dark";
  className?: string;
  style?: React.CSSProperties;
}) {
  const tones: Record<string, string> = {
    pink: "bg-brand-pink/10 text-brand-pink",
    ok: "bg-[#dcf5e3] text-[#178a3f]",
    warn: "bg-[#fff1d6] text-[#a8690a]",
    ko: "bg-[#ffe1e2] text-[#c8262d]",
    blue: "bg-brand-purple/10 text-brand-purple",
    neutral: "bg-[#141220]/[0.06] text-[#141220]/60",
    dark: "bg-[#141220]/[0.08] text-[#141220]/70",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tones[tone]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "outline",
  className = "",
  style,
}: {
  children: React.ReactNode;
  variant?: "dark" | "outline" | "white";
  className?: string;
  style?: React.CSSProperties;
}) {
  const variants: Record<string, string> = {
    dark: "bg-[#141220] text-white",
    outline: "border border-[#141220]/15 bg-white/60 text-[#141220]",
    white: "bg-white text-[#141220] shadow-[0_2px_10px_rgba(20,18,32,0.08)]",
  };
  return (
    <button
      type="button"
      className={`w-full rounded-full px-4 py-2.5 text-center text-xs font-semibold transition hover:brightness-95 ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function Nature({ code }: { code: "S" | "P" | "L" | "O" }) {
  const styles: Record<string, string> = {
    S: "bg-[#141220]/[0.08] text-[#141220]/60",
    P: "bg-brand-purple/10 text-brand-purple",
    L: "bg-brand-pink/10 text-brand-pink",
    O: "border border-[#141220]/15 text-[#141220]/40",
  };
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${styles[code]}`}>
      {code}
    </span>
  );
}

export function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pink";
}) {
  return (
    <div>
      <p className="text-[10px] text-[#141220]/40">{label}</p>
      <p className={`mt-0.5 text-base font-bold ${tone === "pink" ? "text-brand-pink" : ""}`}>{value}</p>
    </div>
  );
}

export function MiniTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl card-tint p-3 shadow-[0_4px_24px_rgba(20,18,32,0.06)]">
      <p className="text-[10px] text-[#141220]/40">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
      <p className="mt-auto pt-0.5 text-[9px] text-[#141220]/35">{note}</p>
    </div>
  );
}

export function QuickStat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "ko" }) {
  return (
    <div className="rounded-xl border border-[#141220]/10 bg-white/60 p-2.5">
      <p className="text-[9px] text-[#141220]/40">{label}</p>
      <p
        className={`mt-0.5 text-sm font-bold ${
          tone === "ok" ? "text-[#178a3f]" : tone === "ko" ? "text-[#c8262d]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function PayRow({ label, color, value, pct }: { label: string; color: string; value: string; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-[#141220]/70">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#141220]/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function FailRow({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#141220]/50">{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

export function CommuneRow({
  label,
  pct,
  value,
  barColor = "bg-[#141220]/50",
}: {
  label: string;
  pct: number;
  value: string;
  barColor?: string;
}) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {pct} % · {value}
        </span>
      </div>
      <Bar pct={pct} color={barColor} />
    </div>
  );
}

export function ClientRow({
  name,
  zone,
  value,
  orders,
  pct,
}: {
  name: string;
  zone: string;
  value: string;
  orders: number;
  pct: number;
}) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>
          {name} · {zone}
        </span>
        <span className="font-semibold">
          {value} · {orders} commande{orders > 1 ? "s" : ""}
        </span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

export function RatingRow({ label, value, pct, color = "bg-[#141220]" }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-[#141220]/40">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

export function SourceRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="mt-2.5 first:mt-3">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold">
          {value} · {pct} %
        </span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  );
}

export function TopProductRow({ code, name, value, pct }: { code: "S" | "P" | "L" | "O"; name: string; value: string; pct: number }) {
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <Bar pct={pct} color="bg-brand-pink" />
    </div>
  );
}

export function NatureRow({
  code,
  name,
  value,
  note,
  last = false,
}: {
  code: "S" | "P" | "L" | "O";
  name: string;
  value: string;
  note: string;
  last?: boolean;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <p className="ml-7 mt-0.5 text-[10px] text-[#141220]/40">{note}</p>
      {!last && <Divider />}
    </>
  );
}

export function AlertRow({
  code,
  name,
  tag,
  tone,
  last = false,
}: {
  code: "S" | "P" | "L" | "O";
  name: string;
  tag: string;
  tone: "warn" | "ko";
  last?: boolean;
}) {
  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          <Nature code={code} />
          {name}
        </span>
        <Tag tone={tone}>{tag}</Tag>
      </div>
      {!last && <Divider />}
    </>
  );
}

export function ProductSelector({
  name,
  position,
  dark = false,
  className = "",
  onPrev,
  onNext,
}: {
  name: string;
  position: string;
  dark?: boolean;
  className?: string;
  /** Optionnels : sans eux les flèches restent décoratives (comportement historique). */
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-1.5 py-1 ${
        dark ? "border-white/20 bg-white/10" : "border-brand-pink/30 bg-brand-pink/5"
      } ${className}`}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!onPrev}
        aria-label="Produit précédent"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-white text-[#141220]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 text-center leading-tight">
        <span className={`block truncate text-[10px] font-semibold ${dark ? "text-white" : ""}`}>{name}</span>
        <span className={`block text-[8px] ${dark ? "text-white/50" : "text-[#141220]/40"}`}>{position}</span>
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        aria-label="Produit suivant"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:opacity-100 ${dark ? "bg-white/15 text-white" : "bg-white text-[#141220]/60"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
          <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function Table({
  head,
  rows,
  className = "",
  sourceCol,
}: {
  head: string[];
  rows: string[][];
  className?: string;
  sourceCol?: number;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[560px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#141220]/10">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#141220]/35">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#141220]/[0.05] last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3">
                  {j === 0 ? (
                    <span className="font-semibold">{cell}</span>
                  ) : sourceCol === j ? (
                    <Nature code={cell as "S" | "P" | "L" | "O"} />
                  ) : (
                    <span className={cell === "Rupture" || cell === "1 j" ? "text-brand-pink" : ""}>{cell}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
